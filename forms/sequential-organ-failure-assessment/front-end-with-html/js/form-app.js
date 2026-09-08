import { detectFlaggedIssues } from './flags.js';
import { calculateSofaGrade } from './grader.js';
import { emptyAssessment, mortalityBandClass, mortalityBandLabel, priorityLabel, respiratorySupportLabel, systemLabel, vasopressorLabel } from './types.js';

// Sequential Organ Failure Assessment (SOFA) — clinician wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered, each organ
// step shows a live 0-4 sub-score, and the summary step shows the live total
// (0-24), mortality band, and delta-SOFA. Submission runs the pure scoring
// engine (per-system sub-scores, total, delta, band, Sepsis-3, flagged issues)
// and renders an inline report. State is persisted to localStorage so a partial
// fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'sequential-organ-failure-assessment.front-end-with-html.v1';

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
  slug: 'sequential-organ-failure-assessment',
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
 * conditional visibility, and the live-score readouts after each change.
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

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const roleOptions = [
  { value: 'intensivist', label: 'Intensivist' },
  { value: 'critical-care-physician', label: 'Critical-care physician' },
  { value: 'acute-physician', label: 'Acute-medicine physician' },
  { value: 'resident', label: 'Resident' },
  { value: 'nurse', label: 'Critical-care nurse' },
  { value: 'outreach-practitioner', label: 'Outreach practitioner' },
  { value: 'other', label: 'Other' }
];

const locationOptions = [
  { value: 'icu', label: 'Intensive care unit (ICU)' },
  { value: 'hdu', label: 'High-dependency unit (HDU)' },
  { value: 'critical-care-outreach', label: 'Critical-care outreach' },
  { value: 'acute-medical-unit', label: 'Acute medical unit' },
  { value: 'emergency-department', label: 'Emergency department' },
  { value: 'other', label: 'Other' }
];

const sexOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'intersex', label: 'Intersex' },
  { value: 'unknown', label: 'Unknown' }
];

const infectionOptions = [
  { value: 'yes', label: 'Yes — suspected or confirmed' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' }
];

const supportOptions = [
  { value: 'ventilated', label: 'Mechanical ventilation' },
  { value: 'cpap', label: 'CPAP' },
  { value: 'none', label: 'None' }
];

const vasopressorOptions = [
  { value: 'none', label: 'None' },
  { value: 'dopamine', label: 'Dopamine' },
  { value: 'dobutamine', label: 'Dobutamine (any dose)' },
  { value: 'adrenaline', label: 'Adrenaline (epinephrine)' },
  { value: 'noradrenaline', label: 'Noradrenaline (norepinephrine)' },
  { value: 'other', label: 'Other' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per SOFA step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Clinician and context',
    description: 'Who is assessing, when, and where.'
  });
  card.appendChild(textInput({
    label: 'Assessing clinician name',
    section: 'context', field: 'assessorName', required: true,
    placeholder: 'e.g. Dr A. Khan'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'assessorRole', required: true,
    options: roleOptions
  }));
  card.appendChild(textInput({
    label: 'Professional registration number',
    section: 'context', field: 'assessorRegistrationNumber',
    placeholder: 'e.g. GMC 1234567'
  }));
  card.appendChild(textInput({
    label: 'Date and time of assessment',
    section: 'context', field: 'assessedAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Care location',
    section: 'context', field: 'careLocation', required: true,
    options: locationOptions
  }));
  card.appendChild(textInput({
    label: 'Hours since ICU / critical-care admission',
    section: 'context', field: 'hoursSinceAdmission',
    type: 'number', min: 0, max: 2000, step: 1, unit: 'hours',
    hint: 'Used for serial scoring over the first 48 hours.'
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient and baseline',
    description: 'Identification, admission diagnosis, suspected infection, and the prior (baseline) SOFA total for the delta calculation.'
  });
  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'baseline', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. ICU-100482 or hospital MRN'
  }));
  card.appendChild(textInput({
    label: 'Age',
    section: 'baseline', field: 'ageYears',
    type: 'number', min: 16, max: 120, step: 1, unit: 'years',
    hint: 'SOFA applies to adults (16 years or over).'
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'baseline', field: 'sex', required: true,
    options: sexOptions
  }));
  card.appendChild(textArea({
    label: 'Admission / working diagnosis',
    section: 'baseline', field: 'admissionDiagnosis', rows: 2,
    placeholder: 'e.g. Community-acquired pneumonia with septic shock'
  }));
  card.appendChild(selectInput({
    label: 'Is infection suspected or confirmed?',
    section: 'baseline', field: 'suspectedInfection', required: true,
    options: infectionOptions,
    hint: 'Drives the Sepsis-3 flag when delta-SOFA is 2 or more.'
  }));
  card.appendChild(textInput({
    label: 'Baseline (prior) total SOFA',
    section: 'baseline', field: 'baselineSofaTotal',
    type: 'number', min: 0, max: 24, step: 1,
    hint: 'Assumed 0 when there is no known pre-existing organ dysfunction. Leave blank to omit the delta-SOFA.'
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Respiration',
    description: 'PaO2/FiO2 ratio. Sub-scores of 3 and 4 require respiratory support (ventilation or CPAP).'
  });
  card.appendChild(textInput({
    label: 'PaO2',
    section: 'respiration', field: 'pao2',
    type: 'number', min: 0, max: 800, step: 0.1, unit: 'mmHg',
    hint: 'Arterial oxygen partial pressure, in mmHg, for the P/F ratio.'
  }));
  card.appendChild(textInput({
    label: 'FiO2',
    section: 'respiration', field: 'fio2',
    type: 'number', min: 0.21, max: 1, step: 0.01,
    hint: 'Fraction of inspired oxygen, as a decimal (0.21 to 1.0).'
  }));
  card.appendChild(textInput({
    label: 'PaO2/FiO2 ratio (optional)',
    section: 'respiration', field: 'pao2Fio2Ratio',
    type: 'number', min: 0, max: 800, step: 1, unit: 'mmHg',
    hint: 'Enter directly to override the PaO2 / FiO2 calculation. Bands: <400 → 1, <300 → 2, <200 → 3, <100 → 4.'
  }));
  card.appendChild(selectInput({
    label: 'Respiratory support',
    section: 'respiration', field: 'respiratorySupport',
    options: supportOptions,
    hint: 'Sub-scores of 3 and 4 apply only with mechanical ventilation or CPAP.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Respiration sub-score',
    id: 'respiration-readout',
    render: () => renderSubScoreReadout('respiration')
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Coagulation',
    description: 'Platelet count. Bands: <150 → 1, <100 → 2, <50 → 3, <20 → 4.'
  });
  card.appendChild(textInput({
    label: 'Platelet count',
    section: 'coagulation', field: 'platelets',
    type: 'number', min: 0, max: 1500, step: 1, unit: '×10⁹/L',
    hint: 'Equivalently ×10³/µL.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Coagulation sub-score',
    id: 'coagulation-readout',
    render: () => renderSubScoreReadout('coagulation')
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Liver',
    description: 'Total bilirubin (µmol/L). Bands: 20–32 → 1, 33–101 → 2, 102–204 → 3, >204 → 4.'
  });
  card.appendChild(textInput({
    label: 'Bilirubin',
    section: 'liver', field: 'bilirubin',
    type: 'number', min: 0, max: 1000, step: 1, unit: 'µmol/L',
    hint: 'SI units (µmol/L) preferred in the UK.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Liver sub-score',
    id: 'liver-readout',
    render: () => renderSubScoreReadout('liver')
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Cardiovascular',
    description: 'The higher of the MAP band and the vasopressor band sets the sub-score. Doses are µg/kg/min given for at least one hour.'
  });
  card.appendChild(textInput({
    label: 'Mean arterial pressure (MAP)',
    section: 'cardiovascular', field: 'map',
    type: 'number', min: 0, max: 200, step: 1, unit: 'mmHg',
    hint: 'MAP < 70 → 1.'
  }));
  card.appendChild(selectInput({
    label: 'Vasopressor / inotrope',
    section: 'cardiovascular', field: 'vasopressor',
    options: vasopressorOptions,
    hint: 'Dobutamine any dose → 2; dopamine ≤5 → 2, >5 → 3, >15 → 4; adrenaline/noradrenaline ≤0.1 → 3, >0.1 → 4.'
  }));
  card.appendChild(textInput({
    label: 'Vasopressor dose',
    section: 'cardiovascular', field: 'vasopressorDose',
    type: 'number', min: 0, max: 100, step: 0.01, unit: 'µg/kg/min'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Cardiovascular sub-score',
    id: 'cardiovascular-readout',
    render: () => renderSubScoreReadout('cardiovascular')
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Central nervous system',
    description: 'Glasgow Coma Scale. Bands: 13–14 → 1, 10–12 → 2, 6–9 → 3, <6 → 4.'
  });
  card.appendChild(textInput({
    label: 'Glasgow Coma Scale total',
    section: 'cns', field: 'glasgowComaScale',
    type: 'number', min: 3, max: 15, step: 1,
    hint: 'GCS 3–15. Where the patient is sedated, use the pre-sedation GCS or best estimate.'
  }));
  card.appendChild(radioGroup({
    label: 'Is the patient sedated?',
    section: 'cns', field: 'sedated', options: yesNo
  }));
  card.appendChild(readOnlyReadout({
    label: 'CNS sub-score',
    id: 'cns-readout',
    render: () => renderSubScoreReadout('cns')
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Renal',
    description: 'The higher of the creatinine band and the urine-output band sets the sub-score.'
  });
  card.appendChild(textInput({
    label: 'Serum creatinine',
    section: 'renal', field: 'creatinine',
    type: 'number', min: 0, max: 2000, step: 1, unit: 'µmol/L',
    hint: 'Bands: 110–170 → 1, 171–299 → 2, 300–440 → 3, >440 → 4.'
  }));
  card.appendChild(textInput({
    label: '24-hour urine output',
    section: 'renal', field: 'urineOutput',
    type: 'number', min: 0, max: 10000, step: 10, unit: 'mL/day',
    hint: 'Bands: <500 mL/day → 3, <200 mL/day → 4.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Renal sub-score',
    id: 'renal-readout',
    render: () => renderSubScoreReadout('renal')
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Summary and sign-off',
    description: 'Live total SOFA, mortality band, and delta-SOFA. Add a clinical note, then submit to generate the full report.'
  });
  card.appendChild(readOnlyReadout({
    label: 'Live SOFA total',
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

/** Render the 0-4 sub-score pill for a single organ system. */
function renderSubScoreReadout(system) {
  const grade = calculateSofaGrade(state);
  const score = grade.subScores[system];
  if (score === null) {
    return `<strong class="muted">Not scored</strong> <span class="muted">(input incomplete)</span>`;
  }
  const cls = score >= 3 ? 'warn' : (score === 0 ? 'ok' : 'warn');
  const note = score === 0 ? '(no dysfunction)' : score >= 3 ? '(severe)' : '(dysfunction)';
  return `<strong class="${cls}">${score} of 4</strong> <span class="muted">${note}</span>`;
}

/** Render the live overall SOFA total, band, and delta. */
function renderLiveScore() {
  const grade = calculateSofaGrade(state);
  const badge =
    `<span class="risk-badge ${mortalityBandClass(grade.mortalityBand)}">${esc(mortalityBandLabel(grade.mortalityBand))}</span>`;
  let delta = '';
  if (grade.deltaSofa !== null) {
    const d = grade.deltaSofa;
    delta = ` <span class="muted">Δ ${d > 0 ? '+' : ''}${d}</span>`;
  }
  const incomplete = grade.complete ? '' : ` <span class="muted">(incomplete)</span>`;
  const sepsis = grade.sepsis3
    ? ` <span class="risk-badge risk-high">Sepsis-3</span>`
    : '';
  return `<strong>${grade.totalSofa} of 24</strong> ${badge}${delta}${incomplete}${sepsis}`;
}

const READOUT_SYSTEMS = ['respiration', 'coagulation', 'liver', 'cardiovascular', 'cns', 'renal'];

function refreshLiveScore() {
  for (const system of READOUT_SYSTEMS) {
    const el = document.getElementById(`${system}-readout`);
    if (el) el.innerHTML = renderSubScoreReadout(system);
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
// the slot counts as answered when ANY of its fields is answered. This lets the
// respiration step count once the ratio (or PaO2) is entered, and the renal
// step once either creatinine or urine output is recorded.
const STEP_SLOTS = {
  context: [['assessorName'], ['assessorRole'], ['careLocation']],
  baseline: [['patientIdentifier'], ['sex'], ['suspectedInfection']],
  respiration: [['pao2Fio2Ratio', 'pao2'], ['respiratorySupport']],
  coagulation: [['platelets']],
  liver: [['bilirubin']],
  cardiovascular: [['map', 'vasopressor']],
  cns: [['glasgowComaScale']],
  renal: [['creatinine', 'urineOutput']],
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

/** Human-readable summary of each system's raw input, for the report table. */
function systemInputSummary(system) {
  const s = state;
  switch (system) {
    case 'respiration': {
      const r = s.respiration;
      let ratio = null;
      if (r.pao2Fio2Ratio !== null) ratio = r.pao2Fio2Ratio;
      else if (r.pao2 !== null && r.fio2 !== null && r.fio2 > 0) ratio = Math.round(r.pao2 / r.fio2);
      const supp = r.respiratorySupport ? `, ${respiratorySupportLabel(r.respiratorySupport)}` : '';
      return ratio === null ? 'Not recorded' : `P/F ${ratio} mmHg${supp}`;
    }
    case 'coagulation':
      return s.coagulation.platelets === null ? 'Not recorded' : `Platelets ${s.coagulation.platelets} ×10⁹/L`;
    case 'liver':
      return s.liver.bilirubin === null ? 'Not recorded' : `Bilirubin ${s.liver.bilirubin} µmol/L`;
    case 'cardiovascular': {
      const c = s.cardiovascular;
      const parts = [];
      if (c.map !== null) parts.push(`MAP ${c.map} mmHg`);
      if (c.vasopressor && c.vasopressor !== 'none') {
        parts.push(`${vasopressorLabel(c.vasopressor)}${c.vasopressorDose !== null ? ` ${c.vasopressorDose} µg/kg/min` : ''}`);
      }
      return parts.length ? parts.join(', ') : 'Not recorded';
    }
    case 'cns':
      return s.cns.glasgowComaScale === null ? 'Not recorded' : `GCS ${s.cns.glasgowComaScale}${s.cns.sedated === 'yes' ? ' (sedated)' : ''}`;
    case 'renal': {
      const r = s.renal;
      const parts = [];
      if (r.creatinine !== null) parts.push(`Creatinine ${r.creatinine} µmol/L`);
      if (r.urineOutput !== null) parts.push(`Urine ${r.urineOutput} mL/day`);
      return parts.length ? parts.join(', ') : 'Not recorded';
    }
    default:
      return 'Not recorded';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    subScores, totalSofa, complete, deltaSofa, mortalityBand,
    sepsis3, flaggedIssues, timestamp
  } = lastResult;

  const subscaleRows = READOUT_SYSTEMS.map((system) => {
    const score = subScores[system];
    const scoreText = score === null ? '—' : `${score}`;
    return `
      <tr>
        <th scope="row">${esc(systemLabel(system))}</th>
        <td>${esc(systemInputSummary(system))}</td>
        <td class="num"><span class="grade-pill">${scoreText}</span></td>
      </tr>
    `;
  }).join('');

  const deltaText = deltaSofa === null
    ? 'Not calculated (no baseline recorded)'
    : `${deltaSofa > 0 ? '+' : ''}${deltaSofa} versus baseline ${state.baseline.baselineSofaTotal}`;

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

  const sepsisNote = sepsis3
    ? `<p>Infection is suspected and delta-SOFA is 2 or more: this <strong>meets the Sepsis-3 operational criterion</strong>. Commence the sepsis six and escalate to critical care per local policy.</p>`
    : `<p>The Sepsis-3 criterion (suspected infection with delta-SOFA ≥ 2) is not met. Re-score if the patient deteriorates.</p>`;

  const completeNote = complete
    ? ''
    : `<p class="muted">One or more organ systems were not scored; the total may understate true organ dysfunction.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>SOFA Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${mortalityBandClass(mortalityBand)}">
        <div>
          <span class="risk-banner-label">Total SOFA score</span>
          <span class="risk-banner-value">${totalSofa} of 24</span>
        </div>
        <span class="risk-badge ${mortalityBandClass(mortalityBand)}">${esc(mortalityBandLabel(mortalityBand))}</span>
      </div>

      <h3>Organ-system sub-scores</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">System</th>
            <th scope="col">Finding</th>
            <th scope="col">Sub-score</th>
          </tr>
        </thead>
        <tbody>${subscaleRows}</tbody>
      </table>
      ${completeNote}

      <h3>Delta-SOFA</h3>
      <p>${esc(deltaText)}</p>

      <h3>Sepsis-3</h3>
      ${sepsisNote}

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
  const grade = calculateSofaGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    subScores: grade.subScores,
    totalSofa: grade.totalSofa,
    complete: grade.complete,
    deltaSofa: grade.deltaSofa,
    mortalityBand: grade.mortalityBand,
    sepsis3: grade.sepsis3,
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
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'baseline',       title: 'Patient' },
  { step: 3, section: 'respiration',    title: 'Respiration' },
  { step: 4, section: 'coagulation',    title: 'Coagulation' },
  { step: 5, section: 'liver',          title: 'Liver' },
  { step: 6, section: 'cardiovascular', title: 'Cardiovascular' },
  { step: 7, section: 'cns',            title: 'CNS' },
  { step: 8, section: 'renal',          title: 'Renal' },
  { step: 9, section: 'note',           title: 'Summary' }
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
