import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateRisk } from './risk-grader.js';
import { bmiCategory, calculateBMI, calculateTcHdlRatio, emptyAssessment, riskCategoryClass, riskCategoryLabel } from './types.js';

// Heart Health Check - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary plus step-list reflects how many fields have been
// answered. Submission runs the pure scoring engine (10-year CVD risk,
// heart age, 20 HHC rules, 13 additional flags) and renders an inline
// aria-live report. State is persisted to localStorage so a partial fill
// survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'heart-health-check.front-end-form-with-html.v1';
const TOTAL_STEPS = 10;

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

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
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

let state = loadState();
/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'heart-health-check',
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

function setField(section, field, value) {
  state[section][field] = value;
  recomputeDerived();
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
}

/** Recompute auto-calculated derived values (BMI, TC/HDL ratio). */
function recomputeDerived() {
  // BMI is "auto" only when no override is supplied. We keep the override
  // field user-controlled and never overwrite a non-null override.
  // For display purposes we keep state.bodyMeasurements.bmi as user override
  // and use the calculated value purely in readouts and the engine.
}

/** HTML escaping helper. */
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
  legend.innerHTML = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
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
// Reusable option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const sexOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
];

const ethnicityOptions = [
  { value: 'white', label: 'White or not stated' },
  { value: 'indian', label: 'Indian' },
  { value: 'pakistani', label: 'Pakistani' },
  { value: 'bangladeshi', label: 'Bangladeshi' },
  { value: 'other-asian', label: 'Other Asian' },
  { value: 'black-caribbean', label: 'Black Caribbean' },
  { value: 'black-african', label: 'Black African' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'other', label: 'Other ethnic group' }
];

const diabetesOptions = [
  { value: 'no', label: 'No diabetes' },
  { value: 'type1', label: 'Type 1 diabetes' },
  { value: 'type2', label: 'Type 2 diabetes' }
];

const familyRelationshipOptions = [
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'child', label: 'Child' },
  { value: 'multiple', label: 'Multiple relatives' }
];

const smokingOptions = [
  { value: 'nonSmoker', label: 'Non-smoker (never smoked)' },
  { value: 'exSmoker', label: 'Ex-smoker' },
  { value: 'lightSmoker', label: 'Light smoker (1-9/day)' },
  { value: 'moderateSmoker', label: 'Moderate smoker (10-19/day)' },
  { value: 'heavySmoker', label: 'Heavy smoker (20+/day)' }
];

const alcoholFrequencyOptions = [
  { value: 'never', label: 'Never' },
  { value: 'monthly', label: 'Monthly or less' },
  { value: 'twoToFourPerMonth', label: '2-4 times per month' },
  { value: 'twoToThreePerWeek', label: '2-3 times per week' },
  { value: 'fourOrMorePerWeek', label: '4+ times per week' }
];

const activityIntensityOptions = [
  { value: 'light', label: 'Light (walking, yoga)' },
  { value: 'moderate', label: 'Moderate (brisk walking, cycling)' },
  { value: 'vigorous', label: 'Vigorous (running, sports)' }
];

const dietQualityOptions = [
  { value: 'poor', label: 'Poor' },
  { value: 'fair', label: 'Fair' },
  { value: 'good', label: 'Good' },
  { value: 'excellent', label: 'Excellent' }
];

const saltIntakeOptions = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' }
];

// ----------------------------------------------------------------------
// Step renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Patient Information',
    description: 'Patient identification and contact details.'
  });

  card.appendChild(textInput({
    label: 'Full Name', section: 'patientInformation', field: 'fullName',
    required: true, placeholder: 'Full name'
  }));

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(textInput({
    label: 'Date of Birth', section: 'patientInformation', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  row1.appendChild(textInput({
    label: 'NHS Number', section: 'patientInformation', field: 'nhsNumber',
    placeholder: '000 000 0000'
  }));
  card.appendChild(row1);

  card.appendChild(textInput({
    label: 'Address', section: 'patientInformation', field: 'address',
    placeholder: 'Full address'
  }));

  const row2 = document.createElement('div');
  row2.className = 'two-col';
  row2.appendChild(textInput({
    label: 'Postcode', section: 'patientInformation', field: 'postcode'
  }));
  row2.appendChild(textInput({
    label: 'Telephone', section: 'patientInformation', field: 'telephone',
    type: 'tel', placeholder: 'Phone number'
  }));
  card.appendChild(row2);

  card.appendChild(textInput({
    label: 'Email', section: 'patientInformation', field: 'email',
    type: 'email', placeholder: 'Email address'
  }));

  const row3 = document.createElement('div');
  row3.className = 'two-col';
  row3.appendChild(textInput({
    label: 'GP Name', section: 'patientInformation', field: 'gpName'
  }));
  row3.appendChild(textInput({
    label: 'GP Practice', section: 'patientInformation', field: 'gpPractice'
  }));
  card.appendChild(row3);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Demographics & Ethnicity',
    description: 'Required for QRISK3-based risk calculation.'
  });

  const row = document.createElement('div');
  row.className = 'two-col';
  row.appendChild(textInput({
    label: 'Age', section: 'demographicsEthnicity', field: 'age',
    type: 'number', min: 18, max: 100, required: true, unit: 'years'
  }));
  row.appendChild(textInput({
    label: 'Townsend Deprivation Score', section: 'demographicsEthnicity',
    field: 'townsendDeprivation', type: 'number', step: 0.1, min: -8, max: 12
  }));
  card.appendChild(row);

  card.appendChild(radioGroup({
    label: 'Sex', section: 'demographicsEthnicity', field: 'sex',
    options: sexOptions, required: true
  }));

  card.appendChild(selectInput({
    label: 'Ethnicity', section: 'demographicsEthnicity', field: 'ethnicity',
    options: ethnicityOptions
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Blood Pressure',
    description: 'Blood pressure readings and treatment status.'
  });

  const row = document.createElement('div');
  row.className = 'two-col';
  row.appendChild(textInput({
    label: 'Systolic BP', section: 'bloodPressure', field: 'systolicBP',
    type: 'number', min: 70, max: 250, unit: 'mmHg', required: true
  }));
  row.appendChild(textInput({
    label: 'Diastolic BP', section: 'bloodPressure', field: 'diastolicBP',
    type: 'number', min: 40, max: 150, unit: 'mmHg'
  }));
  card.appendChild(row);

  card.appendChild(textInput({
    label: 'Systolic BP Standard Deviation', section: 'bloodPressure',
    field: 'systolicBPSD', type: 'number', step: 0.1, min: 0, max: 50,
    unit: 'mmHg'
  }));

  card.appendChild(radioGroup({
    label: 'On blood pressure treatment?',
    section: 'bloodPressure', field: 'onBPTreatment', options: yesNo
  }));

  const bpMedsHost = document.createElement('div');
  bpMedsHost.dataset.conditional = 'bloodPressure.onBPTreatment=yes';
  bpMedsHost.appendChild(textInput({
    label: 'Number of BP medications', section: 'bloodPressure',
    field: 'numberOfBPMedications', type: 'number', min: 1, max: 10
  }));
  card.appendChild(bpMedsHost);

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Cholesterol',
    description: 'Lipid profile and statin status.'
  });

  const row = document.createElement('div');
  row.className = 'two-col';
  row.appendChild(textInput({
    label: 'Total Cholesterol', section: 'cholesterol', field: 'totalCholesterol',
    type: 'number', min: 1, max: 15, step: 0.1, unit: 'mmol/L'
  }));
  row.appendChild(textInput({
    label: 'HDL Cholesterol', section: 'cholesterol', field: 'hdlCholesterol',
    type: 'number', min: 0.2, max: 5, step: 0.1, unit: 'mmol/L'
  }));
  card.appendChild(row);

  card.appendChild(readOnlyReadout({
    label: 'Calculated TC/HDL ratio',
    id: 'tchdl-readout',
    render: () => {
      const r = calculateTcHdlRatio(state.cholesterol.totalCholesterol, state.cholesterol.hdlCholesterol);
      return r == null
        ? '<span class="muted">Auto-calculated from totals above</span>'
        : `<strong>${r}</strong>`;
    }
  }));

  card.appendChild(textInput({
    label: 'TC/HDL Ratio (override)', section: 'cholesterol', field: 'totalHDLRatio',
    type: 'number', min: 1, max: 20, step: 0.1, placeholder: 'Override calculated ratio'
  }));

  card.appendChild(radioGroup({
    label: 'Currently on statin?',
    section: 'cholesterol', field: 'onStatin', options: yesNo
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Medical Conditions',
    description: 'Existing diagnoses and medications relevant to cardiovascular risk.'
  });

  card.appendChild(selectInput({
    label: 'Diabetes', section: 'medicalConditions', field: 'hasDiabetes',
    options: diabetesOptions
  }));
  card.appendChild(radioGroup({
    label: 'Atrial fibrillation?',
    section: 'medicalConditions', field: 'hasAtrialFibrillation', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Rheumatoid arthritis?',
    section: 'medicalConditions', field: 'hasRheumatoidArthritis', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Chronic kidney disease (stage 3+)?',
    section: 'medicalConditions', field: 'hasChronicKidneyDisease', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Migraine?',
    section: 'medicalConditions', field: 'hasMigraine', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Severe mental illness?',
    section: 'medicalConditions', field: 'hasSevereMentalIllness', options: yesNo
  }));

  // Erectile dysfunction - male only
  const edHost = document.createElement('div');
  edHost.dataset.conditional = 'demographicsEthnicity.sex=male';
  edHost.appendChild(radioGroup({
    label: 'Erectile dysfunction?',
    section: 'medicalConditions', field: 'hasErectileDysfunction', options: yesNo
  }));
  card.appendChild(edHost);

  card.appendChild(radioGroup({
    label: 'On atypical antipsychotic?',
    section: 'medicalConditions', field: 'onAtypicalAntipsychotic', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'On regular corticosteroids?',
    section: 'medicalConditions', field: 'onCorticosteroids', options: yesNo
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Family History',
    description: 'Cardiovascular and diabetes family history.'
  });

  card.appendChild(radioGroup({
    label: 'First-degree relative with CVD under age 60?',
    section: 'familyHistory', field: 'familyCVDUnder60', options: yesNo
  }));

  const relHost = document.createElement('div');
  relHost.dataset.conditional = 'familyHistory.familyCVDUnder60=yes';
  relHost.appendChild(selectInput({
    label: 'Relationship', section: 'familyHistory', field: 'familyCVDRelationship',
    options: familyRelationshipOptions
  }));
  card.appendChild(relHost);

  card.appendChild(radioGroup({
    label: 'Family history of diabetes?',
    section: 'familyHistory', field: 'familyDiabetesHistory', options: yesNo
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Smoking & Alcohol',
    description: 'Tobacco and alcohol consumption.'
  });

  card.appendChild(selectInput({
    label: 'Smoking Status', section: 'smokingAlcohol', field: 'smokingStatus',
    options: smokingOptions
  }));

  const cigHost = document.createElement('div');
  cigHost.dataset.conditionalAny = 'smokingAlcohol.smokingStatus=lightSmoker,moderateSmoker,heavySmoker';
  cigHost.appendChild(textInput({
    label: 'Cigarettes per day', section: 'smokingAlcohol', field: 'cigarettesPerDay',
    type: 'number', min: 1, max: 100
  }));
  card.appendChild(cigHost);

  const exHost = document.createElement('div');
  exHost.dataset.conditional = 'smokingAlcohol.smokingStatus=exSmoker';
  exHost.appendChild(textInput({
    label: 'Years since quitting', section: 'smokingAlcohol', field: 'yearsSinceQuit',
    type: 'number', min: 0, max: 80, unit: 'years'
  }));
  card.appendChild(exHost);

  card.appendChild(textInput({
    label: 'Alcohol units per week', section: 'smokingAlcohol', field: 'alcoholUnitsPerWeek',
    type: 'number', min: 0, max: 200, step: 0.5, unit: 'units/week'
  }));

  card.appendChild(selectInput({
    label: 'Alcohol Frequency', section: 'smokingAlcohol', field: 'alcoholFrequency',
    options: alcoholFrequencyOptions
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Physical Activity & Diet',
    description: 'Exercise and dietary habits.'
  });

  card.appendChild(textInput({
    label: 'Physical activity', section: 'physicalActivityDiet',
    field: 'physicalActivityMinutesPerWeek', type: 'number', min: 0, max: 2000,
    unit: 'minutes/week'
  }));

  card.appendChild(selectInput({
    label: 'Activity intensity', section: 'physicalActivityDiet',
    field: 'activityIntensity', options: activityIntensityOptions
  }));

  card.appendChild(textInput({
    label: 'Fruit & vegetable portions per day', section: 'physicalActivityDiet',
    field: 'fruitVegPortionsPerDay', type: 'number', min: 0, max: 20
  }));

  card.appendChild(selectInput({
    label: 'Diet quality', section: 'physicalActivityDiet', field: 'dietQuality',
    options: dietQualityOptions
  }));

  card.appendChild(selectInput({
    label: 'Salt intake', section: 'physicalActivityDiet', field: 'saltIntake',
    options: saltIntakeOptions
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Body Measurements',
    description: 'Height, weight, and waist circumference.'
  });

  const row = document.createElement('div');
  row.className = 'two-col';
  row.appendChild(textInput({
    label: 'Height', section: 'bodyMeasurements', field: 'heightCm',
    type: 'number', min: 100, max: 250, step: 0.1, unit: 'cm'
  }));
  row.appendChild(textInput({
    label: 'Weight', section: 'bodyMeasurements', field: 'weightKg',
    type: 'number', min: 30, max: 300, step: 0.1, unit: 'kg'
  }));
  card.appendChild(row);

  card.appendChild(readOnlyReadout({
    label: 'Calculated BMI',
    id: 'bmi-readout',
    render: () => {
      const v = calculateBMI(state.bodyMeasurements.heightCm, state.bodyMeasurements.weightKg);
      if (v == null) return '<span class="muted">Auto-calculated from height &amp; weight</span>';
      return `<strong>${v}</strong> <span class="muted">(${esc(bmiCategory(v))})</span>`;
    }
  }));

  card.appendChild(textInput({
    label: 'BMI (override)', section: 'bodyMeasurements', field: 'bmi',
    type: 'number', min: 10, max: 80, step: 0.1, placeholder: 'Override calculated BMI'
  }));

  card.appendChild(textInput({
    label: 'Waist circumference', section: 'bodyMeasurements',
    field: 'waistCircumferenceCm', type: 'number', min: 40, max: 200, step: 0.1,
    unit: 'cm'
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Review & Calculate',
    description: 'Clinician details and final review before risk calculation.'
  });

  const row = document.createElement('div');
  row.className = 'two-col';
  row.appendChild(textInput({
    label: 'Clinician Name', section: 'reviewCalculate', field: 'clinicianName'
  }));
  row.appendChild(textInput({
    label: 'Review Date', section: 'reviewCalculate', field: 'reviewDate',
    type: 'date'
  }));
  card.appendChild(row);

  card.appendChild(textArea({
    label: 'Clinical notes', section: 'reviewCalculate', field: 'clinicalNotes',
    placeholder: 'Any additional clinical observations…', rows: 4
  }));

  card.appendChild(textInput({
    label: 'AUDIT Score', section: 'reviewCalculate', field: 'auditScore',
    type: 'number', min: 0, max: 40
  }));

  const info = document.createElement('div');
  info.className = 'info-box';
  info.innerHTML = `
    <p><strong>Ready to calculate?</strong></p>
    <p>Click <em>Submit and view report</em> below to compute the 10-year CVD
    risk, heart age, fired rules, and any clinical safety flags.</p>
  `;
  card.appendChild(info);

  return card;
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
  document.querySelectorAll('[data-conditional-any]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-any');
    const [path, targetCsv] = expr.split('=');
    const [section, field] = path.split('.');
    const current = String(state[section]?.[field] ?? '');
    const targets = targetCsv.split(',');
    host.style.display = targets.includes(current) ? '' : 'none';
  });
}

function refreshAutoCalculatedReadouts() {
  const bmiRO = document.getElementById('bmi-readout');
  if (bmiRO) {
    const v = calculateBMI(state.bodyMeasurements.heightCm, state.bodyMeasurements.weightKg);
    bmiRO.innerHTML = v == null
      ? '<span class="muted">Auto-calculated from height &amp; weight</span>'
      : `<strong>${v}</strong> <span class="muted">(${esc(bmiCategory(v))})</span>`;
  }
  const ratioRO = document.getElementById('tchdl-readout');
  if (ratioRO) {
    const r = calculateTcHdlRatio(state.cholesterol.totalCholesterol, state.cholesterol.hdlCholesterol);
    ratioRO.innerHTML = r == null
      ? '<span class="muted">Auto-calculated from totals above</span>'
      : `<strong>${r}</strong>`;
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Patient info (1)
  ['patientInformation', 'fullName'],
  ['patientInformation', 'dateOfBirth'],
  // Demographics (2)
  ['demographicsEthnicity', 'age'],
  ['demographicsEthnicity', 'sex'],
  ['demographicsEthnicity', 'ethnicity'],
  // Blood pressure (3)
  ['bloodPressure', 'systolicBP'],
  ['bloodPressure', 'diastolicBP'],
  ['bloodPressure', 'onBPTreatment'],
  // Cholesterol (4)
  ['cholesterol', 'totalCholesterol'],
  ['cholesterol', 'hdlCholesterol'],
  ['cholesterol', 'onStatin'],
  // Medical conditions (5)
  ['medicalConditions', 'hasDiabetes'],
  ['medicalConditions', 'hasAtrialFibrillation'],
  ['medicalConditions', 'hasRheumatoidArthritis'],
  ['medicalConditions', 'hasChronicKidneyDisease'],
  ['medicalConditions', 'hasMigraine'],
  ['medicalConditions', 'hasSevereMentalIllness'],
  ['medicalConditions', 'onAtypicalAntipsychotic'],
  ['medicalConditions', 'onCorticosteroids'],
  // Family history (6)
  ['familyHistory', 'familyCVDUnder60'],
  ['familyHistory', 'familyDiabetesHistory'],
  // Smoking & alcohol (7)
  ['smokingAlcohol', 'smokingStatus'],
  ['smokingAlcohol', 'alcoholUnitsPerWeek'],
  ['smokingAlcohol', 'alcoholFrequency'],
  // Physical activity & diet (8)
  ['physicalActivityDiet', 'physicalActivityMinutesPerWeek'],
  ['physicalActivityDiet', 'activityIntensity'],
  ['physicalActivityDiet', 'fruitVegPortionsPerDay'],
  ['physicalActivityDiet', 'dietQuality'],
  ['physicalActivityDiet', 'saltIntake'],
  // Body measurements (9)
  ['bodyMeasurements', 'heightCm'],
  ['bodyMeasurements', 'weightKg'],
  ['bodyMeasurements', 'waistCircumferenceCm'],
  // Review & calculate (10)
  ['reviewCalculate', 'clinicianName'],
  ['reviewCalculate', 'reviewDate']
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
  { step: 1,  section: 'patientInformation',     title: 'Patient Information' },
  { step: 2,  section: 'demographicsEthnicity',  title: 'Demographics & Ethnicity' },
  { step: 3,  section: 'bloodPressure',          title: 'Blood Pressure' },
  { step: 4,  section: 'cholesterol',            title: 'Cholesterol' },
  { step: 5,  section: 'medicalConditions',      title: 'Medical Conditions' },
  { step: 6,  section: 'familyHistory',          title: 'Family History' },
  { step: 7,  section: 'smokingAlcohol',         title: 'Smoking & Alcohol' },
  { step: 8,  section: 'physicalActivityDiet',   title: 'Activity & Diet' },
  { step: 9,  section: 'bodyMeasurements',       title: 'Body Measurements' },
  { step: 10, section: 'reviewCalculate',        title: 'Review & Calculate' }
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
    case 'high': return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

function ruleLevelClass(level) {
  switch (level) {
    case 'high': return 'rule-high';
    case 'medium': return 'rule-medium';
    case 'low': return 'rule-low';
    default: return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    riskCategory, tenYearRiskPercent, heartAge,
    firedRules, additionalFlags, timestamp
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
    <tr class="${ruleLevelClass(r.riskLevel)}">
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
      <td>${esc(r.riskLevel)}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No HHC rules fired.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Finding</th>
            <th scope="col">Level</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const heartAgeText = heartAge == null
    ? '<span class="muted">Not calculable (age or sex missing)</span>'
    : `<strong>${heartAge}</strong> years`;

  const draftBanner = riskCategory === 'draft'
    ? `<p class="muted">Insufficient information for a risk estimate — please enter at least age and sex.</p>`
    : '';

  out.innerHTML = `
    <h2>Heart Health Check Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    ${draftBanner}

    <h3>10-year CVD Risk</h3>
    <p class="risk-summary">
      <span class="risk-badge ${riskCategoryClass(riskCategory)}">
        ${esc(riskCategoryLabel(riskCategory))}
      </span>
      <span class="risk-value">${tenYearRiskPercent.toFixed(1)}%</span>
    </p>

    <h3>Heart age</h3>
    <p class="readout-line">${heartAgeText}</p>

    <h3>Fired rules</h3>
    ${firedTable}

    <h3>Flagged Issues</h3>
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
  const { riskCategory, tenYearRiskPercent, heartAge, firedRules } = calculateRisk(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    riskCategory,
    tenYearRiskPercent,
    heartAge,
    firedRules,
    additionalFlags,
    timestamp: new Date().toISOString()
  };
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
