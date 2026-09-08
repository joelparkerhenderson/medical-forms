import { gradeFirstAid } from './first-aid-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { fawRules } from './rules.js';
import { emptyAssessment, outcomeClass, outcomeLabel, triStateLabel, triStatePillClass } from './types.js';

// First Aid Training Checklist — examiner wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order as a Lily <fieldset class="fieldset">. The examiner scrolls
// through them; a native <progress> bar and a clickable step-list at the top
// of the page reflect how many checklist items have been answered.
// Submission runs the pure FAW grading engine and renders an inline report
// with a Pass / Needs Development / Fail badge, critical-skill audit table,
// non-critical deficiency list, and prioritised flagged-issues list. State
// is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'first-aid-training-checklist.front-end-form-with-html.v1';

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
    console.warn('Could not parse saved assessment; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} st */
function saveState(st) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
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

/** @type {import('./types.js').AssessmentData} */
let state = loadState();

/** @type {object | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'first-aid-training-checklist',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const report = document.getElementById('report');
    if (report) {
      report.innerHTML =
        '<p class="empty-message">Submit the checklist to see the report.</p>';
    }
    renderErrorSummary([]);
    renderForm();
    updateProgress();
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
// Component builders
// ----------------------------------------------------------------------

const TOTAL_STEPS = 10;

/**
 * Build a labelled text input with Lily class contract.
 *
 * @param {{ label: string, section: string, field: string, type?: string,
 *           placeholder?: string, required?: boolean, min?: number,
 *           max?: number, step?: number, unit?: string }} opts
 */
function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const type = opts.type || 'text';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
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
    <span class="error-message" id="${id}-error"></span>
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

/**
 * Build a labelled multi-line text area with Lily class contract.
 */
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

/**
 * Build a select / dropdown input with Lily class contract.
 */
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

/**
 * Build a Lily radio-group fieldset (used by general-purpose radios as well
 * as the tri-state checklist items via the `extraClass` hook).
 *
 * @param {{ label: string, section: string, field: string,
 *           options: Array<{ value: string, label: string, optionClass?: string }>,
 *           extraClass?: string }} opts
 */
function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.innerHTML = esc(opts.label);
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-group' + (opts.extraClass ? ' ' + opts.extraClass : '');
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.htmlFor = radioId;
    if (option.optionClass) label.className = option.optionClass;
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

// Tri-state radio options used for every checklist item.
const TRI_STATE_OPTIONS = [
  { value: 'yes', label: 'Demonstrated correctly', optionClass: 'choice-yes' },
  { value: 'no', label: 'Not yet', optionClass: 'choice-no' },
  { value: 'na', label: 'Not assessed', optionClass: 'choice-na' }
];

/**
 * Build a tri-state checklist item: a Lily radio-group with the tri-state
 * options, optionally tagged as critical so it gets the red-left-border
 * emphasis defined in css/style.css.
 *
 * @param {{ ruleId: string, section: string, field: string, label: string,
 *           critical: boolean }} opts
 */
function checklistItem(opts) {
  const li = document.createElement('li');
  li.className = 'checklist-item' + (opts.critical ? ' is-critical' : '');
  if (opts.ruleId) li.dataset.ruleId = opts.ruleId;

  const idBadge = opts.ruleId
    ? `<span class="item-id">${esc(opts.ruleId)}</span> `
    : '';
  const label = idBadge + esc(opts.label);

  const group = radioGroup({
    label,
    section: opts.section,
    field: opts.field,
    options: TRI_STATE_OPTIONS,
    extraClass: 'tri-state'
  });
  li.appendChild(group);
  return li;
}

/**
 * Build a section card as a Lily fieldset.
 *
 * @param {{ stepNumber: number, title: string, description?: string }} opts
 */
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

/**
 * Look up the canonical rule definition by id.
 */
function ruleById(id) {
  return fawRules.find((r) => r.id === id);
}

/**
 * Build a checklist <ul> from rule-registry entries.
 *
 * @param {Array<{ ruleId: string, section: string, field: string }>} entries
 */
function checklist(entries) {
  const ul = document.createElement('ul');
  ul.className = 'checklist';
  for (const entry of entries) {
    const rule = ruleById(entry.ruleId);
    if (!rule) {
      console.warn('Unknown rule id:', entry.ruleId);
      continue;
    }
    ul.appendChild(checklistItem({
      ruleId: rule.id,
      section: entry.section,
      field: entry.field,
      label: rule.label,
      critical: rule.critical
    }));
  }
  return ul;
}

/**
 * Build a checklist <ul> for items not in the rule registry (admin items).
 *
 * @param {Array<{ section: string, field: string, label: string }>} entries
 */
function adminChecklist(entries) {
  const ul = document.createElement('ul');
  ul.className = 'checklist';
  for (const entry of entries) {
    ul.appendChild(checklistItem({
      ruleId: '',
      section: entry.section,
      field: entry.field,
      label: entry.label,
      critical: false
    }));
  }
  return ul;
}

// ----------------------------------------------------------------------
// Section renderers (1 per checklist step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Trainee Details',
    description: 'Identify the trainee and the certification context for this assessment.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First name', section: 'traineeDetails', field: 'firstName' }));
  grid.appendChild(textInput({ label: 'Last name', section: 'traineeDetails', field: 'lastName' }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Trainee ID / employee number',
    section: 'traineeDetails', field: 'traineeId'
  }));

  card.appendChild(selectInput({
    label: 'Role',
    section: 'traineeDetails', field: 'role',
    options: [
      { value: 'first-aider', label: 'First aider (FAW)' },
      { value: 'workplace-first-aider', label: 'Workplace first aider' },
      { value: 'instructor-candidate', label: 'Instructor candidate' },
      { value: 'security-officer', label: 'Security officer' },
      { value: 'lifeguard', label: 'Lifeguard' },
      { value: 'teacher', label: 'Teacher' },
      { value: 'volunteer', label: 'Volunteer' },
      { value: 'other', label: 'Other' }
    ]
  }));

  const dateGrid = document.createElement('div');
  dateGrid.className = 'two-col';
  dateGrid.appendChild(textInput({
    label: 'Prior certification expiry',
    section: 'traineeDetails', field: 'priorCertificationExpiry',
    type: 'date'
  }));
  dateGrid.appendChild(textInput({
    label: 'Session date',
    section: 'traineeDetails', field: 'sessionDate',
    type: 'date'
  }));
  card.appendChild(dateGrid);

  const ctxGrid = document.createElement('div');
  ctxGrid.className = 'two-col';
  ctxGrid.appendChild(textInput({
    label: 'Examiner name',
    section: 'traineeDetails', field: 'examinerName'
  }));
  ctxGrid.appendChild(textInput({
    label: 'Venue',
    section: 'traineeDetails', field: 'venue'
  }));
  card.appendChild(ctxGrid);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Scene Assessment & Safety',
    description: 'Trainee surveys the scene and controls hazards before approaching the casualty.'
  });

  card.appendChild(checklist([
    { ruleId: 'FAW-SS-SAFE', section: 'sceneAssessmentSafety', field: 'sceneSafe' },
    { ruleId: 'FAW-SS-PPE', section: 'sceneAssessmentSafety', field: 'ppeApplied' },
    { ruleId: 'FAW-SS-HAZARDS', section: 'sceneAssessmentSafety', field: 'hazardsIdentified' },
    { ruleId: 'FAW-SS-BYSTANDERS', section: 'sceneAssessmentSafety', field: 'bystandersControlled' }
  ]));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Primary Survey (DRABC)',
    description: 'Danger, Response, Airway, Breathing, Circulation. The Response check is a critical skill.'
  });

  card.appendChild(checklist([
    { ruleId: 'FAW-PS-DANGER', section: 'primarySurveyDRABC', field: 'dangerCheck' },
    { ruleId: 'FAW-PS-RESPONSE', section: 'primarySurveyDRABC', field: 'responseCheck' },
    { ruleId: 'FAW-PS-AIRWAY', section: 'primarySurveyDRABC', field: 'airwayManagement' },
    { ruleId: 'FAW-PS-BREATHING', section: 'primarySurveyDRABC', field: 'breathingCheck' },
    { ruleId: 'FAW-PS-CIRCULATION', section: 'primarySurveyDRABC', field: 'circulationAssessment' },
    { ruleId: 'FAW-PS-RECOVERY', section: 'primarySurveyDRABC', field: 'recoveryPositionWhenAppropriate' }
  ]));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'CPR & AED',
    description: 'Effective compressions, ventilations, and safe AED shock delivery are critical skills.'
  });

  card.appendChild(checklist([
    { ruleId: 'FAW-CPR-COMPRESSIONS', section: 'cprAed', field: 'effectiveCompressions' },
    { ruleId: 'FAW-CPR-VENTILATIONS', section: 'cprAed', field: 'effectiveVentilations' },
    { ruleId: 'FAW-CPR-RATIO', section: 'cprAed', field: 'ratio30to2' },
    { ruleId: 'FAW-AED-POWER', section: 'cprAed', field: 'aedPowerOnPromptly' },
    { ruleId: 'FAW-AED-PADS', section: 'cprAed', field: 'aedPadPlacement' },
    { ruleId: 'FAW-AED-SAFE-SHOCK', section: 'cprAed', field: 'aedSafeShockDelivery' }
  ]));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Choking Management',
    description: 'Encourage coughing, alternate back blows and abdominal thrusts; transition to CPR if unconscious (critical).'
  });

  card.appendChild(checklist([
    { ruleId: 'FAW-CHOKE-COUGH', section: 'chokingManagement', field: 'encouragedCoughing' },
    { ruleId: 'FAW-CHOKE-BACKBLOWS', section: 'chokingManagement', field: 'fiveBackBlows' },
    { ruleId: 'FAW-CHOKE-THRUSTS', section: 'chokingManagement', field: 'fiveAbdominalThrusts' },
    { ruleId: 'FAW-CHOKE-ALTERNATE', section: 'chokingManagement', field: 'alternatesUntilDislodged' },
    { ruleId: 'FAW-CHOKE-UNCONSCIOUS', section: 'chokingManagement', field: 'unconsciousChokingCpr' }
  ]));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Bleeding & Wound Care',
    description: 'Direct pressure for major bleeds and tourniquet for catastrophic haemorrhage are critical skills.'
  });

  card.appendChild(checklist([
    { ruleId: 'FAW-BLEED-PRESSURE', section: 'bleedingWoundCare', field: 'directPressureApplied' },
    { ruleId: 'FAW-BLEED-ELEVATE', section: 'bleedingWoundCare', field: 'elevatedAndImmobilised' },
    { ruleId: 'FAW-BLEED-DRESSING', section: 'bleedingWoundCare', field: 'appliedDressingCorrectly' },
    { ruleId: 'FAW-BLEED-TOURNIQUET', section: 'bleedingWoundCare', field: 'tourniquetWhenIndicated' },
    { ruleId: 'FAW-BLEED-HAEMOSTATIC', section: 'bleedingWoundCare', field: 'haemostaticDressingApplied' },
    { ruleId: 'FAW-BLEED-SHOCK', section: 'bleedingWoundCare', field: 'treatedForShock' }
  ]));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Burns & Scalds',
    description: 'Cool with running water for at least 20 minutes; cover with cling film or sterile dressing.'
  });

  card.appendChild(checklist([
    { ruleId: 'FAW-BURN-COOL', section: 'burnsScalds', field: 'cooledForTwentyMinutes' },
    { ruleId: 'FAW-BURN-REMOVE', section: 'burnsScalds', field: 'removedJewelleryAndLooseClothing' },
    { ruleId: 'FAW-BURN-COVER', section: 'burnsScalds', field: 'coveredWithClingFilmOrSterileDressing' },
    { ruleId: 'FAW-BURN-NOCREAM', section: 'burnsScalds', field: 'avoidedCreamsOrIce' },
    { ruleId: 'FAW-BURN-REFER', section: 'burnsScalds', field: 'referredAppropriately' }
  ]));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Fractures, Sprains & Spinal Injury',
    description: 'Immobilise in position found, support the head and neck for suspected spinal injury.'
  });

  card.appendChild(checklist([
    { ruleId: 'FAW-FX-IMMOB', section: 'fracturesSprainsSpinal', field: 'immobilisedInjuredLimb' },
    { ruleId: 'FAW-FX-RICE', section: 'fracturesSprainsSpinal', field: 'appliedRiceForSprains' },
    { ruleId: 'FAW-FX-SPINAL-SUPPORT', section: 'fracturesSprainsSpinal', field: 'suspectedSpinalManualSupport' },
    { ruleId: 'FAW-FX-LOGROLL', section: 'fracturesSprainsSpinal', field: 'performedLogRollWithTeam' },
    { ruleId: 'FAW-FX-NOMOVE', section: 'fracturesSprainsSpinal', field: 'avoidedUnnecessaryMovement' }
  ]));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Medical Emergencies',
    description: 'Anaphylaxis recognition is a critical skill. FAST stroke recognition and chest pain management included.'
  });

  card.appendChild(checklist([
    { ruleId: 'FAW-MED-ANAPHYLAXIS', section: 'medicalEmergencies', field: 'recognisedAnaphylaxis' },
    { ruleId: 'FAW-MED-EPIPEN', section: 'medicalEmergencies', field: 'administeredEpiPenSafely' },
    { ruleId: 'FAW-MED-ASTHMA', section: 'medicalEmergencies', field: 'assistedAsthmaInhaler' },
    { ruleId: 'FAW-MED-HYPO', section: 'medicalEmergencies', field: 'managedHypoglycaemia' },
    { ruleId: 'FAW-MED-SEIZURE', section: 'medicalEmergencies', field: 'managedSeizureSafely' },
    { ruleId: 'FAW-MED-STROKE', section: 'medicalEmergencies', field: 'recognisedStrokeFAST' },
    { ruleId: 'FAW-MED-CHEST-PAIN', section: 'medicalEmergencies', field: 'recognisedChestPain' }
  ]));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Recording, Reporting & Handover',
    description: 'Documentation, RIDDOR awareness, structured SBAR handoff, and post-event debrief notes.'
  });

  // Administrative tri-state items (not in rule registry — not graded, but
  // tracked for progress and rendered with the same UI for consistency).
  card.appendChild(adminChecklist([
    {
      section: 'recordingReportingHandover', field: 'accidentBookEntry',
      label: 'Completes a clear and accurate accident-book entry.'
    },
    {
      section: 'recordingReportingHandover', field: 'riddorAwareness',
      label: 'Demonstrates awareness of RIDDOR reporting obligations.'
    },
    {
      section: 'recordingReportingHandover', field: 'structuredHandoffSbar',
      label: 'Provides a structured SBAR handover to ambulance / next clinician.'
    },
    {
      section: 'recordingReportingHandover', field: 'confidentialityMaintained',
      label: 'Maintains casualty confidentiality and data protection throughout.'
    }
  ]));

  card.appendChild(textArea({
    label: 'Examiner notes',
    section: 'recordingReportingHandover', field: 'examinerNotes',
    placeholder: 'Strengths, deficiencies, coaching focus for next session…',
    rows: 4
  }));
  card.appendChild(textArea({
    label: 'Trainee self-feedback',
    section: 'recordingReportingHandover', field: 'traineeFeedback',
    placeholder: 'Trainee\u2019s reflections after the scenario…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Debrief notes',
    section: 'recordingReportingHandover', field: 'debriefNotes',
    placeholder: 'Structured debrief notes for the training file…',
    rows: 3
  }));

  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
  renderStep6, renderStep7, renderStep8, renderStep9, renderStep10
];

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'traineeDetails',             title: 'Trainee Details' },
  { step: 2,  section: 'sceneAssessmentSafety',      title: 'Scene & Safety' },
  { step: 3,  section: 'primarySurveyDRABC',         title: 'Primary Survey' },
  { step: 4,  section: 'cprAed',                     title: 'CPR & AED' },
  { step: 5,  section: 'chokingManagement',          title: 'Choking' },
  { step: 6,  section: 'bleedingWoundCare',          title: 'Bleeding' },
  { step: 7,  section: 'burnsScalds',                title: 'Burns' },
  { step: 8,  section: 'fracturesSprainsSpinal',     title: 'Fractures / Spinal' },
  { step: 9,  section: 'medicalEmergencies',         title: 'Medical Emergencies' },
  { step: 10, section: 'recordingReportingHandover', title: 'Recording & Handover' }
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
      ${errors.map((e) =>
        `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`
      ).join('')}
    </ul>
  `;
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

/**
 * Tri-state checklist fields tracked for progress, grouped by section so
 * the step-list can show per-section completion.
 *
 * Trainee-detail text fields (step 1) are intentionally excluded so the
 * progress bar reflects the skills assessment, not the paperwork.
 */
const TRACKED_SECTIONS = [
  ['traineeDetails', ['firstName', 'lastName', 'traineeId', 'role',
                      'sessionDate', 'examinerName']],
  ['sceneAssessmentSafety', ['sceneSafe', 'ppeApplied', 'hazardsIdentified',
                              'bystandersControlled']],
  ['primarySurveyDRABC', ['dangerCheck', 'responseCheck', 'airwayManagement',
                           'breathingCheck', 'circulationAssessment',
                           'recoveryPositionWhenAppropriate']],
  ['cprAed', ['effectiveCompressions', 'effectiveVentilations', 'ratio30to2',
              'aedPowerOnPromptly', 'aedPadPlacement', 'aedSafeShockDelivery']],
  ['chokingManagement', ['encouragedCoughing', 'fiveBackBlows',
                          'fiveAbdominalThrusts', 'alternatesUntilDislodged',
                          'unconsciousChokingCpr']],
  ['bleedingWoundCare', ['directPressureApplied', 'elevatedAndImmobilised',
                          'appliedDressingCorrectly', 'tourniquetWhenIndicated',
                          'haemostaticDressingApplied', 'treatedForShock']],
  ['burnsScalds', ['cooledForTwentyMinutes', 'removedJewelleryAndLooseClothing',
                    'coveredWithClingFilmOrSterileDressing', 'avoidedCreamsOrIce',
                    'referredAppropriately']],
  ['fracturesSprainsSpinal', ['immobilisedInjuredLimb', 'appliedRiceForSprains',
                               'suspectedSpinalManualSupport',
                               'performedLogRollWithTeam',
                               'avoidedUnnecessaryMovement']],
  ['medicalEmergencies', ['recognisedAnaphylaxis', 'administeredEpiPenSafely',
                           'assistedAsthmaInhaler', 'managedHypoglycaemia',
                           'managedSeizureSafely', 'recognisedStrokeFAST',
                           'recognisedChestPain']],
  ['recordingReportingHandover', ['accidentBookEntry', 'riddorAwareness',
                                    'structuredHandoffSbar',
                                    'confidentialityMaintained']]
];

function updateProgress() {
  let answered = 0;
  let total = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, fields] of TRACKED_SECTIONS) {
    sectionTotal[section] = fields.length;
    sectionAnswered[section] = 0;
    for (const field of fields) {
      total++;
      const v = state[section][field];
      if (v !== null && v !== undefined && v !== '') {
        answered++;
        sectionAnswered[section]++;
      }
    }
  }
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} items assessed (${percent}%)`;
  updateStepListStatuses(sectionAnswered, sectionTotal);
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
    outcome,
    criticalFailures,
    deficiencies,
    firedRules,
    additionalFlags,
    answeredCount,
    totalRules,
    timestamp
  } = lastResult;

  // Critical-skill audit table — show every critical rule and its status.
  const criticalRules = firedRules.filter((r) => r.critical);
  const auditRows = criticalRules.map((r) => {
    const rowCls = r.status === 'no'
      ? 'critical-fail'
      : (r.status === 'yes' ? 'critical-pass' : '');
    return `
      <tr class="${rowCls}">
        <th scope="row">${esc(r.id)}</th>
        <td>${esc(r.category)}</td>
        <td>${esc(r.description)}</td>
        <td class="status">
          <span class="status-pill ${triStatePillClass(r.status)}">${esc(triStateLabel(r.status))}</span>
        </td>
      </tr>
    `;
  }).join('');

  const auditTable = `
    <table class="audit">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Category</th>
          <th scope="col">Critical skill</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>${auditRows}</tbody>
    </table>
  `;

  // Non-critical deficiencies summary
  const defList = deficiencies.length === 0
    ? `<p class="muted">No non-critical deficiencies recorded.</p>`
    : `
      <ul class="checklist" style="gap:0.375rem;">
        ${deficiencies.map((r) => `
          <li class="checklist-item">
            <span class="item-label">
              <span class="item-id">${esc(r.id)}</span>
              ${esc(r.description)}
            </span>
            <span class="muted">${esc(r.category)} (Section ${r.step})</span>
          </li>
        `).join('')}
      </ul>
    `;

  // Flagged-issues list
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

  // Outcome summary line
  let summaryText = '';
  if (outcome === 'pass') {
    summaryText = `All critical skills demonstrated; no non-critical deficiencies.`;
  } else if (outcome === 'needs-development') {
    summaryText = `${deficiencies.length} non-critical deficiency(ies) — targeted retraining recommended.`;
  } else if (criticalFailures.length > 0) {
    summaryText = `${criticalFailures.length} critical-skill failure(s) — automatic Fail.`;
  } else if (deficiencies.length > 2) {
    summaryText = `${deficiencies.length} non-critical deficiencies (limit is 2) — Fail.`;
  } else {
    summaryText = 'Insufficient items assessed to grade — please complete the checklist.';
  }

  const trainee = state.traineeDetails;
  const traineeName = `${trainee.firstName} ${trainee.lastName}`.trim();

  out.innerHTML = `
    <h2>First Aid at Work Competency Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}${
      traineeName ? ` for ${esc(traineeName)}` : ''
    }${trainee.examinerName ? ` · examiner: ${esc(trainee.examinerName)}` : ''}</p>

    <h3>Outcome</h3>
    <p class="outcome-summary">
      <span class="outcome-badge ${outcomeClass(outcome)}">${esc(outcomeLabel(outcome) || '—')}</span>
      <span class="outcome-detail">${esc(summaryText)}</span>
    </p>
    <p class="muted">Based on ${answeredCount} of ${totalRules} graded checklist items recorded.</p>

    <h3>Critical-skill audit</h3>
    ${auditTable}

    <h3>Non-critical deficiencies</h3>
    ${defList}

    <h3>Flagged issues</h3>
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
  const grading = gradeFirstAid(state);
  const additionalFlags = detectAdditionalFlags(state, grading);
  lastResult = {
    outcome: grading.outcome,
    criticalFailures: grading.criticalFailures,
    deficiencies: grading.deficiencies,
    firedRules: grading.firedRules,
    additionalFlags,
    answeredCount: grading.answeredCount,
    totalRules: grading.totalRules,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Are you sure? This will clear all answers and start a fresh competency assessment.')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const report = document.getElementById('report');
  if (report) {
    report.innerHTML =
      '<p class="empty-message">Submit the checklist to see the report.</p>';
  }
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
  host.innerHTML = '';
  for (const renderer of STEP_RENDERERS) host.appendChild(renderer());
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();

  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) submitBtn.addEventListener('click', submitForm);
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) resetBtn.addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
