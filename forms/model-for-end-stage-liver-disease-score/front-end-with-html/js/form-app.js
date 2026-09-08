import { detectFlaggedIssues } from './flags.js';
import { calculateMeld } from './grader.js';
import { emptyAssessment, meldVariantLabel, mortalityBandClass, mortalityBandLabel, priorityLabel } from './types.js';

// MELD (Model for End-Stage Liver Disease) Score — single-page wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live MELD
// readout updates as the laboratory inputs are entered. Sodium (MELD-Na, MELD
// 3.0) and albumin (MELD 3.0) steps appear only when the chosen variant needs
// them. Submission runs the pure MELD engine (weighted logarithmic score,
// mortality band, flagged issues) and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'model-for-end-stage-liver-disease-score.front-end-with-html.v1';

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
  slug: 'model-for-end-stage-liver-disease-score',
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
    refreshLiveResult();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 8;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-result readout after each change.
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
  refreshLiveResult();
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

/** Format a MELD score for display, or a dash when null. */
function fmtScore(n) {
  return (n === null || n === undefined) ? '—' : `MELD ${n}`;
}

/** Which sections apply to the chosen variant (sodium/albumin are conditional). */
function applicableSections() {
  const v = state.context.meldVariant;
  const list = ['context', 'identification', 'bilirubin', 'inr', 'renal'];
  if (v === 'meld-na' || v === 'meld-3') list.push('sodium');
  if (v === 'meld-3') list.push('albumin');
  list.push('note');
  return list;
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
// Section renderers (1 per wizard step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const labUnits = [
  { value: 'mg/dL', label: 'mg/dL' },
  { value: 'umol/L', label: 'µmol/L' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, where, and which MELD variant to use.'
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
      { value: 'hepatologist', label: 'Hepatologist' },
      { value: 'gastroenterologist', label: 'Gastroenterologist' },
      { value: 'transplant-coordinator', label: 'Transplant coordinator' },
      { value: 'intensivist', label: 'Intensivist' },
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
      { value: 'hepatology-clinic', label: 'Hepatology clinic' },
      { value: 'transplant-unit', label: 'Transplant unit' },
      { value: 'intensive-care', label: 'Intensive care' },
      { value: 'ward', label: 'Ward' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'MELD variant',
    section: 'context', field: 'meldVariant', required: true,
    hint: 'MELD-Na adds serum sodium; MELD 3.0 also adds sex and serum albumin.',
    options: [
      { value: 'meld', label: 'MELD (original)' },
      { value: 'meld-na', label: 'MELD-Na (sodium-corrected)' },
      { value: 'meld-3', label: 'MELD 3.0' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age band, and sex. The formula assumes adult physiology; sex is used by MELD 3.0.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. HEP-100482 or hospital MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    options: [
      { value: '16-39', label: '16-39' },
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
    title: 'Total bilirubin',
    description: 'Calculation input 1 — the measured total serum bilirubin. Values below 1.0 mg/dL are raised to 1.0.'
  });

  card.appendChild(textInput({
    label: 'Measured total bilirubin',
    section: 'bilirubin', field: 'bilirubin', required: true,
    type: 'number', min: 0, max: 100, step: 0.1,
    hint: 'Enter the measured value, then choose its unit (µmol/L is divided by 17.1 to convert to mg/dL).'
  }));
  card.appendChild(selectInput({
    label: 'Bilirubin unit',
    section: 'bilirubin', field: 'bilirubinUnit', required: true,
    options: labUnits
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'INR',
    description: 'Calculation input 2 — the International Normalised Ratio of prothrombin time. Values below 1.0 are raised to 1.0.'
  });

  card.appendChild(textInput({
    label: 'International Normalised Ratio (INR)',
    section: 'inr', field: 'inr', required: true,
    type: 'number', min: 0, max: 20, step: 0.1, unit: 'ratio',
    hint: 'Unitless ratio; typical results range from about 0.9 to 5.'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Creatinine and dialysis',
    description: 'Calculation input 3 plus the dialysis rule. Creatinine is floored to 1.0 and capped at 4.0 mg/dL; the dialysis rule overrides it to 4.0.'
  });

  card.appendChild(textInput({
    label: 'Measured serum creatinine',
    section: 'renal', field: 'creatinine', required: true,
    type: 'number', min: 0, max: 2000, step: 0.1,
    hint: 'Enter the measured value, then choose its unit (µmol/L is divided by 88.4 to convert to mg/dL).'
  }));
  card.appendChild(selectInput({
    label: 'Creatinine unit',
    section: 'renal', field: 'creatinineUnit', required: true,
    options: labUnits
  }));
  card.appendChild(textInput({
    label: 'Haemodialysis sessions in the past 7 days',
    section: 'renal', field: 'dialysisSessionsPastWeek',
    type: 'number', min: 0, max: 21, step: 1, unit: 'sessions',
    hint: '≥ 2 sessions sets the creatinine to 4.0 mg/dL (the dialysis rule).'
  }));
  card.appendChild(radioGroup({
    label: '≥ 24 h of continuous veno-venous haemodialysis (CVVHD) in the past 7 days?',
    section: 'renal', field: 'cvvhd24h', options: yesNo
  }));

  card.appendChild(readOnlyReadout({
    label: 'Live MELD score',
    id: 'meld-preview-readout',
    render: () => renderLiveResult()
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Serum sodium',
    description: 'Used by MELD-Na and MELD 3.0. Sodium is clamped to 125–137 mEq/L; the correction is applied when the base MELD exceeds 11.'
  });

  card.appendChild(textInput({
    label: 'Measured serum sodium',
    section: 'sodium', field: 'sodium',
    type: 'number', min: 100, max: 170, step: 1, unit: 'mEq/L',
    hint: 'mEq/L is equivalent to mmol/L. Lower sodium raises the MELD-Na score.'
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Serum albumin',
    description: 'Used by MELD 3.0 only. Albumin is clamped to 1.5–3.5 g/dL.'
  });

  card.appendChild(textInput({
    label: 'Measured serum albumin',
    section: 'albumin', field: 'albumin',
    type: 'number', min: 0, max: 10, step: 0.1, unit: 'g/dL',
    hint: 'Lower albumin raises the MELD 3.0 score.'
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Result and interpretation',
    description: 'Live MELD score, mortality band, and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'MELD score and mortality band',
    id: 'live-result-readout',
    render: () => renderLiveResult()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, correlation with the presentation, transplant discussion, and any escalation already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the live MELD score and mortality-band badge. */
function renderLiveResult() {
  const grade = calculateMeld(state);
  const badge = grade.meldScore === null
    ? `<span class="muted">${esc(mortalityBandLabel(''))}</span>`
    : `<span class="risk-badge ${mortalityBandClass(grade.mortalityBand)}">${esc(mortalityBandLabel(grade.mortalityBand))}</span>`;
  return `<strong>${fmtScore(grade.meldScore)}</strong> ${badge}`;
}

function refreshLiveResult() {
  const preview = document.getElementById('meld-preview-readout');
  if (preview) preview.innerHTML = renderLiveResult();
  const live = document.getElementById('live-result-readout');
  if (live) live.innerHTML = renderLiveResult();
}

// ----------------------------------------------------------------------
// Conditional sections (sodium / albumin depend on the chosen variant)
// ----------------------------------------------------------------------

function updateConditionalSections() {
  const applicable = applicableSections();
  for (const def of STEP_DEFINITIONS) {
    const show = applicable.includes(def.section);
    const card = document.getElementById(`step-${def.step}`);
    if (card) card.style.display = show ? '' : 'none';
    const li = document.querySelector(`#step-list [data-step="${def.step}"]`);
    if (li) li.style.display = show ? '' : 'none';
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered. Only slots
// for the applicable sections (per the chosen variant) count toward the total.
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['careSetting'], ['meldVariant']],
  identification: [['patientIdentifier'], ['ageBand'], ['sex']],
  bilirubin: [['bilirubin'], ['bilirubinUnit']],
  inr: [['inr']],
  renal: [['creatinine'], ['creatinineUnit'], ['dialysisSessionsPastWeek'], ['cvvhd24h']],
  sodium: [['sodium']],
  albumin: [['albumin']],
  note: [['clinicalNote']]
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
  const applicable = applicableSections();

  for (const section of applicable) {
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

function fmtMgDl(n) {
  return (n === null || n === undefined) ? '—' : `${n} mg/dL`;
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    bilirubinMgDl, creatinineMgDl, creatinineAdjusted, dialysisRuleApplied,
    meldScore, mortalityBand, estimatedMortalityPercent, flaggedIssues, timestamp
  } = lastResult;

  const variant = state.context.meldVariant;
  const bilirubin = state.bilirubin.bilirubin;
  const bilirubinUnit = state.bilirubin.bilirubinUnit;
  const inr = state.inr.inr;
  const creatinine = state.renal.creatinine;
  const creatinineUnit = state.renal.creatinineUnit;
  const sodium = state.sodium.sodium;
  const albumin = state.albumin.albumin;

  const inputRows = [
    ['MELD variant', variant === '' ? 'Not selected' : meldVariantLabel(variant)],
    ['Total bilirubin', bilirubin === null ? 'Not recorded' : `${bilirubin} ${bilirubinUnit || ''}`.trim()],
    ['Bilirubin (converted)', fmtMgDl(bilirubinMgDl)],
    ['INR', inr === null ? 'Not recorded' : String(inr)],
    ['Serum creatinine', creatinine === null ? 'Not recorded' : `${creatinine} ${creatinineUnit || ''}`.trim()],
    ['Creatinine (converted)', fmtMgDl(creatinineMgDl)],
    ['Creatinine used', fmtMgDl(creatinineAdjusted)],
    ['Dialysis rule applied', dialysisRuleApplied ? 'Yes — creatinine set to 4.0 mg/dL' : 'No'],
    (variant === 'meld-na' || variant === 'meld-3')
      ? ['Serum sodium', sodium === null ? 'Not recorded' : `${sodium} mEq/L`]
      : null,
    (variant === 'meld-3')
      ? ['Serum albumin', albumin === null ? 'Not recorded' : `${albumin} g/dL`]
      : null,
    ['MELD score', meldScore === null ? 'Not computed' : String(meldScore)],
    ['Estimated 3-month mortality', estimatedMortalityPercent === null ? '—' : `~${estimatedMortalityPercent}%`]
  ].filter(Boolean).map(([name, value]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
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

  let interpretation;
  switch (mortalityBand) {
    case 'extreme':
    case 'very-high':
      interpretation = `<p>The MELD score is <strong>${meldScore}</strong>, indicating a <strong>very high short-term mortality</strong>. Arrange urgent hepatology / critical-care review and discuss transplant options where appropriate.</p>`;
      break;
    case 'high':
      interpretation = `<p>The MELD score is <strong>${meldScore}</strong> (high band). Severity is above the conventional transplant-benefit threshold; refer to, or discuss with, a liver transplant centre.</p>`;
      break;
    case 'moderate':
      interpretation = `<p>The MELD score is <strong>${meldScore}</strong> (moderate band). Monitor and reassess; consider transplant discussion once the score reaches 15.</p>`;
      break;
    case 'low':
      interpretation = `<p>The MELD score is <strong>${meldScore}</strong> (low band). Estimated short-term mortality is low; continue routine management and reassess as the clinical picture changes.</p>`;
      break;
    default:
      interpretation = `<p>The MELD score could not be computed because a required input for the chosen variant is missing. Record the missing laboratory value(s) and re-calculate.</p>`;
  }

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>MELD Score Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${mortalityBandClass(mortalityBand)}">
        <div>
          <span class="risk-banner-label">MELD score</span>
          <span class="risk-banner-value">${esc(fmtScore(meldScore))}</span>
        </div>
        <span class="risk-badge ${mortalityBandClass(mortalityBand)}">${esc(mortalityBandLabel(mortalityBand))}</span>
      </div>

      <h3>Calculation</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>${inputRows}</tbody>
      </table>

      <h3>Interpretation</h3>
      ${interpretation}

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
  const grade = calculateMeld(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    bilirubinMgDl: grade.bilirubinMgDl,
    creatinineMgDl: grade.creatinineMgDl,
    creatinineAdjusted: grade.creatinineAdjusted,
    dialysisRuleApplied: grade.dialysisRuleApplied,
    meldScore: grade.meldScore,
    mortalityBand: grade.mortalityBand,
    estimatedMortalityPercent: grade.estimatedMortalityPercent,
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
  refreshLiveResult();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'identification', title: 'Patient' },
  { step: 3, section: 'bilirubin',      title: 'Bilirubin' },
  { step: 4, section: 'inr',            title: 'INR' },
  { step: 5, section: 'renal',          title: 'Creatinine' },
  { step: 6, section: 'sodium',         title: 'Sodium' },
  { step: 7, section: 'albumin',        title: 'Albumin' },
  { step: 8, section: 'note',           title: 'Result' }
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
  const applicable = applicableSections();
  let firstUnfinished = -1;
  for (const def of STEP_DEFINITIONS) {
    const li = ol.querySelector(`[data-step="${def.step}"]`);
    if (!li) continue;
    if (!applicable.includes(def.section)) {
      li.dataset.status = 'waiting';
      li.removeAttribute('aria-current');
      continue;
    }
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
    // Skip fields inside a hidden (non-applicable) step card.
    const card = input.closest('.fieldset');
    if (card && card.style.display === 'none') return;
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveResult();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
