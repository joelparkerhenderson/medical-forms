import { validateDischarge } from './discharge-validator.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateLengthOfStay, completenessClass, completenessLabel, emptyAssessment } from './types.js';

// Hospital Discharge - clinician/patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure NICE NG27 completeness validator and renders an inline
// report. State is persisted to localStorage so a partial fill survives a
// page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'hospital-discharge.front-end-form-with-html.v1';

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
    console.warn('Could not parse saved discharge summary; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save discharge summary to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored discharge summary.', e);
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
  slug: 'hospital-discharge',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the completeness report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    updateConditionalSections();
    refreshAutoCalculatedReadouts();
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
    <h2 class="section-title">${esc(opts.title)}</h2>
    ${desc}
  `;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Repeating-list editors
// ----------------------------------------------------------------------

function diagnosisListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.diagnoses.diagnoses;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No diagnoses added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row diagnosis-row';
      r.innerHTML = `
        <div class="list-grid diagnosis-grid">
          <label class="list-cell">
            <span>Type</span>
            <select class="select" data-key="type">
              <option value="">— Select —</option>
              <option value="primary"${row.type === 'primary' ? ' selected' : ''}>Primary</option>
              <option value="secondary"${row.type === 'secondary' ? ' selected' : ''}>Secondary</option>
            </select>
          </label>
          <label class="list-cell">
            <span>Description</span>
            <input type="text" class="text-input" data-key="description"
                   value="${esc(row.description)}"
                   placeholder="e.g. Community-acquired pneumonia">
          </label>
          <label class="list-cell">
            <span>ICD-10</span>
            <input type="text" class="text-input" data-key="icd10"
                   value="${esc(row.icd10)}" placeholder="e.g. J18.9">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove diagnosis">&times;</button>
        </div>
      `;
      r.querySelectorAll('input, select').forEach((inp) => {
        const handler = () => {
          rows[idx][inp.dataset.key] = inp.value;
          saveState(state);
          updateProgress();
        };
        inp.addEventListener('input', handler);
        inp.addEventListener('change', handler);
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
    addBtn.textContent = '+ Add diagnosis';
    addBtn.addEventListener('click', () => {
      rows.push({ description: '', icd10: '', type: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

function procedureListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.proceduresPerformed.procedures;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No procedures added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row procedure-row';
      r.innerHTML = `
        <div class="list-grid procedure-grid">
          <label class="list-cell">
            <span>Description</span>
            <input type="text" class="text-input" data-key="description"
                   value="${esc(row.description)}"
                   placeholder="e.g. Right-sided chest drain insertion">
          </label>
          <label class="list-cell">
            <span>OPCS-4</span>
            <input type="text" class="text-input" data-key="opcs4"
                   value="${esc(row.opcs4)}" placeholder="e.g. T12.4">
          </label>
          <label class="list-cell">
            <span>Date</span>
            <input type="date" class="text-input" data-key="date" value="${esc(row.date)}">
          </label>
          <label class="list-cell">
            <span>Performed by</span>
            <input type="text" class="text-input" data-key="performedBy"
                   value="${esc(row.performedBy)}" placeholder="Clinician">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove procedure">&times;</button>
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
    addBtn.textContent = '+ Add procedure';
    addBtn.addEventListener('click', () => {
      rows.push({ description: '', opcs4: '', date: '', performedBy: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

function medicationListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.dischargeMedications.medications;
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
        <div class="list-grid discharge-med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name"
                   value="${esc(row.name)}" placeholder="e.g. Amoxicillin">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose"
                   value="${esc(row.dose)}" placeholder="e.g. 500 mg">
          </label>
          <label class="list-cell">
            <span>Route</span>
            <input type="text" class="text-input" data-key="route"
                   value="${esc(row.route)}" placeholder="e.g. PO, IV">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency"
                   value="${esc(row.frequency)}" placeholder="e.g. TDS, BD">
          </label>
          <label class="list-cell">
            <span>Duration</span>
            <input type="text" class="text-input" data-key="duration"
                   value="${esc(row.duration)}" placeholder="e.g. 7 days">
          </label>
          <label class="list-cell">
            <span>Status</span>
            <select class="select" data-key="status">
              <option value="">— Select —</option>
              <option value="new"${row.status === 'new' ? ' selected' : ''}>New</option>
              <option value="changed"${row.status === 'changed' ? ' selected' : ''}>Changed</option>
              <option value="unchanged"${row.status === 'unchanged' ? ' selected' : ''}>Unchanged</option>
              <option value="stopped"${row.status === 'stopped' ? ' selected' : ''}>Stopped</option>
            </select>
          </label>
          <label class="list-cell list-cell-wide">
            <span>Indication</span>
            <input type="text" class="text-input" data-key="indication"
                   value="${esc(row.indication)}" placeholder="e.g. Pneumonia">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove medication">&times;</button>
        </div>
      `;
      r.querySelectorAll('input, select').forEach((inp) => {
        const handler = () => {
          rows[idx][inp.dataset.key] = inp.value;
          saveState(state);
          updateProgress();
        };
        inp.addEventListener('input', handler);
        inp.addEventListener('change', handler);
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
      rows.push({
        name: '', dose: '', route: '', frequency: '',
        duration: '', status: '', indication: ''
      });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

function appointmentListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.followupArrangements.appointments;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No appointments scheduled.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row appointment-row';
      r.innerHTML = `
        <div class="list-grid appointment-grid">
          <label class="list-cell">
            <span>Provider / clinic</span>
            <input type="text" class="text-input" data-key="provider"
                   value="${esc(row.provider)}"
                   placeholder="e.g. Respiratory clinic">
          </label>
          <label class="list-cell">
            <span>Date</span>
            <input type="date" class="text-input" data-key="date" value="${esc(row.date)}">
          </label>
          <label class="list-cell">
            <span>Location</span>
            <input type="text" class="text-input" data-key="location"
                   value="${esc(row.location)}" placeholder="e.g. Outpatients">
          </label>
          <label class="list-cell">
            <span>Purpose</span>
            <input type="text" class="text-input" data-key="purpose"
                   value="${esc(row.purpose)}" placeholder="e.g. Review CXR">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove appointment">&times;</button>
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
    addBtn.textContent = '+ Add follow-up appointment';
    addBtn.addEventListener('click', () => {
      rows.push({ provider: '', date: '', location: '', purpose: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

function redFlagListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.warningSigns.redFlagSymptoms;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No red-flag symptoms listed.';
      wrapper.appendChild(empty);
    }
    rows.forEach((value, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row env-row';
      r.innerHTML = `
        <input type="text" class="text-input"
               value="${esc(value)}"
               placeholder="e.g. Worsening shortness of breath">
        <button type="button" class="button" data-variant="icon" aria-label="Remove red-flag symptom">&times;</button>
      `;
      const inp = r.querySelector('input');
      inp.addEventListener('input', () => {
        rows[idx] = inp.value;
        saveState(state);
        updateProgress();
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
    addBtn.textContent = '+ Add red-flag symptom';
    addBtn.addEventListener('click', () => {
      rows.push('');
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

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Patient Details',
    description: 'Patient identification and registered contacts.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'patientDetails', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'patientDetails', field: 'lastName', required: true }));
  card.appendChild(grid);

  const idGrid = document.createElement('div');
  idGrid.className = 'two-col';
  idGrid.appendChild(textInput({
    label: 'Date of Birth', section: 'patientDetails', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  idGrid.appendChild(radioGroup({
    label: 'Sex',
    section: 'patientDetails', field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(idGrid);

  const numGrid = document.createElement('div');
  numGrid.className = 'two-col';
  numGrid.appendChild(textInput({
    label: 'NHS Number', section: 'patientDetails', field: 'nhsNumber',
    required: true, placeholder: '000 000 0000'
  }));
  numGrid.appendChild(textInput({
    label: 'Hospital Number', section: 'patientDetails', field: 'hospitalNumber'
  }));
  card.appendChild(numGrid);

  card.appendChild(textArea({
    label: 'Address', section: 'patientDetails', field: 'address',
    rows: 2, placeholder: 'Street, town, county'
  }));

  const contactGrid = document.createElement('div');
  contactGrid.className = 'two-col';
  contactGrid.appendChild(textInput({
    label: 'Postcode', section: 'patientDetails', field: 'postcode'
  }));
  contactGrid.appendChild(textInput({
    label: 'Phone', section: 'patientDetails', field: 'phone',
    type: 'tel'
  }));
  card.appendChild(contactGrid);

  const gpGrid = document.createElement('div');
  gpGrid.className = 'two-col';
  gpGrid.appendChild(textInput({
    label: 'GP Name', section: 'patientDetails', field: 'gpName', required: true
  }));
  gpGrid.appendChild(textInput({
    label: 'GP Practice', section: 'patientDetails', field: 'gpPractice', required: true
  }));
  card.appendChild(gpGrid);

  const kinGrid = document.createElement('div');
  kinGrid.className = 'two-col';
  kinGrid.appendChild(textInput({
    label: 'Next of Kin Name', section: 'patientDetails', field: 'nextOfKinName'
  }));
  kinGrid.appendChild(textInput({
    label: 'Next of Kin Phone', section: 'patientDetails', field: 'nextOfKinPhone',
    type: 'tel'
  }));
  card.appendChild(kinGrid);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Admission Summary',
    description: 'Dates, ward, consultant, and clinical narrative.'
  });

  const dateGrid = document.createElement('div');
  dateGrid.className = 'three-col';
  dateGrid.appendChild(textInput({
    label: 'Admission Date', section: 'admissionSummary', field: 'admissionDate',
    type: 'date', required: true
  }));
  dateGrid.appendChild(textInput({
    label: 'Discharge Date', section: 'admissionSummary', field: 'dischargeDate',
    type: 'date', required: true
  }));
  dateGrid.appendChild(readOnlyReadout({
    label: 'Length of stay',
    id: 'los-readout',
    render: () => {
      const days = calculateLengthOfStay(
        state.admissionSummary.admissionDate,
        state.admissionSummary.dischargeDate
      );
      if (days == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${days}</strong> <span class="muted">day${days === 1 ? '' : 's'}</span>`;
    }
  }));
  card.appendChild(dateGrid);

  const wardGrid = document.createElement('div');
  wardGrid.className = 'two-col';
  wardGrid.appendChild(textInput({
    label: 'Ward', section: 'admissionSummary', field: 'ward'
  }));
  wardGrid.appendChild(textInput({
    label: 'Specialty', section: 'admissionSummary', field: 'specialty',
    placeholder: 'e.g. General medicine'
  }));
  card.appendChild(wardGrid);

  card.appendChild(textInput({
    label: 'Responsible Consultant', section: 'admissionSummary', field: 'consultant',
    required: true
  }));

  card.appendChild(textArea({
    label: 'Reason for admission',
    section: 'admissionSummary', field: 'reasonForAdmission',
    rows: 2,
    placeholder: 'Why was the patient admitted?'
  }));

  card.appendChild(textArea({
    label: 'Presenting complaint',
    section: 'admissionSummary', field: 'presentingComplaint',
    rows: 2
  }));

  card.appendChild(textArea({
    label: 'Clinical narrative / discharge summary',
    section: 'admissionSummary', field: 'clinicalNarrative',
    rows: 5,
    placeholder: 'Investigations, treatment, response, and current status…'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Diagnoses',
    description: 'Primary and secondary diagnoses, ideally coded with ICD-10.'
  });

  const header = document.createElement('div');
  header.className = 'list-section-header';
  header.innerHTML = `
    <h3>Diagnoses</h3>
    <p class="hint">List at least one primary diagnosis. Add secondary diagnoses as needed.</p>
  `;
  card.appendChild(header);
  card.appendChild(diagnosisListEditor());

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Procedures Performed',
    description: 'Operations, interventional procedures, or investigations during this admission.'
  });

  card.appendChild(radioGroup({
    label: 'No procedures performed during this admission?',
    section: 'proceduresPerformed', field: 'noProceduresPerformed',
    options: yesNo
  }));

  const proceduresHost = document.createElement('div');
  proceduresHost.dataset.conditional = 'proceduresPerformed.noProceduresPerformed=no';

  const header = document.createElement('div');
  header.className = 'list-section-header';
  header.innerHTML = `
    <h3>Procedures</h3>
    <p class="hint">Include date and clinician where known.</p>
  `;
  proceduresHost.appendChild(header);
  proceduresHost.appendChild(procedureListEditor());
  card.appendChild(proceduresHost);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Discharge Medications',
    description: 'Reconciled medication list at the point of discharge.'
  });

  const header = document.createElement('div');
  header.className = 'list-section-header';
  header.innerHTML = `
    <h3>Medications</h3>
    <p class="hint">Each medication should include name, dose, route, frequency, and duration.</p>
  `;
  card.appendChild(header);
  card.appendChild(medicationListEditor());

  card.appendChild(radioGroup({
    label: 'Medication reconciliation completed?',
    section: 'dischargeMedications', field: 'reconciliationCompleted',
    options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Reconciliation notes',
    section: 'dischargeMedications', field: 'reconciliationNotes',
    rows: 3,
    placeholder: 'Pre-admission medications stopped, started, or changed; reasons.'
  }));

  card.appendChild(radioGroup({
    label: 'Allergies reviewed?',
    section: 'dischargeMedications', field: 'allergiesReviewed',
    options: yesNo
  }));

  const allergyHost = document.createElement('div');
  allergyHost.dataset.conditional = 'dischargeMedications.allergiesReviewed=yes';
  allergyHost.appendChild(textArea({
    label: 'Documented allergies and reactions',
    section: 'dischargeMedications', field: 'allergyNotes',
    rows: 3,
    placeholder: 'e.g. Penicillin — rash. NKDA.'
  }));
  card.appendChild(allergyHost);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Follow-up Arrangements',
    description: 'Outpatient, GP, and pending-investigation handover.'
  });

  card.appendChild(radioGroup({
    label: 'GP follow-up required?',
    section: 'followupArrangements', field: 'gpFollowupRequired',
    options: yesNo
  }));

  const gpTimeHost = document.createElement('div');
  gpTimeHost.dataset.conditional = 'followupArrangements.gpFollowupRequired=yes';
  gpTimeHost.appendChild(textInput({
    label: 'GP follow-up timeframe',
    section: 'followupArrangements', field: 'gpFollowupTimeframe',
    placeholder: 'e.g. Within 7 days'
  }));
  card.appendChild(gpTimeHost);

  card.appendChild(radioGroup({
    label: 'Outpatient follow-up required?',
    section: 'followupArrangements', field: 'outpatientFollowupRequired',
    options: yesNo
  }));

  const apptHost = document.createElement('div');
  apptHost.dataset.conditional = 'followupArrangements.outpatientFollowupRequired=yes';
  const apptHeader = document.createElement('div');
  apptHeader.className = 'list-section-header';
  apptHeader.innerHTML = `
    <h3>Scheduled appointments</h3>
    <p class="hint">Confirmed dates and clinics.</p>
  `;
  apptHost.appendChild(apptHeader);
  apptHost.appendChild(appointmentListEditor());
  card.appendChild(apptHost);

  card.appendChild(radioGroup({
    label: 'Investigations pending at discharge?',
    section: 'followupArrangements', field: 'investigationsPending',
    options: yesNo
  }));

  const investHost = document.createElement('div');
  investHost.dataset.conditional = 'followupArrangements.investigationsPending=yes';
  investHost.appendChild(textArea({
    label: 'Pending investigation details',
    section: 'followupArrangements', field: 'pendingInvestigationDetails',
    rows: 3,
    placeholder: 'e.g. Histology from biopsy taken on admission, awaiting MDT review.'
  }));
  investHost.appendChild(radioGroup({
    label: 'Results to be chased by GP?',
    section: 'followupArrangements', field: 'resultsToBeChasedByGp',
    options: yesNo
  }));
  card.appendChild(investHost);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Community Care Instructions',
    description: 'Destination, ongoing care, referrals, and equipment.'
  });

  card.appendChild(selectInput({
    label: 'Discharge destination',
    section: 'communityCareInstructions', field: 'dischargeDestination',
    options: [
      { value: 'home', label: 'Own home' },
      { value: 'care-home', label: 'Care home (residential)' },
      { value: 'nursing-home', label: 'Nursing home' },
      { value: 'rehab', label: 'Rehabilitation unit' },
      { value: 'hospice', label: 'Hospice' },
      { value: 'other-hospital', label: 'Other hospital' },
      { value: 'other', label: 'Other' }
    ]
  }));

  const otherDestHost = document.createElement('div');
  otherDestHost.dataset.conditional = 'communityCareInstructions.dischargeDestination=other';
  otherDestHost.appendChild(textInput({
    label: 'Other destination details',
    section: 'communityCareInstructions', field: 'otherDestinationDetails'
  }));
  card.appendChild(otherDestHost);

  card.appendChild(selectInput({
    label: 'Care responsibility post-discharge',
    section: 'communityCareInstructions', field: 'careResponsibility',
    options: [
      { value: 'self', label: 'Self-caring' },
      { value: 'family', label: 'Family' },
      { value: 'carer', label: 'Informal carer' },
      { value: 'community-team', label: 'Community team' },
      { value: 'care-home-staff', label: 'Care-home staff' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Transport mode',
    section: 'communityCareInstructions', field: 'transportMode',
    options: [
      { value: 'walking', label: 'Walking / own transport' },
      { value: 'wheelchair', label: 'Wheelchair' },
      { value: 'stretcher', label: 'Stretcher' },
      { value: 'ambulance', label: 'Ambulance' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));

  const refGrid = document.createElement('div');
  refGrid.className = 'two-col';
  refGrid.appendChild(radioGroup({
    label: 'District nurse referral?',
    section: 'communityCareInstructions', field: 'districtNurseReferral',
    options: yesNo
  }));
  refGrid.appendChild(radioGroup({
    label: 'Social services referral?',
    section: 'communityCareInstructions', field: 'socialServicesReferral',
    options: yesNo
  }));
  refGrid.appendChild(radioGroup({
    label: 'Physiotherapy referral?',
    section: 'communityCareInstructions', field: 'physiotherapyReferral',
    options: yesNo
  }));
  refGrid.appendChild(radioGroup({
    label: 'Occupational therapy referral?',
    section: 'communityCareInstructions', field: 'occupationalTherapyReferral',
    options: yesNo
  }));
  card.appendChild(refGrid);

  card.appendChild(radioGroup({
    label: 'Package of care in place?',
    section: 'communityCareInstructions', field: 'packageOfCareInPlace',
    options: yesNo
  }));

  card.appendChild(textInput({
    label: 'Mobility status at discharge',
    section: 'communityCareInstructions', field: 'mobilityStatus',
    placeholder: 'e.g. Independent with stick'
  }));

  card.appendChild(textArea({
    label: 'Dietary requirements',
    section: 'communityCareInstructions', field: 'dietaryRequirements',
    rows: 2
  }));

  card.appendChild(textArea({
    label: 'Wound care instructions',
    section: 'communityCareInstructions', field: 'woundCareInstructions',
    rows: 2,
    placeholder: 'Dressing changes, suture removal, signs of infection…'
  }));

  card.appendChild(textArea({
    label: 'Equipment provided / arranged',
    section: 'communityCareInstructions', field: 'equipmentProvided',
    rows: 2,
    placeholder: 'e.g. Walking frame, hospital bed, commode'
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Warning Signs & When to Seek Help',
    description: 'Safety-netting required by NICE NG27.'
  });

  const header = document.createElement('div');
  header.className = 'list-section-header';
  header.innerHTML = '<h3>Red-flag symptoms</h3>';
  card.appendChild(header);
  card.appendChild(redFlagListEditor());

  card.appendChild(textArea({
    label: 'When to seek help',
    section: 'warningSigns', field: 'whenToSeekHelp',
    rows: 4,
    placeholder: 'Specific advice on which symptoms warrant urgent review…'
  }));

  card.appendChild(textInput({
    label: 'Emergency contact number',
    section: 'warningSigns', field: 'emergencyContactNumber',
    type: 'tel',
    placeholder: 'e.g. 999, 111, ward number'
  }));

  card.appendChild(radioGroup({
    label: 'Safety-netting advice provided?',
    section: 'warningSigns', field: 'safetyNetingProvided',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Written information given to patient?',
    section: 'warningSigns', field: 'writtenInfoGiven',
    options: yesNo
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Clinician Sign-off',
    description: 'Person completing the discharge summary.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Clinician name', section: 'clinicianSignoff', field: 'clinicianName',
    required: true
  }));
  grid.appendChild(textInput({
    label: 'Role / grade', section: 'clinicianSignoff', field: 'clinicianRole',
    required: true,
    placeholder: 'e.g. ST3, Registrar, Consultant'
  }));
  card.appendChild(grid);

  const idGrid = document.createElement('div');
  idGrid.className = 'two-col';
  idGrid.appendChild(textInput({
    label: 'GMC / professional number', section: 'clinicianSignoff', field: 'gmcNumber'
  }));
  idGrid.appendChild(textInput({
    label: 'Sign-off date', section: 'clinicianSignoff', field: 'signoffDate',
    type: 'date', required: true
  }));
  card.appendChild(idGrid);

  card.appendChild(textInput({
    label: 'Bleep / contact number',
    section: 'clinicianSignoff', field: 'bleepOrContact',
    placeholder: 'For follow-up queries'
  }));

  card.appendChild(radioGroup({
    label: 'Responsible consultant informed of discharge?',
    section: 'clinicianSignoff', field: 'responsibleConsultantInformed',
    options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Additional notes for the receiving clinician / GP',
    section: 'clinicianSignoff', field: 'additionalNotes',
    rows: 4
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Patient / Carer Acknowledgement',
    description: 'Confirmation that the patient understands the plan.'
  });

  card.appendChild(radioGroup({
    label: 'Does the patient understand the discharge plan?',
    section: 'patientAcknowledgement', field: 'patientUnderstandsPlan',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Carer informed of discharge?',
    section: 'patientAcknowledgement', field: 'carerInformed',
    options: yesNo
  }));

  const carerNameHost = document.createElement('div');
  carerNameHost.dataset.conditional = 'patientAcknowledgement.carerInformed=yes';
  carerNameHost.appendChild(textInput({
    label: 'Carer name',
    section: 'patientAcknowledgement', field: 'carerName'
  }));
  card.appendChild(carerNameHost);

  card.appendChild(radioGroup({
    label: 'Medications explained to patient/carer?',
    section: 'patientAcknowledgement', field: 'medicationsExplained',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Written discharge summary provided?',
    section: 'patientAcknowledgement', field: 'writtenSummaryProvided',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'All patient questions answered?',
    section: 'patientAcknowledgement', field: 'questionsAnswered',
    options: yesNo
  }));

  const ackGrid = document.createElement('div');
  ackGrid.className = 'two-col';
  ackGrid.appendChild(textInput({
    label: 'Acknowledgement date',
    section: 'patientAcknowledgement', field: 'acknowledgementDate',
    type: 'date'
  }));
  ackGrid.appendChild(textInput({
    label: 'Signed by (patient or carer name)',
    section: 'patientAcknowledgement', field: 'signedBy'
  }));
  card.appendChild(ackGrid);

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
  const los = document.getElementById('los-readout');
  if (los) {
    const days = calculateLengthOfStay(
      state.admissionSummary.admissionDate,
      state.admissionSummary.dischargeDate
    );
    los.innerHTML = days == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${days}</strong> <span class="muted">day${days === 1 ? '' : 's'}</span>`;
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Patient details
  ['patientDetails', 'firstName'],
  ['patientDetails', 'lastName'],
  ['patientDetails', 'dateOfBirth'],
  ['patientDetails', 'sex'],
  ['patientDetails', 'nhsNumber'],
  ['patientDetails', 'address'],
  ['patientDetails', 'postcode'],
  ['patientDetails', 'gpName'],
  ['patientDetails', 'gpPractice'],
  ['patientDetails', 'nextOfKinName'],
  ['patientDetails', 'nextOfKinPhone'],
  // Admission summary
  ['admissionSummary', 'admissionDate'],
  ['admissionSummary', 'dischargeDate'],
  ['admissionSummary', 'ward'],
  ['admissionSummary', 'consultant'],
  ['admissionSummary', 'specialty'],
  ['admissionSummary', 'reasonForAdmission'],
  ['admissionSummary', 'clinicalNarrative'],
  // Procedures
  ['proceduresPerformed', 'noProceduresPerformed'],
  // Discharge medications
  ['dischargeMedications', 'reconciliationCompleted'],
  ['dischargeMedications', 'allergiesReviewed'],
  // Follow-up
  ['followupArrangements', 'gpFollowupRequired'],
  ['followupArrangements', 'outpatientFollowupRequired'],
  ['followupArrangements', 'investigationsPending'],
  // Community care
  ['communityCareInstructions', 'dischargeDestination'],
  ['communityCareInstructions', 'careResponsibility'],
  ['communityCareInstructions', 'transportMode'],
  ['communityCareInstructions', 'mobilityStatus'],
  // Warning signs
  ['warningSigns', 'whenToSeekHelp'],
  ['warningSigns', 'emergencyContactNumber'],
  ['warningSigns', 'safetyNetingProvided'],
  ['warningSigns', 'writtenInfoGiven'],
  // Clinician sign-off
  ['clinicianSignoff', 'clinicianName'],
  ['clinicianSignoff', 'clinicianRole'],
  ['clinicianSignoff', 'signoffDate'],
  ['clinicianSignoff', 'responsibleConsultantInformed'],
  // Patient acknowledgement
  ['patientAcknowledgement', 'patientUnderstandsPlan'],
  ['patientAcknowledgement', 'carerInformed'],
  ['patientAcknowledgement', 'medicationsExplained'],
  ['patientAcknowledgement', 'writtenSummaryProvided'],
  ['patientAcknowledgement', 'questionsAnswered']
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
  // List-based pseudo-fields. Each list contributes one slot to the totals
  // for its owning section so the step-list status reflects whether the
  // user has populated its repeating editor.
  const LIST_SLOTS = [
    {
      section: 'diagnoses',
      satisfied: state.diagnoses.diagnoses.some((x) => x.description)
    },
    {
      section: 'proceduresPerformed',
      satisfied:
        state.proceduresPerformed.procedures.some((p) => p.description) ||
        state.proceduresPerformed.noProceduresPerformed === 'yes'
    },
    {
      section: 'dischargeMedications',
      satisfied: state.dischargeMedications.medications.some((m) => m.name)
    },
    {
      section: 'followupArrangements',
      satisfied: state.followupArrangements.appointments.some((a) => a.provider)
    },
    {
      section: 'warningSigns',
      satisfied: state.warningSigns.redFlagSymptoms.some((s) => s)
    }
  ];
  for (const slot of LIST_SLOTS) {
    sectionTotal[slot.section] = (sectionTotal[slot.section] || 0) + 1;
    if (slot.satisfied) {
      answered++;
      sectionAnswered[slot.section] = (sectionAnswered[slot.section] || 0) + 1;
    }
  }
  const total = TRACKED_FIELDS.length + LIST_SLOTS.length;
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
  { step: 1,  section: 'patientDetails',          title: 'Patient Details' },
  { step: 2,  section: 'admissionSummary',        title: 'Admission Summary' },
  { step: 3,  section: 'diagnoses',               title: 'Diagnoses' },
  { step: 4,  section: 'proceduresPerformed',     title: 'Procedures' },
  { step: 5,  section: 'dischargeMedications',    title: 'Discharge Meds' },
  { step: 6,  section: 'followupArrangements',    title: 'Follow-up' },
  { step: 7,  section: 'communityCareInstructions', title: 'Community Care' },
  { step: 8,  section: 'warningSigns',            title: 'Warning Signs' },
  { step: 9,  section: 'clinicianSignoff',        title: 'Clinician Sign-off' },
  { step: 10, section: 'patientAcknowledgement',  title: 'Acknowledgement' }
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
      const label = labelEl
        ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim()
        : id;
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

  const {
    completenessLevel, mandatorySatisfied, mandatoryTotal,
    optionalSatisfied, optionalTotal, firedRules, additionalFlags, timestamp
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

  const ruleRow = (r) => `
    <tr>
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
      <td class="num">${r.mandatory ? 'Mandatory' : 'Optional'}</td>
      <td class="num">${r.satisfied ? '<span class="rule-ok">OK</span>' : '<span class="rule-miss">Missing</span>'}</td>
    </tr>
  `;
  const mandatoryRows = firedRules.filter((r) => r.mandatory).map(ruleRow).join('');
  const optionalRows = firedRules.filter((r) => !r.mandatory).map(ruleRow).join('');

  const ruleTable = `
    <table class="subscales">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Category</th>
          <th scope="col">Field</th>
          <th scope="col">Type</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>${mandatoryRows}${optionalRows}</tbody>
    </table>
  `;

  out.innerHTML = `
    <h2>Discharge Summary Completeness Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Completeness</h3>
    <p class="completeness-summary">
      <span class="completeness-badge ${completenessClass(completenessLevel)}">${esc(completenessLabel(completenessLevel))}</span>
    </p>
    <p class="muted">
      Mandatory: ${mandatorySatisfied} of ${mandatoryTotal} satisfied.
      Optional: ${optionalSatisfied} of ${optionalTotal} satisfied.
    </p>

    <h3>Per-rule audit</h3>
    ${ruleTable}

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
  const validation = validateDischarge(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    completenessLevel: validation.completenessLevel,
    mandatorySatisfied: validation.mandatorySatisfied,
    mandatoryTotal: validation.mandatoryTotal,
    optionalSatisfied: validation.optionalSatisfied,
    optionalTotal: validation.optionalTotal,
    firedRules: validation.firedRules,
    additionalFlags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh discharge summary?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the completeness report.</p>';
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
