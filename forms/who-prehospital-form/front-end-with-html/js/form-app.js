import { detectFlaggedIssues } from './flagged-issues.js';
import { validatePrehospital } from './prehospital-validator.js';
import { emptyAssessment, emptyReassessment, gcsTotal, hasNumber, hasText, isYesNoAnswered, priorityLabel, sectionLabel } from './types.js';

// Single-page continuous wizard: every section is rendered into the page in
// document order. Conditional rules (RED-triage airway / IV access;
// RED-triage GCS; injury intent / mechanism only when "Injury" is checked;
// bleeding control only when an active bleeding site is recorded; SAMPLE
// Unknown vs free-text alternation; drowning life vest only when drowning;
// vehicle "other" detail; reassessment array up to 3 entries) are gated by
// the validator's applies() so the report only counts a rule when its branch
// is active. Submission runs the pure validator + flagged-issues engine and
// renders an inline report. State is persisted to localStorage so a partial
// fill survives a page reload.
//
// Lily Design System HTML headless: this file emits Lily-shaped DOM
// (fieldset.fieldset, .field, .label, .text-input, .radio-group,
// .radio-input, .error-message, .error-summary, .panel, .step-list,
// .progress) per forms/AGENTS-front-end-html.md.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'who-prehospital-form.front-end-form-with-html.v1';
const TOTAL_STEPS = 16;

/** Deep-merge persisted state over a fresh empty assessment. Arrays
 * (i.e. `reassessments`) are taken wholesale from the persisted source
 * when present; per-element shape is normalised against a fresh
 * Reassessment template so unknown / missing keys do not crash later. */
function mergeDeep(target, source) {
  if (!source || typeof source !== 'object') return target;
  for (const key of Object.keys(target)) {
    const t = target[key];
    const s = source[key];
    if (Array.isArray(t)) {
      if (Array.isArray(s)) {
        target[key] = s;
      }
    } else if (
      t !== null &&
      typeof t === 'object' &&
      s !== null &&
      typeof s === 'object' &&
      !Array.isArray(s)
    ) {
      mergeDeep(t, s);
    } else if (s !== undefined) {
      target[key] = s;
    }
  }
  return target;
}

/** Normalise a persisted reassessment entry against a fresh template. */
function normaliseReassessment(raw) {
  const fresh = emptyReassessment();
  if (raw && typeof raw === 'object') {
    for (const k of Object.keys(fresh)) {
      if (raw[k] !== undefined) fresh[k] = raw[k];
    }
  }
  return fresh;
}

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyAssessment();

  mergeDeep(fresh, parsed);
  if (Array.isArray(fresh.reassessments)) {
    fresh.reassessments = fresh.reassessments
      .slice(0, 3)
      .map(normaliseReassessment);
  } else {
    fresh.reassessments = [];
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
    console.warn('Could not parse saved WHO prehospital form; starting fresh.', e);
    return emptyAssessment();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save WHO prehospital form to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored WHO prehospital form.', e);
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
  slug: 'who-prehospital-form',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const out = document.getElementById('report');
    if (out) out.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/** Resolve a dotted path on state. Supports array indices, e.g.
 * `reassessments.0.hr`. */
function getPath(path) {
  const parts = path.split('.');
  let cur = state;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

/** Write a value at a dotted path on state, without re-rendering. */
function writePath(path, value) {
  const parts = path.split('.');
  let cur = state;
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
  cur[parts[parts.length - 1]] = value;
}

/** Set a dotted path on state, persist, and re-render the form. Used for
 * any field whose change reshapes conditional rendering (radio choices,
 * checkboxes that gate other sections, select dropdowns that reveal
 * "other" detail). */
function setPath(path, value) {
  writePath(path, value);
  saveState();
  renderForm();
  updateProgress();
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
// Lily input class mapping
// ----------------------------------------------------------------------

function lilyInputClass(type) {
  switch (type) {
    case 'email':           return 'email-input';
    case 'number':          return 'number-input';
    case 'date':            return 'date-input';
    case 'time':            return 'time-input';
    case 'datetime-local':  return 'datetime-input';
    case 'tel':             return 'tel-input';
    case 'url':             return 'url-input';
    case 'search':          return 'search-input';
    default:                return 'text-input';
  }
}

// ----------------------------------------------------------------------
// Field component builders (Lily HTML headless contract)
// ----------------------------------------------------------------------

function textInput(opts) {
  const id = `f-${opts.path.replace(/\./g, '-')}`;
  const value = getPath(opts.path) ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const placeholderAttr = opts.placeholder ? ` placeholder="${esc(opts.placeholder)}"` : '';
  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input id="${id}" name="${id}" type="${type}" class="${lilyInputClass(type)}"
      value="${esc(value)}"${placeholderAttr}${requiredAttr}
      aria-describedby="${id}-error">
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    writePath(opts.path, input.value);
    saveState();
    updateProgress();
    clearFieldError(id);
  });
  return wrapper;
}

function numberInput(opts) {
  const id = `f-${opts.path.replace(/\./g, '-')}`;
  const raw = getPath(opts.path);
  const value = hasNumber(raw) ? String(raw) : '';
  const labelText =
    esc(opts.label) +
    (opts.unit ? ` <span class="unit">${esc(opts.unit)}</span>` : '') +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const minAttr = opts.min !== undefined ? ` min="${opts.min}"` : '';
  const maxAttr = opts.max !== undefined ? ` max="${opts.max}"` : '';
  const stepAttr = opts.step !== undefined ? ` step="${opts.step}"` : '';
  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input id="${id}" name="${id}" type="number" class="number-input"
      value="${esc(value)}"${minAttr}${maxAttr}${stepAttr}${requiredAttr}
      inputmode="decimal"
      aria-describedby="${id}-error">
    <span class="error-message" id="${id}-error"></span>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    const txt = input.value.trim();
    if (txt === '') {
      writePath(opts.path, null);
    } else {
      const n = Number(txt);
      writePath(opts.path, Number.isFinite(n) ? n : null);
    }
    saveState();
    updateProgress();
    clearFieldError(id);
  });
  return wrapper;
}

function textArea(opts) {
  const id = `f-${opts.path.replace(/\./g, '-')}`;
  const value = getPath(opts.path) ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const placeholderAttr = opts.placeholder ? ` placeholder="${esc(opts.placeholder)}"` : '';
  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      class="text-area-input"${placeholderAttr}${requiredAttr}
      aria-describedby="${id}-error">${esc(value)}</textarea>
    <span class="error-message" id="${id}-error"></span>
  `;
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => {
    writePath(opts.path, ta.value);
    saveState();
    updateProgress();
    clearFieldError(id);
  });
  return wrapper;
}

function radioGroup(opts) {
  const groupId = `f-${opts.path.replace(/\./g, '-')}`;
  const current = getPath(opts.path);
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.innerHTML = labelText;
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const lab = document.createElement('label');
    lab.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    const requiredAttr = opts.required ? ' data-required' : '';
    lab.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}${requiredAttr}>
      <span>${esc(option.label)}</span>
    `;
    const input = lab.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        setPath(opts.path, option.value);
        clearFieldError(groupId);
      }
    });
    list.appendChild(lab);
  }
  wrapper.appendChild(list);

  const err = document.createElement('span');
  err.className = 'error-message';
  err.id = `${groupId}-error`;
  wrapper.appendChild(err);
  return wrapper;
}

function selectInput(opts) {
  const id = `f-${opts.path.replace(/\./g, '-')}`;
  const current = getPath(opts.path) ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const optionHtml = ['<option value="">— Select —</option>']
    .concat(opts.options.map((o) => {
      const sel = current === o.value ? ' selected' : '';
      return `<option value="${esc(o.value)}"${sel}>${esc(o.label)}</option>`;
    }))
    .join('');
  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select"${requiredAttr}
      aria-describedby="${id}-error">${optionHtml}</select>
    <span class="error-message" id="${id}-error"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => {
    setPath(opts.path, sel.value);
    clearFieldError(id);
  });
  return wrapper;
}

function checkbox(opts) {
  const id = `f-${opts.path.replace(/\./g, '-')}`;
  const checked = !!getPath(opts.path);
  const wrapper = document.createElement('label');
  wrapper.className = 'checkbox-field';
  wrapper.htmlFor = id;
  wrapper.innerHTML = `
    <input class="checkbox-input" type="checkbox" id="${id}" name="${id}"${checked ? ' checked' : ''}>
    <span>${esc(opts.label)}</span>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('change', () => {
    setPath(opts.path, input.checked);
  });
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

function twoCol(...children) {
  const grid = document.createElement('div');
  grid.className = 'two-col';
  for (const c of children) grid.appendChild(c);
  return grid;
}

function threeCol(...children) {
  const grid = document.createElement('div');
  grid.className = 'three-col';
  for (const c of children) grid.appendChild(c);
  return grid;
}

function subsectionTitle(text) {
  const h = document.createElement('h3');
  h.className = 'subsection-heading';
  h.textContent = text;
  return h;
}

function infoNote(text, muted) {
  const p = document.createElement('p');
  p.className = muted ? 'info-note muted-note' : 'info-note';
  p.textContent = text;
  return p;
}

// Shared option lists ------------------------------------------------------

const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
];

const SCENE_CALL_TYPE_OPTIONS = [
  { value: 'scene', label: 'Scene call' },
  { value: 'inter-facility-transfer', label: 'Inter-Facility Transfer' }
];

const SCENE_LOCATION_OPTIONS = [
  { value: 'residence', label: 'Residence' },
  { value: 'school', label: 'School' },
  { value: 'public-building', label: 'Public Building' },
  { value: 'health-facility', label: 'Health Facility' },
  { value: 'street', label: 'Street' },
  { value: 'other', label: 'Other' }
];

const PREGNANT_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' }
];

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const TRIAGE_OPTIONS = [
  { value: 'red', label: 'RED — Immediate / life-threatening' },
  { value: 'yellow', label: 'YELLOW — Urgent' },
  { value: 'green', label: 'GREEN — Non-urgent' }
];

const AVPU_OPTIONS = [
  { value: 'A', label: 'A — Alert' },
  { value: 'V', label: 'V — Voice' },
  { value: 'P', label: 'P — Pain' },
  { value: 'U', label: 'U — Unresponsive' }
];

const INJURY_INTENT_OPTIONS = [
  { value: 'intentional', label: 'Intentional' },
  { value: 'unintentional', label: 'Unintentional' },
  { value: 'self-inflicted', label: 'Self-inflicted' }
];

const VEHICLE_OPTIONS = [
  { value: 'car', label: 'Car' },
  { value: 'bike', label: 'Bike' },
  { value: 'motorbike', label: 'Motorbike' },
  { value: 'other', label: 'Other' }
];

const PE_SYSTEMS = [
  { key: 'general', label: 'General' },
  { key: 'heent', label: 'HEENT' },
  { key: 'respiratory', label: 'Respiratory' },
  { key: 'cardiac', label: 'Cardiac' },
  { key: 'abdominal', label: 'Abdominal' },
  { key: 'pelvisGu', label: 'Pelvis / GU' },
  { key: 'neurologic', label: 'Neurologic' },
  { key: 'psychiatric', label: 'Psychiatric' },
  { key: 'musculoskeletal', label: 'Musculoskeletal (MSK)' },
  { key: 'skin', label: 'Skin' }
];

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Caller & Scene',
    description: 'Caller information, patient identification, scene details, and run timestamps.'
  });

  card.appendChild(checkbox({ label: 'Mass Casualty incident', path: 'callerAndScene.massCasualty' }));

  card.appendChild(subsectionTitle('Caller'));
  card.appendChild(twoCol(
    textInput({ label: 'Caller name', path: 'callerAndScene.callerName' }),
    textInput({ label: 'Caller phone', path: 'callerAndScene.callerPhone', type: 'tel' })
  ));

  card.appendChild(subsectionTitle('Patient'));
  card.appendChild(textInput({
    label: 'Patient name',
    path: 'callerAndScene.patientName',
    required: true
  }));
  card.appendChild(twoCol(
    textInput({
      label: 'Date of birth / age',
      path: 'callerAndScene.dateOfBirthOrAge',
      placeholder: '1985-06-15 or 40 yrs',
      required: true
    }),
    textInput({ label: 'Occupation', path: 'callerAndScene.occupation' })
  ));
  card.appendChild(radioGroup({
    label: 'Sex',
    path: 'callerAndScene.sex',
    options: SEX_OPTIONS,
    required: true
  }));
  card.appendChild(textInput({ label: 'Patient address', path: 'callerAndScene.patientAddress' }));

  card.appendChild(subsectionTitle('Run'));
  card.appendChild(twoCol(
    textInput({ label: 'Date', path: 'callerAndScene.date', type: 'date', required: true }),
    textInput({ label: 'Run number', path: 'callerAndScene.runNumber' })
  ));
  card.appendChild(radioGroup({
    label: 'Call type',
    path: 'callerAndScene.sceneCallType',
    options: SCENE_CALL_TYPE_OPTIONS,
    required: true
  }));

  card.appendChild(subsectionTitle('Scene'));
  card.appendChild(selectInput({
    label: 'Scene location & type',
    path: 'callerAndScene.sceneLocationType',
    options: SCENE_LOCATION_OPTIONS,
    required: true
  }));
  if (state.callerAndScene.sceneLocationType === 'other') {
    card.appendChild(textInput({
      label: 'Other scene location detail',
      path: 'callerAndScene.sceneLocationOther'
    }));
  }

  card.appendChild(subsectionTitle('Timestamps'));
  card.appendChild(twoCol(
    textInput({ label: 'Call received (24h)', path: 'callerAndScene.timeCallReceived', type: 'time', required: true }),
    textInput({ label: 'En route to scene (24h)', path: 'callerAndScene.timeEnRouteToScene', type: 'time' }),
    textInput({ label: 'Arrived at scene (24h)', path: 'callerAndScene.timeArrivedAtScene', type: 'time', required: true }),
    textInput({ label: 'Transporting (24h)', path: 'callerAndScene.timeTransporting', type: 'time' }),
    textInput({ label: 'At facility (24h)', path: 'callerAndScene.timeAtFacility', type: 'time' }),
    textInput({ label: 'In service (24h)', path: 'callerAndScene.timeInService', type: 'time' })
  ));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Chief Complaint & Vitals',
    description: 'Capture chief complaint, injury flag, initial vital signs, pregnancy status and pain score.'
  });

  card.appendChild(textArea({
    label: 'Chief complaint',
    path: 'chiefComplaintAndVitals.chiefComplaint',
    rows: 2,
    placeholder: "In the patient's own words where possible.",
    required: true
  }));

  card.appendChild(checkbox({ label: 'Injury', path: 'chiefComplaintAndVitals.injury' }));

  card.appendChild(subsectionTitle('Initial vital signs'));
  card.appendChild(textInput({
    label: 'Time (24h)',
    path: 'chiefComplaintAndVitals.initialVitals.time',
    type: 'time',
    required: true
  }));
  card.appendChild(twoCol(
    numberInput({ label: 'HR', path: 'chiefComplaintAndVitals.initialVitals.hr', unit: 'bpm', min: 0, max: 300, required: true }),
    numberInput({ label: 'RR', path: 'chiefComplaintAndVitals.initialVitals.rr', unit: '/min', min: 0, max: 80, required: true }),
    textInput({ label: 'BP', path: 'chiefComplaintAndVitals.initialVitals.bp', placeholder: '120/80', required: true }),
    numberInput({ label: 'Temp', path: 'chiefComplaintAndVitals.initialVitals.tempC', unit: '°C', step: 0.1, min: 25, max: 45 }),
    numberInput({ label: 'RBS', path: 'chiefComplaintAndVitals.initialVitals.rbs', unit: 'mmol/L', step: 0.1, min: 0, max: 50 }),
    numberInput({ label: 'SpO2', path: 'chiefComplaintAndVitals.initialVitals.spo2', unit: '%', min: 0, max: 100, required: true }),
    textInput({ label: 'SpO2 on (e.g. RA, NC 2L)', path: 'chiefComplaintAndVitals.initialVitals.spo2OnOxygen' })
  ));

  card.appendChild(textArea({
    label: 'Care in progress on arrival',
    path: 'chiefComplaintAndVitals.careInProgressOnArrival',
    rows: 2
  }));

  card.appendChild(radioGroup({
    label: 'Pregnant',
    path: 'chiefComplaintAndVitals.pregnant',
    options: PREGNANT_OPTIONS
  }));

  card.appendChild(numberInput({
    label: 'Pain scale (faces 0–10)',
    path: 'chiefComplaintAndVitals.painScore',
    unit: '0–10',
    min: 0,
    max: 10
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'High Risk Signs',
    description: 'Tick any high-risk indicators identified on rapid assessment.'
  });

  card.appendChild(subsectionTitle('A / B (Airway / Breathing)'));
  card.appendChild(twoCol(
    checkbox({ label: 'Stridor', path: 'highRiskSigns.stridor' }),
    checkbox({ label: 'Cyanosis', path: 'highRiskSigns.cyanosis' }),
    checkbox({ label: 'Respiratory distress', path: 'highRiskSigns.respiratoryDistress' })
  ));

  card.appendChild(subsectionTitle('C (Circulation)'));
  card.appendChild(twoCol(
    checkbox({ label: 'Poor perfusion', path: 'highRiskSigns.poorPerfusion' }),
    checkbox({ label: 'Weak fast pulse', path: 'highRiskSigns.weakFastPulse' }),
    checkbox({ label: 'Capillary refill > 3s', path: 'highRiskSigns.capillaryRefillOver3s' }),
    checkbox({ label: 'Heavy bleeding', path: 'highRiskSigns.heavyBleeding' }),
    checkbox({ label: 'Child: lethargy', path: 'highRiskSigns.childLethargy' }),
    checkbox({ label: 'Child: sunken eyes', path: 'highRiskSigns.childSunkenEyes' }),
    checkbox({ label: 'Child: slow skin pinch', path: 'highRiskSigns.childSlowSkinPinch' }),
    checkbox({ label: 'Child: poor drinking', path: 'highRiskSigns.childPoorDrinking' }),
    checkbox({ label: 'Adult HR < 50 or > 150', path: 'highRiskSigns.adultHrUnder50OrOver150' })
  ));

  card.appendChild(subsectionTitle('D (Disability)'));
  card.appendChild(twoCol(
    checkbox({ label: 'Unresponsive', path: 'highRiskSigns.unresponsive' }),
    checkbox({ label: 'Acute convulsions', path: 'highRiskSigns.acuteConvulsions' }),
    checkbox({ label: 'Hypoglycaemia', path: 'highRiskSigns.hypoglycaemia' }),
    checkbox({ label: 'Acute focal neurologic deficit', path: 'highRiskSigns.acuteFocalNeurologicDeficit' }),
    checkbox({
      label: 'Altered mental status with fever / hypothermia / stiff neck / headache',
      path: 'highRiskSigns.alteredMentalStatusWithFeverHypothermiaStiffNeckHeadache'
    })
  ));

  card.appendChild(subsectionTitle('Other'));
  card.appendChild(twoCol(
    checkbox({ label: 'High risk trauma', path: 'highRiskSigns.highRiskTrauma' }),
    checkbox({ label: 'Threatened limb', path: 'highRiskSigns.threatenedLimb' }),
    checkbox({ label: 'Snake bite', path: 'highRiskSigns.snakeBite' }),
    checkbox({ label: 'Poisoning, ingestion, chemical exposure', path: 'highRiskSigns.poisoningIngestionChemicalExposure' }),
    checkbox({ label: 'Violent or aggressive', path: 'highRiskSigns.violentOrAggressive' }),
    checkbox({ label: 'Temp > 39°C or < 36°C', path: 'highRiskSigns.tempOver39OrUnder36' }),
    checkbox({ label: 'Acute testicular pain or priapism', path: 'highRiskSigns.acuteTesticularPainOrPriapism' }),
    checkbox({ label: 'Pregnant with high-risk findings', path: 'highRiskSigns.pregnantWithHighRiskFindings' }),
    checkbox({
      label: 'Adult severe chest / abdominal pain or ECG ischaemia',
      path: 'highRiskSigns.adultSevereChestOrAbdominalPainOrEcgIschaemia'
    }),
    checkbox({ label: 'Infant < 8 days', path: 'highRiskSigns.infantUnder8Days' }),
    checkbox({
      label: 'Infant < 2 months with temp > 39°C or < 36°C',
      path: 'highRiskSigns.infantUnder2MonthsWithTempOver39OrUnder36'
    })
  ));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Triage',
    description: 'Assign a triage category and record the reasoning. RED triage gates additional required fields in Airway, Circulation and Disability.'
  });
  card.appendChild(radioGroup({
    label: 'Triage category',
    path: 'triage.category',
    options: TRIAGE_OPTIONS,
    required: true
  }));
  card.appendChild(textInput({ label: 'Triaged for', path: 'triage.triagedFor' }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Airway (A)',
    description: 'Primary survey: airway assessment and interventions.'
  });

  card.appendChild(checkbox({ label: 'Normal (NML)', path: 'airway.normal' }));

  card.appendChild(subsectionTitle('Findings'));
  card.appendChild(twoCol(
    checkbox({ label: 'Voice changes', path: 'airway.voiceChanges' }),
    checkbox({ label: 'Stridor', path: 'airway.stridor' }),
    checkbox({ label: 'Oral / airway burns', path: 'airway.oralAirwayBurns' }),
    checkbox({ label: 'Angioedema', path: 'airway.angioedema' })
  ));

  card.appendChild(subsectionTitle('Obstructed by'));
  card.appendChild(twoCol(
    checkbox({ label: 'Tongue', path: 'airway.obstructedByTongue' }),
    checkbox({ label: 'Blood', path: 'airway.obstructedByBlood' }),
    checkbox({ label: 'Secretions', path: 'airway.obstructedBySecretions' }),
    checkbox({ label: 'Vomit', path: 'airway.obstructedByVomit' }),
    checkbox({ label: 'Foreign body', path: 'airway.obstructedByForeignBody' })
  ));

  card.appendChild(subsectionTitle('Airway interventions'));
  if (state.triage.category === 'red' && !state.airway.normal) {
    card.appendChild(infoNote(
      'RED triage with non-normal airway: at least one airway intervention is required (rule A-02).'
    ));
  }
  card.appendChild(twoCol(
    checkbox({ label: 'Repositioning', path: 'airway.interventionRepositioning' }),
    checkbox({ label: 'Suction', path: 'airway.interventionSuction' }),
    checkbox({ label: 'OPA (oropharyngeal airway)', path: 'airway.interventionOpa' }),
    checkbox({ label: 'NPA (nasopharyngeal airway)', path: 'airway.interventionNpa' }),
    checkbox({ label: 'LMA (laryngeal mask airway)', path: 'airway.interventionLma' }),
    checkbox({ label: 'BVM (bag-valve mask)', path: 'airway.interventionBvm' }),
    checkbox({ label: 'ETT (endotracheal tube)', path: 'airway.interventionEtt' })
  ));

  card.appendChild(subsectionTitle('C-spine stabilisation'));
  card.appendChild(twoCol(
    checkbox({ label: 'Not needed', path: 'airway.cSpineNotNeeded' }),
    checkbox({ label: 'Done', path: 'airway.cSpineDone' })
  ));

  card.appendChild(textArea({ label: 'Notes', path: 'airway.notes', rows: 2 }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Breathing (B)',
    description: 'Primary survey: breathing assessment and interventions.'
  });
  card.appendChild(checkbox({ label: 'Normal (NML)', path: 'breathing.normal' }));

  card.appendChild(radioGroup({
    label: 'Spontaneous respiration',
    path: 'breathing.spontaneousRespiration',
    options: YES_NO
  }));

  card.appendChild(subsectionTitle('Chest rise'));
  card.appendChild(twoCol(
    checkbox({ label: 'Shallow', path: 'breathing.chestRiseShallow' }),
    checkbox({ label: 'Retractions', path: 'breathing.chestRiseRetractions' }),
    checkbox({ label: 'Paradoxical', path: 'breathing.chestRiseParadoxical' })
  ));

  card.appendChild(subsectionTitle('Trachea'));
  card.appendChild(twoCol(
    checkbox({ label: 'Midline', path: 'breathing.tracheaMidline' }),
    checkbox({ label: 'Deviated to L', path: 'breathing.tracheaDeviatedLeft' }),
    checkbox({ label: 'Deviated to R', path: 'breathing.tracheaDeviatedRight' })
  ));

  card.appendChild(subsectionTitle('Breath sounds'));
  card.appendChild(checkbox({ label: 'Normal (NML)', path: 'breathing.breathSoundsNormal' }));
  card.appendChild(textArea({ label: 'Breath sounds notes', path: 'breathing.breathSoundsNotes', rows: 2 }));

  card.appendChild(subsectionTitle('Interventions'));
  card.appendChild(numberInput({
    label: 'Oxygen',
    path: 'breathing.oxygenLitres',
    unit: 'L/min',
    step: 0.5,
    min: 0,
    max: 30
  }));
  card.appendChild(twoCol(
    checkbox({ label: 'Nasal cannula (NC)', path: 'breathing.oxygenNasalCannula' }),
    checkbox({ label: 'Face mask', path: 'breathing.oxygenFaceMask' }),
    checkbox({ label: 'Non-rebreather mask', path: 'breathing.oxygenNonRebreather' }),
    checkbox({ label: 'BVM', path: 'breathing.oxygenBvm' }),
    checkbox({ label: 'BiPAP / CPAP', path: 'breathing.oxygenBipapCpap' })
  ));
  card.appendChild(textInput({ label: 'Other intervention', path: 'breathing.oxygenOther' }));

  card.appendChild(textArea({ label: 'Notes', path: 'breathing.notes', rows: 2 }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Circulation (C)',
    description: 'Primary survey: circulation assessment and interventions.'
  });
  card.appendChild(checkbox({ label: 'Normal (NML)', path: 'circulation.normal' }));

  card.appendChild(subsectionTitle('Skin'));
  card.appendChild(twoCol(
    checkbox({ label: 'Warm', path: 'circulation.skinWarm' }),
    checkbox({ label: 'Dry', path: 'circulation.skinDry' }),
    checkbox({ label: 'Pale', path: 'circulation.skinPale' }),
    checkbox({ label: 'Cyanotic', path: 'circulation.skinCyanotic' }),
    checkbox({ label: 'Moist', path: 'circulation.skinMoist' }),
    checkbox({ label: 'Cool', path: 'circulation.skinCool' })
  ));

  card.appendChild(subsectionTitle('Capillary refill'));
  card.appendChild(twoCol(
    checkbox({ label: '< 3 sec', path: 'circulation.capillaryRefillUnder3' }),
    checkbox({ label: '≥ 3 sec', path: 'circulation.capillaryRefill3OrMore' })
  ));

  card.appendChild(subsectionTitle('Pulses'));
  card.appendChild(twoCol(
    checkbox({ label: 'Weak', path: 'circulation.pulsesWeak' }),
    checkbox({ label: 'Asymmetric', path: 'circulation.pulsesAsymmetric' })
  ));

  card.appendChild(radioGroup({ label: 'JVD', path: 'circulation.jvd', options: YES_NO }));

  card.appendChild(subsectionTitle('Bleeding'));
  card.appendChild(textInput({
    label: 'Active bleeding site',
    path: 'circulation.activeBleedingSite'
  }));
  if (hasText(state.circulation.activeBleedingSite)) {
    card.appendChild(infoNote(
      'Active bleeding site recorded: at least one bleeding control method is required (rule C-02).'
    ));
  }
  card.appendChild(twoCol(
    checkbox({ label: 'Bandage', path: 'circulation.bleedingControlledBandage' }),
    checkbox({ label: 'Tourniquet', path: 'circulation.bleedingControlledTourniquet' }),
    checkbox({ label: 'Direct pressure', path: 'circulation.bleedingControlledDirectPressure' })
  ));
  card.appendChild(textInput({
    label: 'Bleeding control time (24h)',
    path: 'circulation.bleedingControlTime',
    type: 'time'
  }));

  card.appendChild(subsectionTitle('Vascular access'));
  if (state.triage.category === 'red') {
    card.appendChild(infoNote(
      'RED triage: IV / IO access OR IV fluids are required (rule C-03).'
    ));
  }
  card.appendChild(twoCol(
    textInput({ label: 'IV site', path: 'circulation.accessIvSite' }),
    textInput({ label: 'IV size', path: 'circulation.accessIvSize' }),
    textInput({ label: 'IO site', path: 'circulation.accessIoSite' }),
    textInput({ label: 'IO size', path: 'circulation.accessIoSize' })
  ));

  card.appendChild(subsectionTitle('IV fluids'));
  card.appendChild(numberInput({
    label: 'Volume',
    path: 'circulation.ivfMls',
    unit: 'ml',
    min: 0,
    max: 5000,
    step: 10
  }));
  card.appendChild(twoCol(
    checkbox({ label: 'NS (Normal saline)', path: 'circulation.ivfNs' }),
    checkbox({ label: "LR (Lactated Ringer's)", path: 'circulation.ivfLr' })
  ));
  card.appendChild(textInput({ label: 'Other fluid', path: 'circulation.ivfOther' }));

  card.appendChild(subsectionTitle('Stabilisation'));
  card.appendChild(twoCol(
    checkbox({ label: 'Pelvis stabilised', path: 'circulation.pelvisStabilized' }),
    checkbox({ label: 'Femur fracture stabilised', path: 'circulation.femurFractureStabilized' })
  ));

  card.appendChild(textArea({ label: 'Notes', path: 'circulation.notes', rows: 2 }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Disability (D)',
    description: 'Primary survey: neurological assessment, GCS, pupils and interventions.'
  });
  card.appendChild(checkbox({ label: 'Normal (NML)', path: 'disability.normal' }));

  card.appendChild(numberInput({
    label: 'Blood glucose (as needed)',
    path: 'disability.bloodGlucose',
    unit: 'mmol/L',
    step: 0.1,
    min: 0,
    max: 50
  }));

  card.appendChild(radioGroup({
    label: 'Responsiveness (AVPU)',
    path: 'disability.avpu',
    options: AVPU_OPTIONS,
    required: true
  }));

  card.appendChild(subsectionTitle('GCS'));
  if (state.triage.category === 'red') {
    card.appendChild(infoNote(
      'RED triage: GCS Eye, Verbal and Motor are all required (rule D-02).'
    ));
  }
  card.appendChild(threeCol(
    numberInput({ label: 'Eye (E)', path: 'disability.gcsEye', unit: '1–4', min: 1, max: 4 }),
    numberInput({ label: 'Verbal (V)', path: 'disability.gcsVerbal', unit: '1–5', min: 1, max: 5 }),
    numberInput({ label: 'Motor (M)', path: 'disability.gcsMotor', unit: '1–6', min: 1, max: 6 })
  ));
  const gcs = gcsTotal(state);
  const gcsLine = document.createElement('p');
  gcsLine.className = 'computed-line';
  gcsLine.innerHTML = `GCS total: <strong>${gcs == null ? '—' : gcs}</strong>`;
  card.appendChild(gcsLine);

  card.appendChild(subsectionTitle('Moves extremities'));
  card.appendChild(twoCol(
    checkbox({ label: 'L arm', path: 'disability.movesLeftArm' }),
    checkbox({ label: 'R arm', path: 'disability.movesRightArm' }),
    checkbox({ label: 'L leg', path: 'disability.movesLeftLeg' }),
    checkbox({ label: 'R leg', path: 'disability.movesRightLeg' })
  ));

  card.appendChild(subsectionTitle('Pupils'));
  card.appendChild(twoCol(
    numberInput({ label: 'Size L', path: 'disability.pupilSizeLeft', unit: 'mm', step: 0.5, min: 0, max: 10 }),
    numberInput({ label: 'Size R', path: 'disability.pupilSizeRight', unit: 'mm', step: 0.5, min: 0, max: 10 }),
    textInput({ label: 'Reactivity L', path: 'disability.pupilReactivityLeft', placeholder: 'brisk / sluggish / fixed' }),
    textInput({ label: 'Reactivity R', path: 'disability.pupilReactivityRight', placeholder: 'brisk / sluggish / fixed' })
  ));

  card.appendChild(subsectionTitle('Interventions'));
  card.appendChild(twoCol(
    checkbox({ label: 'Glucose checked', path: 'disability.interventionGlucoseChecked' }),
    checkbox({ label: 'Glucose given', path: 'disability.interventionGlucoseGiven' }),
    checkbox({ label: 'Naloxone given', path: 'disability.interventionNaloxoneGiven' })
  ));

  card.appendChild(textArea({ label: 'Notes', path: 'disability.notes', rows: 2 }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Exposure (E)',
    description: 'Primary survey: exposure assessment. Additional exam findings are captured under Physical Exam.'
  });
  card.appendChild(checkbox({ label: 'Normal (NML)', path: 'exposure.normal' }));
  card.appendChild(checkbox({ label: 'Exposed completely', path: 'exposure.exposedCompletely' }));
  card.appendChild(textArea({ label: 'Notes', path: 'exposure.notes', rows: 3 }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'SAMPLE History',
    description: 'Signs / symptoms, Allergies, Medications, Past medical & surgical history, Last ate, Events (and ROS). For each item enter a value or tick "Unknown".'
  });

  card.appendChild(textArea({
    label: 'S — Signs / symptoms',
    path: 'sampleHistory.signsSymptoms',
    rows: 2
  }));
  card.appendChild(checkbox({ label: 'Signs / symptoms: Unknown', path: 'sampleHistory.signsSymptomsUnknown' }));

  card.appendChild(textArea({
    label: 'A — Allergies',
    path: 'sampleHistory.allergies',
    rows: 2
  }));
  card.appendChild(checkbox({ label: 'Allergies: Unknown', path: 'sampleHistory.allergiesUnknown' }));

  card.appendChild(textArea({
    label: 'M — Medications',
    path: 'sampleHistory.medications',
    rows: 2
  }));
  card.appendChild(checkbox({ label: 'Medications: Unknown', path: 'sampleHistory.medicationsUnknown' }));

  card.appendChild(textArea({
    label: 'P — Past medical',
    path: 'sampleHistory.pastMedical',
    rows: 2
  }));
  card.appendChild(checkbox({ label: 'Past medical: Unknown', path: 'sampleHistory.pastMedicalUnknown' }));

  card.appendChild(textArea({
    label: 'P — Past surgeries',
    path: 'sampleHistory.pastSurgeries',
    rows: 2
  }));
  card.appendChild(checkbox({ label: 'Past surgeries: Unknown', path: 'sampleHistory.pastSurgeriesUnknown' }));

  card.appendChild(numberInput({
    label: 'L — Last ate',
    path: 'sampleHistory.lastAteHours',
    unit: 'hrs',
    min: 0,
    max: 72
  }));
  card.appendChild(checkbox({ label: 'Last ate: Unknown', path: 'sampleHistory.lastAteUnknown' }));

  card.appendChild(textArea({
    label: 'E — Events (and ROS)',
    path: 'sampleHistory.events',
    rows: 3
  }));
  card.appendChild(checkbox({ label: 'Events: Unknown', path: 'sampleHistory.eventsUnknown' }));

  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Injury Details',
    description: 'Complete this section when "Injury" is checked. Capture intent, mechanism, road traffic details, and safety equipment.'
  });

  if (!state.chiefComplaintAndVitals.injury) {
    card.appendChild(infoNote(
      '"Injury" is not checked on Step 2. This section is optional unless this encounter involves an injury.',
      true
    ));
  }

  card.appendChild(radioGroup({
    label: 'Intent',
    path: 'injuryDetails.intent',
    options: INJURY_INTENT_OPTIONS,
    required: state.chiefComplaintAndVitals.injury
  }));

  card.appendChild(subsectionTitle('Mechanism'));
  card.appendChild(twoCol(
    checkbox({ label: 'Fall', path: 'injuryDetails.mechanismFall' }),
    checkbox({ label: 'Hit by falling object', path: 'injuryDetails.mechanismHitByFallingObject' }),
    checkbox({ label: 'Stab / cut', path: 'injuryDetails.mechanismStabCut' }),
    checkbox({ label: 'Gunshot', path: 'injuryDetails.mechanismGunshot' }),
    checkbox({ label: 'Sexual assault', path: 'injuryDetails.mechanismSexualAssault' }),
    checkbox({ label: 'Other blunt force trauma', path: 'injuryDetails.mechanismOtherBluntForce' }),
    checkbox({ label: 'Suffocation, choking, hanging', path: 'injuryDetails.mechanismSuffocationChokingHanging' }),
    checkbox({ label: 'Drowning', path: 'injuryDetails.mechanismDrowning' }),
    checkbox({ label: 'Poisoning / toxic exposure', path: 'injuryDetails.mechanismPoisoningToxicExposure' }),
    checkbox({ label: 'Unknown', path: 'injuryDetails.mechanismUnknown' })
  ));
  if (state.injuryDetails.mechanismDrowning) {
    card.appendChild(radioGroup({
      label: 'Drowning: life vest worn?',
      path: 'injuryDetails.mechanismDrowningLifeVest',
      options: YES_NO
    }));
  }
  card.appendChild(textInput({ label: 'Burn caused by', path: 'injuryDetails.mechanismBurnCausedBy' }));
  card.appendChild(textInput({ label: 'Other mechanism', path: 'injuryDetails.mechanismOther' }));

  card.appendChild(subsectionTitle('Road traffic incident'));
  card.appendChild(twoCol(
    checkbox({ label: 'Driver', path: 'injuryDetails.roadTrafficDriver' }),
    checkbox({ label: 'Passenger', path: 'injuryDetails.roadTrafficPassenger' }),
    checkbox({ label: 'Pedestrian', path: 'injuryDetails.roadTrafficPedestrian' }),
    checkbox({ label: 'Ejected', path: 'injuryDetails.roadTrafficEjected' }),
    checkbox({ label: 'Extricated', path: 'injuryDetails.roadTrafficExtricated' })
  ));

  card.appendChild(selectInput({
    label: 'Vehicle',
    path: 'injuryDetails.vehicleType',
    options: VEHICLE_OPTIONS
  }));
  if (state.injuryDetails.vehicleType === 'other') {
    card.appendChild(textInput({ label: 'Other vehicle', path: 'injuryDetails.vehicleOther' }));
  }

  card.appendChild(subsectionTitle('Safety equipment'));
  card.appendChild(twoCol(
    checkbox({ label: 'Airbag', path: 'injuryDetails.safetyAirbag' }),
    checkbox({ label: 'Seatbelt', path: 'injuryDetails.safetySeatbelt' }),
    checkbox({ label: 'Helmet', path: 'injuryDetails.safetyHelmet' })
  ));
  card.appendChild(textInput({ label: 'Other restraint', path: 'injuryDetails.safetyOtherRestraint' }));

  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Physical Exam',
    description: 'Tick Normal or note findings for each body system.'
  });
  for (const sys of PE_SYSTEMS) {
    const block = document.createElement('div');
    block.className = 'inset-block';
    const h = document.createElement('h4');
    h.textContent = sys.label;
    block.appendChild(h);
    block.appendChild(checkbox({
      label: 'Normal (NML)',
      path: `physicalExam.${sys.key}.normal`
    }));
    block.appendChild(textArea({
      label: 'Notes',
      path: `physicalExam.${sys.key}.notes`,
      rows: 2
    }));
    card.appendChild(block);
  }
  return card;
}

function renderStep13() {
  const card = sectionCard({
    stepNumber: 13,
    title: 'Additional Interventions',
    description: 'Medications given and procedures performed during prehospital care.'
  });

  card.appendChild(subsectionTitle('Medications given'));
  card.appendChild(twoCol(
    checkbox({ label: 'Bronchodilators', path: 'additionalInterventions.medsBronchodilators' }),
    checkbox({ label: 'Epinephrine', path: 'additionalInterventions.medsEpinephrine' }),
    checkbox({ label: 'Aspirin', path: 'additionalInterventions.medsAspirin' }),
    checkbox({ label: 'Seizure medication', path: 'additionalInterventions.medsSeizureMedication' }),
    checkbox({ label: 'Analgesia', path: 'additionalInterventions.medsAnalgesia' }),
    checkbox({ label: 'IV fluid infusion', path: 'additionalInterventions.medsIvFluidInfusion' })
  ));
  card.appendChild(textInput({ label: 'Other medications', path: 'additionalInterventions.medsOther' }));

  card.appendChild(subsectionTitle('Procedures'));
  card.appendChild(twoCol(
    checkbox({ label: 'Wound bandaging', path: 'additionalInterventions.procWoundBandaging' }),
    checkbox({ label: 'Burn dressing', path: 'additionalInterventions.procBurnDressing' }),
    checkbox({ label: 'Splinting / reduction', path: 'additionalInterventions.procSplintingReduction' }),
    checkbox({ label: 'Pelvic stabilisation', path: 'additionalInterventions.procPelvicStabilization' }),
    checkbox({ label: 'ECG', path: 'additionalInterventions.procEcg' })
  ));
  card.appendChild(textInput({ label: 'Other procedures', path: 'additionalInterventions.procOther' }));

  return card;
}

function renderStep14() {
  const card = sectionCard({
    stepNumber: 14,
    title: 'Assessment & Plan',
    description: 'Brief summary, differential, and presumptive diagnoses.'
  });
  card.appendChild(textArea({
    label: 'Summary (and plan)',
    path: 'assessmentAndPlan.summary',
    rows: 4,
    required: true
  }));
  card.appendChild(textArea({
    label: 'Differential',
    path: 'assessmentAndPlan.differential',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Presumptive diagnoses',
    path: 'assessmentAndPlan.presumptiveDiagnoses',
    rows: 3,
    required: true
  }));
  return card;
}

function renderStep15() {
  const card = sectionCard({
    stepNumber: 15,
    title: 'Reassessment',
    description: 'Up to 3 reassessment vital sign sets recorded during transport. Use "Add reassessment" to record a new set; "Remove" deletes one.'
  });

  const list = state.reassessments;
  if (list.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.style.marginBottom = '0.875rem';
    empty.textContent = 'No reassessments recorded yet.';
    card.appendChild(empty);
  }

  list.forEach((_r, idx) => {
    const block = document.createElement('div');
    block.className = 'inset-block';

    const header = document.createElement('div');
    header.className = 'inset-block-header';
    const h = document.createElement('h4');
    h.textContent = `Reassessment #${idx + 1}`;
    header.appendChild(h);
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'button';
    removeBtn.setAttribute('data-variant', 'secondary');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      state.reassessments.splice(idx, 1);
      saveState();
      renderForm();
      updateProgress();
    });
    header.appendChild(removeBtn);
    block.appendChild(header);

    block.appendChild(textInput({
      label: 'Time (24h)',
      path: `reassessments.${idx}.time`,
      type: 'time'
    }));
    block.appendChild(twoCol(
      numberInput({ label: 'HR', path: `reassessments.${idx}.hr`, unit: 'bpm', min: 0, max: 300 }),
      numberInput({ label: 'RR', path: `reassessments.${idx}.rr`, unit: '/min', min: 0, max: 80 }),
      numberInput({ label: 'Temp', path: `reassessments.${idx}.tempC`, unit: '°C', step: 0.1, min: 25, max: 45 }),
      numberInput({ label: 'SpO2', path: `reassessments.${idx}.spo2`, unit: '%', min: 0, max: 100 }),
      textInput({ label: 'SpO2 on (e.g. RA, NC 2L)', path: `reassessments.${idx}.spo2OnOxygen` }),
      numberInput({ label: 'RBS', path: `reassessments.${idx}.rbs`, unit: 'mmol/L', step: 0.1, min: 0, max: 50 }),
      numberInput({ label: 'Pain', path: `reassessments.${idx}.pain`, unit: '0–10', min: 0, max: 10 })
    ));
    block.appendChild(checkbox({
      label: 'Unchanged',
      path: `reassessments.${idx}.unchanged`
    }));
    card.appendChild(block);
  });

  const canAdd = list.length < 3;
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'button';
  addBtn.setAttribute('data-variant', 'secondary');
  addBtn.textContent = canAdd
    ? '+ Add reassessment'
    : '+ Add reassessment (max 3 reached)';
  if (!canAdd) addBtn.disabled = true;
  addBtn.addEventListener('click', () => {
    if (state.reassessments.length >= 3) return;
    state.reassessments.push(emptyReassessment());
    saveState();
    renderForm();
    updateProgress();
  });
  card.appendChild(addBtn);

  return card;
}

function renderStep16() {
  const card = sectionCard({
    stepNumber: 16,
    title: 'Disposition',
    description: 'Handover details, final vital signs, and provider sign-off.'
  });

  card.appendChild(textArea({
    label: 'Disposition',
    path: 'disposition.disposition',
    rows: 2,
    placeholder: 'e.g. Handed over to ED triage, transferred to OT, refused transport, etc.',
    required: true
  }));

  card.appendChild(subsectionTitle('Handover'));
  card.appendChild(textInput({
    label: 'Handover time (24h)',
    path: 'disposition.handoverTime',
    type: 'time',
    required: true
  }));
  card.appendChild(twoCol(
    textInput({ label: 'Handover to (name)', path: 'disposition.handoverToName', required: true }),
    textInput({ label: 'Handover to (cadre)', path: 'disposition.handoverToCadre' })
  ));
  card.appendChild(textInput({
    label: 'Handover to (signature)',
    path: 'disposition.handoverToSignature'
  }));

  card.appendChild(subsectionTitle('Vitals at handover'));
  card.appendChild(textInput({
    label: 'Time (24h)',
    path: 'disposition.finalVitals.time',
    type: 'time'
  }));
  card.appendChild(twoCol(
    numberInput({ label: 'HR', path: 'disposition.finalVitals.hr', unit: 'bpm', min: 0, max: 300 }),
    numberInput({ label: 'RR', path: 'disposition.finalVitals.rr', unit: '/min', min: 0, max: 80 }),
    numberInput({ label: 'Temp', path: 'disposition.finalVitals.tempC', unit: '°C', step: 0.1, min: 25, max: 45 }),
    textInput({ label: 'BP', path: 'disposition.finalVitals.bp', placeholder: '120/80' }),
    numberInput({ label: 'SpO2', path: 'disposition.finalVitals.spo2', unit: '%', min: 0, max: 100 }),
    textInput({ label: 'SpO2 on (e.g. RA, NC 2L)', path: 'disposition.finalVitals.spo2OnOxygen' })
  ));

  card.appendChild(radioGroup({
    label: 'Plan discussed with patient?',
    path: 'disposition.planDiscussedWithPatient',
    options: YES_NO
  }));

  card.appendChild(subsectionTitle('Provider sign-off'));
  card.appendChild(textInput({
    label: 'Provider(s) name',
    path: 'disposition.providerName',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Provider(s) signature',
    path: 'disposition.providerSignature',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Signature date',
    path: 'disposition.providerSignatureDate',
    type: 'date',
    required: true
  }));

  return card;
}

// ----------------------------------------------------------------------
// Step renderers and definitions
// ----------------------------------------------------------------------

const RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7, renderStep8,
  renderStep9, renderStep10, renderStep11, renderStep12,
  renderStep13, renderStep14, renderStep15, renderStep16
];

const STEP_DEFINITIONS = [
  { step: 1,  section: 'callerAndScene',          title: 'Caller & Scene' },
  { step: 2,  section: 'chiefComplaintAndVitals', title: 'Chief Complaint & Vitals' },
  { step: 3,  section: 'highRiskSigns',           title: 'High Risk Signs' },
  { step: 4,  section: 'triage',                  title: 'Triage' },
  { step: 5,  section: 'airway',                  title: 'Airway (A)' },
  { step: 6,  section: 'breathing',               title: 'Breathing (B)' },
  { step: 7,  section: 'circulation',             title: 'Circulation (C)' },
  { step: 8,  section: 'disability',              title: 'Disability (D)' },
  { step: 9,  section: 'exposure',                title: 'Exposure (E)' },
  { step: 10, section: 'sampleHistory',           title: 'SAMPLE History' },
  { step: 11, section: 'injuryDetails',           title: 'Injury Details' },
  { step: 12, section: 'physicalExam',            title: 'Physical Exam' },
  { step: 13, section: 'additionalInterventions', title: 'Additional Interventions' },
  { step: 14, section: 'assessmentAndPlan',       title: 'Assessment & Plan' },
  { step: 15, section: 'reassessments',           title: 'Reassessment' },
  { step: 16, section: 'disposition',             title: 'Disposition' }
];

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

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
      if (t > 0 && firstUnfinished === -1) firstUnfinished = def.step;
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
// Progress (uses validator's per-section satisfied / required counts)
// ----------------------------------------------------------------------

function updateProgress() {
  const result = validatePrehospital(state);
  const total = result.totalRequired;
  const answered = result.totalSatisfied;
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);

  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) {
    text.textContent = `${answered} of ${total} required fields answered (${percent}%)`;
  }

  const sectionAnswered = {};
  const sectionTotal = {};
  for (const s of result.sections) {
    sectionAnswered[s.section] = s.satisfied;
    sectionTotal[s.section] = s.required;
  }
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Validation (per-field errors + error summary)
// ----------------------------------------------------------------------

function clearFieldError(id) {
  const el = document.getElementById(`${id}-error`);
  if (el) el.textContent = '';
  const input = document.getElementById(id);
  if (input) input.removeAttribute('aria-invalid');
  const fieldset = document.getElementById(`${id}-fieldset`);
  if (fieldset) fieldset.removeAttribute('aria-invalid');
}

function setFieldError(id, message) {
  const el = document.getElementById(`${id}-error`);
  if (el) el.textContent = message;
  const input = document.getElementById(id);
  if (input) input.setAttribute('aria-invalid', 'true');
  const fieldset = document.getElementById(`${id}-fieldset`);
  if (fieldset) fieldset.setAttribute('aria-invalid', 'true');
}

function validateForm() {
  const errors = [];
  const form = document.getElementById('assessment-form');
  if (!form) return errors;

  // Native required inputs / textareas / selects
  const requiredFields = form.querySelectorAll(
    'input[data-required]:not([type="radio"]), textarea[data-required], select[data-required]'
  );
  requiredFields.forEach((el) => {
    const id = el.id;
    const value = (el.value || '').trim();
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

  // Required radio groups: any radio with data-required attribute
  const radioGroupNames = new Set();
  form.querySelectorAll('input[type="radio"][data-required]').forEach((r) => {
    radioGroupNames.add(r.name);
  });
  for (const name of radioGroupNames) {
    const checked = form.querySelector(`input[type="radio"][name="${name}"]:checked`);
    if (!checked) {
      const fieldset = document.getElementById(`${name}-fieldset`);
      const legend = fieldset ? fieldset.querySelector('legend.label') : null;
      const label = legend
        ? legend.textContent.replace(/\s*\*\s*$/, '').trim()
        : name;
      errors.push({ id: name, message: `${label} is required` });
      setFieldError(name, `${label} is required`);
    } else {
      clearFieldError(name);
    }
  }

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
      ${errors.map((e) =>
        `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`).join('')}
    </ul>
  `;
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  const { validation, flags, timestamp } = lastResult;
  const out = document.getElementById('report');
  if (!out) return;

  const completenessBadge = validation.complete
    ? '<span class="completeness-badge complete">Complete</span>'
    : '<span class="completeness-badge incomplete">Incomplete</span>';

  const sectionRows = validation.sections.map((s) => {
    const missingItems = s.missing.length === 0
      ? '<span class="muted">All required fields completed.</span>'
      : `<ul class="missing-list">${s.missing.map(
          (m) => `<li>${esc(m.id)} — ${esc(m.description)}</li>`
        ).join('')}</ul>`;
    return `
      <tr>
        <th scope="row">${esc(sectionLabel(s.section))}</th>
        <td>${s.satisfied} / ${s.required}</td>
        <td>${missingItems}</td>
      </tr>
    `;
  }).join('');

  const flagsList = flags.length === 0
    ? '<p class="muted">No flagged issues raised.</p>'
    : `
      <ul class="flags">
        ${flags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority).toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.message)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  out.innerHTML = `
    <header class="report-header">
      <h2>WHO Prehospital Form (SCF Prehospital) — submission report</h2>
      <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
    </header>

    <div class="completeness">
      ${completenessBadge}
      <span>${validation.totalSatisfied} of ${validation.totalRequired} required fields answered.</span>
    </div>

    <h3>Section completeness</h3>
    <table class="sections-table">
      <thead>
        <tr>
          <th scope="col">Section</th>
          <th scope="col">Answered</th>
          <th scope="col">Missing items</th>
        </tr>
      </thead>
      <tbody>
        ${sectionRows}
      </tbody>
    </table>

    <h3>Flagged issues</h3>
    ${flagsList}

    <div class="report-actions">
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const startOverBtn = document.getElementById('start-over-btn');
  if (startOverBtn) startOverBtn.addEventListener('click', startOver);
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const validation = validatePrehospital(state);
  const flags = detectFlaggedIssues(state);
  lastResult = {
    validation,
    flags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh WHO prehospital form?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const out = document.getElementById('report');
  if (out) out.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Bootstrap
// ----------------------------------------------------------------------

function renderForm() {
  const host = document.getElementById('form-sections');
  if (!host) return;
  // Preserve scroll position across re-renders triggered by setPath().
  const scrollY = window.scrollY;
  host.innerHTML = '';
  for (const r of RENDERERS) host.appendChild(r());
  window.scrollTo({ top: scrollY });
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();

  const submit = document.getElementById('submit-btn');
  const reset = document.getElementById('reset-btn');
  if (submit) submit.addEventListener('click', submitForm);
  if (reset) reset.addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
