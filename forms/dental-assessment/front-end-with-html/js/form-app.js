import { calculateDMFT } from './dmft-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { dmftCategoryClass, dmftCategoryLabel, dmftScoreShortLabel, emptyAssessment, getDMFTCategory, getDMFTScore } from './types.js';

// Dental Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure DMFT scoring engine and renders an inline report. State
// persists to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'dental-assessment.front-end-form-with-html.v1';

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

/** @type {import('./types.js').AssessmentData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'dental-assessment',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const report = document.getElementById('report');
    if (report) report.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    updateConditionalSections();
    refreshDmftBanner();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs progress, conditional visibility, and the live DMFT banner
 * after each change.
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
  refreshDmftBanner();
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
 * @param {{ label: string, section: string, field: string, required?: boolean,
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
 * @param {{ label: string, section: string, field: string, required?: boolean,
 *           options: { value: string, label: string }[] }} opts
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
    `<span class="section-step">Section ${opts.stepNumber} of 9</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Section renderers (1 per step)
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
    section: 'demographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'demographics', field: 'sex',
    required: true,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  const ec = document.createElement('div');
  ec.className = 'two-col';
  ec.appendChild(textInput({
    label: 'Emergency Contact Name',
    section: 'demographics', field: 'emergencyContactName',
    required: true
  }));
  ec.appendChild(textInput({
    label: 'Emergency Contact Phone',
    section: 'demographics', field: 'emergencyContactPhone',
    required: true
  }));
  card.appendChild(ec);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Chief Complaint',
    description: 'Primary dental concern and pain assessment.'
  });

  card.appendChild(textArea({
    label: 'What is your primary dental concern?',
    section: 'chiefComplaint', field: 'primaryConcern',
    placeholder: 'e.g. Toothache, broken tooth, routine check-up'
  }));

  card.appendChild(textInput({
    label: 'Pain location (if any)',
    section: 'chiefComplaint', field: 'painLocation',
    placeholder: 'e.g. Lower right molar'
  }));

  card.appendChild(textInput({
    label: 'Pain severity',
    section: 'chiefComplaint', field: 'painSeverity',
    type: 'number', min: 0, max: 10, unit: '0-10 scale'
  }));

  card.appendChild(textInput({
    label: 'When did the pain start?',
    section: 'chiefComplaint', field: 'painOnset',
    placeholder: 'e.g. 3 days ago'
  }));

  card.appendChild(textInput({
    label: 'How long does the pain last?',
    section: 'chiefComplaint', field: 'painDuration',
    placeholder: 'e.g. Constant, intermittent, only when eating'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Dental History',
    description: 'Your dental care habits and history.'
  });

  card.appendChild(textInput({
    label: 'Date of last dental visit',
    section: 'dentalHistory', field: 'lastDentalVisit',
    type: 'date'
  }));

  card.appendChild(selectInput({
    label: 'How often do you visit the dentist?',
    section: 'dentalHistory', field: 'visitFrequency',
    options: [
      { value: 'every-6-months', label: 'Every 6 months' },
      { value: 'annually', label: 'Annually' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'never', label: 'Never' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'How often do you brush your teeth?',
    section: 'dentalHistory', field: 'brushingFrequency',
    options: [
      { value: 'twice-daily', label: 'Twice daily' },
      { value: 'once-daily', label: 'Once daily' },
      { value: 'occasionally', label: 'Occasionally' },
      { value: 'rarely', label: 'Rarely' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'How often do you floss?',
    section: 'dentalHistory', field: 'flossingFrequency',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'occasionally', label: 'Occasionally' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'never', label: 'Never' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Level of dental anxiety',
    section: 'dentalHistory', field: 'dentalAnxietyLevel',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'DMFT Assessment',
    description: 'Decayed, Missing, and Filled Teeth index (maximum 32).'
  });

  const grid = document.createElement('div');
  grid.className = 'three-col';
  grid.appendChild(textInput({
    label: 'Decayed Teeth (D)',
    section: 'dmftAssessment', field: 'decayedTeeth',
    type: 'number', min: 0, max: 32
  }));
  grid.appendChild(textInput({
    label: 'Missing Teeth (M)',
    section: 'dmftAssessment', field: 'missingTeeth',
    type: 'number', min: 0, max: 32
  }));
  grid.appendChild(textInput({
    label: 'Filled Teeth (F)',
    section: 'dmftAssessment', field: 'filledTeeth',
    type: 'number', min: 0, max: 32
  }));
  card.appendChild(grid);

  // Live DMFT banner — refreshed by refreshDmftBanner().
  const banner = document.createElement('div');
  banner.id = 'dmft-banner';
  banner.className = 'dmft-banner';
  banner.setAttribute('aria-live', 'polite');
  banner.innerHTML = renderDmftBannerInner();
  card.appendChild(banner);

  card.appendChild(textArea({
    label: 'Tooth chart notes',
    section: 'dmftAssessment', field: 'toothChartNotes',
    placeholder: 'Note specific teeth affected using FDI notation (e.g. 16 MOD amalgam, 36 D caries)',
    rows: 4
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Periodontal Assessment',
    description: 'Gum health and supporting structures.'
  });

  card.appendChild(radioGroup({
    label: 'Do your gums bleed when brushing or flossing?',
    section: 'periodontalAssessment', field: 'gumBleeding', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Are any pocket depths above normal (>3mm)?',
    section: 'periodontalAssessment', field: 'pocketDepthsAboveNormal', options: yesNo
  }));
  const pocketDetails = document.createElement('div');
  pocketDetails.dataset.conditional = 'periodontalAssessment.pocketDepthsAboveNormal=yes';
  pocketDetails.appendChild(textInput({
    label: 'Pocket depth details',
    section: 'periodontalAssessment', field: 'pocketDepthDetails',
    placeholder: 'e.g. 5mm on 16 mesial'
  }));
  card.appendChild(pocketDetails);

  card.appendChild(radioGroup({
    label: 'Is there gum recession?',
    section: 'periodontalAssessment', field: 'gumRecession', options: yesNo
  }));
  const recessionDetails = document.createElement('div');
  recessionDetails.dataset.conditional = 'periodontalAssessment.gumRecession=yes';
  recessionDetails.appendChild(textInput({
    label: 'Recession details',
    section: 'periodontalAssessment', field: 'gumRecessionDetails',
    placeholder: 'e.g. 2mm recession on 31 labial'
  }));
  card.appendChild(recessionDetails);

  card.appendChild(radioGroup({
    label: 'Is there any tooth mobility?',
    section: 'periodontalAssessment', field: 'toothMobility', options: yesNo
  }));
  const mobilityDetails = document.createElement('div');
  mobilityDetails.dataset.conditional = 'periodontalAssessment.toothMobility=yes';
  mobilityDetails.appendChild(textInput({
    label: 'Mobility details',
    section: 'periodontalAssessment', field: 'mobilityDetails',
    placeholder: 'e.g. Grade II mobility on 41'
  }));
  card.appendChild(mobilityDetails);

  card.appendChild(radioGroup({
    label: 'Is there furcation involvement?',
    section: 'periodontalAssessment', field: 'furcationInvolvement', options: yesNo
  }));
  const furcationDetails = document.createElement('div');
  furcationDetails.dataset.conditional = 'periodontalAssessment.furcationInvolvement=yes';
  furcationDetails.appendChild(textInput({
    label: 'Furcation details',
    section: 'periodontalAssessment', field: 'furcationDetails',
    placeholder: 'e.g. Class II furcation on 36'
  }));
  card.appendChild(furcationDetails);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Oral Examination',
    description: 'Soft tissue, TMJ, and occlusion findings.'
  });

  card.appendChild(textArea({
    label: 'Soft tissue findings',
    section: 'oralExamination', field: 'softTissueFindings',
    placeholder: 'e.g. Normal mucosa, no lesions; or describe any findings'
  }));

  card.appendChild(radioGroup({
    label: 'TMJ pain?',
    section: 'oralExamination', field: 'tmjPain', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'TMJ clicking or crepitus?',
    section: 'oralExamination', field: 'tmjClicking', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Limited jaw opening?',
    section: 'oralExamination', field: 'tmjLimitedOpening', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Occlusion classification',
    section: 'oralExamination', field: 'occlusion',
    options: [
      { value: 'class-I', label: 'Class I - Normal' },
      { value: 'class-II', label: 'Class II - Retrognathic' },
      { value: 'class-III', label: 'Class III - Prognathic' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Oral hygiene index',
    section: 'oralExamination', field: 'oralHygieneIndex',
    options: [
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' },
      { value: 'poor', label: 'Poor' }
    ]
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Medical History',
    description: 'Relevant medical conditions that may affect dental treatment.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have any cardiovascular disease?',
    section: 'medicalHistory', field: 'cardiovascularDisease', options: yesNo
  }));
  const cvDetails = document.createElement('div');
  cvDetails.dataset.conditional = 'medicalHistory.cardiovascularDisease=yes';
  cvDetails.appendChild(textInput({
    label: 'Please provide details',
    section: 'medicalHistory', field: 'cardiovascularDetails',
    placeholder: 'e.g. Heart valve replacement, endocarditis history'
  }));
  card.appendChild(cvDetails);

  card.appendChild(radioGroup({
    label: 'Do you have diabetes?',
    section: 'medicalHistory', field: 'diabetes', options: yesNo
  }));
  const diabetesBlock = document.createElement('div');
  diabetesBlock.dataset.conditional = 'medicalHistory.diabetes=yes';
  diabetesBlock.appendChild(selectInput({
    label: 'Diabetes type',
    section: 'medicalHistory', field: 'diabetesType',
    required: true,
    options: [
      { value: 'type1', label: 'Type 1' },
      { value: 'type2', label: 'Type 2' }
    ]
  }));
  diabetesBlock.appendChild(radioGroup({
    label: 'Is your diabetes well controlled?',
    section: 'medicalHistory', field: 'diabetesControlled', options: yesNo
  }));
  card.appendChild(diabetesBlock);

  card.appendChild(radioGroup({
    label: 'Do you have a bleeding disorder?',
    section: 'medicalHistory', field: 'bleedingDisorder', options: yesNo
  }));
  const bleedDetails = document.createElement('div');
  bleedDetails.dataset.conditional = 'medicalHistory.bleedingDisorder=yes';
  bleedDetails.appendChild(textInput({
    label: 'Please provide details',
    section: 'medicalHistory', field: 'bleedingDetails',
    placeholder: 'e.g. Haemophilia, von Willebrand disease'
  }));
  card.appendChild(bleedDetails);

  card.appendChild(radioGroup({
    label: 'Have you ever taken bisphosphonates (e.g. Alendronate, Zoledronic acid)?',
    section: 'medicalHistory', field: 'bisphosphonateUse', options: yesNo
  }));
  const bisphDetails = document.createElement('div');
  bisphDetails.dataset.conditional = 'medicalHistory.bisphosphonateUse=yes';
  bisphDetails.appendChild(textInput({
    label: 'Bisphosphonate details',
    section: 'medicalHistory', field: 'bisphosphonateDetails',
    placeholder: 'e.g. Drug name, duration of use'
  }));
  card.appendChild(bisphDetails);

  card.appendChild(radioGroup({
    label: 'Have you had radiation therapy to the head or neck?',
    section: 'medicalHistory', field: 'radiationTherapyHeadNeck', options: yesNo
  }));
  const radDetails = document.createElement('div');
  radDetails.dataset.conditional = 'medicalHistory.radiationTherapyHeadNeck=yes';
  radDetails.appendChild(textInput({
    label: 'Radiation therapy details',
    section: 'medicalHistory', field: 'radiationDetails',
    placeholder: 'e.g. Area treated, when completed'
  }));
  card.appendChild(radDetails);

  card.appendChild(radioGroup({
    label: 'Are you immunosuppressed?',
    section: 'medicalHistory', field: 'immunosuppression', options: yesNo
  }));
  const immunoDetails = document.createElement('div');
  immunoDetails.dataset.conditional = 'medicalHistory.immunosuppression=yes';
  immunoDetails.appendChild(textInput({
    label: 'Please provide details',
    section: 'medicalHistory', field: 'immunosuppressionDetails',
    placeholder: 'e.g. HIV, organ transplant, chemotherapy'
  }));
  card.appendChild(immunoDetails);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Current Medications',
    description: 'Medications relevant to dental treatment.'
  });

  card.appendChild(radioGroup({
    label: 'Are you taking anticoagulants (blood thinners)?',
    section: 'currentMedications', field: 'anticoagulantUse', options: yesNo
  }));
  const anticoagDetails = document.createElement('div');
  anticoagDetails.dataset.conditional = 'currentMedications.anticoagulantUse=yes';
  anticoagDetails.appendChild(textInput({
    label: 'Anticoagulant name and dose',
    section: 'currentMedications', field: 'anticoagulantType',
    placeholder: 'e.g. Warfarin 5mg, Rivaroxaban 20mg'
  }));
  card.appendChild(anticoagDetails);

  card.appendChild(radioGroup({
    label: 'Are you currently taking bisphosphonates?',
    section: 'currentMedications', field: 'bisphosphonateCurrentUse', options: yesNo
  }));
  const bisphCur = document.createElement('div');
  bisphCur.dataset.conditional = 'currentMedications.bisphosphonateCurrentUse=yes';
  bisphCur.appendChild(textInput({
    label: 'Bisphosphonate name',
    section: 'currentMedications', field: 'bisphosphonateName',
    placeholder: 'e.g. Alendronate, Risedronate'
  }));
  card.appendChild(bisphCur);

  card.appendChild(radioGroup({
    label: 'Are you taking immunosuppressant medications?',
    section: 'currentMedications', field: 'immunosuppressantUse', options: yesNo
  }));
  const immunoMed = document.createElement('div');
  immunoMed.dataset.conditional = 'currentMedications.immunosuppressantUse=yes';
  immunoMed.appendChild(textInput({
    label: 'Immunosuppressant name',
    section: 'currentMedications', field: 'immunosuppressantName',
    placeholder: 'e.g. Methotrexate, Cyclosporin'
  }));
  card.appendChild(immunoMed);

  card.appendChild(radioGroup({
    label: 'Do you have any allergies to dental anaesthetics?',
    section: 'currentMedications', field: 'allergyToAnaesthetics', options: yesNo
  }));
  const anaesAllergy = document.createElement('div');
  anaesAllergy.dataset.conditional = 'currentMedications.allergyToAnaesthetics=yes';
  anaesAllergy.appendChild(textInput({
    label: 'Anaesthetic allergy details',
    section: 'currentMedications', field: 'anaestheticAllergyDetails',
    placeholder: 'e.g. Lidocaine - rash, Articaine - swelling'
  }));
  card.appendChild(anaesAllergy);

  card.appendChild(textArea({
    label: 'Other medications',
    section: 'currentMedications', field: 'otherMedications',
    placeholder: 'List any other medications you are currently taking',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Radiographic Findings',
    description: 'X-ray and imaging results.'
  });

  card.appendChild(textArea({
    label: 'Panoramic (OPG) findings',
    section: 'radiographicFindings', field: 'panoramicFindings',
    placeholder: 'e.g. No significant findings; or describe pathology'
  }));
  card.appendChild(textArea({
    label: 'Periapical radiograph findings',
    section: 'radiographicFindings', field: 'periapicalFindings',
    placeholder: 'e.g. Periapical radiolucency at 46; widened PDL space at 36'
  }));
  card.appendChild(textArea({
    label: 'Bitewing radiograph findings',
    section: 'radiographicFindings', field: 'bitewingFindings',
    placeholder: 'e.g. Interproximal caries at 15 mesial; overhanging restoration at 26 distal'
  }));

  card.appendChild(selectInput({
    label: 'Bone loss pattern',
    section: 'radiographicFindings', field: 'boneLossPattern',
    options: [
      { value: 'none', label: 'No bone loss' },
      { value: 'horizontal', label: 'Horizontal bone loss' },
      { value: 'vertical', label: 'Vertical (angular) bone loss' },
      { value: 'combined', label: 'Combined pattern' }
    ]
  }));

  const boneLossDetails = document.createElement('div');
  boneLossDetails.dataset.conditionalAny = 'radiographicFindings.boneLossPattern=horizontal,vertical,combined';
  boneLossDetails.appendChild(textInput({
    label: 'Bone loss details',
    section: 'radiographicFindings', field: 'boneLossDetails',
    placeholder: 'e.g. Generalised horizontal bone loss, 30% in molar regions'
  }));
  card.appendChild(boneLossDetails);

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections + live DMFT banner
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

/** Build the inner HTML (no wrapper) of the live DMFT banner. */
function renderDmftBannerInner() {
  const d = state.dmftAssessment.decayedTeeth ?? 0;
  const m = state.dmftAssessment.missingTeeth ?? 0;
  const f = state.dmftAssessment.filledTeeth ?? 0;
  const score = getDMFTScore(state.dmftAssessment.decayedTeeth, state.dmftAssessment.missingTeeth, state.dmftAssessment.filledTeeth);
  const cat = getDMFTCategory(score);
  return `
    <div class="dmft-score-line">
      <strong>DMFT Score: ${score}</strong>
      <span>(${esc(dmftScoreShortLabel(cat))})</span>
    </div>
    <div class="dmft-breakdown">D = ${d} + M = ${m} + F = ${f}</div>
  `;
}

/** Refresh the live banner with the current category colour and value. */
function refreshDmftBanner() {
  const banner = document.getElementById('dmft-banner');
  if (!banner) return;
  const score = getDMFTScore(state.dmftAssessment.decayedTeeth, state.dmftAssessment.missingTeeth, state.dmftAssessment.filledTeeth);
  const cat = getDMFTCategory(score);
  banner.className = `dmft-banner ${dmftCategoryClass(cat)}`;
  banner.innerHTML = renderDmftBannerInner();
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
  ['demographics', 'emergencyContactName'],
  ['demographics', 'emergencyContactPhone'],
  // Chief complaint
  ['chiefComplaint', 'primaryConcern'],
  ['chiefComplaint', 'painSeverity'],
  // Dental history
  ['dentalHistory', 'visitFrequency'],
  ['dentalHistory', 'brushingFrequency'],
  ['dentalHistory', 'flossingFrequency'],
  ['dentalHistory', 'dentalAnxietyLevel'],
  // DMFT (3 numerics)
  ['dmftAssessment', 'decayedTeeth'],
  ['dmftAssessment', 'missingTeeth'],
  ['dmftAssessment', 'filledTeeth'],
  // Periodontal
  ['periodontalAssessment', 'gumBleeding'],
  ['periodontalAssessment', 'pocketDepthsAboveNormal'],
  ['periodontalAssessment', 'gumRecession'],
  ['periodontalAssessment', 'toothMobility'],
  ['periodontalAssessment', 'furcationInvolvement'],
  // Oral examination
  ['oralExamination', 'tmjPain'],
  ['oralExamination', 'tmjClicking'],
  ['oralExamination', 'tmjLimitedOpening'],
  ['oralExamination', 'occlusion'],
  ['oralExamination', 'oralHygieneIndex'],
  // Medical history
  ['medicalHistory', 'cardiovascularDisease'],
  ['medicalHistory', 'diabetes'],
  ['medicalHistory', 'bleedingDisorder'],
  ['medicalHistory', 'bisphosphonateUse'],
  ['medicalHistory', 'radiationTherapyHeadNeck'],
  ['medicalHistory', 'immunosuppression'],
  // Current medications
  ['currentMedications', 'anticoagulantUse'],
  ['currentMedications', 'bisphosphonateCurrentUse'],
  ['currentMedications', 'immunosuppressantUse'],
  ['currentMedications', 'allergyToAnaesthetics'],
  // Radiographic findings
  ['radiographicFindings', 'boneLossPattern']
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
  { step: 1, section: 'demographics', title: 'Demographics' },
  { step: 2, section: 'chiefComplaint', title: 'Chief Complaint' },
  { step: 3, section: 'dentalHistory', title: 'Dental History' },
  { step: 4, section: 'dmftAssessment', title: 'DMFT Assessment' },
  { step: 5, section: 'periodontalAssessment', title: 'Periodontal Assessment' },
  { step: 6, section: 'oralExamination', title: 'Oral Examination' },
  { step: 7, section: 'medicalHistory', title: 'Medical History' },
  { step: 8, section: 'currentMedications', title: 'Current Medications' },
  { step: 9, section: 'radiographicFindings', title: 'Radiographic Findings' }
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { dmftScore, dmftCategory, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td>${esc(r.system)}</td>
      <td>${esc(r.description)}</td>
      <td><span class="cat-pill cat-${esc(r.category)}">${esc(dmftScoreShortLabel(r.category) || r.category)}</span></td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No grading rules fired.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">System</th>
            <th scope="col">Finding</th>
            <th scope="col">Category</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const d = state.dmftAssessment.decayedTeeth ?? 0;
  const m = state.dmftAssessment.missingTeeth ?? 0;
  const f = state.dmftAssessment.filledTeeth ?? 0;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Dental Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>DMFT Total Score</h3>
      <p class="dmft-summary">
        <span class="dmft-score-badge ${dmftCategoryClass(dmftCategory)}">${dmftScore}</span>
        <span class="dmft-category-label">${esc(dmftCategoryLabel(dmftCategory))}</span>
      </p>
      <p class="muted">D = ${d} + M = ${m} + F = ${f}</p>

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

  const startOverBtn = document.getElementById('start-over-btn');
  if (startOverBtn) startOverBtn.addEventListener('click', startOver);
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const { dmftScore, dmftCategory, firedRules } = calculateDMFT(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    dmftScore,
    dmftCategory,
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
  refreshDmftBanner();
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshDmftBanner();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
