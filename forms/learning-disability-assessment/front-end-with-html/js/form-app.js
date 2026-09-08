import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateLD, severityClass, severityDescription, severityLabel } from './ld-grader.js';
import { bmiCategory, calculateBMI, emptyAssessment } from './types.js';

// Learning Disability Assessment - patient wizard (vanilla JS, no build).
//
// Single-page continuous wizard: every section is rendered into the page
// in document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered.
// Submission runs the pure adaptive-functioning grader plus the flagged-
// issues detector and renders an inline report. State is persisted to
// localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'learning-disability-assessment.front-end-form-with-html.v1';
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
      if (Array.isArray(fresh[key])) {
        fresh[key] = Array.isArray(parsed[key]) ? parsed[key] : fresh[key];
      } else {
        fresh[key] = { ...fresh[key], ...parsed[key] };
      }
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
  slug: 'learning-disability-assessment',
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
    refreshAutoCalculatedReadouts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/** Set a section.field on the state and persist; refresh derived UI. */
function setField(section, field, value) {
  state[section][field] = value;
  recomputeDerived();
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
}

function recomputeDerived() {
  state.physicalExamination.bmi = calculateBMI(
    state.physicalExamination.weight,
    state.physicalExamination.height
  );
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
    if (type === 'number') v = v === '' ? null : Number(v);
    setField(opts.section, opts.field, v);
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

function readOnlyReadout(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field readout';
  wrapper.innerHTML = `
    <label class="label">${esc(opts.label)}</label>
    <div id="${opts.id}" class="readout-value">${opts.render()}</div>
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
    `<span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Repeating-list editor (Health Action Plan)
// ----------------------------------------------------------------------

function actionListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.healthActionPlan.actions;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No actions added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row action-row';
      r.innerHTML = `
        <div class="list-grid action-grid">
          <label class="list-cell">
            <span>Action</span>
            <input type="text" class="text-input" data-key="action" value="${esc(row.action)}" placeholder="e.g. Refer to dietitian">
          </label>
          <label class="list-cell">
            <span>Owner</span>
            <input type="text" class="text-input" data-key="owner" value="${esc(row.owner)}" placeholder="e.g. GP, carer">
          </label>
          <label class="list-cell">
            <span>Due date</span>
            <input type="date" class="text-input" data-key="dueDate" value="${esc(row.dueDate)}">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove action">&times;</button>
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
    addBtn.textContent = '+ Add health action';
    addBtn.addEventListener('click', () => {
      rows.push({ action: '', owner: '', dueDate: '' });
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
// Section renderers
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const yesNoUnknown = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' }
];

const supportLevels = [
  { value: 'independent', label: 'Independent' },
  { value: 'some-support', label: 'Some support' },
  { value: 'significant-support', label: 'Significant support' },
  { value: 'full-support', label: 'Full support' }
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
    label: 'Preferred name (what the person likes to be called)',
    section: 'demographics', field: 'preferredName'
  }));

  const grid2 = document.createElement('div');
  grid2.className = 'two-col';
  grid2.appendChild(textInput({
    label: 'Date of Birth', section: 'demographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  grid2.appendChild(textInput({
    label: 'NHS Number', section: 'demographics', field: 'nhsNumber',
    placeholder: '000 000 0000'
  }));
  card.appendChild(grid2);

  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'demographics', field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
      { value: 'prefer-not-to-say', label: 'Prefer not to say' }
    ]
  }));

  const grid3 = document.createElement('div');
  grid3.className = 'two-col';
  grid3.appendChild(textInput({ label: 'GP practice', section: 'demographics', field: 'gpPractice' }));
  grid3.appendChild(textInput({ label: 'Ethnicity', section: 'demographics', field: 'ethnicity' }));
  card.appendChild(grid3);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Carer & Support Network',
    description: 'Who supports the person day to day.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'Primary carer name', section: 'carerSupport', field: 'primaryCarerName' }));
  grid.appendChild(textInput({ label: 'Relationship', section: 'carerSupport', field: 'primaryCarerRelationship', placeholder: 'e.g. mother, paid carer' }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Primary carer phone',
    section: 'carerSupport', field: 'primaryCarerPhone',
    type: 'tel'
  }));

  card.appendChild(radioGroup({
    label: 'Does the person live with their primary carer?',
    section: 'carerSupport', field: 'livesWithCarer', options: yesNo
  }));

  card.appendChild(textInput({
    label: 'Living arrangement',
    section: 'carerSupport', field: 'livingArrangement',
    placeholder: 'e.g. supported living, family home, residential care'
  }));

  card.appendChild(radioGroup({
    label: 'Is there a documented support plan?',
    section: 'carerSupport', field: 'hasSupportPlan', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Does the person have a social worker?',
    section: 'carerSupport', field: 'hasSocialWorker', options: yesNo
  }));

  const swDetails = document.createElement('div');
  swDetails.dataset.conditional = 'carerSupport.hasSocialWorker=yes';
  swDetails.appendChild(textInput({
    label: 'Social worker name', section: 'carerSupport', field: 'socialWorkerName'
  }));
  card.appendChild(swDetails);

  card.appendChild(textArea({
    label: 'Other supports (day services, advocacy, charities…)',
    section: 'carerSupport', field: 'otherSupports', rows: 2
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Communication Needs',
    description: 'How the person prefers to communicate (Easy Read, Makaton, AAC).'
  });

  card.appendChild(radioGroup({
    label: 'Verbal ability',
    section: 'communicationNeeds', field: 'verbalAbility',
    options: [
      { value: 'verbal', label: 'Verbal' },
      { value: 'limited-verbal', label: 'Limited verbal' },
      { value: 'non-verbal', label: 'Non-verbal' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Uses Easy Read materials?',
    section: 'communicationNeeds', field: 'usesEasyRead', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Uses Makaton signing?',
    section: 'communicationNeeds', field: 'usesMakaton', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Uses pictures or symbols?',
    section: 'communicationNeeds', field: 'usesPictures', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Uses AAC (augmentative or alternative communication device)?',
    section: 'communicationNeeds', field: 'usesAac', options: yesNo
  }));
  const aacDetails = document.createElement('div');
  aacDetails.dataset.conditional = 'communicationNeeds.usesAac=yes';
  aacDetails.appendChild(textInput({
    label: 'AAC details (device, app, vocabulary)',
    section: 'communicationNeeds', field: 'aacDetails'
  }));
  card.appendChild(aacDetails);

  card.appendChild(radioGroup({
    label: 'Does the person need a language interpreter?',
    section: 'communicationNeeds', field: 'needsInterpreter', options: yesNo
  }));
  const interpDetails = document.createElement('div');
  interpDetails.dataset.conditional = 'communicationNeeds.needsInterpreter=yes';
  interpDetails.appendChild(textInput({
    label: 'Interpreter language',
    section: 'communicationNeeds', field: 'interpreterLanguage'
  }));
  card.appendChild(interpDetails);

  card.appendChild(textInput({
    label: 'Preferred communication method',
    section: 'communicationNeeds', field: 'preferredCommunicationMethod',
    placeholder: 'e.g. short sentences, picture cards, calm voice'
  }));

  card.appendChild(textArea({
    label: 'Communication notes',
    section: 'communicationNeeds', field: 'communicationNotes',
    placeholder: 'Anything else clinicians should know about communication…',
    rows: 3
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Medical Review',
    description: 'Epilepsy, mental health, medications, and common comorbidities.'
  });

  card.appendChild(radioGroup({
    label: 'Does the person have epilepsy?',
    section: 'medicalReview', field: 'hasEpilepsy', options: yesNo
  }));
  const epiDetails = document.createElement('div');
  epiDetails.dataset.conditional = 'medicalReview.hasEpilepsy=yes';
  const epiGrid = document.createElement('div');
  epiGrid.className = 'two-col';
  epiGrid.appendChild(textInput({
    label: 'Date of last seizure',
    section: 'medicalReview', field: 'lastSeizureDate', type: 'date'
  }));
  epiGrid.appendChild(textInput({
    label: 'Average seizures per month',
    section: 'medicalReview', field: 'seizuresPerMonth',
    type: 'number', min: 0, max: 200
  }));
  epiDetails.appendChild(epiGrid);
  card.appendChild(epiDetails);

  card.appendChild(radioGroup({
    label: 'Does the person have a mental health diagnosis?',
    section: 'medicalReview', field: 'hasMentalHealthDiagnosis', options: yesNo
  }));
  const mhDetails = document.createElement('div');
  mhDetails.dataset.conditional = 'medicalReview.hasMentalHealthDiagnosis=yes';
  mhDetails.appendChild(textInput({
    label: 'Mental health diagnosis details',
    section: 'medicalReview', field: 'mentalHealthDetails'
  }));
  card.appendChild(mhDetails);

  card.appendChild(radioGroup({
    label: 'Does the person take psychotropic medication?',
    section: 'medicalReview', field: 'takesPsychotropic', options: yesNo
  }));
  const stompDetails = document.createElement('div');
  stompDetails.dataset.conditional = 'medicalReview.takesPsychotropic=yes';
  stompDetails.appendChild(radioGroup({
    label: 'Has a STOMP medication review been done in the last 12 months?',
    section: 'medicalReview', field: 'stompReviewDone', options: yesNo
  }));
  card.appendChild(stompDetails);

  card.appendChild(textArea({
    label: 'Current medications (name, dose, frequency)',
    section: 'medicalReview', field: 'currentMedications', rows: 4,
    placeholder: 'List all regular medications…'
  }));

  card.appendChild(radioGroup({ label: 'Dysphagia (difficulty swallowing)?', section: 'medicalReview', field: 'hasDysphagia', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Persistent constipation?', section: 'medicalReview', field: 'hasConstipation', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Bladder or bowel incontinence?', section: 'medicalReview', field: 'hasIncontinence', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Sleep problems?', section: 'medicalReview', field: 'hasSleepProblems', options: yesNo }));

  card.appendChild(textArea({
    label: 'Other medical issues',
    section: 'medicalReview', field: 'otherMedicalIssues', rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Physical Examination & Observations',
    description: 'Vital signs, BMI, and national screening status.'
  });

  const measurements = document.createElement('div');
  measurements.className = 'three-col';
  measurements.appendChild(textInput({
    label: 'Weight', section: 'physicalExamination', field: 'weight',
    type: 'number', min: 1, max: 400, unit: 'kg'
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'physicalExamination', field: 'height',
    type: 'number', min: 50, max: 250, unit: 'cm'
  }));
  measurements.appendChild(readOnlyReadout({
    label: 'BMI',
    id: 'bmi-readout',
    render: () => {
      const bmi = state.physicalExamination.bmi;
      if (bmi == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${bmi}</strong> <span class="muted">(${esc(bmiCategory(bmi))})</span>`;
    }
  }));
  card.appendChild(measurements);

  const vitals = document.createElement('div');
  vitals.className = 'three-col';
  vitals.appendChild(textInput({
    label: 'Systolic BP',
    section: 'physicalExamination', field: 'bloodPressureSystolic',
    type: 'number', min: 50, max: 260, unit: 'mmHg'
  }));
  vitals.appendChild(textInput({
    label: 'Diastolic BP',
    section: 'physicalExamination', field: 'bloodPressureDiastolic',
    type: 'number', min: 30, max: 180, unit: 'mmHg'
  }));
  vitals.appendChild(textInput({
    label: 'Pulse',
    section: 'physicalExamination', field: 'pulse',
    type: 'number', min: 30, max: 220, unit: 'bpm'
  }));
  card.appendChild(vitals);

  card.appendChild(radioGroup({
    label: 'Vision check up to date?',
    section: 'physicalExamination', field: 'visionChecked', options: yesNoUnknown
  }));
  card.appendChild(radioGroup({
    label: 'Hearing check up to date?',
    section: 'physicalExamination', field: 'hearingChecked', options: yesNoUnknown
  }));
  card.appendChild(radioGroup({
    label: 'Dental check up to date?',
    section: 'physicalExamination', field: 'dentalChecked', options: yesNoUnknown
  }));
  card.appendChild(radioGroup({
    label: 'Vaccinations up to date?',
    section: 'physicalExamination', field: 'vaccinationsUpToDate', options: yesNoUnknown
  }));
  card.appendChild(radioGroup({
    label: 'Cervical screening up to date (if applicable)?',
    section: 'physicalExamination', field: 'cervicalScreening', options: yesNoUnknown
  }));
  card.appendChild(radioGroup({
    label: 'Breast screening up to date (if applicable)?',
    section: 'physicalExamination', field: 'breastScreening', options: yesNoUnknown
  }));
  card.appendChild(radioGroup({
    label: 'Bowel cancer screening up to date (if applicable)?',
    section: 'physicalExamination', field: 'bowelScreening', options: yesNoUnknown
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Adaptive Functioning',
    description: 'Day-to-day functioning across the conceptual, social, and practical domains. This section drives the severity classification.'
  });

  const groupHeader = (text, hint) => {
    const h = document.createElement('div');
    h.className = 'list-section-header';
    h.innerHTML = `<h3>${esc(text)}</h3>${hint ? `<p class="hint">${esc(hint)}</p>` : ''}`;
    card.appendChild(h);
  };

  groupHeader('Conceptual domain', 'Language, reading, writing, money and time concepts.');
  card.appendChild(radioGroup({ label: 'Language and vocabulary', section: 'adaptiveFunctioning', field: 'conceptualLanguage', options: supportLevels }));
  card.appendChild(radioGroup({ label: 'Reading and writing', section: 'adaptiveFunctioning', field: 'conceptualReadingWriting', options: supportLevels }));
  card.appendChild(radioGroup({ label: 'Money, time, and number concepts', section: 'adaptiveFunctioning', field: 'conceptualMoneyTime', options: supportLevels }));

  groupHeader('Social domain', 'Friendships, empathy, and social communication.');
  card.appendChild(radioGroup({ label: 'Friendships and relationships', section: 'adaptiveFunctioning', field: 'socialFriendships', options: supportLevels }));
  card.appendChild(radioGroup({ label: 'Empathy and social judgement', section: 'adaptiveFunctioning', field: 'socialEmpathy', options: supportLevels }));
  card.appendChild(radioGroup({ label: 'Social communication', section: 'adaptiveFunctioning', field: 'socialCommunication', options: supportLevels }));

  groupHeader('Practical domain', 'Self-care, home living, community, and work or school.');
  card.appendChild(radioGroup({ label: 'Personal self-care (washing, dressing, eating)', section: 'adaptiveFunctioning', field: 'practicalSelfCare', options: supportLevels }));
  card.appendChild(radioGroup({ label: 'Home living (cooking, cleaning, household tasks)', section: 'adaptiveFunctioning', field: 'practicalHomeLiving', options: supportLevels }));
  card.appendChild(radioGroup({ label: 'Community use (shopping, transport, money handling)', section: 'adaptiveFunctioning', field: 'practicalCommunity', options: supportLevels }));
  card.appendChild(radioGroup({ label: 'Work or school skills', section: 'adaptiveFunctioning', field: 'practicalWorkSchool', options: supportLevels }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Behavioural Concerns & Triggers',
    description: 'Behaviours of concern and what helps when they occur.'
  });

  card.appendChild(radioGroup({ label: 'Self-injurious behaviour?', section: 'behaviouralConcerns', field: 'selfInjurious', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Aggression toward others?', section: 'behaviouralConcerns', field: 'aggression', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Property damage?', section: 'behaviouralConcerns', field: 'propertyDamage', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Absconding?', section: 'behaviouralConcerns', field: 'absconding', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Inappropriate sexualised behaviour?', section: 'behaviouralConcerns', field: 'sexualisedBehaviour', options: yesNo }));

  card.appendChild(textArea({
    label: 'Known triggers',
    section: 'behaviouralConcerns', field: 'knownTriggers',
    placeholder: 'e.g. crowded places, loud noises, changes in routine',
    rows: 3
  }));

  card.appendChild(textArea({
    label: 'Calming strategies that help',
    section: 'behaviouralConcerns', field: 'calmingStrategies',
    placeholder: 'e.g. quiet space, sensory toys, familiar objects',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Is there a positive behaviour support plan?',
    section: 'behaviouralConcerns', field: 'hasBehaviourSupportPlan', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Does the person receive PRN (as-required) sedative or psychotropic medication?',
    section: 'behaviouralConcerns', field: 'usesPrn', options: yesNo
  }));
  const prnDetails = document.createElement('div');
  prnDetails.dataset.conditional = 'behaviouralConcerns.usesPrn=yes';
  prnDetails.appendChild(textInput({
    label: 'PRN details (medication, dose, indication)',
    section: 'behaviouralConcerns', field: 'prnDetails'
  }));
  card.appendChild(prnDetails);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Mental Capacity & Consent',
    description: 'Decision-specific capacity under the Mental Capacity Act 2005.'
  });

  card.appendChild(radioGroup({
    label: 'Can the person consent to this health check?',
    section: 'mentalCapacityConsent', field: 'canConsentToHealthCheck', options: yesNoUnknown
  }));
  card.appendChild(radioGroup({
    label: 'Can the person consent to medication decisions?',
    section: 'mentalCapacityConsent', field: 'canConsentToMedication', options: yesNoUnknown
  }));
  card.appendChild(radioGroup({
    label: 'Can the person make decisions about finances?',
    section: 'mentalCapacityConsent', field: 'canConsentToFinances', options: yesNoUnknown
  }));

  card.appendChild(radioGroup({
    label: 'Is there a Lasting Power of Attorney (health and welfare)?',
    section: 'mentalCapacityConsent', field: 'hasLpa', options: yesNo
  }));
  const lpaDetails = document.createElement('div');
  lpaDetails.dataset.conditional = 'mentalCapacityConsent.hasLpa=yes';
  lpaDetails.appendChild(textInput({
    label: 'LPA holder details',
    section: 'mentalCapacityConsent', field: 'lpaDetails'
  }));
  card.appendChild(lpaDetails);

  card.appendChild(radioGroup({
    label: 'Is a Deprivation of Liberty Safeguard (DoLS) in place?',
    section: 'mentalCapacityConsent', field: 'hasDols', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Is a best-interests decision required for any item in this assessment?',
    section: 'mentalCapacityConsent', field: 'bestInterestsRequired', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Best-interests decision notes',
    section: 'mentalCapacityConsent', field: 'bestInterestsNotes',
    placeholder: 'Who was consulted; what was decided; why it is in the person\'s best interests…',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Reasonable Adjustments Required',
    description: 'Adjustments that make NHS services accessible (Equality Act 2010 / Accessible Information Standard).'
  });

  card.appendChild(radioGroup({ label: 'Needs longer appointments?', section: 'reasonableAdjustments', field: 'needsLongerAppointments', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Needs a quiet room or low-stimulation environment?', section: 'reasonableAdjustments', field: 'needsQuietRoom', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Needs a familiar staff member or carer present?', section: 'reasonableAdjustments', field: 'needsFamiliarStaff', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Needs Easy Read letters and information?', section: 'reasonableAdjustments', field: 'needsEasyReadLetters', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Needs home visits rather than clinic appointments?', section: 'reasonableAdjustments', field: 'needsHomeVisits', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Needs a double-length appointment slot?', section: 'reasonableAdjustments', field: 'needsDoubleAppointment', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Reasonable adjustments flag set on patient record?', section: 'reasonableAdjustments', field: 'flagOnRecord', options: yesNo }));

  card.appendChild(textArea({
    label: 'Other reasonable adjustments',
    section: 'reasonableAdjustments', field: 'otherAdjustments',
    rows: 3,
    placeholder: 'Any other adjustments needed for fair access to services…'
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Health Action Plan',
    description: 'List actions agreed with the person, who owns each, and when they are due.'
  });

  card.appendChild(actionListEditor());

  card.appendChild(textInput({
    label: 'Next review date',
    section: 'healthActionPlan', field: 'nextReviewDate', type: 'date'
  }));

  card.appendChild(textInput({
    label: 'Plan shared with',
    section: 'healthActionPlan', field: 'sharedWith',
    placeholder: 'e.g. carer, GP, day service'
  }));

  card.appendChild(textArea({
    label: 'Plan notes',
    section: 'healthActionPlan', field: 'planNotes', rows: 4,
    placeholder: 'Anything else that supports the plan…'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections + auto-calculated readouts
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

function refreshAutoCalculatedReadouts() {
  const bmi = document.getElementById('bmi-readout');
  if (bmi) {
    const v = state.physicalExamination.bmi;
    bmi.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}</strong> <span class="muted">(${esc(bmiCategory(v))})</span>`;
  }
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
  // Carer & support
  ['carerSupport', 'primaryCarerName'],
  ['carerSupport', 'livesWithCarer'],
  ['carerSupport', 'hasSupportPlan'],
  ['carerSupport', 'hasSocialWorker'],
  // Communication
  ['communicationNeeds', 'verbalAbility'],
  ['communicationNeeds', 'usesEasyRead'],
  ['communicationNeeds', 'usesMakaton'],
  ['communicationNeeds', 'usesAac'],
  ['communicationNeeds', 'usesPictures'],
  ['communicationNeeds', 'needsInterpreter'],
  // Medical review
  ['medicalReview', 'hasEpilepsy'],
  ['medicalReview', 'hasMentalHealthDiagnosis'],
  ['medicalReview', 'takesPsychotropic'],
  ['medicalReview', 'hasDysphagia'],
  ['medicalReview', 'hasConstipation'],
  ['medicalReview', 'hasIncontinence'],
  ['medicalReview', 'hasSleepProblems'],
  // Physical exam
  ['physicalExamination', 'weight'],
  ['physicalExamination', 'height'],
  ['physicalExamination', 'bloodPressureSystolic'],
  ['physicalExamination', 'bloodPressureDiastolic'],
  ['physicalExamination', 'pulse'],
  ['physicalExamination', 'visionChecked'],
  ['physicalExamination', 'hearingChecked'],
  ['physicalExamination', 'dentalChecked'],
  ['physicalExamination', 'vaccinationsUpToDate'],
  // Adaptive functioning (10)
  ['adaptiveFunctioning', 'conceptualLanguage'],
  ['adaptiveFunctioning', 'conceptualReadingWriting'],
  ['adaptiveFunctioning', 'conceptualMoneyTime'],
  ['adaptiveFunctioning', 'socialFriendships'],
  ['adaptiveFunctioning', 'socialEmpathy'],
  ['adaptiveFunctioning', 'socialCommunication'],
  ['adaptiveFunctioning', 'practicalSelfCare'],
  ['adaptiveFunctioning', 'practicalHomeLiving'],
  ['adaptiveFunctioning', 'practicalCommunity'],
  ['adaptiveFunctioning', 'practicalWorkSchool'],
  // Behavioural
  ['behaviouralConcerns', 'selfInjurious'],
  ['behaviouralConcerns', 'aggression'],
  ['behaviouralConcerns', 'propertyDamage'],
  ['behaviouralConcerns', 'absconding'],
  ['behaviouralConcerns', 'sexualisedBehaviour'],
  ['behaviouralConcerns', 'hasBehaviourSupportPlan'],
  ['behaviouralConcerns', 'usesPrn'],
  // Capacity
  ['mentalCapacityConsent', 'canConsentToHealthCheck'],
  ['mentalCapacityConsent', 'canConsentToMedication'],
  ['mentalCapacityConsent', 'canConsentToFinances'],
  ['mentalCapacityConsent', 'hasLpa'],
  ['mentalCapacityConsent', 'hasDols'],
  ['mentalCapacityConsent', 'bestInterestsRequired'],
  // Reasonable adjustments
  ['reasonableAdjustments', 'needsLongerAppointments'],
  ['reasonableAdjustments', 'needsQuietRoom'],
  ['reasonableAdjustments', 'needsFamiliarStaff'],
  ['reasonableAdjustments', 'needsEasyReadLetters'],
  ['reasonableAdjustments', 'needsHomeVisits'],
  ['reasonableAdjustments', 'needsDoubleAppointment'],
  ['reasonableAdjustments', 'flagOnRecord'],
  // Plan
  ['healthActionPlan', 'nextReviewDate']
];

const SECTION_FOR_STEP = {
  1:  'demographics',
  2:  'carerSupport',
  3:  'communicationNeeds',
  4:  'medicalReview',
  5:  'physicalExamination',
  6:  'adaptiveFunctioning',
  7:  'behaviouralConcerns',
  8:  'mentalCapacityConsent',
  9:  'reasonableAdjustments',
  10: 'healthActionPlan'
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
  { step: 1,  section: 'demographics',           title: 'Demographics' },
  { step: 2,  section: 'carerSupport',           title: 'Carer & Support' },
  { step: 3,  section: 'communicationNeeds',     title: 'Communication' },
  { step: 4,  section: 'medicalReview',          title: 'Medical Review' },
  { step: 5,  section: 'physicalExamination',    title: 'Physical Exam' },
  { step: 6,  section: 'adaptiveFunctioning',    title: 'Adaptive Functioning' },
  { step: 7,  section: 'behaviouralConcerns',    title: 'Behavioural' },
  { step: 8,  section: 'mentalCapacityConsent',  title: 'Capacity & Consent' },
  { step: 9,  section: 'reasonableAdjustments',  title: 'Adjustments' },
  { step: 10, section: 'healthActionPlan',       title: 'Action Plan' }
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
    case 'high': return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

function supportLevelLabel(score) {
  switch (score) {
    case 0: return 'Independent';
    case 1: return 'Some support';
    case 2: return 'Significant support';
    case 3: return 'Full support';
    default: return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    adaptiveScore, severityCategory, answeredCount,
    firedRules, additionalFlags, timestamp
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
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
      <td class="num">${r.score} <span class="muted">(${esc(supportLevelLabel(r.score))})</span></td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No adaptive-functioning items answered.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Domain</th>
            <th scope="col">Item</th>
            <th scope="col">Support</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Learning Disability Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Severity Classification</h3>
      <p class="severity-summary">
        <span class="severity-badge ${severityClass(severityCategory)}">${esc(severityLabel(severityCategory))}</span>
        <span class="severity-score">Mean adaptive support: <strong>${adaptiveScore.toFixed(2)}</strong> / 3</span>
      </p>
      <p class="muted">${esc(severityDescription(severityCategory))}</p>
      <p class="muted">Based on ${answeredCount} of 10 adaptive-functioning items answered.</p>

      <h3>Adaptive functioning detail</h3>
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
  recomputeDerived();
  const { adaptiveScore, severityCategory, answeredCount, firedRules } = calculateLD(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    adaptiveScore,
    severityCategory,
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
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
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
  host.appendChild(renderStep10());
}

function init() {
  recomputeDerived();
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
