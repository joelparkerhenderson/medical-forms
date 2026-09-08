import { gradeDonor } from './donor-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { bmiCategory, calculateAge, calculateBMI, collectionMethodLabel, eligibilityClass, eligibilityLabel, emptyAssessment, gradeClass, gradeLabel, hlaMatchLabel, riskLevelClass, riskLevelLabel } from './types.js';

// Bone Marrow Donation Assessment - donor wizard (vanilla JS, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure donor-grader engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'bone-marrow-donation-assessment.front-end-form-with-html.v1';
const TOTAL_STEPS = 10;

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
  slug: 'bone-marrow-donation-assessment',
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
    `<span class="section-step">Step ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

function subHeader(title, hint) {
  const div = document.createElement('div');
  div.className = 'list-section-header';
  div.innerHTML = `<h3>${esc(title)}</h3>${hint ? `<p class="hint">${esc(hint)}</p>` : ''}`;
  return div;
}

// ----------------------------------------------------------------------
// Section renderers (1 per donor-assessment step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic donor information.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'demographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Date of Birth', section: 'demographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));

  card.appendChild(radioGroup({
    label: 'Sex', section: 'demographics', field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  const m = document.createElement('div');
  m.className = 'three-col';
  m.appendChild(textInput({ label: 'Weight', section: 'demographics', field: 'weight', type: 'number', min: 1, max: 400, unit: 'kg' }));
  m.appendChild(textInput({ label: 'Height', section: 'demographics', field: 'height', type: 'number', min: 50, max: 250, unit: 'cm' }));
  m.appendChild(readOnlyReadout({
    label: 'BMI',
    id: 'bmi-readout',
    render: () => {
      const bmi = state.demographics.bmi;
      if (bmi == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${bmi}</strong> <span class="muted">(${esc(bmiCategory(bmi))})</span>`;
    }
  }));
  card.appendChild(m);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Donor Registration & HLA Typing',
    description: 'Registry details, HLA antigens and match level.'
  });

  const reg = document.createElement('div');
  reg.className = 'two-col';
  reg.appendChild(textInput({ label: 'Donor Registry', section: 'donorRegistrationHlaTyping', field: 'donorRegistry', placeholder: 'e.g. WMDA, NHSBT, Anthony Nolan' }));
  reg.appendChild(textInput({ label: 'Donor Registry ID', section: 'donorRegistrationHlaTyping', field: 'donorRegistryId' }));
  card.appendChild(reg);

  card.appendChild(textInput({
    label: 'Registration Date', section: 'donorRegistrationHlaTyping', field: 'registrationDate', type: 'date'
  }));

  card.appendChild(selectInput({
    label: 'Donation Type',
    section: 'donorRegistrationHlaTyping', field: 'donationType',
    options: [
      { value: 'allogeneic', label: 'Allogeneic (other recipient)' },
      { value: 'autologous', label: 'Autologous (self)' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Recipient Relationship',
    section: 'donorRegistrationHlaTyping', field: 'recipientRelationship',
    options: [
      { value: 'related', label: 'Related (family donor)' },
      { value: 'unrelated', label: 'Unrelated (registry donor)' }
    ]
  }));

  card.appendChild(subHeader('HLA antigens', 'Record typed alleles where known.'));
  const hlaGrid = document.createElement('div');
  hlaGrid.className = 'three-col';
  hlaGrid.appendChild(textInput({ label: 'HLA-A', section: 'donorRegistrationHlaTyping', field: 'hlaA' }));
  hlaGrid.appendChild(textInput({ label: 'HLA-B', section: 'donorRegistrationHlaTyping', field: 'hlaB' }));
  hlaGrid.appendChild(textInput({ label: 'HLA-C', section: 'donorRegistrationHlaTyping', field: 'hlaC' }));
  hlaGrid.appendChild(textInput({ label: 'HLA-DRB1', section: 'donorRegistrationHlaTyping', field: 'hlaDrb1' }));
  hlaGrid.appendChild(textInput({ label: 'HLA-DQB1', section: 'donorRegistrationHlaTyping', field: 'hlaDqb1' }));
  hlaGrid.appendChild(textInput({ label: 'HLA-DPB1', section: 'donorRegistrationHlaTyping', field: 'hlaDpb1' }));
  card.appendChild(hlaGrid);

  card.appendChild(selectInput({
    label: 'HLA Match Level',
    section: 'donorRegistrationHlaTyping', field: 'hlaMatchLevel',
    options: [
      { value: '10-of-10', label: '10/10 (Full Match)' },
      { value: '9-of-10', label: '9/10 (Single Antigen Mismatch)' },
      { value: '8-of-10', label: '8/10 (Two Antigen Mismatch)' },
      { value: '7-of-10', label: '7/10 (Three Antigen Mismatch)' },
      { value: 'haploidentical', label: 'Haploidentical' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Crossmatch Result',
    section: 'donorRegistrationHlaTyping', field: 'crossmatchResult',
    options: [
      { value: 'negative', label: 'Negative' },
      { value: 'positive', label: 'Positive' },
      { value: 'pending', label: 'Pending' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Have you previously donated stem cells / bone marrow?',
    section: 'donorRegistrationHlaTyping', field: 'previousDonation', options: yesNo
  }));
  const prevDetails = document.createElement('div');
  prevDetails.dataset.conditional = 'donorRegistrationHlaTyping.previousDonation=yes';
  prevDetails.appendChild(textArea({
    label: 'Previous donation details',
    section: 'donorRegistrationHlaTyping', field: 'previousDonationDetails',
    placeholder: 'When, where, recipient outcome, complications…'
  }));
  card.appendChild(prevDetails);

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Medical History',
    description: 'Past and current medical conditions relevant to donor safety.'
  });

  const conds = [
    ['hasAutoimmuneDisease', 'autoimmuneDetails', 'autoimmune disease (e.g. lupus, RA, MS)'],
    ['hasMalignancy', 'malignancyDetails', 'malignancy (cancer of any type)'],
    ['hasCardiovascularDisease', 'cardiovascularDetails', 'cardiovascular disease (heart attack, angina, heart failure)'],
    ['hasRespiratoryDisease', 'respiratoryDetails', 'respiratory disease (asthma, COPD, sleep apnoea)'],
    ['hasRenalDisease', 'renalDetails', 'renal / kidney disease'],
    ['hasHepaticDisease', 'hepaticDetails', 'hepatic / liver disease'],
    ['hasBleedingDisorder', 'bleedingDisorderDetails', 'bleeding or clotting disorder'],
    ['hasNeurologicalCondition', 'neurologicalDetails', 'neurological condition (epilepsy, stroke, MS)']
  ];
  for (const [yn, det, label] of conds) {
    card.appendChild(radioGroup({
      label: `Do you have a history of ${label}?`,
      section: 'medicalHistory', field: yn, options: yesNo
    }));
    const wrap = document.createElement('div');
    wrap.dataset.conditional = `medicalHistory.${yn}=yes`;
    wrap.appendChild(textArea({
      label: 'Details', section: 'medicalHistory', field: det,
      placeholder: 'Diagnosis, year, treatment, current status…', rows: 2
    }));
    card.appendChild(wrap);
  }

  card.appendChild(textArea({
    label: 'Current medications',
    section: 'medicalHistory', field: 'currentMedications',
    placeholder: 'List all prescription, OTC and supplement medications…', rows: 3
  }));

  card.appendChild(textArea({
    label: 'Drug allergies',
    section: 'medicalHistory', field: 'drugAllergies',
    placeholder: 'Drug name, reaction, severity…', rows: 2
  }));

  card.appendChild(radioGroup({
    label: 'Have you had previous surgery?',
    section: 'medicalHistory', field: 'previousSurgery', options: yesNo
  }));
  const surgDetails = document.createElement('div');
  surgDetails.dataset.conditional = 'medicalHistory.previousSurgery=yes';
  surgDetails.appendChild(textArea({
    label: 'Surgery details',
    section: 'medicalHistory', field: 'surgeryDetails',
    placeholder: 'Procedure, date, anaesthetic, complications…', rows: 2
  }));
  card.appendChild(surgDetails);

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Physical Examination',
    description: 'Vital signs and clinical examination by the assessor.'
  });

  const vitals = document.createElement('div');
  vitals.className = 'three-col';
  vitals.appendChild(textInput({ label: 'BP Systolic', section: 'physicalExamination', field: 'bpSystolic', type: 'number', min: 50, max: 260, unit: 'mmHg' }));
  vitals.appendChild(textInput({ label: 'BP Diastolic', section: 'physicalExamination', field: 'bpDiastolic', type: 'number', min: 30, max: 160, unit: 'mmHg' }));
  vitals.appendChild(textInput({ label: 'Heart Rate', section: 'physicalExamination', field: 'heartRate', type: 'number', min: 30, max: 220, unit: 'bpm' }));
  vitals.appendChild(textInput({ label: 'Temperature', section: 'physicalExamination', field: 'temperature', type: 'number', min: 30, max: 45, step: 0.1, unit: '°C' }));
  vitals.appendChild(textInput({ label: 'Respiratory Rate', section: 'physicalExamination', field: 'respiratoryRate', type: 'number', min: 4, max: 60, unit: '/min' }));
  vitals.appendChild(textInput({ label: 'SpO2', section: 'physicalExamination', field: 'oxygenSaturation', type: 'number', min: 50, max: 100, unit: '%' }));
  card.appendChild(vitals);

  card.appendChild(selectInput({
    label: 'General Appearance',
    section: 'physicalExamination', field: 'generalAppearance',
    options: [
      { value: 'well', label: 'Well' },
      { value: 'unwell', label: 'Unwell' },
      { value: 'acutely-unwell', label: 'Acutely unwell' }
    ]
  }));

  const examPairs = [
    ['cardiovascularExamination', 'cardiovascularFindings', 'Cardiovascular examination'],
    ['respiratoryExamination', 'respiratoryFindings', 'Respiratory examination'],
    ['abdominalExamination', 'abdominalFindings', 'Abdominal examination']
  ];
  for (const [sel, det, label] of examPairs) {
    card.appendChild(selectInput({
      label, section: 'physicalExamination', field: sel,
      options: [
        { value: 'normal', label: 'Normal' },
        { value: 'abnormal', label: 'Abnormal' }
      ]
    }));
    const wrap = document.createElement('div');
    wrap.dataset.conditional = `physicalExamination.${sel}=abnormal`;
    wrap.appendChild(textArea({
      label: 'Findings', section: 'physicalExamination', field: det,
      placeholder: 'Describe abnormal findings…', rows: 2
    }));
    card.appendChild(wrap);
  }

  card.appendChild(selectInput({
    label: 'Venous Access Assessment',
    section: 'physicalExamination', field: 'venousAccessAssessment',
    options: [
      { value: 'good', label: 'Good (peripheral access adequate for apheresis)' },
      { value: 'adequate', label: 'Adequate' },
      { value: 'poor', label: 'Poor (central line likely required)' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Posterior Iliac Crest Assessment',
    section: 'physicalExamination', field: 'posteriorIliacCrestAssessment',
    options: [
      { value: 'suitable', label: 'Suitable for harvest' },
      { value: 'unsuitable', label: 'Unsuitable for harvest' }
    ]
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Haematological Assessment',
    description: 'Full blood count, biochemistry, coagulation and blood group.'
  });

  const fbc = document.createElement('div');
  fbc.className = 'three-col';
  fbc.appendChild(textInput({ label: 'Haemoglobin', section: 'haematologicalAssessment', field: 'haemoglobin', type: 'number', min: 0, max: 25, step: 0.1, unit: 'g/dL' }));
  fbc.appendChild(textInput({ label: 'White Cell Count', section: 'haematologicalAssessment', field: 'whiteCellCount', type: 'number', min: 0, max: 100, step: 0.1, unit: 'x10^9/L' }));
  fbc.appendChild(textInput({ label: 'Platelet Count', section: 'haematologicalAssessment', field: 'plateletCount', type: 'number', min: 0, max: 1500, unit: 'x10^9/L' }));
  fbc.appendChild(textInput({ label: 'Neutrophil Count', section: 'haematologicalAssessment', field: 'neutrophilCount', type: 'number', min: 0, max: 100, step: 0.1, unit: 'x10^9/L' }));
  fbc.appendChild(textInput({ label: 'Lymphocyte Count', section: 'haematologicalAssessment', field: 'lymphocyteCount', type: 'number', min: 0, max: 100, step: 0.1, unit: 'x10^9/L' }));
  fbc.appendChild(textInput({ label: 'Haematocrit', section: 'haematologicalAssessment', field: 'haematocrit', type: 'number', min: 0, max: 1, step: 0.01 }));
  fbc.appendChild(textInput({ label: 'MCV', section: 'haematologicalAssessment', field: 'mcv', type: 'number', min: 50, max: 130, unit: 'fL' }));
  fbc.appendChild(textInput({ label: 'Ferritin', section: 'haematologicalAssessment', field: 'ferritin', type: 'number', min: 0, max: 5000, unit: 'µg/L' }));
  fbc.appendChild(textInput({ label: 'Creatinine', section: 'haematologicalAssessment', field: 'creatinine', type: 'number', min: 0, max: 2000, unit: 'µmol/L' }));
  card.appendChild(fbc);

  card.appendChild(selectInput({
    label: 'Blood Group',
    section: 'haematologicalAssessment', field: 'bloodGroup',
    options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => ({ value: g, label: g }))
  }));

  card.appendChild(selectInput({
    label: 'Coagulation Screen',
    section: 'haematologicalAssessment', field: 'coagulationScreen',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'abnormal', label: 'Abnormal' },
      { value: 'pending', label: 'Pending' }
    ]
  }));
  const coagDetails = document.createElement('div');
  coagDetails.dataset.conditional = 'haematologicalAssessment.coagulationScreen=abnormal';
  coagDetails.appendChild(textArea({
    label: 'Coagulation details',
    section: 'haematologicalAssessment', field: 'coagulationDetails',
    placeholder: 'PT, APTT, INR, fibrinogen, etc.', rows: 2
  }));
  card.appendChild(coagDetails);

  card.appendChild(selectInput({
    label: 'Liver Function',
    section: 'haematologicalAssessment', field: 'liverFunction',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'abnormal', label: 'Abnormal' },
      { value: 'pending', label: 'Pending' }
    ]
  }));
  const lfDetails = document.createElement('div');
  lfDetails.dataset.conditional = 'haematologicalAssessment.liverFunction=abnormal';
  lfDetails.appendChild(textArea({
    label: 'Liver function details',
    section: 'haematologicalAssessment', field: 'liverFunctionDetails',
    placeholder: 'ALT, AST, bilirubin, ALP, etc.', rows: 2
  }));
  card.appendChild(lfDetails);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Infectious Disease Screening',
    description: 'Mandatory donor virology and infection screening.'
  });

  const screens = [
    ['hivStatus', 'HIV'],
    ['hepatitisBSurfaceAntigen', 'Hepatitis B (HBsAg)'],
    ['hepatitisBCoreAntibody', 'Hepatitis B (anti-HBc)'],
    ['hepatitisCAbntibody', 'Hepatitis C antibody'],
    ['htlvStatus', 'HTLV'],
    ['syphilisScreen', 'Syphilis'],
    ['cmvStatus', 'CMV'],
    ['ebvStatus', 'EBV'],
    ['toxoplasmaStatus', 'Toxoplasma'],
    ['tuberculosisScreen', 'Tuberculosis']
  ];
  for (const [field, label] of screens) {
    card.appendChild(selectInput({
      label, section: 'infectiousDiseaseScreening', field,
      options: [
        { value: 'negative', label: 'Negative' },
        { value: 'positive', label: 'Positive' },
        { value: 'pending', label: 'Pending' }
      ]
    }));
  }

  card.appendChild(radioGroup({
    label: 'Recent travel to areas with endemic infections?',
    section: 'infectiousDiseaseScreening', field: 'recentTravel', options: yesNo
  }));
  const travelDet = document.createElement('div');
  travelDet.dataset.conditional = 'infectiousDiseaseScreening.recentTravel=yes';
  travelDet.appendChild(textArea({
    label: 'Travel details',
    section: 'infectiousDiseaseScreening', field: 'travelDetails',
    placeholder: 'Country, dates, exposures, prophylaxis…', rows: 2
  }));
  card.appendChild(travelDet);

  card.appendChild(radioGroup({
    label: 'Any recent infection (last 3 months)?',
    section: 'infectiousDiseaseScreening', field: 'recentInfection', options: yesNo
  }));
  const infDet = document.createElement('div');
  infDet.dataset.conditional = 'infectiousDiseaseScreening.recentInfection=yes';
  infDet.appendChild(textArea({
    label: 'Infection details',
    section: 'infectiousDiseaseScreening', field: 'infectionDetails',
    placeholder: 'Type, date, treatment, current status…', rows: 2
  }));
  card.appendChild(infDet);

  card.appendChild(radioGroup({
    label: 'Are vaccinations up to date?',
    section: 'infectiousDiseaseScreening', field: 'vaccinationUpToDate', options: yesNo
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Anaesthetic Assessment',
    description: 'Pre-operative evaluation for marrow harvest under general anaesthetic.'
  });

  card.appendChild(selectInput({
    label: 'ASA Grade',
    section: 'anaestheticAssessment', field: 'asaGrade',
    options: [
      { value: 'I', label: 'ASA I — Healthy donor' },
      { value: 'II', label: 'ASA II — Mild systemic disease' },
      { value: 'III', label: 'ASA III — Severe systemic disease' },
      { value: 'IV', label: 'ASA IV — Life-threatening disease' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Have you had a general anaesthetic before?',
    section: 'anaestheticAssessment', field: 'previousAnaesthetic', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Any complications with previous anaesthetics?',
    section: 'anaestheticAssessment', field: 'anaestheticComplications', options: yesNo
  }));
  const complDet = document.createElement('div');
  complDet.dataset.conditional = 'anaestheticAssessment.anaestheticComplications=yes';
  complDet.appendChild(textArea({
    label: 'Complication details',
    section: 'anaestheticAssessment', field: 'complicationDetails',
    placeholder: 'Type, severity, recovery…', rows: 2
  }));
  card.appendChild(complDet);

  card.appendChild(radioGroup({
    label: 'Family history of anaesthetic problems (e.g. malignant hyperthermia)?',
    section: 'anaestheticAssessment', field: 'familyAnaestheticProblems', options: yesNo
  }));
  const famDet = document.createElement('div');
  famDet.dataset.conditional = 'anaestheticAssessment.familyAnaestheticProblems=yes';
  famDet.appendChild(textArea({
    label: 'Family problem details',
    section: 'anaestheticAssessment', field: 'familyProblemDetails',
    placeholder: 'Relative, problem, year…', rows: 2
  }));
  card.appendChild(famDet);

  card.appendChild(selectInput({
    label: 'Mallampati Score',
    section: 'anaestheticAssessment', field: 'mallampatiScore',
    options: [
      { value: 'I', label: 'I — Easy intubation' },
      { value: 'II', label: 'II' },
      { value: 'III', label: 'III — Anticipate difficult airway' },
      { value: 'IV', label: 'IV — Difficult airway' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Any other airway concerns (limited mouth opening, neck mobility)?',
    section: 'anaestheticAssessment', field: 'airwayConcerns', options: yesNo
  }));
  const airDet = document.createElement('div');
  airDet.dataset.conditional = 'anaestheticAssessment.airwayConcerns=yes';
  airDet.appendChild(textArea({
    label: 'Airway details',
    section: 'anaestheticAssessment', field: 'airwayDetails',
    placeholder: 'Specific concerns…', rows: 2
  }));
  card.appendChild(airDet);

  card.appendChild(radioGroup({
    label: 'Nil-by-mouth instructions confirmed?',
    section: 'anaestheticAssessment', field: 'nilByMouthConfirmed', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Smoking status',
    section: 'anaestheticAssessment', field: 'smokingStatus',
    options: [
      { value: 'current', label: 'Current smoker' },
      { value: 'ex', label: 'Ex-smoker' },
      { value: 'never', label: 'Never smoked' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Alcohol use',
    section: 'anaestheticAssessment', field: 'alcoholUse',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'heavy', label: 'Heavy' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Anaesthetic Plan',
    section: 'anaestheticAssessment', field: 'anaestheticPlan',
    options: [
      { value: 'general', label: 'General anaesthetic' },
      { value: 'regional', label: 'Regional anaesthetic' },
      { value: 'sedation', label: 'Sedation' }
    ]
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Collection Method Assessment',
    description: 'Choose between peripheral blood stem cells (PBSC) and bone marrow harvest.'
  });

  const methodOpts = [
    { value: 'pbsc', label: 'Peripheral Blood Stem Cells (PBSC)' },
    { value: 'bone-marrow', label: 'Bone Marrow Harvest' },
    { value: 'either', label: 'Either method acceptable' }
  ];

  card.appendChild(selectInput({
    label: 'Donor preferred method',
    section: 'collectionMethodAssessment', field: 'preferredMethod',
    options: methodOpts
  }));
  card.appendChild(selectInput({
    label: 'Recipient / transplant team preference',
    section: 'collectionMethodAssessment', field: 'recipientPreference',
    options: methodOpts
  }));
  card.appendChild(selectInput({
    label: 'Final agreed collection method',
    section: 'collectionMethodAssessment', field: 'finalCollectionMethod',
    options: [
      { value: 'pbsc', label: 'Peripheral Blood Stem Cells (PBSC)' },
      { value: 'bone-marrow', label: 'Bone Marrow Harvest' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'G-CSF eligible?',
    section: 'collectionMethodAssessment', field: 'gcsfEligible', options: yesNo
  }));
  const gcsfDet = document.createElement('div');
  gcsfDet.dataset.conditional = 'collectionMethodAssessment.gcsfEligible=no';
  gcsfDet.appendChild(textArea({
    label: 'G-CSF contraindications',
    section: 'collectionMethodAssessment', field: 'gcsfContraindications',
    placeholder: 'e.g. sickle cell trait, splenomegaly, prior bad reaction…', rows: 2
  }));
  card.appendChild(gcsfDet);

  card.appendChild(radioGroup({
    label: 'Venous access suitable for apheresis?',
    section: 'collectionMethodAssessment', field: 'venousAccessSuitableForApheresis', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Central line required?',
    section: 'collectionMethodAssessment', field: 'centralLineRequired', options: yesNo
  }));

  const planGrid = document.createElement('div');
  planGrid.className = 'two-col';
  planGrid.appendChild(textInput({ label: 'Estimated donor weight', section: 'collectionMethodAssessment', field: 'estimatedDonorWeightKg', type: 'number', min: 1, max: 400, unit: 'kg' }));
  planGrid.appendChild(textInput({ label: 'Target CD34+ dose', section: 'collectionMethodAssessment', field: 'targetCd34Dose', type: 'number', min: 0, max: 100, step: 0.1, unit: 'x10^6/kg' }));
  planGrid.appendChild(textInput({ label: 'Estimated collection days (PBSC)', section: 'collectionMethodAssessment', field: 'estimatedCollectionDays', type: 'number', min: 1, max: 5 }));
  planGrid.appendChild(textInput({ label: 'Bone marrow harvest volume', section: 'collectionMethodAssessment', field: 'boneMarrowHarvestVolumeMl', type: 'number', min: 0, max: 3000, unit: 'mL' }));
  card.appendChild(planGrid);

  card.appendChild(radioGroup({
    label: 'Autologous blood donation arranged (for marrow harvest)?',
    section: 'collectionMethodAssessment', field: 'autologousBloodDonation', options: yesNo
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Psychological Readiness',
    description: 'Donor understanding, voluntariness, and psychosocial support.'
  });

  card.appendChild(radioGroup({
    label: 'Do you understand the donation procedure?',
    section: 'psychologicalReadiness', field: 'understandsProcedure', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you understand the risks involved?',
    section: 'psychologicalReadiness', field: 'understandsRisks', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Is your decision to donate voluntary and free of pressure?',
    section: 'psychologicalReadiness', field: 'voluntaryDecision', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Are there any coercion concerns identified?',
    section: 'psychologicalReadiness', field: 'coercionConcerns', options: yesNo
  }));
  const coercDet = document.createElement('div');
  coercDet.dataset.conditional = 'psychologicalReadiness.coercionConcerns=yes';
  coercDet.appendChild(textArea({
    label: 'Coercion details',
    section: 'psychologicalReadiness', field: 'coercionDetails',
    placeholder: 'Describe concerns…', rows: 2
  }));
  card.appendChild(coercDet);

  card.appendChild(selectInput({
    label: 'Anxiety about procedure',
    section: 'psychologicalReadiness', field: 'anxietyAboutProcedure',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Previous psychological / mental health issues?',
    section: 'psychologicalReadiness', field: 'previousPsychologicalIssues', options: yesNo
  }));
  const psyDet = document.createElement('div');
  psyDet.dataset.conditional = 'psychologicalReadiness.previousPsychologicalIssues=yes';
  psyDet.appendChild(textArea({
    label: 'Psychological issue details',
    section: 'psychologicalReadiness', field: 'psychologicalIssueDetails',
    placeholder: 'Diagnosis, treatment, current status…', rows: 2
  }));
  card.appendChild(psyDet);

  card.appendChild(radioGroup({
    label: 'Do you have a support network (family, friends, partner)?',
    section: 'psychologicalReadiness', field: 'supportNetwork', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Time off work arranged',
    section: 'psychologicalReadiness', field: 'timeOffWorkArranged',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'not-applicable', label: 'Not applicable' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Donor advocate consulted?',
    section: 'psychologicalReadiness', field: 'donorAdvocateConsulted', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Are you willing to proceed with donation?',
    section: 'psychologicalReadiness', field: 'willingToProceed',
    options: [
      { value: 'yes', label: 'Yes — willing to proceed' },
      { value: 'no', label: 'No — do not wish to proceed' },
      { value: 'undecided', label: 'Undecided' }
    ]
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Consent & Eligibility Decision',
    description: 'Informed consent and final assessor decision.'
  });

  card.appendChild(radioGroup({
    label: 'Informed consent given?',
    section: 'consentEligibility', field: 'informedConsentGiven', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Consent form signed?',
    section: 'consentEligibility', field: 'consentFormSigned', options: yesNo
  }));
  card.appendChild(textInput({
    label: 'Consent date', section: 'consentEligibility', field: 'consentDate', type: 'date'
  }));

  const witnessGrid = document.createElement('div');
  witnessGrid.className = 'two-col';
  witnessGrid.appendChild(textInput({ label: 'Witness name', section: 'consentEligibility', field: 'witnessName' }));
  witnessGrid.appendChild(textInput({ label: 'Witness role', section: 'consentEligibility', field: 'witnessRole' }));
  card.appendChild(witnessGrid);

  card.appendChild(radioGroup({
    label: 'Information leaflet provided?',
    section: 'consentEligibility', field: 'informationLeafletProvided', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'All donor questions answered?',
    section: 'consentEligibility', field: 'questionsAnswered', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Eligibility decision',
    section: 'consentEligibility', field: 'eligibilityDecision',
    options: [
      { value: 'suitable', label: 'Suitable' },
      { value: 'conditionally-suitable', label: 'Conditionally suitable' },
      { value: 'unsuitable', label: 'Unsuitable' }
    ]
  }));

  const condWrap = document.createElement('div');
  condWrap.dataset.conditional = 'consentEligibility.eligibilityDecision=conditionally-suitable';
  condWrap.appendChild(textArea({
    label: 'Eligibility conditions',
    section: 'consentEligibility', field: 'eligibilityConditions',
    placeholder: 'Conditions to satisfy before final clearance…', rows: 2
  }));
  card.appendChild(condWrap);

  const unsuitWrap = document.createElement('div');
  unsuitWrap.dataset.conditional = 'consentEligibility.eligibilityDecision=unsuitable';
  unsuitWrap.appendChild(textArea({
    label: 'Deferral reason',
    section: 'consentEligibility', field: 'deferralReason',
    placeholder: 'Reason donor is unsuitable…', rows: 2
  }));
  unsuitWrap.appendChild(selectInput({
    label: 'Deferral duration',
    section: 'consentEligibility', field: 'deferralDuration',
    options: [
      { value: 'temporary', label: 'Temporary' },
      { value: 'permanent', label: 'Permanent' }
    ]
  }));
  card.appendChild(unsuitWrap);

  const assGrid = document.createElement('div');
  assGrid.className = 'two-col';
  assGrid.appendChild(textInput({ label: 'Assessor name', section: 'consentEligibility', field: 'assessorName' }));
  assGrid.appendChild(textInput({ label: 'Assessor role', section: 'consentEligibility', field: 'assessorRole' }));
  card.appendChild(assGrid);

  card.appendChild(textInput({
    label: 'Assessment date', section: 'consentEligibility', field: 'assessmentDate', type: 'date'
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
  // Demographics (6)
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'weight'],
  ['demographics', 'height'],
  // Donor registration & HLA (10)
  ['donorRegistrationHlaTyping', 'donorRegistry'],
  ['donorRegistrationHlaTyping', 'donorRegistryId'],
  ['donorRegistrationHlaTyping', 'donationType'],
  ['donorRegistrationHlaTyping', 'recipientRelationship'],
  ['donorRegistrationHlaTyping', 'hlaA'],
  ['donorRegistrationHlaTyping', 'hlaB'],
  ['donorRegistrationHlaTyping', 'hlaDrb1'],
  ['donorRegistrationHlaTyping', 'hlaMatchLevel'],
  ['donorRegistrationHlaTyping', 'crossmatchResult'],
  ['donorRegistrationHlaTyping', 'previousDonation'],
  // Medical history (10)
  ['medicalHistory', 'hasAutoimmuneDisease'],
  ['medicalHistory', 'hasMalignancy'],
  ['medicalHistory', 'hasCardiovascularDisease'],
  ['medicalHistory', 'hasRespiratoryDisease'],
  ['medicalHistory', 'hasRenalDisease'],
  ['medicalHistory', 'hasHepaticDisease'],
  ['medicalHistory', 'hasBleedingDisorder'],
  ['medicalHistory', 'hasNeurologicalCondition'],
  ['medicalHistory', 'previousSurgery'],
  ['medicalHistory', 'currentMedications'],
  // Physical examination (10)
  ['physicalExamination', 'bpSystolic'],
  ['physicalExamination', 'bpDiastolic'],
  ['physicalExamination', 'heartRate'],
  ['physicalExamination', 'oxygenSaturation'],
  ['physicalExamination', 'generalAppearance'],
  ['physicalExamination', 'cardiovascularExamination'],
  ['physicalExamination', 'respiratoryExamination'],
  ['physicalExamination', 'abdominalExamination'],
  ['physicalExamination', 'venousAccessAssessment'],
  ['physicalExamination', 'posteriorIliacCrestAssessment'],
  // Haematological (8)
  ['haematologicalAssessment', 'haemoglobin'],
  ['haematologicalAssessment', 'whiteCellCount'],
  ['haematologicalAssessment', 'plateletCount'],
  ['haematologicalAssessment', 'creatinine'],
  ['haematologicalAssessment', 'bloodGroup'],
  ['haematologicalAssessment', 'coagulationScreen'],
  ['haematologicalAssessment', 'liverFunction'],
  ['haematologicalAssessment', 'ferritin'],
  // Infectious disease (12)
  ['infectiousDiseaseScreening', 'hivStatus'],
  ['infectiousDiseaseScreening', 'hepatitisBSurfaceAntigen'],
  ['infectiousDiseaseScreening', 'hepatitisBCoreAntibody'],
  ['infectiousDiseaseScreening', 'hepatitisCAbntibody'],
  ['infectiousDiseaseScreening', 'htlvStatus'],
  ['infectiousDiseaseScreening', 'syphilisScreen'],
  ['infectiousDiseaseScreening', 'cmvStatus'],
  ['infectiousDiseaseScreening', 'tuberculosisScreen'],
  ['infectiousDiseaseScreening', 'recentTravel'],
  ['infectiousDiseaseScreening', 'recentInfection'],
  ['infectiousDiseaseScreening', 'vaccinationUpToDate'],
  ['infectiousDiseaseScreening', 'ebvStatus'],
  // Anaesthetic (10)
  ['anaestheticAssessment', 'asaGrade'],
  ['anaestheticAssessment', 'previousAnaesthetic'],
  ['anaestheticAssessment', 'anaestheticComplications'],
  ['anaestheticAssessment', 'familyAnaestheticProblems'],
  ['anaestheticAssessment', 'mallampatiScore'],
  ['anaestheticAssessment', 'airwayConcerns'],
  ['anaestheticAssessment', 'nilByMouthConfirmed'],
  ['anaestheticAssessment', 'smokingStatus'],
  ['anaestheticAssessment', 'alcoholUse'],
  ['anaestheticAssessment', 'anaestheticPlan'],
  // Collection method (8)
  ['collectionMethodAssessment', 'preferredMethod'],
  ['collectionMethodAssessment', 'recipientPreference'],
  ['collectionMethodAssessment', 'finalCollectionMethod'],
  ['collectionMethodAssessment', 'gcsfEligible'],
  ['collectionMethodAssessment', 'venousAccessSuitableForApheresis'],
  ['collectionMethodAssessment', 'centralLineRequired'],
  ['collectionMethodAssessment', 'estimatedDonorWeightKg'],
  ['collectionMethodAssessment', 'autologousBloodDonation'],
  // Psychological (10)
  ['psychologicalReadiness', 'understandsProcedure'],
  ['psychologicalReadiness', 'understandsRisks'],
  ['psychologicalReadiness', 'voluntaryDecision'],
  ['psychologicalReadiness', 'coercionConcerns'],
  ['psychologicalReadiness', 'anxietyAboutProcedure'],
  ['psychologicalReadiness', 'previousPsychologicalIssues'],
  ['psychologicalReadiness', 'supportNetwork'],
  ['psychologicalReadiness', 'timeOffWorkArranged'],
  ['psychologicalReadiness', 'donorAdvocateConsulted'],
  ['psychologicalReadiness', 'willingToProceed'],
  // Consent (8)
  ['consentEligibility', 'informedConsentGiven'],
  ['consentEligibility', 'consentFormSigned'],
  ['consentEligibility', 'consentDate'],
  ['consentEligibility', 'informationLeafletProvided'],
  ['consentEligibility', 'questionsAnswered'],
  ['consentEligibility', 'eligibilityDecision'],
  ['consentEligibility', 'assessorName'],
  ['consentEligibility', 'assessmentDate']
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

  const {
    eligibility,
    overallRisk,
    suggestedEligibility,
    hlaMatchLevel,
    collectionMethod,
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
      <td><span class="grade-badge ${gradeClass(r.grade)}">${esc(gradeLabel(r.grade))}</span></td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No donor rules fired.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Description</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const suggestedNote =
    eligibility !== suggestedEligibility
      ? `<p class="muted">Engine-suggested eligibility: <strong>${esc(eligibilityLabel(suggestedEligibility))}</strong> (assessor decision is shown above).</p>`
      : '';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Bone Marrow Donation Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Eligibility</h3>
      <p class="act-summary">
        <span class="act-score-badge ${eligibilityClass(eligibility)}">${esc(eligibilityLabel(eligibility))}</span>
        <span class="act-score-badge ${riskLevelClass(overallRisk)}">${esc(riskLevelLabel(overallRisk))}</span>
      </p>
      ${suggestedNote}

      <h3>HLA Match</h3>
      <p>${esc(hlaMatchLevel)}</p>

      <h3>Collection Method</h3>
      <p>${esc(collectionMethod)}</p>

      <h3>Fired Donor Rules</h3>
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
  const _errors = validateForm();
  if (_errors.length > 0) return;
  recomputeDerived();
  const grading = gradeDonor(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    eligibility: grading.eligibility,
    overallRisk: grading.overallRisk,
    suggestedEligibility: grading.suggestedEligibility,
    hlaMatchLevel: grading.hlaMatchLevel,
    collectionMethod: grading.collectionMethod,
    firedRules: grading.firedRules,
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
  { step: 1,  section: 'demographics',                 title: 'Demographics' },
  { step: 2,  section: 'donorRegistrationHlaTyping',   title: 'HLA / Registration' },
  { step: 3,  section: 'medicalHistory',               title: 'Medical' },
  { step: 4,  section: 'physicalExamination',          title: 'Physical Exam' },
  { step: 5,  section: 'haematologicalAssessment',     title: 'Haematology' },
  { step: 6,  section: 'infectiousDiseaseScreening',   title: 'Infectious Disease' },
  { step: 7,  section: 'anaestheticAssessment',        title: 'Anaesthetic' },
  { step: 8,  section: 'collectionMethodAssessment',   title: 'Collection Method' },
  { step: 9,  section: 'psychologicalReadiness',       title: 'Psychological' },
  { step: 10, section: 'consentEligibility',           title: 'Consent & Eligibility' }
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
