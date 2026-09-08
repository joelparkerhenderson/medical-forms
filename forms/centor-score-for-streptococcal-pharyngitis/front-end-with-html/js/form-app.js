import { detectFlaggedIssues } from './flags.js';
import { calculateCentorGrade } from './grader.js';
import { ageModifierLabel, emptyAssessment, priorityLabel, riskBandClass, riskBandLabel } from './types.js';

// Centor Score for Streptococcal Pharyngitis — sore-throat wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// Centor total, McIsaac age modifier, and modified score update as the four
// criteria and the patient age are entered. Submission runs the pure scoring
// engine (per-criterion points, Centor total 0-4, McIsaac score -1..5, risk
// band, flagged issues) and renders an inline report. State is persisted to
// localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'centor-score-for-streptococcal-pharyngitis.front-end-with-html.v1';

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
  slug: 'centor-score-for-streptococcal-pharyngitis',
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
// Section renderers (1 per assessment step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, and in what care setting.'
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
      { value: 'gp', label: 'General practitioner' },
      { value: 'nurse-practitioner', label: 'Nurse practitioner' },
      { value: 'pharmacist', label: 'Pharmacist' },
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
      { value: 'general-practice', label: 'General practice' },
      { value: 'urgent-care', label: 'Urgent / out-of-hours care' },
      { value: 'pharmacy', label: 'Community pharmacy' },
      { value: 'emergency-department', label: 'Emergency department' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age, and sex. Age drives the McIsaac modifier; the tool is for patients aged 3 years and over.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. GP-100482 or NHS number'
  }));
  card.appendChild(textInput({
    label: 'Age',
    section: 'identification', field: 'ageYears',
    type: 'number', min: 0, max: 120, step: 1, unit: 'years', required: true,
    hint: 'McIsaac age modifier: +1 for ages 3–14, 0 for 15–44, −1 for 45 and over.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'McIsaac age modifier',
    id: 'age-modifier-readout',
    render: () => renderAgeModifierReadout()
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
    title: 'Tonsillar exudate',
    description: 'Centor criterion 1 — scores 1 point when exudate or swelling is present on the tonsils.'
  });

  card.appendChild(radioGroup({
    label: 'Is tonsillar exudate or swelling present?',
    section: 'exudate', field: 'tonsillarExudate', required: true, options: yesNo
  }));
  card.appendChild(readOnlyReadout({
    label: 'Criterion 1 point',
    id: 'exudate-point-readout',
    render: () => renderPointReadout('tonsillar-exudate')
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Cervical lymphadenopathy',
    description: 'Centor criterion 2 — scores 1 point when the anterior cervical lymph nodes are tender and swollen.'
  });

  card.appendChild(radioGroup({
    label: 'Are the anterior cervical lymph nodes tender and swollen?',
    section: 'nodes', field: 'tenderAnteriorCervicalNodes', required: true, options: yesNo
  }));
  card.appendChild(readOnlyReadout({
    label: 'Criterion 2 point',
    id: 'nodes-point-readout',
    render: () => renderPointReadout('tender-nodes')
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Fever',
    description: 'Centor criterion 3 — scores 1 point when the temperature is above 38 °C or there is a history of fever.'
  });

  card.appendChild(radioGroup({
    label: 'Fever — temperature > 38 °C or a history of fever?',
    section: 'fever', field: 'feverOver38', options: yesNo,
    hint: 'Answer Yes for a measured temperature above 38 °C or a reported history of fever.'
  }));
  card.appendChild(textInput({
    label: 'Measured temperature (optional)',
    section: 'fever', field: 'measuredTemperatureCelsius',
    type: 'number', min: 30, max: 45, step: 0.1, unit: '°C',
    hint: 'Optional. A value above 38.0 °C sets the fever criterion even if the flag above is left blank.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Criterion 3 point',
    id: 'fever-point-readout',
    render: () => renderPointReadout('fever')
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Cough',
    description: 'Centor criterion 4 — scores 1 point when cough is absent.'
  });

  card.appendChild(radioGroup({
    label: 'Is cough absent?',
    section: 'cough', field: 'absenceOfCough', required: true, options: yesNo,
    hint: 'The criterion scores when cough is ABSENT: answer Yes if the patient has no cough.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Criterion 4 point',
    id: 'cough-point-readout',
    render: () => renderPointReadout('cough-absent')
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Red-flag review',
    description: 'Airway / peritonsillar (quinsy) warning features. Any of these prompts urgent same-day assessment irrespective of the score.'
  });

  card.appendChild(radioGroup({
    label: 'Stridor or difficulty breathing?',
    section: 'redFlags', field: 'stridorOrBreathingDifficulty', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Drooling or unable to swallow saliva?',
    section: 'redFlags', field: 'droolingOrCannotSwallow', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Trismus (unable to fully open the mouth)?',
    section: 'redFlags', field: 'trismus', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Muffled ("hot-potato") voice?',
    section: 'redFlags', field: 'muffledVoice', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Unilateral neck swelling?',
    section: 'redFlags', field: 'unilateralNeckSwelling', options: yesNo
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Summary and score',
    description: 'Live Centor total, McIsaac modifier, modified score, and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live Centor and McIsaac score',
    id: 'live-score-readout',
    render: () => renderLiveScore()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, decisions, testing or antibiotic plan, and any safety-netting advice given.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the 0/1 point pill for a single Centor criterion. */
function renderPointReadout(criterion) {
  const grade = calculateCentorGrade(state);
  const point =
    criterion === 'tonsillar-exudate' ? grade.tonsillarExudatePoint
    : criterion === 'tender-nodes' ? grade.tenderNodesPoint
    : criterion === 'fever' ? grade.feverPoint
    : grade.coughAbsentPoint;
  const cls = point === 1 ? 'warn' : 'ok';
  const note = point === 1 ? '(positive)' : '(negative)';
  return `<strong class="${cls}">${point} point</strong> <span class="muted">${note}</span>`;
}

/** Render the McIsaac age-modifier readout. */
function renderAgeModifierReadout() {
  const grade = calculateCentorGrade(state);
  const sign = grade.ageModifier > 0 ? '+' : '';
  return `<strong>${sign}${grade.ageModifier}</strong> <span class="muted">${esc(ageModifierLabel(grade.ageModifier))}</span>`;
}

/** Render the live overall Centor total, McIsaac score, and band. */
function renderLiveScore() {
  const grade = calculateCentorGrade(state);
  const sign = grade.ageModifier > 0 ? '+' : '';
  const badge =
    `<span class="risk-badge ${riskBandClass(grade.riskBand)}">${esc(riskBandLabel(grade.riskBand))}</span>`;
  return (
    `<strong>Centor ${grade.centorScore} of 4</strong> ` +
    `<span class="muted">age modifier ${sign}${grade.ageModifier}</span> ` +
    `<strong>→ McIsaac ${grade.mcIsaacScore}</strong> ${badge}`
  );
}

function refreshLiveScore() {
  const age = document.getElementById('age-modifier-readout');
  if (age) age.innerHTML = renderAgeModifierReadout();
  const ex = document.getElementById('exudate-point-readout');
  if (ex) ex.innerHTML = renderPointReadout('tonsillar-exudate');
  const nd = document.getElementById('nodes-point-readout');
  if (nd) nd.innerHTML = renderPointReadout('tender-nodes');
  const fv = document.getElementById('fever-point-readout');
  if (fv) fv.innerHTML = renderPointReadout('fever');
  const co = document.getElementById('cough-point-readout');
  if (co) co.innerHTML = renderPointReadout('cough-absent');
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
// the slot counts as answered when ANY of its fields is answered. This lets the
// fever step count as complete when either the yes/no flag or a measured
// temperature is recorded.
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['careSetting']],
  identification: [['patientIdentifier'], ['ageYears'], ['sex']],
  exudate: [['tonsillarExudate']],
  nodes: [['tenderAnteriorCervicalNodes']],
  fever: [['feverOver38', 'measuredTemperatureCelsius']],
  cough: [['absenceOfCough']],
  redFlags: [['stridorOrBreathingDifficulty', 'droolingOrCannotSwallow', 'trismus', 'muffledVoice', 'unilateralNeckSwelling']],
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    tonsillarExudatePoint, tenderNodesPoint, feverPoint, coughAbsentPoint,
    centorScore, ageModifier, mcIsaacScore, riskBand,
    flaggedIssues, timestamp
  } = lastResult;

  const feverValue = state.fever.measuredTemperatureCelsius !== null
    ? `${state.fever.measuredTemperatureCelsius} °C${state.fever.feverOver38 ? ` (history: ${state.fever.feverOver38})` : ''}`
    : (state.fever.feverOver38 ? state.fever.feverOver38 : 'Not recorded');

  const yn = (v) => v === 'yes' ? 'Yes' : v === 'no' ? 'No' : 'Not recorded';

  const criteriaRows = [
    ['Tonsillar exudate or swelling', yn(state.exudate.tonsillarExudate), tonsillarExudatePoint],
    ['Tender anterior cervical nodes', yn(state.nodes.tenderAnteriorCervicalNodes), tenderNodesPoint],
    ['Fever (> 38 °C or history)', feverValue, feverPoint],
    ['Cough absent', yn(state.cough.absenceOfCough), coughAbsentPoint]
  ].map(([name, value, point]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
      <td class="num"><span class="grade-pill">${point} point</span></td>
    </tr>
  `).join('');

  const sign = ageModifier > 0 ? '+' : '';
  const ageValue = state.identification.ageYears === null
    ? 'Not recorded'
    : `${state.identification.ageYears} years`;

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No issues raised.</p>`
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

  const management =
    riskBand === 'high'
      ? `<p>A <strong>high</strong> modified McIsaac score (${mcIsaacScore}) indicates a high probability of streptococcal pharyngitis. Consider a rapid antigen detection test (RADT) or throat swab, or empirical antibiotics under antimicrobial-stewardship principles, with safety-netting.</p>`
      : riskBand === 'moderate'
        ? `<p>A <strong>moderate</strong> modified McIsaac score (${mcIsaacScore}) indicates an intermediate probability. Consider a RADT or throat swab and treat with antibiotics only if positive or clinically indicated.</p>`
        : `<p>A <strong>low</strong> modified McIsaac score (${mcIsaacScore}) indicates a low probability. Neither a throat swab nor an antibiotic is needed; give self-care and safety-netting advice, as most sore throats are viral and self-limiting.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Centor / McIsaac Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${riskBandClass(riskBand)}">
        <div>
          <span class="risk-banner-label">Modified McIsaac score</span>
          <span class="risk-banner-value">${mcIsaacScore} (of −1 to 5)</span>
        </div>
        <span class="risk-badge ${riskBandClass(riskBand)}">${esc(riskBandLabel(riskBand))}</span>
      </div>

      <h3>Centor criteria</h3>
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

      <h3>Score summary</h3>
      <table class="subscales">
        <tbody>
          <tr><th scope="row">Centor total</th><td>${centorScore} of 4</td></tr>
          <tr><th scope="row">Patient age</th><td>${esc(ageValue)}</td></tr>
          <tr><th scope="row">McIsaac age modifier</th><td>${sign}${ageModifier}</td></tr>
          <tr><th scope="row">Modified McIsaac score</th><td>${mcIsaacScore}</td></tr>
          <tr><th scope="row">Risk band</th><td>${esc(riskBandLabel(riskBand))}</td></tr>
        </tbody>
      </table>

      <h3>Recommended action</h3>
      ${management}

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
  const grade = calculateCentorGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade.mcIsaacScore);
  lastResult = {
    tonsillarExudatePoint: grade.tonsillarExudatePoint,
    tenderNodesPoint: grade.tenderNodesPoint,
    feverPoint: grade.feverPoint,
    coughAbsentPoint: grade.coughAbsentPoint,
    centorScore: grade.centorScore,
    ageModifier: grade.ageModifier,
    mcIsaacScore: grade.mcIsaacScore,
    riskBand: grade.riskBand,
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
  { step: 3, section: 'exudate',        title: 'Exudate' },
  { step: 4, section: 'nodes',          title: 'Nodes' },
  { step: 5, section: 'fever',          title: 'Fever' },
  { step: 6, section: 'cough',          title: 'Cough' },
  { step: 7, section: 'redFlags',       title: 'Red flags' },
  { step: 8, section: 'note',           title: 'Summary' }
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
