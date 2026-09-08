import { detectAdditionalFlags } from './flagged-issues.js';
import { calculatePcl5 } from './pcl5-grader.js';
import { detectFiredRules } from './pcl5-rules.js';
import { categoryDescription, emptyAssessment, pclResponseOptions } from './types.js';

// Post-Traumatic Stress Assessment — patient wizard (vanilla JavaScript,
// no build).
//
// Single-page continuous wizard: every PCL-5 cluster section is rendered
// into the page in document order. The user scrolls through them; a sticky
// top-of-page progress bar reflects how many fields have been answered.
// Submission runs the pure PCL-5 scoring engine and renders an inline,
// aria-live report.
//
// State is persisted to localStorage so a partial fill survives a page
// reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'post-traumatic-stress-assessment.front-end-form-with-html.v1';

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
  slug: 'post-traumatic-stress-assessment',
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
}

/** Escape user-entered text for safe rendering. */
function esc(s) {
  return String(s == null ? '' : s)
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
 * Build a labelled text/date input.
 * @param {{ label: string, section: string, field: string, type?: string,
 *           placeholder?: string, required?: boolean }} opts
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
  const value = state[opts.section][opts.field];
  const requiredAttrs = opts.required ? ' data-required' : '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${lilyInputClass(type)}"`,
    `value="${esc(value == null ? '' : value)}"`,
    `aria-describedby="${id}-error"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${requiredAttrs}>${labelText}</label>
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

/**
 * Build a labelled multi-line text area.
 * @param {{ label: string, section: string, field: string, rows?: number,
 *           placeholder?: string }} opts
 */
function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] || '';
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
 * Build a generic radio group (used for sex, etc.).
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
 * Build a single PCL-5 0-4 rating row. Persists numeric values (or null).
 * @param {{ number: number, label: string, section: string, field: string }} opts
 */
function pclRating(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];

  const wrapper = document.createElement('div');
  wrapper.className = 'field pcl-item';

  const labelEl = document.createElement('span');
  labelEl.className = 'label';
  labelEl.id = `${groupId}-label`;
  labelEl.textContent = opts.label;
  wrapper.appendChild(labelEl);

  const list = document.createElement('div');
  list.className = 'radio-group pcl-options';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', `${groupId}-label`);
  for (const option of pclResponseOptions) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.className = 'pcl-option';
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    label.innerHTML = `
      <input type="radio" class="radio-input" id="${radioId}" name="${groupId}" value="${option.value}"${checked}>
      <span class="opt-num">${option.value}</span>
      <span class="opt-label">${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) setField(opts.section, opts.field, Number(option.value));
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);
  return wrapper;
}

/**
 * Build a checkbox row (used by the "still happening" trauma-event flag).
 * @param {{ label: string, section: string, field: string }} opts
 */
function checkboxRow(opts) {
  const id = `${opts.section}-${opts.field}`;
  const checked = state[opts.section][opts.field] ? ' checked' : '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const list = document.createElement('div');
  list.className = 'checkbox-group';
  list.setAttribute('role', 'group');
  const label = document.createElement('label');
  label.htmlFor = id;
  label.innerHTML = `
    <input type="checkbox" class="checkbox-input" id="${id}" name="${id}"${checked}>
    <span>${esc(opts.label)}</span>
  `;
  const input = label.querySelector('input');
  input.addEventListener('change', () => {
    setField(opts.section, opts.field, input.checked);
  });
  list.appendChild(label);
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
    `<span class="section-step">Section ${opts.stepNumber} of 6</span>` +
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
    description: 'Basic patient information.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'First name', section: 'demographics', field: 'firstName', required: true
  }));
  grid.appendChild(textInput({
    label: 'Last name', section: 'demographics', field: 'lastName', required: true
  }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Date of birth',
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

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Trauma Event Identification',
    description: 'The PCL-5 must be anchored to a specific traumatic event (DSM-5 Criterion A). Please briefly describe the worst event you have experienced.'
  });

  card.appendChild(textArea({
    label: "Event description (keep brief — you don't need to describe it in detail)",
    section: 'traumaEvent', field: 'eventDescription', rows: 3,
    placeholder: 'e.g. road traffic accident, military deployment, assault…'
  }));

  card.appendChild(textInput({
    label: 'Event date (approximate is fine)',
    section: 'traumaEvent', field: 'eventDate', type: 'date'
  }));

  card.appendChild(checkboxRow({
    label: 'The event or situation is still happening',
    section: 'traumaEvent', field: 'isOngoing'
  }));

  const callout = document.createElement('p');
  callout.className = 'callout';
  callout.innerHTML = '<strong>Following questions refer to this event.</strong> Please answer based on how much you have been bothered by each problem <em>in the past month</em>.';
  card.appendChild(callout);

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Intrusion Symptoms (DSM-5 Cluster B)',
    description: 'In the past month, how much were you bothered by:'
  });

  card.appendChild(pclRating({
    number: 1,
    label: '1. Repeated, disturbing, and unwanted memories of the stressful experience?',
    section: 'clusterBIntrusion', field: 'item1RepeatedDisturbingMemories'
  }));
  card.appendChild(pclRating({
    number: 2,
    label: '2. Repeated, disturbing dreams of the stressful experience?',
    section: 'clusterBIntrusion', field: 'item2RepeatedDisturbingDreams'
  }));
  card.appendChild(pclRating({
    number: 3,
    label: '3. Suddenly feeling or acting as if the stressful experience were actually happening again (as if you were actually back there re-living it)?',
    section: 'clusterBIntrusion', field: 'item3FeelingReliving'
  }));
  card.appendChild(pclRating({
    number: 4,
    label: '4. Feeling very upset when something reminded you of the stressful experience?',
    section: 'clusterBIntrusion', field: 'item4FeelingUpsetByReminders'
  }));
  card.appendChild(pclRating({
    number: 5,
    label: '5. Having strong physical reactions when something reminded you of the stressful experience (for example heart pounding, trouble breathing, sweating)?',
    section: 'clusterBIntrusion', field: 'item5StrongPhysicalReactions'
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Avoidance Symptoms (DSM-5 Cluster C)',
    description: 'In the past month, how much were you bothered by:'
  });

  card.appendChild(pclRating({
    number: 6,
    label: '6. Avoiding memories, thoughts, or feelings related to the stressful experience?',
    section: 'clusterCAvoidance', field: 'item6AvoidingMemoriesThoughtsFeelings'
  }));
  card.appendChild(pclRating({
    number: 7,
    label: '7. Avoiding external reminders of the stressful experience (for example people, places, conversations, activities, objects, or situations)?',
    section: 'clusterCAvoidance', field: 'item7AvoidingExternalReminders'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Negative Alterations in Cognitions & Mood (DSM-5 Cluster D)',
    description: 'In the past month, how much were you bothered by:'
  });

  card.appendChild(pclRating({
    number: 8,
    label: '8. Trouble remembering important parts of the stressful experience?',
    section: 'clusterDNegativeAlterations', field: 'item8TroubleRememberingImportantParts'
  }));
  card.appendChild(pclRating({
    number: 9,
    label: "9. Having strong negative beliefs about yourself, other people, or the world (for example 'I am bad', 'there is something seriously wrong with me', 'no one can be trusted', 'the world is completely dangerous')?",
    section: 'clusterDNegativeAlterations', field: 'item9StrongNegativeBeliefs'
  }));
  card.appendChild(pclRating({
    number: 10,
    label: '10. Blaming yourself or someone else for the stressful experience or what happened after it?',
    section: 'clusterDNegativeAlterations', field: 'item10BlamingSelfOrOthers'
  }));
  card.appendChild(pclRating({
    number: 11,
    label: '11. Having strong negative feelings such as fear, horror, anger, guilt, or shame?',
    section: 'clusterDNegativeAlterations', field: 'item11StrongNegativeFeelings'
  }));
  card.appendChild(pclRating({
    number: 12,
    label: '12. Loss of interest in activities that you used to enjoy?',
    section: 'clusterDNegativeAlterations', field: 'item12LossOfInterest'
  }));
  card.appendChild(pclRating({
    number: 13,
    label: '13. Feeling distant or cut off from other people?',
    section: 'clusterDNegativeAlterations', field: 'item13FeelingDistantFromOthers'
  }));
  card.appendChild(pclRating({
    number: 14,
    label: '14. Trouble experiencing positive feelings (for example being unable to feel happiness or have loving feelings for people close to you)?',
    section: 'clusterDNegativeAlterations', field: 'item14TroubleExperiencingPositiveFeelings'
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Alterations in Arousal & Reactivity (DSM-5 Cluster E)',
    description: 'In the past month, how much were you bothered by:'
  });

  card.appendChild(pclRating({
    number: 15,
    label: '15. Irritable behaviour, angry outbursts, or acting aggressively?',
    section: 'clusterEArousalReactivity', field: 'item15IrritableOrAggressive'
  }));
  card.appendChild(pclRating({
    number: 16,
    label: '16. Taking too many risks or doing things that could cause you harm?',
    section: 'clusterEArousalReactivity', field: 'item16RecklessOrSelfDestructive'
  }));
  card.appendChild(pclRating({
    number: 17,
    label: "17. Being 'super-alert' or watchful or on guard?",
    section: 'clusterEArousalReactivity', field: 'item17SuperAlertOrOnGuard'
  }));
  card.appendChild(pclRating({
    number: 18,
    label: '18. Feeling jumpy or easily startled?',
    section: 'clusterEArousalReactivity', field: 'item18JumpyOrEasilyStartled'
  }));
  card.appendChild(pclRating({
    number: 19,
    label: '19. Having difficulty concentrating?',
    section: 'clusterEArousalReactivity', field: 'item19DifficultyConcentrating'
  }));
  card.appendChild(pclRating({
    number: 20,
    label: '20. Trouble falling or staying asleep?',
    section: 'clusterEArousalReactivity', field: 'item20TroubleSleeping'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// 4 demographics + 2 trauma-event (description, date) + 20 PCL items = 26.
// `isOngoing` is excluded because false is its valid default value.
const TRACKED_FIELDS = [
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['traumaEvent', 'eventDescription'],
  ['traumaEvent', 'eventDate'],
  ['clusterBIntrusion', 'item1RepeatedDisturbingMemories'],
  ['clusterBIntrusion', 'item2RepeatedDisturbingDreams'],
  ['clusterBIntrusion', 'item3FeelingReliving'],
  ['clusterBIntrusion', 'item4FeelingUpsetByReminders'],
  ['clusterBIntrusion', 'item5StrongPhysicalReactions'],
  ['clusterCAvoidance', 'item6AvoidingMemoriesThoughtsFeelings'],
  ['clusterCAvoidance', 'item7AvoidingExternalReminders'],
  ['clusterDNegativeAlterations', 'item8TroubleRememberingImportantParts'],
  ['clusterDNegativeAlterations', 'item9StrongNegativeBeliefs'],
  ['clusterDNegativeAlterations', 'item10BlamingSelfOrOthers'],
  ['clusterDNegativeAlterations', 'item11StrongNegativeFeelings'],
  ['clusterDNegativeAlterations', 'item12LossOfInterest'],
  ['clusterDNegativeAlterations', 'item13FeelingDistantFromOthers'],
  ['clusterDNegativeAlterations', 'item14TroubleExperiencingPositiveFeelings'],
  ['clusterEArousalReactivity', 'item15IrritableOrAggressive'],
  ['clusterEArousalReactivity', 'item16RecklessOrSelfDestructive'],
  ['clusterEArousalReactivity', 'item17SuperAlertOrOnGuard'],
  ['clusterEArousalReactivity', 'item18JumpyOrEasilyStartled'],
  ['clusterEArousalReactivity', 'item19DifficultyConcentrating'],
  ['clusterEArousalReactivity', 'item20TroubleSleeping']
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
  { step: 1, section: 'demographics',                title: 'Demographics' },
  { step: 2, section: 'traumaEvent',                 title: 'Trauma Event' },
  { step: 3, section: 'clusterBIntrusion',           title: 'Intrusion' },
  { step: 4, section: 'clusterCAvoidance',           title: 'Avoidance' },
  { step: 5, section: 'clusterDNegativeAlterations', title: 'Negative Alt.' },
  { step: 6, section: 'clusterEArousalReactivity',   title: 'Arousal' }
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
    case 'high':   return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low':    return 'flag-low';
    default: return '';
  }
}

function severityClass(severity) {
  switch (severity) {
    case 'critical': return 'severity-critical';
    case 'high':     return 'severity-high';
    case 'medium':   return 'severity-medium';
    case 'low':      return 'severity-low';
    default: return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    totalScore, category, probableDsm5Diagnosis, clusterScores,
    answeredCount, firedRules, additionalFlags, timestamp
  } = lastResult;

  const dsm5HtmlText = probableDsm5Diagnosis
    ? '<span class="dsm5-badge">Probable DSM-5 PTSD pattern met</span>'
    : '<span class="dsm5-badge no">DSM-5 PTSD pattern not met</span>';

  const clusterRows = `
    <tr><th scope="row">B — Intrusion (5 items, 0-20)</th><td class="num">${clusterScores.b} / 20</td></tr>
    <tr><th scope="row">C — Avoidance (2 items, 0-8)</th><td class="num">${clusterScores.c} / 8</td></tr>
    <tr><th scope="row">D — Negative alterations (7 items, 0-28)</th><td class="num">${clusterScores.d} / 28</td></tr>
    <tr><th scope="row">E — Arousal &amp; reactivity (6 items, 0-24)</th><td class="num">${clusterScores.e} / 24</td></tr>
  `;

  const firedHtml = firedRules.length === 0
    ? `<p class="muted">No clinical-summary rules fired.</p>`
    : `
      <ul class="rules">
        ${firedRules.map((r) => `
          <li class="${severityClass(r.severity)}">
            <span class="rule-severity">${esc(r.severity.toUpperCase())}</span>
            <span class="rule-id">${esc(r.id)}</span>
            <span class="rule-message"><strong>${esc(r.category)}.</strong> ${esc(r.description)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const flagsHtml = additionalFlags.length === 0
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
        <h2>Post-Traumatic Stress Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>PCL-5 Total Score</h3>
      <p class="score-summary">
        <span class="score-badge severity-${esc(category)}">${totalScore} / 80</span>
        <span class="severity-label">${esc(category)}</span>
        ${dsm5HtmlText}
      </p>
      <p class="muted">${esc(categoryDescription(category))}</p>
      <p class="muted">Based on ${answeredCount} of 20 PCL-5 items answered.</p>

      <h3>Cluster sub-scores</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">DSM-5 cluster</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${clusterRows}</tbody>
      </table>

      <h3>Clinical summary rules</h3>
      ${firedHtml}

      <h3>Flagged Issues</h3>
      ${flagsHtml}

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
  const { totalScore, category, probableDsm5Diagnosis, clusterScores, answeredCount } = calculatePcl5(state);
  const firedRules = detectFiredRules(state, totalScore, category, probableDsm5Diagnosis);
  const additionalFlags = detectAdditionalFlags(state, totalScore, probableDsm5Diagnosis, answeredCount);
  lastResult = {
    totalScore,
    category,
    probableDsm5Diagnosis,
    clusterScores,
    answeredCount,
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
