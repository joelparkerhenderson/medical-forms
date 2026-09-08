import { calculateGrades } from './endocrine-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { axisStatusClass, axisStatusLabel, bmiCategory, calculateBMI, emptyAssessment } from './types.js';

// Endocrinology Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure axis grading engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'endocrinology-assessment.front-end-form-with-html.v1';

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
  slug: 'endocrinology-assessment',
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
    refreshAutoCalculatedReadouts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs derived values (BMI), progress, and conditional visibility after
 * each change.
 *
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  recomputeDerived();
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
}

/** Recompute auto-calculated values that depend on other fields. */
function recomputeDerived() {
  state.demographics.bmi = calculateBMI(
    state.demographics.weight,
    state.demographics.height
  );
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
    <input ${attrs.join(' ')} aria-describedby="${id}-error">
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
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
 */
function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}${opts.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      ${opts.required ? 'required data-required' : ''}
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
    <label class="label" for="${id}">${esc(opts.label)}${opts.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
    <select id="${id}" name="${id}" class="select"${opts.required ? ' required data-required' : ''} aria-describedby="${id}-error">
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
    label.className = 'radio-input';
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    const requiredAttr = opts.required ? ' required data-required' : '';
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
 * Read-only auto-calculated readout (e.g. BMI).
 */
function readOnlyReadout(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field readout';
  wrapper.innerHTML = `
    <label class="label">${esc(opts.label)}</label>
    <div id="${opts.id}" class="readout-value">${opts.render()}</div>
  `;
  return wrapper;
}

/**
 * Build a section card.
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
// Repeating-list editor (current medications)
// ----------------------------------------------------------------------

/**
 * Editor for an array of {name, dose, frequency} medication rows.
 * @param {{ section: string, field: string, addLabel: string }} opts
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
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Levothyroxine">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 75 mcg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. OD">
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

// ----------------------------------------------------------------------
// Section renderers (1 per assessment step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
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
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Ethnicity',
    section: 'demographics', field: 'ethnicity',
    placeholder: 'Optional'
  }));

  const measurements = document.createElement('div');
  measurements.className = 'three-col';
  measurements.appendChild(textInput({
    label: 'Weight', section: 'demographics', field: 'weight',
    type: 'number', min: 1, max: 400, unit: 'kg'
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'demographics', field: 'height',
    type: 'number', min: 50, max: 250, unit: 'cm'
  }));
  measurements.appendChild(readOnlyReadout({
    label: 'BMI',
    id: 'bmi-readout',
    render: () => {
      const bmi = state.demographics.bmi;
      if (bmi == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${bmi}</strong> <span class="muted">(${esc(bmiCategory(bmi))})</span>`;
    }
  }));
  card.appendChild(measurements);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Presenting Symptoms',
    description: 'Endocrine-related symptoms over the past few months.'
  });

  card.appendChild(radioGroup({ label: 'Have you had unusual fatigue?', section: 'presentingSymptoms', field: 'fatigue', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you had a change in body weight?', section: 'presentingSymptoms', field: 'weightChange', options: yesNo }));
  const wcDir = document.createElement('div');
  wcDir.dataset.conditional = 'presentingSymptoms.weightChange=yes';
  wcDir.appendChild(selectInput({
    label: 'Direction of weight change',
    section: 'presentingSymptoms', field: 'weightChangeDirection',
    options: [
      { value: 'gain', label: 'Weight gain' },
      { value: 'loss', label: 'Weight loss' },
      { value: 'fluctuating', label: 'Fluctuating' }
    ]
  }));
  card.appendChild(wcDir);

  card.appendChild(radioGroup({ label: 'Heat intolerance (feeling too hot)?', section: 'presentingSymptoms', field: 'heatIntolerance', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Cold intolerance (feeling too cold)?', section: 'presentingSymptoms', field: 'coldIntolerance', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Palpitations or fast heart rate?', section: 'presentingSymptoms', field: 'palpitations', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Hand tremor?', section: 'presentingSymptoms', field: 'tremor', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Excessive sweating?', section: 'presentingSymptoms', field: 'sweating', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Passing urine more often than usual?', section: 'presentingSymptoms', field: 'polyuria', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Increased thirst?', section: 'presentingSymptoms', field: 'polydipsia', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Mood changes?', section: 'presentingSymptoms', field: 'mood', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Skin changes (dryness, pigmentation, striae)?', section: 'presentingSymptoms', field: 'skinChanges', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Hair changes (loss, growth in unusual areas)?', section: 'presentingSymptoms', field: 'hairChanges', options: yesNo }));

  card.appendChild(selectInput({
    label: 'How long have you had these symptoms?',
    section: 'presentingSymptoms', field: 'symptomDuration',
    options: [
      { value: 'less-than-month', label: 'Less than 1 month' },
      { value: '1-3-months', label: '1-3 months' },
      { value: '3-12-months', label: '3-12 months' },
      { value: 'more-than-year', label: 'More than 1 year' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Other symptoms',
    section: 'presentingSymptoms', field: 'otherSymptoms',
    placeholder: 'Anything else not listed above…',
    rows: 3
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Thyroid Axis Review',
    description: 'TSH, free T4, free T3, antibodies, and thyroid examination.'
  });

  const lab = document.createElement('div');
  lab.className = 'three-col';
  lab.appendChild(textInput({
    label: 'TSH', section: 'thyroidAxis', field: 'tsh',
    type: 'number', min: 0, max: 1000, step: 0.01, unit: 'mIU/L'
  }));
  lab.appendChild(textInput({
    label: 'Free T4', section: 'thyroidAxis', field: 'ft4',
    type: 'number', min: 0, max: 100, step: 0.1, unit: 'pmol/L'
  }));
  lab.appendChild(textInput({
    label: 'Free T3', section: 'thyroidAxis', field: 'ft3',
    type: 'number', min: 0, max: 50, step: 0.1, unit: 'pmol/L'
  }));
  card.appendChild(lab);

  card.appendChild(radioGroup({
    label: 'Are thyroid autoantibodies (TPO/TgAb/TRAb) positive?',
    section: 'thyroidAxis', field: 'antibodiesPositive', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Goitre on examination?',
    section: 'thyroidAxis', field: 'goitre', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Family history of thyroid disease?',
    section: 'thyroidAxis', field: 'familyHistoryThyroid', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Thyroid notes',
    section: 'thyroidAxis', field: 'thyroidNotes',
    placeholder: 'Any additional thyroid-related notes…',
    rows: 3
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Adrenal Axis Review',
    description: 'Cortisol, ACTH, aldosterone/renin, and adrenal-related features.'
  });

  const lab = document.createElement('div');
  lab.className = 'two-col';
  lab.appendChild(textInput({
    label: 'Morning cortisol', section: 'adrenalAxis', field: 'morningCortisol',
    type: 'number', min: 0, max: 3000, step: 1, unit: 'nmol/L'
  }));
  lab.appendChild(textInput({
    label: 'ACTH', section: 'adrenalAxis', field: 'acth',
    type: 'number', min: 0, max: 500, step: 0.1, unit: 'pmol/L'
  }));
  lab.appendChild(textInput({
    label: 'Aldosterone', section: 'adrenalAxis', field: 'aldosterone',
    type: 'number', min: 0, max: 5000, step: 1, unit: 'pmol/L'
  }));
  lab.appendChild(textInput({
    label: 'Plasma renin activity', section: 'adrenalAxis', field: 'renin',
    type: 'number', min: 0, max: 50, step: 0.1, unit: 'ng/mL/hr'
  }));
  card.appendChild(lab);

  card.appendChild(radioGroup({
    label: 'Hyperpigmentation (skin / mucosa) on examination?',
    section: 'adrenalAxis', field: 'hyperpigmentation', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Cushingoid features (moon face, buffalo hump, striae)?',
    section: 'adrenalAxis', field: 'cushingoidFeatures', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Postural hypotension on standing?',
    section: 'adrenalAxis', field: 'posturalHypotension', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Adrenal notes',
    section: 'adrenalAxis', field: 'adrenalNotes',
    placeholder: 'Any additional adrenal-related notes…',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Glucose Metabolism',
    description: 'HbA1c, fasting / random glucose, and diabetes history.'
  });

  const lab = document.createElement('div');
  lab.className = 'three-col';
  lab.appendChild(textInput({
    label: 'HbA1c', section: 'glucoseMetabolism', field: 'hba1c',
    type: 'number', min: 0, max: 200, step: 0.1, unit: 'mmol/mol'
  }));
  lab.appendChild(textInput({
    label: 'Fasting glucose', section: 'glucoseMetabolism', field: 'fastingGlucose',
    type: 'number', min: 0, max: 50, step: 0.1, unit: 'mmol/L'
  }));
  lab.appendChild(textInput({
    label: 'Random glucose', section: 'glucoseMetabolism', field: 'randomGlucose',
    type: 'number', min: 0, max: 80, step: 0.1, unit: 'mmol/L'
  }));
  card.appendChild(lab);

  card.appendChild(radioGroup({
    label: 'Do you have a diagnosis of diabetes?',
    section: 'glucoseMetabolism', field: 'knownDiabetes', options: yesNo
  }));
  const dtype = document.createElement('div');
  dtype.dataset.conditional = 'glucoseMetabolism.knownDiabetes=yes';
  dtype.appendChild(selectInput({
    label: 'Type of diabetes',
    section: 'glucoseMetabolism', field: 'diabetesType',
    options: [
      { value: 'type-1', label: 'Type 1' },
      { value: 'type-2', label: 'Type 2' },
      { value: 'gestational', label: 'Gestational' },
      { value: 'mody', label: 'MODY' },
      { value: 'secondary', label: 'Secondary (steroid, pancreatic, etc.)' },
      { value: 'other', label: 'Other / unsure' }
    ]
  }));
  card.appendChild(dtype);

  card.appendChild(radioGroup({
    label: 'Have you had episodes of hypoglycaemia?',
    section: 'glucoseMetabolism', field: 'hypoglycaemiaEpisodes', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Glucose notes',
    section: 'glucoseMetabolism', field: 'glucoseNotes',
    placeholder: 'Any additional glucose-related notes…',
    rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Reproductive Axis',
    description: 'FSH, LH, testosterone or oestradiol, and reproductive history.'
  });

  const lab = document.createElement('div');
  lab.className = 'two-col';
  lab.appendChild(textInput({
    label: 'FSH', section: 'reproductiveAxis', field: 'fsh',
    type: 'number', min: 0, max: 200, step: 0.1, unit: 'IU/L'
  }));
  lab.appendChild(textInput({
    label: 'LH', section: 'reproductiveAxis', field: 'lh',
    type: 'number', min: 0, max: 200, step: 0.1, unit: 'IU/L'
  }));
  lab.appendChild(textInput({
    label: 'Testosterone', section: 'reproductiveAxis', field: 'testosterone',
    type: 'number', min: 0, max: 100, step: 0.1, unit: 'nmol/L'
  }));
  lab.appendChild(textInput({
    label: 'Oestradiol', section: 'reproductiveAxis', field: 'oestradiol',
    type: 'number', min: 0, max: 5000, step: 1, unit: 'pmol/L'
  }));
  card.appendChild(lab);

  card.appendChild(radioGroup({
    label: 'Menstrual irregularity (where applicable)?',
    section: 'reproductiveAxis', field: 'menstrualIrregularity', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Difficulty conceiving / infertility concerns?',
    section: 'reproductiveAxis', field: 'infertility', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Change in libido?',
    section: 'reproductiveAxis', field: 'libidoChange', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Galactorrhoea (milk discharge from breast)?',
    section: 'reproductiveAxis', field: 'galactorrhoea', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Reproductive notes',
    section: 'reproductiveAxis', field: 'reproductiveNotes',
    placeholder: 'Any additional reproductive-axis notes…',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Pituitary Function',
    description: 'Prolactin, IGF-1, growth hormone, and pituitary-related features.'
  });

  const lab = document.createElement('div');
  lab.className = 'three-col';
  lab.appendChild(textInput({
    label: 'Prolactin', section: 'pituitaryFunction', field: 'prolactin',
    type: 'number', min: 0, max: 100000, step: 1, unit: 'mU/L'
  }));
  lab.appendChild(textInput({
    label: 'IGF-1', section: 'pituitaryFunction', field: 'igf1',
    type: 'number', min: 0, max: 200, step: 0.1, unit: 'nmol/L'
  }));
  lab.appendChild(textInput({
    label: 'Growth hormone', section: 'pituitaryFunction', field: 'growthHormone',
    type: 'number', min: 0, max: 200, step: 0.1, unit: 'ng/mL'
  }));
  card.appendChild(lab);

  card.appendChild(radioGroup({
    label: 'Persistent or new headaches?',
    section: 'pituitaryFunction', field: 'headaches', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Visual disturbance (loss of peripheral vision, double vision)?',
    section: 'pituitaryFunction', field: 'visualDisturbance', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Acromegalic features (enlarged hands/feet, coarsened features)?',
    section: 'pituitaryFunction', field: 'acromegalicFeatures', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Has pituitary imaging (MRI) been performed?',
    section: 'pituitaryFunction', field: 'pituitaryImagingDone', options: yesNo
  }));
  const imaging = document.createElement('div');
  imaging.dataset.conditional = 'pituitaryFunction.pituitaryImagingDone=yes';
  imaging.appendChild(textArea({
    label: 'Imaging findings',
    section: 'pituitaryFunction', field: 'pituitaryImagingFindings',
    placeholder: 'Summarise key MRI/CT findings…',
    rows: 3
  }));
  card.appendChild(imaging);

  card.appendChild(textArea({
    label: 'Pituitary notes',
    section: 'pituitaryFunction', field: 'pituitaryNotes',
    placeholder: 'Any additional pituitary-related notes…',
    rows: 3
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Bone & Calcium',
    description: 'PTH, vitamin D, calcium, phosphate, and skeletal events.'
  });

  const lab = document.createElement('div');
  lab.className = 'two-col';
  lab.appendChild(textInput({
    label: 'PTH', section: 'boneCalcium', field: 'pth',
    type: 'number', min: 0, max: 200, step: 0.1, unit: 'pmol/L'
  }));
  lab.appendChild(textInput({
    label: 'Vitamin D (25-OH)', section: 'boneCalcium', field: 'vitaminD',
    type: 'number', min: 0, max: 500, step: 0.1, unit: 'nmol/L'
  }));
  lab.appendChild(textInput({
    label: 'Corrected calcium', section: 'boneCalcium', field: 'calciumCorrected',
    type: 'number', min: 0, max: 5, step: 0.01, unit: 'mmol/L'
  }));
  lab.appendChild(textInput({
    label: 'Phosphate', section: 'boneCalcium', field: 'phosphate',
    type: 'number', min: 0, max: 5, step: 0.01, unit: 'mmol/L'
  }));
  card.appendChild(lab);

  card.appendChild(radioGroup({
    label: 'Any fragility fracture (low-trauma fracture)?',
    section: 'boneCalcium', field: 'fragilityFracture', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Persistent bone pain?',
    section: 'boneCalcium', field: 'bonePain', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Has DEXA bone-density scan been performed?',
    section: 'boneCalcium', field: 'dexaScanDone', options: yesNo
  }));
  const dexa = document.createElement('div');
  dexa.dataset.conditional = 'boneCalcium.dexaScanDone=yes';
  dexa.appendChild(textInput({
    label: 'DEXA result (T-score or summary)',
    section: 'boneCalcium', field: 'dexaResult',
    placeholder: 'e.g. T-score -2.6 lumbar spine'
  }));
  card.appendChild(dexa);

  card.appendChild(textArea({
    label: 'Bone & calcium notes',
    section: 'boneCalcium', field: 'boneNotes',
    placeholder: 'Any additional bone/calcium notes…',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Medications & Lifestyle Review',
    description: 'Current medications, hormone therapies, and lifestyle factors.'
  });

  const medsHeader = document.createElement('div');
  medsHeader.className = 'list-section-header';
  medsHeader.innerHTML = `
    <h3>Current medications</h3>
    <p class="hint">List all current prescription and over-the-counter medications.</p>
  `;
  card.appendChild(medsHeader);
  card.appendChild(medicationListEditor({
    section: 'medicationsLifestyle',
    field: 'currentMedications',
    addLabel: 'Add medication'
  }));

  card.appendChild(radioGroup({
    label: 'Are you taking systemic steroids (prednisolone, hydrocortisone, etc.)?',
    section: 'medicationsLifestyle', field: 'steroidUse', options: yesNo
  }));
  const steroid = document.createElement('div');
  steroid.dataset.conditional = 'medicationsLifestyle.steroidUse=yes';
  steroid.appendChild(textInput({
    label: 'Steroid details (drug, dose, duration)',
    section: 'medicationsLifestyle', field: 'steroidDetails'
  }));
  card.appendChild(steroid);

  card.appendChild(radioGroup({
    label: 'Are you on hormone therapy (HRT, testosterone, contraception)?',
    section: 'medicationsLifestyle', field: 'hormoneTherapy', options: yesNo
  }));
  const hrt = document.createElement('div');
  hrt.dataset.conditional = 'medicationsLifestyle.hormoneTherapy=yes';
  hrt.appendChild(textInput({
    label: 'Hormone therapy details',
    section: 'medicationsLifestyle', field: 'hormoneTherapyDetails'
  }));
  card.appendChild(hrt);

  card.appendChild(radioGroup({
    label: 'Smoking status',
    section: 'medicationsLifestyle', field: 'smoking',
    options: [
      { value: 'current', label: 'Current smoker' },
      { value: 'ex', label: 'Ex-smoker' },
      { value: 'never', label: 'Never smoked' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Alcohol intake (units / week)',
    section: 'medicationsLifestyle', field: 'alcoholUnits',
    placeholder: 'e.g. 0, 5-10, more than 14'
  }));
  card.appendChild(selectInput({
    label: 'Exercise level',
    section: 'medicationsLifestyle', field: 'exerciseLevel',
    options: [
      { value: 'sedentary', label: 'Sedentary' },
      { value: 'light', label: 'Light (1-2 sessions / week)' },
      { value: 'moderate', label: 'Moderate (3-4 sessions / week)' },
      { value: 'vigorous', label: 'Vigorous (5+ sessions / week)' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Diet pattern',
    section: 'medicationsLifestyle', field: 'dietPattern',
    placeholder: 'Brief description of typical diet…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Family history of endocrine disease',
    section: 'medicationsLifestyle', field: 'familyHistoryEndocrine',
    placeholder: 'e.g. mother — type 2 diabetes; sister — Hashimoto\u2019s',
    rows: 3
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Clinical Impression & Management Plan',
    description: 'Working diagnosis, investigations, and management plan (clinician section).'
  });

  card.appendChild(textArea({
    label: 'Working diagnosis',
    section: 'clinicalImpression', field: 'workingDiagnosis',
    placeholder: 'Best-fit endocrine diagnosis given the data…',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Differential diagnoses',
    section: 'clinicalImpression', field: 'differentialDiagnoses',
    placeholder: 'List alternative diagnoses to consider…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Investigations requested',
    section: 'clinicalImpression', field: 'investigationsRequested',
    placeholder: 'Bloods, dynamic testing, imaging…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Management plan',
    section: 'clinicalImpression', field: 'managementPlan',
    placeholder: 'Medication changes, lifestyle advice, monitoring…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Follow-up plan',
    section: 'clinicalImpression', field: 'followUpPlan',
    placeholder: 'Timeframe and modality (clinic, telephone, virtual)…',
    rows: 2
  }));

  card.appendChild(radioGroup({
    label: 'Onward referral required?',
    section: 'clinicalImpression', field: 'referralRequired', options: yesNo
  }));
  const ref = document.createElement('div');
  ref.dataset.conditional = 'clinicalImpression.referralRequired=yes';
  ref.appendChild(textInput({
    label: 'Referral specialty',
    section: 'clinicalImpression', field: 'referralSpecialty',
    placeholder: 'e.g. Pituitary MDT, Bone metabolism clinic'
  }));
  card.appendChild(ref);

  card.appendChild(textArea({
    label: 'Additional clinician notes',
    section: 'clinicalImpression', field: 'clinicianNotes',
    placeholder: 'Free-text clinician observations…',
    rows: 3
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections + auto-calculated readouts
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

function refreshAutoCalculatedReadouts() {
  const bmi = document.getElementById('bmi-readout');
  if (bmi) {
    const v = state.demographics.bmi;
    bmi.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}</strong> <span class="muted">(${esc(bmiCategory(v))})</span>`;
  }
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
  ['demographics', 'weight'],
  ['demographics', 'height'],
  // Presenting symptoms (12 yes/no + duration)
  ['presentingSymptoms', 'fatigue'],
  ['presentingSymptoms', 'weightChange'],
  ['presentingSymptoms', 'heatIntolerance'],
  ['presentingSymptoms', 'coldIntolerance'],
  ['presentingSymptoms', 'palpitations'],
  ['presentingSymptoms', 'tremor'],
  ['presentingSymptoms', 'sweating'],
  ['presentingSymptoms', 'polyuria'],
  ['presentingSymptoms', 'polydipsia'],
  ['presentingSymptoms', 'mood'],
  ['presentingSymptoms', 'skinChanges'],
  ['presentingSymptoms', 'hairChanges'],
  ['presentingSymptoms', 'symptomDuration'],
  // Thyroid
  ['thyroidAxis', 'tsh'],
  ['thyroidAxis', 'ft4'],
  ['thyroidAxis', 'antibodiesPositive'],
  ['thyroidAxis', 'goitre'],
  ['thyroidAxis', 'familyHistoryThyroid'],
  // Adrenal
  ['adrenalAxis', 'morningCortisol'],
  ['adrenalAxis', 'acth'],
  ['adrenalAxis', 'hyperpigmentation'],
  ['adrenalAxis', 'cushingoidFeatures'],
  ['adrenalAxis', 'posturalHypotension'],
  // Glucose
  ['glucoseMetabolism', 'hba1c'],
  ['glucoseMetabolism', 'fastingGlucose'],
  ['glucoseMetabolism', 'knownDiabetes'],
  ['glucoseMetabolism', 'hypoglycaemiaEpisodes'],
  // Reproductive
  ['reproductiveAxis', 'menstrualIrregularity'],
  ['reproductiveAxis', 'infertility'],
  ['reproductiveAxis', 'libidoChange'],
  ['reproductiveAxis', 'galactorrhoea'],
  // Pituitary
  ['pituitaryFunction', 'prolactin'],
  ['pituitaryFunction', 'headaches'],
  ['pituitaryFunction', 'visualDisturbance'],
  ['pituitaryFunction', 'acromegalicFeatures'],
  ['pituitaryFunction', 'pituitaryImagingDone'],
  // Bone & calcium
  ['boneCalcium', 'pth'],
  ['boneCalcium', 'vitaminD'],
  ['boneCalcium', 'calciumCorrected'],
  ['boneCalcium', 'fragilityFracture'],
  ['boneCalcium', 'bonePain'],
  ['boneCalcium', 'dexaScanDone'],
  // Medications & lifestyle
  ['medicationsLifestyle', 'steroidUse'],
  ['medicationsLifestyle', 'hormoneTherapy'],
  ['medicationsLifestyle', 'smoking'],
  ['medicationsLifestyle', 'exerciseLevel'],
  // Clinical impression
  ['clinicalImpression', 'workingDiagnosis'],
  ['clinicalImpression', 'managementPlan'],
  ['clinicalImpression', 'referralRequired']
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
  { step: 2,  section: 'presentingSymptoms',   title: 'Presenting Symptoms' },
  { step: 3,  section: 'thyroidAxis',          title: 'Thyroid Axis' },
  { step: 4,  section: 'adrenalAxis',          title: 'Adrenal Axis' },
  { step: 5,  section: 'glucoseMetabolism',    title: 'Glucose Metabolism' },
  { step: 6,  section: 'reproductiveAxis',     title: 'Reproductive Axis' },
  { step: 7,  section: 'pituitaryFunction',    title: 'Pituitary Function' },
  { step: 8,  section: 'boneCalcium',          title: 'Bone & Calcium' },
  { step: 9,  section: 'medicationsLifestyle', title: 'Meds & Lifestyle' },
  { step: 10, section: 'clinicalImpression',   title: 'Clinical Impression' }
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

  const { axisGrades, overallStatus, answeredCount, additionalFlags, timestamp } = lastResult;

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

  const axisRows = axisGrades.map((g) => `
    <tr>
      <th scope="row">${esc(g.axis)}</th>
      <td><span class="status-badge ${axisStatusClass(g.status)}">${esc(axisStatusLabel(g.status))}</span></td>
      <td>${esc(g.rationale)}</td>
    </tr>
  `).join('');

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Endocrinology Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Overall Endocrine Status</h3>
      <p class="overall-summary">
        <span class="status-badge ${axisStatusClass(overallStatus)}">${esc(axisStatusLabel(overallStatus))}</span>
        <span class="overall-detail">Most-severe axis status across ${answeredCount} of 6 graded axes.</span>
      </p>

      <h3>Per-axis grades</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Axis</th>
            <th scope="col">Status</th>
            <th scope="col">Rationale</th>
          </tr>
        </thead>
        <tbody>${axisRows}</tbody>
      </table>

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
  recomputeDerived();
  const { axisGrades, overallStatus, answeredCount, firedRules } = calculateGrades(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    axisGrades,
    overallStatus,
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
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
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
  recomputeDerived();
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
