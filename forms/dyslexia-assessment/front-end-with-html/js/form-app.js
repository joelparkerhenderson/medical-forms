import { gradeDyslexia, severityClass, severityLabel } from './dyslexia-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { emptyAssessment, scoreBandLabel, scoreSeverity } from './types.js';

// Dyslexia Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure dyslexia scoring engine and renders an inline report. State
// is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'dyslexia-assessment.front-end-form-with-html.v1';
const TOTAL_STEPS = 10;

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
  slug: 'dyslexia-assessment',
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
    refreshScoreReadouts();
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
  refreshScoreReadouts();
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
 *           max?: number, step?: number, unit?: string, hint?: string }} opts
 */
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

/** Build a labelled multi-line text area. */
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

/** Build a select / dropdown input. */
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

/** Build a radio group. */
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

/**
 * Build a checkbox-list bound to a string[] field.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[] }} opts
 */
function checkboxList(opts) {
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  const legend = document.createElement('legend');
  legend.textContent = opts.label;
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'checkbox-group';
  for (const option of opts.options) {
    const id = `${opts.section}-${opts.field}-${option.value}`;
    const current = state[opts.section][opts.field] || [];
    const checked = current.includes(option.value) ? ' checked' : '';
    const label = document.createElement('label');
    label.className = 'checkbox-option';
    label.htmlFor = id;
    label.innerHTML = `
      <input type="checkbox" id="${id}" name="${opts.section}-${opts.field}" value="${esc(option.value)}"${checked}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      const arr = state[opts.section][opts.field] || [];
      if (input.checked) {
        if (!arr.includes(option.value)) arr.push(option.value);
      } else {
        const idx = arr.indexOf(option.value);
        if (idx >= 0) arr.splice(idx, 1);
      }
      state[opts.section][opts.field] = arr;
      saveState(state);
      updateProgress();
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);
  return wrapper;
}

/**
 * Standardised score input + auto-derived band readout.
 * @param {{ label: string, section: string, field: string }} opts
 */
function scoreInput(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field score-row';
  wrapper.dataset.scoreReadout = `${opts.section}.${opts.field}`;

  const inputCol = textInput({
    label: opts.label,
    section: opts.section,
    field: opts.field,
    type: 'number',
    min: 40,
    max: 160,
    hint: 'Standardised score (mean 100, SD 15)'
  });
  inputCol.classList.remove('field');

  const readout = document.createElement('div');
  readout.className = 'readout';
  readout.innerHTML = `
    <label>Band</label>
    <div class="readout-value" data-readout-value>${renderBandReadout(state[opts.section][opts.field])}</div>
  `;

  wrapper.appendChild(inputCol);
  wrapper.appendChild(readout);
  return wrapper;
}

function renderBandReadout(score) {
  if (score === null || score === undefined || score === '') {
    return '<span class="muted">—</span>';
  }
  const band = scoreBandLabel(score);
  const sev = scoreSeverity(score);
  return `<strong>${esc(band)}</strong> <span class="muted">(${esc(severityLabel(sev))})</span>`;
}

/** Build a section card. */
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
// Common option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];
const yesNoUnsure = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Unsure' }
];

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
  grid.appendChild(textInput({ label: 'First name', section: 'demographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(grid);

  const dobAge = document.createElement('div');
  dobAge.className = 'two-col';
  dobAge.appendChild(textInput({
    label: 'Date of birth',
    section: 'demographics',
    field: 'dateOfBirth',
    type: 'date',
    required: true
  }));
  dobAge.appendChild(textInput({
    label: 'Age (years)',
    section: 'demographics', field: 'ageYears',
    type: 'number', min: 0, max: 120
  }));
  card.appendChild(dobAge);

  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'demographics', field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  const langs = document.createElement('div');
  langs.className = 'two-col';
  langs.appendChild(textInput({
    label: 'Preferred language',
    section: 'demographics', field: 'preferredLanguage',
    placeholder: 'e.g. English'
  }));
  langs.appendChild(textInput({
    label: 'First language',
    section: 'demographics', field: 'firstLanguage',
    placeholder: 'e.g. English'
  }));
  card.appendChild(langs);

  card.appendChild(selectInput({
    label: 'Handedness',
    section: 'demographics', field: 'handedness',
    options: [
      { value: 'right', label: 'Right' },
      { value: 'left', label: 'Left' },
      { value: 'ambidextrous', label: 'Ambidextrous' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Referral source',
    section: 'demographics', field: 'referralSource',
    placeholder: 'e.g. School SENCO, GP, parent'
  }));
  card.appendChild(textArea({
    label: 'Reason for referral',
    section: 'demographics', field: 'referralReason',
    placeholder: 'Brief description of presenting concerns…',
    rows: 3
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Developmental History',
    description: 'Pregnancy, birth, milestones, and family history.'
  });

  card.appendChild(radioGroup({
    label: 'Were there pregnancy complications?',
    section: 'developmentalHistory', field: 'pregnancyComplications',
    options: yesNoUnsure
  }));
  const pregDetails = document.createElement('div');
  pregDetails.dataset.conditional = 'developmentalHistory.pregnancyComplications=yes';
  pregDetails.appendChild(textArea({
    label: 'Pregnancy details',
    section: 'developmentalHistory', field: 'pregnancyDetails',
    rows: 2
  }));
  card.appendChild(pregDetails);

  card.appendChild(radioGroup({
    label: 'Were there birth complications?',
    section: 'developmentalHistory', field: 'birthComplications',
    options: yesNoUnsure
  }));
  const birthDetails = document.createElement('div');
  birthDetails.dataset.conditional = 'developmentalHistory.birthComplications=yes';
  birthDetails.appendChild(textArea({
    label: 'Birth details',
    section: 'developmentalHistory', field: 'birthDetails',
    rows: 2
  }));
  card.appendChild(birthDetails);

  card.appendChild(textArea({
    label: 'Early developmental milestones',
    section: 'developmentalHistory', field: 'earlyMilestones',
    placeholder: 'Walking, talking, etc.',
    rows: 2
  }));

  card.appendChild(radioGroup({
    label: 'Was there a speech delay?',
    section: 'developmentalHistory', field: 'speechDelay',
    options: yesNoUnsure
  }));
  card.appendChild(radioGroup({
    label: 'Was there a language delay?',
    section: 'developmentalHistory', field: 'languageDelay',
    options: yesNoUnsure
  }));
  card.appendChild(radioGroup({
    label: 'Are there any hearing problems (current or historical)?',
    section: 'developmentalHistory', field: 'hearingProblems',
    options: yesNoUnsure
  }));
  card.appendChild(radioGroup({
    label: 'Are there any vision problems (current or historical)?',
    section: 'developmentalHistory', field: 'visionProblems',
    options: yesNoUnsure
  }));

  card.appendChild(radioGroup({
    label: 'Family history of dyslexia or specific learning difficulty?',
    section: 'developmentalHistory', field: 'familyHistoryDyslexia',
    options: yesNoUnsure
  }));
  const famDetails = document.createElement('div');
  famDetails.dataset.conditional = 'developmentalHistory.familyHistoryDyslexia=yes';
  famDetails.appendChild(textArea({
    label: 'Family history details',
    section: 'developmentalHistory', field: 'familyHistoryDetails',
    placeholder: 'Which relatives, what diagnosis…',
    rows: 2
  }));
  card.appendChild(famDetails);

  card.appendChild(textArea({
    label: 'Other developmental notes',
    section: 'developmentalHistory', field: 'otherDevelopmentalNotes',
    rows: 2
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Educational Background',
    description: 'School history, attendance, and prior assessments.'
  });

  card.appendChild(selectInput({
    label: 'School type',
    section: 'educationalBackground', field: 'schoolType',
    options: [
      { value: 'state-primary', label: 'State primary' },
      { value: 'state-secondary', label: 'State secondary' },
      { value: 'independent', label: 'Independent' },
      { value: 'special', label: 'Special school' },
      { value: 'home-educated', label: 'Home educated' },
      { value: 'further-education', label: 'Further education' },
      { value: 'higher-education', label: 'Higher education' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Current year group / class',
    section: 'educationalBackground', field: 'currentYearGroup',
    placeholder: 'e.g. Year 5'
  }));

  card.appendChild(radioGroup({
    label: 'Has the pupil changed schools?',
    section: 'educationalBackground', field: 'schoolChanges',
    options: yesNoUnsure
  }));
  const changeCount = document.createElement('div');
  changeCount.dataset.conditional = 'educationalBackground.schoolChanges=yes';
  changeCount.appendChild(textInput({
    label: 'Number of school changes',
    section: 'educationalBackground', field: 'schoolChangeCount',
    type: 'number', min: 0, max: 50
  }));
  card.appendChild(changeCount);

  card.appendChild(radioGroup({
    label: 'Are there attendance issues?',
    section: 'educationalBackground', field: 'attendanceIssues',
    options: yesNoUnsure
  }));
  const attDetails = document.createElement('div');
  attDetails.dataset.conditional = 'educationalBackground.attendanceIssues=yes';
  attDetails.appendChild(textArea({
    label: 'Attendance details',
    section: 'educationalBackground', field: 'attendanceDetails',
    rows: 2
  }));
  card.appendChild(attDetails);

  card.appendChild(radioGroup({
    label: 'Is the pupil an English-as-a-second-language (ESL/EAL) learner?',
    section: 'educationalBackground', field: 'eslLearner',
    options: yesNoUnsure
  }));

  card.appendChild(textArea({
    label: 'Academic strengths',
    section: 'educationalBackground', field: 'academicStrengths',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Academic weaknesses',
    section: 'educationalBackground', field: 'academicWeaknesses',
    rows: 2
  }));

  card.appendChild(radioGroup({
    label: 'Have there been previous formal assessments?',
    section: 'educationalBackground', field: 'previousAssessments',
    options: yesNoUnsure
  }));
  const assDetails = document.createElement('div');
  assDetails.dataset.conditional = 'educationalBackground.previousAssessments=yes';
  assDetails.appendChild(textArea({
    label: 'Previous assessment details',
    section: 'educationalBackground', field: 'previousAssessmentDetails',
    placeholder: 'Date, type, who carried it out, key findings…',
    rows: 3
  }));
  card.appendChild(assDetails);

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Reading Assessment',
    description: 'Standardised reading scores and observed difficulties.'
  });

  card.appendChild(scoreInput({
    label: 'Reading fluency standardised score',
    section: 'readingAssessment', field: 'readingFluencyScore'
  }));
  card.appendChild(scoreInput({
    label: 'Reading comprehension standardised score',
    section: 'readingAssessment', field: 'readingComprehensionScore'
  }));

  card.appendChild(radioGroup({
    label: 'Difficulty decoding words?',
    section: 'readingAssessment', field: 'difficultyDecoding',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Difficulty with reading comprehension?',
    section: 'readingAssessment', field: 'difficultyComprehension',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Avoids reading?',
    section: 'readingAssessment', field: 'avoidsReading',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Slow reading speed?',
    section: 'readingAssessment', field: 'slowReadingSpeed',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Loses place when reading?',
    section: 'readingAssessment', field: 'losesPlaceWhenReading',
    options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Reading notes',
    section: 'readingAssessment', field: 'readingNotes',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Writing & Spelling Assessment',
    description: 'Standardised written-language scores and observed difficulties.'
  });

  card.appendChild(scoreInput({
    label: 'Spelling accuracy standardised score',
    section: 'writingSpelling', field: 'spellingAccuracyScore'
  }));
  card.appendChild(scoreInput({
    label: 'Written expression standardised score',
    section: 'writingSpelling', field: 'writtenExpressionScore'
  }));

  card.appendChild(radioGroup({
    label: 'Difficulty with spelling?',
    section: 'writingSpelling', field: 'difficultySpelling',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Difficulty with handwriting?',
    section: 'writingSpelling', field: 'difficultyHandwriting',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Difficulty organising ideas in writing?',
    section: 'writingSpelling', field: 'difficultyOrganisingIdeas',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Omits letters or words?',
    section: 'writingSpelling', field: 'omitsLettersOrWords',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Reverses letters or numbers?',
    section: 'writingSpelling', field: 'reversesLettersOrNumbers',
    options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Writing notes',
    section: 'writingSpelling', field: 'writingNotes',
    rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Phonological Processing',
    description: 'Awareness, memory, and rapid naming.'
  });

  card.appendChild(scoreInput({
    label: 'Phonological awareness standardised score',
    section: 'phonologicalProcessing', field: 'phonologicalAwarenessScore'
  }));
  card.appendChild(scoreInput({
    label: 'Phonological memory standardised score',
    section: 'phonologicalProcessing', field: 'phonologicalMemoryScore'
  }));
  card.appendChild(scoreInput({
    label: 'Rapid automatised naming standardised score',
    section: 'phonologicalProcessing', field: 'rapidNamingScore'
  }));

  card.appendChild(radioGroup({
    label: 'Difficulty with rhyming?',
    section: 'phonologicalProcessing', field: 'difficultyRhyming',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Difficulty segmenting sounds?',
    section: 'phonologicalProcessing', field: 'difficultySegmentingSounds',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Difficulty blending sounds?',
    section: 'phonologicalProcessing', field: 'difficultyBlendingSounds',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Difficulty learning letter–sound correspondences?',
    section: 'phonologicalProcessing', field: 'difficultyLearningLetterSounds',
    options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Phonological processing notes',
    section: 'phonologicalProcessing', field: 'phonologicalNotes',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Working Memory & Processing Speed',
    description: 'Cognitive load and pace of work.'
  });

  card.appendChild(scoreInput({
    label: 'Working memory standardised score',
    section: 'workingMemoryProcessingSpeed', field: 'workingMemoryScore'
  }));
  card.appendChild(scoreInput({
    label: 'Processing speed standardised score',
    section: 'workingMemoryProcessingSpeed', field: 'processingSpeedScore'
  }));

  card.appendChild(radioGroup({
    label: 'Difficulty following multi-step instructions?',
    section: 'workingMemoryProcessingSpeed', field: 'difficultyFollowingInstructions',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Difficulty remembering sequences?',
    section: 'workingMemoryProcessingSpeed', field: 'difficultyRememberingSequences',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Slow to complete tasks?',
    section: 'workingMemoryProcessingSpeed', field: 'slowToCompleteTasks',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Difficulty taking notes?',
    section: 'workingMemoryProcessingSpeed', field: 'difficultyTakingNotes',
    options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Working memory / processing speed notes',
    section: 'workingMemoryProcessingSpeed', field: 'memoryNotes',
    rows: 3
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Emotional & Behavioural Impact',
    description: 'Secondary effects on wellbeing and behaviour.'
  });

  card.appendChild(radioGroup({
    label: 'Low self-esteem?',
    section: 'emotionalBehavioural', field: 'lowSelfEsteem',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Anxiety about school or learning?',
    section: 'emotionalBehavioural', field: 'anxietyAboutSchool',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Avoidance behaviour?',
    section: 'emotionalBehavioural', field: 'avoidanceBehaviour',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Frustration with learning?',
    section: 'emotionalBehavioural', field: 'frustrationWithLearning',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Peer relationship difficulties?',
    section: 'emotionalBehavioural', field: 'peerRelationshipDifficulties',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Sleep disturbance?',
    section: 'emotionalBehavioural', field: 'sleepDisturbance',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Mental health concerns?',
    section: 'emotionalBehavioural', field: 'mentalHealthConcerns',
    options: yesNo
  }));
  const mhDetails = document.createElement('div');
  mhDetails.dataset.conditional = 'emotionalBehavioural.mentalHealthConcerns=yes';
  mhDetails.appendChild(textArea({
    label: 'Mental health details',
    section: 'emotionalBehavioural', field: 'mentalHealthDetails',
    rows: 3
  }));
  card.appendChild(mhDetails);

  card.appendChild(textArea({
    label: 'Behavioural notes',
    section: 'emotionalBehavioural', field: 'behaviouralNotes',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Previous Support & Interventions',
    description: 'Existing supports already in place.'
  });

  card.appendChild(radioGroup({
    label: 'Has the pupil received previous targeted intervention?',
    section: 'previousSupport', field: 'previousIntervention',
    options: yesNo
  }));
  const prevDetails = document.createElement('div');
  prevDetails.dataset.conditional = 'previousSupport.previousIntervention=yes';
  prevDetails.appendChild(textArea({
    label: 'Types of previous intervention',
    section: 'previousSupport', field: 'interventionTypes',
    placeholder: 'e.g. structured literacy, phonics catch-up, 1:1 tutoring…',
    rows: 2
  }));
  card.appendChild(prevDetails);

  card.appendChild(radioGroup({
    label: 'Does the pupil have a current EHCP or IEP?',
    section: 'previousSupport', field: 'currentEhcpOrIep',
    options: yesNo
  }));
  const ehcpHost = document.createElement('div');
  ehcpHost.dataset.conditional = 'previousSupport.currentEhcpOrIep=yes';
  ehcpHost.appendChild(textArea({
    label: 'EHCP / IEP details',
    section: 'previousSupport', field: 'ehcpDetails',
    rows: 2
  }));
  card.appendChild(ehcpHost);

  card.appendChild(radioGroup({
    label: 'Are exam access arrangements in place?',
    section: 'previousSupport', field: 'accessArrangements',
    options: yesNo
  }));
  const aaHost = document.createElement('div');
  aaHost.dataset.conditional = 'previousSupport.accessArrangements=yes';
  aaHost.appendChild(checkboxList({
    label: 'Which access arrangements?',
    section: 'previousSupport', field: 'accessArrangementsList',
    options: [
      { value: 'extra-time', label: 'Extra time' },
      { value: 'reader', label: 'Reader' },
      { value: 'scribe', label: 'Scribe' },
      { value: 'word-processor', label: 'Word processor' },
      { value: 'rest-breaks', label: 'Rest breaks' },
      { value: 'separate-room', label: 'Separate room' },
      { value: 'modified-paper', label: 'Modified paper / coloured overlay' }
    ]
  }));
  card.appendChild(aaHost);

  card.appendChild(radioGroup({
    label: 'Is tutorial / specialist teaching support in place?',
    section: 'previousSupport', field: 'tutorialSupport',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Is assistive technology being used?',
    section: 'previousSupport', field: 'assistiveTechnologyUsed',
    options: yesNo
  }));
  const atHost = document.createElement('div');
  atHost.dataset.conditional = 'previousSupport.assistiveTechnologyUsed=yes';
  atHost.appendChild(textArea({
    label: 'Assistive technology details',
    section: 'previousSupport', field: 'assistiveTechnologyDetails',
    placeholder: 'e.g. text-to-speech, speech-to-text, mind-mapping software…',
    rows: 2
  }));
  card.appendChild(atHost);

  card.appendChild(textArea({
    label: 'Other previous support notes',
    section: 'previousSupport', field: 'previousSupportNotes',
    rows: 2
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Recommendations & Support Plan',
    description: 'Plan for next steps.'
  });

  card.appendChild(checkboxList({
    label: 'Recommended supports',
    section: 'recommendationsSupportPlan', field: 'recommendedSupports',
    options: [
      { value: 'phonics', label: 'Structured phonics programme' },
      { value: 'multisensory-literacy', label: 'Multisensory literacy intervention' },
      { value: 'reading-fluency', label: 'Reading fluency intervention' },
      { value: 'spelling-programme', label: 'Targeted spelling programme' },
      { value: 'handwriting', label: 'Handwriting / OT support' },
      { value: 'maths-support', label: 'Maths support' },
      { value: 'study-skills', label: 'Study skills coaching' },
      { value: 'small-group', label: 'Small-group teaching' },
      { value: 'one-to-one', label: 'One-to-one teaching' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Recommend structured literacy programme?',
    section: 'recommendationsSupportPlan', field: 'structuredLiteracyRecommended',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Recommend assistive technology?',
    section: 'recommendationsSupportPlan', field: 'assistiveTechRecommended',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Recommend extra time in assessments?',
    section: 'recommendationsSupportPlan', field: 'extraTimeRecommended',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Recommend full specialist diagnostic assessment?',
    section: 'recommendationsSupportPlan', field: 'specialistAssessmentRecommended',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Recommend parent training / coaching?',
    section: 'recommendationsSupportPlan', field: 'parentTrainingRecommended',
    options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Key goals',
    section: 'recommendationsSupportPlan', field: 'keyGoals',
    placeholder: 'SMART targets for the next review period…',
    rows: 3
  }));
  card.appendChild(textInput({
    label: 'Review timeframe',
    section: 'recommendationsSupportPlan', field: 'reviewTimeframe',
    placeholder: 'e.g. 6 weeks, 1 term, 6 months'
  }));
  card.appendChild(textArea({
    label: 'Additional recommendations',
    section: 'recommendationsSupportPlan', field: 'additionalRecommendations',
    rows: 3
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections + score readouts
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

function refreshScoreReadouts() {
  document.querySelectorAll('[data-score-readout]').forEach((host) => {
    const path = host.getAttribute('data-score-readout');
    const [section, field] = path.split('.');
    const value = state[section]?.[field];
    const slot = host.querySelector('[data-readout-value]');
    if (slot) slot.innerHTML = renderBandReadout(value);
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
  ['demographics', 'ageYears'],
  ['demographics', 'preferredLanguage'],
  ['demographics', 'firstLanguage'],
  ['demographics', 'handedness'],
  ['demographics', 'referralSource'],
  // Developmental history
  ['developmentalHistory', 'pregnancyComplications'],
  ['developmentalHistory', 'birthComplications'],
  ['developmentalHistory', 'speechDelay'],
  ['developmentalHistory', 'languageDelay'],
  ['developmentalHistory', 'hearingProblems'],
  ['developmentalHistory', 'visionProblems'],
  ['developmentalHistory', 'familyHistoryDyslexia'],
  // Educational background
  ['educationalBackground', 'schoolType'],
  ['educationalBackground', 'currentYearGroup'],
  ['educationalBackground', 'schoolChanges'],
  ['educationalBackground', 'attendanceIssues'],
  ['educationalBackground', 'eslLearner'],
  ['educationalBackground', 'previousAssessments'],
  // Reading
  ['readingAssessment', 'readingFluencyScore'],
  ['readingAssessment', 'readingComprehensionScore'],
  ['readingAssessment', 'difficultyDecoding'],
  ['readingAssessment', 'difficultyComprehension'],
  ['readingAssessment', 'avoidsReading'],
  ['readingAssessment', 'slowReadingSpeed'],
  ['readingAssessment', 'losesPlaceWhenReading'],
  // Writing & spelling
  ['writingSpelling', 'spellingAccuracyScore'],
  ['writingSpelling', 'writtenExpressionScore'],
  ['writingSpelling', 'difficultySpelling'],
  ['writingSpelling', 'difficultyHandwriting'],
  ['writingSpelling', 'difficultyOrganisingIdeas'],
  ['writingSpelling', 'omitsLettersOrWords'],
  ['writingSpelling', 'reversesLettersOrNumbers'],
  // Phonological
  ['phonologicalProcessing', 'phonologicalAwarenessScore'],
  ['phonologicalProcessing', 'phonologicalMemoryScore'],
  ['phonologicalProcessing', 'rapidNamingScore'],
  ['phonologicalProcessing', 'difficultyRhyming'],
  ['phonologicalProcessing', 'difficultySegmentingSounds'],
  ['phonologicalProcessing', 'difficultyBlendingSounds'],
  ['phonologicalProcessing', 'difficultyLearningLetterSounds'],
  // Working memory & processing speed
  ['workingMemoryProcessingSpeed', 'workingMemoryScore'],
  ['workingMemoryProcessingSpeed', 'processingSpeedScore'],
  ['workingMemoryProcessingSpeed', 'difficultyFollowingInstructions'],
  ['workingMemoryProcessingSpeed', 'difficultyRememberingSequences'],
  ['workingMemoryProcessingSpeed', 'slowToCompleteTasks'],
  ['workingMemoryProcessingSpeed', 'difficultyTakingNotes'],
  // Emotional & behavioural
  ['emotionalBehavioural', 'lowSelfEsteem'],
  ['emotionalBehavioural', 'anxietyAboutSchool'],
  ['emotionalBehavioural', 'avoidanceBehaviour'],
  ['emotionalBehavioural', 'frustrationWithLearning'],
  ['emotionalBehavioural', 'peerRelationshipDifficulties'],
  ['emotionalBehavioural', 'sleepDisturbance'],
  ['emotionalBehavioural', 'mentalHealthConcerns'],
  // Previous support
  ['previousSupport', 'previousIntervention'],
  ['previousSupport', 'currentEhcpOrIep'],
  ['previousSupport', 'accessArrangements'],
  ['previousSupport', 'tutorialSupport'],
  ['previousSupport', 'assistiveTechnologyUsed'],
  // Recommendations
  ['recommendationsSupportPlan', 'structuredLiteracyRecommended'],
  ['recommendationsSupportPlan', 'assistiveTechRecommended'],
  ['recommendationsSupportPlan', 'extraTimeRecommended'],
  ['recommendationsSupportPlan', 'specialistAssessmentRecommended'],
  ['recommendationsSupportPlan', 'parentTrainingRecommended'],
  ['recommendationsSupportPlan', 'reviewTimeframe']
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
  { step: 2, section: 'developmentalHistory', title: 'Developmental History' },
  { step: 3, section: 'educationalBackground', title: 'Educational Background' },
  { step: 4, section: 'readingAssessment', title: 'Reading Assessment' },
  { step: 5, section: 'writingSpelling', title: 'Writing & Spelling Assessment' },
  { step: 6, section: 'phonologicalProcessing', title: 'Phonological Processing' },
  { step: 7, section: 'workingMemoryProcessingSpeed', title: 'Working Memory & Processing Speed' },
  { step: 8, section: 'emotionalBehavioural', title: 'Emotional & Behavioural Impact' },
  { step: 9, section: 'previousSupport', title: 'Previous Support & Interventions' },
  { step: 10, section: 'recommendationsSupportPlan', title: 'Recommendations & Support Plan' }
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

function severityCellClass(severity) {
  switch (severity) {
    case 'none': return 'cat-none';
    case 'mild': return 'cat-mild';
    case 'moderate': return 'cat-moderate';
    case 'severe': return 'cat-severe';
    default: return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { overallSeverity, lowestScore, answeredCount, domainScores, additionalFlags, timestamp } = lastResult;

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

  const domainRows = domainScores.map((d) => `
    <tr>
      <th scope="row">${esc(d.id)}</th>
      <td>${esc(d.category)}</td>
      <td>${esc(d.description)}</td>
      <td class="num">${d.score === null || d.score === undefined ? '—' : esc(String(d.score))}</td>
      <td class="${severityCellClass(d.severity)}">${esc(severityLabel(d.severity))}</td>
    </tr>
  `).join('');

  const domainTable = `
    <table class="subscales">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Category</th>
          <th scope="col">Domain</th>
          <th scope="col">Score</th>
          <th scope="col">Severity</th>
        </tr>
      </thead>
      <tbody>${domainRows}</tbody>
    </table>
  `;

  const lowestText = lowestScore === null
    ? 'No standardised scores entered.'
    : `Lowest standardised score: <strong>${esc(String(lowestScore))}</strong>.`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Dyslexia Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Overall severity</h3>
      <p class="severity-summary">
        <span class="severity-badge ${severityClass(overallSeverity)}">${esc(severityLabel(overallSeverity))}</span>
        <span class="severity-label">${lowestText}</span>
      </p>
      <p class="muted">Based on ${answeredCount} of ${domainScores.length} domain scores entered.</p>

      <h3>Per-domain scores</h3>
      ${domainTable}

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
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = gradeDyslexia(state, additionalFlags);
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
  refreshScoreReadouts();
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
  refreshScoreReadouts();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
