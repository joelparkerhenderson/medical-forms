import { calculateRisk } from './risk-grader.js';
import { calculateBmi, emptyAssessment, riskCategoryClass, riskCategoryLabel } from './types.js';

// Predicting Risk of Cardiovascular Disease Events (PREVENT) - patient
// wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress bar + step list reflects how many fields have been answered.
// Submission runs the pure PREVENT scoring engine and renders an inline
// report. State is persisted to localStorage so a partial fill survives a
// page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'predicting-risk-of-cardiovascular-disease-events.front-end-form-with-html.v1';

const TOTAL_STEPS = 10;

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
  slug: 'predicting-risk-of-cardiovascular-disease-events',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    updateConditionalSections();
    refreshAutoCalculatedReadouts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs derived values, progress, and conditional visibility.
 */
function setField(section, field, value) {
  state[section][field] = value;
  recomputeDerived();
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
}

/** Recompute auto-calculated values that depend on other fields. */
function recomputeDerived() {
  // If user has not entered a BMI directly, calculate from height/weight.
  // We always populate `metabolicHealth.bmi` if both inputs exist and the
  // user hasn't supplied a manual value (manual entry overrides).
  const mh = state.metabolicHealth;
  if (mh.bmi === null) {
    const auto = calculateBmi(state.demographics.heightCm, state.demographics.weightKg);
    if (auto !== null) mh.bmi = auto;
  }
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

function lilyInputClass(type) {
  switch (type) {
    case 'email':  return 'email-input';
    case 'number': return 'number-input';
    case 'date':   return 'date-input';
    case 'time':   return 'time-input';
    case 'tel':    return 'tel-input';
    case 'url':    return 'url-input';
    case 'search': return 'search-input';
    default:       return 'text-input';
  }
}

function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${lilyInputClass(type)}"`,
    `value="${esc(value ?? '')}"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;

  const input = wrapper.querySelector('input');
  input.setAttribute('aria-describedby', `${id}-error`);
  input.addEventListener('input', () => {
    let v = input.value;
    if (type === 'number') v = v === '' ? null : Number(v);
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
    <span class="error-message" id="${id}-error"></span>
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
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error">
      ${optionsHtml}
    </select>
    <span class="error-message" id="${id}-error"></span>
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
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}>
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

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = `${groupId}-error`;
  wrapper.appendChild(errSpan);
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
  legend.innerHTML = `
    <span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>
    <h2 class="section-title">${esc(opts.title)}</h2>
    ${desc}
  `;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Section renderers (1 per PREVENT step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Patient Information',
    description: 'Basic patient identification details.'
  });

  card.appendChild(textInput({
    label: 'Full Name', section: 'patientInformation', field: 'fullName', required: true
  }));
  card.appendChild(textInput({
    label: 'Date of Birth', section: 'patientInformation', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  card.appendChild(textInput({
    label: 'NHS Number', section: 'patientInformation', field: 'nhsNumber',
    placeholder: 'e.g. 123 456 7890'
  }));
  card.appendChild(textInput({
    label: 'Address', section: 'patientInformation', field: 'address',
    placeholder: 'Full postal address'
  }));

  const contact = document.createElement('div');
  contact.className = 'two-col';
  contact.appendChild(textInput({
    label: 'Telephone', section: 'patientInformation', field: 'telephone',
    placeholder: 'e.g. 07700 900000'
  }));
  contact.appendChild(textInput({
    label: 'Email', section: 'patientInformation', field: 'email',
    type: 'email', placeholder: 'patient@example.com'
  }));
  card.appendChild(contact);

  const gp = document.createElement('div');
  gp.className = 'two-col';
  gp.appendChild(textInput({
    label: 'GP Name', section: 'patientInformation', field: 'gpName'
  }));
  gp.appendChild(textInput({
    label: 'GP Practice', section: 'patientInformation', field: 'gpPractice'
  }));
  card.appendChild(gp);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Demographics',
    description: 'Age, sex, and body measurements used in risk calculation.'
  });

  card.appendChild(textInput({
    label: 'Age', section: 'demographics', field: 'age',
    type: 'number', min: 18, max: 120, unit: 'years', required: true
  }));

  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'demographics', field: 'sex',
    required: true,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Ethnicity',
    section: 'demographics', field: 'ethnicity',
    options: [
      { value: 'white', label: 'White' },
      { value: 'black', label: 'Black / African American' },
      { value: 'hispanic', label: 'Hispanic / Latino' },
      { value: 'asian', label: 'Asian' },
      { value: 'native', label: 'Native American / Pacific Islander' },
      { value: 'mixed', label: 'Mixed / Multiple' },
      { value: 'other', label: 'Other' }
    ]
  }));

  const measurements = document.createElement('div');
  measurements.className = 'two-col';
  measurements.appendChild(textInput({
    label: 'Height', section: 'demographics', field: 'heightCm',
    type: 'number', min: 50, max: 250, step: 0.1, unit: 'cm'
  }));
  measurements.appendChild(textInput({
    label: 'Weight', section: 'demographics', field: 'weightKg',
    type: 'number', min: 20, max: 400, step: 0.1, unit: 'kg'
  }));
  card.appendChild(measurements);

  card.appendChild(textInput({
    label: 'ZIP / Postal Code', section: 'demographics', field: 'zipCode',
    placeholder: 'e.g. 10001 or SW1A 1AA'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Blood Pressure',
    description: 'Blood pressure readings and antihypertensive treatment status.'
  });

  const bp = document.createElement('div');
  bp.className = 'two-col';
  bp.appendChild(textInput({
    label: 'Systolic BP', section: 'bloodPressure', field: 'systolicBp',
    type: 'number', min: 60, max: 300, unit: 'mmHg', required: true
  }));
  bp.appendChild(textInput({
    label: 'Diastolic BP', section: 'bloodPressure', field: 'diastolicBp',
    type: 'number', min: 30, max: 200, unit: 'mmHg', required: true
  }));
  card.appendChild(bp);

  card.appendChild(radioGroup({
    label: 'On antihypertensive medication?',
    section: 'bloodPressure', field: 'onAntihypertensive', options: yesNo
  }));

  const numMeds = document.createElement('div');
  numMeds.dataset.conditional = 'bloodPressure.onAntihypertensive=yes';
  numMeds.appendChild(textInput({
    label: 'Number of BP medications',
    section: 'bloodPressure', field: 'numberOfBpMedications',
    type: 'number', min: 1, max: 10
  }));
  card.appendChild(numMeds);

  card.appendChild(radioGroup({
    label: 'Blood pressure at target?',
    section: 'bloodPressure', field: 'bpAtTarget',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Cholesterol & Lipids',
    description: 'Lipid panel values and statin treatment status.'
  });

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(textInput({
    label: 'Total Cholesterol', section: 'cholesterolLipids', field: 'totalCholesterol',
    type: 'number', min: 50, max: 500, step: 1, unit: 'mg/dL'
  }));
  row1.appendChild(textInput({
    label: 'HDL Cholesterol', section: 'cholesterolLipids', field: 'hdlCholesterol',
    type: 'number', min: 10, max: 200, step: 1, unit: 'mg/dL'
  }));
  card.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'two-col';
  row2.appendChild(textInput({
    label: 'LDL Cholesterol', section: 'cholesterolLipids', field: 'ldlCholesterol',
    type: 'number', min: 10, max: 400, step: 1, unit: 'mg/dL'
  }));
  row2.appendChild(textInput({
    label: 'Triglycerides', section: 'cholesterolLipids', field: 'triglycerides',
    type: 'number', min: 10, max: 1000, step: 1, unit: 'mg/dL'
  }));
  card.appendChild(row2);

  card.appendChild(textInput({
    label: 'Non-HDL Cholesterol', section: 'cholesterolLipids', field: 'nonHdlCholesterol',
    type: 'number', min: 10, max: 500, step: 1, unit: 'mg/dL'
  }));

  card.appendChild(radioGroup({
    label: 'On statin therapy?',
    section: 'cholesterolLipids', field: 'onStatin', options: yesNo
  }));

  const statinName = document.createElement('div');
  statinName.dataset.conditional = 'cholesterolLipids.onStatin=yes';
  statinName.appendChild(textInput({
    label: 'Statin name',
    section: 'cholesterolLipids', field: 'statinName',
    placeholder: 'e.g. Atorvastatin 20 mg'
  }));
  card.appendChild(statinName);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Metabolic Health',
    description: 'Diabetes status, HbA1c, glucose, BMI, and waist circumference.'
  });

  card.appendChild(radioGroup({
    label: 'Has diabetes?',
    section: 'metabolicHealth', field: 'hasDiabetes',
    required: true, options: yesNo
  }));

  const diabType = document.createElement('div');
  diabType.dataset.conditional = 'metabolicHealth.hasDiabetes=yes';
  diabType.appendChild(selectInput({
    label: 'Diabetes type',
    section: 'metabolicHealth', field: 'diabetesType',
    options: [
      { value: 'type1', label: 'Type 1' },
      { value: 'type2', label: 'Type 2' },
      { value: 'gestational', label: 'Gestational' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(diabType);

  const hba1cRow = document.createElement('div');
  hba1cRow.className = 'two-col';
  hba1cRow.appendChild(textInput({
    label: 'HbA1c value', section: 'metabolicHealth', field: 'hba1cValue',
    type: 'number', min: 2, max: 200, step: 0.1
  }));
  hba1cRow.appendChild(selectInput({
    label: 'HbA1c unit', section: 'metabolicHealth', field: 'hba1cUnit',
    options: [
      { value: 'percent', label: '% (NGSP/DCCT)' },
      { value: 'mmolMol', label: 'mmol/mol (IFCC)' }
    ]
  }));
  card.appendChild(hba1cRow);

  card.appendChild(textInput({
    label: 'Fasting glucose', section: 'metabolicHealth', field: 'fastingGlucose',
    type: 'number', min: 30, max: 600, step: 1, unit: 'mg/dL'
  }));

  const bmiRow = document.createElement('div');
  bmiRow.className = 'two-col';
  bmiRow.appendChild(textInput({
    label: 'BMI', section: 'metabolicHealth', field: 'bmi',
    type: 'number', min: 10, max: 80, step: 0.1, unit: 'kg/m²'
  }));
  bmiRow.appendChild(textInput({
    label: 'Waist circumference', section: 'metabolicHealth', field: 'waistCircumferenceCm',
    type: 'number', min: 40, max: 200, step: 0.1, unit: 'cm'
  }));
  card.appendChild(bmiRow);

  card.appendChild(readOnlyReadout({
    label: 'BMI from height/weight',
    id: 'bmi-readout',
    render: () => {
      const auto = calculateBmi(state.demographics.heightCm, state.demographics.weightKg);
      if (auto === null) return '<span class="muted">Auto-calculated when height and weight provided</span>';
      return `<strong>${auto}</strong> <span class="muted">kg/m²</span>`;
    }
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Renal Function',
    description: 'Kidney function markers used in PREVENT risk estimation.'
  });

  card.appendChild(textInput({
    label: 'eGFR', section: 'renalFunction', field: 'egfr',
    type: 'number', min: 1, max: 200, step: 1, unit: 'mL/min/1.73m²'
  }));
  card.appendChild(textInput({
    label: 'Creatinine', section: 'renalFunction', field: 'creatinine',
    type: 'number', min: 0.1, max: 30, step: 0.1, unit: 'mg/dL'
  }));
  card.appendChild(textInput({
    label: 'Urine ACR', section: 'renalFunction', field: 'urineAcr',
    type: 'number', min: 0, max: 5000, step: 1, unit: 'mg/g'
  }));
  card.appendChild(selectInput({
    label: 'CKD stage', section: 'renalFunction', field: 'ckdStage',
    options: [
      { value: '1', label: 'Stage 1 (eGFR ≥ 90)' },
      { value: '2', label: 'Stage 2 (eGFR 60-89)' },
      { value: '3a', label: 'Stage 3a (eGFR 45-59)' },
      { value: '3b', label: 'Stage 3b (eGFR 30-44)' },
      { value: '4', label: 'Stage 4 (eGFR 15-29)' },
      { value: '5', label: 'Stage 5 (eGFR < 15)' }
    ]
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Smoking History',
    description: 'Smoking status is a major modifiable CVD risk factor.'
  });

  card.appendChild(selectInput({
    label: 'Smoking status',
    section: 'smokingHistory', field: 'smokingStatus',
    options: [
      { value: 'never', label: 'Never smoked' },
      { value: 'current', label: 'Current smoker' },
      { value: 'former', label: 'Former smoker' }
    ]
  }));

  const currentDetails = document.createElement('div');
  currentDetails.dataset.conditional = 'smokingHistory.smokingStatus=current';
  currentDetails.appendChild(textInput({
    label: 'Cigarettes per day',
    section: 'smokingHistory', field: 'cigarettesPerDay',
    type: 'number', min: 1, max: 100
  }));
  currentDetails.appendChild(textInput({
    label: 'Years smoked',
    section: 'smokingHistory', field: 'yearsSmoked',
    type: 'number', min: 1, max: 80, unit: 'years'
  }));
  card.appendChild(currentDetails);

  const formerDetails = document.createElement('div');
  formerDetails.dataset.conditional = 'smokingHistory.smokingStatus=former';
  formerDetails.appendChild(textInput({
    label: 'Years smoked',
    section: 'smokingHistory', field: 'yearsSmoked',
    type: 'number', min: 1, max: 80, unit: 'years'
  }));
  formerDetails.appendChild(textInput({
    label: 'Years since quit',
    section: 'smokingHistory', field: 'yearsSinceQuit',
    type: 'number', min: 0, max: 80, unit: 'years'
  }));
  card.appendChild(formerDetails);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Medical History',
    description: 'Existing cardiovascular conditions and family history.'
  });

  card.appendChild(radioGroup({
    label: 'Has known cardiovascular disease?',
    section: 'medicalHistory', field: 'hasKnownCvd',
    required: true, options: yesNo
  }));

  const cvdDetails = document.createElement('div');
  cvdDetails.dataset.conditional = 'medicalHistory.hasKnownCvd=yes';
  cvdDetails.className = 'conditional-block';

  const cvdNote = document.createElement('p');
  cvdNote.className = 'inline-warning';
  cvdNote.textContent =
    'Note: PREVENT is designed for primary prevention only. Known CVD will be flagged.';
  cvdDetails.appendChild(cvdNote);

  cvdDetails.appendChild(radioGroup({
    label: 'Previous myocardial infarction (MI)?',
    section: 'medicalHistory', field: 'previousMi', options: yesNo
  }));
  cvdDetails.appendChild(radioGroup({
    label: 'Previous stroke?',
    section: 'medicalHistory', field: 'previousStroke', options: yesNo
  }));
  cvdDetails.appendChild(radioGroup({
    label: 'Heart failure?',
    section: 'medicalHistory', field: 'heartFailure', options: yesNo
  }));
  cvdDetails.appendChild(radioGroup({
    label: 'Peripheral arterial disease?',
    section: 'medicalHistory', field: 'peripheralArterialDisease', options: yesNo
  }));
  card.appendChild(cvdDetails);

  card.appendChild(radioGroup({
    label: 'Atrial fibrillation?',
    section: 'medicalHistory', field: 'atrialFibrillation', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Family history of premature CVD?',
    section: 'medicalHistory', field: 'familyCvdHistory', options: yesNo
  }));

  const familyDetails = document.createElement('div');
  familyDetails.dataset.conditional = 'medicalHistory.familyCvdHistory=yes';
  familyDetails.appendChild(textArea({
    label: 'Family CVD details',
    section: 'medicalHistory', field: 'familyCvdDetails',
    placeholder: 'Please describe affected family members and conditions',
    rows: 3
  }));
  card.appendChild(familyDetails);

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Current Medications',
    description: 'Current cardiovascular and metabolic medications.'
  });

  card.appendChild(radioGroup({
    label: 'On antihypertensive medication?',
    section: 'currentMedications', field: 'onAntihypertensiveDetail', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'On statin therapy?',
    section: 'currentMedications', field: 'onStatinDetail', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'On aspirin?',
    section: 'currentMedications', field: 'onAspirin', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'On anticoagulant?',
    section: 'currentMedications', field: 'onAnticoagulant', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'On diabetes medication?',
    section: 'currentMedications', field: 'onDiabetesMedication', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Other medications',
    section: 'currentMedications', field: 'otherMedications',
    placeholder: 'List any other current medications',
    rows: 3
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Review & Calculate',
    description: 'Review the assessment summary and submit for risk calculation.'
  });

  card.appendChild(selectInput({
    label: 'PREVENT model type',
    section: 'reviewCalculate', field: 'modelType',
    options: [
      { value: 'base', label: 'Base Model (without HbA1c/uACR)' },
      { value: 'full', label: 'Full Model (with HbA1c and uACR)' }
    ]
  }));

  const clinRow = document.createElement('div');
  clinRow.className = 'two-col';
  clinRow.appendChild(textInput({
    label: 'Clinician name', section: 'reviewCalculate', field: 'clinicianName'
  }));
  clinRow.appendChild(textInput({
    label: 'Review date', section: 'reviewCalculate', field: 'reviewDate', type: 'date'
  }));
  card.appendChild(clinRow);

  card.appendChild(textArea({
    label: 'Clinical notes',
    section: 'reviewCalculate', field: 'clinicalNotes',
    placeholder: 'Any additional clinical observations or context',
    rows: 4
  }));

  // Live summary readout
  const summary = document.createElement('div');
  summary.className = 'assessment-summary';
  summary.id = 'assessment-summary';
  summary.innerHTML = renderSummaryHtml();
  card.appendChild(summary);

  return card;
}

function renderSummaryHtml() {
  const data = state;
  const fmt = (v, suffix) =>
    v === null || v === undefined || v === '' ? 'N/A' : `${v}${suffix || ''}`;
  return `
    <h3>Assessment summary</h3>
    <div class="summary-grid">
      <div><span class="summary-label">Patient:</span> ${esc(data.patientInformation.fullName || 'Not provided')}</div>
      <div><span class="summary-label">Age / Sex:</span> ${esc(fmt(data.demographics.age))} / ${esc(data.demographics.sex || 'N/A')}</div>
      <div><span class="summary-label">Systolic BP:</span> ${esc(fmt(data.bloodPressure.systolicBp, ' mmHg'))}</div>
      <div><span class="summary-label">Total cholesterol:</span> ${esc(fmt(data.cholesterolLipids.totalCholesterol, ' mg/dL'))}</div>
      <div><span class="summary-label">HDL cholesterol:</span> ${esc(fmt(data.cholesterolLipids.hdlCholesterol, ' mg/dL'))}</div>
      <div><span class="summary-label">Diabetes:</span> ${esc(data.metabolicHealth.hasDiabetes || 'N/A')}</div>
      <div><span class="summary-label">Smoking:</span> ${esc(data.smokingHistory.smokingStatus || 'N/A')}</div>
      <div><span class="summary-label">eGFR:</span> ${esc(fmt(data.renalFunction.egfr, ' mL/min'))}</div>
      <div><span class="summary-label">BMI:</span> ${esc(fmt(data.metabolicHealth.bmi))}</div>
      <div><span class="summary-label">Known CVD:</span> ${esc(data.medicalHistory.hasKnownCvd || 'N/A')}</div>
    </div>
  `;
}

function refreshSummary() {
  const el = document.getElementById('assessment-summary');
  if (el) el.innerHTML = renderSummaryHtml();
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
  renderStep6, renderStep7, renderStep8, renderStep9, renderStep10
];

// ----------------------------------------------------------------------
// Conditional sections + auto-calculated readouts
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

function refreshAutoCalculatedReadouts() {
  const bmi = document.getElementById('bmi-readout');
  if (bmi) {
    const auto = calculateBmi(state.demographics.heightCm, state.demographics.weightKg);
    bmi.innerHTML = auto === null
      ? '<span class="muted">Auto-calculated when height and weight provided</span>'
      : `<strong>${auto}</strong> <span class="muted">kg/m²</span>`;
  }
  refreshSummary();
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Patient information
  ['patientInformation', 'fullName'],
  ['patientInformation', 'dateOfBirth'],
  // Demographics
  ['demographics', 'age'],
  ['demographics', 'sex'],
  ['demographics', 'ethnicity'],
  ['demographics', 'heightCm'],
  ['demographics', 'weightKg'],
  // Blood pressure
  ['bloodPressure', 'systolicBp'],
  ['bloodPressure', 'diastolicBp'],
  ['bloodPressure', 'onAntihypertensive'],
  ['bloodPressure', 'bpAtTarget'],
  // Cholesterol
  ['cholesterolLipids', 'totalCholesterol'],
  ['cholesterolLipids', 'hdlCholesterol'],
  ['cholesterolLipids', 'onStatin'],
  // Metabolic health
  ['metabolicHealth', 'hasDiabetes'],
  ['metabolicHealth', 'hba1cValue'],
  ['metabolicHealth', 'bmi'],
  // Renal
  ['renalFunction', 'egfr'],
  // Smoking
  ['smokingHistory', 'smokingStatus'],
  // Medical history
  ['medicalHistory', 'hasKnownCvd'],
  ['medicalHistory', 'atrialFibrillation'],
  ['medicalHistory', 'familyCvdHistory'],
  // Current medications
  ['currentMedications', 'onAntihypertensiveDetail'],
  ['currentMedications', 'onStatinDetail'],
  ['currentMedications', 'onAspirin'],
  ['currentMedications', 'onAnticoagulant'],
  ['currentMedications', 'onDiabetesMedication'],
  // Review
  ['reviewCalculate', 'modelType']
];

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    const v = state[section][field];
    if (v !== null && v !== undefined && v !== '') {
      answered++;
      sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
    }
  }
  const total = TRACKED_FIELDS.length;
  const percent = Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'patientInformation', title: 'Patient Information' },
  { step: 2,  section: 'demographics',       title: 'Demographics' },
  { step: 3,  section: 'bloodPressure',      title: 'Blood Pressure' },
  { step: 4,  section: 'cholesterolLipids',  title: 'Cholesterol & Lipids' },
  { step: 5,  section: 'metabolicHealth',    title: 'Metabolic Health' },
  { step: 6,  section: 'renalFunction',      title: 'Renal Function' },
  { step: 7,  section: 'smokingHistory',     title: 'Smoking History' },
  { step: 8,  section: 'medicalHistory',     title: 'Medical History' },
  { step: 9,  section: 'currentMedications', title: 'Current Medications' },
  { step: 10, section: 'reviewCalculate',    title: 'Review & Calculate' }
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
// Validation
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
  const required = form.querySelectorAll('[data-required]');
  required.forEach((input) => {
    const id = input.id;
    const value = (input.value || '').trim();
    if (!value) {
      const labelEl = form.querySelector(`label[for="${id}"]`);
      const label = labelEl ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim() : id;
      errors.push({ id, message: `${label} is required` });
      setFieldError(id, `${label} is required`);
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
  summary.innerHTML = `
    <strong>Please correct the following:</strong>
    <ul>
      ${errors.map((e) => `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`).join('')}
    </ul>
  `;
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  summary.focus({ preventScroll: true });
}

// ----------------------------------------------------------------------
// Submit / Report
// ----------------------------------------------------------------------

function priorityClass(priority) {
  switch (priority) {
    case 'urgent': return 'flag-urgent';
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
    riskCategory,
    tenYearRiskPercent,
    thirtyYearRiskPercent,
    firedRules,
    additionalFlags,
    timestamp
  } = lastResult;

  const flagsList = additionalFlags.length === 0
    ? `<p class="muted">No additional flags raised.</p>`
    : `
      <ul class="flags">
        ${additionalFlags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.message)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const firedRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
      <td class="num">${esc(r.riskLevel)}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No risk rules fired.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Description</th>
            <th scope="col">Level</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <h2>PREVENT CVD Risk Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Risk Category</h3>
    <p class="risk-summary">
      <span class="risk-badge ${riskCategoryClass(riskCategory)}">${esc(riskCategoryLabel(riskCategory))}</span>
    </p>

    <h3>Predicted Risk</h3>
    <table class="subscales">
      <thead>
        <tr>
          <th scope="col">Horizon</th>
          <th scope="col">Risk</th>
        </tr>
      </thead>
      <tbody>
        <tr><th scope="row">10-year total CVD</th><td class="num">${tenYearRiskPercent.toFixed(1)}%</td></tr>
        <tr><th scope="row">30-year total CVD</th><td class="num">${thirtyYearRiskPercent.toFixed(1)}%</td></tr>
      </tbody>
    </table>

    <h3>Fired Rules (${firedRules.length})</h3>
    ${firedTable}

    <h3>Flagged Issues (${additionalFlags.length})</h3>
    ${flagsList}

    <div class="report-actions">
      <button type="button" id="print-btn" class="button" data-variant="secondary">Print / save PDF</button>
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
  document.getElementById('print-btn').addEventListener('click', () => window.print());
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  recomputeDerived();
  lastResult = calculateRisk(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh assessment?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Bootstrap
// ----------------------------------------------------------------------

function renderForm() {
  const host = document.getElementById('form-sections');
  host.innerHTML = '';
  for (const r of STEP_RENDERERS) host.appendChild(r());
}

function init() {
  recomputeDerived();
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
