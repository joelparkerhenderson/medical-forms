import { calculateClavienDindo, gradeBadgeClass, gradeLabel, gradeShortLabel } from './clavien-dindo-grader.js';
import { clavienDindoRuleByGrade, clavienDindoRules } from './clavien-dindo-rules.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateDurationMinutes, emptyAssessment } from './types.js';

// Post-Operative Report - clinician wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary plus a step-list table-of-contents reflect how many
// fields have been answered per section. Submission runs the pure
// Clavien-Dindo grading engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'post-operative-report.front-end-form-with-html.v1';
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
    const v = parsed && parsed[key];
    if (Array.isArray(fresh[key])) {
      fresh[key] = Array.isArray(v) ? v : fresh[key];
    } else if (v && typeof v === 'object') {
      fresh[key] = { ...fresh[key], ...v };
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
  slug: 'post-operative-report',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the report.</p>';
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
 * Re-runs derived values, progress, and conditional visibility after
 * each change.
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
  state.procedureDetails.durationMinutes = calculateDurationMinutes(
    state.procedureDetails.startTime,
    state.procedureDetails.endTime
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
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;

  const input = wrapper.querySelector('input');
  input.setAttribute('aria-describedby', `${id}-error`);
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
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error">
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
  legend.textContent = opts.label;
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
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}>
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
  legend.innerHTML = `
    <span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>
    <span class="section-title">${esc(opts.title)}</span>
    ${desc}
  `;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Repeating-list editors
// ----------------------------------------------------------------------

function teamMemberEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.surgicalTeam.additionalMembers;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No additional team members.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row team-row';
      r.innerHTML = `
        <div class="list-grid team-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Dr A. Patel">
          </label>
          <label class="list-cell">
            <span>Role</span>
            <input type="text" class="text-input" data-key="role" value="${esc(row.role)}" placeholder="e.g. Assistant surgeon">
          </label>
          <label class="list-cell">
            <span>Grade</span>
            <input type="text" class="text-input" data-key="grade" value="${esc(row.grade)}" placeholder="e.g. ST6, Consultant">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove team member">&times;</button>
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
    addBtn.textContent = '+ Add team member';
    addBtn.addEventListener('click', () => {
      rows.push({ name: '', role: '', grade: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

function specimenEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.specimensImplants.specimens;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No specimens recorded.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row specimen-row';
      r.innerHTML = `
        <div class="list-grid specimen-grid">
          <label class="list-cell">
            <span>Description</span>
            <input type="text" class="text-input" data-key="description" value="${esc(row.description)}" placeholder="e.g. Appendix">
          </label>
          <label class="list-cell">
            <span>Site</span>
            <input type="text" class="text-input" data-key="site" value="${esc(row.site)}" placeholder="e.g. RIF">
          </label>
          <label class="list-cell">
            <span>Disposition</span>
            <input type="text" class="text-input" data-key="disposition" value="${esc(row.disposition)}" placeholder="e.g. Histology in formalin">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove specimen">&times;</button>
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
    addBtn.textContent = '+ Add specimen';
    addBtn.addEventListener('click', () => {
      rows.push({ description: '', site: '', disposition: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

function implantEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.specimensImplants.implants;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No implants recorded.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row implant-row';
      r.innerHTML = `
        <div class="list-grid implant-grid">
          <label class="list-cell">
            <span>Description</span>
            <input type="text" class="text-input" data-key="description" value="${esc(row.description)}" placeholder="e.g. Hip prosthesis">
          </label>
          <label class="list-cell">
            <span>Manufacturer</span>
            <input type="text" class="text-input" data-key="manufacturer" value="${esc(row.manufacturer)}" placeholder="e.g. Stryker">
          </label>
          <label class="list-cell">
            <span>Lot / Serial</span>
            <input type="text" class="text-input" data-key="lotNumber" value="${esc(row.lotNumber)}" placeholder="e.g. LOT-12345">
          </label>
          <label class="list-cell">
            <span>Site</span>
            <input type="text" class="text-input" data-key="site" value="${esc(row.site)}" placeholder="e.g. Right hip">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove implant">&times;</button>
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
    addBtn.textContent = '+ Add implant';
    addBtn.addEventListener('click', () => {
      rows.push({ description: '', manufacturer: '', lotNumber: '', site: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

function complicationEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  const gradeOptions = clavienDindoRules.map((r) => ({
    value: r.grade,
    label: `${r.label} — ${r.shortLabel}`
  }));

  function rerender() {
    const rows = state.complicationsAssessment.complications;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No complications recorded.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row complication-row';
      const gradeOptionsHtml = [
        `<option value="">— Select grade —</option>`,
        ...gradeOptions.map((o) =>
          `<option value="${esc(o.value)}"${o.value === row.grade ? ' selected' : ''}>${esc(o.label)}</option>`
        )
      ].join('');
      r.innerHTML = `
        <div class="list-grid complication-grid">
          <label class="list-cell">
            <span>Description</span>
            <input type="text" class="text-input" data-key="description" value="${esc(row.description)}" placeholder="e.g. Wound infection">
          </label>
          <label class="list-cell">
            <span>Clavien-Dindo grade</span>
            <select class="select" data-key="grade">${gradeOptionsHtml}</select>
          </label>
          <label class="list-cell">
            <span>Intervention</span>
            <input type="text" class="text-input" data-key="interventionRequired" value="${esc(row.interventionRequired)}" placeholder="e.g. IV antibiotics">
          </label>
          <label class="list-cell">
            <span>Timing</span>
            <input type="text" class="text-input" data-key="timing" value="${esc(row.timing)}" placeholder="e.g. POD 2">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove complication">&times;</button>
        </div>
      `;
      r.querySelectorAll('input, select').forEach((inp) => {
        const evt = inp.tagName === 'SELECT' ? 'change' : 'input';
        inp.addEventListener(evt, () => {
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
    addBtn.textContent = '+ Add complication';
    addBtn.addEventListener('click', () => {
      rows.push({ description: '', grade: '', interventionRequired: '', timing: '' });
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
    title: 'Patient Details',
    description: 'Identifying patient information and baseline status.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'patientDetails', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'patientDetails', field: 'lastName', required: true }));
  card.appendChild(grid);

  const id2 = document.createElement('div');
  id2.className = 'two-col';
  id2.appendChild(textInput({
    label: 'Date of Birth', section: 'patientDetails', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  id2.appendChild(textInput({
    label: 'Medical record number (MRN)', section: 'patientDetails', field: 'mrn'
  }));
  card.appendChild(id2);

  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'patientDetails', field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  const meas = document.createElement('div');
  meas.className = 'two-col';
  meas.appendChild(textInput({
    label: 'Weight', section: 'patientDetails', field: 'weight',
    type: 'number', min: 0, max: 400, unit: 'kg'
  }));
  meas.appendChild(textInput({
    label: 'Height', section: 'patientDetails', field: 'height',
    type: 'number', min: 0, max: 250, unit: 'cm'
  }));
  card.appendChild(meas);

  card.appendChild(selectInput({
    label: 'ASA physical status classification',
    section: 'patientDetails', field: 'asaGrade',
    options: [
      { value: 'I', label: 'I — Normal healthy patient' },
      { value: 'II', label: 'II — Mild systemic disease' },
      { value: 'III', label: 'III — Severe systemic disease' },
      { value: 'IV', label: 'IV — Severe systemic disease, constant threat to life' },
      { value: 'V', label: 'V — Moribund, not expected to survive without operation' },
      { value: 'VI', label: 'VI — Brain-dead, organs being removed for donation' },
      { value: 'E', label: 'E — Emergency suffix' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Allergies / adverse reactions',
    section: 'patientDetails', field: 'allergies',
    placeholder: 'List drug, food, latex, or other allergies. Use "NKDA" if none known.',
    rows: 2
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Procedure Details',
    description: 'Procedure performed, indication, timing, and location.'
  });

  card.appendChild(textInput({
    label: 'Procedure name', section: 'procedureDetails', field: 'procedureName',
    required: true, placeholder: 'e.g. Laparoscopic appendicectomy'
  }));

  const codeRow = document.createElement('div');
  codeRow.className = 'two-col';
  codeRow.appendChild(textInput({
    label: 'Procedure code (OPCS-4 / ICD-10-PCS)',
    section: 'procedureDetails', field: 'procedureCode'
  }));
  codeRow.appendChild(selectInput({
    label: 'Priority',
    section: 'procedureDetails', field: 'priority',
    options: [
      { value: 'elective', label: 'Elective' },
      { value: 'urgent', label: 'Urgent' },
      { value: 'emergency', label: 'Emergency' }
    ]
  }));
  card.appendChild(codeRow);

  card.appendChild(textArea({
    label: 'Indication',
    section: 'procedureDetails', field: 'indication',
    placeholder: 'Clinical indication for the procedure',
    rows: 2
  }));

  const approachRow = document.createElement('div');
  approachRow.className = 'two-col';
  approachRow.appendChild(textInput({
    label: 'Surgical approach',
    section: 'procedureDetails', field: 'surgicalApproach',
    placeholder: 'e.g. Open, laparoscopic, robotic'
  }));
  approachRow.appendChild(textInput({
    label: 'Laterality',
    section: 'procedureDetails', field: 'laterality',
    placeholder: 'e.g. Left, right, bilateral, N/A'
  }));
  card.appendChild(approachRow);

  card.appendChild(textInput({
    label: 'Date of surgery', section: 'procedureDetails', field: 'dateOfSurgery',
    type: 'date', required: true
  }));

  const timeGrid = document.createElement('div');
  timeGrid.className = 'three-col';
  timeGrid.appendChild(textInput({
    label: 'Start time', section: 'procedureDetails', field: 'startTime', type: 'time'
  }));
  timeGrid.appendChild(textInput({
    label: 'End time', section: 'procedureDetails', field: 'endTime', type: 'time'
  }));
  timeGrid.appendChild(readOnlyReadout({
    label: 'Duration',
    id: 'duration-readout',
    render: () => {
      const d = state.procedureDetails.durationMinutes;
      if (d == null) return '<span class="muted">Auto-calculated</span>';
      const h = Math.floor(d / 60);
      const m = d % 60;
      return `<strong>${d} min</strong> <span class="muted">(${h}h ${m}m)</span>`;
    }
  }));
  card.appendChild(timeGrid);

  card.appendChild(textInput({
    label: 'Operating theatre / room',
    section: 'procedureDetails', field: 'operatingRoom',
    placeholder: 'e.g. Theatre 4'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Surgical Team',
    description: 'Personnel responsible for the procedure.'
  });

  const surgeonRow = document.createElement('div');
  surgeonRow.className = 'two-col';
  surgeonRow.appendChild(textInput({
    label: 'Primary surgeon', section: 'surgicalTeam', field: 'primarySurgeon',
    required: true, placeholder: 'e.g. Mr J. Smith'
  }));
  surgeonRow.appendChild(textInput({
    label: 'Primary surgeon grade', section: 'surgicalTeam', field: 'primarySurgeonGrade',
    placeholder: 'e.g. Consultant'
  }));
  card.appendChild(surgeonRow);

  const anaesRow = document.createElement('div');
  anaesRow.className = 'two-col';
  anaesRow.appendChild(textInput({
    label: 'Primary anaesthetist', section: 'surgicalTeam', field: 'primaryAnaesthetist',
    placeholder: 'e.g. Dr K. Chan'
  }));
  anaesRow.appendChild(textInput({
    label: 'Primary anaesthetist grade', section: 'surgicalTeam', field: 'primaryAnaesthetistGrade',
    placeholder: 'e.g. Consultant'
  }));
  card.appendChild(anaesRow);

  const nurseRow = document.createElement('div');
  nurseRow.className = 'two-col';
  nurseRow.appendChild(textInput({
    label: 'Scrub nurse', section: 'surgicalTeam', field: 'scrubNurse'
  }));
  nurseRow.appendChild(textInput({
    label: 'Circulating nurse', section: 'surgicalTeam', field: 'circulator'
  }));
  card.appendChild(nurseRow);

  const teamHeader = document.createElement('div');
  teamHeader.className = 'list-section-header';
  teamHeader.innerHTML = `
    <h3>Additional team members</h3>
    <p class="hint">Assistants, registrars, students, and other personnel present.</p>
  `;
  card.appendChild(teamHeader);
  card.appendChild(teamMemberEditor());

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Intra-operative Findings',
    description: 'Findings and procedure performed in theatre.'
  });

  card.appendChild(textArea({
    label: 'Findings',
    section: 'intraoperativeFindings', field: 'findings',
    placeholder: 'Anatomical findings, pathology encountered, etc.',
    rows: 4
  }));
  card.appendChild(textArea({
    label: 'Procedure performed',
    section: 'intraoperativeFindings', field: 'procedurePerformed',
    placeholder: 'Detailed description of what was actually done.',
    rows: 4
  }));
  card.appendChild(textArea({
    label: 'Unexpected findings',
    section: 'intraoperativeFindings', field: 'unexpectedFindings',
    placeholder: 'Any deviation from the planned procedure.',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Conversion to open procedure?',
    section: 'intraoperativeFindings', field: 'conversionToOpen',
    options: yesNo
  }));
  const conv = document.createElement('div');
  conv.dataset.conditional = 'intraoperativeFindings.conversionToOpen=yes';
  conv.appendChild(textArea({
    label: 'Reason for conversion',
    section: 'intraoperativeFindings', field: 'conversionReason',
    placeholder: 'Why was the procedure converted?',
    rows: 2
  }));
  card.appendChild(conv);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Anaesthesia Summary',
    description: 'Anaesthetic technique, airway, and notable events.'
  });

  card.appendChild(selectInput({
    label: 'Anaesthesia type',
    section: 'anaesthesiaSummary', field: 'anaesthesiaType',
    options: [
      { value: 'general', label: 'General anaesthesia' },
      { value: 'regional', label: 'Regional' },
      { value: 'spinal', label: 'Spinal' },
      { value: 'epidural', label: 'Epidural' },
      { value: 'combined-spinal-epidural', label: 'Combined spinal-epidural' },
      { value: 'monitored-anaesthesia-care', label: 'Monitored anaesthesia care' },
      { value: 'local', label: 'Local anaesthesia' },
      { value: 'sedation', label: 'Sedation' },
      { value: 'none', label: 'None' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Airway management',
    section: 'anaesthesiaSummary', field: 'airwayManagement',
    placeholder: 'e.g. ETT 7.5, LMA, supraglottic device'
  }));

  card.appendChild(radioGroup({
    label: 'Difficult intubation?',
    section: 'anaesthesiaSummary', field: 'difficultIntubation',
    options: yesNo
  }));
  const airway = document.createElement('div');
  airway.dataset.conditional = 'anaesthesiaSummary.difficultIntubation=yes';
  airway.appendChild(textArea({
    label: 'Airway notes',
    section: 'anaesthesiaSummary', field: 'airwayNotes',
    placeholder: 'Cormack-Lehane grade, adjuncts, attempts, etc.',
    rows: 2
  }));
  card.appendChild(airway);

  card.appendChild(textArea({
    label: 'Medications administered',
    section: 'anaesthesiaSummary', field: 'medicationsAdministered',
    placeholder: 'Induction, maintenance, paralytics, opioids, antibiotics, etc.',
    rows: 3
  }));
  card.appendChild(textInput({
    label: 'Reversal agents',
    section: 'anaesthesiaSummary', field: 'reversalAgents',
    placeholder: 'e.g. Sugammadex 2 mg/kg'
  }));
  card.appendChild(textArea({
    label: 'Anaesthesia notes',
    section: 'anaesthesiaSummary', field: 'anaesthesiaNotes',
    placeholder: 'Notable events, hypotension, arrhythmia, etc.',
    rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Estimated Blood Loss & Fluid Balance',
    description: 'Intra-operative blood loss and fluid administration.'
  });

  card.appendChild(textInput({
    label: 'Estimated blood loss',
    section: 'bloodLossFluidBalance', field: 'estimatedBloodLossMl',
    type: 'number', min: 0, max: 20000, unit: 'mL'
  }));

  const fluidsGrid = document.createElement('div');
  fluidsGrid.className = 'three-col';
  fluidsGrid.appendChild(textInput({
    label: 'Crystalloids', section: 'bloodLossFluidBalance', field: 'crystalloidsMl',
    type: 'number', min: 0, max: 20000, unit: 'mL'
  }));
  fluidsGrid.appendChild(textInput({
    label: 'Colloids', section: 'bloodLossFluidBalance', field: 'colloidsMl',
    type: 'number', min: 0, max: 20000, unit: 'mL'
  }));
  fluidsGrid.appendChild(textInput({
    label: 'Blood products', section: 'bloodLossFluidBalance', field: 'bloodProductsMl',
    type: 'number', min: 0, max: 20000, unit: 'mL'
  }));
  card.appendChild(fluidsGrid);

  card.appendChild(textArea({
    label: 'Blood product details',
    section: 'bloodLossFluidBalance', field: 'bloodProductDetails',
    placeholder: 'Units of PRBC, FFP, platelets, cryoprecipitate, cell salvage, etc.',
    rows: 2
  }));

  const outputGrid = document.createElement('div');
  outputGrid.className = 'two-col';
  outputGrid.appendChild(textInput({
    label: 'Urine output', section: 'bloodLossFluidBalance', field: 'urineOutputMl',
    type: 'number', min: 0, max: 20000, unit: 'mL'
  }));
  outputGrid.appendChild(textInput({
    label: 'Other drains output', section: 'bloodLossFluidBalance', field: 'otherDrainsMl',
    type: 'number', min: 0, max: 20000, unit: 'mL'
  }));
  card.appendChild(outputGrid);

  card.appendChild(textArea({
    label: 'Fluid balance notes',
    section: 'bloodLossFluidBalance', field: 'fluidNotes',
    placeholder: 'Net balance, ongoing losses, special considerations.',
    rows: 2
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Specimens & Implants',
    description: 'Tissue specimens, implants, drains and catheters.'
  });

  const specimensHeader = document.createElement('div');
  specimensHeader.className = 'list-section-header';
  specimensHeader.innerHTML = `
    <h3>Specimens</h3>
    <p class="hint">Tissue or fluid sent for histology, microbiology, or other analysis.</p>
  `;
  card.appendChild(specimensHeader);
  card.appendChild(specimenEditor());

  const implantsHeader = document.createElement('div');
  implantsHeader.className = 'list-section-header';
  implantsHeader.innerHTML = `
    <h3>Implants</h3>
    <p class="hint">Devices or prostheses placed during the procedure.</p>
  `;
  card.appendChild(implantsHeader);
  card.appendChild(implantEditor());

  card.appendChild(radioGroup({
    label: 'Was a prosthesis used?',
    section: 'specimensImplants', field: 'prosthesisUsed', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Drains placed',
    section: 'specimensImplants', field: 'drainsPlaced',
    placeholder: 'e.g. Robinson drain ×1 to right paracolic gutter',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Catheters placed',
    section: 'specimensImplants', field: 'cathetersPlaced',
    placeholder: 'e.g. 14F urinary catheter',
    rows: 2
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Immediate Post-op Status',
    description: 'Patient status on arrival in recovery.'
  });

  card.appendChild(selectInput({
    label: 'Conscious level',
    section: 'immediatePostopStatus', field: 'consciousLevel',
    options: [
      { value: 'awake', label: 'Awake and alert' },
      { value: 'drowsy', label: 'Drowsy but rousable' },
      { value: 'sedated', label: 'Sedated' },
      { value: 'intubated', label: 'Intubated and ventilated' },
      { value: 'unresponsive', label: 'Unresponsive' }
    ]
  }));

  const bpGrid = document.createElement('div');
  bpGrid.className = 'two-col';
  bpGrid.appendChild(textInput({
    label: 'Systolic BP', section: 'immediatePostopStatus', field: 'systolicBp',
    type: 'number', min: 0, max: 300, unit: 'mmHg'
  }));
  bpGrid.appendChild(textInput({
    label: 'Diastolic BP', section: 'immediatePostopStatus', field: 'diastolicBp',
    type: 'number', min: 0, max: 200, unit: 'mmHg'
  }));
  card.appendChild(bpGrid);

  const vitalGrid = document.createElement('div');
  vitalGrid.className = 'three-col';
  vitalGrid.appendChild(textInput({
    label: 'Heart rate', section: 'immediatePostopStatus', field: 'heartRate',
    type: 'number', min: 0, max: 250, unit: 'bpm'
  }));
  vitalGrid.appendChild(textInput({
    label: 'Respiratory rate', section: 'immediatePostopStatus', field: 'respiratoryRate',
    type: 'number', min: 0, max: 80, unit: '/min'
  }));
  vitalGrid.appendChild(textInput({
    label: 'SpO2', section: 'immediatePostopStatus', field: 'oxygenSaturation',
    type: 'number', min: 0, max: 100, unit: '%'
  }));
  card.appendChild(vitalGrid);

  const tempPainGrid = document.createElement('div');
  tempPainGrid.className = 'two-col';
  tempPainGrid.appendChild(textInput({
    label: 'Temperature', section: 'immediatePostopStatus', field: 'temperature',
    type: 'number', min: 25, max: 45, step: 0.1, unit: '°C'
  }));
  tempPainGrid.appendChild(textInput({
    label: 'Pain score (0–10)', section: 'immediatePostopStatus', field: 'painScore',
    type: 'number', min: 0, max: 10
  }));
  card.appendChild(tempPainGrid);

  card.appendChild(textArea({
    label: 'Pain notes',
    section: 'immediatePostopStatus', field: 'painNotes',
    placeholder: 'Quality of pain, location, response to analgesia.',
    rows: 2
  }));

  card.appendChild(selectInput({
    label: 'Disposition from theatre',
    section: 'immediatePostopStatus', field: 'disposition',
    options: [
      { value: 'recovery', label: 'Recovery / PACU' },
      { value: 'ward', label: 'Surgical ward' },
      { value: 'hdu', label: 'High dependency unit (HDU)' },
      { value: 'icu', label: 'Intensive care unit (ICU)' },
      { value: 'theatre', label: 'Returned to theatre' },
      { value: 'home', label: 'Discharged home (day case)' }
    ]
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Complications Assessment (Clavien-Dindo)',
    description: 'Record each complication with its Clavien-Dindo grade. Overall grade reflects the worst single complication.'
  });

  card.appendChild(radioGroup({
    label: 'Did any complications occur?',
    section: 'complicationsAssessment', field: 'complicationsOccurred',
    options: yesNo
  }));

  const compsHeader = document.createElement('div');
  compsHeader.className = 'list-section-header';
  compsHeader.dataset.conditional = 'complicationsAssessment.complicationsOccurred=yes';
  compsHeader.innerHTML = `
    <h3>Complications</h3>
    <p class="hint">Add one row per complication. Grade each by the intervention required.</p>
  `;
  card.appendChild(compsHeader);

  const compsHost = document.createElement('div');
  compsHost.dataset.conditional = 'complicationsAssessment.complicationsOccurred=yes';
  compsHost.appendChild(complicationEditor());
  card.appendChild(compsHost);

  card.appendChild(textArea({
    label: 'Narrative summary',
    section: 'complicationsAssessment', field: 'narrative',
    placeholder: 'Free-text narrative summary of any deviation from the expected post-operative course.',
    rows: 3
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Post-op Plan & Instructions',
    description: 'Onward management plan, prescriptions, and follow-up.'
  });

  card.appendChild(textArea({
    label: 'Medications prescribed',
    section: 'postopPlanInstructions', field: 'medicationsPrescribed',
    placeholder: 'New medications, regular medications continued/held.',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Antibiotic plan',
    section: 'postopPlanInstructions', field: 'antibioticPlan',
    placeholder: 'Prophylactic vs treatment course, agents, duration.',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Thromboprophylaxis',
    section: 'postopPlanInstructions', field: 'thromboprophylaxis',
    placeholder: 'e.g. LMWH 40 mg SC daily, TED stockings, IPCs.',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Analgesia plan',
    section: 'postopPlanInstructions', field: 'analgesiaPlan',
    placeholder: 'Multimodal analgesia, PCA, regional blocks.',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Diet plan',
    section: 'postopPlanInstructions', field: 'dietPlan',
    placeholder: 'NBM, sips, free fluids, light diet, normal diet.',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Mobilisation plan',
    section: 'postopPlanInstructions', field: 'mobilisationPlan',
    placeholder: 'Bed rest vs mobilise as able, weight bearing status.',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Wound care instructions',
    section: 'postopPlanInstructions', field: 'woundCareInstructions',
    placeholder: 'Dressing changes, suture/staple removal date, signs of infection.',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Follow-up plan',
    section: 'postopPlanInstructions', field: 'followUpPlan',
    placeholder: 'Outpatient appointments, imaging, results review.',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Discharge criteria',
    section: 'postopPlanInstructions', field: 'dischargeCriteria',
    placeholder: 'Conditions to meet before discharge.',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Alerts & escalation',
    section: 'postopPlanInstructions', field: 'alertsAndEscalation',
    placeholder: 'When to escalate, who to call, named contact.',
    rows: 2
  }));

  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
  renderStep6, renderStep7, renderStep8, renderStep9, renderStep10
];

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
  const dur = document.getElementById('duration-readout');
  if (dur) {
    const d = state.procedureDetails.durationMinutes;
    if (d == null) {
      dur.innerHTML = '<span class="muted">Auto-calculated</span>';
    } else {
      const h = Math.floor(d / 60);
      const m = d % 60;
      dur.innerHTML = `<strong>${d} min</strong> <span class="muted">(${h}h ${m}m)</span>`;
    }
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Patient details (1)
  ['patientDetails', 'firstName'],
  ['patientDetails', 'lastName'],
  ['patientDetails', 'dateOfBirth'],
  ['patientDetails', 'mrn'],
  ['patientDetails', 'sex'],
  ['patientDetails', 'asaGrade'],
  ['patientDetails', 'allergies'],
  // Procedure details (2)
  ['procedureDetails', 'procedureName'],
  ['procedureDetails', 'indication'],
  ['procedureDetails', 'priority'],
  ['procedureDetails', 'surgicalApproach'],
  ['procedureDetails', 'dateOfSurgery'],
  ['procedureDetails', 'startTime'],
  ['procedureDetails', 'endTime'],
  // Surgical team (3)
  ['surgicalTeam', 'primarySurgeon'],
  ['surgicalTeam', 'primaryAnaesthetist'],
  // Intra-op findings (4)
  ['intraoperativeFindings', 'findings'],
  ['intraoperativeFindings', 'procedurePerformed'],
  ['intraoperativeFindings', 'conversionToOpen'],
  // Anaesthesia summary (5)
  ['anaesthesiaSummary', 'anaesthesiaType'],
  ['anaesthesiaSummary', 'airwayManagement'],
  ['anaesthesiaSummary', 'difficultIntubation'],
  // Blood loss / fluids (6)
  ['bloodLossFluidBalance', 'estimatedBloodLossMl'],
  ['bloodLossFluidBalance', 'crystalloidsMl'],
  ['bloodLossFluidBalance', 'urineOutputMl'],
  // Specimens / implants meta (7)
  ['specimensImplants', 'prosthesisUsed'],
  // Immediate post-op status (8)
  ['immediatePostopStatus', 'consciousLevel'],
  ['immediatePostopStatus', 'systolicBp'],
  ['immediatePostopStatus', 'diastolicBp'],
  ['immediatePostopStatus', 'heartRate'],
  ['immediatePostopStatus', 'respiratoryRate'],
  ['immediatePostopStatus', 'oxygenSaturation'],
  ['immediatePostopStatus', 'temperature'],
  ['immediatePostopStatus', 'painScore'],
  ['immediatePostopStatus', 'disposition'],
  // Complications (9)
  ['complicationsAssessment', 'complicationsOccurred'],
  // Plan (10)
  ['postopPlanInstructions', 'medicationsPrescribed'],
  ['postopPlanInstructions', 'antibioticPlan'],
  ['postopPlanInstructions', 'thromboprophylaxis'],
  ['postopPlanInstructions', 'analgesiaPlan'],
  ['postopPlanInstructions', 'dietPlan'],
  ['postopPlanInstructions', 'mobilisationPlan'],
  ['postopPlanInstructions', 'woundCareInstructions'],
  ['postopPlanInstructions', 'followUpPlan']
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
  { step: 1,  section: 'patientDetails',           title: 'Patient Details' },
  { step: 2,  section: 'procedureDetails',         title: 'Procedure Details' },
  { step: 3,  section: 'surgicalTeam',             title: 'Surgical Team' },
  { step: 4,  section: 'intraoperativeFindings',   title: 'Intra-operative Findings' },
  { step: 5,  section: 'anaesthesiaSummary',       title: 'Anaesthesia' },
  { step: 6,  section: 'bloodLossFluidBalance',    title: 'Blood Loss & Fluids' },
  { step: 7,  section: 'specimensImplants',        title: 'Specimens & Implants' },
  { step: 8,  section: 'immediatePostopStatus',    title: 'Immediate Post-op' },
  { step: 9,  section: 'complicationsAssessment',  title: 'Complications' },
  { step: 10, section: 'postopPlanInstructions',   title: 'Plan & Instructions' }
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
  required.forEach((input) => {
    const id = input.id;
    const value = (input.value || '').trim();
    if (!value) {
      const labelEl = form.querySelector(`label[for="${id}"]`);
      const label = labelEl ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim() : id;
      errors.push({ id, message: `${label} is required` });
      setFieldError(id, `${label} is required`);
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
  summary.innerHTML = `
    <strong>Please correct the following:</strong>
    <ul>
      ${errors.map((e) => `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`).join('')}
    </ul>
  `;
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  summary.focus({ preventScroll: true });
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { overallGrade, complicationCount, firedRules, additionalFlags, timestamp } = lastResult;
  const overallRule = clavienDindoRuleByGrade[overallGrade];

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
      <td>${esc(gradeLabel(r.grade))}</td>
      <td>${esc(r.description)}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No graded complications recorded.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Complication</th>
            <th scope="col">Grade</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const overallDescription = overallRule
    ? esc(overallRule.description)
    : '';

  out.innerHTML = `
    <h2>Post-Operative Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Overall Clavien-Dindo Grade</h3>
    <p class="grade-summary">
      <span class="grade-badge ${gradeBadgeClass(overallGrade)}">${esc(gradeShortLabel(overallGrade) || '0')}</span>
      <span class="grade-label">${esc(gradeLabel(overallGrade))}</span>
    </p>
    <p class="muted">${overallDescription}</p>
    <p class="muted">${complicationCount} graded complication${complicationCount === 1 ? '' : 's'} recorded.</p>

    <h3>Per-complication grades</h3>
    ${firedTable}

    <h3>Flagged Issues</h3>
    ${flagsList}

    <div class="report-actions">
      <button type="button" id="print-btn" class="button" data-variant="secondary">Print / save PDF</button>
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
  document.getElementById('print-btn').addEventListener('click', () => window.print());
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  recomputeDerived();
  const { overallGrade, complicationCount, firedRules } = calculateClavienDindo(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    overallGrade,
    complicationCount,
    firedRules,
    additionalFlags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh report?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the report.</p>';
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
  for (const r of STEP_RENDERERS) host.appendChild(r());
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
