import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateMRS, classifyHRTRisk } from './mrs-grader.js';
import { bmiCategory, calculateAge, calculateBMI, emptyAssessment, mrsScoreLabel, mrsSeverityClass, mrsSeverityLabel, riskClassificationClass, riskClassificationLabel } from './types.js';

// Hormone Replacement Therapy (HRT) Assessment - patient wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure MRS scoring engine plus the HRT risk-classifier, then
// renders an inline report. State is persisted to localStorage so a
// partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'hormone-replacement-therapy-assessment.front-end-form-with-html.v1';

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
  slug: 'hormone-replacement-therapy-assessment',
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
    refreshAutoCalculatedReadouts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
 *
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  recomputeDerived();
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
}

/** Recompute auto-calculated values that depend on other fields. */
function recomputeDerived() {
  state.demographics.bmi = calculateBMI(
    state.demographics.weight,
    state.demographics.height
  );
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

const TOTAL_STEPS = 10;

/** Map an <input type=…> to its Lily class name. */
function lilyInputClass(type) {
  switch (type) {
    case 'email':  return 'email-input';
    case 'number': return 'number-input';
    case 'date':   return 'date-input';
    case 'time':   return 'time-input';
    case 'tel':    return 'tel-input';
    case 'url':    return 'url-input';
    case 'search': return 'search-input';
    default:       return 'text-input';
  }
}

function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${lilyInputClass(type)}"`,
    `value="${esc(value ?? '')}"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')} aria-describedby="${id}-error">
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
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
    <label class="label" for="${id}">${esc(opts.label)}${opts.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      ${opts.required ? 'required data-required' : ''}
      aria-describedby="${id}-error"
      class="text-area-input">${esc(value)}</textarea>
    <span class="error-message" id="${id}-error"></span>
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
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) => {
      const selected =
        (opts.numeric ? Number(o.value) === current : o.value === current)
          ? ' selected' : '';
      return `<option value="${esc(o.value)}"${selected}>${esc(o.label)}</option>`;
    })
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}${opts.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
    <select id="${id}" name="${id}" class="select"${opts.required ? ' required data-required' : ''} aria-describedby="${id}-error">
      ${optionsHtml}
    </select>
    <span class="error-message" id="${id}-error"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => {
    let v = sel.value;
    if (opts.numeric) {
      v = v === '' ? null : Number(v);
    }
    setField(opts.section, opts.field, v);
    clearFieldError(id);
  });
  return wrapper;
}

function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.innerHTML = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    const requiredAttr = opts.required ? ' required data-required' : '';
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

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = `${groupId}-error`;
  wrapper.appendChild(errSpan);
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
    `<span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

/** Add a sub-heading inside a section. */
function subHeading(card, text) {
  const h = document.createElement('h3');
  h.className = 'section-subheader';
  h.textContent = text;
  card.appendChild(h);
}

/** Add a coloured advisory note inside a section. */
function note(card, text) {
  const p = document.createElement('p');
  p.className = 'section-note';
  p.textContent = text;
  card.appendChild(p);
}

// ----------------------------------------------------------------------
// Repeating-list editor: other medications
// ----------------------------------------------------------------------

/**
 * Editor for an array of {name, dose, frequency} medication rows.
 */
function medicationListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.currentMedications.otherMedications;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No other medications added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row med-row';
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Levothyroxine">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 50 mcg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. once daily">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove medication">&times;</button>
        </div>
      `;
      r.querySelectorAll('input').forEach((inp) => {
        inp.addEventListener('input', () => {
          const k = inp.dataset.key;
          rows[idx][k] = inp.value;
          saveState(state);
          updateProgress();
        });
      });
      r.querySelector('button').addEventListener('click', () => {
        rows.splice(idx, 1);
        saveState(state);
        rerender();
        updateProgress();
      });
      wrapper.appendChild(r);
    });
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'button';
    addBtn.setAttribute('data-variant', 'add');
    addBtn.textContent = '+ Add medication';
    addBtn.addEventListener('click', () => {
      rows.push({ name: '', dose: '', frequency: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const mrsScoreOptions = [
  { value: '0', label: '0 - None / no complaint' },
  { value: '1', label: '1 - Mild' },
  { value: '2', label: '2 - Moderate' },
  { value: '3', label: '3 - Severe' },
  { value: '4', label: '4 - Very severe' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic patient information.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'demographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Date of Birth',
    section: 'demographics',
    field: 'dateOfBirth',
    type: 'date',
    required: true
  }));
  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'demographics',
    field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  const measurements = document.createElement('div');
  measurements.className = 'three-col';
  measurements.appendChild(textInput({
    label: 'Weight', section: 'demographics', field: 'weight',
    type: 'number', min: 1, max: 400, unit: 'kg'
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'demographics', field: 'height',
    type: 'number', min: 50, max: 250, unit: 'cm'
  }));
  measurements.appendChild(readOnlyReadout({
    label: 'BMI',
    id: 'bmi-readout',
    render: () => {
      const bmi = state.demographics.bmi;
      if (bmi == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${bmi}</strong> <span class="muted">(${esc(bmiCategory(bmi))})</span>`;
    }
  }));
  card.appendChild(measurements);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Menopause Status',
    description: 'Current menopausal stage and history.'
  });

  card.appendChild(radioGroup({
    label: 'What is your current menopausal status?',
    section: 'menopauseStatus',
    field: 'menopausalStatus',
    options: [
      { value: 'pre', label: 'Pre-menopausal' },
      { value: 'peri', label: 'Peri-menopausal' },
      { value: 'post', label: 'Post-menopausal' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Date of last menstrual period',
    section: 'menopauseStatus',
    field: 'lastMenstrualPeriod',
    type: 'date'
  }));

  const ageHost = document.createElement('div');
  ageHost.dataset.conditional = 'menopauseStatus.menopausalStatus=post';
  ageHost.appendChild(textInput({
    label: 'Age at menopause',
    section: 'menopauseStatus',
    field: 'ageAtMenopause',
    type: 'number', min: 20, max: 65
  }));
  card.appendChild(ageHost);

  card.appendChild(radioGroup({
    label: 'Was menopause surgical (e.g. hysterectomy, bilateral oophorectomy)?',
    section: 'menopauseStatus',
    field: 'surgicalMenopause',
    options: yesNo
  }));
  const surgDetails = document.createElement('div');
  surgDetails.dataset.conditional = 'menopauseStatus.surgicalMenopause=yes';
  surgDetails.appendChild(textInput({
    label: 'Please provide details of the surgery',
    section: 'menopauseStatus',
    field: 'surgicalMenopauseDetails'
  }));
  card.appendChild(surgDetails);

  card.appendChild(radioGroup({
    label: 'Have you been diagnosed with premature ovarian insufficiency (POI)?',
    section: 'menopauseStatus',
    field: 'prematureOvarianInsufficiency',
    options: yesNo
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Menopause Rating Scale (MRS)',
    description:
      'Rate each symptom from 0 (none) to 4 (very severe). This standardised ' +
      'scale measures menopausal symptom burden across 11 items.'
  });

  note(card,
    'Which of the following symptoms apply to you at this time? ' +
    'Please select the appropriate rating for each.');

  subHeading(card, 'Somatic symptoms');
  card.appendChild(selectInput({
    label: '1. Hot flushes, sweating',
    section: 'mrsSymptomScale', field: 'hotFlushes',
    options: mrsScoreOptions, numeric: true
  }));
  card.appendChild(selectInput({
    label: '2. Heart discomfort (palpitations, tightness)',
    section: 'mrsSymptomScale', field: 'heartDiscomfort',
    options: mrsScoreOptions, numeric: true
  }));
  card.appendChild(selectInput({
    label: '3. Sleep problems (difficulty falling asleep, waking early)',
    section: 'mrsSymptomScale', field: 'sleepProblems',
    options: mrsScoreOptions, numeric: true
  }));
  card.appendChild(selectInput({
    label: '4. Joint and muscular discomfort',
    section: 'mrsSymptomScale', field: 'jointPain',
    options: mrsScoreOptions, numeric: true
  }));

  subHeading(card, 'Psychological symptoms');
  card.appendChild(selectInput({
    label: '5. Depressive mood (feeling down, sad, tearful)',
    section: 'mrsSymptomScale', field: 'depressiveMood',
    options: mrsScoreOptions, numeric: true
  }));
  card.appendChild(selectInput({
    label: '6. Irritability (nervousness, aggression)',
    section: 'mrsSymptomScale', field: 'irritability',
    options: mrsScoreOptions, numeric: true
  }));
  card.appendChild(selectInput({
    label: '7. Anxiety (inner restlessness, panic)',
    section: 'mrsSymptomScale', field: 'anxiety',
    options: mrsScoreOptions, numeric: true
  }));
  card.appendChild(selectInput({
    label: '8. Physical and mental exhaustion (fatigue)',
    section: 'mrsSymptomScale', field: 'fatigue',
    options: mrsScoreOptions, numeric: true
  }));

  subHeading(card, 'Urogenital symptoms');
  card.appendChild(selectInput({
    label: '9. Sexual problems (change in desire, activity, satisfaction)',
    section: 'mrsSymptomScale', field: 'sexualProblems',
    options: mrsScoreOptions, numeric: true
  }));
  card.appendChild(selectInput({
    label: '10. Bladder problems (difficulty urinating, increased need, incontinence)',
    section: 'mrsSymptomScale', field: 'bladderProblems',
    options: mrsScoreOptions, numeric: true
  }));
  card.appendChild(selectInput({
    label: '11. Dryness of vagina (sensation of dryness, burning, difficulty with intercourse)',
    section: 'mrsSymptomScale', field: 'vaginalDryness',
    options: mrsScoreOptions, numeric: true
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Vasomotor Symptoms',
    description: 'Detailed assessment of hot flushes and night sweats.'
  });

  card.appendChild(selectInput({
    label: 'How often do you experience hot flushes?',
    section: 'vasomotorSymptoms', field: 'hotFlushFrequency',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional (a few per week)' },
      { value: 'frequent', label: 'Frequent (daily)' },
      { value: 'very-frequent', label: 'Very frequent (multiple times daily)' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'How severe are your hot flushes?',
    section: 'vasomotorSymptoms', field: 'hotFlushSeverity',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild (warm sensation, no disruption)' },
      { value: 'moderate', label: 'Moderate (sweating, some disruption)' },
      { value: 'severe', label: 'Severe (drenching sweats, significant disruption)' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Do you experience night sweats?',
    section: 'vasomotorSymptoms', field: 'nightSweats',
    options: yesNo
  }));
  const nsHost = document.createElement('div');
  nsHost.dataset.conditional = 'vasomotorSymptoms.nightSweats=yes';
  nsHost.appendChild(selectInput({
    label: 'How often do night sweats occur?',
    section: 'vasomotorSymptoms', field: 'nightSweatsFrequency',
    options: [
      { value: 'occasional', label: 'Occasional (a few per week)' },
      { value: 'most-nights', label: 'Most nights' },
      { value: 'every-night', label: 'Every night' }
    ]
  }));
  card.appendChild(nsHost);

  card.appendChild(textArea({
    label: 'Do you notice any triggers for your symptoms?',
    section: 'vasomotorSymptoms', field: 'triggers',
    placeholder: 'e.g. stress, caffeine, alcohol, spicy food, warm environments…',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Bone Health',
    description: 'Assessment of bone density and fracture risk.'
  });

  card.appendChild(radioGroup({
    label: 'Have you had a DEXA (bone density) scan?',
    section: 'boneHealth', field: 'dexaScan',
    options: yesNo
  }));
  const dexaHost = document.createElement('div');
  dexaHost.dataset.conditional = 'boneHealth.dexaScan=yes';
  dexaHost.appendChild(selectInput({
    label: 'DEXA result',
    section: 'boneHealth', field: 'dexaResult',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'osteopenia', label: 'Osteopenia (reduced bone density)' },
      { value: 'osteoporosis', label: 'Osteoporosis' }
    ]
  }));
  dexaHost.appendChild(textInput({
    label: 'Date of DEXA scan',
    section: 'boneHealth', field: 'dexaDate',
    type: 'date'
  }));
  card.appendChild(dexaHost);

  card.appendChild(radioGroup({
    label: 'Have you had any fractures?',
    section: 'boneHealth', field: 'fractureHistory',
    options: yesNo
  }));
  const fxHost = document.createElement('div');
  fxHost.dataset.conditional = 'boneHealth.fractureHistory=yes';
  fxHost.appendChild(textInput({
    label: 'Please provide fracture details',
    section: 'boneHealth', field: 'fractureDetails',
    placeholder: 'e.g. wrist fracture 2020, vertebral compression 2023'
  }));
  card.appendChild(fxHost);

  card.appendChild(radioGroup({
    label: 'Have you noticed a loss of height?',
    section: 'boneHealth', field: 'heightLoss',
    options: yesNo
  }));
  const hlHost = document.createElement('div');
  hlHost.dataset.conditional = 'boneHealth.heightLoss=yes';
  hlHost.appendChild(textInput({
    label: 'Approximate height loss',
    section: 'boneHealth', field: 'heightLossCm',
    type: 'number', min: 0, max: 20, step: 0.5, unit: 'cm'
  }));
  card.appendChild(hlHost);

  card.appendChild(textArea({
    label: 'Other bone health risk factors',
    section: 'boneHealth', field: 'riskFactors',
    placeholder:
      'e.g. family history of osteoporosis, low body weight, ' +
      'corticosteroid use, early menopause…',
    rows: 3
  }));

  card.appendChild(selectInput({
    label: 'Calcium intake',
    section: 'boneHealth', field: 'calciumIntake',
    options: [
      { value: 'adequate', label: 'Adequate (dairy, green vegetables daily)' },
      { value: 'inadequate', label: 'Inadequate' },
      { value: 'supplemented', label: 'Taking calcium supplements' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Vitamin D intake',
    section: 'boneHealth', field: 'vitaminDIntake',
    options: [
      { value: 'adequate', label: 'Adequate (sunlight + diet)' },
      { value: 'inadequate', label: 'Inadequate' },
      { value: 'supplemented', label: 'Taking vitamin D supplements' }
    ]
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Cardiovascular Risk',
    description: 'Blood pressure, lipid profile, and cardiovascular risk factors.'
  });

  const bpGrid = document.createElement('div');
  bpGrid.className = 'two-col';
  bpGrid.appendChild(textInput({
    label: 'Systolic Blood Pressure',
    section: 'cardiovascularRisk', field: 'systolicBP',
    type: 'number', min: 60, max: 250, unit: 'mmHg'
  }));
  bpGrid.appendChild(textInput({
    label: 'Diastolic Blood Pressure',
    section: 'cardiovascularRisk', field: 'diastolicBP',
    type: 'number', min: 30, max: 150, unit: 'mmHg'
  }));
  card.appendChild(bpGrid);

  const lipid1 = document.createElement('div');
  lipid1.className = 'two-col';
  lipid1.appendChild(textInput({
    label: 'Total Cholesterol',
    section: 'cardiovascularRisk', field: 'totalCholesterol',
    type: 'number', min: 1, max: 15, step: 0.1, unit: 'mmol/L'
  }));
  lipid1.appendChild(textInput({
    label: 'HDL Cholesterol',
    section: 'cardiovascularRisk', field: 'hdlCholesterol',
    type: 'number', min: 0.1, max: 5, step: 0.1, unit: 'mmol/L'
  }));
  card.appendChild(lipid1);

  const lipid2 = document.createElement('div');
  lipid2.className = 'two-col';
  lipid2.appendChild(textInput({
    label: 'LDL Cholesterol',
    section: 'cardiovascularRisk', field: 'ldlCholesterol',
    type: 'number', min: 0.1, max: 10, step: 0.1, unit: 'mmol/L'
  }));
  lipid2.appendChild(textInput({
    label: 'Triglycerides',
    section: 'cardiovascularRisk', field: 'triglycerides',
    type: 'number', min: 0.1, max: 20, step: 0.1, unit: 'mmol/L'
  }));
  card.appendChild(lipid2);

  card.appendChild(radioGroup({
    label: 'Family history of cardiovascular disease?',
    section: 'cardiovascularRisk', field: 'familyHistoryCVD',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do you have diabetes?',
    section: 'cardiovascularRisk', field: 'diabetes',
    options: yesNo
  }));
  const dbHost = document.createElement('div');
  dbHost.dataset.conditional = 'cardiovascularRisk.diabetes=yes';
  dbHost.appendChild(selectInput({
    label: 'Type of diabetes',
    section: 'cardiovascularRisk', field: 'diabetesType',
    options: [
      { value: 'type1', label: 'Type 1' },
      { value: 'type2', label: 'Type 2' }
    ]
  }));
  card.appendChild(dbHost);

  card.appendChild(radioGroup({
    label: 'Smoking status',
    section: 'cardiovascularRisk', field: 'smoking',
    options: [
      { value: 'current', label: 'Current smoker' },
      { value: 'ex', label: 'Ex-smoker' },
      { value: 'never', label: 'Never smoked' }
    ]
  }));

  card.appendChild(textInput({
    label: 'QRISK score (if known)',
    section: 'cardiovascularRisk', field: 'qriskScore',
    type: 'number', min: 0, max: 100, step: 0.1, unit: '%'
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Breast Health',
    description: 'Mammogram history and breast cancer risk assessment.'
  });

  card.appendChild(textInput({
    label: 'Date of last mammogram',
    section: 'breastHealth', field: 'lastMammogram',
    type: 'date'
  }));

  card.appendChild(selectInput({
    label: 'Mammogram result',
    section: 'breastHealth', field: 'mammogramResult',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'abnormal', label: 'Abnormal (required follow-up)' },
      { value: 'not-done', label: 'Not done / Not applicable' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Is your most recent breast examination normal?',
    section: 'breastHealth', field: 'breastExamNormal',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do you have a family history of breast cancer?',
    section: 'breastHealth', field: 'familyHistoryBreastCancer',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do you have a family history of ovarian cancer?',
    section: 'breastHealth', field: 'familyHistoryOvarianCancer',
    options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'BRCA gene testing status',
    section: 'breastHealth', field: 'brcaStatus',
    options: [
      { value: 'positive', label: 'BRCA positive' },
      { value: 'negative', label: 'BRCA negative' },
      { value: 'not-tested', label: 'Not tested' }
    ]
  }));

  const brcaHost = document.createElement('div');
  brcaHost.dataset.conditional = 'breastHealth.brcaStatus=positive';
  brcaHost.appendChild(selectInput({
    label: 'BRCA type',
    section: 'breastHealth', field: 'brcaType',
    options: [
      { value: 'BRCA1', label: 'BRCA1' },
      { value: 'BRCA2', label: 'BRCA2' }
    ]
  }));
  card.appendChild(brcaHost);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Current Medications',
    description: 'HRT history and other current medications.'
  });

  card.appendChild(radioGroup({
    label: 'Are you currently taking HRT?',
    section: 'currentMedications', field: 'currentHRT',
    options: yesNo
  }));
  const curHost = document.createElement('div');
  curHost.dataset.conditional = 'currentMedications.currentHRT=yes';
  curHost.appendChild(textInput({
    label: 'Current HRT details (name, type, dose)',
    section: 'currentMedications', field: 'currentHRTDetails'
  }));
  curHost.appendChild(textInput({
    label: 'How long have you been on current HRT?',
    section: 'currentMedications', field: 'currentHRTDuration',
    placeholder: 'e.g. 6 months, 2 years'
  }));
  card.appendChild(curHost);

  card.appendChild(radioGroup({
    label: 'Have you previously taken HRT?',
    section: 'currentMedications', field: 'previousHRT',
    options: yesNo
  }));
  const prevHost = document.createElement('div');
  prevHost.dataset.conditional = 'currentMedications.previousHRT=yes';
  prevHost.appendChild(textInput({
    label: 'Previous HRT details',
    section: 'currentMedications', field: 'previousHRTDetails'
  }));
  prevHost.appendChild(textInput({
    label: 'Reason for stopping',
    section: 'currentMedications', field: 'previousHRTReason',
    placeholder: 'e.g. side effects, completed course, clinical advice'
  }));
  card.appendChild(prevHost);

  subHeading(card, 'Other medications');
  card.appendChild(medicationListEditor());

  card.appendChild(textArea({
    label: 'Supplements (vitamins, herbal remedies, etc.)',
    section: 'currentMedications', field: 'supplements',
    placeholder:
      'e.g. vitamin D, calcium, evening primrose oil, black cohosh…',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Contraindications Screen',
    description: 'Screening for conditions that may affect HRT prescribing.'
  });

  note(card,
    'Please answer the following questions carefully. Some conditions may ' +
    'mean that HRT is not suitable for you, or that a specific type of ' +
    'HRT may be preferred.');

  card.appendChild(radioGroup({
    label: 'Have you ever had a blood clot (deep vein thrombosis or pulmonary embolism)?',
    section: 'contraindicationsScreen', field: 'vteHistory',
    options: yesNo
  }));
  const vteHost = document.createElement('div');
  vteHost.dataset.conditional = 'contraindicationsScreen.vteHistory=yes';
  vteHost.appendChild(textInput({
    label: 'Please provide details',
    section: 'contraindicationsScreen', field: 'vteDetails',
    placeholder: 'e.g. DVT left leg 2019, provoked / unprovoked'
  }));
  card.appendChild(vteHost);

  card.appendChild(radioGroup({
    label: 'Have you ever been diagnosed with breast cancer?',
    section: 'contraindicationsScreen', field: 'breastCancerHistory',
    options: yesNo
  }));
  const bcHost = document.createElement('div');
  bcHost.dataset.conditional = 'contraindicationsScreen.breastCancerHistory=yes';
  bcHost.appendChild(textInput({
    label: 'Please provide details',
    section: 'contraindicationsScreen', field: 'breastCancerDetails',
    placeholder: 'e.g. ER+/PR+ breast cancer 2018, tamoxifen x 5 years'
  }));
  card.appendChild(bcHost);

  card.appendChild(radioGroup({
    label: 'Do you have active liver disease?',
    section: 'contraindicationsScreen', field: 'liverDisease',
    options: yesNo
  }));
  const liverHost = document.createElement('div');
  liverHost.dataset.conditional = 'contraindicationsScreen.liverDisease=yes';
  liverHost.appendChild(textInput({
    label: 'Please provide details',
    section: 'contraindicationsScreen', field: 'liverDiseaseDetails'
  }));
  card.appendChild(liverHost);

  card.appendChild(radioGroup({
    label: 'Do you have any undiagnosed vaginal bleeding?',
    section: 'contraindicationsScreen', field: 'undiagnosedVaginalBleeding',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Are you or could you be pregnant?',
    section: 'contraindicationsScreen', field: 'pregnancy',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do you have active cardiovascular disease (recent stroke, heart attack, or angina)?',
    section: 'contraindicationsScreen', field: 'activeCardiovascularDisease',
    options: yesNo
  }));
  const cvHost = document.createElement('div');
  cvHost.dataset.conditional = 'contraindicationsScreen.activeCardiovascularDisease=yes';
  cvHost.appendChild(textInput({
    label: 'Please provide details',
    section: 'contraindicationsScreen', field: 'activeCardiovascularDetails'
  }));
  card.appendChild(cvHost);

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Treatment Preferences',
    description: 'Your preferences and goals for HRT treatment.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have a preference for HRT route of administration?',
    section: 'treatmentPreferences', field: 'routePreference',
    options: [
      { value: 'oral', label: 'Oral (tablets)' },
      { value: 'transdermal', label: 'Transdermal (patches / gel)' },
      { value: 'vaginal', label: 'Vaginal (cream / pessary / ring)' }
    ]
  }));

  const reasonHost = document.createElement('div');
  reasonHost.dataset.conditionalAny =
    'treatmentPreferences.routePreference=oral,transdermal,vaginal';
  reasonHost.appendChild(textArea({
    label: 'Why do you prefer this route?',
    section: 'treatmentPreferences', field: 'routePreferenceReason',
    placeholder: 'e.g. convenience, previous experience, advice from GP…',
    rows: 3
  }));
  card.appendChild(reasonHost);

  card.appendChild(textArea({
    label: 'Do you have any concerns about HRT?',
    section: 'treatmentPreferences', field: 'concernsAboutHRT',
    placeholder: 'e.g. cancer risk, weight gain, side effects, long-term use…',
    rows: 3
  }));

  card.appendChild(textArea({
    label: 'Relevant lifestyle factors',
    section: 'treatmentPreferences', field: 'lifestyleFactors',
    placeholder: 'e.g. exercise frequency, diet, stress levels, work demands…',
    rows: 3
  }));

  card.appendChild(textArea({
    label: 'What are your main goals for treatment?',
    section: 'treatmentPreferences', field: 'treatmentGoals',
    placeholder:
      'e.g. reduce hot flushes, improve sleep, protect bone health, ' +
      'improve quality of life…',
    rows: 3
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections + auto-calculated readouts
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = state[section]?.[field];
    host.style.display = String(current) === target ? '' : 'none';
  });
  document.querySelectorAll('[data-conditional-any]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-any');
    const [path, targetCsv] = expr.split('=');
    const [section, field] = path.split('.');
    const current = String(state[section]?.[field] ?? '');
    const targets = targetCsv.split(',');
    host.style.display = current && targets.includes(current) ? '' : 'none';
  });
}

function refreshAutoCalculatedReadouts() {
  const bmi = document.getElementById('bmi-readout');
  if (bmi) {
    const v = state.demographics.bmi;
    bmi.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}</strong> <span class="muted">(${esc(bmiCategory(v))})</span>`;
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'weight'],
  ['demographics', 'height'],
  // Menopause status
  ['menopauseStatus', 'menopausalStatus'],
  ['menopauseStatus', 'surgicalMenopause'],
  ['menopauseStatus', 'prematureOvarianInsufficiency'],
  // MRS Symptom Scale (11 items)
  ['mrsSymptomScale', 'hotFlushes'],
  ['mrsSymptomScale', 'heartDiscomfort'],
  ['mrsSymptomScale', 'sleepProblems'],
  ['mrsSymptomScale', 'jointPain'],
  ['mrsSymptomScale', 'depressiveMood'],
  ['mrsSymptomScale', 'irritability'],
  ['mrsSymptomScale', 'anxiety'],
  ['mrsSymptomScale', 'fatigue'],
  ['mrsSymptomScale', 'sexualProblems'],
  ['mrsSymptomScale', 'bladderProblems'],
  ['mrsSymptomScale', 'vaginalDryness'],
  // Vasomotor symptoms
  ['vasomotorSymptoms', 'hotFlushFrequency'],
  ['vasomotorSymptoms', 'hotFlushSeverity'],
  ['vasomotorSymptoms', 'nightSweats'],
  // Bone health
  ['boneHealth', 'dexaScan'],
  ['boneHealth', 'fractureHistory'],
  ['boneHealth', 'heightLoss'],
  ['boneHealth', 'calciumIntake'],
  ['boneHealth', 'vitaminDIntake'],
  // Cardiovascular risk
  ['cardiovascularRisk', 'familyHistoryCVD'],
  ['cardiovascularRisk', 'diabetes'],
  ['cardiovascularRisk', 'smoking'],
  // Breast health
  ['breastHealth', 'mammogramResult'],
  ['breastHealth', 'breastExamNormal'],
  ['breastHealth', 'familyHistoryBreastCancer'],
  ['breastHealth', 'familyHistoryOvarianCancer'],
  ['breastHealth', 'brcaStatus'],
  // Current medications
  ['currentMedications', 'currentHRT'],
  ['currentMedications', 'previousHRT'],
  // Contraindications
  ['contraindicationsScreen', 'vteHistory'],
  ['contraindicationsScreen', 'breastCancerHistory'],
  ['contraindicationsScreen', 'liverDisease'],
  ['contraindicationsScreen', 'undiagnosedVaginalBleeding'],
  ['contraindicationsScreen', 'pregnancy'],
  ['contraindicationsScreen', 'activeCardiovascularDisease'],
  // Treatment preferences
  ['treatmentPreferences', 'routePreference']
];

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    const v = state[section][field];
    if (v !== null && v !== undefined && v !== '') {
      answered++;
      sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
    }
  }
  const total = TRACKED_FIELDS.length;
  const percent = Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics',              title: 'Demographics' },
  { step: 2,  section: 'menopauseStatus',           title: 'Menopause Status' },
  { step: 3,  section: 'mrsSymptomScale',           title: 'MRS Scale' },
  { step: 4,  section: 'vasomotorSymptoms',         title: 'Vasomotor' },
  { step: 5,  section: 'boneHealth',                title: 'Bone Health' },
  { step: 6,  section: 'cardiovascularRisk',        title: 'Cardiovascular' },
  { step: 7,  section: 'breastHealth',              title: 'Breast Health' },
  { step: 8,  section: 'currentMedications',        title: 'Medications' },
  { step: 9,  section: 'contraindicationsScreen',   title: 'Contraindications' },
  { step: 10, section: 'treatmentPreferences',      title: 'Treatment Preferences' }
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
  const required = form.querySelectorAll('[data-required]');
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
// Submit / Report
// ----------------------------------------------------------------------

function priorityClass(priority) {
  switch (priority) {
    case 'high':   return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low':    return 'flag-low';
    default:       return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { mrsResult, riskClassification, firedRules, additionalFlags, timestamp } = lastResult;
  const { totalScore, severity, subscales } = mrsResult;

  const severityCss = mrsSeverityClass(severity);
  const riskCss = riskClassificationClass(riskClassification);

  const flagsList = additionalFlags.length === 0
    ? `<p class="muted">No additional flags raised.</p>`
    : `
      <ul class="flags">
        ${additionalFlags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.message)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const firedRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.system)}</td>
      <td>${esc(r.description)}</td>
      <td class="num">${r.score} / 4</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No MRS items scored above zero.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Subscale</th>
            <th scope="col">Item</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const subscalesTable = `
    <table class="subscales">
      <thead>
        <tr>
          <th scope="col">Subscale</th>
          <th scope="col">Score</th>
          <th scope="col">Range</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Somatic</th>
          <td class="num">${subscales.somatic}</td>
          <td>0-16</td>
        </tr>
        <tr>
          <th scope="row">Psychological</th>
          <td class="num">${subscales.psychological}</td>
          <td>0-16</td>
        </tr>
        <tr>
          <th scope="row">Urogenital</th>
          <td class="num">${subscales.urogenital}</td>
          <td>0-12</td>
        </tr>
      </tbody>
    </table>
  `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Hormone Replacement Therapy Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>MRS Total Score</h3>
      <p class="score-summary">
        <span class="score-badge ${severityCss}">${totalScore} / 44</span>
        <span class="score-label">${esc(mrsSeverityLabel(severity))}</span>
      </p>

      <h3>HRT Risk-Benefit Classification</h3>
      <p class="score-summary">
        <span class="score-badge ${riskCss}">${esc(riskClassification)}</span>
        <span class="score-label">${esc(riskClassificationLabel(riskClassification))}</span>
      </p>

      <h3>Subscale Breakdown</h3>
      ${subscalesTable}

      <h3>MRS Items Scored Above Zero</h3>
      ${firedTable}

      <h3>Flagged Issues</h3>
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
  const errs = validateForm();
  if (errs.length > 0) return;
  recomputeDerived();
  const { mrsResult, firedRules } = calculateMRS(state);
  const riskClassification = classifyHRTRisk(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    mrsResult,
    riskClassification,
    firedRules,
    additionalFlags,
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
  refreshAutoCalculatedReadouts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
  recomputeDerived();
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
