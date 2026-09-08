import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateRiskLevel } from './intake-grader.js';
import { emptyAssessment, riskLevelClass, riskLevelLabel } from './types.js';

// Patient Intake - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure intake grader and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'patient-intake.front-end-form-with-html.v1';
const TOTAL_STEPS = 10;

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
    const val = parsed && parsed[key];
    if (Array.isArray(fresh[key])) {
      if (Array.isArray(val)) fresh[key] = val;
    } else if (val && typeof val === 'object') {
      fresh[key] = { ...fresh[key], ...val };
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
    console.warn('Could not parse saved intake; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save intake to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored intake.', e);
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
  slug: 'patient-intake',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const report = document.getElementById('report');
    if (report) {
      report.innerHTML =
        '<p class="empty-message">Submit the form to see the report.</p>';
    }
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    updateConditionalSections();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
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
 *           placeholder?: string, required?: boolean, min?: number,
 *           max?: number, step?: number, unit?: string }} opts
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
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;

  const input = wrapper.querySelector('input');
  input.setAttribute('aria-describedby', `${id}-error`);
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

/**
 * Build a labelled multi-line text area.
 * @param {{ label: string, section: string, field: string, rows?: number,
 *           placeholder?: string, required?: boolean }} opts
 */
function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const required = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      aria-describedby="${id}-error"
      class="text-area-input"${required}>${esc(value)}</textarea>
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
 *           options: { value: string, label: string }[],
 *           required?: boolean }} opts
 */
function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  const required = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${required}>
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
 * Build a radio group.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[],
 *           required?: boolean }} opts
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
    const checked = current === option.value ? ' checked' : '';
    const required = opts.required ? ' data-required' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}${required}>
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
 * Build a checkbox group bound to an array of selected string values.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[] }} opts
 */
function checkboxGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'checkbox-group';
  list.setAttribute('role', 'group');
  list.setAttribute('aria-labelledby', wrapper.id);

  for (const option of opts.options) {
    const cbId = `${groupId}-${option.value}`;
    const arr = state[opts.section][opts.field];
    const checked = Array.isArray(arr) && arr.includes(option.value) ? ' checked' : '';
    const label = document.createElement('label');
    label.htmlFor = cbId;
    label.innerHTML = `
      <input class="checkbox-input" type="checkbox" id="${cbId}" value="${esc(option.value)}"${checked}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      const cur = state[opts.section][opts.field];
      if (input.checked) {
        if (!cur.includes(option.value)) cur.push(option.value);
      } else {
        const i = cur.indexOf(option.value);
        if (i >= 0) cur.splice(i, 1);
      }
      saveState(state);
      updateProgress();
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);
  return wrapper;
}

/**
 * Build a section card as a Lily fieldset.
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
// Repeating-list editors (medications, allergies)
// ----------------------------------------------------------------------

/** Editor for the array of {name, dose, frequency, prescriber} medications. */
function medicationListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.medications;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent =
        'No medications added. Click the button below to add one, or skip if you take none.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row med-row';
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Atorvastatin">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 20 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. once daily">
          </label>
          <label class="list-cell">
            <span>Prescriber</span>
            <input type="text" class="text-input" data-key="prescriber" value="${esc(row.prescriber)}" placeholder="e.g. GP">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove medication">&times;</button>
        </div>
      `;
      r.querySelectorAll('input').forEach((inp) => {
        inp.addEventListener('input', () => {
          rows[idx][inp.dataset.key] = inp.value;
          saveState(state);
          updateProgress();
        });
      });
      r.querySelector('button').addEventListener('click', () => {
        rows.splice(idx, 1);
        saveState(state);
        rerender();
        updateProgress();
      });
      wrapper.appendChild(r);
    });
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'button';
    addBtn.setAttribute('data-variant', 'add');
    addBtn.textContent = '+ Add medication';
    addBtn.addEventListener('click', () => {
      rows.push({ name: '', dose: '', frequency: '', prescriber: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

/** Editor for the array of {allergen, allergyType, reaction, severity} allergies. */
function allergyListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.allergies;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent =
        'No allergies added. Click the button below to add one, or skip if you have none.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row allergy-row';
      r.innerHTML = `
        <div class="list-grid allergy-grid">
          <label class="list-cell">
            <span>Allergen</span>
            <input type="text" class="text-input" data-key="allergen" value="${esc(row.allergen)}" placeholder="e.g. Penicillin">
          </label>
          <label class="list-cell">
            <span>Type</span>
            <select class="select" data-key="allergyType">
              <option value="">— Select —</option>
              <option value="drug"${row.allergyType === 'drug' ? ' selected' : ''}>Drug</option>
              <option value="food"${row.allergyType === 'food' ? ' selected' : ''}>Food</option>
              <option value="environmental"${row.allergyType === 'environmental' ? ' selected' : ''}>Environmental</option>
              <option value="latex"${row.allergyType === 'latex' ? ' selected' : ''}>Latex</option>
              <option value="other"${row.allergyType === 'other' ? ' selected' : ''}>Other</option>
            </select>
          </label>
          <label class="list-cell">
            <span>Reaction</span>
            <input type="text" class="text-input" data-key="reaction" value="${esc(row.reaction)}" placeholder="e.g. Rash, swelling">
          </label>
          <label class="list-cell">
            <span>Severity</span>
            <select class="select" data-key="severity">
              <option value="">— Select —</option>
              <option value="mild"${row.severity === 'mild' ? ' selected' : ''}>Mild</option>
              <option value="moderate"${row.severity === 'moderate' ? ' selected' : ''}>Moderate</option>
              <option value="anaphylaxis"${row.severity === 'anaphylaxis' ? ' selected' : ''}>Anaphylaxis</option>
            </select>
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove allergy">&times;</button>
        </div>
      `;
      r.querySelectorAll('input, select').forEach((inp) => {
        const handler = () => {
          rows[idx][inp.dataset.key] = inp.value;
          saveState(state);
          updateProgress();
        };
        inp.addEventListener('input', handler);
        inp.addEventListener('change', handler);
      });
      r.querySelector('button').addEventListener('click', () => {
        rows.splice(idx, 1);
        saveState(state);
        rerender();
        updateProgress();
      });
      wrapper.appendChild(r);
    });
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'button';
    addBtn.setAttribute('data-variant', 'add');
    addBtn.textContent = '+ Add allergy';
    addBtn.addEventListener('click', () => {
      rows.push({ allergen: '', allergyType: '', reaction: '', severity: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

// ----------------------------------------------------------------------
// Section renderers (1 per intake step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function subsectionHeader(title) {
  const h = document.createElement('h3');
  h.textContent = title;
  return h;
}

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Personal Information',
    description: 'Please provide your basic personal details.'
  });

  card.appendChild(textInput({
    label: 'Full Name', section: 'personalInformation', field: 'fullName', required: true
  }));

  card.appendChild(textInput({
    label: 'Date of Birth', section: 'personalInformation', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'personalInformation', field: 'sex', required: true,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Address Line 1', section: 'personalInformation', field: 'addressLine1', required: true
  }));
  card.appendChild(textInput({
    label: 'Address Line 2', section: 'personalInformation', field: 'addressLine2'
  }));

  const cityPost = document.createElement('div');
  cityPost.className = 'two-col';
  cityPost.appendChild(textInput({
    label: 'City', section: 'personalInformation', field: 'city', required: true
  }));
  cityPost.appendChild(textInput({
    label: 'Postcode', section: 'personalInformation', field: 'postcode', required: true
  }));
  card.appendChild(cityPost);

  const phoneEmail = document.createElement('div');
  phoneEmail.className = 'two-col';
  phoneEmail.appendChild(textInput({
    label: 'Phone Number', section: 'personalInformation', field: 'phone', type: 'tel', required: true
  }));
  phoneEmail.appendChild(textInput({
    label: 'Email', section: 'personalInformation', field: 'email', type: 'email'
  }));
  card.appendChild(phoneEmail);

  card.appendChild(subsectionHeader('Emergency Contact'));
  card.appendChild(textInput({
    label: 'Contact Name', section: 'personalInformation', field: 'emergencyContactName', required: true
  }));
  const ecGrid = document.createElement('div');
  ecGrid.className = 'two-col';
  ecGrid.appendChild(textInput({
    label: 'Contact Phone', section: 'personalInformation', field: 'emergencyContactPhone', type: 'tel', required: true
  }));
  ecGrid.appendChild(textInput({
    label: 'Relationship', section: 'personalInformation', field: 'emergencyContactRelationship'
  }));
  card.appendChild(ecGrid);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Insurance & ID',
    description: 'Insurance and identification details.'
  });

  card.appendChild(textInput({
    label: 'Insurance Provider', section: 'insuranceAndId', field: 'insuranceProvider'
  }));
  card.appendChild(textInput({
    label: 'Policy Number', section: 'insuranceAndId', field: 'policyNumber'
  }));
  card.appendChild(textInput({
    label: 'NHS Number', section: 'insuranceAndId', field: 'nhsNumber',
    placeholder: 'e.g. 943 476 5919'
  }));

  card.appendChild(subsectionHeader('GP Details'));
  card.appendChild(textInput({
    label: 'GP Name', section: 'insuranceAndId', field: 'gpName'
  }));
  card.appendChild(textInput({
    label: 'GP Practice Name', section: 'insuranceAndId', field: 'gpPracticeName'
  }));
  card.appendChild(textInput({
    label: 'GP Phone', section: 'insuranceAndId', field: 'gpPhone', type: 'tel'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Reason for Visit',
    description: 'Please describe why you are visiting today.'
  });

  card.appendChild(textArea({
    label: 'Primary Reason for Visit',
    section: 'reasonForVisit', field: 'primaryReason',
    placeholder: 'Please describe your main reason for visiting',
    required: true
  }));

  card.appendChild(selectInput({
    label: 'Urgency Level',
    section: 'reasonForVisit', field: 'urgencyLevel', required: true,
    options: [
      { value: 'routine', label: 'Routine' },
      { value: 'urgent', label: 'Urgent' },
      { value: 'emergency', label: 'Emergency' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Referring Provider',
    section: 'reasonForVisit', field: 'referringProvider',
    placeholder: 'If referred by another doctor'
  }));

  card.appendChild(textInput({
    label: 'How long have you had these symptoms?',
    section: 'reasonForVisit', field: 'symptomDuration',
    placeholder: 'e.g. 2 weeks, 3 months'
  }));

  card.appendChild(textArea({
    label: 'Additional Details',
    section: 'reasonForVisit', field: 'additionalDetails',
    placeholder: "Any other information you'd like to share"
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Medical History',
    description: 'Your past and current medical conditions.'
  });

  card.appendChild(checkboxGroup({
    label: 'Do you have any of the following chronic conditions?',
    section: 'medicalHistory', field: 'chronicConditions',
    options: [
      { value: 'hypertension', label: 'Hypertension' },
      { value: 'type-1-diabetes', label: 'Type 1 Diabetes' },
      { value: 'type-2-diabetes', label: 'Type 2 Diabetes' },
      { value: 'heart-disease', label: 'Heart Disease' },
      { value: 'heart-failure', label: 'Heart Failure' },
      { value: 'asthma', label: 'Asthma' },
      { value: 'copd', label: 'COPD' },
      { value: 'chronic-kidney-disease', label: 'Chronic Kidney Disease' },
      { value: 'liver-disease', label: 'Liver Disease' },
      { value: 'thyroid-disorder', label: 'Thyroid Disorder' },
      { value: 'epilepsy', label: 'Epilepsy' },
      { value: 'arthritis', label: 'Arthritis' },
      { value: 'cancer', label: 'Cancer' },
      { value: 'depression', label: 'Depression' },
      { value: 'anxiety', label: 'Anxiety' },
      { value: 'autoimmune-disorder', label: 'Autoimmune Disorder' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Previous Surgeries',
    section: 'medicalHistory', field: 'previousSurgeries',
    placeholder: 'List any previous surgeries with approximate dates'
  }));

  card.appendChild(textArea({
    label: 'Previous Hospitalizations',
    section: 'medicalHistory', field: 'previousHospitalizations',
    placeholder: 'List any previous hospital stays with approximate dates and reasons'
  }));

  card.appendChild(textArea({
    label: 'Ongoing Treatments',
    section: 'medicalHistory', field: 'ongoingTreatments',
    placeholder: 'Describe any ongoing treatments or therapies'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Current Medications',
    description: 'List all medications you currently take, including over-the-counter and supplements.'
  });
  card.appendChild(medicationListEditor());
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Allergies',
    description: 'List any known allergies (drug, food, environmental, latex, etc.).'
  });
  card.appendChild(allergyListEditor());
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Family History',
    description: 'Medical conditions in your immediate family (parents, siblings, children).'
  });

  const conditions = [
    ['heartDisease',     'heartDiseaseDetails',     'Heart disease in family?',     'Please provide details'],
    ['cancer',           'cancerDetails',           'Cancer in family?',            'Please provide details (type, relation)'],
    ['diabetes',         'diabetesDetails',         'Diabetes in family?',          'Please provide details'],
    ['stroke',           'strokeDetails',           'Stroke in family?',            'Please provide details'],
    ['mentalIllness',    'mentalIllnessDetails',    'Mental illness in family?',    'Please provide details'],
    ['geneticConditions','geneticConditionsDetails','Genetic conditions in family?','Please provide details']
  ];
  for (const [field, detailField, label, detailLabel] of conditions) {
    card.appendChild(radioGroup({
      label, section: 'familyHistory', field, options: yesNo
    }));
    const details = document.createElement('div');
    details.dataset.conditional = `familyHistory.${field}=yes`;
    details.appendChild(textInput({
      label: detailLabel, section: 'familyHistory', field: detailField
    }));
    card.appendChild(details);
  }

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Social History',
    description: 'Lifestyle factors relevant to your health.'
  });

  card.appendChild(selectInput({
    label: 'Smoking status',
    section: 'socialHistory', field: 'smokingStatus',
    options: [
      { value: 'current', label: 'Current smoker' },
      { value: 'ex', label: 'Ex-smoker' },
      { value: 'never', label: 'Never smoked' }
    ]
  }));
  const packHost = document.createElement('div');
  packHost.dataset.conditionalAny = 'socialHistory.smokingStatus=current,ex';
  packHost.appendChild(textInput({
    label: 'Pack years', section: 'socialHistory', field: 'smokingPackYears',
    type: 'number', min: 0, max: 200
  }));
  card.appendChild(packHost);

  card.appendChild(selectInput({
    label: 'Alcohol consumption',
    section: 'socialHistory', field: 'alcoholFrequency',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional (1-7 units/week)' },
      { value: 'moderate', label: 'Moderate (8-14 units/week)' },
      { value: 'heavy', label: 'Heavy (>14 units/week)' }
    ]
  }));
  const unitsHost = document.createElement('div');
  unitsHost.dataset.conditionalAny = 'socialHistory.alcoholFrequency=occasional,moderate,heavy';
  unitsHost.appendChild(textInput({
    label: 'Units per week', section: 'socialHistory', field: 'alcoholUnitsPerWeek',
    type: 'number', min: 0, max: 200
  }));
  card.appendChild(unitsHost);

  card.appendChild(selectInput({
    label: 'Recreational drug use',
    section: 'socialHistory', field: 'drugUse',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional' },
      { value: 'regular', label: 'Regular' }
    ]
  }));
  const drugDetailsHost = document.createElement('div');
  drugDetailsHost.dataset.conditionalAny = 'socialHistory.drugUse=occasional,regular';
  drugDetailsHost.appendChild(textInput({
    label: 'Please provide details (substance, frequency)',
    section: 'socialHistory', field: 'drugDetails'
  }));
  card.appendChild(drugDetailsHost);

  card.appendChild(textInput({
    label: 'Occupation', section: 'socialHistory', field: 'occupation'
  }));

  card.appendChild(selectInput({
    label: 'Exercise frequency',
    section: 'socialHistory', field: 'exerciseFrequency',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional (1-2 times/week)' },
      { value: 'moderate', label: 'Moderate (3-4 times/week)' },
      { value: 'regular', label: 'Regular (5+ times/week)' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Diet quality',
    section: 'socialHistory', field: 'dietQuality',
    options: [
      { value: 'poor', label: 'Poor' },
      { value: 'average', label: 'Average' },
      { value: 'good', label: 'Good' },
      { value: 'excellent', label: 'Excellent' }
    ]
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Review of Systems',
    description: 'Please note any current symptoms in each area. Leave blank if none.'
  });

  card.appendChild(textArea({
    label: 'Constitutional (fever, weight changes, fatigue)',
    section: 'reviewOfSystems', field: 'constitutional',
    placeholder: 'e.g. unexplained weight loss, persistent fatigue'
  }));
  card.appendChild(textArea({
    label: 'HEENT (Head, Eyes, Ears, Nose, Throat)',
    section: 'reviewOfSystems', field: 'heent',
    placeholder: 'e.g. headaches, vision changes, hearing loss'
  }));
  card.appendChild(textArea({
    label: 'Cardiovascular',
    section: 'reviewOfSystems', field: 'cardiovascular',
    placeholder: 'e.g. chest pain, palpitations, shortness of breath on exertion'
  }));
  card.appendChild(textArea({
    label: 'Respiratory',
    section: 'reviewOfSystems', field: 'respiratory',
    placeholder: 'e.g. cough, wheezing, shortness of breath'
  }));
  card.appendChild(textArea({
    label: 'Gastrointestinal',
    section: 'reviewOfSystems', field: 'gastrointestinal',
    placeholder: 'e.g. nausea, abdominal pain, changes in bowel habits'
  }));
  card.appendChild(textArea({
    label: 'Genitourinary',
    section: 'reviewOfSystems', field: 'genitourinary',
    placeholder: 'e.g. urinary frequency, pain, blood in urine'
  }));
  card.appendChild(textArea({
    label: 'Musculoskeletal',
    section: 'reviewOfSystems', field: 'musculoskeletal',
    placeholder: 'e.g. joint pain, stiffness, swelling'
  }));
  card.appendChild(textArea({
    label: 'Neurological',
    section: 'reviewOfSystems', field: 'neurological',
    placeholder: 'e.g. numbness, tingling, weakness, seizures'
  }));
  card.appendChild(textArea({
    label: 'Psychiatric',
    section: 'reviewOfSystems', field: 'psychiatric',
    placeholder: 'e.g. anxiety, depression, sleep disturbance'
  }));
  card.appendChild(textArea({
    label: 'Skin',
    section: 'reviewOfSystems', field: 'skin',
    placeholder: 'e.g. rashes, lesions, changes in moles'
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Consent & Preferences',
    description: 'Please review and confirm your preferences.'
  });

  card.appendChild(radioGroup({
    label: 'Do you consent to treatment?',
    section: 'consentAndPreferences', field: 'consentToTreatment',
    options: yesNo, required: true
  }));

  card.appendChild(radioGroup({
    label: 'Do you acknowledge our privacy notice and agree to the use of your data for clinical purposes?',
    section: 'consentAndPreferences', field: 'privacyAcknowledgement',
    options: yesNo, required: true
  }));

  card.appendChild(selectInput({
    label: 'Preferred communication method',
    section: 'consentAndPreferences', field: 'communicationPreference',
    options: [
      { value: 'phone', label: 'Phone' },
      { value: 'email', label: 'Email' },
      { value: 'text', label: 'Text/SMS' },
      { value: 'post', label: 'Post' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Do you have any advance directives (living will, power of attorney for healthcare)?',
    section: 'consentAndPreferences', field: 'advanceDirectives',
    options: yesNo
  }));
  const adHost = document.createElement('div');
  adHost.dataset.conditional = 'consentAndPreferences.advanceDirectives=yes';
  adHost.appendChild(textArea({
    label: 'Please provide details',
    section: 'consentAndPreferences', field: 'advanceDirectiveDetails'
  }));
  card.appendChild(adHost);

  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
  renderStep6, renderStep7, renderStep8, renderStep9, renderStep10
];

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
  document.querySelectorAll('[data-conditional-any]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-any');
    const [path, targetCsv] = expr.split('=');
    const [section, field] = path.split('.');
    const current = String(state[section]?.[field] ?? '');
    const targets = targetCsv.split(',');
    host.style.display = targets.includes(current) ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Personal Information
  ['personalInformation', 'fullName'],
  ['personalInformation', 'dateOfBirth'],
  ['personalInformation', 'sex'],
  ['personalInformation', 'addressLine1'],
  ['personalInformation', 'city'],
  ['personalInformation', 'postcode'],
  ['personalInformation', 'phone'],
  ['personalInformation', 'emergencyContactName'],
  ['personalInformation', 'emergencyContactPhone'],
  // Insurance & ID
  ['insuranceAndId', 'gpName'],
  // Reason for Visit
  ['reasonForVisit', 'primaryReason'],
  ['reasonForVisit', 'urgencyLevel'],
  // Family History
  ['familyHistory', 'heartDisease'],
  ['familyHistory', 'cancer'],
  ['familyHistory', 'diabetes'],
  ['familyHistory', 'stroke'],
  ['familyHistory', 'mentalIllness'],
  ['familyHistory', 'geneticConditions'],
  // Social History
  ['socialHistory', 'smokingStatus'],
  ['socialHistory', 'alcoholFrequency'],
  ['socialHistory', 'drugUse'],
  ['socialHistory', 'exerciseFrequency'],
  ['socialHistory', 'dietQuality'],
  // Consent
  ['consentAndPreferences', 'consentToTreatment'],
  ['consentAndPreferences', 'privacyAcknowledgement'],
  ['consentAndPreferences', 'communicationPreference'],
  ['consentAndPreferences', 'advanceDirectives']
];

// Section keys used by the step list (one per step). The progress counter
// uses both section + a synthetic "chronicConditions" pseudo-field.
const SECTION_KEYS = {
  personalInformation: 1,
  insuranceAndId: 2,
  reasonForVisit: 3,
  medicalHistory: 4,
  medications: 5,
  allergies: 6,
  familyHistory: 7,
  socialHistory: 8,
  reviewOfSystems: 9,
  consentAndPreferences: 10
};

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
  // Medical history step is tracked via the chronicConditions array
  // (one logical answer if any selected).
  sectionTotal.medicalHistory = (sectionTotal.medicalHistory || 0) + 1;
  if (Array.isArray(state.medicalHistory.chronicConditions) &&
      state.medicalHistory.chronicConditions.length > 0) {
    answered++;
    sectionAnswered.medicalHistory = (sectionAnswered.medicalHistory || 0) + 1;
  }
  // Medications and allergies steps: count as one answered if any row added.
  sectionTotal.medications = 1;
  if (Array.isArray(state.medications) && state.medications.length > 0) {
    sectionAnswered.medications = 1;
  }
  sectionTotal.allergies = 1;
  if (Array.isArray(state.allergies) && state.allergies.length > 0) {
    sectionAnswered.allergies = 1;
  }

  const total = TRACKED_FIELDS.length + 1; // +1 for chronicConditions
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
  { step: 1,  section: 'personalInformation',  title: 'Personal Information' },
  { step: 2,  section: 'insuranceAndId',       title: 'Insurance & ID' },
  { step: 3,  section: 'reasonForVisit',       title: 'Reason for Visit' },
  { step: 4,  section: 'medicalHistory',       title: 'Medical History' },
  { step: 5,  section: 'medications',          title: 'Medications' },
  { step: 6,  section: 'allergies',            title: 'Allergies' },
  { step: 7,  section: 'familyHistory',        title: 'Family History' },
  { step: 8,  section: 'socialHistory',        title: 'Social History' },
  { step: 9,  section: 'reviewOfSystems',      title: 'Review of Systems' },
  { step: 10, section: 'consentAndPreferences', title: 'Consent & Preferences' }
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
    if (t > 0 && a >= t) {
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

  // Validate plain inputs / selects / textareas marked data-required.
  const required = form.querySelectorAll('input[data-required], select[data-required], textarea[data-required]');
  const seenGroups = new Set();
  required.forEach((input) => {
    // Radio inputs: validate by group name (once per group).
    if (input.type === 'radio') {
      const group = input.name;
      if (seenGroups.has(group)) return;
      seenGroups.add(group);
      const checked = form.querySelector(`input[type="radio"][name="${group}"]:checked`);
      if (!checked) {
        const fieldset = document.getElementById(`${group}-fieldset`);
        const legendEl = fieldset ? fieldset.querySelector('legend') : null;
        const label = legendEl
          ? legendEl.textContent.replace(/\s*\*\s*$/, '').trim()
          : group;
        errors.push({ id: group, message: `${label} is required` });
        setFieldError(group, `${label} is required`);
      } else {
        clearFieldError(group);
      }
      return;
    }
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

  const { riskLevel, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
      <td class="risk risk-${esc(r.riskLevel)}">${esc(r.riskLevel)}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No risk rules fired — minimal complexity profile.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Description</th>
            <th scope="col">Risk</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <h2>Patient Intake Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Overall Risk Level</h3>
    <p class="risk-summary">
      <span class="risk-badge ${riskLevelClass(riskLevel)}">${esc(riskLevel)}</span>
      <span class="risk-label">${esc(riskLevelLabel(riskLevel))}</span>
    </p>
    <p class="muted">Based on ${firedRules.length} fired rule(s) across the questionnaire.</p>

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
  const { riskLevel, firedRules } = calculateRiskLevel(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    riskLevel,
    firedRules,
    additionalFlags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh intake?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const report = document.getElementById('report');
  if (report) {
    report.innerHTML =
      '<p class="empty-message">Submit the form to see the report.</p>';
  }
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
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

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
