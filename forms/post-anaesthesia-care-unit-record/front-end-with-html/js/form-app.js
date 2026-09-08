import { detectFlaggedIssues } from './flags.js';
import { calculatePacuGrade } from './grader.js';
import { emptyAssessment, priorityLabel, readinessBandClass, readinessBandLabel } from './types.js';

// Post-Anaesthesia Care Unit (PACU) Record — recovery wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The recovery nurse scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// Modified Aldrete total plus discharge-readiness band updates as the five
// parameters are entered. Submission runs the pure scoring engine (five 0/1/2
// sub-scores, total 0-10, readiness band gated on oxygen saturation, optional
// PADSS total, flagged issues) and renders an inline report. State is persisted
// to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Option lists (single source of truth for wizard inputs + report labels)
// ----------------------------------------------------------------------

const ALDRETE_OPTIONS = {
  activity: [
    { value: 'all-four', label: 'Moves all four limbs (2)' },
    { value: 'two', label: 'Moves two limbs (1)' },
    { value: 'none', label: 'Unable to move limbs (0)' }
  ],
  respiration: [
    { value: 'deep-cough', label: 'Breathes deeply and coughs freely (2)' },
    { value: 'limited', label: 'Dyspnoea, shallow or limited breathing (1)' },
    { value: 'apnoeic', label: 'Apnoeic / requires ventilation (0)' }
  ],
  circulation: [
    { value: 'within-20', label: 'BP within 20 mmHg of baseline (2)' },
    { value: 'within-50', label: 'BP within 20-50 mmHg of baseline (1)' },
    { value: 'over-50', label: 'BP more than 50 mmHg from baseline (0)' }
  ],
  consciousness: [
    { value: 'awake', label: 'Fully awake (2)' },
    { value: 'arousable', label: 'Arousable on calling (1)' },
    { value: 'unresponsive', label: 'Not responding (0)' }
  ],
  oxygenSaturation: [
    { value: 'room-air', label: 'SpO2 > 92% on room air (2)' },
    { value: 'needs-o2', label: 'Needs supplemental oxygen to keep SpO2 > 90% (1)' },
    { value: 'low-on-o2', label: 'SpO2 < 90% even with supplemental oxygen (0)' }
  ]
};

const PADSS_OPTIONS = {
  padssVitalSigns: [
    { value: 'within-20', label: 'Within 20% of baseline (2)' },
    { value: 'within-40', label: 'Within 20-40% of baseline (1)' },
    { value: 'over-40', label: 'More than 40% from baseline (0)' }
  ],
  padssAmbulation: [
    { value: 'steady', label: 'Steady gait, no dizziness (2)' },
    { value: 'with-assistance', label: 'Ambulates with assistance (1)' },
    { value: 'unable', label: 'Unable / dizziness (0)' }
  ],
  padssNauseaVomiting: [
    { value: 'minimal', label: 'Minimal (2)' },
    { value: 'moderate', label: 'Moderate, treated (1)' },
    { value: 'severe', label: 'Severe, persistent (0)' }
  ],
  padssPain: [
    { value: 'minimal', label: 'Minimal, acceptable (2)' },
    { value: 'moderate', label: 'Moderate (1)' },
    { value: 'severe', label: 'Severe (0)' }
  ],
  padssSurgicalBleeding: [
    { value: 'minimal', label: 'Minimal (2)' },
    { value: 'moderate', label: 'Moderate (1)' },
    { value: 'severe', label: 'Severe (0)' }
  ]
};

/** Human-readable label for an Aldrete parameter answer. */
function aldreteValueLabel(parameter, value) {
  const opt = (ALDRETE_OPTIONS[parameter] || []).find((o) => o.value === value);
  return opt ? opt.label : 'Not recorded';
}

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'post-anaesthesia-care-unit-record.front-end-with-html.v1';

/** @returns {import('./types.js').PacuRecord} */
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
    console.warn('Could not parse saved record; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').PacuRecord} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save record to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored record.', e);
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

/** @type {import('./types.js').PacuRecord} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'post-anaesthesia-care-unit-record',
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

const TOTAL_STEPS = 10;

/** True when this is a day-surgery case (enables PADSS). */
function isAmbulatory() {
  return state.identification.ambulatoryCase === 'yes';
}

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
  if (opts.conditional) card.setAttribute('data-conditional', opts.conditional);
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
// Section renderers (1 per wizard step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Recovery context',
    description: 'Who is recording, the supervising anaesthetist, when the patient was admitted to PACU, and the anaesthetic and procedure.'
  });

  card.appendChild(textInput({
    label: 'Recording nurse name',
    section: 'context', field: 'nurseName', required: true,
    placeholder: 'e.g. Sister J. Okafor'
  }));
  card.appendChild(selectInput({
    label: 'Recording staff role',
    section: 'context', field: 'nurseRole', required: true,
    options: [
      { value: 'recovery-nurse', label: 'Recovery nurse' },
      { value: 'odp', label: 'Operating-department practitioner' },
      { value: 'anaesthetist', label: 'Anaesthetist' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Supervising anaesthetist',
    section: 'context', field: 'anaesthetistName',
    placeholder: 'e.g. Dr A. Khan'
  }));
  card.appendChild(textInput({
    label: 'Date and time of PACU admission',
    section: 'context', field: 'admittedAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Anaesthetic technique',
    section: 'context', field: 'anaestheticTechnique', required: true,
    options: [
      { value: 'general', label: 'General anaesthesia' },
      { value: 'regional', label: 'Regional anaesthesia' },
      { value: 'sedation', label: 'Procedural sedation' },
      { value: 'combined', label: 'Combined' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Operation or procedure',
    section: 'context', field: 'procedure',
    placeholder: 'e.g. Laparoscopic cholecystectomy'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age band, sex, ASA status, and the pre-anaesthetic baseline blood pressure used as the circulation reference.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. PACU-100482 or hospital MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    options: [
      { value: '16-39', label: '16-39' },
      { value: '40-59', label: '40-59' },
      { value: '60-74', label: '60-74' },
      { value: '75-plus', label: '75 and over' }
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
  card.appendChild(selectInput({
    label: 'ASA physical status',
    section: 'identification', field: 'asaStatus',
    options: [
      { value: 'I', label: 'ASA I' },
      { value: 'II', label: 'ASA II' },
      { value: 'III', label: 'ASA III' },
      { value: 'IV', label: 'ASA IV' },
      { value: 'V', label: 'ASA V' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Pre-anaesthetic baseline systolic blood pressure',
    section: 'identification', field: 'baselineSystolicBp',
    type: 'number', min: 40, max: 300, step: 1, unit: 'mmHg',
    hint: 'Used as the reference for the Aldrete circulation parameter.'
  }));
  card.appendChild(selectInput({
    label: 'Day-surgery (ambulatory) case?',
    section: 'identification', field: 'ambulatoryCase',
    hint: 'Selecting "Yes" enables the optional PADSS street-fitness assessment (Step 9).',
    options: [
      { value: 'yes', label: 'Yes — day surgery / ambulatory' },
      { value: 'no', label: 'No — inpatient' }
    ]
  }));

  return card;
}

/** Build one of the five Modified Aldrete parameter steps. */
function renderAldreteStep(stepNumber, section, title, description) {
  const card = sectionCard({ stepNumber, title, description });
  card.appendChild(radioGroup({
    label: title,
    section, field: section,
    required: true,
    options: ALDRETE_OPTIONS[section]
  }));
  card.appendChild(readOnlyReadout({
    label: 'Parameter sub-score',
    id: `${section}-score-readout`,
    render: () => renderParamReadout(section)
  }));
  return card;
}

function renderStep3() {
  return renderAldreteStep(
    3, 'activity', 'Aldrete — activity',
    'Voluntary limb movement on command (scores 0, 1, or 2).'
  );
}

function renderStep4() {
  return renderAldreteStep(
    4, 'respiration', 'Aldrete — respiration',
    'Breathing effort, cough, and ventilation need (scores 0, 1, or 2).'
  );
}

function renderStep5() {
  return renderAldreteStep(
    5, 'circulation', 'Aldrete — circulation',
    'Blood-pressure deviation from the pre-anaesthetic baseline (scores 0, 1, or 2).'
  );
}

function renderStep6() {
  return renderAldreteStep(
    6, 'consciousness', 'Aldrete — consciousness',
    'Level of arousal (scores 0, 1, or 2).'
  );
}

function renderStep7() {
  return renderAldreteStep(
    7, 'oxygenSaturation', 'Aldrete — oxygen saturation',
    'SpO2 and supplemental-oxygen need. This parameter gates discharge-readiness — it must score 2.'
  );
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Airway, pain and PONV',
    description: 'Airway status, pain score, post-operative nausea and vomiting, and drugs given in recovery.'
  });

  card.appendChild(selectInput({
    label: 'Airway status',
    section: 'observations', field: 'airwayStatus',
    options: [
      { value: 'patent', label: 'Patent, self-maintained' },
      { value: 'oral-airway', label: 'Oral / nasal airway in situ' },
      { value: 'other', label: 'Other support' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Pain score',
    section: 'observations', field: 'painScore',
    type: 'number', min: 0, max: 10, step: 1,
    hint: 'Verbal / numeric rating scale 0-10. A score of 4 or more flags uncontrolled pain.'
  }));
  card.appendChild(selectInput({
    label: 'PONV severity',
    section: 'observations', field: 'ponvSeverity',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Analgesia given in PACU',
    section: 'observations', field: 'analgesiaGiven',
    placeholder: 'e.g. Morphine 5 mg IV, paracetamol 1 g IV'
  }));
  card.appendChild(textInput({
    label: 'Antiemetics given in PACU',
    section: 'observations', field: 'antiemeticsGiven',
    placeholder: 'e.g. Ondansetron 4 mg IV'
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'PADSS (day surgery, optional)',
    description: 'Post-Anaesthesia Discharge Scoring System — five criteria, each 0-2, total 0-10; 9 or more indicates street fitness for discharge home. Scored only for ambulatory cases.',
    conditional: 'identification.ambulatoryCase=yes'
  });

  card.appendChild(radioGroup({
    label: 'Vital signs (vs baseline)',
    section: 'padss', field: 'padssVitalSigns',
    options: PADSS_OPTIONS.padssVitalSigns
  }));
  card.appendChild(radioGroup({
    label: 'Ambulation',
    section: 'padss', field: 'padssAmbulation',
    options: PADSS_OPTIONS.padssAmbulation
  }));
  card.appendChild(radioGroup({
    label: 'Nausea and vomiting',
    section: 'padss', field: 'padssNauseaVomiting',
    options: PADSS_OPTIONS.padssNauseaVomiting
  }));
  card.appendChild(radioGroup({
    label: 'Pain',
    section: 'padss', field: 'padssPain',
    options: PADSS_OPTIONS.padssPain
  }));
  card.appendChild(radioGroup({
    label: 'Surgical bleeding',
    section: 'padss', field: 'padssSurgicalBleeding',
    options: PADSS_OPTIONS.padssSurgicalBleeding
  }));

  card.appendChild(readOnlyReadout({
    label: 'Live PADSS total',
    id: 'live-padss-readout',
    render: () => renderLivePadss()
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Summary and score',
    description: 'Live Modified Aldrete total and discharge-readiness band, plus a free-text recovery note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live Modified Aldrete score',
    id: 'live-aldrete-readout',
    render: () => renderLiveAldrete()
  }));

  card.appendChild(textArea({
    label: 'Recovery note',
    section: 'note', field: 'recoveryNote',
    placeholder: 'Free-text recovery note: observations, decisions, and any escalation already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the 0/1/2 sub-score pill for a single Aldrete parameter. */
function renderParamReadout(parameter) {
  const grade = calculatePacuGrade(state);
  const score = {
    activity: grade.activityScore,
    respiration: grade.respirationScore,
    circulation: grade.circulationScore,
    consciousness: grade.consciousnessScore,
    oxygenSaturation: grade.oxygenSaturationScore
  }[parameter];
  const answered = state[parameter][parameter] !== '';
  const cls = score === 2 ? 'ok' : 'warn';
  const note = !answered ? '(not recorded — counts as 0)' : score === 2 ? '(full marks)' : '(below maximum)';
  return `<strong class="${cls}">${score} of 2</strong> <span class="muted">${note}</span>`;
}

/** Render the live overall Modified Aldrete total and readiness band. */
function renderLiveAldrete() {
  const grade = calculatePacuGrade(state);
  const badge =
    `<span class="risk-badge ${readinessBandClass(grade.readinessBand)}">${esc(readinessBandLabel(grade.readinessBand))}</span>`;
  return `<strong>${grade.aldreteTotal} of 10</strong> ${badge}`;
}

/** Render the live PADSS total (ambulatory cases only). */
function renderLivePadss() {
  const grade = calculatePacuGrade(state);
  if (grade.padssTotal === null) {
    return `<span class="muted">Complete all five PADSS criteria to compute the total.</span>`;
  }
  const cls = grade.padssStreetFit ? 'risk-low' : 'risk-high';
  const label = grade.padssStreetFit ? 'Street-fit (>= 9)' : 'Not yet street-fit';
  return `<strong>${grade.padssTotal} of 10</strong> <span class="risk-badge ${cls}">${esc(label)}</span>`;
}

function refreshLiveScore() {
  for (const parameter of ['activity', 'respiration', 'circulation', 'consciousness', 'oxygenSaturation']) {
    const el = document.getElementById(`${parameter}-score-readout`);
    if (el) el.innerHTML = renderParamReadout(parameter);
  }
  const padss = document.getElementById('live-padss-readout');
  if (padss) padss.innerHTML = renderLivePadss();
  const live = document.getElementById('live-aldrete-readout');
  if (live) live.innerHTML = renderLiveAldrete();
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
  context: [['nurseName'], ['nurseRole'], ['anaestheticTechnique']],
  identification: [['patientIdentifier'], ['ageBand'], ['sex']],
  activity: [['activity']],
  respiration: [['respiration']],
  circulation: [['circulation']],
  consciousness: [['consciousness']],
  oxygenSaturation: [['oxygenSaturation']],
  observations: [['airwayStatus', 'painScore', 'ponvSeverity']],
  padss: [['padssVitalSigns'], ['padssAmbulation'], ['padssNauseaVomiting'], ['padssPain'], ['padssSurgicalBleeding']],
  note: [['recoveryNote']]
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
  const ambulatory = isAmbulatory();

  for (const section of Object.keys(STEP_SLOTS)) {
    // PADSS only counts toward progress for ambulatory cases.
    if (section === 'padss' && !ambulatory) {
      sectionTotal[section] = 0;
      sectionAnswered[section] = 0;
      continue;
    }
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
    activityScore, respirationScore, circulationScore, consciousnessScore,
    oxygenSaturationScore, aldreteTotal, readinessBand,
    padssTotal, padssStreetFit, flaggedIssues, timestamp
  } = lastResult;

  const paramRows = [
    ['Activity', state.activity.activity, activityScore],
    ['Respiration', state.respiration.respiration, respirationScore],
    ['Circulation', state.circulation.circulation, circulationScore],
    ['Consciousness', state.consciousness.consciousness, consciousnessScore],
    ['Oxygen saturation', state.oxygenSaturation.oxygenSaturation, oxygenSaturationScore]
  ].map(([name, value, score]) => {
    const paramKey = {
      'Activity': 'activity',
      'Respiration': 'respiration',
      'Circulation': 'circulation',
      'Consciousness': 'consciousness',
      'Oxygen saturation': 'oxygenSaturation'
    }[name];
    return `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(aldreteValueLabel(paramKey, value))}</td>
      <td class="num"><span class="grade-pill">${score} of 2</span></td>
    </tr>
  `;
  }).join('');

  const padssSection = padssTotal === null
    ? `<p class="muted">PADSS not scored (inpatient case, or criteria incomplete).</p>`
    : `<p>PADSS total <strong>${padssTotal} of 10</strong> — ${padssStreetFit ? 'street-fit for discharge home (>= 9).' : 'not yet street-fit for discharge home (below 9).'}</p>`;

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

  const recommendation = readinessBand === 'discharge-ready'
    ? `<p>The Modified Aldrete total is <strong>${aldreteTotal} of 10</strong> with the oxygen-saturation parameter satisfied. Documented PACU discharge criteria are met. Confirm against local discharge policy and anaesthetist sign-off before transfer.</p>`
    : `<p>The patient is <strong>not yet ready for PACU discharge</strong>. Continue recovery observation and active management; address any parameter scoring below 2 — an oxygen-saturation deficit in particular keeps the patient in recovery regardless of the total.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>PACU Recovery Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${readinessBandClass(readinessBand)}">
        <div>
          <span class="risk-banner-label">Modified Aldrete score</span>
          <span class="risk-banner-value">${aldreteTotal} of 10</span>
        </div>
        <span class="risk-badge ${readinessBandClass(readinessBand)}">${esc(readinessBandLabel(readinessBand))}</span>
      </div>

      <h3>Aldrete parameters</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Parameter</th>
            <th scope="col">Assessment</th>
            <th scope="col">Sub-score</th>
          </tr>
        </thead>
        <tbody>${paramRows}</tbody>
      </table>

      <h3>PADSS (day-surgery discharge home)</h3>
      ${padssSection}

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
  const grade = calculatePacuGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    activityScore: grade.activityScore,
    respirationScore: grade.respirationScore,
    circulationScore: grade.circulationScore,
    consciousnessScore: grade.consciousnessScore,
    oxygenSaturationScore: grade.oxygenSaturationScore,
    aldreteTotal: grade.aldreteTotal,
    readinessBand: grade.readinessBand,
    padssTotal: grade.padssTotal,
    padssStreetFit: grade.padssStreetFit,
    firedParameters: grade.firedParameters,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh record?')) return;
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
  { step: 1, section: 'context',          title: 'Context' },
  { step: 2, section: 'identification',   title: 'Patient' },
  { step: 3, section: 'activity',         title: 'Activity' },
  { step: 4, section: 'respiration',      title: 'Respiration' },
  { step: 5, section: 'circulation',      title: 'Circulation' },
  { step: 6, section: 'consciousness',    title: 'Consciousness' },
  { step: 7, section: 'oxygenSaturation', title: 'Oxygen sat.' },
  { step: 8, section: 'observations',     title: 'Airway / pain / PONV' },
  { step: 9, section: 'padss',            title: 'PADSS' },
  { step: 10, section: 'note',            title: 'Summary' }
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
  const ambulatory = isAmbulatory();
  let firstUnfinished = -1;
  for (const def of STEP_DEFINITIONS) {
    const li = ol.querySelector(`[data-step="${def.step}"]`);
    if (!li) continue;

    // PADSS step is not applicable for inpatient cases — mark it finished so it
    // never blocks the "current step" cursor.
    if (def.section === 'padss' && !ambulatory) {
      li.dataset.status = 'finished';
      li.removeAttribute('aria-current');
      continue;
    }

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
    // Skip required fields inside a hidden conditional section.
    const card = input.closest('[data-conditional]');
    if (card && card.style.display === 'none') return;

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
  host.appendChild(renderStep10());
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
