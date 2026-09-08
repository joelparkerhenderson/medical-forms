import { calculateOptimization } from './composite-grader.js';
import { DOMAIN_LABELS } from './domain-rules.js';
import {
  GATE_DECISION_LABELS,
  READINESS_LABELS,
  STATUS_LABELS,
  emptyAssessment,
  labelFor
} from './types.js';

// Perioperative Optimization — assessment wizard (vanilla JS, ES modules).
//
// Single-page continuous wizard: all 16 sections render into the page in
// document order. A live readiness strip under the progress bar shows the
// weeks to surgery and the current band as the clinician types, because the
// time remaining is the number the whole assessment turns on.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'perioperative-optimization.front-end-with-html.v1';
const TOTAL_STEPS = 16;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyAssessment();

  for (const key of Object.keys(fresh)) {
    const v = parsed && parsed[key];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      fresh[key] = { ...fresh[key], ...v };
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
    console.warn('Could not parse the saved assessment; starting fresh.', e);
    return emptyAssessment();
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save the assessment to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear the stored assessment.', e);
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
  slug: 'perioperative-optimization',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the optimization report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateLiveReadiness();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateLiveReadiness();
  updateProgress();
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function titleCase(s) {
  return String(s || '').replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const attrs = [
    `id="${id}"`, `name="${id}"`, `type="${type}"`,
    `class="${lilyInputClass(type)}"`, `value="${esc(value ?? '')}"`
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
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      aria-describedby="${id}-error" class="text-area-input">${esc(value)}</textarea>
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
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const optionsHtml = [
    '<option value="">— Select —</option>',
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`)
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
    setField(opts.section, opts.field, sel.value);
    clearFieldError(id);
  });
  return wrapper;
}

/** Yes / no radio group storing the string 'yes' or 'no'. */
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
  const legend = document.createElement('legend');
  legend.className = 'fieldset-legend';
  legend.innerHTML = `
    <span class="section-step">Step ${opts.stepNumber} of ${TOTAL_STEPS}</span>
    <h2 class="section-title">${esc(opts.title)}</h2>
    ${opts.description ? `<span class="section-description">${esc(opts.description)}</span>` : ''}
  `;
  card.appendChild(legend);
  return card;
}

function subHead(text) {
  const h = document.createElement('h3');
  h.textContent = text;
  return h;
}

function note(text) {
  const p = document.createElement('p');
  p.className = 'section-note';
  p.textContent = text;
  return p;
}

function grid(cols, children) {
  const g = document.createElement('div');
  g.className = cols;
  for (const c of children) g.appendChild(c);
  return g;
}

const YES_NO_OPTS = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }];

// ----------------------------------------------------------------------
// Option lists (values match the SQL CHECK constraints in ../../sql/)
// ----------------------------------------------------------------------

const OPTIONS = {
  role: [
    { value: 'preoperative-assessment-nurse', label: 'Pre-operative assessment nurse' },
    { value: 'perioperative-physician', label: 'Perioperative physician' },
    { value: 'anaesthetist', label: 'Anaesthetist' },
    { value: 'surgeon', label: 'Surgeon' },
    { value: 'prehabilitation-therapist', label: 'Prehabilitation therapist' },
    { value: 'physiotherapist', label: 'Physiotherapist' },
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'dietitian', label: 'Dietitian' },
    { value: 'specialist-nurse', label: 'Specialist nurse' },
    { value: 'other', label: 'Other' }
  ],
  registrationBody: [
    { value: 'GMC', label: 'GMC' }, { value: 'NMC', label: 'NMC' },
    { value: 'HCPC', label: 'HCPC' }, { value: 'GPhC', label: 'GPhC' },
    { value: 'other', label: 'Other' }
  ],
  pathwayStage: [
    { value: 'referral', label: 'Referral' },
    { value: 'waiting-list', label: 'Waiting list' },
    { value: 'pre-assessment', label: 'Pre-assessment' },
    { value: 'prehabilitation', label: 'Prehabilitation' },
    { value: 'pre-admission', label: 'Pre-admission' },
    { value: 'review', label: 'Review' }
  ],
  assessmentMode: [
    { value: 'clinic', label: 'Clinic' }, { value: 'telephone', label: 'Telephone' },
    { value: 'video', label: 'Video' }, { value: 'online-portal', label: 'Online portal' },
    { value: 'home-visit', label: 'Home visit' }
  ],
  referralSource: [
    { value: 'surgical-team', label: 'Surgical team' },
    { value: 'general-practitioner', label: 'General practitioner' },
    { value: 'anaesthetist', label: 'Anaesthetist' },
    { value: 'waiting-list-office', label: 'Waiting-list office' },
    { value: 'self-referral', label: 'Self-referral' },
    { value: 'other', label: 'Other' }
  ],
  sex: [
    { value: 'female', label: 'Female' }, { value: 'male', label: 'Male' },
    { value: 'intersex', label: 'Intersex' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ],
  urgency: [
    { value: 'elective', label: 'Elective' }, { value: 'scheduled', label: 'Scheduled' },
    { value: 'expedited', label: 'Expedited' }, { value: 'urgent', label: 'Urgent' },
    { value: 'emergency', label: 'Emergency' }
  ],
  surgicalSeverity: [
    { value: 'minor', label: 'Minor' }, { value: 'intermediate', label: 'Intermediate' },
    { value: 'major', label: 'Major' }, { value: 'major-plus', label: 'Major plus' }
  ],
  laterality: [
    { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' },
    { value: 'bilateral', label: 'Bilateral' }, { value: 'midline', label: 'Midline' },
    { value: 'na', label: 'Not applicable' }
  ],
  pregnancyStatus: [
    { value: 'not-applicable', label: 'Not applicable' },
    { value: 'not-pregnant', label: 'Not pregnant' },
    { value: 'pregnant', label: 'Pregnant' },
    { value: 'breastfeeding', label: 'Breastfeeding' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ],
  adherence: [
    { value: 'full', label: 'Full' }, { value: 'partial', label: 'Partial' },
    { value: 'none', label: 'None' }, { value: 'unknown', label: 'Unknown' }
  ],
  allergySeverity: [
    { value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' }, { value: 'anaphylaxis', label: 'Anaphylaxis' }
  ],
  anaemiaRoute: [
    { value: 'oral', label: 'Oral (8-week lead time)' },
    { value: 'intravenous', label: 'Intravenous (4-week lead time)' },
    { value: 'none', label: 'None' }
  ],
  diabetesType: [
    { value: 'none', label: 'None' }, { value: 'type-1', label: 'Type 1' },
    { value: 'type-2', label: 'Type 2' }, { value: 'gestational', label: 'Gestational' },
    { value: 'other', label: 'Other' }
  ],
  diabetesTreatment: [
    { value: 'diet-only', label: 'Diet only' },
    { value: 'oral-agents', label: 'Oral agents' },
    { value: 'insulin', label: 'Insulin' },
    { value: 'oral-and-insulin', label: 'Oral and insulin' },
    { value: 'glp1-agonist', label: 'GLP-1 agonist' },
    { value: 'other', label: 'Other' }
  ],
  hypoAwareness: [
    { value: 'normal', label: 'Normal' }, { value: 'impaired', label: 'Impaired' },
    { value: 'absent', label: 'Absent' }
  ],
  smokingStatus: [
    { value: 'never', label: 'Never smoked' }, { value: 'former', label: 'Former smoker' },
    { value: 'current', label: 'Current smoker' }
  ],
  auditCFrequency: [
    { value: '0', label: '0 — Never' },
    { value: '1', label: '1 — Monthly or less' },
    { value: '2', label: '2 — Two to four times a month' },
    { value: '3', label: '3 — Two to three times a week' },
    { value: '4', label: '4 — Four or more times a week' }
  ],
  auditCQuantity: [
    { value: '0', label: '0 — 1 or 2' }, { value: '1', label: '1 — 3 or 4' },
    { value: '2', label: '2 — 5 or 6' }, { value: '3', label: '3 — 7 to 9' },
    { value: '4', label: '4 — 10 or more' }
  ],
  auditCBinge: [
    { value: '0', label: '0 — Never' }, { value: '1', label: '1 — Less than monthly' },
    { value: '2', label: '2 — Monthly' }, { value: '3', label: '3 — Weekly' },
    { value: '4', label: '4 — Daily or almost daily' }
  ],
  appetite: [
    { value: 'good', label: 'Good' }, { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }, { value: 'absent', label: 'Absent' }
  ],
  activityLevel: [
    { value: 'sedentary', label: 'Sedentary' },
    { value: 'lightly-active', label: 'Lightly active' },
    { value: 'moderately-active', label: 'Moderately active' },
    { value: 'very-active', label: 'Very active' }
  ],
  stairs: [
    { value: 'yes-easily', label: 'Yes, easily' },
    { value: 'yes-with-difficulty', label: 'Yes, with difficulty' },
    { value: 'no', label: 'No' }
  ],
  cognitiveTool: [
    { value: '4at', label: '4AT' }, { value: 'amt', label: 'AMT' },
    { value: 'moca', label: 'MoCA' }, { value: 'mmse', label: 'MMSE' },
    { value: 'none', label: 'None done' }
  ],
  severity4: [
    { value: 'none', label: 'None' }, { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }
  ],
  mobilityAid: [
    { value: 'none', label: 'None' }, { value: 'stick', label: 'Stick' },
    { value: 'frame', label: 'Frame' }, { value: 'crutches', label: 'Crutches' },
    { value: 'wheelchair', label: 'Wheelchair' }, { value: 'bed-bound', label: 'Bed-bound' }
  ],
  livingSituation: [
    { value: 'alone', label: 'Alone' }, { value: 'with-partner', label: 'With a partner' },
    { value: 'with-family', label: 'With family' }, { value: 'shared-house', label: 'Shared house' },
    { value: 'care-home', label: 'Care home' }, { value: 'supported-living', label: 'Supported living' },
    { value: 'homeless', label: 'Homeless' }, { value: 'other', label: 'Other' }
  ],
  carePackage: [
    { value: 'none', label: 'None' }, { value: 'informal', label: 'Informal' },
    { value: 'daily', label: 'Daily' }, { value: 'twice-daily', label: 'Twice daily' },
    { value: 'live-in', label: 'Live-in' }
  ],
  heartRhythm: [
    { value: 'sinus', label: 'Sinus' },
    { value: 'atrial-fibrillation', label: 'Atrial fibrillation' },
    { value: 'flutter', label: 'Flutter' }, { value: 'heart-block', label: 'Heart block' },
    { value: 'paced', label: 'Paced' }, { value: 'other', label: 'Other' }
  ],
  exerciseTolerance: [
    { value: 'good', label: 'Good' }, { value: 'moderate', label: 'Moderate' },
    { value: 'poor', label: 'Poor' }, { value: 'unable', label: 'Unable' }
  ],
  airwaysControl: [
    { value: 'none', label: 'Not applicable' }, { value: 'controlled', label: 'Controlled' },
    { value: 'partly-controlled', label: 'Partly controlled' },
    { value: 'uncontrolled', label: 'Uncontrolled' }
  ],
  depressionScreen: [
    { value: 'negative', label: 'Negative' }, { value: 'positive', label: 'Positive' },
    { value: 'not-done', label: 'Not done' }
  ],
  supportAfterDischarge: [
    { value: 'good', label: 'Good' }, { value: 'some', label: 'Some' },
    { value: 'limited', label: 'Limited' }, { value: 'none', label: 'None' }
  ],
  healthLiteracy: [
    { value: 'high', label: 'High' }, { value: 'moderate', label: 'Moderate' },
    { value: 'low', label: 'Low' }
  ],
  readiness: [
    { value: 'ready', label: 'Ready for surgery' },
    { value: 'optimization-in-progress', label: 'Optimization in progress' },
    { value: 'optimization-required', label: 'Optimization required' },
    { value: 'defer-surgery', label: 'Defer surgery' }
  ],
  gateDecision: [
    { value: 'proceed', label: 'Proceed as listed' },
    { value: 'proceed-with-prehabilitation', label: 'Proceed with prehabilitation' },
    { value: 'defer-and-optimize', label: 'Defer and optimize' },
    { value: 'accept-unoptimized-risk', label: 'Accept unoptimized risk' },
    { value: 'mdt-review', label: 'Refer to MDT review' },
    { value: 'cancel', label: 'Cancel' }
  ]
};

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1, title: 'Assessment context',
    description: 'Who is assessing, where, and at what stage of the perioperative pathway.'
  });
  card.appendChild(textInput({ label: 'Assessor name', section: 'assessment', field: 'clinicianName', required: true }));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Role', section: 'assessment', field: 'role', options: OPTIONS.role, required: true }),
    selectInput({ label: 'Registration body', section: 'assessment', field: 'registrationBody', options: OPTIONS.registrationBody })
  ]));
  card.appendChild(textInput({ label: 'Registration number', section: 'assessment', field: 'registrationNumber' }));
  card.appendChild(grid('two-col', [
    textInput({
      label: 'Assessment date', section: 'assessment', field: 'assessmentDate', type: 'date', required: true,
      hint: 'With the planned surgery date this sets the weeks available to optimize.'
    }),
    textInput({ label: 'Assessment time', section: 'assessment', field: 'assessmentTime', type: 'time' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Site', section: 'assessment', field: 'siteName' }),
    textInput({ label: 'Service', section: 'assessment', field: 'serviceName' })
  ]));
  card.appendChild(grid('three-col', [
    selectInput({ label: 'Pathway stage', section: 'assessment', field: 'pathwayStage', options: OPTIONS.pathwayStage }),
    selectInput({ label: 'Assessment mode', section: 'assessment', field: 'assessmentMode', options: OPTIONS.assessmentMode }),
    selectInput({ label: 'Referral source', section: 'assessment', field: 'referralSource', options: OPTIONS.referralSource })
  ]));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2, title: 'Patient and procedural demographics',
    description: 'Who the patient is and what they are listed for. The planned surgery date drives every domain gate.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'First name', section: 'patient', field: 'firstName', required: true }),
    textInput({ label: 'Last name', section: 'patient', field: 'lastName', required: true })
  ]));
  card.appendChild(grid('three-col', [
    textInput({ label: 'Date of birth', section: 'patient', field: 'birthDate', type: 'date' }),
    selectInput({
      label: 'Sex', section: 'patient', field: 'sex', options: OPTIONS.sex,
      hint: 'Sets the sex-specific haemoglobin and AUDIT-C thresholds.'
    }),
    textInput({ label: 'NHS number', section: 'patient', field: 'nhsNumber', placeholder: 'NNN NNN NNNN' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Phone', section: 'patient', field: 'phone', type: 'tel' }),
    textInput({ label: 'Email', section: 'patient', field: 'email', type: 'email' })
  ]));
  card.appendChild(subHead('Planned procedure'));
  card.appendChild(textInput({ label: 'Planned procedure', section: 'procedure', field: 'plannedProcedure', required: true }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Surgical specialty', section: 'procedure', field: 'surgicalSpecialty' }),
    textInput({ label: 'Consultant surgeon', section: 'procedure', field: 'consultantSurgeon' })
  ]));
  card.appendChild(grid('three-col', [
    textInput({
      label: 'Planned surgery date', section: 'procedure', field: 'plannedSurgeryDate', type: 'date',
      hint: 'Leave blank if no date is set; gating is then skipped and every triggered domain reports action required.'
    }),
    selectInput({ label: 'Urgency', section: 'procedure', field: 'urgency', options: OPTIONS.urgency }),
    selectInput({ label: 'Surgical severity', section: 'procedure', field: 'surgicalSeverity', options: OPTIONS.surgicalSeverity })
  ]));
  card.appendChild(grid('three-col', [
    selectInput({ label: 'Laterality', section: 'procedure', field: 'laterality', options: OPTIONS.laterality }),
    textInput({ label: 'Anticipated blood loss', section: 'procedure', field: 'anticipatedBloodLossMl', type: 'number', min: 0, max: 20000, unit: 'ml' }),
    textInput({ label: 'Anticipated stay', section: 'procedure', field: 'anticipatedLengthOfStayDays', type: 'number', min: 0, max: 365, unit: 'days' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Interpreter required', section: 'procedure', field: 'interpreterRequired' }),
    textInput({ label: 'Interpreter language', section: 'procedure', field: 'interpreterLanguage' })
  ]));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3, title: 'Medical and surgical history',
    description: 'Active diagnoses, previous surgery, and any previous anaesthetic complication.'
  });
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Cardiac disease', section: 'history', field: 'conditionCardiac' }),
    yesNo({ label: 'Respiratory disease', section: 'history', field: 'conditionRespiratory' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Renal disease', section: 'history', field: 'conditionRenal' }),
    yesNo({ label: 'Liver disease', section: 'history', field: 'conditionHepatic' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Stroke or TIA', section: 'history', field: 'conditionStroke' }),
    yesNo({ label: 'Cancer', section: 'history', field: 'conditionCancer' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Rheumatological disease', section: 'history', field: 'conditionRheumatological' }),
    yesNo({ label: 'Thyroid disease', section: 'history', field: 'conditionThyroid' })
  ]));
  card.appendChild(textInput({ label: 'Other conditions', section: 'history', field: 'conditionOther' }));
  card.appendChild(subHead('Surgical and anaesthetic history'));
  card.appendChild(yesNo({ label: 'Previous surgery', section: 'history', field: 'previousSurgery' }));
  card.appendChild(textInput({ label: 'Previous surgery detail', section: 'history', field: 'previousSurgeryDetail' }));
  card.appendChild(yesNo({ label: 'Previous anaesthetic complication', section: 'history', field: 'previousAnaestheticComplication' }));
  card.appendChild(textInput({ label: 'Complication detail', section: 'history', field: 'previousAnaestheticComplicationDetail' }));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Postoperative nausea and vomiting history', section: 'history', field: 'postoperativeNauseaHistory' }),
    yesNo({ label: 'Difficult airway documented', section: 'history', field: 'difficultAirwayHistory' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Malignant hyperthermia history', section: 'history', field: 'malignantHyperthermiaHistory' }),
    yesNo({ label: 'Venous thromboembolism history', section: 'history', field: 'venousThromboembolismHistory' })
  ]));
  card.appendChild(textArea({ label: 'Relevant family history', section: 'history', field: 'familyHistory', rows: 2 }));
  card.appendChild(selectInput({ label: 'Pregnancy status', section: 'history', field: 'pregnancyStatus', options: OPTIONS.pregnancyStatus }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4, title: 'Medications',
    description: 'The medication domain is optimized when a hold-and-restart plan has been agreed with the prescriber.'
  });
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Prescription medicines', section: 'medication', field: 'takesPrescriptionMedicines' }),
    yesNo({ label: 'Over-the-counter medicines', section: 'medication', field: 'takesOverTheCounterMedicines' }),
    yesNo({ label: 'Herbal or complementary', section: 'medication', field: 'takesHerbalProducts' })
  ]));
  card.appendChild(subHead('Medicines that need a perioperative hold plan'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Anticoagulant', section: 'medication', field: 'takesAnticoagulant' }),
    yesNo({ label: 'Antiplatelet', section: 'medication', field: 'takesAntiplatelet' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({
      label: 'SGLT2 inhibitor', section: 'medication', field: 'takesSglt2Inhibitor',
      hint: 'Can cause ketoacidosis with a normal blood glucose. Needs an explicit hold plan.'
    }),
    yesNo({
      label: 'GLP-1 receptor agonist', section: 'medication', field: 'takesGlp1Agonist',
      hint: 'Delays gastric emptying — aspiration risk despite standard fasting.'
    })
  ]));
  card.appendChild(subHead('GLP-1 receptor agonist management'));
  card.appendChild(grid('three-col', [
    selectInput({
      label: 'Formulation', section: 'medication', field: 'glp1Formulation',
      options: [{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }]
    }),
    yesNo({
      label: 'Held per guideline', section: 'medication', field: 'glp1HeldPerGuideline',
      hint: 'Daily formulations held day-of; weekly formulations held one week prior.'
    }),
    yesNo({
      label: 'Extended clear-fluid fast confirmed', section: 'medication', field: 'glp1ExtendedClearFluidsConfirmed',
      hint: '24-hour solid fast plus 4-8 hour clear-liquid fast, if not held.'
    })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({
      label: 'Active GI symptoms', section: 'medication', field: 'glp1GiSymptoms',
      hint: 'Nausea, vomiting, bloating, or abdominal pain.'
    }),
    textInput({ label: 'GI symptom details', section: 'medication', field: 'glp1GiSymptomsDetails' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Gastric ultrasound performed', section: 'medication', field: 'glp1GastricUltrasoundPerformed' }),
    selectInput({
      label: 'Gastric ultrasound finding', section: 'medication', field: 'glp1GastricUltrasoundFindings',
      options: [
        { value: 'empty', label: 'Empty' },
        { value: 'low-risk', label: 'Low risk' },
        { value: 'full-stomach', label: 'Full stomach' }
      ]
    })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'ACE inhibitor or ARB', section: 'medication', field: 'takesAceInhibitorOrArb' }),
    yesNo({ label: 'Systemic corticosteroid', section: 'medication', field: 'takesCorticosteroid' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Immunosuppressant or biologic', section: 'medication', field: 'takesImmunosuppressant' }),
    yesNo({ label: 'Hormone therapy', section: 'medication', field: 'takesHormoneTherapy' })
  ]));
  card.appendChild(subHead('Hold plan'));
  card.appendChild(grid('two-col', [
    yesNo({
      label: 'Hold-and-restart plan agreed', section: 'medication', field: 'medicationHoldPlanAgreed',
      hint: 'This is the medication domain optimization criterion.'
    }),
    textInput({ label: 'Agreed by', section: 'medication', field: 'medicationHoldPlanAgreedBy' })
  ]));
  card.appendChild(selectInput({ label: 'Adherence', section: 'medication', field: 'medicationAdherence', options: OPTIONS.adherence }));
  card.appendChild(textArea({ label: 'Medication notes', section: 'medication', field: 'medicationNotes', rows: 2 }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5, title: 'Allergies and intolerances',
    description: 'Drug, food, and contact allergies, with the reaction and its severity.'
  });
  card.appendChild(yesNo({ label: 'Drug allergy', section: 'allergy', field: 'hasDrugAllergy' }));
  card.appendChild(textInput({ label: 'Drug allergy detail', section: 'allergy', field: 'drugAllergyDetail', placeholder: 'Drug and reaction' }));
  card.appendChild(yesNo({ label: 'Food allergy', section: 'allergy', field: 'hasFoodAllergy' }));
  card.appendChild(textInput({ label: 'Food allergy detail', section: 'allergy', field: 'foodAllergyDetail' }));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Latex', section: 'allergy', field: 'hasLatexAllergy' }),
    yesNo({ label: 'Adhesives or dressings', section: 'allergy', field: 'hasAdhesiveAllergy' }),
    yesNo({ label: 'Radiological contrast', section: 'allergy', field: 'hasContrastAllergy' })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Worst reaction severity', section: 'allergy', field: 'allergySeverity', options: OPTIONS.allergySeverity }),
    yesNo({ label: 'Carries an adrenaline auto-injector', section: 'allergy', field: 'adrenalineAutoInjector' })
  ]));
  card.appendChild(textArea({ label: 'Allergy notes', section: 'allergy', field: 'allergyNotes', rows: 2 }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6, title: 'Anaemia and iron studies',
    description: 'Domain 1. Triggers on haemoglobin below the sex threshold, or on iron studies independently — a normal haemoglobin does not clear the domain.'
  });
  card.appendChild(textInput({ label: 'Sample date', section: 'anaemia', field: 'bloodsSampleDate', type: 'date' }));
  card.appendChild(grid('two-col', [
    textInput({
      label: 'Haemoglobin', section: 'anaemia', field: 'haemoglobinGPerL', type: 'number', step: 0.1, unit: 'g/L',
      hint: 'Below 130 in men or 120 in women triggers the domain; below 80 defers surgery.'
    }),
    textInput({ label: 'Mean cell volume', section: 'anaemia', field: 'meanCellVolumeFl', type: 'number', step: 0.1, unit: 'fL' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({
      label: 'Ferritin', section: 'anaemia', field: 'ferritinUgPerL', type: 'number', step: 0.1, unit: 'µg/L',
      hint: 'Below 30 indicates absolute iron deficiency.'
    }),
    textInput({
      label: 'Transferrin saturation', section: 'anaemia', field: 'transferrinSaturationPercent', type: 'number', step: 0.1, unit: '%',
      hint: 'Below 20 with a ferritin of 30 to 100 indicates functional iron deficiency.'
    })
  ]));
  card.appendChild(grid('three-col', [
    textInput({ label: 'Vitamin B12', section: 'anaemia', field: 'vitaminB12NgPerL', type: 'number', step: 0.1, unit: 'ng/L' }),
    textInput({ label: 'Folate', section: 'anaemia', field: 'folateUgPerL', type: 'number', step: 0.1, unit: 'µg/L' }),
    textInput({ label: 'C-reactive protein', section: 'anaemia', field: 'cReactiveProteinMgPerL', type: 'number', step: 0.1, unit: 'mg/L' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Creatinine', section: 'anaemia', field: 'creatinineUmolPerL', type: 'number', step: 0.1, unit: 'µmol/L' }),
    textInput({ label: 'eGFR', section: 'anaemia', field: 'egfrMlPerMin', type: 'number', step: 0.1, unit: 'ml/min' })
  ]));
  card.appendChild(subHead('Treatment'));
  card.appendChild(textInput({ label: 'Known or suspected cause', section: 'anaemia', field: 'anaemiaKnownCause' }));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Treatment started', section: 'anaemia', field: 'anaemiaTreatmentStarted' }),
    selectInput({
      label: 'Route', section: 'anaemia', field: 'anaemiaTreatmentRoute', options: OPTIONS.anaemiaRoute,
      hint: 'The route sets the lead time: 4 weeks intravenous, 8 weeks oral.'
    }),
    textInput({ label: 'Treatment start date', section: 'anaemia', field: 'anaemiaTreatmentStartDate', type: 'date' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Previous transfusion', section: 'anaemia', field: 'previousTransfusion' }),
    yesNo({ label: 'Group and save done', section: 'anaemia', field: 'groupAndSaveDone' })
  ]));
  card.appendChild(textArea({ label: 'Anaemia notes', section: 'anaemia', field: 'anaemiaNotes', rows: 2 }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7, title: 'Glycaemic control',
    description: 'Domain 2. HbA1c reflects roughly three months of glycaemia, so the lead time is 12 weeks.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Diabetes type', section: 'glycaemic', field: 'diabetesType', options: OPTIONS.diabetesType }),
    textInput({ label: 'Duration', section: 'glycaemic', field: 'diabetesDurationYears', type: 'number', step: 0.1, min: 0, max: 100, unit: 'years' })
  ]));
  card.appendChild(grid('three-col', [
    textInput({
      label: 'HbA1c', section: 'glycaemic', field: 'hba1cMmolPerMol', type: 'number', step: 0.1, unit: 'mmol/mol',
      hint: '48 or above triggers the domain; 69 or above (8.5%) defers surgery.'
    }),
    textInput({ label: 'HbA1c sample date', section: 'glycaemic', field: 'hba1cSampleDate', type: 'date' }),
    textInput({ label: 'Capillary glucose', section: 'glycaemic', field: 'capillaryGlucoseMmolPerL', type: 'number', step: 0.1, unit: 'mmol/L' })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Treatment', section: 'glycaemic', field: 'diabetesTreatment', options: OPTIONS.diabetesTreatment }),
    selectInput({ label: 'Hypoglycaemia awareness', section: 'glycaemic', field: 'hypoglycaemiaAwareness', options: OPTIONS.hypoAwareness })
  ]));
  card.appendChild(textInput({ label: 'Insulin regimen', section: 'glycaemic', field: 'insulinRegimen' }));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Diabetes team review', section: 'glycaemic', field: 'diabetesTeamReview' }),
    textInput({ label: 'Review date', section: 'glycaemic', field: 'diabetesTeamReviewDate', type: 'date' }),
    yesNo({ label: 'Foot check done', section: 'glycaemic', field: 'footCheckDone' })
  ]));
  card.appendChild(textArea({ label: 'Glycaemic notes', section: 'glycaemic', field: 'glycaemicNotes', rows: 2 }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8, title: 'Smoking and tobacco',
    description: 'Domain 3. Four weeks of abstinence measurably reduces respiratory complications; stopping at any time still helps wound healing.'
  });
  card.appendChild(selectInput({ label: 'Smoking status', section: 'smoking', field: 'smokingStatus', options: OPTIONS.smokingStatus }));
  card.appendChild(grid('three-col', [
    textInput({ label: 'Cigarettes per day', section: 'smoking', field: 'cigarettesPerDay', type: 'number', min: 0, max: 200 }),
    textInput({ label: 'Pack-years', section: 'smoking', field: 'packYears', type: 'number', step: 0.1, min: 0, max: 300 }),
    textInput({ label: 'Quit date', section: 'smoking', field: 'quitDate', type: 'date' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Cessation support offered', section: 'smoking', field: 'smokingCessationOffered' }),
    yesNo({
      label: 'Cessation support accepted', section: 'smoking', field: 'smokingCessationAccepted',
      hint: 'Moves the domain to in-progress.'
    })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Nicotine replacement supplied', section: 'smoking', field: 'nicotineReplacement' }),
    yesNo({ label: 'Vapes', section: 'smoking', field: 'vaping' })
  ]));
  card.appendChild(textArea({ label: 'Smoking notes', section: 'smoking', field: 'smokingNotes', rows: 2 }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9, title: 'Alcohol and other substances',
    description: 'Domain 4. AUDIT-C is the three-item consumption subset, scored 0 to 12.'
  });
  card.appendChild(textInput({
    label: 'Alcohol', section: 'alcohol', field: 'alcoholUnitsPerWeek', type: 'number', step: 0.1, min: 0, max: 300, unit: 'units/week',
    hint: 'Above 14 triggers the domain.'
  }));
  card.appendChild(subHead('AUDIT-C'));
  card.appendChild(selectInput({ label: 'How often do you have a drink containing alcohol?', section: 'alcohol', field: 'auditCFrequency', options: OPTIONS.auditCFrequency }));
  card.appendChild(selectInput({ label: 'How many standard drinks on a typical drinking day?', section: 'alcohol', field: 'auditCTypicalQuantity', options: OPTIONS.auditCQuantity }));
  card.appendChild(selectInput({ label: 'How often do you have six or more drinks on one occasion?', section: 'alcohol', field: 'auditCBingeFrequency', options: OPTIONS.auditCBinge }));
  card.appendChild(subHead('Support'));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Dependence features', section: 'alcohol', field: 'alcoholDependenceFeatures' }),
    yesNo({ label: 'Reduction plan agreed', section: 'alcohol', field: 'alcoholReductionPlanAgreed' }),
    yesNo({ label: 'Alcohol services referral', section: 'alcohol', field: 'alcoholServicesReferral' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Recreational drug use', section: 'alcohol', field: 'recreationalDrugUse' }),
    textInput({ label: 'Which drugs', section: 'alcohol', field: 'recreationalDrugDetail' })
  ]));
  card.appendChild(textArea({ label: 'Alcohol notes', section: 'alcohol', field: 'alcoholNotes', rows: 2 }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10, title: 'Nutritional screening',
    description: 'Domain 5. MUST is computed from body mass index, unintentional weight loss, and the acute disease effect.'
  });
  card.appendChild(grid('three-col', [
    textInput({ label: 'Height', section: 'nutrition', field: 'heightAsCm', type: 'number', step: 0.1, min: 50, max: 250, unit: 'cm' }),
    textInput({ label: 'Weight', section: 'nutrition', field: 'weightAsKg', type: 'number', step: 0.1, min: 15, max: 400, unit: 'kg' }),
    textInput({ label: 'Usual weight', section: 'nutrition', field: 'usualWeightAsKg', type: 'number', step: 0.1, min: 15, max: 400, unit: 'kg' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Body mass index', section: 'nutrition', field: 'derivedBmi', readonly: true, hint: 'Computed from height and weight.' }),
    textInput({ label: 'Unintentional weight loss', section: 'nutrition', field: 'derivedWeightLoss', readonly: true, hint: 'Computed against the usual weight.' })
  ]));
  card.appendChild(yesNo({ label: 'Was the weight loss intentional', section: 'nutrition', field: 'weightLossIsIntentional', hint: 'Only unplanned loss scores in MUST.' }));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Acutely ill', section: 'nutrition', field: 'acutelyIll' }),
    yesNo({ label: 'No nutritional intake likely for more than 5 days', section: 'nutrition', field: 'noNutritionalIntakeOver5Days' })
  ]));
  card.appendChild(selectInput({ label: 'Appetite', section: 'nutrition', field: 'appetite', options: OPTIONS.appetite }));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Oral nutritional supplements', section: 'nutrition', field: 'oralNutritionalSupplements' }),
    yesNo({ label: 'Immunonutrition', section: 'nutrition', field: 'immunonutrition' }),
    yesNo({ label: 'Dietitian referral', section: 'nutrition', field: 'dietitianReferral' })
  ]));
  card.appendChild(textArea({ label: 'Nutrition notes', section: 'nutrition', field: 'nutritionNotes', rows: 2 }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11, title: 'Functional capacity and physical fitness',
    description: 'Domain 6. Prehabilitation needs at least four weeks to show benefit; six or more is preferred.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Usual activity level', section: 'fitness', field: 'usualActivityLevel', options: OPTIONS.activityLevel }),
    selectInput({
      label: 'Can climb a flight of stairs without stopping', section: 'fitness', field: 'climbsFlightOfStairs',
      options: OPTIONS.stairs, hint: 'The plain-language proxy for four metabolic equivalents.'
    })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Estimated METs', section: 'fitness', field: 'metabolicEquivalents', type: 'number', step: 0.1, min: 0, max: 25, hint: 'Below 4 triggers the domain.' }),
    textInput({ label: 'Duke Activity Status Index', section: 'fitness', field: 'dukeActivityStatusIndex', type: 'number', step: 0.01, min: 0, max: 60, hint: 'Below 34 triggers the domain.' })
  ]));
  card.appendChild(grid('three-col', [
    textInput({ label: 'Six-minute walk', section: 'fitness', field: 'sixMinuteWalkMetres', type: 'number', min: 0, max: 1200, unit: 'm' }),
    textInput({ label: 'CPET anaerobic threshold', section: 'fitness', field: 'cpetAnaerobicThreshold', type: 'number', step: 0.1, unit: 'ml/kg/min' }),
    textInput({ label: 'CPET peak VO₂', section: 'fitness', field: 'cpetPeakVo2', type: 'number', step: 0.1, unit: 'ml/kg/min' })
  ]));
  card.appendChild(textInput({ label: 'Hand-grip strength', section: 'fitness', field: 'gripStrengthKg', type: 'number', step: 0.1, min: 0, max: 100, unit: 'kg' }));
  card.appendChild(subHead('Prehabilitation'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Prehabilitation offered', section: 'fitness', field: 'prehabilitationOffered' }),
    yesNo({ label: 'Prehabilitation enrolled', section: 'fitness', field: 'prehabilitationEnrolled', hint: 'Moves the domain to in-progress.' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Sessions per week', section: 'fitness', field: 'prehabilitationSessionsPerWeek', type: 'number', min: 0, max: 21 }),
    textInput({ label: 'Programme start date', section: 'fitness', field: 'prehabilitationStartDate', type: 'date' })
  ]));
  card.appendChild(yesNo({
    label: 'Protein supplementation recommended', section: 'fitness', field: 'proteinSupplementationRecommended',
    hint: 'Particularly for a frail patient on a GLP-1 receptor agonist, at risk of accelerated sarcopenia.'
  }));
  card.appendChild(textArea({ label: 'Fitness notes', section: 'fitness', field: 'fitnessNotes', rows: 2 }));
  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12, title: 'Frailty, cognition and falls',
    description: 'Assessed and flagged, but not gated: frailty is rarely reversible in a weeks-long window, so it shapes the plan rather than stopping the clock.'
  });
  card.appendChild(textInput({
    label: 'Clinical Frailty Scale', section: 'frailty', field: 'clinicalFrailtyScale', type: 'number', min: 1, max: 9,
    hint: '1 very fit to 9 terminally ill. 7 or above raises a flag; 5 or above indicates a Mini-Cog.'
  }));
  card.appendChild(subHead('Fried Frailty Phenotype'));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Weakness', section: 'frailty', field: 'friedWeakness' }),
    yesNo({ label: 'Slowness', section: 'frailty', field: 'friedSlowness' }),
    yesNo({ label: 'Low physical activity', section: 'frailty', field: 'friedLowPhysicalActivity' })
  ]));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Exhaustion', section: 'frailty', field: 'friedExhaustion' }),
    yesNo({ label: 'Unintentional weight loss', section: 'frailty', field: 'friedUnintentionalWeightLoss' }),
    textInput({ label: 'Risk Analysis Index score', section: 'frailty', field: 'riskAnalysisIndexScore', type: 'number', min: 0, max: 100 })
  ]));
  card.appendChild(subHead('Cognitive screening (Mini-Cog)'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Mini-Cog performed', section: 'frailty', field: 'miniCogPerformed', hint: 'Indicated when the Clinical Frailty Scale is 5 or above.' }),
    textInput({ label: 'Mini-Cog score (0-5)', section: 'frailty', field: 'miniCogScore', type: 'number', min: 0, max: 5 })
  ]));
  card.appendChild(grid('three-col', [
    selectInput({ label: 'Cognitive screen tool', section: 'frailty', field: 'cognitiveScreenTool', options: OPTIONS.cognitiveTool }),
    textInput({ label: 'Score', section: 'frailty', field: 'cognitiveScreenScore', type: 'number', step: 0.1 }),
    selectInput({ label: 'Cognitive impairment', section: 'frailty', field: 'cognitiveImpairment', options: OPTIONS.severity4 })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Capacity concern', section: 'frailty', field: 'capacityConcern' }),
    textInput({ label: 'Falls in the last 12 months', section: 'frailty', field: 'fallsInLast12Months', type: 'number', min: 0, max: 100 })
  ]));
  card.appendChild(grid('three-col', [
    selectInput({ label: 'Mobility aid', section: 'frailty', field: 'mobilityAid', options: OPTIONS.mobilityAid }),
    selectInput({ label: 'Living situation', section: 'frailty', field: 'livingSituation', options: OPTIONS.livingSituation }),
    selectInput({ label: 'Care package', section: 'frailty', field: 'carePackage', options: OPTIONS.carePackage })
  ]));
  card.appendChild(textArea({ label: 'Frailty notes', section: 'frailty', field: 'frailtyNotes', rows: 2 }));
  return card;
}

function renderStep13() {
  const card = sectionCard({
    stepNumber: 13, title: 'Cardiorespiratory optimization',
    description: 'Domain 8. Blood pressure at or above 180/110, uncontrolled airways disease, an ejection fraction below 40%, or an unassessed high STOP-BANG all trigger it.'
  });
  card.appendChild(grid('three-col', [
    textInput({ label: 'Systolic BP', section: 'cardioresp', field: 'systolicBp', type: 'number', min: 50, max: 300, unit: 'mmHg' }),
    textInput({ label: 'Diastolic BP', section: 'cardioresp', field: 'diastolicBp', type: 'number', min: 20, max: 200, unit: 'mmHg' }),
    textInput({ label: 'Heart rate', section: 'cardioresp', field: 'heartRate', type: 'number', min: 20, max: 250, unit: 'bpm' })
  ]));
  card.appendChild(grid('three-col', [
    selectInput({ label: 'Rhythm', section: 'cardioresp', field: 'heartRhythm', options: OPTIONS.heartRhythm }),
    yesNo({ label: 'Murmur present', section: 'cardioresp', field: 'murmurPresent' }),
    selectInput({ label: 'Exercise tolerance', section: 'cardioresp', field: 'exerciseTolerance', options: OPTIONS.exerciseTolerance })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Ejection fraction', section: 'cardioresp', field: 'ejectionFractionPercent', type: 'number', min: 5, max: 80, unit: '%' }),
    textInput({ label: 'Echocardiogram date', section: 'cardioresp', field: 'echoDate', type: 'date' })
  ]));
  card.appendChild(subHead('Respiratory'));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Asthma control', section: 'cardioresp', field: 'asthmaControl', options: OPTIONS.airwaysControl }),
    selectInput({ label: 'COPD control', section: 'cardioresp', field: 'copdControl', options: OPTIONS.airwaysControl })
  ]));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Inhaler technique checked', section: 'cardioresp', field: 'inhalerTechniqueChecked' }),
    yesNo({ label: 'Rescue steroids at home', section: 'cardioresp', field: 'rescueSteroids' }),
    textInput({ label: 'Spirometry FEV₁', section: 'cardioresp', field: 'spirometryFev1Percent', type: 'number', step: 0.1, unit: '% predicted' })
  ]));
  card.appendChild(subHead('Sleep-disordered breathing'));
  card.appendChild(grid('three-col', [
    textInput({ label: 'STOP-BANG score', section: 'cardioresp', field: 'stopBangScore', type: 'number', min: 0, max: 8, hint: '5 or more without a diagnosis triggers the domain.' }),
    yesNo({ label: 'Sleep apnoea diagnosed', section: 'cardioresp', field: 'sleepApnoeaDiagnosis' }),
    yesNo({ label: 'Uses CPAP', section: 'cardioresp', field: 'cpapUse' })
  ]));
  card.appendChild(textInput({ label: 'Oxygen saturation on air', section: 'cardioresp', field: 'oxygenSaturationPercent', type: 'number', step: 0.1, min: 50, max: 100, unit: '%' }));
  card.appendChild(textArea({ label: 'Cardiorespiratory notes', section: 'cardioresp', field: 'cardiorespiratoryNotes', rows: 2 }));
  return card;
}

function renderStep14() {
  const card = sectionCard({
    stepNumber: 14, title: 'Psychological readiness and social support',
    description: 'Assessed and flagged rather than gated. A plan the patient cannot follow, or a discharge with no support, undoes the rest of the optimization.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Anxiety about the procedure', section: 'social', field: 'anxietyLevel', options: OPTIONS.severity4 }),
    selectInput({ label: 'Depression screen', section: 'social', field: 'depressionScreen', options: OPTIONS.depressionScreen })
  ]));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Understands the procedure', section: 'social', field: 'understandsProcedure' }),
    yesNo({ label: 'Expectations realistic', section: 'social', field: 'expectationsRealistic' }),
    yesNo({ label: 'Shared decision-making discussed', section: 'social', field: 'sharedDecisionMakingDiscussed' })
  ]));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Has a carer', section: 'social', field: 'hasCarer' }),
    yesNo({ label: 'Transport home arranged', section: 'social', field: 'transportHomeArranged' }),
    selectInput({ label: 'Support after discharge', section: 'social', field: 'supportAfterDischarge', options: OPTIONS.supportAfterDischarge })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Health literacy', section: 'social', field: 'healthLiteracy', options: OPTIONS.healthLiteracy }),
    yesNo({ label: 'Psychological support offered', section: 'social', field: 'psychologicalSupportOffered' })
  ]));
  card.appendChild(textArea({ label: 'Social notes', section: 'social', field: 'socialNotes', rows: 2 }));
  return card;
}

/** The eight plan blocks, one per domain, rendered from the domain table. */
const PLAN_FIELDS = [
  ['anaemia', 'planAnaemia', 'referralAnaemia'],
  ['glycaemic-control', 'planGlycaemicControl', 'referralGlycaemicControl'],
  ['smoking', 'planSmoking', 'referralSmoking'],
  ['alcohol', 'planAlcohol', 'referralAlcohol'],
  ['nutrition', 'planNutrition', 'referralNutrition'],
  ['physical-fitness', 'planPhysicalFitness', 'referralPhysicalFitness'],
  ['medication', 'planMedication', 'referralMedication'],
  ['cardiorespiratory', 'planCardiorespiratory', 'referralCardiorespiratory']
];

function renderStep15() {
  const card = sectionCard({
    stepNumber: 15, title: 'Optimization plan by domain',
    description: 'What will be done for each triggered domain, and whether an onward referral has been made.'
  });
  for (const [domain, planField, referralField] of PLAN_FIELDS) {
    card.appendChild(subHead(DOMAIN_LABELS[domain]));
    card.appendChild(grid('two-col', [
      textArea({ label: `${DOMAIN_LABELS[domain]} plan`, section: 'plan', field: planField, rows: 2 }),
      yesNo({ label: 'Referral made', section: 'plan', field: referralField })
    ]));
  }
  card.appendChild(subHead('Overall'));
  card.appendChild(textInput({ label: 'Responsible clinician', section: 'plan', field: 'responsibleClinician' }));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Plan agreed with the patient', section: 'plan', field: 'planAgreedWithPatient' }),
    yesNo({ label: 'Copy given to the patient', section: 'plan', field: 'planSharedWithPatient' }),
    textInput({ label: 'Next review date', section: 'plan', field: 'nextReviewDate', type: 'date' })
  ]));
  card.appendChild(textArea({ label: 'Plan notes', section: 'plan', field: 'planNotes', rows: 3 }));
  return card;
}

function renderStep16() {
  const card = sectionCard({
    stepNumber: 16, title: 'Readiness summary and sign-off',
    description: 'The computed band is advisory. A clinician must record an explicit gate decision and sign.'
  });
  card.appendChild(note(
    'A computed band of "Defer surgery" has exactly two safe resolutions: move the date so the window exists, or record an explicit accept-unoptimized-risk decision. Choosing neither, and proceeding as if the patient were optimized, is the hazard this form exists to prevent.'
  ));
  card.appendChild(subHead('Clinician override'));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Override readiness band', section: 'signoff', field: 'overrideReadiness', options: OPTIONS.readiness }),
    textInput({
      label: 'Override reason', section: 'signoff', field: 'overrideReason',
      hint: 'Mandatory when the override differs from the computed band. Safety flags are never suppressed.'
    })
  ]));
  card.appendChild(subHead('Gate decision'));
  card.appendChild(selectInput({
    label: 'Decision', section: 'signoff', field: 'gateDecision', options: OPTIONS.gateDecision, required: true
  }));
  card.appendChild(textArea({ label: 'Additional notes', section: 'signoff', field: 'additionalNotes', rows: 3 }));
  card.appendChild(textInput({
    label: 'Signed by', section: 'signoff', field: 'signedByName', required: true,
    hint: 'The responsible clinician must sign before the report is final.'
  }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6,
  renderStep7, renderStep8, renderStep9, renderStep10, renderStep11, renderStep12,
  renderStep13, renderStep14, renderStep15, renderStep16
];

// ----------------------------------------------------------------------
// Live readiness strip
// ----------------------------------------------------------------------

function updateLiveReadiness() {
  const host = document.getElementById('live-readiness');
  if (!host) return;
  const r = calculateOptimization(state);

  const bmiEl = document.getElementById('nutrition-derivedBmi');
  if (bmiEl) bmiEl.value = r.bmi === null ? '—' : `${r.bmi} kg/m²`;
  const wlEl = document.getElementById('nutrition-derivedWeightLoss');
  if (wlEl) wlEl.value = r.weightLossPercent === null ? '—' : `${r.weightLossPercent}%`;

  const weeks = r.gatingApplied
    ? `${r.weeksToSurgery} week${r.weeksToSurgery === 1 ? '' : 's'} to surgery`
    : 'No surgery date — gating not applied';

  host.innerHTML = `
    <span class="band-badge readiness-${esc(r.finalReadiness)}">${esc(labelFor(READINESS_LABELS, r.finalReadiness))}</span>
    <span class="live-weeks">${esc(weeks)}</span>
    <span class="live-counts">
      ${r.counts.optimized} optimized ·
      ${r.counts.inProgress} in progress ·
      ${r.counts.actionRequired} action required ·
      ${r.counts.insufficientTime} short on time
    </span>
  `;
}

// ----------------------------------------------------------------------
// Progress and step list
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'assessment', field: 'clinicianName',     title: 'Context' },
  { step: 2,  section: 'procedure',  field: 'plannedProcedure',  title: 'Procedure' },
  { step: 3,  section: 'history',    field: 'conditionCardiac',  title: 'History' },
  { step: 4,  section: 'medication', field: 'takesPrescriptionMedicines', title: 'Medicines' },
  { step: 5,  section: 'allergy',    field: 'hasDrugAllergy',    title: 'Allergies' },
  { step: 6,  section: 'anaemia',    field: 'haemoglobinGPerL',  title: 'Anaemia' },
  { step: 7,  section: 'glycaemic',  field: 'diabetesType',      title: 'Glycaemic' },
  { step: 8,  section: 'smoking',    field: 'smokingStatus',     title: 'Smoking' },
  { step: 9,  section: 'alcohol',    field: 'alcoholUnitsPerWeek', title: 'Alcohol' },
  { step: 10, section: 'nutrition',  field: 'weightAsKg',        title: 'Nutrition' },
  { step: 11, section: 'fitness',    field: 'usualActivityLevel', title: 'Fitness' },
  { step: 12, section: 'frailty',    field: 'clinicalFrailtyScale', title: 'Frailty' },
  { step: 13, section: 'cardioresp', field: 'systolicBp',        title: 'Cardioresp' },
  { step: 14, section: 'social',     field: 'anxietyLevel',      title: 'Readiness' },
  { step: 15, section: 'plan',       field: 'responsibleClinician', title: 'Plan' },
  { step: 16, section: 'signoff',    field: 'gateDecision',      title: 'Sign-off' }
];

function isAnswered(v) {
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  const answered = STEP_DEFINITIONS.filter((d) => isAnswered(state[d.section][d.field])).length;
  const percent = Math.round((answered / TOTAL_STEPS) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${TOTAL_STEPS} steps started (${percent}%)`;

  const ol = document.getElementById('step-list');
  if (!ol) return;
  let firstUnfinished = -1;
  for (const def of STEP_DEFINITIONS) {
    const li = ol.querySelector(`[data-step="${def.step}"]`);
    if (!li) continue;
    if (isAnswered(state[def.section][def.field])) {
      li.dataset.status = 'finished';
      li.removeAttribute('aria-current');
    } else {
      li.dataset.status = 'waiting';
      li.removeAttribute('aria-current');
      if (firstUnfinished === -1) firstUnfinished = def.step;
    }
  }
  if (firstUnfinished === -1) firstUnfinished = TOTAL_STEPS;
  const current = ol.querySelector(`[data-step="${firstUnfinished}"]`);
  if (current) {
    current.setAttribute('aria-current', 'step');
    if (current.dataset.status === 'waiting') current.dataset.status = 'in-progress';
  }
  ol.dataset.current = String(firstUnfinished - 1);
}

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
      document.getElementById(`step-${def.step}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    ol.appendChild(li);
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
  const form = document.getElementById('assessment-form');
  if (!form) return errors;

  form.querySelectorAll('[data-required]').forEach((input) => {
    const id = input.id;
    if (!(input.value || '').trim()) {
      const labelEl = form.querySelector(`label[for="${id}"]`);
      const label = labelEl ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim() : id;
      errors.push({ id, message: `${label} is required` });
      setFieldError(id, `${label} is required`);
    } else {
      clearFieldError(id);
    }
  });

  // An override without a reason is not auditable.
  const preview = calculateOptimization({
    ...state,
    signoff: { ...state.signoff, overrideReadiness: '' }
  });
  if (state.signoff.overrideReadiness &&
      state.signoff.overrideReadiness !== preview.computedReadiness &&
      !String(state.signoff.overrideReason || '').trim()) {
    const id = 'signoff-overrideReason';
    const message = 'An override reason is required when the final band differs from the computed band';
    errors.push({ id, message });
    setFieldError(id, message);
  }

  // Deferring without acting on it is the hazard the form exists to prevent.
  if (preview.computedReadiness === 'defer-surgery' &&
      ['proceed', 'proceed-with-prehabilitation'].includes(state.signoff.gateDecision)) {
    const id = 'signoff-gateDecision';
    const message =
      'The computed band is "Defer surgery". Choose "Defer and optimize", or record "Accept unoptimized risk" explicitly';
    errors.push({ id, message });
    setFieldError(id, message);
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
    <ul>${errors.map((e) => `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`).join('')}</ul>
  `;
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  summary.focus({ preventScroll: true });
}

// ----------------------------------------------------------------------
// Report
// ----------------------------------------------------------------------

function priorityClass(priority) {
  return priority === 'high' ? 'flag-high' : priority === 'medium' ? 'flag-medium' : 'flag-low';
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;
  const r = lastResult;

  const domainRows = r.domains.map((d) => `
    <tr class="domain-${esc(d.status)}">
      <th scope="row">${esc(DOMAIN_LABELS[d.domain])}</th>
      <td><span class="band-badge status-${esc(d.status)}">${esc(labelFor(STATUS_LABELS, d.status))}</span></td>
      <td>${d.leadTimeWeeks} w</td>
      <td>${d.weeksShortfall === null ? '—' : `${d.weeksShortfall} w short`}</td>
      <td>${esc(d.finding || '—')}</td>
      <td>${esc(d.intervention || '—')}</td>
    </tr>
  `).join('');

  const flagsList = r.flags.length === 0
    ? '<p class="muted">No safety flags raised.</p>'
    : `<ul class="flags">${r.flags.map((f) => `
        <li class="${priorityClass(f.priority)}">
          <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
          <span class="flag-category">${esc(titleCase(f.category))}</span>
          <span class="flag-message">${esc(f.description)}</span>
          <span class="flag-action">${esc(f.suggestedAction)}</span>
        </li>`).join('')}</ul>`;

  const gatingNote = r.gatingApplied
    ? `<p class="muted">${r.weeksToSurgery} week${r.weeksToSurgery === 1 ? '' : 's'} between the assessment on ${esc(state.assessment.assessmentDate)} and the planned surgery on ${esc(state.procedure.plannedSurgeryDate)}.</p>`
    : `<div class="alert" data-type="info" role="alert"><strong>Gating was not applied.</strong> No planned surgery date is recorded, so every triggered domain is reported as action required rather than being tested against its lead time.</div>`;

  const deferBlock = r.recommendedEarliestSurgeryDate
    ? `<div class="alert" data-type="warning" role="alert">
         <strong>Earliest date at which every domain would have its full lead time:
         ${esc(r.recommendedEarliestSurgeryDate)}.</strong>
         Either move the list to that date or later, or record an explicit
         accept-unoptimized-risk decision.
       </div>`
    : '';

  const overrideBlock = r.finalReadiness !== r.computedReadiness
    ? `<div class="alert" data-type="warning" role="alert">
         <strong>Clinician override.</strong>
         Computed band was <strong>${esc(labelFor(READINESS_LABELS, r.computedReadiness))}</strong>;
         the clinician recorded <strong>${esc(labelFor(READINESS_LABELS, r.finalReadiness))}</strong>.
         Reason: ${esc(r.overrideReason || 'not stated')}.
         The safety flags below are unaffected by the override.
       </div>`
    : '';

  out.innerHTML = `
    <h2>Perioperative Optimization Report</h2>
    <p class="muted">
      Generated ${esc(new Date(r.timestamp).toLocaleString())} ·
      ${esc(`${state.patient.firstName} ${state.patient.lastName}`.trim() || 'Patient not named')} ·
      ${esc(state.procedure.plannedProcedure || 'Procedure not stated')} ·
      Assessed by ${esc(state.assessment.clinicianName || '—')}
    </p>

    ${gatingNote}
    ${deferBlock}
    ${overrideBlock}

    <div class="recommendation-banner">
      <span class="band-badge readiness-${esc(r.finalReadiness)}">${esc(labelFor(READINESS_LABELS, r.finalReadiness))}</span>
      ${r.gateDecision ? `<span class="band-badge gate-${esc(r.gateDecision)}">${esc(labelFor(GATE_DECISION_LABELS, r.gateDecision))}</span>` : ''}
    </div>

    <h3>Optimization domains</h3>
    <table class="subscales">
      <thead>
        <tr>
          <th scope="col">Domain</th>
          <th scope="col">Status</th>
          <th scope="col">Lead time</th>
          <th scope="col">Shortfall</th>
          <th scope="col">Finding</th>
          <th scope="col">Intervention</th>
        </tr>
      </thead>
      <tbody>${domainRows}</tbody>
    </table>

    <h3>Screening scores</h3>
    <div class="axis-grid">
      <div class="axis-card"><span class="axis-name">MUST</span><span class="axis-value">${r.mustScore === null ? '—' : `${r.mustScore} / 6 · ${titleCase(r.mustRisk)}`}</span></div>
      <div class="axis-card"><span class="axis-name">AUDIT-C</span><span class="axis-value">${r.auditCScore === null ? '—' : `${r.auditCScore} / 12`}</span></div>
      <div class="axis-card"><span class="axis-name">STOP-BANG</span><span class="axis-value">${r.stopBangScore === null ? '—' : `${r.stopBangScore} / 8`}</span></div>
      <div class="axis-card"><span class="axis-name">Duke Activity Status Index</span><span class="axis-value">${r.dukeActivityStatusIndex === null ? '—' : r.dukeActivityStatusIndex}</span></div>
      <div class="axis-card"><span class="axis-name">Clinical Frailty Scale</span><span class="axis-value">${r.clinicalFrailtyScale === null ? '—' : `${r.clinicalFrailtyScale} / 9`}</span></div>
      <div class="axis-card"><span class="axis-name">Fried Frailty Phenotype</span><span class="axis-value">${r.friedPhenotypeScore === null ? '—' : `${r.friedPhenotypeScore} / 5${r.friedFrailtyCategory ? ` · ${titleCase(r.friedFrailtyCategory)}` : ''}`}</span></div>
      <div class="axis-card"><span class="axis-name">Body mass index</span><span class="axis-value">${r.bmi === null ? '—' : `${r.bmi} kg/m²`}</span></div>
    </div>

    <h3>Safety flags</h3>
    ${flagsList}

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

function exportJson() {
  const payload = JSON.stringify({ assessment: state, grading: lastResult }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'perioperative-optimization.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  lastResult = { ...calculateOptimization(state), timestamp: new Date().toISOString() };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh assessment?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the optimization report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateLiveReadiness();
  updateProgress();
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
  updateLiveReadiness();
  updateProgress();
  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
