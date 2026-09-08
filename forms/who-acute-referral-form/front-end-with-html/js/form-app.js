import { detectFlaggedIssues } from './flagged-issues.js';
import { validateReferral } from './referral-validator.js';
import { emptyAssessment, hasNumber, hasText, isYesNoUnknownAnswered, priorityLabel, sectionLabel } from './types.js';

// Single-page continuous wizard: every section is rendered into the page
// in document order. Steps 1-7 are completed by the initiating facility;
// step 8 (Referral Facility Receipt) is completed by the receiving
// facility on arrival. Receipt-side validation rules only fire once any
// receipt field is touched (two-party gating). Submission runs the pure
// validator + flagged-issues engine and renders an inline report. State
// is persisted to localStorage so a partial fill survives a page reload.
//
// Lily HTML headless class contracts are honoured throughout — see
// `forms/AGENTS-front-end-html.md` for the class vocabulary.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'who-acute-referral-form.front-end-form-with-html.v1';

const TOTAL_STEPS = 8;

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
    console.warn('Could not parse saved WHO referral form; starting fresh.', e);
    return emptyAssessment();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save WHO referral form to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored WHO referral form.', e);
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
  slug: 'who-acute-referral-form',
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
  input.addEventListener('change', () => {
    renderForm();
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

const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Unknown' }
];

const YES_NO_UNKNOWN = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' }
];

const MODE_OPTIONS = [
  { value: 'ground', label: 'Ground' },
  { value: 'air', label: 'Air' },
  { value: 'sea', label: 'Sea' }
];

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Patient Identification',
    description: 'Identify the patient being referred and one emergency contact.'
  });
  card.appendChild(twoCol(
    textInput({
      label: 'Last name (family name)',
      path: 'patientIdentification.patientLastName',
      required: true
    }),
    textInput({
      label: 'First name (given name)',
      path: 'patientIdentification.patientFirstName',
      required: true
    })
  ));
  card.appendChild(twoCol(
    textInput({
      label: 'Date of birth',
      path: 'patientIdentification.dateOfBirth',
      type: 'date',
      required: true
    }),
    radioGroup({
      label: 'Sex',
      path: 'patientIdentification.sex',
      options: SEX_OPTIONS,
      required: true
    })
  ));
  card.appendChild(textInput({
    label: 'Patient contact information (phone, address)',
    path: 'patientIdentification.patientContactInformation'
  }));

  const ecHeader = document.createElement('h3');
  ecHeader.className = 'subsection-heading';
  ecHeader.textContent = 'Emergency contact';
  card.appendChild(ecHeader);

  card.appendChild(twoCol(
    textInput({
      label: 'Emergency contact name',
      path: 'patientIdentification.emergencyContact.name'
    }),
    textInput({
      label: 'Emergency contact phone / details',
      path: 'patientIdentification.emergencyContact.contactInformation'
    })
  ));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Facility & Transport',
    description: 'Identify the initiating and receiving facilities, the ambulance service, and the transfer mode and timing.'
  });

  const initHeader = document.createElement('h3');
  initHeader.className = 'subsection-heading';
  initHeader.textContent = 'Initiating facility';
  card.appendChild(initHeader);

  card.appendChild(textInput({
    label: 'Facility name',
    path: 'facilityAndTransport.initiatingFacility.name',
    required: true
  }));
  card.appendChild(twoCol(
    textInput({
      label: 'Focal point (contact person)',
      path: 'facilityAndTransport.initiatingFacility.focalPoint',
      required: true
    }),
    textInput({
      label: 'Phone number',
      path: 'facilityAndTransport.initiatingFacility.phoneNumber',
      type: 'tel',
      required: true
    })
  ));

  card.appendChild(textArea({
    label: 'Reason for referral',
    path: 'facilityAndTransport.reasonForReferral',
    rows: 2,
    required: true
  }));

  const refHeader = document.createElement('h3');
  refHeader.className = 'subsection-heading';
  refHeader.textContent = 'Referral (receiving) facility';
  card.appendChild(refHeader);

  card.appendChild(checkbox({
    label: 'Referral facility has been contacted and accepts the patient',
    path: 'facilityAndTransport.referralFacilityContacted'
  }));
  card.appendChild(textInput({
    label: 'Facility name',
    path: 'facilityAndTransport.referralFacility.name',
    required: true
  }));
  card.appendChild(twoCol(
    textInput({
      label: 'Focal point (contact person)',
      path: 'facilityAndTransport.referralFacility.focalPoint'
    }),
    textInput({
      label: 'Phone number',
      path: 'facilityAndTransport.referralFacility.phoneNumber',
      type: 'tel',
      required: true
    })
  ));

  const ambHeader = document.createElement('h3');
  ambHeader.className = 'subsection-heading';
  ambHeader.textContent = 'Ambulance / transport service';
  card.appendChild(ambHeader);

  card.appendChild(textInput({
    label: 'Ambulance service / vehicle',
    path: 'facilityAndTransport.ambulance.name'
  }));
  card.appendChild(twoCol(
    textInput({
      label: 'Focal point',
      path: 'facilityAndTransport.ambulance.focalPoint'
    }),
    textInput({
      label: 'Phone number',
      path: 'facilityAndTransport.ambulance.phoneNumber',
      type: 'tel'
    })
  ));

  const timeHeader = document.createElement('h3');
  timeHeader.className = 'subsection-heading';
  timeHeader.textContent = 'Timing and mode';
  card.appendChild(timeHeader);

  card.appendChild(twoCol(
    textInput({
      label: 'Date/time of transfer decision',
      path: 'facilityAndTransport.transferDecisionDateTime',
      type: 'datetime-local',
      required: true
    }),
    textInput({
      label: 'Date/time of departure',
      path: 'facilityAndTransport.departureDateTime',
      type: 'datetime-local',
      required: true
    })
  ));
  card.appendChild(radioGroup({
    label: 'Mode of transfer',
    path: 'facilityAndTransport.modeOfTransfer',
    options: MODE_OPTIONS,
    required: true
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Situation (S)',
    description: 'Briefly state why the patient needs to be referred now.'
  });
  card.appendChild(textInput({
    label: 'Chief complaint',
    path: 'situation.chiefComplaint',
    required: true,
    placeholder: 'e.g. Chest pain x 2 hours'
  }));
  card.appendChild(textInput({
    label: 'Primary diagnosis',
    path: 'situation.primaryDiagnosis',
    required: true,
    placeholder: 'e.g. Acute myocardial infarction'
  }));
  card.appendChild(radioGroup({
    label: 'Pregnant?',
    path: 'situation.pregnant',
    options: YES_NO_UNKNOWN,
    required: true
  }));
  card.appendChild(textArea({
    label: 'Other acute diagnoses',
    path: 'situation.otherAcuteDiagnoses',
    rows: 2,
    placeholder: 'Any additional acute diagnoses contributing to the referral.'
  }));
  card.appendChild(textArea({
    label: 'Treatments initiated at the initiating facility',
    path: 'situation.treatmentsInitiated',
    rows: 3,
    placeholder: 'e.g. IV fluids, oxygen, aspirin, antibiotics'
  }));
  return card;
}

/**
 * Render an ABCDE entry (finding + intervention with explicit "normal" /
 * "none" toggles to satisfy the validator).
 * @param {{ key: string, label: string }} opts
 */
function renderAbcdeBlock(opts) {
  const block = document.createElement('div');
  block.className = 'inset-block';
  const header = document.createElement('h4');
  header.className = 'inset-block-title';
  header.textContent = opts.label;
  block.appendChild(header);

  const findingPath = `background.${opts.key}.findingNormal`;
  const findingDetailsPath = `background.${opts.key}.findingDetails`;
  const interventionNonePath = `background.${opts.key}.interventionNone`;
  const interventionDetailsPath = `background.${opts.key}.interventionDetails`;

  block.appendChild(checkbox({
    label: 'Finding: normal',
    path: findingPath
  }));
  if (!getPath(findingPath)) {
    block.appendChild(textArea({
      label: 'Finding details',
      path: findingDetailsPath,
      rows: 2,
      placeholder: 'Describe the abnormal finding(s).'
    }));
  }
  block.appendChild(checkbox({
    label: 'Intervention: none required',
    path: interventionNonePath
  }));
  if (!getPath(interventionNonePath)) {
    block.appendChild(textArea({
      label: 'Intervention details',
      path: interventionDetailsPath,
      rows: 2,
      placeholder: 'Describe the intervention(s) performed.'
    }));
  }
  return block;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Background (B) — history and ABCDE',
    description: 'Brief history, past medical/surgical history, and an ABCDE primary survey with the interventions performed.'
  });
  card.appendChild(textArea({
    label: 'Brief history of present illness',
    path: 'background.historyOfPresentIllness',
    rows: 3,
    required: true
  }));
  card.appendChild(textArea({
    label: 'Past medical and surgical history',
    path: 'background.pastMedicalAndSurgicalHistory',
    rows: 3
  }));

  const abcdeHeader = document.createElement('h3');
  abcdeHeader.className = 'subsection-heading';
  abcdeHeader.textContent = 'ABCDE primary survey';
  card.appendChild(abcdeHeader);

  card.appendChild(renderAbcdeBlock({ key: 'airway', label: 'A — Airway' }));
  card.appendChild(renderAbcdeBlock({ key: 'breathing', label: 'B — Breathing' }));
  card.appendChild(renderAbcdeBlock({ key: 'circulation', label: 'C — Circulation' }));
  card.appendChild(renderAbcdeBlock({ key: 'disability', label: 'D — Disability (neurologic)' }));
  card.appendChild(renderAbcdeBlock({ key: 'exposure', label: 'E — Exposure' }));

  card.appendChild(textArea({
    label: 'Other significant treatments',
    path: 'background.otherSignificantTreatments',
    rows: 2
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Assessment (A) — clinical assessment & vital signs',
    description: 'Describe the patient and the need for referral; record the latest set of vital signs.'
  });
  card.appendChild(textArea({
    label: 'Clinical assessment (description of the patient and need for referral)',
    path: 'assessment.clinicalAssessment',
    rows: 4,
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
    label: 'Glasgow Coma Scale',
    path: 'assessment.vitalSigns.glasgowComaScale',
    min: 3, max: 15, step: 1, unit: '/15'
  }));
  card.appendChild(vitalsGrid);
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Recommendations (R)',
    description: 'Recommended treatment plan during transport, anticipated deterioration, cautions, and precautions.'
  });
  card.appendChild(textArea({
    label: 'Treatment plan during transport',
    path: 'recommendations.treatmentPlanDuringTransport',
    rows: 3,
    required: true,
    placeholder: 'e.g. Continue O2, IV fluids 100 ml/h, monitor SpO2 and ECG, repeat aspirin if pain recurs.'
  }));
  card.appendChild(textArea({
    label: 'Potential worsening of condition during transport',
    path: 'recommendations.potentialWorseningOfCondition',
    rows: 3,
    placeholder: 'Anticipated complications and how to recognise/manage them.'
  }));
  card.appendChild(textArea({
    label: 'Cautions regarding prior therapies / interventions',
    path: 'recommendations.cautionsRegardingPriorTherapies',
    rows: 3,
    placeholder: 'e.g. recent thrombolysis, anticoagulation, drug allergies.'
  }));

  const precHeader = document.createElement('h3');
  precHeader.className = 'subsection-heading';
  precHeader.textContent = 'Precautions';
  card.appendChild(precHeader);

  const precNote = document.createElement('p');
  precNote.className = 'hint';
  precNote.textContent = 'Tick any precautions that apply during transport and on arrival.';
  card.appendChild(precNote);

  const precWrap = document.createElement('div');
  precWrap.className = 'checkbox-group precaution-list';
  precWrap.appendChild(checkbox({
    label: 'Highly infectious disease',
    path: 'recommendations.precautions.highlyInfectiousDisease'
  }));
  precWrap.appendChild(checkbox({
    label: 'Spinal precautions',
    path: 'recommendations.precautions.spinalPrecautions'
  }));
  precWrap.appendChild(checkbox({
    label: 'Weight-bearing restrictions',
    path: 'recommendations.precautions.weightBearingRestrictions'
  }));
  precWrap.appendChild(checkbox({
    label: 'Fall risk',
    path: 'recommendations.precautions.fallRisk'
  }));
  precWrap.appendChild(checkbox({
    label: 'Aspiration risk',
    path: 'recommendations.precautions.aspirationRisk'
  }));
  precWrap.appendChild(checkbox({
    label: 'Other',
    path: 'recommendations.precautions.other'
  }));
  card.appendChild(precWrap);

  if (state.recommendations.precautions.other) {
    card.appendChild(textArea({
      label: 'Describe how the "Other" precaution applies',
      path: 'recommendations.precautions.otherDetails',
      rows: 2,
      required: true
    }));
  }

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Provider Sign-off (initiating facility)',
    description: 'Completed by the clinician at the initiating facility before the patient leaves.'
  });
  card.appendChild(textInput({
    label: 'Provider name',
    path: 'initiatingProviderSignoff.providerName',
    required: true
  }));
  card.appendChild(twoCol(
    textInput({
      label: 'Signature (typed full name)',
      path: 'initiatingProviderSignoff.signature',
      required: true
    }),
    textInput({
      label: 'Signature date',
      path: 'initiatingProviderSignoff.signatureDate',
      type: 'date',
      required: true
    })
  ));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Referral Facility Receipt',
    description: 'Completed by the receiving (referral) facility on patient arrival. Required only once any field below is filled in.',
    extraClass: 'receipt'
  });

  const note = document.createElement('p');
  note.className = 'alert';
  note.setAttribute('data-type', 'info');
  note.textContent =
    'This section is filled in by the receiving facility. Validation rules for the receipt-side only fire once any of the receipt fields below has any value (two-party gating).';
  card.appendChild(note);

  card.appendChild(textInput({
    label: 'Patient arrival date and time',
    path: 'referralFacilityReceipt.patientArrivalDateTime',
    type: 'datetime-local'
  }));
  card.appendChild(textInput({
    label: 'Receiving provider name',
    path: 'referralFacilityReceipt.receivingProviderName'
  }));
  card.appendChild(textInput({
    label: 'Receiving provider signature (typed full name)',
    path: 'referralFacilityReceipt.receivingProviderSignature'
  }));
  card.appendChild(checkbox({
    label: 'Feedback provided to the initiating facility',
    path: 'referralFacilityReceipt.feedbackProvidedToInitiatingFacility'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'patientIdentification',      title: 'Patient ID' },
  { step: 2, section: 'facilityAndTransport',       title: 'Facility & transport' },
  { step: 3, section: 'situation',                  title: 'Situation' },
  { step: 4, section: 'background',                 title: 'Background' },
  { step: 5, section: 'assessment',                 title: 'Assessment' },
  { step: 6, section: 'recommendations',            title: 'Recommendations' },
  { step: 7, section: 'initiatingProviderSignoff',  title: 'Provider sign-off' },
  { step: 8, section: 'referralFacilityReceipt',    title: 'Receipt' }
];

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7, renderStep8
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
  const result = validateReferral(state);
  const total = result.totalRequired;
  const answered = result.totalSatisfied;
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);

  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) {
    text.textContent = `${answered} of ${total} required fields answered (${percent}%)`;
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

function renderReport() {
  if (!lastResult) return;
  const { validation, flags, timestamp } = lastResult;
  const out = document.getElementById('report');
  if (!out) return;

  const completenessBadge = validation.complete
    ? '<span class="status-badge status-completed">Complete</span>'
    : '<span class="status-badge status-abandoned">Incomplete</span>';

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
    <h2>WHO Acute Referral Form — submission report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

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
  // Trigger Lily-style required-field validation first (visual feedback).
  validateForm();

  // The semantic validator drives report-level completeness regardless.
  const validation = validateReferral(state);
  const flags = detectFlaggedIssues(state);
  lastResult = {
    validation,
    flags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh WHO acute referral form?')) return;
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
