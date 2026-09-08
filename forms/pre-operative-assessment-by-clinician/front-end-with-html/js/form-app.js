import { calculateASA } from './composite-grader.js';
import { bmiCategory, computeBmi, emptyAssessment, riskLabel } from './types.js';

// Pre-operative Assessment by Clinician — clinician wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure ASA composite grader and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'pre-operative-assessment-by-clinician.front-end-with-html.v1';
window.__A11Y_DRAFT_KEY__ = STORAGE_KEY;
const TOTAL_STEPS = 16;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// assessment, keeping only known top-level sections/arrays. Shared by
// localStorage restore (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same drift —
// an older export, a hand-edited file, or a differently-shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyAssessment();
  for (const key of Object.keys(fresh)) {
    const v = parsed && parsed[key];
    if (Array.isArray(fresh[key])) {
      fresh[key] = Array.isArray(v) ? v : [];
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
    return mergeIntoDefaults(JSON.parse(raw));
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
/** @type {ReturnType<typeof calculateASA> | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) — keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'pre-operative-assessment-by-clinician',
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

function setField(section, field, value) {
  state[section][field] = value;
  recomputeDerived();
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
}

function recomputeDerived() {
  state.patient.bmi = computeBmi(state.patient.weightKg, state.patient.heightCm);
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
    if (type === 'number') v = v === '' ? null : Number(v);
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
    <label>${esc(opts.label)}</label>
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
// Common option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const ROM_OPTIONS = [
  { value: 'full', label: 'Full' },
  { value: 'reduced', label: 'Reduced' },
  { value: 'severely-limited', label: 'Severely limited' }
];

// ----------------------------------------------------------------------
// Repeating-list editors (medications, allergies)
// ----------------------------------------------------------------------

const MEDICATION_CLASSES = [
  'anticoagulant', 'antiplatelet', 'antihypertensive', 'ace-inhibitor', 'arb',
  'beta-blocker', 'diuretic', 'insulin', 'oral-hypoglycaemic', 'steroid',
  'opioid', 'benzodiazepine', 'ssri', 'other'
];

const MEDICATION_ROUTES = [
  'oral', 'iv', 'im', 'sc', 'inhaled', 'topical', 'pr', 'other'
];

const PERIOP_ACTIONS = [
  'continue', 'hold-on-day', 'hold-n-days', 'stop', 'switch', 'bridge'
];

function medicationListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.medications;
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
      const classOpts = ['<option value="">— Class —</option>',
        ...MEDICATION_CLASSES.map((c) =>
          `<option value="${c}"${row.class === c ? ' selected' : ''}>${c}</option>`)].join('');
      const actionOpts = ['<option value="">— Action —</option>',
        ...PERIOP_ACTIONS.map((c) =>
          `<option value="${c}"${row.perioperativeAction === c ? ' selected' : ''}>${c}</option>`)].join('');
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Apixaban">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 5 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. BD">
          </label>
          <label class="list-cell">
            <span>Class</span>
            <select class="select" data-key="class">${classOpts}</select>
          </label>
          <label class="list-cell">
            <span>Periop action</span>
            <select class="select" data-key="perioperativeAction">${actionOpts}</select>
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove medication">&times;</button>
        </div>
      `;
      r.querySelectorAll('input,select').forEach((inp) => {
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
    addBtn.textContent = '+ Add medication';
    addBtn.addEventListener('click', () => {
      rows.push({
        name: '', dose: '', route: '', frequency: '', indication: '',
        class: '', perioperativeAction: '', perioperativeNotes: '', lastDoseAt: ''
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

const ALLERGY_CATEGORIES = [
  'drug', 'latex', 'food', 'adhesive', 'contrast', 'environment', 'other'
];

const ALLERGY_REACTIONS = [
  'anaphylaxis', 'rash', 'urticaria', 'angioedema', 'gi-upset', 'bronchospasm', 'other'
];

const ALLERGY_SEVERITIES = ['mild', 'moderate', 'severe', 'life-threatening'];

function allergyListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.allergies;
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
      const catOpts = ['<option value="">— Category —</option>',
        ...ALLERGY_CATEGORIES.map((c) =>
          `<option value="${c}"${row.category === c ? ' selected' : ''}>${c}</option>`)].join('');
      const rxOpts = ['<option value="">— Reaction —</option>',
        ...ALLERGY_REACTIONS.map((c) =>
          `<option value="${c}"${row.reactionType === c ? ' selected' : ''}>${c}</option>`)].join('');
      const sevOpts = ['<option value="">— Severity —</option>',
        ...ALLERGY_SEVERITIES.map((c) =>
          `<option value="${c}"${row.reactionSeverity === c ? ' selected' : ''}>${c}</option>`)].join('');
      r.innerHTML = `
        <div class="list-grid allergy-grid">
          <label class="list-cell">
            <span>Allergen</span>
            <input type="text" class="text-input" data-key="allergen" value="${esc(row.allergen)}" placeholder="e.g. Penicillin">
          </label>
          <label class="list-cell">
            <span>Category</span>
            <select class="select" data-key="category">${catOpts}</select>
          </label>
          <label class="list-cell">
            <span>Reaction</span>
            <select class="select" data-key="reactionType">${rxOpts}</select>
          </label>
          <label class="list-cell">
            <span>Severity</span>
            <select class="select" data-key="reactionSeverity">${sevOpts}</select>
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove allergy">&times;</button>
        </div>
      `;
      r.querySelectorAll('input,select').forEach((inp) => {
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
    addBtn.textContent = '+ Add allergy';
    addBtn.addEventListener('click', () => {
      rows.push({
        allergen: '', category: '', reactionType: '',
        reactionSeverity: '', reactionNotes: '', verified: ''
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

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Clinician identification',
    description: 'Identify the clinician completing this assessment.'
  });
  card.appendChild(textInput({ label: 'Clinician name', section: 'clinician', field: 'clinicianName', required: true }));
  card.appendChild(selectInput({
    label: 'Clinician role', section: 'clinician', field: 'clinicianRole',
    options: [
      { value: 'anaesthetist', label: 'Anaesthetist' },
      { value: 'surgeon', label: 'Surgeon' },
      { value: 'preop-nurse', label: 'Pre-op nurse' },
      { value: 'perioperative-physician', label: 'Perioperative physician' },
      { value: 'geriatrician', label: 'Geriatrician' },
      { value: 'pharmacist', label: 'Pharmacist' },
      { value: 'other', label: 'Other' }
    ]
  }));
  const reg = document.createElement('div');
  reg.className = 'two-col';
  reg.appendChild(selectInput({
    label: 'Registration body', section: 'clinician', field: 'registrationBody',
    options: [
      { value: 'GMC', label: 'GMC' },
      { value: 'NMC', label: 'NMC' },
      { value: 'HCPC', label: 'HCPC' },
      { value: 'GPhC', label: 'GPhC' },
      { value: 'other', label: 'Other' }
    ]
  }));
  reg.appendChild(textInput({ label: 'Registration number', section: 'clinician', field: 'registrationNumber' }));
  card.appendChild(reg);
  card.appendChild(textInput({ label: 'Site name', section: 'clinician', field: 'siteName' }));
  const dt = document.createElement('div');
  dt.className = 'two-col';
  dt.appendChild(textInput({ label: 'Assessment date', section: 'clinician', field: 'assessmentDate', type: 'date' }));
  dt.appendChild(textInput({ label: 'Assessment time', section: 'clinician', field: 'assessmentTime', type: 'time' }));
  card.appendChild(dt);
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient and planned procedure',
    description: 'Patient demographics and surgical plan.'
  });

  const name = document.createElement('div');
  name.className = 'two-col';
  name.appendChild(textInput({ label: 'First name', section: 'patient', field: 'firstName', required: true }));
  name.appendChild(textInput({ label: 'Last name', section: 'patient', field: 'lastName', required: true }));
  card.appendChild(name);

  const id = document.createElement('div');
  id.className = 'two-col';
  id.appendChild(textInput({ label: 'Date of birth', section: 'patient', field: 'dateOfBirth', type: 'date' }));
  id.appendChild(textInput({ label: 'NHS number', section: 'patient', field: 'nhsNumber' }));
  card.appendChild(id);

  card.appendChild(textInput({ label: 'Hospital number', section: 'patient', field: 'hospitalNumber' }));

  card.appendChild(radioGroup({
    label: 'Sex', section: 'patient', field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  const meas = document.createElement('div');
  meas.className = 'three-col';
  meas.appendChild(textInput({ label: 'Weight', section: 'patient', field: 'weightKg', type: 'number', min: 1, max: 400, step: 0.1, unit: 'kg' }));
  meas.appendChild(textInput({ label: 'Height', section: 'patient', field: 'heightCm', type: 'number', min: 50, max: 250, step: 0.1, unit: 'cm' }));
  meas.appendChild(readOnlyReadout({
    label: 'BMI',
    id: 'bmi-readout',
    render: () => {
      const bmi = state.patient.bmi;
      if (bmi == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${bmi}</strong> <span class="muted">(${esc(bmiCategory(bmi))})</span>`;
    }
  }));
  card.appendChild(meas);

  card.appendChild(document.createElement('hr'));
  const surgHead = document.createElement('h3');
  surgHead.textContent = 'Surgical plan';
  card.appendChild(surgHead);

  card.appendChild(textInput({ label: 'Planned procedure', section: 'surgery', field: 'plannedProcedure' }));
  card.appendChild(textArea({ label: 'Indication for surgery', section: 'surgery', field: 'indicationForSurgery', rows: 2 }));
  card.appendChild(textInput({ label: 'Surgical specialty', section: 'surgery', field: 'surgicalSpecialty' }));
  const sg = document.createElement('div');
  sg.className = 'two-col';
  sg.appendChild(selectInput({
    label: 'Urgency', section: 'surgery', field: 'urgency',
    options: [
      { value: 'elective', label: 'Elective' },
      { value: 'urgent', label: 'Urgent' },
      { value: 'emergency', label: 'Emergency' },
      { value: 'immediate', label: 'Immediate' }
    ]
  }));
  sg.appendChild(selectInput({
    label: 'Surgical severity (NICE NG45)', section: 'surgery', field: 'surgicalSeverity',
    options: [
      { value: 'minor', label: 'Minor' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'major', label: 'Major' },
      { value: 'major-plus', label: 'Major+' }
    ]
  }));
  card.appendChild(sg);

  const sg2 = document.createElement('div');
  sg2.className = 'two-col';
  sg2.appendChild(selectInput({
    label: 'Laterality', section: 'surgery', field: 'laterality',
    options: [
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' },
      { value: 'bilateral', label: 'Bilateral' },
      { value: 'midline', label: 'Midline' },
      { value: 'na', label: 'N/A' }
    ]
  }));
  sg2.appendChild(textInput({ label: 'Anticipated blood loss', section: 'surgery', field: 'anticipatedBloodLossMl', type: 'number', min: 0, max: 20000, unit: 'mL' }));
  card.appendChild(sg2);

  const sg3 = document.createElement('div');
  sg3.className = 'two-col';
  sg3.appendChild(textInput({ label: 'Anticipated duration', section: 'surgery', field: 'anticipatedDurationMinutes', type: 'number', min: 0, max: 1440, unit: 'min' }));
  sg3.appendChild(textInput({ label: 'Planned date', section: 'surgery', field: 'plannedDate', type: 'date' }));
  card.appendChild(sg3);

  card.appendChild(textInput({ label: 'Consultant surgeon', section: 'surgery', field: 'consultantSurgeon' }));
  card.appendChild(textInput({ label: 'Anaesthetist (if known)', section: 'surgery', field: 'anaesthetistName' }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Vital signs',
    description: 'Resting vital signs at time of assessment.'
  });
  const g1 = document.createElement('div'); g1.className = 'three-col';
  g1.appendChild(textInput({ label: 'Systolic BP', section: 'vitals', field: 'systolicBp', type: 'number', min: 0, max: 300, unit: 'mmHg' }));
  g1.appendChild(textInput({ label: 'Diastolic BP', section: 'vitals', field: 'diastolicBp', type: 'number', min: 0, max: 200, unit: 'mmHg' }));
  g1.appendChild(textInput({ label: 'Heart rate', section: 'vitals', field: 'heartRate', type: 'number', min: 0, max: 300, unit: 'bpm' }));
  card.appendChild(g1);

  const g2 = document.createElement('div'); g2.className = 'three-col';
  g2.appendChild(textInput({ label: 'Respiratory rate', section: 'vitals', field: 'respiratoryRate', type: 'number', min: 0, max: 80, unit: '/min' }));
  g2.appendChild(textInput({ label: 'SpO₂', section: 'vitals', field: 'spo2Percent', type: 'number', min: 0, max: 100, step: 0.1, unit: '%' }));
  g2.appendChild(textInput({ label: 'Temperature', section: 'vitals', field: 'temperatureCelsius', type: 'number', min: 25, max: 45, step: 0.1, unit: '°C' }));
  card.appendChild(g2);

  card.appendChild(radioGroup({ label: 'On room air?', section: 'vitals', field: 'onRoomAir', options: yesNo }));
  const cond = document.createElement('div');
  cond.dataset.conditional = 'vitals.onRoomAir=no';
  cond.appendChild(textInput({ label: 'Supplemental oxygen', section: 'vitals', field: 'supplementalOxygenLitres', type: 'number', min: 0, max: 100, step: 0.1, unit: 'L/min' }));
  card.appendChild(cond);

  const g3 = document.createElement('div'); g3.className = 'two-col';
  g3.appendChild(textInput({ label: 'Capillary refill', section: 'vitals', field: 'capillaryRefillSeconds', type: 'number', min: 0, max: 30, step: 0.1, unit: 's' }));
  g3.appendChild(textInput({ label: 'Pain score (0-10)', section: 'vitals', field: 'painScore010', type: 'number', min: 0, max: 10 }));
  card.appendChild(g3);

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Airway assessment',
    description: 'Mallampati class, airway predictors, and STOP-BANG screen.'
  });

  const g1 = document.createElement('div'); g1.className = 'two-col';
  g1.appendChild(selectInput({
    label: 'Mallampati class', section: 'airway', field: 'mallampatiClass',
    options: [
      { value: 'I', label: 'I' }, { value: 'II', label: 'II' },
      { value: 'III', label: 'III' }, { value: 'IV', label: 'IV' }
    ]
  }));
  g1.appendChild(selectInput({
    label: 'Upper-lip bite test', section: 'airway', field: 'upperLipBiteTest',
    options: [{ value: 'I', label: 'I' }, { value: 'II', label: 'II' }, { value: 'III', label: 'III' }]
  }));
  card.appendChild(g1);

  const g2 = document.createElement('div'); g2.className = 'three-col';
  g2.appendChild(textInput({ label: 'Thyromental distance', section: 'airway', field: 'thyromentalDistanceCm', type: 'number', min: 0, max: 30, step: 0.1, unit: 'cm' }));
  g2.appendChild(textInput({ label: 'Mouth opening', section: 'airway', field: 'mouthOpeningCm', type: 'number', min: 0, max: 10, step: 0.1, unit: 'cm' }));
  g2.appendChild(textInput({ label: 'Inter-incisor gap', section: 'airway', field: 'interIncisorGapCm', type: 'number', min: 0, max: 10, step: 0.1, unit: 'cm' }));
  card.appendChild(g2);

  const g3 = document.createElement('div'); g3.className = 'two-col';
  g3.appendChild(selectInput({ label: 'Neck range of motion', section: 'airway', field: 'neckRom', options: ROM_OPTIONS }));
  g3.appendChild(selectInput({
    label: 'Cervical spine stability', section: 'airway', field: 'cervicalSpineStability',
    options: [
      { value: 'stable', label: 'Stable' },
      { value: 'limited', label: 'Limited' },
      { value: 'unstable', label: 'Unstable' }
    ]
  }));
  card.appendChild(g3);

  card.appendChild(selectInput({
    label: 'Dentition', section: 'airway', field: 'dentition',
    options: [
      { value: 'good', label: 'Good' },
      { value: 'loose-teeth', label: 'Loose teeth' },
      { value: 'caps-crowns', label: 'Caps / crowns' },
      { value: 'edentulous', label: 'Edentulous' },
      { value: 'dentures', label: 'Dentures' }
    ]
  }));

  card.appendChild(radioGroup({ label: 'Beard?', section: 'airway', field: 'beard', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Prior difficult intubation?', section: 'airway', field: 'priorDifficultIntubation', options: yesNo }));

  const histHead4 = document.createElement('h3');
  histHead4.textContent = 'Surgical and anaesthetic history';
  card.appendChild(histHead4);
  card.appendChild(textArea({ label: 'Previous surgeries', section: 'airway', field: 'previousSurgeries', rows: 2 }));
  card.appendChild(radioGroup({ label: 'Previous anaesthetic issues?', section: 'airway', field: 'previousAnaestheticIssues', options: yesNo }));
  const paiBox = document.createElement('div');
  paiBox.dataset.conditional = 'airway.previousAnaestheticIssues=yes';
  paiBox.appendChild(textInput({ label: 'Previous anaesthetic issue details', section: 'airway', field: 'previousAnaestheticIssuesDetails' }));
  card.appendChild(paiBox);
  card.appendChild(radioGroup({ label: 'Family history of anaesthetic complications?', section: 'airway', field: 'familyHistoryAnaestheticComplications', options: yesNo }));
  const fhBox = document.createElement('div');
  fhBox.dataset.conditional = 'airway.familyHistoryAnaestheticComplications=yes';
  fhBox.appendChild(textInput({ label: 'Family history details', section: 'airway', field: 'familyHistoryAnaestheticComplicationsDetails' }));
  card.appendChild(fhBox);

  const sbHead = document.createElement('h3');
  sbHead.textContent = 'STOP-BANG screen for OSA';
  card.appendChild(sbHead);
  card.appendChild(radioGroup({ label: 'Loud snoring (S)?', section: 'airway', field: 'stopbangSnoring', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Daytime tiredness (T)?', section: 'airway', field: 'stopbangTired', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Observed apnoea (O)?', section: 'airway', field: 'stopbangObservedApnoea', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Treated for hypertension (P)?', section: 'airway', field: 'stopbangPressure', options: yesNo }));
  card.appendChild(radioGroup({ label: 'BMI > 35 (B)?', section: 'airway', field: 'stopbangBmiGt35', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Age > 50 (A)?', section: 'airway', field: 'stopbangAgeGt50', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Neck > 40 cm (N)?', section: 'airway', field: 'stopbangNeckGt40', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Male (G)?', section: 'airway', field: 'stopbangMale', options: yesNo }));

  card.appendChild(textArea({ label: 'Airway notes', section: 'airway', field: 'airwayNotes', rows: 2 }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Cardiovascular',
    description: 'Cardiac history, examination, ECG, and echo findings.'
  });
  card.appendChild(selectInput({
    label: 'Heart rhythm', section: 'cardiovascular', field: 'heartRhythm',
    options: [
      { value: 'sinus', label: 'Sinus' },
      { value: 'atrial-fibrillation', label: 'Atrial fibrillation' },
      { value: 'flutter', label: 'Atrial flutter' },
      { value: 'heart-block', label: 'Heart block' },
      { value: 'paced', label: 'Paced' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(radioGroup({ label: 'Murmur present?', section: 'cardiovascular', field: 'murmurPresent', options: yesNo }));
  const md = document.createElement('div');
  md.dataset.conditional = 'cardiovascular.murmurPresent=yes';
  md.appendChild(textInput({ label: 'Murmur description', section: 'cardiovascular', field: 'murmurDescription' }));
  card.appendChild(md);

  const g1 = document.createElement('div'); g1.className = 'two-col';
  g1.appendChild(selectInput({
    label: 'Peripheral pulses', section: 'cardiovascular', field: 'peripheralPulses',
    options: [{ value: 'normal', label: 'Normal' }, { value: 'reduced', label: 'Reduced' }, { value: 'absent', label: 'Absent' }]
  }));
  g1.appendChild(selectInput({
    label: 'Peripheral oedema', section: 'cardiovascular', field: 'peripheralOedema',
    options: [{ value: 'none', label: 'None' }, { value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }]
  }));
  card.appendChild(g1);
  card.appendChild(radioGroup({ label: 'JVP raised?', section: 'cardiovascular', field: 'jvpRaised', options: yesNo }));

  const ecgHead = document.createElement('h3'); ecgHead.textContent = 'ECG';
  card.appendChild(ecgHead);
  card.appendChild(radioGroup({ label: 'ECG performed?', section: 'cardiovascular', field: 'ecgPerformed', options: yesNo }));
  const ecgBox = document.createElement('div');
  ecgBox.dataset.conditional = 'cardiovascular.ecgPerformed=yes';
  ecgBox.appendChild(textInput({ label: 'ECG rhythm', section: 'cardiovascular', field: 'ecgRhythm' }));
  ecgBox.appendChild(textInput({ label: 'ECG rate', section: 'cardiovascular', field: 'ecgRateBpm', type: 'number', min: 0, max: 300, unit: 'bpm' }));
  ecgBox.appendChild(selectInput({
    label: 'ECG axis', section: 'cardiovascular', field: 'ecgAxis',
    options: [{ value: 'normal', label: 'Normal' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }, { value: 'extreme', label: 'Extreme' }]
  }));
  ecgBox.appendChild(radioGroup({ label: 'Ischaemic changes on ECG?', section: 'cardiovascular', field: 'ecgIschaemicChanges', options: yesNo }));
  ecgBox.appendChild(textArea({ label: 'ECG notes', section: 'cardiovascular', field: 'ecgNotes', rows: 2 }));
  card.appendChild(ecgBox);

  const echoHead = document.createElement('h3'); echoHead.textContent = 'Echocardiogram';
  card.appendChild(echoHead);
  card.appendChild(radioGroup({ label: 'Echo performed?', section: 'cardiovascular', field: 'echoPerformed', options: yesNo }));
  const echoBox = document.createElement('div');
  echoBox.dataset.conditional = 'cardiovascular.echoPerformed=yes';
  echoBox.appendChild(textInput({ label: 'Ejection fraction', section: 'cardiovascular', field: 'echoEfPercent', type: 'number', min: 0, max: 100, unit: '%' }));
  echoBox.appendChild(textArea({ label: 'Echo notes', section: 'cardiovascular', field: 'echoNotes', rows: 2 }));
  card.appendChild(echoBox);

  const histHead = document.createElement('h3'); histHead.textContent = 'Cardiac history';
  card.appendChild(histHead);
  card.appendChild(radioGroup({ label: 'History of ischaemic heart disease?', section: 'cardiovascular', field: 'historyIhd', options: yesNo }));
  card.appendChild(radioGroup({ label: 'History of congestive heart failure?', section: 'cardiovascular', field: 'historyChf', options: yesNo }));
  card.appendChild(radioGroup({ label: 'History of stroke or TIA?', section: 'cardiovascular', field: 'historyStrokeTia', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Recent MI within 3 months?', section: 'cardiovascular', field: 'recentMiWithin3Months', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Pacemaker or ICD?', section: 'cardiovascular', field: 'pacemakerOrIcd', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Severe valve dysfunction?', section: 'cardiovascular', field: 'severeValveDysfunction', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Active angina?', section: 'cardiovascular', field: 'activeAngina', options: yesNo }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Respiratory',
    description: 'Respiratory examination, asthma/COPD status, smoking, COVID history.'
  });
  card.appendChild(selectInput({
    label: 'Breath sounds', section: 'respiratory', field: 'breathSounds',
    options: [{ value: 'normal', label: 'Normal' }, { value: 'reduced', label: 'Reduced' }, { value: 'bronchial', label: 'Bronchial' }, { value: 'silent', label: 'Silent' }]
  }));
  card.appendChild(radioGroup({ label: 'Wheeze?', section: 'respiratory', field: 'wheeze', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Crackles?', section: 'respiratory', field: 'crackles', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Crepitations?', section: 'respiratory', field: 'crepitations', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Chest-wall deformity?', section: 'respiratory', field: 'chestWallDeformity', options: yesNo }));

  const g1 = document.createElement('div'); g1.className = 'two-col';
  g1.appendChild(selectInput({
    label: 'Asthma', section: 'respiratory', field: 'asthma',
    options: [{ value: 'none', label: 'None' }, { value: 'controlled', label: 'Controlled' }, { value: 'uncontrolled', label: 'Uncontrolled' }]
  }));
  g1.appendChild(selectInput({
    label: 'COPD', section: 'respiratory', field: 'copd',
    options: [{ value: 'none', label: 'None' }, { value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }]
  }));
  card.appendChild(g1);

  card.appendChild(radioGroup({ label: 'CXR performed?', section: 'respiratory', field: 'cxrPerformed', options: yesNo }));
  const cxr = document.createElement('div');
  cxr.dataset.conditional = 'respiratory.cxrPerformed=yes';
  cxr.appendChild(textArea({ label: 'CXR findings', section: 'respiratory', field: 'cxrFindings', rows: 2 }));
  card.appendChild(cxr);

  card.appendChild(radioGroup({ label: 'PFTs performed?', section: 'respiratory', field: 'pftPerformed', options: yesNo }));
  const pft = document.createElement('div');
  pft.dataset.conditional = 'respiratory.pftPerformed=yes';
  const pftG = document.createElement('div'); pftG.className = 'two-col';
  pftG.appendChild(textInput({ label: 'FEV1 % predicted', section: 'respiratory', field: 'pftFev1PercentPredicted', type: 'number', min: 0, max: 200, unit: '%' }));
  pftG.appendChild(textInput({ label: 'FEV1/FVC', section: 'respiratory', field: 'pftFev1FvcRatio', type: 'number', min: 0, max: 1, step: 0.01 }));
  pft.appendChild(pftG);
  card.appendChild(pft);

  const g2 = document.createElement('div'); g2.className = 'two-col';
  g2.appendChild(selectInput({
    label: 'Smoking status', section: 'respiratory', field: 'smokingStatus',
    options: [{ value: 'never', label: 'Never' }, { value: 'ex', label: 'Ex' }, { value: 'current', label: 'Current' }]
  }));
  g2.appendChild(textInput({ label: 'Pack-years', section: 'respiratory', field: 'packYears', type: 'number', min: 0, max: 200 }));
  card.appendChild(g2);

  card.appendChild(selectInput({
    label: 'COVID-19 history', section: 'respiratory', field: 'covidHistory',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'recovered', label: 'Recovered' },
      { value: 'recent', label: 'Recent' },
      { value: 'long-covid', label: 'Long COVID' }
    ]
  }));
  const covidBox = document.createElement('div');
  covidBox.dataset.conditionalAny = 'respiratory.covidHistory=recent,recovered,long-covid';
  covidBox.appendChild(textInput({ label: 'Days since COVID-19', section: 'respiratory', field: 'daysSinceCovid', type: 'number', min: 0, max: 9999 }));
  covidBox.appendChild(radioGroup({ label: 'Unresolved COVID symptoms?', section: 'respiratory', field: 'covidUnresolvedSymptoms', options: yesNo }));
  card.appendChild(covidBox);
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Neurological',
    description: 'GCS, cognition, capacity, and neuro history.'
  });
  const g1 = document.createElement('div'); g1.className = 'four-col';
  g1.appendChild(textInput({ label: 'GCS total', section: 'neurological', field: 'gcsTotal', type: 'number', min: 3, max: 15 }));
  g1.appendChild(textInput({ label: 'GCS eye', section: 'neurological', field: 'gcsEye', type: 'number', min: 1, max: 4 }));
  g1.appendChild(textInput({ label: 'GCS verbal', section: 'neurological', field: 'gcsVerbal', type: 'number', min: 1, max: 5 }));
  g1.appendChild(textInput({ label: 'GCS motor', section: 'neurological', field: 'gcsMotor', type: 'number', min: 1, max: 6 }));
  card.appendChild(g1);

  const g2 = document.createElement('div'); g2.className = 'two-col';
  g2.appendChild(selectInput({
    label: 'Cognition tool', section: 'neurological', field: 'cognitionTool',
    options: [{ value: 'AMT-4', label: 'AMT-4' }, { value: 'MOCA', label: 'MOCA' }, { value: 'MMSE', label: 'MMSE' }, { value: 'none', label: 'None' }]
  }));
  g2.appendChild(textInput({ label: 'Cognition score', section: 'neurological', field: 'cognitionScore', type: 'number', min: 0, max: 100 }));
  card.appendChild(g2);

  card.appendChild(selectInput({
    label: 'Cognitive impairment', section: 'neurological', field: 'cognitiveImpairment',
    options: [{ value: 'none', label: 'None' }, { value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }]
  }));
  card.appendChild(radioGroup({ label: 'Capacity concern for consent?', section: 'neurological', field: 'capacityConcern', options: yesNo }));

  card.appendChild(textArea({ label: 'Cranial-nerves notes', section: 'neurological', field: 'cranialNervesNotes', rows: 2 }));
  card.appendChild(selectInput({
    label: 'Motor power', section: 'neurological', field: 'motorPower',
    options: [{ value: 'normal', label: 'Normal' }, { value: 'reduced', label: 'Reduced' }, { value: 'severely-reduced', label: 'Severely reduced' }]
  }));
  card.appendChild(textArea({ label: 'Sensory notes', section: 'neurological', field: 'sensoryNotes', rows: 2 }));
  card.appendChild(selectInput({
    label: 'Reflexes', section: 'neurological', field: 'reflexes',
    options: [{ value: 'normal', label: 'Normal' }, { value: 'hyperreflexic', label: 'Hyperreflexic' }, { value: 'hyporeflexic', label: 'Hyporeflexic' }, { value: 'absent', label: 'Absent' }]
  }));
  card.appendChild(radioGroup({ label: 'Recent stroke or TIA?', section: 'neurological', field: 'recentStrokeTia', options: yesNo }));
  const strokeBox = document.createElement('div');
  strokeBox.dataset.conditional = 'neurological.recentStrokeTia=yes';
  strokeBox.appendChild(textInput({ label: 'Days since stroke/TIA', section: 'neurological', field: 'daysSinceStrokeTia', type: 'number', min: 0, max: 9999 }));
  card.appendChild(strokeBox);
  card.appendChild(radioGroup({ label: 'Seizure disorder?', section: 'neurological', field: 'seizureDisorder', options: yesNo }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Renal and hepatic',
    description: 'Renal function, dialysis, and liver function tests.'
  });
  const g1 = document.createElement('div'); g1.className = 'three-col';
  g1.appendChild(textInput({ label: 'Creatinine', section: 'renalHepatic', field: 'creatinineUmolL', type: 'number', min: 0, max: 2000, unit: 'µmol/L' }));
  g1.appendChild(textInput({ label: 'eGFR', section: 'renalHepatic', field: 'egfrMlMin173m2', type: 'number', min: 0, max: 200, unit: 'mL/min/1.73 m²' }));
  g1.appendChild(textInput({ label: 'Urea', section: 'renalHepatic', field: 'ureaMmolL', type: 'number', min: 0, max: 200, step: 0.1, unit: 'mmol/L' }));
  card.appendChild(g1);

  const g2 = document.createElement('div'); g2.className = 'three-col';
  g2.appendChild(textInput({ label: 'Sodium', section: 'renalHepatic', field: 'sodiumMmolL', type: 'number', min: 100, max: 200, step: 0.1, unit: 'mmol/L' }));
  g2.appendChild(textInput({ label: 'Potassium', section: 'renalHepatic', field: 'potassiumMmolL', type: 'number', min: 0, max: 10, step: 0.1, unit: 'mmol/L' }));
  g2.appendChild(selectInput({
    label: 'CKD stage', section: 'renalHepatic', field: 'ckdStage',
    options: [
      { value: '1', label: '1' }, { value: '2', label: '2' },
      { value: '3a', label: '3a' }, { value: '3b', label: '3b' },
      { value: '4', label: '4' }, { value: '5', label: '5' }
    ]
  }));
  card.appendChild(g2);

  card.appendChild(selectInput({
    label: 'Dialysis status', section: 'renalHepatic', field: 'dialysisStatus',
    options: [
      { value: 'none', label: 'None' },
      { value: 'peritoneal', label: 'Peritoneal' },
      { value: 'haemodialysis', label: 'Haemodialysis' },
      { value: 'haemofiltration', label: 'Haemofiltration' }
    ]
  }));

  const lftHead = document.createElement('h3'); lftHead.textContent = 'Liver function';
  card.appendChild(lftHead);
  const g3 = document.createElement('div'); g3.className = 'four-col';
  g3.appendChild(textInput({ label: 'Bilirubin', section: 'renalHepatic', field: 'bilirubinUmolL', type: 'number', min: 0, max: 2000, unit: 'µmol/L' }));
  g3.appendChild(textInput({ label: 'ALT', section: 'renalHepatic', field: 'altUL', type: 'number', min: 0, max: 10000, unit: 'U/L' }));
  g3.appendChild(textInput({ label: 'AST', section: 'renalHepatic', field: 'astUL', type: 'number', min: 0, max: 10000, unit: 'U/L' }));
  g3.appendChild(textInput({ label: 'ALP', section: 'renalHepatic', field: 'alpUL', type: 'number', min: 0, max: 10000, unit: 'U/L' }));
  card.appendChild(g3);

  const g4 = document.createElement('div'); g4.className = 'two-col';
  g4.appendChild(textInput({ label: 'Albumin', section: 'renalHepatic', field: 'albuminGL', type: 'number', min: 0, max: 100, step: 0.1, unit: 'g/L' }));
  g4.appendChild(selectInput({
    label: 'Child-Pugh', section: 'renalHepatic', field: 'childPughClass',
    options: [{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'C', label: 'C' }]
  }));
  card.appendChild(g4);

  card.appendChild(selectInput({
    label: 'Chronic liver disease', section: 'renalHepatic', field: 'chronicLiverDisease',
    options: [
      { value: 'none', label: 'None' },
      { value: 'compensated', label: 'Compensated' },
      { value: 'decompensated', label: 'Decompensated' }
    ]
  }));
  card.appendChild(textInput({ label: 'Urinalysis findings', section: 'renalHepatic', field: 'urinalysisFindings' }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Haematology and coagulation',
    description: 'FBC, coagulation, anticoagulation, and transfusion plan.'
  });
  const g1 = document.createElement('div'); g1.className = 'three-col';
  g1.appendChild(textInput({ label: 'Hb', section: 'haematology', field: 'hbGL', type: 'number', min: 0, max: 300, unit: 'g/L' }));
  g1.appendChild(textInput({ label: 'WCC', section: 'haematology', field: 'wcc109L', type: 'number', min: 0, max: 200, step: 0.1, unit: '10⁹/L' }));
  g1.appendChild(textInput({ label: 'Platelets', section: 'haematology', field: 'platelets109L', type: 'number', min: 0, max: 2000, unit: '10⁹/L' }));
  card.appendChild(g1);

  const g2 = document.createElement('div'); g2.className = 'three-col';
  g2.appendChild(textInput({ label: 'MCV', section: 'haematology', field: 'mcvFL', type: 'number', min: 0, max: 200, step: 0.1, unit: 'fL' }));
  g2.appendChild(textInput({ label: 'Ferritin', section: 'haematology', field: 'ferritinUgL', type: 'number', min: 0, max: 10000, unit: 'µg/L' }));
  g2.appendChild(textInput({ label: 'Transferrin sat', section: 'haematology', field: 'transferrinSaturationPercent', type: 'number', min: 0, max: 100, step: 0.1, unit: '%' }));
  card.appendChild(g2);

  const g3 = document.createElement('div'); g3.className = 'three-col';
  g3.appendChild(textInput({ label: 'INR', section: 'haematology', field: 'inr', type: 'number', min: 0, max: 20, step: 0.01 }));
  g3.appendChild(textInput({ label: 'APTT', section: 'haematology', field: 'apttSeconds', type: 'number', min: 0, max: 300, step: 0.1, unit: 's' }));
  g3.appendChild(textInput({ label: 'Fibrinogen', section: 'haematology', field: 'fibrinogenGL', type: 'number', min: 0, max: 20, step: 0.1, unit: 'g/L' }));
  card.appendChild(g3);

  card.appendChild(selectInput({
    label: 'Anaemia severity', section: 'haematology', field: 'anaemiaSeverity',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));

  card.appendChild(radioGroup({ label: 'On anticoagulant?', section: 'haematology', field: 'onAnticoagulant', options: yesNo }));
  const acBox = document.createElement('div');
  acBox.dataset.conditional = 'haematology.onAnticoagulant=yes';
  acBox.appendChild(selectInput({
    label: 'Anticoagulant type', section: 'haematology', field: 'anticoagulantType',
    options: [
      { value: 'warfarin', label: 'Warfarin' },
      { value: 'apixaban', label: 'Apixaban' },
      { value: 'rivaroxaban', label: 'Rivaroxaban' },
      { value: 'edoxaban', label: 'Edoxaban' },
      { value: 'dabigatran', label: 'Dabigatran' },
      { value: 'lmwh', label: 'LMWH' },
      { value: 'heparin-iv', label: 'Heparin IV' },
      { value: 'aspirin', label: 'Aspirin' },
      { value: 'clopidogrel', label: 'Clopidogrel' },
      { value: 'ticagrelor', label: 'Ticagrelor' },
      { value: 'none', label: 'None' }
    ]
  }));
  acBox.appendChild(textInput({ label: 'Hold plan', section: 'haematology', field: 'anticoagulantHoldPlan' }));
  card.appendChild(acBox);

  const g4 = document.createElement('div'); g4.className = 'three-col';
  g4.appendChild(selectInput({
    label: 'Group & save', section: 'haematology', field: 'groupAndSave',
    options: [
      { value: 'not-required', label: 'Not required' },
      { value: 'ordered', label: 'Ordered' },
      { value: 'valid', label: 'Valid' },
      { value: 'expired', label: 'Expired' }
    ]
  }));
  g4.appendChild(textInput({ label: 'Crossmatch units', section: 'haematology', field: 'crossmatchUnits', type: 'number', min: 0, max: 50 }));
  g4.appendChild(textInput({ label: 'Last transfusion date', section: 'haematology', field: 'lastTransfusionDate', type: 'date' }));
  card.appendChild(g4);
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Endocrine',
    description: 'Diabetes, thyroid, adrenal, and steroid status.'
  });
  card.appendChild(selectInput({
    label: 'Diabetes type', section: 'endocrine', field: 'diabetesType',
    options: [
      { value: 'none', label: 'None' },
      { value: 'type-1', label: 'Type 1' },
      { value: 'type-2', label: 'Type 2' },
      { value: 'gestational', label: 'Gestational' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(radioGroup({ label: 'On insulin?', section: 'endocrine', field: 'diabetesOnInsulin', options: yesNo }));

  const g1 = document.createElement('div'); g1.className = 'three-col';
  g1.appendChild(textInput({ label: 'HbA1c', section: 'endocrine', field: 'hba1cMmolMol', type: 'number', min: 0, max: 200, step: 0.1, unit: 'mmol/mol' }));
  g1.appendChild(textInput({ label: 'Fasting glucose', section: 'endocrine', field: 'fastingGlucoseMmolL', type: 'number', min: 0, max: 50, step: 0.1, unit: 'mmol/L' }));
  g1.appendChild(textInput({ label: 'Random glucose', section: 'endocrine', field: 'randomGlucoseMmolL', type: 'number', min: 0, max: 50, step: 0.1, unit: 'mmol/L' }));
  card.appendChild(g1);

  card.appendChild(selectInput({
    label: 'Diabetes control', section: 'endocrine', field: 'diabetesControl',
    options: [
      { value: 'well-controlled', label: 'Well-controlled' },
      { value: 'suboptimal', label: 'Suboptimal' },
      { value: 'poor', label: 'Poor' }
    ]
  }));
  card.appendChild(textArea({ label: 'Diabetes complications', section: 'endocrine', field: 'diabetesComplications', rows: 2 }));

  const g2 = document.createElement('div'); g2.className = 'two-col';
  g2.appendChild(selectInput({
    label: 'Thyroid status', section: 'endocrine', field: 'thyroidStatus',
    options: [{ value: 'euthyroid', label: 'Euthyroid' }, { value: 'hypothyroid', label: 'Hypothyroid' }, { value: 'hyperthyroid', label: 'Hyperthyroid' }]
  }));
  g2.appendChild(textInput({ label: 'TSH', section: 'endocrine', field: 'tshMuL', type: 'number', min: 0, max: 200, step: 0.01, unit: 'mU/L' }));
  card.appendChild(g2);

  card.appendChild(selectInput({
    label: 'Adrenal status', section: 'endocrine', field: 'adrenalStatus',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'addisons', label: "Addison's" },
      { value: 'cushings', label: "Cushing's" },
      { value: 'on-steroid-cover', label: 'On steroid cover' }
    ]
  }));
  card.appendChild(radioGroup({ label: 'On long-term steroids?', section: 'endocrine', field: 'onLongTermSteroids', options: yesNo }));
  const stBox = document.createElement('div');
  stBox.dataset.conditional = 'endocrine.onLongTermSteroids=yes';
  stBox.appendChild(textInput({ label: 'Steroid dose', section: 'endocrine', field: 'steroidDoseMg', type: 'number', min: 0, max: 2000, step: 0.1, unit: 'mg/day' }));
  stBox.appendChild(textInput({ label: 'Steroid cover plan', section: 'endocrine', field: 'steroidCoverPlan' }));
  card.appendChild(stBox);
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Gastrointestinal',
    description: 'Abdominal exam, reflux, and fasting status.'
  });
  card.appendChild(selectInput({
    label: 'Abdominal exam', section: 'gastrointestinal', field: 'abdominalExam',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'distended', label: 'Distended' },
      { value: 'tender', label: 'Tender' },
      { value: 'organomegaly', label: 'Organomegaly' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textArea({ label: 'Abdominal notes', section: 'gastrointestinal', field: 'abdominalNotes', rows: 2 }));
  card.appendChild(selectInput({
    label: 'Reflux symptoms', section: 'gastrointestinal', field: 'refluxSymptoms',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional' },
      { value: 'frequent', label: 'Frequent' },
      { value: 'severe', label: 'Severe' }
    ]
  }));
  card.appendChild(radioGroup({ label: 'Hiatus hernia?', section: 'gastrointestinal', field: 'hiatusHernia', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Previous gastric surgery?', section: 'gastrointestinal', field: 'previousGastricSurgery', options: yesNo }));
  card.appendChild(radioGroup({ label: 'NG tube?', section: 'gastrointestinal', field: 'ngTube', options: yesNo }));
  card.appendChild(selectInput({
    label: 'Stoma', section: 'gastrointestinal', field: 'stoma',
    options: [
      { value: 'none', label: 'None' },
      { value: 'colostomy', label: 'Colostomy' },
      { value: 'ileostomy', label: 'Ileostomy' },
      { value: 'urostomy', label: 'Urostomy' },
      { value: 'gastrostomy', label: 'Gastrostomy' }
    ]
  }));
  card.appendChild(radioGroup({ label: 'Fasting confirmed?', section: 'gastrointestinal', field: 'fastingConfirmed', options: yesNo }));

  const g = document.createElement('div'); g.className = 'two-col';
  g.appendChild(textInput({ label: 'Last solid food at', section: 'gastrointestinal', field: 'lastSolidFoodAt', type: 'time' }));
  g.appendChild(textInput({ label: 'Last clear fluid at', section: 'gastrointestinal', field: 'lastClearFluidAt', type: 'time' }));
  card.appendChild(g);

  card.appendChild(radioGroup({ label: 'Rapid-sequence induction needed?', section: 'gastrointestinal', field: 'rapidSequenceInductionNeeded', options: yesNo }));
  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Musculoskeletal and skin',
    description: 'Spine, joints, IV access, and pressure-ulcer risk.'
  });
  card.appendChild(selectInput({
    label: 'Spine exam', section: 'musculoskeletal', field: 'spineExam',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'scoliosis', label: 'Scoliosis' },
      { value: 'kyphosis', label: 'Kyphosis' },
      { value: 'previous-surgery', label: 'Previous surgery' },
      { value: 'ankylosing-spondylitis', label: 'Ankylosing spondylitis' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textArea({ label: 'Spine notes', section: 'musculoskeletal', field: 'spineNotes', rows: 2 }));
  card.appendChild(selectInput({
    label: 'Neuraxial suitable?', section: 'musculoskeletal', field: 'neuraxialSuitable',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Unsure' }]
  }));

  const g = document.createElement('div'); g.className = 'three-col';
  g.appendChild(selectInput({ label: 'Hip ROM', section: 'musculoskeletal', field: 'jointRomHip', options: ROM_OPTIONS }));
  g.appendChild(selectInput({ label: 'Shoulder ROM', section: 'musculoskeletal', field: 'jointRomShoulder', options: ROM_OPTIONS }));
  g.appendChild(selectInput({ label: 'Neck ROM', section: 'musculoskeletal', field: 'jointRomNeck', options: ROM_OPTIONS }));
  card.appendChild(g);

  const g2 = document.createElement('div'); g2.className = 'three-col';
  g2.appendChild(selectInput({
    label: 'IV access', section: 'musculoskeletal', field: 'skinIvAccess',
    options: [{ value: 'good', label: 'Good' }, { value: 'difficult', label: 'Difficult' }, { value: 'very-difficult', label: 'Very difficult' }]
  }));
  g2.appendChild(selectInput({
    label: 'Block-site skin', section: 'musculoskeletal', field: 'skinBlockSite',
    options: [
      { value: 'intact', label: 'Intact' },
      { value: 'infected', label: 'Infected' },
      { value: 'tattooed', label: 'Tattooed' },
      { value: 'scarred', label: 'Scarred' }
    ]
  }));
  g2.appendChild(selectInput({
    label: 'Pressure-ulcer risk', section: 'musculoskeletal', field: 'pressureUlcerRisk',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high', label: 'High' },
      { value: 'very-high', label: 'Very high' }
    ]
  }));
  card.appendChild(g2);
  return card;
}

function renderStep13() {
  const card = sectionCard({
    stepNumber: 13,
    title: 'Medications and allergies',
    description: 'Current medication list and documented allergies.'
  });
  const medsHeader = document.createElement('div');
  medsHeader.className = 'list-section-header';
  medsHeader.innerHTML = `
    <h3>Current medications</h3>
    <p class="hint">Add each regular medication, including class and peri-operative action.</p>`;
  card.appendChild(medsHeader);
  card.appendChild(medicationListEditor());

  const allergyHeader = document.createElement('div');
  allergyHeader.className = 'list-section-header';
  allergyHeader.innerHTML = `
    <h3>Allergies</h3>
    <p class="hint">Drug, latex, food, contrast, environmental.</p>`;
  card.appendChild(allergyHeader);
  card.appendChild(allergyListEditor());

  const glp1Header = document.createElement('div');
  glp1Header.className = 'list-section-header';
  glp1Header.innerHTML = `
    <h3>GLP-1 receptor agonist management</h3>
    <p class="hint">Delayed gastric emptying raises aspiration risk under anaesthesia.</p>`;
  card.appendChild(glp1Header);

  card.appendChild(radioGroup({ label: 'On a GLP-1 receptor agonist?', section: 'glp1Management', field: 'onGlp1ReceptorAgonist', options: yesNo }));
  const glp1Box = document.createElement('div');
  glp1Box.dataset.conditional = 'glp1Management.onGlp1ReceptorAgonist=yes';

  const glp1G1 = document.createElement('div'); glp1G1.className = 'three-col';
  glp1G1.appendChild(selectInput({
    label: 'Agonist', section: 'glp1Management', field: 'glp1AgonistName',
    options: [
      { value: 'semaglutide', label: 'Semaglutide' },
      { value: 'tirzepatide', label: 'Tirzepatide' },
      { value: 'dulaglutide', label: 'Dulaglutide' },
      { value: 'liraglutide', label: 'Liraglutide' },
      { value: 'exenatide', label: 'Exenatide' },
      { value: 'other', label: 'Other' }
    ]
  }));
  glp1G1.appendChild(selectInput({
    label: 'Formulation', section: 'glp1Management', field: 'glp1Formulation',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' }
    ]
  }));
  glp1G1.appendChild(radioGroup({ label: 'Held per guideline?', section: 'glp1Management', field: 'glp1HeldPerGuideline', options: yesNo }));
  glp1Box.appendChild(glp1G1);

  const glp1G2 = document.createElement('div'); glp1G2.className = 'three-col';
  glp1G2.appendChild(radioGroup({ label: 'Extended clear-fluid fast confirmed?', section: 'glp1Management', field: 'glp1ExtendedClearFluidsConfirmed', options: yesNo }));
  glp1G2.appendChild(radioGroup({ label: 'Active GI symptoms?', section: 'glp1Management', field: 'glp1GiSymptoms', options: yesNo }));
  glp1G2.appendChild(radioGroup({ label: 'Gastric ultrasound performed?', section: 'glp1Management', field: 'glp1GastricUltrasoundPerformed', options: yesNo }));
  glp1Box.appendChild(glp1G2);

  glp1Box.appendChild(textInput({ label: 'GI symptom details', section: 'glp1Management', field: 'glp1GiSymptomsDetails' }));
  glp1Box.appendChild(selectInput({
    label: 'Gastric ultrasound finding', section: 'glp1Management', field: 'glp1GastricUltrasoundFindings',
    options: [
      { value: 'empty', label: 'Empty' },
      { value: 'low-risk', label: 'Low risk' },
      { value: 'full-stomach', label: 'Full stomach' }
    ]
  }));
  glp1Box.appendChild(radioGroup({ label: 'Full-stomach precautions planned?', section: 'glp1Management', field: 'glp1FullStomachPrecautionsPlanned', options: yesNo }));
  glp1Box.appendChild(textArea({ label: 'GLP-1 notes', section: 'glp1Management', field: 'glp1Notes', rows: 2 }));
  card.appendChild(glp1Box);

  return card;
}

function renderStep14() {
  const card = sectionCard({
    stepNumber: 14,
    title: 'Functional capacity and frailty',
    description: 'METs, DASI, ECOG, Clinical Frailty Scale, and CPET.'
  });
  const g1 = document.createElement('div'); g1.className = 'four-col';
  g1.appendChild(textInput({ label: 'METs (estimated)', section: 'functionalCapacity', field: 'metsEstimate', type: 'number', min: 0, max: 20, step: 0.1 }));
  g1.appendChild(textInput({ label: 'DASI score', section: 'functionalCapacity', field: 'dasiScore', type: 'number', min: 0, max: 60, step: 0.1 }));
  g1.appendChild(textInput({ label: 'ECOG (0-4)', section: 'functionalCapacity', field: 'ecogPerformanceStatus', type: 'number', min: 0, max: 4 }));
  g1.appendChild(textInput({ label: 'Clinical Frailty Scale (1-9)', section: 'functionalCapacity', field: 'clinicalFrailtyScale', type: 'number', min: 1, max: 9 }));
  card.appendChild(g1);

  const g2 = document.createElement('div'); g2.className = 'three-col';
  g2.appendChild(textInput({ label: '6-minute walk', section: 'functionalCapacity', field: 'sixMinuteWalkMetres', type: 'number', min: 0, max: 1000, unit: 'm' }));
  g2.appendChild(textInput({ label: 'STS 1-min reps', section: 'functionalCapacity', field: 'stsOneMinuteReps', type: 'number', min: 0, max: 100 }));
  g2.appendChild(textInput({ label: 'TUG', section: 'functionalCapacity', field: 'tugSeconds', type: 'number', min: 0, max: 300, step: 0.1, unit: 's' }));
  card.appendChild(g2);

  card.appendChild(radioGroup({ label: 'CPET performed?', section: 'functionalCapacity', field: 'cpetPerformed', options: yesNo }));
  const cpetBox = document.createElement('div');
  cpetBox.dataset.conditional = 'functionalCapacity.cpetPerformed=yes';
  const cpetG = document.createElement('div'); cpetG.className = 'two-col';
  cpetG.appendChild(textInput({ label: 'VO₂ peak', section: 'functionalCapacity', field: 'cpetVo2PeakMlKgMin', type: 'number', min: 0, max: 100, step: 0.1, unit: 'mL/kg/min' }));
  cpetG.appendChild(textInput({ label: 'Anaerobic threshold', section: 'functionalCapacity', field: 'cpetAnaerobicThresholdMlKgMin', type: 'number', min: 0, max: 100, step: 0.1, unit: 'mL/kg/min' }));
  cpetBox.appendChild(cpetG);
  cpetBox.appendChild(textArea({ label: 'CPET notes', section: 'functionalCapacity', field: 'cpetNotes', rows: 2 }));
  card.appendChild(cpetBox);

  const g3 = document.createElement('div'); g3.className = 'two-col';
  g3.appendChild(selectInput({
    label: 'Malnutrition risk', section: 'functionalCapacity', field: 'malnutritionRisk',
    options: [
      { value: 'none', label: 'None' },
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' }
    ]
  }));
  g3.appendChild(textInput({ label: 'Unintentional weight loss', section: 'functionalCapacity', field: 'unintentionalWeightLossKg', type: 'number', min: 0, max: 100, step: 0.1, unit: 'kg' }));
  card.appendChild(g3);

  const shHead = document.createElement('h3');
  shHead.textContent = 'Social history';
  card.appendChild(shHead);
  card.appendChild(selectInput({
    label: 'Living situation', section: 'functionalCapacity', field: 'livingSituation',
    options: [
      { value: 'independent', label: 'Independent' },
      { value: 'lives-with-family', label: 'Lives with family' },
      { value: 'sheltered-housing', label: 'Sheltered housing' },
      { value: 'residential-care', label: 'Residential care' },
      { value: 'nursing-home', label: 'Nursing home' }
    ]
  }));
  card.appendChild(radioGroup({ label: 'Support at home?', section: 'functionalCapacity', field: 'supportAtHome', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Falls within last year?', section: 'functionalCapacity', field: 'fallsRiskWithinYear', options: yesNo }));
  card.appendChild(textInput({ label: 'Mobility status', section: 'functionalCapacity', field: 'mobilityStatus' }));

  const friedHead = document.createElement('h3');
  friedHead.textContent = 'Fried Frailty Phenotype';
  card.appendChild(friedHead);
  const g4 = document.createElement('div'); g4.className = 'three-col';
  g4.appendChild(radioGroup({ label: 'Weakness', section: 'functionalCapacity', field: 'friedWeakness', options: yesNo }));
  g4.appendChild(radioGroup({ label: 'Slowness', section: 'functionalCapacity', field: 'friedSlowness', options: yesNo }));
  g4.appendChild(radioGroup({ label: 'Low physical activity', section: 'functionalCapacity', field: 'friedLowPhysicalActivity', options: yesNo }));
  card.appendChild(g4);
  const g5 = document.createElement('div'); g5.className = 'three-col';
  g5.appendChild(radioGroup({ label: 'Exhaustion', section: 'functionalCapacity', field: 'friedExhaustion', options: yesNo }));
  g5.appendChild(radioGroup({ label: 'Unintentional weight loss', section: 'functionalCapacity', field: 'friedUnintentionalWeightLoss', options: yesNo }));
  g5.appendChild(textInput({ label: 'Risk Analysis Index score', section: 'functionalCapacity', field: 'riskAnalysisIndexScore', type: 'number', min: 0, max: 100 }));
  card.appendChild(g5);

  const cogHead = document.createElement('h3');
  cogHead.textContent = 'Cognitive screening (Mini-Cog)';
  card.appendChild(cogHead);
  const cogHint = document.createElement('p');
  cogHint.className = 'hint';
  cogHint.textContent = 'Indicated when the Clinical Frailty Scale is 5 or above.';
  card.appendChild(cogHint);
  const g6 = document.createElement('div'); g6.className = 'two-col';
  g6.appendChild(radioGroup({ label: 'Mini-Cog performed?', section: 'functionalCapacity', field: 'miniCogPerformed', options: yesNo }));
  g6.appendChild(textInput({ label: 'Mini-Cog score (0-5)', section: 'functionalCapacity', field: 'miniCogScore', type: 'number', min: 0, max: 5 }));
  card.appendChild(g6);

  const prehabHead = document.createElement('h3');
  prehabHead.textContent = 'Prehabilitation';
  card.appendChild(prehabHead);
  const g7 = document.createElement('div'); g7.className = 'three-col';
  g7.appendChild(radioGroup({ label: 'Prehabilitation indicated?', section: 'functionalCapacity', field: 'prehabilitationIndicated', options: yesNo }));
  g7.appendChild(selectInput({
    label: 'Prehabilitation type', section: 'functionalCapacity', field: 'prehabilitationType',
    options: [
      { value: 'nutrition', label: 'Nutrition' },
      { value: 'aerobic', label: 'Aerobic' },
      { value: 'resistance', label: 'Resistance' },
      { value: 'multimodal', label: 'Multimodal' },
      { value: 'other', label: 'Other' }
    ]
  }));
  g7.appendChild(textInput({ label: 'Prehabilitation start date', section: 'functionalCapacity', field: 'prehabilitationStartDate', type: 'date' }));
  card.appendChild(g7);
  card.appendChild(radioGroup({ label: 'Protein supplementation recommended?', section: 'functionalCapacity', field: 'proteinSupplementationRecommended', options: yesNo }));
  return card;
}

function renderStep15() {
  const card = sectionCard({
    stepNumber: 15,
    title: 'Anaesthesia and post-op plan',
    description: 'Technique, monitoring, analgesia, and disposition.'
  });
  const g1 = document.createElement('div'); g1.className = 'two-col';
  g1.appendChild(selectInput({
    label: 'Technique', section: 'anaesthesiaPlan', field: 'technique',
    options: [
      { value: 'ga', label: 'General anaesthesia' },
      { value: 'regional', label: 'Regional' },
      { value: 'neuraxial', label: 'Neuraxial' },
      { value: 'sedation', label: 'Sedation' },
      { value: 'mac', label: 'MAC' },
      { value: 'local', label: 'Local' },
      { value: 'combined-ga-regional', label: 'GA + regional' }
    ]
  }));
  g1.appendChild(selectInput({
    label: 'Airway plan', section: 'anaesthesiaPlan', field: 'airwayPlan',
    options: [
      { value: 'face-mask', label: 'Face mask' },
      { value: 'supraglottic', label: 'Supraglottic' },
      { value: 'ett', label: 'ETT' },
      { value: 'awake-fibreoptic', label: 'Awake fibreoptic' },
      { value: 'surgical-airway', label: 'Surgical airway' }
    ]
  }));
  card.appendChild(g1);
  card.appendChild(radioGroup({ label: 'RSI planned?', section: 'anaesthesiaPlan', field: 'rsiPlanned', options: yesNo }));

  card.appendChild(selectInput({
    label: 'Monitoring level', section: 'anaesthesiaPlan', field: 'monitoringLevel',
    options: [
      { value: 'standard', label: 'Standard' },
      { value: 'invasive-arterial', label: 'Invasive arterial' },
      { value: 'invasive-cvc', label: 'Invasive CVC' },
      { value: 'cardiac-output', label: 'Cardiac output' }
    ]
  }));

  card.appendChild(textInput({ label: 'Analgesia plan', section: 'anaesthesiaPlan', field: 'analgesiaPlan' }));
  card.appendChild(textInput({ label: 'Regional block planned', section: 'anaesthesiaPlan', field: 'regionalBlockPlanned' }));
  card.appendChild(textInput({ label: 'DVT prophylaxis', section: 'anaesthesiaPlan', field: 'dvtProphylaxis' }));
  card.appendChild(textInput({ label: 'Antibiotic prophylaxis', section: 'anaesthesiaPlan', field: 'antibioticProphylaxis' }));

  const g2 = document.createElement('div'); g2.className = 'two-col';
  g2.appendChild(selectInput({
    label: 'Post-op disposition', section: 'anaesthesiaPlan', field: 'postOpDisposition',
    options: [
      { value: 'day-case', label: 'Day case' },
      { value: 'ward', label: 'Ward' },
      { value: 'enhanced-care', label: 'Enhanced care' },
      { value: 'hdu', label: 'HDU' },
      { value: 'icu', label: 'ICU' }
    ]
  }));
  g2.appendChild(textInput({ label: 'Length of stay', section: 'anaesthesiaPlan', field: 'anticipatedLengthOfStayDays', type: 'number', min: 0, max: 365, unit: 'days' }));
  card.appendChild(g2);

  card.appendChild(textInput({ label: 'Special equipment', section: 'anaesthesiaPlan', field: 'specialEquipment' }));
  card.appendChild(textInput({ label: 'Blood products required', section: 'anaesthesiaPlan', field: 'bloodProductsRequired' }));

  const g3 = document.createElement('div'); g3.className = 'two-col';
  g3.appendChild(selectInput({
    label: 'VTE risk assessment', section: 'anaesthesiaPlan', field: 'vteRiskLevel',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' }
    ]
  }));
  g3.appendChild(selectInput({
    label: 'COVID-19 screening / PCR', section: 'anaesthesiaPlan', field: 'covidScreeningResult',
    options: [
      { value: 'not-tested', label: 'Not tested' },
      { value: 'negative', label: 'Negative' },
      { value: 'positive', label: 'Positive' },
      { value: 'pending', label: 'Pending' }
    ]
  }));
  card.appendChild(g3);

  const dpHead = document.createElement('h3');
  dpHead.textContent = 'Discharge planning';
  card.appendChild(dpHead);
  card.appendChild(selectInput({
    label: 'Planned discharge destination', section: 'anaesthesiaPlan', field: 'dischargeDestination',
    options: [
      { value: 'home', label: 'Home' },
      { value: 'home-with-support', label: 'Home with support' },
      { value: 'residential-care', label: 'Residential care' },
      { value: 'nursing-home', label: 'Nursing home' },
      { value: 'rehabilitation', label: 'Rehabilitation' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(radioGroup({ label: 'Social services involvement?', section: 'anaesthesiaPlan', field: 'socialServicesInvolvement', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Reablement / physiotherapy needs?', section: 'anaesthesiaPlan', field: 'reablementPhysiotherapyNeeds', options: yesNo }));
  card.appendChild(textInput({ label: 'Follow-up requirements', section: 'anaesthesiaPlan', field: 'followUpRequirements' }));
  return card;
}

function renderStep16() {
  const card = sectionCard({
    stepNumber: 16,
    title: 'Summary, ASA grade, and sign-off',
    description: 'Override the computed ASA grade if required, document the recommendation and sign.'
  });
  card.appendChild(selectInput({
    label: 'Final ASA grade (override)', section: 'summary', field: 'finalAsaGrade',
    options: [
      { value: 'I', label: 'I' }, { value: 'II', label: 'II' },
      { value: 'III', label: 'III' }, { value: 'IV', label: 'IV' },
      { value: 'V', label: 'V' }, { value: 'VI', label: 'VI' }
    ]
  }));
  card.appendChild(textInput({ label: 'Override reason', section: 'summary', field: 'overrideReason' }));
  card.appendChild(selectInput({
    label: 'Recommendation', section: 'summary', field: 'recommendation',
    options: [
      { value: 'proceed', label: 'Proceed' },
      { value: 'optimise-first', label: 'Optimise first' },
      { value: 'mdt-review', label: 'MDT review' },
      { value: 'cancel', label: 'Cancel' }
    ]
  }));
  card.appendChild(textArea({ label: 'Clinician notes', section: 'summary', field: 'clinicianNotes', rows: 3 }));

  const consentHead = document.createElement('h3');
  consentHead.textContent = 'Patient education and consent';
  card.appendChild(consentHead);
  card.appendChild(selectInput({
    label: 'Consent status', section: 'summary', field: 'consentStatus',
    options: [
      { value: 'obtained', label: 'Obtained' },
      { value: 'pending', label: 'Pending' },
      { value: 'declined', label: 'Declined' },
      { value: 'unable-to-consent', label: 'Unable to consent' }
    ]
  }));
  card.appendChild(radioGroup({ label: 'Interpreter required?', section: 'summary', field: 'interpreterRequired', options: yesNo }));

  const discussHead = document.createElement('h4');
  discussHead.textContent = 'Discussion held regarding';
  card.appendChild(discussHead);
  card.appendChild(radioGroup({ label: 'Procedure discussed?', section: 'summary', field: 'discussionProcedure', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Anaesthetic discussed?', section: 'summary', field: 'discussionAnaesthetic', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Risks / benefits discussed?', section: 'summary', field: 'discussionRisksBenefits', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Alternatives discussed?', section: 'summary', field: 'discussionAlternatives', options: yesNo }));

  card.appendChild(textInput({ label: 'Signed at', section: 'summary', field: 'signedAt', type: 'datetime-local' }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
  renderStep6, renderStep7, renderStep8, renderStep9, renderStep10,
  renderStep11, renderStep12, renderStep13, renderStep14, renderStep15,
  renderStep16
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
  const bmi = document.getElementById('bmi-readout');
  if (bmi) {
    const v = state.patient.bmi;
    bmi.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}</strong> <span class="muted">(${esc(bmiCategory(v))})</span>`;
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Clinician (1)
  ['clinician', 'clinicianName'], ['clinician', 'clinicianRole'],
  ['clinician', 'siteName'], ['clinician', 'assessmentDate'],
  // Patient (2)
  ['patient', 'firstName'], ['patient', 'lastName'],
  ['patient', 'dateOfBirth'], ['patient', 'hospitalNumber'], ['patient', 'sex'],
  ['patient', 'weightKg'], ['patient', 'heightCm'],
  // Surgery (2)
  ['surgery', 'plannedProcedure'], ['surgery', 'indicationForSurgery'],
  ['surgery', 'urgency'], ['surgery', 'surgicalSeverity'],
  // Vitals (3)
  ['vitals', 'systolicBp'], ['vitals', 'diastolicBp'],
  ['vitals', 'heartRate'], ['vitals', 'spo2Percent'],
  ['vitals', 'onRoomAir'],
  // Airway (4)
  ['airway', 'mallampatiClass'], ['airway', 'priorDifficultIntubation'],
  ['airway', 'previousAnaestheticIssues'],
  ['airway', 'familyHistoryAnaestheticComplications'],
  ['airway', 'stopbangSnoring'], ['airway', 'stopbangTired'],
  ['airway', 'stopbangObservedApnoea'], ['airway', 'stopbangPressure'],
  ['airway', 'stopbangBmiGt35'], ['airway', 'stopbangAgeGt50'],
  ['airway', 'stopbangNeckGt40'], ['airway', 'stopbangMale'],
  // Cardiovascular (5)
  ['cardiovascular', 'historyIhd'], ['cardiovascular', 'historyChf'],
  ['cardiovascular', 'historyStrokeTia'],
  ['cardiovascular', 'recentMiWithin3Months'],
  ['cardiovascular', 'pacemakerOrIcd'],
  ['cardiovascular', 'severeValveDysfunction'],
  ['cardiovascular', 'activeAngina'],
  // Respiratory (6)
  ['respiratory', 'asthma'], ['respiratory', 'copd'],
  ['respiratory', 'smokingStatus'], ['respiratory', 'covidHistory'],
  // Neurological (7)
  ['neurological', 'cognitiveImpairment'], ['neurological', 'capacityConcern'],
  ['neurological', 'recentStrokeTia'],
  // Renal/Hepatic (8)
  ['renalHepatic', 'creatinineUmolL'], ['renalHepatic', 'egfrMlMin173m2'],
  ['renalHepatic', 'dialysisStatus'], ['renalHepatic', 'chronicLiverDisease'],
  ['renalHepatic', 'urinalysisFindings'],
  // Haematology (9)
  ['haematology', 'hbGL'], ['haematology', 'platelets109L'],
  ['haematology', 'inr'], ['haematology', 'onAnticoagulant'],
  ['haematology', 'groupAndSave'],
  // Endocrine (10)
  ['endocrine', 'diabetesType'], ['endocrine', 'diabetesOnInsulin'],
  ['endocrine', 'diabetesControl'], ['endocrine', 'onLongTermSteroids'],
  // GI (11)
  ['gastrointestinal', 'refluxSymptoms'], ['gastrointestinal', 'fastingConfirmed'],
  ['gastrointestinal', 'rapidSequenceInductionNeeded'],
  // MSK (12)
  ['musculoskeletal', 'spineExam'], ['musculoskeletal', 'neuraxialSuitable'],
  // Functional (14)
  ['functionalCapacity', 'clinicalFrailtyScale'],
  ['functionalCapacity', 'malnutritionRisk'],
  ['functionalCapacity', 'livingSituation'],
  ['functionalCapacity', 'fallsRiskWithinYear'],
  // Plan (15)
  ['anaesthesiaPlan', 'technique'], ['anaesthesiaPlan', 'airwayPlan'],
  ['anaesthesiaPlan', 'postOpDisposition'],
  ['anaesthesiaPlan', 'vteRiskLevel'], ['anaesthesiaPlan', 'dischargeDestination'],
  // Summary (16)
  ['summary', 'recommendation'], ['summary', 'consentStatus']
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
  { step: 1,  section: 'clinician',         title: 'Clinician' },
  { step: 2,  section: 'patient',           title: 'Patient + Surgery' },
  { step: 3,  section: 'vitals',            title: 'Vital signs' },
  { step: 4,  section: 'airway',            title: 'Airway' },
  { step: 5,  section: 'cardiovascular',    title: 'Cardiovascular' },
  { step: 6,  section: 'respiratory',       title: 'Respiratory' },
  { step: 7,  section: 'neurological',      title: 'Neurological' },
  { step: 8,  section: 'renalHepatic',      title: 'Renal / Hepatic' },
  { step: 9,  section: 'haematology',       title: 'Haematology' },
  { step: 10, section: 'endocrine',         title: 'Endocrine' },
  { step: 11, section: 'gastrointestinal',  title: 'Gastrointestinal' },
  { step: 12, section: 'musculoskeletal',   title: 'Musculoskeletal' },
  { step: 13, section: 'medications',       title: 'Meds + Allergies' },
  { step: 14, section: 'functionalCapacity', title: 'Functional Capacity' },
  { step: 15, section: 'anaesthesiaPlan',   title: 'Anaesthesia Plan' },
  { step: 16, section: 'summary',           title: 'Summary' }
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
    computedAsaGrade,
    finalAsaGrade,
    asaEmergencySuffix,
    overrideReason,
    mallampatiClass,
    rcriScore,
    stopbangScore,
    frailtyScale,
    friedPhenotypeScore,
    friedFrailtyCategory,
    compositeRisk,
    firedRules,
    additionalFlags,
    timestamp
  } = lastResult;

  const flagsList = additionalFlags.length === 0
    ? `<p class="muted">No additional flags raised.</p>`
    : `
      <ul class="flags">
        ${additionalFlags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}</span>
            <span class="flag-action">${esc(f.suggestedAction)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const firedRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.ruleId)}</th>
      <td>${esc(r.instrument)}</td>
      <td>${esc(r.grade)}</td>
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No rules fired (default ASA I).</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Rule</th>
            <th scope="col">Instrument</th>
            <th scope="col">Grade</th>
            <th scope="col">Category</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const overrideBlock = overrideReason
    ? `<p class="muted">Override reason: ${esc(overrideReason)}</p>`
    : '';

  out.innerHTML = `
    <h2>Pre-operative Assessment Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>ASA Physical Status</h3>
    <p class="asa-summary">
      <span class="asa-score-badge asa-${esc(finalAsaGrade)}">${esc(finalAsaGrade)}${esc(asaEmergencySuffix)}</span>
      <span class="risk-pill risk-${esc(compositeRisk)}">${esc(riskLabel(compositeRisk))}</span>
    </p>
    <p class="muted">
      Computed grade: <strong>${esc(computedAsaGrade)}</strong>${
        finalAsaGrade !== computedAsaGrade ? ` · Final: <strong>${esc(finalAsaGrade)}</strong>` : ''
      }
    </p>
    ${overrideBlock}

    <h3>Subscale scores</h3>
    <div class="subscale-chips">
      <span class="subscale-chip">Mallampati: <strong>${esc(mallampatiClass || '—')}</strong></span>
      <span class="subscale-chip">RCRI: <strong>${rcriScore}</strong> / 6</span>
      <span class="subscale-chip">STOP-BANG: <strong>${stopbangScore}</strong> / 8</span>
      <span class="subscale-chip">CFS: <strong>${frailtyScale ?? '—'}</strong> / 9</span>
      <span class="subscale-chip">Fried: <strong>${friedPhenotypeScore ?? '—'}</strong> / 5${friedFrailtyCategory ? ` (${esc(friedFrailtyCategory)})` : ''}</span>
    </div>

    <h3>Fired rules</h3>
    ${firedTable}

    <h3>Safety flags</h3>
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
  const result = calculateASA(state);
  lastResult = {
    ...result,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh assessment?')) return;
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
