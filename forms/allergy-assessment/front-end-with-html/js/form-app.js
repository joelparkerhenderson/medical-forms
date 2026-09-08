import { calculateAllergySeverity } from './allergy-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { bmiCategory, calculateAllergyBurdenScore, calculateBMI, emptyAssessment, severityClass, severityLabel } from './types.js';

// Allergy Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure allergy severity engine and renders an inline report. State
// is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'allergy-assessment.front-end-form-with-html.v1';

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
  slug: 'allergy-assessment',
  hadDraftAtLoad,
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

function readOnlyReadout(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field readout';
  wrapper.innerHTML = `
    <label>${esc(opts.label)}</label>
    <div id="${opts.id}" class="readout-value">${opts.render()}</div>
  `;
  return wrapper;
}

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
// Repeating-list editors
// ----------------------------------------------------------------------

const severityOptionsHtml = (current) => `
  <option value=""${current === '' ? ' selected' : ''}>— Severity —</option>
  <option value="mild"${current === 'mild' ? ' selected' : ''}>Mild</option>
  <option value="moderate"${current === 'moderate' ? ' selected' : ''}>Moderate</option>
  <option value="severe"${current === 'severe' ? ' selected' : ''}>Severe</option>
  <option value="anaphylaxis"${current === 'anaphylaxis' ? ' selected' : ''}>Anaphylaxis</option>
`;

/**
 * Editor for an array of AllergyItem (allergen, reactionType, severity,
 * timing, alternativesTolerated). Used for both drug and food allergies.
 */
function allergyItemEditor(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state[opts.section][opts.field];
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = opts.emptyLabel || 'None added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row allergy-row';
      r.innerHTML = `
        <div class="list-grid allergy-grid">
          <label class="list-cell">
            <span>Allergen</span>
            <input type="text" class="text-input" data-key="allergen"
                   value="${esc(row.allergen)}" placeholder="${esc(opts.allergenPlaceholder || 'e.g. Penicillin')}">
          </label>
          <label class="list-cell">
            <span>Reaction type</span>
            <input type="text" class="text-input" data-key="reactionType"
                   value="${esc(row.reactionType)}" placeholder="e.g. Rash, swelling">
          </label>
          <label class="list-cell">
            <span>Severity</span>
            <select class="select" data-key="severity">
              ${severityOptionsHtml(row.severity || '')}
            </select>
          </label>
          <label class="list-cell">
            <span>Timing</span>
            <input type="text" class="text-input" data-key="timing"
                   value="${esc(row.timing)}" placeholder="e.g. Within 1 hour">
          </label>
          <label class="list-cell">
            <span>Alternatives tolerated</span>
            <input type="text" class="text-input" data-key="alternativesTolerated"
                   value="${esc(row.alternativesTolerated)}" placeholder="e.g. Cephalosporins OK">
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
    addBtn.textContent = `+ ${opts.addLabel}`;
    addBtn.addEventListener('click', () => {
      rows.push({
        allergen: '',
        reactionType: '',
        severity: '',
        timing: '',
        alternativesTolerated: ''
      });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

/** Editor for an array of {trigger, symptoms, treatmentRequired} episode rows. */
function episodeListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.anaphylaxisHistory.episodes;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No episodes added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row';
      r.innerHTML = `
        <div class="list-grid episode-grid">
          <label class="list-cell">
            <span>Trigger</span>
            <input type="text" class="text-input" data-key="trigger"
                   value="${esc(row.trigger)}" placeholder="e.g. Peanut">
          </label>
          <label class="list-cell">
            <span>Symptoms</span>
            <input type="text" class="text-input" data-key="symptoms"
                   value="${esc(row.symptoms)}" placeholder="e.g. Hives, throat swelling">
          </label>
          <label class="list-cell">
            <span>Treatment required</span>
            <input type="text" class="text-input" data-key="treatmentRequired"
                   value="${esc(row.treatmentRequired)}" placeholder="e.g. Adrenaline, ED visit">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove episode">&times;</button>
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
    addBtn.textContent = '+ Add episode';
    addBtn.addEventListener('click', () => {
      rows.push({ trigger: '', symptoms: '', treatmentRequired: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

/** Editor for an array of {testType, allergen, result} test result rows. */
function testResultEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.testingResults.testResults;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No test results added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row';
      r.innerHTML = `
        <div class="list-grid test-grid">
          <label class="list-cell">
            <span>Test type</span>
            <input type="text" class="text-input" data-key="testType"
                   value="${esc(row.testType)}" placeholder="e.g. Skin prick">
          </label>
          <label class="list-cell">
            <span>Allergen</span>
            <input type="text" class="text-input" data-key="allergen"
                   value="${esc(row.allergen)}" placeholder="e.g. Cat dander">
          </label>
          <label class="list-cell">
            <span>Result</span>
            <input type="text" class="text-input" data-key="result"
                   value="${esc(row.result)}" placeholder="e.g. 8mm wheal, positive">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove test result">&times;</button>
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
    addBtn.textContent = '+ Add test result';
    addBtn.addEventListener('click', () => {
      rows.push({ testType: '', allergen: '', result: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

/** Editor for an array of {name, dose, frequency} medication rows. */
function medicationListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.currentManagement.otherMedications;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'None added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row';
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name"
                   value="${esc(row.name)}" placeholder="e.g. Montelukast">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose"
                   value="${esc(row.dose)}" placeholder="e.g. 10mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency"
                   value="${esc(row.frequency)}" placeholder="e.g. once daily">
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
// Section renderers (10 total)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const severityLevelOptions = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' }
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

  const row2 = document.createElement('div');
  row2.className = 'two-col';
  row2.appendChild(textInput({
    label: 'Date of Birth',
    section: 'demographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  row2.appendChild(textInput({
    label: 'NHS Number',
    section: 'demographics', field: 'nhsNumber',
    placeholder: '000 000 0000'
  }));
  card.appendChild(row2);

  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'demographics', field: 'sex',
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
    type: 'number', min: 1, max: 400, step: 0.1, unit: 'kg', required: true
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'demographics', field: 'height',
    type: 'number', min: 50, max: 250, step: 0.1, unit: 'cm', required: true
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
    title: 'Allergy History',
    description: 'Age of onset, known allergens, and family history.'
  });

  card.appendChild(textInput({
    label: 'Age of allergy onset',
    section: 'allergyHistory', field: 'ageOfOnset',
    type: 'number', min: 0, max: 120, unit: 'years'
  }));

  card.appendChild(textArea({
    label: 'Known allergens (list all)',
    section: 'allergyHistory', field: 'knownAllergens',
    placeholder: 'e.g. Penicillin, peanuts, pollen, dust mites...',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Family history of atopy (asthma, eczema, hay fever)?',
    section: 'allergyHistory', field: 'familyHistoryOfAtopy',
    options: yesNo
  }));
  const atopyDetails = document.createElement('div');
  atopyDetails.dataset.conditional = 'allergyHistory.familyHistoryOfAtopy=yes';
  atopyDetails.appendChild(textArea({
    label: 'Atopy details',
    section: 'allergyHistory', field: 'familyAtopyDetails',
    placeholder: 'Which family members and conditions?',
    rows: 2
  }));
  card.appendChild(atopyDetails);

  card.appendChild(radioGroup({
    label: 'Family history of allergy?',
    section: 'allergyHistory', field: 'familyHistoryOfAllergy',
    options: yesNo
  }));
  const allergyDetails = document.createElement('div');
  allergyDetails.dataset.conditional = 'allergyHistory.familyHistoryOfAllergy=yes';
  allergyDetails.appendChild(textArea({
    label: 'Allergy details',
    section: 'allergyHistory', field: 'familyAllergyDetails',
    placeholder: 'Which family members and allergens?',
    rows: 2
  }));
  card.appendChild(allergyDetails);

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Drug Allergies',
    description: 'Specific drug allergies, reaction types, severity, and cross-reactivity.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have any drug allergies?',
    section: 'drugAllergies', field: 'hasDrugAllergies',
    options: yesNo
  }));

  const conditional = document.createElement('div');
  conditional.dataset.conditional = 'drugAllergies.hasDrugAllergies=yes';

  const header = document.createElement('div');
  header.className = 'list-section-header';
  header.innerHTML = '<h3>Drug allergy details</h3>';
  conditional.appendChild(header);

  conditional.appendChild(allergyItemEditor({
    section: 'drugAllergies',
    field: 'drugAllergies',
    addLabel: 'Add drug allergy',
    emptyLabel: 'No drug allergies added.',
    allergenPlaceholder: 'e.g. Penicillin'
  }));

  conditional.appendChild(textArea({
    label: 'Cross-reactivity concerns',
    section: 'drugAllergies', field: 'crossReactivityConcerns',
    placeholder: 'e.g. Penicillin/cephalosporin cross-reactivity, NSAID class effects...',
    rows: 2
  }));

  card.appendChild(conditional);
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Food Allergies',
    description: 'Specific food allergies, IgE type, and dietary restrictions.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have any food allergies?',
    section: 'foodAllergies', field: 'hasFoodAllergies',
    options: yesNo
  }));

  const conditional = document.createElement('div');
  conditional.dataset.conditional = 'foodAllergies.hasFoodAllergies=yes';

  const header = document.createElement('div');
  header.className = 'list-section-header';
  header.innerHTML = '<h3>Food allergy details</h3>';
  conditional.appendChild(header);

  conditional.appendChild(allergyItemEditor({
    section: 'foodAllergies',
    field: 'foodAllergies',
    addLabel: 'Add food allergy',
    emptyLabel: 'No food allergies added.',
    allergenPlaceholder: 'e.g. Peanut'
  }));

  conditional.appendChild(selectInput({
    label: 'IgE classification',
    section: 'foodAllergies', field: 'igeType',
    options: [
      { value: 'IgE-mediated', label: 'IgE-mediated' },
      { value: 'non-IgE-mediated', label: 'Non-IgE-mediated' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));

  conditional.appendChild(radioGroup({
    label: 'Oral allergy syndrome?',
    section: 'foodAllergies', field: 'oralAllergySyndrome',
    options: yesNo
  }));

  conditional.appendChild(textArea({
    label: 'Dietary restrictions',
    section: 'foodAllergies', field: 'dietaryRestrictions',
    placeholder: 'Any foods avoided due to allergies...',
    rows: 2
  }));

  card.appendChild(conditional);
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Environmental Allergies',
    description: 'Pollen, dust mites, mould, animal dander, latex, and insect stings.'
  });

  card.appendChild(radioGroup({
    label: 'Pollen allergy?',
    section: 'environmentalAllergies', field: 'pollenAllergy',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Dust mite allergy?',
    section: 'environmentalAllergies', field: 'dustMiteAllergy',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Mould allergy?',
    section: 'environmentalAllergies', field: 'mouldAllergy',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Animal dander allergy?',
    section: 'environmentalAllergies', field: 'animalDanderAllergy',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Latex allergy?',
    section: 'environmentalAllergies', field: 'latexAllergy',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Insect sting allergy?',
    section: 'environmentalAllergies', field: 'insectStingAllergy',
    options: yesNo
  }));

  const stingSeverity = document.createElement('div');
  stingSeverity.dataset.conditional = 'environmentalAllergies.insectStingAllergy=yes';
  stingSeverity.appendChild(selectInput({
    label: 'Insect sting reaction severity',
    section: 'environmentalAllergies', field: 'insectStingSeverity',
    required: true,
    options: [
      { value: 'mild', label: 'Mild (local reaction)' },
      { value: 'moderate', label: 'Moderate (large local or mild systemic)' },
      { value: 'severe', label: 'Severe (systemic reaction)' },
      { value: 'anaphylaxis', label: 'Anaphylaxis' }
    ]
  }));
  card.appendChild(stingSeverity);

  card.appendChild(selectInput({
    label: 'Seasonal pattern',
    section: 'environmentalAllergies', field: 'seasonalPattern',
    options: [
      { value: 'perennial', label: 'Perennial (year-round)' },
      { value: 'spring', label: 'Spring' },
      { value: 'summer', label: 'Summer' },
      { value: 'autumn', label: 'Autumn' },
      { value: 'winter', label: 'Winter' },
      { value: 'multiple', label: 'Multiple seasons' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Other environmental allergens',
    section: 'environmentalAllergies', field: 'otherEnvironmentalAllergens',
    placeholder: 'Any other environmental triggers...',
    rows: 2
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Anaphylaxis History',
    description: 'Previous anaphylaxis episodes, triggers, and emergency preparedness.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have a history of anaphylaxis?',
    section: 'anaphylaxisHistory', field: 'hasAnaphylaxisHistory',
    options: yesNo
  }));

  const conditional = document.createElement('div');
  conditional.dataset.conditional = 'anaphylaxisHistory.hasAnaphylaxisHistory=yes';

  conditional.appendChild(textInput({
    label: 'Number of episodes',
    section: 'anaphylaxisHistory', field: 'numberOfEpisodes',
    type: 'number', min: 1, max: 100, required: true
  }));

  const epHeader = document.createElement('div');
  epHeader.className = 'list-section-header';
  epHeader.innerHTML = '<h3>Episode details</h3>';
  conditional.appendChild(epHeader);
  conditional.appendChild(episodeListEditor());

  conditional.appendChild(radioGroup({
    label: 'Has an adrenaline auto-injector been prescribed?',
    section: 'anaphylaxisHistory', field: 'adrenalineAutoInjectorPrescribed',
    options: yesNo
  }));
  conditional.appendChild(radioGroup({
    label: 'Is an action plan in place?',
    section: 'anaphylaxisHistory', field: 'actionPlanInPlace',
    options: yesNo
  }));

  card.appendChild(conditional);
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Testing Results',
    description: 'Skin prick tests, IgE levels, challenge tests, and patch tests.'
  });

  card.appendChild(radioGroup({
    label: 'Skin prick tests done?',
    section: 'testingResults', field: 'skinPrickTestsDone',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Specific IgE levels done?',
    section: 'testingResults', field: 'specificIgEDone',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Component-resolved diagnostics done?',
    section: 'testingResults', field: 'componentResolvedDiagnosticsDone',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Challenge tests done?',
    section: 'testingResults', field: 'challengeTestsDone',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Patch tests done?',
    section: 'testingResults', field: 'patchTestsDone',
    options: yesNo
  }));

  const trHeader = document.createElement('div');
  trHeader.className = 'list-section-header';
  trHeader.innerHTML = '<h3>Test results</h3>';
  card.appendChild(trHeader);
  card.appendChild(testResultEditor());

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Current Management',
    description: 'Medications, immunotherapy, biologics, and avoidance strategies.'
  });

  card.appendChild(radioGroup({
    label: 'Taking antihistamines?',
    section: 'currentManagement', field: 'antihistamines',
    options: yesNo
  }));
  const antihistDetails = document.createElement('div');
  antihistDetails.dataset.conditional = 'currentManagement.antihistamines=yes';
  antihistDetails.appendChild(textInput({
    label: 'Antihistamine details',
    section: 'currentManagement', field: 'antihistamineDetails',
    placeholder: 'e.g. Cetirizine 10mg daily'
  }));
  card.appendChild(antihistDetails);

  card.appendChild(radioGroup({
    label: 'Using nasal steroids?',
    section: 'currentManagement', field: 'nasalSteroids',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Carry adrenaline auto-injector?',
    section: 'currentManagement', field: 'adrenalineAutoInjector',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Receiving immunotherapy?',
    section: 'currentManagement', field: 'immunotherapy',
    options: yesNo
  }));
  const immunoDetails = document.createElement('div');
  immunoDetails.dataset.conditional = 'currentManagement.immunotherapy=yes';
  immunoDetails.appendChild(textInput({
    label: 'Immunotherapy details',
    section: 'currentManagement', field: 'immunotherapyDetails',
    placeholder: 'e.g. Grass pollen SCIT, started 2024'
  }));
  card.appendChild(immunoDetails);

  card.appendChild(radioGroup({
    label: 'On biologic therapy?',
    section: 'currentManagement', field: 'biologics',
    options: yesNo
  }));
  const bioDetails = document.createElement('div');
  bioDetails.dataset.conditional = 'currentManagement.biologics=yes';
  bioDetails.appendChild(textInput({
    label: 'Biologic details',
    section: 'currentManagement', field: 'biologicDetails',
    placeholder: 'e.g. Omalizumab 300mg monthly'
  }));
  card.appendChild(bioDetails);

  card.appendChild(textArea({
    label: 'Allergen avoidance strategies',
    section: 'currentManagement', field: 'allergenAvoidanceStrategies',
    placeholder: 'Describe any allergen avoidance measures in place...',
    rows: 2
  }));

  const medHeader = document.createElement('div');
  medHeader.className = 'list-section-header';
  medHeader.innerHTML = '<h3>Other medications</h3>';
  card.appendChild(medHeader);
  card.appendChild(medicationListEditor());

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Comorbidities',
    description: 'Associated conditions: asthma, eczema, rhinitis, and other relevant conditions.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have asthma?',
    section: 'comorbidities', field: 'asthma',
    options: yesNo
  }));
  const asthmaSeverity = document.createElement('div');
  asthmaSeverity.dataset.conditional = 'comorbidities.asthma=yes';
  asthmaSeverity.appendChild(selectInput({
    label: 'Asthma severity',
    section: 'comorbidities', field: 'asthmaSeverity',
    required: true,
    options: severityLevelOptions
  }));
  card.appendChild(asthmaSeverity);

  card.appendChild(radioGroup({
    label: 'Do you have eczema (atopic dermatitis)?',
    section: 'comorbidities', field: 'eczema',
    options: yesNo
  }));
  const eczemaSeverity = document.createElement('div');
  eczemaSeverity.dataset.conditional = 'comorbidities.eczema=yes';
  eczemaSeverity.appendChild(selectInput({
    label: 'Eczema severity',
    section: 'comorbidities', field: 'eczemaSeverity',
    required: true,
    options: severityLevelOptions
  }));
  card.appendChild(eczemaSeverity);

  card.appendChild(radioGroup({
    label: 'Do you have rhinitis (allergic or non-allergic)?',
    section: 'comorbidities', field: 'rhinitis',
    options: yesNo
  }));
  const rhinitisSeverity = document.createElement('div');
  rhinitisSeverity.dataset.conditional = 'comorbidities.rhinitis=yes';
  rhinitisSeverity.appendChild(selectInput({
    label: 'Rhinitis severity',
    section: 'comorbidities', field: 'rhinitisSeverity',
    required: true,
    options: severityLevelOptions
  }));
  card.appendChild(rhinitisSeverity);

  card.appendChild(radioGroup({
    label: 'Do you have eosinophilic oesophagitis?',
    section: 'comorbidities', field: 'eosinophilicOesophagitis',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do you have a mast cell disorder?',
    section: 'comorbidities', field: 'mastCellDisorders',
    options: yesNo
  }));
  const mastDetails = document.createElement('div');
  mastDetails.dataset.conditional = 'comorbidities.mastCellDisorders=yes';
  mastDetails.appendChild(textArea({
    label: 'Mast cell disorder details',
    section: 'comorbidities', field: 'mastCellDetails',
    placeholder: 'Diagnosis, treatment, triggers...',
    rows: 2
  }));
  card.appendChild(mastDetails);

  card.appendChild(radioGroup({
    label: 'Has your allergy affected your mental health?',
    section: 'comorbidities', field: 'mentalHealthImpact',
    options: yesNo
  }));
  const mhDetails = document.createElement('div');
  mhDetails.dataset.conditional = 'comorbidities.mentalHealthImpact=yes';
  mhDetails.appendChild(textArea({
    label: 'Mental health impact details',
    section: 'comorbidities', field: 'mentalHealthDetails',
    placeholder: 'Anxiety, avoidance behaviours, social impact...',
    rows: 2
  }));
  card.appendChild(mhDetails);

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Impact & Action Plan',
    description: 'Quality of life, school/work impact, emergency action plan, and follow-up.'
  });

  card.appendChild(textInput({
    label: 'Quality of life score (1 = very poor, 10 = excellent)',
    section: 'impactActionPlan', field: 'qualityOfLifeScore',
    type: 'number', min: 1, max: 10, step: 1
  }));

  card.appendChild(radioGroup({
    label: 'Does your allergy impact school or work?',
    section: 'impactActionPlan', field: 'schoolWorkImpact',
    options: yesNo
  }));
  const swDetails = document.createElement('div');
  swDetails.dataset.conditional = 'impactActionPlan.schoolWorkImpact=yes';
  swDetails.appendChild(textArea({
    label: 'School/work impact details',
    section: 'impactActionPlan', field: 'schoolWorkImpactDetails',
    placeholder: 'Missed days, activity limitations, accommodations needed...',
    rows: 2
  }));
  card.appendChild(swDetails);

  card.appendChild(selectInput({
    label: 'Emergency action plan status',
    section: 'impactActionPlan', field: 'emergencyActionPlanStatus',
    options: [
      { value: 'in-place', label: 'In place' },
      { value: 'not-in-place', label: 'Not in place' },
      { value: 'needs-update', label: 'Needs update' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Has training been provided on allergy management?',
    section: 'impactActionPlan', field: 'trainingProvided',
    options: yesNo
  }));
  const trDetails = document.createElement('div');
  trDetails.dataset.conditional = 'impactActionPlan.trainingProvided=yes';
  trDetails.appendChild(textInput({
    label: 'Training details',
    section: 'impactActionPlan', field: 'trainingDetails',
    placeholder: 'e.g. EpiPen training, first aid course'
  }));
  card.appendChild(trDetails);

  card.appendChild(textInput({
    label: 'Follow-up schedule',
    section: 'impactActionPlan', field: 'followUpSchedule',
    placeholder: 'e.g. Annual allergy review, 6-monthly IgE monitoring'
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
  // Allergy history
  ['allergyHistory', 'ageOfOnset'],
  ['allergyHistory', 'knownAllergens'],
  ['allergyHistory', 'familyHistoryOfAtopy'],
  ['allergyHistory', 'familyHistoryOfAllergy'],
  // Drug allergies
  ['drugAllergies', 'hasDrugAllergies'],
  // Food allergies
  ['foodAllergies', 'hasFoodAllergies'],
  // Environmental allergies
  ['environmentalAllergies', 'pollenAllergy'],
  ['environmentalAllergies', 'dustMiteAllergy'],
  ['environmentalAllergies', 'mouldAllergy'],
  ['environmentalAllergies', 'animalDanderAllergy'],
  ['environmentalAllergies', 'latexAllergy'],
  ['environmentalAllergies', 'insectStingAllergy'],
  ['environmentalAllergies', 'seasonalPattern'],
  // Anaphylaxis history
  ['anaphylaxisHistory', 'hasAnaphylaxisHistory'],
  // Testing results
  ['testingResults', 'skinPrickTestsDone'],
  ['testingResults', 'specificIgEDone'],
  ['testingResults', 'componentResolvedDiagnosticsDone'],
  ['testingResults', 'challengeTestsDone'],
  ['testingResults', 'patchTestsDone'],
  // Current management
  ['currentManagement', 'antihistamines'],
  ['currentManagement', 'nasalSteroids'],
  ['currentManagement', 'adrenalineAutoInjector'],
  ['currentManagement', 'immunotherapy'],
  ['currentManagement', 'biologics'],
  // Comorbidities
  ['comorbidities', 'asthma'],
  ['comorbidities', 'eczema'],
  ['comorbidities', 'rhinitis'],
  ['comorbidities', 'eosinophilicOesophagitis'],
  ['comorbidities', 'mastCellDisorders'],
  ['comorbidities', 'mentalHealthImpact'],
  // Impact & action plan
  ['impactActionPlan', 'qualityOfLifeScore'],
  ['impactActionPlan', 'schoolWorkImpact'],
  ['impactActionPlan', 'emergencyActionPlanStatus'],
  ['impactActionPlan', 'trainingProvided'],
  ['impactActionPlan', 'followUpSchedule']
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
  { step: 2, section: 'allergyHistory', title: 'Allergy History' },
  { step: 3, section: 'drugAllergies', title: 'Drug Allergies' },
  { step: 4, section: 'foodAllergies', title: 'Food Allergies' },
  { step: 5, section: 'environmentalAllergies', title: 'Environmental Allergies' },
  { step: 6, section: 'anaphylaxisHistory', title: 'Anaphylaxis History' },
  { step: 7, section: 'testingResults', title: 'Testing Results' },
  { step: 8, section: 'currentManagement', title: 'Current Management' },
  { step: 9, section: 'comorbidities', title: 'Comorbidities' },
  { step: 10, section: 'impactActionPlan', title: 'Impact & Action Plan' }
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

  const { severityLevel, allergyBurdenScore, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td class="severity-cell ${esc(severityClass(r.severityLevel))}">${esc(r.severityLevel)}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No severity rules fired — only mild localised reactions or no allergic conditions reported.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Description</th>
            <th scope="col">Severity</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Allergy Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Overall Severity</h3>
      <p class="severity-summary">
        <span class="severity-badge ${esc(severityClass(severityLevel))}">${esc(severityLevel || 'mild')}</span>
        <span class="burden-score">Allergy burden score: ${allergyBurdenScore}</span>
      </p>
      <p class="muted">${esc(severityLabel(severityLevel))}</p>

      <h3>Fired severity rules</h3>
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
  const { severityLevel, firedRules } = calculateAllergySeverity(state);
  const allergyBurdenScore = calculateAllergyBurdenScore(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    severityLevel,
    allergyBurdenScore,
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
