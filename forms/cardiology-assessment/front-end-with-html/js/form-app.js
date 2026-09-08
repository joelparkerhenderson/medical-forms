import { detectAdditionalFlags } from './flags.js';
import { calculateCardioGrade } from './grader.js';
import { bmiCategory, calculateAge, calculateBMI, ccsClassLabel, emptyAssessment, estimateMETs, nyhaClassLabel, riskLevelClass, riskLevelLabel } from './types.js';

// Cardiology Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure cardiology scoring engine (CCS class, NYHA class, overall
// risk, flagged issues) and renders an inline report. State is persisted to
// localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'cardiology-assessment.front-end-form-with-html.v1';

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
  slug: 'cardiology-assessment',
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
 * Re-runs derived values (BMI, METs), progress, and conditional visibility
 * after each change.
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
  state.socialFunctional.estimatedMETs = estimateMETs(
    state.socialFunctional.exerciseTolerance
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

function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const labelText = esc(opts.label);
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
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
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

function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const labelText = esc(opts.label);

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${opts.required ? ' required data-required' : ''}>
      ${optionsHtml}
    </select>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => { setField(opts.section, opts.field, sel.value); clearFieldError(id); });
  return wrapper;
}

function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field radio-fieldset';
  wrapper.id = `${groupId}-fieldset`;
  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  if (opts.required) legend.setAttribute('data-required', '');
  wrapper.appendChild(legend);
  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', `${groupId}-fieldset`);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
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
  const err = document.createElement('span');
  err.className = 'error-message';
  err.id = `${groupId}-error`;
  err.setAttribute('aria-live', 'polite');
  wrapper.appendChild(err);
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
  legend.innerHTML =
    `<span class="section-step">Step ${opts.stepNumber} of 10</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Repeating-list editor (drug allergies)
// ----------------------------------------------------------------------

/** Editor for an array of {allergen, reaction, severity} drug-allergy rows. */
function drugAllergyEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.allergies.allergies;
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
// Section renderers (1 per cardiology step)
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
    title: 'Chest Pain / Angina',
    description: 'Character, location, radiation, and classification of chest pain.'
  });

  card.appendChild(radioGroup({
    label: 'Do you experience chest pain?',
    section: 'chestPainAngina', field: 'chestPain', options: yesNo
  }));

  // Conditional sub-section visible only when chestPain === 'yes'
  const cpDetails = document.createElement('div');
  cpDetails.dataset.conditional = 'chestPainAngina.chestPain=yes';

  cpDetails.appendChild(selectInput({
    label: 'Pain character',
    section: 'chestPainAngina', field: 'painCharacter',
    options: [
      { value: 'crushing', label: 'Crushing / Heavy' },
      { value: 'pressure', label: 'Pressure / Tightness' },
      { value: 'sharp', label: 'Sharp / Stabbing' },
      { value: 'burning', label: 'Burning' },
      { value: 'other', label: 'Other' }
    ]
  }));
  cpDetails.appendChild(textInput({
    label: 'Pain location',
    section: 'chestPainAngina', field: 'painLocation',
    placeholder: 'e.g. Central chest, left-sided'
  }));
  cpDetails.appendChild(selectInput({
    label: 'Pain radiation',
    section: 'chestPainAngina', field: 'painRadiation',
    options: [
      { value: 'left-arm', label: 'Left arm' },
      { value: 'jaw', label: 'Jaw' },
      { value: 'back', label: 'Back' },
      { value: 'none', label: 'None' },
      { value: 'other', label: 'Other' }
    ]
  }));
  cpDetails.appendChild(selectInput({
    label: 'CCS Angina Class',
    section: 'chestPainAngina', field: 'ccsClass',
    required: true,
    options: [
      { value: '1', label: 'Class I - Angina only with strenuous exertion' },
      { value: '2', label: 'Class II - Slight limitation of ordinary activity' },
      { value: '3', label: 'Class III - Marked limitation of ordinary activity' },
      { value: '4', label: 'Class IV - Angina at rest' }
    ]
  }));
  cpDetails.appendChild(selectInput({
    label: 'Angina frequency',
    section: 'chestPainAngina', field: 'anginaFrequency',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'rarely', label: 'Rarely' }
    ]
  }));
  cpDetails.appendChild(selectInput({
    label: 'Angina duration',
    section: 'chestPainAngina', field: 'anginaDuration',
    options: [
      { value: 'less-5-min', label: 'Less than 5 minutes' },
      { value: '5-20-min', label: '5-20 minutes' },
      { value: 'greater-20-min', label: 'Greater than 20 minutes' }
    ]
  }));
  cpDetails.appendChild(radioGroup({
    label: 'Unstable angina (pain at rest or worsening pattern)?',
    section: 'chestPainAngina', field: 'unstableAngina', options: yesNo
  }));

  card.appendChild(cpDetails);
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Heart Failure Symptoms',
    description: 'Dyspnoea, orthopnoea, oedema, and NYHA classification.'
  });

  card.appendChild(radioGroup({
    label: 'Do you experience shortness of breath (dyspnoea)?',
    section: 'heartFailureSymptoms', field: 'dyspnoea', options: yesNo
  }));

  const dyspExert = document.createElement('div');
  dyspExert.dataset.conditional = 'heartFailureSymptoms.dyspnoea=yes';
  dyspExert.appendChild(radioGroup({
    label: 'Is the shortness of breath on exertion?',
    section: 'heartFailureSymptoms', field: 'dyspnoeaOnExertion', options: yesNo
  }));
  card.appendChild(dyspExert);

  card.appendChild(radioGroup({
    label: 'Do you need to sit upright to breathe comfortably (orthopnoea)?',
    section: 'heartFailureSymptoms', field: 'orthopnoea', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you wake at night gasping for breath (PND)?',
    section: 'heartFailureSymptoms', field: 'pnd', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have swelling of the ankles or legs (peripheral oedema)?',
    section: 'heartFailureSymptoms', field: 'peripheralOedema', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'NYHA Heart Failure Class',
    section: 'heartFailureSymptoms', field: 'nyhaClass',
    options: [
      { value: '1', label: 'Class I - No limitation of physical activity' },
      { value: '2', label: 'Class II - Slight limitation of physical activity' },
      { value: '3', label: 'Class III - Marked limitation of physical activity' },
      { value: '4', label: 'Class IV - Symptoms at rest' }
    ]
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Cardiac History',
    description: 'Previous MI, interventions, valvular and structural disease.'
  });

  card.appendChild(radioGroup({
    label: 'Have you had a previous heart attack (myocardial infarction)?',
    section: 'cardiacHistory', field: 'previousMI', options: yesNo
  }));
  const miHost = document.createElement('div');
  miHost.dataset.conditional = 'cardiacHistory.previousMI=yes';
  miHost.appendChild(textInput({
    label: 'When did it occur?',
    section: 'cardiacHistory', field: 'miDate', type: 'date'
  }));
  miHost.appendChild(radioGroup({
    label: 'Was it within the last 6 months?',
    section: 'cardiacHistory', field: 'recentMI', options: yesNo
  }));
  const recentMIWeeksHost = document.createElement('div');
  recentMIWeeksHost.dataset.conditional = 'cardiacHistory.recentMI=yes';
  recentMIWeeksHost.appendChild(textInput({
    label: 'How many weeks ago?',
    section: 'cardiacHistory', field: 'recentMIWeeks',
    type: 'number', min: 0, max: 26, required: true
  }));
  miHost.appendChild(recentMIWeeksHost);
  card.appendChild(miHost);

  card.appendChild(radioGroup({
    label: 'Have you had PCI (stent/angioplasty)?',
    section: 'cardiacHistory', field: 'pci', options: yesNo
  }));
  const pciDetailsHost = document.createElement('div');
  pciDetailsHost.dataset.conditional = 'cardiacHistory.pci=yes';
  pciDetailsHost.appendChild(textInput({
    label: 'PCI details',
    section: 'cardiacHistory', field: 'pciDetails',
    placeholder: 'e.g. Year, vessels treated'
  }));
  card.appendChild(pciDetailsHost);

  card.appendChild(radioGroup({
    label: 'Have you had CABG (bypass surgery)?',
    section: 'cardiacHistory', field: 'cabg', options: yesNo
  }));
  const cabgDetailsHost = document.createElement('div');
  cabgDetailsHost.dataset.conditional = 'cardiacHistory.cabg=yes';
  cabgDetailsHost.appendChild(textInput({
    label: 'CABG details',
    section: 'cardiacHistory', field: 'cabgDetails',
    placeholder: 'e.g. Year, number of grafts'
  }));
  card.appendChild(cabgDetailsHost);

  card.appendChild(radioGroup({
    label: 'Do you have any heart valve disease?',
    section: 'cardiacHistory', field: 'valvularDisease', options: yesNo
  }));
  const valvDetailsHost = document.createElement('div');
  valvDetailsHost.dataset.conditional = 'cardiacHistory.valvularDisease=yes';
  valvDetailsHost.appendChild(textInput({
    label: 'Valve disease details',
    section: 'cardiacHistory', field: 'valvularDetails',
    placeholder: 'e.g. Aortic stenosis, mitral regurgitation'
  }));
  card.appendChild(valvDetailsHost);

  card.appendChild(radioGroup({
    label: 'Have you been diagnosed with cardiomyopathy?',
    section: 'cardiacHistory', field: 'cardiomyopathy', options: yesNo
  }));
  const cmHost = document.createElement('div');
  cmHost.dataset.conditional = 'cardiacHistory.cardiomyopathy=yes';
  cmHost.appendChild(selectInput({
    label: 'Type of cardiomyopathy',
    section: 'cardiacHistory', field: 'cardiomyopathyType',
    options: [
      { value: 'dilated', label: 'Dilated' },
      { value: 'hypertrophic', label: 'Hypertrophic' },
      { value: 'restrictive', label: 'Restrictive' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(cmHost);

  card.appendChild(radioGroup({
    label: 'Have you had pericarditis?',
    section: 'cardiacHistory', field: 'pericarditis', options: yesNo
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Arrhythmia & Conduction',
    description: 'Atrial fibrillation, pacemaker, syncope, and palpitations.'
  });

  card.appendChild(radioGroup({
    label: 'Have you been diagnosed with atrial fibrillation?',
    section: 'arrhythmiaConduction', field: 'atrialFibrillation', options: yesNo
  }));
  const afHost = document.createElement('div');
  afHost.dataset.conditional = 'arrhythmiaConduction.atrialFibrillation=yes';
  afHost.appendChild(selectInput({
    label: 'Type of atrial fibrillation',
    section: 'arrhythmiaConduction', field: 'afType',
    required: true,
    options: [
      { value: 'paroxysmal', label: 'Paroxysmal (intermittent)' },
      { value: 'persistent', label: 'Persistent' },
      { value: 'permanent', label: 'Permanent' }
    ]
  }));
  card.appendChild(afHost);

  card.appendChild(radioGroup({
    label: 'Do you have any other arrhythmia?',
    section: 'arrhythmiaConduction', field: 'otherArrhythmia', options: yesNo
  }));
  const otherArrHost = document.createElement('div');
  otherArrHost.dataset.conditional = 'arrhythmiaConduction.otherArrhythmia=yes';
  otherArrHost.appendChild(textInput({
    label: 'Type of arrhythmia',
    section: 'arrhythmiaConduction', field: 'otherArrhythmiaType'
  }));
  card.appendChild(otherArrHost);

  card.appendChild(radioGroup({
    label: 'Do you have a pacemaker or ICD (implantable cardioverter-defibrillator)?',
    section: 'arrhythmiaConduction', field: 'pacemaker', options: yesNo
  }));
  const pacerHost = document.createElement('div');
  pacerHost.dataset.conditional = 'arrhythmiaConduction.pacemaker=yes';
  pacerHost.appendChild(selectInput({
    label: 'Device type',
    section: 'arrhythmiaConduction', field: 'pacemakerType',
    options: [
      { value: 'single-chamber', label: 'Single chamber pacemaker' },
      { value: 'dual-chamber', label: 'Dual chamber pacemaker' },
      { value: 'biventricular', label: 'Biventricular (CRT)' },
      { value: 'icd', label: 'ICD' }
    ]
  }));
  card.appendChild(pacerHost);

  card.appendChild(radioGroup({
    label: 'Have you experienced syncope (fainting/blackouts)?',
    section: 'arrhythmiaConduction', field: 'syncope', options: yesNo
  }));
  const syncHost = document.createElement('div');
  syncHost.dataset.conditional = 'arrhythmiaConduction.syncope=yes';
  syncHost.appendChild(textArea({
    label: 'Syncope details',
    section: 'arrhythmiaConduction', field: 'syncopeDetails',
    placeholder: 'Describe circumstances, frequency'
  }));
  card.appendChild(syncHost);

  card.appendChild(radioGroup({
    label: 'Do you experience palpitations?',
    section: 'arrhythmiaConduction', field: 'palpitations', options: yesNo
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Risk Factors',
    description: 'Hypertension, diabetes, hyperlipidaemia, family history, obesity.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have high blood pressure (hypertension)?',
    section: 'riskFactors', field: 'hypertension', options: yesNo
  }));
  const htnCtrlHost = document.createElement('div');
  htnCtrlHost.dataset.conditional = 'riskFactors.hypertension=yes';
  htnCtrlHost.appendChild(radioGroup({
    label: 'Is it well controlled with medication?',
    section: 'riskFactors', field: 'hypertensionControlled',
    options: yesNo, required: true
  }));
  card.appendChild(htnCtrlHost);

  card.appendChild(radioGroup({
    label: 'Do you have diabetes?',
    section: 'riskFactors', field: 'diabetes', options: yesNo
  }));
  const dmTypeHost = document.createElement('div');
  dmTypeHost.dataset.conditional = 'riskFactors.diabetes=yes';
  dmTypeHost.appendChild(selectInput({
    label: 'Type of diabetes',
    section: 'riskFactors', field: 'diabetesType',
    options: [
      { value: 'type1', label: 'Type 1' },
      { value: 'type2', label: 'Type 2' }
    ]
  }));
  card.appendChild(dmTypeHost);

  card.appendChild(radioGroup({
    label: 'Do you have high cholesterol (hyperlipidaemia)?',
    section: 'riskFactors', field: 'hyperlipidaemia', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Is there a family history of premature cardiovascular disease?',
    section: 'riskFactors', field: 'familyHistory', options: yesNo
  }));
  const famHxHost = document.createElement('div');
  famHxHost.dataset.conditional = 'riskFactors.familyHistory=yes';
  famHxHost.appendChild(textInput({
    label: 'Family history details',
    section: 'riskFactors', field: 'familyHistoryDetails',
    placeholder: 'e.g. Father had MI at age 45'
  }));
  card.appendChild(famHxHost);

  card.appendChild(radioGroup({
    label: 'Are you obese (BMI >= 30)?',
    section: 'riskFactors', field: 'obesity', options: yesNo
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Diagnostic Results',
    description: 'ECG, echocardiography, stress test, and catheterisation findings.'
  });

  card.appendChild(radioGroup({
    label: 'Is the ECG normal?',
    section: 'diagnosticResults', field: 'ecgNormal', options: yesNo
  }));
  const ecgHost = document.createElement('div');
  ecgHost.dataset.conditional = 'diagnosticResults.ecgNormal=no';
  ecgHost.appendChild(textArea({
    label: 'ECG findings',
    section: 'diagnosticResults', field: 'ecgFindings',
    placeholder: 'e.g. ST depression, LBBB, AF'
  }));
  card.appendChild(ecgHost);

  card.appendChild(radioGroup({
    label: 'Has an echocardiogram been performed?',
    section: 'diagnosticResults', field: 'echoPerformed', options: yesNo
  }));
  const echoHost = document.createElement('div');
  echoHost.dataset.conditional = 'diagnosticResults.echoPerformed=yes';
  echoHost.appendChild(textInput({
    label: 'Left ventricular ejection fraction (LVEF)',
    section: 'diagnosticResults', field: 'echoLVEF',
    type: 'number', min: 5, max: 80, unit: '%'
  }));
  echoHost.appendChild(textArea({
    label: 'Echocardiogram findings',
    section: 'diagnosticResults', field: 'echoFindings',
    placeholder: 'e.g. Wall motion abnormalities, valve issues'
  }));
  card.appendChild(echoHost);

  card.appendChild(radioGroup({
    label: 'Has a stress test been performed?',
    section: 'diagnosticResults', field: 'stressTestPerformed', options: yesNo
  }));
  const stressHost = document.createElement('div');
  stressHost.dataset.conditional = 'diagnosticResults.stressTestPerformed=yes';
  stressHost.appendChild(selectInput({
    label: 'Stress test result',
    section: 'diagnosticResults', field: 'stressTestResult',
    required: true,
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'abnormal', label: 'Abnormal' },
      { value: 'inconclusive', label: 'Inconclusive' }
    ]
  }));
  stressHost.appendChild(textArea({
    label: 'Stress test details',
    section: 'diagnosticResults', field: 'stressTestDetails',
    placeholder: 'e.g. Ischaemic changes, METs achieved'
  }));
  card.appendChild(stressHost);

  card.appendChild(radioGroup({
    label: 'Has cardiac catheterisation been performed?',
    section: 'diagnosticResults', field: 'cathPerformed', options: yesNo
  }));
  const cathHost = document.createElement('div');
  cathHost.dataset.conditional = 'diagnosticResults.cathPerformed=yes';
  cathHost.appendChild(textArea({
    label: 'Catheterisation findings',
    section: 'diagnosticResults', field: 'cathFindings',
    placeholder: 'e.g. LAD 80% stenosis, RCA 50% stenosis'
  }));
  card.appendChild(cathHost);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Current Medications',
    description: 'Antiplatelets, anticoagulants, beta-blockers, ACEi/ARBs, statins, diuretics.'
  });

  card.appendChild(radioGroup({
    label: 'Are you taking antiplatelets (e.g. aspirin, clopidogrel)?',
    section: 'currentMedications', field: 'antiplatelets', options: yesNo
  }));
  const apHost = document.createElement('div');
  apHost.dataset.conditional = 'currentMedications.antiplatelets=yes';
  apHost.appendChild(textInput({
    label: 'Antiplatelet medication and dose',
    section: 'currentMedications', field: 'antiplateletType',
    placeholder: 'e.g. Aspirin 75mg, Clopidogrel 75mg'
  }));
  card.appendChild(apHost);

  card.appendChild(radioGroup({
    label: 'Are you taking anticoagulants (e.g. warfarin, apixaban)?',
    section: 'currentMedications', field: 'anticoagulants', options: yesNo
  }));
  const acHost = document.createElement('div');
  acHost.dataset.conditional = 'currentMedications.anticoagulants=yes';
  acHost.appendChild(textInput({
    label: 'Anticoagulant medication and dose',
    section: 'currentMedications', field: 'anticoagulantType',
    placeholder: 'e.g. Warfarin, Apixaban 5mg BD'
  }));
  card.appendChild(acHost);

  card.appendChild(radioGroup({
    label: 'Are you taking beta-blockers?',
    section: 'currentMedications', field: 'betaBlockers', options: yesNo
  }));
  const bbHost = document.createElement('div');
  bbHost.dataset.conditional = 'currentMedications.betaBlockers=yes';
  bbHost.appendChild(textInput({
    label: 'Beta-blocker medication and dose',
    section: 'currentMedications', field: 'betaBlockerType',
    placeholder: 'e.g. Bisoprolol 5mg OD'
  }));
  card.appendChild(bbHost);

  card.appendChild(radioGroup({
    label: 'Are you taking ACE inhibitors or ARBs?',
    section: 'currentMedications', field: 'aceInhibitorsARBs', options: yesNo
  }));
  const aceHost = document.createElement('div');
  aceHost.dataset.conditional = 'currentMedications.aceInhibitorsARBs=yes';
  aceHost.appendChild(textInput({
    label: 'ACEi/ARB medication and dose',
    section: 'currentMedications', field: 'aceArbType',
    placeholder: 'e.g. Ramipril 5mg, Losartan 50mg'
  }));
  card.appendChild(aceHost);

  card.appendChild(radioGroup({
    label: 'Are you taking statins?',
    section: 'currentMedications', field: 'statins', options: yesNo
  }));
  const statHost = document.createElement('div');
  statHost.dataset.conditional = 'currentMedications.statins=yes';
  statHost.appendChild(textInput({
    label: 'Statin medication and dose',
    section: 'currentMedications', field: 'statinType',
    placeholder: 'e.g. Atorvastatin 40mg'
  }));
  card.appendChild(statHost);

  card.appendChild(radioGroup({
    label: 'Are you taking diuretics?',
    section: 'currentMedications', field: 'diuretics', options: yesNo
  }));
  const diuHost = document.createElement('div');
  diuHost.dataset.conditional = 'currentMedications.diuretics=yes';
  diuHost.appendChild(textInput({
    label: 'Diuretic medication and dose',
    section: 'currentMedications', field: 'diureticType',
    placeholder: 'e.g. Furosemide 40mg'
  }));
  card.appendChild(diuHost);

  card.appendChild(textArea({
    label: 'Other cardiac medications',
    section: 'currentMedications', field: 'otherCardiacMeds',
    placeholder: 'List any other cardiac medications'
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Allergies',
    description: 'Drug allergies and contrast dye allergy.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have any drug allergies?',
    section: 'allergies', field: 'drugAllergies', options: yesNo
  }));

  const drugAllergyHost = document.createElement('div');
  drugAllergyHost.dataset.conditional = 'allergies.drugAllergies=yes';
  const drugHeader = document.createElement('div');
  drugHeader.className = 'list-section-header';
  drugHeader.innerHTML = '<h3>Drug allergies</h3>';
  drugAllergyHost.appendChild(drugHeader);
  drugAllergyHost.appendChild(drugAllergyEditor());
  card.appendChild(drugAllergyHost);

  card.appendChild(radioGroup({
    label: 'Do you have a contrast dye allergy?',
    section: 'allergies', field: 'contrastAllergy', options: yesNo
  }));
  const contrastHost = document.createElement('div');
  contrastHost.dataset.conditional = 'allergies.contrastAllergy=yes';
  contrastHost.appendChild(textInput({
    label: 'Contrast allergy details',
    section: 'allergies', field: 'contrastAllergyDetails',
    placeholder: 'e.g. Iodine contrast - rash and wheeze'
  }));
  card.appendChild(contrastHost);

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Social & Functional',
    description: 'Smoking, alcohol, exercise tolerance, and occupation.'
  });

  card.appendChild(selectInput({
    label: 'Smoking status',
    section: 'socialFunctional', field: 'smoking',
    options: [
      { value: 'current', label: 'Current smoker' },
      { value: 'ex', label: 'Ex-smoker' },
      { value: 'never', label: 'Never smoked' }
    ]
  }));
  const packYearsHost = document.createElement('div');
  packYearsHost.dataset.conditionalAny = 'socialFunctional.smoking=current,ex';
  packYearsHost.appendChild(textInput({
    label: 'Pack years',
    section: 'socialFunctional', field: 'smokingPackYears',
    type: 'number', min: 0, max: 200
  }));
  card.appendChild(packYearsHost);

  card.appendChild(selectInput({
    label: 'Alcohol consumption',
    section: 'socialFunctional', field: 'alcohol',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional (1-7 units/week)' },
      { value: 'moderate', label: 'Moderate (8-14 units/week)' },
      { value: 'heavy', label: 'Heavy (>14 units/week)' }
    ]
  }));
  const alcUnitsHost = document.createElement('div');
  alcUnitsHost.dataset.conditionalAny = 'socialFunctional.alcohol=occasional,moderate,heavy';
  alcUnitsHost.appendChild(textInput({
    label: 'Units per week',
    section: 'socialFunctional', field: 'alcoholUnitsPerWeek',
    type: 'number', min: 0, max: 200
  }));
  card.appendChild(alcUnitsHost);

  card.appendChild(selectInput({
    label: 'Exercise tolerance',
    section: 'socialFunctional', field: 'exerciseTolerance',
    options: [
      { value: 'unable', label: 'Unable to exercise' },
      { value: 'light-housework', label: 'Light housework only' },
      { value: 'climb-stairs', label: 'Can climb 1-2 flights of stairs' },
      { value: 'moderate-exercise', label: 'Moderate exercise (brisk walking)' },
      { value: 'vigorous-exercise', label: 'Vigorous exercise (running, swimming)' }
    ]
  }));

  card.appendChild(readOnlyReadout({
    label: 'Estimated METs',
    id: 'mets-readout',
    render: () => {
      const m = state.socialFunctional.estimatedMETs;
      if (m == null) return '<span class="muted">Auto-calculated from exercise tolerance</span>';
      const cls = m < 4 ? 'warn' : 'ok';
      const note = m < 4
        ? '<span class="warn">(Poor - below 4 METs threshold)</span>'
        : '<span class="ok">(Adequate)</span>';
      return `<strong class="${cls}">${m} METs</strong> ${note}`;
    }
  }));

  card.appendChild(textInput({
    label: 'Occupation',
    section: 'socialFunctional', field: 'occupation',
    placeholder: 'e.g. Retired, office worker, manual labour'
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
  const mets = document.getElementById('mets-readout');
  if (mets) {
    const m = state.socialFunctional.estimatedMETs;
    if (m == null) {
      mets.innerHTML = '<span class="muted">Auto-calculated from exercise tolerance</span>';
    } else {
      const cls = m < 4 ? 'warn' : 'ok';
      const note = m < 4
        ? '<span class="warn">(Poor - below 4 METs threshold)</span>'
        : '<span class="ok">(Adequate)</span>';
      mets.innerHTML = `<strong class="${cls}">${m} METs</strong> ${note}`;
    }
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
  // Chest pain / angina
  ['chestPainAngina', 'chestPain'],
  ['chestPainAngina', 'unstableAngina'],
  // Heart failure symptoms
  ['heartFailureSymptoms', 'dyspnoea'],
  ['heartFailureSymptoms', 'orthopnoea'],
  ['heartFailureSymptoms', 'pnd'],
  ['heartFailureSymptoms', 'peripheralOedema'],
  ['heartFailureSymptoms', 'nyhaClass'],
  // Cardiac history
  ['cardiacHistory', 'previousMI'],
  ['cardiacHistory', 'pci'],
  ['cardiacHistory', 'cabg'],
  ['cardiacHistory', 'valvularDisease'],
  ['cardiacHistory', 'cardiomyopathy'],
  ['cardiacHistory', 'pericarditis'],
  // Arrhythmia & conduction
  ['arrhythmiaConduction', 'atrialFibrillation'],
  ['arrhythmiaConduction', 'otherArrhythmia'],
  ['arrhythmiaConduction', 'pacemaker'],
  ['arrhythmiaConduction', 'syncope'],
  ['arrhythmiaConduction', 'palpitations'],
  // Risk factors
  ['riskFactors', 'hypertension'],
  ['riskFactors', 'diabetes'],
  ['riskFactors', 'hyperlipidaemia'],
  ['riskFactors', 'familyHistory'],
  ['riskFactors', 'obesity'],
  // Diagnostic results
  ['diagnosticResults', 'ecgNormal'],
  ['diagnosticResults', 'echoPerformed'],
  ['diagnosticResults', 'stressTestPerformed'],
  ['diagnosticResults', 'cathPerformed'],
  // Current medications
  ['currentMedications', 'antiplatelets'],
  ['currentMedications', 'anticoagulants'],
  ['currentMedications', 'betaBlockers'],
  ['currentMedications', 'aceInhibitorsARBs'],
  ['currentMedications', 'statins'],
  ['currentMedications', 'diuretics'],
  // Allergies
  ['allergies', 'drugAllergies'],
  ['allergies', 'contrastAllergy'],
  // Social & functional
  ['socialFunctional', 'smoking'],
  ['socialFunctional', 'alcohol'],
  ['socialFunctional', 'exerciseTolerance']
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
    ccsClass, nyhaClass, overallRisk,
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
      <td>${esc(r.system)}</td>
      <td>${esc(r.description)}</td>
      <td class="num"><span class="grade-pill grade-${r.grade}">Grade ${r.grade}</span></td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No grading rules fired. Either the assessment is empty or all responses indicate no findings.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">System</th>
            <th scope="col">Finding</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Cardiology Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Overall risk</h3>
      <p class="risk-summary">
        <span class="risk-badge ${riskLevelClass(overallRisk)}">${esc(riskLevelLabel(overallRisk))}</span>
      </p>

      <h3>Classification</h3>
      <div class="class-row">
        <div class="class-card">
          <span class="class-label">CCS Angina Class</span>
          <span class="class-value">${esc(ccsClassLabel(ccsClass))}</span>
        </div>
        <div class="class-card">
          <span class="class-label">NYHA Heart Failure Class</span>
          <span class="class-value">${esc(nyhaClassLabel(nyhaClass))}</span>
        </div>
      </div>

      <h3>Fired rules (${firedRules.length})</h3>
      ${firedTable}

      <h3>Flagged Issues (${additionalFlags.length})</h3>
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
  const _errors = validateForm();
  if (_errors.length > 0) return;
  recomputeDerived();
  const { ccsClass, nyhaClass, overallRisk, firedRules } =
    calculateCardioGrade(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    ccsClass,
    nyhaClass,
    overallRisk,
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
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics',           title: 'Demographics' },
  { step: 2,  section: 'chestPainAngina',        title: 'Chest Pain' },
  { step: 3,  section: 'heartFailureSymptoms',   title: 'Heart Failure' },
  { step: 4,  section: 'cardiacHistory',         title: 'Cardiac History' },
  { step: 5,  section: 'arrhythmiaConduction',   title: 'Arrhythmia' },
  { step: 6,  section: 'riskFactors',            title: 'Risk Factors' },
  { step: 7,  section: 'diagnosticResults',      title: 'Diagnostics' },
  { step: 8,  section: 'currentMedications',     title: 'Medications' },
  { step: 9,  section: 'allergies',              title: 'Allergies' },
  { step: 10, section: 'socialFunctional',       title: 'Social & Functional' }
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
