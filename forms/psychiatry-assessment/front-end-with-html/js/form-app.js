import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateGAF } from './gaf-grader.js';
import { emptyAssessment, gafBracketClass, gafBracketLabel, gafScoreLabel } from './types.js';

// Psychiatry Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure GAF scoring engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'psychiatry-assessment.front-end-form-with-html.v1';

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
  slug: 'psychiatry-assessment',
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
 * Re-runs progress and conditional visibility after each change.
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

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const TOTAL_STEPS = 11;

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

/** Build a labelled text input. */
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
    <label class="label" for="${id}"${requiredAttrs}>${labelText}</label>
    <input ${attrs.join(' ')}>
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
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

/** Build a labelled multi-line textarea. */
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
    `<span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Repeating-list editor (medications)
// ----------------------------------------------------------------------

/** Editor for an array of {name, dose, frequency} medication rows. */
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
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Sertraline">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 50 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. once daily">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove medication">&times;</button>
        </div>
      `;
      r.querySelectorAll('input').forEach((inp) => {
        inp.addEventListener('input', () => {
          rows[idx][inp.dataset.key] = inp.value;
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
// Section renderers (1 per GAF step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic patient information and legal status.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'demographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'demographics', field: 'lastName', required: true }));
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

  const contactGrid = document.createElement('div');
  contactGrid.className = 'two-col';
  contactGrid.appendChild(textInput({
    label: 'Emergency Contact Name',
    section: 'demographics', field: 'emergencyContactName', required: true
  }));
  contactGrid.appendChild(textInput({
    label: 'Emergency Contact Phone',
    section: 'demographics', field: 'emergencyContactPhone',
    type: 'tel', required: true
  }));
  card.appendChild(contactGrid);

  card.appendChild(radioGroup({
    label: 'Legal Status',
    section: 'demographics', field: 'legalStatus',
    options: [
      { value: 'voluntary', label: 'Voluntary' },
      { value: 'involuntary', label: 'Involuntary' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Presenting Complaint',
    description: 'Current reason for assessment.'
  });

  card.appendChild(textArea({
    label: 'Chief Complaint',
    section: 'presentingComplaint', field: 'chiefComplaint',
    placeholder: 'Describe the primary reason for presentation',
    rows: 4
  }));
  card.appendChild(textInput({
    label: 'Onset Date',
    section: 'presentingComplaint', field: 'onsetDate',
    type: 'date'
  }));
  card.appendChild(textInput({
    label: 'Duration',
    section: 'presentingComplaint', field: 'duration',
    placeholder: 'e.g. 3 weeks, 6 months'
  }));
  card.appendChild(radioGroup({
    label: 'Severity',
    section: 'presentingComplaint', field: 'severity',
    options: [
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Precipitating Factors',
    section: 'presentingComplaint', field: 'precipitatingFactors',
    placeholder: 'Events or circumstances leading to current presentation'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Psychiatric History',
    description: 'Previous psychiatric diagnoses and treatment history.'
  });

  card.appendChild(textArea({
    label: 'Previous Diagnoses',
    section: 'psychiatricHistory', field: 'previousDiagnoses',
    placeholder: 'List any previous psychiatric diagnoses'
  }));

  card.appendChild(radioGroup({
    label: 'Previous psychiatric hospitalizations?',
    section: 'psychiatricHistory', field: 'previousHospitalizations',
    options: yesNo
  }));
  const hospHost = document.createElement('div');
  hospHost.dataset.conditional = 'psychiatricHistory.previousHospitalizations=yes';
  hospHost.appendChild(textArea({
    label: 'Hospitalization Details',
    section: 'psychiatricHistory', field: 'hospitalizationDetails',
    placeholder: 'Number of admissions, dates, reasons, duration'
  }));
  card.appendChild(hospHost);

  card.appendChild(radioGroup({
    label: 'Previous suicide attempts?',
    section: 'psychiatricHistory', field: 'previousSuicideAttempts',
    options: yesNo
  }));
  const suicHost = document.createElement('div');
  suicHost.dataset.conditional = 'psychiatricHistory.previousSuicideAttempts=yes';
  suicHost.appendChild(textArea({
    label: 'Suicide Attempt Details',
    section: 'psychiatricHistory', field: 'suicideAttemptDetails',
    placeholder: 'Number, method, circumstances, outcome'
  }));
  card.appendChild(suicHost);

  card.appendChild(radioGroup({
    label: 'History of self-harm?',
    section: 'psychiatricHistory', field: 'selfHarmHistory',
    options: yesNo
  }));
  const shHost = document.createElement('div');
  shHost.dataset.conditional = 'psychiatricHistory.selfHarmHistory=yes';
  shHost.appendChild(textArea({
    label: 'Self-Harm Details',
    section: 'psychiatricHistory', field: 'selfHarmDetails',
    placeholder: 'Type, frequency, most recent episode'
  }));
  card.appendChild(shHost);

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Mental Status Examination',
    description: 'Systematic assessment of mental state.'
  });

  card.appendChild(textInput({
    label: 'Appearance',
    section: 'mentalStatusExam', field: 'appearance',
    placeholder: 'e.g. well-groomed, dishevelled, unkempt'
  }));
  card.appendChild(textInput({
    label: 'Behaviour',
    section: 'mentalStatusExam', field: 'behaviour',
    placeholder: 'e.g. cooperative, agitated, guarded, withdrawn'
  }));
  card.appendChild(textInput({
    label: 'Speech',
    section: 'mentalStatusExam', field: 'speech',
    placeholder: 'e.g. normal rate/volume, pressured, slowed, mute'
  }));

  card.appendChild(selectInput({
    label: 'Mood (patient-reported)',
    section: 'mentalStatusExam', field: 'mood',
    options: [
      { value: 'euthymic', label: 'Euthymic (normal)' },
      { value: 'depressed', label: 'Depressed' },
      { value: 'elevated', label: 'Elevated' },
      { value: 'irritable', label: 'Irritable' },
      { value: 'anxious', label: 'Anxious' },
      { value: 'flat', label: 'Flat' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Affect (observed)',
    section: 'mentalStatusExam', field: 'affect',
    options: [
      { value: 'congruent', label: 'Congruent' },
      { value: 'incongruent', label: 'Incongruent' },
      { value: 'restricted', label: 'Restricted' },
      { value: 'blunted', label: 'Blunted' },
      { value: 'flat', label: 'Flat' },
      { value: 'labile', label: 'Labile' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Thought Process',
    section: 'mentalStatusExam', field: 'thoughtProcess',
    options: [
      { value: 'linear', label: 'Linear and goal-directed' },
      { value: 'circumstantial', label: 'Circumstantial' },
      { value: 'tangential', label: 'Tangential' },
      { value: 'loosening', label: 'Loosening of associations' },
      { value: 'flight-of-ideas', label: 'Flight of ideas' },
      { value: 'thought-blocking', label: 'Thought blocking' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Thought Content',
    section: 'mentalStatusExam', field: 'thoughtContent',
    placeholder: 'e.g. delusions, obsessions, overvalued ideas, ruminations'
  }));

  card.appendChild(radioGroup({
    label: 'Perceptual disturbances (hallucinations, illusions)?',
    section: 'mentalStatusExam', field: 'perceptualDisturbances',
    options: yesNo
  }));
  const percHost = document.createElement('div');
  percHost.dataset.conditional = 'mentalStatusExam.perceptualDisturbances=yes';
  percHost.appendChild(textArea({
    label: 'Perceptual Disturbance Details',
    section: 'mentalStatusExam', field: 'perceptualDetails',
    placeholder: 'Type (auditory, visual, tactile), content, frequency'
  }));
  card.appendChild(percHost);

  card.appendChild(radioGroup({
    label: 'Is cognition intact?',
    section: 'mentalStatusExam', field: 'cognitionIntact',
    options: yesNo
  }));
  const cogHost = document.createElement('div');
  cogHost.dataset.conditional = 'mentalStatusExam.cognitionIntact=no';
  cogHost.appendChild(textArea({
    label: 'Cognitive Impairment Details',
    section: 'mentalStatusExam', field: 'cognitionDetails',
    placeholder: 'Orientation, attention, memory, executive function'
  }));
  card.appendChild(cogHost);

  card.appendChild(selectInput({
    label: 'Insight',
    section: 'mentalStatusExam', field: 'insight',
    options: [
      { value: 'full', label: 'Full insight' },
      { value: 'partial', label: 'Partial insight' },
      { value: 'none', label: 'No insight' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Judgement',
    section: 'mentalStatusExam', field: 'judgement',
    options: [
      { value: 'intact', label: 'Intact' },
      { value: 'impaired', label: 'Impaired' },
      { value: 'poor', label: 'Poor' }
    ]
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Risk Assessment',
    description: 'Assessment of risk to self and others.'
  });

  card.appendChild(radioGroup({
    label: 'Is the patient experiencing suicidal ideation?',
    section: 'riskAssessment', field: 'suicidalIdeation',
    options: yesNo
  }));

  // Plan / intent / means only shown if ideation = yes
  const ideationHost = document.createElement('div');
  ideationHost.dataset.conditional = 'riskAssessment.suicidalIdeation=yes';
  ideationHost.appendChild(radioGroup({
    label: 'Does the patient have a suicide plan?',
    section: 'riskAssessment', field: 'suicidalPlan',
    options: yesNo
  }));
  ideationHost.appendChild(radioGroup({
    label: 'Does the patient express intent to act?',
    section: 'riskAssessment', field: 'suicidalIntent',
    options: yesNo
  }));
  ideationHost.appendChild(radioGroup({
    label: 'Does the patient have access to means?',
    section: 'riskAssessment', field: 'suicidalMeans',
    options: yesNo
  }));
  card.appendChild(ideationHost);

  card.appendChild(textArea({
    label: 'Protective Factors',
    section: 'riskAssessment', field: 'protectiveFactors',
    placeholder: 'e.g. family support, children, religious beliefs, future plans'
  }));

  card.appendChild(radioGroup({
    label: 'Current self-harm behaviour?',
    section: 'riskAssessment', field: 'selfHarmCurrent',
    options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Violence Risk',
    section: 'riskAssessment', field: 'violenceRisk',
    options: [
      { value: 'none', label: 'None identified' },
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high', label: 'High' },
      { value: 'imminent', label: 'Imminent' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Safeguarding concerns?',
    section: 'riskAssessment', field: 'safeguardingConcerns',
    options: yesNo
  }));
  const safeHost = document.createElement('div');
  safeHost.dataset.conditional = 'riskAssessment.safeguardingConcerns=yes';
  safeHost.appendChild(textArea({
    label: 'Safeguarding Details',
    section: 'riskAssessment', field: 'safeguardingDetails',
    placeholder: 'Details of safeguarding concerns'
  }));
  card.appendChild(safeHost);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Mood & Anxiety',
    description: 'Standardised screening scores and symptom assessment.'
  });

  card.appendChild(textInput({
    label: 'PHQ-9 Score (brief depression screen)',
    section: 'moodAndAnxiety', field: 'phq9Score',
    type: 'number', min: 0, max: 27,
    hint: '0-4 minimal, 5-9 mild, 10-14 moderate, 15-19 moderately severe, 20-27 severe'
  }));

  card.appendChild(textInput({
    label: 'GAD-7 Score (brief anxiety screen)',
    section: 'moodAndAnxiety', field: 'gad7Score',
    type: 'number', min: 0, max: 21,
    hint: '0-4 minimal, 5-9 mild, 10-14 moderate, 15-21 severe'
  }));

  card.appendChild(radioGroup({
    label: 'Mania screen positive?',
    section: 'moodAndAnxiety', field: 'maniaScreen',
    options: yesNo
  }));
  const manHost = document.createElement('div');
  manHost.dataset.conditional = 'moodAndAnxiety.maniaScreen=yes';
  manHost.appendChild(textArea({
    label: 'Mania Details',
    section: 'moodAndAnxiety', field: 'maniaDetails',
    placeholder: 'Elevated mood, decreased sleep, grandiosity, pressured speech'
  }));
  card.appendChild(manHost);

  card.appendChild(radioGroup({
    label: 'Psychotic symptoms present?',
    section: 'moodAndAnxiety', field: 'psychoticSymptoms',
    options: yesNo
  }));
  const psyHost = document.createElement('div');
  psyHost.dataset.conditional = 'moodAndAnxiety.psychoticSymptoms=yes';
  psyHost.appendChild(textArea({
    label: 'Psychotic Symptom Details',
    section: 'moodAndAnxiety', field: 'psychoticDetails',
    placeholder: 'Hallucinations, delusions, thought disorder, catatonia'
  }));
  card.appendChild(psyHost);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Substance Use',
    description: 'Alcohol, drugs, tobacco, and gambling assessment.'
  });

  card.appendChild(textInput({
    label: 'AUDIT Score (Alcohol Use Disorders Identification Test)',
    section: 'substanceUse', field: 'alcoholAuditScore',
    type: 'number', min: 0, max: 40,
    hint: '0-7 low risk, 8-15 hazardous, 16-19 harmful, 20-40 possible dependence'
  }));

  card.appendChild(selectInput({
    label: 'Alcohol Frequency',
    section: 'substanceUse', field: 'alcoholFrequency',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional' },
      { value: 'regular', label: 'Regular' },
      { value: 'daily', label: 'Daily' },
      { value: 'dependent', label: 'Dependent' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Illicit drug use?',
    section: 'substanceUse', field: 'drugUse',
    options: yesNo
  }));
  const drugHost = document.createElement('div');
  drugHost.dataset.conditional = 'substanceUse.drugUse=yes';
  drugHost.appendChild(textArea({
    label: 'Drug Use Details',
    section: 'substanceUse', field: 'drugDetails',
    placeholder: 'Substance(s), route, frequency, last use'
  }));
  card.appendChild(drugHost);

  card.appendChild(radioGroup({
    label: 'Tobacco use?',
    section: 'substanceUse', field: 'tobaccoUse',
    options: yesNo
  }));
  const tobHost = document.createElement('div');
  tobHost.dataset.conditional = 'substanceUse.tobaccoUse=yes';
  tobHost.appendChild(textArea({
    label: 'Tobacco Details',
    section: 'substanceUse', field: 'tobaccoDetails',
    placeholder: 'Type, amount, duration'
  }));
  card.appendChild(tobHost);

  card.appendChild(radioGroup({
    label: 'Problem gambling?',
    section: 'substanceUse', field: 'gamblingProblem',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Withdrawal risk?',
    section: 'substanceUse', field: 'withdrawalRisk',
    options: yesNo
  }));
  const wdHost = document.createElement('div');
  wdHost.dataset.conditional = 'substanceUse.withdrawalRisk=yes';
  wdHost.appendChild(textArea({
    label: 'Withdrawal Risk Details',
    section: 'substanceUse', field: 'withdrawalDetails',
    placeholder: 'Expected withdrawal symptoms, timeline, severity'
  }));
  card.appendChild(wdHost);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Current Medications',
    description: 'Antipsychotics, antidepressants, mood stabilizers, anxiolytics, and others.'
  });

  card.appendChild(medicationListEditor());

  card.appendChild(textArea({
    label: 'Side Effects',
    section: 'currentMedications', field: 'sideEffects',
    placeholder: 'Any reported side effects from current medications'
  }));

  card.appendChild(radioGroup({
    label: 'Is the patient compliant with medications?',
    section: 'currentMedications', field: 'compliance',
    options: yesNo
  }));
  const compHost = document.createElement('div');
  compHost.dataset.conditional = 'currentMedications.compliance=no';
  compHost.appendChild(textArea({
    label: 'Non-Compliance Details',
    section: 'currentMedications', field: 'complianceDetails',
    placeholder: 'Reasons for non-compliance, which medications affected'
  }));
  card.appendChild(compHost);

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Medical History',
    description: 'Relevant medical conditions that may affect psychiatric care.'
  });

  card.appendChild(radioGroup({
    label: 'Neurological conditions?',
    section: 'medicalHistory', field: 'neurologicalConditions',
    options: yesNo
  }));
  const neuroHost = document.createElement('div');
  neuroHost.dataset.conditional = 'medicalHistory.neurologicalConditions=yes';
  neuroHost.appendChild(textArea({
    label: 'Neurological Details',
    section: 'medicalHistory', field: 'neurologicalDetails',
    placeholder: 'e.g. epilepsy, head injury, dementia, Parkinson\'s'
  }));
  card.appendChild(neuroHost);

  card.appendChild(radioGroup({
    label: 'Endocrine conditions?',
    section: 'medicalHistory', field: 'endocrineConditions',
    options: yesNo
  }));
  const endoHost = document.createElement('div');
  endoHost.dataset.conditional = 'medicalHistory.endocrineConditions=yes';
  endoHost.appendChild(textArea({
    label: 'Endocrine Details',
    section: 'medicalHistory', field: 'endocrineDetails',
    placeholder: 'e.g. thyroid disorder, diabetes, adrenal insufficiency'
  }));
  card.appendChild(endoHost);

  card.appendChild(radioGroup({
    label: 'Chronic pain?',
    section: 'medicalHistory', field: 'chronicPain',
    options: yesNo
  }));
  const painHost = document.createElement('div');
  painHost.dataset.conditional = 'medicalHistory.chronicPain=yes';
  painHost.appendChild(textArea({
    label: 'Chronic Pain Details',
    section: 'medicalHistory', field: 'chronicPainDetails',
    placeholder: 'Location, duration, current management'
  }));
  card.appendChild(painHost);

  card.appendChild(radioGroup({
    label: 'Currently pregnant or possibility of pregnancy?',
    section: 'medicalHistory', field: 'pregnancy',
    options: yesNo
  }));
  const pregHost = document.createElement('div');
  pregHost.dataset.conditional = 'medicalHistory.pregnancy=yes';
  pregHost.appendChild(textArea({
    label: 'Pregnancy Details',
    section: 'medicalHistory', field: 'pregnancyDetails',
    placeholder: 'Gestation, relevant obstetric history'
  }));
  card.appendChild(pregHost);

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Social History',
    description: 'Social circumstances affecting mental health and recovery.'
  });

  card.appendChild(selectInput({
    label: 'Housing Status',
    section: 'socialHistory', field: 'housing',
    options: [
      { value: 'stable', label: 'Stable housing' },
      { value: 'temporary', label: 'Temporary accommodation' },
      { value: 'homeless', label: 'Homeless / rough sleeping' },
      { value: 'supported', label: 'Supported housing' },
      { value: 'institution', label: 'Residential institution' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Housing Details',
    section: 'socialHistory', field: 'housingDetails',
    placeholder: 'Living arrangements, who they live with'
  }));

  card.appendChild(selectInput({
    label: 'Employment Status',
    section: 'socialHistory', field: 'employment',
    options: [
      { value: 'employed', label: 'Employed' },
      { value: 'unemployed', label: 'Unemployed' },
      { value: 'retired', label: 'Retired' },
      { value: 'student', label: 'Student' },
      { value: 'disability', label: 'On disability' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Employment Details',
    section: 'socialHistory', field: 'employmentDetails',
    placeholder: 'Occupation, work-related stressors'
  }));

  card.appendChild(textArea({
    label: 'Relationships',
    section: 'socialHistory', field: 'relationships',
    placeholder: 'Marital status, children, key relationships, social isolation'
  }));

  card.appendChild(radioGroup({
    label: 'Current legal issues?',
    section: 'socialHistory', field: 'legalIssues',
    options: yesNo
  }));
  const legalHost = document.createElement('div');
  legalHost.dataset.conditional = 'socialHistory.legalIssues=yes';
  legalHost.appendChild(textArea({
    label: 'Legal Details',
    section: 'socialHistory', field: 'legalDetails',
    placeholder: 'Pending charges, probation, forensic history'
  }));
  card.appendChild(legalHost);

  card.appendChild(radioGroup({
    label: 'Financial difficulties?',
    section: 'socialHistory', field: 'financialDifficulties',
    options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Support Network',
    section: 'socialHistory', field: 'supportNetwork',
    placeholder: 'Family, friends, community groups, professional support'
  }));

  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Capacity & Consent',
    description: 'Decision-making capacity and treatment preferences.'
  });

  card.appendChild(selectInput({
    label: 'Decision-Making Capacity',
    section: 'capacityAndConsent', field: 'decisionMakingCapacity',
    options: [
      { value: 'has-capacity', label: 'Has capacity' },
      { value: 'lacks-capacity', label: 'Lacks capacity' },
      { value: 'fluctuating', label: 'Fluctuating capacity' },
      { value: 'not-assessed', label: 'Not yet assessed' }
    ]
  }));
  const capHost = document.createElement('div');
  capHost.dataset.conditionalAny =
    'capacityAndConsent.decisionMakingCapacity=lacks-capacity,fluctuating';
  capHost.appendChild(textArea({
    label: 'Capacity Assessment Details',
    section: 'capacityAndConsent', field: 'capacityDetails',
    placeholder: 'Specific decisions affected, evidence for assessment'
  }));
  card.appendChild(capHost);

  card.appendChild(radioGroup({
    label: 'Advance directives in place?',
    section: 'capacityAndConsent', field: 'advanceDirectives',
    options: yesNo
  }));
  const adHost = document.createElement('div');
  adHost.dataset.conditional = 'capacityAndConsent.advanceDirectives=yes';
  adHost.appendChild(textArea({
    label: 'Advance Directive Details',
    section: 'capacityAndConsent', field: 'advanceDirectiveDetails',
    placeholder: 'Type of directive, key provisions'
  }));
  card.appendChild(adHost);

  card.appendChild(radioGroup({
    label: 'Power of attorney designated?',
    section: 'capacityAndConsent', field: 'powerOfAttorney',
    options: yesNo
  }));
  const poaHost = document.createElement('div');
  poaHost.dataset.conditional = 'capacityAndConsent.powerOfAttorney=yes';
  poaHost.appendChild(textArea({
    label: 'Power of Attorney Details',
    section: 'capacityAndConsent', field: 'powerOfAttorneyDetails',
    placeholder: 'Name, relationship, scope of authority'
  }));
  card.appendChild(poaHost);

  card.appendChild(textArea({
    label: 'Treatment Preferences',
    section: 'capacityAndConsent', field: 'treatmentPreferences',
    placeholder: 'Patient\'s preferences regarding treatment, medication, hospitalisation'
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
  document.querySelectorAll('[data-conditional-any]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-any');
    const [path, targetCsv] = expr.split('=');
    const [section, field] = path.split('.');
    const current = String(state[section]?.[field] ?? '');
    const targets = targetCsv.split(',');
    host.style.display = targets.includes(current) ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics (7)
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'emergencyContactName'],
  ['demographics', 'emergencyContactPhone'],
  ['demographics', 'legalStatus'],
  // Presenting complaint (5)
  ['presentingComplaint', 'chiefComplaint'],
  ['presentingComplaint', 'onsetDate'],
  ['presentingComplaint', 'duration'],
  ['presentingComplaint', 'severity'],
  ['presentingComplaint', 'precipitatingFactors'],
  // Psychiatric history (4)
  ['psychiatricHistory', 'previousDiagnoses'],
  ['psychiatricHistory', 'previousHospitalizations'],
  ['psychiatricHistory', 'previousSuicideAttempts'],
  ['psychiatricHistory', 'selfHarmHistory'],
  // Mental status exam (10)
  ['mentalStatusExam', 'appearance'],
  ['mentalStatusExam', 'behaviour'],
  ['mentalStatusExam', 'speech'],
  ['mentalStatusExam', 'mood'],
  ['mentalStatusExam', 'affect'],
  ['mentalStatusExam', 'thoughtProcess'],
  ['mentalStatusExam', 'thoughtContent'],
  ['mentalStatusExam', 'perceptualDisturbances'],
  ['mentalStatusExam', 'cognitionIntact'],
  ['mentalStatusExam', 'insight'],
  ['mentalStatusExam', 'judgement'],
  // Risk assessment (4)
  ['riskAssessment', 'suicidalIdeation'],
  ['riskAssessment', 'selfHarmCurrent'],
  ['riskAssessment', 'violenceRisk'],
  ['riskAssessment', 'safeguardingConcerns'],
  // Mood and anxiety (4)
  ['moodAndAnxiety', 'phq9Score'],
  ['moodAndAnxiety', 'gad7Score'],
  ['moodAndAnxiety', 'maniaScreen'],
  ['moodAndAnxiety', 'psychoticSymptoms'],
  // Substance use (5)
  ['substanceUse', 'alcoholAuditScore'],
  ['substanceUse', 'alcoholFrequency'],
  ['substanceUse', 'drugUse'],
  ['substanceUse', 'tobaccoUse'],
  ['substanceUse', 'gamblingProblem'],
  ['substanceUse', 'withdrawalRisk'],
  // Current medications (1)
  ['currentMedications', 'compliance'],
  // Medical history (4)
  ['medicalHistory', 'neurologicalConditions'],
  ['medicalHistory', 'endocrineConditions'],
  ['medicalHistory', 'chronicPain'],
  ['medicalHistory', 'pregnancy'],
  // Social history (5)
  ['socialHistory', 'housing'],
  ['socialHistory', 'employment'],
  ['socialHistory', 'legalIssues'],
  ['socialHistory', 'financialDifficulties'],
  ['socialHistory', 'supportNetwork'],
  // Capacity & consent (3)
  ['capacityAndConsent', 'decisionMakingCapacity'],
  ['capacityAndConsent', 'advanceDirectives'],
  ['capacityAndConsent', 'powerOfAttorney']
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
  { step: 1,  section: 'demographics',         title: 'Demographics' },
  { step: 2,  section: 'presentingComplaint',  title: 'Complaint' },
  { step: 3,  section: 'psychiatricHistory',   title: 'Psych History' },
  { step: 4,  section: 'mentalStatusExam',     title: 'MSE' },
  { step: 5,  section: 'riskAssessment',       title: 'Risk' },
  { step: 6,  section: 'moodAndAnxiety',       title: 'Mood' },
  { step: 7,  section: 'substanceUse',         title: 'Substance' },
  { step: 8,  section: 'currentMedications',   title: 'Medications' },
  { step: 9,  section: 'medicalHistory',       title: 'Medical' },
  { step: 10, section: 'socialHistory',        title: 'Social' },
  { step: 11, section: 'capacityAndConsent',   title: 'Capacity' }
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { gafScore, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td class="num">-${r.scoreImpact}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No GAF rules fired — superior functioning.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Domain</th>
            <th scope="col">Description</th>
            <th scope="col">Impact</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Psychiatry Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>GAF Total Score</h3>
      <p class="gaf-summary">
        <span class="gaf-score-badge ${gafBracketClass(gafScore)}">${gafScore} / 100</span>
        <span class="gaf-bracket">${esc(gafBracketLabel(gafScore))}</span>
      </p>
      <p class="muted">${esc(gafScoreLabel(gafScore))}</p>

      <h3>Fired Rules</h3>
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
  const { gafScore, firedRules } = calculateGAF(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    gafScore,
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
  host.appendChild(renderStep9());
  host.appendChild(renderStep10());
  host.appendChild(renderStep11());
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
