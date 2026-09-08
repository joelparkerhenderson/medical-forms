import { detectFlaggedIssues } from './flags.js';
import { calculateHasBledGrade } from './grader.js';
import { emptyAssessment, priorityLabel, riskBandClass, riskBandLabel } from './types.js';

// HAS-BLED Score for Major Bleeding Risk — bedside wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// HAS-BLED score updates as the nine criteria are entered. Submission runs the
// pure scoring engine (per-criterion points, total 0-9, risk band, modifiable
// factors, flagged issues) and renders an inline report. State is persisted to
// localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'has-bled-score-for-major-bleeding-risk.front-end-with-html.v1';

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
  slug: 'has-bled-score-for-major-bleeding-risk',
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
// Section renderers (1 per HAS-BLED step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, where, the anticoagulation status, and the paired CHA2DS2-VASc stroke-risk score if known.'
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
      { value: 'cardiology', label: 'Cardiology' },
      { value: 'general-practice', label: 'General practice' },
      { value: 'anticoagulation-clinic', label: 'Anticoagulation clinic' },
      { value: 'acute-medical', label: 'Acute medical' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Anticoagulation status',
    section: 'context', field: 'anticoagulationStatus',
    options: [
      { value: 'on', label: 'On anticoagulation' },
      { value: 'considering', label: 'Considering anticoagulation' }
    ]
  }));
  card.appendChild(textInput({
    label: 'CHA2DS2-VASc score (if known)',
    section: 'context', field: 'chaDsVascScore',
    type: 'number', min: 0, max: 9, step: 1,
    hint: 'Optional paired stroke-risk score (0-9), recorded as context only. HAS-BLED is used alongside CHA2DS2-VASc, not instead of it.'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age, and sex. HAS-BLED is for adults (>= 18 years) with atrial fibrillation. Age also drives criterion E (elderly).'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. AF-100482 or hospital MRN'
  }));
  card.appendChild(textInput({
    label: 'Age',
    section: 'identification', field: 'ageYears', required: true,
    type: 'number', min: 0, max: 130, step: 1, unit: 'years',
    hint: 'Whole years. Age > 65 scores criterion E (elderly).'
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
    title: 'Hypertension (H)',
    description: 'Criterion H — scores 1 point when hypertension is uncontrolled (systolic blood pressure > 160 mmHg).'
  });

  card.appendChild(radioGroup({
    label: 'Uncontrolled hypertension (systolic BP > 160 mmHg)?',
    section: 'hypertension', field: 'hypertensionUncontrolled', options: yesNo,
    hint: 'Score for uncontrolled blood pressure, not merely a diagnosis of hypertension.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Criterion H point',
    id: 'hypertension-point-readout',
    render: () => renderPointReadout('hypertension')
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Renal and liver function (A, A)',
    description: 'Criterion A covers two independently scored items: abnormal renal function and abnormal liver function (1 point each).'
  });

  card.appendChild(radioGroup({
    label: 'Abnormal renal function?',
    section: 'organFunction', field: 'abnormalRenalFunction', options: yesNo,
    hint: 'Dialysis, renal transplant, or serum creatinine >= 200 umol/L.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Renal point',
    id: 'renal-point-readout',
    render: () => renderPointReadout('renal')
  }));

  card.appendChild(radioGroup({
    label: 'Abnormal liver function?',
    section: 'organFunction', field: 'abnormalLiverFunction', options: yesNo,
    hint: 'Chronic hepatic disease (e.g. cirrhosis) or bilirubin > 2x ULN with AST/ALT/ALP > 3x ULN.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Liver point',
    id: 'liver-point-readout',
    render: () => renderPointReadout('liver')
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Stroke history (S)',
    description: 'Criterion S — scores 1 point when there is a previous stroke.'
  });

  card.appendChild(radioGroup({
    label: 'Previous stroke?',
    section: 'stroke', field: 'strokeHistory', options: yesNo
  }));

  card.appendChild(readOnlyReadout({
    label: 'Criterion S point',
    id: 'stroke-point-readout',
    render: () => renderPointReadout('stroke')
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Bleeding history (B)',
    description: 'Criterion B — scores 1 point for prior major bleeding, a bleeding predisposition, or anaemia.'
  });

  card.appendChild(radioGroup({
    label: 'Bleeding history or predisposition?',
    section: 'bleeding', field: 'bleedingHistory', options: yesNo,
    hint: 'Prior major bleeding, a bleeding diathesis, or anaemia.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Criterion B point',
    id: 'bleeding-point-readout',
    render: () => renderPointReadout('bleeding')
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Labile INR (L)',
    description: 'Criterion L — scores 1 point for unstable/high INRs or time in therapeutic range < 60% (warfarin patients).'
  });

  card.appendChild(radioGroup({
    label: 'Labile INR?',
    section: 'labileInr', field: 'labileInr', options: yesNo,
    hint: 'Unstable or high INRs, or time in therapeutic range < 60%. Applies to warfarin patients.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Criterion L point',
    id: 'labile-inr-point-readout',
    render: () => renderPointReadout('labile-inr')
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Age (E)',
    description: 'Criterion E (elderly) — scores 1 point when age is over 65 years. Derived from the age recorded in step 2.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Recorded age',
    id: 'age-value-readout',
    render: () => renderAgeReadout()
  }));

  card.appendChild(readOnlyReadout({
    label: 'Criterion E point',
    id: 'elderly-point-readout',
    render: () => renderPointReadout('elderly')
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Drugs and alcohol (D, D)',
    description: 'Criterion D covers two independently scored items: concomitant antiplatelets/NSAIDs, and alcohol >= 8 units per week (1 point each).'
  });

  card.appendChild(radioGroup({
    label: 'Concomitant antiplatelet agents or NSAIDs?',
    section: 'drugsAlcohol', field: 'antiplateletOrNsaid', options: yesNo,
    hint: 'e.g. aspirin, clopidogrel, or non-steroidal anti-inflammatory drugs.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Drugs point',
    id: 'drugs-point-readout',
    render: () => renderPointReadout('drugs')
  }));

  card.appendChild(textInput({
    label: 'Alcohol consumption',
    section: 'drugsAlcohol', field: 'alcoholUnitsPerWeek',
    type: 'number', min: 0, max: 200, step: 0.5, unit: 'units/week',
    hint: 'Positive (1 point) when >= 8 units per week.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Alcohol point',
    id: 'alcohol-point-readout',
    render: () => renderPointReadout('alcohol')
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Summary and score',
    description: 'Live HAS-BLED total and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live HAS-BLED score',
    id: 'live-score-readout',
    render: () => renderLiveScore()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, modifiable factors to correct, and the anticoagulation decision alongside CHA2DS2-VASc.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Point map: criterion → GradingResult point field. */
const POINT_FIELD = {
  'hypertension': 'hypertensionPoints',
  'renal': 'renalPoints',
  'liver': 'liverPoints',
  'stroke': 'strokePoints',
  'bleeding': 'bleedingPoints',
  'labile-inr': 'labileInrPoints',
  'elderly': 'elderlyPoints',
  'drugs': 'drugsPoints',
  'alcohol': 'alcoholPoints'
};

/** Render the 0/1 point pill for a single criterion. */
function renderPointReadout(criterion) {
  const grade = calculateHasBledGrade(state);
  const point = grade[POINT_FIELD[criterion]] || 0;
  const cls = point === 1 ? 'warn' : 'ok';
  const note = point === 1 ? '(scores)' : '(does not score)';
  return `<strong class="${cls}">${point} point</strong> <span class="muted">${note}</span>`;
}

/** Render the recorded age with the elderly threshold note. */
function renderAgeReadout() {
  const age = state.identification.ageYears;
  if (age === null || age === undefined) {
    return `<span class="muted">Not recorded — enter age in step 2.</span>`;
  }
  const note = age > 65 ? 'over 65' : '65 or under';
  return `<strong>${esc(age)} years</strong> <span class="muted">(${note})</span>`;
}

/** Render the live overall HAS-BLED score and band. */
function renderLiveScore() {
  const grade = calculateHasBledGrade(state);
  const badge =
    `<span class="risk-badge ${riskBandClass(grade.riskBand)}">${esc(riskBandLabel(grade.riskBand))}</span>`;
  return `<strong>${grade.totalScore} of 9</strong> ${badge}`;
}

function refreshLiveScore() {
  for (const criterion of Object.keys(POINT_FIELD)) {
    const el = document.getElementById(`${criterion}-point-readout`);
    if (el) el.innerHTML = renderPointReadout(criterion);
  }
  const ageEl = document.getElementById('age-value-readout');
  if (ageEl) ageEl.innerHTML = renderAgeReadout();
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
// Progress + step list
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a [section, field]
// pair; the slot counts as answered when that field is answered. Step 8 (Age)
// reuses identification.ageYears, since the elderly criterion is derived from
// the age recorded in step 2.
const STEP_DEFINITIONS = [
  { step: 1,  title: 'Context',       slots: [['context', 'clinicianName'], ['context', 'clinicianRole'], ['context', 'careSetting']] },
  { step: 2,  title: 'Patient',       slots: [['identification', 'patientIdentifier'], ['identification', 'ageYears'], ['identification', 'sex']] },
  { step: 3,  title: 'Hypertension',  slots: [['hypertension', 'hypertensionUncontrolled']] },
  { step: 4,  title: 'Renal & liver', slots: [['organFunction', 'abnormalRenalFunction'], ['organFunction', 'abnormalLiverFunction']] },
  { step: 5,  title: 'Stroke',        slots: [['stroke', 'strokeHistory']] },
  { step: 6,  title: 'Bleeding',      slots: [['bleeding', 'bleedingHistory']] },
  { step: 7,  title: 'Labile INR',    slots: [['labileInr', 'labileInr']] },
  { step: 8,  title: 'Age',           slots: [['identification', 'ageYears']] },
  { step: 9,  title: 'Drugs & alcohol', slots: [['drugsAlcohol', 'antiplateletOrNsaid'], ['drugsAlcohol', 'alcoholUnitsPerWeek']] },
  { step: 10, title: 'Summary',       slots: [['note', 'clinicalNote']] }
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
    stepTotal[def.step] = def.slots.length;
    stepAnswered[def.step] = 0;
    for (const [section, field] of def.slots) {
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
    hypertensionPoints, renalPoints, liverPoints, strokePoints,
    bleedingPoints, labileInrPoints, elderlyPoints, drugsPoints,
    alcoholPoints, totalScore, riskBand, modifiableFactors,
    flaggedIssues, timestamp
  } = lastResult;

  const age = state.identification.ageYears;
  const alcohol = state.drugsAlcohol.alcoholUnitsPerWeek;
  const yn = (v) => v === 'yes' ? 'Yes' : v === 'no' ? 'No' : 'Not recorded';

  const criteriaRows = [
    ['H — Hypertension uncontrolled (SBP > 160)', yn(state.hypertension.hypertensionUncontrolled), hypertensionPoints],
    ['A — Abnormal renal function', yn(state.organFunction.abnormalRenalFunction), renalPoints],
    ['A — Abnormal liver function', yn(state.organFunction.abnormalLiverFunction), liverPoints],
    ['S — Stroke history', yn(state.stroke.strokeHistory), strokePoints],
    ['B — Bleeding history or predisposition', yn(state.bleeding.bleedingHistory), bleedingPoints],
    ['L — Labile INR', yn(state.labileInr.labileInr), labileInrPoints],
    ['E — Elderly (age > 65)', age === null ? 'Not recorded' : `${age} years`, elderlyPoints],
    ['D — Drugs (antiplatelets/NSAIDs)', yn(state.drugsAlcohol.antiplateletOrNsaid), drugsPoints],
    ['D — Alcohol (>= 8 units/week)', alcohol === null ? 'Not recorded' : `${alcohol} units/week`, alcoholPoints]
  ].map(([name, value, point]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
      <td class="num"><span class="grade-pill">${point} point</span></td>
    </tr>
  `).join('');

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No flagged issues raised.</p>`
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
  if (riskBand === 'high') {
    recommendation =
      `<p>This is a <strong>higher estimated major-bleeding risk</strong> (HAS-BLED >= 3). This is <strong>not a contraindication</strong> to anticoagulation and must not by itself be used to withhold it. Exercise caution, review more frequently, and actively correct modifiable factors (control blood pressure, improve INR stability, stop unnecessary antiplatelets/NSAIDs, reduce alcohol). Weigh the bleeding risk against the CHA2DS2-VASc stroke risk.</p>`;
  } else if (riskBand === 'moderate') {
    recommendation =
      `<p>This is a <strong>moderate estimated bleeding risk</strong> (HAS-BLED 1-2). Anticoagulate where the stroke risk warrants; address any modifiable factors and review periodically.</p>`;
  } else {
    recommendation =
      `<p>This is a <strong>low estimated major-bleeding risk</strong> (HAS-BLED 0). Anticoagulate per the stroke-risk score (CHA2DS2-VASc); routine review. A low score does not guarantee the absence of bleeding.</p>`;
  }

  const modifiableBlock = modifiableFactors
    ? `<h3>Modifiable factors to correct</h3><p>${esc(modifiableFactors)}.</p>`
    : `<h3>Modifiable factors to correct</h3><p class="muted">None of the four correctable factors (hypertension, labile INR, antiplatelets/NSAIDs, alcohol) is present.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>HAS-BLED Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${riskBandClass(riskBand)}">
        <div>
          <span class="risk-banner-label">HAS-BLED score</span>
          <span class="risk-banner-value">${totalScore} of 9</span>
        </div>
        <span class="risk-badge ${riskBandClass(riskBand)}">${esc(riskBandLabel(riskBand))}</span>
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

      <h3>Recommended action</h3>
      ${recommendation}

      ${modifiableBlock}

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
  const grade = calculateHasBledGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade.totalScore);
  lastResult = {
    hypertensionPoints: grade.hypertensionPoints,
    renalPoints: grade.renalPoints,
    liverPoints: grade.liverPoints,
    strokePoints: grade.strokePoints,
    bleedingPoints: grade.bleedingPoints,
    labileInrPoints: grade.labileInrPoints,
    elderlyPoints: grade.elderlyPoints,
    drugsPoints: grade.drugsPoints,
    alcoholPoints: grade.alcoholPoints,
    totalScore: grade.totalScore,
    riskBand: grade.riskBand,
    modifiableFactors: grade.modifiableFactors,
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
