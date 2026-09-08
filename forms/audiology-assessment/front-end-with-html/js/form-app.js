import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateHearingGrade } from './hearing-grader.js';
import { emptyAssessment, hearingGradeClass, hearingGradeLabel } from './types.js';

// Audiology Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure WHO hearing-grade scoring engine and renders an inline
// report. State is persisted to localStorage so a partial fill survives a
// page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'audiology-assessment.front-end-form-with-html.v1';

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

let state = loadState();
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'audiology-assessment',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const report = document.getElementById('report');
    if (report) report.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    updateConditionalSections();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
}

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

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

function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const cls = (type === 'number') ? 'number-input'
    : (type === 'date') ? 'date-input'
    : (type === 'email') ? 'email-input'
    : (type === 'tel') ? 'tel-input'
    : (type === 'url') ? 'url-input'
    : (type === 'time') ? 'time-input'
    : 'text-input';
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${cls}"`,
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
    <label class="label" for="${id}">${labelText}</label>
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
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      aria-describedby="${id}-error"${requiredAttr}
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
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${requiredAttr}>
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

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = `${groupId}-error`;
  errSpan.setAttribute('aria-live', 'polite');
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
    `<span class="section-step">Section ${opts.stepNumber} of 9</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

function subgroupHeading(text) {
  const h = document.createElement('h3');
  h.className = 'subgroup-heading';
  h.textContent = text;
  return h;
}

// ----------------------------------------------------------------------
// Section renderers (one per audiology step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const earOptions = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'both', label: 'Both' }
];

const severityOptions = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' }
];

const impactOptions = severityOptions;

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
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Chief Complaint',
    description: 'Primary hearing concern and symptoms.'
  });
  card.appendChild(textArea({
    label: 'What is your primary hearing concern?',
    section: 'chiefComplaint', field: 'primaryConcern',
    placeholder: 'Describe your main hearing difficulty...'
  }));
  card.appendChild(radioGroup({
    label: 'Which ear is affected?',
    section: 'chiefComplaint', field: 'affectedEar',
    options: earOptions
  }));
  card.appendChild(radioGroup({
    label: 'How did the hearing difficulty start?',
    section: 'chiefComplaint', field: 'onset',
    options: [
      { value: 'sudden', label: 'Sudden' },
      { value: 'gradual', label: 'Gradual' }
    ]
  }));
  card.appendChild(textInput({
    label: 'How long have you had this hearing concern?',
    section: 'chiefComplaint', field: 'duration',
    placeholder: 'e.g., 6 months, 2 years'
  }));
  card.appendChild(selectInput({
    label: 'Has the hearing difficulty changed over time?',
    section: 'chiefComplaint', field: 'progression',
    options: [
      { value: 'stable', label: 'Stable - no change' },
      { value: 'worsening', label: 'Worsening - getting worse' },
      { value: 'fluctuating', label: 'Fluctuating - comes and goes' },
      { value: 'improving', label: 'Improving - getting better' }
    ]
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Hearing History',
    description: 'Previous hearing issues and noise exposure.'
  });
  card.appendChild(radioGroup({
    label: 'Have you been exposed to loud noise?',
    section: 'hearingHistory', field: 'noiseExposure', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Occupational noise exposure (e.g., factory, construction, military)?',
    section: 'hearingHistory', field: 'occupationalNoise', options: yesNo
  }));
  const occHost = document.createElement('div');
  occHost.dataset.conditional = 'hearingHistory.occupationalNoise=yes';
  occHost.appendChild(textInput({
    label: 'Please describe',
    section: 'hearingHistory', field: 'occupationalNoiseDetails'
  }));
  card.appendChild(occHost);

  card.appendChild(radioGroup({
    label: 'Recreational noise exposure (e.g., concerts, headphones, shooting)?',
    section: 'hearingHistory', field: 'recreationalNoise', options: yesNo
  }));
  const recHost = document.createElement('div');
  recHost.dataset.conditional = 'hearingHistory.recreationalNoise=yes';
  recHost.appendChild(textInput({
    label: 'Please describe',
    section: 'hearingHistory', field: 'recreationalNoiseDetails'
  }));
  card.appendChild(recHost);

  card.appendChild(radioGroup({
    label: 'Have you had previous hearing tests?',
    section: 'hearingHistory', field: 'previousHearingTests', options: yesNo
  }));
  const prevHost = document.createElement('div');
  prevHost.dataset.conditional = 'hearingHistory.previousHearingTests=yes';
  prevHost.appendChild(textArea({
    label: 'Describe previous test results',
    section: 'hearingHistory', field: 'previousTestDetails'
  }));
  card.appendChild(prevHost);

  card.appendChild(radioGroup({
    label: 'Do you currently use hearing aids?',
    section: 'hearingHistory', field: 'hearingAidUse', options: yesNo
  }));
  const aidHost = document.createElement('div');
  aidHost.dataset.conditional = 'hearingHistory.hearingAidUse=yes';
  aidHost.appendChild(textInput({
    label: 'Hearing aid details (make, model, duration of use)',
    section: 'hearingHistory', field: 'hearingAidDetails'
  }));
  card.appendChild(aidHost);

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Audiometric Results',
    description: 'Pure tone audiometry, speech audiometry, and conduction thresholds. Leave blank if unknown.'
  });

  card.appendChild(subgroupHeading('Pure Tone Averages (PTA)'));
  const pta = document.createElement('div');
  pta.className = 'two-col';
  pta.appendChild(textInput({
    label: 'PTA Right Ear', section: 'audiometricResults', field: 'pureToneAverageRight',
    type: 'number', min: 0, max: 120, unit: 'dB HL'
  }));
  pta.appendChild(textInput({
    label: 'PTA Left Ear', section: 'audiometricResults', field: 'pureToneAverageLeft',
    type: 'number', min: 0, max: 120, unit: 'dB HL'
  }));
  card.appendChild(pta);

  card.appendChild(subgroupHeading('Air Conduction Thresholds'));
  const ac = document.createElement('div');
  ac.className = 'two-col';
  ac.appendChild(textInput({
    label: 'Air Conduction Right (e.g., 250:20, 500:25, 1k:30, 2k:35, 4k:40, 8k:45)',
    section: 'audiometricResults', field: 'airConductionRight',
    placeholder: 'frequency:dB pairs'
  }));
  ac.appendChild(textInput({
    label: 'Air Conduction Left',
    section: 'audiometricResults', field: 'airConductionLeft',
    placeholder: 'frequency:dB pairs'
  }));
  card.appendChild(ac);

  card.appendChild(subgroupHeading('Bone Conduction Thresholds'));
  const bc = document.createElement('div');
  bc.className = 'two-col';
  bc.appendChild(textInput({
    label: 'Bone Conduction Right',
    section: 'audiometricResults', field: 'boneConductionRight',
    placeholder: 'frequency:dB pairs'
  }));
  bc.appendChild(textInput({
    label: 'Bone Conduction Left',
    section: 'audiometricResults', field: 'boneConductionLeft',
    placeholder: 'frequency:dB pairs'
  }));
  card.appendChild(bc);

  card.appendChild(subgroupHeading('Air-Bone Gap'));
  const abg = document.createElement('div');
  abg.className = 'two-col';
  abg.appendChild(textInput({
    label: 'Air-Bone Gap Right', section: 'audiometricResults', field: 'airBoneGapRight',
    type: 'number', min: 0, max: 80, unit: 'dB'
  }));
  abg.appendChild(textInput({
    label: 'Air-Bone Gap Left', section: 'audiometricResults', field: 'airBoneGapLeft',
    type: 'number', min: 0, max: 80, unit: 'dB'
  }));
  card.appendChild(abg);

  card.appendChild(subgroupHeading('Speech Audiometry'));
  const srt = document.createElement('div');
  srt.className = 'two-col';
  srt.appendChild(textInput({
    label: 'Speech Recognition Threshold Right',
    section: 'audiometricResults', field: 'speechRecognitionThresholdRight',
    type: 'number', min: 0, max: 120, unit: 'dB HL'
  }));
  srt.appendChild(textInput({
    label: 'Speech Recognition Threshold Left',
    section: 'audiometricResults', field: 'speechRecognitionThresholdLeft',
    type: 'number', min: 0, max: 120, unit: 'dB HL'
  }));
  card.appendChild(srt);

  const wrs = document.createElement('div');
  wrs.className = 'two-col';
  wrs.appendChild(textInput({
    label: 'Word Recognition Score Right',
    section: 'audiometricResults', field: 'wordRecognitionScoreRight',
    type: 'number', min: 0, max: 100, unit: '%'
  }));
  wrs.appendChild(textInput({
    label: 'Word Recognition Score Left',
    section: 'audiometricResults', field: 'wordRecognitionScoreLeft',
    type: 'number', min: 0, max: 100, unit: '%'
  }));
  card.appendChild(wrs);

  card.appendChild(selectInput({
    label: 'Type of Hearing Loss',
    section: 'audiometricResults', field: 'hearingLossType',
    options: [
      { value: 'conductive', label: 'Conductive' },
      { value: 'sensorineural', label: 'Sensorineural' },
      { value: 'mixed', label: 'Mixed' }
    ]
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Tinnitus Assessment',
    description: 'Ringing, buzzing, or other sounds in the ears.'
  });

  card.appendChild(radioGroup({
    label: 'Do you experience tinnitus (ringing, buzzing, or other sounds in your ears)?',
    section: 'tinnitusAssessment', field: 'presence', options: yesNo
  }));

  const tinDetails = document.createElement('div');
  tinDetails.dataset.conditional = 'tinnitusAssessment.presence=yes';
  tinDetails.appendChild(radioGroup({
    label: 'Which ear is affected?',
    section: 'tinnitusAssessment', field: 'affectedEar', options: earOptions
  }));
  tinDetails.appendChild(selectInput({
    label: 'What does the tinnitus sound like?',
    section: 'tinnitusAssessment', field: 'character',
    options: [
      { value: 'ringing', label: 'Ringing' },
      { value: 'buzzing', label: 'Buzzing' },
      { value: 'hissing', label: 'Hissing' },
      { value: 'pulsatile', label: 'Pulsatile (heartbeat-like)' },
      { value: 'clicking', label: 'Clicking' },
      { value: 'roaring', label: 'Roaring' },
      { value: 'other', label: 'Other' }
    ]
  }));
  tinDetails.appendChild(radioGroup({
    label: 'How severe is the tinnitus?',
    section: 'tinnitusAssessment', field: 'severity', options: severityOptions
  }));
  tinDetails.appendChild(textInput({
    label: 'How long have you had tinnitus?',
    section: 'tinnitusAssessment', field: 'duration',
    placeholder: 'e.g., 3 months, 5 years'
  }));
  tinDetails.appendChild(radioGroup({
    label: 'How much does tinnitus impact your daily life?',
    section: 'tinnitusAssessment', field: 'impactOnDailyLife',
    options: [
      { value: 'mild', label: 'Mild - barely noticeable' },
      { value: 'moderate', label: 'Moderate - noticeable but manageable' },
      { value: 'severe', label: 'Severe - significantly affects daily activities' }
    ]
  }));
  tinDetails.appendChild(textInput({
    label: 'Tinnitus Handicap Inventory (THI) Score',
    section: 'tinnitusAssessment', field: 'tinnitusHandicapInventoryScore',
    type: 'number', min: 0, max: 100, unit: '0-100'
  }));
  card.appendChild(tinDetails);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Vestibular Symptoms',
    description: 'Balance, vertigo, and dizziness.'
  });

  card.appendChild(radioGroup({
    label: 'Do you experience vertigo (a spinning sensation)?',
    section: 'vestibularSymptoms', field: 'vertigo', options: yesNo
  }));
  const vertigoHost = document.createElement('div');
  vertigoHost.dataset.conditional = 'vestibularSymptoms.vertigo=yes';
  vertigoHost.appendChild(textArea({
    label: 'Describe the vertigo episodes',
    section: 'vestibularSymptoms', field: 'vertigoDetails',
    placeholder: 'Frequency, duration, triggers...'
  }));
  card.appendChild(vertigoHost);

  card.appendChild(radioGroup({
    label: 'Do you experience dizziness?',
    section: 'vestibularSymptoms', field: 'dizziness', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you have balance problems?',
    section: 'vestibularSymptoms', field: 'balanceProblems', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Dix-Hallpike test positive?',
    section: 'vestibularSymptoms', field: 'dixHallpike', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Nystagmus observed?',
    section: 'vestibularSymptoms', field: 'nystagmus', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Have you had any falls?',
    section: 'vestibularSymptoms', field: 'fallsHistory', options: yesNo
  }));
  const fallsHost = document.createElement('div');
  fallsHost.dataset.conditional = 'vestibularSymptoms.fallsHistory=yes';
  fallsHost.appendChild(textInput({
    label: 'How often do falls occur?',
    section: 'vestibularSymptoms', field: 'fallsFrequency',
    placeholder: 'e.g., weekly, monthly'
  }));
  card.appendChild(fallsHost);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Otoscopic Findings',
    description: 'External and middle ear examination.'
  });

  const canalOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'narrowed', label: 'Narrowed' },
    { value: 'inflamed', label: 'Inflamed' },
    { value: 'exostosis', label: 'Exostosis' },
    { value: 'other', label: 'Other' }
  ];
  const tmOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'retracted', label: 'Retracted' },
    { value: 'perforated', label: 'Perforated' },
    { value: 'scarred', label: 'Scarred' },
    { value: 'effusion', label: 'Effusion visible' },
    { value: 'other', label: 'Other' }
  ];

  card.appendChild(subgroupHeading('Ear Canal'));
  const canal = document.createElement('div');
  canal.className = 'two-col';
  canal.appendChild(selectInput({
    label: 'Right Ear Canal',
    section: 'otoscopicFindings', field: 'earCanalRight', options: canalOptions
  }));
  canal.appendChild(selectInput({
    label: 'Left Ear Canal',
    section: 'otoscopicFindings', field: 'earCanalLeft', options: canalOptions
  }));
  card.appendChild(canal);

  card.appendChild(subgroupHeading('Tympanic Membrane'));
  const tm = document.createElement('div');
  tm.className = 'two-col';
  tm.appendChild(selectInput({
    label: 'Right Tympanic Membrane',
    section: 'otoscopicFindings', field: 'tympanicMembraneRight', options: tmOptions
  }));
  tm.appendChild(selectInput({
    label: 'Left Tympanic Membrane',
    section: 'otoscopicFindings', field: 'tympanicMembraneLeft', options: tmOptions
  }));
  card.appendChild(tm);

  card.appendChild(subgroupHeading('Middle Ear'));
  const me = document.createElement('div');
  me.className = 'two-col';
  me.appendChild(textInput({
    label: 'Right Middle Ear Findings',
    section: 'otoscopicFindings', field: 'middleEarRight',
    placeholder: 'e.g., normal, effusion'
  }));
  me.appendChild(textInput({
    label: 'Left Middle Ear Findings',
    section: 'otoscopicFindings', field: 'middleEarLeft',
    placeholder: 'e.g., normal, effusion'
  }));
  card.appendChild(me);

  card.appendChild(subgroupHeading('Ear Wax'));
  const wax = document.createElement('div');
  wax.className = 'two-col';
  wax.appendChild(radioGroup({
    label: 'Ear wax present (Right)?',
    section: 'otoscopicFindings', field: 'earWaxRight', options: yesNo
  }));
  wax.appendChild(radioGroup({
    label: 'Ear wax present (Left)?',
    section: 'otoscopicFindings', field: 'earWaxLeft', options: yesNo
  }));
  card.appendChild(wax);

  card.appendChild(subgroupHeading('Discharge'));
  const disc = document.createElement('div');
  disc.className = 'two-col';
  disc.appendChild(radioGroup({
    label: 'Discharge present (Right)?',
    section: 'otoscopicFindings', field: 'dischargeRight', options: yesNo
  }));
  disc.appendChild(radioGroup({
    label: 'Discharge present (Left)?',
    section: 'otoscopicFindings', field: 'dischargeLeft', options: yesNo
  }));
  card.appendChild(disc);

  card.appendChild(radioGroup({
    label: 'Previous ear surgery?',
    section: 'otoscopicFindings', field: 'previousSurgery', options: yesNo
  }));
  const surgHost = document.createElement('div');
  surgHost.dataset.conditional = 'otoscopicFindings.previousSurgery=yes';
  surgHost.appendChild(textInput({
    label: 'Surgery details',
    section: 'otoscopicFindings', field: 'previousSurgeryDetails'
  }));
  card.appendChild(surgHost);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Medical History',
    description: 'Conditions and medications affecting hearing.'
  });

  card.appendChild(radioGroup({
    label: 'Are you taking any ototoxic medications (e.g., aminoglycosides, cisplatin, loop diuretics, aspirin)?',
    section: 'medicalHistory', field: 'ototoxicMedications', options: yesNo
  }));
  const ototoxicHost = document.createElement('div');
  ototoxicHost.dataset.conditional = 'medicalHistory.ototoxicMedications=yes';
  ototoxicHost.appendChild(textInput({
    label: 'Please list the medications',
    section: 'medicalHistory', field: 'ototoxicMedicationDetails'
  }));
  card.appendChild(ototoxicHost);

  card.appendChild(radioGroup({
    label: 'Do you have an autoimmune condition?',
    section: 'medicalHistory', field: 'autoimmune', options: yesNo
  }));
  const autoHost = document.createElement('div');
  autoHost.dataset.conditional = 'medicalHistory.autoimmune=yes';
  autoHost.appendChild(textInput({
    label: 'Please specify',
    section: 'medicalHistory', field: 'autoimmuneDetails'
  }));
  card.appendChild(autoHost);

  card.appendChild(radioGroup({
    label: "Have you been diagnosed with Meniere's disease?",
    section: 'medicalHistory', field: 'menieres', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have you been diagnosed with otosclerosis?',
    section: 'medicalHistory', field: 'otosclerosis', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have you been diagnosed with an acoustic neuroma (vestibular schwannoma)?',
    section: 'medicalHistory', field: 'acousticNeuroma', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Have you had ear infections?',
    section: 'medicalHistory', field: 'infections', options: yesNo
  }));
  const infHost = document.createElement('div');
  infHost.dataset.conditional = 'medicalHistory.infections=yes';
  infHost.appendChild(textArea({
    label: 'Please describe (frequency, type, treatment)',
    section: 'medicalHistory', field: 'infectionDetails'
  }));
  card.appendChild(infHost);

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Functional & Communication',
    description: 'Daily life impact, hearing aid candidacy, and assistive devices.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have communication difficulties?',
    section: 'functionalCommunication', field: 'communicationDifficulties', options: yesNo
  }));
  const commHost = document.createElement('div');
  commHost.dataset.conditional = 'functionalCommunication.communicationDifficulties=yes';
  commHost.appendChild(textArea({
    label: 'Please describe your communication difficulties',
    section: 'functionalCommunication', field: 'communicationDetails',
    placeholder: 'e.g., difficulty in noisy environments, phone conversations...'
  }));
  card.appendChild(commHost);

  card.appendChild(radioGroup({
    label: 'Are you a candidate for hearing aids?',
    section: 'functionalCommunication', field: 'hearingAidCandidacy', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Do you need assistive listening devices?',
    section: 'functionalCommunication', field: 'assistiveDeviceNeeds', options: yesNo
  }));
  const assistHost = document.createElement('div');
  assistHost.dataset.conditional = 'functionalCommunication.assistiveDeviceNeeds=yes';
  assistHost.appendChild(textInput({
    label: 'What assistive devices are needed?',
    section: 'functionalCommunication', field: 'assistiveDeviceDetails',
    placeholder: 'e.g., amplified phone, TV streamer, alerting devices'
  }));
  card.appendChild(assistHost);

  card.appendChild(selectInput({
    label: 'Impact on work',
    section: 'functionalCommunication', field: 'workImpact',
    options: impactOptions
  }));
  card.appendChild(selectInput({
    label: 'Impact on social life',
    section: 'functionalCommunication', field: 'socialImpact',
    options: impactOptions
  }));
  card.appendChild(textInput({
    label: 'Hearing Handicap Inventory for the Elderly (HHIE) Score',
    section: 'functionalCommunication', field: 'hhieScore',
    type: 'number', min: 0, max: 100, unit: '0-100'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const eq = expr.indexOf('=');
    const path = expr.slice(0, eq);
    const target = expr.slice(eq + 1);
    const dot = path.indexOf('.');
    const section = path.slice(0, dot);
    const field = path.slice(dot + 1);
    const current = state[section] ? state[section][field] : undefined;
    host.style.display = String(current) === target ? '' : 'none';
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
  // Chief complaint
  ['chiefComplaint', 'primaryConcern'],
  ['chiefComplaint', 'affectedEar'],
  ['chiefComplaint', 'onset'],
  ['chiefComplaint', 'duration'],
  ['chiefComplaint', 'progression'],
  // Hearing history
  ['hearingHistory', 'noiseExposure'],
  ['hearingHistory', 'occupationalNoise'],
  ['hearingHistory', 'recreationalNoise'],
  ['hearingHistory', 'previousHearingTests'],
  ['hearingHistory', 'hearingAidUse'],
  // Audiometric (PTA only — other audiometric inputs are optional)
  ['audiometricResults', 'pureToneAverageRight'],
  ['audiometricResults', 'pureToneAverageLeft'],
  ['audiometricResults', 'hearingLossType'],
  // Tinnitus
  ['tinnitusAssessment', 'presence'],
  // Vestibular
  ['vestibularSymptoms', 'vertigo'],
  ['vestibularSymptoms', 'dizziness'],
  ['vestibularSymptoms', 'balanceProblems'],
  ['vestibularSymptoms', 'dixHallpike'],
  ['vestibularSymptoms', 'nystagmus'],
  ['vestibularSymptoms', 'fallsHistory'],
  // Otoscopic
  ['otoscopicFindings', 'earCanalRight'],
  ['otoscopicFindings', 'earCanalLeft'],
  ['otoscopicFindings', 'tympanicMembraneRight'],
  ['otoscopicFindings', 'tympanicMembraneLeft'],
  ['otoscopicFindings', 'earWaxRight'],
  ['otoscopicFindings', 'earWaxLeft'],
  ['otoscopicFindings', 'dischargeRight'],
  ['otoscopicFindings', 'dischargeLeft'],
  ['otoscopicFindings', 'previousSurgery'],
  // Medical history
  ['medicalHistory', 'ototoxicMedications'],
  ['medicalHistory', 'autoimmune'],
  ['medicalHistory', 'menieres'],
  ['medicalHistory', 'otosclerosis'],
  ['medicalHistory', 'acousticNeuroma'],
  ['medicalHistory', 'infections'],
  // Functional
  ['functionalCommunication', 'communicationDifficulties'],
  ['functionalCommunication', 'hearingAidCandidacy'],
  ['functionalCommunication', 'assistiveDeviceNeeds'],
  ['functionalCommunication', 'workImpact'],
  ['functionalCommunication', 'socialImpact']
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

// ----------------------------------------------------------------------
// Step-list + validation (Lily)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'demographics', title: 'Demographics' },
  { step: 2, section: 'chiefComplaint', title: 'Chief Complaint' },
  { step: 3, section: 'hearingHistory', title: 'Hearing History' },
  { step: 4, section: 'audiometricResults', title: 'Audiometric Results' },
  { step: 5, section: 'tinnitusAssessment', title: 'Tinnitus Assessment' },
  { step: 6, section: 'vestibularSymptoms', title: 'Vestibular Symptoms' },
  { step: 7, section: 'otoscopicFindings', title: 'Otoscopic Findings' },
  { step: 8, section: 'medicalHistory', title: 'Medical History' },
  { step: 9, section: 'functionalCommunication', title: 'Functional & Communication' }
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
    li.addEventListener('click', () => {
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
  const seenGroups = new Set();
  required.forEach((input) => {
    const id = input.id;
    if (input.type === 'radio') {
      const groupName = input.name;
      if (seenGroups.has(groupName)) return;
      seenGroups.add(groupName);
      const checked = form.querySelector('input[name="' + groupName + '"]:checked');
      const fsEl = document.getElementById(groupName + '-fieldset');
      const labelEl = fsEl ? fsEl.querySelector('legend') : null;
      const label = labelEl ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim() : groupName;
      if (!checked) {
        errors.push({ id: groupName, message: label + ' is required' });
        setFieldError(groupName, label + ' is required');
      } else {
        clearFieldError(groupName);
      }
      return;
    }
    const value = (input.value || '').trim();
    const labelEl = form.querySelector('label[for="' + id + '"]');
    const label = labelEl ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim() : id;
    if (!value) {
      errors.push({ id: id, message: label + ' is required' });
      setFieldError(id, label + ' is required');
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
      '<li><a href="#' + esc(e.id) + '">' + esc(e.message) + '</a></li>'
    ).join('') +
    '</ul>';
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (typeof summary.focus === 'function') {
    summary.setAttribute('tabindex', '-1');
    summary.focus({ preventScroll: true });
  }
}

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

  const { hearingGrade, firedRules, additionalFlags, ptaGrade, rightGrade, leftGrade, timestamp } = lastResult;

  const flagsHtml = additionalFlags.length === 0
    ? '<p class="muted">No additional flags raised.</p>'
    : (
      '<ul class="flags">' +
      additionalFlags.map((f) =>
        '<li class="' + priorityClass(f.priority) + '">' +
          '<span class="flag-priority">' + esc(f.priority.toUpperCase()) + '</span>' +
          '<span class="flag-category">' + esc(f.category) + '</span>' +
          '<span class="flag-message">' + esc(f.message) + '</span>' +
        '</li>'
      ).join('') +
      '</ul>'
    );

  const firedRows = firedRules.map((r) =>
    '<tr>' +
      '<th scope="row">' + esc(r.id) + '</th>' +
      '<td>' + esc(r.system) + '</td>' +
      '<td>' + esc(r.description) + '</td>' +
      '<td class="grade-cell">' + esc(r.grade) + '</td>' +
    '</tr>'
  ).join('');

  const firedTable = firedRules.length === 0
    ? '<p class="muted">No grading rules fired.</p>'
    : (
      '<table class="subscales">' +
        '<thead><tr>' +
          '<th scope="col">ID</th>' +
          '<th scope="col">System</th>' +
          '<th scope="col">Description</th>' +
          '<th scope="col">Grade</th>' +
        '</tr></thead>' +
        '<tbody>' + firedRows + '</tbody>' +
      '</table>'
    );

  out.innerHTML =
    '<div class="report-card">' +
      '<header class="report-header">' +
        '<h2>Audiology Assessment Report</h2>' +
        '<p class="muted">Generated ' + esc(new Date(timestamp).toLocaleString()) + '</p>' +
      '</header>' +

      '<h3>Hearing Grade (WHO classification)</h3>' +
      '<p class="grade-summary">' +
        '<span class="grade-badge ' + hearingGradeClass(hearingGrade) + '">' + esc(hearingGrade) + '</span>' +
        '<span class="grade-detail">' + esc(hearingGradeLabel(hearingGrade)) + '</span>' +
      '</p>' +
      '<p class="muted">Per-ear PTA grades: right = ' + esc(rightGrade) +
        ', left = ' + esc(leftGrade) + ' (combined PTA grade: ' + esc(ptaGrade) + ').</p>' +

      '<h3>Fired grading rules</h3>' +
      firedTable +

      '<h3>Flagged Issues</h3>' +
      flagsHtml +

      '<div class="report-actions">' +
        '<button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>' +
      '</div>' +
    '</div>';

  out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const btn = document.getElementById('start-over-btn');
  if (btn) btn.addEventListener('click', startOver);
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const grading = calculateHearingGrade(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    hearingGrade: grading.hearingGrade,
    firedRules: grading.firedRules,
    ptaGrade: grading.ptaGrade,
    rightGrade: grading.rightGrade,
    leftGrade: grading.leftGrade,
    additionalFlags: additionalFlags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh assessment?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const report = document.getElementById('report');
  if (report) report.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
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
