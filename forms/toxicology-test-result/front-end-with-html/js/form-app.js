import { calculateGrade } from './grader.js';
import { NUMERIC_FIELDS, abnormalitySeverityClass, abnormalitySeverityLabel, emptyResult, followUpUrgencyClass, followUpUrgencyLabel, overallResultStatusLabel, paracetamolNomogramLabel, priorityLabel, recommendationLabel, reportStatusLabel, resultClassificationClass, resultClassificationLabel, specimenConditionLabel } from './types.js';

// Toxicology Test Result — reporting-clinician wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The reporting clinician scrolls through them; a sticky
// top-of-page progress summary reflects how many fields have been answered
// and a live four-axis interpretation preview updates as the report is
// edited. Submission runs the pure grading engine (Axis A classification,
// Axis B severity, Axis C completeness, Axis D follow-up urgency, overall
// recommendation, fired-rule audit trail, and safety flags) and renders an
// inline structured toxicology report. State is persisted to localStorage so
// a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'toxicology-test-result.front-end-with-html.v1';

const NUMERIC_FIELD_SET = new Set(NUMERIC_FIELDS);

/** @returns {import('./types.js').ToxicologyResult} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  // Merge over a fresh empty so any newly-added fields default correctly.
  // The nullable numeric fields need a null-safe check: a fresh numeric
  // field is `null` (typeof 'object'), so a plain typeof comparison would
  // silently drop every saved number.
  const fresh = emptyResult();

  for (const key of Object.keys(fresh)) {
    if (!parsed || !(key in parsed)) continue;
    const saved = parsed[key];
    if (NUMERIC_FIELD_SET.has(key)) {
      if (saved === null || typeof saved === 'number') fresh[key] = saved;
    } else if (typeof saved === typeof fresh[key]) {
      fresh[key] = saved;
    }
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyResult();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved report; starting fresh.', e);
    return emptyResult();
  }
}

/** @param {import('./types.js').ToxicologyResult} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

/** @type {import('./types.js').ToxicologyResult} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'toxicology-test-result',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const _rep = document.getElementById('report');
    if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the structured report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    updateConditionalAlerts();
    refreshLivePreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 7;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a field on the (flat) report state and persist. Re-runs progress,
 * conditional alerts, and the live four-axis preview after each change.
 *
 * @param {string} field
 * @param {*} value
 */
function setField(field, value) {
  state[field] = value;
  saveState(state);
  updateProgress();
  updateConditionalAlerts();
  refreshLivePreview();
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
  const id = opts.field;
  const value = state[opts.field];
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
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    let v = input.value;
    if (type === 'number') {
      // Empty string means "unanswered" — store null, never '' or NaN.
      v = v === '' ? null : Number(v);
      if (v !== null && Number.isNaN(v)) v = null;
    }
    setField(opts.field, v);
    clearFieldError(id);
  });
  return wrapper;
}

function textArea(opts) {
  const id = opts.field;
  const value = state[opts.field] ?? '';
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
    setField(opts.field, ta.value);
    clearFieldError(id);
  });
  return wrapper;
}

function selectInput(opts) {
  const id = opts.field;
  const current = state[opts.field] ?? '';
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
    setField(opts.field, sel.value);
    clearFieldError(id);
  });
  return wrapper;
}

/** Single boolean toggle (checkbox) bound to a boolean field. */
function checkboxField(opts) {
  const id = opts.field;
  const checked = state[opts.field] === true;
  const wrapper = document.createElement('div');
  wrapper.className = 'field check-field';
  wrapper.innerHTML = `
    <label class="checkbox-input" for="${id}">
      <input class="checkbox-input" type="checkbox" id="${id}" name="${id}"${checked ? ' checked' : ''}>
      <span>${esc(opts.label)}</span>
    </label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
  `;
  const box = wrapper.querySelector('input');
  box.addEventListener('change', () => {
    setField(opts.field, box.checked);
  });
  return wrapper;
}

/**
 * Conditional inline alert. `data-conditional-alert` names the alert so
 * `updateConditionalAlerts()` can toggle its visibility from state.
 */
function conditionalAlert(opts) {
  const alert = document.createElement('div');
  alert.className = 'alert';
  alert.setAttribute('data-type', opts.type);
  alert.setAttribute('data-conditional-alert', opts.id);
  alert.setAttribute('role', opts.type === 'error' ? 'alert' : 'status');
  alert.hidden = true;
  alert.innerHTML = `<strong>${esc(opts.heading)}</strong><p class="muted">${esc(opts.message)}</p>`;
  return alert;
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
// Section renderers (1 per report step, mirroring the SvelteKit steps)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Report identification',
    description: 'Who authored the report, the originating request, and key dates.'
  });

  card.appendChild(textInput({
    label: 'Reporting clinician',
    field: 'reportingClinician', required: true,
    placeholder: 'e.g. Dr A Biochemist'
  }));
  card.appendChild(textInput({
    label: 'Originating request reference',
    field: 'originatingRequestReference',
    placeholder: 'e.g. REQ-2001'
  }));
  card.appendChild(selectInput({
    label: 'Report status',
    field: 'reportStatus', required: true,
    options: [
      { value: 'preliminary', label: 'Preliminary' },
      { value: 'final', label: 'Final' },
      { value: 'amended', label: 'Amended' },
      { value: 'cancelled', label: 'Cancelled' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Performed date',
    field: 'performedDate', type: 'date'
  }));
  card.appendChild(textInput({
    label: 'Reported date',
    field: 'reportedDate', type: 'date'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Specimen and history',
    description: 'The specimen condition, clinical history, suspected agent, and timing.'
  });

  card.appendChild(selectInput({
    label: 'Specimen condition',
    field: 'specimenCondition',
    hint: 'An insufficient specimen classifies the report as inconclusive.',
    options: [
      { value: 'satisfactory', label: 'Satisfactory' },
      { value: 'insufficient', label: 'Insufficient' },
      { value: 'delayed', label: 'Delayed' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Suspected agent',
    field: 'suspectedAgent',
    placeholder: 'e.g. Paracetamol, lithium, carbon monoxide…'
  }));
  card.appendChild(textInput({
    label: 'Time since ingestion (hours)',
    field: 'timeSinceIngestionHours',
    type: 'number', min: 0, max: 2000, step: 0.1,
    hint: 'Required to interpret the paracetamol nomogram (only valid at ≥ 4 h).'
  }));
  card.appendChild(textArea({
    label: 'Clinical history',
    field: 'clinicalHistory', rows: 3,
    placeholder: 'Clinical history and the question the assay was performed to answer…'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Result values',
    description: 'The measured assay levels, the drugs-of-abuse screen, and any named specific drug. Leave a level blank when the assay was not performed.'
  });

  card.appendChild(textInput({
    label: 'Paracetamol level (mg/L)',
    field: 'paracetamolLevelMgL',
    type: 'number', min: 0, max: 10000, step: 0.1
  }));
  card.appendChild(textInput({
    label: 'Salicylate level (mg/L)',
    field: 'salicylateLevelMgL',
    type: 'number', min: 0, max: 10000, step: 0.1,
    hint: 'Toxic threshold ≥ 300 mg/L.'
  }));
  card.appendChild(textInput({
    label: 'Ethanol level',
    field: 'ethanolLevel',
    type: 'number', min: 0, max: 100000, step: 0.1,
    hint: 'Blood alcohol in laboratory units.'
  }));
  card.appendChild(textInput({
    label: 'Lithium level (mmol/L)',
    field: 'lithiumLevelMmolL',
    type: 'number', min: 0, max: 100, step: 0.01,
    hint: 'Toxic threshold ≥ 1.5 mmol/L.'
  }));
  card.appendChild(textInput({
    label: 'Digoxin level',
    field: 'digoxinLevel',
    type: 'number', min: 0, max: 100, step: 0.01,
    hint: 'Laboratory units (e.g. ng/mL).'
  }));
  card.appendChild(textInput({
    label: 'Carboxyhaemoglobin (%)',
    field: 'carboxyhaemoglobinPercent',
    type: 'number', min: 0, max: 100, step: 0.1,
    hint: 'Toxic threshold ≥ 10%.'
  }));
  card.appendChild(textArea({
    label: 'Drugs-of-abuse screen',
    field: 'drugsOfAbuseScreen', rows: 2,
    placeholder: 'Opiates, benzodiazepines, cocaine, amphetamines, etc.'
  }));
  card.appendChild(textArea({
    label: 'Specific drug level',
    field: 'specificDrugLevel', rows: 2,
    placeholder: 'Named specific drug result for an agent not captured above…'
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Interpretation',
    description: 'The paracetamol nomogram, overall status, toxic-level flag, and findings narrative.'
  });

  card.appendChild(selectInput({
    label: 'Paracetamol nomogram',
    field: 'paracetamolNomogram',
    hint: 'Interpretable only at ≥ 4 h post-ingestion (single 100 mg/L treatment line).',
    options: [
      { value: 'above-treatment-line', label: 'Above treatment line' },
      { value: 'below-treatment-line', label: 'Below treatment line' },
      { value: 'not-applicable', label: 'Not applicable' }
    ]
  }));

  card.appendChild(conditionalAlert({
    id: 'nomogram-timing-warning',
    type: 'warning',
    heading: 'Nomogram not interpretable before 4 hours',
    message: 'A paracetamol level is recorded with a time since ingestion under 4 hours; the treatment nomogram is not interpretable before 4 hours post-ingestion. Repeat the level at or after 4 hours before plotting.'
  }));

  card.appendChild(selectInput({
    label: 'Overall result status',
    field: 'overallResultStatus',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'abnormal', label: 'Abnormal' },
      { value: 'critical', label: 'Critical' }
    ]
  }));
  card.appendChild(checkboxField({
    label: 'A reported level is in a toxic range requiring action',
    field: 'toxicLevelPresent'
  }));

  card.appendChild(conditionalAlert({
    id: 'toxic-alert',
    type: 'error',
    heading: 'Toxic level selected',
    message: 'A toxic level (paracetamol above the treatment line, or a toxic-level flag) auto-escalates the follow-up urgency to a critical alert with an urgent antidote action (start N-acetylcysteine / NAC for paracetamol). Ensure the result is communicated to the requester on sign-off.'
  }));

  card.appendChild(textArea({
    label: 'Findings narrative',
    field: 'findingsNarrative', rows: 5,
    placeholder: 'Narrative description of the result values and their significance (the body of the report)…'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Impression',
    description: 'The summary impression, reporting category, and recommended follow-up.'
  });

  card.appendChild(textArea({
    label: 'Impression',
    field: 'impression', rows: 4, required: true,
    placeholder: 'Summary impression / conclusion answering the clinical question…'
  }));
  card.appendChild(textInput({
    label: 'Reporting category',
    field: 'reportingCategory',
    hint: 'Optional structured-reporting label (e.g. a nomogram band or therapeutic / toxic descriptor).',
    placeholder: 'e.g. paracetamol-above-treatment-line'
  }));
  card.appendChild(textArea({
    label: 'Recommended follow-up',
    field: 'recommendedFollowUp', rows: 3,
    placeholder: 'Recommended follow-up assay, antidote, or management…'
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Critical communication',
    description: 'Whether a critical / urgent result was communicated, and to whom.'
  });

  card.appendChild(checkboxField({
    label: 'Critical / urgent result communicated to requester',
    field: 'criticalResultCommunicated'
  }));
  card.appendChild(textInput({
    label: 'Reported to',
    field: 'reportedTo',
    placeholder: 'Who was informed, with date and time'
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Interpretation and sign-off',
    description: 'Live four-axis interpretation grade and sign-off.'
  });

  card.appendChild(conditionalAlert({
    id: 'critical-signoff-alert',
    type: 'error',
    heading: 'Critical-result alert',
    message: 'This report contains a toxic level. Communicate the result directly to the requester and start the appropriate antidote (N-acetylcysteine / NAC for paracetamol) before signing.'
  }));

  const preview = document.createElement('div');
  preview.className = 'score-grid';
  preview.id = 'axis-preview';
  preview.setAttribute('aria-live', 'polite');
  preview.setAttribute('aria-label', 'Live four-axis interpretation grade');
  card.appendChild(preview);

  card.appendChild(textArea({
    label: 'Interpretation / sign-off notes',
    field: 'clinicianNotes', rows: 3
  }));
  card.appendChild(checkboxField({
    label: 'I sign and authorise this report',
    field: 'signed'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live four-axis preview
// ----------------------------------------------------------------------

function axisBadge(cls, label) {
  return `<span class="risk-badge ${cls}">${esc(label)}</span>`;
}

/** Render the live four-axis interpretation preview grid. */
function renderAxisPreview() {
  const g = calculateGrade(state);
  return `
    <div class="score-card">
      <h4>Axis A — Classification</h4>
      <p class="score-value">${axisBadge(resultClassificationClass(g.resultClassification), resultClassificationLabel(g.resultClassification))}</p>
    </div>
    <div class="score-card">
      <h4>Axis B — Severity</h4>
      <p class="score-value">${axisBadge(abnormalitySeverityClass(g.abnormalitySeverity), abnormalitySeverityLabel(g.abnormalitySeverity))}</p>
      <p class="score-label">${esc(g.reportingCategory)}</p>
    </div>
    <div class="score-card">
      <h4>Axis C — Completeness</h4>
      <p class="score-value">${g.reportCompletenessPercent}%</p>
    </div>
    <div class="score-card">
      <h4>Axis D — Follow-up urgency</h4>
      <p class="score-value">${axisBadge(followUpUrgencyClass(g.followUpUrgency), followUpUrgencyLabel(g.followUpUrgency))}</p>
      <p class="score-label">${esc(g.targetTimeframe)}</p>
    </div>
  `;
}

function refreshLivePreview() {
  const host = document.getElementById('axis-preview');
  if (host) host.innerHTML = renderAxisPreview();
}

// ----------------------------------------------------------------------
// Conditional alerts
// ----------------------------------------------------------------------

function updateConditionalAlerts() {
  const preview = calculateGrade(state);
  const visibility = {
    'nomogram-timing-warning':
      state.paracetamolLevelMgL !== null &&
      state.paracetamolNomogram !== 'not-applicable' &&
      state.timeSinceIngestionHours !== null &&
      state.timeSinceIngestionHours < 4,
    'toxic-alert':
      state.toxicLevelPresent || state.paracetamolNomogram === 'above-treatment-line',
    'critical-signoff-alert': preview.followUpUrgency === 'critical-alert'
  };
  document.querySelectorAll('[data-conditional-alert]').forEach((host) => {
    const id = host.getAttribute('data-conditional-alert');
    host.hidden = !visibility[id];
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered (a boolean
// counts only when ticked; a numeric field when non-null). This lets the
// result-values step count as answered once any assay level or screen result
// is recorded, without demanding every assay be performed.
const STEP_SLOTS = {
  1: [['reportingClinician'], ['originatingRequestReference'], ['reportStatus'],
      ['performedDate'], ['reportedDate']],
  2: [['specimenCondition'], ['suspectedAgent'], ['timeSinceIngestionHours'],
      ['clinicalHistory']],
  3: [['paracetamolLevelMgL', 'salicylateLevelMgL', 'ethanolLevel',
       'lithiumLevelMmolL', 'digoxinLevel', 'carboxyhaemoglobinPercent'],
      ['drugsOfAbuseScreen', 'specificDrugLevel']],
  4: [['paracetamolNomogram'], ['overallResultStatus'], ['findingsNarrative']],
  5: [['impression'], ['reportingCategory'], ['recommendedFollowUp']],
  6: [['criticalResultCommunicated', 'reportedTo']],
  7: [['clinicianNotes'], ['signed']]
};

function isAnswered(field) {
  const v = state[field];
  if (typeof v === 'boolean') return v === true;
  return v !== null && v !== undefined && String(v).trim() !== '';
}

function updateProgress() {
  let answered = 0;
  let total = 0;
  const stepAnswered = {};
  const stepTotal = {};

  for (const step of Object.keys(STEP_SLOTS)) {
    const slots = STEP_SLOTS[step];
    stepTotal[step] = slots.length;
    stepAnswered[step] = 0;
    for (const slot of slots) {
      total++;
      if (slot.some((field) => isAnswered(field))) {
        answered++;
        stepAnswered[step]++;
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

function axisLabel(axis) {
  switch (axis) {
    case 'classification': return 'A — Classification';
    case 'severity': return 'B — Severity';
    case 'completeness': return 'C — Completeness';
    case 'follow-up': return 'D — Follow-up';
    default: return axis;
  }
}

/** The recorded assay result values, as [label, display] pairs. */
function recordedResultValues() {
  const rows = [];
  const push = (label, value, unit) => {
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      rows.push([label, `${value}${unit ? ` ${unit}` : ''}`]);
    }
  };
  push('Paracetamol level', state.paracetamolLevelMgL, 'mg/L');
  push('Salicylate level', state.salicylateLevelMgL, 'mg/L');
  push('Ethanol level', state.ethanolLevel, '');
  push('Lithium level', state.lithiumLevelMmolL, 'mmol/L');
  push('Digoxin level', state.digoxinLevel, '');
  push('Carboxyhaemoglobin', state.carboxyhaemoglobinPercent, '%');
  push('Drugs-of-abuse screen', state.drugsOfAbuseScreen, '');
  push('Specific drug level', state.specificDrugLevel, '');
  return rows;
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const g = lastResult;

  const detailRows = [
    ['Reporting clinician', state.reportingClinician || 'Not recorded'],
    ['Originating request', state.originatingRequestReference || 'Not recorded'],
    ['Report status', reportStatusLabel(state.reportStatus)],
    ['Performed date', state.performedDate || 'Not recorded'],
    ['Reported date', state.reportedDate || 'Not recorded'],
    ['Specimen condition', specimenConditionLabel(state.specimenCondition)],
    ['Suspected agent', state.suspectedAgent || 'Not recorded'],
    ['Time since ingestion', state.timeSinceIngestionHours !== null
      ? `${state.timeSinceIngestionHours} h` : 'Not recorded'],
    ['Paracetamol nomogram', paracetamolNomogramLabel(state.paracetamolNomogram)],
    ['Overall result status', overallResultStatusLabel(state.overallResultStatus)],
    ['Toxic level present', state.toxicLevelPresent ? 'Yes' : 'No'],
    ['Critical result communicated', state.criticalResultCommunicated
      ? `Yes${state.reportedTo ? ` — ${state.reportedTo}` : ''}` : 'No'],
    ['Signed', state.signed ? 'Yes' : 'No']
  ].map(([name, value]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
    </tr>
  `).join('');

  const resultValueRows = recordedResultValues();
  const resultValuesTable = resultValueRows.length === 0
    ? `<p class="muted">No assay result values recorded.</p>`
    : `
      <table class="subscales">
        <tbody>${resultValueRows.map(([name, value]) => `
          <tr>
            <th scope="row">${esc(name)}</th>
            <td>${esc(value)}</td>
          </tr>
        `).join('')}</tbody>
      </table>
    `;

  const axisRows = [
    ['Axis A — Result classification',
      axisBadge(resultClassificationClass(g.resultClassification), resultClassificationLabel(g.resultClassification))],
    ['Axis B — Abnormality severity',
      axisBadge(abnormalitySeverityClass(g.abnormalitySeverity), abnormalitySeverityLabel(g.abnormalitySeverity)) +
      (g.reportingCategory ? ` <span class="muted">${esc(g.reportingCategory)}</span>` : '')],
    ['Axis C — Report completeness', `<strong>${g.reportCompletenessPercent}%</strong>`],
    ['Axis D — Follow-up urgency',
      axisBadge(followUpUrgencyClass(g.followUpUrgency), followUpUrgencyLabel(g.followUpUrgency)) +
      ` <span class="muted">${esc(g.targetTimeframe)}</span>`],
    ['Overall recommendation', `<strong>${esc(recommendationLabel(g.recommendation))}</strong>`]
  ].map(([name, html]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${html}</td>
    </tr>
  `).join('');

  const firedRulesRows = g.firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.ruleId)}</th>
      <td>${esc(axisLabel(r.axis))}</td>
      <td>${esc(r.description)}</td>
    </tr>
  `).join('');

  const flagsList = g.flags.length === 0
    ? `<p class="muted">No safety flags raised.</p>`
    : `
      <ul class="flags">
        ${g.flags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority))}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}${f.suggestedAction ? ` — ${esc(f.suggestedAction)}` : ''}</span>
          </li>
        `).join('')}
      </ul>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Toxicology Test Report</h2>
        <p class="muted">Graded ${esc(new Date(g.gradedAt).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${resultClassificationClass(g.resultClassification) || 'risk-moderate'}">
        <div>
          <span class="risk-banner-label">Result classification</span>
          <span class="risk-banner-value">${esc(resultClassificationLabel(g.resultClassification))}</span>
        </div>
        <span class="risk-badge ${followUpUrgencyClass(g.followUpUrgency)}">${esc(followUpUrgencyLabel(g.followUpUrgency))}</span>
      </div>

      <h3>Four-axis interpretation grade</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Axis</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>${axisRows}</tbody>
      </table>

      <h3>Recommended action</h3>
      <p>${esc(g.recommendedAction)}</p>
      ${state.recommendedFollowUp ? `<p class="muted">Clinician follow-up plan: ${esc(state.recommendedFollowUp)}</p>` : ''}

      <h3>Report details</h3>
      <table class="subscales">
        <tbody>${detailRows}</tbody>
      </table>

      <h3>Result values</h3>
      ${resultValuesTable}

      <h3>Impression</h3>
      <p>${esc(state.impression || 'Not recorded')}</p>
      ${state.findingsNarrative ? `<p class="muted">${esc(state.findingsNarrative)}</p>` : ''}

      <h3>Safety flags (${g.flags.length})</h3>
      ${flagsList}

      <h3>Fired rules (audit trail)</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Rule</th>
            <th scope="col">Axis</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>${firedRulesRows}</tbody>
      </table>

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
  lastResult = calculateGrade(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh report?')) return;
  clearState();
  state = emptyResult();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the structured report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalAlerts();
  refreshLivePreview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, title: 'Identification' },
  { step: 2, title: 'Specimen' },
  { step: 3, title: 'Results' },
  { step: 4, title: 'Interpretation' },
  { step: 5, title: 'Impression' },
  { step: 6, title: 'Communication' },
  { step: 7, title: 'Sign-off' }
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
      if (firstUnfinished === -1) firstUnfinished = def.step;
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
  const form = document.getElementById('report-form');
  if (!form) return errors;
  const required = form.querySelectorAll('input[data-required], select[data-required], textarea[data-required]');
  const seen = new Set();
  required.forEach((input) => {
    const id = input.id;
    if (seen.has(id)) return;
    seen.add(id);
    const value = (input.value || '').trim();
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalAlerts();
  refreshLivePreview();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
