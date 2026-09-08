import { detectAdditionalFlags } from './flagged-issues.js';
import { bmiCategory, calculateBMI, complianceStatusClass, complianceStatusLabel, emptyAssessment, gradeLabel, riskLevelClass, riskLevelLabel } from './types.js';
import { calculateVaccinationGrade } from './vaccination-grader.js';

// Vaccinations Checklist - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure vaccination-grading engine + flagged-issue detection and
// renders an inline aria-live report. State is persisted to localStorage so
// a partial fill survives a page reload.

const TOTAL_STEPS = 10;

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'vaccinations-checklist.front-end-form-with-html.v1';

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
    console.warn('Could not parse saved checklist; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save checklist to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored checklist.', e);
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
  slug: 'vaccinations-checklist',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const reportEl = document.getElementById('report');
    if (reportEl) reportEl.innerHTML =
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

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs derived values (BMI), progress, and conditional visibility.
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
  state.demographics.bmi = calculateBMI(
    state.demographics.weight,
    state.demographics.height
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

/**
 * Build a select / dropdown input.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[] }} opts
 */
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

/**
 * Build a radio group.
 * @param {{ label: string, section: string, field: string,
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

/**
 * Read-only auto-calculated readout (e.g. BMI).
 * @param {{ label: string, id: string, render: () => string }} opts
 */
function readOnlyReadout(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field readout';
  wrapper.innerHTML = `
    <label class="label">${esc(opts.label)}</label>
    <div id="${opts.id}" class="readout-value">${opts.render()}</div>
  `;
  return wrapper;
}

/**
 * Build a section card as a Lily <fieldset class="fieldset">.
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
  legend.innerHTML = `
    <span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>
    <h2 class="section-title">${esc(opts.title)}</h2>
    ${desc}
  `;
  card.appendChild(legend);
  return card;
}

/** Visual subgroup heading inside a section. */
function subHeader(title, hint) {
  const div = document.createElement('div');
  div.className = 'list-section-header';
  div.innerHTML = `<h3>${esc(title)}</h3>${hint ? `<p class="hint">${esc(hint)}</p>` : ''}`;
  return div;
}

// ----------------------------------------------------------------------
// Common option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

// note: select for YesNoUnknown uses an explicit list including 'unknown'
const yesNoUnknownSelectOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' }
];

const severityOptions = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'anaphylaxis', label: 'Anaphylaxis' }
];

const occupationCategoryOptions = [
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'social-care', label: 'Social care' },
  { value: 'laboratory', label: 'Laboratory' },
  { value: 'travel', label: 'Travel / international work' },
  { value: 'military', label: 'Military / armed forces' },
  { value: 'other', label: 'Other' }
];

const serologyResultOptions = [
  { value: 'positive', label: 'Positive (immune)' },
  { value: 'negative', label: 'Negative (not immune)' },
  { value: 'equivocal', label: 'Equivocal' },
  { value: 'not-tested', label: 'Not tested' }
];

const serologyResultOptionsNoEquivocal = [
  { value: 'positive', label: 'Positive (immune)' },
  { value: 'negative', label: 'Negative (not immune)' },
  { value: 'not-tested', label: 'Not tested' }
];

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic patient information.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First name', section: 'demographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Date of birth',
    section: 'demographics',
    field: 'dateOfBirth',
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

  card.appendChild(textInput({ label: 'Occupation (free text)', section: 'demographics', field: 'occupation' }));
  card.appendChild(selectInput({
    label: 'Occupation category',
    section: 'demographics',
    field: 'occupationCategory',
    options: occupationCategoryOptions
  }));
  card.appendChild(textInput({ label: 'Employer', section: 'demographics', field: 'employer' }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Vaccination History',
    description: 'Source of records, prior reactions, and contraindication context.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have a vaccination record?',
    section: 'vaccinationHistory', field: 'hasVaccinationRecord', options: yesNo
  }));

  const recordSourceHost = document.createElement('div');
  recordSourceHost.dataset.conditional = 'vaccinationHistory.hasVaccinationRecord=yes';
  recordSourceHost.appendChild(selectInput({
    label: 'Source of vaccination record',
    section: 'vaccinationHistory', field: 'recordSource',
    options: [
      { value: 'red-book', label: 'Red book / Personal Child Health Record' },
      { value: 'gp-records', label: 'GP records' },
      { value: 'occupational-health', label: 'Occupational health records' },
      { value: 'self-reported', label: 'Self-reported' },
      { value: 'overseas-records', label: 'Overseas records' },
      { value: 'other', label: 'Other' }
    ]
  }));
  const recordOtherHost = document.createElement('div');
  recordOtherHost.dataset.conditional = 'vaccinationHistory.recordSource=other';
  recordOtherHost.appendChild(textInput({
    label: 'Other record source - details',
    section: 'vaccinationHistory', field: 'recordSourceOther'
  }));
  recordSourceHost.appendChild(recordOtherHost);
  card.appendChild(recordSourceHost);

  card.appendChild(radioGroup({
    label: 'Have you had any previous adverse reaction to a vaccine?',
    section: 'vaccinationHistory', field: 'previousAdverseReaction', options: yesNo
  }));
  const adverseHost = document.createElement('div');
  adverseHost.dataset.conditional = 'vaccinationHistory.previousAdverseReaction=yes';
  adverseHost.appendChild(textInput({
    label: 'Which vaccine?',
    section: 'vaccinationHistory', field: 'adverseReactionVaccine',
    placeholder: 'e.g. influenza, MMR, COVID-19'
  }));
  adverseHost.appendChild(textArea({
    label: 'Details of adverse reaction',
    section: 'vaccinationHistory', field: 'adverseReactionDetails',
    placeholder: 'Describe the reaction and its time course…',
    rows: 3
  }));
  adverseHost.appendChild(selectInput({
    label: 'Severity',
    section: 'vaccinationHistory', field: 'adverseReactionSeverity',
    options: severityOptions
  }));
  card.appendChild(adverseHost);

  card.appendChild(radioGroup({
    label: 'Are you immunocompromised?',
    section: 'vaccinationHistory', field: 'immunocompromised', options: yesNo
  }));
  const immunoHost = document.createElement('div');
  immunoHost.dataset.conditional = 'vaccinationHistory.immunocompromised=yes';
  immunoHost.appendChild(textArea({
    label: 'Immunocompromised - details',
    section: 'vaccinationHistory', field: 'immunocompromisedDetails',
    placeholder: 'e.g. cancer treatment, transplant, HIV, congenital immunodeficiency…',
    rows: 3
  }));
  card.appendChild(immunoHost);

  card.appendChild(selectInput({
    label: 'Pregnant or planning pregnancy?',
    section: 'vaccinationHistory', field: 'pregnantOrPlanning',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'not-applicable', label: 'Not applicable' }
    ]
  }));

  return card;
}

/**
 * Helper: a yes/no/unknown row plus a follow-up date input shown only when
 * the row is 'yes'. Used heavily for vaccine-status rows.
 */
function ynuWithDate(card, label, section, field, dateField) {
  card.appendChild(selectInput({
    label,
    section, field,
    options: yesNoUnknownSelectOptions
  }));
  const host = document.createElement('div');
  host.dataset.conditional = `${section}.${field}=yes`;
  host.appendChild(textInput({
    label: 'Date received',
    section, field: dateField, type: 'date'
  }));
  card.appendChild(host);
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Childhood Immunisations',
    description: 'UK Green Book routine childhood schedule.'
  });

  ynuWithDate(card, 'MMR dose 1 received?', 'childhoodImmunisations', 'mmrDose1', 'mmrDose1Date');
  ynuWithDate(card, 'MMR dose 2 received?', 'childhoodImmunisations', 'mmrDose2', 'mmrDose2Date');
  ynuWithDate(card, 'DTP primary course completed?', 'childhoodImmunisations', 'dtpPrimaryCourse', 'dtpPrimaryDate');
  ynuWithDate(card, 'DTP booster received?', 'childhoodImmunisations', 'dtpBooster', 'dtpBoosterDate');
  ynuWithDate(card, 'Polio primary course completed?', 'childhoodImmunisations', 'polioPrimaryCourse', 'polioPrimaryDate');
  ynuWithDate(card, 'Polio booster received?', 'childhoodImmunisations', 'polioBooster', 'polioBoosterDate');
  ynuWithDate(card, 'Hib (Haemophilus influenzae b) vaccine received?', 'childhoodImmunisations', 'hibVaccine', 'hibVaccineDate');
  ynuWithDate(card, 'MenC vaccine received?', 'childhoodImmunisations', 'menCVaccine', 'menCVaccineDate');
  ynuWithDate(card, 'MenACWY vaccine received?', 'childhoodImmunisations', 'menACWYVaccine', 'menACWYVaccineDate');
  ynuWithDate(card, 'PCV (pneumococcal) vaccine received?', 'childhoodImmunisations', 'pcvVaccine', 'pcvVaccineDate');

  card.appendChild(textArea({
    label: 'Notes',
    section: 'childhoodImmunisations', field: 'notes',
    placeholder: 'Anything else relevant to the childhood schedule…',
    rows: 3
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Occupational Vaccines',
    description: 'Vaccines required or recommended for occupational risk.'
  });

  card.appendChild(subHeader('Hepatitis B'));
  ynuWithDate(card, 'Hepatitis B course completed?', 'occupationalVaccines', 'hepatitisBCourse', 'hepatitisBCourseDate');
  card.appendChild(textInput({
    label: 'Doses received',
    section: 'occupationalVaccines', field: 'hepatitisBDosesReceived',
    type: 'number', min: 0, max: 10
  }));
  card.appendChild(selectInput({
    label: 'Hepatitis B antibody (anti-HBs) level',
    section: 'occupationalVaccines', field: 'hepatitisBAntiBodyLevel',
    options: [
      { value: 'adequate', label: 'Adequate (≥10 mIU/mL)' },
      { value: 'inadequate', label: 'Inadequate (<10 mIU/mL)' },
      { value: 'not-tested', label: 'Not tested' }
    ]
  }));

  card.appendChild(subHeader('BCG (tuberculosis)'));
  ynuWithDate(card, 'BCG vaccine received?', 'occupationalVaccines', 'bcgVaccine', 'bcgVaccineDate');
  card.appendChild(radioGroup({
    label: 'BCG scar present?',
    section: 'occupationalVaccines', field: 'bcgScarPresent', options: yesNo
  }));

  card.appendChild(subHeader('Varicella (chickenpox)'));
  ynuWithDate(card, 'Varicella vaccine received?', 'occupationalVaccines', 'varicellaVaccine', 'varicellaVaccineDate');
  card.appendChild(selectInput({
    label: 'Past varicella (chickenpox) infection?',
    section: 'occupationalVaccines', field: 'varicellaHistory',
    options: yesNoUnknownSelectOptions
  }));

  card.appendChild(subHeader('Other occupational vaccines'));
  ynuWithDate(card, 'Hepatitis A vaccine received?', 'occupationalVaccines', 'hepatitisAVaccine', 'hepatitisAVaccineDate');
  ynuWithDate(card, 'Typhoid vaccine received?', 'occupationalVaccines', 'typhoidVaccine', 'typhoidVaccineDate');
  ynuWithDate(card, 'Rabies vaccine received?', 'occupationalVaccines', 'rabiesVaccine', 'rabiesVaccineDate');

  card.appendChild(textArea({
    label: 'Notes',
    section: 'occupationalVaccines', field: 'notes',
    placeholder: 'Any other occupational-vaccine details…',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Travel Vaccines',
    description: 'Travel-related immunisations and prophylaxis.'
  });

  card.appendChild(radioGroup({
    label: 'Is international travel planned?',
    section: 'travelVaccines', field: 'travelPlanned', options: yesNo
  }));

  const travelHost = document.createElement('div');
  travelHost.dataset.conditional = 'travelVaccines.travelPlanned=yes';
  travelHost.appendChild(textInput({
    label: 'Destination(s)',
    section: 'travelVaccines', field: 'travelDestination',
    placeholder: 'e.g. Kenya, India, rural Brazil'
  }));
  const travelDates = document.createElement('div');
  travelDates.className = 'two-col';
  travelDates.appendChild(textInput({ label: 'Departure date', section: 'travelVaccines', field: 'travelDepartureDate', type: 'date' }));
  travelDates.appendChild(textInput({ label: 'Return date', section: 'travelVaccines', field: 'travelReturnDate', type: 'date' }));
  travelHost.appendChild(travelDates);
  card.appendChild(travelHost);

  card.appendChild(subHeader('Yellow fever'));
  ynuWithDate(card, 'Yellow fever vaccine received?', 'travelVaccines', 'yellowFeverVaccine', 'yellowFeverVaccineDate');
  card.appendChild(radioGroup({
    label: 'Yellow fever certificate held?',
    section: 'travelVaccines', field: 'yellowFeverCertificate', options: yesNo
  }));

  card.appendChild(subHeader('Other travel vaccines'));
  ynuWithDate(card, 'Japanese encephalitis vaccine received?', 'travelVaccines', 'japaneseEncephalitisVaccine', 'japaneseEncephalitisDate');
  ynuWithDate(card, 'Tick-borne encephalitis vaccine received?', 'travelVaccines', 'tickBorneEncephalitisVaccine', 'tickBorneEncephalitisDate');
  ynuWithDate(card, 'Cholera vaccine received?', 'travelVaccines', 'choleraVaccine', 'choleraVaccineDate');
  ynuWithDate(card, 'Meningococcal ACWY (travel) received?', 'travelVaccines', 'meningococcalACWYTravel', 'meningococcalACWYTravelDate');

  card.appendChild(subHeader('Malaria prophylaxis'));
  card.appendChild(selectInput({
    label: 'Malaria prophylaxis taken?',
    section: 'travelVaccines', field: 'malariaProphylaxis',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'not-required', label: 'Not required' }
    ]
  }));
  const malariaDrugHost = document.createElement('div');
  malariaDrugHost.dataset.conditional = 'travelVaccines.malariaProphylaxis=yes';
  malariaDrugHost.appendChild(selectInput({
    label: 'Prophylaxis drug',
    section: 'travelVaccines', field: 'malariaProphylaxisDrug',
    options: [
      { value: 'atovaquone-proguanil', label: 'Atovaquone/proguanil (Malarone)' },
      { value: 'doxycycline', label: 'Doxycycline' },
      { value: 'mefloquine', label: 'Mefloquine' },
      { value: 'chloroquine', label: 'Chloroquine' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(malariaDrugHost);

  card.appendChild(textArea({
    label: 'Notes',
    section: 'travelVaccines', field: 'notes',
    placeholder: 'Any other travel-related details…',
    rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'COVID-19 Vaccination',
    description: 'COVID-19 primary course, boosters, and adverse reactions.'
  });

  card.appendChild(selectInput({
    label: 'COVID-19 primary course completed?',
    section: 'covid19Vaccination', field: 'covidPrimaryCourse',
    options: yesNoUnknownSelectOptions
  }));
  const primaryHost = document.createElement('div');
  primaryHost.dataset.conditional = 'covid19Vaccination.covidPrimaryCourse=yes';
  primaryHost.appendChild(selectInput({
    label: 'Primary vaccine type',
    section: 'covid19Vaccination', field: 'covidPrimaryVaccineType',
    options: [
      { value: 'pfizer', label: 'Pfizer / BioNTech (Comirnaty)' },
      { value: 'moderna', label: 'Moderna (Spikevax)' },
      { value: 'astrazeneca', label: 'AstraZeneca (Vaxzevria)' },
      { value: 'novavax', label: 'Novavax (Nuvaxovid)' },
      { value: 'janssen', label: 'Janssen / J&J' },
      { value: 'other', label: 'Other' }
    ]
  }));
  const dosesGrid = document.createElement('div');
  dosesGrid.className = 'two-col';
  dosesGrid.appendChild(textInput({ label: 'Dose 1 date', section: 'covid19Vaccination', field: 'covidDose1Date', type: 'date' }));
  dosesGrid.appendChild(textInput({ label: 'Dose 2 date', section: 'covid19Vaccination', field: 'covidDose2Date', type: 'date' }));
  primaryHost.appendChild(dosesGrid);
  card.appendChild(primaryHost);

  card.appendChild(subHeader('Booster doses'));
  card.appendChild(radioGroup({
    label: 'Booster 1 received?',
    section: 'covid19Vaccination', field: 'covidBooster1', options: yesNo
  }));
  const b1Host = document.createElement('div');
  b1Host.dataset.conditional = 'covid19Vaccination.covidBooster1=yes';
  b1Host.appendChild(textInput({ label: 'Booster 1 date', section: 'covid19Vaccination', field: 'covidBooster1Date', type: 'date' }));
  b1Host.appendChild(selectInput({
    label: 'Booster 1 vaccine type',
    section: 'covid19Vaccination', field: 'covidBooster1Type',
    options: [
      { value: 'pfizer', label: 'Pfizer / BioNTech' },
      { value: 'moderna', label: 'Moderna' },
      { value: 'astrazeneca', label: 'AstraZeneca' },
      { value: 'novavax', label: 'Novavax' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(b1Host);

  card.appendChild(radioGroup({
    label: 'Booster 2 received?',
    section: 'covid19Vaccination', field: 'covidBooster2', options: yesNo
  }));
  const b2Host = document.createElement('div');
  b2Host.dataset.conditional = 'covid19Vaccination.covidBooster2=yes';
  b2Host.appendChild(textInput({ label: 'Booster 2 date', section: 'covid19Vaccination', field: 'covidBooster2Date', type: 'date' }));
  b2Host.appendChild(selectInput({
    label: 'Booster 2 vaccine type',
    section: 'covid19Vaccination', field: 'covidBooster2Type',
    options: [
      { value: 'pfizer', label: 'Pfizer / BioNTech' },
      { value: 'moderna', label: 'Moderna' },
      { value: 'novavax', label: 'Novavax' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(b2Host);

  card.appendChild(radioGroup({
    label: 'Autumn / seasonal booster received?',
    section: 'covid19Vaccination', field: 'covidAutumnBooster', options: yesNo
  }));
  const autumnHost = document.createElement('div');
  autumnHost.dataset.conditional = 'covid19Vaccination.covidAutumnBooster=yes';
  autumnHost.appendChild(textInput({
    label: 'Autumn booster date',
    section: 'covid19Vaccination', field: 'covidAutumnBoosterDate', type: 'date'
  }));
  card.appendChild(autumnHost);

  card.appendChild(textInput({
    label: 'Total COVID-19 doses received',
    section: 'covid19Vaccination', field: 'totalCovidDoses',
    type: 'number', min: 0, max: 20
  }));

  card.appendChild(radioGroup({
    label: 'Any adverse reaction to COVID-19 vaccine?',
    section: 'covid19Vaccination', field: 'covidAdverseReaction', options: yesNo
  }));
  const advHost = document.createElement('div');
  advHost.dataset.conditional = 'covid19Vaccination.covidAdverseReaction=yes';
  advHost.appendChild(textArea({
    label: 'Adverse reaction details',
    section: 'covid19Vaccination', field: 'covidAdverseReactionDetails',
    placeholder: 'Describe the reaction…',
    rows: 3
  }));
  card.appendChild(advHost);

  card.appendChild(textArea({
    label: 'Notes',
    section: 'covid19Vaccination', field: 'notes',
    placeholder: 'Any other COVID-19 details…',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Influenza Vaccination',
    description: 'Annual seasonal flu vaccine status and risk group.'
  });

  card.appendChild(radioGroup({
    label: 'Current-season flu vaccine received?',
    section: 'influenzaVaccination', field: 'fluVaccineCurrentSeason', options: yesNo
  }));
  const curHost = document.createElement('div');
  curHost.dataset.conditional = 'influenzaVaccination.fluVaccineCurrentSeason=yes';
  curHost.appendChild(textInput({
    label: 'Current-season flu vaccine date',
    section: 'influenzaVaccination', field: 'fluVaccineCurrentDate', type: 'date'
  }));
  curHost.appendChild(selectInput({
    label: 'Vaccine type',
    section: 'influenzaVaccination', field: 'fluVaccineType',
    options: [
      { value: 'standard', label: 'Standard inactivated' },
      { value: 'adjuvanted', label: 'Adjuvanted' },
      { value: 'cell-based', label: 'Cell-based' },
      { value: 'recombinant', label: 'Recombinant' },
      { value: 'nasal-spray', label: 'Nasal spray (live attenuated)' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(curHost);

  card.appendChild(selectInput({
    label: 'Previous-season flu vaccine received?',
    section: 'influenzaVaccination', field: 'fluVaccinePreviousSeason',
    options: yesNoUnknownSelectOptions
  }));
  card.appendChild(radioGroup({
    label: 'Annual flu vaccine recipient?',
    section: 'influenzaVaccination', field: 'fluVaccineAnnualRecipient', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'In a flu high-risk group?',
    section: 'influenzaVaccination', field: 'fluHighRiskGroup', options: yesNo
  }));
  const riskHost = document.createElement('div');
  riskHost.dataset.conditional = 'influenzaVaccination.fluHighRiskGroup=yes';
  riskHost.appendChild(selectInput({
    label: 'High-risk reason',
    section: 'influenzaVaccination', field: 'fluHighRiskReason',
    options: [
      { value: 'age-65-plus', label: 'Age 65+' },
      { value: 'chronic-respiratory', label: 'Chronic respiratory disease' },
      { value: 'chronic-heart', label: 'Chronic heart disease' },
      { value: 'chronic-kidney', label: 'Chronic kidney disease' },
      { value: 'chronic-liver', label: 'Chronic liver disease' },
      { value: 'diabetes', label: 'Diabetes' },
      { value: 'immunosuppressed', label: 'Immunosuppressed' },
      { value: 'pregnant', label: 'Pregnant' },
      { value: 'healthcare-worker', label: 'Healthcare worker' },
      { value: 'carer', label: 'Carer' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(riskHost);

  card.appendChild(radioGroup({
    label: 'Adverse reaction to flu vaccine?',
    section: 'influenzaVaccination', field: 'fluAdverseReaction', options: yesNo
  }));
  const fluAdvHost = document.createElement('div');
  fluAdvHost.dataset.conditional = 'influenzaVaccination.fluAdverseReaction=yes';
  fluAdvHost.appendChild(textArea({
    label: 'Adverse reaction details',
    section: 'influenzaVaccination', field: 'fluAdverseReactionDetails',
    placeholder: 'Describe the reaction…',
    rows: 3
  }));
  card.appendChild(fluAdvHost);

  card.appendChild(textArea({
    label: 'Notes',
    section: 'influenzaVaccination', field: 'notes',
    placeholder: 'Any other influenza-related details…',
    rows: 3
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Contraindications & Allergies',
    description: 'Allergies, contraindications, and concomitant therapies that may affect vaccine choice.'
  });

  card.appendChild(radioGroup({
    label: 'Egg allergy?',
    section: 'contraindicationsAllergies', field: 'eggAllergy', options: yesNo
  }));
  const eggHost = document.createElement('div');
  eggHost.dataset.conditional = 'contraindicationsAllergies.eggAllergy=yes';
  eggHost.appendChild(selectInput({
    label: 'Egg allergy severity',
    section: 'contraindicationsAllergies', field: 'eggAllergySeverity',
    options: severityOptions
  }));
  card.appendChild(eggHost);

  card.appendChild(radioGroup({ label: 'Gelatin allergy?', section: 'contraindicationsAllergies', field: 'gelatinAllergy', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Neomycin allergy?', section: 'contraindicationsAllergies', field: 'neomycinAllergy', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Latex allergy?', section: 'contraindicationsAllergies', field: 'latexAllergy', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Yeast allergy?', section: 'contraindicationsAllergies', field: 'yeastAllergy', options: yesNo }));
  card.appendChild(radioGroup({ label: 'PEG / polysorbate allergy?', section: 'contraindicationsAllergies', field: 'pegPolysorbateAllergy', options: yesNo }));

  card.appendChild(textArea({
    label: 'Other vaccine-related allergies',
    section: 'contraindicationsAllergies', field: 'otherVaccineAllergies',
    placeholder: 'List any other relevant allergies…',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'History of Guillain-Barré Syndrome (GBS)?',
    section: 'contraindicationsAllergies', field: 'historyOfGBS', options: yesNo
  }));
  const gbsHost = document.createElement('div');
  gbsHost.dataset.conditional = 'contraindicationsAllergies.historyOfGBS=yes';
  gbsHost.appendChild(textArea({
    label: 'GBS - details',
    section: 'contraindicationsAllergies', field: 'gbsDetails',
    placeholder: 'When and triggering event if known…',
    rows: 3
  }));
  card.appendChild(gbsHost);

  card.appendChild(radioGroup({
    label: 'Currently on immunosuppressants?',
    section: 'contraindicationsAllergies', field: 'onImmunosuppressants', options: yesNo
  }));
  const immsHost = document.createElement('div');
  immsHost.dataset.conditional = 'contraindicationsAllergies.onImmunosuppressants=yes';
  immsHost.appendChild(textArea({
    label: 'Immunosuppressant - details',
    section: 'contraindicationsAllergies', field: 'immunosuppressantDetails',
    placeholder: 'Drug, dose, indication…',
    rows: 3
  }));
  card.appendChild(immsHost);

  card.appendChild(radioGroup({
    label: 'Recent blood products (immunoglobulin, transfusion)?',
    section: 'contraindicationsAllergies', field: 'onBloodProductsRecent', options: yesNo
  }));
  const bpHost = document.createElement('div');
  bpHost.dataset.conditional = 'contraindicationsAllergies.onBloodProductsRecent=yes';
  bpHost.appendChild(textArea({
    label: 'Blood products - details',
    section: 'contraindicationsAllergies', field: 'bloodProductsDetails',
    placeholder: 'Type, date, indication…',
    rows: 3
  }));
  card.appendChild(bpHost);

  card.appendChild(radioGroup({
    label: 'Live vaccines contraindicated?',
    section: 'contraindicationsAllergies', field: 'liveVaccineContraindicated', options: yesNo
  }));
  const liveHost = document.createElement('div');
  liveHost.dataset.conditional = 'contraindicationsAllergies.liveVaccineContraindicated=yes';
  liveHost.appendChild(textArea({
    label: 'Reason live vaccines contraindicated',
    section: 'contraindicationsAllergies', field: 'liveVaccineContraindicationReason',
    rows: 3
  }));
  card.appendChild(liveHost);

  card.appendChild(textArea({
    label: 'Notes',
    section: 'contraindicationsAllergies', field: 'notes',
    placeholder: 'Any other contraindication / allergy details…',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Serology & Immunity Testing',
    description: 'Laboratory evidence of immunity (IgG, antibody levels, IGRA, Mantoux).'
  });

  card.appendChild(subHeader('Hepatitis B'));
  card.appendChild(selectInput({
    label: 'Hepatitis B surface antibody (anti-HBs)',
    section: 'serologyImmunityTesting', field: 'hepBSurfaceAntibody',
    options: serologyResultOptionsNoEquivocal
  }));
  card.appendChild(textInput({
    label: 'Anti-HBs level',
    section: 'serologyImmunityTesting', field: 'hepBSurfaceAntibodyLevel',
    type: 'number', min: 0, max: 100000, unit: 'mIU/mL'
  }));
  card.appendChild(textInput({
    label: 'Test date',
    section: 'serologyImmunityTesting', field: 'hepBSurfaceAntibodyDate',
    type: 'date'
  }));

  card.appendChild(subHeader('Varicella IgG'));
  card.appendChild(selectInput({
    label: 'Varicella IgG result',
    section: 'serologyImmunityTesting', field: 'varicellaIgG',
    options: serologyResultOptions
  }));
  card.appendChild(textInput({ label: 'Test date', section: 'serologyImmunityTesting', field: 'varicellaIgGDate', type: 'date' }));

  card.appendChild(subHeader('Measles IgG'));
  card.appendChild(selectInput({
    label: 'Measles IgG result',
    section: 'serologyImmunityTesting', field: 'measlesIgG',
    options: serologyResultOptions
  }));
  card.appendChild(textInput({ label: 'Test date', section: 'serologyImmunityTesting', field: 'measlesIgGDate', type: 'date' }));

  card.appendChild(subHeader('Rubella IgG'));
  card.appendChild(selectInput({
    label: 'Rubella IgG result',
    section: 'serologyImmunityTesting', field: 'rubellaIgG',
    options: serologyResultOptions
  }));
  card.appendChild(textInput({ label: 'Test date', section: 'serologyImmunityTesting', field: 'rubellaIgGDate', type: 'date' }));

  card.appendChild(subHeader('Mumps IgG'));
  card.appendChild(selectInput({
    label: 'Mumps IgG result',
    section: 'serologyImmunityTesting', field: 'mumpsIgG',
    options: serologyResultOptions
  }));
  card.appendChild(textInput({ label: 'Test date', section: 'serologyImmunityTesting', field: 'mumpsIgGDate', type: 'date' }));

  card.appendChild(subHeader('Hepatitis A IgG'));
  card.appendChild(selectInput({
    label: 'Hepatitis A IgG result',
    section: 'serologyImmunityTesting', field: 'hepAIgG',
    options: serologyResultOptionsNoEquivocal
  }));
  card.appendChild(textInput({ label: 'Test date', section: 'serologyImmunityTesting', field: 'hepAIgGDate', type: 'date' }));

  card.appendChild(subHeader('Tetanus antibody'));
  card.appendChild(selectInput({
    label: 'Tetanus antibody result',
    section: 'serologyImmunityTesting', field: 'tetanusAntibody',
    options: serologyResultOptionsNoEquivocal
  }));
  card.appendChild(textInput({ label: 'Test date', section: 'serologyImmunityTesting', field: 'tetanusAntibodyDate', type: 'date' }));

  card.appendChild(subHeader('TB testing'));
  card.appendChild(selectInput({
    label: 'TB IGRA result',
    section: 'serologyImmunityTesting', field: 'tbIGRAResult',
    options: [
      { value: 'positive', label: 'Positive' },
      { value: 'negative', label: 'Negative' },
      { value: 'indeterminate', label: 'Indeterminate' },
      { value: 'not-tested', label: 'Not tested' }
    ]
  }));
  card.appendChild(textInput({ label: 'IGRA date', section: 'serologyImmunityTesting', field: 'tbIGRADate', type: 'date' }));
  card.appendChild(selectInput({
    label: 'Mantoux (tuberculin) result',
    section: 'serologyImmunityTesting', field: 'mantouxResult',
    options: serologyResultOptionsNoEquivocal
  }));
  card.appendChild(textInput({
    label: 'Mantoux induration',
    section: 'serologyImmunityTesting', field: 'mantouxIndurationMm',
    type: 'number', min: 0, max: 100, unit: 'mm'
  }));

  card.appendChild(textArea({
    label: 'Notes',
    section: 'serologyImmunityTesting', field: 'notes',
    placeholder: 'Any other serology details…',
    rows: 3
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Schedule & Compliance',
    description: 'Catch-up plan, occupational-health clearance, exposure incidents, and consent.'
  });

  card.appendChild(selectInput({
    label: 'Current compliance status (optional self-rating)',
    section: 'scheduleCompliance', field: 'complianceStatus',
    options: [
      { value: 'fully-immunised', label: 'Fully immunised' },
      { value: 'partially-immunised', label: 'Partially immunised' },
      { value: 'non-compliant', label: 'Non-compliant' },
      { value: 'contraindicated', label: 'Contraindicated' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Vaccines due soon',
    section: 'scheduleCompliance', field: 'vaccinesDue',
    placeholder: 'List vaccines that are due in the coming weeks…',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Vaccines overdue',
    section: 'scheduleCompliance', field: 'vaccinesOverdue',
    placeholder: 'List any overdue vaccines…',
    rows: 2
  }));

  card.appendChild(radioGroup({
    label: 'Catch-up plan required?',
    section: 'scheduleCompliance', field: 'catchUpPlanRequired', options: yesNo
  }));
  const catchHost = document.createElement('div');
  catchHost.dataset.conditional = 'scheduleCompliance.catchUpPlanRequired=yes';
  catchHost.appendChild(textArea({
    label: 'Catch-up plan details',
    section: 'scheduleCompliance', field: 'catchUpPlanDetails',
    placeholder: 'Describe the catch-up schedule…',
    rows: 3
  }));
  card.appendChild(catchHost);

  const nextGrid = document.createElement('div');
  nextGrid.className = 'two-col';
  nextGrid.appendChild(textInput({
    label: 'Next vaccination date',
    section: 'scheduleCompliance', field: 'nextVaccinationDate', type: 'date'
  }));
  nextGrid.appendChild(textInput({
    label: 'Next vaccination type',
    section: 'scheduleCompliance', field: 'nextVaccinationType',
    placeholder: 'e.g. MMR, COVID booster'
  }));
  card.appendChild(nextGrid);

  card.appendChild(selectInput({
    label: 'Occupational health clearance',
    section: 'scheduleCompliance', field: 'occupationalHealthClearance',
    options: [
      { value: 'yes', label: 'Yes - granted' },
      { value: 'no', label: 'No - not granted' },
      { value: 'pending', label: 'Pending' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Clearance date',
    section: 'scheduleCompliance', field: 'occupationalHealthClearanceDate', type: 'date'
  }));

  card.appendChild(selectInput({
    label: 'Exposure risk level',
    section: 'scheduleCompliance', field: 'exposureRiskLevel',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Active exposure incident currently?',
    section: 'scheduleCompliance', field: 'activeExposureIncident', options: yesNo
  }));
  const expHost = document.createElement('div');
  expHost.dataset.conditional = 'scheduleCompliance.activeExposureIncident=yes';
  expHost.appendChild(textArea({
    label: 'Exposure incident details',
    section: 'scheduleCompliance', field: 'activeExposureDetails',
    placeholder: 'Describe the exposure (pathogen, route, date)…',
    rows: 3
  }));
  card.appendChild(expHost);

  card.appendChild(radioGroup({
    label: 'Consent for vaccination?',
    section: 'scheduleCompliance', field: 'consentForVaccination', options: yesNo
  }));
  card.appendChild(textInput({
    label: 'Consent date',
    section: 'scheduleCompliance', field: 'consentDate', type: 'date'
  }));

  card.appendChild(textArea({
    label: 'Notes',
    section: 'scheduleCompliance', field: 'notes',
    placeholder: 'Any other compliance / scheduling details…',
    rows: 3
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
    const v = state.demographics.bmi;
    bmi.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}</strong> <span class="muted">(${esc(bmiCategory(v))})</span>`;
  }
}

// ----------------------------------------------------------------------
// Progress + step list
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'occupationCategory'],
  // Vaccination history
  ['vaccinationHistory', 'hasVaccinationRecord'],
  ['vaccinationHistory', 'previousAdverseReaction'],
  ['vaccinationHistory', 'immunocompromised'],
  ['vaccinationHistory', 'pregnantOrPlanning'],
  // Childhood
  ['childhoodImmunisations', 'mmrDose1'],
  ['childhoodImmunisations', 'mmrDose2'],
  ['childhoodImmunisations', 'dtpPrimaryCourse'],
  ['childhoodImmunisations', 'dtpBooster'],
  ['childhoodImmunisations', 'polioPrimaryCourse'],
  ['childhoodImmunisations', 'polioBooster'],
  // Occupational
  ['occupationalVaccines', 'hepatitisBCourse'],
  ['occupationalVaccines', 'hepatitisBAntiBodyLevel'],
  ['occupationalVaccines', 'bcgVaccine'],
  ['occupationalVaccines', 'varicellaVaccine'],
  ['occupationalVaccines', 'varicellaHistory'],
  // Travel
  ['travelVaccines', 'travelPlanned'],
  // COVID
  ['covid19Vaccination', 'covidPrimaryCourse'],
  ['covid19Vaccination', 'covidBooster1'],
  ['covid19Vaccination', 'covidAdverseReaction'],
  // Flu
  ['influenzaVaccination', 'fluVaccineCurrentSeason'],
  ['influenzaVaccination', 'fluHighRiskGroup'],
  // Contraindications
  ['contraindicationsAllergies', 'eggAllergy'],
  ['contraindicationsAllergies', 'pegPolysorbateAllergy'],
  ['contraindicationsAllergies', 'historyOfGBS'],
  ['contraindicationsAllergies', 'onImmunosuppressants'],
  ['contraindicationsAllergies', 'onBloodProductsRecent'],
  ['contraindicationsAllergies', 'liveVaccineContraindicated'],
  // Serology
  ['serologyImmunityTesting', 'hepBSurfaceAntibody'],
  ['serologyImmunityTesting', 'varicellaIgG'],
  ['serologyImmunityTesting', 'measlesIgG'],
  ['serologyImmunityTesting', 'rubellaIgG'],
  ['serologyImmunityTesting', 'tbIGRAResult'],
  // Compliance
  ['scheduleCompliance', 'occupationalHealthClearance'],
  ['scheduleCompliance', 'activeExposureIncident'],
  ['scheduleCompliance', 'consentForVaccination']
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
  { step: 1,  section: 'demographics',              title: 'Demographics' },
  { step: 2,  section: 'vaccinationHistory',        title: 'Vaccination History' },
  { step: 3,  section: 'childhoodImmunisations',    title: 'Childhood Immunisations' },
  { step: 4,  section: 'occupationalVaccines',      title: 'Occupational Vaccines' },
  { step: 5,  section: 'travelVaccines',            title: 'Travel Vaccines' },
  { step: 6,  section: 'covid19Vaccination',        title: 'COVID-19 Vaccination' },
  { step: 7,  section: 'influenzaVaccination',      title: 'Influenza Vaccination' },
  { step: 8,  section: 'contraindicationsAllergies', title: 'Contraindications & Allergies' },
  { step: 9,  section: 'serologyImmunityTesting',   title: 'Serology & Immunity' },
  { step: 10, section: 'scheduleCompliance',        title: 'Schedule & Compliance' }
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
  if (typeof summary.focus === 'function') {
    try { summary.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
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

function gradeClass(grade) {
  if (grade >= 4) return 'grade-4';
  if (grade >= 3) return 'grade-3';
  if (grade >= 2) return 'grade-2';
  return 'grade-1';
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    complianceStatus,
    overallRisk,
    childhoodComplete,
    occupationalComplete,
    covidComplete,
    fluCurrent,
    firedRules,
    additionalFlags,
    missingVaccinations,
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
      <td class="num"><span class="grade-pill ${gradeClass(r.grade)}">${esc(gradeLabel(r.grade))}</span></td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No compliance issues identified.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Issue</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const missingList = missingVaccinations.length === 0
    ? `<p class="muted">No outstanding vaccinations identified from the answers given.</p>`
    : `<ul class="missing-list">${missingVaccinations.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>`;

  const summaryRows = [
    ['Childhood schedule complete', childhoodComplete],
    ['Occupational vaccines complete', occupationalComplete],
    ['COVID-19 primary course complete', covidComplete],
    ['Current-season flu vaccine received', fluCurrent]
  ].map(([label, ok]) => `
    <li class="${ok ? 'summary-yes' : 'summary-no'}">
      <span class="summary-icon" aria-hidden="true">${ok ? '✓' : '✗'}</span>
      <span>${esc(label)}</span>
    </li>
  `).join('');

  out.innerHTML = `
    <h2>Vaccinations Checklist Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Compliance status</h3>
    <p class="compliance-summary">
      <span class="compliance-badge ${complianceStatusClass(complianceStatus)}">
        ${esc(complianceStatusLabel(complianceStatus))}
      </span>
      <span class="risk-badge ${riskLevelClass(overallRisk)}">
        ${esc(riskLevelLabel(overallRisk))}
      </span>
    </p>

    <h3>Schedule summary</h3>
    <ul class="schedule-summary">
      ${summaryRows}
    </ul>

    <h3>Outstanding vaccinations</h3>
    ${missingList}

    <h3>Compliance issues</h3>
    ${firedTable}

    <h3>Flagged issues</h3>
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
  // The full grader runs both the rule set and the flagged-issues
  // detector and returns everything the report needs in a single pass.
  lastResult = calculateVaccinationGrade(state);
  renderReport();
}

function startOver() {
  if (!confirm('Are you sure? This will clear all answers and start a fresh checklist.')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const reportEl = document.getElementById('report');
  if (reportEl) reportEl.innerHTML =
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
