import { calculateDass21, severityLabel } from './dass21-grader.js';
import { dass21Rules } from './dass21-rules.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { emptyAssessment } from './types.js';

// Psychology Assessment - patient wizard (vanilla ES module).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a top-of-page progress
// summary reflects how many fields have been answered. Submission runs the
// pure scoring engine and renders an inline report. State is persisted to
// localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'psychology-assessment.front-end-form-with-html.v1';

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
  slug: 'psychology-assessment',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the report.</p>';
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
 * @param {keyof import('./types.js').AssessmentData} section
 * @param {string} field
 * @param {any} value
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
 *           placeholder?: string, required?: boolean, min?: number, max?: number,
 *           unit?: string }} opts
 */
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
  const value = state[opts.section][opts.field] ?? '';
  const requiredAttrs = opts.required ? ' data-required' : '';
  const labelText = esc(opts.label) + (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${lilyInputClass(type)}"`,
    `value="${esc(value)}"`,
    `aria-describedby="${id}-error"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${requiredAttrs}>${labelText}</label>
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
 * Build a radio group.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[] }} opts
 */
function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const labelEl = document.createElement('span');
  labelEl.className = 'label';
  labelEl.id = `${groupId}-label`;
  labelEl.textContent = opts.label;
  wrapper.appendChild(labelEl);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', `${groupId}-label`);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    label.innerHTML = `
      <input type="radio" class="radio-input" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}>
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
 * Build a DASS-21 Likert item (4 buttons: 0 / 1 / 2 / 3).
 * @param {{ itemNumber: number, text: string, section: string, field: string }} opts
 */
function dassItem(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('div');
  wrapper.className = 'field dass-item';

  const labelEl = document.createElement('span');
  labelEl.className = 'label';
  labelEl.id = `${groupId}-label`;
  labelEl.innerHTML = `<span class="dass-num">${opts.itemNumber}.</span> ${esc(opts.text)}`;
  wrapper.appendChild(labelEl);

  const list = document.createElement('div');
  list.className = 'radio-group likert';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', `${groupId}-label`);

  const labels = [
    { value: 0, label: 'Did not apply' },
    { value: 1, label: 'Applied to some degree' },
    { value: 2, label: 'Applied considerably' },
    { value: 3, label: 'Applied very much' }
  ];
  for (const opt of labels) {
    const radioId = `${groupId}-${opt.value}`;
    const lab = document.createElement('label');
    lab.className = 'likert-btn';
    lab.htmlFor = radioId;
    const checked = current === opt.value ? ' checked' : '';
    lab.innerHTML = `
      <input type="radio" class="radio-input" id="${radioId}" name="${groupId}" value="${opt.value}"${checked}>
      <span class="likert-value" aria-hidden="true">${opt.value}</span>
      <span class="likert-label">${esc(opt.label)}</span>
    `;
    const input = lab.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) setField(opts.section, opts.field, opt.value);
    });
    list.appendChild(lab);
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
    `<span class="section-step">Section ${opts.stepNumber} of 8</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic information about you'
  });
  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'First Name',
    section: 'demographics',
    field: 'firstName',
    required: true
  }));
  grid.appendChild(textInput({
    label: 'Last Name',
    section: 'demographics',
    field: 'lastName',
    required: true
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
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
      { value: 'prefer-not-to-say', label: 'Prefer not to say' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Occupation',
    section: 'demographics',
    field: 'occupation',
    placeholder: 'e.g. Teacher, Software Developer, Student'
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Reason for Assessment',
    description: 'Tell us why you are completing this assessment today'
  });
  card.appendChild(radioGroup({
    label: 'Referral source',
    section: 'reasonForAssessment',
    field: 'reason',
    options: [
      { value: 'self-referral', label: 'Self-referral' },
      { value: 'gp-referral', label: 'GP / primary care' },
      { value: 'employer-referral', label: 'Employer / occupational health' },
      { value: 'follow-up', label: 'Follow-up appointment' },
      { value: 'screening', label: 'Routine screening' },
      { value: 'other', label: 'Other' }
    ]
  }));
  // Conditional: details when reason === 'other'
  const detailsHost = document.createElement('div');
  detailsHost.dataset.conditional = 'reasonForAssessment.reason=other';
  detailsHost.appendChild(textInput({
    label: 'Please describe the referral source',
    section: 'reasonForAssessment',
    field: 'reasonDetails'
  }));
  card.appendChild(detailsHost);

  card.appendChild(textArea({
    label: 'What is your primary concern?',
    section: 'reasonForAssessment',
    field: 'primaryConcern',
    placeholder: 'In your own words, what brought you here today?',
    rows: 4
  }));
  card.appendChild(textInput({
    label: 'How long have you experienced these symptoms?',
    section: 'reasonForAssessment',
    field: 'symptomDurationWeeks',
    type: 'number',
    min: 0,
    max: 520,
    unit: 'weeks'
  }));
  return card;
}

function renderDassSection(stepNumber, title, description, sectionKey, items) {
  const card = sectionCard({ stepNumber, title, description });
  for (const it of items) {
    card.appendChild(dassItem({
      itemNumber: it.itemNumber,
      text: it.text,
      section: sectionKey,
      field: it.field
    }));
  }
  return card;
}

function renderStep3() {
  return renderDassSection(
    3,
    'DASS-21 — Depression',
    'Please read each statement and decide how much it applied to you over the past week. There are no right or wrong answers.',
    'dassDepression',
    [
      { itemNumber: 3, field: 'item3CouldNotExperiencePositive', text: "I couldn't seem to experience any positive feeling at all." },
      { itemNumber: 5, field: 'item5DifficultInitiating', text: 'I found it difficult to work up the initiative to do things.' },
      { itemNumber: 10, field: 'item10NothingToLookForwardTo', text: 'I felt that I had nothing to look forward to.' },
      { itemNumber: 13, field: 'item13DownheartedBlue', text: 'I felt down-hearted and blue.' },
      { itemNumber: 16, field: 'item16UnableToBecomeEnthusiastic', text: 'I was unable to become enthusiastic about anything.' },
      { itemNumber: 17, field: 'item17NotWorthMuch', text: "I felt I wasn't worth much as a person." },
      { itemNumber: 21, field: 'item21LifeMeaningless', text: 'I felt that life was meaningless.' }
    ]
  );
}

function renderStep4() {
  return renderDassSection(
    4,
    'DASS-21 — Anxiety',
    'Please read each statement and decide how much it applied to you over the past week.',
    'dassAnxiety',
    [
      { itemNumber: 2, field: 'item2DrynessOfMouth', text: 'I was aware of dryness of my mouth.' },
      { itemNumber: 4, field: 'item4BreathingDifficulty', text: 'I experienced breathing difficulty (e.g. excessively rapid breathing, breathlessness in the absence of physical exertion).' },
      { itemNumber: 7, field: 'item7Trembling', text: 'I experienced trembling (e.g. in the hands).' },
      { itemNumber: 9, field: 'item9PanicWorry', text: 'I was worried about situations in which I might panic and make a fool of myself.' },
      { itemNumber: 15, field: 'item15ClosedToPanic', text: 'I felt I was close to panic.' },
      { itemNumber: 19, field: 'item19HeartActionAware', text: 'I was aware of the action of my heart in the absence of physical exertion (e.g. sense of heart rate increase, heart missing a beat).' },
      { itemNumber: 20, field: 'item20ScaredWithoutReason', text: 'I felt scared without any good reason.' }
    ]
  );
}

function renderStep5() {
  return renderDassSection(
    5,
    'DASS-21 — Stress',
    'Please read each statement and decide how much it applied to you over the past week.',
    'dassStress',
    [
      { itemNumber: 1, field: 'item1HardToWindDown', text: 'I found it hard to wind down.' },
      { itemNumber: 6, field: 'item6OverReact', text: 'I tended to over-react to situations.' },
      { itemNumber: 8, field: 'item8NervousEnergy', text: 'I felt that I was using a lot of nervous energy.' },
      { itemNumber: 11, field: 'item11AgitatedEasily', text: 'I found myself getting agitated.' },
      { itemNumber: 12, field: 'item12DifficultToRelax', text: 'I found it difficult to relax.' },
      { itemNumber: 14, field: 'item14Intolerant', text: 'I was intolerant of anything that kept me from getting on with what I was doing.' },
      { itemNumber: 18, field: 'item18TouchyEasily', text: 'I felt that I was rather touchy.' }
    ]
  );
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Functional Impact',
    description: 'How much have your difficulties affected the following areas of your life?'
  });
  const impactOptions = [
    { value: 'none', label: 'No impact' },
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' }
  ];
  card.appendChild(radioGroup({ label: 'Work or study', section: 'functionalImpact', field: 'workImpact', options: impactOptions }));
  card.appendChild(radioGroup({ label: 'Relationships with family or friends', section: 'functionalImpact', field: 'relationshipImpact', options: impactOptions }));
  card.appendChild(radioGroup({ label: 'Daily activities (e.g. self-care, errands, hobbies)', section: 'functionalImpact', field: 'dailyActivitiesImpact', options: impactOptions }));
  card.appendChild(radioGroup({ label: 'Sleep', section: 'functionalImpact', field: 'sleepImpact', options: impactOptions }));
  card.appendChild(textArea({
    label: 'Anything else you would like the clinician to know about how this is affecting your life?',
    section: 'functionalImpact',
    field: 'notes',
    rows: 3
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Risk Screen',
    description: 'A few short safety questions. Your answers help your clinician keep you safe and supported. If you are in immediate danger, contact emergency services.'
  });
  const notice = document.createElement('div');
  notice.className = 'safety-notice';
  notice.innerHTML = 'If you are having thoughts of suicide or self-harm right now, please call your local emergency number, or contact a crisis line such as the Samaritans (UK 116 123) or 988 Suicide &amp; Crisis Lifeline (US).';
  card.appendChild(notice);

  const yesNo = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  card.appendChild(radioGroup({
    label: 'In the past two weeks, have you had thoughts of suicide or that you would be better off dead?',
    section: 'riskScreen',
    field: 'suicidalIdeation',
    options: yesNo
  }));

  const ideationDetails = document.createElement('div');
  ideationDetails.dataset.conditional = 'riskScreen.suicidalIdeation=yes';
  ideationDetails.appendChild(textArea({
    label: 'If you feel comfortable, please share more (frequency, plans, intent)',
    section: 'riskScreen',
    field: 'suicidalIdeationDetails',
    rows: 3
  }));
  card.appendChild(ideationDetails);

  card.appendChild(radioGroup({
    label: 'In the past two weeks, have you intentionally hurt yourself (e.g. cutting, burning)?',
    section: 'riskScreen',
    field: 'selfHarm',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'In the past two weeks, have you had thoughts of harming someone else?',
    section: 'riskScreen',
    field: 'harmToOthers',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have you ever had a psychiatric emergency (e.g. ED visit, crisis admission, sectioning)?',
    section: 'riskScreen',
    field: 'psychiatricEmergencyHistory',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you currently have a written or agreed safety plan?',
    section: 'riskScreen',
    field: 'hasSafetyPlan',
    options: yesNo
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Support and History',
    description: 'Background to help your clinician'
  });
  const yesNo = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];
  const supportOptions = [
    { value: 'strong', label: 'Strong' },
    { value: 'adequate', label: 'Adequate' },
    { value: 'limited', label: 'Limited' },
    { value: 'isolated', label: 'Isolated' }
  ];

  card.appendChild(radioGroup({
    label: 'Have you ever received mental health support before?',
    section: 'supportAndHistory',
    field: 'previousMentalHealthCare',
    options: yesNo
  }));
  const prevDetails = document.createElement('div');
  prevDetails.dataset.conditional = 'supportAndHistory.previousMentalHealthCare=yes';
  prevDetails.appendChild(textArea({
    label: 'Briefly describe (when, what kind, was it helpful?)',
    section: 'supportAndHistory',
    field: 'previousMentalHealthDetails',
    rows: 3
  }));
  card.appendChild(prevDetails);

  card.appendChild(radioGroup({
    label: 'Are you currently in any form of mental health treatment?',
    section: 'supportAndHistory',
    field: 'currentlyInTreatment',
    options: yesNo
  }));
  const curTreatmentDetails = document.createElement('div');
  curTreatmentDetails.dataset.conditional = 'supportAndHistory.currentlyInTreatment=yes';
  curTreatmentDetails.appendChild(textArea({
    label: 'Describe your current treatment (provider, frequency)',
    section: 'supportAndHistory',
    field: 'currentTreatmentDetails',
    rows: 3
  }));
  card.appendChild(curTreatmentDetails);

  card.appendChild(textArea({
    label: 'Current medications (psychiatric or otherwise)',
    section: 'supportAndHistory',
    field: 'currentMedications',
    placeholder: 'One per line',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Is there a history of mental health conditions in your family?',
    section: 'supportAndHistory',
    field: 'familyMentalHealthHistory',
    options: yesNo
  }));
  const familyDetails = document.createElement('div');
  familyDetails.dataset.conditional = 'supportAndHistory.familyMentalHealthHistory=yes';
  familyDetails.appendChild(textArea({
    label: 'Briefly describe',
    section: 'supportAndHistory',
    field: 'familyMentalHealthDetails',
    rows: 2
  }));
  card.appendChild(familyDetails);

  card.appendChild(radioGroup({
    label: 'How would you describe your current social support?',
    section: 'supportAndHistory',
    field: 'socialSupport',
    options: supportOptions
  }));
  card.appendChild(radioGroup({
    label: 'Are you concerned about your alcohol or drug use?',
    section: 'supportAndHistory',
    field: 'substanceUseConcern',
    options: yesNo
  }));
  return card;
}

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  const hosts = document.querySelectorAll('[data-conditional]');
  hosts.forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = state[section]?.[field];
    const visible = String(current) === target;
    host.style.display = visible ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics (4 required-ish fields excluding occupation)
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  // Reason for Assessment (referral + concern)
  ['reasonForAssessment', 'reason'],
  ['reasonForAssessment', 'primaryConcern'],
  // 21 DASS items
  ['dassDepression', 'item3CouldNotExperiencePositive'],
  ['dassDepression', 'item5DifficultInitiating'],
  ['dassDepression', 'item10NothingToLookForwardTo'],
  ['dassDepression', 'item13DownheartedBlue'],
  ['dassDepression', 'item16UnableToBecomeEnthusiastic'],
  ['dassDepression', 'item17NotWorthMuch'],
  ['dassDepression', 'item21LifeMeaningless'],
  ['dassAnxiety', 'item2DrynessOfMouth'],
  ['dassAnxiety', 'item4BreathingDifficulty'],
  ['dassAnxiety', 'item7Trembling'],
  ['dassAnxiety', 'item9PanicWorry'],
  ['dassAnxiety', 'item15ClosedToPanic'],
  ['dassAnxiety', 'item19HeartActionAware'],
  ['dassAnxiety', 'item20ScaredWithoutReason'],
  ['dassStress', 'item1HardToWindDown'],
  ['dassStress', 'item6OverReact'],
  ['dassStress', 'item8NervousEnergy'],
  ['dassStress', 'item11AgitatedEasily'],
  ['dassStress', 'item12DifficultToRelax'],
  ['dassStress', 'item14Intolerant'],
  ['dassStress', 'item18TouchyEasily'],
  // Functional impact (4 domains)
  ['functionalImpact', 'workImpact'],
  ['functionalImpact', 'relationshipImpact'],
  ['functionalImpact', 'dailyActivitiesImpact'],
  ['functionalImpact', 'sleepImpact'],
  // Risk screen (5 yes/no items)
  ['riskScreen', 'suicidalIdeation'],
  ['riskScreen', 'selfHarm'],
  ['riskScreen', 'harmToOthers'],
  ['riskScreen', 'psychiatricEmergencyHistory'],
  ['riskScreen', 'hasSafetyPlan'],
  // Support and history
  ['supportAndHistory', 'previousMentalHealthCare'],
  ['supportAndHistory', 'currentlyInTreatment'],
  ['supportAndHistory', 'familyMentalHealthHistory'],
  ['supportAndHistory', 'socialSupport'],
  ['supportAndHistory', 'substanceUseConcern']
];

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    const v = state[section][field];
    const isAnswered = v !== null && v !== undefined && v !== '';
    if (isAnswered) {
      answered++;
      sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
    }
  }
  const total = TRACKED_FIELDS.length;
  const percent = Math.round((answered / total) * 100);
  const progress = document.getElementById('progress');
  const text = document.getElementById('progress-text');
  if (progress) progress.value = percent;
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Step list
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'demographics',         title: 'Demographics' },
  { step: 2, section: 'reasonForAssessment',  title: 'Reason' },
  { step: 3, section: 'dassDepression',       title: 'Depression' },
  { step: 4, section: 'dassAnxiety',          title: 'Anxiety' },
  { step: 5, section: 'dassStress',           title: 'Stress' },
  { step: 6, section: 'functionalImpact',     title: 'Functional' },
  { step: 7, section: 'riskScreen',           title: 'Risk' },
  { step: 8, section: 'supportAndHistory',    title: 'Support' }
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
  const required = form.querySelectorAll('input[data-required], select[data-required], textarea[data-required]');
  required.forEach((input) => {
    const id = input.id;
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
  summary.innerHTML = `
    <strong>Please correct the following:</strong>
    <ul>
      ${errors.map((e) => `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`).join('')}
    </ul>
  `;
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  summary.focus({ preventScroll: true });
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

function severityClass(severity) {
  return `severity-${severity}`;
}

function renderReport() {
  const result = lastResult;
  if (!result) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { depression, anxiety, stress, additionalFlags, timestamp } = result;

  const subscaleRow = (name, score) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${score.raw} / 21</td>
      <td>${score.scaled} / 42</td>
      <td><span class="severity-badge ${severityClass(score.severity)}">${esc(severityLabel(score.severity))}</span></td>
      <td>${score.answered} / 7</td>
    </tr>
  `;

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

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>DASS-21 Subscale Scores</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Subscale</th>
            <th scope="col">Raw</th>
            <th scope="col">Scaled (doubled)</th>
            <th scope="col">Severity</th>
            <th scope="col">Items answered</th>
          </tr>
        </thead>
        <tbody>
          ${subscaleRow('Depression', depression)}
          ${subscaleRow('Anxiety', anxiety)}
          ${subscaleRow('Stress', stress)}
        </tbody>
      </table>

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
  const { depression, anxiety, stress, firedRules } = calculateDass21(state);
  const additionalFlags = detectAdditionalFlags(state, depression, anxiety, stress);
  lastResult = {
    depression,
    anxiety,
    stress,
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
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the report.</p>';
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
