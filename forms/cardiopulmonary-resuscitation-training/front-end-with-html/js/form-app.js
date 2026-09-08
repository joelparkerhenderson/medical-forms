import { gradeBLS } from './bls-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { blsRules } from './rules.js';
import { COMPRESSION_DEPTH_MAX, COMPRESSION_DEPTH_MIN, COMPRESSION_RATE_MAX, COMPRESSION_RATE_MIN, compressionDepthInRange, compressionRateInRange, emptyAssessment, outcomeClass, outcomeLabel, triStateLabel, triStatePillClass } from './types.js';

// Cardiopulmonary Resuscitation Training — examiner wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order as a Lily <fieldset class="fieldset">. The examiner scrolls
// through them; a native <progress> bar and a clickable step-list at the top
// of the page reflect how many checklist items have been answered.
// Submission runs the pure BLS grading engine and renders an inline report
// with a Pass/Fail badge, critical-action audit table, non-critical
// deficiency list, and prioritised flagged-issues list. State is persisted
// to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'cardiopulmonary-resuscitation-training.front-end-form-with-html.v1';

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
  slug: 'cardiopulmonary-resuscitation-training',
  hadDraftAtLoad,
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
    refreshNumericReadouts();
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
  refreshNumericReadouts();
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

const TOTAL_STEPS = 8;

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
 * Look up the canonical rule definition by id (so checklist rendering
 * stays in sync with the grader's rule registry).
 */
function ruleById(id) {
  return blsRules.find((r) => r.id === id);
}

/** Build a checklist <ul> hosting the listed rule IDs.
 *  Items are created from the rule registry so that label, critical flag,
 *  and rule id all match the grader. The (section,field) tuple is passed
 *  separately because rules read state via section/field.
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

// ----------------------------------------------------------------------
// Numeric metric helpers (compression rate / depth)
// ----------------------------------------------------------------------

function rateRangeReadout(rate, id) {
  const idAttr = id ? ` id="${id}"` : '';
  if (rate === null || rate === undefined || rate === '') {
    return `<p${idAttr} class="metric-target">AHA target: ${COMPRESSION_RATE_MIN}-${COMPRESSION_RATE_MAX} compressions per minute.</p>`;
  }
  const ok = compressionRateInRange(rate);
  const cls = ok ? 'in-range' : 'out-of-range';
  const msg = ok
    ? `Within AHA target (${COMPRESSION_RATE_MIN}-${COMPRESSION_RATE_MAX}/min).`
    : `Outside AHA target ${COMPRESSION_RATE_MIN}-${COMPRESSION_RATE_MAX}/min — coach toward target rate.`;
  return `<p${idAttr} class="metric-target ${cls}">${msg}</p>`;
}

function depthRangeReadout(depth, id) {
  const idAttr = id ? ` id="${id}"` : '';
  if (depth === null || depth === undefined || depth === '') {
    return `<p${idAttr} class="metric-target">AHA target: ${COMPRESSION_DEPTH_MIN}-${COMPRESSION_DEPTH_MAX} cm for an adult.</p>`;
  }
  const ok = compressionDepthInRange(depth);
  const cls = ok ? 'in-range' : 'out-of-range';
  const msg = ok
    ? `Within AHA target (${COMPRESSION_DEPTH_MIN}-${COMPRESSION_DEPTH_MAX} cm).`
    : `Outside AHA target ${COMPRESSION_DEPTH_MIN}-${COMPRESSION_DEPTH_MAX} cm — coach toward target depth.`;
  return `<p${idAttr} class="metric-target ${cls}">${msg}</p>`;
}

function refreshNumericReadouts() {
  const rateEl = document.getElementById('compression-rate-readout');
  if (rateEl) {
    rateEl.outerHTML = rateRangeReadout(
      state.chestCompressions.compressionRate, 'compression-rate-readout'
    );
  }
  const depthEl = document.getElementById('compression-depth-readout');
  if (depthEl) {
    depthEl.outerHTML = depthRangeReadout(
      state.chestCompressions.compressionDepth, 'compression-depth-readout'
    );
  }
}

// ----------------------------------------------------------------------
// Section renderers (1 per assessment step)
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
      { value: 'instructor', label: 'BLS instructor candidate' },
      { value: 'first-responder', label: 'First responder' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'paramedic', label: 'Paramedic' },
      { value: 'physician', label: 'Physician' },
      { value: 'other', label: 'Other clinical staff' }
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

  card.appendChild(textInput({
    label: 'Examiner name',
    section: 'traineeDetails', field: 'examinerName'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Scene Safety & Initial Assessment',
    description: 'Trainee surveys the scene before approaching the casualty.'
  });

  card.appendChild(checklist([
    { ruleId: 'BLS-SS-SAFE', section: 'sceneSafety', field: 'sceneSafe' },
    { ruleId: 'BLS-SS-PPE', section: 'sceneSafety', field: 'ppeApplied' },
    { ruleId: 'BLS-SS-HAZARDS', section: 'sceneSafety', field: 'hazardsIdentified' },
    { ruleId: 'BLS-SS-BYSTANDERS', section: 'sceneSafety', field: 'bystandersControlled' }
  ]));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Responsiveness & Breathing Check',
    description: 'Trainee assesses responsiveness, breathing, and pulse within 10 seconds.'
  });

  card.appendChild(checklist([
    { ruleId: 'BLS-RB-TAP', section: 'responsivenessBreathing', field: 'tappedAndShouted' },
    { ruleId: 'BLS-RB-BREATH', section: 'responsivenessBreathing', field: 'checkedBreathing' },
    { ruleId: 'BLS-RB-PULSE', section: 'responsivenessBreathing', field: 'checkedPulseSimultaneously' },
    { ruleId: 'BLS-RB-TIME', section: 'responsivenessBreathing', field: 'timeWithinTenSeconds' }
  ]));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Activate Emergency Response',
    description: 'Trainee calls 999 / 2222, communicates clearly, and designates an AED retriever.'
  });

  card.appendChild(checklist([
    { ruleId: 'BLS-ER-CALL', section: 'activateEmergencyResponse', field: 'calledEmergencyNumber' },
    { ruleId: 'BLS-ER-INFO', section: 'activateEmergencyResponse', field: 'statedLocationAndCondition' },
    { ruleId: 'BLS-ER-AED', section: 'activateEmergencyResponse', field: 'designatedAedRetriever' },
    { ruleId: 'BLS-ER-SPEAKER', section: 'activateEmergencyResponse', field: 'usedSpeakerphone' }
  ]));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Chest Compressions',
    description: 'Rate, depth, recoil, hand position, and minimised interruptions. Rate and depth are critical actions.'
  });

  // Numeric measurements first
  const rateRow = document.createElement('div');
  rateRow.className = 'metric-row';
  rateRow.appendChild(textInput({
    label: 'Measured compression rate',
    section: 'chestCompressions', field: 'compressionRate',
    type: 'number', min: 30, max: 200, step: 1, unit: '/min'
  }));
  rateRow.insertAdjacentHTML(
    'beforeend',
    rateRangeReadout(state.chestCompressions.compressionRate, 'compression-rate-readout')
  );
  card.appendChild(rateRow);

  const depthRow = document.createElement('div');
  depthRow.className = 'metric-row';
  depthRow.appendChild(textInput({
    label: 'Measured compression depth',
    section: 'chestCompressions', field: 'compressionDepth',
    type: 'number', min: 1, max: 10, step: 0.1, unit: 'cm'
  }));
  depthRow.insertAdjacentHTML(
    'beforeend',
    depthRangeReadout(state.chestCompressions.compressionDepth, 'compression-depth-readout')
  );
  card.appendChild(depthRow);

  card.appendChild(checklist([
    { ruleId: 'BLS-CC-RATE', section: 'chestCompressions', field: 'compressionsAtCorrectRate' },
    { ruleId: 'BLS-CC-DEPTH', section: 'chestCompressions', field: 'compressionsAtCorrectDepth' },
    { ruleId: 'BLS-CC-HAND', section: 'chestCompressions', field: 'correctHandPosition' },
    { ruleId: 'BLS-CC-RECOIL', section: 'chestCompressions', field: 'fullChestRecoil' },
    { ruleId: 'BLS-CC-INTERRUPT', section: 'chestCompressions', field: 'minimisedInterruptions' }
  ]));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Airway & Rescue Breaths',
    description: 'Head tilt-chin lift, effective seal, visible chest rise (critical), 1-second breaths, 30:2 ratio.'
  });

  card.appendChild(checklist([
    { ruleId: 'BLS-AB-AIRWAY', section: 'airwayRescueBreaths', field: 'headTiltChinLift' },
    { ruleId: 'BLS-AB-SEAL', section: 'airwayRescueBreaths', field: 'effectiveSeal' },
    { ruleId: 'BLS-AB-CHEST-RISE', section: 'airwayRescueBreaths', field: 'visibleChestRise' },
    { ruleId: 'BLS-AB-DURATION', section: 'airwayRescueBreaths', field: 'oneSecondPerBreath' },
    { ruleId: 'BLS-AB-RATIO', section: 'airwayRescueBreaths', field: 'ratio30to2' },
    { ruleId: 'BLS-AB-NOEXCESS', section: 'airwayRescueBreaths', field: 'avoidedExcessiveVentilation' }
  ]));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'AED Use & Shock Delivery',
    description: 'Pad placement, "I’m clear, you’re clear, everyone clear" — safe shock delivery is a critical action.'
  });

  card.appendChild(textInput({
    label: 'Time to first shock (from cardiac arrest recognition)',
    section: 'aedShockDelivery', field: 'timeToFirstShockSeconds',
    type: 'number', min: 0, max: 600, step: 1, unit: 'seconds'
  }));

  card.appendChild(checklist([
    { ruleId: 'BLS-AED-POWER', section: 'aedShockDelivery', field: 'poweredOnPromptly' },
    { ruleId: 'BLS-AED-PADS', section: 'aedShockDelivery', field: 'correctPadPlacement' },
    { ruleId: 'BLS-AED-CLEAR-ANALYSIS', section: 'aedShockDelivery', field: 'clearedDuringAnalysis' },
    { ruleId: 'BLS-AED-SAFE-SHOCK', section: 'aedShockDelivery', field: 'deliveredShockSafely' },
    { ruleId: 'BLS-AED-RESUME', section: 'aedShockDelivery', field: 'resumedCompressionsImmediately' }
  ]));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Team Dynamics, Handoff & Feedback',
    description: 'Communication, closed-loop orders, structured handoff, and post-event debrief.'
  });

  card.appendChild(checklist([
    { ruleId: 'BLS-TD-COMM', section: 'teamDynamicsHandoff', field: 'clearCommunication' },
    { ruleId: 'BLS-TD-CLOSED-LOOP', section: 'teamDynamicsHandoff', field: 'closedLoopOrders' },
    { ruleId: 'BLS-TD-HANDOFF', section: 'teamDynamicsHandoff', field: 'appropriateHandoff' },
    { ruleId: 'BLS-TD-DEBRIEF', section: 'teamDynamicsHandoff', field: 'debriefParticipated' }
  ]));

  card.appendChild(textArea({
    label: 'Examiner notes',
    section: 'teamDynamicsHandoff', field: 'examinerNotes',
    placeholder: 'Strengths, deficiencies, coaching focus for next session…',
    rows: 4
  }));
  card.appendChild(textArea({
    label: 'Trainee self-feedback',
    section: 'teamDynamicsHandoff', field: 'traineeFeedback',
    placeholder: 'Trainee\u2019s reflections after the scenario…',
    rows: 3
  }));

  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7, renderStep8
];

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'traineeDetails',            title: 'Trainee Details' },
  { step: 2, section: 'sceneSafety',               title: 'Scene Safety' },
  { step: 3, section: 'responsivenessBreathing',   title: 'Responsiveness' },
  { step: 4, section: 'activateEmergencyResponse', title: 'Emergency Response' },
  { step: 5, section: 'chestCompressions',         title: 'Compressions' },
  { step: 6, section: 'airwayRescueBreaths',       title: 'Airway & Breaths' },
  { step: 7, section: 'aedShockDelivery',          title: 'AED & Shock' },
  { step: 8, section: 'teamDynamicsHandoff',       title: 'Team & Handoff' }
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
 * Tri-state checklist fields plus numeric measurements tracked for progress,
 * grouped by section so the step-list can show per-section completion.
 *
 * Trainee-detail text fields (step 1) are intentionally excluded so the
 * progress bar reflects the skills assessment, not the paperwork.
 */
const TRACKED_SECTIONS = [
  ['traineeDetails', ['firstName', 'lastName', 'traineeId', 'role',
                      'sessionDate', 'examinerName']],
  ['sceneSafety', ['sceneSafe', 'ppeApplied', 'hazardsIdentified',
                   'bystandersControlled']],
  ['responsivenessBreathing', ['tappedAndShouted', 'checkedBreathing',
                                'checkedPulseSimultaneously',
                                'timeWithinTenSeconds']],
  ['activateEmergencyResponse', ['calledEmergencyNumber',
                                  'statedLocationAndCondition',
                                  'designatedAedRetriever',
                                  'usedSpeakerphone']],
  ['chestCompressions', ['compressionRate', 'compressionDepth',
                          'compressionsAtCorrectRate',
                          'compressionsAtCorrectDepth',
                          'correctHandPosition', 'fullChestRecoil',
                          'minimisedInterruptions']],
  ['airwayRescueBreaths', ['headTiltChinLift', 'effectiveSeal',
                            'visibleChestRise', 'oneSecondPerBreath',
                            'ratio30to2', 'avoidedExcessiveVentilation']],
  ['aedShockDelivery', ['poweredOnPromptly', 'correctPadPlacement',
                         'clearedDuringAnalysis', 'deliveredShockSafely',
                         'resumedCompressionsImmediately']],
  ['teamDynamicsHandoff', ['clearCommunication', 'closedLoopOrders',
                            'appropriateHandoff', 'debriefParticipated']]
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
    nonCriticalDeficiencies,
    firedRules,
    additionalFlags,
    answeredCount,
    totalRules,
    timestamp
  } = lastResult;

  // Critical-action audit table — always show all four critical rules.
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
          <th scope="col">Critical action</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>${auditRows}</tbody>
    </table>
  `;

  // Non-critical deficiencies summary
  const ncDefList = nonCriticalDeficiencies.length === 0
    ? `<p class="muted">No non-critical deficiencies recorded.</p>`
    : `
      <ul class="checklist" style="gap:0.375rem;">
        ${nonCriticalDeficiencies.map((r) => `
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
    summaryText = `All four critical actions met; ${nonCriticalDeficiencies.length} non-critical deficiency(ies).`;
  } else if (criticalFailures.length > 0) {
    summaryText = `${criticalFailures.length} critical-action failure(s) — automatic Fail.`;
  } else if (nonCriticalDeficiencies.length > 2) {
    summaryText = `${nonCriticalDeficiencies.length} non-critical deficiencies (limit is 2) — Fail.`;
  } else {
    summaryText = 'Insufficient items assessed to grade — please complete the checklist.';
  }

  const trainee = state.traineeDetails;
  const traineeName = `${trainee.firstName} ${trainee.lastName}`.trim();

  out.innerHTML = `
    <h2>BLS Skills Verification Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}${
      traineeName ? ` for ${esc(traineeName)}` : ''
    }${trainee.examinerName ? ` · examiner: ${esc(trainee.examinerName)}` : ''}</p>

    <h3>Outcome</h3>
    <p class="outcome-summary">
      <span class="outcome-badge ${outcomeClass(outcome)}">${esc(outcomeLabel(outcome) || '—')}</span>
      <span class="outcome-detail">${esc(summaryText)}</span>
    </p>
    <p class="muted">Based on ${answeredCount} of ${totalRules} checklist items recorded.</p>

    <h3>Critical-action audit</h3>
    ${auditTable}

    <h3>Non-critical deficiencies</h3>
    ${ncDefList}

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
  const grading = gradeBLS(state);
  const additionalFlags = detectAdditionalFlags(state, grading);
  lastResult = {
    outcome: grading.outcome,
    criticalFailures: grading.criticalFailures,
    nonCriticalDeficiencies: grading.nonCriticalDeficiencies,
    firedRules: grading.firedRules,
    additionalFlags,
    answeredCount: grading.answeredCount,
    totalRules: grading.totalRules,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh skills verification?')) return;
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
  refreshNumericReadouts();
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
  refreshNumericReadouts();

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
