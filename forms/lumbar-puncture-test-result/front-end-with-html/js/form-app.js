import { calculateGrade } from './grader.js';
import { culturePositive as culturePositive$imported } from './rules.js';
import { abnormalitySeverityClass, abnormalitySeverityLabel, csfAppearanceLabel, emptyResult, followUpUrgencyClass, followUpUrgencyLabel, priorityLabel, recommendationLabel, reportStatusLabel, reportingCategoryLabel, resultClassificationClass, resultClassificationLabel, testResultLabel } from './types.js';

// Lumbar Puncture Test Result — reporting-clinician wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The reporting clinician scrolls through them; a sticky
// top-of-page progress summary reflects how many fields have been answered
// and a live four-axis interpretation preview updates as the report is
// edited. Submission runs the pure grading engine (Axis A classification,
// Axis B severity, Axis C completeness, Axis D follow-up urgency, overall
// recommendation, fired-rule audit trail, and safety flags) and renders an
// inline structured CSF analysis report. State is persisted to localStorage so
// a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'lumbar-puncture-test-result.front-end-with-html.v1';

/** @returns {import('./types.js').LumbarPunctureResult} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  // Merge over a fresh empty so any newly-added fields default correctly.
  // Numeric fields are `number | null`, so accept null (typeof null ===
  // 'object') as well as numbers for those keys — a null-safe rehydration.
  const fresh = emptyResult();

  for (const key of Object.keys(fresh)) {
    if (parsed == null || !(key in parsed)) continue;
    const freshVal = fresh[key];
    const savedVal = parsed[key];
    if (freshVal === null) {
      // numeric field: accept a number or null.
      if (savedVal === null || typeof savedVal === 'number') fresh[key] = savedVal;
    } else if (typeof savedVal === typeof freshVal) {
      fresh[key] = savedVal;
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

/** @param {import('./types.js').LumbarPunctureResult} state */
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

/** @type {import('./types.js').LumbarPunctureResult} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'lumbar-puncture-test-result',
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
    // Numeric fields serialise the empty string to null (never NaN) so the
    // grader's null checks work and localStorage rehydration is null-safe.
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
    description: 'Who authored the report, the originating request, the report status, and key dates.'
  });

  card.appendChild(textInput({
    label: 'Reporting clinician',
    field: 'reportingClinician', required: true,
    placeholder: 'e.g. Dr A Neurologist'
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
    title: 'Clinical history',
    description: 'The clinical question the lumbar puncture was performed to answer.'
  });

  card.appendChild(textArea({
    label: 'Clinical history',
    field: 'clinicalHistory', rows: 4,
    placeholder: 'Presentation, time since headache onset, prior CT brain, and the question the LP was performed to answer…'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Manometry and appearance',
    description: 'The manometry opening pressure and the macroscopic CSF appearance.'
  });

  card.appendChild(textInput({
    label: 'Opening pressure (cmH₂O)',
    field: 'openingPressureCmh2o', type: 'number',
    min: 0, max: 100, step: 0.1, unit: 'cmH₂O',
    hint: 'Normal adult range approximately 6–25 cmH₂O when relaxed and laterally recumbent.'
  }));
  card.appendChild(selectInput({
    label: 'CSF appearance',
    field: 'csfAppearance', required: true,
    options: [
      { value: 'clear', label: 'Clear' },
      { value: 'cloudy', label: 'Cloudy' },
      { value: 'turbid', label: 'Turbid' },
      { value: 'blood-stained', label: 'Blood-stained' },
      { value: 'xanthochromic', label: 'Xanthochromic' }
    ]
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Cell counts and biochemistry',
    description: 'CSF cell counts and biochemistry, interpreted against standard reference ranges.'
  });

  card.appendChild(textInput({
    label: 'White cell count (/µL)',
    field: 'csfWhiteCellCount', type: 'number',
    min: 0, max: 1000000, step: 0.1, unit: '/µL',
    hint: 'Normal adult typically < 5/µL; neutrophil predominance suggests bacterial infection.'
  }));
  card.appendChild(textInput({
    label: 'Red cell count (/µL)',
    field: 'csfRedCellCount', type: 'number',
    min: 0, max: 100000000, step: 0.1, unit: '/µL',
    hint: 'Raised in a traumatic tap or subarachnoid haemorrhage.'
  }));
  card.appendChild(textInput({
    label: 'Protein (g/L)',
    field: 'csfProteinGL', type: 'number',
    min: 0, max: 100, step: 0.01, unit: 'g/L',
    hint: 'Normal adult typically 0.15–0.45 g/L.'
  }));
  card.appendChild(textInput({
    label: 'Glucose (mmol/L)',
    field: 'csfGlucoseMmolL', type: 'number',
    min: 0, max: 50, step: 0.01, unit: 'mmol/L',
    hint: 'Interpret against the paired serum glucose; low in bacterial meningitis.'
  }));
  card.appendChild(textInput({
    label: 'CSF:serum glucose ratio',
    field: 'csfSerumGlucoseRatio', type: 'number',
    min: 0, max: 2, step: 0.01,
    hint: 'Normal approximately 0.6; < 0.4 suggests bacterial meningitis.'
  }));
  card.appendChild(textInput({
    label: 'Lactate (mmol/L)',
    field: 'csfLactateMmolL', type: 'number',
    min: 0, max: 50, step: 0.01, unit: 'mmol/L',
    hint: 'Raised (typically > 3.5 mmol/L) supports bacterial meningitis.'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Microbiology and specialist tests',
    description: 'Gram stain, culture, PCR, and the specialist CSF tests. A positive culture is a critical result.'
  });

  card.appendChild(textArea({
    label: 'Gram stain result',
    field: 'gramStainResult', rows: 2,
    placeholder: 'Gram stain appearance and organisms seen…'
  }));
  card.appendChild(textArea({
    label: 'Culture result',
    field: 'cultureResult', rows: 2,
    hint: 'A positive culture is a critical result. Use phrases such as “No growth” when negative.',
    placeholder: 'Organisms grown, or “No growth”…'
  }));

  card.appendChild(conditionalAlert({
    id: 'culture-alert',
    type: 'error',
    heading: 'Positive culture',
    message: 'A positive CSF culture is a critical result; the follow-up urgency auto-escalates to a critical alert. Communicate the result to the requesting clinician and record it on sign-off.'
  }));

  card.appendChild(textArea({
    label: 'PCR / molecular result',
    field: 'pcrResult', rows: 2,
    placeholder: 'e.g. meningococcal, pneumococcal, herpes simplex, enterovirus PCR…'
  }));
  card.appendChild(selectInput({
    label: 'Oligoclonal bands',
    field: 'oligoclonalBands',
    hint: 'CSF-specific bands support demyelination / multiple sclerosis.',
    options: [
      { value: 'positive', label: 'Positive' },
      { value: 'negative', label: 'Negative' },
      { value: 'not-tested', label: 'Not tested' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Xanthochromia (spectrophotometry)',
    field: 'xanthochromia',
    hint: 'Positive supports subarachnoid haemorrhage when LP performed ≥ 12 h after headache onset (UK NEQAS).',
    options: [
      { value: 'positive', label: 'Positive' },
      { value: 'negative', label: 'Negative' },
      { value: 'not-tested', label: 'Not tested' }
    ]
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Interpretation and impression',
    description: 'Structured interpretive findings, the narrative, the impression, a structured-reporting category, and recommended follow-up.'
  });

  card.appendChild(checkboxGroup({
    label: 'Structured interpretive findings',
    items: [
      { field: 'raisedProtein', label: 'Raised protein' },
      { field: 'pleocytosis', label: 'Pleocytosis' },
      { field: 'lowGlucose', label: 'Low glucose' },
      { field: 'bacterialMeningitisPattern', label: 'Bacterial meningitis pattern' },
      { field: 'viralPattern', label: 'Viral / aseptic pattern' },
      { field: 'subarachnoidHaemorrhageSuggested', label: 'Subarachnoid haemorrhage suggested' },
      { field: 'normalCsf', label: 'Normal CSF' }
    ]
  }));

  card.appendChild(conditionalAlert({
    id: 'critical-pattern-alert',
    type: 'error',
    heading: 'Critical CSF pattern selected',
    message: 'A bacterial meningitis pattern or suggested subarachnoid haemorrhage auto-escalates the follow-up urgency to a critical alert. Ensure the result is communicated to the requesting clinician on sign-off.'
  }));

  card.appendChild(textArea({
    label: 'Findings narrative',
    field: 'findingsNarrative', rows: 5,
    placeholder: 'Narrative description of the CSF findings (the body of the report)…'
  }));
  card.appendChild(textInput({
    label: 'Reporting category',
    field: 'reportingCategory',
    hint: 'Structured pattern label, e.g. bacterial-pattern, viral-pattern, SAH-pattern, inflammatory-demyelinating, normal.',
    placeholder: 'e.g. bacterial-pattern'
  }));
  card.appendChild(textArea({
    label: 'Impression',
    field: 'impression', rows: 4, required: true,
    placeholder: 'Summary impression / conclusion answering the clinical question…'
  }));
  card.appendChild(textArea({
    label: 'Recommended follow-up',
    field: 'recommendedFollowUp', rows: 3,
    placeholder: 'Recommended follow-up investigation, referral, or management…'
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
    message: 'This report contains a critical CSF result. Communicate the result directly to the requesting clinician and record it below before signing.'
  }));

  const preview = document.createElement('div');
  preview.className = 'score-grid';
  preview.id = 'axis-preview';
  preview.setAttribute('aria-live', 'polite');
  preview.setAttribute('aria-label', 'Live four-axis interpretation grade');
  card.appendChild(preview);

  card.appendChild(checkboxField({
    label: 'Critical / urgent result communicated to requesting clinician',
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
      <p class="score-label">${esc(reportingCategoryLabel(g.reportingCategory))}</p>
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
  const culturePositive = culturePositive$imported(state);
  const visibility = {
    'culture-alert': culturePositive,
    'critical-pattern-alert': state.bacterialMeningitisPattern || state.subarachnoidHaemorrhageSuggested,
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
// counts only when ticked). This lets the checkbox-only slots count as
// answered once any structured finding is recorded.
const STEP_SLOTS = {
  1: [['reportingClinician'], ['originatingRequestReference'], ['reportStatus'],
      ['performedDate'], ['reportedDate']],
  2: [['clinicalHistory']],
  3: [['openingPressureCmh2o'], ['csfAppearance']],
  4: [['csfWhiteCellCount', 'csfRedCellCount'], ['csfProteinGL', 'csfGlucoseMmolL'],
      ['csfSerumGlucoseRatio'], ['csfLactateMmolL']],
  5: [['gramStainResult'], ['cultureResult'], ['pcrResult'],
      ['oligoclonalBands'], ['xanthochromia']],
  6: [['raisedProtein', 'pleocytosis', 'lowGlucose', 'bacterialMeningitisPattern',
       'viralPattern', 'subarachnoidHaemorrhageSuggested', 'normalCsf'],
      ['findingsNarrative'], ['reportingCategory'], ['impression'], ['recommendedFollowUp']],
  7: [['reportedTo'], ['clinicianNotes'], ['signed']]
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

function numOrDash(v, suffix) {
  return v === null || v === undefined ? 'Not recorded' : `${v}${suffix || ''}`;
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
    ['Opening pressure', numOrDash(state.openingPressureCmh2o, ' cmH₂O')],
    ['CSF appearance', csfAppearanceLabel(state.csfAppearance)],
    ['White cell count', numOrDash(state.csfWhiteCellCount, ' /µL')],
    ['Red cell count', numOrDash(state.csfRedCellCount, ' /µL')],
    ['Protein', numOrDash(state.csfProteinGL, ' g/L')],
    ['Glucose', numOrDash(state.csfGlucoseMmolL, ' mmol/L')],
    ['CSF:serum glucose ratio', numOrDash(state.csfSerumGlucoseRatio, '')],
    ['Lactate', numOrDash(state.csfLactateMmolL, ' mmol/L')],
    ['Oligoclonal bands', testResultLabel(state.oligoclonalBands)],
    ['Xanthochromia', testResultLabel(state.xanthochromia)],
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
      (g.reportingCategory ? ` <span class="muted">${esc(reportingCategoryLabel(g.reportingCategory))}</span>` : '')],
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
        <h2>Lumbar Puncture / CSF Analysis Report</h2>
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
  { step: 3, title: 'Manometry' },
  { step: 4, title: 'Biochemistry' },
  { step: 5, title: 'Microbiology' },
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
