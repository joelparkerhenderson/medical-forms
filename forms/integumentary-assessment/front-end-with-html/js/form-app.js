import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateBraden, riskLevelClass, riskLevelLabel } from './integumentary-grader.js';
import { bmiCategory, calculateBMI, calculateWoundArea, emptyAssessment } from './types.js';

// Integumentary Assessment - patient/clinician wizard (vanilla JavaScript,
// no build). Lily Design System HTML headless contract.
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. A step-list at the top of the page acts as a table of
// contents and reflects per-section completion. A native <progress> element
// reflects overall completion. Submission validates required fields, runs
// the pure Braden Scale scoring engine, and renders an inline report.
// State is persisted to localStorage so a partial fill survives a reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'integumentary-assessment.front-end-form-with-html.v1';
const TOTAL_STEPS = 9;

/** @returns {import('./types.js').AssessmentData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
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
  slug: 'integumentary-assessment',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const report = document.getElementById('report');
    if (report) {
      report.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
    }
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

function setField(section, field, value) {
  state[section][field] = value;
  recomputeDerived();
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
}

function recomputeDerived() {
  state.demographics.bmi = calculateBMI(
    state.demographics.weight,
    state.demographics.height
  );
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
// Component builders (Lily contract)
// ----------------------------------------------------------------------

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
    `value="${esc(value == null ? '' : value)}"`,
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
  const value = state[opts.section][opts.field] || '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const requiredAttr = opts.required ? ' required data-required' : '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      aria-describedby="${id}-error"${requiredAttr}
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
  const current = state[opts.section][opts.field] || '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select"
      aria-describedby="${id}-error"${requiredAttr}>
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
    const checked = String(current) === String(option.value) ? ' checked' : '';
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
  errSpan.setAttribute('aria-live', 'polite');
  wrapper.appendChild(errSpan);
  return wrapper;
}

/**
 * Stacked-radio group used for Braden subscales. Each option has a numeric
 * value (1-4) and shows a title + description.
 */
function bradenRadioGroup(opts) {
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
  list.className = 'radio-group stacked';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.htmlFor = radioId;
    const checked = Number(current) === Number(option.value) ? ' checked' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}>
      <span class="opt-text">
        <span class="opt-title">${option.value}. ${esc(option.title)}</span>
        <span class="opt-desc">${esc(option.desc)}</span>
      </span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) setField(opts.section, opts.field, Number(option.value));
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);
  return wrapper;
}

function checkboxGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] || [];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'checkbox-group grid';
  list.setAttribute('role', 'group');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const checkId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.htmlFor = checkId;
    const checked = current.includes(option.value) ? ' checked' : '';
    label.innerHTML = `
      <input class="checkbox-input" type="checkbox" id="${checkId}" name="${groupId}" value="${esc(option.value)}"${checked}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      const arr = state[opts.section][opts.field] || [];
      if (input.checked) {
        if (!arr.includes(option.value)) arr.push(option.value);
      } else {
        const idx = arr.indexOf(option.value);
        if (idx >= 0) arr.splice(idx, 1);
      }
      state[opts.section][opts.field] = arr;
      saveState(state);
      updateProgress();
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
    `<span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Repeating-list editors
// ----------------------------------------------------------------------

function lesionListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.skinInspection.lesions;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No specific lesions documented.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row';
      r.innerHTML = `
        <div class="list-grid lesion-grid">
          <label class="list-cell">
            <span>Site</span>
            <input type="text" class="text-input" data-key="site" value="${esc(row.site)}" placeholder="e.g. Left forearm">
          </label>
          <label class="list-cell">
            <span>Type</span>
            <input type="text" class="text-input" data-key="type" value="${esc(row.type)}" placeholder="e.g. Macule, papule">
          </label>
          <label class="list-cell">
            <span>Size</span>
            <input type="text" class="text-input" data-key="size" value="${esc(row.size)}" placeholder="e.g. 1.5 cm">
          </label>
          <label class="list-cell">
            <span>Description</span>
            <input type="text" class="text-input" data-key="description" value="${esc(row.description)}" placeholder="Colour, border, etc.">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove lesion">&times;</button>
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
    addBtn.textContent = '+ Add lesion';
    addBtn.addEventListener('click', () => {
      rows.push({ site: '', type: '', size: '', description: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

function photoListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.photographyDocumentation.photos;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No photographs recorded.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row';
      r.innerHTML = `
        <div class="list-grid photo-grid">
          <label class="list-cell">
            <span>Site</span>
            <input type="text" class="text-input" data-key="site" value="${esc(row.site)}" placeholder="e.g. Sacrum">
          </label>
          <label class="list-cell">
            <span>Date</span>
            <input type="date" class="date-input" data-key="date" value="${esc(row.date)}">
          </label>
          <label class="list-cell">
            <span>Reference / filename</span>
            <input type="text" class="text-input" data-key="reference" value="${esc(row.reference)}" placeholder="e.g. IMG_001">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove photo">&times;</button>
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
    addBtn.textContent = '+ Add photograph';
    addBtn.addEventListener('click', () => {
      rows.push({ site: '', date: '', reference: '' });
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
    title: 'Demographics',
    description: 'Basic patient information.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'demographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Date of Birth', section: 'demographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  card.appendChild(radioGroup({
    label: 'Sex', section: 'demographics', field: 'sex',
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
    type: 'number', min: 1, max: 400, unit: 'kg'
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'demographics', field: 'height',
    type: 'number', min: 50, max: 250, unit: 'cm'
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
    title: 'Presenting Skin Concern',
    description: 'Why is the patient being assessed today?'
  });

  card.appendChild(textArea({
    label: 'Chief complaint',
    section: 'presentingSkinConcern', field: 'chiefComplaint',
    placeholder: 'In the patient\u2019s own words…',
    rows: 2
  }));

  card.appendChild(selectInput({
    label: 'Onset',
    section: 'presentingSkinConcern', field: 'onset',
    options: [
      { value: 'sudden', label: 'Sudden (hours)' },
      { value: 'acute', label: 'Acute (days)' },
      { value: 'subacute', label: 'Subacute (weeks)' },
      { value: 'chronic', label: 'Chronic (months/years)' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Duration',
    section: 'presentingSkinConcern', field: 'duration',
    placeholder: 'e.g. 3 weeks'
  }));

  card.appendChild(textInput({
    label: 'Body location(s)',
    section: 'presentingSkinConcern', field: 'location',
    placeholder: 'e.g. Bilateral lower legs'
  }));

  card.appendChild(radioGroup({
    label: 'Pain at site?',
    section: 'presentingSkinConcern', field: 'pain',
    options: yesNo
  }));
  const painDetails = document.createElement('div');
  painDetails.dataset.conditional = 'presentingSkinConcern.pain=yes';
  painDetails.appendChild(textInput({
    label: 'Pain score (0-10)',
    section: 'presentingSkinConcern', field: 'painScore',
    type: 'number', min: 0, max: 10
  }));
  card.appendChild(painDetails);

  card.appendChild(radioGroup({ label: 'Itching?', section: 'presentingSkinConcern', field: 'itching', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Bleeding?', section: 'presentingSkinConcern', field: 'bleeding', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Discharge?', section: 'presentingSkinConcern', field: 'discharge', options: yesNo }));

  card.appendChild(textInput({
    label: 'Aggravating factors',
    section: 'presentingSkinConcern', field: 'aggravatingFactors',
    placeholder: 'e.g. heat, sweating, friction'
  }));
  card.appendChild(textInput({
    label: 'Relieving factors',
    section: 'presentingSkinConcern', field: 'relievingFactors',
    placeholder: 'e.g. cool compresses, antihistamines'
  }));
  card.appendChild(textArea({
    label: 'Prior treatment',
    section: 'presentingSkinConcern', field: 'priorTreatment',
    placeholder: 'OTC products, prescribed medications, dressings…',
    rows: 3
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Skin Inspection',
    description: 'Head-to-toe inspection: colour, moisture, integrity, turgor, temperature, lesions.'
  });

  card.appendChild(selectInput({
    label: 'Generalised skin colour',
    section: 'skinInspection', field: 'colour',
    options: [
      { value: 'normal', label: 'Normal for ethnicity' },
      { value: 'pale', label: 'Pale / pallor' },
      { value: 'flushed', label: 'Flushed / erythematous' },
      { value: 'jaundiced', label: 'Jaundiced' },
      { value: 'cyanotic', label: 'Cyanotic' },
      { value: 'mottled', label: 'Mottled' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Skin moisture',
    section: 'skinInspection', field: 'moisture',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'dry', label: 'Dry' },
      { value: 'very-dry', label: 'Very dry / cracked' },
      { value: 'moist', label: 'Moist' },
      { value: 'diaphoretic', label: 'Diaphoretic / sweaty' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Skin integrity',
    section: 'skinInspection', field: 'integrity',
    options: [
      { value: 'intact', label: 'Intact' },
      { value: 'fragile', label: 'Fragile / thin' },
      { value: 'breakdown', label: 'Areas of breakdown' },
      { value: 'open-lesions', label: 'Open lesions present' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Skin turgor',
    section: 'skinInspection', field: 'turgor',
    options: [
      { value: 'normal', label: 'Normal — recoils quickly' },
      { value: 'fair', label: 'Fair — slightly slow' },
      { value: 'poor', label: 'Poor — slow' },
      { value: 'tenting', label: 'Tenting — significantly delayed' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Skin temperature',
    section: 'skinInspection', field: 'temperature',
    options: [
      { value: 'normal', label: 'Normal / warm' },
      { value: 'cool', label: 'Cool' },
      { value: 'cold', label: 'Cold' },
      { value: 'hot', label: 'Hot / febrile' }
    ]
  }));

  card.appendChild(checkboxGroup({
    label: 'Lesion types observed (tick all that apply)',
    section: 'skinInspection', field: 'lesionTypes',
    options: [
      { value: 'macule', label: 'Macule (flat, <1cm)' },
      { value: 'papule', label: 'Papule (raised, <1cm)' },
      { value: 'plaque', label: 'Plaque (raised, >1cm)' },
      { value: 'nodule', label: 'Nodule' },
      { value: 'vesicle', label: 'Vesicle / blister' },
      { value: 'pustule', label: 'Pustule' },
      { value: 'wheal', label: 'Wheal / urticaria' },
      { value: 'ulcer', label: 'Ulcer' },
      { value: 'scar', label: 'Scar' },
      { value: 'fissure', label: 'Fissure' },
      { value: 'suspicious-pigmented', label: 'Suspicious pigmented lesion' }
    ]
  }));

  const lesionsHeader = document.createElement('div');
  lesionsHeader.className = 'list-section-header';
  lesionsHeader.innerHTML = `
    <h3>Specific lesions</h3>
    <p class="hint">Document each lesion individually with site, type, size, and description.</p>
  `;
  card.appendChild(lesionsHeader);
  card.appendChild(lesionListEditor());

  card.appendChild(textArea({
    label: 'Additional inspection notes',
    section: 'skinInspection', field: 'additionalNotes',
    placeholder: 'Any other findings…',
    rows: 3
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Hair & Scalp Examination',
    description: 'Distribution, texture, alopecia, scalp lesions.'
  });

  card.appendChild(selectInput({
    label: 'Hair distribution',
    section: 'hairScalpExamination', field: 'hairDistribution',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'thinning', label: 'Thinning' },
      { value: 'patchy', label: 'Patchy' },
      { value: 'sparse', label: 'Sparse / generalised loss' },
      { value: 'hirsutism', label: 'Hirsutism' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Hair texture',
    section: 'hairScalpExamination', field: 'hairTexture',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'fine', label: 'Fine / brittle' },
      { value: 'coarse', label: 'Coarse' },
      { value: 'dry', label: 'Dry' },
      { value: 'oily', label: 'Oily' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Alopecia present?',
    section: 'hairScalpExamination', field: 'alopecia',
    options: yesNo
  }));
  const alopeciaDetails = document.createElement('div');
  alopeciaDetails.dataset.conditional = 'hairScalpExamination.alopecia=yes';
  alopeciaDetails.appendChild(selectInput({
    label: 'Alopecia pattern',
    section: 'hairScalpExamination', field: 'alopeciaPattern',
    options: [
      { value: 'androgenetic', label: 'Androgenetic / pattern baldness' },
      { value: 'alopecia-areata', label: 'Alopecia areata (patchy)' },
      { value: 'totalis', label: 'Alopecia totalis (whole scalp)' },
      { value: 'universalis', label: 'Alopecia universalis (whole body)' },
      { value: 'traction', label: 'Traction alopecia' },
      { value: 'scarring', label: 'Scarring (cicatricial)' },
      { value: 'telogen-effluvium', label: 'Telogen effluvium' }
    ]
  }));
  card.appendChild(alopeciaDetails);

  card.appendChild(radioGroup({
    label: 'Scalp lesions present?',
    section: 'hairScalpExamination', field: 'scalpLesions',
    options: yesNo
  }));

  card.appendChild(checkboxGroup({
    label: 'Scalp findings (tick all that apply)',
    section: 'hairScalpExamination', field: 'scalpFindings',
    options: [
      { value: 'dandruff', label: 'Dandruff / seborrhoea' },
      { value: 'psoriasis', label: 'Psoriasis' },
      { value: 'lice', label: 'Pediculosis (head lice)' },
      { value: 'tinea', label: 'Tinea capitis' },
      { value: 'folliculitis', label: 'Folliculitis' },
      { value: 'cyst', label: 'Sebaceous cyst' },
      { value: 'naevus', label: 'Pigmented naevus' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Scalp / hair notes',
    section: 'hairScalpExamination', field: 'scalpNotes',
    placeholder: 'Any other findings…',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Nail Examination',
    description: 'Colour, shape, capillary refill, specific findings.'
  });

  card.appendChild(selectInput({
    label: 'Nail bed colour',
    section: 'nailExamination', field: 'nailColour',
    options: [
      { value: 'normal-pink', label: 'Normal pink' },
      { value: 'pale', label: 'Pale' },
      { value: 'cyanotic', label: 'Cyanotic / blue' },
      { value: 'yellow', label: 'Yellow' },
      { value: 'brown', label: 'Brown / pigmented' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Nail shape / curvature',
    section: 'nailExamination', field: 'nailShape',
    options: [
      { value: 'normal', label: 'Normal (~160°)' },
      { value: 'clubbed', label: 'Clubbed' },
      { value: 'spoon', label: 'Spoon (koilonychia)' },
      { value: 'beau-lines', label: 'Beau\u2019s lines' },
      { value: 'pitted', label: 'Pitted' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Capillary refill',
    section: 'nailExamination', field: 'nailCapillaryRefill',
    options: [
      { value: 'brisk', label: 'Brisk (<2 seconds)' },
      { value: 'normal', label: 'Normal (2-3 seconds)' },
      { value: 'sluggish', label: 'Sluggish (>3 seconds)' },
      { value: 'absent', label: 'Absent' }
    ]
  }));

  card.appendChild(checkboxGroup({
    label: 'Nail findings (tick all that apply)',
    section: 'nailExamination', field: 'nailFindings',
    options: [
      { value: 'clubbing', label: 'Clubbing' },
      { value: 'koilonychia', label: 'Koilonychia (spoon nails)' },
      { value: 'leukonychia', label: 'Leukonychia (white spots)' },
      { value: 'onycholysis', label: 'Onycholysis (separation)' },
      { value: 'paronychia', label: 'Paronychia (infection)' },
      { value: 'onychomycosis', label: 'Onychomycosis (fungal)' },
      { value: 'splinter-haemorrhages', label: 'Splinter haemorrhages' },
      { value: 'beau-lines', label: 'Beau\u2019s lines' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Nail notes',
    section: 'nailExamination', field: 'nailNotes',
    placeholder: 'Any other findings…',
    rows: 2
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Wound Assessment',
    description: 'If a wound is present, document stage and TIME (Tissue, Infection, Moisture, Edge).'
  });

  card.appendChild(radioGroup({
    label: 'Is a wound present?',
    section: 'woundAssessment', field: 'woundPresent',
    options: yesNo
  }));

  const woundFields = document.createElement('div');
  woundFields.dataset.conditional = 'woundAssessment.woundPresent=yes';

  woundFields.appendChild(textInput({
    label: 'Wound location',
    section: 'woundAssessment', field: 'woundLocation',
    placeholder: 'e.g. Sacrum, left heel'
  }));

  woundFields.appendChild(selectInput({
    label: 'Wound stage / classification',
    section: 'woundAssessment', field: 'woundStage',
    options: [
      { value: 'stage-i', label: 'Stage I — non-blanchable erythema' },
      { value: 'stage-ii', label: 'Stage II — partial-thickness skin loss' },
      { value: 'stage-iii', label: 'Stage III — full-thickness skin loss' },
      { value: 'stage-iv', label: 'Stage IV — full-thickness tissue loss (muscle/bone)' },
      { value: 'unstageable', label: 'Unstageable — slough/eschar obscures depth' },
      { value: 'deep-tissue-injury', label: 'Suspected deep tissue injury' },
      { value: 'non-pressure', label: 'Non-pressure wound (e.g. surgical, traumatic)' }
    ]
  }));

  const dimGrid = document.createElement('div');
  dimGrid.className = 'three-col';
  dimGrid.appendChild(textInput({
    label: 'Length', section: 'woundAssessment', field: 'woundLength',
    type: 'number', min: 0, max: 100, step: 0.1, unit: 'cm'
  }));
  dimGrid.appendChild(textInput({
    label: 'Width', section: 'woundAssessment', field: 'woundWidth',
    type: 'number', min: 0, max: 100, step: 0.1, unit: 'cm'
  }));
  dimGrid.appendChild(textInput({
    label: 'Depth', section: 'woundAssessment', field: 'woundDepth',
    type: 'number', min: 0, max: 100, step: 0.1, unit: 'cm'
  }));
  woundFields.appendChild(dimGrid);

  woundFields.appendChild(readOnlyReadout({
    label: 'Wound area (length × width)',
    id: 'wound-area-readout',
    render: () => {
      const a = calculateWoundArea(
        state.woundAssessment.woundLength,
        state.woundAssessment.woundWidth
      );
      if (a == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${a} cm²</strong>`;
    }
  }));

  woundFields.appendChild(selectInput({
    label: 'Tissue type (T)',
    section: 'woundAssessment', field: 'tissueType',
    options: [
      { value: 'granulation', label: 'Granulation (red, healthy)' },
      { value: 'epithelialising', label: 'Epithelialising (pink)' },
      { value: 'slough', label: 'Slough (yellow)' },
      { value: 'necrotic', label: 'Necrotic (black, soft)' },
      { value: 'eschar', label: 'Eschar (black, hard)' },
      { value: 'mixed', label: 'Mixed' }
    ]
  }));

  woundFields.appendChild(radioGroup({
    label: 'Signs of infection (I)? (erythema, warmth, swelling, purulence, fever)',
    section: 'woundAssessment', field: 'infectionSigns',
    options: yesNo
  }));

  woundFields.appendChild(selectInput({
    label: 'Moisture balance (M)',
    section: 'woundAssessment', field: 'moistureBalance',
    options: [
      { value: 'dry', label: 'Dry' },
      { value: 'balanced', label: 'Balanced' },
      { value: 'macerated', label: 'Macerated (over-moist)' }
    ]
  }));

  woundFields.appendChild(selectInput({
    label: 'Edge condition (E)',
    section: 'woundAssessment', field: 'edgeCondition',
    options: [
      { value: 'attached', label: 'Attached / advancing' },
      { value: 'rolled', label: 'Rolled (epibole)' },
      { value: 'undermined', label: 'Undermined' },
      { value: 'callused', label: 'Callused' },
      { value: 'macerated', label: 'Macerated' }
    ]
  }));

  woundFields.appendChild(selectInput({
    label: 'Exudate amount',
    section: 'woundAssessment', field: 'exudateAmount',
    options: [
      { value: 'none', label: 'None' },
      { value: 'minimal', label: 'Minimal' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'heavy', label: 'Heavy' }
    ]
  }));

  woundFields.appendChild(selectInput({
    label: 'Exudate type',
    section: 'woundAssessment', field: 'exudateType',
    options: [
      { value: 'serous', label: 'Serous (clear)' },
      { value: 'sanguineous', label: 'Sanguineous (bloody)' },
      { value: 'serosanguineous', label: 'Serosanguineous' },
      { value: 'purulent', label: 'Purulent' }
    ]
  }));

  woundFields.appendChild(selectInput({
    label: 'Wound odour',
    section: 'woundAssessment', field: 'woundOdour',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'strong', label: 'Strong' },
      { value: 'foul', label: 'Foul' }
    ]
  }));

  woundFields.appendChild(textArea({
    label: 'Wound notes',
    section: 'woundAssessment', field: 'woundNotes',
    placeholder: 'Tunnelling, undermining measurements, surrounding skin…',
    rows: 3
  }));

  card.appendChild(woundFields);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Braden Scale Scoring',
    description: 'Pressure-ulcer risk: score each subscale based on observed status.'
  });

  card.appendChild(bradenRadioGroup({
    label: '1. Sensory perception — ability to respond meaningfully to pressure-related discomfort',
    section: 'bradenScale', field: 'sensoryPerception',
    options: [
      { value: 1, title: 'Completely limited',
        desc: 'Unresponsive (does not moan, flinch, or grasp) to painful stimuli OR limited ability to feel pain over most of body surface.' },
      { value: 2, title: 'Very limited',
        desc: 'Responds only to painful stimuli; cannot communicate discomfort except by moaning or restlessness, OR has a sensory impairment limiting feeling pain or discomfort over half of body.' },
      { value: 3, title: 'Slightly limited',
        desc: 'Responds to verbal commands but cannot always communicate discomfort, OR has some sensory impairment limiting ability to feel pain in 1-2 extremities.' },
      { value: 4, title: 'No impairment',
        desc: 'Responds to verbal commands; has no sensory deficit which would limit ability to feel or voice pain or discomfort.' }
    ]
  }));

  card.appendChild(bradenRadioGroup({
    label: '2. Moisture — degree to which skin is exposed to moisture',
    section: 'bradenScale', field: 'moisture',
    options: [
      { value: 1, title: 'Constantly moist',
        desc: 'Skin is kept moist almost constantly by perspiration, urine, etc.; dampness detected every time patient is moved or turned.' },
      { value: 2, title: 'Very moist',
        desc: 'Skin is often, but not always, moist; linen must be changed at least once a shift.' },
      { value: 3, title: 'Occasionally moist',
        desc: 'Skin is occasionally moist, requiring an extra linen change approximately once a day.' },
      { value: 4, title: 'Rarely moist',
        desc: 'Skin is usually dry; linen only requires changing at routine intervals.' }
    ]
  }));

  card.appendChild(bradenRadioGroup({
    label: '3. Activity — degree of physical activity',
    section: 'bradenScale', field: 'activity',
    options: [
      { value: 1, title: 'Bedfast', desc: 'Confined to bed.' },
      { value: 2, title: 'Chairfast',
        desc: 'Ability to walk severely limited or non-existent; cannot bear own weight and/or must be assisted into chair or wheelchair.' },
      { value: 3, title: 'Walks occasionally',
        desc: 'Walks occasionally during day, but for very short distances, with or without assistance; spends majority of each shift in bed or chair.' },
      { value: 4, title: 'Walks frequently',
        desc: 'Walks outside the room at least twice a day and inside the room at least once every 2 hours during waking hours.' }
    ]
  }));

  card.appendChild(bradenRadioGroup({
    label: '4. Mobility — ability to change and control body position',
    section: 'bradenScale', field: 'mobility',
    options: [
      { value: 1, title: 'Completely immobile',
        desc: 'Does not make even slight changes in body or extremity position without assistance.' },
      { value: 2, title: 'Very limited',
        desc: 'Makes occasional slight changes in body or extremity position, but unable to make frequent or significant changes independently.' },
      { value: 3, title: 'Slightly limited',
        desc: 'Makes frequent though slight changes in body or extremity position independently.' },
      { value: 4, title: 'No limitations',
        desc: 'Makes major and frequent changes in position without assistance.' }
    ]
  }));

  card.appendChild(bradenRadioGroup({
    label: '5. Nutrition — usual food intake pattern',
    section: 'bradenScale', field: 'nutrition',
    options: [
      { value: 1, title: 'Very poor',
        desc: 'Never eats a complete meal; rarely eats more than 1/3 of any food offered, OR is NPO and/or maintained on clear liquids or IVs for more than 5 days.' },
      { value: 2, title: 'Probably inadequate',
        desc: 'Rarely eats a complete meal and generally eats only about 1/2 of any food offered, OR receives less than optimum amount of liquid diet or tube feeding.' },
      { value: 3, title: 'Adequate',
        desc: 'Eats over half of most meals; eats a total of 4 servings of protein each day, OR is on a tube feeding or TPN regimen which probably meets most nutritional needs.' },
      { value: 4, title: 'Excellent',
        desc: 'Eats most of every meal; never refuses; usually eats a total of 4+ servings of meat and dairy products. Occasionally eats between meals; does not require supplementation.' }
    ]
  }));

  card.appendChild(bradenRadioGroup({
    label: '6. Friction and shear',
    section: 'bradenScale', field: 'frictionShear',
    options: [
      { value: 1, title: 'Problem',
        desc: 'Requires moderate to maximum assistance in moving; complete lifting without sliding against sheets is impossible; frequently slides down in bed or chair, requiring frequent repositioning with maximum assistance.' },
      { value: 2, title: 'Potential problem',
        desc: 'Moves feebly or requires minimum assistance; during a move skin probably slides to some extent against sheets, chair, restraints, or other devices; maintains relatively good position in chair or bed most of the time but occasionally slides down.' },
      { value: 3, title: 'No apparent problem',
        desc: 'Moves in bed and in chair independently and has sufficient muscle strength to lift up completely during move; maintains good position in bed or chair at all times.' }
    ]
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Photography & Documentation',
    description: 'Photographic documentation of skin findings (with consent).'
  });

  card.appendChild(radioGroup({
    label: 'Has the patient given consent for clinical photography?',
    section: 'photographyDocumentation', field: 'consentObtained',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Were photographs taken at this assessment?',
    section: 'photographyDocumentation', field: 'photosTaken',
    options: yesNo
  }));

  const photosFields = document.createElement('div');
  photosFields.dataset.conditional = 'photographyDocumentation.photosTaken=yes';

  const photosHeader = document.createElement('div');
  photosHeader.className = 'list-section-header';
  photosHeader.innerHTML = `
    <h3>Photograph references</h3>
    <p class="hint">Document the site, date, and a reference number / filename for each image stored in the patient record.</p>
  `;
  photosFields.appendChild(photosHeader);
  photosFields.appendChild(photoListEditor());

  card.appendChild(photosFields);

  card.appendChild(textArea({
    label: 'Documentation notes',
    section: 'photographyDocumentation', field: 'documentationNotes',
    placeholder: 'Where images are stored, body-map references, etc.',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Clinical Impression & Care Plan',
    description: 'Synthesis: working diagnosis, plan, dressings, referrals, and follow-up.'
  });

  card.appendChild(textArea({
    label: 'Clinical impression / working diagnosis',
    section: 'clinicalImpressionCarePlan', field: 'clinicalImpression',
    placeholder: 'Most likely diagnosis based on findings…',
    rows: 3
  }));

  card.appendChild(textArea({
    label: 'Differential diagnoses',
    section: 'clinicalImpressionCarePlan', field: 'differentialDiagnoses',
    placeholder: 'Other possibilities to consider…',
    rows: 2
  }));

  card.appendChild(textArea({
    label: 'Care plan',
    section: 'clinicalImpressionCarePlan', field: 'carePlan',
    placeholder: 'Pressure-redistribution, repositioning schedule, skin-care regimen, education…',
    rows: 4
  }));

  card.appendChild(radioGroup({
    label: 'Dressing required?',
    section: 'clinicalImpressionCarePlan', field: 'dressingRequired',
    options: yesNo
  }));
  const dressingDetails = document.createElement('div');
  dressingDetails.dataset.conditional = 'clinicalImpressionCarePlan.dressingRequired=yes';
  dressingDetails.appendChild(textInput({
    label: 'Dressing type / regimen',
    section: 'clinicalImpressionCarePlan', field: 'dressingType',
    placeholder: 'e.g. Hydrocolloid, foam, alginate'
  }));
  card.appendChild(dressingDetails);

  card.appendChild(radioGroup({
    label: 'Pressure-relief equipment required?',
    section: 'clinicalImpressionCarePlan', field: 'pressureReliefRequired',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Onward referral required?',
    section: 'clinicalImpressionCarePlan', field: 'referralRequired',
    options: yesNo
  }));
  const referralDetails = document.createElement('div');
  referralDetails.dataset.conditional = 'clinicalImpressionCarePlan.referralRequired=yes';
  referralDetails.appendChild(textInput({
    label: 'Referral details',
    section: 'clinicalImpressionCarePlan', field: 'referralDetails',
    placeholder: 'e.g. Tissue-viability nurse, dermatology, vascular'
  }));
  card.appendChild(referralDetails);

  card.appendChild(textInput({
    label: 'Follow-up date',
    section: 'clinicalImpressionCarePlan', field: 'followUpDate',
    type: 'date'
  }));

  card.appendChild(textInput({
    label: 'Assessing clinician',
    section: 'clinicalImpressionCarePlan', field: 'clinicianName',
    placeholder: 'Full name and role'
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
    const current = state[section] ? state[section][field] : undefined;
    host.style.display = String(current) === target ? '' : 'none';
  });
  document.querySelectorAll('[data-conditional-any]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-any');
    const [path, targetCsv] = expr.split('=');
    const [section, field] = path.split('.');
    const current = String(state[section] ? (state[section][field] ?? '') : '');
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
  const wa = document.getElementById('wound-area-readout');
  if (wa) {
    const v = calculateWoundArea(
      state.woundAssessment.woundLength,
      state.woundAssessment.woundWidth
    );
    wa.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v} cm²</strong>`;
  }
}

// ----------------------------------------------------------------------
// Progress + step list
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'demographics',                title: 'Demographics' },
  { step: 2, section: 'presentingSkinConcern',       title: 'Skin Concern' },
  { step: 3, section: 'skinInspection',              title: 'Skin Inspection' },
  { step: 4, section: 'hairScalpExamination',        title: 'Hair & Scalp' },
  { step: 5, section: 'nailExamination',             title: 'Nails' },
  { step: 6, section: 'woundAssessment',             title: 'Wound' },
  { step: 7, section: 'bradenScale',                 title: 'Braden Scale' },
  { step: 8, section: 'photographyDocumentation',    title: 'Photography' },
  { step: 9, section: 'clinicalImpressionCarePlan',  title: 'Impression' }
];

const TRACKED_FIELDS = [
  // Demographics (6)
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'weight'],
  ['demographics', 'height'],
  // Presenting Skin Concern (8)
  ['presentingSkinConcern', 'chiefComplaint'],
  ['presentingSkinConcern', 'onset'],
  ['presentingSkinConcern', 'duration'],
  ['presentingSkinConcern', 'location'],
  ['presentingSkinConcern', 'pain'],
  ['presentingSkinConcern', 'itching'],
  ['presentingSkinConcern', 'bleeding'],
  ['presentingSkinConcern', 'discharge'],
  // Skin Inspection (5)
  ['skinInspection', 'colour'],
  ['skinInspection', 'moisture'],
  ['skinInspection', 'integrity'],
  ['skinInspection', 'turgor'],
  ['skinInspection', 'temperature'],
  // Hair & Scalp (4)
  ['hairScalpExamination', 'hairDistribution'],
  ['hairScalpExamination', 'hairTexture'],
  ['hairScalpExamination', 'alopecia'],
  ['hairScalpExamination', 'scalpLesions'],
  // Nail (3)
  ['nailExamination', 'nailColour'],
  ['nailExamination', 'nailShape'],
  ['nailExamination', 'nailCapillaryRefill'],
  // Wound (1; cascading fields gated by woundPresent)
  ['woundAssessment', 'woundPresent'],
  // Braden subscales (6)
  ['bradenScale', 'sensoryPerception'],
  ['bradenScale', 'moisture'],
  ['bradenScale', 'activity'],
  ['bradenScale', 'mobility'],
  ['bradenScale', 'nutrition'],
  ['bradenScale', 'frictionShear'],
  // Photography (2)
  ['photographyDocumentation', 'consentObtained'],
  ['photographyDocumentation', 'photosTaken'],
  // Clinical Impression (5)
  ['clinicalImpressionCarePlan', 'clinicalImpression'],
  ['clinicalImpressionCarePlan', 'carePlan'],
  ['clinicalImpressionCarePlan', 'dressingRequired'],
  ['clinicalImpressionCarePlan', 'pressureReliefRequired'],
  ['clinicalImpressionCarePlan', 'referralRequired']
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
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(sectionAnswered, sectionTotal);
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
    const id = input.id || input.name;
    if (!id || seen.has(id)) return;
    // For radios, only validate per group name
    if (input.type === 'radio') {
      const groupName = input.name;
      if (seen.has(groupName)) return;
      seen.add(groupName);
      const checked = form.querySelector(`input[type="radio"][name="${groupName}"]:checked`);
      if (!checked) {
        const fs = document.getElementById(`${groupName}-fieldset`);
        const legend = fs ? fs.querySelector('legend') : null;
        const label = legend ? legend.textContent.replace(/\s*\*\s*$/, '').trim() : groupName;
        errors.push({ id: groupName, message: `${label} is required` });
        setFieldError(groupName, `${label} is required`);
      } else {
        clearFieldError(groupName);
      }
      return;
    }
    seen.add(id);
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
  summary.setAttribute('tabindex', '-1');
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (typeof summary.focus === 'function') {
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { bradenScore, riskLevel, answeredCount, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td class="num">${r.score} / ${r.maxScore}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No Braden subscales answered.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Subscale</th>
            <th scope="col">Description</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <h2>Integumentary Assessment Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Braden Total Score</h3>
    <p class="braden-summary">
      <span class="braden-score-badge ${riskLevelClass(riskLevel)}">${bradenScore} / 23</span>
      <span class="risk-level">${esc(riskLevelLabel(riskLevel))}</span>
    </p>
    <p class="muted">Based on ${answeredCount} of 6 Braden subscales answered.</p>

    <h3>Per-subscale scores</h3>
    ${firedTable}

    <h3>Flagged Issues</h3>
    ${flagsList}

    <div class="report-actions">
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const startBtn = document.getElementById('start-over-btn');
  if (startBtn) startBtn.addEventListener('click', startOver);
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  recomputeDerived();
  const { bradenScore, riskLevel, answeredCount, firedRules } = calculateBraden(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    bradenScore,
    riskLevel,
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
  const report = document.getElementById('report');
  if (report) {
    report.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  }
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
