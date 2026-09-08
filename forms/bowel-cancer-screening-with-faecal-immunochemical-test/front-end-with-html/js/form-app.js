import { detectFlaggedIssues } from './flags.js';
import { gradeFit } from './grader.js';
import { emptyAssessment, managementActionLabel, priorityLabel, resultClassClass, resultClassLabel } from './types.js';

// Bowel Cancer Screening (FIT) — single-page wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// result readout updates as the kit outcome and faecal haemoglobin are entered.
// Submission runs the pure classification engine (result class, management
// action, symptomatic pathway, flagged issues) and renders an inline report.
// State is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'bowel-cancer-screening-with-faecal-immunochemical-test.front-end-with-html.v1';

/** @returns {import('./types.js').AssessmentData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  // Merge over a fresh empty so any newly-added fields default correctly.
  const fresh = emptyAssessment();

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
    if (!raw) return emptyAssessment();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved assessment; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save assessment to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored assessment.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

/** @type {import('./types.js').AssessmentData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'bowel-cancer-screening-with-faecal-immunochemical-test',
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
    refreshLiveResult();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 7;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-result readout after each change.
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
  refreshLiveResult();
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

/** Format a faecal-haemoglobin number for display, or a dash when null. */
function fmtHb(n) {
  return (n === null || n === undefined) ? '—' : `${n} µg Hb/g`;
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

/**
 * Wrap one or more field elements in a `[data-conditional]` host so they show
 * only when `section.field` equals `target`.
 */
function conditionalGroup(expr, children) {
  const host = document.createElement('div');
  host.setAttribute('data-conditional', expr);
  for (const child of children) host.appendChild(child);
  return host;
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
// Section renderers (1 per wizard step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who reviewed the FIT result, when, and at which screening hub.'
  });

  card.appendChild(textInput({
    label: 'Reviewing clinician / administrator name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. J. Okafor'
  }));
  card.appendChild(selectInput({
    label: 'Role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'screening-administrator', label: 'Screening administrator' },
      { value: 'screening-practitioner', label: 'Screening practitioner' },
      { value: 'gp', label: 'GP' },
      { value: 'ssp', label: 'Specialist screening practitioner (SSP)' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of review',
    section: 'context', field: 'reviewedAt', type: 'datetime-local'
  }));
  card.appendChild(textInput({
    label: 'Screening hub / centre',
    section: 'context', field: 'screeningHub',
    placeholder: 'e.g. Southern Hub'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Participant identification',
    description: 'Local identifier, NHS number, age, and sex.'
  });

  card.appendChild(textInput({
    label: 'Participant identifier',
    section: 'identification', field: 'participantIdentifier', required: true,
    placeholder: 'e.g. BCSP-100482 or screening episode ID'
  }));
  card.appendChild(textInput({
    label: 'NHS number',
    section: 'identification', field: 'nhsNumber',
    placeholder: 'e.g. 943 476 5919'
  }));
  card.appendChild(textInput({
    label: 'Participant age',
    section: 'identification', field: 'participantAge',
    type: 'number', min: 0, max: 120, step: 1, unit: 'years',
    hint: 'The programme age range is approximately 50–74 (phased rollout from 60).'
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'identification', field: 'sex',
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'intersex', label: 'Intersex' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Eligibility and invitation',
    description: 'Eligibility against the programme age range, the recall interval, and the previous outcome.'
  });

  card.appendChild(selectInput({
    label: 'Within screening age range',
    section: 'eligibility', field: 'withinAgeRange', required: true,
    options: [
      { value: 'eligible', label: 'Eligible (within age range)' },
      { value: 'over-age-self-request', label: 'Over age — self-request' },
      { value: 'not-eligible', label: 'Not eligible' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Recall interval',
    section: 'eligibility', field: 'recallInterval',
    options: [
      { value: 'two-yearly', label: 'Two-yearly (routine)' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Invitation / kit sent date',
    section: 'eligibility', field: 'invitationDate', type: 'date'
  }));
  card.appendChild(selectInput({
    label: 'Previous screening outcome',
    section: 'eligibility', field: 'previousOutcome',
    options: [
      { value: 'first-invitation', label: 'First invitation' },
      { value: 'prior-negative', label: 'Prior negative' },
      { value: 'prior-positive', label: 'Prior positive' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Kit return and adequacy',
    description: 'Whether the kit was returned and, if so, whether the sample was adequate. A non-return or an inadequate sample requires a repeat kit.'
  });

  card.appendChild(radioGroup({
    label: 'Was the FIT kit returned?',
    section: 'kit', field: 'kitReturned', required: true, options: yesNo
  }));

  card.appendChild(conditionalGroup('kit.kitReturned=yes', [
    textInput({
      label: 'Return date (sample received)',
      section: 'kit', field: 'returnDate', type: 'date'
    }),
    selectInput({
      label: 'Sample adequacy',
      section: 'kit', field: 'sampleAdequacy',
      options: [
        { value: 'adequate', label: 'Adequate' },
        { value: 'spoilt', label: 'Spoilt' },
        { value: 'insufficient', label: 'Insufficient' },
        { value: 'expired', label: 'Expired' }
      ],
      hint: 'Anything other than adequate classifies as spoilt and is repeated.'
    }),
    selectInput({
      label: 'Spoilt reason (if inadequate)',
      section: 'kit', field: 'spoiltReason',
      options: [
        { value: 'leaked', label: 'Leaked' },
        { value: 'undated', label: 'Undated' },
        { value: 'unlabelled', label: 'Unlabelled' },
        { value: 'too-old', label: 'Too old' },
        { value: 'damaged', label: 'Damaged' }
      ]
    })
  ]));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'FIT result',
    description: 'The measured faecal haemoglobin concentration and the programme threshold applied.'
  });

  card.appendChild(textInput({
    label: 'Faecal haemoglobin concentration',
    section: 'result', field: 'faecalHaemoglobinUgG',
    type: 'number', min: 0, max: 1000, step: 0.1, unit: 'µg Hb/g',
    hint: 'Micrograms of haemoglobin per gram of faeces (µg Hb/g). Leave blank if the kit was not returned or the sample was inadequate.'
  }));
  card.appendChild(textInput({
    label: 'Assay / analyser',
    section: 'result', field: 'assay',
    placeholder: 'e.g. OC-Sensor / HM-JACKarc'
  }));
  card.appendChild(textInput({
    label: 'Programme threshold applied',
    section: 'result', field: 'thresholdApplied',
    type: 'number', min: 0, max: 1000, step: 1, unit: 'µg Hb/g',
    hint: 'At or above this value the result is positive. Defaults to 120 (screening); 10 gives the NICE DG56 symptomatic threshold.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Live result',
    id: 'result-preview-readout',
    render: () => renderLiveResult()
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Symptoms',
    description: 'Whether the participant reports red-flag symptoms. A symptomatic participant is routed to the urgent suspected-cancer pathway regardless of the FIT result.'
  });

  card.appendChild(radioGroup({
    label: 'Reported red-flag symptoms? (bleeding, weight loss, change in bowel habit, anaemia)',
    section: 'symptoms', field: 'redFlagSymptoms', required: true, options: yesNo
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Summary and outcome',
    description: 'Live result class, management action, and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Result class and management action',
    id: 'live-result-readout',
    render: () => renderLiveResult()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: counselling given, onward referral arranged, and any escalation already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the live result class, management action, and symptomatic pathway. */
function renderLiveResult() {
  const grade = gradeFit(state);
  const badge = grade.resultClass === ''
    ? `<span class="muted">${esc(resultClassLabel(''))}</span>`
    : `<span class="risk-badge ${resultClassClass(grade.resultClass)}">${esc(resultClassLabel(grade.resultClass))}</span>`;
  const management = grade.managementAction === ''
    ? ''
    : ` <span class="muted">→ ${esc(managementActionLabel(grade.managementAction))}</span>`;
  const symptomatic = grade.symptomaticPathway
    ? ` <span class="risk-badge risk-high">Symptomatic — urgent suspected-cancer pathway</span>`
    : '';
  return `${badge}${management}${symptomatic}`;
}

function refreshLiveResult() {
  const preview = document.getElementById('result-preview-readout');
  if (preview) preview.innerHTML = renderLiveResult();
  const live = document.getElementById('live-result-readout');
  if (live) live.innerHTML = renderLiveResult();
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
  context: [['clinicianName'], ['clinicianRole'], ['screeningHub']],
  identification: [['participantIdentifier'], ['participantAge'], ['sex']],
  eligibility: [['withinAgeRange'], ['recallInterval'], ['previousOutcome']],
  kit: [['kitReturned'], ['sampleAdequacy']],
  result: [['faecalHaemoglobinUgG'], ['thresholdApplied']],
  symptoms: [['redFlagSymptoms']],
  note: [['clinicalNote']]
};

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  let total = 0;
  const sectionAnswered = {};
  const sectionTotal = {};

  for (const section of Object.keys(STEP_SLOTS)) {
    const slots = STEP_SLOTS[section];
    sectionTotal[section] = slots.length;
    sectionAnswered[section] = 0;
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
    resultClass, managementAction, symptomaticPathway, status,
    flaggedIssues, timestamp
  } = lastResult;

  const faecalHb = state.result.faecalHaemoglobinUgG;
  const threshold = state.result.thresholdApplied;
  const kitReturned = state.kit.kitReturned;
  const sampleAdequacy = state.kit.sampleAdequacy;
  const redFlagSymptoms = state.symptoms.redFlagSymptoms;

  const inputRows = [
    ['Kit returned', kitReturned === '' ? 'Not recorded' : (kitReturned === 'yes' ? 'Yes' : 'No')],
    ['Sample adequacy', sampleAdequacy === '' ? 'Not recorded' : sampleAdequacy],
    ['Faecal haemoglobin', faecalHb === null || faecalHb === undefined ? 'Not recorded' : `${faecalHb} µg Hb/g`],
    ['Programme threshold', threshold === null || threshold === undefined ? 'Not recorded' : `${threshold} µg Hb/g`],
    ['Red-flag symptoms', redFlagSymptoms === '' ? 'Not recorded' : (redFlagSymptoms === 'yes' ? 'Yes' : 'No')],
    ['Result class', resultClassLabel(resultClass)],
    ['Management action', managementActionLabel(managementAction)],
    ['Completeness', status === '' ? 'Not determined' : status]
  ].map(([name, value]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
    </tr>
  `).join('');

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No red-flag issues raised.</p>`
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

  let interpretation;
  switch (resultClass) {
    case 'positive':
      interpretation = `<p>The faecal haemoglobin is <strong>at or above the programme threshold</strong> (positive screen). Refer for colonoscopy via the screening pathway and inform the participant of the result.</p>`;
      break;
    case 'negative':
      interpretation = `<p>The faecal haemoglobin is <strong>below the programme threshold</strong> (negative screen). Return the participant to routine two-yearly recall. A negative screen does not exclude cancer in a symptomatic person.</p>`;
      break;
    case 'spoilt':
      interpretation = `<p>The sample was <strong>inadequate (spoilt / insufficient / expired)</strong> — no valid result. Reissue a FIT kit and repeat the test.</p>`;
      break;
    default:
      interpretation = kitReturned === 'no'
        ? `<p>The kit was <strong>not returned</strong> — there is no sample to classify. Send a reminder and reissue the kit.</p>`
        : `<p>The result could not be classified because the faecal haemoglobin value is missing. Obtain the assay value, then re-calculate.</p>`;
  }

  const symptomaticBanner = symptomaticPathway
    ? `<div class="risk-banner risk-high">
        <div>
          <span class="risk-banner-label">Symptomatic pathway</span>
          <span class="risk-banner-value">Urgent suspected-cancer referral</span>
        </div>
        <span class="risk-badge risk-high">Red-flag symptoms</span>
      </div>`
    : '';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Bowel Cancer Screening (FIT) Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${resultClassClass(resultClass)}">
        <div>
          <span class="risk-banner-label">Result class</span>
          <span class="risk-banner-value">${esc(resultClassLabel(resultClass))}</span>
        </div>
        <span class="risk-badge ${resultClassClass(resultClass)}">${esc(managementActionLabel(managementAction))}</span>
      </div>

      ${symptomaticBanner}

      <h3>Result summary</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>${inputRows}</tbody>
      </table>

      <h3>Interpretation</h3>
      ${interpretation}

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
  const grade = gradeFit(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    resultClass: grade.resultClass,
    managementAction: grade.managementAction,
    symptomaticPathway: grade.symptomaticPathway,
    status: grade.status,
    firedRules: grade.firedRules,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh assessment?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveResult();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'identification', title: 'Participant' },
  { step: 3, section: 'eligibility',    title: 'Eligibility' },
  { step: 4, section: 'kit',            title: 'Kit return' },
  { step: 5, section: 'result',         title: 'FIT result' },
  { step: 6, section: 'symptoms',       title: 'Symptoms' },
  { step: 7, section: 'note',           title: 'Outcome' }
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
    // Skip fields inside a hidden conditional group.
    const hiddenHost = input.closest('[data-conditional]');
    if (hiddenHost && hiddenHost.style.display === 'none') return;
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveResult();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
