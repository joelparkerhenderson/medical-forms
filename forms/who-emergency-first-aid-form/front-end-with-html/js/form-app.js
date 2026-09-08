import { validateCfar } from './cfar-validator.js';
import { detectFlaggedIssues } from './flagged-issues.js';
import { calculateAge, emptyAssessment, hasText, priorityLabel, sectionLabel } from './types.js';

// Single-page continuous wizard: every section is rendered in document
// order as a Lily `<fieldset class="fieldset">`. Each CABCDE category
// (steps 5–10) pairs an Assessment block with an Intervention block;
// major bleeding (C) is intentionally placed before
// airway/breathing/circulation/disability/exposure as the catastrophic
// haemorrhage step. Submission runs the pure validator + flagged-issues
// engine and renders an inline report. State is persisted to localStorage
// so a partial fill survives a page reload.

const TOTAL_STEPS = 12;

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'who-emergency-first-aid-form.front-end-form-with-html.v1';

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
    console.warn('Could not parse saved WHO emergency first aid form; starting fresh.', e);
    return emptyAssessment();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save WHO emergency first aid form to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored WHO emergency first aid form.', e);
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
  slug: 'who-emergency-first-aid-form',
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

function getPath(path) {
  const parts = path.split('.');
  let cur = state;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function setPath(path, value, opts) {
  const parts = path.split('.');
  let cur = state;
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
  cur[parts[parts.length - 1]] = value;
  saveState();
  if (opts && opts.rerender) {
    renderForm();
  }
  updateProgress();
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pathId(path) {
  return `f-${path.replace(/\./g, '-')}`;
}

// ----------------------------------------------------------------------
// Component builders (Lily HTML headless contract)
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

function textInput(opts) {
  const id = pathId(opts.path);
  const value = getPath(opts.path) == null ? '' : getPath(opts.path);
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const placeholderAttr = opts.placeholder
    ? ` placeholder="${esc(opts.placeholder)}"`
    : '';
  const requiredAttrs = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input id="${id}" name="${id}" type="${type}"
      class="${lilyInputClass(type)}"
      value="${esc(value)}"${placeholderAttr}${requiredAttrs}
      aria-describedby="${id}-error">
    <span class="error-message" id="${id}-error"></span>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    const parts = opts.path.split('.');
    let cur = state;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    cur[parts[parts.length - 1]] = input.value;
    if (opts.path === 'patientIdentification.dateOfBirth') {
      state.patientIdentification.age = calculateAge(input.value);
    }
    saveState();
    updateProgress();
    clearFieldError(id);
    if (opts.path === 'patientIdentification.dateOfBirth') {
      const ageEl = document.getElementById('f-patientIdentification-age-display');
      if (ageEl) {
        const a = state.patientIdentification.age;
        ageEl.textContent = a == null ? '' : `${a} years`;
      }
    }
  });
  return wrapper;
}

function textArea(opts) {
  const id = pathId(opts.path);
  const value = getPath(opts.path) == null ? '' : getPath(opts.path);
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const placeholderAttr = opts.placeholder
    ? ` placeholder="${esc(opts.placeholder)}"`
    : '';
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
    const parts = opts.path.split('.');
    let cur = state;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    cur[parts[parts.length - 1]] = ta.value;
    saveState();
    updateProgress();
    clearFieldError(id);
  });
  return wrapper;
}

function radioGroup(opts) {
  const groupId = pathId(opts.path);
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
  if (opts.required) {
    list.setAttribute('data-required-group', groupId);
  }
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

function checkbox(opts) {
  const id = pathId(opts.path);
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
    setPath(opts.path, input.checked, opts.rerender ? { rerender: true } : undefined);
  });
  return wrapper;
}

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

// ----------------------------------------------------------------------
// CABCDE block helpers
// ----------------------------------------------------------------------

/**
 * Build the assessment sub-block (Normal checkbox + findings textarea).
 * @param {{ key: string, normalLabel: string, findingsLabel: string,
 *           findingsPlaceholder?: string }} opts
 */
function assessmentBlock(opts) {
  const block = document.createElement('div');
  block.className = 'inset-block';
  const h = document.createElement('h4');
  h.textContent = 'Assessment';
  block.appendChild(h);
  block.appendChild(checkbox({
    label: opts.normalLabel,
    path: `${opts.key}.assessmentNormal`
  }));
  block.appendChild(textArea({
    label: opts.findingsLabel,
    path: `${opts.key}.assessmentFindings`,
    rows: 3,
    placeholder: opts.findingsPlaceholder
  }));
  return block;
}

/**
 * Build the intervention sub-block: list of intervention checkboxes.
 * @param {{ key: string, items: { label: string, prop: string }[] }} opts
 */
function interventionBlock(opts) {
  const block = document.createElement('div');
  block.className = 'inset-block';
  const h = document.createElement('h4');
  h.textContent = 'Intervention';
  block.appendChild(h);
  const list = document.createElement('div');
  list.className = 'intervention-list';
  for (const item of opts.items) {
    list.appendChild(checkbox({
      label: item.label,
      path: `${opts.key}.interventions.${item.prop}`
    }));
  }
  block.appendChild(list);
  return block;
}

// ----------------------------------------------------------------------
// Section renderers — one per step
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Patient Identification',
    description: 'Name the patient and at least one contact person who can be reached on their behalf.'
  });
  card.appendChild(textInput({
    label: 'Patient name (LAST, First)',
    path: 'patientIdentification.patientName',
    placeholder: 'e.g. SMITH, John',
    required: true
  }));

  const dobField = textInput({
    label: 'Date of birth',
    path: 'patientIdentification.dateOfBirth',
    type: 'date'
  });
  // age display
  const ageWrap = document.createElement('div');
  ageWrap.className = 'field';
  const ageVal = state.patientIdentification.age == null
    ? ''
    : `${state.patientIdentification.age} years`;
  ageWrap.innerHTML = `
    <label class="label">Calculated age</label>
    <div id="f-patientIdentification-age-display"
      class="text-input" style="background:#f3f4f6;">${esc(ageVal)}</div>
  `;
  card.appendChild(twoCol(dobField, ageWrap));

  card.appendChild(radioGroup({
    label: 'Sex',
    path: 'patientIdentification.sex',
    options: SEX_OPTIONS,
    required: true
  }));
  card.appendChild(textInput({
    label: 'Patient contact information (phone, address)',
    path: 'patientIdentification.patientContactInformation'
  }));

  const ecHeader = document.createElement('h3');
  ecHeader.className = 'subsection-heading';
  ecHeader.textContent = 'Contact person';
  card.appendChild(ecHeader);

  card.appendChild(twoCol(
    textInput({
      label: 'Contact person name',
      path: 'patientIdentification.contactPerson.name'
    }),
    textInput({
      label: 'Contact person phone / details',
      path: 'patientIdentification.contactPerson.contactInformation'
    })
  ));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Referral & Transport',
    description: 'Identify the receiving facility and the ambulance / transport team, and record the times.'
  });

  const refHeader = document.createElement('h3');
  refHeader.className = 'subsection-heading';
  refHeader.textContent = 'Referral facility';
  card.appendChild(refHeader);

  card.appendChild(textInput({
    label: 'Referral facility name',
    path: 'referralTransport.referralFacility.name',
    required: true
  }));
  card.appendChild(twoCol(
    textInput({
      label: 'Focal point (contact person)',
      path: 'referralTransport.referralFacility.focalPoint'
    }),
    textInput({
      label: 'Phone number',
      path: 'referralTransport.referralFacility.phoneNumber',
      type: 'tel'
    })
  ));

  const ambHeader = document.createElement('h3');
  ambHeader.className = 'subsection-heading';
  ambHeader.textContent = 'Ambulance service';
  card.appendChild(ambHeader);

  card.appendChild(textInput({
    label: 'Ambulance service / vehicle',
    path: 'referralTransport.ambulance.name'
  }));
  card.appendChild(twoCol(
    textInput({
      label: 'Focal point',
      path: 'referralTransport.ambulance.focalPoint'
    }),
    textInput({
      label: 'Phone number',
      path: 'referralTransport.ambulance.phoneNumber',
      type: 'tel'
    })
  ));

  const timeHeader = document.createElement('h3');
  timeHeader.className = 'subsection-heading';
  timeHeader.textContent = 'Times';
  card.appendChild(timeHeader);

  card.appendChild(twoCol(
    textInput({
      label: 'Date/time of event',
      path: 'referralTransport.eventDateTime',
      type: 'datetime-local',
      required: true
    }),
    textInput({
      label: 'Date/time of departure from scene',
      path: 'referralTransport.departureDateTime',
      type: 'datetime-local',
      required: true
    })
  ));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Situation',
    description: 'Briefly describe what happened. Tick whether the problem is medical, trauma, or both.'
  });

  const typeHeader = document.createElement('h3');
  typeHeader.className = 'subsection-heading';
  typeHeader.textContent = 'Problem type';
  card.appendChild(typeHeader);

  const typeNote = document.createElement('p');
  typeNote.className = 'subsection-note';
  typeNote.innerHTML = 'At least one of Medical or Trauma must be selected. <span class="req" aria-hidden="true">*</span>';
  card.appendChild(typeNote);

  const list = document.createElement('div');
  list.className = 'checkbox-group';
  list.setAttribute('role', 'group');
  list.appendChild(checkbox({ label: 'Medical', path: 'situation.medical' }));
  list.appendChild(checkbox({ label: 'Trauma', path: 'situation.trauma' }));
  card.appendChild(list);

  card.appendChild(radioGroup({
    label: 'Pregnant?',
    path: 'situation.pregnant',
    options: YES_NO_UNKNOWN,
    required: true
  }));
  card.appendChild(textArea({
    label: 'What happened to the patient?',
    path: 'situation.whatHappened',
    rows: 4,
    required: true,
    placeholder: 'e.g. Fall from 2-metre ladder onto concrete; LOC unclear; complained of right hip pain.'
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Background',
    description: 'Briefly note past medical/surgical history and current medications or allergies. Write "None" if there is nothing relevant to record.'
  });
  card.appendChild(textArea({
    label: 'Past medical and surgical history',
    path: 'background.pastMedicalAndSurgicalHistory',
    rows: 3,
    required: true,
    placeholder: 'e.g. Hypertension, appendectomy 2018'
  }));
  card.appendChild(textArea({
    label: 'Current medications or allergies',
    path: 'background.currentMedicationsOrAllergies',
    rows: 3,
    required: true,
    placeholder: 'e.g. Atenolol 50 mg daily; allergic to penicillin'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'C — Major Bleeding',
    description: 'Catastrophic haemorrhage assessment and intervention. Always assess major bleeding before airway/breathing.',
    extraClass: 'cabcde-major-bleeding'
  });

  card.appendChild(assessmentBlock({
    key: 'majorBleeding',
    normalLabel: 'Normal — no major bleeding observed',
    findingsLabel: 'Findings (describe location, severity, mechanism)',
    findingsPlaceholder: 'e.g. Pulsatile bleeding from right thigh wound, ~500 ml lost.'
  }));

  // Intervention block (with conditional tourniquet time)
  const interv = document.createElement('div');
  interv.className = 'inset-block';
  const h = document.createElement('h4');
  h.textContent = 'Intervention';
  interv.appendChild(h);

  const list = document.createElement('div');
  list.className = 'intervention-list';
  list.appendChild(checkbox({
    label: 'Direct Pressure',
    path: 'majorBleeding.interventions.directPressure'
  }));
  list.appendChild(checkbox({
    label: 'Deep Wound Packing',
    path: 'majorBleeding.interventions.deepWoundPacking'
  }));
  list.appendChild(checkbox({
    label: 'Tourniquet (ONLY if life-threatening bleeding)',
    path: 'majorBleeding.interventions.tourniquet',
    rerender: true
  }));
  list.appendChild(checkbox({
    label: 'Uterine Massage',
    path: 'majorBleeding.interventions.uterineMassage'
  }));
  list.appendChild(checkbox({
    label: 'None',
    path: 'majorBleeding.interventions.none'
  }));
  interv.appendChild(list);

  if (state.majorBleeding.interventions.tourniquet) {
    const tWrap = document.createElement('div');
    tWrap.className = 'tourniquet-time-block';
    tWrap.appendChild(textInput({
      label: 'Time of tourniquet application',
      path: 'majorBleeding.interventions.tourniquetApplicationTime',
      type: 'time',
      required: true
    }));
    interv.appendChild(tWrap);
  }
  card.appendChild(interv);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'A — Airway',
    description: 'Airway assessment and intervention.',
    extraClass: 'cabcde-airway'
  });
  card.appendChild(assessmentBlock({
    key: 'airway',
    normalLabel: 'Normal — airway patent',
    findingsLabel: 'Findings (e.g. obstruction, gurgling, stridor)',
    findingsPlaceholder: 'Describe airway compromise.'
  }));
  card.appendChild(interventionBlock({
    key: 'airway',
    items: [
      { prop: 'neckImmobilization', label: 'Neck Immobilization' },
      { prop: 'headTiltChinLift', label: 'Head-Tilt Chin-Lift' },
      { prop: 'jawThrust', label: 'Jaw Thrust' },
      { prop: 'chokingCare', label: 'Choking Care' },
      { prop: 'none', label: 'None' }
    ]
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'B — Breathing',
    description: 'Breathing assessment and intervention.',
    extraClass: 'cabcde-breathing'
  });
  card.appendChild(assessmentBlock({
    key: 'breathing',
    normalLabel: 'Normal — adequate spontaneous breathing',
    findingsLabel: 'Findings (rate, effort, symmetry)',
    findingsPlaceholder: 'e.g. RR 32, accessory muscle use, no air entry on right.'
  }));
  card.appendChild(interventionBlock({
    key: 'breathing',
    items: [
      { prop: 'maintainedPositionOfComfort', label: 'Maintained position of patient comfort' },
      { prop: 'none', label: 'None' }
    ]
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'C — Circulation',
    description: 'Circulation assessment and intervention.',
    extraClass: 'cabcde-circulation'
  });
  card.appendChild(assessmentBlock({
    key: 'circulation',
    normalLabel: 'Normal — perfusion adequate',
    findingsLabel: 'Findings (pulse, skin colour, capillary refill, hydration)',
    findingsPlaceholder: 'e.g. Weak rapid radial pulse, cool clammy skin, CR > 3 s.'
  }));
  card.appendChild(interventionBlock({
    key: 'circulation',
    items: [
      { prop: 'pelvicBinder', label: 'Pelvic Binder' },
      { prop: 'controlMinorBleeding', label: 'Control minor bleeding' },
      { prop: 'fractureCare', label: 'Fracture Care' },
      { prop: 'oralHydration', label: 'Oral Hydration' },
      { prop: 'leftLateralPosition', label: 'Left-lateral position' },
      { prop: 'none', label: 'None' }
    ]
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'D — Disability (neurologic)',
    description: 'Disability assessment and intervention.',
    extraClass: 'cabcde-disability'
  });
  card.appendChild(assessmentBlock({
    key: 'disability',
    normalLabel: 'Normal — alert, oriented, no deficit',
    findingsLabel: 'Findings (AVPU, GCS, focal deficits, glucose if known)',
    findingsPlaceholder: 'e.g. Responds to pain only; right-sided weakness.'
  }));
  card.appendChild(interventionBlock({
    key: 'disability',
    items: [
      { prop: 'spinalImmobilisation', label: 'Spinal Immobilisation' },
      { prop: 'glucoseGiven', label: 'Glucose Given' },
      { prop: 'seizureCare', label: 'Seizure Care' },
      { prop: 'highTemperatureCare', label: 'High Temperature Care' },
      { prop: 'lowTemperatureCare', label: 'Low Temperature Care' },
      { prop: 'none', label: 'None' }
    ]
  }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'E — Exposure / Other',
    description: 'Exposure assessment, intervention, and any medication taken by the patient.',
    extraClass: 'cabcde-exposure'
  });
  card.appendChild(assessmentBlock({
    key: 'exposure',
    normalLabel: 'Normal — no exposure-related findings',
    findingsLabel: 'Findings (e.g. burns, environmental exposure, wounds, bite)',
    findingsPlaceholder: 'Describe exposure-related findings.'
  }));
  card.appendChild(interventionBlock({
    key: 'exposure',
    items: [
      { prop: 'recoveryPosition', label: 'Recovery Position' },
      { prop: 'burnCare', label: 'Burn Care' },
      { prop: 'woundCare', label: 'Wound Care' },
      { prop: 'drowningCare', label: 'Drowning Care' },
      { prop: 'snakebiteCare', label: 'Snakebite Care' },
      { prop: 'none', label: 'None' }
    ]
  }));

  const medHeader = document.createElement('h3');
  medHeader.className = 'subsection-heading';
  medHeader.textContent = 'Any medication taken?';
  card.appendChild(medHeader);
  card.appendChild(checkbox({
    label: 'None',
    path: 'exposure.medicationTakenNone'
  }));
  card.appendChild(textArea({
    label: 'Describe medications taken (name, dose, time)',
    path: 'exposure.medicationTakenDetails',
    rows: 3,
    placeholder: 'e.g. Paracetamol 1 g 30 min ago.'
  }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Recommendations',
    description: 'Transport plan, anticipated problems, and any precautions for the receiving facility.'
  });
  card.appendChild(textArea({
    label: 'Next steps in the transport plan',
    path: 'recommendations.transportPlan',
    rows: 3,
    required: true,
    placeholder: 'e.g. Continue manual airway support; transport supine, head-up 30°; reassess every 5 min.'
  }));
  card.appendChild(textArea({
    label: 'Problems anticipated during transport',
    path: 'recommendations.problemsAnticipated',
    rows: 3,
    placeholder: 'Anticipated complications and how to recognise/manage them.'
  }));
  card.appendChild(textArea({
    label: 'Other concerns',
    path: 'recommendations.otherConcerns',
    rows: 2,
    placeholder: 'Any other handover information.'
  }));

  const precHeader = document.createElement('h3');
  precHeader.className = 'subsection-heading';
  precHeader.textContent = 'Precautions';
  card.appendChild(precHeader);

  const precNote = document.createElement('p');
  precNote.className = 'subsection-note';
  precNote.textContent = 'Tick any precautions that apply during transport and on arrival.';
  card.appendChild(precNote);

  const precWrap = document.createElement('div');
  precWrap.className = 'checkbox-group precaution-list';
  precWrap.setAttribute('role', 'group');
  precWrap.appendChild(checkbox({
    label: 'Highly infectious disease',
    path: 'recommendations.precautions.highlyInfectiousDisease'
  }));
  precWrap.appendChild(checkbox({
    label: 'Spinal immobilization',
    path: 'recommendations.precautions.spinalImmobilization'
  }));
  precWrap.appendChild(checkbox({
    label: 'Possible fracture',
    path: 'recommendations.precautions.possibleFracture'
  }));
  precWrap.appendChild(checkbox({
    label: 'Fall risk',
    path: 'recommendations.precautions.fallRisk'
  }));
  precWrap.appendChild(checkbox({
    label: 'Altered mental status',
    path: 'recommendations.precautions.alteredMentalStatus'
  }));
  precWrap.appendChild(checkbox({
    label: 'Other',
    path: 'recommendations.precautions.other',
    rerender: true
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

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Responder Details (CFAR)',
    description: 'The Community First Aid Responder completes this section so the receiving team can follow up.'
  });
  card.appendChild(textInput({
    label: 'Responder name',
    path: 'responderDetails.name',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Signature (typed full name)',
    path: 'responderDetails.signature',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Contact information (phone / radio)',
    path: 'responderDetails.contactInformation',
    required: true
  }));
  card.appendChild(textInput({
    label: 'CFAR organization',
    path: 'responderDetails.cfarOrganization',
    required: true,
    placeholder: 'e.g. Red Crescent — District 4 team'
  }));
  return card;
}

// ----------------------------------------------------------------------
// Step definitions, step list, and progress
// ----------------------------------------------------------------------

const RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7, renderStep8,
  renderStep9, renderStep10, renderStep11, renderStep12
];

const STEP_DEFINITIONS = [
  { step: 1,  section: 'patientIdentification', title: 'Patient ID' },
  { step: 2,  section: 'referralTransport',     title: 'Referral & Transport' },
  { step: 3,  section: 'situation',             title: 'Situation' },
  { step: 4,  section: 'background',            title: 'Background' },
  { step: 5,  section: 'majorBleeding',         title: 'C — Major Bleeding' },
  { step: 6,  section: 'airway',                title: 'A — Airway' },
  { step: 7,  section: 'breathing',             title: 'B — Breathing' },
  { step: 8,  section: 'circulation',           title: 'C — Circulation' },
  { step: 9,  section: 'disability',            title: 'D — Disability' },
  { step: 10, section: 'exposure',              title: 'E — Exposure' },
  { step: 11, section: 'recommendations',       title: 'Recommendations' },
  { step: 12, section: 'responderDetails',      title: 'Responder' }
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
  const result = validateCfar(state);
  const total = result.totalRequired;
  const answered = result.totalSatisfied;
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);

  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;

  const text = document.getElementById('progress-text');
  if (text) {
    text.textContent =
      `${answered} of ${total} required fields answered (${percent}%)`;
  }

  // Build per-section completeness map from validation result.
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const s of result.sections) {
    sectionAnswered[s.section] = s.satisfied;
    sectionTotal[s.section] = s.required;
  }
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
    if (t > 0 && a >= t) {
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
// Validation (page-level)
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

/**
 * Walk the DOM for required inputs and required radio groups. Returns
 * an `errors` array suitable for renderErrorSummary().
 */
function validateForm() {
  const errors = [];
  const form = document.getElementById('assessment-form');
  if (!form) return errors;

  // Scalar inputs and textareas with data-required.
  const required = form.querySelectorAll('input[data-required], textarea[data-required]');
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

  // Required radio groups: at least one radio must be checked.
  const radioGroups = form.querySelectorAll('[data-required-group]');
  radioGroups.forEach((group) => {
    const groupId = group.getAttribute('data-required-group');
    const checked = group.querySelector('input[type="radio"]:checked');
    if (!checked) {
      const fieldset = group.closest('fieldset');
      const legend = fieldset ? fieldset.querySelector('legend') : null;
      const label = legend
        ? legend.textContent.replace(/\s*\*\s*$/, '').trim()
        : groupId;
      errors.push({ id: groupId, message: `${label} is required` });
      setFieldError(groupId, `${label} is required`);
    } else {
      clearFieldError(groupId);
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
      <h2>WHO Emergency First Aid Form — submission report</h2>
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

  const validation = validateCfar(state);
  const flags = detectFlaggedIssues(state);
  lastResult = {
    validation,
    flags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh WHO emergency first aid form?')) return;
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

// Expose a small debug surface (does not leak state itself).
export const _getState = () => state;
export const _submitForm = submitForm;
