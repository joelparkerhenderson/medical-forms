import { detectFlaggedIssues } from './flags.js';
import { calculateGrade } from './grader.js';
import { emptyScreening, maculopathyLabel, outcomeClass, outcomeLabel, priorityLabel, recallIntervalLabel, referralLabel, retinopathyLabel, statusLabel } from './types.js';

// Diabetes Eye Screening record — single-page wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The grader scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// worst-eye outcome updates as the record is filled. Submission runs the pure
// classification engine (worst R/M grade, any-ungradable marker, recall /
// referral outcome, recall interval, completeness status, fired rules, safety
// flags) and renders an inline report. State is persisted to localStorage so a
// partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'diabetes-eye-screening.front-end-with-html.v1';

/** @returns {import('./types.js').ScreeningData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  // Merge over a fresh empty so any newly-added fields default correctly.
  const fresh = emptyScreening();

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
    if (!raw) return emptyScreening();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved screening; starting fresh.', e);
    return emptyScreening();
  }
}

/** @param {import('./types.js').ScreeningData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save screening to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored screening.', e);
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

/** @type {import('./types.js').ScreeningData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'diabetes-eye-screening',
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
    refreshLiveOutcome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 5;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-outcome readout after each change.
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
  refreshLiveOutcome();
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

/** Wrap a field/card so it only shows when `section.field == value`. */
function conditional(el, section, field, value) {
  el.setAttribute('data-conditional', `${section}.${field}=${value}`);
  return el;
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
// Shared option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const retinopathyOptions = [
  { value: 'R0', label: 'R0 — No diabetic retinopathy' },
  { value: 'R1', label: 'R1 — Background retinopathy' },
  { value: 'R2', label: 'R2 — Pre-proliferative retinopathy' },
  { value: 'R3A', label: 'R3A — Proliferative retinopathy (active)' },
  { value: 'R3S', label: 'R3S — Proliferative retinopathy (stable / treated)' }
];

const maculopathyOptions = [
  { value: 'M0', label: 'M0 — No diabetic maculopathy' },
  { value: 'M1', label: 'M1 — Diabetic maculopathy present' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per screening step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Grading context',
    description: 'Who assigned the grade, in what role, when, and how the images were captured.'
  });

  card.appendChild(textInput({
    label: 'Grader name',
    section: 'context', field: 'graderName', required: true,
    placeholder: 'e.g. J. Okoro'
  }));
  card.appendChild(selectInput({
    label: 'Grader role',
    section: 'context', field: 'graderRole', required: true,
    options: [
      { value: 'screener', label: 'Retinal screener' },
      { value: 'primary-grader', label: 'Primary grader' },
      { value: 'secondary-grader', label: 'Secondary grader' },
      { value: 'ophthalmologist', label: 'Ophthalmologist' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Grading date',
    section: 'context', field: 'gradedAt', type: 'date'
  }));
  card.appendChild(textInput({
    label: 'Image capture date',
    section: 'context', field: 'imageCapturedAt', type: 'date'
  }));
  card.appendChild(selectInput({
    label: 'Imaging media / camera',
    section: 'context', field: 'imagingMedia',
    options: [
      { value: 'digital-fundus', label: 'Digital fundus photography' },
      { value: 'mydriatic', label: 'Mydriatic (dilated)' },
      { value: 'non-mydriatic', label: 'Non-mydriatic' },
      { value: 'oct', label: 'Optical coherence tomography (OCT)' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Identifier, age band, diabetes context, and the previous screen (drives overdue and low-risk recall).'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. NHS number or local ID'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    hint: 'The programme covers people with diabetes aged 12 or over.',
    options: [
      { value: 'under-12', label: 'Under 12 (outside programme)' },
      { value: '12-17', label: '12-17' },
      { value: '18-64', label: '18-64' },
      { value: '65-plus', label: '65 or over' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Diabetes type',
    section: 'identification', field: 'diabetesType',
    options: [
      { value: 'type-1', label: 'Type 1' },
      { value: 'type-2', label: 'Type 2' },
      { value: 'other', label: 'Other' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Years since diagnosis',
    section: 'identification', field: 'yearsSinceDiagnosis',
    type: 'number', min: 0, max: 99, step: 0.5, unit: 'years'
  }));
  card.appendChild(textInput({
    label: 'Date of most recent previous screen',
    section: 'identification', field: 'previousScreenDate', type: 'date'
  }));
  card.appendChild(selectInput({
    label: 'Previous screen result',
    section: 'identification', field: 'previousScreenResult',
    hint: 'A previous R0/M0 result is required for extended 24-monthly recall.',
    options: [
      { value: 'r0m0', label: 'R0/M0 (no retinopathy)' },
      { value: 'background', label: 'Background (R1)' },
      { value: 'referable', label: 'Referable disease' },
      { value: 'none', label: 'No previous screen' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));

  return card;
}

/** Render one eye-grading step (right = step 3, left = step 4). */
function renderEyeStep(stepNumber, section, eyeLabel) {
  const card = sectionCard({
    stepNumber,
    title: `${eyeLabel} eye grading`,
    description: `Retinopathy (R) and maculopathy (M) grade, photocoagulation (P) and ungradable (U) markers, and visual acuity for the ${eyeLabel.toLowerCase()} eye.`
  });

  card.appendChild(selectInput({
    label: 'Retinopathy grade (R)',
    section, field: 'retinopathy',
    hint: 'Leave unset if the eye is ungradable.',
    options: retinopathyOptions
  }));
  card.appendChild(selectInput({
    label: 'Maculopathy grade (M)',
    section, field: 'maculopathy',
    options: maculopathyOptions
  }));
  card.appendChild(radioGroup({
    label: 'Photocoagulation (P) — evidence of previous laser treatment?',
    section, field: 'photocoagulation', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Ungradable (U) — image quality insufficient to grade?',
    section, field: 'ungradable', options: yesNo
  }));
  card.appendChild(textInput({
    label: 'Visual acuity',
    section, field: 'visualAcuity',
    placeholder: 'e.g. logMAR 0.1 or 6/9 Snellen'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Summary and outcome',
    description: 'Live worst-eye classification and a free-text grader note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live worst-eye outcome',
    id: 'live-outcome-readout',
    render: () => renderLiveOutcome()
  }));

  card.appendChild(textArea({
    label: 'Grader note',
    section: 'note', field: 'clinicalContext',
    placeholder: 'Free-text clinical context: findings, decisions, and any action already taken.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the live worst-eye grade + recall / referral outcome. */
function renderLiveOutcome() {
  const grade = calculateGrade(state);
  const badge =
    `<span class="risk-badge ${outcomeClass(grade.recallPathway)}">${esc(outcomeLabel(grade.recallPathway))}</span>`;
  const grades =
    `<span class="muted"> — worst ${esc(grade.worstRetinopathy)} / ${esc(grade.worstMaculopathy)}` +
    `${grade.anyUngradable ? ', ungradable eye' : ''}</span>`;
  const interval = `<span class="muted"> (${esc(recallIntervalLabel(grade.recallIntervalMonths))})</span>`;
  return `${badge}${grades}${interval} <span class="muted">[${esc(statusLabel(grade.status))}]</span>`;
}

function refreshLiveOutcome() {
  const live = document.getElementById('live-outcome-readout');
  if (live) live.innerHTML = renderLiveOutcome();
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
  context: [['graderName'], ['graderRole'], ['gradedAt']],
  identification: [['patientIdentifier'], ['ageBand'], ['previousScreenResult']],
  rightEye: [['retinopathy', 'ungradable'], ['maculopathy', 'ungradable']],
  leftEye: [['retinopathy', 'ungradable'], ['maculopathy', 'ungradable']],
  note: [['clinicalContext']]
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
    worstRetinopathy, worstMaculopathy, anyUngradable,
    recallPathway, recallIntervalMonths, referral, status,
    firedRules, flaggedIssues, timestamp
  } = lastResult;

  const ruleRows = firedRules.length === 0
    ? `<tr><td colspan="2" class="muted">No classification rule fired.</td></tr>`
    : firedRules.map((r) => `
      <tr>
        <th scope="row">${esc(r.id)}</th>
        <td>${esc(r.description)}</td>
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

  const outcomeNote =
    recallPathway === 'refer-hes-urgent'
      ? `<p>Active proliferative retinopathy: <strong>urgent / fast-track referral to ophthalmology</strong>.</p>`
      : recallPathway === 'refer-hes'
      ? `<p>Referable disease (maculopathy or stable proliferative): <strong>routine referral to the hospital eye service</strong>.</p>`
      : recallPathway === 'refer-slit-lamp'
      ? `<p>Images ungradable and no referable disease above: <strong>re-screen or refer for slit-lamp biomicroscopy</strong>.</p>`
      : recallPathway === 'surveillance-6-month'
      ? `<p>Pre-proliferative retinopathy: <strong>6-monthly digital surveillance</strong>.</p>`
      : recallPathway === 'routine-24-month'
      ? `<p>No retinopathy across two consecutive R0/M0 screens: <strong>extended 24-monthly low-risk recall</strong>.</p>`
      : `<p>Routine outcome: <strong>12-monthly digital screening</strong>.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Diabetes Eye Screening Result</h2>
        <p class="muted">Patient: ${esc(state.identification.patientIdentifier || 'Unidentified')} · Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${outcomeClass(recallPathway)}">
        <div>
          <span class="risk-banner-label">Recall / referral outcome</span>
          <span class="risk-banner-value">${esc(outcomeLabel(recallPathway))}</span>
        </div>
        <span class="risk-badge ${outcomeClass(recallPathway)}">${esc(statusLabel(status))}</span>
      </div>

      <h3>Worst-eye classification</h3>
      <table class="subscales">
        <thead>
          <tr><th scope="col">Axis</th><th scope="col">Result</th></tr>
        </thead>
        <tbody>
          <tr><th scope="row">Worst retinopathy (R)</th><td>${esc(retinopathyLabel(worstRetinopathy) || worstRetinopathy)}</td></tr>
          <tr><th scope="row">Worst maculopathy (M)</th><td>${esc(maculopathyLabel(worstMaculopathy) || worstMaculopathy)}</td></tr>
          <tr><th scope="row">Any eye ungradable</th><td>${anyUngradable ? 'Yes' : 'No'}</td></tr>
          <tr><th scope="row">Referral</th><td>${esc(referralLabel(referral))}</td></tr>
          <tr><th scope="row">Recall interval</th><td>${esc(recallIntervalLabel(recallIntervalMonths))}</td></tr>
        </tbody>
      </table>

      <h3>Recommended outcome</h3>
      <p class="readout-value"><strong>${esc(outcomeLabel(recallPathway))}</strong></p>
      ${outcomeNote}

      <h3>Classification rules</h3>
      <table class="subscales">
        <thead>
          <tr><th scope="col">Rule</th><th scope="col">Basis</th></tr>
        </thead>
        <tbody>${ruleRows}</tbody>
      </table>

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
  const grade = calculateGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    rightEyeGrade: grade.rightEyeGrade,
    leftEyeGrade: grade.leftEyeGrade,
    worstRetinopathy: grade.worstRetinopathy,
    worstMaculopathy: grade.worstMaculopathy,
    anyUngradable: grade.anyUngradable,
    recallPathway: grade.recallPathway,
    recallIntervalMonths: grade.recallIntervalMonths,
    referral: grade.referral,
    status: grade.status,
    firedRules: grade.firedRules,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh screening record?')) return;
  clearState();
  state = emptyScreening();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveOutcome();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'identification', title: 'Patient' },
  { step: 3, section: 'rightEye',       title: 'Right eye' },
  { step: 4, section: 'leftEye',        title: 'Left eye' },
  { step: 5, section: 'note',           title: 'Summary' }
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
    // Skip fields inside a hidden conditional block.
    if (input.closest('[data-conditional]') &&
        input.closest('[data-conditional]').style.display === 'none') {
      return;
    }
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
  host.appendChild(renderEyeStep(3, 'rightEye', 'Right'));
  host.appendChild(renderEyeStep(4, 'leftEye', 'Left'));
  host.appendChild(renderStep5());
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveOutcome();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
