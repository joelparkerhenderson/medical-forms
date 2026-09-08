import { calculateDLQI, dlqiCategory, dlqiCategoryClass, dlqiQuestions, dlqiResponseOptions } from './dlqi-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { emptyAssessment, fitzpatrickLabel } from './types.js';

// Dermatology Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure DLQI scoring engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'dermatology-assessment.front-end-form-with-html.v1';

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
  slug: 'dermatology-assessment',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const report = document.getElementById('report');
    if (report) report.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
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
 * Re-runs progress and conditional visibility after each change.
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
function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const cls = (type === 'number') ? 'number-input'
    : (type === 'date') ? 'date-input'
    : (type === 'email') ? 'email-input'
    : (type === 'tel') ? 'tel-input'
    : (type === 'url') ? 'url-input'
    : (type === 'time') ? 'time-input'
    : 'text-input';
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${cls}"`,
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
 *           placeholder?: string }} opts
 */
function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      aria-describedby="${id}-error"${requiredAttr}
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

/**
 * Build a select / dropdown input.
 * @param {{ label: string, section: string, field: string, required?: boolean,
 *           options: { value: string, label: string }[] }} opts
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
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${requiredAttr}>
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

/**
 * Build a radio group.
 * @param {{ label: string, section: string, field: string, required?: boolean,
 *           options: { value: string | number, label: string }[] }} opts
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
  errSpan.setAttribute('aria-live', 'polite');
  wrapper.appendChild(errSpan);
  return wrapper;
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
    `<span class="section-step">Section ${opts.stepNumber} of 9</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Repeating-list editors (medications, allergies)
// ----------------------------------------------------------------------

/**
 * Editor for an array of {name, dose, frequency} medication rows.
 * @param {{ section: string, field: string, addLabel: string, namePlaceholder?: string }} opts
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
      empty.textContent = 'None added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row med-row';
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="${esc(opts.namePlaceholder || 'e.g. Hydrocortisone 1%')}">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 1%, 5 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. BD, weekly">
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

/** Editor for an array of {allergen, reaction, severity} drug-allergy rows. */
function drugAllergyEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.allergies.drugAllergies;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No drug allergies added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row allergy-row';
      r.innerHTML = `
        <div class="list-grid allergy-grid">
          <label class="list-cell">
            <span>Drug / allergen</span>
            <input type="text" class="text-input" data-key="allergen" value="${esc(row.allergen)}" placeholder="e.g. Penicillin">
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
    addBtn.textContent = '+ Add drug allergy';
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
// DLQI question block (shared component for the 10 Likert questions)
// ----------------------------------------------------------------------

const QUESTION_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];

/**
 * Render a single DLQI question with 4 radio options (0..3).
 * @param {number} index 0-based question index
 */
function dlqiQuestionBlock(index) {
  const question = dlqiQuestions[index];
  const key = QUESTION_KEYS[index];
  const current = state.dlqiQuestionnaire[key];

  const block = document.createElement('fieldset');
  block.className = 'field dlqi-question radio-group';

  const legend = document.createElement('legend');
  legend.innerHTML = `
    <span class="q-number">${index + 1}.</span>
    <span class="q-text">${esc(question.text)}</span>
  `;
  block.appendChild(legend);

  const domain = document.createElement('p');
  domain.className = 'q-domain';
  domain.textContent = `Domain: ${question.domain}`;
  block.appendChild(domain);

  const list = document.createElement('div');
  list.className = 'radio-options';
  for (const opt of dlqiResponseOptions) {
    const radioId = `dlqi-${key}-${opt.value}`;
    const label = document.createElement('label');
    label.className = 'radio-option';
    label.htmlFor = radioId;
    const checked = current === opt.value ? ' checked' : '';
    label.innerHTML = `
      <input type="radio" id="${radioId}" name="dlqi-${key}" value="${opt.value}"${checked}>
      <span>${esc(opt.label)} (${opt.value})</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) setField('dlqiQuestionnaire', key, opt.value);
    });
    list.appendChild(label);
  }
  block.appendChild(list);
  return block;
}

// ----------------------------------------------------------------------
// Section renderers (1 per step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic patient information and skin type.'
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

  card.appendChild(selectInput({
    label: 'Fitzpatrick Skin Type',
    section: 'demographics',
    field: 'skinType',
    required: true,
    options: [
      { value: 'I',  label: fitzpatrickLabel('I') },
      { value: 'II', label: fitzpatrickLabel('II') },
      { value: 'III',label: fitzpatrickLabel('III') },
      { value: 'IV', label: fitzpatrickLabel('IV') },
      { value: 'V',  label: fitzpatrickLabel('V') },
      { value: 'VI', label: fitzpatrickLabel('VI') }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Chief Complaint',
    description: 'Describe your primary skin concern.'
  });

  card.appendChild(textArea({
    label: 'What is your primary skin concern?',
    section: 'chiefComplaint', field: 'primaryConcern',
    placeholder: 'Describe your main skin problem…',
    rows: 3
  }));

  card.appendChild(textInput({
    label: 'How long have you had this condition?',
    section: 'chiefComplaint', field: 'duration',
    placeholder: 'e.g. 2 weeks, 3 months, 5 years',
    required: true
  }));

  card.appendChild(textInput({
    label: 'Where on your body is it located?',
    section: 'chiefComplaint', field: 'location',
    placeholder: 'e.g. face, arms, trunk, legs',
    required: true
  }));

  card.appendChild(radioGroup({
    label: 'How has the condition been changing?',
    section: 'chiefComplaint', field: 'progression',
    required: true,
    options: [
      { value: 'stable', label: 'Stable' },
      { value: 'improving', label: 'Improving' },
      { value: 'worsening', label: 'Worsening' },
      { value: 'fluctuating', label: 'Fluctuating' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Previous treatments tried',
    section: 'chiefComplaint', field: 'previousTreatments',
    placeholder: 'List any treatments you have tried for this condition…',
    rows: 3
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'DLQI Questionnaire',
    description:
      'Dermatology Life Quality Index — for each question please pick the option that best describes the impact of your skin over the LAST WEEK.'
  });
  for (let i = 0; i < dlqiQuestions.length; i++) {
    card.appendChild(dlqiQuestionBlock(i));
  }
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Lesion Characteristics',
    description: 'Describe the appearance of the skin lesion(s).'
  });

  card.appendChild(selectInput({
    label: 'Lesion Type',
    section: 'lesionCharacteristics', field: 'type',
    required: true,
    options: [
      { value: 'macule', label: 'Macule (flat, discoloured spot)' },
      { value: 'papule', label: 'Papule (small raised bump)' },
      { value: 'patch', label: 'Patch (large flat area)' },
      { value: 'plaque', label: 'Plaque (raised, flat-topped)' },
      { value: 'nodule', label: 'Nodule (firm, deep bump)' },
      { value: 'vesicle', label: 'Vesicle (small fluid-filled blister)' },
      { value: 'bulla', label: 'Bulla (large fluid-filled blister)' },
      { value: 'pustule', label: 'Pustule (pus-filled bump)' },
      { value: 'wheal', label: 'Wheal (hive, raised itchy area)' },
      { value: 'erosion', label: 'Erosion (superficial skin loss)' },
      { value: 'ulcer', label: 'Ulcer (deep skin loss)' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Lesion Colour',
    section: 'lesionCharacteristics', field: 'color',
    required: true,
    options: [
      { value: 'erythematous', label: 'Erythematous (red)' },
      { value: 'hyperpigmented', label: 'Hyperpigmented (darker than surrounding skin)' },
      { value: 'hypopigmented', label: 'Hypopigmented (lighter than surrounding skin)' },
      { value: 'violaceous', label: 'Violaceous (purple/violet)' },
      { value: 'flesh-colored', label: 'Flesh-coloured' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Border',
    section: 'lesionCharacteristics', field: 'border',
    required: true,
    options: [
      { value: 'well-defined', label: 'Well-defined' },
      { value: 'poorly-defined', label: 'Poorly defined' },
      { value: 'irregular', label: 'Irregular' },
      { value: 'raised', label: 'Raised' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Size',
    section: 'lesionCharacteristics', field: 'sizeMillimeters',
    type: 'number', min: 0, max: 500, step: 0.5, unit: 'mm'
  }));

  card.appendChild(selectInput({
    label: 'Distribution',
    section: 'lesionCharacteristics', field: 'distribution',
    options: [
      { value: 'localized', label: 'Localised' },
      { value: 'generalized', label: 'Generalised' },
      { value: 'symmetrical', label: 'Symmetrical' },
      { value: 'asymmetrical', label: 'Asymmetrical' },
      { value: 'dermatomal', label: 'Dermatomal' },
      { value: 'sun-exposed', label: 'Sun-exposed areas' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Number of lesions',
    section: 'lesionCharacteristics', field: 'number',
    options: [
      { value: 'single', label: 'Single' },
      { value: 'few', label: 'Few (2-5)' },
      { value: 'multiple', label: 'Multiple (6-20)' },
      { value: 'numerous', label: 'Numerous (>20)' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Surface',
    section: 'lesionCharacteristics', field: 'surface',
    options: [
      { value: 'smooth', label: 'Smooth' },
      { value: 'rough', label: 'Rough' },
      { value: 'scaly', label: 'Scaly' },
      { value: 'crusted', label: 'Crusted' },
      { value: 'verrucous', label: 'Verrucous (wart-like)' },
      { value: 'ulcerated', label: 'Ulcerated' }
    ]
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Medical History',
    description: 'Previous skin conditions and relevant medical history.'
  });

  card.appendChild(textArea({
    label: 'Previous skin conditions',
    section: 'medicalHistory', field: 'previousSkinConditions',
    placeholder: 'e.g. eczema, psoriasis, acne, rosacea…',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Do you have any autoimmune diseases?',
    section: 'medicalHistory', field: 'autoimmuneDiseases',
    options: yesNo
  }));
  const autoDetails = document.createElement('div');
  autoDetails.dataset.conditional = 'medicalHistory.autoimmuneDiseases=yes';
  autoDetails.appendChild(textArea({
    label: 'Please provide details',
    section: 'medicalHistory', field: 'autoimmuneDiseaseDetails',
    placeholder: 'e.g. lupus, rheumatoid arthritis, vitiligo…',
    rows: 2
  }));
  card.appendChild(autoDetails);

  card.appendChild(radioGroup({
    label: 'Are you immunosuppressed or on immunosuppressive therapy?',
    section: 'medicalHistory', field: 'immunosuppression',
    options: yesNo
  }));
  const immunoDetails = document.createElement('div');
  immunoDetails.dataset.conditional = 'medicalHistory.immunosuppression=yes';
  immunoDetails.appendChild(textArea({
    label: 'Please provide details',
    section: 'medicalHistory', field: 'immunosuppressionDetails',
    placeholder: 'e.g. transplant, chemotherapy, long-term steroids…',
    rows: 2
  }));
  card.appendChild(immunoDetails);

  card.appendChild(radioGroup({
    label: 'Do you have a history of cancer?',
    section: 'medicalHistory', field: 'cancerHistory',
    options: yesNo
  }));
  const cancerDetails = document.createElement('div');
  cancerDetails.dataset.conditional = 'medicalHistory.cancerHistory=yes';
  cancerDetails.appendChild(textArea({
    label: 'Please provide details (type, treatment, current status)',
    section: 'medicalHistory', field: 'cancerHistoryDetails',
    placeholder: 'e.g. type, year diagnosed, treatment, remission status…',
    rows: 3
  }));
  card.appendChild(cancerDetails);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Current Medications',
    description: 'List all current treatments for your skin condition.'
  });

  const topHeader = document.createElement('div');
  topHeader.className = 'list-section-header';
  topHeader.innerHTML = `
    <h3>Topical Medications</h3>
    <p class="hint">Creams, ointments, gels, lotions applied to the skin.</p>
  `;
  card.appendChild(topHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications', field: 'topicals',
    addLabel: 'Add topical medication',
    namePlaceholder: 'e.g. Hydrocortisone 1% cream'
  }));

  const sysHeader = document.createElement('div');
  sysHeader.className = 'list-section-header';
  sysHeader.innerHTML = `
    <h3>Systemic Medications</h3>
    <p class="hint">Oral or injected medications for skin conditions (e.g. methotrexate, ciclosporin).</p>
  `;
  card.appendChild(sysHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications', field: 'systemics',
    addLabel: 'Add systemic medication',
    namePlaceholder: 'e.g. Methotrexate'
  }));

  const bioHeader = document.createElement('div');
  bioHeader.className = 'list-section-header';
  bioHeader.innerHTML = `
    <h3>Biologic Therapies</h3>
    <p class="hint">e.g. adalimumab, ustekinumab, dupilumab, secukinumab.</p>
  `;
  card.appendChild(bioHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications', field: 'biologics',
    addLabel: 'Add biologic therapy',
    namePlaceholder: 'e.g. Adalimumab'
  }));

  card.appendChild(textArea({
    label: 'Over-the-counter products currently in use',
    section: 'currentMedications', field: 'otcProducts',
    placeholder: 'e.g. moisturisers, sunscreen, medicated shampoos…',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Allergies',
    description: 'Drug allergies, contact allergies, and latex sensitivity.'
  });

  const drugHeader = document.createElement('div');
  drugHeader.className = 'list-section-header';
  drugHeader.innerHTML = '<h3>Drug allergies</h3>';
  card.appendChild(drugHeader);
  card.appendChild(drugAllergyEditor());

  card.appendChild(textArea({
    label: 'Contact allergies (e.g. nickel, fragrances, adhesives)',
    section: 'allergies', field: 'contactAllergies',
    placeholder: 'List any known contact allergies…',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Do you have a latex allergy?',
    section: 'allergies', field: 'latexAllergy',
    options: yesNo
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Family History',
    description: 'Skin conditions and relevant diseases in your family.'
  });

  card.appendChild(radioGroup({ label: 'Does anyone in your family have psoriasis?', section: 'familyHistory', field: 'psoriasis', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Does anyone in your family have eczema/atopic dermatitis?', section: 'familyHistory', field: 'eczema', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Does anyone in your family have a history of melanoma?', section: 'familyHistory', field: 'melanoma', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Does anyone in your family have a history of non-melanoma skin cancer?', section: 'familyHistory', field: 'skinCancer', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Does anyone in your family have an autoimmune disease?', section: 'familyHistory', field: 'autoimmune', options: yesNo }));

  card.appendChild(textArea({
    label: 'Any other relevant family history',
    section: 'familyHistory', field: 'otherDetails',
    placeholder: 'Please describe any other skin-related conditions in your family…',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Social History',
    description: 'Lifestyle factors relevant to skin health.'
  });

  card.appendChild(selectInput({
    label: 'Sun exposure level',
    section: 'socialHistory', field: 'sunExposure',
    options: [
      { value: 'minimal', label: 'Minimal (mostly indoors)' },
      { value: 'moderate', label: 'Moderate (some outdoor time)' },
      { value: 'frequent', label: 'Frequent (regular outdoor activities)' },
      { value: 'excessive', label: 'Excessive (prolonged daily exposure)' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Tanning history',
    section: 'socialHistory', field: 'tanningHistory',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'occasional', label: 'Occasional outdoor tanning' },
      { value: 'regular-outdoor', label: 'Regular outdoor tanning' },
      { value: 'tanning-bed', label: 'Tanning bed use (current or past)' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Occupation',
    section: 'socialHistory', field: 'occupation',
    placeholder: 'e.g. outdoor worker, hairdresser, healthcare…'
  }));

  card.appendChild(textArea({
    label: 'Cosmetics and skincare products regularly used',
    section: 'socialHistory', field: 'cosmeticsUse',
    placeholder: 'List any cosmetics, skincare, or hair products you use regularly…',
    rows: 3
  }));

  return card;
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

const TRACKED_FIELDS = [
  // Demographics
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'skinType'],
  // Chief Complaint
  ['chiefComplaint', 'primaryConcern'],
  ['chiefComplaint', 'duration'],
  ['chiefComplaint', 'location'],
  ['chiefComplaint', 'progression'],
  // DLQI questionnaire (10 questions)
  ['dlqiQuestionnaire', 'q1'],
  ['dlqiQuestionnaire', 'q2'],
  ['dlqiQuestionnaire', 'q3'],
  ['dlqiQuestionnaire', 'q4'],
  ['dlqiQuestionnaire', 'q5'],
  ['dlqiQuestionnaire', 'q6'],
  ['dlqiQuestionnaire', 'q7'],
  ['dlqiQuestionnaire', 'q8'],
  ['dlqiQuestionnaire', 'q9'],
  ['dlqiQuestionnaire', 'q10'],
  // Lesion Characteristics
  ['lesionCharacteristics', 'type'],
  ['lesionCharacteristics', 'color'],
  ['lesionCharacteristics', 'border'],
  ['lesionCharacteristics', 'sizeMillimeters'],
  ['lesionCharacteristics', 'distribution'],
  ['lesionCharacteristics', 'number'],
  ['lesionCharacteristics', 'surface'],
  // Medical History
  ['medicalHistory', 'autoimmuneDiseases'],
  ['medicalHistory', 'immunosuppression'],
  ['medicalHistory', 'cancerHistory'],
  // Allergies meta
  ['allergies', 'latexAllergy'],
  // Family History
  ['familyHistory', 'psoriasis'],
  ['familyHistory', 'eczema'],
  ['familyHistory', 'melanoma'],
  ['familyHistory', 'skinCancer'],
  ['familyHistory', 'autoimmune'],
  // Social History
  ['socialHistory', 'sunExposure'],
  ['socialHistory', 'tanningHistory']
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

// ----------------------------------------------------------------------
// Step-list + validation (Lily)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'demographics', title: 'Demographics' },
  { step: 2, section: 'chiefComplaint', title: 'Chief Complaint' },
  { step: 3, section: 'dlqiQuestionnaire', title: 'DLQI Questionnaire' },
  { step: 4, section: 'lesionCharacteristics', title: 'Lesion Characteristics' },
  { step: 5, section: 'medicalHistory', title: 'Medical History' },
  { step: 6, section: 'currentMedications', title: 'Current Medications' },
  { step: 7, section: 'allergies', title: 'Allergies' },
  { step: 8, section: 'familyHistory', title: 'Family History' },
  { step: 9, section: 'socialHistory', title: 'Social History' }
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
    li.setAttribute('aria-label', 'Step ' + def.step + ': ' + def.title);
    li.innerHTML = '<span>' + esc(def.title) + '</span>';
    li.addEventListener('click', () => {
      const target = document.getElementById('step-' + def.step);
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
    const li = ol.querySelector('[data-step="' + def.step + '"]');
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
  const current = ol.querySelector('[data-step="' + firstUnfinished + '"]');
  if (current) {
    current.setAttribute('aria-current', 'step');
    if (current.dataset.status === 'waiting') {
      current.dataset.status = 'in-progress';
    }
  }
  ol.dataset.current = String(firstUnfinished - 1);
}

function clearFieldError(id) {
  const el = document.getElementById(id + '-error');
  if (el) el.textContent = '';
  const input = document.getElementById(id);
  if (input) input.removeAttribute('aria-invalid');
  const fs = document.getElementById(id + '-fieldset');
  if (fs) fs.removeAttribute('aria-invalid');
}

function setFieldError(id, message) {
  const el = document.getElementById(id + '-error');
  if (el) el.textContent = message;
  const input = document.getElementById(id);
  if (input) input.setAttribute('aria-invalid', 'true');
}

function validateForm() {
  const errors = [];
  const form = document.getElementById('assessment-form');
  if (!form) return errors;
  const required = form.querySelectorAll('[data-required]');
  const seenGroups = new Set();
  required.forEach((input) => {
    const id = input.id;
    if (input.type === 'radio') {
      const groupName = input.name;
      if (seenGroups.has(groupName)) return;
      seenGroups.add(groupName);
      const checked = form.querySelector('input[name="' + groupName + '"]:checked');
      const fsEl = document.getElementById(groupName + '-fieldset');
      const labelEl = fsEl ? fsEl.querySelector('legend') : null;
      const label = labelEl ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim() : groupName;
      if (!checked) {
        errors.push({ id: groupName, message: label + ' is required' });
        setFieldError(groupName, label + ' is required');
      } else {
        clearFieldError(groupName);
      }
      return;
    }
    const value = (input.value || '').trim();
    const labelEl = form.querySelector('label[for="' + id + '"]');
    const label = labelEl ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim() : id;
    if (!value) {
      errors.push({ id: id, message: label + ' is required' });
      setFieldError(id, label + ' is required');
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
      '<li><a href="#' + esc(e.id) + '">' + esc(e.message) + '</a></li>'
    ).join('') +
    '</ul>';
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (typeof summary.focus === 'function') {
    summary.setAttribute('tabindex', '-1');
    summary.focus({ preventScroll: true });
  }
}

function priorityClass(priority) {
  switch (priority) {
    case 'urgent': return 'flag-urgent';
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
    dlqiScore, dlqiCategoryLabel, answeredCount,
    firedRules, additionalFlags, timestamp
  } = lastResult;

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
      <td>${esc(r.domain)}</td>
      <td>${esc(r.description)}</td>
      <td class="num">${r.score} / 3</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No DLQI questions answered.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Domain</th>
            <th scope="col">Question</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Dermatology Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>DLQI Total Score</h3>
      <p class="dlqi-summary">
        <span class="dlqi-score-badge ${dlqiCategoryClass(dlqiScore)}">${dlqiScore} / 30</span>
        <span class="dlqi-category-label">${esc(dlqiCategoryLabel)}</span>
      </p>
      <p class="muted">Based on ${answeredCount} of 10 DLQI questions answered.</p>

      <h3>Per-question scores</h3>
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
  const { dlqiScore, dlqiCategoryLabel, answeredCount, firedRules } = calculateDLQI(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    dlqiScore,
    dlqiCategoryLabel,
    answeredCount,
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
  const report = document.getElementById('report');
  if (report) report.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
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
