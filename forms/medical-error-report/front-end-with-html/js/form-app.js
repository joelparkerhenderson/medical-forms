import { calculateErrorGrade } from './error-grader.js';
import { emptyAssessment, errorTypeLabel, nccMerpLabel, riskLevelClass, riskLevelLabel, whoSeverityLabel } from './types.js';

// Medical Error Report - reporter wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary, native <progress> bar and step-list reflect how many
// fields have been answered. Submission runs the pure error-grading engine
// and renders an inline report. State is persisted to localStorage so a
// partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'medical-error-report.front-end-form-with-html.v1';
const TOTAL_STEPS = 10;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyAssessment();

  for (const key of Object.keys(fresh)) {
    if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null) {
      fresh[key] = Object.assign({}, fresh[key], parsed[key]);
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
    console.warn('Could not parse saved report; starting fresh.', e);
    return emptyAssessment();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save report to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored report.', e);
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
  slug: 'medical-error-report',
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

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ----------------------------------------------------------------------
// Component builders (Lily-shaped)
// ----------------------------------------------------------------------

/** Map an HTML input `type` to the Lily class for its input element. */
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
    `value="${esc(value == null ? '' : value)}"`
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

function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] || '';
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

function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] || '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');

  const required = opts.required ? ' data-required required' : '';

  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select"${required} aria-describedby="${id}-error">
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

// ----------------------------------------------------------------------
// Shared option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];
const yesNoNA = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not-applicable', label: 'Not applicable' }
];

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Reporter information and facility details.'
  });

  card.appendChild(radioGroup({
    label: 'Submit this report anonymously?',
    section: 'demographics', field: 'anonymousReport', options: yesNo
  }));

  const reporterDetails = document.createElement('div');
  reporterDetails.dataset.conditionalNot = 'demographics.anonymousReport=yes';
  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'Reporter First Name', section: 'demographics', field: 'reporterFirstName', required: true }));
  grid.appendChild(textInput({ label: 'Reporter Last Name', section: 'demographics', field: 'reporterLastName', required: true }));
  reporterDetails.appendChild(grid);

  reporterDetails.appendChild(selectInput({
    label: 'Reporter Role',
    section: 'demographics', field: 'reporterRole', required: true,
    options: [
      { value: 'doctor', label: 'Doctor' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'pharmacist', label: 'Pharmacist' },
      { value: 'allied-health', label: 'Allied Health Professional' },
      { value: 'administrator', label: 'Administrator' },
      { value: 'patient', label: 'Patient' },
      { value: 'other', label: 'Other' }
    ]
  }));
  reporterDetails.appendChild(textInput({ label: 'Department', section: 'demographics', field: 'reporterDepartment' }));

  const contactGrid = document.createElement('div');
  contactGrid.className = 'two-col';
  contactGrid.appendChild(textInput({ label: 'Contact Phone', section: 'demographics', field: 'reporterContactPhone', type: 'tel' }));
  contactGrid.appendChild(textInput({ label: 'Contact Email', section: 'demographics', field: 'reporterContactEmail', type: 'email' }));
  reporterDetails.appendChild(contactGrid);
  card.appendChild(reporterDetails);

  card.appendChild(textInput({ label: 'Facility Name', section: 'demographics', field: 'facilityName', required: true }));
  card.appendChild(textInput({ label: 'Ward / Unit', section: 'demographics', field: 'facilityWard' }));
  card.appendChild(textInput({ label: 'Report Date', section: 'demographics', field: 'reportDate', type: 'date', required: true }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Incident Details',
    description: 'When, where, and how the incident occurred.'
  });

  const dateGrid = document.createElement('div');
  dateGrid.className = 'two-col';
  dateGrid.appendChild(textInput({ label: 'Incident Date', section: 'incidentDetails', field: 'incidentDate', type: 'date', required: true }));
  dateGrid.appendChild(textInput({ label: 'Incident Time', section: 'incidentDetails', field: 'incidentTime', type: 'time' }));
  card.appendChild(dateGrid);

  const discoveryGrid = document.createElement('div');
  discoveryGrid.className = 'two-col';
  discoveryGrid.appendChild(textInput({ label: 'Discovery Date', section: 'incidentDetails', field: 'discoveryDate', type: 'date' }));
  discoveryGrid.appendChild(textInput({ label: 'Discovery Time', section: 'incidentDetails', field: 'discoveryTime', type: 'time' }));
  card.appendChild(discoveryGrid);

  card.appendChild(selectInput({
    label: 'Location Type', section: 'incidentDetails', field: 'locationType',
    options: [
      { value: 'inpatient-ward', label: 'Inpatient Ward' },
      { value: 'outpatient-clinic', label: 'Outpatient Clinic' },
      { value: 'emergency-department', label: 'Emergency Department' },
      { value: 'operating-theatre', label: 'Operating Theatre' },
      { value: 'pharmacy', label: 'Pharmacy' },
      { value: 'laboratory', label: 'Laboratory' },
      { value: 'radiology', label: 'Radiology' },
      { value: 'community', label: 'Community' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({ label: 'Location Details (room, bay, etc.)', section: 'incidentDetails', field: 'locationDetails' }));

  card.appendChild(textArea({
    label: 'Incident Summary',
    section: 'incidentDetails', field: 'incidentSummary',
    placeholder: 'Describe what happened in factual, objective terms…',
    rows: 5
  }));

  card.appendChild(radioGroup({
    label: 'Was the incident witnessed?',
    section: 'incidentDetails', field: 'incidentWitnessed', options: yesNo
  }));
  const witnessHost = document.createElement('div');
  witnessHost.dataset.conditional = 'incidentDetails.incidentWitnessed=yes';
  witnessHost.appendChild(textArea({
    label: 'Witness Details (names, roles, contact)',
    section: 'incidentDetails', field: 'witnessDetails',
    rows: 2
  }));
  card.appendChild(witnessHost);

  card.appendChild(selectInput({
    label: 'Shift Type', section: 'incidentDetails', field: 'shiftType',
    options: [
      { value: 'day', label: 'Day' },
      { value: 'evening', label: 'Evening' },
      { value: 'night', label: 'Night' },
      { value: 'weekend', label: 'Weekend' },
      { value: 'bank-holiday', label: 'Bank Holiday' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Staffing Level', section: 'incidentDetails', field: 'staffingLevel',
    options: [
      { value: 'adequate', label: 'Adequate' },
      { value: 'understaffed', label: 'Understaffed' },
      { value: 'overstaffed', label: 'Overstaffed' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Patient Involvement',
    description: 'Identifies the patient and tracks duty-of-candour obligations.'
  });

  card.appendChild(radioGroup({
    label: 'Was a patient involved in this incident?',
    section: 'patientInvolvement', field: 'patientInvolved', options: yesNo
  }));

  const host = document.createElement('div');
  host.dataset.conditional = 'patientInvolvement.patientInvolved=yes';

  const nameGrid = document.createElement('div');
  nameGrid.className = 'two-col';
  nameGrid.appendChild(textInput({ label: 'Patient First Name', section: 'patientInvolvement', field: 'patientFirstName' }));
  nameGrid.appendChild(textInput({ label: 'Patient Last Name', section: 'patientInvolvement', field: 'patientLastName' }));
  host.appendChild(nameGrid);

  host.appendChild(textInput({ label: 'NHS Number / MRN', section: 'patientInvolvement', field: 'patientNhsNumber' }));

  const dobGrid = document.createElement('div');
  dobGrid.className = 'two-col';
  dobGrid.appendChild(textInput({ label: 'Date of Birth', section: 'patientInvolvement', field: 'patientDateOfBirth', type: 'date' }));
  dobGrid.appendChild(textInput({ label: 'Age at Incident', section: 'patientInvolvement', field: 'patientAgeAtIncident', type: 'number', min: 0, max: 130 }));
  host.appendChild(dobGrid);

  host.appendChild(radioGroup({
    label: 'Sex', section: 'patientInvolvement', field: 'patientSex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  host.appendChild(radioGroup({
    label: 'Has the patient been informed about the incident?',
    section: 'patientInvolvement', field: 'patientInformed', options: yesNo
  }));
  const informedHost = document.createElement('div');
  informedHost.dataset.conditional = 'patientInvolvement.patientInformed=yes';
  const infGrid = document.createElement('div');
  infGrid.className = 'two-col';
  infGrid.appendChild(textInput({ label: 'Informed Date', section: 'patientInvolvement', field: 'patientInformedDate', type: 'date' }));
  infGrid.appendChild(textInput({ label: 'Informed By', section: 'patientInvolvement', field: 'patientInformedBy' }));
  informedHost.appendChild(infGrid);
  host.appendChild(informedHost);

  host.appendChild(radioGroup({
    label: 'Does duty of candour apply?',
    section: 'patientInvolvement', field: 'dutyOfCandourApplies', options: yesNo
  }));
  const docHost = document.createElement('div');
  docHost.dataset.conditional = 'patientInvolvement.dutyOfCandourApplies=yes';
  docHost.appendChild(radioGroup({
    label: 'Has duty of candour been completed?',
    section: 'patientInvolvement', field: 'dutyOfCandourCompleted', options: yesNo
  }));
  host.appendChild(docHost);

  card.appendChild(host);
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Error Classification',
    description: 'WHO severity, NCC MERP category, preventability, and recurrence.'
  });

  card.appendChild(selectInput({
    label: 'Error Type', section: 'errorClassification', field: 'errorType', required: true,
    options: [
      { value: 'medication', label: 'Medication Error' },
      { value: 'surgical', label: 'Surgical Error' },
      { value: 'diagnostic', label: 'Diagnostic Error' },
      { value: 'treatment', label: 'Treatment Error' },
      { value: 'communication', label: 'Communication Error' },
      { value: 'equipment', label: 'Equipment Error' },
      { value: 'fall', label: 'Fall' },
      { value: 'infection', label: 'Healthcare-Associated Infection' },
      { value: 'transfusion', label: 'Transfusion Error' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Error Type Details', section: 'errorClassification', field: 'errorTypeDetails'
  }));

  const medStageHost = document.createElement('div');
  medStageHost.dataset.conditional = 'errorClassification.errorType=medication';
  medStageHost.appendChild(selectInput({
    label: 'Medication Error Stage',
    section: 'errorClassification', field: 'medicationErrorStage',
    options: [
      { value: 'prescribing', label: 'Prescribing' },
      { value: 'dispensing', label: 'Dispensing' },
      { value: 'administration', label: 'Administration' },
      { value: 'monitoring', label: 'Monitoring' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(medStageHost);

  card.appendChild(selectInput({
    label: 'WHO Severity', section: 'errorClassification', field: 'whoSeverity', required: true,
    options: [
      { value: 'near-miss', label: 'Near Miss - No harm reached patient' },
      { value: 'mild', label: 'Mild - Temporary minor harm' },
      { value: 'moderate', label: 'Moderate - Temporary significant harm' },
      { value: 'severe', label: 'Severe - Permanent harm' },
      { value: 'critical', label: 'Critical - Death or life-threatening' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'NCC MERP Category', section: 'errorClassification', field: 'nccMerpCategory',
    options: [
      { value: 'A', label: 'A - Capacity to cause error' },
      { value: 'B', label: 'B - Error did not reach patient' },
      { value: 'C', label: 'C - Reached patient, no harm' },
      { value: 'D', label: 'D - Required monitoring, no harm' },
      { value: 'E', label: 'E - Temporary harm, intervention required' },
      { value: 'F', label: 'F - Temporary harm, hospitalisation' },
      { value: 'G', label: 'G - Permanent harm' },
      { value: 'H', label: 'H - Intervention to sustain life' },
      { value: 'I', label: 'I - Patient death' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Preventability', section: 'errorClassification', field: 'preventability',
    options: [
      { value: 'clearly-preventable', label: 'Clearly preventable' },
      { value: 'probably-preventable', label: 'Probably preventable' },
      { value: 'probably-not-preventable', label: 'Probably not preventable' },
      { value: 'clearly-not-preventable', label: 'Clearly not preventable' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Recurrence Likelihood', section: 'errorClassification', field: 'recurrenceLikelihood',
    options: [
      { value: 'very-likely', label: 'Very likely' },
      { value: 'likely', label: 'Likely' },
      { value: 'unlikely', label: 'Unlikely' },
      { value: 'very-unlikely', label: 'Very unlikely' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Contributing Factors',
    description: 'Human, system, and environmental factors that contributed to the error.'
  });

  card.appendChild(radioGroup({ label: 'Staff fatigue contributed?', section: 'contributingFactors', field: 'staffFatigue', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Inadequate training contributed?', section: 'contributingFactors', field: 'inadequateTraining', options: yesNo }));

  card.appendChild(radioGroup({ label: 'Communication failure contributed?', section: 'contributingFactors', field: 'communicationFailure', options: yesNo }));
  const commHost = document.createElement('div');
  commHost.dataset.conditional = 'contributingFactors.communicationFailure=yes';
  commHost.appendChild(textArea({ label: 'Communication failure details', section: 'contributingFactors', field: 'communicationFailureDetails', rows: 2 }));
  card.appendChild(commHost);

  card.appendChild(radioGroup({ label: 'Handover failure contributed?', section: 'contributingFactors', field: 'handoverFailure', options: yesNo }));

  card.appendChild(radioGroup({ label: 'Equipment failure contributed?', section: 'contributingFactors', field: 'equipmentFailure', options: yesNo }));
  const equipHost = document.createElement('div');
  equipHost.dataset.conditional = 'contributingFactors.equipmentFailure=yes';
  equipHost.appendChild(textArea({ label: 'Equipment failure details', section: 'contributingFactors', field: 'equipmentFailureDetails', rows: 2 }));
  card.appendChild(equipHost);

  card.appendChild(radioGroup({ label: 'Environmental factors contributed?', section: 'contributingFactors', field: 'environmentalFactors', options: yesNo }));
  const envHost = document.createElement('div');
  envHost.dataset.conditional = 'contributingFactors.environmentalFactors=yes';
  envHost.appendChild(textArea({ label: 'Environmental details', section: 'contributingFactors', field: 'environmentalDetails', rows: 2 }));
  card.appendChild(envHost);

  card.appendChild(radioGroup({ label: 'Policy or protocol not followed?', section: 'contributingFactors', field: 'policyNotFollowed', options: yesNo }));
  const policyHost = document.createElement('div');
  policyHost.dataset.conditional = 'contributingFactors.policyNotFollowed=yes';
  policyHost.appendChild(textArea({ label: 'Policy / protocol details', section: 'contributingFactors', field: 'policyDetails', rows: 2 }));
  card.appendChild(policyHost);

  card.appendChild(radioGroup({ label: 'Workload pressure contributed?', section: 'contributingFactors', field: 'workloadPressure', options: yesNo }));

  card.appendChild(radioGroup({ label: 'Patient factors contributed?', section: 'contributingFactors', field: 'patientFactors', options: yesNo }));
  const pfHost = document.createElement('div');
  pfHost.dataset.conditional = 'contributingFactors.patientFactors=yes';
  pfHost.appendChild(textArea({ label: 'Patient factor details', section: 'contributingFactors', field: 'patientFactorsDetails', rows: 2 }));
  card.appendChild(pfHost);

  card.appendChild(textArea({
    label: 'Other contributing factors',
    section: 'contributingFactors', field: 'otherFactors',
    rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Immediate Actions Taken',
    description: 'Immediate response after the incident was identified.'
  });

  card.appendChild(radioGroup({ label: 'Was the patient assessed?', section: 'immediateActions', field: 'patientAssessed', options: yesNoNA }));
  card.appendChild(radioGroup({ label: 'Was treatment provided?', section: 'immediateActions', field: 'treatmentProvided', options: yesNoNA }));
  const tHost = document.createElement('div');
  tHost.dataset.conditional = 'immediateActions.treatmentProvided=yes';
  tHost.appendChild(textArea({ label: 'Treatment details', section: 'immediateActions', field: 'treatmentDetails', rows: 2 }));
  card.appendChild(tHost);

  card.appendChild(radioGroup({ label: 'Was the error contained?', section: 'immediateActions', field: 'errorContained', options: yesNo }));
  const cHost = document.createElement('div');
  cHost.dataset.conditional = 'immediateActions.errorContained=yes';
  cHost.appendChild(textArea({ label: 'Containment details', section: 'immediateActions', field: 'containmentDetails', rows: 2 }));
  card.appendChild(cHost);

  card.appendChild(radioGroup({ label: 'Were senior staff notified?', section: 'immediateActions', field: 'seniorStaffNotified', options: yesNo }));
  const ssHost = document.createElement('div');
  ssHost.dataset.conditional = 'immediateActions.seniorStaffNotified=yes';
  const ssGrid = document.createElement('div');
  ssGrid.className = 'two-col';
  ssGrid.appendChild(textInput({ label: 'Senior staff name', section: 'immediateActions', field: 'seniorStaffName' }));
  ssGrid.appendChild(textInput({ label: 'Senior staff role', section: 'immediateActions', field: 'seniorStaffRole' }));
  ssHost.appendChild(ssGrid);
  card.appendChild(ssHost);

  card.appendChild(radioGroup({ label: 'Was the risk team notified?', section: 'immediateActions', field: 'riskTeamNotified', options: yesNo }));

  card.appendChild(radioGroup({ label: 'Is additional monitoring required?', section: 'immediateActions', field: 'additionalMonitoring', options: yesNo }));
  const mHost = document.createElement('div');
  mHost.dataset.conditional = 'immediateActions.additionalMonitoring=yes';
  mHost.appendChild(textArea({ label: 'Monitoring details', section: 'immediateActions', field: 'monitoringDetails', rows: 2 }));
  card.appendChild(mHost);

  card.appendChild(textArea({
    label: 'Summary of immediate actions',
    section: 'immediateActions', field: 'immediateActionsSummary',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Patient Outcome',
    description: 'Harm reaching the patient and downstream consequences.'
  });

  card.appendChild(radioGroup({ label: 'Did harm reach the patient?', section: 'patientOutcome', field: 'harmReachedPatient', options: yesNo }));
  card.appendChild(selectInput({
    label: 'Harm Level', section: 'patientOutcome', field: 'harmLevel',
    options: [
      { value: 'none', label: 'None' },
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' },
      { value: 'death', label: 'Death' }
    ]
  }));
  card.appendChild(textArea({ label: 'Harm description', section: 'patientOutcome', field: 'harmDescription', rows: 3 }));

  card.appendChild(radioGroup({ label: 'Additional treatment required?', section: 'patientOutcome', field: 'additionalTreatmentRequired', options: yesNo }));
  const atrHost = document.createElement('div');
  atrHost.dataset.conditional = 'patientOutcome.additionalTreatmentRequired=yes';
  atrHost.appendChild(textArea({ label: 'Additional treatment details', section: 'patientOutcome', field: 'additionalTreatmentDetails', rows: 2 }));
  card.appendChild(atrHost);

  card.appendChild(radioGroup({ label: 'Extended hospital stay?', section: 'patientOutcome', field: 'extendedHospitalStay', options: yesNo }));
  const ehHost = document.createElement('div');
  ehHost.dataset.conditional = 'patientOutcome.extendedHospitalStay=yes';
  ehHost.appendChild(textInput({ label: 'Extra days', section: 'patientOutcome', field: 'extraDays', type: 'number', min: 0, max: 365 }));
  card.appendChild(ehHost);

  card.appendChild(radioGroup({ label: 'Readmission required?', section: 'patientOutcome', field: 'readmissionRequired', options: yesNo }));

  card.appendChild(radioGroup({ label: 'Permanent disability?', section: 'patientOutcome', field: 'permanentDisability', options: yesNo }));
  const pdHost = document.createElement('div');
  pdHost.dataset.conditional = 'patientOutcome.permanentDisability=yes';
  pdHost.appendChild(textArea({ label: 'Disability details', section: 'patientOutcome', field: 'disabilityDetails', rows: 2 }));
  card.appendChild(pdHost);

  card.appendChild(radioGroup({ label: 'Did the patient die as a result of the error?', section: 'patientOutcome', field: 'patientDied', options: yesNo }));
  const dHost = document.createElement('div');
  dHost.dataset.conditional = 'patientOutcome.patientDied=yes';
  dHost.appendChild(textInput({ label: 'Date of death', section: 'patientOutcome', field: 'deathDate', type: 'date' }));
  card.appendChild(dHost);

  card.appendChild(textArea({
    label: 'Outcome notes',
    section: 'patientOutcome', field: 'outcomeNotes',
    rows: 3
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Root Cause Analysis',
    description: 'Investigation findings and systemic vulnerabilities.'
  });

  card.appendChild(selectInput({
    label: 'RCA Conducted?',
    section: 'rootCauseAnalysis', field: 'rcaConducted',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'pending', label: 'Pending' }
    ]
  }));

  const rcaHost = document.createElement('div');
  rcaHost.dataset.conditional = 'rootCauseAnalysis.rcaConducted=yes';
  const rcaGrid = document.createElement('div');
  rcaGrid.className = 'two-col';
  rcaGrid.appendChild(textInput({ label: 'RCA Date', section: 'rootCauseAnalysis', field: 'rcaDate', type: 'date' }));
  rcaGrid.appendChild(textInput({ label: 'RCA Lead', section: 'rootCauseAnalysis', field: 'rcaLead' }));
  rcaHost.appendChild(rcaGrid);
  rcaHost.appendChild(textArea({ label: 'RCA Team Members', section: 'rootCauseAnalysis', field: 'rcaTeamMembers', rows: 2 }));
  card.appendChild(rcaHost);

  card.appendChild(selectInput({
    label: 'Root Cause Category',
    section: 'rootCauseAnalysis', field: 'rootCauseCategory',
    options: [
      { value: 'human-error', label: 'Human error' },
      { value: 'system-failure', label: 'System failure' },
      { value: 'process-failure', label: 'Process failure' },
      { value: 'communication', label: 'Communication' },
      { value: 'training', label: 'Training' },
      { value: 'equipment', label: 'Equipment' },
      { value: 'environmental', label: 'Environmental' },
      { value: 'organisational', label: 'Organisational' },
      { value: 'multiple', label: 'Multiple' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textArea({ label: 'Root cause description', section: 'rootCauseAnalysis', field: 'rootCauseDescription', rows: 3 }));
  card.appendChild(textArea({ label: 'Five whys analysis', section: 'rootCauseAnalysis', field: 'fiveWhysAnalysis', rows: 4 }));
  card.appendChild(textArea({ label: 'Fishbone factors', section: 'rootCauseAnalysis', field: 'fishboneFactors', rows: 3 }));
  card.appendChild(textArea({ label: 'System vulnerabilities', section: 'rootCauseAnalysis', field: 'systemVulnerabilities', rows: 3 }));

  card.appendChild(selectInput({
    label: 'Have similar incidents occurred previously?',
    section: 'rootCauseAnalysis', field: 'similarIncidents',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  const simHost = document.createElement('div');
  simHost.dataset.conditional = 'rootCauseAnalysis.similarIncidents=yes';
  simHost.appendChild(textArea({ label: 'Similar incidents details', section: 'rootCauseAnalysis', field: 'similarIncidentsDetails', rows: 3 }));
  card.appendChild(simHost);

  card.appendChild(textArea({ label: 'RCA findings summary', section: 'rootCauseAnalysis', field: 'rcaFindingsSummary', rows: 3 }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Corrective Actions',
    description: 'Immediate fixes and longer-term system changes.'
  });

  card.appendChild(textArea({ label: 'Immediate corrective actions', section: 'correctiveActions', field: 'immediateCorrectiveActions', rows: 3 }));
  card.appendChild(textArea({ label: 'Long-term corrective actions', section: 'correctiveActions', field: 'longTermCorrectiveActions', rows: 3 }));

  card.appendChild(radioGroup({ label: 'Policy change required?', section: 'correctiveActions', field: 'policyChangeRequired', options: yesNo }));
  const pcHost = document.createElement('div');
  pcHost.dataset.conditional = 'correctiveActions.policyChangeRequired=yes';
  pcHost.appendChild(textArea({ label: 'Policy change details', section: 'correctiveActions', field: 'policyChangeDetails', rows: 2 }));
  card.appendChild(pcHost);

  card.appendChild(radioGroup({ label: 'Training required?', section: 'correctiveActions', field: 'trainingRequired', options: yesNo }));
  const trHost = document.createElement('div');
  trHost.dataset.conditional = 'correctiveActions.trainingRequired=yes';
  trHost.appendChild(textArea({ label: 'Training details', section: 'correctiveActions', field: 'trainingDetails', rows: 2 }));
  card.appendChild(trHost);

  card.appendChild(radioGroup({ label: 'Equipment change required?', section: 'correctiveActions', field: 'equipmentChangeRequired', options: yesNo }));
  const ecHost = document.createElement('div');
  ecHost.dataset.conditional = 'correctiveActions.equipmentChangeRequired=yes';
  ecHost.appendChild(textArea({ label: 'Equipment change details', section: 'correctiveActions', field: 'equipmentChangeDetails', rows: 2 }));
  card.appendChild(ecHost);

  card.appendChild(radioGroup({ label: 'Process redesign required?', section: 'correctiveActions', field: 'processRedesignRequired', options: yesNo }));
  const prHost = document.createElement('div');
  prHost.dataset.conditional = 'correctiveActions.processRedesignRequired=yes';
  prHost.appendChild(textArea({ label: 'Process redesign details', section: 'correctiveActions', field: 'processRedesignDetails', rows: 2 }));
  card.appendChild(prHost);

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'Responsible person', section: 'correctiveActions', field: 'responsiblePerson' }));
  grid.appendChild(textInput({ label: 'Target completion date', section: 'correctiveActions', field: 'targetCompletionDate', type: 'date' }));
  card.appendChild(grid);

  card.appendChild(selectInput({
    label: 'Actions Status', section: 'correctiveActions', field: 'actionsStatus',
    options: [
      { value: 'planned', label: 'Planned' },
      { value: 'in-progress', label: 'In progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'overdue', label: 'Overdue' }
    ]
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Reporting & Follow-up',
    description: 'External reporting, lessons learned, and final status.'
  });

  card.appendChild(textInput({ label: 'Internal reference', section: 'reportingFollowup', field: 'internalReference' }));

  card.appendChild(radioGroup({ label: 'Reported to Datix?', section: 'reportingFollowup', field: 'reportedToDatix', options: yesNo }));
  const dxHost = document.createElement('div');
  dxHost.dataset.conditional = 'reportingFollowup.reportedToDatix=yes';
  dxHost.appendChild(textInput({ label: 'Datix reference', section: 'reportingFollowup', field: 'datixReference' }));
  card.appendChild(dxHost);

  card.appendChild(radioGroup({ label: 'Reported to NRLS?', section: 'reportingFollowup', field: 'reportedToNrls', options: yesNo }));
  const nrlsHost = document.createElement('div');
  nrlsHost.dataset.conditional = 'reportingFollowup.reportedToNrls=yes';
  nrlsHost.appendChild(textInput({ label: 'NRLS reference', section: 'reportingFollowup', field: 'nrlsReference' }));
  card.appendChild(nrlsHost);

  card.appendChild(radioGroup({ label: 'Reported to CQC?', section: 'reportingFollowup', field: 'reportedToCqc', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Reported to HSIB?', section: 'reportingFollowup', field: 'reportedToHsib', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Reported to Coroner?', section: 'reportingFollowup', field: 'reportedToCoroner', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Safeguarding referral made?', section: 'reportingFollowup', field: 'safeguardingReferral', options: yesNo }));

  card.appendChild(textArea({ label: 'Lessons learned', section: 'reportingFollowup', field: 'lessonsLearned', rows: 3 }));
  card.appendChild(radioGroup({ label: 'Shared with team?', section: 'reportingFollowup', field: 'sharedWithTeam', options: yesNo }));

  const fuGrid = document.createElement('div');
  fuGrid.className = 'two-col';
  fuGrid.appendChild(textInput({ label: 'Follow-up review date', section: 'reportingFollowup', field: 'followUpReviewDate', type: 'date' }));
  fuGrid.appendChild(textInput({ label: 'Follow-up reviewer', section: 'reportingFollowup', field: 'followUpReviewer' }));
  card.appendChild(fuGrid);

  card.appendChild(selectInput({
    label: 'Final Status', section: 'reportingFollowup', field: 'finalStatus',
    options: [
      { value: 'open', label: 'Open' },
      { value: 'under-review', label: 'Under review' },
      { value: 'closed', label: 'Closed' }
    ]
  }));
  card.appendChild(textInput({ label: 'Closure date', section: 'reportingFollowup', field: 'closureDate', type: 'date' }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function getNested(path) {
  const [section, field] = path.split('.');
  if (!state[section]) return undefined;
  return state[section][field];
}

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const eq = expr.indexOf('=');
    const path = expr.slice(0, eq);
    const target = expr.slice(eq + 1);
    const current = String(getNested(path) == null ? '' : getNested(path));
    host.style.display = current === target ? '' : 'none';
  });
  document.querySelectorAll('[data-conditional-not]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-not');
    const eq = expr.indexOf('=');
    const path = expr.slice(0, eq);
    const target = expr.slice(eq + 1);
    const current = String(getNested(path) == null ? '' : getNested(path));
    host.style.display = current !== target ? '' : 'none';
  });
  document.querySelectorAll('[data-conditional-any]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-any');
    const eq = expr.indexOf('=');
    const path = expr.slice(0, eq);
    const targets = expr.slice(eq + 1).split(',');
    const current = String(getNested(path) == null ? '' : getNested(path));
    host.style.display = targets.indexOf(current) !== -1 ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics',         title: 'Demographics' },
  { step: 2,  section: 'incidentDetails',      title: 'Incident Details' },
  { step: 3,  section: 'patientInvolvement',   title: 'Patient Involvement' },
  { step: 4,  section: 'errorClassification',  title: 'Error Classification' },
  { step: 5,  section: 'contributingFactors',  title: 'Contributing Factors' },
  { step: 6,  section: 'immediateActions',     title: 'Immediate Actions' },
  { step: 7,  section: 'patientOutcome',       title: 'Patient Outcome' },
  { step: 8,  section: 'rootCauseAnalysis',    title: 'Root Cause Analysis' },
  { step: 9,  section: 'correctiveActions',    title: 'Corrective Actions' },
  { step: 10, section: 'reportingFollowup',    title: 'Reporting & Follow-up' }
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
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics (anonymous-respecting)
  ['demographics', 'anonymousReport'],
  ['demographics', 'facilityName'],
  ['demographics', 'reportDate'],
  // Incident details
  ['incidentDetails', 'incidentDate'],
  ['incidentDetails', 'locationType'],
  ['incidentDetails', 'incidentSummary'],
  ['incidentDetails', 'incidentWitnessed'],
  ['incidentDetails', 'shiftType'],
  ['incidentDetails', 'staffingLevel'],
  // Patient involvement
  ['patientInvolvement', 'patientInvolved'],
  ['patientInvolvement', 'patientInformed'],
  ['patientInvolvement', 'dutyOfCandourApplies'],
  // Error classification
  ['errorClassification', 'errorType'],
  ['errorClassification', 'whoSeverity'],
  ['errorClassification', 'nccMerpCategory'],
  ['errorClassification', 'preventability'],
  ['errorClassification', 'recurrenceLikelihood'],
  // Contributing factors (9)
  ['contributingFactors', 'staffFatigue'],
  ['contributingFactors', 'inadequateTraining'],
  ['contributingFactors', 'communicationFailure'],
  ['contributingFactors', 'handoverFailure'],
  ['contributingFactors', 'equipmentFailure'],
  ['contributingFactors', 'environmentalFactors'],
  ['contributingFactors', 'policyNotFollowed'],
  ['contributingFactors', 'workloadPressure'],
  ['contributingFactors', 'patientFactors'],
  // Immediate actions
  ['immediateActions', 'patientAssessed'],
  ['immediateActions', 'treatmentProvided'],
  ['immediateActions', 'errorContained'],
  ['immediateActions', 'seniorStaffNotified'],
  ['immediateActions', 'riskTeamNotified'],
  ['immediateActions', 'additionalMonitoring'],
  // Patient outcome
  ['patientOutcome', 'harmReachedPatient'],
  ['patientOutcome', 'harmLevel'],
  ['patientOutcome', 'additionalTreatmentRequired'],
  ['patientOutcome', 'extendedHospitalStay'],
  ['patientOutcome', 'readmissionRequired'],
  ['patientOutcome', 'permanentDisability'],
  ['patientOutcome', 'patientDied'],
  // RCA
  ['rootCauseAnalysis', 'rcaConducted'],
  ['rootCauseAnalysis', 'rootCauseCategory'],
  ['rootCauseAnalysis', 'similarIncidents'],
  // Corrective actions
  ['correctiveActions', 'policyChangeRequired'],
  ['correctiveActions', 'trainingRequired'],
  ['correctiveActions', 'equipmentChangeRequired'],
  ['correctiveActions', 'processRedesignRequired'],
  ['correctiveActions', 'actionsStatus'],
  // Reporting & followup
  ['reportingFollowup', 'reportedToDatix'],
  ['reportingFollowup', 'reportedToNrls'],
  ['reportingFollowup', 'reportedToCqc'],
  ['reportingFollowup', 'reportedToHsib'],
  ['reportingFollowup', 'reportedToCoroner'],
  ['reportingFollowup', 'safeguardingReferral'],
  ['reportingFollowup', 'sharedWithTeam'],
  ['reportingFollowup', 'finalStatus']
];

function isAnswered(v) {
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    if (isAnswered(state[section] && state[section][field])) {
      answered++;
      sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
    }
  }
  const total = TRACKED_FIELDS.length;
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
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
    // Skip required inputs that are inside a hidden conditional host.
    const hostHidden =
      input.closest('[data-conditional]')?.style.display === 'none' ||
      input.closest('[data-conditional-not]')?.style.display === 'none' ||
      input.closest('[data-conditional-any]')?.style.display === 'none';
    if (hostHidden) return;
    const id = input.id;
    const value = (input.value || '').trim();
    if (!value) {
      const labelEl = form.querySelector(`label[for="${id}"]`);
      const label = labelEl
        ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim()
        : id;
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

function gradeClass(grade) {
  if (grade >= 5) return 'grade-5';
  if (grade >= 4) return 'grade-4';
  if (grade >= 3) return 'grade-3';
  if (grade >= 2) return 'grade-2';
  return 'grade-1';
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { whoSeverity, nccMerpCategory, overallRisk, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td class="num"><span class="grade-badge ${gradeClass(r.grade)}">G${r.grade}</span></td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No grading rules fired. Consider completing the Error Classification and Patient Outcome sections.</p>`
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

  out.innerHTML = `
    <h2>Medical Error Report — Grading</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Overall Risk</h3>
    <p class="risk-summary">
      <span class="risk-badge ${riskLevelClass(overallRisk)}">${esc(riskLevelLabel(overallRisk))}</span>
    </p>

    <h3>Reporter Classification</h3>
    <dl class="classification-list">
      <dt>WHO Severity</dt><dd>${esc(whoSeverityLabel(whoSeverity))}</dd>
      <dt>NCC MERP Category</dt><dd>${esc(nccMerpLabel(nccMerpCategory))}</dd>
      <dt>Error Type</dt><dd>${esc(errorTypeLabel(state.errorClassification.errorType))}</dd>
    </dl>

    <h3>Fired Rules (${firedRules.length})</h3>
    ${firedTable}

    <h3>Flagged Issues (${additionalFlags.length})</h3>
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
  lastResult = calculateErrorGrade(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh report?')) return;
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
