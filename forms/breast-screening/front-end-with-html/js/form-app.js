import { detectFlaggedIssues } from './flags.js';
import { calculateGrade } from './grader.js';
import { eligibilityLabel, emptyAssessment, imagingClassLabel, outcomeBandClass, outcomeBandLabel, priorityLabel, readingOutcomeLabel, screeningOutcomeLabel } from './types.js';

// Breast Screening Record (NHS Breast Screening Programme) — screening wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// screening-outcome readout updates as eligibility, the reading outcome, and
// the assessment classification are entered. Submission runs the pure
// classification engine (eligibility gate → reading outcome → assessment result
// → screening outcome, plus flagged issues) and renders an inline report. State
// is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'breast-screening.front-end-with-html.v1';

/** @returns {import('./types.js').ScreeningData} */
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
    console.warn('Could not parse saved screening record; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').ScreeningData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save screening record to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored screening record.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

/** @type {import('./types.js').ScreeningData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'breast-screening',
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
    refreshLiveOutcome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 7;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-outcome readout after each change.
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
  refreshLiveOutcome();
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
    let v = sel.value;
    // Numeric selects (e.g. imaging classification 1–5) coerce to number|null
    // so the pure grader can compare strictly against 1..5.
    if (opts.numeric) v = v === '' ? null : Number(v);
    setField(opts.section, opts.field, v);
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

/** Multi-select checkbox group; state value is an array of chosen values. */
function checkboxGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = Array.isArray(state[opts.section][opts.field])
    ? state[opts.section][opts.field]
    : [];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field checkbox-fieldset';
  wrapper.id = `${groupId}-fieldset`;
  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  wrapper.appendChild(legend);
  const list = document.createElement('div');
  list.className = 'checkbox-group';
  list.setAttribute('role', 'group');
  list.setAttribute('aria-labelledby', `${groupId}-fieldset`);
  for (const option of opts.options) {
    const boxId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.className = 'checkbox-input';
    label.htmlFor = boxId;
    const checked = current.includes(option.value) ? ' checked' : '';
    label.innerHTML = `
      <input class="checkbox-input" type="checkbox" id="${boxId}" name="${groupId}" value="${esc(option.value)}"${checked}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      const chosen = Array.isArray(state[opts.section][opts.field])
        ? state[opts.section][opts.field].slice()
        : [];
      const idx = chosen.indexOf(option.value);
      if (input.checked && idx === -1) chosen.push(option.value);
      if (!input.checked && idx !== -1) chosen.splice(idx, 1);
      setField(opts.section, opts.field, chosen);
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);
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
// Section renderers (1 per screening step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Screening context',
    description: 'Who is reporting, when, where, and the screening episode type.'
  });

  card.appendChild(textInput({
    label: 'Reporting clinician name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. Dr A. Khan'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'mammographer', label: 'Mammographer' },
      { value: 'advanced-practitioner', label: 'Advanced-practitioner radiographer' },
      { value: 'breast-radiologist', label: 'Breast radiologist' },
      { value: 'screening-office', label: 'Screening office' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time reported',
    section: 'context', field: 'reportedAt', type: 'datetime-local'
  }));
  card.appendChild(textInput({
    label: 'Screening unit',
    section: 'context', field: 'screeningUnit',
    placeholder: 'e.g. City static unit or Mobile unit 3'
  }));
  card.appendChild(selectInput({
    label: 'Episode type',
    section: 'context', field: 'episodeType', required: true,
    options: [
      { value: 'routine-recall', label: 'Routine recall' },
      { value: 'very-first-call', label: 'Very first call' },
      { value: 'self-referral', label: 'Self-referral' },
      { value: 'higher-risk-surveillance', label: 'Higher-risk surveillance' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Identification & eligibility',
    description: 'Patient identifier, age, previous screen, and the surveillance-pathway flag. Routine screening invites women aged 50–70.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. NHS number or local screening ID'
  }));
  card.appendChild(textInput({
    label: 'Age in years',
    section: 'identification', field: 'ageYears', required: true,
    type: 'number', min: 0, max: 120, step: 1, unit: 'years',
    hint: 'Routine eligible range is 50–70; outside this a routine episode raises an age-range flag.'
  }));
  card.appendChild(textInput({
    label: 'Date last screened',
    section: 'identification', field: 'lastScreenedDate', type: 'date',
    hint: 'More than ~36 months ago raises an overdue flag.'
  }));
  card.appendChild(radioGroup({
    label: 'On the higher-risk surveillance pathway?',
    section: 'identification', field: 'higherRiskSurveillance', options: yesNo
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Symptom & consent check',
    description: 'A woman with a breast symptom is not a screening candidate and must be referred via the symptomatic pathway.'
  });

  card.appendChild(radioGroup({
    label: 'Is a breast symptom reported?',
    section: 'eligibility', field: 'symptomatic', options: yesNo, required: true
  }));
  card.appendChild(selectInput({
    label: 'Consent to image given?',
    section: 'eligibility', field: 'consentGiven', required: true,
    options: [
      { value: 'yes', label: 'Yes — consent given' },
      { value: 'no', label: 'No' },
      { value: 'declined', label: 'Declined' }
    ]
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Mammogram',
    description: 'Views taken and the adequacy of the images.'
  });

  card.appendChild(selectInput({
    label: 'Views taken',
    section: 'mammogram', field: 'viewsTaken', required: true,
    options: [
      { value: 'standard-four-view', label: 'Standard four-view' },
      { value: 'additional-views', label: 'Additional views' },
      { value: 'unable-to-image', label: 'Unable to image' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Image adequacy',
    section: 'mammogram', field: 'imageAdequacy', required: true,
    options: [
      { value: 'adequate', label: 'Adequate' },
      { value: 'inadequate', label: 'Inadequate' }
    ],
    hint: 'An inadequate image raises the technical-repeat flag.'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Reading outcome',
    description: 'Double reading with arbitration. The overall reading outcome drives the screening outcome.'
  });

  const readOpinionOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'recall', label: 'Recall' },
    { value: 'technical', label: 'Technical' }
  ];

  card.appendChild(selectInput({
    label: 'First-read opinion',
    section: 'reading', field: 'firstReadOpinion',
    options: readOpinionOptions
  }));
  card.appendChild(selectInput({
    label: 'Second-read opinion',
    section: 'reading', field: 'secondReadOpinion',
    options: readOpinionOptions
  }));
  card.appendChild(selectInput({
    label: 'Arbitration outcome',
    section: 'reading', field: 'arbitrationOutcome',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'recall', label: 'Recall' },
      { value: 'technical', label: 'Technical' },
      { value: 'not-required', label: 'Not required (reads agree)' }
    ],
    hint: 'Use when the two reads disagree.'
  }));
  card.appendChild(selectInput({
    label: 'Overall reading outcome',
    section: 'reading', field: 'readingOutcome', required: true,
    options: [
      { value: 'normal-routine-recall', label: 'Normal — routine recall' },
      { value: 'technical-repeat', label: 'Technical repeat' },
      { value: 'recall-for-assessment', label: 'Recall for assessment' }
    ]
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Assessment result',
    description: 'Complete only when the woman is recalled for assessment. The five-point imaging classification refines the outcome.'
  });

  card.appendChild(radioGroup({
    label: 'Assessment clinic attended?',
    section: 'assessment', field: 'assessmentPerformed', options: yesNo
  }));

  // Modalities + classification are only meaningful once assessment is done.
  const conditional = document.createElement('div');
  conditional.setAttribute('data-conditional', 'assessment.assessmentPerformed=yes');

  conditional.appendChild(checkboxGroup({
    label: 'Assessment modalities used',
    section: 'assessment', field: 'assessmentModalities',
    options: [
      { value: 'mammography', label: 'Mammography' },
      { value: 'ultrasound', label: 'Ultrasound' },
      { value: 'biopsy', label: 'Biopsy' }
    ]
  }));
  conditional.appendChild(selectInput({
    label: 'Breast imaging classification',
    section: 'assessment', field: 'imagingClassification', numeric: true,
    options: [
      { value: '1', label: '1 — Normal' },
      { value: '2', label: '2 — Benign' },
      { value: '3', label: '3 — Indeterminate / probably benign' },
      { value: '4', label: '4 — Suspicious' },
      { value: '5', label: '5 — Malignant' }
    ],
    hint: 'Classes 4–5 are suspicious/malignant and prompt an urgent breast-clinic referral.'
  }));

  card.appendChild(conditional);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Summary & outcome',
    description: 'Live screening outcome and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live screening outcome',
    id: 'live-outcome-readout',
    render: () => renderLiveOutcome()
  }));

  card.appendChild(textArea({
    label: 'Clinical context',
    section: 'note', field: 'clinicalContext',
    placeholder: 'Free-text clinical context: decisions, discussions, and any onward referral already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the live derived screening outcome and its band badge. */
function renderLiveOutcome() {
  const grade = calculateGrade(state);
  const badge =
    `<span class="risk-badge ${outcomeBandClass(grade.outcomeBand)}">${esc(outcomeBandLabel(grade.outcomeBand))}</span>`;
  const outcome = esc(screeningOutcomeLabel(grade.screeningOutcome));
  const eligibility = esc(eligibilityLabel(grade.eligibilityStatus));
  return `<strong>${outcome}</strong> ${badge}` +
    (eligibility ? `<span class="muted"> · ${eligibility}</span>` : '');
}

function refreshLiveOutcome() {
  const live = document.getElementById('live-outcome-readout');
  if (live) live.innerHTML = renderLiveOutcome();
}

// ----------------------------------------------------------------------
// Conditional sections
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
  context: [['clinicianName'], ['clinicianRole'], ['episodeType']],
  identification: [['patientIdentifier'], ['ageYears'], ['higherRiskSurveillance']],
  eligibility: [['symptomatic'], ['consentGiven']],
  mammogram: [['viewsTaken'], ['imageAdequacy']],
  reading: [['firstReadOpinion'], ['secondReadOpinion'], ['readingOutcome']],
  assessment: [['assessmentPerformed'], ['imagingClassification']],
  note: [['clinicalContext']]
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
    eligibilityStatus, readingOutcome, imagingClassification,
    screeningOutcome, outcomeBand, status, flaggedIssues, timestamp
  } = lastResult;

  const rows = [
    ['Eligibility', eligibilityLabel(eligibilityStatus) || 'Not determined'],
    ['Reading outcome', readingOutcomeLabel(readingOutcome)],
    ['Imaging classification', imagingClassLabel(imagingClassification)],
    ['Screening outcome / next action', screeningOutcomeLabel(screeningOutcome)],
    ['Record status', status === 'complete' ? 'Complete' : 'Incomplete']
  ].map(([name, value]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
    </tr>
  `).join('');

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

  const guidance = outcomeGuidance(outcomeBand, screeningOutcome);

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Breast Screening Record — Outcome</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${outcomeBandClass(outcomeBand)}">
        <div>
          <span class="risk-banner-label">Screening outcome</span>
          <span class="risk-banner-value">${esc(screeningOutcomeLabel(screeningOutcome))}</span>
        </div>
        <span class="risk-badge ${outcomeBandClass(outcomeBand)}">${esc(outcomeBandLabel(outcomeBand))}</span>
      </div>

      <h3>Classification</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <h3>Recommended action</h3>
      ${guidance}

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

/** Short narrative guidance keyed on the outcome band. */
function outcomeGuidance(band, outcome) {
  switch (band) {
    case 'urgent':
      return `<p>This is an <strong>urgent</strong> outcome. Refer to the breast clinic without delay for tissue diagnosis and MDT discussion.</p>`;
    case 'referral':
      return `<p>The woman is <strong>symptomatic</strong>. This is not a screening outcome — refer via the symptomatic breast pathway rather than screening.</p>`;
    case 'assessment':
      return `<p>Book the woman into an <strong>assessment clinic</strong> (or short-interval follow-up as classified) and record the assessment result.</p>`;
    case 'repeat':
      return `<p><strong>Repeat the mammogram</strong> — the images could not be reported reliably. Address positioning, exposure, or movement.</p>`;
    case 'routine':
      return `<p>Return the woman to <strong>routine 3-yearly recall</strong>. A normal result does not exclude interval cancer — report new symptoms promptly.</p>`;
    default:
      return `<p>The record is <strong>incomplete</strong>. Complete the required inputs to finalise the screening outcome.</p>`;
  }
}

function submitForm() {
  const _errors = validateForm();
  if (_errors.length > 0) return;
  const grade = calculateGrade(state);
  const flaggedIssues = detectFlaggedIssues(state);
  lastResult = {
    eligibilityStatus: grade.eligibilityStatus,
    readingOutcome: grade.readingOutcome,
    imagingClassification: grade.imagingClassification,
    screeningOutcome: grade.screeningOutcome,
    outcomeBand: grade.outcomeBand,
    status: grade.status,
    firedRules: grade.firedRules,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh screening record?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveOutcome();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'identification', title: 'Identification' },
  { step: 3, section: 'eligibility',    title: 'Symptom & consent' },
  { step: 4, section: 'mammogram',      title: 'Mammogram' },
  { step: 5, section: 'reading',        title: 'Reading outcome' },
  { step: 6, section: 'assessment',     title: 'Assessment' },
  { step: 7, section: 'note',           title: 'Summary' }
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveOutcome();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
