import { assess } from './grader.js';
import { deriveNews2 } from './news2.js';
import {
  acuityClass,
  acuityLabel,
  emptyAssessment,
  emptyInvestigationRow,
  emptyJobRow,
  emptyMedicationRow,
  emptyProblemRow,
  noteTypeLabel,
  priorityLabel,
  statusClass,
  statusLabel
} from './types.js';

// Inpatient Clinical Note — single-page wizard (vanilla JavaScript, no build).
//
// Single continuous wizard: all twelve steps are rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered, and a live
// readout updates the completeness status, the completeness percent, and the
// acuity band as data is entered. Submission runs both pure engines
// (grader.js -> completeness + acuity; flags.js -> safety flags) and renders an
// inline report. State is persisted to localStorage so a partial fill survives a
// page reload.
//
// Two things here differ from the simpler completeness forms in this monorepo:
//
//   1. Four steps hold REPEATING ROWS (investigations, problems, medications,
//      jobs) backed by child tables. `rowList()` renders an add/remove editor
//      over an array in state.
//   2. Step 1's note type drives which components the completeness engine
//      requires, so the note-type-specific fields and the live required-count
//      both react to it.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'inpatient-clinical-note.front-end-with-html.v1';

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
  // Child collections must stay arrays even if older saved state lacked them.
  if (!Array.isArray(fresh.investigations.rows)) fresh.investigations.rows = [];
  if (!Array.isArray(fresh.problems.rows)) fresh.problems.rows = [];
  if (!Array.isArray(fresh.medications.rows)) fresh.medications.rows = [];
  if (!Array.isArray(fresh.planning.jobs)) fresh.planning.jobs = [];
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyAssessment();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved note; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save note to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored note.', e);
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
  slug: 'inpatient-clinical-note',
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
    refreshLiveSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 12;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a field on the state and persist. Re-runs progress and the live readout.
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
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

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    setField(opts.section, opts.field, input.value);
    clearFieldError(id);
  });
  return wrapper;
}

function numberInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="number"`,
    `class="number-input"`,
    `value="${value === null || value === undefined ? '' : esc(value)}"`,
    `aria-describedby="${id}-error"`
  ];
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    const raw = input.value.trim();
    setField(opts.section, opts.field, raw === '' ? null : Number(raw));
    clearFieldError(id);
    if (opts.onChange) opts.onChange();
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
      aria-describedby="${id}-error"
      class="text-area-input"${opts.required ? ' required data-required' : ''}>${esc(value)}</textarea>
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
    if (opts.onChange) opts.onChange();
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

/**
 * Repeating-row editor over an array in state, backed by a child table.
 *
 * Each row is a flat object of string fields. `columns` describes how to render
 * each field; `makeRow` builds a blank row. The whole list re-renders on any
 * add or remove, which keeps row indices and element ids in step with the
 * underlying array.
 *
 * @param {Object} opts
 * @param {string} opts.section    - state section holding the array
 * @param {string} opts.field      - property name of the array within the section
 * @param {string} opts.legend     - heading for the list
 * @param {string} opts.addLabel   - text for the add button
 * @param {string} opts.emptyText  - shown when the list is empty
 * @param {Function} opts.makeRow  - () => blank row object
 * @param {Array} opts.columns     - [{ field, label, type?, options?, rows?, placeholder? }]
 */
function rowList(opts) {
  const host = document.createElement('div');
  host.className = 'field row-list';
  host.id = `${opts.section}-${opts.field}-list`;

  const rows = () => state[opts.section][opts.field];

  function persist() {
    saveState(state);
    updateProgress();
    refreshLiveSummary();
  }

  function renderRowEditor(row, index) {
    const item = document.createElement('div');
    item.className = 'row-list-item';
    item.dataset.index = String(index);

    const head = document.createElement('div');
    head.className = 'row-list-item-header';
    head.innerHTML =
      `<span class="row-list-item-title">${esc(opts.legend)} ${index + 1}</span>`;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'button';
    remove.dataset.variant = 'secondary';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove ${opts.legend.toLowerCase()} ${index + 1}`);
    remove.addEventListener('click', () => {
      rows().splice(index, 1);
      persist();
      renderAll();
    });
    head.appendChild(remove);
    item.appendChild(head);

    for (const col of opts.columns) {
      const id = `${opts.section}-${opts.field}-${index}-${col.field}`;
      const value = row[col.field] ?? '';
      const field = document.createElement('div');
      field.className = 'field';

      if (col.type === 'select') {
        const optionsHtml = [
          `<option value="">— Select —</option>`,
          ...col.options.map((o) =>
            `<option value="${esc(o.value)}"${String(o.value) === String(value) ? ' selected' : ''}>${esc(o.label)}</option>`
          )
        ].join('');
        field.innerHTML = `
          <label class="label" for="${id}">${esc(col.label)}</label>
          <select id="${id}" name="${id}" class="select">${optionsHtml}</select>
        `;
        field.querySelector('select').addEventListener('change', (ev) => {
          row[col.field] = ev.target.value;
          persist();
        });
      } else if (col.type === 'textarea') {
        field.innerHTML = `
          <label class="label" for="${id}">${esc(col.label)}</label>
          <textarea id="${id}" name="${id}" rows="${col.rows || 2}" class="text-area-input"
            ${col.placeholder ? `placeholder="${esc(col.placeholder)}"` : ''}>${esc(value)}</textarea>
        `;
        field.querySelector('textarea').addEventListener('input', (ev) => {
          row[col.field] = ev.target.value;
          persist();
        });
      } else {
        const type = col.type || 'text';
        field.innerHTML = `
          <label class="label" for="${id}">${esc(col.label)}</label>
          <input id="${id}" name="${id}" type="${type}" class="${lilyInputClass(type)}"
            value="${esc(value)}"
            ${col.placeholder ? `placeholder="${esc(col.placeholder)}"` : ''}>
        `;
        field.querySelector('input').addEventListener('input', (ev) => {
          row[col.field] = ev.target.value;
          persist();
        });
      }
      item.appendChild(field);
    }
    return item;
  }

  function renderAll() {
    host.innerHTML = '';

    const legend = document.createElement('p');
    legend.className = 'label';
    legend.textContent = `${opts.legend} (${rows().length})`;
    host.appendChild(legend);

    if (rows().length === 0) {
      const empty = document.createElement('p');
      empty.className = 'hint';
      empty.textContent = opts.emptyText;
      host.appendChild(empty);
    } else {
      rows().forEach((row, index) => host.appendChild(renderRowEditor(row, index)));
    }

    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'button';
    add.dataset.variant = 'secondary';
    add.textContent = opts.addLabel;
    add.addEventListener('click', () => {
      rows().push(opts.makeRow());
      persist();
      renderAll();
    });
    host.appendChild(add);
  }

  renderAll();
  return host;
}

// ----------------------------------------------------------------------
// Option vocabularies (mirror the SQL CHECK constraints)
// ----------------------------------------------------------------------

const OPTIONS = {
  noteType: [
    { value: 'admission-clerking', label: 'Admission clerking' },
    { value: 'progress', label: 'Progress note' },
    { value: 'consult', label: 'Consult note' },
    { value: 'event', label: 'Event / deterioration note' },
    { value: 'procedure', label: 'Bedside procedure note' },
    { value: 'handover', label: 'Handover note' },
    { value: 'transfer', label: 'Transfer note' },
    { value: 'discharge-planning', label: 'Discharge-planning note' }
  ],
  authorGrade: [
    { value: 'FY1', label: 'Foundation Year 1 (FY1)' },
    { value: 'FY2', label: 'Foundation Year 2 (FY2)' },
    { value: 'CT1', label: 'Core trainee 1 (CT1)' },
    { value: 'CT2', label: 'Core trainee 2 (CT2)' },
    { value: 'CT3', label: 'Core trainee 3 (CT3)' },
    { value: 'ST1', label: 'Specialty registrar 1 (ST1)' },
    { value: 'ST2', label: 'Specialty registrar 2 (ST2)' },
    { value: 'ST3', label: 'Specialty registrar 3 (ST3)' },
    { value: 'ST4', label: 'Specialty registrar 4 (ST4)' },
    { value: 'ST5', label: 'Specialty registrar 5 (ST5)' },
    { value: 'ST6', label: 'Specialty registrar 6 (ST6)' },
    { value: 'ST7', label: 'Specialty registrar 7 (ST7)' },
    { value: 'ST8', label: 'Specialty registrar 8 (ST8)' },
    { value: 'SAS', label: 'SAS doctor' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'acp', label: 'Advanced clinical practitioner (ACP)' },
    { value: 'physician-associate', label: 'Physician associate' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'other', label: 'Other' }
  ],
  sex: [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'intersex', label: 'Intersex' },
    { value: 'unknown', label: 'Unknown' }
  ],
  admissionMethod: [
    { value: 'emergency-department', label: 'Emergency department' },
    { value: 'gp-referral', label: 'GP referral' },
    { value: 'elective', label: 'Elective' },
    { value: 'transfer-in', label: 'Transfer in' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'maternity', label: 'Maternity' },
    { value: 'other', label: 'Other' }
  ],
  procedureConsent: [
    { value: 'written', label: 'Written' },
    { value: 'verbal', label: 'Verbal' },
    { value: 'implied', label: 'Implied' },
    { value: 'emergency-no-consent', label: 'Emergency — no consent possible' },
    { value: 'best-interests', label: 'Best interests' }
  ],
  sleepQuality: [
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
    { value: 'none', label: 'None' }
  ],
  oralIntake: [
    { value: 'normal', label: 'Normal' },
    { value: 'reduced', label: 'Reduced' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'nil-by-mouth', label: 'Nil by mouth' }
  ],
  mobilityStatus: [
    { value: 'independent', label: 'Independent' },
    { value: 'stick', label: 'Stick' },
    { value: 'frame', label: 'Frame' },
    { value: 'assistance-of-one', label: 'Assistance of one' },
    { value: 'assistance-of-two', label: 'Assistance of two' },
    { value: 'hoist', label: 'Hoist' },
    { value: 'bed-bound', label: 'Bed-bound' }
  ],
  spo2Scale: [
    { value: 'scale-1', label: 'Scale 1 (default)' },
    { value: 'scale-2', label: 'Scale 2 (target 88–92%, hypercapnic respiratory failure)' }
  ],
  oxygenDelivery: [
    { value: 'air', label: 'Room air' },
    { value: 'nasal-cannula', label: 'Nasal cannula' },
    { value: 'simple-mask', label: 'Simple mask' },
    { value: 'venturi', label: 'Venturi mask' },
    { value: 'non-rebreathe', label: 'Non-rebreathe mask' },
    { value: 'high-flow-nasal', label: 'High-flow nasal oxygen' },
    { value: 'niv', label: 'Non-invasive ventilation' },
    { value: 'invasive-ventilation', label: 'Invasive ventilation' }
  ],
  acvpu: [
    { value: 'alert', label: 'Alert' },
    { value: 'confusion', label: 'New confusion' },
    { value: 'voice', label: 'Responds to voice' },
    { value: 'pain', label: 'Responds to pain' },
    { value: 'unresponsive', label: 'Unresponsive' }
  ],
  news2Trend: [
    { value: 'improving', label: 'Improving' },
    { value: 'stable', label: 'Stable' },
    { value: 'worsening', label: 'Worsening' },
    { value: 'unknown', label: 'Unknown' }
  ],
  investigationCategory: [
    { value: 'haematology', label: 'Haematology' },
    { value: 'biochemistry', label: 'Biochemistry' },
    { value: 'microbiology', label: 'Microbiology' },
    { value: 'imaging', label: 'Imaging' },
    { value: 'histopathology', label: 'Histopathology' },
    { value: 'physiology', label: 'Physiology' },
    { value: 'point-of-care', label: 'Point of care' },
    { value: 'other', label: 'Other' }
  ],
  problemCategory: [
    { value: 'presenting', label: 'Presenting' },
    { value: 'comorbidity', label: 'Comorbidity' },
    { value: 'complication', label: 'Complication' },
    { value: 'hospital-acquired', label: 'Hospital-acquired' },
    { value: 'social', label: 'Social' },
    { value: 'psychological', label: 'Psychological' },
    { value: 'other', label: 'Other' }
  ],
  problemStatus: [
    { value: 'active', label: 'Active' },
    { value: 'resolving', label: 'Resolving' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'chronic', label: 'Chronic' }
  ],
  medicationAction: [
    { value: 'started', label: 'Started' },
    { value: 'stopped', label: 'Stopped' },
    { value: 'dose-changed', label: 'Dose changed' },
    { value: 'held', label: 'Held' },
    { value: 'continued', label: 'Continued' },
    { value: 'switched', label: 'Switched' }
  ],
  medicationRoute: [
    { value: 'oral', label: 'Oral' },
    { value: 'intravenous', label: 'Intravenous' },
    { value: 'intramuscular', label: 'Intramuscular' },
    { value: 'subcutaneous', label: 'Subcutaneous' },
    { value: 'topical', label: 'Topical' },
    { value: 'inhaled', label: 'Inhaled' },
    { value: 'rectal', label: 'Rectal' },
    { value: 'nasogastric', label: 'Nasogastric' },
    { value: 'sublingual', label: 'Sublingual' },
    { value: 'other', label: 'Other' }
  ],
  medicinesReconciliation: [
    { value: 'done', label: 'Done' },
    { value: 'partial', label: 'Partial' },
    { value: 'not-done', label: 'Not done' },
    { value: 'not-applicable', label: 'Not applicable' }
  ],
  antimicrobialReview: [
    { value: 'not-applicable', label: 'Not applicable' },
    { value: 'due', label: 'Due' },
    { value: 'done', label: 'Done' },
    { value: 'overdue', label: 'Overdue' }
  ],
  vteStatus: [
    { value: 'done', label: 'Assessed' },
    { value: 'not-done', label: 'Not done' },
    { value: 'not-applicable', label: 'Not applicable' }
  ],
  vteProphylaxis: [
    { value: 'pharmacological', label: 'Pharmacological' },
    { value: 'mechanical', label: 'Mechanical' },
    { value: 'both', label: 'Both' },
    { value: 'none', label: 'None' },
    { value: 'contraindicated', label: 'Contraindicated' }
  ],
  fallsRisk: [
    { value: 'low', label: 'Low' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'high', label: 'High' },
    { value: 'not-assessed', label: 'Not assessed' }
  ],
  pressureUlcerRisk: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'not-assessed', label: 'Not assessed' }
  ],
  skinIntegrity: [
    { value: 'intact', label: 'Intact' },
    { value: 'at-risk', label: 'At risk' },
    { value: 'damaged', label: 'Damaged' }
  ],
  pressureUlcerGrade: [
    { value: 'none', label: 'None' },
    { value: '1', label: 'Category 1' },
    { value: '2', label: 'Category 2' },
    { value: '3', label: 'Category 3' },
    { value: '4', label: 'Category 4' },
    { value: 'unstageable', label: 'Unstageable' },
    { value: 'deep-tissue-injury', label: 'Deep-tissue injury' }
  ],
  deliriumScreen: [
    { value: 'negative', label: 'Negative' },
    { value: 'possible-delirium', label: 'Possible delirium' },
    { value: 'probable-delirium', label: 'Probable delirium' },
    { value: 'cognitive-impairment', label: 'Cognitive impairment' },
    { value: 'not-assessed', label: 'Not assessed' }
  ],
  nutritionScreen: [
    { value: 'low-risk', label: 'Low risk' },
    { value: 'medium-risk', label: 'Medium risk' },
    { value: 'high-risk', label: 'High risk' },
    { value: 'not-assessed', label: 'Not assessed' }
  ],
  infectionStatus: [
    { value: 'none', label: 'None' },
    { value: 'suspected', label: 'Suspected' },
    { value: 'confirmed', label: 'Confirmed' }
  ],
  isolationStatus: [
    { value: 'none', label: 'None' },
    { value: 'source', label: 'Source isolation' },
    { value: 'protective', label: 'Protective isolation' },
    { value: 'cohort', label: 'Cohort' }
  ],
  responseToTreatment: [
    { value: 'improving', label: 'Improving' },
    { value: 'unchanged', label: 'Unchanged' },
    { value: 'deteriorating', label: 'Deteriorating' },
    { value: 'too-early', label: 'Too early to say' }
  ],
  sepsisScreen: [
    { value: 'positive', label: 'Positive' },
    { value: 'negative', label: 'Negative' },
    { value: 'not-done', label: 'Not done' }
  ],
  arrestCall: [
    { value: 'none', label: 'None' },
    { value: 'cardiac', label: 'Cardiac arrest' },
    { value: 'respiratory', label: 'Respiratory arrest' },
    { value: 'peri-arrest', label: 'Peri-arrest' }
  ],
  organSupport: [
    { value: 'none', label: 'None' },
    { value: 'respiratory', label: 'Respiratory' },
    { value: 'cardiovascular', label: 'Cardiovascular' },
    { value: 'renal', label: 'Renal' },
    { value: 'neurological', label: 'Neurological' },
    { value: 'multiple', label: 'Multiple' }
  ],
  escalationStatus: [
    { value: 'for-full-escalation', label: 'For full escalation' },
    { value: 'for-ward-based-care', label: 'For ward-based care' },
    { value: 'for-hdu', label: 'For HDU' },
    { value: 'for-icu', label: 'For ICU' },
    { value: 'palliative', label: 'Palliative' },
    { value: 'under-review', label: 'Under review' }
  ],
  ceilingOfCare: [
    { value: 'full-active-treatment', label: 'Full active treatment' },
    { value: 'ward-based-care', label: 'Ward-based care' },
    { value: 'non-invasive-ventilation', label: 'Non-invasive ventilation' },
    { value: 'organ-support', label: 'Organ support' },
    { value: 'symptom-control', label: 'Symptom control' }
  ],
  respectStatus: [
    { value: 'in-place', label: 'In place' },
    { value: 'not-in-place', label: 'Not in place' },
    { value: 'under-discussion', label: 'Under discussion' },
    { value: 'not-applicable', label: 'Not applicable' }
  ],
  dnacprStatus: [
    { value: 'for-cpr', label: 'For CPR' },
    { value: 'dnacpr', label: 'DNACPR in place' },
    { value: 'under-discussion', label: 'Under discussion' }
  ],
  jobCategory: [
    { value: 'investigation', label: 'Investigation' },
    { value: 'referral', label: 'Referral' },
    { value: 'prescribing', label: 'Prescribing' },
    { value: 'procedure', label: 'Procedure' },
    { value: 'review', label: 'Review' },
    { value: 'communication', label: 'Communication' },
    { value: 'discharge-planning', label: 'Discharge planning' },
    { value: 'other', label: 'Other' }
  ],
  jobStatus: [
    { value: 'outstanding', label: 'Outstanding' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'done', label: 'Done' },
    { value: 'cancelled', label: 'Cancelled' }
  ],
  consentStatus: [
    { value: 'consented', label: 'Consented' },
    { value: 'declined', label: 'Declined' },
    { value: 'lacks-capacity', label: 'Lacks capacity' },
    { value: 'best-interests', label: 'Best interests' },
    { value: 'not-applicable', label: 'Not applicable' }
  ],
  acuityBand: [
    { value: 'stable', label: 'Stable' },
    { value: 'watch', label: 'Watch' },
    { value: 'escalate', label: 'Escalate' },
    { value: 'critical', label: 'Critical' }
  ],
  priority: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ],
  yesNo: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ]
};

// ----------------------------------------------------------------------
// Section renderers (1 per wizard step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Note identification',
    description:
      'What kind of note this is, who is writing it, and when. The note type determines which components the completeness engine requires.'
  });
  card.appendChild(selectInput({
    label: 'Note type', section: 'header', field: 'noteType', required: true,
    options: OPTIONS.noteType,
    hint: 'Drives the required-component set: an admission clerking requires an examination and investigations; a progress note does not.',
    onChange: () => renderForm()
  }));
  card.appendChild(textInput({
    label: 'Date and time of the note', section: 'header', field: 'noteAt',
    type: 'datetime-local', required: true,
    hint: 'When the clinical events occurred, which may differ from when you write the entry.'
  }));
  card.appendChild(textInput({
    label: 'Author name', section: 'header', field: 'authorName', required: true,
    placeholder: 'e.g. Dr A. Okafor'
  }));
  card.appendChild(selectInput({
    label: 'Author grade', section: 'header', field: 'authorGrade', required: true,
    options: OPTIONS.authorGrade
  }));
  card.appendChild(textInput({
    label: 'Author registration number', section: 'header',
    field: 'authorRegistrationNumber', placeholder: 'GMC / NMC / HCPC / GPhC number'
  }));
  card.appendChild(textInput({
    label: 'Hospital', section: 'header', field: 'hospitalName',
    placeholder: 'e.g. St Thomas’ Hospital'
  }));
  card.appendChild(textInput({
    label: 'Ward', section: 'header', field: 'wardName',
    placeholder: 'e.g. Ward 12B, Acute Medical Unit'
  }));
  card.appendChild(textInput({
    label: 'Bed', section: 'header', field: 'bedNumber', placeholder: 'e.g. Bay 3, Bed 2'
  }));
  card.appendChild(textInput({
    label: 'Parent specialty', section: 'header', field: 'parentSpecialty',
    placeholder: 'Specialty the patient is under'
  }));
  card.appendChild(textInput({
    label: 'Responsible consultant', section: 'header',
    field: 'responsibleConsultantName', placeholder: 'e.g. Dr B. Nakamura'
  }));

  // Note-type-specific fields. Shown only for the type they belong to, so the
  // step stays short for the common progress note.
  const type = state.header.noteType;

  if (type === 'consult') {
    card.appendChild(textInput({
      label: 'Requesting team', section: 'header', field: 'consultRequestingTeam',
      placeholder: 'Team that asked for the opinion'
    }));
    card.appendChild(textArea({
      label: 'Consult question', section: 'header', field: 'consultQuestion',
      placeholder: 'The clinical question the parent team asked.'
    }));
  }

  if (type === 'procedure') {
    card.appendChild(textInput({
      label: 'Procedure performed', section: 'header', field: 'procedurePerformed',
      placeholder: 'e.g. Ascitic drain insertion',
      hint: 'Bedside ward procedures only. Theatre procedures belong in the operation-note form.'
    }));
    card.appendChild(textArea({
      label: 'Procedure detail', section: 'header', field: 'procedureDetail',
      placeholder: 'Technique, site, equipment, and findings.'
    }));
    card.appendChild(selectInput({
      label: 'Consent basis', section: 'header', field: 'procedureConsent',
      options: OPTIONS.procedureConsent
    }));
    card.appendChild(textArea({
      label: 'Procedure complications', section: 'header',
      field: 'procedureComplications', placeholder: 'Complications, or an explicit "none".'
    }));
  }

  if (type === 'transfer') {
    card.appendChild(textInput({
      label: 'Transfer from', section: 'header', field: 'transferFromWard',
      placeholder: 'Ward or hospital the patient is leaving'
    }));
    card.appendChild(textInput({
      label: 'Transfer to', section: 'header', field: 'transferToWard',
      placeholder: 'Ward or hospital the patient is going to'
    }));
    card.appendChild(textArea({
      label: 'Transfer reason', section: 'header', field: 'transferReason',
      placeholder: 'Clinical or operational reason for the transfer.'
    }));
  }

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient and admission',
    description: 'Who the patient is and when the admission episode began. Length of stay is derived from the admission and note timestamps.'
  });
  card.appendChild(textInput({
    label: 'Patient name', section: 'admission', field: 'patientName',
    placeholder: 'Full name as on the wristband'
  }));
  card.appendChild(textInput({
    label: 'NHS number', section: 'admission', field: 'nhsNumber',
    placeholder: 'e.g. 943 476 5919'
  }));
  card.appendChild(textInput({
    label: 'Hospital MRN', section: 'admission', field: 'hospitalMrn',
    placeholder: 'Local medical record number'
  }));
  card.appendChild(textInput({
    label: 'Date of birth', section: 'admission', field: 'birthDate', type: 'date'
  }));
  card.appendChild(selectInput({
    label: 'Sex', section: 'admission', field: 'sex', options: OPTIONS.sex
  }));
  card.appendChild(textInput({
    label: 'Admission date and time', section: 'admission', field: 'admissionAt',
    type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Admission method', section: 'admission', field: 'admissionMethod',
    options: OPTIONS.admissionMethod
  }));
  card.appendChild(textInput({
    label: 'Admitting specialty', section: 'admission', field: 'admittingSpecialty',
    placeholder: 'Specialty the patient was admitted under'
  }));
  card.appendChild(textArea({
    label: 'Reason for admission', section: 'admission', field: 'admissionReason',
    placeholder: 'Presenting problem or reason for admission.'
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Interval history',
    description: 'What has happened since the last entry. Required component — record events, or tick "no interval events" as a deliberate negative.'
  });
  card.appendChild(textArea({
    label: 'Interval history', section: 'interval', field: 'intervalHistory', rows: 4,
    placeholder: 'e.g. Settled overnight. One episode of chest pain at 03:00, ECG unchanged, troponin sent.'
  }));
  card.appendChild(selectInput({
    label: 'No events since the last entry?', section: 'interval',
    field: 'noIntervalEvents', options: OPTIONS.yesNo,
    hint: 'Yes documents the interval-history component as a deliberate negative.'
  }));
  card.appendChild(textArea({
    label: 'Overnight events', section: 'interval', field: 'overnightEvents',
    placeholder: 'As handed over by the night team or nursing staff.'
  }));
  card.appendChild(textArea({
    label: 'Patient-reported symptoms', section: 'interval',
    field: 'patientReportedSymptoms', placeholder: 'In the patient’s own words where possible.'
  }));
  card.appendChild(textArea({
    label: 'Nursing concerns', section: 'interval', field: 'nursingConcerns',
    placeholder: 'Concerns raised by the nursing team.'
  }));
  card.appendChild(numberInput({
    label: 'Pain score', section: 'interval', field: 'painScore',
    min: 0, max: 10, step: 1, placeholder: '0–10'
  }));
  card.appendChild(selectInput({
    label: 'Sleep', section: 'interval', field: 'sleepQuality', options: OPTIONS.sleepQuality
  }));
  card.appendChild(selectInput({
    label: 'Oral intake', section: 'interval', field: 'oralIntake', options: OPTIONS.oralIntake
  }));
  card.appendChild(textInput({
    label: 'Bowels last opened', section: 'interval', field: 'bowelsLastOpened', type: 'date'
  }));
  card.appendChild(selectInput({
    label: 'Mobility', section: 'interval', field: 'mobilityStatus',
    options: OPTIONS.mobilityStatus
  }));
  return card;
}

/** Render the NEWS2 derived readout for step 4. */
function renderNews2Readout() {
  const obs = state.observations;
  const d = deriveNews2(obs);
  const entered = typeof obs.news2Total === 'number' ? obs.news2Total : null;

  if (!d.complete && entered === null) {
    return '<span class="muted">Enter a NEWS2 total, or all seven parameters, to see the aggregate.</span>';
  }

  const parts = [];
  if (d.complete) {
    parts.push(`<div class="readout-line">Derived from the seven parameters: <strong>${d.total}</strong></div>`);
  } else {
    parts.push('<div class="readout-line"><span class="muted">Not all seven parameters recorded — no derived total.</span></div>');
  }
  if (entered !== null) {
    parts.push(`<div class="readout-line">Entered from the chart: <strong>${entered}</strong></div>`);
  }
  if (entered !== null && d.complete && entered !== d.total) {
    parts.push(
      `<div class="readout-line warn">The entered total (${entered}) and the derived total (${d.total}) disagree. ` +
      'The entered value is used; both are recorded so the discrepancy is visible.</div>'
    );
  }
  if (d.anyParameterScoresThree) {
    parts.push('<div class="readout-line warn">A single parameter scores 3 — acuity is at least Watch regardless of the aggregate.</div>');
  }
  return parts.join('');
}

function refreshNews2Readout() {
  const el = document.getElementById('news2-readout');
  if (el) el.innerHTML = renderNews2Readout();
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Observations and NEWS2',
    description: 'The observation set this note refers to. Required component — record a NEWS2 total, or all seven parameters so the engine can derive one.'
  });
  card.appendChild(textInput({
    label: 'Observation time', section: 'observations', field: 'observedAt',
    type: 'datetime-local'
  }));
  const onObs = () => { refreshNews2Readout(); };
  card.appendChild(numberInput({
    label: 'Respiratory rate (per minute)', section: 'observations',
    field: 'respiratoryRate', min: 0, max: 80, step: 1, onChange: onObs
  }));
  card.appendChild(numberInput({
    label: 'Oxygen saturation (%)', section: 'observations',
    field: 'oxygenSaturation', min: 0, max: 100, step: 1, onChange: onObs
  }));
  card.appendChild(selectInput({
    label: 'SpO2 scale', section: 'observations', field: 'spo2Scale',
    options: OPTIONS.spo2Scale, onChange: onObs,
    hint: 'Scale 2 only for a prescribed target of 88–92% in confirmed hypercapnic respiratory failure.'
  }));
  card.appendChild(selectInput({
    label: 'Air or oxygen', section: 'observations', field: 'oxygenDelivery',
    options: OPTIONS.oxygenDelivery, onChange: onObs
  }));
  card.appendChild(numberInput({
    label: 'Oxygen flow (L/min)', section: 'observations',
    field: 'oxygenFlowLitresPerMinute', min: 0, max: 100, step: 0.5
  }));
  card.appendChild(numberInput({
    label: 'Systolic blood pressure (mmHg)', section: 'observations',
    field: 'systolicBloodPressure', min: 0, max: 300, step: 1, onChange: onObs
  }));
  card.appendChild(numberInput({
    label: 'Diastolic blood pressure (mmHg)', section: 'observations',
    field: 'diastolicBloodPressure', min: 0, max: 200, step: 1,
    hint: 'Recorded for completeness; not a NEWS2 parameter.'
  }));
  card.appendChild(numberInput({
    label: 'Pulse (per minute)', section: 'observations', field: 'pulseRate',
    min: 0, max: 300, step: 1, onChange: onObs
  }));
  card.appendChild(selectInput({
    label: 'Consciousness (ACVPU)', section: 'observations', field: 'acvpu',
    options: OPTIONS.acvpu, onChange: onObs
  }));
  card.appendChild(numberInput({
    label: 'Temperature (°C)', section: 'observations', field: 'temperatureCelsius',
    min: 20, max: 45, step: 0.1, onChange: onObs
  }));
  card.appendChild(numberInput({
    label: 'NEWS2 total from the chart', section: 'observations', field: 'news2Total',
    min: 0, max: 20, step: 1, onChange: onObs,
    hint: 'Optional. When present this wins over the derived total; both are recorded.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'NEWS2 aggregate', id: 'news2-readout', render: renderNews2Readout
  }));
  card.appendChild(selectInput({
    label: 'NEWS2 trend', section: 'observations', field: 'news2Trend',
    options: OPTIONS.news2Trend,
    hint: 'A worsening trend raises the acuity band to at least Watch.'
  }));
  card.appendChild(selectInput({
    label: 'Does NEWS2 apply to this patient?', section: 'observations',
    field: 'news2Applicable', options: OPTIONS.yesNo,
    hint: 'NEWS2 is not validated in pregnancy, under 16, or in spinal-cord injury.'
  }));
  card.appendChild(textInput({
    label: 'Reason NEWS2 was not used', section: 'observations',
    field: 'news2NotApplicableReason', placeholder: 'Only if NEWS2 does not apply.'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Examination',
    description: 'Findings by system. Required for an admission clerking, a consult, and a procedure note; recommended otherwise.'
  });
  const fields = [
    ['general', 'General appearance'],
    ['cardiovascular', 'Cardiovascular'],
    ['respiratory', 'Respiratory'],
    ['abdominal', 'Abdominal'],
    ['neurological', 'Neurological'],
    ['musculoskeletal', 'Musculoskeletal'],
    ['skinAndWounds', 'Skin and wounds'],
    ['linesAndDrains', 'Lines and drains'],
    ['other', 'Other findings']
  ];
  for (const [field, label] of fields) {
    card.appendChild(textArea({ label, section: 'examination', field, rows: 2 }));
  }
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Investigations reviewed',
    description: 'One row per result you looked at. An abnormal result left unactioned raises a high-priority flag and lifts the acuity band to Escalate.'
  });
  card.appendChild(selectInput({
    label: 'No investigations reviewed?', section: 'investigations',
    field: 'noInvestigationsReviewed', options: OPTIONS.yesNo,
    hint: 'Yes documents the investigations component as a deliberate negative.'
  }));
  card.appendChild(rowList({
    section: 'investigations', field: 'rows',
    legend: 'Investigation', addLabel: 'Add an investigation',
    emptyText: 'No investigations added yet.',
    makeRow: emptyInvestigationRow,
    columns: [
      { field: 'testName', label: 'Test name', placeholder: 'e.g. C-reactive protein' },
      { field: 'category', label: 'Category', type: 'select', options: OPTIONS.investigationCategory },
      { field: 'requestedDate', label: 'Requested', type: 'date' },
      { field: 'resultDate', label: 'Resulted', type: 'date' },
      { field: 'resultSummary', label: 'Result', type: 'textarea', placeholder: 'e.g. CRP 84, down from 120.' },
      { field: 'abnormal', label: 'Abnormal?', type: 'select', options: OPTIONS.yesNo },
      { field: 'actioned', label: 'Actioned?', type: 'select', options: OPTIONS.yesNo },
      { field: 'actionTaken', label: 'Action taken', type: 'textarea' }
    ]
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Problem list',
    description: 'The spine of the problem-oriented record. Required component — at least one problem.'
  });
  card.appendChild(rowList({
    section: 'problems', field: 'rows',
    legend: 'Problem', addLabel: 'Add a problem',
    emptyText: 'No problems added yet. At least one is required.',
    makeRow: emptyProblemRow,
    columns: [
      { field: 'problem', label: 'Problem', placeholder: 'e.g. Community-acquired pneumonia' },
      { field: 'category', label: 'Category', type: 'select', options: OPTIONS.problemCategory },
      { field: 'status', label: 'Status', type: 'select', options: OPTIONS.problemStatus },
      { field: 'priority', label: 'Priority', type: 'select', options: OPTIONS.priority },
      { field: 'onsetDate', label: 'Onset', type: 'date' },
      { field: 'progressCommentary', label: 'Progress', type: 'textarea', placeholder: 'Progress since the previous note.' }
    ]
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Medications and prescribing',
    description: 'Prescribing changes made on this entry. Required component — record changes, or tick "no medication changes".'
  });
  card.appendChild(selectInput({
    label: 'No medication changes?', section: 'medications',
    field: 'noMedicationChanges', options: OPTIONS.yesNo,
    hint: 'Yes documents the medications component as a deliberate negative.'
  }));
  card.appendChild(selectInput({
    label: 'Allergy status checked?', section: 'medications', field: 'allergyChecked',
    options: OPTIONS.yesNo,
    hint: 'Recording a prescribing change without this raises a high-priority flag.'
  }));
  card.appendChild(selectInput({
    label: 'Medicines reconciliation', section: 'medications',
    field: 'medicinesReconciliationStatus', options: OPTIONS.medicinesReconciliation
  }));
  card.appendChild(selectInput({
    label: 'Antimicrobial review', section: 'medications',
    field: 'antimicrobialReviewStatus', options: OPTIONS.antimicrobialReview,
    hint: 'NICE NG15 expects a documented review at 48–72 hours. "Overdue" raises a flag.'
  }));
  card.appendChild(rowList({
    section: 'medications', field: 'rows',
    legend: 'Medication change', addLabel: 'Add a medication change',
    emptyText: 'No medication changes added yet.',
    makeRow: emptyMedicationRow,
    columns: [
      { field: 'drugName', label: 'Drug', placeholder: 'Generic name where possible' },
      { field: 'action', label: 'Action', type: 'select', options: OPTIONS.medicationAction },
      { field: 'dose', label: 'Dose', placeholder: 'e.g. 500 mg' },
      { field: 'route', label: 'Route', type: 'select', options: OPTIONS.medicationRoute },
      { field: 'frequency', label: 'Frequency', placeholder: 'e.g. three times a day' },
      { field: 'indication', label: 'Indication', placeholder: 'Required for every antimicrobial' },
      { field: 'isAntimicrobial', label: 'Antimicrobial?', type: 'select', options: OPTIONS.yesNo },
      { field: 'reviewDate', label: 'Review date', type: 'date' },
      { field: 'notes', label: 'Notes', type: 'textarea' }
    ]
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Risk assessments',
    description: 'The mandatory inpatient risk assessments. VTE status alone documents this component — it is the only one NICE mandates for every inpatient.'
  });
  card.appendChild(selectInput({
    label: 'VTE risk assessment', section: 'risks', field: 'vteStatus',
    options: OPTIONS.vteStatus,
    hint: 'NICE NG89. "Not done" raises a high-priority flag.'
  }));
  card.appendChild(selectInput({
    label: 'VTE prophylaxis', section: 'risks', field: 'vteProphylaxis',
    options: OPTIONS.vteProphylaxis
  }));
  card.appendChild(textArea({
    label: 'VTE notes', section: 'risks', field: 'vteNotes',
    placeholder: 'Including any contraindication to prophylaxis.'
  }));
  card.appendChild(selectInput({
    label: 'Falls risk', section: 'risks', field: 'fallsRisk', options: OPTIONS.fallsRisk
  }));
  card.appendChild(textArea({
    label: 'Falls interventions', section: 'risks', field: 'fallsInterventions', rows: 2
  }));
  card.appendChild(selectInput({
    label: 'Pressure-ulcer risk', section: 'risks', field: 'pressureUlcerRisk',
    options: OPTIONS.pressureUlcerRisk
  }));
  card.appendChild(selectInput({
    label: 'Skin integrity', section: 'risks', field: 'skinIntegrity',
    options: OPTIONS.skinIntegrity
  }));
  card.appendChild(selectInput({
    label: 'Pressure-ulcer category', section: 'risks', field: 'pressureUlcerGrade',
    options: OPTIONS.pressureUlcerGrade
  }));
  card.appendChild(textInput({
    label: 'Pressure-damage sites', section: 'risks', field: 'pressureUlcerSites',
    placeholder: 'e.g. sacrum, left heel'
  }));
  card.appendChild(selectInput({
    label: 'Delirium screen', section: 'risks', field: 'deliriumScreen',
    options: OPTIONS.deliriumScreen
  }));
  card.appendChild(numberInput({
    label: '4AT score', section: 'risks', field: 'delirium4atScore',
    min: 0, max: 12, step: 1, hint: '0–12. The full instrument lives in the 4AT form.'
  }));
  card.appendChild(textArea({
    label: 'Delirium notes', section: 'risks', field: 'deliriumNotes', rows: 2
  }));
  card.appendChild(selectInput({
    label: 'Nutrition screen', section: 'risks', field: 'nutritionScreen',
    options: OPTIONS.nutritionScreen
  }));
  card.appendChild(numberInput({
    label: 'MUST score', section: 'risks', field: 'mustScore', min: 0, max: 6, step: 1
  }));
  card.appendChild(textArea({
    label: 'Nutrition plan', section: 'risks', field: 'nutritionPlan', rows: 2
  }));
  card.appendChild(selectInput({
    label: 'Infection status', section: 'risks', field: 'infectionStatus',
    options: OPTIONS.infectionStatus
  }));
  card.appendChild(selectInput({
    label: 'Isolation status', section: 'risks', field: 'isolationStatus',
    options: OPTIONS.isolationStatus,
    hint: 'Must travel with a transfer note.'
  }));
  card.appendChild(textInput({
    label: 'Organism', section: 'risks', field: 'organism',
    placeholder: 'Identified or suspected'
  }));
  card.appendChild(selectInput({
    label: 'Safeguarding concern?', section: 'risks', field: 'safeguardingConcern',
    options: OPTIONS.yesNo
  }));
  card.appendChild(textArea({
    label: 'Safeguarding notes', section: 'risks', field: 'safeguardingNotes', rows: 2
  }));
  card.appendChild(selectInput({
    label: 'Safeguarding referral made?', section: 'risks',
    field: 'safeguardingReferralMade', options: OPTIONS.yesNo
  }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Assessment and impression',
    description: 'Your clinical impression, and the deterioration markers that drive the acuity band. Required component: an impression.'
  });
  card.appendChild(textArea({
    label: 'Clinical impression', section: 'assessment', field: 'clinicalImpression',
    rows: 4, placeholder: 'What you think is going on.',
    hint: 'Required. Its absence forces an Incomplete grade regardless of the rest.'
  }));
  card.appendChild(textArea({
    label: 'Differential diagnosis', section: 'assessment',
    field: 'differentialDiagnosis', rows: 3
  }));
  card.appendChild(selectInput({
    label: 'Response to treatment', section: 'assessment', field: 'responseToTreatment',
    options: OPTIONS.responseToTreatment
  }));
  card.appendChild(selectInput({
    label: 'New oxygen requirement?', section: 'assessment',
    field: 'newOxygenRequirement', options: OPTIONS.yesNo,
    hint: 'Yes raises the acuity band to Escalate.'
  }));
  card.appendChild(selectInput({
    label: 'New confusion?', section: 'assessment', field: 'newConfusion',
    options: OPTIONS.yesNo,
    hint: 'With an ACVPU below Alert, raises the acuity band to Escalate.'
  }));
  card.appendChild(selectInput({
    label: 'Sepsis screen', section: 'assessment', field: 'sepsisScreen',
    options: OPTIONS.sepsisScreen,
    hint: 'A positive screen raises the acuity band to Escalate (NICE NG51).'
  }));
  card.appendChild(selectInput({
    label: 'Arrest call', section: 'assessment', field: 'arrestCall',
    options: OPTIONS.arrestCall,
    hint: 'Anything other than "none" raises the acuity band to Critical.'
  }));
  card.appendChild(selectInput({
    label: 'Critical-care referral made?', section: 'assessment',
    field: 'criticalCareReferral', options: OPTIONS.yesNo,
    hint: 'Yes raises the acuity band to Critical.'
  }));
  card.appendChild(selectInput({
    label: 'New organ support', section: 'assessment', field: 'newOrganSupport',
    options: OPTIONS.organSupport,
    hint: 'Anything other than "none" raises the acuity band to Critical.'
  }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Plan, jobs and escalation',
    description: 'What happens next, and the limits of treatment. Required components: a plan (narrative or at least one job), and an escalation status with a ceiling of care.'
  });
  card.appendChild(textArea({
    label: 'Management plan', section: 'planning', field: 'plan', rows: 4,
    placeholder: 'e.g. Continue IV co-amoxiclav, day 3 of 5. Repeat bloods in the morning. Physiotherapy review.',
    hint: 'Required. A plan or at least one job below documents this component.'
  }));
  card.appendChild(rowList({
    section: 'planning', field: 'jobs',
    legend: 'Job', addLabel: 'Add a job',
    emptyText: 'No jobs added yet.',
    makeRow: emptyJobRow,
    columns: [
      { field: 'job', label: 'Job', placeholder: 'e.g. Chase the blood-culture result' },
      { field: 'category', label: 'Category', type: 'select', options: OPTIONS.jobCategory },
      { field: 'owner', label: 'Owner', placeholder: 'Person or team responsible' },
      { field: 'priority', label: 'Priority', type: 'select', options: OPTIONS.priority },
      { field: 'dueAt', label: 'Due by', type: 'datetime-local' },
      { field: 'status', label: 'Status', type: 'select', options: OPTIONS.jobStatus }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Escalation status', section: 'planning', field: 'escalationStatus',
    options: OPTIONS.escalationStatus
  }));
  card.appendChild(textArea({
    label: 'Escalation action taken', section: 'planning', field: 'escalationAction',
    rows: 2,
    placeholder: 'e.g. Discussed with the medical registrar at 14:20; critical-care outreach reviewed.',
    hint: 'Leaving this blank at an Escalate or Critical acuity band raises a high-priority flag.'
  }));
  card.appendChild(selectInput({
    label: 'Ceiling of care', section: 'planning', field: 'ceilingOfCare',
    options: OPTIONS.ceilingOfCare,
    hint: 'Required alongside the escalation status to document this component.'
  }));
  card.appendChild(selectInput({
    label: 'ReSPECT plan', section: 'planning', field: 'respectStatus',
    options: OPTIONS.respectStatus
  }));
  card.appendChild(selectInput({
    label: 'Resuscitation status', section: 'planning', field: 'dnacprStatus',
    options: OPTIONS.dnacprStatus
  }));
  card.appendChild(selectInput({
    label: 'Senior review needed?', section: 'planning', field: 'seniorReviewNeeded',
    options: OPTIONS.yesNo
  }));
  card.appendChild(textInput({
    label: 'Senior reviewer', section: 'planning', field: 'seniorReviewBy',
    placeholder: 'Name and grade of the senior who reviewed'
  }));
  card.appendChild(textInput({
    label: 'Estimated discharge date', section: 'planning',
    field: 'estimatedDischargeDate', type: 'date'
  }));
  card.appendChild(textArea({
    label: 'Discharge-planning notes', section: 'planning',
    field: 'dischargePlanningNotes', rows: 3,
    placeholder: 'Destination, package of care, equipment, and outstanding blockers.'
  }));
  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Communication and sign-off',
    description: 'Who was told what, the capacity and consent basis, and your attestation. You may override the computed acuity band here, but only with a reason.'
  });
  card.appendChild(textArea({
    label: 'Family / next-of-kin communication', section: 'signOff',
    field: 'familyCommunication', rows: 3,
    placeholder: 'What was discussed, with whom, and when.'
  }));
  card.appendChild(textArea({
    label: 'Patient communication', section: 'signOff', field: 'patientCommunication',
    rows: 3, placeholder: 'What was discussed with the patient.'
  }));
  card.appendChild(textArea({
    label: 'Team handover', section: 'signOff', field: 'teamHandover', rows: 3,
    placeholder: 'Handover to the incoming team.'
  }));
  card.appendChild(selectInput({
    label: 'Consent basis', section: 'signOff', field: 'consentStatus',
    options: OPTIONS.consentStatus
  }));
  card.appendChild(selectInput({
    label: 'Capacity assessed?', section: 'signOff', field: 'capacityAssessed',
    options: OPTIONS.yesNo,
    hint: 'Required when the consent basis is "lacks capacity" or "best interests".'
  }));
  card.appendChild(textArea({
    label: 'Capacity notes', section: 'signOff', field: 'capacityNotes', rows: 2
  }));
  card.appendChild(readOnlyReadout({
    label: 'Live grading', id: 'live-summary-readout', render: renderLiveSummary
  }));
  card.appendChild(selectInput({
    label: 'Override the computed acuity band', section: 'signOff',
    field: 'authorOverrideAcuity', options: OPTIONS.acuityBand,
    hint: 'Optional. The computed band is kept alongside the final band so the override is visible in audit.'
  }));
  card.appendChild(textArea({
    label: 'Reason for the override', section: 'signOff',
    field: 'authorOverrideReason', rows: 2,
    placeholder: 'Required whenever you override the band.',
    hint: 'An override without a reason is ignored.'
  }));
  card.appendChild(textArea({
    label: 'Attestation', section: 'signOff', field: 'attestationText', rows: 2,
    placeholder: 'e.g. I confirm this entry is an accurate contemporaneous record of my review.'
  }));
  card.appendChild(textInput({
    label: 'Electronic signature', section: 'signOff', field: 'electronicSignature',
    placeholder: 'Type your full name to sign'
  }));
  return card;
}

// ----------------------------------------------------------------------
// Live readout
// ----------------------------------------------------------------------

/** Render the live completeness + acuity summary. */
function renderLiveSummary() {
  const g = assess(state);
  const statusBadge =
    `<span class="risk-badge ${statusClass(g.status)}">${esc(statusLabel(g.status))}</span>`;
  const acuityBadge =
    `<span class="risk-badge ${acuityClass(g.acuityBand)}">${esc(acuityLabel(g.acuityBand))}</span>`;
  const pctCls = g.completenessPercent === 100 ? 'ok' : 'warn';
  const typeNote = state.header.noteType
    ? `<span class="muted"> for a ${esc(noteTypeLabel(state.header.noteType).toLowerCase())}</span>`
    : '<span class="muted"> (pick a note type on step 1 to fix the required set)</span>';

  return (
    `<div class="readout-line">Completeness ${statusBadge} &nbsp; ` +
    `<strong class="${pctCls}">${g.completenessPercent}%</strong> ` +
    `<span class="muted">(${g.documentedRequired} of ${g.totalRequired} required components documented)</span>` +
    `${typeNote}</div>` +
    `<div class="readout-line">Acuity ${acuityBadge}` +
    (g.acuityOverridden
      ? ` <span class="muted">(overridden; computed ${esc(acuityLabel(g.computedAcuityBand))})</span>`
      : '') +
    (g.news2Total !== null ? ` <span class="muted">NEWS2 ${g.news2Total}</span>` : '') +
    `</div>` +
    `<div class="readout-line"><span class="muted">${g.flags.length} safety flag${g.flags.length === 1 ? '' : 's'}</span></div>`
  );
}

function refreshLiveSummary() {
  const live = document.getElementById('live-summary-readout');
  if (live) live.innerHTML = renderLiveSummary();
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered. Slots backed
// by a child collection count as answered when the collection is non-empty.
const STEP_SLOTS = {
  header: [
    ['noteType'], ['noteAt'], ['authorName'], ['authorGrade'],
    ['hospitalName', 'wardName', 'bedNumber'],
    ['parentSpecialty', 'responsibleConsultantName']
  ],
  admission: [
    ['patientName', 'nhsNumber', 'hospitalMrn'],
    ['birthDate', 'sex'],
    ['admissionAt', 'admissionMethod', 'admittingSpecialty'],
    ['admissionReason']
  ],
  interval: [
    ['intervalHistory', 'noIntervalEvents'],
    ['overnightEvents', 'patientReportedSymptoms', 'nursingConcerns'],
    ['painScore', 'sleepQuality', 'oralIntake', 'bowelsLastOpened', 'mobilityStatus']
  ],
  observations: [
    ['respiratoryRate', 'oxygenSaturation', 'oxygenDelivery'],
    ['systolicBloodPressure', 'pulseRate', 'acvpu', 'temperatureCelsius'],
    ['news2Total', 'news2Trend']
  ],
  examination: [
    ['general', 'cardiovascular', 'respiratory', 'abdominal', 'neurological',
     'musculoskeletal', 'skinAndWounds', 'linesAndDrains', 'other']
  ],
  investigations: [['rows', 'noInvestigationsReviewed']],
  problems: [['rows']],
  medications: [
    ['rows', 'noMedicationChanges'],
    ['allergyChecked', 'medicinesReconciliationStatus', 'antimicrobialReviewStatus']
  ],
  risks: [
    ['vteStatus', 'vteProphylaxis'],
    ['fallsRisk', 'pressureUlcerRisk', 'skinIntegrity'],
    ['deliriumScreen', 'nutritionScreen'],
    ['infectionStatus', 'isolationStatus', 'safeguardingConcern']
  ],
  assessment: [
    ['clinicalImpression'],
    ['differentialDiagnosis', 'responseToTreatment'],
    ['newOxygenRequirement', 'newConfusion', 'sepsisScreen', 'arrestCall',
     'criticalCareReferral', 'newOrganSupport']
  ],
  planning: [
    ['plan', 'jobs'],
    ['escalationStatus', 'ceilingOfCare', 'escalationAction'],
    ['respectStatus', 'dnacprStatus', 'seniorReviewNeeded', 'seniorReviewBy'],
    ['estimatedDischargeDate', 'dischargePlanningNotes']
  ],
  signOff: [
    ['familyCommunication', 'patientCommunication', 'teamHandover'],
    ['consentStatus', 'capacityAssessed'],
    ['attestationText', 'electronicSignature']
  ]
};

function isAnswered(section, field) {
  const v = state[section][field];
  if (Array.isArray(v)) return v.length > 0;
  return v !== null && v !== undefined && String(v).trim() !== '';
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
    status, completenessPercent, acuityBand, computedAcuityBand, acuityOverridden,
    news2Total, componentStatuses, documentedRequired, totalRequired,
    firedRules, flags, timestamp
  } = lastResult;

  const componentRows = componentStatuses.map((c) => `
    <tr>
      <th scope="row">${esc(c.label)}${c.required ? '' : ' <span class="muted">(recommended)</span>'}</th>
      <td>
        <span class="flag-badge ${c.present ? 'flag-no' : 'flag-yes'}">
          ${c.present ? 'Documented' : 'Absent'}
        </span>
      </td>
    </tr>
  `).join('');

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

  const acuityRules = firedRules.filter((r) => r.engine === 'acuity');
  const acuityList = acuityRules.length === 0
    ? `<p class="muted">No acuity rule fired — the band defaults to Stable. Note that a note with no observations recorded fires no NEWS2 rule at all.</p>`
    : `
      <ul class="flags">
        ${acuityRules.map((r) => `
          <li>
            <span class="flag-priority">${esc(acuityLabel(r.band).toUpperCase())}</span>
            <span class="flag-category">${esc(r.id)}</span>
            <span class="flag-message">${esc(r.description)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const noteType = state.header.noteType;
  const typeText = noteType
    ? `a ${esc(noteTypeLabel(noteType).toLowerCase())}`
    : 'this note';

  const statusAdvice =
    status === 'complete'
      ? `<p>All ${totalRequired} components required for ${typeText} are documented. The entry stands alone — another clinician can safely continue care. A <strong>Complete</strong> grade means the record is well documented, not that the clinical care was correct.</p>`
      : status === 'partial'
      ? `<p>The header, the impression, and the plan are documented, but one or more other required components are missing. The entry is usable but has documentation gaps — complete the outstanding components below.</p>`
      : `<p>The <strong>header, the impression, or the plan is missing</strong>, or fewer than half the required components are documented. The entry cannot safely stand alone. Record the missing components before it is used to continue care.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Inpatient Clinical Note Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}${noteType ? ` — ${esc(noteTypeLabel(noteType))}` : ''}</p>
      </header>

      <div class="risk-banner ${statusClass(status)}">
        <div>
          <span class="risk-banner-label">Completeness status</span>
          <span class="risk-banner-value">${esc(statusLabel(status))}</span>
        </div>
        <span class="risk-badge ${statusClass(status)}">${completenessPercent}% complete</span>
      </div>

      <div class="risk-banner ${acuityClass(acuityBand)}">
        <div>
          <span class="risk-banner-label">Clinical acuity band</span>
          <span class="risk-banner-value">${esc(acuityLabel(acuityBand))}</span>
        </div>
        <span class="risk-badge ${acuityClass(acuityBand)}">${news2Total !== null ? `NEWS2 ${news2Total}` : 'NEWS2 not recorded'}</span>
      </div>

      ${acuityOverridden
        ? `<p class="warn">The author overrode the computed band of <strong>${esc(acuityLabel(computedAcuityBand))}</strong> to <strong>${esc(acuityLabel(acuityBand))}</strong>. Both are recorded.</p>`
        : ''}

      <h3>Note components</h3>
      <p><strong>${documentedRequired}</strong> of ${totalRequired} components required for ${typeText} are documented.</p>
      <table class="subscales">
        <thead>
          <tr><th scope="col">Component</th><th scope="col">Status</th></tr>
        </thead>
        <tbody>${componentRows}</tbody>
      </table>

      <h3>Completeness</h3>
      ${statusAdvice}

      <h3>Acuity rules fired (${acuityRules.length})</h3>
      ${acuityList}

      <h3>Safety flags (${flags.length})</h3>
      ${flagsList}

      <p class="muted">
        This report grades the completeness of the written record and transcribes
        the published NEWS2 escalation thresholds into a band. It is not a
        diagnosis, not a deterioration prediction, and not a substitute for
        clinical judgement.
      </p>

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
  lastResult = assess(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh inpatient clinical note?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const rep = document.getElementById('report');
  if (rep) rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  refreshLiveSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'header',         title: 'Note' },
  { step: 2,  section: 'admission',      title: 'Patient' },
  { step: 3,  section: 'interval',       title: 'Interval' },
  { step: 4,  section: 'observations',   title: 'Observations' },
  { step: 5,  section: 'examination',    title: 'Examination' },
  { step: 6,  section: 'investigations', title: 'Investigations' },
  { step: 7,  section: 'problems',       title: 'Problems' },
  { step: 8,  section: 'medications',    title: 'Medications' },
  { step: 9,  section: 'risks',          title: 'Risks' },
  { step: 10, section: 'assessment',     title: 'Impression' },
  { step: 11, section: 'planning',       title: 'Plan' },
  { step: 12, section: 'signOff',        title: 'Sign-off' }
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
}

function setFieldError(id, message) {
  const el = document.getElementById(`${id}-error`);
  if (el) el.textContent = message;
  const input = document.getElementById(id);
  if (input) input.setAttribute('aria-invalid', 'true');
}

/**
 * Cross-field validation from spec §8. Returns the same
 * `{ id, message }` shape as the required-field pass.
 */
function crossFieldErrors() {
  const errors = [];

  const noteAt = state.header.noteAt;
  const admissionAt = state.admission.admissionAt;
  if (noteAt && admissionAt && new Date(noteAt) < new Date(admissionAt)) {
    errors.push({
      id: 'header-noteAt',
      message: 'The note date and time cannot precede the admission date and time'
    });
  }

  const edd = state.planning.estimatedDischargeDate;
  if (edd && noteAt && new Date(edd) < new Date(noteAt.slice(0, 10))) {
    errors.push({
      id: 'planning-estimatedDischargeDate',
      message: 'The estimated discharge date cannot precede the date of the note'
    });
  }

  if (state.signOff.authorOverrideAcuity && !String(state.signOff.authorOverrideReason).trim()) {
    errors.push({
      id: 'signOff-authorOverrideReason',
      message: 'A reason is required when you override the acuity band'
    });
  }

  if (state.header.noteType === 'procedure' && !String(state.header.procedurePerformed).trim()) {
    errors.push({
      id: 'header-procedurePerformed',
      message: 'A procedure note must record the procedure performed'
    });
  }

  if (state.header.noteType === 'consult' && !String(state.header.consultQuestion).trim()) {
    errors.push({
      id: 'header-consultQuestion',
      message: 'A consult note must record the consult question'
    });
  }

  for (const e of errors) setFieldError(e.id, e.message);
  return errors;
}

function validateForm() {
  const errors = [];
  const form = document.getElementById('assessment-form');
  if (!form) return errors;
  const required = form.querySelectorAll(
    'input[data-required], select[data-required], textarea[data-required]'
  );
  const seen = new Set();
  required.forEach((input) => {
    const id = input.id;
    if (seen.has(id)) return;
    seen.add(id);
    const value = (input.value || '').trim();
    if (!value) {
      const labelEl = form.querySelector(`label[for="${id}"]`);
      const labelText = labelEl
        ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim()
        : id;
      errors.push({ id, message: `${labelText} is required` });
      setFieldError(id, `${labelText} is required`);
    } else {
      clearFieldError(id);
    }
  });

  const all = errors.concat(crossFieldErrors());
  renderErrorSummary(all);
  return all;
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
  if (!host) return;
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
  refreshLiveSummary();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
