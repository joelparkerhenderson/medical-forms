import { calculateHealthScreening } from './composite-grader.js';
import {
  RISK_BAND_LABELS,
  PARQ_CLEARANCE_LABELS,
  AUDIT_C_BAND_LABELS,
  RECOMMENDATION_LABELS,
  emptyQuestionnaire,
  labelFor
} from './types.js';

// Health Screening Questionnaire — assessor wizard (vanilla JS, native ES
// modules).
//
// Single-page continuous wizard: all 14 sections are rendered into the page
// in document order (step 10 is hidden unless the screening purpose is
// occupational pre-placement). The user scrolls through them; the top-of-page
// progress summary reflects how many tracked fields have been answered.
// Submission runs the pure grading engine and renders an inline report. State
// is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'health-screening-questionnaire.front-end-with-html.v1';
const TOTAL_STEPS = 14;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyQuestionnaire();

  for (const key of Object.keys(fresh)) {
    const v = parsed && parsed[key];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      fresh[key] = { ...fresh[key], ...v };
    } else if (key === 'status' && typeof v === 'string') {
      fresh.status = v;
    }
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyQuestionnaire();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse the saved questionnaire; starting fresh.', e);
    return emptyQuestionnaire();
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save the questionnaire to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear the stored questionnaire.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

let state = loadState();
/** @type {ReturnType<typeof calculateHealthScreening> & {timestamp:string} | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'health-screening-questionnaire',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the health screening report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateDerived();
    updateProgress();
    updateConditionalSections();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateDerived();
  updateProgress();
  updateConditionalSections();
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
// Component builders (Lily HTML headless class contract)
// ----------------------------------------------------------------------

function lilyInputClass(type) {
  switch (type) {
    case 'email':  return 'email-input';
    case 'number': return 'number-input';
    case 'date':   return 'date-input';
    case 'time':   return 'time-input';
    case 'tel':    return 'tel-input';
    default:       return 'text-input';
  }
}

function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const labelText = esc(opts.label) + (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
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
  if (opts.readonly) attrs.push('readonly');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;
  const input = wrapper.querySelector('input');
  input.setAttribute('aria-describedby', `${id}-error`);
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
  const labelText = esc(opts.label) + (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.required ? 'data-required' : ''}
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      aria-describedby="${id}-error"
      class="text-area-input">${esc(value)}</textarea>
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
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
  const labelText = esc(opts.label) + (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const optionsHtml = [
    '<option value="">— Select —</option>',
    ...opts.options.map((o) => `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`)
  ].join('');
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select"${opts.required ? ' data-required' : ''} aria-describedby="${id}-error">
      ${optionsHtml}
    </select>
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => {
    const raw = sel.value;
    setField(opts.section, opts.field, opts.numeric ? (raw === '' ? null : Number(raw)) : raw);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Yes / no radio group. The stored value is the string 'yes' or 'no' (or ''
 * when unanswered) so it round-trips to the SQL CHECK constraints without a
 * boolean-to-enum translation layer.
 */
function yesNo(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const choices = opts.options || [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <span class="label" id="${id}-label">${esc(opts.label)}</span>
    <div class="radio-group" role="radiogroup" aria-labelledby="${id}-label" aria-describedby="${id}-error">
      ${choices.map((c) => `
        <span class="radio-option">
          <input type="radio" class="radio-input" id="${id}-${esc(c.value)}"
                 name="${id}" value="${esc(c.value)}"${c.value === current ? ' checked' : ''}>
          <label for="${id}-${esc(c.value)}">${esc(c.label)}</label>
        </span>
      `).join('')}
    </div>
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;
  wrapper.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) {
        setField(opts.section, opts.field, input.value);
        clearFieldError(id);
      }
    });
  });
  return wrapper;
}

function sectionCard(opts) {
  const card = document.createElement('fieldset');
  card.className = 'fieldset';
  card.dataset.step = String(opts.stepNumber);
  card.id = `step-${opts.stepNumber}`;
  if (opts.conditional) card.dataset.conditional = opts.conditional;
  const desc = opts.description ? `<span class="section-description">${esc(opts.description)}</span>` : '';
  const legend = document.createElement('legend');
  legend.className = 'fieldset-legend';
  legend.innerHTML = `
    <span class="section-step">Step ${opts.stepNumber} of ${TOTAL_STEPS}</span>
    <h2 class="section-title">${esc(opts.title)}</h2>
    ${desc}
  `;
  card.appendChild(legend);
  return card;
}

function subHead(text) {
  const h = document.createElement('h3');
  h.textContent = text;
  return h;
}

function grid(cols, children) {
  const div = document.createElement('div');
  div.className = `field-grid ${cols}`;
  children.forEach((c) => div.appendChild(c));
  return div;
}

// ----------------------------------------------------------------------
// Option lists
// ----------------------------------------------------------------------

const OPTIONS = {
  sex: [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'intersex', label: 'Intersex' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ],
  identifierType: [
    { value: 'nhs-number', label: 'NHS number' },
    { value: 'employee-number', label: 'Employee number' },
    { value: 'other', label: 'Other' }
  ],
  assessorRole: [
    { value: 'occupational-health-nurse', label: 'Occupational health nurse' },
    { value: 'general-practitioner', label: 'General practitioner' },
    { value: 'practice-nurse', label: 'Practice nurse' },
    { value: 'physiotherapist', label: 'Physiotherapist' },
    { value: 'personal-trainer', label: 'Personal trainer' },
    { value: 'gym-instructor', label: 'Gym instructor' },
    { value: 'sports-therapist', label: 'Sports therapist' },
    { value: 'hr-officer', label: 'HR officer' },
    { value: 'other', label: 'Other' }
  ],
  screeningPurpose: [
    { value: 'occupational-pre-placement', label: 'Occupational pre-placement' },
    { value: 'routine-public-health', label: 'Routine public health' },
    { value: 'perioperative-referral', label: 'Perioperative referral' },
    { value: 'physical-activity-readiness', label: 'Physical activity readiness' },
    { value: 'other', label: 'Other' }
  ],
  assessmentMode: [
    { value: 'in-person', label: 'In person' },
    { value: 'telephone', label: 'Telephone' },
    { value: 'online', label: 'Online' }
  ],
  usualActivityLevel: [
    { value: 'sedentary', label: 'Sedentary' },
    { value: 'light', label: 'Light' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'active', label: 'Active' },
    { value: 'very-active', label: 'Very active' }
  ],
  smokingStatus: [
    { value: 'never', label: 'Never smoked' },
    { value: 'ex-smoker', label: 'Ex-smoker' },
    { value: 'current-smoker', label: 'Current smoker' },
    { value: 'vapes-only', label: 'Vapes only' }
  ],
  physicalDemandsOfRole: [
    { value: 'sedentary', label: 'Sedentary' },
    { value: 'light', label: 'Light' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'heavy', label: 'Heavy' }
  ],
  vaccinationUpToDate: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'unsure', label: 'Unsure' }
  ],
  riskBand: [
    { value: 'low', label: 'Low' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'high', label: 'High' },
    { value: 'refer-urgently', label: 'Refer urgently' }
  ],
  auditCFrequency: [
    { value: 0, label: 'Never' },
    { value: 1, label: 'Monthly or less' },
    { value: 2, label: '2 to 4 times a month' },
    { value: 3, label: '2 to 3 times a week' },
    { value: 4, label: '4 or more times a week' }
  ],
  auditCTypicalQuantity: [
    { value: 0, label: '1 or 2' },
    { value: 1, label: '3 or 4' },
    { value: 2, label: '5 or 6' },
    { value: 3, label: '7 to 9' },
    { value: 4, label: '10 or more' }
  ],
  auditCBingeFrequency: [
    { value: 0, label: 'Never' },
    { value: 1, label: 'Less than monthly' },
    { value: 2, label: 'Monthly' },
    { value: 3, label: 'Weekly' },
    { value: 4, label: 'Daily or almost daily' }
  ],
  scale0To4: [
    { value: 0, label: '0 — None' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4 — Severe' }
  ]
};

// ----------------------------------------------------------------------
// Step renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'What this screen is for, and who is conducting it.'
  });
  card.appendChild(selectInput({ label: 'Screening purpose', section: 'context', field: 'screeningPurpose', options: OPTIONS.screeningPurpose, required: true }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Assessor name', section: 'assessor', field: 'name', required: true }),
    selectInput({ label: 'Assessor role', section: 'assessor', field: 'role', options: OPTIONS.assessorRole })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Employer', section: 'assessor', field: 'employer' }),
    textInput({ label: 'Site', section: 'context', field: 'siteName' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Assessment date', section: 'context', field: 'assessmentDate', type: 'date', required: true, hint: 'Used to compute age for the paediatric safety flag.' }),
    selectInput({ label: 'Assessment mode', section: 'context', field: 'assessmentMode', options: OPTIONS.assessmentMode })
  ]));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Personal details',
    description: 'Who is being screened, and their emergency contact.'
  });
  card.appendChild(textInput({ label: 'Name', section: 'patient', field: 'name', required: true }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Date of birth', section: 'patient', field: 'birthDate', type: 'date', hint: 'Used to compute age for the paediatric safety flag.' }),
    selectInput({ label: 'Sex', section: 'patient', field: 'sex', options: OPTIONS.sex, hint: 'Used for the sex-adjusted AUDIT-C threshold.' })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Identifier type', section: 'patient', field: 'identifierType', options: OPTIONS.identifierType }),
    textInput({ label: 'Identifier value', section: 'patient', field: 'identifierValue' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Email', section: 'patient', field: 'email', type: 'email' }),
    textInput({ label: 'Phone', section: 'patient', field: 'phone', type: 'tel' })
  ]));
  card.appendChild(subHead('Emergency contact'));
  card.appendChild(grid('three-col', [
    textInput({ label: 'Name', section: 'patient', field: 'emergencyContactName' }),
    textInput({ label: 'Relationship', section: 'patient', field: 'emergencyContactRelationship' }),
    textInput({ label: 'Phone', section: 'patient', field: 'emergencyContactPhone', type: 'tel' })
  ]));
  return card;
}

function renderStep3() {
  const card = sectionCard({ stepNumber: 3, title: 'Lifestyle — activity and diet' });
  card.appendChild(selectInput({ label: 'Usual activity level', section: 'activityDiet', field: 'usualActivityLevel', options: OPTIONS.usualActivityLevel }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Moderate-exercise days per week', section: 'activityDiet', field: 'moderateExerciseDaysPerWeek', type: 'number', min: 0, max: 7 }),
    textInput({ label: 'Fruit and vegetable portions per day', section: 'activityDiet', field: 'fruitAndVegetablePortionsPerDay', type: 'number', min: 0, max: 20 })
  ]));
  card.appendChild(textArea({ label: 'Diet notes', section: 'activityDiet', field: 'dietNotes', rows: 2 }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Lifestyle — smoking and alcohol',
    description: 'AUDIT-C is the same three-item alcohol screen used elsewhere in this monorepo, scored 0 to 12.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Smoking status', section: 'smokingAlcohol', field: 'smokingStatus', options: OPTIONS.smokingStatus }),
    textInput({ label: 'Cigarettes per day', section: 'smokingAlcohol', field: 'cigarettesPerDay', type: 'number', min: 0, max: 200 })
  ]));
  card.appendChild(selectInput({ label: 'AUDIT-C: how often do you have a drink containing alcohol?', section: 'smokingAlcohol', field: 'auditCFrequency', options: OPTIONS.auditCFrequency, numeric: true }));
  card.appendChild(selectInput({ label: 'AUDIT-C: how many standard drinks on a typical drinking day?', section: 'smokingAlcohol', field: 'auditCTypicalQuantity', options: OPTIONS.auditCTypicalQuantity, numeric: true }));
  card.appendChild(selectInput({ label: 'AUDIT-C: how often do you have six or more drinks on one occasion?', section: 'smokingAlcohol', field: 'auditCBingeFrequency', options: OPTIONS.auditCBingeFrequency, numeric: true }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Medical history',
    description: 'Diagnosed chronic conditions, past surgeries, current medications, and known drug allergies.'
  });
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Diabetes', section: 'medicalHistory', field: 'conditionDiabetes' }),
    yesNo({ label: 'Hypertension', section: 'medicalHistory', field: 'conditionHypertension' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Asthma', section: 'medicalHistory', field: 'conditionAsthma' }),
    yesNo({ label: 'Chronic obstructive pulmonary disease', section: 'medicalHistory', field: 'conditionCopd' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Heart disease', section: 'medicalHistory', field: 'conditionHeartDisease' }),
    yesNo({ label: 'Kidney disease', section: 'medicalHistory', field: 'conditionKidneyDisease' })
  ]));
  card.appendChild(yesNo({ label: 'Thyroid condition', section: 'medicalHistory', field: 'conditionThyroid' }));
  card.appendChild(textArea({ label: 'Other diagnosed condition', section: 'medicalHistory', field: 'conditionOther', rows: 2 }));
  card.appendChild(textArea({ label: 'Past surgeries', section: 'medicalHistory', field: 'pastSurgeries', rows: 2 }));
  card.appendChild(textArea({ label: 'Current medications', section: 'medicalHistory', field: 'currentMedications', rows: 2 }));
  card.appendChild(textArea({ label: 'Known drug allergies', section: 'medicalHistory', field: 'knownDrugAllergies', rows: 2 }));
  return card;
}

function renderStep6() {
  const card = sectionCard({ stepNumber: 6, title: 'Family history' });
  card.appendChild(yesNo({
    label: 'Premature heart attack or stroke (before age 60) in a first-degree relative',
    section: 'familyHistory', field: 'familyHistoryPrematureCardiacEvent'
  }));
  card.appendChild(textArea({ label: 'Other hereditary conditions', section: 'familyHistory', field: 'familyHistoryOther', rows: 2 }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Symptom review',
    description: 'Unexplained chest pain or fainting alone triggers same-day referral, independent of every other answer on this form.'
  });
  card.appendChild(yesNo({ label: 'Unexplained chest pain', section: 'symptoms', field: 'symptomUnexplainedChestPain' }));
  card.appendChild(yesNo({ label: 'Dizzy spells or fainting', section: 'symptoms', field: 'symptomDizzySpellsOrFainting' }));
  card.appendChild(yesNo({ label: 'Persistent cough (more than 3 weeks)', section: 'symptoms', field: 'symptomPersistentCoughOver3Weeks' }));
  card.appendChild(yesNo({
    label: 'Unexplained weight loss', section: 'symptoms', field: 'symptomUnexplainedWeightLoss',
    hint: 'Fires a safety flag independently, regardless of other findings.'
  }));
  card.appendChild(yesNo({ label: 'Joint pain restricting movement', section: 'symptoms', field: 'symptomJointPainRestrictingMovement' }));
  card.appendChild(yesNo({ label: 'Shortness of breath on exertion', section: 'symptoms', field: 'symptomShortnessOfBreathOnExertion' }));
  card.appendChild(yesNo({ label: 'Palpitations', section: 'symptoms', field: 'symptomPalpitations' }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'PAR-Q+ general health screen',
    description: 'The 7-item PAR-Q+ Collaboration general health screen (2011 revision). All 7 "no" clears for general physical activity; any "yes" requires further assessment.'
  });
  card.appendChild(yesNo({ label: '1. Has a doctor ever diagnosed you with a heart condition?', section: 'parq', field: 'parqDiagnosedHeartCondition' }));
  card.appendChild(yesNo({ label: '2. Do you feel pain in your chest at rest?', section: 'parq', field: 'parqChestPainAtRest' }));
  card.appendChild(yesNo({ label: '3. Do you feel pain in your chest during, or caused by, physical activity in the last month?', section: 'parq', field: 'parqChestPainDuringActivity' }));
  card.appendChild(yesNo({ label: '4. Do you lose balance because of dizziness, or have you lost consciousness, in the last 12 months?', section: 'parq', field: 'parqDizzinessOrLossOfConsciousness' }));
  card.appendChild(yesNo({ label: '5. Have you been diagnosed with another chronic medical condition?', section: 'parq', field: 'parqOtherChronicMedicalCondition' }));
  card.appendChild(yesNo({ label: '6. Are you currently taking prescribed medication for a chronic medical condition?', section: 'parq', field: 'parqPrescribedMedicationForChronicCondition' }));
  card.appendChild(yesNo({ label: '7. Do you have a bone, joint, or soft-tissue problem that could be made worse by becoming more physically active?', section: 'parq', field: 'parqBoneOrJointProblem' }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Vital signs / basic measurements',
    description: 'All optional — this form does not mandate a physical exam.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'Height (cm)', section: 'vitals', field: 'heightAsCm', type: 'number', min: 30, max: 250, step: '0.1' }),
    textInput({ label: 'Weight (kg)', section: 'vitals', field: 'weightAsKg', type: 'number', min: 1, max: 400, step: '0.1' })
  ]));
  const bmiField = document.createElement('div');
  bmiField.className = 'field';
  bmiField.innerHTML = `<span class="label">Body mass index (auto-computed)</span><p id="vitals-derivedBmi" class="derived-value">—</p>`;
  card.appendChild(bmiField);
  card.appendChild(grid('three-col', [
    textInput({ label: 'Resting blood pressure — systolic (mmHg)', section: 'vitals', field: 'restingBloodPressureSystolic', type: 'number', min: 40, max: 300 }),
    textInput({ label: 'Resting blood pressure — diastolic (mmHg)', section: 'vitals', field: 'restingBloodPressureDiastolic', type: 'number', min: 20, max: 200 }),
    textInput({ label: 'Resting heart rate (bpm)', section: 'vitals', field: 'restingHeartRate', type: 'number', min: 20, max: 250 })
  ]));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Occupational / role-specific factors',
    description: 'Shown because the screening purpose is occupational pre-placement.',
    conditional: 'context.screeningPurpose=occupational-pre-placement'
  });
  card.appendChild(textInput({ label: 'Job role', section: 'occupational', field: 'jobRole' }));
  card.appendChild(selectInput({ label: 'Physical demands of role', section: 'occupational', field: 'physicalDemandsOfRole', options: OPTIONS.physicalDemandsOfRole }));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Noise exposure', section: 'occupational', field: 'exposureNoise' }),
    yesNo({ label: 'Chemical exposure', section: 'occupational', field: 'exposureChemicals' }),
    yesNo({ label: 'Manual-handling exposure', section: 'occupational', field: 'exposureManualHandling' })
  ]));
  card.appendChild(yesNo({ label: 'Other exposure risk', section: 'occupational', field: 'exposureOther' }));
  card.appendChild(textArea({ label: 'Other exposure detail', section: 'occupational', field: 'exposureOtherDetail', rows: 2 }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Mental health and wellbeing check',
    description: 'Light-touch only — this monorepo has dedicated mental-health assessment forms for a full evaluation.'
  });
  card.appendChild(selectInput({ label: 'Stress level (0 none — 4 severe)', section: 'wellbeing', field: 'stressLevel', options: OPTIONS.scale0To4, numeric: true }));
  card.appendChild(selectInput({ label: 'Sleep quality (0 very poor — 4 very good)', section: 'wellbeing', field: 'sleepQuality', options: OPTIONS.scale0To4, numeric: true }));
  card.appendChild(yesNo({ label: 'Any current mental-health concern', section: 'wellbeing', field: 'mentalHealthConcern' }));
  card.appendChild(textArea({ label: 'Note', section: 'wellbeing', field: 'mentalHealthConcernNote', rows: 2 }));
  return card;
}

function renderStep12() {
  const card = sectionCard({ stepNumber: 12, title: 'Vaccination status' });
  card.appendChild(selectInput({ label: 'Vaccinations up to date', section: 'vaccination', field: 'vaccinationUpToDate', options: OPTIONS.vaccinationUpToDate }));
  card.appendChild(textArea({ label: 'Notable gaps', section: 'vaccination', field: 'vaccinationGapsNote', rows: 2 }));
  return card;
}

function renderStep13() {
  const card = sectionCard({ stepNumber: 13, title: 'Consent and data' });
  card.appendChild(yesNo({ label: 'Consent to screening', section: 'consent', field: 'consentToScreening' }));
  card.appendChild(yesNo({ label: 'Information given is accurate to the best of my knowledge', section: 'consent', field: 'informationAccurateConfirmed' }));
  card.appendChild(yesNo({ label: 'Interpreter required', section: 'consent', field: 'interpreterRequired' }));
  return card;
}

function renderStep14() {
  const card = sectionCard({
    stepNumber: 14,
    title: 'Summary and recommendation',
    description: 'Computed results, the assessor final call, and sign-off.'
  });
  const summary = document.createElement('div');
  summary.id = 'summary-preview';
  summary.className = 'summary-preview';
  card.appendChild(summary);
  card.appendChild(selectInput({
    label: 'Override risk band', section: 'summary', field: 'overrideRiskBand', options: OPTIONS.riskBand,
    hint: 'Leave unset to accept the computed risk band. Setting a different value requires a reason.'
  }));
  card.appendChild(textArea({ label: 'Override reason', section: 'summary', field: 'overrideReason', rows: 2 }));
  card.appendChild(textArea({ label: 'Notes', section: 'summary', field: 'notes', rows: 3 }));
  card.appendChild(textInput({
    label: 'Signed by', section: 'summary', field: 'signedByName', required: true,
    hint: 'Electronic signature — required before the report is final.'
  }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7,
  renderStep8, renderStep9, renderStep10, renderStep11, renderStep12, renderStep13, renderStep14
];

// ----------------------------------------------------------------------
// Derived values
// ----------------------------------------------------------------------

function updateDerived() {
  const preview = calculateHealthScreening(state);
  const bmiEl = document.getElementById('vitals-derivedBmi');
  if (bmiEl) bmiEl.textContent = preview.bodyMassIndex === null ? '—' : `${preview.bodyMassIndex} kg/m²`;

  const summaryEl = document.getElementById('summary-preview');
  if (summaryEl) {
    summaryEl.innerHTML = `
      <dl class="summary-dl">
        <div><dt>PAR-Q+ clearance</dt><dd>${preview.parqPlusClearance ? esc(labelFor(PARQ_CLEARANCE_LABELS, preview.parqPlusClearance)) : '—'}</dd></div>
        <div><dt>AUDIT-C</dt><dd>${preview.auditCScore === null ? '—' : `${preview.auditCScore} / 12`}${preview.auditCBand ? ` — ${esc(labelFor(AUDIT_C_BAND_LABELS, preview.auditCBand))}` : ''}</dd></div>
        <div><dt>Computed risk band</dt><dd>${preview.isPaediatric ? 'Not scored — paediatric' : esc(labelFor(RISK_BAND_LABELS, preview.computedRiskBand || 'low'))}</dd></div>
        <div><dt>Computed recommendation</dt><dd>${esc(labelFor(RECOMMENDATION_LABELS, preview.computedRecommendation || 'clear-to-proceed'))}</dd></div>
      </dl>
      ${preview.flags.length > 0 ? `<div class="alert" data-type="warning" role="alert">${preview.flags.length} safety flag${preview.flags.length === 1 ? '' : 's'} raised. Flags are never suppressed by an override.</div>` : ''}
    `;
  }
}

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = String(state[section]?.[field] ?? '');
    host.style.display = current === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  ['context', 'screeningPurpose'], ['assessor', 'name'], ['context', 'assessmentDate'],
  ['patient', 'name'], ['activityDiet', 'usualActivityLevel'],
  ['smokingAlcohol', 'auditCFrequency'],
  ['medicalHistory', 'conditionDiabetes'],
  ['familyHistory', 'familyHistoryPrematureCardiacEvent'],
  ['symptoms', 'symptomPalpitations'],
  ['parq', 'parqDiagnosedHeartCondition'],
  ['vitals', 'heightAsCm'],
  ['wellbeing', 'stressLevel'],
  ['vaccination', 'vaccinationUpToDate'],
  ['consent', 'consentToScreening'],
  ['summary', 'signedByName']
];

function isAnswered(v) {
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    if (isAnswered(state[section][field])) {
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
  { step: 1,  section: 'context',        title: 'Context' },
  { step: 2,  section: 'patient',        title: 'Personal details' },
  { step: 3,  section: 'activityDiet',   title: 'Activity and diet' },
  { step: 4,  section: 'smokingAlcohol', title: 'Smoking and alcohol' },
  { step: 5,  section: 'medicalHistory', title: 'Medical history' },
  { step: 6,  section: 'familyHistory',  title: 'Family history' },
  { step: 7,  section: 'symptoms',       title: 'Symptoms' },
  { step: 8,  section: 'parq',           title: 'PAR-Q+' },
  { step: 9,  section: 'vitals',         title: 'Measurements' },
  { step: 10, section: 'occupational',   title: 'Occupational' },
  { step: 11, section: 'wellbeing',      title: 'Wellbeing' },
  { step: 12, section: 'vaccination',    title: 'Vaccination' },
  { step: 13, section: 'consent',        title: 'Consent' },
  { step: 14, section: 'summary',        title: 'Summary' }
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
  const occupationalShown = state.context.screeningPurpose === 'occupational-pre-placement';
  for (const def of STEP_DEFINITIONS) {
    const li = ol.querySelector(`[data-step="${def.step}"]`);
    if (!li) continue;
    if (def.step === 10 && !occupationalShown) {
      li.hidden = true;
      continue;
    }
    li.hidden = false;
    const a = sectionAnswered[def.section] || 0;
    const t = sectionTotal[def.section] || 0;
    if (t > 0 && a === t) {
      li.dataset.status = 'finished';
      li.removeAttribute('aria-current');
    } else if (a > 0 || t === 0) {
      li.dataset.status = t === 0 ? 'waiting' : 'in-progress';
      if (firstUnfinished === -1 && t > 0) firstUnfinished = def.step;
    } else {
      li.dataset.status = 'waiting';
      li.removeAttribute('aria-current');
      if (firstUnfinished === -1) firstUnfinished = def.step;
    }
  }
  if (firstUnfinished === -1) firstUnfinished = STEP_DEFINITIONS[0].step;
  const current = ol.querySelector(`[data-step="${firstUnfinished}"]`);
  if (current) {
    current.setAttribute('aria-current', 'step');
    if (current.dataset.status === 'waiting') current.dataset.status = 'in-progress';
  }
}

// ----------------------------------------------------------------------
// Validation
// ----------------------------------------------------------------------

function clearFieldError(id) {
  const el = document.getElementById(`${id}-error`);
  if (el) el.textContent = '';
  const input = document.getElementById(id);
  if (input) input.removeAttribute('aria-invalid');
}

function setFieldError(id, message) {
  const el = document.getElementById(`${id}-error`);
  if (el) el.textContent = message;
  const input = document.getElementById(id);
  if (input) input.setAttribute('aria-invalid', 'true');
}

function validateForm() {
  const errors = [];
  const form = document.getElementById('questionnaire-form');
  if (!form) return errors;

  form.querySelectorAll('[data-required]').forEach((input) => {
    const id = input.id;
    const value = (input.value || '').trim();
    if (!value) {
      const labelEl = form.querySelector(`label[for="${id}"]`);
      const label = labelEl ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim() : id;
      errors.push({ id, message: `${label} is required` });
      setFieldError(id, `${label} is required`);
    } else {
      clearFieldError(id);
    }
  });

  // An assessor override without a reason is not auditable, so it is an error.
  const override = state.summary.overrideRiskBand;
  if (override && !String(state.summary.overrideReason || '').trim()) {
    const preview = calculateHealthScreening({ ...state, summary: { ...state.summary, overrideRiskBand: '' } });
    if (override !== preview.computedRiskBand) {
      const id = 'summary-overrideReason';
      const message = 'An override reason is required when the final risk band differs from the computed value';
      errors.push({ id, message });
      setFieldError(id, message);
    }
  }

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
  summary.innerHTML = `
    <strong>Please correct the following:</strong>
    <ul>
      ${errors.map((e) => `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`).join('')}
    </ul>
  `;
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  summary.focus({ preventScroll: true });
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

function titleCase(s) {
  return String(s || '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const r = lastResult;

  const flagsList = r.flags.length === 0
    ? '<p class="muted">No safety flags raised.</p>'
    : `
      <ul class="flags">
        ${r.flags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
            <span class="flag-category">${esc(titleCase(f.category))}</span>
            <span class="flag-message">${esc(f.description)}</span>
            <span class="flag-action">${esc(f.suggestedAction)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const firedRows = r.firedRules.map((rule) => `
    <tr>
      <th scope="row">${esc(rule.ruleId)}</th>
      <td>${esc(rule.instrument.toUpperCase())}</td>
      <td>${esc(rule.component)}</td>
      <td>${esc(rule.band)}</td>
      <td>${esc(rule.description)}</td>
    </tr>
  `).join('');

  const firedTable = r.firedRules.length === 0
    ? '<p class="muted">No rules fired.</p>'
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Rule</th>
            <th scope="col">Instrument</th>
            <th scope="col">Component</th>
            <th scope="col">Band</th>
            <th scope="col">Why it fired</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const paediatricBlock = r.isPaediatric
    ? `
      <div class="alert" data-type="info" role="alert">
        <strong>Paediatric respondent.</strong>
        PAR-Q+ and AUDIT-C are not validated below 16 years. This screen has not been scored;
        redirect to a paediatric-specific health-screening pathway.
      </div>
    `
    : '';

  const overrideBlock = !r.isPaediatric && r.finalRiskBand !== r.computedRiskBand
    ? `
      <div class="alert" data-type="warning" role="alert">
        <strong>Assessor override.</strong>
        Computed risk band was <strong>${esc(titleCase(r.computedRiskBand))}</strong>;
        the assessor recorded <strong>${esc(titleCase(r.finalRiskBand))}</strong>.
        Reason: ${esc(r.overrideReason || 'not stated')}.
        Safety flags below are unaffected by the override.
      </div>
    `
    : '';

  out.innerHTML = `
    <h2>Health Screening Questionnaire Report</h2>
    <p class="muted">
      Generated ${esc(new Date(r.timestamp).toLocaleString())} ·
      ${esc(state.patient.name.trim() || 'Not named')} ·
      Assessed by ${esc(state.assessor.name || '—')}
    </p>

    ${paediatricBlock}
    ${overrideBlock}

    <div class="recommendation-banner">
      <span class="band-badge band-${esc(r.finalRiskBand)}">${r.isPaediatric ? 'Not scored — paediatric' : esc(labelFor(RISK_BAND_LABELS, r.finalRiskBand || 'low'))}</span>
      <span class="band-badge rec-${esc(r.finalRecommendation)}">${esc(labelFor(RECOMMENDATION_LABELS, r.finalRecommendation || 'clear-to-proceed'))}</span>
    </div>

    <h3>PAR-Q+ — Physical Activity Readiness Questionnaire</h3>
    <p>${r.parqPlusClearance ? esc(labelFor(PARQ_CLEARANCE_LABELS, r.parqPlusClearance)) : 'Not completed'}</p>

    <h3>AUDIT-C — Alcohol Use Screen</h3>
    <p>${r.auditCScore === null ? 'Not completed' : `${r.auditCScore} / 12`}${r.auditCBand ? ` — ${esc(labelFor(AUDIT_C_BAND_LABELS, r.auditCBand))}` : ''}</p>

    <h3>Fired rules</h3>
    ${firedTable}

    <h3>Safety flags</h3>
    ${flagsList}

    <h3>Notes</h3>
    <p>${esc(state.summary.notes || '—')}</p>

    <div class="report-actions">
      <button type="button" id="print-btn" class="button" data-variant="secondary">Print / save PDF</button>
      <button type="button" id="export-btn" class="button" data-variant="secondary">Export JSON</button>
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
  document.getElementById('print-btn').addEventListener('click', () => window.print());
  document.getElementById('export-btn').addEventListener('click', exportJson);
}

/** Download the questionnaire and its grading as a JSON file. */
function exportJson() {
  const payload = JSON.stringify({ questionnaire: state, grading: lastResult }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'health-screening-questionnaire.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const result = calculateHealthScreening(state);
  lastResult = { ...result, timestamp: new Date().toISOString() };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh screening?')) return;
  clearState();
  state = emptyQuestionnaire();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the health screening report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateDerived();
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
  for (const r of STEP_RENDERERS) host.appendChild(r());
}

function init() {
  renderStepList();
  renderForm();
  updateDerived();
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
