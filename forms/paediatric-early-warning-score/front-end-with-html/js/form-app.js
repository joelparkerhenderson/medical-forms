import { detectFlaggedIssues } from './flags.js';
import { gradePews } from './grader.js';
import { AGE_BAND_TABLE } from './rules.js';
import { ageBandLabel, capillaryRefillLabel, consciousnessLabel, emptyAssessment, escalationBandClass, escalationBandLabel, priorityLabel, respiratoryEffortLabel, supplementalOxygenLabel, yesNoLabel } from './types.js';

// Paediatric Early Warning Score (PEWS) — bedside wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// aggregate PEWS total (with per-parameter subscore pills and escalation band)
// updates as each observation is entered. The age band is selected first and
// drives the normal ranges for the respiratory-rate and heart-rate parameters,
// so those subscores change when the age band changes. Submission runs the pure
// scoring engine (per-parameter subscores, aggregate 0-21, single-parameter and
// concern override triggers, escalation band, monitoring frequency, escalation
// response, and safety flags) and renders an inline report. State is persisted
// to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'paediatric-early-warning-score.front-end-with-html.v1';

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

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'paediatric-early-warning-score',
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

const TOTAL_STEPS = 7;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-score readout after each change.
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

/** Human-readable age-band normal range for a rate parameter, or '' when unset. */
function normalRangeText(parameter) {
  const band = state.identification.ageBand;
  if (!band || !AGE_BAND_TABLE[band]) return '';
  const table = AGE_BAND_TABLE[band][parameter];
  // The score-0 span is the pair whose score is 0: its lower bound is the
  // previous pair's upper bound + 1, and its upper bound is this pair's bound.
  let lo = 0;
  for (let i = 0; i < table.length; i++) {
    const [upper, score] = table[i];
    if (score === 0) {
      const hi = upper;
      return `${lo}–${hi}`;
    }
    lo = upper + 1;
  }
  return '';
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
  if (opts.required) attrs.push('required', 'data-required');
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
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
// Section renderers (1 per PEWS step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is recording the observations, when, and where.'
  });

  card.appendChild(textInput({
    label: 'Assessing clinician name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. Nurse J. Okafor'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'nurse', label: 'Nurse' },
      { value: 'healthcare-assistant', label: 'Healthcare assistant' },
      { value: 'doctor', label: 'Doctor' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of observation',
    section: 'context', field: 'observationAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'careSetting',
    options: [
      { value: 'ward', label: 'Paediatric ward' },
      { value: 'childrens-assessment-unit', label: "Children's assessment unit" },
      { value: 'emergency-department', label: 'Emergency department' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification and age band',
    description: 'Identify the child and select the age band FIRST — it sets the normal ranges for the respiratory-rate and heart-rate parameters.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. NHS 485 777 3456 or MRN-100517'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    hint: 'Selected first: sets the age-band normal respiratory-rate and heart-rate ranges. A rate normal for a neonate is dangerously abnormal for a teenager.',
    options: [
      { value: 'neonate', label: 'Neonate — 0 to <1 month (RR 40–60, HR 110–160)' },
      { value: 'infant', label: 'Infant — 1 to 11 months (RR 30–50, HR 100–160)' },
      { value: 'young-child', label: 'Young child — 1 to 4 years (RR 20–40, HR 90–140)' },
      { value: 'child', label: 'Child — 5 to 11 years (RR 18–30, HR 70–120)' },
      { value: 'adolescent', label: 'Adolescent — ≥ 12 years (RR 12–20, HR 60–100)' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'identification', field: 'sex',
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Respiratory',
    description: 'Respiratory rate (scored against the age band), effort / recession, SpO₂, and supplemental oxygen. Each parameter scores 0–3.'
  });

  card.appendChild(textInput({
    label: 'Respiratory rate',
    section: 'respiratory', field: 'respiratoryRate',
    type: 'number', min: 0, max: 120, step: 1, unit: 'breaths/min',
    hint: 'Scored against the age-band normal range selected in Step 2.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Respiratory-rate subscore',
    id: 'rr-score-readout',
    render: () => renderRateReadout('respiratoryRate')
  }));

  card.appendChild(radioGroup({
    label: 'Respiratory effort / recession',
    section: 'respiratory', field: 'respiratoryEffort',
    options: [
      { value: 'none', label: 'None (0)' },
      { value: 'mild', label: 'Mild recession (1)' },
      { value: 'moderate', label: 'Moderate recession (2)' },
      { value: 'severe', label: 'Severe recession / grunting (3)' }
    ]
  }));
  card.appendChild(readOnlyReadout({
    label: 'Respiratory-effort subscore',
    id: 'effort-score-readout',
    render: () => renderSubscoreReadout('respiratoryEffort')
  }));

  card.appendChild(textInput({
    label: 'Oxygen saturation (SpO₂)',
    section: 'respiratory', field: 'oxygenSaturation',
    type: 'number', min: 50, max: 100, step: 1, unit: '%',
    hint: '≥ 96% scores 0, 94–95% scores 1, 92–93% scores 2, < 92% scores 3.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'SpO₂ subscore',
    id: 'spo2-score-readout',
    render: () => renderSubscoreReadout('oxygenSaturation')
  }));

  card.appendChild(radioGroup({
    label: 'Supplemental oxygen',
    section: 'respiratory', field: 'supplementalOxygen',
    options: [
      { value: 'room-air', label: 'Room air (0)' },
      { value: 'low-flow', label: 'Any low-flow oxygen (1)' },
      { value: 'high-flow', label: 'High-flow / FiO₂ ≥ 0.5 (3)' }
    ]
  }));
  card.appendChild(readOnlyReadout({
    label: 'Supplemental-oxygen subscore',
    id: 'oxygen-score-readout',
    render: () => renderSubscoreReadout('supplementalOxygen')
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Cardiovascular',
    description: 'Heart rate (scored against the age band) and capillary refill / colour. Each parameter scores 0–3.'
  });

  card.appendChild(textInput({
    label: 'Heart rate',
    section: 'cardiovascular', field: 'heartRate',
    type: 'number', min: 0, max: 260, step: 1, unit: 'beats/min',
    hint: 'Scored against the age-band normal range selected in Step 2.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Heart-rate subscore',
    id: 'hr-score-readout',
    render: () => renderRateReadout('heartRate')
  }));

  card.appendChild(radioGroup({
    label: 'Capillary refill / colour',
    section: 'cardiovascular', field: 'capillaryRefill',
    options: [
      { value: 'under-2s', label: '< 2 s, pink (0)' },
      { value: '2-3s', label: '2–3 s (1)' },
      { value: '3-4s', label: '3–4 s, pale (2)' },
      { value: 'over-4s', label: '> 4 s, mottled / cyanosed (3)' }
    ]
  }));
  card.appendChild(readOnlyReadout({
    label: 'Capillary-refill subscore',
    id: 'cap-refill-score-readout',
    render: () => renderSubscoreReadout('capillaryRefill')
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Behaviour / neurological',
    description: 'Consciousness on the ACVPU scale. Alert / playing scores 0; increasing depression scores up to 3.'
  });

  card.appendChild(radioGroup({
    label: 'Consciousness (ACVPU)',
    section: 'behaviour', field: 'consciousness',
    options: [
      { value: 'alert', label: 'Alert / playing (0)' },
      { value: 'voice', label: 'Responds to Voice / irritable (1)' },
      { value: 'pain', label: 'Responds to Pain (2)' },
      { value: 'unresponsive', label: 'Unresponsive (3)' }
    ]
  }));
  card.appendChild(readOnlyReadout({
    label: 'Consciousness subscore',
    id: 'consciousness-score-readout',
    render: () => renderSubscoreReadout('consciousness')
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Concern',
    description: 'Documented nurse / staff and parent / carer concern. Each is an independent escalation trigger in its own right, regardless of the aggregate total.'
  });

  card.appendChild(radioGroup({
    label: 'Is there documented nurse / staff concern?',
    section: 'concern', field: 'nurseConcern', options: yesNo,
    hint: 'Documented concern by any member of staff is an escalation trigger regardless of the score.'
  }));
  card.appendChild(radioGroup({
    label: 'Is there documented parent / carer concern?',
    section: 'concern', field: 'parentConcern', options: yesNo,
    hint: 'Documented family concern is a recognised predictor of deterioration; it must be recorded and acted upon.'
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Summary and score',
    description: 'Live aggregate PEWS total, escalation band, and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live PEWS aggregate',
    id: 'live-score-readout',
    render: () => renderLiveScore()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNotes',
    placeholder: 'Free-text clinical note: context, decisions, and any escalation already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the subscore pill for a single (age-independent) parameter. */
function renderSubscoreReadout(key) {
  const grade = gradePews(state);
  const point = grade.subscores[key];
  if (point === null || point === undefined) {
    return `<strong class="muted">—</strong> <span class="muted">(not recorded)</span>`;
  }
  const cls = point >= 3 ? 'flag-high' : (point >= 1 ? 'flag-medium' : 'ok');
  const note = point === 0 ? '(normal)' : (point === 3 ? '(critical — single-parameter trigger)' : '(raised)');
  return `<strong class="${cls}">${point} point${point === 1 ? '' : 's'}</strong> <span class="muted">${note}</span>`;
}

/** Render the subscore pill for a rate parameter, with the age-band normal range. */
function renderRateReadout(key) {
  const band = state.identification.ageBand;
  if (!band) {
    return `<strong class="muted">—</strong> <span class="muted">(select an age band in Step 2 first)</span>`;
  }
  const parameter = key === 'respiratoryRate' ? 'respiratoryRate' : 'heartRate';
  const range = normalRangeText(parameter);
  const grade = gradePews(state);
  const point = grade.subscores[key];
  if (point === null || point === undefined) {
    return `<strong class="muted">—</strong> <span class="muted">(not recorded; ${esc(ageBandLabel(band))} normal ${esc(range)})</span>`;
  }
  const cls = point >= 3 ? 'flag-high' : (point >= 1 ? 'flag-medium' : 'ok');
  const note = point === 0 ? `(within ${esc(range)} normal)` : (point === 3 ? '(critical — single-parameter trigger)' : `(outside ${esc(range)} normal)`);
  return `<strong class="${cls}">${point} point${point === 1 ? '' : 's'}</strong> <span class="muted">${note}</span>`;
}

/** Render the live aggregate PEWS total and escalation band. */
function renderLiveScore() {
  const grade = gradePews(state);
  const badge =
    `<span class="risk-badge ${escalationBandClass(grade.escalationBand)}">${esc(escalationBandLabel(grade.escalationBand))}</span>`;
  const single = grade.singleParameterTrigger
    ? ` <span class="flag-priority flag-high">SINGLE-PARAMETER 3</span>`
    : '';
  const concern = (state.concern.nurseConcern === 'yes' || state.concern.parentConcern === 'yes')
    ? ` <span class="flag-priority flag-high">CONCERN TRIGGER</span>`
    : '';
  return `<strong>${grade.aggregateScore}</strong> aggregate ${badge}${single}${concern}` +
    `<br><span class="muted">${esc(grade.monitoringFrequency)}</span>`;
}

function refreshLiveScore() {
  const map = {
    'rr-score-readout': ['rate', 'respiratoryRate'],
    'effort-score-readout': ['sub', 'respiratoryEffort'],
    'spo2-score-readout': ['sub', 'oxygenSaturation'],
    'oxygen-score-readout': ['sub', 'supplementalOxygen'],
    'hr-score-readout': ['rate', 'heartRate'],
    'cap-refill-score-readout': ['sub', 'capillaryRefill'],
    'consciousness-score-readout': ['sub', 'consciousness']
  };
  for (const [id, [kind, key]] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = kind === 'rate' ? renderRateReadout(key) : renderSubscoreReadout(key);
  }
  const live = document.getElementById('live-score-readout');
  if (live) live.innerHTML = renderLiveScore();
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
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered.
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['careSetting']],
  identification: [['patientIdentifier'], ['ageBand'], ['sex']],
  respiratory: [['respiratoryRate'], ['respiratoryEffort'], ['oxygenSaturation'], ['supplementalOxygen']],
  cardiovascular: [['heartRate'], ['capillaryRefill']],
  behaviour: [['consciousness']],
  concern: [['nurseConcern'], ['parentConcern']],
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    subscores, aggregateScore, maxParameterScore, singleParameterTrigger,
    escalationBand, monitoringFrequency, recommendation, complete,
    firedTriggers, flaggedIssues, timestamp
  } = lastResult;

  const s = state;
  const fmt = (v, unit) => (v === null || v === '' || v === undefined)
    ? 'Not recorded' : `${v}${unit ? ' ' + unit : ''}`;
  const pill = (p) => p === null || p === undefined
    ? '<span class="grade-pill">—</span>'
    : `<span class="grade-pill">${p} point${p === 1 ? '' : 's'}</span>`;

  const rrValue = s.respiratory.respiratoryRate === null
    ? 'Not recorded'
    : `${s.respiratory.respiratoryRate} breaths/min${normalRangeText('respiratoryRate') ? ` (normal ${normalRangeText('respiratoryRate')})` : ''}`;
  const hrValue = s.cardiovascular.heartRate === null
    ? 'Not recorded'
    : `${s.cardiovascular.heartRate} beats/min${normalRangeText('heartRate') ? ` (normal ${normalRangeText('heartRate')})` : ''}`;

  const paramRows = [
    ['Respiratory rate', rrValue, subscores.respiratoryRate],
    ['Respiratory effort / recession', respiratoryEffortLabel(s.respiratory.respiratoryEffort) || 'Not recorded', subscores.respiratoryEffort],
    ['Oxygen saturation (SpO₂)', fmt(s.respiratory.oxygenSaturation, '%'), subscores.oxygenSaturation],
    ['Supplemental oxygen', supplementalOxygenLabel(s.respiratory.supplementalOxygen) || 'Not recorded', subscores.supplementalOxygen],
    ['Heart rate', hrValue, subscores.heartRate],
    ['Capillary refill / colour', capillaryRefillLabel(s.cardiovascular.capillaryRefill) || 'Not recorded', subscores.capillaryRefill],
    ['Consciousness (ACVPU)', consciousnessLabel(s.behaviour.consciousness) || 'Not recorded', subscores.consciousness]
  ].map(([name, value, point]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
      <td class="num">${pill(point)}</td>
    </tr>
  `).join('');

  const triggersList = firedTriggers.length === 0
    ? `<p class="muted">No override triggers fired.</p>`
    : `
      <ul class="flags">
        ${firedTriggers.map((t) => `
          <li class="flag-high">
            <span class="flag-priority">TRIGGER</span>
            <span class="flag-category">${esc(t.category)}</span>
            <span class="flag-message">${esc(t.description)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No safety flags raised.</p>`
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

  const ageBandNote = s.identification.ageBand
    ? `<p class="muted">Age band: ${esc(ageBandLabel(s.identification.ageBand))} — sets the respiratory-rate and heart-rate normal ranges.</p>`
    : `<p class="muted">No age band selected; the rate parameters could not be scored and contribute 0.</p>`;

  const incompleteNote = complete
    ? ''
    : `<p class="muted">One or more parameters (or the age band) have not been recorded; the aggregate may understate risk until the observation set is complete.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>PEWS Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${escalationBandClass(escalationBand)}">
        <div>
          <span class="risk-banner-label">Aggregate PEWS</span>
          <span class="risk-banner-value">${aggregateScore}${singleParameterTrigger ? ' · single-parameter 3' : ''}</span>
        </div>
        <span class="risk-badge ${escalationBandClass(escalationBand)}">${esc(escalationBandLabel(escalationBand))}</span>
      </div>

      ${ageBandNote}

      <h3>Parameters</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Parameter</th>
            <th scope="col">Value</th>
            <th scope="col">Subscore</th>
          </tr>
        </thead>
        <tbody>${paramRows}</tbody>
        <tfoot>
          <tr>
            <th scope="row">Aggregate (max single-parameter ${maxParameterScore})</th>
            <td></td>
            <td class="num"><span class="grade-pill">${aggregateScore}</span></td>
          </tr>
        </tfoot>
      </table>

      <h3>Override triggers (${firedTriggers.length})</h3>
      ${triggersList}

      <h3>Monitoring and response</h3>
      <p><strong>Minimum monitoring:</strong> ${esc(monitoringFrequency)}</p>
      <p>${esc(recommendation)}</p>
      ${incompleteNote}

      <h3>Safety flags (${flaggedIssues.length})</h3>
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
  const grade = gradePews(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    subscores: grade.subscores,
    aggregateScore: grade.aggregateScore,
    maxParameterScore: grade.maxParameterScore,
    singleParameterTrigger: grade.singleParameterTrigger,
    escalationBand: grade.escalationBand,
    monitoringFrequency: grade.monitoringFrequency,
    recommendation: grade.recommendation,
    complete: grade.complete,
    firedRules: grade.firedRules,
    firedTriggers: grade.firedTriggers,
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
  { step: 2, section: 'identification', title: 'Patient / age band' },
  { step: 3, section: 'respiratory',    title: 'Respiratory' },
  { step: 4, section: 'cardiovascular', title: 'Cardiovascular' },
  { step: 5, section: 'behaviour',      title: 'Behaviour' },
  { step: 6, section: 'concern',        title: 'Concern' },
  { step: 7, section: 'note',           title: 'Summary' }
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
  host.appendChild(renderStep7());
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
