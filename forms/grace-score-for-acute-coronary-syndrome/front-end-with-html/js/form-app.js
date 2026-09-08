import { detectFlaggedIssues } from './flags.js';
import { calculateGraceGrade } from './grader.js';
import { bandLabel, emptyAssessment, priorityLabel, riskCategoryClass, riskCategoryLabel } from './types.js';

// GRACE Score for Acute Coronary Syndrome — admission wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live GRACE
// total updates as the eight variables are entered. Submission runs the pure
// scoring engine (per-variable weighted points, GRACE total, in-hospital and
// 6-month mortality bands, overall risk category, invasive-strategy guidance,
// flagged issues) and renders an inline report. State is persisted to
// localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'grace-score-for-acute-coronary-syndrome.front-end-with-html.v1';

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

/** @type {import('./types.js').AssessmentData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'grace-score-for-acute-coronary-syndrome',
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
    refreshLiveScore();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 7;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-score readout after each change.
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshLiveScore();
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
  if (opts.hint) {
    const hint = document.createElement('span');
    hint.className = 'hint';
    hint.textContent = opts.hint;
    wrapper.appendChild(hint);
  }
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
// Section renderers (1 per GRACE step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, where, and the acute coronary syndrome presentation.'
  });

  card.appendChild(textInput({
    label: 'Assessing clinician name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. Dr A. Khan'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'emergency-physician', label: 'Emergency physician' },
      { value: 'acute-physician', label: 'Acute physician' },
      { value: 'cardiologist', label: 'Cardiologist' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of assessment',
    section: 'context', field: 'assessedAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'careSetting', required: true,
    options: [
      { value: 'emergency-department', label: 'Emergency department' },
      { value: 'acute-medical-unit', label: 'Acute medical unit' },
      { value: 'coronary-care-unit', label: 'Coronary care unit' },
      { value: 'cardiology-ward', label: 'Cardiology ward' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'ACS presentation type',
    section: 'context', field: 'presentationType',
    options: [
      { value: 'nstemi', label: 'NSTEMI' },
      { value: 'unstable-angina', label: 'Unstable angina' },
      { value: 'stemi', label: 'STEMI' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age (GRACE variable 1), and sex. GRACE is for adults.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. CCU-100482 or hospital MRN'
  }));
  card.appendChild(textInput({
    label: 'Age',
    section: 'identification', field: 'ageYears',
    type: 'number', min: 16, max: 120, step: 1, unit: 'years',
    hint: 'Variable 1 — older age adds substantially more points.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Age point contribution',
    id: 'age-point-readout',
    render: () => renderPointReadout('age')
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'identification', field: 'sex', required: true,
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
    title: 'Haemodynamics',
    description: 'Admission heart rate (variable 2) and systolic blood pressure (variable 3; lower pressure scores higher).'
  });

  card.appendChild(textInput({
    label: 'Heart rate',
    section: 'haemodynamics', field: 'heartRate',
    type: 'number', min: 0, max: 300, step: 1, unit: 'beats/min',
    hint: 'Variable 2 — a faster rate adds more points.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Heart-rate point contribution',
    id: 'hr-point-readout',
    render: () => renderPointReadout('heart-rate')
  }));
  card.appendChild(textInput({
    label: 'Systolic blood pressure',
    section: 'haemodynamics', field: 'systolicBloodPressure',
    type: 'number', min: 0, max: 300, step: 1, unit: 'mmHg',
    hint: 'Variable 3 — a lower pressure adds more points (inverse weight).'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Systolic-BP point contribution',
    id: 'sbp-point-readout',
    render: () => renderPointReadout('systolic-blood-pressure')
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Renal function',
    description: 'Serum creatinine (variable 4). µmol/L is normalised to mg/dL (÷ 88.4) before banding.'
  });

  card.appendChild(textInput({
    label: 'Serum creatinine',
    section: 'renal', field: 'serumCreatinine',
    type: 'number', min: 0, max: 30, step: 0.01,
    hint: 'Variable 4 — a higher creatinine adds more points.'
  }));
  card.appendChild(selectInput({
    label: 'Creatinine unit',
    section: 'renal', field: 'serumCreatinineUnit', required: true,
    options: [
      { value: 'mg/dL', label: 'mg/dL' },
      { value: 'umol/L', label: 'µmol/L' }
    ]
  }));
  card.appendChild(readOnlyReadout({
    label: 'Creatinine point contribution',
    id: 'creatinine-point-readout',
    render: () => renderPointReadout('creatinine')
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Heart-failure severity',
    description: 'Killip class (variable 5) — each higher class adds a large increment.'
  });

  card.appendChild(selectInput({
    label: 'Killip class',
    section: 'heartFailure', field: 'killipClass', required: true,
    options: [
      { value: 'I', label: 'Class I — no heart failure' },
      { value: 'II', label: 'Class II — rales / raised JVP' },
      { value: 'III', label: 'Class III — pulmonary oedema' },
      { value: 'IV', label: 'Class IV — cardiogenic shock' }
    ]
  }));
  card.appendChild(readOnlyReadout({
    label: 'Killip point contribution',
    id: 'killip-point-readout',
    render: () => renderPointReadout('killip')
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'High-risk features',
    description: 'Cardiac arrest at admission (variable 6), ST-segment deviation (variable 7), and elevated cardiac enzymes / troponin (variable 8).'
  });

  card.appendChild(radioGroup({
    label: 'Cardiac arrest at admission?',
    section: 'highRiskFeatures', field: 'cardiacArrestAtAdmission', required: true,
    hint: 'Variable 6 — a fixed high-point increment when present.',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'ST-segment deviation on the admission ECG?',
    section: 'highRiskFeatures', field: 'stSegmentDeviation', required: true,
    hint: 'Variable 7 — a fixed increment when present.',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Elevated cardiac enzymes / troponin?',
    section: 'highRiskFeatures', field: 'elevatedCardiacEnzymes', required: true,
    hint: 'Variable 8 — a fixed increment when present.',
    options: yesNo
  }));
  card.appendChild(readOnlyReadout({
    label: 'High-risk-feature point contribution',
    id: 'features-point-readout',
    render: () => renderFeaturesReadout()
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Summary and score',
    description: 'Live GRACE total, mortality bands, and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live GRACE score',
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

/** Render the point pill for a single weighted variable. */
function renderPointReadout(variable) {
  const grade = calculateGraceGrade(state);
  const points =
    variable === 'age' ? grade.agePoints
    : variable === 'heart-rate' ? grade.heartRatePoints
    : variable === 'systolic-blood-pressure' ? grade.sbpPoints
    : variable === 'creatinine' ? grade.creatininePoints
    : variable === 'killip' ? grade.killipPoints
    : 0;
  const cls = points > 0 ? 'warn' : 'ok';
  return `<strong class="${cls}">${points} point${points === 1 ? '' : 's'}</strong>`;
}

/** Render the summed yes/no high-risk-feature contribution. */
function renderFeaturesReadout() {
  const grade = calculateGraceGrade(state);
  const total = grade.arrestPoints + grade.stPoints + grade.enzymePoints;
  const cls = total > 0 ? 'warn' : 'ok';
  return `<strong class="${cls}">${total} point${total === 1 ? '' : 's'}</strong> ` +
    `<span class="muted">(arrest ${grade.arrestPoints} + ST ${grade.stPoints} + enzymes ${grade.enzymePoints})</span>`;
}

/** Render the live overall GRACE score, mortality bands, and overall category. */
function renderLiveScore() {
  const grade = calculateGraceGrade(state);
  const badge =
    `<span class="risk-badge ${riskCategoryClass(grade.riskCategory)}">${esc(riskCategoryLabel(grade.riskCategory))}</span>`;
  return `<strong>${grade.gracePoints} points</strong> ${badge} ` +
    `<span class="muted">in-hospital ${esc(bandLabel(grade.inHospitalMortalityBand))}, ` +
    `6-month ${esc(bandLabel(grade.sixMonthMortalityBand))}</span>`;
}

function refreshLiveScore() {
  const ids = [
    ['age-point-readout', () => renderPointReadout('age')],
    ['hr-point-readout', () => renderPointReadout('heart-rate')],
    ['sbp-point-readout', () => renderPointReadout('systolic-blood-pressure')],
    ['creatinine-point-readout', () => renderPointReadout('creatinine')],
    ['killip-point-readout', () => renderPointReadout('killip')],
    ['features-point-readout', () => renderFeaturesReadout()],
    ['live-score-readout', () => renderLiveScore()]
  ];
  for (const [id, render] of ids) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = render();
  }
}

// ----------------------------------------------------------------------
// Conditional sections (none currently, but kept for parity + future use)
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

const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['careSetting']],
  identification: [['patientIdentifier'], ['ageYears'], ['sex']],
  haemodynamics: [['heartRate'], ['systolicBloodPressure']],
  renal: [['serumCreatinine'], ['serumCreatinineUnit']],
  heartFailure: [['killipClass']],
  highRiskFeatures: [['cardiacArrestAtAdmission'], ['stSegmentDeviation'], ['elevatedCardiacEnzymes']],
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

function creatinineDisplay() {
  const raw = state.renal.serumCreatinine;
  const unit = state.renal.serumCreatinineUnit;
  if (raw === null) return 'Not recorded';
  return `${raw}${unit ? ' ' + (unit === 'umol/L' ? 'µmol/L' : unit) : ''}`;
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    agePoints, heartRatePoints, sbpPoints, creatininePoints, killipPoints,
    arrestPoints, stPoints, enzymePoints, gracePoints,
    inHospitalMortalityBand, sixMonthMortalityBand, riskCategory,
    invasiveStrategy, flaggedIssues, timestamp
  } = lastResult;

  const age = state.identification.ageYears;
  const hr = state.haemodynamics.heartRate;
  const sbp = state.haemodynamics.systolicBloodPressure;
  const killip = state.heartFailure.killipClass;
  const arrest = state.highRiskFeatures.cardiacArrestAtAdmission;
  const st = state.highRiskFeatures.stSegmentDeviation;
  const enzymes = state.highRiskFeatures.elevatedCardiacEnzymes;

  const yn = (v) => v === 'yes' ? 'Yes' : v === 'no' ? 'No' : 'Not recorded';

  const contributorRows = [
    ['Age', age === null ? 'Not recorded' : `${age} years`, agePoints],
    ['Heart rate', hr === null ? 'Not recorded' : `${hr} beats/min`, heartRatePoints],
    ['Systolic blood pressure', sbp === null ? 'Not recorded' : `${sbp} mmHg`, sbpPoints],
    ['Serum creatinine', creatinineDisplay(), creatininePoints],
    ['Killip class', killip || 'Not recorded', killipPoints],
    ['Cardiac arrest at admission', yn(arrest), arrestPoints],
    ['ST-segment deviation', yn(st), stPoints],
    ['Elevated cardiac enzymes', yn(enzymes), enzymePoints]
  ].map(([name, value, point]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
      <td class="num"><span class="grade-pill">${point} pts</span></td>
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

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>GRACE Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${riskCategoryClass(riskCategory)}">
        <div>
          <span class="risk-banner-label">GRACE score</span>
          <span class="risk-banner-value">${gracePoints} points</span>
        </div>
        <span class="risk-badge ${riskCategoryClass(riskCategory)}">${esc(riskCategoryLabel(riskCategory))}</span>
      </div>

      <h3>Mortality bands</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Horizon</th>
            <th scope="col">Band</th>
          </tr>
        </thead>
        <tbody>
          <tr><th scope="row">In-hospital mortality</th><td><span class="risk-badge ${riskCategoryClass(inHospitalMortalityBand)}">${esc(bandLabel(inHospitalMortalityBand))}</span></td></tr>
          <tr><th scope="row">6-month mortality</th><td><span class="risk-badge ${riskCategoryClass(sixMonthMortalityBand)}">${esc(bandLabel(sixMonthMortalityBand))}</span></td></tr>
          <tr><th scope="row">Overall (worse band)</th><td><span class="risk-badge ${riskCategoryClass(riskCategory)}">${esc(riskCategoryLabel(riskCategory))}</span></td></tr>
        </tbody>
      </table>

      <h3>Weighted contributors</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Variable</th>
            <th scope="col">Value</th>
            <th scope="col">Points</th>
          </tr>
        </thead>
        <tbody>${contributorRows}</tbody>
      </table>

      <h3>Recommended invasive strategy</h3>
      <p>${esc(invasiveStrategy)}</p>

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
  const grade = calculateGraceGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade.riskCategory);
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
  refreshLiveScore();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',          title: 'Context' },
  { step: 2, section: 'identification',   title: 'Patient' },
  { step: 3, section: 'haemodynamics',    title: 'Haemodynamics' },
  { step: 4, section: 'renal',            title: 'Renal' },
  { step: 5, section: 'heartFailure',     title: 'Killip class' },
  { step: 6, section: 'highRiskFeatures', title: 'High-risk features' },
  { step: 7, section: 'note',             title: 'Summary' }
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveScore();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
