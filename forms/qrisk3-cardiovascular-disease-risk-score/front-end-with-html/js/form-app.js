import { detectFlaggedIssues } from './flags.js';
import { calculateQrisk3Grade } from './grader.js';
import { emptyAssessment, priorityLabel, riskBandClass, riskBandLabel } from './types.js';

// QRISK3 Cardiovascular Disease Risk Score — clinician wizard (vanilla
// JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// 10-year CVD risk percentage updates as the model inputs are entered.
// Submission runs the pure representative scoring engine (linear predictor ->
// 10-year risk %, risk band, heart age, flagged issues) and renders an inline
// report. State is persisted to localStorage so a partial fill survives a
// page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'qrisk3-cardiovascular-disease-risk-score.front-end-with-html.v1';

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
  slug: 'qrisk3-cardiovascular-disease-risk-score',
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
    refreshLiveRisk();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 8;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-risk readout after each change.
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
  refreshLiveRisk();
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
// Section renderers (1 per QRISK3 step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, and in which care setting.'
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
      { value: 'gp', label: 'General practitioner' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'pharmacist', label: 'Pharmacist' },
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
      { value: 'general-practice', label: 'General practice' },
      { value: 'pharmacy', label: 'Community pharmacy' },
      { value: 'nhs-health-check', label: 'NHS Health Check' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier and demographics. QRISK3 is validated for adults aged 25-84.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. NHS number or practice ID'
  }));
  card.appendChild(textInput({
    label: 'Age',
    section: 'identification', field: 'age',
    type: 'number', min: 18, max: 110, step: 1, unit: 'years', required: true,
    hint: 'QRISK3 is valid for ages 25-84.'
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'identification', field: 'sex', required: true,
    hint: 'Selects the sex-specific QRISK3 model.',
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Ethnicity',
    section: 'identification', field: 'ethnicity',
    options: [
      { value: 'white-or-not-stated', label: 'White or not stated' },
      { value: 'indian', label: 'Indian' },
      { value: 'pakistani', label: 'Pakistani' },
      { value: 'bangladeshi', label: 'Bangladeshi' },
      { value: 'other-asian', label: 'Other Asian' },
      { value: 'black-caribbean', label: 'Black Caribbean' },
      { value: 'black-african', label: 'Black African' },
      { value: 'chinese', label: 'Chinese' },
      { value: 'other', label: 'Other ethnic group' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Postcode',
    section: 'identification', field: 'postcode',
    placeholder: 'e.g. LS1 4DY (used to derive Townsend score)'
  }));
  card.appendChild(textInput({
    label: 'Townsend deprivation score (optional)',
    section: 'identification', field: 'townsendScore',
    type: 'number', min: -8, max: 12, step: 0.1,
    hint: 'Derived from postcode. Leave blank to use the cohort mean (0).'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Eligibility',
    description: 'QRISK3 is for primary prevention only. These answers are not model inputs.'
  });

  card.appendChild(radioGroup({
    label: 'Established cardiovascular disease (previous MI, angina, stroke, or TIA)?',
    section: 'eligibility', field: 'hasEstablishedCvd', options: yesNo, required: true
  }));
  card.appendChild(radioGroup({
    label: 'Familial hypercholesterolaemia (FH)?',
    section: 'eligibility', field: 'hasFamilialHypercholesterolaemia', options: yesNo, required: true
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Lifestyle',
    description: 'Smoking status and body-mass index.'
  });

  card.appendChild(selectInput({
    label: 'Smoking status',
    section: 'lifestyle', field: 'smokingStatus',
    options: [
      { value: 'non', label: 'Non-smoker' },
      { value: 'ex', label: 'Ex-smoker' },
      { value: 'light', label: 'Light smoker (< 10/day)' },
      { value: 'moderate', label: 'Moderate smoker (10-19/day)' },
      { value: 'heavy', label: 'Heavy smoker (>= 20/day)' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Body mass index (BMI)',
    section: 'lifestyle', field: 'bodyMassIndex',
    type: 'number', min: 10, max: 70, step: 0.1, unit: 'kg/m²', required: true,
    hint: 'Weight (kg) divided by height (m) squared.'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Cardiometabolic measurements',
    description: 'Diabetes, lipids, and blood pressure.'
  });

  card.appendChild(selectInput({
    label: 'Diabetes status',
    section: 'cardiometabolic', field: 'diabetesStatus',
    options: [
      { value: 'none', label: 'No diabetes' },
      { value: 'type1', label: 'Type 1 diabetes' },
      { value: 'type2', label: 'Type 2 diabetes' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Total-cholesterol : HDL ratio',
    section: 'cardiometabolic', field: 'cholesterolHdlRatio',
    type: 'number', min: 1, max: 12, step: 0.1, required: true,
    hint: 'Total cholesterol divided by HDL cholesterol.'
  }));
  card.appendChild(textInput({
    label: 'Systolic blood pressure',
    section: 'cardiometabolic', field: 'systolicBloodPressure',
    type: 'number', min: 70, max: 250, step: 1, unit: 'mmHg', required: true,
    hint: 'Mean of recent readings.'
  }));
  card.appendChild(textInput({
    label: 'Systolic BP standard deviation',
    section: 'cardiometabolic', field: 'systolicBloodPressureSd',
    type: 'number', min: 0, max: 40, step: 0.1, unit: 'mmHg',
    hint: 'Visit-to-visit variability (SD of at least two readings). Optional.'
  }));
  card.appendChild(radioGroup({
    label: 'On blood-pressure treatment?',
    section: 'cardiometabolic', field: 'onBloodPressureTreatment', options: yesNo
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Comorbidities',
    description: 'Family history and conditions that raise cardiovascular risk.'
  });

  card.appendChild(radioGroup({
    label: 'Family history of coronary heart disease in a first-degree relative under 60?',
    section: 'comorbidities', field: 'familyHistoryChd', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Atrial fibrillation?',
    section: 'comorbidities', field: 'atrialFibrillation', options: yesNo
  }));
  card.appendChild(selectInput({
    label: 'Chronic kidney disease stage',
    section: 'comorbidities', field: 'chronicKidneyDiseaseStage',
    options: [
      { value: 'none', label: 'No CKD' },
      { value: 'stage3', label: 'CKD stage 3' },
      { value: 'stage4', label: 'CKD stage 4' },
      { value: 'stage5', label: 'CKD stage 5' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Migraine?',
    section: 'comorbidities', field: 'migraine', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Rheumatoid arthritis?',
    section: 'comorbidities', field: 'rheumatoidArthritis', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Systemic lupus erythematosus (SLE)?',
    section: 'comorbidities', field: 'systemicLupusErythematosus', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Severe mental illness?',
    section: 'comorbidities', field: 'severeMentalIllness', options: yesNo
  }));

  // Erectile dysfunction — relevant to the male model only.
  const edHost = document.createElement('div');
  edHost.dataset.conditional = 'identification.sex=male';
  edHost.appendChild(radioGroup({
    label: 'Erectile dysfunction? (men only)',
    section: 'comorbidities', field: 'erectileDysfunction', options: yesNo
  }));
  card.appendChild(edHost);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Medication',
    description: 'Medications associated with raised cardiovascular risk.'
  });

  card.appendChild(radioGroup({
    label: 'On atypical antipsychotics?',
    section: 'medication', field: 'onAtypicalAntipsychotics', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'On regular oral corticosteroids?',
    section: 'medication', field: 'onCorticosteroids', options: yesNo
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Summary and result',
    description: 'Live 10-year CVD risk and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live 10-year CVD risk',
    id: 'live-risk-readout',
    render: () => renderLiveRisk()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: discussion, shared decision, and any lifestyle or prescribing actions.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readout
// ----------------------------------------------------------------------

/** Render the live 10-year risk %, band badge, and heart age. */
function renderLiveRisk() {
  const grade = calculateQrisk3Grade(state);
  if (!grade.computable) {
    return '<span class="muted">Enter age, sex, BMI, cholesterol : HDL ratio and systolic BP to compute the risk.</span>';
  }
  const badge =
    `<span class="risk-badge ${riskBandClass(grade.riskBand)}">${esc(riskBandLabel(grade.riskBand))}</span>`;
  const heart = grade.heartAge !== null
    ? ` <span class="muted">Heart age ~${grade.heartAge} years</span>`
    : '';
  return `<strong>${grade.tenYearRiskPercent}%</strong> ${badge}${heart}`;
}

function refreshLiveRisk() {
  const live = document.getElementById('live-risk-readout');
  if (live) live.innerHTML = renderLiveRisk();
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
  context: [['clinicianName'], ['clinicianRole'], ['careSetting']],
  identification: [['patientIdentifier'], ['age'], ['sex'], ['ethnicity']],
  eligibility: [['hasEstablishedCvd'], ['hasFamilialHypercholesterolaemia']],
  lifestyle: [['smokingStatus'], ['bodyMassIndex']],
  cardiometabolic: [['diabetesStatus'], ['cholesterolHdlRatio'], ['systolicBloodPressure'], ['onBloodPressureTreatment']],
  comorbidities: [['familyHistoryChd'], ['atrialFibrillation'], ['chronicKidneyDiseaseStage']],
  medication: [['onAtypicalAntipsychotics'], ['onCorticosteroids']],
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
    linearPredictor, tenYearRiskPercent, riskBand, heartAge,
    computable, contributions, flaggedIssues, timestamp
  } = lastResult;

  const riskDisplay = computable ? `${tenYearRiskPercent}%` : 'Not computable';
  const heartDisplay = heartAge !== null ? `${heartAge} years` : 'Not available';

  const contributionRows = contributions
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .map((c) => `
      <tr>
        <th scope="row">${esc(c.factor)}</th>
        <td>${esc(c.value)}</td>
        <td class="num"><span class="grade-pill">${c.weight >= 0 ? '+' : ''}${c.weight.toFixed(3)}</span></td>
      </tr>
    `).join('');

  const contributionTable = contributions.length === 0
    ? `<p class="muted">No model inputs recorded yet.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Factor</th>
            <th scope="col">Value</th>
            <th scope="col">Weight</th>
          </tr>
        </thead>
        <tbody>${contributionRows}</tbody>
        <tfoot>
          <tr>
            <th scope="row">Linear predictor</th>
            <td></td>
            <td class="num"><span class="grade-pill">${linearPredictor.toFixed(3)}</span></td>
          </tr>
        </tfoot>
      </table>
    `;

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

  let recommendation;
  if (!computable) {
    recommendation = `<p>The 10-year risk could not be computed because one or more required inputs (age, sex, BMI, cholesterol : HDL ratio, systolic blood pressure) are missing. Record the missing measurements and re-calculate.</p>`;
  } else if (riskBand === 'low') {
    recommendation = `<p>The estimated 10-year CVD risk is <strong>below the 10% NICE threshold</strong>. Reinforce lifestyle measures and reassess per local policy (typically every 5 years). A low score does not exclude future risk.</p>`;
  } else {
    recommendation = `<p>The estimated 10-year CVD risk <strong>meets or exceeds the 10% NICE threshold</strong>. Offer a statin (atorvastatin 20 mg) for primary prevention after informed discussion, alongside structured lifestyle advice.${riskBand === 'high' ? ' This is in the high band (>= 20%) — prioritise the statin offer and intensive lifestyle optimisation.' : ''}</p>`;
  }

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>QRISK3 Cardiovascular Risk Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${riskBandClass(riskBand)}">
        <div>
          <span class="risk-banner-label">10-year CVD risk</span>
          <span class="risk-banner-value">${esc(riskDisplay)}</span>
        </div>
        <span class="risk-badge ${riskBandClass(riskBand)}">${esc(riskBandLabel(riskBand))}</span>
      </div>

      <h3>Key figures</h3>
      <div class="class-row">
        <div class="class-card">
          <span class="class-label">10-year CVD risk</span>
          <span class="class-value">${esc(riskDisplay)}</span>
        </div>
        <div class="class-card">
          <span class="class-label">Heart age (est.)</span>
          <span class="class-value">${esc(heartDisplay)}</span>
        </div>
        <div class="class-card">
          <span class="class-label">Risk band</span>
          <span class="class-value">${esc(riskBandLabel(riskBand))}</span>
        </div>
      </div>

      <p class="disclaimer">
        <strong>Representative model.</strong> This score uses a documented
        approximation in the shape of QRISK3, not the official QRISK3-2017
        algorithm. It is for demonstration only and must not drive real
        prescribing decisions.
      </p>

      <h3>Recommended action</h3>
      ${recommendation}

      <h3>Weighted contributions</h3>
      ${contributionTable}

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
  const grade = calculateQrisk3Grade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade.tenYearRiskPercent);
  lastResult = {
    linearPredictor: grade.linearPredictor,
    tenYearRiskPercent: grade.tenYearRiskPercent,
    riskBand: grade.riskBand,
    heartAge: grade.heartAge,
    computable: grade.computable,
    contributions: grade.contributions,
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
  refreshLiveRisk();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',         title: 'Context' },
  { step: 2, section: 'identification',  title: 'Patient' },
  { step: 3, section: 'eligibility',     title: 'Eligibility' },
  { step: 4, section: 'lifestyle',       title: 'Lifestyle' },
  { step: 5, section: 'cardiometabolic', title: 'Cardiometabolic' },
  { step: 6, section: 'comorbidities',   title: 'Comorbidities' },
  { step: 7, section: 'medication',      title: 'Medication' },
  { step: 8, section: 'note',            title: 'Summary' }
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
  refreshLiveRisk();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
