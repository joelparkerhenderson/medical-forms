import { detectFlaggedIssues } from './flags.js';
import { calculateReconciliation } from './grader.js';
import { isIntentional } from './rules.js';
import { discrepancyTypeLabel, emptyAllergy, emptyDiscrepancy, emptyLineItem, emptyReconciliation, emptySource, highRiskClassLabel, intendedActionLabel, listSourceLabel, priorityLabel, statusClass, statusLabel } from './types.js';

// Medication Reconciliation — reconciliation wizard (vanilla JavaScript, no
// build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The reviewer scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// readout updates the reconciliation status and counts as the four child lists
// grow. The wizard hosts FOUR dynamic, repeating one-to-many editors — each
// mirrors a child table:
//   Step 3  information sources  -> medication_reconciliation_information_source
//   Step 4  allergies            -> medication_reconciliation_allergy
//   Step 5  medication line items-> medication_reconciliation_line_item (bpmh|inpatient)
//   Step 6  discrepancies        -> medication_reconciliation_discrepancy
//
// Submission runs the pure reconciliation engine (counts, status, flags) and
// renders an inline report. State is persisted to localStorage so a partial
// fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'medication-reconciliation.front-end-with-html.v1';

/** The four child-list array names, and their empty-row factories. */
const LIST_FACTORIES = {
  informationSources: emptySource,
  allergies: emptyAllergy,
  lineItems: emptyLineItem,
  discrepancies: emptyDiscrepancy
};

/** @returns {import('./types.js').ReconciliationData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyReconciliation();

  for (const key of Object.keys(fresh)) {
    if (key in LIST_FACTORIES) continue;
    if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null && !Array.isArray(parsed[key])) {
      fresh[key] = { ...fresh[key], ...parsed[key] };
    }
  }
  // Rehydrate each child list, merging each row over a fresh empty so any
  // newly-added field defaults correctly.
  for (const [name, factory] of Object.entries(LIST_FACTORIES)) {
    if (parsed && Array.isArray(parsed[name])) {
      fresh[name] = parsed[name].map((r) => ({ ...factory(), ...r }));
    }
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyReconciliation();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved reconciliation; starting fresh.', e);
    return emptyReconciliation();
  }
}

/** @param {import('./types.js').ReconciliationData} s */
function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save reconciliation to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored reconciliation.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

/** @type {import('./types.js').ReconciliationData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'medication-reconciliation',
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
    refreshLiveSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 7;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live readout after each change.
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshLiveSummary();
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
    case 'email':          return 'email-input';
    case 'number':         return 'number-input';
    case 'date':           return 'date-input';
    case 'datetime-local': return 'date-input';
    case 'time':           return 'time-input';
    case 'tel':            return 'tel-input';
    case 'url':            return 'url-input';
    case 'search':         return 'search-input';
    default:               return 'text-input';
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
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
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
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      ${opts.required ? 'data-required' : ''}
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

function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${opts.required ? ' required data-required' : ''}>
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
    `<span class="section-step">Step ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Option lists (shared)
// ----------------------------------------------------------------------

const yesNoOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const sourceTypeOptions = [
  { value: 'patient-interview', label: 'Patient interview' },
  { value: 'carer-interview', label: 'Carer interview' },
  { value: 'gp-record', label: 'GP record' },
  { value: 'repeat-prescription', label: 'Repeat-prescription list' },
  { value: 'community-pharmacy', label: 'Community-pharmacy record' },
  { value: 'dispensing-history', label: 'Dispensing history' },
  { value: 'previous-discharge-summary', label: 'Previous discharge summary' },
  { value: 'own-drugs-bag', label: "Patient's own-drugs bag" },
  { value: 'care-home-mar', label: 'Care-home MAR chart' }
];

const reactionTypeOptions = [
  { value: 'allergy', label: 'Allergy' },
  { value: 'intolerance', label: 'Intolerance' },
  { value: 'adverse-effect', label: 'Adverse effect' },
  { value: 'unknown', label: 'Unknown' }
];

const severityOptions = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'anaphylaxis', label: 'Anaphylaxis' }
];

const listSourceOptions = [
  { value: 'bpmh', label: 'BPMH (home medicine)' },
  { value: 'inpatient', label: 'Inpatient / proposed' }
];

const routeOptions = [
  { value: 'oral', label: 'Oral' },
  { value: 'iv', label: 'Intravenous' },
  { value: 'im', label: 'Intramuscular' },
  { value: 'subcutaneous', label: 'Subcutaneous' },
  { value: 'topical', label: 'Topical' },
  { value: 'inhaled', label: 'Inhaled' },
  { value: 'other', label: 'Other' }
];

const highRiskClassOptions = [
  { value: 'none', label: 'None' },
  { value: 'anticoagulant', label: 'Anticoagulant' },
  { value: 'insulin', label: 'Insulin' },
  { value: 'opioid', label: 'Opioid' },
  { value: 'other', label: 'Other' }
];

const adherenceOptions = [
  { value: 'taking', label: 'Taking' },
  { value: 'not-taking', label: 'Not taking' },
  { value: 'intermittent', label: 'Intermittent' },
  { value: 'unknown', label: 'Unknown' }
];

const itemStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'held', label: 'Held' },
  { value: 'stopped', label: 'Stopped' },
  { value: 'suspended', label: 'Suspended' }
];

const discrepancyTypeOptions = [
  { value: 'omission', label: 'Omission' },
  { value: 'commission', label: 'Commission' },
  { value: 'duplication', label: 'Duplication' },
  { value: 'dose', label: 'Dose' },
  { value: 'frequency', label: 'Frequency' },
  { value: 'route', label: 'Route' },
  { value: 'formulation', label: 'Formulation' }
];

const intendedActionOptions = [
  { value: 'continue', label: 'Continue' },
  { value: 'hold', label: 'Hold' },
  { value: 'stop', label: 'Stop' },
  { value: 'change', label: 'Change' },
  { value: 'start', label: 'Start' }
];

/** Build one option list HTML string, marking the current value selected. */
function optionListHtml(options, current, placeholder) {
  return [
    `<option value="">${esc(placeholder || '— Select —')}</option>`,
    ...options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current ?? '') ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');
}

/** Shorthand for a labelled text cell in a repeating row. */
function textCell(label, key, value, placeholder) {
  return `
    <label class="list-cell">
      <span>${esc(label)}</span>
      <input type="text" class="text-input" data-key="${key}" value="${esc(value)}"${placeholder ? ` placeholder="${esc(placeholder)}"` : ''}>
    </label>`;
}

/** Shorthand for a labelled select cell in a repeating row. */
function selectCell(label, key, options, current, placeholder) {
  return `
    <label class="list-cell">
      <span>${esc(label)}</span>
      <select class="select" data-key="${key}">${optionListHtml(options, current, placeholder)}</select>
    </label>`;
}

// ----------------------------------------------------------------------
// Generic repeating-list editor — used for all four child lists
// ----------------------------------------------------------------------

/**
 * Build a repeating one-to-many editor for a child list. Each row renders as a
 * card of fields with a remove button; an "add" button appends a fresh blank
 * row. Every change writes straight into `state[arrayName][idx]` and refreshes
 * persistence, progress, and the live summary.
 *
 * @param {Object} opts
 * @param {string} opts.arrayName    - key of the child list on `state`
 * @param {Function} opts.factory    - builds a fresh empty row
 * @param {string} opts.singular     - row heading noun, e.g. "Source"
 * @param {string} opts.addLabel     - add-button label
 * @param {string} opts.emptyText    - empty-state message
 * @param {(row:Object, idx:number)=>string} opts.fields - inner grid HTML
 * @param {string[]} [opts.numericKeys] - keys to coerce to Number|null
 * @param {string} [opts.gridClass]  - extra class on the grid
 * @returns {HTMLElement}
 */
function makeListEditor(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state[opts.arrayName];
    wrapper.innerHTML = '';

    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = opts.emptyText;
      wrapper.appendChild(empty);
    }

    rows.forEach((row, idx) => {
      const card = document.createElement('div');
      card.className = 'list-row';
      card.innerHTML = `
        <div class="list-row-header">
          <h4>${esc(opts.singular)} ${idx + 1}</h4>
          <button type="button" class="button" data-variant="icon" data-action="remove" aria-label="Remove ${esc(opts.singular.toLowerCase())} ${idx + 1}">&times;</button>
        </div>
        <div class="list-grid${opts.gridClass ? ` ${opts.gridClass}` : ''}">${opts.fields(row, idx)}</div>
      `;

      card.querySelectorAll('input, select, textarea').forEach((inp) => {
        const handler = () => {
          const key = inp.dataset.key;
          if (!key) return;
          let value = inp.value;
          if (opts.numericKeys && opts.numericKeys.includes(key)) {
            value = value === '' ? null : Number(value);
          }
          rows[idx][key] = value;
          saveState(state);
          updateProgress();
          refreshLiveSummary();
        };
        inp.addEventListener('input', handler);
        inp.addEventListener('change', handler);
      });

      card.querySelector('[data-action="remove"]').addEventListener('click', () => {
        rows.splice(idx, 1);
        saveState(state);
        rerender();
        updateProgress();
        refreshLiveSummary();
      });

      wrapper.appendChild(card);
    });

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'button';
    addBtn.setAttribute('data-variant', 'add');
    addBtn.textContent = opts.addLabel;
    addBtn.addEventListener('click', () => {
      state[opts.arrayName].push(opts.factory());
      saveState(state);
      rerender();
      updateProgress();
      refreshLiveSummary();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

// ----------------------------------------------------------------------
// Section renderers (1 per reconciliation step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Encounter context',
    description: 'The transition of care being reconciled, the setting, and who is reconciling.'
  });

  card.appendChild(selectInput({
    label: 'Reconciliation type',
    section: 'encounter', field: 'reconciliationType', required: true,
    options: [
      { value: 'admission', label: 'Admission' },
      { value: 'transfer', label: 'Transfer' },
      { value: 'discharge', label: 'Discharge' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'encounter', field: 'careSetting', required: true,
    options: [
      { value: 'emergency-department', label: 'Emergency department' },
      { value: 'acute-medical-unit', label: 'Acute medical unit' },
      { value: 'surgical-admissions', label: 'Surgical admissions' },
      { value: 'ward', label: 'Ward' },
      { value: 'critical-care', label: 'Critical care' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of reconciliation',
    section: 'encounter', field: 'reconciledAt', type: 'datetime-local'
  }));
  card.appendChild(textInput({
    label: 'Reconciling clinician name',
    section: 'encounter', field: 'clinicianName', required: true,
    placeholder: 'e.g. Priya Nair'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'encounter', field: 'clinicianRole', required: true,
    options: [
      { value: 'pharmacist', label: 'Pharmacist' },
      { value: 'pharmacy-technician', label: 'Pharmacy technician' },
      { value: 'prescriber', label: 'Prescriber' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age band, sex, and weight for weight-based dosing.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. NHS number or local MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    options: [
      { value: 'adult', label: 'Adult' },
      { value: 'paediatric', label: 'Paediatric' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'identification', field: 'sex', required: true,
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'intersex', label: 'Intersex' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Weight',
    section: 'identification', field: 'weightKg',
    type: 'number', min: 0, max: 400, step: 0.1, unit: 'kg',
    hint: 'Optional; supports weight-based dosing.'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Information sources',
    description: 'Each source used to build the best-possible medication history. Two or more independent sources are required.'
  });

  const host = document.createElement('div');
  host.className = 'field';
  host.appendChild(makeListEditor({
    arrayName: 'informationSources',
    factory: emptySource,
    singular: 'Source',
    addLabel: '+ Add information source',
    emptyText: 'No sources added yet. Add each source used to build the BPMH (two or more required).',
    fields: (row) =>
      selectCell('Source type', 'sourceType', sourceTypeOptions, row.sourceType) +
      selectCell('Verified (directly checked)?', 'verified', yesNoOptions, row.verified)
  }));
  card.appendChild(host);

  card.appendChild(readOnlyReadout({
    label: 'Live status',
    id: 'live-summary-readout',
    render: () => renderLiveSummary()
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Allergies and adverse reactions',
    description: 'Record the allergy status, then add each documented drug allergy or adverse reaction.'
  });

  card.appendChild(selectInput({
    label: 'Allergy status',
    section: 'allergyReview', field: 'allergyStatus', required: true,
    hint: 'Required. "Not documented" or blank keeps the reconciliation incomplete.',
    options: [
      { value: 'documented', label: 'Allergies documented (add below)' },
      { value: 'no-known-drug-allergies', label: 'No known drug allergies' },
      { value: 'not-documented', label: 'Not documented' }
    ]
  }));

  const host = document.createElement('div');
  host.className = 'field';
  host.appendChild(makeListEditor({
    arrayName: 'allergies',
    factory: emptyAllergy,
    singular: 'Allergy',
    addLabel: '+ Add allergy',
    emptyText: 'No allergies added. Add each documented drug allergy or adverse reaction.',
    fields: (row) =>
      textCell('Substance (drug or class)', 'substance', row.substance, 'e.g. Penicillin') +
      selectCell('Reaction type', 'reactionType', reactionTypeOptions, row.reactionType) +
      selectCell('Severity', 'severity', severityOptions, row.severity)
  }));
  card.appendChild(host);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Medication line items',
    description: 'One row per medicine. Tag each as BPMH (a home medicine) or Inpatient / proposed. The BPMH and inpatient lists are reconciled in the next step.'
  });

  const host = document.createElement('div');
  host.className = 'field';
  host.appendChild(makeListEditor({
    arrayName: 'lineItems',
    factory: emptyLineItem,
    singular: 'Medicine',
    addLabel: '+ Add medicine',
    gridClass: 'line-item-grid',
    emptyText: 'No medicines added yet. Add one row per BPMH or inpatient medicine.',
    fields: (row) =>
      selectCell('List', 'listSource', listSourceOptions, row.listSource) +
      textCell('Medicine name', 'drugName', row.drugName, 'e.g. Warfarin') +
      textCell('Form', 'form', row.form, 'e.g. Tablet') +
      textCell('Dose', 'dose', row.dose, 'e.g. 3 mg') +
      selectCell('Route', 'route', routeOptions, row.route) +
      textCell('Frequency', 'frequency', row.frequency, 'e.g. Once daily') +
      textCell('Indication', 'indication', row.indication, 'e.g. Atrial fibrillation') +
      selectCell('High-risk class', 'highRiskClass', highRiskClassOptions, row.highRiskClass) +
      selectCell('Adherence', 'adherence', adherenceOptions, row.adherence) +
      selectCell('Information source', 'sourceType', sourceTypeOptions, row.sourceType) +
      selectCell('Inpatient status', 'status', itemStatusOptions, row.status)
  }));
  card.appendChild(host);

  card.appendChild(readOnlyReadout({
    label: 'Live status',
    id: 'live-summary-readout-2',
    render: () => renderLiveSummary()
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Reconciliation',
    description: 'One row per discrepancy between the BPMH and the inpatient list. Mark each intentional (with an action and rationale) or unintentional (an outstanding error).'
  });

  const host = document.createElement('div');
  host.className = 'field';
  host.appendChild(makeListEditor({
    arrayName: 'discrepancies',
    factory: emptyDiscrepancy,
    singular: 'Discrepancy',
    addLabel: '+ Add discrepancy',
    gridClass: 'discrepancy-grid',
    emptyText: 'No discrepancies added. Add one row per difference between the BPMH and the inpatient list.',
    fields: (row) =>
      selectCell('Type', 'discrepancyType', discrepancyTypeOptions, row.discrepancyType) +
      textCell('Matched BPMH item', 'bpmhItemRef', row.bpmhItemRef, 'e.g. Warfarin 3 mg') +
      textCell('Matched inpatient item', 'inpatientItemRef', row.inpatientItemRef, 'e.g. Warfarin (held)') +
      selectCell('Intended action', 'intendedAction', intendedActionOptions, row.intendedAction) +
      textCell('Rationale', 'rationale', row.rationale, 'e.g. Held pre-operatively') +
      selectCell('Intentional (documented decision)?', 'intentional', yesNoOptions, row.intentional)
  }));
  card.appendChild(host);

  card.appendChild(readOnlyReadout({
    label: 'Live status',
    id: 'live-summary-readout-3',
    render: () => renderLiveSummary()
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Summary and sign-off',
    description: 'The computed status and counts, plus a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Reconciliation summary',
    id: 'live-summary-readout-4',
    render: () => renderLiveSummary()
  }));

  card.appendChild(textArea({
    label: 'Clinical note and sign-off',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text note: outstanding actions, escalation, and sign-off.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

const LIVE_READOUT_IDS = [
  'live-summary-readout',
  'live-summary-readout-2',
  'live-summary-readout-3',
  'live-summary-readout-4'
];

/** Render the live status / counts summary. */
function renderLiveSummary() {
  const g = calculateReconciliation(state);
  const status = `<span class="risk-badge ${statusClass(g.status)}">${esc(statusLabel(g.status))}</span>`;
  const sourcesCls = g.sourceCount >= 2 ? 'ok' : 'warn';
  const unintentionalCls = g.unintentionalCount > 0 ? 'warn' : 'ok';
  return (
    `<div class="readout-line">Status ${status}</div>` +
    `<div class="readout-line"><strong class="${sourcesCls}">${g.sourceCount}</strong> source(s) ` +
    `<span class="muted">(${g.verifiedSourceCount} verified)</span></div>` +
    `<div class="readout-line"><strong>${g.lineItemCount}</strong> line item(s): ` +
    `${g.bpmhCount} BPMH, ${g.inpatientCount} inpatient</div>` +
    `<div class="readout-line"><strong>${g.discrepancyCount}</strong> discrepancy(ies): ` +
    `${g.intentionalCount} intentional, <strong class="${unintentionalCls}">${g.unintentionalCount}</strong> unintentional</div>`
  );
}

function refreshLiveSummary() {
  LIVE_READOUT_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = renderLiveSummary();
  });
}

// ----------------------------------------------------------------------
// Conditional sections (none currently, but kept for parity + future use)
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

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each plain section maps to one or more progress "slots"; a slot counts as
// answered when ANY of its fields is answered. The four child lists are handled
// separately (answered when at least one row exists).
const STEP_SLOTS = {
  encounter: [['reconciliationType'], ['careSetting'], ['clinicianName'], ['clinicianRole']],
  identification: [['patientIdentifier'], ['ageBand'], ['sex']],
  allergyReview: [['allergyStatus']],
  note: [['clinicalNote']]
};

const LIST_SECTIONS = ['informationSources', 'allergies', 'lineItems', 'discrepancies'];

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  let total = 0;
  const sectionAnswered = {};
  const sectionTotal = {};

  for (const section of Object.keys(STEP_SLOTS)) {
    const slots = STEP_SLOTS[section];
    sectionTotal[section] = slots.length;
    sectionAnswered[section] = 0;
    for (const slot of slots) {
      total++;
      const slotAnswered = slot.some((field) => isAnswered(section, field));
      if (slotAnswered) {
        answered++;
        sectionAnswered[section]++;
      }
    }
  }

  // Each child list: a synthetic single-slot section, answered when non-empty.
  for (const name of LIST_SECTIONS) {
    const has = (state[name] || []).length > 0 ? 1 : 0;
    sectionTotal[name] = 1;
    sectionAnswered[name] = has;
    total++;
    answered += has;
  }

  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(sectionAnswered, sectionTotal);
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
    status, sourceCount, verifiedSourceCount, allergyCount, lineItemCount,
    bpmhCount, inpatientCount, discrepancyCount, intentionalCount,
    unintentionalCount, highRiskUnintentionalCount, flaggedIssues, timestamp
  } = lastResult;

  const lineRows = state.lineItems.length === 0
    ? `<tr><td colspan="5" class="muted">No medicines recorded.</td></tr>`
    : state.lineItems.map((m, i) => `
      <tr>
        <th scope="row">${esc(m.drugName || `Medicine ${i + 1}`)}</th>
        <td>${esc(listSourceLabel(m.listSource) || '—')}</td>
        <td>${esc([m.dose, m.frequency].filter(Boolean).join(' · ') || '—')}</td>
        <td>${esc(m.indication || '—')}</td>
        <td>${m.highRiskClass && m.highRiskClass !== 'none' ? `<span class="grade-pill">${esc(highRiskClassLabel(m.highRiskClass))}</span>` : '—'}</td>
      </tr>
    `).join('');

  const discrepancyRows = state.discrepancies.length === 0
    ? `<tr><td colspan="4" class="muted">No discrepancies recorded.</td></tr>`
    : state.discrepancies.map((d, i) => {
        const intentional = isIntentional(d);
        return `
      <tr class="${intentional ? '' : 'flag-medium'}">
        <th scope="row">${esc(discrepancyTypeLabel(d.discrepancyType) || `Discrepancy ${i + 1}`)}</th>
        <td>${esc([d.bpmhItemRef, d.inpatientItemRef].filter(Boolean).join(' → ') || '—')}</td>
        <td>${esc(intendedActionLabel(d.intendedAction) || '—')}${d.rationale ? ` — ${esc(d.rationale)}` : ''}</td>
        <td>${intentional ? 'Intentional' : '<strong>Unintentional</strong>'}</td>
      </tr>`;
      }).join('');

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No safety flags raised.</p>`
    : `
      <ul class="flags">
        ${flaggedIssues.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority))}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}${f.suggestedAction ? ` — ${esc(f.suggestedAction)}` : ''}</span>
          </li>
        `).join('')}
      </ul>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Medication Reconciliation Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${statusClass(status)}">
        <div>
          <span class="risk-banner-label">Reconciliation status</span>
          <span class="risk-banner-value">${esc(statusLabel(status))}</span>
        </div>
        <span class="risk-badge ${statusClass(status)}">${esc(statusLabel(status))}</span>
      </div>

      <h3>Counts</h3>
      <table class="subscales">
        <tbody>
          <tr><th scope="row">Information sources</th><td>${sourceCount} (${verifiedSourceCount} verified) — minimum 2 required</td></tr>
          <tr><th scope="row">Allergies recorded</th><td>${allergyCount}</td></tr>
          <tr><th scope="row">Line items</th><td>${lineItemCount} — ${bpmhCount} BPMH, ${inpatientCount} inpatient</td></tr>
          <tr><th scope="row">Discrepancies</th><td>${discrepancyCount} — ${intentionalCount} intentional, ${unintentionalCount} unintentional</td></tr>
          <tr><th scope="row">High-risk unintentional</th><td>${highRiskUnintentionalCount}</td></tr>
        </tbody>
      </table>

      <h3>Medication line items (${lineItemCount})</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Medicine</th>
            <th scope="col">List</th>
            <th scope="col">Dose / frequency</th>
            <th scope="col">Indication</th>
            <th scope="col">High-risk</th>
          </tr>
        </thead>
        <tbody>${lineRows}</tbody>
      </table>

      <h3>Discrepancies (${discrepancyCount})</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Type</th>
            <th scope="col">Matched items</th>
            <th scope="col">Action / rationale</th>
            <th scope="col">Intent</th>
          </tr>
        </thead>
        <tbody>${discrepancyRows}</tbody>
      </table>

      <h3>Safety flags (${flaggedIssues.length})</h3>
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
  const _errors = validateForm();
  if (_errors.length > 0) return;
  const grade = calculateReconciliation(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    ...grade,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh reconciliation?')) return;
  clearState();
  state = emptyReconciliation();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'encounter',          title: 'Encounter' },
  { step: 2, section: 'identification',     title: 'Patient' },
  { step: 3, section: 'informationSources', title: 'Sources' },
  { step: 4, section: 'allergyReview',      title: 'Allergies' },
  { step: 5, section: 'lineItems',          title: 'Medicines' },
  { step: 6, section: 'discrepancies',      title: 'Reconcile' },
  { step: 7, section: 'note',               title: 'Summary' }
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
  const required = form.querySelectorAll('input[data-required], select[data-required], textarea[data-required]');
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveSummary();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
