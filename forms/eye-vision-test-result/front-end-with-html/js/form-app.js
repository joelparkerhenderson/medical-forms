import { calculateGrade } from './grader.js';
import { ACUTE_IOP_MMHG, RAISED_IOP_MMHG, hasAcuteRaisedIop, hasCriticalFinding } from './rules.js';
import { abnormalitySeverityClass, abnormalitySeverityLabel, emptyResult, followUpUrgencyClass, followUpUrgencyLabel, priorityLabel, recommendationLabel, reportStatusLabel, resultClassificationClass, resultClassificationLabel, retinopathyGradeLabel, testTypeLabel, visualFieldResultLabel } from './types.js';

// Eye Vision Test Result — reporting-clinician wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The reporting clinician scrolls through them; a sticky
// top-of-page progress summary reflects how many fields have been answered
// and a live four-axis interpretation preview updates as the report is
// edited. Submission runs the pure grading engine (Axis A classification,
// Axis B severity, Axis C completeness, Axis D follow-up urgency, overall
// recommendation, fired-rule audit trail, and safety flags) and renders an
// inline structured ophthalmic report. State is persisted to localStorage so
// a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'eye-vision-test-result.front-end-with-html.v1';

/** @returns {import('./types.js').EyeVisionResult} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  // Merge over a fresh empty so any newly-added fields default correctly.
  // The intraocular-pressure measurements default to null (not measured)
  // and accept a stored number; other fields must match the default's type.
  const fresh = emptyResult();

  for (const key of Object.keys(fresh)) {
    if (!parsed || !(key in parsed)) continue;
    const value = parsed[key];
    if (fresh[key] === null) {
      if (value === null || typeof value === 'number') fresh[key] = value;
    } else if (typeof value === typeof fresh[key]) {
      fresh[key] = value;
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

/** @param {import('./types.js').EyeVisionResult} state */
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

/** @type {import('./types.js').EyeVisionResult} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'eye-vision-test-result',
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
 * Numeric input bound to a `number | null` field. An empty input stores
 * `null` (not measured); any finite parsed number is stored as a number.
 */
function numberInput(opts) {
  const id = opts.field;
  const value = state[opts.field];
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="number"`,
    `class="number-input"`,
    `inputmode="decimal"`,
    `value="${value === null || value === undefined ? '' : esc(String(value))}"`,
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
    const num = raw === '' ? null : Number(raw);
    setField(opts.field, num !== null && Number.isFinite(num) ? num : null);
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
    description: 'Who authored the report, the originating request, the performed test type, and key dates.'
  });

  card.appendChild(textInput({
    label: 'Reporting clinician',
    field: 'reportingClinician', required: true,
    placeholder: 'e.g. Dr A Ophthalmologist'
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
  card.appendChild(selectInput({
    label: 'Test type',
    field: 'testType', required: true,
    options: [
      { value: 'visual-acuity', label: 'Visual acuity' },
      { value: 'visual-fields', label: 'Visual fields' },
      { value: 'refraction', label: 'Refraction' },
      { value: 'fundus-examination', label: 'Fundus examination' },
      { value: 'optical-coherence-tomography', label: 'Optical coherence tomography' },
      { value: 'fluorescein-angiography', label: 'Fluorescein angiography' },
      { value: 'tonometry', label: 'Tonometry' },
      { value: 'slit-lamp', label: 'Slit-lamp examination' },
      { value: 'orthoptic-assessment', label: 'Orthoptic assessment' },
      { value: 'other', label: 'Other' }
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
    title: 'Clinical history',
    description: 'The clinical question the examination was performed to answer.'
  });

  card.appendChild(textArea({
    label: 'Clinical history',
    field: 'clinicalHistory', rows: 4,
    placeholder: 'Clinical history and the question the examination was performed to answer…'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Measurements',
    description: `Visual acuity, intraocular pressure (NICE NG81 referral threshold ${RAISED_IOP_MMHG} mmHg), and visual fields.`
  });

  card.appendChild(textInput({
    label: 'Visual acuity — right',
    field: 'visualAcuityRight',
    placeholder: 'e.g. 6/6, 6/9, CF, HM'
  }));
  card.appendChild(textInput({
    label: 'Visual acuity — left',
    field: 'visualAcuityLeft',
    placeholder: 'e.g. 6/6, 6/9, CF, HM'
  }));
  card.appendChild(numberInput({
    label: 'Intraocular pressure — right (mmHg)',
    field: 'intraocularPressureRightMmhg',
    min: 0, max: 100, step: 0.1
  }));
  card.appendChild(numberInput({
    label: 'Intraocular pressure — left (mmHg)',
    field: 'intraocularPressureLeftMmhg',
    min: 0, max: 100, step: 0.1
  }));
  card.appendChild(selectInput({
    label: 'Visual-field result',
    field: 'visualFieldResult',
    options: [
      { value: 'full', label: 'Full fields' },
      { value: 'defect-right', label: 'Defect — right' },
      { value: 'defect-left', label: 'Defect — left' },
      { value: 'bilateral-defect', label: 'Bilateral defect' }
    ]
  }));

  card.appendChild(conditionalAlert({
    id: 'acute-iop-alert',
    type: 'error',
    heading: 'Acutely raised intraocular pressure',
    message: `An intraocular pressure of ${ACUTE_IOP_MMHG} mmHg or above auto-escalates the follow-up urgency to a critical alert. Consider acute angle-closure glaucoma and arrange urgent ophthalmology review.`
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Findings',
    description: 'The narrative findings, the structured finding flags, and the retinopathy grade.'
  });

  card.appendChild(textArea({
    label: 'Findings narrative',
    field: 'findingsNarrative', rows: 5,
    placeholder: 'Narrative description of the examination findings (the body of the report)…'
  }));

  card.appendChild(checkboxGroup({
    label: 'Structured findings',
    items: [
      { field: 'reducedVisualAcuity', label: 'Reduced visual acuity' },
      { field: 'visualFieldDefect', label: 'Visual-field defect' },
      { field: 'raisedIntraocularPressure', label: 'Raised intraocular pressure' },
      { field: 'diabeticRetinopathy', label: 'Diabetic retinopathy' },
      { field: 'opticDiscAbnormality', label: 'Optic-disc abnormality' },
      { field: 'macularAbnormality', label: 'Macular abnormality' },
      { field: 'normalExamination', label: 'Normal examination' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Diabetic-retinopathy grade',
    field: 'retinopathyGrade',
    hint: 'NHS Diabetic Eye Screening Programme grade.',
    options: [
      { value: 'none', label: 'None (R0)' },
      { value: 'background', label: 'Background (R1)' },
      { value: 'pre-proliferative', label: 'Pre-proliferative (R2)' },
      { value: 'proliferative', label: 'Proliferative (R3)' },
      { value: 'maculopathy', label: 'Maculopathy (M1)' },
      { value: 'not-applicable', label: 'Not applicable' }
    ]
  }));

  card.appendChild(conditionalAlert({
    id: 'critical-finding-alert',
    type: 'error',
    heading: 'Critical finding selected',
    message: 'Proliferative diabetic retinopathy, or reduced acuity together with an optic-disc abnormality, auto-escalates the follow-up urgency to a critical alert. Ensure the result is communicated to the referrer on sign-off.'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Impression',
    description: 'The summary impression, structured reporting category, and recommended follow-up.'
  });

  card.appendChild(textArea({
    label: 'Impression',
    field: 'impression', rows: 4, required: true,
    placeholder: 'Summary impression / conclusion answering the clinical question…'
  }));
  card.appendChild(textInput({
    label: 'Reporting category',
    field: 'reportingCategory',
    hint: 'Structured-reporting label, e.g. an NHS diabetic eye screening grade such as R2M1.',
    placeholder: 'e.g. R2M1'
  }));
  card.appendChild(textArea({
    label: 'Recommended follow-up',
    field: 'recommendedFollowUp', rows: 3,
    placeholder: 'Recommended follow-up examination, referral, or management…'
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Critical-result communication',
    description: 'Record whether any critical or unexpected significant result was communicated.'
  });

  card.appendChild(conditionalAlert({
    id: 'critical-comm-alert',
    type: 'warning',
    heading: 'Critical result not yet communicated',
    message: 'This report contains a critical finding that has not been recorded as communicated. Contact the referrer and record who was informed below.'
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
    'acute-iop-alert': hasAcuteRaisedIop(state),
    'critical-finding-alert':
      state.retinopathyGrade === 'proliferative' ||
      (state.reducedVisualAcuity && state.opticDiscAbnormality),
    'critical-comm-alert':
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
// counts only when ticked; a numeric field counts when non-null). This lets
// the checkbox-only steps count as answered once any structured finding is
// recorded, and the paired intraocular-pressure measurements count as one
// slot.
const STEP_SLOTS = {
  1: [['reportingClinician'], ['originatingRequestReference'], ['reportStatus'],
      ['testType'], ['performedDate'], ['reportedDate']],
  2: [['clinicalHistory']],
  3: [['visualAcuityRight'], ['visualAcuityLeft'],
      ['intraocularPressureRightMmhg', 'intraocularPressureLeftMmhg'],
      ['visualFieldResult']],
  4: [['findingsNarrative'],
      ['reducedVisualAcuity', 'visualFieldDefect', 'raisedIntraocularPressure',
       'diabeticRetinopathy', 'opticDiscAbnormality', 'macularAbnormality',
       'normalExamination'],
      ['retinopathyGrade']],
  5: [['impression'], ['reportingCategory'], ['recommendedFollowUp']],
  6: [['criticalResultCommunicated'], ['reportedTo']],
  7: [['clinicianNotes'], ['signed']]
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const g = lastResult;

  const mmhg = (v) => (v === null || v === undefined ? 'Not recorded' : `${v} mmHg`);

  const detailRows = [
    ['Reporting clinician', state.reportingClinician || 'Not recorded'],
    ['Originating request', state.originatingRequestReference || 'Not recorded'],
    ['Test type', testTypeLabel(state.testType)],
    ['Report status', reportStatusLabel(state.reportStatus)],
    ['Performed date', state.performedDate || 'Not recorded'],
    ['Reported date', state.reportedDate || 'Not recorded'],
    ['Visual acuity — right', state.visualAcuityRight || 'Not recorded'],
    ['Visual acuity — left', state.visualAcuityLeft || 'Not recorded'],
    ['Intraocular pressure — right', mmhg(state.intraocularPressureRightMmhg)],
    ['Intraocular pressure — left', mmhg(state.intraocularPressureLeftMmhg)],
    ['Visual-field result', visualFieldResultLabel(state.visualFieldResult)],
    ['Diabetic-retinopathy grade', retinopathyGradeLabel(state.retinopathyGrade)],
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
        <h2>Eye Vision Test Report</h2>
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
  { step: 2, title: 'History' },
  { step: 3, title: 'Measurements' },
  { step: 4, title: 'Findings' },
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
