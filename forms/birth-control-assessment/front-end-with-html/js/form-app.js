import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateMECGrade } from './mec-grader.js';
import { bmiCategory, calculateAge, calculateBMI, emptyAssessment, mecCategoryClass, mecCategoryLabel, mecCategoryShort, methodDisplayName, riskLevelClass, riskLevelLabel } from './types.js';

// Birth Control Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure UK MEC grading engine and renders an inline report. State
// persists to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'birth-control-assessment.front-end-form-with-html.v1';

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
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'birth-control-assessment',
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
 * Set a field on the state and persist. Re-runs derived values, progress,
 * and conditional visibility.
 */
function setField(section, field, value) {
  state[section][field] = value;
  recomputeDerived();
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
}

function recomputeDerived() {
  state.demographics.bmi = calculateBMI(
    state.demographics.weight,
    state.demographics.height
  );
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
// Component builders
// ----------------------------------------------------------------------

/** Map an <input type=…> to its Lily class name. */
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
  ta.addEventListener('input', () => { setField(opts.section, opts.field, ta.value); clearFieldError(id); });
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
    `<span class="section-step">Step ${opts.stepNumber} of 10</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Reusable option arrays
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per step)
// ----------------------------------------------------------------------

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
    section: 'demographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));

  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'demographics', field: 'sex',
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'other', label: 'Other' }
    ]
  }));

  const measurements = document.createElement('div');
  measurements.className = 'three-col';
  measurements.appendChild(textInput({
    label: 'Weight', section: 'demographics', field: 'weight',
    type: 'number', min: 1, max: 400, unit: 'kg'
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'demographics', field: 'height',
    type: 'number', min: 50, max: 250, unit: 'cm'
  }));
  measurements.appendChild(readOnlyReadout({
    label: 'BMI',
    id: 'bmi-readout',
    render: () => {
      const bmi = state.demographics.bmi;
      if (bmi == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${bmi}</strong> <span class="muted">(${esc(bmiCategory(bmi))})</span>`;
    }
  }));
  card.appendChild(measurements);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Menstrual History',
    description: 'Your menstrual cycle and bleeding patterns.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Age at menarche', section: 'menstrualHistory', field: 'menarcheAge',
    type: 'number', min: 8, max: 18, unit: 'years'
  }));
  grid.appendChild(selectInput({
    label: 'Cycle regularity', section: 'menstrualHistory', field: 'cycleRegularity',
    options: [
      { value: 'regular', label: 'Regular' },
      { value: 'irregular', label: 'Irregular' },
      { value: 'absent', label: 'Absent' }
    ]
  }));
  card.appendChild(grid);

  const grid2 = document.createElement('div');
  grid2.className = 'two-col';
  grid2.appendChild(textInput({
    label: 'Cycle length', section: 'menstrualHistory', field: 'cycleLengthDays',
    type: 'number', min: 14, max: 60, unit: 'days'
  }));
  grid2.appendChild(textInput({
    label: 'Period duration', section: 'menstrualHistory', field: 'periodDurationDays',
    type: 'number', min: 1, max: 14, unit: 'days'
  }));
  card.appendChild(grid2);

  card.appendChild(selectInput({
    label: 'Flow heaviness', section: 'menstrualHistory', field: 'flowHeaviness',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'heavy', label: 'Heavy' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Bleeding between periods?',
    section: 'menstrualHistory', field: 'intermenstrualBleeding', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Bleeding after sexual intercourse?',
    section: 'menstrualHistory', field: 'postcoitalBleeding', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Period pain (dysmenorrhoea)',
    section: 'menstrualHistory', field: 'dysmenorrhoea',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Date of last menstrual period',
    section: 'menstrualHistory', field: 'lastMenstrualPeriod',
    type: 'date'
  }));

  card.appendChild(radioGroup({
    label: 'Periods absent (amenorrhoea)?',
    section: 'menstrualHistory', field: 'amenorrhoea', options: yesNo
  }));
  const amenDuration = document.createElement('div');
  amenDuration.dataset.conditional = 'menstrualHistory.amenorrhoea=yes';
  amenDuration.appendChild(textInput({
    label: 'Duration of absent periods',
    section: 'menstrualHistory', field: 'amenorrhoeaDurationMonths',
    type: 'number', min: 1, max: 600, unit: 'months'
  }));
  card.appendChild(amenDuration);

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Contraceptive History',
    description: 'Previous and current contraceptive methods.'
  });

  card.appendChild(radioGroup({
    label: 'Have you used any contraceptive method before?',
    section: 'contraceptiveHistory', field: 'previousContraception', options: yesNo
  }));

  const previousHost = document.createElement('div');
  previousHost.dataset.conditional = 'contraceptiveHistory.previousContraception=yes';

  function methodRow(label, yesField, detailsField, detailsPlaceholder) {
    const wrap = document.createElement('div');
    wrap.appendChild(radioGroup({
      label, section: 'contraceptiveHistory', field: yesField, options: yesNo
    }));
    const details = document.createElement('div');
    details.dataset.conditional = `contraceptiveHistory.${yesField}=yes`;
    details.appendChild(textInput({
      label: 'Details', section: 'contraceptiveHistory', field: detailsField,
      placeholder: detailsPlaceholder
    }));
    wrap.appendChild(details);
    return wrap;
  }

  previousHost.appendChild(methodRow('Combined oral contraception (COC)', 'previousCOC', 'cocDetails', 'Brand, duration, dates'));
  previousHost.appendChild(methodRow('Progestogen-only pill (POP)', 'previousPOP', 'popDetails', 'Brand, duration, dates'));
  previousHost.appendChild(methodRow('Contraceptive implant', 'previousImplant', 'implantDetails', 'Type, duration, dates'));
  previousHost.appendChild(methodRow('Contraceptive injection', 'previousInjection', 'injectionDetails', 'Brand, duration, dates'));
  previousHost.appendChild(methodRow('Copper IUD', 'previousIUD', 'iudDetails', 'Type, duration, dates'));
  previousHost.appendChild(methodRow('Hormonal IUS (Mirena)', 'previousIUS', 'iusDetails', 'Type, duration, dates'));
  previousHost.appendChild(methodRow('Patch or vaginal ring', 'previousPatchRing', 'patchRingDetails', 'Brand, duration, dates'));

  previousHost.appendChild(radioGroup({
    label: 'Barrier methods (condoms, diaphragm)?',
    section: 'contraceptiveHistory', field: 'previousBarrier', options: yesNo
  }));

  previousHost.appendChild(textArea({
    label: 'Reason for change or stopping',
    section: 'contraceptiveHistory', field: 'reasonForChange',
    placeholder: 'Side effects, ineffective, lifestyle change…',
    rows: 3
  }));
  previousHost.appendChild(textArea({
    label: 'Adverse effects experienced',
    section: 'contraceptiveHistory', field: 'adverseEffects',
    placeholder: 'Mood changes, weight gain, bleeding, headaches…',
    rows: 3
  }));

  card.appendChild(previousHost);
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Medical History',
    description: 'Past and current medical conditions relevant to contraception.'
  });

  card.appendChild(radioGroup({
    label: 'Do you suffer from migraines?',
    section: 'medicalHistory', field: 'migraine', options: yesNo
  }));

  const migraineDetails = document.createElement('div');
  migraineDetails.dataset.conditional = 'medicalHistory.migraine=yes';
  migraineDetails.appendChild(radioGroup({
    label: 'Are your migraines accompanied by aura (visual disturbances, sensory changes)?',
    section: 'medicalHistory', field: 'migraineWithAura', options: yesNo
  }));
  migraineDetails.appendChild(selectInput({
    label: 'Migraine frequency',
    section: 'medicalHistory', field: 'migraineFrequency',
    options: [
      { value: 'rare', label: 'Rare (less than monthly)' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'weekly', label: 'Weekly or more often' }
    ]
  }));
  card.appendChild(migraineDetails);

  card.appendChild(selectInput({
    label: 'Breast cancer status',
    section: 'medicalHistory', field: 'breastCancer',
    options: [
      { value: 'no', label: 'No history of breast cancer' },
      { value: 'current', label: 'Current breast cancer' },
      { value: 'past-5-years', label: 'Past breast cancer (within 5 years)' },
      { value: 'past-over-5-years', label: 'Past breast cancer (more than 5 years ago)' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'History of cervical cancer?',
    section: 'medicalHistory', field: 'cervicalCancer', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Liver disease',
    section: 'medicalHistory', field: 'liverDisease',
    options: [
      { value: 'no', label: 'No liver disease' },
      { value: 'active-hepatitis', label: 'Active viral hepatitis' },
      { value: 'cirrhosis', label: 'Cirrhosis' },
      { value: 'liver-tumour', label: 'Liver tumour' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Gallbladder disease?',
    section: 'medicalHistory', field: 'gallbladderDisease', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Inflammatory bowel disease?',
    section: 'medicalHistory', field: 'inflammatoryBowelDisease', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Systemic lupus erythematosus (SLE)?',
    section: 'medicalHistory', field: 'sle', options: yesNo
  }));
  const sleAph = document.createElement('div');
  sleAph.dataset.conditional = 'medicalHistory.sle=yes';
  sleAph.appendChild(radioGroup({
    label: 'Antiphospholipid antibodies present?',
    section: 'medicalHistory', field: 'sleAntiphospholipid', options: yesNo
  }));
  card.appendChild(sleAph);

  card.appendChild(radioGroup({
    label: 'Epilepsy?',
    section: 'medicalHistory', field: 'epilepsy', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Diabetes',
    section: 'medicalHistory', field: 'diabetes',
    options: [
      { value: 'no', label: 'No diabetes' },
      { value: 'type-1', label: 'Type 1 diabetes' },
      { value: 'type-2', label: 'Type 2 diabetes' },
      { value: 'gestational', label: 'Gestational diabetes' }
    ]
  }));
  const dmComp = document.createElement('div');
  dmComp.dataset.conditionalAny = 'medicalHistory.diabetes=type-1,type-2';
  dmComp.appendChild(radioGroup({
    label: 'Vascular complications of diabetes (nephropathy, retinopathy, neuropathy)?',
    section: 'medicalHistory', field: 'diabetesComplications', options: yesNo
  }));
  card.appendChild(dmComp);

  card.appendChild(radioGroup({
    label: 'Current or recent sexually transmitted infection (STI)?',
    section: 'medicalHistory', field: 'sti', options: yesNo
  }));
  const stiHost = document.createElement('div');
  stiHost.dataset.conditional = 'medicalHistory.sti=yes';
  stiHost.appendChild(textInput({
    label: 'STI details', section: 'medicalHistory', field: 'stiDetails',
    placeholder: 'Type of infection, date, treatment'
  }));
  card.appendChild(stiHost);

  card.appendChild(radioGroup({
    label: 'History of pelvic inflammatory disease (PID)?',
    section: 'medicalHistory', field: 'pid', options: yesNo
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Cardiovascular Risk Factors',
    description: 'Heart and blood vessel health.'
  });

  card.appendChild(radioGroup({
    label: 'Diagnosed with hypertension (high blood pressure)?',
    section: 'cardiovascularRisk', field: 'hypertension', options: yesNo
  }));

  const bpGrid = document.createElement('div');
  bpGrid.className = 'two-col';
  bpGrid.appendChild(textInput({
    label: 'Systolic BP', section: 'cardiovascularRisk', field: 'systolicBP',
    type: 'number', min: 60, max: 250, unit: 'mmHg'
  }));
  bpGrid.appendChild(textInput({
    label: 'Diastolic BP', section: 'cardiovascularRisk', field: 'diastolicBP',
    type: 'number', min: 30, max: 150, unit: 'mmHg'
  }));
  card.appendChild(bpGrid);

  const bpControlled = document.createElement('div');
  bpControlled.dataset.conditional = 'cardiovascularRisk.hypertension=yes';
  bpControlled.appendChild(radioGroup({
    label: 'Is your blood pressure well-controlled on treatment?',
    section: 'cardiovascularRisk', field: 'bpControlled', options: yesNo
  }));
  card.appendChild(bpControlled);

  card.appendChild(radioGroup({
    label: 'Ischaemic heart disease (angina, heart attack)?',
    section: 'cardiovascularRisk', field: 'ischaemicHeartDisease', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'History of stroke or transient ischaemic attack (TIA)?',
    section: 'cardiovascularRisk', field: 'strokeHistory', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Valvular heart disease?',
    section: 'cardiovascularRisk', field: 'valvularHeartDisease', options: yesNo
  }));
  const valvular = document.createElement('div');
  valvular.dataset.conditional = 'cardiovascularRisk.valvularHeartDisease=yes';
  valvular.appendChild(radioGroup({
    label: 'Complications (atrial fibrillation, endocarditis history, pulmonary hypertension)?',
    section: 'cardiovascularRisk', field: 'valvularComplications', options: yesNo
  }));
  card.appendChild(valvular);

  card.appendChild(radioGroup({
    label: 'High cholesterol (hyperlipidaemia)?',
    section: 'cardiovascularRisk', field: 'hyperlipidaemia', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Family history of venous thromboembolism (VTE) in a first-degree relative?',
    section: 'cardiovascularRisk', field: 'familyHistoryVTE', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Family history of cardiovascular disease?',
    section: 'cardiovascularRisk', field: 'familyHistoryCVD', options: yesNo
  }));
  const cvdDetails = document.createElement('div');
  cvdDetails.dataset.conditional = 'cardiovascularRisk.familyHistoryCVD=yes';
  cvdDetails.appendChild(textInput({
    label: 'Family CVD details',
    section: 'cardiovascularRisk', field: 'familyCVDDetails',
    placeholder: 'Relative, condition, age of onset'
  }));
  card.appendChild(cvdDetails);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Thromboembolism Risk',
    description: 'Risk of blood clots (DVT/PE) and clotting disorders.'
  });

  card.appendChild(radioGroup({
    label: 'Previous deep vein thrombosis (DVT)?',
    section: 'thromboembolismRisk', field: 'previousDVT', options: yesNo
  }));
  const dvtHost = document.createElement('div');
  dvtHost.dataset.conditional = 'thromboembolismRisk.previousDVT=yes';
  dvtHost.appendChild(textInput({
    label: 'DVT details', section: 'thromboembolismRisk', field: 'dvtDetails',
    placeholder: 'Date, location, treatment'
  }));
  card.appendChild(dvtHost);

  card.appendChild(radioGroup({
    label: 'Previous pulmonary embolism (PE)?',
    section: 'thromboembolismRisk', field: 'previousPE', options: yesNo
  }));
  const peHost = document.createElement('div');
  peHost.dataset.conditional = 'thromboembolismRisk.previousPE=yes';
  peHost.appendChild(textInput({
    label: 'PE details', section: 'thromboembolismRisk', field: 'peDetails',
    placeholder: 'Date, treatment'
  }));
  card.appendChild(peHost);

  card.appendChild(radioGroup({
    label: 'Known thrombophilia (clotting disorder)?',
    section: 'thromboembolismRisk', field: 'knownThrombophilia', options: yesNo
  }));
  const thHost = document.createElement('div');
  thHost.dataset.conditional = 'thromboembolismRisk.knownThrombophilia=yes';
  thHost.appendChild(selectInput({
    label: 'Type of thrombophilia',
    section: 'thromboembolismRisk', field: 'thrombophiliaType',
    options: [
      { value: 'factor-v-leiden', label: 'Factor V Leiden' },
      { value: 'prothrombin-mutation', label: 'Prothrombin gene mutation' },
      { value: 'protein-c-deficiency', label: 'Protein C deficiency' },
      { value: 'protein-s-deficiency', label: 'Protein S deficiency' },
      { value: 'antithrombin-deficiency', label: 'Antithrombin deficiency' },
      { value: 'antiphospholipid', label: 'Antiphospholipid syndrome' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(thHost);

  card.appendChild(radioGroup({
    label: 'Prolonged immobility risk (e.g. recent surgery, fracture, wheelchair use)?',
    section: 'thromboembolismRisk', field: 'immobilityRisk', options: yesNo
  }));
  const immHost = document.createElement('div');
  immHost.dataset.conditional = 'thromboembolismRisk.immobilityRisk=yes';
  immHost.appendChild(textInput({
    label: 'Immobility details',
    section: 'thromboembolismRisk', field: 'immobilityDetails'
  }));
  card.appendChild(immHost);

  card.appendChild(radioGroup({
    label: 'Recent major surgery (within 4 weeks)?',
    section: 'thromboembolismRisk', field: 'recentMajorSurgery', options: yesNo
  }));
  const surgHost = document.createElement('div');
  surgHost.dataset.conditional = 'thromboembolismRisk.recentMajorSurgery=yes';
  surgHost.appendChild(textInput({
    label: 'Surgery details',
    section: 'thromboembolismRisk', field: 'surgeryDetails',
    placeholder: 'Type of surgery, date'
  }));
  card.appendChild(surgHost);

  card.appendChild(radioGroup({
    label: 'Long-haul travel (>4 hours) within the last 4 weeks?',
    section: 'thromboembolismRisk', field: 'longHaulTravel', options: yesNo
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Current Medications',
    description: 'Medications and herbal supplements you currently take.'
  });

  function medRow(label, yesField, detailsField, placeholder) {
    card.appendChild(radioGroup({
      label, section: 'currentMedications', field: yesField, options: yesNo
    }));
    const host = document.createElement('div');
    host.dataset.conditional = `currentMedications.${yesField}=yes`;
    host.appendChild(textInput({
      label: 'Details', section: 'currentMedications', field: detailsField,
      placeholder
    }));
    card.appendChild(host);
  }

  medRow('Enzyme-inducing drugs (e.g. rifampicin, phenytoin, carbamazepine)?', 'enzymeInducingDrugs', 'enzymeInducingDetails', 'Drug name and dose');
  medRow('Anticoagulants (warfarin, DOACs)?', 'anticoagulants', 'anticoagulantDetails', 'Drug name and dose');
  medRow('Antiepileptic medications?', 'antiepileptics', 'antiepilepticDetails', 'Drug name and dose');
  medRow('Antiretroviral medications (HIV)?', 'antiretrovirals', 'antiretroviralDetails', 'Drug name and dose');
  medRow('Antibiotics (current course)?', 'antibiotics', 'antibioticDetails', 'Drug name and indication');
  medRow('SSRI / SNRI antidepressants?', 'ssriSnri', 'ssriSnriDetails', 'Drug name and dose');
  medRow('Herbal remedies (e.g. St John’s wort)?', 'herbalRemedies', 'herbalDetails', 'Name and frequency');

  card.appendChild(textArea({
    label: 'Other medications',
    section: 'currentMedications', field: 'otherMedications',
    placeholder: 'List any other regular medications…',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Any drug allergies?',
    section: 'currentMedications', field: 'drugAllergies', options: yesNo
  }));
  const allHost = document.createElement('div');
  allHost.dataset.conditional = 'currentMedications.drugAllergies=yes';
  allHost.appendChild(textInput({
    label: 'Drug allergy details',
    section: 'currentMedications', field: 'drugAllergyDetails',
    placeholder: 'Drug, reaction, severity'
  }));
  card.appendChild(allHost);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Lifestyle Assessment',
    description: 'Smoking, alcohol, exercise, and sexual activity.'
  });

  card.appendChild(radioGroup({
    label: 'Smoking status',
    section: 'lifestyleAssessment', field: 'smoking',
    options: [
      { value: 'current', label: 'Current smoker' },
      { value: 'ex-smoker', label: 'Ex-smoker' },
      { value: 'never', label: 'Never smoked' }
    ]
  }));
  const cigsHost = document.createElement('div');
  cigsHost.dataset.conditional = 'lifestyleAssessment.smoking=current';
  cigsHost.appendChild(textInput({
    label: 'Cigarettes per day',
    section: 'lifestyleAssessment', field: 'cigarettesPerDay',
    type: 'number', min: 0, max: 100
  }));
  card.appendChild(cigsHost);

  card.appendChild(radioGroup({
    label: 'Are you over 35 years old AND smoking?',
    section: 'lifestyleAssessment', field: 'ageOver35Smoker', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Alcohol consumption',
    section: 'lifestyleAssessment', field: 'alcohol',
    options: [
      { value: 'none', label: 'None' },
      { value: 'within-guidelines', label: 'Within UK guidelines (≤14 units/week)' },
      { value: 'above-guidelines', label: 'Above UK guidelines (>14 units/week)' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Alcohol units per week (UK)', section: 'lifestyleAssessment',
    field: 'alcoholUnitsPerWeek', type: 'number', min: 0, max: 200, unit: 'units'
  }));

  card.appendChild(radioGroup({
    label: 'Recreational drug use?',
    section: 'lifestyleAssessment', field: 'recreationalDrugUse', options: yesNo
  }));
  const recHost = document.createElement('div');
  recHost.dataset.conditional = 'lifestyleAssessment.recreationalDrugUse=yes';
  recHost.appendChild(textInput({
    label: 'Recreational drug details',
    section: 'lifestyleAssessment', field: 'recreationalDrugDetails',
    placeholder: 'Substance, frequency'
  }));
  card.appendChild(recHost);

  card.appendChild(selectInput({
    label: 'Exercise frequency',
    section: 'lifestyleAssessment', field: 'exerciseFrequency',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional' },
      { value: 'regular', label: 'Regular (2-3 times/week)' },
      { value: 'daily', label: 'Daily' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Currently sexually active?',
    section: 'lifestyleAssessment', field: 'sexualActivity', options: yesNo
  }));
  const partnersHost = document.createElement('div');
  partnersHost.dataset.conditional = 'lifestyleAssessment.sexualActivity=yes';
  partnersHost.appendChild(selectInput({
    label: 'Number of sexual partners',
    section: 'lifestyleAssessment', field: 'numberOfPartners',
    options: [
      { value: 'one', label: 'One regular partner' },
      { value: 'multiple', label: 'Multiple partners' }
    ]
  }));
  card.appendChild(partnersHost);

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Contraceptive Preferences',
    description: 'Your preferred method and fertility plans.'
  });

  card.appendChild(selectInput({
    label: 'Preferred contraceptive method (if any)',
    section: 'contraceptivePreferences', field: 'preferredMethod',
    options: [
      { value: 'coc', label: 'Combined oral contraception (COC)' },
      { value: 'pop', label: 'Progestogen-only pill (POP)' },
      { value: 'implant', label: 'Contraceptive implant' },
      { value: 'injection', label: 'Contraceptive injection' },
      { value: 'iud', label: 'Copper IUD' },
      { value: 'ius', label: 'Hormonal IUS (Mirena)' },
      { value: 'patch', label: 'Patch' },
      { value: 'ring', label: 'Vaginal ring' },
      { value: 'barrier', label: 'Barrier methods' },
      { value: 'natural', label: 'Natural methods (fertility awareness)' },
      { value: 'unsure', label: 'Unsure / open to advice' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Are hormonal methods acceptable to you?',
    section: 'contraceptivePreferences', field: 'hormonalAcceptable', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Are long-acting reversible contraceptives (LARC) acceptable?',
    section: 'contraceptivePreferences', field: 'longActingAcceptable', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Is taking a daily pill acceptable?',
    section: 'contraceptivePreferences', field: 'dailyPillAcceptable', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Are intrauterine methods (IUD/IUS) acceptable?',
    section: 'contraceptivePreferences', field: 'intrauterineAcceptable', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Fertility / pregnancy plans',
    section: 'contraceptivePreferences', field: 'fertilityPlans',
    options: [
      { value: 'within-1-year', label: 'Hoping to conceive within 1 year' },
      { value: '1-5-years', label: 'Hoping to conceive in 1-5 years' },
      { value: 'no-plans', label: 'No current plans for pregnancy' },
      { value: 'completed-family', label: 'Family complete' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Currently breastfeeding?',
    section: 'contraceptivePreferences', field: 'breastfeeding', options: yesNo
  }));
  const bfHost = document.createElement('div');
  bfHost.dataset.conditional = 'contraceptivePreferences.breastfeeding=yes';
  bfHost.appendChild(textInput({
    label: 'Weeks postpartum',
    section: 'contraceptivePreferences', field: 'postpartumWeeks',
    type: 'number', min: 0, max: 200, unit: 'weeks'
  }));
  card.appendChild(bfHost);

  card.appendChild(textArea({
    label: 'Other concerns or questions',
    section: 'contraceptivePreferences', field: 'concerns',
    placeholder: 'Any specific concerns about side effects, ease of use, etc.…',
    rows: 4
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Clinical Recommendation',
    description: 'Free-text notes for the clinician.'
  });

  card.appendChild(textArea({
    label: 'Clinical notes',
    section: 'clinicalRecommendation', field: 'clinicalNotes',
    placeholder: 'Anything else the clinician should know before recommending a method…',
    rows: 6
  }));

  return card;
}

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
    const v = state.demographics.bmi;
    bmi.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}</strong> <span class="muted">(${esc(bmiCategory(v))})</span>`;
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'weight'],
  ['demographics', 'height'],
  // Menstrual
  ['menstrualHistory', 'menarcheAge'],
  ['menstrualHistory', 'cycleRegularity'],
  ['menstrualHistory', 'flowHeaviness'],
  ['menstrualHistory', 'intermenstrualBleeding'],
  ['menstrualHistory', 'postcoitalBleeding'],
  ['menstrualHistory', 'dysmenorrhoea'],
  ['menstrualHistory', 'amenorrhoea'],
  // Contraceptive history
  ['contraceptiveHistory', 'previousContraception'],
  // Medical history (core yes/no/select set)
  ['medicalHistory', 'migraine'],
  ['medicalHistory', 'breastCancer'],
  ['medicalHistory', 'cervicalCancer'],
  ['medicalHistory', 'liverDisease'],
  ['medicalHistory', 'gallbladderDisease'],
  ['medicalHistory', 'inflammatoryBowelDisease'],
  ['medicalHistory', 'sle'],
  ['medicalHistory', 'epilepsy'],
  ['medicalHistory', 'diabetes'],
  ['medicalHistory', 'sti'],
  ['medicalHistory', 'pid'],
  // Cardiovascular
  ['cardiovascularRisk', 'hypertension'],
  ['cardiovascularRisk', 'ischaemicHeartDisease'],
  ['cardiovascularRisk', 'strokeHistory'],
  ['cardiovascularRisk', 'valvularHeartDisease'],
  ['cardiovascularRisk', 'hyperlipidaemia'],
  ['cardiovascularRisk', 'familyHistoryVTE'],
  ['cardiovascularRisk', 'familyHistoryCVD'],
  // Thromboembolism
  ['thromboembolismRisk', 'previousDVT'],
  ['thromboembolismRisk', 'previousPE'],
  ['thromboembolismRisk', 'knownThrombophilia'],
  ['thromboembolismRisk', 'immobilityRisk'],
  ['thromboembolismRisk', 'recentMajorSurgery'],
  ['thromboembolismRisk', 'longHaulTravel'],
  // Medications
  ['currentMedications', 'enzymeInducingDrugs'],
  ['currentMedications', 'anticoagulants'],
  ['currentMedications', 'antiepileptics'],
  ['currentMedications', 'antiretrovirals'],
  ['currentMedications', 'antibiotics'],
  ['currentMedications', 'ssriSnri'],
  ['currentMedications', 'herbalRemedies'],
  ['currentMedications', 'drugAllergies'],
  // Lifestyle
  ['lifestyleAssessment', 'smoking'],
  ['lifestyleAssessment', 'alcohol'],
  ['lifestyleAssessment', 'recreationalDrugUse'],
  ['lifestyleAssessment', 'exerciseFrequency'],
  ['lifestyleAssessment', 'sexualActivity'],
  // Preferences
  ['contraceptivePreferences', 'preferredMethod'],
  ['contraceptivePreferences', 'hormonalAcceptable'],
  ['contraceptivePreferences', 'longActingAcceptable'],
  ['contraceptivePreferences', 'dailyPillAcceptable'],
  ['contraceptivePreferences', 'intrauterineAcceptable'],
  ['contraceptivePreferences', 'fertilityPlans'],
  ['contraceptivePreferences', 'breastfeeding']
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

  const { methodMEC, overallRisk, firedRules, additionalFlags, timestamp } = lastResult;

  const methods = ['coc', 'pop', 'implant', 'injection', 'iud', 'ius'];
  const methodRows = methods.map((m) => {
    const cat = methodMEC[m];
    return `
      <tr>
        <th scope="row">${esc(methodDisplayName(m))}</th>
        <td><span class="mec-badge ${esc(mecCategoryClass(cat))}">${esc(mecCategoryShort(cat))}</span></td>
        <td>${esc(mecCategoryLabel(cat))}</td>
      </tr>
    `;
  }).join('');

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

  const ruleRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
      <td>
        <span class="mec-badge ${esc(mecCategoryClass(r.mecCategory))}">${esc(mecCategoryShort(r.mecCategory))}</span>
      </td>
      <td>${esc(r.affectedMethods.join(', ').toUpperCase())}</td>
    </tr>
  `).join('');

  const rulesTable = firedRules.length === 0
    ? `<p class="muted">No MEC rules fired - all six methods default to MEC 1.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Rule</th>
            <th scope="col">MEC</th>
            <th scope="col">Methods</th>
          </tr>
        </thead>
        <tbody>${ruleRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Birth Control Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Overall Risk</h3>
      <p class="risk-summary">
        <span class="risk-badge ${esc(riskLevelClass(overallRisk))}">${esc(riskLevelLabel(overallRisk))}</span>
      </p>

      <h3>Per-method UK MEC Categories</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Method</th>
            <th scope="col">MEC</th>
            <th scope="col">Interpretation</th>
          </tr>
        </thead>
        <tbody>${methodRows}</tbody>
      </table>

      <h3>Fired MEC Rules</h3>
      ${rulesTable}

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
  const _errors = validateForm();
  if (_errors.length > 0) return;
  recomputeDerived();
  lastResult = calculateMECGrade(state);
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
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics',               title: 'Demographics' },
  { step: 2,  section: 'menstrualHistory',           title: 'Menstrual' },
  { step: 3,  section: 'contraceptiveHistory',       title: 'Contraceptive' },
  { step: 4,  section: 'medicalHistory',             title: 'Medical' },
  { step: 5,  section: 'cardiovascularRisk',         title: 'CV Risk' },
  { step: 6,  section: 'thromboembolismRisk',        title: 'VTE Risk' },
  { step: 7,  section: 'currentMedications',         title: 'Medications' },
  { step: 8,  section: 'lifestyleAssessment',        title: 'Lifestyle' },
  { step: 9,  section: 'contraceptivePreferences',   title: 'Preferences' },
  { step: 10, section: 'clinicalRecommendation',     title: 'Recommendation' }
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
