import { review } from './grader.js';
import { controlStatusClass, controlStatusLabel, emptyAssessment, hypertensionStageClass, hypertensionStageLabel, primarySourceLabel, priorityClass, priorityLabel, reviewStatusClass, reviewStatusLabel } from './types.js';

// Hypertension Annual Review — single-page wizard (vanilla JavaScript, no build).
//
// Single continuous wizard: every step is rendered into the page in document
// order across the twelve review sections. The clinician scrolls through them; a
// sticky top-of-page progress summary reflects how many fields have been
// answered, and a live readout updates the control status, review status, and
// hypertension stage as data is entered. Submission runs the pure
// control-classification-and-completeness engine (grader.js -> controlStatus,
// reviewStatus, componentStatuses, firedRules; flags.js -> flags) and renders an
// inline report. State is persisted to localStorage so a partial fill survives a
// page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'hypertension-review.front-end-with-html.v1';

/** @returns {import('./types.js').AssessmentData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
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
    console.warn('Could not parse saved review; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save review to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored review.', e);
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
  slug: 'hypertension-review',
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
    refreshLiveSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 12;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a field on the state and persist. Re-runs progress and the live readout.
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  refreshLiveSummary();
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

function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const type = opts.type || 'text';
  const lilyClass = type === 'date' ? 'date-input' : 'text-input';
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${lilyClass}"`,
    `value="${esc(value ?? '')}"`,
    `aria-describedby="${id}-error"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    setField(opts.section, opts.field, input.value);
    clearFieldError(id);
  });
  return wrapper;
}

function numberInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    'type="number"',
    'class="number-input"',
    `value="${value === null || value === undefined ? '' : esc(value)}"`,
    `aria-describedby="${id}-error"`
  ];
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    const raw = input.value.trim();
    const parsed = raw === '' ? null : Number(raw);
    setField(opts.section, opts.field, Number.isNaN(parsed) ? null : parsed);
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
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      aria-describedby="${id}-error"
      class="text-area-input"${opts.required ? ' required data-required' : ''}>${esc(value)}</textarea>
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

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
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
// Option vocabularies (mirror the SQL CHECK constraints)
// ----------------------------------------------------------------------

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const OPTIONS = {
  clinicianRole: [
    { value: 'gp', label: 'General practitioner' },
    { value: 'practice-nurse', label: 'Practice nurse' },
    { value: 'pharmacist', label: 'Clinical pharmacist' },
    { value: 'other', label: 'Other' }
  ],
  ageBand: [
    { value: '18-39', label: '18-39' },
    { value: '40-59', label: '40-59' },
    { value: '60-79', label: '60-79' },
    { value: '>=80', label: '80 and over' }
  ],
  sex: [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'intersex', label: 'Intersex' },
    { value: 'unknown', label: 'Unknown' }
  ],
  ethnicity: [
    { value: 'white', label: 'White' },
    { value: 'black-african-caribbean', label: 'Black African / Caribbean' },
    { value: 'south-asian', label: 'South Asian' },
    { value: 'mixed', label: 'Mixed' },
    { value: 'other', label: 'Other' }
  ],
  monitoringMethod: [
    { value: 'clinic-only', label: 'Clinic only' },
    { value: 'hbpm', label: 'Home (HBPM)' },
    { value: 'abpm', label: 'Ambulatory (ABPM)' }
  ],
  adherence: [
    { value: 'good', label: 'Good' },
    { value: 'partial', label: 'Partial' },
    { value: 'poor', label: 'Poor' }
  ],
  smokingStatus: [
    { value: 'never', label: 'Never' },
    { value: 'ex', label: 'Ex-smoker' },
    { value: 'current', label: 'Current' }
  ]
};

// ----------------------------------------------------------------------
// Section renderers (1 per wizard step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Review context',
    description: 'Who is reviewing, when, and where.'
  });
  card.appendChild(textInput({
    label: 'Reviewing clinician name', section: 'context',
    field: 'clinicianName', required: true, placeholder: 'e.g. Dr A. Rahman'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role', section: 'context', field: 'clinicianRole',
    required: true, options: OPTIONS.clinicianRole
  }));
  card.appendChild(textInput({
    label: 'Date of review', section: 'context', field: 'reviewedAt', type: 'date'
  }));
  card.appendChild(textInput({
    label: 'Practice or site', section: 'context', field: 'practiceSite',
    placeholder: 'e.g. Riverside Medical Practice'
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'NHS number / local identifier, age band, sex, and ethnicity.'
  });
  card.appendChild(textInput({
    label: 'Patient identifier', section: 'identification',
    field: 'patientIdentifier', required: true,
    placeholder: 'e.g. NHS 943 476 5919 or local MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band', section: 'identification', field: 'ageBand',
    required: true, options: OPTIONS.ageBand,
    hint: '80 and over relaxes the clinic target to 150/90.'
  }));
  card.appendChild(selectInput({
    label: 'Sex', section: 'identification', field: 'sex', options: OPTIONS.sex
  }));
  card.appendChild(selectInput({
    label: 'Ethnicity', section: 'identification', field: 'ethnicity',
    options: OPTIONS.ethnicity
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Diagnosis and comorbidity',
    description: 'Comorbidities drive the applicable blood-pressure target.'
  });
  card.appendChild(textInput({
    label: 'Date of hypertension diagnosis', section: 'diagnosis',
    field: 'diagnosisDate', type: 'date'
  }));
  card.appendChild(selectInput({
    label: 'Type 2 diabetes', section: 'diagnosis', field: 'type2Diabetes',
    options: YES_NO, hint: 'Holds the clinic target at 140/90.'
  }));
  card.appendChild(selectInput({
    label: 'Chronic kidney disease (CKD)', section: 'diagnosis',
    field: 'chronicKidneyDisease', options: YES_NO,
    hint: 'With diabetes or ACR >= 70 tightens the target to 130/80.'
  }));
  card.appendChild(selectInput({
    label: 'Established cardiovascular disease', section: 'diagnosis',
    field: 'establishedCvd', options: YES_NO
  }));
  card.appendChild(selectInput({
    label: 'Atrial fibrillation', section: 'diagnosis',
    field: 'atrialFibrillation', options: YES_NO
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Clinic blood pressure',
    description: 'Best of repeated seated clinic readings (mmHg).'
  });
  card.appendChild(numberInput({
    label: 'Clinic systolic (mmHg)', section: 'clinicBp', field: 'clinicSystolic',
    min: 50, max: 300, step: 1, placeholder: 'e.g. 148',
    hint: '>= 180 raises a severe-hypertension flag.'
  }));
  card.appendChild(numberInput({
    label: 'Clinic diastolic (mmHg)', section: 'clinicBp', field: 'clinicDiastolic',
    min: 30, max: 200, step: 1, placeholder: 'e.g. 92',
    hint: '>= 120 raises a severe-hypertension flag.'
  }));
  card.appendChild(selectInput({
    label: 'Symptomatic postural drop (>= 20 mmHg systolic)', section: 'clinicBp',
    field: 'posturalDrop', options: YES_NO,
    hint: 'Yes raises a postural-drop flag.'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Home / ambulatory blood pressure',
    description: 'HBPM or ABPM daytime average (mmHg) — the primary basis for control.'
  });
  card.appendChild(numberInput({
    label: 'Home/ambulatory systolic (mmHg)', section: 'homeBp',
    field: 'homeSystolic', min: 50, max: 300, step: 1, placeholder: 'e.g. 138'
  }));
  card.appendChild(numberInput({
    label: 'Home/ambulatory diastolic (mmHg)', section: 'homeBp',
    field: 'homeDiastolic', min: 30, max: 200, step: 1, placeholder: 'e.g. 84'
  }));
  card.appendChild(selectInput({
    label: 'Monitoring method', section: 'homeBp', field: 'monitoringMethod',
    options: OPTIONS.monitoringMethod
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Medication and adherence',
    description: 'Antihypertensive burden, adherence, and tolerability.'
  });
  card.appendChild(numberInput({
    label: 'Number of antihypertensive agents', section: 'medication',
    field: 'antihypertensiveAgents', min: 0, max: 10, step: 1, placeholder: 'e.g. 2'
  }));
  card.appendChild(selectInput({
    label: 'Adherence', section: 'medication', field: 'adherence',
    options: OPTIONS.adherence, hint: 'Poor raises an adherence-concern flag.'
  }));
  card.appendChild(selectInput({
    label: 'Troublesome side effects', section: 'medication', field: 'sideEffects',
    options: YES_NO, hint: 'Yes raises an adherence-concern flag.'
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Cardiovascular risk',
    description: 'QRISK 10-year risk, smoking status, and statin therapy.'
  });
  card.appendChild(numberInput({
    label: 'QRISK 10-year risk (%)', section: 'cardiovascularRisk',
    field: 'qriskPercent', min: 0, max: 100, step: 0.1, placeholder: 'e.g. 14.2',
    hint: '>= 10% with no statin raises a high-CV-risk-untreated flag.'
  }));
  card.appendChild(selectInput({
    label: 'Smoking status', section: 'cardiovascularRisk', field: 'smokingStatus',
    options: OPTIONS.smokingStatus
  }));
  card.appendChild(selectInput({
    label: 'On a statin', section: 'cardiovascularRisk', field: 'statinTherapy',
    options: YES_NO
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Bloods and investigations',
    description: 'Annual U&E, HbA1c, and lipids. Missing bloods raise a flag.'
  });
  card.appendChild(numberInput({
    label: 'Serum creatinine (µmol/L)', section: 'bloods', field: 'serumCreatinine',
    min: 10, max: 2000, step: 0.1, placeholder: 'e.g. 82'
  }));
  card.appendChild(numberInput({
    label: 'eGFR (mL/min/1.73m²)', section: 'bloods', field: 'egfr',
    min: 1, max: 200, step: 0.1, placeholder: 'e.g. 78'
  }));
  card.appendChild(numberInput({
    label: 'Serum potassium (mmol/L)', section: 'bloods', field: 'serumPotassium',
    min: 1, max: 10, step: 0.1, placeholder: 'e.g. 4.2'
  }));
  card.appendChild(numberInput({
    label: 'HbA1c (mmol/mol)', section: 'bloods', field: 'hba1c',
    min: 10, max: 200, step: 0.1, placeholder: 'e.g. 41'
  }));
  card.appendChild(numberInput({
    label: 'Total cholesterol (mmol/L)', section: 'bloods', field: 'totalCholesterol',
    min: 1, max: 20, step: 0.1, placeholder: 'e.g. 5.1'
  }));
  card.appendChild(numberInput({
    label: 'HDL cholesterol (mmol/L)', section: 'bloods', field: 'hdlCholesterol',
    min: 0.1, max: 10, step: 0.1, placeholder: 'e.g. 1.3'
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Urine albumin:creatinine ratio (ACR)',
    description: 'A missing ACR raises a flag; ACR >= 70 tightens the CKD target.'
  });
  card.appendChild(numberInput({
    label: 'Urine ACR (mg/mmol)', section: 'urine', field: 'urineAcr',
    min: 0, max: 3000, step: 0.1, placeholder: 'e.g. 2.4'
  }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Lifestyle',
    description: 'Anthropometry and the lifestyle advice given.'
  });
  card.appendChild(numberInput({
    label: 'BMI (kg/m²)', section: 'lifestyle', field: 'bmi',
    min: 10, max: 80, step: 0.1, placeholder: 'e.g. 28.6'
  }));
  card.appendChild(textArea({
    label: 'Lifestyle advice given', section: 'lifestyle', field: 'lifestyleAdvice',
    placeholder: 'Diet, exercise, alcohol, dietary salt, smoking cessation.'
  }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Complications and target-organ damage',
    description: 'Left-ventricular hypertrophy, retinopathy, CKD progression, prior stroke/MI, heart failure.'
  });
  card.appendChild(textArea({
    label: 'Complications', section: 'complications', field: 'complications',
    rows: 4,
    placeholder: 'Free-text record of hypertension-related complications or target-organ damage.'
  }));
  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Summary and plan',
    description: 'Live control and completeness, plus a free-text clinician note.'
  });
  card.appendChild(readOnlyReadout({
    label: 'Live control status and review completeness',
    id: 'live-summary-readout',
    render: () => renderLiveSummary()
  }));
  card.appendChild(textArea({
    label: 'Clinician note (medication and recall plan)', section: 'summary',
    field: 'reviewContext', rows: 5,
    placeholder: 'Free-text summary drawing the review together, with the plan and recall interval.'
  }));
  return card;
}

// ----------------------------------------------------------------------
// Live readout
// ----------------------------------------------------------------------

/** Render the live control / review summary. */
function renderLiveSummary() {
  const g = review(state);
  const cs = g.controlStatus;
  const documented = g.componentStatuses.filter((c) => c.documented).length;
  const total = g.componentStatuses.length;

  const controlBadge = cs.primarySource === 'none'
    ? `<span class="risk-badge">Not classified</span>`
    : `<span class="risk-badge ${controlStatusClass(cs.controlClass)}">${esc(controlStatusLabel(cs.controlClass))}</span>`;
  const reviewBadge =
    `<span class="risk-badge ${reviewStatusClass(g.reviewStatus)}">${esc(reviewStatusLabel(g.reviewStatus))}</span>`;
  const stageBadge =
    `<span class="risk-badge ${hypertensionStageClass(cs.hypertensionStage)}">${esc(hypertensionStageLabel(cs.hypertensionStage))}</span>`;

  return (
    `<div class="readout-line">Control ${controlBadge} ` +
    `<span class="muted">(primary: ${esc(primarySourceLabel(cs.primarySource))}; ` +
    `target clinic ${cs.bpTarget.clinic.systolic}/${cs.bpTarget.clinic.diastolic})</span></div>` +
    `<div class="readout-line">Review ${reviewBadge} ` +
    `<span class="muted">(${documented} of ${total} components)</span></div>` +
    `<div class="readout-line">Stage ${stageBadge} &nbsp; ` +
    `<span class="muted">${g.flags.length} flag${g.flags.length === 1 ? '' : 's'}</span></div>`
  );
}

function refreshLiveSummary() {
  const live = document.getElementById('live-summary-readout');
  if (live) live.innerHTML = renderLiveSummary();
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered.
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['reviewedAt'], ['practiceSite']],
  identification: [['patientIdentifier'], ['ageBand'], ['sex'], ['ethnicity']],
  diagnosis: [['diagnosisDate', 'type2Diabetes', 'chronicKidneyDisease', 'establishedCvd', 'atrialFibrillation']],
  clinicBp: [['clinicSystolic', 'clinicDiastolic', 'posturalDrop']],
  homeBp: [['homeSystolic', 'homeDiastolic', 'monitoringMethod']],
  medication: [['antihypertensiveAgents', 'adherence', 'sideEffects']],
  cardiovascularRisk: [['qriskPercent', 'smokingStatus', 'statinTherapy']],
  bloods: [['serumCreatinine', 'egfr', 'serumPotassium', 'hba1c', 'totalCholesterol', 'hdlCholesterol']],
  urine: [['urineAcr']],
  lifestyle: [['bmi', 'lifestyleAdvice']],
  complications: [['complications']],
  summary: [['reviewContext']]
};

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && String(v).trim() !== '';
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    controlStatus, reviewStatus, componentStatuses, flags, firedRules, timestamp
  } = lastResult;
  const cs = controlStatus;
  const documented = componentStatuses.filter((c) => c.documented).length;
  const total = componentStatuses.length;

  const notClassified = cs.primarySource === 'none';

  const componentRows = componentStatuses.map((c) => `
    <tr>
      <th scope="row">${esc(c.label)}</th>
      <td>
        <span class="flag-badge ${c.documented ? 'flag-no' : 'flag-yes'}">
          ${c.documented ? 'Recorded' : 'Outstanding'}
        </span>
      </td>
    </tr>
  `).join('');

  const flagsList = flags.length === 0
    ? `<p class="muted">No flags raised.</p>`
    : `
      <ul class="flags">
        ${flags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority))}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}${f.suggestedAction ? ` — ${esc(f.suggestedAction)}` : ''}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const rulesList = `
    <ul class="flags">
      ${firedRules.map((r) => `
        <li>
          <span class="flag-category">${esc(r.category)}</span>
          <span class="flag-message">${esc(r.description)}</span>
        </li>
      `).join('')}
    </ul>
  `;

  const controlAdvice = notClassified
    ? `<p>No blood-pressure reading was recorded, so control cannot be classified. Record a clinic or home/ambulatory reading.</p>`
    : cs.controlClass === 'severe-uncontrolled'
    ? `<p>Clinic blood pressure is <strong>>= 180/120 mmHg</strong>. Arrange <strong>same-day</strong> clinical assessment for accelerated hypertension and target-organ damage.</p>`
    : cs.controlClass === 'uncontrolled'
    ? `<p>Blood pressure is <strong>above the applicable target</strong>. Review adherence and step up antihypertensive medication per NICE NG136.</p>`
    : `<p>Blood pressure is <strong>at or below the applicable target</strong>. Continue current management and routine recall.</p>`;

  const reviewAdvice = reviewStatus === 'complete'
    ? `<p>All ${total} core review components are recorded.</p>`
    : reviewStatus === 'incomplete'
    ? `<p>No blood pressure recorded — the review is incomplete and control cannot be classified.</p>`
    : `<p><strong>${total - documented}</strong> component(s) remain outstanding — complete them for a whole annual review.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Hypertension Annual Review Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${notClassified ? '' : controlStatusClass(cs.controlClass)}">
        <div>
          <span class="risk-banner-label">Control status</span>
          <span class="risk-banner-value">${notClassified ? 'Not classified' : esc(controlStatusLabel(cs.controlClass))}</span>
        </div>
        <span class="risk-badge ${hypertensionStageClass(cs.hypertensionStage)}">${esc(hypertensionStageLabel(cs.hypertensionStage))}</span>
      </div>

      <div class="risk-banner ${reviewStatusClass(reviewStatus)}">
        <div>
          <span class="risk-banner-label">Review completeness</span>
          <span class="risk-banner-value">${esc(reviewStatusLabel(reviewStatus))}</span>
        </div>
        <span class="risk-badge ${reviewStatusClass(reviewStatus)}">${documented} of ${total} components</span>
      </div>

      <h3>Blood-pressure target</h3>
      <p>
        Group: <strong>${esc(cs.bpTarget.group)}</strong>.
        Clinic target <strong>${cs.bpTarget.clinic.systolic}/${cs.bpTarget.clinic.diastolic}</strong> mmHg;
        home/ambulatory target <strong>${cs.bpTarget.home.systolic}/${cs.bpTarget.home.diastolic}</strong> mmHg.
        Primary reading source: <strong>${esc(primarySourceLabel(cs.primarySource))}</strong>.
      </p>

      <h3>Control status</h3>
      ${controlAdvice}

      <h3>Review completeness</h3>
      ${reviewAdvice}
      <table class="subscales">
        <thead>
          <tr><th scope="col">Review component</th><th scope="col">Status</th></tr>
        </thead>
        <tbody>${componentRows}</tbody>
      </table>

      <h3>Flags (${flags.length})</h3>
      ${flagsList}

      <h3>Fired rules</h3>
      ${rulesList}

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
  lastResult = review(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh review?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  refreshLiveSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'context',            title: 'Context' },
  { step: 2,  section: 'identification',     title: 'Patient' },
  { step: 3,  section: 'diagnosis',          title: 'Diagnosis' },
  { step: 4,  section: 'clinicBp',           title: 'Clinic BP' },
  { step: 5,  section: 'homeBp',             title: 'Home BP' },
  { step: 6,  section: 'medication',         title: 'Medication' },
  { step: 7,  section: 'cardiovascularRisk', title: 'CV risk' },
  { step: 8,  section: 'bloods',             title: 'Bloods' },
  { step: 9,  section: 'urine',              title: 'Urine ACR' },
  { step: 10, section: 'lifestyle',          title: 'Lifestyle' },
  { step: 11, section: 'complications',      title: 'Complications' },
  { step: 12, section: 'summary',            title: 'Summary' }
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
  const required = form.querySelectorAll(
    'input[data-required], select[data-required], textarea[data-required]'
  );
  const seen = new Set();
  required.forEach((input) => {
    const id = input.id;
    if (seen.has(id)) return;
    seen.add(id);
    const value = (input.value || '').trim();
    if (!value) {
      const labelEl = form.querySelector(`label[for="${id}"]`);
      const labelText = labelEl
        ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim()
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
  host.appendChild(renderStep10());
  host.appendChild(renderStep11());
  host.appendChild(renderStep12());
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  refreshLiveSummary();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
