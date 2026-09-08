import { detectFlaggedIssues } from './flags.js';
import { calculateWaterlowGrade } from './grader.js';
import { emptyAssessment, optionLabel, options, preventionActionLabel, priorityLabel, riskBandClass, riskBandLabel } from './types.js';

// Waterlow Pressure Ulcer Risk Assessment — clinician wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered, and a live
// Waterlow total, risk band, and prevention recommendation update as the
// weighted categories are entered. Submission runs the pure scoring engine
// (weighted category points, summed total, risk band, prevention action,
// contributing categories, and flagged issues) and renders an inline report.
// State is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'waterlow-pressure-ulcer-risk-assessment.front-end-with-html.v1';

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
  slug: 'waterlow-pressure-ulcer-risk-assessment',
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
    refreshLiveScore();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 11;

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
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, where, and the reason for the assessment.'
  });

  card.appendChild(textInput({
    label: 'Assessing nurse name',
    section: 'context', field: 'nurseName', required: true,
    placeholder: 'e.g. Sister J. Okoye'
  }));
  card.appendChild(selectInput({
    label: 'Nurse role',
    section: 'context', field: 'nurseRole', required: true,
    options: options.nurseRole
  }));
  card.appendChild(textInput({
    label: 'Date and time of assessment',
    section: 'context', field: 'assessedAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'careSetting', required: true,
    options: options.careSetting
  }));
  card.appendChild(selectInput({
    label: 'Reason for assessment',
    section: 'context', field: 'assessmentReason', required: true,
    options: options.assessmentReason
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification and sex / age',
    description: 'Local identifier, age band, and sex. Sex and age together form a scored core category (higher age and female sex add points).'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. AW-100482 or hospital MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    options: options.ageBand
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'identification', field: 'sex', required: true,
    options: options.sex
  }));

  card.appendChild(readOnlyReadout({
    label: 'Sex + age points',
    id: 'sexage-readout',
    render: () => renderSexAgeReadout()
  }));

  return card;
}

// A single scored core / special category step (steps 3-10).
function renderCategoryStep(opts) {
  const card = sectionCard({
    stepNumber: opts.stepNumber,
    title: opts.title,
    description: opts.description
  });

  card.appendChild(selectInput({
    label: opts.label,
    section: opts.section, field: opts.field, required: true,
    options: options[opts.field],
    hint: opts.hint
  }));

  // The skin step also captures the existing-pressure-damage flag.
  if (opts.extra) card.appendChild(opts.extra());

  card.appendChild(readOnlyReadout({
    label: `${opts.title} points`,
    id: `category-readout-${opts.field}`,
    render: () => renderCategoryReadout(opts.pointsField)
  }));

  return card;
}

function renderExistingDamage() {
  return radioGroup({
    label: 'Is existing pressure damage present?',
    section: 'special', field: 'existingPressureDamage', required: true,
    options: options.existingPressureDamage,
    hint: 'Recorded pressure damage — or discoloured / broken skin above — raises an existing-pressure-damage flag; grade and treat the ulcer, do not rely on prevention alone.'
  });
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Summary and score',
    description: 'Live Waterlow total, risk band, and prevention recommendation, plus a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live Waterlow score',
    id: 'live-score-readout',
    render: () => renderLiveScore()
  }));

  card.appendChild(readOnlyReadout({
    label: 'Recommended prevention action',
    id: 'live-prevention-readout',
    render: () => renderLivePrevention()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, decisions, support surface, and repositioning plan.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

function renderSexAgeReadout() {
  const grade = calculateWaterlowGrade(state);
  const total = grade.sexPoints + grade.agePoints;
  const cls = total > 0 ? 'warn' : 'ok';
  return `<strong class="${cls}">${total} point${total === 1 ? '' : 's'}</strong> ` +
    `<span class="muted">(sex ${grade.sexPoints} + age ${grade.agePoints})</span>`;
}

function renderCategoryReadout(pointsField) {
  const grade = calculateWaterlowGrade(state);
  const p = grade[pointsField] || 0;
  const cls = p > 0 ? 'warn' : 'ok';
  return `<strong class="${cls}">${p} point${p === 1 ? '' : 's'}</strong>`;
}

function renderLiveScore() {
  const grade = calculateWaterlowGrade(state);
  const badge =
    `<span class="risk-badge ${riskBandClass(grade.riskBand)}">${esc(riskBandLabel(grade.riskBand))}</span>`;
  return `<strong>${grade.waterlowScore}</strong> <span class="muted">total</span> ${badge}`;
}

function renderLivePrevention() {
  const grade = calculateWaterlowGrade(state);
  return `<span>${esc(preventionActionLabel(grade.riskBand))}</span>`;
}

function refreshLiveScore() {
  const sexage = document.getElementById('sexage-readout');
  if (sexage) sexage.innerHTML = renderSexAgeReadout();
  for (const def of CATEGORY_READOUTS) {
    const el = document.getElementById(`category-readout-${def.field}`);
    if (el) el.innerHTML = renderCategoryReadout(def.pointsField);
  }
  const live = document.getElementById('live-score-readout');
  if (live) live.innerHTML = renderLiveScore();
  const prev = document.getElementById('live-prevention-readout');
  if (prev) prev.innerHTML = renderLivePrevention();
}

// Category readouts refreshed on each change (build, skin, continence, mobility,
// and the four special-risk groups).
const CATEGORY_READOUTS = [
  { field: 'buildWeightForHeight', pointsField: 'buildPoints' },
  { field: 'skinType', pointsField: 'skinPoints' },
  { field: 'continence', pointsField: 'continencePoints' },
  { field: 'mobility', pointsField: 'mobilityPoints' },
  { field: 'tissueMalnutrition', pointsField: 'tissueMalnutritionPoints' },
  { field: 'neurologicalDeficit', pointsField: 'neurologicalDeficitPoints' },
  { field: 'majorSurgeryTrauma', pointsField: 'majorSurgeryTraumaPoints' },
  { field: 'medication', pointsField: 'medicationPoints' }
];

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step lists the state fields ([section, field]) that count toward
// completion. A field is a "slot" that counts as answered when non-empty.
const STEP_DEFINITIONS = [
  { step: 1, section: 'context', title: 'Context', fields: [['context', 'nurseName'], ['context', 'nurseRole'], ['context', 'careSetting'], ['context', 'assessmentReason']] },
  { step: 2, section: 'identification', title: 'Patient', fields: [['identification', 'patientIdentifier'], ['identification', 'ageBand'], ['identification', 'sex']] },
  { step: 3, section: 'core', title: 'Build', fields: [['core', 'buildWeightForHeight']] },
  { step: 4, section: 'core', title: 'Skin', fields: [['core', 'skinType'], ['special', 'existingPressureDamage']] },
  { step: 5, section: 'core', title: 'Continence', fields: [['core', 'continence']] },
  { step: 6, section: 'core', title: 'Mobility', fields: [['core', 'mobility']] },
  { step: 7, section: 'special', title: 'Tissue malnutrition', fields: [['special', 'tissueMalnutrition']] },
  { step: 8, section: 'special', title: 'Neurological', fields: [['special', 'neurologicalDeficit']] },
  { step: 9, section: 'special', title: 'Surgery / trauma', fields: [['special', 'majorSurgeryTrauma']] },
  { step: 10, section: 'special', title: 'Medication', fields: [['special', 'medication']] },
  { step: 11, section: 'note', title: 'Summary', fields: [['note', 'clinicalNote']] }
];

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  let total = 0;
  const stepAnswered = {};
  const stepTotal = {};

  for (const def of STEP_DEFINITIONS) {
    stepTotal[def.step] = def.fields.length;
    stepAnswered[def.step] = 0;
    for (const [section, field] of def.fields) {
      total++;
      if (isAnswered(section, field)) {
        answered++;
        stepAnswered[def.step]++;
      }
    }
  }

  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(stepAnswered, stepTotal);
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
    waterlowScore, riskBand, preventionAction,
    contributingCategories, flaggedIssues, timestamp
  } = lastResult;

  const contributingRows = contributingCategories.length === 0
    ? `<tr><td colspan="3" class="muted">No categories contributed points.</td></tr>`
    : contributingCategories.map((c) => `
      <tr>
        <th scope="row">${esc(c.label)}</th>
        <td>${esc(c.optionLabel)}</td>
        <td class="num"><span class="grade-pill">${c.points} point${c.points === 1 ? '' : 's'}</span></td>
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

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Waterlow Pressure Ulcer Risk Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${riskBandClass(riskBand)}">
        <div>
          <span class="risk-banner-label">Waterlow score</span>
          <span class="risk-banner-value">${waterlowScore}</span>
        </div>
        <span class="risk-badge ${riskBandClass(riskBand)}">${esc(riskBandLabel(riskBand))}</span>
      </div>

      <h3>Recommended prevention action</h3>
      <p>${esc(preventionAction)}</p>

      <h3>Contributing categories (${contributingCategories.length})</h3>
      <table class="subscales">
        <thead>
          <tr><th scope="col">Category</th><th scope="col">Selected</th><th scope="col">Points</th></tr>
        </thead>
        <tbody>${contributingRows}</tbody>
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
  const grade = calculateWaterlowGrade(state);
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

function updateStepListStatuses(stepAnswered, stepTotal) {
  const ol = document.getElementById('step-list');
  if (!ol) return;
  let firstUnfinished = -1;
  for (const def of STEP_DEFINITIONS) {
    const li = ol.querySelector(`[data-step="${def.step}"]`);
    if (!li) continue;
    const a = stepAnswered[def.step] || 0;
    const t = stepTotal[def.step] || 0;
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
  host.appendChild(renderCategoryStep({
    stepNumber: 3, title: 'Build / weight for height',
    description: 'Build for height (a BMI proxy). Below average and obese add the most points.',
    label: 'Build / weight for height', section: 'core', field: 'buildWeightForHeight',
    pointsField: 'buildPoints'
  }));
  host.appendChild(renderCategoryStep({
    stepNumber: 4, title: 'Skin type / visual risk',
    description: 'Skin type and visual risk areas, and whether existing pressure damage is present.',
    label: 'Skin type / visual risk area', section: 'core', field: 'skinType',
    pointsField: 'skinPoints', extra: renderExistingDamage
  }));
  host.appendChild(renderCategoryStep({
    stepNumber: 5, title: 'Continence',
    description: 'Continence status. Moisture from incontinence increases pressure-damage risk.',
    label: 'Continence', section: 'core', field: 'continence',
    pointsField: 'continencePoints'
  }));
  host.appendChild(renderCategoryStep({
    stepNumber: 6, title: 'Mobility',
    description: 'Mobility status. Immobility is the single strongest weighted core category.',
    label: 'Mobility', section: 'core', field: 'mobility',
    pointsField: 'mobilityPoints'
  }));
  host.appendChild(renderCategoryStep({
    stepNumber: 7, title: 'Tissue malnutrition',
    description: 'Select the highest applicable tissue-malnutrition factor.',
    label: 'Tissue malnutrition', section: 'special', field: 'tissueMalnutrition',
    pointsField: 'tissueMalnutritionPoints'
  }));
  host.appendChild(renderCategoryStep({
    stepNumber: 8, title: 'Neurological deficit',
    description: 'Neurological deficit (e.g. diabetes, MS, stroke, motor / sensory deficit, paraplegia).',
    label: 'Neurological deficit', section: 'special', field: 'neurologicalDeficit',
    pointsField: 'neurologicalDeficitPoints'
  }));
  host.appendChild(renderCategoryStep({
    stepNumber: 9, title: 'Major surgery or trauma',
    description: 'Recent major surgery or trauma and time on the operating table.',
    label: 'Major surgery or trauma', section: 'special', field: 'majorSurgeryTrauma',
    pointsField: 'majorSurgeryTraumaPoints'
  }));
  host.appendChild(renderCategoryStep({
    stepNumber: 10, title: 'Medication',
    description: 'High-dose steroids, cytotoxics, or long-term anti-inflammatory medication.',
    label: 'Medication', section: 'special', field: 'medication',
    pointsField: 'medicationPoints'
  }));
  host.appendChild(renderStep11());
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
