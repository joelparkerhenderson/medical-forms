import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateGold } from './gold-grader.js';
import { abcdGroupLabel, bmiCategory, calculateBMI, calculateFev1FvcRatio, catImpactLabel, emptyAssessment, goldStageClass, goldStageLabel } from './types.js';

// Pulmonology Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure GOLD scoring engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'pulmonology-assessment.front-end-form-with-html.v1';

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
    const incoming = parsed && parsed[key];
    if (Array.isArray(fresh[key])) {
      if (Array.isArray(incoming)) fresh[key] = incoming.slice();
    } else if (incoming && typeof incoming === 'object') {
      fresh[key] = { ...fresh[key], ...incoming };
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
  slug: 'pulmonology-assessment',
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
 * Re-runs derived values (BMI, FEV1/FVC ratio), progress, and conditional
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

/** Recompute auto-calculated values that depend on other fields. */
function recomputeDerived() {
  state.demographics.bmi = calculateBMI(
    state.demographics.weight,
    state.demographics.height
  );
  state.spirometry.fev1FvcRatio = calculateFev1FvcRatio(
    state.spirometry.fev1,
    state.spirometry.fvc
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

/**
 * Build a labelled text input.
 * @param {{ label: string, section: string, field: string, type?: string,
 *           placeholder?: string, required?: boolean, min?: number,
 *           max?: number, step?: number, unit?: string, hint?: string }} opts
 */
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
  const requiredAttrs = opts.required ? ' data-required' : '';
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
    <label class="label" for="${id}"${requiredAttrs}>${labelText}</label>
    <input ${attrs.join(' ')}>
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
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
 *           options: { value: string, label: string }[],
 *           required?: boolean }} opts
 */
function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const requiredAttrs = opts.required ? ' data-required' : '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  const requiredSel = opts.required ? ' data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${requiredAttrs}>${labelText}</label>
    <select id="${id}" name="${id}" class="select"${requiredSel} aria-describedby="${id}-error">
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
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const labelEl = document.createElement('span');
  labelEl.className = 'label';
  labelEl.id = `${groupId}-label`;
  labelEl.innerHTML = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  wrapper.appendChild(labelEl);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', `${groupId}-label`);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    label.innerHTML = `
      <input type="radio" class="radio-input" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) setField(opts.section, opts.field, option.value);
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);
  return wrapper;
}

/**
 * Read-only auto-calculated readout (e.g. BMI, FEV1/FVC ratio).
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
    `<span class="section-step">Section ${opts.stepNumber} of 10</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Repeating-list editors (other medications, allergies)
// ----------------------------------------------------------------------

/**
 * Editor for an array of {name, dose, frequency} medication rows
 * stored at `state[section][field]`.
 *
 * @param {{ section: string, field: string, addLabel: string }} opts
 */
function medicationListEditor(opts) {
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
      r.className = 'list-row med-row';
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Theophylline">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 200 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. BD">
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

/**
 * Editor for the top-level `state.allergies` array of
 * `{ allergen, reaction, severity }` rows.
 */
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
        'No allergies added. Click the button below to add one, or proceed to next step if you have none.';
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

  const measurements = document.createElement('div');
  measurements.className = 'three-col';
  measurements.appendChild(textInput({
    label: 'Weight', section: 'demographics', field: 'weight',
    type: 'number', min: 1, max: 400, unit: 'kg', required: true
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'demographics', field: 'height',
    type: 'number', min: 50, max: 250, unit: 'cm', required: true
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
    title: 'Chief Complaint',
    description: 'Primary reason for this pulmonology visit.'
  });

  card.appendChild(textInput({
    label: 'Primary symptom',
    section: 'chiefComplaint', field: 'primarySymptom',
    placeholder: 'e.g. shortness of breath, chronic cough',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Duration of symptoms',
    section: 'chiefComplaint', field: 'symptomDuration',
    placeholder: 'e.g. 6 months, 2 years',
    required: true
  }));
  card.appendChild(selectInput({
    label: 'MRC Dyspnoea Grade',
    section: 'chiefComplaint', field: 'dyspnoeaGradeMRC',
    required: true,
    options: [
      { value: '1', label: 'Grade 1 - Breathless only with strenuous exercise' },
      { value: '2', label: 'Grade 2 - Short of breath when hurrying on level ground' },
      { value: '3', label: 'Grade 3 - Walks slower than contemporaries or stops for breath' },
      { value: '4', label: 'Grade 4 - Stops for breath after ~100m on level ground' },
      { value: '5', label: 'Grade 5 - Too breathless to leave the house or dress' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Spirometry Results',
    description: 'Lung function test measurements (leave blank if unknown).'
  });

  const grid1 = document.createElement('div');
  grid1.className = 'two-col';
  grid1.appendChild(textInput({
    label: 'FEV1', section: 'spirometry', field: 'fev1',
    type: 'number', min: 0, max: 10, step: 0.01, unit: 'litres'
  }));
  grid1.appendChild(textInput({
    label: 'FVC', section: 'spirometry', field: 'fvc',
    type: 'number', min: 0, max: 10, step: 0.01, unit: 'litres'
  }));
  card.appendChild(grid1);

  const grid2 = document.createElement('div');
  grid2.className = 'two-col';
  grid2.appendChild(readOnlyReadout({
    label: 'FEV1/FVC Ratio',
    id: 'fev1-fvc-readout',
    render: () => renderFev1FvcReadout()
  }));
  grid2.appendChild(textInput({
    label: 'FEV1 % Predicted',
    section: 'spirometry', field: 'fev1PercentPredicted',
    type: 'number', min: 0, max: 150, unit: '%'
  }));
  card.appendChild(grid2);

  card.appendChild(radioGroup({
    label: 'Significant bronchodilator response?',
    section: 'spirometry', field: 'bronchodilatorResponse',
    options: yesNo
  }));

  return card;
}

/** Inner HTML for the FEV1/FVC ratio readout. */
function renderFev1FvcReadout() {
  const r = state.spirometry.fev1FvcRatio;
  if (r == null) {
    return '<span class="muted">Auto-calculated from FEV1/FVC</span>';
  }
  const note = r < 0.7
    ? '<span class="obstructive">(Obstructive pattern)</span>'
    : '<span class="normal">(Normal)</span>';
  return `<strong>${r}</strong> ${note}`;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Symptom Assessment',
    description: 'COPD symptom severity evaluation.'
  });

  card.appendChild(textInput({
    label: 'CAT Score (COPD Assessment Test)',
    section: 'symptomAssessment', field: 'catScore',
    type: 'number', min: 0, max: 40,
    hint: 'Total score from the 8-item COPD Assessment Test (0-40).'
  }));
  // CAT impact band readout.
  const catImpact = document.createElement('div');
  catImpact.id = 'cat-impact-readout';
  catImpact.className = 'field';
  catImpact.innerHTML = renderCatImpact();
  card.appendChild(catImpact);

  card.appendChild(selectInput({
    label: 'mMRC Dyspnoea Scale',
    section: 'symptomAssessment', field: 'mmrcDyspnoea',
    options: [
      { value: '0', label: '0 - Breathless with strenuous exercise only' },
      { value: '1', label: '1 - Short of breath when hurrying or walking up a slight hill' },
      { value: '2', label: '2 - Walks slower than people of same age or stops for breath' },
      { value: '3', label: '3 - Stops for breath after about 100 yards or a few minutes' },
      { value: '4', label: '4 - Too breathless to leave the house or breathless when dressing' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Cough frequency',
    section: 'symptomAssessment', field: 'coughFrequency',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional' },
      { value: 'daily', label: 'Daily' },
      { value: 'persistent', label: 'Persistent throughout the day' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Sputum production',
    section: 'symptomAssessment', field: 'sputumProduction',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional' },
      { value: 'daily', label: 'Daily' },
      { value: 'copious', label: 'Copious / large amounts' }
    ]
  }));

  return card;
}

/** Inner HTML for the CAT impact band readout. */
function renderCatImpact() {
  const score = state.symptomAssessment.catScore;
  if (score == null) return '';
  return `<span class="hint">${esc(catImpactLabel(score))}</span>`;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Exacerbation History',
    description: 'History of COPD exacerbations in the past 12 months.'
  });

  card.appendChild(textInput({
    label: 'Number of exacerbations per year',
    section: 'exacerbationHistory', field: 'exacerbationsPerYear',
    type: 'number', min: 0, max: 50
  }));
  card.appendChild(textInput({
    label: 'Number of hospitalisations for exacerbation per year',
    section: 'exacerbationHistory', field: 'hospitalizationsPerYear',
    type: 'number', min: 0, max: 20
  }));
  card.appendChild(textInput({
    label: 'Number of ICU admissions',
    section: 'exacerbationHistory', field: 'icuAdmissions',
    type: 'number', min: 0, max: 20
  }));
  card.appendChild(radioGroup({
    label: 'Have you ever been intubated (placed on a ventilator) for a breathing crisis?',
    section: 'exacerbationHistory', field: 'intubationHistory',
    options: yesNo
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Current Medications',
    description: 'Inhalers, oral medications, and respiratory therapies.'
  });

  card.appendChild(radioGroup({
    label: 'SABA (Short-acting bronchodilator, e.g. salbutamol)?',
    section: 'currentMedications', field: 'saba', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'LABA (Long-acting beta-agonist, e.g. salmeterol, formoterol)?',
    section: 'currentMedications', field: 'laba', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'LAMA (Long-acting muscarinic antagonist, e.g. tiotropium)?',
    section: 'currentMedications', field: 'lama', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'ICS (Inhaled corticosteroid, e.g. fluticasone, budesonide)?',
    section: 'currentMedications', field: 'ics', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Oral corticosteroids (e.g. prednisolone)?',
    section: 'currentMedications', field: 'oralCorticosteroids', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Nebulisers?',
    section: 'currentMedications', field: 'nebulizers', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Long-term oxygen therapy?',
    section: 'currentMedications', field: 'oxygenTherapy', options: yesNo
  }));
  const o2Details = document.createElement('div');
  o2Details.dataset.conditional = 'currentMedications.oxygenTherapy=yes';
  o2Details.appendChild(textInput({
    label: 'Oxygen flow rate',
    section: 'currentMedications', field: 'oxygenLitresPerMinute',
    type: 'number', min: 0, max: 15, step: 0.5, unit: 'L/min'
  }));
  card.appendChild(o2Details);

  const otherHeader = document.createElement('div');
  otherHeader.className = 'list-section-header';
  otherHeader.innerHTML = `
    <h3>Other Medications</h3>
    <p class="hint">Any other respiratory or related medications not listed above.</p>
  `;
  card.appendChild(otherHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'otherMedications',
    addLabel: 'Add other medication'
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Allergies',
    description: 'List any known drug or environmental allergies.'
  });
  card.appendChild(allergyListEditor());
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Comorbidities',
    description: 'Other medical conditions that may affect your pulmonary care.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have cardiovascular disease (heart disease, hypertension)?',
    section: 'comorbidities', field: 'cardiovascularDisease', options: yesNo
  }));
  const cvdDetails = document.createElement('div');
  cvdDetails.dataset.conditional = 'comorbidities.cardiovascularDisease=yes';
  cvdDetails.appendChild(textInput({
    label: 'Please provide details',
    section: 'comorbidities', field: 'cardiovascularDetails'
  }));
  card.appendChild(cvdDetails);

  card.appendChild(radioGroup({
    label: 'Do you have diabetes?',
    section: 'comorbidities', field: 'diabetes', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have osteoporosis?',
    section: 'comorbidities', field: 'osteoporosis', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have depression or anxiety?',
    section: 'comorbidities', field: 'depression', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Have you been diagnosed with lung cancer?',
    section: 'comorbidities', field: 'lungCancer', options: yesNo
  }));
  const cancerDetails = document.createElement('div');
  cancerDetails.dataset.conditional = 'comorbidities.lungCancer=yes';
  cancerDetails.appendChild(textInput({
    label: 'Please provide details (type, stage, treatment)',
    section: 'comorbidities', field: 'lungCancerDetails'
  }));
  card.appendChild(cancerDetails);

  card.appendChild(textArea({
    label: 'Any other significant medical conditions?',
    section: 'comorbidities', field: 'otherComorbidities',
    placeholder: 'List any other conditions...',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Smoking & Exposures',
    description: 'Smoking history and environmental / occupational exposures.'
  });

  card.appendChild(radioGroup({
    label: 'Smoking status',
    section: 'smokingExposures', field: 'smokingStatus',
    required: true,
    options: [
      { value: 'current', label: 'Current smoker' },
      { value: 'ex', label: 'Ex-smoker' },
      { value: 'never', label: 'Never smoked' }
    ]
  }));
  const packYears = document.createElement('div');
  packYears.dataset.conditionalAny = 'smokingExposures.smokingStatus=current,ex';
  packYears.appendChild(textInput({
    label: 'Pack-years',
    section: 'smokingExposures', field: 'packYears',
    type: 'number', min: 0, max: 200
  }));
  card.appendChild(packYears);

  card.appendChild(radioGroup({
    label: 'Have you had occupational exposures (dust, chemicals, fumes)?',
    section: 'smokingExposures', field: 'occupationalExposures', options: yesNo
  }));
  const occDetails = document.createElement('div');
  occDetails.dataset.conditional = 'smokingExposures.occupationalExposures=yes';
  occDetails.appendChild(textInput({
    label: 'Please describe the exposures',
    section: 'smokingExposures', field: 'occupationalDetails'
  }));
  card.appendChild(occDetails);

  card.appendChild(radioGroup({
    label: 'Have you had significant biomass fuel exposure (wood, coal, dung for cooking/heating)?',
    section: 'smokingExposures', field: 'biomassFuelExposure', options: yesNo
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Functional Status',
    description: 'Exercise capacity and daily living assessment.'
  });

  card.appendChild(selectInput({
    label: 'Exercise tolerance',
    section: 'functionalStatus', field: 'exerciseTolerance',
    options: [
      { value: 'unable', label: 'Unable to exercise' },
      { value: 'light-housework', label: 'Light housework only' },
      { value: 'climb-stairs', label: 'Can climb stairs' },
      { value: 'moderate-exercise', label: 'Moderate exercise' },
      { value: 'vigorous-exercise', label: 'Vigorous exercise' }
    ]
  }));

  card.appendChild(textInput({
    label: '6-Minute Walk Test distance',
    section: 'functionalStatus', field: 'sixMinuteWalkDistance',
    type: 'number', min: 0, max: 1000, unit: 'metres'
  }));

  const spo2Grid = document.createElement('div');
  spo2Grid.className = 'two-col';
  spo2Grid.appendChild(textInput({
    label: 'Resting SpO2',
    section: 'functionalStatus', field: 'oxygenSaturationRest',
    type: 'number', min: 50, max: 100, unit: '%'
  }));
  spo2Grid.appendChild(textInput({
    label: 'SpO2 on exertion',
    section: 'functionalStatus', field: 'oxygenSaturationExertion',
    type: 'number', min: 50, max: 100, unit: '%'
  }));
  card.appendChild(spo2Grid);

  card.appendChild(radioGroup({
    label: 'Do you have limitations in activities of daily living (ADLs)?',
    section: 'functionalStatus', field: 'adlLimitations', options: yesNo
  }));
  const adlDetails = document.createElement('div');
  adlDetails.dataset.conditional = 'functionalStatus.adlLimitations=yes';
  adlDetails.appendChild(textArea({
    label: 'Please describe your ADL limitations',
    section: 'functionalStatus', field: 'adlDetails',
    placeholder: 'e.g., difficulty dressing, bathing, cooking...',
    rows: 3
  }));
  card.appendChild(adlDetails);

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
  const ratio = document.getElementById('fev1-fvc-readout');
  if (ratio) ratio.innerHTML = renderFev1FvcReadout();

  const cat = document.getElementById('cat-impact-readout');
  if (cat) cat.innerHTML = renderCatImpact();
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics (6)
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'weight'],
  ['demographics', 'height'],
  // Chief complaint (3)
  ['chiefComplaint', 'primarySymptom'],
  ['chiefComplaint', 'symptomDuration'],
  ['chiefComplaint', 'dyspnoeaGradeMRC'],
  // Spirometry (5)
  ['spirometry', 'fev1'],
  ['spirometry', 'fvc'],
  ['spirometry', 'fev1PercentPredicted'],
  ['spirometry', 'bronchodilatorResponse'],
  // Symptom assessment (4)
  ['symptomAssessment', 'catScore'],
  ['symptomAssessment', 'mmrcDyspnoea'],
  ['symptomAssessment', 'coughFrequency'],
  ['symptomAssessment', 'sputumProduction'],
  // Exacerbation history (4)
  ['exacerbationHistory', 'exacerbationsPerYear'],
  ['exacerbationHistory', 'hospitalizationsPerYear'],
  ['exacerbationHistory', 'icuAdmissions'],
  ['exacerbationHistory', 'intubationHistory'],
  // Current medications (7)
  ['currentMedications', 'saba'],
  ['currentMedications', 'laba'],
  ['currentMedications', 'lama'],
  ['currentMedications', 'ics'],
  ['currentMedications', 'oralCorticosteroids'],
  ['currentMedications', 'nebulizers'],
  ['currentMedications', 'oxygenTherapy'],
  // Comorbidities (5)
  ['comorbidities', 'cardiovascularDisease'],
  ['comorbidities', 'diabetes'],
  ['comorbidities', 'osteoporosis'],
  ['comorbidities', 'depression'],
  ['comorbidities', 'lungCancer'],
  // Smoking & exposures (3)
  ['smokingExposures', 'smokingStatus'],
  ['smokingExposures', 'occupationalExposures'],
  ['smokingExposures', 'biomassFuelExposure'],
  // Functional status (5)
  ['functionalStatus', 'exerciseTolerance'],
  ['functionalStatus', 'sixMinuteWalkDistance'],
  ['functionalStatus', 'oxygenSaturationRest'],
  ['functionalStatus', 'oxygenSaturationExertion'],
  ['functionalStatus', 'adlLimitations']
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
  const progress = document.getElementById('progress');
  const text = document.getElementById('progress-text');
  if (progress) progress.value = percent;
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Step list
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics',         title: 'Demographics' },
  { step: 2,  section: 'chiefComplaint',       title: 'Complaint' },
  { step: 3,  section: 'spirometry',           title: 'Spirometry' },
  { step: 4,  section: 'symptomAssessment',    title: 'Symptoms' },
  { step: 5,  section: 'exacerbationHistory',  title: 'Exacerbations' },
  { step: 6,  section: 'currentMedications',   title: 'Medications' },
  { step: 7,  section: 'allergies',            title: 'Allergies' },
  { step: 8,  section: 'comorbidities',        title: 'Comorbidities' },
  { step: 9,  section: 'smokingExposures',     title: 'Smoking' },
  { step: 10, section: 'functionalStatus',     title: 'Functional' }
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
  const required = form.querySelectorAll('input[data-required], select[data-required], textarea[data-required]');
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

  const { goldStage, abcdGroup, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td class="num">GOLD ${r.stage}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No GOLD rules fired (defaulting to GOLD I).</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">System</th>
            <th scope="col">Rule</th>
            <th scope="col">Stage</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Pulmonology Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>GOLD Stage</h3>
      <p class="stage-summary">
        <span class="stage-badge ${goldStageClass(goldStage)}">${esc(goldStageLabel(goldStage))}</span>
      </p>

      <h3>ABCD Group</h3>
      <p class="stage-summary">
        <span class="abcd-badge abcd-${esc(abcdGroup)}">${esc(abcdGroup)}</span>
        <span class="abcd-label">${esc(abcdGroupLabel(abcdGroup))}</span>
      </p>

      <h3>Fired rules</h3>
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
  recomputeDerived();
  const { goldStage, abcdGroup, firedRules } = calculateGold(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    goldStage,
    abcdGroup,
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
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the report.</p>';
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
