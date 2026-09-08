import { validateEuGeneral } from './eu-general-validator.js';
import { detectFlaggedIssues } from './flagged-issues.js';
import { emptyAssessment, hasNumber, hasText, isYesNoAnswered, priorityLabel, sectionLabel } from './types.js';

// Single-page continuous wizard: all 16 sections rendered into the page in
// document order as Lily-shaped <fieldset class="fieldset"> blocks.
// Conditional sub-blocks (ambulance level, deficit description, admit ward,
// transfer destination, cause of death) only appear when the answers above
// them require them.
//
// On submit the pure validator + flagged-issues engine runs and a
// report is rendered into the Lily .panel region. State is persisted to
// localStorage so a partial fill survives a page reload.
//
// Lily HTML headless contract: every input uses lilyInputClass(type),
// every field has .error-message + aria-describedby, every radio group
// is a fieldset.field with legend.label + div.radio-group[role=radiogroup]
// + input.radio-input, every section is fieldset.fieldset with
// legend.fieldset-legend containing section-step + h2.section-title +
// optional section-description.

const TOTAL_STEPS = 16;

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'who-emergency-unit-general-form.front-end-form-with-html.v1';

/** Deep-merge persisted state over a fresh empty assessment. */
function mergeDeep(target, source) {
  if (!source || typeof source !== 'object') return target;
  for (const key of Object.keys(target)) {
    const t = target[key];
    const s = source[key];
    if (
      t !== null &&
      typeof t === 'object' &&
      !Array.isArray(t) &&
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

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyAssessment();

  mergeDeep(fresh, parsed);
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyAssessment();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved WHO emergency unit (general) form; starting fresh.', e);
    return emptyAssessment();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save WHO emergency unit (general) form to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored WHO emergency unit (general) form.', e);
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
  slug: 'who-emergency-unit-general-form',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const out = document.getElementById('report');
    if (out) out.innerHTML =
      '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/** Resolve a dotted path on state. */
function getPath(path) {
  const parts = path.split('.');
  let cur = state;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

/** Set a dotted path on state and persist. The caller decides whether
 * to re-render (used for branch-toggling answers like disposition). */
function writePath(path, value) {
  const parts = path.split('.');
  let cur = state;
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
  saveState();
}

/** Set + re-render the whole form (used for branch-toggling answers). */
function setPathAndRerender(path, value) {
  writePath(path, value);
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

/** Convert a dotted path to a DOM-safe id token. */
function pathToId(path) {
  return 'f-' + path.replace(/\./g, '-');
}

// ----------------------------------------------------------------------
// Lily input class lookup (per AGENTS-front-end-html.md class vocabulary)
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
// Field component builders (Lily contract: .field + .label + input +
// .error-message; radioGroup uses fieldset.field + legend.label +
// div.radio-group[role=radiogroup] + input.radio-input).
// ----------------------------------------------------------------------

function textInput(opts) {
  const id = pathToId(opts.path);
  const errId = `${id}-error`;
  const value = getPath(opts.path) ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const cls = lilyInputClass(type);

  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${cls}"`,
    `value="${esc(value)}"`,
    `aria-describedby="${errId}"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);

  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${errId}"></span>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    writePath(opts.path, input.value);
    clearFieldError(id);
    updateProgress();
  });
  return wrapper;
}

function numberInput(opts) {
  const id = pathToId(opts.path);
  const errId = `${id}-error`;
  const raw = getPath(opts.path);
  const value = hasNumber(raw) ? String(raw) : '';
  const labelText =
    esc(opts.label) +
    (opts.unit ? ` <span class="unit">${esc(opts.unit)}</span>` : '') +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="number"`,
    `class="number-input"`,
    `value="${esc(value)}"`,
    `aria-describedby="${errId}"`,
    'inputmode="decimal"'
  ];
  if (opts.required) attrs.push('required', 'data-required');
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);

  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${errId}"></span>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    const txt = input.value.trim();
    let v;
    if (txt === '') {
      v = null;
    } else {
      const n = Number(txt);
      v = Number.isFinite(n) ? n : null;
    }
    writePath(opts.path, v);
    clearFieldError(id);
    updateProgress();
  });
  return wrapper;
}

function textArea(opts) {
  const id = pathToId(opts.path);
  const errId = `${id}-error`;
  const value = getPath(opts.path) ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const placeholderAttr = opts.placeholder
    ? ` placeholder="${esc(opts.placeholder)}"` : '';
  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      class="text-area-input"
      aria-describedby="${errId}"${placeholderAttr}${requiredAttr}>${esc(value)}</textarea>
    <span class="error-message" id="${errId}"></span>
  `;
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => {
    writePath(opts.path, ta.value);
    clearFieldError(id);
    updateProgress();
  });
  return wrapper;
}

function radioGroup(opts) {
  const groupId = pathToId(opts.path);
  const errId = `${groupId}-error`;
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
    lab.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}>
      <span>${esc(option.label)}</span>
    `;
    const input = lab.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        if (opts.rerender) {
          setPathAndRerender(opts.path, option.value);
        } else {
          writePath(opts.path, option.value);
          clearFieldError(groupId);
          updateProgress();
        }
      }
    });
    list.appendChild(lab);
  }
  wrapper.appendChild(list);

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = errId;
  wrapper.appendChild(errSpan);
  return wrapper;
}

function selectInput(opts) {
  const id = pathToId(opts.path);
  const errId = `${id}-error`;
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
    <select id="${id}" name="${id}" class="select"
      aria-describedby="${errId}"${requiredAttr}>${optionHtml}</select>
    <span class="error-message" id="${errId}"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => {
    if (opts.rerender) {
      setPathAndRerender(opts.path, sel.value);
    } else {
      writePath(opts.path, sel.value);
      clearFieldError(id);
      updateProgress();
    }
  });
  return wrapper;
}

/** Standalone single-checkbox row (used for "Normal" flags, high-risk
 * signs and one-off symptom flags). Lily contract: .checkbox-input on
 * the <input>; wrapper uses local .checkbox-field helper. */
function checkbox(opts) {
  const id = pathToId(opts.path);
  const checked = !!getPath(opts.path);
  const wrapper = document.createElement('label');
  wrapper.className = 'checkbox-field';
  wrapper.htmlFor = id;
  wrapper.innerHTML = `
    <input type="checkbox" class="checkbox-input" id="${id}" name="${id}"${checked ? ' checked' : ''}>
    <span>${esc(opts.label)}</span>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('change', () => {
    if (opts.rerender) {
      setPathAndRerender(opts.path, input.checked);
    } else {
      writePath(opts.path, input.checked);
      updateProgress();
    }
  });
  return wrapper;
}

/** Lily-shaped section card: <fieldset class="fieldset"> with a
 * <legend class="fieldset-legend"> banner containing the section
 * step badge, title, and optional description. */
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

function fourCol(...children) {
  const grid = document.createElement('div');
  grid.className = 'four-col';
  for (const c of children) grid.appendChild(c);
  return grid;
}

function subsectionTitle(text) {
  const h = document.createElement('h3');
  h.className = 'subsection-title';
  h.textContent = text;
  return h;
}

function smallHeader(text) {
  const h = document.createElement('h4');
  h.style.margin = '0.75rem 0 0.5rem';
  h.style.fontSize = '0.9375rem';
  h.style.fontWeight = '600';
  h.textContent = text;
  return h;
}

// Shared option lists ------------------------------------------------------

const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const AGE_CATEGORY_OPTIONS = [
  { value: 'infant', label: 'Infant' },
  { value: 'child', label: 'Child' },
  { value: 'adult', label: 'Adult' }
];

const ARRIVAL_MODE_OPTIONS = [
  { value: 'ambulance', label: 'Ambulance' },
  { value: 'car-private', label: 'Car/Truck (Private)' },
  { value: 'car-taxi', label: 'Car/Truck (Taxi)' },
  { value: 'motor-2-3-private', label: 'Motorized 2/3-wheeler (Private)' },
  { value: 'motor-2-3-taxi', label: 'Motorized 2/3-wheeler (Taxi)' },
  { value: 'public-transport', label: 'Public Transport' },
  { value: 'walk', label: 'Walk' },
  { value: 'other', label: 'Other' }
];

const AMBULANCE_LEVEL_OPTIONS = [
  { value: 'basic', label: 'Basic' },
  { value: 'advanced', label: 'Advanced' }
];

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const TRIAGE_OPTIONS = [
  { value: 'red', label: 'Red (Immediate)' },
  { value: 'orange', label: 'Orange (Very urgent)' },
  { value: 'yellow', label: 'Yellow (Urgent)' },
  { value: 'green', label: 'Green (Non-urgent)' }
];

const AVPU_OPTIONS = [
  { value: 'A', label: 'A — Alert' },
  { value: 'V', label: 'V — Voice' },
  { value: 'P', label: 'P — Pain' },
  { value: 'U', label: 'U — Unresponsive' }
];

const VAX_OPTIONS = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' }
];

const DISPOSITION_OPTIONS = [
  { value: 'admit', label: 'Admit' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'discharge', label: 'Discharge' },
  { value: 'died', label: 'Died' }
];

const ADMIT_WARD_OPTIONS = [
  { value: 'ward', label: 'Ward' },
  { value: 'icu', label: 'ICU' },
  { value: 'ot', label: 'OT (operating theatre)' }
];

const LAB_RESULTS = [
  { value: 'pos', label: 'Pos' },
  { value: 'neg', label: 'Neg' },
  { value: 'pending', label: 'Pending' }
];

const ROS_SYSTEMS = [
  { key: 'general', label: 'General' },
  { key: 'heent', label: 'HEENT' },
  { key: 'respiratory', label: 'Respiratory' },
  { key: 'cardiovascular', label: 'Cardiovascular' },
  { key: 'gastrointestinal', label: 'Gastrointestinal' },
  { key: 'pelvisGuRectal', label: 'Pelvis / GU / Rectal' },
  { key: 'femaleReproductive', label: 'Female Reproductive' },
  { key: 'maleReproductive', label: 'Male Reproductive' },
  { key: 'skin', label: 'Skin' },
  { key: 'musculoskeletal', label: 'Musculoskeletal' },
  { key: 'hematologic', label: 'Hematologic' },
  { key: 'neurological', label: 'Neurological' },
  { key: 'psychiatric', label: 'Psychiatric' },
  { key: 'pediatricSpecific', label: 'Pediatric Specific (if applicable)' }
];

const PE_SYSTEMS = [
  { key: 'general', label: 'General' },
  { key: 'neuroPsych', label: 'Neuro / Psych' },
  { key: 'heent', label: 'HEENT' },
  { key: 'neck', label: 'Neck' },
  { key: 'respiratory', label: 'Respiratory' },
  { key: 'cardiac', label: 'Cardiac' },
  { key: 'abdominal', label: 'Abdominal' },
  { key: 'pelvisGuRectal', label: 'Pelvis / GU / Rectal' },
  { key: 'lymph', label: 'Lymph' },
  { key: 'musculoskeletal', label: 'Musculoskeletal' },
  { key: 'skin', label: 'Skin' }
];

// Single source of truth for the 16-step table of contents. Each entry
// maps a step number to the validator section id it owns (used by the
// step-list status updater).
const STEP_DEFINITIONS = [
  { step: 1,  section: 'patientRegistration',     title: 'Patient Registration' },
  { step: 2,  section: 'chiefComplaintAndVitals', title: 'Chief Complaint & Vitals' },
  { step: 3,  section: 'highRiskSigns',           title: 'High Risk Signs' },
  { step: 4,  section: 'airway',                  title: 'Airway (A)' },
  { step: 5,  section: 'breathing',               title: 'Breathing (B)' },
  { step: 6,  section: 'circulation',             title: 'Circulation (C)' },
  { step: 7,  section: 'disability',              title: 'Disability (D)' },
  { step: 8,  section: 'historyOfPresentIllness', title: 'History of Present Illness' },
  { step: 9,  section: 'reviewOfSystems',         title: 'Review of Systems' },
  { step: 10, section: 'pastMedicalHistory',      title: 'Past Medical History' },
  { step: 11, section: 'physicalExam',            title: 'Physical Exam' },
  { step: 12, section: 'diagnostics',             title: 'Diagnostics' },
  { step: 13, section: 'additionalInterventions', title: 'Additional Interventions' },
  { step: 14, section: 'assessmentAndPlan',       title: 'Assessment & Plan' },
  { step: 15, section: 'reassessment',            title: 'Reassessment' },
  { step: 16, section: 'disposition',             title: 'Disposition' }
];

// ----------------------------------------------------------------------
// Section renderers (1 — 16)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Patient Registration',
    description: 'Demographics, arrival mode, ambulance details and emergency-system timestamps.'
  });

  card.appendChild(textInput({
    label: 'Hospital registration number',
    path: 'patientRegistration.hospitalRegistrationNumber'
  }));

  card.appendChild(twoCol(
    textInput({
      label: 'Patient surname (family name)',
      path: 'patientRegistration.surname',
      placeholder: 'DOE',
      required: true
    }),
    textInput({
      label: 'Patient first name (given name)',
      path: 'patientRegistration.firstName',
      placeholder: 'Jane',
      required: true
    })
  ));

  card.appendChild(radioGroup({
    label: 'Sex',
    path: 'patientRegistration.sex',
    options: SEX_OPTIONS,
    required: true
  }));

  card.appendChild(twoCol(
    textInput({
      label: 'Date of birth',
      path: 'patientRegistration.dateOfBirth',
      type: 'date',
      required: true
    }),
    numberInput({
      label: 'Age',
      path: 'patientRegistration.age',
      min: 0,
      max: 130
    })
  ));

  card.appendChild(selectInput({
    label: 'Age category',
    path: 'patientRegistration.ageCategory',
    options: AGE_CATEGORY_OPTIONS
  }));

  card.appendChild(numberInput({
    label: 'Weight',
    path: 'patientRegistration.weightKg',
    unit: 'kg',
    min: 0,
    step: 0.1
  }));

  card.appendChild(subsectionTitle('Arrival'));
  card.appendChild(twoCol(
    textInput({
      label: 'Date of arrival',
      path: 'patientRegistration.dateOfArrival',
      type: 'date',
      required: true
    }),
    textInput({
      label: 'Time of arrival (24h)',
      path: 'patientRegistration.timeOfArrival',
      type: 'time',
      required: true
    })
  ));

  // Arrival mode is branch-toggling (ambulance reveals level), so it
  // forces a re-render.
  card.appendChild(selectInput({
    label: 'Arrival mode',
    path: 'patientRegistration.arrivalMode',
    options: ARRIVAL_MODE_OPTIONS,
    required: true,
    rerender: true
  }));

  if (state.patientRegistration.arrivalMode === 'ambulance') {
    card.appendChild(radioGroup({
      label: 'Ambulance level',
      path: 'patientRegistration.ambulanceLevel',
      options: AMBULANCE_LEVEL_OPTIONS,
      required: true
    }));
  }

  card.appendChild(subsectionTitle('Emergency system timestamps'));
  card.appendChild(twoCol(
    textInput({ label: 'Activation date', path: 'patientRegistration.emergencySystemActivationDate', type: 'date' }),
    textInput({ label: 'Activation time (24h)', path: 'patientRegistration.emergencySystemActivationTime', type: 'time' }),
    textInput({ label: 'Dispatch date', path: 'patientRegistration.emergencySystemDispatchDate', type: 'date' }),
    textInput({ label: 'Dispatch time (24h)', path: 'patientRegistration.emergencySystemDispatchTime', type: 'time' }),
    textInput({ label: 'Personnel arrival date', path: 'patientRegistration.emergencyPersonnelArrivalDate', type: 'date' }),
    textInput({ label: 'Personnel arrival time (24h)', path: 'patientRegistration.emergencyPersonnelArrivalTime', type: 'time' })
  ));

  card.appendChild(subsectionTitle('Background & identifiers'));
  card.appendChild(textInput({
    label: 'Occupation',
    path: 'patientRegistration.occupation'
  }));

  card.appendChild(textInput({
    label: 'Patient residence',
    path: 'patientRegistration.patientResidence'
  }));
  card.appendChild(checkbox({
    label: 'Patient residence: Unknown',
    path: 'patientRegistration.patientResidenceUnknown'
  }));

  card.appendChild(textInput({
    label: 'Patient defined racial and ethnic identity',
    path: 'patientRegistration.racialAndEthnicIdentity'
  }));
  card.appendChild(checkbox({
    label: 'Racial and ethnic identity: Unknown',
    path: 'patientRegistration.racialAndEthnicIdentityUnknown'
  }));

  card.appendChild(radioGroup({
    label: 'Is an interpreter required?',
    path: 'patientRegistration.interpreterRequired',
    options: YES_NO
  }));

  card.appendChild(subsectionTitle('Contact person'));
  card.appendChild(textInput({ label: 'Name', path: 'patientRegistration.contactPerson' }));
  card.appendChild(textInput({ label: 'Phone', path: 'patientRegistration.contactPhone', type: 'tel' }));
  card.appendChild(textInput({ label: 'Relation', path: 'patientRegistration.contactRelation' }));

  card.appendChild(numberInput({
    label: 'Number of prior facilities',
    path: 'patientRegistration.priorFacilitiesCount',
    min: 0
  }));
  card.appendChild(textInput({
    label: 'Referred from',
    path: 'patientRegistration.referredFrom'
  }));

  card.appendChild(subsectionTitle('Status'));
  card.appendChild(twoCol(
    checkbox({ label: 'Ambulatory', path: 'patientRegistration.ambulatory' }),
    checkbox({ label: 'Non-Ambulatory', path: 'patientRegistration.nonAmbulatory' }),
    checkbox({ label: 'Acute', path: 'patientRegistration.acute' }),
    checkbox({ label: 'Chronic', path: 'patientRegistration.chronic' })
  ));
  card.appendChild(radioGroup({
    label: 'Day-to-day activities limited by health problem or disability (including old age)?',
    path: 'patientRegistration.dailyActivitiesLimited',
    options: YES_NO
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Chief Complaint & Vitals',
    description: 'Capture the chief complaint, triage category, initial vital signs and treating provider assessment time.'
  });

  card.appendChild(textArea({
    label: 'Chief complaint',
    path: 'chiefComplaintAndVitals.chiefComplaint',
    rows: 2,
    placeholder: "In the patient's own words where possible (e.g. 'severe abdominal pain').",
    required: true
  }));

  card.appendChild(radioGroup({
    label: 'Triage category',
    path: 'chiefComplaintAndVitals.triageCategory',
    options: TRIAGE_OPTIONS,
    required: true
  }));

  card.appendChild(subsectionTitle('Initial vital signs'));
  card.appendChild(textInput({
    label: 'Time (24h)',
    path: 'chiefComplaintAndVitals.initialVitals.time',
    type: 'time',
    required: true
  }));

  card.appendChild(twoCol(
    numberInput({ label: 'Temperature', path: 'chiefComplaintAndVitals.initialVitals.tempC', unit: '°C', step: 0.1, min: 25, max: 45 }),
    numberInput({ label: 'Pulse', path: 'chiefComplaintAndVitals.initialVitals.pulse', unit: 'bpm', min: 0, max: 300, required: true }),
    numberInput({ label: 'Systolic BP', path: 'chiefComplaintAndVitals.initialVitals.bpSystolic', unit: 'mmHg', min: 0, max: 300, required: true }),
    numberInput({ label: 'Diastolic BP', path: 'chiefComplaintAndVitals.initialVitals.bpDiastolic', unit: 'mmHg', min: 0, max: 250 }),
    numberInput({ label: 'Respiratory rate', path: 'chiefComplaintAndVitals.initialVitals.respiratoryRate', unit: '/min', min: 0, max: 80, required: true }),
    numberInput({ label: 'SpO2', path: 'chiefComplaintAndVitals.initialVitals.spo2', unit: '%', min: 0, max: 100, required: true }),
    textInput({ label: 'SpO2 on (e.g. RA, NC 2L)', path: 'chiefComplaintAndVitals.initialVitals.spo2OnOxygen' }),
    numberInput({ label: 'Pain score', path: 'chiefComplaintAndVitals.initialVitals.painScore', unit: '0–10', min: 0, max: 10 })
  ));

  card.appendChild(subsectionTitle('Treating provider assessment'));
  card.appendChild(twoCol(
    textInput({ label: 'Date', path: 'chiefComplaintAndVitals.providerAssessmentDate', type: 'date' }),
    textInput({ label: 'Time (24h)', path: 'chiefComplaintAndVitals.providerAssessmentTime', type: 'time' })
  ));
  card.appendChild(checkbox({
    label: 'Dead on arrival',
    path: 'chiefComplaintAndVitals.deadOnArrival'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'High Risk Signs',
    description: 'Tick any high-risk signs identified at triage. These guide rapid clinical escalation.'
  });
  card.appendChild(checkbox({ label: 'Abnormal AVPU', path: 'highRiskSigns.abnormalAvpu' }));
  card.appendChild(checkbox({ label: 'HR < 55 or > 130 (adult)', path: 'highRiskSigns.abnormalHeartRate' }));
  card.appendChild(checkbox({ label: 'Stridor, voice change, or unable to swallow', path: 'highRiskSigns.stridorOrVoiceChange' }));
  card.appendChild(checkbox({ label: 'Poor perfusion / weak pulse / capillary refill > 3s', path: 'highRiskSigns.poorPerfusion' }));
  card.appendChild(checkbox({ label: 'Temperature > 39°C or < 36°C', path: 'highRiskSigns.abnormalTemperature' }));
  card.appendChild(checkbox({ label: 'SpO2 < 90% on room air', path: 'highRiskSigns.lowSpo2' }));
  card.appendChild(checkbox({ label: 'Respiratory distress (grunting in child, retractions, cyanosis)', path: 'highRiskSigns.respiratoryDistress' }));
  card.appendChild(checkbox({ label: "Vomits everything / can't drink or feed", path: 'highRiskSigns.vomitsEverythingOrCannotFeed' }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Airway (A)',
    description: 'Primary survey — airway findings, obstruction and interventions.'
  });
  card.appendChild(checkbox({ label: 'Normal (no abnormal findings)', path: 'airway.normal' }));

  card.appendChild(subsectionTitle('Findings'));
  card.appendChild(checkbox({ label: 'Angioedema', path: 'airway.angioedema' }));
  card.appendChild(checkbox({ label: 'Stridor', path: 'airway.stridor' }));
  card.appendChild(checkbox({ label: 'Voice changes', path: 'airway.voiceChanges' }));
  card.appendChild(checkbox({ label: 'Oral / airway burns', path: 'airway.oralAirwayBurns' }));

  card.appendChild(subsectionTitle('Obstructed by'));
  card.appendChild(checkbox({ label: 'Tongue', path: 'airway.obstructedByTongue' }));
  card.appendChild(checkbox({ label: 'Blood', path: 'airway.obstructedByBlood' }));
  card.appendChild(checkbox({ label: 'Secretions', path: 'airway.obstructedBySecretions' }));
  card.appendChild(checkbox({ label: 'Vomit', path: 'airway.obstructedByVomit' }));
  card.appendChild(checkbox({ label: 'Foreign body', path: 'airway.obstructedByForeignBody' }));

  card.appendChild(subsectionTitle('Interventions'));
  card.appendChild(checkbox({ label: 'Repositioning', path: 'airway.interventionRepositioning' }));
  card.appendChild(checkbox({ label: 'Suction', path: 'airway.interventionSuction' }));
  card.appendChild(checkbox({ label: 'OPA (oropharyngeal airway)', path: 'airway.interventionOpa' }));
  card.appendChild(checkbox({ label: 'NPA (nasopharyngeal airway)', path: 'airway.interventionNpa' }));
  card.appendChild(checkbox({ label: 'LMA (laryngeal mask airway)', path: 'airway.interventionLma' }));
  card.appendChild(checkbox({ label: 'BVM (bag-valve mask)', path: 'airway.interventionBvm' }));
  card.appendChild(checkbox({ label: 'ETT (endotracheal tube)', path: 'airway.interventionEtt' }));

  card.appendChild(textArea({ label: 'Notes', path: 'airway.notes', rows: 2 }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Breathing (B)',
    description: 'Primary survey — chest rise, trachea, breath sounds, oxygenation and ventilation interventions.'
  });
  card.appendChild(checkbox({ label: 'Normal (no abnormal findings)', path: 'breathing.normal' }));

  card.appendChild(numberInput({
    label: 'Spontaneous respiratory rate',
    path: 'breathing.spontaneousRespiratoryRate',
    unit: '/min',
    min: 0,
    max: 80
  }));

  card.appendChild(subsectionTitle('Chest rise'));
  card.appendChild(checkbox({ label: 'Shallow', path: 'breathing.chestRiseShallow' }));
  card.appendChild(checkbox({ label: 'Retractions', path: 'breathing.chestRiseRetractions' }));
  card.appendChild(checkbox({ label: 'Paradoxical', path: 'breathing.chestRiseParadoxical' }));

  card.appendChild(subsectionTitle('Trachea'));
  card.appendChild(checkbox({ label: 'Midline', path: 'breathing.tracheaMidline' }));
  card.appendChild(checkbox({ label: 'Deviated to L', path: 'breathing.tracheaDeviatedLeft' }));
  card.appendChild(checkbox({ label: 'Deviated to R', path: 'breathing.tracheaDeviatedRight' }));

  card.appendChild(subsectionTitle('Breath sounds'));
  card.appendChild(twoCol(
    textInput({ label: 'Left', path: 'breathing.breathSoundsLeft' }),
    textInput({ label: 'Right', path: 'breathing.breathSoundsRight' })
  ));

  card.appendChild(subsectionTitle('Oxygen / ventilation'));
  card.appendChild(numberInput({
    label: 'Oxygen',
    path: 'breathing.oxygenLitres',
    unit: 'L/min',
    min: 0,
    max: 30,
    step: 0.5
  }));
  card.appendChild(checkbox({ label: 'Nasal cannula (NC)', path: 'breathing.oxygenNasalCannula' }));
  card.appendChild(checkbox({ label: 'Mask', path: 'breathing.oxygenMask' }));
  card.appendChild(checkbox({ label: 'Non-rebreather (NRB)', path: 'breathing.oxygenNonRebreather' }));
  card.appendChild(checkbox({ label: 'BVM', path: 'breathing.oxygenBvm' }));
  card.appendChild(checkbox({ label: 'CPAP / BIPAP', path: 'breathing.oxygenCpapBipap' }));
  card.appendChild(checkbox({ label: 'Ventilator', path: 'breathing.oxygenVentilator' }));
  card.appendChild(checkbox({ label: 'Bronchodilator', path: 'breathing.bronchodilator' }));

  card.appendChild(subsectionTitle('Chest needle / tube'));
  card.appendChild(twoCol(
    textInput({ label: 'L — Size', path: 'breathing.chestNeedleLeftSize' }),
    textInput({ label: 'L — Depth (cm)', path: 'breathing.chestNeedleLeftDepth' }),
    textInput({ label: 'R — Size', path: 'breathing.chestNeedleRightSize' }),
    textInput({ label: 'R — Depth (cm)', path: 'breathing.chestNeedleRightDepth' })
  ));

  card.appendChild(textArea({ label: 'Notes', path: 'breathing.notes', rows: 2 }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Circulation (C)',
    description: 'Primary survey — skin, perfusion, pulses, JVD, vascular access and fluids.'
  });
  card.appendChild(checkbox({ label: 'Normal (no abnormal findings)', path: 'circulation.normal' }));

  card.appendChild(subsectionTitle('Skin'));
  card.appendChild(checkbox({ label: 'Warm', path: 'circulation.skinWarm' }));
  card.appendChild(checkbox({ label: 'Dry', path: 'circulation.skinDry' }));
  card.appendChild(checkbox({ label: 'Pale', path: 'circulation.skinPale' }));
  card.appendChild(checkbox({ label: 'Cyanotic', path: 'circulation.skinCyanotic' }));
  card.appendChild(checkbox({ label: 'Moist', path: 'circulation.skinMoist' }));
  card.appendChild(checkbox({ label: 'Cool', path: 'circulation.skinCool' }));

  card.appendChild(subsectionTitle('Capillary refill'));
  card.appendChild(checkbox({ label: '< 3 sec', path: 'circulation.capillaryRefillUnder3' }));
  card.appendChild(numberInput({
    label: 'Capillary refill',
    path: 'circulation.capillaryRefillSeconds',
    unit: 'sec',
    min: 0,
    step: 0.5
  }));

  card.appendChild(subsectionTitle('Pulses'));
  card.appendChild(checkbox({ label: 'Weak', path: 'circulation.pulsesWeak' }));
  card.appendChild(checkbox({ label: 'Asymmetric', path: 'circulation.pulsesAsymmetric' }));

  card.appendChild(radioGroup({
    label: 'JVD?',
    path: 'circulation.jvd',
    options: YES_NO
  }));

  card.appendChild(subsectionTitle('Vascular access'));
  card.appendChild(twoCol(
    textInput({ label: 'IV — Location', path: 'circulation.accessIvLocation' }),
    textInput({ label: 'IV — Size', path: 'circulation.accessIvSize' }),
    textInput({ label: 'CVL — Location', path: 'circulation.accessCvlLocation' }),
    textInput({ label: 'CVL — Size', path: 'circulation.accessCvlSize' }),
    textInput({ label: 'IO — Location', path: 'circulation.accessIoLocation' }),
    textInput({ label: 'IO — Size', path: 'circulation.accessIoSize' })
  ));

  card.appendChild(subsectionTitle('IV fluids'));
  card.appendChild(numberInput({
    label: 'IVF',
    path: 'circulation.ivfMls',
    unit: 'mL',
    min: 0,
    step: 10
  }));
  card.appendChild(checkbox({ label: 'NS (normal saline)', path: 'circulation.ivfNs' }));
  card.appendChild(checkbox({ label: "LR (lactated Ringer's)", path: 'circulation.ivfLr' }));
  card.appendChild(textInput({ label: 'Other fluid', path: 'circulation.ivfOther' }));

  card.appendChild(checkbox({ label: 'Blood ordered', path: 'circulation.bloodOrdered' }));
  card.appendChild(checkbox({ label: 'Epinephrine given', path: 'circulation.epinephrineGiven' }));

  card.appendChild(textArea({ label: 'Notes', path: 'circulation.notes', rows: 2 }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Disability (D)',
    description: 'Primary survey — neurological status (AVPU), motor exam, pupils, blood glucose and interventions.'
  });
  card.appendChild(checkbox({ label: 'Normal (no abnormal findings)', path: 'disability.normal' }));

  card.appendChild(radioGroup({
    label: 'AVPU',
    path: 'disability.avpu',
    options: AVPU_OPTIONS,
    required: true
  }));

  card.appendChild(checkbox({ label: 'Moves all extremities', path: 'disability.movesAllExtremities' }));
  // Deficit toggles a conditional textarea; force re-render.
  card.appendChild(checkbox({
    label: 'Deficit (describe below)',
    path: 'disability.deficit',
    rerender: true
  }));
  if (state.disability.deficit) {
    card.appendChild(textArea({
      label: 'Deficit description',
      path: 'disability.deficitDescription',
      rows: 2,
      required: true
    }));
  }

  card.appendChild(subsectionTitle('Pupils'));
  card.appendChild(twoCol(
    numberInput({ label: 'Size L', path: 'disability.pupilSizeLeft', unit: 'mm', min: 0, max: 10, step: 0.5 }),
    numberInput({ label: 'Size R', path: 'disability.pupilSizeRight', unit: 'mm', min: 0, max: 10, step: 0.5 }),
    textInput({ label: 'Reactivity L', path: 'disability.pupilReactivityLeft', placeholder: 'brisk / sluggish / fixed' }),
    textInput({ label: 'Reactivity R', path: 'disability.pupilReactivityRight', placeholder: 'brisk / sluggish / fixed' })
  ));

  card.appendChild(numberInput({
    label: 'Blood glucose (abnormal if < 3.5 mmol/L)',
    path: 'disability.bloodGlucoseMmol',
    unit: 'mmol/L',
    min: 0,
    max: 50,
    step: 0.1
  }));

  card.appendChild(subsectionTitle('Interventions'));
  card.appendChild(checkbox({ label: 'Glucose', path: 'disability.interventionGlucose' }));
  card.appendChild(checkbox({ label: 'Antiepileptic', path: 'disability.interventionAntiepileptic' }));
  card.appendChild(checkbox({ label: 'Naloxone', path: 'disability.interventionNaloxone' }));
  card.appendChild(textInput({ label: 'Other interventions', path: 'disability.interventionOthers' }));

  card.appendChild(textArea({ label: 'Notes', path: 'disability.notes', rows: 2 }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'History of Present Illness',
    description: 'Document symptoms, time course, exacerbating and alleviating factors, prior episodes and prior interventions (including any primary health care).'
  });
  card.appendChild(textArea({
    label: 'Narrative',
    path: 'historyOfPresentIllness.narrative',
    rows: 6,
    required: true,
    placeholder: 'Onset, character, radiation, associated symptoms, timing, prior treatment etc.'
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Review of Systems',
    description: "Tick 'Normal' or describe abnormal findings for each of the 14 systems."
  });
  for (const sys of ROS_SYSTEMS) {
    const block = document.createElement('div');
    block.className = 'inset-block';
    const h = document.createElement('h4');
    h.textContent = sys.label;
    block.appendChild(h);
    block.appendChild(checkbox({
      label: 'Normal',
      path: `reviewOfSystems.${sys.key}.normal`,
      rerender: true
    }));
    if (!state.reviewOfSystems[sys.key].normal) {
      block.appendChild(textArea({
        label: 'Notes',
        path: `reviewOfSystems.${sys.key}.notes`,
        rows: 2
      }));
    }
    card.appendChild(block);
  }
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Past Medical History',
    description: 'Medications, allergies, pregnancy, vaccinations, substance use, surgical and family history.'
  });

  card.appendChild(textInput({
    label: 'History obtained from',
    path: 'pastMedicalHistory.historyObtainedFrom',
    placeholder: 'Patient / family / EMS / chart',
    required: true
  }));

  card.appendChild(textArea({ label: 'Medications', path: 'pastMedicalHistory.medications', rows: 3 }));
  card.appendChild(checkbox({ label: 'Medications: Unknown', path: 'pastMedicalHistory.medicationsUnknown' }));

  card.appendChild(textArea({ label: 'Allergies', path: 'pastMedicalHistory.allergies', rows: 2 }));
  card.appendChild(checkbox({ label: 'Allergies: Unknown', path: 'pastMedicalHistory.allergiesUnknown' }));

  card.appendChild(subsectionTitle('Reproductive history'));
  card.appendChild(textInput({ label: 'Last menstrual cycle', path: 'pastMedicalHistory.lastMenstrualCycle', type: 'date' }));
  card.appendChild(twoCol(
    numberInput({ label: 'Gravida (G)', path: 'pastMedicalHistory.gravida', min: 0 }),
    numberInput({ label: 'Para (P)', path: 'pastMedicalHistory.para', min: 0 })
  ));
  card.appendChild(checkbox({ label: 'LMP / G&P: Unknown', path: 'pastMedicalHistory.lmpUnknown' }));

  card.appendChild(radioGroup({
    label: 'Pregnant?',
    path: 'pastMedicalHistory.pregnant',
    options: YES_NO,
    rerender: true
  }));
  if (state.pastMedicalHistory.pregnant === 'yes') {
    card.appendChild(checkbox({ label: 'Pregnancy: Reported', path: 'pastMedicalHistory.pregnancyReported' }));
    card.appendChild(checkbox({ label: 'Pregnancy: Testing done', path: 'pastMedicalHistory.pregnancyTestingDone' }));
  }

  card.appendChild(subsectionTitle('Vaccinations'));
  card.appendChild(selectInput({
    label: 'Vaccinations up to date?',
    path: 'pastMedicalHistory.vaccinationsStatus',
    options: VAX_OPTIONS,
    rerender: true
  }));
  if (state.pastMedicalHistory.vaccinationsStatus === 'yes') {
    card.appendChild(textInput({
      label: 'Last vaccination date',
      path: 'pastMedicalHistory.vaccinationsDate',
      type: 'date'
    }));
  }

  card.appendChild(subsectionTitle('Substance use'));
  card.appendChild(checkbox({ label: 'Tobacco', path: 'pastMedicalHistory.tobaccoUse' }));
  card.appendChild(checkbox({ label: 'Alcohol', path: 'pastMedicalHistory.alcoholUse' }));
  card.appendChild(checkbox({ label: 'Drugs', path: 'pastMedicalHistory.drugUse' }));
  card.appendChild(checkbox({ label: 'IV drug use', path: 'pastMedicalHistory.ivDrugUse' }));
  card.appendChild(checkbox({ label: 'Substance use: Unknown', path: 'pastMedicalHistory.substanceUseUnknown' }));

  card.appendChild(subsectionTitle('Past medical conditions'));
  card.appendChild(checkbox({ label: 'HTN (hypertension)', path: 'pastMedicalHistory.pmhHtn' }));
  card.appendChild(checkbox({ label: 'DM (diabetes mellitus)', path: 'pastMedicalHistory.pmhDm' }));
  card.appendChild(checkbox({ label: 'COPD', path: 'pastMedicalHistory.pmhCopd' }));
  card.appendChild(checkbox({ label: 'Psychiatric', path: 'pastMedicalHistory.pmhPsych' }));
  card.appendChild(checkbox({ label: 'Renal disease', path: 'pastMedicalHistory.pmhRenalDisease' }));
  card.appendChild(checkbox({ label: 'Past medical history: Unknown', path: 'pastMedicalHistory.pmhUnknown' }));
  card.appendChild(textArea({ label: 'Other past medical conditions', path: 'pastMedicalHistory.pmhOther', rows: 2 }));

  card.appendChild(textArea({ label: 'Family history', path: 'pastMedicalHistory.familyHistory', rows: 2 }));
  card.appendChild(checkbox({ label: 'Family history: Unknown', path: 'pastMedicalHistory.familyHistoryUnknown' }));

  card.appendChild(textArea({ label: 'Past surgeries (type & date)', path: 'pastMedicalHistory.pastSurgeries', rows: 2 }));
  card.appendChild(checkbox({ label: 'Past surgeries: Unknown', path: 'pastMedicalHistory.pastSurgeriesUnknown' }));

  card.appendChild(textArea({ label: 'Safe at home?', path: 'pastMedicalHistory.safeAtHome', rows: 2 }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Physical Exam',
    description: "For each of the 11 body systems: tick 'Normal' or describe findings (specify L or R if needed)."
  });
  for (const sys of PE_SYSTEMS) {
    const block = document.createElement('div');
    block.className = 'inset-block';
    const h = document.createElement('h4');
    h.textContent = sys.label;
    block.appendChild(h);
    block.appendChild(checkbox({
      label: 'Normal',
      path: `physicalExam.${sys.key}.normal`,
      rerender: true
    }));
    if (!state.physicalExam[sys.key].normal) {
      block.appendChild(textArea({
        label: 'Notes',
        path: `physicalExam.${sys.key}.notes`,
        rows: 2
      }));
    }
    card.appendChild(block);
  }
  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Diagnostics',
    description: 'Labs (CBC, electrolytes, UPT, malaria, HIV, urine dip), ECG and other imaging.'
  });

  card.appendChild(subsectionTitle('CBC (complete blood count)'));
  card.appendChild(fourCol(
    numberInput({ label: 'WBC', path: 'diagnostics.cbc.wbc', step: 0.1, min: 0 }),
    numberInput({ label: 'Hgb', path: 'diagnostics.cbc.hgb', step: 0.1, min: 0 }),
    numberInput({ label: 'Plt', path: 'diagnostics.cbc.plt', min: 0 }),
    numberInput({ label: 'Hct', path: 'diagnostics.cbc.hct', step: 0.1, min: 0, max: 100 })
  ));
  card.appendChild(checkbox({ label: 'CBC: Result pending', path: 'diagnostics.cbc.pending' }));

  card.appendChild(subsectionTitle('Lytes / Cr / glucose'));
  card.appendChild(fourCol(
    numberInput({ label: 'Na', path: 'diagnostics.lytes.na', min: 0 }),
    numberInput({ label: 'Cl', path: 'diagnostics.lytes.cl', min: 0 }),
    numberInput({ label: 'BUN', path: 'diagnostics.lytes.bun', step: 0.1, min: 0 }),
    numberInput({ label: 'K', path: 'diagnostics.lytes.k', step: 0.1, min: 0 }),
    numberInput({ label: 'HCO3', path: 'diagnostics.lytes.hco3', step: 0.1, min: 0 }),
    numberInput({ label: 'Cr', path: 'diagnostics.lytes.cr', step: 0.01, min: 0 }),
    numberInput({ label: 'Glucose', path: 'diagnostics.lytes.glucose', step: 0.1, min: 0 })
  ));
  card.appendChild(checkbox({ label: 'Lytes: Result pending', path: 'diagnostics.lytes.pending' }));

  card.appendChild(subsectionTitle('Rapid tests'));
  card.appendChild(radioGroup({ label: 'UPT (urine pregnancy test)', path: 'diagnostics.upt', options: LAB_RESULTS }));
  card.appendChild(radioGroup({ label: 'Malaria', path: 'diagnostics.malaria', options: LAB_RESULTS }));
  card.appendChild(radioGroup({ label: 'HIV rapid', path: 'diagnostics.hivRapid', options: LAB_RESULTS }));

  card.appendChild(textInput({ label: 'Blood type', path: 'diagnostics.bloodType', placeholder: 'e.g. O+, A-' }));

  card.appendChild(subsectionTitle('Urine dip'));
  card.appendChild(checkbox({ label: 'Glucose', path: 'diagnostics.urineDip.glucose' }));
  card.appendChild(checkbox({ label: 'Nitrites', path: 'diagnostics.urineDip.nitrites' }));
  card.appendChild(checkbox({ label: 'Ketones', path: 'diagnostics.urineDip.ketones' }));
  card.appendChild(checkbox({ label: 'Leukocytes', path: 'diagnostics.urineDip.leukocytes' }));
  card.appendChild(checkbox({ label: 'Blood', path: 'diagnostics.urineDip.blood' }));
  card.appendChild(checkbox({ label: 'Protein', path: 'diagnostics.urineDip.protein' }));

  card.appendChild(textArea({ label: 'Other labs / imaging', path: 'diagnostics.otherLabsImaging', rows: 3 }));

  card.appendChild(subsectionTitle('ECG'));
  card.appendChild(numberInput({ label: 'Rate', path: 'diagnostics.ecg.rate', unit: 'bpm', min: 0, max: 300 }));
  card.appendChild(radioGroup({ label: 'Sinus rhythm?', path: 'diagnostics.ecg.sinusRhythm', options: YES_NO }));
  card.appendChild(radioGroup({ label: 'Ischemia?', path: 'diagnostics.ecg.ischemia', options: YES_NO }));
  card.appendChild(textArea({ label: 'Interpretation', path: 'diagnostics.ecg.interpretation', rows: 3 }));

  return card;
}

function renderStep13() {
  const card = sectionCard({
    stepNumber: 13,
    title: 'Additional Interventions',
    description: 'Medications / fluids and procedures performed during the encounter, with times.'
  });

  card.appendChild(subsectionTitle('Fluids and medications given'));
  card.appendChild(textInput({ label: 'Time (24h)', path: 'additionalInterventions.medications.time', type: 'time' }));
  card.appendChild(twoCol(
    numberInput({ label: 'IVF', path: 'additionalInterventions.medications.ivfMls', unit: 'mL', min: 0, step: 10 }),
    textInput({ label: 'IVF type (NS / LR / Other)', path: 'additionalInterventions.medications.ivfType' })
  ));
  card.appendChild(textInput({ label: 'Blood products (units)', path: 'additionalInterventions.medications.bloodProductsUnits' }));
  card.appendChild(textInput({ label: 'Opioid analgesia', path: 'additionalInterventions.medications.opioidAnalgesia' }));
  card.appendChild(textInput({ label: 'Other analgesia', path: 'additionalInterventions.medications.otherAnalgesia' }));
  card.appendChild(textInput({ label: 'Sedation / paralytics', path: 'additionalInterventions.medications.sedationParalytics' }));
  card.appendChild(textInput({ label: 'Antimicrobials', path: 'additionalInterventions.medications.antimicrobials' }));
  card.appendChild(textInput({ label: 'Tetanus', path: 'additionalInterventions.medications.tetanus' }));
  card.appendChild(textInput({ label: 'Other medications', path: 'additionalInterventions.medications.other' }));

  card.appendChild(subsectionTitle('Procedures'));
  const note = document.createElement('p');
  note.className = 'subsection-note';
  note.textContent = 'Record time and outcome for each procedure performed.';
  card.appendChild(note);

  card.appendChild(smallHeader('Intubation'));
  card.appendChild(textInput({ label: 'Time (24h)', path: 'additionalInterventions.procedures.intubationTime', type: 'time' }));
  card.appendChild(textArea({ label: 'Outcome', path: 'additionalInterventions.procedures.intubationOutcome', rows: 2 }));

  card.appendChild(smallHeader('Chest tube'));
  card.appendChild(textInput({ label: 'Time (24h)', path: 'additionalInterventions.procedures.chestTubeTime', type: 'time' }));
  card.appendChild(textArea({ label: 'Outcome', path: 'additionalInterventions.procedures.chestTubeOutcome', rows: 2 }));

  card.appendChild(smallHeader('Lumbar puncture'));
  card.appendChild(textInput({ label: 'Time (24h)', path: 'additionalInterventions.procedures.lumbarPunctureTime', type: 'time' }));
  card.appendChild(textArea({ label: 'Outcome', path: 'additionalInterventions.procedures.lumbarPunctureOutcome', rows: 2 }));

  card.appendChild(smallHeader('Simple / complex laceration repair'));
  card.appendChild(textInput({ label: 'Time (24h)', path: 'additionalInterventions.procedures.lacerationRepairTime', type: 'time' }));
  card.appendChild(textArea({ label: 'Outcome', path: 'additionalInterventions.procedures.lacerationRepairOutcome', rows: 2 }));

  card.appendChild(textArea({ label: 'Other procedures', path: 'additionalInterventions.procedures.other', rows: 3 }));

  return card;
}

function renderStep14() {
  const card = sectionCard({
    stepNumber: 14,
    title: 'Assessment & Plan',
    description: 'Summary, differential, and plan (imaging, medications / interventions, consults with time called/arrived and recommendations).'
  });
  card.appendChild(textArea({
    label: 'Narrative',
    path: 'assessmentAndPlan.narrative',
    rows: 8,
    required: true,
    placeholder: 'Summary, differential diagnoses, plan for imaging / interventions / consults.'
  }));
  return card;
}

function renderStep15() {
  const card = sectionCard({
    stepNumber: 15,
    title: 'Reassessment',
    description: 'Repeat vital signs and condition update.'
  });
  card.appendChild(textInput({ label: 'Time (24h)', path: 'reassessment.time', type: 'time' }));
  card.appendChild(twoCol(
    numberInput({ label: 'Temperature', path: 'reassessment.tempC', unit: '°C', step: 0.1, min: 25, max: 45 }),
    numberInput({ label: 'Pulse', path: 'reassessment.pulse', unit: 'bpm', min: 0, max: 300 }),
    numberInput({ label: 'Systolic BP', path: 'reassessment.bpSystolic', unit: 'mmHg', min: 0, max: 300 }),
    numberInput({ label: 'Diastolic BP', path: 'reassessment.bpDiastolic', unit: 'mmHg', min: 0, max: 250 }),
    numberInput({ label: 'Respiratory rate', path: 'reassessment.respiratoryRate', unit: '/min', min: 0, max: 80 }),
    numberInput({ label: 'SpO2', path: 'reassessment.spo2', unit: '%', min: 0, max: 100 }),
    textInput({ label: 'SpO2 on (e.g. RA, NC 2L)', path: 'reassessment.spo2OnOxygen' })
  ));
  card.appendChild(checkbox({
    label: 'Condition same',
    path: 'reassessment.conditionSame',
    rerender: true
  }));
  if (!state.reassessment.conditionSame) {
    card.appendChild(textArea({
      label: 'Condition changes',
      path: 'reassessment.conditionChanges',
      rows: 3
    }));
  }
  return card;
}

function renderStep16() {
  const card = sectionCard({
    stepNumber: 16,
    title: 'Disposition',
    description: 'Admit / transfer / discharge / died, departure timestamps, final vital signs, and provider sign-off.'
  });

  card.appendChild(radioGroup({
    label: 'Checklist completed?',
    path: 'disposition.checklistCompleted',
    options: YES_NO
  }));

  card.appendChild(twoCol(
    textInput({ label: 'ED departure date', path: 'disposition.edDepartureDate', type: 'date', required: true }),
    textInput({ label: 'ED departure time (24h)', path: 'disposition.edDepartureTime', type: 'time', required: true })
  ));

  card.appendChild(textArea({
    label: 'Diagnoses / Impressions (list all)',
    path: 'disposition.diagnosesImpressions',
    rows: 4,
    required: true
  }));

  card.appendChild(radioGroup({
    label: 'Disposition',
    path: 'disposition.disposition',
    options: DISPOSITION_OPTIONS,
    required: true,
    rerender: true
  }));

  if (state.disposition.disposition === 'admit') {
    card.appendChild(radioGroup({
      label: 'Admit to',
      path: 'disposition.admitWard',
      options: ADMIT_WARD_OPTIONS,
      required: true
    }));
  }

  if (state.disposition.disposition === 'discharge') {
    card.appendChild(radioGroup({
      label: 'Discharge plan discussed?',
      path: 'disposition.dischargePlanDiscussed',
      options: YES_NO
    }));
  }

  if (state.disposition.disposition === 'transfer') {
    card.appendChild(textInput({
      label: 'Transfer to',
      path: 'disposition.transferTo',
      required: true
    }));
  }

  card.appendChild(checkbox({
    label: 'Left without being seen or before treatment was complete',
    path: 'disposition.leftWithoutBeingSeen'
  }));

  if (state.disposition.disposition === 'died') {
    card.appendChild(textInput({
      label: 'Cause of death (NOT cardiopulmonary arrest)',
      path: 'disposition.diedCause',
      required: true
    }));
  }

  card.appendChild(subsectionTitle('Final vital signs'));
  card.appendChild(twoCol(
    numberInput({ label: 'Temperature', path: 'disposition.finalVitals.tempC', unit: '°C', step: 0.1, min: 25, max: 45 }),
    numberInput({ label: 'Pulse', path: 'disposition.finalVitals.pulse', unit: 'bpm', min: 0, max: 300 }),
    numberInput({ label: 'Systolic BP', path: 'disposition.finalVitals.bpSystolic', unit: 'mmHg', min: 0, max: 300 }),
    numberInput({ label: 'Diastolic BP', path: 'disposition.finalVitals.bpDiastolic', unit: 'mmHg', min: 0, max: 250 }),
    numberInput({ label: 'Respiratory rate', path: 'disposition.finalVitals.respiratoryRate', unit: '/min', min: 0, max: 80 }),
    numberInput({ label: 'SpO2', path: 'disposition.finalVitals.spo2', unit: '%', min: 0, max: 100 }),
    textInput({ label: 'SpO2 on (e.g. RA, NC 2L)', path: 'disposition.finalVitals.spo2OnOxygen' })
  ));

  card.appendChild(subsectionTitle('Provider sign-off'));
  card.appendChild(textInput({ label: 'Accepting provider', path: 'disposition.acceptingProvider' }));
  card.appendChild(textInput({
    label: 'Emergency unit provider name / title (include handovers)',
    path: 'disposition.emergencyUnitProvider',
    required: true
  }));
  card.appendChild(textInput({ label: 'Signature', path: 'disposition.signature', required: true }));
  card.appendChild(textInput({
    label: 'Signature date',
    path: 'disposition.signatureDate',
    type: 'date',
    required: true
  }));

  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7, renderStep8,
  renderStep9, renderStep10, renderStep11, renderStep12,
  renderStep13, renderStep14, renderStep15, renderStep16
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

function updateStepListStatuses(validation) {
  const ol = document.getElementById('step-list');
  if (!ol) return;

  // Build a per-section lookup from the validator output.
  const bySection = {};
  for (const s of validation.sections) {
    bySection[s.section] = s;
  }

  let firstUnfinished = -1;
  for (const def of STEP_DEFINITIONS) {
    const li = ol.querySelector(`[data-step="${def.step}"]`);
    if (!li) continue;
    const s = bySection[def.section];
    const required = s ? s.required : 0;
    const satisfied = s ? s.satisfied : 0;
    if (required > 0 && satisfied === required) {
      li.dataset.status = 'finished';
      li.removeAttribute('aria-current');
    } else if (satisfied > 0) {
      li.dataset.status = 'in-progress';
      if (firstUnfinished === -1) firstUnfinished = def.step;
    } else {
      li.dataset.status = 'waiting';
      li.removeAttribute('aria-current');
      if (required > 0 && firstUnfinished === -1) firstUnfinished = def.step;
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
// Progress (native <progress>) + step-list tally
// ----------------------------------------------------------------------

function updateProgress() {
  const result = validateEuGeneral(state);
  const total = result.totalRequired;
  const answered = result.totalSatisfied;
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);

  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) {
    text.textContent = `${answered} of ${total} required fields answered (${percent}%)`;
  }

  updateStepListStatuses(result);
}

// ----------------------------------------------------------------------
// Validation: per-field error messages + error summary
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
      const labelEl = form.querySelector(`label[for="${id}"]`)
        || form.querySelector(`#${id}-fieldset > legend`);
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
      ${errors.map((e) =>
        `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`).join('')}
    </ul>
  `;
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  summary.focus?.();
}

// ----------------------------------------------------------------------
// Submit / Report
// ----------------------------------------------------------------------

function priorityClass(priority) {
  switch (priority) {
    case 'urgent': return 'flag-urgent';
    case 'high':   return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low':    return 'flag-low';
    default:       return '';
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
      <h2>WHO Emergency Unit Form: General &mdash; submission report</h2>
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

  const validation = validateEuGeneral(state);
  const flags = detectFlaggedIssues(state);
  lastResult = {
    validation,
    flags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh WHO emergency unit (general) form?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const out = document.getElementById('report');
  if (out) out.innerHTML =
    '<p class="empty-message">Submit the form to see the report.</p>';
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
  // Preserve scroll position across re-renders triggered by branch
  // toggles (e.g., disposition).
  const scrollY = window.scrollY;
  host.innerHTML = '';
  for (const r of STEP_RENDERERS) host.appendChild(r());
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

// Expose a small public surface for debugging in the browser console.
export const _getState = () => state;
export const _submitForm = submitForm;
