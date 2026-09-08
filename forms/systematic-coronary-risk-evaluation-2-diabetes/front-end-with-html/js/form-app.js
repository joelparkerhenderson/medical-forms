import { gradeAssessment } from './risk-grader.js';
import { createDefaultAssessmentData } from './types.js';
import { calculateBmi, ckdStageFromEgfr, hba1cMmolMol, riskCategoryClass, riskCategoryLabel } from './utils.js';

// SCORE2-Diabetes — clinician wizard (vanilla JS, Lily-shaped).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page native
// <progress> bar + step list reflects how many fields have been answered.
// Submission runs the pure SCORE2-Diabetes scoring engine and renders an
// inline report. State is persisted to localStorage so a partial fill
// survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'systematic-coronary-risk-evaluation-2-diabetes.front-end-form-with-html.v1';
const TOTAL_STEPS = 10;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = createDefaultAssessmentData();

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
    if (!raw) return createDefaultAssessmentData();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved assessment; starting fresh.', e);
    return createDefaultAssessmentData();
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
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'systematic-coronary-risk-evaluation-2-diabetes',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    recomputeDerived();
    updateProgress();
    updateConditionalSections();
    refreshAutoCalculatedReadouts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

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
  const dem = state.patientDemographics;
  if (state.lifestyleFactors) {
    state.lifestyleFactors.bmiAuto = calculateBmi(dem.heightCm, dem.weightKg);
  }
  if (state.renalFunction) {
    state.renalFunction.ckdStageAuto = ckdStageFromEgfr(state.renalFunction.egfr);
  }
  if (state.diabetesHistory) {
    state.diabetesHistory.hba1cMmolMolAuto = hba1cMmolMol(state);
  }
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ----------------------------------------------------------------------
// Component builders (Lily-shaped)
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
// Reusable option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per SCORE2-Diabetes step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Patient Demographics',
    description: 'Basic patient identification and body measurements.'
  });

  card.appendChild(textInput({
    label: 'Full Name',
    section: 'patientDemographics', field: 'fullName', required: true
  }));

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(textInput({
    label: 'Date of Birth', section: 'patientDemographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  row1.appendChild(textInput({
    label: 'NHS Number', section: 'patientDemographics', field: 'nhsNumber',
    placeholder: '000 000 0000'
  }));
  card.appendChild(row1);

  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'patientDemographics', field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' }
    ]
  }));

  const measurements = document.createElement('div');
  measurements.className = 'three-col';
  measurements.appendChild(textInput({
    label: 'Height', section: 'patientDemographics', field: 'heightCm',
    type: 'number', min: 50, max: 250, step: 0.1, unit: 'cm'
  }));
  measurements.appendChild(textInput({
    label: 'Weight', section: 'patientDemographics', field: 'weightKg',
    type: 'number', min: 1, max: 400, step: 0.1, unit: 'kg'
  }));
  measurements.appendChild(readOnlyReadout({
    label: 'BMI',
    id: 'bmi-readout',
    render: () => {
      const bmi = state.lifestyleFactors.bmiAuto;
      if (bmi == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${bmi}</strong> <span class="muted">kg/m&sup2;</span>`;
    }
  }));
  card.appendChild(measurements);

  card.appendChild(selectInput({
    label: 'Ethnicity',
    section: 'patientDemographics', field: 'ethnicity',
    options: [
      { value: 'white', label: 'White' },
      { value: 'asian', label: 'Asian' },
      { value: 'black', label: 'Black' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Diabetes History',
    description: 'Diabetes type, duration, glycaemic control, and treatment.'
  });

  card.appendChild(selectInput({
    label: 'Diabetes Type',
    section: 'diabetesHistory', field: 'diabetesType',
    options: [
      { value: 'type1', label: 'Type 1' },
      { value: 'type2', label: 'Type 2' },
      { value: 'gestational', label: 'Gestational' },
      { value: 'other', label: 'Other' }
    ]
  }));

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(textInput({
    label: 'Age at Diagnosis', section: 'diabetesHistory', field: 'ageAtDiagnosis',
    type: 'number', min: 0, max: 120, unit: 'years'
  }));
  row1.appendChild(textInput({
    label: 'Diabetes Duration', section: 'diabetesHistory', field: 'diabetesDurationYears',
    type: 'number', min: 0, max: 100, unit: 'years'
  }));
  card.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'three-col';
  row2.appendChild(textInput({
    label: 'HbA1c Value', section: 'diabetesHistory', field: 'hba1cValue',
    type: 'number', min: 0, max: 200, step: 0.1, required: true
  }));
  row2.appendChild(selectInput({
    label: 'HbA1c Unit', section: 'diabetesHistory', field: 'hba1cUnit',
    options: [
      { value: 'mmolMol', label: 'mmol/mol' },
      { value: 'percent', label: '% (DCCT)' }
    ]
  }));
  row2.appendChild(readOnlyReadout({
    label: 'HbA1c (mmol/mol)',
    id: 'hba1c-readout',
    render: () => {
      const v = state.diabetesHistory.hba1cMmolMolAuto;
      if (v == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${v}</strong> <span class="muted">mmol/mol</span>`;
    }
  }));
  card.appendChild(row2);

  card.appendChild(textInput({
    label: 'Fasting Glucose', section: 'diabetesHistory', field: 'fastingGlucose',
    type: 'number', min: 0, max: 50, step: 0.1, unit: 'mmol/L'
  }));

  card.appendChild(selectInput({
    label: 'Current Diabetes Treatment',
    section: 'diabetesHistory', field: 'diabetesTreatment',
    options: [
      { value: 'diet', label: 'Diet only' },
      { value: 'oral', label: 'Oral medication' },
      { value: 'insulin', label: 'Insulin' },
      { value: 'combined', label: 'Combination therapy' }
    ]
  }));

  const insulinHost = document.createElement('div');
  insulinHost.dataset.conditionalAny = 'diabetesHistory.diabetesTreatment=insulin,combined';
  insulinHost.appendChild(textInput({
    label: 'Duration on Insulin', section: 'diabetesHistory', field: 'insulinDurationYears',
    type: 'number', min: 0, max: 80, unit: 'years'
  }));
  card.appendChild(insulinHost);

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Cardiovascular History',
    description: 'Previous cardiovascular events and current symptoms.'
  });

  card.appendChild(radioGroup({
    label: 'Previous myocardial infarction (heart attack)?',
    section: 'cardiovascularHistory', field: 'previousMi', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Previous stroke?',
    section: 'cardiovascularHistory', field: 'previousStroke', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Previous transient ischaemic attack (TIA)?',
    section: 'cardiovascularHistory', field: 'previousTia', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Peripheral arterial disease?',
    section: 'cardiovascularHistory', field: 'peripheralArterialDisease', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Heart failure?',
    section: 'cardiovascularHistory', field: 'heartFailure', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Atrial fibrillation?',
    section: 'cardiovascularHistory', field: 'atrialFibrillation', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Family history of premature cardiovascular disease?',
    section: 'cardiovascularHistory', field: 'familyCvdHistory', options: yesNo
  }));
  const familyHost = document.createElement('div');
  familyHost.dataset.conditional = 'cardiovascularHistory.familyCvdHistory=yes';
  familyHost.appendChild(textArea({
    label: 'Family CVD details',
    section: 'cardiovascularHistory', field: 'familyCvdDetails',
    placeholder: 'Which family members and conditions?',
    rows: 2
  }));
  card.appendChild(familyHost);

  card.appendChild(radioGroup({
    label: 'Current chest pain?',
    section: 'cardiovascularHistory', field: 'currentChestPain', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Current dyspnoea (breathlessness)?',
    section: 'cardiovascularHistory', field: 'currentDyspnoea', options: yesNo
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Blood Pressure',
    description: 'Blood pressure readings and antihypertensive treatment.'
  });

  const row = document.createElement('div');
  row.className = 'two-col';
  row.appendChild(textInput({
    label: 'Systolic BP', section: 'bloodPressure', field: 'systolicBp',
    type: 'number', min: 60, max: 300, unit: 'mmHg', required: true
  }));
  row.appendChild(textInput({
    label: 'Diastolic BP', section: 'bloodPressure', field: 'diastolicBp',
    type: 'number', min: 30, max: 200, unit: 'mmHg'
  }));
  card.appendChild(row);

  card.appendChild(radioGroup({
    label: 'Currently on antihypertensive medication?',
    section: 'bloodPressure', field: 'onAntihypertensive', options: yesNo
  }));
  const antiHost = document.createElement('div');
  antiHost.dataset.conditional = 'bloodPressure.onAntihypertensive=yes';
  antiHost.appendChild(textInput({
    label: 'Number of BP medications',
    section: 'bloodPressure', field: 'numberOfBpMedications',
    type: 'number', min: 1, max: 10
  }));
  antiHost.appendChild(radioGroup({
    label: 'BP at target?',
    section: 'bloodPressure', field: 'bpAtTarget', options: yesNo
  }));
  card.appendChild(antiHost);

  card.appendChild(radioGroup({
    label: 'Home BP monitoring?',
    section: 'bloodPressure', field: 'homeBpMonitoring', options: yesNo
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Lipid Profile',
    description: 'Cholesterol, triglycerides, and lipid-lowering therapy.'
  });

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(textInput({
    label: 'Total Cholesterol', section: 'lipidProfile', field: 'totalCholesterol',
    type: 'number', min: 0, max: 20, step: 0.1, unit: 'mmol/L'
  }));
  row1.appendChild(textInput({
    label: 'HDL Cholesterol', section: 'lipidProfile', field: 'hdlCholesterol',
    type: 'number', min: 0, max: 10, step: 0.1, unit: 'mmol/L'
  }));
  card.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'two-col';
  row2.appendChild(textInput({
    label: 'LDL Cholesterol', section: 'lipidProfile', field: 'ldlCholesterol',
    type: 'number', min: 0, max: 15, step: 0.1, unit: 'mmol/L'
  }));
  row2.appendChild(textInput({
    label: 'Triglycerides', section: 'lipidProfile', field: 'triglycerides',
    type: 'number', min: 0, max: 30, step: 0.1, unit: 'mmol/L'
  }));
  card.appendChild(row2);

  card.appendChild(textInput({
    label: 'Non-HDL Cholesterol', section: 'lipidProfile', field: 'nonHdlCholesterol',
    type: 'number', min: 0, max: 20, step: 0.1, unit: 'mmol/L'
  }));

  card.appendChild(radioGroup({
    label: 'Currently on statin therapy?',
    section: 'lipidProfile', field: 'onStatin', options: yesNo
  }));
  const statinHost = document.createElement('div');
  statinHost.dataset.conditional = 'lipidProfile.onStatin=yes';
  statinHost.appendChild(textInput({
    label: 'Statin name and dose',
    section: 'lipidProfile', field: 'statinName',
    placeholder: 'e.g. Atorvastatin 40mg'
  }));
  card.appendChild(statinHost);

  card.appendChild(radioGroup({
    label: 'On other lipid-lowering therapy?',
    section: 'lipidProfile', field: 'onOtherLipidTherapy', options: yesNo
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Renal Function',
    description: 'Kidney function tests and chronic kidney disease staging.'
  });

  const row = document.createElement('div');
  row.className = 'three-col';
  row.appendChild(textInput({
    label: 'eGFR', section: 'renalFunction', field: 'egfr',
    type: 'number', min: 0, max: 200, unit: 'mL/min/1.73m²'
  }));
  row.appendChild(textInput({
    label: 'Creatinine', section: 'renalFunction', field: 'creatinine',
    type: 'number', min: 0, max: 2000, unit: 'µmol/L'
  }));
  row.appendChild(readOnlyReadout({
    label: 'CKD stage (auto)',
    id: 'ckd-readout',
    render: () => {
      const v = state.renalFunction.ckdStageAuto;
      if (!v) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${esc(v)}</strong>`;
    }
  }));
  card.appendChild(row);

  card.appendChild(textInput({
    label: 'Urine ACR', section: 'renalFunction', field: 'urineAcr',
    type: 'number', min: 0, max: 500, step: 0.1, unit: 'mg/mmol'
  }));

  card.appendChild(selectInput({
    label: 'Proteinuria',
    section: 'renalFunction', field: 'proteinuria',
    options: [
      { value: 'none', label: 'None' },
      { value: 'microalbuminuria', label: 'Microalbuminuria' },
      { value: 'macroalbuminuria', label: 'Macroalbuminuria' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'CKD stage (recorded)',
    section: 'renalFunction', field: 'ckdStage',
    options: [
      { value: 'G1', label: 'G1 (eGFR ≥ 90)' },
      { value: 'G2', label: 'G2 (eGFR 60-89)' },
      { value: 'G3a', label: 'G3a (eGFR 45-59)' },
      { value: 'G3b', label: 'G3b (eGFR 30-44)' },
      { value: 'G4', label: 'G4 (eGFR 15-29)' },
      { value: 'G5', label: 'G5 (eGFR < 15)' }
    ]
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Lifestyle Factors',
    description: 'Smoking, alcohol, physical activity, diet, and body composition.'
  });

  card.appendChild(selectInput({
    label: 'Smoking Status',
    section: 'lifestyleFactors', field: 'smokingStatus',
    options: [
      { value: 'never', label: 'Never smoked' },
      { value: 'former', label: 'Former smoker' },
      { value: 'current', label: 'Current smoker' }
    ]
  }));
  const cigHost = document.createElement('div');
  cigHost.dataset.conditional = 'lifestyleFactors.smokingStatus=current';
  cigHost.appendChild(textInput({
    label: 'Cigarettes per day',
    section: 'lifestyleFactors', field: 'cigarettesPerDay',
    type: 'number', min: 0, max: 100
  }));
  card.appendChild(cigHost);
  const quitHost = document.createElement('div');
  quitHost.dataset.conditional = 'lifestyleFactors.smokingStatus=former';
  quitHost.appendChild(textInput({
    label: 'Years since quitting',
    section: 'lifestyleFactors', field: 'yearsSinceQuit',
    type: 'number', min: 0, max: 80
  }));
  card.appendChild(quitHost);

  card.appendChild(textInput({
    label: 'Alcohol units per week',
    section: 'lifestyleFactors', field: 'alcoholUnitsPerWeek',
    type: 'number', min: 0, max: 200
  }));

  card.appendChild(selectInput({
    label: 'Physical Activity',
    section: 'lifestyleFactors', field: 'physicalActivity',
    options: [
      { value: 'sedentary', label: 'Sedentary' },
      { value: 'lightlyActive', label: 'Lightly active' },
      { value: 'moderatelyActive', label: 'Moderately active' },
      { value: 'veryActive', label: 'Very active' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Diet Quality',
    section: 'lifestyleFactors', field: 'dietQuality',
    options: [
      { value: 'poor', label: 'Poor' },
      { value: 'fair', label: 'Fair' },
      { value: 'good', label: 'Good' },
      { value: 'excellent', label: 'Excellent' }
    ]
  }));

  const row = document.createElement('div');
  row.className = 'two-col';
  row.appendChild(textInput({
    label: 'BMI (override calculated)',
    section: 'lifestyleFactors', field: 'bmi',
    type: 'number', min: 10, max: 80, step: 0.1, unit: 'kg/m²'
  }));
  row.appendChild(textInput({
    label: 'Waist Circumference',
    section: 'lifestyleFactors', field: 'waistCircumferenceCm',
    type: 'number', min: 30, max: 250, step: 0.1, unit: 'cm'
  }));
  card.appendChild(row);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Current Medications',
    description: 'Diabetes, cardiovascular, and other relevant medications.'
  });

  card.appendChild(radioGroup({
    label: 'Metformin?',
    section: 'currentMedications', field: 'metformin', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'SGLT2 inhibitor (e.g. dapagliflozin, empagliflozin)?',
    section: 'currentMedications', field: 'sglt2Inhibitor', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'GLP-1 receptor agonist (e.g. liraglutide, semaglutide)?',
    section: 'currentMedications', field: 'glp1Agonist', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Sulfonylurea?',
    section: 'currentMedications', field: 'sulfonylurea', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'DPP-4 inhibitor?',
    section: 'currentMedications', field: 'dpp4Inhibitor', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Insulin?',
    section: 'currentMedications', field: 'insulin', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'ACE inhibitor or ARB?',
    section: 'currentMedications', field: 'aceInhibitorOrArb', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Antiplatelet (e.g. aspirin, clopidogrel)?',
    section: 'currentMedications', field: 'antiplatelet', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Anticoagulant?',
    section: 'currentMedications', field: 'anticoagulant', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Other medications',
    section: 'currentMedications', field: 'otherMedications',
    placeholder: 'List any other medications…',
    rows: 2
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Complications Screening',
    description: 'Retinopathy, neuropathy, foot examination, and other complications.'
  });

  card.appendChild(selectInput({
    label: 'Retinopathy Status',
    section: 'complicationsScreening', field: 'retinopathyStatus',
    options: [
      { value: 'notScreened', label: 'Not screened' },
      { value: 'none', label: 'No retinopathy' },
      { value: 'background', label: 'Background retinopathy' },
      { value: 'preProliferative', label: 'Pre-proliferative' },
      { value: 'proliferative', label: 'Proliferative' },
      { value: 'maculopathy', label: 'Maculopathy' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Last Eye Screening Date',
    section: 'complicationsScreening', field: 'lastEyeScreeningDate',
    type: 'date'
  }));

  card.appendChild(radioGroup({
    label: 'Neuropathy symptoms?',
    section: 'complicationsScreening', field: 'neuropathySymptoms', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Monofilament Test Result',
    section: 'complicationsScreening', field: 'monofilamentTest',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'abnormal', label: 'Abnormal' },
      { value: 'notDone', label: 'Not done' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Foot Pulses',
    section: 'complicationsScreening', field: 'footPulses',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'absent', label: 'Absent' },
      { value: 'notChecked', label: 'Not checked' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'History of foot ulceration?',
    section: 'complicationsScreening', field: 'footUlcerHistory', options: yesNo
  }));

  card.appendChild(textInput({
    label: 'Ankle-Brachial Index',
    section: 'complicationsScreening', field: 'ankleBrachialIndex',
    type: 'number', min: 0, max: 3, step: 0.01,
    placeholder: 'e.g. 1.05'
  }));

  card.appendChild(radioGroup({
    label: 'Erectile dysfunction?',
    section: 'complicationsScreening', field: 'erectileDysfunction',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'notApplicable', label: 'N/A' }
    ]
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Risk Assessment Summary',
    description: 'Risk region, additional factors, and clinical plan.'
  });

  card.appendChild(selectInput({
    label: 'Risk Region (SCORE2-Diabetes)',
    section: 'riskAssessmentSummary', field: 'riskRegion',
    options: [
      { value: 'low', label: 'Low risk region' },
      { value: 'moderate', label: 'Moderate risk region' },
      { value: 'high', label: 'High risk region' },
      { value: 'veryHigh', label: 'Very high risk region' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Additional Risk Factors',
    section: 'riskAssessmentSummary', field: 'additionalRiskFactors',
    placeholder: 'Any additional risk factors not captured above…',
    rows: 2
  }));

  card.appendChild(textArea({
    label: 'Clinical Notes',
    section: 'riskAssessmentSummary', field: 'clinicalNotes',
    placeholder: 'Clinician observations and recommendations…',
    rows: 3
  }));

  card.appendChild(textArea({
    label: 'Agreed Treatment Targets',
    section: 'riskAssessmentSummary', field: 'agreedTreatmentTargets',
    placeholder: 'e.g. HbA1c < 53, BP < 130/80, LDL < 1.8…',
    rows: 2
  }));

  card.appendChild(selectInput({
    label: 'Follow-up Interval',
    section: 'riskAssessmentSummary', field: 'followUpInterval',
    options: [
      { value: '3months', label: '3 months' },
      { value: '6months', label: '6 months' },
      { value: '12months', label: '12 months' }
    ]
  }));

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
  const bmi = document.getElementById('bmi-readout');
  if (bmi) {
    const v = state.lifestyleFactors.bmiAuto;
    bmi.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}</strong> <span class="muted">kg/m&sup2;</span>`;
  }
  const hb = document.getElementById('hba1c-readout');
  if (hb) {
    const v = state.diabetesHistory.hba1cMmolMolAuto;
    hb.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}</strong> <span class="muted">mmol/mol</span>`;
  }
  const ck = document.getElementById('ckd-readout');
  if (ck) {
    const v = state.renalFunction.ckdStageAuto;
    ck.innerHTML = !v
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${esc(v)}</strong>`;
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Step 1
  ['patientDemographics', 'fullName'],
  ['patientDemographics', 'dateOfBirth'],
  ['patientDemographics', 'sex'],
  ['patientDemographics', 'heightCm'],
  ['patientDemographics', 'weightKg'],
  ['patientDemographics', 'ethnicity'],
  // Step 2
  ['diabetesHistory', 'diabetesType'],
  ['diabetesHistory', 'ageAtDiagnosis'],
  ['diabetesHistory', 'diabetesDurationYears'],
  ['diabetesHistory', 'hba1cValue'],
  ['diabetesHistory', 'hba1cUnit'],
  ['diabetesHistory', 'diabetesTreatment'],
  // Step 3
  ['cardiovascularHistory', 'previousMi'],
  ['cardiovascularHistory', 'previousStroke'],
  ['cardiovascularHistory', 'previousTia'],
  ['cardiovascularHistory', 'peripheralArterialDisease'],
  ['cardiovascularHistory', 'heartFailure'],
  ['cardiovascularHistory', 'atrialFibrillation'],
  ['cardiovascularHistory', 'familyCvdHistory'],
  ['cardiovascularHistory', 'currentChestPain'],
  ['cardiovascularHistory', 'currentDyspnoea'],
  // Step 4
  ['bloodPressure', 'systolicBp'],
  ['bloodPressure', 'diastolicBp'],
  ['bloodPressure', 'onAntihypertensive'],
  ['bloodPressure', 'homeBpMonitoring'],
  // Step 5
  ['lipidProfile', 'totalCholesterol'],
  ['lipidProfile', 'hdlCholesterol'],
  ['lipidProfile', 'ldlCholesterol'],
  ['lipidProfile', 'triglycerides'],
  ['lipidProfile', 'onStatin'],
  ['lipidProfile', 'onOtherLipidTherapy'],
  // Step 6
  ['renalFunction', 'egfr'],
  ['renalFunction', 'creatinine'],
  ['renalFunction', 'urineAcr'],
  ['renalFunction', 'proteinuria'],
  // Step 7
  ['lifestyleFactors', 'smokingStatus'],
  ['lifestyleFactors', 'physicalActivity'],
  ['lifestyleFactors', 'dietQuality'],
  // Step 8
  ['currentMedications', 'metformin'],
  ['currentMedications', 'sglt2Inhibitor'],
  ['currentMedications', 'glp1Agonist'],
  ['currentMedications', 'sulfonylurea'],
  ['currentMedications', 'dpp4Inhibitor'],
  ['currentMedications', 'insulin'],
  ['currentMedications', 'aceInhibitorOrArb'],
  ['currentMedications', 'antiplatelet'],
  ['currentMedications', 'anticoagulant'],
  // Step 9
  ['complicationsScreening', 'retinopathyStatus'],
  ['complicationsScreening', 'neuropathySymptoms'],
  ['complicationsScreening', 'monofilamentTest'],
  ['complicationsScreening', 'footPulses'],
  ['complicationsScreening', 'footUlcerHistory'],
  ['complicationsScreening', 'erectileDysfunction'],
  // Step 10
  ['riskAssessmentSummary', 'riskRegion'],
  ['riskAssessmentSummary', 'followUpInterval']
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
  { step: 1,  section: 'patientDemographics',     title: 'Demographics' },
  { step: 2,  section: 'diabetesHistory',         title: 'Diabetes History' },
  { step: 3,  section: 'cardiovascularHistory',   title: 'CV History' },
  { step: 4,  section: 'bloodPressure',           title: 'Blood Pressure' },
  { step: 5,  section: 'lipidProfile',            title: 'Lipids' },
  { step: 6,  section: 'renalFunction',           title: 'Renal' },
  { step: 7,  section: 'lifestyleFactors',        title: 'Lifestyle' },
  { step: 8,  section: 'currentMedications',      title: 'Medications' },
  { step: 9,  section: 'complicationsScreening',  title: 'Complications' },
  { step: 10, section: 'riskAssessmentSummary',   title: 'Summary' }
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
    case 'high': return 'flag-urgent';
    case 'medium': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

function riskRowClass(level) {
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

  const { riskCategory, firedRules, additionalFlags, timestamp } = lastResult;

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
    <tr class="${riskRowClass(r.riskLevel)}">
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
            <th scope="col">Risk level</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <h2>SCORE2-Diabetes Assessment Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Overall Risk Category</h3>
    <p class="risk-summary">
      <span class="risk-badge ${esc(riskCategoryClass(riskCategory))}">${esc(riskCategoryLabel(riskCategory))}</span>
      <span class="muted">based on ${firedRules.length} fired rule${firedRules.length === 1 ? '' : 's'}</span>
    </p>

    <h3>Fired Risk Rules</h3>
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
  recomputeDerived();
  lastResult = gradeAssessment(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh assessment?')) return;
  clearState();
  state = createDefaultAssessmentData();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  recomputeDerived();
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
