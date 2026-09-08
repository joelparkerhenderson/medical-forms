import { detectFlaggedIssues } from './flags.js';
import { calculateTimiGrade } from './grader.js';
import { emptyAssessment, priorityLabel, riskBandClass, riskBandLabel, workingDiagnosisLabel } from './types.js';

// TIMI Risk Score for Acute Coronary Syndrome (UA/NSTEMI) — bedside wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live TIMI
// score updates as the seven criteria are entered. Submission runs the pure
// scoring engine (per-criterion points, total 0-7, risk band, 14-day event
// risk, flagged issues) and renders an inline report. State is persisted to
// localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'timi-risk-score-for-acute-coronary-syndrome.front-end-with-html.v1';

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

/** @type {import('./types.js').AssessmentData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'timi-risk-score-for-acute-coronary-syndrome',
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

const TOTAL_STEPS = 7;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-score readout after each change.
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
// Section renderers (1 per TIMI step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, where, and the working diagnosis (UA or NSTEMI).'
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
      { value: 'physician', label: 'Physician' },
      { value: 'cardiologist', label: 'Cardiologist' },
      { value: 'nurse-practitioner', label: 'Nurse practitioner' },
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
      { value: 'chest-pain-unit', label: 'Chest-pain unit' },
      { value: 'ward', label: 'General / acute ward' },
      { value: 'coronary-care', label: 'Coronary-care unit' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Working diagnosis',
    section: 'context', field: 'workingDiagnosis', required: true,
    options: [
      { value: 'unstable-angina', label: 'Unstable angina' },
      { value: 'nstemi', label: 'NSTEMI' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier and sex. The TIMI UA/NSTEMI score is for adults with suspected UA or NSTEMI.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. ED-100482 or hospital MRN'
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
    title: 'Age and risk factors',
    description: 'Criteria 1 and 2 — age 65 or older, and three or more coronary risk factors.'
  });

  card.appendChild(radioGroup({
    label: 'Is the patient 65 years or older?',
    section: 'riskProfile', field: 'ageOver65', options: yesNo, required: true,
    hint: 'Criterion 1 — scores 1 point when the patient is aged 65 or over.'
  }));
  card.appendChild(radioGroup({
    label: 'Three or more coronary risk factors?',
    section: 'riskProfile', field: 'threeOrMoreCadRiskFactors', options: yesNo, required: true,
    hint: 'Criterion 2 — at least three of: hypertension, hypercholesterolaemia, diabetes, current smoking, family history of premature CAD.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Criterion 1 and 2 points',
    id: 'age-riskfactor-readout',
    render: () => renderPointReadout('age') + ' &nbsp; ' + renderPointReadout('risk-factors')
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Cardiac history and medication',
    description: 'Criteria 3 and 4 — known coronary artery disease, and aspirin use in the prior 7 days.'
  });

  card.appendChild(radioGroup({
    label: 'Known coronary artery disease (prior stenosis >= 50%)?',
    section: 'cardiacHistory', field: 'knownCadStenosis', options: yesNo, required: true,
    hint: 'Criterion 3 — documented coronary stenosis of 50% or more on prior angiography.'
  }));
  card.appendChild(radioGroup({
    label: 'Aspirin use in the prior 7 days?',
    section: 'cardiacHistory', field: 'aspirinUsePrior7Days', options: yesNo, required: true,
    hint: 'Criterion 4 — the patient took aspirin within the last 7 days.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Criterion 3 and 4 points',
    id: 'history-readout',
    render: () => renderPointReadout('known-cad') + ' &nbsp; ' + renderPointReadout('aspirin')
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Presentation',
    description: 'Criterion 5 — severe recent angina (two or more episodes in the last 24 hours).'
  });

  card.appendChild(radioGroup({
    label: 'Two or more anginal episodes in the last 24 hours?',
    section: 'presentation', field: 'twoOrMoreAnginaEpisodes24h', options: yesNo, required: true,
    hint: 'Criterion 5 — scores 1 point when there were at least two anginal episodes in the prior 24 hours.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Criterion 5 point',
    id: 'angina-readout',
    render: () => renderPointReadout('angina')
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Investigations',
    description: 'Criteria 6 and 7 — ST-segment deviation, and a positive cardiac marker.'
  });

  card.appendChild(radioGroup({
    label: 'ST-segment deviation >= 0.5 mm on the presenting ECG?',
    section: 'investigations', field: 'stDeviation', options: yesNo, required: true,
    hint: 'Criterion 6 — transient or persistent ST-segment deviation of 0.5 mm or more.'
  }));
  card.appendChild(radioGroup({
    label: 'Positive cardiac marker (elevated troponin or CK-MB)?',
    section: 'investigations', field: 'positiveCardiacMarker', options: yesNo, required: true,
    hint: 'Criterion 7 — an elevated troponin or CK-MB result.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Criterion 6 and 7 points',
    id: 'investigations-readout',
    render: () => renderPointReadout('st-deviation') + ' &nbsp; ' + renderPointReadout('cardiac-marker')
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Summary and score',
    description: 'Live TIMI total, risk band, 14-day event risk, and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live TIMI score',
    id: 'live-score-readout',
    render: () => renderLiveScore()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, decisions, and any escalation already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

const CRITERION_POINT_KEY = {
  'age': 'agePoint',
  'risk-factors': 'riskFactorPoint',
  'known-cad': 'knownCadPoint',
  'aspirin': 'aspirinPoint',
  'angina': 'anginaPoint',
  'st-deviation': 'stDeviationPoint',
  'cardiac-marker': 'cardiacMarkerPoint'
};

const CRITERION_SHORT_LABEL = {
  'age': 'Age >= 65',
  'risk-factors': '>= 3 risk factors',
  'known-cad': 'Known CAD',
  'aspirin': 'Aspirin',
  'angina': '>= 2 angina',
  'st-deviation': 'ST deviation',
  'cardiac-marker': 'Cardiac marker'
};

/** Render the 0/1 point pill for a single criterion. */
function renderPointReadout(criterion) {
  const grade = calculateTimiGrade(state);
  const point = grade[CRITERION_POINT_KEY[criterion]];
  const cls = point === 1 ? 'warn' : 'ok';
  const note = point === 1 ? '(positive)' : '(negative)';
  const label = CRITERION_SHORT_LABEL[criterion];
  return `<span class="muted">${esc(label)}:</span> <strong class="${cls}">${point}</strong> <span class="muted">${note}</span>`;
}

/** Render the live overall TIMI score, band, and 14-day risk. */
function renderLiveScore() {
  const grade = calculateTimiGrade(state);
  const badge =
    `<span class="risk-badge ${riskBandClass(grade.riskBand)}">${esc(riskBandLabel(grade.riskBand))}</span>`;
  return `<strong>${grade.timiScore} of 7</strong> ${badge} ` +
    `<span class="muted">~${grade.fourteenDayRiskPercent}% 14-day event risk</span>`;
}

function refreshLiveScore() {
  const ids = [
    'age-riskfactor-readout', 'history-readout', 'angina-readout',
    'investigations-readout'
  ];
  const criteriaByReadout = {
    'age-riskfactor-readout': () => renderPointReadout('age') + ' &nbsp; ' + renderPointReadout('risk-factors'),
    'history-readout': () => renderPointReadout('known-cad') + ' &nbsp; ' + renderPointReadout('aspirin'),
    'angina-readout': () => renderPointReadout('angina'),
    'investigations-readout': () => renderPointReadout('st-deviation') + ' &nbsp; ' + renderPointReadout('cardiac-marker')
  };
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = criteriaByReadout[id]();
  }
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
  context: [['clinicianName'], ['clinicianRole'], ['careSetting'], ['workingDiagnosis']],
  identification: [['patientIdentifier'], ['sex']],
  riskProfile: [['ageOver65'], ['threeOrMoreCadRiskFactors']],
  cardiacHistory: [['knownCadStenosis'], ['aspirinUsePrior7Days']],
  presentation: [['twoOrMoreAnginaEpisodes24h']],
  investigations: [['stDeviation'], ['positiveCardiacMarker']],
  note: [['clinicalNote']]
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

function yesNoValue(v) {
  if (v === 'yes') return 'Yes';
  if (v === 'no') return 'No';
  return 'Not recorded';
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    agePoint, riskFactorPoint, knownCadPoint, aspirinPoint, anginaPoint,
    stDeviationPoint, cardiacMarkerPoint, timiScore, riskBand,
    fourteenDayRiskPercent, flaggedIssues, timestamp
  } = lastResult;

  const rp = state.riskProfile;
  const ch = state.cardiacHistory;
  const pr = state.presentation;
  const inv = state.investigations;

  const criteriaRows = [
    ['Age 65 years or older', yesNoValue(rp.ageOver65), agePoint],
    ['Three or more coronary risk factors', yesNoValue(rp.threeOrMoreCadRiskFactors), riskFactorPoint],
    ['Known coronary artery disease (stenosis >= 50%)', yesNoValue(ch.knownCadStenosis), knownCadPoint],
    ['Aspirin use in prior 7 days', yesNoValue(ch.aspirinUsePrior7Days), aspirinPoint],
    ['Two or more anginal episodes in 24 h', yesNoValue(pr.twoOrMoreAnginaEpisodes24h), anginaPoint],
    ['ST deviation >= 0.5 mm', yesNoValue(inv.stDeviation), stDeviationPoint],
    ['Positive cardiac marker (troponin / CK-MB)', yesNoValue(inv.positiveCardiacMarker), cardiacMarkerPoint]
  ].map(([name, value, point]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
      <td class="num"><span class="grade-pill">${point} point</span></td>
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

  let escalation;
  if (riskBand === 'high') {
    escalation = `<p>This is a <strong>high-risk</strong> TIMI score. Pursue an <strong>early invasive strategy</strong> with urgent cardiology / coronary-care involvement and intensified antithrombotic and anti-ischaemic therapy.</p>`;
  } else if (riskBand === 'intermediate') {
    escalation = `<p>This is an <strong>intermediate-risk</strong> TIMI score. Admit for observation with guideline-directed medical therapy; an <strong>early invasive strategy should be considered</strong>, with cardiology review.</p>`;
  } else {
    escalation = `<p>This is a <strong>low-risk</strong> TIMI score. Consider a conservative, ischaemia-guided strategy with continued monitoring and serial troponin. A low score does not exclude an acute coronary syndrome — re-score if the patient deteriorates.</p>`;
  }

  const dxLabel = workingDiagnosisLabel(state.context.workingDiagnosis);

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>TIMI UA/NSTEMI Risk-Score Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}${dxLabel ? ` · Working diagnosis: ${esc(dxLabel)}` : ''}</p>
      </header>

      <div class="risk-banner ${riskBandClass(riskBand)}">
        <div>
          <span class="risk-banner-label">TIMI score</span>
          <span class="risk-banner-value">${timiScore} of 7</span>
        </div>
        <div>
          <span class="risk-banner-label">14-day event risk</span>
          <span class="risk-banner-value">~${fourteenDayRiskPercent}%</span>
        </div>
        <span class="risk-badge ${riskBandClass(riskBand)}">${esc(riskBandLabel(riskBand))}</span>
      </div>

      <h3>Criteria</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Criterion</th>
            <th scope="col">Value</th>
            <th scope="col">Point</th>
          </tr>
        </thead>
        <tbody>${criteriaRows}</tbody>
      </table>

      <h3>Recommended action</h3>
      ${escalation}

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
  const grade = calculateTimiGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade.timiScore);
  lastResult = {
    agePoint: grade.agePoint,
    riskFactorPoint: grade.riskFactorPoint,
    knownCadPoint: grade.knownCadPoint,
    aspirinPoint: grade.aspirinPoint,
    anginaPoint: grade.anginaPoint,
    stDeviationPoint: grade.stDeviationPoint,
    cardiacMarkerPoint: grade.cardiacMarkerPoint,
    timiScore: grade.timiScore,
    riskBand: grade.riskBand,
    fourteenDayRiskPercent: grade.fourteenDayRiskPercent,
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
  { step: 3, section: 'riskProfile',    title: 'Age & risk factors' },
  { step: 4, section: 'cardiacHistory', title: 'History & medication' },
  { step: 5, section: 'presentation',   title: 'Presentation' },
  { step: 6, section: 'investigations', title: 'Investigations' },
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
  refreshLiveScore();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
