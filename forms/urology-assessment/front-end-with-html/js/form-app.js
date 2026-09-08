import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateIPSS } from './ipss-grader.js';
import { ipssQuestions, ipssResponseOptions, qolResponseOptions } from './ipss-rules.js';
import { emptyAssessment, ipssCategory, ipssCategoryClass, ipssCategoryKey, qolLabel } from './types.js';

// Urology Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure IPSS scoring engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'urology-assessment.front-end-form-with-html.v1';

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
  slug: 'urology-assessment',
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

const TOTAL_STEPS = 10;

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
    `value="${esc(value == null ? '' : value)}"`,
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
  const value = state[opts.section][opts.field] == null
    ? ''
    : state[opts.section][opts.field];
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
  const current = state[opts.section][opts.field] == null
    ? ''
    : state[opts.section][opts.field];
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
 * Build a radio group whose values are strings.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[] }} opts
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
 * Build a radio group whose values are numbers (used for IPSS / QoL items).
 * Stored value can be `null` when unanswered.
 * @param {{ legendHtml: string, name: string, currentValue: (number|null),
 *           options: { value: number, label: string }[],
 *           onChange: (n: number) => void }} opts
 */
function numericRadioGroup(opts) {
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${opts.name}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.innerHTML = opts.legendHtml;
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const radioId = `${opts.name}-${option.value}`;
    const label = document.createElement('label');
    label.htmlFor = radioId;
    const checked = opts.currentValue === option.value ? ' checked' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${opts.name}" value="${option.value}"${checked}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) opts.onChange(Number(option.value));
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = `${opts.name}-error`;
  wrapper.appendChild(errSpan);
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
// Repeating-list editor (medications)
// ----------------------------------------------------------------------

/**
 * Editor for an array of {name, dose, frequency} medication rows.
 * @param {{ section: string, field: string, addLabel: string,
 *           emptyLabel: string, namePlaceholder?: string }} opts
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
      empty.textContent = opts.emptyLabel;
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row med-row';
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="${esc(opts.namePlaceholder || 'e.g. Tamsulosin')}">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 0.4 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. Once daily">
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

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Chief Complaint',
    description: 'Describe your primary urological concern.'
  });

  card.appendChild(textArea({
    label: 'What is your primary urological concern?',
    section: 'chiefComplaint', field: 'primaryConcern',
    placeholder: 'Describe your main urological problem...',
    rows: 3
  }));

  card.appendChild(textInput({
    label: 'How long have you had this condition?',
    section: 'chiefComplaint', field: 'duration',
    placeholder: 'e.g., 2 weeks, 3 months, 5 years',
    required: true
  }));

  card.appendChild(radioGroup({
    label: 'How urgent is your concern?',
    section: 'chiefComplaint', field: 'urgency',
    options: [
      { value: 'routine', label: 'Routine' },
      { value: 'urgent', label: 'Urgent' },
      { value: 'emergency', label: 'Emergency' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'IPSS Questionnaire',
    description: 'International Prostate Symptom Score - rate your urinary symptoms over the past month.'
  });

  const questionKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'];

  ipssQuestions.forEach((question, i) => {
    const block = document.createElement('div');
    block.className = 'ipss-question';
    block.innerHTML = `
      <p class="ipss-question-text">
        <span class="ipss-question-number">${i + 1}.</span>
        ${esc(question.text)}
      </p>
      <p class="ipss-question-domain">Domain: ${esc(question.domain)}</p>
    `;

    const key = questionKeys[i];
    block.appendChild(numericRadioGroup({
      legendHtml: `<span class="visually-hidden">Question ${i + 1}: ${esc(question.text)}</span>`,
      name: `ipss-${key}`,
      currentValue: state.ipssQuestionnaire[key],
      options: ipssResponseOptions,
      onChange: (value) => setField('ipssQuestionnaire', key, value)
    }));

    // Hide the redundant legend visually but keep accessible.
    const legend = block.querySelector('legend');
    if (legend) {
      legend.style.position = 'absolute';
      legend.style.left = '-9999px';
      legend.style.height = '1px';
      legend.style.width = '1px';
      legend.style.overflow = 'hidden';
    }

    card.appendChild(block);
  });

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Quality of Life',
    description: 'IPSS Quality of Life assessment - how do your urinary symptoms affect your daily life?'
  });

  const block = document.createElement('div');
  block.className = 'ipss-question';
  block.innerHTML = `
    <p class="ipss-question-text">
      If you were to spend the rest of your life with your urinary condition just the way it is now, how would you feel about that?
    </p>
  `;
  block.appendChild(numericRadioGroup({
    legendHtml: '<span class="visually-hidden">Quality of life</span>',
    name: 'qol-score',
    currentValue: state.qualityOfLife.qolScore,
    options: qolResponseOptions,
    onChange: (value) => setField('qualityOfLife', 'qolScore', value)
  }));
  const legend = block.querySelector('legend');
  if (legend) {
    legend.style.position = 'absolute';
    legend.style.left = '-9999px';
    legend.style.height = '1px';
    legend.style.width = '1px';
    legend.style.overflow = 'hidden';
  }
  card.appendChild(block);

  card.appendChild(textArea({
    label: 'How do your urinary symptoms impact your daily life?',
    section: 'qualityOfLife', field: 'qolImpact',
    placeholder: 'Describe how your symptoms affect work, sleep, travel, social activities...',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Urinary Symptoms',
    description: 'Detailed urinary symptom assessment.'
  });

  card.appendChild(radioGroup({
    label: 'Do you experience increased urinary frequency?',
    section: 'urinarySymptoms', field: 'frequency', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you experience urinary urgency?',
    section: 'urinarySymptoms', field: 'urgency', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you wake at night to urinate (nocturia)?',
    section: 'urinarySymptoms', field: 'nocturia', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you experience hesitancy when starting to urinate?',
    section: 'urinarySymptoms', field: 'hesitancy', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'How would you describe your urinary stream?',
    section: 'urinarySymptoms', field: 'stream',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'weak', label: 'Weak' },
      { value: 'intermittent', label: 'Intermittent (stops and starts)' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Do you strain to urinate?',
    section: 'urinarySymptoms', field: 'straining', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have you noticed blood in your urine (hematuria)?',
    section: 'urinarySymptoms', field: 'hematuria', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you experience pain or burning during urination (dysuria)?',
    section: 'urinarySymptoms', field: 'dysuria', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Do you experience urinary incontinence?',
    section: 'urinarySymptoms', field: 'incontinence',
    options: [
      { value: 'none', label: 'None' },
      { value: 'stress', label: 'Stress incontinence (leaking with coughing, sneezing, exercise)' },
      { value: 'urge', label: 'Urge incontinence (sudden strong need to urinate)' },
      { value: 'overflow', label: 'Overflow incontinence (constant dribbling)' },
      { value: 'mixed', label: 'Mixed incontinence' }
    ]
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Renal Function',
    description: 'Laboratory results and prostate-specific antigen levels (leave blank if unknown).'
  });

  card.appendChild(textInput({
    label: 'Creatinine',
    section: 'renalFunction', field: 'creatinine',
    type: 'number', min: 0, max: 2000, step: 1, unit: 'umol/L'
  }));
  card.appendChild(textInput({
    label: 'eGFR (Estimated Glomerular Filtration Rate)',
    section: 'renalFunction', field: 'eGFR',
    type: 'number', min: 0, max: 200, step: 1, unit: 'mL/min/1.73m2'
  }));
  card.appendChild(textArea({
    label: 'Urinalysis results',
    section: 'renalFunction', field: 'urinalysis',
    placeholder: 'Enter urinalysis findings if available...',
    rows: 3
  }));
  card.appendChild(textInput({
    label: 'PSA (Prostate-Specific Antigen)',
    section: 'renalFunction', field: 'psa',
    type: 'number', min: 0, max: 1000, step: 0.1, unit: 'ng/mL'
  }));
  card.appendChild(textInput({
    label: 'Date of PSA test',
    section: 'renalFunction', field: 'psaDate',
    type: 'date'
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Sexual Health',
    description: 'Sexual function assessment relevant to urological health.'
  });

  card.appendChild(radioGroup({
    label: 'Do you experience erectile dysfunction?',
    section: 'sexualHealth', field: 'erectileDysfunction', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have you noticed changes in libido (sex drive)?',
    section: 'sexualHealth', field: 'libidoChanges', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have any ejaculatory problems?',
    section: 'sexualHealth', field: 'ejaculatoryProblems', options: yesNo
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Medical History',
    description: 'Previous urological conditions and relevant medical history.'
  });

  card.appendChild(textArea({
    label: 'Previous urological conditions',
    section: 'medicalHistory', field: 'previousUrologicConditions',
    placeholder: 'e.g., kidney stones, UTIs, BPH, prostatitis...',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Surgical history',
    section: 'medicalHistory', field: 'surgicalHistory',
    placeholder: 'e.g., TURP, prostatectomy, cystoscopy, vasectomy...',
    rows: 3
  }));
  card.appendChild(radioGroup({
    label: 'Do you have diabetes?',
    section: 'medicalHistory', field: 'diabetes', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have hypertension?',
    section: 'medicalHistory', field: 'hypertension', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have any neurological conditions?',
    section: 'medicalHistory', field: 'neurologicConditions', options: yesNo
  }));
  const neuroDetails = document.createElement('div');
  neuroDetails.dataset.conditional = 'medicalHistory.neurologicConditions=yes';
  neuroDetails.appendChild(textArea({
    label: 'Please provide details',
    section: 'medicalHistory', field: 'neurologicConditionDetails',
    rows: 3
  }));
  card.appendChild(neuroDetails);

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Current Medications',
    description: 'List all current medications relevant to your urological condition.'
  });

  const ablockHeader = document.createElement('div');
  ablockHeader.className = 'list-section-header';
  ablockHeader.innerHTML = `
    <h3>Alpha-Blockers</h3>
    <p class="hint">e.g. tamsulosin, alfuzosin, doxazosin.</p>
  `;
  card.appendChild(ablockHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'alphaBlockers',
    addLabel: 'Add alpha-blocker',
    emptyLabel: 'No alpha-blockers added.',
    namePlaceholder: 'e.g. Tamsulosin'
  }));

  const fariHeader = document.createElement('div');
  fariHeader.className = 'list-section-header';
  fariHeader.innerHTML = `
    <h3>5-Alpha-Reductase Inhibitors</h3>
    <p class="hint">e.g. finasteride, dutasteride.</p>
  `;
  card.appendChild(fariHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'fiveAlphaReductaseInhibitors',
    addLabel: 'Add 5-alpha-reductase inhibitor',
    emptyLabel: 'No 5-alpha-reductase inhibitors added.',
    namePlaceholder: 'e.g. Finasteride'
  }));

  const anticHeader = document.createElement('div');
  anticHeader.className = 'list-section-header';
  anticHeader.innerHTML = `
    <h3>Anticholinergics</h3>
    <p class="hint">e.g. oxybutynin, solifenacin, tolterodine.</p>
  `;
  card.appendChild(anticHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'anticholinergics',
    addLabel: 'Add anticholinergic',
    emptyLabel: 'No anticholinergics added.',
    namePlaceholder: 'e.g. Oxybutynin'
  }));

  const otherHeader = document.createElement('div');
  otherHeader.className = 'list-section-header';
  otherHeader.innerHTML = `
    <h3>Other Medications</h3>
    <p class="hint">Any other regular medications.</p>
  `;
  card.appendChild(otherHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'otherMedications',
    addLabel: 'Add other medication',
    emptyLabel: 'No other medications added.',
    namePlaceholder: 'e.g. Metformin'
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Family History',
    description: 'Urological and relevant conditions in your family.'
  });

  card.appendChild(radioGroup({
    label: 'Does anyone in your family have a history of prostate cancer?',
    section: 'familyHistory', field: 'prostateCancer', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Does anyone in your family have a history of bladder cancer?',
    section: 'familyHistory', field: 'bladderCancer', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Does anyone in your family have a history of kidney disease?',
    section: 'familyHistory', field: 'kidneyDisease', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Any other relevant family history',
    section: 'familyHistory', field: 'otherDetails',
    placeholder: 'Please describe any other urological or relevant conditions in your family...',
    rows: 3
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
  // Demographics
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  // Chief complaint
  ['chiefComplaint', 'primaryConcern'],
  ['chiefComplaint', 'duration'],
  ['chiefComplaint', 'urgency'],
  // IPSS questionnaire (7 questions)
  ['ipssQuestionnaire', 'q1'],
  ['ipssQuestionnaire', 'q2'],
  ['ipssQuestionnaire', 'q3'],
  ['ipssQuestionnaire', 'q4'],
  ['ipssQuestionnaire', 'q5'],
  ['ipssQuestionnaire', 'q6'],
  ['ipssQuestionnaire', 'q7'],
  // Quality of life
  ['qualityOfLife', 'qolScore'],
  // Urinary symptoms (9)
  ['urinarySymptoms', 'frequency'],
  ['urinarySymptoms', 'urgency'],
  ['urinarySymptoms', 'nocturia'],
  ['urinarySymptoms', 'hesitancy'],
  ['urinarySymptoms', 'stream'],
  ['urinarySymptoms', 'straining'],
  ['urinarySymptoms', 'hematuria'],
  ['urinarySymptoms', 'dysuria'],
  ['urinarySymptoms', 'incontinence'],
  // Renal function (numerics, optional)
  ['renalFunction', 'creatinine'],
  ['renalFunction', 'eGFR'],
  ['renalFunction', 'psa'],
  // Sexual health
  ['sexualHealth', 'erectileDysfunction'],
  ['sexualHealth', 'libidoChanges'],
  ['sexualHealth', 'ejaculatoryProblems'],
  // Medical history
  ['medicalHistory', 'diabetes'],
  ['medicalHistory', 'hypertension'],
  ['medicalHistory', 'neurologicConditions'],
  // Family history (3 yes/no)
  ['familyHistory', 'prostateCancer'],
  ['familyHistory', 'bladderCancer'],
  ['familyHistory', 'kidneyDisease']
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
  { step: 1,  section: 'demographics',         title: 'Demographics' },
  { step: 2,  section: 'chiefComplaint',       title: 'Chief Complaint' },
  { step: 3,  section: 'ipssQuestionnaire',    title: 'IPSS' },
  { step: 4,  section: 'qualityOfLife',        title: 'QoL' },
  { step: 5,  section: 'urinarySymptoms',      title: 'Urinary' },
  { step: 6,  section: 'renalFunction',        title: 'Renal' },
  { step: 7,  section: 'sexualHealth',         title: 'Sexual Health' },
  { step: 8,  section: 'medicalHistory',       title: 'Medical' },
  { step: 9,  section: 'currentMedications',   title: 'Medications' },
  { step: 10, section: 'familyHistory',        title: 'Family History' }
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
    ipssScore,
    ipssCategoryLabel,
    ipssCategoryKey: catKey,
    qolScore,
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
      <td class="num">${r.score} / 5</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No IPSS questions answered with positive scores.</p>`
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

  const qolBlock = qolScore == null
    ? `<p class="muted">Quality of life not answered.</p>`
    : `<p><strong>${qolScore} / 6</strong> &mdash; ${esc(qolLabel(qolScore))}</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Urology Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>IPSS Total Score</h3>
      <p class="ipss-summary">
        <span class="ipss-score-badge ${esc('category-' + catKey)}">${ipssScore} / 35</span>
        <span class="category-level">${esc(ipssCategoryLabel)} symptoms</span>
      </p>

      <h3>Quality of Life</h3>
      ${qolBlock}

      <h3>Per-question scores</h3>
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
  const { ipssScore, ipssCategoryLabel, firedRules } = calculateIPSS(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    ipssScore,
    ipssCategoryLabel,
    ipssCategoryKey: ipssCategoryKey(ipssScore),
    qolScore: state.qualityOfLife.qolScore,
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
