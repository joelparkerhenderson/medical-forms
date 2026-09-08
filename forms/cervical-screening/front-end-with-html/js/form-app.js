import { detectFlaggedIssues } from './flags.js';
import { calculateGrade } from './grader.js';
import { emptyScreening, managementActionLabel, priorityLabel, resultClassClass, resultClassLabel, statusLabel } from './types.js';

// Cervical Screening record — single-page wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// result classification updates as the record is filled. Submission runs the
// pure classification engine (result class, management action, completeness
// status, fired rules, safety flags) and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'cervical-screening.front-end-with-html.v1';

/** @returns {import('./types.js').ScreeningData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  // Merge over a fresh empty so any newly-added fields default correctly.
  const fresh = emptyScreening();

  for (const key of Object.keys(fresh)) {
    if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null) {
      fresh[key] = { ...fresh[key], ...parsed[key] };
    }
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyScreening();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved screening; starting fresh.', e);
    return emptyScreening();
  }
}

/** @param {import('./types.js').ScreeningData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save screening to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored screening.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

// Captured before loadState() reads it, so js/restore-banner.js can tell
// "a previous draft was restored" apart from "this is a blank first visit"
// without needing to know the STORAGE_KEY itself (its exact naming isn't
// uniform fleet-wide -- some forms still carry the pre-consolidation
// `.front-end-form-with-html.v1` suffix).
let hadDraftAtLoad = false;
try {
  hadDraftAtLoad = localStorage.getItem(STORAGE_KEY) !== null;
} catch (e) {
  // Ignore; loadState() below will hit the same failure and fall back safely.
}

/** @type {import('./types.js').ScreeningData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'cervical-screening',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const _rep = document.getElementById('report');
    if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    updateConditionalSections();
    refreshLiveOutcome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 9;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-classification readout after each change.
 *
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshLiveOutcome();
}

/** Escape user-entered text for safe rendering. */
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ----------------------------------------------------------------------
// Component builders
// ----------------------------------------------------------------------

/** Map an <input type=…> to its Lily class name. */
function lilyInputClass(type) {
  switch (type) {
    case 'email':          return 'email-input';
    case 'number':         return 'number-input';
    case 'date':           return 'date-input';
    case 'datetime-local': return 'date-input';
    case 'time':           return 'time-input';
    case 'tel':            return 'tel-input';
    case 'url':            return 'url-input';
    case 'search':         return 'search-input';
    default:               return 'text-input';
  }
}

function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const labelText = esc(opts.label);
  const type = opts.type || 'text';
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${lilyInputClass(type)}"`,
    `value="${esc(value ?? '')}"`,
    `aria-describedby="${id}-error"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <input ${attrs.join(' ')}>
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    let v = input.value;
    if (type === 'number') {
      v = v === '' ? null : Number(v);
    }
    setField(opts.section, opts.field, v);
    clearFieldError(id);
  });
  return wrapper;
}

function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      aria-describedby="${id}-error"
      class="text-area-input">${esc(value)}</textarea>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => {
    setField(opts.section, opts.field, ta.value);
    clearFieldError(id);
  });
  return wrapper;
}

function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const labelText = esc(opts.label);

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${opts.required ? ' required data-required' : ''}>
      ${optionsHtml}
    </select>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => {
    setField(opts.section, opts.field, sel.value);
    clearFieldError(id);
  });
  return wrapper;
}

function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field radio-fieldset';
  wrapper.id = `${groupId}-fieldset`;
  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  if (opts.required) legend.setAttribute('data-required', '');
  wrapper.appendChild(legend);
  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', `${groupId}-fieldset`);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    const requiredAttr = opts.required ? ' data-required' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}${requiredAttr}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        setField(opts.section, opts.field, option.value);
        clearFieldError(groupId);
      }
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);
  const err = document.createElement('span');
  err.className = 'error-message';
  err.id = `${groupId}-error`;
  err.setAttribute('aria-live', 'polite');
  wrapper.appendChild(err);
  return wrapper;
}

function readOnlyReadout(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field readout';
  wrapper.innerHTML = `
    <label class="label">${esc(opts.label)}</label>
    <div id="${opts.id}" class="readout-value">${opts.render()}</div>
  `;
  return wrapper;
}

/** Wrap a field/card so it only shows when `section.field == value`. */
function conditional(el, section, field, value) {
  el.setAttribute('data-conditional', `${section}.${field}=${value}`);
  return el;
}

function sectionCard(opts) {
  const card = document.createElement('fieldset');
  card.className = 'fieldset';
  card.dataset.step = String(opts.stepNumber);
  card.id = `step-${opts.stepNumber}`;
  const desc = opts.description
    ? `<span class="section-description">${esc(opts.description)}</span>`
    : '';
  const legend = document.createElement('legend');
  legend.className = 'fieldset-legend';
  legend.innerHTML =
    `<span class="section-step">Step ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Section renderers (1 per screening step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Encounter context',
    description: 'Who took the sample, in what role and setting, and when.'
  });

  card.appendChild(textInput({
    label: 'Sample-taker name',
    section: 'context', field: 'sampleTakerName', required: true,
    placeholder: 'e.g. Sister J. Okoro'
  }));
  card.appendChild(selectInput({
    label: 'Sample-taker role',
    section: 'context', field: 'sampleTakerRole', required: true,
    options: [
      { value: 'practice-nurse', label: 'Practice nurse' },
      { value: 'gp', label: 'GP' },
      { value: 'smear-taker', label: 'Trained smear-taker' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'careSetting', required: true,
    options: [
      { value: 'general-practice', label: 'General practice' },
      { value: 'sexual-health', label: 'Sexual & reproductive health service' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of sample',
    section: 'context', field: 'sampleTakenAt', type: 'datetime-local'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, NHS number, age, and date of birth. Age drives eligibility and the recall interval.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. GP-448120 or hospital MRN'
  }));
  card.appendChild(textInput({
    label: 'NHS number',
    section: 'identification', field: 'nhsNumber',
    placeholder: 'e.g. 943 476 5919'
  }));
  card.appendChild(textInput({
    label: 'Age',
    section: 'identification', field: 'age', required: true,
    type: 'number', min: 0, max: 120, step: 1, unit: 'years',
    hint: 'The routine programme covers ages 25-64.'
  }));
  card.appendChild(textInput({
    label: 'Date of birth',
    section: 'identification', field: 'dateOfBirth', type: 'date'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Eligibility',
    description: 'Recall interval, when the screen was due, whether it is overdue, and any formal cease.'
  });

  card.appendChild(selectInput({
    label: 'Recall interval',
    section: 'eligibility', field: 'recallInterval',
    hint: '3-yearly for ages 25-49; 5-yearly for ages 50-64.',
    options: [
      { value: 'three-yearly', label: '3-yearly (ages 25-49)' },
      { value: 'five-yearly', label: '5-yearly (ages 50-64)' },
      { value: 'not-applicable', label: 'Not applicable' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Screen-due date',
    section: 'eligibility', field: 'screenDueDate', type: 'date'
  }));
  card.appendChild(textInput({
    label: 'Date of most recent previous screen',
    section: 'eligibility', field: 'lastScreenDate', type: 'date'
  }));
  card.appendChild(radioGroup({
    label: 'Is the screen overdue?',
    section: 'eligibility', field: 'overdue', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Has the person been formally ceased from screening?',
    section: 'eligibility', field: 'previouslyCeased', options: yesNo
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Consent',
    description: 'A result must not be reported without recorded informed consent.'
  });

  card.appendChild(radioGroup({
    label: 'Informed consent given to take the sample and process the result?',
    section: 'consent', field: 'consentGiven', required: true, options: yesNo
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Symptoms',
    description: 'Symptoms are managed on their own pathway regardless of the screen result.'
  });

  card.appendChild(radioGroup({
    label: 'Any symptoms (abnormal bleeding, discharge, or pain)?',
    section: 'symptoms', field: 'symptomatic', options: yesNo
  }));
  card.appendChild(conditional(textArea({
    label: 'Symptom detail',
    section: 'symptoms', field: 'symptomDetail',
    placeholder: 'Describe the reported symptoms.'
  }), 'symptoms', 'symptomatic', 'yes'));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Sample adequacy',
    description: 'An inadequate sample cannot be tested and is repeated.'
  });

  card.appendChild(selectInput({
    label: 'Liquid-based cytology sample adequacy',
    section: 'adequacy', field: 'sampleAdequacy', required: true,
    options: [
      { value: 'adequate', label: 'Adequate' },
      { value: 'inadequate', label: 'Inadequate / unsatisfactory' }
    ]
  }));
  card.appendChild(conditional(selectInput({
    label: 'Reason inadequate',
    section: 'adequacy', field: 'inadequateReason',
    options: [
      { value: 'insufficient-cells', label: 'Insufficient cells' },
      { value: 'obscuring-blood', label: 'Obscuring blood' },
      { value: 'inflammation', label: 'Obscuring inflammation' },
      { value: 'labelling', label: 'Incorrectly labelled' },
      { value: 'other', label: 'Other' }
    ]
  }), 'adequacy', 'sampleAdequacy', 'inadequate'));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Primary hrHPV result',
    description: 'Every adequate sample is tested for high-risk HPV first.'
  });

  card.appendChild(selectInput({
    label: 'High-risk HPV (hrHPV) result',
    section: 'hpv', field: 'hpvResult',
    hint: 'Reflex cytology is performed only when this is positive.',
    options: [
      { value: 'negative', label: 'Negative (not detected)' },
      { value: 'positive', label: 'Positive (detected)' },
      { value: 'not-tested', label: 'Not tested' }
    ]
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Reflex cytology',
    description: 'Performed only on HPV-positive samples; graded for dyskaryosis.'
  });

  card.appendChild(selectInput({
    label: 'Reflex cytology grade',
    section: 'cytology', field: 'cytologyGrade',
    options: [
      { value: 'negative', label: 'Negative (normal)' },
      { value: 'borderline', label: 'Borderline changes' },
      { value: 'low-grade', label: 'Low-grade dyskaryosis' },
      { value: 'high-grade', label: 'High-grade dyskaryosis / ?glandular / ?invasive' },
      { value: 'not-performed', label: 'Not performed' }
    ]
  }));

  // Only shown when hrHPV is positive.
  return conditional(card, 'hpv', 'hpvResult', 'positive');
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Summary and outcome',
    description: 'Live result classification and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live result classification',
    id: 'live-outcome-readout',
    render: () => renderLiveOutcome()
  }));

  card.appendChild(textArea({
    label: 'Clinical context note',
    section: 'note', field: 'clinicalContext',
    placeholder: 'Free-text clinical context: history, decisions, and any action already taken.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the live result-class badge + management action. */
function renderLiveOutcome() {
  const grade = calculateGrade(state);
  const badge =
    `<span class="risk-badge ${resultClassClass(grade.resultClass)}">${esc(resultClassLabel(grade.resultClass))}</span>`;
  const mgmt = grade.managementAction
    ? `<span class="muted"> — ${esc(managementActionLabel(grade.managementAction))}</span>`
    : '';
  return `${badge}${mgmt} <span class="muted">(${esc(statusLabel(grade.status))})</span>`;
}

function refreshLiveOutcome() {
  const live = document.getElementById('live-outcome-readout');
  if (live) live.innerHTML = renderLiveOutcome();
}

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = state[section]?.[field];
    host.style.display = String(current) === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered.
const STEP_SLOTS = {
  context: [['sampleTakerName'], ['sampleTakerRole'], ['careSetting']],
  identification: [['patientIdentifier'], ['age']],
  eligibility: [['recallInterval'], ['overdue'], ['previouslyCeased']],
  consent: [['consentGiven']],
  symptoms: [['symptomatic']],
  adequacy: [['sampleAdequacy']],
  hpv: [['hpvResult']],
  cytology: [['cytologyGrade']],
  note: [['clinicalContext']]
};

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '';
}

// The cytology slot only counts toward progress when hrHPV is positive; a
// negative / inadequate record has no reflex cytology to record.
function slotApplies(section) {
  if (section === 'cytology') return state.hpv.hpvResult === 'positive';
  return true;
}

function updateProgress() {
  let answered = 0;
  let total = 0;
  const sectionAnswered = {};
  const sectionTotal = {};

  for (const section of Object.keys(STEP_SLOTS)) {
    const applies = slotApplies(section);
    const slots = STEP_SLOTS[section];
    sectionTotal[section] = applies ? slots.length : 0;
    sectionAnswered[section] = 0;
    if (!applies) continue;
    for (const slot of slots) {
      total++;
      const slotAnswered = slot.some((field) => isAnswered(section, field));
      if (slotAnswered) {
        answered++;
        sectionAnswered[section]++;
      }
    }
  }

  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Submit / Report
// ----------------------------------------------------------------------

function priorityClass(priority) {
  switch (priority) {
    case 'high': return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    resultClass, managementAction, status,
    firedRules, flaggedIssues, timestamp
  } = lastResult;

  const ruleRows = firedRules.length === 0
    ? `<tr><td colspan="2" class="muted">No classification rule fired.</td></tr>`
    : firedRules.map((r) => `
      <tr>
        <th scope="row">${esc(r.id)}</th>
        <td>${esc(r.description)}</td>
      </tr>
    `).join('');

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No safety flags raised.</p>`
    : `
      <ul class="flags">
        ${flaggedIssues.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority))}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}${f.suggestedAction ? ` — ${esc(f.suggestedAction)}` : ''}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const managementNote =
    managementAction === 'urgent-colposcopy-referral'
      ? `<p>This result requires an <strong>urgent colposcopy referral</strong>. Refer on the suspected-cancer / two-week-wait pathway per local policy.</p>`
      : managementAction === 'colposcopy-referral'
      ? `<p>This result requires a <strong>routine colposcopy referral</strong>. Refer per local pathway.</p>`
      : managementAction === 'early-repeat-12-months'
      ? `<p>hrHPV positive with normal cytology: <strong>early repeat HPV test at 12 months</strong>. No colposcopy at this stage.</p>`
      : managementAction === 'routine-recall'
      ? `<p>hrHPV negative: <strong>return to routine recall</strong> at the age-appropriate interval. A negative screen does not exclude cancer in a symptomatic person.</p>`
      : managementAction === 'repeat-sample-3-months'
      ? `<p>Inadequate sample: <strong>repeat in ~3 months</strong>. Three consecutive inadequate samples escalate to colposcopy.</p>`
      : managementAction === 'cease-screening'
      ? `<p>The person is outside the routine programme or has ceased: <strong>cease screening; no recall</strong>.</p>`
      : `<p>The record is not yet classifiable — <strong>${esc(managementActionLabel(managementAction))}</strong>. Complete the outstanding fields.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Cervical Screening Result</h2>
        <p class="muted">Patient: ${esc(state.identification.patientIdentifier || state.identification.nhsNumber || 'Unidentified')} · Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${resultClassClass(resultClass)}">
        <div>
          <span class="risk-banner-label">Result classification</span>
          <span class="risk-banner-value">${esc(resultClassLabel(resultClass))}</span>
        </div>
        <span class="risk-badge ${resultClassClass(resultClass)}">${esc(statusLabel(status))}</span>
      </div>

      <h3>Management outcome</h3>
      <p class="readout-value"><strong>${esc(managementActionLabel(managementAction))}</strong></p>
      ${managementNote}

      <h3>Classification rules</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Rule</th>
            <th scope="col">Basis</th>
          </tr>
        </thead>
        <tbody>${ruleRows}</tbody>
      </table>

      <h3>Flagged issues (${flaggedIssues.length})</h3>
      ${flagsList}

      <div class="report-actions">
        <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
      </div>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
}

function submitForm() {
  const _errors = validateForm();
  if (_errors.length > 0) return;
  const grade = calculateGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    resultClass: grade.resultClass,
    managementAction: grade.managementAction,
    status: grade.status,
    firedRules: grade.firedRules,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh screening record?')) return;
  clearState();
  state = emptyScreening();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveOutcome();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'identification', title: 'Patient' },
  { step: 3, section: 'eligibility',    title: 'Eligibility' },
  { step: 4, section: 'consent',        title: 'Consent' },
  { step: 5, section: 'symptoms',       title: 'Symptoms' },
  { step: 6, section: 'adequacy',       title: 'Adequacy' },
  { step: 7, section: 'hpv',            title: 'hrHPV' },
  { step: 8, section: 'cytology',       title: 'Cytology' },
  { step: 9, section: 'note',           title: 'Summary' }
];

function renderStepList() {
  const ol = document.getElementById('step-list');
  if (!ol) return;
  ol.innerHTML = '';
  for (const def of STEP_DEFINITIONS) {
    const li = document.createElement('li');
    li.className = 'step-list-item';
    li.dataset.status = 'waiting';
    li.dataset.step = String(def.step);
    li.setAttribute('aria-label', `Step ${def.step}: ${def.title}`);
    li.innerHTML = `<span>${esc(def.title)}</span>`;
    li.addEventListener('click', () => {
      const target = document.getElementById(`step-${def.step}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    ol.appendChild(li);
  }
}

function updateStepListStatuses(sectionAnswered, sectionTotal) {
  const ol = document.getElementById('step-list');
  if (!ol) return;
  let firstUnfinished = -1;
  for (const def of STEP_DEFINITIONS) {
    const li = ol.querySelector(`[data-step="${def.step}"]`);
    if (!li) continue;
    const a = sectionAnswered[def.section] || 0;
    const t = sectionTotal[def.section] || 0;
    // The cytology step is not applicable unless hrHPV is positive.
    if (def.section === 'cytology' && state.hpv.hpvResult !== 'positive') {
      li.dataset.status = 'waiting';
      li.removeAttribute('aria-current');
      continue;
    }
    if (t > 0 && a === t) {
      li.dataset.status = 'finished';
      li.removeAttribute('aria-current');
    } else if (a > 0) {
      li.dataset.status = 'in-progress';
      if (firstUnfinished === -1) firstUnfinished = def.step;
    } else {
      li.dataset.status = 'waiting';
      li.removeAttribute('aria-current');
    }
  }
  if (firstUnfinished === -1) firstUnfinished = STEP_DEFINITIONS[0].step;
  const current = ol.querySelector(`[data-step="${firstUnfinished}"]`);
  if (current) {
    current.setAttribute('aria-current', 'step');
    if (current.dataset.status === 'waiting') {
      current.dataset.status = 'in-progress';
    }
  }
  ol.dataset.current = String(firstUnfinished - 1);
}

// ----------------------------------------------------------------------
// Validation (per-field + error summary)
// ----------------------------------------------------------------------

function clearFieldError(id) {
  const el = document.getElementById(`${id}-error`);
  if (el) el.textContent = '';
  const input = document.getElementById(id);
  if (input) input.removeAttribute('aria-invalid');
  const fs = document.getElementById(`${id}-fieldset`);
  if (fs) fs.removeAttribute('aria-invalid');
}

function setFieldError(id, message) {
  const el = document.getElementById(`${id}-error`);
  if (el) el.textContent = message;
  const input = document.getElementById(id);
  if (input) input.setAttribute('aria-invalid', 'true');
}

function validateForm() {
  const errors = [];
  const form = document.getElementById('assessment-form');
  if (!form) return errors;
  const required = form.querySelectorAll('input[data-required], select[data-required], textarea[data-required]');
  const seen = new Set();
  required.forEach((input) => {
    // Skip fields inside a hidden conditional block.
    if (input.closest('[data-conditional]') &&
        input.closest('[data-conditional]').style.display === 'none') {
      return;
    }
    let id = input.id;
    if (input.type === 'radio') id = input.name;
    if (seen.has(id)) return;
    seen.add(id);
    let value = '';
    if (input.type === 'radio') {
      const chosen = form.querySelector(`input[name="${id}"]:checked`);
      value = chosen ? chosen.value : '';
    } else {
      value = (input.value || '').trim();
    }
    if (!value) {
      const fs = document.getElementById(`${id}-fieldset`);
      const labelEl = form.querySelector(`label[for="${id}"]`);
      const label = (fs ? fs.querySelector('legend') : labelEl);
      const labelText = label
        ? label.textContent.replace(/\s*\*\s*$/, '').trim()
        : id;
      errors.push({ id, message: `${labelText} is required` });
      setFieldError(id, `${labelText} is required`);
    } else {
      clearFieldError(id);
    }
  });
  renderErrorSummary(errors);
  return errors;
}

function renderErrorSummary(errors) {
  const summary = document.getElementById('error-summary');
  if (!summary) return;
  if (errors.length === 0) {
    summary.hidden = true;
    summary.innerHTML = '';
    return;
  }
  summary.hidden = false;
  summary.innerHTML =
    '<strong>Please correct the following:</strong>' +
    '<ul>' +
    errors.map((e) =>
      `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`
    ).join('') +
    '</ul>';
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (typeof summary.focus === 'function') {
    summary.setAttribute('tabindex', '-1');
    summary.focus({ preventScroll: true });
  }
}

// ----------------------------------------------------------------------
// Bootstrap
// ----------------------------------------------------------------------

function renderForm() {
  const host = document.getElementById('form-sections');
  host.innerHTML = '';
  host.appendChild(renderStep1());
  host.appendChild(renderStep2());
  host.appendChild(renderStep3());
  host.appendChild(renderStep4());
  host.appendChild(renderStep5());
  host.appendChild(renderStep6());
  host.appendChild(renderStep7());
  host.appendChild(renderStep8());
  host.appendChild(renderStep9());
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveOutcome();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
