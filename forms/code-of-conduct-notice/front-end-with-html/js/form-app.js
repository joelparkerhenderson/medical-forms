import { detectAdditionalFlags } from './flagged-issues.js';
import { validateForm as engineValidateForm } from './form-validator.js';
import { acknowledgementStatus, acknowledgementStatusClass, acknowledgementStatusLabel, completenessLabel, emptyAssessment } from './types.js';
import { validationRules } from './validation-rules.js';

// Code of Conduct Notice — acknowledgement wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page native
// <progress> bar + step list reflects how many required fields have been
// filled. Submission runs the pure validator and renders an inline report.
// State is persisted to localStorage so a partial fill survives a reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'code-of-conduct-notice.front-end-form-with-html.v1';
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

/** @type {import('./types.js').AssessmentData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'code-of-conduct-notice',
  hadDraftAtLoad,
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
// Section renderers (one per step)
// ----------------------------------------------------------------------

// Step 1: Recipient Details
function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Recipient Details',
    description: 'Enter the details of the person acknowledging the code of conduct.'
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
    placeholder: 'e.g. Dr Jane Smith',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Recipient Role',
    section: 'recipientDetails',
    field: 'recipientRole',
    placeholder: 'e.g. General Practitioner, Healthcare Assistant, Contractor',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Employee / Contractor ID (optional)',
    section: 'recipientDetails',
    field: 'recipientEmployeeId',
    placeholder: 'e.g. 4827'
  }));

  return card;
}

// Step 2: Code of Conduct Notice (read-only twelve principles).
// Mirrors `Step2CodeOfConductNotice.svelte` 1:1.
const PRINCIPLES = [
  { number: 1,  text: 'Ensure all individuals eligible for the medical programme can access timely care.' },
  { number: 2,  text: 'Provide health care with competence and compassion.' },
  { number: 3,  text: 'Treat patients and colleagues with dignity and respect.' },
  { number: 4,  text: 'Ensure every encounter is conducted without discrimination based on age, sexual orientation, gender, race, ethnicity, national origin, language, disease, disability, or religion.' },
  { number: 5,  text: 'Do not engage in retaliation against colleagues or patients for any reason.' },
  { number: 6,  text: 'Make all reasonable attempts to respectfully provide care to each patient. If for any reason a provider is unable to do so, ensure the patient receives non-judgemental and prompt referral to another clinician, or seek alternative options to preserve patient autonomy.' },
  { number: 7,  text: "Provide each patient with the information needed for considered decision-making about their health. A patient's informed and voluntary consent must be secured, when possible, before initiating a medical procedure." },
  { number: 8,  text: 'Safeguard patient confidentiality, medical information, and privacy.' },
  { number: 9,  text: 'Report unintended events promptly, honestly, and thoroughly through appropriate channels.' },
  { number: 10, text: 'Commit to continued education and adaptation: fulfil educational and training requirements, seek out and apply the soundest medical guidance, and, in situations of uncertainty, ask for help.' },
  { number: 11, text: 'Follow guidelines and policies with professionalism, honesty, and integrity.' },
  { number: 12, text: 'Report wrongdoing (including violations of this Code of Conduct) to the appropriate authorities.' }
];

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Code of Conduct Notice',
    description: 'All medical-service providers, employed staff, contractors, eligible family members, and re-employed annuitants are expected to uphold the following principles.'
  });

  const prose = document.createElement('div');
  prose.className = 'principles-prose';

  const preamble = document.createElement('p');
  preamble.className = 'preamble';
  preamble.textContent =
    'This Code of Conduct reflects four fundamental principles: ' +
    '(1) responsibilities to patients; (2) respect for patients and ' +
    'colleagues; (3) adherence to established medical standards; ' +
    '(4) acknowledgement that medicine is an ever-evolving field that ' +
    'requires providers to stay current in their fields to ensure ' +
    'excellent patient care.';
  prose.appendChild(preamble);

  const ol = document.createElement('ol');
  ol.className = 'principles-list';
  for (const p of PRINCIPLES) {
    const li = document.createElement('li');
    li.textContent = p.text;
    ol.appendChild(li);
  }
  prose.appendChild(ol);

  const closing = document.createElement('p');
  closing.className = 'closing-note';
  closing.textContent =
    'Please read each principle carefully before proceeding to acknowledge and sign.';
  prose.appendChild(closing);

  card.appendChild(prose);
  return card;
}

// Step 3: Acknowledgement & Signature
function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Acknowledgement & Signature',
    description: 'Please confirm you have read and understood the code of conduct.'
  });

  const ackLabel = document.createElement('label');
  ackLabel.className = 'ack-checkbox';
  ackLabel.id = 'ack-checkbox-label';
  ackLabel.htmlFor = 'acknowledgementSignature-agreed';
  if (state.acknowledgementSignature.agreed) {
    ackLabel.classList.add('is-checked');
  }
  ackLabel.innerHTML = `
    <input
      type="checkbox"
      class="checkbox-input"
      id="acknowledgementSignature-agreed"
      name="acknowledgementSignature-agreed"
      ${state.acknowledgementSignature.agreed ? 'checked' : ''}
    >
    <span class="ack-checkbox-text">
      I have read, understood, and agree to uphold the above Code of Conduct
      principles. I will abide by these principles in every professional
      interaction with patients and colleagues.
      <span class="req" aria-hidden="true">*</span>
    </span>
  `;
  const ackInput = ackLabel.querySelector('input');
  ackInput.addEventListener('change', () => {
    setField('acknowledgementSignature', 'agreed', ackInput.checked);
  });
  card.appendChild(ackLabel);

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
 * but the helper is provided for symmetry with the canonical reference).
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
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'recipientDetails',         title: 'Recipient' },
  { step: 2, section: 'codeOfConductNotice',      title: 'Principles' },
  { step: 3, section: 'acknowledgementSignature', title: 'Sign-off' }
];

// Mapping from STEP_DEFINITIONS.section → set of tracked fields counted for
// completion of that section. Step 2 (the read-only principles) is treated
// as auto-complete since the user has nothing to fill in.
const STEP_SECTION_FIELDS = {
  recipientDetails: ['organisationName', 'recipientName', 'recipientRole'],
  codeOfConductNotice: [],
  acknowledgementSignature: ['agreed', 'recipientTypedFullName', 'recipientTypedDate']
};

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
    if (t === 0) {
      // Section with no tracked fields (e.g. the read-only principles step)
      // is considered finished — there's nothing for the user to fill in.
      li.dataset.status = 'finished';
      li.removeAttribute('aria-current');
    } else if (a === t) {
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
// Progress
// ----------------------------------------------------------------------

/**
 * Tracked fields = the validation-rule list. Each rule corresponds to a
 * single required field; we count how many are non-empty. The step-list
 * sub-totals come from STEP_SECTION_FIELDS so that the read-only step 2
 * is treated as auto-complete.
 */
function countAnswered() {
  let answered = 0;
  for (const rule of validationRules) {
    const v = state[rule.section] && state[rule.section][rule.field];
    if (v === '' || v === null || v === undefined || v === false) continue;
    answered++;
  }
  return answered;
}

function updateProgress() {
  const answered = countAnswered();
  const total = validationRules.length;
  const percent = total === 0 ? 100 : Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) {
    text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  }

  // Per-section step-list status.
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const def of STEP_DEFINITIONS) {
    const fields = STEP_SECTION_FIELDS[def.section] || [];
    sectionTotal[def.section] = fields.length;
    let a = 0;
    for (const field of fields) {
      const v = state[def.section] && state[def.section][field];
      if (v !== '' && v !== null && v !== undefined && v !== false) a++;
    }
    sectionAnswered[def.section] = a;
  }
  updateStepListStatuses(sectionAnswered, sectionTotal);
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

  // Acknowledgement checkbox is a separate widget — validate it explicitly.
  const ackInput = document.getElementById('acknowledgementSignature-agreed');
  if (ackInput && !ackInput.checked) {
    errors.push({
      id: 'acknowledgementSignature-agreed',
      message: 'Please confirm acknowledgement of the code of conduct.'
    });
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
    <div class="report-card">
      <header class="report-header">
        <h2>Code of Conduct Acknowledgement Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

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
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const { completeness, status, firedRules } = engineValidateForm(state);
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
