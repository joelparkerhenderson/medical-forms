import { calculateDASH } from './dash-grader.js';
import { dashQuestions, getResponseOptions } from './dash-rules.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateAge, dashCategory, dashCategoryClass, emptyAssessment } from './types.js';

// Orthopedic Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure DASH scoring engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'orthopedic-assessment.front-end-form-with-html.v1';

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
      // Deep-merge nested imaging study objects so any newly-added field
      // defaults correctly when loading from older saved state.
      if (key === 'imagingHistory') {
        for (const study of Object.keys(fresh.imagingHistory)) {
          fresh.imagingHistory[study] = {
            ...fresh.imagingHistory[study],
            ...(parsed.imagingHistory?.[study] || {})
          };
        }
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

let state = loadState();
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'orthopedic-assessment',
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
}

function setNestedField(section, subsection, field, value) {
  state[section][subsection][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
}

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

/**
 * Build a labelled text input.
 */
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

/** Text input bound to a nested field (e.g., imagingHistory.xRay.date). */
function nestedTextInput(opts) {
  const id = `${opts.section}-${opts.subsection}-${opts.field}`;
  const value = state[opts.section][opts.subsection][opts.field];
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

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    let v = input.value;
    if (type === 'number') v = v === '' ? null : Number(v);
    setNestedField(opts.section, opts.subsection, opts.field, v);
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

function nestedTextArea(opts) {
  const id = `${opts.section}-${opts.subsection}-${opts.field}`;
  const value = state[opts.section][opts.subsection][opts.field] ?? '';
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
  ta.addEventListener('input', () => { setNestedField(opts.section, opts.subsection, opts.field, ta.value); clearFieldError(id); });
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
    <label class="label" for="${id}">${esc(opts.label)}${opts.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
    <select id="${id}" name="${id}" class="select" ${opts.required ? 'required data-required' : ''} aria-describedby="${id}-error">
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

function nestedRadioGroup(opts) {
  const groupId = `${opts.section}-${opts.subsection}-${opts.field}`;
  const current = state[opts.section][opts.subsection][opts.field];
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
        setNestedField(opts.section, opts.subsection, opts.field, option.value);
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

/** Multi-select checkbox group bound to a string[] field. */
function checkboxGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;
  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'checkbox-group';
  list.setAttribute('role', 'group');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const checkboxId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.htmlFor = checkboxId;
    const current = state[opts.section][opts.field] || [];
    const checked = current.includes(option.value) ? ' checked' : '';
    label.innerHTML = `
      <input class="checkbox-input" type="checkbox" id="${checkboxId}" value="${esc(option.value)}"${checked}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      const arr = state[opts.section][opts.field] || [];
      if (input.checked) {
        if (!arr.includes(option.value)) arr.push(option.value);
      } else {
        const idx = arr.indexOf(option.value);
        if (idx !== -1) arr.splice(idx, 1);
      }
      state[opts.section][opts.field] = arr;
      saveState(state);
      updateProgress();
      updateConditionalSections();
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);
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

// ----------------------------------------------------------------------
// Repeating-list editors (medications, allergies, surgeries)
// ----------------------------------------------------------------------

function medicationListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.currentTreatment.medications;
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
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Ibuprofen">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 400 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. PRN, BD">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove medication">&times;</button>
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

function drugAllergyEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.currentTreatment.allergies;
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

function previousSurgeryEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';
  wrapper.dataset.conditional = 'surgicalHistory.previousOrthopedicSurgery=yes';

  function rerender() {
    const rows = state.surgicalHistory.surgeries;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No previous surgeries added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row surgery-row';
      r.innerHTML = `
        <div class="list-grid surgery-grid">
          <label class="list-cell">
            <span>Procedure</span>
            <input type="text" class="text-input" data-key="procedure" value="${esc(row.procedure)}" placeholder="e.g. Knee arthroscopy">
          </label>
          <label class="list-cell">
            <span>Date</span>
            <input type="date" class="text-input" data-key="date" value="${esc(row.date)}">
          </label>
          <label class="list-cell">
            <span>Outcome</span>
            <input type="text" class="text-input" data-key="outcome" value="${esc(row.outcome)}" placeholder="e.g. Good, complications">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove surgery">&times;</button>
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
    addBtn.textContent = '+ Add surgery';
    addBtn.addEventListener('click', () => {
      rows.push({ procedure: '', date: '', outcome: '' });
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
    section: 'demographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));

  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'demographics', field: 'sex',
    required: true,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Occupation',
    section: 'demographics', field: 'occupation',
    placeholder: 'e.g. Construction worker, Office clerk, Retired'
  }));

  card.appendChild(radioGroup({
    label: 'Dominant Hand',
    section: 'demographics', field: 'dominantHand',
    required: true,
    options: [
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' },
      { value: 'ambidextrous', label: 'Ambidextrous' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Chief Complaint',
    description: 'Describe your primary orthopedic concern.'
  });

  card.appendChild(textArea({
    label: 'What is your primary concern?',
    section: 'chiefComplaint', field: 'primaryConcern',
    placeholder: 'Describe your main orthopedic problem…',
    rows: 3
  }));

  card.appendChild(selectInput({
    label: 'Affected Joint / Region',
    section: 'chiefComplaint', field: 'affectedJoint',
    required: true,
    options: [
      { value: 'Shoulder', label: 'Shoulder' },
      { value: 'Elbow', label: 'Elbow' },
      { value: 'Wrist', label: 'Wrist' },
      { value: 'Hand', label: 'Hand' },
      { value: 'Hip', label: 'Hip' },
      { value: 'Knee', label: 'Knee' },
      { value: 'Ankle', label: 'Ankle' },
      { value: 'Foot', label: 'Foot' },
      { value: 'Spine - Cervical', label: 'Spine - Cervical' },
      { value: 'Spine - Thoracic', label: 'Spine - Thoracic' },
      { value: 'Spine - Lumbar', label: 'Spine - Lumbar' },
      { value: 'Other', label: 'Other' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Side',
    section: 'chiefComplaint', field: 'side',
    required: true,
    options: [
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' },
      { value: 'bilateral', label: 'Bilateral' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Duration',
    section: 'chiefComplaint', field: 'duration',
    placeholder: 'e.g. 2 weeks, 3 months, 5 years',
    required: true
  }));

  card.appendChild(radioGroup({
    label: 'Onset Type',
    section: 'chiefComplaint', field: 'onsetType',
    required: true,
    options: [
      { value: 'acute', label: 'Acute' },
      { value: 'gradual', label: 'Gradual' },
      { value: 'traumatic', label: 'Traumatic' },
      { value: 'overuse', label: 'Overuse' }
    ]
  }));

  card.appendChild(checkboxGroup({
    label: 'Aggravating Factors',
    section: 'chiefComplaint', field: 'aggravatingFactors',
    options: [
      { value: 'movement', label: 'Movement' },
      { value: 'weight-bearing', label: 'Weight bearing' },
      { value: 'lifting', label: 'Lifting' },
      { value: 'gripping', label: 'Gripping' },
      { value: 'overhead-activity', label: 'Overhead activity' },
      { value: 'prolonged-sitting', label: 'Prolonged sitting' },
      { value: 'prolonged-standing', label: 'Prolonged standing' },
      { value: 'swelling', label: 'Swelling' },
      { value: 'redness', label: 'Redness' },
      { value: 'cold-weather', label: 'Cold weather' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Pain Assessment',
    description: 'Rate your pain levels and describe the character of your pain.'
  });

  card.appendChild(textInput({
    label: 'Current Pain Level',
    section: 'painAssessment', field: 'currentPainLevel',
    type: 'number', min: 0, max: 10, unit: '0–10', required: true
  }));
  card.appendChild(textInput({
    label: 'Worst Pain (in the past week)',
    section: 'painAssessment', field: 'worstPain',
    type: 'number', min: 0, max: 10, unit: '0–10', required: true
  }));
  card.appendChild(textInput({
    label: 'Best Pain (in the past week)',
    section: 'painAssessment', field: 'bestPain',
    type: 'number', min: 0, max: 10, unit: '0–10', required: true
  }));

  card.appendChild(selectInput({
    label: 'Pain Character',
    section: 'painAssessment', field: 'painCharacter',
    required: true,
    options: [
      { value: 'sharp', label: 'Sharp' },
      { value: 'dull', label: 'Dull' },
      { value: 'aching', label: 'Aching' },
      { value: 'burning', label: 'Burning' },
      { value: 'throbbing', label: 'Throbbing' },
      { value: 'stabbing', label: 'Stabbing' },
      { value: 'radiating', label: 'Radiating' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Pain Frequency',
    section: 'painAssessment', field: 'painFrequency',
    required: true,
    options: [
      { value: 'constant', label: 'Constant' },
      { value: 'intermittent', label: 'Intermittent' },
      { value: 'activity-related', label: 'Activity-related' },
      { value: 'night-only', label: 'Night only' },
      { value: 'morning-stiffness', label: 'Morning stiffness' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Do you experience night pain?',
    section: 'painAssessment', field: 'nightPain',
    required: true, options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have pain with weight bearing?',
    section: 'painAssessment', field: 'painWithWeightBearing',
    required: true, options: yesNo
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'DASH Questionnaire',
    description: 'Disabilities of the Arm, Shoulder and Hand — rate your ability to perform the following activities in the past week (minimum 27 of 30 items required).'
  });

  let lastDomain = '';
  dashQuestions.forEach((question, i) => {
    if (question.domain !== lastDomain) {
      const head = document.createElement('div');
      head.className = 'dash-domain-header';
      head.innerHTML = `<h3>${esc(question.domain)}</h3>`;
      card.appendChild(head);
      lastDomain = question.domain;
    }

    const fieldKey = `q${i + 1}`;
    const current = state.dashQuestionnaire[fieldKey];
    const groupId = `dash-${fieldKey}`;
    const wrapper = document.createElement('fieldset');
    wrapper.className = 'field radio-group dash-question';

    const legend = document.createElement('legend');
    legend.innerHTML = `<span class="dash-q-num">${i + 1}.</span> ${esc(question.text)}`;
    wrapper.appendChild(legend);

    const list = document.createElement('div');
    list.className = 'radio-options';
    for (const opt of getResponseOptions(question.questionNumber)) {
      const radioId = `${groupId}-${opt.value}`;
      const label = document.createElement('label');
      label.className = 'radio-option';
      label.htmlFor = radioId;
      const checked = current === opt.value ? ' checked' : '';
      label.innerHTML = `
        <input type="radio" id="${radioId}" name="${groupId}" value="${opt.value}"${checked}>
        <span><strong>${opt.value}</strong> ${esc(opt.label)}</span>
      `;
      const input = label.querySelector('input');
      input.addEventListener('change', () => {
        if (input.checked) {
          state.dashQuestionnaire[fieldKey] = opt.value;
          saveState(state);
          updateProgress();
        }
      });
      list.appendChild(label);
    }
    wrapper.appendChild(list);
    card.appendChild(wrapper);
  });

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Range of Motion',
    description: 'Joint-specific range of motion measurements (in degrees).'
  });

  card.appendChild(textInput({
    label: 'Joint Assessed',
    section: 'rangeOfMotion', field: 'joint',
    placeholder: 'e.g. Right shoulder, Left knee', required: true
  }));

  const grid1 = document.createElement('div');
  grid1.className = 'two-col';
  grid1.appendChild(textInput({
    label: 'Flexion', section: 'rangeOfMotion', field: 'flexion',
    type: 'number', min: 0, max: 360, unit: 'degrees'
  }));
  grid1.appendChild(textInput({
    label: 'Extension', section: 'rangeOfMotion', field: 'extension',
    type: 'number', min: 0, max: 360, unit: 'degrees'
  }));
  card.appendChild(grid1);

  const grid2 = document.createElement('div');
  grid2.className = 'two-col';
  grid2.appendChild(textInput({
    label: 'Abduction', section: 'rangeOfMotion', field: 'abduction',
    type: 'number', min: 0, max: 360, unit: 'degrees'
  }));
  grid2.appendChild(textInput({
    label: 'Adduction', section: 'rangeOfMotion', field: 'adduction',
    type: 'number', min: 0, max: 360, unit: 'degrees'
  }));
  card.appendChild(grid2);

  const grid3 = document.createElement('div');
  grid3.className = 'two-col';
  grid3.appendChild(textInput({
    label: 'Internal Rotation', section: 'rangeOfMotion', field: 'internalRotation',
    type: 'number', min: 0, max: 360, unit: 'degrees'
  }));
  grid3.appendChild(textInput({
    label: 'External Rotation', section: 'rangeOfMotion', field: 'externalRotation',
    type: 'number', min: 0, max: 360, unit: 'degrees'
  }));
  card.appendChild(grid3);

  card.appendChild(textArea({
    label: 'Additional Notes',
    section: 'rangeOfMotion', field: 'notes',
    placeholder: 'Any additional observations about range of motion…',
    rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Strength Testing',
    description: 'Grip strength and manual muscle testing results.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Grip Strength — Left',
    section: 'strengthTesting', field: 'gripStrengthLeft',
    type: 'number', min: 0, max: 100, unit: 'kg'
  }));
  grid.appendChild(textInput({
    label: 'Grip Strength — Right',
    section: 'strengthTesting', field: 'gripStrengthRight',
    type: 'number', min: 0, max: 100, unit: 'kg'
  }));
  card.appendChild(grid);

  card.appendChild(selectInput({
    label: 'Manual Muscle Testing Grade',
    section: 'strengthTesting', field: 'manualMuscleGrade',
    options: [
      { value: '0/5', label: '0/5 — No contraction' },
      { value: '1/5', label: '1/5 — Flicker/trace of contraction' },
      { value: '2/5', label: '2/5 — Active movement, gravity eliminated' },
      { value: '3/5', label: '3/5 — Active movement against gravity' },
      { value: '4/5', label: '4/5 — Active movement against some resistance' },
      { value: '5/5', label: '5/5 — Normal power' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Specific Weaknesses',
    section: 'strengthTesting', field: 'specificWeaknesses',
    placeholder: 'Describe any specific muscle groups showing weakness…',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Functional Limitations',
    description: 'Describe how your condition affects your daily activities.'
  });

  card.appendChild(checkboxGroup({
    label: 'Difficulty with Activities of Daily Living',
    section: 'functionalLimitations', field: 'difficultyWithADLs',
    options: [
      { value: 'dressing', label: 'Dressing' },
      { value: 'bathing', label: 'Bathing' },
      { value: 'cooking', label: 'Cooking' },
      { value: 'cleaning', label: 'Cleaning' },
      { value: 'driving', label: 'Driving' },
      { value: 'writing', label: 'Writing' },
      { value: 'typing', label: 'Typing' },
      { value: 'lifting', label: 'Lifting' },
      { value: 'carrying', label: 'Carrying' },
      { value: 'reaching-overhead', label: 'Reaching overhead' },
      { value: 'gripping', label: 'Gripping objects' },
      { value: 'opening-jars', label: 'Opening jars' }
    ]
  }));

  card.appendChild(checkboxGroup({
    label: 'Mobility Aids Currently Used',
    section: 'functionalLimitations', field: 'mobilityAids',
    options: [
      { value: 'sling', label: 'Sling' },
      { value: 'brace', label: 'Brace' },
      { value: 'splint', label: 'Splint' },
      { value: 'cane', label: 'Cane' },
      { value: 'crutches', label: 'Crutches' },
      { value: 'walker', label: 'Walker' },
      { value: 'wheelchair', label: 'Wheelchair' },
      { value: 'none', label: 'None' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Work Restrictions',
    section: 'functionalLimitations', field: 'workRestrictions',
    placeholder: 'Describe any work limitations or restrictions…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Sport / Recreation Restrictions',
    section: 'functionalLimitations', field: 'sportRestrictions',
    placeholder: 'Describe any sport or recreational activity limitations…',
    rows: 3
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Imaging History',
    description: 'Previous imaging studies related to your orthopedic condition.'
  });

  const studies = [
    { key: 'xRay',       label: 'X-Ray',      qLabel: 'Has an X-ray been performed?' },
    { key: 'mri',        label: 'MRI',        qLabel: 'Has an MRI been performed?' },
    { key: 'ctScan',     label: 'CT Scan',    qLabel: 'Has a CT scan been performed?' },
    { key: 'ultrasound', label: 'Ultrasound', qLabel: 'Has an ultrasound been performed?' }
  ];

  for (const s of studies) {
    const block = document.createElement('div');
    block.className = 'imaging-block';
    block.innerHTML = `<h3>${esc(s.label)}</h3>`;
    block.appendChild(nestedRadioGroup({
      label: s.qLabel,
      section: 'imagingHistory', subsection: s.key, field: 'performed',
      options: yesNo
    }));
    const detailsHost = document.createElement('div');
    detailsHost.dataset.conditionalNested = `imagingHistory.${s.key}.performed=yes`;
    detailsHost.appendChild(nestedTextInput({
      label: 'Date',
      section: 'imagingHistory', subsection: s.key, field: 'date',
      type: 'date'
    }));
    detailsHost.appendChild(nestedTextArea({
      label: 'Findings',
      section: 'imagingHistory', subsection: s.key, field: 'findings',
      placeholder: `Describe ${s.label} findings…`,
      rows: 3
    }));
    block.appendChild(detailsHost);
    card.appendChild(block);
  }

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Current Treatment',
    description: 'Current medications, therapies, and allergy information.'
  });

  const medsHeader = document.createElement('div');
  medsHeader.className = 'list-section-header';
  medsHeader.innerHTML = '<h3>Current Medications</h3>';
  card.appendChild(medsHeader);
  card.appendChild(medicationListEditor());

  card.appendChild(radioGroup({
    label: 'Are you currently having physical therapy?',
    section: 'currentTreatment', field: 'physicalTherapy',
    options: yesNo
  }));
  const ptDetails = document.createElement('div');
  ptDetails.dataset.conditional = 'currentTreatment.physicalTherapy=yes';
  ptDetails.appendChild(textArea({
    label: 'Physical Therapy Details',
    section: 'currentTreatment', field: 'physicalTherapyDetails',
    placeholder: 'Describe your physical therapy regimen…',
    rows: 3
  }));
  card.appendChild(ptDetails);

  card.appendChild(radioGroup({
    label: 'Have you had any joint injections?',
    section: 'currentTreatment', field: 'injections',
    options: yesNo
  }));
  const injDetails = document.createElement('div');
  injDetails.dataset.conditional = 'currentTreatment.injections=yes';
  injDetails.appendChild(textArea({
    label: 'Injection Details',
    section: 'currentTreatment', field: 'injectionDetails',
    placeholder: 'Describe injections received (type, location, date)…',
    rows: 3
  }));
  card.appendChild(injDetails);

  card.appendChild(radioGroup({
    label: 'Are you using a brace or splint?',
    section: 'currentTreatment', field: 'braceOrSplint',
    options: yesNo
  }));
  const braceDetails = document.createElement('div');
  braceDetails.dataset.conditional = 'currentTreatment.braceOrSplint=yes';
  braceDetails.appendChild(textArea({
    label: 'Brace / Splint Details',
    section: 'currentTreatment', field: 'braceDetails',
    placeholder: 'Describe the brace or splint and usage…',
    rows: 3
  }));
  card.appendChild(braceDetails);

  card.appendChild(textArea({
    label: 'Other Treatments',
    section: 'currentTreatment', field: 'otherTreatments',
    placeholder: 'e.g. acupuncture, TENS, ice/heat therapy…',
    rows: 3
  }));

  const allergyHeader = document.createElement('div');
  allergyHeader.className = 'list-section-header';
  allergyHeader.innerHTML = '<h3>Drug Allergies</h3>';
  card.appendChild(allergyHeader);
  card.appendChild(drugAllergyEditor());

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Surgical History',
    description: 'Previous orthopedic surgeries and anesthesia history.'
  });

  card.appendChild(radioGroup({
    label: 'Have you had any previous orthopedic surgery?',
    section: 'surgicalHistory', field: 'previousOrthopedicSurgery',
    required: true, options: yesNo
  }));

  card.appendChild(previousSurgeryEditor());

  card.appendChild(radioGroup({
    label: 'Have you had any complications with anesthesia?',
    section: 'surgicalHistory', field: 'anesthesiaComplications',
    options: yesNo
  }));
  const anesthDetails = document.createElement('div');
  anesthDetails.dataset.conditional = 'surgicalHistory.anesthesiaComplications=yes';
  anesthDetails.appendChild(textArea({
    label: 'Anesthesia Complication Details',
    section: 'surgicalHistory', field: 'anesthesiaDetails',
    placeholder: 'Describe the complications…',
    rows: 3
  }));
  card.appendChild(anesthDetails);

  card.appendChild(radioGroup({
    label: 'Would you be willing to consider surgery if recommended?',
    section: 'surgicalHistory', field: 'willingToConsiderSurgery',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'undecided', label: 'Undecided' }
    ]
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = state[section]?.[field];
    host.style.display = String(current) === target ? '' : 'none';
  });
  document.querySelectorAll('[data-conditional-nested]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-nested');
    const [path, target] = expr.split('=');
    const [section, subsection, field] = path.split('.');
    const current = state[section]?.[subsection]?.[field];
    host.style.display = String(current) === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics (5 visible required)
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'dominantHand'],
  // Chief complaint
  ['chiefComplaint', 'primaryConcern'],
  ['chiefComplaint', 'affectedJoint'],
  ['chiefComplaint', 'side'],
  ['chiefComplaint', 'duration'],
  ['chiefComplaint', 'onsetType'],
  // Pain assessment
  ['painAssessment', 'currentPainLevel'],
  ['painAssessment', 'worstPain'],
  ['painAssessment', 'bestPain'],
  ['painAssessment', 'painCharacter'],
  ['painAssessment', 'painFrequency'],
  ['painAssessment', 'nightPain'],
  ['painAssessment', 'painWithWeightBearing'],
  // Range of motion (joint name only — measurements optional)
  ['rangeOfMotion', 'joint'],
  // Surgical history (top-level yes/no)
  ['surgicalHistory', 'previousOrthopedicSurgery'],
  ['surgicalHistory', 'anesthesiaComplications'],
  ['surgicalHistory', 'willingToConsiderSurgery']
];

const DASH_KEYS = Array.from({ length: 30 }, (_, i) => `q${i + 1}`);

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
  sectionTotal['dashQuestionnaire'] = DASH_KEYS.length;
  sectionAnswered['dashQuestionnaire'] = 0;
  for (const k of DASH_KEYS) {
    const v = state.dashQuestionnaire[k];
    if (v !== null && v !== undefined) {
      answered++;
      sectionAnswered['dashQuestionnaire']++;
    }
  }
  const total = TRACKED_FIELDS.length + DASH_KEYS.length;
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
  { step: 2,  section: 'chiefComplaint',         title: 'Chief Complaint' },
  { step: 3,  section: 'painAssessment',         title: 'Pain' },
  { step: 4,  section: 'dashQuestionnaire',      title: 'DASH' },
  { step: 5,  section: 'rangeOfMotion',          title: 'Range of Motion' },
  { step: 6,  section: 'strengthTesting',        title: 'Strength' },
  { step: 7,  section: 'functionalLimitations',  title: 'Functional' },
  { step: 8,  section: 'imagingHistory',         title: 'Imaging' },
  { step: 9,  section: 'currentTreatment',       title: 'Treatment' },
  { step: 10, section: 'surgicalHistory',        title: 'Surgical' }
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { dashScore, dashCategory: dashCategoryLabel, firedRules, additionalFlags, answeredCount, timestamp } = lastResult;

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
      <td>${esc(r.domain)}</td>
      <td>${esc(r.description)}</td>
      <td class="num">${r.score} / 5</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No DASH items scored above 1.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Domain</th>
            <th scope="col">Question</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const scoreDisplay = dashScore === null
    ? `<span class="act-score-badge dash-none">— / 100</span>
       <span class="control-level">${esc(dashCategoryLabel)}</span>`
    : `<span class="act-score-badge ${dashCategoryClass(dashScore)}">${dashScore} / 100</span>
       <span class="control-level">${esc(dashCategoryLabel)}</span>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Orthopedic Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>DASH Total Score</h3>
      <p class="act-summary">
        ${scoreDisplay}
      </p>
      <p class="muted">Based on ${answeredCount} of 30 DASH questions answered (minimum 27 required for a valid score).</p>

      <h3>Per-question scores (items rated above 1)</h3>
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
  const { dashScore, dashCategoryLabel, firedRules, answeredCount } = calculateDASH(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    dashScore,
    dashCategory: dashCategoryLabel,
    firedRules,
    additionalFlags,
    answeredCount,
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

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
