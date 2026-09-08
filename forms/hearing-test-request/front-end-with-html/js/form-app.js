import { calculateGrade } from './grader.js';
import { emptyRequest, testTypeLabel } from './types.js';

// Hearing Test Request — clinician referral wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page progress
// summary reflects how many fields have been answered. Submission runs the
// pure four-axis grader and renders an inline vetting report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'hearing-test-request.front-end-form-with-html.v1';
const TOTAL_STEPS = 6;

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
  slug: 'hearing-test-request',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the vetting report.</p>';
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

const TEST_TYPE_OPTIONS = [
  { value: 'pure-tone-audiometry', label: 'Pure-tone audiometry' },
  { value: 'tympanometry', label: 'Tympanometry' },
  { value: 'speech-audiometry', label: 'Speech audiometry' },
  { value: 'otoacoustic-emissions', label: 'Otoacoustic emissions' },
  { value: 'auditory-brainstem-response', label: 'Auditory brainstem response' },
  { value: 'newborn-hearing-screen', label: 'Newborn hearing screen' },
  { value: 'hearing-aid-assessment', label: 'Hearing-aid assessment' },
  { value: 'other', label: 'Other' }
];

const LATERALITY_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'bilateral', label: 'Bilateral' },
  { value: 'not-applicable', label: 'Not applicable' }
];

const INDICATION_OPTIONS = [
  { value: 'hearing-loss', label: 'Hearing loss' },
  { value: 'tinnitus', label: 'Tinnitus' },
  { value: 'vertigo', label: 'Vertigo' },
  { value: 'ear-discharge', label: 'Ear discharge' },
  { value: 'suspected-otosclerosis', label: 'Suspected otosclerosis' },
  { value: 'occupational-noise', label: 'Occupational noise exposure' },
  { value: 'ototoxic-monitoring', label: 'Ototoxic monitoring' },
  { value: 'developmental-delay-child', label: 'Developmental delay (child)' },
  { value: 'hearing-aid-review', label: 'Hearing-aid review' },
  { value: 'sudden-hearing-loss', label: 'Sudden hearing loss' },
  { value: 'other', label: 'Other' }
];

const ONSET_WITHIN_OPTIONS = [
  { value: 'within-30-days', label: 'Within the past 30 days' },
  { value: 'over-30-days', label: 'More than 30 days ago' }
];

const URGENCY_OPTIONS = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergency', label: 'Emergency' }
];

const SETTING_OPTIONS = [
  { value: 'outpatient', label: 'Outpatient' },
  { value: 'inpatient', label: 'Inpatient' },
  { value: 'community', label: 'Community' },
  { value: 'emergency', label: 'Emergency' }
];

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Requesting clinician',
    description: 'Identify the clinician making this referral.'
  });
  card.appendChild(textInput({ label: 'Clinician name', section: 'clinician', field: 'clinicianName', required: true }));
  card.appendChild(selectInput({
    label: 'Clinician role', section: 'clinician', field: 'clinicianRole',
    options: [
      { value: 'audiologist', label: 'Audiologist' },
      { value: 'ent-surgeon', label: 'ENT surgeon' },
      { value: 'gp', label: 'GP' },
      { value: 'hearing-therapist', label: 'Hearing therapist' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(grid('two-col', [
    selectInput({
      label: 'Registration body', section: 'clinician', field: 'registrationBody',
      options: [
        { value: 'GMC', label: 'GMC' },
        { value: 'NMC', label: 'NMC' },
        { value: 'HCPC', label: 'HCPC' },
        { value: 'RCCP', label: 'RCCP' },
        { value: 'other', label: 'Other' }
      ]
    }),
    textInput({ label: 'Registration number', section: 'clinician', field: 'registrationNumber' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Requester contact (bleep / phone)', section: 'clinician', field: 'requesterContact' }),
    textInput({ label: 'Supervising consultant', section: 'clinician', field: 'supervisingConsultant' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Site / clinic name', section: 'clinician', field: 'siteName' }),
    textInput({ label: 'Referral date', section: 'clinician', field: 'referralDate', type: 'date' })
  ]));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Patient demographics and access needs.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'First name', section: 'patient', field: 'firstName', required: true }),
    textInput({ label: 'Last name', section: 'patient', field: 'lastName', required: true })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Date of birth', section: 'patient', field: 'dateOfBirth', type: 'date' }),
    textInput({ label: 'NHS number', section: 'patient', field: 'nhsNumber', placeholder: 'NNN NNN NNNN' })
  ]));
  card.appendChild(boolField({ label: 'Interpreter required', section: 'patient', field: 'interpreterRequired' }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Requested examination',
    description: 'Test type, laterality, indication, and the specific clinical question — the highest-value fields.'
  });
  card.appendChild(grid('two-col', [
    selectInput({
      label: 'Requested test type', section: 'request', field: 'testType',
      options: TEST_TYPE_OPTIONS, required: true
    }),
    selectInput({
      label: 'Laterality', section: 'request', field: 'laterality',
      options: LATERALITY_OPTIONS
    })
  ]));
  card.appendChild(selectInput({
    label: 'Primary indication', section: 'request', field: 'primaryIndication',
    options: INDICATION_OPTIONS, required: true
  }));
  card.appendChild(textArea({
    label: 'Specific clinical question', section: 'request', field: 'clinicalQuestion',
    rows: 2, required: true,
    placeholder: 'e.g. Quantify the degree and configuration of hearing loss in the left ear.'
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'History',
    description: 'Relevant medical, otological, and noise-exposure history.'
  });
  card.appendChild(textArea({
    label: 'Relevant history', section: 'request', field: 'relevantHistory', rows: 3,
    placeholder: 'e.g. Previous middle-ear surgery; 20 years industrial noise exposure; family history of otosclerosis.'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Symptoms & red flags',
    description: 'Red flags auto-escalate the urgency triage tier regardless of the other axes.'
  });
  card.appendChild(subHead('Symptoms'));
  card.appendChild(boolField({ label: 'Hearing loss', section: 'symptoms', field: 'hearingLoss' }));
  card.appendChild(boolField({ label: 'Tinnitus', section: 'symptoms', field: 'tinnitus' }));
  card.appendChild(boolField({ label: 'Vertigo / imbalance', section: 'symptoms', field: 'vertigo' }));
  card.appendChild(boolField({ label: 'Otalgia (ear pain)', section: 'symptoms', field: 'otalgia' }));

  card.appendChild(subHead('Red flags'));
  card.appendChild(boolField({ label: 'Sudden onset of hearing loss', section: 'symptoms', field: 'suddenOnset' }));

  const onsetHost = document.createElement('div');
  onsetHost.dataset.conditional = 'symptoms.suddenOnset=true';
  onsetHost.appendChild(selectInput({
    label: 'Time since onset', section: 'symptoms', field: 'onsetWithinDays',
    options: ONSET_WITHIN_OPTIONS
  }));
  card.appendChild(onsetHost);

  card.appendChild(boolField({ label: 'Ear discharge (otorrhoea)', section: 'symptoms', field: 'earDischarge' }));
  card.appendChild(boolField({ label: 'On ototoxic medication', section: 'symptoms', field: 'ototoxicMedication' }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Triage & submit',
    description: 'Requested urgency, setting, and notes. Submit to compute the four-axis grade and flags.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Requested urgency', section: 'triage', field: 'urgency', options: URGENCY_OPTIONS, required: true }),
    textInput({ label: 'Requested-by date', section: 'triage', field: 'requestedByDate', type: 'date' })
  ]));
  card.appendChild(selectInput({
    label: 'Care setting', section: 'triage', field: 'setting',
    options: SETTING_OPTIONS
  }));
  card.appendChild(textArea({ label: 'Notes', section: 'triage', field: 'notes', rows: 3 }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6
];

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
  // 1 Clinician
  ['clinician', 'clinicianName'], ['clinician', 'clinicianRole'],
  ['clinician', 'referralDate'],
  // 2 Patient
  ['patient', 'firstName'], ['patient', 'lastName'],
  ['patient', 'dateOfBirth'], ['patient', 'nhsNumber'],
  // 3 Request
  ['request', 'testType'], ['request', 'laterality'],
  ['request', 'primaryIndication'], ['request', 'clinicalQuestion'],
  // 4 History
  ['request', 'relevantHistory'],
  // 6 Triage
  ['triage', 'urgency'], ['triage', 'setting']
];

function isAnswered(v) {
  return v !== null && v !== undefined && v !== '';
}

// Map each tracked field to the wizard step it belongs to (so the step list
// can reflect per-step completion even though several fields share the
// `request` data section).
function stepForTracked(section, field) {
  if (section === 'clinician') return 'clinician';
  if (section === 'patient') return 'patient';
  if (section === 'triage') return 'triage';
  if (section === 'request') {
    return field === 'relevantHistory' ? 'history' : 'request';
  }
  return section;
}

function updateProgress() {
  let answered = 0;
  const stepAnswered = {};
  const stepTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    const step = stepForTracked(section, field);
    stepTotal[step] = (stepTotal[step] || 0) + 1;
    if (isAnswered(state[section][field])) {
      answered++;
      stepAnswered[step] = (stepAnswered[step] || 0) + 1;
    }
  }
  const total = TRACKED_FIELDS.length;
  const percent = Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(stepAnswered, stepTotal);
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'clinician', title: 'Clinician' },
  { step: 2, section: 'patient',   title: 'Patient' },
  { step: 3, section: 'request',   title: 'Examination' },
  { step: 4, section: 'history',   title: 'History' },
  { step: 5, section: 'symptoms',  title: 'Symptoms' },
  { step: 6, section: 'triage',    title: 'Triage' }
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

function updateStepListStatuses(stepAnswered, stepTotal) {
  const ol = document.getElementById('step-list');
  if (!ol) return;
  let firstUnfinished = -1;
  for (const def of STEP_DEFINITIONS) {
    const li = ol.querySelector(`[data-step="${def.step}"]`);
    if (!li) continue;
    const a = stepAnswered[def.section] || 0;
    const t = stepTotal[def.section] || 0;
    // Symptoms has no tracked text fields; treat as informational.
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
    appropriatenessScore,
    appropriatenessBand,
    triageTier,
    targetTimeframe,
    completenessPercent,
    priorityBand,
    recommendation,
    recommendationLabel,
    firedRules,
    flags,
    timestamp
  } = lastResult;

  const lat = state.request.laterality
    ? titleCase(state.request.laterality)
    : '';

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
    <h2>Hearing Test Request Vetting Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())} · Test: ${esc(testTypeLabel(state.request.testType) || '—')}${lat ? ` · ${esc(lat)}` : ''}</p>

    <div class="recommendation-banner">
      <span class="band-badge rec-${esc(recommendation)}">${esc(recommendationLabel)}</span>
      <span class="band-badge tier-${esc(triageTier)}">${esc(titleCase(triageTier))}${targetTimeframe ? ` · ${esc(targetTimeframe)}` : ''}</span>
    </div>

    <h3>Four-axis grade</h3>
    <div class="axis-grid">
      <div class="axis-card">
        <span class="axis-name">A · Appropriateness</span>
        <span class="axis-value">
          <span class="score-meter"><strong>${appropriatenessScore}</strong> / 9</span>
          <span class="band-badge band-${esc(appropriatenessBand)}">${esc(titleCase(appropriatenessBand))}</span>
        </span>
      </div>
      <div class="axis-card">
        <span class="axis-name">B · Urgency</span>
        <span class="axis-value"><span class="band-badge tier-${esc(triageTier)}">${esc(titleCase(triageTier))}</span></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">C · Completeness</span>
        <span class="axis-value"><strong>${completenessPercent}%</strong></span>
        <div class="completeness-bar"><span style="width:${completenessPercent}%"></span></div>
      </div>
      <div class="axis-card">
        <span class="axis-name">D · Clinical priority</span>
        <span class="axis-value"><span class="band-badge priority-${esc(priorityBand)}">${esc(titleCase(priorityBand))}</span></span>
      </div>
    </div>

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
  if (!confirm('Clear all answers and start a fresh request?')) return;
  clearState();
  state = emptyRequest();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the vetting report.</p>';
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
