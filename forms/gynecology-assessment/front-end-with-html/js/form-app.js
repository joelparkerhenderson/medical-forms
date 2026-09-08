import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateSymptomScore } from './symptom-grader.js';
import { symptomDefinitions, symptomResponseOptions } from './symptom-rules.js';
import { calculateAge, emptyAssessment, menopausalStatusLabel, severityCategory, severityClass } from './types.js';

// Gynecology Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure Symptom Severity scoring engine and renders an inline
// report. State is persisted to localStorage so a partial fill survives a
// page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'gynecology-assessment.front-end-form-with-html.v1';

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
  slug: 'gynecology-assessment',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const out = document.getElementById('report');
    if (out) out.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
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
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

// ----------------------------------------------------------------------
// Component builders
// ----------------------------------------------------------------------

/**
 * Build a labelled text input.
 * @param {{ label: string, section: string, field: string, type?: string,
 *           placeholder?: string, required?: boolean, min?: number,
 *           max?: number, step?: number, unit?: string }} opts
 */
function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const requiredMark = opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '';
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
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}${requiredMark}</label>
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
 *           placeholder?: string, required?: boolean }} opts
 */
function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] ?? '';
  const requiredMark = opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}${requiredMark}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      ${opts.required ? 'required data-required' : ''}
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

/**
 * Build a select / dropdown input.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[],
 *           required?: boolean }} opts
 */
function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const requiredMark = opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}${requiredMark}</label>
    <select id="${id}" name="${id}" class="select"
      ${opts.required ? 'required data-required' : ''}
      aria-describedby="${id}-error">
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

/**
 * Build a radio group.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string | number, label: string }[],
 *           required?: boolean, numeric?: boolean }} opts
 */
function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'field';
  fieldset.id = `${groupId}-fieldset`;
  fieldset.setAttribute('aria-describedby', `${groupId}-error`);

  const legend = document.createElement('legend');
  legend.className = 'label';
  if (opts.required) legend.setAttribute('data-required', '');
  legend.innerHTML = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  fieldset.appendChild(legend);

  const group = document.createElement('div');
  group.className = 'radio-group';
  group.setAttribute('role', 'radiogroup');
  for (const option of opts.options) {
    const radioId = `${groupId}-${String(option.value)}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    const requiredAttr = opts.required ? ' required data-required' : '';
    label.innerHTML = `
      <input type="radio" class="radio-input" id="${radioId}" name="${groupId}" value="${esc(String(option.value))}"${checked}${requiredAttr}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        const v = opts.numeric ? Number(option.value) : option.value;
        setField(opts.section, opts.field, v);
        clearFieldError(groupId);
      }
    });
    group.appendChild(label);
  }
  fieldset.appendChild(group);
  const err = document.createElement('span');
  err.className = 'error-message';
  err.id = `${groupId}-error`;
  err.setAttribute('aria-live', 'polite');
  fieldset.appendChild(err);
  return fieldset;
}

/**
 * Build a section card as a Lily fieldset.
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
 * @param {{ section: string, field: string, addLabel: string, emptyLabel: string }} opts
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
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Combined OCP">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 30 mcg">
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
    description: 'Basic patient information and menopausal status.'
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
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ],
    required: true
  }));
  card.appendChild(selectInput({
    label: 'Menopausal Status',
    section: 'demographics',
    field: 'menopausalStatus',
    options: [
      { value: 'pre-menopausal', label: 'Pre-menopausal' },
      { value: 'peri-menopausal', label: 'Peri-menopausal' },
      { value: 'post-menopausal', label: 'Post-menopausal' },
      { value: 'unknown', label: 'Unknown' }
    ],
    required: true
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Chief Complaint',
    description: 'Describe your primary gynaecological concern.'
  });

  card.appendChild(textArea({
    label: 'What is your primary gynaecological concern?',
    section: 'chiefComplaint',
    field: 'primaryConcern',
    placeholder: 'Describe your main concern…'
  }));

  card.appendChild(textInput({
    label: 'How long have you had this concern?',
    section: 'chiefComplaint',
    field: 'duration',
    placeholder: 'e.g., 2 weeks, 3 months, 5 years',
    required: true
  }));

  card.appendChild(radioGroup({
    label: 'How has the condition been changing?',
    section: 'chiefComplaint',
    field: 'progression',
    options: [
      { value: 'stable', label: 'Stable' },
      { value: 'improving', label: 'Improving' },
      { value: 'worsening', label: 'Worsening' },
      { value: 'fluctuating', label: 'Fluctuating' }
    ],
    required: true
  }));

  card.appendChild(textArea({
    label: 'Previous treatments tried',
    section: 'chiefComplaint',
    field: 'previousTreatments',
    placeholder: 'List any treatments you have tried for this condition…'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Menstrual History',
    description: 'Details about your menstrual cycle and symptoms.'
  });

  card.appendChild(textInput({
    label: 'Cycle Length',
    section: 'menstrualHistory', field: 'cycleLength',
    type: 'number', min: 18, max: 45, step: 1, unit: 'days'
  }));

  card.appendChild(textInput({
    label: 'Cycle Duration (period length)',
    section: 'menstrualHistory', field: 'cycleDuration',
    type: 'number', min: 1, max: 14, step: 1, unit: 'days'
  }));

  card.appendChild(selectInput({
    label: 'Flow Heaviness',
    section: 'menstrualHistory', field: 'flowHeaviness',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'heavy', label: 'Heavy' },
      { value: 'very-heavy', label: 'Very heavy (flooding / clots)' }
    ],
    required: true
  }));

  card.appendChild(radioGroup({
    label: 'How severe is your menstrual pain (dysmenorrhoea)?',
    section: 'menstrualHistory', field: 'painSeverity',
    options: symptomResponseOptions,
    numeric: true
  }));

  card.appendChild(radioGroup({
    label: 'Cycle Regularity',
    section: 'menstrualHistory', field: 'regularity',
    options: [
      { value: 'regular', label: 'Regular' },
      { value: 'irregular', label: 'Irregular' },
      { value: 'absent', label: 'Absent (amenorrhoea)' }
    ],
    required: true
  }));

  card.appendChild(textInput({
    label: 'Date of Last Menstrual Period',
    section: 'menstrualHistory', field: 'lastMenstrualPeriod',
    type: 'date'
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Gynaecological Symptoms',
    description: 'Rate the severity of your current gynaecological symptoms.'
  });

  const symptomQuestions = [
    { key: 'pelvicPain',       label: '1. Do you experience pelvic pain outside of menstruation?' },
    { key: 'abnormalBleeding', label: '2. Do you experience bleeding between periods or after intercourse?' },
    { key: 'discharge',        label: '3. Do you experience abnormal vaginal discharge?' },
    { key: 'urinarySymptoms',  label: '4. Do you experience urinary frequency, urgency, or incontinence?' }
  ];

  for (const q of symptomQuestions) {
    card.appendChild(radioGroup({
      label: q.label,
      section: 'gynecologicalSymptoms',
      field: q.key,
      options: symptomResponseOptions,
      numeric: true
    }));
  }

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Cervical Screening',
    description: 'Cervical smear and HPV vaccination history.'
  });

  card.appendChild(textInput({
    label: 'Date of Last Cervical Smear',
    section: 'cervicalScreening', field: 'lastSmearDate',
    type: 'date'
  }));

  card.appendChild(selectInput({
    label: 'Last Smear Result',
    section: 'cervicalScreening', field: 'lastSmearResult',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'abnormal', label: 'Abnormal' },
      { value: 'inadequate', label: 'Inadequate sample' },
      { value: 'awaiting', label: 'Awaiting results' },
      { value: 'unknown', label: 'Unknown / Not sure' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'HPV Vaccination Status',
    section: 'cervicalScreening', field: 'hpvVaccination',
    options: [
      { value: 'complete', label: 'Fully vaccinated' },
      { value: 'partial', label: 'Partially vaccinated' },
      { value: 'none', label: 'Not vaccinated' },
      { value: 'unknown', label: 'Unknown / Not sure' }
    ]
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Obstetric History',
    description: 'Pregnancy and birth history.'
  });

  card.appendChild(textInput({
    label: 'Gravida (total pregnancies)',
    section: 'obstetricHistory', field: 'gravida',
    type: 'number', min: 0, max: 20, step: 1
  }));

  card.appendChild(textInput({
    label: 'Para (live births)',
    section: 'obstetricHistory', field: 'para',
    type: 'number', min: 0, max: 20, step: 1
  }));

  card.appendChild(textArea({
    label: 'Pregnancy/delivery complications',
    section: 'obstetricHistory', field: 'complications',
    placeholder: 'e.g., pre-eclampsia, gestational diabetes, caesarean sections, miscarriages, ectopic pregnancies…'
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Sexual Health',
    description: 'Sexual activity, contraception, and STI history.'
  });

  card.appendChild(radioGroup({
    label: 'Are you currently sexually active?',
    section: 'sexualHealth', field: 'sexuallyActive', options: yesNo
  }));

  card.appendChild(textInput({
    label: 'Current contraception method',
    section: 'sexualHealth', field: 'contraceptionMethod',
    placeholder: 'e.g., combined pill, IUD, condoms, none…'
  }));

  card.appendChild(radioGroup({
    label: 'Do you have a history of sexually transmitted infections (STIs)?',
    section: 'sexualHealth', field: 'stiHistory', options: yesNo
  }));

  const stiHost = document.createElement('div');
  stiHost.dataset.conditional = 'sexualHealth.stiHistory=yes';
  stiHost.appendChild(textArea({
    label: 'Please provide details',
    section: 'sexualHealth', field: 'stiDetails',
    placeholder: 'e.g., chlamydia 2020, treated with antibiotics…'
  }));
  card.appendChild(stiHost);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Medical History',
    description: 'Previous gynaecological conditions and relevant medical history.'
  });

  card.appendChild(textArea({
    label: 'Previous gynaecological conditions',
    section: 'medicalHistory', field: 'previousGynConditions',
    placeholder: 'e.g., endometriosis, fibroids, ovarian cysts, PCOS…'
  }));

  card.appendChild(textArea({
    label: 'Chronic diseases',
    section: 'medicalHistory', field: 'chronicDiseases',
    placeholder: 'e.g., diabetes, hypertension, thyroid disease…'
  }));

  card.appendChild(textArea({
    label: 'Surgical history',
    section: 'medicalHistory', field: 'surgicalHistory',
    placeholder: 'e.g., laparoscopy, hysteroscopy, caesarean section…'
  }));

  card.appendChild(radioGroup({
    label: 'Do you have any autoimmune diseases?',
    section: 'medicalHistory', field: 'autoimmuneDiseases', options: yesNo
  }));

  const autoHost = document.createElement('div');
  autoHost.dataset.conditional = 'medicalHistory.autoimmuneDiseases=yes';
  autoHost.appendChild(textArea({
    label: 'Please provide details',
    section: 'medicalHistory', field: 'autoimmuneDiseaseDetails',
    placeholder: 'e.g., lupus, rheumatoid arthritis, Hashimoto thyroiditis…'
  }));
  card.appendChild(autoHost);

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Current Medications',
    description: 'List all current medications and supplements.'
  });

  const hHeader = document.createElement('div');
  hHeader.className = 'list-section-header';
  hHeader.innerHTML = `
    <h3>Hormonal medications</h3>
    <p class="hint">e.g. combined pill, progestogen-only pill, HRT, IUS, implant.</p>
  `;
  card.appendChild(hHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'hormonal',
    addLabel: 'Add hormonal medication',
    emptyLabel: 'No hormonal medications added.'
  }));

  const nHeader = document.createElement('div');
  nHeader.className = 'list-section-header';
  nHeader.innerHTML = `
    <h3>Non-hormonal medications</h3>
    <p class="hint">e.g. tranexamic acid, NSAIDs, antibiotics, antidepressants.</p>
  `;
  card.appendChild(nHeader);
  card.appendChild(medicationListEditor({
    section: 'currentMedications',
    field: 'nonHormonal',
    addLabel: 'Add non-hormonal medication',
    emptyLabel: 'No non-hormonal medications added.'
  }));

  card.appendChild(textArea({
    label: 'Supplements and over-the-counter products',
    section: 'currentMedications', field: 'supplements',
    placeholder: 'e.g., iron supplements, folic acid, vitamins…'
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Family History',
    description: 'Gynaecological and relevant conditions in your family.'
  });

  card.appendChild(radioGroup({
    label: 'Does anyone in your family have a history of breast cancer?',
    section: 'familyHistory', field: 'breastCancer', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Does anyone in your family have a history of ovarian cancer?',
    section: 'familyHistory', field: 'ovarianCancer', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Does anyone in your family have a history of cervical cancer?',
    section: 'familyHistory', field: 'cervicalCancer', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Does anyone in your family have endometriosis?',
    section: 'familyHistory', field: 'endometriosis', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Does anyone in your family have polycystic ovary syndrome (PCOS)?',
    section: 'familyHistory', field: 'pcos', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Any other relevant family history',
    section: 'familyHistory', field: 'otherDetails',
    placeholder: 'Please describe any other relevant family conditions…'
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
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics',           title: 'Demographics' },
  { step: 2,  section: 'chiefComplaint',         title: 'Chief Complaint' },
  { step: 3,  section: 'menstrualHistory',       title: 'Menstrual History' },
  { step: 4,  section: 'gynecologicalSymptoms',  title: 'Gynaecological Symptoms' },
  { step: 5,  section: 'cervicalScreening',      title: 'Cervical Screening' },
  { step: 6,  section: 'obstetricHistory',       title: 'Obstetric History' },
  { step: 7,  section: 'sexualHealth',           title: 'Sexual Health' },
  { step: 8,  section: 'medicalHistory',         title: 'Medical History' },
  { step: 9,  section: 'currentMedications',     title: 'Current Medications' },
  { step: 10, section: 'familyHistory',          title: 'Family History' }
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
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'menopausalStatus'],
  // Chief complaint
  ['chiefComplaint', 'primaryConcern'],
  ['chiefComplaint', 'duration'],
  ['chiefComplaint', 'progression'],
  // Menstrual history
  ['menstrualHistory', 'cycleLength'],
  ['menstrualHistory', 'cycleDuration'],
  ['menstrualHistory', 'flowHeaviness'],
  ['menstrualHistory', 'painSeverity'],
  ['menstrualHistory', 'regularity'],
  ['menstrualHistory', 'lastMenstrualPeriod'],
  // Gynaecological symptoms (4 ratings)
  ['gynecologicalSymptoms', 'pelvicPain'],
  ['gynecologicalSymptoms', 'abnormalBleeding'],
  ['gynecologicalSymptoms', 'discharge'],
  ['gynecologicalSymptoms', 'urinarySymptoms'],
  // Cervical screening
  ['cervicalScreening', 'lastSmearDate'],
  ['cervicalScreening', 'lastSmearResult'],
  ['cervicalScreening', 'hpvVaccination'],
  // Obstetric history
  ['obstetricHistory', 'gravida'],
  ['obstetricHistory', 'para'],
  // Sexual health
  ['sexualHealth', 'sexuallyActive'],
  ['sexualHealth', 'contraceptionMethod'],
  ['sexualHealth', 'stiHistory'],
  // Medical history
  ['medicalHistory', 'autoimmuneDiseases'],
  // Family history (5 yes/no)
  ['familyHistory', 'breastCancer'],
  ['familyHistory', 'ovarianCancer'],
  ['familyHistory', 'cervicalCancer'],
  ['familyHistory', 'endometriosis'],
  ['familyHistory', 'pcos']
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
  const text = document.getElementById('progress-text');
  if (bar) bar.value = percent;
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(sectionAnswered, sectionTotal);
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
  const fs = document.getElementById(`${id}-fieldset`);
  if (fs) fs.setAttribute('aria-invalid', 'true');
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
    } else if (input.tagName === 'LABEL' || input.tagName === 'LEGEND') {
      return;
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

function patientNameLine() {
  const fn = state.demographics.firstName || '';
  const ln = state.demographics.lastName || '';
  const name = `${fn} ${ln}`.trim();
  const dob = state.demographics.dateOfBirth || '';
  const age = calculateAge(dob);
  const meno = menopausalStatusLabel(state.demographics.menopausalStatus);
  const parts = [];
  if (name) parts.push(name);
  if (age !== null) parts.push(`age ${age}`);
  if (meno) parts.push(meno);
  return parts.join(' — ');
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { symptomScore, symptomCategory, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td class="num">${r.score} / 3</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No symptoms scored above zero.</p>`
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

  const nameLine = patientNameLine();

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Gynecology Assessment Report</h2>
        ${nameLine ? `<p class="muted">${esc(nameLine)}</p>` : ''}
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Symptom Severity Score</h3>
      <p class="score-summary">
        <span class="score-badge ${severityClass(symptomScore)}">${symptomScore} / 30</span>
        <span class="severity-level">${esc(symptomCategory)}</span>
      </p>
      <p class="muted">Composite of menstrual pain, flow, pelvic pain, abnormal bleeding, vaginal discharge, urinary symptoms, and quality-of-life impact.</p>

      <h3>Symptoms scored</h3>
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
  const { symptomScore, symptomCategoryLabel, firedRules } = calculateSymptomScore(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    symptomScore,
    symptomCategory: symptomCategoryLabel,
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
  const out = document.getElementById('report');
  if (out) out.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
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
