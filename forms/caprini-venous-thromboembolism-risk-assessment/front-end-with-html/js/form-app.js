import { detectFlaggedIssues } from './flags.js';
import { calculateCapriniGrade } from './grader.js';
import { capriniRules } from './rules.js';
import { emptyAssessment, priorityLabel, recommendedProphylaxisLabel, riskBandClass, riskBandLabel, weightGroupLabel } from './types.js';

// Caprini Venous Thromboembolism Risk Assessment — clinician wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered, and a live
// Caprini total, risk band, and recommended prophylaxis update as the weighted
// risk factors are entered. Submission runs the pure scoring engine (weighted
// factor points grouped 1/2/3/5, age-band points, total, risk band, prophylaxis
// recommendation with bleeding-risk downgrade, flagged issues) and renders an
// inline report. State is persisted to localStorage so a partial fill survives a
// page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'caprini-venous-thromboembolism-risk-assessment.front-end-with-html.v1';

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
  slug: 'caprini-venous-thromboembolism-risk-assessment',
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
    refreshLiveScore();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 8;

// Factor rules grouped by weight, for building the factor steps and subtotals.
const rulesByGroup = {
  '1-point': capriniRules.filter((r) => r.weightGroup === '1-point'),
  '2-point': capriniRules.filter((r) => r.weightGroup === '2-point'),
  '3-point': capriniRules.filter((r) => r.weightGroup === '3-point'),
  '5-point': capriniRules.filter((r) => r.weightGroup === '5-point')
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress and the
 * live-score readouts after each change.
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
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
// Section renderers
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, where, and the admission type.'
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
      { value: 'surgeon', label: 'Surgeon' },
      { value: 'nurse', label: 'Nurse' },
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
      { value: 'surgical-ward', label: 'Surgical ward' },
      { value: 'medical-ward', label: 'Medical ward' },
      { value: 'pre-operative-clinic', label: 'Pre-operative clinic' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Admission type',
    section: 'context', field: 'admissionType',
    options: [
      { value: 'surgical', label: 'Surgical' },
      { value: 'medical', label: 'Medical' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age band, and sex. The Caprini model is for adults (>= 16 years).'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. SW-100482 or hospital MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    options: [
      { value: 'under-41', label: 'Under 41 (0 points)' },
      { value: '41-60', label: '41-60 (1 point)' },
      { value: '61-74', label: '61-74 (2 points)' },
      { value: '75-plus', label: '75 and over (3 points)' }
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

  card.appendChild(readOnlyReadout({
    label: 'Age-band points',
    id: 'age-band-readout',
    render: () => renderAgeBandReadout()
  }));

  return card;
}

/** Build a weighted factor step (steps 3-6) from the rules of one weight group. */
function renderFactorStep(stepNumber, group) {
  const points = Number(group[0]);
  const card = sectionCard({
    stepNumber,
    title: `${weightGroupLabel(group)} risk factors`,
    description: `Each factor present adds ${points} point${points === 1 ? '' : 's'} to the Caprini total.`
  });

  for (const rule of rulesByGroup[group]) {
    card.appendChild(radioGroup({
      label: rule.description,
      section: rule.section, field: rule.field, options: yesNo
    }));
  }

  card.appendChild(readOnlyReadout({
    label: `${weightGroupLabel(group)} subtotal`,
    id: `subtotal-readout-${group}`,
    render: () => renderSubtotalReadout(group)
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Bleeding risk',
    description: 'A high bleeding risk contraindicates pharmacological prophylaxis and downgrades the recommendation to mechanical prophylaxis.'
  });

  card.appendChild(radioGroup({
    label: 'Is there active bleeding or a high bleeding-risk contraindication to pharmacological prophylaxis?',
    section: 'bleeding', field: 'highBleedingRisk', options: yesNo,
    hint: 'When yes, any pharmacological recommendation is substituted with mechanical prophylaxis until the bleeding risk resolves.'
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Summary and score',
    description: 'Live Caprini total, risk band, and recommended prophylaxis, plus a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live Caprini score',
    id: 'live-score-readout',
    render: () => renderLiveScore()
  }));

  card.appendChild(readOnlyReadout({
    label: 'Recommended prophylaxis',
    id: 'live-prophylaxis-readout',
    render: () => renderLiveProphylaxis()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, decisions, and any prophylaxis already prescribed.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

function renderAgeBandReadout() {
  const grade = calculateCapriniGrade(state);
  const p = grade.ageBandPoints;
  const cls = p > 0 ? 'warn' : 'ok';
  return `<strong class="${cls}">${p} point${p === 1 ? '' : 's'}</strong>`;
}

function renderSubtotalReadout(group) {
  const grade = calculateCapriniGrade(state);
  const sub = grade.groupSubtotals[group] || 0;
  const cls = sub > 0 ? 'warn' : 'ok';
  return `<strong class="${cls}">${sub} point${sub === 1 ? '' : 's'}</strong> <span class="muted">from this group</span>`;
}

function renderLiveScore() {
  const grade = calculateCapriniGrade(state);
  const badge =
    `<span class="risk-badge ${riskBandClass(grade.riskBand)}">${esc(riskBandLabel(grade.riskBand))}</span>`;
  return `<strong>${grade.capriniScore}</strong> <span class="muted">total</span> ${badge}`;
}

function renderLiveProphylaxis() {
  const grade = calculateCapriniGrade(state);
  const downgrade = grade.bleedingDowngraded
    ? ` <span class="muted">(downgraded from pharmacological — high bleeding risk)</span>`
    : '';
  return `<span>${esc(recommendedProphylaxisLabel(grade.recommendedProphylaxis))}</span>${downgrade}`;
}

function refreshLiveScore() {
  const age = document.getElementById('age-band-readout');
  if (age) age.innerHTML = renderAgeBandReadout();
  for (const group of Object.keys(rulesByGroup)) {
    const el = document.getElementById(`subtotal-readout-${group}`);
    if (el) el.innerHTML = renderSubtotalReadout(group);
  }
  const live = document.getElementById('live-score-readout');
  if (live) live.innerHTML = renderLiveScore();
  const proph = document.getElementById('live-prophylaxis-readout');
  if (proph) proph.innerHTML = renderLiveProphylaxis();
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot counts as answered when
// its field is answered. Factor slots are built from the rules so every factor
// contributes to the progress total.
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['careSetting']],
  identification: [['patientIdentifier'], ['ageBand'], ['sex']],
  onePoint: rulesByGroup['1-point'].map((r) => [r.field]),
  twoPoint: rulesByGroup['2-point'].map((r) => [r.field]),
  threePoint: rulesByGroup['3-point'].map((r) => [r.field]),
  fivePoint: rulesByGroup['5-point'].map((r) => [r.field]),
  bleeding: [['highBleedingRisk']],
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
    capriniScore, ageBandPoints, groupSubtotals, riskBand,
    baseProphylaxis, recommendedProphylaxis, bleedingDowngraded,
    firedFactors, flaggedIssues, timestamp
  } = lastResult;

  const subtotalRows = [
    ['Age band', ageBandPoints],
    ['1-point factors', groupSubtotals['1-point']],
    ['2-point factors', groupSubtotals['2-point']],
    ['3-point factors', groupSubtotals['3-point']],
    ['5-point factors', groupSubtotals['5-point']]
  ].map(([name, pts]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td class="num"><span class="grade-pill">${pts} point${pts === 1 ? '' : 's'}</span></td>
    </tr>
  `).join('');

  const firedRows = firedFactors.length === 0
    ? `<tr><td colspan="3" class="muted">No factors fired.</td></tr>`
    : firedFactors.map((f) => `
      <tr>
        <th scope="row">${esc(f.description)}</th>
        <td>${esc(weightGroupLabel(f.weightGroup))}</td>
        <td class="num"><span class="grade-pill">${f.points} point${f.points === 1 ? '' : 's'}</span></td>
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

  const downgradeNote = bleedingDowngraded
    ? `<p><strong>Bleeding-risk downgrade applied.</strong> The band-based recommendation was
        <em>${esc(recommendedProphylaxisLabel(baseProphylaxis))}</em>, but a high bleeding risk substitutes
        mechanical prophylaxis until the bleeding risk resolves.</p>`
    : '';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Caprini VTE Risk Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${riskBandClass(riskBand)}">
        <div>
          <span class="risk-banner-label">Caprini score</span>
          <span class="risk-banner-value">${capriniScore}</span>
        </div>
        <span class="risk-badge ${riskBandClass(riskBand)}">${esc(riskBandLabel(riskBand))}</span>
      </div>

      <h3>Recommended prophylaxis</h3>
      <p>${esc(recommendedProphylaxisLabel(recommendedProphylaxis))}</p>
      ${downgradeNote}

      <h3>Score breakdown</h3>
      <table class="subscales">
        <thead>
          <tr><th scope="col">Weight group</th><th scope="col">Points</th></tr>
        </thead>
        <tbody>${subtotalRows}</tbody>
      </table>

      <h3>Fired factors (${firedFactors.length})</h3>
      <table class="subscales">
        <thead>
          <tr><th scope="col">Factor</th><th scope="col">Weight</th><th scope="col">Points</th></tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>

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
  const grade = calculateCapriniGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    ...grade,
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
  refreshLiveScore();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'identification', title: 'Patient' },
  { step: 3, section: 'onePoint',       title: '1-point factors' },
  { step: 4, section: 'twoPoint',       title: '2-point factors' },
  { step: 5, section: 'threePoint',     title: '3-point factors' },
  { step: 6, section: 'fivePoint',      title: '5-point factors' },
  { step: 7, section: 'bleeding',       title: 'Bleeding risk' },
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
    // `data-required` is also placed on <label>/<legend> for the required-marker
    // styling; only real form controls carry a value to validate.
    if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(input.tagName)) return;
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
  host.appendChild(renderFactorStep(3, '1-point'));
  host.appendChild(renderFactorStep(4, '2-point'));
  host.appendChild(renderFactorStep(5, '3-point'));
  host.appendChild(renderFactorStep(6, '5-point'));
  host.appendChild(renderStep7());
  host.appendChild(renderStep8());
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  refreshLiveScore();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
