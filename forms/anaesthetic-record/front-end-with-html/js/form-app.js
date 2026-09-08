import { detectFlaggedIssues } from './flags.js';
import { calculateGrade } from './grader.js';
import { doseUnitLabel, drugCategoryLabel, emptyDrug, emptyEvent, emptyObservation, emptyRecord, eventTypeLabel, monitoringModalityLabel, priorityLabel, routeLabel, statusClass, statusLabel } from './types.js';

// Anaesthetic Record — intra-operative charting wizard (vanilla JavaScript,
// no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The anaesthetist scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered, and a live
// readout updates the completeness status (Complete / Partial / Incomplete),
// the completeness percent, and the safety-flag count as data is entered.
//
// THREE steps host dynamic, repeating one-to-many child lists (add / remove
// rows) that mirror the child tables:
//   - Step 4  Drugs & doses   -> anaesthetic_record_drug_administration
//   - Step 7  Timed observations -> anaesthetic_record_timed_observation
//   - Step 10 Events & complications -> anaesthetic_record_intra_operative_event
//
// Submission runs the pure completeness engine (grader.js -> status,
// completenessPercent, firedRules; flags.js -> safety flags) and renders an
// inline report. State is persisted to localStorage so a partial fill survives
// a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'anaesthetic-record.front-end-with-html.v1';
const CHILD_LISTS = ['drugs', 'observations', 'events'];

/** @returns {import('./types.js').RecordData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyRecord();

  for (const key of Object.keys(fresh)) {
    if (CHILD_LISTS.includes(key)) continue;
    if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null &&
        !Array.isArray(parsed[key])) {
      fresh[key] = { ...fresh[key], ...parsed[key] };
    }
  }
  // Preserve the monitoring modalities array shape.
  if (parsed && parsed.monitoring &&
      Array.isArray(parsed.monitoring.monitoringModalities)) {
    fresh.monitoring.monitoringModalities =
      parsed.monitoring.monitoringModalities.slice();
  }
  // Rehydrate each child list, merging each row over a fresh empty so any
  // newly-added row fields default correctly.
  if (parsed && Array.isArray(parsed.drugs)) {
    fresh.drugs = parsed.drugs.map((d) => ({ ...emptyDrug(), ...d }));
  }
  if (parsed && Array.isArray(parsed.observations)) {
    fresh.observations =
      parsed.observations.map((o) => ({ ...emptyObservation(), ...o }));
  }
  if (parsed && Array.isArray(parsed.events)) {
    fresh.events = parsed.events.map((e) => ({ ...emptyEvent(), ...e }));
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyRecord();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved record; starting fresh.', e);
    return emptyRecord();
  }
}

/** @param {import('./types.js').RecordData} s */
function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save record to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored record.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

/** @type {import('./types.js').RecordData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'anaesthetic-record',
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

const TOTAL_STEPS = 12;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live readout after each change.
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
// Option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const sexOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'intersex', label: 'Intersex' },
  { value: 'unknown', label: 'Unknown' }
];

const urgencyOptions = [
  { value: 'elective', label: 'Elective' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'immediate', label: 'Immediate' }
];

const anaestheticTechniqueOptions = [
  { value: 'general', label: 'General' },
  { value: 'regional', label: 'Regional' },
  { value: 'sedation', label: 'Sedation' },
  { value: 'mac', label: 'Monitored anaesthesia care' },
  { value: 'combined', label: 'Combined' }
];

const asaOptions = [
  { value: 'I', label: 'I — healthy' },
  { value: 'II', label: 'II — mild systemic disease' },
  { value: 'III', label: 'III — severe systemic disease' },
  { value: 'IV', label: 'IV — severe, constant threat to life' },
  { value: 'V', label: 'V — moribund' },
  { value: 'VI', label: 'VI — brain-dead organ donor' }
];

const gradeOneToFour = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' }
];

const airwayTechniqueOptions = [
  { value: 'facemask', label: 'Facemask' },
  { value: 'supraglottic', label: 'Supraglottic airway' },
  { value: 'tracheal-tube', label: 'Tracheal tube' },
  { value: 'tracheostomy', label: 'Tracheostomy' },
  { value: 'awake-foi', label: 'Awake fibreoptic intubation' }
];

const regionalTechniqueOptions = [
  { value: 'none', label: 'None' },
  { value: 'spinal', label: 'Spinal' },
  { value: 'epidural', label: 'Epidural' },
  { value: 'cse', label: 'Combined spinal-epidural' },
  { value: 'peripheral-block', label: 'Peripheral nerve block' }
];

const recoveryDestinationOptions = [
  { value: 'recovery', label: 'Recovery / PACU' },
  { value: 'hdu', label: 'HDU' },
  { value: 'icu', label: 'ICU' },
  { value: 'ward', label: 'Ward' }
];

const doseUnitOptions = [
  { value: 'mg', label: 'mg' },
  { value: 'mcg', label: 'mcg' },
  { value: 'g', label: 'g' },
  { value: 'ml', label: 'mL' },
  { value: 'units', label: 'units' },
  { value: 'mmol', label: 'mmol' },
  { value: 'puff', label: 'puff' },
  { value: 'other', label: 'other' }
];

const routeOptions = [
  { value: 'iv', label: 'IV' },
  { value: 'im', label: 'IM' },
  { value: 'subcutaneous', label: 'Subcutaneous' },
  { value: 'inhalational', label: 'Inhalational' },
  { value: 'oral', label: 'Oral' },
  { value: 'topical', label: 'Topical' },
  { value: 'neuraxial', label: 'Neuraxial' },
  { value: 'infusion', label: 'Infusion' },
  { value: 'other', label: 'Other' }
];

const drugCategoryOptions = [
  { value: 'induction', label: 'Induction' },
  { value: 'neuromuscular-blocker', label: 'Neuromuscular blocker' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'reversal', label: 'Reversal' },
  { value: 'analgesia', label: 'Analgesia' },
  { value: 'antiemetic', label: 'Antiemetic' },
  { value: 'antibiotic', label: 'Antibiotic' },
  { value: 'vasoactive', label: 'Vasoactive' },
  { value: 'local-anaesthetic', label: 'Local anaesthetic' },
  { value: 'other', label: 'Other' }
];

const eventTypeOptions = [
  { value: 'desaturation', label: 'Desaturation' },
  { value: 'hypotension', label: 'Hypotension' },
  { value: 'arrhythmia', label: 'Arrhythmia' },
  { value: 'laryngospasm', label: 'Laryngospasm' },
  { value: 'bronchospasm', label: 'Bronchospasm' },
  { value: 'anaphylaxis', label: 'Anaphylaxis' },
  { value: 'difficult-airway', label: 'Difficult airway' },
  { value: 'awareness', label: 'Awareness' },
  { value: 'other', label: 'Other' }
];

const monitoringOptions = [
  { value: 'ecg', label: 'ECG' },
  { value: 'nibp', label: 'NIBP' },
  { value: 'arterial-line', label: 'Arterial line' },
  { value: 'spo2', label: 'SpO₂' },
  { value: 'capnography', label: 'Capnography' },
  { value: 'temperature', label: 'Temperature' },
  { value: 'neuromuscular', label: 'Neuromuscular' },
  { value: 'depth-of-anaesthesia', label: 'Depth of anaesthesia' },
  { value: 'cvp', label: 'CVP' },
  { value: 'urine-output', label: 'Urine output' }
];

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
    let v = sel.value;
    if (opts.numeric) v = v === '' ? null : Number(v);
    setField(opts.section, opts.field, v);
    clearFieldError(id);
  });
  return wrapper;
}

function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field radio-fieldset';
  wrapper.id = `${groupId}-fieldset`;
  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  if (opts.required) legend.setAttribute('data-required', '');
  wrapper.appendChild(legend);
  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', `${groupId}-fieldset`);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
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
  const err = document.createElement('span');
  err.className = 'error-message';
  err.id = `${groupId}-error`;
  err.setAttribute('aria-live', 'polite');
  wrapper.appendChild(err);
  return wrapper;
}

/** Multi-select checkbox group writing an array into state[section][field]. */
function checkboxGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] || [];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field radio-fieldset';
  wrapper.id = `${groupId}-fieldset`;
  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  wrapper.appendChild(legend);
  if (opts.hint) {
    const hint = document.createElement('span');
    hint.className = 'hint';
    hint.textContent = opts.hint;
    wrapper.appendChild(hint);
  }
  const list = document.createElement('div');
  list.className = 'radio-group';
  for (const option of opts.options) {
    const boxId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
    label.htmlFor = boxId;
    const checked = current.includes(option.value) ? ' checked' : '';
    label.innerHTML = `
      <input class="checkbox-input" type="checkbox" id="${boxId}" name="${groupId}" value="${esc(option.value)}"${checked}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      const set = new Set(state[opts.section][opts.field] || []);
      if (input.checked) set.add(option.value);
      else set.delete(option.value);
      setField(opts.section, opts.field, Array.from(set));
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);
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

/** Build one option list HTML string, marking the current value selected. */
function optionListHtml(options, current, placeholder) {
  return [
    `<option value="">${esc(placeholder || '— Select —')}</option>`,
    ...options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current ?? '') ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');
}

// ----------------------------------------------------------------------
// Repeating-list editors (the three one-to-many child lists)
// ----------------------------------------------------------------------

/**
 * Generic repeating-row editor. `listKey` names the array on `state`; `factory`
 * builds a blank row; `title` labels each card; `renderCells(row, idx)` returns
 * the inner `.list-cell` HTML; `numericKeys` lists row fields coerced to Number.
 * @returns {HTMLElement}
 */
function listEditor(opts) {
  const { listKey, factory, title, gridClass, emptyText, renderCells, numericKeys } = opts;
  const numeric = new Set(numericKeys || []);
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state[listKey];
    wrapper.innerHTML = '';

    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = emptyText;
      wrapper.appendChild(empty);
    }

    rows.forEach((row, idx) => {
      const card = document.createElement('div');
      card.className = `list-row ${listKey}-row`;
      card.innerHTML = `
        <div class="list-row-header">
          <h4>${esc(title)} ${idx + 1}</h4>
          <button type="button" class="button" data-variant="icon" data-action="remove" aria-label="Remove ${esc(title.toLowerCase())} ${idx + 1}">&times;</button>
        </div>
        <div class="list-grid ${gridClass}">
          ${renderCells(row, idx)}
        </div>
      `;

      card.querySelectorAll('input, select, textarea').forEach((inp) => {
        const handler = () => {
          const key = inp.dataset.key;
          if (!key) return;
          let value = inp.value;
          if (numeric.has(key)) value = value === '' ? null : Number(value);
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
    addBtn.textContent = `+ Add ${title.toLowerCase()}`;
    addBtn.addEventListener('click', () => {
      state[listKey].push(factory());
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

/** Editor for the repeating list of drug administrations. */
function drugEditor() {
  return listEditor({
    listKey: 'drugs',
    factory: emptyDrug,
    title: 'Drug',
    gridClass: 'drug-grid',
    emptyText: 'No drugs added yet. Add one row per drug administered.',
    numericKeys: ['dose'],
    renderCells: (row) => `
      <label class="list-cell">
        <span>Drug name</span>
        <input type="text" class="text-input" data-key="drugName" value="${esc(row.drugName)}" placeholder="e.g. Propofol">
      </label>
      <label class="list-cell">
        <span>Category</span>
        <select class="select" data-key="category">${optionListHtml(drugCategoryOptions, row.category)}</select>
      </label>
      <label class="list-cell">
        <span>Dose</span>
        <input type="number" class="number-input" data-key="dose" value="${row.dose ?? ''}" min="0" step="any" placeholder="e.g. 200">
      </label>
      <label class="list-cell">
        <span>Unit</span>
        <select class="select" data-key="doseUnit">${optionListHtml(doseUnitOptions, row.doseUnit)}</select>
      </label>
      <label class="list-cell">
        <span>Route</span>
        <select class="select" data-key="route">${optionListHtml(routeOptions, row.route)}</select>
      </label>
      <label class="list-cell">
        <span>Time administered</span>
        <input type="datetime-local" class="date-input" data-key="administeredAt" value="${esc(row.administeredAt)}">
      </label>
    `
  });
}

/** Editor for the repeating list of timed observations. */
function observationEditor() {
  return listEditor({
    listKey: 'observations',
    factory: emptyObservation,
    title: 'Observation',
    gridClass: 'observation-grid',
    emptyText: 'No observations added yet. Add one row per timed vital-sign set.',
    numericKeys: [
      'systolicBloodPressure', 'diastolicBloodPressure', 'heartRate',
      'spo2', 'endTidalCo2', 'temperature', 'agentPercent', 'freshGasFlowL'
    ],
    renderCells: (row) => `
      <label class="list-cell">
        <span>Time observed</span>
        <input type="datetime-local" class="date-input" data-key="observedAt" value="${esc(row.observedAt)}">
      </label>
      <label class="list-cell">
        <span>Systolic BP (mmHg)</span>
        <input type="number" class="number-input" data-key="systolicBloodPressure" value="${row.systolicBloodPressure ?? ''}" min="0" step="any" placeholder="e.g. 118">
      </label>
      <label class="list-cell">
        <span>Diastolic BP (mmHg)</span>
        <input type="number" class="number-input" data-key="diastolicBloodPressure" value="${row.diastolicBloodPressure ?? ''}" min="0" step="any" placeholder="e.g. 72">
      </label>
      <label class="list-cell">
        <span>Heart rate (bpm)</span>
        <input type="number" class="number-input" data-key="heartRate" value="${row.heartRate ?? ''}" min="0" step="any" placeholder="e.g. 68">
      </label>
      <label class="list-cell">
        <span>SpO₂ (%)</span>
        <input type="number" class="number-input" data-key="spo2" value="${row.spo2 ?? ''}" min="0" max="100" step="any" placeholder="e.g. 99">
      </label>
      <label class="list-cell">
        <span>EtCO₂ (kPa)</span>
        <input type="number" class="number-input" data-key="endTidalCo2" value="${row.endTidalCo2 ?? ''}" min="0" step="any" placeholder="e.g. 4.8">
      </label>
      <label class="list-cell">
        <span>Temperature (°C)</span>
        <input type="number" class="number-input" data-key="temperature" value="${row.temperature ?? ''}" min="0" step="any" placeholder="e.g. 36.5">
      </label>
      <label class="list-cell">
        <span>Agent (%)</span>
        <input type="number" class="number-input" data-key="agentPercent" value="${row.agentPercent ?? ''}" min="0" step="any" placeholder="e.g. 2.0">
      </label>
      <label class="list-cell">
        <span>Fresh-gas flow (L/min)</span>
        <input type="number" class="number-input" data-key="freshGasFlowL" value="${row.freshGasFlowL ?? ''}" min="0" step="any" placeholder="e.g. 1.0">
      </label>
    `
  });
}

/** Editor for the repeating list of intra-operative events. */
function eventEditor() {
  return listEditor({
    listKey: 'events',
    factory: emptyEvent,
    title: 'Event',
    gridClass: 'event-grid',
    emptyText: 'No events added. Add a row for each intra-operative event or complication.',
    numericKeys: [],
    renderCells: (row) => `
      <label class="list-cell">
        <span>Event type</span>
        <select class="select" data-key="eventType">${optionListHtml(eventTypeOptions, row.eventType)}</select>
      </label>
      <label class="list-cell">
        <span>Time occurred</span>
        <input type="datetime-local" class="date-input" data-key="occurredAt" value="${esc(row.occurredAt)}">
      </label>
      <label class="list-cell list-cell-wide">
        <span>Management</span>
        <input type="text" class="text-input" data-key="management" value="${esc(row.management)}" placeholder="e.g. IV fluids and metaraminol; resolved">
      </label>
    `
  });
}

// ----------------------------------------------------------------------
// Section renderers (1 per wizard step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Case identification',
    description: 'Who, where, when — and the overall anaesthetic technique.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. NHS number or local ID'
  }));
  card.appendChild(textInput({
    label: 'Patient name',
    section: 'identification', field: 'patientName',
    placeholder: 'e.g. Okafor, Beatrice'
  }));
  card.appendChild(textInput({
    label: 'Date of birth',
    section: 'identification', field: 'dateOfBirth', type: 'date'
  }));
  card.appendChild(selectInput({
    label: 'Sex', section: 'identification', field: 'sex', options: sexOptions
  }));
  card.appendChild(textInput({
    label: 'Weight (kg)', section: 'identification', field: 'weightKg',
    type: 'number', min: 0, step: 'any', hint: 'Recorded for a complete record.'
  }));
  card.appendChild(textInput({
    label: 'Height (cm)', section: 'identification', field: 'heightCm',
    type: 'number', min: 0, step: 'any'
  }));
  card.appendChild(textInput({
    label: 'Theatre / location', section: 'identification', field: 'theatre',
    placeholder: 'e.g. Theatre 3'
  }));
  card.appendChild(textInput({
    label: 'Date of anaesthetic', section: 'identification', field: 'operationDate',
    type: 'date'
  }));
  card.appendChild(textInput({
    label: 'Responsible anaesthetist', section: 'identification',
    field: 'anaesthetistName', required: true, placeholder: 'e.g. Dr A. Rahman'
  }));
  card.appendChild(textInput({
    label: 'ODP / anaesthetic assistant', section: 'identification',
    field: 'assistantName', placeholder: 'e.g. J. Okonkwo'
  }));
  card.appendChild(textInput({
    label: 'Operating surgeon', section: 'identification', field: 'surgeonName',
    placeholder: 'e.g. Mr T. Brand'
  }));
  card.appendChild(textInput({
    label: 'Planned procedure', section: 'identification', field: 'plannedProcedure',
    placeholder: 'e.g. Laparoscopic cholecystectomy'
  }));
  card.appendChild(selectInput({
    label: 'Urgency', section: 'identification', field: 'urgency',
    options: urgencyOptions
  }));
  card.appendChild(selectInput({
    label: 'Anaesthetic technique', section: 'identification',
    field: 'anaestheticTechnique', required: true,
    options: anaestheticTechniqueOptions,
    hint: 'Overall technique — safety-critical for a complete record.'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Pre-induction checks',
    description: 'Machine check, WHO Safer Surgery Checklist, consent, fasting, access, allergies.'
  });

  card.appendChild(radioGroup({
    label: 'Anaesthetic machine checked?', section: 'preInduction',
    field: 'machineChecked', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'WHO Sign In performed?', section: 'preInduction',
    field: 'whoSignIn', options: yesNo, required: true
  }));
  card.appendChild(radioGroup({
    label: 'WHO Time Out performed?', section: 'preInduction',
    field: 'whoTimeOut', options: yesNo, required: true
  }));
  card.appendChild(radioGroup({
    label: 'Consent confirmed?', section: 'preInduction',
    field: 'consentConfirmed', options: yesNo,
    // no data-required attribute: consent is checked by the safety-flag engine
  }));
  card.appendChild(radioGroup({
    label: 'Fasting confirmed?', section: 'preInduction',
    field: 'fastingConfirmed', options: yesNo
  }));
  card.appendChild(textInput({
    label: 'IV access sites', section: 'preInduction', field: 'ivAccess',
    placeholder: 'e.g. 18G right hand, 16G left forearm'
  }));
  card.appendChild(radioGroup({
    label: 'Allergy band checked?', section: 'preInduction',
    field: 'allergyBandChecked', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Documented allergies', section: 'preInduction',
    field: 'documentedAllergies',
    hint: 'Used for the allergy-conflict safety check against administered drugs.',
    placeholder: 'e.g. Penicillin, morphine'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'ASA & airway assessment',
    description: 'ASA physical status and airway examination.'
  });

  card.appendChild(selectInput({
    label: 'ASA physical status', section: 'asaAirway', field: 'asaStatus',
    required: true, options: asaOptions
  }));
  card.appendChild(radioGroup({
    label: 'ASA emergency (E) modifier?', section: 'asaAirway',
    field: 'asaEmergencyModifier', options: yesNo
  }));
  card.appendChild(selectInput({
    label: 'Mallampati class', section: 'asaAirway', field: 'mallampatiClass',
    numeric: true, options: gradeOneToFour
  }));
  card.appendChild(textInput({
    label: 'Mouth opening (cm)', section: 'asaAirway', field: 'mouthOpeningCm',
    type: 'number', min: 0, step: 'any'
  }));
  card.appendChild(textInput({
    label: 'Thyromental distance (cm)', section: 'asaAirway',
    field: 'thyromentalDistanceCm', type: 'number', min: 0, step: 'any'
  }));
  card.appendChild(textInput({
    label: 'Dentition / loose teeth', section: 'asaAirway', field: 'dentition',
    placeholder: 'e.g. Intact; crown UL6'
  }));
  card.appendChild(radioGroup({
    label: 'Anticipated difficult airway?', section: 'asaAirway',
    field: 'anticipatedDifficultAirway', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Prior difficult intubation?', section: 'asaAirway',
    field: 'priorDifficultIntubation', options: yesNo
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Drugs & doses',
    description: 'One row per drug administered — dose, unit, route, category, and time.'
  });

  const host = document.createElement('div');
  host.className = 'field';
  host.appendChild(drugEditor());
  card.appendChild(host);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Airway management',
    description: 'Technique, device, view, attempts, and confirmation.'
  });

  card.appendChild(selectInput({
    label: 'Airway-management technique', section: 'airway',
    field: 'airwayTechnique', required: true, options: airwayTechniqueOptions
  }));
  card.appendChild(textInput({
    label: 'Device / tube size', section: 'airway', field: 'deviceSize',
    placeholder: 'e.g. Size 4 LMA, 7.5 ETT'
  }));
  card.appendChild(textInput({
    label: 'Tube depth at teeth (cm)', section: 'airway', field: 'tubeDepthCm',
    type: 'number', min: 0, step: 'any'
  }));
  card.appendChild(radioGroup({
    label: 'Cuffed device?', section: 'airway', field: 'cuffed', options: yesNo
  }));
  card.appendChild(selectInput({
    label: 'Cormack–Lehane grade of view', section: 'airway',
    field: 'cormackLehaneGrade', numeric: true, options: gradeOneToFour,
    hint: 'Grade III–IV raises a difficult-airway safety flag.'
  }));
  card.appendChild(textInput({
    label: 'Number of intubation attempts', section: 'airway',
    field: 'intubationAttempts', type: 'number', min: 0, step: 1,
    hint: 'Three or more attempts raises a difficult-airway safety flag.'
  }));
  card.appendChild(radioGroup({
    label: 'Placement confirmed by capnography?', section: 'airway',
    field: 'capnographyConfirmed', options: yesNo
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Monitoring',
    description: 'Monitoring modalities in use during the anaesthetic.'
  });

  card.appendChild(checkboxGroup({
    label: 'Monitoring modalities', section: 'monitoring',
    field: 'monitoringModalities', options: monitoringOptions,
    hint: 'Select every modality in use — recorded for a complete record.'
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Timed observations',
    description: 'Periodic vital-sign rows. At least one set is required for a complete record.'
  });

  const host = document.createElement('div');
  host.className = 'field';
  host.appendChild(observationEditor());
  card.appendChild(host);

  card.appendChild(readOnlyReadout({
    label: 'Live completeness',
    id: 'live-summary-readout',
    render: () => renderLiveSummary()
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Fluids & blood loss',
    description: 'Fluid volumes, estimated blood loss, urine output, and cell salvage.'
  });

  card.appendChild(textInput({
    label: 'Crystalloid (mL)', section: 'fluids', field: 'crystalloidMl',
    type: 'number', min: 0, step: 'any'
  }));
  card.appendChild(textInput({
    label: 'Colloid (mL)', section: 'fluids', field: 'colloidMl',
    type: 'number', min: 0, step: 'any'
  }));
  card.appendChild(textInput({
    label: 'Blood products (mL)', section: 'fluids', field: 'bloodProductsMl',
    type: 'number', min: 0, step: 'any'
  }));
  card.appendChild(textInput({
    label: 'Estimated blood loss (mL)', section: 'fluids',
    field: 'estimatedBloodLossMl', type: 'number', min: 0, step: 'any',
    hint: 'Recorded for a complete record.'
  }));
  card.appendChild(textInput({
    label: 'Urine output (mL)', section: 'fluids', field: 'urineOutputMl',
    type: 'number', min: 0, step: 'any'
  }));
  card.appendChild(textInput({
    label: 'Cell salvage returned (mL)', section: 'fluids', field: 'cellSalvageMl',
    type: 'number', min: 0, step: 'any'
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Regional / neuraxial',
    description: 'Any regional or neuraxial technique used.'
  });

  card.appendChild(selectInput({
    label: 'Regional technique', section: 'regional', field: 'regionalTechnique',
    options: regionalTechniqueOptions
  }));
  card.appendChild(textInput({
    label: 'Interspace / target level', section: 'regional', field: 'regionalLevel',
    placeholder: 'e.g. L3/4'
  }));
  card.appendChild(textInput({
    label: 'Agent', section: 'regional', field: 'regionalDrug',
    placeholder: 'e.g. Bupivacaine 0.5% heavy'
  }));
  card.appendChild(textInput({
    label: 'Dose (mg)', section: 'regional', field: 'regionalDoseMg',
    type: 'number', min: 0, step: 'any'
  }));
  card.appendChild(textInput({
    label: 'Achieved block height / effect', section: 'regional',
    field: 'blockHeight', placeholder: 'e.g. T6 bilateral'
  }));
  card.appendChild(textArea({
    label: 'Complications', section: 'regional', field: 'regionalComplications',
    placeholder: 'e.g. None; single clean pass'
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Events & complications',
    description: 'One row per intra-operative event, with time and management.'
  });

  const host = document.createElement('div');
  host.className = 'field';
  host.appendChild(eventEditor());
  card.appendChild(host);

  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Recovery handover',
    description: 'Destination, airway status, and post-operative plans.'
  });

  card.appendChild(selectInput({
    label: 'Recovery destination', section: 'handover',
    field: 'recoveryDestination', options: recoveryDestinationOptions,
    hint: 'Recorded for a complete record.'
  }));
  card.appendChild(textInput({
    label: 'Airway status at handover', section: 'handover',
    field: 'handoverAirwayStatus', placeholder: 'e.g. Extubated, self-ventilating'
  }));
  card.appendChild(textArea({
    label: 'Analgesia plan', section: 'handover', field: 'analgesiaPlan',
    placeholder: 'e.g. Paracetamol regular, oxycodone PRN'
  }));
  card.appendChild(textArea({
    label: 'Antiemetic plan', section: 'handover', field: 'antiemeticPlan',
    placeholder: 'e.g. Ondansetron PRN'
  }));
  card.appendChild(textInput({
    label: 'Oxygen plan', section: 'handover', field: 'oxygenPlan',
    placeholder: 'e.g. 2 L/min via nasal cannulae'
  }));
  card.appendChild(textArea({
    label: 'Outstanding tasks', section: 'handover', field: 'outstandingTasks',
    placeholder: 'e.g. Chase potassium; review pain in 30 min'
  }));
  card.appendChild(textInput({
    label: 'Handover time', section: 'handover', field: 'handoverAt',
    type: 'datetime-local'
  }));
  card.appendChild(textInput({
    label: 'Receiving practitioner', section: 'handover',
    field: 'receivingPractitioner', placeholder: 'e.g. Recovery nurse S. Patel'
  }));

  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Summary & sign-off',
    description: 'Live completeness and safety flags, plus the anaesthetist signature.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Completeness summary',
    id: 'live-summary-readout-2',
    render: () => renderLiveSummary()
  }));

  card.appendChild(textInput({
    label: 'Anaesthetist signature', section: 'signoff',
    field: 'anaesthetistSignature', required: true,
    placeholder: 'Type full name to sign — required to complete the record.'
  }));
  card.appendChild(textInput({
    label: 'Signed at', section: 'signoff', field: 'signedAt',
    type: 'datetime-local'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the live completeness / safety summary. */
function renderLiveSummary() {
  const g = calculateGrade(state);
  const flags = detectFlaggedIssues(state, g);
  const highFlags = flags.filter((f) => f.priority === 'high').length;
  const status =
    `<span class="risk-badge ${statusClass(g.status)}">${esc(statusLabel(g.status))}</span>`;
  const pctCls = g.completenessPercent === 100 ? 'ok' : 'warn';
  const flagCls = highFlags > 0 ? 'warn' : 'ok';
  return (
    `<div class="readout-line">Status ${status} &nbsp; ` +
    `<strong class="${pctCls}">${g.completenessPercent}%</strong> complete</div>` +
    `<div class="readout-line">` +
    `<strong>${state.drugs.length}</strong> drug(s), ` +
    `<strong>${state.observations.length}</strong> observation(s), ` +
    `<strong>${state.events.length}</strong> event(s)</div>` +
    `<div class="readout-line">` +
    `<span class="muted">${g.criticalMissing} critical / ${g.noncriticalMissing} non-critical item(s) missing</span></div>` +
    `<div class="readout-line">Safety flags <strong class="${flagCls}">${flags.length}</strong> ` +
    `<span class="muted">(${highFlags} high)</span></div>`
  );
}

function refreshLiveSummary() {
  ['live-summary-readout', 'live-summary-readout-2'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = renderLiveSummary();
  });
}

// ----------------------------------------------------------------------
// Conditional sections (kept for parity + future use)
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
// answered when ANY of its fields is answered. The three child lists are handled
// separately (answered when at least one row exists).
const STEP_SLOTS = {
  identification: [
    ['patientIdentifier'], ['anaesthetistName'], ['anaestheticTechnique'],
    ['weightKg'], ['theatre'], ['plannedProcedure']
  ],
  preInduction: [['whoSignIn'], ['whoTimeOut'], ['consentConfirmed'], ['machineChecked']],
  asaAirway: [['asaStatus'], ['anticipatedDifficultAirway']],
  airway: [['airwayTechnique'], ['capnographyConfirmed']],
  monitoring: [['monitoringModalities']],
  fluids: [['estimatedBloodLossMl'], ['crystalloidMl']],
  regional: [['regionalTechnique']],
  handover: [['recoveryDestination'], ['handoverAirwayStatus']],
  signoff: [['anaesthetistSignature']]
};

function isAnswered(section, field) {
  const v = state[section][field];
  if (Array.isArray(v)) return v.length > 0;
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

  // Child lists: synthetic single-slot sections (answered when ≥ 1 row).
  for (const key of CHILD_LISTS) {
    const has = state[key].length > 0 ? 1 : 0;
    sectionTotal[key] = 1;
    sectionAnswered[key] = has;
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
    status, completenessPercent, firedRules, criticalMissing,
    noncriticalMissing, flags, timestamp
  } = lastResult;

  const missingRules = firedRules.filter((r) => !r.satisfied);
  const missingList = missingRules.length === 0
    ? `<p class="muted">All mandatory items are present.</p>`
    : `<ul class="flags">${missingRules.map((r) => `
        <li class="${r.category === 'critical' ? 'flag-high' : 'flag-low'}">
          <span class="flag-priority">${r.category === 'critical' ? 'CRITICAL' : 'NON-CRITICAL'}</span>
          <span class="flag-message">${esc(r.label)}</span>
        </li>`).join('')}</ul>`;

  const drugRows = state.drugs.length === 0
    ? `<tr><td colspan="4" class="muted">No drugs recorded.</td></tr>`
    : state.drugs.map((d, i) => `
      <tr>
        <th scope="row">${esc(d.drugName || `Drug ${i + 1}`)}</th>
        <td>${esc(drugCategoryLabel(d.category) || '—')}</td>
        <td>${d.dose === null || d.dose === undefined || d.dose === '' ? '—' : `${esc(String(d.dose))} ${esc(doseUnitLabel(d.doseUnit))}`}</td>
        <td>${esc(routeLabel(d.route) || '—')}</td>
      </tr>`).join('');

  const obsRows = state.observations.length === 0
    ? `<tr><td colspan="4" class="muted">No observations recorded.</td></tr>`
    : state.observations.map((o, i) => `
      <tr>
        <th scope="row">${esc(o.observedAt || `Set ${i + 1}`)}</th>
        <td>${o.systolicBloodPressure ?? '—'}/${o.diastolicBloodPressure ?? '—'}</td>
        <td>${o.heartRate ?? '—'}</td>
        <td>${o.spo2 ?? '—'}</td>
      </tr>`).join('');

  const eventRows = state.events.length === 0
    ? `<p class="muted">No intra-operative events recorded.</p>`
    : `<ul class="flags">${state.events.map((e, i) => `
        <li><span class="flag-category">${esc(eventTypeLabel(e.eventType) || `Event ${i + 1}`)}</span>
        <span class="flag-message">${esc(e.management || '—')}</span></li>`).join('')}</ul>`;

  const monitoringText = state.monitoring.monitoringModalities.length === 0
    ? '—'
    : state.monitoring.monitoringModalities.map(monitoringModalityLabel).join(', ');

  const flagsList = flags.length === 0
    ? `<p class="muted">No safety flags raised.</p>`
    : `
      <ul class="flags">
        ${flags.map((f) => `
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
        <h2>Anaesthetic Record — Completeness Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${statusClass(status)}">
        <div>
          <span class="risk-banner-label">Completeness status</span>
          <span class="risk-banner-value">${esc(statusLabel(status))}</span>
        </div>
        <span class="risk-badge ${statusClass(status)}">${completenessPercent}% complete</span>
      </div>

      <h3>Mandatory items</h3>
      <table class="subscales">
        <tbody>
          <tr><th scope="row">Completeness</th><td>${completenessPercent}% (${firedRules.filter((r) => r.satisfied).length} of ${firedRules.length} items)</td></tr>
          <tr><th scope="row">Critical items missing</th><td>${criticalMissing}</td></tr>
          <tr><th scope="row">Non-critical items missing</th><td>${noncriticalMissing}</td></tr>
          <tr><th scope="row">Monitoring modalities</th><td>${esc(monitoringText)}</td></tr>
        </tbody>
      </table>

      <h3>Missing items (${missingRules.length})</h3>
      ${missingList}

      <h3>Drugs (${state.drugs.length})</h3>
      <table class="subscales">
        <thead>
          <tr><th scope="col">Drug</th><th scope="col">Category</th><th scope="col">Dose</th><th scope="col">Route</th></tr>
        </thead>
        <tbody>${drugRows}</tbody>
      </table>

      <h3>Timed observations (${state.observations.length})</h3>
      <table class="subscales">
        <thead>
          <tr><th scope="col">Time</th><th scope="col">BP</th><th scope="col">HR</th><th scope="col">SpO₂</th></tr>
        </thead>
        <tbody>${obsRows}</tbody>
      </table>

      <h3>Events & complications (${state.events.length})</h3>
      ${eventRows}

      <h3>Safety flags (${flags.length})</h3>
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
  const grade = calculateGrade(state);
  const flags = detectFlaggedIssues(state, grade);
  lastResult = {
    ...grade,
    flags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh record?')) return;
  clearState();
  state = emptyRecord();
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
  { step: 1,  section: 'identification', title: 'Case ID' },
  { step: 2,  section: 'preInduction',   title: 'Pre-induction' },
  { step: 3,  section: 'asaAirway',      title: 'ASA & airway' },
  { step: 4,  section: 'drugs',          title: 'Drugs' },
  { step: 5,  section: 'airway',         title: 'Airway mgmt' },
  { step: 6,  section: 'monitoring',     title: 'Monitoring' },
  { step: 7,  section: 'observations',   title: 'Observations' },
  { step: 8,  section: 'fluids',         title: 'Fluids' },
  { step: 9,  section: 'regional',       title: 'Regional' },
  { step: 10, section: 'events',         title: 'Events' },
  { step: 11, section: 'handover',       title: 'Handover' },
  { step: 12, section: 'signoff',        title: 'Sign-off' }
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
  host.appendChild(renderStep8());
  host.appendChild(renderStep9());
  host.appendChild(renderStep10());
  host.appendChild(renderStep11());
  host.appendChild(renderStep12());
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
