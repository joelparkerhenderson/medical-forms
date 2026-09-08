import { detectFlaggedIssues } from './flags.js';
import { calculateCssrsGrade } from './grader.js';
import { emptyAssessment, ideationLevelLabel, priorityLabel, riskTierClass, riskTierLabel } from './types.js';

// Columbia Suicide Severity Rating Scale (C-SSRS) — clinician wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered, and a live
// ideation level and risk tier update as the ideation, behaviour, and lethality
// items are entered. Submission runs the pure classification engine (highest
// affirmative ideation level 0-5, behaviour presence/recency, lethality, and
// the derived Low / Moderate / High risk tier with flagged issues) and renders
// an inline report. A High tier is presented prominently. State is persisted to
// localStorage so a partial fill survives a page reload.
//
// This instrument concerns suicide risk. It is a validated clinical screening
// tool for trained staff; the software stratifies risk and prompts escalation,
// it does not diagnose or replace clinical judgement.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'columbia-suicide-severity-rating-scale.front-end-with-html.v1';

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
  slug: 'columbia-suicide-severity-rating-scale',
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
    refreshLiveScore();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 8;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-readout after each change.
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
  refreshLiveScore();
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
  if (opts.required) attrs.push('required', 'data-required');
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <input ${attrs.join(' ')}>
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    let v = input.value;
    if (type === 'number') {
      v = v === '' ? null : Number(v);
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
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
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
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
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
// Section renderers (1 per C-SSRS step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const ordinal05 = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' }
];

const ordinal02 = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, where, which C-SSRS version, and the reason for the screen.'
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
      { value: 'clinician', label: 'Clinician' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'mental-health-practitioner', label: 'Mental-health practitioner' },
      { value: 'crisis-worker', label: 'Crisis worker' },
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
      { value: 'mental-health', label: 'Mental-health service' },
      { value: 'emergency-department', label: 'Emergency department' },
      { value: 'primary-care', label: 'Primary care' },
      { value: 'crisis-service', label: 'Crisis service' },
      { value: 'inpatient', label: 'Inpatient ward' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'C-SSRS version',
    section: 'context', field: 'scaleVersion', required: true,
    hint: 'Screener (short triage yes/no set) or full (adds intensity and detailed behaviour/lethality coding).',
    options: [
      { value: 'screener', label: 'Screener (triage)' },
      { value: 'full', label: 'Full (clinical)' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Reason for assessment',
    section: 'context', field: 'reasonForAssessment',
    placeholder: 'e.g. presenting with low mood, routine screen, following a crisis call'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age band, and sex.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. MH-100482 or hospital MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    options: [
      { value: 'adolescent', label: 'Adolescent' },
      { value: 'adult', label: 'Adult' }
    ]
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
    title: 'Suicidal ideation',
    description: 'Questions Q1-Q5, asked in ascending order. The highest affirmative item sets the ideation level (0-5).'
  });

  card.appendChild(selectInput({
    label: 'Reference timeframe',
    section: 'ideation', field: 'ideationTimeframe',
    hint: 'Typically past month for current risk, or lifetime / worst-point.',
    options: [
      { value: 'past-month', label: 'Past month (current)' },
      { value: 'lifetime-worst', label: 'Lifetime / worst point' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Q1 (level 1) — Wish to be dead',
    section: 'ideation', field: 'wishToBeDead', required: true,
    hint: 'Passive wish to be dead or to go to sleep and not wake up.',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Q2 (level 2) — Non-specific active suicidal thoughts',
    section: 'ideation', field: 'nonSpecificActiveThoughts',
    hint: 'General active thoughts of wanting to end one’s life, without methods, intent, or plan.',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Q3 (level 3) — Active ideation with any methods, no plan',
    section: 'ideation', field: 'activeIdeationMethods',
    hint: 'Thinking of at least one method, but without a specific plan and without intent to act.',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Q4 (level 4) — Active ideation with some intent to act',
    section: 'ideation', field: 'activeIdeationIntent',
    hint: 'Active thoughts with some intent to act, without a fully worked-out plan.',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Q5 (level 5) — Active ideation with specific plan and intent',
    section: 'ideation', field: 'activeIdeationPlan',
    hint: 'Active thoughts with a specific plan and intent to carry it out.',
    options: yesNo
  }));

  card.appendChild(readOnlyReadout({
    label: 'Ideation level',
    id: 'ideation-level-readout',
    render: () => renderIdeationReadout()
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Ideation intensity (optional)',
    description: 'Full-version sub-items characterising the most severe ideation (each 0-5). These inform clinical judgement but do not change the ordinal level.'
  });

  card.appendChild(selectInput({
    label: 'Frequency',
    section: 'intensity', field: 'ideationFrequency',
    hint: 'How often the ideation occurs (0 = not at all … 5 = many times each day).',
    options: ordinal05
  }));
  card.appendChild(selectInput({
    label: 'Duration',
    section: 'intensity', field: 'ideationDuration',
    hint: 'How long the ideation lasts when it occurs (0-5).',
    options: ordinal05
  }));
  card.appendChild(selectInput({
    label: 'Controllability',
    section: 'intensity', field: 'ideationControllability',
    hint: 'How able the person is to control the thoughts (0-5).',
    options: ordinal05
  }));
  card.appendChild(selectInput({
    label: 'Deterrents',
    section: 'intensity', field: 'ideationDeterrents',
    hint: 'Whether deterrents stopped the person acting (0-5).',
    options: ordinal05
  }));
  card.appendChild(selectInput({
    label: 'Reasons for ideation',
    section: 'intensity', field: 'ideationReasons',
    hint: 'Reasons for the ideation, e.g. to end pain vs. to get attention (0-5).',
    options: ordinal05
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Suicidal behaviour',
    description: 'Categorical behaviour items, with the recency of the most recent event and the lifetime attempt count.'
  });

  card.appendChild(radioGroup({
    label: 'Actual attempt',
    section: 'behaviour', field: 'actualAttempt',
    hint: 'A potentially self-injurious act with at least some intent to die.',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Interrupted attempt',
    section: 'behaviour', field: 'interruptedAttempt',
    hint: 'Interrupted by an outside circumstance before self-harm begins.',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Aborted / self-interrupted attempt',
    section: 'behaviour', field: 'abortedAttempt',
    hint: 'The person stops themselves before beginning the act.',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Preparatory acts or behaviour',
    section: 'behaviour', field: 'preparatoryActs',
    hint: 'Steps taken to prepare, e.g. acquiring means or writing a note.',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Non-suicidal self-injury (NSSI)',
    section: 'behaviour', field: 'nonSuicidalSelfInjury',
    hint: 'Self-injury without intent to die. Tracked separately; does not set the suicidal-behaviour tier.',
    options: yesNo
  }));
  card.appendChild(selectInput({
    label: 'Recency of most recent suicidal behaviour',
    section: 'behaviour', field: 'behaviourRecency',
    hint: 'Behaviour within the past 3 months raises the risk tier.',
    options: [
      { value: 'within-3-months', label: 'Within the past 3 months' },
      { value: 'over-3-months', label: 'More than 3 months ago / lifetime' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Lifetime actual-attempt count',
    section: 'behaviour', field: 'lifetimeAttemptCount',
    type: 'number', min: 0, max: 100, step: 1,
    hint: 'Total number of lifetime actual attempts.'
  }));
  card.appendChild(textInput({
    label: 'Most recent actual-attempt date',
    section: 'behaviour', field: 'mostRecentAttemptDate', type: 'date'
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Lethality',
    description: 'For an actual attempt. Potential lethality is coded only when actual lethality is 0.'
  });

  card.appendChild(selectInput({
    label: 'Actual lethality / medical damage',
    section: 'lethality', field: 'actualLethality',
    hint: '0 = no physical damage … 5 = death. Actual lethality of 3 or more sets a high risk tier.',
    options: ordinal05
  }));
  card.appendChild(selectInput({
    label: 'Potential lethality',
    section: 'lethality', field: 'potentialLethality',
    hint: 'Code only when actual lethality is 0. 0-2; a value of 2 sets a high risk tier.',
    options: ordinal02
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Means and protective factors',
    description: 'Access to lethal means and any protective factors.'
  });

  card.appendChild(selectInput({
    label: 'Access to lethal means',
    section: 'means', field: 'accessToLethalMeans',
    hint: 'Access to lethal means is a modifiable, high-impact risk factor and always raises a flag.',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Protective factors',
    section: 'means', field: 'protectiveFactors',
    placeholder: 'e.g. supportive family, engagement with services, reasons for living, future plans.'
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Summary and risk tier',
    description: 'Live ideation level and risk tier, plus a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live classification',
    id: 'live-score-readout',
    render: () => renderLiveScore()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'summary', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, mental-state findings, decisions, and any escalation already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the current ideation level pill. */
function renderIdeationReadout() {
  const grade = calculateCssrsGrade(state);
  const cls = grade.ideationLevel >= 4 ? 'warn' : grade.ideationLevel >= 1 ? '' : 'ok';
  return `<strong class="${cls}">Level ${grade.ideationLevel}</strong> <span class="muted">${esc(ideationLevelLabel(grade.ideationLevel))}</span>`;
}

/** Render the live ideation level + risk tier. Prominent for a High tier. */
function renderLiveScore() {
  const grade = calculateCssrsGrade(state);
  const badge =
    `<span class="risk-badge ${riskTierClass(grade.riskTier)}">${esc(riskTierLabel(grade.riskTier))}</span>`;
  const urgent = grade.riskTier === 'high'
    ? ` <strong class="warn">Urgent response indicated</strong>`
    : '';
  return `<strong>Ideation level ${grade.ideationLevel} of 5</strong> ${badge}${urgent}`;
}

function refreshLiveScore() {
  const ide = document.getElementById('ideation-level-readout');
  if (ide) ide.innerHTML = renderIdeationReadout();
  const live = document.getElementById('live-score-readout');
  if (live) live.innerHTML = renderLiveScore();
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
  context: [['clinicianName'], ['clinicianRole'], ['careSetting'], ['scaleVersion']],
  identification: [['patientIdentifier'], ['ageBand'], ['sex']],
  ideation: [
    ['wishToBeDead'], ['nonSpecificActiveThoughts'], ['activeIdeationMethods'],
    ['activeIdeationIntent'], ['activeIdeationPlan'], ['ideationTimeframe']
  ],
  intensity: [[
    'ideationFrequency', 'ideationDuration', 'ideationControllability',
    'ideationDeterrents', 'ideationReasons'
  ]],
  behaviour: [
    ['actualAttempt'], ['interruptedAttempt'], ['abortedAttempt'],
    ['preparatoryActs'], ['nonSuicidalSelfInjury']
  ],
  lethality: [['actualLethality', 'potentialLethality']],
  means: [['accessToLethalMeans']],
  summary: [['clinicalNote']]
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    ideationLevel, suicidalBehaviourPresent, recentBehaviour, riskTier,
    flaggedIssues, managementRecommendation, timestamp
  } = lastResult;

  const ide = state.ideation;
  const beh = state.behaviour;
  const let_ = state.lethality;

  const affirmed = (v) => v === 'yes' ? 'Yes' : v === 'no' ? 'No' : 'Not recorded';

  const ideationRows = [
    ['Q1 — Wish to be dead (level 1)', ide.wishToBeDead],
    ['Q2 — Non-specific active thoughts (level 2)', ide.nonSpecificActiveThoughts],
    ['Q3 — Active ideation with methods (level 3)', ide.activeIdeationMethods],
    ['Q4 — Active ideation with intent (level 4)', ide.activeIdeationIntent],
    ['Q5 — Active ideation with plan and intent (level 5)', ide.activeIdeationPlan]
  ].map(([name, value]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(affirmed(value))}</td>
    </tr>
  `).join('');

  const behaviourRows = [
    ['Actual attempt', beh.actualAttempt],
    ['Interrupted attempt', beh.interruptedAttempt],
    ['Aborted / self-interrupted attempt', beh.abortedAttempt],
    ['Preparatory acts', beh.preparatoryActs],
    ['Non-suicidal self-injury (NSSI)', beh.nonSuicidalSelfInjury]
  ].map(([name, value]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(affirmed(value))}</td>
    </tr>
  `).join('');

  const lethalityText = (() => {
    const parts = [];
    if (let_.actualLethality !== null) parts.push(`actual ${let_.actualLethality}/5`);
    if (let_.potentialLethality !== null) parts.push(`potential ${let_.potentialLethality}/2`);
    return parts.length ? parts.join(', ') : 'Not recorded';
  })();

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

  const urgentNotice = riskTier === 'high'
    ? `<div class="alert" data-type="error" role="alert"><strong>High risk — urgent response indicated.</strong> Do not leave the person alone. Ensure immediate safety, restrict access to lethal means, complete a safety plan, and arrange emergency mental-health evaluation per local protocol.</div>`
    : '';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>C-SSRS Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      ${urgentNotice}

      <div class="risk-banner ${riskTierClass(riskTier)}">
        <div>
          <span class="risk-banner-label">Ideation level</span>
          <span class="risk-banner-value">${ideationLevel} of 5</span>
        </div>
        <span class="risk-badge ${riskTierClass(riskTier)}">${esc(riskTierLabel(riskTier))}</span>
      </div>

      <h3>Suicidal ideation</h3>
      <table class="subscales">
        <thead>
          <tr><th scope="col">Item</th><th scope="col">Response</th></tr>
        </thead>
        <tbody>${ideationRows}</tbody>
      </table>

      <h3>Suicidal behaviour</h3>
      <p class="muted">
        Suicidal behaviour present: <strong>${suicidalBehaviourPresent ? 'Yes' : 'No'}</strong>
        ${suicidalBehaviourPresent ? ` (${recentBehaviour ? 'within the past 3 months' : 'more than 3 months ago / lifetime'})` : ''}.
        Lethality: ${esc(lethalityText)}.
      </p>
      <table class="subscales">
        <thead>
          <tr><th scope="col">Category</th><th scope="col">Response</th></tr>
        </thead>
        <tbody>${behaviourRows}</tbody>
      </table>

      <h3>Management recommendation</h3>
      <p>${esc(managementRecommendation)}</p>

      <h3>Flagged issues (${flaggedIssues.length})</h3>
      ${flagsList}

      <p class="muted">
        C-SSRS is a status- and severity-classification instrument, not a
        diagnosis. A Low tier does not exclude risk; use clinical judgement and
        re-screen on any change.
      </p>

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
  const grade = calculateCssrsGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    ideationLevel: grade.ideationLevel,
    suicidalBehaviourPresent: grade.suicidalBehaviourPresent,
    recentBehaviour: grade.recentBehaviour,
    riskTier: grade.riskTier,
    firedCriteria: grade.firedCriteria,
    flaggedIssues,
    managementRecommendation: grade.managementRecommendation,
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
  refreshLiveScore();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'identification', title: 'Patient' },
  { step: 3, section: 'ideation',       title: 'Ideation' },
  { step: 4, section: 'intensity',      title: 'Intensity' },
  { step: 5, section: 'behaviour',      title: 'Behaviour' },
  { step: 6, section: 'lethality',      title: 'Lethality' },
  { step: 7, section: 'means',          title: 'Means' },
  { step: 8, section: 'summary',        title: 'Summary' }
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
  refreshLiveScore();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
