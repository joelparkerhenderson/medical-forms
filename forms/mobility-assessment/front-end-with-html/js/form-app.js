import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateTinetti } from './tinetti-grader.js';
import { emptyAssessment, tinettiCategory, tinettiCategoryClass, tugCategory } from './types.js';

// Mobility Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure Tinetti scoring engine and renders an inline report. State
// is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'mobility-assessment.front-end-form-with-html.v1';

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
  slug: 'mobility-assessment',
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
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
 * Build a radio group (single-select).
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[],
 *           valueType?: 'string' | 'number' }} opts
 */
function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const valueType = opts.valueType || 'string';
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
    const compareCurrent = current === null || current === undefined ? '' : String(current);
    const checked = compareCurrent === String(option.value) ? ' checked' : '';
    const requiredAttr = opts.required ? ' data-required' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}${requiredAttr}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        const v = valueType === 'number' ? Number(option.value) : option.value;
        setField(opts.section, opts.field, v);
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
 * Build a checkbox group (multi-select; bound to a string[] field).
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[] }} opts
 */
function checkboxGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  wrapper.appendChild(legend);

  const optionList = document.createElement('div');
  optionList.className = 'checkbox-group';
  optionList.setAttribute('role', 'group');
  optionList.setAttribute('aria-labelledby', wrapper.id);
  const arr = state[opts.section][opts.field];
  for (const option of opts.options) {
    const cbId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.htmlFor = cbId;
    const checked = arr.includes(option.value) ? ' checked' : '';
    label.innerHTML = `
      <input class="checkbox-input" type="checkbox" id="${cbId}" name="${cbId}" value="${esc(option.value)}"${checked}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      const target = state[opts.section][opts.field];
      const idx = target.indexOf(option.value);
      if (input.checked && idx === -1) target.push(option.value);
      if (!input.checked && idx !== -1) target.splice(idx, 1);
      saveState(state);
      updateProgress();
      updateConditionalSections();
    });
    optionList.appendChild(label);
  }
  wrapper.appendChild(optionList);
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
// Repeating-list editor (medications)
// ----------------------------------------------------------------------

function medicationListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.currentMedications.medications;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No medications added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row med-row';
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Lisinopril">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 10 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. OD, BD">
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

// ----------------------------------------------------------------------
// Section renderers (1 per Tinetti / mobility step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const score01 = [
  { value: '0', label: '0' },
  { value: '1', label: '1' }
];

const score02 = [
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' }
];

const romOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'mildly-limited', label: 'Mildly limited' },
  { value: 'moderately-limited', label: 'Moderately limited' },
  { value: 'severely-limited', label: 'Severely limited' }
];

const independenceLevels = [
  { value: 'independent', label: 'Independent' },
  { value: 'modified-independent', label: 'Modified Independent (device)' },
  { value: 'supervision', label: 'Supervision' },
  { value: 'minimal-assist', label: 'Minimal Assistance (25%)' },
  { value: 'moderate-assist', label: 'Moderate Assistance (50%)' },
  { value: 'maximal-assist', label: 'Maximal Assistance (75%)' },
  { value: 'dependent', label: 'Dependent (100%)' }
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

  const measurements = document.createElement('div');
  measurements.className = 'two-col';
  measurements.appendChild(textInput({
    label: 'Height',
    section: 'demographics',
    field: 'height',
    placeholder: 'e.g., 170 cm'
  }));
  measurements.appendChild(textInput({
    label: 'Weight',
    section: 'demographics',
    field: 'weight',
    placeholder: 'e.g., 75 kg'
  }));
  card.appendChild(measurements);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Referral Information',
    description: 'Details about the referral for mobility assessment.'
  });

  card.appendChild(textInput({
    label: 'Referring Provider',
    section: 'referralInfo',
    field: 'referringProvider',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Referral Date',
    section: 'referralInfo',
    field: 'referralDate',
    type: 'date'
  }));
  card.appendChild(textArea({
    label: 'Reason for Referral',
    section: 'referralInfo',
    field: 'referralReason',
    placeholder: 'Describe the reason for the mobility assessment referral…'
  }));
  card.appendChild(textInput({
    label: 'Primary Diagnosis',
    section: 'referralInfo',
    field: 'primaryDiagnosis'
  }));
  card.appendChild(textArea({
    label: 'Secondary Diagnoses',
    section: 'referralInfo',
    field: 'secondaryDiagnoses',
    placeholder: 'List any secondary diagnoses…'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Fall History',
    description: 'History of falls and fall risk factors.'
  });

  card.appendChild(textInput({
    label: 'Number of falls in the last 12 months',
    section: 'fallHistory',
    field: 'fallsLastYear',
    type: 'number', min: 0, max: 100
  }));
  card.appendChild(textInput({
    label: 'Date of Most Recent Fall',
    section: 'fallHistory',
    field: 'lastFallDate',
    type: 'date'
  }));
  card.appendChild(textArea({
    label: 'Circumstances of Falls',
    section: 'fallHistory',
    field: 'fallCircumstances',
    placeholder: 'Describe circumstances of any falls (location, activity, time of day)…'
  }));
  card.appendChild(textArea({
    label: 'Injuries from Falls',
    section: 'fallHistory',
    field: 'injuriesFromFalls',
    placeholder: 'Describe any injuries sustained from falls…'
  }));
  card.appendChild(radioGroup({
    label: 'Fear of Falling',
    section: 'fallHistory',
    field: 'fearOfFalling',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));
  card.appendChild(checkboxGroup({
    label: 'Fall Risk Factors',
    section: 'fallHistory',
    field: 'fallRiskFactors',
    options: [
      { value: 'vision-impairment', label: 'Vision impairment' },
      { value: 'hearing-impairment', label: 'Hearing impairment' },
      { value: 'peripheral-neuropathy', label: 'Peripheral neuropathy' },
      { value: 'orthostatic-hypotension', label: 'Orthostatic hypotension' },
      { value: 'cognitive-impairment', label: 'Cognitive impairment' },
      { value: 'urinary-urgency', label: 'Urinary urgency' },
      { value: 'environmental-hazards', label: 'Environmental hazards' },
      { value: 'footwear-issues', label: 'Inappropriate footwear' }
    ]
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Balance Assessment (Tinetti)',
    description: 'Tinetti Balance Test - 9 items, maximum 16 points.'
  });

  const hint = document.createElement('p');
  hint.className = 'scoring-hint';
  hint.textContent = 'Score each item per the Tinetti POMA scoring scheme. Higher scores indicate better balance.';
  card.appendChild(hint);

  const items = [
    { field: 'sittingBalance', options: score01,
      label: '1. Sitting Balance (0 = leans/slides, 1 = steady/safe)' },
    { field: 'risesFromChair', options: score02,
      label: '2. Rises from Chair (0 = unable without help, 1 = uses arms, 2 = without arms)' },
    { field: 'attemptingToRise', options: score02,
      label: '3. Attempting to Rise (0 = unable without help, 1 = requires >1 attempt, 2 = first attempt)' },
    { field: 'immediateStandingBalance', options: score02,
      label: '4. Immediate Standing Balance (0 = unsteady, 1 = steady with aid, 2 = steady without aid)' },
    { field: 'standingBalance', options: score02,
      label: '5. Standing Balance (0 = unsteady, 1 = wide stance/uses support, 2 = narrow stance without support)' },
    { field: 'nudgedBalance', options: score02,
      label: '6. Nudged (sternum push x3) (0 = begins to fall, 1 = staggers/grabs, 2 = steady)' },
    { field: 'eyesClosed', options: score01,
      label: '7. Eyes Closed (same position) (0 = unsteady, 1 = steady)' },
    { field: 'turning360', options: score02,
      label: '8. Turning 360 degrees (0 = discontinuous/unsteady, 1 = continuous or steady, 2 = continuous and steady)' },
    { field: 'sittingDown', options: score02,
      label: '9. Sitting Down (0 = unsafe, 1 = uses arms/not smooth, 2 = safe/smooth)' }
  ];

  for (const item of items) {
    card.appendChild(radioGroup({
      label: item.label,
      section: 'balanceAssessment',
      field: item.field,
      options: item.options,
      valueType: 'number'
    }));
  }

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Gait Assessment (Tinetti)',
    description: 'Tinetti Gait Test - 8 items, maximum 12 points.'
  });

  const hint = document.createElement('p');
  hint.className = 'scoring-hint';
  hint.textContent = 'Observe the patient walking 10 feet at usual pace, turning, and walking back. Higher scores indicate better gait.';
  card.appendChild(hint);

  const items = [
    { field: 'initiationOfGait', options: score01,
      label: '1. Initiation of Gait (0 = hesitancy/multiple attempts, 1 = no hesitancy)' },
    { field: 'stepLength', options: score01,
      label: '2. Step Length (right foot passes left) (0 = does not pass, 1 = passes)' },
    { field: 'stepHeight', options: score01,
      label: '3. Step Height (right foot clears floor) (0 = does not clear, 1 = clears)' },
    { field: 'stepSymmetry', options: score01,
      label: '4. Step Symmetry (0 = unequal, 1 = equal)' },
    { field: 'stepContinuity', options: score01,
      label: '5. Step Continuity (0 = stopping/discontinuity, 1 = continuous)' },
    { field: 'path', options: score02,
      label: '6. Path (over 10 feet) (0 = marked deviation, 1 = mild deviation/uses aid, 2 = straight without aid)' },
    { field: 'trunk', options: score02,
      label: '7. Trunk (0 = marked sway/uses aid, 1 = no sway but flexion/arms spread, 2 = no sway/flexion/arm spread)' },
    { field: 'walkingStance', options: score01,
      label: '8. Walking Stance (0 = heels apart, 1 = heels almost touching)' }
  ];

  for (const item of items) {
    card.appendChild(radioGroup({
      label: item.label,
      section: 'gaitAssessment',
      field: item.field,
      options: item.options,
      valueType: 'number'
    }));
  }

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Timed Up and Go (TUG)',
    description: 'Patient rises from chair, walks 3 metres, turns, walks back, and sits down.'
  });

  card.appendChild(textInput({
    label: 'Time to Complete',
    section: 'timedUpAndGo',
    field: 'timeSeconds',
    type: 'number', min: 0, max: 300, step: 0.1,
    unit: 'seconds',
    required: true
  }));

  const hint = document.createElement('div');
  hint.className = 'tug-hint';
  hint.innerHTML = `
    <p>TUG Interpretation:</p>
    <ul>
      <li>&lt;10 seconds: Freely mobile</li>
      <li>10-14 seconds: Mostly independent</li>
      <li>14-20 seconds: Variable mobility</li>
      <li>&gt;20 seconds: Impaired mobility</li>
    </ul>
  `;
  card.appendChild(hint);

  card.appendChild(radioGroup({
    label: 'Did the patient use an assistive device?',
    section: 'timedUpAndGo',
    field: 'usedAssistiveDevice',
    options: yesNo
  }));

  const deviceTypeHost = document.createElement('div');
  deviceTypeHost.dataset.conditional = 'timedUpAndGo.usedAssistiveDevice=yes';
  deviceTypeHost.appendChild(textInput({
    label: 'Device Type',
    section: 'timedUpAndGo',
    field: 'deviceType',
    placeholder: 'e.g., cane, walker, rollator…'
  }));
  card.appendChild(deviceTypeHost);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Range of Motion',
    description: 'Assess range of motion in lower extremities.'
  });

  const hipHeader = document.createElement('div');
  hipHeader.className = 'list-section-header';
  hipHeader.innerHTML = '<h3>Hip</h3>';
  card.appendChild(hipHeader);
  const hipGrid = document.createElement('div');
  hipGrid.className = 'two-col';
  hipGrid.appendChild(selectInput({ label: 'Hip Flexion', section: 'rangeOfMotion', field: 'hipFlexion', options: romOptions }));
  hipGrid.appendChild(selectInput({ label: 'Hip Extension', section: 'rangeOfMotion', field: 'hipExtension', options: romOptions }));
  card.appendChild(hipGrid);

  const kneeHeader = document.createElement('div');
  kneeHeader.className = 'list-section-header';
  kneeHeader.innerHTML = '<h3>Knee</h3>';
  card.appendChild(kneeHeader);
  const kneeGrid = document.createElement('div');
  kneeGrid.className = 'two-col';
  kneeGrid.appendChild(selectInput({ label: 'Knee Flexion', section: 'rangeOfMotion', field: 'kneeFlexion', options: romOptions }));
  kneeGrid.appendChild(selectInput({ label: 'Knee Extension', section: 'rangeOfMotion', field: 'kneeExtension', options: romOptions }));
  card.appendChild(kneeGrid);

  const ankleHeader = document.createElement('div');
  ankleHeader.className = 'list-section-header';
  ankleHeader.innerHTML = '<h3>Ankle</h3>';
  card.appendChild(ankleHeader);
  const ankleGrid = document.createElement('div');
  ankleGrid.className = 'two-col';
  ankleGrid.appendChild(selectInput({ label: 'Ankle Dorsiflexion', section: 'rangeOfMotion', field: 'ankleFlexion', options: romOptions }));
  ankleGrid.appendChild(selectInput({ label: 'Ankle Plantarflexion', section: 'rangeOfMotion', field: 'ankleExtension', options: romOptions }));
  card.appendChild(ankleGrid);

  card.appendChild(textArea({
    label: 'Additional ROM Notes',
    section: 'rangeOfMotion',
    field: 'notes',
    placeholder: 'Any additional observations about range of motion…'
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Assistive Devices',
    description: 'Current and recommended mobility aids.'
  });

  card.appendChild(checkboxGroup({
    label: 'Current Assistive Devices',
    section: 'assistiveDevices',
    field: 'currentDevices',
    options: [
      { value: 'cane', label: 'Cane' },
      { value: 'quad-cane', label: 'Quad cane' },
      { value: 'walker', label: 'Walker' },
      { value: 'rollator', label: 'Rollator' },
      { value: 'wheelchair', label: 'Wheelchair' },
      { value: 'scooter', label: 'Scooter' },
      { value: 'crutches', label: 'Crutches' },
      { value: 'orthotics', label: 'Orthotics/Braces' },
      { value: 'none', label: 'None' }
    ]
  }));

  // Conditional block: shown when at least one device (other than 'none')
  // is selected. Visibility updated by updateConditionalSections().
  const fitHost = document.createElement('div');
  fitHost.dataset.conditionalFn = 'hasActiveDevice';
  fitHost.appendChild(radioGroup({
    label: 'Is the current device fit adequate?',
    section: 'assistiveDevices',
    field: 'deviceFitAdequate',
    options: yesNo
  }));
  fitHost.appendChild(textArea({
    label: 'Device Condition',
    section: 'assistiveDevices',
    field: 'deviceCondition',
    placeholder: 'Describe the condition of the current device(s)…'
  }));
  card.appendChild(fitHost);

  card.appendChild(textArea({
    label: 'Recommended Devices or Modifications',
    section: 'assistiveDevices',
    field: 'recommendedDevices',
    placeholder: 'Any recommended assistive devices or modifications…'
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Current Medications',
    description: 'List all current medications, especially those affecting fall risk.'
  });

  const medsHeader = document.createElement('div');
  medsHeader.className = 'list-section-header';
  medsHeader.innerHTML = `
    <h3>All Current Medications</h3>
    <p class="hint">Add each prescribed medication, including over-the-counter regulars.</p>
  `;
  card.appendChild(medsHeader);
  card.appendChild(medicationListEditor());

  card.appendChild(checkboxGroup({
    label: 'Fall-Risk Medication Classes',
    section: 'currentMedications',
    field: 'fallRiskMedications',
    options: [
      { value: 'benzodiazepine', label: 'Benzodiazepines' },
      { value: 'opioid', label: 'Opioids' },
      { value: 'antihistamine', label: 'Antihistamines' },
      { value: 'antipsychotic', label: 'Antipsychotics' },
      { value: 'antihypertensive', label: 'Antihypertensives' },
      { value: 'diuretic', label: 'Diuretics' },
      { value: 'sedative', label: 'Sedatives/Hypnotics' },
      { value: 'antidepressant', label: 'Antidepressants' },
      { value: 'anticonvulsant', label: 'Anticonvulsants' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Recent Medication Changes',
    section: 'currentMedications',
    field: 'recentMedicationChanges',
    placeholder: 'Describe any recent changes to medications…'
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Functional Independence',
    description: 'Assess level of independence in daily mobility tasks.'
  });

  card.appendChild(selectInput({
    label: 'Transfers (bed, chair, toilet)',
    section: 'functionalIndependence',
    field: 'transfers',
    options: independenceLevels
  }));
  card.appendChild(selectInput({
    label: 'Ambulation',
    section: 'functionalIndependence',
    field: 'ambulation',
    options: independenceLevels
  }));
  card.appendChild(selectInput({
    label: 'Stairs',
    section: 'functionalIndependence',
    field: 'stairs',
    options: independenceLevels
  }));
  card.appendChild(selectInput({
    label: 'Bathing',
    section: 'functionalIndependence',
    field: 'bathing',
    options: independenceLevels
  }));
  card.appendChild(selectInput({
    label: 'Dressing (lower body)',
    section: 'functionalIndependence',
    field: 'dressing',
    options: independenceLevels
  }));
  card.appendChild(textArea({
    label: 'Additional Notes',
    section: 'functionalIndependence',
    field: 'additionalNotes',
    placeholder: 'Any additional observations about functional independence…'
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
  document.querySelectorAll('[data-conditional-fn]').forEach((host) => {
    const fnName = host.getAttribute('data-conditional-fn');
    let visible = false;
    if (fnName === 'hasActiveDevice') {
      const devs = state.assistiveDevices.currentDevices;
      visible = devs.length > 0 && !devs.includes('none');
    }
    host.style.display = visible ? '' : 'none';
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
  ['demographics', 'height'],
  ['demographics', 'weight'],
  // Referral information
  ['referralInfo', 'referringProvider'],
  ['referralInfo', 'referralDate'],
  ['referralInfo', 'referralReason'],
  ['referralInfo', 'primaryDiagnosis'],
  // Fall history
  ['fallHistory', 'fallsLastYear'],
  ['fallHistory', 'fearOfFalling'],
  // Balance Assessment (9 items)
  ['balanceAssessment', 'sittingBalance'],
  ['balanceAssessment', 'risesFromChair'],
  ['balanceAssessment', 'attemptingToRise'],
  ['balanceAssessment', 'immediateStandingBalance'],
  ['balanceAssessment', 'standingBalance'],
  ['balanceAssessment', 'nudgedBalance'],
  ['balanceAssessment', 'eyesClosed'],
  ['balanceAssessment', 'turning360'],
  ['balanceAssessment', 'sittingDown'],
  // Gait Assessment (8 items)
  ['gaitAssessment', 'initiationOfGait'],
  ['gaitAssessment', 'stepLength'],
  ['gaitAssessment', 'stepHeight'],
  ['gaitAssessment', 'stepSymmetry'],
  ['gaitAssessment', 'stepContinuity'],
  ['gaitAssessment', 'path'],
  ['gaitAssessment', 'trunk'],
  ['gaitAssessment', 'walkingStance'],
  // TUG
  ['timedUpAndGo', 'timeSeconds'],
  ['timedUpAndGo', 'usedAssistiveDevice'],
  // Range of motion (6 items)
  ['rangeOfMotion', 'hipFlexion'],
  ['rangeOfMotion', 'hipExtension'],
  ['rangeOfMotion', 'kneeFlexion'],
  ['rangeOfMotion', 'kneeExtension'],
  ['rangeOfMotion', 'ankleFlexion'],
  ['rangeOfMotion', 'ankleExtension'],
  // Functional independence (5 items)
  ['functionalIndependence', 'transfers'],
  ['functionalIndependence', 'ambulation'],
  ['functionalIndependence', 'stairs'],
  ['functionalIndependence', 'bathing'],
  ['functionalIndependence', 'dressing']
];

function isAnswered(v) {
  if (v === null || v === undefined || v === '') return false;
  if (Array.isArray(v) && v.length === 0) return false;
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
  // Bonus tracked: at least one current device selection counts as a field.
  sectionTotal['assistiveDevices'] = (sectionTotal['assistiveDevices'] || 0) + 1;
  if (state.assistiveDevices.currentDevices.length > 0) {
    answered++;
    sectionAnswered['assistiveDevices'] = (sectionAnswered['assistiveDevices'] || 0) + 1;
  }
  const total = TRACKED_FIELDS.length + 1;
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
  { step: 1,  section: 'demographics',           title: 'Demographics' },
  { step: 2,  section: 'referralInfo',           title: 'Referral' },
  { step: 3,  section: 'fallHistory',            title: 'Fall History' },
  { step: 4,  section: 'balanceAssessment',      title: 'Balance' },
  { step: 5,  section: 'gaitAssessment',         title: 'Gait' },
  { step: 6,  section: 'timedUpAndGo',           title: 'TUG' },
  { step: 7,  section: 'rangeOfMotion',          title: 'Range of Motion' },
  { step: 8,  section: 'assistiveDevices',       title: 'Assistive Devices' },
  { step: 9,  section: 'currentMedications',     title: 'Medications' },
  { step: 10, section: 'functionalIndependence', title: 'Functional Independence' }
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

  const {
    tinettiTotal,
    balanceScore,
    gaitScore,
    tinettiCategory: tinettiCategoryLabel,
    firedRules,
    additionalFlags,
    timestamp
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
      <td class="num">${r.score}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No items scored above zero.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Domain</th>
            <th scope="col">Item</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const tug = state.timedUpAndGo.timeSeconds;
  const tugLine = tug === null || tug === undefined
    ? '<p class="muted">TUG not assessed.</p>'
    : `<p class="muted">TUG: <strong>${esc(String(tug))}s</strong> — ${esc(tugCategory(tug))}.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Mobility Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Tinetti POMA Total</h3>
      <p class="tinetti-summary">
        <span class="tinetti-score-badge ${tinettiCategoryClass(tinettiTotal)}">${tinettiTotal} / 28</span>
        <span class="risk-level">${esc(tinettiCategoryLabel)}</span>
      </p>

      <div class="subscore-row">
        <div class="subscore-card">
          <div class="label">Balance subscore</div>
          <div class="value">${balanceScore} / 16</div>
        </div>
        <div class="subscore-card">
          <div class="label">Gait subscore</div>
          <div class="value">${gaitScore} / 12</div>
        </div>
      </div>
      ${tugLine}

      <h3>Per-item scores (above zero)</h3>
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
  const { tinettiTotal, balanceScore, gaitScore, tinettiCategoryLabel, firedRules } = calculateTinetti(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    tinettiTotal,
    balanceScore,
    gaitScore,
    tinettiCategory: tinettiCategoryLabel,
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
