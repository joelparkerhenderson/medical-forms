import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateSatisfactionGrade } from './grader.js';
import { emptyAssessment, satisfactionCategoryClass, satisfactionCategoryLabel, severityLabel } from './types.js';

// Patient Satisfaction Survey - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure satisfaction grading engine and renders an inline report.
// State is persisted to localStorage so a partial fill survives a reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'patient-satisfaction-survey.front-end-form-with-html.v1';
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
    console.warn('Could not parse saved survey; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save survey to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored survey.', e);
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
  slug: 'patient-satisfaction-survey',
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

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs progress and conditional visibility after each change.
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
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ----------------------------------------------------------------------
// Component builders (Lily Design System HTML headless classes)
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

/**
 * Build a labelled multi-line text area.
 * @param {{ label: string, section: string, field: string, rows?: number,
 *           placeholder?: string }} opts
 */
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

/**
 * Build a select / dropdown input.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[] }} opts
 */
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
 * Build a radio group using Lily classes.
 * @param {{ label: string, section: string, field: string, layout?: 'wrap' | 'likert',
 *           options: { value: string | number, label: string }[],
 *           parseAs?: 'string' | 'number' }} opts
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
  list.className = opts.layout === 'likert' ? 'radio-group likert-group' : 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.htmlFor = radioId;
    const checked = String(current) === String(option.value) ? ' checked' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (!input.checked) return;
      const v = opts.parseAs === 'number' ? Number(option.value) : option.value;
      setField(opts.section, opts.field, v);
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

/**
 * Convenience: 1-5 Likert radio group with standard "Very Dissatisfied →
 * Very Satisfied" anchors. Stores the value as a number.
 * @param {{ label: string, section: string, field: string }} opts
 */
function likertField(opts) {
  const wrapper = document.createElement('div');
  const hint = document.createElement('p');
  hint.className = 'hint likert-scale-hint';
  hint.textContent = '1 = Very Dissatisfied, 2 = Dissatisfied, 3 = Neutral, 4 = Satisfied, 5 = Very Satisfied';

  const group = radioGroup({
    label: opts.label,
    section: opts.section,
    field: opts.field,
    layout: 'likert',
    parseAs: 'number',
    options: [
      { value: 1, label: '1 — Very Dissatisfied' },
      { value: 2, label: '2 — Dissatisfied' },
      { value: 3, label: '3 — Neutral' },
      { value: 4, label: '4 — Satisfied' },
      { value: 5, label: '5 — Very Satisfied' }
    ]
  });
  // Insert the hint just inside the fieldset, after the legend.
  const legend = group.querySelector('legend');
  if (legend && legend.nextSibling) {
    group.insertBefore(hint, legend.nextSibling);
  } else {
    group.insertBefore(hint, group.firstChild);
  }
  wrapper.appendChild(group);
  return wrapper;
}

/**
 * Build a section card as a Lily <fieldset class="fieldset"> with
 * <legend class="fieldset-legend">.
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
    description: 'Basic information about you. All demographics are optional.'
  });

  const nameGrid = document.createElement('div');
  nameGrid.className = 'two-col';
  nameGrid.appendChild(textInput({ label: 'First Name', section: 'demographics', field: 'firstName' }));
  nameGrid.appendChild(textInput({ label: 'Last Name', section: 'demographics', field: 'lastName' }));
  card.appendChild(nameGrid);

  card.appendChild(textInput({
    label: 'Date of Birth',
    section: 'demographics',
    field: 'dateOfBirth',
    type: 'date'
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

  card.appendChild(selectInput({
    label: 'Age range',
    section: 'demographics',
    field: 'ageRange',
    options: [
      { value: '18-24', label: '18-24' },
      { value: '25-34', label: '25-34' },
      { value: '35-44', label: '35-44' },
      { value: '45-54', label: '45-54' },
      { value: '55-64', label: '55-64' },
      { value: '65-74', label: '65-74' },
      { value: '75-plus', label: '75+' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Ethnicity',
    section: 'demographics', field: 'ethnicity',
    placeholder: 'e.g. White British, Asian, Black, Mixed, …'
  }));

  card.appendChild(textInput({
    label: 'Preferred language',
    section: 'demographics', field: 'preferredLanguage',
    placeholder: 'e.g. English, Welsh, Polish'
  }));

  card.appendChild(radioGroup({
    label: 'Did you require an interpreter?',
    section: 'demographics', field: 'interpreterRequired',
    options: yesNo
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Visit Details',
    description: 'Tell us about the visit you are providing feedback on.'
  });

  card.appendChild(textInput({
    label: 'Visit date',
    section: 'visitDetails', field: 'visitDate',
    type: 'date'
  }));

  card.appendChild(selectInput({
    label: 'Type of visit',
    section: 'visitDetails', field: 'visitType',
    options: [
      { value: 'outpatient', label: 'Outpatient appointment' },
      { value: 'inpatient', label: 'Inpatient stay' },
      { value: 'day-case', label: 'Day case' },
      { value: 'emergency', label: 'Emergency / A&E' },
      { value: 'telehealth', label: 'Telehealth / virtual' },
      { value: 'home-visit', label: 'Home visit' }
    ]
  }));

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Department / Specialty',
    section: 'visitDetails', field: 'department',
    placeholder: 'e.g. Cardiology, A&E, Outpatients'
  }));
  grid.appendChild(textInput({
    label: 'Hospital / Site',
    section: 'visitDetails', field: 'hospitalSite',
    placeholder: 'e.g. Royal General Hospital'
  }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Length of stay',
    section: 'visitDetails', field: 'lengthOfStayDays',
    type: 'number', min: 0, max: 365, unit: 'days'
  }));

  card.appendChild(selectInput({
    label: 'How were you referred?',
    section: 'visitDetails', field: 'referralSource',
    options: [
      { value: 'gp', label: 'GP referral' },
      { value: 'self', label: 'Self-referral' },
      { value: 'emergency', label: 'Emergency / 999' },
      { value: 'another-hospital', label: 'Another hospital' },
      { value: 'specialist', label: 'Another specialist' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Was this your first visit to this service?',
    section: 'visitDetails', field: 'isFirstVisit',
    options: yesNo
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Access & Waiting Times',
    description: 'How easy was it to access this service?'
  });

  card.appendChild(likertField({ label: 'Ease of booking the appointment', section: 'accessWaitingTimes', field: 'easeOfBooking' }));
  card.appendChild(likertField({ label: 'Waiting time between booking and your appointment', section: 'accessWaitingTimes', field: 'waitingTimeForAppointment' }));
  card.appendChild(likertField({ label: 'Waiting time on the day of your appointment', section: 'accessWaitingTimes', field: 'waitingTimeOnDay' }));
  card.appendChild(likertField({ label: 'Reception / front-desk service', section: 'accessWaitingTimes', field: 'receptionService' }));
  card.appendChild(likertField({ label: 'Signage and wayfinding around the building', section: 'accessWaitingTimes', field: 'signageWayfinding' }));
  card.appendChild(likertField({ label: 'Parking and transport', section: 'accessWaitingTimes', field: 'parkingTransport' }));

  card.appendChild(textInput({
    label: 'Approximately how long did you wait on the day?',
    section: 'accessWaitingTimes', field: 'actualWaitMinutes',
    type: 'number', min: 0, max: 1440, unit: 'minutes'
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Communication & Information',
    description: 'How well did the team communicate with you?'
  });

  card.appendChild(likertField({ label: 'Explanation of your condition', section: 'communicationInformation', field: 'explanationOfCondition' }));
  card.appendChild(likertField({ label: 'Explanation of your treatment options', section: 'communicationInformation', field: 'explanationOfTreatment' }));
  card.appendChild(likertField({ label: 'Opportunity to ask questions', section: 'communicationInformation', field: 'opportunityToAskQuestions' }));
  card.appendChild(likertField({ label: 'I felt listened to', section: 'communicationInformation', field: 'listenedTo' }));
  card.appendChild(likertField({ label: 'Information about your medication', section: 'communicationInformation', field: 'informedAboutMedication' }));
  card.appendChild(likertField({ label: 'Quality of written information / leaflets', section: 'communicationInformation', field: 'writtenInformationQuality' }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Clinical Care Quality',
    description: 'How would you rate the clinical care you received?'
  });

  card.appendChild(likertField({ label: 'Confidence in your clinician', section: 'clinicalCareQuality', field: 'confidenceInClinician' }));
  card.appendChild(likertField({ label: 'Thoroughness of the examination', section: 'clinicalCareQuality', field: 'thoroughnessOfExamination' }));
  card.appendChild(likertField({ label: 'Pain management', section: 'clinicalCareQuality', field: 'painManagement' }));
  card.appendChild(likertField({ label: 'Involvement in decisions about your care', section: 'clinicalCareQuality', field: 'involvementInDecisions' }));
  card.appendChild(likertField({ label: 'Privacy during examination', section: 'clinicalCareQuality', field: 'privacyDuringExamination' }));
  card.appendChild(likertField({ label: 'Coordination of care between staff', section: 'clinicalCareQuality', field: 'coordinationOfCare' }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Staff Attitude & Professionalism',
    description: 'How were you treated by staff?'
  });

  card.appendChild(likertField({ label: 'Doctor courtesy', section: 'staffAttitude', field: 'doctorCourtesy' }));
  card.appendChild(likertField({ label: 'Nurse courtesy', section: 'staffAttitude', field: 'nurseCourtesy' }));
  card.appendChild(likertField({ label: 'Reception courtesy', section: 'staffAttitude', field: 'receptionCourtesy' }));
  card.appendChild(likertField({ label: 'Respect for your dignity', section: 'staffAttitude', field: 'respectForDignity' }));
  card.appendChild(likertField({ label: 'Cultural sensitivity', section: 'staffAttitude', field: 'culturalSensitivity' }));
  card.appendChild(likertField({ label: 'Emotional support', section: 'staffAttitude', field: 'emotionalSupport' }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Environment & Facilities',
    description: 'How would you rate the facilities?'
  });

  card.appendChild(likertField({ label: 'Cleanliness', section: 'environmentFacilities', field: 'cleanliness' }));
  card.appendChild(likertField({ label: 'Comfort', section: 'environmentFacilities', field: 'comfort' }));
  card.appendChild(likertField({ label: 'Noise levels', section: 'environmentFacilities', field: 'noiseLevels' }));
  card.appendChild(likertField({ label: 'Food quality', section: 'environmentFacilities', field: 'foodQuality' }));
  card.appendChild(likertField({ label: 'Toilet / washroom facilities', section: 'environmentFacilities', field: 'toiletFacilities' }));
  card.appendChild(likertField({ label: 'Temperature comfort', section: 'environmentFacilities', field: 'temperatureComfort' }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Discharge & Follow-up',
    description: 'How was your discharge and follow-up handled?'
  });

  card.appendChild(likertField({ label: 'Discharge information provided', section: 'dischargeFollowUp', field: 'dischargeInformation' }));
  card.appendChild(likertField({ label: 'Explanation of medication on discharge', section: 'dischargeFollowUp', field: 'medicationExplanation' }));
  card.appendChild(likertField({ label: 'Follow-up arrangements', section: 'dischargeFollowUp', field: 'followUpArrangements' }));
  card.appendChild(likertField({ label: 'I knew who to contact after discharge', section: 'dischargeFollowUp', field: 'knewWhoToContact' }));
  card.appendChild(likertField({ label: 'Information about recovery', section: 'dischargeFollowUp', field: 'recoveryInformation' }));
  card.appendChild(likertField({ label: 'Clarity of the care plan', section: 'dischargeFollowUp', field: 'carePlanClarity' }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Overall Experience',
    description: 'How would you rate your overall experience?'
  });

  card.appendChild(likertField({ label: 'Overall satisfaction with this visit', section: 'overallExperience', field: 'overallSatisfaction' }));
  card.appendChild(likertField({ label: 'I would recommend this service to friends and family', section: 'overallExperience', field: 'wouldRecommend' }));
  card.appendChild(likertField({ label: 'The service met my expectations', section: 'overallExperience', field: 'metExpectations' }));
  card.appendChild(likertField({ label: 'I felt safe during this visit', section: 'overallExperience', field: 'feltSafe' }));
  card.appendChild(likertField({ label: 'I would return to this service if I needed similar care', section: 'overallExperience', field: 'wouldReturn' }));

  // NHS rating uses a separate 0-10 scale
  card.appendChild(radioGroup({
    label: 'Overall, on a scale of 0 to 10, how would you rate this service? (0 = worst, 10 = best)',
    section: 'overallExperience',
    field: 'nhsRating',
    layout: 'likert',
    parseAs: 'number',
    options: Array.from({ length: 11 }, (_, i) => ({ value: i, label: String(i) }))
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Comments & Suggestions',
    description: 'Tell us in your own words. All free-text fields are optional.'
  });

  card.appendChild(textArea({
    label: 'What went well?',
    section: 'commentsSuggestions', field: 'whatWentWell',
    placeholder: 'Anything you found particularly good about this visit…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'What could be improved?',
    section: 'commentsSuggestions', field: 'whatCouldImprove',
    placeholder: 'Any suggestions or concerns…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Specific staff praise',
    section: 'commentsSuggestions', field: 'specificStaffPraise',
    placeholder: 'Names or roles of staff who deserve recognition…',
    rows: 2
  }));

  card.appendChild(radioGroup({
    label: 'Did you raise a formal complaint about this visit?',
    section: 'commentsSuggestions', field: 'complaintRaised',
    options: yesNo
  }));
  const complaintDetails = document.createElement('div');
  complaintDetails.dataset.conditional = 'commentsSuggestions.complaintRaised=yes';
  complaintDetails.appendChild(textArea({
    label: 'Complaint details',
    section: 'commentsSuggestions', field: 'complaintDetails',
    placeholder: 'Brief description of your complaint…',
    rows: 3
  }));
  card.appendChild(complaintDetails);

  card.appendChild(textArea({
    label: 'Any other comments?',
    section: 'commentsSuggestions', field: 'additionalComments',
    placeholder: 'Anything else you would like us to know…',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Would you be willing to be contacted about this feedback?',
    section: 'commentsSuggestions', field: 'consentToContact',
    options: yesNo
  }));
  const contactDetails = document.createElement('div');
  contactDetails.dataset.conditional = 'commentsSuggestions.consentToContact=yes';
  const contactGrid = document.createElement('div');
  contactGrid.className = 'two-col';
  contactGrid.appendChild(textInput({
    label: 'Contact email',
    section: 'commentsSuggestions', field: 'contactEmail',
    type: 'email',
    placeholder: 'you@example.com'
  }));
  contactGrid.appendChild(textInput({
    label: 'Contact phone',
    section: 'commentsSuggestions', field: 'contactPhone',
    type: 'tel',
    placeholder: 'e.g. 07700 900000'
  }));
  contactDetails.appendChild(contactGrid);
  card.appendChild(contactDetails);

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
    const eqIdx = expr.indexOf('=');
    if (eqIdx < 0) return;
    const path = expr.slice(0, eqIdx);
    const target = expr.slice(eqIdx + 1);
    const [section, field] = path.split('.');
    const current = state[section] ? state[section][field] : undefined;
    host.style.display = String(current) === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics (8 - all optional but counted)
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'ageRange'],
  ['demographics', 'ethnicity'],
  ['demographics', 'preferredLanguage'],
  ['demographics', 'interpreterRequired'],
  // Visit details (7)
  ['visitDetails', 'visitDate'],
  ['visitDetails', 'visitType'],
  ['visitDetails', 'department'],
  ['visitDetails', 'hospitalSite'],
  ['visitDetails', 'lengthOfStayDays'],
  ['visitDetails', 'referralSource'],
  ['visitDetails', 'isFirstVisit'],
  // Access & waiting times (7)
  ['accessWaitingTimes', 'easeOfBooking'],
  ['accessWaitingTimes', 'waitingTimeForAppointment'],
  ['accessWaitingTimes', 'waitingTimeOnDay'],
  ['accessWaitingTimes', 'receptionService'],
  ['accessWaitingTimes', 'signageWayfinding'],
  ['accessWaitingTimes', 'parkingTransport'],
  ['accessWaitingTimes', 'actualWaitMinutes'],
  // Communication (6)
  ['communicationInformation', 'explanationOfCondition'],
  ['communicationInformation', 'explanationOfTreatment'],
  ['communicationInformation', 'opportunityToAskQuestions'],
  ['communicationInformation', 'listenedTo'],
  ['communicationInformation', 'informedAboutMedication'],
  ['communicationInformation', 'writtenInformationQuality'],
  // Clinical care (6)
  ['clinicalCareQuality', 'confidenceInClinician'],
  ['clinicalCareQuality', 'thoroughnessOfExamination'],
  ['clinicalCareQuality', 'painManagement'],
  ['clinicalCareQuality', 'involvementInDecisions'],
  ['clinicalCareQuality', 'privacyDuringExamination'],
  ['clinicalCareQuality', 'coordinationOfCare'],
  // Staff attitude (6)
  ['staffAttitude', 'doctorCourtesy'],
  ['staffAttitude', 'nurseCourtesy'],
  ['staffAttitude', 'receptionCourtesy'],
  ['staffAttitude', 'respectForDignity'],
  ['staffAttitude', 'culturalSensitivity'],
  ['staffAttitude', 'emotionalSupport'],
  // Environment (6)
  ['environmentFacilities', 'cleanliness'],
  ['environmentFacilities', 'comfort'],
  ['environmentFacilities', 'noiseLevels'],
  ['environmentFacilities', 'foodQuality'],
  ['environmentFacilities', 'toiletFacilities'],
  ['environmentFacilities', 'temperatureComfort'],
  // Discharge (6)
  ['dischargeFollowUp', 'dischargeInformation'],
  ['dischargeFollowUp', 'medicationExplanation'],
  ['dischargeFollowUp', 'followUpArrangements'],
  ['dischargeFollowUp', 'knewWhoToContact'],
  ['dischargeFollowUp', 'recoveryInformation'],
  ['dischargeFollowUp', 'carePlanClarity'],
  // Overall (6)
  ['overallExperience', 'overallSatisfaction'],
  ['overallExperience', 'wouldRecommend'],
  ['overallExperience', 'metExpectations'],
  ['overallExperience', 'feltSafe'],
  ['overallExperience', 'wouldReturn'],
  ['overallExperience', 'nhsRating'],
  // Comments (2 yes/no fields counted)
  ['commentsSuggestions', 'complaintRaised'],
  ['commentsSuggestions', 'consentToContact']
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
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
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
  { step: 2,  section: 'visitDetails',              title: 'Visit Details' },
  { step: 3,  section: 'accessWaitingTimes',        title: 'Access & Waiting' },
  { step: 4,  section: 'communicationInformation',  title: 'Communication' },
  { step: 5,  section: 'clinicalCareQuality',       title: 'Clinical Care' },
  { step: 6,  section: 'staffAttitude',             title: 'Staff Attitude' },
  { step: 7,  section: 'environmentFacilities',     title: 'Environment' },
  { step: 8,  section: 'dischargeFollowUp',         title: 'Discharge' },
  { step: 9,  section: 'overallExperience',         title: 'Overall' },
  { step: 10, section: 'commentsSuggestions',       title: 'Comments' }
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

const DOMAIN_ROWS = [
  { key: 'access',         label: 'Access & Waiting Times' },
  { key: 'communication',  label: 'Communication & Information' },
  { key: 'clinicalCare',   label: 'Clinical Care Quality' },
  { key: 'staff',           label: 'Staff Attitude' },
  { key: 'environment',    label: 'Environment & Facilities' },
  { key: 'discharge',      label: 'Discharge & Follow-up' },
  { key: 'overall',         label: 'Overall Experience' }
];

function fmtDomainScore(v) {
  if (v === null || v === undefined) return '—';
  return `${v}%`;
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    normalizedScore,
    satisfactionCategory,
    domainScores,
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
      <td><span class="sev-pill sev-${r.severity}">${esc(severityLabel(r.severity))}</span></td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No rules fired — no concerns detected.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Domain</th>
            <th scope="col">Issue</th>
            <th scope="col">Severity</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const domainTable = `
    <table class="subscales">
      <thead>
        <tr>
          <th scope="col">Domain</th>
          <th scope="col">Score</th>
        </tr>
      </thead>
      <tbody>
        ${DOMAIN_ROWS.map((row) => `
          <tr>
            <th scope="row">${esc(row.label)}</th>
            <td class="num">${esc(fmtDomainScore(domainScores[row.key]))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  out.innerHTML = `
    <h2>Patient Satisfaction Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Overall Satisfaction Score</h3>
    <p class="score-summary">
      <span class="score-badge ${satisfactionCategoryClass(satisfactionCategory)}">${normalizedScore} / 100</span>
      <span class="satisfaction-category">${esc(satisfactionCategoryLabel(satisfactionCategory))}</span>
    </p>
    <p class="muted">Composite of all domains with at least one rated item, on a 0-100 scale.</p>

    <h3>Domain Scores</h3>
    ${domainTable}

    <h3>Fired Rules</h3>
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
  const grade = calculateSatisfactionGrade(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    normalizedScore: grade.normalizedScore,
    satisfactionCategory: grade.satisfactionCategory,
    domainScores: grade.domainScores,
    firedRules: grade.firedRules,
    additionalFlags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh survey?')) return;
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
