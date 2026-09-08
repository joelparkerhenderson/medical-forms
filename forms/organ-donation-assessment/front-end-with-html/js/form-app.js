import { gradeDonor } from './donation-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { bmiCategory, calculateBMI, donorTypeLabel, eligibilityClass, eligibilityLabel, emptyAssessment, gradeClass, gradeLabel, riskLevelClass, riskLevelLabel } from './types.js';

// Organ Donation Assessment - donor wizard (vanilla JS, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure donation-grader engine and renders an inline report. State
// is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'organ-donation-assessment.front-end-form-with-html.v1';
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
  slug: 'organ-donation-assessment',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const rep = document.getElementById('report');
    if (rep) rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
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
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
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
  const reqAttrs = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"${reqAttrs}
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

  const reqAttrs = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    <select id="${id}" name="${id}" class="select"${reqAttrs} aria-describedby="${id}-error">
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
  if (opts.livingDonorOnly) {
    card.dataset.livingDonorOnly = 'true';
  }
  const desc = opts.description
    ? `<span class="section-description">${esc(opts.description)}</span>`
    : '';
  const livingNote = opts.livingDonorOnly
    ? '<span class="section-description" style="font-style:italic;display:block;margin-top:0.25rem">Living-donor only — hidden when donor type is deceased.</span>'
    : '';
  const legend = document.createElement('legend');
  legend.className = 'fieldset-legend';
  legend.innerHTML =
    `<span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc + livingNote;
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
// Section renderers (1 per organ-donation step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const screenOpts = [
  { value: 'negative', label: 'Negative' },
  { value: 'positive', label: 'Positive' },
  { value: 'pending', label: 'Pending' }
];

const normalAbnormalOpts = [
  { value: 'normal', label: 'Normal' },
  { value: 'abnormal', label: 'Abnormal' },
  { value: 'pending', label: 'Pending' }
];

const compatibilityOpts = [
  { value: 'compatible', label: 'Compatible' },
  { value: 'incompatible', label: 'Incompatible' },
  { value: 'pending', label: 'Pending' }
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

  card.appendChild(textInput({
    label: 'Ethnicity', section: 'demographics', field: 'ethnicity',
    placeholder: 'Self-reported ethnicity'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Donor Type & Registration',
    description: 'Living vs deceased donor, donor register details, and (for living) recipient relationship.'
  });

  card.appendChild(radioGroup({
    label: 'Donor type',
    section: 'donorTypeRegistration', field: 'donorType',
    options: [
      { value: 'living', label: 'Living donor' },
      { value: 'deceased', label: 'Deceased donor' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Registered on a donor register?',
    section: 'donorTypeRegistration', field: 'registeredOnDonorRegister',
    options: yesNo
  }));

  const regWrap = document.createElement('div');
  regWrap.dataset.conditional = 'donorTypeRegistration.registeredOnDonorRegister=yes';
  const regGrid = document.createElement('div');
  regGrid.className = 'two-col';
  regGrid.appendChild(textInput({
    label: 'Registry name',
    section: 'donorTypeRegistration', field: 'registryName',
    placeholder: 'e.g. NHS Organ Donor Register'
  }));
  regGrid.appendChild(textInput({
    label: 'Registration date',
    section: 'donorTypeRegistration', field: 'registrationDate',
    type: 'date'
  }));
  regWrap.appendChild(regGrid);
  card.appendChild(regWrap);

  // Recipient relationship — relevant for living donors.
  const livingRelWrap = document.createElement('div');
  livingRelWrap.dataset.conditional = 'donorTypeRegistration.donorType=living';
  livingRelWrap.appendChild(selectInput({
    label: 'Recipient relationship (living donor)',
    section: 'donorTypeRegistration', field: 'recipientRelationship',
    options: [
      { value: 'spouse-partner', label: 'Spouse / partner' },
      { value: 'parent', label: 'Parent' },
      { value: 'child', label: 'Adult child' },
      { value: 'sibling', label: 'Sibling' },
      { value: 'other-relative', label: 'Other relative' },
      { value: 'friend', label: 'Friend / known but not related' },
      { value: 'altruistic', label: 'Altruistic / non-directed' },
      { value: 'paired-pooled', label: 'Paired / pooled exchange' }
    ]
  }));
  livingRelWrap.appendChild(textInput({
    label: 'Recipient name (if known)',
    section: 'donorTypeRegistration', field: 'recipientName'
  }));
  card.appendChild(livingRelWrap);

  card.appendChild(radioGroup({
    label: 'Have you previously donated organs / tissue?',
    section: 'donorTypeRegistration', field: 'previousDonation',
    options: yesNo
  }));
  const prevWrap = document.createElement('div');
  prevWrap.dataset.conditional = 'donorTypeRegistration.previousDonation=yes';
  prevWrap.appendChild(textArea({
    label: 'Previous donation details',
    section: 'donorTypeRegistration', field: 'previousDonationDetails',
    placeholder: 'When, where, organ/tissue, recipient outcome…', rows: 2
  }));
  card.appendChild(prevWrap);

  card.appendChild(textArea({
    label: 'Intended organ(s) for donation',
    section: 'donorTypeRegistration', field: 'intendedOrgans',
    placeholder: 'e.g. kidney, liver lobe, heart, lung, pancreas…',
    rows: 2
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Medical History',
    description: 'Past and current medical conditions relevant to donor and recipient safety.'
  });

  card.appendChild(radioGroup({
    label: 'Any history of malignancy (cancer)?',
    section: 'medicalHistory', field: 'hasMalignancy', options: yesNo
  }));
  const malWrap = document.createElement('div');
  malWrap.dataset.conditional = 'medicalHistory.hasMalignancy=yes';
  malWrap.appendChild(textArea({
    label: 'Malignancy details',
    section: 'medicalHistory', field: 'malignancyDetails',
    placeholder: 'Type, stage, year, treatment, current status…', rows: 2
  }));
  malWrap.appendChild(radioGroup({
    label: 'Was the malignancy primary CNS (low metastatic risk)?',
    section: 'medicalHistory', field: 'hasCnsMalignancy', options: yesNo
  }));
  card.appendChild(malWrap);

  const conds = [
    ['hasAutoimmuneDisease', 'autoimmuneDetails', 'autoimmune disease (e.g. lupus, RA, MS)'],
    ['hasDiabetes', 'diabetesDetails', 'diabetes mellitus'],
    ['hasHypertension', 'hypertensionDetails', 'hypertension'],
    ['hasCardiovascularDisease', 'cardiovascularDetails', 'cardiovascular disease (heart attack, angina, heart failure)']
  ];
  for (const [yn, det, label] of conds) {
    card.appendChild(radioGroup({
      label: `Do you have a history of ${label}?`,
      section: 'medicalHistory', field: yn, options: yesNo
    }));
    const wrap = document.createElement('div');
    wrap.dataset.conditional = `medicalHistory.${yn}=yes`;
    wrap.appendChild(textArea({
      label: 'Details',
      section: 'medicalHistory', field: det,
      placeholder: 'Diagnosis, year, treatment, current status…', rows: 2
    }));
    card.appendChild(wrap);
  }

  card.appendChild(radioGroup({
    label: 'Any active infection?',
    section: 'medicalHistory', field: 'hasActiveInfection', options: yesNo
  }));
  const infWrap = document.createElement('div');
  infWrap.dataset.conditional = 'medicalHistory.hasActiveInfection=yes';
  infWrap.appendChild(textArea({
    label: 'Active infection details',
    section: 'medicalHistory', field: 'activeInfectionDetails',
    placeholder: 'Type, site, treatment, response…', rows: 2
  }));
  card.appendChild(infWrap);

  card.appendChild(radioGroup({
    label: 'Uncontrolled sepsis?',
    section: 'medicalHistory', field: 'hasUncontrolledSepsis', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Any CJD risk factors (family history, dura mater grafts, growth hormone)?',
    section: 'medicalHistory', field: 'hasCjdRisk', options: yesNo
  }));
  const cjdWrap = document.createElement('div');
  cjdWrap.dataset.conditional = 'medicalHistory.hasCjdRisk=yes';
  cjdWrap.appendChild(textArea({
    label: 'CJD risk details',
    section: 'medicalHistory', field: 'cjdDetails',
    placeholder: 'Specific risk factors…', rows: 2
  }));
  card.appendChild(cjdWrap);

  card.appendChild(radioGroup({
    label: 'History of intravenous drug use?',
    section: 'medicalHistory', field: 'ivDrugUseHistory', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Current medications',
    section: 'medicalHistory', field: 'currentMedications',
    placeholder: 'List all prescription, OTC and supplement medications…', rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Have you had previous surgery?',
    section: 'medicalHistory', field: 'previousSurgery', options: yesNo
  }));
  const surgWrap = document.createElement('div');
  surgWrap.dataset.conditional = 'medicalHistory.previousSurgery=yes';
  surgWrap.appendChild(textArea({
    label: 'Surgery details',
    section: 'medicalHistory', field: 'surgeryDetails',
    placeholder: 'Procedure, date, anaesthetic, complications…', rows: 2
  }));
  card.appendChild(surgWrap);

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Organ Function Assessment',
    description: 'Laboratory and imaging assessments of kidney, liver, heart, lung, and pancreas function.'
  });

  card.appendChild(subHeader('Renal', 'Kidney function and imaging.'));
  const renal = document.createElement('div');
  renal.className = 'two-col';
  renal.appendChild(textInput({ label: 'Creatinine', section: 'organFunction', field: 'creatinine', type: 'number', min: 0, max: 2000, unit: 'µmol/L' }));
  renal.appendChild(textInput({ label: 'eGFR', section: 'organFunction', field: 'egfr', type: 'number', min: 0, max: 200, unit: 'mL/min/1.73m²' }));
  card.appendChild(renal);
  card.appendChild(selectInput({
    label: 'Kidney imaging',
    section: 'organFunction', field: 'kidneyImaging',
    options: normalAbnormalOpts
  }));
  card.appendChild(textArea({
    label: 'Kidney notes',
    section: 'organFunction', field: 'kidneyNotes',
    placeholder: 'CT angiography, ultrasound, anatomic findings…', rows: 2
  }));

  card.appendChild(subHeader('Hepatic', 'Liver function tests and imaging.'));
  const liver = document.createElement('div');
  liver.className = 'three-col';
  liver.appendChild(textInput({ label: 'ALT', section: 'organFunction', field: 'alt', type: 'number', min: 0, max: 2000, unit: 'U/L' }));
  liver.appendChild(textInput({ label: 'AST', section: 'organFunction', field: 'ast', type: 'number', min: 0, max: 2000, unit: 'U/L' }));
  liver.appendChild(textInput({ label: 'Bilirubin', section: 'organFunction', field: 'bilirubin', type: 'number', min: 0, max: 1000, unit: 'µmol/L' }));
  card.appendChild(liver);
  card.appendChild(selectInput({
    label: 'Liver imaging',
    section: 'organFunction', field: 'liverImaging',
    options: normalAbnormalOpts
  }));
  card.appendChild(textArea({
    label: 'Liver notes',
    section: 'organFunction', field: 'liverNotes',
    placeholder: 'Ultrasound, MRI, steatosis, anatomic notes…', rows: 2
  }));

  card.appendChild(subHeader('Cardiac', 'Echocardiogram and cardiac function.'));
  const cardiac = document.createElement('div');
  cardiac.className = 'two-col';
  cardiac.appendChild(textInput({ label: 'Ejection fraction', section: 'organFunction', field: 'ejectionFraction', type: 'number', min: 0, max: 100, unit: '%' }));
  cardiac.appendChild(selectInput({
    label: 'Echocardiogram',
    section: 'organFunction', field: 'echocardiogram',
    options: normalAbnormalOpts
  }));
  card.appendChild(cardiac);
  card.appendChild(textArea({
    label: 'Cardiac notes',
    section: 'organFunction', field: 'cardiacNotes',
    placeholder: 'Wall motion, valve disease, coronary findings…', rows: 2
  }));

  card.appendChild(subHeader('Pulmonary', 'Gas exchange and chest imaging.'));
  const lung = document.createElement('div');
  lung.className = 'two-col';
  lung.appendChild(textInput({ label: 'PaO2 / FiO2 ratio', section: 'organFunction', field: 'pao2Fio2Ratio', type: 'number', min: 0, max: 600 }));
  lung.appendChild(selectInput({
    label: 'Chest imaging',
    section: 'organFunction', field: 'chestImaging',
    options: normalAbnormalOpts
  }));
  card.appendChild(lung);
  card.appendChild(textArea({
    label: 'Pulmonary notes',
    section: 'organFunction', field: 'pulmonaryNotes',
    placeholder: 'Chest X-ray / CT, contusion, infection, secretions…', rows: 2
  }));

  card.appendChild(subHeader('Pancreatic', 'Glucose handling and pancreas-relevant labs.'));
  const panc = document.createElement('div');
  panc.className = 'two-col';
  panc.appendChild(textInput({ label: 'Fasting glucose', section: 'organFunction', field: 'fastingGlucose', type: 'number', min: 0, max: 50, step: 0.1, unit: 'mmol/L' }));
  panc.appendChild(textInput({ label: 'HbA1c', section: 'organFunction', field: 'hba1c', type: 'number', min: 0, max: 20, step: 0.1, unit: '%' }));
  card.appendChild(panc);
  card.appendChild(textArea({
    label: 'Pancreatic notes',
    section: 'organFunction', field: 'pancreaticNotes',
    placeholder: 'Lipase, amylase, imaging…', rows: 2
  }));

  card.appendChild(radioGroup({
    label: 'Severe organ failure incompatible with donation?',
    section: 'organFunction', field: 'severeOrganFailure', options: yesNo
  }));
  const sofWrap = document.createElement('div');
  sofWrap.dataset.conditional = 'organFunction.severeOrganFailure=yes';
  sofWrap.appendChild(textArea({
    label: 'Severe organ failure details',
    section: 'organFunction', field: 'severeOrganFailureDetails',
    placeholder: 'Which organ(s), nature of failure…', rows: 2
  }));
  card.appendChild(sofWrap);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Infectious Disease Screening',
    description: 'Mandatory donor virology and infection screening.'
  });

  const screens = [
    ['hivStatus', 'HIV'],
    ['hbsAg', 'Hepatitis B (HBsAg)'],
    ['hbcAb', 'Hepatitis B (anti-HBc)'],
    ['hcvAb', 'Hepatitis C antibody'],
    ['htlvStatus', 'HTLV'],
    ['cmvStatus', 'CMV'],
    ['ebvStatus', 'EBV'],
    ['syphilisScreen', 'Syphilis'],
    ['toxoplasmaStatus', 'Toxoplasma'],
    ['tuberculosisScreen', 'Tuberculosis']
  ];
  for (const [field, label] of screens) {
    card.appendChild(selectInput({
      label, section: 'infectiousDiseaseScreening', field,
      options: screenOpts
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

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Immunological Assessment',
    description: 'HLA typing, ABO compatibility, crossmatch, and panel reactive antibodies.'
  });

  const bloodGrid = document.createElement('div');
  bloodGrid.className = 'two-col';
  bloodGrid.appendChild(selectInput({
    label: 'Donor blood group',
    section: 'immunologicalAssessment', field: 'donorBloodGroup',
    options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => ({ value: g, label: g }))
  }));
  bloodGrid.appendChild(selectInput({
    label: 'Recipient blood group',
    section: 'immunologicalAssessment', field: 'recipientBloodGroup',
    options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => ({ value: g, label: g }))
  }));
  card.appendChild(bloodGrid);

  card.appendChild(selectInput({
    label: 'ABO compatibility',
    section: 'immunologicalAssessment', field: 'aboCompatibility',
    options: compatibilityOpts
  }));

  card.appendChild(subHeader('HLA antigens', 'Record typed alleles where known.'));
  const hlaGrid = document.createElement('div');
  hlaGrid.className = 'three-col';
  hlaGrid.appendChild(textInput({ label: 'HLA-A', section: 'immunologicalAssessment', field: 'hlaA' }));
  hlaGrid.appendChild(textInput({ label: 'HLA-B', section: 'immunologicalAssessment', field: 'hlaB' }));
  hlaGrid.appendChild(textInput({ label: 'HLA-C', section: 'immunologicalAssessment', field: 'hlaC' }));
  hlaGrid.appendChild(textInput({ label: 'HLA-DR', section: 'immunologicalAssessment', field: 'hlaDr' }));
  hlaGrid.appendChild(textInput({ label: 'HLA-DQ', section: 'immunologicalAssessment', field: 'hlaDq' }));
  hlaGrid.appendChild(textInput({ label: 'HLA-DP', section: 'immunologicalAssessment', field: 'hlaDp' }));
  card.appendChild(hlaGrid);

  card.appendChild(selectInput({
    label: 'HLA match level',
    section: 'immunologicalAssessment', field: 'hlaMatchLevel',
    options: [
      { value: '6-of-6', label: '6/6 (Full Match)' },
      { value: '5-of-6', label: '5/6' },
      { value: '4-of-6', label: '4/6' },
      { value: '3-of-6', label: '3/6' },
      { value: '2-of-6', label: '2/6' },
      { value: 'haploidentical', label: 'Haploidentical' },
      { value: 'mismatched', label: 'Mismatched (full)' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Crossmatch result',
    section: 'immunologicalAssessment', field: 'crossmatchResult',
    options: compatibilityOpts
  }));

  card.appendChild(textInput({
    label: 'PRA (Panel Reactive Antibodies)',
    section: 'immunologicalAssessment', field: 'pra',
    type: 'number', min: 0, max: 100, unit: '%'
  }));

  card.appendChild(radioGroup({
    label: 'Donor-specific antibodies present?',
    section: 'immunologicalAssessment', field: 'donorSpecificAntibodies', options: yesNo
  }));
  const dsaWrap = document.createElement('div');
  dsaWrap.dataset.conditional = 'immunologicalAssessment.donorSpecificAntibodies=yes';
  dsaWrap.appendChild(textArea({
    label: 'DSA details',
    section: 'immunologicalAssessment', field: 'dsaDetails',
    placeholder: 'Antibody specificities, MFI levels, history…', rows: 2
  }));
  card.appendChild(dsaWrap);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Surgical Assessment',
    description: 'Anaesthetic risk and surgical fitness for donation procedure.'
  });

  card.appendChild(selectInput({
    label: 'ASA Grade',
    section: 'surgicalAssessment', field: 'asaGrade',
    options: [
      { value: 'I', label: 'ASA I — Healthy donor' },
      { value: 'II', label: 'ASA II — Mild systemic disease' },
      { value: 'III', label: 'ASA III — Severe systemic disease' },
      { value: 'IV', label: 'ASA IV — Life-threatening disease' },
      { value: 'V', label: 'ASA V — Moribund' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Have you had a general anaesthetic before?',
    section: 'surgicalAssessment', field: 'previousAnaesthetic', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Any complications with previous anaesthetics?',
    section: 'surgicalAssessment', field: 'anaestheticComplications', options: yesNo
  }));
  const complDet = document.createElement('div');
  complDet.dataset.conditional = 'surgicalAssessment.anaestheticComplications=yes';
  complDet.appendChild(textArea({
    label: 'Complication details',
    section: 'surgicalAssessment', field: 'complicationDetails',
    placeholder: 'Type, severity, recovery…', rows: 2
  }));
  card.appendChild(complDet);

  card.appendChild(selectInput({
    label: 'Mallampati Score',
    section: 'surgicalAssessment', field: 'mallampatiScore',
    options: [
      { value: 'I', label: 'I — Easy intubation' },
      { value: 'II', label: 'II' },
      { value: 'III', label: 'III — Anticipate difficult airway' },
      { value: 'IV', label: 'IV — Difficult airway' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Any other airway concerns?',
    section: 'surgicalAssessment', field: 'airwayConcerns', options: yesNo
  }));
  const airDet = document.createElement('div');
  airDet.dataset.conditional = 'surgicalAssessment.airwayConcerns=yes';
  airDet.appendChild(textArea({
    label: 'Airway details',
    section: 'surgicalAssessment', field: 'airwayDetails',
    placeholder: 'Specific concerns…', rows: 2
  }));
  card.appendChild(airDet);

  card.appendChild(selectInput({
    label: 'Overall surgical fitness',
    section: 'surgicalAssessment', field: 'surgicalFitness',
    options: normalAbnormalOpts
  }));
  const fitWrap = document.createElement('div');
  fitWrap.dataset.conditional = 'surgicalAssessment.surgicalFitness=abnormal';
  fitWrap.appendChild(textArea({
    label: 'Surgical fitness notes',
    section: 'surgicalAssessment', field: 'surgicalFitnessNotes',
    placeholder: 'Specific concerns…', rows: 2
  }));
  card.appendChild(fitWrap);

  card.appendChild(textInput({
    label: 'Planned procedure',
    section: 'surgicalAssessment', field: 'plannedProcedure',
    placeholder: 'e.g. open / laparoscopic donor nephrectomy'
  }));

  card.appendChild(radioGroup({
    label: 'Smoking status',
    section: 'surgicalAssessment', field: 'smokingStatus',
    options: [
      { value: 'current', label: 'Current smoker' },
      { value: 'ex', label: 'Ex-smoker' },
      { value: 'never', label: 'Never smoked' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Alcohol use',
    section: 'surgicalAssessment', field: 'alcoholUse',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'heavy', label: 'Heavy' }
    ]
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Psychological Assessment (Living Donor)',
    description: 'Mental capacity, voluntariness, coercion screening, and ambivalence — for living donors only.',
    livingDonorOnly: true
  });

  card.appendChild(radioGroup({
    label: 'Mental capacity confirmed?',
    section: 'psychologicalAssessment', field: 'mentalCapacityConfirmed', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do you understand the donation procedure?',
    section: 'psychologicalAssessment', field: 'understandsProcedure', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you understand the risks involved?',
    section: 'psychologicalAssessment', field: 'understandsRisks', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Is your decision to donate voluntary and free of pressure?',
    section: 'psychologicalAssessment', field: 'voluntaryDecision', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Are there any coercion concerns identified?',
    section: 'psychologicalAssessment', field: 'coercionConcerns', options: yesNo
  }));
  const coercDet = document.createElement('div');
  coercDet.dataset.conditional = 'psychologicalAssessment.coercionConcerns=yes';
  coercDet.appendChild(textArea({
    label: 'Coercion details',
    section: 'psychologicalAssessment', field: 'coercionDetails',
    placeholder: 'Describe concerns…', rows: 2
  }));
  card.appendChild(coercDet);

  card.appendChild(radioGroup({
    label: 'Significant ambivalence about donation?',
    section: 'psychologicalAssessment', field: 'ambivalence', options: yesNo
  }));
  const ambDet = document.createElement('div');
  ambDet.dataset.conditional = 'psychologicalAssessment.ambivalence=yes';
  ambDet.appendChild(textArea({
    label: 'Ambivalence details',
    section: 'psychologicalAssessment', field: 'ambivalenceDetails',
    placeholder: 'Describe specific concerns or doubts…', rows: 2
  }));
  card.appendChild(ambDet);

  card.appendChild(selectInput({
    label: 'Anxiety about procedure',
    section: 'psychologicalAssessment', field: 'anxietyAboutProcedure',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Previous psychological / mental health issues?',
    section: 'psychologicalAssessment', field: 'previousPsychologicalIssues', options: yesNo
  }));
  const psyDet = document.createElement('div');
  psyDet.dataset.conditional = 'psychologicalAssessment.previousPsychologicalIssues=yes';
  psyDet.appendChild(textArea({
    label: 'Psychological issue details',
    section: 'psychologicalAssessment', field: 'psychologicalIssueDetails',
    placeholder: 'Diagnosis, treatment, current status…', rows: 2
  }));
  card.appendChild(psyDet);

  card.appendChild(radioGroup({
    label: 'Do you have a support network?',
    section: 'psychologicalAssessment', field: 'supportNetwork', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Are you willing to proceed with donation?',
    section: 'psychologicalAssessment', field: 'willingToProceed', options: yesNo
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Ethical & Legal Requirements',
    description: 'HTA Act 2004 compliance, independent assessor review, informed consent (UK living-donor framework).',
    livingDonorOnly: true
  });

  card.appendChild(radioGroup({
    label: 'HTA Act 2004 compliance confirmed?',
    section: 'ethicalLegalRequirements', field: 'htaAct2004Compliant', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Independent assessor review completed?',
    section: 'ethicalLegalRequirements', field: 'independentAssessorReview', options: yesNo
  }));
  const iaWrap = document.createElement('div');
  iaWrap.dataset.conditional = 'ethicalLegalRequirements.independentAssessorReview=yes';
  const iaGrid = document.createElement('div');
  iaGrid.className = 'two-col';
  iaGrid.appendChild(textInput({
    label: 'Independent assessor name',
    section: 'ethicalLegalRequirements', field: 'independentAssessorName'
  }));
  iaGrid.appendChild(textInput({
    label: 'Independent assessor date',
    section: 'ethicalLegalRequirements', field: 'independentAssessorDate',
    type: 'date'
  }));
  iaWrap.appendChild(iaGrid);
  card.appendChild(iaWrap);

  card.appendChild(radioGroup({
    label: 'Informed consent given?',
    section: 'ethicalLegalRequirements', field: 'informedConsentGiven', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Consent form signed?',
    section: 'ethicalLegalRequirements', field: 'consentFormSigned', options: yesNo
  }));
  card.appendChild(textInput({
    label: 'Consent date',
    section: 'ethicalLegalRequirements', field: 'consentDate', type: 'date'
  }));

  const witGrid = document.createElement('div');
  witGrid.className = 'two-col';
  witGrid.appendChild(textInput({ label: 'Witness name', section: 'ethicalLegalRequirements', field: 'witnessName' }));
  witGrid.appendChild(textInput({ label: 'Witness role', section: 'ethicalLegalRequirements', field: 'witnessRole' }));
  card.appendChild(witGrid);

  card.appendChild(radioGroup({
    label: 'Information leaflet provided?',
    section: 'ethicalLegalRequirements', field: 'informationLeafletProvided', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'All donor questions answered?',
    section: 'ethicalLegalRequirements', field: 'questionsAnswered', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Confirmed: no financial reward / inducement (HTA Act 2004 prohibition)?',
    section: 'ethicalLegalRequirements', field: 'financialRewardCheck',
    options: [
      { value: 'yes', label: 'Yes — confirmed no inducement' },
      { value: 'no', label: 'No — concerns identified' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Ethics committee approval received?',
    section: 'ethicalLegalRequirements', field: 'ethicsCommitteeApproval', options: yesNo
  }));
  const ecWrap = document.createElement('div');
  ecWrap.dataset.conditional = 'ethicalLegalRequirements.ethicsCommitteeApproval=yes';
  ecWrap.appendChild(textInput({
    label: 'Ethics approval reference',
    section: 'ethicalLegalRequirements', field: 'ethicsApprovalReference'
  }));
  card.appendChild(ecWrap);

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Eligibility & Allocation Decision',
    description: 'Final assessor decision and (if suitable) organ allocation details.'
  });

  card.appendChild(selectInput({
    label: 'Eligibility decision',
    section: 'eligibilityAllocation', field: 'eligibilityDecision',
    options: [
      { value: 'suitable', label: 'Suitable' },
      { value: 'conditionally-suitable', label: 'Conditionally suitable' },
      { value: 'unsuitable', label: 'Unsuitable' }
    ]
  }));

  const condWrap = document.createElement('div');
  condWrap.dataset.conditional = 'eligibilityAllocation.eligibilityDecision=conditionally-suitable';
  condWrap.appendChild(textArea({
    label: 'Eligibility conditions',
    section: 'eligibilityAllocation', field: 'eligibilityConditions',
    placeholder: 'Conditions to satisfy before final clearance…', rows: 2
  }));
  card.appendChild(condWrap);

  const unsuitWrap = document.createElement('div');
  unsuitWrap.dataset.conditional = 'eligibilityAllocation.eligibilityDecision=unsuitable';
  unsuitWrap.appendChild(textArea({
    label: 'Deferral reason',
    section: 'eligibilityAllocation', field: 'deferralReason',
    placeholder: 'Reason donor is unsuitable…', rows: 2
  }));
  unsuitWrap.appendChild(selectInput({
    label: 'Deferral duration',
    section: 'eligibilityAllocation', field: 'deferralDuration',
    options: [
      { value: 'temporary', label: 'Temporary' },
      { value: 'permanent', label: 'Permanent' }
    ]
  }));
  card.appendChild(unsuitWrap);

  card.appendChild(textArea({
    label: 'Allocated organs',
    section: 'eligibilityAllocation', field: 'allocatedOrgans',
    placeholder: 'e.g. left kidney, liver lobe…', rows: 2
  }));
  card.appendChild(textInput({
    label: 'Intended recipient centre',
    section: 'eligibilityAllocation', field: 'intendedRecipientCentre',
    placeholder: 'Transplant centre / unit'
  }));

  const assGrid = document.createElement('div');
  assGrid.className = 'two-col';
  assGrid.appendChild(textInput({ label: 'Assessor name', section: 'eligibilityAllocation', field: 'assessorName' }));
  assGrid.appendChild(textInput({ label: 'Assessor role', section: 'eligibilityAllocation', field: 'assessorRole' }));
  card.appendChild(assGrid);

  card.appendChild(textInput({
    label: 'Assessment date',
    section: 'eligibilityAllocation', field: 'assessmentDate', type: 'date'
  }));

  card.appendChild(textArea({
    label: 'Additional notes',
    section: 'eligibilityAllocation', field: 'additionalNotes',
    placeholder: 'Any additional clinical or administrative notes…',
    rows: 3
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections + auto-calculated readouts
// ----------------------------------------------------------------------

function updateConditionalSections() {
  // Living-donor only sections (steps 8 & 9 are hidden when donor is deceased).
  // Apply this first so children's data-conditional rules can still hide
  // their inner blocks consistently.
  const isDeceased = state.donorTypeRegistration.donorType === 'deceased';
  document.querySelectorAll('[data-living-donor-only="true"]').forEach((host) => {
    host.style.display = isDeceased ? 'none' : '';
  });

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
  // Demographics (7)
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'weight'],
  ['demographics', 'height'],
  ['demographics', 'ethnicity'],
  // Donor type & registration (5)
  ['donorTypeRegistration', 'donorType'],
  ['donorTypeRegistration', 'registeredOnDonorRegister'],
  ['donorTypeRegistration', 'recipientRelationship'],
  ['donorTypeRegistration', 'previousDonation'],
  ['donorTypeRegistration', 'intendedOrgans'],
  // Medical history (10)
  ['medicalHistory', 'hasMalignancy'],
  ['medicalHistory', 'hasAutoimmuneDisease'],
  ['medicalHistory', 'hasDiabetes'],
  ['medicalHistory', 'hasHypertension'],
  ['medicalHistory', 'hasCardiovascularDisease'],
  ['medicalHistory', 'hasActiveInfection'],
  ['medicalHistory', 'hasUncontrolledSepsis'],
  ['medicalHistory', 'hasCjdRisk'],
  ['medicalHistory', 'ivDrugUseHistory'],
  ['medicalHistory', 'previousSurgery'],
  // Organ function (12)
  ['organFunction', 'creatinine'],
  ['organFunction', 'egfr'],
  ['organFunction', 'kidneyImaging'],
  ['organFunction', 'alt'],
  ['organFunction', 'ast'],
  ['organFunction', 'bilirubin'],
  ['organFunction', 'liverImaging'],
  ['organFunction', 'ejectionFraction'],
  ['organFunction', 'echocardiogram'],
  ['organFunction', 'pao2Fio2Ratio'],
  ['organFunction', 'chestImaging'],
  ['organFunction', 'severeOrganFailure'],
  // Infectious disease (12)
  ['infectiousDiseaseScreening', 'hivStatus'],
  ['infectiousDiseaseScreening', 'hbsAg'],
  ['infectiousDiseaseScreening', 'hbcAb'],
  ['infectiousDiseaseScreening', 'hcvAb'],
  ['infectiousDiseaseScreening', 'htlvStatus'],
  ['infectiousDiseaseScreening', 'cmvStatus'],
  ['infectiousDiseaseScreening', 'ebvStatus'],
  ['infectiousDiseaseScreening', 'syphilisScreen'],
  ['infectiousDiseaseScreening', 'tuberculosisScreen'],
  ['infectiousDiseaseScreening', 'recentTravel'],
  ['infectiousDiseaseScreening', 'recentInfection'],
  ['infectiousDiseaseScreening', 'toxoplasmaStatus'],
  // Immunological (8)
  ['immunologicalAssessment', 'donorBloodGroup'],
  ['immunologicalAssessment', 'recipientBloodGroup'],
  ['immunologicalAssessment', 'aboCompatibility'],
  ['immunologicalAssessment', 'hlaA'],
  ['immunologicalAssessment', 'hlaB'],
  ['immunologicalAssessment', 'hlaMatchLevel'],
  ['immunologicalAssessment', 'crossmatchResult'],
  ['immunologicalAssessment', 'donorSpecificAntibodies'],
  // Surgical (8)
  ['surgicalAssessment', 'asaGrade'],
  ['surgicalAssessment', 'previousAnaesthetic'],
  ['surgicalAssessment', 'anaestheticComplications'],
  ['surgicalAssessment', 'mallampatiScore'],
  ['surgicalAssessment', 'airwayConcerns'],
  ['surgicalAssessment', 'surgicalFitness'],
  ['surgicalAssessment', 'smokingStatus'],
  ['surgicalAssessment', 'alcoholUse'],
  // Psychological (Living-donor only — counted only when donor is living)
  ['psychologicalAssessment', 'mentalCapacityConfirmed'],
  ['psychologicalAssessment', 'understandsProcedure'],
  ['psychologicalAssessment', 'understandsRisks'],
  ['psychologicalAssessment', 'voluntaryDecision'],
  ['psychologicalAssessment', 'coercionConcerns'],
  ['psychologicalAssessment', 'ambivalence'],
  ['psychologicalAssessment', 'anxietyAboutProcedure'],
  ['psychologicalAssessment', 'supportNetwork'],
  ['psychologicalAssessment', 'willingToProceed'],
  // Ethical / legal (Living-donor only)
  ['ethicalLegalRequirements', 'htaAct2004Compliant'],
  ['ethicalLegalRequirements', 'independentAssessorReview'],
  ['ethicalLegalRequirements', 'informedConsentGiven'],
  ['ethicalLegalRequirements', 'consentFormSigned'],
  ['ethicalLegalRequirements', 'informationLeafletProvided'],
  ['ethicalLegalRequirements', 'questionsAnswered'],
  ['ethicalLegalRequirements', 'financialRewardCheck'],
  ['ethicalLegalRequirements', 'ethicsCommitteeApproval'],
  // Eligibility decision (4)
  ['eligibilityAllocation', 'eligibilityDecision'],
  ['eligibilityAllocation', 'allocatedOrgans'],
  ['eligibilityAllocation', 'assessorName'],
  ['eligibilityAllocation', 'assessmentDate']
];

const LIVING_ONLY_SECTIONS = new Set([
  'psychologicalAssessment',
  'ethicalLegalRequirements'
]);

function updateProgress() {
  const isDeceased = state.donorTypeRegistration.donorType === 'deceased';
  let answered = 0;
  let total = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    if (isDeceased && LIVING_ONLY_SECTIONS.has(section)) continue;
    total++;
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    const v = state[section][field];
    if (v !== null && v !== undefined && v !== '') {
      answered++;
      sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
    }
  }
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Step list
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics',                title: 'Demographics' },
  { step: 2,  section: 'donorTypeRegistration',       title: 'Donor Type' },
  { step: 3,  section: 'medicalHistory',              title: 'Medical History' },
  { step: 4,  section: 'organFunction',               title: 'Organ Function' },
  { step: 5,  section: 'infectiousDiseaseScreening',  title: 'Infectious Disease' },
  { step: 6,  section: 'immunologicalAssessment',     title: 'Immunological' },
  { step: 7,  section: 'surgicalAssessment',          title: 'Surgical' },
  { step: 8,  section: 'psychologicalAssessment',     title: 'Psychological' },
  { step: 9,  section: 'ethicalLegalRequirements',    title: 'Ethical & Legal' },
  { step: 10, section: 'eligibilityAllocation',       title: 'Eligibility' }
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
    } else if (input.tagName === 'LABEL') {
      return;
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    eligibility,
    riskLevel,
    suggestedEligibility,
    donorType,
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
    <h2>Organ Donation Assessment Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Donor Type</h3>
    <p>${esc(donorTypeLabel(donorType))}</p>

    <h3>Eligibility &amp; Risk</h3>
    <p class="summary-badges">
      <span class="summary-badge ${eligibilityClass(eligibility)}">${esc(eligibilityLabel(eligibility))}</span>
      <span class="summary-badge ${riskLevelClass(riskLevel)}">${esc(riskLevelLabel(riskLevel))}</span>
    </p>
    ${suggestedNote}

    <h3>Fired Donor Rules</h3>
    ${firedTable}

    <h3>Flagged Issues</h3>
    ${flagsList}

    <div class="report-actions">
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
}

function submitForm() {
  const errs = validateForm();
  if (errs.length > 0) return;
  recomputeDerived();
  const grading = gradeDonor(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    eligibility: grading.eligibility,
    riskLevel: grading.riskLevel,
    suggestedEligibility: grading.suggestedEligibility,
    donorType: state.donorTypeRegistration.donorType,
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
  const rep = document.getElementById('report');
  if (rep) rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
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
