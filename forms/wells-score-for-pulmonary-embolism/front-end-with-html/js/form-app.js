import { detectFlaggedIssues } from './flags.js';
import { calculateWellsGrade } from './grader.js';
import { bandClass, emptyAssessment, haemodynamicStatusLabel, priorityLabel, recommendedPathwayLabel, threeLevelBandLabel, twoLevelBandLabel, yesNoLabel } from './types.js';

// Wells Score for Pulmonary Embolism (PE) — single-page wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live Wells
// score updates as the criteria are entered. Submission runs the pure scoring
// engine (weighted per-criterion points, total 0..12.5, two-level and
// three-level bands, recommended pathway, flagged issues) and renders an inline
// report. State is persisted to localStorage so a partial fill survives a page
// reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'wells-score-for-pulmonary-embolism.front-end-with-html.v1';

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
  slug: 'wells-score-for-pulmonary-embolism',
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
    refreshLiveScore();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 6;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-score readouts after each change.
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
  refreshLiveScore();
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
  if (opts.min !== undefined) attrs.push(`min="${esc(opts.min)}"`);
  if (opts.max !== undefined) attrs.push(`max="${esc(opts.max)}"`);
  if (opts.step !== undefined) attrs.push(`step="${esc(opts.step)}"`);
  if (opts.inputmode) attrs.push(`inputmode="${esc(opts.inputmode)}"`);
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
    if (opts.numeric) {
      const raw = input.value.trim();
      const num = raw === '' ? null : Number(raw);
      setField(opts.section, opts.field, (num === null || Number.isNaN(num)) ? null : num);
    } else {
      setField(opts.section, opts.field, input.value);
    }
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
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
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
// Section renderers (1 per Wells PE step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, and where.'
  });

  card.appendChild(textInput({
    label: 'Assessing clinician name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. Dr A. Khan'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'doctor', label: 'Doctor' },
      { value: 'nurse-practitioner', label: 'Nurse practitioner' },
      { value: 'physician-associate', label: 'Physician associate' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of assessment',
    section: 'context', field: 'assessedAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'careSetting', required: true,
    options: [
      { value: 'emergency-department', label: 'Emergency department' },
      { value: 'acute-medical-unit', label: 'Acute medical unit' },
      { value: 'ambulatory', label: 'Ambulatory / same-day emergency care' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age band, and sex. Wells PE is for adults (>= 16 years) with suspected acute PE.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. ED-311204 or hospital MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    options: [
      { value: '18-39', label: '18-39' },
      { value: '40-64', label: '40-64' },
      { value: '65-74', label: '65-74' },
      { value: '75-84', label: '75-84' },
      { value: '85-plus', label: '85 and over' }
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
    title: 'Haemodynamic status',
    description: 'Establish stability first. A haemodynamically unstable patient may have massive PE — resuscitate and image immediately rather than waiting on scoring.'
  });

  card.appendChild(selectInput({
    label: 'Haemodynamic status',
    section: 'haemodynamic', field: 'haemodynamicStatus', required: true,
    hint: 'Unstable = sustained hypotension, shock, or peri-arrest.',
    options: [
      { value: 'stable', label: 'Stable' },
      { value: 'unstable', label: 'Unstable' }
    ]
  }));

  card.appendChild(readOnlyReadout({
    label: 'Stability',
    id: 'haemodynamic-readout',
    render: () => renderHaemodynamicReadout()
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Clinical criteria',
    description: 'Six weighted criteria. DVT signs and PE most likely score +3; immobilisation/surgery and previous DVT/PE score +1.5; haemoptysis and malignancy score +1.'
  });

  card.appendChild(radioGroup({
    label: 'Clinical signs and symptoms of DVT (leg swelling and pain on palpation of the deep veins)?',
    section: 'criteria', field: 'dvtSigns', options: yesNo,
    hint: 'Criterion 1 (+3 points).'
  }));
  card.appendChild(radioGroup({
    label: 'Is PE the number-one diagnosis, or equally likely?',
    section: 'criteria', field: 'peMostLikely', options: yesNo,
    hint: 'Criterion 2 (+3 points) — clinical gestalt.'
  }));
  card.appendChild(radioGroup({
    label: 'Immobilisation for at least 3 days, or surgery in the previous 4 weeks?',
    section: 'criteria', field: 'immobilisationSurgery', options: yesNo,
    hint: 'Criterion 4 (+1.5 points).'
  }));
  card.appendChild(radioGroup({
    label: 'Previous, objectively diagnosed DVT or PE?',
    section: 'criteria', field: 'previousDvtPe', options: yesNo,
    hint: 'Criterion 5 (+1.5 points).'
  }));
  card.appendChild(radioGroup({
    label: 'Haemoptysis?',
    section: 'criteria', field: 'haemoptysis', options: yesNo,
    hint: 'Criterion 6 (+1 point).'
  }));
  card.appendChild(radioGroup({
    label: 'Malignancy (on treatment, treated within the last 6 months, or palliative)?',
    section: 'criteria', field: 'malignancy', options: yesNo,
    hint: 'Criterion 7 (+1 point).'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Clinical criteria subtotal',
    id: 'criteria-subtotal-readout',
    render: () => renderCriteriaSubtotal()
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Observations',
    description: 'Measured heart rate. Criterion 3 (+1.5 points) fires when the heart rate is greater than 100 beats per minute.'
  });

  card.appendChild(textInput({
    label: 'Heart rate (beats/min)',
    section: 'observations', field: 'heartRate', type: 'number',
    numeric: true, min: 0, max: 300, step: 1, inputmode: 'numeric',
    placeholder: 'e.g. 104',
    hint: 'Criterion 3 (+1.5 points) when > 100.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Tachycardia criterion',
    id: 'heart-rate-readout',
    render: () => renderHeartRateReadout()
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Summary and score',
    description: 'Live Wells total, band, recommended pathway, and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live Wells score',
    id: 'live-score-readout',
    render: () => renderLiveScore()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNotes',
    placeholder: 'Free-text clinical note: context, decisions, and any imaging, D-dimer, or interim anticoagulation already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

// The six yes/no criteria and their weights (heart rate is handled separately).
const ENUM_CRITERIA = [
  ['dvtSigns', 3],
  ['peMostLikely', 3],
  ['immobilisationSurgery', 1.5],
  ['previousDvtPe', 1.5],
  ['haemoptysis', 1],
  ['malignancy', 1]
];

/** Render the running weighted subtotal for the six yes/no criteria. */
function renderCriteriaSubtotal() {
  let points = 0;
  let positive = 0;
  for (const [field, weight] of ENUM_CRITERIA) {
    if (state.criteria[field] === 'yes') {
      points += weight;
      positive++;
    }
  }
  const cls = points > 0 ? 'warn' : 'ok';
  return `<strong class="${cls}">+${points}</strong> <span class="muted">of ${ENUM_CRITERIA.length} yes/no criteria positive (${positive})</span>`;
}

/** Render the heart-rate (criterion 3) contribution readout. */
function renderHeartRateReadout() {
  const hr = state.observations.heartRate;
  if (hr === null || hr === undefined) {
    return `<strong class="ok">0</strong> <span class="muted">heart rate not recorded</span>`;
  }
  const fires = hr > 100;
  const cls = fires ? 'warn' : 'ok';
  const pts = fires ? '+1.5' : '0';
  return `<strong class="${cls}">${pts}</strong> <span class="muted">heart rate ${esc(hr)} bpm ${fires ? '> 100' : '<= 100'}</span>`;
}

/** Render the haemodynamic-stability readout. */
function renderHaemodynamicReadout() {
  const status = state.haemodynamic.haemodynamicStatus;
  if (status === 'unstable') {
    return `<strong class="warn">Unstable</strong> <span class="muted">suspected massive PE — resuscitate and image immediately; do not wait on scoring</span>`;
  }
  if (status === 'stable') {
    return `<strong class="ok">Stable</strong> <span class="muted">proceed with Wells scoring</span>`;
  }
  return `<span class="muted">Not recorded</span>`;
}

/** Render the live overall Wells score, bands, and recommended pathway. */
function renderLiveScore() {
  const grade = calculateWellsGrade(state);
  const twoBadge =
    `<span class="risk-badge ${bandClass(grade.twoLevelBand)}">${esc(twoLevelBandLabel(grade.twoLevelBand))}</span>`;
  const threeBadge =
    `<span class="risk-badge ${bandClass(grade.threeLevelBand)}">${esc(threeLevelBandLabel(grade.threeLevelBand))}</span>`;
  return `<strong>${grade.wellsScore}</strong> <span class="muted">(range 0 to 12.5)</span> ${twoBadge} ${threeBadge}` +
    `<div class="muted">Recommended next step: ${esc(recommendedPathwayLabel(grade.recommendedPathway))}</div>`;
}

function refreshLiveScore() {
  const haemo = document.getElementById('haemodynamic-readout');
  if (haemo) haemo.innerHTML = renderHaemodynamicReadout();
  const crit = document.getElementById('criteria-subtotal-readout');
  if (crit) crit.innerHTML = renderCriteriaSubtotal();
  const hr = document.getElementById('heart-rate-readout');
  if (hr) hr.innerHTML = renderHeartRateReadout();
  const live = document.getElementById('live-score-readout');
  if (live) live.innerHTML = renderLiveScore();
}

// ----------------------------------------------------------------------
// Conditional sections (none currently, but kept for parity + future use)
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

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered.
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['careSetting']],
  identification: [['patientIdentifier'], ['ageBand'], ['sex']],
  haemodynamic: [['haemodynamicStatus']],
  criteria: [
    ['dvtSigns'],
    ['peMostLikely'],
    ['immobilisationSurgery'],
    ['previousDvtPe'],
    ['haemoptysis'],
    ['malignancy']
  ],
  observations: [['heartRate']],
  note: [['clinicalNotes']]
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

// Criterion rows for the report table.
const REPORT_CRITERIA = [
  {
    name: '1 — Clinical signs of DVT',
    weight: 3,
    positive: (s) => s.criteria.dvtSigns === 'yes',
    answer: (s) => yesNoLabel(s.criteria.dvtSigns)
  },
  {
    name: '2 — PE is the most likely diagnosis',
    weight: 3,
    positive: (s) => s.criteria.peMostLikely === 'yes',
    answer: (s) => yesNoLabel(s.criteria.peMostLikely)
  },
  {
    name: '3 — Heart rate > 100 bpm',
    weight: 1.5,
    positive: (s) => typeof s.observations.heartRate === 'number' && s.observations.heartRate > 100,
    answer: (s) => (s.observations.heartRate === null || s.observations.heartRate === undefined)
      ? 'Not recorded'
      : `${s.observations.heartRate} bpm`
  },
  {
    name: '4 — Immobilisation >= 3 days or surgery <= 4 weeks',
    weight: 1.5,
    positive: (s) => s.criteria.immobilisationSurgery === 'yes',
    answer: (s) => yesNoLabel(s.criteria.immobilisationSurgery)
  },
  {
    name: '5 — Previous DVT or PE',
    weight: 1.5,
    positive: (s) => s.criteria.previousDvtPe === 'yes',
    answer: (s) => yesNoLabel(s.criteria.previousDvtPe)
  },
  {
    name: '6 — Haemoptysis',
    weight: 1,
    positive: (s) => s.criteria.haemoptysis === 'yes',
    answer: (s) => yesNoLabel(s.criteria.haemoptysis)
  },
  {
    name: '7 — Malignancy',
    weight: 1,
    positive: (s) => s.criteria.malignancy === 'yes',
    answer: (s) => yesNoLabel(s.criteria.malignancy)
  }
];

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    wellsScore, twoLevelBand, threeLevelBand, recommendedPathway,
    flaggedIssues, timestamp
  } = lastResult;

  const criteriaRows = REPORT_CRITERIA.map((c) => {
    const positive = c.positive(state);
    const point = positive ? c.weight : 0;
    const pointText = point === 0 ? '0' : `+${point}`;
    return `
      <tr>
        <th scope="row">${esc(c.name)}</th>
        <td>${esc(c.answer(state))}</td>
        <td class="num"><span class="grade-pill">${pointText}</span></td>
      </tr>
    `;
  }).join('');

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No red-flag issues raised.</p>`
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

  const pathway = twoLevelBand === 'likely'
    ? `<p><strong>PE likely (Wells > 4).</strong> Arrange an immediate <strong>CT pulmonary angiogram (CTPA)</strong>. Give interim anticoagulation if imaging is delayed. If the CTPA is negative, consider a proximal-leg vein ultrasound.</p>`
    : `<p><strong>PE unlikely (Wells <= 4).</strong> Arrange a <strong>D-dimer</strong> test. If positive, arrange CTPA; if negative, consider an alternative diagnosis and, where gestalt probability is low, apply the PERC rule to support ruling PE out without D-dimer.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Wells PE Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${bandClass(twoLevelBand)}">
        <div>
          <span class="risk-banner-label">Wells score</span>
          <span class="risk-banner-value">${wellsScore} <span class="muted">(range 0 to 12.5)</span></span>
        </div>
        <span class="risk-badge ${bandClass(twoLevelBand)}">${esc(twoLevelBandLabel(twoLevelBand))}</span>
      </div>

      <h3>Bands</h3>
      <p>
        Two-level (NICE NG158): <span class="risk-badge ${bandClass(twoLevelBand)}">${esc(twoLevelBandLabel(twoLevelBand))}</span>
        &nbsp;·&nbsp;
        Three-level (original Wells): <span class="risk-badge ${bandClass(threeLevelBand)}">${esc(threeLevelBandLabel(threeLevelBand))}</span>
      </p>
      <p>Recommended next step: <strong>${esc(recommendedPathwayLabel(recommendedPathway))}</strong></p>

      <h3>Criteria</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Criterion</th>
            <th scope="col">Answer</th>
            <th scope="col">Points</th>
          </tr>
        </thead>
        <tbody>${criteriaRows}</tbody>
      </table>

      <h3>Recommended pathway</h3>
      ${pathway}

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
  const grade = calculateWellsGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade.wellsScore);
  lastResult = {
    criterionPoints: grade.criterionPoints,
    dvtSignsPoints: grade.dvtSignsPoints,
    peMostLikelyPoints: grade.peMostLikelyPoints,
    heartRatePoints: grade.heartRatePoints,
    immobilisationSurgeryPoints: grade.immobilisationSurgeryPoints,
    previousDvtPePoints: grade.previousDvtPePoints,
    haemoptysisPoints: grade.haemoptysisPoints,
    malignancyPoints: grade.malignancyPoints,
    wellsScore: grade.wellsScore,
    twoLevelBand: grade.twoLevelBand,
    threeLevelBand: grade.threeLevelBand,
    recommendedPathway: grade.recommendedPathway,
    firedCriteria: grade.firedCriteria,
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
  refreshLiveScore();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'identification', title: 'Patient' },
  { step: 3, section: 'haemodynamic',   title: 'Stability' },
  { step: 4, section: 'criteria',       title: 'Criteria' },
  { step: 5, section: 'observations',   title: 'Observations' },
  { step: 6, section: 'note',           title: 'Summary' }
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveScore();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
