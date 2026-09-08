import { review } from './grader.js';
import { emptyAssessment, priorityClass, priorityLabel, reviewStatusClass, reviewStatusLabel, seizureControlClass, seizureControlLabel } from './types.js';

// Epilepsy Annual Review — single-page wizard (vanilla JavaScript, no build).
//
// Single continuous wizard: every step is rendered into the page in document
// order across the eleven review sections. The clinician scrolls through them; a
// sticky top-of-page progress summary reflects how many fields have been
// answered, and a live readout updates the seizure-control class, review status,
// and flag count as data is entered. Submission runs the pure
// classification-and-completeness engine (grader.js -> seizureControl,
// reviewStatus, componentStatuses, firedRules; flags.js -> flaggedIssues) and
// renders an inline report. State is persisted to localStorage so a partial fill
// survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'epilepsy-review.front-end-with-html.v1';

/** @returns {import('./types.js').AssessmentData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
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
    console.warn('Could not parse saved review; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save review to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored review.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

/** @type {import('./types.js').AssessmentData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'epilepsy-review',
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
    refreshLiveSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 11;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a field on the state and persist. Re-runs progress and the live readout.
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  refreshLiveSummary();
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

function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const type = opts.type || 'text';
  const lilyClass = type === 'date' ? 'date-input' : 'text-input';
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${lilyClass}"`,
    `value="${esc(value ?? '')}"`,
    `aria-describedby="${id}-error"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    setField(opts.section, opts.field, input.value);
    clearFieldError(id);
  });
  return wrapper;
}

function numberInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    'type="number"',
    'class="number-input"',
    `value="${value === null || value === undefined ? '' : esc(value)}"`,
    `aria-describedby="${id}-error"`
  ];
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    const raw = input.value.trim();
    const parsed = raw === '' ? null : Number(raw);
    setField(opts.section, opts.field, Number.isNaN(parsed) ? null : parsed);
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
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      aria-describedby="${id}-error"
      class="text-area-input"${opts.required ? ' required data-required' : ''}>${esc(value)}</textarea>
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

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
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
// Option vocabularies (mirror the SQL CHECK constraints)
// ----------------------------------------------------------------------

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const YES_NO_NA = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not-applicable', label: 'Not applicable' }
];

const OPTIONS = {
  reviewerRole: [
    { value: 'gp', label: 'General practitioner' },
    { value: 'practice-nurse', label: 'Practice nurse' },
    { value: 'epilepsy-nurse', label: 'Epilepsy specialist nurse' },
    { value: 'neurologist', label: 'Neurologist' },
    { value: 'other', label: 'Other' }
  ],
  careSetting: [
    { value: 'general-practice', label: 'General practice' },
    { value: 'epilepsy-clinic', label: 'Epilepsy clinic' },
    { value: 'community', label: 'Community' },
    { value: 'other', label: 'Other' }
  ],
  reviewType: [
    { value: 'annual', label: 'Annual' },
    { value: 'interim', label: 'Interim' }
  ],
  ageBand: [
    { value: '18-39', label: '18-39' },
    { value: '40-59', label: '40-59' },
    { value: '60-79', label: '60-79' },
    { value: '>=80', label: '80 and over' }
  ],
  sex: [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'intersex', label: 'Intersex' },
    { value: 'unknown', label: 'Unknown' }
  ],
  epilepsyType: [
    { value: 'focal', label: 'Focal' },
    { value: 'generalised', label: 'Generalised' },
    { value: 'combined', label: 'Combined' },
    { value: 'unknown', label: 'Unknown' }
  ],
  seizureFrequency: [
    { value: 'none', label: 'None' },
    { value: 'less-than-monthly', label: 'Less than monthly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'daily', label: 'Daily' }
  ],
  seizureTrend: [
    { value: 'seizure-free', label: 'Seizure-free' },
    { value: 'decreasing', label: 'Decreasing' },
    { value: 'stable', label: 'Stable' },
    { value: 'increasing', label: 'Increasing' }
  ],
  adherence: [
    { value: 'good', label: 'Good' },
    { value: 'partial', label: 'Partial' },
    { value: 'poor', label: 'Poor' }
  ],
  sideEffects: [
    { value: 'none', label: 'None' },
    { value: 'mild', label: 'Mild' },
    { value: 'significant', label: 'Significant' }
  ],
  dvlaEligible: [
    { value: 'eligible', label: 'Eligible' },
    { value: 'not-eligible', label: 'Not eligible' },
    { value: 'not-applicable', label: 'Not applicable' }
  ],
  pppStatus: [
    { value: 'in-place', label: 'In place' },
    { value: 'not-in-place', label: 'Not in place' },
    { value: 'not-applicable', label: 'Not applicable' }
  ],
  mentalHealthConcern: [
    { value: 'none', label: 'None' },
    { value: 'low-mood', label: 'Low mood' },
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'depression', label: 'Depression' },
    { value: 'suicidality', label: 'Suicidality' }
  ]
};

// ----------------------------------------------------------------------
// Section renderers (1 per wizard step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Review context',
    description: 'Who is reviewing, when, where, and how long since the last review.'
  });
  card.appendChild(textInput({
    label: 'Reviewing clinician name', section: 'context',
    field: 'reviewerName', required: true, placeholder: 'e.g. Dr A. Rahman'
  }));
  card.appendChild(selectInput({
    label: 'Reviewer role', section: 'context', field: 'reviewerRole',
    required: true, options: OPTIONS.reviewerRole
  }));
  card.appendChild(textInput({
    label: 'Date of review', section: 'context', field: 'reviewedAt', type: 'date'
  }));
  card.appendChild(selectInput({
    label: 'Care setting', section: 'context', field: 'careSetting',
    options: OPTIONS.careSetting
  }));
  card.appendChild(selectInput({
    label: 'Review type', section: 'context', field: 'reviewType',
    options: OPTIONS.reviewType
  }));
  card.appendChild(numberInput({
    label: 'Months since last review', section: 'context',
    field: 'monthsSinceLastReview', min: 0, max: 120, step: 0.5,
    placeholder: 'e.g. 12', hint: 'More than 12 months raises a review-overdue flag.'
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient and epilepsy profile',
    description: 'Identifier, demographics, and the epilepsy diagnosis.'
  });
  card.appendChild(textInput({
    label: 'Patient identifier', section: 'profile',
    field: 'patientIdentifier', required: true,
    placeholder: 'e.g. NHS 943 476 5919 or local MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band', section: 'profile', field: 'ageBand', options: OPTIONS.ageBand
  }));
  card.appendChild(selectInput({
    label: 'Sex', section: 'profile', field: 'sex', options: OPTIONS.sex
  }));
  card.appendChild(selectInput({
    label: 'Epilepsy type / syndrome', section: 'profile', field: 'epilepsyType',
    options: OPTIONS.epilepsyType
  }));
  card.appendChild(numberInput({
    label: 'Age at onset (years)', section: 'profile', field: 'ageAtOnset',
    min: 0, max: 120, step: 1, placeholder: 'e.g. 24'
  }));
  card.appendChild(numberInput({
    label: 'Years since diagnosis', section: 'profile', field: 'yearsSinceDiagnosis',
    min: 0, max: 120, step: 1, placeholder: 'e.g. 8'
  }));
  card.appendChild(selectInput({
    label: 'Learning disability', section: 'profile', field: 'learningDisability',
    options: YES_NO
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Seizure type and frequency',
    description: 'Position since the last review. Frequency and trend drive the control classification.'
  });
  card.appendChild(textArea({
    label: 'Seizure type(s) present', section: 'seizures', field: 'seizureTypes',
    placeholder: 'e.g. focal impaired awareness; occasional secondary generalisation.'
  }));
  card.appendChild(selectInput({
    label: 'Seizure frequency since last review', section: 'seizures',
    field: 'seizureFrequency', options: OPTIONS.seizureFrequency,
    hint: 'Weekly or daily classifies control as uncontrolled.'
  }));
  card.appendChild(textInput({
    label: 'Date of most recent seizure', section: 'seizures',
    field: 'lastSeizureDate', type: 'date'
  }));
  card.appendChild(numberInput({
    label: 'Documented seizure-free duration (months)', section: 'seizures',
    field: 'seizureFreeMonths', min: 0, max: 600, step: 1, placeholder: 'e.g. 18'
  }));
  card.appendChild(selectInput({
    label: 'Trend versus previous review', section: 'seizures', field: 'seizureTrend',
    options: OPTIONS.seizureTrend,
    hint: 'Increasing classifies control as uncontrolled and raises a specialist-review flag.'
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Anti-seizure medication',
    description: 'Current ASM(s), adherence, tolerability, and therapeutic level.'
  });
  card.appendChild(textArea({
    label: 'Current ASM(s) and doses', section: 'medication', field: 'currentAsms',
    placeholder: 'e.g. lamotrigine 200 mg BD; levetiracetam 1 g BD.'
  }));
  card.appendChild(selectInput({
    label: 'Adherence', section: 'medication', field: 'asmAdherence',
    options: OPTIONS.adherence, hint: 'Poor raises a poor-adherence flag.'
  }));
  card.appendChild(selectInput({
    label: 'Side effects', section: 'medication', field: 'asmSideEffects',
    options: OPTIONS.sideEffects, hint: 'Significant raises an ASM-side-effects flag.'
  }));
  card.appendChild(numberInput({
    label: 'Therapeutic drug level (where relevant)', section: 'medication',
    field: 'drugLevel', min: 0, max: 300, step: 0.1, placeholder: 'e.g. 12.5 (phenytoin)'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Triggers',
    description: 'Reported seizure triggers since the last review.'
  });
  card.appendChild(textArea({
    label: 'Triggers', section: 'triggers', field: 'triggers', rows: 4,
    placeholder: 'Sleep deprivation, alcohol, stress, missed medication, photosensitivity, catamenial pattern, illness / fever.'
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'SUDEP risk discussion',
    description: 'Sudden Unexpected Death in Epilepsy — discussion and documentation.'
  });
  card.appendChild(selectInput({
    label: 'SUDEP discussed and documented', section: 'sudep', field: 'sudepDiscussed',
    options: YES_NO, hint: 'Anything other than Yes raises a SUDEP-not-documented flag.'
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Injuries and status epilepticus',
    description: 'Seizure-related harm since the last review.'
  });
  card.appendChild(selectInput({
    label: 'Status epilepticus since last review', section: 'injuries',
    field: 'statusEpilepticus', options: YES_NO,
    hint: 'Yes classifies control as uncontrolled and raises a high-priority flag.'
  }));
  card.appendChild(selectInput({
    label: 'Seizure-related injury since last review', section: 'injuries',
    field: 'seizureInjury', options: YES_NO
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Safety',
    description: 'DVLA driving eligibility and status, and bathing safety advice.'
  });
  card.appendChild(selectInput({
    label: 'DVLA driving eligibility', section: 'safety', field: 'dvlaEligible',
    options: OPTIONS.dvlaEligible
  }));
  card.appendChild(selectInput({
    label: 'Currently driving', section: 'safety', field: 'currentlyDriving',
    options: YES_NO,
    hint: 'Driving while not DVLA-eligible raises a driving-safety flag.'
  }));
  card.appendChild(selectInput({
    label: 'Bathing / showering advice given', section: 'safety',
    field: 'bathingAdviceGiven', options: YES_NO
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Women of childbearing potential',
    description: 'Valproate, pregnancy-prevention programme, folic acid, and contraception. Required only when applicable.'
  });
  card.appendChild(selectInput({
    label: 'Woman of childbearing potential', section: 'childbearing',
    field: 'womanOfChildbearingPotential', options: YES_NO_NA,
    hint: 'When Yes, the valproate / PPP and folic-acid domains become required for completeness.'
  }));
  card.appendChild(selectInput({
    label: 'On sodium valproate', section: 'childbearing', field: 'onValproate',
    options: YES_NO,
    hint: 'Valproate without a documented PPP raises a high-priority flag.'
  }));
  card.appendChild(selectInput({
    label: 'Pregnancy Prevention Programme (PPP)', section: 'childbearing',
    field: 'pregnancyPreventionProgramme', options: OPTIONS.pppStatus
  }));
  card.appendChild(selectInput({
    label: 'Folic acid', section: 'childbearing', field: 'folicAcid',
    options: YES_NO_NA, hint: 'No (when applicable) raises a folic-acid-missing flag.'
  }));
  card.appendChild(selectInput({
    label: 'Contraception and ASM interaction reviewed', section: 'childbearing',
    field: 'contraceptionInteractionReviewed', options: YES_NO_NA
  }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Mental health',
    description: 'Mood, anxiety and depression screening, and any suicidality concern.'
  });
  card.appendChild(selectInput({
    label: 'Mental-health concern', section: 'mentalHealth',
    field: 'mentalHealthConcern', options: OPTIONS.mentalHealthConcern,
    hint: 'Suicidality raises a high-priority flag; other concerns raise a medium flag.'
  }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Summary and care plan',
    description: 'Live seizure control and review completeness, plus the agreed care plan.'
  });
  card.appendChild(readOnlyReadout({
    label: 'Live seizure control and review completeness',
    id: 'live-summary-readout',
    render: () => renderLiveSummary()
  }));
  card.appendChild(selectInput({
    label: 'Specialist (neurology) review needed', section: 'summary',
    field: 'specialistReviewNeeded', options: YES_NO
  }));
  card.appendChild(textInput({
    label: 'Next review due', section: 'summary', field: 'nextReviewDue', type: 'date'
  }));
  card.appendChild(textArea({
    label: 'Care plan', section: 'summary', field: 'carePlan', rows: 4,
    placeholder: 'Agreed self-management and rescue plan, planned medication changes, and recall interval.'
  }));
  card.appendChild(textArea({
    label: 'Review context / clinician note', section: 'summary',
    field: 'reviewContext', rows: 4,
    placeholder: 'Free-text summary drawing the review together.'
  }));
  return card;
}

// ----------------------------------------------------------------------
// Live readout
// ----------------------------------------------------------------------

/** Render the live seizure-control / review summary. */
function renderLiveSummary() {
  const g = review(state);
  const total = g.componentStatuses.length;

  const controlBadge =
    `<span class="risk-badge ${seizureControlClass(g.seizureControl)}">${esc(seizureControlLabel(g.seizureControl))}</span>`;
  const reviewBadge =
    `<span class="risk-badge ${reviewStatusClass(g.reviewStatus)}">${esc(reviewStatusLabel(g.reviewStatus))}</span>`;

  return (
    `<div class="readout-line">Seizure control ${controlBadge}</div>` +
    `<div class="readout-line">Review ${reviewBadge} ` +
    `<span class="muted">(${g.completenessScore} of ${total} required domains)</span></div>` +
    `<div class="readout-line"><span class="muted">${g.flaggedIssues.length} ` +
    `flag${g.flaggedIssues.length === 1 ? '' : 's'} raised</span></div>`
  );
}

function refreshLiveSummary() {
  const live = document.getElementById('live-summary-readout');
  if (live) live.innerHTML = renderLiveSummary();
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered.
const STEP_SLOTS = {
  context: [['reviewerName'], ['reviewerRole'], ['reviewedAt'], ['careSetting'], ['reviewType'], ['monthsSinceLastReview']],
  profile: [['patientIdentifier'], ['ageBand'], ['sex'], ['epilepsyType'], ['ageAtOnset', 'yearsSinceDiagnosis'], ['learningDisability']],
  seizures: [['seizureTypes'], ['seizureFrequency'], ['lastSeizureDate', 'seizureFreeMonths'], ['seizureTrend']],
  medication: [['currentAsms'], ['asmAdherence'], ['asmSideEffects'], ['drugLevel']],
  triggers: [['triggers']],
  sudep: [['sudepDiscussed']],
  injuries: [['statusEpilepticus', 'seizureInjury']],
  safety: [['dvlaEligible', 'currentlyDriving', 'bathingAdviceGiven']],
  childbearing: [['womanOfChildbearingPotential'], ['onValproate', 'pregnancyPreventionProgramme', 'folicAcid', 'contraceptionInteractionReviewed']],
  mentalHealth: [['mentalHealthConcern']],
  summary: [['specialistReviewNeeded', 'nextReviewDue'], ['carePlan', 'reviewContext']]
};

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && String(v).trim() !== '';
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    seizureControl, reviewStatus, completenessScore, componentStatuses,
    flaggedIssues, firedRules, timestamp
  } = lastResult;
  const total = componentStatuses.length;

  const componentRows = componentStatuses.map((c) => `
    <tr>
      <th scope="row">${esc(c.label)}${c.gate ? ' <span class="muted">(core)</span>' : ''}</th>
      <td>
        <span class="flag-badge ${c.documented ? 'flag-no' : 'flag-yes'}">
          ${c.documented ? 'Recorded' : 'Outstanding'}
        </span>
      </td>
    </tr>
  `).join('');

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No flags raised.</p>`
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

  const rulesList = `
    <ul class="flags">
      ${firedRules.map((r) => `
        <li>
          <span class="flag-category">${esc(r.section)}</span>
          <span class="flag-message">${esc(r.description)}</span>
        </li>
      `).join('')}
    </ul>
  `;

  const controlAdvice = seizureControl === 'uncontrolled'
    ? `<p>Seizure control is <strong>uncontrolled</strong> (frequent seizures, an increasing trend, or status epilepticus). Refer or escalate to <strong>neurology / epilepsy specialist</strong> review.</p>`
    : seizureControl === 'seizure-free'
    ? `<p>The patient is <strong>seizure-free</strong> since the last review. This does not by itself authorise driving or medication withdrawal — those remain clinical and DVLA decisions.</p>`
    : `<p>Seizures are present but <strong>stable or decreasing</strong> (controlled). Continue current management and routine recall.</p>`;

  const reviewAdvice = reviewStatus === 'complete'
    ? `<p>All ${total} required review domains are documented.</p>`
    : reviewStatus === 'incomplete'
    ? `<p>A core domain (seizure documentation or ASM) is missing — the review is incomplete and cannot be relied on.</p>`
    : `<p><strong>${total - completenessScore}</strong> required domain(s) remain outstanding — complete them for a whole annual review.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Epilepsy Annual Review Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${seizureControlClass(seizureControl)}">
        <div>
          <span class="risk-banner-label">Seizure control</span>
          <span class="risk-banner-value">${esc(seizureControlLabel(seizureControl))}</span>
        </div>
        <span class="risk-badge ${reviewStatusClass(reviewStatus)}">${esc(reviewStatusLabel(reviewStatus))}</span>
      </div>

      <div class="risk-banner ${reviewStatusClass(reviewStatus)}">
        <div>
          <span class="risk-banner-label">Review completeness</span>
          <span class="risk-banner-value">${esc(reviewStatusLabel(reviewStatus))}</span>
        </div>
        <span class="risk-badge ${reviewStatusClass(reviewStatus)}">${completenessScore} of ${total} domains</span>
      </div>

      <h3>Seizure control</h3>
      ${controlAdvice}

      <h3>Review completeness</h3>
      ${reviewAdvice}
      <table class="subscales">
        <thead>
          <tr><th scope="col">Review domain</th><th scope="col">Status</th></tr>
        </thead>
        <tbody>${componentRows}</tbody>
      </table>

      <h3>Flags (${flaggedIssues.length})</h3>
      ${flagsList}

      <h3>Fired rules</h3>
      ${rulesList}

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
  lastResult = review(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh review?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  refreshLiveSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'context',      title: 'Context' },
  { step: 2,  section: 'profile',      title: 'Profile' },
  { step: 3,  section: 'seizures',     title: 'Seizures' },
  { step: 4,  section: 'medication',   title: 'Medication' },
  { step: 5,  section: 'triggers',     title: 'Triggers' },
  { step: 6,  section: 'sudep',        title: 'SUDEP' },
  { step: 7,  section: 'injuries',     title: 'Injuries' },
  { step: 8,  section: 'safety',       title: 'Safety' },
  { step: 9,  section: 'childbearing', title: 'Childbearing' },
  { step: 10, section: 'mentalHealth', title: 'Mental health' },
  { step: 11, section: 'summary',      title: 'Summary' }
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
  const required = form.querySelectorAll(
    'input[data-required], select[data-required], textarea[data-required]'
  );
  const seen = new Set();
  required.forEach((input) => {
    const id = input.id;
    if (seen.has(id)) return;
    seen.add(id);
    const value = (input.value || '').trim();
    if (!value) {
      const labelEl = form.querySelector(`label[for="${id}"]`);
      const labelText = labelEl
        ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim()
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
  host.appendChild(renderStep9());
  host.appendChild(renderStep10());
  host.appendChild(renderStep11());
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  refreshLiveSummary();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
