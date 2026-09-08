import { createDefaultData } from './data-model.js';
import { grade } from './grader.js';
import { renderNoticeHtml } from './notice-text.js';

// Care Privacy Notice — acknowledgement wizard (vanilla JavaScript).
//
// Single-page continuous wizard: every section is rendered into the page
// in document order. The user scrolls through them; a sticky top-of-page
// progress bar + step list reflect how many required fields have been
// filled. Submission runs the local grader and renders an inline report.
// State is persisted to localStorage so a partial fill survives a page
// reload.
//
// This module is loaded as `type="module"` solely so it can `import` the
// BMA privacy notice prose builder.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'care-privacy-notice.front-end-form-with-html.v1';
const TOTAL_STEPS = 3;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = createDefaultData();

  for (const key of Object.keys(fresh)) {
    if (
      parsed &&
      typeof parsed[key] === 'object' &&
      parsed[key] !== null &&
      typeof fresh[key] === 'object' &&
      fresh[key] !== null
    ) {
      fresh[key] = { ...fresh[key], ...parsed[key] };
    } else if (parsed && parsed[key] !== undefined) {
      fresh[key] = parsed[key];
    }
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultData();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved acknowledgement; starting fresh.', e);
    return createDefaultData();
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save acknowledgement to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored acknowledgement.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

let state = loadState();
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'care-privacy-notice',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    state.acknowledgment.date = new Date().toISOString().slice(0, 10);
    saveState(state);
    lastResult = null;
    const report = document.getElementById('report');
    if (report) {
      report.innerHTML =
        '<p class="empty-message">Submit the form to see the acknowledgement report.</p>';
    }
    renderErrorSummary([]);
    renderForm();
    renderNoticeInto();
    updateProgress();
    updateCheckboxVisual();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Auto-populate today's date if not yet set.
if (!state.acknowledgment.date) {
  state.acknowledgment.date = new Date().toISOString().slice(0, 10);
  saveState(state);
}

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateCheckboxVisual();
  // Re-render the notice prose live as the operator types practice details.
  if (section === 'config') renderNoticeInto();
}

// ----------------------------------------------------------------------
// Component builders (Lily class contract)
// ----------------------------------------------------------------------

function lilyInputClass(type) {
  switch (type) {
    case 'email':  return 'email-input';
    case 'number': return 'number-input';
    case 'date':   return 'date-input';
    case 'time':   return 'time-input';
    case 'tel':    return 'tel-input';
    case 'url':    return 'url-input';
    case 'search': return 'search-input';
    default:       return 'text-input';
  }
}

/**
 * Build a labelled text input.
 * @param {{ label: string, section: string, field: string, type?: string,
 *           placeholder?: string, required?: boolean, hint?: string,
 *           autocomplete?: string }} opts
 */
function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${lilyInputClass(type)}"`,
    `value="${esc(value == null ? '' : value)}"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.autocomplete) attrs.push(`autocomplete="${esc(opts.autocomplete)}"`);
  if (opts.required) attrs.push('required', 'data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;
  const input = wrapper.querySelector('input');
  input.setAttribute('aria-describedby', `${id}-error`);
  input.addEventListener('input', () => {
    setField(opts.section, opts.field, input.value);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Build a section card as a Lily fieldset with fieldset-legend.
 * @param {{ stepNumber: number, title: string, description?: string }} opts
 */
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
  legend.innerHTML = `
    <span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>
    <span class="section-title">${esc(opts.title)}</span>
    ${desc}
  `;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Section renderers (1 per step)
// ----------------------------------------------------------------------

// Step 1: Practice Configuration
function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Practice Configuration',
    description: 'For admin or clinical staff. Enter your practice details; they are interpolated into the privacy notice shown to the patient in step 2.'
  });

  card.appendChild(textInput({
    label: 'Practice Name',
    section: 'config',
    field: 'practiceName',
    placeholder: 'e.g. Riverside Medical Centre',
    autocomplete: 'organization',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Practice Address',
    section: 'config',
    field: 'practiceAddress',
    placeholder: 'e.g. 12 High Street, London, SW1A 1AA',
    autocomplete: 'street-address',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Data Protection Officer (DPO) Name',
    section: 'config',
    field: 'dpoName',
    placeholder: 'e.g. Dr Jane Smith',
    required: true
  }));
  card.appendChild(textInput({
    label: 'DPO Contact Details',
    section: 'config',
    field: 'dpoContactDetails',
    placeholder: 'e.g. dpo@riverside.nhs.uk or 020 7123 4567',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Data Sharing Partners (optional)',
    section: 'config',
    field: 'dataSharingPartners',
    placeholder: "e.g. St Mary's Hospital NHS Foundation Trust",
    hint: 'Named organisations with which patient data may be shared for direct care.'
  }));
  card.appendChild(textInput({
    label: 'Research Organisations (optional)',
    section: 'config',
    field: 'researchOrganisations',
    placeholder: 'e.g. University College London research consortium',
    hint: 'Research organisations authorised to access anonymised data.'
  }));

  return card;
}

// Step 2: Privacy Notice (rendered prose driven by step-1 config).
function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Privacy Notice',
    description: 'Please read the full notice below. Practice details from step 1 are interpolated automatically.'
  });

  const wrap = document.createElement('div');
  wrap.className = 'notice-display';
  wrap.innerHTML = `
    <div id="notice-content" class="notice-prose" tabindex="0" aria-label="Privacy notice prose"></div>
    <p class="scroll-hint">Scroll within the notice to read the full text before continuing.</p>
  `;
  card.appendChild(wrap);
  return card;
}

// Step 3: Acknowledgement & Signature
function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Acknowledgement & Signature',
    description: 'Please confirm that you have read and understood the privacy notice, then enter your name and today\'s date.'
  });

  // Acknowledgement checkbox
  const ackId = 'acknowledgment-checked';
  const ackWrapper = document.createElement('div');
  ackWrapper.className = 'field';
  const ackLabel = document.createElement('label');
  ackLabel.className = 'ack-checkbox';
  ackLabel.id = 'ack-checkbox-label';
  ackLabel.htmlFor = ackId;
  if (state.acknowledgment.checked) ackLabel.classList.add('is-checked');
  ackLabel.innerHTML = `
    <input
      class="checkbox-input"
      type="checkbox"
      id="${ackId}"
      name="${ackId}"
      ${state.acknowledgment.checked ? 'checked' : ''}
    >
    <span class="ack-checkbox-text">
      I have read, understand, and agree to the above privacy notice.
      <span class="req" aria-hidden="true">*</span>
    </span>
  `;
  const ackInput = ackLabel.querySelector('input');
  ackInput.addEventListener('change', () => {
    setField('acknowledgment', 'checked', ackInput.checked);
    clearFieldError(ackId);
  });
  ackWrapper.appendChild(ackLabel);
  const ackErr = document.createElement('span');
  ackErr.className = 'error-message';
  ackErr.id = `${ackId}-error`;
  ackWrapper.appendChild(ackErr);
  card.appendChild(ackWrapper);

  card.appendChild(textInput({
    label: 'Full Name',
    section: 'acknowledgment',
    field: 'patientName',
    placeholder: 'Type your full name',
    autocomplete: 'name',
    required: true
  }));
  card.appendChild(textInput({
    label: "Today's Date",
    section: 'acknowledgment',
    field: 'date',
    type: 'date',
    required: true
  }));

  return card;
}

const STEP_RENDERERS = [renderStep1, renderStep2, renderStep3];

// ----------------------------------------------------------------------
// Privacy notice rendering (step 2 prose)
// ----------------------------------------------------------------------

function renderNoticeInto() {
  const container = document.getElementById('notice-content');
  if (container) container.innerHTML = renderNoticeHtml(state.config);
}

// ----------------------------------------------------------------------
// Checkbox visual + progress
// ----------------------------------------------------------------------

function updateCheckboxVisual() {
  const lbl = document.getElementById('ack-checkbox-label');
  if (!lbl) return;
  if (state.acknowledgment.checked) {
    lbl.classList.add('is-checked');
  } else {
    lbl.classList.remove('is-checked');
  }
}

const TRACKED_FIELDS = [
  // Step 1: Practice Configuration (required only)
  { section: 'config', field: 'practiceName', step: 1 },
  { section: 'config', field: 'practiceAddress', step: 1 },
  { section: 'config', field: 'dpoName', step: 1 },
  { section: 'config', field: 'dpoContactDetails', step: 1 },
  // Step 3: Acknowledgement & Signature
  { section: 'acknowledgment', field: 'checked', step: 3 },
  { section: 'acknowledgment', field: 'patientName', step: 3 },
  { section: 'acknowledgment', field: 'date', step: 3 }
];

function isAnswered(v) {
  return v !== null && v !== undefined && v !== '' && v !== false;
}

function updateProgress() {
  let answered = 0;
  const stepAnswered = {};
  const stepTotal = {};
  for (const t of TRACKED_FIELDS) {
    stepTotal[t.step] = (stepTotal[t.step] || 0) + 1;
    const v = state[t.section] && state[t.section][t.field];
    if (isAnswered(v)) {
      answered++;
      stepAnswered[t.step] = (stepAnswered[t.step] || 0) + 1;
    }
  }
  // Step 2 is read-only prose, so treat it as always "finished".
  stepTotal[2] = stepTotal[2] || 1;
  stepAnswered[2] = stepTotal[2];

  const total = TRACKED_FIELDS.length;
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) {
    text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  }
  updateStepListStatuses(stepAnswered, stepTotal);
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'config',         title: 'Configuration' },
  { step: 2, section: 'noticeReading',  title: 'Notice' },
  { step: 3, section: 'acknowledgment', title: 'Acknowledge' }
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
// Validation
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
  const form = document.getElementById('assessment-form');
  if (!form) return errors;

  // Native required text/date inputs (data-required marker).
  const required = form.querySelectorAll('[data-required]');
  required.forEach((input) => {
    const id = input.id;
    const value = (input.value || '').trim();
    if (!value) {
      const labelEl = form.querySelector(`label[for="${id}"]`);
      const label = labelEl
        ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim()
        : id;
      errors.push({ id, message: `${label} is required` });
      setFieldError(id, `${label} is required`);
    } else {
      clearFieldError(id);
    }
  });

  // Acknowledgement checkbox must be true.
  const ackId = 'acknowledgment-checked';
  if (!state.acknowledgment.checked) {
    errors.push({
      id: ackId,
      message: 'You must confirm the acknowledgement checkbox'
    });
    setFieldError(ackId, 'You must confirm the acknowledgement checkbox');
  } else {
    clearFieldError(ackId);
  }

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
  summary.innerHTML = `
    <strong>Please correct the following:</strong>
    <ul>
      ${errors.map((e) => `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`).join('')}
    </ul>
  `;
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ----------------------------------------------------------------------
// Submit / Report
// ----------------------------------------------------------------------

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { overallStatus, firedRules, timestamp } = lastResult;
  const statusLabel = overallStatus === 'complete' ? 'Acknowledged' : 'Incomplete';
  const statusClass = overallStatus === 'complete'
    ? 'status-acknowledged'
    : 'status-incomplete';

  const firedRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.message)}</td>
    </tr>
  `).join('');
  const firedTable = firedRules.length === 0
    ? `<p class="muted">All required fields completed.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Rule ID</th>
            <th scope="col">Validation message</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <h2>Care Privacy Notice — Acknowledgement Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Status</h3>
    <p class="status-summary">
      <span class="status-badge ${statusClass}">${esc(statusLabel)}</span>
    </p>

    <h3>Patient details</h3>
    <dl class="ack-summary">
      <dt>Name</dt><dd>${esc(state.acknowledgment.patientName) || '&mdash;'}</dd>
      <dt>Date</dt><dd>${esc(state.acknowledgment.date) || '&mdash;'}</dd>
      <dt>Practice</dt><dd>${esc(state.config.practiceName) || '&mdash;'}</dd>
    </dl>

    <h3>Validation errors (fired rules)</h3>
    ${firedTable}

    <div class="report-actions">
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const btn = document.getElementById('start-over-btn');
  if (btn) btn.addEventListener('click', startOver);
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const result = grade(state);
  lastResult = {
    overallStatus: result.overallStatus,
    firedRules: result.firedRules,
    timestamp: new Date().toISOString()
  };
  state.submittedAt = lastResult.timestamp;
  saveState(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh acknowledgement?')) return;
  clearState();
  state = createDefaultData();
  state.acknowledgment.date = new Date().toISOString().slice(0, 10);
  saveState(state);
  lastResult = null;
  const report = document.getElementById('report');
  if (report) {
    report.innerHTML =
      '<p class="empty-message">Submit the form to see the acknowledgement report.</p>';
  }
  renderErrorSummary([]);
  renderForm();
  renderNoticeInto();
  updateProgress();
  updateCheckboxVisual();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Bootstrap
// ----------------------------------------------------------------------

function renderForm() {
  const host = document.getElementById('form-sections');
  if (!host) return;
  host.innerHTML = '';
  for (const r of STEP_RENDERERS) host.appendChild(r());
}

function init() {
  renderStepList();
  renderForm();
  renderNoticeInto();
  updateProgress();
  updateCheckboxVisual();

  const submit = document.getElementById('submit-btn');
  const reset = document.getElementById('reset-btn');
  if (submit) submit.addEventListener('click', submitForm);
  if (reset) reset.addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
