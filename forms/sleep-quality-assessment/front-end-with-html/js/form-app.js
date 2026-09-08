import { detectAdditionalFlags } from './flagged-issues.js';
import { calculatePSQI } from './psqi-grader.js';
import { emptyAssessment, psqiCategoryClass, sleepEfficiencyCalc } from './types.js';

// Sleep Quality Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page
// in document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure PSQI scoring engine and renders an inline report. State
// is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'sleep-quality-assessment.front-end-form-with-html.v1';

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

/** @param {import('./types.js').AssessmentData} s */
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
  slug: 'sleep-quality-assessment',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const report = document.getElementById('report');
    if (report) {
      report.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
    }
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    refreshAutoCalculatedReadouts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress
 * and refreshes the auto-calculated efficiency readout.
 *
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  refreshAutoCalculatedReadouts();
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
  wrapper.innerHTML =
    `<label class="label" for="${id}">${labelText}</label>` +
    `<input ${attrs.join(' ')}>` +
    (opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : '') +
    `<span class="error-message" id="${id}-error" aria-live="polite"></span>`;

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
  wrapper.innerHTML =
    `<label class="label" for="${id}">${labelText}</label>` +
    `<textarea id="${id}" name="${id}" rows="${opts.rows || 3}"` +
    (opts.placeholder ? ` placeholder="${esc(opts.placeholder)}"` : '') +
    ` aria-describedby="${id}-error"${requiredAttr}` +
    ` class="text-area-input">${esc(value)}</textarea>` +
    `<span class="error-message" id="${id}-error" aria-live="polite"></span>`;
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
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML =
    `<label class="label" for="${id}">${labelText}</label>` +
    `<select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${requiredAttr}>${optionsHtml}</select>` +
    `<span class="error-message" id="${id}-error" aria-live="polite"></span>`;
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
    label.innerHTML =
      `<input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}${requiredAttr}>` +
      `<span>${esc(option.label)}</span>`;
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
  const { html, cls } = opts.render();
  wrapper.innerHTML = `
    <label class="label">${esc(opts.label)}</label>
    <div id="${opts.id}" class="readout-value ${cls}">${html}</div>
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
    `<span class="section-step">Section ${opts.stepNumber} of 9</span>` +
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

const frequencyOptions = [
  { value: 'not-during-past-month', label: 'Not during the past month' },
  { value: 'less-than-once-week', label: 'Less than once a week' },
  { value: 'once-or-twice-week', label: 'Once or twice a week' },
  { value: 'three-or-more-week', label: 'Three or more times a week' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per PSQI step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic patient information.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'First Name', section: 'demographics', field: 'firstName', required: true
  }));
  grid.appendChild(textInput({
    label: 'Last Name', section: 'demographics', field: 'lastName', required: true
  }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Date of Birth', section: 'demographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));
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
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Sleep Habits',
    description: 'Your typical sleep patterns over the past month.'
  });

  card.appendChild(textInput({
    label: 'What time do you usually go to bed?',
    section: 'sleepHabits', field: 'usualBedtime',
    type: 'time', required: true
  }));
  card.appendChild(textInput({
    label: 'What time do you usually wake up?',
    section: 'sleepHabits', field: 'usualWakeTime',
    type: 'time', required: true
  }));
  card.appendChild(textInput({
    label: 'How many minutes does it usually take you to fall asleep?',
    section: 'sleepHabits', field: 'minutesToFallAsleep',
    type: 'number', min: 0, max: 360, step: 5, unit: 'minutes', required: true
  }));
  card.appendChild(textInput({
    label: 'How many hours of actual sleep do you get per night?',
    section: 'sleepHabits', field: 'hoursOfSleep',
    type: 'number', min: 0, max: 24, step: 0.5, unit: 'hours', required: true
  }));
  card.appendChild(selectInput({
    label: 'How would you rate your overall sleep environment?',
    section: 'sleepHabits', field: 'sleepEnvironment',
    required: true,
    options: [
      { value: 'excellent', label: 'Excellent — quiet, dark, comfortable' },
      { value: 'good', label: 'Good — mostly comfortable' },
      { value: 'fair', label: 'Fair — some issues with noise, light, or comfort' },
      { value: 'poor', label: 'Poor — significant issues affecting sleep' }
    ]
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Sleep Latency',
    description: 'How easily you fall asleep and stay asleep.'
  });
  card.appendChild(radioGroup({
    label: 'During the past month, how often have you had trouble falling asleep within 30 minutes?',
    section: 'sleepLatency', field: 'timeToFallAsleep',
    options: frequencyOptions, required: true
  }));
  card.appendChild(radioGroup({
    label: 'During the past month, how often have you woken up in the middle of the night or early morning?',
    section: 'sleepLatency', field: 'wakeUpDuringNight',
    options: frequencyOptions, required: true
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Sleep Duration',
    description: 'How much sleep you actually get.'
  });
  card.appendChild(textInput({
    label: 'During the past month, how many hours of actual sleep did you get per night on average?',
    section: 'sleepDuration', field: 'actualSleepHours',
    type: 'number', min: 0, max: 24, step: 0.5, unit: 'hours', required: true
  }));
  card.appendChild(radioGroup({
    label: 'Do you feel you get enough sleep?',
    section: 'sleepDuration', field: 'feelEnoughSleep',
    options: yesNo, required: true
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Sleep Efficiency',
    description: 'The proportion of time in bed spent actually sleeping.'
  });
  card.appendChild(textInput({
    label: 'What time do you go to bed?',
    section: 'sleepEfficiency', field: 'bedtime',
    type: 'time', required: true
  }));
  card.appendChild(textInput({
    label: 'What time do you get out of bed?',
    section: 'sleepEfficiency', field: 'wakeTime',
    type: 'time', required: true
  }));
  card.appendChild(textInput({
    label: 'How many hours do you spend in bed?',
    section: 'sleepEfficiency', field: 'hoursInBed',
    type: 'number', min: 0, max: 24, step: 0.5, unit: 'hours', required: true
  }));
  card.appendChild(textInput({
    label: 'How many hours do you actually sleep?',
    section: 'sleepEfficiency', field: 'hoursAsleep',
    type: 'number', min: 0, max: 24, step: 0.5, unit: 'hours', required: true
  }));
  card.appendChild(readOnlyReadout({
    label: 'Calculated Sleep Efficiency',
    id: 'efficiency-readout',
    render: renderEfficiencyReadout
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Sleep Disturbances',
    description: 'Factors that have disrupted your sleep during the past month.'
  });

  const items = [
    ['wakeUpMiddleNight',   'Wake up in the middle of the night or early morning'],
    ['bathroomTrips',       'Have to get up to use the bathroom'],
    ['breathingDifficulty', 'Cannot breathe comfortably'],
    ['coughingSnoring',     'Cough or snore loudly'],
    ['tooHot',              'Feel too hot'],
    ['tooCold',             'Feel too cold'],
    ['badDreams',           'Have bad dreams'],
    ['pain',                'Have pain']
  ];
  for (const [field, label] of items) {
    card.appendChild(radioGroup({
      label, section: 'sleepDisturbances', field, options: frequencyOptions
    }));
  }
  card.appendChild(textArea({
    label: 'Any other disturbances not listed above?',
    section: 'sleepDisturbances', field: 'otherDisturbances',
    placeholder: 'Describe any other reasons that have disturbed your sleep…',
    rows: 3
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Daytime Dysfunction',
    description: 'How your sleep quality affects your daily life.'
  });
  card.appendChild(radioGroup({
    label:
      'During the past month, how often have you had trouble staying awake while ' +
      'driving, eating, or engaging in social activity?',
    section: 'daytimeDysfunction', field: 'troubleStayingAwake',
    options: frequencyOptions, required: true
  }));
  card.appendChild(radioGroup({
    label:
      'During the past month, how much of a problem has it been for you to keep up ' +
      'enough enthusiasm to get things done?',
    section: 'daytimeDysfunction', field: 'enthusiasmProblem',
    options: frequencyOptions, required: true
  }));
  card.appendChild(radioGroup({
    label: 'Have you experienced drowsiness while driving in the past month?',
    section: 'daytimeDysfunction', field: 'drivingDrowsiness',
    options: yesNo, required: true
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Sleep Medication Use',
    description: 'Medication used to help you sleep.'
  });
  card.appendChild(radioGroup({
    label: 'Do you currently use prescription sleep medications?',
    section: 'sleepMedicationUse', field: 'prescriptionSleepMeds',
    options: yesNo, required: true
  }));
  card.appendChild(radioGroup({
    label: 'Do you currently use over-the-counter sleep aids (e.g. melatonin, antihistamines)?',
    section: 'sleepMedicationUse', field: 'otcSleepAids',
    options: yesNo, required: true
  }));
  card.appendChild(radioGroup({
    label:
      'During the past month, how often have you taken medicine to help you sleep ' +
      '(prescribed or over the counter)?',
    section: 'sleepMedicationUse', field: 'frequency',
    options: frequencyOptions, required: true
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Medical & Lifestyle Factors',
    description: 'Lifestyle habits and medical conditions that may affect sleep.'
  });
  card.appendChild(selectInput({
    label: 'Daily caffeine intake (coffee, tea, energy drinks)',
    section: 'medicalLifestyle', field: 'caffeineIntake',
    options: [
      { value: 'none', label: 'None' },
      { value: 'low-1-2', label: 'Low (1-2 beverages/day)' },
      { value: 'moderate-3-4', label: 'Moderate (3-4 beverages/day)' },
      { value: 'high-5-plus', label: 'High (5 or more beverages/day)' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Alcohol use',
    section: 'medicalLifestyle', field: 'alcoholUse',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional (1-2 drinks/week)' },
      { value: 'moderate', label: 'Moderate (3-7 drinks/week)' },
      { value: 'heavy', label: 'Heavy (8+ drinks/week)' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Exercise frequency',
    section: 'medicalLifestyle', field: 'exerciseFrequency',
    options: [
      { value: 'none', label: 'No regular exercise' },
      { value: 'light-1-2', label: 'Light exercise (1-2 times/week)' },
      { value: 'moderate-3-4', label: 'Moderate exercise (3-4 times/week)' },
      { value: 'vigorous-5-plus', label: 'Vigorous exercise (5+ times/week)' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Screen time before bed (phone, tablet, computer, TV)',
    section: 'medicalLifestyle', field: 'screenTimeBeforeBed',
    options: [
      { value: 'none', label: 'None' },
      { value: 'less-than-30-min', label: 'Less than 30 minutes' },
      { value: '30-60-min', label: '30-60 minutes' },
      { value: 'more-than-60-min', label: 'More than 60 minutes' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Do you work shifts (night shifts, rotating shifts)?',
    section: 'medicalLifestyle', field: 'shiftWork', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Medical conditions that may affect sleep',
    section: 'medicalLifestyle', field: 'medicalConditions',
    placeholder: 'e.g. chronic pain, GERD, depression, anxiety, restless legs…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Current medications (that may affect sleep)',
    section: 'medicalLifestyle', field: 'currentMedications',
    placeholder: 'List any medications you are currently taking…',
    rows: 3
  }));
  return card;
}

// ----------------------------------------------------------------------
// Auto-calculated readouts
// ----------------------------------------------------------------------

function renderEfficiencyReadout() {
  const eff = sleepEfficiencyCalc(
    state.sleepEfficiency.hoursAsleep,
    state.sleepEfficiency.hoursInBed
  );
  if (eff === null) {
    return {
      html: '<span class="muted">Auto-calculated when both hours fields are entered</span>',
      cls: ''
    };
  }
  let cls = 'efficiency-severe';
  let descr = 'Severely reduced sleep efficiency';
  if (eff >= 85)      { cls = 'efficiency-good';  descr = 'Normal sleep efficiency (85% or above)'; }
  else if (eff >= 75) { cls = 'efficiency-mild';  descr = 'Mildly reduced sleep efficiency'; }
  else if (eff >= 65) { cls = 'efficiency-mod';   descr = 'Moderately reduced sleep efficiency'; }
  return {
    html: `<strong>${eff.toFixed(1)}%</strong> <span class="muted">— ${esc(descr)}</span>`,
    cls
  };
}

function refreshAutoCalculatedReadouts() {
  const el = document.getElementById('efficiency-readout');
  if (!el) return;
  const { html, cls } = renderEfficiencyReadout();
  el.className = `readout-value ${cls}`;
  el.innerHTML = html;
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
  // Sleep habits
  ['sleepHabits', 'usualBedtime'],
  ['sleepHabits', 'usualWakeTime'],
  ['sleepHabits', 'minutesToFallAsleep'],
  ['sleepHabits', 'hoursOfSleep'],
  ['sleepHabits', 'sleepEnvironment'],
  // Sleep latency
  ['sleepLatency', 'timeToFallAsleep'],
  ['sleepLatency', 'wakeUpDuringNight'],
  // Sleep duration
  ['sleepDuration', 'actualSleepHours'],
  ['sleepDuration', 'feelEnoughSleep'],
  // Sleep efficiency
  ['sleepEfficiency', 'bedtime'],
  ['sleepEfficiency', 'wakeTime'],
  ['sleepEfficiency', 'hoursInBed'],
  ['sleepEfficiency', 'hoursAsleep'],
  // Sleep disturbances (8 frequencies)
  ['sleepDisturbances', 'wakeUpMiddleNight'],
  ['sleepDisturbances', 'bathroomTrips'],
  ['sleepDisturbances', 'breathingDifficulty'],
  ['sleepDisturbances', 'coughingSnoring'],
  ['sleepDisturbances', 'tooHot'],
  ['sleepDisturbances', 'tooCold'],
  ['sleepDisturbances', 'badDreams'],
  ['sleepDisturbances', 'pain'],
  // Daytime dysfunction
  ['daytimeDysfunction', 'troubleStayingAwake'],
  ['daytimeDysfunction', 'enthusiasmProblem'],
  ['daytimeDysfunction', 'drivingDrowsiness'],
  // Sleep medication use
  ['sleepMedicationUse', 'prescriptionSleepMeds'],
  ['sleepMedicationUse', 'otcSleepAids'],
  ['sleepMedicationUse', 'frequency'],
  // Medical & lifestyle
  ['medicalLifestyle', 'caffeineIntake'],
  ['medicalLifestyle', 'alcoholUse'],
  ['medicalLifestyle', 'exerciseFrequency'],
  ['medicalLifestyle', 'screenTimeBeforeBed'],
  ['medicalLifestyle', 'shiftWork']
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
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'demographics',         title: 'Demographics' },
  { step: 2, section: 'sleepHabits',          title: 'Sleep Habits' },
  { step: 3, section: 'sleepLatency',         title: 'Sleep Latency' },
  { step: 4, section: 'sleepDuration',        title: 'Sleep Duration' },
  { step: 5, section: 'sleepEfficiency',      title: 'Sleep Efficiency' },
  { step: 6, section: 'sleepDisturbances',    title: 'Sleep Disturbances' },
  { step: 7, section: 'daytimeDysfunction',   title: 'Daytime Dysfunction' },
  { step: 8, section: 'sleepMedicationUse',   title: 'Medication Use' },
  { step: 9, section: 'medicalLifestyle',     title: 'Medical & Lifestyle' }
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
    const id = input.id || input.name;
    const groupKey = input.name || id;
    if (input.type === 'radio') {
      if (seen.has(groupKey)) return;
      seen.add(groupKey);
      const checked = form.querySelector(`input[type="radio"][name="${groupKey}"]:checked`);
      if (!checked) {
        const legend = form.querySelector(`#${groupKey}-fieldset > legend`);
        const label = legend ? legend.textContent.replace(/\s*\*\s*$/, '').trim() : groupKey;
        errors.push({ id: groupKey, message: `${label} is required` });
        setFieldError(groupKey, `${label} is required`);
      } else {
        clearFieldError(groupKey);
      }
      return;
    }
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

  const {
    psqiScore, psqiCategoryLabel, firedRules, additionalFlags, timestamp
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
      <td>${esc(r.component)}</td>
      <td>${esc(r.description)}</td>
      <td class="num">${r.score} / 3</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">All seven PSQI components scored 0 — excellent sleep quality.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Component</th>
            <th scope="col">Detail</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Sleep Quality Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>PSQI Global Score</h3>
      <p class="psqi-summary">
        <span class="psqi-score-badge ${psqiCategoryClass(psqiScore)}">${psqiScore} / 21</span>
        <span class="psqi-category">${esc(psqiCategoryLabel)}</span>
      </p>
      <p class="muted">
        Categories: 0–5 Good · 6–10 Poor · 11–15 Sleep disorder likely · 16–21 Severe sleep disturbance.
      </p>

      <h3>Component scores</h3>
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
  const { psqiScore, psqiCategoryLabel, firedRules } = calculatePSQI(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    psqiScore,
    psqiCategoryLabel,
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
  if (report) {
    report.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  }
  renderErrorSummary([]);
  renderForm();
  updateProgress();
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  refreshAutoCalculatedReadouts();
  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
