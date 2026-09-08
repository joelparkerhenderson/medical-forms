import { detectFlaggedIssues } from './flags.js';
import { calculateCurb65Grade } from './grader.js';
import { dispositionLabel, emptyAssessment, priorityLabel, riskBandClass, riskBandLabel, scoreVariantLabel } from './types.js';

// CURB-65 Pneumonia Severity Score — clinician wizard (vanilla JavaScript,
// no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// CURB-65 (or CRB-65) score updates as the criteria are entered. Submission
// runs the pure scoring engine (per-criterion points, total, risk band,
// recommended disposition, flagged issues) and renders an inline report. State
// is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'curb-65-pneumonia-severity-score.front-end-with-html.v1';

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
  slug: 'curb-65-pneumonia-severity-score',
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

const TOTAL_STEPS = 9;

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
  if (opts.conditional) wrapper.setAttribute('data-conditional', opts.conditional);
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
  if (opts.conditional) wrapper.setAttribute('data-conditional', opts.conditional);
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
  if (opts.conditional) wrapper.setAttribute('data-conditional', opts.conditional);

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
  if (opts.conditional) wrapper.setAttribute('data-conditional', opts.conditional);
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
// Section renderers (1 per CURB-65 step)
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
      { value: 'physician', label: 'Physician' },
      { value: 'general-practitioner', label: 'General practitioner' },
      { value: 'advanced-nurse-practitioner', label: 'Advanced nurse practitioner' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'paramedic', label: 'Paramedic' },
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
      { value: 'primary-care', label: 'Primary care' },
      { value: 'emergency-department', label: 'Emergency department' },
      { value: 'acute-medical-unit', label: 'Acute medical unit' },
      { value: 'ward', label: 'Ward' },
      { value: 'community', label: 'Community' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier and sex. CURB-65 is for adults (>= 16 years) with community-acquired pneumonia.'
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

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Confusion (C)',
    description: 'Criterion C — scores 1 point when new-onset mental confusion is present.'
  });

  card.appendChild(radioGroup({
    label: 'Is new-onset confusion present?',
    section: 'confusion', field: 'confusionPresent', options: yesNo,
    hint: 'AMT <= 8, or new disorientation in person, place, or time.'
  }));
  card.appendChild(textInput({
    label: 'Abbreviated Mental Test (AMT) score',
    section: 'confusion', field: 'amtScore',
    type: 'number', min: 0, max: 10, step: 1,
    hint: 'Supporting evidence (0-10); not scored directly. Leave blank if not measured.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Criterion C point',
    id: 'confusion-point-readout',
    render: () => renderPointReadout('confusion')
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Urea (U)',
    description: 'Criterion U — scores 1 point when serum urea > 7 mmol/L. When urea is not measured, the four-criterion CRB-65 variant is used instead.'
  });

  card.appendChild(radioGroup({
    label: 'Was serum urea measured?',
    section: 'urea', field: 'ureaMeasured', options: yesNo,
    hint: 'Choose "No" for the primary-care CRB-65 pathway (urea criterion omitted).'
  }));
  card.appendChild(textInput({
    label: 'Serum urea',
    section: 'urea', field: 'ureaMmolL',
    type: 'number', min: 0, max: 100, step: 0.1, unit: 'mmol/L',
    hint: 'Positive (1 point) when > 7 mmol/L (blood urea nitrogen > 19 mg/dL).',
    conditional: 'urea.ureaMeasured=yes'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Criterion U point',
    id: 'urea-point-readout',
    render: () => renderPointReadout('urea')
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Respiratory rate (R)',
    description: 'Criterion R — scores 1 point when the respiratory rate is 30 breaths/min or more.'
  });

  card.appendChild(textInput({
    label: 'Measured respiratory rate',
    section: 'respiratory', field: 'respiratoryRate',
    type: 'number', min: 0, max: 80, step: 1, unit: 'breaths/min',
    hint: 'Positive (1 point) when >= 30 breaths per minute.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Criterion R point',
    id: 'respiratory-rate-point-readout',
    render: () => renderPointReadout('respiratory-rate')
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Blood pressure (B)',
    description: 'Criterion B — scores 1 point when systolic < 90 mmHg or diastolic <= 60 mmHg.'
  });

  card.appendChild(textInput({
    label: 'Systolic blood pressure',
    section: 'bloodPressure', field: 'systolicBp',
    type: 'number', min: 0, max: 300, step: 1, unit: 'mmHg',
    hint: 'Positive when < 90 mmHg.'
  }));
  card.appendChild(textInput({
    label: 'Diastolic blood pressure',
    section: 'bloodPressure', field: 'diastolicBp',
    type: 'number', min: 0, max: 200, step: 1, unit: 'mmHg',
    hint: 'Positive when <= 60 mmHg.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Criterion B point',
    id: 'blood-pressure-point-readout',
    render: () => renderPointReadout('blood-pressure')
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Age (65)',
    description: 'Criterion 65 — scores 1 point when the patient is 65 years or older. Age is derived from date of birth and confirmed here.'
  });

  card.appendChild(textInput({
    label: 'Age',
    section: 'age', field: 'ageYears',
    type: 'number', min: 0, max: 120, step: 1, unit: 'years',
    hint: 'Positive (1 point) when >= 65 years.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Criterion 65 point',
    id: 'age-point-readout',
    render: () => renderPointReadout('age')
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Adjuncts (advisory)',
    description: 'Recorded for context and safety flags; not part of the CURB-65 score.'
  });

  card.appendChild(textInput({
    label: 'Oxygen saturation (SpO₂)',
    section: 'adjuncts', field: 'oxygenSaturation',
    type: 'number', min: 0, max: 100, step: 1, unit: '%',
    hint: 'Raises a hypoxia flag when below 92%.'
  }));
  card.appendChild(textInput({
    label: 'Temperature',
    section: 'adjuncts', field: 'temperatureC',
    type: 'number', min: 25, max: 45, step: 0.1, unit: '°C'
  }));
  card.appendChild(radioGroup({
    label: 'Significant comorbidity present?',
    section: 'adjuncts', field: 'significantComorbidity', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Bilateral / multilobar changes on chest imaging?',
    section: 'adjuncts', field: 'multilobarChanges', options: yesNo
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Score and disposition',
    description: 'Live severity score, optional clinician override, and a free-text note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live severity score',
    id: 'live-score-readout',
    render: () => renderLiveScore()
  }));

  card.appendChild(selectInput({
    label: 'Clinician override — final risk band',
    section: 'disposition', field: 'clinicianOverrideBand',
    hint: 'Optional. Override the computed band when clinical judgement differs; record a reason.',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'high', label: 'High' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Override reason',
    section: 'disposition', field: 'overrideReason',
    rows: 2,
    placeholder: 'Why the final disposition differs from the computed band.'
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'disposition', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, decisions, and any escalation already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the 0/1 point pill for a single criterion. */
function renderPointReadout(criterion) {
  const grade = calculateCurb65Grade(state);

  // Urea is omitted in the CRB-65 pathway.
  if (criterion === 'urea' && state.urea.ureaMeasured !== 'yes') {
    return `<strong class="muted">Omitted</strong> <span class="muted">(CRB-65 — urea not measured)</span>`;
  }

  const point =
    criterion === 'confusion' ? grade.confusionScore
    : criterion === 'urea' ? grade.ureaScore
    : criterion === 'respiratory-rate' ? grade.respiratoryRateScore
    : criterion === 'blood-pressure' ? grade.bloodPressureScore
    : grade.ageScore;
  const cls = point === 1 ? 'warn' : 'ok';
  const note = point === 1 ? '(positive)' : '(negative)';
  return `<strong class="${cls}">${point} point</strong> <span class="muted">${note}</span>`;
}

/** Render the live overall severity score, variant, and band. */
function renderLiveScore() {
  const grade = calculateCurb65Grade(state);
  const max = grade.scoreVariant === 'crb-65' ? 4 : 5;
  const badge =
    `<span class="risk-badge ${riskBandClass(grade.riskBand)}">${esc(riskBandLabel(grade.riskBand))}</span>`;
  return `<strong>${scoreVariantLabel(grade.scoreVariant)} ${grade.totalScore} of ${max}</strong> ${badge}`;
}

function refreshLiveScore() {
  const ids = {
    'confusion-point-readout': 'confusion',
    'urea-point-readout': 'urea',
    'respiratory-rate-point-readout': 'respiratory-rate',
    'blood-pressure-point-readout': 'blood-pressure',
    'age-point-readout': 'age'
  };
  for (const [elId, criterion] of Object.entries(ids)) {
    const el = document.getElementById(elId);
    if (el) el.innerHTML = renderPointReadout(criterion);
  }
  const live = document.getElementById('live-score-readout');
  if (live) live.innerHTML = renderLiveScore();
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
  context: [['clinicianName'], ['clinicianRole'], ['careSetting']],
  identification: [['patientIdentifier'], ['sex']],
  confusion: [['confusionPresent']],
  urea: [['ureaMeasured']],
  respiratory: [['respiratoryRate']],
  bloodPressure: [['systolicBp', 'diastolicBp']],
  age: [['ageYears']],
  adjuncts: [['oxygenSaturation', 'temperatureC', 'significantComorbidity', 'multilobarChanges']],
  disposition: [['clinicalNote']]
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

  const r = lastResult;
  const max = r.scoreVariant === 'crb-65' ? 4 : 5;

  const cp = state.confusion.confusionPresent;
  const ureaMeasured = state.urea.ureaMeasured === 'yes';
  const ureaVal = state.urea.ureaMmolL;
  const rr = state.respiratory.respiratoryRate;
  const sbp = state.bloodPressure.systolicBp;
  const dbp = state.bloodPressure.diastolicBp;
  const ageYears = state.age.ageYears;

  const bpValue =
    (sbp === null && dbp === null)
      ? 'Not recorded'
      : `${sbp === null ? '—' : sbp} / ${dbp === null ? '—' : dbp} mmHg`;

  const pointCell = (point) => `<span class="grade-pill">${point} point</span>`;
  const ureaValueLabel = !ureaMeasured
    ? 'Not measured (CRB-65)'
    : (ureaVal === null ? 'Not recorded' : `${ureaVal} mmol/L`);
  const ureaPointCell = !ureaMeasured
    ? '<span class="muted">—</span>'
    : pointCell(r.ureaScore);

  const criteriaRows = [
    ['Confusion (C)', cp === '' ? 'Not recorded' : (cp === 'yes' ? 'Present' : 'Absent'), pointCell(r.confusionScore)],
    ['Urea > 7 mmol/L (U)', ureaValueLabel, ureaPointCell],
    ['Respiratory rate >= 30/min (R)', rr === null ? 'Not recorded' : `${rr} breaths/min`, pointCell(r.respiratoryRateScore)],
    ['Blood pressure < 90 / <= 60 (B)', bpValue, pointCell(r.bloodPressureScore)],
    ['Age >= 65 (65)', ageYears === null ? 'Not recorded' : `${ageYears} years`, pointCell(r.ageScore)]
  ].map(([name, value, cell]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
      <td class="num">${cell}</td>
    </tr>
  `).join('');

  const flagsList = r.flaggedIssues.length === 0
    ? `<p class="muted">No red-flag issues raised.</p>`
    : `
      <ul class="flags">
        ${r.flaggedIssues.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority))}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}${f.suggestedAction ? ` — ${esc(f.suggestedAction)}` : ''}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const overrideBand = state.disposition.clinicianOverrideBand;
  const overrideReason = state.disposition.overrideReason;
  const overrideHtml = overrideBand
    ? `<h3>Clinician override</h3>
       <p>Final risk band set to <strong>${esc(riskBandLabel(overrideBand))}</strong> by the assessing clinician${overrideReason ? `: ${esc(overrideReason)}` : '.'}</p>`
    : '';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>CURB-65 Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(r.timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${riskBandClass(r.riskBand)}">
        <div>
          <span class="risk-banner-label">${esc(scoreVariantLabel(r.scoreVariant))} score</span>
          <span class="risk-banner-value">${r.totalScore} of ${max}</span>
        </div>
        <span class="risk-badge ${riskBandClass(r.riskBand)}">${esc(riskBandLabel(r.riskBand))}</span>
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

      <h3>Recommended disposition</h3>
      <p><strong>${esc(dispositionLabel(r.recommendedDisposition))}</strong> — ${esc(r.recommendedSetting)}</p>

      ${overrideHtml}

      <h3>Flagged issues (${r.flaggedIssues.length})</h3>
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
  const grade = calculateCurb65Grade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    confusionScore: grade.confusionScore,
    ureaScore: grade.ureaScore,
    respiratoryRateScore: grade.respiratoryRateScore,
    bloodPressureScore: grade.bloodPressureScore,
    ageScore: grade.ageScore,
    curb65Score: grade.curb65Score,
    crb65Score: grade.crb65Score,
    totalScore: grade.totalScore,
    scoreVariant: grade.scoreVariant,
    riskBand: grade.riskBand,
    recommendedDisposition: grade.recommendedDisposition,
    recommendedSetting: grade.recommendedSetting,
    criteria: grade.criteria,
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
  { step: 3, section: 'confusion',      title: 'Confusion' },
  { step: 4, section: 'urea',           title: 'Urea' },
  { step: 5, section: 'respiratory',    title: 'Respiratory rate' },
  { step: 6, section: 'bloodPressure',  title: 'Blood pressure' },
  { step: 7, section: 'age',            title: 'Age' },
  { step: 8, section: 'adjuncts',       title: 'Adjuncts' },
  { step: 9, section: 'disposition',    title: 'Score' }
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
    // Skip inputs hidden by a collapsed conditional section.
    if (input.closest('[data-conditional]') &&
        input.closest('[data-conditional]').style.display === 'none') {
      return;
    }
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
  host.appendChild(renderStep9());
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
