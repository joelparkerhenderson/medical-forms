import { calculateResponderGrade } from './responder-grader.js';
import { bmiCategory, calculateBMI, competencyClass, competencyLabel, emptyAssessment, fitnessDecisionClass, fitnessDecisionLabel, gradeClass, gradeLabel, riskLevelClass, riskLevelLabel } from './types.js';

// First Responder Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure scoring engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'first-responder-assessment.front-end-form-with-html.v1';

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
  slug: 'first-responder-assessment',
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
 * Re-runs derived values (BMI), progress, and conditional visibility.
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

/** Escape user-entered text for safe HTML rendering. */
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
    `value="${esc(value == null ? '' : value)}"`
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
  const value = state[opts.section][opts.field] || '';
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
  const current = state[opts.section][opts.field] || '';
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

const competencyOptions = [
  { value: 'not-competent', label: 'Not competent' },
  { value: 'developing', label: 'Developing' },
  { value: 'competent', label: 'Competent' },
  { value: 'expert', label: 'Expert' }
];

/** Helper: a competency-graded radio question. */
function competencyField(label, section, field) {
  return radioGroup({ label, section, field, options: competencyOptions });
}

// ----------------------------------------------------------------------
// Section renderers (1 per step — 10 total)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic responder identification details.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'demographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Date of Birth',
    section: 'demographics', field: 'dateOfBirth',
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
    title: 'Role & Qualifications',
    description: 'Current role, registration, and qualifications.'
  });

  card.appendChild(selectInput({
    label: 'Role type',
    section: 'roleQualifications', field: 'roleType',
    options: [
      { value: 'paramedic', label: 'Paramedic' },
      { value: 'advanced-paramedic', label: 'Advanced Paramedic / Critical Care' },
      { value: 'emt', label: 'EMT (Emergency Medical Technician)' },
      { value: 'first-aider', label: 'First Aider' },
      { value: 'community-responder', label: 'Community First Responder' },
      { value: 'other', label: 'Other' }
    ]
  }));
  const roleOther = document.createElement('div');
  roleOther.dataset.conditional = 'roleQualifications.roleType=other';
  roleOther.appendChild(textInput({
    label: 'Other role (please specify)',
    section: 'roleQualifications', field: 'roleTypeOther'
  }));
  card.appendChild(roleOther);

  const orgGrid = document.createElement('div');
  orgGrid.className = 'two-col';
  orgGrid.appendChild(textInput({
    label: 'Employer / organisation',
    section: 'roleQualifications', field: 'employerOrganisation'
  }));
  orgGrid.appendChild(textInput({
    label: 'Station / base',
    section: 'roleQualifications', field: 'stationBase'
  }));
  card.appendChild(orgGrid);

  card.appendChild(textInput({
    label: 'Years of service',
    section: 'roleQualifications', field: 'yearsOfService',
    type: 'number', min: 0, max: 60
  }));

  const regGrid = document.createElement('div');
  regGrid.className = 'two-col';
  regGrid.appendChild(textInput({
    label: 'Registration number',
    section: 'roleQualifications', field: 'registrationNumber'
  }));
  regGrid.appendChild(selectInput({
    label: 'Registration body',
    section: 'roleQualifications', field: 'registrationBody',
    options: [
      { value: 'hcpc', label: 'HCPC (Health and Care Professions Council)' },
      { value: 'jrcalc', label: 'JRCALC' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(regGrid);

  card.appendChild(textInput({
    label: 'Registration expiry date',
    section: 'roleQualifications', field: 'registrationExpiryDate',
    type: 'date'
  }));

  card.appendChild(selectInput({
    label: 'Highest qualification',
    section: 'roleQualifications', field: 'highestQualification',
    options: [
      { value: 'certificate', label: 'Certificate' },
      { value: 'diploma', label: 'Diploma' },
      { value: 'foundation-degree', label: 'Foundation Degree' },
      { value: 'bachelors', label: "Bachelor's degree" },
      { value: 'masters', label: "Master's degree" },
      { value: 'doctorate', label: 'Doctorate' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Qualification details',
    section: 'roleQualifications', field: 'qualificationDetails'
  }));

  card.appendChild(selectInput({
    label: 'Driving licence category',
    section: 'roleQualifications', field: 'drivingLicenceCategory',
    options: [
      { value: 'b', label: 'B (car)' },
      { value: 'c1', label: 'C1 (medium goods, up to 7.5t)' },
      { value: 'c1e', label: 'C1E (C1 + trailer)' },
      { value: 'c', label: 'C (large goods)' },
      { value: 'ce', label: 'CE (C + trailer)' },
      { value: 'none', label: 'None' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Blue light / emergency response trained?',
    section: 'roleQualifications', field: 'blueLightTrained', options: yesNo
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Physical Fitness Assessment',
    description: 'Cardiovascular, strength, manual handling, and vital signs.'
  });

  card.appendChild(competencyField('Cardiovascular fitness', 'physicalFitness', 'cardiovascularFitness'));

  const cardioGrid = document.createElement('div');
  cardioGrid.className = 'two-col';
  cardioGrid.appendChild(textInput({
    label: 'Bleep / shuttle run level achieved',
    section: 'physicalFitness', field: 'shuttleRunLevel',
    type: 'number', min: 0, max: 30, step: 0.1
  }));
  cardioGrid.appendChild(textInput({
    label: 'VO2 max',
    section: 'physicalFitness', field: 'vo2Max',
    type: 'number', min: 0, max: 90, unit: 'ml/kg/min'
  }));
  card.appendChild(cardioGrid);

  card.appendChild(competencyField('Muscular strength', 'physicalFitness', 'muscularStrength'));
  card.appendChild(textInput({
    label: 'Grip strength',
    section: 'physicalFitness', field: 'gripStrengthKg',
    type: 'number', min: 0, max: 100, unit: 'kg'
  }));

  card.appendChild(competencyField('Manual handling competency', 'physicalFitness', 'manualHandlingCompetency'));
  card.appendChild(radioGroup({
    label: 'Able to carry a patient on a stretcher (with assistance)?',
    section: 'physicalFitness', field: 'patientCarryAbility', options: yesNo
  }));
  card.appendChild(competencyField('Flexibility / mobility', 'physicalFitness', 'flexibilityMobility'));
  card.appendChild(competencyField('Balance / coordination', 'physicalFitness', 'balanceCoordination'));

  const vitalsGrid = document.createElement('div');
  vitalsGrid.className = 'three-col';
  vitalsGrid.appendChild(textInput({
    label: 'Resting heart rate',
    section: 'physicalFitness', field: 'restingHeartRateBpm',
    type: 'number', min: 30, max: 200, unit: 'bpm'
  }));
  vitalsGrid.appendChild(textInput({
    label: 'BP — Systolic',
    section: 'physicalFitness', field: 'bloodPressureSystolic',
    type: 'number', min: 60, max: 250, unit: 'mmHg'
  }));
  vitalsGrid.appendChild(textInput({
    label: 'BP — Diastolic',
    section: 'physicalFitness', field: 'bloodPressureDiastolic',
    type: 'number', min: 30, max: 150, unit: 'mmHg'
  }));
  card.appendChild(vitalsGrid);

  card.appendChild(textArea({
    label: 'Physical fitness notes',
    section: 'physicalFitness', field: 'physicalFitnessNotes',
    placeholder: 'Any relevant context, injuries, or remediation plans…',
    rows: 3
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Clinical Skills Competency',
    description: 'Resuscitation, airway, drug administration, trauma, triage.'
  });

  card.appendChild(competencyField('Basic life support (BLS)', 'clinicalSkills', 'basicLifeSupport'));
  card.appendChild(competencyField('Advanced life support (ALS)', 'clinicalSkills', 'advancedLifeSupport'));
  card.appendChild(competencyField('Airway management', 'clinicalSkills', 'airwayManagement'));
  card.appendChild(competencyField('IV cannulation', 'clinicalSkills', 'ivCannulation'));
  card.appendChild(competencyField('Drug administration', 'clinicalSkills', 'drugAdministration'));
  card.appendChild(competencyField('Trauma assessment', 'clinicalSkills', 'traumaAssessment'));
  card.appendChild(competencyField('Immobilisation / splinting', 'clinicalSkills', 'immobilisationSplinting'));
  card.appendChild(competencyField('ECG interpretation', 'clinicalSkills', 'ecgInterpretation'));
  card.appendChild(competencyField('Patient assessment (ABCDE)', 'clinicalSkills', 'patientAssessment'));
  card.appendChild(competencyField('Triage competency', 'clinicalSkills', 'triageCompetency'));
  card.appendChild(competencyField('Paediatric competency', 'clinicalSkills', 'paediatricCompetency'));
  card.appendChild(competencyField('Obstetric competency', 'clinicalSkills', 'obstetricCompetency'));

  card.appendChild(textArea({
    label: 'Clinical skills notes',
    section: 'clinicalSkills', field: 'clinicalSkillsNotes',
    placeholder: 'Strengths, gaps, or supervised practice required…',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Equipment & Vehicle Competency',
    description: 'Defibrillator, monitor, ventilator, suction, stretcher, scoop, vehicle and radio.'
  });

  card.appendChild(competencyField('Defibrillator competency', 'equipmentVehicle', 'defibrillatorCompetency'));
  card.appendChild(competencyField('Patient monitor', 'equipmentVehicle', 'monitorCompetency'));
  card.appendChild(competencyField('Ventilator', 'equipmentVehicle', 'ventilatorCompetency'));
  card.appendChild(competencyField('Suction', 'equipmentVehicle', 'suctionCompetency'));
  card.appendChild(competencyField('Stretcher / trolley', 'equipmentVehicle', 'stretcherCompetency'));
  card.appendChild(competencyField('Scoop / spinal board', 'equipmentVehicle', 'scoopCompetency'));
  card.appendChild(competencyField('Ambulance driving (routine)', 'equipmentVehicle', 'ambulanceDriving'));
  card.appendChild(competencyField('Emergency / blue-light driving', 'equipmentVehicle', 'emergencyDriving'));
  card.appendChild(radioGroup({
    label: 'Performs daily vehicle inspection?',
    section: 'equipmentVehicle', field: 'vehicleDailyInspection', options: yesNo
  }));
  card.appendChild(competencyField('Equipment check competency', 'equipmentVehicle', 'equipmentCheckCompetency'));
  card.appendChild(competencyField('Radio communications', 'equipmentVehicle', 'radioCommunications'));

  card.appendChild(textArea({
    label: 'Equipment / vehicle notes',
    section: 'equipmentVehicle', field: 'equipmentVehicleNotes',
    placeholder: 'Specific equipment training or restrictions…',
    rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Communication Skills',
    description: 'Patient and team communication, handover, documentation, safeguarding.'
  });

  card.appendChild(competencyField('Patient communication', 'communicationSkills', 'patientCommunication'));
  card.appendChild(competencyField('Communication with relatives', 'communicationSkills', 'relativeCommunication'));
  card.appendChild(competencyField('Handover competency', 'communicationSkills', 'handoverCompetency'));
  card.appendChild(competencyField('Documentation competency', 'communicationSkills', 'documentationCompetency'));
  card.appendChild(competencyField('Multidisciplinary teamwork', 'communicationSkills', 'multidisciplinaryTeamwork'));
  card.appendChild(competencyField('Conflict resolution', 'communicationSkills', 'conflictResolution'));
  card.appendChild(competencyField('Safeguarding awareness', 'communicationSkills', 'safeguardingAwareness'));
  card.appendChild(competencyField('Breaking bad news', 'communicationSkills', 'breakingBadNews'));

  card.appendChild(textArea({
    label: 'Communication notes',
    section: 'communicationSkills', field: 'communicationNotes',
    placeholder: 'Examples, feedback, training requirements…',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Psychological Readiness',
    description: 'Resilience, stress, PTSD screening, sleep, burnout, decision making.'
  });

  card.appendChild(competencyField('Stress management', 'psychologicalReadiness', 'stressManagement'));
  card.appendChild(selectInput({
    label: 'Resilience level',
    section: 'psychologicalReadiness', field: 'resilienceLevel',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'good', label: 'Good' },
      { value: 'excellent', label: 'Excellent' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'PTSD screening completed?',
    section: 'psychologicalReadiness', field: 'ptsdScreening', options: yesNo
  }));
  const ptsdResult = document.createElement('div');
  ptsdResult.dataset.conditional = 'psychologicalReadiness.ptsdScreening=yes';
  ptsdResult.appendChild(selectInput({
    label: 'PTSD screening result',
    section: 'psychologicalReadiness', field: 'ptsdScreeningResult',
    options: [
      { value: 'negative', label: 'Negative' },
      { value: 'positive', label: 'Positive' },
      { value: 'inconclusive', label: 'Inconclusive' }
    ]
  }));
  card.appendChild(ptsdResult);

  card.appendChild(radioGroup({
    label: 'Recent critical incident exposure?',
    section: 'psychologicalReadiness', field: 'criticalIncidentExposure', options: yesNo
  }));
  const incidentDetails = document.createElement('div');
  incidentDetails.dataset.conditional = 'psychologicalReadiness.criticalIncidentExposure=yes';
  incidentDetails.appendChild(textArea({
    label: 'Critical incident details',
    section: 'psychologicalReadiness', field: 'criticalIncidentDetails',
    placeholder: 'Brief description (avoid identifying patient information)…',
    rows: 3
  }));
  incidentDetails.appendChild(radioGroup({
    label: 'Was the responder formally debriefed after the incident?',
    section: 'psychologicalReadiness', field: 'criticalIncidentDebriefed', options: yesNo
  }));
  card.appendChild(incidentDetails);

  card.appendChild(selectInput({
    label: 'Sleep quality',
    section: 'psychologicalReadiness', field: 'sleepQuality',
    options: [
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' },
      { value: 'poor', label: 'Poor' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Burnout risk',
    section: 'psychologicalReadiness', field: 'burnoutRisk',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high', label: 'High' }
    ]
  }));

  card.appendChild(competencyField('Decision making under pressure', 'psychologicalReadiness', 'decisionMakingUnderPressure'));
  card.appendChild(competencyField('Emotional regulation', 'psychologicalReadiness', 'emotionalRegulation'));

  card.appendChild(textArea({
    label: 'Psychological readiness notes',
    section: 'psychologicalReadiness', field: 'psychologicalNotes',
    placeholder: 'Wellbeing supports in place, referrals made, etc.…',
    rows: 3
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Occupational Health',
    description: 'Vision, hearing, immunisation, substance misuse, MSK / respiratory / skin issues.'
  });

  card.appendChild(selectInput({
    label: 'Vision test',
    section: 'occupationalHealth', field: 'visionTest',
    options: [
      { value: 'pass', label: 'Pass' },
      { value: 'fail', label: 'Fail' },
      { value: 'refer', label: 'Refer' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Vision corrected (glasses / contacts)?',
    section: 'occupationalHealth', field: 'visionCorrected', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Hearing test',
    section: 'occupationalHealth', field: 'hearingTest',
    options: [
      { value: 'pass', label: 'Pass' },
      { value: 'fail', label: 'Fail' },
      { value: 'refer', label: 'Refer' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Hearing aid required?',
    section: 'occupationalHealth', field: 'hearingAidRequired', options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Immunisation status',
    section: 'occupationalHealth', field: 'immunisationStatus',
    options: [
      { value: 'up-to-date', label: 'Up to date' },
      { value: 'incomplete', label: 'Incomplete' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Hepatitis B immune?',
    section: 'occupationalHealth', field: 'hepatitisBImmune', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Current medications',
    section: 'occupationalHealth', field: 'currentMedications',
    placeholder: 'List medications relevant to fitness for duty…',
    rows: 3
  }));

  card.appendChild(selectInput({
    label: 'Substance misuse screen',
    section: 'occupationalHealth', field: 'substanceMisuseScreen',
    options: [
      { value: 'negative', label: 'Negative' },
      { value: 'positive', label: 'Positive' },
      { value: 'not-done', label: 'Not done' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Musculoskeletal issues?',
    section: 'occupationalHealth', field: 'musculoskeletalIssues', options: yesNo
  }));
  const mskDetails = document.createElement('div');
  mskDetails.dataset.conditional = 'occupationalHealth.musculoskeletalIssues=yes';
  mskDetails.appendChild(textArea({
    label: 'MSK details',
    section: 'occupationalHealth', field: 'musculoskeletalDetails',
    placeholder: 'Describe nature, restrictions, treatment…',
    rows: 2
  }));
  card.appendChild(mskDetails);

  card.appendChild(radioGroup({
    label: 'Respiratory issues?',
    section: 'occupationalHealth', field: 'respiratoryIssues', options: yesNo
  }));
  const respDetails = document.createElement('div');
  respDetails.dataset.conditional = 'occupationalHealth.respiratoryIssues=yes';
  respDetails.appendChild(textArea({
    label: 'Respiratory details',
    section: 'occupationalHealth', field: 'respiratoryDetails',
    placeholder: 'Describe respiratory condition and any restrictions…',
    rows: 2
  }));
  card.appendChild(respDetails);

  card.appendChild(radioGroup({
    label: 'Skin conditions affecting work (e.g. dermatitis)?',
    section: 'occupationalHealth', field: 'skinConditions', options: yesNo
  }));
  const skinDetails = document.createElement('div');
  skinDetails.dataset.conditional = 'occupationalHealth.skinConditions=yes';
  skinDetails.appendChild(textArea({
    label: 'Skin condition details',
    section: 'occupationalHealth', field: 'skinConditionDetails',
    placeholder: 'Describe condition and any glove / hygiene impact…',
    rows: 2
  }));
  card.appendChild(skinDetails);

  card.appendChild(textInput({
    label: 'Sickness absence days (last 12 months)',
    section: 'occupationalHealth', field: 'sicknessAbsenceDays',
    type: 'number', min: 0, max: 365
  }));

  card.appendChild(textArea({
    label: 'Occupational health notes',
    section: 'occupationalHealth', field: 'occupationalHealthNotes',
    placeholder: 'Additional context for the occupational health record…',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'CPD & Training Record',
    description: 'CPD hours, mandatory recertifications, mentoring, supervision, reflective practice.'
  });

  const cpdGrid = document.createElement('div');
  cpdGrid.className = 'two-col';
  cpdGrid.appendChild(textInput({
    label: 'CPD hours completed last year',
    section: 'cpdTraining', field: 'cpdHoursLastYear',
    type: 'number', min: 0, max: 1000
  }));
  cpdGrid.appendChild(textInput({
    label: 'CPD hours required',
    section: 'cpdTraining', field: 'cpdHoursRequired',
    type: 'number', min: 0, max: 1000
  }));
  card.appendChild(cpdGrid);

  card.appendChild(radioGroup({
    label: 'Mandatory training complete?',
    section: 'cpdTraining', field: 'mandatoryTrainingComplete', options: yesNo
  }));

  const recertGrid = document.createElement('div');
  recertGrid.className = 'two-col';
  recertGrid.appendChild(textInput({
    label: 'BLS recertification date',
    section: 'cpdTraining', field: 'blsRecertificationDate', type: 'date'
  }));
  recertGrid.appendChild(textInput({
    label: 'ALS recertification date',
    section: 'cpdTraining', field: 'alsRecertificationDate', type: 'date'
  }));
  recertGrid.appendChild(textInput({
    label: 'Manual handling recertification',
    section: 'cpdTraining', field: 'manualHandlingRecertificationDate', type: 'date'
  }));
  recertGrid.appendChild(textInput({
    label: 'Safeguarding training',
    section: 'cpdTraining', field: 'safeguardingTrainingDate', type: 'date'
  }));
  recertGrid.appendChild(textInput({
    label: 'Infection control training',
    section: 'cpdTraining', field: 'infectionControlTrainingDate', type: 'date'
  }));
  card.appendChild(recertGrid);

  card.appendChild(radioGroup({
    label: 'Major incident training completed?',
    section: 'cpdTraining', field: 'majorIncidentTraining', options: yesNo
  }));
  const miDate = document.createElement('div');
  miDate.dataset.conditional = 'cpdTraining.majorIncidentTraining=yes';
  miDate.appendChild(textInput({
    label: 'Major incident training date',
    section: 'cpdTraining', field: 'majorIncidentTrainingDate', type: 'date'
  }));
  card.appendChild(miDate);

  card.appendChild(competencyField('Mentoring capability', 'cpdTraining', 'mentoringCapability'));
  card.appendChild(radioGroup({
    label: 'Attends clinical supervision?',
    section: 'cpdTraining', field: 'clinicalSupervisionAttendance', options: yesNo
  }));
  card.appendChild(competencyField('Reflective practice', 'cpdTraining', 'reflectivePractice'));

  card.appendChild(textArea({
    label: 'CPD / training notes',
    section: 'cpdTraining', field: 'cpdTrainingNotes',
    placeholder: 'Outstanding training, supervisor sign-off, etc.…',
    rows: 3
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Overall Fitness Decision',
    description: 'Assessor sign-off and reassessment plan. Leave the decision blank to allow auto-derivation from rules.'
  });

  card.appendChild(selectInput({
    label: 'Overall fitness decision',
    section: 'fitnessDecision', field: 'overallFitness',
    options: [
      { value: 'fit-for-duty', label: 'Fit for Duty' },
      { value: 'fit-with-restrictions', label: 'Fit with Restrictions' },
      { value: 'temporarily-unfit', label: 'Temporarily Unfit' },
      { value: 'permanently-unfit', label: 'Permanently Unfit' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Restrictions details',
    section: 'fitnessDecision', field: 'restrictionsDetails',
    placeholder: 'Specific restricted duties or accommodations…',
    rows: 2
  }));

  card.appendChild(radioGroup({
    label: 'Reassessment required?',
    section: 'fitnessDecision', field: 'reassessmentRequired', options: yesNo
  }));
  const reassessDate = document.createElement('div');
  reassessDate.dataset.conditional = 'fitnessDecision.reassessmentRequired=yes';
  reassessDate.appendChild(textInput({
    label: 'Reassessment date',
    section: 'fitnessDecision', field: 'reassessmentDate', type: 'date'
  }));
  card.appendChild(reassessDate);

  card.appendChild(textArea({
    label: 'Remedial actions',
    section: 'fitnessDecision', field: 'remedialActions',
    placeholder: 'Training, supervision, occupational health input required…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Referrals required',
    section: 'fitnessDecision', field: 'referralsRequired',
    placeholder: 'Onward referrals (occupational health, GP, mental health…)',
    rows: 2
  }));

  const assessorGrid = document.createElement('div');
  assessorGrid.className = 'three-col';
  assessorGrid.appendChild(textInput({
    label: 'Assessor name',
    section: 'fitnessDecision', field: 'assessorName'
  }));
  assessorGrid.appendChild(textInput({
    label: 'Assessor role',
    section: 'fitnessDecision', field: 'assessorRole'
  }));
  assessorGrid.appendChild(textInput({
    label: 'Assessor registration #',
    section: 'fitnessDecision', field: 'assessorRegistration'
  }));
  card.appendChild(assessorGrid);

  card.appendChild(textInput({
    label: 'Assessment date',
    section: 'fitnessDecision', field: 'assessmentDate', type: 'date'
  }));

  const counterGrid = document.createElement('div');
  counterGrid.className = 'two-col';
  counterGrid.appendChild(textInput({
    label: 'Countersignature name',
    section: 'fitnessDecision', field: 'countersignatureName'
  }));
  counterGrid.appendChild(textInput({
    label: 'Countersignature date',
    section: 'fitnessDecision', field: 'countersignatureDate', type: 'date'
  }));
  card.appendChild(counterGrid);

  card.appendChild(textArea({
    label: 'Fitness decision notes',
    section: 'fitnessDecision', field: 'fitnessDecisionNotes',
    placeholder: 'Any remaining context for the record…',
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
    const eq = expr.split('=');
    const path = eq[0];
    const target = eq[1];
    const parts = path.split('.');
    const section = parts[0];
    const field = parts[1];
    const current = state[section] ? state[section][field] : undefined;
    host.style.display = String(current) === target ? '' : 'none';
  });
  document.querySelectorAll('[data-conditional-any]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-any');
    const eq = expr.split('=');
    const path = eq[0];
    const targetCsv = eq[1];
    const parts = path.split('.');
    const section = parts[0];
    const field = parts[1];
    const current = String((state[section] && state[section][field]) || '');
    const targets = targetCsv.split(',');
    host.style.display = targets.indexOf(current) !== -1 ? '' : 'none';
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
  // Role & qualifications
  ['roleQualifications', 'roleType'],
  ['roleQualifications', 'employerOrganisation'],
  ['roleQualifications', 'yearsOfService'],
  ['roleQualifications', 'registrationNumber'],
  ['roleQualifications', 'registrationBody'],
  ['roleQualifications', 'highestQualification'],
  ['roleQualifications', 'drivingLicenceCategory'],
  ['roleQualifications', 'blueLightTrained'],
  // Physical fitness
  ['physicalFitness', 'cardiovascularFitness'],
  ['physicalFitness', 'muscularStrength'],
  ['physicalFitness', 'manualHandlingCompetency'],
  ['physicalFitness', 'patientCarryAbility'],
  ['physicalFitness', 'flexibilityMobility'],
  ['physicalFitness', 'balanceCoordination'],
  // Clinical skills (core)
  ['clinicalSkills', 'basicLifeSupport'],
  ['clinicalSkills', 'advancedLifeSupport'],
  ['clinicalSkills', 'airwayManagement'],
  ['clinicalSkills', 'ivCannulation'],
  ['clinicalSkills', 'drugAdministration'],
  ['clinicalSkills', 'traumaAssessment'],
  ['clinicalSkills', 'immobilisationSplinting'],
  ['clinicalSkills', 'ecgInterpretation'],
  ['clinicalSkills', 'patientAssessment'],
  ['clinicalSkills', 'triageCompetency'],
  ['clinicalSkills', 'paediatricCompetency'],
  ['clinicalSkills', 'obstetricCompetency'],
  // Equipment & vehicle
  ['equipmentVehicle', 'defibrillatorCompetency'],
  ['equipmentVehicle', 'monitorCompetency'],
  ['equipmentVehicle', 'ventilatorCompetency'],
  ['equipmentVehicle', 'suctionCompetency'],
  ['equipmentVehicle', 'stretcherCompetency'],
  ['equipmentVehicle', 'scoopCompetency'],
  ['equipmentVehicle', 'ambulanceDriving'],
  ['equipmentVehicle', 'emergencyDriving'],
  ['equipmentVehicle', 'vehicleDailyInspection'],
  ['equipmentVehicle', 'equipmentCheckCompetency'],
  ['equipmentVehicle', 'radioCommunications'],
  // Communication
  ['communicationSkills', 'patientCommunication'],
  ['communicationSkills', 'relativeCommunication'],
  ['communicationSkills', 'handoverCompetency'],
  ['communicationSkills', 'documentationCompetency'],
  ['communicationSkills', 'multidisciplinaryTeamwork'],
  ['communicationSkills', 'conflictResolution'],
  ['communicationSkills', 'safeguardingAwareness'],
  ['communicationSkills', 'breakingBadNews'],
  // Psychological
  ['psychologicalReadiness', 'stressManagement'],
  ['psychologicalReadiness', 'resilienceLevel'],
  ['psychologicalReadiness', 'ptsdScreening'],
  ['psychologicalReadiness', 'criticalIncidentExposure'],
  ['psychologicalReadiness', 'sleepQuality'],
  ['psychologicalReadiness', 'burnoutRisk'],
  ['psychologicalReadiness', 'decisionMakingUnderPressure'],
  ['psychologicalReadiness', 'emotionalRegulation'],
  // Occupational health
  ['occupationalHealth', 'visionTest'],
  ['occupationalHealth', 'hearingTest'],
  ['occupationalHealth', 'immunisationStatus'],
  ['occupationalHealth', 'hepatitisBImmune'],
  ['occupationalHealth', 'substanceMisuseScreen'],
  ['occupationalHealth', 'musculoskeletalIssues'],
  ['occupationalHealth', 'respiratoryIssues'],
  ['occupationalHealth', 'skinConditions'],
  // CPD & training
  ['cpdTraining', 'cpdHoursLastYear'],
  ['cpdTraining', 'cpdHoursRequired'],
  ['cpdTraining', 'mandatoryTrainingComplete'],
  ['cpdTraining', 'majorIncidentTraining'],
  ['cpdTraining', 'mentoringCapability'],
  ['cpdTraining', 'clinicalSupervisionAttendance'],
  ['cpdTraining', 'reflectivePractice'],
  // Fitness decision
  ['fitnessDecision', 'reassessmentRequired'],
  ['fitnessDecision', 'assessorName'],
  ['fitnessDecision', 'assessmentDate']
];

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const pair of TRACKED_FIELDS) {
    const section = pair[0];
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    const v = state[section][pair[1]];
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
  { step: 2,  section: 'roleQualifications',      title: 'Role & Qualifications' },
  { step: 3,  section: 'physicalFitness',         title: 'Physical Fitness' },
  { step: 4,  section: 'clinicalSkills',          title: 'Clinical Skills' },
  { step: 5,  section: 'equipmentVehicle',        title: 'Equipment & Vehicle' },
  { step: 6,  section: 'communicationSkills',     title: 'Communication' },
  { step: 7,  section: 'psychologicalReadiness',  title: 'Psychological' },
  { step: 8,  section: 'occupationalHealth',      title: 'Occupational Health' },
  { step: 9,  section: 'cpdTraining',             title: 'CPD & Training' },
  { step: 10, section: 'fitnessDecision',         title: 'Fitness Decision' }
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
    overallCompetency, overallFitness, overallRisk,
    domainLevels, firedRules, additionalFlags, timestamp
  } = lastResult;

  // ─── Summary cards ─────────────────────────────────────────
  const summaryCards = `
    <div class="summary-grid">
      <div class="summary-card">
        <span class="summary-card-label">Overall Competency</span>
        <span class="badge badge-lg ${competencyClass(overallCompetency)}">
          ${esc(competencyLabel(overallCompetency))}
        </span>
      </div>
      <div class="summary-card">
        <span class="summary-card-label">Overall Fitness</span>
        <span class="badge badge-lg ${fitnessDecisionClass(overallFitness)}">
          ${esc(fitnessDecisionLabel(overallFitness))}
        </span>
      </div>
      <div class="summary-card">
        <span class="summary-card-label">Overall Risk</span>
        <span class="badge badge-lg ${riskLevelClass(overallRisk)}">
          ${esc(riskLevelLabel(overallRisk))}
        </span>
      </div>
    </div>
  `;

  // ─── Domain table ──────────────────────────────────────────
  const domainRows = [
    ['Physical Fitness', domainLevels.physicalFitness],
    ['Clinical Skills', domainLevels.clinicalSkills],
    ['Equipment & Vehicle', domainLevels.equipmentVehicle],
    ['Communication', domainLevels.communication],
    ['Psychological', domainLevels.psychological]
  ].map((row) => `
    <tr>
      <th scope="row">${esc(row[0])}</th>
      <td><span class="badge ${competencyClass(row[1])}">${esc(competencyLabel(row[1]))}</span></td>
    </tr>
  `).join('');

  const domainTable = `
    <table class="domains">
      <thead>
        <tr>
          <th scope="col">Domain</th>
          <th scope="col">Level</th>
        </tr>
      </thead>
      <tbody>${domainRows}</tbody>
    </table>
  `;

  // ─── Fired rules ───────────────────────────────────────────
  const firedRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.domain)}</td>
      <td>${esc(r.description)}</td>
      <td><span class="badge ${gradeClass(r.grade)}">${esc(gradeLabel(r.grade))}</span></td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No rules fired — no significant findings detected.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Domain</th>
            <th scope="col">Description</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  // ─── Flags ─────────────────────────────────────────────────
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

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>First Responder Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Summary</h3>
      ${summaryCards}

      <h3>Domain Competency Levels</h3>
      ${domainTable}

      <h3>Fired Rules (${firedRules.length})</h3>
      ${firedTable}

      <h3>Flagged Issues (${additionalFlags.length})</h3>
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
  lastResult = calculateResponderGrade(state);
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
