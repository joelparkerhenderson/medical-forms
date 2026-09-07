import { calculateControl } from './diabetes-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { controlLevelClass, controlLevelLabel, emptyAssessment, hba1cMmolMol } from './types.js';

// Diabetes Assessment - patient/clinician wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure NICE Diabetes Review scoring engine and renders an inline
// report. State is persisted to localStorage so a partial fill survives a
// page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'diabetes-assessment.front-end-form-with-html.v1';

/** @returns {import('./types.js').AssessmentData} */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyAssessment();
    const parsed = JSON.parse(raw);
    // Merge over a fresh empty so any newly-added fields default correctly.
    const fresh = emptyAssessment();
    for (const key of Object.keys(fresh)) {
      if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null) {
        fresh[key] = { ...fresh[key], ...parsed[key] };
      }
    }
    return fresh;
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

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs progress and conditional visibility after each change.
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

/**
 * Build a labelled text input.
 * @param {{ label: string, section: string, field: string, type?: string,
 *           placeholder?: string, required?: boolean, min?: number,
 *           max?: number, step?: number, unit?: string }} opts
 */
function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const cls = (type === 'number') ? 'number-input'
    : (type === 'date') ? 'date-input'
    : (type === 'email') ? 'email-input'
    : (type === 'tel') ? 'tel-input'
    : (type === 'url') ? 'url-input'
    : (type === 'time') ? 'time-input'
    : 'text-input';
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${cls}"`,
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
    <label class="label" for="${id}">${labelText}</label>
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

/**
 * Build a labelled multi-line text area.
 * @param {{ label: string, section: string, field: string, rows?: number,
 *           placeholder?: string }} opts
 */
function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      aria-describedby="${id}-error"${requiredAttr}
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

/**
 * Build a select / dropdown input.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[] }} opts
 */
function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${requiredAttr}>
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

/**
 * Build a radio group.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[],
 *           valueType?: 'string' | 'number' }} opts
 */
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

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = `${groupId}-error`;
  errSpan.setAttribute('aria-live', 'polite');
  wrapper.appendChild(errSpan);
  return wrapper;
}

/**
 * Build a Likert 1-5 group with rich labels (Very Poor / Poor / Fair / Good / Excellent etc.).
 * @param {{ label: string, section: string, field: string,
 *           labels: [string, string, string, string, string] }} opts
 */
function likertGroup(opts) {
  return radioGroup({
    label: opts.label,
    section: opts.section,
    field: opts.field,
    valueType: 'number',
    options: opts.labels.map((labelText, i) => ({
      value: String(i + 1),
      label: `${i + 1} - ${labelText}`
    }))
  });
}

/**
 * Build a section card.
 * @param {{ stepNumber: number, title: string, description?: string }} opts
 */
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
    `<span class="section-step">Section ${opts.stepNumber} of 10</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Section renderers (1 per diabetes step, 10 total)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

/** Step 1 - Demographics / Patient Information. */
function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Patient demographic and contact details.'
  });

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(textInput({ label: 'Full name', section: 'patientInformation', field: 'fullName', required: true, placeholder: 'e.g. John Smith' }));
  row1.appendChild(textInput({ label: 'Date of birth', section: 'patientInformation', field: 'dateOfBirth', type: 'date', required: true }));
  card.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'two-col';
  row2.appendChild(textInput({ label: 'NHS number', section: 'patientInformation', field: 'nhsNumber', placeholder: 'e.g. 123 456 7890' }));
  row2.appendChild(textInput({ label: 'Telephone', section: 'patientInformation', field: 'telephone', type: 'tel', placeholder: 'e.g. 07700 900000' }));
  card.appendChild(row2);

  card.appendChild(textArea({ label: 'Address', section: 'patientInformation', field: 'address', rows: 2, placeholder: 'Full postal address' }));
  card.appendChild(textInput({ label: 'Email', section: 'patientInformation', field: 'email', type: 'email', placeholder: 'e.g. patient@example.com' }));

  const row3 = document.createElement('div');
  row3.className = 'two-col';
  row3.appendChild(textInput({ label: 'GP name', section: 'patientInformation', field: 'gpName', placeholder: 'e.g. Dr Jones' }));
  row3.appendChild(textInput({ label: 'GP practice', section: 'patientInformation', field: 'gpPractice', placeholder: 'e.g. Riverside Surgery' }));
  card.appendChild(row3);

  return card;
}

/** Step 2 - Diabetes History. */
function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Diabetes History',
    description: 'Diabetes diagnosis, duration and family history.'
  });

  card.appendChild(selectInput({
    label: 'Diabetes type',
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
    label: 'Age at diagnosis', section: 'diabetesHistory', field: 'ageAtDiagnosis',
    type: 'number', min: 0, max: 120, placeholder: 'e.g. 45'
  }));
  row1.appendChild(textInput({
    label: 'Years since diagnosis', section: 'diabetesHistory', field: 'yearsDuration',
    type: 'number', min: 0, max: 100, placeholder: 'e.g. 10'
  }));
  card.appendChild(row1);

  card.appendChild(selectInput({
    label: 'Diagnosis method',
    section: 'diabetesHistory', field: 'diagnosisMethod',
    options: [
      { value: 'hba1c', label: 'HbA1c' },
      { value: 'fastingGlucose', label: 'Fasting glucose' },
      { value: 'ogtt', label: 'Oral glucose tolerance test (OGTT)' },
      { value: 'randomGlucose', label: 'Random glucose' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Family history of diabetes',
    section: 'diabetesHistory', field: 'familyHistory', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Autoantibodies tested',
    section: 'diabetesHistory', field: 'autoantibodiesTested',
    options: [
      { value: 'yes', label: 'Yes - positive' },
      { value: 'negative', label: 'Yes - negative' },
      { value: 'notTested', label: 'Not tested' }
    ]
  }));

  return card;
}

/** Step 3 - Glycaemic Control. */
function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Glycaemic Control',
    description: 'Current glycaemic markers and monitoring approach.'
  });

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(textInput({
    label: 'HbA1c value', section: 'glycaemicControl', field: 'hba1cValue',
    type: 'number', step: 0.1, min: 0, placeholder: 'e.g. 53 or 7.0'
  }));
  row1.appendChild(selectInput({
    label: 'HbA1c unit',
    section: 'glycaemicControl', field: 'hba1cUnit',
    options: [
      { value: 'mmolMol', label: 'mmol/mol' },
      { value: 'percent', label: '% (DCCT)' }
    ]
  }));
  card.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'two-col';
  row2.appendChild(textInput({
    label: 'Agreed HbA1c target', section: 'glycaemicControl', field: 'hba1cTarget',
    type: 'number', step: 0.1, min: 0, placeholder: 'e.g. 48 or 6.5'
  }));
  row2.appendChild(textInput({
    label: 'Time in range', section: 'glycaemicControl', field: 'timeInRange',
    type: 'number', min: 0, max: 100, unit: '%', placeholder: 'e.g. 70'
  }));
  card.appendChild(row2);

  const row3 = document.createElement('div');
  row3.className = 'two-col';
  row3.appendChild(textInput({
    label: 'Fasting glucose', section: 'glycaemicControl', field: 'fastingGlucose',
    type: 'number', step: 0.1, min: 0, unit: 'mmol/L', placeholder: 'e.g. 5.5'
  }));
  row3.appendChild(textInput({
    label: 'Postprandial glucose', section: 'glycaemicControl', field: 'postprandialGlucose',
    type: 'number', step: 0.1, min: 0, unit: 'mmol/L', placeholder: 'e.g. 7.8'
  }));
  card.appendChild(row3);

  card.appendChild(selectInput({
    label: 'Glucose monitoring method',
    section: 'glycaemicControl', field: 'glucoseMonitoringType',
    options: [
      { value: 'smbg', label: 'Self-monitoring blood glucose (SMBG)' },
      { value: 'cgm', label: 'Continuous glucose monitor (CGM)' },
      { value: 'flash', label: 'Flash glucose monitor' },
      { value: 'none', label: 'None' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Hypoglycaemia frequency',
    section: 'glycaemicControl', field: 'hypoglycaemiaFrequency',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'rarely', label: 'Rarely (less than monthly)' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'daily', label: 'Daily' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Severe hypoglycaemia (requiring assistance)',
    section: 'glycaemicControl', field: 'severeHypoglycaemia', options: yesNo
  }));

  return card;
}

/** Step 4 - Medications. */
function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Medications',
    description: 'Current diabetes medications and self-reported adherence.'
  });

  card.appendChild(radioGroup({
    label: 'Metformin', section: 'medications', field: 'metformin', options: yesNo
  }));

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(selectInput({
    label: 'Sulfonylurea',
    section: 'medications', field: 'sulfonylurea',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'previouslyUsed', label: 'Previously used' }
    ]
  }));
  row1.appendChild(selectInput({
    label: 'SGLT2 inhibitor',
    section: 'medications', field: 'sglt2Inhibitor',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'contraindicated', label: 'Contraindicated' }
    ]
  }));
  card.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'two-col';
  row2.appendChild(selectInput({
    label: 'GLP-1 receptor agonist',
    section: 'medications', field: 'glp1Agonist',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'previouslyUsed', label: 'Previously used' }
    ]
  }));
  row2.appendChild(selectInput({
    label: 'DPP-4 inhibitor',
    section: 'medications', field: 'dpp4Inhibitor',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ]
  }));
  card.appendChild(row2);

  card.appendChild(radioGroup({
    label: 'Insulin', section: 'medications', field: 'insulin', options: yesNo
  }));

  const insulinDetails = document.createElement('div');
  insulinDetails.dataset.conditional = 'medications.insulin=yes';
  const ins1 = document.createElement('div');
  ins1.className = 'two-col';
  ins1.appendChild(selectInput({
    label: 'Insulin regimen',
    section: 'medications', field: 'insulinRegimen',
    options: [
      { value: 'basalOnly', label: 'Basal only' },
      { value: 'basalBolus', label: 'Basal-bolus' },
      { value: 'mixedInsulin', label: 'Mixed insulin' },
      { value: 'pump', label: 'Insulin pump' },
      { value: 'notApplicable', label: 'Not applicable' }
    ]
  }));
  ins1.appendChild(textInput({
    label: 'Insulin total daily dose', section: 'medications', field: 'insulinDailyDose',
    type: 'number', step: 0.5, min: 0, unit: 'units', placeholder: 'e.g. 42'
  }));
  insulinDetails.appendChild(ins1);
  card.appendChild(insulinDetails);

  card.appendChild(likertGroup({
    label: 'Medication adherence (self-reported, 1 = very poor, 5 = excellent)',
    section: 'medications', field: 'medicationAdherence',
    labels: ['Very poor', 'Poor', 'Fair', 'Good', 'Excellent']
  }));

  card.appendChild(textArea({
    label: 'Other medications', section: 'medications', field: 'otherMedications',
    placeholder: 'List any other medications (non-diabetes)…',
    rows: 3
  }));

  return card;
}

/** Step 5 - Complications Screening. */
function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Complications Screening',
    description: 'Diabetes-related complications and screening results.'
  });

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(selectInput({
    label: 'Retinopathy status',
    section: 'complicationsScreening', field: 'retinopathyStatus',
    options: [
      { value: 'none', label: 'None' },
      { value: 'background', label: 'Background' },
      { value: 'preProliferative', label: 'Pre-proliferative' },
      { value: 'proliferative', label: 'Proliferative' },
      { value: 'maculopathy', label: 'Maculopathy' }
    ]
  }));
  row1.appendChild(textInput({
    label: 'Last eye screening date', section: 'complicationsScreening', field: 'lastEyeScreening',
    type: 'date'
  }));
  card.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'two-col';
  row2.appendChild(selectInput({
    label: 'Nephropathy status',
    section: 'complicationsScreening', field: 'nephropathyStatus',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'microalbuminuria', label: 'Microalbuminuria' },
      { value: 'macroalbuminuria', label: 'Macroalbuminuria' },
      { value: 'ckd', label: 'Chronic kidney disease' }
    ]
  }));
  row2.appendChild(textInput({
    label: 'eGFR', section: 'complicationsScreening', field: 'egfr',
    type: 'number', step: 0.1, min: 0, unit: 'mL/min/1.73m²', placeholder: 'e.g. 90'
  }));
  card.appendChild(row2);

  card.appendChild(textInput({
    label: 'Urine ACR', section: 'complicationsScreening', field: 'urineAcr',
    type: 'number', step: 0.1, min: 0, unit: 'mg/mmol', placeholder: 'e.g. 2.5'
  }));

  card.appendChild(radioGroup({
    label: 'Neuropathy symptoms',
    section: 'complicationsScreening', field: 'neuropathySymptoms', options: yesNo
  }));

  const row3 = document.createElement('div');
  row3.className = 'two-col';
  row3.appendChild(selectInput({
    label: 'Autonomic neuropathy',
    section: 'complicationsScreening', field: 'autonomicNeuropathy',
    options: [
      { value: 'none', label: 'None' },
      { value: 'suspected', label: 'Suspected' },
      { value: 'confirmed', label: 'Confirmed' }
    ]
  }));
  row3.appendChild(selectInput({
    label: 'Erectile dysfunction',
    section: 'complicationsScreening', field: 'erectileDysfunction',
    options: [
      { value: 'notApplicable', label: 'Not applicable' },
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Yes' }
    ]
  }));
  card.appendChild(row3);

  return card;
}

/** Step 6 - Cardiovascular Risk. */
function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Cardiovascular Risk',
    description: 'Cardiovascular risk factors and current management.'
  });

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(textInput({
    label: 'Systolic BP', section: 'cardiovascularRisk', field: 'systolicBp',
    type: 'number', min: 60, max: 300, unit: 'mmHg', placeholder: 'e.g. 130'
  }));
  row1.appendChild(textInput({
    label: 'Diastolic BP', section: 'cardiovascularRisk', field: 'diastolicBp',
    type: 'number', min: 30, max: 200, unit: 'mmHg', placeholder: 'e.g. 80'
  }));
  card.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'two-col';
  row2.appendChild(selectInput({
    label: 'On antihypertensive',
    section: 'cardiovascularRisk', field: 'onAntihypertensive',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ]
  }));
  row2.appendChild(selectInput({
    label: 'On statin',
    section: 'cardiovascularRisk', field: 'onStatin',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'intolerant', label: 'Statin intolerant' }
    ]
  }));
  card.appendChild(row2);

  const row3 = document.createElement('div');
  row3.className = 'two-col';
  row3.appendChild(textInput({
    label: 'Total cholesterol', section: 'cardiovascularRisk', field: 'totalCholesterol',
    type: 'number', step: 0.1, min: 0, unit: 'mmol/L', placeholder: 'e.g. 4.5'
  }));
  row3.appendChild(textInput({
    label: 'LDL cholesterol', section: 'cardiovascularRisk', field: 'ldlCholesterol',
    type: 'number', step: 0.1, min: 0, unit: 'mmol/L', placeholder: 'e.g. 2.0'
  }));
  card.appendChild(row3);

  card.appendChild(selectInput({
    label: 'Smoking status',
    section: 'cardiovascularRisk', field: 'smokingStatus',
    options: [
      { value: 'never', label: 'Never smoked' },
      { value: 'exSmoker', label: 'Ex-smoker' },
      { value: 'currentSmoker', label: 'Current smoker' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Previous cardiovascular event',
    section: 'cardiovascularRisk', field: 'previousCvdEvent', options: yesNo
  }));

  card.appendChild(textInput({
    label: 'QRISK score', section: 'cardiovascularRisk', field: 'qriskScore',
    type: 'number', step: 0.1, min: 0, max: 100, unit: '%', placeholder: 'e.g. 15.2'
  }));

  return card;
}

/** Step 7 - Self-Care & Lifestyle. */
function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Self-Care & Lifestyle',
    description: 'Diet, exercise, and self-management behaviours.'
  });

  card.appendChild(likertGroup({
    label: 'Diet adherence (following the recommended dietary plan)',
    section: 'selfCareLifestyle', field: 'dietAdherence',
    labels: ['Very poor', 'Poor', 'Fair', 'Good', 'Excellent']
  }));

  card.appendChild(radioGroup({
    label: 'Carbohydrate counting',
    section: 'selfCareLifestyle', field: 'carbCounting', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Physical activity level',
    section: 'selfCareLifestyle', field: 'physicalActivity',
    options: [
      { value: 'sedentary', label: 'Sedentary' },
      { value: 'minimal', label: 'Minimal (light activity)' },
      { value: 'moderate', label: 'Moderate (some regular exercise)' },
      { value: 'regular', label: 'Regular (150+ min / week)' },
      { value: 'veryActive', label: 'Very active' }
    ]
  }));

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(textInput({
    label: 'BMI', section: 'selfCareLifestyle', field: 'bmi',
    type: 'number', step: 0.1, min: 10, max: 80, unit: 'kg/m²', placeholder: 'e.g. 28.5'
  }));
  row1.appendChild(selectInput({
    label: 'Recent weight change',
    section: 'selfCareLifestyle', field: 'weightChange',
    options: [
      { value: 'stable', label: 'Stable' },
      { value: 'gained', label: 'Weight gain' },
      { value: 'lost', label: 'Weight loss' },
      { value: 'significantGain', label: 'Significant gain (>5kg)' },
      { value: 'significantLoss', label: 'Significant loss (>5kg)' }
    ]
  }));
  card.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'two-col';
  row2.appendChild(selectInput({
    label: 'Alcohol consumption',
    section: 'selfCareLifestyle', field: 'alcoholConsumption',
    options: [
      { value: 'none', label: 'None' },
      { value: 'withinLimits', label: 'Within recommended limits' },
      { value: 'aboveLimits', label: 'Above recommended limits' },
      { value: 'excessive', label: 'Excessive' }
    ]
  }));
  row2.appendChild(selectInput({
    label: 'Smoking cessation support',
    section: 'selfCareLifestyle', field: 'smokingCessation',
    options: [
      { value: 'notApplicable', label: 'Not applicable (non-smoker)' },
      { value: 'offered', label: 'Offered' },
      { value: 'declined', label: 'Declined' },
      { value: 'ongoing', label: 'Ongoing programme' }
    ]
  }));
  card.appendChild(row2);

  return card;
}

/** Step 8 - Psychological Wellbeing. */
function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Psychological Wellbeing',
    description: 'Psychological impact of diabetes and support needs.'
  });

  card.appendChild(likertGroup({
    label: 'Diabetes distress (how bothered are you by managing diabetes?)',
    section: 'psychologicalWellbeing', field: 'diabetesDistress',
    labels: ['Not at all', 'A little', 'Moderate', 'Quite a bit', 'Very much']
  }));

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(textInput({
    label: 'Depression screening (PHQ-2)', section: 'psychologicalWellbeing', field: 'depressionScreening',
    type: 'number', min: 0, max: 10, placeholder: '0-6 typical'
  }));
  row1.appendChild(textInput({
    label: 'Anxiety screening (GAD-2)', section: 'psychologicalWellbeing', field: 'anxietyScreening',
    type: 'number', min: 0, max: 10, placeholder: '0-6 typical'
  }));
  card.appendChild(row1);

  card.appendChild(radioGroup({
    label: 'Eating disorder concerns',
    section: 'psychologicalWellbeing', field: 'eatingDisorder', options: yesNo
  }));

  card.appendChild(likertGroup({
    label: 'Fear of hypoglycaemia',
    section: 'psychologicalWellbeing', field: 'fearOfHypoglycaemia',
    labels: ['None', 'Mild', 'Moderate', 'Significant', 'Severe']
  }));

  card.appendChild(likertGroup({
    label: 'Coping ability (how well are you managing living with diabetes?)',
    section: 'psychologicalWellbeing', field: 'copingAbility',
    labels: ['Very poor', 'Poor', 'Fair', 'Good', 'Very good']
  }));

  card.appendChild(radioGroup({
    label: 'Needs psychological support',
    section: 'psychologicalWellbeing', field: 'needsSupport', options: yesNo
  }));

  return card;
}

/** Step 9 - Foot Assessment. */
function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Foot Assessment',
    description: 'Comprehensive diabetic foot examination findings.'
  });

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(selectInput({
    label: 'Foot pulses',
    section: 'footAssessment', field: 'footPulses',
    options: [
      { value: 'present', label: 'Present' },
      { value: 'reduced', label: 'Reduced' },
      { value: 'absent', label: 'Absent' }
    ]
  }));
  row1.appendChild(selectInput({
    label: '10g monofilament test',
    section: 'footAssessment', field: 'monofilamentTest',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'abnormal', label: 'Abnormal' }
    ]
  }));
  card.appendChild(row1);

  card.appendChild(selectInput({
    label: 'Vibration sense (128 Hz tuning fork)',
    section: 'footAssessment', field: 'vibrationSense',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'reduced', label: 'Reduced' },
      { value: 'absent', label: 'Absent' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Foot deformity',
    section: 'footAssessment', field: 'footDeformity', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Callus present',
    section: 'footAssessment', field: 'callusPresent', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Active foot ulcer',
    section: 'footAssessment', field: 'ulcerPresent', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Previous amputation',
    section: 'footAssessment', field: 'previousAmputation', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Foot risk category',
    section: 'footAssessment', field: 'footRiskCategory',
    options: [
      { value: 'low', label: 'Low risk' },
      { value: 'moderate', label: 'Moderate risk' },
      { value: 'high', label: 'High risk' }
    ]
  }));

  return card;
}

/** Step 10 - Clinical Review and Care Plan. */
function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Clinical Review',
    description: 'Care plan, referrals, and follow-up arrangements.'
  });

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(textInput({
    label: 'Clinician name', section: 'reviewCarePlan', field: 'clinicianName',
    placeholder: 'e.g. Dr Johnson'
  }));
  row1.appendChild(textInput({
    label: 'Review date', section: 'reviewCarePlan', field: 'reviewDate', type: 'date'
  }));
  card.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'two-col';
  row2.appendChild(textInput({
    label: 'Agreed HbA1c target', section: 'reviewCarePlan', field: 'hba1cTargetAgreed',
    type: 'number', step: 0.1, min: 0, placeholder: 'e.g. 53 mmol/mol or 7.0%'
  }));
  row2.appendChild(radioGroup({
    label: 'Care plan updated',
    section: 'reviewCarePlan', field: 'carePlanUpdated', options: yesNo
  }));
  card.appendChild(row2);

  card.appendChild(textArea({
    label: 'Clinical notes', section: 'reviewCarePlan', field: 'clinicalNotes',
    rows: 4, placeholder: 'Summary of clinical findings and discussion'
  }));
  card.appendChild(textArea({
    label: 'Referrals made', section: 'reviewCarePlan', field: 'referrals',
    rows: 3, placeholder: 'e.g. Ophthalmology, Podiatry, Dietetics, Psychology'
  }));
  card.appendChild(textInput({
    label: 'Next review date', section: 'reviewCarePlan', field: 'nextReviewDate', type: 'date'
  }));

  return card;
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

const TRACKED_FIELDS = [
  // Demographics (8)
  ['patientInformation', 'fullName'],
  ['patientInformation', 'dateOfBirth'],
  ['patientInformation', 'nhsNumber'],
  ['patientInformation', 'telephone'],
  ['patientInformation', 'address'],
  ['patientInformation', 'email'],
  ['patientInformation', 'gpName'],
  ['patientInformation', 'gpPractice'],
  // Diabetes history (6)
  ['diabetesHistory', 'diabetesType'],
  ['diabetesHistory', 'ageAtDiagnosis'],
  ['diabetesHistory', 'yearsDuration'],
  ['diabetesHistory', 'diagnosisMethod'],
  ['diabetesHistory', 'familyHistory'],
  ['diabetesHistory', 'autoantibodiesTested'],
  // Glycaemic control (9)
  ['glycaemicControl', 'hba1cValue'],
  ['glycaemicControl', 'hba1cUnit'],
  ['glycaemicControl', 'hba1cTarget'],
  ['glycaemicControl', 'fastingGlucose'],
  ['glycaemicControl', 'postprandialGlucose'],
  ['glycaemicControl', 'glucoseMonitoringType'],
  ['glycaemicControl', 'hypoglycaemiaFrequency'],
  ['glycaemicControl', 'severeHypoglycaemia'],
  ['glycaemicControl', 'timeInRange'],
  // Medications (core)
  ['medications', 'metformin'],
  ['medications', 'sulfonylurea'],
  ['medications', 'sglt2Inhibitor'],
  ['medications', 'glp1Agonist'],
  ['medications', 'dpp4Inhibitor'],
  ['medications', 'insulin'],
  ['medications', 'medicationAdherence'],
  // Complications (8)
  ['complicationsScreening', 'retinopathyStatus'],
  ['complicationsScreening', 'lastEyeScreening'],
  ['complicationsScreening', 'nephropathyStatus'],
  ['complicationsScreening', 'egfr'],
  ['complicationsScreening', 'urineAcr'],
  ['complicationsScreening', 'neuropathySymptoms'],
  ['complicationsScreening', 'autonomicNeuropathy'],
  ['complicationsScreening', 'erectileDysfunction'],
  // Cardiovascular (9)
  ['cardiovascularRisk', 'systolicBp'],
  ['cardiovascularRisk', 'diastolicBp'],
  ['cardiovascularRisk', 'onAntihypertensive'],
  ['cardiovascularRisk', 'totalCholesterol'],
  ['cardiovascularRisk', 'ldlCholesterol'],
  ['cardiovascularRisk', 'onStatin'],
  ['cardiovascularRisk', 'smokingStatus'],
  ['cardiovascularRisk', 'previousCvdEvent'],
  ['cardiovascularRisk', 'qriskScore'],
  // Self-care (7)
  ['selfCareLifestyle', 'dietAdherence'],
  ['selfCareLifestyle', 'carbCounting'],
  ['selfCareLifestyle', 'physicalActivity'],
  ['selfCareLifestyle', 'bmi'],
  ['selfCareLifestyle', 'weightChange'],
  ['selfCareLifestyle', 'alcoholConsumption'],
  ['selfCareLifestyle', 'smokingCessation'],
  // Psychological (7)
  ['psychologicalWellbeing', 'diabetesDistress'],
  ['psychologicalWellbeing', 'depressionScreening'],
  ['psychologicalWellbeing', 'anxietyScreening'],
  ['psychologicalWellbeing', 'eatingDisorder'],
  ['psychologicalWellbeing', 'fearOfHypoglycaemia'],
  ['psychologicalWellbeing', 'copingAbility'],
  ['psychologicalWellbeing', 'needsSupport'],
  // Foot (8)
  ['footAssessment', 'footPulses'],
  ['footAssessment', 'monofilamentTest'],
  ['footAssessment', 'vibrationSense'],
  ['footAssessment', 'footDeformity'],
  ['footAssessment', 'callusPresent'],
  ['footAssessment', 'ulcerPresent'],
  ['footAssessment', 'previousAmputation'],
  ['footAssessment', 'footRiskCategory'],
  // Review (7)
  ['reviewCarePlan', 'clinicianName'],
  ['reviewCarePlan', 'reviewDate'],
  ['reviewCarePlan', 'hba1cTargetAgreed'],
  ['reviewCarePlan', 'carePlanUpdated'],
  ['reviewCarePlan', 'clinicalNotes'],
  ['reviewCarePlan', 'referrals'],
  ['reviewCarePlan', 'nextReviewDate']
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

// ----------------------------------------------------------------------
// Step-list + validation (Lily)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'patientInformation', title: 'Demographics' },
  { step: 2, section: 'diabetesHistory', title: 'Diabetes History' },
  { step: 3, section: 'glycaemicControl', title: 'Glycaemic Control' },
  { step: 4, section: 'medications', title: 'Medications' },
  { step: 5, section: 'complicationsScreening', title: 'Complications Screening' },
  { step: 6, section: 'cardiovascularRisk', title: 'Cardiovascular Risk' },
  { step: 7, section: 'selfCareLifestyle', title: 'Self-Care & Lifestyle' },
  { step: 8, section: 'psychologicalWellbeing', title: 'Psychological Wellbeing' },
  { step: 9, section: 'footAssessment', title: 'Foot Assessment' },
  { step: 10, section: 'reviewCarePlan', title: 'Clinical Review' }
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
    li.setAttribute('aria-label', 'Step ' + def.step + ': ' + def.title);
    li.innerHTML = '<span>' + esc(def.title) + '</span>';
    li.addEventListener('click', () => {
      const target = document.getElementById('step-' + def.step);
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
    const li = ol.querySelector('[data-step="' + def.step + '"]');
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
  const current = ol.querySelector('[data-step="' + firstUnfinished + '"]');
  if (current) {
    current.setAttribute('aria-current', 'step');
    if (current.dataset.status === 'waiting') {
      current.dataset.status = 'in-progress';
    }
  }
  ol.dataset.current = String(firstUnfinished - 1);
}

function clearFieldError(id) {
  const el = document.getElementById(id + '-error');
  if (el) el.textContent = '';
  const input = document.getElementById(id);
  if (input) input.removeAttribute('aria-invalid');
  const fs = document.getElementById(id + '-fieldset');
  if (fs) fs.removeAttribute('aria-invalid');
}

function setFieldError(id, message) {
  const el = document.getElementById(id + '-error');
  if (el) el.textContent = message;
  const input = document.getElementById(id);
  if (input) input.setAttribute('aria-invalid', 'true');
}

function validateForm() {
  const errors = [];
  const form = document.getElementById('assessment-form');
  if (!form) return errors;
  const required = form.querySelectorAll('[data-required]');
  const seenGroups = new Set();
  required.forEach((input) => {
    const id = input.id;
    if (input.type === 'radio') {
      const groupName = input.name;
      if (seenGroups.has(groupName)) return;
      seenGroups.add(groupName);
      const checked = form.querySelector('input[name="' + groupName + '"]:checked');
      const fsEl = document.getElementById(groupName + '-fieldset');
      const labelEl = fsEl ? fsEl.querySelector('legend') : null;
      const label = labelEl ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim() : groupName;
      if (!checked) {
        errors.push({ id: groupName, message: label + ' is required' });
        setFieldError(groupName, label + ' is required');
      } else {
        clearFieldError(groupName);
      }
      return;
    }
    const value = (input.value || '').trim();
    const labelEl = form.querySelector('label[for="' + id + '"]');
    const label = labelEl ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim() : id;
    if (!value) {
      errors.push({ id: id, message: label + ' is required' });
      setFieldError(id, label + ' is required');
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
      '<li><a href="#' + esc(e.id) + '">' + esc(e.message) + '</a></li>'
    ).join('') +
    '</ul>';
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (typeof summary.focus === 'function') {
    summary.setAttribute('tabindex', '-1');
    summary.focus({ preventScroll: true });
  }
}

function priorityClass(priority) {
  switch (priority) {
    case 'high': return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

function concernClass(level) {
  switch (level) {
    case 'high': return 'concern-high';
    case 'medium': return 'concern-medium';
    case 'low': return 'concern-low';
    default: return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { controlLevel, controlScore, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td><span class="concern-badge ${concernClass(r.concernLevel)}">${esc(r.concernLevel)}</span></td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No diabetes rules fired.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Finding</th>
            <th scope="col">Concern</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const hba1cConverted = hba1cMmolMol(state);
  const hba1cLine = hba1cConverted === null
    ? '<p class="muted">No HbA1c value recorded.</p>'
    : `<p class="muted">HbA1c (normalised): <strong>${Math.round(hba1cConverted)} mmol/mol</strong>.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Diabetes Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Control Level</h3>
      <p class="control-summary">
        <span class="control-badge ${controlLevelClass(controlLevel)}">${esc(controlLevelLabel(controlLevel))}</span>
        <span class="control-score">Composite score: <strong>${controlScore}</strong> / 100</span>
      </p>
      ${hba1cLine}

      <h3>Fired Rules</h3>
      ${firedTable}

      <h3>Flagged Issues</h3>
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
  const errors = validateForm();
  if (errors.length > 0) return;
  const { controlLevel, controlScore, firedRules } = calculateControl(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    controlLevel,
    controlScore,
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
  const report = document.getElementById('report');
  if (report) report.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
