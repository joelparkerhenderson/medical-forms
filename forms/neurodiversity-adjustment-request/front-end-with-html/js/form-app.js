import { calculateGrade } from './grader.js';
import { diagnosisStatusLabel, emptyRequest, impactLabel } from './types.js';

// Neurodiversity Adjustment Request — reasonable-adjustments wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page progress
// summary reflects how many fields have been answered. Submission runs the pure
// four-axis grader and renders an inline request report. State is persisted to
// localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'neurodiversity-adjustment-request.front-end-with-html.v1';
try { window.__A11Y_DRAFT_KEY__ = STORAGE_KEY; } catch (e) {}
const TOTAL_STEPS = 8;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyRequest();

  for (const key of Object.keys(fresh)) {
    const v = parsed && parsed[key];
    if (Array.isArray(fresh[key])) {
      fresh[key] = Array.isArray(v) ? v : [];
    } else if (v && typeof v === 'object') {
      fresh[key] = { ...fresh[key], ...v };
    }
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyRequest();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved request; starting fresh.', e);
    return emptyRequest();
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save request to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored request.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

let state = loadState();
/** @type {ReturnType<typeof calculateGrade> | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'neurodiversity-adjustment-request',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the request report.</p>';
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

function setBool(section, field, checked) {
  state[section][field] = !!checked;
  saveState(state);
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
// Component builders
// ----------------------------------------------------------------------

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
    <input ${attrs.join(' ')}>
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
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
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.required ? 'data-required' : ''}
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
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
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select"${opts.required ? ' data-required' : ''} aria-describedby="${id}-error">
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

/** Single boolean toggle (checkbox) bound to a boolean field. */
function boolField(opts) {
  const id = `${opts.section}-${opts.field}`;
  const checked = state[opts.section][opts.field] === true;
  const wrapper = document.createElement('div');
  wrapper.className = 'bool-field';
  wrapper.innerHTML = `
    <input type="checkbox" class="checkbox-input" id="${id}" name="${id}"${checked ? ' checked' : ''}>
    <label for="${id}">${esc(opts.label)}</label>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('change', () => {
    setBool(opts.section, opts.field, input.checked);
  });
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
  const g = document.createElement('div');
  g.className = cols;
  for (const c of children) g.appendChild(c);
  return g;
}

// ----------------------------------------------------------------------
// Option lists
// ----------------------------------------------------------------------

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'fixed-term', label: 'Fixed-term' },
  { value: 'agency', label: 'Agency' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'apprentice', label: 'Apprentice' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'other', label: 'Other' }
];

const WORK_PATTERN_OPTIONS = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'shift', label: 'Shift' },
  { value: 'flexible', label: 'Flexible' },
  { value: 'other', label: 'Other' }
];

const WORK_LOCATION_OPTIONS = [
  { value: 'office', label: 'Office' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'field', label: 'Field' },
  { value: 'other', label: 'Other' }
];

const MANAGER_ROLE_OPTIONS = [
  { value: 'line-manager', label: 'Line manager' },
  { value: 'hr-adviser', label: 'HR adviser' },
  { value: 'occupational-health', label: 'Occupational health' },
  { value: 'diversity-lead', label: 'Diversity lead' },
  { value: 'senior-manager', label: 'Senior manager' },
  { value: 'other', label: 'Other' }
];

const REQUESTED_BY_OPTIONS = [
  { value: 'worker', label: 'Worker' },
  { value: 'manager', label: 'Manager' },
  { value: 'occupational-health', label: 'Occupational health' },
  { value: 'other', label: 'Other' }
];

const DIAGNOSIS_STATUS_OPTIONS = [
  { value: 'diagnosed', label: 'Diagnosed' },
  { value: 'self-identified', label: 'Self-identified' },
  { value: 'awaiting-assessment', label: 'Awaiting assessment' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

const CONSIDERS_DISABILITY_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Unsure' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

const SUPPORTING_EVIDENCE_OPTIONS = [
  { value: 'occupational-health', label: 'Occupational-health report' },
  { value: 'gp-letter', label: 'GP letter' },
  { value: 'diagnostic-report', label: 'Diagnostic report' },
  { value: 'access-to-work', label: 'Access to Work assessment' },
  { value: 'none', label: 'None' }
];

const CURRENT_IMPACT_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'severe', label: 'Severe' }
];

const URGENCY_OPTIONS = [
  { value: 'routine', label: 'Routine' },
  { value: 'soon', label: 'Soon' },
  { value: 'urgent', label: 'Urgent' }
];

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Worker & role',
    description: 'Identify the worker the adjustments are for and their role.'
  });
  card.appendChild(textInput({ label: 'Worker name', section: 'worker', field: 'name', required: true }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Job title', section: 'worker', field: 'jobTitle' }),
    textInput({ label: 'Department / team', section: 'worker', field: 'department' })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Employment type', section: 'worker', field: 'employmentType', options: EMPLOYMENT_TYPE_OPTIONS }),
    selectInput({ label: 'Work pattern', section: 'worker', field: 'workPattern', options: WORK_PATTERN_OPTIONS })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Work location', section: 'worker', field: 'workLocation', options: WORK_LOCATION_OPTIONS }),
    textInput({ label: 'Employment start date', section: 'worker', field: 'employmentStartDate', type: 'date' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Employee reference', section: 'worker', field: 'employeeReference' }),
    textInput({ label: 'Email', section: 'worker', field: 'email', type: 'email' })
  ]));
  card.appendChild(textInput({ label: 'Phone', section: 'worker', field: 'phone', type: 'tel' }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Handler',
    description: 'The manager or HR contact who will receive and handle the request, and who is making it.'
  });
  card.appendChild(textInput({ label: 'Manager / HR contact name', section: 'manager', field: 'name', required: true }));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Role', section: 'manager', field: 'role', options: MANAGER_ROLE_OPTIONS }),
    textInput({ label: 'Job title', section: 'manager', field: 'jobTitle' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Department', section: 'manager', field: 'department' }),
    textInput({ label: 'Email', section: 'manager', field: 'email', type: 'email' })
  ]));
  card.appendChild(textInput({ label: 'Phone', section: 'manager', field: 'phone', type: 'tel' }));
  card.appendChild(subHead('Request details'));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Requested by', section: 'request', field: 'requestedBy', options: REQUESTED_BY_OPTIONS }),
    textInput({ label: 'Request date', section: 'request', field: 'requestDate', type: 'date' })
  ]));
  card.appendChild(textInput({ label: 'Proposed adjustments start date', section: 'request', field: 'requestedStartDate', type: 'date' }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Neurodivergent profile',
    description: 'A formal diagnosis is not required for the Equality Act 2010 duty to apply. A substantial and long-term adverse effect drives the eligibility axis.'
  });
  card.appendChild(subHead('Conditions'));
  card.appendChild(boolField({ label: 'ADHD', section: 'profile', field: 'conditionAdhd' }));
  card.appendChild(boolField({ label: 'Autism', section: 'profile', field: 'conditionAutism' }));
  card.appendChild(boolField({ label: 'Dyslexia', section: 'profile', field: 'conditionDyslexia' }));
  card.appendChild(boolField({ label: 'Dyspraxia', section: 'profile', field: 'conditionDyspraxia' }));
  card.appendChild(boolField({ label: 'Dyscalculia', section: 'profile', field: 'conditionDyscalculia' }));
  card.appendChild(boolField({ label: "Tourette's / tic disorder", section: 'profile', field: 'conditionTourettes' }));
  card.appendChild(boolField({ label: 'Other neurodivergence', section: 'profile', field: 'conditionOther' }));
  card.appendChild(textInput({ label: 'Other condition detail', section: 'profile', field: 'conditionOtherDetail' }));
  card.appendChild(subHead('Disability status'));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Diagnosis status', section: 'profile', field: 'diagnosisStatus', options: DIAGNOSIS_STATUS_OPTIONS }),
    selectInput({ label: 'Considers this a disability?', section: 'profile', field: 'considersDisability', options: CONSIDERS_DISABILITY_OPTIONS })
  ]));
  card.appendChild(boolField({ label: 'Substantial and long-term adverse effect on day-to-day activities (Equality Act 2010 test)', section: 'profile', field: 'substantialLongTermImpact' }));
  card.appendChild(boolField({ label: 'Consents to share these details with HR / occupational health', section: 'profile', field: 'disclosureConsent' }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Functional difficulties',
    description: 'The ACAS functional areas where the worker experiences a substantial disadvantage.'
  });
  card.appendChild(boolField({ label: 'Concentration / focus', section: 'difficulties', field: 'difficultyConcentration' }));
  card.appendChild(boolField({ label: 'Reading / written communication', section: 'difficulties', field: 'difficultyWrittenCommunication' }));
  card.appendChild(boolField({ label: 'Organisation / time management', section: 'difficulties', field: 'difficultyOrganisationTime' }));
  card.appendChild(boolField({ label: 'Sensory overload', section: 'difficulties', field: 'difficultySensoryOverload' }));
  card.appendChild(boolField({ label: 'Balance / coordination', section: 'difficulties', field: 'difficultyBalanceCoordination' }));
  card.appendChild(boolField({ label: 'Social interaction / verbal communication', section: 'difficulties', field: 'difficultySocialCommunication' }));
  card.appendChild(boolField({ label: 'Working memory / recall', section: 'difficulties', field: 'difficultyMemory' }));
  card.appendChild(boolField({ label: 'Fatigue / burnout / wellbeing', section: 'difficulties', field: 'difficultyBurnoutWellbeing' }));
  card.appendChild(textArea({
    label: 'Tasks and situations affected', section: 'difficulties', field: 'tasksSituationsAffected', rows: 3,
    placeholder: 'Specific tasks and situations at work where the difficulties cause a substantial disadvantage.'
  }));
  card.appendChild(textArea({
    label: 'Worker strengths', section: 'difficulties', field: 'workerStrengths', rows: 2,
    placeholder: 'Strengths the worker brings that adjustments can help them make the most of.'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Requested adjustments',
    description: 'The ACAS adjustment categories being requested. Add specific detail below.'
  });
  card.appendChild(boolField({ label: 'Working environment (quiet space, lighting, desk location, screens)', section: 'adjustments', field: 'adjustmentWorkingEnvironment' }));
  card.appendChild(boolField({ label: 'Equipment / assistive technology (noise-cancelling headphones, screen reader, speech-to-text)', section: 'adjustments', field: 'adjustmentEquipmentTechnology' }));
  card.appendChild(boolField({ label: 'Working arrangements (flexible hours, remote / hybrid, phased return, planned breaks)', section: 'adjustments', field: 'adjustmentWorkingArrangements' }));
  card.appendChild(boolField({ label: 'Communication (written instructions, tasks broken into steps, regular check-ins)', section: 'adjustments', field: 'adjustmentCommunication' }));
  card.appendChild(boolField({ label: 'Support / mentoring (mentor / buddy, coaching, extra training, job aids)', section: 'adjustments', field: 'adjustmentSupportMentoring' }));
  card.appendChild(boolField({ label: 'Recruitment / selection / assessment process', section: 'adjustments', field: 'adjustmentRecruitmentProcess' }));
  card.appendChild(boolField({ label: 'Policy / dress code (softer materials, absence-policy flexibility)', section: 'adjustments', field: 'adjustmentPolicyDress' }));
  card.appendChild(boolField({ label: 'Other adjustment', section: 'adjustments', field: 'adjustmentOther' }));
  card.appendChild(textArea({
    label: 'Requested-adjustments detail', section: 'adjustments', field: 'adjustmentsRequestedDetail', rows: 3,
    placeholder: 'Describe the specific adjustments requested.'
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Evidence & support',
    description: 'Any supporting evidence and whether occupational health or Access to Work is involved.'
  });
  card.appendChild(selectInput({
    label: 'Supporting evidence type', section: 'evidence', field: 'supportingEvidenceType',
    options: SUPPORTING_EVIDENCE_OPTIONS
  }));
  card.appendChild(boolField({ label: 'Occupational health has been or should be involved', section: 'evidence', field: 'occupationalHealthInvolved' }));
  card.appendChild(boolField({ label: 'Access to Work is involved or has been applied for', section: 'evidence', field: 'accessToWorkInvolved' }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Impact & urgency',
    description: 'Being at risk of absence / burnout, or a severe current impact, drives the impact axis and auto-escalates the priority tier.'
  });
  card.appendChild(selectInput({ label: 'Current impact on work and wellbeing', section: 'impact', field: 'currentImpact', options: CURRENT_IMPACT_OPTIONS }));
  card.appendChild(boolField({ label: 'At risk of sickness absence or burnout without adjustments', section: 'impact', field: 'atRiskOfAbsence' }));
  card.appendChild(selectInput({ label: 'Requested urgency', section: 'impact', field: 'urgency', options: URGENCY_OPTIONS }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Review & submit',
    description: 'Add any notes, then submit to compute the four-axis grade and flags.'
  });
  card.appendChild(textArea({ label: 'Notes', section: 'impact', field: 'notes', rows: 3 }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7, renderStep8
];

// ----------------------------------------------------------------------
// Conditional sections (none currently, but keep the hook for parity)
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
  // 1 Worker
  ['worker', 'name'], ['worker', 'jobTitle'], ['worker', 'employmentType'],
  // 2 Handler
  ['manager', 'name'], ['manager', 'role'],
  // 3 Profile
  ['profile', 'diagnosisStatus'], ['profile', 'considersDisability'],
  // 4 Difficulties
  ['difficulties', 'tasksSituationsAffected'],
  // 5 Adjustments
  ['adjustments', 'adjustmentsRequestedDetail'],
  // 6 Evidence
  ['evidence', 'supportingEvidenceType'],
  // 7 Impact
  ['impact', 'currentImpact'], ['impact', 'urgency']
];

const SECTION_BY_STEP = {
  1: 'worker', 2: 'manager', 3: 'profile', 4: 'difficulties',
  5: 'adjustments', 6: 'evidence', 7: 'impact', 8: 'impact'
};

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
  { step: 1, section: 'worker',       title: 'Worker' },
  { step: 2, section: 'manager',      title: 'Handler' },
  { step: 3, section: 'profile',      title: 'Profile' },
  { step: 4, section: 'difficulties', title: 'Difficulties' },
  { step: 5, section: 'adjustments',  title: 'Adjustments' },
  { step: 6, section: 'evidence',     title: 'Evidence' },
  { step: 7, section: 'impact',       title: 'Impact' },
  { step: 8, section: 'impact',       title: 'Review' }
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
  const required = form.querySelectorAll('[data-required]');
  required.forEach((input) => {
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

  const {
    eligibilityBand,
    impactBand,
    completenessPercent,
    priorityTier,
    targetTimeframe,
    recommendation,
    recommendationLabel,
    firedRules,
    flags,
    timestamp
  } = lastResult;

  const flagsList = flags.length === 0
    ? `<p class="muted">No compliance or wellbeing flags raised.</p>`
    : `
      <ul class="flags">
        ${flags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}</span>
            <span class="flag-action">${esc(f.suggestedAction)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const firedRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.ruleId)}</th>
      <td>${esc(r.axis)}</td>
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No rules fired.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Rule</th>
            <th scope="col">Axis</th>
            <th scope="col">Category</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <h2>Reasonable-Adjustments Request Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())} · Worker: ${esc(state.worker.name || '—')} · Diagnosis: ${esc(diagnosisStatusLabel(state.profile.diagnosisStatus) || '—')} · Impact: ${esc(impactLabel(state.impact.currentImpact) || '—')}</p>

    <div class="recommendation-banner">
      <span class="band-badge rec-${esc(recommendation)}">${esc(recommendationLabel)}</span>
      <span class="band-badge tier-${esc(priorityTier)}">${esc(titleCase(priorityTier))}${targetTimeframe ? ` · ${esc(targetTimeframe)}` : ''}</span>
    </div>

    <h3>Four-axis grade</h3>
    <div class="axis-grid">
      <div class="axis-card">
        <span class="axis-name">A · Eligibility</span>
        <span class="axis-value">
          <span class="band-badge elig-${esc(eligibilityBand)}">${esc(titleCase(eligibilityBand))}</span>
        </span>
      </div>
      <div class="axis-card">
        <span class="axis-name">B · Impact / wellbeing</span>
        <span class="axis-value"><span class="band-badge impact-${esc(impactBand)}">${esc(titleCase(impactBand))}</span></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">C · Completeness</span>
        <span class="axis-value"><strong>${completenessPercent}%</strong></span>
        <div class="completeness-bar"><span style="width:${completenessPercent}%"></span></div>
      </div>
      <div class="axis-card">
        <span class="axis-name">D · Priority</span>
        <span class="axis-value"><span class="band-badge tier-${esc(priorityTier)}">${esc(titleCase(priorityTier))}</span></span>
      </div>
    </div>

    <h3>Fired rules</h3>
    ${firedTable}

    <h3>Compliance & wellbeing flags</h3>
    ${flagsList}

    <div class="report-actions">
      <button type="button" id="print-btn" class="button" data-variant="secondary">Print / save PDF</button>
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
  document.getElementById('print-btn').addEventListener('click', () => window.print());
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const result = calculateGrade(state);
  lastResult = {
    ...result,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh request?')) return;
  clearState();
  state = emptyRequest();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the request report.</p>';
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
  for (const r of STEP_RENDERERS) host.appendChild(r());
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
