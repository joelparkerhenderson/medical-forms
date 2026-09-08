import { calculateGrade } from './grader.js';
import { abnormalitySeverityClass, abnormalitySeverityLabel, emptyResult, followUpUrgencyClass, followUpUrgencyLabel, priorityLabel, recommendationLabel, resultClassificationClass, resultClassificationLabel } from './types.js';

// Angiography Test Result — report-entry wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The reporting clinician scrolls through them; a sticky
// top-of-page progress summary reflects how many fields have been answered and
// a live four-axis interpretation preview updates as the report is edited.
// Submission runs the pure grading engine (Axis A classification, Axis B
// severity + reporting category, Axis C completeness, Axis D follow-up
// urgency, overall recommendation, fired-rule audit trail, and safety flags)
// and renders an inline report. State is persisted to localStorage so a
// partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'angiography-test-result.front-end-with-html.v1';

/** @returns {import('./types.js').AngiographyResult} */
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

/** @param {import('./types.js').AngiographyResult} state */
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

/** @type {import('./types.js').AngiographyResult} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'angiography-test-result',
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
 * conditional visibility, and the live four-axis preview after each change.
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
// Component builders (Lily HTML headless contract)
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

/**
 * A group of independent boolean checkboxes (Lily `.checkbox-group` of
 * `.checkbox-input`s), each bound to one boolean field on the state.
 *
 * @param {{ label: string, options: { field: string, label: string }[] }} opts
 */
function checkboxGroup(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const groupLabel = document.createElement('span');
  groupLabel.className = 'label';
  groupLabel.textContent = opts.label;
  wrapper.appendChild(groupLabel);

  const group = document.createElement('div');
  group.className = 'checkbox-group';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', opts.label);

  for (const option of opts.options) {
    const id = option.field;
    const label = document.createElement('label');
    label.htmlFor = id;
    label.innerHTML = `
      <input class="checkbox-input" type="checkbox" id="${id}" name="${id}"${state[option.field] ? ' checked' : ''}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      setField(option.field, input.checked);
    });
    group.appendChild(label);
  }
  wrapper.appendChild(group);
  return wrapper;
}

/**
 * A conditional inline alert (Lily `.alert`), shown only while
 * `opts.visible()` is true. Re-evaluated by updateConditionalAlerts().
 */
function conditionalAlert(opts) {
  const alert = document.createElement('div');
  alert.className = 'alert';
  alert.dataset.type = opts.type || 'error';
  alert.id = opts.id;
  alert.setAttribute('role', 'alert');
  alert.innerHTML = `<strong>${esc(opts.heading)}</strong> ${esc(opts.message)}`;
  alert.hidden = true;
  conditionalAlerts.push({ el: alert, visible: opts.visible });
  return alert;
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
// Section renderers (one per report-entry step, mirroring the SvelteKit
// step components Step1ReportIdentification … Step7InterpretationSignOff)
// ----------------------------------------------------------------------

/** @type {{ el: HTMLElement, visible: () => boolean }[]} */
const conditionalAlerts = [];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Report Identification',
    description: 'Who authored the report, the originating request, and key dates.'
  });

  card.appendChild(textInput({
    label: 'Reporting clinician',
    field: 'reportingClinician', required: true,
    placeholder: 'e.g. Dr A Radiologist'
  }));
  card.appendChild(textInput({
    label: 'Originating request reference',
    field: 'originatingRequestReference',
    placeholder: 'e.g. REQ-1001'
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
    title: 'Examination Details',
    description: 'The performed examination, modality, contrast, and adequacy.'
  });

  card.appendChild(selectInput({
    label: 'Angiography type',
    field: 'angiographyType', required: true,
    options: [
      { value: 'ct-angiography', label: 'CT angiography (CTA)' },
      { value: 'mr-angiography', label: 'MR angiography (MRA)' },
      { value: 'catheter-dsa', label: 'Catheter / DSA' },
      { value: 'coronary-angiography', label: 'Coronary angiography' },
      { value: 'peripheral-angiography', label: 'Peripheral angiography' },
      { value: 'cerebral-angiography', label: 'Cerebral angiography' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Body region',
    field: 'bodyRegion', required: true,
    options: [
      { value: 'coronary', label: 'Coronary' },
      { value: 'cerebral', label: 'Cerebral' },
      { value: 'carotid', label: 'Carotid' },
      { value: 'aorta', label: 'Aorta' },
      { value: 'renal', label: 'Renal' },
      { value: 'peripheral-lower-limb', label: 'Peripheral lower limb' },
      { value: 'pulmonary', label: 'Pulmonary' },
      { value: 'mesenteric', label: 'Mesenteric' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Contrast used',
    field: 'contrastUsed',
    options: [
      { value: 'iodinated', label: 'Iodinated' },
      { value: 'gadolinium', label: 'Gadolinium' },
      { value: 'none', label: 'None' }
    ]
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

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Clinical History',
    description: 'The clinical question and any comparison with previous imaging.'
  });

  card.appendChild(textArea({
    label: 'Clinical history',
    field: 'clinicalHistory', rows: 3,
    placeholder: 'Clinical history and the question the examination was performed to answer…'
  }));
  card.appendChild(textArea({
    label: 'Comparison with previous imaging',
    field: 'comparisonWithPrevious', rows: 3,
    placeholder: 'Relevant previous studies and changes since…'
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Findings',
    description: 'The narrative findings plus structured vascular finding flags.'
  });

  card.appendChild(textArea({
    label: 'Findings narrative',
    field: 'findingsNarrative', rows: 5,
    placeholder: 'Narrative description of the angiographic findings (the body of the report)…'
  }));
  card.appendChild(checkboxGroup({
    label: 'Structured findings',
    options: [
      { field: 'significantStenosis', label: 'Significant stenosis' },
      { field: 'occlusion', label: 'Occlusion' },
      { field: 'aneurysm', label: 'Aneurysm' },
      { field: 'dissection', label: 'Dissection' },
      { field: 'activeExtravasation', label: 'Active extravasation' },
      { field: 'thrombus', label: 'Thrombus' },
      { field: 'normalVessels', label: 'Normal vessels' },
      { field: 'incidentalFinding', label: 'Incidental finding' }
    ]
  }));
  card.appendChild(conditionalAlert({
    id: 'critical-finding-alert',
    type: 'error',
    heading: 'Critical finding selected.',
    message:
      'Active extravasation, dissection, or occlusion auto-escalates the follow-up urgency to a critical alert. Ensure the result is communicated to the referrer on sign-off.',
    visible: () => state.activeExtravasation || state.dissection || state.occlusion
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Measurements',
    description: 'Maximum stenosis and whether an intervention was performed.'
  });

  card.appendChild(textInput({
    label: 'Maximum stenosis (%)',
    field: 'maxStenosisPercent',
    type: 'number', min: 0, max: 100, step: 0.1, unit: '%',
    hint: 'Maximum arterial luminal stenosis (0–100), e.g. NASCET-style diameter reduction.'
  }));
  card.appendChild(checkboxGroup({
    label: 'Intervention performed',
    options: [
      {
        field: 'interventionPerformed',
        label: 'Intervention performed during the study (angioplasty, stent, embolisation)'
      }
    ]
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
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
    placeholder: 'e.g. 70-99%',
    hint: 'Structured stenosis-severity category, e.g. <50% / 50-69% / 70-99% / near-occlusion / occluded.'
  }));
  card.appendChild(textArea({
    label: 'Recommended follow-up',
    field: 'recommendedFollowUp', rows: 3,
    placeholder: 'Recommended follow-up imaging, referral, or management…'
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Interpretation & Sign-off',
    description: 'Live four-axis interpretation grade, critical-result communication, and sign-off.'
  });

  card.appendChild(conditionalAlert({
    id: 'critical-result-alert',
    type: 'error',
    heading: 'Critical-result alert.',
    message:
      'This report contains a critical finding. Communicate the result directly to the referrer and record it below before signing.',
    visible: () => calculateGrade(state).followUpUrgency === 'critical-alert'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Axis A — Classification',
    id: 'axis-a-readout',
    render: () => renderAxisReadout('a')
  }));
  card.appendChild(readOnlyReadout({
    label: 'Axis B — Severity',
    id: 'axis-b-readout',
    render: () => renderAxisReadout('b')
  }));
  card.appendChild(readOnlyReadout({
    label: 'Axis C — Completeness',
    id: 'axis-c-readout',
    render: () => renderAxisReadout('c')
  }));
  card.appendChild(readOnlyReadout({
    label: 'Axis D — Follow-up urgency',
    id: 'axis-d-readout',
    render: () => renderAxisReadout('d')
  }));

  card.appendChild(checkboxGroup({
    label: 'Critical-result communication',
    options: [
      {
        field: 'criticalResultCommunicated',
        label: 'Critical / urgent result communicated to referrer'
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
    options: [
      { field: 'signed', label: 'I sign and authorise this report' }
    ]
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live four-axis preview
// ----------------------------------------------------------------------

/** Render one axis readout for the live preview. */
function renderAxisReadout(axis) {
  const g = calculateGrade(state);
  switch (axis) {
    case 'a':
      return `<span class="risk-badge ${resultClassificationClass(g.resultClassification)}">${esc(resultClassificationLabel(g.resultClassification))}</span>`;
    case 'b': {
      const category = g.reportingCategory
        ? ` <span class="muted">${esc(g.reportingCategory)}</span>`
        : '';
      return `<span class="risk-badge ${abnormalitySeverityClass(g.abnormalitySeverity)}">${esc(abnormalitySeverityLabel(g.abnormalitySeverity))}</span>${category}`;
    }
    case 'c':
      return `<strong>${g.reportCompletenessPercent}%</strong> <span class="muted">of mandatory report sections present</span>`;
    case 'd':
      return `<span class="risk-badge ${followUpUrgencyClass(g.followUpUrgency)}">${esc(followUpUrgencyLabel(g.followUpUrgency))}</span> <span class="muted">${esc(g.targetTimeframe)}</span>`;
    default:
      return '';
  }
}

function refreshLivePreview() {
  const a = document.getElementById('axis-a-readout');
  if (a) a.innerHTML = renderAxisReadout('a');
  const b = document.getElementById('axis-b-readout');
  if (b) b.innerHTML = renderAxisReadout('b');
  const c = document.getElementById('axis-c-readout');
  if (c) c.innerHTML = renderAxisReadout('c');
  const d = document.getElementById('axis-d-readout');
  if (d) d.innerHTML = renderAxisReadout('d');
}

// ----------------------------------------------------------------------
// Conditional alerts (critical-finding / critical-result banners)
// ----------------------------------------------------------------------

function updateConditionalAlerts() {
  for (const { el, visible } of conditionalAlerts) {
    el.hidden = !visible();
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered. Boolean
// structured-finding groups count as one slot answered when any box is ticked.
const STEP_SLOTS = [
  { step: 1, slots: [['reportingClinician'], ['reportStatus'], ['performedDate'], ['reportedDate']] },
  { step: 2, slots: [['angiographyType'], ['bodyRegion'], ['contrastUsed'], ['examinationAdequacy']] },
  { step: 3, slots: [['clinicalHistory'], ['comparisonWithPrevious']] },
  { step: 4, slots: [
    ['findingsNarrative'],
    ['significantStenosis', 'occlusion', 'aneurysm', 'dissection',
     'activeExtravasation', 'thrombus', 'normalVessels', 'incidentalFinding']
  ] },
  { step: 5, slots: [['maxStenosisPercent', 'interventionPerformed']] },
  { step: 6, slots: [['impression'], ['recommendedFollowUp']] },
  { step: 7, slots: [['signed']] }
];

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

  for (const def of STEP_SLOTS) {
    stepTotal[def.step] = def.slots.length;
    stepAnswered[def.step] = 0;
    for (const slot of def.slots) {
      total++;
      if (slot.some((field) => isAnswered(field))) {
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

  const g = lastResult;

  const axisRows = [
    ['Axis A — Result classification',
     `<span class="risk-badge ${resultClassificationClass(g.resultClassification)}">${esc(resultClassificationLabel(g.resultClassification))}</span>`],
    ['Axis B — Abnormality severity',
     `<span class="risk-badge ${abnormalitySeverityClass(g.abnormalitySeverity)}">${esc(abnormalitySeverityLabel(g.abnormalitySeverity))}</span>` +
     (g.reportingCategory ? ` <span class="muted">${esc(g.reportingCategory)}</span>` : '')],
    ['Axis C — Report completeness', `<strong>${g.reportCompletenessPercent}%</strong>`],
    ['Axis D — Follow-up urgency',
     `<span class="risk-badge ${followUpUrgencyClass(g.followUpUrgency)}">${esc(followUpUrgencyLabel(g.followUpUrgency))}</span>` +
     ` <span class="muted">${esc(g.targetTimeframe)}</span>`]
  ].map(([name, value]) => `
    <tr>
      <th scope="row">${name}</th>
      <td>${value}</td>
    </tr>
  `).join('');

  const rulesList = g.firedRules.length === 0
    ? `<p class="muted">No rules fired.</p>`
    : `
      <ul class="flags">
        ${g.firedRules.map((r) => `
          <li>
            <span class="flag-category">${esc(r.ruleId)}</span>
            <span class="flag-message">${esc(r.description)}</span>
          </li>
        `).join('')}
      </ul>
    `;

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

  const bannerClass = followUpUrgencyClass(g.followUpUrgency) || 'risk-low';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Angiography Interpretation Report</h2>
        <p class="muted">Graded ${esc(new Date(g.gradedAt).toLocaleString('en-GB'))}</p>
      </header>

      <div class="risk-banner ${bannerClass}">
        <div>
          <span class="risk-banner-label">Overall recommendation</span>
          <span class="risk-banner-value">${esc(recommendationLabel(g.recommendation))}</span>
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

      <h3>Flagged issues (${g.flags.length})</h3>
      ${flagsList}

      <h3>Fired rules (${g.firedRules.length})</h3>
      ${rulesList}

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
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
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
  { step: 2, title: 'Examination' },
  { step: 3, title: 'History' },
  { step: 4, title: 'Findings' },
  { step: 5, title: 'Measurements' },
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
  const form = document.getElementById('result-form');
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
  conditionalAlerts.length = 0;
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
