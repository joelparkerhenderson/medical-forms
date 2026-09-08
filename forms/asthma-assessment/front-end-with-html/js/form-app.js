import { calculateACT, classifyACTScore, controlLevelClass, controlLevelLabel } from './act-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { bmiCategory, calculateBMI, calculatePeakFlowPercent, emptyAssessment, fev1Severity } from './types.js';

// Asthma Assessment — patient wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress bar + step list reflects how many fields have been answered.
// Submission runs the pure ACT grader and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'asthma-assessment.front-end-form-with-html.v1';
const TOTAL_STEPS = 9;

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
    const v = parsed && parsed[key];
    if (Array.isArray(fresh[key])) {
      fresh[key] = Array.isArray(v) ? v : [];
    } else if (v && typeof v === 'object') {
      fresh[key] = { ...fresh[key], ...v };
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

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
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

let state = loadState();
/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'asthma-assessment',
  hadDraftAtLoad,
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
  state.lungFunction.peakFlowPercent = calculatePeakFlowPercent(
    state.lungFunction.peakFlowCurrent,
    state.lungFunction.peakFlowBest
  );
}

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
    if (type === 'number') v = v === '' ? null : Number(v);
    setField(opts.section, opts.field, v);
    clearFieldError(id);
  });
  return wrapper;
}

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

function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
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

function readOnlyReadout(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field readout';
  wrapper.innerHTML = `
    <label class="label">${esc(opts.label)}</label>
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
  legend.innerHTML = `
    <span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>
    <h2 class="section-title">${esc(opts.title)}</h2>
    ${desc}
  `;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Common option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

// ----------------------------------------------------------------------
// Repeating-list editors (medications, allergies, environmental allergies)
// ----------------------------------------------------------------------

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
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Salbutamol">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 100 mcg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. PRN, BD">
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
        const evt = inp.tagName === 'SELECT' ? 'change' : 'input';
        inp.addEventListener(evt, () => {
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

/** Simple list of free-text environmental-allergy strings. */
function environmentalAllergyEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.allergies.environmentalAllergies;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No environmental allergies added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((value, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row env-row';
      r.innerHTML = `
        <input type="text" class="text-input"
               value="${esc(value)}"
               placeholder="e.g. dust mites, pollen, mold, pet dander">
        <button type="button" class="button" data-variant="icon" aria-label="Remove environmental allergy">&times;</button>
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
    addBtn.textContent = '+ Add environmental allergy';
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

// ----------------------------------------------------------------------
// Section renderers (1 per step)
// ----------------------------------------------------------------------

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
    title: 'Symptom Frequency',
    description: 'Asthma Control Test (ACT) — please think about the past 4 weeks.'
  });

  card.appendChild(radioGroup({
    label: '1. How much of the time did your asthma keep you from getting as much done at work, school, or at home?',
    section: 'symptomFrequency',
    field: 'activityLimitation',
    options: [
      { value: 'extremely', label: 'All of the time' },
      { value: 'a-lot', label: 'Most of the time' },
      { value: 'somewhat', label: 'Some of the time' },
      { value: 'a-little', label: 'A little of the time' },
      { value: 'not-at-all', label: 'None of the time' }
    ]
  }));

  card.appendChild(radioGroup({
    label: '2. How often have you had shortness of breath?',
    section: 'symptomFrequency',
    field: 'daytimeSymptoms',
    options: [
      { value: 'more-than-once-a-day', label: 'More than once a day' },
      { value: 'once-a-day', label: 'Once a day' },
      { value: 'three-to-six', label: '3 to 6 times a week' },
      { value: 'once-or-twice', label: 'Once or twice a week' },
      { value: 'not-at-all', label: 'Not at all' }
    ]
  }));

  card.appendChild(radioGroup({
    label: '3. How often did your asthma symptoms wake you up at night or earlier than usual in the morning?',
    section: 'symptomFrequency',
    field: 'nighttimeAwakening',
    options: [
      { value: 'four-or-more-nights', label: '4 or more nights a week' },
      { value: 'two-to-three-nights', label: '2 to 3 nights a week' },
      { value: 'once-a-week', label: 'Once a week' },
      { value: 'once-or-twice', label: 'Once or twice' },
      { value: 'not-at-all', label: 'Not at all' }
    ]
  }));

  card.appendChild(radioGroup({
    label: '4. How often have you used your rescue inhaler or nebuliser medication?',
    section: 'symptomFrequency',
    field: 'rescueInhalerUse',
    options: [
      { value: 'two-or-more-times-a-day', label: '3 or more times a day' },
      { value: 'once-a-day', label: '1 or 2 times a day' },
      { value: 'three-to-six', label: '2 or 3 times a week' },
      { value: 'once-or-twice', label: 'Once a week or less' },
      { value: 'not-at-all', label: 'Not at all' }
    ]
  }));

  card.appendChild(radioGroup({
    label: '5. How would you rate your asthma control during the past 4 weeks?',
    section: 'symptomFrequency',
    field: 'selfRatedControl',
    options: [
      { value: 'not-controlled-at-all', label: 'Not controlled at all' },
      { value: 'poorly-controlled', label: 'Poorly controlled' },
      { value: 'somewhat-controlled', label: 'Somewhat controlled' },
      { value: 'well-controlled', label: 'Well controlled' },
      { value: 'completely-controlled', label: 'Completely controlled' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Lung Function',
    description: 'Spirometry and peak flow measurements (leave blank if unknown).'
  });

  card.appendChild(textInput({
    label: 'FEV1 (% predicted)',
    section: 'lungFunction', field: 'fev1Percent',
    type: 'number', min: 0, max: 150, unit: '%'
  }));

  card.appendChild(textInput({
    label: 'FEV1 / FVC Ratio',
    section: 'lungFunction', field: 'fev1Fvc',
    type: 'number', min: 0, max: 1, step: 0.01
  }));

  const flowGrid = document.createElement('div');
  flowGrid.className = 'three-col';
  flowGrid.appendChild(textInput({
    label: 'Peak flow — personal best',
    section: 'lungFunction', field: 'peakFlowBest',
    type: 'number', min: 0, max: 900, unit: 'L/min'
  }));
  flowGrid.appendChild(textInput({
    label: 'Peak flow — current',
    section: 'lungFunction', field: 'peakFlowCurrent',
    type: 'number', min: 0, max: 900, unit: 'L/min'
  }));
  flowGrid.appendChild(readOnlyReadout({
    label: 'Peak flow %',
    id: 'peak-flow-readout',
    render: () => {
      const pct = state.lungFunction.peakFlowPercent;
      if (pct == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${pct}%</strong> <span class="muted">of personal best</span>`;
    }
  }));
  card.appendChild(flowGrid);

  card.appendChild(textInput({
    label: 'Last spirometry date',
    section: 'lungFunction', field: 'spirometryDate',
    type: 'date'
  }));
  card.appendChild(textArea({
    label: 'Spirometry notes',
    section: 'lungFunction', field: 'spirometryNotes',
    placeholder: 'Any additional notes about spirometry results…',
    rows: 3
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Triggers',
    description: 'What triggers or worsens your asthma symptoms?'
  });

  card.appendChild(radioGroup({
    label: 'Do allergens trigger your asthma? (dust mites, pollen, mold, pet dander)',
    section: 'triggers', field: 'allergens', options: yesNo
  }));
  const allergenDetails = document.createElement('div');
  allergenDetails.dataset.conditional = 'triggers.allergens=yes';
  allergenDetails.appendChild(textInput({
    label: 'Which allergens?',
    section: 'triggers', field: 'allergenDetails'
  }));
  card.appendChild(allergenDetails);

  card.appendChild(radioGroup({
    label: 'Does exercise trigger your asthma?',
    section: 'triggers', field: 'exercise', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Does weather or temperature change trigger your asthma?',
    section: 'triggers', field: 'weather', options: yesNo
  }));
  const weatherDetails = document.createElement('div');
  weatherDetails.dataset.conditional = 'triggers.weather=yes';
  weatherDetails.appendChild(textInput({
    label: 'Details (cold air, humidity, etc.)',
    section: 'triggers', field: 'weatherDetails'
  }));
  card.appendChild(weatherDetails);

  card.appendChild(radioGroup({
    label: 'Do you have occupational triggers?',
    section: 'triggers', field: 'occupational', options: yesNo
  }));
  const occDetails = document.createElement('div');
  occDetails.dataset.conditional = 'triggers.occupational=yes';
  occDetails.appendChild(textInput({
    label: 'What are the occupational triggers?',
    section: 'triggers', field: 'occupationalDetails'
  }));
  card.appendChild(occDetails);

  card.appendChild(radioGroup({
    label: 'Do respiratory infections worsen your asthma?',
    section: 'triggers', field: 'infections', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Does smoke exposure trigger your asthma?',
    section: 'triggers', field: 'smoke', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Does stress or strong emotion trigger your asthma?',
    section: 'triggers', field: 'stress', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do any medications trigger your asthma? (e.g. aspirin, beta-blockers)',
    section: 'triggers', field: 'medications', options: yesNo
  }));
  const medDetails = document.createElement('div');
  medDetails.dataset.conditional = 'triggers.medications=yes';
  medDetails.appendChild(textInput({
    label: 'Which medications?',
    section: 'triggers', field: 'medicationDetails'
  }));
  card.appendChild(medDetails);

  card.appendChild(textArea({
    label: 'Other triggers',
    section: 'triggers', field: 'otherTriggers',
    placeholder: 'Any other triggers not listed above…',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Current Medications',
    description: 'List all asthma-related medications you currently take.'
  });

  const ctrlHeader = document.createElement('div');
  ctrlHeader.className = 'list-section-header';
  ctrlHeader.innerHTML = `
    <h3>Controller medications (preventers)</h3>
    <p class="hint">e.g. inhaled corticosteroids (ICS), ICS/LABA combinations, leukotriene receptor antagonists.</p>
  `;
  card.appendChild(ctrlHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'controllerMedications',
    addLabel: 'Add controller medication'
  }));

  const rescueHeader = document.createElement('div');
  rescueHeader.className = 'list-section-header';
  rescueHeader.innerHTML = `
    <h3>Rescue inhalers (relievers)</h3>
    <p class="hint">e.g. salbutamol, terbutaline.</p>
  `;
  card.appendChild(rescueHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'rescueInhalers',
    addLabel: 'Add rescue inhaler'
  }));

  const bioHeader = document.createElement('div');
  bioHeader.className = 'list-section-header';
  bioHeader.innerHTML = `
    <h3>Biologic therapies</h3>
    <p class="hint">e.g. omalizumab, mepolizumab, dupilumab, benralizumab, tezepelumab.</p>
  `;
  card.appendChild(bioHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'biologics',
    addLabel: 'Add biologic therapy'
  }));

  card.appendChild(radioGroup({
    label: 'Are you currently taking oral corticosteroids?',
    section: 'currentMedications', field: 'oralSteroids', options: yesNo
  }));
  const steroidDetails = document.createElement('div');
  steroidDetails.dataset.conditional = 'currentMedications.oralSteroids=yes';
  steroidDetails.appendChild(textInput({
    label: 'Details (name, dose, duration)',
    section: 'currentMedications', field: 'oralSteroidDetails'
  }));
  card.appendChild(steroidDetails);

  card.appendChild(radioGroup({
    label: 'Has your inhaler technique been reviewed recently?',
    section: 'currentMedications', field: 'inhalerTechniqueReviewed', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'How would you rate your medication adherence?',
    section: 'currentMedications', field: 'medicationAdherence',
    options: [
      { value: 'good', label: 'Good — I take my medications as prescribed' },
      { value: 'partial', label: 'Partial — I sometimes miss doses' },
      { value: 'poor', label: 'Poor — I often miss doses or do not take regularly' }
    ]
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Allergies',
    description: 'Document drug allergies and environmental sensitivities.'
  });

  const drugHeader = document.createElement('div');
  drugHeader.className = 'list-section-header';
  drugHeader.innerHTML = '<h3>Drug allergies</h3>';
  card.appendChild(drugHeader);
  card.appendChild(drugAllergyEditor());

  const envHeader = document.createElement('div');
  envHeader.className = 'list-section-header';
  envHeader.innerHTML = '<h3>Environmental allergies</h3>';
  card.appendChild(envHeader);
  card.appendChild(environmentalAllergyEditor());

  card.appendChild(radioGroup({
    label: 'Has allergy testing been done?',
    section: 'allergies', field: 'allergyTestingDone', options: yesNo
  }));
  const resultsDetails = document.createElement('div');
  resultsDetails.dataset.conditional = 'allergies.allergyTestingDone=yes';
  resultsDetails.appendChild(textArea({
    label: 'Allergy test results',
    section: 'allergies', field: 'allergyTestResults',
    placeholder: 'Describe test results…',
    rows: 3
  }));
  card.appendChild(resultsDetails);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Exacerbation History',
    description: 'Asthma flare-ups and emergency care in the past 12 months.'
  });

  card.appendChild(textInput({
    label: 'Number of exacerbations in the last 12 months',
    section: 'exacerbationHistory', field: 'exacerbationsLastYear',
    type: 'number', min: 0, max: 100
  }));
  card.appendChild(textInput({
    label: 'Number of ED (emergency department) visits for asthma in the last 12 months',
    section: 'exacerbationHistory', field: 'edVisitsLastYear',
    type: 'number', min: 0, max: 100
  }));
  card.appendChild(textInput({
    label: 'Number of hospitalisations for asthma in the last 12 months',
    section: 'exacerbationHistory', field: 'hospitalisationsLastYear',
    type: 'number', min: 0, max: 100
  }));

  card.appendChild(radioGroup({
    label: 'Have you ever been admitted to ICU for asthma?',
    section: 'exacerbationHistory', field: 'icuAdmissions', options: yesNo
  }));
  const icuDetails = document.createElement('div');
  icuDetails.dataset.conditional = 'exacerbationHistory.icuAdmissions=yes';
  icuDetails.appendChild(textInput({
    label: 'How many times?',
    section: 'exacerbationHistory', field: 'icuAdmissionCount',
    type: 'number', min: 1, max: 100
  }));
  card.appendChild(icuDetails);

  card.appendChild(radioGroup({
    label: 'Have you ever been intubated (put on a ventilator) for asthma?',
    section: 'exacerbationHistory', field: 'intubationHistory', options: yesNo
  }));

  card.appendChild(textInput({
    label: 'Number of oral steroid (prednisolone) courses in the last 12 months',
    section: 'exacerbationHistory', field: 'oralSteroidCoursesLastYear',
    type: 'number', min: 0, max: 100
  }));
  card.appendChild(textInput({
    label: 'Date of last exacerbation',
    section: 'exacerbationHistory', field: 'lastExacerbationDate',
    type: 'date'
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Comorbidities',
    description: 'Other conditions that may affect your asthma.'
  });

  card.appendChild(radioGroup({ label: 'Do you have allergic rhinitis (hay fever)?', section: 'comorbidities', field: 'allergicRhinitis', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have sinusitis?', section: 'comorbidities', field: 'sinusitis', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have nasal polyps?', section: 'comorbidities', field: 'nasalPolyps', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have GORD (gastro-oesophageal reflux disease)?', section: 'comorbidities', field: 'gord', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have obesity?', section: 'comorbidities', field: 'obesity', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have anxiety?', section: 'comorbidities', field: 'anxiety', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have depression?', section: 'comorbidities', field: 'depression', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have eczema (atopic dermatitis)?', section: 'comorbidities', field: 'eczema', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have sleep apnoea?', section: 'comorbidities', field: 'sleepApnoea', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have vocal cord dysfunction?', section: 'comorbidities', field: 'vocalCordDysfunction', options: yesNo }));

  card.appendChild(textArea({
    label: 'Other comorbidities',
    section: 'comorbidities', field: 'otherComorbidities',
    placeholder: 'List any other medical conditions…',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Social History',
    description: 'Lifestyle and environmental factors affecting your asthma.'
  });

  card.appendChild(radioGroup({
    label: 'Do you smoke?',
    section: 'socialHistory', field: 'smoking',
    options: [
      { value: 'current', label: 'Current smoker' },
      { value: 'ex', label: 'Ex-smoker' },
      { value: 'never', label: 'Never smoked' }
    ]
  }));
  const packDetails = document.createElement('div');
  packDetails.dataset.conditionalAny = 'socialHistory.smoking=current,ex';
  packDetails.appendChild(textInput({
    label: 'Pack-years',
    section: 'socialHistory', field: 'smokingPackYears',
    type: 'number', min: 0, max: 200
  }));
  card.appendChild(packDetails);

  card.appendChild(radioGroup({
    label: 'Do you vape?',
    section: 'socialHistory', field: 'vaping',
    options: [
      { value: 'current', label: 'Current vaper' },
      { value: 'ex', label: 'Ex-vaper' },
      { value: 'never', label: 'Never vaped' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Do you have occupational exposures (chemicals, fumes, dust)?',
    section: 'socialHistory', field: 'occupationalExposures', options: yesNo
  }));
  const occExpDetails = document.createElement('div');
  occExpDetails.dataset.conditional = 'socialHistory.occupationalExposures=yes';
  occExpDetails.appendChild(textInput({
    label: 'Details of occupational exposures',
    section: 'socialHistory', field: 'occupationalExposureDetails'
  }));
  card.appendChild(occExpDetails);

  card.appendChild(textArea({
    label: 'Home environment',
    section: 'socialHistory', field: 'homeEnvironment',
    placeholder: 'Describe your home (e.g. type of housing, ventilation, heating system)…',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Do you have pets?',
    section: 'socialHistory', field: 'pets', options: yesNo
  }));
  const petDetailsHost = document.createElement('div');
  petDetailsHost.dataset.conditional = 'socialHistory.pets=yes';
  petDetailsHost.appendChild(textInput({
    label: 'What type of pets?',
    section: 'socialHistory', field: 'petDetails'
  }));
  card.appendChild(petDetailsHost);

  card.appendChild(radioGroup({
    label: 'Do you have carpet in your bedroom?',
    section: 'socialHistory', field: 'carpetInBedroom', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Is there mold in your home?',
    section: 'socialHistory', field: 'moldExposure', options: yesNo
  }));

  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
  renderStep6, renderStep7, renderStep8, renderStep9
];

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
  const pf = document.getElementById('peak-flow-readout');
  if (pf) {
    const v = state.lungFunction.peakFlowPercent;
    pf.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}%</strong> <span class="muted">of personal best</span>`;
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
  // Symptom frequency / ACT (5 questions)
  ['symptomFrequency', 'activityLimitation'],
  ['symptomFrequency', 'daytimeSymptoms'],
  ['symptomFrequency', 'nighttimeAwakening'],
  ['symptomFrequency', 'rescueInhalerUse'],
  ['symptomFrequency', 'selfRatedControl'],
  // Lung function (optional but tracked for visibility)
  ['lungFunction', 'fev1Percent'],
  ['lungFunction', 'peakFlowBest'],
  ['lungFunction', 'peakFlowCurrent'],
  // Triggers — top-level yes/no items
  ['triggers', 'allergens'],
  ['triggers', 'exercise'],
  ['triggers', 'weather'],
  ['triggers', 'occupational'],
  ['triggers', 'infections'],
  ['triggers', 'smoke'],
  ['triggers', 'stress'],
  ['triggers', 'medications'],
  // Current medications meta
  ['currentMedications', 'oralSteroids'],
  ['currentMedications', 'inhalerTechniqueReviewed'],
  ['currentMedications', 'medicationAdherence'],
  // Allergies meta
  ['allergies', 'allergyTestingDone'],
  // Exacerbation history (5 numerics + 2 yes/no)
  ['exacerbationHistory', 'exacerbationsLastYear'],
  ['exacerbationHistory', 'edVisitsLastYear'],
  ['exacerbationHistory', 'hospitalisationsLastYear'],
  ['exacerbationHistory', 'icuAdmissions'],
  ['exacerbationHistory', 'intubationHistory'],
  ['exacerbationHistory', 'oralSteroidCoursesLastYear'],
  // Comorbidities (10 yes/no)
  ['comorbidities', 'allergicRhinitis'],
  ['comorbidities', 'sinusitis'],
  ['comorbidities', 'nasalPolyps'],
  ['comorbidities', 'gord'],
  ['comorbidities', 'obesity'],
  ['comorbidities', 'anxiety'],
  ['comorbidities', 'depression'],
  ['comorbidities', 'eczema'],
  ['comorbidities', 'sleepApnoea'],
  ['comorbidities', 'vocalCordDysfunction'],
  // Social history (core)
  ['socialHistory', 'smoking'],
  ['socialHistory', 'vaping'],
  ['socialHistory', 'occupationalExposures'],
  ['socialHistory', 'pets'],
  ['socialHistory', 'carpetInBedroom'],
  ['socialHistory', 'moldExposure']
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
  { step: 1, section: 'demographics',         title: 'Demographics' },
  { step: 2, section: 'symptomFrequency',     title: 'Symptom Frequency' },
  { step: 3, section: 'lungFunction',         title: 'Lung Function' },
  { step: 4, section: 'triggers',             title: 'Triggers' },
  { step: 5, section: 'currentMedications',   title: 'Medications' },
  { step: 6, section: 'allergies',            title: 'Allergies' },
  { step: 7, section: 'exacerbationHistory',  title: 'Exacerbations' },
  { step: 8, section: 'comorbidities',        title: 'Comorbidities' },
  { step: 9, section: 'socialHistory',        title: 'Social History' }
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

  const { actScore, controlLevel, answeredCount, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td class="num">${r.score} / 5</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No ACT questions answered.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Question</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <h2>Asthma Assessment Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>ACT Total Score</h3>
    <p class="act-summary">
      <span class="act-score-badge ${controlLevelClass(controlLevel)}">${actScore} / 25</span>
      <span class="control-level">${esc(controlLevelLabel(controlLevel))}</span>
    </p>
    <p class="muted">Based on ${answeredCount} of 5 ACT questions answered.</p>

    <h3>Per-question scores</h3>
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
  recomputeDerived();
  const { actScore, controlLevel, answeredCount, firedRules } = calculateACT(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    actScore,
    controlLevel,
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
  for (const r of STEP_RENDERERS) host.appendChild(r());
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
