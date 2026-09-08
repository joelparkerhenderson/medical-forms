import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateSubstanceGrade } from './substance-grader.js';
import { emptyAssessment } from './types.js';
import { auditRiskCategory, auditRiskLabel, bmiCategory, calculateAuditScore, calculateBMI, calculateDastScore, dastRiskCategory, dastRiskLabel, riskLevelClass, riskLevelLabel, substanceGradeLabel } from './utils.js';

// Substance Abuse Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page
// in document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure AUDIT/DAST scoring engine and renders an inline report.
// State is persisted to localStorage so a partial fill survives a reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'substance-abuse-assessment.front-end-form-with-html.v1';

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
      fresh[key] = Object.assign({}, fresh[key], parsed[key]);
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

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
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
  slug: 'substance-abuse-assessment',
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
  return String(s == null ? '' : s)
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
  const id = opts.section + '-' + opts.field;
  const value = state[opts.section][opts.field];
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const attrs = [
    'id="' + id + '"',
    'name="' + id + '"',
    'type="' + type + '"',
    'class="' + lilyInputClass(type) + '"',
    'value="' + esc(value == null ? '' : value) + '"',
    'aria-describedby="' + id + '-error"'
  ];
  if (opts.placeholder) attrs.push('placeholder="' + esc(opts.placeholder) + '"');
  if (opts.required) attrs.push('required', 'data-required');
  if (opts.min !== undefined) attrs.push('min="' + opts.min + '"');
  if (opts.max !== undefined) attrs.push('max="' + opts.max + '"');
  if (opts.step !== undefined) attrs.push('step="' + opts.step + '"');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML =
    '<label class="label" for="' + id + '">' + labelText + '</label>' +
    '<input ' + attrs.join(' ') + '>' +
    (opts.unit ? '<span class="unit">' + esc(opts.unit) + '</span>' : '') +
    '<span class="error-message" id="' + id + '-error" aria-live="polite"></span>';

  const input = wrapper.querySelector('input');
  input.addEventListener('input', function () {
    let v = input.value;
    if (type === 'number') v = v === '' ? null : Number(v);
    setField(opts.section, opts.field, v);
    clearFieldError(id);
  });
  return wrapper;
}

function textArea(opts) {
  const id = opts.section + '-' + opts.field;
  const value = state[opts.section][opts.field] || '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML =
    '<label class="label" for="' + id + '">' + esc(opts.label) + '</label>' +
    '<textarea id="' + id + '" name="' + id + '" rows="' + (opts.rows || 3) + '"' +
      (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '') +
      ' aria-describedby="' + id + '-error"' +
      ' class="text-area-input">' + esc(value) + '</textarea>' +
    '<span class="error-message" id="' + id + '-error" aria-live="polite"></span>';
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', function () { setField(opts.section, opts.field, ta.value); clearFieldError(id); });
  return wrapper;
}

function selectInput(opts) {
  const id = opts.section + '-' + opts.field;
  const current = state[opts.section][opts.field] || '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const options = ['<option value="">— Select —</option>'];
  for (const o of opts.options) {
    options.push('<option value="' + esc(o.value) + '"' +
      (String(o.value) === String(current) ? ' selected' : '') + '>' +
      esc(o.label) + '</option>');
  }
  wrapper.innerHTML =
    '<label class="label" for="' + id + '">' + esc(opts.label) + '</label>' +
    '<select id="' + id + '" name="' + id + '" class="select" aria-describedby="' + id + '-error">' +
      options.join('') + '</select>' +
    '<span class="error-message" id="' + id + '-error" aria-live="polite"></span>';
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', function () {
    let v = sel.value;
    // Coerce numeric AUDIT options back to numbers.
    if (opts.numeric) v = v === '' ? 0 : Number(v);
    setField(opts.section, opts.field, v);
    clearFieldError(id);
  });
  return wrapper;
}

function radioGroup(opts) {
  const groupId = opts.section + '-' + opts.field;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = groupId + '-fieldset';
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
    const radioId = groupId + '-' + option.value;
    const label = document.createElement('label');
    label.htmlFor = radioId;
    const checked = String(current) === String(option.value) ? ' checked' : '';
    const requiredAttr = opts.required ? ' data-required' : '';
    label.innerHTML =
      '<input class="radio-input" type="radio" id="' + radioId + '" name="' + groupId + '"' +
      ' value="' + esc(option.value) + '"' + checked + requiredAttr + '>' +
      '<span>' + esc(option.label) + '</span>';
    const input = label.querySelector('input');
    input.addEventListener('change', function () {
      if (input.checked) {
        let v = option.value;
        if (opts.numeric) v = Number(v);
        setField(opts.section, opts.field, v);
        clearFieldError(groupId);
      }
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = groupId + '-error';
  wrapper.appendChild(errSpan);
  return wrapper;
}

function readOnlyReadout(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field readout';
  wrapper.innerHTML =
    '<label class="label">' + esc(opts.label) + '</label>' +
    '<div id="' + opts.id + '" class="readout-value">' + opts.render() + '</div>';
  return wrapper;
}

function sectionCard(opts) {
  const card = document.createElement('fieldset');
  card.className = 'fieldset';
  card.dataset.step = String(opts.stepNumber);
  card.id = 'step-' + opts.stepNumber;
  const desc = opts.description
    ? '<span class="section-description">' + esc(opts.description) + '</span>' : '';
  const legend = document.createElement('legend');
  legend.className = 'fieldset-legend';
  legend.innerHTML =
    '<span class="section-step">Section ' + opts.stepNumber + ' of 10</span>' +
    '<span class="section-title">' + esc(opts.title) + '</span>' + desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const yesNoUnknown = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' }
];

// AUDIT scoring 0-4 per question; specific labels per WHO AUDIT instrument.
const auditQ1Options = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Monthly or less' },
  { value: 2, label: '2-4 times a month' },
  { value: 3, label: '2-3 times a week' },
  { value: 4, label: '4 or more times a week' }
];
const auditQ2Options = [
  { value: 0, label: '1 or 2' },
  { value: 1, label: '3 or 4' },
  { value: 2, label: '5 or 6' },
  { value: 3, label: '7 to 9' },
  { value: 4, label: '10 or more' }
];
const auditFreqOptions = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Less than monthly' },
  { value: 2, label: 'Monthly' },
  { value: 3, label: 'Weekly' },
  { value: 4, label: 'Daily or almost daily' }
];
const auditQ9Q10Options = [
  { value: 0, label: 'No' },
  { value: 2, label: 'Yes, but not in the last year' },
  { value: 4, label: 'Yes, during the last year' }
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
    label: 'Date of Birth', section: 'demographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  card.appendChild(radioGroup({
    label: 'Sex', section: 'demographics', field: 'sex',
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
    label: 'BMI', id: 'bmi-readout',
    render: function () {
      const bmi = state.demographics.bmi;
      if (bmi == null) return '<span class="muted">Auto-calculated</span>';
      return '<strong>' + bmi + '</strong> <span class="muted">(' + esc(bmiCategory(bmi)) + ')</span>';
    }
  }));
  card.appendChild(measurements);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Alcohol Use (AUDIT)',
    description: 'Alcohol Use Disorders Identification Test — please think about the past 12 months.'
  });

  card.appendChild(selectInput({
    label: '1. How often do you have a drink containing alcohol?',
    section: 'alcoholUseAudit', field: 'auditQ1Frequency',
    options: auditQ1Options, numeric: true
  }));
  card.appendChild(selectInput({
    label: '2. How many drinks containing alcohol do you have on a typical day when you are drinking?',
    section: 'alcoholUseAudit', field: 'auditQ2TypicalQuantity',
    options: auditQ2Options, numeric: true
  }));
  card.appendChild(selectInput({
    label: '3. How often do you have six or more drinks on one occasion?',
    section: 'alcoholUseAudit', field: 'auditQ3BingeFrequency',
    options: auditFreqOptions, numeric: true
  }));
  card.appendChild(selectInput({
    label: '4. How often during the last year have you found that you were not able to stop drinking once you had started?',
    section: 'alcoholUseAudit', field: 'auditQ4ImpairedControl',
    options: auditFreqOptions, numeric: true
  }));
  card.appendChild(selectInput({
    label: '5. How often during the last year have you failed to do what was normally expected of you because of drinking?',
    section: 'alcoholUseAudit', field: 'auditQ5FailedExpectations',
    options: auditFreqOptions, numeric: true
  }));
  card.appendChild(selectInput({
    label: '6. How often during the last year have you needed a first drink in the morning to get yourself going after a heavy drinking session?',
    section: 'alcoholUseAudit', field: 'auditQ6MorningDrinking',
    options: auditFreqOptions, numeric: true
  }));
  card.appendChild(selectInput({
    label: '7. How often during the last year have you had a feeling of guilt or remorse after drinking?',
    section: 'alcoholUseAudit', field: 'auditQ7Guilt',
    options: auditFreqOptions, numeric: true
  }));
  card.appendChild(selectInput({
    label: '8. How often during the last year have you been unable to remember what happened the night before because of your drinking?',
    section: 'alcoholUseAudit', field: 'auditQ8Blackout',
    options: auditFreqOptions, numeric: true
  }));
  card.appendChild(selectInput({
    label: '9. Have you or someone else been injured because of your drinking?',
    section: 'alcoholUseAudit', field: 'auditQ9Injury',
    options: auditQ9Q10Options, numeric: true
  }));
  card.appendChild(selectInput({
    label: '10. Has a relative, friend, doctor, or other health worker been concerned about your drinking or suggested you cut down?',
    section: 'alcoholUseAudit', field: 'auditQ10Concern',
    options: auditQ9Q10Options, numeric: true
  }));

  card.appendChild(readOnlyReadout({
    label: 'AUDIT total',
    id: 'audit-readout',
    render: function () {
      const s = calculateAuditScore(state.alcoholUseAudit);
      return '<strong>' + s + ' / 40</strong> <span class="muted">(' +
        esc(auditRiskLabel(auditRiskCategory(s))) + ')</span>';
    }
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Drug Use (DAST-10)',
    description: 'Drug Abuse Screening Test — answer for the past 12 months. "Drug use" means non-medical use of any drug.'
  });

  card.appendChild(radioGroup({
    label: '1. Have you used drugs other than those required for medical reasons?',
    section: 'drugUseDast', field: 'dastQ1NonMedicalUse', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: '2. Do you abuse more than one drug at a time?',
    section: 'drugUseDast', field: 'dastQ2PolyDrug', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: '3. Are you always able to stop using drugs when you want to?',
    section: 'drugUseDast', field: 'dastQ3AbleToStop', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: '4. Have you ever had blackouts or flashbacks as a result of drug use?',
    section: 'drugUseDast', field: 'dastQ4Blackouts', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: '5. Do you ever feel bad or guilty about your drug use?',
    section: 'drugUseDast', field: 'dastQ5Guilt', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: '6. Does your spouse (or parents) ever complain about your involvement with drugs?',
    section: 'drugUseDast', field: 'dastQ6Complaints', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: '7. Have you neglected your family because of your use of drugs?',
    section: 'drugUseDast', field: 'dastQ7Neglect', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: '8. Have you engaged in illegal activities in order to obtain drugs?',
    section: 'drugUseDast', field: 'dastQ8IllegalActivities', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: '9. Have you ever experienced withdrawal symptoms (felt sick) when you stopped taking drugs?',
    section: 'drugUseDast', field: 'dastQ9Withdrawal', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: '10. Have you had medical problems as a result of your drug use (e.g. memory loss, hepatitis, convulsions, bleeding)?',
    section: 'drugUseDast', field: 'dastQ10MedicalProblems', options: yesNo
  }));

  card.appendChild(readOnlyReadout({
    label: 'DAST-10 total',
    id: 'dast-readout',
    render: function () {
      const s = calculateDastScore(state.drugUseDast);
      return '<strong>' + s + ' / 10</strong> <span class="muted">(' +
        esc(dastRiskLabel(dastRiskCategory(s))) + ')</span>';
    }
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Substance Use History',
    description: 'Patterns and routes of substance use.'
  });

  const ages = document.createElement('div');
  ages.className = 'two-col';
  ages.appendChild(textInput({
    label: 'Age of first alcohol use',
    section: 'substanceUseHistory', field: 'ageFirstAlcoholUse',
    type: 'number', min: 0, max: 120
  }));
  ages.appendChild(textInput({
    label: 'Age of first drug use',
    section: 'substanceUseHistory', field: 'ageFirstDrugUse',
    type: 'number', min: 0, max: 120
  }));
  card.appendChild(ages);

  card.appendChild(selectInput({
    label: 'Primary substance of concern',
    section: 'substanceUseHistory', field: 'primarySubstance',
    options: [
      { value: 'alcohol', label: 'Alcohol' },
      { value: 'cannabis', label: 'Cannabis' },
      { value: 'cocaine', label: 'Cocaine' },
      { value: 'heroin', label: 'Heroin' },
      { value: 'methamphetamine', label: 'Methamphetamine' },
      { value: 'benzodiazepines', label: 'Benzodiazepines' },
      { value: 'opioid-painkillers', label: 'Opioid painkillers' },
      { value: 'other', label: 'Other' }
    ]
  }));
  const otherDetails = document.createElement('div');
  otherDetails.dataset.conditional = 'substanceUseHistory.primarySubstance=other';
  otherDetails.appendChild(textInput({
    label: 'Other primary substance — please specify',
    section: 'substanceUseHistory', field: 'primarySubstanceOther'
  }));
  card.appendChild(otherDetails);

  card.appendChild(textArea({
    label: 'Secondary substances',
    section: 'substanceUseHistory', field: 'secondarySubstances',
    placeholder: 'List other substances used...',
    rows: 2
  }));

  card.appendChild(selectInput({
    label: 'Primary route of administration',
    section: 'substanceUseHistory', field: 'routeOfAdministration',
    options: [
      { value: 'oral', label: 'Oral (swallowing)' },
      { value: 'smoking', label: 'Smoking / inhaling' },
      { value: 'snorting', label: 'Snorting' },
      { value: 'injecting', label: 'Injecting' },
      { value: 'multiple', label: 'Multiple routes' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Frequency of use',
    section: 'substanceUseHistory', field: 'frequencyOfUse',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'several-times-week', label: 'Several times a week' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'occasionally', label: 'Occasionally' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Duration of use',
    section: 'substanceUseHistory', field: 'durationOfUse',
    options: [
      { value: 'less-1-year', label: 'Less than 1 year' },
      { value: '1-5-years', label: '1-5 years' },
      { value: '5-10-years', label: '5-10 years' },
      { value: 'greater-10-years', label: 'More than 10 years' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Date of last use',
    section: 'substanceUseHistory', field: 'lastUseDate',
    type: 'date'
  }));

  card.appendChild(selectInput({
    label: 'Current use status',
    section: 'substanceUseHistory', field: 'currentUseStatus',
    options: [
      { value: 'actively-using', label: 'Actively using' },
      { value: 'in-withdrawal', label: 'In withdrawal' },
      { value: 'early-recovery', label: 'Early recovery (<3 months abstinent)' },
      { value: 'sustained-recovery', label: 'Sustained recovery (>=3 months abstinent)' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Have you ever injected drugs (intravenous use)?',
    section: 'substanceUseHistory', field: 'ivDrugUse', options: yesNo
  }));
  const needleHost = document.createElement('div');
  needleHost.dataset.conditional = 'substanceUseHistory.ivDrugUse=yes';
  needleHost.appendChild(radioGroup({
    label: 'Have you ever shared needles or injecting equipment?',
    section: 'substanceUseHistory', field: 'needleSharing', options: yesNo
  }));
  card.appendChild(needleHost);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Withdrawal Assessment',
    description: 'Withdrawal symptoms — current and historical.'
  });

  card.appendChild(radioGroup({
    label: 'Are you currently experiencing withdrawal symptoms?',
    section: 'withdrawalAssessment', field: 'currentlyInWithdrawal', options: yesNo
  }));
  const wdHost = document.createElement('div');
  wdHost.dataset.conditional = 'withdrawalAssessment.currentlyInWithdrawal=yes';
  wdHost.appendChild(selectInput({
    label: 'Substance you are withdrawing from',
    section: 'withdrawalAssessment', field: 'withdrawalSubstance',
    options: [
      { value: 'alcohol', label: 'Alcohol' },
      { value: 'opioids', label: 'Opioids' },
      { value: 'benzodiazepines', label: 'Benzodiazepines' },
      { value: 'stimulants', label: 'Stimulants' },
      { value: 'multiple', label: 'Multiple substances' },
      { value: 'other', label: 'Other' }
    ]
  }));
  wdHost.appendChild(textInput({
    label: 'Hours since last drink/drug',
    section: 'withdrawalAssessment', field: 'lastDrinkDrugHours',
    type: 'number', min: 0, max: 1000, unit: 'hrs'
  }));
  wdHost.appendChild(radioGroup({
    label: 'Tremor', section: 'withdrawalAssessment', field: 'tremor', options: yesNo
  }));
  wdHost.appendChild(radioGroup({
    label: 'Sweating', section: 'withdrawalAssessment', field: 'sweating', options: yesNo
  }));
  wdHost.appendChild(radioGroup({
    label: 'Nausea / vomiting',
    section: 'withdrawalAssessment', field: 'nauseaVomiting', options: yesNo
  }));
  wdHost.appendChild(selectInput({
    label: 'Anxiety',
    section: 'withdrawalAssessment', field: 'anxiety',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));
  wdHost.appendChild(selectInput({
    label: 'Agitation',
    section: 'withdrawalAssessment', field: 'agitation',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));
  wdHost.appendChild(selectInput({
    label: 'Overall withdrawal severity',
    section: 'withdrawalAssessment', field: 'withdrawalSeverity',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));
  card.appendChild(wdHost);

  card.appendChild(radioGroup({
    label: 'History of withdrawal seizures?',
    section: 'withdrawalAssessment', field: 'seizureHistory', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'History of delirium tremens?',
    section: 'withdrawalAssessment', field: 'deliriumTremensHistory', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'History of hallucinations during withdrawal?',
    section: 'withdrawalAssessment', field: 'hallucinations', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Is medically-supervised detox needed?',
    section: 'withdrawalAssessment', field: 'medicallySupervisedDetoxNeeded', options: yesNo
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Mental Health Comorbidities',
    description: 'Co-occurring mental health conditions.'
  });

  card.appendChild(radioGroup({
    label: 'Depression', section: 'mentalHealthComorbidities', field: 'depression', options: yesNo
  }));
  const depHost = document.createElement('div');
  depHost.dataset.conditional = 'mentalHealthComorbidities.depression=yes';
  depHost.appendChild(selectInput({
    label: 'Depression severity',
    section: 'mentalHealthComorbidities', field: 'depressionSeverity',
    options: [
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));
  card.appendChild(depHost);

  card.appendChild(radioGroup({
    label: 'Anxiety disorder',
    section: 'mentalHealthComorbidities', field: 'anxietyDisorder', options: yesNo
  }));
  const anxHost = document.createElement('div');
  anxHost.dataset.conditional = 'mentalHealthComorbidities.anxietyDisorder=yes';
  anxHost.appendChild(selectInput({
    label: 'Type of anxiety disorder',
    section: 'mentalHealthComorbidities', field: 'anxietyDisorderType',
    options: [
      { value: 'generalised', label: 'Generalised anxiety' },
      { value: 'social', label: 'Social anxiety' },
      { value: 'panic', label: 'Panic disorder' },
      { value: 'ptsd', label: 'PTSD' },
      { value: 'ocd', label: 'OCD' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(anxHost);

  card.appendChild(radioGroup({
    label: 'Post-traumatic stress disorder (PTSD)',
    section: 'mentalHealthComorbidities', field: 'ptsd', options: yesNo
  }));
  const ptsdHost = document.createElement('div');
  ptsdHost.dataset.conditional = 'mentalHealthComorbidities.ptsd=yes';
  ptsdHost.appendChild(textArea({
    label: 'PTSD details',
    section: 'mentalHealthComorbidities', field: 'ptsdDetails',
    placeholder: 'Brief description (optional)…', rows: 2
  }));
  card.appendChild(ptsdHost);

  card.appendChild(radioGroup({
    label: 'Bipolar disorder',
    section: 'mentalHealthComorbidities', field: 'bipolarDisorder', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Psychosis',
    section: 'mentalHealthComorbidities', field: 'psychosis', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Personality disorder',
    section: 'mentalHealthComorbidities', field: 'personalityDisorder', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Eating disorder',
    section: 'mentalHealthComorbidities', field: 'eatingDisorder', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'ADHD',
    section: 'mentalHealthComorbidities', field: 'adhd', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Have you had thoughts of suicide in the past?',
    section: 'mentalHealthComorbidities', field: 'suicidalIdeation', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Are you having thoughts of suicide currently?',
    section: 'mentalHealthComorbidities', field: 'suicidalIdeationCurrent', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'History of self-harm',
    section: 'mentalHealthComorbidities', field: 'selfHarmHistory', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Previous suicide attempts',
    section: 'mentalHealthComorbidities', field: 'previousSuicideAttempts', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Currently taking psychiatric medication',
    section: 'mentalHealthComorbidities', field: 'psychiatricMedication', options: yesNo
  }));
  const psyMedHost = document.createElement('div');
  psyMedHost.dataset.conditional = 'mentalHealthComorbidities.psychiatricMedication=yes';
  psyMedHost.appendChild(textArea({
    label: 'Psychiatric medication details (name, dose)',
    section: 'mentalHealthComorbidities', field: 'psychiatricMedicationDetails',
    placeholder: 'Medication name(s) and dose…', rows: 2
  }));
  card.appendChild(psyMedHost);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Physical Health Impact',
    description: 'Physical health consequences of substance use.'
  });

  card.appendChild(radioGroup({
    label: 'Liver disease',
    section: 'physicalHealthImpact', field: 'liverDisease', options: yesNo
  }));
  const liverHost = document.createElement('div');
  liverHost.dataset.conditional = 'physicalHealthImpact.liverDisease=yes';
  liverHost.appendChild(selectInput({
    label: 'Type of liver disease',
    section: 'physicalHealthImpact', field: 'liverDiseaseType',
    options: [
      { value: 'fatty-liver', label: 'Fatty liver' },
      { value: 'hepatitis', label: 'Hepatitis (alcoholic / viral)' },
      { value: 'cirrhosis', label: 'Cirrhosis' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(liverHost);

  card.appendChild(selectInput({
    label: 'Hepatitis B status',
    section: 'physicalHealthImpact', field: 'hepatitisB',
    options: yesNoUnknown
  }));
  card.appendChild(selectInput({
    label: 'Hepatitis C status',
    section: 'physicalHealthImpact', field: 'hepatitisC',
    options: yesNoUnknown
  }));
  card.appendChild(selectInput({
    label: 'HIV status',
    section: 'physicalHealthImpact', field: 'hivStatus',
    options: [
      { value: 'positive', label: 'Positive' },
      { value: 'negative', label: 'Negative' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Cardiovascular issues',
    section: 'physicalHealthImpact', field: 'cardiovascularIssues', options: yesNo
  }));
  const cvHost = document.createElement('div');
  cvHost.dataset.conditional = 'physicalHealthImpact.cardiovascularIssues=yes';
  cvHost.appendChild(textInput({
    label: 'Cardiovascular details',
    section: 'physicalHealthImpact', field: 'cardiovascularDetails'
  }));
  card.appendChild(cvHost);

  card.appendChild(radioGroup({
    label: 'Respiratory issues',
    section: 'physicalHealthImpact', field: 'respiratoryIssues', options: yesNo
  }));
  const respHost = document.createElement('div');
  respHost.dataset.conditional = 'physicalHealthImpact.respiratoryIssues=yes';
  respHost.appendChild(textInput({
    label: 'Respiratory details',
    section: 'physicalHealthImpact', field: 'respiratoryDetails'
  }));
  card.appendChild(respHost);

  card.appendChild(radioGroup({
    label: 'Gastrointestinal issues',
    section: 'physicalHealthImpact', field: 'gastrointestinalIssues', options: yesNo
  }));
  const giHost = document.createElement('div');
  giHost.dataset.conditional = 'physicalHealthImpact.gastrointestinalIssues=yes';
  giHost.appendChild(textInput({
    label: 'Gastrointestinal details',
    section: 'physicalHealthImpact', field: 'gastrointestinalDetails'
  }));
  card.appendChild(giHost);

  card.appendChild(radioGroup({
    label: 'Neurological issues',
    section: 'physicalHealthImpact', field: 'neurologicalIssues', options: yesNo
  }));
  const neuroHost = document.createElement('div');
  neuroHost.dataset.conditional = 'physicalHealthImpact.neurologicalIssues=yes';
  neuroHost.appendChild(textInput({
    label: 'Neurological details',
    section: 'physicalHealthImpact', field: 'neurologicalDetails'
  }));
  card.appendChild(neuroHost);

  card.appendChild(radioGroup({
    label: 'Nutritional deficiency',
    section: 'physicalHealthImpact', field: 'nutritionalDeficiency', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Chronic pain',
    section: 'physicalHealthImpact', field: 'chronicPain', options: yesNo
  }));
  const painHost = document.createElement('div');
  painHost.dataset.conditional = 'physicalHealthImpact.chronicPain=yes';
  painHost.appendChild(textInput({
    label: 'Chronic pain details',
    section: 'physicalHealthImpact', field: 'chronicPainDetails'
  }));
  card.appendChild(painHost);

  card.appendChild(radioGroup({
    label: 'Have you ever overdosed?',
    section: 'physicalHealthImpact', field: 'overdoseHistory', options: yesNo
  }));
  const odHost = document.createElement('div');
  odHost.dataset.conditional = 'physicalHealthImpact.overdoseHistory=yes';
  odHost.appendChild(textInput({
    label: 'How many overdose episodes?',
    section: 'physicalHealthImpact', field: 'overdoseCount',
    type: 'number', min: 1, max: 100
  }));
  odHost.appendChild(textInput({
    label: 'Date of last overdose',
    section: 'physicalHealthImpact', field: 'lastOverdoseDate',
    type: 'date'
  }));
  card.appendChild(odHost);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Social & Legal Impact',
    description: 'Employment, housing, relationships, legal involvement.'
  });

  card.appendChild(selectInput({
    label: 'Employment status',
    section: 'socialLegalImpact', field: 'employmentStatus',
    options: [
      { value: 'employed', label: 'Employed' },
      { value: 'unemployed', label: 'Unemployed' },
      { value: 'retired', label: 'Retired' },
      { value: 'sick-leave', label: 'On sick leave' },
      { value: 'student', label: 'Student' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Occupation',
    section: 'socialLegalImpact', field: 'occupation'
  }));
  card.appendChild(radioGroup({
    label: 'Has substance use affected your employment?',
    section: 'socialLegalImpact', field: 'employmentAffected', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Housing status',
    section: 'socialLegalImpact', field: 'housingStatus',
    options: [
      { value: 'stable', label: 'Stable' },
      { value: 'unstable', label: 'Unstable' },
      { value: 'homeless', label: 'Homeless' },
      { value: 'temporary', label: 'Temporary accommodation' },
      { value: 'supported', label: 'Supported housing' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Relationship status',
    section: 'socialLegalImpact', field: 'relationshipStatus',
    options: [
      { value: 'single', label: 'Single' },
      { value: 'partnered', label: 'Partnered' },
      { value: 'married', label: 'Married' },
      { value: 'separated', label: 'Separated' },
      { value: 'divorced', label: 'Divorced' },
      { value: 'widowed', label: 'Widowed' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Impact on relationships',
    section: 'socialLegalImpact', field: 'relationshipImpact',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Number of dependent children',
    section: 'socialLegalImpact', field: 'dependents',
    type: 'number', min: 0, max: 20
  }));
  card.appendChild(radioGroup({
    label: 'Are there safeguarding concerns about children in your care?',
    section: 'socialLegalImpact', field: 'childrenSafeguardingConcerns', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Social support',
    section: 'socialLegalImpact', field: 'socialSupport',
    options: [
      { value: 'good', label: 'Good' },
      { value: 'limited', label: 'Limited' },
      { value: 'none', label: 'None' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Criminal record',
    section: 'socialLegalImpact', field: 'criminalRecord', options: yesNo
  }));
  const crHost = document.createElement('div');
  crHost.dataset.conditional = 'socialLegalImpact.criminalRecord=yes';
  crHost.appendChild(textInput({
    label: 'Criminal record details',
    section: 'socialLegalImpact', field: 'criminalRecordDetails'
  }));
  card.appendChild(crHost);

  card.appendChild(radioGroup({
    label: 'Current legal issues',
    section: 'socialLegalImpact', field: 'currentLegalIssues', options: yesNo
  }));
  const lglHost = document.createElement('div');
  lglHost.dataset.conditional = 'socialLegalImpact.currentLegalIssues=yes';
  lglHost.appendChild(textInput({
    label: 'Current legal issue details',
    section: 'socialLegalImpact', field: 'currentLegalDetails'
  }));
  card.appendChild(lglHost);

  card.appendChild(radioGroup({
    label: 'Driving under the influence (DUI/DWI) history',
    section: 'socialLegalImpact', field: 'duiDwiHistory', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Financial difficulties related to substance use',
    section: 'socialLegalImpact', field: 'financialDifficulties', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Domestic violence (as victim or perpetrator)',
    section: 'socialLegalImpact', field: 'domesticViolence', options: yesNo
  }));
  const dvHost = document.createElement('div');
  dvHost.dataset.conditional = 'socialLegalImpact.domesticViolence=yes';
  dvHost.appendChild(textArea({
    label: 'Domestic violence details',
    section: 'socialLegalImpact', field: 'domesticViolenceDetails',
    placeholder: 'Brief details…', rows: 2
  }));
  card.appendChild(dvHost);

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Previous Treatment History',
    description: 'Past detox, rehab, counselling, and self-help involvement.'
  });

  card.appendChild(radioGroup({
    label: 'Have you previously had treatment for substance use?',
    section: 'previousTreatmentHistory', field: 'previousTreatment', options: yesNo
  }));
  const tHost = document.createElement('div');
  tHost.dataset.conditional = 'previousTreatmentHistory.previousTreatment=yes';
  tHost.appendChild(textInput({
    label: 'Number of previous treatment episodes',
    section: 'previousTreatmentHistory', field: 'numberOfTreatmentEpisodes',
    type: 'number', min: 0, max: 100
  }));
  card.appendChild(tHost);

  card.appendChild(radioGroup({
    label: 'Previous detox?',
    section: 'previousTreatmentHistory', field: 'previousDetox', options: yesNo
  }));
  const dxHost = document.createElement('div');
  dxHost.dataset.conditional = 'previousTreatmentHistory.previousDetox=yes';
  dxHost.appendChild(selectInput({
    label: 'Detox setting',
    section: 'previousTreatmentHistory', field: 'detoxSetting',
    options: [
      { value: 'inpatient', label: 'Inpatient' },
      { value: 'outpatient', label: 'Outpatient' },
      { value: 'community', label: 'Community' }
    ]
  }));
  card.appendChild(dxHost);

  card.appendChild(radioGroup({
    label: 'Previous residential / day rehab?',
    section: 'previousTreatmentHistory', field: 'previousRehab', options: yesNo
  }));
  const rxHost = document.createElement('div');
  rxHost.dataset.conditional = 'previousTreatmentHistory.previousRehab=yes';
  rxHost.appendChild(selectInput({
    label: 'Rehab type',
    section: 'previousTreatmentHistory', field: 'rehabType',
    options: [
      { value: 'residential', label: 'Residential' },
      { value: 'day-programme', label: 'Day programme' },
      { value: 'outpatient', label: 'Outpatient' }
    ]
  }));
  card.appendChild(rxHost);

  card.appendChild(radioGroup({
    label: 'Previous counselling?',
    section: 'previousTreatmentHistory', field: 'previousCounselling', options: yesNo
  }));
  const cxHost = document.createElement('div');
  cxHost.dataset.conditional = 'previousTreatmentHistory.previousCounselling=yes';
  cxHost.appendChild(selectInput({
    label: 'Counselling type',
    section: 'previousTreatmentHistory', field: 'counsellingType',
    options: [
      { value: 'cbt', label: 'CBT' },
      { value: 'motivational-interviewing', label: 'Motivational interviewing' },
      { value: 'group-therapy', label: 'Group therapy' },
      { value: '12-step', label: '12-step' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(cxHost);

  card.appendChild(radioGroup({
    label: 'Previous medication-assisted treatment (MAT)?',
    section: 'previousTreatmentHistory', field: 'previousMedicationAssisted', options: yesNo
  }));
  const matHost = document.createElement('div');
  matHost.dataset.conditional = 'previousTreatmentHistory.previousMedicationAssisted=yes';
  matHost.appendChild(selectInput({
    label: 'MAT medication',
    section: 'previousTreatmentHistory', field: 'matMedication',
    options: [
      { value: 'methadone', label: 'Methadone' },
      { value: 'buprenorphine', label: 'Buprenorphine' },
      { value: 'naltrexone', label: 'Naltrexone' },
      { value: 'acamprosate', label: 'Acamprosate' },
      { value: 'disulfiram', label: 'Disulfiram' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(matHost);

  card.appendChild(radioGroup({
    label: 'Self-help group attendance?',
    section: 'previousTreatmentHistory', field: 'selfHelpGroups', options: yesNo
  }));
  const shHost = document.createElement('div');
  shHost.dataset.conditional = 'previousTreatmentHistory.selfHelpGroups=yes';
  shHost.appendChild(selectInput({
    label: 'Self-help group type',
    section: 'previousTreatmentHistory', field: 'selfHelpGroupType',
    options: [
      { value: 'aa', label: 'Alcoholics Anonymous (AA)' },
      { value: 'na', label: 'Narcotics Anonymous (NA)' },
      { value: 'smart-recovery', label: 'SMART Recovery' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(shHost);

  card.appendChild(selectInput({
    label: 'Longest period of abstinence',
    section: 'previousTreatmentHistory', field: 'longestPeriodAbstinent',
    options: [
      { value: 'less-1-month', label: 'Less than 1 month' },
      { value: '1-3-months', label: '1-3 months' },
      { value: '3-6-months', label: '3-6 months' },
      { value: '6-12-months', label: '6-12 months' },
      { value: 'greater-1-year', label: 'More than 1 year' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Relapse triggers',
    section: 'previousTreatmentHistory', field: 'relapseTriggers',
    placeholder: 'What has triggered relapse for you in the past?',
    rows: 3
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Treatment Planning & Goals',
    description: 'Your goals, motivation, and preferred path forward.'
  });

  card.appendChild(selectInput({
    label: 'Treatment goal',
    section: 'treatmentPlanningGoals', field: 'treatmentGoal',
    options: [
      { value: 'abstinence', label: 'Abstinence' },
      { value: 'harm-reduction', label: 'Harm reduction' },
      { value: 'controlled-use', label: 'Controlled use' },
      { value: 'unsure', label: 'Unsure' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Readiness to change',
    section: 'treatmentPlanningGoals', field: 'readinessToChange',
    options: [
      { value: 'pre-contemplation', label: 'Pre-contemplation' },
      { value: 'contemplation', label: 'Contemplation' },
      { value: 'preparation', label: 'Preparation' },
      { value: 'action', label: 'Action' },
      { value: 'maintenance', label: 'Maintenance' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Motivation level',
    section: 'treatmentPlanningGoals', field: 'motivationLevel',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high', label: 'High' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Preferred treatment setting',
    section: 'treatmentPlanningGoals', field: 'preferredTreatmentSetting',
    options: [
      { value: 'inpatient', label: 'Inpatient' },
      { value: 'residential', label: 'Residential' },
      { value: 'day-programme', label: 'Day programme' },
      { value: 'outpatient', label: 'Outpatient' },
      { value: 'community', label: 'Community' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Interested in counselling?',
    section: 'treatmentPlanningGoals', field: 'interestedInCounselling', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Interested in medication-assisted treatment?',
    section: 'treatmentPlanningGoals', field: 'interestedInMedication', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Interested in self-help groups?',
    section: 'treatmentPlanningGoals', field: 'interestedInSelfHelp', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Barriers to treatment',
    section: 'treatmentPlanningGoals', field: 'barriersToTreatment',
    placeholder: 'What might make treatment difficult for you?',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Do you have a support network available?',
    section: 'treatmentPlanningGoals', field: 'supportNetworkAvailable', options: yesNo
  }));
  const supHost = document.createElement('div');
  supHost.dataset.conditional = 'treatmentPlanningGoals.supportNetworkAvailable=yes';
  supHost.appendChild(textArea({
    label: 'Support network details',
    section: 'treatmentPlanningGoals', field: 'supportNetworkDetails',
    placeholder: 'Family, friends, sponsors…', rows: 2
  }));
  card.appendChild(supHost);

  card.appendChild(selectInput({
    label: 'Risk of relapse',
    section: 'treatmentPlanningGoals', field: 'riskOfRelapse',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high', label: 'High' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Is a safety plan needed?',
    section: 'treatmentPlanningGoals', field: 'safetyPlanNeeded', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Naloxone provided?',
    section: 'treatmentPlanningGoals', field: 'naloxoneProvided',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'not-applicable', label: 'Not applicable' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Follow-up plan',
    section: 'treatmentPlanningGoals', field: 'followUpPlan',
    placeholder: 'Next steps and follow-up arrangements…',
    rows: 3
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections + auto-calculated readouts
// ----------------------------------------------------------------------

function updateConditionalSections() {
  const conds = document.querySelectorAll('[data-conditional]');
  for (let i = 0; i < conds.length; i++) {
    const host = conds[i];
    const expr = host.getAttribute('data-conditional');
    const eq = expr.indexOf('=');
    const path = expr.substring(0, eq);
    const target = expr.substring(eq + 1);
    const dot = path.indexOf('.');
    const section = path.substring(0, dot);
    const field = path.substring(dot + 1);
    const current = state[section] && state[section][field];
    host.style.display = String(current) === target ? '' : 'none';
  }
}

function refreshAutoCalculatedReadouts() {
  const bmi = document.getElementById('bmi-readout');
  if (bmi) {
    const v = state.demographics.bmi;
    bmi.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : '<strong>' + v + '</strong> <span class="muted">(' + esc(bmiCategory(v)) + ')</span>';
  }
  const audit = document.getElementById('audit-readout');
  if (audit) {
    const s = calculateAuditScore(state.alcoholUseAudit);
    audit.innerHTML = '<strong>' + s + ' / 40</strong> <span class="muted">(' +
      esc(auditRiskLabel(auditRiskCategory(s))) + ')</span>';
  }
  const dast = document.getElementById('dast-readout');
  if (dast) {
    const s = calculateDastScore(state.drugUseDast);
    dast.innerHTML = '<strong>' + s + ' / 10</strong> <span class="muted">(' +
      esc(dastRiskLabel(dastRiskCategory(s))) + ')</span>';
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'weight'],
  ['demographics', 'height'],
  // DAST-10 (10 yes/no items)
  ['drugUseDast', 'dastQ1NonMedicalUse'],
  ['drugUseDast', 'dastQ2PolyDrug'],
  ['drugUseDast', 'dastQ3AbleToStop'],
  ['drugUseDast', 'dastQ4Blackouts'],
  ['drugUseDast', 'dastQ5Guilt'],
  ['drugUseDast', 'dastQ6Complaints'],
  ['drugUseDast', 'dastQ7Neglect'],
  ['drugUseDast', 'dastQ8IllegalActivities'],
  ['drugUseDast', 'dastQ9Withdrawal'],
  ['drugUseDast', 'dastQ10MedicalProblems'],
  // Substance use history
  ['substanceUseHistory', 'primarySubstance'],
  ['substanceUseHistory', 'frequencyOfUse'],
  ['substanceUseHistory', 'durationOfUse'],
  ['substanceUseHistory', 'currentUseStatus'],
  ['substanceUseHistory', 'ivDrugUse'],
  // Withdrawal
  ['withdrawalAssessment', 'currentlyInWithdrawal'],
  ['withdrawalAssessment', 'seizureHistory'],
  ['withdrawalAssessment', 'deliriumTremensHistory'],
  ['withdrawalAssessment', 'hallucinations'],
  // Mental health
  ['mentalHealthComorbidities', 'depression'],
  ['mentalHealthComorbidities', 'anxietyDisorder'],
  ['mentalHealthComorbidities', 'ptsd'],
  ['mentalHealthComorbidities', 'psychosis'],
  ['mentalHealthComorbidities', 'suicidalIdeationCurrent'],
  ['mentalHealthComorbidities', 'previousSuicideAttempts'],
  // Physical health
  ['physicalHealthImpact', 'liverDisease'],
  ['physicalHealthImpact', 'hepatitisB'],
  ['physicalHealthImpact', 'hepatitisC'],
  ['physicalHealthImpact', 'hivStatus'],
  ['physicalHealthImpact', 'overdoseHistory'],
  // Social & legal
  ['socialLegalImpact', 'employmentStatus'],
  ['socialLegalImpact', 'housingStatus'],
  ['socialLegalImpact', 'relationshipStatus'],
  ['socialLegalImpact', 'socialSupport'],
  ['socialLegalImpact', 'childrenSafeguardingConcerns'],
  ['socialLegalImpact', 'domesticViolence'],
  // Previous treatment
  ['previousTreatmentHistory', 'previousTreatment'],
  ['previousTreatmentHistory', 'previousDetox'],
  ['previousTreatmentHistory', 'previousRehab'],
  ['previousTreatmentHistory', 'previousCounselling'],
  ['previousTreatmentHistory', 'selfHelpGroups'],
  // Treatment planning
  ['treatmentPlanningGoals', 'treatmentGoal'],
  ['treatmentPlanningGoals', 'readinessToChange'],
  ['treatmentPlanningGoals', 'motivationLevel'],
  ['treatmentPlanningGoals', 'preferredTreatmentSetting']
];

// AUDIT questions are tracked separately because their default value of 0
// is a legitimate ("Never") response — once the user picks any option we
// treat them as answered. We model that by also tracking whether the user
// has opened/touched the AUDIT section. For simplicity we count an AUDIT
// question as "answered" if the score is > 0 OR if a flag has been set.
// Here we use the simpler heuristic: count the entire AUDIT section as
// 10 fields if any AUDIT score > 0 OR if all fields are present (always
// true). Use a lightweight separate counter.

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (let i = 0; i < TRACKED_FIELDS.length; i++) {
    const section = TRACKED_FIELDS[i][0];
    const field = TRACKED_FIELDS[i][1];
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    const v = state[section][field];
    if (v !== null && v !== undefined && v !== '') {
      answered++;
      sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
    }
  }
  // AUDIT (10 questions) — count as answered if score > 0
  const auditAnswered = calculateAuditScore(state.alcoholUseAudit) > 0 ? 10 : 0;
  sectionTotal['alcoholUseAudit'] = 10;
  sectionAnswered['alcoholUseAudit'] = auditAnswered;
  answered += auditAnswered;
  const total = TRACKED_FIELDS.length + 10;
  const percent = Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = answered + ' of ' + total + ' fields answered (' + percent + '%)';
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics',                title: 'Demographics' },
  { step: 2,  section: 'alcoholUseAudit',             title: 'AUDIT' },
  { step: 3,  section: 'drugUseDast',                 title: 'DAST-10' },
  { step: 4,  section: 'substanceUseHistory',         title: 'Use History' },
  { step: 5,  section: 'withdrawalAssessment',        title: 'Withdrawal' },
  { step: 6,  section: 'mentalHealthComorbidities',   title: 'Mental Health' },
  { step: 7,  section: 'physicalHealthImpact',        title: 'Physical Health' },
  { step: 8,  section: 'socialLegalImpact',           title: 'Social / Legal' },
  { step: 9,  section: 'previousTreatmentHistory',    title: 'Prior Treatment' },
  { step: 10, section: 'treatmentPlanningGoals',      title: 'Plan' }
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
    li.setAttribute('aria-label', 'Step ' + def.step + ': ' + def.title);
    li.innerHTML = '<span>' + esc(def.title) + '</span>';
    li.addEventListener('click', function () {
      const target = document.getElementById('step-' + def.step);
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
    const li = ol.querySelector('[data-step="' + def.step + '"]');
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
  const current = ol.querySelector('[data-step="' + firstUnfinished + '"]');
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
  const el = document.getElementById(id + '-error');
  if (el) el.textContent = '';
  const input = document.getElementById(id);
  if (input) input.removeAttribute('aria-invalid');
  const fs = document.getElementById(id + '-fieldset');
  if (fs) fs.removeAttribute('aria-invalid');
}

function setFieldError(id, message) {
  const el = document.getElementById(id + '-error');
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
  required.forEach(function (input) {
    let id = input.id;
    if (input.type === 'radio') id = input.name;
    if (seen.has(id)) return;
    seen.add(id);
    let value = '';
    if (input.type === 'radio') {
      const chosen = form.querySelector('input[name="' + id + '"]:checked');
      value = chosen ? chosen.value : '';
    } else {
      value = (input.value || '').trim();
    }
    if (!value) {
      const fs = document.getElementById(id + '-fieldset');
      const labelEl = form.querySelector('label[for="' + id + '"]');
      const label = (fs ? fs.querySelector('legend') : labelEl);
      const labelText = label
        ? label.textContent.replace(/\s*\*\s*$/, '').trim()
        : id;
      errors.push({ id: id, message: labelText + ' is required' });
      setFieldError(id, labelText + ' is required');
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
    errors.map(function (e) {
      return '<li><a href="#' + esc(e.id) + '">' + esc(e.message) + '</a></li>';
    }).join('') +
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

function gradeClass(grade) {
  switch (grade) {
    case 1: return 'grade-1';
    case 2: return 'grade-2';
    case 3: return 'grade-3';
    case 4: return 'grade-4';
    default: return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const r = lastResult;
  const auditCatLabel = auditRiskLabel(r.auditRiskCategory);
  const dastCatLabel = dastRiskLabel(r.dastRiskCategory);

  const flagsList = r.additionalFlags.length === 0
    ? '<p class="muted">No additional flags raised.</p>'
    : '<ul class="flags">' +
        r.additionalFlags.map(function (f) {
          return '<li class="' + priorityClass(f.priority) + '">' +
            '<span class="flag-priority">' + esc(f.priority.toUpperCase()) + '</span>' +
            '<span class="flag-category">' + esc(f.category) + '</span>' +
            '<span class="flag-message">' + esc(f.message) + '</span>' +
          '</li>';
        }).join('') +
      '</ul>';

  const ruleRows = r.firedRules.map(function (rl) {
    return '<tr>' +
      '<th scope="row">' + esc(rl.id) + '</th>' +
      '<td>' + esc(rl.category) + '</td>' +
      '<td>' + esc(rl.description) + '</td>' +
      '<td class="num"><span class="grade-badge ' + gradeClass(rl.grade) + '">' +
        esc(substanceGradeLabel(rl.grade)) + '</span></td>' +
    '</tr>';
  }).join('');

  const ruleTable = r.firedRules.length === 0
    ? '<p class="muted">No grading rules fired.</p>'
    : '<table class="subscales">' +
        '<thead><tr>' +
          '<th scope="col">ID</th>' +
          '<th scope="col">Category</th>' +
          '<th scope="col">Finding</th>' +
          '<th scope="col">Grade</th>' +
        '</tr></thead>' +
        '<tbody>' + ruleRows + '</tbody>' +
      '</table>';

  out.innerHTML =
    '<div class="report-card">' +
      '<header class="report-header">' +
        '<h2>Substance Abuse Assessment Report</h2>' +
        '<p class="muted">Generated ' + esc(new Date(r.timestamp).toLocaleString()) + '</p>' +
      '</header>' +

      '<h3>Overall Risk</h3>' +
      '<p class="risk-summary">' +
        '<span class="risk-badge ' + riskLevelClass(r.overallRisk) + '">' +
          esc(riskLevelLabel(r.overallRisk)) +
        '</span>' +
      '</p>' +

      '<h3>AUDIT (Alcohol)</h3>' +
      '<p class="score-summary">' +
        '<span class="score-badge audit-' + esc(r.auditRiskCategory) + '">' +
          r.auditScore + ' / 40' +
        '</span>' +
        '<span class="score-label">' + esc(auditCatLabel) + '</span>' +
      '</p>' +

      '<h3>DAST-10 (Drug)</h3>' +
      '<p class="score-summary">' +
        '<span class="score-badge dast-' + esc(r.dastRiskCategory) + '">' +
          r.dastScore + ' / 10' +
        '</span>' +
        '<span class="score-label">' + esc(dastCatLabel) + '</span>' +
      '</p>' +

      '<h3>Fired Rules</h3>' +
      ruleTable +

      '<h3>Flagged Issues</h3>' +
      flagsList +

      '<div class="report-actions">' +
        '<button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>' +
      '</div>' +
    '</div>';

  out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('start-over-btn').addEventListener('click', startOver);
}

function submitForm() {
  const errs = validateForm();
  if (errs.length > 0) return;
  recomputeDerived();
  lastResult = calculateSubstanceGrade(state);
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
