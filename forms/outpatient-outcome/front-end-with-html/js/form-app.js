import { calculateGrade } from './grader.js';
import { calcWaitDays, promisGphTScore, promisMhTScore } from './rules.js';
import { FFT_LABELS, OUTCOME_LABELS, emptyAssessment, gradeLabel, labelFrom } from './types.js';

// Outpatient Outcome Report — clinician wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page progress
// summary reflects how many key fields have been answered. Submission runs the
// pure four-domain OOCG grader and renders an inline outcome report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'outpatient-outcome.front-end-with-html.v1';
const TOTAL_STEPS = 11;

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
    if (v && typeof v === 'object') {
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
    console.warn('Could not parse saved report; starting fresh.', e);
    return emptyAssessment();
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
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

let state = loadState();
/** @type {ReturnType<typeof calculateGrade> | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'outpatient-outcome',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the outcome report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    updateConditionalSections();
    updatePromisReadout();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  afterFieldChange(section, field);
}

function afterFieldChange(section, field) {
  // Auto-derive wait-time days from the two operational dates.
  if (section === 'operationalEfficiency' && (field === 'referralDate' || field === 'appointmentDate')) {
    const derived = calcWaitDays(state.operationalEfficiency.referralDate, state.operationalEfficiency.appointmentDate);
    if (derived !== null) {
      state.operationalEfficiency.waitTimeDays = derived;
      saveState(state);
      const waitInput = document.getElementById('operationalEfficiency-waitTimeDays');
      if (waitInput) waitInput.value = String(derived);
    }
  }
  // Live PROMIS T-score readout.
  if (section === 'promPromis') updatePromisReadout();
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

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
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

function numberInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="number"`,
    `class="number-input"`,
    `value="${value == null ? '' : esc(value)}"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);
  if (opts.required) attrs.push('required', 'data-required');

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
    let v = input.value === '' ? null : Number(input.value);
    if (v !== null && opts.min !== undefined) v = Math.max(opts.min, v);
    if (v !== null && opts.max !== undefined) v = Math.min(opts.max, v);
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

/** String-valued select bound to an enum field. */
function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">${esc(opts.placeholder || '— Select —')}</option>`,
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

/** Numeric-valued select: '' -> null, otherwise Number(value). */
function numericSelect(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const currentStr = current == null ? '' : String(current);
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">${esc(opts.placeholder || '— Select —')}</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === currentStr ? ' selected' : ''}>${esc(o.label)}</option>`
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
    setField(opts.section, opts.field, sel.value === '' ? null : Number(sel.value));
    clearFieldError(id);
  });
  return wrapper;
}

/** Radio group bound to an enum field. */
function radioGroup(opts) {
  const name = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const radios = opts.options.map((o, i) => {
    const rid = `${name}-${i}`;
    return `
      <label for="${rid}">
        <input type="radio" class="radio-input" id="${rid}" name="${name}" value="${esc(o.value)}"${o.value === current ? ' checked' : ''}>
        <span>${esc(o.label)}</span>
      </label>
    `;
  }).join('');

  wrapper.innerHTML = `
    <span class="label" id="${name}-label">${labelText}</span>
    <div class="radio-group" role="radiogroup" aria-labelledby="${name}-label">
      ${radios}
    </div>
    <span class="error-message" id="${name}-error"></span>
  `;
  wrapper.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) setField(opts.section, opts.field, input.value);
    });
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

function note(text) {
  const p = document.createElement('p');
  p.className = 'field-note';
  p.innerHTML = text;
  return p;
}

function grid(cols, children) {
  const g = document.createElement('div');
  g.className = cols;
  for (const c of children) g.appendChild(c);
  return g;
}

/** A card grouping a labelled sub-block (used for EQ-5D dimensions). */
function subCard(title, hint, children) {
  const wrap = document.createElement('div');
  wrap.className = 'sub-card';
  wrap.innerHTML = `<h3>${esc(title)}</h3>${hint ? `<p class="sub-hint">${esc(hint)}</p>` : ''}`;
  for (const c of children) wrap.appendChild(c);
  return wrap;
}

// ----------------------------------------------------------------------
// Option lists
// ----------------------------------------------------------------------

const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
];

const MODALITY_OPTIONS = [
  { value: 'in_person', label: 'In Person' },
  { value: 'telephone', label: 'Telephone' },
  { value: 'video', label: 'Video' }
];

const APPOINTMENT_TYPE_OPTIONS = [
  { value: 'new', label: 'New appointment' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'pifu', label: 'Patient-Initiated Follow-Up (PIFU)' }
];

const ATTENDANCE_OPTIONS = [
  { value: 'attended_discharged', label: 'Attended — Discharged' },
  { value: 'attended_follow_up', label: 'Attended — Follow-up booked' },
  { value: 'attended_pifu', label: 'Attended — PIFU pathway' },
  { value: 'attended_onward_referral', label: 'Attended — Onward referral' },
  { value: 'patient_cancelled', label: 'Patient cancelled or rebooked' },
  { value: 'patient_dna', label: 'Patient Did Not Attend (DNA)' },
  { value: 'provider_cancelled', label: 'Provider cancelled' }
];

const OUTCOME_OPTIONS = [
  { value: 'resolved', label: 'Resolved — condition fully resolved' },
  { value: 'improved', label: 'Improved — condition has improved' },
  { value: 'unchanged', label: 'Unchanged — no significant change' },
  { value: 'worsened', label: 'Worsened — condition has deteriorated' },
  { value: 'died', label: 'Died — patient has died' }
];

const EQ5D_LEVEL_OPTIONS = [
  { value: '1', label: '1 — No problems' },
  { value: '2', label: '2 — Slight problems' },
  { value: '3', label: '3 — Moderate problems' },
  { value: '4', label: '4 — Severe problems' },
  { value: '5', label: '5 — Extreme problems / unable to' }
];

const GRC_OPTIONS = [
  { value: '-3', label: '-3 — Very much worse' },
  { value: '-2', label: '-2 — Much worse' },
  { value: '-1', label: '-1 — Somewhat worse' },
  { value: '0', label: '0 — About the same' },
  { value: '1', label: '+1 — Somewhat better' },
  { value: '2', label: '+2 — Much better' },
  { value: '3', label: '+3 — Very much better' }
];

const SELF_RATED_HEALTH_OPTIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'very_good', label: 'Very Good' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
];

const PROMIS_LEVEL_OPTIONS = [
  { value: '1', label: '1 — Poor' },
  { value: '2', label: '2 — Fair' },
  { value: '3', label: '3 — Good' },
  { value: '4', label: '4 — Very Good' },
  { value: '5', label: '5 — Excellent' }
];

const PROMIS_FREQUENCY_OPTIONS = [
  { value: '1', label: '1 — Never' },
  { value: '2', label: '2 — Rarely' },
  { value: '3', label: '3 — Sometimes' },
  { value: '4', label: '4 — Often' },
  { value: '5', label: '5 — Always' }
];

const FFT_OPTIONS = [
  { value: 'extremely_likely', label: 'Extremely likely' },
  { value: 'likely', label: 'Likely' },
  { value: 'neither', label: 'Neither likely nor unlikely' },
  { value: 'unlikely', label: 'Unlikely' },
  { value: 'extremely_unlikely', label: 'Extremely unlikely' },
  { value: 'dont_know', label: "Don't know" }
];

const DISPOSITION_OPTIONS = [
  { value: 'discharge', label: 'Discharge — no further follow-up required' },
  { value: 'pifu', label: 'Patient-Initiated Follow-Up (PIFU)' },
  { value: 'follow_up_booked', label: 'Follow-up appointment booked' },
  { value: 'onward_referral', label: 'Onward referral to another service' }
];

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Patient Details',
    description: 'Patient identification and demographics.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'Given Name', section: 'patientDetails', field: 'givenName', required: true }),
    textInput({ label: 'Family Name', section: 'patientDetails', field: 'familyName', required: true })
  ]));
  card.appendChild(textInput({ label: 'Date of Birth', section: 'patientDetails', field: 'dateOfBirth', type: 'date', required: true }));
  card.appendChild(textInput({ label: 'NHS Number', section: 'patientDetails', field: 'nhsNumber', placeholder: 'e.g. 123 456 7890' }));
  card.appendChild(radioGroup({ label: 'Sex', section: 'patientDetails', field: 'sex', options: SEX_OPTIONS }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Encounter Details',
    description: 'Details about this outpatient appointment.'
  });
  card.appendChild(textInput({ label: 'Clinic Date', section: 'encounterDetails', field: 'clinicDate', type: 'date', required: true }));
  card.appendChild(textInput({ label: 'Specialty', section: 'encounterDetails', field: 'specialty', placeholder: 'e.g. Cardiology', required: true }));
  card.appendChild(textInput({ label: 'Clinician Name', section: 'encounterDetails', field: 'clinicianName', placeholder: 'e.g. Dr Jane Smith' }));
  card.appendChild(radioGroup({ label: 'Modality', section: 'encounterDetails', field: 'modality', options: MODALITY_OPTIONS, required: true }));
  card.appendChild(selectInput({ label: 'Appointment Type', section: 'encounterDetails', field: 'appointmentType', options: APPOINTMENT_TYPE_OPTIONS, required: true }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Operational Efficiency',
    description: 'Referral and appointment timing. Wait time auto-derives from the two dates.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'Referral Date', section: 'operationalEfficiency', field: 'referralDate', type: 'date' }),
    textInput({ label: 'Appointment Date', section: 'operationalEfficiency', field: 'appointmentDate', type: 'date' })
  ]));
  card.appendChild(numberInput({ label: 'Wait Time', section: 'operationalEfficiency', field: 'waitTimeDays', unit: 'days', min: 0 }));
  card.appendChild(numberInput({ label: 'Service Target', section: 'operationalEfficiency', field: 'serviceTargetDays', unit: 'days', min: 1, placeholder: 'e.g. 18 for 18-week RTT' }));
  card.appendChild(selectInput({ label: 'NHS Attendance Outcome', section: 'operationalEfficiency', field: 'nhsAttendanceOutcome', options: ATTENDANCE_OPTIONS }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Clinical Outcome',
    description: 'Clinician-rated assessment of the consultation outcome.'
  });
  card.appendChild(textArea({ label: 'Presenting Complaint', section: 'clinicalOutcome', field: 'presentingComplaint', rows: 2, placeholder: "Describe the patient's presenting complaint" }));
  card.appendChild(textArea({ label: 'Diagnosis (confirmed or updated)', section: 'clinicalOutcome', field: 'diagnosis', rows: 2, placeholder: 'Primary diagnosis established or updated during this encounter' }));
  card.appendChild(textArea({ label: 'Treatment Delivered', section: 'clinicalOutcome', field: 'treatmentDelivered', rows: 2, placeholder: 'Describe any treatment, advice, or interventions delivered' }));
  card.appendChild(selectInput({ label: 'Outcome Classification', section: 'clinicalOutcome', field: 'outcomeClassification', options: OUTCOME_OPTIONS, required: true }));
  return card;
}

function eq5dDimension(title, hint, beforeField, afterField) {
  return subCard(title, hint, [
    grid('two-col', [
      numericSelect({ label: 'Before (start of episode)', section: 'promEq5d5l', field: beforeField, options: EQ5D_LEVEL_OPTIONS }),
      numericSelect({ label: 'Now (after treatment)', section: 'promEq5d5l', field: afterField, options: EQ5D_LEVEL_OPTIONS })
    ])
  ]);
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'PROM — EQ-5D-5L',
    description: 'Patient-reported health status before and after this episode of care. (Paraphrased item wording — see doc/licensing.md.)'
  });
  card.appendChild(note('For each dimension, rate how things were <strong>before</strong> the start of this episode of care and how things are <strong>now</strong>. Scale: 1 = No problems, 5 = Extreme problems.'));
  card.appendChild(eq5dDimension('Mobility', 'Ability to walk and move around.', 'beforeMobility', 'afterMobility'));
  card.appendChild(eq5dDimension('Self-Care', 'Ability to wash, dress, and care for yourself.', 'beforeSelfCare', 'afterSelfCare'));
  card.appendChild(eq5dDimension('Usual Activities', 'Ability to carry out usual activities (work, study, housework).', 'beforeUsualActivities', 'afterUsualActivities'));
  card.appendChild(eq5dDimension('Pain / Discomfort', 'Any pain or discomfort you have.', 'beforePainDiscomfort', 'afterPainDiscomfort'));
  card.appendChild(eq5dDimension('Anxiety / Depression', 'Any anxiety or depression you have.', 'beforeAnxietyDepression', 'afterAnxietyDepression'));
  card.appendChild(subCard('Overall Health (Visual Analogue Scale)', '0 = worst health imaginable, 100 = best health imaginable.', [
    grid('two-col', [
      numberInput({ label: 'Before (0–100)', section: 'promEq5d5l', field: 'beforeVas', min: 0, max: 100 }),
      numberInput({ label: 'Now (0–100)', section: 'promEq5d5l', field: 'afterVas', min: 0, max: 100 })
    ])
  ]));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'PROM — Global Rating of Change',
    description: "Patient's overall assessment of change since the start of this episode of care."
  });
  card.appendChild(numericSelect({
    label: 'Compared to before this episode of care began, how would you describe your overall health now?',
    section: 'promGrc', field: 'globalRatingOfChange', options: GRC_OPTIONS
  }));
  card.appendChild(selectInput({
    label: 'How would you rate your health in general right now?',
    section: 'promGrc', field: 'selfRatedHealth', options: SELF_RATED_HEALTH_OPTIONS
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'PROM — PROMIS Global Health',
    description: 'PROMIS Global Health v1.2 (paraphrased). See doc/licensing.md for attribution and scoring notes.'
  });
  card.appendChild(note('Please answer the following questions about your health <strong>over the past 7 days</strong>.'));
  card.appendChild(subHead('General Health Ratings'));
  card.appendChild(numericSelect({ label: 'In general, how would you rate your health?', section: 'promPromis', field: 'item1GeneralHealth', options: PROMIS_LEVEL_OPTIONS }));
  card.appendChild(numericSelect({ label: 'In general, how would you rate your quality of life?', section: 'promPromis', field: 'item2QualityOfLife', options: PROMIS_LEVEL_OPTIONS }));
  card.appendChild(numericSelect({ label: 'In general, how would you rate your physical health?', section: 'promPromis', field: 'item3PhysicalHealth', options: PROMIS_LEVEL_OPTIONS }));
  card.appendChild(numericSelect({ label: 'In general, how would you rate your mental health, including your mood and ability to think?', section: 'promPromis', field: 'item4MentalHealth', options: PROMIS_LEVEL_OPTIONS }));
  card.appendChild(numericSelect({ label: 'In general, how would you rate your satisfaction with your social activities and relationships?', section: 'promPromis', field: 'item5Satisfaction', options: PROMIS_LEVEL_OPTIONS }));
  card.appendChild(subHead('Frequency Questions (past 7 days)'));
  card.appendChild(numericSelect({ label: 'In general, how often did you feel tired?', section: 'promPromis', field: 'item6FatigueFrequency', options: PROMIS_FREQUENCY_OPTIONS }));
  card.appendChild(numericSelect({ label: 'In general, how often did you have emotional problems such as feeling anxious or depressed?', section: 'promPromis', field: 'item7EmotionalProblems', options: PROMIS_FREQUENCY_OPTIONS }));
  card.appendChild(numericSelect({ label: 'How often were you able to carry out your social activities and roles?', section: 'promPromis', field: 'item8SocialActivities', options: PROMIS_FREQUENCY_OPTIONS }));
  card.appendChild(numberInput({ label: 'How would you rate your pain on average? (0 = No pain, 10 = Worst pain imaginable)', section: 'promPromis', field: 'item9Pain', min: 0, max: 10 }));
  card.appendChild(numericSelect({ label: 'How often were you able to carry out everyday physical activities such as walking, climbing stairs, carrying groceries?', section: 'promPromis', field: 'item10EverydayActivities', options: PROMIS_FREQUENCY_OPTIONS }));

  const readout = document.createElement('div');
  readout.className = 'readout-value promis-readout';
  readout.id = 'promis-readout';
  readout.hidden = true;
  card.appendChild(readout);
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'PREM — Friends & Family Test',
    description: 'NHS Friends and Family Test (FFT). Open Government Licence v3.0. NHS England.'
  });
  card.appendChild(note('Overall, how likely are you to recommend our service to friends and family if they needed similar care or treatment?'));
  card.appendChild(radioGroup({ label: 'How likely are you to recommend this service?', section: 'premFft', field: 'fftResponse', options: FFT_OPTIONS }));
  card.appendChild(textArea({ label: 'Please tell us why you gave this response (optional)', section: 'premFft', field: 'fftComment', rows: 3, placeholder: 'Your comments help us to improve our services' }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Follow-up Plan',
    description: 'Disposition and next steps following this encounter.'
  });
  card.appendChild(selectInput({ label: 'Disposition', section: 'followupPlan', field: 'disposition', options: DISPOSITION_OPTIONS }));

  const nextAppt = textInput({ label: 'Next Appointment Date', section: 'followupPlan', field: 'nextAppointmentDate', type: 'date' });
  nextAppt.dataset.conditional = 'followupPlan.disposition=follow_up_booked';
  card.appendChild(nextAppt);

  const onward = textInput({ label: 'Onward Referral Specialty', section: 'followupPlan', field: 'onwardReferralSpecialty', placeholder: 'e.g. Rheumatology' });
  onward.dataset.conditional = 'followupPlan.disposition=onward_referral';
  card.appendChild(onward);

  card.appendChild(textArea({ label: 'Follow-up Notes', section: 'followupPlan', field: 'followupNotes', rows: 3, placeholder: 'Any additional instructions, safety-netting advice, or relevant notes' }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Sign-off',
    description: 'Clinician completing this report.'
  });
  card.appendChild(textInput({ label: 'Reporting Clinician Name', section: 'signOff', field: 'reportingClinicianName', placeholder: 'Full name', required: true }));
  card.appendChild(textInput({ label: 'Role / Grade', section: 'signOff', field: 'reportingClinicianRole', placeholder: 'e.g. Consultant, SpR, ANP', required: true }));
  card.appendChild(textInput({ label: 'Date and Time of Sign-off', section: 'signOff', field: 'signedOffAt', type: 'datetime-local', required: true }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Review & Submit',
    description: 'Submit to compute the four-domain OOCG grade, the fired rules, and any flagged issues.'
  });
  card.appendChild(note('The overall OOCG grade is the worst of the four domain grades (Clinical, PROM, PREM, Operational). Use <strong>Submit and view report</strong> below to generate the report.'));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6,
  renderStep7, renderStep8, renderStep9, renderStep10, renderStep11
];

// ----------------------------------------------------------------------
// PROMIS live readout
// ----------------------------------------------------------------------

function updatePromisReadout() {
  const el = document.getElementById('promis-readout');
  if (!el) return;
  const gph = promisGphTScore(state.promPromis);
  const gmh = promisMhTScore(state.promPromis);
  if (gph === null && gmh === null) {
    el.hidden = true;
    el.innerHTML = '';
    return;
  }
  el.hidden = false;
  el.innerHTML = `
    <span><strong>PROMIS T-scores (linear approximation):</strong></span>
    <span>Global Physical Health: <strong>${gph !== null ? gph.toFixed(1) : '—'}</strong></span>
    <span>Global Mental Health: <strong>${gmh !== null ? gmh.toFixed(1) : '—'}</strong></span>
    <span class="muted">Population norm = 50. Approximate values only.</span>
  `;
}

// ----------------------------------------------------------------------
// Conditional fields
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
  ['patientDetails', 'givenName'], ['patientDetails', 'familyName'], ['patientDetails', 'dateOfBirth'],
  ['encounterDetails', 'clinicDate'], ['encounterDetails', 'specialty'], ['encounterDetails', 'modality'], ['encounterDetails', 'appointmentType'],
  ['operationalEfficiency', 'nhsAttendanceOutcome'],
  ['clinicalOutcome', 'outcomeClassification'],
  ['promEq5d5l', 'afterMobility'],
  ['promGrc', 'globalRatingOfChange'],
  ['promPromis', 'item1GeneralHealth'],
  ['premFft', 'fftResponse'],
  ['followupPlan', 'disposition'],
  ['signOff', 'reportingClinicianName'], ['signOff', 'reportingClinicianRole'], ['signOff', 'signedOffAt']
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
  { step: 1, section: 'patientDetails',        title: 'Patient' },
  { step: 2, section: 'encounterDetails',      title: 'Encounter' },
  { step: 3, section: 'operationalEfficiency', title: 'Operational' },
  { step: 4, section: 'clinicalOutcome',       title: 'Clinical' },
  { step: 5, section: 'promEq5d5l',            title: 'EQ-5D-5L' },
  { step: 6, section: 'promGrc',               title: 'GRC' },
  { step: 7, section: 'promPromis',            title: 'PROMIS' },
  { step: 8, section: 'premFft',               title: 'FFT' },
  { step: 9, section: 'followupPlan',          title: 'Follow-up' },
  { step: 10, section: 'signOff',              title: 'Sign-off' },
  { step: 11, section: 'signOff',              title: 'Review' }
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
    if (current.dataset.status === 'waiting') current.dataset.status = 'in-progress';
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
    // Skip hidden conditional fields.
    if (input.closest('[data-conditional]') && input.closest('[data-conditional]').style.display === 'none') return;
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

function gradeClass(grade) {
  return grade ? `grade-${String(grade).toLowerCase()}` : 'grade-none';
}

function priorityClass(priority) {
  switch (priority) {
    case 'critical': return 'flag-critical';
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
    overallGrade, clinicalGrade, promGrade, premGrade, operationalGrade,
    firedRules, flaggedIssues, timestamp
  } = lastResult;

  const pd = state.patientDetails;
  const patientName = [pd.familyName, pd.givenName].filter(Boolean).join(', ') || '—';

  const domains = [
    { label: 'Clinical', grade: clinicalGrade },
    { label: 'PROM', grade: promGrade },
    { label: 'PREM', grade: premGrade },
    { label: 'Operational', grade: operationalGrade }
  ];

  const domainCards = domains.map((d) => `
    <div class="domain-card ${gradeClass(d.grade)}">
      <span class="domain-grade">${esc(d.grade || '—')}</span>
      <span class="domain-name">${esc(d.label)}</span>
    </div>
  `).join('');

  const firedRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.domain)}</td>
      <td><span class="band-badge ${gradeClass(r.grade)}">${esc(r.grade || '—')}</span></td>
      <td>${esc(r.description)}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No rules fired — insufficient data to grade any domain.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Rule</th>
            <th scope="col">Domain</th>
            <th scope="col">Grade</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No flagged issues raised.</p>`
    : `
      <ul class="flags">
        ${flaggedIssues.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.message)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  out.innerHTML = `
    <h2>Outpatient Outcome Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())} · Patient: ${esc(patientName)} · Specialty: ${esc(state.encounterDetails.specialty || '—')} · Outcome: ${esc(labelFrom(OUTCOME_LABELS, state.clinicalOutcome.outcomeClassification) || '—')}</p>

    <div class="overall-grade ${gradeClass(overallGrade)}">
      <span class="overall-grade-letter">${esc(overallGrade || '—')}</span>
      <span class="overall-grade-label">${esc(gradeLabel(overallGrade))}</span>
      <span class="overall-grade-sub">Overall OOCG Grade (worst of four domains)</span>
    </div>

    <h3>Domain grades</h3>
    <div class="domain-grid">${domainCards}</div>

    <h3>Fired rules</h3>
    ${firedTable}

    <h3>Flagged issues${flaggedIssues.length ? ` (${flaggedIssues.length})` : ''}</h3>
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
  lastResult = calculateGrade(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh report?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the outcome report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  updatePromisReadout();
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
  updatePromisReadout();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
