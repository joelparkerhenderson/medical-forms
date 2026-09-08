import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateMMSE, domainBreakdown } from './mmse-grader.js';
import { mmseDomains } from './mmse-rules.js';
import { calculateAge, emptyAssessment, mmseCategory, mmseCategoryClass } from './types.js';

// Cognitive Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure MMSE scoring engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'cognitive-assessment.front-end-form-with-html.v1';

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
  slug: 'cognitive-assessment',
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

/** Escape user-entered text for safe rendering. */
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs progress + conditional visibility after each change.
 *
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

// ----------------------------------------------------------------------
// Component builders
// ----------------------------------------------------------------------

/**
 * Build a labelled text input.
 * @param {{ label: string, section: string, field: string, type?: string,
 *           placeholder?: string, required?: boolean }} opts
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

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    setField(opts.section, opts.field, input.value);
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
  const labelText = esc(opts.label);
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
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

/**
 * Build a single MMSE-item Correct (1) / Incorrect (0) radio row.
 * Stores numeric 0 or 1 directly on `state[section][field]`.
 *
 * @param {{ section: string, field: string, label: string, instruction?: string }} opts
 */
function mmseRadioItem(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field mmse-item radio-fieldset';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label mmse-item-label';
  legend.textContent = opts.label;
  wrapper.appendChild(legend);

  if (opts.instruction) {
    const inst = document.createElement('p');
    inst.className = 'mmse-item-instruction hint';
    inst.textContent = opts.instruction;
    wrapper.appendChild(inst);
  }

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', `${groupId}-fieldset`);

  const choices = [
    { value: 1, label: 'Correct (1)' },
    { value: 0, label: 'Incorrect (0)' }
  ];

  for (const choice of choices) {
    const radioId = `${groupId}-${choice.value}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
    label.htmlFor = radioId;
    const checked = current === choice.value ? ' checked' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${choice.value}"${checked}>
      <span>${esc(choice.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        setField(opts.section, opts.field, choice.value);
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
    `<span class="section-step">Step ${opts.stepNumber} of 10</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

function subgroupHeading(text) {
  const h = document.createElement('h3');
  h.className = 'subgroup-header';
  h.textContent = text;
  return h;
}

// ----------------------------------------------------------------------
// Section renderers (1 per MMSE step)
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

  card.appendChild(selectInput({
    label: 'Education Level',
    section: 'demographics',
    field: 'educationLevel',
    required: true,
    options: [
      { value: 'none', label: 'No formal education' },
      { value: 'primary', label: 'Primary school' },
      { value: 'secondary', label: 'Secondary school' },
      { value: 'university', label: 'University/College' },
      { value: 'postgraduate', label: 'Postgraduate' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Primary Language',
    section: 'demographics',
    field: 'primaryLanguage',
    placeholder: 'e.g., English, Spanish, Mandarin…',
    required: true
  }));

  card.appendChild(radioGroup({
    label: 'Handedness',
    section: 'demographics',
    field: 'handedness',
    options: [
      { value: 'right', label: 'Right' },
      { value: 'left', label: 'Left' },
      { value: 'ambidextrous', label: 'Ambidextrous' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Referral Information',
    description: 'Details about why and by whom the patient was referred.'
  });

  card.appendChild(selectInput({
    label: 'Referral Source',
    section: 'referralInformation',
    field: 'referralSource',
    required: true,
    options: [
      { value: 'gp', label: 'General Practitioner (GP)' },
      { value: 'neurologist', label: 'Neurologist' },
      { value: 'psychiatrist', label: 'Psychiatrist' },
      { value: 'geriatrician', label: 'Geriatrician' },
      { value: 'self', label: 'Self-referral' },
      { value: 'family', label: 'Family member' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Reason for Referral',
    section: 'referralInformation',
    field: 'referralReason',
    required: true,
    options: [
      { value: 'memory-concern', label: 'Memory concern' },
      { value: 'confusion', label: 'Confusion/disorientation' },
      { value: 'behavioural-change', label: 'Behavioural change' },
      { value: 'functional-decline', label: 'Functional decline' },
      { value: 'screening', label: 'Routine screening' },
      { value: 'follow-up', label: 'Follow-up assessment' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Referring Clinician',
    section: 'referralInformation',
    field: 'referringClinician',
    placeholder: 'Name of referring clinician'
  }));

  card.appendChild(textInput({
    label: 'Referral Date',
    section: 'referralInformation',
    field: 'referralDate',
    type: 'date'
  }));

  card.appendChild(radioGroup({
    label: 'Urgency',
    section: 'referralInformation',
    field: 'urgency',
    options: [
      { value: 'routine', label: 'Routine' },
      { value: 'urgent', label: 'Urgent' },
      { value: 'emergency', label: 'Emergency' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Has the patient had a previous cognitive assessment?',
    section: 'referralInformation',
    field: 'previousCognitiveAssessment',
    options: yesNo
  }));

  const prevDetails = document.createElement('div');
  prevDetails.dataset.conditional = 'referralInformation.previousCognitiveAssessment=yes';
  prevDetails.appendChild(textArea({
    label: 'Previous assessment details (date, score, findings)',
    section: 'referralInformation',
    field: 'previousAssessmentDetails',
    placeholder: 'e.g., MMSE 22/30 on 2025-01-15, mild impairment noted…'
  }));
  card.appendChild(prevDetails);

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Orientation',
    description: 'Orientation to time and place (10 points total).'
  });

  card.appendChild(subgroupHeading('Orientation to Time (5 points)'));
  const timeItems = [
    { key: 'year',   label: 'What year is it?' },
    { key: 'season', label: 'What season is it?' },
    { key: 'date',   label: 'What is the date today?' },
    { key: 'day',    label: 'What day of the week is it?' },
    { key: 'month',  label: 'What month is it?' }
  ];
  for (const item of timeItems) {
    card.appendChild(mmseRadioItem({
      section: 'orientationScores',
      field: item.key,
      label: item.label
    }));
  }

  card.appendChild(subgroupHeading('Orientation to Place (5 points)'));
  const placeItems = [
    { key: 'country',  label: 'What country are we in?' },
    { key: 'county',   label: 'What county/region are we in?' },
    { key: 'town',     label: 'What town/city are we in?' },
    { key: 'hospital', label: 'What building are we in?' },
    { key: 'floor',    label: 'What floor are we on?' }
  ];
  for (const item of placeItems) {
    card.appendChild(mmseRadioItem({
      section: 'orientationScores',
      field: item.key,
      label: item.label
    }));
  }

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Registration',
    description: 'Name three objects and ask the patient to repeat them (3 points). Record the number of trials needed to learn all three.'
  });

  const items = [
    { key: 'object1', label: 'Object 1', instruction: 'e.g., Apple' },
    { key: 'object2', label: 'Object 2', instruction: 'e.g., Table' },
    { key: 'object3', label: 'Object 3', instruction: 'e.g., Penny' }
  ];
  for (const item of items) {
    card.appendChild(mmseRadioItem({
      section: 'registrationScores',
      field: item.key,
      label: item.label,
      instruction: item.instruction
    }));
  }
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Attention & Calculation',
    description: 'Serial 7s: ask the patient to subtract 7 from 100 repeatedly (5 points). Alternative: spell WORLD backwards.'
  });

  const items = [
    { key: 'serial1', label: '100 - 7 = 93' },
    { key: 'serial2', label: '93 - 7 = 86' },
    { key: 'serial3', label: '86 - 7 = 79' },
    { key: 'serial4', label: '79 - 7 = 72' },
    { key: 'serial5', label: '72 - 7 = 65' }
  ];
  for (const item of items) {
    card.appendChild(mmseRadioItem({
      section: 'attentionScores',
      field: item.key,
      label: item.label
    }));
  }
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Recall',
    description: 'Ask the patient to recall the three objects named in the Registration step (3 points).'
  });

  const items = [
    { key: 'object1', label: 'Recall object 1' },
    { key: 'object2', label: 'Recall object 2' },
    { key: 'object3', label: 'Recall object 3' }
  ];
  for (const item of items) {
    card.appendChild(mmseRadioItem({
      section: 'recallScores',
      field: item.key,
      label: item.label
    }));
  }
  return card;
}

function renderStep7() {
  // Naming-only step: this mirrors the Svelte Step 7. In the engine,
  // the language scoring is stored in `repetitionCommands`. To match the
  // Svelte UI we record the naming inputs in `languageScores`.
  const card = sectionCard({
    stepNumber: 7,
    title: 'Language',
    description: 'Naming tasks (2 points). Show objects and ask the patient to name them.'
  });

  const items = [
    { key: 'naming1', label: 'Naming 1', instruction: 'Show a pencil. Ask: "What is this?"' },
    { key: 'naming2', label: 'Naming 2', instruction: 'Show a watch. Ask: "What is this?"' }
  ];
  for (const item of items) {
    card.appendChild(mmseRadioItem({
      section: 'languageScores',
      field: item.key,
      label: item.label,
      instruction: item.instruction
    }));
  }
  return card;
}

function renderStep8() {
  // Repetition, three-stage command, reading, and writing - scored into
  // `repetitionCommands` (which the grader uses for the language total).
  const card = sectionCard({
    stepNumber: 8,
    title: 'Repetition & Commands',
    description: 'Repetition (1 point), three-stage command (3 points), reading (1 point), and writing (1 point).'
  });

  card.appendChild(subgroupHeading('Repetition (1 point)'));
  card.appendChild(mmseRadioItem({
    section: 'repetitionCommands',
    field: 'repetition',
    label: 'Repetition',
    instruction: 'Ask patient to repeat: "No ifs, ands, or buts"'
  }));

  card.appendChild(subgroupHeading('Three-Stage Command (3 points)'));
  const commandItems = [
    { key: 'command1', label: 'Command 1', instruction: 'Take this paper in your right hand' },
    { key: 'command2', label: 'Command 2', instruction: 'Fold it in half' },
    { key: 'command3', label: 'Command 3', instruction: 'Put it on the floor' }
  ];
  for (const item of commandItems) {
    card.appendChild(mmseRadioItem({
      section: 'repetitionCommands',
      field: item.key,
      label: item.label,
      instruction: item.instruction
    }));
  }

  card.appendChild(subgroupHeading('Reading & Writing (2 points)'));
  card.appendChild(mmseRadioItem({
    section: 'repetitionCommands',
    field: 'reading',
    label: 'Reading',
    instruction: 'Show card: "CLOSE YOUR EYES". Ask patient to read and do what it says.'
  }));
  card.appendChild(mmseRadioItem({
    section: 'repetitionCommands',
    field: 'writing',
    label: 'Writing',
    instruction: 'Ask patient to write a sentence (must contain a subject and a verb, and make sense).'
  }));

  // Mirror naming from Step 7 into `repetitionCommands` so the grader can
  // pick them up. We do this on the fly via the live state; nothing needed
  // in the DOM, but we do make sure the grader sees them via syncNaming().
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Visuospatial',
    description: 'Ask the patient to copy intersecting pentagons (1 point). All 10 angles must be present and 2 must intersect.'
  });

  card.appendChild(mmseRadioItem({
    section: 'visuospatialScores',
    field: 'copying',
    label: 'Copy intersecting pentagons',
    instruction: 'Show the patient two intersecting pentagons and ask them to copy the design exactly. Score 1 point if all 10 angles are present and two shapes intersect.'
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Functional History',
    description: 'Activities of daily living, living situation, and support network.'
  });

  card.appendChild(selectInput({
    label: 'Living Arrangement',
    section: 'functionalHistory',
    field: 'livingArrangement',
    required: true,
    options: [
      { value: 'alone', label: 'Lives alone' },
      { value: 'with-spouse', label: 'Lives with spouse/partner' },
      { value: 'with-family', label: 'Lives with family' },
      { value: 'care-home', label: 'Care home/nursing home' },
      { value: 'assisted-living', label: 'Assisted living facility' }
    ]
  }));

  card.appendChild(subgroupHeading('Activities of Daily Living (ADLs)'));

  const adlOptions = [
    { value: 'independent', label: 'Independent' },
    { value: 'needs-some-help', label: 'Needs some help' },
    { value: 'needs-significant-help', label: 'Needs significant help' },
    { value: 'fully-dependent', label: 'Fully dependent' }
  ];
  const adls = [
    { key: 'adlBathing', label: 'Bathing' },
    { key: 'adlDressing', label: 'Dressing' },
    { key: 'adlMeals', label: 'Preparing Meals' },
    { key: 'adlMedications', label: 'Managing Medications' },
    { key: 'adlFinances', label: 'Managing Finances' },
    { key: 'adlTransport', label: 'Using Transport' }
  ];
  for (const a of adls) {
    card.appendChild(selectInput({
      label: a.label,
      section: 'functionalHistory',
      field: a.key,
      options: adlOptions
    }));
  }

  card.appendChild(textArea({
    label: 'Recent changes in function or behaviour',
    section: 'functionalHistory',
    field: 'recentChanges',
    placeholder: "Describe any recent changes in the patient's abilities, behaviour, or personality…"
  }));

  card.appendChild(textArea({
    label: 'Safety concerns',
    section: 'functionalHistory',
    field: 'safetyConerns',
    placeholder: 'e.g., leaving stove on, wandering, getting lost, falls, driving concerns…'
  }));

  card.appendChild(radioGroup({
    label: 'Are carers or support persons available?',
    section: 'functionalHistory',
    field: 'carersAvailable',
    options: yesNo
  }));

  const carerDetails = document.createElement('div');
  carerDetails.dataset.conditional = 'functionalHistory.carersAvailable=yes';
  carerDetails.appendChild(textArea({
    label: 'Carer details',
    section: 'functionalHistory',
    field: 'carerDetails',
    placeholder: 'Name and relationship of carer(s)…'
  }));
  card.appendChild(carerDetails);

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
}

// ----------------------------------------------------------------------
// Bridging Step 7 (languageScores.naming1/2) → grader (repetitionCommands)
// ----------------------------------------------------------------------

/** Copy `languageScores.naming1/naming2` into `repetitionCommands` so
 *  the grader (which reads `repetitionCommands` only) sees them. */
function syncNamingForGrader() {
  state.repetitionCommands.naming1 = state.languageScores.naming1;
  state.repetitionCommands.naming2 = state.languageScores.naming2;
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// All 30 MMSE items are tracked, plus a small set of demographic /
// functional fields the report depends on.
const TRACKED_FIELDS = [
  // Demographics core
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'educationLevel'],
  ['demographics', 'primaryLanguage'],
  // Referral core
  ['referralInformation', 'referralSource'],
  ['referralInformation', 'referralReason'],
  // Orientation - Time
  ['orientationScores', 'year'],
  ['orientationScores', 'season'],
  ['orientationScores', 'date'],
  ['orientationScores', 'day'],
  ['orientationScores', 'month'],
  // Orientation - Place
  ['orientationScores', 'country'],
  ['orientationScores', 'county'],
  ['orientationScores', 'town'],
  ['orientationScores', 'hospital'],
  ['orientationScores', 'floor'],
  // Registration
  ['registrationScores', 'object1'],
  ['registrationScores', 'object2'],
  ['registrationScores', 'object3'],
  // Attention
  ['attentionScores', 'serial1'],
  ['attentionScores', 'serial2'],
  ['attentionScores', 'serial3'],
  ['attentionScores', 'serial4'],
  ['attentionScores', 'serial5'],
  // Recall
  ['recallScores', 'object1'],
  ['recallScores', 'object2'],
  ['recallScores', 'object3'],
  // Naming (stored in languageScores for UI, mirrored to repetitionCommands)
  ['languageScores', 'naming1'],
  ['languageScores', 'naming2'],
  // Repetition / Commands / Reading / Writing
  ['repetitionCommands', 'repetition'],
  ['repetitionCommands', 'command1'],
  ['repetitionCommands', 'command2'],
  ['repetitionCommands', 'command3'],
  ['repetitionCommands', 'reading'],
  ['repetitionCommands', 'writing'],
  // Visuospatial
  ['visuospatialScores', 'copying'],
  // Functional history core
  ['functionalHistory', 'livingArrangement'],
  ['functionalHistory', 'carersAvailable']
];

// Map a section name to the step number it appears in (for step-list status).
const SECTION_TO_STEP = {
  demographics:          1,
  referralInformation:   2,
  orientationScores:     3,
  registrationScores:    4,
  attentionScores:       5,
  recallScores:          6,
  languageScores:        7,
  repetitionCommands:    8,
  visuospatialScores:    9,
  functionalHistory:     10
};

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

  const { mmseScore, mmseCategoryLabel, firedRules, additionalFlags, timestamp } = lastResult;
  const breakdown = domainBreakdown(state);
  const age = calculateAge(state.demographics.dateOfBirth);

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

  const breakdownRows = breakdown.map((d) => `
    <tr>
      <th scope="row">${esc(d.domain)}</th>
      <td class="num">${d.scored} / ${d.max}</td>
    </tr>
  `).join('');

  const firedRows = firedRules.length === 0
    ? `<p class="muted">No MMSE items scored as correct.</p>`
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
        <tbody>
          ${firedRules.map((r) => `
            <tr>
              <th scope="row">${esc(r.id)}</th>
              <td>${esc(r.domain)}</td>
              <td>${esc(r.description)}</td>
              <td class="num">${r.score} / 1</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

  const patientName = [state.demographics.firstName, state.demographics.lastName]
    .filter(Boolean).join(' ').trim();

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Cognitive Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
        ${patientName ? `<p class="muted">Patient: ${esc(patientName)}${age !== null ? ` (age ${age})` : ''}</p>` : ''}
      </header>

      <h3>MMSE Total Score</h3>
      <p class="mmse-summary">
        <span class="mmse-score-badge ${mmseCategoryClass(mmseScore)}">${mmseScore} / 30</span>
        <span class="mmse-category">${esc(mmseCategoryLabel)}</span>
      </p>
      <p class="muted">
        Categories: 24-30 normal · 18-23 mild · 10-17 moderate · 0-9 severe.
      </p>

      <h3>Domain breakdown</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Domain</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${breakdownRows}</tbody>
      </table>

      <h3>Items scored correct</h3>
      ${firedRows}

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
  const _errors = validateForm();
  if (_errors.length > 0) return;
  syncNamingForGrader();
  const { mmseScore, mmseCategoryLabel, firedRules } = calculateMMSE(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    mmseScore,
    mmseCategoryLabel,
    firedRules,
    additionalFlags,
    timestamp: new Date().toISOString()
  };
  saveState(state);
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
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics',         title: 'Demographics' },
  { step: 2,  section: 'referralInformation',  title: 'Referral' },
  { step: 3,  section: 'orientationScores',    title: 'Orientation' },
  { step: 4,  section: 'registrationScores',   title: 'Registration' },
  { step: 5,  section: 'attentionScores',      title: 'Attention' },
  { step: 6,  section: 'recallScores',         title: 'Recall' },
  { step: 7,  section: 'languageScores',       title: 'Language' },
  { step: 8,  section: 'repetitionCommands',   title: 'Repetition' },
  { step: 9,  section: 'visuospatialScores',   title: 'Visuospatial' },
  { step: 10, section: 'functionalHistory',    title: 'Functional History' }
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
  syncNamingForGrader();
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
