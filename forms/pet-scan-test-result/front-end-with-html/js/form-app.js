import { calculateGrade } from './grader.js';
import { hasCriticalFinding } from './rules.js';
import { NUMERIC_FIELDS, abnormalitySeverityClass, abnormalitySeverityLabel, emptyResult, examinationAdequacyLabel, followUpUrgencyClass, followUpUrgencyLabel, priorityLabel, recommendationLabel, reportStatusLabel, resultClassificationClass, resultClassificationLabel, scanTypeLabel, treatmentResponseLabel } from './types.js';

// PET Scan Test Result — reporting-clinician wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The reporting clinician scrolls through them; a sticky
// top-of-page progress summary reflects how many fields have been answered
// and a live four-axis interpretation preview updates as the report is
// edited. Submission runs the pure grading engine (Axis A classification,
// Axis B severity, Axis C completeness, Axis D follow-up urgency, overall
// recommendation, fired-rule audit trail, and safety flags) and renders an
// inline structured molecular-imaging report. State is persisted to
// localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'pet-scan-test-result.front-end-with-html.v1';

/**
 * Load and rehydrate saved state. Merges the parsed JSON over a fresh empty
 * result so any newly-added fields default correctly. Numeric fields default
 * to `null` (typeof null === 'object'), so they get a null-safe merge that
 * accepts either a finite number or null; everything else merges only when
 * the saved value's type matches the fresh default's type.
 *
 * @returns {import('./types.js').PetScanResult}
 */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyResult();

  if (!parsed || typeof parsed !== 'object') return fresh;
  for (const key of Object.keys(fresh)) {
    if (!(key in parsed)) continue;
    const v = parsed[key];
    if (NUMERIC_FIELDS.includes(key)) {
      if (v === null || (typeof v === 'number' && Number.isFinite(v))) {
        fresh[key] = v;
      }
    } else if (typeof v === typeof fresh[key]) {
      fresh[key] = v;
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

/** @param {import('./types.js').PetScanResult} state */
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

/** @type {import('./types.js').PetScanResult} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'pet-scan-test-result',
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
    setField(opts.field, input.value);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Numeric input bound to a `number | null` field. The empty string maps to
 * `null` (the unanswered convention for numeric fields); any other value is
 * parsed with `parseFloat`, and an unparsable entry also stores `null`.
 */
function numberInput(opts) {
  const id = opts.field;
  const value = state[opts.field];
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    'type="number"',
    'class="number-input"',
    `value="${value === null || value === undefined ? '' : esc(String(value))}"`,
    'inputmode="decimal"',
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
    if (raw === '') {
      setField(opts.field, null);
    } else {
      const parsed = parseFloat(raw);
      setField(opts.field, Number.isFinite(parsed) ? parsed : null);
    }
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

/** Group of boolean checkboxes under a shared label. */
function checkboxGroup(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = opts.label;
  wrapper.appendChild(label);

  const group = document.createElement('div');
  group.className = 'checkbox-group';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', opts.label);
  for (const item of opts.items) {
    const id = item.field;
    const checked = state[item.field] === true;
    const itemLabel = document.createElement('label');
    itemLabel.htmlFor = id;
    itemLabel.innerHTML = `
      <input class="checkbox-input" type="checkbox" id="${id}" name="${id}"${checked ? ' checked' : ''}>
      <span>${esc(item.label)}</span>
    `;
    const box = itemLabel.querySelector('input');
    box.addEventListener('change', () => {
      setField(item.field, box.checked);
    });
    group.appendChild(itemLabel);
  }
  wrapper.appendChild(group);
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
    description: 'Who authored the report, the originating request, the scan type, and key dates.'
  });

  card.appendChild(textInput({
    label: 'Reporting clinician',
    field: 'reportingClinician', required: true,
    placeholder: 'e.g. Dr A Nuclear-Medicine'
  }));
  card.appendChild(textInput({
    label: 'Originating request reference',
    field: 'originatingRequestReference',
    placeholder: 'e.g. REQ-2001'
  }));
  card.appendChild(selectInput({
    label: 'Scan type',
    field: 'scanType', required: true,
    options: [
      { value: 'fdg-pet-ct', label: 'FDG PET-CT' },
      { value: 'psma-pet', label: 'PSMA PET' },
      { value: 'dotatate-pet', label: 'DOTATATE PET' },
      { value: 'amyloid-pet', label: 'Amyloid PET' },
      { value: 'cardiac-pet', label: 'Cardiac PET' },
      { value: 'other', label: 'Other' }
    ]
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
    title: 'Clinical history and acquisition',
    description: 'The clinical question, acquisition data, and examination adequacy.'
  });

  card.appendChild(textArea({
    label: 'Clinical history',
    field: 'clinicalHistory', rows: 3,
    placeholder: 'Clinical history and the question the examination was performed to answer…'
  }));
  card.appendChild(numberInput({
    label: 'Pre-injection blood glucose (mmol/L)',
    field: 'bloodGlucoseMmolL',
    min: 0, max: 60, step: 0.1,
    hint: 'FDG uptake quality depends on glucose control, typically below 11 mmol/L.'
  }));
  card.appendChild(numberInput({
    label: 'Injected activity (MBq)',
    field: 'injectedActivityMbq',
    min: 0, max: 100000, step: 0.1,
    hint: 'Administered radiopharmaceutical activity for IR(ME)R dose audit.'
  }));
  card.appendChild(selectInput({
    label: 'Examination adequacy',
    field: 'examinationAdequacy',
    options: [
      { value: 'adequate', label: 'Adequate' },
      { value: 'limited', label: 'Limited' },
      { value: 'non-diagnostic', label: 'Non-diagnostic' }
    ]
  }));

  card.appendChild(conditionalAlert({
    id: 'glucose-warning',
    type: 'warning',
    heading: 'Elevated blood glucose',
    message: 'Pre-injection blood glucose is 11 mmol/L or higher; FDG uptake quality may be reduced. Document the level and consider its effect on interpretation.'
  }));
  card.appendChild(conditionalAlert({
    id: 'adequacy-warning',
    type: 'warning',
    heading: 'Reduced diagnostic quality',
    message: 'A limited or non-diagnostic examination reduces diagnostic confidence. A non-diagnostic study classifies the result as inconclusive; a limited study with no impression does too.'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Findings',
    description: 'The narrative metabolic findings plus structured finding flags.'
  });

  card.appendChild(textArea({
    label: 'Findings narrative',
    field: 'findingsNarrative', rows: 5,
    placeholder: 'Narrative description of the metabolic and CT findings (the body of the report)…'
  }));

  card.appendChild(checkboxGroup({
    label: 'Structured findings',
    items: [
      { field: 'hypermetabolicLesion', label: 'Hypermetabolic lesion' },
      { field: 'nodalUptake', label: 'Nodal uptake' },
      { field: 'distantMetastasis', label: 'Distant metastasis' },
      { field: 'noAbnormalUptake', label: 'No abnormal uptake' },
      { field: 'physiologicalUptakeOnly', label: 'Physiological uptake only' },
      { field: 'incidentalFinding', label: 'Incidental finding' }
    ]
  }));

  card.appendChild(conditionalAlert({
    id: 'critical-finding-alert',
    type: 'error',
    heading: 'Critical finding selected',
    message: 'Distant metastasis auto-escalates the follow-up urgency to a critical alert. Ensure the result is communicated to the referrer on sign-off.'
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Measurements and comparison',
    description: 'Key metabolic measurements, comparison, and treatment response.'
  });

  card.appendChild(numberInput({
    label: 'SUVmax',
    field: 'suvMax',
    min: 0, max: 1000, step: 0.1,
    hint: 'Maximum standardised uptake value of the most-avid reference lesion. 10 or greater grades the severity major.'
  }));
  card.appendChild(numberInput({
    label: 'Largest lesion size (mm)',
    field: 'largestLesionSizeMm',
    min: 0, max: 2000, step: 0.1,
    hint: 'Largest lesion long-axis size, for surveillance and categorisation.'
  }));
  card.appendChild(textArea({
    label: 'Comparison with previous imaging',
    field: 'comparisonWithPrevious', rows: 3,
    placeholder: 'Relevant previous PET-CT or other studies and metabolic changes since…'
  }));
  card.appendChild(selectInput({
    label: 'Treatment response',
    field: 'treatmentResponse',
    hint: 'Metabolic response category (maps onto PERCIST).',
    options: [
      { value: 'complete', label: 'Complete metabolic response' },
      { value: 'partial', label: 'Partial metabolic response' },
      { value: 'stable', label: 'Stable metabolic disease' },
      { value: 'progressive', label: 'Progressive metabolic disease' },
      { value: 'not-applicable', label: 'Not applicable' }
    ]
  }));

  card.appendChild(conditionalAlert({
    id: 'progressive-alert',
    type: 'error',
    heading: 'Progressive metabolic disease',
    message: 'A progressive treatment response auto-escalates the follow-up urgency to a critical alert. Ensure the result is communicated to the referrer on sign-off.'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Impression and structured reporting',
    description: 'The summary impression, the structured-reporting category, and recommended follow-up.'
  });

  card.appendChild(textArea({
    label: 'Impression',
    field: 'impression', rows: 4, required: true,
    placeholder: 'Summary impression / conclusion answering the clinical question…'
  }));
  card.appendChild(textInput({
    label: 'Reporting category',
    field: 'reportingCategory',
    hint: 'Structured-reporting label, e.g. a Deauville score 1-5 (lymphoma) or a PERCIST response category (solid tumours).',
    placeholder: 'e.g. Deauville 4 or PERCIST PMR'
  }));
  card.appendChild(textArea({
    label: 'Recommended follow-up',
    field: 'recommendedFollowUp', rows: 3,
    placeholder: 'Recommended follow-up imaging, referral, or management…'
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Critical-result communication',
    description: 'Record whether a critical or unexpected significant result was communicated to the referrer.'
  });

  card.appendChild(conditionalAlert({
    id: 'critical-communication-alert',
    type: 'error',
    heading: 'Critical-result alert',
    message: 'This report contains a critical finding (distant metastasis or progressive disease). Communicate the result directly to the referrer and record it below.'
  }));

  card.appendChild(checkboxField({
    label: 'Critical / urgent result communicated to referrer',
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
    message: 'This report contains a critical finding. Communicate the result directly to the referrer and record it before signing.'
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
    'glucose-warning':
      state.bloodGlucoseMmolL !== null && state.bloodGlucoseMmolL >= 11,
    'adequacy-warning':
      state.examinationAdequacy === 'limited' ||
      state.examinationAdequacy === 'non-diagnostic',
    'critical-finding-alert': state.distantMetastasis,
    'progressive-alert': state.treatmentResponse === 'progressive',
    'critical-communication-alert':
      hasCriticalFinding(state) && !state.criticalResultCommunicated,
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
// counts only when ticked; a numeric counts when non-null). This lets the
// checkbox-only findings slot count as answered once any structured finding
// is recorded.
const STEP_SLOTS = {
  1: [['reportingClinician'], ['originatingRequestReference'], ['scanType'],
      ['reportStatus'], ['performedDate'], ['reportedDate']],
  2: [['clinicalHistory'], ['bloodGlucoseMmolL'], ['injectedActivityMbq'],
      ['examinationAdequacy']],
  3: [['findingsNarrative'],
      ['hypermetabolicLesion', 'nodalUptake', 'distantMetastasis',
       'noAbnormalUptake', 'physiologicalUptakeOnly', 'incidentalFinding']],
  4: [['suvMax'], ['largestLesionSizeMm'], ['comparisonWithPrevious'],
      ['treatmentResponse']],
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const g = lastResult;

  const detailRows = [
    ['Reporting clinician', state.reportingClinician || 'Not recorded'],
    ['Originating request', state.originatingRequestReference || 'Not recorded'],
    ['Scan type', scanTypeLabel(state.scanType)],
    ['Report status', reportStatusLabel(state.reportStatus)],
    ['Performed date', state.performedDate || 'Not recorded'],
    ['Reported date', state.reportedDate || 'Not recorded'],
    ['Examination adequacy', examinationAdequacyLabel(state.examinationAdequacy)],
    ['Pre-injection blood glucose',
      state.bloodGlucoseMmolL === null ? 'Not recorded' : `${state.bloodGlucoseMmolL} mmol/L`],
    ['Injected activity',
      state.injectedActivityMbq === null ? 'Not recorded' : `${state.injectedActivityMbq} MBq`],
    ['SUVmax',
      state.suvMax === null ? 'Not recorded' : String(state.suvMax)],
    ['Largest lesion size',
      state.largestLesionSizeMm === null ? 'Not recorded' : `${state.largestLesionSizeMm} mm`],
    ['Treatment response', treatmentResponseLabel(state.treatmentResponse)],
    ['Critical result communicated', state.criticalResultCommunicated ? 'Yes' : 'No'],
    ['Reported to', state.reportedTo || 'Not recorded'],
    ['Signed', state.signed ? 'Yes' : 'No']
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
        <h2>PET Scan Test Report</h2>
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
  { step: 2, title: 'Acquisition' },
  { step: 3, title: 'Findings' },
  { step: 4, title: 'Measurements' },
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
