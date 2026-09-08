import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateREBA } from './reba-grader.js';
import { emptyAssessment, rebaActionLevel, rebaRiskClass, rebaRiskLevel } from './types.js';

// Ergonomic Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure REBA scoring engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'ergonomic-assessment.front-end-form-with-html.v1';

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
  slug: 'ergonomic-assessment',
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 10;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
 *
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
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
 *           max?: number, step?: number, unit?: string }} opts
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
 * Build a checkbox group bound to a string[] field.
 *
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[] }} opts
 */
function checkboxGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] || [];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'checkbox-group';
  list.setAttribute('role', 'group');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const cbId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.htmlFor = cbId;
    const checked = current.includes(option.value) ? ' checked' : '';
    label.innerHTML = `
      <input class="checkbox-input" type="checkbox" id="${cbId}" value="${esc(option.value)}"${checked}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      const arr = state[opts.section][opts.field];
      if (input.checked) {
        if (!arr.includes(option.value)) arr.push(option.value);
      } else {
        const idx = arr.indexOf(option.value);
        if (idx !== -1) arr.splice(idx, 1);
      }
      saveState(state);
      updateProgress();
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);
  return wrapper;
}

/**
 * Build a 0-10 pain-severity range slider with live readout.
 *
 * @param {{ label: string, section: string, field: string }} opts
 */
function rangeInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const initial = current == null ? 0 : current;
  const wrapper = document.createElement('div');
  wrapper.className = 'field range-field';
  wrapper.innerHTML = `
    <label for="${id}">${esc(opts.label)}</label>
    <input type="range" id="${id}" name="${id}" min="0" max="10" step="1"
           value="${initial}" class="range-input">
    <div class="range-row">
      <span>0 — None</span>
      <span class="range-value" id="${id}-value">${current == null ? 'N/A' : current}</span>
      <span>10 — Worst</span>
    </div>
  `;
  const inp = wrapper.querySelector('input');
  const display = wrapper.querySelector('.range-value');
  inp.addEventListener('input', () => {
    const v = Number(inp.value);
    display.textContent = String(v);
    setField(opts.section, opts.field, v);
  });
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
    description: 'Basic personal and employment information.'
  });

  const nameGrid = document.createElement('div');
  nameGrid.className = 'two-col';
  nameGrid.appendChild(textInput({
    label: 'First Name', section: 'demographics', field: 'firstName', required: true
  }));
  nameGrid.appendChild(textInput({
    label: 'Last Name', section: 'demographics', field: 'lastName', required: true
  }));
  card.appendChild(nameGrid);

  card.appendChild(textInput({
    label: 'Date of Birth', section: 'demographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));

  card.appendChild(radioGroup({
    label: 'Sex', section: 'demographics', field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Occupation', section: 'demographics', field: 'occupation',
    required: true,
    placeholder: 'e.g. Office worker, warehouse operative, nurse'
  }));

  const empGrid = document.createElement('div');
  empGrid.className = 'two-col';
  empGrid.appendChild(textInput({
    label: 'Employer', section: 'demographics', field: 'employer'
  }));
  empGrid.appendChild(textInput({
    label: 'Job Title', section: 'demographics', field: 'jobTitle', required: true
  }));
  card.appendChild(empGrid);

  card.appendChild(textInput({
    label: 'Years in Current Role', section: 'demographics', field: 'yearsInRole',
    type: 'number', min: 0, max: 60
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Workstation Setup',
    description: 'Evaluate your workstation configuration.'
  });

  card.appendChild(selectInput({
    label: 'Desk Height', section: 'workstationSetup', field: 'deskHeight',
    options: [
      { value: 'too-low', label: 'Too low' },
      { value: 'correct', label: 'Correct' },
      { value: 'too-high', label: 'Too high' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Chair Type', section: 'workstationSetup', field: 'chairType',
    options: [
      { value: 'fixed', label: 'Fixed (non-adjustable)' },
      { value: 'adjustable', label: 'Adjustable office chair' },
      { value: 'standing-desk', label: 'Standing desk / stool' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Is your chair adjustable (height, backrest, armrests)?',
    section: 'workstationSetup', field: 'chairAdjustability', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Monitor Position (distance)', section: 'workstationSetup', field: 'monitorPosition',
    options: [
      { value: 'too-close', label: 'Too close' },
      { value: 'correct', label: 'Correct' },
      { value: 'too-far', label: 'Too far' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Monitor Distance', section: 'workstationSetup', field: 'monitorDistance',
    options: [
      { value: 'less-than-40cm', label: 'Less than 40cm' },
      { value: '40-70cm', label: '40-70cm (recommended)' },
      { value: 'more-than-70cm', label: 'More than 70cm' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Monitor Height', section: 'workstationSetup', field: 'monitorHeight',
    options: [
      { value: 'below-eye-level', label: 'Below eye level' },
      { value: 'at-eye-level', label: 'At eye level (recommended)' },
      { value: 'above-eye-level', label: 'Above eye level' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Keyboard Placement', section: 'workstationSetup', field: 'keyboardPlacement',
    options: [
      { value: 'correct', label: 'Correct (elbows at 90 degrees)' },
      { value: 'too-high', label: 'Too high' },
      { value: 'too-far', label: 'Too far away' },
      { value: 'angled-incorrectly', label: 'Angled incorrectly' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Mouse Placement', section: 'workstationSetup', field: 'mousePlacement',
    options: [
      { value: 'beside-keyboard', label: 'Beside keyboard (correct)' },
      { value: 'too-far', label: 'Too far from keyboard' },
      { value: 'awkward-reach', label: 'Requires awkward reach' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Lighting', section: 'workstationSetup', field: 'lighting',
    options: [
      { value: 'adequate', label: 'Adequate' },
      { value: 'too-bright', label: 'Too bright' },
      { value: 'too-dim', label: 'Too dim' },
      { value: 'glare-present', label: 'Glare on screen' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Temperature', section: 'workstationSetup', field: 'temperature',
    options: [
      { value: 'comfortable', label: 'Comfortable' },
      { value: 'too-hot', label: 'Too hot' },
      { value: 'too-cold', label: 'Too cold' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Posture Assessment',
    description: 'REBA body-region posture assessment.'
  });

  card.appendChild(selectInput({
    label: 'Sitting Posture', section: 'postureAssessment', field: 'sittingPosture',
    options: [
      { value: 'upright', label: 'Upright (good posture)' },
      { value: 'slouched', label: 'Slouched' },
      { value: 'leaning-forward', label: 'Leaning forward' },
      { value: 'reclined', label: 'Reclined' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Standing Posture', section: 'postureAssessment', field: 'standingPosture',
    options: [
      { value: 'upright', label: 'Upright (balanced)' },
      { value: 'leaning', label: 'Leaning to one side' },
      { value: 'asymmetric', label: 'Asymmetric weight bearing' },
      { value: 'not-applicable', label: 'Not applicable (seated work)' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Neck Angle', section: 'postureAssessment', field: 'neckAngle',
    options: [
      { value: 'neutral', label: 'Neutral (0 degrees)' },
      { value: 'flexed-0-20', label: 'Flexed 0-20 degrees' },
      { value: 'flexed-20-plus', label: 'Flexed >20 degrees' },
      { value: 'extended', label: 'Extended (looking up)' },
      { value: 'twisted', label: 'Twisted or side-bending' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Trunk Angle', section: 'postureAssessment', field: 'trunkAngle',
    options: [
      { value: 'neutral', label: 'Neutral (upright)' },
      { value: 'flexed-0-20', label: 'Flexed 0-20 degrees' },
      { value: 'flexed-20-60', label: 'Flexed 20-60 degrees' },
      { value: 'flexed-60-plus', label: 'Flexed >60 degrees' },
      { value: 'twisted', label: 'Twisted or side-bending' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Shoulder Position', section: 'postureAssessment', field: 'shoulderPosition',
    options: [
      { value: 'neutral', label: 'Neutral (relaxed)' },
      { value: 'raised', label: 'Raised / hunched' },
      { value: 'abducted', label: 'Abducted (arms out)' },
      { value: 'flexed', label: 'Flexed forward' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Wrist Deviation', section: 'postureAssessment', field: 'wristDeviation',
    options: [
      { value: 'neutral', label: 'Neutral' },
      { value: 'flexed', label: 'Flexed (bent down)' },
      { value: 'extended', label: 'Extended (bent up)' },
      { value: 'ulnar-deviated', label: 'Ulnar deviation (pinky side)' },
      { value: 'radial-deviated', label: 'Radial deviation (thumb side)' }
    ]
  }));

  // Optional clinician-input REBA regional scores.
  const scoreBox = document.createElement('div');
  scoreBox.className = 'reba-scores-box';
  scoreBox.innerHTML = '<h3>REBA Regional Scores (optional clinician input)</h3>';

  const row1 = document.createElement('div');
  row1.className = 'three-col';
  row1.appendChild(textInput({
    label: 'Neck Score', section: 'postureAssessment', field: 'neckScore',
    type: 'number', min: 1, max: 6
  }));
  row1.appendChild(textInput({
    label: 'Trunk Score', section: 'postureAssessment', field: 'trunkScore',
    type: 'number', min: 1, max: 6
  }));
  row1.appendChild(textInput({
    label: 'Leg Score', section: 'postureAssessment', field: 'legScore',
    type: 'number', min: 1, max: 4
  }));
  scoreBox.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'three-col';
  row2.appendChild(textInput({
    label: 'Upper Arm Score', section: 'postureAssessment', field: 'upperArmScore',
    type: 'number', min: 1, max: 6
  }));
  row2.appendChild(textInput({
    label: 'Lower Arm Score', section: 'postureAssessment', field: 'lowerArmScore',
    type: 'number', min: 1, max: 3
  }));
  row2.appendChild(textInput({
    label: 'Wrist Score', section: 'postureAssessment', field: 'wristScore',
    type: 'number', min: 1, max: 4
  }));
  scoreBox.appendChild(row2);

  card.appendChild(scoreBox);
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Repetitive Tasks',
    description: 'Tasks performed repeatedly during work.'
  });

  card.appendChild(textArea({
    label: 'Describe the main repetitive task(s)',
    section: 'repetitiveTasks', field: 'taskDescription',
    placeholder: 'e.g. typing, mouse clicking, assembly line work…',
    rows: 3
  }));

  card.appendChild(selectInput({
    label: 'How often do you perform this task?',
    section: 'repetitiveTasks', field: 'frequency',
    options: [
      { value: 'rarely', label: 'Rarely (a few times per day)' },
      { value: 'occasionally', label: 'Occasionally (several times per day)' },
      { value: 'frequently', label: 'Frequently (most of the day)' },
      { value: 'constantly', label: 'Constantly (almost all day)' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Duration per session',
    section: 'repetitiveTasks', field: 'durationPerSession',
    options: [
      { value: 'less-than-1hr', label: 'Less than 1 hour' },
      { value: '1-2hrs', label: '1-2 hours' },
      { value: '2-4hrs', label: '2-4 hours' },
      { value: 'more-than-4hrs', label: 'More than 4 hours' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Force required for the task',
    section: 'repetitiveTasks', field: 'forceRequired',
    options: [
      { value: 'none', label: 'None / negligible' },
      { value: 'light', label: 'Light' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'heavy', label: 'Heavy' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Is there vibration exposure (e.g. power tools)?',
    section: 'repetitiveTasks', field: 'vibrationExposure', options: yesNo
  }));

  card.appendChild(textInput({
    label: 'Cycle time (seconds per repetition)',
    section: 'repetitiveTasks', field: 'cycleTimeSeconds',
    type: 'number', min: 0, max: 3600, unit: 's'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Manual Handling',
    description: 'Lifting, carrying, pushing and pulling tasks.'
  });

  card.appendChild(selectInput({
    label: 'How often do you lift objects?',
    section: 'manualHandling', field: 'liftingFrequency',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional (a few times per shift)' },
      { value: 'frequent', label: 'Frequent (regularly throughout shift)' },
      { value: 'constant', label: 'Constant (most of the shift)' }
    ]
  }));

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Typical load weight', section: 'manualHandling', field: 'loadWeightKg',
    type: 'number', min: 0, max: 200, unit: 'kg'
  }));
  grid.appendChild(textInput({
    label: 'Typical carry distance', section: 'manualHandling', field: 'carryDistanceMetres',
    type: 'number', min: 0, max: 500, unit: 'm'
  }));
  card.appendChild(grid);

  card.appendChild(selectInput({
    label: 'Push/pull forces required',
    section: 'manualHandling', field: 'pushPullForces',
    options: [
      { value: 'none', label: 'None' },
      { value: 'light', label: 'Light' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'heavy', label: 'Heavy' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Is team lifting available when needed?',
    section: 'manualHandling', field: 'teamLifting', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Are mechanical aids available (trolleys, hoists, etc.)?',
    section: 'manualHandling', field: 'mechanicalAidsAvailable', options: yesNo
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Current Symptoms',
    description: 'Pain and discomfort you are currently experiencing.'
  });

  card.appendChild(checkboxGroup({
    label: 'Where do you experience pain or discomfort? (select all that apply)',
    section: 'currentSymptoms', field: 'painLocations',
    options: [
      { value: 'neck', label: 'Neck' },
      { value: 'upper-back', label: 'Upper Back' },
      { value: 'lower-back', label: 'Lower Back' },
      { value: 'left-shoulder', label: 'Left Shoulder' },
      { value: 'right-shoulder', label: 'Right Shoulder' },
      { value: 'left-elbow', label: 'Left Elbow' },
      { value: 'right-elbow', label: 'Right Elbow' },
      { value: 'left-wrist-hand', label: 'Left Wrist/Hand' },
      { value: 'right-wrist-hand', label: 'Right Wrist/Hand' },
      { value: 'left-hip', label: 'Left Hip' },
      { value: 'right-hip', label: 'Right Hip' },
      { value: 'left-knee', label: 'Left Knee' },
      { value: 'right-knee', label: 'Right Knee' },
      { value: 'left-ankle-foot', label: 'Left Ankle/Foot' },
      { value: 'right-ankle-foot', label: 'Right Ankle/Foot' }
    ]
  }));

  card.appendChild(rangeInput({
    label: 'Pain Severity (0 = no pain, 10 = worst possible)',
    section: 'currentSymptoms', field: 'painSeverity'
  }));

  card.appendChild(textInput({
    label: 'When did symptoms start?',
    section: 'currentSymptoms', field: 'onsetDate', type: 'date'
  }));

  card.appendChild(selectInput({
    label: 'How long have you had these symptoms?',
    section: 'currentSymptoms', field: 'duration',
    options: [
      { value: 'less-than-1-week', label: 'Less than 1 week' },
      { value: '1-4-weeks', label: '1-4 weeks' },
      { value: '1-3-months', label: '1-3 months' },
      { value: '3-6-months', label: '3-6 months' },
      { value: 'more-than-6-months', label: 'More than 6 months' }
    ]
  }));

  card.appendChild(textArea({
    label: 'What makes the symptoms worse?',
    section: 'currentSymptoms', field: 'aggravatingFactors',
    placeholder: 'e.g. prolonged sitting, typing, lifting…', rows: 2
  }));

  card.appendChild(textArea({
    label: 'What helps relieve the symptoms?',
    section: 'currentSymptoms', field: 'relievingFactors',
    placeholder: 'e.g. stretching, breaks, heat packs…', rows: 2
  }));

  card.appendChild(selectInput({
    label: 'Impact on your ability to work',
    section: 'currentSymptoms', field: 'impactOnWork',
    options: [
      { value: 'none', label: 'No impact' },
      { value: 'mild', label: 'Mild — can work with minor discomfort' },
      { value: 'moderate', label: 'Moderate — work is affected' },
      { value: 'severe', label: 'Severe — significantly limited' },
      { value: 'unable-to-work', label: 'Unable to work' }
    ]
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Medical History',
    description: 'Relevant musculoskeletal and medical history.'
  });

  card.appendChild(checkboxGroup({
    label: 'Musculoskeletal conditions (select all that apply)',
    section: 'medicalHistory', field: 'musculoskeletalConditions',
    options: [
      { value: 'osteoarthritis', label: 'Osteoarthritis' },
      { value: 'rheumatoid-arthritis', label: 'Rheumatoid Arthritis' },
      { value: 'fibromyalgia', label: 'Fibromyalgia' },
      { value: 'disc-herniation', label: 'Disc Herniation' },
      { value: 'tendinitis', label: 'Tendinitis' },
      { value: 'bursitis', label: 'Bursitis' },
      { value: 'scoliosis', label: 'Scoliosis' },
      { value: 'osteoporosis', label: 'Osteoporosis' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Previous injuries',
    section: 'medicalHistory', field: 'previousInjuries', rows: 2
  }));

  card.appendChild(textArea({
    label: 'Surgeries',
    section: 'medicalHistory', field: 'surgeries', rows: 2
  }));

  card.appendChild(radioGroup({
    label: 'Chronic pain',
    section: 'medicalHistory', field: 'chronicPain', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'RSI / Carpal Tunnel Syndrome',
    section: 'medicalHistory', field: 'rsiCarpalTunnel', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Back problems',
    section: 'medicalHistory', field: 'backProblems', options: yesNo
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Current Interventions',
    description: 'Ergonomic aids and treatments currently in use.'
  });

  card.appendChild(checkboxGroup({
    label: 'Ergonomic equipment in use (select all that apply)',
    section: 'currentInterventions', field: 'ergonomicEquipment',
    options: [
      { value: 'ergonomic-chair', label: 'Ergonomic Chair' },
      { value: 'standing-desk', label: 'Standing Desk' },
      { value: 'monitor-arm', label: 'Monitor Arm' },
      { value: 'keyboard-tray', label: 'Keyboard Tray' },
      { value: 'wrist-rest', label: 'Wrist Rest' },
      { value: 'footrest', label: 'Footrest' },
      { value: 'document-holder', label: 'Document Holder' },
      { value: 'back-support', label: 'Lumbar Back Support' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Receiving physiotherapy?',
    section: 'currentInterventions', field: 'physiotherapy', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Receiving occupational therapy?',
    section: 'currentInterventions', field: 'occupationalTherapy', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Current workplace adjustments',
    section: 'currentInterventions', field: 'workplaceAdjustments',
    placeholder: 'e.g. modified duties, reduced hours, alternative tasks…',
    rows: 2
  }));

  card.appendChild(textArea({
    label: 'Current medications for pain/condition',
    section: 'currentInterventions', field: 'medications',
    placeholder: 'e.g. ibuprofen, paracetamol, prescription medications…',
    rows: 2
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Psychosocial Factors',
    description: 'Work-environment and wellbeing factors.'
  });

  card.appendChild(selectInput({
    label: 'Job satisfaction',
    section: 'psychosocialFactors', field: 'jobSatisfaction',
    options: [
      { value: 'very-satisfied', label: 'Very satisfied' },
      { value: 'satisfied', label: 'Satisfied' },
      { value: 'neutral', label: 'Neutral' },
      { value: 'dissatisfied', label: 'Dissatisfied' },
      { value: 'very-dissatisfied', label: 'Very dissatisfied' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Workload',
    section: 'psychosocialFactors', field: 'workload',
    options: [
      { value: 'manageable', label: 'Manageable' },
      { value: 'slightly-heavy', label: 'Slightly heavy' },
      { value: 'heavy', label: 'Heavy' },
      { value: 'excessive', label: 'Excessive' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Stress level',
    section: 'psychosocialFactors', field: 'stressLevel',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high', label: 'High' },
      { value: 'very-high', label: 'Very high' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Breaks taken',
    section: 'psychosocialFactors', field: 'breaksTaken',
    options: [
      { value: 'regular', label: 'Regular' },
      { value: 'occasional', label: 'Occasional' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'none', label: 'None' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Autonomy over work',
    section: 'psychosocialFactors', field: 'autonomy',
    options: [
      { value: 'high', label: 'High' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'low', label: 'Low' },
      { value: 'none', label: 'None' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Employer support',
    section: 'psychosocialFactors', field: 'employerSupport',
    options: [
      { value: 'excellent', label: 'Excellent' },
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' },
      { value: 'poor', label: 'Poor' }
    ]
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Recommendations & Action Plan',
    description: 'Suggested changes and follow-up actions.'
  });

  card.appendChild(textArea({
    label: 'Equipment changes recommended',
    section: 'recommendations', field: 'equipmentChanges',
    placeholder: 'e.g. new ergonomic chair, monitor riser…', rows: 2
  }));

  card.appendChild(textArea({
    label: 'Workstation modifications',
    section: 'recommendations', field: 'workstationModifications',
    placeholder: 'e.g. desk height adjustment, lighting changes…', rows: 2
  }));

  card.appendChild(textArea({
    label: 'Training required',
    section: 'recommendations', field: 'trainingRequired',
    placeholder: 'e.g. manual handling training, DSE training…', rows: 2
  }));

  card.appendChild(textArea({
    label: 'Break schedule',
    section: 'recommendations', field: 'breakSchedule',
    placeholder: 'e.g. 5-min microbreak every 30 minutes…', rows: 2
  }));

  card.appendChild(textInput({
    label: 'Follow-up date',
    section: 'recommendations', field: 'followUpDate', type: 'date'
  }));

  card.appendChild(textArea({
    label: 'Referrals',
    section: 'recommendations', field: 'referrals',
    placeholder: 'e.g. physiotherapy, occupational health, GP…', rows: 2
  }));

  return card;
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
  ['demographics', 'occupation'],
  ['demographics', 'jobTitle'],
  // Workstation Setup
  ['workstationSetup', 'deskHeight'],
  ['workstationSetup', 'chairType'],
  ['workstationSetup', 'chairAdjustability'],
  ['workstationSetup', 'monitorPosition'],
  ['workstationSetup', 'monitorDistance'],
  ['workstationSetup', 'monitorHeight'],
  ['workstationSetup', 'keyboardPlacement'],
  ['workstationSetup', 'mousePlacement'],
  ['workstationSetup', 'lighting'],
  ['workstationSetup', 'temperature'],
  // Posture Assessment (categorical)
  ['postureAssessment', 'sittingPosture'],
  ['postureAssessment', 'standingPosture'],
  ['postureAssessment', 'neckAngle'],
  ['postureAssessment', 'trunkAngle'],
  ['postureAssessment', 'shoulderPosition'],
  ['postureAssessment', 'wristDeviation'],
  // Repetitive tasks
  ['repetitiveTasks', 'frequency'],
  ['repetitiveTasks', 'durationPerSession'],
  ['repetitiveTasks', 'forceRequired'],
  ['repetitiveTasks', 'vibrationExposure'],
  // Manual handling
  ['manualHandling', 'liftingFrequency'],
  ['manualHandling', 'pushPullForces'],
  ['manualHandling', 'teamLifting'],
  ['manualHandling', 'mechanicalAidsAvailable'],
  // Current symptoms
  ['currentSymptoms', 'painSeverity'],
  ['currentSymptoms', 'duration'],
  ['currentSymptoms', 'impactOnWork'],
  // Medical history
  ['medicalHistory', 'chronicPain'],
  ['medicalHistory', 'rsiCarpalTunnel'],
  ['medicalHistory', 'backProblems'],
  // Current interventions
  ['currentInterventions', 'physiotherapy'],
  ['currentInterventions', 'occupationalTherapy'],
  // Psychosocial factors
  ['psychosocialFactors', 'jobSatisfaction'],
  ['psychosocialFactors', 'workload'],
  ['psychosocialFactors', 'stressLevel'],
  ['psychosocialFactors', 'breaksTaken'],
  ['psychosocialFactors', 'autonomy'],
  ['psychosocialFactors', 'employerSupport']
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

  const { rebaScore, riskLevel, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td class="num">+${r.score}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No rules fired — minimal ergonomic risk detected.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">System</th>
            <th scope="col">Description</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Ergonomic Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>REBA Score</h3>
      <p class="reba-summary">
        <span class="reba-score-badge ${rebaRiskClass(rebaScore)}">${rebaScore} / 15</span>
        <span class="risk-level">${esc(riskLevel)}</span>
      </p>
      <p class="muted">${esc(rebaActionLevel(rebaScore))}.</p>

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
  const errs = validateForm();
  if (errs.length > 0) return;
  const { rebaScore, riskLevel, firedRules } = calculateREBA(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    rebaScore,
    riskLevel,
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'demographics', title: 'Demographics' },
  { step: 2, section: 'workstationSetup', title: 'Workstation Setup' },
  { step: 3, section: 'postureAssessment', title: 'Posture Assessment' },
  { step: 4, section: 'repetitiveTasks', title: 'Repetitive Tasks' },
  { step: 5, section: 'manualHandling', title: 'Manual Handling' },
  { step: 6, section: 'currentSymptoms', title: 'Current Symptoms' },
  { step: 7, section: 'medicalHistory', title: 'Medical History' },
  { step: 8, section: 'currentInterventions', title: 'Current Interventions' },
  { step: 9, section: 'psychosocialFactors', title: 'Psychosocial Factors' },
  { step: 10, section: 'recommendations', title: 'Recommendations & Action Plan' }
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
  renderStepList();
  renderForm();
  updateProgress();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
