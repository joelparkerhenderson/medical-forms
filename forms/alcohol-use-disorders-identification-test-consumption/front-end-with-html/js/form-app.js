import { detectFlaggedIssues } from './flags.js';
import { calculateAuditcGrade } from './grader.js';
import { emptyAssessment, itemLabel, priorityLabel, riskBandClass, riskBandLabel } from './types.js';

// Alcohol Use Disorders Identification Test — Consumption (AUDIT-C) —
// screening wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// AUDIT-C score updates as the three consumption items are entered. Submission
// runs the pure scoring engine (per-item points, total 0-12, risk band,
// positive-screen indicator, flagged issues) and renders an inline report.
// State is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'alcohol-use-disorders-identification-test-consumption.front-end-with-html.v1';

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
  slug: 'alcohol-use-disorders-identification-test-consumption',
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

// The three consumption items' response options (0-4 point values). Shared
// between the wizard radios and the report so labels stay in sync.
const FREQUENCY_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Monthly or less' },
  { value: 2, label: '2-4 times a month' },
  { value: 3, label: '2-3 times a week' },
  { value: 4, label: '4 or more times a week' }
];

const QUANTITY_OPTIONS = [
  { value: 0, label: '1-2 units' },
  { value: 1, label: '3-4 units' },
  { value: 2, label: '5-6 units' },
  { value: 3, label: '7-9 units' },
  { value: 4, label: '10 or more units' }
];

const HEAVY_EPISODE_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Less than monthly' },
  { value: 2, label: 'Monthly' },
  { value: 3, label: 'Weekly' },
  { value: 4, label: 'Daily or almost daily' }
];

/** Look up the display label for a chosen item point value. */
function optionLabel(options, value) {
  if (value === null || value === undefined || value === '') return 'Not recorded';
  const hit = options.find((o) => String(o.value) === String(value));
  return hit ? hit.label : 'Not recorded';
}

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

// Radio group. When opts.numeric is true, the chosen value is stored as a
// Number (0-4) so it matches the SQL SMALLINT item columns and the grader's
// arithmetic; otherwise it is stored as the raw string.
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
  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', `${groupId}-fieldset`);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
    label.htmlFor = radioId;
    const checked =
      current !== null && current !== undefined && current !== '' &&
      String(current) === String(option.value) ? ' checked' : '';
    const requiredAttr = opts.required ? ' data-required' : '';
    const optLabel = opts.numeric
      ? `${option.value} — ${option.label}`
      : option.label;
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}${requiredAttr}>
      <span>${esc(optLabel)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        const v = opts.numeric ? Number(input.value) : input.value;
        setField(opts.section, opts.field, v);
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
// Section renderers (1 per AUDIT-C step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is screening, when, in what care setting, and how the screen was administered.'
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
      { value: 'gp', label: 'General practitioner' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'healthcare-assistant', label: 'Healthcare assistant' },
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
      { value: 'primary-care', label: 'Primary care / general practice' },
      { value: 'emergency-department', label: 'Emergency department' },
      { value: 'health-check', label: 'NHS Health Check / health promotion' },
      { value: 'inpatient', label: 'Inpatient / hospital admission' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Administration mode',
    section: 'context', field: 'administrationMode', required: true,
    options: [
      { value: 'self-completed', label: 'Self-completed by the patient' },
      { value: 'interview', label: 'Clinician interview' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age band, and sex. AUDIT-C is for adults (>= 16 years); sex selects the Q3 heavy-episode threshold.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. GP-100482 or hospital MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    options: [
      { value: '16-24', label: '16-24' },
      { value: '25-39', label: '25-39' },
      { value: '40-59', label: '40-59' },
      { value: '60-74', label: '60-74' },
      { value: '75-plus', label: '75 and over' }
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
    title: 'Frequency of drinking',
    description: 'Item 1 (Q1) — scores the chosen response 0-4. A unit is 8 g / 10 mL of pure alcohol.'
  });

  card.appendChild(radioGroup({
    label: 'How often do you have a drink containing alcohol?',
    section: 'items', field: 'frequencyOfDrinking', required: true, numeric: true,
    options: FREQUENCY_OPTIONS
  }));

  card.appendChild(readOnlyReadout({
    label: 'Item 1 point',
    id: 'frequency-point-readout',
    render: () => renderPointReadout('frequency-of-drinking')
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Typical quantity',
    description: 'Item 2 (Q2) — scores the chosen response 0-4, in UK units on a day when drinking.'
  });

  card.appendChild(radioGroup({
    label: 'How many units of alcohol do you drink on a typical day when you are drinking?',
    section: 'items', field: 'typicalQuantity', required: true, numeric: true,
    options: QUANTITY_OPTIONS
  }));

  card.appendChild(readOnlyReadout({
    label: 'Item 2 point',
    id: 'quantity-point-readout',
    render: () => renderPointReadout('typical-quantity')
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Heavy episodic drinking',
    description: 'Item 3 (Q3) — scores the chosen response 0-4. Threshold: 6 or more units (female) / 8 or more units (male) on a single occasion.'
  });

  card.appendChild(radioGroup({
    label: 'How often have you had 6 or more units (female) / 8 or more units (male) on a single occasion in the last year?',
    section: 'items', field: 'heavyEpisodeFrequency', required: true, numeric: true,
    options: HEAVY_EPISODE_OPTIONS
  }));

  card.appendChild(readOnlyReadout({
    label: 'Item 3 point',
    id: 'heavy-episode-point-readout',
    render: () => renderPointReadout('heavy-episode-frequency')
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Summary and score',
    description: 'Live AUDIT-C total and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live AUDIT-C score',
    id: 'live-score-readout',
    render: () => renderLiveScore()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, consumption details, decisions, and any brief intervention or referral actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the 0-4 point pill for a single consumption item. */
function renderPointReadout(item) {
  const grade = calculateAuditcGrade(state);
  const point =
    item === 'frequency-of-drinking' ? grade.frequencyOfDrinkingPoint
    : item === 'typical-quantity' ? grade.typicalQuantityPoint
    : grade.heavyEpisodeFrequencyPoint;
  const answered =
    item === 'frequency-of-drinking' ? state.items.frequencyOfDrinking
    : item === 'typical-quantity' ? state.items.typicalQuantity
    : state.items.heavyEpisodeFrequency;
  const isMissing = answered === null || answered === undefined || answered === '';
  const cls = point >= 3 ? 'warn' : 'ok';
  const note = isMissing ? '(not recorded — counts as 0)' : `of 4`;
  return `<strong class="${cls}">${point} point</strong> <span class="muted">${note}</span>`;
}

/** Render the live overall AUDIT-C score and band. */
function renderLiveScore() {
  const grade = calculateAuditcGrade(state);
  const badge =
    `<span class="risk-badge ${riskBandClass(grade.riskBand)}">${esc(riskBandLabel(grade.riskBand))}</span>`;
  const screen = grade.positiveScreen
    ? ` <span class="muted">positive screen (>= 5)</span>`
    : ` <span class="muted">below the positive-screen cut of 5</span>`;
  return `<strong>${grade.auditcScore} of 12</strong> ${badge}${screen}`;
}

function refreshLiveScore() {
  const map = {
    'frequency-of-drinking': 'frequency-point-readout',
    'typical-quantity': 'quantity-point-readout',
    'heavy-episode-frequency': 'heavy-episode-point-readout'
  };
  for (const item of Object.keys(map)) {
    const el = document.getElementById(map[item]);
    if (el) el.innerHTML = renderPointReadout(item);
  }
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
// Step definitions (table of contents + progress)
// ----------------------------------------------------------------------

// Each step lists the state fields it contains. A field counts as a "slot";
// the slot is answered when its field holds a non-empty value (0 counts as
// answered for the numeric item fields). Progress and the step-list completion
// status are derived from these definitions.
const STEP_DEFINITIONS = [
  { step: 1, title: 'Context',  fields: [['context', 'clinicianName'], ['context', 'clinicianRole'], ['context', 'careSetting'], ['context', 'administrationMode']] },
  { step: 2, title: 'Patient',  fields: [['identification', 'patientIdentifier'], ['identification', 'ageBand'], ['identification', 'sex']] },
  { step: 3, title: 'Q1 Frequency', fields: [['items', 'frequencyOfDrinking']] },
  { step: 4, title: 'Q2 Quantity',  fields: [['items', 'typicalQuantity']] },
  { step: 5, title: 'Q3 Heavy episodes', fields: [['items', 'heavyEpisodeFrequency']] },
  { step: 6, title: 'Summary',  fields: [['note', 'clinicalNote']] }
];

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '';
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

function updateProgress() {
  let answered = 0;
  let total = 0;
  const stepAnswered = {};
  const stepTotal = {};

  for (const def of STEP_DEFINITIONS) {
    stepTotal[def.step] = def.fields.length;
    stepAnswered[def.step] = 0;
    for (const [section, field] of def.fields) {
      total++;
      if (isAnswered(section, field)) {
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
    frequencyOfDrinkingPoint, typicalQuantityPoint, heavyEpisodeFrequencyPoint,
    auditcScore, riskBand, positiveScreen, flaggedIssues, timestamp
  } = lastResult;

  const { frequencyOfDrinking, typicalQuantity, heavyEpisodeFrequency } =
    state.items;

  const itemRows = [
    ['frequency-of-drinking', optionLabel(FREQUENCY_OPTIONS, frequencyOfDrinking), frequencyOfDrinkingPoint],
    ['typical-quantity', optionLabel(QUANTITY_OPTIONS, typicalQuantity), typicalQuantityPoint],
    ['heavy-episode-frequency', optionLabel(HEAVY_EPISODE_OPTIONS, heavyEpisodeFrequency), heavyEpisodeFrequencyPoint]
  ].map(([item, answer, point]) => `
    <tr>
      <th scope="row">${esc(itemLabel(item))}</th>
      <td>${esc(answer)}</td>
      <td class="num"><span class="grade-pill">${point} point${point === 1 ? '' : 's'}</span></td>
    </tr>
  `).join('');

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

  const recommendation =
    riskBand === 'possible-dependence'
      ? `<p>This is a <strong>positive AUDIT-C screen</strong> (score ${auditcScore} of 12, possible dependence). Complete the full 10-item AUDIT; a full-AUDIT score >= 20 or clinical features of dependence warrant referral to specialist alcohol services. A raised score is a prompt to assess further, not a diagnosis of dependence.</p>`
    : riskBand === 'higher'
      ? `<p>This is a <strong>positive AUDIT-C screen</strong> (score ${auditcScore} of 12, higher risk). Deliver brief advice plus an offer of an extended brief intervention, and complete the full 10-item AUDIT to characterise risk.</p>`
    : riskBand === 'increasing'
      ? `<p>This is a <strong>positive AUDIT-C screen</strong> (score ${auditcScore} of 12, increasing risk). Deliver brief structured advice on reducing consumption and complete the full 10-item AUDIT.</p>`
      : `<p>This is a <strong>negative AUDIT-C screen</strong> (score ${auditcScore} of 12, lower risk). Reinforce the UK Chief Medical Officers' low-risk drinking guidance (<= 14 units/week, spread over 3 or more days). A low score does not exclude an alcohol problem where other concerns exist.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>AUDIT-C Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${riskBandClass(riskBand)}">
        <div>
          <span class="risk-banner-label">AUDIT-C score</span>
          <span class="risk-banner-value">${auditcScore} of 12</span>
        </div>
        <span class="risk-badge ${riskBandClass(riskBand)}">${esc(riskBandLabel(riskBand))}</span>
      </div>

      <p class="muted">Positive screen (AUDIT-C >= 5): <strong>${positiveScreen ? 'Yes' : 'No'}</strong></p>

      <h3>Consumption items</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Answer</th>
            <th scope="col">Point</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <h3>Recommended action</h3>
      ${recommendation}

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
  const grade = calculateAuditcGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade.auditcScore);
  lastResult = {
    frequencyOfDrinkingPoint: grade.frequencyOfDrinkingPoint,
    typicalQuantityPoint: grade.typicalQuantityPoint,
    heavyEpisodeFrequencyPoint: grade.heavyEpisodeFrequencyPoint,
    auditcScore: grade.auditcScore,
    riskBand: grade.riskBand,
    positiveScreen: grade.positiveScreen,
    firedItems: grade.firedItems,
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
    if (value === '') {
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
