import { detectFlaggedIssues } from './flags.js';
import { calculateGrade } from './grader.js';
import { abeGroupClass, abeGroupLabel, abeGroupShort, axisClass, axisLabel, emptyAssessment, goldGradeClass, goldGradeLabel, goldGradeShort, priorityLabel, reviewStatusClass, reviewStatusLabel } from './types.js';

// Chronic Obstructive Pulmonary Disease Review (COPD annual review) — wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// classification (GOLD airflow grade, ABE group, symptom / exacerbation axes,
// review-completeness) updates as data is entered. Submission runs the pure
// grading engine and renders an inline report. State is persisted to
// localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'chronic-obstructive-pulmonary-disease-review.front-end-with-html.v1';

/** @returns {import('./types.js').ReviewData} */
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
    console.warn('Could not parse saved review; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').ReviewData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save review to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored review.', e);
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

/** @type {import('./types.js').ReviewData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'chronic-obstructive-pulmonary-disease-review',
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
    refreshLiveClassification();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 11;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-classification readout after each change.
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshLiveClassification();
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

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const vaccineOptions = [
  { value: 'up-to-date', label: 'Up to date' },
  { value: 'due', label: 'Due' },
  { value: 'declined', label: 'Declined' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per review step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Review context and identification',
    description: 'Who is reviewing, when, the review type, and patient identification.'
  });

  card.appendChild(textInput({
    label: 'Reviewing clinician name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. Sister J. Okonkwo'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'gp', label: 'GP' },
      { value: 'practice-nurse', label: 'Practice nurse' },
      { value: 'respiratory-nurse', label: 'Respiratory nurse' },
      { value: 'pharmacist', label: 'Clinical pharmacist' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date of review',
    section: 'context', field: 'reviewedAt', type: 'date'
  }));
  card.appendChild(selectInput({
    label: 'Review type',
    section: 'context', field: 'reviewType', required: true,
    options: [
      { value: 'routine-annual', label: 'Routine annual' },
      { value: 'post-exacerbation', label: 'Post-exacerbation' },
      { value: 'opportunistic', label: 'Opportunistic' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'context', field: 'patientIdentifier', required: true,
    placeholder: 'NHS number or local identifier'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'context', field: 'ageBand', required: true,
    hint: 'COPD review is for adults (≥ 16 years).',
    options: [
      { value: '18-39', label: '18-39' },
      { value: '40-59', label: '40-59' },
      { value: '60-79', label: '60-79' },
      { value: '>=80', label: '80 and over' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'context', field: 'sex', required: true,
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'intersex', label: 'Intersex' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Diagnosis and history',
    description: 'Year of diagnosis, spirometric confirmation, and exposure history.'
  });

  card.appendChild(textInput({
    label: 'Year of COPD diagnosis',
    section: 'diagnosis', field: 'diagnosisYear',
    type: 'number', min: 1950, max: 2100, step: 1,
    placeholder: 'e.g. 2016'
  }));
  card.appendChild(radioGroup({
    label: 'Diagnosis confirmed on spirometry (post-bronchodilator FEV₁/FVC < 0.70)?',
    section: 'diagnosis', field: 'spirometryConfirmed', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Occupational / environmental exposures',
    section: 'diagnosis', field: 'exposureNotes',
    placeholder: 'e.g. lifetime tobacco, coal dust, biomass smoke, occupational fumes.'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Spirometry',
    description: 'Post-bronchodilator spirometry. FEV₁ % predicted determines the GOLD airflow grade.'
  });

  card.appendChild(textInput({
    label: 'Post-bronchodilator FEV₁',
    section: 'spirometry', field: 'fev1Litres',
    type: 'number', min: 0, max: 8, step: 0.01, unit: 'litres'
  }));
  card.appendChild(textInput({
    label: 'FEV₁ % predicted',
    section: 'spirometry', field: 'fev1PercentPredicted',
    type: 'number', min: 0, max: 150, step: 0.1, unit: '%',
    hint: 'GOLD grade: ≥ 80 → 1 (mild), 50–79 → 2 (moderate), 30–49 → 3 (severe), < 30 → 4 (very severe).'
  }));
  card.appendChild(textInput({
    label: 'FVC',
    section: 'spirometry', field: 'fvcLitres',
    type: 'number', min: 0, max: 10, step: 0.01, unit: 'litres'
  }));
  card.appendChild(textInput({
    label: 'FEV₁/FVC ratio',
    section: 'spirometry', field: 'fev1FvcRatio',
    type: 'number', min: 0, max: 1, step: 0.001,
    hint: 'Airflow obstruction is confirmed when < 0.70.'
  }));
  card.appendChild(textInput({
    label: 'Date of spirometry',
    section: 'spirometry', field: 'spirometryDate', type: 'date'
  }));

  card.appendChild(readOnlyReadout({
    label: 'GOLD airflow grade',
    id: 'gold-readout',
    render: () => renderGoldReadout()
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Symptom burden',
    description: 'MRC / mMRC dyspnoea grades and CAT score feed the symptom axis of the ABE group.'
  });

  card.appendChild(textInput({
    label: 'MRC dyspnoea grade',
    section: 'symptoms', field: 'mrcGrade',
    type: 'number', min: 1, max: 5, step: 1,
    hint: 'MRC 1-5. Grade ≥ 3 is a pulmonary-rehabilitation trigger.'
  }));
  card.appendChild(textInput({
    label: 'mMRC dyspnoea grade',
    section: 'symptoms', field: 'mmrcGrade',
    type: 'number', min: 0, max: 4, step: 1,
    hint: 'mMRC 0-4. Grade ≥ 2 drives the high symptom axis.'
  }));
  card.appendChild(textInput({
    label: 'COPD Assessment Test (CAT) total',
    section: 'symptoms', field: 'catScore',
    type: 'number', min: 0, max: 40, step: 1,
    hint: 'CAT 0-40. Score ≥ 10 drives the high symptom axis.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Symptom axis',
    id: 'symptom-readout',
    render: () => renderAxisReadout('symptom')
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Exacerbations (past 12 months)',
    description: 'Exacerbation history feeds the exacerbation-risk axis of the ABE group.'
  });

  card.appendChild(textInput({
    label: 'Moderate exacerbations in past 12 months',
    section: 'exacerbations', field: 'exacerbationsLast12m',
    type: 'number', min: 0, max: 30, step: 1,
    hint: '≥ 2 drives high exacerbation risk.'
  }));
  card.appendChild(textInput({
    label: 'Exacerbations needing hospital admission',
    section: 'exacerbations', field: 'hospitalisationsLast12m',
    type: 'number', min: 0, max: 30, step: 1,
    hint: '≥ 1 drives high exacerbation risk.'
  }));
  card.appendChild(textInput({
    label: 'Date of most recent exacerbation',
    section: 'exacerbations', field: 'lastExacerbationDate', type: 'date'
  }));
  card.appendChild(textInput({
    label: 'Rescue-pack courses used',
    section: 'exacerbations', field: 'rescuePackCourses',
    type: 'number', min: 0, max: 30, step: 1,
    unit: 'courses'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Exacerbation-risk axis',
    id: 'exacerbation-readout',
    render: () => renderAxisReadout('exacerbation')
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Smoking status and cessation',
    description: 'Smoking is the leading modifiable risk factor in COPD.'
  });

  card.appendChild(selectInput({
    label: 'Smoking status',
    section: 'smoking', field: 'smokingStatus', required: true,
    options: [
      { value: 'current', label: 'Current smoker' },
      { value: 'ex', label: 'Ex-smoker' },
      { value: 'never', label: 'Never smoked' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Pack-years',
    section: 'smoking', field: 'packYears',
    type: 'number', min: 0, max: 200, step: 0.1, unit: 'pack-years'
  }));
  card.appendChild(radioGroup({
    label: 'Cessation support offered (brief advice / referral)?',
    section: 'smoking', field: 'cessationSupportOffered', options: yesNo
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Inhaler therapy',
    description: 'Current regimen, device, technique check, and adherence.'
  });

  card.appendChild(textArea({
    label: 'Current inhaled therapy',
    section: 'inhaler', field: 'inhaledTherapy', rows: 2,
    placeholder: 'e.g. LABA+LAMA (tiotropium/olodaterol), plus SABA (salbutamol) PRN.'
  }));
  card.appendChild(textInput({
    label: 'Device type(s)',
    section: 'inhaler', field: 'deviceType',
    placeholder: 'e.g. Respimat soft-mist, DPI, pMDI + spacer'
  }));
  card.appendChild(radioGroup({
    label: 'Inhaler technique checked this review?',
    section: 'inhaler', field: 'inhalerTechniqueChecked', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Inhaler technique adequate?',
    section: 'inhaler', field: 'inhalerTechniqueAdequate', options: yesNo
  }));
  card.appendChild(selectInput({
    label: 'Self-reported adherence',
    section: 'inhaler', field: 'adherence',
    options: [
      { value: 'good', label: 'Good' },
      { value: 'partial', label: 'Partial' },
      { value: 'poor', label: 'Poor' }
    ]
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Vaccinations',
    description: 'Seasonal influenza, pneumococcal, and COVID-19 status.'
  });

  card.appendChild(selectInput({
    label: 'Seasonal influenza',
    section: 'vaccinations', field: 'influenzaVaccine', options: vaccineOptions
  }));
  card.appendChild(selectInput({
    label: 'Pneumococcal',
    section: 'vaccinations', field: 'pneumococcalVaccine', options: vaccineOptions
  }));
  card.appendChild(selectInput({
    label: 'COVID-19',
    section: 'vaccinations', field: 'covidVaccine', options: vaccineOptions
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Pulmonary rehabilitation and oxygen',
    description: 'Rehab status, home-oxygen use, and resting oxygen saturation.'
  });

  card.appendChild(selectInput({
    label: 'Pulmonary-rehabilitation status',
    section: 'rehab', field: 'pulmonaryRehabStatus',
    options: [
      { value: 'completed', label: 'Completed' },
      { value: 'referred', label: 'Referred' },
      { value: 'eligible-not-referred', label: 'Eligible, not referred' },
      { value: 'not-indicated', label: 'Not indicated' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Home-oxygen use',
    section: 'rehab', field: 'oxygenUse',
    options: [
      { value: 'none', label: 'None' },
      { value: 'long-term', label: 'Long-term oxygen therapy' },
      { value: 'ambulatory', label: 'Ambulatory oxygen' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Resting SpO₂ on room air',
    section: 'rehab', field: 'restingSpo2',
    type: 'number', min: 50, max: 100, step: 1, unit: '%'
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Comorbidities and self-management',
    description: 'Recorded comorbidities, self-management plan, rescue pack, and next review interval.'
  });

  card.appendChild(textArea({
    label: 'Recorded comorbidities',
    section: 'selfManagement', field: 'comorbidities', rows: 2,
    placeholder: 'e.g. ischaemic heart disease, anxiety/depression, osteoporosis.'
  }));
  card.appendChild(radioGroup({
    label: 'Personalised self-management plan in place?',
    section: 'selfManagement', field: 'selfManagementPlan', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Rescue pack supplied?',
    section: 'selfManagement', field: 'rescuePackSupplied', options: yesNo
  }));
  card.appendChild(textInput({
    label: 'Next review interval',
    section: 'selfManagement', field: 'nextReviewInterval',
    placeholder: 'e.g. 12 months, or 3 months if unstable'
  }));

  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Summary and classification',
    description: 'Live GOLD grade, ABE group, review completeness, and a free-text clinician note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live classification',
    id: 'live-classification-readout',
    render: () => renderLiveClassification()
  }));

  card.appendChild(textArea({
    label: 'Clinician note',
    section: 'note', field: 'clinicianNote',
    placeholder: 'Free-text summary: decisions made, therapy changes, referrals, and safety-netting advice.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

function renderGoldReadout() {
  const grade = calculateGrade(state);
  if (grade.goldGrade === null) {
    return `<span class="muted">Not assigned — record FEV₁ % predicted.</span>`;
  }
  return `<span class="risk-badge ${goldGradeClass(grade.goldGrade)}">${esc(goldGradeLabel(grade.goldGrade))}</span>`;
}

function renderAxisReadout(which) {
  const grade = calculateGrade(state);
  const axis = which === 'symptom' ? grade.symptomBurden : grade.exacerbationRisk;
  const label = which === 'symptom' ? 'Symptom burden' : 'Exacerbation risk';
  return `<span class="risk-badge ${axisClass(axis)}">${esc(label)}: ${esc(axisLabel(axis))}</span>`;
}

function renderLiveClassification() {
  const grade = calculateGrade(state);
  const gold = grade.goldGrade === null
    ? `<span class="muted">GOLD: N/A</span>`
    : `<span class="risk-badge ${goldGradeClass(grade.goldGrade)}">${esc(goldGradeShort(grade.goldGrade))}</span>`;
  const abe = grade.abeGroup === null
    ? `<span class="muted">ABE: N/A</span>`
    : `<span class="risk-badge ${abeGroupClass(grade.abeGroup)}">${esc(abeGroupShort(grade.abeGroup))}</span>`;
  const status = `<span class="risk-badge ${reviewStatusClass(grade.reviewStatus)}">${esc(reviewStatusLabel(grade.reviewStatus))}</span>`;
  return `${gold} ${abe} ${status}`;
}

function refreshLiveClassification() {
  const gold = document.getElementById('gold-readout');
  if (gold) gold.innerHTML = renderGoldReadout();
  const sym = document.getElementById('symptom-readout');
  if (sym) sym.innerHTML = renderAxisReadout('symptom');
  const exa = document.getElementById('exacerbation-readout');
  if (exa) exa.innerHTML = renderAxisReadout('exacerbation');
  const live = document.getElementById('live-classification-readout');
  if (live) live.innerHTML = renderLiveClassification();
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
  context: [['clinicianName'], ['clinicianRole'], ['reviewType'], ['patientIdentifier'], ['ageBand'], ['sex']],
  diagnosis: [['diagnosisYear', 'spirometryConfirmed']],
  spirometry: [['fev1PercentPredicted']],
  symptoms: [['mmrcGrade', 'catScore', 'mrcGrade']],
  exacerbations: [['exacerbationsLast12m', 'hospitalisationsLast12m']],
  smoking: [['smokingStatus']],
  inhaler: [['inhalerTechniqueChecked']],
  vaccinations: [['influenzaVaccine', 'pneumococcalVaccine', 'covidVaccine']],
  rehab: [['pulmonaryRehabStatus']],
  selfManagement: [['selfManagementPlan']],
  note: [['clinicianNote']]
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
    goldGrade, symptomBurden, exacerbationRisk, abeGroup,
    reviewStatus, flaggedIssues, timestamp
  } = lastResult;

  const sp = state.spirometry;
  const sy = state.symptoms;
  const ex = state.exacerbations;

  const fev1Pct = sp.fev1PercentPredicted;
  const symptomDetail = [
    sy.mmrcGrade !== null ? `mMRC ${sy.mmrcGrade}` : null,
    sy.catScore !== null ? `CAT ${sy.catScore}` : null
  ].filter(Boolean).join(', ') || 'Not recorded';
  const exacerbationDetail = [
    ex.exacerbationsLast12m !== null ? `${ex.exacerbationsLast12m} moderate` : null,
    ex.hospitalisationsLast12m !== null ? `${ex.hospitalisationsLast12m} hospitalised` : null
  ].filter(Boolean).join(', ') || 'Not recorded';

  const axisRows = [
    ['GOLD airflow grade', fev1Pct === null ? 'FEV₁ % not recorded' : `FEV₁ ${fev1Pct}% predicted`,
      goldGrade === null ? 'N/A' : goldGradeShortLocal(goldGrade), goldGradeClass(goldGrade)],
    ['Symptom axis', symptomDetail, axisLabel(symptomBurden), axisClass(symptomBurden)],
    ['Exacerbation axis', exacerbationDetail, axisLabel(exacerbationRisk), axisClass(exacerbationRisk)],
    ['ABE group', 'Combined symptom + exacerbation', abeGroup === null ? 'N/A' : `Group ${abeGroup}`,
      abeGroupClass(abeGroup)],
    ['Review completeness', 'Core + supporting elements', reviewStatusLabel(reviewStatus),
      reviewStatusClass(reviewStatus)]
  ].map(([name, value, badge, cls]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
      <td class="num"><span class="risk-badge ${cls}">${esc(badge)}</span></td>
    </tr>
  `).join('');

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No action flags raised.</p>`
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

  const goldText = goldGrade === null
    ? `<span class="muted">GOLD grade not assigned</span>`
    : esc(goldGradeLabel(goldGrade));
  const abeText = abeGroup === null
    ? `<span class="muted">ABE group not assigned</span>`
    : esc(abeGroupLabel(abeGroup));

  const note = state.note.clinicianNote
    ? `<h3>Clinician note</h3><p>${esc(state.note.clinicianNote)}</p>`
    : '';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>COPD Annual Review Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${goldGradeClass(goldGrade)}">
        <div>
          <span class="risk-banner-label">Classification</span>
          <span class="risk-banner-value">${goldGrade === null ? 'GOLD N/A' : esc(goldGradeShortLocal(goldGrade))} · ${abeGroup === null ? 'ABE N/A' : 'Group ' + esc(abeGroup)}</span>
        </div>
        <span class="risk-badge ${reviewStatusClass(reviewStatus)}">${esc(reviewStatusLabel(reviewStatus))} review</span>
      </div>

      <p>${goldText}. ${abeText}.</p>

      <h3>Classification detail</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Axis</th>
            <th scope="col">Value</th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>${axisRows}</tbody>
      </table>

      <h3>Action flags (${flaggedIssues.length})</h3>
      ${flagsList}

      ${note}

      <div class="report-actions">
        <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
      </div>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
}

/** Local short GOLD label (avoids clashing with the imported destructured name). */
function goldGradeShortLocal(grade) {
  return goldGradeShort(grade);
}

function submitForm() {
  const _errors = validateForm();
  if (_errors.length > 0) return;
  const grade = calculateGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    goldGrade: grade.goldGrade,
    symptomBurden: grade.symptomBurden,
    exacerbationRisk: grade.exacerbationRisk,
    abeGroup: grade.abeGroup,
    reviewStatus: grade.reviewStatus,
    firedRules: grade.firedRules,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh review?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveClassification();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'diagnosis',      title: 'Diagnosis' },
  { step: 3, section: 'spirometry',     title: 'Spirometry' },
  { step: 4, section: 'symptoms',       title: 'Symptoms' },
  { step: 5, section: 'exacerbations',  title: 'Exacerbations' },
  { step: 6, section: 'smoking',        title: 'Smoking' },
  { step: 7, section: 'inhaler',        title: 'Inhaler' },
  { step: 8, section: 'vaccinations',   title: 'Vaccinations' },
  { step: 9, section: 'rehab',          title: 'Rehab / oxygen' },
  { step: 10, section: 'selfManagement', title: 'Self-management' },
  { step: 11, section: 'note',          title: 'Summary' }
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
  host.appendChild(renderStep10());
  host.appendChild(renderStep11());
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveClassification();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
