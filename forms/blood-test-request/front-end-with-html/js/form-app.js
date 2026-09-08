import { calculateGrade } from './grader.js';
import { PANELS, countSelectedPanels, emptyRequest, indicationLabel } from './types.js';

// Blood Test Request — clinician request wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page progress
// summary reflects how many fields have been answered. Submission runs the
// pure four-axis grader and renders an inline vetting report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'blood-test-request.front-end-form-with-html.v1';
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
  slug: 'blood-test-request',
  hadDraftAtLoad,
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
}

function setBool(section, field, checked) {
  state[section][field] = !!checked;
  saveState(state);
  updateProgress();
}

function setPanel(field, checked) {
  state.panels[field] = !!checked;
  saveState(state);
  updateProgress();
  updatePanelCount();
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

/**
 * Render the requested-panels checkbox group. Each panel is a Lily
 * `.checkbox-input` inside a `.checkbox-group` (role="group"). A live count of
 * selected panels sits above the group.
 */
function panelCheckboxGroup() {
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = 'panels-fieldset';

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.innerHTML = 'Requested test panels <span class="req" aria-hidden="true">*</span>';
  wrapper.appendChild(legend);

  const hint = document.createElement('span');
  hint.className = 'hint';
  hint.id = 'panels-count';
  wrapper.appendChild(hint);

  const group = document.createElement('div');
  group.className = 'checkbox-group panel-grid';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-labelledby', wrapper.id);

  for (const p of PANELS) {
    const cbId = `panels-${p.field}`;
    const checked = state.panels[p.field] === true ? ' checked' : '';
    const label = document.createElement('label');
    label.htmlFor = cbId;
    const tag = p.critical
      ? ' <span class="panel-tag panel-tag-critical">critical</span>'
      : (p.fasting ? ' <span class="panel-tag panel-tag-fasting">fasting</span>' : '');
    label.innerHTML = `
      <input class="checkbox-input" type="checkbox" id="${cbId}" name="panels" value="${esc(p.field)}"${checked}>
      <span>${esc(p.label)}${tag}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      setPanel(p.field, input.checked);
      clearFieldError('panels');
    });
    group.appendChild(label);
  }
  wrapper.appendChild(group);

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = 'panels-error';
  wrapper.appendChild(errSpan);
  return wrapper;
}

function updatePanelCount() {
  const el = document.getElementById('panels-count');
  if (!el) return;
  const n = countSelectedPanels(state.panels);
  el.textContent = n === 0
    ? 'No panels selected yet — select at least one.'
    : `${n} panel${n === 1 ? '' : 's'} selected.`;
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

const INDICATION_OPTIONS = [
  { value: 'routine-monitoring', label: 'Routine monitoring' },
  { value: 'anaemia', label: 'Anaemia' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'infection', label: 'Infection' },
  { value: 'diabetes-monitoring', label: 'Diabetes monitoring' },
  { value: 'thyroid-symptoms', label: 'Thyroid symptoms' },
  { value: 'cardiovascular-risk', label: 'Cardiovascular risk' },
  { value: 'liver-disease', label: 'Liver disease' },
  { value: 'renal-monitoring', label: 'Renal monitoring' },
  { value: 'anticoagulation-monitoring', label: 'Anticoagulation monitoring' },
  { value: 'pre-operative', label: 'Pre-operative' },
  { value: 'suspected-malignancy', label: 'Suspected malignancy' },
  { value: 'other', label: 'Other' }
];

const FASTING_STATUS_OPTIONS = [
  { value: 'fasting', label: 'Fasting' },
  { value: 'non-fasting', label: 'Non-fasting' },
  { value: 'unknown', label: 'Unknown' }
];

const SPECIMEN_COLLECTED_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const URGENCY_OPTIONS = [
  { value: 'routine', label: 'Routine' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'stat', label: 'Stat (immediate)' }
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
    description: 'Identify the clinician raising this request.'
  });
  card.appendChild(textInput({ label: 'Clinician name', section: 'clinician', field: 'clinicianName', required: true }));
  card.appendChild(selectInput({
    label: 'Clinician role', section: 'clinician', field: 'clinicianRole',
    options: [
      { value: 'gp', label: 'GP' },
      { value: 'hospital-doctor', label: 'Hospital doctor' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'phlebotomist', label: 'Phlebotomist' },
      { value: 'consultant', label: 'Consultant' },
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
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Requested panels',
    description: 'Tick every test panel to order. At least one is required. "Critical" tests escalate triage; "fasting" tests are best collected fasting.'
  });
  card.appendChild(panelCheckboxGroup());
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Clinical context',
    description: 'Primary indication and supporting clinical details — the highest-value fields.'
  });
  card.appendChild(selectInput({
    label: 'Primary indication', section: 'clinical', field: 'primaryIndication',
    options: INDICATION_OPTIONS, required: true
  }));
  card.appendChild(textArea({
    label: 'Clinical details', section: 'clinical', field: 'clinicalDetails',
    rows: 3, required: true,
    placeholder: 'e.g. 6-month type-2 diabetes review; symptoms; relevant history.'
  }));
  card.appendChild(textArea({
    label: 'Relevant medications', section: 'clinical', field: 'relevantMedications', rows: 2,
    placeholder: 'e.g. warfarin, statin, levothyroxine.'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Pre-analytical & specimen',
    description: 'Fasting requirement, fasting status, and specimen collection — drives the pre-analytical safety axis.'
  });
  card.appendChild(boolField({ label: 'A requested test requires fasting', section: 'preanalytical', field: 'fastingRequired' }));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Fasting status', section: 'preanalytical', field: 'fastingStatus', options: FASTING_STATUS_OPTIONS }),
    selectInput({ label: 'Specimen collected', section: 'preanalytical', field: 'specimenCollected', options: SPECIMEN_COLLECTED_OPTIONS })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Collection date', section: 'preanalytical', field: 'collectionDate', type: 'date' }),
    textInput({ label: 'Collection time', section: 'preanalytical', field: 'collectionTime', type: 'time' })
  ]));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Patient safety',
    description: 'Handling and access factors relevant to phlebotomy.'
  });
  card.appendChild(boolField({ label: 'Known blood-borne virus', section: 'safety', field: 'knownBloodBorneVirus' }));
  card.appendChild(boolField({ label: 'Difficult venous access', section: 'safety', field: 'difficultVenousAccess' }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Triage & submit',
    description: 'Requested urgency, setting, and notes. Submit to compute the four-axis grade and flags.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Requested urgency', section: 'triage', field: 'urgency', options: URGENCY_OPTIONS, required: true }),
    selectInput({ label: 'Care setting', section: 'triage', field: 'setting', options: SETTING_OPTIONS })
  ]));
  card.appendChild(textArea({ label: 'Notes', section: 'triage', field: 'notes', rows: 3 }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7
];

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
  // 4 Clinical
  ['clinical', 'primaryIndication'], ['clinical', 'clinicalDetails'],
  // 5 Pre-analytical
  ['preanalytical', 'fastingStatus'], ['preanalytical', 'specimenCollected'],
  // 7 Triage
  ['triage', 'urgency'], ['triage', 'setting']
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
  // The requested panels (step 3) count as one tracked unit.
  sectionTotal['panels'] = 1;
  if (countSelectedPanels(state.panels) > 0) {
    answered++;
    sectionAnswered['panels'] = 1;
  }

  const total = TRACKED_FIELDS.length + 1;
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
  { step: 1, section: 'clinician',     title: 'Clinician' },
  { step: 2, section: 'patient',       title: 'Patient' },
  { step: 3, section: 'panels',        title: 'Panels' },
  { step: 4, section: 'clinical',      title: 'Clinical' },
  { step: 5, section: 'preanalytical', title: 'Specimen' },
  { step: 6, section: 'safety',        title: 'Safety' },
  { step: 7, section: 'triage',        title: 'Triage' }
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

  // At least one panel must be selected.
  if (countSelectedPanels(state.panels) === 0) {
    errors.push({ id: 'panels-fieldset', message: 'Select at least one test panel' });
    const el = document.getElementById('panels-error');
    if (el) el.textContent = 'Select at least one test panel.';
  } else {
    const el = document.getElementById('panels-error');
    if (el) el.textContent = '';
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

  const {
    appropriatenessScore,
    appropriatenessBand,
    preanalyticalBand,
    fastingViolation,
    completenessPercent,
    triageTier,
    targetTimeframe,
    testsSelectedCount,
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
    <h2>Blood Test Request Vetting Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())} · ${esc(testsSelectedCount)} test${testsSelectedCount === 1 ? '' : 's'} selected · Indication: ${esc(indicationLabel(state.clinical.primaryIndication) || '—')}</p>

    <div class="recommendation-banner">
      <span class="band-badge rec-${esc(recommendation)}">${esc(recommendationLabel)}</span>
      <span class="band-badge tier-${esc(triageTier)}">${esc(titleCase(triageTier))}${targetTimeframe ? ` · ${esc(targetTimeframe)}` : ''}</span>
      ${fastingViolation ? `<span class="band-badge band-usually-not-appropriate">Fasting violation</span>` : ''}
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
        <span class="axis-name">B · Pre-analytical / specimen</span>
        <span class="axis-value"><span class="band-badge pre-${esc(preanalyticalBand)}">${esc(titleCase(preanalyticalBand))}</span></span>
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Bootstrap
// ----------------------------------------------------------------------

function renderForm() {
  const host = document.getElementById('form-sections');
  host.innerHTML = '';
  for (const r of STEP_RENDERERS) host.appendChild(r());
  updatePanelCount();
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
