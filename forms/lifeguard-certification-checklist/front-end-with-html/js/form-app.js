import { detectAdditionalFlags } from './flagged-issues.js';
import { gradeLifeguard } from './lifeguard-grader.js';
import { lifeguardRules } from './rules.js';
import { COMPRESSION_DEPTH_MAX, COMPRESSION_DEPTH_MIN, COMPRESSION_RATE_MAX, COMPRESSION_RATE_MIN, SLOW_AED_SECONDS, SURFACE_DIVE_MIN_METRES, SWIM_200M_MAX_SECONDS, SWIM_50M_MAX_SECONDS, compressionDepthInRange, compressionRateInRange, emptyAssessment, outcomeClass, outcomeLabel, surfaceDiveDepthAdequate, swim200mWithinTarget, swim50mWithinTarget, triStateLabel, triStatePillClass } from './types.js';

// Lifeguard Certification Checklist — examiner wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order as a Lily <fieldset class="fieldset">. The examiner scrolls
// through them; a native <progress> bar and a clickable step-list at the top
// of the page reflect how many checklist items have been answered.
// Submission runs the pure lifeguard grading engine and renders an inline
// report with a Pass / Needs Development / Fail badge, critical-skill
// audit table, deficiency list, and prioritised flagged-issues list.
// State is persisted to localStorage so a partial fill survives a page
// reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'lifeguard-certification-checklist.front-end-form-with-html.v1';
const TOTAL_STEPS = 10;

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

/** @type {object | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'lifeguard-certification-checklist',
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

/**
 * Set a deeply-nested field on the state and persist.
 *
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
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

/** Look up the canonical rule definition by id. */
function ruleById(id) {
  return lifeguardRules.find((r) => r.id === id);
}

/** Build a checklist <ul> hosting the listed rule IDs.
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
// Numeric metric readouts
// ----------------------------------------------------------------------

function swim50mReadout(sec, id) {
  const idAttr = id ? ` id="${id}"` : '';
  if (sec === null || sec === undefined || sec === '') {
    return `<p${idAttr} class="metric-target">NPLQ target: 50 m in ${SWIM_50M_MAX_SECONDS}s or less.</p>`;
  }
  const ok = swim50mWithinTarget(sec);
  const cls = ok ? 'in-range' : 'out-of-range';
  const msg = ok
    ? `Within NPLQ target (≤ ${SWIM_50M_MAX_SECONDS}s).`
    : `Exceeds NPLQ target of ${SWIM_50M_MAX_SECONDS}s — critical-competency failure.`;
  return `<p${idAttr} class="metric-target ${cls}">${msg}</p>`;
}

function swim200mReadout(sec, id) {
  const idAttr = id ? ` id="${id}"` : '';
  if (sec === null || sec === undefined || sec === '') {
    return `<p${idAttr} class="metric-target">Suggested target: 200 m mixed strokes in ${SWIM_200M_MAX_SECONDS}s or less.</p>`;
  }
  const ok = swim200mWithinTarget(sec);
  const cls = ok ? 'in-range' : 'out-of-range';
  const msg = ok
    ? `Within suggested target (≤ ${SWIM_200M_MAX_SECONDS}s).`
    : `Exceeds suggested ${SWIM_200M_MAX_SECONDS}s target — recommend conditioning.`;
  return `<p${idAttr} class="metric-target ${cls}">${msg}</p>`;
}

function diveDepthReadout(m, id) {
  const idAttr = id ? ` id="${id}"` : '';
  if (m === null || m === undefined || m === '') {
    return `<p${idAttr} class="metric-target">Suggested minimum surface dive: ${SURFACE_DIVE_MIN_METRES}m.</p>`;
  }
  const ok = surfaceDiveDepthAdequate(m);
  const cls = ok ? 'in-range' : 'out-of-range';
  const msg = ok
    ? `At or below suggested minimum (${SURFACE_DIVE_MIN_METRES}m).`
    : `Above suggested ${SURFACE_DIVE_MIN_METRES}m minimum — practice deeper recovery.`;
  return `<p${idAttr} class="metric-target ${cls}">${msg}</p>`;
}

function rateRangeReadout(rate, id) {
  const idAttr = id ? ` id="${id}"` : '';
  if (rate === null || rate === undefined || rate === '') {
    return `<p${idAttr} class="metric-target">Target: ${COMPRESSION_RATE_MIN}-${COMPRESSION_RATE_MAX} compressions per minute.</p>`;
  }
  const ok = compressionRateInRange(rate);
  const cls = ok ? 'in-range' : 'out-of-range';
  const msg = ok
    ? `Within target (${COMPRESSION_RATE_MIN}-${COMPRESSION_RATE_MAX}/min).`
    : `Outside target ${COMPRESSION_RATE_MIN}-${COMPRESSION_RATE_MAX}/min — coach toward target rate.`;
  return `<p${idAttr} class="metric-target ${cls}">${msg}</p>`;
}

function depthRangeReadout(depth, id) {
  const idAttr = id ? ` id="${id}"` : '';
  if (depth === null || depth === undefined || depth === '') {
    return `<p${idAttr} class="metric-target">Target: ${COMPRESSION_DEPTH_MIN}-${COMPRESSION_DEPTH_MAX} cm for an adult.</p>`;
  }
  const ok = compressionDepthInRange(depth);
  const cls = ok ? 'in-range' : 'out-of-range';
  const msg = ok
    ? `Within target (${COMPRESSION_DEPTH_MIN}-${COMPRESSION_DEPTH_MAX} cm).`
    : `Outside target ${COMPRESSION_DEPTH_MIN}-${COMPRESSION_DEPTH_MAX} cm — coach toward target depth.`;
  return `<p${idAttr} class="metric-target ${cls}">${msg}</p>`;
}

function aedShockReadout(sec, id) {
  const idAttr = id ? ` id="${id}"` : '';
  if (sec === null || sec === undefined || sec === '') {
    return `<p${idAttr} class="metric-target">ILSF target: time to first shock under ${SLOW_AED_SECONDS}s.</p>`;
  }
  const ok = sec <= SLOW_AED_SECONDS;
  const cls = ok ? 'in-range' : 'out-of-range';
  const msg = ok
    ? `Within ILSF target (≤ ${SLOW_AED_SECONDS}s).`
    : `Exceeds ILSF target of ${SLOW_AED_SECONDS}s — practice rapid AED retrieval.`;
  return `<p${idAttr} class="metric-target ${cls}">${msg}</p>`;
}

function refreshNumericReadouts() {
  /** @type {[string, () => string][]} */
  const readouts = [
    ['swim-50m-readout', () => swim50mReadout(state.physicalFitnessSwim.swim50mTimeSeconds, 'swim-50m-readout')],
    ['swim-200m-readout', () => swim200mReadout(state.physicalFitnessSwim.swim200mTimeSeconds, 'swim-200m-readout')],
    ['dive-depth-readout', () => diveDepthReadout(state.physicalFitnessSwim.surfaceDiveDepthMetres, 'dive-depth-readout')],
    ['compression-rate-readout', () => rateRangeReadout(state.cprAed.compressionRate, 'compression-rate-readout')],
    ['compression-depth-readout', () => depthRangeReadout(state.cprAed.compressionDepth, 'compression-depth-readout')],
    ['aed-shock-readout', () => aedShockReadout(state.cprAed.timeToFirstShockSeconds, 'aed-shock-readout')]
  ];
  for (const [id, build] of readouts) {
    const el = document.getElementById(id);
    if (el) el.outerHTML = build();
  }
}

// ----------------------------------------------------------------------
// Section renderers (1 per assessment step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Candidate Details',
    description: 'Identify the candidate and certification context for this verification.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First name', section: 'candidateDetails', field: 'firstName' }));
  grid.appendChild(textInput({ label: 'Last name', section: 'candidateDetails', field: 'lastName' }));
  card.appendChild(grid);

  const idGrid = document.createElement('div');
  idGrid.className = 'two-col';
  idGrid.appendChild(textInput({
    label: 'Candidate ID / membership number',
    section: 'candidateDetails', field: 'candidateId'
  }));
  idGrid.appendChild(textInput({
    label: 'Date of birth',
    section: 'candidateDetails', field: 'dateOfBirth',
    type: 'date'
  }));
  card.appendChild(idGrid);

  card.appendChild(selectInput({
    label: 'Venue type',
    section: 'candidateDetails', field: 'venueType',
    options: [
      { value: 'pool', label: 'Pool (NPLQ)' },
      { value: 'beach', label: 'Beach lifeguard' },
      { value: 'inland-water', label: 'Inland water (lake / river)' },
      { value: 'water-park', label: 'Water park / leisure' },
      { value: 'leisure', label: 'Leisure facility' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Venue name',
    section: 'candidateDetails', field: 'venueName',
    placeholder: 'e.g. King\u2019s Pool, Westside Aquatic Centre'
  }));

  card.appendChild(selectInput({
    label: 'Assessment type',
    section: 'candidateDetails', field: 'assessmentType',
    options: [
      { value: 'initial', label: 'Initial certification' },
      { value: 'requalification', label: 'Requalification (re-cert)' },
      { value: 'cross-over', label: 'Cross-over from another body' },
      { value: 'in-service', label: 'In-service review' },
      { value: 'other', label: 'Other' }
    ]
  }));

  const dateGrid = document.createElement('div');
  dateGrid.className = 'two-col';
  dateGrid.appendChild(textInput({
    label: 'Prior certification expiry',
    section: 'candidateDetails', field: 'priorCertificationExpiry',
    type: 'date'
  }));
  dateGrid.appendChild(textInput({
    label: 'Session date',
    section: 'candidateDetails', field: 'sessionDate',
    type: 'date'
  }));
  card.appendChild(dateGrid);

  const examinerGrid = document.createElement('div');
  examinerGrid.className = 'two-col';
  examinerGrid.appendChild(textInput({
    label: 'Examiner name',
    section: 'candidateDetails', field: 'examinerName'
  }));
  examinerGrid.appendChild(textInput({
    label: 'Examiner licence number',
    section: 'candidateDetails', field: 'examinerLicenceNumber'
  }));
  card.appendChild(examinerGrid);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Physical Fitness & Swim Competency',
    description: 'NPLQ swim test: 50 m timed swim (≤60 s, critical), sustained surface dive, 200 m mixed-strokes swim, water tread, and casualty tow.'
  });

  // 50 m timed swim
  const row1 = document.createElement('div');
  row1.className = 'metric-row';
  row1.appendChild(textInput({
    label: 'Measured 50 m swim time',
    section: 'physicalFitnessSwim', field: 'swim50mTimeSeconds',
    type: 'number', min: 20, max: 200, step: 0.1, unit: 'seconds'
  }));
  row1.insertAdjacentHTML(
    'beforeend',
    swim50mReadout(state.physicalFitnessSwim.swim50mTimeSeconds, 'swim-50m-readout')
  );
  card.appendChild(row1);

  // Surface dive depth
  const row2 = document.createElement('div');
  row2.className = 'metric-row';
  row2.appendChild(textInput({
    label: 'Surface-dive recovery depth',
    section: 'physicalFitnessSwim', field: 'surfaceDiveDepthMetres',
    type: 'number', min: 0.5, max: 5, step: 0.1, unit: 'metres'
  }));
  row2.insertAdjacentHTML(
    'beforeend',
    diveDepthReadout(state.physicalFitnessSwim.surfaceDiveDepthMetres, 'dive-depth-readout')
  );
  card.appendChild(row2);

  // 200 m sustained swim
  const row3 = document.createElement('div');
  row3.className = 'metric-row';
  row3.appendChild(textInput({
    label: 'Measured 200 m sustained swim time',
    section: 'physicalFitnessSwim', field: 'swim200mTimeSeconds',
    type: 'number', min: 60, max: 900, step: 1, unit: 'seconds'
  }));
  row3.insertAdjacentHTML(
    'beforeend',
    swim200mReadout(state.physicalFitnessSwim.swim200mTimeSeconds, 'swim-200m-readout')
  );
  card.appendChild(row3);

  card.appendChild(checklist([
    { ruleId: 'LIFE-PF-50M-TIME', section: 'physicalFitnessSwim', field: 'swim50mWithinTime' },
    { ruleId: 'LIFE-PF-DIVE', section: 'physicalFitnessSwim', field: 'sustainedSurfaceDive' },
    { ruleId: 'LIFE-PF-200M', section: 'physicalFitnessSwim', field: 'swim200mMixedStrokes' },
    { ruleId: 'LIFE-PF-TREAD', section: 'physicalFitnessSwim', field: 'treadWaterTwoMinutes' },
    { ruleId: 'LIFE-PF-TOW', section: 'physicalFitnessSwim', field: 'towCasualty50m' }
  ]));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Supervision, Scanning & Zoning',
    description: 'Effective scanning is a critical competency. Apply the 10/20 rule and maintain a defined zone of responsibility.'
  });

  card.appendChild(checklist([
    { ruleId: 'LIFE-SCAN-ZONE', section: 'supervisionScanningZoning', field: 'understandsZoneOfResponsibility' },
    { ruleId: 'LIFE-SCAN-PATTERN', section: 'supervisionScanningZoning', field: 'effectiveScanningPattern' },
    { ruleId: 'LIFE-SCAN-1020', section: 'supervisionScanningZoning', field: 'tenTwentyScanRule' },
    { ruleId: 'LIFE-SCAN-DISTRESS', section: 'supervisionScanningZoning', field: 'recognisesDistressedSwimmer' },
    { ruleId: 'LIFE-SCAN-ROTATION', section: 'supervisionScanningZoning', field: 'appropriateRotation' },
    { ruleId: 'LIFE-SCAN-WHISTLE', section: 'supervisionScanningZoning', field: 'usesWhistleAndSignals' }
  ]));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Rescue Scenario — Conscious Casualty',
    description: 'Recognition, alert, controlled entry, approach with floating aid, reassurance, tow, and extrication.'
  });

  card.appendChild(checklist([
    { ruleId: 'LIFE-RC-RECOG', section: 'rescueConscious', field: 'recognitionAndAlert' },
    { ruleId: 'LIFE-RC-ENTRY', section: 'rescueConscious', field: 'entryWithoutLossOfSight' },
    { ruleId: 'LIFE-RC-AID', section: 'rescueConscious', field: 'approachWithFloatingAid' },
    { ruleId: 'LIFE-RC-REASSURE', section: 'rescueConscious', field: 'reassuresCasualty' },
    { ruleId: 'LIFE-RC-TOW', section: 'rescueConscious', field: 'towToSafety' },
    { ruleId: 'LIFE-RC-EXTRICATE', section: 'rescueConscious', field: 'extricationFromWater' }
  ]));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Rescue Scenario — Unconscious Casualty',
    description: 'Effective tow and safe extrication of an unconscious casualty are critical competencies.'
  });

  card.appendChild(checklist([
    { ruleId: 'LIFE-RU-RECOG', section: 'rescueUnconscious', field: 'recognitionAndAlert' },
    { ruleId: 'LIFE-RU-ENTRY', section: 'rescueUnconscious', field: 'safeEntryAndApproach' },
    { ruleId: 'LIFE-RU-AIRWAY', section: 'rescueUnconscious', field: 'airwayManagementInWater' },
    { ruleId: 'LIFE-RU-TOW', section: 'rescueUnconscious', field: 'effectiveTowToSafety' },
    { ruleId: 'LIFE-RU-EXTRICATE', section: 'rescueUnconscious', field: 'safeExtrication' },
    { ruleId: 'LIFE-RU-HANDOVER', section: 'rescueUnconscious', field: 'handoverHandsignal' }
  ]));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Spinal Injury Management',
    description: 'Head-splint hold and correct spineboard use are critical competencies. Maintain in-line stabilisation throughout.'
  });

  card.appendChild(checklist([
    { ruleId: 'LIFE-SP-MECH', section: 'spinalInjuryManagement', field: 'recognisesMechanism' },
    { ruleId: 'LIFE-SP-HEADSPLINT', section: 'spinalInjuryManagement', field: 'headSplintHold' },
    { ruleId: 'LIFE-SP-INLINE', section: 'spinalInjuryManagement', field: 'maintainsInlineStabilisation' },
    { ruleId: 'LIFE-SP-ROLL', section: 'spinalInjuryManagement', field: 'carefulRollIfNeeded' },
    { ruleId: 'LIFE-SP-BOARD', section: 'spinalInjuryManagement', field: 'useOfSpineboard' },
    { ruleId: 'LIFE-SP-SECURE', section: 'spinalInjuryManagement', field: 'secureCasualtyToBoard' }
  ]));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'CPR & AED',
    description: 'Effective compressions and prompt AED delivery are critical competencies.'
  });

  // Compression rate
  const rateRow = document.createElement('div');
  rateRow.className = 'metric-row';
  rateRow.appendChild(textInput({
    label: 'Measured compression rate',
    section: 'cprAed', field: 'compressionRate',
    type: 'number', min: 30, max: 200, step: 1, unit: '/min'
  }));
  rateRow.insertAdjacentHTML(
    'beforeend',
    rateRangeReadout(state.cprAed.compressionRate, 'compression-rate-readout')
  );
  card.appendChild(rateRow);

  // Compression depth
  const depthRow = document.createElement('div');
  depthRow.className = 'metric-row';
  depthRow.appendChild(textInput({
    label: 'Measured compression depth',
    section: 'cprAed', field: 'compressionDepth',
    type: 'number', min: 1, max: 10, step: 0.1, unit: 'cm'
  }));
  depthRow.insertAdjacentHTML(
    'beforeend',
    depthRangeReadout(state.cprAed.compressionDepth, 'compression-depth-readout')
  );
  card.appendChild(depthRow);

  // Time to first shock
  const shockRow = document.createElement('div');
  shockRow.className = 'metric-row';
  shockRow.appendChild(textInput({
    label: 'Time to first shock (from arrest recognition)',
    section: 'cprAed', field: 'timeToFirstShockSeconds',
    type: 'number', min: 0, max: 600, step: 1, unit: 'seconds'
  }));
  shockRow.insertAdjacentHTML(
    'beforeend',
    aedShockReadout(state.cprAed.timeToFirstShockSeconds, 'aed-shock-readout')
  );
  card.appendChild(shockRow);

  card.appendChild(checklist([
    { ruleId: 'LIFE-CPR-COMPRESSIONS', section: 'cprAed', field: 'effectiveCompressions' },
    { ruleId: 'LIFE-CPR-VENTILATIONS', section: 'cprAed', field: 'effectiveVentilations' },
    { ruleId: 'LIFE-CPR-AED-PROMPT', section: 'cprAed', field: 'aedDeliveredPromptly' },
    { ruleId: 'LIFE-CPR-AED-SAFE', section: 'cprAed', field: 'safeShockNoUnsafeContact' },
    { ruleId: 'LIFE-CPR-QUALITY', section: 'cprAed', field: 'continuousQualityCpr' }
  ]));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'First Aid & Oxygen Therapy',
    description: 'Bleeding control, burns, fractures, recovery position, oxygen therapy, and pocket-mask / BVM technique.'
  });

  card.appendChild(checklist([
    { ruleId: 'LIFE-FA-BLEEDING', section: 'firstAidOxygen', field: 'bleedingControl' },
    { ruleId: 'LIFE-FA-BURNS', section: 'firstAidOxygen', field: 'burnsManagement' },
    { ruleId: 'LIFE-FA-FRACTURE', section: 'firstAidOxygen', field: 'fractureImmobilisation' },
    { ruleId: 'LIFE-FA-RECOVERY', section: 'firstAidOxygen', field: 'recoveryPositionUse' },
    { ruleId: 'LIFE-FA-OXYGEN', section: 'firstAidOxygen', field: 'oxygenTherapyAdministration' },
    { ruleId: 'LIFE-FA-MASK', section: 'firstAidOxygen', field: 'usesPocketMaskOrBVM' }
  ]));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Legal, Regulatory & Incident Reporting',
    description: 'Duty of care, PSOP / NOP / EAP knowledge, incident reporting, RIDDOR awareness, safeguarding.'
  });

  card.appendChild(checklist([
    { ruleId: 'LIFE-LR-DUTY', section: 'legalRegulatoryIncident', field: 'dutyOfCareUnderstood' },
    { ruleId: 'LIFE-LR-PSWP', section: 'legalRegulatoryIncident', field: 'pswpKnowledge' },
    { ruleId: 'LIFE-LR-EAP', section: 'legalRegulatoryIncident', field: 'eapInvocation' },
    { ruleId: 'LIFE-LR-REPORT', section: 'legalRegulatoryIncident', field: 'incidentReportCompleted' },
    { ruleId: 'LIFE-LR-RIDDOR', section: 'legalRegulatoryIncident', field: 'riddorAwareness' },
    { ruleId: 'LIFE-LR-SAFEGUARD', section: 'legalRegulatoryIncident', field: 'safeguardingChildrenAdults' }
  ]));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Overall Result, Feedback & Signoff',
    description: 'Examiner records the recommended outcome, captures strengths and development areas, and confirms the candidate has been debriefed.'
  });

  card.appendChild(selectInput({
    label: 'Examiner recommended outcome',
    section: 'overallResultSignoff', field: 'examinerOutcome',
    options: [
      { value: 'pass', label: 'Pass' },
      { value: 'needs-development', label: 'Needs Development' },
      { value: 'fail', label: 'Fail' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Strengths observed',
    section: 'overallResultSignoff', field: 'strengths',
    placeholder: 'Specific behaviours and skills the candidate performed well…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Development areas',
    section: 'overallResultSignoff', field: 'developmentAreas',
    placeholder: 'Concrete coaching points for follow-up…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Examiner notes',
    section: 'overallResultSignoff', field: 'examinerNotes',
    placeholder: 'Context, scenario details, conditions, equipment…',
    rows: 4
  }));
  card.appendChild(textArea({
    label: 'Candidate self-feedback',
    section: 'overallResultSignoff', field: 'candidateFeedback',
    placeholder: 'Candidate\u2019s reflections on the session…',
    rows: 3
  }));

  // Candidate acknowledgement (tri-state — yes / no / na)
  const ackUl = document.createElement('ul');
  ackUl.className = 'checklist';
  ackUl.appendChild(checklistItem({
    ruleId: 'SIGNOFF-ACK',
    section: 'overallResultSignoff',
    field: 'candidateAcknowledged',
    label: 'Candidate has been debriefed and acknowledges the result.',
    critical: false
  }));
  card.appendChild(ackUl);

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
  { step: 1,  section: 'candidateDetails',          title: 'Candidate Details' },
  { step: 2,  section: 'physicalFitnessSwim',       title: 'Fitness & Swim' },
  { step: 3,  section: 'supervisionScanningZoning', title: 'Supervision & Scan' },
  { step: 4,  section: 'rescueConscious',           title: 'Rescue — Conscious' },
  { step: 5,  section: 'rescueUnconscious',         title: 'Rescue — Unconscious' },
  { step: 6,  section: 'spinalInjuryManagement',    title: 'Spinal Injury' },
  { step: 7,  section: 'cprAed',                    title: 'CPR & AED' },
  { step: 8,  section: 'firstAidOxygen',            title: 'First Aid & Oxygen' },
  { step: 9,  section: 'legalRegulatoryIncident',   title: 'Legal & Incident' },
  { step: 10, section: 'overallResultSignoff',      title: 'Result & Signoff' }
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
 * Tracked fields grouped by section so the step-list can show per-section
 * completion. Candidate-detail fields (step 1) are intentionally excluded
 * from the assessment progress total but are tracked per-section so the
 * step-list reflects paperwork completion.
 */
const TRACKED_SECTIONS = [
  ['candidateDetails', ['firstName', 'lastName', 'candidateId', 'venueType',
                         'venueName', 'sessionDate', 'examinerName']],
  ['physicalFitnessSwim', ['swim50mTimeSeconds', 'swim50mWithinTime',
                            'surfaceDiveDepthMetres', 'sustainedSurfaceDive',
                            'swim200mTimeSeconds', 'swim200mMixedStrokes',
                            'treadWaterTwoMinutes', 'towCasualty50m']],
  ['supervisionScanningZoning', ['understandsZoneOfResponsibility',
                                  'effectiveScanningPattern',
                                  'tenTwentyScanRule',
                                  'recognisesDistressedSwimmer',
                                  'appropriateRotation',
                                  'usesWhistleAndSignals']],
  ['rescueConscious', ['recognitionAndAlert', 'entryWithoutLossOfSight',
                        'approachWithFloatingAid', 'reassuresCasualty',
                        'towToSafety', 'extricationFromWater']],
  ['rescueUnconscious', ['recognitionAndAlert', 'safeEntryAndApproach',
                          'airwayManagementInWater', 'effectiveTowToSafety',
                          'safeExtrication', 'handoverHandsignal']],
  ['spinalInjuryManagement', ['recognisesMechanism', 'headSplintHold',
                               'maintainsInlineStabilisation',
                               'carefulRollIfNeeded', 'useOfSpineboard',
                               'secureCasualtyToBoard']],
  ['cprAed', ['compressionRate', 'compressionDepth', 'effectiveCompressions',
              'effectiveVentilations', 'timeToFirstShockSeconds',
              'aedDeliveredPromptly', 'safeShockNoUnsafeContact',
              'continuousQualityCpr']],
  ['firstAidOxygen', ['bleedingControl', 'burnsManagement',
                       'fractureImmobilisation', 'recoveryPositionUse',
                       'oxygenTherapyAdministration', 'usesPocketMaskOrBVM']],
  ['legalRegulatoryIncident', ['dutyOfCareUnderstood', 'pswpKnowledge',
                                'eapInvocation', 'incidentReportCompleted',
                                'riddorAwareness', 'safeguardingChildrenAdults']],
  ['overallResultSignoff', ['examinerOutcome', 'candidateAcknowledged']]
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

  // Critical-skills audit table — always show all critical rules.
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
          <th scope="col">Critical competency</th>
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
    summaryText = `All critical competencies met; no non-critical deficiencies.`;
  } else if (outcome === 'needs-development') {
    summaryText = `${deficiencies.length} non-critical deficiency(ies) recorded; no critical-competency failure.`;
  } else if (criticalFailures.length > 0) {
    summaryText = `${criticalFailures.length} critical-competency failure(s) — automatic Fail.`;
  } else {
    summaryText = 'Insufficient items assessed to grade — please complete the checklist.';
  }

  const candidate = state.candidateDetails;
  const candidateName = `${candidate.firstName} ${candidate.lastName}`.trim();
  const examiner = candidate.examinerName;

  // Compare engine outcome with examiner-recommended outcome (if recorded)
  const examinerOutcome = state.overallResultSignoff.examinerOutcome;
  let outcomeNote = '';
  if (examinerOutcome && examinerOutcome !== outcome) {
    outcomeNote = `<p class="muted">Examiner-recommended outcome: <strong>${esc(outcomeLabel(examinerOutcome))}</strong> (differs from engine outcome — examiner override may apply).</p>`;
  } else if (examinerOutcome && examinerOutcome === outcome) {
    outcomeNote = `<p class="muted">Examiner-recommended outcome confirms engine result.</p>`;
  }

  out.innerHTML = `
    <h2>Lifeguard Competency Verification Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}${
      candidateName ? ` for ${esc(candidateName)}` : ''
    }${examiner ? ` · examiner: ${esc(examiner)}` : ''}</p>

    <h3>Outcome</h3>
    <p class="outcome-summary">
      <span class="outcome-badge ${outcomeClass(outcome)}">${esc(outcomeLabel(outcome) || '—')}</span>
      <span class="outcome-detail">${esc(summaryText)}</span>
    </p>
    <p class="muted">Based on ${answeredCount} of ${totalRules} checklist items recorded.</p>
    ${outcomeNote}

    <h3>Critical-skills audit</h3>
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
  const grading = gradeLifeguard(state);
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
  if (!confirm('Clear all answers and start a fresh lifeguard verification?')) return;
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
