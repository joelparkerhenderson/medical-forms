import { detectFlaggedIssues } from './flags.js';
import { gradeNews2 } from './grader.js';
import { acvpuLabel, emptyAssessment, priorityLabel, riskBandClass, riskBandLabel } from './types.js';

// National Early Warning Score 2 (NEWS2) — bedside wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// aggregate NEWS2 total (with per-parameter subscore pills and risk band)
// updates as each observation is entered. Submission runs the pure scoring
// engine (per-parameter subscores, aggregate 0-20+, red-score rule, risk band,
// monitoring frequency, escalation response, and safety flags) and renders an
// inline report. State is persisted to localStorage so a partial fill survives
// a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'national-early-warning-score-2.front-end-with-html.v1';

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
  slug: 'national-early-warning-score-2',
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

const TOTAL_STEPS = 10;

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

/** Append a `data-conditional` wrapper whose visibility depends on state. */
function conditionalBlock(expr, children) {
  const host = document.createElement('div');
  host.setAttribute('data-conditional', expr);
  for (const c of children) host.appendChild(c);
  return host;
}

// ----------------------------------------------------------------------
// Section renderers (1 per NEWS2 step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is recording the observations, when and where, and which SpO₂ scale is in use.'
  });

  card.appendChild(textInput({
    label: 'Recording clinician name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. Nurse J. Okafor'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'doctor', label: 'Doctor' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'healthcare-assistant', label: 'Healthcare assistant' },
      { value: 'paramedic', label: 'Paramedic' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of observation',
    section: 'context', field: 'observationAt', type: 'datetime-local'
  }));
  card.appendChild(textInput({
    label: 'Ward or location',
    section: 'context', field: 'wardOrLocation',
    placeholder: 'e.g. Acute Medical Unit, Bay 3'
  }));
  card.appendChild(selectInput({
    label: 'SpO₂ scale in use',
    section: 'context', field: 'spo2Scale', required: true,
    hint: 'Scale 2 is only for a prescribed 88–92% target (e.g. hypercapnic respiratory failure) and must be endorsed by a competent clinician.',
    options: [
      { value: 'scale-1', label: 'Scale 1 — default target (≥ 96%)' },
      { value: 'scale-2', label: 'Scale 2 — target 88–92%' }
    ]
  }));
  card.appendChild(conditionalBlock('context.spo2Scale=scale-2', [
    radioGroup({
      label: 'Has a competent clinician endorsed Scale 2 for this patient?',
      section: 'context', field: 'spo2Scale2Endorsed', options: yesNo
    })
  ]));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Identify the patient and confirm NEWS2 is in scope. NEWS2 is validated for acutely ill adults (≥ 16 years).'
  });

  card.appendChild(textInput({
    label: 'Patient name',
    section: 'identification', field: 'patientName', required: true,
    placeholder: 'e.g. Grace Osei'
  }));
  card.appendChild(textInput({
    label: 'NHS number or hospital MRN',
    section: 'identification', field: 'nhsNumber',
    placeholder: 'e.g. 485 777 3456'
  }));
  card.appendChild(textInput({
    label: 'Date of birth',
    section: 'identification', field: 'birthDate', type: 'date'
  }));
  card.appendChild(radioGroup({
    label: 'Is the patient under 16 years old?',
    section: 'identification', field: 'isUnder16', options: yesNo,
    hint: 'NEWS2 is not validated in children; use a paediatric early-warning system.'
  }));
  card.appendChild(radioGroup({
    label: 'Is the patient pregnant?',
    section: 'identification', field: 'isPregnant', options: yesNo,
    hint: 'Use a maternity early-warning system for pregnant patients.'
  }));
  card.appendChild(radioGroup({
    label: 'Does the patient have a spinal-cord injury?',
    section: 'identification', field: 'hasSpinalCordInjury', options: yesNo
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Respiration rate',
    description: 'Parameter 1 — breaths per minute. Scores 3 (≤ 8 or ≥ 25), 2 (21–24), 1 (9–11), or 0 (12–20).'
  });

  card.appendChild(textInput({
    label: 'Measured respiration rate',
    section: 'respiration', field: 'respiratoryRate',
    type: 'number', min: 0, max: 80, step: 1, unit: 'breaths/min'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Respiration subscore',
    id: 'rr-score-readout',
    render: () => renderSubscoreReadout('respiratoryRate')
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Oxygen saturation (SpO₂)',
    description: 'Parameter 2 — scored against the SpO₂ scale selected in Step 1. Scale 2 additionally depends on air vs oxygen (Step 5).'
  });

  card.appendChild(textInput({
    label: 'Measured oxygen saturation',
    section: 'oxygenSaturation', field: 'spo2',
    type: 'number', min: 50, max: 100, step: 1, unit: '%'
  }));

  card.appendChild(readOnlyReadout({
    label: 'SpO₂ subscore',
    id: 'spo2-score-readout',
    render: () => renderSubscoreReadout('spo2')
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Air or supplemental oxygen',
    description: 'Parameter 3 — any supplemental oxygen scores 2. Device, flow rate, and FiO₂ are recorded when on oxygen.'
  });

  card.appendChild(radioGroup({
    label: 'Is the patient on air or supplemental oxygen?',
    section: 'oxygenSupport', field: 'onOxygen',
    options: [
      { value: 'air', label: 'Air' },
      { value: 'oxygen', label: 'Supplemental oxygen' }
    ]
  }));

  card.appendChild(conditionalBlock('oxygenSupport.onOxygen=oxygen', [
    selectInput({
      label: 'Oxygen delivery device',
      section: 'oxygenSupport', field: 'oxygenDevice',
      options: [
        { value: 'nasal-cannula', label: 'Nasal cannula' },
        { value: 'simple-face-mask', label: 'Simple face mask' },
        { value: 'venturi-mask', label: 'Venturi mask' },
        { value: 'non-rebreather-mask', label: 'Non-rebreather mask' },
        { value: 'humidified', label: 'Humidified oxygen' },
        { value: 'cpap', label: 'CPAP' },
        { value: 'niv', label: 'Non-invasive ventilation' },
        { value: 'tracheostomy', label: 'Tracheostomy' },
        { value: 'ventilator', label: 'Ventilator' },
        { value: 'other', label: 'Other' }
      ]
    }),
    textInput({
      label: 'Oxygen flow rate',
      section: 'oxygenSupport', field: 'oxygenFlowRateLMin',
      type: 'number', min: 0, max: 60, step: 0.5, unit: 'L/min'
    }),
    textInput({
      label: 'Fraction of inspired oxygen (FiO₂)',
      section: 'oxygenSupport', field: 'inspiredOxygenFractionPercent',
      type: 'number', min: 21, max: 100, step: 1, unit: '%'
    })
  ]));

  card.appendChild(readOnlyReadout({
    label: 'Air-or-oxygen subscore',
    id: 'oxygen-score-readout',
    render: () => renderSubscoreReadout('oxygen')
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Systolic blood pressure',
    description: 'Parameter 4 — mmHg. Scores 3 (≤ 90 or ≥ 220), 2 (91–100), 1 (101–110), or 0 (111–219).'
  });

  card.appendChild(textInput({
    label: 'Systolic blood pressure',
    section: 'bloodPressure', field: 'systolicBloodPressure',
    type: 'number', min: 40, max: 300, step: 1, unit: 'mmHg'
  }));
  card.appendChild(textInput({
    label: 'Diastolic blood pressure (optional, unscored)',
    section: 'bloodPressure', field: 'diastolicBloodPressure',
    type: 'number', min: 20, max: 200, step: 1, unit: 'mmHg'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Blood-pressure subscore',
    id: 'sbp-score-readout',
    render: () => renderSubscoreReadout('systolicBp')
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Pulse',
    description: 'Parameter 5 — beats per minute. Scores 3 (≤ 40 or ≥ 131), 2 (111–130), 1 (41–50 or 91–110), or 0 (51–90).'
  });

  card.appendChild(textInput({
    label: 'Measured pulse rate',
    section: 'pulse', field: 'pulse',
    type: 'number', min: 20, max: 250, step: 1, unit: 'beats/min'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Pulse subscore',
    id: 'pulse-score-readout',
    render: () => renderSubscoreReadout('pulse')
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Consciousness (ACVPU)',
    description: 'Parameter 6 — only "Alert" scores 0; new-onset Confusion, Voice, Pain, and Unresponsive each score 3.'
  });

  card.appendChild(radioGroup({
    label: 'Level of consciousness (ACVPU)',
    section: 'consciousness', field: 'consciousnessAcvpu',
    options: [
      { value: 'A', label: 'Alert' },
      { value: 'C', label: 'New confusion' },
      { value: 'V', label: 'Responds to Voice' },
      { value: 'P', label: 'Responds to Pain' },
      { value: 'U', label: 'Unresponsive' }
    ]
  }));

  card.appendChild(readOnlyReadout({
    label: 'Consciousness subscore',
    id: 'consciousness-score-readout',
    render: () => renderSubscoreReadout('consciousness')
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Temperature',
    description: 'Parameter 7 — degrees Celsius. Scores 3 (≤ 35.0), 2 (≥ 39.1), 1 (35.1–36.0 or 38.1–39.0), or 0 (36.1–38.0).'
  });

  card.appendChild(textInput({
    label: 'Measured temperature',
    section: 'temperature', field: 'temperature',
    type: 'number', min: 25, max: 45, step: 0.1, unit: '°C'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Temperature subscore',
    id: 'temp-score-readout',
    render: () => renderSubscoreReadout('temperature')
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Review and sign-off',
    description: 'Live aggregate NEWS2 total and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live NEWS2 aggregate',
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

/** Render the subscore pill for a single parameter. */
function renderSubscoreReadout(key) {
  const grade = gradeNews2(state);
  const point = grade.subscores[key];
  if (point === null || point === undefined) {
    return `<strong class="muted">—</strong> <span class="muted">(not recorded)</span>`;
  }
  const cls = point >= 3 ? 'flag-high' : (point >= 1 ? 'flag-medium' : 'ok');
  const note = point === 0 ? '(normal)' : (point === 3 ? '(red score)' : '(raised)');
  return `<strong class="${cls}">${point} point${point === 1 ? '' : 's'}</strong> <span class="muted">${note}</span>`;
}

/** Render the live aggregate NEWS2 total and band. */
function renderLiveScore() {
  const grade = gradeNews2(state);
  const badge =
    `<span class="risk-badge ${riskBandClass(grade.riskBand)}">${esc(riskBandLabel(grade.riskBand))}</span>`;
  const red = grade.redScore
    ? ` <span class="flag-priority flag-high">RED SCORE</span>`
    : '';
  return `<strong>${grade.aggregate}</strong> aggregate ${badge}${red}` +
    `<br><span class="muted">${esc(grade.monitoringFrequency)}</span>`;
}

function refreshLiveScore() {
  const map = {
    'rr-score-readout': 'respiratoryRate',
    'spo2-score-readout': 'spo2',
    'oxygen-score-readout': 'oxygen',
    'sbp-score-readout': 'systolicBp',
    'pulse-score-readout': 'pulse',
    'consciousness-score-readout': 'consciousness',
    'temp-score-readout': 'temperature'
  };
  for (const [id, key] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = renderSubscoreReadout(key);
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
  context: [['clinicianName'], ['clinicianRole'], ['spo2Scale']],
  identification: [['patientName'], ['nhsNumber'], ['birthDate']],
  respiration: [['respiratoryRate']],
  oxygenSaturation: [['spo2']],
  oxygenSupport: [['onOxygen']],
  bloodPressure: [['systolicBloodPressure']],
  pulse: [['pulse']],
  consciousness: [['consciousnessAcvpu']],
  temperature: [['temperature']],
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
    subscores, aggregate, redScore, riskBand,
    monitoringFrequency, recommendation, complete,
    flaggedIssues, timestamp
  } = lastResult;

  const s = state;
  const fmt = (v, unit) => (v === null || v === '' || v === undefined)
    ? 'Not recorded' : `${v}${unit ? ' ' + unit : ''}`;
  const pill = (p) => p === null || p === undefined
    ? '<span class="grade-pill">—</span>'
    : `<span class="grade-pill">${p} point${p === 1 ? '' : 's'}</span>`;

  const paramRows = [
    ['Respiration rate', fmt(s.respiration.respiratoryRate, 'breaths/min'), subscores.respiratoryRate],
    ['Oxygen saturation (SpO₂)', fmt(s.oxygenSaturation.spo2, '%'), subscores.spo2],
    ['Air or supplemental oxygen', s.oxygenSupport.onOxygen === 'oxygen' ? 'Supplemental oxygen' : (s.oxygenSupport.onOxygen === 'air' ? 'Air' : 'Not recorded'), subscores.oxygen],
    ['Systolic blood pressure', fmt(s.bloodPressure.systolicBloodPressure, 'mmHg'), subscores.systolicBp],
    ['Pulse', fmt(s.pulse.pulse, 'beats/min'), subscores.pulse],
    ['Consciousness (ACVPU)', acvpuLabel(s.consciousness.consciousnessAcvpu) || 'Not recorded', subscores.consciousness],
    ['Temperature', fmt(s.temperature.temperature, '°C'), subscores.temperature]
  ].map(([name, value, point]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
      <td class="num">${pill(point)}</td>
    </tr>
  `).join('');

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

  const incompleteNote = complete
    ? ''
    : `<p class="muted">One or more parameters have not been recorded; the aggregate may understate risk until the full observation set is complete.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>NEWS2 Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${riskBandClass(riskBand)}">
        <div>
          <span class="risk-banner-label">Aggregate NEWS2</span>
          <span class="risk-banner-value">${aggregate}${redScore ? ' · red score' : ''}</span>
        </div>
        <span class="risk-badge ${riskBandClass(riskBand)}">${esc(riskBandLabel(riskBand))}</span>
      </div>

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
      </table>

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
  const grade = gradeNews2(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    subscores: grade.subscores,
    aggregate: grade.aggregate,
    redScore: grade.redScore,
    riskBand: grade.riskBand,
    monitoringFrequency: grade.monitoringFrequency,
    recommendation: grade.recommendation,
    complete: grade.complete,
    firedRules: grade.firedRules,
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
  { step: 1,  section: 'context',          title: 'Context' },
  { step: 2,  section: 'identification',   title: 'Patient' },
  { step: 3,  section: 'respiration',      title: 'Respiration' },
  { step: 4,  section: 'oxygenSaturation', title: 'SpO₂' },
  { step: 5,  section: 'oxygenSupport',    title: 'Air / oxygen' },
  { step: 6,  section: 'bloodPressure',    title: 'Systolic BP' },
  { step: 7,  section: 'pulse',            title: 'Pulse' },
  { step: 8,  section: 'consciousness',    title: 'Consciousness' },
  { step: 9,  section: 'temperature',      title: 'Temperature' },
  { step: 10, section: 'note',             title: 'Review' }
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
  host.appendChild(renderStep8());
  host.appendChild(renderStep9());
  host.appendChild(renderStep10());
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
