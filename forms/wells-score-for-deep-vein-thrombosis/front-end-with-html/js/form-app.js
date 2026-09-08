import { detectFlaggedIssues } from './flags.js';
import { calculateWellsGrade } from './grader.js';
import { bandClass, emptyAssessment, priorityLabel, recommendedInvestigationLabel, threeLevelBandLabel, twoLevelBandLabel, yesNoLabel } from './types.js';

// Wells Score for Deep Vein Thrombosis (DVT) — bedside wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live Wells
// score updates as the criteria are entered. Submission runs the pure scoring
// engine (per-criterion points, total −2..9, two-level and three-level bands,
// recommended investigation, flagged issues) and renders an inline report.
// State is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'wells-score-for-deep-vein-thrombosis.front-end-with-html.v1';

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
  slug: 'wells-score-for-deep-vein-thrombosis',
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

const TOTAL_STEPS = 6;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-score readouts after each change.
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
    setField(opts.section, opts.field, input.value);
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
// Section renderers (1 per Wells DVT step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, and where.'
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
      { value: 'physician-associate', label: 'Physician associate' },
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
      { value: 'ambulatory', label: 'Ambulatory / same-day emergency care' },
      { value: 'acute-medical-unit', label: 'Acute medical unit' },
      { value: 'dvt-clinic', label: 'DVT / anticoagulation clinic' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age band, sex, and the symptomatic leg. Wells DVT is for adults (>= 18 years).'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. ED-204817 or hospital MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    options: [
      { value: '18-39', label: '18-39' },
      { value: '40-64', label: '40-64' },
      { value: '65-74', label: '65-74' },
      { value: '75-84', label: '75-84' },
      { value: '85-plus', label: '85 and over' }
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
  card.appendChild(selectInput({
    label: 'Symptomatic leg',
    section: 'identification', field: 'symptomaticLeg', required: true,
    options: [
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Predisposing factors',
    description: 'Criteria 1, 2, 3, and 9 — each scores +1 point when present.'
  });

  card.appendChild(radioGroup({
    label: 'Active cancer (treatment ongoing, within the previous 6 months, or palliative)?',
    section: 'predisposing', field: 'activeCancer', options: yesNo,
    hint: 'Criterion 1 (+1 point).'
  }));
  card.appendChild(radioGroup({
    label: 'Paralysis, paresis, or recent plaster immobilisation of the lower extremities?',
    section: 'predisposing', field: 'paralysisOrImmobilisation', options: yesNo,
    hint: 'Criterion 2 (+1 point).'
  }));
  card.appendChild(radioGroup({
    label: 'Recently bedridden >= 3 days, or major surgery within the previous 12 weeks (general or regional anaesthesia)?',
    section: 'predisposing', field: 'recentlyBedriddenOrSurgery', options: yesNo,
    hint: 'Criterion 3 (+1 point).'
  }));
  card.appendChild(radioGroup({
    label: 'Previously documented DVT?',
    section: 'predisposing', field: 'previouslyDocumentedDvt', options: yesNo,
    hint: 'Criterion 9 (+1 point).'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Predisposing subtotal',
    id: 'predisposing-subtotal-readout',
    render: () => renderSectionSubtotal('predisposing')
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Leg examination',
    description: 'Criteria 4 to 8 — each scores +1 point when present.'
  });

  card.appendChild(radioGroup({
    label: 'Localised tenderness along the distribution of the deep venous system?',
    section: 'examination', field: 'localisedTenderness', options: yesNo,
    hint: 'Criterion 4 (+1 point).'
  }));
  card.appendChild(radioGroup({
    label: 'Entire leg swollen?',
    section: 'examination', field: 'entireLegSwollen', options: yesNo,
    hint: 'Criterion 5 (+1 point).'
  }));
  card.appendChild(radioGroup({
    label: 'Calf swelling >= 3 cm larger than the asymptomatic side (measured 10 cm below the tibial tuberosity)?',
    section: 'examination', field: 'calfSwellingOver3cm', options: yesNo,
    hint: 'Criterion 6 (+1 point).'
  }));
  card.appendChild(radioGroup({
    label: 'Pitting oedema confined to the symptomatic leg?',
    section: 'examination', field: 'pittingOedema', options: yesNo,
    hint: 'Criterion 7 (+1 point).'
  }));
  card.appendChild(radioGroup({
    label: 'Collateral superficial veins (non-varicose)?',
    section: 'examination', field: 'collateralSuperficialVeins', options: yesNo,
    hint: 'Criterion 8 (+1 point).'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Examination subtotal',
    id: 'examination-subtotal-readout',
    render: () => renderSectionSubtotal('examination')
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Alternative diagnosis',
    description: 'The single Wells adjustment — subtracts 2 points when an alternative diagnosis is at least as likely as DVT.'
  });

  card.appendChild(radioGroup({
    label: 'Is an alternative diagnosis at least as likely as DVT?',
    section: 'alternative', field: 'alternativeDiagnosisAsLikely', options: yesNo,
    hint: 'Adjustment (−2 points). Examples: cellulitis, ruptured Baker cyst, superficial thrombophlebitis, muscle injury, post-thrombotic syndrome.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Adjustment applied',
    id: 'adjustment-readout',
    render: () => renderAdjustmentReadout()
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Summary and score',
    description: 'Live Wells total, band, and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live Wells score',
    id: 'live-score-readout',
    render: () => renderLiveScore()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNotes',
    placeholder: 'Free-text clinical note: context, decisions, and any investigation or interim anticoagulation already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

const SECTION_CRITERIA = {
  predisposing: [
    'activeCancer',
    'paralysisOrImmobilisation',
    'recentlyBedriddenOrSurgery',
    'previouslyDocumentedDvt'
  ],
  examination: [
    'localisedTenderness',
    'entireLegSwollen',
    'calfSwellingOver3cm',
    'pittingOedema',
    'collateralSuperficialVeins'
  ]
};

/** Render the running +1 subtotal for a criteria section. */
function renderSectionSubtotal(section) {
  const fields = SECTION_CRITERIA[section];
  const points = fields.reduce(
    (sum, f) => sum + (state[section][f] === 'yes' ? 1 : 0),
    0
  );
  const cls = points > 0 ? 'warn' : 'ok';
  return `<strong class="${cls}">+${points}</strong> <span class="muted">of ${fields.length} criteria positive</span>`;
}

/** Render the −2 adjustment readout. */
function renderAdjustmentReadout() {
  const applied = state.alternative.alternativeDiagnosisAsLikely === 'yes';
  const cls = applied ? 'warn' : 'ok';
  const value = applied ? '−2' : '0';
  const note = applied
    ? '(alternative diagnosis at least as likely)'
    : '(no adjustment)';
  return `<strong class="${cls}">${value}</strong> <span class="muted">${note}</span>`;
}

/** Render the live overall Wells score, two-level band, and recommended test. */
function renderLiveScore() {
  const grade = calculateWellsGrade(state);
  const twoBadge =
    `<span class="risk-badge ${bandClass(grade.twoLevelBand)}">${esc(twoLevelBandLabel(grade.twoLevelBand))}</span>`;
  const threeBadge =
    `<span class="risk-badge ${bandClass(grade.threeLevelBand)}">${esc(threeLevelBandLabel(grade.threeLevelBand))}</span>`;
  return `<strong>${grade.wellsScore}</strong> <span class="muted">(range −2 to 9)</span> ${twoBadge} ${threeBadge}` +
    `<div class="muted">First investigation: ${esc(recommendedInvestigationLabel(grade.recommendedInvestigation))}</div>`;
}

function refreshLiveScore() {
  const pre = document.getElementById('predisposing-subtotal-readout');
  if (pre) pre.innerHTML = renderSectionSubtotal('predisposing');
  const exam = document.getElementById('examination-subtotal-readout');
  if (exam) exam.innerHTML = renderSectionSubtotal('examination');
  const adj = document.getElementById('adjustment-readout');
  if (adj) adj.innerHTML = renderAdjustmentReadout();
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
  context: [['clinicianName'], ['clinicianRole'], ['careSetting']],
  identification: [['patientIdentifier'], ['ageBand'], ['sex'], ['symptomaticLeg']],
  predisposing: [
    ['activeCancer'],
    ['paralysisOrImmobilisation'],
    ['recentlyBedriddenOrSurgery'],
    ['previouslyDocumentedDvt']
  ],
  examination: [
    ['localisedTenderness'],
    ['entireLegSwollen'],
    ['calfSwellingOver3cm'],
    ['pittingOedema'],
    ['collateralSuperficialVeins']
  ],
  alternative: [['alternativeDiagnosisAsLikely']],
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

// Criterion rows for the report table: [label, section, field].
const REPORT_CRITERIA = [
  ['1 — Active cancer', 'predisposing', 'activeCancer', 1],
  ['2 — Paralysis / immobilisation', 'predisposing', 'paralysisOrImmobilisation', 1],
  ['3 — Bedridden >= 3 days or major surgery <= 12 weeks', 'predisposing', 'recentlyBedriddenOrSurgery', 1],
  ['4 — Localised deep-vein tenderness', 'examination', 'localisedTenderness', 1],
  ['5 — Entire leg swollen', 'examination', 'entireLegSwollen', 1],
  ['6 — Calf swelling >= 3 cm', 'examination', 'calfSwellingOver3cm', 1],
  ['7 — Pitting oedema (symptomatic leg)', 'examination', 'pittingOedema', 1],
  ['8 — Collateral superficial veins', 'examination', 'collateralSuperficialVeins', 1],
  ['9 — Previously documented DVT', 'predisposing', 'previouslyDocumentedDvt', 1],
  ['Alternative diagnosis at least as likely', 'alternative', 'alternativeDiagnosisAsLikely', -2]
];

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    wellsScore, twoLevelBand, threeLevelBand, recommendedInvestigation,
    flaggedIssues, timestamp
  } = lastResult;

  const criteriaRows = REPORT_CRITERIA.map(([name, section, field, weight]) => {
    const value = state[section][field];
    const positive = value === 'yes';
    const point = positive ? weight : 0;
    const pointText = point === 0 ? '0' : (point > 0 ? `+${point}` : String(point));
    return `
      <tr>
        <th scope="row">${esc(name)}</th>
        <td>${esc(yesNoLabel(value))}</td>
        <td class="num"><span class="grade-pill">${pointText}</span></td>
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

  const pathway = twoLevelBand === 'likely'
    ? `<p><strong>DVT likely (Wells >= 2).</strong> Offer a <strong>proximal leg vein ultrasound</strong>, ideally within 4 hours. If the scan cannot be done within 4 hours, offer a D-dimer test and interim anticoagulation, then a scan within 24 hours.</p>`
    : `<p><strong>DVT unlikely (Wells <= 1).</strong> Offer a <strong>D-dimer</strong> test with a result available within 4 hours (or interim anticoagulation if not). A negative D-dimer effectively excludes DVT; a positive D-dimer triggers a proximal leg vein ultrasound.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Wells DVT Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${bandClass(twoLevelBand)}">
        <div>
          <span class="risk-banner-label">Wells score</span>
          <span class="risk-banner-value">${wellsScore} <span class="muted">(range −2 to 9)</span></span>
        </div>
        <span class="risk-badge ${bandClass(twoLevelBand)}">${esc(twoLevelBandLabel(twoLevelBand))}</span>
      </div>

      <h3>Bands</h3>
      <p>
        Two-level (NICE NG158): <span class="risk-badge ${bandClass(twoLevelBand)}">${esc(twoLevelBandLabel(twoLevelBand))}</span>
        &nbsp;·&nbsp;
        Three-level (original Wells): <span class="risk-badge ${bandClass(threeLevelBand)}">${esc(threeLevelBandLabel(threeLevelBand))}</span>
      </p>
      <p>Recommended first investigation: <strong>${esc(recommendedInvestigationLabel(recommendedInvestigation))}</strong></p>

      <h3>Criteria</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Criterion</th>
            <th scope="col">Answer</th>
            <th scope="col">Points</th>
          </tr>
        </thead>
        <tbody>${criteriaRows}</tbody>
      </table>

      <h3>Recommended pathway</h3>
      ${pathway}

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
  const grade = calculateWellsGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade.wellsScore);
  lastResult = {
    criterionPoints: grade.criterionPoints,
    wellsScore: grade.wellsScore,
    twoLevelBand: grade.twoLevelBand,
    threeLevelBand: grade.threeLevelBand,
    recommendedInvestigation: grade.recommendedInvestigation,
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
  refreshLiveScore();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'identification', title: 'Patient' },
  { step: 3, section: 'predisposing',   title: 'Predisposing' },
  { step: 4, section: 'examination',    title: 'Examination' },
  { step: 5, section: 'alternative',    title: 'Alternative dx' },
  { step: 6, section: 'note',           title: 'Summary' }
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
