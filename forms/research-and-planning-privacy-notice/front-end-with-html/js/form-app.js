import { detectAdditionalFlags } from './flagged-issues.js';
import { validateForm as validateAssessment } from './form-validator.js';
import { acknowledgementStatus, acknowledgementStatusClass, acknowledgementStatusLabel, completenessLabel, emptyAssessment } from './types.js';
import { validationRules } from './validation-rules.js';

// Research and Planning Privacy Notice - acknowledgement wizard (vanilla
// JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress bar + step list reflects how many required fields have been
// filled. Submission runs the pure validator and renders an inline report.
// State is persisted to localStorage so a partial fill survives a page
// reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'research-and-planning-privacy-notice.front-end-form-with-html.v1';
const TOTAL_STEPS = 3;

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
    console.warn('Could not parse saved acknowledgement; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

/** @type {import('./types.js').AssessmentData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'research-and-planning-privacy-notice',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    // Repopulate today's date so step 3 is pre-filled like the Svelte version.
    state.acknowledgementSignature.recipientTypedDate =
      new Date().toISOString().slice(0, 10);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    updateConditionalSections();
    updateCheckboxVisual();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Auto-populate today's date if not yet set (mirrors Step3 Svelte logic).
if (!state.acknowledgementSignature.recipientTypedDate) {
  state.acknowledgementSignature.recipientTypedDate =
    new Date().toISOString().slice(0, 10);
  saveState(state);
}

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs progress and checkbox visual state after each change.
 *
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateCheckboxVisual();
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
 *           placeholder?: string, required?: boolean }} opts
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
    `value="${esc(value ?? '')}"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
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
 * Build a radio-group fieldset for an opt-out preference.
 * @param {{
 *   label: string,
 *   section: string,
 *   field: string,
 *   required?: boolean,
 *   options: Array<{value: string, label: string}>
 * }} opts
 */
function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.innerHTML = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.htmlFor = radioId;
    const checked = String(current) === option.value ? ' checked' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}>
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

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = `${groupId}-error`;
  wrapper.appendChild(errSpan);
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
    <h2 class="section-title">${esc(opts.title)}</h2>
    ${desc}
  `;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Section renderers (1 per step)
// ----------------------------------------------------------------------

// Step 1: Recipient Details
function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Recipient Details',
    description: 'Enter the details of the patient acknowledging the research and planning privacy notice.'
  });

  card.appendChild(textInput({
    label: 'Organisation Name',
    section: 'recipientDetails',
    field: 'organisationName',
    placeholder: 'e.g. Riverside Medical Practice',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Recipient Name',
    section: 'recipientDetails',
    field: 'recipientName',
    placeholder: 'e.g. Mrs Jane Smith',
    required: true
  }));
  card.appendChild(textInput({
    label: 'NHS Number (optional)',
    section: 'recipientDetails',
    field: 'recipientNhsNumber',
    placeholder: 'e.g. 943 476 5919'
  }));
  card.appendChild(textInput({
    label: 'Date of Birth (optional)',
    section: 'recipientDetails',
    field: 'recipientDob',
    type: 'date'
  }));

  return card;
}

// Step 2: Research & Planning Privacy Notice (read-only prose).
// Mirrors `Step2ResearchPlanningPrivacyNotice.svelte` 1:1.
function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Research & Planning Privacy Notice',
    description: 'How your confidential patient information is used for research and service planning, and your choices about this use.'
  });

  const prose = document.createElement('div');
  prose.className = 'notice-prose';
  prose.innerHTML = `
    <h3>Who we are and what we do</h3>
    <p>
      The NHS and organisations providing NHS services use confidential
      patient information to run the health service, plan services, and
      conduct research that benefits current and future patients. This
      notice explains how your information is used and the choices you
      have.
    </p>

    <h3>Legal bases</h3>
    <p>
      We process your information under <strong>UK GDPR Article 6(1)(e)</strong>
      (task in the public interest) and, for health data,
      <strong>Article 9(2)(h)</strong> (provision of health care) and, for
      research, <strong>Article 9(2)(j)</strong> (scientific research). The
      Common Law Duty of Confidentiality also applies.
    </p>

    <h3>What we use your information for</h3>
    <ul>
      <li>Direct care (always, and unrelated to the opt-out below)</li>
      <li>Service planning &mdash; measuring demand, waiting times, and outcomes</li>
      <li>Research &mdash; approved studies following Health Research Authority rules</li>
      <li>Quality assurance and audit</li>
      <li>Public-health surveillance (where legally required)</li>
    </ul>

    <h3>Your opt-out choices</h3>
    <p>You have two separate choices:</p>
    <ul class="spaced">
      <li>
        <strong>Type 1 opt-out</strong> &mdash; asks your GP practice not to
        share your identifiable information from their records for purposes
        beyond direct care at that practice.
      </li>
      <li>
        <strong>NHS National Data Opt-Out</strong> &mdash; asks the NHS not to
        share your confidential patient information for research and planning
        across the wider NHS. You can set or change this at any time at
        <a href="https://www.nhs.uk/your-nhs-data-matters/" target="_blank" rel="noopener">nhs.uk/your-nhs-data-matters</a>.
      </li>
    </ul>

    <h3>Your rights</h3>
    <p>
      You have rights to access, correct, and (in some cases) object to or
      erase your personal data. You can complain to the Information
      Commissioner's Office at
      <a href="https://ico.org.uk/" target="_blank" rel="noopener">ico.org.uk</a>.
    </p>

    <p class="closing-note">
      Please read each section carefully before proceeding to record your
      preferences, acknowledge, and sign.
    </p>
  `;

  card.appendChild(prose);
  return card;
}

// Step 3: Opt-Out Preference, Acknowledgement & Signature
function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Opt-Out Preference, Acknowledgement & Signature',
    description: 'Record your Type 1 and National Data Opt-Out preferences, then acknowledge and sign.'
  });

  // Type 1 opt-out fieldset
  card.appendChild(radioGroup({
    label: 'Type 1 opt-out (from this practice)',
    section: 'acknowledgementSignature',
    field: 'type1OptOut',
    required: true,
    options: [
      { value: 'opt-in',  label: 'Opt in — I consent to my information being used for research and planning purposes' },
      { value: 'opt-out', label: 'Opt out — I do not want my identifiable information shared from this practice for research or planning' }
    ]
  }));

  // National Data Opt-Out fieldset
  card.appendChild(radioGroup({
    label: 'NHS National Data Opt-Out',
    section: 'acknowledgementSignature',
    field: 'nationalDataOptOut',
    required: true,
    options: [
      { value: 'opt-in',  label: 'Opt in — I allow my confidential patient information to be used for research and planning across the NHS' },
      { value: 'opt-out', label: 'Opt out — I do not want my data used beyond my individual care and treatment' }
    ]
  }));

  // Acknowledgement checkbox
  const ackId = 'acknowledgementSignature-agreed';
  const ackWrapper = document.createElement('div');
  ackWrapper.className = 'field';
  const ackLabel = document.createElement('label');
  ackLabel.className = 'ack-checkbox';
  ackLabel.id = 'ack-checkbox-label';
  ackLabel.htmlFor = ackId;
  if (state.acknowledgementSignature.agreed) {
    ackLabel.classList.add('is-checked');
  }
  ackLabel.innerHTML = `
    <input
      class="checkbox-input"
      type="checkbox"
      id="${ackId}"
      name="${ackId}"
      ${state.acknowledgementSignature.agreed ? 'checked' : ''}
    >
    <span class="ack-checkbox-text">
      I confirm I have read and understood the research and planning privacy
      notice and my opt-out choices above.
      <span class="req" aria-hidden="true">*</span>
    </span>
  `;
  const ackInput = ackLabel.querySelector('input');
  ackInput.addEventListener('change', () => {
    setField('acknowledgementSignature', 'agreed', ackInput.checked);
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
    section: 'acknowledgementSignature',
    field: 'recipientTypedFullName',
    placeholder: 'Type your full name',
    required: true
  }));
  card.appendChild(textInput({
    label: "Today's Date",
    section: 'acknowledgementSignature',
    field: 'recipientTypedDate',
    type: 'date',
    required: true
  }));

  return card;
}

const STEP_RENDERERS = [renderStep1, renderStep2, renderStep3];

// ----------------------------------------------------------------------
// Conditional sections + visual state
// ----------------------------------------------------------------------

/**
 * Re-evaluate `data-conditional` blocks (none in this form by default,
 * but the helper is provided for symmetry with the canonical reference
 * and so future fields can use `data-conditional="section.field=value"`).
 */
function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = state[section] && state[section][field];
    host.style.display = String(current) === target ? '' : 'none';
  });
}

/** Toggle the highlighted "is-checked" style on the acknowledgement label. */
function updateCheckboxVisual() {
  const lbl = document.getElementById('ack-checkbox-label');
  if (!lbl) return;
  if (state.acknowledgementSignature.agreed) {
    lbl.classList.add('is-checked');
  } else {
    lbl.classList.remove('is-checked');
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Tracked fields drive the sticky progress bar at the top of the page.
// We track every required field in `validationRules`, attributed to
// their step for step-list status.
const TRACKED_FIELDS = [
  // Step 1: Recipient Details
  { section: 'recipientDetails', field: 'organisationName', step: 1 },
  { section: 'recipientDetails', field: 'recipientName', step: 1 },
  // Step 3: Opt-Out Preference, Acknowledgement & Signature
  { section: 'acknowledgementSignature', field: 'type1OptOut', step: 3 },
  { section: 'acknowledgementSignature', field: 'nationalDataOptOut', step: 3 },
  { section: 'acknowledgementSignature', field: 'agreed', step: 3 },
  { section: 'acknowledgementSignature', field: 'recipientTypedFullName', step: 3 },
  { section: 'acknowledgementSignature', field: 'recipientTypedDate', step: 3 }
];

function updateProgress() {
  let answered = 0;
  const stepAnswered = {};
  const stepTotal = {};
  for (const t of TRACKED_FIELDS) {
    stepTotal[t.step] = (stepTotal[t.step] || 0) + 1;
    const v = state[t.section] && state[t.section][t.field];
    if (v !== null && v !== undefined && v !== '' && v !== false) {
      answered++;
      stepAnswered[t.step] = (stepAnswered[t.step] || 0) + 1;
    }
  }
  // Step 2 is a read-only prose section, so treat it as always "finished".
  stepTotal[2] = stepTotal[2] || 1;
  stepAnswered[2] = stepTotal[2];

  const total = TRACKED_FIELDS.length;
  const percent = Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(stepAnswered, stepTotal);
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'recipientDetails',         title: 'Recipient' },
  { step: 2, section: 'researchPlanningNotice',   title: 'Privacy Notice' },
  { step: 3, section: 'acknowledgementSignature', title: 'Acknowledge' }
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

  // Native required fields (text inputs).
  const required = form.querySelectorAll('[data-required]');
  required.forEach((input) => {
    const id = input.id;
    const value = (input.value || '').trim();
    if (!value) {
      const labelEl = form.querySelector(`label[for="${id}"]`);
      const label = labelEl ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim() : id;
      errors.push({ id, message: `${label} is required` });
      setFieldError(id, `${label} is required`);
    } else {
      clearFieldError(id);
    }
  });

  // Required radio groups: Type 1 and National Data Opt-Out.
  const radioRules = [
    {
      section: 'acknowledgementSignature',
      field: 'type1OptOut',
      label: 'Type 1 opt-out preference'
    },
    {
      section: 'acknowledgementSignature',
      field: 'nationalDataOptOut',
      label: 'NHS National Data Opt-Out preference'
    }
  ];
  for (const r of radioRules) {
    const id = `${r.section}-${r.field}`;
    const value = state[r.section][r.field];
    if (!value) {
      errors.push({ id, message: `${r.label} is required` });
      setFieldError(id, `${r.label} is required`);
    } else {
      clearFieldError(id);
    }
  }

  // Acknowledgement checkbox must be true.
  const ackId = 'acknowledgementSignature-agreed';
  if (!state.acknowledgementSignature.agreed) {
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
  summary.focus({ preventScroll: true });
}

// ----------------------------------------------------------------------
// Submit / Report
// ----------------------------------------------------------------------

function priorityClass(priority) {
  switch (priority) {
    case 'high':   return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low':    return 'flag-low';
    default:       return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    completenessPercent: pct,
    status,
    firedRules,
    additionalFlags,
    timestamp
  } = lastResult;

  const ackStatus = acknowledgementStatus(status, state);

  const flagsList = additionalFlags.length === 0
    ? `<p class="muted">No additional flags raised.</p>`
    : `
      <ul class="flags">
        ${additionalFlags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.message)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const firedRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.section)}</td>
      <td>${esc(r.field)}</td>
      <td>${esc(r.description)}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">All required fields completed.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Section</th>
            <th scope="col">Field</th>
            <th scope="col">Validation message</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <h2>Research and Planning Privacy Notice — Acknowledgement Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Status</h3>
    <p class="status-summary">
      <span class="status-badge ${acknowledgementStatusClass(ackStatus)}">${esc(acknowledgementStatusLabel(ackStatus))}</span>
      <span class="completeness-pct">${esc(completenessLabel(pct))}</span>
    </p>
    <p class="muted">
      Validation status: <strong>${esc(status)}</strong>
      (${firedRules.length} of ${validationRules.length} required fields outstanding).
    </p>

    <h3>Validation errors (fired rules)</h3>
    ${firedTable}

    <h3>Flagged Issues</h3>
    ${flagsList}

    <div class="report-actions">
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const { completeness, status, firedRules } = validateAssessment(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    completenessPercent: completeness,
    status,
    firedRules,
    additionalFlags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh acknowledgement?')) return;
  clearState();
  state = emptyAssessment();
  // Repopulate today's date so step 3 is pre-filled like the Svelte version.
  state.acknowledgementSignature.recipientTypedDate =
    new Date().toISOString().slice(0, 10);
  saveState(state);
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  updateCheckboxVisual();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Bootstrap
// ----------------------------------------------------------------------

function renderForm() {
  const host = document.getElementById('form-sections');
  host.innerHTML = '';
  for (const r of STEP_RENDERERS) host.appendChild(r());
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  updateCheckboxVisual();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
