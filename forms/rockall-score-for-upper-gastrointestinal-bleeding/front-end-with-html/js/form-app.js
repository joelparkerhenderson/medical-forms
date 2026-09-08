import { detectFlaggedIssues } from './flags.js';
import { calculateRockallGrade } from './grader.js';
import { comorbidityLabel, diagnosisLabel, emptyAssessment, endoscopyPerformedLabel, priorityLabel, riskBandClass, riskBandLabel, shockLabel, stigmataLabel } from './types.js';

// Rockall Score for Upper Gastrointestinal Bleeding — bedside wizard (vanilla
// JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered, and a live
// pre-endoscopy (clinical) Rockall total (0-7), full post-endoscopy total
// (0-11, when endoscopy is performed), and risk band update as the parameters
// are entered. Submission runs the pure scoring engine (per-parameter points,
// clinical and full totals, risk band, flagged issues) and renders an inline
// report. State is persisted to localStorage so a partial fill survives a page
// reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'rockall-score-for-upper-gastrointestinal-bleeding.front-end-with-html.v1';

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
  slug: 'rockall-score-for-upper-gastrointestinal-bleeding',
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
// Option lists
// ----------------------------------------------------------------------

const comorbidityOptions = [
  { value: 'none', label: 'No major comorbidity' },
  { value: 'major', label: 'Cardiac failure, ischaemic heart disease, or any major comorbidity' },
  { value: 'severe', label: 'Renal failure, liver failure, or disseminated malignancy' }
];

const endoscopyOptions = [
  { value: 'no', label: 'Not yet performed (pre-endoscopy / clinical score only)' },
  { value: 'yes', label: 'Endoscopy performed (calculate the full score)' }
];

const diagnosisOptions = [
  { value: 'mallory-weiss-or-none', label: 'Mallory-Weiss tear, no lesion, and no stigmata (0)' },
  { value: 'all-other', label: 'All other diagnoses (1)' },
  { value: 'upper-gi-malignancy', label: 'Malignancy of the upper GI tract (2)' }
];

const stigmataOptions = [
  { value: 'none-or-dark-spot', label: 'None, or dark spot only (0)' },
  { value: 'high-risk', label: 'Blood, adherent clot, or visible / spurting vessel (2)' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per Rockall step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, where, and the presenting complaint.'
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
      { value: 'nurse', label: 'Nurse' },
      { value: 'gastroenterologist', label: 'Gastroenterologist' },
      { value: 'endoscopist', label: 'Endoscopist' },
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
      { value: 'ward', label: 'Acute / gastroenterology ward' },
      { value: 'endoscopy-unit', label: 'Endoscopy unit' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Presenting complaint',
    section: 'context', field: 'presentingComplaint',
    placeholder: 'e.g. Haematemesis, melaena, coffee-ground vomiting'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age in years, and sex. Rockall is for adults (>= 16 years).'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. ED-100482 or hospital MRN'
  }));
  card.appendChild(textInput({
    label: 'Age',
    section: 'identification', field: 'ageYears',
    type: 'number', min: 0, max: 120, step: 1, unit: 'years',
    hint: 'Scores 0 (< 60), 1 (60-79), or 2 (>= 80 years).'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Age points',
    id: 'age-point-readout',
    render: () => renderPointReadout('age')
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
    title: 'Shock — vital signs',
    description: 'Clinical parameter — derived from heart rate and systolic blood pressure. Hypotension (SBP < 100) scores 2 and takes precedence over tachycardia (HR >= 100, 1).'
  });

  card.appendChild(textInput({
    label: 'Heart rate',
    section: 'shock', field: 'heartRate',
    type: 'number', min: 0, max: 300, step: 1, unit: 'bpm',
    hint: 'Tachycardia (1 point) when >= 100 bpm and systolic BP >= 100 mmHg.'
  }));
  card.appendChild(textInput({
    label: 'Systolic blood pressure',
    section: 'shock', field: 'systolicBloodPressure',
    type: 'number', min: 0, max: 300, step: 1, unit: 'mmHg',
    hint: 'Hypotension (2 points) when < 100 mmHg.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Shock points',
    id: 'shock-point-readout',
    render: () => renderPointReadout('shock')
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Comorbidity',
    description: 'Clinical parameter — the single most severe major comorbidity: none (0), major (2), or severe (3).'
  });

  card.appendChild(radioGroup({
    label: 'Major comorbidity',
    section: 'comorbidityStep', field: 'comorbidity',
    options: comorbidityOptions,
    hint: 'Major (2) = cardiac failure / ischaemic heart disease. Severe (3) = renal failure, liver failure, or disseminated malignancy.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Comorbidity points',
    id: 'comorbidity-point-readout',
    render: () => renderPointReadout('comorbidity')
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Endoscopy',
    description: 'Whether endoscopy has been performed. The two endoscopic parameters (diagnosis, stigmata) are recorded only when it has, and complete the full post-endoscopy score.'
  });

  card.appendChild(radioGroup({
    label: 'Has endoscopy been performed?',
    section: 'endoscopy', field: 'endoscopyPerformed',
    options: endoscopyOptions
  }));

  const conditional = document.createElement('div');
  conditional.className = 'conditional-block';
  conditional.setAttribute('data-conditional', 'endoscopy.endoscopyPerformed=yes');

  conditional.appendChild(selectInput({
    label: 'Endoscopic diagnosis',
    section: 'endoscopy', field: 'diagnosis',
    options: diagnosisOptions,
    hint: 'Endoscopic parameter (full score only).'
  }));
  conditional.appendChild(readOnlyReadout({
    label: 'Diagnosis points',
    id: 'diagnosis-point-readout',
    render: () => renderPointReadout('diagnosis')
  }));
  conditional.appendChild(selectInput({
    label: 'Stigmata of recent haemorrhage',
    section: 'endoscopy', field: 'stigmata',
    options: stigmataOptions,
    hint: 'Endoscopic parameter (full score only).'
  }));
  conditional.appendChild(readOnlyReadout({
    label: 'Stigmata points',
    id: 'stigmata-point-readout',
    render: () => renderPointReadout('stigmata')
  }));

  card.appendChild(conditional);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Summary and score',
    description: 'Live pre-endoscopy (clinical) and full Rockall totals with the risk band, and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live Rockall score',
    id: 'live-score-readout',
    render: () => renderLiveScore()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: resuscitation, transfusion, endoscopic / surgical decisions, and any escalation already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the points pill for a single parameter. */
function renderPointReadout(parameter) {
  const grade = calculateRockallGrade(state);
  let point;
  let unanswered = false;
  switch (parameter) {
    case 'age':
      point = grade.agePoints;
      unanswered = state.identification.ageYears === null;
      break;
    case 'shock':
      point = grade.shockPoints;
      unanswered = state.shock.systolicBloodPressure === null && state.shock.heartRate === null;
      break;
    case 'comorbidity':
      point = grade.comorbidityPoints;
      unanswered = state.comorbidityStep.comorbidity === '';
      break;
    case 'diagnosis':
      point = grade.diagnosisPoints;
      unanswered = state.endoscopy.diagnosis === '';
      break;
    case 'stigmata':
      point = grade.stigmataPoints;
      unanswered = state.endoscopy.stigmata === '';
      break;
    default:
      point = 0;
  }
  if (unanswered) {
    return `<span class="grade-pill">— points</span> <span class="muted">(not scored yet)</span>`;
  }
  const cls = point >= 2 ? 'warn' : 'ok';
  return `<strong class="${cls}">${point} point${point === 1 ? '' : 's'}</strong>`;
}

/** Render the live overall Rockall totals and band. */
function renderLiveScore() {
  const grade = calculateRockallGrade(state);
  const badge =
    `<span class="risk-badge ${riskBandClass(grade.riskBand)}">${esc(riskBandLabel(grade.riskBand))}</span>`;
  const full = grade.fullRockallScore !== null
    ? ` &nbsp;·&nbsp; <strong>Full ${grade.fullRockallScore} of 11</strong>`
    : ` <span class="muted">(full score pending endoscopy)</span>`;
  return `<strong>Clinical ${grade.clinicalRockallScore} of 7</strong>${full} ${badge}`;
}

function refreshLiveScore() {
  for (const p of ['age', 'shock', 'comorbidity', 'diagnosis', 'stigmata']) {
    const el = document.getElementById(`${p}-point-readout`);
    if (el) el.innerHTML = renderPointReadout(p);
  }
  const live = document.getElementById('live-score-readout');
  if (live) live.innerHTML = renderLiveScore();
}

// ----------------------------------------------------------------------
// Conditional sections (endoscopic parameters shown only when endoscopy done)
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
// the slot counts as answered when ANY of its fields is answered. The shock
// slot counts as answered when either vital sign is recorded.
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['careSetting']],
  identification: [['patientIdentifier'], ['ageYears'], ['sex']],
  shock: [['systolicBloodPressure', 'heartRate']],
  comorbidityStep: [['comorbidity']],
  endoscopy: [['endoscopyPerformed']],
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

function paramRows() {
  const age = state.identification.ageYears;
  const hr = state.shock.heartRate;
  const sbp = state.shock.systolicBloodPressure;
  const com = state.comorbidityStep.comorbidity;
  const endoscopyDone = lastResult.endoscopyDone;

  const shockValue =
    sbp === null && hr === null
      ? 'Not recorded'
      : `HR ${hr === null ? '—' : `${hr} bpm`}, SBP ${sbp === null ? '—' : `${sbp} mmHg`}`;

  const rows = [
    ['Age', age === null ? 'Not recorded' : `${age} years`, lastResult.agePoints],
    ['Shock', shockValue, lastResult.shockPoints],
    ['Comorbidity', com ? comorbidityLabel(com) : 'Not recorded', lastResult.comorbidityPoints]
  ];

  if (endoscopyDone) {
    rows.push(
      ['Endoscopic diagnosis',
        state.endoscopy.diagnosis ? diagnosisLabel(state.endoscopy.diagnosis) : 'Not recorded',
        lastResult.diagnosisPoints],
      ['Stigmata of recent haemorrhage',
        state.endoscopy.stigmata ? stigmataLabel(state.endoscopy.stigmata) : 'Not recorded',
        lastResult.stigmataPoints]
    );
  }

  return rows.map(([name, value, point]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
      <td class="num"><span class="grade-pill">${point} point${point === 1 ? '' : 's'}</span></td>
    </tr>
  `).join('');
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    clinicalRockallScore, fullRockallScore, riskBand, endoscopyDone,
    flaggedIssues, timestamp
  } = lastResult;

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

  const guidance = {
    low: `<p>This is a <strong>low-risk</strong> Rockall assessment — low risk of rebleeding and death. Where the full score is low (<= 2), consider early discharge with outpatient follow-up per local policy. A low score does not exclude significant bleeding; reassess if the patient deteriorates.</p>`,
    intermediate: `<p>This is an <strong>intermediate-risk</strong> Rockall assessment. Admit for observation, monitor for rebleeding, and obtain senior / gastroenterology review.</p>`,
    high: `<p>This is a <strong>high-risk</strong> Rockall assessment — high risk of rebleeding and death. Admit, monitor closely, and arrange endoscopic therapy, transfusion, and surgical or interventional-radiology input as indicated.</p>`,
    'clinical-only': `<p>Only the <strong>pre-endoscopy (clinical) Rockall score</strong> is available (endoscopy not yet performed). NICE recommends the Glasgow-Blatchford score for the first, pre-endoscopy decision. Arrange endoscopy and recompute the full score; escalate now if the patient is shocked or clinically unstable.</p>`
  }[riskBand];

  const fullBannerValue = endoscopyDone
    ? `${fullRockallScore} of 11 <span class="muted">(clinical ${clinicalRockallScore} of 7)</span>`
    : `Clinical ${clinicalRockallScore} of 7 <span class="muted">(full score pending endoscopy)</span>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Rockall Score Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${riskBandClass(riskBand)}">
        <div>
          <span class="risk-banner-label">Rockall score</span>
          <span class="risk-banner-value">${fullBannerValue}</span>
        </div>
        <span class="risk-badge ${riskBandClass(riskBand)}">${esc(riskBandLabel(riskBand))}</span>
      </div>

      <h3>Parameters</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Parameter</th>
            <th scope="col">Value</th>
            <th scope="col">Points</th>
          </tr>
        </thead>
        <tbody>${paramRows()}</tbody>
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

function submitForm() {
  const _errors = validateForm();
  if (_errors.length > 0) return;
  const grade = calculateRockallGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    agePoints: grade.agePoints,
    shockPoints: grade.shockPoints,
    comorbidityPoints: grade.comorbidityPoints,
    clinicalRockallScore: grade.clinicalRockallScore,
    diagnosisPoints: grade.diagnosisPoints,
    stigmataPoints: grade.stigmataPoints,
    fullRockallScore: grade.fullRockallScore,
    riskBand: grade.riskBand,
    score: grade.score,
    endoscopyDone: grade.endoscopyDone,
    firedRules: grade.firedRules,
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
  { step: 1, section: 'context',         title: 'Context' },
  { step: 2, section: 'identification',  title: 'Patient' },
  { step: 3, section: 'shock',           title: 'Shock' },
  { step: 4, section: 'comorbidityStep', title: 'Comorbidity' },
  { step: 5, section: 'endoscopy',       title: 'Endoscopy' },
  { step: 6, section: 'note',            title: 'Summary' }
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
