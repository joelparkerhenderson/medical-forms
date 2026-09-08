import { detectAdditionalFlags } from './flagged-issues.js';
import { emptyAssessment, ukmecBadgeClass, ukmecLabel } from './types.js';
import { evaluateUKMEC } from './ukmec-grader.js';

// Contraception Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure UKMEC scoring engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'contraception-assessment.front-end-form-with-html.v1';

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
  slug: 'contraception-assessment',
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
}

// Map an <input type=…> to its Lily class name.
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
    if (type === 'number') v = v === '' ? null : Number(v);
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

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = `${groupId}-error`;
  wrapper.appendChild(errSpan);
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
// Reusable option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const smokingOptions = [
  { value: 'never', label: 'Never smoked' },
  { value: 'former', label: 'Former smoker' },
  { value: 'current-light', label: 'Current smoker (< 15 per day)' },
  { value: 'current-heavy', label: 'Current smoker (>= 15 per day)' }
];

const methodOptionsExtended = [
  { value: 'combined-oral', label: 'Combined oral contraceptive (COC)' },
  { value: 'progestogen-only-pill', label: 'Progestogen-only pill (POP)' },
  { value: 'injectable', label: 'Injectable (e.g., Depo-Provera)' },
  { value: 'implant', label: 'Subdermal implant (e.g., Nexplanon)' },
  { value: 'copper-iud', label: 'Copper IUD (non-hormonal coil)' },
  { value: 'lng-ius', label: 'LNG-IUS (hormonal coil, e.g., Mirena)' },
  { value: 'patch', label: 'Contraceptive patch' },
  { value: 'vaginal-ring', label: 'Vaginal ring (e.g., NuvaRing)' },
  { value: 'barrier', label: 'Barrier method (condoms, diaphragm)' },
  { value: 'natural-methods', label: 'Natural family planning / fertility awareness' },
  { value: 'sterilisation', label: 'Sterilisation' }
];

const methodOptionsCurrent = [
  ...methodOptionsExtended,
  { value: 'none', label: 'None / not currently using' }
];

const priorityOptions = [
  { value: 'low', label: 'Low priority' },
  { value: 'moderate', label: 'Moderate priority' },
  { value: 'high', label: 'High priority' },
  { value: 'very-high', label: 'Very high priority' }
];

// ----------------------------------------------------------------------
// Section renderers (10 steps)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1, title: 'Demographics', description: 'Basic patient information.'
  });
  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'demographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(grid);
  card.appendChild(textInput({
    label: 'Date of Birth', section: 'demographics', field: 'dateOfBirth', type: 'date', required: true
  }));
  card.appendChild(radioGroup({
    label: 'Sex', section: 'demographics', field: 'sex', required: true,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2, title: 'Reproductive History', description: 'Pregnancy and reproductive background.'
  });
  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Gravida (total pregnancies)',
    section: 'reproductiveHistory', field: 'gravida',
    type: 'number', min: 0, max: 20
  }));
  grid.appendChild(textInput({
    label: 'Para (births past 24 weeks)',
    section: 'reproductiveHistory', field: 'para',
    type: 'number', min: 0, max: 20
  }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Date of last delivery',
    section: 'reproductiveHistory', field: 'lastDeliveryDate', type: 'date'
  }));
  card.appendChild(radioGroup({
    label: 'Are you currently breastfeeding?',
    section: 'reproductiveHistory', field: 'breastfeeding', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Pregnancy intention',
    section: 'reproductiveHistory', field: 'pregnancyIntention',
    placeholder: 'Describe your plans regarding future pregnancies...'
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3, title: 'Menstrual History', description: 'Details about your menstrual cycle.'
  });
  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Cycle length',
    section: 'menstrualHistory', field: 'cycleLength',
    type: 'number', min: 14, max: 60, unit: 'days'
  }));
  grid.appendChild(textInput({
    label: 'Period duration',
    section: 'menstrualHistory', field: 'cycleDuration',
    type: 'number', min: 1, max: 14, unit: 'days'
  }));
  card.appendChild(grid);

  card.appendChild(selectInput({
    label: 'Flow heaviness',
    section: 'menstrualHistory', field: 'flowHeaviness',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'heavy', label: 'Heavy' },
      { value: 'very-heavy', label: 'Very heavy (flooding/clots)' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Period pain (dysmenorrhea)',
    section: 'menstrualHistory', field: 'dysmenorrhea',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild - manageable without medication' },
      { value: 'moderate', label: 'Moderate - requires pain relief' },
      { value: 'severe', label: 'Severe - affects daily activities' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date of last menstrual period',
    section: 'menstrualHistory', field: 'lastMenstrualPeriod', type: 'date'
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4, title: 'Current Contraception',
    description: 'Your current or most recent method of contraception.'
  });
  card.appendChild(selectInput({
    label: 'Current contraceptive method',
    section: 'currentContraception', field: 'currentMethod',
    required: true,
    options: methodOptionsCurrent
  }));
  card.appendChild(textInput({
    label: 'How long have you been using this method?',
    section: 'currentContraception', field: 'durationOfUse',
    placeholder: 'e.g., 6 months, 2 years, 5 years'
  }));
  card.appendChild(textArea({
    label: 'Reason for change or review',
    section: 'currentContraception', field: 'reasonForChange',
    placeholder: 'Why are you considering changing or reviewing your contraception?'
  }));
  card.appendChild(textArea({
    label: 'Side effects experienced',
    section: 'currentContraception', field: 'sideEffects',
    placeholder: 'List any side effects you have experienced with your current or previous methods...'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5, title: 'Medical History',
    description: 'Conditions relevant to contraceptive eligibility (UKMEC criteria).'
  });
  card.appendChild(radioGroup({ label: 'Do you have hypertension (high blood pressure)?', section: 'medicalHistory', field: 'hypertension', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you experience migraines with aura?', section: 'medicalHistory', field: 'migraineWithAura', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have a history of DVT (deep vein thrombosis) or VTE?', section: 'medicalHistory', field: 'dvtHistory', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have current or recent breast cancer?', section: 'medicalHistory', field: 'breastCancer', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have active liver disease?', section: 'medicalHistory', field: 'liverDisease', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have diabetes?', section: 'medicalHistory', field: 'diabetes', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have epilepsy?', section: 'medicalHistory', field: 'epilepsy', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Are you HIV positive?', section: 'medicalHistory', field: 'hiv', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have a history of sexually transmitted infections?', section: 'medicalHistory', field: 'stiHistory', options: yesNo }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6, title: 'Cardiovascular Risk',
    description: 'Factors affecting cardiovascular risk and contraceptive eligibility.'
  });
  card.appendChild(textInput({
    label: 'BMI', section: 'cardiovascularRisk', field: 'bmi',
    type: 'number', min: 10, max: 80, step: 0.1, unit: 'kg/m²'
  }));
  card.appendChild(selectInput({
    label: 'Smoking status',
    section: 'cardiovascularRisk', field: 'smoking', options: smokingOptions
  }));
  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Blood pressure (systolic)',
    section: 'cardiovascularRisk', field: 'bloodPressureSystolic',
    type: 'number', min: 60, max: 250, unit: 'mmHg'
  }));
  grid.appendChild(textInput({
    label: 'Blood pressure (diastolic)',
    section: 'cardiovascularRisk', field: 'bloodPressureDiastolic',
    type: 'number', min: 30, max: 150, unit: 'mmHg'
  }));
  card.appendChild(grid);
  card.appendChild(radioGroup({
    label: 'Family history of cardiovascular disease (before age 50)?',
    section: 'cardiovascularRisk', field: 'familyHistoryCVD', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have lipid disorders (high cholesterol/triglycerides)?',
    section: 'cardiovascularRisk', field: 'lipidDisorders', options: yesNo
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7, title: 'Lifestyle Factors',
    description: 'Lifestyle factors relevant to contraceptive choice.'
  });
  card.appendChild(selectInput({
    label: 'Smoking status',
    section: 'lifestyleFactors', field: 'smokingStatus', options: smokingOptions
  }));
  card.appendChild(selectInput({
    label: 'Alcohol use',
    section: 'lifestyleFactors', field: 'alcoholUse',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional (1-2 units per week)' },
      { value: 'moderate', label: 'Moderate (3-14 units per week)' },
      { value: 'heavy', label: 'Heavy (> 14 units per week)' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Recreational drug use',
    section: 'lifestyleFactors', field: 'drugUse',
    options: [
      { value: 'none', label: 'None' },
      { value: 'cannabis', label: 'Cannabis only' },
      { value: 'recreational', label: 'Recreational drugs' },
      { value: 'iv-drug-use', label: 'IV drug use' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Occupation',
    section: 'lifestyleFactors', field: 'occupation',
    placeholder: 'e.g., nurse, teacher, shift worker...'
  }));
  card.appendChild(textArea({
    label: 'Travel plans (relevant for malaria prophylaxis interactions)',
    section: 'lifestyleFactors', field: 'travelPlans',
    placeholder: 'Any upcoming travel to areas requiring specific health considerations...'
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8, title: 'Preferences & Priorities',
    description: 'Your preferences for contraceptive method selection.'
  });
  card.appendChild(selectInput({
    label: 'Preferred contraceptive method',
    section: 'preferencesPriorities', field: 'preferredMethod',
    options: methodOptionsExtended
  }));
  card.appendChild(selectInput({
    label: 'How important is contraceptive efficacy?',
    section: 'preferencesPriorities', field: 'efficacyPriority', options: priorityOptions
  }));
  card.appendChild(selectInput({
    label: 'How important is convenience (e.g., not needing daily action)?',
    section: 'preferencesPriorities', field: 'conveniencePriority', options: priorityOptions
  }));
  card.appendChild(selectInput({
    label: 'How important is period control (lighter/no periods)?',
    section: 'preferencesPriorities', field: 'periodControlPriority', options: priorityOptions
  }));
  card.appendChild(selectInput({
    label: 'How important is rapid return of fertility after stopping?',
    section: 'preferencesPriorities', field: 'fertilityReturnPriority', options: priorityOptions
  }));
  card.appendChild(radioGroup({
    label: 'Hormone-free preference',
    section: 'preferencesPriorities', field: 'hormoneFreePreference',
    options: [
      { value: 'no-preference', label: 'No preference' },
      { value: 'prefer-hormone-free', label: 'Prefer hormone-free' },
      { value: 'prefer-hormonal', label: 'Prefer hormonal' }
    ]
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9, title: 'Breast & Cervical Screening',
    description: 'Screening history relevant to contraceptive counselling.'
  });
  card.appendChild(textInput({
    label: 'Date of last breast screening',
    section: 'breastCervicalScreening', field: 'lastBreastScreening', type: 'date'
  }));
  card.appendChild(textInput({
    label: 'Date of last cervical screening (smear test)',
    section: 'breastCervicalScreening', field: 'lastCervicalScreening', type: 'date'
  }));
  card.appendChild(selectInput({
    label: 'HPV vaccination status',
    section: 'breastCervicalScreening', field: 'hpvVaccination',
    options: [
      { value: 'completed', label: 'Completed (all doses)' },
      { value: 'partial', label: 'Partially vaccinated' },
      { value: 'none', label: 'Not vaccinated' },
      { value: 'unsure', label: 'Unsure' }
    ]
  }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10, title: 'Family Planning Goals',
    description: 'Your goals and preferences for family planning.'
  });
  card.appendChild(radioGroup({
    label: 'Do you desire children in the future?',
    section: 'familyPlanningGoals', field: 'desireForChildren',
    options: [
      { value: 'yes-soon', label: 'Yes, soon' },
      { value: 'yes-future', label: 'Yes, in the future' },
      { value: 'unsure', label: 'Unsure' },
      { value: 'no', label: 'No' }
    ]
  }));

  // Two timeframe selects, conditional. The Svelte form swaps the options
  // on the same field; here we render both with `data-conditional-any`
  // visibility toggles so only the relevant one is shown at a time.
  const timeframeYes = document.createElement('div');
  timeframeYes.dataset.conditionalAny = 'familyPlanningGoals.desireForChildren=yes-soon,yes-future';
  timeframeYes.appendChild(selectInput({
    label: 'Timeframe for starting a family',
    section: 'familyPlanningGoals', field: 'timeframe',
    options: [
      { value: 'within-1-year', label: 'Within 1 year' },
      { value: '1-3-years', label: '1-3 years' },
      { value: '3-5-years', label: '3-5 years' },
      { value: '5-plus-years', label: '5+ years' }
    ]
  }));
  card.appendChild(timeframeYes);

  const timeframeNo = document.createElement('div');
  timeframeNo.dataset.conditionalAny = 'familyPlanningGoals.desireForChildren=,unsure,no';
  timeframeNo.appendChild(selectInput({
    label: 'Timeframe',
    section: 'familyPlanningGoals', field: 'timeframe',
    options: [{ value: 'not-applicable', label: 'Not applicable' }]
  }));
  card.appendChild(timeframeNo);

  card.appendChild(radioGroup({
    label: 'Partner involvement in contraceptive decision',
    section: 'familyPlanningGoals', field: 'partnerInvolvement',
    options: [
      { value: 'involved', label: 'Partner involved in decision' },
      { value: 'not-involved', label: 'Making decision independently' },
      { value: 'not-applicable', label: 'Not applicable' }
    ]
  }));
  return card;
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
  document.querySelectorAll('[data-conditional-any]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-any');
    const [path, targetCsv] = expr.split('=');
    const [section, field] = path.split('.');
    const current = String(state[section]?.[field] ?? '');
    const targets = targetCsv.split(',');
    host.style.display = targets.includes(current) ? '' : 'none';
  });
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
  // Reproductive history
  ['reproductiveHistory', 'gravida'],
  ['reproductiveHistory', 'para'],
  ['reproductiveHistory', 'breastfeeding'],
  // Menstrual history
  ['menstrualHistory', 'cycleLength'],
  ['menstrualHistory', 'cycleDuration'],
  ['menstrualHistory', 'flowHeaviness'],
  ['menstrualHistory', 'dysmenorrhea'],
  // Current contraception
  ['currentContraception', 'currentMethod'],
  // Medical history (9)
  ['medicalHistory', 'hypertension'],
  ['medicalHistory', 'migraineWithAura'],
  ['medicalHistory', 'dvtHistory'],
  ['medicalHistory', 'breastCancer'],
  ['medicalHistory', 'liverDisease'],
  ['medicalHistory', 'diabetes'],
  ['medicalHistory', 'epilepsy'],
  ['medicalHistory', 'hiv'],
  ['medicalHistory', 'stiHistory'],
  // Cardiovascular risk
  ['cardiovascularRisk', 'bmi'],
  ['cardiovascularRisk', 'smoking'],
  ['cardiovascularRisk', 'bloodPressureSystolic'],
  ['cardiovascularRisk', 'bloodPressureDiastolic'],
  ['cardiovascularRisk', 'familyHistoryCVD'],
  ['cardiovascularRisk', 'lipidDisorders'],
  // Lifestyle factors
  ['lifestyleFactors', 'smokingStatus'],
  ['lifestyleFactors', 'alcoholUse'],
  ['lifestyleFactors', 'drugUse'],
  // Preferences
  ['preferencesPriorities', 'preferredMethod'],
  ['preferencesPriorities', 'efficacyPriority'],
  ['preferencesPriorities', 'conveniencePriority'],
  ['preferencesPriorities', 'periodControlPriority'],
  ['preferencesPriorities', 'fertilityReturnPriority'],
  ['preferencesPriorities', 'hormoneFreePreference'],
  // Screening
  ['breastCervicalScreening', 'hpvVaccination'],
  // Family planning
  ['familyPlanningGoals', 'desireForChildren'],
  ['familyPlanningGoals', 'partnerInvolvement']
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
  { step: 1,  section: 'demographics',            title: 'Demographics' },
  { step: 2,  section: 'reproductiveHistory',     title: 'Reproductive History' },
  { step: 3,  section: 'menstrualHistory',        title: 'Menstrual History' },
  { step: 4,  section: 'currentContraception',    title: 'Current Contraception' },
  { step: 5,  section: 'medicalHistory',          title: 'Medical History' },
  { step: 6,  section: 'cardiovascularRisk',      title: 'Cardiovascular Risk' },
  { step: 7,  section: 'lifestyleFactors',        title: 'Lifestyle Factors' },
  { step: 8,  section: 'preferencesPriorities',   title: 'Preferences & Priorities' },
  { step: 9,  section: 'breastCervicalScreening', title: 'Breast & Cervical Screening' },
  { step: 10, section: 'familyPlanningGoals',     title: 'Family Planning Goals' }
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
    ukmecResults,
    overallHighestCategory,
    preferredMethodCategory,
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

  const methodRows = ukmecResults.map((r) => `
    <tr class="row-cat-${r.category}">
      <th scope="row">${esc(r.methodLabel)}</th>
      <td class="cat">${r.category}</td>
      <td>
        ${r.reasons.length === 0
          ? '<span class="muted">No restrictions</span>'
          : `<ul class="reasons">${r.reasons.map((reason) => `<li>${esc(reason)}</li>`).join('')}</ul>`
        }
      </td>
    </tr>
  `).join('');

  const firedRows = firedRules.length === 0
    ? `<p class="muted">No UKMEC rules triggered — all methods are UKMEC 1 (no restriction) based on the answers given.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Rule ID</th>
            <th scope="col">Domain</th>
            <th scope="col">Description</th>
            <th scope="col">UKMEC</th>
          </tr>
        </thead>
        <tbody>
          ${firedRules.map((r) => `
            <tr>
              <th scope="row">${esc(r.id)}</th>
              <td>${esc(r.domain)}</td>
              <td>${esc(r.description)}</td>
              <td class="num">${r.score}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

  const preferredLine = preferredMethodCategory == null
    ? `<p class="muted">No preferred method specified.</p>`
    : `<p>Preferred method UKMEC category:
        <span class="ukmec-badge ${ukmecBadgeClass(preferredMethodCategory)}">
          ${esc(ukmecLabel(preferredMethodCategory))}
        </span>
      </p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Contraception Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Overall highest UKMEC category</h3>
      <p class="ukmec-summary">
        <span class="ukmec-badge ${ukmecBadgeClass(overallHighestCategory)}">
          ${esc(ukmecLabel(overallHighestCategory))}
        </span>
      </p>
      ${preferredLine}

      <h3>Per-method UKMEC categories</h3>
      <table class="methods">
        <thead>
          <tr>
            <th scope="col">Method</th>
            <th scope="col">UKMEC</th>
            <th scope="col">Reasons</th>
          </tr>
        </thead>
        <tbody>${methodRows}</tbody>
      </table>

      <h3>Triggered UKMEC rules</h3>
      ${firedRows}

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
  const { ukmecResults, firedRules } = evaluateUKMEC(state);

  // Overall highest category across all methods
  let overallHighestCategory = 1;
  for (const r of ukmecResults) {
    if (r.category > overallHighestCategory) overallHighestCategory = r.category;
  }

  // Preferred method category, if a preferred method is set
  let preferredMethodCategory = null;
  const preferred = state.preferencesPriorities.preferredMethod;
  if (preferred) {
    const match = ukmecResults.find((r) => r.method === preferred);
    if (match) preferredMethodCategory = match.category;
  }

  const additionalFlags = detectAdditionalFlags(state, ukmecResults);

  lastResult = {
    ukmecResults,
    overallHighestCategory,
    preferredMethodCategory,
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
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
