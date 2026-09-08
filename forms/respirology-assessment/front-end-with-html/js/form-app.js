import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateMRC } from './mrc-grader.js';
import { bmiCategory, calculateBMI, calculateStopBang, emptyAssessment, mrcGradeClass, mrcGradeLabel, mrcSeverityLabel } from './types.js';

// Respirology Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure MRC scoring engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'respirology-assessment.front-end-form-with-html.v1';

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

/** @type {import('./types.js').AssessmentData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'respirology-assessment',
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

function setField(section, field, value) {
  state[section][field] = value;
  recomputeDerived();
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
}

function recomputeDerived() {
  state.demographics.bmi = calculateBMI(
    state.demographics.weight,
    state.demographics.height
  );
  state.sleepFunctional.stopBangScore = calculateStopBang(
    state.sleepFunctional.osaScreenSnoring,
    state.sleepFunctional.osaScreenTired,
    state.sleepFunctional.osaScreenObservedApnoea,
    state.sleepFunctional.osaScreenBMIOver35,
    state.sleepFunctional.osaScreenAge50Plus,
    state.sleepFunctional.osaScreenNeckOver40cm,
    state.sleepFunctional.osaScreenMale
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
// Component builders (Lily-shaped)
// ----------------------------------------------------------------------

const TOTAL_STEPS = 10;

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
  const labelText =
    esc(opts.label) +
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
  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map(
      (o) =>
        `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error">${optionsHtml}</select>
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
    `<span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Repeating-list editors (medications, drug allergies, env allergens)
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

function environmentalAllergenEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.allergies.environmentalAllergens;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No environmental allergens added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((value, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row env-row';
      r.innerHTML = `
        <input type="text" class="text-input"
               value="${esc(value)}"
               placeholder="e.g. dust mites, pollen, mould, animal dander">
        <button type="button" class="button" data-variant="icon" aria-label="Remove environmental allergen">&times;</button>
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
    addBtn.textContent = '+ Add environmental allergen';
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
// Section renderers (10 steps)
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
    section: 'demographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'demographics', field: 'sex',
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
    title: 'Chief Complaint',
    description: 'Primary respiratory symptom and timeline.'
  });

  card.appendChild(textArea({
    label: 'Primary respiratory symptom',
    section: 'chiefComplaint', field: 'primarySymptom',
    placeholder: 'Describe the main breathing or respiratory problem…'
  }));

  card.appendChild(textInput({
    label: 'Onset date',
    section: 'chiefComplaint', field: 'onsetDate',
    type: 'date'
  }));

  card.appendChild(textInput({
    label: 'Duration',
    section: 'chiefComplaint', field: 'duration',
    placeholder: 'e.g. 3 months, 2 years, acute onset'
  }));

  card.appendChild(textInput({
    label: 'Severity rating (1-10)',
    section: 'chiefComplaint', field: 'severityRating',
    type: 'number', min: 1, max: 10, step: 1
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Dyspnoea Assessment',
    description: 'MRC Dyspnoea Scale and related symptoms.'
  });

  card.appendChild(selectInput({
    label: 'MRC Dyspnoea Grade',
    section: 'dyspnoeaAssessment', field: 'mrcGrade',
    options: [
      { value: '1', label: 'Grade 1 - Breathless only on strenuous exercise' },
      { value: '2', label: 'Grade 2 - Breathless when hurrying on level / walking up slight hill' },
      { value: '3', label: 'Grade 3 - Walks slower than peers on level / stops after ~15 min' },
      { value: '4', label: 'Grade 4 - Stops for breath after ~100 yards on level' },
      { value: '5', label: 'Grade 5 - Too breathless to leave house / breathless dressing' }
    ]
  }));

  card.appendChild(textArea({
    label: 'What triggers your breathlessness?',
    section: 'dyspnoeaAssessment', field: 'triggers',
    placeholder: 'e.g. walking, stairs, cold air, exertion…'
  }));

  card.appendChild(textInput({
    label: 'Exercise tolerance',
    section: 'dyspnoeaAssessment', field: 'exerciseToleranceMetres',
    type: 'number', min: 0, max: 10000,
    unit: 'metres on flat before stopping'
  }));

  card.appendChild(radioGroup({
    label: 'Do you experience orthopnoea (breathlessness lying flat)?',
    section: 'dyspnoeaAssessment', field: 'orthopnoea', options: yesNo
  }));
  const pillows = document.createElement('div');
  pillows.dataset.conditional = 'dyspnoeaAssessment.orthopnoea=yes';
  pillows.appendChild(textInput({
    label: 'How many pillows do you use to sleep?',
    section: 'dyspnoeaAssessment', field: 'orthopnoeaPillows',
    type: 'number', min: 1, max: 10
  }));
  card.appendChild(pillows);

  card.appendChild(radioGroup({
    label: 'Do you experience paroxysmal nocturnal dyspnoea (PND)?',
    section: 'dyspnoeaAssessment', field: 'pnd', options: yesNo
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Cough Assessment',
    description: 'Cough characteristics and sputum.'
  });

  card.appendChild(textInput({
    label: 'Cough duration',
    section: 'coughAssessment', field: 'duration',
    placeholder: 'e.g. 2 weeks, 6 months, chronic'
  }));

  card.appendChild(radioGroup({
    label: 'Cough character',
    section: 'coughAssessment', field: 'character',
    options: [
      { value: 'productive', label: 'Productive (with sputum)' },
      { value: 'dry', label: 'Dry (no sputum)' }
    ]
  }));

  const sputumVol = document.createElement('div');
  sputumVol.dataset.conditional = 'coughAssessment.character=productive';
  sputumVol.appendChild(selectInput({
    label: 'Sputum volume',
    section: 'coughAssessment', field: 'sputumVolume',
    options: [
      { value: 'small', label: 'Small (teaspoon)' },
      { value: 'moderate', label: 'Moderate (tablespoon)' },
      { value: 'large', label: 'Large (egg-cup or more)' }
    ]
  }));
  sputumVol.appendChild(selectInput({
    label: 'Sputum colour',
    section: 'coughAssessment', field: 'sputumColour',
    options: [
      { value: 'clear', label: 'Clear' },
      { value: 'white', label: 'White / Mucoid' },
      { value: 'yellow', label: 'Yellow' },
      { value: 'green', label: 'Green' },
      { value: 'brown', label: 'Brown / Rusty' },
      { value: 'blood-streaked', label: 'Blood-streaked' }
    ]
  }));
  card.appendChild(sputumVol);

  card.appendChild(radioGroup({
    label: 'Have you coughed up blood (haemoptysis)?',
    section: 'coughAssessment', field: 'haemoptysis', options: yesNo
  }));
  const haemDetails = document.createElement('div');
  haemDetails.dataset.conditional = 'coughAssessment.haemoptysis=yes';
  haemDetails.appendChild(textArea({
    label: 'Haemoptysis details',
    section: 'coughAssessment', field: 'haemoptysisDetails',
    placeholder: 'Describe frequency, volume, and colour…'
  }));
  card.appendChild(haemDetails);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Respiratory History',
    description: 'Previous respiratory conditions and diagnoses.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have asthma?',
    section: 'respiratoryHistory', field: 'asthma', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do you have COPD?',
    section: 'respiratoryHistory', field: 'copd', options: yesNo
  }));
  const copdSeverity = document.createElement('div');
  copdSeverity.dataset.conditional = 'respiratoryHistory.copd=yes';
  copdSeverity.appendChild(selectInput({
    label: 'COPD severity',
    section: 'respiratoryHistory', field: 'copdSeverity',
    options: [
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));
  card.appendChild(copdSeverity);

  card.appendChild(radioGroup({
    label: 'Do you have bronchiectasis?',
    section: 'respiratoryHistory', field: 'bronchiectasis', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do you have interstitial lung disease (ILD)?',
    section: 'respiratoryHistory', field: 'interstitialLungDisease', options: yesNo
  }));
  const ildType = document.createElement('div');
  ildType.dataset.conditional = 'respiratoryHistory.interstitialLungDisease=yes';
  ildType.appendChild(textInput({
    label: 'Type of ILD',
    section: 'respiratoryHistory', field: 'ildType',
    placeholder: 'e.g. IPF, sarcoidosis, hypersensitivity pneumonitis…'
  }));
  card.appendChild(ildType);

  card.appendChild(radioGroup({
    label: 'Have you had tuberculosis (TB)?',
    section: 'respiratoryHistory', field: 'tuberculosis', options: yesNo
  }));
  const tbComplete = document.createElement('div');
  tbComplete.dataset.conditional = 'respiratoryHistory.tuberculosis=yes';
  tbComplete.appendChild(radioGroup({
    label: 'Was TB treatment completed?',
    section: 'respiratoryHistory', field: 'tbTreatmentComplete', options: yesNo
  }));
  card.appendChild(tbComplete);

  card.appendChild(radioGroup({
    label: 'Have you had pneumonia?',
    section: 'respiratoryHistory', field: 'pneumonia', options: yesNo
  }));
  const pneumRecur = document.createElement('div');
  pneumRecur.dataset.conditional = 'respiratoryHistory.pneumonia=yes';
  pneumRecur.appendChild(radioGroup({
    label: 'Has pneumonia been recurrent?',
    section: 'respiratoryHistory', field: 'pneumoniaRecurrent', options: yesNo
  }));
  card.appendChild(pneumRecur);

  card.appendChild(radioGroup({
    label: 'Have you had a pulmonary embolism (PE)?',
    section: 'respiratoryHistory', field: 'pulmonaryEmbolism', options: yesNo
  }));
  const peDate = document.createElement('div');
  peDate.dataset.conditional = 'respiratoryHistory.pulmonaryEmbolism=yes';
  peDate.appendChild(textInput({
    label: 'Date of PE',
    section: 'respiratoryHistory', field: 'peDate',
    type: 'date'
  }));
  card.appendChild(peDate);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Pulmonary Function',
    description: 'Spirometry and gas transfer results (leave blank if not tested).'
  });

  const hint = document.createElement('p');
  hint.className = 'muted';
  hint.style.marginBottom = '0.75rem';
  hint.textContent = 'Enter results as percentage of predicted values where applicable.';
  card.appendChild(hint);

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(textInput({
    label: 'FEV1', section: 'pulmonaryFunction', field: 'fev1',
    type: 'number', min: 0, max: 150, unit: '% predicted'
  }));
  row1.appendChild(textInput({
    label: 'FVC', section: 'pulmonaryFunction', field: 'fvc',
    type: 'number', min: 0, max: 150, unit: '% predicted'
  }));
  card.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'two-col';
  row2.appendChild(textInput({
    label: 'FEV1/FVC Ratio', section: 'pulmonaryFunction', field: 'fev1FvcRatio',
    type: 'number', min: 0, max: 100, unit: '%'
  }));
  row2.appendChild(textInput({
    label: 'DLCO (gas transfer)', section: 'pulmonaryFunction', field: 'dlco',
    type: 'number', min: 0, max: 150, unit: '% predicted'
  }));
  card.appendChild(row2);

  const row3 = document.createElement('div');
  row3.className = 'two-col';
  row3.appendChild(textInput({
    label: 'TLC (total lung capacity)', section: 'pulmonaryFunction', field: 'tlc',
    type: 'number', min: 0, max: 200, unit: '% predicted'
  }));
  row3.appendChild(textInput({
    label: 'Oxygen saturation (SpO2)', section: 'pulmonaryFunction', field: 'oxygenSaturation',
    type: 'number', min: 50, max: 100, unit: '%'
  }));
  card.appendChild(row3);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Current Medications',
    description: 'Respiratory medications and therapies.'
  });

  const inhHeader = document.createElement('div');
  inhHeader.className = 'list-section-header';
  inhHeader.innerHTML = `
    <h3>Inhalers</h3>
    <p class="hint">e.g. salbutamol, ipratropium, ICS/LABA combinations.</p>
  `;
  card.appendChild(inhHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications', field: 'inhalers',
    addLabel: 'Add inhaler'
  }));

  const nebHeader = document.createElement('div');
  nebHeader.className = 'list-section-header';
  nebHeader.innerHTML = '<h3>Nebulizers</h3>';
  card.appendChild(nebHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications', field: 'nebulizers',
    addLabel: 'Add nebulizer'
  }));

  card.appendChild(radioGroup({
    label: 'Are you on long-term oxygen therapy?',
    section: 'currentMedications', field: 'oxygenTherapy', options: yesNo
  }));
  const o2 = document.createElement('div');
  o2.dataset.conditional = 'currentMedications.oxygenTherapy=yes';
  o2.appendChild(selectInput({
    label: 'Oxygen delivery method',
    section: 'currentMedications', field: 'oxygenDelivery',
    options: [
      { value: 'nasal-cannula', label: 'Nasal cannula' },
      { value: 'venturi', label: 'Venturi mask' },
      { value: 'non-rebreather', label: 'Non-rebreather mask' },
      { value: 'cpap', label: 'CPAP' },
      { value: 'bipap', label: 'BiPAP' }
    ]
  }));
  o2.appendChild(textInput({
    label: 'Flow rate',
    section: 'currentMedications', field: 'oxygenFlowRate',
    type: 'number', min: 0, max: 15, unit: 'L/min'
  }));
  card.appendChild(o2);

  card.appendChild(radioGroup({
    label: 'Are you on oral corticosteroids?',
    section: 'currentMedications', field: 'oralSteroids', options: yesNo
  }));
  const steroidD = document.createElement('div');
  steroidD.dataset.conditional = 'currentMedications.oralSteroids=yes';
  steroidD.appendChild(textInput({
    label: 'Steroid details',
    section: 'currentMedications', field: 'oralSteroidDetails',
    placeholder: 'e.g. Prednisolone 5 mg daily'
  }));
  card.appendChild(steroidD);

  card.appendChild(radioGroup({
    label: 'Are you currently taking antibiotics for a respiratory infection?',
    section: 'currentMedications', field: 'antibiotics', options: yesNo
  }));
  const abxD = document.createElement('div');
  abxD.dataset.conditional = 'currentMedications.antibiotics=yes';
  abxD.appendChild(textInput({
    label: 'Antibiotic details',
    section: 'currentMedications', field: 'antibioticDetails',
    placeholder: 'e.g. Amoxicillin 500 mg TDS'
  }));
  card.appendChild(abxD);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Allergies',
    description: 'Drug allergies and environmental allergens.'
  });

  const drugHeader = document.createElement('div');
  drugHeader.className = 'list-section-header';
  drugHeader.innerHTML = '<h3>Drug allergies</h3>';
  card.appendChild(drugHeader);
  card.appendChild(drugAllergyEditor());

  const envHeader = document.createElement('div');
  envHeader.className = 'list-section-header';
  envHeader.innerHTML = `
    <h3>Environmental allergens</h3>
    <p class="hint">e.g. dust mites, pollen, mould, animal dander.</p>
  `;
  card.appendChild(envHeader);
  card.appendChild(environmentalAllergenEditor());

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
    label: 'Do you vape or use e-cigarettes?',
    section: 'smokingExposures', field: 'vaping', options: yesNo
  }));
  const vapeD = document.createElement('div');
  vapeD.dataset.conditional = 'smokingExposures.vaping=yes';
  vapeD.appendChild(textInput({
    label: 'Vaping details',
    section: 'smokingExposures', field: 'vapingDetails',
    placeholder: 'e.g. type, frequency, duration…'
  }));
  card.appendChild(vapeD);

  card.appendChild(radioGroup({
    label: 'Do you have any occupational respiratory exposures?',
    section: 'smokingExposures', field: 'occupationalExposure', options: yesNo
  }));
  const occD = document.createElement('div');
  occD.dataset.conditional = 'smokingExposures.occupationalExposure=yes';
  occD.appendChild(textInput({
    label: 'Occupational exposure details',
    section: 'smokingExposures', field: 'occupationalDetails',
    placeholder: 'e.g. dust, fumes, chemicals, farming…'
  }));
  card.appendChild(occD);

  card.appendChild(radioGroup({
    label: 'Have you ever been exposed to asbestos?',
    section: 'smokingExposures', field: 'asbestosExposure', options: yesNo
  }));
  const asbD = document.createElement('div');
  asbD.dataset.conditional = 'smokingExposures.asbestosExposure=yes';
  asbD.appendChild(textInput({
    label: 'Asbestos exposure details',
    section: 'smokingExposures', field: 'asbestosDetails',
    placeholder: 'e.g. duration, occupation, timeframe…'
  }));
  card.appendChild(asbD);

  card.appendChild(radioGroup({
    label: 'Do you have pets at home?',
    section: 'smokingExposures', field: 'pets', options: yesNo
  }));
  const petD = document.createElement('div');
  petD.dataset.conditional = 'smokingExposures.pets=yes';
  petD.appendChild(textInput({
    label: 'Pet details',
    section: 'smokingExposures', field: 'petDetails',
    placeholder: 'e.g. cat, dog, birds…'
  }));
  card.appendChild(petD);

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Sleep & Functional Status',
    description: 'Sleep quality, OSA screening, and functional capacity.'
  });

  card.appendChild(selectInput({
    label: 'Sleep quality',
    section: 'sleepFunctional', field: 'sleepQuality',
    options: [
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' },
      { value: 'poor', label: 'Poor' }
    ]
  }));

  const sbHeader = document.createElement('div');
  sbHeader.className = 'list-section-header';
  sbHeader.innerHTML = `
    <h3>STOP-BANG OSA screening</h3>
    <p class="hint">Each "yes" adds 1 point. Score >=5 indicates high risk of obstructive sleep apnoea.</p>
  `;
  card.appendChild(sbHeader);

  card.appendChild(radioGroup({ label: 'Do you SNORE loudly?', section: 'sleepFunctional', field: 'osaScreenSnoring', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you feel TIRED or sleepy during the day?', section: 'sleepFunctional', field: 'osaScreenTired', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Has anyone OBSERVED you stop breathing during sleep?', section: 'sleepFunctional', field: 'osaScreenObservedApnoea', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Is your BMI over 35?', section: 'sleepFunctional', field: 'osaScreenBMIOver35', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Are you aged 50 or over?', section: 'sleepFunctional', field: 'osaScreenAge50Plus', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Is your neck circumference over 40 cm?', section: 'sleepFunctional', field: 'osaScreenNeckOver40cm', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Are you male?', section: 'sleepFunctional', field: 'osaScreenMale', options: yesNo }));

  card.appendChild(readOnlyReadout({
    label: 'STOP-BANG score',
    id: 'stopbang-readout',
    render: () => {
      const v = state.sleepFunctional.stopBangScore;
      if (v == null) return '<span class="muted">Auto-calculated</span>';
      let risk;
      if (v >= 5) risk = 'High risk of OSA';
      else if (v >= 3) risk = 'Intermediate risk of OSA';
      else risk = 'Low risk of OSA';
      return `<strong>${v}/7</strong> <span class="muted">(${risk})</span>`;
    }
  }));

  card.appendChild(radioGroup({
    label: 'Do you experience excessive daytime somnolence?',
    section: 'sleepFunctional', field: 'daytimeSomnolence', options: yesNo
  }));
  const epworth = document.createElement('div');
  epworth.dataset.conditional = 'sleepFunctional.daytimeSomnolence=yes';
  epworth.appendChild(textInput({
    label: 'Epworth Sleepiness Scale score',
    section: 'sleepFunctional', field: 'epworthScore',
    type: 'number', min: 0, max: 24
  }));
  card.appendChild(epworth);

  card.appendChild(selectInput({
    label: 'Functional status',
    section: 'sleepFunctional', field: 'functionalStatus',
    options: [
      { value: 'independent', label: 'Independent — able to perform all daily activities' },
      { value: 'limited', label: 'Limited — needs some assistance with daily activities' },
      { value: 'dependent', label: 'Dependent — needs significant assistance' }
    ]
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
  const sb = document.getElementById('stopbang-readout');
  if (sb) {
    const v = state.sleepFunctional.stopBangScore;
    if (v == null) {
      sb.innerHTML = '<span class="muted">Auto-calculated</span>';
    } else {
      let risk;
      if (v >= 5) risk = 'High risk of OSA';
      else if (v >= 3) risk = 'Intermediate risk of OSA';
      else risk = 'Low risk of OSA';
      sb.innerHTML = `<strong>${v}/7</strong> <span class="muted">(${esc(risk)})</span>`;
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
  // Chief complaint
  ['chiefComplaint', 'primarySymptom'],
  ['chiefComplaint', 'duration'],
  ['chiefComplaint', 'severityRating'],
  // Dyspnoea
  ['dyspnoeaAssessment', 'mrcGrade'],
  ['dyspnoeaAssessment', 'orthopnoea'],
  ['dyspnoeaAssessment', 'pnd'],
  // Cough
  ['coughAssessment', 'duration'],
  ['coughAssessment', 'character'],
  ['coughAssessment', 'haemoptysis'],
  // Respiratory history
  ['respiratoryHistory', 'asthma'],
  ['respiratoryHistory', 'copd'],
  ['respiratoryHistory', 'bronchiectasis'],
  ['respiratoryHistory', 'interstitialLungDisease'],
  ['respiratoryHistory', 'tuberculosis'],
  ['respiratoryHistory', 'pneumonia'],
  ['respiratoryHistory', 'pulmonaryEmbolism'],
  // Pulmonary function (optional but tracked)
  ['pulmonaryFunction', 'fev1'],
  ['pulmonaryFunction', 'fvc'],
  ['pulmonaryFunction', 'oxygenSaturation'],
  // Current medications meta
  ['currentMedications', 'oxygenTherapy'],
  ['currentMedications', 'oralSteroids'],
  ['currentMedications', 'antibiotics'],
  // Smoking & exposures
  ['smokingExposures', 'smokingStatus'],
  ['smokingExposures', 'vaping'],
  ['smokingExposures', 'occupationalExposure'],
  ['smokingExposures', 'asbestosExposure'],
  ['smokingExposures', 'pets'],
  // Sleep & functional
  ['sleepFunctional', 'sleepQuality'],
  ['sleepFunctional', 'osaScreenSnoring'],
  ['sleepFunctional', 'osaScreenTired'],
  ['sleepFunctional', 'osaScreenObservedApnoea'],
  ['sleepFunctional', 'osaScreenBMIOver35'],
  ['sleepFunctional', 'osaScreenAge50Plus'],
  ['sleepFunctional', 'osaScreenNeckOver40cm'],
  ['sleepFunctional', 'osaScreenMale'],
  ['sleepFunctional', 'daytimeSomnolence'],
  ['sleepFunctional', 'functionalStatus']
];

function isAnswered(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v !== '';
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    if (isAnswered(state[section][field])) {
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
  { step: 1,  section: 'demographics',          title: 'Demographics' },
  { step: 2,  section: 'chiefComplaint',        title: 'Chief Complaint' },
  { step: 3,  section: 'dyspnoeaAssessment',    title: 'Dyspnoea' },
  { step: 4,  section: 'coughAssessment',       title: 'Cough' },
  { step: 5,  section: 'respiratoryHistory',    title: 'Respiratory History' },
  { step: 6,  section: 'pulmonaryFunction',     title: 'Pulmonary Function' },
  { step: 7,  section: 'currentMedications',    title: 'Medications' },
  { step: 8,  section: 'allergies',             title: 'Allergies' },
  { step: 9,  section: 'smokingExposures',      title: 'Smoking & Exposures' },
  { step: 10, section: 'sleepFunctional',       title: 'Sleep & Functional' }
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

  const { mrcGrade, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td class="num">MRC ${r.grade}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No grading rules fired (default MRC 1).</p>`
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
        <h2>Respirology Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>MRC Dyspnoea Grade</h3>
      <p class="mrc-summary">
        <span class="mrc-grade-badge ${mrcGradeClass(mrcGrade)}">MRC ${mrcGrade}</span>
        <span class="mrc-severity">${esc(mrcSeverityLabel(mrcGrade))}</span>
      </p>
      <p class="muted">${esc(mrcGradeLabel(mrcGrade))}</p>

      <h3>Fired grading rules</h3>
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
  const { mrcGrade, firedRules } = calculateMRC(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    mrcGrade,
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
