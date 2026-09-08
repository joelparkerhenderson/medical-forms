import { evaluateEligibility } from './eligibility-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { bmiCategory, calculateAge, calculateBMI, eligibilityClass, eligibilityLabel, emptyAssessment } from './types.js';

// Semaglutide Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure eligibility scoring engine and renders an inline report.
// State is persisted to localStorage so a partial fill survives a reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'semaglutide-assessment.front-end-form-with-html.v1';

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
      fresh[key] = Object.assign({}, fresh[key], parsed[key]);
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
  slug: 'semaglutide-assessment',
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
    refreshAutoCalculatedReadouts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
 *
 * @param {string} section
 * @param {string} field
 * @param {*} value
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
  state.bodyComposition.bmi = calculateBMI(
    state.bodyComposition.heightCm,
    state.bodyComposition.weightKg
  );
}

/** Escape user-entered text for safe rendering. */
function esc(s) {
  return String(s == null ? '' : s)
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
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${lilyInputClass(type)}"`,
    `value="${esc(value == null ? '' : value)}"`,
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

function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] || '';
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
  ta.addEventListener('input', () => { setField(opts.section, opts.field, ta.value); clearFieldError(id); });
  return wrapper;
}

function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] || '';
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
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => { setField(opts.section, opts.field, sel.value); clearFieldError(id); });
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
  wrapper.appendChild(errSpan);
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
    `<span class="section-step">Section ${opts.stepNumber} of 10</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

/**
 * Subsection heading inside a section card.
 * @param {string} text
 */
function subhead(text) {
  const h = document.createElement('h3');
  h.className = 'subhead';
  h.textContent = text;
  return h;
}

/**
 * Inline notice / banner.
 * @param {string} text
 * @param {'info' | 'warning' | 'danger'} variant
 */
function notice(text, variant) {
  const div = document.createElement('div');
  div.className = `notice notice-${variant}`;
  div.textContent = text;
  return div;
}

// ----------------------------------------------------------------------
// Repeating-list editor (medications: name / dose / frequency)
// ----------------------------------------------------------------------

/**
 * Editor for an array of {name, dose, frequency} medication rows.
 * @param {{ section: string, field: string, addLabel: string, emptyText: string }} opts
 */
function medicationListEditor(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';
  wrapper.dataset.list = `${opts.section}.${opts.field}`;

  function rerender() {
    const rows = state[opts.section][opts.field];
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = opts.emptyText || 'None added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row med-row';
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Metformin">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 500 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. BD, OD">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove medication">&times;</button>
        </div>
      `;
      r.querySelectorAll('input').forEach((inp) => {
        inp.addEventListener('input', () => {
          const k = inp.dataset.key;
          rows[idx][k] = inp.value;
          saveState(state);
          updateProgress();
        });
      });
      r.querySelector('button').addEventListener('click', () => {
        rows.splice(idx, 1);
        saveState(state);
        rerender();
        updateProgress();
      });
      wrapper.appendChild(r);
    });
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'button';
    addBtn.setAttribute('data-variant', 'add');
    addBtn.textContent = `+ ${opts.addLabel}`;
    addBtn.addEventListener('click', () => {
      rows.push({ name: '', dose: '', frequency: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

// ----------------------------------------------------------------------
// Section renderers (1 per assessment step, 10 total)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic patient information.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'demographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Date of Birth',
    section: 'demographics',
    field: 'dob',
    type: 'date',
    required: true
  }));
  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'demographics',
    field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Indication & Goals',
    description: 'Primary reason for considering semaglutide therapy and treatment objectives.'
  });

  card.appendChild(radioGroup({
    label: 'Primary Indication',
    section: 'indicationGoals',
    field: 'primaryIndication',
    options: [
      { value: 'type2-diabetes', label: 'Type 2 Diabetes' },
      { value: 'weight-management', label: 'Weight Management' },
      { value: 'cardiovascular-risk-reduction', label: 'Cardiovascular Risk Reduction' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Target Weight Loss',
    section: 'indicationGoals',
    field: 'weightLossGoalPercent',
    type: 'number', min: 0, max: 30, step: 1,
    unit: '% of body weight'
  }));

  card.appendChild(textArea({
    label: 'Previous Weight Loss Attempts',
    section: 'indicationGoals',
    field: 'previousWeightLossAttempts',
    placeholder: 'e.g., diet programmes, exercise regimens, previous medications…',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Motivation Level',
    section: 'indicationGoals',
    field: 'motivationLevel',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high', label: 'High' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Body Composition',
    description: 'Anthropometric measurements for eligibility assessment.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Height',
    section: 'bodyComposition', field: 'heightCm',
    type: 'number', min: 50, max: 250, step: 0.1, unit: 'cm', required: true
  }));
  grid.appendChild(textInput({
    label: 'Weight',
    section: 'bodyComposition', field: 'weightKg',
    type: 'number', min: 20, max: 300, step: 0.1, unit: 'kg', required: true
  }));
  card.appendChild(grid);

  // BMI banner placeholder
  const banner = document.createElement('div');
  banner.id = 'bmi-banner';
  banner.className = 'bmi-banner';
  banner.style.display = 'none';
  banner.innerHTML = `
    <div class="bmi-banner-label">Calculated BMI</div>
    <div class="bmi-banner-value" id="bmi-banner-value">—</div>
    <div class="bmi-banner-cat" id="bmi-banner-cat"></div>
  `;
  card.appendChild(banner);

  card.appendChild(textInput({
    label: 'Waist Circumference',
    section: 'bodyComposition', field: 'waistCircumference',
    type: 'number', min: 40, max: 200, step: 0.1, unit: 'cm'
  }));
  card.appendChild(textInput({
    label: 'Body Fat Percentage',
    section: 'bodyComposition', field: 'bodyFatPercent',
    type: 'number', min: 3, max: 60, step: 0.1, unit: '%'
  }));
  card.appendChild(textInput({
    label: 'Previous Maximum Weight',
    section: 'bodyComposition', field: 'previousMaxWeight',
    type: 'number', min: 20, max: 400, step: 0.1, unit: 'kg'
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Metabolic Profile',
    description: 'Key metabolic markers relevant to semaglutide prescribing.'
  });

  card.appendChild(subhead('Glycaemic Control'));
  const glyGrid = document.createElement('div');
  glyGrid.className = 'two-col';
  glyGrid.appendChild(textInput({
    label: 'HbA1c',
    section: 'metabolicProfile', field: 'hba1c',
    type: 'number', min: 3, max: 20, step: 0.1, unit: '%'
  }));
  glyGrid.appendChild(textInput({
    label: 'Fasting Glucose',
    section: 'metabolicProfile', field: 'fastingGlucose',
    type: 'number', min: 1, max: 30, step: 0.1, unit: 'mmol/L'
  }));
  card.appendChild(glyGrid);
  card.appendChild(textInput({
    label: 'Fasting Insulin Level',
    section: 'metabolicProfile', field: 'insulinLevel',
    type: 'number', min: 0, max: 200, step: 0.1, unit: 'mIU/L'
  }));

  card.appendChild(subhead('Lipid Profile'));
  const lipGrid = document.createElement('div');
  lipGrid.className = 'two-col';
  lipGrid.appendChild(textInput({
    label: 'Total Cholesterol',
    section: 'metabolicProfile', field: 'totalCholesterol',
    type: 'number', min: 1, max: 15, step: 0.1, unit: 'mmol/L'
  }));
  lipGrid.appendChild(textInput({
    label: 'LDL Cholesterol',
    section: 'metabolicProfile', field: 'ldl',
    type: 'number', min: 0, max: 10, step: 0.1, unit: 'mmol/L'
  }));
  lipGrid.appendChild(textInput({
    label: 'HDL Cholesterol',
    section: 'metabolicProfile', field: 'hdl',
    type: 'number', min: 0, max: 5, step: 0.1, unit: 'mmol/L'
  }));
  lipGrid.appendChild(textInput({
    label: 'Triglycerides',
    section: 'metabolicProfile', field: 'triglycerides',
    type: 'number', min: 0, max: 20, step: 0.1, unit: 'mmol/L'
  }));
  card.appendChild(lipGrid);

  card.appendChild(subhead('Thyroid'));
  card.appendChild(textInput({
    label: 'Thyroid Function',
    section: 'metabolicProfile', field: 'thyroidFunction',
    placeholder: 'e.g., Normal, Hypothyroid, Hyperthyroid, TSH level…'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Cardiovascular Risk',
    description: 'Cardiovascular history and risk assessment.'
  });

  card.appendChild(subhead('Blood Pressure & Heart Rate'));
  const bpGrid = document.createElement('div');
  bpGrid.className = 'three-col';
  bpGrid.appendChild(textInput({
    label: 'Systolic BP',
    section: 'cardiovascularRisk', field: 'bloodPressureSystolic',
    type: 'number', min: 60, max: 250, unit: 'mmHg'
  }));
  bpGrid.appendChild(textInput({
    label: 'Diastolic BP',
    section: 'cardiovascularRisk', field: 'bloodPressureDiastolic',
    type: 'number', min: 30, max: 150, unit: 'mmHg'
  }));
  bpGrid.appendChild(textInput({
    label: 'Heart Rate',
    section: 'cardiovascularRisk', field: 'heartRate',
    type: 'number', min: 30, max: 200, unit: 'bpm'
  }));
  card.appendChild(bpGrid);

  card.appendChild(subhead('Cardiovascular History'));
  card.appendChild(radioGroup({
    label: 'Previous myocardial infarction (heart attack)',
    section: 'cardiovascularRisk', field: 'previousMI', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Heart failure',
    section: 'cardiovascularRisk', field: 'heartFailure', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Peripheral vascular disease',
    section: 'cardiovascularRisk', field: 'peripheralVascularDisease', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Cerebrovascular disease (stroke/TIA)',
    section: 'cardiovascularRisk', field: 'cerebrovascularDisease', options: yesNo
  }));

  card.appendChild(subhead('Risk Score'));
  card.appendChild(textInput({
    label: 'QRISK Score',
    section: 'cardiovascularRisk', field: 'qriskScore',
    type: 'number', min: 0, max: 100, step: 0.1, unit: '%'
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Contraindications Screening',
    description: 'Please answer all questions carefully. These determine eligibility for semaglutide therapy.'
  });

  card.appendChild(notice(
    "Answering 'Yes' to any of the first seven questions may affect your eligibility for semaglutide treatment.",
    'warning'
  ));

  card.appendChild(radioGroup({
    label: 'Do you have a personal history of medullary thyroid carcinoma (MTC)?',
    section: 'contraindicationsScreening', field: 'personalHistoryMTC', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have a family history of medullary thyroid carcinoma (MTC)?',
    section: 'contraindicationsScreening', field: 'familyHistoryMTC', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have you been diagnosed with Multiple Endocrine Neoplasia syndrome type 2 (MEN2)?',
    section: 'contraindicationsScreening', field: 'men2Syndrome', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have a history of pancreatitis?',
    section: 'contraindicationsScreening', field: 'pancreatitisHistory', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have severe gastrointestinal disease?',
    section: 'contraindicationsScreening', field: 'severeGIDisease', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Are you currently pregnant or planning to become pregnant?',
    section: 'contraindicationsScreening', field: 'pregnancyPlanned', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Are you currently breastfeeding?',
    section: 'contraindicationsScreening', field: 'breastfeeding', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have type 1 diabetes?',
    section: 'contraindicationsScreening', field: 'type1Diabetes', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have severe diabetic retinopathy?',
    section: 'contraindicationsScreening', field: 'diabeticRetinopathySevere', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have a known allergy or hypersensitivity to semaglutide?',
    section: 'contraindicationsScreening', field: 'allergySemaglutide', options: yesNo
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Gastrointestinal History',
    description: 'GI conditions relevant to semaglutide tolerability and safety.'
  });

  card.appendChild(radioGroup({
    label: 'History of nausea',
    section: 'gastrointestinalHistory', field: 'nauseaHistory', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'History of vomiting',
    section: 'gastrointestinalHistory', field: 'vomitingHistory', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Gastroparesis (delayed gastric emptying)',
    section: 'gastrointestinalHistory', field: 'gastroparesis', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'History of gallstones (cholelithiasis)',
    section: 'gastrointestinalHistory', field: 'gallstoneHistory', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Inflammatory bowel disease (IBD)',
    section: 'gastrointestinalHistory', field: 'ibd', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Gastro-oesophageal reflux disease (GERD)',
    section: 'gastrointestinalHistory', field: 'gerdHistory', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Previous bariatric surgery',
    section: 'gastrointestinalHistory', field: 'previousBariatricSurgery', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Current GI Symptoms',
    section: 'gastrointestinalHistory', field: 'currentGISymptoms',
    placeholder: 'Describe any current gastrointestinal symptoms…',
    rows: 3
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Current Medications',
    description: 'Current pharmacological treatments — important for interaction assessment.'
  });

  card.appendChild(radioGroup({
    label: 'Currently on insulin therapy?',
    section: 'currentMedications', field: 'insulinTherapy', options: yesNo
  }));

  const insulinDetails = document.createElement('div');
  insulinDetails.dataset.conditional = 'currentMedications.insulinTherapy=yes';
  insulinDetails.appendChild(textInput({
    label: 'Insulin Type and Regimen',
    section: 'currentMedications', field: 'insulinType',
    placeholder: 'e.g., Basal insulin glargine 20 units, Rapid-acting insulin aspart…'
  }));
  card.appendChild(insulinDetails);

  card.appendChild(radioGroup({
    label: 'Currently on sulfonylureas?',
    section: 'currentMedications', field: 'sulfonylureas', options: yesNo
  }));

  const otherDmHeader = document.createElement('div');
  otherDmHeader.className = 'list-section-header';
  otherDmHeader.innerHTML = '<h3>Other Diabetes Medications</h3>';
  card.appendChild(otherDmHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'otherDiabetesMedications',
    addLabel: 'Add diabetes medication',
    emptyText: 'No other diabetes medications added.'
  }));

  const ahHeader = document.createElement('div');
  ahHeader.className = 'list-section-header';
  ahHeader.innerHTML = '<h3>Antihypertensives</h3>';
  card.appendChild(ahHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'antihypertensives',
    addLabel: 'Add antihypertensive',
    emptyText: 'No antihypertensives added.'
  }));

  const llHeader = document.createElement('div');
  llHeader.className = 'list-section-header';
  llHeader.innerHTML = '<h3>Lipid-Lowering Medications</h3>';
  card.appendChild(llHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'lipidLowering',
    addLabel: 'Add lipid-lowering medication',
    emptyText: 'No lipid-lowering medications added.'
  }));

  const otherHeader = document.createElement('div');
  otherHeader.className = 'list-section-header';
  otherHeader.innerHTML = '<h3>Other Medications</h3>';
  card.appendChild(otherHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'otherMedications',
    addLabel: 'Add other medication',
    emptyText: 'No other medications added.'
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Mental Health Screening',
    description: 'These questions help assess suitability for weight management medication. All responses are confidential.'
  });

  card.appendChild(notice(
    'Your mental wellbeing is important. Please answer honestly — there are no wrong answers, and your responses help us provide safe, appropriate care.',
    'info'
  ));

  card.appendChild(radioGroup({
    label: 'Do you have a history of an eating disorder (e.g., anorexia nervosa, bulimia nervosa, binge eating disorder)?',
    section: 'mentalHealthScreening', field: 'eatingDisorderHistory', options: yesNo
  }));

  const edDetails = document.createElement('div');
  edDetails.dataset.conditional = 'mentalHealthScreening.eatingDisorderHistory=yes';
  edDetails.appendChild(textArea({
    label: 'Please provide details about your eating disorder history',
    section: 'mentalHealthScreening', field: 'eatingDisorderDetails',
    placeholder: 'Type, duration, treatment received…',
    rows: 3
  }));
  card.appendChild(edDetails);

  card.appendChild(radioGroup({
    label: 'Do you have a history of depression?',
    section: 'mentalHealthScreening', field: 'depressionHistory', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Are you currently experiencing thoughts of self-harm or suicide?',
    section: 'mentalHealthScreening', field: 'suicidalIdeation', options: yesNo
  }));

  const siNotice = document.createElement('div');
  siNotice.dataset.conditional = 'mentalHealthScreening.suicidalIdeation=yes';
  siNotice.appendChild(notice(
    'If you are in immediate danger, please contact emergency services (999) or the Samaritans (116 123). Your safety is the priority.',
    'danger'
  ));
  card.appendChild(siNotice);

  card.appendChild(radioGroup({
    label: 'Do you experience body dysmorphia (persistent distress about perceived flaws in physical appearance)?',
    section: 'mentalHealthScreening', field: 'bodyDysmorphia', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do you have a history of binge drinking or alcohol misuse?',
    section: 'mentalHealthScreening', field: 'bingeDrinkingHistory', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Current Mental Health Treatment',
    section: 'mentalHealthScreening', field: 'currentMentalHealthTreatment',
    placeholder: 'e.g., counselling, CBT, psychiatric medication…',
    rows: 3
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Treatment Plan',
    description: 'Proposed semaglutide treatment plan and monitoring schedule.'
  });

  card.appendChild(radioGroup({
    label: 'Selected Formulation',
    section: 'treatmentPlan', field: 'selectedFormulation',
    options: [
      { value: 'subcutaneous-weekly', label: 'Subcutaneous (weekly injection)' },
      { value: 'oral-daily', label: 'Oral (daily tablet)' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Starting Dose',
    section: 'treatmentPlan', field: 'startingDose',
    options: [
      { value: '0.25mg', label: '0.25 mg (initiation dose)' },
      { value: '0.5mg', label: '0.5 mg' },
      { value: '1mg', label: '1 mg' },
      { value: '3mg-oral', label: '3 mg oral (initiation dose)' },
      { value: '7mg-oral', label: '7 mg oral' },
      { value: '14mg-oral', label: '14 mg oral' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Titration Schedule',
    section: 'treatmentPlan', field: 'titrationSchedule',
    placeholder: 'e.g., Increase dose every 4 weeks per standard protocol'
  }));

  card.appendChild(selectInput({
    label: 'Monitoring Frequency',
    section: 'treatmentPlan', field: 'monitoringFrequency',
    options: [
      { value: 'Weekly', label: 'Weekly' },
      { value: 'Fortnightly', label: 'Fortnightly' },
      { value: 'Monthly', label: 'Monthly' },
      { value: 'Quarterly', label: 'Quarterly' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Dietary guidance provided?',
    section: 'treatmentPlan', field: 'dietaryGuidance', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Exercise plan discussed?',
    section: 'treatmentPlan', field: 'exercisePlan', options: yesNo
  }));

  card.appendChild(textInput({
    label: 'Follow-up Appointment',
    section: 'treatmentPlan', field: 'followUpWeeks',
    type: 'number', min: 1, max: 52, step: 1, unit: 'weeks'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections + auto-calculated readouts
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const eq = expr.indexOf('=');
    const path = expr.slice(0, eq);
    const target = expr.slice(eq + 1);
    const dot = path.indexOf('.');
    const section = path.slice(0, dot);
    const field = path.slice(dot + 1);
    const current = state[section] ? state[section][field] : undefined;
    host.style.display = String(current) === target ? '' : 'none';
  });
  document.querySelectorAll('[data-conditional-any]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-any');
    const eq = expr.indexOf('=');
    const path = expr.slice(0, eq);
    const targetCsv = expr.slice(eq + 1);
    const dot = path.indexOf('.');
    const section = path.slice(0, dot);
    const field = path.slice(dot + 1);
    const current = String(state[section] && state[section][field] != null ? state[section][field] : '');
    const targets = targetCsv.split(',');
    host.style.display = targets.includes(current) ? '' : 'none';
  });
}

function refreshAutoCalculatedReadouts() {
  const banner = document.getElementById('bmi-banner');
  if (!banner) return;
  const v = state.bodyComposition.bmi;
  if (v == null) {
    banner.style.display = 'none';
    return;
  }
  banner.style.display = '';
  const valEl = document.getElementById('bmi-banner-value');
  const catEl = document.getElementById('bmi-banner-cat');
  if (valEl) valEl.textContent = v.toFixed(1);
  if (catEl) catEl.textContent = bmiCategory(v);
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dob'],
  ['demographics', 'sex'],
  // Indication & goals
  ['indicationGoals', 'primaryIndication'],
  ['indicationGoals', 'motivationLevel'],
  // Body composition
  ['bodyComposition', 'heightCm'],
  ['bodyComposition', 'weightKg'],
  // Metabolic profile (key markers)
  ['metabolicProfile', 'hba1c'],
  ['metabolicProfile', 'fastingGlucose'],
  // Cardiovascular history
  ['cardiovascularRisk', 'previousMI'],
  ['cardiovascularRisk', 'heartFailure'],
  ['cardiovascularRisk', 'peripheralVascularDisease'],
  ['cardiovascularRisk', 'cerebrovascularDisease'],
  // Contraindications screening (10 yes/no)
  ['contraindicationsScreening', 'personalHistoryMTC'],
  ['contraindicationsScreening', 'familyHistoryMTC'],
  ['contraindicationsScreening', 'men2Syndrome'],
  ['contraindicationsScreening', 'pancreatitisHistory'],
  ['contraindicationsScreening', 'severeGIDisease'],
  ['contraindicationsScreening', 'pregnancyPlanned'],
  ['contraindicationsScreening', 'breastfeeding'],
  ['contraindicationsScreening', 'type1Diabetes'],
  ['contraindicationsScreening', 'diabeticRetinopathySevere'],
  ['contraindicationsScreening', 'allergySemaglutide'],
  // GI history (7 yes/no)
  ['gastrointestinalHistory', 'nauseaHistory'],
  ['gastrointestinalHistory', 'vomitingHistory'],
  ['gastrointestinalHistory', 'gastroparesis'],
  ['gastrointestinalHistory', 'gallstoneHistory'],
  ['gastrointestinalHistory', 'ibd'],
  ['gastrointestinalHistory', 'gerdHistory'],
  ['gastrointestinalHistory', 'previousBariatricSurgery'],
  // Current medications meta
  ['currentMedications', 'insulinTherapy'],
  ['currentMedications', 'sulfonylureas'],
  // Mental health screening
  ['mentalHealthScreening', 'eatingDisorderHistory'],
  ['mentalHealthScreening', 'depressionHistory'],
  ['mentalHealthScreening', 'suicidalIdeation'],
  ['mentalHealthScreening', 'bodyDysmorphia'],
  ['mentalHealthScreening', 'bingeDrinkingHistory'],
  // Treatment plan core
  ['treatmentPlan', 'selectedFormulation'],
  ['treatmentPlan', 'startingDose'],
  ['treatmentPlan', 'monitoringFrequency'],
  ['treatmentPlan', 'dietaryGuidance'],
  ['treatmentPlan', 'exercisePlan']
];

function isAnswered(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v !== '';
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    if (isAnswered(state[section][field])) {
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
  { step: 1,  section: 'demographics',                title: 'Demographics' },
  { step: 2,  section: 'indicationGoals',             title: 'Indication & Goals' },
  { step: 3,  section: 'bodyComposition',             title: 'Body Composition' },
  { step: 4,  section: 'metabolicProfile',            title: 'Metabolic Profile' },
  { step: 5,  section: 'cardiovascularRisk',          title: 'Cardiovascular Risk' },
  { step: 6,  section: 'contraindicationsScreening',  title: 'Contraindications' },
  { step: 7,  section: 'gastrointestinalHistory',     title: 'GI History' },
  { step: 8,  section: 'currentMedications',          title: 'Medications' },
  { step: 9,  section: 'mentalHealthScreening',       title: 'Mental Health' },
  { step: 10, section: 'treatmentPlan',               title: 'Treatment Plan' }
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
  const required = form.querySelectorAll('[data-required]');
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

function ruleTable(rules, emptyText) {
  if (!rules.length) {
    return `<p class="muted">${esc(emptyText)}</p>`;
  }
  const rows = rules.map((r) => `
    <tr>
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
      <td class="type-${esc(r.type)}">${esc(r.type.toUpperCase())}</td>
    </tr>
  `).join('');
  return `
    <table class="subscales">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Category</th>
          <th scope="col">Description</th>
          <th scope="col">Type</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    eligibilityStatus,
    bmi,
    bmiCategoryLabel,
    absoluteContraindications,
    relativeContraindications,
    monitoringFlags,
    timestamp
  } = lastResult;

  const flagsList = monitoringFlags.length === 0
    ? `<p class="muted">No additional monitoring flags raised.</p>`
    : `
      <ul class="flags">
        ${monitoringFlags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(String(f.priority).toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.message)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const bmiSummary = bmi == null
    ? `<span class="bmi-summary">BMI not calculated (height/weight required).</span>`
    : `<span class="bmi-summary">BMI <strong>${bmi.toFixed(1)}</strong> (${esc(bmiCategoryLabel)})</span>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Semaglutide Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Eligibility</h3>
      <p class="eligibility-summary">
        <span class="eligibility-badge ${eligibilityClass(eligibilityStatus)}">${esc(eligibilityLabel(eligibilityStatus))}</span>
        ${bmiSummary}
      </p>

      <h3>Absolute Contraindications</h3>
      ${ruleTable(absoluteContraindications, 'No absolute contraindications identified.')}

      <h3>Relative Contraindications</h3>
      ${ruleTable(relativeContraindications, 'No relative contraindications identified.')}

      <h3>Monitoring Flags</h3>
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
  const errs = validateForm();
  if (errs.length > 0) return;
  recomputeDerived();
  const result = evaluateEligibility(state);
  const monitoringFlags = detectAdditionalFlags(state);
  lastResult = {
    eligibilityStatus: result.eligibilityStatus,
    bmi: result.bmi,
    bmiCategoryLabel: result.bmiCategoryLabel,
    absoluteContraindications: result.absoluteContraindications,
    relativeContraindications: result.relativeContraindications,
    monitoringFlags,
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
  refreshAutoCalculatedReadouts();
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
