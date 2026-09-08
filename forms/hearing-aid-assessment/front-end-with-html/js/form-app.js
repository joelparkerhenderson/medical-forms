import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateHHIES } from './hhies-grader.js';
import { hhiesQuestions, hhiesResponseOptions } from './hhies-rules.js';
import { calculateAge, emptyAssessment, hearingLossGrade, hhiesCategory, hhiesSeverityClass } from './types.js';

// Hearing Aid Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure HHIE-S scoring engine and renders an inline report. State
// is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'hearing-aid-assessment.front-end-form-with-html.v1';

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
  slug: 'hearing-aid-assessment',
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
 * @param {{ label: string, section: string, field: string, required?: boolean,
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

  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');

  wrapper.innerHTML = `
    <label for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select">
      ${optionsHtml}
    </select>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => { setField(opts.section, opts.field, sel.value); clearFieldError(id); });
  return wrapper;
}

/**
 * Build a radio group.
 * @param {{ label: string, section: string, field: string, required?: boolean,
 *           options: { value: string, label: string }[] }} opts
 */
function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field radio-group';

  const legend = document.createElement('legend');
  legend.innerHTML = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-options';
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.className = 'radio-option';
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    label.innerHTML = `
      <input type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) setField(opts.section, opts.field, option.value);
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);
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
    `<span class="section-step">Section ${opts.stepNumber} of 9</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

/** Build a sub-section header with an optional hint paragraph. */
function subHeader(title, hint) {
  const div = document.createElement('div');
  div.className = 'sub-header';
  div.innerHTML = `<h3>${esc(title)}</h3>${hint ? `<p class="hint">${esc(hint)}</p>` : ''}`;
  return div;
}

/** Build the 10 HHIE-S radio rows (numeric scoring). */
function hhiesQuestionnaireBlock() {
  const wrapper = document.createElement('div');
  wrapper.className = 'hhies-list';

  hhiesQuestions.forEach((question, idx) => {
    const item = document.createElement('div');
    item.className = 'hhies-item';

    const qKey = `q${idx + 1}`;
    const groupId = `hhies-${qKey}`;
    const current = state.hhiesQuestionnaire[qKey];

    item.innerHTML = `
      <p class="hhies-question"><span class="qnum">${idx + 1}.</span>${esc(question.text)}</p>
      <p class="hhies-domain">Domain: ${esc(question.domain)}</p>
    `;

    const list = document.createElement('div');
    list.className = 'radio-options';
    for (const opt of hhiesResponseOptions) {
      const radioId = `${groupId}-${opt.value}`;
      const label = document.createElement('label');
      label.className = 'radio-option';
      label.htmlFor = radioId;
      const checked = current === opt.value ? ' checked' : '';
      label.innerHTML = `
        <input type="radio" id="${radioId}" name="${groupId}" value="${opt.value}"${checked}>
        <span>${esc(opt.label)} (${opt.value})</span>
      `;
      const input = label.querySelector('input');
      input.addEventListener('change', () => {
        if (input.checked) setField('hhiesQuestionnaire', qKey, Number(opt.value));
      });
      list.appendChild(label);
    }
    item.appendChild(list);
    wrapper.appendChild(item);
  });

  return wrapper;
}

// ----------------------------------------------------------------------
// Section renderers (1 per assessment step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const difficultyOptions = [
  { value: 'none', label: 'None' },
  { value: 'slight', label: 'Slight' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' }
];

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

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Hearing History',
    description: 'Details about your hearing loss and related conditions.'
  });

  card.appendChild(radioGroup({
    label: 'How did your hearing loss begin?',
    section: 'hearingHistory', field: 'onsetType',
    required: true,
    options: [
      { value: 'sudden', label: 'Sudden' },
      { value: 'gradual', label: 'Gradual' }
    ]
  }));

  card.appendChild(textInput({
    label: 'How long have you had hearing difficulties?',
    section: 'hearingHistory', field: 'duration',
    placeholder: 'e.g. 2 years, 6 months, since childhood',
    required: true
  }));

  card.appendChild(radioGroup({
    label: 'Which ear is affected?',
    section: 'hearingHistory', field: 'affectedEar',
    required: true,
    options: [
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' },
      { value: 'both', label: 'Both' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Is there a family history of hearing loss?',
    section: 'hearingHistory', field: 'familyHistory', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have you had significant noise exposure (occupational or recreational)?',
    section: 'hearingHistory', field: 'noiseExposure', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you experience tinnitus (ringing, buzzing, or other sounds in your ears)?',
    section: 'hearingHistory', field: 'tinnitus', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you experience vertigo or dizziness?',
    section: 'hearingHistory', field: 'vertigo', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have you had any ear surgery?',
    section: 'hearingHistory', field: 'earSurgery', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have you taken any ototoxic medications (e.g. aminoglycosides, cisplatin)?',
    section: 'hearingHistory', field: 'ototoxicMedications', options: yesNo
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'HHIE-S Questionnaire',
    description: 'Hearing Handicap Inventory for the Elderly — Screening. Rate how your hearing affects your daily life. Each item: No (0), Sometimes (2), Yes (4).'
  });
  card.appendChild(hhiesQuestionnaireBlock());
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Communication Difficulties',
    description: 'Rate your difficulty in the following listening situations.'
  });

  card.appendChild(radioGroup({
    label: 'Conversation in a quiet room (one-to-one)',
    section: 'communicationDifficulties', field: 'quietConversation',
    options: difficultyOptions
  }));
  card.appendChild(radioGroup({
    label: 'Group conversation (3 or more people)',
    section: 'communicationDifficulties', field: 'groupConversation',
    options: difficultyOptions
  }));
  card.appendChild(radioGroup({
    label: 'Telephone conversations',
    section: 'communicationDifficulties', field: 'telephone',
    options: difficultyOptions
  }));
  card.appendChild(radioGroup({
    label: 'Listening to television or radio',
    section: 'communicationDifficulties', field: 'television',
    options: difficultyOptions
  }));
  card.appendChild(radioGroup({
    label: 'Hearing in public places (shops, restaurants, etc.)',
    section: 'communicationDifficulties', field: 'publicPlaces',
    options: difficultyOptions
  }));
  card.appendChild(radioGroup({
    label: 'Hearing difficulty at work or during regular activities',
    section: 'communicationDifficulties', field: 'workDifficulty',
    options: difficultyOptions
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Current Hearing Aids',
    description: 'Information about any hearing aids you currently use.'
  });

  card.appendChild(radioGroup({
    label: 'Do you currently wear hearing aids?',
    section: 'currentHearingAids', field: 'hasHearingAids',
    required: true, options: yesNo
  }));

  const aidTypeOptions = [
    { value: 'BTE', label: 'Behind-the-ear (BTE)' },
    { value: 'RIC', label: 'Receiver-in-canal (RIC)' },
    { value: 'ITE', label: 'In-the-ear (ITE)' },
    { value: 'ITC', label: 'In-the-canal (ITC)' },
    { value: 'CIC', label: 'Completely-in-canal (CIC)' },
    { value: 'IIC', label: 'Invisible-in-canal (IIC)' },
    { value: 'bone-conduction', label: 'Bone conduction' },
    { value: 'CROS', label: 'CROS/BiCROS' },
    { value: 'other', label: 'Other' },
    { value: 'none', label: 'None' }
  ];

  // Conditional block — only shown when hasHearingAids === 'yes'.
  const conditional = document.createElement('div');
  conditional.dataset.conditional = 'currentHearingAids.hasHearingAids=yes';

  conditional.appendChild(selectInput({
    label: 'Left ear hearing aid type',
    section: 'currentHearingAids', field: 'leftAidType',
    options: aidTypeOptions
  }));
  conditional.appendChild(selectInput({
    label: 'Right ear hearing aid type',
    section: 'currentHearingAids', field: 'rightAidType',
    options: aidTypeOptions
  }));
  conditional.appendChild(textInput({
    label: 'How old are your current hearing aids?',
    section: 'currentHearingAids', field: 'aidAge',
    placeholder: 'e.g. 2 years, 6 months'
  }));
  conditional.appendChild(radioGroup({
    label: 'How satisfied are you with your current hearing aids?',
    section: 'currentHearingAids', field: 'satisfaction',
    options: [
      { value: 'very-satisfied', label: 'Very satisfied' },
      { value: 'satisfied', label: 'Satisfied' },
      { value: 'neutral', label: 'Neutral' },
      { value: 'dissatisfied', label: 'Dissatisfied' },
      { value: 'very-dissatisfied', label: 'Very dissatisfied' }
    ]
  }));
  conditional.appendChild(textInput({
    label: 'Average daily use',
    section: 'currentHearingAids', field: 'dailyUseHours',
    type: 'number', min: 0, max: 24, step: 0.5, unit: 'hours'
  }));
  conditional.appendChild(textArea({
    label: 'Any difficulties or complaints with your current hearing aids?',
    section: 'currentHearingAids', field: 'difficulties',
    placeholder: 'e.g. feedback, discomfort, difficulty with settings…',
    rows: 3
  }));

  card.appendChild(conditional);
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Ear Examination',
    description: 'Clinical findings from otoscopic examination.'
  });

  card.appendChild(subHeader('Left Ear'));
  card.appendChild(textInput({
    label: 'External ear appearance',
    section: 'earExamination', field: 'leftExternalEar',
    placeholder: 'e.g. Normal, inflammation, discharge…'
  }));
  card.appendChild(textInput({
    label: 'Tympanic membrane',
    section: 'earExamination', field: 'leftTympanicMembrane',
    placeholder: 'e.g. Normal, perforation, retraction…'
  }));
  card.appendChild(radioGroup({
    label: 'Cerumen (earwax) present in left ear?',
    section: 'earExamination', field: 'cerumenLeft', options: yesNo
  }));

  card.appendChild(subHeader('Right Ear'));
  card.appendChild(textInput({
    label: 'External ear appearance',
    section: 'earExamination', field: 'rightExternalEar',
    placeholder: 'e.g. Normal, inflammation, discharge…'
  }));
  card.appendChild(textInput({
    label: 'Tympanic membrane',
    section: 'earExamination', field: 'rightTympanicMembrane',
    placeholder: 'e.g. Normal, perforation, retraction…'
  }));
  card.appendChild(radioGroup({
    label: 'Cerumen (earwax) present in right ear?',
    section: 'earExamination', field: 'cerumenRight', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Any other abnormalities noted',
    section: 'earExamination', field: 'abnormalities',
    placeholder: 'Describe any other findings…',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Audiogram Results',
    description: 'Enter audiometric test results (leave blank if not yet tested).'
  });

  card.appendChild(subHeader('Pure Tone Average (PTA)'));
  const ptaGrid = document.createElement('div');
  ptaGrid.className = 'two-col';
  ptaGrid.appendChild(textInput({
    label: 'Left ear PTA', section: 'audiogramResults', field: 'leftPTA',
    type: 'number', min: -10, max: 120, step: 1, unit: 'dB HL'
  }));
  ptaGrid.appendChild(textInput({
    label: 'Right ear PTA', section: 'audiogramResults', field: 'rightPTA',
    type: 'number', min: -10, max: 120, step: 1, unit: 'dB HL'
  }));
  card.appendChild(ptaGrid);

  card.appendChild(subHeader('Speech Reception Threshold (SRT)'));
  const srtGrid = document.createElement('div');
  srtGrid.className = 'two-col';
  srtGrid.appendChild(textInput({
    label: 'Left ear SRT', section: 'audiogramResults', field: 'leftSRT',
    type: 'number', min: -10, max: 120, step: 1, unit: 'dB HL'
  }));
  srtGrid.appendChild(textInput({
    label: 'Right ear SRT', section: 'audiogramResults', field: 'rightSRT',
    type: 'number', min: -10, max: 120, step: 1, unit: 'dB HL'
  }));
  card.appendChild(srtGrid);

  card.appendChild(subHeader('Word Recognition Score'));
  const wrGrid = document.createElement('div');
  wrGrid.className = 'two-col';
  wrGrid.appendChild(textInput({
    label: 'Left ear word recognition',
    section: 'audiogramResults', field: 'leftWordRecognition',
    type: 'number', min: 0, max: 100, step: 1, unit: '%'
  }));
  wrGrid.appendChild(textInput({
    label: 'Right ear word recognition',
    section: 'audiogramResults', field: 'rightWordRecognition',
    type: 'number', min: 0, max: 100, step: 1, unit: '%'
  }));
  card.appendChild(wrGrid);

  card.appendChild(selectInput({
    label: 'Type of hearing loss',
    section: 'audiogramResults', field: 'hearingLossType',
    required: true,
    options: [
      { value: 'sensorineural', label: 'Sensorineural' },
      { value: 'conductive', label: 'Conductive' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'unknown', label: 'Unknown / Not yet determined' }
    ]
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Lifestyle & Needs',
    description: 'Help us understand your daily life and hearing needs.'
  });

  card.appendChild(textArea({
    label: 'Describe your social activity level',
    section: 'lifestyleNeeds', field: 'socialActivity',
    placeholder: 'e.g. very active social life, regular church attendance, frequent dining out…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Occupation or daily activity requirements',
    section: 'lifestyleNeeds', field: 'occupationRequirements',
    placeholder: 'e.g. retired, office environment, meetings, phone calls…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Hobbies and leisure activities',
    section: 'lifestyleNeeds', field: 'hobbies',
    placeholder: 'e.g. music, theatre, sports, gardening…',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'How comfortable are you with technology?',
    section: 'lifestyleNeeds', field: 'technologyComfort',
    options: [
      { value: 'very-comfortable', label: 'Very comfortable' },
      { value: 'comfortable', label: 'Comfortable' },
      { value: 'somewhat-comfortable', label: 'Somewhat comfortable' },
      { value: 'uncomfortable', label: 'Uncomfortable' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Manual dexterity (ability to handle small objects)',
    section: 'lifestyleNeeds', field: 'dexterity',
    options: [
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' },
      { value: 'poor', label: 'Poor' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Vision status',
    section: 'lifestyleNeeds', field: 'visionStatus',
    options: [
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' },
      { value: 'poor', label: 'Poor' }
    ]
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Expectations & Goals',
    description: 'Your goals and expectations for hearing aids.'
  });

  card.appendChild(textArea({
    label: 'What is your primary goal for hearing improvement?',
    section: 'expectationsGoals', field: 'primaryGoal',
    placeholder: 'e.g. better conversation with family, hearing TV clearly, phone calls…',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Do you have realistic expectations about what hearing aids can achieve?',
    section: 'expectationsGoals', field: 'realisticExpectations', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'How willing are you to wear hearing aids daily?',
    section: 'expectationsGoals', field: 'willingnessToWear',
    options: [
      { value: 'very-willing', label: 'Very willing' },
      { value: 'willing', label: 'Willing' },
      { value: 'uncertain', label: 'Uncertain' },
      { value: 'reluctant', label: 'Reluctant' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Do you have concerns about the cost of hearing aids?',
    section: 'expectationsGoals', field: 'budgetConcerns',
    options: [
      { value: 'none', label: 'No concerns' },
      { value: 'mild', label: 'Mild concerns' },
      { value: 'moderate', label: 'Moderate concerns' },
      { value: 'significant', label: 'Significant concerns' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Do you have concerns about the cosmetic appearance of hearing aids?',
    section: 'expectationsGoals', field: 'cosmeticConcerns',
    options: [
      { value: 'none', label: 'No concerns' },
      { value: 'mild', label: 'Mild concerns' },
      { value: 'moderate', label: 'Moderate concerns' },
      { value: 'significant', label: 'Significant concerns' }
    ]
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
    const current = state[section] && state[section][field];
    host.style.display = String(current) === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics (4)
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  // Hearing history (9)
  ['hearingHistory', 'onsetType'],
  ['hearingHistory', 'duration'],
  ['hearingHistory', 'affectedEar'],
  ['hearingHistory', 'familyHistory'],
  ['hearingHistory', 'noiseExposure'],
  ['hearingHistory', 'tinnitus'],
  ['hearingHistory', 'vertigo'],
  ['hearingHistory', 'earSurgery'],
  ['hearingHistory', 'ototoxicMedications'],
  // HHIE-S (10)
  ['hhiesQuestionnaire', 'q1'],
  ['hhiesQuestionnaire', 'q2'],
  ['hhiesQuestionnaire', 'q3'],
  ['hhiesQuestionnaire', 'q4'],
  ['hhiesQuestionnaire', 'q5'],
  ['hhiesQuestionnaire', 'q6'],
  ['hhiesQuestionnaire', 'q7'],
  ['hhiesQuestionnaire', 'q8'],
  ['hhiesQuestionnaire', 'q9'],
  ['hhiesQuestionnaire', 'q10'],
  // Communication difficulties (6)
  ['communicationDifficulties', 'quietConversation'],
  ['communicationDifficulties', 'groupConversation'],
  ['communicationDifficulties', 'telephone'],
  ['communicationDifficulties', 'television'],
  ['communicationDifficulties', 'publicPlaces'],
  ['communicationDifficulties', 'workDifficulty'],
  // Current hearing aids (1 — gate)
  ['currentHearingAids', 'hasHearingAids'],
  // Ear examination (2 — primary cerumen markers)
  ['earExamination', 'cerumenLeft'],
  ['earExamination', 'cerumenRight'],
  // Audiogram (1)
  ['audiogramResults', 'hearingLossType'],
  // Lifestyle / needs (3)
  ['lifestyleNeeds', 'technologyComfort'],
  ['lifestyleNeeds', 'dexterity'],
  ['lifestyleNeeds', 'visionStatus'],
  // Expectations / goals (4)
  ['expectationsGoals', 'realisticExpectations'],
  ['expectationsGoals', 'willingnessToWear'],
  ['expectationsGoals', 'budgetConcerns'],
  ['expectationsGoals', 'cosmeticConcerns']
];

function fieldIsAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  for (const [section, field] of TRACKED_FIELDS) {
    if (fieldIsAnswered(section, field)) answered++;
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

  const { hhiesScore, hhiesCategory: severity, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td class="num">${r.score} / 4</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No HHIE-S items scored above zero.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Domain</th>
            <th scope="col">Question</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  // Audiogram summary line for context.
  const a = state.audiogramResults;
  const audiogramLine = (a.leftPTA !== null || a.rightPTA !== null)
    ? `<p class="muted">Left PTA: ${a.leftPTA ?? '—'} dB HL (${esc(hearingLossGrade(a.leftPTA))}); Right PTA: ${a.rightPTA ?? '—'} dB HL (${esc(hearingLossGrade(a.rightPTA))}).</p>`
    : '';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Hearing Aid Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>HHIE-S Total Score</h3>
      <p class="hhies-summary">
        <span class="hhies-score-badge ${hhiesSeverityClass(hhiesScore)}">${hhiesScore} / 40</span>
        <span class="severity-level">${esc(severity)}</span>
      </p>
      ${audiogramLine}

      <h3>Per-question scores (items above zero)</h3>
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
  const { hhiesScore, hhiesCategoryLabel, firedRules } = calculateHHIES(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    hhiesScore,
    hhiesCategory: hhiesCategoryLabel,
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

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'demographics', title: 'Demographics' },
  { step: 2, section: 'hearingHistory', title: 'Hearing History' },
  { step: 3, section: '', title: 'HHIE-S Questionnaire' },
  { step: 4, section: 'communicationDifficulties', title: 'Communication Difficulties' },
  { step: 5, section: 'currentHearingAids', title: 'Current Hearing Aids' },
  { step: 6, section: 'earExamination', title: 'Ear Examination' },
  { step: 7, section: 'audiogramResults', title: 'Audiogram Results' },
  { step: 8, section: 'lifestyleNeeds', title: 'Lifestyle & Needs' },
  { step: 9, section: 'expectationsGoals', title: 'Expectations & Goals' }
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
