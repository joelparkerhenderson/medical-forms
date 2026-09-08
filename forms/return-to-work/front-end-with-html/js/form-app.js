import { calculateReturnToWork } from './grader.js';
import { calculateAge, clinicianRoleLabel, emptyAssessment, fitnessStatementLabel, mechanismLabel, restrictionGradeLabel, restrictionPriorityLabel } from './types.js';

// Return to Work — clinician statement-of-fitness wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page progress
// summary reflects how many fields have been answered. Submission runs the
// pure grader and renders an inline statement-of-fitness report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'return-to-work.front-end-with-html.v1';
const TOTAL_STEPS = 12;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyAssessment();

  for (const key of Object.keys(fresh)) {
    const v = parsed && parsed[key];
    if (Array.isArray(fresh[key])) {
      fresh[key] = Array.isArray(v) ? v : [];
    } else if (v && typeof v === 'object') {
      fresh[key] = { ...fresh[key], ...v };
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
    console.warn('Could not parse saved record; starting fresh.', e);
    return emptyAssessment();
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save record to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored record.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

let state = loadState();
/** @type {ReturnType<typeof calculateReturnToWork> | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'return-to-work',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the statement of fitness.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    updateConditionalSections();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
}

function setBool(section, field, checked) {
  state[section][field] = !!checked;
  saveState(state);
  updateProgress();
  updateConditionalSections();
}

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
      ${opts.required ? 'data-required' : ''}
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

  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select"${opts.required ? ' data-required' : ''} aria-describedby="${id}-error">
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

/** Radio-group bound to an enum field (Lily .radio-group contract). */
function radioGroup(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const radios = opts.options.map((o, i) => {
    const optId = `${id}-${i}`;
    return `
      <label for="${optId}">
        <input type="radio" class="radio-input" id="${optId}" name="${id}"
          value="${esc(o.value)}"${o.value === current ? ' checked' : ''}>
        ${esc(o.label)}
      </label>`;
  }).join('');

  wrapper.innerHTML = `
    <span class="label" id="${id}-label">${labelText}</span>
    <div class="radio-group" role="radiogroup" aria-labelledby="${id}-label" aria-describedby="${id}-error">
      ${radios}
    </div>
    <span class="error-message" id="${id}-error"></span>
  `;
  wrapper.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) {
        setField(opts.section, opts.field, input.value);
        clearFieldError(id);
      }
    });
  });
  return wrapper;
}

/** Yes/No radio-group shorthand. */
function yesNoGroup(label, section, field) {
  return radioGroup({
    label, section, field,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ]
  });
}

/** Single boolean toggle (checkbox) bound to a boolean field. */
function boolField(opts) {
  const id = `${opts.section}-${opts.field}`;
  const checked = state[opts.section][opts.field] === true;
  const wrapper = document.createElement('div');
  wrapper.className = 'bool-field';
  wrapper.innerHTML = `
    <input type="checkbox" class="checkbox-input" id="${id}" name="${id}"${checked ? ' checked' : ''}>
    <label for="${id}">${esc(opts.label)}</label>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('change', () => {
    setBool(opts.section, opts.field, input.checked);
  });
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
    <span class="section-step">Step ${opts.stepNumber} of ${TOTAL_STEPS}</span>
    <h2 class="section-title">${esc(opts.title)}</h2>
    ${desc}
  `;
  card.appendChild(legend);
  return card;
}

function subHead(text) {
  const h = document.createElement('h3');
  h.textContent = text;
  return h;
}

function grid(cols, children) {
  const g = document.createElement('div');
  g.className = cols;
  for (const c of children) g.appendChild(c);
  return g;
}

/** Wrap one or more nodes in a host that shows only when `expr` matches. */
function conditional(expr, children) {
  const host = document.createElement('div');
  host.setAttribute('data-conditional', expr);
  for (const c of (Array.isArray(children) ? children : [children])) host.appendChild(c);
  return host;
}

// ----------------------------------------------------------------------
// Option lists
// ----------------------------------------------------------------------

const CLINICIAN_ROLE_OPTIONS = [
  { value: 'gp', label: 'General Practitioner' },
  { value: 'oh-physician', label: 'Occupational-Health Physician' },
  { value: 'hospital-consultant', label: 'Hospital Consultant' },
  { value: 'nurse', label: 'Registered Nurse' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'physiotherapist', label: 'Physiotherapist' },
  { value: 'occupational-therapist', label: 'Occupational Therapist' }
];

const SEX_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' }
];

const MECHANISM_OPTIONS = [
  { value: 'illness', label: 'Illness' },
  { value: 'injury', label: 'Injury' },
  { value: 'surgery', label: 'Surgery / procedure' },
  { value: 'mental-health', label: 'Mental health' },
  { value: 'pregnancy-related', label: 'Pregnancy-related' },
  { value: 'other', label: 'Other' }
];

const RECOVERY_OPTIONS = [
  { value: 'improving', label: 'Improving' },
  { value: 'stable', label: 'Stable' },
  { value: 'deteriorating', label: 'Deteriorating' },
  { value: 'uncertain', label: 'Uncertain' }
];

const LEVEL_OPTIONS = [
  { value: 'full', label: 'Full / unimpaired' },
  { value: 'mild', label: 'Mild impairment' },
  { value: 'moderate', label: 'Moderate impairment' },
  { value: 'severe', label: 'Severe impairment' }
];

const FITNESS_OUTCOME_OPTIONS = [
  { value: 'fit', label: 'Fit for work' },
  { value: 'may-be-fit', label: 'May be fit for work — with adjustments' },
  { value: 'not-fit', label: 'Not fit for work' }
];

const CONFIDENCE_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

const REVIEW_CLINIC_OPTIONS = [
  { value: 'gp', label: 'GP' },
  { value: 'oh', label: 'Occupational health' },
  { value: 'specialist', label: 'Specialist' },
  { value: 'none', label: 'No review needed' }
];

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Clinician identification',
    description: 'The clinician who examined the patient and signs this statement of fitness for work.'
  });
  card.appendChild(textInput({ label: 'Clinician name', section: 'clinician', field: 'name', required: true }));
  card.appendChild(selectInput({ label: 'Role', section: 'clinician', field: 'role', options: CLINICIAN_ROLE_OPTIONS }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Registration number (GMC / NMC / HCPC / GPhC)', section: 'clinician', field: 'registrationNumber', placeholder: 'e.g. GMC1234567' }),
    textInput({ label: 'Practice / site', section: 'clinician', field: 'site' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Signature', section: 'clinician', field: 'signature' }),
    textInput({ label: 'Date of assessment', section: 'clinician', field: 'date', type: 'date' })
  ]));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'The employee who has been examined.'
  });
  card.appendChild(textInput({ label: 'NHS number', section: 'patient', field: 'nhsNumber', placeholder: '000 000 0000' }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'First name', section: 'patient', field: 'firstName' }),
    textInput({ label: 'Last name', section: 'patient', field: 'lastName', required: true })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Date of birth', section: 'patient', field: 'dateOfBirth', type: 'date', required: true }),
    selectInput({ label: 'Sex', section: 'patient', field: 'sex', options: SEX_OPTIONS })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Phone', section: 'patient', field: 'phone', type: 'tel' }),
    textInput({ label: 'Email', section: 'patient', field: 'email', type: 'email' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Employer name', section: 'patient', field: 'employerName' }),
    textInput({ label: 'Employer occupational-health contact', section: 'patient', field: 'employerOhContact' })
  ]));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Job context',
    description: "The employee's role, hours, and any safety-critical or notifiable status."
  });
  card.appendChild(textInput({ label: 'Job title', section: 'job', field: 'jobTitle' }));
  card.appendChild(textArea({ label: 'Role description', section: 'job', field: 'roleDescription', rows: 2 }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Contracted hours per week', section: 'job', field: 'contractedHours', type: 'number', min: 0, max: 168, step: '0.5' }),
    textInput({ label: 'Shift pattern', section: 'job', field: 'shiftPattern', placeholder: 'e.g. Days, Nights, Rotating' })
  ]));
  card.appendChild(yesNoGroup('Is this a safety-critical role?', 'job', 'safetyCritical'));
  card.appendChild(yesNoGroup('Is this a DVLA-notifiable driving role?', 'job', 'dvlaNotifiableRole'));
  card.appendChild(textInput({ label: 'Employer industry sector', section: 'job', field: 'industrySector' }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Absence history',
    description: 'When the absence began and how long it has lasted.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'First day of absence', section: 'absence', field: 'firstDayOfAbsence', type: 'date' }),
    textInput({ label: 'Total calendar days absent', section: 'absence', field: 'totalDaysAbsent', type: 'number', min: 0 })
  ]));
  card.appendChild(textInput({ label: 'Prior Med 3 reference (if a continuation)', section: 'absence', field: 'priorMed3Ref' }));
  card.appendChild(yesNoGroup('Was there previous self-certification (SC2) on record?', 'absence', 'previousSelfCertification'));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Reason for absence',
    description: 'The clinical reason for the absence and its mechanism.'
  });
  card.appendChild(textInput({ label: 'Primary diagnosis', section: 'diagnosis', field: 'primaryDiagnosis' }));
  card.appendChild(textInput({ label: 'Diagnosis code (SNOMED CT / ICD-10)', section: 'diagnosis', field: 'diagnosisCode' }));
  card.appendChild(textArea({ label: 'Comorbid conditions', section: 'diagnosis', field: 'comorbidConditions', rows: 2 }));
  card.appendChild(selectInput({ label: 'Mechanism', section: 'diagnosis', field: 'mechanism', options: MECHANISM_OPTIONS }));
  card.appendChild(yesNoGroup('Was the absence caused by a workplace incident?', 'diagnosis', 'workplaceCause'));
  card.appendChild(conditional('diagnosis.workplaceCause=yes',
    textInput({ label: 'RIDDOR reference (if reported)', section: 'diagnosis', field: 'riddorReference' })
  ));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Current treatment',
    description: 'Medications, therapy, and the anticipated recovery trajectory.'
  });
  card.appendChild(textArea({ label: 'Current medications', section: 'treatment', field: 'currentMedications', rows: 2 }));
  card.appendChild(textArea({ label: 'Ongoing therapy (physiotherapy / counselling / specialist follow-up)', section: 'treatment', field: 'ongoingTherapy', rows: 2 }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Date of last consultation', section: 'treatment', field: 'lastConsultationDate', type: 'date' }),
    selectInput({ label: 'Anticipated recovery trajectory', section: 'treatment', field: 'recoveryTrajectory', options: RECOVERY_OPTIONS })
  ]));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Functional assessment',
    description: 'Clinician-observed functional capacity relevant to work.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Mobility', section: 'functional', field: 'mobility', options: LEVEL_OPTIONS }),
    selectInput({ label: 'Manual handling capacity', section: 'functional', field: 'manualHandling', options: LEVEL_OPTIONS })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Cognition', section: 'functional', field: 'cognition', options: LEVEL_OPTIONS }),
    selectInput({ label: 'Mood', section: 'functional', field: 'mood', options: LEVEL_OPTIONS })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Sleep', section: 'functional', field: 'sleep', options: LEVEL_OPTIONS }),
    textInput({ label: 'Pain (0-10)', section: 'functional', field: 'pain', type: 'number', min: 0, max: 10 })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Standing tolerance', section: 'functional', field: 'standingTolerance', options: LEVEL_OPTIONS }),
    selectInput({ label: 'Sitting tolerance', section: 'functional', field: 'sittingTolerance', options: LEVEL_OPTIONS })
  ]));
  card.appendChild(selectInput({ label: 'Screen-time tolerance', section: 'functional', field: 'screenTolerance', options: LEVEL_OPTIONS }));
  card.appendChild(yesNoGroup('Driving capacity', 'functional', 'drivingCapacity'));
  card.appendChild(yesNoGroup('Independent in activities of daily living (ADLs)?', 'functional', 'adlIndependence'));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Fitness statement',
    description: "The clinician's overall determination and the validity period."
  });
  card.appendChild(selectInput({ label: 'Overall outcome', section: 'fitness', field: 'outcome', options: FITNESS_OUTCOME_OPTIONS, required: true }));
  card.appendChild(selectInput({ label: 'Clinician confidence', section: 'fitness', field: 'clinicianConfidence', options: CONFIDENCE_OPTIONS }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Valid from', section: 'fitness', field: 'validFrom', type: 'date' }),
    textInput({ label: 'Valid to (end date)', section: 'fitness', field: 'validTo', type: 'date' })
  ]));
  card.appendChild(textInput({ label: 'Or number of weeks', section: 'fitness', field: 'validWeeks', type: 'number', min: 0, max: 52 }));
  card.appendChild(yesNoGroup('Reassessment required at expiry?', 'fitness', 'reassessmentRequired'));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Phased return plan',
    description: 'A graded return ramps hours back up to the contracted level.'
  });
  card.appendChild(yesNoGroup('Is a phased return applicable?', 'phasedReturn', 'applicable'));
  card.appendChild(conditional('phasedReturn.applicable=yes', [
    grid('two-col', [
      textInput({ label: 'Starting hours per week', section: 'phasedReturn', field: 'startHoursPerWeek', type: 'number', min: 0, max: 168, step: '0.5' }),
      textInput({ label: 'Days per week', section: 'phasedReturn', field: 'daysPerWeek', type: 'number', min: 0, max: 7 })
    ]),
    grid('two-col', [
      textInput({ label: 'Target full-hours date', section: 'phasedReturn', field: 'targetFullHoursDate', type: 'date' }),
      textInput({ label: 'Support contact at workplace', section: 'phasedReturn', field: 'supportContact' })
    ])
  ]));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Workplace adjustments and restrictions',
    description: 'Tick each adjustment that applies. The most severe adjustment sets the overall restriction priority (routine → standard → restricted → high-risk).'
  });
  card.appendChild(boolField({ label: 'Altered hours', section: 'adjustments', field: 'alteredHours' }));
  card.appendChild(boolField({ label: 'Amended duties', section: 'adjustments', field: 'amendedDuties' }));
  card.appendChild(boolField({ label: 'Workplace adaptations', section: 'adjustments', field: 'workplaceAdaptations' }));
  card.appendChild(boolField({ label: 'No heavy lifting', section: 'adjustments', field: 'noHeavyLifting' }));
  card.appendChild(conditional('adjustments.noHeavyLifting=true',
    textInput({ label: 'Lifting limit (kg)', section: 'adjustments', field: 'liftingKgLimit', type: 'number', min: 0, max: 50 })
  ));
  card.appendChild(boolField({ label: 'No driving', section: 'adjustments', field: 'noDriving' }));
  card.appendChild(boolField({ label: 'No operating machinery', section: 'adjustments', field: 'noOperatingMachinery' }));
  card.appendChild(boolField({ label: 'No working at height', section: 'adjustments', field: 'noWorkingAtHeight' }));
  card.appendChild(boolField({ label: 'No lone working', section: 'adjustments', field: 'noLoneWorking' }));
  card.appendChild(boolField({ label: 'No night shifts', section: 'adjustments', field: 'noNightShifts' }));
  card.appendChild(boolField({ label: 'No patient contact', section: 'adjustments', field: 'noPatientContact' }));
  card.appendChild(boolField({ label: 'Sedentary duties only', section: 'adjustments', field: 'sedentaryOnly' }));
  card.appendChild(textInput({ label: 'No exposure to (allergen / chemical / temperature extreme)', section: 'adjustments', field: 'noExposure' }));
  card.appendChild(textInput({ label: 'Screen-break frequency', section: 'adjustments', field: 'screenBreakFrequency', placeholder: 'e.g. 5 min every 30 min' }));
  card.appendChild(yesNoGroup('Is a workstation / workplace review required?', 'adjustments', 'workstationReviewRequired'));
  card.appendChild(textArea({ label: 'Additional adjustments', section: 'adjustments', field: 'additionalAdjustments', rows: 2 }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Follow-up plan',
    description: 'Where and when the patient will be reviewed, and which teams are notified.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Review clinic', section: 'followUp', field: 'reviewClinic', options: REVIEW_CLINIC_OPTIONS }),
    textInput({ label: 'Review date', section: 'followUp', field: 'reviewDate', type: 'date' })
  ]));
  card.appendChild(yesNoGroup('Occupational-health referral made?', 'followUp', 'ohReferralMade'));
  card.appendChild(yesNoGroup('DVLA notification required?', 'followUp', 'dvlaNotificationRequired'));
  card.appendChild(yesNoGroup('Employer occupational-health team notified?', 'followUp', 'employerOhNotified'));
  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Sign-off',
    description: 'The restriction-priority grade and safety flags are computed on submit. The clinician may override the computed fitness statement with a documented reason.'
  });
  card.appendChild(yesNoGroup('Override the computed fitness statement?', 'signOff', 'clinicianOverride'));
  card.appendChild(conditional('signOff.clinicianOverride=yes', [
    selectInput({ label: 'Override outcome', section: 'signOff', field: 'overrideOutcome', options: FITNESS_OUTCOME_OPTIONS }),
    textArea({ label: 'Override reason', section: 'signOff', field: 'overrideReason', rows: 2 })
  ]));
  card.appendChild(textArea({ label: 'Final notes', section: 'signOff', field: 'finalNotes', rows: 3 }));
  card.appendChild(textInput({ label: 'Electronic signature', section: 'signOff', field: 'signature' }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7, renderStep8,
  renderStep9, renderStep10, renderStep11, renderStep12
];

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = String(state[section]?.[field] ?? '');
    host.style.display = current === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  ['clinician', 'name'],
  ['patient', 'lastName'], ['patient', 'dateOfBirth'],
  ['job', 'jobTitle'],
  ['absence', 'firstDayOfAbsence'],
  ['diagnosis', 'primaryDiagnosis'], ['diagnosis', 'mechanism'],
  ['treatment', 'recoveryTrajectory'],
  ['functional', 'mobility'],
  ['fitness', 'outcome'],
  ['phasedReturn', 'applicable'],
  ['adjustments', 'workstationReviewRequired'],
  ['followUp', 'reviewClinic'],
  ['signOff', 'signature']
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
    if (isAnswered(state[section][field])) {
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
  { step: 1,  section: 'clinician',    title: 'Clinician' },
  { step: 2,  section: 'patient',      title: 'Patient' },
  { step: 3,  section: 'job',          title: 'Job' },
  { step: 4,  section: 'absence',      title: 'Absence' },
  { step: 5,  section: 'diagnosis',    title: 'Reason' },
  { step: 6,  section: 'treatment',    title: 'Treatment' },
  { step: 7,  section: 'functional',   title: 'Functional' },
  { step: 8,  section: 'fitness',      title: 'Fitness' },
  { step: 9,  section: 'phasedReturn', title: 'Phased' },
  { step: 10, section: 'adjustments',  title: 'Adjustments' },
  { step: 11, section: 'followUp',     title: 'Follow-up' },
  { step: 12, section: 'signOff',      title: 'Sign-off' }
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

function fitnessClass(statement) {
  return statement ? 'fitness-' + String(statement) : '';
}

function priorityClass(priority) {
  return priority ? 'priority-' + String(priority) : '';
}

function flagPriorityClass(priority) {
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
    fitnessStatement,
    computedFitness,
    overridden,
    restrictionPriority,
    firedRules,
    additionalFlags,
    timestamp
  } = lastResult;

  const validTo = state.fitness.validTo ||
    (state.fitness.validWeeks !== null && state.fitness.validWeeks !== undefined
      ? `${state.fitness.validWeeks} weeks` : 'N/A');
  const age = calculateAge(state.patient.dateOfBirth);

  const flagsList = additionalFlags.length === 0
    ? `<p class="muted">No flagged issues raised.</p>`
    : `
      <ul class="flags">
        ${additionalFlags.map((f) => `
          <li class="${flagPriorityClass(f.priority)}">
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
      <td><span class="band-badge grade-${esc(r.grade)}">${esc(restrictionGradeLabel(r.grade))}</span></td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No restriction rules fired — routine priority.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Rule</th>
            <th scope="col">Area</th>
            <th scope="col">Adjustment</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const phasedSection = state.phasedReturn.applicable === 'yes'
    ? `
      <h3>Phased return plan</h3>
      <dl class="summary-grid">
        <div><dt>Starting hours/week</dt><dd>${esc(state.phasedReturn.startHoursPerWeek ?? 'N/A')}</dd></div>
        <div><dt>Days per week</dt><dd>${esc(state.phasedReturn.daysPerWeek ?? 'N/A')}</dd></div>
        <div><dt>Target full-hours date</dt><dd>${esc(state.phasedReturn.targetFullHoursDate || 'N/A')}</dd></div>
        <div><dt>Support contact</dt><dd>${esc(state.phasedReturn.supportContact || 'N/A')}</dd></div>
      </dl>
    ` : '';

  const notesSection = (state.signOff.overrideReason || state.signOff.finalNotes)
    ? `
      <h3>Clinician notes</h3>
      ${state.signOff.overrideReason ? `<p class="muted"><strong>Override reason:</strong> ${esc(state.signOff.overrideReason)}</p>` : ''}
      ${state.signOff.finalNotes ? `<p class="muted">${esc(state.signOff.finalNotes)}</p>` : ''}
    ` : '';

  out.innerHTML = `
    <h2>Statement of Fitness for Work</h2>

    <div class="fitness-banner ${fitnessClass(fitnessStatement)}">
      <span class="fitness-headline">${esc(fitnessStatementLabel(fitnessStatement))}</span>
      <span class="band-badge ${priorityClass(restrictionPriority)}">Restriction priority: ${esc(restrictionPriorityLabel(restrictionPriority))}</span>
      ${overridden ? `<span class="fitness-override">Clinician override applied (computed: ${esc(fitnessStatementLabel(computedFitness))})</span>` : ''}
      <span class="fitness-timestamp">Generated ${esc(new Date(timestamp).toLocaleString())}</span>
    </div>

    <h3>Period of validity</h3>
    <dl class="summary-grid">
      <div><dt>Valid from</dt><dd>${esc(state.fitness.validFrom || 'N/A')}</dd></div>
      <div><dt>Valid to</dt><dd>${esc(validTo)}</dd></div>
      <div><dt>Reassessment required</dt><dd>${esc(state.fitness.reassessmentRequired || 'N/A')}</dd></div>
      <div><dt>Clinician confidence</dt><dd>${esc(state.fitness.clinicianConfidence || 'N/A')}</dd></div>
    </dl>

    <h3>Flagged issues for occupational health</h3>
    ${flagsList}

    <h3>Restriction justification</h3>
    ${firedTable}

    <h3>Summary</h3>
    <dl class="summary-grid">
      <div><dt>Patient</dt><dd>${esc((state.patient.firstName + ' ' + state.patient.lastName).trim() || 'N/A')}</dd></div>
      <div><dt>Date of birth</dt><dd>${esc(state.patient.dateOfBirth || 'N/A')}${age !== null ? ` (Age ${age})` : ''}</dd></div>
      <div><dt>Employer</dt><dd>${esc(state.patient.employerName || 'N/A')}</dd></div>
      <div><dt>Job title</dt><dd>${esc(state.job.jobTitle || 'N/A')}</dd></div>
      <div><dt>Reason</dt><dd>${esc(state.diagnosis.primaryDiagnosis || 'N/A')} (${esc(mechanismLabel(state.diagnosis.mechanism))})</dd></div>
      <div><dt>Days absent</dt><dd>${esc(state.absence.totalDaysAbsent ?? 'N/A')}</dd></div>
      <div><dt>Clinician</dt><dd>${esc(state.clinician.name || 'N/A')} (${esc(clinicianRoleLabel(state.clinician.role))})</dd></div>
      <div><dt>Registration</dt><dd>${esc(state.clinician.registrationNumber || 'N/A')}</dd></div>
    </dl>

    ${phasedSection}
    ${notesSection}

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
  lastResult = calculateReturnToWork(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh record?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the statement of fitness.</p>';
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
