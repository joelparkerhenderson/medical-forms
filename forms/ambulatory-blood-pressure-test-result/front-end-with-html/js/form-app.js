import { calculateGrade } from './grader.js';
import { severeByAverages } from './rules.js';
import { abnormalitySeverityClass, abnormalitySeverityLabel, emptyResult, followUpUrgencyClass, followUpUrgencyLabel, priorityLabel, recommendationLabel, resultClassificationClass, resultClassificationLabel } from './types.js';

// Ambulatory Blood Pressure (ABPM) Test Result — report-entry wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// four-axis interpretation preview (classification, severity, completeness,
// follow-up urgency) updates as the report is edited. Submission runs the
// pure grading engine and renders an inline graded report with the fired-rule
// audit trail and safety flags. State is persisted to localStorage so a
// partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'ambulatory-blood-pressure-test-result.front-end-with-html.v1';

/** @returns {import('./types.js').AmbulatoryBloodPressureResult} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  // Merge over a fresh empty so any newly-added fields default correctly.
  const fresh = emptyResult();

  if (parsed && typeof parsed === 'object') {
    for (const key of Object.keys(fresh)) {
      if (Object.prototype.hasOwnProperty.call(parsed, key)) {
        fresh[key] = parsed[key];
      }
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

/** @param {import('./types.js').AmbulatoryBloodPressureResult} state */
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

/** @type {import('./types.js').AmbulatoryBloodPressureResult} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'ambulatory-blood-pressure-test-result',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const _rep = document.getElementById('report');
    if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the graded report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    refreshLivePreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 7;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a field on the (flat) result state and persist. Re-runs progress and
 * the live four-axis preview after each change.
 *
 * @param {string} field
 * @param {*} value
 */
function setField(field, value) {
  state[field] = value;
  saveState(state);
  updateProgress();
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
// Component builders (Lily headless class names only)
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
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    let v = input.value;
    if (type === 'number') {
      v = v === '' ? null : Number(v);
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

/** A single boolean checkbox row. */
function checkboxInput(opts) {
  const id = opts.field;
  const checked = state[opts.field] === true;
  const wrapper = document.createElement('div');
  wrapper.className = 'check-field';
  wrapper.innerHTML = `
    <label class="checkbox-input" for="${id}">
      <input class="checkbox-input" type="checkbox" id="${id}" name="${id}"${checked ? ' checked' : ''}>
      <span>${esc(opts.text)}</span>
    </label>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('change', () => {
    setField(opts.field, input.checked);
  });
  return wrapper;
}

/** A labelled group of boolean checkboxes. */
function checkboxGroup(opts) {
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field radio-fieldset';
  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  wrapper.appendChild(legend);
  const list = document.createElement('div');
  list.className = 'checkbox-group';
  for (const item of opts.items) {
    list.appendChild(checkboxInput(item));
  }
  wrapper.appendChild(list);
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

/** A live alert region, shown/hidden by refreshLivePreview(). */
function liveAlert(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'alert';
  wrapper.id = opts.id;
  wrapper.setAttribute('data-type', opts.type || 'warning');
  wrapper.setAttribute('role', 'status');
  wrapper.setAttribute('aria-live', 'polite');
  wrapper.hidden = true;
  wrapper.innerHTML = `<strong>${esc(opts.heading)}</strong> ${esc(opts.message)}`;
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
// Section renderers (1 per report-entry step; field set mirrors the
// SvelteKit step components in src/lib/components/steps/)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Report identification',
    description: 'Who authored the report, the monitoring modality, the originating request, and key dates.'
  });

  card.appendChild(textInput({
    label: 'Reporting clinician',
    field: 'reportingClinician', required: true,
    placeholder: 'e.g. Dr A Clinician'
  }));
  card.appendChild(textInput({
    label: 'Originating request reference',
    field: 'originatingRequestReference',
    placeholder: 'e.g. REQ-2001'
  }));
  card.appendChild(selectInput({
    label: 'Monitoring type',
    field: 'monitoringType', required: true,
    options: [
      { value: '24-hour-abpm', label: '24-hour ABPM' },
      { value: 'home-blood-pressure-monitoring', label: 'Home BP monitoring' },
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
    title: 'Recording adequacy',
    description: 'Whether enough valid readings were captured for a diagnostic interpretation.'
  });

  card.appendChild(textInput({
    label: 'Valid readings (%)',
    field: 'validReadingsPercent',
    type: 'number', min: 0, max: 100, step: 0.1, unit: '%',
    hint: 'Percentage of successful readings over the monitoring period; ABPM is generally adequate at >= 70%.'
  }));
  card.appendChild(checkboxGroup({
    label: 'Recording adequate',
    items: [
      {
        field: 'recordingAdequate',
        text: 'Recording met the adequacy threshold for a diagnostic interpretation'
      }
    ]
  }));
  card.appendChild(liveAlert({
    id: 'inadequate-alert',
    type: 'warning',
    heading: 'Inadequate recording.',
    message: 'Fewer than 70% of readings were valid. Diagnostic confidence may be reduced; consider repeating the monitoring period.'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Clinical history',
    description: 'The clinical question and any comparison with previous monitoring.'
  });

  card.appendChild(textArea({
    label: 'Clinical history',
    field: 'clinicalHistory', rows: 3,
    placeholder: 'Clinical history and the question the monitoring was performed to answer…'
  }));
  card.appendChild(textArea({
    label: 'Comparison with previous monitoring',
    field: 'comparisonWithPrevious', rows: 3,
    placeholder: 'Relevant previous ambulatory or home monitoring studies and changes since…'
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Average blood pressures',
    description: 'The daytime, nighttime, and 24-hour averaged blood pressures (mmHg). Daytime average >= 135/85 confirms hypertension; an ABPM average >= 150/95 is severe.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Daytime average systolic',
    field: 'daytimeAverageSystolic',
    type: 'number', min: 50, max: 300, step: 0.1, unit: 'mmHg'
  }));
  grid.appendChild(textInput({
    label: 'Daytime average diastolic',
    field: 'daytimeAverageDiastolic',
    type: 'number', min: 20, max: 200, step: 0.1, unit: 'mmHg'
  }));
  grid.appendChild(textInput({
    label: 'Nighttime average systolic',
    field: 'nighttimeAverageSystolic',
    type: 'number', min: 50, max: 300, step: 0.1, unit: 'mmHg'
  }));
  grid.appendChild(textInput({
    label: 'Nighttime average diastolic',
    field: 'nighttimeAverageDiastolic',
    type: 'number', min: 20, max: 200, step: 0.1, unit: 'mmHg'
  }));
  grid.appendChild(textInput({
    label: '24-hour average systolic',
    field: 'twentyFourHourAverageSystolic',
    type: 'number', min: 50, max: 300, step: 0.1, unit: 'mmHg'
  }));
  grid.appendChild(textInput({
    label: '24-hour average diastolic',
    field: 'twentyFourHourAverageDiastolic',
    type: 'number', min: 20, max: 200, step: 0.1, unit: 'mmHg'
  }));
  card.appendChild(grid);

  card.appendChild(liveAlert({
    id: 'severe-alert',
    type: 'error',
    heading: 'Severe hypertension.',
    message: 'An average at or above 150/95 mmHg (equivalent to clinic >= 180/120) auto-escalates the follow-up urgency to a critical alert. Arrange same-day specialist review and communicate the result to the referrer on sign-off.'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Nocturnal dipping and findings',
    description: 'The nocturnal dipping pattern plus the narrative findings and structured interpretation.'
  });

  card.appendChild(textInput({
    label: 'Nocturnal dip (%)',
    field: 'nocturnalDipPercent',
    type: 'number', min: -100, max: 100, step: 0.1, unit: '%',
    hint: 'Percentage fall in average systolic BP from daytime to nighttime.'
  }));
  card.appendChild(selectInput({
    label: 'Dipper status',
    field: 'dipperStatus',
    options: [
      { value: 'dipper', label: 'Dipper (10–20% fall)' },
      { value: 'non-dipper', label: 'Non-dipper (0–10% fall)' },
      { value: 'reverse-dipper', label: 'Reverse-dipper (nighttime rise)' },
      { value: 'extreme-dipper', label: 'Extreme-dipper (>20% fall)' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Findings narrative',
    field: 'findingsNarrative', rows: 4,
    placeholder: 'Narrative description of the monitoring findings (the body of the report)…'
  }));
  card.appendChild(checkboxGroup({
    label: 'Structured interpretation',
    items: [
      { field: 'hypertensionConfirmed', text: 'Hypertension confirmed' },
      { field: 'whiteCoatEffect', text: 'White-coat effect' },
      { field: 'maskedHypertension', text: 'Masked hypertension' },
      { field: 'severeHypertension', text: 'Severe hypertension' },
      { field: 'nocturnalHypertension', text: 'Nocturnal hypertension' },
      { field: 'normalStudy', text: 'Normal study' }
    ]
  }));
  card.appendChild(liveAlert({
    id: 'severe-selected-alert',
    type: 'error',
    heading: 'Severe hypertension selected.',
    message: 'Severe hypertension auto-escalates the follow-up urgency to a critical alert. Ensure the result is communicated to the referrer on sign-off.'
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
    placeholder: 'Recommended follow-up, treatment change, or referral…'
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Interpretation and sign-off',
    description: 'Live four-axis interpretation grade, critical-result communication, and sign-off.'
  });

  card.appendChild(liveAlert({
    id: 'critical-alert',
    type: 'error',
    heading: 'Critical-result alert.',
    message: 'This report contains a severe-hypertension result. Communicate the result directly to the referrer and record it below before signing.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Live four-axis interpretation grade',
    id: 'live-grade-readout',
    render: () => renderLiveGrade()
  }));

  card.appendChild(checkboxGroup({
    label: 'Critical-result communication',
    items: [
      {
        field: 'criticalResultCommunicated',
        text: 'Critical / urgent result communicated to referrer'
      }
    ]
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
  card.appendChild(checkboxGroup({
    label: 'Sign-off',
    items: [
      { field: 'signed', text: 'I sign and authorise this report' }
    ]
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the live four-axis grade preview grid for step 7. */
function renderLiveGrade() {
  const g = calculateGrade(state);
  const badge = (label, cls) =>
    `<span class="risk-badge ${cls}">${esc(label)}</span>`;
  return `
    <div class="score-grid">
      <div class="score-card">
        <span class="score-label">Axis A — Classification</span>
        <span class="score-value">${badge(resultClassificationLabel(g.resultClassification), resultClassificationClass(g.resultClassification))}</span>
      </div>
      <div class="score-card">
        <span class="score-label">Axis B — Severity</span>
        <span class="score-value">${badge(abnormalitySeverityLabel(g.abnormalitySeverity), abnormalitySeverityClass(g.abnormalitySeverity))}
          <span class="muted">${esc(g.reportingCategory)}</span></span>
      </div>
      <div class="score-card">
        <span class="score-label">Axis C — Completeness</span>
        <span class="score-value"><strong>${g.reportCompletenessPercent}%</strong></span>
      </div>
      <div class="score-card">
        <span class="score-label">Axis D — Follow-up urgency</span>
        <span class="score-value">${badge(followUpUrgencyLabel(g.followUpUrgency), followUpUrgencyClass(g.followUpUrgency))}
          <span class="muted">${esc(g.targetTimeframe)}</span></span>
      </div>
    </div>
  `;
}

/** Refresh the live preview readout and the conditional live alerts. */
function refreshLivePreview() {
  const live = document.getElementById('live-grade-readout');
  if (live) live.innerHTML = renderLiveGrade();

  const grade = calculateGrade(state);

  const inadequate = document.getElementById('inadequate-alert');
  if (inadequate) {
    inadequate.hidden = !(
      !state.recordingAdequate &&
      state.validReadingsPercent !== null &&
      state.validReadingsPercent < 70
    );
  }

  const severe = document.getElementById('severe-alert');
  if (severe) severe.hidden = !severeByAverages(state);

  const severeSelected = document.getElementById('severe-selected-alert');
  if (severeSelected) severeSelected.hidden = !state.severeHypertension;

  const critical = document.getElementById('critical-alert');
  if (critical) critical.hidden = grade.followUpUrgency !== 'critical-alert';
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered. Paired
// systolic/diastolic averages count as one slot each pair, and the structured
// interpretation checkboxes count as a single slot.
const STEP_SLOTS = {
  1: [
    ['reportingClinician'],
    ['originatingRequestReference'],
    ['monitoringType'],
    ['reportStatus'],
    ['performedDate'],
    ['reportedDate']
  ],
  2: [['validReadingsPercent', 'recordingAdequate']],
  3: [['clinicalHistory'], ['comparisonWithPrevious']],
  4: [
    ['daytimeAverageSystolic', 'daytimeAverageDiastolic'],
    ['nighttimeAverageSystolic', 'nighttimeAverageDiastolic'],
    ['twentyFourHourAverageSystolic', 'twentyFourHourAverageDiastolic']
  ],
  5: [
    ['nocturnalDipPercent'],
    ['dipperStatus'],
    ['findingsNarrative'],
    [
      'hypertensionConfirmed', 'whiteCoatEffect', 'maskedHypertension',
      'severeHypertension', 'nocturnalHypertension', 'normalStudy'
    ]
  ],
  6: [['impression'], ['recommendedFollowUp']],
  7: [['reportedTo'], ['clinicianNotes'], ['signed']]
};

function isAnswered(field) {
  const v = state[field];
  if (typeof v === 'boolean') return v === true;
  return v !== null && v !== undefined && v !== '';
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

function axisRowsHtml(g) {
  const badge = (label, cls) =>
    `<span class="risk-badge ${cls}">${esc(label)}</span>`;
  return `
    <div class="score-grid">
      <div class="score-card">
        <span class="score-label">Axis A — Classification</span>
        <span class="score-value">${badge(resultClassificationLabel(g.resultClassification), resultClassificationClass(g.resultClassification))}</span>
      </div>
      <div class="score-card">
        <span class="score-label">Axis B — Severity</span>
        <span class="score-value">${badge(abnormalitySeverityLabel(g.abnormalitySeverity), abnormalitySeverityClass(g.abnormalitySeverity))}
          <span class="muted">${esc(g.reportingCategory)}</span></span>
      </div>
      <div class="score-card">
        <span class="score-label">Axis C — Completeness</span>
        <span class="score-value"><strong>${g.reportCompletenessPercent}%</strong></span>
      </div>
      <div class="score-card">
        <span class="score-label">Axis D — Follow-up urgency</span>
        <span class="score-value">${badge(followUpUrgencyLabel(g.followUpUrgency), followUpUrgencyClass(g.followUpUrgency))}
          <span class="muted">${esc(g.targetTimeframe)}</span></span>
      </div>
    </div>
  `;
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const g = lastResult;

  const rulesRows = g.firedRules.map((r) => `
    <tr>
      <th scope="row"><code>${esc(r.ruleId)}</code></th>
      <td>${esc(r.axis)}</td>
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

  const bannerClass = resultClassificationClass(g.resultClassification) || 'risk-medium';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>ABPM Test Result — Graded Report</h2>
        <p class="muted">Graded ${esc(new Date(g.gradedAt).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${bannerClass}">
        <div>
          <span class="risk-banner-label">Result classification</span>
          <span class="risk-banner-value">${esc(resultClassificationLabel(g.resultClassification))}</span>
        </div>
        <span class="risk-badge ${followUpUrgencyClass(g.followUpUrgency)}">${esc(followUpUrgencyLabel(g.followUpUrgency))}</span>
      </div>

      <h3>Four-axis interpretation grade</h3>
      ${axisRowsHtml(g)}

      <h3>Recommendation</h3>
      <p>
        <strong>${esc(recommendationLabel(g.recommendation))}</strong>
        (target timeframe: ${esc(g.targetTimeframe)}) — ${esc(g.recommendedAction)}
      </p>

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
        <tbody>${rulesRows}</tbody>
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
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the graded report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  refreshLivePreview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, title: 'Identification' },
  { step: 2, title: 'Adequacy' },
  { step: 3, title: 'History' },
  { step: 4, title: 'Averages' },
  { step: 5, title: 'Dipping' },
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
  refreshLivePreview();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
