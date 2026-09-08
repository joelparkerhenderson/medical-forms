import { detectFlaggedIssues } from './flags.js';
import { calculatePaduaGrade } from './grader.js';
import { emptyAssessment, priorityLabel, prophylaxisLabel, riskBandClass, riskBandLabel } from './types.js';

// Padua Venous Thromboembolism Risk Assessment (Padua Prediction Score) —
// bedside wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// Padua score updates as the eleven weighted risk factors are entered.
// Submission runs the pure scoring engine (per-factor points, total 0-20, risk
// band, prophylaxis recommendation, flagged issues) and renders an inline
// report. State is persisted to localStorage so a partial fill survives a page
// reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'padua-venous-thromboembolism-risk-assessment.front-end-with-html.v1';

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
  slug: 'padua-venous-thromboembolism-risk-assessment',
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
// Section renderers (1 per Padua step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, where, and the reason for admission.'
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
      { value: 'acute-medical', label: 'Acute medical' },
      { value: 'general-medical', label: 'General medical' },
      { value: 'admissions-unit', label: 'Admissions unit' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Reason for admission',
    section: 'context', field: 'admissionReason',
    placeholder: 'e.g. Community-acquired pneumonia'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age, and sex. Padua is for hospitalised medical (non-surgical) adults.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. AMU-100482 or hospital MRN'
  }));
  card.appendChild(textInput({
    label: 'Age',
    section: 'identification', field: 'ageYears',
    type: 'number', min: 0, max: 120, step: 1, unit: 'years',
    hint: 'Factor 6 — scores 1 point when the patient is 70 years or over.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Factor 6 — elderly age (>= 70)',
    id: 'age-point-readout',
    render: () => renderFactorSubtotal(['elderlyAge'])
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
    title: 'Oncology and thrombosis history',
    description: 'High-weight factors — active cancer, previous VTE, and known thrombophilia each score 3 points.'
  });

  card.appendChild(radioGroup({
    label: 'Active cancer? (metastatic and/or chemo/radiotherapy in the previous 6 months)',
    section: 'history', field: 'activeCancer', options: yesNo,
    hint: 'Factor 1 — 3 points when present.'
  }));
  card.appendChild(radioGroup({
    label: 'Previous VTE? (deep-vein thrombosis or pulmonary embolism; excludes superficial vein thrombosis)',
    section: 'history', field: 'previousVte', options: yesNo,
    hint: 'Factor 2 — 3 points when present.'
  }));
  card.appendChild(radioGroup({
    label: 'Known thrombophilia? (e.g. antithrombin, protein C or S defect, factor V Leiden, prothrombin G20210A, antiphospholipid syndrome)',
    section: 'history', field: 'knownThrombophilia', options: yesNo,
    hint: 'Factor 4 — 3 points when present.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'History factor points',
    id: 'history-points-readout',
    render: () => renderFactorSubtotal(['activeCancer', 'previousVte', 'knownThrombophilia'])
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Mobility and recent events',
    description: 'Reduced mobility scores 3 points; recent trauma or surgery scores 2 points.'
  });

  card.appendChild(radioGroup({
    label: 'Reduced mobility? (bed rest with bathroom privileges for at least 3 days)',
    section: 'mobility', field: 'reducedMobility', options: yesNo,
    hint: 'Factor 3 — 3 points when present.'
  }));
  card.appendChild(radioGroup({
    label: 'Recent trauma or surgery? (within the last month)',
    section: 'mobility', field: 'recentTraumaOrSurgery', options: yesNo,
    hint: 'Factor 5 — 2 points when present.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Mobility factor points',
    id: 'mobility-points-readout',
    render: () => renderFactorSubtotal(['reducedMobility', 'recentTraumaOrSurgery'])
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Cardiorespiratory and acute illness',
    description: 'Each of these acute conditions scores 1 point.'
  });

  card.appendChild(radioGroup({
    label: 'Acute heart and/or respiratory failure?',
    section: 'cardiorespiratory', field: 'heartOrRespiratoryFailure', options: yesNo,
    hint: 'Factor 7 — 1 point when present.'
  }));
  card.appendChild(radioGroup({
    label: 'Acute myocardial infarction or ischaemic stroke?',
    section: 'cardiorespiratory', field: 'acuteMiOrIschaemicStroke', options: yesNo,
    hint: 'Factor 8 — 1 point when present.'
  }));
  card.appendChild(radioGroup({
    label: 'Acute infection and/or rheumatological disorder?',
    section: 'cardiorespiratory', field: 'acuteInfectionOrRheumatological', options: yesNo,
    hint: 'Factor 9 — 1 point when present.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Cardiorespiratory factor points',
    id: 'cardiorespiratory-points-readout',
    render: () => renderFactorSubtotal([
      'heartOrRespiratoryFailure',
      'acuteMiOrIschaemicStroke',
      'acuteInfectionOrRheumatological'
    ])
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Metabolic and treatment factors',
    description: 'Obesity (BMI >= 30) and ongoing hormonal treatment each score 1 point.'
  });

  card.appendChild(textInput({
    label: 'Body mass index (BMI)',
    section: 'metabolic', field: 'bodyMassIndex',
    type: 'number', min: 10, max: 80, step: 0.1, unit: 'kg/m²',
    hint: 'Factor 10 — scores 1 point when BMI is 30 kg/m² or over.'
  }));
  card.appendChild(radioGroup({
    label: 'Ongoing hormonal treatment?',
    section: 'metabolic', field: 'ongoingHormonalTreatment', options: yesNo,
    hint: 'Factor 11 — 1 point when present.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Metabolic and treatment factor points',
    id: 'metabolic-points-readout',
    render: () => renderFactorSubtotal(['obesity', 'ongoingHormonalTreatment'])
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Bleeding-risk check',
    description: 'Informational only — these answers do not change the Padua score, but they gate the prophylaxis recommendation.'
  });

  card.appendChild(radioGroup({
    label: 'Active bleeding?',
    section: 'bleeding', field: 'activeBleeding', options: yesNo,
    hint: 'Active bleeding contraindicates pharmacological thromboprophylaxis.'
  }));
  card.appendChild(radioGroup({
    label: 'Other high bleeding-risk factors present?',
    section: 'bleeding', field: 'highBleedingRisk', options: yesNo,
    hint: 'e.g. recent bleeding, severe thrombocytopenia, untreated bleeding disorder.'
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Summary and score',
    description: 'Live Padua total, risk band, prophylaxis recommendation, and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live Padua score',
    id: 'live-score-readout',
    render: () => renderLiveScore()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, prophylaxis decision, and any bleeding-risk considerations.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the summed points for a list of factor keys as a pill. */
function renderFactorSubtotal(factorKeys) {
  const grade = calculatePaduaGrade(state);
  const points = factorKeys.reduce(
    (sum, k) => sum + (grade.factorPoints[k] || 0), 0
  );
  const cls = points > 0 ? 'warn' : 'ok';
  const noun = points === 1 ? 'point' : 'points';
  return `<strong class="${cls}">${points} ${noun}</strong>`;
}

/** Render the live overall Padua score, band, and prophylaxis recommendation. */
function renderLiveScore() {
  const grade = calculatePaduaGrade(state);
  const badge =
    `<span class="risk-badge ${riskBandClass(grade.riskBand)}">${esc(riskBandLabel(grade.riskBand))}</span>`;
  const rec =
    `<span class="muted">${esc(prophylaxisLabel(grade.prophylaxisRecommendation))}</span>`;
  return `<strong>${grade.paduaScore} of 20</strong> ${badge}<br>${rec}`;
}

function refreshLiveScore() {
  const ids = {
    'age-point-readout': () => renderFactorSubtotal(['elderlyAge']),
    'history-points-readout': () =>
      renderFactorSubtotal(['activeCancer', 'previousVte', 'knownThrombophilia']),
    'mobility-points-readout': () =>
      renderFactorSubtotal(['reducedMobility', 'recentTraumaOrSurgery']),
    'cardiorespiratory-points-readout': () =>
      renderFactorSubtotal([
        'heartOrRespiratoryFailure',
        'acuteMiOrIschaemicStroke',
        'acuteInfectionOrRheumatological'
      ]),
    'metabolic-points-readout': () =>
      renderFactorSubtotal(['obesity', 'ongoingHormonalTreatment']),
    'live-score-readout': () => renderLiveScore()
  };
  for (const [id, render] of Object.entries(ids)) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = render();
  }
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
  history: [['activeCancer'], ['previousVte'], ['knownThrombophilia']],
  mobility: [['reducedMobility'], ['recentTraumaOrSurgery']],
  cardiorespiratory: [
    ['heartOrRespiratoryFailure'],
    ['acuteMiOrIschaemicStroke'],
    ['acuteInfectionOrRheumatological']
  ],
  metabolic: [['bodyMassIndex'], ['ongoingHormonalTreatment']],
  bleeding: [['activeBleeding'], ['highBleedingRisk']],
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

// Factor display rows for the report table: [factor key, name, value getter].
const REPORT_FACTORS = [
  ['activeCancer', 'Active cancer (3)', () => yesNoValue(state.history.activeCancer)],
  ['previousVte', 'Previous VTE (3)', () => yesNoValue(state.history.previousVte)],
  ['reducedMobility', 'Reduced mobility >= 3 days (3)', () => yesNoValue(state.mobility.reducedMobility)],
  ['knownThrombophilia', 'Known thrombophilia (3)', () => yesNoValue(state.history.knownThrombophilia)],
  ['recentTraumaOrSurgery', 'Recent trauma or surgery <= 1 month (2)', () => yesNoValue(state.mobility.recentTraumaOrSurgery)],
  ['elderlyAge', 'Age >= 70 (1)', () => state.identification.ageYears === null ? 'Not recorded' : `${state.identification.ageYears} years`],
  ['heartOrRespiratoryFailure', 'Heart/respiratory failure (1)', () => yesNoValue(state.cardiorespiratory.heartOrRespiratoryFailure)],
  ['acuteMiOrIschaemicStroke', 'Acute MI or ischaemic stroke (1)', () => yesNoValue(state.cardiorespiratory.acuteMiOrIschaemicStroke)],
  ['acuteInfectionOrRheumatological', 'Acute infection/rheumatological (1)', () => yesNoValue(state.cardiorespiratory.acuteInfectionOrRheumatological)],
  ['obesity', 'Obesity BMI >= 30 (1)', () => state.metabolic.bodyMassIndex === null ? 'Not recorded' : `BMI ${state.metabolic.bodyMassIndex}`],
  ['ongoingHormonalTreatment', 'Ongoing hormonal treatment (1)', () => yesNoValue(state.metabolic.ongoingHormonalTreatment)]
];

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
    factorPoints, paduaScore, riskBand, prophylaxisRecommendation,
    flaggedIssues, timestamp
  } = lastResult;

  const factorRows = REPORT_FACTORS.map(([key, name, getValue]) => {
    const point = factorPoints[key] || 0;
    return `
      <tr>
        <th scope="row">${esc(name)}</th>
        <td>${esc(getValue())}</td>
        <td class="num"><span class="grade-pill">${point} ${point === 1 ? 'point' : 'points'}</span></td>
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

  let recommendation;
  if (riskBand === 'high' && prophylaxisRecommendation === 'pharmacological') {
    recommendation = `<p>This is a <strong>high-risk Padua score</strong>. Consider <strong>pharmacological thromboprophylaxis</strong> (e.g. low-molecular-weight heparin, unfractionated heparin, or fondaparinux) after confirming there is no bleeding contraindication, alongside early mobilisation.</p>`;
  } else if (riskBand === 'high' && prophylaxisRecommendation === 'mechanical') {
    recommendation = `<p>This is a <strong>high-risk Padua score</strong>, but a <strong>bleeding contraindication</strong> is recorded. Use <strong>mechanical prophylaxis</strong> (e.g. intermittent pneumatic compression) and seek senior review before starting any anticoagulant.</p>`;
  } else {
    recommendation = `<p>This is a <strong>low-risk Padua score</strong>. Routine pharmacological thromboprophylaxis is not indicated on risk grounds. Encourage early mobilisation, consider mechanical prophylaxis, and re-score if the clinical condition changes.</p>`;
  }

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Padua VTE Risk Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${riskBandClass(riskBand)}">
        <div>
          <span class="risk-banner-label">Padua score</span>
          <span class="risk-banner-value">${paduaScore} of 20</span>
        </div>
        <span class="risk-badge ${riskBandClass(riskBand)}">${esc(riskBandLabel(riskBand))}</span>
      </div>

      <h3>Risk factors</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Risk factor (points)</th>
            <th scope="col">Value</th>
            <th scope="col">Points</th>
          </tr>
        </thead>
        <tbody>${factorRows}</tbody>
      </table>

      <h3>Recommended action</h3>
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
  const grade = calculatePaduaGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade.paduaScore);
  lastResult = {
    factorPoints: grade.factorPoints,
    paduaScore: grade.paduaScore,
    riskBand: grade.riskBand,
    prophylaxisRecommendation: grade.prophylaxisRecommendation,
    firedFactors: grade.firedFactors,
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
  { step: 1, section: 'context',           title: 'Context' },
  { step: 2, section: 'identification',     title: 'Patient' },
  { step: 3, section: 'history',            title: 'Oncology & thrombosis' },
  { step: 4, section: 'mobility',           title: 'Mobility & events' },
  { step: 5, section: 'cardiorespiratory',  title: 'Cardiorespiratory' },
  { step: 6, section: 'metabolic',          title: 'Metabolic & treatment' },
  { step: 7, section: 'bleeding',           title: 'Bleeding-risk check' },
  { step: 8, section: 'note',               title: 'Summary' }
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
