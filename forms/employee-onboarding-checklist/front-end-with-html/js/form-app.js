import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateOnboardingGrade, countCompletedItems } from './onboarding-grader.js';
import { completionStatusClass, completionStatusLabel, emptyAssessment, gradeClass, gradeLabel, riskLevelClass, riskLevelLabel } from './types.js';

// Employee Onboarding Checklist — HR / line-manager wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress bar + step list reflects how many fields have been answered.
// Submission runs the pure onboarding-grading engine and renders an inline
// report. State is persisted to localStorage so a partial fill survives a
// reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'employee-onboarding-checklist.front-end-form-with-html.v1';
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

/** @type {import('./types.js').AssessmentData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'employee-onboarding-checklist',
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs progress + conditional visibility after each change.
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
// Component builders (Lily class contract)
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
    if (type === 'number') v = v === '' ? null : Number(v);
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

/** Convenience: standard yes/no radio group. */
const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

/**
 * Build a section card as a Lily fieldset with fieldset-legend.
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

/** A subheader inside a section. */
function subheader(text) {
  const h = document.createElement('h3');
  h.className = 'section-subheader';
  h.textContent = text;
  return h;
}

/** Wrap a single child in a `<div data-conditional="...">` host. */
function conditional(expr, child) {
  const host = document.createElement('div');
  host.dataset.conditional = expr;
  host.appendChild(child);
  return host;
}

// ----------------------------------------------------------------------
// Section renderers (one per step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic employee information and emergency contact.'
  });

  const nameRow = document.createElement('div');
  nameRow.className = 'two-col';
  nameRow.appendChild(textInput({
    label: 'First name', section: 'demographics', field: 'firstName', required: true
  }));
  nameRow.appendChild(textInput({
    label: 'Last name', section: 'demographics', field: 'lastName', required: true
  }));
  card.appendChild(nameRow);

  const dobRow = document.createElement('div');
  dobRow.className = 'two-col';
  dobRow.appendChild(textInput({
    label: 'Date of birth', section: 'demographics', field: 'dateOfBirth', type: 'date'
  }));
  dobRow.appendChild(textInput({
    label: 'Start date', section: 'demographics', field: 'startDate', type: 'date'
  }));
  card.appendChild(dobRow);

  const contactRow = document.createElement('div');
  contactRow.className = 'two-col';
  contactRow.appendChild(textInput({
    label: 'Email', section: 'demographics', field: 'email', type: 'email',
    placeholder: 'name@example.org'
  }));
  contactRow.appendChild(textInput({
    label: 'Phone', section: 'demographics', field: 'phone', type: 'tel'
  }));
  card.appendChild(contactRow);

  const jobRow = document.createElement('div');
  jobRow.className = 'two-col';
  jobRow.appendChild(textInput({
    label: 'Job title', section: 'demographics', field: 'jobTitle',
    placeholder: 'e.g. Staff Nurse'
  }));
  jobRow.appendChild(textInput({
    label: 'Department', section: 'demographics', field: 'department',
    placeholder: 'e.g. Cardiology'
  }));
  card.appendChild(jobRow);

  card.appendChild(subheader('Emergency contact'));

  const ecRow = document.createElement('div');
  ecRow.className = 'two-col';
  ecRow.appendChild(textInput({
    label: 'Emergency contact name',
    section: 'demographics', field: 'emergencyContactName'
  }));
  ecRow.appendChild(textInput({
    label: 'Emergency contact phone',
    section: 'demographics', field: 'emergencyContactPhone', type: 'tel'
  }));
  card.appendChild(ecRow);

  card.appendChild(textInput({
    label: 'Emergency contact relationship',
    section: 'demographics', field: 'emergencyContactRelationship',
    placeholder: 'e.g. spouse, parent, sibling'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Pre-Employment Checks',
    description: 'DBS, right to work, references, and identity verification.'
  });

  card.appendChild(subheader('DBS check'));
  card.appendChild(selectInput({
    label: 'DBS check status',
    section: 'preEmploymentChecks', field: 'dbsCheckStatus',
    options: [
      { value: 'not-started', label: 'Not started' },
      { value: 'applied', label: 'Applied' },
      { value: 'received', label: 'Received (under review)' },
      { value: 'cleared', label: 'Cleared' }
    ]
  }));
  const dbsDetails = document.createElement('div');
  dbsDetails.dataset.conditional = 'preEmploymentChecks.dbsCheckStatus=cleared';
  dbsDetails.appendChild(textInput({
    label: 'DBS certificate number',
    section: 'preEmploymentChecks', field: 'dbsCertificateNumber'
  }));
  dbsDetails.appendChild(textInput({
    label: 'DBS check date',
    section: 'preEmploymentChecks', field: 'dbsCheckDate', type: 'date'
  }));
  dbsDetails.appendChild(radioGroup({
    label: 'Registered with DBS Update Service?',
    section: 'preEmploymentChecks', field: 'dbsUpdateServiceRegistered',
    options: yesNo
  }));
  card.appendChild(dbsDetails);

  card.appendChild(subheader('Right to work'));
  card.appendChild(radioGroup({
    label: 'Right to work verified?',
    section: 'preEmploymentChecks', field: 'rightToWorkVerified', options: yesNo
  }));
  const rtwDetails = document.createElement('div');
  rtwDetails.dataset.conditional = 'preEmploymentChecks.rightToWorkVerified=yes';
  rtwDetails.appendChild(textInput({
    label: 'Right to work document type',
    section: 'preEmploymentChecks', field: 'rightToWorkDocumentType',
    placeholder: 'e.g. UK passport, BRP, share code'
  }));
  rtwDetails.appendChild(textInput({
    label: 'Document expiry date (if applicable)',
    section: 'preEmploymentChecks', field: 'rightToWorkExpiryDate', type: 'date'
  }));
  card.appendChild(rtwDetails);

  card.appendChild(subheader('References'));
  const refRow = document.createElement('div');
  refRow.className = 'two-col';
  refRow.appendChild(textInput({
    label: 'References received',
    section: 'preEmploymentChecks', field: 'referencesReceived',
    type: 'number', min: 0, max: 20
  }));
  refRow.appendChild(textInput({
    label: 'References required',
    section: 'preEmploymentChecks', field: 'referencesRequired',
    type: 'number', min: 0, max: 20
  }));
  card.appendChild(refRow);
  card.appendChild(radioGroup({
    label: 'References satisfactory?',
    section: 'preEmploymentChecks', field: 'referencesSatisfactory', options: yesNo
  }));

  card.appendChild(subheader('Identity'));
  card.appendChild(radioGroup({
    label: 'Identity verified (in person, original documents)?',
    section: 'preEmploymentChecks', field: 'identityVerified', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Pre-employment notes',
    section: 'preEmploymentChecks', field: 'preEmploymentNotes',
    placeholder: 'Any notes about pre-employment checks…',
    rows: 3
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Occupational Health',
    description: 'Health questionnaire, clearance, immunisations, and fitness to work.'
  });

  card.appendChild(radioGroup({
    label: 'Occupational health questionnaire submitted?',
    section: 'occupationalHealth', field: 'ohQuestionnaireSubmitted', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Occupational health clearance received?',
    section: 'occupationalHealth', field: 'ohClearanceReceived', options: yesNo
  }));
  const ohDate = document.createElement('div');
  ohDate.dataset.conditional = 'occupationalHealth.ohClearanceReceived=yes';
  ohDate.appendChild(textInput({
    label: 'OH clearance date',
    section: 'occupationalHealth', field: 'ohClearanceDate', type: 'date'
  }));
  card.appendChild(ohDate);

  card.appendChild(radioGroup({
    label: 'Are there any occupational health restrictions?',
    section: 'occupationalHealth', field: 'ohRestrictions', options: yesNo
  }));
  const ohRest = document.createElement('div');
  ohRest.dataset.conditional = 'occupationalHealth.ohRestrictions=yes';
  ohRest.appendChild(textArea({
    label: 'Restriction details',
    section: 'occupationalHealth', field: 'ohRestrictionDetails',
    placeholder: 'Describe any restrictions (e.g. no manual handling, latex avoidance)…',
    rows: 3
  }));
  card.appendChild(ohRest);

  card.appendChild(selectInput({
    label: 'Hepatitis B status',
    section: 'occupationalHealth', field: 'hepatitisBStatus',
    options: [
      { value: 'immune', label: 'Immune' },
      { value: 'non-immune', label: 'Non-immune' },
      { value: 'vaccinating', label: 'Vaccinating (course in progress)' },
      { value: 'declined', label: 'Declined' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'TB screening status',
    section: 'occupationalHealth', field: 'tbScreeningStatus',
    options: [
      { value: 'not-required', label: 'Not required' },
      { value: 'required', label: 'Required (not yet done)' },
      { value: 'completed', label: 'Completed' },
      { value: 'referred', label: 'Referred for further investigation' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Overall immunisation status',
    section: 'occupationalHealth', field: 'immunisationStatus',
    options: [
      { value: 'complete', label: 'Complete' },
      { value: 'in-progress', label: 'In progress' },
      { value: 'incomplete', label: 'Incomplete' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Fit to work?',
    section: 'occupationalHealth', field: 'fitToWork', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Occupational health notes',
    section: 'occupationalHealth', field: 'occupationalHealthNotes',
    placeholder: 'Any additional OH notes…',
    rows: 3
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Mandatory Training',
    description: 'Statutory and mandatory training modules — Core Skills Training Framework.'
  });

  function trainingItem(label, section, completedField, dateField) {
    card.appendChild(radioGroup({
      label: `${label} completed?`,
      section: 'mandatoryTraining', field: completedField, options: yesNo
    }));
    if (dateField) {
      const host = document.createElement('div');
      host.dataset.conditional = `mandatoryTraining.${completedField}=yes`;
      host.appendChild(textInput({
        label: `${label} — completion date`,
        section: 'mandatoryTraining', field: dateField, type: 'date'
      }));
      card.appendChild(host);
    }
  }

  trainingItem('Fire safety', 'mandatoryTraining', 'fireSafetyCompleted', 'fireSafetyDate');
  trainingItem('Manual handling', 'mandatoryTraining', 'manualHandlingCompleted', 'manualHandlingDate');
  trainingItem('Infection prevention & control', 'mandatoryTraining', 'infectionControlCompleted', 'infectionControlDate');

  card.appendChild(radioGroup({
    label: 'Safeguarding adults completed?',
    section: 'mandatoryTraining', field: 'safeguardingAdultsCompleted', options: yesNo
  }));
  const sgaLevel = document.createElement('div');
  sgaLevel.dataset.conditional = 'mandatoryTraining.safeguardingAdultsCompleted=yes';
  sgaLevel.appendChild(selectInput({
    label: 'Safeguarding adults level',
    section: 'mandatoryTraining', field: 'safeguardingAdultsLevel',
    options: [
      { value: 'level-1', label: 'Level 1' },
      { value: 'level-2', label: 'Level 2' },
      { value: 'level-3', label: 'Level 3' }
    ]
  }));
  card.appendChild(sgaLevel);

  card.appendChild(radioGroup({
    label: 'Safeguarding children completed?',
    section: 'mandatoryTraining', field: 'safeguardingChildrenCompleted', options: yesNo
  }));
  const sgcLevel = document.createElement('div');
  sgcLevel.dataset.conditional = 'mandatoryTraining.safeguardingChildrenCompleted=yes';
  sgcLevel.appendChild(selectInput({
    label: 'Safeguarding children level',
    section: 'mandatoryTraining', field: 'safeguardingChildrenLevel',
    options: [
      { value: 'level-1', label: 'Level 1' },
      { value: 'level-2', label: 'Level 2' },
      { value: 'level-3', label: 'Level 3' }
    ]
  }));
  card.appendChild(sgcLevel);

  trainingItem('Information governance', 'mandatoryTraining', 'informationGovernanceCompleted', 'informationGovernanceDate');
  trainingItem('Basic life support', 'mandatoryTraining', 'basicLifeSupportCompleted', 'basicLifeSupportDate');

  card.appendChild(radioGroup({
    label: 'Equality & diversity completed?',
    section: 'mandatoryTraining', field: 'equalityDiversityCompleted', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Health & safety completed?',
    section: 'mandatoryTraining', field: 'healthSafetyCompleted', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Conflict resolution completed?',
    section: 'mandatoryTraining', field: 'conflictResolutionCompleted', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Mandatory training notes',
    section: 'mandatoryTraining', field: 'mandatoryTrainingNotes',
    placeholder: 'Any notes about training (e.g. exemptions, refreshers planned)…',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Professional Registration',
    description: 'Regulatory body registration and indemnity (e.g. NMC, GMC, HCPC).'
  });

  card.appendChild(radioGroup({
    label: 'Is professional registration required for this role?',
    section: 'professionalRegistration', field: 'registrationRequired', options: yesNo
  }));

  const regHost = document.createElement('div');
  regHost.dataset.conditional = 'professionalRegistration.registrationRequired=yes';

  regHost.appendChild(selectInput({
    label: 'Regulatory body',
    section: 'professionalRegistration', field: 'regulatoryBody',
    options: [
      { value: 'nmc', label: 'NMC (Nursing & Midwifery Council)' },
      { value: 'gmc', label: 'GMC (General Medical Council)' },
      { value: 'hcpc', label: 'HCPC (Health & Care Professions Council)' },
      { value: 'gdc', label: 'GDC (General Dental Council)' },
      { value: 'gphc', label: 'GPhC (General Pharmaceutical Council)' },
      { value: 'other', label: 'Other' }
    ]
  }));
  const otherBody = document.createElement('div');
  otherBody.dataset.conditional = 'professionalRegistration.regulatoryBody=other';
  otherBody.appendChild(textInput({
    label: 'Other regulatory body',
    section: 'professionalRegistration', field: 'regulatoryBodyOther'
  }));
  regHost.appendChild(otherBody);

  regHost.appendChild(textInput({
    label: 'Registration / PIN number',
    section: 'professionalRegistration', field: 'registrationNumber'
  }));
  regHost.appendChild(radioGroup({
    label: 'Registration verified with regulator?',
    section: 'professionalRegistration', field: 'registrationVerified', options: yesNo
  }));
  regHost.appendChild(textInput({
    label: 'Registration expiry date',
    section: 'professionalRegistration', field: 'registrationExpiryDate', type: 'date'
  }));

  regHost.appendChild(radioGroup({
    label: 'Are there any conditions or restrictions on registration?',
    section: 'professionalRegistration', field: 'registrationConditions', options: yesNo
  }));
  const condDetails = document.createElement('div');
  condDetails.dataset.conditional = 'professionalRegistration.registrationConditions=yes';
  condDetails.appendChild(textArea({
    label: 'Condition details',
    section: 'professionalRegistration', field: 'registrationConditionDetails',
    placeholder: 'Describe the conditions or restrictions…',
    rows: 3
  }));
  regHost.appendChild(condDetails);

  regHost.appendChild(textInput({
    label: 'Next revalidation date',
    section: 'professionalRegistration', field: 'revalidationDate', type: 'date'
  }));

  regHost.appendChild(selectInput({
    label: 'Indemnity insurance in place?',
    section: 'professionalRegistration', field: 'indemnityInsurance',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'na', label: 'Not applicable' }
    ]
  }));

  card.appendChild(regHost);

  card.appendChild(textArea({
    label: 'Professional registration notes',
    section: 'professionalRegistration', field: 'professionalRegistrationNotes',
    placeholder: 'Any notes about registration…',
    rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'IT Systems & Access',
    description: 'NHS smartcard, email, network login, clinical systems.'
  });

  card.appendChild(radioGroup({
    label: 'NHS smartcard issued?',
    section: 'itSystemsAccess', field: 'nhsSmartcardIssued', options: yesNo
  }));
  const cardNum = document.createElement('div');
  cardNum.dataset.conditional = 'itSystemsAccess.nhsSmartcardIssued=yes';
  cardNum.appendChild(textInput({
    label: 'NHS smartcard number',
    section: 'itSystemsAccess', field: 'nhsSmartcardNumber'
  }));
  card.appendChild(cardNum);

  card.appendChild(radioGroup({
    label: 'Email account created?',
    section: 'itSystemsAccess', field: 'emailAccountCreated', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Network login created?',
    section: 'itSystemsAccess', field: 'networkLoginCreated', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Clinical system access granted?',
    section: 'itSystemsAccess', field: 'clinicalSystemAccess', options: yesNo
  }));
  const clinHost = document.createElement('div');
  clinHost.dataset.conditional = 'itSystemsAccess.clinicalSystemAccess=yes';
  clinHost.appendChild(textInput({
    label: 'Clinical system name',
    section: 'itSystemsAccess', field: 'clinicalSystemName',
    placeholder: 'e.g. EPIC, Cerner, EMIS, SystmOne'
  }));
  clinHost.appendChild(radioGroup({
    label: 'Clinical system training completed?',
    section: 'itSystemsAccess', field: 'clinicalSystemTrainingCompleted', options: yesNo
  }));
  card.appendChild(clinHost);

  card.appendChild(radioGroup({
    label: 'Rostering / e-roster system access?',
    section: 'itSystemsAccess', field: 'rosteringSystemAccess', options: yesNo
  }));

  const phoneRow = document.createElement('div');
  phoneRow.className = 'two-col';
  phoneRow.appendChild(textInput({
    label: 'Phone extension',
    section: 'itSystemsAccess', field: 'phoneExtension'
  }));
  phoneRow.appendChild(textInput({
    label: 'Bleep / pager number',
    section: 'itSystemsAccess', field: 'bleepNumber'
  }));
  card.appendChild(phoneRow);

  card.appendChild(textArea({
    label: 'IT access notes',
    section: 'itSystemsAccess', field: 'itAccessNotes',
    placeholder: 'Any notes about IT setup…',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Uniform & ID Badge',
    description: 'Uniform issue, ID badge, access card, and locker.'
  });

  card.appendChild(radioGroup({
    label: 'Is a uniform required for this role?',
    section: 'uniformIDBadge', field: 'uniformRequired', options: yesNo
  }));
  const uniHost = document.createElement('div');
  uniHost.dataset.conditional = 'uniformIDBadge.uniformRequired=yes';
  uniHost.appendChild(radioGroup({
    label: 'Uniform ordered?',
    section: 'uniformIDBadge', field: 'uniformOrdered', options: yesNo
  }));
  uniHost.appendChild(radioGroup({
    label: 'Uniform received?',
    section: 'uniformIDBadge', field: 'uniformReceived', options: yesNo
  }));
  uniHost.appendChild(textInput({
    label: 'Uniform size',
    section: 'uniformIDBadge', field: 'uniformSize',
    placeholder: 'e.g. M, 12, Trousers 32R'
  }));
  card.appendChild(uniHost);

  card.appendChild(subheader('ID badge'));
  card.appendChild(radioGroup({
    label: 'ID badge photo taken?',
    section: 'uniformIDBadge', field: 'idBadgePhotoTaken', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'ID badge issued?',
    section: 'uniformIDBadge', field: 'idBadgeIssued', options: yesNo
  }));
  const badgeNum = document.createElement('div');
  badgeNum.dataset.conditional = 'uniformIDBadge.idBadgeIssued=yes';
  badgeNum.appendChild(textInput({
    label: 'ID badge number',
    section: 'uniformIDBadge', field: 'idBadgeNumber'
  }));
  card.appendChild(badgeNum);

  card.appendChild(subheader('Access card & locker'));
  card.appendChild(radioGroup({
    label: 'Access card / door fob issued?',
    section: 'uniformIDBadge', field: 'accessCardIssued', options: yesNo
  }));
  const accessHost = document.createElement('div');
  accessHost.dataset.conditional = 'uniformIDBadge.accessCardIssued=yes';
  accessHost.appendChild(textInput({
    label: 'Areas of access',
    section: 'uniformIDBadge', field: 'accessCardAreas',
    placeholder: 'e.g. ward, drug cupboard, ICU'
  }));
  card.appendChild(accessHost);

  card.appendChild(radioGroup({
    label: 'Locker allocated?',
    section: 'uniformIDBadge', field: 'lockerAllocated', options: yesNo
  }));
  const lockerHost = document.createElement('div');
  lockerHost.dataset.conditional = 'uniformIDBadge.lockerAllocated=yes';
  lockerHost.appendChild(textInput({
    label: 'Locker number',
    section: 'uniformIDBadge', field: 'lockerNumber'
  }));
  card.appendChild(lockerHost);

  card.appendChild(textArea({
    label: 'Uniform & ID notes',
    section: 'uniformIDBadge', field: 'uniformIdNotes',
    placeholder: 'Any notes about uniform or ID issue…',
    rows: 3
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Induction Programme',
    description: 'Corporate and local induction, team introduction, policies, and buddy assignment.'
  });

  card.appendChild(radioGroup({
    label: 'Corporate induction completed?',
    section: 'inductionProgramme', field: 'corporateInductionCompleted', options: yesNo
  }));
  const corpDate = document.createElement('div');
  corpDate.dataset.conditional = 'inductionProgramme.corporateInductionCompleted=yes';
  corpDate.appendChild(textInput({
    label: 'Corporate induction date',
    section: 'inductionProgramme', field: 'corporateInductionDate', type: 'date'
  }));
  card.appendChild(corpDate);

  card.appendChild(radioGroup({
    label: 'Local (departmental) induction completed?',
    section: 'inductionProgramme', field: 'localInductionCompleted', options: yesNo
  }));
  const localDate = document.createElement('div');
  localDate.dataset.conditional = 'inductionProgramme.localInductionCompleted=yes';
  localDate.appendChild(textInput({
    label: 'Local induction date',
    section: 'inductionProgramme', field: 'localInductionDate', type: 'date'
  }));
  card.appendChild(localDate);

  card.appendChild(radioGroup({
    label: 'Department tour completed?',
    section: 'inductionProgramme', field: 'departmentTourCompleted', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Introduced to team?',
    section: 'inductionProgramme', field: 'introducedToTeam', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Emergency procedures briefed?',
    section: 'inductionProgramme', field: 'emergencyProceduresBriefed', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Policies / staff handbook received?',
    section: 'inductionProgramme', field: 'policiesHandbookReceived', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Buddy / preceptor assigned?',
    section: 'inductionProgramme', field: 'buddyAssigned', options: yesNo
  }));
  const buddyHost = document.createElement('div');
  buddyHost.dataset.conditional = 'inductionProgramme.buddyAssigned=yes';
  buddyHost.appendChild(textInput({
    label: 'Buddy / preceptor name',
    section: 'inductionProgramme', field: 'buddyName'
  }));
  card.appendChild(buddyHost);

  card.appendChild(textArea({
    label: 'Induction notes',
    section: 'inductionProgramme', field: 'inductionProgrammeNotes',
    placeholder: 'Any notes about the induction programme…',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Probation & Supervision',
    description: 'Probation period, line management, supervision, objectives, and appraisal.'
  });

  const probRow = document.createElement('div');
  probRow.className = 'three-col';
  probRow.appendChild(textInput({
    label: 'Probation length',
    section: 'probationSupervision', field: 'probationPeriodMonths',
    type: 'number', min: 0, max: 24, unit: 'months'
  }));
  probRow.appendChild(textInput({
    label: 'Probation start',
    section: 'probationSupervision', field: 'probationStartDate', type: 'date'
  }));
  probRow.appendChild(textInput({
    label: 'Probation end',
    section: 'probationSupervision', field: 'probationEndDate', type: 'date'
  }));
  card.appendChild(probRow);

  card.appendChild(subheader('Line management & supervision'));

  const mgrRow = document.createElement('div');
  mgrRow.className = 'two-col';
  mgrRow.appendChild(textInput({
    label: 'Line manager name',
    section: 'probationSupervision', field: 'lineManagerName'
  }));
  mgrRow.appendChild(textInput({
    label: 'Line manager email',
    section: 'probationSupervision', field: 'lineManagerEmail', type: 'email'
  }));
  card.appendChild(mgrRow);

  card.appendChild(textInput({
    label: 'Clinical / professional supervisor name',
    section: 'probationSupervision', field: 'supervisorName'
  }));
  card.appendChild(selectInput({
    label: 'Supervision frequency',
    section: 'probationSupervision', field: 'supervisionFrequency',
    options: [
      { value: 'weekly', label: 'Weekly' },
      { value: 'fortnightly', label: 'Fortnightly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'quarterly', label: 'Quarterly' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date of first supervision',
    section: 'probationSupervision', field: 'firstSupervisionDate', type: 'date'
  }));

  card.appendChild(subheader('Objectives & appraisal'));

  card.appendChild(radioGroup({
    label: 'Probation objectives set?',
    section: 'probationSupervision', field: 'objectivesSet', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Appraisal date agreed?',
    section: 'probationSupervision', field: 'appraisalDateAgreed', options: yesNo
  }));
  const apprDate = document.createElement('div');
  apprDate.dataset.conditional = 'probationSupervision.appraisalDateAgreed=yes';
  apprDate.appendChild(textInput({
    label: 'Appraisal date',
    section: 'probationSupervision', field: 'appraisalDate', type: 'date'
  }));
  card.appendChild(apprDate);

  card.appendChild(textArea({
    label: 'Probation & supervision notes',
    section: 'probationSupervision', field: 'probationSupervisionNotes',
    placeholder: 'Any notes about probation arrangements…',
    rows: 3
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Sign-off & Compliance',
    description: 'Final policy acknowledgements and employee / manager sign-off.'
  });

  card.appendChild(subheader('Policy acknowledgements'));

  card.appendChild(radioGroup({
    label: 'Confidentiality agreement signed?',
    section: 'signOffCompliance', field: 'confidentialityAgreementSigned', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Code of conduct signed?',
    section: 'signOffCompliance', field: 'codeOfConductSigned', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Social media policy acknowledged?',
    section: 'signOffCompliance', field: 'socialMediaPolicyAcknowledged', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'IT acceptable use policy signed?',
    section: 'signOffCompliance', field: 'itAcceptableUseSigned', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'GDPR / data protection training completed?',
    section: 'signOffCompliance', field: 'gdprTrainingCompleted', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Duty of candour briefed?',
    section: 'signOffCompliance', field: 'dutyOfCandourBriefed', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Whistleblowing policy briefed?',
    section: 'signOffCompliance', field: 'whistleblowingPolicyBriefed', options: yesNo
  }));

  card.appendChild(subheader('Employee sign-off'));

  card.appendChild(radioGroup({
    label: 'Employee has signed off onboarding?',
    section: 'signOffCompliance', field: 'employeeSignedOff', options: yesNo
  }));
  const empDate = document.createElement('div');
  empDate.dataset.conditional = 'signOffCompliance.employeeSignedOff=yes';
  empDate.appendChild(textInput({
    label: 'Employee sign-off date',
    section: 'signOffCompliance', field: 'employeeSignOffDate', type: 'date'
  }));
  card.appendChild(empDate);

  card.appendChild(subheader('Manager sign-off'));

  card.appendChild(radioGroup({
    label: 'Manager has signed off onboarding?',
    section: 'signOffCompliance', field: 'managerSignedOff', options: yesNo
  }));
  const mgrHost = document.createElement('div');
  mgrHost.dataset.conditional = 'signOffCompliance.managerSignedOff=yes';
  mgrHost.appendChild(textInput({
    label: 'Manager name',
    section: 'signOffCompliance', field: 'managerSignOffName'
  }));
  mgrHost.appendChild(textInput({
    label: 'Manager sign-off date',
    section: 'signOffCompliance', field: 'managerSignOffDate', type: 'date'
  }));
  card.appendChild(mgrHost);

  card.appendChild(textArea({
    label: 'Sign-off notes',
    section: 'signOffCompliance', field: 'signOffComplianceNotes',
    placeholder: 'Any final notes about onboarding…',
    rows: 3
  }));

  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
  renderStep6, renderStep7, renderStep8, renderStep9, renderStep10
];

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

// Tracked fields drive the sticky progress bar at the top of the page.
// We track every "key" answer the engine cares about, plus the most
// commonly-collected demographic fields.
const TRACKED_FIELDS = [
  // Demographics (8)
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'email'],
  ['demographics', 'jobTitle'],
  ['demographics', 'department'],
  ['demographics', 'startDate'],
  ['demographics', 'emergencyContactName'],
  // Pre-Employment (5)
  ['preEmploymentChecks', 'dbsCheckStatus'],
  ['preEmploymentChecks', 'rightToWorkVerified'],
  ['preEmploymentChecks', 'referencesReceived'],
  ['preEmploymentChecks', 'referencesSatisfactory'],
  ['preEmploymentChecks', 'identityVerified'],
  // Occupational Health (5)
  ['occupationalHealth', 'ohQuestionnaireSubmitted'],
  ['occupationalHealth', 'ohClearanceReceived'],
  ['occupationalHealth', 'ohRestrictions'],
  ['occupationalHealth', 'immunisationStatus'],
  ['occupationalHealth', 'fitToWork'],
  // Mandatory Training (10)
  ['mandatoryTraining', 'fireSafetyCompleted'],
  ['mandatoryTraining', 'manualHandlingCompleted'],
  ['mandatoryTraining', 'infectionControlCompleted'],
  ['mandatoryTraining', 'safeguardingAdultsCompleted'],
  ['mandatoryTraining', 'safeguardingChildrenCompleted'],
  ['mandatoryTraining', 'informationGovernanceCompleted'],
  ['mandatoryTraining', 'basicLifeSupportCompleted'],
  ['mandatoryTraining', 'equalityDiversityCompleted'],
  ['mandatoryTraining', 'healthSafetyCompleted'],
  ['mandatoryTraining', 'conflictResolutionCompleted'],
  // Professional Registration (1)
  ['professionalRegistration', 'registrationRequired'],
  // IT Systems (5)
  ['itSystemsAccess', 'nhsSmartcardIssued'],
  ['itSystemsAccess', 'emailAccountCreated'],
  ['itSystemsAccess', 'networkLoginCreated'],
  ['itSystemsAccess', 'clinicalSystemAccess'],
  ['itSystemsAccess', 'rosteringSystemAccess'],
  // Uniform & ID (4)
  ['uniformIDBadge', 'uniformRequired'],
  ['uniformIDBadge', 'idBadgeIssued'],
  ['uniformIDBadge', 'accessCardIssued'],
  ['uniformIDBadge', 'lockerAllocated'],
  // Induction (6)
  ['inductionProgramme', 'corporateInductionCompleted'],
  ['inductionProgramme', 'localInductionCompleted'],
  ['inductionProgramme', 'departmentTourCompleted'],
  ['inductionProgramme', 'introducedToTeam'],
  ['inductionProgramme', 'emergencyProceduresBriefed'],
  ['inductionProgramme', 'buddyAssigned'],
  // Probation (4)
  ['probationSupervision', 'probationPeriodMonths'],
  ['probationSupervision', 'lineManagerName'],
  ['probationSupervision', 'objectivesSet'],
  ['probationSupervision', 'appraisalDateAgreed'],
  // Sign-off (9)
  ['signOffCompliance', 'confidentialityAgreementSigned'],
  ['signOffCompliance', 'codeOfConductSigned'],
  ['signOffCompliance', 'socialMediaPolicyAcknowledged'],
  ['signOffCompliance', 'itAcceptableUseSigned'],
  ['signOffCompliance', 'gdprTrainingCompleted'],
  ['signOffCompliance', 'dutyOfCandourBriefed'],
  ['signOffCompliance', 'whistleblowingPolicyBriefed'],
  ['signOffCompliance', 'employeeSignedOff'],
  ['signOffCompliance', 'managerSignedOff']
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
  { step: 2,  section: 'preEmploymentChecks',       title: 'Pre-Employment' },
  { step: 3,  section: 'occupationalHealth',        title: 'Occupational Health' },
  { step: 4,  section: 'mandatoryTraining',         title: 'Mandatory Training' },
  { step: 5,  section: 'professionalRegistration',  title: 'Registration' },
  { step: 6,  section: 'itSystemsAccess',           title: 'IT Access' },
  { step: 7,  section: 'uniformIDBadge',            title: 'Uniform & ID' },
  { step: 8,  section: 'inductionProgramme',        title: 'Induction' },
  { step: 9,  section: 'probationSupervision',      title: 'Probation' },
  { step: 10, section: 'signOffCompliance',         title: 'Sign-off' }
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

  const {
    completionPercentage,
    completionStatus,
    overallRisk,
    itemsCompleted,
    itemsTotal,
    firedRules,
    additionalFlags,
    timestamp,
    byCategory
  } = lastResult;

  // Flagged issues list
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

  // Fired-rules table
  const firedRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
      <td class="num">
        <span class="grade-badge ${gradeClass(r.grade)}">${esc(gradeLabel(r.grade))}</span>
      </td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No compliance rules fired - excellent.</p>`
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

  // Per-category checklist
  const categoryNames = Object.keys(byCategory).filter((c) => byCategory[c].total > 0);
  const checklistHtml = categoryNames.map((cat) => {
    const c = byCategory[cat];
    const items = c.items.map((item) => `
      <li class="${item.done ? 'done' : 'todo'}">
        <span class="check" aria-hidden="true">${item.done ? '\u2713' : '\u00b7'}</span>
        <span>${esc(item.label)}</span>
      </li>
    `).join('');
    return `
      <h4 style="margin: 0.75rem 0 0.25rem; font-size: 0.9375rem;">
        ${esc(cat)}
        <span class="muted" style="font-weight:400;font-size:0.8125rem;">
          (${c.completed} / ${c.total})
        </span>
      </h4>
      <ul class="checklist">${items}</ul>
    `;
  }).join('');

  out.innerHTML = `
    <h2>Onboarding Compliance Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Overall completion</h3>
    <p class="completion-summary">
      <span class="completion-badge ${completionStatusClass(completionStatus)}">${completionPercentage}%</span>
      <span class="completion-status">${esc(completionStatusLabel(completionStatus))}</span>
      <span class="risk-badge ${riskLevelClass(overallRisk)}">${esc(riskLevelLabel(overallRisk))}</span>
    </p>
    <p class="muted">${itemsCompleted} of ${itemsTotal} key checklist items completed.</p>

    <h3>Per-category checklist</h3>
    ${checklistHtml}

    <h3>Fired compliance rules</h3>
    ${firedTable}

    <h3>Flagged issues for HR</h3>
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
  const grade = calculateOnboardingGrade(state);
  const counts = countCompletedItems(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    completionPercentage: grade.completionPercentage,
    completionStatus: grade.completionStatus,
    overallRisk: grade.overallRisk,
    itemsCompleted: grade.itemsCompleted,
    itemsTotal: grade.itemsTotal,
    firedRules: grade.firedRules,
    additionalFlags,
    byCategory: counts.byCategory,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh onboarding checklist?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the report.</p>';
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
  for (const r of STEP_RENDERERS) host.appendChild(r());
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

// Silence unused-variable lint for `conditional` helper if a step
// doesn't reach for it; it is defined for future use.
void conditional;
