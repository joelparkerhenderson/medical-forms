import { detectAdditionalFlags } from './flagged-issues.js';
import { emptyAssessment, vaGradeClass, vaGradeLabel } from './types.js';
import { calculateVisualAcuityGrade } from './va-grader.js';

// Ophthalmology Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure VA grading engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'ophthalmology-assessment.front-end-form-with-html.v1';

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
  slug: 'ophthalmology-assessment',
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a field on the state and persist.
 * Re-runs progress and conditional visibility after each change.
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

/**
 * Build a labelled text input.
 * @param {{ label: string, section: string, field: string, type?: string,
 *           placeholder?: string, required?: boolean, min?: number,
 *           max?: number, step?: number, unit?: string }} opts
 */
/** Map an <input type=…> to its Lily class name. */
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
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
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
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      ${opts.required ? 'required data-required' : ''}
      aria-describedby="${id}-error"
      class="text-area-input">${esc(value)}</textarea>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => { setField(opts.section, opts.field, ta.value); clearFieldError(id); });
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
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => { setField(opts.section, opts.field, sel.value); clearFieldError(id); });
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

/** A sub-section heading inside a section card. */
function subHeader(text) {
  const h = document.createElement('h3');
  h.className = 'subsection-header';
  h.textContent = text;
  return h;
}

/**
 * Build a section card.
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
  legend.innerHTML =
    `<span class="section-step">Section ${opts.stepNumber} of 10</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Repeating-list editors (eye drops, oral medications, drug allergies)
// ----------------------------------------------------------------------

/**
 * Editor for an array of {name, dose, frequency} medication rows.
 * @param {{ section: string, field: string, addLabel: string,
 *           emptyMessage: string, namePlaceholder: string }} opts
 */
function medicationListEditor(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';
  wrapper.dataset.list = `${opts.section}.${opts.field}`;

  function rerender() {
    const rows = state[opts.section][opts.field];
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = opts.emptyMessage;
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row med-row';
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="${esc(opts.namePlaceholder)}">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 1 drop">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. BD, QDS">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove medication">&times;</button>
        </div>
      `;
      r.querySelectorAll('input').forEach((inp) => {
        inp.addEventListener('input', () => {
          const k = inp.dataset.key;
          rows[idx][k] = inp.value;
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
    addBtn.textContent = `+ ${opts.addLabel}`;
    addBtn.addEventListener('click', () => {
      rows.push({ name: '', dose: '', frequency: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

/** Editor for an array of {allergen, reaction, severity} ophthalmic-drug-allergy rows. */
function drugAllergyEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.currentMedications.ophthalmicDrugAllergies;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No ophthalmic drug allergies added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row allergy-row';
      r.innerHTML = `
        <div class="list-grid allergy-grid">
          <label class="list-cell">
            <span>Drug / allergen</span>
            <input type="text" class="text-input" data-key="allergen" value="${esc(row.allergen)}" placeholder="e.g. Timolol, sulfonamide">
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
          <button type="button" class="button" data-variant="icon" aria-label="Remove drug allergy">&times;</button>
        </div>
      `;
      r.querySelectorAll('input, select').forEach((inp) => {
        inp.addEventListener('input', () => {
          rows[idx][inp.dataset.key] = inp.value;
          saveState(state);
          updateProgress();
        });
        inp.addEventListener('change', () => {
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
    addBtn.textContent = '+ Add ophthalmic drug allergy';
    addBtn.addEventListener('click', () => {
      rows.push({ allergen: '', reaction: '', severity: '' });
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
// Section renderers (one per assessment step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const normalAbnormal = [
  { value: 'yes', label: 'Normal' },
  { value: 'no', label: 'Abnormal' }
];

const eyeOptions = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'both', label: 'Both' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic patient information.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'demographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Date of Birth',
    section: 'demographics',
    field: 'dateOfBirth',
    type: 'date',
    required: true
  }));
  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'demographics',
    field: 'sex',
    required: true,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Chief Complaint',
    description: 'Primary eye concern and symptom details.'
  });

  card.appendChild(textArea({
    label: 'What is your primary eye concern?',
    section: 'chiefComplaint', field: 'primaryConcern',
    required: true,
    placeholder: 'Describe your main eye problem or reason for visit',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Which eye is affected?',
    section: 'chiefComplaint', field: 'affectedEye',
    options: eyeOptions,
    required: true
  }));

  card.appendChild(radioGroup({
    label: 'How did the symptoms start?',
    section: 'chiefComplaint', field: 'onsetType',
    options: [
      { value: 'sudden', label: 'Sudden' },
      { value: 'gradual', label: 'Gradual' }
    ]
  }));

  const durGrid = document.createElement('div');
  durGrid.className = 'two-col';
  durGrid.appendChild(textInput({
    label: 'Duration',
    section: 'chiefComplaint', field: 'durationValue',
    placeholder: 'e.g. 3'
  }));
  durGrid.appendChild(selectInput({
    label: 'Duration unit',
    section: 'chiefComplaint', field: 'durationUnit',
    options: [
      { value: 'hours', label: 'Hours' },
      { value: 'days', label: 'Days' },
      { value: 'weeks', label: 'Weeks' },
      { value: 'months', label: 'Months' },
      { value: 'years', label: 'Years' }
    ]
  }));
  card.appendChild(durGrid);

  card.appendChild(radioGroup({
    label: 'Is there any eye pain?',
    section: 'chiefComplaint', field: 'painPresent', options: yesNo
  }));

  const painSeverity = document.createElement('div');
  painSeverity.dataset.conditional = 'chiefComplaint.painPresent=yes';
  painSeverity.appendChild(selectInput({
    label: 'Pain severity (1-10)',
    section: 'chiefComplaint', field: 'painSeverity',
    options: [
      { value: '1', label: '1 - Minimal' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
      { value: '5', label: '5 - Moderate' },
      { value: '6', label: '6' },
      { value: '7', label: '7' },
      { value: '8', label: '8' },
      { value: '9', label: '9' },
      { value: '10', label: '10 - Worst possible' }
    ]
  }));
  card.appendChild(painSeverity);

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Visual Acuity',
    description: 'Distance and near visual acuity measurements (Snellen 6-metre notation, e.g. 6/6, 6/12, 6/60).'
  });

  card.appendChild(subHeader('Distance VA — Right Eye'));
  const distR = document.createElement('div');
  distR.className = 'two-col';
  distR.appendChild(textInput({ label: 'Uncorrected', section: 'visualAcuity', field: 'distanceVaRightUncorrected', placeholder: 'e.g. 6/12' }));
  distR.appendChild(textInput({ label: 'Best Corrected', section: 'visualAcuity', field: 'distanceVaRightCorrected', placeholder: 'e.g. 6/6' }));
  card.appendChild(distR);

  card.appendChild(subHeader('Distance VA — Left Eye'));
  const distL = document.createElement('div');
  distL.className = 'two-col';
  distL.appendChild(textInput({ label: 'Uncorrected', section: 'visualAcuity', field: 'distanceVaLeftUncorrected', placeholder: 'e.g. 6/12' }));
  distL.appendChild(textInput({ label: 'Best Corrected', section: 'visualAcuity', field: 'distanceVaLeftCorrected', placeholder: 'e.g. 6/6' }));
  card.appendChild(distL);

  card.appendChild(subHeader('Near VA'));
  const near = document.createElement('div');
  near.className = 'two-col';
  near.appendChild(textInput({ label: 'Right Eye', section: 'visualAcuity', field: 'nearVaRight', placeholder: 'e.g. N5' }));
  near.appendChild(textInput({ label: 'Left Eye', section: 'visualAcuity', field: 'nearVaLeft', placeholder: 'e.g. N5' }));
  card.appendChild(near);

  card.appendChild(subHeader('Pinhole'));
  const pin = document.createElement('div');
  pin.className = 'two-col';
  pin.appendChild(textInput({ label: 'Right Eye', section: 'visualAcuity', field: 'pinholeRight', placeholder: 'e.g. 6/6' }));
  pin.appendChild(textInput({ label: 'Left Eye', section: 'visualAcuity', field: 'pinholeLeft', placeholder: 'e.g. 6/6' }));
  card.appendChild(pin);

  card.appendChild(subHeader('Refraction'));
  const ref = document.createElement('div');
  ref.className = 'two-col';
  ref.appendChild(textInput({ label: 'Right Eye', section: 'visualAcuity', field: 'refractionRight', placeholder: 'e.g. -2.50/-1.00x180' }));
  ref.appendChild(textInput({ label: 'Left Eye', section: 'visualAcuity', field: 'refractionLeft', placeholder: 'e.g. -2.00/-0.75x170' }));
  card.appendChild(ref);

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Ocular History',
    description: 'Previous eye conditions and treatments.'
  });

  card.appendChild(radioGroup({
    label: 'Any previous eye conditions?',
    section: 'ocularHistory', field: 'previousEyeConditions', options: yesNo
  }));
  const condDetails = document.createElement('div');
  condDetails.dataset.conditional = 'ocularHistory.previousEyeConditions=yes';
  condDetails.appendChild(textArea({
    label: 'Please provide details',
    section: 'ocularHistory', field: 'previousEyeConditionDetails',
    rows: 3
  }));
  card.appendChild(condDetails);

  card.appendChild(radioGroup({
    label: 'Any previous eye surgery?',
    section: 'ocularHistory', field: 'previousEyeSurgery', options: yesNo
  }));
  const surgDetails = document.createElement('div');
  surgDetails.dataset.conditional = 'ocularHistory.previousEyeSurgery=yes';
  surgDetails.appendChild(textArea({
    label: 'Please provide details (type, date, eye)',
    section: 'ocularHistory', field: 'previousEyeSurgeryDetails',
    rows: 3
  }));
  card.appendChild(surgDetails);

  card.appendChild(radioGroup({
    label: 'Any previous laser treatment?',
    section: 'ocularHistory', field: 'laserTreatment', options: yesNo
  }));
  const laserDetails = document.createElement('div');
  laserDetails.dataset.conditional = 'ocularHistory.laserTreatment=yes';
  laserDetails.appendChild(textArea({
    label: 'Please provide details',
    section: 'ocularHistory', field: 'laserTreatmentDetails',
    rows: 3
  }));
  card.appendChild(laserDetails);

  card.appendChild(radioGroup({
    label: 'Any history of eye trauma?',
    section: 'ocularHistory', field: 'ocularTrauma', options: yesNo
  }));
  const traumaDetails = document.createElement('div');
  traumaDetails.dataset.conditional = 'ocularHistory.ocularTrauma=yes';
  traumaDetails.appendChild(textArea({
    label: 'Please provide details',
    section: 'ocularHistory', field: 'ocularTraumaDetails',
    rows: 3
  }));
  card.appendChild(traumaDetails);

  card.appendChild(radioGroup({
    label: 'Do you have amblyopia (lazy eye)?',
    section: 'ocularHistory', field: 'amblyopia', options: yesNo
  }));
  const amblyopiaEye = document.createElement('div');
  amblyopiaEye.dataset.conditional = 'ocularHistory.amblyopia=yes';
  amblyopiaEye.appendChild(radioGroup({
    label: 'Which eye?',
    section: 'ocularHistory', field: 'amblyopiaEye', options: eyeOptions
  }));
  card.appendChild(amblyopiaEye);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Anterior Segment',
    description: 'Slit lamp examination findings.'
  });

  // Lids
  card.appendChild(radioGroup({ label: 'Lids', section: 'anteriorSegment', field: 'lidsNormal', options: normalAbnormal }));
  const lidsHost = document.createElement('div');
  lidsHost.dataset.conditional = 'anteriorSegment.lidsNormal=no';
  lidsHost.appendChild(textArea({ label: 'Lid findings', section: 'anteriorSegment', field: 'lidsDetails', rows: 2 }));
  card.appendChild(lidsHost);

  // Conjunctiva
  card.appendChild(radioGroup({ label: 'Conjunctiva', section: 'anteriorSegment', field: 'conjunctivaNormal', options: normalAbnormal }));
  const conjHost = document.createElement('div');
  conjHost.dataset.conditional = 'anteriorSegment.conjunctivaNormal=no';
  conjHost.appendChild(textArea({ label: 'Conjunctival findings', section: 'anteriorSegment', field: 'conjunctivaDetails', rows: 2 }));
  card.appendChild(conjHost);

  // Cornea
  card.appendChild(radioGroup({ label: 'Cornea', section: 'anteriorSegment', field: 'corneaNormal', options: normalAbnormal }));
  const corneaHost = document.createElement('div');
  corneaHost.dataset.conditional = 'anteriorSegment.corneaNormal=no';
  corneaHost.appendChild(textArea({ label: 'Corneal findings', section: 'anteriorSegment', field: 'corneaDetails', rows: 2 }));
  card.appendChild(corneaHost);

  // Anterior Chamber
  card.appendChild(radioGroup({ label: 'Anterior Chamber', section: 'anteriorSegment', field: 'anteriorChamberNormal', options: normalAbnormal }));
  const acHost = document.createElement('div');
  acHost.dataset.conditional = 'anteriorSegment.anteriorChamberNormal=no';
  acHost.appendChild(textArea({ label: 'Anterior chamber findings', section: 'anteriorSegment', field: 'anteriorChamberDetails', rows: 2 }));
  card.appendChild(acHost);

  // Iris
  card.appendChild(radioGroup({ label: 'Iris', section: 'anteriorSegment', field: 'irisNormal', options: normalAbnormal }));
  const irisHost = document.createElement('div');
  irisHost.dataset.conditional = 'anteriorSegment.irisNormal=no';
  irisHost.appendChild(textArea({ label: 'Iris findings', section: 'anteriorSegment', field: 'irisDetails', rows: 2 }));
  card.appendChild(irisHost);

  // Lens
  card.appendChild(radioGroup({ label: 'Lens', section: 'anteriorSegment', field: 'lensNormal', options: normalAbnormal }));
  const lensHost = document.createElement('div');
  lensHost.dataset.conditional = 'anteriorSegment.lensNormal=no';
  lensHost.appendChild(textArea({ label: 'Lens findings (e.g. cataract type/grade)', section: 'anteriorSegment', field: 'lensDetails', rows: 2 }));
  card.appendChild(lensHost);

  card.appendChild(subHeader('Intraocular Pressure (IOP)'));
  const iopGrid = document.createElement('div');
  iopGrid.className = 'two-col';
  iopGrid.appendChild(textInput({
    label: 'Right Eye IOP', section: 'anteriorSegment', field: 'iopRight',
    type: 'number', min: 0, max: 80, unit: 'mmHg'
  }));
  iopGrid.appendChild(textInput({
    label: 'Left Eye IOP', section: 'anteriorSegment', field: 'iopLeft',
    type: 'number', min: 0, max: 80, unit: 'mmHg'
  }));
  card.appendChild(iopGrid);

  card.appendChild(selectInput({
    label: 'IOP Measurement Method',
    section: 'anteriorSegment', field: 'iopMethod',
    options: [
      { value: 'goldmann', label: 'Goldmann applanation' },
      { value: 'tonopen', label: 'Tonopen' },
      { value: 'icare', label: 'iCare rebound' },
      { value: 'non-contact', label: 'Non-contact (air puff)' }
    ]
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Posterior Segment',
    description: 'Fundus examination findings.'
  });

  // Fundus
  card.appendChild(radioGroup({ label: 'Fundus', section: 'posteriorSegment', field: 'fundusNormal', options: normalAbnormal }));
  const fundHost = document.createElement('div');
  fundHost.dataset.conditional = 'posteriorSegment.fundusNormal=no';
  fundHost.appendChild(textArea({ label: 'Fundus findings', section: 'posteriorSegment', field: 'fundusDetails', rows: 2 }));
  card.appendChild(fundHost);

  // Optic disc
  card.appendChild(radioGroup({ label: 'Optic Disc', section: 'posteriorSegment', field: 'opticDiscNormal', options: normalAbnormal }));
  const discHost = document.createElement('div');
  discHost.dataset.conditional = 'posteriorSegment.opticDiscNormal=no';
  discHost.appendChild(textArea({ label: 'Optic disc findings', section: 'posteriorSegment', field: 'opticDiscDetails', rows: 2 }));
  card.appendChild(discHost);

  card.appendChild(subHeader('Cup-to-Disc Ratio'));
  const cdrGrid = document.createElement('div');
  cdrGrid.className = 'two-col';
  cdrGrid.appendChild(textInput({ label: 'Right Eye C/D Ratio', section: 'posteriorSegment', field: 'cupToDiscRatioRight', placeholder: 'e.g. 0.3' }));
  cdrGrid.appendChild(textInput({ label: 'Left Eye C/D Ratio', section: 'posteriorSegment', field: 'cupToDiscRatioLeft', placeholder: 'e.g. 0.3' }));
  card.appendChild(cdrGrid);

  // Macula
  card.appendChild(radioGroup({ label: 'Macula', section: 'posteriorSegment', field: 'maculaNormal', options: normalAbnormal }));
  const macHost = document.createElement('div');
  macHost.dataset.conditional = 'posteriorSegment.maculaNormal=no';
  macHost.appendChild(textArea({ label: 'Macular findings', section: 'posteriorSegment', field: 'maculaDetails', rows: 2 }));
  card.appendChild(macHost);

  // Retinal vessels
  card.appendChild(radioGroup({ label: 'Retinal Vessels', section: 'posteriorSegment', field: 'retinalVesselsNormal', options: normalAbnormal }));
  const vesHost = document.createElement('div');
  vesHost.dataset.conditional = 'posteriorSegment.retinalVesselsNormal=no';
  vesHost.appendChild(textArea({ label: 'Retinal vessel findings', section: 'posteriorSegment', field: 'retinalVesselsDetails', rows: 2 }));
  card.appendChild(vesHost);

  // Vitreous
  card.appendChild(radioGroup({ label: 'Vitreous', section: 'posteriorSegment', field: 'vitreousNormal', options: normalAbnormal }));
  const vitHost = document.createElement('div');
  vitHost.dataset.conditional = 'posteriorSegment.vitreousNormal=no';
  vitHost.appendChild(textArea({ label: 'Vitreous findings', section: 'posteriorSegment', field: 'vitreousDetails', rows: 2 }));
  card.appendChild(vitHost);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Visual Field & Pupils',
    description: 'Visual field testing and pupil reactions.'
  });

  card.appendChild(radioGroup({
    label: 'Was a visual field test performed?',
    section: 'visualFieldPupils', field: 'visualFieldTestPerformed', options: yesNo
  }));

  const vfHost = document.createElement('div');
  vfHost.dataset.conditional = 'visualFieldPupils.visualFieldTestPerformed=yes';
  vfHost.appendChild(selectInput({
    label: 'Test type',
    section: 'visualFieldPupils', field: 'visualFieldTestType',
    options: [
      { value: 'confrontation', label: 'Confrontation' },
      { value: 'humphrey', label: 'Humphrey' },
      { value: 'goldmann', label: 'Goldmann' },
      { value: 'octopus', label: 'Octopus' }
    ]
  }));

  const vfResults = document.createElement('div');
  vfResults.className = 'two-col';
  vfResults.appendChild(selectInput({
    label: 'Right eye result',
    section: 'visualFieldPupils', field: 'visualFieldResultRight',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'abnormal', label: 'Abnormal' }
    ]
  }));
  vfResults.appendChild(selectInput({
    label: 'Left eye result',
    section: 'visualFieldPupils', field: 'visualFieldResultLeft',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'abnormal', label: 'Abnormal' }
    ]
  }));
  vfHost.appendChild(vfResults);

  const vfDetailsHost = document.createElement('div');
  vfDetailsHost.dataset.conditionalAny = 'visualFieldPupils.visualFieldResultRight,visualFieldPupils.visualFieldResultLeft=abnormal';
  vfDetailsHost.appendChild(textArea({
    label: 'Visual field defect details',
    section: 'visualFieldPupils', field: 'visualFieldDetails',
    rows: 2
  }));
  vfHost.appendChild(vfDetailsHost);

  card.appendChild(vfHost);

  card.appendChild(subHeader('Pupil Reactions'));
  const pupilGrid = document.createElement('div');
  pupilGrid.className = 'two-col';
  pupilGrid.appendChild(selectInput({
    label: 'Right pupil reaction',
    section: 'visualFieldPupils', field: 'pupilReactionRight',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'sluggish', label: 'Sluggish' },
      { value: 'fixed', label: 'Fixed' }
    ]
  }));
  pupilGrid.appendChild(selectInput({
    label: 'Left pupil reaction',
    section: 'visualFieldPupils', field: 'pupilReactionLeft',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'sluggish', label: 'Sluggish' },
      { value: 'fixed', label: 'Fixed' }
    ]
  }));
  card.appendChild(pupilGrid);

  card.appendChild(radioGroup({
    label: 'Is a relative afferent pupillary defect (RAPD) present?',
    section: 'visualFieldPupils', field: 'rapdPresent', options: yesNo
  }));
  const rapdHost = document.createElement('div');
  rapdHost.dataset.conditional = 'visualFieldPupils.rapdPresent=yes';
  rapdHost.appendChild(radioGroup({
    label: 'Which eye?',
    section: 'visualFieldPupils', field: 'rapdEye', options: eyeOptions
  }));
  card.appendChild(rapdHost);

  card.appendChild(subHeader('Colour Vision'));
  card.appendChild(radioGroup({
    label: 'Is colour vision normal?',
    section: 'visualFieldPupils', field: 'colourVisionNormal', options: yesNo
  }));
  const colourHost = document.createElement('div');
  colourHost.dataset.conditional = 'visualFieldPupils.colourVisionNormal=no';
  colourHost.appendChild(textArea({
    label: 'Colour vision test details',
    section: 'visualFieldPupils', field: 'colourVisionDetails',
    rows: 2
  }));
  card.appendChild(colourHost);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Current Medications',
    description: 'Eye drops, oral medications for eyes, and ophthalmic drug allergies.'
  });

  const dropsHeader = document.createElement('div');
  dropsHeader.className = 'list-section-header';
  dropsHeader.innerHTML = '<h3>Eye drops</h3>';
  card.appendChild(dropsHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'eyeDrops',
    addLabel: 'Add eye drop',
    emptyMessage: 'No eye drops added.',
    namePlaceholder: 'e.g. Latanoprost 0.005%'
  }));

  const oralHeader = document.createElement('div');
  oralHeader.className = 'list-section-header';
  oralHeader.innerHTML = '<h3>Oral medications for eyes</h3>';
  card.appendChild(oralHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'oralMedications',
    addLabel: 'Add oral medication',
    emptyMessage: 'No oral medications added.',
    namePlaceholder: 'e.g. Acetazolamide'
  }));

  const allergyHeader = document.createElement('div');
  allergyHeader.className = 'list-section-header';
  allergyHeader.innerHTML = '<h3>Ophthalmic drug allergies</h3>';
  card.appendChild(allergyHeader);
  card.appendChild(drugAllergyEditor());

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Systemic Conditions',
    description: 'General health conditions relevant to eye health.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have diabetes?',
    section: 'systemicConditions', field: 'diabetes', options: yesNo
  }));

  const dmHost = document.createElement('div');
  dmHost.dataset.conditional = 'systemicConditions.diabetes=yes';
  dmHost.appendChild(selectInput({
    label: 'Diabetes type',
    section: 'systemicConditions', field: 'diabetesType',
    options: [
      { value: 'type1', label: 'Type 1' },
      { value: 'type2', label: 'Type 2' }
    ]
  }));
  dmHost.appendChild(selectInput({
    label: 'Diabetes control',
    section: 'systemicConditions', field: 'diabetesControl',
    options: [
      { value: 'well-controlled', label: 'Well controlled' },
      { value: 'poorly-controlled', label: 'Poorly controlled' }
    ]
  }));
  dmHost.appendChild(radioGroup({
    label: 'Has diabetic retinopathy been diagnosed?',
    section: 'systemicConditions', field: 'diabeticRetinopathy', options: yesNo
  }));
  const drHost = document.createElement('div');
  drHost.dataset.conditional = 'systemicConditions.diabeticRetinopathy=yes';
  drHost.appendChild(selectInput({
    label: 'Retinopathy stage',
    section: 'systemicConditions', field: 'diabeticRetinopathyStage',
    options: [
      { value: 'background', label: 'Background (non-proliferative)' },
      { value: 'pre-proliferative', label: 'Pre-proliferative' },
      { value: 'proliferative', label: 'Proliferative' },
      { value: 'maculopathy', label: 'Diabetic maculopathy' }
    ]
  }));
  dmHost.appendChild(drHost);
  card.appendChild(dmHost);

  card.appendChild(radioGroup({
    label: 'Do you have high blood pressure (hypertension)?',
    section: 'systemicConditions', field: 'hypertension', options: yesNo
  }));
  const htnHost = document.createElement('div');
  htnHost.dataset.conditional = 'systemicConditions.hypertension=yes';
  htnHost.appendChild(radioGroup({
    label: 'Is it well controlled?',
    section: 'systemicConditions', field: 'hypertensionControlled', options: yesNo
  }));
  card.appendChild(htnHost);

  card.appendChild(radioGroup({
    label: 'Do you have any autoimmune conditions?',
    section: 'systemicConditions', field: 'autoimmune', options: yesNo
  }));
  const autoHost = document.createElement('div');
  autoHost.dataset.conditional = 'systemicConditions.autoimmune=yes';
  autoHost.appendChild(textArea({
    label: 'Please provide details (e.g. rheumatoid arthritis, lupus, sarcoidosis)',
    section: 'systemicConditions', field: 'autoimmuneDetails',
    rows: 2
  }));
  card.appendChild(autoHost);

  card.appendChild(radioGroup({
    label: 'Do you have thyroid eye disease?',
    section: 'systemicConditions', field: 'thyroidEyeDisease', options: yesNo
  }));
  const tedHost = document.createElement('div');
  tedHost.dataset.conditional = 'systemicConditions.thyroidEyeDisease=yes';
  tedHost.appendChild(textArea({
    label: 'Thyroid eye disease details',
    section: 'systemicConditions', field: 'thyroidEyeDiseaseDetails',
    rows: 2
  }));
  card.appendChild(tedHost);

  card.appendChild(radioGroup({
    label: 'Do you have any neurological conditions?',
    section: 'systemicConditions', field: 'neurological', options: yesNo
  }));
  const neuroHost = document.createElement('div');
  neuroHost.dataset.conditional = 'systemicConditions.neurological=yes';
  neuroHost.appendChild(textArea({
    label: 'Neurological condition details (e.g. MS, myasthenia gravis)',
    section: 'systemicConditions', field: 'neurologicalDetails',
    rows: 2
  }));
  card.appendChild(neuroHost);

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Functional Impact',
    description: 'How your vision affects daily activities.'
  });

  card.appendChild(selectInput({
    label: 'Driving status',
    section: 'functionalImpact', field: 'drivingStatus',
    options: [
      { value: 'current-driver', label: 'Current driver' },
      { value: 'ceased-driving', label: 'Ceased driving (vision-related)' },
      { value: 'never-driven', label: 'Never driven' }
    ]
  }));
  const drivingHost = document.createElement('div');
  drivingHost.dataset.conditional = 'functionalImpact.drivingStatus=ceased-driving';
  drivingHost.appendChild(textArea({
    label: 'Driving concerns',
    section: 'functionalImpact', field: 'drivingConcerns',
    rows: 2
  }));
  card.appendChild(drivingHost);

  card.appendChild(selectInput({
    label: 'Reading ability',
    section: 'functionalImpact', field: 'readingAbility',
    options: [
      { value: 'no-difficulty', label: 'No difficulty' },
      { value: 'mild-difficulty', label: 'Mild difficulty' },
      { value: 'moderate-difficulty', label: 'Moderate difficulty' },
      { value: 'severe-difficulty', label: 'Severe difficulty' },
      { value: 'unable', label: 'Unable to read' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Any limitations in activities of daily living (ADL) due to vision?',
    section: 'functionalImpact', field: 'adlLimitations', options: yesNo
  }));
  const adlHost = document.createElement('div');
  adlHost.dataset.conditional = 'functionalImpact.adlLimitations=yes';
  adlHost.appendChild(textArea({
    label: 'Please describe limitations',
    section: 'functionalImpact', field: 'adlLimitationDetails',
    rows: 2
  }));
  card.appendChild(adlHost);

  card.appendChild(radioGroup({
    label: 'Have you had falls or near-falls related to your vision?',
    section: 'functionalImpact', field: 'fallsRisk', options: yesNo
  }));
  const fallsHost = document.createElement('div');
  fallsHost.dataset.conditional = 'functionalImpact.fallsRisk=yes';
  fallsHost.appendChild(textArea({
    label: 'Falls details',
    section: 'functionalImpact', field: 'fallsDetails',
    rows: 2
  }));
  card.appendChild(fallsHost);

  card.appendChild(radioGroup({
    label: 'Do you need additional support services for your vision?',
    section: 'functionalImpact', field: 'supportNeeds', options: yesNo
  }));
  const supportHost = document.createElement('div');
  supportHost.dataset.conditional = 'functionalImpact.supportNeeds=yes';
  supportHost.appendChild(textArea({
    label: 'Support needs details',
    section: 'functionalImpact', field: 'supportDetails',
    rows: 2
  }));
  card.appendChild(supportHost);

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

/**
 * Resolve the value at a `section.field` path on the current state.
 * @param {string} path
 */
function valueAt(path) {
  const [section, field] = path.split('.');
  return state[section]?.[field];
}

function updateConditionalSections() {
  // Single-path conditional: show when the named field equals `target`.
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const current = valueAt(path);
    host.style.display = String(current ?? '') === target ? '' : 'none';
  });
  // Multi-path conditional: show when ANY of the comma-separated paths
  // equals `target`. Path list is `section.field,section.field=target`.
  document.querySelectorAll('[data-conditional-any]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-any');
    const [pathsCsv, target] = expr.split('=');
    const paths = pathsCsv.split(',');
    const matchAny = paths.some((p) => String(valueAt(p) ?? '') === target);
    host.style.display = matchAny ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics (4)
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  // Chief complaint (5)
  ['chiefComplaint', 'primaryConcern'],
  ['chiefComplaint', 'affectedEye'],
  ['chiefComplaint', 'onsetType'],
  ['chiefComplaint', 'durationValue'],
  ['chiefComplaint', 'painPresent'],
  // Visual acuity (4 distance VAs)
  ['visualAcuity', 'distanceVaRightUncorrected'],
  ['visualAcuity', 'distanceVaRightCorrected'],
  ['visualAcuity', 'distanceVaLeftUncorrected'],
  ['visualAcuity', 'distanceVaLeftCorrected'],
  // Ocular history (5 yes/no)
  ['ocularHistory', 'previousEyeConditions'],
  ['ocularHistory', 'previousEyeSurgery'],
  ['ocularHistory', 'laserTreatment'],
  ['ocularHistory', 'ocularTrauma'],
  ['ocularHistory', 'amblyopia'],
  // Anterior segment (6 normal/abnormal + 2 IOP)
  ['anteriorSegment', 'lidsNormal'],
  ['anteriorSegment', 'conjunctivaNormal'],
  ['anteriorSegment', 'corneaNormal'],
  ['anteriorSegment', 'anteriorChamberNormal'],
  ['anteriorSegment', 'irisNormal'],
  ['anteriorSegment', 'lensNormal'],
  ['anteriorSegment', 'iopRight'],
  ['anteriorSegment', 'iopLeft'],
  // Posterior segment (6 normal/abnormal)
  ['posteriorSegment', 'fundusNormal'],
  ['posteriorSegment', 'opticDiscNormal'],
  ['posteriorSegment', 'maculaNormal'],
  ['posteriorSegment', 'retinalVesselsNormal'],
  ['posteriorSegment', 'vitreousNormal'],
  // Visual field & pupils
  ['visualFieldPupils', 'visualFieldTestPerformed'],
  ['visualFieldPupils', 'pupilReactionRight'],
  ['visualFieldPupils', 'pupilReactionLeft'],
  ['visualFieldPupils', 'rapdPresent'],
  ['visualFieldPupils', 'colourVisionNormal'],
  // Systemic conditions (5 yes/no top-level)
  ['systemicConditions', 'diabetes'],
  ['systemicConditions', 'hypertension'],
  ['systemicConditions', 'autoimmune'],
  ['systemicConditions', 'thyroidEyeDisease'],
  ['systemicConditions', 'neurological'],
  // Functional impact (5)
  ['functionalImpact', 'drivingStatus'],
  ['functionalImpact', 'readingAbility'],
  ['functionalImpact', 'adlLimitations'],
  ['functionalImpact', 'fallsRisk'],
  ['functionalImpact', 'supportNeeds']
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
  { step: 1,  section: 'demographics',         title: 'Demographics' },
  { step: 2,  section: 'chiefComplaint',       title: 'Chief Complaint' },
  { step: 3,  section: 'visualAcuity',         title: 'Visual Acuity' },
  { step: 4,  section: 'ocularHistory',        title: 'Ocular History' },
  { step: 5,  section: 'anteriorSegment',      title: 'Anterior Segment' },
  { step: 6,  section: 'posteriorSegment',     title: 'Posterior Segment' },
  { step: 7,  section: 'visualFieldPupils',    title: 'Visual Field & Pupils' },
  { step: 8,  section: 'currentMedications',   title: 'Medications' },
  { step: 9,  section: 'systemicConditions',   title: 'Systemic' },
  { step: 10, section: 'functionalImpact',     title: 'Functional Impact' }
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
  const required = form.querySelectorAll('[data-required]');
  const seen = new Set();
  required.forEach((input) => {
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

  const { vaGrade, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td>${esc(r.system)}</td>
      <td>${esc(r.description)}</td>
      <td>${esc(r.grade)}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No rules fired — visual acuity grade defaults to normal.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">System</th>
            <th scope="col">Description</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Ophthalmology Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Visual Acuity Grade</h3>
      <p class="va-summary">
        <span class="va-badge ${vaGradeClass(vaGrade)}">${esc(vaGrade.toUpperCase())}</span>
        <span class="va-grade-label">${esc(vaGradeLabel(vaGrade))}</span>
      </p>
      <p class="muted">Based on the worst-grade rule that fired across visual acuity, IOP, optic disc, macula, visual field, pupil, segment, systemic and functional categories.</p>

      <h3>Fired Rules</h3>
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
  const errs = validateForm();
  if (errs.length > 0) return;
  const { vaGrade, firedRules } = calculateVisualAcuityGrade(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    vaGrade,
    firedRules,
    additionalFlags,
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
  host.appendChild(renderStep9());
  host.appendChild(renderStep10());
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
