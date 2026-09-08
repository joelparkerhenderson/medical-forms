import { calculateECOG } from './ecog-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { bmiCategory, calculateBMI, ecogGradeClass, ecogGradeLabel, emptyAssessment, karnofskyToECOG } from './types.js';

// Oncology Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page
// in document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure ECOG grading engine plus flagged-issue detection and
// renders an inline report. State is persisted to localStorage so a
// partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'oncology-assessment.front-end-form-with-html.v1';

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
  slug: 'oncology-assessment',
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
    ${opts.hint ? `<p class="hint">${esc(opts.hint)}</p>` : ''}
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
 * Build a select / dropdown input. Options may be a flat array of
 * `{value, label}` or a nested array of `{group, options}` for optgroups.
 *
 * @param {{ label: string, section: string, field: string,
 *           options: ({value: string, label: string}[] |
 *                     {group: string, options: {value: string, label: string}[]}[]),
 *           required?: boolean }} opts
 */
function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  /** @param {{value: string, label: string}[]} opts */
  function renderOpts(arr) {
    return arr
      .map(
        (o) =>
          `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
      )
      .join('');
  }

  let optionsHtml = `<option value="">— Select —</option>`;
  if (opts.options.length && opts.options[0].group) {
    optionsHtml += opts.options
      .map(
        (g) =>
          `<optgroup label="${esc(g.group)}">${renderOpts(g.options)}</optgroup>`
      )
      .join('');
  } else {
    optionsHtml += renderOpts(opts.options);
  }

  const reqAttrs = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    <select id="${id}" name="${id}" class="select"${reqAttrs} aria-describedby="${id}-error">
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
  legend.innerHTML =
    esc(opts.label) +
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
    `<span class="section-step">Section ${opts.stepNumber} of 10</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

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
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Cisplatin">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 75 mg/m²">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. q3w">
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
// Shared option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const severityOptions = [
  { value: 'none', label: 'None' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' }
];

const ctcaeOptions = [
  { value: '0', label: 'Grade 0 - None' },
  { value: '1', label: 'Grade 1 - Mild' },
  { value: '2', label: 'Grade 2 - Moderate' },
  { value: '3', label: 'Grade 3 - Severe' },
  { value: '4', label: 'Grade 4 - Life-threatening' }
];

const histologyGroups = [
  { group: 'Carcinoma — Adenocarcinoma', options: [
    { value: 'adenocarcinoma', label: 'Adenocarcinoma' },
    { value: 'invasive-ductal-carcinoma', label: 'Invasive ductal carcinoma' },
    { value: 'invasive-lobular-carcinoma', label: 'Invasive lobular carcinoma' },
    { value: 'mucinous-adenocarcinoma', label: 'Mucinous adenocarcinoma' },
    { value: 'papillary-adenocarcinoma', label: 'Papillary adenocarcinoma' },
    { value: 'signet-ring-cell-carcinoma', label: 'Signet ring cell carcinoma' },
    { value: 'clear-cell-carcinoma', label: 'Clear cell carcinoma' },
    { value: 'cholangiocarcinoma', label: 'Cholangiocarcinoma' }
  ]},
  { group: 'Carcinoma — Squamous & Transitional', options: [
    { value: 'squamous-cell-carcinoma', label: 'Squamous cell carcinoma' },
    { value: 'basal-cell-carcinoma', label: 'Basal cell carcinoma' },
    { value: 'transitional-cell-carcinoma', label: 'Transitional cell (urothelial) carcinoma' },
    { value: 'nasopharyngeal-carcinoma', label: 'Nasopharyngeal carcinoma' }
  ]},
  { group: 'Carcinoma — Small Cell & Neuroendocrine', options: [
    { value: 'small-cell-carcinoma', label: 'Small cell carcinoma' },
    { value: 'large-cell-carcinoma', label: 'Large cell carcinoma' },
    { value: 'large-cell-neuroendocrine-carcinoma', label: 'Large cell neuroendocrine carcinoma' },
    { value: 'neuroendocrine-tumour', label: 'Neuroendocrine tumour' },
    { value: 'carcinoid-tumour', label: 'Carcinoid tumour' },
    { value: 'merkel-cell-carcinoma', label: 'Merkel cell carcinoma' }
  ]},
  { group: 'Carcinoma — Renal & Hepatic', options: [
    { value: 'renal-cell-carcinoma', label: 'Renal cell carcinoma' },
    { value: 'hepatocellular-carcinoma', label: 'Hepatocellular carcinoma' }
  ]},
  { group: 'Carcinoma — Other', options: [
    { value: 'serous-carcinoma', label: 'Serous carcinoma' },
    { value: 'endometrioid-carcinoma', label: 'Endometrioid carcinoma' },
    { value: 'medullary-carcinoma', label: 'Medullary carcinoma' },
    { value: 'anaplastic-carcinoma', label: 'Anaplastic carcinoma' },
    { value: 'undifferentiated-carcinoma', label: 'Undifferentiated carcinoma' }
  ]},
  { group: 'Sarcoma', options: [
    { value: 'osteosarcoma', label: 'Osteosarcoma' },
    { value: 'chondrosarcoma', label: 'Chondrosarcoma' },
    { value: 'leiomyosarcoma', label: 'Leiomyosarcoma' },
    { value: 'rhabdomyosarcoma', label: 'Rhabdomyosarcoma' },
    { value: 'liposarcoma', label: 'Liposarcoma' },
    { value: 'fibrosarcoma', label: 'Fibrosarcoma' },
    { value: 'angiosarcoma', label: 'Angiosarcoma' },
    { value: 'ewing-sarcoma', label: 'Ewing sarcoma' },
    { value: 'gastrointestinal-stromal-tumour', label: 'Gastrointestinal stromal tumour (GIST)' },
    { value: 'kaposi-sarcoma', label: 'Kaposi sarcoma' }
  ]},
  { group: 'Lymphoma', options: [
    { value: 'hodgkin-lymphoma', label: 'Hodgkin lymphoma' },
    { value: 'diffuse-large-b-cell-lymphoma', label: 'Diffuse large B-cell lymphoma' },
    { value: 'follicular-lymphoma', label: 'Follicular lymphoma' },
    { value: 'mantle-cell-lymphoma', label: 'Mantle cell lymphoma' },
    { value: 'marginal-zone-lymphoma', label: 'Marginal zone lymphoma' },
    { value: 'burkitt-lymphoma', label: 'Burkitt lymphoma' },
    { value: 't-cell-lymphoma', label: 'T-cell lymphoma' }
  ]},
  { group: 'Leukaemia & Myeloma', options: [
    { value: 'acute-myeloid-leukaemia', label: 'Acute myeloid leukaemia (AML)' },
    { value: 'acute-lymphoblastic-leukaemia', label: 'Acute lymphoblastic leukaemia (ALL)' },
    { value: 'chronic-lymphocytic-leukaemia', label: 'Chronic lymphocytic leukaemia (CLL)' },
    { value: 'chronic-myeloid-leukaemia', label: 'Chronic myeloid leukaemia (CML)' },
    { value: 'multiple-myeloma', label: 'Multiple myeloma' },
    { value: 'myelodysplastic-syndrome', label: 'Myelodysplastic syndrome' }
  ]},
  { group: 'Melanoma', options: [
    { value: 'superficial-spreading-melanoma', label: 'Superficial spreading melanoma' },
    { value: 'nodular-melanoma', label: 'Nodular melanoma' },
    { value: 'lentigo-maligna-melanoma', label: 'Lentigo maligna melanoma' },
    { value: 'acral-lentiginous-melanoma', label: 'Acral lentiginous melanoma' },
    { value: 'uveal-melanoma', label: 'Uveal melanoma' },
    { value: 'mucosal-melanoma', label: 'Mucosal melanoma' }
  ]},
  { group: 'CNS Tumours', options: [
    { value: 'glioblastoma', label: 'Glioblastoma (GBM)' },
    { value: 'astrocytoma', label: 'Astrocytoma' },
    { value: 'oligodendroglioma', label: 'Oligodendroglioma' },
    { value: 'meningioma', label: 'Meningioma' },
    { value: 'medulloblastoma', label: 'Medulloblastoma' },
    { value: 'ependymoma', label: 'Ependymoma' }
  ]},
  { group: 'Germ Cell Tumours', options: [
    { value: 'seminoma', label: 'Seminoma' },
    { value: 'non-seminomatous-germ-cell', label: 'Non-seminomatous germ cell tumour' },
    { value: 'teratoma', label: 'Teratoma' },
    { value: 'choriocarcinoma', label: 'Choriocarcinoma' },
    { value: 'yolk-sac-tumour', label: 'Yolk sac tumour' }
  ]},
  { group: 'Other', options: [
    { value: 'mesothelioma', label: 'Mesothelioma' },
    { value: 'thymoma', label: 'Thymoma' },
    { value: 'phaeochromocytoma', label: 'Phaeochromocytoma' },
    { value: 'other', label: 'Other' }
  ]}
];

// ----------------------------------------------------------------------
// Section renderers (1 per ECOG step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic patient information and performance status.'
  });

  const names = document.createElement('div');
  names.className = 'two-col';
  names.appendChild(textInput({ label: 'First Name', section: 'demographics', field: 'firstName', required: true }));
  names.appendChild(textInput({ label: 'Last Name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(names);

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

  card.appendChild(selectInput({
    label: 'ECOG Performance Status',
    section: 'demographics',
    field: 'ecogPerformanceStatus',
    required: true,
    options: [
      { value: '0', label: '0 - Fully active, no restrictions' },
      { value: '1', label: '1 - Restricted in strenuous activity' },
      { value: '2', label: '2 - Ambulatory, capable of self-care, up >50% of waking hours' },
      { value: '3', label: '3 - Limited self-care, confined to bed/chair >50%' },
      { value: '4', label: '4 - Completely disabled' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Cancer Diagnosis',
    description: 'Cancer type, staging, and diagnosis details.'
  });

  card.appendChild(selectInput({
    label: 'Cancer Type',
    section: 'cancerDiagnosis',
    field: 'cancerType',
    required: true,
    options: [
      { value: 'breast', label: 'Breast' },
      { value: 'lung', label: 'Lung' },
      { value: 'colorectal', label: 'Colorectal' },
      { value: 'prostate', label: 'Prostate' },
      { value: 'melanoma', label: 'Melanoma' },
      { value: 'lymphoma', label: 'Lymphoma' },
      { value: 'leukaemia', label: 'Leukaemia' },
      { value: 'pancreatic', label: 'Pancreatic' },
      { value: 'ovarian', label: 'Ovarian' },
      { value: 'bladder', label: 'Bladder' },
      { value: 'renal', label: 'Renal' },
      { value: 'hepatocellular', label: 'Hepatocellular' },
      { value: 'gastric', label: 'Gastric' },
      { value: 'oesophageal', label: 'Oesophageal' },
      { value: 'head-and-neck', label: 'Head and Neck' },
      { value: 'brain', label: 'Brain' },
      { value: 'sarcoma', label: 'Sarcoma' },
      { value: 'thyroid', label: 'Thyroid' },
      { value: 'cervical', label: 'Cervical' },
      { value: 'endometrial', label: 'Endometrial' },
      { value: 'other', label: 'Other' }
    ]
  }));

  const cancerOther = document.createElement('div');
  cancerOther.dataset.conditional = 'cancerDiagnosis.cancerType=other';
  cancerOther.appendChild(textInput({
    label: 'Specify Cancer Type',
    section: 'cancerDiagnosis',
    field: 'cancerTypeOther'
  }));
  card.appendChild(cancerOther);

  card.appendChild(textInput({
    label: 'Primary Site',
    section: 'cancerDiagnosis',
    field: 'primarySite',
    placeholder: 'e.g., Left breast, Right upper lobe'
  }));

  card.appendChild(selectInput({
    label: 'Histology',
    section: 'cancerDiagnosis',
    field: 'histology',
    options: histologyGroups
  }));

  const histOther = document.createElement('div');
  histOther.dataset.conditional = 'cancerDiagnosis.histology=other';
  histOther.appendChild(textInput({
    label: 'Specify Histology',
    section: 'cancerDiagnosis',
    field: 'histologyOther'
  }));
  card.appendChild(histOther);

  const tnmHeader = document.createElement('h3');
  tnmHeader.className = 'group-heading';
  tnmHeader.textContent = 'TNM Staging';
  card.appendChild(tnmHeader);

  const tnm = document.createElement('div');
  tnm.className = 'three-col';
  tnm.appendChild(selectInput({
    label: 'T Stage (Tumour)',
    section: 'cancerDiagnosis', field: 'stageT',
    options: [
      { value: '0', label: 'T0' },
      { value: '1', label: 'T1' },
      { value: '2', label: 'T2' },
      { value: '3', label: 'T3' },
      { value: '4', label: 'T4' },
      { value: 'X', label: 'TX' }
    ]
  }));
  tnm.appendChild(selectInput({
    label: 'N Stage (Nodes)',
    section: 'cancerDiagnosis', field: 'stageN',
    options: [
      { value: '0', label: 'N0' },
      { value: '1', label: 'N1' },
      { value: '2', label: 'N2' },
      { value: '3', label: 'N3' },
      { value: 'X', label: 'NX' }
    ]
  }));
  tnm.appendChild(selectInput({
    label: 'M Stage (Metastasis)',
    section: 'cancerDiagnosis', field: 'stageM',
    options: [
      { value: '0', label: 'M0' },
      { value: '1', label: 'M1' },
      { value: 'X', label: 'MX' }
    ]
  }));
  card.appendChild(tnm);

  card.appendChild(selectInput({
    label: 'Overall Stage',
    section: 'cancerDiagnosis',
    field: 'overallStage',
    required: true,
    options: [
      { value: 'I', label: 'Stage I' },
      { value: 'II', label: 'Stage II' },
      { value: 'III', label: 'Stage III' },
      { value: 'IV', label: 'Stage IV' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Tumour Grade',
    section: 'cancerDiagnosis',
    field: 'grade',
    options: [
      { value: '1', label: 'Grade 1 - Well differentiated' },
      { value: '2', label: 'Grade 2 - Moderately differentiated' },
      { value: '3', label: 'Grade 3 - Poorly differentiated' },
      { value: '4', label: 'Grade 4 - Undifferentiated' },
      { value: 'X', label: 'GX - Grade cannot be assessed' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Date of Diagnosis',
    section: 'cancerDiagnosis',
    field: 'dateOfDiagnosis',
    type: 'date',
    required: true
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Treatment History',
    description: 'Previous oncology treatments received.'
  });

  card.appendChild(radioGroup({
    label: 'Previous surgery for this cancer?',
    section: 'treatmentHistory', field: 'previousSurgery', options: yesNo
  }));
  const surgDetails = document.createElement('div');
  surgDetails.dataset.conditional = 'treatmentHistory.previousSurgery=yes';
  surgDetails.appendChild(textArea({
    label: 'Surgery details', section: 'treatmentHistory', field: 'surgeryDetails',
    placeholder: 'Type of surgery, date, outcome'
  }));
  card.appendChild(surgDetails);

  card.appendChild(radioGroup({
    label: 'Previous chemotherapy?',
    section: 'treatmentHistory', field: 'previousChemotherapy', options: yesNo
  }));
  const chemoDetails = document.createElement('div');
  chemoDetails.dataset.conditional = 'treatmentHistory.previousChemotherapy=yes';
  chemoDetails.appendChild(textArea({
    label: 'Chemotherapy regimens', section: 'treatmentHistory', field: 'chemotherapyRegimens',
    placeholder: 'e.g., AC-T, FOLFOX, Cisplatin/Etoposide'
  }));
  card.appendChild(chemoDetails);

  card.appendChild(radioGroup({
    label: 'Previous radiation therapy?',
    section: 'treatmentHistory', field: 'previousRadiation', options: yesNo
  }));
  const radDetails = document.createElement('div');
  radDetails.dataset.conditional = 'treatmentHistory.previousRadiation=yes';
  radDetails.appendChild(textArea({
    label: 'Radiation details', section: 'treatmentHistory', field: 'radiationDetails',
    placeholder: 'Site, dose, fractions'
  }));
  card.appendChild(radDetails);

  card.appendChild(radioGroup({
    label: 'Previous immunotherapy?',
    section: 'treatmentHistory', field: 'previousImmunotherapy', options: yesNo
  }));
  const immDetails = document.createElement('div');
  immDetails.dataset.conditional = 'treatmentHistory.previousImmunotherapy=yes';
  immDetails.appendChild(textArea({
    label: 'Immunotherapy details', section: 'treatmentHistory', field: 'immunotherapyDetails',
    placeholder: 'e.g., Pembrolizumab, Nivolumab'
  }));
  card.appendChild(immDetails);

  card.appendChild(radioGroup({
    label: 'Previous targeted therapy?',
    section: 'treatmentHistory', field: 'previousTargetedTherapy', options: yesNo
  }));
  const tgtDetails = document.createElement('div');
  tgtDetails.dataset.conditional = 'treatmentHistory.previousTargetedTherapy=yes';
  tgtDetails.appendChild(textArea({
    label: 'Targeted therapy details', section: 'treatmentHistory', field: 'targetedTherapyDetails',
    placeholder: 'e.g., Trastuzumab, Imatinib'
  }));
  card.appendChild(tgtDetails);

  card.appendChild(radioGroup({
    label: 'Clinical trial participation?',
    section: 'treatmentHistory', field: 'clinicalTrialParticipation', options: yesNo
  }));
  const trialDetails = document.createElement('div');
  trialDetails.dataset.conditional = 'treatmentHistory.clinicalTrialParticipation=yes';
  trialDetails.appendChild(textArea({
    label: 'Clinical trial details', section: 'treatmentHistory', field: 'clinicalTrialDetails',
    placeholder: 'Trial name, phase, status'
  }));
  card.appendChild(trialDetails);

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Current Treatment',
    description: 'Active treatment regimen and response.'
  });

  card.appendChild(textInput({
    label: 'Active Regimen',
    section: 'currentTreatment', field: 'activeRegimen',
    placeholder: 'e.g., FOLFIRI + Bevacizumab'
  }));

  card.appendChild(textInput({
    label: 'Cycle Number',
    section: 'currentTreatment', field: 'cycleNumber',
    type: 'number', min: 1, max: 50
  }));

  card.appendChild(textInput({
    label: 'Last Treatment Date',
    section: 'currentTreatment', field: 'lastTreatmentDate',
    type: 'date'
  }));

  card.appendChild(selectInput({
    label: 'Response Assessment',
    section: 'currentTreatment', field: 'responseAssessment',
    options: [
      { value: 'complete-response', label: 'Complete Response (CR)' },
      { value: 'partial-response', label: 'Partial Response (PR)' },
      { value: 'stable-disease', label: 'Stable Disease (SD)' },
      { value: 'progressive-disease', label: 'Progressive Disease (PD)' },
      { value: 'not-yet-assessed', label: 'Not Yet Assessed' }
    ]
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Symptom Assessment',
    description: 'Current symptoms and severity.'
  });

  card.appendChild(textInput({
    label: 'Pain (NRS 0-10)',
    section: 'symptomAssessment', field: 'painNRS',
    type: 'number', min: 0, max: 10, step: 1,
    hint: '0 = no pain, 10 = worst pain imaginable'
  }));

  card.appendChild(selectInput({
    label: 'Fatigue', section: 'symptomAssessment', field: 'fatigue',
    options: severityOptions
  }));

  card.appendChild(selectInput({
    label: 'Nausea', section: 'symptomAssessment', field: 'nausea',
    options: severityOptions
  }));

  card.appendChild(selectInput({
    label: 'Appetite', section: 'symptomAssessment', field: 'appetite',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'decreased', label: 'Decreased' },
      { value: 'severely-decreased', label: 'Severely Decreased' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Weight Change', section: 'symptomAssessment', field: 'weightChange',
    options: [
      { value: 'stable', label: 'Stable' },
      { value: 'gaining', label: 'Gaining' },
      { value: 'losing-less-5', label: 'Losing <5%' },
      { value: 'losing-5-10', label: 'Losing 5-10%' },
      { value: 'losing-more-10', label: 'Losing >10%' }
    ]
  }));

  card.appendChild(textInput({
    label: 'ESAS Total Score',
    section: 'symptomAssessment', field: 'esasScore',
    type: 'number', min: 0, max: 100,
    hint: 'Edmonton Symptom Assessment System (0-100)'
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Side Effects',
    description: 'Treatment-related adverse effects (CTCAE grading).'
  });

  card.appendChild(selectInput({
    label: 'Neuropathy (CTCAE Grade)',
    section: 'sideEffects', field: 'neuropathy', options: ctcaeOptions
  }));
  const neuroDetails = document.createElement('div');
  neuroDetails.dataset.conditionalAny = 'sideEffects.neuropathy=2,3,4';
  neuroDetails.appendChild(textArea({
    label: 'Neuropathy details', section: 'sideEffects', field: 'neuropathyDetails',
    placeholder: 'Distribution, functional impact'
  }));
  card.appendChild(neuroDetails);

  card.appendChild(selectInput({
    label: 'Mucositis (CTCAE Grade)',
    section: 'sideEffects', field: 'mucositis', options: ctcaeOptions
  }));

  card.appendChild(selectInput({
    label: 'Skin Reactions (CTCAE Grade)',
    section: 'sideEffects', field: 'skinReactions', options: ctcaeOptions
  }));
  const skinDetails = document.createElement('div');
  skinDetails.dataset.conditionalAny = 'sideEffects.skinReactions=2,3,4';
  skinDetails.appendChild(textArea({
    label: 'Skin reaction details', section: 'sideEffects', field: 'skinReactionDetails',
    placeholder: 'Type, location, management'
  }));
  card.appendChild(skinDetails);

  const myeloHeader = document.createElement('h3');
  myeloHeader.className = 'group-heading';
  myeloHeader.textContent = 'Myelosuppression';
  card.appendChild(myeloHeader);

  card.appendChild(radioGroup({
    label: 'Myelosuppression present?',
    section: 'sideEffects', field: 'myelosuppression', options: yesNo
  }));

  const myeloDetails = document.createElement('div');
  myeloDetails.dataset.conditional = 'sideEffects.myelosuppression=yes';
  myeloDetails.appendChild(radioGroup({
    label: 'Neutropenia?', section: 'sideEffects', field: 'neutropenia', options: yesNo
  }));
  myeloDetails.appendChild(radioGroup({
    label: 'Thrombocytopenia?', section: 'sideEffects', field: 'thrombocytopenia', options: yesNo
  }));
  myeloDetails.appendChild(radioGroup({
    label: 'Anaemia?', section: 'sideEffects', field: 'anaemia', options: yesNo
  }));
  card.appendChild(myeloDetails);

  card.appendChild(selectInput({
    label: 'Organ Toxicity (CTCAE Grade)',
    section: 'sideEffects', field: 'organToxicityGrade', options: ctcaeOptions
  }));
  const organDetails = document.createElement('div');
  organDetails.dataset.conditionalAny = 'sideEffects.organToxicityGrade=2,3,4';
  organDetails.appendChild(textArea({
    label: 'Organ toxicity details', section: 'sideEffects', field: 'organToxicityDetails',
    placeholder: 'Organ affected, details'
  }));
  card.appendChild(organDetails);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Laboratory Results',
    description: 'Most recent blood work and tumour markers.'
  });

  const cbcHeader = document.createElement('h3');
  cbcHeader.className = 'group-heading';
  cbcHeader.textContent = 'Complete Blood Count';
  card.appendChild(cbcHeader);

  const cbc = document.createElement('div');
  cbc.className = 'two-col';
  cbc.appendChild(textInput({ label: 'WBC', section: 'laboratoryResults', field: 'wbc', type: 'number', min: 0, max: 100, step: 0.1, unit: 'x10^9/L' }));
  cbc.appendChild(textInput({ label: 'Haemoglobin', section: 'laboratoryResults', field: 'haemoglobin', type: 'number', min: 0, max: 250, step: 1, unit: 'g/L' }));
  cbc.appendChild(textInput({ label: 'Platelets', section: 'laboratoryResults', field: 'platelets', type: 'number', min: 0, max: 1000, step: 1, unit: 'x10^9/L' }));
  cbc.appendChild(textInput({ label: 'Neutrophils (ANC)', section: 'laboratoryResults', field: 'neutrophils', type: 'number', min: 0, max: 50, step: 0.1, unit: 'x10^9/L' }));
  card.appendChild(cbc);

  const metHeader = document.createElement('h3');
  metHeader.className = 'group-heading';
  metHeader.textContent = 'Metabolic Panel';
  card.appendChild(metHeader);

  const met = document.createElement('div');
  met.className = 'two-col';
  met.appendChild(textInput({ label: 'Creatinine', section: 'laboratoryResults', field: 'creatinine', type: 'number', min: 0, max: 1500, step: 1, unit: 'umol/L' }));
  met.appendChild(textInput({ label: 'ALT', section: 'laboratoryResults', field: 'alt', type: 'number', min: 0, max: 5000, step: 1, unit: 'U/L' }));
  met.appendChild(textInput({ label: 'AST', section: 'laboratoryResults', field: 'ast', type: 'number', min: 0, max: 5000, step: 1, unit: 'U/L' }));
  met.appendChild(textInput({ label: 'Bilirubin', section: 'laboratoryResults', field: 'bilirubin', type: 'number', min: 0, max: 500, step: 1, unit: 'umol/L' }));
  met.appendChild(textInput({ label: 'Albumin', section: 'laboratoryResults', field: 'albumin', type: 'number', min: 0, max: 60, step: 1, unit: 'g/L' }));
  met.appendChild(textInput({ label: 'Calcium', section: 'laboratoryResults', field: 'calcium', type: 'number', min: 0, max: 5, step: 0.01, unit: 'mmol/L' }));
  card.appendChild(met);

  const otherHeader = document.createElement('h3');
  otherHeader.className = 'group-heading';
  otherHeader.textContent = 'Other';
  card.appendChild(otherHeader);

  const other = document.createElement('div');
  other.className = 'two-col';
  other.appendChild(textInput({ label: 'LDH', section: 'laboratoryResults', field: 'ldh', type: 'number', min: 0, max: 5000, step: 1, unit: 'U/L' }));
  other.appendChild(textInput({ label: 'INR', section: 'laboratoryResults', field: 'inr', type: 'number', min: 0, max: 10, step: 0.1 }));
  card.appendChild(other);

  const tmHeader = document.createElement('h3');
  tmHeader.className = 'group-heading';
  tmHeader.textContent = 'Tumour Markers';
  card.appendChild(tmHeader);

  const tm = document.createElement('div');
  tm.className = 'two-col';
  tm.appendChild(textInput({ label: 'Tumour Marker', section: 'laboratoryResults', field: 'tumourMarker', placeholder: 'e.g., CA-125, PSA, CEA' }));
  tm.appendChild(textInput({ label: 'Value', section: 'laboratoryResults', field: 'tumourMarkerValue', placeholder: 'e.g., 45 U/mL' }));
  card.appendChild(tm);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Current Medications',
    description: 'All current medications by category.'
  });

  const groups = [
    { field: 'chemotherapyAgents', label: 'Chemotherapy Agents', addLabel: 'Add chemotherapy agent' },
    { field: 'antiemetics', label: 'Antiemetics', addLabel: 'Add antiemetic' },
    { field: 'painMedications', label: 'Pain Medications', addLabel: 'Add pain medication' },
    { field: 'growthFactors', label: 'Growth Factors', addLabel: 'Add growth factor' },
    { field: 'supportiveCare', label: 'Supportive Care', addLabel: 'Add supportive care medication' }
  ];

  for (const g of groups) {
    const header = document.createElement('div');
    header.className = 'list-section-header';
    header.innerHTML = `<h3>${esc(g.label)}</h3>`;
    card.appendChild(header);
    card.appendChild(medicationListEditor({
      section: 'currentMedications',
      field: g.field,
      addLabel: g.addLabel
    }));
  }

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Psychosocial',
    description: 'Emotional wellbeing, coping, and support.'
  });

  card.appendChild(textInput({
    label: 'Distress Thermometer',
    section: 'psychosocial', field: 'distressThermometer',
    type: 'number', min: 0, max: 10, step: 1,
    hint: '0 = no distress, 10 = extreme distress'
  }));

  card.appendChild(selectInput({
    label: 'Anxiety', section: 'psychosocial', field: 'anxiety',
    options: severityOptions
  }));

  card.appendChild(selectInput({
    label: 'Depression', section: 'psychosocial', field: 'depression',
    options: severityOptions
  }));

  card.appendChild(selectInput({
    label: 'Coping Ability', section: 'psychosocial', field: 'copingAbility',
    options: [
      { value: 'coping-well', label: 'Coping well' },
      { value: 'some-difficulty', label: 'Some difficulty coping' },
      { value: 'significant-difficulty', label: 'Significant difficulty coping' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Support System', section: 'psychosocial', field: 'supportSystem',
    options: [
      { value: 'strong', label: 'Strong support' },
      { value: 'moderate', label: 'Moderate support' },
      { value: 'limited', label: 'Limited support' },
      { value: 'none', label: 'No support' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Advance care planning documented?',
    section: 'psychosocial', field: 'advanceCarePlanning', options: yesNo
  }));
  const acpDetails = document.createElement('div');
  acpDetails.dataset.conditional = 'psychosocial.advanceCarePlanning=yes';
  acpDetails.appendChild(textArea({
    label: 'Advance care planning details',
    section: 'psychosocial', field: 'advanceCareDetails',
    placeholder: 'e.g., DNACPR, preferred place of care'
  }));
  card.appendChild(acpDetails);

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Functional & Nutritional',
    description: 'Detailed functional status and nutritional assessment.'
  });

  card.appendChild(selectInput({
    label: 'ECOG Performance Status (Detailed)',
    section: 'functionalNutritional', field: 'ecogDetailed',
    options: [
      { value: '0', label: '0 - Fully active, able to carry on all pre-disease activities' },
      { value: '1', label: '1 - Restricted in physically strenuous activity but ambulatory' },
      { value: '2', label: '2 - Ambulatory and capable of all self-care but unable to work; up >50% waking hours' },
      { value: '3', label: '3 - Capable of only limited self-care; confined to bed/chair >50% waking hours' },
      { value: '4', label: '4 - Completely disabled; cannot carry on any self-care' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Karnofsky Performance Score',
    section: 'functionalNutritional', field: 'karnofskyScore',
    type: 'number', min: 0, max: 100, step: 10,
    hint: '0 = dead, 100 = normal, no complaints'
  }));

  card.appendChild(selectInput({
    label: 'Nutritional Status',
    section: 'functionalNutritional', field: 'nutritionalStatus',
    options: [
      { value: 'well-nourished', label: 'Well nourished' },
      { value: 'at-risk', label: 'At risk of malnutrition' },
      { value: 'malnourished', label: 'Malnourished' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Weight Trajectory',
    section: 'functionalNutritional', field: 'weightTrajectory',
    options: [
      { value: 'stable', label: 'Stable' },
      { value: 'increasing', label: 'Increasing' },
      { value: 'decreasing-slowly', label: 'Decreasing slowly' },
      { value: 'decreasing-rapidly', label: 'Decreasing rapidly' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Dietary Intake',
    section: 'functionalNutritional', field: 'dietaryIntake',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'reduced-mildly', label: 'Mildly reduced' },
      { value: 'reduced-significantly', label: 'Significantly reduced' },
      { value: 'minimal', label: 'Minimal' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Nutritional support required?',
    section: 'functionalNutritional', field: 'nutritionalSupportRequired', options: yesNo
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
  ['demographics', 'ecogPerformanceStatus'],
  // Cancer diagnosis
  ['cancerDiagnosis', 'cancerType'],
  ['cancerDiagnosis', 'primarySite'],
  ['cancerDiagnosis', 'histology'],
  ['cancerDiagnosis', 'stageT'],
  ['cancerDiagnosis', 'stageN'],
  ['cancerDiagnosis', 'stageM'],
  ['cancerDiagnosis', 'overallStage'],
  ['cancerDiagnosis', 'grade'],
  ['cancerDiagnosis', 'dateOfDiagnosis'],
  // Treatment history
  ['treatmentHistory', 'previousSurgery'],
  ['treatmentHistory', 'previousChemotherapy'],
  ['treatmentHistory', 'previousRadiation'],
  ['treatmentHistory', 'previousImmunotherapy'],
  ['treatmentHistory', 'previousTargetedTherapy'],
  ['treatmentHistory', 'clinicalTrialParticipation'],
  // Current treatment
  ['currentTreatment', 'activeRegimen'],
  ['currentTreatment', 'cycleNumber'],
  ['currentTreatment', 'lastTreatmentDate'],
  ['currentTreatment', 'responseAssessment'],
  // Symptom assessment
  ['symptomAssessment', 'painNRS'],
  ['symptomAssessment', 'fatigue'],
  ['symptomAssessment', 'nausea'],
  ['symptomAssessment', 'appetite'],
  ['symptomAssessment', 'weightChange'],
  ['symptomAssessment', 'esasScore'],
  // Side effects
  ['sideEffects', 'neuropathy'],
  ['sideEffects', 'mucositis'],
  ['sideEffects', 'skinReactions'],
  ['sideEffects', 'myelosuppression'],
  ['sideEffects', 'organToxicityGrade'],
  // Laboratory
  ['laboratoryResults', 'wbc'],
  ['laboratoryResults', 'haemoglobin'],
  ['laboratoryResults', 'platelets'],
  ['laboratoryResults', 'neutrophils'],
  ['laboratoryResults', 'creatinine'],
  ['laboratoryResults', 'alt'],
  ['laboratoryResults', 'ast'],
  ['laboratoryResults', 'bilirubin'],
  ['laboratoryResults', 'albumin'],
  ['laboratoryResults', 'calcium'],
  ['laboratoryResults', 'ldh'],
  ['laboratoryResults', 'inr'],
  // Psychosocial
  ['psychosocial', 'distressThermometer'],
  ['psychosocial', 'anxiety'],
  ['psychosocial', 'depression'],
  ['psychosocial', 'copingAbility'],
  ['psychosocial', 'supportSystem'],
  ['psychosocial', 'advanceCarePlanning'],
  // Functional / nutritional
  ['functionalNutritional', 'ecogDetailed'],
  ['functionalNutritional', 'karnofskyScore'],
  ['functionalNutritional', 'nutritionalStatus'],
  ['functionalNutritional', 'weightTrajectory'],
  ['functionalNutritional', 'dietaryIntake'],
  ['functionalNutritional', 'nutritionalSupportRequired']
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
// Step list
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics',           title: 'Demographics' },
  { step: 2,  section: 'cancerDiagnosis',        title: 'Diagnosis' },
  { step: 3,  section: 'treatmentHistory',       title: 'Treatment History' },
  { step: 4,  section: 'currentTreatment',       title: 'Current Treatment' },
  { step: 5,  section: 'symptomAssessment',      title: 'Symptoms' },
  { step: 6,  section: 'sideEffects',            title: 'Side Effects' },
  { step: 7,  section: 'laboratoryResults',      title: 'Labs' },
  { step: 8,  section: 'currentMedications',     title: 'Medications' },
  { step: 9,  section: 'psychosocial',           title: 'Psychosocial' },
  { step: 10, section: 'functionalNutritional',  title: 'Functional & Nutrition' }
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

  const { ecogGrade, firedRules, additionalFlags, timestamp } = lastResult;

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

  const rulesByGrade = [...firedRules].sort((a, b) => b.grade - a.grade);
  const firedRows = rulesByGrade.map((r) => `
    <tr>
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.system)}</td>
      <td>${esc(r.description)}</td>
      <td class="num">ECOG ${r.grade}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No ECOG-impacting rules fired - patient appears fully active (ECOG 0).</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">System</th>
            <th scope="col">Finding</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const kps = state.functionalNutritional.karnofskyScore;
  const kpsMapped = karnofskyToECOG(kps);
  const kpsLine = kps == null
    ? ''
    : `<p class="muted">Karnofsky ${kps} maps to approximately ECOG ${kpsMapped}.</p>`;

  out.innerHTML = `
    <h2>Oncology Assessment Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>ECOG Performance Status</h3>
    <p class="ecog-summary">
      <span class="ecog-badge ${ecogGradeClass(ecogGrade)}">ECOG ${ecogGrade}</span>
      <span class="ecog-label">${esc(ecogGradeLabel(ecogGrade))}</span>
    </p>
    <p class="muted">Worst-case grade across ${firedRules.length} fired rule(s); defaults to ECOG 0 if no rules fire.</p>
    ${kpsLine}

    <h3>Fired Rules</h3>
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
  recomputeDerived();
  const { ecogGrade, firedRules } = calculateECOG(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    ecogGrade,
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
