import { detectAdditionalFlags } from './flagged-issues.js';
import { calculatePriorityLevel } from './prescription-grader.js';
import { emptyAssessment, priorityLevelClass, priorityLevelLabel } from './types.js';

// Prescription Request - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a top-of-page native
// <progress> element plus an ordered step-list reflect how many fields have
// been answered. Submission validates required fields, runs the pure
// priority-classification engine, and renders an inline report. State is
// persisted to localStorage so a partial fill survives a reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'prescription-request.front-end-form-with-html.v1';
const TOTAL_STEPS = 5;

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
    console.warn('Could not parse saved request; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save request to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored request.', e);
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
  slug: 'prescription-request',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state, persist, and refresh progress.
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
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
// Lily-class lookup for native input types
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

// ----------------------------------------------------------------------
// Component builders
// ----------------------------------------------------------------------

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
    `value="${esc(value ?? '')}"`,
    `aria-describedby="${id}-error"`
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
  input.addEventListener('input', () => {
    setField(opts.section, opts.field, input.value);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Build a labelled multi-line text area.
 * @param {{ label: string, section: string, field: string, rows?: number,
 *           placeholder?: string }} opts
 */
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
    <span class="error-message" id="${id}-error"></span>
  `;
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => {
    setField(opts.section, opts.field, ta.value);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Build a select / dropdown input.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[] }} opts
 */
function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error">
      ${optionsHtml}
    </select>
    <span class="error-message" id="${id}-error"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => {
    setField(opts.section, opts.field, sel.value);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Build a radio group as `fieldset.field` + `legend.label` +
 * `div.radio-group[role=radiogroup]` containing `input.radio-input`s.
 * @param {{ label: string, section: string, field: string, required?: boolean,
 *           options: { value: string, label: string }[] }} opts
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
    label.className = 'radio-option';
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

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = `${groupId}-error`;
  wrapper.appendChild(errSpan);
  return wrapper;
}

/**
 * Build a section card as `fieldset.fieldset` + `legend.fieldset-legend`.
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
// Section option lists
// ----------------------------------------------------------------------

const yesNoOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const newRefillOptions = [
  { value: 'yes', label: 'New Prescription' },
  { value: 'no', label: 'Refill / Repeat' }
];

const emergencyOptions = [
  { value: 'yes', label: 'Emergency' },
  { value: 'no', label: 'Normal' }
];

const routeOptions = [
  { value: 'oral', label: 'Oral' },
  { value: 'topical', label: 'Topical' },
  { value: 'intravenous', label: 'Intravenous' },
  { value: 'intramuscular', label: 'Intramuscular' },
  { value: 'subcutaneous', label: 'Subcutaneous' },
  { value: 'inhaled', label: 'Inhaled' },
  { value: 'rectal', label: 'Rectal' },
  { value: 'sublingual', label: 'Sublingual' },
  { value: 'transdermal', label: 'Transdermal' },
  { value: 'other', label: 'Other' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per Svelte step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Patient Information',
    description: 'Details of the patient requesting the prescription.'
  });

  const names = document.createElement('div');
  names.className = 'two-col';
  names.appendChild(textInput({
    label: 'First Name', section: 'patientInformation', field: 'firstName', required: true
  }));
  names.appendChild(textInput({
    label: 'Last Name', section: 'patientInformation', field: 'lastName', required: true
  }));
  card.appendChild(names);

  card.appendChild(textInput({
    label: 'NHS Patient Number',
    section: 'patientInformation', field: 'nhsNumber',
    placeholder: 'e.g. 943 476 5919'
  }));

  const contact = document.createElement('div');
  contact.className = 'two-col';
  contact.appendChild(textInput({
    label: 'Phone', section: 'patientInformation', field: 'phone', required: true
  }));
  contact.appendChild(textInput({
    label: 'Email', section: 'patientInformation', field: 'email', type: 'email'
  }));
  card.appendChild(contact);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Clinician Information',
    description: 'Details of the prescribing clinician.'
  });

  const names = document.createElement('div');
  names.className = 'two-col';
  names.appendChild(textInput({
    label: 'First Name', section: 'clinicianInformation', field: 'firstName', required: true
  }));
  names.appendChild(textInput({
    label: 'Last Name', section: 'clinicianInformation', field: 'lastName', required: true
  }));
  card.appendChild(names);

  card.appendChild(textInput({
    label: 'NHS Employee Number',
    section: 'clinicianInformation', field: 'nhsEmployeeNumber',
    placeholder: 'e.g. C1234567'
  }));

  const contact = document.createElement('div');
  contact.className = 'two-col';
  contact.appendChild(textInput({
    label: 'Phone', section: 'clinicianInformation', field: 'phone', required: true
  }));
  contact.appendChild(textInput({
    label: 'Email', section: 'clinicianInformation', field: 'email', type: 'email'
  }));
  card.appendChild(contact);

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Prescription Details',
    description: 'Medication and dosage information.'
  });

  card.appendChild(textInput({
    label: 'Request Date',
    section: 'prescriptionDetails', field: 'requestDate',
    type: 'date', required: true
  }));
  card.appendChild(textInput({
    label: 'Medication Name',
    section: 'prescriptionDetails', field: 'medicationName',
    required: true, placeholder: 'e.g. Amoxicillin'
  }));

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Dosage',
    section: 'prescriptionDetails', field: 'dosage',
    required: true, placeholder: 'e.g. 500mg'
  }));
  grid.appendChild(textInput({
    label: 'Frequency',
    section: 'prescriptionDetails', field: 'frequency',
    placeholder: 'e.g. TDS, BD, OD'
  }));
  card.appendChild(grid);

  card.appendChild(selectInput({
    label: 'Route of Administration',
    section: 'prescriptionDetails', field: 'routeOfAdministration',
    options: routeOptions
  }));
  card.appendChild(textArea({
    label: 'Treatment Instructions',
    section: 'prescriptionDetails', field: 'treatmentInstructions',
    placeholder: 'Instructions for the patient…',
    rows: 3
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Substitution Options',
    description: 'Indicate whether alternatives are acceptable.'
  });

  card.appendChild(radioGroup({
    label: 'Allow brand name substitution?',
    section: 'substitutionOptions', field: 'allowBrandSubstitution',
    options: yesNoOptions
  }));
  card.appendChild(radioGroup({
    label: 'Allow generic substitution?',
    section: 'substitutionOptions', field: 'allowGenericSubstitution',
    options: yesNoOptions
  }));
  card.appendChild(radioGroup({
    label: 'Allow dosage adjustment?',
    section: 'substitutionOptions', field: 'allowDosageAdjustment',
    options: yesNoOptions
  }));
  card.appendChild(textArea({
    label: 'Substitution Notes',
    section: 'substitutionOptions', field: 'substitutionNotes',
    placeholder: 'Any additional notes about substitution preferences…',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Request Type',
    description: 'Classify this prescription request.'
  });

  card.appendChild(radioGroup({
    label: 'Is this a new prescription or a refill?',
    section: 'requestType', field: 'isNewPrescription',
    required: true,
    options: newRefillOptions
  }));
  card.appendChild(radioGroup({
    label: 'Is this an emergency request?',
    section: 'requestType', field: 'isEmergency',
    required: true,
    options: emergencyOptions
  }));
  card.appendChild(textArea({
    label: 'Additional Notes',
    section: 'requestType', field: 'additionalNotes',
    placeholder: 'Any other information relevant to this request…',
    rows: 3
  }));

  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5
];

// ----------------------------------------------------------------------
// Progress / tracked fields per section
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Patient information (1)
  ['patientInformation', 'firstName'],
  ['patientInformation', 'lastName'],
  ['patientInformation', 'phone'],
  ['patientInformation', 'email'],
  ['patientInformation', 'nhsNumber'],
  // Clinician information (2)
  ['clinicianInformation', 'firstName'],
  ['clinicianInformation', 'lastName'],
  ['clinicianInformation', 'phone'],
  ['clinicianInformation', 'email'],
  ['clinicianInformation', 'nhsEmployeeNumber'],
  // Prescription details (3)
  ['prescriptionDetails', 'requestDate'],
  ['prescriptionDetails', 'medicationName'],
  ['prescriptionDetails', 'dosage'],
  ['prescriptionDetails', 'frequency'],
  ['prescriptionDetails', 'routeOfAdministration'],
  ['prescriptionDetails', 'treatmentInstructions'],
  // Substitution options (4)
  ['substitutionOptions', 'allowBrandSubstitution'],
  ['substitutionOptions', 'allowGenericSubstitution'],
  ['substitutionOptions', 'allowDosageAdjustment'],
  // Request type (5)
  ['requestType', 'isNewPrescription'],
  ['requestType', 'isEmergency']
];

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    const v = state[section][field];
    if (v !== null && v !== undefined && v !== '') {
      answered++;
      sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
    }
  }
  const total = TRACKED_FIELDS.length;
  const percent = Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'patientInformation',   title: 'Patient Information' },
  { step: 2, section: 'clinicianInformation', title: 'Clinician Information' },
  { step: 3, section: 'prescriptionDetails',  title: 'Prescription Details' },
  { step: 4, section: 'substitutionOptions',  title: 'Substitution Options' },
  { step: 5, section: 'requestType',          title: 'Request Type' }
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
  // Track radio-group required validations only once per group name.
  const seenRadioGroups = new Set();
  const required = form.querySelectorAll('[data-required]');
  required.forEach((input) => {
    if (input.type === 'radio') {
      const name = input.name;
      if (seenRadioGroups.has(name)) return;
      seenRadioGroups.add(name);
      const checked = form.querySelector(`input[name="${name}"]:checked`);
      const legend = form.querySelector(`#${name}-fieldset > legend`);
      const label = legend
        ? legend.textContent.replace(/\s*\*\s*$/, '').trim()
        : name;
      if (!checked) {
        errors.push({ id: name, message: `${label} is required` });
        setFieldError(name, `${label} is required`);
      } else {
        clearFieldError(name);
      }
      return;
    }
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
  if (typeof summary.focus === 'function') {
    try { summary.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }
}

// ----------------------------------------------------------------------
// Submit / Report
// ----------------------------------------------------------------------

function flagPriorityClass(priority) {
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

  const { priorityLevel, firedRules, additionalFlags, timestamp } = lastResult;

  const flagsList = additionalFlags.length === 0
    ? `<p class="muted">No additional flags raised.</p>`
    : `
      <ul class="flags">
        ${additionalFlags.map((f) => `
          <li class="${flagPriorityClass(f.priority)}">
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
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
      <td>${esc(r.priorityLevel.toUpperCase())}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No classification rules fired - default routine processing.</p>`
    : `
      <table class="rules">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Description</th>
            <th scope="col">Priority</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <h2>Prescription Request Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Priority Classification</h3>
    <p class="priority-summary">
      <span class="priority-badge ${priorityLevelClass(priorityLevel)}">${esc(priorityLevel)}</span>
      <span class="priority-description">${esc(priorityLevelLabel(priorityLevel))}</span>
    </p>

    <h3>Fired Rules</h3>
    ${firedTable}

    <h3>Flagged Issues</h3>
    ${flagsList}

    <div class="report-actions">
      <button type="button" id="print-btn" class="button" data-variant="secondary">Print / save PDF</button>
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
  document.getElementById('print-btn').addEventListener('click', () => window.print());
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const { priorityLevel, firedRules } = calculatePriorityLevel(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    priorityLevel,
    firedRules,
    additionalFlags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh request?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
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

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
