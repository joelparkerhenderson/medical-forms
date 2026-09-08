import { gradeReview } from './grader.js';
import { emptyReview, functionalStatusClass, functionalStatusLabel, optimisationStatusClass, optimisationStatusLabel, pillarStatusLabel, priorityLabel, reviewStatusClass, reviewStatusLabel } from './types.js';

// Heart Failure Annual Review — single-page wizard (vanilla JavaScript, no
// build).
//
// One continuous single-page wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and live
// readouts update the NYHA functional status, the four-pillar medication-
// optimisation status, and the review-completeness status as the record is
// filled. Submission runs the pure classification engine (functional status,
// medication optimisation, review completeness, and safety flags) and renders
// an inline report. State is persisted to localStorage so a partial fill
// survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'heart-failure-review.front-end-with-html.v1';

/** @returns {import('./types.js').ReviewData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  // Merge over a fresh empty so any newly-added fields default correctly.
  const fresh = emptyReview();

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
    if (!raw) return emptyReview();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved review; starting fresh.', e);
    return emptyReview();
  }
}

/** @param {import('./types.js').ReviewData} s */
function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save review to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored review.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

/** @type {import('./types.js').ReviewData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'heart-failure-review',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const rep = document.getElementById('report');
    if (rep) rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    refreshLiveReadouts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 9;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/** Set a nested field, persist, and refresh progress / conditionals / readouts. */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  refreshLiveReadouts();
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
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
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
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      aria-describedby="${id}-error"
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
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current ?? '') ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${opts.required ? ' required data-required' : ''}>
      ${optionsHtml}
    </select>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => {
    let v = sel.value;
    if (opts.numeric) v = v === '' ? null : Number(v);
    setField(opts.section, opts.field, v);
    clearFieldError(id);
  });
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

function subGroup(title) {
  const el = document.createElement('div');
  el.className = 'field';
  el.innerHTML = `<span class="section-title">${esc(title)}</span>`;
  return el;
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
    `<span class="section-step">Step ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Shared option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const pillarStatusOptions = [
  { value: 'prescribed', label: 'Prescribed' },
  { value: 'not-prescribed', label: 'Not prescribed' },
  { value: 'contraindicated', label: 'Contraindicated' },
  { value: 'not-tolerated', label: 'Not tolerated' }
];

const adherenceOptions = [
  { value: 'good', label: 'Good' },
  { value: 'partial', label: 'Partial' },
  { value: 'poor', label: 'Poor' }
];

// ----------------------------------------------------------------------
// Section renderers (one per step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Review context',
    description: 'Who is reviewing, when, where, the review type, and the date of the last review.'
  });
  card.appendChild(textInput({
    label: 'Reviewing clinician name', section: 'context', field: 'clinicianName',
    required: true, placeholder: 'e.g. Sister J. Okoro'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role', section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'gp', label: 'General practitioner' },
      { value: 'practice-nurse', label: 'Practice nurse' },
      { value: 'hf-nurse', label: 'Heart-failure specialist nurse' },
      { value: 'pharmacist', label: 'Clinical pharmacist' },
      { value: 'cardiologist', label: 'Cardiologist' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Review date', section: 'context', field: 'reviewDate', type: 'date'
  }));
  card.appendChild(selectInput({
    label: 'Care setting', section: 'context', field: 'careSetting',
    options: [
      { value: 'general-practice', label: 'General practice' },
      { value: 'community-hf-service', label: 'Community heart-failure service' },
      { value: 'hospital-clinic', label: 'Hospital clinic' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Review type', section: 'context', field: 'reviewType',
    options: [
      { value: 'routine-annual', label: 'Routine annual' },
      { value: 'post-discharge', label: 'Post-discharge' },
      { value: 'medication-titration', label: 'Medication titration' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date of last review', section: 'context', field: 'lastReviewDate', type: 'date'
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient and diagnosis',
    description: 'Patient identification and the established heart-failure diagnosis and subtype.'
  });
  card.appendChild(textInput({
    label: 'Patient identifier', section: 'identification', field: 'patientIdentifier',
    required: true, placeholder: 'e.g. NHS number or local ID'
  }));
  card.appendChild(selectInput({
    label: 'Age band', section: 'identification', field: 'ageBand',
    options: [
      { value: '18-39', label: '18–39' },
      { value: '40-59', label: '40–59' },
      { value: '60-79', label: '60–79' },
      { value: '>=80', label: '80 and over' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Sex', section: 'identification', field: 'sex',
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'intersex', label: 'Intersex' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Year of diagnosis', section: 'diagnosis', field: 'yearOfDiagnosis',
    type: 'number', min: 1950, max: 2100, step: 1, placeholder: 'e.g. 2019'
  }));
  card.appendChild(selectInput({
    label: 'Heart-failure type', section: 'diagnosis', field: 'heartFailureType', required: true,
    hint: 'Drives the indicated medication-pillar set: all four pillars for HFrEF; SGLT2 inhibitor for HFmrEF/HFpEF.',
    options: [
      { value: 'reduced', label: 'Reduced EF (HFrEF)' },
      { value: 'mildly-reduced', label: 'Mildly-reduced EF (HFmrEF)' },
      { value: 'preserved', label: 'Preserved EF (HFpEF)' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Most recent LVEF', section: 'diagnosis', field: 'latestLvef',
    type: 'number', min: 0, max: 100, step: 0.1, unit: '%'
  }));
  card.appendChild(textInput({
    label: 'Date of last echocardiogram', section: 'diagnosis', field: 'lastEchoDate', type: 'date'
  }));
  card.appendChild(selectInput({
    label: 'Aetiology', section: 'diagnosis', field: 'aetiology',
    options: [
      { value: 'ischaemic', label: 'Ischaemic' },
      { value: 'hypertensive', label: 'Hypertensive' },
      { value: 'valvular', label: 'Valvular' },
      { value: 'other', label: 'Other' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Functional status',
    description: 'NYHA class and symptoms. The NYHA class drives the functional-status classification.'
  });
  card.appendChild(selectInput({
    label: 'NYHA functional class', section: 'functional', field: 'nyhaClass',
    required: true, numeric: true,
    hint: 'I–II → stable, III → symptomatic, IV → advanced.',
    options: [
      { value: '1', label: 'I — no limitation of ordinary activity' },
      { value: '2', label: 'II — slight limitation; comfortable at rest' },
      { value: '3', label: 'III — marked limitation; less than ordinary activity causes symptoms' },
      { value: '4', label: 'IV — symptoms at rest' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Breathlessness', section: 'functional', field: 'breathlessness',
    options: [
      { value: 'none', label: 'None' },
      { value: 'on-exertion', label: 'On exertion' },
      { value: 'at-rest', label: 'At rest' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Orthopnoea', section: 'functional', field: 'orthopnoea', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Paroxysmal nocturnal dyspnoea', section: 'functional', field: 'paroxysmalNocturnalDyspnoea', options: yesNo
  }));
  card.appendChild(selectInput({
    label: 'Fatigue', section: 'functional', field: 'fatigue',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Change since last review', section: 'functional', field: 'changeSinceLastReview',
    options: [
      { value: 'improved', label: 'Improved' },
      { value: 'unchanged', label: 'Unchanged' },
      { value: 'worse', label: 'Worse' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Documented decompensation since last review', section: 'functional', field: 'decompensation', options: yesNo
  }));
  card.appendChild(readOnlyReadout({
    label: 'Derived NYHA functional status', id: 'functional-status-readout',
    render: renderFunctionalStatus
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Fluid status and observations',
    description: 'Weight, congestion signs, and vital signs.'
  });
  card.appendChild(textInput({
    label: 'Weight', section: 'fluid', field: 'weightKg', type: 'number', min: 0, max: 400, step: 0.1, unit: 'kg'
  }));
  card.appendChild(textInput({
    label: 'Weight change since last review', section: 'fluid', field: 'weightChangeKg',
    type: 'number', min: -50, max: 50, step: 0.1, unit: 'kg', hint: 'Positive = gain.'
  }));
  card.appendChild(selectInput({
    label: 'Peripheral oedema', section: 'fluid', field: 'peripheralOedema',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));
  card.appendChild(radioGroup({ label: 'Raised jugular venous pressure', section: 'fluid', field: 'raisedJvp', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Lung crackles', section: 'fluid', field: 'lungCrackles', options: yesNo }));
  card.appendChild(textInput({ label: 'Systolic blood pressure', section: 'fluid', field: 'systolicBloodPressure', type: 'number', min: 40, max: 300, step: 1, unit: 'mmHg' }));
  card.appendChild(textInput({ label: 'Diastolic blood pressure', section: 'fluid', field: 'diastolicBloodPressure', type: 'number', min: 20, max: 200, step: 1, unit: 'mmHg' }));
  card.appendChild(textInput({ label: 'Heart rate', section: 'fluid', field: 'heartRate', type: 'number', min: 20, max: 250, step: 1, unit: 'bpm' }));
  card.appendChild(selectInput({
    label: 'Heart rhythm', section: 'fluid', field: 'heartRhythm',
    options: [
      { value: 'sinus', label: 'Sinus' },
      { value: 'atrial-fibrillation', label: 'Atrial fibrillation' },
      { value: 'paced', label: 'Paced' },
      { value: 'other', label: 'Other' }
    ]
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Investigations',
    description: 'Natriuretic peptide, U&E and renal function, iron status, and glycaemic control.'
  });
  card.appendChild(textInput({ label: 'NT-proBNP', section: 'investigations', field: 'ntProBnp', type: 'number', min: 0, max: 100000, step: 1, unit: 'ng/L' }));
  card.appendChild(textInput({ label: 'Sodium', section: 'investigations', field: 'sodium', type: 'number', min: 100, max: 180, step: 0.1, unit: 'mmol/L' }));
  card.appendChild(textInput({ label: 'Potassium', section: 'investigations', field: 'potassium', type: 'number', min: 1, max: 9, step: 0.1, unit: 'mmol/L', hint: 'RAAS-inhibitor / MRA monitoring. Flags at > 5.5 (high) and < 3.5 (low).' }));
  card.appendChild(textInput({ label: 'Urea', section: 'investigations', field: 'urea', type: 'number', min: 0, max: 60, step: 0.1, unit: 'mmol/L' }));
  card.appendChild(textInput({ label: 'Creatinine', section: 'investigations', field: 'creatinine', type: 'number', min: 0, max: 2000, step: 1, unit: 'µmol/L' }));
  card.appendChild(textInput({ label: 'eGFR', section: 'investigations', field: 'egfr', type: 'number', min: 0, max: 200, step: 1, unit: 'mL/min/1.73m²', hint: 'Flags at < 30 (significant renal impairment).' }));
  card.appendChild(textInput({ label: 'Haemoglobin', section: 'investigations', field: 'haemoglobin', type: 'number', min: 30, max: 250, step: 1, unit: 'g/L' }));
  card.appendChild(textInput({ label: 'Ferritin', section: 'investigations', field: 'ferritin', type: 'number', min: 0, max: 5000, step: 1, unit: 'µg/L' }));
  card.appendChild(textInput({ label: 'Transferrin saturation', section: 'investigations', field: 'transferrinSaturation', type: 'number', min: 0, max: 100, step: 0.1, unit: '%' }));
  card.appendChild(textInput({ label: 'HbA1c', section: 'investigations', field: 'hba1c', type: 'number', min: 0, max: 200, step: 0.1, unit: 'mmol/mol' }));
  card.appendChild(textInput({ label: 'Date monitoring bloods taken', section: 'investigations', field: 'bloodsDate', type: 'date' }));
  return card;
}

/** Render the five fields for one medication pillar. */
function renderPillar(card, keyPrefix, title) {
  card.appendChild(subGroup(title));
  card.appendChild(selectInput({
    label: `${title} — status`, section: 'medication', field: `${keyPrefix}Status`,
    options: pillarStatusOptions
  }));
  card.appendChild(textInput({ label: `${title} — agent`, section: 'medication', field: `${keyPrefix}Agent`, placeholder: 'Agent name' }));
  card.appendChild(textInput({ label: `${title} — current dose`, section: 'medication', field: `${keyPrefix}Dose`, placeholder: 'e.g. 10 mg once daily' }));
  card.appendChild(radioGroup({ label: `${title} — at target dose`, section: 'medication', field: `${keyPrefix}AtTargetDose`, options: yesNo }));
  card.appendChild(selectInput({ label: `${title} — adherence`, section: 'medication', field: `${keyPrefix}Adherence`, options: adherenceOptions }));
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Medication optimisation',
    description: 'The four pillars of guideline-directed medical therapy, plus loop diuretic and other medications.'
  });
  renderPillar(card, 'raasInhibitor', 'ACEi / ARB / ARNI');
  renderPillar(card, 'betaBlocker', 'Beta-blocker');
  renderPillar(card, 'mra', 'MRA');
  renderPillar(card, 'sglt2Inhibitor', 'SGLT2 inhibitor');
  card.appendChild(subGroup('Other medications'));
  card.appendChild(textInput({ label: 'Loop diuretic — agent', section: 'medication', field: 'loopDiureticAgent', placeholder: 'e.g. furosemide' }));
  card.appendChild(textInput({ label: 'Loop diuretic — dose', section: 'medication', field: 'loopDiureticDose', placeholder: 'e.g. 40 mg once daily' }));
  card.appendChild(textArea({ label: 'Other relevant medications', section: 'medication', field: 'otherMedications', placeholder: 'Free-text list of other relevant medications.' }));
  card.appendChild(readOnlyReadout({
    label: 'Derived medication-optimisation status', id: 'optimisation-status-readout',
    render: renderOptimisationStatus
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Devices and procedures',
    description: 'Implanted cardiac devices and their check status.'
  });
  card.appendChild(radioGroup({ label: 'Implantable cardioverter-defibrillator (ICD)', section: 'devices', field: 'icd', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Cardiac resynchronisation therapy (CRT)', section: 'devices', field: 'crt', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Pacemaker', section: 'devices', field: 'pacemaker', options: yesNo }));
  card.appendChild(selectInput({
    label: 'Device check status', section: 'devices', field: 'deviceCheckStatus',
    options: [
      { value: 'up-to-date', label: 'Up to date' },
      { value: 'overdue', label: 'Overdue' },
      { value: 'not-applicable', label: 'Not applicable' }
    ]
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Vaccinations and self-management',
    description: 'Vaccination status, lifestyle, and self-management.'
  });
  card.appendChild(radioGroup({ label: 'Influenza vaccination up to date', section: 'vaccinations', field: 'influenzaVaccination', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Pneumococcal vaccination up to date', section: 'vaccinations', field: 'pneumococcalVaccination', options: yesNo }));
  card.appendChild(radioGroup({ label: 'COVID-19 vaccination up to date', section: 'vaccinations', field: 'covidVaccination', options: yesNo }));
  card.appendChild(selectInput({
    label: 'Smoking status', section: 'vaccinations', field: 'smokingStatus',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'ex', label: 'Ex-smoker' },
      { value: 'current', label: 'Current' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Alcohol use', section: 'vaccinations', field: 'alcoholStatus',
    options: [
      { value: 'none', label: 'None' },
      { value: 'within-limits', label: 'Within limits' },
      { value: 'above-limits', label: 'Above limits' }
    ]
  }));
  card.appendChild(radioGroup({ label: 'Monitors daily weights', section: 'vaccinations', field: 'dailyWeights', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Self-management plan in place', section: 'vaccinations', field: 'selfManagementPlan', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Cardiac rehabilitation attended / referred', section: 'vaccinations', field: 'cardiacRehab', options: yesNo }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Summary and plan',
    description: 'Live derived statuses and a free-text clinical note. Submit to generate the full report.'
  });
  card.appendChild(readOnlyReadout({ label: 'NYHA functional status', id: 'summary-functional-readout', render: renderFunctionalStatus }));
  card.appendChild(readOnlyReadout({ label: 'Medication-optimisation status', id: 'summary-optimisation-readout', render: renderOptimisationStatus }));
  card.appendChild(readOnlyReadout({ label: 'Review-completeness status', id: 'summary-review-readout', render: renderReviewStatus }));
  card.appendChild(textArea({
    label: 'Clinical note', section: 'summary', field: 'reviewContext',
    placeholder: 'Free-text review context: agreed actions, next review interval, and any escalation already actioned.'
  }));
  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

function badge(cls, text) {
  return `<span class="risk-badge ${cls}">${esc(text)}</span>`;
}

function renderFunctionalStatus() {
  const g = gradeReview(state);
  return badge(functionalStatusClass(g.functionalStatus), functionalStatusLabel(g.functionalStatus));
}

function renderOptimisationStatus() {
  const g = gradeReview(state);
  const o = g.medicationOptimisation;
  const detail = o.status === 'not-applicable'
    ? '<span class="muted">no indicated pillar set for this HF type</span>'
    : `<span class="muted">${o.prescribedPillars} of ${o.indicatedPillars} indicated pillars prescribed</span>`;
  return `${badge(optimisationStatusClass(o.status), optimisationStatusLabel(o.status))} ${detail}`;
}

function renderReviewStatus() {
  const g = gradeReview(state);
  return `${badge(reviewStatusClass(g.reviewStatus), reviewStatusLabel(g.reviewStatus))} <span class="muted">${g.completenessScore}% complete</span>`;
}

function refreshLiveReadouts() {
  const map = {
    'functional-status-readout': renderFunctionalStatus,
    'summary-functional-readout': renderFunctionalStatus,
    'optimisation-status-readout': renderOptimisationStatus,
    'summary-optimisation-readout': renderOptimisationStatus,
    'summary-review-readout': renderReviewStatus
  };
  for (const id of Object.keys(map)) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = map[id]();
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of
// [section, field] pairs; the slot counts as answered when ANY of its pairs is
// answered.
const STEP_SLOTS = {
  1: [[['context', 'clinicianName']], [['context', 'clinicianRole']], [['context', 'careSetting']]],
  2: [[['identification', 'patientIdentifier']], [['identification', 'ageBand']], [['diagnosis', 'heartFailureType']]],
  3: [[['functional', 'nyhaClass']], [['functional', 'breathlessness']], [['functional', 'fatigue']]],
  4: [[['fluid', 'weightKg']], [['fluid', 'peripheralOedema']], [['fluid', 'systolicBloodPressure']]],
  5: [[['investigations', 'potassium']], [['investigations', 'egfr']], [['investigations', 'ntProBnp']]],
  6: [[['medication', 'raasInhibitorStatus']], [['medication', 'betaBlockerStatus']], [['medication', 'mraStatus']], [['medication', 'sglt2InhibitorStatus']]],
  7: [[['devices', 'deviceCheckStatus']]],
  8: [[['vaccinations', 'influenzaVaccination']], [['vaccinations', 'selfManagementPlan']]],
  9: [[['summary', 'reviewContext']]]
};

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  let total = 0;
  const stepAnswered = {};
  const stepTotal = {};

  for (const step of Object.keys(STEP_SLOTS)) {
    const slots = STEP_SLOTS[step];
    stepTotal[step] = slots.length;
    stepAnswered[step] = 0;
    for (const slot of slots) {
      total++;
      const slotAnswered = slot.some(([s, f]) => isAnswered(s, f));
      if (slotAnswered) {
        answered++;
        stepAnswered[step]++;
      }
    }
  }

  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(stepAnswered, stepTotal);
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

  const {
    functionalStatus, medicationOptimisation, reviewStatus, completenessScore,
    domainStatuses, flaggedIssues, timestamp
  } = lastResult;

  const documented = domainStatuses.filter((d) => d.documented).length;

  const pillarRows = medicationOptimisation.pillars.map((p) => `
    <tr>
      <th scope="row">${esc(p.label)}${p.indicated ? '' : ' <span class="muted">(not indicated)</span>'}</th>
      <td>${esc(pillarStatusLabel(p.status))}</td>
    </tr>
  `).join('');

  const domainRows = domainStatuses.map((d) => `
    <tr>
      <th scope="row">${esc(d.label)}</th>
      <td>
        <span class="flag-badge ${d.documented ? 'flag-no' : 'flag-yes'}">
          ${d.documented ? 'Documented' : 'Outstanding'}
        </span>
      </td>
    </tr>
  `).join('');

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No safety flags raised.</p>`
    : `
      <ul class="flags">
        ${flaggedIssues.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority))}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}${f.suggestedAction ? ` — ${esc(f.suggestedAction)}` : ''}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const o = medicationOptimisation;
  const optimisationDetail = o.status === 'not-applicable'
    ? 'no indicated pillar set for this heart-failure type'
    : `${o.prescribedPillars} of ${o.indicatedPillars} indicated pillars prescribed`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Heart Failure Annual Review Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${functionalStatusClass(functionalStatus)}">
        <div>
          <span class="risk-banner-label">NYHA functional status</span>
          <span class="risk-banner-value">${esc(functionalStatusLabel(functionalStatus))}</span>
        </div>
      </div>

      <div class="risk-banner ${optimisationStatusClass(o.status)}">
        <div>
          <span class="risk-banner-label">Medication-optimisation status</span>
          <span class="risk-banner-value">${esc(optimisationStatusLabel(o.status))}</span>
        </div>
        <span class="risk-badge ${optimisationStatusClass(o.status)}">${esc(optimisationDetail)}</span>
      </div>

      <div class="risk-banner ${reviewStatusClass(reviewStatus)}">
        <div>
          <span class="risk-banner-label">Review completeness</span>
          <span class="risk-banner-value">${esc(reviewStatusLabel(reviewStatus))}</span>
        </div>
        <span class="risk-badge ${reviewStatusClass(reviewStatus)}">${completenessScore}% complete</span>
      </div>

      <h3>Four-pillar medical therapy</h3>
      <table class="subscales">
        <thead>
          <tr><th scope="col">Pillar</th><th scope="col">Status</th></tr>
        </thead>
        <tbody>${pillarRows}</tbody>
      </table>

      <h3>Review completeness</h3>
      <p>${documented === domainStatuses.length
        ? 'All six required review domains are documented.'
        : `<strong>${domainStatuses.length - documented}</strong> required domain(s) remain undocumented.`}</p>
      <table class="subscales">
        <thead>
          <tr><th scope="col">Review domain</th><th scope="col">Status</th></tr>
        </thead>
        <tbody>${domainRows}</tbody>
      </table>

      <h3>Flagged issues (${flaggedIssues.length})</h3>
      ${flagsList}

      <p class="muted">This is a documentation and status-classification report,
      not a diagnosis or a prescribing instrument. Use clinical judgement and
      escalate in line with local heart-failure policy.</p>

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
  lastResult = gradeReview(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh review?')) return;
  clearState();
  state = emptyReview();
  lastResult = null;
  const rep = document.getElementById('report');
  if (rep) rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  refreshLiveReadouts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, title: 'Context' },
  { step: 2, title: 'Patient & diagnosis' },
  { step: 3, title: 'Functional status' },
  { step: 4, title: 'Fluid status' },
  { step: 5, title: 'Investigations' },
  { step: 6, title: 'Medication' },
  { step: 7, title: 'Devices' },
  { step: 8, title: 'Vaccinations' },
  { step: 9, title: 'Summary' }
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

function updateStepListStatuses(stepAnswered, stepTotal) {
  const ol = document.getElementById('step-list');
  if (!ol) return;
  let firstUnfinished = -1;
  for (const def of STEP_DEFINITIONS) {
    const li = ol.querySelector(`[data-step="${def.step}"]`);
    if (!li) continue;
    const a = stepAnswered[def.step] || 0;
    const t = stepTotal[def.step] || 0;
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
    if (current.dataset.status === 'waiting') current.dataset.status = 'in-progress';
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
  const form = document.getElementById('review-form');
  if (!form) return errors;
  const required = form.querySelectorAll('input[data-required], select[data-required], textarea[data-required]');
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
      const labelText = label ? label.textContent.replace(/\s*\*\s*$/, '').trim() : id;
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
    errors.map((e) => `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`).join('') +
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  refreshLiveReadouts();
  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
