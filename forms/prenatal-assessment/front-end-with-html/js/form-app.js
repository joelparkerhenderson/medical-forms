import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateRisk } from './risk-grader.js';
import { bmiCategory, calculateBMI, emptyAssessment, gestationalWeeksLabel, riskLevelClass, riskLevelLabel } from './types.js';

// Prenatal Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure prenatal risk grader and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'prenatal-assessment.front-end-form-with-html.v1';

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
      // Special case: obstetricHistory has a nested previousComplications object.
      if (key === 'obstetricHistory') {
        const merged = { ...fresh[key], ...parsed[key] };
        merged.previousComplications = {
          ...fresh[key].previousComplications,
          ...((parsed[key] && parsed[key].previousComplications) || {})
        };
        fresh[key] = merged;
      } else {
        fresh[key] = { ...fresh[key], ...parsed[key] };
      }
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

let state = loadState();
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'prenatal-assessment',
  hadDraftAtLoad,
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

/** Set a field on `state[section][field]` and persist. */
function setField(section, field, value) {
  state[section][field] = value;
  recomputeDerived();
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
}

/** Set a field on a nested object: `state[section][parent][field]`. */
function setNestedField(section, parent, field, value) {
  state[section][parent][field] = value;
  saveState(state);
  updateProgress();
}

/** Recompute auto-calculated values that depend on other fields. */
function recomputeDerived() {
  state.vitalSigns.bmi = calculateBMI(
    state.vitalSigns.weight,
    state.vitalSigns.height
  );
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

/** Build a labelled text input. */
function textInput(opts) {
  const id = opts.section + '-' + opts.field;
  const value = state[opts.section][opts.field];
  const requiredAttrs = opts.required ? ' data-required' : '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const attrs = [
    'id="' + id + '"',
    'name="' + id + '"',
    'type="' + type + '"',
    'class="' + lilyInputClass(type) + '"',
    'value="' + esc(value ?? '') + '"',
    'aria-describedby="' + id + '-error"'
  ];
  if (opts.placeholder) attrs.push('placeholder="' + esc(opts.placeholder) + '"');
  if (opts.required) attrs.push('required', 'data-required');
  if (opts.min !== undefined) attrs.push('min="' + opts.min + '"');
  if (opts.max !== undefined) attrs.push('max="' + opts.max + '"');
  if (opts.step !== undefined) attrs.push('step="' + opts.step + '"');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML =
    '<label class="label" for="' + id + '"' + requiredAttrs + '>' + labelText + '</label>' +
    '<input ' + attrs.join(' ') + '>' +
    (opts.unit ? '<span class="unit">' + esc(opts.unit) + '</span>' : '') +
    '<span class="error-message" id="' + id + '-error" aria-live="polite"></span>';

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

/** Build a labelled multi-line text area. */
function textArea(opts) {
  const id = opts.section + '-' + opts.field;
  const value = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML =
    '<label class="label" for="' + id + '">' + esc(opts.label) + '</label>' +
    '<textarea id="' + id + '" name="' + id + '" rows="' + (opts.rows || 3) + '" ' +
    (opts.placeholder ? 'placeholder="' + esc(opts.placeholder) + '"' : '') +
    ' aria-describedby="' + id + '-error"' +
    ' class="text-area-input">' + esc(value) + '</textarea>' +
    '<span class="error-message" id="' + id + '-error" aria-live="polite"></span>';
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => { setField(opts.section, opts.field, ta.value); clearFieldError(id); });
  return wrapper;
}

/** Build a select / dropdown input. */
function selectInput(opts) {
  const id = opts.section + '-' + opts.field;
  const current = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const optionsHtml = [
    '<option value="">— Select —</option>',
    ...opts.options.map((o) =>
      '<option value="' + esc(o.value) + '"' +
      (o.value === current ? ' selected' : '') + '>' +
      esc(o.label) + '</option>'
    )
  ].join('');
  wrapper.innerHTML =
    '<label class="label" for="' + id + '">' + esc(opts.label) + '</label>' +
    '<select id="' + id + '" name="' + id + '" class="select" aria-describedby="' + id + '-error">' +
    optionsHtml + '</select>' +
    '<span class="error-message" id="' + id + '-error" aria-live="polite"></span>';
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => { setField(opts.section, opts.field, sel.value); clearFieldError(id); });
  return wrapper;
}

/** Build a radio group. */
function radioGroup(opts) {
  const groupId = opts.section + '-' + opts.field;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const labelEl = document.createElement('span');
  labelEl.className = 'label';
  labelEl.id = groupId + '-label';
  labelEl.textContent = opts.label;
  wrapper.appendChild(labelEl);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', groupId + '-label');
  for (const option of opts.options) {
    const radioId = groupId + '-' + option.value;
    const label = document.createElement('label');
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    label.innerHTML =
      '<input type="radio" class="radio-input" id="' + radioId + '" name="' + groupId +
      '" value="' + esc(option.value) + '"' + checked + '>' +
      '<span>' + esc(option.label) + '</span>';
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) setField(opts.section, opts.field, option.value);
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);
  return wrapper;
}

/** Radio group whose value lives at state[section][parent][field]. */
function nestedRadioGroup(opts) {
  const groupId = opts.section + '-' + opts.parent + '-' + opts.field;
  const current = state[opts.section][opts.parent][opts.field];
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const labelEl = document.createElement('span');
  labelEl.className = 'label';
  labelEl.id = groupId + '-label';
  labelEl.textContent = opts.label;
  wrapper.appendChild(labelEl);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', groupId + '-label');
  for (const option of opts.options) {
    const radioId = groupId + '-' + option.value;
    const label = document.createElement('label');
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    label.innerHTML =
      '<input type="radio" class="radio-input" id="' + radioId + '" name="' + groupId +
      '" value="' + esc(option.value) + '"' + checked + '>' +
      '<span>' + esc(option.label) + '</span>';
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) setNestedField(opts.section, opts.parent, opts.field, option.value);
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);
  return wrapper;
}

/** Read-only auto-calculated readout (e.g. BMI). */
function readOnlyReadout(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field readout';
  wrapper.innerHTML =
    '<label class="label">' + esc(opts.label) + '</label>' +
    '<div id="' + opts.id + '" class="readout-value">' + opts.render() + '</div>';
  return wrapper;
}

/** Build a section card. */
function sectionCard(opts) {
  const card = document.createElement('fieldset');
  card.className = 'fieldset';
  card.dataset.step = String(opts.stepNumber);
  card.id = 'step-' + opts.stepNumber;
  const desc = opts.description
    ? '<span class="section-description">' + esc(opts.description) + '</span>'
    : '';
  const legend = document.createElement('legend');
  legend.className = 'fieldset-legend';
  legend.innerHTML =
    '<span class="section-step">Section ' + opts.stepNumber + ' of 10</span>' +
    '<span class="section-title">' + esc(opts.title) + '</span>' +
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
    field: 'dateOfBirth',
    type: 'date',
    required: true
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Pregnancy Details',
    description: 'Information about the current pregnancy.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Gestational Weeks',
    section: 'pregnancyDetails', field: 'gestationalWeeks',
    type: 'number', min: 0, max: 45, unit: 'weeks'
  }));
  grid.appendChild(textInput({
    label: 'Estimated Due Date',
    section: 'pregnancyDetails', field: 'estimatedDueDate',
    type: 'date'
  }));
  card.appendChild(grid);

  card.appendChild(selectInput({
    label: 'Conception Method',
    section: 'pregnancyDetails', field: 'conceptionMethod',
    options: [
      { value: 'natural', label: 'Natural conception' },
      { value: 'ivf', label: 'IVF (in vitro fertilisation)' },
      { value: 'iui', label: 'IUI (intrauterine insemination)' },
      { value: 'icsi', label: 'ICSI (intracytoplasmic sperm injection)' },
      { value: 'donor-egg', label: 'Donor egg' },
      { value: 'donor-embryo', label: 'Donor embryo' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Multiple Gestation (twins, triplets, etc.)?',
    section: 'pregnancyDetails', field: 'multipleGestation',
    options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Placenta Location',
    section: 'pregnancyDetails', field: 'placentaLocation',
    options: [
      { value: 'anterior', label: 'Anterior' },
      { value: 'posterior', label: 'Posterior' },
      { value: 'fundal', label: 'Fundal' },
      { value: 'lateral', label: 'Lateral' },
      { value: 'previa', label: 'Placenta previa' },
      { value: 'low-lying', label: 'Low-lying placenta' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Obstetric History',
    description: 'Previous pregnancies and complications.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Gravida (total pregnancies)',
    section: 'obstetricHistory', field: 'gravida',
    type: 'number', min: 0, max: 25
  }));
  grid.appendChild(textInput({
    label: 'Para (births after 24 weeks)',
    section: 'obstetricHistory', field: 'para',
    type: 'number', min: 0, max: 25
  }));
  grid.appendChild(textInput({
    label: 'Abortions / miscarriages',
    section: 'obstetricHistory', field: 'abortions',
    type: 'number', min: 0, max: 25
  }));
  grid.appendChild(textInput({
    label: 'Living children',
    section: 'obstetricHistory', field: 'livingChildren',
    type: 'number', min: 0, max: 25
  }));
  card.appendChild(grid);

  const subHeader = document.createElement('div');
  subHeader.className = 'list-section-header';
  subHeader.innerHTML = '<h3>Previous complications</h3>';
  card.appendChild(subHeader);

  card.appendChild(nestedRadioGroup({
    label: 'Previous preeclampsia',
    section: 'obstetricHistory', parent: 'previousComplications', field: 'preeclampsia',
    options: yesNo
  }));
  card.appendChild(nestedRadioGroup({
    label: 'Previous gestational diabetes',
    section: 'obstetricHistory', parent: 'previousComplications', field: 'gestationalDiabetes',
    options: yesNo
  }));
  card.appendChild(nestedRadioGroup({
    label: 'Previous preterm birth',
    section: 'obstetricHistory', parent: 'previousComplications', field: 'pretermBirth',
    options: yesNo
  }));
  card.appendChild(nestedRadioGroup({
    label: 'Previous cesarean section',
    section: 'obstetricHistory', parent: 'previousComplications', field: 'cesareanSection',
    options: yesNo
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Medical History',
    description: 'Pre-existing medical conditions.'
  });

  card.appendChild(radioGroup({
    label: 'Pre-existing hypertension',
    section: 'medicalHistory', field: 'hypertension', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Pre-existing diabetes',
    section: 'medicalHistory', field: 'diabetes', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Autoimmune disease',
    section: 'medicalHistory', field: 'autoimmune', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Thyroid disorder',
    section: 'medicalHistory', field: 'thyroid', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Other chronic conditions',
    section: 'medicalHistory', field: 'chronicConditions',
    placeholder: 'List any other chronic medical conditions…',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Current Symptoms',
    description: 'Symptoms experienced during this pregnancy.'
  });

  card.appendChild(radioGroup({ label: 'Nausea / vomiting', section: 'currentSymptoms', field: 'nausea', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Vaginal bleeding', section: 'currentSymptoms', field: 'bleeding', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Severe headache', section: 'currentSymptoms', field: 'headache', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Vision changes (blurring, spots, flashing lights)', section: 'currentSymptoms', field: 'visionChanges', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Edema (swelling of hands, face, or feet)', section: 'currentSymptoms', field: 'edema', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Abdominal pain', section: 'currentSymptoms', field: 'abdominalPain', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Reduced fetal movement', section: 'currentSymptoms', field: 'reducedFetalMovement', options: yesNo }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Vital Signs',
    description: 'Most recent measurements (leave blank if unknown).'
  });

  const bpGrid = document.createElement('div');
  bpGrid.className = 'two-col';
  bpGrid.appendChild(textInput({
    label: 'Blood pressure systolic',
    section: 'vitalSigns', field: 'bloodPressureSystolic',
    type: 'number', min: 50, max: 250, unit: 'mmHg'
  }));
  bpGrid.appendChild(textInput({
    label: 'Blood pressure diastolic',
    section: 'vitalSigns', field: 'bloodPressureDiastolic',
    type: 'number', min: 30, max: 150, unit: 'mmHg'
  }));
  card.appendChild(bpGrid);

  const measurements = document.createElement('div');
  measurements.className = 'three-col';
  measurements.appendChild(textInput({
    label: 'Weight', section: 'vitalSigns', field: 'weight',
    type: 'number', min: 1, max: 400, unit: 'kg'
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'vitalSigns', field: 'height',
    type: 'number', min: 50, max: 250, unit: 'cm'
  }));
  measurements.appendChild(readOnlyReadout({
    label: 'BMI',
    id: 'bmi-readout',
    render: () => {
      const bmi = state.vitalSigns.bmi;
      if (bmi == null) return '<span class="muted">Auto-calculated</span>';
      return '<strong>' + bmi + '</strong> <span class="muted">(' + esc(bmiCategory(bmi)) + ')</span>';
    }
  }));
  card.appendChild(measurements);

  const fetal = document.createElement('div');
  fetal.className = 'two-col';
  fetal.appendChild(textInput({
    label: 'Fundal height',
    section: 'vitalSigns', field: 'fundalHeight',
    type: 'number', min: 0, max: 50, unit: 'cm'
  }));
  fetal.appendChild(textInput({
    label: 'Fetal heart rate',
    section: 'vitalSigns', field: 'fetalHeartRate',
    type: 'number', min: 0, max: 250, unit: 'bpm'
  }));
  card.appendChild(fetal);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Laboratory Results',
    description: 'Recent laboratory and screening test results.'
  });

  const bloodGrid = document.createElement('div');
  bloodGrid.className = 'two-col';
  bloodGrid.appendChild(selectInput({
    label: 'Blood Type',
    section: 'laboratoryResults', field: 'bloodType',
    options: [
      { value: 'A', label: 'A' },
      { value: 'B', label: 'B' },
      { value: 'AB', label: 'AB' },
      { value: 'O', label: 'O' }
    ]
  }));
  bloodGrid.appendChild(selectInput({
    label: 'Rh Factor',
    section: 'laboratoryResults', field: 'rhFactor',
    options: [
      { value: 'positive', label: 'Positive' },
      { value: 'negative', label: 'Negative' }
    ]
  }));
  card.appendChild(bloodGrid);

  const labGrid = document.createElement('div');
  labGrid.className = 'two-col';
  labGrid.appendChild(textInput({
    label: 'Hemoglobin',
    section: 'laboratoryResults', field: 'hemoglobin',
    type: 'number', min: 0, max: 25, step: 0.1, unit: 'g/dL'
  }));
  labGrid.appendChild(textInput({
    label: 'Glucose',
    section: 'laboratoryResults', field: 'glucose',
    type: 'number', min: 0, max: 30, step: 0.1, unit: 'mmol/L'
  }));
  card.appendChild(labGrid);

  card.appendChild(textInput({
    label: 'Urinalysis findings',
    section: 'laboratoryResults', field: 'urinalysis',
    placeholder: 'e.g. trace protein, no glucose'
  }));

  card.appendChild(radioGroup({
    label: 'Group B Streptococcus (GBS) positive?',
    section: 'laboratoryResults', field: 'gbs', options: yesNo
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Lifestyle & Nutrition',
    description: 'Lifestyle factors and dietary information.'
  });

  card.appendChild(radioGroup({
    label: 'Smoking during pregnancy',
    section: 'lifestyleNutrition', field: 'smoking', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Alcohol use during pregnancy',
    section: 'lifestyleNutrition', field: 'alcohol', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Drug use during pregnancy',
    section: 'lifestyleNutrition', field: 'drugs', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Exercise level',
    section: 'lifestyleNutrition', field: 'exercise',
    options: [
      { value: 'none', label: 'None' },
      { value: 'light', label: 'Light' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'vigorous', label: 'Vigorous' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Diet quality',
    section: 'lifestyleNutrition', field: 'diet',
    options: [
      { value: 'poor', label: 'Poor' },
      { value: 'fair', label: 'Fair' },
      { value: 'good', label: 'Good' },
      { value: 'excellent', label: 'Excellent' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Supplements',
    section: 'lifestyleNutrition', field: 'supplements',
    placeholder: 'List any vitamins, minerals, or herbal supplements…',
    rows: 2
  }));

  card.appendChild(radioGroup({
    label: 'Taking folic acid supplementation?',
    section: 'lifestyleNutrition', field: 'folicAcid', options: yesNo
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Mental Health Screening',
    description: 'Mental wellbeing and support.'
  });

  card.appendChild(textInput({
    label: 'Edinburgh Postnatal Depression Scale score',
    section: 'mentalHealthScreening', field: 'edinburghScore',
    type: 'number', min: 0, max: 30, unit: '/ 30'
  }));

  card.appendChild(selectInput({
    label: 'Anxiety level',
    section: 'mentalHealthScreening', field: 'anxietyLevel',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Do you have a support system (partner, family, friends)?',
    section: 'mentalHealthScreening', field: 'supportSystem', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Domestic violence concerns?',
    section: 'mentalHealthScreening', field: 'domesticViolenceScreen', options: yesNo
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Birth Plan Preferences',
    description: 'Your preferences for labour, delivery, and the postnatal period.'
  });

  card.appendChild(textArea({
    label: 'Delivery preference',
    section: 'birthPlanPreferences', field: 'deliveryPreference',
    placeholder: 'e.g. vaginal birth, planned cesarean, water birth…',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Pain management',
    section: 'birthPlanPreferences', field: 'painManagement',
    placeholder: 'e.g. epidural, gas and air, none, hypnobirthing…',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Feeding plan',
    section: 'birthPlanPreferences', field: 'feedingPlan',
    placeholder: 'e.g. breastfeeding, formula, mixed…',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Special requests',
    section: 'birthPlanPreferences', field: 'specialRequests',
    placeholder: 'Cultural, religious, or personal preferences…',
    rows: 3
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections + auto-calculated readouts
// ----------------------------------------------------------------------

function updateConditionalSections() {
  // None currently use conditional visibility; kept as a no-op extension point.
}

function refreshAutoCalculatedReadouts() {
  const bmi = document.getElementById('bmi-readout');
  if (bmi) {
    const v = state.vitalSigns.bmi;
    bmi.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : '<strong>' + v + '</strong> <span class="muted">(' + esc(bmiCategory(v)) + ')</span>';
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
  // Pregnancy details
  ['pregnancyDetails', 'gestationalWeeks'],
  ['pregnancyDetails', 'estimatedDueDate'],
  ['pregnancyDetails', 'conceptionMethod'],
  ['pregnancyDetails', 'multipleGestation'],
  ['pregnancyDetails', 'placentaLocation'],
  // Obstetric history
  ['obstetricHistory', 'gravida'],
  ['obstetricHistory', 'para'],
  ['obstetricHistory', 'abortions'],
  ['obstetricHistory', 'livingChildren'],
  ['obstetricHistory.previousComplications', 'preeclampsia'],
  ['obstetricHistory.previousComplications', 'gestationalDiabetes'],
  ['obstetricHistory.previousComplications', 'pretermBirth'],
  ['obstetricHistory.previousComplications', 'cesareanSection'],
  // Medical history
  ['medicalHistory', 'hypertension'],
  ['medicalHistory', 'diabetes'],
  ['medicalHistory', 'autoimmune'],
  ['medicalHistory', 'thyroid'],
  // Current symptoms
  ['currentSymptoms', 'nausea'],
  ['currentSymptoms', 'bleeding'],
  ['currentSymptoms', 'headache'],
  ['currentSymptoms', 'visionChanges'],
  ['currentSymptoms', 'edema'],
  ['currentSymptoms', 'abdominalPain'],
  ['currentSymptoms', 'reducedFetalMovement'],
  // Vital signs
  ['vitalSigns', 'bloodPressureSystolic'],
  ['vitalSigns', 'bloodPressureDiastolic'],
  ['vitalSigns', 'weight'],
  ['vitalSigns', 'height'],
  ['vitalSigns', 'fetalHeartRate'],
  // Laboratory
  ['laboratoryResults', 'bloodType'],
  ['laboratoryResults', 'rhFactor'],
  ['laboratoryResults', 'hemoglobin'],
  ['laboratoryResults', 'glucose'],
  ['laboratoryResults', 'gbs'],
  // Lifestyle
  ['lifestyleNutrition', 'smoking'],
  ['lifestyleNutrition', 'alcohol'],
  ['lifestyleNutrition', 'drugs'],
  ['lifestyleNutrition', 'exercise'],
  ['lifestyleNutrition', 'diet'],
  ['lifestyleNutrition', 'folicAcid'],
  // Mental health
  ['mentalHealthScreening', 'edinburghScore'],
  ['mentalHealthScreening', 'anxietyLevel'],
  ['mentalHealthScreening', 'supportSystem'],
  ['mentalHealthScreening', 'domesticViolenceScreen']
];

function getTrackedValue(path, field) {
  if (path.indexOf('.') === -1) {
    return state[path][field];
  }
  const [section, parent] = path.split('.');
  return state[section][parent][field];
}

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [path, field] of TRACKED_FIELDS) {
    const section = path.indexOf('.') === -1 ? path : path.split('.')[0];
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    const v = getTrackedValue(path, field);
    if (v !== null && v !== undefined && v !== '') {
      answered++;
      sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
    }
  }
  const total = TRACKED_FIELDS.length;
  const percent = Math.round((answered / total) * 100);
  const progress = document.getElementById('progress');
  const text = document.getElementById('progress-text');
  if (progress) progress.value = percent;
  if (text) text.textContent = answered + ' of ' + total + ' fields answered (' + percent + '%)';
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Step list
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics',          title: 'Demographics' },
  { step: 2,  section: 'pregnancyDetails',      title: 'Pregnancy' },
  { step: 3,  section: 'obstetricHistory',      title: 'Obstetric' },
  { step: 4,  section: 'medicalHistory',        title: 'Medical' },
  { step: 5,  section: 'currentSymptoms',       title: 'Symptoms' },
  { step: 6,  section: 'vitalSigns',            title: 'Vitals' },
  { step: 7,  section: 'laboratoryResults',     title: 'Labs' },
  { step: 8,  section: 'lifestyleNutrition',    title: 'Lifestyle' },
  { step: 9,  section: 'mentalHealthScreening', title: 'Mental Health' },
  { step: 10, section: 'birthPlan',             title: 'Birth Plan' }
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

// ----------------------------------------------------------------------
// Validation
// ----------------------------------------------------------------------

function clearFieldError(id) {
  const el = document.getElementById(id + '-error');
  if (el) el.textContent = '';
  const input = document.getElementById(id);
  if (input) input.removeAttribute('aria-invalid');
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
  const required = form.querySelectorAll('input[data-required], select[data-required], textarea[data-required]');
  required.forEach((input) => {
    const id = input.id;
    const value = (input.value || '').trim();
    if (!value) {
      const labelEl = form.querySelector('label[for="' + id + '"]');
      const label = labelEl ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim() : id;
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
    errors.map((e) => '<li><a href="#' + esc(e.id) + '">' + esc(e.message) + '</a></li>').join('') +
    '</ul>';
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { riskScore, riskLevel, firedRules, additionalFlags, timestamp } = lastResult;

  const flagsList = additionalFlags.length === 0
    ? '<p class="muted">No additional flags raised.</p>'
    : '<ul class="flags">' +
      additionalFlags.map((f) =>
        '<li class="' + priorityClass(f.priority) + '">' +
        '<span class="flag-priority">' + esc(f.priority.toUpperCase()) + '</span>' +
        '<span class="flag-category">' + esc(f.category) + '</span>' +
        '<span class="flag-message">' + esc(f.message) + '</span>' +
        '</li>'
      ).join('') +
      '</ul>';

  const firedRows = firedRules.map((r) =>
    '<tr>' +
    '<th scope="row">' + esc(r.id) + '</th>' +
    '<td>' + esc(r.category) + '</td>' +
    '<td>' + esc(r.description) + '</td>' +
    '<td class="num">+' + r.weight + '</td>' +
    '</tr>'
  ).join('');

  const firedTable = firedRules.length === 0
    ? '<p class="muted">No risk factors triggered.</p>'
    : '<table class="subscales">' +
      '<thead><tr>' +
      '<th scope="col">ID</th>' +
      '<th scope="col">Category</th>' +
      '<th scope="col">Risk factor</th>' +
      '<th scope="col">Weight</th>' +
      '</tr></thead>' +
      '<tbody>' + firedRows + '</tbody>' +
      '</table>';

  const gestText = gestationalWeeksLabel(state.pregnancyDetails.gestationalWeeks);

  out.innerHTML =
    '<div class="report-card">' +
    '<header class="report-header">' +
    '<h2>Prenatal Assessment Report</h2>' +
    '<p class="muted">Generated ' + esc(new Date(timestamp).toLocaleString()) + '</p>' +
    '</header>' +
    '<p class="muted">Gestation: ' + esc(gestText) + '</p>' +
    '<h3>Cumulative Risk Score</h3>' +
    '<p class="risk-summary">' +
    '<span class="risk-score-badge ' + riskLevelClass(riskLevel) + '">' + riskScore + '</span>' +
    '<span class="control-level">' + esc(riskLevelLabel(riskLevel)) + '</span>' +
    '</p>' +
    '<p class="muted">' + firedRules.length + ' risk factor(s) triggered.</p>' +
    '<h3>Triggered risk factors</h3>' +
    firedTable +
    '<h3>Flagged issues</h3>' +
    flagsList +
    '<div class="report-actions">' +
    '<button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>' +
    '</div>' +
    '</div>';
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  recomputeDerived();
  const { riskScore, riskLevel, firedRules } = calculateRisk(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    riskScore,
    riskLevel,
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
