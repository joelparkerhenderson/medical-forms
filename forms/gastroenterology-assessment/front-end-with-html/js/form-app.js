import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateGISeverity } from './gi-grader.js';
import { bmiCategory, bristolStoolDescription, calculateBMI, emptyAssessment, severityClass, severityLabel } from './types.js';

// Gastroenterology Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure GI scoring engine, the safety-flag detector, and renders an
// inline report. State is persisted to localStorage so a partial fill
// survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'gastroenterology-assessment.front-end-form-with-html.v1';

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
  slug: 'gastroenterology-assessment',
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

const TOTAL_STEPS = 10;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs derived values (BMI), progress, conditional visibility, and any
 * inline auto-calculated readouts after each change.
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

/** Recompute values that depend on other fields. */
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
 * @param {{ label: string, section: string, field: string, type?: string,
 *           placeholder?: string, required?: boolean, min?: number,
 *           max?: number, step?: number, unit?: string, hint?: string }} opts
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
    <label for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
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
 *           hintId?: string }} opts
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
    <label for="${id}">${esc(opts.label)}</label>
    <select id="${id}" name="${id}" class="select">
      ${optionsHtml}
    </select>
    ${opts.hintId ? `<span class="hint" id="${opts.hintId}"></span>` : ''}
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
 * Read-only auto-calculated readout (e.g. BMI).
 * @param {{ label: string, id: string, render: () => string }} opts
 */
function readOnlyReadout(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field readout';
  wrapper.innerHTML = `
    <label>${esc(opts.label)}</label>
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
    `<span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Repeating-list editors (other medications, drug allergies)
// ----------------------------------------------------------------------

/** Editor for an array of {name, dose, frequency} medication rows. */
function otherMedicationsEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.currentMedications.otherMedications;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No other medications added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row med-row';
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Mesalazine">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 800 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. TDS, OD">
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

/** Editor for an array of {allergen, reaction, severity} drug-allergy rows. */
function drugAllergyEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.allergiesDiet.drugAllergies;
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
              <option value="severe"${row.severity === 'severe' ? ' selected' : ''}>Severe</option>
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
// Section renderers (1 per step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const abdominalLocations = [
  { value: 'epigastric', label: 'Epigastric (upper centre)' },
  { value: 'right-upper-quadrant', label: 'Right upper quadrant' },
  { value: 'left-upper-quadrant', label: 'Left upper quadrant' },
  { value: 'periumbilical', label: 'Periumbilical (around navel)' },
  { value: 'right-lower-quadrant', label: 'Right lower quadrant' },
  { value: 'left-lower-quadrant', label: 'Left lower quadrant' },
  { value: 'suprapubic', label: 'Suprapubic (lower centre)' },
  { value: 'diffuse', label: 'Diffuse (all over)' }
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
  grid.appendChild(textInput({ label: 'Last Name',  section: 'demographics', field: 'lastName',  required: true }));
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
    description: 'Primary reason for gastroenterology referral.'
  });

  card.appendChild(textArea({
    label: 'What is your primary GI symptom?',
    section: 'chiefComplaint', field: 'primarySymptom',
    placeholder: 'Describe your main symptom…'
  }));

  card.appendChild(selectInput({
    label: 'Where is the symptom located?',
    section: 'chiefComplaint', field: 'symptomLocation',
    options: abdominalLocations
  }));

  card.appendChild(textInput({
    label: 'When did the symptom start?',
    section: 'chiefComplaint', field: 'symptomOnset',
    placeholder: 'e.g. 3 months ago'
  }));

  card.appendChild(textInput({
    label: 'How long does it last?',
    section: 'chiefComplaint', field: 'symptomDuration',
    placeholder: 'e.g. constant, minutes, hours'
  }));

  card.appendChild(textInput({
    label: 'How severe is your symptom on a scale of 0-10?',
    section: 'chiefComplaint', field: 'severityScore',
    type: 'number', min: 0, max: 10, step: 1,
    hint: '0 = no symptoms, 10 = worst imaginable'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Upper GI Symptoms',
    description: 'Symptoms affecting the oesophagus and stomach.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have difficulty swallowing (dysphagia)?',
    section: 'upperGISymptoms', field: 'dysphagia', options: yesNo
  }));
  const dysphHost = document.createElement('div');
  dysphHost.dataset.conditional = 'upperGISymptoms.dysphagia=yes';
  dysphHost.appendChild(textInput({
    label: 'Please describe (solids, liquids, or both)',
    section: 'upperGISymptoms', field: 'dysphagiaDetails'
  }));
  card.appendChild(dysphHost);

  card.appendChild(radioGroup({
    label: 'Do you have pain on swallowing (odynophagia)?',
    section: 'upperGISymptoms', field: 'odynophagia', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do you experience heartburn or acid reflux?',
    section: 'upperGISymptoms', field: 'heartburn', options: yesNo
  }));
  const hbHost = document.createElement('div');
  hbHost.dataset.conditional = 'upperGISymptoms.heartburn=yes';
  hbHost.appendChild(textInput({
    label: 'How often?',
    section: 'upperGISymptoms', field: 'heartburnFrequency',
    placeholder: 'e.g. daily, weekly'
  }));
  card.appendChild(hbHost);

  card.appendChild(radioGroup({
    label: 'Do you experience nausea?',
    section: 'upperGISymptoms', field: 'nausea', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do you experience vomiting?',
    section: 'upperGISymptoms', field: 'vomiting', options: yesNo
  }));
  const vomitHost = document.createElement('div');
  vomitHost.dataset.conditional = 'upperGISymptoms.vomiting=yes';
  vomitHost.appendChild(textArea({
    label: 'Describe the vomiting (frequency, blood present, etc.)',
    section: 'upperGISymptoms', field: 'vomitingDetails'
  }));
  card.appendChild(vomitHost);

  card.appendChild(radioGroup({
    label: 'Do you feel full quickly after eating (early satiety)?',
    section: 'upperGISymptoms', field: 'earlySatiety', options: yesNo
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Lower GI Symptoms',
    description: 'Symptoms affecting the bowel and rectum.'
  });

  card.appendChild(radioGroup({
    label: 'Have you noticed a change in your bowel habit?',
    section: 'lowerGISymptoms', field: 'bowelHabitChange', options: yesNo
  }));
  const bhHost = document.createElement('div');
  bhHost.dataset.conditional = 'lowerGISymptoms.bowelHabitChange=yes';
  bhHost.appendChild(textArea({
    label: 'Please describe the change',
    section: 'lowerGISymptoms', field: 'bowelHabitDetails'
  }));
  card.appendChild(bhHost);

  card.appendChild(radioGroup({
    label: 'Do you have diarrhoea?',
    section: 'lowerGISymptoms', field: 'diarrhoea', options: yesNo
  }));
  const diaHost = document.createElement('div');
  diaHost.dataset.conditional = 'lowerGISymptoms.diarrhoea=yes';
  diaHost.appendChild(textInput({
    label: 'How often?',
    section: 'lowerGISymptoms', field: 'diarrhoeaFrequency',
    placeholder: 'e.g. 5 times per day'
  }));
  card.appendChild(diaHost);

  card.appendChild(radioGroup({
    label: 'Do you have constipation?',
    section: 'lowerGISymptoms', field: 'constipation', options: yesNo
  }));
  const conHost = document.createElement('div');
  conHost.dataset.conditional = 'lowerGISymptoms.constipation=yes';
  conHost.appendChild(textInput({
    label: 'Please describe',
    section: 'lowerGISymptoms', field: 'constipationDetails',
    placeholder: 'e.g. once per week'
  }));
  card.appendChild(conHost);

  card.appendChild(radioGroup({
    label: 'Have you noticed any rectal bleeding?',
    section: 'lowerGISymptoms', field: 'rectalBleeding', options: yesNo
  }));
  const blHost = document.createElement('div');
  blHost.dataset.conditional = 'lowerGISymptoms.rectalBleeding=yes';
  blHost.appendChild(textArea({
    label: 'Describe the bleeding (colour, amount, frequency)',
    section: 'lowerGISymptoms', field: 'rectalBleedingDetails'
  }));
  card.appendChild(blHost);

  card.appendChild(radioGroup({
    label: 'Do you have a feeling of incomplete evacuation (tenesmus)?',
    section: 'lowerGISymptoms', field: 'tenesmus', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Bristol Stool Scale — what best describes your usual stool?',
    section: 'lowerGISymptoms', field: 'bristolStoolType',
    options: [
      { value: '1', label: 'Type 1 - Separate hard lumps' },
      { value: '2', label: 'Type 2 - Lumpy, sausage-shaped' },
      { value: '3', label: 'Type 3 - Sausage with cracks' },
      { value: '4', label: 'Type 4 - Smooth, soft sausage' },
      { value: '5', label: 'Type 5 - Soft blobs with clear edges' },
      { value: '6', label: 'Type 6 - Fluffy, mushy pieces' },
      { value: '7', label: 'Type 7 - Entirely liquid' }
    ],
    hintId: 'bristol-hint'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Abdominal Pain Assessment',
    description: 'Detailed characterisation of abdominal pain.'
  });

  card.appendChild(selectInput({
    label: 'Where is the pain located?',
    section: 'abdominalPainAssessment', field: 'painLocation',
    options: abdominalLocations
  }));

  card.appendChild(selectInput({
    label: 'What is the character of the pain?',
    section: 'abdominalPainAssessment', field: 'painCharacter',
    options: [
      { value: 'cramping', label: 'Cramping' },
      { value: 'burning', label: 'Burning' },
      { value: 'sharp', label: 'Sharp' },
      { value: 'dull', label: 'Dull' },
      { value: 'colicky', label: 'Colicky (comes in waves)' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Does the pain radiate anywhere?',
    section: 'abdominalPainAssessment', field: 'painRadiation',
    placeholder: 'e.g. to the back, shoulder'
  }));

  card.appendChild(textArea({
    label: 'What makes the pain worse (aggravating factors)?',
    section: 'abdominalPainAssessment', field: 'aggravatingFactors',
    placeholder: 'e.g. eating, lying down, certain foods'
  }));

  card.appendChild(textArea({
    label: 'What makes the pain better (relieving factors)?',
    section: 'abdominalPainAssessment', field: 'relievingFactors',
    placeholder: 'e.g. antacids, fasting, certain positions'
  }));

  card.appendChild(radioGroup({
    label: 'How often does the pain occur?',
    section: 'abdominalPainAssessment', field: 'painFrequency',
    options: [
      { value: 'constant', label: 'Constant' },
      { value: 'intermittent', label: 'Intermittent' },
      { value: 'episodic', label: 'Episodic' }
    ]
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Liver & Pancreas',
    description: 'Hepatobiliary and pancreatic symptoms.'
  });

  card.appendChild(radioGroup({
    label: 'Have you noticed yellowing of the skin or eyes (jaundice)?',
    section: 'liverPancreas', field: 'jaundice', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have you noticed dark-coloured urine?',
    section: 'liverPancreas', field: 'darkUrine', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have you noticed pale or clay-coloured stools?',
    section: 'liverPancreas', field: 'paleStools', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'How would you describe your alcohol intake?',
    section: 'liverPancreas', field: 'alcoholIntake',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional (1-7 units/week)' },
      { value: 'moderate', label: 'Moderate (8-14 units/week)' },
      { value: 'heavy', label: 'Heavy (>14 units/week)' }
    ]
  }));
  const unitsHost = document.createElement('div');
  unitsHost.dataset.conditionalNotEmpty = 'liverPancreas.alcoholIntake';
  unitsHost.dataset.conditionalExclude = 'none';
  unitsHost.appendChild(textInput({
    label: 'Units per week',
    section: 'liverPancreas', field: 'alcoholUnitsPerWeek',
    type: 'number', min: 0, max: 200
  }));
  card.appendChild(unitsHost);

  card.appendChild(radioGroup({
    label: 'Have you been exposed to hepatitis (e.g. travel, contact, injection)?',
    section: 'liverPancreas', field: 'hepatitisExposure', options: yesNo
  }));
  const hepHost = document.createElement('div');
  hepHost.dataset.conditional = 'liverPancreas.hepatitisExposure=yes';
  hepHost.appendChild(textInput({
    label: 'Please provide details',
    section: 'liverPancreas', field: 'hepatitisDetails'
  }));
  card.appendChild(hepHost);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Previous GI History',
    description: 'Previous gastroenterological investigations and diagnoses.'
  });

  card.appendChild(radioGroup({
    label: 'Have you had an endoscopy (camera down the throat)?',
    section: 'previousGIHistory', field: 'previousEndoscopy', options: yesNo
  }));
  const endoHost = document.createElement('div');
  endoHost.dataset.conditional = 'previousGIHistory.previousEndoscopy=yes';
  endoHost.appendChild(textArea({
    label: 'When and what were the findings?',
    section: 'previousGIHistory', field: 'endoscopyDetails'
  }));
  card.appendChild(endoHost);

  card.appendChild(radioGroup({
    label: 'Have you had a colonoscopy?',
    section: 'previousGIHistory', field: 'previousColonoscopy', options: yesNo
  }));
  const coloHost = document.createElement('div');
  coloHost.dataset.conditional = 'previousGIHistory.previousColonoscopy=yes';
  coloHost.appendChild(textArea({
    label: 'When and what were the findings?',
    section: 'previousGIHistory', field: 'colonoscopyDetails'
  }));
  card.appendChild(coloHost);

  card.appendChild(radioGroup({
    label: 'Have you had any previous GI surgery?',
    section: 'previousGIHistory', field: 'previousGISurgery', options: yesNo
  }));
  const surgHost = document.createElement('div');
  surgHost.dataset.conditional = 'previousGIHistory.previousGISurgery=yes';
  surgHost.appendChild(textArea({
    label: 'What surgery and when?',
    section: 'previousGIHistory', field: 'surgeryDetails'
  }));
  card.appendChild(surgHost);

  card.appendChild(radioGroup({
    label: 'Have you been diagnosed with inflammatory bowel disease (IBD)?',
    section: 'previousGIHistory', field: 'ibd', options: yesNo
  }));
  const ibdHost = document.createElement('div');
  ibdHost.dataset.conditional = 'previousGIHistory.ibd=yes';
  ibdHost.appendChild(selectInput({
    label: 'Which type?',
    section: 'previousGIHistory', field: 'ibdType',
    options: [
      { value: 'crohns', label: "Crohn's Disease" },
      { value: 'ulcerative-colitis', label: 'Ulcerative Colitis' }
    ]
  }));
  card.appendChild(ibdHost);

  card.appendChild(radioGroup({
    label: 'Have you been diagnosed with irritable bowel syndrome (IBS)?',
    section: 'previousGIHistory', field: 'ibs', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have you been diagnosed with coeliac disease?',
    section: 'previousGIHistory', field: 'celiacDisease', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Have you ever had polyps found?',
    section: 'previousGIHistory', field: 'polyps', options: yesNo
  }));
  const polypHost = document.createElement('div');
  polypHost.dataset.conditional = 'previousGIHistory.polyps=yes';
  polypHost.appendChild(textInput({
    label: 'Details (type, number, location)',
    section: 'previousGIHistory', field: 'polypDetails'
  }));
  card.appendChild(polypHost);

  card.appendChild(radioGroup({
    label: 'Have you ever been diagnosed with a GI cancer?',
    section: 'previousGIHistory', field: 'giCancer', options: yesNo
  }));
  const canHost = document.createElement('div');
  canHost.dataset.conditional = 'previousGIHistory.giCancer=yes';
  canHost.appendChild(textArea({
    label: 'Please provide details (type, treatment, when)',
    section: 'previousGIHistory', field: 'giCancerDetails'
  }));
  card.appendChild(canHost);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Current Medications',
    description: 'GI-related and other medications you are currently taking.'
  });

  card.appendChild(radioGroup({
    label: 'Are you taking proton pump inhibitors (PPIs) such as omeprazole, lansoprazole?',
    section: 'currentMedications', field: 'ppis', options: yesNo
  }));
  const ppiHost = document.createElement('div');
  ppiHost.dataset.conditional = 'currentMedications.ppis=yes';
  ppiHost.appendChild(textInput({
    label: 'Which PPI and dose?',
    section: 'currentMedications', field: 'ppiDetails'
  }));
  card.appendChild(ppiHost);

  card.appendChild(radioGroup({
    label: 'Are you taking antacids (e.g. Gaviscon, Rennie)?',
    section: 'currentMedications', field: 'antacids', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Are you taking laxatives?',
    section: 'currentMedications', field: 'laxatives', options: yesNo
  }));
  const laxHost = document.createElement('div');
  laxHost.dataset.conditional = 'currentMedications.laxatives=yes';
  laxHost.appendChild(textInput({
    label: 'Which laxative?',
    section: 'currentMedications', field: 'laxativeDetails'
  }));
  card.appendChild(laxHost);

  card.appendChild(radioGroup({
    label: 'Are you taking anti-diarrhoeal medication (e.g. loperamide)?',
    section: 'currentMedications', field: 'antiDiarrhoeals', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Are you on biologic therapy (e.g. infliximab, adalimumab)?',
    section: 'currentMedications', field: 'biologics', options: yesNo
  }));
  const bioHost = document.createElement('div');
  bioHost.dataset.conditional = 'currentMedications.biologics=yes';
  bioHost.appendChild(textInput({
    label: 'Which biologic?',
    section: 'currentMedications', field: 'biologicDetails'
  }));
  card.appendChild(bioHost);

  card.appendChild(radioGroup({
    label: 'Are you taking steroids (e.g. prednisolone, budesonide)?',
    section: 'currentMedications', field: 'steroids', options: yesNo
  }));
  const sterHost = document.createElement('div');
  sterHost.dataset.conditional = 'currentMedications.steroids=yes';
  sterHost.appendChild(textInput({
    label: 'Which steroid and dose?',
    section: 'currentMedications', field: 'steroidDetails'
  }));
  card.appendChild(sterHost);

  card.appendChild(radioGroup({
    label: 'Are you taking NSAIDs (e.g. ibuprofen, naproxen, aspirin)?',
    section: 'currentMedications', field: 'nsaids', options: yesNo
  }));
  const nsHost = document.createElement('div');
  nsHost.dataset.conditional = 'currentMedications.nsaids=yes';
  nsHost.appendChild(textInput({
    label: 'Which NSAID?',
    section: 'currentMedications', field: 'nsaidDetails'
  }));
  card.appendChild(nsHost);

  const otherHeader = document.createElement('div');
  otherHeader.className = 'list-section-header';
  otherHeader.innerHTML = `
    <h3>Other medications</h3>
    <p class="hint">Anything else you take regularly that is not listed above.</p>
  `;
  card.appendChild(otherHeader);
  card.appendChild(otherMedicationsEditor());

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Allergies & Diet',
    description: 'Drug allergies, food intolerances, and dietary restrictions.'
  });

  const drugHeader = document.createElement('div');
  drugHeader.className = 'list-section-header';
  drugHeader.innerHTML = '<h3>Drug allergies</h3>';
  card.appendChild(drugHeader);
  card.appendChild(drugAllergyEditor());

  card.appendChild(textArea({
    label: 'Do you have any food intolerances?',
    section: 'allergiesDiet', field: 'foodIntolerances',
    placeholder: 'e.g. spicy food, dairy, wheat'
  }));

  card.appendChild(textArea({
    label: 'Do you have any dietary restrictions?',
    section: 'allergiesDiet', field: 'dietaryRestrictions',
    placeholder: 'e.g. vegetarian, vegan, halal, kosher'
  }));

  card.appendChild(radioGroup({
    label: 'Do you have a gluten intolerance?',
    section: 'allergiesDiet', field: 'glutenIntolerance', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do you have a lactose intolerance?',
    section: 'allergiesDiet', field: 'lactoseIntolerance', options: yesNo
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Red Flags & Social History',
    description: 'Warning signs and lifestyle factors.'
  });

  card.appendChild(radioGroup({
    label: 'Have you experienced unexplained weight loss?',
    section: 'redFlagsSocial', field: 'unexplainedWeightLoss', options: yesNo
  }));
  const wtHost = document.createElement('div');
  wtHost.dataset.conditional = 'redFlagsSocial.unexplainedWeightLoss=yes';
  wtHost.appendChild(textInput({
    label: 'How much weight have you lost and over what period?',
    section: 'redFlagsSocial', field: 'weightLossAmount',
    placeholder: 'e.g. 5 kg in 3 months'
  }));
  card.appendChild(wtHost);

  card.appendChild(radioGroup({
    label: 'Has your appetite changed?',
    section: 'redFlagsSocial', field: 'appetiteChange', options: yesNo
  }));
  const apHost = document.createElement('div');
  apHost.dataset.conditional = 'redFlagsSocial.appetiteChange=yes';
  apHost.appendChild(textInput({
    label: 'Please describe the change',
    section: 'redFlagsSocial', field: 'appetiteDetails',
    placeholder: 'e.g. decreased appetite, loss of appetite'
  }));
  card.appendChild(apHost);

  card.appendChild(radioGroup({
    label: 'Does anyone in your family have a history of GI cancer?',
    section: 'redFlagsSocial', field: 'familyGICancer', options: yesNo
  }));
  const famHost = document.createElement('div');
  famHost.dataset.conditional = 'redFlagsSocial.familyGICancer=yes';
  famHost.appendChild(textArea({
    label: 'Please provide details (who, what type, age at diagnosis)',
    section: 'redFlagsSocial', field: 'familyCancerDetails'
  }));
  card.appendChild(famHost);

  card.appendChild(radioGroup({
    label: 'Do you smoke?',
    section: 'redFlagsSocial', field: 'smoking',
    options: [
      { value: 'current', label: 'Current smoker' },
      { value: 'ex', label: 'Ex-smoker' },
      { value: 'never', label: 'Never smoked' }
    ]
  }));
  const packHost = document.createElement('div');
  packHost.dataset.conditionalAny = 'redFlagsSocial.smoking=current,ex';
  packHost.appendChild(textInput({
    label: 'Pack-years',
    section: 'redFlagsSocial', field: 'smokingPackYears',
    type: 'number', min: 0, max: 200
  }));
  card.appendChild(packHost);

  card.appendChild(selectInput({
    label: 'How would you describe your alcohol use?',
    section: 'redFlagsSocial', field: 'alcoholUse',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'heavy', label: 'Heavy' }
    ]
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections + auto-calculated readouts
// ----------------------------------------------------------------------

function updateConditionalSections() {
  // Single-target equality: data-conditional="section.field=value"
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = state[section]?.[field];
    host.style.display = String(current) === target ? '' : 'none';
  });
  // Multi-target equality: data-conditional-any="section.field=a,b,c"
  document.querySelectorAll('[data-conditional-any]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-any');
    const [path, targetCsv] = expr.split('=');
    const [section, field] = path.split('.');
    const current = String(state[section]?.[field] ?? '');
    const targets = targetCsv.split(',');
    host.style.display = targets.includes(current) ? '' : 'none';
  });
  // "Truthy and not in exclude list":
  // data-conditional-not-empty="section.field"
  // data-conditional-exclude="excluded,values"
  document.querySelectorAll('[data-conditional-not-empty]').forEach((host) => {
    const path = host.getAttribute('data-conditional-not-empty');
    const exclude = (host.getAttribute('data-conditional-exclude') || '').split(',').filter(Boolean);
    const [section, field] = path.split('.');
    const current = state[section]?.[field];
    const visible = current !== '' && current !== null && current !== undefined && !exclude.includes(String(current));
    host.style.display = visible ? '' : 'none';
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
  const bristol = document.getElementById('bristol-hint');
  if (bristol) {
    const v = state.lowerGISymptoms.bristolStoolType;
    bristol.textContent = bristolStoolDescription(v);
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
  ['chiefComplaint', 'symptomLocation'],
  ['chiefComplaint', 'symptomOnset'],
  ['chiefComplaint', 'symptomDuration'],
  ['chiefComplaint', 'severityScore'],
  // Upper GI
  ['upperGISymptoms', 'dysphagia'],
  ['upperGISymptoms', 'odynophagia'],
  ['upperGISymptoms', 'heartburn'],
  ['upperGISymptoms', 'nausea'],
  ['upperGISymptoms', 'vomiting'],
  ['upperGISymptoms', 'earlySatiety'],
  // Lower GI
  ['lowerGISymptoms', 'bowelHabitChange'],
  ['lowerGISymptoms', 'diarrhoea'],
  ['lowerGISymptoms', 'constipation'],
  ['lowerGISymptoms', 'rectalBleeding'],
  ['lowerGISymptoms', 'tenesmus'],
  ['lowerGISymptoms', 'bristolStoolType'],
  // Abdominal pain
  ['abdominalPainAssessment', 'painLocation'],
  ['abdominalPainAssessment', 'painCharacter'],
  ['abdominalPainAssessment', 'painFrequency'],
  // Liver & pancreas
  ['liverPancreas', 'jaundice'],
  ['liverPancreas', 'darkUrine'],
  ['liverPancreas', 'paleStools'],
  ['liverPancreas', 'alcoholIntake'],
  ['liverPancreas', 'hepatitisExposure'],
  // Previous GI history
  ['previousGIHistory', 'previousEndoscopy'],
  ['previousGIHistory', 'previousColonoscopy'],
  ['previousGIHistory', 'previousGISurgery'],
  ['previousGIHistory', 'ibd'],
  ['previousGIHistory', 'ibs'],
  ['previousGIHistory', 'celiacDisease'],
  ['previousGIHistory', 'polyps'],
  ['previousGIHistory', 'giCancer'],
  // Current medications
  ['currentMedications', 'ppis'],
  ['currentMedications', 'antacids'],
  ['currentMedications', 'laxatives'],
  ['currentMedications', 'antiDiarrhoeals'],
  ['currentMedications', 'biologics'],
  ['currentMedications', 'steroids'],
  ['currentMedications', 'nsaids'],
  // Allergies & diet
  ['allergiesDiet', 'glutenIntolerance'],
  ['allergiesDiet', 'lactoseIntolerance'],
  // Red flags & social
  ['redFlagsSocial', 'unexplainedWeightLoss'],
  ['redFlagsSocial', 'appetiteChange'],
  ['redFlagsSocial', 'familyGICancer'],
  ['redFlagsSocial', 'smoking'],
  ['redFlagsSocial', 'alcoholUse']
];

function updateProgress() {
  let answered = 0;
  for (const [section, field] of TRACKED_FIELDS) {
    const v = state[section][field];
    if (v !== null && v !== undefined && v !== '') answered++;
  }
  const total = TRACKED_FIELDS.length;
  const percent = Math.round((answered / total) * 100);
  const bar = document.getElementById('progress-bar-fill');
  const text = document.getElementById('progress-text');
  if (bar) bar.style.width = `${percent}%`;
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  const aria = document.getElementById('progress-bar');
  if (aria) aria.setAttribute('aria-valuenow', String(percent));
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

  const { severityScore, severityLevel, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td class="num">+${r.points}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No scoring rules fired.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Description</th>
            <th scope="col">Points</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Gastroenterology Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>GI Symptom Severity Score</h3>
      <p class="severity-summary">
        <span class="severity-score-badge ${severityClass(severityLevel)}">${severityScore}</span>
        <span class="severity-level">${esc(severityLabel(severityLevel))}</span>
      </p>
      <p class="muted">Composite of ${firedRules.length} fired rule(s).</p>

      <h3>Fired scoring rules</h3>
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
  const { severityScore, severityLevel, firedRules } = calculateGISeverity(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    severityScore,
    severityLevel,
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

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'demographics', title: 'Demographics' },
  { step: 2, section: 'chiefComplaint', title: 'Chief Complaint' },
  { step: 3, section: 'upperGISymptoms', title: 'Upper GI Symptoms' },
  { step: 4, section: 'lowerGISymptoms', title: 'Lower GI Symptoms' },
  { step: 5, section: 'abdominalPainAssessment', title: 'Abdominal Pain Assessment' },
  { step: 6, section: 'liverPancreas', title: 'Liver & Pancreas' },
  { step: 7, section: 'previousGIHistory', title: 'Previous GI History' },
  { step: 8, section: 'currentMedications', title: 'Current Medications' },
  { step: 9, section: 'allergiesDiet', title: 'Allergies & Diet' },
  { step: 10, section: 'redFlagsSocial', title: 'Red Flags & Social History' }
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
