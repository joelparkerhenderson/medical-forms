import { detectFlaggedIssues } from './flags.js';
import { calculateOttawaDecision } from './grader.js';
import { decisionClass, decisionLabel, emptyAssessment, priorityLabel, yesNoLabel } from './types.js';

// Ottawa Ankle Rules (and Ottawa Foot Rules) — bedside wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and the two live
// imaging decisions (ankle X-ray indicated, foot X-ray indicated) update as the
// criteria are entered. Submission runs the pure decision engine (two boolean
// decisions plus the criteria that drove them and any flagged issues) and
// renders an inline report. State is persisted to localStorage so a partial fill
// survives a page reload.
//
// This instrument is a boolean DECISION RULE, not a numeric score: there is no
// total to sum and no risk band.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'ottawa-ankle-rules.front-end-with-html.v1';

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

/** @param {import('./types.js').AssessmentData} state */
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
  slug: 'ottawa-ankle-rules',
  hadDraftAtLoad,
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
    refreshLiveDecision();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 8;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-decision readouts after each change.
 *
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshLiveDecision();
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
// Component builders
// ----------------------------------------------------------------------

/** Map an <input type=…> to its Lily class name. */
function lilyInputClass(type) {
  switch (type) {
    case 'email':          return 'email-input';
    case 'number':         return 'number-input';
    case 'date':           return 'date-input';
    case 'datetime-local': return 'date-input';
    case 'time':           return 'time-input';
    case 'tel':            return 'tel-input';
    case 'url':            return 'url-input';
    case 'search':         return 'search-input';
    default:               return 'text-input';
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
  if (opts.min !== undefined) attrs.push(`min="${esc(opts.min)}"`);
  if (opts.max !== undefined) attrs.push(`max="${esc(opts.max)}"`);
  if (opts.step !== undefined) attrs.push(`step="${esc(opts.step)}"`);
  if (opts.required) attrs.push('required', 'data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    let v = input.value;
    if (opts.numeric) {
      v = input.value === '' ? null : Number(input.value);
      if (v !== null && Number.isNaN(v)) v = null;
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

  const labelText = esc(opts.label);

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${opts.required ? ' required data-required' : ''}>
      ${optionsHtml}
    </select>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
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
  wrapper.className = 'field radio-fieldset';
  wrapper.id = `${groupId}-fieldset`;
  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  if (opts.required) legend.setAttribute('data-required', '');
  wrapper.appendChild(legend);
  if (opts.hint) {
    const hint = document.createElement('span');
    hint.className = 'hint';
    hint.textContent = opts.hint;
    wrapper.appendChild(hint);
  }
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
    `<span class="section-step">Step ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Section renderers (1 per Ottawa step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, where, which side, and how long since the injury.'
  });

  card.appendChild(textInput({
    label: 'Assessing clinician name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. Dr A. Khan'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'doctor', label: 'Doctor' },
      { value: 'nurse-practitioner', label: 'Nurse practitioner' },
      { value: 'paramedic', label: 'Paramedic' },
      { value: 'physiotherapist', label: 'Physiotherapist' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of assessment',
    section: 'context', field: 'assessedAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'careSetting', required: true,
    options: [
      { value: 'emergency-department', label: 'Emergency department' },
      { value: 'minor-injury-unit', label: 'Minor-injury unit' },
      { value: 'urgent-care', label: 'Urgent care' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Injured side',
    section: 'context', field: 'injuredSide', required: true,
    options: [
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Hours since injury',
    section: 'context', field: 'hoursSinceInjury', type: 'number',
    numeric: true, min: 0, step: 0.5,
    hint: 'Time elapsed since the injury, in hours.'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age, and sex. The rule is validated for adults (>= 18 years).'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. ED-204817 or hospital MRN'
  }));
  card.appendChild(textInput({
    label: 'Age (years)',
    section: 'identification', field: 'ageYears', type: 'number',
    numeric: true, min: 0, max: 120, step: 1,
    hint: 'Ages under 18 raise an applicability flag (paediatric guidance takes precedence).'
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'identification', field: 'sex', required: true,
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'intersex', label: 'Intersex' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Applicability',
    description: 'Confirm the rule can be applied reliably before recording the bedside findings.'
  });

  card.appendChild(radioGroup({
    label: 'Is the assessment reliable (no intoxication, distracting injury, or sensory deficit)?',
    section: 'applicability', field: 'assessmentReliable', options: yesNo,
    hint: 'If unreliable, the rule may be invalid — consider imaging on clinical judgement.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Applicability status',
    id: 'applicability-readout',
    render: () => renderApplicabilityReadout()
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Pain zones',
    description: 'The two decision preconditions. An ankle X-ray needs malleolar-zone pain; a foot X-ray needs midfoot-zone pain.'
  });

  card.appendChild(radioGroup({
    label: 'Pain in the malleolar zone?',
    section: 'painZones', field: 'malleolarZonePain', options: yesNo,
    hint: 'Ankle precondition (AND). Without it, no ankle X-ray is indicated regardless of tenderness.'
  }));
  card.appendChild(radioGroup({
    label: 'Pain in the midfoot zone?',
    section: 'painZones', field: 'midfootZonePain', options: yesNo,
    hint: 'Foot precondition (AND). Without it, no foot X-ray is indicated regardless of tenderness.'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Ankle bone tenderness',
    description: 'Ankle criteria A1 and A2. Either one, with malleolar-zone pain, indicates an ankle X-ray.'
  });

  card.appendChild(radioGroup({
    label: 'Bone tenderness at the posterior edge or tip of the lateral malleolus (distal 6 cm of the fibula)?',
    section: 'ankleTenderness', field: 'lateralMalleolusTenderness', options: yesNo,
    hint: 'Criterion A1.'
  }));
  card.appendChild(radioGroup({
    label: 'Bone tenderness at the posterior edge or tip of the medial malleolus (distal 6 cm of the tibia)?',
    section: 'ankleTenderness', field: 'medialMalleolusTenderness', options: yesNo,
    hint: 'Criterion A2.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Live ankle X-ray decision',
    id: 'ankle-decision-readout',
    render: () => renderAnkleDecision()
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Foot bone tenderness',
    description: 'Foot criteria F1 and F2. Either one, with midfoot-zone pain, indicates a foot X-ray.'
  });

  card.appendChild(radioGroup({
    label: 'Bone tenderness at the base of the fifth metatarsal?',
    section: 'footTenderness', field: 'fifthMetatarsalBaseTenderness', options: yesNo,
    hint: 'Criterion F1.'
  }));
  card.appendChild(radioGroup({
    label: 'Bone tenderness at the navicular?',
    section: 'footTenderness', field: 'navicularTenderness', options: yesNo,
    hint: 'Criterion F2.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Live foot X-ray decision',
    id: 'foot-decision-readout',
    render: () => renderFootDecision()
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Weight-bearing',
    description: 'Criteria A3 / F3. "Unable to bear weight" requires cannot take four steps BOTH immediately AND now — and it feeds both decisions.'
  });

  card.appendChild(radioGroup({
    label: 'Able to take four steps (two on each foot) immediately after the injury?',
    section: 'weightBearing', field: 'ableToBearWeightImmediately', options: yesNo,
    hint: 'Answer "No" if the patient could not weight-bear at the time of injury.'
  }));
  card.appendChild(radioGroup({
    label: 'Able to take four steps now, at assessment?',
    section: 'weightBearing', field: 'ableToBearWeightNow', options: yesNo,
    hint: 'Answer "No" if the patient cannot weight-bear now in the ED/MIU.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Unable to bear weight',
    id: 'weight-bearing-readout',
    render: () => renderWeightBearingReadout()
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Summary and decision',
    description: 'The two live imaging decisions and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live imaging decisions',
    id: 'live-decision-readout',
    render: () => renderLiveDecision()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNotes',
    placeholder: 'Free-text clinical note: context, decisions, and any imaging or safety-net advice actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the applicability status (age and reliability). */
function renderApplicabilityReadout() {
  const parts = [];
  const age = state.identification.ageYears;
  if (age !== null && age < 18) {
    parts.push('<strong class="warn">Under 18 — apply paediatric caution.</strong>');
  } else if (age !== null) {
    parts.push('<span class="muted">Adult (>= 18).</span>');
  } else {
    parts.push('<span class="muted">Age not recorded.</span>');
  }
  if (state.applicability.assessmentReliable === 'no') {
    parts.push('<strong class="warn">Assessment unreliable — the rule may be invalid.</strong>');
  } else if (state.applicability.assessmentReliable === 'yes') {
    parts.push('<span class="ok">Assessment reliable.</span>');
  }
  return parts.join(' ');
}

/** Render the live ankle X-ray decision. */
function renderAnkleDecision() {
  const grade = calculateOttawaDecision(state);
  const badge =
    `<span class="risk-badge ${decisionClass(grade.ankleXrayIndicated)}">${esc(decisionLabel(grade.ankleXrayIndicated))}</span>`;
  const gate = state.painZones.malleolarZonePain === 'yes'
    ? 'malleolar-zone pain present'
    : 'no malleolar-zone pain (precondition not met)';
  return `${badge} <span class="muted">(${esc(gate)})</span>`;
}

/** Render the live foot X-ray decision. */
function renderFootDecision() {
  const grade = calculateOttawaDecision(state);
  const badge =
    `<span class="risk-badge ${decisionClass(grade.footXrayIndicated)}">${esc(decisionLabel(grade.footXrayIndicated))}</span>`;
  const gate = state.painZones.midfootZonePain === 'yes'
    ? 'midfoot-zone pain present'
    : 'no midfoot-zone pain (precondition not met)';
  return `${badge} <span class="muted">(${esc(gate)})</span>`;
}

/** Render the derived unable-to-bear-weight readout. */
function renderWeightBearingReadout() {
  const grade = calculateOttawaDecision(state);
  const cls = grade.unableToBearWeight ? 'warn' : 'ok';
  const value = grade.unableToBearWeight ? 'Yes' : 'No';
  const note = grade.unableToBearWeight
    ? '(cannot take four steps both immediately and now — feeds both decisions)'
    : '(able at either time point, or not yet answered)';
  return `<strong class="${cls}">${value}</strong> <span class="muted">${note}</span>`;
}

/** Render the combined live imaging decisions. */
function renderLiveDecision() {
  const grade = calculateOttawaDecision(state);
  const ankle =
    `<span class="risk-badge ${decisionClass(grade.ankleXrayIndicated)}">Ankle: ${esc(decisionLabel(grade.ankleXrayIndicated))}</span>`;
  const foot =
    `<span class="risk-badge ${decisionClass(grade.footXrayIndicated)}">Foot: ${esc(decisionLabel(grade.footXrayIndicated))}</span>`;
  return `${ankle} ${foot}` +
    `<div class="muted">The two decisions are independent — ankle only, foot only, both, or neither is valid.</div>`;
}

function refreshLiveDecision() {
  const app = document.getElementById('applicability-readout');
  if (app) app.innerHTML = renderApplicabilityReadout();
  const ankle = document.getElementById('ankle-decision-readout');
  if (ankle) ankle.innerHTML = renderAnkleDecision();
  const foot = document.getElementById('foot-decision-readout');
  if (foot) foot.innerHTML = renderFootDecision();
  const weight = document.getElementById('weight-bearing-readout');
  if (weight) weight.innerHTML = renderWeightBearingReadout();
  const live = document.getElementById('live-decision-readout');
  if (live) live.innerHTML = renderLiveDecision();
}

// ----------------------------------------------------------------------
// Conditional sections (none currently, but kept for parity + future use)
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = state[section]?.[field];
    host.style.display = String(current) === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered.
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['careSetting'], ['injuredSide']],
  identification: [['patientIdentifier'], ['ageYears'], ['sex']],
  applicability: [['assessmentReliable']],
  painZones: [['malleolarZonePain'], ['midfootZonePain']],
  ankleTenderness: [['lateralMalleolusTenderness'], ['medialMalleolusTenderness']],
  footTenderness: [['fifthMetatarsalBaseTenderness'], ['navicularTenderness']],
  weightBearing: [['ableToBearWeightImmediately'], ['ableToBearWeightNow']],
  note: [['clinicalNotes']]
};

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  let total = 0;
  const sectionAnswered = {};
  const sectionTotal = {};

  for (const section of Object.keys(STEP_SLOTS)) {
    const slots = STEP_SLOTS[section];
    sectionTotal[section] = slots.length;
    sectionAnswered[section] = 0;
    for (const slot of slots) {
      total++;
      const slotAnswered = slot.some((field) => isAnswered(section, field));
      if (slotAnswered) {
        answered++;
        sectionAnswered[section]++;
      }
    }
  }

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
    case 'high': return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

// Criterion rows for the report table: [label, region, section, field].
const REPORT_CRITERIA = [
  ['Malleolar-zone pain (ankle precondition)', 'ankle', 'painZones', 'malleolarZonePain'],
  ['A1 — Lateral malleolus tenderness', 'ankle', 'ankleTenderness', 'lateralMalleolusTenderness'],
  ['A2 — Medial malleolus tenderness', 'ankle', 'ankleTenderness', 'medialMalleolusTenderness'],
  ['Midfoot-zone pain (foot precondition)', 'foot', 'painZones', 'midfootZonePain'],
  ['F1 — Fifth-metatarsal-base tenderness', 'foot', 'footTenderness', 'fifthMetatarsalBaseTenderness'],
  ['F2 — Navicular tenderness', 'foot', 'footTenderness', 'navicularTenderness'],
  ['Able to bear weight immediately after injury', 'both', 'weightBearing', 'ableToBearWeightImmediately'],
  ['Able to bear weight now, at assessment', 'both', 'weightBearing', 'ableToBearWeightNow']
];

const REGION_LABEL = { ankle: 'Ankle', foot: 'Foot', both: 'Both' };

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    unableToBearWeight, ankleXrayIndicated, footXrayIndicated,
    flaggedIssues, timestamp
  } = lastResult;

  const criteriaRows = REPORT_CRITERIA.map(([name, region, section, field]) => {
    const value = state[section][field];
    return `
      <tr>
        <th scope="row">${esc(name)}</th>
        <td>${esc(REGION_LABEL[region])}</td>
        <td>${esc(yesNoLabel(value))}</td>
      </tr>
    `;
  }).join('');

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No red-flag issues raised.</p>`
    : `
      <ul class="flags">
        ${flaggedIssues.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority))}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}${f.suggestedAction ? ` — ${esc(f.suggestedAction)}` : ''}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const anklePathway = ankleXrayIndicated
    ? `<p><strong>Ankle X-ray indicated.</strong> Malleolar-zone pain with malleolus tenderness or inability to bear weight — request an <strong>ankle radiograph series</strong>.</p>`
    : `<p><strong>Ankle X-ray not indicated.</strong> A clinically significant ankle fracture is unlikely — manage as a soft-tissue injury, safety-net, and review if not improving.</p>`;
  const footPathway = footXrayIndicated
    ? `<p><strong>Foot X-ray indicated.</strong> Midfoot-zone pain with fifth-metatarsal-base or navicular tenderness or inability to bear weight — request a <strong>foot radiograph series</strong>.</p>`
    : `<p><strong>Foot X-ray not indicated.</strong> A clinically significant midfoot fracture is unlikely — manage conservatively and safety-net.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Ottawa Ankle / Foot Rules Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${decisionClass(ankleXrayIndicated || footXrayIndicated)}">
        <div>
          <span class="risk-banner-label">Imaging decisions</span>
          <span class="risk-banner-value">
            <span class="risk-badge ${decisionClass(ankleXrayIndicated)}">Ankle: ${esc(decisionLabel(ankleXrayIndicated))}</span>
            <span class="risk-badge ${decisionClass(footXrayIndicated)}">Foot: ${esc(decisionLabel(footXrayIndicated))}</span>
          </span>
        </div>
      </div>

      <p class="muted">
        This is a boolean decision rule, not a score. The two decisions are
        independent; "unable to bear weight" is
        <strong>${unableToBearWeight ? 'present' : 'absent'}</strong> and, when
        present, drives both regions.
      </p>

      <h3>Criteria</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Criterion</th>
            <th scope="col">Region</th>
            <th scope="col">Answer</th>
          </tr>
        </thead>
        <tbody>${criteriaRows}</tbody>
      </table>

      <h3>Recommended pathway</h3>
      ${anklePathway}
      ${footPathway}

      <h3>Flagged issues (${flaggedIssues.length})</h3>
      ${flagsList}

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
  const grade = calculateOttawaDecision(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    unableToBearWeight: grade.unableToBearWeight,
    ankleXrayIndicated: grade.ankleXrayIndicated,
    footXrayIndicated: grade.footXrayIndicated,
    firedCriteria: grade.firedCriteria,
    flaggedIssues,
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
  refreshLiveDecision();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',         title: 'Context' },
  { step: 2, section: 'identification',  title: 'Patient' },
  { step: 3, section: 'applicability',   title: 'Applicability' },
  { step: 4, section: 'painZones',       title: 'Pain zones' },
  { step: 5, section: 'ankleTenderness', title: 'Ankle' },
  { step: 6, section: 'footTenderness',  title: 'Foot' },
  { step: 7, section: 'weightBearing',   title: 'Weight-bearing' },
  { step: 8, section: 'note',            title: 'Summary' }
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
  const required = form.querySelectorAll('input[data-required], select[data-required], textarea[data-required]');
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveDecision();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
