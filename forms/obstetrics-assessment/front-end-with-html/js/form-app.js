import { calculateAntenatalRisk, riskLevelClass, riskLevelLabel } from './antenatal-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { bmiCategory, calculateAge, calculateBMI, calculateEdd, emptyAssessment } from './types.js';

// Obstetrics Assessment - patient/midwife wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure NICE NG201 antenatal risk engine and renders an inline
// report. State is persisted to localStorage so a partial fill survives a
// page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'obstetrics-assessment.front-end-form-with-html.v1';

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
  slug: 'obstetrics-assessment',
  hadDraftAtLoad,
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

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs derived values (BMI, age, EDD), progress, and conditional
 * visibility after each change.
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
  state.maternalDemographics.bmi = calculateBMI(
    state.maternalDemographics.weight,
    state.maternalDemographics.height
  );
  // Auto-fill age at booking from date of birth if blank.
  const computedAge = calculateAge(state.maternalDemographics.dateOfBirth);
  if (computedAge != null && state.maternalDemographics.ageAtBooking == null) {
    state.maternalDemographics.ageAtBooking = computedAge;
  }
  // Estimate EDD from LMP if EDD is blank.
  const computedEdd = calculateEdd(state.currentPregnancy.lastMenstrualPeriod);
  if (computedEdd && !state.currentPregnancy.estimatedDueDate) {
    state.currentPregnancy.estimatedDueDate = computedEdd;
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
// Section renderers
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Maternal Demographics',
    description: 'Basic patient information.'
  });

  const namesGrid = document.createElement('div');
  namesGrid.className = 'two-col';
  namesGrid.appendChild(textInput({
    label: 'First Name', section: 'maternalDemographics',
    field: 'firstName', required: true
  }));
  namesGrid.appendChild(textInput({
    label: 'Last Name', section: 'maternalDemographics',
    field: 'lastName', required: true
  }));
  card.appendChild(namesGrid);

  const dobGrid = document.createElement('div');
  dobGrid.className = 'two-col';
  dobGrid.appendChild(textInput({
    label: 'Date of Birth', section: 'maternalDemographics',
    field: 'dateOfBirth', type: 'date', required: true
  }));
  dobGrid.appendChild(textInput({
    label: 'Age at booking (years)', section: 'maternalDemographics',
    field: 'ageAtBooking', type: 'number', min: 10, max: 60
  }));
  card.appendChild(dobGrid);

  card.appendChild(selectInput({
    label: 'Ethnicity', section: 'maternalDemographics', field: 'ethnicity',
    options: [
      { value: 'white-british', label: 'White - British' },
      { value: 'white-other', label: 'White - other' },
      { value: 'asian-indian', label: 'Asian - Indian' },
      { value: 'asian-pakistani', label: 'Asian - Pakistani' },
      { value: 'asian-bangladeshi', label: 'Asian - Bangladeshi' },
      { value: 'asian-other', label: 'Asian - other' },
      { value: 'black-african', label: 'Black - African' },
      { value: 'black-caribbean', label: 'Black - Caribbean' },
      { value: 'black-other', label: 'Black - other' },
      { value: 'mixed', label: 'Mixed / multiple' },
      { value: 'other', label: 'Other' },
      { value: 'prefer-not-to-say', label: 'Prefer not to say' }
    ]
  }));

  const measurements = document.createElement('div');
  measurements.className = 'three-col';
  measurements.appendChild(textInput({
    label: 'Weight', section: 'maternalDemographics', field: 'weight',
    type: 'number', min: 30, max: 250, step: 0.1, unit: 'kg'
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'maternalDemographics', field: 'height',
    type: 'number', min: 100, max: 220, unit: 'cm'
  }));
  measurements.appendChild(readOnlyReadout({
    label: 'BMI',
    id: 'bmi-readout',
    render: () => {
      const bmi = state.maternalDemographics.bmi;
      if (bmi == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${bmi}</strong> <span class="muted">(${esc(bmiCategory(bmi))})</span>`;
    }
  }));
  card.appendChild(measurements);

  const contextGrid = document.createElement('div');
  contextGrid.className = 'two-col';
  contextGrid.appendChild(textInput({
    label: 'Occupation', section: 'maternalDemographics', field: 'occupation'
  }));
  contextGrid.appendChild(selectInput({
    label: 'Partner / support status', section: 'maternalDemographics',
    field: 'partnerStatus',
    options: [
      { value: 'married-cohabiting', label: 'Married / cohabiting' },
      { value: 'single', label: 'Single' },
      { value: 'separated', label: 'Separated / divorced' },
      { value: 'widowed', label: 'Widowed' },
      { value: 'prefer-not-to-say', label: 'Prefer not to say' }
    ]
  }));
  card.appendChild(contextGrid);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Obstetric History',
    description: 'Previous pregnancies and outcomes.'
  });

  const counts = document.createElement('div');
  counts.className = 'three-col';
  counts.appendChild(textInput({
    label: 'Gravidity (total pregnancies)', section: 'obstetricHistory',
    field: 'gravidity', type: 'number', min: 0, max: 30
  }));
  counts.appendChild(textInput({
    label: 'Parity (births >=24 wks)', section: 'obstetricHistory',
    field: 'parity', type: 'number', min: 0, max: 30
  }));
  counts.appendChild(textInput({
    label: 'Previous miscarriages', section: 'obstetricHistory',
    field: 'previousMiscarriages', type: 'number', min: 0, max: 30
  }));
  card.appendChild(counts);

  const counts2 = document.createElement('div');
  counts2.className = 'three-col';
  counts2.appendChild(textInput({
    label: 'Previous terminations', section: 'obstetricHistory',
    field: 'previousTerminations', type: 'number', min: 0, max: 30
  }));
  counts2.appendChild(textInput({
    label: 'Previous stillbirths', section: 'obstetricHistory',
    field: 'previousStillbirths', type: 'number', min: 0, max: 30
  }));
  counts2.appendChild(textInput({
    label: 'Previous neonatal deaths', section: 'obstetricHistory',
    field: 'previousNeonatalDeaths', type: 'number', min: 0, max: 30
  }));
  card.appendChild(counts2);

  card.appendChild(radioGroup({
    label: 'Previous preterm birth (<37 weeks)?',
    section: 'obstetricHistory', field: 'previousPretermBirth', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Previous pre-eclampsia or eclampsia?',
    section: 'obstetricHistory', field: 'previousPreEclampsia', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Previous gestational diabetes (GDM)?',
    section: 'obstetricHistory', field: 'previousGestationalDiabetes', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Previous caesarean section?',
    section: 'obstetricHistory', field: 'previousCaesarean', options: yesNo
  }));
  const csDetails = document.createElement('div');
  csDetails.dataset.conditional = 'obstetricHistory.previousCaesarean=yes';
  csDetails.appendChild(textInput({
    label: 'Number of previous caesareans',
    section: 'obstetricHistory', field: 'previousCaesareanCount',
    type: 'number', min: 1, max: 10
  }));
  card.appendChild(csDetails);

  card.appendChild(radioGroup({
    label: 'Previous shoulder dystocia?',
    section: 'obstetricHistory', field: 'previousShoulderDystocia', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Previous postpartum haemorrhage (>1000 mL)?',
    section: 'obstetricHistory', field: 'previousPostpartumHaemorrhage', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Previous large baby (>=4500 g)?',
    section: 'obstetricHistory', field: 'previousLargeBaby', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Previous small baby (<2500 g)?',
    section: 'obstetricHistory', field: 'previousSmallBaby', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Previous baby with congenital anomaly?',
    section: 'obstetricHistory', field: 'previousCongenitalAnomaly', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Other obstetric notes',
    section: 'obstetricHistory', field: 'obstetricNotes',
    placeholder: 'Mode of delivery, complications, gestation at delivery, etc.',
    rows: 3
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Medical History',
    description: 'Pre-existing medical conditions affecting pregnancy.'
  });

  card.appendChild(radioGroup({ label: 'Chronic hypertension?', section: 'medicalHistory', field: 'chronicHypertension', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Cardiac disease?', section: 'medicalHistory', field: 'cardiacDisease', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Pre-existing diabetes (Type 1 or Type 2)?', section: 'medicalHistory', field: 'preExistingDiabetes', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Thyroid disease?', section: 'medicalHistory', field: 'thyroidDisease', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Renal disease?', section: 'medicalHistory', field: 'renalDisease', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Epilepsy?', section: 'medicalHistory', field: 'epilepsy', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Asthma?', section: 'medicalHistory', field: 'asthma', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Autoimmune disease (e.g. SLE, APS)?', section: 'medicalHistory', field: 'autoimmuneDisease', options: yesNo }));
  card.appendChild(radioGroup({ label: 'HIV positive?', section: 'medicalHistory', field: 'hivPositive', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Hepatitis B or C?', section: 'medicalHistory', field: 'hepatitis', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Previous venous thromboembolism (VTE)?', section: 'medicalHistory', field: 'previousVte', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Known thrombophilia?', section: 'medicalHistory', field: 'thrombophilia', options: yesNo }));
  card.appendChild(radioGroup({ label: 'History of significant mental illness?', section: 'medicalHistory', field: 'mentalHealthHistory', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Previous bariatric surgery?', section: 'medicalHistory', field: 'bariatricSurgery', options: yesNo }));

  card.appendChild(textArea({
    label: 'Other medical conditions',
    section: 'medicalHistory', field: 'otherMedicalConditions',
    placeholder: 'List any other relevant medical history.',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Current medications',
    section: 'medicalHistory', field: 'currentMedications',
    placeholder: 'Medication, dose, frequency. Include OTC and supplements.',
    rows: 3
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Current Pregnancy Details',
    description: 'Key dates and pregnancy characteristics.'
  });

  const datesGrid = document.createElement('div');
  datesGrid.className = 'two-col';
  datesGrid.appendChild(textInput({
    label: 'Last menstrual period (LMP)', section: 'currentPregnancy',
    field: 'lastMenstrualPeriod', type: 'date'
  }));
  datesGrid.appendChild(textInput({
    label: 'Estimated due date (EDD)', section: 'currentPregnancy',
    field: 'estimatedDueDate', type: 'date'
  }));
  card.appendChild(datesGrid);

  card.appendChild(textInput({
    label: 'Dating scan date', section: 'currentPregnancy',
    field: 'datingScanDate', type: 'date'
  }));

  const gestGrid = document.createElement('div');
  gestGrid.className = 'two-col';
  gestGrid.appendChild(textInput({
    label: 'Current gestation - weeks', section: 'currentPregnancy',
    field: 'gestationWeeks', type: 'number', min: 0, max: 45
  }));
  gestGrid.appendChild(textInput({
    label: 'Current gestation - days', section: 'currentPregnancy',
    field: 'gestationDays', type: 'number', min: 0, max: 6
  }));
  card.appendChild(gestGrid);

  card.appendChild(radioGroup({
    label: 'Multiple pregnancy (twins, triplets)?',
    section: 'currentPregnancy', field: 'multiplePregnancy', options: yesNo
  }));
  const chorHost = document.createElement('div');
  chorHost.dataset.conditional = 'currentPregnancy.multiplePregnancy=yes';
  chorHost.appendChild(selectInput({
    label: 'Chorionicity', section: 'currentPregnancy', field: 'chorionicity',
    options: [
      { value: 'dcda', label: 'DCDA - dichorionic diamniotic' },
      { value: 'mcda', label: 'MCDA - monochorionic diamniotic' },
      { value: 'mcma', label: 'MCMA - monochorionic monoamniotic' },
      { value: 'unknown', label: 'Unknown / pending' }
    ]
  }));
  card.appendChild(chorHost);

  card.appendChild(radioGroup({
    label: 'Conceived via IVF / assisted reproduction?',
    section: 'currentPregnancy', field: 'ivfConception', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Took folic acid pre-conception?',
    section: 'currentPregnancy', field: 'folicAcidPreconception', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Is this the first antenatal contact?',
    section: 'currentPregnancy', field: 'firstAntenatalContact', options: yesNo
  }));
  card.appendChild(textInput({
    label: 'Booking appointment date', section: 'currentPregnancy',
    field: 'bookingDate', type: 'date'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Lifestyle & Social Factors',
    description: 'Lifestyle and social-care needs that affect pregnancy outcome.'
  });

  card.appendChild(radioGroup({
    label: 'Smoking status', section: 'lifestyleSocialFactors',
    field: 'smokingStatus',
    options: [
      { value: 'never', label: 'Never smoked' },
      { value: 'ex', label: 'Ex-smoker' },
      { value: 'current', label: 'Current smoker' }
    ]
  }));
  const cigHost = document.createElement('div');
  cigHost.dataset.conditional = 'lifestyleSocialFactors.smokingStatus=current';
  cigHost.appendChild(textInput({
    label: 'Cigarettes per day', section: 'lifestyleSocialFactors',
    field: 'cigarettesPerDay', type: 'number', min: 1, max: 60
  }));
  card.appendChild(cigHost);

  card.appendChild(radioGroup({
    label: 'Alcohol use in pregnancy', section: 'lifestyleSocialFactors',
    field: 'alcoholUse',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional' },
      { value: 'regular', label: 'Regular' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Recreational substance use', section: 'lifestyleSocialFactors',
    field: 'substanceUse',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional' },
      { value: 'regular', label: 'Regular' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Domestic abuse - past or current?',
    section: 'lifestyleSocialFactors', field: 'domesticAbuse', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Safeguarding concerns (e.g. children on plan)?',
    section: 'lifestyleSocialFactors', field: 'safeguardingConcerns', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Housing insecurity?',
    section: 'lifestyleSocialFactors', field: 'housingInsecurity', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Financial difficulty?',
    section: 'lifestyleSocialFactors', field: 'financialDifficulty', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Requires interpreter?',
    section: 'lifestyleSocialFactors', field: 'requiresInterpreter', options: yesNo
  }));
  const langHost = document.createElement('div');
  langHost.dataset.conditional = 'lifestyleSocialFactors.requiresInterpreter=yes';
  langHost.appendChild(textInput({
    label: 'Language required', section: 'lifestyleSocialFactors',
    field: 'interpreterLanguage'
  }));
  card.appendChild(langHost);

  card.appendChild(radioGroup({
    label: 'Asylum seeker / refugee?',
    section: 'lifestyleSocialFactors', field: 'asylumOrRefugee', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Female genital mutilation (FGM)?',
    section: 'lifestyleSocialFactors', field: 'femaleGenitalMutilation', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Other social notes',
    section: 'lifestyleSocialFactors', field: 'socialNotes',
    placeholder: 'Any other relevant social information.',
    rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Screening Test Results',
    description: 'Combined test, anomaly scan, GTT, blood group, infection screen.'
  });

  card.appendChild(radioGroup({
    label: 'Combined test result', section: 'screeningResults',
    field: 'combinedTestResult',
    options: [
      { value: 'lower-chance', label: 'Lower chance' },
      { value: 'higher-chance', label: 'Higher chance' },
      { value: 'declined', label: 'Declined' },
      { value: 'pending', label: 'Pending' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Combined test risk (e.g. 1:200)',
    section: 'screeningResults', field: 'combinedTestRisk'
  }));

  card.appendChild(radioGroup({
    label: 'Anomaly scan completed?', section: 'screeningResults',
    field: 'anomalyScanCompleted', options: yesNo
  }));
  const anomHost = document.createElement('div');
  anomHost.dataset.conditional = 'screeningResults.anomalyScanCompleted=yes';
  anomHost.appendChild(selectInput({
    label: 'Anomaly scan findings', section: 'screeningResults',
    field: 'anomalyScanFindings',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'soft-marker', label: 'Soft marker only' },
      { value: 'abnormal', label: 'Abnormal' }
    ]
  }));
  card.appendChild(anomHost);

  card.appendChild(selectInput({
    label: 'Glucose tolerance test (GTT) result',
    section: 'screeningResults', field: 'gttResult',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'gdm-confirmed', label: 'GDM confirmed' },
      { value: 'declined', label: 'Declined' },
      { value: 'pending', label: 'Pending' },
      { value: 'not-indicated', label: 'Not indicated' }
    ]
  }));
  const gttGrid = document.createElement('div');
  gttGrid.className = 'two-col';
  gttGrid.appendChild(textInput({
    label: 'GTT fasting glucose', section: 'screeningResults',
    field: 'gttFasting', type: 'number', min: 0, max: 30, step: 0.1, unit: 'mmol/L'
  }));
  gttGrid.appendChild(textInput({
    label: 'GTT 2-hour glucose', section: 'screeningResults',
    field: 'gttTwoHour', type: 'number', min: 0, max: 30, step: 0.1, unit: 'mmol/L'
  }));
  card.appendChild(gttGrid);

  const bloodGrid = document.createElement('div');
  bloodGrid.className = 'two-col';
  bloodGrid.appendChild(selectInput({
    label: 'Blood group', section: 'screeningResults', field: 'bloodGroup',
    options: [
      { value: 'O', label: 'O' },
      { value: 'A', label: 'A' },
      { value: 'B', label: 'B' },
      { value: 'AB', label: 'AB' }
    ]
  }));
  bloodGrid.appendChild(selectInput({
    label: 'Rhesus status', section: 'screeningResults', field: 'rhesusStatus',
    options: [
      { value: 'positive', label: 'Positive' },
      { value: 'negative', label: 'Negative' }
    ]
  }));
  card.appendChild(bloodGrid);

  card.appendChild(radioGroup({
    label: 'Red-cell antibody screen positive?',
    section: 'screeningResults', field: 'antibodyScreenPositive', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Infection screen abnormal (HIV/Hep B/syphilis)?',
    section: 'screeningResults', field: 'infectionScreenAbnormal', options: yesNo
  }));
  const infHost = document.createElement('div');
  infHost.dataset.conditional = 'screeningResults.infectionScreenAbnormal=yes';
  infHost.appendChild(textInput({
    label: 'Infection screen details',
    section: 'screeningResults', field: 'infectionScreenDetails'
  }));
  card.appendChild(infHost);

  card.appendChild(textInput({
    label: 'Haemoglobin (g/L)', section: 'screeningResults', field: 'haemoglobin'
  }));

  card.appendChild(textArea({
    label: 'Other screening notes', section: 'screeningResults',
    field: 'screeningNotes',
    placeholder: 'Other screening or diagnostic information.',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Mental Health Assessment',
    description: 'NICE-recommended Whooley (depression) and GAD-2 (anxiety) screens.'
  });

  card.appendChild(radioGroup({
    label: 'Whooley 1: During the past month, have you often been bothered by feeling down, depressed or hopeless?',
    section: 'mentalHealthAssessment', field: 'whooley1', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Whooley 2: During the past month, have you often been bothered by having little interest or pleasure in doing things?',
    section: 'mentalHealthAssessment', field: 'whooley2', options: yesNo
  }));

  const gadOptions = [
    { value: 'not-at-all', label: 'Not at all (0)' },
    { value: 'several-days', label: 'Several days (1)' },
    { value: 'more-than-half', label: 'More than half the days (2)' },
    { value: 'nearly-every-day', label: 'Nearly every day (3)' }
  ];
  card.appendChild(radioGroup({
    label: 'GAD-2 Q1: Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious or on edge?',
    section: 'mentalHealthAssessment', field: 'gad2Q1', options: gadOptions
  }));
  card.appendChild(radioGroup({
    label: 'GAD-2 Q2: Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?',
    section: 'mentalHealthAssessment', field: 'gad2Q2', options: gadOptions
  }));

  card.appendChild(radioGroup({
    label: 'Previous postnatal depression?',
    section: 'mentalHealthAssessment', field: 'previousPostnatalDepression', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Previous severe mental illness (bipolar, psychosis, schizophrenia)?',
    section: 'mentalHealthAssessment', field: 'previousSevereMentalIllness', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Currently on psychotropic medication?',
    section: 'mentalHealthAssessment', field: 'currentlyOnPsychotropicMeds', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Any thoughts of self-harm or suicide?',
    section: 'mentalHealthAssessment', field: 'selfHarmIdeation', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Mental health notes', section: 'mentalHealthAssessment',
    field: 'mentalHealthNotes',
    placeholder: 'Add any context about mental-health needs and supports.',
    rows: 3
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Fetal Assessment',
    description: 'Growth, lie, presentation, movements, and auscultation.'
  });

  card.appendChild(textInput({
    label: 'Symphysis-fundal height', section: 'fetalAssessment',
    field: 'fundalHeight', type: 'number', min: 10, max: 50, unit: 'cm'
  }));

  const lieGrid = document.createElement('div');
  lieGrid.className = 'two-col';
  lieGrid.appendChild(selectInput({
    label: 'Fetal lie', section: 'fetalAssessment', field: 'fetalLie',
    options: [
      { value: 'longitudinal', label: 'Longitudinal' },
      { value: 'transverse', label: 'Transverse' },
      { value: 'oblique', label: 'Oblique' },
      { value: 'unstable', label: 'Unstable' }
    ]
  }));
  lieGrid.appendChild(selectInput({
    label: 'Presentation', section: 'fetalAssessment', field: 'fetalPresentation',
    options: [
      { value: 'cephalic', label: 'Cephalic' },
      { value: 'breech', label: 'Breech' },
      { value: 'shoulder', label: 'Shoulder' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  card.appendChild(lieGrid);

  card.appendChild(radioGroup({
    label: 'Engaged?', section: 'fetalAssessment', field: 'engaged', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Fetal movements as reported by patient',
    section: 'fetalAssessment', field: 'fetalMovementsReported',
    options: [
      { value: 'normal', label: 'Normal pattern' },
      { value: 'increased', label: 'Increased' },
      { value: 'reduced', label: 'Reduced' },
      { value: 'absent', label: 'Absent' },
      { value: 'not-yet-felt', label: 'Not yet felt (early gestation)' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Fetal heart rate', section: 'fetalAssessment',
    field: 'fetalHeartRate', type: 'number', min: 80, max: 200, unit: 'bpm'
  }));

  card.appendChild(radioGroup({
    label: 'Reduced fetal movements (clinically)?',
    section: 'fetalAssessment', field: 'reducedFetalMovements', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Growth concern (SGA / LGA / IUGR)?',
    section: 'fetalAssessment', field: 'growthConcern', options: yesNo
  }));
  const growthHost = document.createElement('div');
  growthHost.dataset.conditional = 'fetalAssessment.growthConcern=yes';
  growthHost.appendChild(textInput({
    label: 'Growth concern details', section: 'fetalAssessment',
    field: 'growthConcernDetails'
  }));
  card.appendChild(growthHost);

  card.appendChild(textArea({
    label: 'Other fetal notes', section: 'fetalAssessment',
    field: 'fetalNotes',
    placeholder: 'Any other observations about the fetus.',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Birth Preferences',
    description: 'Patient-led preferences for place, pain relief, and feeding.'
  });

  card.appendChild(selectInput({
    label: 'Preferred place of birth', section: 'birthPreferences',
    field: 'preferredBirthSetting',
    options: [
      { value: 'home', label: 'Home birth' },
      { value: 'midwife-led-unit', label: 'Midwife-led unit' },
      { value: 'obstetric-unit', label: 'Obstetric unit (hospital)' },
      { value: 'undecided', label: 'Undecided' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Preferred analgesia', section: 'birthPreferences',
    field: 'preferredAnalgesia',
    options: [
      { value: 'none', label: 'None / hypnobirthing' },
      { value: 'gas-air', label: 'Entonox (gas and air)' },
      { value: 'pethidine', label: 'Opioids (pethidine / diamorphine)' },
      { value: 'epidural', label: 'Epidural' },
      { value: 'undecided', label: 'Undecided' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Birth partner planned?', section: 'birthPreferences',
    field: 'birthPartnerPlanned', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Written birth plan completed?', section: 'birthPreferences',
    field: 'birthPlanCompleted', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Plans to breastfeed?', section: 'birthPreferences',
    field: 'feedingChoiceBreast', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Plans to formula feed?', section: 'birthPreferences',
    field: 'feedingChoiceFormula', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'VBAC (vaginal birth after caesarean) requested?',
    section: 'birthPreferences', field: 'vbacRequested', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Other birth preferences', section: 'birthPreferences',
    field: 'birthPreferenceNotes',
    placeholder: 'Other preferences (lighting, music, water birth, religious or cultural needs, etc.)',
    rows: 3
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Care Plan & Follow-up',
    description: 'Recommended pathway and onward referrals.'
  });

  card.appendChild(selectInput({
    label: 'Recommended care pathway', section: 'carePlanFollowup',
    field: 'recommendedCarePathway',
    options: [
      { value: 'midwifery-led', label: 'Midwifery-led' },
      { value: 'shared-care', label: 'Shared (midwife + obstetric review)' },
      { value: 'consultant-led', label: 'Consultant-led' },
      { value: 'multidisciplinary', label: 'Multidisciplinary (specialist clinic)' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Consultant obstetrician referral required?',
    section: 'carePlanFollowup', field: 'consultantReferralRequired', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Perinatal mental-health referral required?',
    section: 'carePlanFollowup', field: 'mentalHealthReferralRequired', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Safeguarding referral required?',
    section: 'carePlanFollowup', field: 'safeguardingReferralRequired', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Aspirin prophylaxis indicated (pre-eclampsia prevention)?',
    section: 'carePlanFollowup', field: 'aspirinProphylaxisIndicated', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'VTE prophylaxis indicated (LMWH)?',
    section: 'carePlanFollowup', field: 'vteProphylaxisIndicated', options: yesNo
  }));

  card.appendChild(textInput({
    label: 'Next appointment date', section: 'carePlanFollowup',
    field: 'nextAppointmentDate', type: 'date'
  }));

  card.appendChild(textArea({
    label: 'Care plan notes', section: 'carePlanFollowup',
    field: 'carePlanNotes',
    placeholder: 'Detailed care plan, scheduled scans, decision-making, etc.',
    rows: 4
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
    const v = state.maternalDemographics.bmi;
    bmi.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}</strong> <span class="muted">(${esc(bmiCategory(v))})</span>`;
  }
  // Also reflect derived fields back into their inputs (age, EDD).
  const ageInput = document.getElementById('maternalDemographics-ageAtBooking');
  if (ageInput && document.activeElement !== ageInput) {
    const v = state.maternalDemographics.ageAtBooking;
    ageInput.value = v == null ? '' : String(v);
  }
  const eddInput = document.getElementById('currentPregnancy-estimatedDueDate');
  if (eddInput && document.activeElement !== eddInput) {
    eddInput.value = state.currentPregnancy.estimatedDueDate || '';
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics
  ['maternalDemographics', 'firstName'],
  ['maternalDemographics', 'lastName'],
  ['maternalDemographics', 'dateOfBirth'],
  ['maternalDemographics', 'ageAtBooking'],
  ['maternalDemographics', 'ethnicity'],
  ['maternalDemographics', 'weight'],
  ['maternalDemographics', 'height'],
  // Obstetric history
  ['obstetricHistory', 'gravidity'],
  ['obstetricHistory', 'parity'],
  ['obstetricHistory', 'previousMiscarriages'],
  ['obstetricHistory', 'previousStillbirths'],
  ['obstetricHistory', 'previousNeonatalDeaths'],
  ['obstetricHistory', 'previousPretermBirth'],
  ['obstetricHistory', 'previousPreEclampsia'],
  ['obstetricHistory', 'previousGestationalDiabetes'],
  ['obstetricHistory', 'previousCaesarean'],
  ['obstetricHistory', 'previousShoulderDystocia'],
  ['obstetricHistory', 'previousPostpartumHaemorrhage'],
  ['obstetricHistory', 'previousLargeBaby'],
  ['obstetricHistory', 'previousSmallBaby'],
  ['obstetricHistory', 'previousCongenitalAnomaly'],
  // Medical history
  ['medicalHistory', 'chronicHypertension'],
  ['medicalHistory', 'cardiacDisease'],
  ['medicalHistory', 'preExistingDiabetes'],
  ['medicalHistory', 'thyroidDisease'],
  ['medicalHistory', 'renalDisease'],
  ['medicalHistory', 'epilepsy'],
  ['medicalHistory', 'asthma'],
  ['medicalHistory', 'autoimmuneDisease'],
  ['medicalHistory', 'hivPositive'],
  ['medicalHistory', 'hepatitis'],
  ['medicalHistory', 'previousVte'],
  ['medicalHistory', 'thrombophilia'],
  ['medicalHistory', 'mentalHealthHistory'],
  ['medicalHistory', 'bariatricSurgery'],
  // Current pregnancy
  ['currentPregnancy', 'lastMenstrualPeriod'],
  ['currentPregnancy', 'estimatedDueDate'],
  ['currentPregnancy', 'gestationWeeks'],
  ['currentPregnancy', 'multiplePregnancy'],
  ['currentPregnancy', 'ivfConception'],
  ['currentPregnancy', 'folicAcidPreconception'],
  // Lifestyle / social
  ['lifestyleSocialFactors', 'smokingStatus'],
  ['lifestyleSocialFactors', 'alcoholUse'],
  ['lifestyleSocialFactors', 'substanceUse'],
  ['lifestyleSocialFactors', 'domesticAbuse'],
  ['lifestyleSocialFactors', 'safeguardingConcerns'],
  ['lifestyleSocialFactors', 'housingInsecurity'],
  ['lifestyleSocialFactors', 'requiresInterpreter'],
  ['lifestyleSocialFactors', 'asylumOrRefugee'],
  ['lifestyleSocialFactors', 'femaleGenitalMutilation'],
  // Screening
  ['screeningResults', 'combinedTestResult'],
  ['screeningResults', 'anomalyScanCompleted'],
  ['screeningResults', 'gttResult'],
  ['screeningResults', 'bloodGroup'],
  ['screeningResults', 'rhesusStatus'],
  ['screeningResults', 'antibodyScreenPositive'],
  ['screeningResults', 'infectionScreenAbnormal'],
  // Mental health
  ['mentalHealthAssessment', 'whooley1'],
  ['mentalHealthAssessment', 'whooley2'],
  ['mentalHealthAssessment', 'gad2Q1'],
  ['mentalHealthAssessment', 'gad2Q2'],
  ['mentalHealthAssessment', 'previousPostnatalDepression'],
  ['mentalHealthAssessment', 'previousSevereMentalIllness'],
  ['mentalHealthAssessment', 'selfHarmIdeation'],
  // Fetal
  ['fetalAssessment', 'fetalLie'],
  ['fetalAssessment', 'fetalPresentation'],
  ['fetalAssessment', 'fetalMovementsReported'],
  ['fetalAssessment', 'reducedFetalMovements'],
  ['fetalAssessment', 'growthConcern'],
  // Birth preferences
  ['birthPreferences', 'preferredBirthSetting'],
  ['birthPreferences', 'preferredAnalgesia'],
  ['birthPreferences', 'birthPartnerPlanned'],
  ['birthPreferences', 'feedingChoiceBreast'],
  // Care plan
  ['carePlanFollowup', 'recommendedCarePathway'],
  ['carePlanFollowup', 'consultantReferralRequired'],
  ['carePlanFollowup', 'mentalHealthReferralRequired'],
  ['carePlanFollowup', 'safeguardingReferralRequired'],
  ['carePlanFollowup', 'aspirinProphylaxisIndicated'],
  ['carePlanFollowup', 'vteProphylaxisIndicated']
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
  { step: 1,  section: 'maternalDemographics',   title: 'Demographics' },
  { step: 2,  section: 'obstetricHistory',       title: 'Obstetric History' },
  { step: 3,  section: 'medicalHistory',         title: 'Medical History' },
  { step: 4,  section: 'currentPregnancy',       title: 'Current Pregnancy' },
  { step: 5,  section: 'lifestyleSocialFactors', title: 'Lifestyle & Social' },
  { step: 6,  section: 'screeningResults',       title: 'Screening' },
  { step: 7,  section: 'mentalHealthAssessment', title: 'Mental Health' },
  { step: 8,  section: 'fetalAssessment',        title: 'Fetal' },
  { step: 9,  section: 'birthPreferences',       title: 'Birth Preferences' },
  { step: 10, section: 'carePlanFollowup',       title: 'Care Plan' }
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
    case 'urgent': return 'flag-urgent';
    case 'high': return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

function riskBadgeClassForRule(level) {
  switch (level) {
    case 'high': return 'risk-pill risk-pill-high';
    case 'moderate': return 'risk-pill risk-pill-moderate';
    case 'low': return 'risk-pill risk-pill-low';
    default: return 'risk-pill';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { riskLevel, answeredCount, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td><span class="${riskBadgeClassForRule(r.risk)}">${esc(r.risk.toUpperCase())}</span></td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No NG201 risk factors detected — provisionally low risk.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Risk factor</th>
            <th scope="col">Risk</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <h2>Antenatal Risk Assessment Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>NICE NG201 Risk Stratification</h3>
    <p class="risk-summary">
      <span class="risk-badge ${riskLevelClass(riskLevel)}">${esc(riskLevel.toUpperCase())}</span>
      <span class="risk-level-label">${esc(riskLevelLabel(riskLevel))}</span>
    </p>
    <p class="muted">Based on ${answeredCount} answered fields and ${firedRules.length} fired rule${firedRules.length === 1 ? '' : 's'}.</p>

    <h3>Risk factors detected</h3>
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
  const { riskLevel, answeredCount, firedRules } = calculateAntenatalRisk(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    riskLevel,
    answeredCount,
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
