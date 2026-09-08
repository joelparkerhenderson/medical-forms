import { detectFlaggedIssues } from './flags.js';
import { gradeReferral } from './grader.js';
import { consentToShareLabel, emptyReferral, patientSexLabel, priorityLabel, referrerRoleLabel, statusClass, statusLabel, urgencyClass, urgencyLabel, urgencyPathway } from './types.js';

// General Practitioner Referral Letter — wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The referrer scrolls through the nine sections (referrer,
// patient, destination, urgency, reason & history, examination & investigations,
// medications & allergies, expectations / consent / safety-netting, and summary);
// a sticky top-of-page progress summary reflects how many fields have been
// answered, and a live readout shows the running completeness status
// (Complete / Incomplete), the completeness percentage, AND the urgency
// classification (routine / urgent / two-week-wait / emergency) — urgency is
// echoed even while the referral is incomplete so the pathway is never hidden.
// Submission runs the pure engine (mandatory-field rules → status + completeness
// percent, echoed urgency, and flags) and renders an inline report plus a
// generated referral-letter preview. State is persisted to localStorage so a
// partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'general-practitioner-referral-letter.front-end-with-html.v1';

/** @returns {import('./types.js').Referral} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  // Merge over a fresh empty so any newly-added fields default correctly.
  const fresh = emptyReferral();

  for (const key of Object.keys(fresh)) {
    if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null) {
      fresh[key] = { ...fresh[key], ...parsed[key] };
    } else if (parsed && typeof parsed[key] !== 'object' && parsed[key] !== undefined) {
      fresh[key] = parsed[key];
    }
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyReferral();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved referral; starting fresh.', e);
    return emptyReferral();
  }
}

/** @param {import('./types.js').Referral} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save referral to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored referral.', e);
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

/** @type {import('./types.js').Referral} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'general-practitioner-referral-letter',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const _rep = document.getElementById('report');
    if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    updateConditionalSections();
    refreshLiveStatus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 9;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-status readout after each change.
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
  refreshLiveStatus();
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

/** Map an <input type=…> to its Lily class name. */
function lilyInputClass(type) {
  switch (type) {
    case 'email':          return 'email-input';
    case 'number':         return 'number-input';
    case 'date':           return 'date-input';
    case 'datetime-local': return 'date-input';
    case 'time':           return 'time-input';
    case 'tel':            return 'tel-input';
    case 'url':            return 'url-input';
    case 'search':         return 'search-input';
    default:               return 'text-input';
  }
}

function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const labelText = esc(opts.label);
  const type = opts.type || 'text';
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${lilyInputClass(type)}"`,
    `value="${esc(value ?? '')}"`,
    `aria-describedby="${id}-error"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);
  if (opts.required) attrs.push('required', 'data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    let v;
    if (input.value === '' && (type === 'date' || type === 'datetime-local' || type === 'number')) {
      v = null;
    } else if (type === 'number') {
      const parsed = parseFloat(input.value);
      v = Number.isNaN(parsed) ? null : parsed;
    } else {
      v = input.value;
    }
    setField(opts.section, opts.field, v);
    clearFieldError(id);
  });
  return wrapper;
}

function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      ${opts.required ? 'required data-required' : ''}
      aria-describedby="${id}-error"
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

function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const labelText = esc(opts.label);

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${opts.required ? ' required data-required' : ''}>
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

function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field radio-fieldset';
  wrapper.id = `${groupId}-fieldset`;
  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  if (opts.required) legend.setAttribute('data-required', '');
  wrapper.appendChild(legend);
  if (opts.hint) {
    const hint = document.createElement('span');
    hint.className = 'hint';
    hint.textContent = opts.hint;
    wrapper.appendChild(hint);
  }
  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', `${groupId}-fieldset`);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
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
  const err = document.createElement('span');
  err.className = 'error-message';
  err.id = `${groupId}-error`;
  err.setAttribute('aria-live', 'polite');
  wrapper.appendChild(err);
  return wrapper;
}

function readOnlyReadout(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field readout';
  wrapper.innerHTML = `
    <label class="label">${esc(opts.label)}</label>
    <div id="${opts.id}" class="readout-value">${opts.render()}</div>
  `;
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
  legend.innerHTML =
    `<span class="section-step">Step ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const referrerRoleOptions = [
  { value: 'gp', label: 'GP' },
  { value: 'gp-registrar', label: 'GP registrar' },
  { value: 'nurse-practitioner', label: 'Nurse practitioner' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'paramedic', label: 'Paramedic' },
  { value: 'other', label: 'Other' }
];

const patientSexOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' }
];

const urgencyOptions = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'two-week-wait', label: 'Two-week-wait (suspected cancer)' },
  { value: 'emergency', label: 'Emergency' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per section)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Referrer details',
    description: 'Who is making this referral, and how the receiving service can contact you.'
  });
  card.appendChild(textInput({
    label: 'Your name', section: 'referrer', field: 'referrerName',
    required: true, placeholder: 'e.g. Dr Priya Nair'
  }));
  card.appendChild(selectInput({
    label: 'Your role', section: 'referrer', field: 'referrerRole',
    required: true, options: referrerRoleOptions
  }));
  card.appendChild(textInput({
    label: 'GMC / NMC / GPhC registration number', section: 'referrer',
    field: 'referrerRegistrationNumber', placeholder: 'e.g. 7654321'
  }));
  card.appendChild(textInput({
    label: 'Referring practice', section: 'referrer', field: 'referringPractice',
    required: true, placeholder: 'e.g. Elm Park Surgery'
  }));
  card.appendChild(textArea({
    label: 'Practice address', section: 'referrer', field: 'practiceAddress', rows: 2,
    placeholder: 'Practice postal address'
  }));
  card.appendChild(textInput({
    label: 'Contact (phone or secure email)', section: 'referrer', field: 'referrerContact',
    placeholder: 'e.g. 020 7946 0100 / elmpark@nhs.net'
  }));
  card.appendChild(textInput({
    label: 'Date of referral', section: 'referrer', field: 'referralDate',
    type: 'date'
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Who the referral is about, so the patient can be identified across services.'
  });
  card.appendChild(textInput({
    label: 'NHS number or local identifier', section: 'patient', field: 'patientIdentifier',
    required: true, placeholder: 'e.g. 943 476 5919'
  }));
  card.appendChild(textInput({
    label: 'Patient name', section: 'patient', field: 'patientName',
    required: true, placeholder: 'e.g. James Okoro'
  }));
  card.appendChild(textInput({
    label: 'Date of birth', section: 'patient', field: 'patientDateOfBirth',
    type: 'date', required: true
  }));
  card.appendChild(selectInput({
    label: 'Sex', section: 'patient', field: 'patientSex', options: patientSexOptions
  }));
  card.appendChild(textArea({
    label: 'Home address', section: 'patient', field: 'patientAddress', rows: 2,
    placeholder: 'Where the patient normally lives'
  }));
  card.appendChild(textInput({
    label: 'Contact (phone or email)', section: 'patient', field: 'patientContact',
    placeholder: 'e.g. 07700 900123'
  }));
  card.appendChild(textArea({
    label: 'Interpreter or accessibility needs', section: 'patient', field: 'accessNeeds',
    rows: 2, hint: 'Any interpreter, communication, or access needs.',
    placeholder: 'e.g. British Sign Language interpreter required'
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Referral destination',
    description: 'The specialty or service, a named clinician or team if known, and the receiving organisation.'
  });
  card.appendChild(textInput({
    label: 'Referral specialty / service', section: 'destination', field: 'referralSpecialty',
    required: true, placeholder: 'e.g. Gastroenterology'
  }));
  card.appendChild(textInput({
    label: 'Named clinician or team', section: 'destination', field: 'namedClinician',
    hint: 'Optional — a named consultant or team if the referral is directed.',
    placeholder: 'e.g. Dr Osei, Lower GI team'
  }));
  card.appendChild(textInput({
    label: 'Receiving organisation', section: 'destination', field: 'receivingOrganisation',
    placeholder: 'e.g. St Mary’s NHS Foundation Trust'
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Urgency',
    description: 'How urgently the referral must be seen. This drives the pathway and the mandatory information required.'
  });
  card.appendChild(selectInput({
    label: 'Urgency', section: 'urgencyInfo', field: 'urgency',
    required: true, options: urgencyOptions,
    hint: 'Emergency means arrange same-day assessment / 999 now — do not send a routine letter.'
  }));

  const reasonWrap = document.createElement('div');
  reasonWrap.setAttribute('data-conditional', 'urgencyInfo.urgency!=routine');
  reasonWrap.appendChild(textArea({
    label: 'Reason for urgency', section: 'urgencyInfo', field: 'urgencyReason', rows: 2,
    hint: 'Required for urgent and two-week-wait referrals.',
    placeholder: 'Why this referral is urgent.'
  }));
  card.appendChild(reasonWrap);

  const cancerWrap = document.createElement('div');
  cancerWrap.setAttribute('data-conditional', 'urgencyInfo.urgency=two-week-wait');
  const notice = document.createElement('p');
  notice.className = 'hint';
  notice.textContent =
    'Because this is a two-week-wait referral, name the NICE NG12 criterion and the tumour-site pathway.';
  cancerWrap.appendChild(notice);
  cancerWrap.appendChild(textInput({
    label: 'Suspected-cancer criterion (NICE NG12)', section: 'urgencyInfo',
    field: 'suspectedCancerCriterion',
    placeholder: 'e.g. Iron-deficiency anaemia in a patient aged ≥ 60'
  }));
  cancerWrap.appendChild(textInput({
    label: 'Suspected-cancer pathway (tumour site)', section: 'urgencyInfo',
    field: 'suspectedCancerPathway',
    placeholder: 'e.g. Lower gastrointestinal'
  }));
  card.appendChild(cancerWrap);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Reason and history',
    description: 'The reason for the referral, relevant clinical history, and any red-flag symptoms.'
  });
  card.appendChild(textArea({
    label: 'Reason for referral', section: 'clinical', field: 'reasonForReferral',
    required: true, rows: 3,
    hint: 'A concise, factual statement of what you are asking the service to address.',
    placeholder: 'e.g. Change in bowel habit and weight loss over 3 months.'
  }));
  card.appendChild(textArea({
    label: 'Relevant clinical history', section: 'clinical', field: 'relevantHistory',
    required: true, rows: 3,
    placeholder: 'Relevant past medical, surgical, and family history.'
  }));
  card.appendChild(textArea({
    label: 'Presenting problem', section: 'clinical', field: 'presentingProblem', rows: 2,
    placeholder: 'The presenting complaint in the patient’s own terms where useful.'
  }));
  card.appendChild(textInput({
    label: 'Symptom duration', section: 'clinical', field: 'symptomDuration',
    placeholder: 'e.g. 3 months'
  }));
  card.appendChild(textArea({
    label: 'Red-flag symptoms', section: 'clinical', field: 'redFlagSymptoms', rows: 2,
    hint: 'Documenting a red-flag symptom raises an emergency-features flag.',
    placeholder: 'e.g. Rectal bleeding; unintentional weight loss.'
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Examination and investigations',
    description: 'Examination findings and any investigation results already available.'
  });
  card.appendChild(textArea({
    label: 'Examination findings', section: 'examination', field: 'examinationFindings', rows: 3,
    placeholder: 'Relevant examination findings and vital signs.'
  }));
  card.appendChild(textArea({
    label: 'Investigation results', section: 'examination', field: 'investigationResults', rows: 3,
    hint: 'Bloods, imaging, or other investigations already done.',
    placeholder: 'e.g. FBC: Hb 98 g/L; ferritin 8 µg/L. FIT positive.'
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Medications and allergies',
    description: 'Current medications and known allergies and reactions.'
  });
  card.appendChild(textArea({
    label: 'Current medications', section: 'medications', field: 'currentMedications', rows: 3,
    placeholder: 'Current repeat and acute medications with doses.'
  }));
  card.appendChild(textArea({
    label: 'Allergies and reactions', section: 'medications', field: 'allergies', rows: 2,
    placeholder: 'Known drug allergies and the reactions they cause.'
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Expectations, consent and safety-netting',
    description: 'The patient’s expectations, consent to share information, and safety-netting advice.'
  });
  card.appendChild(textArea({
    label: 'Patient’s expectations / question to the specialist', section: 'expectations',
    field: 'patientExpectations', rows: 2,
    placeholder: 'What the patient hopes to gain, or a specific question to the specialist.'
  }));
  card.appendChild(radioGroup({
    label: 'Has the patient consented to this referral and to sharing information?',
    section: 'expectations', field: 'consentToShare', options: yesNo,
    hint: 'If not documented, the referral is still sendable but a consent flag is raised.'
  }));
  card.appendChild(textArea({
    label: 'Safety-netting advice', section: 'expectations', field: 'safetyNetting', rows: 2,
    hint: 'What the patient should do while waiting; absence raises a low-priority flag.',
    placeholder: 'e.g. Return or call 111 if symptoms worsen before the appointment.'
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Summary and review',
    description: 'The live completeness status and urgency, and a free-text note for the receiving service.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live status and urgency',
    id: 'live-status-readout',
    render: () => renderLiveStatus()
  }));

  card.appendChild(textArea({
    label: 'Free-text note', section: 'review', field: 'clinicalNote', rows: 3,
    placeholder: 'Anything else the receiving service should know.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readout
// ----------------------------------------------------------------------

/** Render the live completeness status + urgency + percentage. */
function renderLiveStatus() {
  const grade = gradeReferral(state);
  const statusBadge =
    `<span class="risk-badge ${statusClass(grade.status)}">${esc(statusLabel(grade.status))}</span>`;
  const urgencyBadge =
    `<span class="risk-badge ${urgencyClass(grade.urgency)}">${esc(urgencyLabel(grade.urgency))}</span>`;
  return `${statusBadge} ${urgencyBadge} <strong>${grade.completenessPercent}% complete</strong> ` +
    `<span class="muted">(${grade.presentCount} of ${grade.mandatoryCount} mandatory fields present)</span>`;
}

function refreshLiveStatus() {
  const el = document.getElementById('live-status-readout');
  if (el) el.innerHTML = renderLiveStatus();
}

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const negate = expr.includes('!=');
    const [path, target] = expr.split(negate ? '!=' : '=');
    const [section, field] = path.split('.');
    const current = state[section] ? state[section][field] : undefined;
    const matches = String(current) === target;
    host.style.display = (negate ? !matches : matches) ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each section maps to one or more progress "slots". A slot counts as answered
// when ANY of its fields is answered. Slots mirror the mandatory-plus-key
// content so progress tracks how close the referral is to being complete.
const STEP_SLOTS = {
  referrer: [['referrerName'], ['referrerRole'], ['referringPractice']],
  patient: [['patientIdentifier'], ['patientName'], ['patientDateOfBirth']],
  destination: [['referralSpecialty']],
  urgencyInfo: [['urgency']],
  clinical: [['reasonForReferral'], ['relevantHistory']],
  examination: [['examinationFindings', 'investigationResults']],
  medications: [['currentMedications', 'allergies']],
  expectations: [['consentToShare'], ['safetyNetting']],
  review: [['clinicalNote']]
};

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  let total = 0;
  const sectionAnswered = {};
  const sectionTotal = {};

  for (const section of Object.keys(STEP_SLOTS)) {
    const slots = STEP_SLOTS[section];
    sectionTotal[section] = slots.length;
    sectionAnswered[section] = 0;
    for (const slot of slots) {
      total++;
      const slotAnswered = slot.some((field) => isAnswered(section, field));
      if (slotAnswered) {
        answered++;
        sectionAnswered[section]++;
      }
    }
  }

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

function priorityClass(priority) {
  switch (priority) {
    case 'high': return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

/** Build a plain-text referral-letter preview from the current state. */
function renderLetterPreview() {
  const r = state;
  const lines = [];
  lines.push(`Date: ${r.referrer.referralDate || 'Not set'}`);
  lines.push('');
  lines.push(`To: ${r.destination.referralSpecialty || '[specialty]'}` +
    (r.destination.namedClinician ? `, ${r.destination.namedClinician}` : '') +
    (r.destination.receivingOrganisation ? `, ${r.destination.receivingOrganisation}` : ''));
  lines.push(`From: ${r.referrer.referrerName || '[referrer]'}` +
    (r.referrer.referrerRole ? ` (${referrerRoleLabel(r.referrer.referrerRole)})` : '') +
    (r.referrer.referringPractice ? `, ${r.referrer.referringPractice}` : ''));
  lines.push('');
  lines.push(`Re: ${r.patient.patientName || '[patient]'}` +
    (r.patient.patientDateOfBirth ? `, DOB ${r.patient.patientDateOfBirth}` : '') +
    (r.patient.patientIdentifier ? `, ${r.patient.patientIdentifier}` : ''));
  lines.push(`Urgency: ${urgencyLabel(r.urgencyInfo.urgency)}`);
  if (r.urgencyInfo.urgencyReason) lines.push(`Reason for urgency: ${r.urgencyInfo.urgencyReason}`);
  if (r.urgencyInfo.suspectedCancerCriterion) {
    lines.push(`Suspected-cancer criterion: ${r.urgencyInfo.suspectedCancerCriterion}`);
  }
  if (r.urgencyInfo.suspectedCancerPathway) {
    lines.push(`Suspected-cancer pathway: ${r.urgencyInfo.suspectedCancerPathway}`);
  }
  lines.push('');
  lines.push(`Reason for referral: ${r.clinical.reasonForReferral || '[reason]'}`);
  if (r.clinical.presentingProblem) lines.push(`Presenting problem: ${r.clinical.presentingProblem}`);
  if (r.clinical.symptomDuration) lines.push(`Symptom duration: ${r.clinical.symptomDuration}`);
  lines.push(`Relevant history: ${r.clinical.relevantHistory || '[history]'}`);
  if (r.clinical.redFlagSymptoms) lines.push(`Red-flag symptoms: ${r.clinical.redFlagSymptoms}`);
  if (r.examination.examinationFindings) lines.push(`Examination: ${r.examination.examinationFindings}`);
  if (r.examination.investigationResults) lines.push(`Investigations: ${r.examination.investigationResults}`);
  if (r.medications.currentMedications) lines.push(`Medications: ${r.medications.currentMedications}`);
  if (r.medications.allergies) lines.push(`Allergies: ${r.medications.allergies}`);
  if (r.expectations.patientExpectations) lines.push(`Patient’s expectations: ${r.expectations.patientExpectations}`);
  lines.push(`Consent to share: ${consentToShareLabel(r.expectations.consentToShare)}`);
  if (r.expectations.safetyNetting) lines.push(`Safety-netting: ${r.expectations.safetyNetting}`);
  if (r.review.clinicalNote) {
    lines.push('');
    lines.push(`Note: ${r.review.clinicalNote}`);
  }
  return esc(lines.join('\n'));
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    status, urgency, completenessPercent, presentCount, mandatoryCount,
    firedRules, flaggedIssues, timestamp
  } = lastResult;

  const ruleRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.description)}</th>
      <td class="num">
        <span class="grade-pill ${r.satisfied ? 'risk-low' : 'risk-high'}">
          ${r.satisfied ? 'Present' : 'Missing'}
        </span>
      </td>
    </tr>
  `).join('');

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No flags raised.</p>`
    : `
      <ul class="flags">
        ${flaggedIssues.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority))}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}${f.suggestedAction ? ` — ${esc(f.suggestedAction)}` : ''}</span>
          </li>
        `).join('')}
      </ul>
    `;

  let guidance;
  if (status === 'Incomplete') {
    guidance = `<p>This referral is <strong>Incomplete</strong>: one or more mandatory fields for the selected urgency are missing, so it should not be sent until resolved. Complete the outstanding items below. The urgency classification is still shown so that the correct pathway is not hidden by an incomplete form.</p>`;
  } else {
    guidance = `<p>This referral is <strong>Complete</strong>: every mandatory field for the selected urgency is present. It is ready to send to the receiving service. Review any flags below before sending.</p>`;
  }

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>General Practitioner Referral Letter — Completeness &amp; Urgency Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${urgencyClass(urgency)}">
        <div>
          <span class="risk-banner-label">Urgency</span>
          <span class="risk-banner-value">${esc(urgencyLabel(urgency))}</span>
        </div>
        <span class="risk-badge ${statusClass(status)}">${esc(statusLabel(status))} — ${completenessPercent}%</span>
      </div>

      <p class="pathway"><strong>Pathway:</strong> ${esc(urgencyPathway(urgency))}</p>

      <h3>Recommended action</h3>
      ${guidance}

      <h3>Mandatory fields (${presentCount} of ${mandatoryCount} present)</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Mandatory field</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>${ruleRows}</tbody>
      </table>

      <h3>Flags (${flaggedIssues.length})</h3>
      ${flagsList}

      <h3>Referral letter preview</h3>
      <pre class="letter-preview">${renderLetterPreview()}</pre>

      <div class="report-actions">
        <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
      </div>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
}

function submitForm() {
  const _errors = validateForm();
  if (_errors.length > 0) return;
  const grade = gradeReferral(state);
  const flaggedIssues = detectFlaggedIssues(state);
  lastResult = {
    status: grade.status,
    urgency: grade.urgency,
    completenessPercent: grade.completenessPercent,
    presentCount: grade.presentCount,
    mandatoryCount: grade.mandatoryCount,
    firedRules: grade.firedRules,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh referral?')) return;
  clearState();
  state = emptyReferral();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveStatus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'referrer',     title: 'Referrer' },
  { step: 2, section: 'patient',      title: 'Patient' },
  { step: 3, section: 'destination',  title: 'Destination' },
  { step: 4, section: 'urgencyInfo',  title: 'Urgency' },
  { step: 5, section: 'clinical',     title: 'Reason & history' },
  { step: 6, section: 'examination',  title: 'Examination' },
  { step: 7, section: 'medications',  title: 'Medications' },
  { step: 8, section: 'expectations', title: 'Consent & safety-netting' },
  { step: 9, section: 'review',       title: 'Summary' }
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
// Validation (per-field + error summary)
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
  if (input) input.setAttribute('aria-invalid', 'true');
}

function validateForm() {
  const errors = [];
  const form = document.getElementById('assessment-form');
  if (!form) return errors;
  const required = form.querySelectorAll('input[data-required], select[data-required], textarea[data-required]');
  const seen = new Set();
  required.forEach((input) => {
    let id = input.id;
    if (input.type === 'radio') id = input.name;
    if (seen.has(id)) return;
    seen.add(id);
    // Skip fields hidden inside a collapsed conditional section.
    const conditional = input.closest('[data-conditional]');
    if (conditional && conditional.style.display === 'none') return;
    let value = '';
    if (input.type === 'radio') {
      const chosen = form.querySelector(`input[name="${id}"]:checked`);
      value = chosen ? chosen.value : '';
    } else {
      value = (input.value || '').trim();
    }
    if (!value) {
      const fs = document.getElementById(`${id}-fieldset`);
      const labelEl = form.querySelector(`label[for="${id}"]`);
      const label = (fs ? fs.querySelector('legend') : labelEl);
      const labelText = label
        ? label.textContent.replace(/\s*\*\s*$/, '').trim()
        : id;
      errors.push({ id, message: `${labelText} is required` });
      setFieldError(id, `${labelText} is required`);
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
      `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`
    ).join('') +
    '</ul>';
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (typeof summary.focus === 'function') {
    summary.setAttribute('tabindex', '-1');
    summary.focus({ preventScroll: true });
  }
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
  refreshLiveStatus();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
