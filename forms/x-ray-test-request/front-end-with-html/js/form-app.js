import { calculateGrade } from './grader.js';
import { bodyRegionLabel, emptyRequest, indicationLabel } from './types.js';

// X-Ray Test Request — clinician referral wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page progress
// summary reflects how many fields have been answered. Submission runs the
// pure four-axis grader and renders an inline vetting report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'x-ray-test-request.front-end-form-with-html.v1';
const TOTAL_STEPS = 7;

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
  slug: 'x-ray-test-request',
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

function grid(cols, children) {
  const g = document.createElement('div');
  g.className = cols;
  for (const c of children) g.appendChild(c);
  return g;
}

// ----------------------------------------------------------------------
// Option lists
// ----------------------------------------------------------------------

const BODY_REGION_OPTIONS = [
  { value: 'chest', label: 'Chest' },
  { value: 'abdomen', label: 'Abdomen' },
  { value: 'spine-cervical', label: 'Spine (cervical)' },
  { value: 'spine-thoracic', label: 'Spine (thoracic)' },
  { value: 'spine-lumbar', label: 'Spine (lumbar)' },
  { value: 'pelvis', label: 'Pelvis' },
  { value: 'hip', label: 'Hip' },
  { value: 'knee', label: 'Knee' },
  { value: 'ankle-foot', label: 'Ankle / foot' },
  { value: 'shoulder', label: 'Shoulder' },
  { value: 'wrist-hand', label: 'Wrist / hand' },
  { value: 'skull', label: 'Skull' },
  { value: 'dental', label: 'Dental' },
  { value: 'other', label: 'Other' }
];

const LATERALITY_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'bilateral', label: 'Bilateral' },
  { value: 'not-applicable', label: 'Not applicable' }
];

const INDICATION_OPTIONS = [
  { value: 'trauma-fracture', label: 'Trauma / fracture' },
  { value: 'chest-infection', label: 'Chest infection' },
  { value: 'suspected-pneumothorax', label: 'Suspected pneumothorax' },
  { value: 'foreign-body', label: 'Foreign body' },
  { value: 'joint-pain', label: 'Joint pain' },
  { value: 'arthritis', label: 'Arthritis' },
  { value: 'pre-operative', label: 'Pre-operative' },
  { value: 'line-position-check', label: 'Line-position check' },
  { value: 'abdominal-obstruction', label: 'Abdominal obstruction' },
  { value: 'swallowed-object', label: 'Swallowed object' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'other', label: 'Other' }
];

const PREGNANCY_OPTIONS = [
  { value: 'not-applicable', label: 'Not applicable' },
  { value: 'not-pregnant', label: 'Not pregnant' },
  { value: 'possible', label: 'Possible' },
  { value: 'pregnant', label: 'Pregnant' },
  { value: 'unknown', label: 'Unknown' }
];

const MOBILITY_OPTIONS = [
  { value: 'ambulant', label: 'Ambulant' },
  { value: 'wheelchair', label: 'Wheelchair' },
  { value: 'trolley', label: 'Trolley' }
];

const SETTING_OPTIONS = [
  { value: 'outpatient', label: 'Outpatient' },
  { value: 'inpatient', label: 'Inpatient' },
  { value: 'community', label: 'Community' },
  { value: 'emergency', label: 'Emergency' }
];

const URGENCY_OPTIONS = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
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
      { value: 'radiologist', label: 'Radiologist' },
      { value: 'gp', label: 'GP' },
      { value: 'hospital-doctor', label: 'Hospital doctor' },
      { value: 'surgeon', label: 'Surgeon' },
      { value: 'emergency-physician', label: 'Emergency physician' },
      { value: 'radiographer', label: 'Radiographer' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(grid('two-col', [
    selectInput({
      label: 'Registration body', section: 'clinician', field: 'registrationBody',
      options: [
        { value: 'GMC', label: 'GMC' },
        { value: 'HCPC', label: 'HCPC' },
        { value: 'NMC', label: 'NMC' },
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
    description: 'Patient demographics.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'First name', section: 'patient', field: 'firstName', required: true }),
    textInput({ label: 'Last name', section: 'patient', field: 'lastName', required: true })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Date of birth', section: 'patient', field: 'dateOfBirth', type: 'date' }),
    textInput({ label: 'NHS number', section: 'patient', field: 'nhsNumber', placeholder: 'NNN NNN NNNN' })
  ]));
  card.appendChild(textInput({ label: 'Body mass index', section: 'patient', field: 'bodyMassIndex', type: 'number', min: 10, max: 80, step: 0.1, unit: 'kg/m²' }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Requested examination',
    description: 'Body region, laterality, and the primary indication — drives the appropriateness axis.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Body region', section: 'request', field: 'bodyRegion', options: BODY_REGION_OPTIONS, required: true }),
    selectInput({ label: 'Laterality', section: 'request', field: 'laterality', options: LATERALITY_OPTIONS, required: true })
  ]));
  card.appendChild(selectInput({
    label: 'Primary indication', section: 'request', field: 'primaryIndication',
    options: INDICATION_OPTIONS, required: true
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Clinical detail',
    description: 'The specific clinical question and relevant history — the highest-value fields.'
  });
  card.appendChild(textArea({
    label: 'Specific clinical question', section: 'detail', field: 'clinicalQuestion',
    rows: 2, required: true,
    placeholder: 'e.g. Exclude fracture following a fall onto the outstretched right hand.'
  }));
  card.appendChild(textArea({ label: 'Relevant history', section: 'detail', field: 'relevantHistory', rows: 3 }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Radiation safety',
    description: 'Pregnancy status, recent similar imaging, and the IR(ME)R justification.'
  });
  card.appendChild(selectInput({
    label: 'Pregnancy status', section: 'safety', field: 'pregnancyStatus',
    options: PREGNANCY_OPTIONS
  }));
  card.appendChild(boolField({ label: 'A similar X-ray of the same region was recently performed', section: 'safety', field: 'recentSimilarXray' }));
  card.appendChild(textArea({
    label: 'IR(ME)R justification', section: 'safety', field: 'irMeRJustification',
    rows: 2,
    placeholder: 'Clinical benefit weighed against the radiation detriment.'
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Practicalities',
    description: 'Patient mobility, care setting, and the requested-by date.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Mobility', section: 'practical', field: 'mobility', options: MOBILITY_OPTIONS }),
    selectInput({ label: 'Care setting', section: 'practical', field: 'setting', options: SETTING_OPTIONS })
  ]));
  card.appendChild(textInput({ label: 'Requested-by date', section: 'practical', field: 'requestedByDate', type: 'date' }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Triage & submit',
    description: 'Requested urgency and notes. Submit to compute the four-axis grade and flags.'
  });
  card.appendChild(selectInput({ label: 'Requested urgency', section: 'triage', field: 'urgency', options: URGENCY_OPTIONS, required: true }));
  card.appendChild(textArea({ label: 'Notes', section: 'triage', field: 'notes', rows: 3 }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7
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
  // 1 Clinician
  ['clinician', 'clinicianName'], ['clinician', 'clinicianRole'],
  ['clinician', 'referralDate'],
  // 2 Patient
  ['patient', 'firstName'], ['patient', 'lastName'],
  ['patient', 'dateOfBirth'], ['patient', 'nhsNumber'],
  // 3 Request
  ['request', 'bodyRegion'], ['request', 'laterality'],
  ['request', 'primaryIndication'],
  // 4 Detail
  ['detail', 'clinicalQuestion'],
  // 5 Safety
  ['safety', 'pregnancyStatus'], ['safety', 'irMeRJustification'],
  // 6 Practical
  ['practical', 'mobility'], ['practical', 'setting'],
  // 7 Triage
  ['triage', 'urgency']
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
  { step: 1, section: 'clinician', title: 'Clinician' },
  { step: 2, section: 'patient',   title: 'Patient' },
  { step: 3, section: 'request',   title: 'Examination' },
  { step: 4, section: 'detail',    title: 'Clinical detail' },
  { step: 5, section: 'safety',    title: 'Radiation safety' },
  { step: 6, section: 'practical', title: 'Practicalities' },
  { step: 7, section: 'triage',    title: 'Triage' }
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
    appropriatenessScore,
    appropriatenessBand,
    radiationSafetyBand,
    radiationDoseBand,
    completenessPercent,
    triageTier,
    targetTimeframe,
    recommendation,
    recommendationLabel,
    firedRules,
    flags,
    timestamp
  } = lastResult;

  const regionText = bodyRegionLabel(state.request.bodyRegion) || '—';
  const indicationText = indicationLabel(state.request.primaryIndication);

  const safetyValue = radiationSafetyBand
    ? `<span class="band-badge safety-${esc(radiationSafetyBand)}">${esc(titleCase(radiationSafetyBand))}</span>${
        radiationDoseBand
          ? ` <span class="band-badge dose-${esc(radiationDoseBand)}">${esc(titleCase(radiationDoseBand))} dose</span>`
          : ''
      }`
    : '<span class="muted">Not assessed</span>';

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
    <h2>X-Ray Request Vetting Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())} · Region: ${esc(regionText)}${indicationText ? ` · ${esc(indicationText)}` : ''}</p>

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
        <span class="axis-name">B · Radiation safety</span>
        <span class="axis-value">${safetyValue}</span>
      </div>
      <div class="axis-card">
        <span class="axis-name">C · Completeness</span>
        <span class="axis-value"><strong>${completenessPercent}%</strong></span>
        <div class="completeness-bar"><span style="width:${completenessPercent}%"></span></div>
      </div>
      <div class="axis-card">
        <span class="axis-name">D · Triage priority</span>
        <span class="axis-value"><span class="band-badge tier-${esc(triageTier)}">${esc(titleCase(triageTier))}</span></span>
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
