import { detectFlaggedIssues } from './flags.js';
import { gradeCompleteness } from './grader.js';
import { componentRules } from './rules.js';
import { allergyStatusLabel, emptyAssessment, flatten, priorityLabel, statusClass, statusLabel } from './types.js';

// History and Physical Examination (H&P) — clerking wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// completeness status (Complete / Partial / Incomplete + percentage) updates as
// the clerking is filled in. Submission runs the pure completeness engine
// (required-component presence -> status + percentage, plus safety flags) and
// renders an inline clerking-completeness report. State is persisted to
// localStorage so a partial fill survives a page reload.
//
// This is a documentation / completeness form, NOT a scored instrument.

// Map of component id -> human-readable label, for the completeness checklist.
const COMPONENT_LABELS = {};
for (const rule of componentRules) COMPONENT_LABELS[rule.component] = rule.label;
function componentLabel(id) {
  return COMPONENT_LABELS[id] || id;
}

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'history-and-physical-examination.front-end-with-html.v1';

/** @returns {import('./types.js').AssessmentData} */
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
    console.warn('Could not parse saved clerking; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save clerking to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored clerking.', e);
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
  slug: 'history-and-physical-examination',
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

const TOTAL_STEPS = 12;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a nested field on the state and persist. Re-runs progress, conditional
 * visibility, and the live-status readout after each change.
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
  if (opts.required) attrs.push('required', 'data-required');
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
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

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
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
// Section renderers (one per clerking step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Encounter and clinician',
    description: 'Who is clerking, their registration, and when and where the encounter took place.'
  });
  card.appendChild(textInput({
    label: 'Clerking clinician name',
    section: 'encounter', field: 'clinicianName', required: true,
    placeholder: 'e.g. Dr A. Khan'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'encounter', field: 'clinicianRole', required: true,
    options: [
      { value: 'doctor', label: 'Doctor' },
      { value: 'acp', label: 'Advanced clinical practitioner' },
      { value: 'physician-associate', label: 'Physician associate' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Registration number',
    section: 'encounter', field: 'registrationNumber',
    placeholder: 'GMC / NMC / HCPC number'
  }));
  card.appendChild(textInput({
    label: 'Date and time of clerking',
    section: 'encounter', field: 'clerkedAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'encounter', field: 'careSetting', required: true,
    options: [
      { value: 'emergency-department', label: 'Emergency department' },
      { value: 'acute-medical-unit', label: 'Acute medical unit' },
      { value: 'ward', label: 'Ward' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Admission source',
    section: 'encounter', field: 'admissionSource',
    options: [
      { value: 'self', label: 'Self-presentation' },
      { value: 'gp', label: 'GP referral' },
      { value: 'ambulance', label: 'Ambulance' },
      { value: 'transfer', label: 'Inter-hospital transfer' },
      { value: 'other', label: 'Other' }
    ]
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age band, and sex. The H&P is a general adult clerking template.'
  });
  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. AMU-100482 or hospital MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    options: [
      { value: '18-39', label: '18-39' },
      { value: '40-64', label: '40-64' },
      { value: '65-79', label: '65-79' },
      { value: '80-plus', label: '80 and over' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'identification', field: 'sex', required: true,
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'intersex', label: 'Intersex' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Presenting complaint',
    description: 'Required components — the presenting complaint and its history.'
  });
  card.appendChild(textArea({
    label: 'Presenting complaint',
    section: 'history', field: 'presentingComplaint',
    placeholder: 'e.g. Central chest pain for 2 hours'
  }));
  card.appendChild(textArea({
    label: 'History of presenting complaint',
    section: 'history', field: 'historyOfPresentingComplaint', rows: 5,
    placeholder: 'Onset, character, radiation, associated features, prior episodes...'
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Past history and medications',
    description: 'Past medical / surgical history, drug history, and allergy status. Allergy status is a blocking requirement.'
  });
  card.appendChild(textArea({
    label: 'Past medical and surgical history',
    section: 'history', field: 'pastMedicalSurgicalHistory',
    placeholder: 'Conditions and operations, or explicit "nil".'
  }));
  card.appendChild(textArea({
    label: 'Drug history',
    section: 'history', field: 'drugHistory',
    placeholder: 'Current medications, doses, and adherence.'
  }));
  card.appendChild(selectInput({
    label: 'Allergy status',
    section: 'history', field: 'allergyStatus',
    hint: 'Allergies must be explicitly documented. "Not documented" (or leaving this blank) raises a blocking flag.',
    options: [
      { value: 'none-known', label: 'No known drug allergies' },
      { value: 'has-allergies', label: 'Has documented allergies' },
      { value: 'not-documented', label: 'Not documented' }
    ]
  }));

  // Conditional: allergy detail, shown only when allergies are present.
  const conditional = document.createElement('div');
  conditional.setAttribute('data-conditional', 'history.allergyStatus=has-allergies');
  conditional.appendChild(textArea({
    label: 'Allergy detail (substance and reaction)',
    section: 'history', field: 'allergyDetail',
    placeholder: 'e.g. Penicillin — anaphylaxis; contrast — urticaria.'
  }));
  card.appendChild(conditional);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Family and social history',
    description: 'Family history (optional) and social history (required).'
  });
  card.appendChild(textArea({
    label: 'Family history',
    section: 'history', field: 'familyHistory',
    placeholder: 'Relevant familial conditions, or explicit "nil".'
  }));
  card.appendChild(textArea({
    label: 'Social history',
    section: 'history', field: 'socialHistory',
    placeholder: 'Smoking, alcohol, occupation, living situation, functional baseline.'
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Systems review',
    description: 'Required component — each system addressed or explicitly marked "not relevant".'
  });
  card.appendChild(textArea({
    label: 'Systems review',
    section: 'history', field: 'systemsReview', rows: 5,
    placeholder: 'Cardiovascular, respiratory, gastrointestinal, genitourinary, neurological, musculoskeletal, dermatological...'
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Vital signs',
    description: 'Record the observations available at clerking. Values outside the normal range are flagged (NEWS2).'
  });
  card.appendChild(textInput({
    label: 'Temperature',
    section: 'vitals', field: 'temperature',
    type: 'number', min: 25, max: 45, step: 0.1, unit: '°C',
    hint: 'Normal 36.1-38.0 °C.'
  }));
  card.appendChild(textInput({
    label: 'Heart rate',
    section: 'vitals', field: 'heartRate',
    type: 'number', min: 0, max: 300, step: 1, unit: 'bpm',
    hint: 'Normal 51-90 bpm.'
  }));
  card.appendChild(textInput({
    label: 'Respiratory rate',
    section: 'vitals', field: 'respiratoryRate',
    type: 'number', min: 0, max: 80, step: 1, unit: '/min',
    hint: 'Normal 12-20 /min.'
  }));
  card.appendChild(textInput({
    label: 'Systolic blood pressure',
    section: 'vitals', field: 'systolicBloodPressure',
    type: 'number', min: 0, max: 300, step: 1, unit: 'mmHg',
    hint: 'Normal 111-219 mmHg.'
  }));
  card.appendChild(textInput({
    label: 'Oxygen saturation',
    section: 'vitals', field: 'oxygenSaturation',
    type: 'number', min: 0, max: 100, step: 1, unit: '%',
    hint: 'Normal 96% or above.'
  }));
  card.appendChild(selectInput({
    label: 'Consciousness level (AVPU)',
    section: 'vitals', field: 'consciousnessLevel',
    hint: 'Anything other than Alert is flagged.',
    options: [
      { value: 'alert', label: 'Alert' },
      { value: 'voice', label: 'Responds to voice' },
      { value: 'pain', label: 'Responds to pain' },
      { value: 'unresponsive', label: 'Unresponsive' }
    ]
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Physical examination by system',
    description: 'Required component — the four core systems must each be examined or explicitly deferred with a reason.'
  });
  card.appendChild(textArea({
    label: 'Cardiovascular',
    section: 'examination', field: 'examCardiovascular',
    placeholder: 'Findings, or "deferred — reason".'
  }));
  card.appendChild(textArea({
    label: 'Respiratory',
    section: 'examination', field: 'examRespiratory',
    placeholder: 'Findings, or "deferred — reason".'
  }));
  card.appendChild(textArea({
    label: 'Abdominal',
    section: 'examination', field: 'examAbdominal',
    placeholder: 'Findings, or "deferred — reason".'
  }));
  card.appendChild(textArea({
    label: 'Neurological',
    section: 'examination', field: 'examNeurological',
    placeholder: 'Findings, or "deferred — reason".'
  }));
  card.appendChild(textArea({
    label: 'Other systems / general inspection',
    section: 'examination', field: 'examOther',
    placeholder: 'General inspection and any other systems examined (optional).'
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Investigations',
    description: 'Bedside, laboratory, and imaging results available at clerking (optional).'
  });
  card.appendChild(textArea({
    label: 'Investigations',
    section: 'examination', field: 'investigations', rows: 4,
    placeholder: 'ECG, bloods, venous gas, chest X-ray, point-of-care results...'
  }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Impression and problem list',
    description: 'Required component — the working impression, plus any red-flag findings.'
  });
  card.appendChild(textArea({
    label: 'Impression / problem list',
    section: 'assessment', field: 'impression', rows: 4,
    placeholder: 'Working impression, differential diagnoses, numbered problem list.'
  }));
  card.appendChild(textArea({
    label: 'Red-flag findings',
    section: 'assessment', field: 'redFlagFindings',
    placeholder: 'Any red-flag examination or history findings. A red flag without a plan is flagged.'
  }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Management plan',
    description: 'Required component — investigations requested, treatment, referrals, escalation, monitoring, and disposition.'
  });
  card.appendChild(textArea({
    label: 'Management plan',
    section: 'assessment', field: 'managementPlan', rows: 5,
    placeholder: 'Investigations, treatment, referrals, escalation / monitoring plan, disposition.'
  }));
  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Summary and completeness',
    description: 'Live completeness status and a free-text clinical note. Submit to generate the full report.'
  });
  card.appendChild(readOnlyReadout({
    label: 'Live completeness status',
    id: 'live-status-readout',
    render: () => renderLiveStatus()
  }));
  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'assessment', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, decisions, and any escalation already actioned.'
  }));
  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

function renderLiveStatus() {
  const grade = gradeCompleteness(flatten(state));
  const badge =
    `<span class="risk-badge ${statusClass(grade.status)}">${esc(statusLabel(grade.status))}</span>`;
  return `<strong>${grade.completenessPercent}% documented</strong> ${badge} ` +
    `<span class="muted">(${grade.satisfiedComponents.length} of ${componentRules.length} required components)</span>`;
}

function refreshLiveStatus() {
  const live = document.getElementById('live-status-readout');
  if (live) live.innerHTML = renderLiveStatus();
}

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
// Progress (step-based)
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of
// [section, field] pairs; the slot counts as answered when ANY of its fields is
// answered. This lets the vitals step count once when any observation is
// recorded.
const STEP_DEFINITIONS = [
  { step: 1, title: 'Encounter', slots: [
    [['encounter', 'clinicianName']],
    [['encounter', 'clinicianRole']],
    [['encounter', 'careSetting']]
  ] },
  { step: 2, title: 'Patient', slots: [
    [['identification', 'patientIdentifier']],
    [['identification', 'ageBand']],
    [['identification', 'sex']]
  ] },
  { step: 3, title: 'Presenting complaint', slots: [
    [['history', 'presentingComplaint']],
    [['history', 'historyOfPresentingComplaint']]
  ] },
  { step: 4, title: 'Past history and drugs', slots: [
    [['history', 'pastMedicalSurgicalHistory']],
    [['history', 'drugHistory']],
    [['history', 'allergyStatus']]
  ] },
  { step: 5, title: 'Family and social', slots: [
    [['history', 'socialHistory']]
  ] },
  { step: 6, title: 'Systems review', slots: [
    [['history', 'systemsReview']]
  ] },
  { step: 7, title: 'Vital signs', slots: [
    [['vitals', 'temperature'], ['vitals', 'heartRate'], ['vitals', 'respiratoryRate'],
     ['vitals', 'systolicBloodPressure'], ['vitals', 'oxygenSaturation'], ['vitals', 'consciousnessLevel']]
  ] },
  { step: 8, title: 'Examination', slots: [
    [['examination', 'examCardiovascular']],
    [['examination', 'examRespiratory']],
    [['examination', 'examAbdominal']],
    [['examination', 'examNeurological']]
  ] },
  { step: 9, title: 'Investigations', slots: [
    [['examination', 'investigations']]
  ] },
  { step: 10, title: 'Impression', slots: [
    [['assessment', 'impression']]
  ] },
  { step: 11, title: 'Management plan', slots: [
    [['assessment', 'managementPlan']]
  ] },
  { step: 12, title: 'Summary', slots: [
    [['assessment', 'clinicalNote']]
  ] }
];

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  let total = 0;
  const stepAnswered = {};
  const stepTotal = {};

  for (const def of STEP_DEFINITIONS) {
    stepTotal[def.step] = def.slots.length;
    stepAnswered[def.step] = 0;
    for (const slot of def.slots) {
      total++;
      const slotAnswered = slot.some(([s, f]) => isAnswered(s, f));
      if (slotAnswered) {
        answered++;
        stepAnswered[def.step]++;
      }
    }
  }

  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(stepAnswered, stepTotal);
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
    status, completenessPercent, satisfiedComponents, missingComponents,
    flags, timestamp
  } = lastResult;

  const componentRows = componentRules.map((rule) => {
    const done = satisfiedComponents.indexOf(rule.component) !== -1;
    return `
      <tr>
        <th scope="row">${esc(rule.label)}</th>
        <td>
          <span class="grade-pill ${done ? 'ok' : 'warn'}">
            ${done ? 'Documented' : 'Missing'}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  const flagsList = flags.length === 0
    ? `<p class="muted">No safety flags raised.</p>`
    : `
      <ul class="flags">
        ${flags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority))}</span>
            <span class="flag-category">${esc(f.category)}${f.blocking ? ' (blocking)' : ''}</span>
            <span class="flag-message">${esc(f.description)}${f.suggestedAction ? ` — ${esc(f.suggestedAction)}` : ''}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const guidance =
    status === 'complete'
      ? `<p>The clerking is <strong>complete</strong>: every required component is documented and no blocking flag is raised. A complete grade means the document is well-formed, not that the clinical reasoning is correct.</p>`
      : status === 'partial'
        ? `<p>The clerking is <strong>partial</strong>: the core clinical narrative is present but one or more required components are still missing. Complete the missing components listed below.</p>`
        : `<p>The clerking is <strong>incomplete</strong>: the core clinical narrative is missing, or a blocking flag (allergy status undocumented, or no impression and no plan) has been raised. Resolve the blocking flag(s) and document the missing components.</p>`;

  const missingList = missingComponents.length === 0
    ? `<p class="muted">All required components are documented.</p>`
    : `<ul class="flags">${missingComponents.map((c) =>
        `<li class="flag-medium"><span class="flag-message">${esc(componentLabel(c))}</span></li>`
      ).join('')}</ul>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>H&amp;P Clerking Completeness Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${statusClass(status)}">
        <div>
          <span class="risk-banner-label">Completeness status</span>
          <span class="risk-banner-value">${esc(statusLabel(status))}</span>
        </div>
        <span class="risk-badge ${statusClass(status)}">${completenessPercent}% documented</span>
      </div>

      <h3>Guidance</h3>
      ${guidance}

      <h3>Required components (${satisfiedComponents.length} of ${componentRules.length})</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Component</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>${componentRows}</tbody>
      </table>

      <h3>Missing components (${missingComponents.length})</h3>
      ${missingList}

      <h3>Safety flags (${flags.length})</h3>
      ${flagsList}

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
  const rec = flatten(state);
  const grade = gradeCompleteness(rec);
  const flags = detectFlaggedIssues(rec);
  lastResult = {
    status: grade.status,
    completenessPercent: grade.completenessPercent,
    satisfiedComponents: grade.satisfiedComponents,
    missingComponents: grade.missingComponents,
    firedRules: grade.firedRules,
    flags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh clerking?')) return;
  clearState();
  state = emptyAssessment();
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

function updateStepListStatuses(stepAnswered, stepTotal) {
  const ol = document.getElementById('step-list');
  if (!ol) return;
  let firstUnfinished = -1;
  for (const def of STEP_DEFINITIONS) {
    const li = ol.querySelector(`[data-step="${def.step}"]`);
    if (!li) continue;
    const a = stepAnswered[def.step] || 0;
    const t = stepTotal[def.step] || 0;
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
    let value = '';
    if (input.type === 'radio') {
      const chosen = form.querySelector(`input[name="${id}"]:checked`);
      value = chosen ? chosen.value : '';
    } else {
      value = (input.value || '').trim();
    }
    if (!value) {
      const labelEl = form.querySelector(`label[for="${id}"]`);
      const labelText = labelEl
        ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim()
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
  host.appendChild(renderStep10());
  host.appendChild(renderStep11());
  host.appendChild(renderStep12());
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
