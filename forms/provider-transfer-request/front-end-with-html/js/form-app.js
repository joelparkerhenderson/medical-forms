import { detectFlaggedIssues } from './flagged-issues.js';
import { validateTransfer } from './transfer-validator.js';
import { completenessLabel, emptyAssessment, hasNumber, hasText, priorityLabel, sectionLabel } from './types.js';

// Single-page continuous wizard: every section is rendered into the page in
// document order and the user scrolls through them. Steps 1-8 are filled in
// by the requesting provider; step 9 (Sign-off & Acknowledgement) carries
// the receiving-provider acknowledgement, which only triggers required
// fields once any acknowledgement field has been touched (two-party gating).
// Submission runs the pure validator + flagged-issues engine and renders an
// inline aria-live report. State is persisted to localStorage so a partial
// fill survives a page reload.
//
// Lily HTML headless class contracts are honoured throughout — see
// `forms/AGENTS-front-end-html.md` for the class vocabulary.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'provider-transfer-request.front-end-form-with-html.v1';

const TOTAL_STEPS = 9;

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

/** @returns {import('./types.js').AssessmentData} */
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
    console.warn('Could not parse saved provider transfer request; starting fresh.', e);
    return emptyAssessment();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save provider transfer request to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored provider transfer request.', e);
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

/** @type {{ validation: any, flags: any[], timestamp: string } | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'provider-transfer-request',
  hadDraftAtLoad,
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

/** Set a dotted path on state, persist, and re-render the form. */
function setPath(path, value) {
  const parts = path.split('.');
  let cur = state;
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
  saveState();
  renderForm();
  updateProgress();
}

/** Set a dotted path without re-rendering (input-typing path). */
function setPathQuiet(path, value) {
  const parts = path.split('.');
  let cur = state;
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
  saveState();
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

/** Build a safe DOM id from a dotted state path. */
function pathToId(path) {
  return 'f-' + path.replace(/\./g, '-');
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

/**
 * @param {{ label: string, path: string, type?: string, placeholder?: string,
 *           required?: boolean }} opts
 */
function textInput(opts) {
  const id = pathToId(opts.path);
  const value = getPath(opts.path) ?? '';
  const type = opts.type || 'text';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');

  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${lilyInputClass(type)}"`,
    `value="${esc(value)}"`,
    `aria-describedby="${id}-error"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error"></span>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    setPathQuiet(opts.path, input.value);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Number input bound to a numeric path. Stores `null` when the field is
 * blanked, otherwise the parsed Number.
 * @param {{ label: string, path: string, min?: number, max?: number,
 *           step?: number, unit?: string }} opts
 */
function numberInput(opts) {
  const id = pathToId(opts.path);
  const raw = getPath(opts.path);
  const value = hasNumber(raw) ? String(raw) : '';
  const labelText =
    esc(opts.label) +
    (opts.unit ? ` <span class="unit">${esc(opts.unit)}</span>` : '');

  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="number"`,
    `class="number-input"`,
    `value="${esc(value)}"`,
    `inputmode="decimal"`,
    `aria-describedby="${id}-error"`
  ];
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error"></span>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    const txt = input.value.trim();
    if (txt === '') {
      setPathQuiet(opts.path, null);
    } else {
      const n = Number(txt);
      setPathQuiet(opts.path, Number.isFinite(n) ? n : null);
    }
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * @param {{ label: string, path: string, rows?: number, placeholder?: string,
 *           required?: boolean }} opts
 */
function textArea(opts) {
  const id = pathToId(opts.path);
  const value = getPath(opts.path) ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const placeholderAttr = opts.placeholder ? ` placeholder="${esc(opts.placeholder)}"` : '';
  const requiredAttrs = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      class="text-area-input"${placeholderAttr}${requiredAttrs}
      aria-describedby="${id}-error">${esc(value)}</textarea>
    <span class="error-message" id="${id}-error"></span>
  `;
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => {
    setPathQuiet(opts.path, ta.value);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * @param {{ label: string, path: string,
 *           options: { value: string, label: string }[],
 *           required?: boolean }} opts
 */
function radioGroup(opts) {
  const groupId = pathToId(opts.path);
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

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = `${groupId}-error`;
  wrapper.appendChild(errSpan);
  return wrapper;
}

/**
 * @param {{ label: string, path: string }} opts
 */
function checkbox(opts) {
  const id = pathToId(opts.path);
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

/**
 * @param {{ label: string, path: string,
 *           options: { value: string, label: string }[] }} opts
 */
function selectField(opts) {
  const id = pathToId(opts.path);
  const current = getPath(opts.path) ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error">
      ${opts.options.map((o) =>
        `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
      ).join('')}
    </select>
    <span class="error-message" id="${id}-error"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => {
    setPathQuiet(opts.path, sel.value);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Build a section card as a Lily fieldset.
 * @param {{ stepNumber: number, title: string, description?: string,
 *           extraClass?: string }} opts
 */
function sectionCard(opts) {
  const card = document.createElement('fieldset');
  card.className = 'fieldset' + (opts.extraClass ? ' ' + opts.extraClass : '');
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

// ----------------------------------------------------------------------
// Option lists
// ----------------------------------------------------------------------

const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' }
];

const YES_NO_UNKNOWN = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' }
];

const URGENCY_OPTIONS = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergent', label: 'Emergent' }
];

const TRANSFER_TYPE_OPTIONS = [
  { value: 'ward-to-ward', label: 'Ward to ward (same site)' },
  { value: 'inter-hospital', label: 'Inter-hospital' },
  { value: 'inter-organisation', label: 'Inter-organisation' },
  { value: 'community', label: 'To community / home' }
];

const TRANSPORT_MODE_OPTIONS = [
  { value: 'self', label: 'Self / walking' },
  { value: 'wheelchair', label: 'Wheelchair' },
  { value: 'stretcher', label: 'Stretcher' },
  { value: 'ambulance', label: 'Ambulance' },
  { value: 'critical-care-transport', label: 'Critical care transport' }
];

const CONSCIOUS_OPTIONS = [
  { value: 'awake', label: 'Awake / alert' },
  { value: 'drowsy', label: 'Drowsy' },
  { value: 'unresponsive', label: 'Unresponsive' }
];

const REGISTRATION_BODY_OPTIONS = [
  { value: '', label: '— Select —' },
  { value: 'GMC', label: 'GMC (General Medical Council)' },
  { value: 'NMC', label: 'NMC (Nursing & Midwifery Council)' },
  { value: 'HCPC', label: 'HCPC (Health & Care Professions Council)' },
  { value: 'GPhC', label: 'GPhC (General Pharmaceutical Council)' },
  { value: 'other', label: 'Other' }
];

// ----------------------------------------------------------------------
// Provider details sub-form (used for Steps 1 & 2)
// ----------------------------------------------------------------------

/**
 * @param {{ pathBase: string }} opts
 */
function renderProviderDetails(opts, host) {
  host.appendChild(textInput({
    label: 'Clinician name',
    path: `${opts.pathBase}.clinicianName`,
    required: true
  }));
  host.appendChild(twoCol(
    textInput({
      label: 'Role / job title',
      path: `${opts.pathBase}.clinicianRole`,
      required: true,
      placeholder: 'e.g. Registrar, Charge Nurse'
    }),
    textInput({
      label: 'Ward / unit',
      path: `${opts.pathBase}.ward`,
      placeholder: 'e.g. AMU, Ward 7'
    })
  ));
  host.appendChild(textInput({
    label: 'Organisation',
    path: `${opts.pathBase}.organisation`,
    required: true,
    placeholder: 'e.g. NHS Trust, hospital, GP practice'
  }));
  host.appendChild(twoCol(
    textInput({
      label: 'Phone',
      path: `${opts.pathBase}.phone`,
      type: 'tel',
      required: true
    }),
    textInput({
      label: 'Email',
      path: `${opts.pathBase}.email`,
      type: 'email'
    })
  ));

  host.appendChild(twoCol(
    selectField({
      label: 'Registration body',
      path: `${opts.pathBase}.registrationBody`,
      options: REGISTRATION_BODY_OPTIONS
    }),
    textInput({
      label: 'Registration number',
      path: `${opts.pathBase}.registrationNumber`,
      placeholder: 'e.g. GMC 1234567'
    })
  ));
}

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Requesting Provider Details',
    description:
      'The clinician initiating this transfer. Used by the receiving team for clarification and feedback.'
  });
  renderProviderDetails({ pathBase: 'requestingProvider' }, card);
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Receiving Provider Details',
    description:
      'The clinician or service being asked to take over care. Confirm acceptance before the patient leaves.'
  });
  renderProviderDetails({ pathBase: 'receivingProvider' }, card);
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Patient Demographics',
    description: 'Confirm the patient identity at handover. NHS number is preferred where available.'
  });
  card.appendChild(twoCol(
    textInput({
      label: 'First name',
      path: 'patientDemographics.firstName',
      required: true
    }),
    textInput({
      label: 'Last name',
      path: 'patientDemographics.lastName',
      required: true
    })
  ));
  card.appendChild(twoCol(
    textInput({
      label: 'Date of birth',
      path: 'patientDemographics.dateOfBirth',
      type: 'date',
      required: true
    }),
    radioGroup({
      label: 'Sex',
      path: 'patientDemographics.sex',
      options: SEX_OPTIONS,
      required: true
    })
  ));
  card.appendChild(twoCol(
    textInput({
      label: 'NHS number',
      path: 'patientDemographics.nhsNumber',
      placeholder: '10 digits, e.g. 123 456 7890'
    }),
    textInput({
      label: 'Hospital / local number',
      path: 'patientDemographics.hospitalNumber'
    })
  ));
  card.appendChild(twoCol(
    textInput({
      label: 'Address line',
      path: 'patientDemographics.addressLine'
    }),
    textInput({
      label: 'Postcode',
      path: 'patientDemographics.postcode'
    })
  ));

  const kinHeader = document.createElement('h3');
  kinHeader.className = 'subsection-heading';
  kinHeader.textContent = 'Next of kin';
  card.appendChild(kinHeader);

  card.appendChild(twoCol(
    textInput({
      label: 'Next of kin name',
      path: 'patientDemographics.nextOfKinName'
    }),
    textInput({
      label: 'Next of kin phone',
      path: 'patientDemographics.nextOfKinPhone',
      type: 'tel'
    })
  ));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Situation (S) — Reason for Transfer',
    description: 'Briefly state why the patient needs to be transferred now.'
  });
  card.appendChild(textArea({
    label: 'Reason for transfer',
    path: 'situation.reasonForTransfer',
    rows: 3,
    required: true,
    placeholder: 'e.g. Specialist input required for acute pancreatitis with rising amylase.'
  }));
  card.appendChild(textInput({
    label: 'Primary diagnosis',
    path: 'situation.primaryDiagnosis',
    required: true,
    placeholder: 'e.g. Acute pancreatitis'
  }));
  card.appendChild(radioGroup({
    label: 'Transfer urgency',
    path: 'situation.urgency',
    options: URGENCY_OPTIONS,
    required: true
  }));
  card.appendChild(radioGroup({
    label: 'Transfer type',
    path: 'situation.transferType',
    options: TRANSFER_TYPE_OPTIONS,
    required: true
  }));
  card.appendChild(textInput({
    label: 'Requested transfer date / time',
    path: 'situation.requestedDateTime',
    type: 'datetime-local'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Background (B) — Relevant History',
    description:
      'Concise background needed for the receiving team to take over safely.'
  });
  card.appendChild(textArea({
    label: 'Presenting complaint',
    path: 'background.presentingComplaint',
    rows: 2,
    required: true
  }));
  card.appendChild(textArea({
    label: 'Relevant history of current admission',
    path: 'background.relevantHistory',
    rows: 3,
    required: true
  }));
  card.appendChild(textArea({
    label: 'Past medical / surgical history',
    path: 'background.pastMedicalHistory',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Current medications',
    path: 'background.currentMedications',
    rows: 3,
    required: true,
    placeholder: 'List each drug, dose, route, frequency.'
  }));
  card.appendChild(textArea({
    label: 'Allergies / adverse reactions',
    path: 'background.allergies',
    rows: 2,
    required: true,
    placeholder: 'Document explicitly. Record "NKDA" if no known drug allergies.'
  }));
  card.appendChild(textArea({
    label: 'Recent investigations / results',
    path: 'background.recentInvestigations',
    rows: 3,
    placeholder: 'e.g. bloods, imaging, microbiology, ECG.'
  }));
  card.appendChild(textArea({
    label: 'Infection / colonisation status',
    path: 'background.infectionStatus',
    rows: 2,
    required: true,
    placeholder: 'e.g. MRSA negative on screening, COVID-19 swab pending, none known.'
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Assessment (A) — Current Clinical Status',
    description:
      'Summary of how the patient is now and the latest set of vital signs.'
  });
  card.appendChild(textArea({
    label: 'Current clinical status',
    path: 'assessment.currentClinicalStatus',
    rows: 4,
    required: true
  }));
  card.appendChild(radioGroup({
    label: 'Conscious level',
    path: 'assessment.consciousLevel',
    options: CONSCIOUS_OPTIONS,
    required: true
  }));

  const vitalsHeader = document.createElement('h3');
  vitalsHeader.className = 'subsection-heading';
  vitalsHeader.textContent = 'Vital signs';
  card.appendChild(vitalsHeader);

  const vitalsGrid = document.createElement('div');
  vitalsGrid.className = 'vitals-grid';
  vitalsGrid.appendChild(numberInput({
    label: 'Heart rate',
    path: 'assessment.vitalSigns.heartRate',
    min: 0, max: 300, step: 1, unit: 'bpm'
  }));
  vitalsGrid.appendChild(numberInput({
    label: 'Respiratory rate',
    path: 'assessment.vitalSigns.respiratoryRate',
    min: 0, max: 80, step: 1, unit: '/min'
  }));
  vitalsGrid.appendChild(numberInput({
    label: 'Systolic BP',
    path: 'assessment.vitalSigns.systolicBloodPressure',
    min: 0, max: 300, step: 1, unit: 'mmHg'
  }));
  vitalsGrid.appendChild(numberInput({
    label: 'Diastolic BP',
    path: 'assessment.vitalSigns.diastolicBloodPressure',
    min: 0, max: 200, step: 1, unit: 'mmHg'
  }));
  vitalsGrid.appendChild(numberInput({
    label: 'Temperature',
    path: 'assessment.vitalSigns.temperatureCelsius',
    min: 25, max: 45, step: 0.1, unit: '°C'
  }));
  vitalsGrid.appendChild(numberInput({
    label: 'Oxygen saturation',
    path: 'assessment.vitalSigns.oxygenSaturation',
    min: 0, max: 100, step: 1, unit: '%'
  }));
  vitalsGrid.appendChild(numberInput({
    label: 'NEWS2 score',
    path: 'assessment.vitalSigns.newsScore',
    min: 0, max: 20, step: 1
  }));
  card.appendChild(vitalsGrid);

  card.appendChild(radioGroup({
    label: 'Clinically stable for transfer?',
    path: 'assessment.clinicallyStable',
    options: YES_NO_UNKNOWN,
    required: true
  }));
  if (
    state.assessment.clinicallyStable === 'no' ||
    state.assessment.clinicallyStable === 'unknown'
  ) {
    card.appendChild(textArea({
      label: 'Stability notes / concerns',
      path: 'assessment.stabilityNotes',
      rows: 3,
      required: state.assessment.clinicallyStable === 'no',
      placeholder: 'Describe instability and what is being done about it.'
    }));
  }
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Recommendation (R) — Requested Action',
    description:
      'Be specific about what you are asking the receiving provider to do.'
  });
  card.appendChild(textArea({
    label: 'Requested action',
    path: 'recommendation.requestedAction',
    rows: 3,
    required: true,
    placeholder: 'e.g. Accept for HDU monitoring; review by gastroenterology within 4 hours.'
  }));
  card.appendChild(textArea({
    label: 'Expected outcomes / goals of transfer',
    path: 'recommendation.expectedOutcomes',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Ongoing care plan',
    path: 'recommendation.ongoingCarePlan',
    rows: 3,
    required: true,
    placeholder: 'Treatments to continue, reviews booked, escalation plan.'
  }));
  card.appendChild(textArea({
    label: 'Pending results / follow-up',
    path: 'recommendation.pendingResults',
    rows: 2,
    placeholder: 'Tests booked, samples sent, results outstanding and how to chase them.'
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Transfer Logistics',
    description:
      'Practical details the transport service and receiving area need.'
  });
  card.appendChild(radioGroup({
    label: 'Transport mode',
    path: 'transferLogistics.transportMode',
    options: TRANSPORT_MODE_OPTIONS,
    required: true
  }));
  card.appendChild(twoCol(
    textInput({
      label: 'Planned departure date / time',
      path: 'transferLogistics.departureDateTime',
      type: 'datetime-local',
      required: true
    }),
    textInput({
      label: 'Estimated arrival date / time',
      path: 'transferLogistics.estimatedArrivalDateTime',
      type: 'datetime-local'
    })
  ));

  const requirementsHeader = document.createElement('h3');
  requirementsHeader.className = 'subsection-heading';
  requirementsHeader.textContent = 'Transport requirements';
  card.appendChild(requirementsHeader);

  const requirementsList = document.createElement('div');
  requirementsList.className = 'checkbox-group transport-requirements';
  requirementsList.setAttribute('role', 'group');
  requirementsList.appendChild(checkbox({
    label: 'Clinical escort required',
    path: 'transferLogistics.escortRequired'
  }));
  requirementsList.appendChild(checkbox({
    label: 'Supplemental oxygen required',
    path: 'transferLogistics.oxygenRequired'
  }));
  requirementsList.appendChild(checkbox({
    label: 'Cardiac monitoring required',
    path: 'transferLogistics.cardiacMonitoringRequired'
  }));
  requirementsList.appendChild(checkbox({
    label: 'Infectious precautions required',
    path: 'transferLogistics.infectiousPrecautions'
  }));
  requirementsList.appendChild(checkbox({
    label: 'Falls risk',
    path: 'transferLogistics.fallsRisk'
  }));
  requirementsList.appendChild(checkbox({
    label: 'Mental Capacity Act / safeguarding concerns',
    path: 'transferLogistics.mentalCapacityConcerns'
  }));
  card.appendChild(requirementsList);

  if (state.transferLogistics.escortRequired) {
    card.appendChild(textArea({
      label: 'Escort details',
      path: 'transferLogistics.escortDetails',
      rows: 2,
      required: true,
      placeholder: 'Who is escorting, qualifications, what equipment they bring.'
    }));
  }
  if (state.transferLogistics.infectiousPrecautions) {
    card.appendChild(textArea({
      label: 'Infectious-precaution details',
      path: 'transferLogistics.infectiousPrecautionsDetails',
      rows: 2,
      required: true,
      placeholder: 'e.g. droplet precautions for influenza A; contact precautions for C. difficile.'
    }));
  }

  card.appendChild(textArea({
    label: 'Equipment / lines / drains accompanying patient',
    path: 'transferLogistics.equipmentRequired',
    rows: 3,
    placeholder: 'e.g. peripheral IV (right ACF), urinary catheter, NG tube on free drainage.'
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Sign-off & Acknowledgement',
    description:
      'Requesting provider signs the handover; receiving provider acknowledges acceptance on arrival.',
    extraClass: 'acknowledgement'
  });

  const requestingHeader = document.createElement('h3');
  requestingHeader.className = 'subsection-heading';
  requestingHeader.textContent = 'Requesting provider sign-off';
  card.appendChild(requestingHeader);

  card.appendChild(twoCol(
    textInput({
      label: 'Signature (typed full name)',
      path: 'signoffAcknowledgement.requestingProviderSignature',
      required: true
    }),
    textInput({
      label: 'Signature date',
      path: 'signoffAcknowledgement.requestingProviderSignatureDate',
      type: 'date',
      required: true
    })
  ));

  const note = document.createElement('p');
  note.className = 'alert';
  note.setAttribute('data-type', 'info');
  note.textContent =
    'The fields below are filled in by the receiving provider on arrival. Validation rules for the receipt-side only fire once any acknowledgement field is filled in (two-party gating).';
  card.appendChild(note);

  const receivingHeader = document.createElement('h3');
  receivingHeader.className = 'subsection-heading';
  receivingHeader.textContent = 'Receiving provider acknowledgement';
  card.appendChild(receivingHeader);

  card.appendChild(textInput({
    label: 'Receiving provider name',
    path: 'signoffAcknowledgement.receivingProviderName'
  }));
  card.appendChild(twoCol(
    textInput({
      label: 'Receiving provider signature (typed full name)',
      path: 'signoffAcknowledgement.receivingProviderSignature'
    }),
    textInput({
      label: 'Signature date',
      path: 'signoffAcknowledgement.receivingProviderSignatureDate',
      type: 'date'
    })
  ));
  card.appendChild(checkbox({
    label: 'Acknowledgement received and care accepted',
    path: 'signoffAcknowledgement.acknowledgementReceived'
  }));
  card.appendChild(textArea({
    label: 'Acknowledgement notes',
    path: 'signoffAcknowledgement.acknowledgementNotes',
    rows: 2,
    placeholder: 'Any caveats noted by the receiving provider on acceptance.'
  }));
  return card;
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'requestingProvider',     title: 'Requesting' },
  { step: 2, section: 'receivingProvider',      title: 'Receiving' },
  { step: 3, section: 'patientDemographics',    title: 'Patient' },
  { step: 4, section: 'situation',              title: 'Situation' },
  { step: 5, section: 'background',             title: 'Background' },
  { step: 6, section: 'assessment',             title: 'Assessment' },
  { step: 7, section: 'recommendation',         title: 'Recommendation' },
  { step: 8, section: 'transferLogistics',      title: 'Logistics' },
  { step: 9, section: 'signoffAcknowledgement', title: 'Sign-off' }
];

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
  renderStep6, renderStep7, renderStep8, renderStep9
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

function updateStepListStatuses(sectionResults) {
  const ol = document.getElementById('step-list');
  if (!ol) return;
  let firstUnfinished = -1;
  for (const def of STEP_DEFINITIONS) {
    const li = ol.querySelector(`[data-step="${def.step}"]`);
    if (!li) continue;
    const sr = sectionResults[def.section];
    const required = sr ? sr.required : 0;
    const satisfied = sr ? sr.satisfied : 0;
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
// Progress
// ----------------------------------------------------------------------

/**
 * Compute progress: how many currently-applicable rules are satisfied.
 * Uses the same validator as submit so progress and missing counts agree.
 */
function updateProgress() {
  const result = validateTransfer(state);
  const total = result.totalRequired;
  const answered = result.totalSatisfied;
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);

  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) {
    text.textContent =
      `${answered} of ${total} fields answered (${percent}%) — ` +
      `${result.mandatorySatisfied}/${result.mandatoryRequired} mandatory`;
  }

  // Build per-section tally for the step list.
  const sectionResults = {};
  for (const s of result.sections) {
    sectionResults[s.section] = s;
  }
  updateStepListStatuses(sectionResults);
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

  // Track each radiogroup only once (use the fieldset id stem).
  const seenGroups = new Set();
  const required = form.querySelectorAll('[data-required]');

  required.forEach((input) => {
    if (input.type === 'radio') {
      const groupName = input.name;
      if (seenGroups.has(groupName)) return;
      seenGroups.add(groupName);
      const anyChecked = form.querySelector(`input[name="${groupName}"]:checked`);
      const legendEl = document.getElementById(`${groupName}-fieldset`);
      const labelText = legendEl
        ? (legendEl.querySelector('legend')?.textContent || groupName).replace(/\s*\*\s*$/, '').trim()
        : groupName;
      if (!anyChecked) {
        errors.push({ id: groupName, message: `${labelText} is required` });
        setFieldError(groupName, `${labelText} is required`);
      } else {
        clearFieldError(groupName);
      }
      return;
    }

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

function completenessBadgeClass(level) {
  switch (level) {
    case 'complete': return 'complete';
    case 'partial': return 'partial';
    case 'incomplete': return 'incomplete';
    default: return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const { validation, flags, timestamp } = lastResult;
  const out = document.getElementById('report');
  if (!out) return;

  const completenessBadge =
    `<span class="completeness-badge ${completenessBadgeClass(validation.completeness)}">${esc(completenessLabel(validation.completeness))}</span>`;

  const sectionRows = validation.sections.map((s) => {
    const missingItems = s.missing.length === 0
      ? '<span class="muted">All required fields completed.</span>'
      : `<ul class="missing-list">${s.missing.map(
          (m) => `<li>${esc(m.id)} — ${esc(m.description)}${m.mandatory ? ' <strong>(mandatory)</strong>' : ''}</li>`
        ).join('')}</ul>`;
    return `
      <tr>
        <th scope="row">${esc(sectionLabel(s.section))}</th>
        <td>${s.satisfied} / ${s.required}<br><span class="muted">${s.mandatorySatisfied}/${s.mandatoryRequired} mandatory</span></td>
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
    <h2>Provider Transfer Request — submission report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <div class="completeness">
      ${completenessBadge}
      <span>${validation.totalSatisfied} of ${validation.totalRequired} fields answered, ${validation.mandatorySatisfied} of ${validation.mandatoryRequired} mandatory.</span>
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
  // Trigger Lily-style required-field validation first (visual feedback).
  validateForm();

  // The semantic validator drives report-level completeness regardless.
  const validation = validateTransfer(state);
  const flags = detectFlaggedIssues(state);
  lastResult = {
    validation,
    flags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh provider transfer request?')) return;
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
  // Preserve scroll position across re-renders.
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
