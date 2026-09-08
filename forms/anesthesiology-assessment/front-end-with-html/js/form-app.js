import { asaClassLabel } from './asa-rules.js';
import { gradeAssessment } from './composite-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { mallampatiLabel } from './mallampati-rules.js';
import { rcriMacePercent } from './rcri-rules.js';
import { bmiCategory, calculateAge, calculateBMI, emptyAssessment, riskLevelClass, riskLevelLabel } from './types.js';

// Anesthesiology Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure composite scoring engine (ASA + Mallampati + RCRI +
// STOP-BANG) and renders an inline report with flagged issues. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'anesthesiology-assessment.front-end-form-with-html.v1';

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

let state = loadState();
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'anesthesiology-assessment',
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

function setField(section, field, value) {
  state[section][field] = value;
  recomputeDerived();
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
}

function recomputeDerived() {
  state.vitalSigns.bmi = calculateBMI(
    state.vitalSigns.weight,
    state.vitalSigns.height
  );
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
  const labelText = esc(opts.label);
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
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
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

/** Single boolean checkbox bound to a section/field. */
function checkboxInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = !!state[opts.section][opts.field];
  const wrapper = document.createElement('div');
  wrapper.className = 'field check-field';
  wrapper.innerHTML = `
    <label class="checkbox-input" for="${id}">
      <input class="checkbox-input" type="checkbox" id="${id}"${value ? ' checked' : ''}>
      <span>${esc(opts.label)}</span>
    </label>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('change', () => {
    setField(opts.section, opts.field, input.checked);
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
    `<span class="section-step">Step ${opts.stepNumber} of 10</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

function listSectionHeader(title, hint) {
  const el = document.createElement('div');
  el.className = 'list-section-header';
  el.innerHTML = `<h3>${esc(title)}</h3>` +
    (hint ? `<p class="hint">${esc(hint)}</p>` : '');
  return el;
}

// ----------------------------------------------------------------------
// Repeating-list editors
// ----------------------------------------------------------------------

const ROUTE_OPTIONS = [
  { value: 'oral', label: 'Oral' },
  { value: 'iv', label: 'IV' },
  { value: 'sc', label: 'SC' },
  { value: 'im', label: 'IM' },
  { value: 'inhaled', label: 'Inhaled' },
  { value: 'topical', label: 'Topical' },
  { value: 'other', label: 'Other' }
];

function medicationListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.medications.list;
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
      const routeOptionsHtml = ROUTE_OPTIONS.map((o) =>
        `<option value="${esc(o.value)}"${row.route === o.value ? ' selected' : ''}>${esc(o.label)}</option>`
      ).join('');
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Drug name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Ramipril">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 5 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. OD, BD">
          </label>
          <label class="list-cell">
            <span>Route</span>
            <select class="select" data-key="route">
              <option value="">— Select —</option>
              ${routeOptionsHtml}
            </select>
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
      rows.push({ name: '', dose: '', frequency: '', route: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

function allergyListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.allergies.list;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No allergies added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row allergy-row';
      r.innerHTML = `
        <div class="list-grid allergy-grid">
          <label class="list-cell">
            <span>Allergen</span>
            <input type="text" class="text-input" data-key="allergen" value="${esc(row.allergen)}" placeholder="e.g. Penicillin">
          </label>
          <label class="list-cell">
            <span>Type</span>
            <select class="select" data-key="type">
              <option value="">— Select —</option>
              <option value="drug"${row.type === 'drug' ? ' selected' : ''}>Drug</option>
              <option value="latex"${row.type === 'latex' ? ' selected' : ''}>Latex</option>
              <option value="food"${row.type === 'food' ? ' selected' : ''}>Food</option>
              <option value="environmental"${row.type === 'environmental' ? ' selected' : ''}>Environmental</option>
            </select>
          </label>
          <label class="list-cell">
            <span>Reaction</span>
            <input type="text" class="text-input" data-key="reaction" value="${esc(row.reaction)}" placeholder="e.g. Rash">
          </label>
          <label class="list-cell">
            <span>Severity</span>
            <select class="select" data-key="severity">
              <option value="">— Select —</option>
              <option value="mild"${row.severity === 'mild' ? ' selected' : ''}>Mild</option>
              <option value="moderate"${row.severity === 'moderate' ? ' selected' : ''}>Moderate</option>
              <option value="severe"${row.severity === 'severe' ? ' selected' : ''}>Severe</option>
              <option value="anaphylaxis"${row.severity === 'anaphylaxis' ? ' selected' : ''}>Anaphylaxis</option>
            </select>
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove allergy">&times;</button>
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
    addBtn.textContent = '+ Add allergy';
    addBtn.addEventListener('click', () => {
      rows.push({ allergen: '', type: '', reaction: '', severity: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

function previousOperationsEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.previousAnaesthesia.operations;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No previous operations added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row prev-op-row';
      r.innerHTML = `
        <div class="list-grid prev-op-grid">
          <label class="list-cell">
            <span>Procedure</span>
            <input type="text" class="text-input" data-key="procedureName" value="${esc(row.procedureName)}" placeholder="e.g. Appendicectomy">
          </label>
          <label class="list-cell">
            <span>Year</span>
            <input type="number" class="text-input" data-key="year" min="1900" max="2100" value="${row.year ?? ''}">
          </label>
          <label class="list-cell">
            <span>Anaesthesia</span>
            <select class="select" data-key="anaesthesiaType">
              <option value="">— Select —</option>
              <option value="general"${row.anaesthesiaType === 'general' ? ' selected' : ''}>General</option>
              <option value="regional"${row.anaesthesiaType === 'regional' ? ' selected' : ''}>Regional</option>
              <option value="sedation"${row.anaesthesiaType === 'sedation' ? ' selected' : ''}>Sedation</option>
              <option value="local"${row.anaesthesiaType === 'local' ? ' selected' : ''}>Local</option>
              <option value="unknown"${row.anaesthesiaType === 'unknown' ? ' selected' : ''}>Unknown</option>
            </select>
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove previous operation">&times;</button>
        </div>
      `;
      r.querySelectorAll('input, select').forEach((inp) => {
        const handler = () => {
          let v = inp.value;
          if (inp.dataset.key === 'year') v = v === '' ? null : Number(v);
          rows[idx][inp.dataset.key] = v;
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
    addBtn.textContent = '+ Add previous operation';
    addBtn.addEventListener('click', () => {
      rows.push({ procedureName: '', year: null, anaesthesiaType: '' });
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
const yesNoUnknown = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Patient Demographics',
    description: 'Basic patient details and contacts.'
  });

  const name = document.createElement('div');
  name.className = 'two-col';
  name.appendChild(textInput({ label: 'First name', section: 'demographics', field: 'firstName', required: true }));
  name.appendChild(textInput({ label: 'Last name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(name);

  const idRow = document.createElement('div');
  idRow.className = 'two-col';
  idRow.appendChild(textInput({ label: 'Date of birth', section: 'demographics', field: 'dateOfBirth', type: 'date', required: true }));
  idRow.appendChild(textInput({ label: 'NHS number', section: 'demographics', field: 'nhsNumber', placeholder: '123 456 7890' }));
  card.appendChild(idRow);

  card.appendChild(radioGroup({
    label: 'Sex', section: 'demographics', field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(listSectionHeader('Address'));
  card.appendChild(textInput({ label: 'Address line 1', section: 'demographics', field: 'addressLine1' }));
  card.appendChild(textInput({ label: 'Address line 2', section: 'demographics', field: 'addressLine2' }));
  const cityRow = document.createElement('div');
  cityRow.className = 'two-col';
  cityRow.appendChild(textInput({ label: 'City', section: 'demographics', field: 'city' }));
  cityRow.appendChild(textInput({ label: 'Postcode', section: 'demographics', field: 'postcode' }));
  card.appendChild(cityRow);

  const contactRow = document.createElement('div');
  contactRow.className = 'two-col';
  contactRow.appendChild(textInput({ label: 'Phone', section: 'demographics', field: 'phone', type: 'tel' }));
  contactRow.appendChild(textInput({ label: 'Email', section: 'demographics', field: 'email', type: 'email' }));
  card.appendChild(contactRow);

  card.appendChild(listSectionHeader('Emergency contact'));
  const emergRow = document.createElement('div');
  emergRow.className = 'three-col';
  emergRow.appendChild(textInput({ label: 'Name', section: 'demographics', field: 'emergencyName' }));
  emergRow.appendChild(textInput({ label: 'Phone', section: 'demographics', field: 'emergencyPhone', type: 'tel' }));
  emergRow.appendChild(textInput({ label: 'Relationship', section: 'demographics', field: 'emergencyRelationship' }));
  card.appendChild(emergRow);

  card.appendChild(listSectionHeader('GP details'));
  const gpRow = document.createElement('div');
  gpRow.className = 'three-col';
  gpRow.appendChild(textInput({ label: 'GP name', section: 'demographics', field: 'gpName' }));
  gpRow.appendChild(textInput({ label: 'Practice', section: 'demographics', field: 'gpPractice' }));
  gpRow.appendChild(textInput({ label: 'Phone', section: 'demographics', field: 'gpPhone', type: 'tel' }));
  card.appendChild(gpRow);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Planned Surgery & Proposed Anaesthesia',
    description: 'Details of the operation and the anaesthesia plan.'
  });

  card.appendChild(textInput({ label: 'Procedure name', section: 'plannedSurgery', field: 'procedureName' }));
  const row = document.createElement('div');
  row.className = 'two-col';
  row.appendChild(textInput({ label: 'Surgeon name', section: 'plannedSurgery', field: 'surgeonName' }));
  row.appendChild(textInput({ label: 'Surgery date', section: 'plannedSurgery', field: 'surgeryDate', type: 'date' }));
  card.appendChild(row);

  card.appendChild(radioGroup({
    label: 'Surgery grade',
    section: 'plannedSurgery', field: 'surgeryGrade',
    options: [
      { value: 'minor', label: 'Minor' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'major', label: 'Major' },
      { value: 'complex', label: 'Complex' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Proposed anaesthesia type',
    section: 'plannedSurgery', field: 'proposedAnaesthesia',
    options: [
      { value: 'general', label: 'General' },
      { value: 'regional', label: 'Regional' },
      { value: 'sedation', label: 'Sedation' },
      { value: 'local', label: 'Local' },
      { value: 'combined', label: 'Combined' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Medical History',
    description: 'Please indicate which conditions you have, by body system.'
  });

  function group(title, fields) {
    card.appendChild(listSectionHeader(title));
    for (const f of fields) {
      card.appendChild(radioGroup({
        label: f.label, section: 'medicalHistory', field: f.field, options: yesNo
      }));
    }
  }

  group('Cardiovascular', [
    { label: 'Hypertension', field: 'hypertension' },
    { label: 'Ischaemic heart disease', field: 'ischaemicHeartDisease' },
    { label: 'Heart failure', field: 'heartFailure' },
    { label: 'Valvular disease', field: 'valvularDisease' },
    { label: 'Arrhythmia', field: 'arrhythmia' },
    { label: 'Peripheral vascular disease', field: 'peripheralVascularDisease' },
    { label: 'DVT or PE', field: 'dvtPe' }
  ]);
  group('Respiratory', [
    { label: 'Asthma', field: 'asthma' },
    { label: 'COPD', field: 'copd' },
    { label: 'Sleep apnea', field: 'sleepApnea' },
    { label: 'Recent upper respiratory tract infection', field: 'recentUrti' }
  ]);
  group('Neurological', [
    { label: 'Epilepsy', field: 'epilepsy' },
    { label: 'Stroke or TIA', field: 'strokeTia' },
    { label: 'Neuromuscular disease', field: 'neuromuscularDisease' }
  ]);
  group('Endocrine', [
    { label: 'Diabetes type 1', field: 'diabetesType1' },
    { label: 'Diabetes type 2', field: 'diabetesType2' },
    { label: 'Thyroid disease', field: 'thyroidDisease' },
    { label: 'Adrenal insufficiency', field: 'adrenalInsufficiency' }
  ]);
  group('Renal', [
    { label: 'Chronic kidney disease', field: 'chronicKidneyDisease' },
    { label: 'Dialysis', field: 'dialysis' }
  ]);
  group('Hepatic', [
    { label: 'Liver disease', field: 'liverDisease' },
    { label: 'Jaundice', field: 'jaundice' },
    { label: 'Cirrhosis', field: 'cirrhosis' }
  ]);
  group('Haematologic', [
    { label: 'Anaemia', field: 'anaemia' },
    { label: 'Bleeding disorder', field: 'bleedingDisorder' },
    { label: 'Clotting disorder', field: 'clottingDisorder' }
  ]);
  group('Gastrointestinal', [
    { label: 'GORD / reflux', field: 'gord' },
    { label: 'Peptic ulcer', field: 'pepticUlcer' }
  ]);
  group('Musculoskeletal', [
    { label: 'Rheumatoid arthritis', field: 'rheumatoidArthritis' },
    { label: 'Limited mobility', field: 'limitedMobility' }
  ]);
  group('Psychiatric', [
    { label: 'Anxiety', field: 'anxiety' },
    { label: 'Depression', field: 'depression' },
    { label: 'Other psychiatric condition', field: 'otherPsychiatric' }
  ]);

  card.appendChild(textArea({
    label: 'Other medical conditions',
    section: 'medicalHistory', field: 'otherDetails',
    placeholder: 'Anything else not listed above…',
    rows: 3
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Medications',
    description: 'List all medications you currently take.'
  });

  card.appendChild(listSectionHeader('Current medications'));
  card.appendChild(medicationListEditor());

  card.appendChild(listSectionHeader(
    'Special-flag medications',
    'These flags drive perioperative planning even if not listed by name.'
  ));
  card.appendChild(radioGroup({ label: 'Currently on anticoagulants?', section: 'medications', field: 'onAnticoagulants', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Currently on antiplatelets?', section: 'medications', field: 'onAntiplatelets', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Currently on insulin?', section: 'medications', field: 'onInsulin', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Currently on steroids?', section: 'medications', field: 'onSteroids', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Currently on MAOIs?', section: 'medications', field: 'onMaois', options: yesNo }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Allergies & Adverse Reactions',
    description: 'Document drug, latex, food, and environmental allergies.'
  });

  card.appendChild(allergyListEditor());

  card.appendChild(radioGroup({
    label: 'Known latex allergy?',
    section: 'allergies', field: 'latexAllergy', options: yesNo
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Previous Anaesthesia & Surgery History',
    description: 'Past operations and any anaesthetic complications.'
  });

  card.appendChild(listSectionHeader('Previous operations'));
  card.appendChild(previousOperationsEditor());

  card.appendChild(listSectionHeader(
    'Previous anaesthesia complications',
    'Tick any that apply.'
  ));
  card.appendChild(checkboxInput({ label: 'Difficult intubation', section: 'previousAnaesthesia', field: 'difficultIntubation' }));
  card.appendChild(checkboxInput({ label: 'Post-operative nausea / vomiting (PONV)', section: 'previousAnaesthesia', field: 'ponv' }));
  card.appendChild(checkboxInput({ label: 'Awareness during anaesthesia', section: 'previousAnaesthesia', field: 'awareness' }));
  card.appendChild(checkboxInput({ label: 'Slow recovery', section: 'previousAnaesthesia', field: 'slowRecovery' }));
  card.appendChild(checkboxInput({ label: 'Allergic reaction', section: 'previousAnaesthesia', field: 'allergicReaction' }));
  card.appendChild(checkboxInput({ label: 'Other complication', section: 'previousAnaesthesia', field: 'otherComplication' }));

  const otherDetails = document.createElement('div');
  otherDetails.dataset.conditional = 'previousAnaesthesia.otherComplication=true';
  otherDetails.appendChild(textInput({
    label: 'Other complication details',
    section: 'previousAnaesthesia', field: 'otherComplicationDetails'
  }));
  card.appendChild(otherDetails);

  card.appendChild(listSectionHeader('Family history'));
  card.appendChild(radioGroup({
    label: 'Personal history of malignant hyperthermia?',
    section: 'previousAnaesthesia', field: 'malignantHyperthermia',
    options: yesNoUnknown
  }));
  card.appendChild(radioGroup({
    label: 'Other anaesthetic complications in family?',
    section: 'previousAnaesthesia', field: 'familyAnaestheticComplications',
    options: yesNo
  }));
  const famDetails = document.createElement('div');
  famDetails.dataset.conditional = 'previousAnaesthesia.familyAnaestheticComplications=yes';
  famDetails.appendChild(textInput({
    label: 'Family history details',
    section: 'previousAnaesthesia', field: 'familyAnaestheticDetails'
  }));
  card.appendChild(famDetails);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Social & Lifestyle History',
    description: 'Smoking, alcohol, functional capacity, and OSA screen.'
  });

  card.appendChild(radioGroup({
    label: 'Smoking status',
    section: 'socialHistory', field: 'smoking',
    options: [
      { value: 'current', label: 'Current smoker' },
      { value: 'ex', label: 'Ex-smoker' },
      { value: 'never', label: 'Never smoked' }
    ]
  }));
  const packYearsHost = document.createElement('div');
  packYearsHost.dataset.conditionalAny = 'socialHistory.smoking=current,ex';
  packYearsHost.appendChild(textInput({
    label: 'Pack-years',
    section: 'socialHistory', field: 'packYears',
    type: 'number', min: 0, max: 200
  }));
  card.appendChild(packYearsHost);

  card.appendChild(textInput({
    label: 'Alcohol — units per week',
    section: 'socialHistory', field: 'alcoholUnitsPerWeek',
    type: 'number', min: 0, max: 200, unit: 'units'
  }));

  card.appendChild(radioGroup({
    label: 'Recreational drug use?',
    section: 'socialHistory', field: 'recreationalDrugUse', options: yesNo
  }));
  const drugDetails = document.createElement('div');
  drugDetails.dataset.conditional = 'socialHistory.recreationalDrugUse=yes';
  drugDetails.appendChild(textInput({
    label: 'Recreational drug details',
    section: 'socialHistory', field: 'recreationalDrugDetails'
  }));
  card.appendChild(drugDetails);

  card.appendChild(radioGroup({
    label: 'Can you climb 2 flights of stairs without stopping?',
    section: 'socialHistory', field: 'canClimbTwoFlights', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Exercise tolerance',
    section: 'socialHistory', field: 'exerciseTolerance',
    options: [
      { value: 'gt-4-mets', label: '> 4 METs' },
      { value: 'le-4-mets', label: '≤ 4 METs' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));

  card.appendChild(textInput({ label: 'Occupation', section: 'socialHistory', field: 'occupation' }));

  card.appendChild(radioGroup({
    label: 'Pregnancy status',
    section: 'socialHistory', field: 'pregnancyStatus',
    options: [
      { value: 'not-pregnant', label: 'Not pregnant' },
      { value: 'pregnant', label: 'Pregnant' },
      { value: 'not-applicable', label: 'Not applicable' }
    ]
  }));

  card.appendChild(listSectionHeader(
    'STOP-BANG OSA screen',
    'These three questions feed the STOP-BANG sleep apnoea screen.'
  ));
  card.appendChild(radioGroup({ label: 'Do you snore loudly?', section: 'socialHistory', field: 'snoresLoudly', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you often feel tired or sleepy during the day?', section: 'socialHistory', field: 'tiredDuringDay', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Has anyone observed you stop breathing during sleep?', section: 'socialHistory', field: 'observedApnea', options: yesNo }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Vital Signs & Anthropometrics',
    description: 'Recent observations and body measurements.'
  });

  const bp = document.createElement('div');
  bp.className = 'three-col';
  bp.appendChild(textInput({ label: 'Systolic BP', section: 'vitalSigns', field: 'systolicBp', type: 'number', min: 50, max: 300, unit: 'mmHg' }));
  bp.appendChild(textInput({ label: 'Diastolic BP', section: 'vitalSigns', field: 'diastolicBp', type: 'number', min: 30, max: 200, unit: 'mmHg' }));
  bp.appendChild(textInput({ label: 'Heart rate', section: 'vitalSigns', field: 'heartRate', type: 'number', min: 20, max: 250, unit: 'bpm' }));
  card.appendChild(bp);

  const resp = document.createElement('div');
  resp.className = 'three-col';
  resp.appendChild(textInput({ label: 'Respiratory rate', section: 'vitalSigns', field: 'respiratoryRate', type: 'number', min: 5, max: 60, unit: '/min' }));
  resp.appendChild(textInput({ label: 'SpO2', section: 'vitalSigns', field: 'spo2', type: 'number', min: 50, max: 100, unit: '%' }));
  resp.appendChild(textInput({ label: 'Temperature', section: 'vitalSigns', field: 'temperature', type: 'number', min: 30, max: 45, step: 0.1, unit: '°C' }));
  card.appendChild(resp);

  const anthro = document.createElement('div');
  anthro.className = 'three-col';
  anthro.appendChild(textInput({ label: 'Height', section: 'vitalSigns', field: 'height', type: 'number', min: 50, max: 250, unit: 'cm' }));
  anthro.appendChild(textInput({ label: 'Weight', section: 'vitalSigns', field: 'weight', type: 'number', min: 1, max: 400, unit: 'kg' }));
  anthro.appendChild(readOnlyReadout({
    label: 'BMI',
    id: 'bmi-readout',
    render: () => {
      const bmi = state.vitalSigns.bmi;
      if (bmi == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${bmi}</strong> <span class="muted">(${esc(bmiCategory(bmi))})</span>`;
    }
  }));
  card.appendChild(anthro);

  card.appendChild(textInput({
    label: 'Neck circumference',
    section: 'vitalSigns', field: 'neckCircumference',
    type: 'number', min: 20, max: 80, step: 0.5, unit: 'cm'
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Airway & Physical Examination',
    description: 'Airway assessment plus brief CV and respiratory examination.'
  });

  card.appendChild(listSectionHeader('Airway assessment'));
  card.appendChild(radioGroup({
    label: 'Mallampati class',
    section: 'physicalExam', field: 'mallampatiClass',
    options: [
      { value: 'i', label: 'I' },
      { value: 'ii', label: 'II' },
      { value: 'iii', label: 'III' },
      { value: 'iv', label: 'IV' }
    ]
  }));
  const airwayMeas = document.createElement('div');
  airwayMeas.className = 'two-col';
  airwayMeas.appendChild(textInput({ label: 'Mouth opening', section: 'physicalExam', field: 'mouthOpening', type: 'number', min: 0, max: 10, step: 0.1, unit: 'cm' }));
  airwayMeas.appendChild(textInput({ label: 'Thyromental distance', section: 'physicalExam', field: 'thyromentalDistance', type: 'number', min: 0, max: 15, step: 0.1, unit: 'cm' }));
  card.appendChild(airwayMeas);

  card.appendChild(radioGroup({
    label: 'Neck mobility',
    section: 'physicalExam', field: 'neckMobility',
    options: [
      { value: 'full', label: 'Full' },
      { value: 'limited', label: 'Limited' },
      { value: 'fixed', label: 'Fixed' }
    ]
  }));

  card.appendChild(listSectionHeader('Dentition (tick all that apply)'));
  card.appendChild(checkboxInput({ label: 'Intact', section: 'physicalExam', field: 'dentitionIntact' }));
  card.appendChild(checkboxInput({ label: 'Dentures', section: 'physicalExam', field: 'dentitionDentures' }));
  card.appendChild(checkboxInput({ label: 'Loose teeth', section: 'physicalExam', field: 'dentitionLooseTeeth' }));
  card.appendChild(checkboxInput({ label: 'Crowns', section: 'physicalExam', field: 'dentitionCrowns' }));
  card.appendChild(checkboxInput({ label: 'Prominent incisors', section: 'physicalExam', field: 'dentitionProminentIncisors' }));

  card.appendChild(radioGroup({
    label: 'Jaw protrusion',
    section: 'physicalExam', field: 'jawProtrusion',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'limited', label: 'Limited' }
    ]
  }));

  card.appendChild(listSectionHeader('Cardiovascular examination'));
  card.appendChild(radioGroup({
    label: 'Heart sounds',
    section: 'physicalExam', field: 'heartSounds',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'murmur', label: 'Murmur' },
      { value: 'irregular', label: 'Irregular' },
      { value: 'added-sounds', label: 'Added sounds' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Peripheral oedema',
    section: 'physicalExam', field: 'peripheralEdema',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Jugular venous pressure (JVP)',
    section: 'physicalExam', field: 'jvp',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'raised', label: 'Raised' }
    ]
  }));

  card.appendChild(listSectionHeader('Respiratory examination'));
  card.appendChild(radioGroup({
    label: 'Breath sounds',
    section: 'physicalExam', field: 'breathSounds',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'wheeze', label: 'Wheeze' },
      { value: 'crackles', label: 'Crackles' },
      { value: 'reduced', label: 'Reduced' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Accessory muscle use',
    section: 'physicalExam', field: 'accessoryMuscleUse', options: yesNo
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Investigations & Anaesthetic Plan',
    description: 'Pre-op tests, RCRI confirmation, ASA grade, and the anaesthetic plan.'
  });

  function investigation(field, label) {
    const row = document.createElement('div');
    row.className = 'investigation-row two-col';
    row.appendChild(selectInput({
      label, section: 'investigationsAndPlan', field: `${field}Status`,
      options: [
        { value: 'not-required', label: 'Not required' },
        { value: 'ordered', label: 'Ordered' },
        { value: 'normal', label: 'Reviewed — normal' },
        { value: 'abnormal', label: 'Reviewed — abnormal' }
      ]
    }));
    row.appendChild(textInput({
      label: `${label} notes`,
      section: 'investigationsAndPlan', field: `${field}Notes`
    }));
    card.appendChild(row);
  }

  card.appendChild(listSectionHeader('Pre-operative investigations'));
  investigation('fbc', 'Full blood count (FBC)');
  investigation('ue', 'Urea & electrolytes (U&E)');
  investigation('lfts', 'Liver function tests (LFTs)');
  investigation('coag', 'Coagulation screen');
  investigation('hba1c', 'HbA1c');
  investigation('ecg', 'ECG');
  investigation('cxr', 'Chest X-ray');
  investigation('echo', 'Echocardiography');
  card.appendChild(textInput({
    label: 'Other investigation',
    section: 'investigationsAndPlan', field: 'otherInvestigation'
  }));
  card.appendChild(selectInput({
    label: 'Other investigation status',
    section: 'investigationsAndPlan', field: 'otherInvestigationStatus',
    options: [
      { value: 'not-required', label: 'Not required' },
      { value: 'ordered', label: 'Ordered' },
      { value: 'normal', label: 'Reviewed — normal' },
      { value: 'abnormal', label: 'Reviewed — abnormal' }
    ]
  }));

  card.appendChild(listSectionHeader(
    'Revised Cardiac Risk Index (RCRI)',
    'Confirm cardiac criteria. High-risk surgery and insulin use are auto-counted from earlier sections.'
  ));
  card.appendChild(radioGroup({
    label: 'History of ischaemic heart disease?',
    section: 'investigationsAndPlan', field: 'rcriIschaemicHeartDisease', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'History of congestive heart failure?',
    section: 'investigationsAndPlan', field: 'rcriCongestiveHeartFailure', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'History of cerebrovascular disease (stroke / TIA)?',
    section: 'investigationsAndPlan', field: 'rcriCerebrovascularDisease', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Serum creatinine > 177 µmol/L (> 2 mg/dL)?',
    section: 'investigationsAndPlan', field: 'rcriHighCreatinine', options: yesNo
  }));

  card.appendChild(listSectionHeader('ASA Physical Status'));
  card.appendChild(radioGroup({
    label: 'ASA class',
    section: 'investigationsAndPlan', field: 'asaClass',
    options: [
      { value: 'i', label: 'I — Healthy' },
      { value: 'ii', label: 'II — Mild systemic disease' },
      { value: 'iii', label: 'III — Severe systemic disease' },
      { value: 'iv', label: 'IV — Severe disease, constant threat to life' },
      { value: 'v', label: 'V — Moribund' },
      { value: 'vi', label: 'VI — Brain-dead, organ donor' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Emergency case? (adds "E" suffix)',
    section: 'investigationsAndPlan', field: 'emergencyCase', options: yesNo
  }));

  card.appendChild(listSectionHeader('Anaesthetic plan'));
  card.appendChild(radioGroup({
    label: 'Proposed technique',
    section: 'investigationsAndPlan', field: 'proposedTechnique',
    options: [
      { value: 'general', label: 'General' },
      { value: 'regional', label: 'Regional' },
      { value: 'combined', label: 'Combined' },
      { value: 'sedation', label: 'Sedation' },
      { value: 'local', label: 'Local' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Airway plan',
    section: 'investigationsAndPlan', field: 'airwayPlan',
    options: [
      { value: 'facemask', label: 'Facemask' },
      { value: 'lma', label: 'LMA' },
      { value: 'ett', label: 'ETT' },
      { value: 'awake-fibreoptic', label: 'Awake fibreoptic' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Post-operative destination',
    section: 'investigationsAndPlan', field: 'postOpDestination',
    options: [
      { value: 'ward', label: 'Ward' },
      { value: 'hdu', label: 'HDU' },
      { value: 'icu', label: 'ICU' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Special requirements',
    section: 'investigationsAndPlan', field: 'specialRequirements',
    placeholder: 'E.g. blood products on standby, specific monitoring, MDT input…',
    rows: 3
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections + auto-calculated readouts
// ----------------------------------------------------------------------

function evalConditional(path, target) {
  const [section, field] = path.split('.');
  const current = state[section]?.[field];
  if (target === 'true') return current === true;
  if (target === 'false') return current === false;
  return String(current) === target;
}

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    host.style.display = evalConditional(path, target) ? '' : 'none';
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
    const v = state.vitalSigns.bmi;
    bmi.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}</strong> <span class="muted">(${esc(bmiCategory(v))})</span>`;
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics core
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'nhsNumber'],
  ['demographics', 'phone'],
  // Planned surgery
  ['plannedSurgery', 'procedureName'],
  ['plannedSurgery', 'surgeryGrade'],
  ['plannedSurgery', 'proposedAnaesthesia'],
  // Medical history (28 yes/no items)
  ['medicalHistory', 'hypertension'],
  ['medicalHistory', 'ischaemicHeartDisease'],
  ['medicalHistory', 'heartFailure'],
  ['medicalHistory', 'valvularDisease'],
  ['medicalHistory', 'arrhythmia'],
  ['medicalHistory', 'peripheralVascularDisease'],
  ['medicalHistory', 'dvtPe'],
  ['medicalHistory', 'asthma'],
  ['medicalHistory', 'copd'],
  ['medicalHistory', 'sleepApnea'],
  ['medicalHistory', 'recentUrti'],
  ['medicalHistory', 'epilepsy'],
  ['medicalHistory', 'strokeTia'],
  ['medicalHistory', 'neuromuscularDisease'],
  ['medicalHistory', 'diabetesType1'],
  ['medicalHistory', 'diabetesType2'],
  ['medicalHistory', 'thyroidDisease'],
  ['medicalHistory', 'adrenalInsufficiency'],
  ['medicalHistory', 'chronicKidneyDisease'],
  ['medicalHistory', 'dialysis'],
  ['medicalHistory', 'liverDisease'],
  ['medicalHistory', 'jaundice'],
  ['medicalHistory', 'cirrhosis'],
  ['medicalHistory', 'anaemia'],
  ['medicalHistory', 'bleedingDisorder'],
  ['medicalHistory', 'clottingDisorder'],
  ['medicalHistory', 'gord'],
  ['medicalHistory', 'pepticUlcer'],
  ['medicalHistory', 'rheumatoidArthritis'],
  ['medicalHistory', 'limitedMobility'],
  ['medicalHistory', 'anxiety'],
  ['medicalHistory', 'depression'],
  ['medicalHistory', 'otherPsychiatric'],
  // Medications (5 flags)
  ['medications', 'onAnticoagulants'],
  ['medications', 'onAntiplatelets'],
  ['medications', 'onInsulin'],
  ['medications', 'onSteroids'],
  ['medications', 'onMaois'],
  // Allergies meta
  ['allergies', 'latexAllergy'],
  // Previous anaesthesia
  ['previousAnaesthesia', 'malignantHyperthermia'],
  ['previousAnaesthesia', 'familyAnaestheticComplications'],
  // Social / STOP-BANG
  ['socialHistory', 'smoking'],
  ['socialHistory', 'alcoholUnitsPerWeek'],
  ['socialHistory', 'recreationalDrugUse'],
  ['socialHistory', 'canClimbTwoFlights'],
  ['socialHistory', 'exerciseTolerance'],
  ['socialHistory', 'pregnancyStatus'],
  ['socialHistory', 'snoresLoudly'],
  ['socialHistory', 'tiredDuringDay'],
  ['socialHistory', 'observedApnea'],
  // Vital signs
  ['vitalSigns', 'systolicBp'],
  ['vitalSigns', 'diastolicBp'],
  ['vitalSigns', 'heartRate'],
  ['vitalSigns', 'spo2'],
  ['vitalSigns', 'height'],
  ['vitalSigns', 'weight'],
  ['vitalSigns', 'neckCircumference'],
  // Physical examination
  ['physicalExam', 'mallampatiClass'],
  ['physicalExam', 'mouthOpening'],
  ['physicalExam', 'thyromentalDistance'],
  ['physicalExam', 'neckMobility'],
  ['physicalExam', 'jawProtrusion'],
  ['physicalExam', 'heartSounds'],
  ['physicalExam', 'peripheralEdema'],
  ['physicalExam', 'jvp'],
  ['physicalExam', 'breathSounds'],
  ['physicalExam', 'accessoryMuscleUse'],
  // Investigations + RCRI + ASA + Plan
  ['investigationsAndPlan', 'fbcStatus'],
  ['investigationsAndPlan', 'ueStatus'],
  ['investigationsAndPlan', 'lftsStatus'],
  ['investigationsAndPlan', 'coagStatus'],
  ['investigationsAndPlan', 'ecgStatus'],
  ['investigationsAndPlan', 'rcriIschaemicHeartDisease'],
  ['investigationsAndPlan', 'rcriCongestiveHeartFailure'],
  ['investigationsAndPlan', 'rcriCerebrovascularDisease'],
  ['investigationsAndPlan', 'rcriHighCreatinine'],
  ['investigationsAndPlan', 'asaClass'],
  ['investigationsAndPlan', 'emergencyCase'],
  ['investigationsAndPlan', 'proposedTechnique'],
  ['investigationsAndPlan', 'airwayPlan'],
  ['investigationsAndPlan', 'postOpDestination']
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

  const { grading, additionalFlags, timestamp } = lastResult;
  const { asa, airway, rcri, stopbang, overallRisk, firedRules } = grading;

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
      <td><span class="risk-badge ${riskLevelClass(r.riskLevel)}">${esc(riskLevelLabel(r.riskLevel))}</span></td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No scoring rules fired.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Finding</th>
            <th scope="col">Risk</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const asaCard = `
    <div class="score-card">
      <h4>ASA Physical Status</h4>
      <p class="score-value">${asa.class ? esc(asa.class.toUpperCase()) : '—'}${asa.emergency ? 'E' : ''}</p>
      <p class="score-label">${esc(asa.class ? asaClassLabel(asa.class) : 'Not selected')}</p>
      <span class="risk-badge ${riskLevelClass(asa.riskLevel)}">${esc(riskLevelLabel(asa.riskLevel))}</span>
    </div>
  `;
  const airwayCard = `
    <div class="score-card">
      <h4>Airway Risk</h4>
      <p class="score-value">${airway.mallampatiClass ? esc(airway.mallampatiClass.toUpperCase()) : '—'}</p>
      <p class="score-label">${esc(airway.mallampatiClass ? mallampatiLabel(airway.mallampatiClass) : 'Not assessed')}</p>
      <span class="risk-badge ${riskLevelClass(airway.riskLevel)}">${esc(riskLevelLabel(airway.riskLevel))}</span>
    </div>
  `;
  const rcriCard = `
    <div class="score-card">
      <h4>RCRI (Lee)</h4>
      <p class="score-value">${rcri.score} / 6</p>
      <p class="score-label">MACE risk ~ ${rcri.macePercent}%</p>
      <span class="risk-badge ${riskLevelClass(rcri.riskLevel)}">${esc(riskLevelLabel(rcri.riskLevel))}</span>
    </div>
  `;
  const stopbangCard = `
    <div class="score-card">
      <h4>STOP-BANG</h4>
      <p class="score-value">${stopbang.score} / 8</p>
      <p class="score-label">OSA screening</p>
      <span class="risk-badge ${riskLevelClass(stopbang.riskLevel)}">${esc(riskLevelLabel(stopbang.riskLevel))}</span>
    </div>
  `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Anesthesiology Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${riskLevelClass(overallRisk)}">
        <span class="risk-banner-label">Overall perioperative risk</span>
        <span class="risk-banner-value">${esc(riskLevelLabel(overallRisk))}</span>
      </div>

      <h3>Sub-scores</h3>
      <div class="score-grid">
        ${asaCard}
        ${airwayCard}
        ${rcriCard}
        ${stopbangCard}
      </div>

      <h3>Flagged Issues</h3>
      ${flagsList}

      <h3>Fired Rules</h3>
      ${firedTable}

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
  recomputeDerived();
  const grading = gradeAssessment(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    grading,
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
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics',          title: 'Demographics' },
  { step: 2,  section: 'plannedSurgery',        title: 'Planned Surgery' },
  { step: 3,  section: 'medicalHistory',        title: 'Medical History' },
  { step: 4,  section: 'medications',           title: 'Medications' },
  { step: 5,  section: 'allergies',             title: 'Allergies' },
  { step: 6,  section: 'previousAnaesthesia',   title: 'Prev. Anaesthesia' },
  { step: 7,  section: 'socialHistory',         title: 'Social History' },
  { step: 8,  section: 'vitalSigns',            title: 'Vital Signs' },
  { step: 9,  section: 'physicalExam',          title: 'Airway & Exam' },
  { step: 10, section: 'investigationsAndPlan', title: 'Investigations & Plan' }
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
