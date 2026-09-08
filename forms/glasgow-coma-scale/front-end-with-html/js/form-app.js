import { detectFlaggedIssues } from './flags.js';
import { calculateGcsGrade } from './grader.js';
import { descriptorLabel, eyeOptions, motorOptions, verbalOptions } from './rules.js';
import { emptyAssessment, priorityLabel, reactivityLabel, severityBandClass, severityBandLabel } from './types.js';

// Glasgow Coma Scale (GCS) — bedside wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered, and live
// readouts update the E/V/M scores, the total, the severity band, and the
// GCS-Pupils score as the components are entered. Submission runs the pure
// scoring engine (component scores, total 3-15 with NT handling, band, PRS,
// GCS-P, fired rules, flagged issues) and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'glasgow-coma-scale.front-end-with-html.v1';

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
  slug: 'glasgow-coma-scale',
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
    refreshLiveReadouts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 8;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live readouts after each change.
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
  refreshLiveReadouts();
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
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
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
 * Wrap a child field in a host that is shown only when a state predicate holds.
 * `expr` is "section.field=value" — matched by updateConditionalSections().
 */
function conditionalHost(expr, childEl) {
  const host = document.createElement('div');
  host.setAttribute('data-conditional', expr);
  host.appendChild(childEl);
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
// Section renderers (1 per GCS step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const reactivityOptions = [
  { value: 'reactive', label: 'Reactive' },
  { value: 'sluggish', label: 'Sluggish' },
  { value: 'unreactive', label: 'Unreactive' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, where, and the reason for the assessment.'
  });

  card.appendChild(textInput({
    label: 'Assessing observer name',
    section: 'context', field: 'assessorName', required: true,
    placeholder: 'e.g. Dr A. Khan'
  }));
  card.appendChild(selectInput({
    label: 'Observer role',
    section: 'context', field: 'assessorRole', required: true,
    options: [
      { value: 'doctor', label: 'Doctor' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'paramedic', label: 'Paramedic' },
      { value: 'emergency-medical-technician', label: 'Emergency medical technician' },
      { value: 'advanced-clinical-practitioner', label: 'Advanced clinical practitioner' },
      { value: 'neuro-observation-staff', label: 'Neuro-observation staff' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of assessment',
    section: 'context', field: 'assessedAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'setting',
    options: [
      { value: 'ed', label: 'Emergency department' },
      { value: 'neuro', label: 'Neuro / neurosurgical unit' },
      { value: 'critical-care', label: 'Critical care / HDU' },
      { value: 'pre-hospital', label: 'Pre-hospital / ambulance' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Reason for assessment',
    section: 'context', field: 'reason', rows: 2,
    placeholder: 'e.g. Head injury, stroke, reduced consciousness, post-ictal'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Confounders',
    description: 'Factors that may force a component to "not testable" (NT). Record them here so the reason for any NT is documented.'
  });

  card.appendChild(radioGroup({
    label: 'Intubated or tracheostomy? (may force verbal to NT)',
    section: 'confounders', field: 'intubated', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Sedated?',
    section: 'confounders', field: 'sedated', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Neuromuscular blockade / paralysed? (may force motor to NT)',
    section: 'confounders', field: 'paralysed', options: yesNo
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Eye opening (E)',
    description: 'Best eye-opening response, scored 1-4, or NT when a local factor prevents testing.'
  });

  card.appendChild(selectInput({
    label: 'Best eye-opening response',
    section: 'eye', field: 'eyeResponse', required: true,
    options: eyeOptions
  }));
  card.appendChild(conditionalHost('eye.eyeResponse=NT', textArea({
    label: 'Reason the eye component is not testable',
    section: 'eye', field: 'eyeNotTestableReason', rows: 2,
    placeholder: 'e.g. Periorbital swelling, dressings'
  })));
  card.appendChild(readOnlyReadout({
    label: 'Eye score (E)',
    id: 'eye-score-readout',
    render: () => renderComponentReadout('eye')
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Verbal response (V)',
    description: 'Best verbal response, scored 1-5, or NT when a local factor prevents testing.'
  });

  card.appendChild(selectInput({
    label: 'Best verbal response',
    section: 'verbal', field: 'verbalResponse', required: true,
    options: verbalOptions
  }));
  card.appendChild(conditionalHost('verbal.verbalResponse=NT', textArea({
    label: 'Reason the verbal component is not testable',
    section: 'verbal', field: 'verbalNotTestableReason', rows: 2,
    placeholder: 'e.g. Intubation, tracheostomy, language barrier'
  })));
  card.appendChild(readOnlyReadout({
    label: 'Verbal score (V)',
    id: 'verbal-score-readout',
    render: () => renderComponentReadout('verbal')
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Motor response (M)',
    description: 'Best motor response, scored 1-6, or NT. A falling motor score is the most sensitive early sign of deterioration.'
  });

  card.appendChild(selectInput({
    label: 'Best motor response',
    section: 'motor', field: 'motorResponse', required: true,
    options: motorOptions
  }));
  card.appendChild(conditionalHost('motor.motorResponse=NT', textArea({
    label: 'Reason the motor component is not testable',
    section: 'motor', field: 'motorNotTestableReason', rows: 2,
    placeholder: 'e.g. Neuromuscular blockade, spinal injury, limb immobilisation'
  })));
  card.appendChild(readOnlyReadout({
    label: 'Motor score (M)',
    id: 'motor-score-readout',
    render: () => renderComponentReadout('motor')
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Pupils',
    description: 'Left and right pupil reactivity and size, for the secondary GCS-Pupils (GCS-P) score.'
  });

  card.appendChild(selectInput({
    label: 'Left pupil reactivity',
    section: 'pupils', field: 'leftPupilReactivity',
    options: reactivityOptions
  }));
  card.appendChild(selectInput({
    label: 'Right pupil reactivity',
    section: 'pupils', field: 'rightPupilReactivity',
    options: reactivityOptions
  }));
  card.appendChild(textInput({
    label: 'Left pupil size',
    section: 'pupils', field: 'leftPupilSizeMm',
    type: 'number', min: 1, max: 9, step: 0.5, unit: 'mm'
  }));
  card.appendChild(textInput({
    label: 'Right pupil size',
    section: 'pupils', field: 'rightPupilSizeMm',
    type: 'number', min: 1, max: 9, step: 0.5, unit: 'mm'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Pupil Reactivity Score (PRS)',
    id: 'prs-readout',
    render: () => renderPrsReadout()
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Trend',
    description: 'Previous total and motor score, to detect deterioration since the last assessment.'
  });

  card.appendChild(textInput({
    label: 'Previous total GCS',
    section: 'trend', field: 'previousTotal',
    type: 'number', min: 3, max: 15, step: 1,
    hint: 'Total GCS at the previous assessment (3-15). Leave blank if none.'
  }));
  card.appendChild(textInput({
    label: 'Previous motor score',
    section: 'trend', field: 'previousMotorScore',
    type: 'number', min: 1, max: 6, step: 1,
    hint: 'Motor component (1-6) at the previous assessment. Leave blank if none.'
  }));
  card.appendChild(textInput({
    label: 'Date and time of previous assessment',
    section: 'trend', field: 'previousAssessedAt', type: 'datetime-local'
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Summary and sign-off',
    description: 'Live total, breakdown, band, and GCS-P, plus a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live Glasgow Coma Scale',
    id: 'live-score-readout',
    render: () => renderLiveScore()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, decisions, and any escalation already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the resolved score pill for a single component. */
function renderComponentReadout(component) {
  const grade = calculateGcsGrade(state);
  const response = state[component][`${component}Response`];
  const score =
    component === 'eye' ? grade.eyeScore
    : component === 'verbal' ? grade.verbalScore
    : grade.motorScore;

  if (response === 'NT') {
    return `<strong class="warn">NT</strong> <span class="muted">(not testable)</span>`;
  }
  if (score === null) {
    return `<span class="muted">Not yet scored</span>`;
  }
  return `<strong class="ok">${score}</strong> <span class="muted">points</span>`;
}

/** Render the Pupil Reactivity Score pill. */
function renderPrsReadout() {
  const grade = calculateGcsGrade(state);
  if (grade.pupilReactivityScore === null) {
    return `<span class="muted">Both pupils not yet examined</span>`;
  }
  const cls = grade.pupilReactivityScore > 0 ? 'warn' : 'ok';
  return `<strong class="${cls}">${grade.pupilReactivityScore}</strong> <span class="muted">pupil(s) unreactive</span>`;
}

/** Render the live overall total, breakdown, band, and GCS-P. */
function renderLiveScore() {
  const grade = calculateGcsGrade(state);
  const totalText = grade.totalDisplay || (grade.breakdown ? 'Not scored (NT)' : 'Not scored');
  const badge =
    `<span class="risk-badge ${severityBandClass(grade.severityBand)}">${esc(severityBandLabel(grade.severityBand))}</span>`;
  const breakdown = grade.breakdown
    ? `<div class="muted">Breakdown: ${esc(grade.breakdown)}</div>`
    : '';
  const gcsp = grade.gcsP !== null
    ? `<div class="muted">GCS-P: ${grade.gcsP} (PRS ${grade.pupilReactivityScore})</div>`
    : '';
  return `<strong>${esc(totalText)}</strong> ${badge}${breakdown}${gcsp}`;
}

function refreshLiveReadouts() {
  const eye = document.getElementById('eye-score-readout');
  if (eye) eye.innerHTML = renderComponentReadout('eye');
  const verbal = document.getElementById('verbal-score-readout');
  if (verbal) verbal.innerHTML = renderComponentReadout('verbal');
  const motor = document.getElementById('motor-score-readout');
  if (motor) motor.innerHTML = renderComponentReadout('motor');
  const prs = document.getElementById('prs-readout');
  if (prs) prs.innerHTML = renderPrsReadout();
  const live = document.getElementById('live-score-readout');
  if (live) live.innerHTML = renderLiveScore();
}

// ----------------------------------------------------------------------
// Conditional sections (NT reason fields)
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
  context: [['assessorName'], ['assessorRole'], ['setting']],
  confounders: [['intubated', 'sedated', 'paralysed']],
  eye: [['eyeResponse']],
  verbal: [['verbalResponse']],
  motor: [['motorResponse']],
  pupils: [['leftPupilReactivity', 'rightPupilReactivity', 'leftPupilSizeMm', 'rightPupilSizeMm']],
  trend: [['previousTotal', 'previousMotorScore', 'previousAssessedAt']],
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

function componentRow(prefix, options, response, score) {
  let value = 'Not recorded';
  let pointCell = '—';
  if (response === 'NT') {
    value = 'Not testable (NT)';
    pointCell = 'NT';
  } else if (response !== '' && response !== null && response !== undefined) {
    value = descriptorLabel(options, response);
    pointCell = String(score);
  }
  return `
    <tr>
      <th scope="row">${esc(prefix)}</th>
      <td>${esc(value)}</td>
      <td class="num"><span class="grade-pill">${esc(pointCell)}</span></td>
    </tr>
  `;
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    eyeScore, verbalScore, motorScore, totalScore, totalDisplay,
    breakdown, severityBand, pupilReactivityScore, gcsP,
    flaggedIssues, timestamp
  } = lastResult;

  const componentRows =
    componentRow('Eye (E)', eyeOptions, state.eye.eyeResponse, eyeScore) +
    componentRow('Verbal (V)', verbalOptions, state.verbal.verbalResponse, verbalScore) +
    componentRow('Motor (M)', motorOptions, state.motor.motorResponse, motorScore);

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

  const totalText = totalDisplay || (breakdown ? 'Not scored (NT)' : 'Not scored');

  const gcspRows = `
    <tr><th scope="row">E/V/M breakdown</th><td>${esc(breakdown || 'Not recorded')}</td></tr>
    <tr><th scope="row">Pupil Reactivity Score (PRS)</th><td>${pupilReactivityScore === null ? 'Not examined' : esc(String(pupilReactivityScore))}</td></tr>
    <tr><th scope="row">GCS-Pupils (GCS-P)</th><td>${gcsP === null ? 'Not computed' : esc(String(gcsP))}</td></tr>
  `;

  const interpretation = totalScore === null
    ? `<p>The numeric total is <strong>undefined</strong> because at least one component is not testable (NT). Report the breakdown explicitly (<code>${esc(breakdown || '—')}</code>) and record the reason for each NT. Never substitute an assumed value.</p>`
    : severityBand === 'severe'
      ? `<p>This is a <strong>severe</strong> impairment (coma). A GCS of 8 or less signals inability to protect the airway — consider definitive airway management and urgent senior / neurosurgical review.</p>`
      : severityBand === 'moderate'
        ? `<p>This is a <strong>moderate</strong> impairment. Monitor closely and reassess; record the E/V/M breakdown, not just the total.</p>`
        : `<p>This is a <strong>mild</strong> impairment (normal-to-drowsy). Continue routine neuro-observation and reassess if the patient deteriorates.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Glasgow Coma Scale Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${severityBandClass(severityBand)}">
        <div>
          <span class="risk-banner-label">Total GCS</span>
          <span class="risk-banner-value">${esc(totalText)}</span>
        </div>
        <span class="risk-badge ${severityBandClass(severityBand)}">${esc(severityBandLabel(severityBand))}</span>
      </div>

      <h3>Components</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Component</th>
            <th scope="col">Response</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${componentRows}</tbody>
      </table>

      <h3>Breakdown and GCS-Pupils</h3>
      <table class="subscales">
        <tbody>${gcspRows}</tbody>
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
  const grade = calculateGcsGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    ...grade,
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
  refreshLiveReadouts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',     title: 'Context' },
  { step: 2, section: 'confounders', title: 'Confounders' },
  { step: 3, section: 'eye',         title: 'Eye (E)' },
  { step: 4, section: 'verbal',      title: 'Verbal (V)' },
  { step: 5, section: 'motor',       title: 'Motor (M)' },
  { step: 6, section: 'pupils',      title: 'Pupils' },
  { step: 7, section: 'trend',       title: 'Trend' },
  { step: 8, section: 'note',        title: 'Summary' }
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveReadouts();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
