import { detectAdditionalFlags } from './flagged-issues.js';
import { gradePPE } from './ppe-grader.js';
import { bmiCategory, calculateBMI, clearanceClass, clearanceLabel, emptyAssessment, gradeClass, gradeLabel } from './types.js';

// Sports Medicine Assessment - patient/clinician wizard (vanilla JS, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure PPE clearance engine and renders an inline report. State
// is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'sports-medicine-assessment.front-end-form-with-html.v1';
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
  slug: 'sports-medicine-assessment',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const report = document.getElementById('report');
    if (report) {
      report.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
    }
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
  state.demographics.bmi = calculateBMI(
    state.demographics.weight,
    state.demographics.height
  );
  state.menstrualHistoryREDS.applicable = state.demographics.sex === 'female';
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
  wrapper.innerHTML =
    `<label class="label" for="${id}">${labelText}</label>` +
    `<input ${attrs.join(' ')}>` +
    (opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : '') +
    `<span class="error-message" id="${id}-error" aria-live="polite"></span>`;

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
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML =
    `<label class="label" for="${id}">${labelText}</label>` +
    `<textarea id="${id}" name="${id}" rows="${opts.rows || 3}"` +
    (opts.placeholder ? ` placeholder="${esc(opts.placeholder)}"` : '') +
    ` aria-describedby="${id}-error"${requiredAttr}` +
    ` class="text-area-input">${esc(value)}</textarea>` +
    `<span class="error-message" id="${id}-error" aria-live="polite"></span>`;
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
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML =
    `<label class="label" for="${id}">${labelText}</label>` +
    `<select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${requiredAttr}>${optionsHtml}</select>` +
    `<span class="error-message" id="${id}-error" aria-live="polite"></span>`;
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
    const requiredAttr = opts.required ? ' data-required' : '';
    label.innerHTML =
      `<input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}${requiredAttr}>` +
      `<span>${esc(option.label)}</span>`;
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
    `<span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Section renderers (1 per PPE step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const yesNoUnknown = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Athlete identification and emergency contact.'
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
    label: 'Sex (assigned at birth)',
    section: 'demographics',
    field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
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

  const contact = document.createElement('div');
  contact.className = 'two-col';
  contact.appendChild(textInput({
    label: 'Emergency contact name',
    section: 'demographics', field: 'emergencyContactName'
  }));
  contact.appendChild(textInput({
    label: 'Emergency contact phone',
    section: 'demographics', field: 'emergencyContactPhone',
    type: 'tel'
  }));
  card.appendChild(contact);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Sport & Position Details',
    description: 'Primary sport, position, and contact level.'
  });

  card.appendChild(textInput({
    label: 'Primary sport',
    section: 'sportPositionDetails', field: 'primarySport',
    placeholder: 'e.g. soccer, basketball, rugby'
  }));
  card.appendChild(textInput({
    label: 'Primary position',
    section: 'sportPositionDetails', field: 'primaryPosition',
    placeholder: 'e.g. midfielder, point guard'
  }));

  card.appendChild(radioGroup({
    label: 'Contact level of primary sport',
    section: 'sportPositionDetails', field: 'contactLevel',
    options: [
      { value: 'low', label: 'Low (e.g. archery, golf, swimming)' },
      { value: 'moderate', label: 'Moderate (e.g. baseball, soccer, basketball)' },
      { value: 'high', label: 'High (e.g. football, rugby, ice hockey, MMA)' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Other / secondary sports',
    section: 'sportPositionDetails', field: 'secondarySports',
    placeholder: 'Comma-separated list'
  }));

  card.appendChild(selectInput({
    label: 'Competitive level',
    section: 'sportPositionDetails', field: 'competitiveLevel',
    options: [
      { value: 'recreational', label: 'Recreational' },
      { value: 'school', label: 'School / scholastic' },
      { value: 'club', label: 'Club / amateur' },
      { value: 'collegiate', label: 'Collegiate' },
      { value: 'elite', label: 'Elite / professional' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Training & competition hours per week',
    section: 'sportPositionDetails', field: 'hoursPerWeek',
    type: 'number', min: 0, max: 80, unit: 'h/wk'
  }));

  card.appendChild(radioGroup({
    label: 'Have you ever been refused or restricted from sport?',
    section: 'sportPositionDetails', field: 'previousClearanceIssue',
    options: yesNo
  }));
  const prevDetails = document.createElement('div');
  prevDetails.dataset.conditional = 'sportPositionDetails.previousClearanceIssue=yes';
  prevDetails.appendChild(textArea({
    label: 'Details',
    section: 'sportPositionDetails', field: 'previousClearanceDetails',
    rows: 2
  }));
  card.appendChild(prevDetails);

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Medical History',
    description: 'Chronic illness, medications, allergies, prior surgery.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have any chronic illnesses?',
    section: 'medicalHistory', field: 'chronicIllness', options: yesNo
  }));
  const chronic = document.createElement('div');
  chronic.dataset.conditional = 'medicalHistory.chronicIllness=yes';
  chronic.appendChild(textArea({
    label: 'Details',
    section: 'medicalHistory', field: 'chronicIllnessDetails', rows: 2
  }));
  card.appendChild(chronic);

  card.appendChild(radioGroup({
    label: 'Are you currently taking any medications?',
    section: 'medicalHistory', field: 'currentMedications', options: yesNo
  }));
  const meds = document.createElement('div');
  meds.dataset.conditional = 'medicalHistory.currentMedications=yes';
  meds.appendChild(textArea({
    label: 'Medication list (name, dose, frequency)',
    section: 'medicalHistory', field: 'currentMedicationDetails', rows: 3
  }));
  card.appendChild(meds);

  card.appendChild(radioGroup({
    label: 'Do you have any known allergies?',
    section: 'medicalHistory', field: 'allergiesKnown', options: yesNo
  }));
  const alg = document.createElement('div');
  alg.dataset.conditional = 'medicalHistory.allergiesKnown=yes';
  alg.appendChild(textArea({
    label: 'Allergens and reactions',
    section: 'medicalHistory', field: 'allergyDetails', rows: 2
  }));
  card.appendChild(alg);

  card.appendChild(radioGroup({
    label: 'Have you had any prior surgery?',
    section: 'medicalHistory', field: 'priorSurgery', options: yesNo
  }));
  const surg = document.createElement('div');
  surg.dataset.conditional = 'medicalHistory.priorSurgery=yes';
  surg.appendChild(textArea({
    label: 'Procedure(s) and approximate dates',
    section: 'medicalHistory', field: 'priorSurgeryDetails', rows: 2
  }));
  card.appendChild(surg);

  card.appendChild(radioGroup({
    label: 'Have you been hospitalised in the last 12 months?',
    section: 'medicalHistory', field: 'hospitalisedLastYear', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have asthma or exercise-induced bronchospasm?',
    section: 'medicalHistory', field: 'asthmaOrExerciseInducedBronchospasm', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have diabetes?',
    section: 'medicalHistory', field: 'diabetes', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Sickle cell trait or disease?',
    section: 'medicalHistory', field: 'sickleCellTraitOrDisease', options: yesNoUnknown
  }));
  card.appendChild(radioGroup({
    label: 'Have you ever had a serious heat illness (heat stroke / heat exhaustion)?',
    section: 'medicalHistory', field: 'heatIllnessHistory', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'History of an eating disorder or disordered eating?',
    section: 'medicalHistory', field: 'eatingDisorderHistory', options: yesNo
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Family History',
    description: 'First-degree relatives. Mark "Unknown" if uncertain.'
  });

  card.appendChild(radioGroup({
    label: 'Sudden cardiac death of a relative under age 50?',
    section: 'familyHistory', field: 'suddenCardiacDeathUnder50', options: yesNoUnknown
  }));
  const rel = document.createElement('div');
  rel.dataset.conditional = 'familyHistory.suddenCardiacDeathUnder50=yes';
  rel.appendChild(textInput({
    label: 'Relation (e.g. father, sister)',
    section: 'familyHistory', field: 'suddenCardiacDeathRelation'
  }));
  card.appendChild(rel);

  card.appendChild(radioGroup({
    label: 'Hypertrophic cardiomyopathy (HCM) in family?',
    section: 'familyHistory', field: 'hypertrophicCardiomyopathy', options: yesNoUnknown
  }));
  card.appendChild(radioGroup({
    label: 'Marfan syndrome in family?',
    section: 'familyHistory', field: 'marfanSyndrome', options: yesNoUnknown
  }));
  card.appendChild(radioGroup({
    label: 'Long-QT syndrome in family?',
    section: 'familyHistory', field: 'longQTSyndrome', options: yesNoUnknown
  }));
  card.appendChild(radioGroup({
    label: 'Family history of arrhythmia or pacemaker?',
    section: 'familyHistory', field: 'arrhythmiaOrPacemaker', options: yesNoUnknown
  }));
  card.appendChild(radioGroup({
    label: 'Unexplained seizure or fainting in a relative?',
    section: 'familyHistory', field: 'unexplainedSeizureOrFainting', options: yesNoUnknown
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Menstrual History / RED-S Screening',
    description: 'Asked of female athletes. Used to detect Relative Energy Deficiency in Sport (RED-S).'
  });
  card.dataset.conditional = 'demographics.sex=female';

  card.appendChild(textInput({
    label: 'Age at menarche',
    section: 'menstrualHistoryREDS', field: 'ageAtMenarche',
    type: 'number', min: 8, max: 20, unit: 'years'
  }));

  card.appendChild(radioGroup({
    label: 'Are your periods regular?',
    section: 'menstrualHistoryREDS', field: 'regularPeriods', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have you had no period for ≥ 6 months (excluding pregnancy)?',
    section: 'menstrualHistoryREDS', field: 'amenorrhoeaSixMonths', options: yesNo
  }));

  const followUp = document.createElement('div');
  followUp.dataset.conditional = 'menstrualHistoryREDS.amenorrhoeaSixMonths=yes';
  followUp.appendChild(textInput({
    label: 'Number of menstrual cycles in the last 12 months',
    section: 'menstrualHistoryREDS', field: 'cyclesLast12Months',
    type: 'number', min: 0, max: 13
  }));
  card.appendChild(followUp);

  card.appendChild(radioGroup({
    label: 'Restrictive eating pattern, dieting, or food rules?',
    section: 'menstrualHistoryREDS', field: 'restrictiveEatingPattern', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'History of stress fracture(s)?',
    section: 'menstrualHistoryREDS', field: 'stressFractureHistory', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Concerns about low energy availability or under-fuelling?',
    section: 'menstrualHistoryREDS', field: 'lowEnergyAvailabilityConcern', options: yesNo
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Cardiovascular Screening',
    description: 'AHA 14-element history plus measured vitals.'
  });

  card.appendChild(radioGroup({
    label: 'Chest pain or discomfort with exertion?',
    section: 'cardiovascularScreening', field: 'chestPainWithExertion', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Unexplained syncope or near-syncope (especially during exercise)?',
    section: 'cardiovascularScreening', field: 'unexplainedSyncope', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Excessive or unexplained breathlessness with exertion?',
    section: 'cardiovascularScreening', field: 'excessiveBreathlessness', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Palpitations or irregular heartbeat?',
    section: 'cardiovascularScreening', field: 'palpitationsOrIrregularBeat', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Diagnosed with high blood pressure?',
    section: 'cardiovascularScreening', field: 'highBloodPressureDiagnosis', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Has a doctor ever heard a heart murmur?',
    section: 'cardiovascularScreening', field: 'heartMurmurDetected', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Ever been told to restrict activity for cardiac reasons?',
    section: 'cardiovascularScreening', field: 'restrictedActivityForHeart', options: yesNo
  }));

  const vitals = document.createElement('div');
  vitals.className = 'three-col';
  vitals.appendChild(textInput({
    label: 'Resting systolic BP',
    section: 'cardiovascularScreening', field: 'restingSystolic',
    type: 'number', min: 60, max: 250, unit: 'mmHg'
  }));
  vitals.appendChild(textInput({
    label: 'Resting diastolic BP',
    section: 'cardiovascularScreening', field: 'restingDiastolic',
    type: 'number', min: 30, max: 150, unit: 'mmHg'
  }));
  vitals.appendChild(textInput({
    label: 'Resting heart rate',
    section: 'cardiovascularScreening', field: 'restingHeartRate',
    type: 'number', min: 30, max: 220, unit: 'bpm'
  }));
  card.appendChild(vitals);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Musculoskeletal Screening',
    description: 'Injury history, joint stability, and functional examination.'
  });

  card.appendChild(radioGroup({
    label: 'Any uncorrected major injury (e.g. ACL tear, unrepaired fracture)?',
    section: 'musculoskeletalScreening', field: 'uncorrectedMajorInjury', options: yesNo
  }));
  const injDet = document.createElement('div');
  injDet.dataset.conditional = 'musculoskeletalScreening.uncorrectedMajorInjury=yes';
  injDet.appendChild(textArea({
    label: 'Injury details',
    section: 'musculoskeletalScreening', field: 'majorInjuryDetails', rows: 2
  }));
  card.appendChild(injDet);

  card.appendChild(radioGroup({
    label: 'Joint instability (giving way, dislocation, recurrent sprain)?',
    section: 'musculoskeletalScreening', field: 'jointInstability', options: yesNo
  }));
  const jiDet = document.createElement('div');
  jiDet.dataset.conditional = 'musculoskeletalScreening.jointInstability=yes';
  jiDet.appendChild(textArea({
    label: 'Joint(s) and details',
    section: 'musculoskeletalScreening', field: 'jointInstabilityDetails', rows: 2
  }));
  card.appendChild(jiDet);

  card.appendChild(radioGroup({
    label: 'Ongoing pain or swelling in any joint?',
    section: 'musculoskeletalScreening', field: 'ongoingPainOrSwelling', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Chronic joint disease (e.g. juvenile arthritis)?',
    section: 'musculoskeletalScreening', field: 'chronicJointDisease', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Currently using a brace or assistive device?',
    section: 'musculoskeletalScreening', field: 'useBraceOrAssistiveDevice', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Full pain-free range of motion in all joints?',
    section: 'musculoskeletalScreening', field: 'fullRangeOfMotion', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Normal symmetrical strength bilaterally?',
    section: 'musculoskeletalScreening', field: 'normalStrengthBilateral', options: yesNo
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Neurological & Concussion Baseline',
    description: 'Concussion history and neurological screening.'
  });

  card.appendChild(textInput({
    label: 'Total lifetime concussions',
    section: 'neurologicalConcussionBaseline', field: 'totalConcussions',
    type: 'number', min: 0, max: 50
  }));
  card.appendChild(radioGroup({
    label: 'Any concussion in the last 6 months?',
    section: 'neurologicalConcussionBaseline', field: 'concussionLastSixMonths', options: yesNo
  }));
  const recent = document.createElement('div');
  recent.dataset.conditional = 'neurologicalConcussionBaseline.concussionLastSixMonths=yes';
  recent.appendChild(textInput({
    label: 'Date of most recent concussion',
    section: 'neurologicalConcussionBaseline', field: 'mostRecentConcussionDate',
    type: 'date'
  }));
  card.appendChild(recent);

  card.appendChild(radioGroup({
    label: 'Ongoing post-concussive symptoms (headache, dizziness, fog)?',
    section: 'neurologicalConcussionBaseline', field: 'ongoingPostConcussiveSymptoms', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'History of seizures?',
    section: 'neurologicalConcussionBaseline', field: 'historyOfSeizures', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'History of a stinger / burner (cervical nerve injury)?',
    section: 'neurologicalConcussionBaseline', field: 'stinger', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'History of head or neck surgery?',
    section: 'neurologicalConcussionBaseline', field: 'historyOfHeadOrNeckSurgery', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Baseline headaches or migraine?',
    section: 'neurologicalConcussionBaseline', field: 'baselineHeadachesOrMigraine', options: yesNo
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Vision & Skin',
    description: 'Vision status and dermatological screening for contact-sport eligibility.'
  });

  card.appendChild(radioGroup({
    label: 'Do you wear corrective lenses (glasses or contacts)?',
    section: 'visionSkin', field: 'correctiveLensesWorn', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Are you a monocular athlete (vision in only one eye)?',
    section: 'visionSkin', field: 'monocularAthlete', options: yesNo
  }));
  const eyewear = document.createElement('div');
  eyewear.dataset.conditional = 'visionSkin.monocularAthlete=yes';
  eyewear.appendChild(radioGroup({
    label: 'Is ASTM-rated protective eyewear worn during sport?',
    section: 'visionSkin', field: 'protectiveEyewearAvailable', options: yesNo
  }));
  card.appendChild(eyewear);

  card.appendChild(radioGroup({
    label: 'Any active skin infection?',
    section: 'visionSkin', field: 'activeSkinInfection', options: yesNo
  }));
  const skinDet = document.createElement('div');
  skinDet.dataset.conditional = 'visionSkin.activeSkinInfection=yes';
  skinDet.appendChild(textArea({
    label: 'Skin infection details (location, duration)',
    section: 'visionSkin', field: 'activeSkinInfectionDetails', rows: 2
  }));
  card.appendChild(skinDet);

  card.appendChild(radioGroup({
    label: 'Active herpes gladiatorum lesions?',
    section: 'visionSkin', field: 'herpesGladiatorum', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Active impetigo or MRSA lesion?',
    section: 'visionSkin', field: 'impetigoOrMRSA', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Open wounds or weeping lesions?',
    section: 'visionSkin', field: 'openWoundsOrLesions', options: yesNo
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Clearance Decision',
    description: 'Clinician summary. The PPE engine will compute a recommended decision when you submit; record your final decision here.'
  });

  card.appendChild(radioGroup({
    label: 'Preferred clearance decision',
    section: 'clearanceDecision', field: 'preferredClearance',
    options: [
      { value: 'cleared', label: 'Cleared' },
      { value: 'conditional', label: 'Cleared with Conditions' },
      { value: 'pending', label: 'Not Cleared Pending Further Evaluation' },
      { value: 'not-cleared', label: 'Not Cleared for Sport' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Clearance conditions / restrictions',
    section: 'clearanceDecision', field: 'clearanceConditions',
    placeholder: 'e.g. wear protective eyewear, monitored heat acclimatisation…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Follow-up required',
    section: 'clearanceDecision', field: 'followUpRequired',
    placeholder: 'e.g. cardiology consult, ECG, physiotherapy review…',
    rows: 3
  }));

  const sig = document.createElement('div');
  sig.className = 'two-col';
  sig.appendChild(textInput({
    label: 'Clinician name', section: 'clearanceDecision', field: 'clinicianName'
  }));
  sig.appendChild(textInput({
    label: 'Signature date', section: 'clearanceDecision',
    field: 'clinicianSignatureDate', type: 'date'
  }));
  card.appendChild(sig);

  card.appendChild(textArea({
    label: 'Additional notes',
    section: 'clearanceDecision', field: 'additionalNotes',
    rows: 3
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
  // 1 Demographics
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'weight'],
  ['demographics', 'height'],
  ['demographics', 'emergencyContactName'],
  ['demographics', 'emergencyContactPhone'],
  // 2 Sport & position
  ['sportPositionDetails', 'primarySport'],
  ['sportPositionDetails', 'contactLevel'],
  ['sportPositionDetails', 'competitiveLevel'],
  ['sportPositionDetails', 'hoursPerWeek'],
  ['sportPositionDetails', 'previousClearanceIssue'],
  // 3 Medical history
  ['medicalHistory', 'chronicIllness'],
  ['medicalHistory', 'currentMedications'],
  ['medicalHistory', 'allergiesKnown'],
  ['medicalHistory', 'priorSurgery'],
  ['medicalHistory', 'hospitalisedLastYear'],
  ['medicalHistory', 'asthmaOrExerciseInducedBronchospasm'],
  ['medicalHistory', 'diabetes'],
  ['medicalHistory', 'sickleCellTraitOrDisease'],
  ['medicalHistory', 'heatIllnessHistory'],
  ['medicalHistory', 'eatingDisorderHistory'],
  // 4 Family history
  ['familyHistory', 'suddenCardiacDeathUnder50'],
  ['familyHistory', 'hypertrophicCardiomyopathy'],
  ['familyHistory', 'marfanSyndrome'],
  ['familyHistory', 'longQTSyndrome'],
  ['familyHistory', 'arrhythmiaOrPacemaker'],
  ['familyHistory', 'unexplainedSeizureOrFainting'],
  // 6 Cardiovascular (always tracked)
  ['cardiovascularScreening', 'chestPainWithExertion'],
  ['cardiovascularScreening', 'unexplainedSyncope'],
  ['cardiovascularScreening', 'excessiveBreathlessness'],
  ['cardiovascularScreening', 'palpitationsOrIrregularBeat'],
  ['cardiovascularScreening', 'highBloodPressureDiagnosis'],
  ['cardiovascularScreening', 'heartMurmurDetected'],
  ['cardiovascularScreening', 'restrictedActivityForHeart'],
  // 7 MSK
  ['musculoskeletalScreening', 'uncorrectedMajorInjury'],
  ['musculoskeletalScreening', 'jointInstability'],
  ['musculoskeletalScreening', 'ongoingPainOrSwelling'],
  ['musculoskeletalScreening', 'chronicJointDisease'],
  ['musculoskeletalScreening', 'fullRangeOfMotion'],
  ['musculoskeletalScreening', 'normalStrengthBilateral'],
  // 8 Neurological
  ['neurologicalConcussionBaseline', 'totalConcussions'],
  ['neurologicalConcussionBaseline', 'concussionLastSixMonths'],
  ['neurologicalConcussionBaseline', 'ongoingPostConcussiveSymptoms'],
  ['neurologicalConcussionBaseline', 'historyOfSeizures'],
  ['neurologicalConcussionBaseline', 'stinger'],
  ['neurologicalConcussionBaseline', 'historyOfHeadOrNeckSurgery'],
  // 9 Vision & skin
  ['visionSkin', 'correctiveLensesWorn'],
  ['visionSkin', 'monocularAthlete'],
  ['visionSkin', 'activeSkinInfection'],
  ['visionSkin', 'herpesGladiatorum'],
  ['visionSkin', 'impetigoOrMRSA'],
  ['visionSkin', 'openWoundsOrLesions'],
  // 10 Clearance
  ['clearanceDecision', 'preferredClearance']
];

// Tracked separately because they only count if applicable (sex=female).
const TRACKED_FIELDS_REDS = [
  ['menstrualHistoryREDS', 'regularPeriods'],
  ['menstrualHistoryREDS', 'amenorrhoeaSixMonths'],
  ['menstrualHistoryREDS', 'restrictiveEatingPattern'],
  ['menstrualHistoryREDS', 'stressFractureHistory'],
  ['menstrualHistoryREDS', 'lowEnergyAvailabilityConcern']
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
  let total = TRACKED_FIELDS.length;
  if (state.menstrualHistoryREDS.applicable) {
    total += TRACKED_FIELDS_REDS.length;
    for (const [section, field] of TRACKED_FIELDS_REDS) {
      sectionTotal[section] = (sectionTotal[section] || 0) + 1;
      const v = state[section][field];
      if (v !== null && v !== undefined && v !== '') {
        answered++;
        sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
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
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics',                    title: 'Demographics' },
  { step: 2,  section: 'sportPositionDetails',            title: 'Sport & Position' },
  { step: 3,  section: 'medicalHistory',                  title: 'Medical History' },
  { step: 4,  section: 'familyHistory',                   title: 'Family History' },
  { step: 5,  section: 'menstrualHistoryREDS',            title: 'Menstrual / RED-S' },
  { step: 6,  section: 'cardiovascularScreening',         title: 'Cardiovascular' },
  { step: 7,  section: 'musculoskeletalScreening',        title: 'Musculoskeletal' },
  { step: 8,  section: 'neurologicalConcussionBaseline',  title: 'Neuro / Concussion' },
  { step: 9,  section: 'visionSkin',                      title: 'Vision & Skin' },
  { step: 10, section: 'clearanceDecision',               title: 'Clearance' }
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
    const id = input.id || input.name;
    const groupKey = input.name || id;
    if (input.type === 'radio') {
      if (seen.has(groupKey)) return;
      seen.add(groupKey);
      const checked = form.querySelector(`input[type="radio"][name="${groupKey}"]:checked`);
      if (!checked) {
        const legend = form.querySelector(`#${groupKey}-fieldset > legend`);
        const label = legend ? legend.textContent.replace(/\s*\*\s*$/, '').trim() : groupKey;
        errors.push({ id: groupKey, message: `${label} is required` });
        setFieldError(groupKey, `${label} is required`);
      } else {
        clearFieldError(groupKey);
      }
      return;
    }
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

function countAnswered() {
  let answered = 0;
  for (const [section, field] of TRACKED_FIELDS) {
    const v = state[section][field];
    if (v !== null && v !== undefined && v !== '') answered++;
  }
  if (state.menstrualHistoryREDS.applicable) {
    for (const [section, field] of TRACKED_FIELDS_REDS) {
      const v = state[section][field];
      if (v !== null && v !== undefined && v !== '') answered++;
    }
  }
  return answered;
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { clearance, answeredCount, firedRules, additionalFlags, timestamp } = lastResult;

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
    ? `<p class="muted">No PPE rules fired — no clearance concerns identified.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Finding</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Sports Medicine — PPE Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Recommended Clearance</h3>
      <p class="ppe-summary">
        <span class="clearance-badge ${clearanceClass(clearance)}">
          ${esc(clearanceLabel(clearance))}
        </span>
      </p>
      <p class="muted">Based on ${answeredCount} field${answeredCount === 1 ? '' : 's'} answered and ${firedRules.length} rule${firedRules.length === 1 ? '' : 's'} fired.</p>

      <h3>Findings (PPE rule audit)</h3>
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
  recomputeDerived();
  const { clearance, firedRules } = gradePPE(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    clearance,
    answeredCount: countAnswered(),
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
  if (report) {
    report.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  }
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
