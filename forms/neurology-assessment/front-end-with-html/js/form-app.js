import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateNIHSS, nihssSeverityClass, nihssSeverityLabel } from './nihss-grader.js';
import { emptyAssessment, mrsLabel } from './types.js';

// Neurology Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure NIHSS scoring engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'neurology-assessment.front-end-form-with-html.v1';

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
  slug: 'neurology-assessment',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const rep = document.getElementById('report');
    if (rep) rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
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
  refreshAutoCalculatedReadouts();
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
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
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
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const reqAttrs = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"${reqAttrs}
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
 * Build a select / dropdown input. Stores `''` (string) when blank;
 * for numeric fields supply `numeric: true` to convert to number|null.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[],
 *           numeric?: boolean, required?: boolean }} opts
 */
function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const raw = state[opts.section][opts.field];
  const current = raw === null || raw === undefined ? '' : String(raw);
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  const reqAttrs = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    <select id="${id}" name="${id}" class="select"${reqAttrs} aria-describedby="${id}-error">
      ${optionsHtml}
    </select>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => {
    let v = sel.value;
    if (opts.numeric) {
      v = v === '' ? null : Number(v);
    }
    setField(opts.section, opts.field, v);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Build a radio group.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[],
 *           required?: boolean }} opts
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
 * Read-only auto-calculated readout (e.g. mRS label, MMSE category).
 * @param {{ label: string, id: string, render: () => string }} opts
 */
function readOnlyReadout(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field readout';
  wrapper.innerHTML = `
    <label class="label">${esc(opts.label)}</label>
    <div id="${opts.id}" class="readout-value">${opts.render()}</div>
  `;
  return wrapper;
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
    `<span class="section-step">Section ${opts.stepNumber} of 10</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

/** Sub-section heading (used inside multi-area sections). */
function subHeader(text) {
  const h = document.createElement('h3');
  h.className = 'sub-header';
  h.textContent = text;
  return h;
}

// ----------------------------------------------------------------------
// Repeating-list editor: medications {name, dose, frequency}
// ----------------------------------------------------------------------

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
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Levetiracetam">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 500 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. BD, TDS">
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
// Section renderers (1 per step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

// Step 1 — Demographics
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
  measurements.className = 'two-col';
  measurements.appendChild(textInput({
    label: 'Weight', section: 'demographics', field: 'weight',
    type: 'number', min: 1, max: 400, unit: 'kg'
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'demographics', field: 'height',
    type: 'number', min: 50, max: 250, unit: 'cm'
  }));
  card.appendChild(measurements);

  return card;
}

// Step 2 — Chief Complaint
function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Chief Complaint',
    description: 'Primary neurological symptom and presentation.'
  });

  card.appendChild(textArea({
    label: 'Primary neurological symptom',
    section: 'chiefComplaint', field: 'primarySymptom',
    required: true,
    placeholder: 'Describe the main symptom (e.g., weakness, numbness, headache, seizure)'
  }));

  card.appendChild(textInput({
    label: 'Onset date',
    section: 'chiefComplaint', field: 'onsetDate',
    type: 'date'
  }));

  card.appendChild(radioGroup({
    label: 'Onset type',
    section: 'chiefComplaint', field: 'onsetType',
    options: [
      { value: 'sudden', label: 'Sudden' },
      { value: 'gradual', label: 'Gradual' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Duration',
    section: 'chiefComplaint', field: 'duration',
    placeholder: 'e.g., 2 hours, 3 days, ongoing'
  }));

  card.appendChild(radioGroup({
    label: 'Progression',
    section: 'chiefComplaint', field: 'progression',
    options: [
      { value: 'improving', label: 'Improving' },
      { value: 'stable', label: 'Stable' },
      { value: 'worsening', label: 'Worsening' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Associated symptoms',
    section: 'chiefComplaint', field: 'associatedSymptoms',
    placeholder: 'e.g., nausea, vomiting, vision changes, speech difficulty'
  }));

  card.appendChild(textArea({
    label: 'Precipitating event',
    section: 'chiefComplaint', field: 'precipitatingEvent',
    placeholder: 'e.g., trauma, exertion, stress, none'
  }));

  return card;
}

// Step 3 — NIHSS Assessment
function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'NIHSS Assessment',
    description: 'National Institutes of Health Stroke Scale (0-42). Higher scores indicate greater neurological deficit.'
  });

  card.appendChild(selectInput({
    label: '1a. Level of Consciousness',
    section: 'nihssAssessment', field: 'consciousness',
    numeric: true,
    options: [
      { value: '0', label: '0 - Alert' },
      { value: '1', label: '1 - Not alert, arousable' },
      { value: '2', label: '2 - Not alert, requires repeated stimulation' },
      { value: '3', label: '3 - Unresponsive' }
    ]
  }));

  card.appendChild(selectInput({
    label: '1b. LOC Questions (month, age)',
    section: 'nihssAssessment', field: 'consciousnessQuestions',
    numeric: true,
    options: [
      { value: '0', label: '0 - Both correct' },
      { value: '1', label: '1 - One correct' },
      { value: '2', label: '2 - Neither correct' }
    ]
  }));

  card.appendChild(selectInput({
    label: '1c. LOC Commands (open/close eyes, grip/release)',
    section: 'nihssAssessment', field: 'consciousnessCommands',
    numeric: true,
    options: [
      { value: '0', label: '0 - Both correct' },
      { value: '1', label: '1 - One correct' },
      { value: '2', label: '2 - Neither correct' }
    ]
  }));

  card.appendChild(selectInput({
    label: '2. Best Gaze',
    section: 'nihssAssessment', field: 'gaze',
    numeric: true,
    options: [
      { value: '0', label: '0 - Normal' },
      { value: '1', label: '1 - Partial gaze palsy' },
      { value: '2', label: '2 - Forced deviation' }
    ]
  }));

  card.appendChild(selectInput({
    label: '3. Visual Fields',
    section: 'nihssAssessment', field: 'visual',
    numeric: true,
    options: [
      { value: '0', label: '0 - No visual loss' },
      { value: '1', label: '1 - Partial hemianopia' },
      { value: '2', label: '2 - Complete hemianopia' },
      { value: '3', label: '3 - Bilateral hemianopia (blind)' }
    ]
  }));

  card.appendChild(selectInput({
    label: '4. Facial Palsy',
    section: 'nihssAssessment', field: 'facialPalsy',
    numeric: true,
    options: [
      { value: '0', label: '0 - Normal' },
      { value: '1', label: '1 - Minor paralysis' },
      { value: '2', label: '2 - Partial paralysis' },
      { value: '3', label: '3 - Complete paralysis' }
    ]
  }));

  const arms = document.createElement('div');
  arms.className = 'two-col';
  const armOpts = [
    { value: '0', label: '0 - No drift' },
    { value: '1', label: '1 - Drift before 10 seconds' },
    { value: '2', label: '2 - Falls before 10 seconds' },
    { value: '3', label: '3 - No effort against gravity' },
    { value: '4', label: '4 - No movement' }
  ];
  arms.appendChild(selectInput({
    label: '5a. Motor Arm - Left',
    section: 'nihssAssessment', field: 'motorLeftArm',
    numeric: true, options: armOpts
  }));
  arms.appendChild(selectInput({
    label: '5b. Motor Arm - Right',
    section: 'nihssAssessment', field: 'motorRightArm',
    numeric: true, options: armOpts
  }));
  card.appendChild(arms);

  const legs = document.createElement('div');
  legs.className = 'two-col';
  const legOpts = [
    { value: '0', label: '0 - No drift' },
    { value: '1', label: '1 - Drift before 5 seconds' },
    { value: '2', label: '2 - Falls before 5 seconds' },
    { value: '3', label: '3 - No effort against gravity' },
    { value: '4', label: '4 - No movement' }
  ];
  legs.appendChild(selectInput({
    label: '6a. Motor Leg - Left',
    section: 'nihssAssessment', field: 'motorLeftLeg',
    numeric: true, options: legOpts
  }));
  legs.appendChild(selectInput({
    label: '6b. Motor Leg - Right',
    section: 'nihssAssessment', field: 'motorRightLeg',
    numeric: true, options: legOpts
  }));
  card.appendChild(legs);

  card.appendChild(selectInput({
    label: '7. Limb Ataxia',
    section: 'nihssAssessment', field: 'limbAtaxia',
    numeric: true,
    options: [
      { value: '0', label: '0 - Absent' },
      { value: '1', label: '1 - Present in one limb' },
      { value: '2', label: '2 - Present in two limbs' }
    ]
  }));

  card.appendChild(selectInput({
    label: '8. Sensory',
    section: 'nihssAssessment', field: 'sensory',
    numeric: true,
    options: [
      { value: '0', label: '0 - Normal' },
      { value: '1', label: '1 - Mild-to-moderate loss' },
      { value: '2', label: '2 - Severe or total loss' }
    ]
  }));

  card.appendChild(selectInput({
    label: '9. Best Language',
    section: 'nihssAssessment', field: 'language',
    numeric: true,
    options: [
      { value: '0', label: '0 - Normal' },
      { value: '1', label: '1 - Mild-to-moderate aphasia' },
      { value: '2', label: '2 - Severe aphasia' },
      { value: '3', label: '3 - Mute/global aphasia' }
    ]
  }));

  card.appendChild(selectInput({
    label: '10. Dysarthria',
    section: 'nihssAssessment', field: 'dysarthria',
    numeric: true,
    options: [
      { value: '0', label: '0 - Normal' },
      { value: '1', label: '1 - Mild-to-moderate' },
      { value: '2', label: '2 - Severe/unintelligible/mute' }
    ]
  }));

  card.appendChild(selectInput({
    label: '11. Extinction and Inattention',
    section: 'nihssAssessment', field: 'extinctionInattention',
    numeric: true,
    options: [
      { value: '0', label: '0 - No abnormality' },
      { value: '1', label: '1 - Inattention to one modality' },
      { value: '2', label: '2 - Profound neglect in more than one modality' }
    ]
  }));

  return card;
}

// Step 4 — Headache Assessment
function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Headache Assessment',
    description: 'Headache type, frequency, and red flag symptoms.'
  });

  card.appendChild(radioGroup({
    label: 'Do you suffer from headaches?',
    section: 'headacheAssessment', field: 'headachePresent',
    options: yesNo
  }));

  const headacheBody = document.createElement('div');
  headacheBody.dataset.conditional = 'headacheAssessment.headachePresent=yes';

  headacheBody.appendChild(selectInput({
    label: 'Headache type',
    section: 'headacheAssessment', field: 'headacheType',
    options: [
      { value: 'tension', label: 'Tension-type' },
      { value: 'migraine', label: 'Migraine' },
      { value: 'cluster', label: 'Cluster' },
      { value: 'thunderclap', label: 'Thunderclap' },
      { value: 'other', label: 'Other' }
    ]
  }));

  headacheBody.appendChild(selectInput({
    label: 'Frequency',
    section: 'headacheAssessment', field: 'frequency',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'occasional', label: 'Occasional' }
    ]
  }));

  headacheBody.appendChild(textInput({
    label: 'Severity (0-10)',
    section: 'headacheAssessment', field: 'severity',
    type: 'number', min: 0, max: 10
  }));

  headacheBody.appendChild(radioGroup({
    label: 'Do you experience aura?',
    section: 'headacheAssessment', field: 'aura',
    options: yesNo
  }));

  const auraDetails = document.createElement('div');
  auraDetails.dataset.conditional = 'headacheAssessment.aura=yes';
  auraDetails.appendChild(textArea({
    label: 'Describe the aura',
    section: 'headacheAssessment', field: 'auraDescription'
  }));
  headacheBody.appendChild(auraDetails);

  headacheBody.appendChild(textArea({
    label: 'Known triggers',
    section: 'headacheAssessment', field: 'triggers',
    placeholder: 'e.g., stress, light, foods, menstruation'
  }));

  const redFlags = document.createElement('div');
  redFlags.className = 'red-flag-panel';
  redFlags.innerHTML = '<h3>Red Flag Symptoms</h3>';
  redFlags.appendChild(radioGroup({
    label: 'Sudden onset (thunderclap)?',
    section: 'headacheAssessment', field: 'redFlagSuddenOnset',
    options: yesNo
  }));
  redFlags.appendChild(radioGroup({
    label: 'Worst headache of your life?',
    section: 'headacheAssessment', field: 'redFlagWorstEver',
    options: yesNo
  }));
  redFlags.appendChild(radioGroup({
    label: 'Associated fever?',
    section: 'headacheAssessment', field: 'redFlagFever',
    options: yesNo
  }));
  redFlags.appendChild(radioGroup({
    label: 'Neck stiffness?',
    section: 'headacheAssessment', field: 'redFlagNeckStiffness',
    options: yesNo
  }));
  redFlags.appendChild(radioGroup({
    label: 'Focal neurological deficit?',
    section: 'headacheAssessment', field: 'redFlagNeurologicalDeficit',
    options: yesNo
  }));
  headacheBody.appendChild(redFlags);

  card.appendChild(headacheBody);
  return card;
}

// Step 5 — Seizure History
function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Seizure History',
    description: 'Seizure type, frequency, and management.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have a history of seizures?',
    section: 'seizureHistory', field: 'seizureHistory',
    options: yesNo
  }));

  const body = document.createElement('div');
  body.dataset.conditional = 'seizureHistory.seizureHistory=yes';

  body.appendChild(selectInput({
    label: 'Seizure type',
    section: 'seizureHistory', field: 'seizureType',
    options: [
      { value: 'focal', label: 'Focal (partial)' },
      { value: 'generalised-tonic-clonic', label: 'Generalised tonic-clonic' },
      { value: 'absence', label: 'Absence' },
      { value: 'myoclonic', label: 'Myoclonic' },
      { value: 'other', label: 'Other' }
    ]
  }));

  body.appendChild(textInput({
    label: 'Frequency',
    section: 'seizureHistory', field: 'frequency',
    placeholder: 'e.g., 2 per month, 1 per year'
  }));

  body.appendChild(textInput({
    label: 'Date of last seizure',
    section: 'seizureHistory', field: 'lastSeizureDate',
    type: 'date'
  }));

  body.appendChild(textArea({
    label: 'Known triggers',
    section: 'seizureHistory', field: 'triggers',
    placeholder: 'e.g., sleep deprivation, alcohol, flashing lights'
  }));

  body.appendChild(radioGroup({
    label: 'Do you experience an aura before seizures?',
    section: 'seizureHistory', field: 'aura',
    options: yesNo
  }));

  const auraDetails = document.createElement('div');
  auraDetails.dataset.conditional = 'seizureHistory.aura=yes';
  auraDetails.appendChild(textArea({
    label: 'Describe the aura',
    section: 'seizureHistory', field: 'auraDescription'
  }));
  body.appendChild(auraDetails);

  body.appendChild(textArea({
    label: 'Post-ictal state',
    section: 'seizureHistory', field: 'postIctalState',
    placeholder: 'e.g., confusion, drowsiness, duration'
  }));

  body.appendChild(radioGroup({
    label: 'History of status epilepticus?',
    section: 'seizureHistory', field: 'statusEpilepticus',
    options: yesNo
  }));

  card.appendChild(body);
  return card;
}

// Step 6 — Motor & Sensory Examination
function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Motor & Sensory Examination',
    description: 'Strength, tone, reflexes, sensation, coordination, and gait.'
  });

  const strengthOpts = [
    { value: '0', label: '0 - No contraction' },
    { value: '1', label: '1 - Flicker/trace' },
    { value: '2', label: '2 - Active movement, gravity eliminated' },
    { value: '3', label: '3 - Active movement against gravity' },
    { value: '4', label: '4 - Active movement against resistance' },
    { value: '5', label: '5 - Normal strength' }
  ];

  card.appendChild(subHeader('Muscle Strength (MRC Scale)'));
  const strengthGrid = document.createElement('div');
  strengthGrid.className = 'two-col';
  strengthGrid.appendChild(selectInput({
    label: 'Upper limb - Left',
    section: 'motorSensoryExam', field: 'strengthUpperLeft',
    options: strengthOpts
  }));
  strengthGrid.appendChild(selectInput({
    label: 'Upper limb - Right',
    section: 'motorSensoryExam', field: 'strengthUpperRight',
    options: strengthOpts
  }));
  strengthGrid.appendChild(selectInput({
    label: 'Lower limb - Left',
    section: 'motorSensoryExam', field: 'strengthLowerLeft',
    options: strengthOpts
  }));
  strengthGrid.appendChild(selectInput({
    label: 'Lower limb - Right',
    section: 'motorSensoryExam', field: 'strengthLowerRight',
    options: strengthOpts
  }));
  card.appendChild(strengthGrid);

  card.appendChild(selectInput({
    label: 'Tone',
    section: 'motorSensoryExam', field: 'tone',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'increased', label: 'Increased (spasticity/rigidity)' },
      { value: 'decreased', label: 'Decreased (flaccid)' },
      { value: 'rigid', label: 'Rigid (lead-pipe/cogwheel)' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Reflexes',
    section: 'motorSensoryExam', field: 'reflexes',
    options: [
      { value: '0', label: '0 - Absent' },
      { value: '1', label: '1 - Diminished' },
      { value: '2', label: '2 - Normal' },
      { value: '3', label: '3 - Brisk' },
      { value: '4', label: '4 - Clonus' }
    ]
  }));

  const plantarOpts = [
    { value: 'flexor', label: 'Flexor (normal)' },
    { value: 'extensor', label: 'Extensor (Babinski positive)' }
  ];
  const plantarGrid = document.createElement('div');
  plantarGrid.className = 'two-col';
  plantarGrid.appendChild(selectInput({
    label: 'Plantar response - Left',
    section: 'motorSensoryExam', field: 'plantarResponseLeft',
    options: plantarOpts
  }));
  plantarGrid.appendChild(selectInput({
    label: 'Plantar response - Right',
    section: 'motorSensoryExam', field: 'plantarResponseRight',
    options: plantarOpts
  }));
  card.appendChild(plantarGrid);

  card.appendChild(selectInput({
    label: 'Sensation',
    section: 'motorSensoryExam', field: 'sensation',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'decreased', label: 'Decreased' },
      { value: 'absent', label: 'Absent' },
      { value: 'paraesthesia', label: 'Paraesthesia (tingling/pins and needles)' }
    ]
  }));

  const sensationDetails = document.createElement('div');
  sensationDetails.dataset.conditionalAny = 'motorSensoryExam.sensation=decreased,absent,paraesthesia';
  sensationDetails.appendChild(textArea({
    label: 'Sensory details (distribution)',
    section: 'motorSensoryExam', field: 'sensationDetails'
  }));
  card.appendChild(sensationDetails);

  card.appendChild(radioGroup({
    label: 'Coordination normal?',
    section: 'motorSensoryExam', field: 'coordination',
    options: yesNo
  }));

  const coordDetails = document.createElement('div');
  coordDetails.dataset.conditional = 'motorSensoryExam.coordination=no';
  coordDetails.appendChild(textArea({
    label: 'Coordination details',
    section: 'motorSensoryExam', field: 'coordinationDetails',
    placeholder: 'e.g., finger-nose, heel-shin abnormalities'
  }));
  card.appendChild(coordDetails);

  card.appendChild(selectInput({
    label: 'Gait',
    section: 'motorSensoryExam', field: 'gait',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'ataxic', label: 'Ataxic (unsteady/broad-based)' },
      { value: 'spastic', label: 'Spastic (stiff/scissoring)' },
      { value: 'steppage', label: 'Steppage (high-stepping/foot drop)' },
      { value: 'antalgic', label: 'Antalgic (limping)' },
      { value: 'unable', label: 'Unable to walk' }
    ]
  }));

  return card;
}

// Step 7 — Cognitive Assessment
function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Cognitive Assessment',
    description: 'Orientation, attention, memory, language, and executive function.'
  });

  card.appendChild(selectInput({
    label: 'Orientation',
    section: 'cognitiveAssessment', field: 'orientation',
    options: [
      { value: 'fully-oriented', label: 'Fully oriented (person, place, time)' },
      { value: 'partially-oriented', label: 'Partially oriented' },
      { value: 'disoriented', label: 'Disoriented' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Attention normal?',
    section: 'cognitiveAssessment', field: 'attentionNormal',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Short-term memory intact?',
    section: 'cognitiveAssessment', field: 'memoryShortTerm',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Long-term memory intact?',
    section: 'cognitiveAssessment', field: 'memoryLongTerm',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Language function normal?',
    section: 'cognitiveAssessment', field: 'languageNormal',
    options: yesNo
  }));

  const langDetails = document.createElement('div');
  langDetails.dataset.conditional = 'cognitiveAssessment.languageNormal=no';
  langDetails.appendChild(textArea({
    label: 'Language deficit details',
    section: 'cognitiveAssessment', field: 'languageDetails',
    placeholder: 'e.g., word-finding difficulty, comprehension issues, fluency'
  }));
  card.appendChild(langDetails);

  card.appendChild(radioGroup({
    label: 'Visuospatial function normal?',
    section: 'cognitiveAssessment', field: 'visuospatialNormal',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Executive function normal?',
    section: 'cognitiveAssessment', field: 'executiveFunctionNormal',
    options: yesNo
  }));

  card.appendChild(textInput({
    label: 'MMSE Score (if performed)',
    section: 'cognitiveAssessment', field: 'mmseScore',
    type: 'number', min: 0, max: 30
  }));
  card.appendChild(readOnlyReadout({
    label: 'MMSE interpretation',
    id: 'mmse-readout',
    render: () => mmseInterpretationHtml(state.cognitiveAssessment.mmseScore)
  }));

  return card;
}

function mmseInterpretationHtml(score) {
  if (score === null || score === undefined || score === '') {
    return '<span class="muted">Auto-calculated</span>';
  }
  const s = Number(score);
  let label;
  if (s >= 27) label = 'Normal cognitive function';
  else if (s >= 24) label = 'Mild cognitive impairment';
  else if (s >= 18) label = 'Mild dementia';
  else if (s >= 10) label = 'Moderate dementia';
  else label = 'Severe dementia';
  return `<strong>${s}/30</strong> <span class="muted">(${esc(label)})</span>`;
}

// Step 8 — Current Medications
function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Current Medications',
    description: 'Neurological and other relevant medications.'
  });

  const medHeader = document.createElement('div');
  medHeader.className = 'list-section-header';
  medHeader.innerHTML = '<h3>Medication list</h3>';
  card.appendChild(medHeader);
  card.appendChild(medicationListEditor());

  card.appendChild(radioGroup({
    label: 'Taking anticonvulsants?',
    section: 'currentMedications', field: 'anticonvulsants',
    options: yesNo
  }));
  const acDetails = document.createElement('div');
  acDetails.dataset.conditional = 'currentMedications.anticonvulsants=yes';
  acDetails.appendChild(textArea({
    label: 'Anticonvulsant details',
    section: 'currentMedications', field: 'anticonvulsantDetails',
    placeholder: 'e.g., levetiracetam 500mg BD, carbamazepine 200mg TDS'
  }));
  card.appendChild(acDetails);

  card.appendChild(radioGroup({
    label: 'Taking migraine prophylaxis?',
    section: 'currentMedications', field: 'migraineProphylaxis',
    options: yesNo
  }));
  const mpDetails = document.createElement('div');
  mpDetails.dataset.conditional = 'currentMedications.migraineProphylaxis=yes';
  mpDetails.appendChild(textArea({
    label: 'Migraine prophylaxis details',
    section: 'currentMedications', field: 'migraineProphylaxisDetails',
    placeholder: 'e.g., propranolol, topiramate, amitriptyline'
  }));
  card.appendChild(mpDetails);

  card.appendChild(radioGroup({
    label: 'Taking neuropathic pain medication?',
    section: 'currentMedications', field: 'neuropathicPainMeds',
    options: yesNo
  }));
  const npDetails = document.createElement('div');
  npDetails.dataset.conditional = 'currentMedications.neuropathicPainMeds=yes';
  npDetails.appendChild(textArea({
    label: 'Neuropathic pain medication details',
    section: 'currentMedications', field: 'neuropathicPainDetails',
    placeholder: 'e.g., gabapentin, pregabalin, duloxetine'
  }));
  card.appendChild(npDetails);

  card.appendChild(radioGroup({
    label: 'Taking anticoagulants?',
    section: 'currentMedications', field: 'anticoagulants',
    options: yesNo
  }));
  const anticoagDetails = document.createElement('div');
  anticoagDetails.dataset.conditional = 'currentMedications.anticoagulants=yes';
  anticoagDetails.appendChild(textArea({
    label: 'Anticoagulant details',
    section: 'currentMedications', field: 'anticoagulantDetails',
    placeholder: 'e.g., warfarin, apixaban, rivaroxaban - include INR if applicable'
  }));
  card.appendChild(anticoagDetails);

  return card;
}

// Step 9 — Diagnostic Results
function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Diagnostic Results',
    description: 'Imaging, EEG, EMG/NCS, and lumbar puncture findings.'
  });

  card.appendChild(radioGroup({
    label: 'Has MRI/CT brain been performed?',
    section: 'diagnosticResults', field: 'mriCtPerformed',
    options: yesNo
  }));
  const mri = document.createElement('div');
  mri.dataset.conditional = 'diagnosticResults.mriCtPerformed=yes';
  mri.appendChild(selectInput({
    label: 'MRI/CT finding',
    section: 'diagnosticResults', field: 'mriCtFinding',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'infarct', label: 'Infarct' },
      { value: 'haemorrhage', label: 'Haemorrhage' },
      { value: 'mass', label: 'Mass/tumour' },
      { value: 'demyelination', label: 'Demyelination' },
      { value: 'atrophy', label: 'Atrophy' },
      { value: 'other', label: 'Other' }
    ]
  }));
  mri.appendChild(textArea({
    label: 'Imaging details',
    section: 'diagnosticResults', field: 'mriCtDetails',
    placeholder: 'Location, size, and clinical correlation'
  }));
  card.appendChild(mri);

  card.appendChild(radioGroup({
    label: 'Has EEG been performed?',
    section: 'diagnosticResults', field: 'eegPerformed',
    options: yesNo
  }));
  const eeg = document.createElement('div');
  eeg.dataset.conditional = 'diagnosticResults.eegPerformed=yes';
  eeg.appendChild(selectInput({
    label: 'EEG finding',
    section: 'diagnosticResults', field: 'eegFinding',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'epileptiform', label: 'Epileptiform discharges' },
      { value: 'slow-wave', label: 'Generalised slowing' },
      { value: 'focal-abnormality', label: 'Focal abnormality' },
      { value: 'other', label: 'Other' }
    ]
  }));
  eeg.appendChild(textArea({
    label: 'EEG details',
    section: 'diagnosticResults', field: 'eegDetails'
  }));
  card.appendChild(eeg);

  card.appendChild(radioGroup({
    label: 'Has EMG/nerve conduction study been performed?',
    section: 'diagnosticResults', field: 'emgNcsPerformed',
    options: yesNo
  }));
  const emg = document.createElement('div');
  emg.dataset.conditional = 'diagnosticResults.emgNcsPerformed=yes';
  emg.appendChild(textArea({
    label: 'EMG/NCS findings',
    section: 'diagnosticResults', field: 'emgNcsDetails',
    placeholder: 'e.g., demyelinating neuropathy, axonal loss, myopathic changes'
  }));
  card.appendChild(emg);

  card.appendChild(radioGroup({
    label: 'Has lumbar puncture been performed?',
    section: 'diagnosticResults', field: 'lumbarPuncturePerformed',
    options: yesNo
  }));
  const lp = document.createElement('div');
  lp.dataset.conditional = 'diagnosticResults.lumbarPuncturePerformed=yes';
  lp.appendChild(textArea({
    label: 'Lumbar puncture findings',
    section: 'diagnosticResults', field: 'lumbarPunctureDetails',
    placeholder: 'e.g., opening pressure, CSF analysis, oligoclonal bands'
  }));
  card.appendChild(lp);

  return card;
}

// Step 10 — Functional & Social
function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Functional & Social Assessment',
    description: 'Disability, driving, employment, and support needs.'
  });

  card.appendChild(selectInput({
    label: 'Modified Rankin Scale (mRS)',
    section: 'functionalSocial', field: 'mrsScore',
    numeric: true,
    options: [
      { value: '0', label: '0 - No symptoms' },
      { value: '1', label: '1 - No significant disability' },
      { value: '2', label: '2 - Slight disability' },
      { value: '3', label: '3 - Moderate disability (walks without assistance)' },
      { value: '4', label: '4 - Moderately severe disability (unable to walk unaided)' },
      { value: '5', label: '5 - Severe disability (bedridden, incontinent)' }
    ]
  }));
  card.appendChild(readOnlyReadout({
    label: 'mRS interpretation',
    id: 'mrs-readout',
    render: () => {
      const score = state.functionalSocial.mrsScore;
      if (score === null || score === undefined || score === '') {
        return '<span class="muted">Auto-calculated</span>';
      }
      return `<strong>${esc(mrsLabel(score))}</strong>`;
    }
  }));

  card.appendChild(selectInput({
    label: 'Driving status',
    section: 'functionalSocial', field: 'drivingStatus',
    options: [
      { value: 'driving', label: 'Currently driving' },
      { value: 'not-driving-medical', label: 'Not driving - medical reasons' },
      { value: 'not-driving-other', label: 'Not driving - other reasons' },
      { value: 'not-applicable', label: 'Not applicable' }
    ]
  }));

  const driveDetails = document.createElement('div');
  driveDetails.dataset.conditional = 'functionalSocial.drivingStatus=not-driving-medical';
  driveDetails.appendChild(textArea({
    label: 'Driving restriction details',
    section: 'functionalSocial', field: 'drivingRestrictionDetails',
    placeholder: 'e.g., seizure within last 12 months, DVLA notification'
  }));
  card.appendChild(driveDetails);

  card.appendChild(selectInput({
    label: 'Employment status',
    section: 'functionalSocial', field: 'employmentStatus',
    options: [
      { value: 'employed', label: 'Employed' },
      { value: 'unemployed', label: 'Unemployed' },
      { value: 'retired', label: 'Retired' },
      { value: 'disability', label: 'On disability' },
      { value: 'student', label: 'Student' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Impact on employment/daily activities',
    section: 'functionalSocial', field: 'employmentImpact',
    placeholder: 'How has the neurological condition affected work or daily life?'
  }));

  card.appendChild(textArea({
    label: 'Support needs',
    section: 'functionalSocial', field: 'supportNeeds',
    placeholder: 'e.g., physiotherapy, occupational therapy, speech therapy, social care'
  }));

  card.appendChild(selectInput({
    label: 'Living situation',
    section: 'functionalSocial', field: 'livingSituation',
    options: [
      { value: 'independent', label: 'Independent' },
      { value: 'with-family', label: 'With family/carer' },
      { value: 'assisted-living', label: 'Assisted living' },
      { value: 'nursing-home', label: 'Nursing home' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Is a care plan required?',
    section: 'functionalSocial', field: 'carePlanRequired',
    options: yesNo
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
  const mmse = document.getElementById('mmse-readout');
  if (mmse) mmse.innerHTML = mmseInterpretationHtml(state.cognitiveAssessment.mmseScore);

  const mrs = document.getElementById('mrs-readout');
  if (mrs) {
    const score = state.functionalSocial.mrsScore;
    mrs.innerHTML = (score === null || score === undefined || score === '')
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${esc(mrsLabel(score))}</strong>`;
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
  ['chiefComplaint', 'primarySymptom'],
  ['chiefComplaint', 'onsetDate'],
  ['chiefComplaint', 'onsetType'],
  ['chiefComplaint', 'duration'],
  ['chiefComplaint', 'progression'],
  // NIHSS — 15 items
  ['nihssAssessment', 'consciousness'],
  ['nihssAssessment', 'consciousnessQuestions'],
  ['nihssAssessment', 'consciousnessCommands'],
  ['nihssAssessment', 'gaze'],
  ['nihssAssessment', 'visual'],
  ['nihssAssessment', 'facialPalsy'],
  ['nihssAssessment', 'motorLeftArm'],
  ['nihssAssessment', 'motorRightArm'],
  ['nihssAssessment', 'motorLeftLeg'],
  ['nihssAssessment', 'motorRightLeg'],
  ['nihssAssessment', 'limbAtaxia'],
  ['nihssAssessment', 'sensory'],
  ['nihssAssessment', 'language'],
  ['nihssAssessment', 'dysarthria'],
  ['nihssAssessment', 'extinctionInattention'],
  // Headache (top-level + red flags)
  ['headacheAssessment', 'headachePresent'],
  ['headacheAssessment', 'redFlagSuddenOnset'],
  ['headacheAssessment', 'redFlagWorstEver'],
  ['headacheAssessment', 'redFlagFever'],
  ['headacheAssessment', 'redFlagNeckStiffness'],
  ['headacheAssessment', 'redFlagNeurologicalDeficit'],
  // Seizure
  ['seizureHistory', 'seizureHistory'],
  ['seizureHistory', 'statusEpilepticus'],
  // Motor & sensory exam (core)
  ['motorSensoryExam', 'strengthUpperLeft'],
  ['motorSensoryExam', 'strengthUpperRight'],
  ['motorSensoryExam', 'strengthLowerLeft'],
  ['motorSensoryExam', 'strengthLowerRight'],
  ['motorSensoryExam', 'tone'],
  ['motorSensoryExam', 'reflexes'],
  ['motorSensoryExam', 'sensation'],
  ['motorSensoryExam', 'coordination'],
  ['motorSensoryExam', 'gait'],
  // Cognitive
  ['cognitiveAssessment', 'orientation'],
  ['cognitiveAssessment', 'attentionNormal'],
  ['cognitiveAssessment', 'memoryShortTerm'],
  ['cognitiveAssessment', 'memoryLongTerm'],
  ['cognitiveAssessment', 'languageNormal'],
  ['cognitiveAssessment', 'visuospatialNormal'],
  ['cognitiveAssessment', 'executiveFunctionNormal'],
  // Medications
  ['currentMedications', 'anticonvulsants'],
  ['currentMedications', 'migraineProphylaxis'],
  ['currentMedications', 'neuropathicPainMeds'],
  ['currentMedications', 'anticoagulants'],
  // Diagnostics
  ['diagnosticResults', 'mriCtPerformed'],
  ['diagnosticResults', 'eegPerformed'],
  ['diagnosticResults', 'emgNcsPerformed'],
  ['diagnosticResults', 'lumbarPuncturePerformed'],
  // Functional & social
  ['functionalSocial', 'mrsScore'],
  ['functionalSocial', 'drivingStatus'],
  ['functionalSocial', 'employmentStatus'],
  ['functionalSocial', 'livingSituation'],
  ['functionalSocial', 'carePlanRequired']
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
  { step: 3,  section: 'nihssAssessment',      title: 'NIHSS Assessment' },
  { step: 4,  section: 'headacheAssessment',   title: 'Headache' },
  { step: 5,  section: 'seizureHistory',       title: 'Seizure History' },
  { step: 6,  section: 'motorSensoryExam',     title: 'Motor & Sensory' },
  { step: 7,  section: 'cognitiveAssessment',  title: 'Cognitive' },
  { step: 8,  section: 'currentMedications',   title: 'Medications' },
  { step: 9,  section: 'diagnosticResults',    title: 'Diagnostics' },
  { step: 10, section: 'functionalSocial',     title: 'Functional & Social' }
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
    } else if (input.tagName === 'LABEL') {
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { nihssScore, nihssSeverity, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td class="num">${r.score}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No NIHSS items scored above zero.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Item</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <h2>Neurology Assessment Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>NIHSS Total Score</h3>
    <p class="nihss-summary">
      <span class="nihss-score-badge ${nihssSeverityClass(nihssScore)}">${nihssScore} / 42</span>
      <span class="severity-label">${esc(nihssSeverity)}</span>
    </p>

    <h3>Items scoring above zero</h3>
    ${firedTable}

    <h3>Flagged Issues</h3>
    ${flagsList}

    <div class="report-actions">
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
}

function submitForm() {
  const errs = validateForm();
  if (errs.length > 0) return;
  const { nihssScore, nihssSeverity, firedRules } = calculateNIHSS(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    nihssScore,
    nihssSeverity,
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
  const rep = document.getElementById('report');
  if (rep) rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
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
