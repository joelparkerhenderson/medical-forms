import { calculateGrade } from './grader.js';
import { abnormalitySeverityClass, abnormalitySeverityLabel, emptyResult, followUpUrgencyClass, followUpUrgencyLabel, overallResultStatusLabel, priorityLabel, recommendationLabel, reportStatusLabel, resultClassificationClass, resultClassificationLabel, specimenConditionLabel } from './types.js';

// Coagulation Test Result — reporting-clinician wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The reporting clinician scrolls through them; a sticky
// top-of-page progress summary reflects how many fields have been answered
// and a live four-axis interpretation preview updates as the report is
// edited. Submission runs the pure grading engine (Axis A classification,
// Axis B severity, Axis C completeness, Axis D follow-up urgency, overall
// recommendation, fired-rule audit trail, and safety flags) and renders an
// inline structured haematology report. State is persisted to localStorage so
// a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'coagulation-test-result.front-end-with-html.v1';

/** @returns {import('./types.js').CoagulationResult} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  // Merge over a fresh empty so any newly-added fields default correctly.
  // Numeric result values default to null, so accept a saved number (or
  // null) for them; all other fields must match the fresh type exactly.
  const fresh = emptyResult();

  for (const key of Object.keys(fresh)) {
    if (!parsed || !(key in parsed)) continue;
    const freshValue = fresh[key];
    const savedValue = parsed[key];
    if (freshValue === null) {
      if (savedValue === null || typeof savedValue === 'number') {
        fresh[key] = savedValue;
      }
    } else if (typeof savedValue === typeof freshValue) {
      fresh[key] = savedValue;
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

/** @param {import('./types.js').CoagulationResult} state */
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

/** @type {import('./types.js').CoagulationResult} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'coagulation-test-result',
  hadDraftAtLoad,
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
    updateConditionalVisibility();
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
 * conditional visibility, and the live four-axis preview after each change.
 *
 * @param {string} field
 * @param {*} value
 */
function setField(field, value) {
  state[field] = value;
  saveState(state);
  updateProgress();
  updateConditionalVisibility();
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

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  if (opts.conditional) wrapper.setAttribute('data-conditional-field', opts.conditional);
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    setField(opts.field, input.value);
    clearFieldError(id);
  });
  return wrapper;
}

/** Numeric input bound to a `number | null` field ('' clears back to null). */
function numberInput(opts) {
  const id = opts.field;
  const value = state[opts.field];
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    'type="number"',
    'class="number-input"',
    `value="${value === null || value === undefined ? '' : esc(value)}"`,
    `aria-describedby="${id}-error"`
  ];
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);
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
    const raw = input.value.trim();
    const parsed = raw === '' ? null : Number(raw);
    setField(opts.field, Number.isNaN(parsed) ? null : parsed);
    clearFieldError(id);
  });
  return wrapper;
}

function textArea(opts) {
  const id = opts.field;
  const value = state[opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  if (opts.conditional) wrapper.setAttribute('data-conditional-field', opts.conditional);
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
 * `updateConditionalVisibility()` can toggle its visibility from state.
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
    placeholder: 'e.g. Dr A Haematologist'
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
    title: 'Specimen and context',
    description: 'Pre-analytical specimen condition, clinical history, and anticoagulant status.'
  });

  card.appendChild(selectInput({
    label: 'Specimen condition',
    field: 'specimenCondition',
    options: [
      { value: 'satisfactory', label: 'Satisfactory' },
      { value: 'clotted', label: 'Clotted' },
      { value: 'underfilled', label: 'Underfilled' },
      { value: 'haemolysed', label: 'Haemolysed' },
      { value: 'insufficient', label: 'Insufficient' }
    ]
  }));

  card.appendChild(conditionalAlert({
    id: 'specimen-quality-warning',
    type: 'warning',
    heading: 'Specimen-quality issue',
    message: 'A clotted, underfilled, haemolysed, or insufficient specimen compromises interpretation; without an impression the result classifies as inconclusive. Consider requesting a repeat specimen.'
  }));

  card.appendChild(textArea({
    label: 'Clinical history',
    field: 'clinicalHistory', rows: 3,
    placeholder: 'Clinical history and the question the test was performed to answer…'
  }));

  card.appendChild(checkboxField({
    label: 'Patient on anticoagulant therapy',
    field: 'onAnticoagulant'
  }));

  card.appendChild(textInput({
    label: 'Anticoagulant agent',
    field: 'anticoagulantAgent',
    conditional: 'anticoagulant-agent',
    placeholder: 'e.g. warfarin, LMWH, apixaban, rivaroxaban, dabigatran'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Result values',
    description: 'The reported coagulation result values. Leave a value blank if not measured.'
  });

  card.appendChild(numberInput({
    label: 'Prothrombin time — PT (s)',
    field: 'prothrombinTimeSeconds',
    min: 0, max: 300, step: 0.1,
    hint: 'Extrinsic / common pathway; reference range approximately 11–14 s.'
  }));
  card.appendChild(numberInput({
    label: 'INR',
    field: 'inr',
    min: 0, max: 50, step: 0.1,
    hint: 'Standardised PT for warfarin monitoring; > 8 is a critical value.'
  }));
  card.appendChild(numberInput({
    label: 'APTT (s)',
    field: 'activatedPartialThromboplastinTimeSeconds',
    min: 0, max: 300, step: 0.1,
    hint: 'Intrinsic / common pathway; reference range approximately 25–40 s.'
  }));
  card.appendChild(numberInput({
    label: 'APTT ratio',
    field: 'apttRatio',
    min: 0, max: 50, step: 0.1,
    hint: 'Patient APTT divided by the mean normal APTT.'
  }));
  card.appendChild(numberInput({
    label: 'Fibrinogen (g/L)',
    field: 'fibrinogenGL',
    min: 0, max: 50, step: 0.1,
    hint: 'Clauss fibrinogen; < 1.0 g/L is a critical value.'
  }));
  card.appendChild(numberInput({
    label: 'D-dimer',
    field: 'dDimer',
    min: 0, max: 1000000, step: 0.1,
    hint: 'Fibrin degradation product (units as reported by the assay).'
  }));
  card.appendChild(numberInput({
    label: 'Thrombin time — TT (s)',
    field: 'thrombinTimeSeconds',
    min: 0, max: 300, step: 0.1,
    hint: 'Fibrinogen function; heparin / dabigatran effect.'
  }));
  card.appendChild(textArea({
    label: 'Factor assays / special tests',
    field: 'factorAssays', rows: 3,
    placeholder: 'Factor VIII/IX levels, von Willebrand panel, lupus anticoagulant, anti-Xa…'
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Findings',
    description: 'The narrative findings, the overall result status, and any critical value.'
  });

  card.appendChild(textArea({
    label: 'Findings narrative',
    field: 'findingsNarrative', rows: 5,
    placeholder: 'Narrative description of the coagulation findings (the body of the report)…'
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
    label: 'Critical (panic) value present',
    field: 'criticalValuePresent'
  }));
  card.appendChild(textArea({
    label: 'Critical value detail',
    field: 'criticalValueDetail', rows: 2,
    conditional: 'critical-value-detail',
    placeholder: 'Which threshold was breached and the value (e.g. INR 9.5 > 8 critical threshold)…'
  }));

  card.appendChild(conditionalAlert({
    id: 'critical-value-alert',
    type: 'error',
    heading: 'Critical value selected',
    message: 'A critical value (e.g. INR > 8 or fibrinogen < 1.0 g/L) auto-escalates the follow-up urgency to a critical alert. Ensure the result is communicated to the referrer on sign-off.'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Comparison',
    description: 'Comparison with previous results and the structured-reporting category.'
  });

  card.appendChild(textArea({
    label: 'Comparison with previous results',
    field: 'comparisonWithPrevious', rows: 3,
    placeholder: 'Relevant previous coagulation results and the trend / delta since…'
  }));
  card.appendChild(textInput({
    label: 'Reporting category',
    field: 'reportingCategory',
    hint: 'Optional structured-reporting label (e.g. anticoagulant-effect, DIC-picture, isolated-APTT-prolongation).',
    placeholder: 'e.g. anticoagulant-effect'
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Impression',
    description: 'The summary impression and recommended follow-up.'
  });

  card.appendChild(textArea({
    label: 'Impression',
    field: 'impression', rows: 4, required: true,
    placeholder: 'Summary impression / conclusion answering the clinical question…'
  }));
  card.appendChild(textArea({
    label: 'Recommended follow-up',
    field: 'recommendedFollowUp', rows: 3,
    placeholder: 'Recommended follow-up testing, referral, or management…'
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Interpretation and sign-off',
    description: 'Live four-axis interpretation grade, critical-result communication, and sign-off.'
  });

  card.appendChild(conditionalAlert({
    id: 'critical-signoff-alert',
    type: 'error',
    heading: 'Critical-result alert',
    message: 'This report contains a critical value. Communicate the result directly to the referrer and record it below before signing.'
  }));

  const preview = document.createElement('div');
  preview.className = 'score-grid';
  preview.id = 'axis-preview';
  preview.setAttribute('aria-live', 'polite');
  preview.setAttribute('aria-label', 'Live four-axis interpretation grade');
  card.appendChild(preview);

  card.appendChild(checkboxField({
    label: 'Critical / urgent result communicated to referrer',
    field: 'criticalResultCommunicated'
  }));
  card.appendChild(textInput({
    label: 'Reported to',
    field: 'reportedTo',
    placeholder: 'Who was informed, with date and time'
  }));
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
// Conditional alerts + conditional fields
// ----------------------------------------------------------------------

function updateConditionalVisibility() {
  const preview = calculateGrade(state);

  // Alerts.
  const alertVisibility = {
    'specimen-quality-warning':
      state.specimenCondition === 'clotted' ||
      state.specimenCondition === 'underfilled' ||
      state.specimenCondition === 'haemolysed' ||
      state.specimenCondition === 'insufficient',
    'critical-value-alert':
      state.criticalValuePresent ||
      state.overallResultStatus === 'critical' ||
      (state.inr !== null && state.inr > 8) ||
      (state.fibrinogenGL !== null && state.fibrinogenGL < 1.0),
    'critical-signoff-alert': preview.followUpUrgency === 'critical-alert'
  };
  document.querySelectorAll('[data-conditional-alert]').forEach((host) => {
    const id = host.getAttribute('data-conditional-alert');
    host.hidden = !alertVisibility[id];
  });

  // Fields (mirror the SvelteKit `{#if …}` blocks).
  const fieldVisibility = {
    'anticoagulant-agent': state.onAnticoagulant,
    'critical-value-detail': state.criticalValuePresent
  };
  document.querySelectorAll('[data-conditional-field]').forEach((host) => {
    const id = host.getAttribute('data-conditional-field');
    host.hidden = !fieldVisibility[id];
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered (a boolean
// counts only when ticked; a numeric counts when non-null). This lets the
// result-values step count as answered once any reported value is recorded.
const STEP_SLOTS = {
  1: [['reportingClinician'], ['originatingRequestReference'], ['reportStatus'],
      ['performedDate'], ['reportedDate']],
  2: [['specimenCondition'], ['clinicalHistory'],
      ['onAnticoagulant', 'anticoagulantAgent']],
  3: [['prothrombinTimeSeconds', 'inr'],
      ['activatedPartialThromboplastinTimeSeconds', 'apttRatio'],
      ['fibrinogenGL', 'dDimer', 'thrombinTimeSeconds', 'factorAssays']],
  4: [['findingsNarrative'], ['overallResultStatus'],
      ['criticalValuePresent', 'criticalValueDetail']],
  5: [['comparisonWithPrevious'], ['reportingCategory']],
  6: [['impression'], ['recommendedFollowUp']],
  7: [['reportedTo'], ['clinicianNotes'], ['signed']]
};

function isAnswered(field) {
  const v = state[field];
  if (typeof v === 'boolean') return v === true;
  if (typeof v === 'number') return true;
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

/** Format a `number | null` result value with its unit for the report. */
function formatValue(value, unit) {
  if (value === null || value === undefined) return 'Not measured';
  return unit ? `${value} ${unit}` : String(value);
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
    ['On anticoagulant', state.onAnticoagulant
      ? `Yes${state.anticoagulantAgent ? ` (${state.anticoagulantAgent})` : ''}`
      : 'No'],
    ['Overall result status', overallResultStatusLabel(state.overallResultStatus)],
    ['Signed', state.signed ? 'Yes' : 'No']
  ].map(([name, value]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
    </tr>
  `).join('');

  const valueRows = [
    ['Prothrombin time (PT)', formatValue(state.prothrombinTimeSeconds, 's')],
    ['INR', formatValue(state.inr, '')],
    ['APTT', formatValue(state.activatedPartialThromboplastinTimeSeconds, 's')],
    ['APTT ratio', formatValue(state.apttRatio, '')],
    ['Fibrinogen', formatValue(state.fibrinogenGL, 'g/L')],
    ['D-dimer', formatValue(state.dDimer, '')],
    ['Thrombin time (TT)', formatValue(state.thrombinTimeSeconds, 's')],
    ['Factor assays / special tests', state.factorAssays || 'Not recorded']
  ].map(([name, value]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
    </tr>
  `).join('');

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
        <h2>Coagulation Test Report</h2>
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
      ${state.criticalValueDetail ? `<p class="muted">Critical value detail: ${esc(state.criticalValueDetail)}</p>` : ''}

      <h3>Report details</h3>
      <table class="subscales">
        <tbody>${detailRows}</tbody>
      </table>

      <h3>Result values</h3>
      <table class="subscales">
        <tbody>${valueRows}</tbody>
      </table>

      <h3>Impression</h3>
      <p>${esc(state.impression || 'Not recorded')}</p>
      ${state.findingsNarrative ? `<p class="muted">${esc(state.findingsNarrative)}</p>` : ''}
      ${state.comparisonWithPrevious ? `<p class="muted">Comparison: ${esc(state.comparisonWithPrevious)}</p>` : ''}

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
  updateConditionalVisibility();
  refreshLivePreview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, title: 'Identification' },
  { step: 2, title: 'Specimen' },
  { step: 3, title: 'Values' },
  { step: 4, title: 'Findings' },
  { step: 5, title: 'Comparison' },
  { step: 6, title: 'Impression' },
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
  updateConditionalVisibility();
  refreshLivePreview();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
