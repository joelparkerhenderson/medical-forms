import { validateChecklist } from './checklist-validator.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { emptyAssessment, outcomeClass, outcomeLabel, priorityClass, priorityLabel } from './types.js';

// Employee Offboarding Checklist — HR / line-manager / IT wizard
// (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page
// in document order. The user scrolls through them; a sticky top-of-page
// progress bar + step list reflects how many fields have been answered.
// Submission runs the pure validation engine and renders an inline
// report. State is persisted to localStorage so a partial fill survives
// a reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'employee-offboarding-checklist.front-end-form-with-html.v1';
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

/** @type {import('./types.js').ValidationResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'employee-offboarding-checklist',
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
 * Build a radio group. Optionally tag the legend with mandatory / blocker
 * markers — these appear next to the legend so HR users can see at a
 * glance which items must be confirmed for a "Complete" outcome.
 *
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[],
 *           mandatory?: boolean, blocker?: boolean }} opts
 */
function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.innerHTML = esc(opts.label)
    + (opts.mandatory ? ' <span class="mandatory-marker">Mandatory</span>' : '')
    + (opts.blocker   ? ' <span class="blocker-marker">Blocker</span>' : '');
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

/** Convenience: standard yes/no radio group options. */
const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

/** Convenience: yes/no/N/A options for equipment items. */
const yesNoNa = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'na', label: 'N/A' }
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

/** Wrap a child in a `<div data-conditional="...">` host. */
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
    title: 'Employee Details',
    description: 'Identity, role, and the dates that bound this offboarding.'
  });

  const nameRow = document.createElement('div');
  nameRow.className = 'two-col';
  nameRow.appendChild(textInput({
    label: 'First name', section: 'employeeDetails', field: 'firstName', required: true
  }));
  nameRow.appendChild(textInput({
    label: 'Last name', section: 'employeeDetails', field: 'lastName', required: true
  }));
  card.appendChild(nameRow);

  const idRow = document.createElement('div');
  idRow.className = 'two-col';
  idRow.appendChild(textInput({
    label: 'Employee ID',
    section: 'employeeDetails', field: 'employeeId'
  }));
  idRow.appendChild(textInput({
    label: 'Work email',
    section: 'employeeDetails', field: 'email', type: 'email',
    placeholder: 'name@example.org'
  }));
  card.appendChild(idRow);

  const jobRow = document.createElement('div');
  jobRow.className = 'two-col';
  jobRow.appendChild(textInput({
    label: 'Job title', section: 'employeeDetails', field: 'jobTitle',
    placeholder: 'e.g. Staff Nurse'
  }));
  jobRow.appendChild(textInput({
    label: 'Department', section: 'employeeDetails', field: 'department',
    placeholder: 'e.g. Cardiology'
  }));
  card.appendChild(jobRow);

  card.appendChild(textInput({
    label: 'Line manager',
    section: 'employeeDetails', field: 'lineManager'
  }));

  const dateRow = document.createElement('div');
  dateRow.className = 'two-col';
  dateRow.appendChild(textInput({
    label: 'Start date', section: 'employeeDetails', field: 'startDate', type: 'date'
  }));
  dateRow.appendChild(textInput({
    label: 'Last working day', section: 'employeeDetails', field: 'lastWorkingDay', type: 'date'
  }));
  card.appendChild(dateRow);

  card.appendChild(selectInput({
    label: 'Reason for leaving',
    section: 'employeeDetails', field: 'reasonForLeaving',
    options: [
      { value: 'resignation', label: 'Resignation' },
      { value: 'retirement', label: 'Retirement' },
      { value: 'redundancy', label: 'Redundancy' },
      { value: 'dismissal', label: 'Dismissal' },
      { value: 'end-of-fixed-term', label: 'End of fixed-term contract' },
      { value: 'transfer', label: 'Internal transfer' },
      { value: 'other', label: 'Other' }
    ]
  }));
  const otherReason = document.createElement('div');
  otherReason.dataset.conditional = 'employeeDetails.reasonForLeaving=other';
  otherReason.appendChild(textInput({
    label: 'Other reason — please describe',
    section: 'employeeDetails', field: 'reasonForLeavingOther'
  }));
  card.appendChild(otherReason);

  card.appendChild(textArea({
    label: 'Employee detail notes',
    section: 'employeeDetails', field: 'employeeDetailsNotes',
    placeholder: 'Any context about this departure…',
    rows: 3
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Exit Interview',
    description: 'Offer of an exit interview, completion, and feedback capture.'
  });

  card.appendChild(radioGroup({
    label: 'Was an exit interview offered?',
    section: 'exitInterview', field: 'interviewOffered', options: yesNo,
    mandatory: true
  }));
  card.appendChild(radioGroup({
    label: 'Was an exit interview completed?',
    section: 'exitInterview', field: 'interviewCompleted', options: yesNo
  }));

  const completedHost = document.createElement('div');
  completedHost.dataset.conditional = 'exitInterview.interviewCompleted=yes';
  const intRow = document.createElement('div');
  intRow.className = 'two-col';
  intRow.appendChild(textInput({
    label: 'Interview date',
    section: 'exitInterview', field: 'interviewDate', type: 'date'
  }));
  intRow.appendChild(textInput({
    label: 'Interviewer name',
    section: 'exitInterview', field: 'interviewerName'
  }));
  completedHost.appendChild(intRow);
  completedHost.appendChild(radioGroup({
    label: 'Did the employee provide feedback?',
    section: 'exitInterview', field: 'feedbackProvided', options: yesNo
  }));
  completedHost.appendChild(radioGroup({
    label: 'Was the feedback documented?',
    section: 'exitInterview', field: 'feedbackDocumented', options: yesNo
  }));
  card.appendChild(completedHost);

  card.appendChild(radioGroup({
    label: 'Did the employee raise any concerns or grievances?',
    section: 'exitInterview', field: 'concernsRaised', options: yesNo
  }));
  const concHost = document.createElement('div');
  concHost.dataset.conditional = 'exitInterview.concernsRaised=yes';
  concHost.appendChild(textArea({
    label: 'Concerns / grievance details',
    section: 'exitInterview', field: 'concernsDetails',
    placeholder: 'Summarise the concerns and any follow-up required…',
    rows: 3
  }));
  card.appendChild(concHost);

  card.appendChild(textArea({
    label: 'Exit interview notes',
    section: 'exitInterview', field: 'exitInterviewNotes',
    placeholder: 'Any other notes…',
    rows: 3
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Knowledge Transfer',
    description: 'Successor identification, handover documentation, work-in-progress, and clinical caseload.'
  });

  card.appendChild(radioGroup({
    label: 'Has a successor / handover recipient been identified?',
    section: 'knowledgeTransfer', field: 'successorIdentified', options: yesNo,
    mandatory: true
  }));
  const succHost = document.createElement('div');
  succHost.dataset.conditional = 'knowledgeTransfer.successorIdentified=yes';
  succHost.appendChild(textInput({
    label: 'Successor name',
    section: 'knowledgeTransfer', field: 'successorName'
  }));
  card.appendChild(succHost);

  card.appendChild(radioGroup({
    label: 'Has a written handover document been created?',
    section: 'knowledgeTransfer', field: 'handoverDocumentCreated', options: yesNo,
    mandatory: true
  }));
  card.appendChild(radioGroup({
    label: 'Have handover meetings been held with the successor / team?',
    section: 'knowledgeTransfer', field: 'handoverMeetingsHeld', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Is current work-in-progress fully documented?',
    section: 'knowledgeTransfer', field: 'workInProgressDocumented', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have key contacts and stakeholders been shared?',
    section: 'knowledgeTransfer', field: 'keyContactsShared', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have SOPs and shared files been transferred / re-permissioned?',
    section: 'knowledgeTransfer', field: 'sopFilesTransferred', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Has the clinical caseload been reassigned?',
    section: 'knowledgeTransfer', field: 'clinicalCaseloadReassigned', options: yesNo,
    mandatory: true
  }));

  card.appendChild(textArea({
    label: 'Knowledge transfer notes',
    section: 'knowledgeTransfer', field: 'knowledgeTransferNotes',
    placeholder: 'Any notes about the handover (gaps, follow-up actions)…',
    rows: 3
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Equipment Return',
    description: 'Return of laptop, phone, ID badge, keys, uniform, parking pass, and other equipment.'
  });

  card.appendChild(radioGroup({
    label: 'Laptop returned?',
    section: 'equipmentReturn', field: 'laptopReturned', options: yesNoNa,
    mandatory: true, blocker: true
  }));
  const tagHost = document.createElement('div');
  tagHost.dataset.conditional = 'equipmentReturn.laptopReturned=yes';
  tagHost.appendChild(textInput({
    label: 'Laptop asset tag',
    section: 'equipmentReturn', field: 'laptopAssetTag'
  }));
  card.appendChild(tagHost);

  card.appendChild(radioGroup({
    label: 'Mobile phone returned?',
    section: 'equipmentReturn', field: 'mobilePhoneReturned', options: yesNoNa,
    mandatory: true, blocker: true
  }));
  card.appendChild(radioGroup({
    label: 'ID badge returned?',
    section: 'equipmentReturn', field: 'idBadgeReturned', options: yesNoNa,
    mandatory: true, blocker: true
  }));
  card.appendChild(radioGroup({
    label: 'Keys returned?',
    section: 'equipmentReturn', field: 'keysReturned', options: yesNoNa,
    mandatory: true, blocker: true
  }));
  card.appendChild(radioGroup({
    label: 'Uniform returned?',
    section: 'equipmentReturn', field: 'uniformReturned', options: yesNoNa
  }));
  card.appendChild(radioGroup({
    label: 'Parking pass returned?',
    section: 'equipmentReturn', field: 'parkingPassReturned', options: yesNoNa
  }));
  card.appendChild(radioGroup({
    label: 'Any other equipment returned (e.g. token, headset, vehicle)?',
    section: 'equipmentReturn', field: 'otherEquipmentReturned', options: yesNoNa
  }));
  const otherHost = document.createElement('div');
  otherHost.dataset.conditional = 'equipmentReturn.otherEquipmentReturned=yes';
  otherHost.appendChild(textInput({
    label: 'Other equipment description',
    section: 'equipmentReturn', field: 'otherEquipmentDescription',
    placeholder: 'e.g. RSA token, NHS smartcard, fleet vehicle…'
  }));
  card.appendChild(otherHost);

  card.appendChild(textArea({
    label: 'Equipment return notes',
    section: 'equipmentReturn', field: 'equipmentReturnNotes',
    placeholder: 'Any equipment outstanding, damaged, or being mailed back…',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Access Revocation',
    description: 'Revoke email, EHR/EPR, VPN, Active Directory, building access, and cloud apps. Audit data download history.'
  });

  card.appendChild(radioGroup({
    label: 'Email account revoked?',
    section: 'accessRevocation', field: 'emailRevoked', options: yesNo,
    mandatory: true, blocker: true
  }));
  card.appendChild(radioGroup({
    label: 'EHR / EPR access revoked?',
    section: 'accessRevocation', field: 'ehrEprRevoked', options: yesNo,
    mandatory: true, blocker: true
  }));
  card.appendChild(radioGroup({
    label: 'VPN access revoked?',
    section: 'accessRevocation', field: 'vpnRevoked', options: yesNo,
    mandatory: true, blocker: true
  }));
  card.appendChild(radioGroup({
    label: 'Active Directory account disabled?',
    section: 'accessRevocation', field: 'activeDirectoryDisabled', options: yesNo,
    mandatory: true, blocker: true
  }));
  card.appendChild(radioGroup({
    label: 'Building / door access revoked?',
    section: 'accessRevocation', field: 'buildingAccessRevoked', options: yesNo,
    mandatory: true, blocker: true
  }));
  card.appendChild(radioGroup({
    label: 'Cloud applications access revoked (SSO de-provisioning)?',
    section: 'accessRevocation', field: 'cloudAppsRevoked', options: yesNo,
    mandatory: true, blocker: true
  }));
  card.appendChild(radioGroup({
    label: 'NHS smartcard deactivated (if applicable)?',
    section: 'accessRevocation', field: 'smartcardDeactivated', options: yesNo
  }));

  card.appendChild(subheader('Data download audit'));
  card.appendChild(radioGroup({
    label: 'Has a data download / export audit been performed?',
    section: 'accessRevocation', field: 'dataDownloadAuditPerformed', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Was any unauthorised data download detected?',
    section: 'accessRevocation', field: 'unauthorisedDownloadDetected', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Access revocation notes',
    section: 'accessRevocation', field: 'accessRevocationNotes',
    placeholder: 'Any systems still pending de-provisioning, scheduled tickets, etc…',
    rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Final Payroll & Benefits',
    description: 'Final salary, accrued holiday, expenses, pension, P45, and benefit termination.'
  });

  card.appendChild(radioGroup({
    label: 'Final salary calculated?',
    section: 'finalPayrollBenefits', field: 'finalSalaryCalculated', options: yesNo,
    mandatory: true, blocker: true
  }));
  card.appendChild(radioGroup({
    label: 'Accrued holiday pay settled?',
    section: 'finalPayrollBenefits', field: 'accruedHolidayPaid', options: yesNo,
    mandatory: true
  }));
  card.appendChild(radioGroup({
    label: 'Outstanding expenses reimbursed?',
    section: 'finalPayrollBenefits', field: 'expensesReimbursed', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Pension information provided?',
    section: 'finalPayrollBenefits', field: 'pensionInformationProvided', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'P45 / final tax document issued?',
    section: 'finalPayrollBenefits', field: 'p45Issued', options: yesNo,
    mandatory: true
  }));
  card.appendChild(radioGroup({
    label: 'Benefits (medical, life, lease) terminated?',
    section: 'finalPayrollBenefits', field: 'benefitsTerminated', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Final payroll details confirmed with employee?',
    section: 'finalPayrollBenefits', field: 'payrollDetailsConfirmed', options: yesNo
  }));
  card.appendChild(textInput({
    label: 'Final payment date',
    section: 'finalPayrollBenefits', field: 'finalPaymentDate', type: 'date'
  }));

  card.appendChild(textArea({
    label: 'Final payroll notes',
    section: 'finalPayrollBenefits', field: 'finalPayrollNotes',
    placeholder: 'Any payroll queries, deductions, or follow-ups…',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'References & Recommendations',
    description: 'Future-employer reference policy and any recommendation letter.'
  });

  card.appendChild(radioGroup({
    label: 'Has the employee given consent for references to be provided?',
    section: 'referencesRecommendations', field: 'referenceConsentGiven', options: yesNo
  }));
  const consentHost = document.createElement('div');
  consentHost.dataset.conditional = 'referencesRecommendations.referenceConsentGiven=yes';
  consentHost.appendChild(radioGroup({
    label: 'Have reference contact details been recorded?',
    section: 'referencesRecommendations', field: 'referenceContactDetailsRecorded', options: yesNo
  }));
  card.appendChild(consentHost);

  card.appendChild(radioGroup({
    label: 'Has a recommendation letter been requested?',
    section: 'referencesRecommendations', field: 'recommendationLetterRequested', options: yesNo
  }));
  const letterHost = document.createElement('div');
  letterHost.dataset.conditional = 'referencesRecommendations.recommendationLetterRequested=yes';
  letterHost.appendChild(radioGroup({
    label: 'Has a recommendation letter been provided?',
    section: 'referencesRecommendations', field: 'recommendationLetterProvided', options: yesNo
  }));
  card.appendChild(letterHost);

  card.appendChild(radioGroup({
    label: 'Has the employer reference policy been explained?',
    section: 'referencesRecommendations', field: 'referencePolicyExplained', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'References notes',
    section: 'referencesRecommendations', field: 'referencesNotes',
    placeholder: 'Any constraints (factual only, redacted, refer to HR)…',
    rows: 3
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Non-Disclosure & Post-Employment',
    description: 'Reaffirm confidentiality, walk through restrictive covenants, IP ownership, and ensure data is returned or destroyed.'
  });

  card.appendChild(radioGroup({
    label: 'Confidentiality reaffirmed by the employee?',
    section: 'nonDisclosurePostEmployment', field: 'confidentialityReaffirmed', options: yesNo,
    mandatory: true, blocker: true
  }));
  card.appendChild(radioGroup({
    label: 'Has a leaver NDA / confidentiality acknowledgement been signed?',
    section: 'nonDisclosurePostEmployment', field: 'ndaSigned', options: yesNo
  }));

  card.appendChild(subheader('Restrictive covenants'));
  card.appendChild(radioGroup({
    label: 'Have post-employment restrictive covenants been explained?',
    section: 'nonDisclosurePostEmployment', field: 'restrictiveCovenantsExplained', options: yesNo,
    mandatory: true
  }));
  card.appendChild(radioGroup({
    label: 'Has the employee acknowledged their restrictive covenants?',
    section: 'nonDisclosurePostEmployment', field: 'restrictiveCovenantsAcknowledged', options: yesNo
  }));

  card.appendChild(subheader('Intellectual property & data'));
  card.appendChild(radioGroup({
    label: 'Has intellectual property created in role been formally assigned to the employer?',
    section: 'nonDisclosurePostEmployment', field: 'intellectualPropertyAssigned', options: yesNo,
    mandatory: true
  }));
  card.appendChild(radioGroup({
    label: 'Has all organisational data been returned or destroyed?',
    section: 'nonDisclosurePostEmployment', field: 'dataReturnedOrDestroyed', options: yesNo,
    mandatory: true, blocker: true
  }));
  card.appendChild(radioGroup({
    label: 'Have post-employment obligations (non-solicit, non-compete) been explained?',
    section: 'nonDisclosurePostEmployment', field: 'postEmploymentObligationsExplained', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'NDA & post-employment notes',
    section: 'nonDisclosurePostEmployment', field: 'ndaNotes',
    placeholder: 'Any specific covenants, agreements, or follow-up commitments…',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Forwarding Details',
    description: 'Personal contact details and forwarding address for P60s, pension correspondence, and references.'
  });

  card.appendChild(textInput({
    label: 'Forwarding address — line 1',
    section: 'forwardingDetails', field: 'forwardingAddressLine1'
  }));
  card.appendChild(textInput({
    label: 'Forwarding address — line 2',
    section: 'forwardingDetails', field: 'forwardingAddressLine2'
  }));
  const cityRow = document.createElement('div');
  cityRow.className = 'two-col';
  cityRow.appendChild(textInput({
    label: 'City / town',
    section: 'forwardingDetails', field: 'forwardingCity'
  }));
  cityRow.appendChild(textInput({
    label: 'Postcode',
    section: 'forwardingDetails', field: 'forwardingPostcode'
  }));
  card.appendChild(cityRow);
  card.appendChild(textInput({
    label: 'Country',
    section: 'forwardingDetails', field: 'forwardingCountry'
  }));

  card.appendChild(subheader('Personal contact'));
  const contactRow = document.createElement('div');
  contactRow.className = 'two-col';
  contactRow.appendChild(textInput({
    label: 'Personal email',
    section: 'forwardingDetails', field: 'personalEmail', type: 'email'
  }));
  contactRow.appendChild(textInput({
    label: 'Personal phone',
    section: 'forwardingDetails', field: 'personalPhone', type: 'tel'
  }));
  card.appendChild(contactRow);

  card.appendChild(radioGroup({
    label: 'Forwarding details confirmed by the employee?',
    section: 'forwardingDetails', field: 'forwardingDetailsConfirmed', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Forwarding notes',
    section: 'forwardingDetails', field: 'forwardingNotes',
    placeholder: 'Any preferences (no contact, alternate address)…',
    rows: 3
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Sign-off',
    description: 'Final sign-off by HR, line manager, and IT, plus the employee acknowledgement.'
  });

  card.appendChild(subheader('HR sign-off'));
  card.appendChild(radioGroup({
    label: 'HR has signed off the offboarding?',
    section: 'signoff', field: 'hrSignedOff', options: yesNo,
    mandatory: true, blocker: true
  }));
  const hrHost = document.createElement('div');
  hrHost.dataset.conditional = 'signoff.hrSignedOff=yes';
  const hrRow = document.createElement('div');
  hrRow.className = 'two-col';
  hrRow.appendChild(textInput({
    label: 'HR signatory name',
    section: 'signoff', field: 'hrSignOffName'
  }));
  hrRow.appendChild(textInput({
    label: 'HR sign-off date',
    section: 'signoff', field: 'hrSignOffDate', type: 'date'
  }));
  hrHost.appendChild(hrRow);
  card.appendChild(hrHost);

  card.appendChild(subheader('Line manager sign-off'));
  card.appendChild(radioGroup({
    label: 'Line manager has signed off the offboarding?',
    section: 'signoff', field: 'lineManagerSignedOff', options: yesNo,
    mandatory: true, blocker: true
  }));
  const lmHost = document.createElement('div');
  lmHost.dataset.conditional = 'signoff.lineManagerSignedOff=yes';
  const lmRow = document.createElement('div');
  lmRow.className = 'two-col';
  lmRow.appendChild(textInput({
    label: 'Line manager name',
    section: 'signoff', field: 'lineManagerSignOffName'
  }));
  lmRow.appendChild(textInput({
    label: 'Line manager sign-off date',
    section: 'signoff', field: 'lineManagerSignOffDate', type: 'date'
  }));
  lmHost.appendChild(lmRow);
  card.appendChild(lmHost);

  card.appendChild(subheader('IT sign-off'));
  card.appendChild(radioGroup({
    label: 'IT has signed off the offboarding?',
    section: 'signoff', field: 'itSignedOff', options: yesNo,
    mandatory: true, blocker: true
  }));
  const itHost = document.createElement('div');
  itHost.dataset.conditional = 'signoff.itSignedOff=yes';
  const itRow = document.createElement('div');
  itRow.className = 'two-col';
  itRow.appendChild(textInput({
    label: 'IT signatory name',
    section: 'signoff', field: 'itSignOffName'
  }));
  itRow.appendChild(textInput({
    label: 'IT sign-off date',
    section: 'signoff', field: 'itSignOffDate', type: 'date'
  }));
  itHost.appendChild(itRow);
  card.appendChild(itHost);

  card.appendChild(subheader('Employee acknowledgement'));
  card.appendChild(radioGroup({
    label: 'Has the employee acknowledged offboarding completion?',
    section: 'signoff', field: 'employeeAcknowledged', options: yesNo
  }));
  const empHost = document.createElement('div');
  empHost.dataset.conditional = 'signoff.employeeAcknowledged=yes';
  empHost.appendChild(textInput({
    label: 'Employee sign-off date',
    section: 'signoff', field: 'employeeSignOffDate', type: 'date'
  }));
  card.appendChild(empHost);

  card.appendChild(textArea({
    label: 'Sign-off notes',
    section: 'signoff', field: 'signoffNotes',
    placeholder: 'Any final notes about the offboarding…',
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
// commonly-collected employee-detail fields.
const TRACKED_FIELDS = [
  // Employee details (5)
  ['employeeDetails', 'firstName'],
  ['employeeDetails', 'lastName'],
  ['employeeDetails', 'jobTitle'],
  ['employeeDetails', 'lastWorkingDay'],
  ['employeeDetails', 'reasonForLeaving'],
  // Exit interview (3)
  ['exitInterview', 'interviewOffered'],
  ['exitInterview', 'interviewCompleted'],
  ['exitInterview', 'concernsRaised'],
  // Knowledge transfer (5)
  ['knowledgeTransfer', 'successorIdentified'],
  ['knowledgeTransfer', 'handoverDocumentCreated'],
  ['knowledgeTransfer', 'workInProgressDocumented'],
  ['knowledgeTransfer', 'keyContactsShared'],
  ['knowledgeTransfer', 'clinicalCaseloadReassigned'],
  // Equipment return (6)
  ['equipmentReturn', 'laptopReturned'],
  ['equipmentReturn', 'mobilePhoneReturned'],
  ['equipmentReturn', 'idBadgeReturned'],
  ['equipmentReturn', 'keysReturned'],
  ['equipmentReturn', 'uniformReturned'],
  ['equipmentReturn', 'parkingPassReturned'],
  // Access revocation (8)
  ['accessRevocation', 'emailRevoked'],
  ['accessRevocation', 'ehrEprRevoked'],
  ['accessRevocation', 'vpnRevoked'],
  ['accessRevocation', 'activeDirectoryDisabled'],
  ['accessRevocation', 'buildingAccessRevoked'],
  ['accessRevocation', 'cloudAppsRevoked'],
  ['accessRevocation', 'dataDownloadAuditPerformed'],
  ['accessRevocation', 'unauthorisedDownloadDetected'],
  // Final payroll (6)
  ['finalPayrollBenefits', 'finalSalaryCalculated'],
  ['finalPayrollBenefits', 'accruedHolidayPaid'],
  ['finalPayrollBenefits', 'expensesReimbursed'],
  ['finalPayrollBenefits', 'p45Issued'],
  ['finalPayrollBenefits', 'benefitsTerminated'],
  ['finalPayrollBenefits', 'payrollDetailsConfirmed'],
  // References (3)
  ['referencesRecommendations', 'referenceConsentGiven'],
  ['referencesRecommendations', 'recommendationLetterRequested'],
  ['referencesRecommendations', 'referencePolicyExplained'],
  // NDA / post-employment (5)
  ['nonDisclosurePostEmployment', 'confidentialityReaffirmed'],
  ['nonDisclosurePostEmployment', 'restrictiveCovenantsExplained'],
  ['nonDisclosurePostEmployment', 'intellectualPropertyAssigned'],
  ['nonDisclosurePostEmployment', 'dataReturnedOrDestroyed'],
  ['nonDisclosurePostEmployment', 'postEmploymentObligationsExplained'],
  // Forwarding (3)
  ['forwardingDetails', 'forwardingAddressLine1'],
  ['forwardingDetails', 'forwardingPostcode'],
  ['forwardingDetails', 'forwardingDetailsConfirmed'],
  // Sign-off (4)
  ['signoff', 'hrSignedOff'],
  ['signoff', 'lineManagerSignedOff'],
  ['signoff', 'itSignedOff'],
  ['signoff', 'employeeAcknowledged']
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
  { step: 1,  section: 'employeeDetails',              title: 'Employee Details' },
  { step: 2,  section: 'exitInterview',                title: 'Exit Interview' },
  { step: 3,  section: 'knowledgeTransfer',            title: 'Knowledge Transfer' },
  { step: 4,  section: 'equipmentReturn',              title: 'Equipment Return' },
  { step: 5,  section: 'accessRevocation',             title: 'Access Revocation' },
  { step: 6,  section: 'finalPayrollBenefits',         title: 'Payroll & Benefits' },
  { step: 7,  section: 'referencesRecommendations',    title: 'References' },
  { step: 8,  section: 'nonDisclosurePostEmployment',  title: 'NDA & Post-Employment' },
  { step: 9,  section: 'forwardingDetails',            title: 'Forwarding' },
  { step: 10, section: 'signoff',                      title: 'Sign-off' }
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    outcome,
    completionPercent,
    blockers,
    firedRules,
    additionalFlags,
    mandatoryTotal,
    mandatorySatisfied,
    timestamp
  } = lastResult;

  // Gauge fill class derived from outcome
  const gaugeClass = `gauge-${outcome}`;

  // Blockers list
  const blockersHtml = blockers.length === 0
    ? `<p class="muted">No blocking items outstanding.</p>`
    : `
      <ul class="blockers">
        ${blockers.map((b) => `
          <li>
            <span class="blocker-id">${esc(b.id)}</span>
            <span class="blocker-category">${esc(b.category)}:</span>
            <span class="blocker-description">${esc(b.description)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  // Flagged issues list
  const flagsList = additionalFlags.length === 0
    ? `<p class="muted">No additional flags raised.</p>`
    : `
      <ul class="flags">
        ${additionalFlags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority))}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.message)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  // Fired rules table (all outstanding items, not just blockers)
  const firedRows = firedRules.map((r) => {
    const tags = [];
    if (r.mandatory) tags.push(`<span class="tag tag-mandatory">Mandatory</span>`);
    else tags.push(`<span class="tag tag-optional">Optional</span>`);
    if (r.blocker) tags.push(`<span class="tag tag-blocker">Blocker</span>`);
    return `
      <tr>
        <th scope="row">${esc(r.id)}</th>
        <td>${esc(r.category)}</td>
        <td>${esc(r.description)}</td>
        <td class="num">${tags.join(' ')}</td>
      </tr>
    `;
  }).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No outstanding items - excellent.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Outstanding item</th>
            <th scope="col">Type</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <h2>Offboarding Validation Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Outcome</h3>
    <p class="outcome-summary">
      <span class="outcome-badge ${outcomeClass(outcome)}">${esc(outcomeLabel(outcome))}</span>
    </p>
    <p class="muted">
      ${mandatorySatisfied} of ${mandatoryTotal} mandatory items confirmed.
    </p>

    <h3>Mandatory completion</h3>
    <div class="gauge" aria-label="Mandatory completion gauge">
      <div class="gauge-track">
        <div class="gauge-fill ${gaugeClass}" style="width:${completionPercent}%"></div>
      </div>
      <span class="gauge-percent">${completionPercent}%</span>
    </div>

    <h3>Blockers</h3>
    ${blockersHtml}

    <h3>Outstanding items</h3>
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
  const result = validateChecklist(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    outcome: result.outcome,
    completionPercent: result.completionPercent,
    blockers: result.blockers,
    firedRules: result.firedRules,
    additionalFlags,
    mandatoryTotal: result.mandatoryTotal,
    mandatorySatisfied: result.mandatorySatisfied,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh offboarding checklist?')) return;
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

// Silence unused-variable lint for the `conditional` helper when a step
// doesn't reach for it; it's defined for future use.
void conditional;
