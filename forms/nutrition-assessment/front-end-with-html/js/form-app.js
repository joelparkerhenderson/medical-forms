import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateMUST, classifyMUSTScore, mustRiskLabel, severityClass, severityLabel } from './nutrition-grader.js';
import { bmiCategory, calculateBMI, calculateWeightLossPercent, emptyAssessment, suggestBmiCategory, suggestWeightLossCategory } from './types.js';

// Nutrition Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure MUST scoring engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'nutrition-assessment.front-end-form-with-html.v1';
const STEP_COUNT = 10;

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
  slug: 'nutrition-assessment',
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
 * Re-runs derived values (BMI, weight-loss %), progress, and conditional
 * visibility after each change.
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

/**
 * Recompute auto-calculated values that depend on other fields. Also
 * auto-prefills the MUST screening categorical answers when an objective
 * value is available — clinicians can still override the suggestion.
 */
function recomputeDerived() {
  const a = state.anthropometricMeasurements;
  a.bmi = calculateBMI(a.weightKg, a.heightCm);
  a.weightLossPercent = calculateWeightLossPercent(a.weightLossKg, a.usualWeightKg);

  const screen = state.nutritionalScreening;
  if (a.bmi !== null && screen.bmiCategory === '') {
    screen.bmiCategory = suggestBmiCategory(a.bmi);
  }
  if (a.weightLossPercent !== null && screen.weightLossCategory === '') {
    screen.weightLossCategory = suggestWeightLossCategory(a.weightLossPercent);
  }
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
 * Read-only auto-calculated readout (e.g. BMI, weight-loss %).
 * @param {{ label: string, id: string, render: () => string }} opts
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
    `<span class="section-step">Section ${opts.stepNumber} of ${STEP_COUNT}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Repeating-list editors
// ----------------------------------------------------------------------

/** Editor for an array of {allergen, reaction, severity} food-allergy rows. */
function foodAllergyEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.foodAllergiesIntolerances.foodAllergies;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No food allergies added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row allergy-row';
      r.innerHTML = `
        <div class="list-grid allergy-grid">
          <label class="list-cell">
            <span>Food / allergen</span>
            <input type="text" class="text-input" data-key="allergen" value="${esc(row.allergen)}" placeholder="e.g. peanuts, shellfish">
          </label>
          <label class="list-cell">
            <span>Reaction</span>
            <input type="text" class="text-input" data-key="reaction" value="${esc(row.reaction)}" placeholder="e.g. hives, swelling">
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
          <button type="button" class="button" data-variant="icon" aria-label="Remove food allergy">&times;</button>
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
    addBtn.textContent = '+ Add food allergy';
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

/** Simple list of free-text food-intolerance strings. */
function foodIntoleranceEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.foodAllergiesIntolerances.foodIntolerances;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No food intolerances added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((value, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row simple-row';
      r.innerHTML = `
        <input type="text" class="text-input"
               value="${esc(value)}"
               placeholder="e.g. onions, spicy foods, FODMAPs">
        <button type="button" class="button" data-variant="icon" aria-label="Remove intolerance">&times;</button>
      `;
      const inp = r.querySelector('input');
      inp.addEventListener('input', () => {
        rows[idx] = inp.value;
        saveState(state);
        updateProgress();
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
    addBtn.textContent = '+ Add food intolerance';
    addBtn.addEventListener('click', () => {
      rows.push('');
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

/**
 * Editor for an array of {name, dose, frequency} supplement rows.
 * @param {{ section: string, field: string, addLabel: string }} opts
 */
function supplementListEditor(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

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
      r.className = 'list-row supplement-row';
      r.innerHTML = `
        <div class="list-grid supplement-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Ensure Plus, Multivitamin">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 200 ml, 1 tablet">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. BD, OD">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove">&times;</button>
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
// Section renderers
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

  const grid2 = document.createElement('div');
  grid2.className = 'two-col';
  grid2.appendChild(textInput({ label: 'Ethnicity', section: 'demographics', field: 'ethnicity' }));
  grid2.appendChild(textInput({ label: 'Primary Language', section: 'demographics', field: 'primaryLanguage' }));
  card.appendChild(grid2);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Anthropometric Measurements',
    description: 'Current weight, height, recent weight change, and other body-composition measures.'
  });

  const measurements = document.createElement('div');
  measurements.className = 'three-col';
  measurements.appendChild(textInput({
    label: 'Current weight', section: 'anthropometricMeasurements', field: 'weightKg',
    type: 'number', min: 1, max: 400, step: 0.1, unit: 'kg'
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'anthropometricMeasurements', field: 'heightCm',
    type: 'number', min: 50, max: 250, step: 0.1, unit: 'cm'
  }));
  measurements.appendChild(readOnlyReadout({
    label: 'BMI',
    id: 'bmi-readout',
    render: () => {
      const bmi = state.anthropometricMeasurements.bmi;
      if (bmi == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${bmi}</strong> <span class="muted">(${esc(bmiCategory(bmi))})</span>`;
    }
  }));
  card.appendChild(measurements);

  const wlGrid = document.createElement('div');
  wlGrid.className = 'three-col';
  wlGrid.appendChild(textInput({
    label: 'Usual stable weight', section: 'anthropometricMeasurements', field: 'usualWeightKg',
    type: 'number', min: 1, max: 400, step: 0.1, unit: 'kg'
  }));
  wlGrid.appendChild(textInput({
    label: 'Unplanned weight loss (last 3-6 months)',
    section: 'anthropometricMeasurements', field: 'weightLossKg',
    type: 'number', min: 0, max: 200, step: 0.1, unit: 'kg'
  }));
  wlGrid.appendChild(readOnlyReadout({
    label: 'Weight loss %',
    id: 'weight-loss-readout',
    render: () => {
      const pct = state.anthropometricMeasurements.weightLossPercent;
      if (pct == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${pct}%</strong> <span class="muted">of usual weight</span>`;
    }
  }));
  card.appendChild(wlGrid);

  const otherGrid = document.createElement('div');
  otherGrid.className = 'two-col';
  otherGrid.appendChild(textInput({
    label: 'Mid-upper arm circumference',
    section: 'anthropometricMeasurements', field: 'midUpperArmCircumferenceCm',
    type: 'number', min: 0, max: 100, step: 0.1, unit: 'cm'
  }));
  otherGrid.appendChild(textInput({
    label: 'Triceps skinfold',
    section: 'anthropometricMeasurements', field: 'tricepsSkinfoldMm',
    type: 'number', min: 0, max: 100, step: 0.1, unit: 'mm'
  }));
  card.appendChild(otherGrid);

  card.appendChild(textInput({
    label: 'Date of measurements',
    section: 'anthropometricMeasurements', field: 'measurementDate',
    type: 'date'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Dietary History',
    description: 'Usual diet pattern, intake, fluids, and lifestyle factors.'
  });

  card.appendChild(textArea({
    label: 'Describe your typical diet',
    section: 'dietaryHistory', field: 'typicalDiet',
    placeholder: 'e.g. three meals per day with snacks; describe a typical day…',
    rows: 3
  }));

  card.appendChild(selectInput({
    label: 'Diet pattern',
    section: 'dietaryHistory', field: 'dietPattern',
    options: [
      { value: 'omnivore', label: 'Omnivore (no restrictions)' },
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'pescatarian', label: 'Pescatarian' },
      { value: 'other', label: 'Other' }
    ]
  }));
  const dietOther = document.createElement('div');
  dietOther.dataset.conditional = 'dietaryHistory.dietPattern=other';
  dietOther.appendChild(textInput({
    label: 'Please specify diet pattern',
    section: 'dietaryHistory', field: 'dietPatternOther'
  }));
  card.appendChild(dietOther);

  const mealsGrid = document.createElement('div');
  mealsGrid.className = 'two-col';
  mealsGrid.appendChild(textInput({
    label: 'Meals per day', section: 'dietaryHistory', field: 'mealsPerDay',
    type: 'number', min: 0, max: 10
  }));
  mealsGrid.appendChild(textInput({
    label: 'Snacks per day', section: 'dietaryHistory', field: 'snacksPerDay',
    type: 'number', min: 0, max: 10
  }));
  card.appendChild(mealsGrid);

  card.appendChild(radioGroup({
    label: 'Has your appetite decreased recently?',
    section: 'dietaryHistory', field: 'appetiteDecreased', options: yesNo
  }));
  const appetiteNotes = document.createElement('div');
  appetiteNotes.dataset.conditional = 'dietaryHistory.appetiteDecreased=yes';
  appetiteNotes.appendChild(textArea({
    label: 'Appetite change notes',
    section: 'dietaryHistory', field: 'appetiteChangeNotes',
    placeholder: 'How long, what changed…',
    rows: 2
  }));
  card.appendChild(appetiteNotes);

  card.appendChild(radioGroup({
    label: 'Has your food intake been reduced?',
    section: 'dietaryHistory', field: 'foodIntakeReduced', options: yesNo
  }));
  const reducedDays = document.createElement('div');
  reducedDays.dataset.conditional = 'dietaryHistory.foodIntakeReduced=yes';
  reducedDays.appendChild(textInput({
    label: 'For how many days?',
    section: 'dietaryHistory', field: 'reducedIntakeDays',
    type: 'number', min: 0, max: 365, unit: 'days'
  }));
  card.appendChild(reducedDays);

  card.appendChild(radioGroup({
    label: 'Do you feel your fluid intake is adequate?',
    section: 'dietaryHistory', field: 'fluidIntakeAdequate', options: yesNo
  }));
  card.appendChild(textInput({
    label: 'Estimated fluid intake per day',
    section: 'dietaryHistory', field: 'fluidIntakeMlPerDay',
    type: 'number', min: 0, max: 10000, unit: 'ml'
  }));

  card.appendChild(radioGroup({
    label: 'Do you drink alcohol?',
    section: 'dietaryHistory', field: 'alcoholUse', options: yesNo
  }));
  const alcDetails = document.createElement('div');
  alcDetails.dataset.conditional = 'dietaryHistory.alcoholUse=yes';
  alcDetails.appendChild(textInput({
    label: 'Alcohol units per week',
    section: 'dietaryHistory', field: 'alcoholUnitsPerWeek',
    type: 'number', min: 0, max: 200, unit: 'units'
  }));
  card.appendChild(alcDetails);

  card.appendChild(radioGroup({
    label: 'Do you have any cultural or religious dietary restrictions?',
    section: 'dietaryHistory', field: 'culturalReligiousRestrictions', options: yesNo
  }));
  const cultDetails = document.createElement('div');
  cultDetails.dataset.conditional = 'dietaryHistory.culturalReligiousRestrictions=yes';
  cultDetails.appendChild(textArea({
    label: 'Details of restrictions',
    section: 'dietaryHistory', field: 'culturalReligiousDetails',
    rows: 2
  }));
  card.appendChild(cultDetails);

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Nutritional Screening (MUST)',
    description: 'Malnutrition Universal Screening Tool — three-step screen producing an overall risk score (0-6).'
  });

  card.appendChild(radioGroup({
    label: 'Step 1: Body Mass Index (BMI) category',
    section: 'nutritionalScreening', field: 'bmiCategory',
    options: [
      { value: '>=20', label: 'BMI > 20 (score 0)' },
      { value: '18.5-20', label: 'BMI 18.5-20 (score 1)' },
      { value: '<18.5', label: 'BMI < 18.5 (score 2)' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Step 2: Unplanned weight loss in the past 3-6 months',
    section: 'nutritionalScreening', field: 'weightLossCategory',
    options: [
      { value: '<5', label: '< 5% (score 0)' },
      { value: '5-10', label: '5 - 10% (score 1)' },
      { value: '>10', label: '> 10% (score 2)' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Step 3: Acute disease effect',
    section: 'nutritionalScreening', field: 'acuteDisease',
    options: [
      { value: 'none', label: 'None / not acutely ill (score 0)' },
      { value: 'acutely-ill-no-intake-5d', label: 'Acutely ill AND no nutritional intake (or likely none) for >5 days (score 2)' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Has there been any other unintentional weight loss not captured above?',
    section: 'nutritionalScreening', field: 'unintentionalWeightLoss', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Has appetite been reduced in the past 7 days?',
    section: 'nutritionalScreening', field: 'reducedAppetite7Days', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Additional screening notes',
    section: 'nutritionalScreening', field: 'additionalScreeningNotes',
    placeholder: 'Any factors not captured above…',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Swallowing & Oral Health',
    description: 'Difficulties with swallowing, chewing, or oral health that may limit intake.'
  });

  card.appendChild(radioGroup({ label: 'Do you have any difficulty swallowing?', section: 'swallowingOralHealth', field: 'swallowingDifficulty', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you cough while eating or drinking?', section: 'swallowingOralHealth', field: 'coughingWhileEating', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you had episodes of choking?', section: 'swallowingOralHealth', field: 'chokingEpisodes', options: yesNo }));

  card.appendChild(radioGroup({ label: 'Do you wear dentures?', section: 'swallowingOralHealth', field: 'dentureUse', options: yesNo }));
  const dentureFit = document.createElement('div');
  dentureFit.dataset.conditional = 'swallowingOralHealth.dentureUse=yes';
  dentureFit.appendChild(radioGroup({
    label: 'Do your dentures fit well?',
    section: 'swallowingOralHealth', field: 'denturesFitWell', options: yesNo
  }));
  card.appendChild(dentureFit);

  card.appendChild(radioGroup({ label: 'Do you have dental pain?', section: 'swallowingOralHealth', field: 'dentalPain', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have mouth sores or ulcers?', section: 'swallowingOralHealth', field: 'mouthSores', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have a dry mouth?', section: 'swallowingOralHealth', field: 'dryMouth', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you noticed taste changes?', section: 'swallowingOralHealth', field: 'tasteChanges', options: yesNo }));

  card.appendChild(textArea({
    label: 'Additional swallowing or oral-health notes',
    section: 'swallowingOralHealth', field: 'swallowingNotes',
    rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Gastrointestinal Function',
    description: 'Symptoms that may interfere with appetite, intake, or nutrient absorption.'
  });

  card.appendChild(radioGroup({ label: 'Nausea?', section: 'gastrointestinalFunction', field: 'nausea', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Vomiting?', section: 'gastrointestinalFunction', field: 'vomiting', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Diarrhoea?', section: 'gastrointestinalFunction', field: 'diarrhea', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Constipation?', section: 'gastrointestinalFunction', field: 'constipation', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Abdominal pain?', section: 'gastrointestinalFunction', field: 'abdominalPain', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Bloating?', section: 'gastrointestinalFunction', field: 'bloating', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Reflux / heartburn?', section: 'gastrointestinalFunction', field: 'reflux', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Early satiety (feeling full quickly)?', section: 'gastrointestinalFunction', field: 'earlysatiety', options: yesNo }));

  card.appendChild(textArea({
    label: 'Bowel-habit notes',
    section: 'gastrointestinalFunction', field: 'bowelHabitNotes',
    placeholder: 'Frequency, consistency, recent changes…',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Food Allergies & Intolerances',
    description: 'Document food allergies (with reactions and severity) and intolerances.'
  });

  const allHeader = document.createElement('div');
  allHeader.className = 'list-section-header';
  allHeader.innerHTML = '<h3>Food allergies</h3>';
  card.appendChild(allHeader);
  card.appendChild(foodAllergyEditor());

  const intHeader = document.createElement('div');
  intHeader.className = 'list-section-header';
  intHeader.innerHTML = '<h3>Food intolerances</h3>';
  card.appendChild(intHeader);
  card.appendChild(foodIntoleranceEditor());

  card.appendChild(radioGroup({
    label: 'Do you have lactose intolerance?',
    section: 'foodAllergiesIntolerances', field: 'lactoseIntolerance', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have gluten intolerance / coeliac disease?',
    section: 'foodAllergiesIntolerances', field: 'glutenIntolerance', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Has formal food-allergy testing been done?',
    section: 'foodAllergiesIntolerances', field: 'allergyTestingDone', options: yesNo
  }));
  const resultsDetails = document.createElement('div');
  resultsDetails.dataset.conditional = 'foodAllergiesIntolerances.allergyTestingDone=yes';
  resultsDetails.appendChild(textArea({
    label: 'Allergy test results',
    section: 'foodAllergiesIntolerances', field: 'allergyTestResults',
    rows: 3
  }));
  card.appendChild(resultsDetails);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Nutritional Requirements',
    description: 'Estimated daily energy, protein, and fluid requirements.'
  });

  const grid = document.createElement('div');
  grid.className = 'three-col';
  grid.appendChild(textInput({
    label: 'Estimated energy', section: 'nutritionalRequirements', field: 'estimatedEnergyKcal',
    type: 'number', min: 0, max: 6000, unit: 'kcal/day'
  }));
  grid.appendChild(textInput({
    label: 'Estimated protein', section: 'nutritionalRequirements', field: 'estimatedProteinG',
    type: 'number', min: 0, max: 500, step: 0.1, unit: 'g/day'
  }));
  grid.appendChild(textInput({
    label: 'Estimated fluid', section: 'nutritionalRequirements', field: 'estimatedFluidMl',
    type: 'number', min: 0, max: 10000, unit: 'ml/day'
  }));
  card.appendChild(grid);

  card.appendChild(textArea({
    label: 'How were these requirements estimated?',
    section: 'nutritionalRequirements', field: 'requirementsBasis',
    placeholder: 'e.g. Schofield equation, Henry equation, body-weight rule…',
    rows: 2
  }));

  card.appendChild(radioGroup({
    label: 'Are requirements increased above baseline?',
    section: 'nutritionalRequirements', field: 'increasedRequirements', options: yesNo
  }));
  const incReason = document.createElement('div');
  incReason.dataset.conditional = 'nutritionalRequirements.increasedRequirements=yes';
  incReason.appendChild(textArea({
    label: 'Reason for increased requirements',
    section: 'nutritionalRequirements', field: 'increasedRequirementsReason',
    placeholder: 'e.g. wound healing, sepsis, burns, pregnancy…',
    rows: 2
  }));
  card.appendChild(incReason);

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Current Nutritional Support',
    description: 'Current oral, enteral, and parenteral support; vitamin/mineral supplementation; dietician involvement.'
  });

  card.appendChild(radioGroup({
    label: 'Are you taking oral nutritional supplements (e.g. Ensure, Fortisip)?',
    section: 'currentNutritionalSupport', field: 'oralSupplements', options: yesNo
  }));
  const oralList = document.createElement('div');
  oralList.dataset.conditional = 'currentNutritionalSupport.oralSupplements=yes';
  const oralHeader = document.createElement('div');
  oralHeader.className = 'list-section-header';
  oralHeader.innerHTML = '<h3>Oral nutritional supplements</h3>';
  oralList.appendChild(oralHeader);
  oralList.appendChild(supplementListEditor({
    section: 'currentNutritionalSupport', field: 'oralSupplementList',
    addLabel: 'Add oral supplement'
  }));
  card.appendChild(oralList);

  card.appendChild(radioGroup({
    label: 'Are you receiving enteral (tube) feeding?',
    section: 'currentNutritionalSupport', field: 'enteralFeeding', options: yesNo
  }));
  const entDetails = document.createElement('div');
  entDetails.dataset.conditional = 'currentNutritionalSupport.enteralFeeding=yes';
  entDetails.appendChild(selectInput({
    label: 'Enteral feeding route',
    section: 'currentNutritionalSupport', field: 'enteralRoute',
    options: [
      { value: 'NG', label: 'Nasogastric (NG)' },
      { value: 'NJ', label: 'Nasojejunal (NJ)' },
      { value: 'PEG', label: 'Percutaneous endoscopic gastrostomy (PEG)' },
      { value: 'PEJ', label: 'Percutaneous endoscopic jejunostomy (PEJ)' },
      { value: 'RIG', label: 'Radiologically inserted gastrostomy (RIG)' },
      { value: 'other', label: 'Other' }
    ]
  }));
  entDetails.appendChild(textInput({
    label: 'Enteral formula',
    section: 'currentNutritionalSupport', field: 'enteralFormula',
    placeholder: 'e.g. Nutrison Energy Multi Fibre 1500 ml/24h'
  }));
  card.appendChild(entDetails);

  card.appendChild(radioGroup({
    label: 'Are you receiving parenteral nutrition (intravenous nutrition)?',
    section: 'currentNutritionalSupport', field: 'parenteralNutrition', options: yesNo
  }));
  const pnDetails = document.createElement('div');
  pnDetails.dataset.conditional = 'currentNutritionalSupport.parenteralNutrition=yes';
  pnDetails.appendChild(textArea({
    label: 'Parenteral nutrition details',
    section: 'currentNutritionalSupport', field: 'parenteralDetails',
    placeholder: 'Regimen, line type, duration…',
    rows: 2
  }));
  card.appendChild(pnDetails);

  card.appendChild(radioGroup({
    label: 'Are you taking vitamin or mineral supplements?',
    section: 'currentNutritionalSupport', field: 'vitaminMineralSupplements', options: yesNo
  }));
  const vmList = document.createElement('div');
  vmList.dataset.conditional = 'currentNutritionalSupport.vitaminMineralSupplements=yes';
  const vmHeader = document.createElement('div');
  vmHeader.className = 'list-section-header';
  vmHeader.innerHTML = '<h3>Vitamin / mineral supplements</h3>';
  vmList.appendChild(vmHeader);
  vmList.appendChild(supplementListEditor({
    section: 'currentNutritionalSupport', field: 'vitaminMineralList',
    addLabel: 'Add vitamin / mineral'
  }));
  card.appendChild(vmList);

  card.appendChild(radioGroup({
    label: 'Are you currently under the care of a dietician?',
    section: 'currentNutritionalSupport', field: 'dieticianInvolvement', options: yesNo
  }));
  card.appendChild(textInput({
    label: 'Date of last dietician review',
    section: 'currentNutritionalSupport', field: 'lastDieticianReviewDate',
    type: 'date'
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Care Plan & Monitoring',
    description: 'Goals, planned interventions, monitoring, and follow-up.'
  });

  card.appendChild(textArea({
    label: 'Nutrition goals',
    section: 'carePlanMonitoring', field: 'nutritionGoals',
    placeholder: 'e.g. weight gain of 0.5 kg/week, maintain hydration…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Planned interventions',
    section: 'carePlanMonitoring', field: 'interventionsPlanned',
    placeholder: 'e.g. food fortification, ONS twice daily, SLT review…',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Is weight monitoring planned?',
    section: 'carePlanMonitoring', field: 'weightMonitoringPlanned', options: yesNo
  }));
  const wmFreq = document.createElement('div');
  wmFreq.dataset.conditional = 'carePlanMonitoring.weightMonitoringPlanned=yes';
  wmFreq.appendChild(selectInput({
    label: 'Weight monitoring frequency',
    section: 'carePlanMonitoring', field: 'weightMonitoringFrequency',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'twice-weekly', label: 'Twice weekly' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'fortnightly', label: 'Fortnightly' },
      { value: 'monthly', label: 'Monthly' }
    ]
  }));
  card.appendChild(wmFreq);

  card.appendChild(radioGroup({
    label: 'Is food-intake monitoring planned (e.g. food chart)?',
    section: 'carePlanMonitoring', field: 'foodIntakeMonitoringPlanned', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Is referral to another service required?',
    section: 'carePlanMonitoring', field: 'referralRequired', options: yesNo
  }));
  const refDetails = document.createElement('div');
  refDetails.dataset.conditional = 'carePlanMonitoring.referralRequired=yes';
  refDetails.appendChild(textArea({
    label: 'Referral details',
    section: 'carePlanMonitoring', field: 'referralDetails',
    placeholder: 'e.g. dietician, SLT, gastroenterology…',
    rows: 2
  }));
  card.appendChild(refDetails);

  card.appendChild(textInput({
    label: 'Follow-up date',
    section: 'carePlanMonitoring', field: 'followUpDate',
    type: 'date'
  }));
  card.appendChild(textArea({
    label: 'Additional notes',
    section: 'carePlanMonitoring', field: 'additionalNotes',
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
    const v = state.anthropometricMeasurements.bmi;
    bmi.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}</strong> <span class="muted">(${esc(bmiCategory(v))})</span>`;
  }
  const wl = document.getElementById('weight-loss-readout');
  if (wl) {
    const v = state.anthropometricMeasurements.weightLossPercent;
    wl.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}%</strong> <span class="muted">of usual weight</span>`;
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
  // Anthropometrics
  ['anthropometricMeasurements', 'weightKg'],
  ['anthropometricMeasurements', 'heightCm'],
  ['anthropometricMeasurements', 'usualWeightKg'],
  ['anthropometricMeasurements', 'weightLossKg'],
  // Dietary
  ['dietaryHistory', 'dietPattern'],
  ['dietaryHistory', 'mealsPerDay'],
  ['dietaryHistory', 'appetiteDecreased'],
  ['dietaryHistory', 'foodIntakeReduced'],
  ['dietaryHistory', 'fluidIntakeAdequate'],
  ['dietaryHistory', 'alcoholUse'],
  // MUST screening
  ['nutritionalScreening', 'bmiCategory'],
  ['nutritionalScreening', 'weightLossCategory'],
  ['nutritionalScreening', 'acuteDisease'],
  ['nutritionalScreening', 'unintentionalWeightLoss'],
  ['nutritionalScreening', 'reducedAppetite7Days'],
  // Swallowing & oral
  ['swallowingOralHealth', 'swallowingDifficulty'],
  ['swallowingOralHealth', 'coughingWhileEating'],
  ['swallowingOralHealth', 'chokingEpisodes'],
  ['swallowingOralHealth', 'dentureUse'],
  ['swallowingOralHealth', 'dentalPain'],
  ['swallowingOralHealth', 'mouthSores'],
  ['swallowingOralHealth', 'dryMouth'],
  ['swallowingOralHealth', 'tasteChanges'],
  // GI
  ['gastrointestinalFunction', 'nausea'],
  ['gastrointestinalFunction', 'vomiting'],
  ['gastrointestinalFunction', 'diarrhea'],
  ['gastrointestinalFunction', 'constipation'],
  ['gastrointestinalFunction', 'abdominalPain'],
  ['gastrointestinalFunction', 'bloating'],
  ['gastrointestinalFunction', 'reflux'],
  ['gastrointestinalFunction', 'earlysatiety'],
  // Allergies
  ['foodAllergiesIntolerances', 'lactoseIntolerance'],
  ['foodAllergiesIntolerances', 'glutenIntolerance'],
  ['foodAllergiesIntolerances', 'allergyTestingDone'],
  // Requirements
  ['nutritionalRequirements', 'estimatedEnergyKcal'],
  ['nutritionalRequirements', 'estimatedProteinG'],
  ['nutritionalRequirements', 'estimatedFluidMl'],
  ['nutritionalRequirements', 'increasedRequirements'],
  // Support
  ['currentNutritionalSupport', 'oralSupplements'],
  ['currentNutritionalSupport', 'enteralFeeding'],
  ['currentNutritionalSupport', 'parenteralNutrition'],
  ['currentNutritionalSupport', 'vitaminMineralSupplements'],
  ['currentNutritionalSupport', 'dieticianInvolvement'],
  // Care plan
  ['carePlanMonitoring', 'weightMonitoringPlanned'],
  ['carePlanMonitoring', 'foodIntakeMonitoringPlanned'],
  ['carePlanMonitoring', 'referralRequired']
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
  { step: 1,  section: 'demographics',                title: 'Demographics' },
  { step: 2,  section: 'anthropometricMeasurements',  title: 'Anthropometrics' },
  { step: 3,  section: 'dietaryHistory',              title: 'Dietary History' },
  { step: 4,  section: 'nutritionalScreening',        title: 'MUST Screening' },
  { step: 5,  section: 'swallowingOralHealth',        title: 'Swallowing / Oral' },
  { step: 6,  section: 'gastrointestinalFunction',    title: 'GI Function' },
  { step: 7,  section: 'foodAllergiesIntolerances',   title: 'Allergies' },
  { step: 8,  section: 'nutritionalRequirements',     title: 'Requirements' },
  { step: 9,  section: 'currentNutritionalSupport',   title: 'Support' },
  { step: 10, section: 'carePlanMonitoring',          title: 'Care Plan' }
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

  const {
    mustScore, mustRisk, severity, answeredCount,
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
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
      <td class="num">${r.score} / 2</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No MUST screening steps answered.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Step</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Nutrition Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>MUST Total Score</h3>
      <p class="must-summary">
        <span class="must-score-badge ${severityClass(severity)}">${mustScore} / 6</span>
        <span class="severity-level">${esc(mustRiskLabel(mustRisk))} &mdash; ${esc(severityLabel(severity))}</span>
      </p>
      <p class="muted">Based on ${answeredCount} of 3 MUST screening steps answered.</p>

      <h3>Per-step scores</h3>
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
  recomputeDerived();
  const { mustScore, mustRisk, severity, answeredCount, firedRules } = calculateMUST(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    mustScore,
    mustRisk,
    severity,
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
