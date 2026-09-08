import { calculateGrade } from './grader.js';
import { consultationTypeLabel, emptyResponse, followUpUrgencyLabel, primaryDiagnosisCategoryLabel, responseClassificationLabel, severityLabel } from './types.js';

// Cardiology Response — consult-reply wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page progress
// summary reflects how many fields have been answered. Submission runs the
// pure four-axis interpretation grader and renders an inline response report.
// State is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'cardiology-response.front-end-with-html.v1';
const TOTAL_STEPS = 7;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyResponse();

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
    if (!raw) return emptyResponse();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved response; starting fresh.', e);
    return emptyResponse();
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save response to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored response.', e);
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
/** @type {ReturnType<typeof calculateGrade> | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'cardiology-response',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the interpretation report.</p>';
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
    ${opts.description ? `<span class="field-description">${esc(opts.description)}</span>` : ''}
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

const RESPONSE_STATUS_OPTIONS = [
  { value: 'preliminary', label: 'Preliminary' },
  { value: 'final', label: 'Final' },
  { value: 'amended', label: 'Amended' },
  { value: 'cancelled', label: 'Cancelled' }
];

const CONSULTATION_TYPE_OPTIONS = [
  { value: 'clinic-review', label: 'Clinic review' },
  { value: 'advice-and-guidance', label: 'Advice and guidance' },
  { value: 'telephone', label: 'Telephone' },
  { value: 'inpatient-review', label: 'Inpatient review' },
  { value: 'virtual', label: 'Virtual' }
];

const DIAGNOSIS_CATEGORY_OPTIONS = [
  { value: 'coronary-artery-disease', label: 'Coronary artery disease' },
  { value: 'heart-failure', label: 'Heart failure' },
  { value: 'arrhythmia', label: 'Arrhythmia' },
  { value: 'valve-disease', label: 'Valve disease' },
  { value: 'hypertension', label: 'Hypertension' },
  { value: 'cardiomyopathy', label: 'Cardiomyopathy' },
  { value: 'non-cardiac', label: 'Non-cardiac' },
  { value: 'no-abnormality', label: 'No abnormality' },
  { value: 'other', label: 'Other' }
];

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Response Identification',
    description: 'Who authored the reply, the originating referral, and key dates.'
  });
  card.appendChild(textInput({
    label: 'Responding clinician', section: 'identification', field: 'respondingClinician',
    required: true, placeholder: 'e.g. Dr A Cardiologist'
  }));
  card.appendChild(textInput({
    label: 'Originating request reference', section: 'identification', field: 'originatingRequestReference',
    placeholder: 'e.g. REQ-2001'
  }));
  card.appendChild(grid('two-col', [
    selectInput({
      label: 'Response status', section: 'identification', field: 'responseStatus',
      options: RESPONSE_STATUS_OPTIONS, required: true
    }),
    selectInput({
      label: 'Consultation type', section: 'identification', field: 'consultationType',
      options: CONSULTATION_TYPE_OPTIONS
    })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Assessed date', section: 'identification', field: 'assessedDate', type: 'date' }),
    textInput({ label: 'Responded date', section: 'identification', field: 'respondedDate', type: 'date' })
  ]));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient Identification',
    description: 'Identify the patient this response relates to.'
  });
  card.appendChild(textInput({
    label: 'Patient name', section: 'patient', field: 'patientName', required: true,
    placeholder: 'e.g. Jane Smith'
  }));
  card.appendChild(grid('two-col', [
    textInput({
      label: 'NHS number', section: 'patient', field: 'patientNhsNumber',
      placeholder: 'e.g. 943 476 5919', description: "The patient's 10-digit NHS number."
    }),
    textInput({ label: 'Date of birth', section: 'patient', field: 'patientBirthDate', type: 'date' })
  ]));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Clinical Assessment',
    description: 'The clinical summary, examination, and investigations performed or reviewed.'
  });
  card.appendChild(textArea({
    label: 'Clinical summary', section: 'assessment', field: 'clinicalSummary',
    rows: 5, required: true,
    placeholder: 'Narrative clinical summary of the assessment and the referral question…'
  }));
  card.appendChild(textArea({
    label: 'Examination findings', section: 'assessment', field: 'examinationFindings', rows: 3,
    placeholder: 'Cardiovascular examination findings (pulse, heart sounds, murmurs, signs of failure)…'
  }));
  card.appendChild(textArea({
    label: 'Investigations performed', section: 'assessment', field: 'investigationsPerformed', rows: 3,
    placeholder: 'Investigations performed or reviewed (ECG, echocardiogram, stress test) and their findings…'
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Structured Findings',
    description: 'Structured cardiac findings that drive classification, severity, and flags.'
  });
  card.appendChild(boolField({ label: 'Ischaemia or coronary artery disease', section: 'findings', field: 'ischaemiaOrCad' }));
  card.appendChild(boolField({ label: 'Significant arrhythmia', section: 'findings', field: 'significantArrhythmia' }));
  card.appendChild(boolField({ label: 'Reduced ejection fraction', section: 'findings', field: 'reducedEjectionFraction' }));
  card.appendChild(boolField({ label: 'Significant valve disease', section: 'findings', field: 'significantValveDisease' }));
  card.appendChild(boolField({ label: 'Structural abnormality', section: 'findings', field: 'structuralAbnormality' }));
  card.appendChild(boolField({ label: 'Uncontrolled hypertension', section: 'findings', field: 'uncontrolledHypertension' }));
  card.appendChild(boolField({ label: 'Non-cardiac cause', section: 'findings', field: 'nonCardiacCause' }));

  const alert = document.createElement('div');
  alert.className = 'alert';
  alert.dataset.type = 'warning';
  alert.dataset.conditional = 'findings.majorFinding=true';
  alert.id = 'major-finding-alert';
  alert.innerHTML = `
    <strong>Major finding selected</strong>
    <p>
      Significant valve disease, a reduced ejection fraction, or a significant
      arrhythmia grades the condition severity as major and recommends urgent
      cardiology follow-up. Set the critical-result flag on sign-off if the
      result is critical.
    </p>
  `;
  card.appendChild(alert);
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Diagnosis & Measurement',
    description: 'The diagnosis answering the referral question and the key LV ejection fraction.'
  });
  card.appendChild(selectInput({
    label: 'Primary diagnosis category', section: 'diagnosis', field: 'primaryDiagnosisCategory',
    options: DIAGNOSIS_CATEGORY_OPTIONS
  }));
  card.appendChild(textArea({
    label: 'Diagnosis narrative', section: 'diagnosis', field: 'diagnosisNarrative', rows: 4,
    placeholder: 'Narrative diagnosis answering the referral clinical question…'
  }));
  card.appendChild(textInput({
    label: 'LV ejection fraction (%)', section: 'diagnosis', field: 'lvEjectionFractionPercent',
    type: 'number', min: 0, max: 100, step: 0.1,
    description: 'Left-ventricular ejection fraction (0–100). LVEF < 40 % indicates HFrEF.'
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Management & Follow-up',
    description: 'The management plan, medication changes, and recommended follow-up.'
  });
  card.appendChild(textArea({
    label: 'Management plan', section: 'management', field: 'managementPlan', rows: 4,
    placeholder: 'Management plan including investigations arranged and treatment…'
  }));
  card.appendChild(textArea({
    label: 'Medication changes', section: 'management', field: 'medicationChanges', rows: 3,
    placeholder: 'Medication changes recommended or made…'
  }));
  card.appendChild(textArea({
    label: 'Recommended follow-up', section: 'management', field: 'recommendedFollowUp', rows: 3,
    placeholder: 'Recommended follow-up, including who should action it and when…'
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Sign-off',
    description: 'Critical-result communication and sign-off. Submit to compute the four-axis grade and flags.'
  });
  card.appendChild(subHead('Critical result'));
  card.appendChild(boolField({
    label: 'A critical or unexpected significant cardiac result is present (auto-escalates to critical alert)',
    section: 'signOff', field: 'criticalResult'
  }));

  const alert = document.createElement('div');
  alert.className = 'alert';
  alert.dataset.type = 'error';
  alert.dataset.conditional = 'signOff.criticalResult=true';
  alert.id = 'critical-result-alert';
  alert.innerHTML = `
    <strong>Critical-result alert</strong>
    <p>
      This response contains a critical result. Communicate it directly to the
      referrer, arrange urgent review, and record the communication below before
      signing.
    </p>
  `;
  card.appendChild(alert);

  card.appendChild(subHead('Critical-result communication'));
  card.appendChild(boolField({
    label: 'Critical / urgent result communicated to referrer',
    section: 'signOff', field: 'criticalResultCommunicated'
  }));
  card.appendChild(textInput({
    label: 'Reported to', section: 'signOff', field: 'reportedTo',
    placeholder: 'Who was informed, with date and time'
  }));
  card.appendChild(textArea({
    label: 'Interpretation / sign-off notes', section: 'signOff', field: 'clinicianNotes', rows: 3
  }));
  card.appendChild(subHead('Sign-off'));
  card.appendChild(boolField({
    label: 'I sign and authorise this response', section: 'signOff', field: 'signed'
  }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7
];

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');

    let current;
    if (section === 'findings' && field === 'majorFinding') {
      // Synthetic predicate: any major structured finding selected.
      const f = state.findings;
      current = String(
        f.significantValveDisease || f.reducedEjectionFraction || f.significantArrhythmia
      );
    } else {
      current = String(state[section]?.[field] ?? '');
    }
    host.style.display = current === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // 1 Identification
  ['identification', 'respondingClinician'], ['identification', 'responseStatus'],
  ['identification', 'consultationType'], ['identification', 'respondedDate'],
  // 2 Patient
  ['patient', 'patientName'], ['patient', 'patientNhsNumber'],
  // 3 Assessment
  ['assessment', 'clinicalSummary'], ['assessment', 'examinationFindings'],
  ['assessment', 'investigationsPerformed'],
  // 5 Diagnosis
  ['diagnosis', 'primaryDiagnosisCategory'], ['diagnosis', 'diagnosisNarrative'],
  // 6 Management
  ['management', 'managementPlan'], ['management', 'recommendedFollowUp'],
  // 7 Sign-off
  ['signOff', 'signed']
];

function isAnswered(v) {
  return v !== null && v !== undefined && v !== '' && v !== false;
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
  { step: 1, section: 'identification', title: 'Identification' },
  { step: 2, section: 'patient',        title: 'Patient' },
  { step: 3, section: 'assessment',     title: 'Assessment' },
  { step: 4, section: 'findings',       title: 'Findings' },
  { step: 5, section: 'diagnosis',      title: 'Diagnosis' },
  { step: 6, section: 'management',     title: 'Management' },
  { step: 7, section: 'signOff',        title: 'Sign-off' }
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
    responseClassification,
    severity,
    severityCategory,
    completenessPercent,
    followUpUrgency,
    targetTimeframe,
    recommendedAction,
    recommendation,
    recommendationLabel,
    firedRules,
    flags,
    timestamp
  } = lastResult;

  const flagsList = flags.length === 0
    ? `<p class="muted">No safety flags raised.</p>`
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
    <h2>Cardiology Response Interpretation Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())} · Patient: ${esc(state.patient.patientName || '—')} · Consultation: ${esc(consultationTypeLabel(state.identification.consultationType))} · Diagnosis: ${esc(primaryDiagnosisCategoryLabel(state.diagnosis.primaryDiagnosisCategory))}</p>

    <div class="recommendation-banner">
      <span class="band-badge rec-${esc(recommendation)}">${esc(recommendationLabel)}</span>
      <span class="band-badge urgency-${esc(followUpUrgency)}">${esc(followUpUrgencyLabel(followUpUrgency))}${targetTimeframe ? ` · ${esc(targetTimeframe)}` : ''}</span>
    </div>

    <h3>Four-axis interpretation grade</h3>
    <div class="axis-grid">
      <div class="axis-card">
        <span class="axis-name">A · Classification</span>
        <span class="axis-value">
          <span class="band-badge classification-${esc(responseClassification)}">${esc(responseClassificationLabel(responseClassification))}</span>
        </span>
      </div>
      <div class="axis-card">
        <span class="axis-name">B · Severity</span>
        <span class="axis-value">
          <span class="band-badge severity-${esc(severity)}">${esc(severityLabel(severity))}</span>
          ${severityCategory ? `<span class="muted"> · ${esc(severityCategory)}</span>` : ''}
        </span>
      </div>
      <div class="axis-card">
        <span class="axis-name">C · Completeness</span>
        <span class="axis-value"><strong>${completenessPercent}%</strong></span>
        <div class="completeness-bar"><span style="width:${completenessPercent}%"></span></div>
      </div>
      <div class="axis-card">
        <span class="axis-name">D · Follow-up urgency</span>
        <span class="axis-value"><span class="band-badge urgency-${esc(followUpUrgency)}">${esc(followUpUrgencyLabel(followUpUrgency))}</span></span>
        ${targetTimeframe ? `<span class="muted">${esc(targetTimeframe)}</span>` : ''}
      </div>
    </div>

    ${recommendedAction ? `<p class="recommended-action"><strong>Recommended action:</strong> ${esc(recommendedAction)}</p>` : ''}

    <h3>Fired rules</h3>
    ${firedTable}

    <h3>Safety flags</h3>
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
  if (!confirm('Clear all answers and start a fresh response?')) return;
  clearState();
  state = emptyResponse();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the interpretation report.</p>';
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
