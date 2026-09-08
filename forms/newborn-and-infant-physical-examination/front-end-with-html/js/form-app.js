import { detectFlaggedIssues } from './flags.js';
import { calculateNipeGrade } from './grader.js';
import { componentResultClass, componentResultLabel, emptyAssessment, outcomeClass, outcomeLabel, priorityLabel, sexLabel } from './types.js';

// Newborn and Infant Physical Examination (NIPE) — screening wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The practitioner scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered, and each key
// component (eyes, heart, hips, testes) shows a live Satisfactory / Refer /
// Not-examined result as its observations are entered. Submission runs the pure
// classification engine (per-component results, overall screening outcome,
// completeness, referral pathways, flagged issues) and renders an inline report.
// State is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'newborn-and-infant-physical-examination.front-end-with-html.v1';

/** @returns {import('./types.js').ExaminationData} */
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
    console.warn('Could not parse saved examination; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').ExaminationData} s */
function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save examination to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored examination.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

/** @type {import('./types.js').ExaminationData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'newborn-and-infant-physical-examination',
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
 * conditional visibility, and the live-result readouts after each change.
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
// Shared option sets
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];
const redReflexOpts = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'not-examined', label: 'Not examined' }
];
const normalAbnormalOpts = [
  { value: 'normal', label: 'Normal' },
  { value: 'abnormal', label: 'Abnormal' },
  { value: 'not-examined', label: 'Not examined' }
];
const murmurOpts = [
  { value: 'none', label: 'None' },
  { value: 'present', label: 'Present' },
  { value: 'not-examined', label: 'Not examined' }
];
const femoralOpts = [
  { value: 'present', label: 'Present' },
  { value: 'weak', label: 'Weak' },
  { value: 'absent', label: 'Absent' },
  { value: 'not-examined', label: 'Not examined' }
];
const cyanosisOpts = [
  { value: 'absent', label: 'Absent' },
  { value: 'present', label: 'Present' },
  { value: 'not-examined', label: 'Not examined' }
];
const barlowOpts = [
  { value: 'negative', label: 'Negative' },
  { value: 'positive', label: 'Positive' },
  { value: 'not-examined', label: 'Not examined' }
];
const hipAbductionOpts = [
  { value: 'normal', label: 'Normal' },
  { value: 'limited', label: 'Limited' },
  { value: 'not-examined', label: 'Not examined' }
];
const testisOpts = [
  { value: 'descended', label: 'Descended' },
  { value: 'undescended', label: 'Undescended' },
  { value: 'not-palpable', label: 'Not palpable' },
  { value: 'not-examined', label: 'Not examined' }
];
const componentResultOpts = [
  { value: 'satisfactory', label: 'Satisfactory' },
  { value: 'refer', label: 'Refer' },
  { value: 'not-examined', label: 'Not examined' }
];
const testesResultOpts = componentResultOpts.concat([
  { value: 'not-applicable', label: 'Not applicable' }
]);

// The twelve head-to-toe systematic-examination enum fields.
const SYSTEMATIC_FIELDS = [
  { field: 'generalAppearance', label: 'General appearance' },
  { field: 'skin', label: 'Skin' },
  { field: 'headAndFontanelles', label: 'Head and fontanelles' },
  { field: 'faceAndPalate', label: 'Face and palate' },
  { field: 'neckAndClavicles', label: 'Neck and clavicles' },
  { field: 'chestAndLungs', label: 'Chest and lungs' },
  { field: 'abdomen', label: 'Abdomen' },
  { field: 'genitalia', label: 'Genitalia' },
  { field: 'anusAndSpine', label: 'Anus and spine' },
  { field: 'limbsAndDigits', label: 'Limbs and digits' },
  { field: 'feet', label: 'Feet' },
  { field: 'toneAndMovement', label: 'Tone and movement' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per NIPE step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Examination context',
    description: 'Who is examining, when, the screening context, and the care setting.'
  });
  card.appendChild(textInput({
    label: 'Examining practitioner name',
    section: 'context', field: 'practitionerName', required: true,
    placeholder: 'e.g. J. Okonkwo'
  }));
  card.appendChild(selectInput({
    label: 'Practitioner role',
    section: 'context', field: 'practitionerRole', required: true,
    options: [
      { value: 'midwife', label: 'Midwife' },
      { value: 'neonatal-nurse', label: 'Neonatal nurse' },
      { value: 'paediatrician', label: 'Paediatrician' },
      { value: 'gp', label: 'GP' },
      { value: 'nurse-practitioner', label: 'Nurse practitioner' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of examination',
    section: 'context', field: 'examinedAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Examination context',
    section: 'context', field: 'examinationContext', required: true,
    options: [
      { value: 'newborn-72h', label: 'Newborn — within 72 hours of birth' },
      { value: 'infant-6-8-week', label: 'Infant — 6-8 week review' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'careSetting', required: true,
    options: [
      { value: 'maternity-ward', label: 'Maternity ward' },
      { value: 'neonatal-unit', label: 'Neonatal unit' },
      { value: 'community', label: 'Community / midwife-led clinic' },
      { value: 'gp-surgery', label: 'GP surgery' },
      { value: 'home', label: 'Home visit' },
      { value: 'other', label: 'Other' }
    ]
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Baby identification',
    description: 'NHS number or local identifier, name, date of birth, sex, and birth details.'
  });
  card.appendChild(textInput({
    label: 'NHS number or local identifier',
    section: 'identification', field: 'babyIdentifier', required: true,
    placeholder: 'e.g. 943 476 5919'
  }));
  card.appendChild(textInput({
    label: 'Baby name',
    section: 'identification', field: 'babyName',
    placeholder: 'e.g. Baby Adeyemi'
  }));
  card.appendChild(textInput({
    label: 'Date of birth',
    section: 'identification', field: 'dateOfBirth', type: 'date'
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'identification', field: 'sex', required: true,
    hint: 'The testes component is applicable only when sex is male.',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'indeterminate', label: 'Indeterminate' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Gestational age at birth',
    section: 'identification', field: 'gestationalAgeWeeks',
    type: 'number', min: 0, max: 45, step: 0.1, unit: 'weeks'
  }));
  card.appendChild(textInput({
    label: 'Birth weight',
    section: 'identification', field: 'birthWeightGrams',
    type: 'number', min: 0, max: 8000, step: 1, unit: 'g'
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Risk factors',
    description: 'Hip risk factors and any relevant antenatal concerns. A hip risk factor triggers a hip referral even when the examination is normal.'
  });
  card.appendChild(radioGroup({
    label: 'Breech presentation at or after 36 weeks, or at birth?',
    section: 'riskFactors', field: 'breechPresentation', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'First-degree family history of hip problems?',
    section: 'riskFactors', field: 'familyHistoryHipProblems', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Antenatal concerns',
    section: 'riskFactors', field: 'antenatalConcerns',
    placeholder: 'Relevant antenatal findings or concerns.'
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Eyes (key component)',
    description: 'Red reflex in both eyes and external appearance. An absent/abnormal red reflex or abnormal appearance is a Refer.'
  });
  card.appendChild(selectInput({
    label: 'Red reflex — right eye',
    section: 'eyes', field: 'eyesRedReflexRight', options: redReflexOpts
  }));
  card.appendChild(selectInput({
    label: 'Red reflex — left eye',
    section: 'eyes', field: 'eyesRedReflexLeft', options: redReflexOpts
  }));
  card.appendChild(selectInput({
    label: 'External eye appearance',
    section: 'eyes', field: 'eyesAppearance', options: normalAbnormalOpts
  }));
  card.appendChild(readOnlyReadout({
    label: 'Eyes result',
    id: 'eyes-result-readout',
    render: () => renderComponentReadout('eyes')
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Heart (key component)',
    description: 'Heart sounds, femoral pulses, central cyanosis, and pre-/post-ductal saturations. Any abnormality is a Refer.'
  });
  card.appendChild(selectInput({
    label: 'Heart murmur',
    section: 'heart', field: 'heartMurmur', options: murmurOpts
  }));
  card.appendChild(selectInput({
    label: 'Femoral pulse — right',
    section: 'heart', field: 'femoralPulsesRight', options: femoralOpts
  }));
  card.appendChild(selectInput({
    label: 'Femoral pulse — left',
    section: 'heart', field: 'femoralPulsesLeft', options: femoralOpts
  }));
  card.appendChild(selectInput({
    label: 'Central cyanosis',
    section: 'heart', field: 'centralCyanosis', options: cyanosisOpts
  }));
  card.appendChild(textInput({
    label: 'Pre-ductal oxygen saturation',
    section: 'heart', field: 'oxygenSaturationPreductal',
    type: 'number', min: 0, max: 100, step: 1, unit: '%',
    hint: 'Right hand. A saturation below 95% is a Refer trigger.'
  }));
  card.appendChild(textInput({
    label: 'Post-ductal oxygen saturation',
    section: 'heart', field: 'oxygenSaturationPostductal',
    type: 'number', min: 0, max: 100, step: 1, unit: '%',
    hint: 'Either foot. A pre-/post-ductal difference above 3% is flagged.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Heart result',
    id: 'heart-result-readout',
    render: () => renderComponentReadout('heart')
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Hips (key component)',
    description: 'Barlow and Ortolani manoeuvres and hip abduction. An unstable hip, limited abduction, or a hip risk factor is a Refer.'
  });
  card.appendChild(selectInput({
    label: 'Barlow manoeuvre',
    section: 'hips', field: 'barlowTest', options: barlowOpts
  }));
  card.appendChild(selectInput({
    label: 'Ortolani manoeuvre',
    section: 'hips', field: 'ortolaniTest', options: barlowOpts
  }));
  card.appendChild(selectInput({
    label: 'Hip abduction',
    section: 'hips', field: 'hipAbduction', options: hipAbductionOpts
  }));
  card.appendChild(readOnlyReadout({
    label: 'Hips result',
    id: 'hips-result-readout',
    render: () => renderComponentReadout('hips')
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Testes (key component, boys)',
    description: 'Both testes descended and palpable. Applicable only when sex is male; skipped for a girl.'
  });
  const host = document.createElement('div');
  host.id = 'testes-applicable';
  host.setAttribute('data-conditional', 'identification.sex=male');
  host.appendChild(selectInput({
    label: 'Right testis',
    section: 'testes', field: 'testisRight', options: testisOpts
  }));
  host.appendChild(selectInput({
    label: 'Left testis',
    section: 'testes', field: 'testisLeft', options: testisOpts
  }));
  card.appendChild(host);
  card.appendChild(readOnlyReadout({
    label: 'Testes result',
    id: 'testes-result-readout',
    render: () => renderComponentReadout('testes')
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Head-to-toe systematic examination',
    description: 'A systematic head-to-toe assessment plus measurements. These inform the record but do not change the four key-component results.'
  });
  for (const f of SYSTEMATIC_FIELDS) {
    card.appendChild(selectInput({
      label: f.label,
      section: 'systematic', field: f.field, options: normalAbnormalOpts
    }));
  }
  card.appendChild(textInput({
    label: 'Weight',
    section: 'systematic', field: 'weightGrams',
    type: 'number', min: 0, max: 8000, step: 1, unit: 'g'
  }));
  card.appendChild(textInput({
    label: 'Head circumference',
    section: 'systematic', field: 'headCircumferenceCm',
    type: 'number', min: 0, max: 60, step: 0.1, unit: 'cm'
  }));
  card.appendChild(textInput({
    label: 'Length',
    section: 'systematic', field: 'lengthCm',
    type: 'number', min: 0, max: 80, step: 0.1, unit: 'cm'
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Summary and outcome',
    description: 'Live overall screening outcome, optional practitioner-recorded results, and a free-text note. Submit to generate the full report.'
  });
  card.appendChild(readOnlyReadout({
    label: 'Live overall outcome',
    id: 'overall-outcome-readout',
    render: () => renderOverallReadout()
  }));
  card.appendChild(selectInput({
    label: 'Recorded eyes result (optional cross-check)',
    section: 'summary', field: 'eyesResultRecorded', options: componentResultOpts
  }));
  card.appendChild(selectInput({
    label: 'Recorded heart result (optional cross-check)',
    section: 'summary', field: 'heartResultRecorded', options: componentResultOpts
  }));
  card.appendChild(selectInput({
    label: 'Recorded hips result (optional cross-check)',
    section: 'summary', field: 'hipsResultRecorded', options: componentResultOpts
  }));
  card.appendChild(selectInput({
    label: 'Recorded testes result (optional cross-check)',
    section: 'summary', field: 'testesResultRecorded', options: testesResultOpts
  }));
  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'summary', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: findings, decisions, and any referral already actioned.'
  }));
  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the per-component result pill (satisfactory / refer / not-examined). */
function renderComponentReadout(component) {
  const grade = calculateNipeGrade(state);
  const result =
    component === 'eyes' ? grade.eyesResult
    : component === 'heart' ? grade.heartResult
    : component === 'hips' ? grade.hipsResult
    : grade.testesResult;
  return `<span class="risk-badge ${componentResultClass(result)}">${esc(componentResultLabel(result))}</span>`;
}

/** Render the live overall screening outcome and completeness. */
function renderOverallReadout() {
  const grade = calculateNipeGrade(state);
  const badge =
    `<span class="risk-badge ${outcomeClass(grade.overallOutcome)}">${esc(outcomeLabel(grade.overallOutcome))}</span>`;
  return `${badge} <span class="muted">completeness ${grade.completenessPercent}%</span>`;
}

function refreshLiveScore() {
  for (const c of ['eyes', 'heart', 'hips', 'testes']) {
    const el = document.getElementById(`${c}-result-readout`);
    if (el) el.innerHTML = renderComponentReadout(c);
  }
  const overall = document.getElementById('overall-outcome-readout');
  if (overall) overall.innerHTML = renderOverallReadout();
}

// ----------------------------------------------------------------------
// Conditional sections (testes visible only for boys)
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
  context: [['practitionerName'], ['practitionerRole'], ['examinationContext'], ['careSetting']],
  identification: [['babyIdentifier'], ['sex']],
  riskFactors: [['breechPresentation'], ['familyHistoryHipProblems']],
  eyes: [['eyesRedReflexRight'], ['eyesRedReflexLeft'], ['eyesAppearance']],
  heart: [['heartMurmur'], ['femoralPulsesRight'], ['femoralPulsesLeft'], ['centralCyanosis']],
  hips: [['barlowTest'], ['ortolaniTest'], ['hipAbduction']],
  testes: [['testisRight'], ['testisLeft']],
  systematic: [['generalAppearance'], ['chestAndLungs'], ['abdomen'], ['limbsAndDigits']],
  summary: [['clinicalNote']]
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
  const testesApplicable = state.identification.sex === 'male';

  for (const section of Object.keys(STEP_SLOTS)) {
    // Testes step is not counted when the baby is not male.
    if (section === 'testes' && !testesApplicable) {
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

const URGENCY_LABEL = {
  'same-day': 'Same day',
  'within-2-weeks': 'Within 2 weeks',
  'by-6-weeks': 'By 6 weeks of age',
  'review-6-8-weeks': 'Review at 6-8 weeks'
};

const COMPONENT_LABEL = {
  eyes: 'Eyes',
  heart: 'Heart',
  hips: 'Hips',
  testes: 'Testes'
};

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    eyesResult, heartResult, hipsResult, testesResult,
    overallOutcome, completeness, completenessPercent,
    referrals, flaggedIssues, timestamp
  } = lastResult;

  const componentRows = [
    ['Eyes', eyesResult],
    ['Heart', heartResult],
    ['Hips', hipsResult],
    ['Testes', testesResult]
  ].map(([name, result]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td><span class="risk-badge ${componentResultClass(result)}">${esc(componentResultLabel(result))}</span></td>
    </tr>
  `).join('');

  const referralsList = referrals.length === 0
    ? `<p class="muted">No referral pathways triggered.</p>`
    : `
      <ul class="flags">
        ${referrals.map((r) => `
          <li class="flag-high">
            <span class="flag-priority">${esc(URGENCY_LABEL[r.urgency] || r.urgency)}</span>
            <span class="flag-category">${esc(COMPONENT_LABEL[r.component] || r.component)}</span>
            <span class="flag-message">${esc(r.pathway)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No referral flags raised.</p>`
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

  const outcomeNote =
    overallOutcome === 'refer'
      ? `<p>This screen is a <strong>Refer</strong>: one or more key components require onward referral. Action every referral pathway below within its stated timeframe. A screening classification is not a diagnosis.</p>`
      : overallOutcome === 'incomplete'
      ? `<p>This screen is <strong>Incomplete</strong>: one or more applicable key components were not examined. Complete or re-attempt the outstanding component(s) to finish the screen.</p>`
      : `<p>This screen is <strong>Satisfactory</strong>: all applicable key components were examined and within normal limits. A satisfactory screen is not a guarantee of health; safety-net and re-examine at the 6-8 week review as scheduled.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>NIPE Screening Report</h2>
        <p class="muted">Baby: ${esc(state.identification.babyName || state.identification.babyIdentifier || 'Unidentified')} · Sex: ${esc(sexLabel(state.identification.sex) || 'Not recorded')} · Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${outcomeClass(overallOutcome)}">
        <div>
          <span class="risk-banner-label">Overall screening outcome</span>
          <span class="risk-banner-value">${esc(outcomeLabel(overallOutcome))}</span>
        </div>
        <span class="risk-badge ${outcomeClass(overallOutcome)}">Completeness ${completenessPercent}% · ${esc(completeness)}</span>
      </div>

      <h3>Key components</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Component</th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>${componentRows}</tbody>
      </table>

      <h3>Recommended action</h3>
      ${outcomeNote}

      <h3>Referral pathways (${referrals.length})</h3>
      ${referralsList}

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
  const grade = calculateNipeGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    eyesResult: grade.eyesResult,
    heartResult: grade.heartResult,
    hipsResult: grade.hipsResult,
    testesResult: grade.testesResult,
    overallOutcome: grade.overallOutcome,
    completeness: grade.completeness,
    completenessPercent: grade.completenessPercent,
    referrals: grade.referrals,
    firedRules: grade.firedRules,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh examination?')) return;
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
  { step: 2, section: 'identification', title: 'Baby' },
  { step: 3, section: 'riskFactors',    title: 'Risk factors' },
  { step: 4, section: 'eyes',           title: 'Eyes' },
  { step: 5, section: 'heart',          title: 'Heart' },
  { step: 6, section: 'hips',           title: 'Hips' },
  { step: 7, section: 'testes',         title: 'Testes' },
  { step: 8, section: 'systematic',     title: 'Head-to-toe' },
  { step: 9, section: 'summary',        title: 'Summary' }
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
    if (t === 0) {
      // Not applicable (e.g. testes for a girl) — mark finished, skip.
      li.dataset.status = 'finished';
      li.removeAttribute('aria-current');
    } else if (a === t) {
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
