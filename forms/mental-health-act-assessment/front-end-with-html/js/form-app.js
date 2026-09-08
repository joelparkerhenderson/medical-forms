import { detectFlaggedIssues } from './flags.js';
import { gradeMentalHealthActAssessment } from './grader.js';
import { completenessStatusClass, completenessStatusLabel, criterionLabel, emptyAssessment, outcomeLabel, priorityLabel, sectionClassLabel, urgencyClass, urgencyLabel } from './types.js';

// Mental Health Act Assessment — wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The AMHP / clinician scrolls through the ten assessment
// sections; a sticky top-of-page progress summary reflects how many fields have
// been answered, and a live readout shows the running legal-completeness status
// (valid / incomplete), the recommended-section classification, and the urgency.
// Submission runs the pure engine (classification → completeness + urgency, plus
// required-signatory and criteria checks and flagged issues) and renders an
// inline report. State is persisted to localStorage so a partial fill survives a
// page reload.
//
// This is a LEGAL and CLINICAL DOCUMENTATION instrument, NOT an automated
// decision to detain. The engine validates documentation and classifies only.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'mental-health-act-assessment.front-end-with-html.v1';

/** @returns {import('./types.js').MentalHealthActAssessment} */
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
    } else if (parsed && typeof parsed[key] !== 'object' && parsed[key] !== undefined) {
      fresh[key] = parsed[key];
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

/** @param {import('./types.js').MentalHealthActAssessment} state */
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

/** @type {import('./types.js').MentalHealthActAssessment} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'mental-health-act-assessment',
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

const TOTAL_STEPS = 10;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-status readout after each change.
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

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    const v = input.value === '' && (type === 'date' || type === 'datetime-local')
      ? null
      : input.value;
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

const criterionOptions = [
  { value: 'met', label: 'Met' },
  { value: 'not-met', label: 'Not met' },
  { value: 'not-applicable', label: 'Not applicable' }
];

const locationOptions = [
  { value: 'hospital-ward', label: 'Hospital ward' },
  { value: 'emergency-department', label: 'Emergency department' },
  { value: 'place-of-safety', label: 'Place of safety (s136 suite)' },
  { value: 'care-home', label: 'Care home' },
  { value: 'community', label: 'Community / person’s home' },
  { value: 'other', label: 'Other' }
];

const ageBandOptions = [
  { value: 'child', label: 'Child' },
  { value: 'adolescent', label: 'Adolescent' },
  { value: 'adult', label: 'Adult' },
  { value: 'older-adult', label: 'Older adult' }
];

const sexOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'intersex', label: 'Intersex' },
  { value: 'unknown', label: 'Unknown' }
];

const imminenceOptions = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'imminent', label: 'Imminent' }
];

const consultedOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not-practicable', label: 'Not practicable' }
];

const objectionOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' }
];

const sectionOptions = [
  { value: '2', label: 'Section 2 — admission for assessment (28 days)' },
  { value: '3', label: 'Section 3 — admission for treatment (6 months)' },
  { value: '4', label: 'Section 4 — emergency admission (72 hours)' },
  { value: '5-2', label: 'Section 5(2) — doctor’s holding power (72 hours)' },
  { value: '5-4', label: 'Section 5(4) — nurse’s holding power (6 hours)' },
  { value: '136', label: 'Section 136 — police place-of-safety power (24 hours)' },
  { value: 'none', label: 'None — informal admission or community outcome' }
];

const outcomeOptions = [
  { value: 'detain-under-section', label: 'Detain under section' },
  { value: 'informal-admission', label: 'Informal admission' },
  { value: 'community', label: 'Community / care in the community' },
  { value: 'no-action', label: 'No action' }
];

const conveyanceOptions = [
  { value: 'ambulance', label: 'Ambulance' },
  { value: 'police', label: 'Police' },
  { value: 'self', label: 'Self / own transport' },
  { value: 'other', label: 'Other' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per assessment step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'When and where the assessment is convened, and why.'
  });
  card.appendChild(textInput({
    label: 'Date and time of assessment', section: 'context', field: 'assessedAt',
    type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Location / setting', section: 'context', field: 'location',
    options: locationOptions
  }));
  card.appendChild(textInput({
    label: 'Referral source', section: 'context', field: 'referralSource',
    placeholder: 'Who requested the assessment'
  }));
  card.appendChild(textArea({
    label: 'Reason for assessment', section: 'context', field: 'reasonForAssessment',
    placeholder: 'Presenting concern that prompted the assessment.'
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Person identification',
    description: 'Who the assessment is about.'
  });
  card.appendChild(textInput({
    label: 'Person identifier (NHS number or local ID)', section: 'identification',
    field: 'personIdentifier', required: true, placeholder: 'e.g. 943 476 5919'
  }));
  card.appendChild(selectInput({
    label: 'Age band', section: 'identification', field: 'ageBand',
    options: ageBandOptions
  }));
  card.appendChild(selectInput({
    label: 'Sex', section: 'identification', field: 'sex', options: sexOptions
  }));
  card.appendChild(textInput({
    label: 'First language', section: 'identification', field: 'firstLanguage',
    hint: 'Record interpreter need if not English.',
    placeholder: 'e.g. English; interpreter required'
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Assessing professionals',
    description: 'The AMHP and the medical practitioners providing recommendations.'
  });
  card.appendChild(textInput({
    label: 'AMHP name', section: 'professionals', field: 'amhpName',
    placeholder: 'Approved Mental Health Professional'
  }));
  card.appendChild(radioGroup({
    label: 'AMHP approval confirmed?', section: 'professionals', field: 'amhpApproved',
    options: yesNo
  }));
  card.appendChild(textInput({
    label: 'Doctor 1 — name', section: 'professionals', field: 'doctor1Name',
    placeholder: 'First medical practitioner'
  }));
  card.appendChild(textInput({
    label: 'Doctor 1 — GMC number', section: 'professionals', field: 'doctor1GmcNumber',
    placeholder: 'e.g. 7654321'
  }));
  card.appendChild(radioGroup({
    label: 'Doctor 1 — Section 12 approved?', section: 'professionals',
    field: 'doctor1Section12Approved', options: yesNo
  }));
  card.appendChild(textInput({
    label: 'Doctor 1 — examined at', section: 'professionals', field: 'doctor1ExaminedAt',
    type: 'datetime-local'
  }));
  card.appendChild(textInput({
    label: 'Doctor 2 — name', section: 'professionals', field: 'doctor2Name',
    hint: 'Required for Section 2 and Section 3; may be absent for s4 / s5 / s136.',
    placeholder: 'Second medical practitioner'
  }));
  card.appendChild(textInput({
    label: 'Doctor 2 — GMC number', section: 'professionals', field: 'doctor2GmcNumber',
    placeholder: 'e.g. 1234567'
  }));
  card.appendChild(radioGroup({
    label: 'Doctor 2 — Section 12 approved?', section: 'professionals',
    field: 'doctor2Section12Approved', options: yesNo
  }));
  card.appendChild(textInput({
    label: 'Doctor 2 — examined at', section: 'professionals', field: 'doctor2ExaminedAt',
    type: 'datetime-local',
    hint: 'For s2 / s3 the two examinations must be within 5 days of each other.'
  }));
  card.appendChild(radioGroup({
    label: 'Prior acquaintance with the patient?', section: 'professionals',
    field: 'priorAcquaintance', options: yesNo,
    hint: 'The Code of Practice recommends at least one doctor be previously acquainted, where practicable.'
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Mental disorder',
    description: 'Criterion 1 — a mental disorder of a nature or degree that warrants the proposed action.'
  });
  card.appendChild(selectInput({
    label: 'Mental disorder present (criterion 1)', section: 'mentalDisorder',
    field: 'mentalDisorderPresent', options: criterionOptions
  }));
  card.appendChild(textArea({
    label: 'Supporting evidence', section: 'mentalDisorder', field: 'mentalDisorderEvidence',
    placeholder: 'Presentation, nature / degree of disorder, and supporting evidence.'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Risk',
    description: 'Criterion 2 — necessity in the interests of the person’s own health or safety, or for the protection of others.'
  });
  card.appendChild(selectInput({
    label: 'Risk to own health', section: 'risk', field: 'riskToOwnHealth',
    options: criterionOptions
  }));
  card.appendChild(selectInput({
    label: 'Risk to own safety', section: 'risk', field: 'riskToOwnSafety',
    options: criterionOptions
  }));
  card.appendChild(selectInput({
    label: 'Risk to others', section: 'risk', field: 'riskToOthers',
    options: criterionOptions
  }));
  card.appendChild(textArea({
    label: 'Supporting evidence', section: 'risk', field: 'riskEvidence',
    placeholder: 'Evidence for the risk criteria.'
  }));
  card.appendChild(selectInput({
    label: 'Imminence of risk', section: 'risk', field: 'riskImminence',
    options: imminenceOptions,
    hint: 'Imminent risk classifies the assessment as an emergency.'
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Least-restrictive alternative',
    description: 'Criterion 3 — the objective cannot be achieved in a less restrictive way (Article 5, right to liberty).'
  });
  card.appendChild(selectInput({
    label: 'No less restrictive alternative (criterion 3)', section: 'leastRestrictive',
    field: 'leastRestrictiveMet', options: criterionOptions
  }));
  card.appendChild(textArea({
    label: 'Alternatives considered', section: 'leastRestrictive', field: 'alternativesConsidered',
    placeholder: 'Informal admission, community treatment, or Mental Capacity Act options considered, and why they are insufficient.'
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Appropriate treatment',
    description: 'Criterion 4 — for Section 3, appropriate medical treatment must be available.'
  });
  card.appendChild(selectInput({
    label: 'Appropriate medical treatment available (criterion 4, s3)', section: 'treatment',
    field: 'appropriateTreatmentAvailable', options: criterionOptions
  }));
  card.appendChild(textArea({
    label: 'Treatment plan summary', section: 'treatment', field: 'treatmentPlanSummary',
    placeholder: 'Proposed treatment and where it would be provided.'
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Nearest relative / consultees',
    description: 'The nearest-relative position and the AMHP consultation record.'
  });
  card.appendChild(radioGroup({
    label: 'Nearest relative identified?', section: 'nearestRelative',
    field: 'nearestRelativeIdentified', options: yesNo
  }));
  card.appendChild(selectInput({
    label: 'Nearest relative consulted?', section: 'nearestRelative',
    field: 'nearestRelativeConsulted', options: consultedOptions,
    hint: 'For Section 3, consult the nearest relative or record why it is not practicable.'
  }));
  card.appendChild(selectInput({
    label: 'Nearest relative objection (to a s3 application)', section: 'nearestRelative',
    field: 'nearestRelativeObjection', options: objectionOptions
  }));
  card.appendChild(textArea({
    label: 'Consultation record', section: 'nearestRelative', field: 'consultationRecord',
    placeholder: 'AMHP consultation notes.'
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Recommended section and outcome',
    description: 'The recommended section, the outcome, and conveyance. This records a recommendation — it is not an automated decision to detain.'
  });
  card.appendChild(selectInput({
    label: 'Recommended section', section: 'recommendation', field: 'recommendedSection',
    required: true, options: sectionOptions
  }));
  card.appendChild(selectInput({
    label: 'Outcome', section: 'recommendation', field: 'outcome',
    required: true, options: outcomeOptions
  }));
  card.appendChild(radioGroup({
    label: 'Receiving bed identified?', section: 'recommendation', field: 'bedIdentified',
    options: yesNo
  }));
  card.appendChild(selectInput({
    label: 'Conveyance', section: 'recommendation', field: 'conveyance',
    options: conveyanceOptions
  }));
  card.appendChild(textArea({
    label: 'Clinical and legal note', section: 'recommendation', field: 'clinicalLegalNote',
    placeholder: 'Free-text clinical and legal note.'
  }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Summary and validation',
    description: 'The live legal-completeness status, section classification, and urgency. Submit to generate the full report.'
  });
  card.appendChild(readOnlyReadout({
    label: 'Live validation status',
    id: 'live-status-readout',
    render: () => renderLiveStatus()
  }));
  return card;
}

// ----------------------------------------------------------------------
// Live readout
// ----------------------------------------------------------------------

/** Render the live status badges: completeness, section class, urgency. */
function renderLiveStatus() {
  const grade = gradeMentalHealthActAssessment(state);
  const completeness =
    `<span class="risk-badge ${completenessStatusClass(grade.completenessStatus)}">${esc(completenessStatusLabel(grade.completenessStatus))}</span>`;
  const urgency =
    `<span class="risk-badge ${urgencyClass(grade.urgencyClass)}">${esc(urgencyLabel(grade.urgencyClass))}</span>`;
  const present = grade.requiredSignatories.filter((s) => s.present).length;
  const total = grade.requiredSignatories.length;
  return `${completeness} ${urgency} ` +
    `<strong>${esc(sectionClassLabel(grade.recommendedSectionClass))}</strong> ` +
    `<span class="muted">(${present} of ${total} required signatories present)</span>`;
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
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = state[section] ? state[section][field] : undefined;
    host.style.display = String(current) === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each section maps to one or more progress "slots". A slot counts as answered
// when ANY of its fields is answered.
const STEP_SLOTS = {
  context: [['assessedAt'], ['location'], ['reasonForAssessment']],
  identification: [['personIdentifier'], ['ageBand'], ['sex']],
  professionals: [['amhpName'], ['doctor1Name']],
  mentalDisorder: [['mentalDisorderPresent'], ['mentalDisorderEvidence']],
  risk: [['riskToOwnHealth', 'riskToOwnSafety', 'riskToOthers'], ['riskEvidence']],
  leastRestrictive: [['leastRestrictiveMet'], ['alternativesConsidered']],
  treatment: [['appropriateTreatmentAvailable']],
  nearestRelative: [['nearestRelativeIdentified'], ['nearestRelativeConsulted']],
  recommendation: [['recommendedSection'], ['outcome']]
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    completenessStatus, recommendedSectionClass, urgencyClass: urgency,
    requiredSignatories, criteriaSummary, flaggedIssues, timestamp
  } = lastResult;

  const signatoryRows = requiredSignatories.length === 0
    ? `<tr><th scope="row">No statutory signatories required</th><td class="num">—</td></tr>`
    : requiredSignatories.map((s) => `
      <tr>
        <th scope="row">${esc(s.label)}</th>
        <td class="num">
          <span class="grade-pill ${s.present ? 'risk-low' : 'risk-high'}">
            ${s.present ? 'Present' : 'Absent'}
          </span>
        </td>
      </tr>
    `).join('');

  const criteriaRows = criteriaSummary.length === 0
    ? `<tr><th scope="row">No statutory criteria required</th><td class="num">—</td><td class="num">—</td></tr>`
    : criteriaSummary.map((c) => `
      <tr>
        <th scope="row">${esc(c.label)}</th>
        <td class="num">
          <span class="grade-pill ${c.status === 'met' ? 'risk-low' : (c.status === 'not-met' ? 'risk-high' : '')}">
            ${esc(criterionLabel(c.status))}
          </span>
        </td>
        <td class="num">
          <span class="grade-pill ${c.evidencePresent ? 'risk-low' : 'risk-high'}">
            ${c.evidencePresent ? 'Recorded' : 'Missing'}
          </span>
        </td>
      </tr>
    `).join('');

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No safety, legal, or governance flags raised.</p>`
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

  const guidance = completenessStatus === 'valid'
    ? `<p>The documentation for this assessment is <strong>valid</strong>: every element the recommended section requires is present, and every applicable statutory criterion is met with evidence. This is a documentation-completeness finding — it is <strong>not</strong> a decision that detention is warranted. Transcribe the assessment onto the prescribed statutory forms, which remain the definitive legal record.</p>`
    : `<p>The documentation for this assessment is <strong>incomplete</strong>: one or more required signatories, criteria, or evidence fields are outstanding, so it cannot yet support a lawful application. Complete the items flagged below. This tool documents and validates the assessment; it makes no automated detention decision.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Mental Health Act Assessment — Validation Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${completenessStatusClass(completenessStatus)}">
        <div>
          <span class="risk-banner-label">Legal-completeness status</span>
          <span class="risk-banner-value">${esc(completenessStatusLabel(completenessStatus))}</span>
        </div>
        <span class="risk-badge ${urgencyClass(urgency)}">${esc(urgencyLabel(urgency))}</span>
      </div>

      <p><strong>Recommended section:</strong> ${esc(sectionClassLabel(recommendedSectionClass))}</p>
      <p><strong>Outcome:</strong> ${esc(outcomeLabel(state.recommendation.outcome) || 'Not recorded')}</p>

      <h3>Recommended action</h3>
      ${guidance}

      <h3>Required signatories</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Required signatory</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>${signatoryRows}</tbody>
      </table>

      <h3>Statutory criteria</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Criterion</th>
            <th scope="col">Status</th>
            <th scope="col">Evidence</th>
          </tr>
        </thead>
        <tbody>${criteriaRows}</tbody>
      </table>

      <h3>Flagged issues (${flaggedIssues.length})</h3>
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
  const grade = gradeMentalHealthActAssessment(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    completenessStatus: grade.completenessStatus,
    recommendedSectionClass: grade.recommendedSectionClass,
    urgencyClass: grade.urgencyClass,
    requiredSignatories: grade.requiredSignatories,
    criteriaSummary: grade.criteriaSummary,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh assessment?')) return;
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

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',          title: 'Context' },
  { step: 2, section: 'identification',   title: 'Identification' },
  { step: 3, section: 'professionals',    title: 'Professionals' },
  { step: 4, section: 'mentalDisorder',   title: 'Mental disorder' },
  { step: 5, section: 'risk',             title: 'Risk' },
  { step: 6, section: 'leastRestrictive', title: 'Least-restrictive' },
  { step: 7, section: 'treatment',        title: 'Treatment' },
  { step: 8, section: 'nearestRelative',  title: 'Nearest relative' },
  { step: 9, section: 'recommendation',   title: 'Recommendation' },
  { step: 10, section: 'summary',         title: 'Summary' }
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
  host.appendChild(renderStep10());
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
