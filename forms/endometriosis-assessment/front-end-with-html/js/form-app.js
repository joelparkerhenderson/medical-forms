import { calculateEndoGrade } from './endo-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { asrmStageLabel, asrmStageShort, bmiCategory, calculateBMI, ehp30Label, emptyAssessment, endoGradeLabel, severityClass, severityLabel } from './types.js';

// Endometriosis Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure scoring engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'endometriosis-assessment.front-end-form-with-html.v1';

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
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

let state = loadState();
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'endometriosis-assessment',
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

function setField(section, field, value) {
  state[section][field] = value;
  recomputeDerived();
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
}

function recomputeDerived() {
  state.demographics.bmi = calculateBMI(
    state.demographics.weight,
    state.demographics.height
  );
}

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
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
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
  const current = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}${opts.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
    <select id="${id}" name="${id}" class="select"${opts.required ? ' required data-required' : ''} aria-describedby="${id}-error">
      ${optionsHtml}
    </select>
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
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
  if (opts.hint) {
    const hint = document.createElement('span');
    hint.className = 'hint';
    hint.textContent = opts.hint;
    wrapper.appendChild(hint);
  }

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
    `<span class="section-step">Section ${opts.stepNumber} of 10</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Common option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const noneToSevere = [
  { value: 'none', label: 'None' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per step, 10 total)
// ----------------------------------------------------------------------

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
    label: 'Date of Birth', section: 'demographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'demographics', field: 'sex',
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
    title: 'Menstrual History',
    description: 'Information about your menstrual cycles and bleeding patterns.'
  });

  const ageRow = document.createElement('div');
  ageRow.className = 'two-col';
  ageRow.appendChild(textInput({
    label: 'Age at first period (menarche)',
    section: 'menstrualHistory', field: 'ageAtMenarche',
    type: 'number', min: 6, max: 25, unit: 'years'
  }));
  ageRow.appendChild(selectInput({
    label: 'Cycle regularity',
    section: 'menstrualHistory', field: 'cycleRegularity',
    options: [
      { value: 'regular', label: 'Regular' },
      { value: 'irregular', label: 'Irregular' },
      { value: 'absent', label: 'Absent (no periods)' }
    ]
  }));
  card.appendChild(ageRow);

  const cycleRow = document.createElement('div');
  cycleRow.className = 'two-col';
  cycleRow.appendChild(textInput({
    label: 'Average cycle length',
    section: 'menstrualHistory', field: 'cycleLengthDays',
    type: 'number', min: 14, max: 90, unit: 'days'
  }));
  cycleRow.appendChild(textInput({
    label: 'Period duration',
    section: 'menstrualHistory', field: 'periodDurationDays',
    type: 'number', min: 0, max: 30, unit: 'days'
  }));
  card.appendChild(cycleRow);

  card.appendChild(selectInput({
    label: 'Flow heaviness',
    section: 'menstrualHistory', field: 'flowHeaviness',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'heavy', label: 'Heavy' },
      { value: 'very-heavy', label: 'Very heavy (flooding, large clots)' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Do you pass blood clots during your period?',
    section: 'menstrualHistory', field: 'clotsPresent', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you bleed between periods (intermenstrual bleeding)?',
    section: 'menstrualHistory', field: 'intermenstrualBleeding', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you bleed after sex (postcoital bleeding)?',
    section: 'menstrualHistory', field: 'postcoitalBleeding', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Severity of period pain (dysmenorrhoea)',
    section: 'menstrualHistory', field: 'dysmenorrhoeaSeverity',
    options: noneToSevere
  }));

  card.appendChild(textInput({
    label: 'Days off work or school per cycle due to symptoms',
    section: 'menstrualHistory', field: 'daysOffWorkPerCycle',
    type: 'number', min: 0, max: 30, unit: 'days'
  }));

  card.appendChild(selectInput({
    label: 'Current contraception',
    section: 'menstrualHistory', field: 'currentContraception',
    options: [
      { value: 'none', label: 'None' },
      { value: 'combined-pill', label: 'Combined pill' },
      { value: 'progesterone-only-pill', label: 'Progesterone-only pill' },
      { value: 'mirena-ius', label: 'Mirena IUS' },
      { value: 'implant', label: 'Implant' },
      { value: 'injection', label: 'Injection (e.g. Depo)' },
      { value: 'copper-iud', label: 'Copper IUD' },
      { value: 'condoms', label: 'Condoms' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Menstrual notes',
    section: 'menstrualHistory', field: 'menstrualNotes',
    placeholder: 'Anything else about your periods…',
    rows: 3
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Pain Assessment',
    description: 'Pelvic and related pain — please answer for the past 3 months.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have pelvic pain?',
    section: 'painAssessment', field: 'hasPelvicPain', options: yesNo
  }));

  const painDetails = document.createElement('div');
  painDetails.dataset.conditional = 'painAssessment.hasPelvicPain=yes';

  painDetails.appendChild(textInput({
    label: 'Pelvic pain severity (0 = no pain, 10 = worst pain imaginable)',
    section: 'painAssessment', field: 'pelvicPainSeverity',
    type: 'number', min: 0, max: 10
  }));

  painDetails.appendChild(selectInput({
    label: 'Pelvic pain character',
    section: 'painAssessment', field: 'pelvicPainCharacter',
    options: [
      { value: 'cramping', label: 'Cramping' },
      { value: 'stabbing', label: 'Stabbing' },
      { value: 'burning', label: 'Burning' },
      { value: 'aching', label: 'Aching' },
      { value: 'dragging', label: 'Dragging / heavy' },
      { value: 'shooting', label: 'Shooting' },
      { value: 'other', label: 'Other' }
    ]
  }));

  painDetails.appendChild(selectInput({
    label: 'Pelvic pain location',
    section: 'painAssessment', field: 'pelvicPainLocation',
    options: [
      { value: 'central', label: 'Central / lower abdomen' },
      { value: 'left-sided', label: 'Left-sided' },
      { value: 'right-sided', label: 'Right-sided' },
      { value: 'bilateral', label: 'Bilateral (both sides)' },
      { value: 'diffuse', label: 'Diffuse' },
      { value: 'other', label: 'Other' }
    ]
  }));

  painDetails.appendChild(radioGroup({
    label: 'Pelvic pain timing',
    section: 'painAssessment', field: 'pelvicPainTiming',
    options: [
      { value: 'menstrual', label: 'During periods only' },
      { value: 'premenstrual', label: 'Before periods' },
      { value: 'ovulatory', label: 'At ovulation (mid-cycle)' },
      { value: 'constant', label: 'Constant (all the time)' },
      { value: 'intermittent', label: 'Intermittent (random)' }
    ]
  }));

  card.appendChild(painDetails);

  card.appendChild(selectInput({
    label: 'Pain during sexual intercourse (dyspareunia)',
    section: 'painAssessment', field: 'dyspareunia',
    options: [
      { value: 'none', label: 'None' },
      { value: 'superficial', label: 'Superficial (at entry)' },
      { value: 'deep', label: 'Deep (with thrusting)' },
      { value: 'both', label: 'Both superficial and deep' }
    ]
  }));

  const dysSev = document.createElement('div');
  dysSev.dataset.conditionalAny = 'painAssessment.dyspareunia=superficial,deep,both';
  dysSev.appendChild(textInput({
    label: 'Dyspareunia severity (0-10)',
    section: 'painAssessment', field: 'dyspareuniaSeverity',
    type: 'number', min: 0, max: 10
  }));
  card.appendChild(dysSev);

  card.appendChild(radioGroup({
    label: 'Pain when opening bowels (dyschezia)?',
    section: 'painAssessment', field: 'dyschezia', options: yesNo
  }));
  const dyscheziaCyc = document.createElement('div');
  dyscheziaCyc.dataset.conditional = 'painAssessment.dyschezia=yes';
  dyscheziaCyc.appendChild(radioGroup({
    label: 'Is bowel pain worse during your period (cyclical)?',
    section: 'painAssessment', field: 'dyscheziaCyclical', options: yesNo
  }));
  card.appendChild(dyscheziaCyc);

  card.appendChild(radioGroup({
    label: 'Do you have back pain associated with periods or pelvic pain?',
    section: 'painAssessment', field: 'backPain', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have leg pain (e.g. shooting down a leg) associated with periods?',
    section: 'painAssessment', field: 'legPain', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Is the pain worse with physical activity?',
    section: 'painAssessment', field: 'painWorseWithActivity', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Pain notes',
    section: 'painAssessment', field: 'painNotes',
    placeholder: 'Anything else about your pain…',
    rows: 3
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Gastrointestinal Symptoms',
    description: 'Bowel-related symptoms.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have any gastrointestinal symptoms?',
    section: 'gastrointestinalSymptoms', field: 'hasGiSymptoms', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do you experience bloating?',
    section: 'gastrointestinalSymptoms', field: 'bloating', options: yesNo
  }));
  const bloatCyc = document.createElement('div');
  bloatCyc.dataset.conditional = 'gastrointestinalSymptoms.bloating=yes';
  bloatCyc.appendChild(radioGroup({
    label: 'Is bloating cyclical (worse around periods)?',
    section: 'gastrointestinalSymptoms', field: 'bloatingCyclical', options: yesNo
  }));
  card.appendChild(bloatCyc);

  card.appendChild(radioGroup({
    label: 'Do you experience nausea (with or around periods)?',
    section: 'gastrointestinalSymptoms', field: 'nausea', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have constipation?',
    section: 'gastrointestinalSymptoms', field: 'constipation', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have diarrhoea?',
    section: 'gastrointestinalSymptoms', field: 'diarrhoea', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have alternating bowel habit (constipation alternating with diarrhoea)?',
    section: 'gastrointestinalSymptoms', field: 'alternatingBowelHabit', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Have you had rectal bleeding?',
    section: 'gastrointestinalSymptoms', field: 'rectalBleeding', options: yesNo
  }));
  const rbCyc = document.createElement('div');
  rbCyc.dataset.conditional = 'gastrointestinalSymptoms.rectalBleeding=yes';
  rbCyc.appendChild(radioGroup({
    label: 'Is rectal bleeding cyclical (linked to your periods)?',
    section: 'gastrointestinalSymptoms', field: 'rectalBleedingCyclical', options: yesNo
  }));
  card.appendChild(rbCyc);

  card.appendChild(radioGroup({
    label: 'Do you have symptoms of bowel obstruction (severe abdominal pain with vomiting and inability to pass stool or wind)?',
    section: 'gastrointestinalSymptoms', field: 'bowelObstructionSymptoms', options: yesNo,
    hint: 'If yes, urgent surgical assessment is recommended.'
  }));

  card.appendChild(textArea({
    label: 'GI notes',
    section: 'gastrointestinalSymptoms', field: 'giNotes',
    placeholder: 'Anything else about your bowel symptoms…',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Urinary Symptoms',
    description: 'Bladder and urinary tract symptoms.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have any urinary symptoms?',
    section: 'urinarySymptoms', field: 'hasUrinarySymptoms', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do you pass urine more often than usual (frequency)?',
    section: 'urinarySymptoms', field: 'frequency', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have a sudden urgent need to pass urine (urgency)?',
    section: 'urinarySymptoms', field: 'urgency', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have pain on passing urine (dysuria)?',
    section: 'urinarySymptoms', field: 'dysuria', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Have you seen blood in your urine (haematuria)?',
    section: 'urinarySymptoms', field: 'haematuria', options: yesNo
  }));
  const hCyc = document.createElement('div');
  hCyc.dataset.conditional = 'urinarySymptoms.haematuria=yes';
  hCyc.appendChild(radioGroup({
    label: 'Is the blood in urine cyclical (linked to periods)?',
    section: 'urinarySymptoms', field: 'haematuriaCyclical', options: yesNo
  }));
  card.appendChild(hCyc);

  card.appendChild(radioGroup({
    label: 'Do you have flank pain (pain in your side or back near the kidneys)?',
    section: 'urinarySymptoms', field: 'flankPain', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do you have symptoms of urinary obstruction (inability to pass urine, severe back pain)?',
    section: 'urinarySymptoms', field: 'urinaryObstructionSymptoms', options: yesNo,
    hint: 'If yes, urgent urology / gynaecology review is recommended.'
  }));

  card.appendChild(radioGroup({
    label: 'Do you have recurrent urinary tract infections (UTIs)?',
    section: 'urinarySymptoms', field: 'recurrentUtis', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Urinary notes',
    section: 'urinarySymptoms', field: 'urinaryNotes',
    placeholder: 'Anything else about your bladder symptoms…',
    rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Fertility Assessment',
    description: 'Pregnancy history and fertility-related concerns.'
  });

  card.appendChild(radioGroup({
    label: 'Are you currently trying to conceive?',
    section: 'fertilityAssessment', field: 'tryingToConceive', options: yesNo
  }));

  const ttcDetails = document.createElement('div');
  ttcDetails.dataset.conditional = 'fertilityAssessment.tryingToConceive=yes';
  ttcDetails.appendChild(textInput({
    label: 'How many months have you been trying?',
    section: 'fertilityAssessment', field: 'durationTryingMonths',
    type: 'number', min: 0, max: 600, unit: 'months'
  }));
  card.appendChild(ttcDetails);

  const pregGrid = document.createElement('div');
  pregGrid.className = 'two-col';
  pregGrid.appendChild(textInput({
    label: 'Total previous pregnancies',
    section: 'fertilityAssessment', field: 'previousPregnancies',
    type: 'number', min: 0, max: 30
  }));
  pregGrid.appendChild(textInput({
    label: 'Live births',
    section: 'fertilityAssessment', field: 'liveBirths',
    type: 'number', min: 0, max: 30
  }));
  pregGrid.appendChild(textInput({
    label: 'Miscarriages',
    section: 'fertilityAssessment', field: 'miscarriages',
    type: 'number', min: 0, max: 30
  }));
  pregGrid.appendChild(textInput({
    label: 'Ectopic pregnancies',
    section: 'fertilityAssessment', field: 'ectopicPregnancies',
    type: 'number', min: 0, max: 30
  }));
  card.appendChild(pregGrid);

  card.appendChild(radioGroup({
    label: 'Have you had previous fertility treatment (IUI, IVF, etc.)?',
    section: 'fertilityAssessment', field: 'previousFertilityTreatment', options: yesNo
  }));
  const ftDetails = document.createElement('div');
  ftDetails.dataset.conditional = 'fertilityAssessment.previousFertilityTreatment=yes';
  ftDetails.appendChild(textArea({
    label: 'Fertility treatment details',
    section: 'fertilityAssessment', field: 'fertilityTreatmentDetails',
    placeholder: 'e.g. 2 cycles of IVF in 2022, 1 successful…',
    rows: 3
  }));
  card.appendChild(ftDetails);

  card.appendChild(textInput({
    label: 'Most recent AMH (anti-Müllerian hormone) level, if known',
    section: 'fertilityAssessment', field: 'amhLevel',
    type: 'number', min: 0, max: 200, step: 0.1, unit: 'pmol/L'
  }));

  card.appendChild(selectInput({
    label: 'Partner semen analysis',
    section: 'fertilityAssessment', field: 'partnerSemenAnalysis',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'abnormal', label: 'Abnormal' },
      { value: 'not-done', label: 'Not done' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Do you have concerns about your future fertility?',
    section: 'fertilityAssessment', field: 'futureFertilityConcerns', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Fertility notes',
    section: 'fertilityAssessment', field: 'fertilityNotes',
    placeholder: 'Anything else about your fertility…',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Previous Treatments',
    description: 'Medications and therapies you have tried for your symptoms.'
  });

  card.appendChild(radioGroup({
    label: 'Have you tried NSAIDs (e.g. ibuprofen, mefenamic acid, naproxen)?',
    section: 'previousTreatments', field: 'nsaidsTried', options: yesNo
  }));
  const nsaidEff = document.createElement('div');
  nsaidEff.dataset.conditional = 'previousTreatments.nsaidsTried=yes';
  nsaidEff.appendChild(radioGroup({
    label: 'Were NSAIDs effective?',
    section: 'previousTreatments', field: 'nsaidsEffective',
    options: [
      { value: 'effective', label: 'Effective' },
      { value: 'partially', label: 'Partially effective' },
      { value: 'ineffective', label: 'Ineffective' }
    ]
  }));
  card.appendChild(nsaidEff);

  card.appendChild(radioGroup({
    label: 'Have you tried paracetamol?',
    section: 'previousTreatments', field: 'paracetamolTried', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Have you ever tried opioid pain medications?',
    section: 'previousTreatments', field: 'opioidsTried', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Are you currently taking opioids for pain?',
    section: 'previousTreatments', field: 'opioidsCurrent', options: yesNo,
    hint: 'If yes, opioid review is recommended.'
  }));

  card.appendChild(radioGroup({
    label: 'Have you tried the combined oral contraceptive pill (COCP) for symptom control?',
    section: 'previousTreatments', field: 'combinedPillTried', options: yesNo
  }));
  const cocpEff = document.createElement('div');
  cocpEff.dataset.conditional = 'previousTreatments.combinedPillTried=yes';
  cocpEff.appendChild(radioGroup({
    label: 'Was the combined pill effective for symptoms?',
    section: 'previousTreatments', field: 'combinedPillEffective',
    options: [
      { value: 'effective', label: 'Effective' },
      { value: 'partially', label: 'Partially effective' },
      { value: 'ineffective', label: 'Ineffective' }
    ]
  }));
  card.appendChild(cocpEff);

  card.appendChild(radioGroup({
    label: 'Have you tried progesterone-based treatments?',
    section: 'previousTreatments', field: 'progesteroneTried', options: yesNo
  }));
  const progDetails = document.createElement('div');
  progDetails.dataset.conditional = 'previousTreatments.progesteroneTried=yes';
  progDetails.appendChild(textInput({
    label: 'Which progesterone treatments?',
    section: 'previousTreatments', field: 'progesteroneType',
    placeholder: 'e.g. Norethisterone, dienogest, depot'
  }));
  card.appendChild(progDetails);

  card.appendChild(radioGroup({
    label: 'Have you tried a GnRH agonist (e.g. Zoladex, Prostap, leuprorelin)?',
    section: 'previousTreatments', field: 'gnrhAgonistTried', options: yesNo
  }));
  const gnrhDur = document.createElement('div');
  gnrhDur.dataset.conditional = 'previousTreatments.gnrhAgonistTried=yes';
  gnrhDur.appendChild(textInput({
    label: 'GnRH agonist duration',
    section: 'previousTreatments', field: 'gnrhAgonistDurationMonths',
    type: 'number', min: 0, max: 120, unit: 'months'
  }));
  card.appendChild(gnrhDur);

  card.appendChild(radioGroup({
    label: 'Have you tried the Mirena IUS (intrauterine system)?',
    section: 'previousTreatments', field: 'mirenaIusTried', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Other treatments tried',
    section: 'previousTreatments', field: 'otherTreatments',
    placeholder: 'e.g. acupuncture, pelvic physiotherapy, dietary changes…',
    rows: 3
  }));

  card.appendChild(textArea({
    label: 'Treatment notes',
    section: 'previousTreatments', field: 'treatmentNotes',
    placeholder: 'Anything else about previous treatments…',
    rows: 3
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Surgical History',
    description: 'Previous pelvic and endometriosis-related surgery.'
  });

  card.appendChild(radioGroup({
    label: 'Have you had a previous laparoscopy (keyhole pelvic surgery)?',
    section: 'surgicalHistory', field: 'previousLaparoscopy', options: yesNo
  }));

  const lapDetails = document.createElement('div');
  lapDetails.dataset.conditional = 'surgicalHistory.previousLaparoscopy=yes';

  const lapGrid = document.createElement('div');
  lapGrid.className = 'two-col';
  lapGrid.appendChild(textInput({
    label: 'Number of laparoscopies',
    section: 'surgicalHistory', field: 'numberOfLaparoscopies',
    type: 'number', min: 0, max: 30
  }));
  lapGrid.appendChild(textInput({
    label: 'Date of most recent laparoscopy',
    section: 'surgicalHistory', field: 'mostRecentLaparoscopyDate',
    type: 'date'
  }));
  lapDetails.appendChild(lapGrid);

  lapDetails.appendChild(radioGroup({
    label: 'Was endometriosis confirmed visually at surgery?',
    section: 'surgicalHistory', field: 'endometriosisConfirmedSurgically', options: yesNo
  }));
  lapDetails.appendChild(radioGroup({
    label: 'Was endometriosis confirmed on biopsy/histology?',
    section: 'surgicalHistory', field: 'histologicalConfirmation', options: yesNo
  }));

  lapDetails.appendChild(selectInput({
    label: 'ASRM stage documented at surgery (if known)',
    section: 'surgicalHistory', field: 'asrmStageAtSurgery',
    options: [
      { value: 'I', label: 'Stage I — Minimal' },
      { value: 'II', label: 'Stage II — Mild' },
      { value: 'III', label: 'Stage III — Moderate' },
      { value: 'IV', label: 'Stage IV — Severe' }
    ]
  }));

  lapDetails.appendChild(textArea({
    label: 'Sites where endometriosis was found',
    section: 'surgicalHistory', field: 'sitesFound',
    placeholder: 'e.g. ovaries, pouch of Douglas, uterosacral ligaments, bowel…',
    rows: 3
  }));

  lapDetails.appendChild(radioGroup({
    label: 'Was excision (cutting out) of endometriosis performed?',
    section: 'surgicalHistory', field: 'excisionPerformed', options: yesNo
  }));
  lapDetails.appendChild(radioGroup({
    label: 'Was ablation (burning) of endometriosis performed?',
    section: 'surgicalHistory', field: 'ablationPerformed', options: yesNo
  }));
  lapDetails.appendChild(radioGroup({
    label: 'Was adhesiolysis (division of adhesions) performed?',
    section: 'surgicalHistory', field: 'adhesiolysisPerformed', options: yesNo
  }));
  lapDetails.appendChild(radioGroup({
    label: 'Was an endometrioma (chocolate cyst) drained or removed?',
    section: 'surgicalHistory', field: 'endometriomaDrained', options: yesNo
  }));
  lapDetails.appendChild(radioGroup({
    label: 'Have you had bowel surgery for endometriosis?',
    section: 'surgicalHistory', field: 'bowelSurgery', options: yesNo
  }));
  lapDetails.appendChild(radioGroup({
    label: 'Have you had bladder surgery for endometriosis?',
    section: 'surgicalHistory', field: 'bladderSurgery', options: yesNo
  }));

  card.appendChild(lapDetails);

  card.appendChild(textArea({
    label: 'Other pelvic surgery (e.g. ovarian cystectomy, hysterectomy)',
    section: 'surgicalHistory', field: 'otherPelvicSurgery',
    placeholder: 'List any other pelvic surgery…',
    rows: 3
  }));

  card.appendChild(textArea({
    label: 'Surgical complications, if any',
    section: 'surgicalHistory', field: 'surgicalComplications',
    placeholder: 'e.g. bleeding, infection, conversion to open surgery…',
    rows: 3
  }));

  card.appendChild(textArea({
    label: 'Surgical notes',
    section: 'surgicalHistory', field: 'surgicalNotes',
    placeholder: 'Anything else about your surgical history…',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Quality of Life Impact',
    description: 'EHP-30 (Endometriosis Health Profile) domain scores: 0 = no problem, 100 = worst possible problem.'
  });

  card.appendChild(textInput({
    label: 'Pain domain (0-100)',
    section: 'qualityOfLife', field: 'painDomainScore',
    type: 'number', min: 0, max: 100,
    hint: 'How much pain has affected your life over the past 4 weeks.'
  }));
  card.appendChild(textInput({
    label: 'Control & powerlessness domain (0-100)',
    section: 'qualityOfLife', field: 'controlPowerlessnessScore',
    type: 'number', min: 0, max: 100,
    hint: 'Sense of control over your symptoms.'
  }));
  card.appendChild(textInput({
    label: 'Emotional well-being domain (0-100)',
    section: 'qualityOfLife', field: 'emotionalWellbeingScore',
    type: 'number', min: 0, max: 100
  }));
  card.appendChild(textInput({
    label: 'Social support domain (0-100)',
    section: 'qualityOfLife', field: 'socialSupportScore',
    type: 'number', min: 0, max: 100
  }));
  card.appendChild(textInput({
    label: 'Self-image domain (0-100)',
    section: 'qualityOfLife', field: 'selfImageScore',
    type: 'number', min: 0, max: 100
  }));

  card.appendChild(selectInput({
    label: 'Impact on work',
    section: 'qualityOfLife', field: 'workImpact',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' },
      { value: 'unable-to-work', label: 'Unable to work' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Impact on relationships',
    section: 'qualityOfLife', field: 'relationshipImpact',
    options: noneToSevere
  }));
  card.appendChild(selectInput({
    label: 'Impact on sleep',
    section: 'qualityOfLife', field: 'sleepImpact',
    options: noneToSevere
  }));
  card.appendChild(selectInput({
    label: 'Impact on mental health',
    section: 'qualityOfLife', field: 'mentalHealthImpact',
    options: noneToSevere
  }));
  card.appendChild(selectInput({
    label: 'Impact on exercise / physical activity',
    section: 'qualityOfLife', field: 'exerciseImpact',
    options: noneToSevere
  }));

  card.appendChild(textArea({
    label: 'Quality-of-life notes',
    section: 'qualityOfLife', field: 'qolNotes',
    placeholder: 'Anything else about how endometriosis affects your daily life…',
    rows: 3
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Treatment Planning',
    description: 'Your goals and preferences for management going forward.'
  });

  card.appendChild(textArea({
    label: 'What are your goals for treatment?',
    section: 'treatmentPlanning', field: 'treatmentGoals',
    placeholder: 'e.g. pain relief, fertility, avoiding surgery…',
    rows: 3
  }));

  card.appendChild(selectInput({
    label: 'Preferred approach',
    section: 'treatmentPlanning', field: 'preferredApproach',
    options: [
      { value: 'conservative', label: 'Conservative (lifestyle, pain relief)' },
      { value: 'medical', label: 'Medical (hormonal therapy)' },
      { value: 'surgical', label: 'Surgical' },
      { value: 'combined', label: 'Combined (medical + surgical)' },
      { value: 'fertility-focused', label: 'Fertility-focused' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Are you considering surgery?',
    section: 'treatmentPlanning', field: 'surgeryConsidered', options: yesNo
  }));
  const surgType = document.createElement('div');
  surgType.dataset.conditional = 'treatmentPlanning.surgeryConsidered=yes';
  surgType.appendChild(selectInput({
    label: 'Type of surgery being considered',
    section: 'treatmentPlanning', field: 'surgeryTypeConsidered',
    options: [
      { value: 'diagnostic-laparoscopy', label: 'Diagnostic laparoscopy' },
      { value: 'excision', label: 'Excision of endometriosis' },
      { value: 'ablation', label: 'Ablation of endometriosis' },
      { value: 'hysterectomy', label: 'Hysterectomy' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(surgType);

  card.appendChild(radioGroup({
    label: 'Is fertility preservation (e.g. egg freezing) needed?',
    section: 'treatmentPlanning', field: 'fertilityPreservationNeeded', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'MDT (multidisciplinary team) review needed?',
    section: 'treatmentPlanning', field: 'mdtReferralNeeded', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Pain management referral?',
    section: 'treatmentPlanning', field: 'painManagementReferral', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Psychology / counselling referral?',
    section: 'treatmentPlanning', field: 'psychologyReferral', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Pelvic physiotherapy referral?',
    section: 'treatmentPlanning', field: 'physiotherapyReferral', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Fertility clinic referral?',
    section: 'treatmentPlanning', field: 'fertilityClinicReferral', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Imaging requested',
    section: 'treatmentPlanning', field: 'imagingRequested',
    options: [
      { value: 'none', label: 'None' },
      { value: 'transvaginal-us', label: 'Transvaginal ultrasound' },
      { value: 'mri-pelvis', label: 'MRI of pelvis' },
      { value: 'both', label: 'Both ultrasound and MRI' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Suggested follow-up interval',
    section: 'treatmentPlanning', field: 'followUpInterval',
    options: [
      { value: '2-weeks', label: '2 weeks' },
      { value: '4-weeks', label: '4 weeks' },
      { value: '3-months', label: '3 months' },
      { value: '6-months', label: '6 months' },
      { value: '12-months', label: '12 months' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Planning notes',
    section: 'treatmentPlanning', field: 'planningNotes',
    placeholder: 'Anything else for your management plan…',
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
    const current = state[section] && state[section][field];
    host.style.display = String(current) === target ? '' : 'none';
  });
  document.querySelectorAll('[data-conditional-any]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-any');
    const [path, targetCsv] = expr.split('=');
    const [section, field] = path.split('.');
    const current = String((state[section] && state[section][field]) ?? '');
    const targets = targetCsv.split(',');
    host.style.display = targets.includes(current) ? '' : 'none';
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
  // Menstrual history
  ['menstrualHistory', 'ageAtMenarche'],
  ['menstrualHistory', 'cycleRegularity'],
  ['menstrualHistory', 'cycleLengthDays'],
  ['menstrualHistory', 'periodDurationDays'],
  ['menstrualHistory', 'flowHeaviness'],
  ['menstrualHistory', 'clotsPresent'],
  ['menstrualHistory', 'intermenstrualBleeding'],
  ['menstrualHistory', 'postcoitalBleeding'],
  ['menstrualHistory', 'dysmenorrhoeaSeverity'],
  ['menstrualHistory', 'daysOffWorkPerCycle'],
  ['menstrualHistory', 'currentContraception'],
  // Pain
  ['painAssessment', 'hasPelvicPain'],
  ['painAssessment', 'dyspareunia'],
  ['painAssessment', 'dyschezia'],
  ['painAssessment', 'backPain'],
  ['painAssessment', 'legPain'],
  ['painAssessment', 'painWorseWithActivity'],
  // GI
  ['gastrointestinalSymptoms', 'hasGiSymptoms'],
  ['gastrointestinalSymptoms', 'bloating'],
  ['gastrointestinalSymptoms', 'nausea'],
  ['gastrointestinalSymptoms', 'constipation'],
  ['gastrointestinalSymptoms', 'diarrhoea'],
  ['gastrointestinalSymptoms', 'alternatingBowelHabit'],
  ['gastrointestinalSymptoms', 'rectalBleeding'],
  ['gastrointestinalSymptoms', 'bowelObstructionSymptoms'],
  // Urinary
  ['urinarySymptoms', 'hasUrinarySymptoms'],
  ['urinarySymptoms', 'frequency'],
  ['urinarySymptoms', 'urgency'],
  ['urinarySymptoms', 'dysuria'],
  ['urinarySymptoms', 'haematuria'],
  ['urinarySymptoms', 'flankPain'],
  ['urinarySymptoms', 'urinaryObstructionSymptoms'],
  ['urinarySymptoms', 'recurrentUtis'],
  // Fertility
  ['fertilityAssessment', 'tryingToConceive'],
  ['fertilityAssessment', 'previousPregnancies'],
  ['fertilityAssessment', 'liveBirths'],
  ['fertilityAssessment', 'miscarriages'],
  ['fertilityAssessment', 'ectopicPregnancies'],
  ['fertilityAssessment', 'previousFertilityTreatment'],
  ['fertilityAssessment', 'partnerSemenAnalysis'],
  ['fertilityAssessment', 'futureFertilityConcerns'],
  // Previous treatments
  ['previousTreatments', 'nsaidsTried'],
  ['previousTreatments', 'paracetamolTried'],
  ['previousTreatments', 'opioidsTried'],
  ['previousTreatments', 'opioidsCurrent'],
  ['previousTreatments', 'combinedPillTried'],
  ['previousTreatments', 'progesteroneTried'],
  ['previousTreatments', 'gnrhAgonistTried'],
  ['previousTreatments', 'mirenaIusTried'],
  // Surgical history
  ['surgicalHistory', 'previousLaparoscopy'],
  // Quality of life
  ['qualityOfLife', 'painDomainScore'],
  ['qualityOfLife', 'controlPowerlessnessScore'],
  ['qualityOfLife', 'emotionalWellbeingScore'],
  ['qualityOfLife', 'socialSupportScore'],
  ['qualityOfLife', 'selfImageScore'],
  ['qualityOfLife', 'workImpact'],
  ['qualityOfLife', 'relationshipImpact'],
  ['qualityOfLife', 'sleepImpact'],
  ['qualityOfLife', 'mentalHealthImpact'],
  ['qualityOfLife', 'exerciseImpact'],
  // Treatment planning
  ['treatmentPlanning', 'preferredApproach'],
  ['treatmentPlanning', 'surgeryConsidered'],
  ['treatmentPlanning', 'fertilityPreservationNeeded'],
  ['treatmentPlanning', 'mdtReferralNeeded'],
  ['treatmentPlanning', 'painManagementReferral'],
  ['treatmentPlanning', 'psychologyReferral'],
  ['treatmentPlanning', 'physiotherapyReferral'],
  ['treatmentPlanning', 'fertilityClinicReferral'],
  ['treatmentPlanning', 'imagingRequested'],
  ['treatmentPlanning', 'followUpInterval']
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
  { step: 2,  section: 'menstrualHistory',          title: 'Menstrual History' },
  { step: 3,  section: 'painAssessment',            title: 'Pain Assessment' },
  { step: 4,  section: 'gastrointestinalSymptoms',  title: 'GI Symptoms' },
  { step: 5,  section: 'urinarySymptoms',           title: 'Urinary Symptoms' },
  { step: 6,  section: 'fertilityAssessment',       title: 'Fertility' },
  { step: 7,  section: 'previousTreatments',        title: 'Previous Treatments' },
  { step: 8,  section: 'surgicalHistory',           title: 'Surgical History' },
  { step: 9,  section: 'qualityOfLife',             title: 'Quality of Life' },
  { step: 10, section: 'treatmentPlanning',         title: 'Treatment Planning' }
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
    asrmStage,
    asrmPoints,
    ehp30Score,
    overallSeverity,
    firedRules,
    additionalFlags,
    timestamp
  } = lastResult;

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
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
      <td class="num">${esc(endoGradeLabel(r.grade))}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No grading rules fired — no significant findings detected.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Finding</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const ehp30Display = ehp30Score === null
    ? '<span class="muted">Not assessed (need at least 3 EHP-30 domains)</span>'
    : `<strong>${ehp30Score}</strong> / 100 <span class="muted">— ${esc(ehp30Label(ehp30Score))}</span>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Endometriosis Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>ASRM Staging</h3>
      <p class="summary-line">
        <span class="severity-badge ${esc(severityClass(overallSeverity))}">
          ${esc(asrmStageShort(asrmStage))}
        </span>
        <span class="summary-detail">${esc(asrmStageLabel(asrmStage))}</span>
      </p>
      <p class="muted">Approximate ASRM points: <strong>${asrmPoints}</strong></p>

      <h3>EHP-30 Quality of Life</h3>
      <p class="summary-line">${ehp30Display}</p>

      <h3>Overall Severity</h3>
      <p class="summary-line">
        <span class="severity-badge ${esc(severityClass(overallSeverity))}">
          ${esc(severityLabel(overallSeverity))}
        </span>
      </p>

      <h3>Findings (fired rules)</h3>
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
  const grade = calculateEndoGrade(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    asrmStage: grade.asrmStage,
    asrmPoints: grade.asrmPoints,
    ehp30Score: grade.ehp30Score,
    overallSeverity: grade.overallSeverity,
    firedRules: grade.firedRules,
    additionalFlags,
    timestamp: grade.timestamp
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
