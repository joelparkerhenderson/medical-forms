import { detectAdditionalFlags } from './flagged-issues.js';
import { validateForm as runValidator } from './form-validator.js';
import { completenessBadgeClass, emptyAssessment, validationStatusClass } from './types.js';
import { purposeOptions, recordTypeOptions } from './validation-rules.js';

// Medical Records Release Permission - patient wizard (vanilla JS, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress bar + step list reflects how many required fields have been
// answered. Submission runs the pure form-completeness validator + flag
// detector and renders an inline aria-live report. State is persisted to
// localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'medical-records-release-permission.front-end-form-with-html.v1';
const TOTAL_STEPS = 8;

/** @returns {AssessmentData} */
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
      // Spread parsed values over the fresh defaults; parsed arrays
      // (e.g. recordTypes) overwrite the empty array from the default.
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
    console.warn('Could not parse saved release permission; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {AssessmentData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save release permission to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored release permission.', e);
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

/** @type {AssessmentData} */
let state = loadState();

/** @type {GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'medical-records-release-permission',
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/** Set a scalar field on the state and persist. */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
}

/** Toggle a value in a string[] field on the state and persist. */
function toggleArrayField(section, field, value, checked) {
  const arr = state[section][field];
  const idx = arr.indexOf(value);
  if (checked && idx === -1) arr.push(value);
  if (!checked && idx !== -1) arr.splice(idx, 1);
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

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;

  const input = wrapper.querySelector('input');
  input.setAttribute('aria-describedby', `${id}-error`);
  input.addEventListener('input', () => {
    setField(opts.section, opts.field, input.value);
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
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      ${opts.required ? 'required data-required' : ''}
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

/** Build a checkbox group bound to a string[] field on the state. */
function checkboxGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] || [];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.innerHTML = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  wrapper.appendChild(legend);

  if (opts.hint) {
    const hint = document.createElement('span');
    hint.className = 'hint';
    hint.textContent = opts.hint;
    wrapper.appendChild(hint);
  }

  const list = document.createElement('div');
  list.className = 'checkbox-group';
  list.setAttribute('role', 'group');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const cbId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.htmlFor = cbId;
    const checked = current.indexOf(option.value) !== -1 ? ' checked' : '';
    label.innerHTML = `
      <input class="checkbox-input" type="checkbox" id="${cbId}" name="${groupId}" value="${esc(option.value)}"${checked}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      toggleArrayField(opts.section, opts.field, option.value, input.checked);
      clearFieldError(groupId);
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
  legend.innerHTML = `
    <span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>
    <span class="section-title">${esc(opts.title)}</span>
    ${desc}
  `;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'patientInformation',     title: 'Patient Information' },
  { step: 2, section: 'authorizedRecipient',    title: 'Authorized Recipient' },
  { step: 3, section: 'recordsToRelease',       title: 'Records to Release' },
  { step: 4, section: 'purposeOfRelease',       title: 'Purpose of Release' },
  { step: 5, section: 'authorizationPeriod',    title: 'Authorization Period' },
  { step: 6, section: 'restrictionsLimitations', title: 'Restrictions & Limitations' },
  { step: 7, section: 'patientRights',          title: 'Patient Rights' },
  { step: 8, section: 'signatureConsent',       title: 'Signature & Consent' }
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
// Section renderers (1 per step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Patient Information',
    description: 'Tell us who is authorising this records release.'
  });

  const nameRow = document.createElement('div');
  nameRow.className = 'two-col';
  nameRow.appendChild(textInput({
    label: 'First Name', section: 'patientInformation', field: 'firstName',
    required: true, placeholder: 'First name'
  }));
  nameRow.appendChild(textInput({
    label: 'Last Name', section: 'patientInformation', field: 'lastName',
    required: true, placeholder: 'Last name'
  }));
  card.appendChild(nameRow);

  const dobRow = document.createElement('div');
  dobRow.className = 'two-col';
  dobRow.appendChild(textInput({
    label: 'Date of Birth', section: 'patientInformation', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  dobRow.appendChild(radioGroup({
    label: 'Sex', section: 'patientInformation', field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(dobRow);

  card.appendChild(textArea({
    label: 'Address', section: 'patientInformation', field: 'address',
    required: true, rows: 2, placeholder: 'Full address'
  }));

  const contactRow = document.createElement('div');
  contactRow.className = 'two-col';
  contactRow.appendChild(textInput({
    label: 'Phone', section: 'patientInformation', field: 'phone',
    type: 'tel', placeholder: 'Phone number'
  }));
  contactRow.appendChild(textInput({
    label: 'Email', section: 'patientInformation', field: 'email',
    type: 'email', placeholder: 'Email address'
  }));
  card.appendChild(contactRow);

  const idRow = document.createElement('div');
  idRow.className = 'three-col';
  idRow.appendChild(textInput({
    label: 'NHS Number', section: 'patientInformation', field: 'nhsNumber',
    required: true, placeholder: 'XXX XXX XXXX'
  }));
  idRow.appendChild(textInput({
    label: 'GP Name', section: 'patientInformation', field: 'gpName',
    placeholder: 'GP name'
  }));
  idRow.appendChild(textInput({
    label: 'GP Practice', section: 'patientInformation', field: 'gpPractice',
    placeholder: 'Practice name'
  }));
  card.appendChild(idRow);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Authorized Recipient',
    description: 'Who should receive the released records?'
  });

  const nameRow = document.createElement('div');
  nameRow.className = 'two-col';
  nameRow.appendChild(textInput({
    label: 'Recipient Name', section: 'authorizedRecipient', field: 'recipientName',
    required: true, placeholder: 'Full name'
  }));
  nameRow.appendChild(textInput({
    label: 'Organization', section: 'authorizedRecipient', field: 'recipientOrganization',
    required: true, placeholder: 'Organization name'
  }));
  card.appendChild(nameRow);

  card.appendChild(textArea({
    label: 'Recipient Address', section: 'authorizedRecipient', field: 'recipientAddress',
    required: true, rows: 2, placeholder: 'Full address'
  }));

  const contactRow = document.createElement('div');
  contactRow.className = 'three-col';
  contactRow.appendChild(textInput({
    label: 'Phone', section: 'authorizedRecipient', field: 'recipientPhone',
    type: 'tel', placeholder: 'Phone number'
  }));
  contactRow.appendChild(textInput({
    label: 'Email', section: 'authorizedRecipient', field: 'recipientEmail',
    type: 'email', placeholder: 'Email address'
  }));
  contactRow.appendChild(textInput({
    label: 'Role', section: 'authorizedRecipient', field: 'recipientRole',
    placeholder: 'e.g. Consultant'
  }));
  card.appendChild(contactRow);

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Records to Release',
    description: 'Select which records will be released, and over what period.'
  });

  card.appendChild(checkboxGroup({
    label: 'Record Types',
    section: 'recordsToRelease', field: 'recordTypes',
    required: true,
    hint: 'Select all that apply.',
    options: recordTypeOptions
  }));

  card.appendChild(radioGroup({
    label: 'Restrict release to a specific date range?',
    section: 'recordsToRelease', field: 'specificDateRange',
    options: yesNo
  }));

  const dateRange = document.createElement('div');
  dateRange.dataset.conditional = 'recordsToRelease.specificDateRange=yes';
  const dateRow = document.createElement('div');
  dateRow.className = 'two-col';
  dateRow.appendChild(textInput({
    label: 'From Date', section: 'recordsToRelease', field: 'dateFrom',
    type: 'date'
  }));
  dateRow.appendChild(textInput({
    label: 'To Date', section: 'recordsToRelease', field: 'dateTo',
    type: 'date'
  }));
  dateRange.appendChild(dateRow);
  card.appendChild(dateRange);

  card.appendChild(textArea({
    label: 'Specific Record Details', section: 'recordsToRelease', field: 'specificRecordDetails',
    rows: 3, placeholder: 'Describe any specific records you wish to release (optional).'
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Purpose of Release',
    description: 'Why are the records being released?'
  });

  card.appendChild(radioGroup({
    label: 'Purpose', section: 'purposeOfRelease', field: 'purpose',
    required: true,
    options: purposeOptions
  }));

  const otherDetails = document.createElement('div');
  otherDetails.dataset.conditional = 'purposeOfRelease.purpose=other';
  otherDetails.appendChild(textArea({
    label: 'Please specify the purpose',
    section: 'purposeOfRelease', field: 'otherDetails',
    rows: 3, placeholder: 'Describe the purpose of this records release.',
    required: true
  }));
  card.appendChild(otherDetails);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Authorization Period',
    description: 'How long is this authorization valid?'
  });

  const dateRow = document.createElement('div');
  dateRow.className = 'two-col';
  dateRow.appendChild(textInput({
    label: 'Start Date', section: 'authorizationPeriod', field: 'startDate',
    type: 'date', required: true
  }));
  dateRow.appendChild(textInput({
    label: 'End Date', section: 'authorizationPeriod', field: 'endDate',
    type: 'date', required: true
  }));
  card.appendChild(dateRow);

  card.appendChild(radioGroup({
    label: 'Single Use Authorization?',
    section: 'authorizationPeriod', field: 'singleUse',
    options: yesNo
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Restrictions & Limitations',
    description:
      'Indicate whether the following sensitive categories should be excluded from the release.'
  });

  card.appendChild(radioGroup({
    label: 'Exclude HIV-related records?',
    section: 'restrictionsLimitations', field: 'excludeHIV', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Exclude substance abuse treatment records?',
    section: 'restrictionsLimitations', field: 'excludeSubstanceAbuse', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Exclude mental health records?',
    section: 'restrictionsLimitations', field: 'excludeMentalHealth', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Exclude genetic information?',
    section: 'restrictionsLimitations', field: 'excludeGeneticInfo', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Exclude STI-related records?',
    section: 'restrictionsLimitations', field: 'excludeSTI', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Additional Restrictions',
    section: 'restrictionsLimitations', field: 'additionalRestrictions',
    rows: 3, placeholder: 'Any other restrictions or limitations (optional).'
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Patient Rights',
    description: 'Please acknowledge each of the following rights.'
  });

  card.appendChild(radioGroup({
    label: 'I acknowledge my right to revoke this authorization at any time',
    section: 'patientRights', field: 'acknowledgedRightToRevoke',
    required: true,
    options: [
      { value: 'yes', label: 'Yes, I acknowledge' },
      { value: 'no', label: 'No' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'I acknowledge there is no charge for accessing my records',
    section: 'patientRights', field: 'acknowledgedNoChargeForAccess',
    options: [
      { value: 'yes', label: 'Yes, I acknowledge' },
      { value: 'no', label: 'No' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'I acknowledge my data protection rights under applicable law',
    section: 'patientRights', field: 'acknowledgedDataProtection',
    required: true,
    options: [
      { value: 'yes', label: 'Yes, I acknowledge' },
      { value: 'no', label: 'No' }
    ]
  }));

  return card;
}

function renderStep8() {
  // Signature capture: this form uses an explicit yes/no radio confirmation
  // plus a typed signature date (and optional witness name/date). There is
  // no interactive signature-pad canvas — the pattern is a checkbox-style
  // confirmation, mirroring the SvelteKit and HIPAA-peer implementations.
  const card = sectionCard({
    stepNumber: 8,
    title: 'Signature & Consent',
    description: 'Confirm your signature and (optionally) a witness signature.'
  });

  card.appendChild(radioGroup({
    label: 'I confirm my signature and consent to release my records',
    section: 'signatureConsent', field: 'patientSignatureConfirmed',
    required: true,
    options: [
      { value: 'yes', label: 'Yes, I confirm' },
      { value: 'no', label: 'No' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Signature Date', section: 'signatureConsent', field: 'signatureDate',
    type: 'date', required: true
  }));

  const witnessRow = document.createElement('div');
  witnessRow.className = 'two-col';
  witnessRow.appendChild(textInput({
    label: 'Witness Name', section: 'signatureConsent', field: 'witnessName',
    placeholder: 'Witness full name'
  }));
  witnessRow.appendChild(radioGroup({
    label: 'Witness Signature Confirmed',
    section: 'signatureConsent', field: 'witnessSignatureConfirmed',
    options: yesNo
  }));
  card.appendChild(witnessRow);

  const witnessRow2 = document.createElement('div');
  witnessRow2.className = 'two-col';
  witnessRow2.appendChild(textInput({
    label: 'Witness Date', section: 'signatureConsent', field: 'witnessDate',
    type: 'date'
  }));
  witnessRow2.appendChild(textInput({
    label: 'Parent / Guardian Name',
    section: 'signatureConsent', field: 'parentGuardianName',
    placeholder: 'If applicable'
  }));
  card.appendChild(witnessRow2);

  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7, renderStep8
];

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const eq = expr.indexOf('=');
    const path = expr.slice(0, eq);
    const target = expr.slice(eq + 1);
    const [section, field] = path.split('.');
    const current = state[section] ? state[section][field] : undefined;
    host.style.display = String(current) === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

/**
 * Field set tracked by the progress bar. Mirrors the validation rules so
 * that "100% answered" lines up with "Complete" in the report.
 * Acknowledgement / signature fields are answered iff the explicit "yes"
 * option is selected, matching the engine validator.
 */
const TRACKED_FIELDS = [
  ['patientInformation', 'firstName'],
  ['patientInformation', 'lastName'],
  ['patientInformation', 'dateOfBirth'],
  ['patientInformation', 'address'],
  ['patientInformation', 'nhsNumber'],
  ['authorizedRecipient', 'recipientName'],
  ['authorizedRecipient', 'recipientOrganization'],
  ['authorizedRecipient', 'recipientAddress'],
  ['recordsToRelease', 'recordTypes'],
  ['purposeOfRelease', 'purpose'],
  ['authorizationPeriod', 'startDate'],
  ['authorizationPeriod', 'endDate'],
  ['patientRights', 'acknowledgedRightToRevoke'],
  ['patientRights', 'acknowledgedDataProtection'],
  ['signatureConsent', 'patientSignatureConfirmed'],
  ['signatureConsent', 'signatureDate']
];

const ACKNOWLEDGEMENT_FIELDS = new Set([
  'acknowledgedRightToRevoke',
  'acknowledgedDataProtection',
  'acknowledgedNoChargeForAccess',
  'patientSignatureConfirmed',
  'witnessSignatureConfirmed'
]);

function isFieldAnswered(section, field) {
  const v = state[section][field];
  if (Array.isArray(v)) return v.length > 0;
  if (ACKNOWLEDGEMENT_FIELDS.has(field)) return v === 'yes';
  if (typeof v === 'string') return v.trim() !== '';
  return v !== null && v !== undefined;
}

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    if (isFieldAnswered(section, field)) {
      answered++;
      sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
    }
  }
  const total = TRACKED_FIELDS.length;
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) {
    text.textContent = `${answered} of ${total} required fields answered (${percent}%)`;
  }
  updateStepListStatuses(sectionAnswered, sectionTotal);
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
  if (input) {
    input.setAttribute('aria-invalid', 'true');
    return;
  }
  const fs = document.getElementById(`${id}-fieldset`);
  if (fs) fs.setAttribute('aria-invalid', 'true');
}

/** True if an element sits inside a hidden conditional container. */
function isInsideHiddenConditional(el) {
  let node = el;
  while (node) {
    if (node.dataset && (node.dataset.conditional || node.dataset.conditionalAny)) {
      if (node.style && node.style.display === 'none') return true;
    }
    node = node.parentElement;
  }
  return false;
}

function validateForm() {
  const errors = [];
  const form = document.getElementById('assessment-form');
  if (!form) return errors;

  // Plain required inputs (text/date/textarea). Skip those inside hidden
  // conditional sections so that, e.g., the "Please specify the purpose"
  // textarea is only required when "Other" is selected.
  const required = form.querySelectorAll(
    'input[data-required], textarea[data-required], select[data-required]'
  );
  required.forEach((input) => {
    if (isInsideHiddenConditional(input)) {
      clearFieldError(input.id);
      return;
    }
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

  // Required radio groups & checkbox groups. The fieldset legend's label
  // string is used in the error message.
  const requiredGroups = [
    { id: 'recordsToRelease-recordTypes',                    label: 'Record types',                       kind: 'checkbox' },
    { id: 'purposeOfRelease-purpose',                        label: 'Purpose of release',                 kind: 'radio' },
    { id: 'patientRights-acknowledgedRightToRevoke',         label: 'Right to revoke acknowledgement',    kind: 'radio',    requireYes: true },
    { id: 'patientRights-acknowledgedDataProtection',        label: 'Data protection acknowledgement',    kind: 'radio',    requireYes: true },
    { id: 'signatureConsent-patientSignatureConfirmed',      label: 'Patient signature confirmation',     kind: 'radio',    requireYes: true }
  ];

  for (const grp of requiredGroups) {
    const [section, field] = grp.id.split('-');
    const v = state[section] && state[section][field];
    let ok = false;
    if (grp.kind === 'checkbox') {
      ok = Array.isArray(v) && v.length > 0;
    } else if (grp.requireYes) {
      ok = v === 'yes';
    } else {
      ok = !!v;
    }
    if (!ok) {
      const msg = grp.requireYes
        ? `${grp.label} requires "Yes"`
        : `${grp.label} is required`;
      errors.push({ id: grp.id, message: msg });
      setFieldError(grp.id, msg);
    } else {
      clearFieldError(grp.id);
    }
  }

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
    completenessScore,
    completenessStatus: statusLabel,
    validationStatus: valStatusLabel,
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
      <td>${esc(r.domain)}</td>
      <td>${esc(r.description)}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">All required fields are complete and valid.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Rule ID</th>
            <th scope="col">Section</th>
            <th scope="col">Issue</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <h2>Medical Records Release Permission — Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Completeness</h3>
    <p class="completeness-summary">
      <span class="completeness-badge ${completenessBadgeClass(completenessScore)}">${completenessScore}%</span>
      <span class="completeness-status">${esc(statusLabel)}</span>
      <span class="validation-status ${validationStatusClass(valStatusLabel)}">${esc(valStatusLabel)}</span>
    </p>

    <h3>Validation Issues</h3>
    ${firedTable}

    <h3>Flagged Issues</h3>
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
  const validation = runValidator(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    completenessScore: validation.completenessScore,
    completenessStatus: validation.completenessStatusLabel,
    validationStatus: validation.validationStatusLabel,
    firedRules: validation.firedRules,
    additionalFlags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh release form?')) return;
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
