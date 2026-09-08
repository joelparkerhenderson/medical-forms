import { calculateDAS28 } from './das28-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { bmiCategory, calculateBMI, classifyDiseaseActivity, diseaseActivityClass, diseaseActivityLabel, emptyAssessment } from './types.js';

// Rheumatology Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure DAS28 grading engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'rheumatology-assessment.front-end-form-with-html.v1';

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
  slug: 'rheumatology-assessment',
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

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs derived values (BMI), progress, and conditional visibility
 * after each change.
 *
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  recomputeDerived();
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
}

/** Recompute auto-calculated values that depend on other fields. */
function recomputeDerived() {
  state.demographics.bmi = calculateBMI(
    state.demographics.weight,
    state.demographics.height
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
// Component builders (Lily-shaped)
// ----------------------------------------------------------------------

const TOTAL_STEPS = 10;

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
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select"${requiredAttr} aria-describedby="${id}-error">
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

/**
 * Build a 0-100 mm visual analogue scale (range slider).
 * @param {{ label: string, section: string, field: string, required?: boolean,
 *           leftHint: string, rightHint: string }} opts
 */
function vasSlider(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const initial = value === null || value === undefined ? 0 : value;
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  wrapper.innerHTML = `
    <label for="${id}">${labelText}</label>
    <input id="${id}" name="${id}" type="range" min="0" max="100"
      value="${initial}" class="range-input">
    <div class="range-meta">
      <span>0 — ${esc(opts.leftHint)}</span>
      <span class="range-value" data-vas-value="${id}">${initial}mm</span>
      <span>100 — ${esc(opts.rightHint)}</span>
    </div>
  `;
  const input = wrapper.querySelector('input');
  const display = wrapper.querySelector(`[data-vas-value="${id}"]`);
  input.addEventListener('input', () => {
    const v = input.value === '' ? null : Number(input.value);
    display.textContent = `${v ?? 0}mm`;
    setField(opts.section, opts.field, v);
  });
  return wrapper;
}

/**
 * Read-only auto-calculated readout (e.g. BMI).
 * @param {{ label: string, id: string, render: () => string }} opts
 */
function readOnlyReadout(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field readout';
  wrapper.innerHTML = `
    <label>${esc(opts.label)}</label>
    <div id="${opts.id}" class="readout-value">${opts.render()}</div>
  `;
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

/** Append a sub-heading inside a section card. */
function subheading(card, text) {
  const h = document.createElement('h3');
  h.className = 'subheading';
  h.textContent = text;
  card.appendChild(h);
}

// ----------------------------------------------------------------------
// Repeating-list editors (medications, allergies)
// ----------------------------------------------------------------------

/**
 * Editor for an array of {name, dose, frequency} medication rows.
 * @param {{ section: string, field: string, addLabel: string,
 *           emptyLabel: string }} opts
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
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Methotrexate">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 15 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. weekly">
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

/** Editor for an array of {allergen, reaction, severity} drug-allergy rows. */
function drugAllergyEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.allergies.drugAllergies;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No drug allergies added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row allergy-row';
      r.innerHTML = `
        <div class="list-grid allergy-grid">
          <label class="list-cell">
            <span>Drug / allergen</span>
            <input type="text" class="text-input" data-key="allergen" value="${esc(row.allergen)}" placeholder="e.g. Penicillin">
          </label>
          <label class="list-cell">
            <span>Reaction</span>
            <input type="text" class="text-input" data-key="reaction" value="${esc(row.reaction)}" placeholder="e.g. Rash, swelling">
          </label>
          <label class="list-cell">
            <span>Severity</span>
            <select class="select" data-key="severity">
              <option value="">— Select —</option>
              <option value="mild"${row.severity === 'mild' ? ' selected' : ''}>Mild</option>
              <option value="moderate"${row.severity === 'moderate' ? ' selected' : ''}>Moderate</option>
              <option value="anaphylaxis"${row.severity === 'anaphylaxis' ? ' selected' : ''}>Anaphylaxis</option>
            </select>
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove drug allergy">&times;</button>
        </div>
      `;
      r.querySelectorAll('input, select').forEach((inp) => {
        inp.addEventListener('input', () => {
          rows[idx][inp.dataset.key] = inp.value;
          saveState(state);
          updateProgress();
        });
        inp.addEventListener('change', () => {
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
    addBtn.textContent = '+ Add drug allergy';
    addBtn.addEventListener('click', () => {
      rows.push({ allergen: '', reaction: '', severity: '' });
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

const positiveNegative = [
  { value: 'yes', label: 'Positive' },
  { value: 'no', label: 'Negative' }
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
    required: true,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  const measurements = document.createElement('div');
  measurements.className = 'three-col';
  measurements.appendChild(textInput({
    label: 'Weight', section: 'demographics', field: 'weight',
    type: 'number', min: 1, max: 400, unit: 'kg', required: true
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'demographics', field: 'height',
    type: 'number', min: 50, max: 250, unit: 'cm', required: true
  }));
  measurements.appendChild(readOnlyReadout({
    label: 'BMI',
    id: 'bmi-readout',
    render: () => {
      const bmi = state.demographics.bmi;
      if (bmi == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${bmi}</strong> <span class="muted">(${esc(bmiCategory(bmi))})</span>`;
    }
  }));
  card.appendChild(measurements);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Chief Complaint',
    description: 'Primary joint complaint and symptom details.'
  });

  card.appendChild(textArea({
    label: 'Primary Joint Complaint',
    section: 'chiefComplaint', field: 'primaryJointComplaint',
    placeholder: 'Describe your main joint complaint…',
    rows: 3
  }));

  card.appendChild(textInput({
    label: 'Onset Date',
    section: 'chiefComplaint', field: 'onsetDate',
    type: 'date'
  }));

  card.appendChild(textInput({
    label: 'Duration of Symptoms',
    section: 'chiefComplaint', field: 'durationMonths',
    type: 'number', min: 0, max: 600, unit: 'months'
  }));

  card.appendChild(textInput({
    label: 'Morning Stiffness Duration',
    section: 'chiefComplaint', field: 'morningStiffnessDurationMinutes',
    type: 'number', min: 0, max: 1440, unit: 'minutes'
  }));

  card.appendChild(radioGroup({
    label: 'Symmetric Joint Involvement',
    section: 'chiefComplaint', field: 'symmetricInvolvement',
    options: yesNo
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Joint Assessment',
    description: '28-joint count assessment for DAS28 calculation.'
  });

  const intro = document.createElement('p');
  intro.className = 'muted';
  intro.style.marginBottom = '1rem';
  intro.textContent =
    'The 28-joint count includes bilateral shoulders, elbows, wrists, ' +
    'MCP joints (1-5), PIP joints (1-5), and knees. Count each tender ' +
    'or swollen joint.';
  card.appendChild(intro);

  card.appendChild(textInput({
    label: 'Tender Joint Count (TJC28)',
    section: 'jointAssessment', field: 'tenderJointCount28',
    type: 'number', min: 0, max: 28, required: true
  }));

  card.appendChild(textInput({
    label: 'Swollen Joint Count (SJC28)',
    section: 'jointAssessment', field: 'swollenJointCount28',
    type: 'number', min: 0, max: 28, required: true
  }));

  card.appendChild(vasSlider({
    label: 'Pain VAS (0-100mm)',
    section: 'jointAssessment', field: 'painVAS',
    required: true,
    leftHint: 'No pain', rightHint: 'Worst pain'
  }));

  card.appendChild(vasSlider({
    label: 'Patient Global Assessment VAS (0-100mm)',
    section: 'jointAssessment', field: 'patientGlobalVAS',
    required: true,
    leftHint: 'Very well', rightHint: 'Very poor'
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Disease History',
    description: 'Rheumatological diagnosis and treatment history.'
  });

  card.appendChild(selectInput({
    label: 'Primary Diagnosis',
    section: 'diseaseHistory', field: 'primaryDiagnosis',
    required: true,
    options: [
      { value: 'rheumatoid-arthritis', label: 'Rheumatoid Arthritis' },
      { value: 'psoriatic-arthritis', label: 'Psoriatic Arthritis' },
      { value: 'ankylosing-spondylitis', label: 'Ankylosing Spondylitis' },
      { value: 'systemic-lupus', label: 'Systemic Lupus Erythematosus' },
      { value: 'gout', label: 'Gout' },
      { value: 'osteoarthritis', label: 'Osteoarthritis' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Date of Diagnosis',
    section: 'diseaseHistory', field: 'diagnosisDate',
    type: 'date'
  }));

  card.appendChild(textInput({
    label: 'Disease Duration',
    section: 'diseaseHistory', field: 'diseaseDurationYears',
    type: 'number', min: 0, max: 80, unit: 'years'
  }));

  card.appendChild(textArea({
    label: 'Previous DMARDs',
    section: 'diseaseHistory', field: 'previousDMARDs',
    placeholder: 'e.g., Methotrexate, Sulfasalazine, Hydroxychloroquine…'
  }));

  card.appendChild(textArea({
    label: 'Previous Biologics',
    section: 'diseaseHistory', field: 'previousBiologics',
    placeholder: 'e.g., Adalimumab, Etanercept, Rituximab…'
  }));

  card.appendChild(radioGroup({
    label: 'Any Remission Periods?',
    section: 'diseaseHistory', field: 'remissionPeriods',
    options: yesNo
  }));
  const remissionDetails = document.createElement('div');
  remissionDetails.dataset.conditional = 'diseaseHistory.remissionPeriods=yes';
  remissionDetails.appendChild(textArea({
    label: 'Remission Details',
    section: 'diseaseHistory', field: 'remissionDetails',
    placeholder: 'Duration, how achieved, any relapses…'
  }));
  card.appendChild(remissionDetails);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Extra-articular Features',
    description: 'Manifestations beyond the joints.'
  });

  subheading(card, 'Skin');
  card.appendChild(radioGroup({
    label: 'Rheumatoid Nodules',
    section: 'extraArticularFeatures', field: 'rheumatoidNodules',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Skin Rash',
    section: 'extraArticularFeatures', field: 'skinRash',
    options: yesNo
  }));
  const skinRashDetails = document.createElement('div');
  skinRashDetails.dataset.conditional = 'extraArticularFeatures.skinRash=yes';
  skinRashDetails.appendChild(textArea({
    label: 'Skin Rash Details',
    section: 'extraArticularFeatures', field: 'skinRashDetails',
    placeholder: 'Describe rash type, distribution…'
  }));
  card.appendChild(skinRashDetails);

  subheading(card, 'Eyes');
  card.appendChild(radioGroup({
    label: "Eye Dryness (Sjogren's)",
    section: 'extraArticularFeatures', field: 'eyeDryness',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Uveitis',
    section: 'extraArticularFeatures', field: 'uveitis',
    options: yesNo
  }));
  const uveitisDetails = document.createElement('div');
  uveitisDetails.dataset.conditional = 'extraArticularFeatures.uveitis=yes';
  uveitisDetails.appendChild(textArea({
    label: 'Uveitis Details',
    section: 'extraArticularFeatures', field: 'uveitisDetails',
    placeholder: 'Type, frequency, treatment…'
  }));
  card.appendChild(uveitisDetails);

  subheading(card, 'Lungs');
  card.appendChild(radioGroup({
    label: 'Interstitial Lung Disease (ILD)',
    section: 'extraArticularFeatures', field: 'interstitialLungDisease',
    options: yesNo
  }));
  const ildDetails = document.createElement('div');
  ildDetails.dataset.conditional = 'extraArticularFeatures.interstitialLungDisease=yes';
  ildDetails.appendChild(textArea({
    label: 'ILD Details',
    section: 'extraArticularFeatures', field: 'ildDetails',
    placeholder: 'Type, severity, treatment…'
  }));
  card.appendChild(ildDetails);

  subheading(card, 'Cardiovascular');
  card.appendChild(radioGroup({
    label: 'Cardiovascular Involvement',
    section: 'extraArticularFeatures', field: 'cardiovascularInvolvement',
    options: yesNo
  }));
  const cvDetails = document.createElement('div');
  cvDetails.dataset.conditional = 'extraArticularFeatures.cardiovascularInvolvement=yes';
  cvDetails.appendChild(textArea({
    label: 'Cardiovascular Details',
    section: 'extraArticularFeatures', field: 'cardiovascularDetails',
    placeholder: 'Pericarditis, vasculitis, etc…'
  }));
  card.appendChild(cvDetails);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Laboratory Results',
    description: 'Recent blood test results and serological markers.'
  });

  subheading(card, 'Inflammatory Markers');
  const inflam = document.createElement('div');
  inflam.className = 'two-col';
  inflam.appendChild(textInput({
    label: 'ESR', section: 'laboratoryResults', field: 'esr',
    type: 'number', min: 0, max: 200, unit: 'mm/hr', required: true
  }));
  inflam.appendChild(textInput({
    label: 'CRP', section: 'laboratoryResults', field: 'crp',
    type: 'number', min: 0, max: 500, step: 0.1, unit: 'mg/L'
  }));
  card.appendChild(inflam);

  subheading(card, 'Serological Markers');
  card.appendChild(radioGroup({
    label: 'Rheumatoid Factor (RF)',
    section: 'laboratoryResults', field: 'rheumatoidFactor',
    options: positiveNegative
  }));
  card.appendChild(radioGroup({
    label: 'Anti-CCP Antibodies',
    section: 'laboratoryResults', field: 'antiCCP',
    options: positiveNegative
  }));
  card.appendChild(radioGroup({
    label: 'ANA',
    section: 'laboratoryResults', field: 'ana',
    options: positiveNegative
  }));
  card.appendChild(radioGroup({
    label: 'HLA-B27',
    section: 'laboratoryResults', field: 'hlaB27',
    options: positiveNegative
  }));

  subheading(card, 'Complete Blood Count');
  const cbc = document.createElement('div');
  cbc.className = 'three-col';
  cbc.appendChild(textInput({
    label: 'Haemoglobin', section: 'laboratoryResults', field: 'haemoglobin',
    type: 'number', min: 0, max: 250, unit: 'g/L'
  }));
  cbc.appendChild(textInput({
    label: 'White Blood Cells', section: 'laboratoryResults', field: 'whiteBloodCellCount',
    type: 'number', min: 0, max: 100, step: 0.1, unit: 'x10^9/L'
  }));
  cbc.appendChild(textInput({
    label: 'Platelets', section: 'laboratoryResults', field: 'plateletCount',
    type: 'number', min: 0, max: 1000, unit: 'x10^9/L'
  }));
  card.appendChild(cbc);

  subheading(card, 'Renal & Liver Function');
  const renal = document.createElement('div');
  renal.className = 'two-col';
  renal.appendChild(textInput({
    label: 'Creatinine', section: 'laboratoryResults', field: 'creatinine',
    type: 'number', min: 0, max: 2000, unit: 'umol/L'
  }));
  renal.appendChild(textInput({
    label: 'eGFR', section: 'laboratoryResults', field: 'egfr',
    type: 'number', min: 0, max: 150, unit: 'mL/min'
  }));
  card.appendChild(renal);

  const liver = document.createElement('div');
  liver.className = 'two-col';
  liver.appendChild(textInput({
    label: 'ALT', section: 'laboratoryResults', field: 'alt',
    type: 'number', min: 0, max: 2000, unit: 'U/L'
  }));
  liver.appendChild(textInput({
    label: 'AST', section: 'laboratoryResults', field: 'ast',
    type: 'number', min: 0, max: 2000, unit: 'U/L'
  }));
  card.appendChild(liver);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Current Medications',
    description: 'All medications currently being taken for rheumatological and other conditions.'
  });

  subheading(card, 'DMARDs (Disease-Modifying Anti-Rheumatic Drugs)');
  card.appendChild(medicationListEditor({
    section: 'currentMedications', field: 'dmards',
    addLabel: 'Add DMARD',
    emptyLabel: 'No DMARDs added.'
  }));

  subheading(card, 'Biologics');
  card.appendChild(medicationListEditor({
    section: 'currentMedications', field: 'biologics',
    addLabel: 'Add biologic',
    emptyLabel: 'No biologics added.'
  }));

  subheading(card, 'NSAIDs');
  card.appendChild(medicationListEditor({
    section: 'currentMedications', field: 'nsaids',
    addLabel: 'Add NSAID',
    emptyLabel: 'No NSAIDs added.'
  }));

  subheading(card, 'Steroids');
  card.appendChild(medicationListEditor({
    section: 'currentMedications', field: 'steroids',
    addLabel: 'Add steroid',
    emptyLabel: 'No steroids added.'
  }));

  subheading(card, 'Pain Medication');
  card.appendChild(medicationListEditor({
    section: 'currentMedications', field: 'painMedication',
    addLabel: 'Add pain medication',
    emptyLabel: 'No pain medication added.'
  }));

  subheading(card, 'Supplements');
  card.appendChild(medicationListEditor({
    section: 'currentMedications', field: 'supplements',
    addLabel: 'Add supplement',
    emptyLabel: 'No supplements added.'
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Allergies',
    description: 'Drug allergies and latex sensitivity.'
  });

  subheading(card, 'Drug Allergies');
  card.appendChild(drugAllergyEditor());

  card.appendChild(radioGroup({
    label: 'Latex Allergy',
    section: 'allergies', field: 'latexAllergy',
    options: yesNo
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Functional Assessment',
    description: 'Functional capacity and disability evaluation.'
  });

  card.appendChild(textInput({
    label: 'HAQ-DI Score',
    section: 'functionalAssessment', field: 'haqDiScore',
    type: 'number', min: 0, max: 3, step: 0.1
  }));
  const haqHint = document.createElement('p');
  haqHint.className = 'muted';
  haqHint.style.marginTop = '-0.75rem';
  haqHint.style.marginBottom = '1rem';
  haqHint.textContent =
    'Health Assessment Questionnaire Disability Index ' +
    '(0 = no disability, 3 = maximum disability).';
  card.appendChild(haqHint);

  const grip = document.createElement('div');
  grip.className = 'two-col';
  grip.appendChild(textInput({
    label: 'Grip Strength Left',
    section: 'functionalAssessment', field: 'gripStrengthLeft',
    type: 'number', min: 0, max: 100, unit: 'kg'
  }));
  grip.appendChild(textInput({
    label: 'Grip Strength Right',
    section: 'functionalAssessment', field: 'gripStrengthRight',
    type: 'number', min: 0, max: 100, unit: 'kg'
  }));
  card.appendChild(grip);

  card.appendChild(selectInput({
    label: 'Walking Ability',
    section: 'functionalAssessment', field: 'walkingAbility',
    options: [
      { value: 'independent', label: 'Independent' },
      { value: 'with-aid', label: 'With Walking Aid' },
      { value: 'wheelchair', label: 'Wheelchair' },
      { value: 'bedbound', label: 'Bedbound' }
    ]
  }));

  card.appendChild(textArea({
    label: 'ADL Limitations',
    section: 'functionalAssessment', field: 'adlLimitations',
    placeholder: 'Describe limitations in activities of daily living…'
  }));

  card.appendChild(radioGroup({
    label: 'Work Disability',
    section: 'functionalAssessment', field: 'workDisability',
    options: yesNo
  }));
  const workDetails = document.createElement('div');
  workDetails.dataset.conditional = 'functionalAssessment.workDisability=yes';
  workDetails.appendChild(textArea({
    label: 'Work Disability Details',
    section: 'functionalAssessment', field: 'workDisabilityDetails',
    placeholder: 'Type of work disability, duration, impact…'
  }));
  card.appendChild(workDetails);

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Comorbidities & Social',
    description: 'Other medical conditions, vaccination status, and lifestyle factors.'
  });

  subheading(card, 'Comorbidities');

  card.appendChild(radioGroup({
    label: 'Cardiovascular Risk',
    section: 'comorbiditiesSocial', field: 'cardiovascularRisk',
    options: yesNo
  }));
  const cvRiskDetails = document.createElement('div');
  cvRiskDetails.dataset.conditional = 'comorbiditiesSocial.cardiovascularRisk=yes';
  cvRiskDetails.appendChild(textArea({
    label: 'Cardiovascular Risk Details',
    section: 'comorbiditiesSocial', field: 'cardiovascularRiskDetails',
    placeholder: 'Hypertension, hyperlipidaemia, etc…'
  }));
  card.appendChild(cvRiskDetails);

  card.appendChild(radioGroup({
    label: 'Osteoporosis',
    section: 'comorbiditiesSocial', field: 'osteoporosis',
    options: yesNo
  }));
  const osteoTreatment = document.createElement('div');
  osteoTreatment.dataset.conditional = 'comorbiditiesSocial.osteoporosis=yes';
  osteoTreatment.appendChild(radioGroup({
    label: 'On Osteoporosis Treatment',
    section: 'comorbiditiesSocial', field: 'osteoporosisOnTreatment',
    options: yesNo
  }));
  card.appendChild(osteoTreatment);

  card.appendChild(radioGroup({
    label: 'Recent Infections',
    section: 'comorbiditiesSocial', field: 'recentInfections',
    options: yesNo
  }));
  const infectDetails = document.createElement('div');
  infectDetails.dataset.conditional = 'comorbiditiesSocial.recentInfections=yes';
  infectDetails.appendChild(textArea({
    label: 'Infection Details',
    section: 'comorbiditiesSocial', field: 'recentInfectionDetails',
    placeholder: 'Type, treatment, resolution…'
  }));
  card.appendChild(infectDetails);

  subheading(card, 'Screening & Vaccination');

  card.appendChild(radioGroup({
    label: 'TB Screening Performed',
    section: 'comorbiditiesSocial', field: 'tuberculosisScreening',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Vaccinations Up To Date',
    section: 'comorbiditiesSocial', field: 'vaccinationStatusUpToDate',
    options: yesNo
  }));
  const vaccDetails = document.createElement('div');
  vaccDetails.dataset.conditional = 'comorbiditiesSocial.vaccinationStatusUpToDate=no';
  vaccDetails.appendChild(textArea({
    label: 'Vaccination Details',
    section: 'comorbiditiesSocial', field: 'vaccinationDetails',
    placeholder: 'Missing vaccinations…'
  }));
  card.appendChild(vaccDetails);

  subheading(card, 'Social History');

  card.appendChild(radioGroup({
    label: 'Smoking Status',
    section: 'comorbiditiesSocial', field: 'smoking',
    options: [
      { value: 'current', label: 'Current Smoker' },
      { value: 'ex', label: 'Ex-Smoker' },
      { value: 'never', label: 'Never Smoked' }
    ]
  }));
  const packDetails = document.createElement('div');
  packDetails.dataset.conditionalAny = 'comorbiditiesSocial.smoking=current,ex';
  packDetails.appendChild(textInput({
    label: 'Pack Years',
    section: 'comorbiditiesSocial', field: 'smokingPackYears',
    type: 'number', min: 0, max: 200
  }));
  card.appendChild(packDetails);

  card.appendChild(selectInput({
    label: 'Exercise Frequency',
    section: 'comorbiditiesSocial', field: 'exerciseFrequency',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional' },
      { value: 'regular', label: 'Regular (2-3x/week)' },
      { value: 'daily', label: 'Daily' }
    ]
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
  document.querySelectorAll('[data-conditional-any]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-any');
    const [path, targetCsv] = expr.split('=');
    const [section, field] = path.split('.');
    const current = String(state[section]?.[field] ?? '');
    const targets = targetCsv.split(',');
    host.style.display = targets.includes(current) ? '' : 'none';
  });
}

function refreshAutoCalculatedReadouts() {
  const bmi = document.getElementById('bmi-readout');
  if (bmi) {
    const v = state.demographics.bmi;
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
  ['demographics', 'weight'],
  ['demographics', 'height'],
  // Chief complaint
  ['chiefComplaint', 'primaryJointComplaint'],
  ['chiefComplaint', 'onsetDate'],
  ['chiefComplaint', 'durationMonths'],
  ['chiefComplaint', 'morningStiffnessDurationMinutes'],
  ['chiefComplaint', 'symmetricInvolvement'],
  // Joint assessment - DAS28 inputs
  ['jointAssessment', 'tenderJointCount28'],
  ['jointAssessment', 'swollenJointCount28'],
  ['jointAssessment', 'painVAS'],
  ['jointAssessment', 'patientGlobalVAS'],
  // Disease history
  ['diseaseHistory', 'primaryDiagnosis'],
  ['diseaseHistory', 'diagnosisDate'],
  ['diseaseHistory', 'diseaseDurationYears'],
  ['diseaseHistory', 'remissionPeriods'],
  // Extra-articular features
  ['extraArticularFeatures', 'rheumatoidNodules'],
  ['extraArticularFeatures', 'skinRash'],
  ['extraArticularFeatures', 'eyeDryness'],
  ['extraArticularFeatures', 'uveitis'],
  ['extraArticularFeatures', 'interstitialLungDisease'],
  ['extraArticularFeatures', 'cardiovascularInvolvement'],
  // Laboratory results
  ['laboratoryResults', 'esr'],
  ['laboratoryResults', 'crp'],
  ['laboratoryResults', 'rheumatoidFactor'],
  ['laboratoryResults', 'antiCCP'],
  ['laboratoryResults', 'ana'],
  ['laboratoryResults', 'hlaB27'],
  // Allergies meta
  ['allergies', 'latexAllergy'],
  // Functional assessment
  ['functionalAssessment', 'haqDiScore'],
  ['functionalAssessment', 'walkingAbility'],
  ['functionalAssessment', 'workDisability'],
  // Comorbidities & social
  ['comorbiditiesSocial', 'cardiovascularRisk'],
  ['comorbiditiesSocial', 'osteoporosis'],
  ['comorbiditiesSocial', 'recentInfections'],
  ['comorbiditiesSocial', 'tuberculosisScreening'],
  ['comorbiditiesSocial', 'vaccinationStatusUpToDate'],
  ['comorbiditiesSocial', 'smoking'],
  ['comorbiditiesSocial', 'exerciseFrequency']
];

function isAnswered(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v !== '';
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    if (isAnswered(state[section][field])) {
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
  { step: 1,  section: 'demographics',            title: 'Demographics' },
  { step: 2,  section: 'chiefComplaint',          title: 'Chief Complaint' },
  { step: 3,  section: 'jointAssessment',         title: 'Joint Assessment' },
  { step: 4,  section: 'diseaseHistory',          title: 'Disease History' },
  { step: 5,  section: 'extraArticularFeatures',  title: 'Extra-articular' },
  { step: 6,  section: 'laboratoryResults',       title: 'Laboratory' },
  { step: 7,  section: 'currentMedications',      title: 'Medications' },
  { step: 8,  section: 'allergies',               title: 'Allergies' },
  { step: 9,  section: 'functionalAssessment',    title: 'Functional' },
  { step: 10, section: 'comorbiditiesSocial',     title: 'Comorbidities & Social' }
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

  const { das28Score, diseaseActivity, firedRules, additionalFlags, timestamp } = lastResult;

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
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No declarative rules fired.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Finding</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const scoreText = das28Score === null
    ? 'Not calculated'
    : das28Score.toFixed(2);
  const activityClass = diseaseActivityClass(diseaseActivity);
  const activityText = diseaseActivityLabel(diseaseActivity);
  const incompleteNote = das28Score === null
    ? `<p class="muted">DAS28 requires Tender Joint Count, Swollen Joint Count, ESR, and Patient Global VAS to be calculated.</p>`
    : '';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Rheumatology Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>DAS28-ESR Score</h3>
      <p class="das28-summary">
        <span class="das28-score-badge ${activityClass}">${esc(scoreText)}</span>
        <span class="activity-level">${esc(activityText)}</span>
      </p>
      ${incompleteNote}
      <p class="muted">
        Boundaries: &lt; 2.6 Remission · &lt; 3.2 Low · &le; 5.1 Moderate · &gt; 5.1 High.
      </p>

      <h3>Fired Findings (${firedRules.length})</h3>
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
  const { das28Score, diseaseActivity, firedRules } = calculateDAS28(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    das28Score,
    diseaseActivity,
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
