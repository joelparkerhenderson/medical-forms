import { gradeAssessment, severityClass } from './mh-grader.js';
import { calculateAuditCScore, calculateGad7Score, calculatePhq9Score, gad7Questions, gadAnswerOptions, gadKeys, phq9Questions, phqAnswerOptions, phqKeys } from './mh-rules.js';
import { calculateAge, emptyAssessment } from './types.js';

// Mental Health Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure PHQ-9 / GAD-7 / AUDIT-C scoring engine and renders an
// inline report. State is persisted to localStorage so a partial fill
// survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'mental-health-assessment.front-end-form-with-html.v1';

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
    const incoming = parsed && parsed[key];
    if (incoming && typeof incoming === 'object' && !Array.isArray(incoming)) {
      // Object section: shallow-merge over the empty default. For known
      // nested arrays (medications), copy them across verbatim.
      fresh[key] = { ...fresh[key], ...incoming };
    }
  }
  // Restore array-typed fields that the shallow merge may have flattened.
  if (parsed && parsed.currentMedications) {
    if (Array.isArray(parsed.currentMedications.psychiatricMedications)) {
      fresh.currentMedications.psychiatricMedications =
        parsed.currentMedications.psychiatricMedications;
    }
    if (Array.isArray(parsed.currentMedications.otherMedications)) {
      fresh.currentMedications.otherMedications =
        parsed.currentMedications.otherMedications;
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
  slug: 'mental-health-assessment',
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
 * Re-runs progress and conditional visibility after each change.
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

/** Set a PHQ-9 / GAD-7 numeric item score (0-3 or null). */
function setScaleScore(section, field, value) {
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
    `value="${esc(value ?? '')}"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')} aria-describedby="${id}-error">
    <span class="error-message" id="${id}-error"></span>
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
    <label class="label" for="${id}">${esc(opts.label)}${opts.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      ${opts.required ? 'required data-required' : ''}
      aria-describedby="${id}-error"
      class="text-area-input">${esc(value)}</textarea>
    <span class="error-message" id="${id}-error"></span>
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
    <label class="label" for="${id}">${esc(opts.label)}${opts.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
    <select id="${id}" name="${id}" class="select"${opts.required ? ' required data-required' : ''} aria-describedby="${id}-error">
      ${optionsHtml}
    </select>
    <span class="error-message" id="${id}-error"></span>
  `;
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
  list.className = 'radio-group' + (opts.vertical ? ' vertical' : '');
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    const requiredAttr = opts.required ? ' required data-required' : '';
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
 * Build a 0-3 scale radio group for PHQ-9 / GAD-7 items.
 */
function scaleQuestion(opts) {
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field scale-question';
  const groupId = `${opts.section}-${opts.field}`;
  wrapper.id = `${groupId}-fieldset`;
  const current = state[opts.section][opts.field];

  const legend = document.createElement('legend');
  legend.className = 'label question-text';
  legend.textContent = `${opts.number}. ${opts.question}`;
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${option.value}"${checked}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) setScaleScore(opts.section, opts.field, option.value);
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);
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
// Repeating-list editor (medications)
// ----------------------------------------------------------------------

/**
 * Editor for an array of {name, dose, frequency} medication rows.
 * @param {{ section: string, field: string, addLabel: string }} opts
 */
function medicationListEditor(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';
  wrapper.dataset.list = `${opts.section}.${opts.field}`;

  function rerender() {
    const rows = state[opts.section][opts.field];
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'None added.';
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
    addBtn.textContent = `+ ${opts.addLabel}`;
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
// Section renderers (1 per step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic patient information and emergency contact.'
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

  const sub = document.createElement('div');
  sub.className = 'sub-section';
  sub.innerHTML = '<h3>Emergency Contact</h3>';
  sub.appendChild(textInput({
    label: 'Contact Name',
    section: 'demographics',
    field: 'emergencyContactName',
    required: true
  }));
  sub.appendChild(textInput({
    label: 'Contact Phone',
    section: 'demographics',
    field: 'emergencyContactPhone',
    type: 'tel',
    required: true
  }));
  sub.appendChild(textInput({
    label: 'Relationship',
    section: 'demographics',
    field: 'emergencyContactRelationship',
    required: true
  }));
  card.appendChild(sub);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'PHQ-9 Depression Screen',
    description: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?'
  });
  phqKeys.forEach((key, i) => {
    card.appendChild(scaleQuestion({
      section: 'phqResponses',
      field: key,
      number: i + 1,
      question: phq9Questions[i],
      options: phqAnswerOptions
    }));
  });
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'GAD-7 Anxiety Screen',
    description: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?'
  });
  gadKeys.forEach((key, i) => {
    card.appendChild(scaleQuestion({
      section: 'gadResponses',
      field: key,
      number: i + 1,
      question: gad7Questions[i],
      options: gadAnswerOptions
    }));
  });
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Mood & Affect',
    description: 'How you have been feeling recently.'
  });

  card.appendChild(radioGroup({
    label: 'How would you rate your current mood?',
    section: 'moodAffect', field: 'currentMood',
    options: [
      { value: 'very-low', label: 'Very Low' },
      { value: 'low', label: 'Low' },
      { value: 'neutral', label: 'Neutral' },
      { value: 'good', label: 'Good' },
      { value: 'very-good', label: 'Very Good' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'How has your sleep quality been?',
    section: 'moodAffect', field: 'sleepQuality',
    options: [
      { value: 'very-poor', label: 'Very Poor' },
      { value: 'poor', label: 'Poor' },
      { value: 'fair', label: 'Fair' },
      { value: 'good', label: 'Good' },
      { value: 'very-good', label: 'Very Good' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Have you experienced any changes in appetite?',
    section: 'moodAffect', field: 'appetiteChanges',
    options: [
      { value: 'significant-decrease', label: 'Significant Decrease' },
      { value: 'decrease', label: 'Decrease' },
      { value: 'no-change', label: 'No Change' },
      { value: 'increase', label: 'Increase' },
      { value: 'significant-increase', label: 'Significant Increase' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'How would you describe your energy level?',
    section: 'moodAffect', field: 'energyLevel',
    options: [
      { value: 'very-low', label: 'Very Low' },
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high', label: 'High' },
      { value: 'very-high', label: 'Very High' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'How is your ability to concentrate?',
    section: 'moodAffect', field: 'concentration',
    options: [
      { value: 'very-poor', label: 'Very Poor' },
      { value: 'poor', label: 'Poor' },
      { value: 'fair', label: 'Fair' },
      { value: 'good', label: 'Good' },
      { value: 'excellent', label: 'Excellent' }
    ]
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Risk Assessment',
    description: 'These questions help us understand your safety needs. Please answer honestly.'
  });

  const banner = document.createElement('div');
  banner.className = 'safety-banner';
  banner.innerHTML = '<strong>Important:</strong> If you are in immediate danger, please call emergency services (999/911) or go to your nearest emergency department.';
  card.appendChild(banner);

  card.appendChild(radioGroup({
    label: 'Have you had any thoughts of suicide or wanting to die?',
    section: 'riskAssessment', field: 'suicidalIdeation',
    vertical: true,
    options: [
      { value: 'none', label: 'None' },
      { value: 'passive', label: 'Passive thoughts (e.g., wishing to not wake up)' },
      { value: 'active-no-plan', label: 'Active thoughts, no specific plan' },
      { value: 'active-with-plan', label: 'Active thoughts with a specific plan' }
    ]
  }));
  const siDetails = document.createElement('div');
  siDetails.dataset.conditionalNotEmpty = 'riskAssessment.suicidalIdeation';
  siDetails.dataset.conditionalNotValue = 'none';
  siDetails.appendChild(textArea({
    label: 'Please provide more details',
    section: 'riskAssessment', field: 'suicidalIdeationDetails',
    rows: 3
  }));
  card.appendChild(siDetails);

  card.appendChild(radioGroup({
    label: 'Have you engaged in any self-harm?',
    section: 'riskAssessment', field: 'selfHarm',
    vertical: true,
    options: [
      { value: 'none', label: 'None' },
      { value: 'past', label: 'In the past, but not currently' },
      { value: 'current', label: 'Currently' }
    ]
  }));
  const shDetails = document.createElement('div');
  shDetails.dataset.conditionalNotEmpty = 'riskAssessment.selfHarm';
  shDetails.dataset.conditionalNotValue = 'none';
  shDetails.appendChild(textArea({
    label: 'Please provide more details',
    section: 'riskAssessment', field: 'selfHarmDetails',
    rows: 3
  }));
  card.appendChild(shDetails);

  card.appendChild(radioGroup({
    label: 'Have you had thoughts of harming others?',
    section: 'riskAssessment', field: 'harmToOthers',
    vertical: true,
    options: [
      { value: 'none', label: 'None' },
      { value: 'thoughts', label: 'Thoughts, but no intent' },
      { value: 'intent', label: 'Thoughts with intent' }
    ]
  }));
  const hoDetails = document.createElement('div');
  hoDetails.dataset.conditionalNotEmpty = 'riskAssessment.harmToOthers';
  hoDetails.dataset.conditionalNotValue = 'none';
  hoDetails.appendChild(textArea({
    label: 'Please provide more details',
    section: 'riskAssessment', field: 'harmToOthersDetails',
    rows: 3
  }));
  card.appendChild(hoDetails);

  // Safety plan only shown when SI is non-empty and not 'none'
  const safetyPlanHost = document.createElement('div');
  safetyPlanHost.dataset.conditionalNotEmpty = 'riskAssessment.suicidalIdeation';
  safetyPlanHost.dataset.conditionalNotValue = 'none';
  safetyPlanHost.appendChild(radioGroup({
    label: 'Do you have a safety plan in place?',
    section: 'riskAssessment', field: 'hasSafetyPlan',
    options: yesNo
  }));
  const safetyPlanDetails = document.createElement('div');
  safetyPlanDetails.dataset.conditional = 'riskAssessment.hasSafetyPlan=yes';
  safetyPlanDetails.appendChild(textArea({
    label: 'Please describe your safety plan',
    section: 'riskAssessment', field: 'safetyPlanDetails',
    rows: 3
  }));
  safetyPlanHost.appendChild(safetyPlanDetails);
  card.appendChild(safetyPlanHost);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Substance Use',
    description: 'Alcohol, drug, and tobacco use history.'
  });

  const alcSub = document.createElement('div');
  alcSub.innerHTML = '<h3 style="margin:0 0 0.5rem;font-size:0.95rem;font-weight:600;">Alcohol Use (AUDIT-C)</h3>';
  card.appendChild(alcSub);

  card.appendChild(selectInput({
    label: 'How often do you have a drink containing alcohol?',
    section: 'substanceUse', field: 'alcoholFrequency',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'monthly-or-less', label: 'Monthly or less' },
      { value: '2-4-per-month', label: '2-4 times per month' },
      { value: '2-3-per-week', label: '2-3 times per week' },
      { value: '4-or-more-per-week', label: '4 or more times per week' }
    ]
  }));

  const alcQty = document.createElement('div');
  alcQty.dataset.conditionalNotEmpty = 'substanceUse.alcoholFrequency';
  alcQty.dataset.conditionalNotValue = 'never';
  alcQty.appendChild(selectInput({
    label: 'How many standard drinks on a typical day when you are drinking?',
    section: 'substanceUse', field: 'alcoholQuantity',
    options: [
      { value: '1-2', label: '1-2' },
      { value: '3-4', label: '3-4' },
      { value: '5-6', label: '5-6' },
      { value: '7-9', label: '7-9' },
      { value: '10-or-more', label: '10 or more' }
    ]
  }));
  alcQty.appendChild(selectInput({
    label: 'How often do you have 6 or more drinks on one occasion?',
    section: 'substanceUse', field: 'bingeDrinking',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'less-than-monthly', label: 'Less than monthly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'daily-or-almost', label: 'Daily or almost daily' }
    ]
  }));
  card.appendChild(alcQty);

  const drugSub = document.createElement('div');
  drugSub.className = 'sub-section';
  drugSub.innerHTML = '<h3>Drug Use</h3>';
  drugSub.appendChild(radioGroup({
    label: 'Do you use recreational or non-prescribed drugs?',
    section: 'substanceUse', field: 'drugUse',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'past', label: 'In the past' },
      { value: 'occasional', label: 'Occasionally' },
      { value: 'regular', label: 'Regularly' }
    ]
  }));
  const drugDet = document.createElement('div');
  drugDet.dataset.conditionalNotEmpty = 'substanceUse.drugUse';
  drugDet.dataset.conditionalNotValue = 'never';
  drugDet.appendChild(textArea({
    label: 'Please provide details (types, frequency)',
    section: 'substanceUse', field: 'drugDetails',
    rows: 3
  }));
  drugSub.appendChild(drugDet);
  card.appendChild(drugSub);

  const tobSub = document.createElement('div');
  tobSub.className = 'sub-section';
  tobSub.innerHTML = '<h3>Tobacco</h3>';
  tobSub.appendChild(radioGroup({
    label: 'Do you use tobacco products?',
    section: 'substanceUse', field: 'tobaccoUse',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'former', label: 'Former smoker' },
      { value: 'current', label: 'Current smoker' }
    ]
  }));
  const tobDet = document.createElement('div');
  tobDet.dataset.conditionalAny = 'substanceUse.tobaccoUse=current,former';
  tobDet.appendChild(textArea({
    label: 'Please provide details (amount, duration)',
    section: 'substanceUse', field: 'tobaccoDetails',
    rows: 3
  }));
  tobSub.appendChild(tobDet);
  card.appendChild(tobSub);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Current Medications',
    description: 'List all medications you are currently taking.'
  });

  const psychHeader = document.createElement('div');
  psychHeader.className = 'list-section-header';
  psychHeader.innerHTML = `
    <h3>Psychiatric Medications</h3>
    <p class="hint">Antidepressants, anxiolytics, mood stabilisers, antipsychotics, etc.</p>
  `;
  card.appendChild(psychHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'psychiatricMedications',
    addLabel: 'Add psychiatric medication'
  }));

  const otherSub = document.createElement('div');
  otherSub.className = 'sub-section';
  otherSub.innerHTML = `
    <h3>Other Medications</h3>
    <p class="hint">All other medications including over-the-counter and supplements.</p>
  `;
  otherSub.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'otherMedications',
    addLabel: 'Add other medication'
  }));
  card.appendChild(otherSub);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Treatment History',
    description: 'Your previous and current mental health treatment.'
  });

  card.appendChild(radioGroup({
    label: 'Have you previously received therapy or counselling?',
    section: 'treatmentHistory', field: 'previousTherapy',
    options: yesNo
  }));
  const therapyDet = document.createElement('div');
  therapyDet.dataset.conditional = 'treatmentHistory.previousTherapy=yes';
  therapyDet.appendChild(textArea({
    label: 'Please describe (type of therapy, duration, outcome)',
    section: 'treatmentHistory', field: 'therapyDetails',
    rows: 3
  }));
  card.appendChild(therapyDet);

  card.appendChild(radioGroup({
    label: 'Have you ever been hospitalised for mental health reasons?',
    section: 'treatmentHistory', field: 'previousHospitalizations',
    options: yesNo
  }));
  const hospDet = document.createElement('div');
  hospDet.dataset.conditional = 'treatmentHistory.previousHospitalizations=yes';
  hospDet.appendChild(textArea({
    label: 'Please describe (when, where, reason)',
    section: 'treatmentHistory', field: 'hospitalizationDetails',
    rows: 3
  }));
  card.appendChild(hospDet);

  card.appendChild(textArea({
    label: 'Current mental health providers (therapist, psychiatrist, etc.)',
    section: 'treatmentHistory', field: 'currentProviders',
    placeholder: 'List any current providers and their roles',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Social & Functional',
    description: 'Your social circumstances and daily functioning.'
  });

  card.appendChild(selectInput({
    label: 'Employment Status',
    section: 'socialFunctional', field: 'employmentStatus',
    options: [
      { value: 'employed-full-time', label: 'Employed Full-Time' },
      { value: 'employed-part-time', label: 'Employed Part-Time' },
      { value: 'unemployed', label: 'Unemployed' },
      { value: 'retired', label: 'Retired' },
      { value: 'disabled', label: 'Disabled' },
      { value: 'student', label: 'Student' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Relationship Status',
    section: 'socialFunctional', field: 'relationshipStatus',
    options: [
      { value: 'single', label: 'Single' },
      { value: 'married', label: 'Married' },
      { value: 'partnered', label: 'Partnered' },
      { value: 'divorced', label: 'Divorced' },
      { value: 'widowed', label: 'Widowed' },
      { value: 'separated', label: 'Separated' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Housing Status',
    section: 'socialFunctional', field: 'housingStatus',
    options: [
      { value: 'stable', label: 'Stable' },
      { value: 'unstable', label: 'Unstable' },
      { value: 'homeless', label: 'Homeless' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Support System',
    section: 'socialFunctional', field: 'supportSystem',
    options: [
      { value: 'strong', label: 'Strong' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'limited', label: 'Limited' },
      { value: 'none', label: 'None' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'How much do mental health symptoms affect your daily functioning?',
    section: 'socialFunctional', field: 'functionalImpairment',
    options: [
      { value: 'none', label: 'Not at all' },
      { value: 'mild', label: 'Mildly' },
      { value: 'moderate', label: 'Moderately' },
      { value: 'severe', label: 'Severely' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Additional notes or concerns',
    section: 'socialFunctional', field: 'additionalNotes',
    placeholder: 'Anything else you would like your clinician to know',
    rows: 3
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

/**
 * Hide / show conditional blocks based on data attributes:
 *   data-conditional="section.field=value"
 *   data-conditional-any="section.field=val1,val2"
 *   data-conditional-not-empty="section.field"
 *     (with optional data-conditional-not-value="X" to also exclude X)
 */
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
  document.querySelectorAll('[data-conditional-not-empty]').forEach((host) => {
    const path = host.getAttribute('data-conditional-not-empty');
    const exclude = host.getAttribute('data-conditional-not-value');
    const [section, field] = path.split('.');
    const current = state[section]?.[field];
    const isEmpty = current === '' || current === null || current === undefined;
    const isExcluded = exclude !== null && current === exclude;
    host.style.display = !isEmpty && !isExcluded ? '' : 'none';
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
  ['demographics', 'emergencyContactName'],
  ['demographics', 'emergencyContactPhone'],
  ['demographics', 'emergencyContactRelationship'],
  // PHQ-9 (9 items)
  ['phqResponses', 'interest'],
  ['phqResponses', 'depression'],
  ['phqResponses', 'sleep'],
  ['phqResponses', 'energy'],
  ['phqResponses', 'appetite'],
  ['phqResponses', 'selfEsteem'],
  ['phqResponses', 'concentration'],
  ['phqResponses', 'psychomotor'],
  ['phqResponses', 'suicidalThoughts'],
  // GAD-7 (7 items)
  ['gadResponses', 'nervousness'],
  ['gadResponses', 'uncontrollableWorry'],
  ['gadResponses', 'excessiveWorry'],
  ['gadResponses', 'troubleRelaxing'],
  ['gadResponses', 'restlessness'],
  ['gadResponses', 'irritability'],
  ['gadResponses', 'fearfulness'],
  // Mood & affect
  ['moodAffect', 'currentMood'],
  ['moodAffect', 'sleepQuality'],
  ['moodAffect', 'appetiteChanges'],
  ['moodAffect', 'energyLevel'],
  ['moodAffect', 'concentration'],
  // Risk
  ['riskAssessment', 'suicidalIdeation'],
  ['riskAssessment', 'selfHarm'],
  ['riskAssessment', 'harmToOthers'],
  // Substance use (alcohol freq + drug + tobacco)
  ['substanceUse', 'alcoholFrequency'],
  ['substanceUse', 'drugUse'],
  ['substanceUse', 'tobaccoUse'],
  // Treatment history
  ['treatmentHistory', 'previousTherapy'],
  ['treatmentHistory', 'previousHospitalizations'],
  // Social & functional
  ['socialFunctional', 'employmentStatus'],
  ['socialFunctional', 'relationshipStatus'],
  ['socialFunctional', 'housingStatus'],
  ['socialFunctional', 'supportSystem'],
  ['socialFunctional', 'functionalImpairment']
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
  { step: 1, section: 'demographics',        title: 'Demographics' },
  { step: 2, section: 'phqResponses',        title: 'PHQ-9' },
  { step: 3, section: 'gadResponses',        title: 'GAD-7' },
  { step: 4, section: 'moodAffect',          title: 'Mood & Affect' },
  { step: 5, section: 'riskAssessment',      title: 'Risk' },
  { step: 6, section: 'substanceUse',        title: 'Substance Use' },
  { step: 7, section: 'currentMedications',  title: 'Medications' },
  { step: 8, section: 'treatmentHistory',    title: 'Treatment History' },
  { step: 9, section: 'socialFunctional',    title: 'Social & Functional' }
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
    case 'urgent': return 'flag-urgent';
    case 'high':   return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low':    return 'flag-low';
    default:       return '';
  }
}

function renderScoreSection(scoreResult) {
  const sev = scoreResult.severity;
  const sevCls = severityClass(sev);
  const items = scoreResult.itemScores;
  const itemsTable = items.length === 0
    ? `<p class="muted">No items answered.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Question</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <th scope="row">${esc(item.id)}</th>
              <td>${esc(item.question)}</td>
              <td class="num">${item.score} / 3</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  return `
    <h3>${esc(scoreResult.instrument)} Total Score</h3>
    <p class="score-summary">
      <span class="score-badge ${sevCls}">${scoreResult.score} / ${scoreResult.maxScore}</span>
      <span class="severity-label">${esc(scoreResult.label)}</span>
    </p>
    <p class="muted">Based on ${items.length} of ${scoreResult.instrument === 'PHQ-9' ? 9 : 7} items answered.</p>
    <h3>Per-item scores (${esc(scoreResult.instrument)})</h3>
    ${itemsTable}
  `;
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { phq9, gad7, auditC, additionalFlags, timestamp } = lastResult;

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

  const auditCBlock = auditC === null
    ? ''
    : `
      <h3>AUDIT-C Score</h3>
      <p class="score-summary">
        <span class="score-badge ${auditC >= 4 ? 'severity-moderate' : 'severity-minimal'}">${auditC} / 12</span>
        <span class="severity-label">${auditC >= 4 ? 'Hazardous drinking screen positive' : 'Within low-risk range'}</span>
      </p>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Mental Health Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      ${renderScoreSection(phq9)}
      ${renderScoreSection(gad7)}
      ${auditCBlock}

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
  lastResult = gradeAssessment(state);
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
