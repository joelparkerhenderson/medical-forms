import { review } from './grader.js';
import { albuminuriaCategoryClass, albuminuriaCategoryLabel, emptyAssessment, gfrCategoryClass, gfrCategoryLabel, kdigoRiskZoneClass, kdigoRiskZoneLabel, priorityClass, priorityLabel, referralDecisionLabel, reviewStatusClass, reviewStatusLabel } from './types.js';

// Chronic Kidney Disease Annual Review — single-page wizard (vanilla
// JavaScript, no build).
//
// Single continuous wizard: every step is rendered into the page in document
// order across the eight review sections. The clinician scrolls through them; a
// sticky top-of-page progress summary reflects how many fields have been
// answered, and a live readout updates the G-stage, albuminuria stage, KDIGO
// risk zone, and review status as data is entered. Submission runs the pure
// KDIGO-classification-and-completeness engine (grader.js -> gfrCategory,
// albuminuriaCategory, kdigoRiskZone, reviewStatus, componentStatuses,
// firedCriteria; flags.js -> flaggedIssues) and renders an inline report. State
// is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'chronic-kidney-disease-review.front-end-with-html.v1';

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
  slug: 'chronic-kidney-disease-review',
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

const TOTAL_STEPS = 8;

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
    { value: 'nurse', label: 'Practice / advanced nurse' },
    { value: 'pharmacist', label: 'Clinical pharmacist' },
    { value: 'nephrology', label: 'Nephrology team' },
    { value: 'other', label: 'Other' }
  ],
  careSetting: [
    { value: 'general-practice', label: 'General practice' },
    { value: 'long-term-conditions-clinic', label: 'Long-term-conditions clinic' },
    { value: 'community-nephrology', label: 'Community nephrology' },
    { value: 'other', label: 'Other' }
  ],
  reviewType: [
    { value: 'annual', label: 'Annual' },
    { value: 'interval', label: 'Interval' },
    { value: 'post-referral', label: 'Post-referral' }
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
  diabetesStatus: [
    { value: 'none', label: 'None' },
    { value: 'type1', label: 'Type 1 diabetes' },
    { value: 'type2', label: 'Type 2 diabetes' }
  ],
  primaryCause: [
    { value: 'diabetic', label: 'Diabetic' },
    { value: 'hypertensive', label: 'Hypertensive' },
    { value: 'glomerular', label: 'Glomerular' },
    { value: 'polycystic', label: 'Polycystic' },
    { value: 'obstructive', label: 'Obstructive' },
    { value: 'unknown', label: 'Unknown' },
    { value: 'other', label: 'Other' }
  ],
  aceiOrArbPrescribed: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'contraindicated', label: 'Contraindicated' }
  ],
  sglt2iPrescribed: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'not-indicated', label: 'Not indicated' }
  ],
  statinPrescribed: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'declined', label: 'Declined' }
  ],
  nephrotoxicDoseAdjusted: [
    { value: 'yes', label: 'Yes — dose-adjusted or held' },
    { value: 'no', label: 'No' },
    { value: 'not-applicable', label: 'Not applicable' }
  ],
  referralDecision: [
    { value: 'none', label: 'No referral' },
    { value: 'monitor', label: 'Continue monitoring' },
    { value: 'refer-nephrology', label: 'Refer to nephrology' },
    { value: 'already-under-nephrology', label: 'Already under nephrology' }
  ]
};

// ----------------------------------------------------------------------
// Section renderers (1 per wizard step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Review context',
    description: 'Who is reviewing, when, where, and the review type.'
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
  card.appendChild(selectInput({
    label: 'Care setting', section: 'context', field: 'careSetting',
    options: OPTIONS.careSetting
  }));
  card.appendChild(selectInput({
    label: 'Review type', section: 'context', field: 'reviewType',
    options: OPTIONS.reviewType
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient and diagnosis',
    description: 'Identifier, demographics, diabetes status, and CKD cause.'
  });
  card.appendChild(textInput({
    label: 'Patient identifier', section: 'patient',
    field: 'patientIdentifier', required: true,
    placeholder: 'e.g. NHS 943 476 5919 or local MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band', section: 'patient', field: 'ageBand',
    required: true, options: OPTIONS.ageBand
  }));
  card.appendChild(selectInput({
    label: 'Sex', section: 'patient', field: 'sex', options: OPTIONS.sex
  }));
  card.appendChild(selectInput({
    label: 'Diabetes status', section: 'patient', field: 'diabetesStatus',
    options: OPTIONS.diabetesStatus,
    hint: 'Diabetes tightens the blood-pressure target to 130/80.'
  }));
  card.appendChild(selectInput({
    label: 'Primary cause of CKD', section: 'patient', field: 'primaryCause',
    options: OPTIONS.primaryCause
  }));
  card.appendChild(numberInput({
    label: 'Months since CKD diagnosis', section: 'patient',
    field: 'monthsSinceDiagnosis', min: 0, max: 1200, step: 1, placeholder: 'e.g. 36'
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Renal function (eGFR)',
    description: 'Current eGFR sets the G-stage; the prior value drives the rapid-decline check.'
  });
  card.appendChild(numberInput({
    label: 'Current eGFR (mL/min/1.73 m²)', section: 'renal', field: 'egfr',
    min: 1, max: 200, step: 0.1, placeholder: 'e.g. 50',
    hint: 'G1 ≥ 90, G2 60–89, G3a 45–59, G3b 30–44, G4 15–29, G5 < 15.'
  }));
  card.appendChild(textInput({
    label: 'eGFR sample date', section: 'renal', field: 'egfrSampleDate', type: 'date'
  }));
  card.appendChild(numberInput({
    label: 'Previous eGFR (mL/min/1.73 m²)', section: 'renal', field: 'previousEgfr',
    min: 1, max: 200, step: 0.1, placeholder: 'e.g. 68',
    hint: 'Used for the rapid-decline check (≥ 25% fall with G-stage change, or ≥ 15/year).'
  }));
  card.appendChild(textInput({
    label: 'Previous eGFR sample date', section: 'renal', field: 'previousEgfrDate', type: 'date'
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Albuminuria (urine ACR)',
    description: 'Urine ACR sets the A-stage; a missing ACR raises a flag and blocks full KDIGO staging.'
  });
  card.appendChild(numberInput({
    label: 'Urine ACR (mg/mmol)', section: 'albuminuria', field: 'acr',
    min: 0, max: 3000, step: 0.1, placeholder: 'e.g. 40',
    hint: 'A1 < 3, A2 3–30, A3 > 30. ACR ≥ 70 raises a referral flag.'
  }));
  card.appendChild(textInput({
    label: 'ACR sample date', section: 'albuminuria', field: 'acrSampleDate', type: 'date'
  }));
  card.appendChild(selectInput({
    label: 'ACR measured this review', section: 'albuminuria', field: 'acrMeasured',
    options: YES_NO, hint: 'No raises a missing-ACR flag.'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Blood pressure',
    description: 'Best of repeated seated readings (mmHg). Target is 130/80 with diabetes or ACR ≥ 70, else 140/90.'
  });
  card.appendChild(numberInput({
    label: 'Systolic blood pressure (mmHg)', section: 'bloodPressure',
    field: 'systolicBloodPressure', min: 50, max: 300, step: 1, placeholder: 'e.g. 138'
  }));
  card.appendChild(numberInput({
    label: 'Diastolic blood pressure (mmHg)', section: 'bloodPressure',
    field: 'diastolicBloodPressure', min: 30, max: 200, step: 1, placeholder: 'e.g. 84'
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Medication review',
    description: 'RAAS blockade, SGLT2 inhibitor, statin, and the nephrotoxin check.'
  });
  card.appendChild(selectInput({
    label: 'ACEi / ARB prescribed', section: 'medication', field: 'aceiOrArbPrescribed',
    options: OPTIONS.aceiOrArbPrescribed
  }));
  card.appendChild(selectInput({
    label: 'SGLT2 inhibitor prescribed', section: 'medication', field: 'sglt2iPrescribed',
    options: OPTIONS.sglt2iPrescribed
  }));
  card.appendChild(selectInput({
    label: 'Statin prescribed', section: 'medication', field: 'statinPrescribed',
    options: OPTIONS.statinPrescribed
  }));
  card.appendChild(selectInput({
    label: 'Nephrotoxic drug present', section: 'medication', field: 'nephrotoxicDrugPresent',
    options: YES_NO, hint: 'e.g. NSAID or a renally-cleared agent.'
  }));
  card.appendChild(selectInput({
    label: 'Nephrotoxic drug dose-adjusted or held', section: 'medication',
    field: 'nephrotoxicDoseAdjusted', options: OPTIONS.nephrotoxicDoseAdjusted,
    hint: 'A present nephrotoxin not adjusted raises a high-priority flag.'
  }));
  card.appendChild(selectInput({
    label: 'Structured medication review completed', section: 'medication',
    field: 'medicationReviewCompleted', options: YES_NO
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Metabolic bloods',
    description: 'Potassium, haemoglobin, and CKD-MBD markers. Potassium and haemoglobin are the core bundle bloods.'
  });
  card.appendChild(numberInput({
    label: 'HbA1c (mmol/mol)', section: 'bloods', field: 'hba1c',
    min: 10, max: 200, step: 0.1, placeholder: 'e.g. 52'
  }));
  card.appendChild(numberInput({
    label: 'Potassium (mmol/L)', section: 'bloods', field: 'potassium',
    min: 1, max: 10, step: 0.1, placeholder: 'e.g. 4.6',
    hint: '≥ 6.0 raises a high-priority hyperkalaemia flag; 5.5–5.9 medium.'
  }));
  card.appendChild(numberInput({
    label: 'Bicarbonate (mmol/L)', section: 'bloods', field: 'bicarbonate',
    min: 1, max: 50, step: 0.1, placeholder: 'e.g. 24'
  }));
  card.appendChild(numberInput({
    label: 'Calcium (mmol/L)', section: 'bloods', field: 'calcium',
    min: 1, max: 5, step: 0.01, placeholder: 'e.g. 2.35'
  }));
  card.appendChild(numberInput({
    label: 'Phosphate (mmol/L)', section: 'bloods', field: 'phosphate',
    min: 0.1, max: 5, step: 0.01, placeholder: 'e.g. 1.10'
  }));
  card.appendChild(numberInput({
    label: 'PTH (pmol/L)', section: 'bloods', field: 'pth',
    min: 0, max: 200, step: 0.1, placeholder: 'e.g. 7.2'
  }));
  card.appendChild(numberInput({
    label: 'Haemoglobin (g/L)', section: 'bloods', field: 'haemoglobin',
    min: 20, max: 250, step: 1, placeholder: 'e.g. 132',
    hint: '< 110 raises an anaemia-of-CKD flag.'
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Referral and summary',
    description: 'Live KDIGO classification and review completeness, plus the referral decision and a clinician note.'
  });
  card.appendChild(readOnlyReadout({
    label: 'Live KDIGO classification and review completeness',
    id: 'live-summary-readout',
    render: () => renderLiveSummary()
  }));
  card.appendChild(selectInput({
    label: 'Referral decision', section: 'summary', field: 'referralDecision',
    options: OPTIONS.referralDecision
  }));
  card.appendChild(textArea({
    label: 'Clinician note (plan and recall interval)', section: 'summary',
    field: 'clinicalNote', rows: 5,
    placeholder: 'Free-text summary drawing the review together, with the plan and recall interval.'
  }));
  return card;
}

// ----------------------------------------------------------------------
// Live readout
// ----------------------------------------------------------------------

/** Render the live KDIGO / review summary. */
function renderLiveSummary() {
  const g = review(state);
  const documented = g.completenessScore;
  const total = g.componentStatuses.length;

  const gBadge = g.gfrCategory
    ? `<span class="risk-badge ${gfrCategoryClass(g.gfrCategory)}">${esc(gfrCategoryLabel(g.gfrCategory))}</span>`
    : `<span class="risk-badge">Not staged</span>`;
  const aBadge = g.albuminuriaCategory
    ? `<span class="risk-badge ${albuminuriaCategoryClass(g.albuminuriaCategory)}">${esc(albuminuriaCategoryLabel(g.albuminuriaCategory))}</span>`
    : `<span class="risk-badge">Not staged</span>`;
  const zoneBadge = g.kdigoRiskZone
    ? `<span class="risk-badge ${kdigoRiskZoneClass(g.kdigoRiskZone)}">${esc(kdigoRiskZoneLabel(g.kdigoRiskZone))}</span>`
    : `<span class="risk-badge">Not classified</span>`;
  const reviewBadge =
    `<span class="risk-badge ${reviewStatusClass(g.reviewStatus)}">${esc(reviewStatusLabel(g.reviewStatus))}</span>`;

  const bpt = g.bloodPressureTarget;
  const bpNote = g.bloodPressureAtTarget === null
    ? 'no blood pressure recorded'
    : g.bloodPressureAtTarget
    ? 'at target'
    : 'above target';

  return (
    `<div class="readout-line">G-stage ${gBadge} &nbsp; A-stage ${aBadge}</div>` +
    `<div class="readout-line">KDIGO zone ${zoneBadge} ` +
    `<span class="muted">(target ${bpt.systolic}/${bpt.diastolic}; ${esc(bpNote)})</span></div>` +
    `<div class="readout-line">Review ${reviewBadge} ` +
    `<span class="muted">(${documented} of ${total} bundle items; ` +
    `${g.flaggedIssues.length} flag${g.flaggedIssues.length === 1 ? '' : 's'})</span></div>`
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
  context: [['clinicianName'], ['clinicianRole'], ['reviewedAt'], ['careSetting'], ['reviewType']],
  patient: [['patientIdentifier'], ['ageBand'], ['sex'], ['diabetesStatus'], ['primaryCause'], ['monthsSinceDiagnosis']],
  renal: [['egfr'], ['egfrSampleDate'], ['previousEgfr', 'previousEgfrDate']],
  albuminuria: [['acr'], ['acrSampleDate'], ['acrMeasured']],
  bloodPressure: [['systolicBloodPressure', 'diastolicBloodPressure']],
  medication: [['aceiOrArbPrescribed'], ['sglt2iPrescribed'], ['statinPrescribed'], ['nephrotoxicDrugPresent', 'nephrotoxicDoseAdjusted'], ['medicationReviewCompleted']],
  bloods: [['hba1c'], ['potassium'], ['bicarbonate'], ['calcium'], ['phosphate'], ['pth'], ['haemoglobin']],
  summary: [['referralDecision'], ['clinicalNote']]
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
    gfrCategory, albuminuriaCategory, kdigoRiskZone, bloodPressureTarget,
    bloodPressureAtTarget, reviewStatus, completenessScore, componentStatuses,
    flaggedIssues, firedCriteria, timestamp
  } = lastResult;
  const documented = completenessScore;
  const total = componentStatuses.length;

  const notClassified = !kdigoRiskZone;

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

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No flags raised.</p>`
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

  const rulesList = `
    <ul class="flags">
      ${firedCriteria.map((r) => `
        <li>
          <span class="flag-category">${esc(r.section)}</span>
          <span class="flag-message">${esc(r.description)}</span>
        </li>
      `).join('')}
    </ul>
  `;

  const zoneAdvice = notClassified
    ? `<p>KDIGO risk zone could not be classified — both eGFR and urine ACR are needed. Record the missing measurement to complete staging.</p>`
    : kdigoRiskZone === 'very-high'
    ? `<p>The patient is in the <strong>very-high</strong> KDIGO risk zone. Consider or arrange <strong>nephrology referral</strong> and increase monitoring frequency.</p>`
    : kdigoRiskZone === 'high'
    ? `<p>The patient is in the <strong>high</strong> KDIGO risk zone. Increase monitoring, review medication, and consider referral if progressing.</p>`
    : kdigoRiskZone === 'moderate'
    ? `<p>The patient is in the <strong>moderate</strong> KDIGO risk zone. Increase monitoring frequency and optimise blood pressure and cardiovascular risk.</p>`
    : `<p>The patient is in the <strong>low</strong> KDIGO risk zone. Routine primary-care monitoring; an annual review is sufficient.</p>`;

  const reviewAdvice = reviewStatus === 'complete'
    ? `<p>All ${total} core review bundle items are recorded.</p>`
    : reviewStatus === 'incomplete'
    ? `<p>The review is <strong>incomplete</strong> — eGFR is missing or two or more bundle items are outstanding, so the review cannot be reliably classified.</p>`
    : `<p><strong>${total - documented}</strong> bundle item(s) remain outstanding — complete them for a whole annual review.</p>`;

  const bpNote = bloodPressureAtTarget === null
    ? 'no blood pressure recorded'
    : bloodPressureAtTarget
    ? 'recorded blood pressure is at target'
    : 'recorded blood pressure is above target';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Chronic Kidney Disease Annual Review Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${notClassified ? '' : kdigoRiskZoneClass(kdigoRiskZone)}">
        <div>
          <span class="risk-banner-label">KDIGO risk zone</span>
          <span class="risk-banner-value">${notClassified ? 'Not classified' : esc(kdigoRiskZoneLabel(kdigoRiskZone))}</span>
        </div>
        <span class="risk-badge ${gfrCategoryClass(gfrCategory)}">${esc(gfrCategoryLabel(gfrCategory))}</span>
        <span class="risk-badge ${albuminuriaCategoryClass(albuminuriaCategory)}">${esc(albuminuriaCategoryLabel(albuminuriaCategory))}</span>
      </div>

      <div class="risk-banner ${reviewStatusClass(reviewStatus)}">
        <div>
          <span class="risk-banner-label">Review completeness</span>
          <span class="risk-banner-value">${esc(reviewStatusLabel(reviewStatus))}</span>
        </div>
        <span class="risk-badge ${reviewStatusClass(reviewStatus)}">${documented} of ${total} bundle items</span>
      </div>

      <h3>KDIGO staging</h3>
      <p>
        GFR category <strong>${esc(gfrCategoryLabel(gfrCategory))}</strong>;
        albuminuria category <strong>${esc(albuminuriaCategoryLabel(albuminuriaCategory))}</strong>;
        combined KDIGO risk zone <strong>${notClassified ? 'not classified' : esc(kdigoRiskZoneLabel(kdigoRiskZone))}</strong>.
      </p>
      ${zoneAdvice}

      <h3>Blood-pressure target</h3>
      <p>
        Applicable target <strong>${bloodPressureTarget.systolic}/${bloodPressureTarget.diastolic}</strong> mmHg —
        ${esc(bpNote)}.
      </p>

      <h3>Review completeness</h3>
      ${reviewAdvice}
      <table class="subscales">
        <thead>
          <tr><th scope="col">Review component</th><th scope="col">Status</th></tr>
        </thead>
        <tbody>${componentRows}</tbody>
      </table>

      <h3>Flags (${flaggedIssues.length})</h3>
      ${flagsList}

      <h3>Fired criteria</h3>
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
  { step: 1, section: 'context',       title: 'Context' },
  { step: 2, section: 'patient',       title: 'Patient' },
  { step: 3, section: 'renal',         title: 'eGFR' },
  { step: 4, section: 'albuminuria',   title: 'ACR' },
  { step: 5, section: 'bloodPressure', title: 'Blood pressure' },
  { step: 6, section: 'medication',    title: 'Medication' },
  { step: 7, section: 'bloods',        title: 'Bloods' },
  { step: 8, section: 'summary',       title: 'Summary' }
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
