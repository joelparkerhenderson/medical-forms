import { detectFlaggedIssues } from './flags.js';
import { calculatePercGrade } from './grader.js';
import { classificationClass, classificationLabel, criterionStatusLabel, emptyAssessment, pretestProbabilityLabel, priorityLabel } from './types.js';

// Pulmonary Embolism Rule-out Criteria (PERC) — bedside wizard (vanilla
// JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a LIVE
// classification readout (PERC-negative / PERC-positive, plus the failed-criteria
// set and whether PERC is applicable) updates as the criteria are entered. This
// is a status / classification form — there is no numeric score. Submission runs
// the pure classification engine and renders an inline report. State is persisted
// to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'pulmonary-embolism-rule-out-criteria.front-end-with-html.v1';

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
  slug: 'pulmonary-embolism-rule-out-criteria',
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
    refreshLiveReadouts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 6;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress and the
 * live-classification readout after each change.
 *
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  refreshLiveReadouts();
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
// Shared option lists
// ----------------------------------------------------------------------

// For the yes/no criterion questions, phrased as the clinical finding: 'No' is
// the reassuring answer that SATISFIES the criterion.
const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per PERC step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, in what setting, and the presenting complaint prompting PE consideration.'
  });

  card.appendChild(textInput({
    label: 'Assessing clinician name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. Dr A. Rahman'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'physician', label: 'Physician' },
      { value: 'advanced-practitioner', label: 'Advanced practitioner' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of assessment',
    section: 'context', field: 'assessedAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'careSetting',
    options: [
      { value: 'emergency-department', label: 'Emergency department' },
      { value: 'acute-ambulatory', label: 'Acute ambulatory care' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Presenting complaint',
    section: 'context', field: 'presentingComplaint',
    rows: 2,
    placeholder: 'e.g. pleuritic chest pain, dyspnoea'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age, and sex. Age drives criterion 1 (age under 50 years).'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. hospital MRN or ED number'
  }));
  card.appendChild(textInput({
    label: 'Age',
    section: 'identification', field: 'age', required: true,
    type: 'number', min: 0, max: 120, step: 1, unit: 'years',
    hint: 'Criterion 1 is satisfied when age is under 50 years.'
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'identification', field: 'sex',
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
    title: 'Pre-test probability',
    description: 'The clinician gestalt pre-test probability of PE. PERC applies only when this is low; if it is not low, PERC cannot rule out PE.'
  });

  card.appendChild(radioGroup({
    label: 'Clinician gestalt pre-test probability of pulmonary embolism',
    section: 'pretest', field: 'pretestProbability', required: true,
    hint: 'PERC is validated only for patients already judged to be at low pre-test probability. Choose “Not low” for moderate or high suspicion.',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'not-low', label: 'Not low (moderate or high)' }
    ]
  }));
  card.appendChild(readOnlyReadout({
    label: 'PERC applicability',
    id: 'applicability-readout',
    render: () => renderApplicabilityReadout()
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Vital signs',
    description: 'Objective bedside measurements behind criteria 2 (heart rate) and 3 (oxygen saturation).'
  });

  card.appendChild(textInput({
    label: 'Heart rate',
    section: 'vitals', field: 'heartRate', required: true,
    type: 'number', min: 0, max: 300, step: 1, unit: 'beats/min',
    hint: 'Criterion 2 is satisfied when heart rate is under 100 beats per minute.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Criterion 2 — heart rate under 100',
    id: 'criterion2-readout',
    render: () => renderCriterionReadout(2)
  }));
  card.appendChild(textInput({
    label: 'Oxygen saturation (SpO₂)',
    section: 'vitals', field: 'oxygenSaturation', required: true,
    type: 'number', min: 0, max: 100, step: 1, unit: '%',
    hint: 'Criterion 3 is satisfied when SpO₂ is at least 95% on room air.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Criterion 3 — SpO₂ at least 95%',
    id: 'criterion3-readout',
    render: () => renderCriterionReadout(3)
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Clinical criteria',
    description: 'Criteria 4-8. Each is satisfied only when the answer is “No” — the reassuring state positively documented. A single “Yes” fails the rule.'
  });

  card.appendChild(radioGroup({
    label: 'Unilateral leg swelling present?',
    section: 'criteria', field: 'unilateralLegSwelling', required: true,
    hint: 'Criterion 4 is satisfied when there is no unilateral leg swelling.',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Haemoptysis present?',
    section: 'criteria', field: 'haemoptysis', required: true,
    hint: 'Criterion 5 is satisfied when there is no haemoptysis.',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Surgery or trauma requiring general anaesthesia in the past 4 weeks?',
    section: 'criteria', field: 'recentSurgeryOrTrauma', required: true,
    hint: 'Criterion 6 is satisfied when there has been no such recent surgery or trauma.',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Prior deep vein thrombosis or pulmonary embolism?',
    section: 'criteria', field: 'priorVenousThromboembolism', required: true,
    hint: 'Criterion 7 is satisfied when there is no prior DVT or PE.',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Current exogenous oestrogen use (oral contraceptive or HRT)?',
    section: 'criteria', field: 'oestrogenUse', required: true,
    hint: 'Criterion 8 is satisfied when there is no exogenous oestrogen use.',
    options: yesNo
  }));

  card.appendChild(readOnlyReadout({
    label: 'Live PERC classification',
    id: 'live-classification-readout',
    render: () => renderLiveClassification()
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Summary and result',
    description: 'The computed PERC classification, a free-text clinical note, and the full report on submission.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live PERC classification',
    id: 'live-classification-readout-2',
    render: () => renderLiveClassification()
  }));
  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'result', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, decisions, and any workup already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the applicable / not-applicable pill for the pre-test gate. */
function renderApplicabilityReadout() {
  const pretest = state.pretest.pretestProbability;
  if (pretest === '') {
    return `<span class="risk-badge">Not recorded</span> <span class="muted">Record the pre-test probability to apply PERC.</span>`;
  }
  const applicable = pretest === 'low';
  const cls = applicable ? 'risk-low' : 'risk-high';
  const label = applicable ? 'PERC applies' : 'PERC does not apply';
  const note = applicable
    ? `<span class="muted">Pre-test probability is ${esc(pretestProbabilityLabel(pretest))}.</span>`
    : `<span class="muted">Pre-test probability is ${esc(pretestProbabilityLabel(pretest))} — proceed to D-dimer / imaging regardless of the criteria.</span>`;
  return `<span class="risk-badge ${cls}">${esc(label)}</span> ${note}`;
}

/** Render the satisfied/failed pill for a single criterion by number. */
function renderCriterionReadout(number) {
  const grade = calculatePercGrade(state);
  const result = grade.criterionResults.find((c) => c.number === number);
  if (!result) return '';
  const cls = result.satisfied ? 'risk-low' : 'risk-high';
  return `<span class="risk-badge ${cls}">${esc(criterionStatusLabel(result.satisfied))}</span>`;
}

/** Render the live PERC classification badge, applicability, and failed criteria. */
function renderLiveClassification() {
  const grade = calculatePercGrade(state);
  const badge =
    `<span class="risk-badge ${classificationClass(grade.classification)}">${esc(classificationLabel(grade.classification))}</span>`;
  const applicability = grade.applicable
    ? `<span class="muted">PERC applicable.</span>`
    : `<span class="muted">PERC not applicable (pre-test probability not low).</span>`;
  const failed = grade.failedCriteria.length
    ? `<span class="muted">Failed criteria: ${grade.failedCriteria.join(', ')}.</span>`
    : `<span class="muted">All eight criteria satisfied.</span>`;
  return `${badge} ${applicability} ${failed}`;
}

function refreshLiveReadouts() {
  const app = document.getElementById('applicability-readout');
  if (app) app.innerHTML = renderApplicabilityReadout();
  const c2 = document.getElementById('criterion2-readout');
  if (c2) c2.innerHTML = renderCriterionReadout(2);
  const c3 = document.getElementById('criterion3-readout');
  if (c3) c3.innerHTML = renderCriterionReadout(3);
  const live1 = document.getElementById('live-classification-readout');
  if (live1) live1.innerHTML = renderLiveClassification();
  const live2 = document.getElementById('live-classification-readout-2');
  if (live2) live2.innerHTML = renderLiveClassification();
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered.
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole']],
  identification: [['patientIdentifier'], ['age']],
  pretest: [['pretestProbability']],
  vitals: [['heartRate'], ['oxygenSaturation']],
  criteria: [
    ['unilateralLegSwelling'],
    ['haemoptysis'],
    ['recentSurgeryOrTrauma'],
    ['priorVenousThromboembolism'],
    ['oestrogenUse']
  ],
  result: [['clinicalNote']]
};

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '' && v !== false;
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
    classification, allCriteriaSatisfied, applicable,
    criterionResults, failedCriteria, flaggedIssues, timestamp
  } = lastResult;

  const criterionRows = criterionResults.map((c) => {
    const status = c.satisfied ? 'Satisfied' : 'Failed';
    const cls = c.satisfied ? '' : 'flag-high';
    return `
      <tr>
        <th scope="row">${c.number}. ${esc(c.label)}</th>
        <td class="num"><span class="grade-pill ${cls}">${esc(status)}</span></td>
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

  let interpretation;
  if (classification === 'perc-negative') {
    interpretation = `<p>The pre-test probability is <strong>low</strong> and <strong>all eight criteria are satisfied</strong>. The result is <strong>PERC-negative</strong>: pulmonary embolism can be excluded on clinical grounds without a D-dimer or imaging. Document and continue as clinically appropriate.</p>`;
  } else if (!applicable) {
    interpretation = `<p>The pre-test probability is <strong>not low</strong>, so PERC does not apply${failedCriteria.length ? ` (criteria are informational only; failed criteria ${esc(failedCriteria.join(', '))})` : ' and the criteria are informational only'}. The result is <strong>PERC-positive</strong>. Proceed to D-dimer and/or imaging (CT pulmonary angiography or V/Q) per local policy.</p>`;
  } else {
    interpretation = `<p>The pre-test probability is low, but ${failedCriteria.length === 1 ? 'one criterion failed' : `${failedCriteria.length} criteria failed`} (${esc(failedCriteria.join(', '))}). The result is <strong>PERC-positive</strong>: PERC does not exclude PE. Proceed to the next step in the diagnostic pathway — D-dimer, and imaging as indicated.</p>`;
  }

  const summaryLine = `<p class="muted">All criteria satisfied: <strong>${allCriteriaSatisfied ? 'Yes' : 'No'}</strong> · PERC applicable: <strong>${applicable ? 'Yes' : 'No'}</strong>.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>PERC Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${classificationClass(classification)}">
        <div>
          <span class="risk-banner-label">Classification</span>
          <span class="risk-banner-value">${esc(classificationLabel(classification))}</span>
        </div>
        <span class="risk-badge ${classificationClass(classification)}">${esc(classificationLabel(classification))}</span>
      </div>
      ${summaryLine}

      <h3>Criteria</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Criterion</th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>${criterionRows}</tbody>
      </table>

      <h3>Interpretation</h3>
      ${interpretation}

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
  const grade = calculatePercGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    classification: grade.classification,
    allCriteriaSatisfied: grade.allCriteriaSatisfied,
    applicable: grade.applicable,
    criterionResults: grade.criterionResults,
    failedCriteria: grade.failedCriteria,
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
  refreshLiveReadouts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'identification', title: 'Patient' },
  { step: 3, section: 'pretest',        title: 'Pre-test' },
  { step: 4, section: 'vitals',         title: 'Vitals' },
  { step: 5, section: 'criteria',       title: 'Criteria' },
  { step: 6, section: 'result',         title: 'Result' }
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
  refreshLiveReadouts();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
