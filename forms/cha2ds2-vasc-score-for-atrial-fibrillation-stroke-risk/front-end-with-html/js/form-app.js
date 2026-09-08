import { detectFlaggedIssues } from './flags.js';
import { calculateCha2ds2VascGrade } from './grader.js';
import { ageBandLabel, anticoagulationLabel, emptyAssessment, priorityLabel, riskBandClass, riskBandLabel } from './types.js';

// CHA2DS2-VASc Score for Atrial Fibrillation Stroke Risk — single-page wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// CHA2DS2-VASc score updates as the criteria are entered. Submission runs the
// pure scoring engine (per-criterion points, total 0-9, risk band, annual
// stroke rate, anticoagulation recommendation, flagged issues) and renders an
// inline report. State is persisted to localStorage so a partial fill survives
// a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'cha2ds2-vasc-score-for-atrial-fibrillation-stroke-risk.front-end-with-html.v1';

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
  slug: 'cha2ds2-vasc-score-for-atrial-fibrillation-stroke-risk',
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

/** Human-readable value for a yes/no criterion. */
function yesNoValue(v) {
  if (v === 'yes') return 'Yes';
  if (v === 'no') return 'No';
  return 'Not recorded';
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
// Section renderers (1 per CHA2DS2-VASc step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, where, and the type of atrial fibrillation.'
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
      { value: 'cardiology', label: 'Cardiology / arrhythmia clinic' },
      { value: 'anticoagulation-clinic', label: 'Anticoagulation clinic' },
      { value: 'emergency-department', label: 'Emergency department' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Atrial fibrillation type',
    section: 'context', field: 'atrialFibrillationType',
    options: [
      { value: 'paroxysmal', label: 'Paroxysmal' },
      { value: 'persistent', label: 'Persistent' },
      { value: 'permanent', label: 'Permanent' },
      { value: 'flutter', label: 'Atrial flutter' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age in years, and sex. Age and sex drive their own points.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. GP-100482 or hospital MRN'
  }));
  card.appendChild(textInput({
    label: 'Age',
    section: 'identification', field: 'ageYears', required: true,
    type: 'number', min: 18, max: 120, step: 1, unit: 'years',
    hint: 'Age 75 or over scores 2 points; age 65-74 scores 1 point.'
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'identification', field: 'sex', required: true,
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(readOnlyReadout({
    label: 'Sex category point (Sc)',
    id: 'sex-point-readout',
    render: () => renderPointReadout('sex')
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Cardiac history',
    description: 'Criteria C, H, and V — congestive heart failure, hypertension, and vascular disease.'
  });

  card.appendChild(radioGroup({
    label: 'Congestive heart failure or left-ventricular dysfunction? (C)',
    section: 'cardiac', field: 'congestiveHeartFailure', required: true,
    options: yesNo,
    hint: 'Signs, symptoms, or objective LV systolic dysfunction. Scores 1 point when yes.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Criterion C point',
    id: 'chf-point-readout',
    render: () => renderPointReadout('congestive-heart-failure')
  }));

  card.appendChild(radioGroup({
    label: 'Hypertension? (H)',
    section: 'cardiac', field: 'hypertension', required: true,
    options: yesNo,
    hint: 'History of hypertension, on treatment, or resting BP > 140/90 on >= 2 occasions. Scores 1 point when yes.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Criterion H point',
    id: 'htn-point-readout',
    render: () => renderPointReadout('hypertension')
  }));

  card.appendChild(radioGroup({
    label: 'Vascular disease? (V)',
    section: 'cardiac', field: 'vascularDisease', required: true,
    options: yesNo,
    hint: 'Prior myocardial infarction, peripheral artery disease, or aortic plaque. Scores 1 point when yes.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Criterion V point',
    id: 'vasc-point-readout',
    render: () => renderPointReadout('vascular-disease')
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Metabolic and thromboembolic history',
    description: 'Criteria D and S2 — diabetes mellitus, and prior stroke / TIA / thromboembolism.'
  });

  card.appendChild(radioGroup({
    label: 'Diabetes mellitus? (D)',
    section: 'metabolic', field: 'diabetes', required: true,
    options: yesNo,
    hint: 'Fasting glucose > 125 mg/dL (7 mmol/L) or on hypoglycaemic treatment. Scores 1 point when yes.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Criterion D point',
    id: 'dm-point-readout',
    render: () => renderPointReadout('diabetes')
  }));

  card.appendChild(radioGroup({
    label: 'Prior stroke, TIA, or thromboembolism? (S2)',
    section: 'metabolic', field: 'priorStrokeTiaThromboembolism', required: true,
    options: yesNo,
    hint: 'History of stroke, transient ischaemic attack, or systemic embolism. Scores 2 points when yes.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Criterion S2 point',
    id: 'stroke-point-readout',
    render: () => renderPointReadout('stroke')
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Age band',
    description: 'Criterion A — derived from age: 75 and over scores 2, 65-74 scores 1, under 65 scores 0. Mutually exclusive bands.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Derived age band',
    id: 'age-band-readout',
    render: () => renderAgeBand()
  }));

  card.appendChild(readOnlyReadout({
    label: 'Age criterion point (A)',
    id: 'age-point-readout',
    render: () => renderPointReadout('age')
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Summary and score',
    description: 'Live CHA2DS2-VASc total, estimated annual stroke rate, and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live CHA2DS2-VASc score',
    id: 'live-score-readout',
    render: () => renderLiveScore()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, the anticoagulation decision, and any HAS-BLED cross-reference.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Point value for a single criterion from the grade. */
function pointForCriterion(grade, criterion) {
  switch (criterion) {
    case 'congestive-heart-failure': return grade.congestiveHeartFailurePoint;
    case 'hypertension':             return grade.hypertensionPoint;
    case 'age':                      return grade.agePoint;
    case 'diabetes':                 return grade.diabetesPoint;
    case 'stroke':                   return grade.strokePoint;
    case 'vascular-disease':         return grade.vascularDiseasePoint;
    case 'sex':                      return grade.sexPoint;
    default:                         return 0;
  }
}

/** Render the point pill for a single criterion. */
function renderPointReadout(criterion) {
  const grade = calculateCha2ds2VascGrade(state);
  const point = pointForCriterion(grade, criterion);
  const cls = point > 0 ? 'warn' : 'ok';
  const note = point > 0 ? '(positive)' : '(negative)';
  const plural = point === 1 ? 'point' : 'points';
  return `<strong class="${cls}">${point} ${plural}</strong> <span class="muted">${note}</span>`;
}

/** Render the derived age band from the entered age. */
function renderAgeBand() {
  const age = state.identification.ageYears;
  if (age === null || age === undefined) {
    return `<span class="muted">Enter age in Step 2 to derive the band.</span>`;
  }
  return `<strong>${esc(ageBandLabel(age))}</strong>`;
}

/** Render the live overall CHA2DS2-VASc score, band, and annual stroke rate. */
function renderLiveScore() {
  const grade = calculateCha2ds2VascGrade(state);
  const badge =
    `<span class="risk-badge ${riskBandClass(grade.riskBand)}">${esc(riskBandLabel(grade.riskBand))}</span>`;
  return `<strong>${grade.cha2ds2VascScore} of 9</strong> ${badge} ` +
    `<span class="muted">~${grade.annualStrokeRatePercent}% annual stroke rate</span>`;
}

function refreshLiveScore() {
  const map = {
    'sex-point-readout': 'sex',
    'chf-point-readout': 'congestive-heart-failure',
    'htn-point-readout': 'hypertension',
    'vasc-point-readout': 'vascular-disease',
    'dm-point-readout': 'diabetes',
    'stroke-point-readout': 'stroke',
    'age-point-readout': 'age'
  };
  for (const [id, criterion] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = renderPointReadout(criterion);
  }
  const ageBand = document.getElementById('age-band-readout');
  if (ageBand) ageBand.innerHTML = renderAgeBand();
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
  identification: [['patientIdentifier'], ['ageYears'], ['sex']],
  cardiac: [['congestiveHeartFailure'], ['hypertension'], ['vascularDisease']],
  metabolic: [['diabetes'], ['priorStrokeTiaThromboembolism']],
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
    congestiveHeartFailurePoint, hypertensionPoint, agePoint, diabetesPoint,
    strokePoint, vascularDiseasePoint, sexPoint, cha2ds2VascScore, riskBand,
    annualStrokeRatePercent, anticoagulationRecommendation, flaggedIssues,
    timestamp
  } = lastResult;

  const age = state.identification.ageYears;
  const ageValue = age === null ? 'Not recorded' : `${age} years — ${ageBandLabel(age)}`;

  const criteriaRows = [
    ['Congestive heart failure / LV dysfunction (C)', yesNoValue(state.cardiac.congestiveHeartFailure), congestiveHeartFailurePoint],
    ['Hypertension (H)', yesNoValue(state.cardiac.hypertension), hypertensionPoint],
    ['Age (A) — >= 75 scores 2, 65-74 scores 1', ageValue, agePoint],
    ['Diabetes mellitus (D)', yesNoValue(state.metabolic.diabetes), diabetesPoint],
    ['Prior stroke / TIA / thromboembolism (S2)', yesNoValue(state.metabolic.priorStrokeTiaThromboembolism), strokePoint],
    ['Vascular disease (V)', yesNoValue(state.cardiac.vascularDisease), vascularDiseasePoint],
    ['Sex category — female (Sc)', state.identification.sex === 'female' ? 'Female' : (state.identification.sex ? 'Not female' : 'Not recorded'), sexPoint]
  ].map(([name, value, point]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
      <td class="num"><span class="grade-pill">${point} ${point === 1 ? 'point' : 'points'}</span></td>
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

  const recommendation =
    riskBand === 'high'
      ? `<p><strong>${esc(anticoagulationLabel(anticoagulationRecommendation))}.</strong> A DOAC is preferred (or warfarin with good time-in-therapeutic-range) unless contraindicated. Before starting, complete a <strong>HAS-BLED</strong> bleeding-risk assessment and correct modifiable bleeding risks.</p>`
      : riskBand === 'intermediate'
      ? `<p><strong>${esc(anticoagulationLabel(anticoagulationRecommendation))}.</strong> Individualise on net clinical benefit and patient preference, and cross-reference bleeding risk with <strong>HAS-BLED</strong>.</p>`
      : `<p><strong>${esc(anticoagulationLabel(anticoagulationRecommendation))}.</strong> The patient is genuinely low risk; anticoagulation is not recommended for the score alone. Re-assess if the clinical picture changes.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>CHA2DS2-VASc Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${riskBandClass(riskBand)}">
        <div>
          <span class="risk-banner-label">CHA2DS2-VASc score</span>
          <span class="risk-banner-value">${cha2ds2VascScore} of 9</span>
        </div>
        <div>
          <span class="risk-banner-label">Estimated annual stroke rate</span>
          <span class="risk-banner-value">~${annualStrokeRatePercent}%</span>
        </div>
        <span class="risk-badge ${riskBandClass(riskBand)}">${esc(riskBandLabel(riskBand))}</span>
      </div>

      <h3>Criteria</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Criterion</th>
            <th scope="col">Value</th>
            <th scope="col">Points</th>
          </tr>
        </thead>
        <tbody>${criteriaRows}</tbody>
      </table>

      <h3>Anticoagulation recommendation</h3>
      ${recommendation}

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
  const grade = calculateCha2ds2VascGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    congestiveHeartFailurePoint: grade.congestiveHeartFailurePoint,
    hypertensionPoint: grade.hypertensionPoint,
    agePoint: grade.agePoint,
    diabetesPoint: grade.diabetesPoint,
    strokePoint: grade.strokePoint,
    vascularDiseasePoint: grade.vascularDiseasePoint,
    sexPoint: grade.sexPoint,
    cha2ds2VascScore: grade.cha2ds2VascScore,
    riskBand: grade.riskBand,
    annualStrokeRatePercent: grade.annualStrokeRatePercent,
    anticoagulationRecommendation: grade.anticoagulationRecommendation,
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
  { step: 3, section: 'cardiac',        title: 'Cardiac history' },
  { step: 4, section: 'metabolic',      title: 'Metabolic / TE' },
  { step: 5, section: 'identification', title: 'Age band' },
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
