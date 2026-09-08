import { detectFlaggedIssues } from './flags.js';
import { gradeOttawaKnee } from './grader.js';
import { criterionLabel, decisionClass, decisionLabel, emptyAssessment, priorityLabel, yesNoLabel } from './types.js';

// Ottawa Knee Rule — bedside wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// imaging DECISION (X-ray indicated / not indicated) updates as the criteria
// are entered. Submission runs the pure decision engine (five criteria, ANY-of
// logic, fired criteria, flagged issues) and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.
//
// This is a DECISION RULE, not a score: there is no total. A knee radiograph is
// indicated when ANY one of the five criteria is present.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'ottawa-knee-rule.front-end-with-html.v1';

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
  slug: 'ottawa-knee-rule',
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
    refreshLiveDecision();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 7;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-decision readouts after each change.
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
  refreshLiveDecision();
}

/** Parse a numeric input value to a number, or null when blank/invalid. */
function toNumberOrNull(raw) {
  const s = String(raw ?? '').trim();
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
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
  if (type === 'number') {
    if (opts.min != null) attrs.push(`min="${esc(opts.min)}"`);
    if (opts.max != null) attrs.push(`max="${esc(opts.max)}"`);
    if (opts.step != null) attrs.push(`step="${esc(opts.step)}"`);
    if (opts.inputmode) attrs.push(`inputmode="${esc(opts.inputmode)}"`);
  }
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
    const v = type === 'number' ? toNumberOrNull(input.value) : input.value;
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
// Section renderers (1 per Ottawa Knee Rule step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, where, and the injury.'
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
      { value: 'nurse-practitioner', label: 'Emergency nurse practitioner' },
      { value: 'physiotherapist', label: 'Physiotherapy practitioner' },
      { value: 'paramedic', label: 'Paramedic' },
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
      { value: 'minor-injuries-unit', label: 'Minor-injuries unit' },
      { value: 'urgent-care', label: 'Urgent-care / walk-in centre' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Injury mechanism',
    section: 'context', field: 'injuryMechanism',
    options: [
      { value: 'blunt-trauma', label: 'Blunt trauma' },
      { value: 'twisting', label: 'Twisting' },
      { value: 'fall', label: 'Fall' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Hours since injury',
    section: 'context', field: 'hoursSinceInjury', type: 'number',
    min: 0, step: 0.5, inputmode: 'decimal',
    hint: 'Supports the applicability check — the rule is validated for acute injury (within about 7 days / 168 hours).',
    placeholder: 'e.g. 6'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, sex, and the injured knee. The Ottawa Knee Rule is validated in adults.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. ED-204817 or hospital MRN'
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
    label: 'Injured knee',
    section: 'identification', field: 'injuredSide', required: true,
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
    title: 'Age',
    description: 'Criterion 1 — a knee X-ray is indicated when the patient is 55 years or older.'
  });

  card.appendChild(textInput({
    label: 'Patient age (years)',
    section: 'age', field: 'ageYears', type: 'number',
    min: 0, max: 120, step: 1, inputmode: 'numeric', required: true,
    hint: 'Criterion 1 fires at age 55 or over.',
    placeholder: 'e.g. 58'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Age criterion',
    id: 'age-criterion-readout',
    render: () => renderCriterionReadout('age')
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Bony tenderness',
    description: 'Criteria 2 and 3. Patellar tenderness indicates imaging only when it is isolated — no other bony tenderness of the knee.'
  });

  card.appendChild(radioGroup({
    label: 'Tenderness at the patella?',
    section: 'tenderness', field: 'patellarTenderness', options: yesNo, required: true,
    hint: 'Part of criterion 2 — fires only when isolated (no other bony tenderness).'
  }));
  card.appendChild(radioGroup({
    label: 'Any other bony tenderness of the knee (besides the patella)?',
    section: 'tenderness', field: 'otherBonyTenderness', options: yesNo, required: true,
    hint: 'Modifier for criterion 2 — when yes, the isolated-patellar criterion does NOT fire, but this finding is flagged for review.'
  }));
  card.appendChild(radioGroup({
    label: 'Tenderness at the head of the fibula?',
    section: 'tenderness', field: 'fibularHeadTenderness', options: yesNo, required: true,
    hint: 'Criterion 3.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Isolated patellar criterion (2)',
    id: 'isolated-patellar-criterion-readout',
    render: () => renderCriterionReadout('isolated-patellar-tenderness')
  }));
  card.appendChild(readOnlyReadout({
    label: 'Fibular head criterion (3)',
    id: 'fibular-head-criterion-readout',
    render: () => renderCriterionReadout('fibular-head-tenderness')
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Knee flexion',
    description: 'Criterion 4 — inability to flex the injured knee to 90 degrees.'
  });

  card.appendChild(radioGroup({
    label: 'Is the patient unable to flex the knee to 90 degrees?',
    section: 'flexion', field: 'unableToFlex90', options: yesNo, required: true,
    hint: 'Criterion 4.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Flexion criterion (4)',
    id: 'flexion-criterion-readout',
    render: () => renderCriterionReadout('flexion')
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Weight-bearing',
    description: 'Criterion 5 — inability to take four steps (transferring weight twice onto each leg) both immediately after the injury and in the department, regardless of limping.'
  });

  card.appendChild(radioGroup({
    label: 'Is the patient unable to bear weight — take four steps — both immediately after the injury and now?',
    section: 'weightBearing', field: 'unableToBearWeight', options: yesNo, required: true,
    hint: 'Criterion 5. "Bearing weight" means transferring weight twice onto each leg (four steps), even if limping.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Weight-bearing criterion (5)',
    id: 'weight-bearing-criterion-readout',
    render: () => renderCriterionReadout('weight-bearing')
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Summary and decision',
    description: 'Live imaging decision, fired criteria, and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live imaging decision',
    id: 'live-decision-readout',
    render: () => renderLiveDecision()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNotes',
    placeholder: 'Free-text clinical note: examination detail, decision, and any imaging or safety-netting advice already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Which grade boolean corresponds to each criterion slug. */
const CRITERION_TO_FLAG = {
  'age': 'ageCriterion',
  'isolated-patellar-tenderness': 'isolatedPatellarCriterion',
  'fibular-head-tenderness': 'fibularHeadCriterion',
  'flexion': 'flexionCriterion',
  'weight-bearing': 'weightBearingCriterion'
};

/** Render a single criterion's present/absent readout. */
function renderCriterionReadout(criterion) {
  const grade = gradeOttawaKnee(state);
  const fired = grade[CRITERION_TO_FLAG[criterion]];
  const cls = fired ? 'warn' : 'ok';
  const value = fired ? 'Present' : 'Absent';
  return `<strong class="${cls}">${value}</strong> <span class="muted">${esc(criterionLabel(criterion))}</span>`;
}

/** Render the live overall imaging decision. */
function renderLiveDecision() {
  const grade = gradeOttawaKnee(state);
  const badge =
    `<span class="risk-badge ${decisionClass(grade.decision)}">${esc(decisionLabel(grade.decision))}</span>`;
  const fired = grade.firedCriteria.filter((c) => c.criterion !== 'decision');
  const firedText = fired.length === 0
    ? '<span class="muted">No criteria present</span>'
    : `<span class="muted">${fired.length} criterion(s) present: ${fired.map((c) => esc(criterionLabel(c.criterion))).join('; ')}</span>`;
  return `${badge}<div>${firedText}</div>`;
}

function refreshLiveDecision() {
  for (const criterion of Object.keys(CRITERION_TO_FLAG)) {
    const idMap = {
      'age': 'age-criterion-readout',
      'isolated-patellar-tenderness': 'isolated-patellar-criterion-readout',
      'fibular-head-tenderness': 'fibular-head-criterion-readout',
      'flexion': 'flexion-criterion-readout',
      'weight-bearing': 'weight-bearing-criterion-readout'
    };
    const el = document.getElementById(idMap[criterion]);
    if (el) el.innerHTML = renderCriterionReadout(criterion);
  }
  const live = document.getElementById('live-decision-readout');
  if (live) live.innerHTML = renderLiveDecision();
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
  identification: [['patientIdentifier'], ['sex'], ['injuredSide']],
  age: [['ageYears']],
  tenderness: [['patellarTenderness'], ['otherBonyTenderness'], ['fibularHeadTenderness']],
  flexion: [['unableToFlex90']],
  weightBearing: [['unableToBearWeight']],
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

// Criterion rows for the report table: [label, gradeFlag].
const REPORT_CRITERIA = [
  ['1 — Age >= 55 years', 'ageCriterion'],
  ['2 — Isolated patellar tenderness (no other bony tenderness)', 'isolatedPatellarCriterion'],
  ['3 — Fibular head tenderness', 'fibularHeadCriterion'],
  ['4 — Unable to flex the knee to 90 degrees', 'flexionCriterion'],
  ['5 — Unable to bear weight (four steps)', 'weightBearingCriterion']
];

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { decision, xrayIndicated, flaggedIssues, timestamp } = lastResult;

  const criteriaRows = REPORT_CRITERIA.map(([name, flag]) => {
    const present = lastResult[flag];
    return `
      <tr>
        <th scope="row">${esc(name)}</th>
        <td><span class="grade-pill">${present ? 'Present' : 'Absent'}</span></td>
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

  const pathway = xrayIndicated
    ? `<p><strong>X-ray indicated.</strong> One or more Ottawa Knee Rule criteria are present. Obtain a <strong>knee radiograph series</strong> per local protocol and manage the findings accordingly.</p>`
    : `<p><strong>X-ray not indicated.</strong> All five criteria are absent, so a knee radiograph is not required by the rule. Provide symptomatic treatment, safety-netting, and follow-up advice; re-assess if symptoms fail to settle.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Ottawa Knee Rule Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${decisionClass(decision)}">
        <div>
          <span class="risk-banner-label">Imaging decision</span>
          <span class="risk-banner-value">${esc(decisionLabel(decision))}</span>
        </div>
        <span class="risk-badge ${decisionClass(decision)}">${esc(decisionLabel(decision))}</span>
      </div>

      <p class="muted">
        The Ottawa Knee Rule is a decision rule (ANY-of), not a score: a knee
        radiograph is indicated when at least one criterion is present. The
        criteria are neither summed nor weighted.
      </p>

      <h3>Criteria</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Criterion</th>
            <th scope="col">Status</th>
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
  const grade = gradeOttawaKnee(state);
  const flaggedIssues = detectFlaggedIssues(state, grade.xrayIndicated);
  lastResult = {
    ageCriterion: grade.ageCriterion,
    isolatedPatellarCriterion: grade.isolatedPatellarCriterion,
    fibularHeadCriterion: grade.fibularHeadCriterion,
    flexionCriterion: grade.flexionCriterion,
    weightBearingCriterion: grade.weightBearingCriterion,
    xrayIndicated: grade.xrayIndicated,
    decision: grade.decision,
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
  refreshLiveDecision();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'identification', title: 'Patient' },
  { step: 3, section: 'age',            title: 'Age' },
  { step: 4, section: 'tenderness',     title: 'Tenderness' },
  { step: 5, section: 'flexion',        title: 'Flexion' },
  { step: 6, section: 'weightBearing',  title: 'Weight-bearing' },
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
  refreshLiveDecision();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
