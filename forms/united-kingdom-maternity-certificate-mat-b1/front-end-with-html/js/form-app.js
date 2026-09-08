import { validateMatB1 } from './mat-b1-validator.js';
import { emptyAssessment, isFilled, priorityLabel } from './types.js';

// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a top-of-page progress
// summary reflects how many tracked fields have been answered. Submission
// runs the pure validator + flagged-issues engine and renders an inline
// report. State is persisted to localStorage so a partial fill survives a
// page reload. Conditional sections (certificateType pre/post selecting
// Part A or Part B; issuerType doctor/midwife selecting the issuer fields)
// are hidden via re-render.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'united-kingdom-maternity-certificate-mat-b1.front-end-form-with-html.v1';

/** Deep-merge persisted state over a fresh empty assessment. */
function mergeDeep(target, source) {
  if (!source || typeof source !== 'object') return target;
  for (const key of Object.keys(target)) {
    const t = target[key];
    const s = source[key];
    if (
      t !== null &&
      typeof t === 'object' &&
      !Array.isArray(t) &&
      s !== null &&
      typeof s === 'object' &&
      !Array.isArray(s)
    ) {
      mergeDeep(t, s);
    } else if (s !== undefined) {
      target[key] = s;
    }
  }
  return target;
}

/** @returns {import('./types.js').AssessmentData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyAssessment();

  mergeDeep(fresh, parsed);
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyAssessment();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved MAT B1 form; starting fresh.', e);
    return emptyAssessment();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save MAT B1 form to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored MAT B1 form.', e);
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

/** @type {import('./types.js').ValidationResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'united-kingdom-maternity-certificate-mat-b1',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const out = document.getElementById('report');
    if (out) out.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/** Resolve a dotted path on state. */
function getPath(path) {
  const parts = path.split('.');
  let cur = state;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

/** Set a dotted path on state, persist, and re-render the form. */
function setPath(path, value) {
  const parts = path.split('.');
  let cur = state;
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
  saveState();
  renderForm();
  updateProgress();
}

/** Escape user-entered text for safe rendering. */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ----------------------------------------------------------------------
// Field component builders
// ----------------------------------------------------------------------

/**
 * @param {{ label: string, path: string, type?: string, placeholder?: string,
 *           required?: boolean }} opts
 */
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
  const id = `f-${opts.path.replace(/\./g, '-')}`;
  const value = getPath(opts.path) == null ? '' : getPath(opts.path);
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const cls = lilyInputClass(type);
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const placeholderAttr = opts.placeholder
    ? ` placeholder="${esc(opts.placeholder)}"`
    : '';
  const requiredAttrs = opts.required ? ' required data-required' : '';
  const labelRequired = opts.required ? ' data-required' : '';
  wrapper.innerHTML =
    `<label class="label" for="${id}"${labelRequired}>${labelText}</label>` +
    `<input id="${id}" name="${id}" type="${type}" class="${cls}"` +
    ` value="${esc(value)}"${placeholderAttr}` +
    ` aria-describedby="${id}-error"${requiredAttrs}>` +
    `<span class="error-message" id="${id}-error"></span>`;
  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    const parts = opts.path.split('.');
    let cur = state;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    cur[parts[parts.length - 1]] = input.value;
    saveState();
    updateProgress();
    clearFieldError(id);
  });
  input.addEventListener('change', () => {
    renderForm();
  });
  return wrapper;
}

function textArea(opts) {
  const id = `f-${opts.path.replace(/\./g, '-')}`;
  const value = getPath(opts.path) == null ? '' : getPath(opts.path);
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const placeholderAttr = opts.placeholder
    ? ` placeholder="${esc(opts.placeholder)}"`
    : '';
  const requiredAttrs = opts.required ? ' required data-required' : '';
  const labelRequired = opts.required ? ' data-required' : '';
  wrapper.innerHTML =
    `<label class="label" for="${id}"${labelRequired}>${labelText}</label>` +
    `<textarea id="${id}" name="${id}" rows="${opts.rows || 3}"` +
    ` class="text-area-input"${placeholderAttr}` +
    ` aria-describedby="${id}-error"${requiredAttrs}>${esc(value)}</textarea>` +
    `<span class="error-message" id="${id}-error"></span>`;
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => {
    const parts = opts.path.split('.');
    let cur = state;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    cur[parts[parts.length - 1]] = ta.value;
    saveState();
    updateProgress();
    clearFieldError(id);
  });
  return wrapper;
}

function radioGroup(opts) {
  const groupId = `f-${opts.path.replace(/\./g, '-')}`;
  const current = getPath(opts.path);
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = groupId + '-fieldset';

  const legend = document.createElement('legend');
  legend.className = 'label';
  if (opts.required) legend.setAttribute('data-required', '');
  legend.innerHTML = labelText;
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const lab = document.createElement('label');
    lab.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    const requiredAttr = opts.required ? ' data-required' : '';
    lab.innerHTML =
      `<input class="radio-input" type="radio" id="${radioId}" name="${groupId}"` +
      ` value="${esc(option.value)}"${checked}${requiredAttr}>` +
      `<span>${esc(option.label)}</span>`;
    const input = lab.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        clearFieldError(groupId);
        setPath(opts.path, option.value);
      }
    });
    list.appendChild(lab);
  }
  wrapper.appendChild(list);

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = groupId + '-error';
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
    `<span class="section-step">Section ${opts.stepNumber} of 4</span>` +
    `<h2 class="section-title">${esc(opts.title)}</h2>` +
    desc;
  card.appendChild(legend);
  return card;
}

function infoNote(text) {
  const note = document.createElement('div');
  note.className = 'alert info-note';
  note.setAttribute('data-type', 'info');
  note.textContent = text;
  return note;
}

function inactiveNote(text) {
  const note = document.createElement('p');
  note.className = 'inactive-note';
  note.textContent = text;
  return note;
}

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const CERTIFICATE_TYPE_OPTIONS = [
  { value: 'pre', label: 'Part A — Pre-confinement (pregnancy ongoing)' },
  { value: 'post', label: 'Part B — Post-confinement (baby has been born)' }
];

const ISSUER_TYPE_OPTIONS = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'midwife', label: 'Registered midwife' }
];

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Patient Identification',
    description:
      'Patient details to appear on the front page of the MAT B1 certificate.'
  });
  card.appendChild(textInput({
    label: "Patient's full name",
    path: 'patientIdentification.patientName',
    placeholder: 'As it should appear above Part A',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Date of birth',
    path: 'patientIdentification.dateOfBirth',
    type: 'date'
  }));
  card.appendChild(textInput({
    label: 'NHS number',
    path: 'patientIdentification.nhsNumber',
    placeholder: 'Optional, for record-keeping'
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Part A — Pre-Confinement Certificate',
    description:
      'Complete Part A only when the certificate is being issued before the birth. Part A and Part B are mutually exclusive.'
  });

  card.appendChild(radioGroup({
    label: 'Certificate type',
    path: 'certificateType',
    options: CERTIFICATE_TYPE_OPTIONS,
    required: true
  }));

  if (state.certificateType === 'pre') {
    card.appendChild(infoNote(
      'DWP guidance: a MAT B1 must not be issued more than 20 weeks before ' +
      'the expected date of confinement (EWC).'
    ));
    card.appendChild(textInput({
      label: 'Expected date of confinement (EWC)',
      path: 'preConfinement.expectedDateOfConfinement',
      type: 'date',
      required: true
    }));
    card.appendChild(textInput({
      label: 'Examination date',
      path: 'preConfinement.examinationDate',
      type: 'date',
      required: true
    }));
  } else if (state.certificateType === 'post') {
    card.appendChild(inactiveNote(
      'Part B (post-confinement) selected — complete section 3 instead.'
    ));
  } else {
    card.appendChild(inactiveNote(
      'Select a certificate type above to continue.'
    ));
  }

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Part B — Post-Confinement Certificate',
    description:
      'Complete Part B only when the certificate is being issued after the birth. The expected date of confinement (EWC) is still required for SMP / Maternity Allowance entitlement.'
  });

  if (state.certificateType === 'post') {
    card.appendChild(textInput({
      label: "Baby's actual date of birth",
      path: 'postConfinement.actualDateOfBirth',
      type: 'date',
      required: true
    }));
    card.appendChild(textInput({
      label: 'Expected date of confinement (EWC)',
      path: 'postConfinement.expectedDateOfConfinement',
      type: 'date',
      required: true
    }));
  } else if (state.certificateType === 'pre') {
    card.appendChild(inactiveNote(
      'Part A (pre-confinement) was selected in section 2 — Part B is not applicable.'
    ));
  } else {
    card.appendChild(inactiveNote(
      'Select a certificate type in section 2 to enable this section.'
    ));
  }

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Issuer Validation',
    description:
      'The MAT B1 must be signed by either a registered doctor or a registered midwife. Doctors apply a name-and-address stamp; midwives provide their NMC personal identification number and registration expiry date.'
  });

  card.appendChild(radioGroup({
    label: 'Issuer type',
    path: 'issuer.issuerType',
    options: ISSUER_TYPE_OPTIONS,
    required: true
  }));

  if (state.issuer.issuerType === 'doctor') {
    card.appendChild(infoNote(
      'DWP guidance: doctors must apply their official name-and-address ' +
      'stamp to every MAT B1 they issue.'
    ));
    card.appendChild(textInput({
      label: "Doctor's name",
      path: 'issuer.doctor.doctorName',
      required: true
    }));
    card.appendChild(textInput({
      label: 'Practice name',
      path: 'issuer.doctor.practiceName',
      required: true
    }));
    card.appendChild(textArea({
      label: 'Practice address',
      path: 'issuer.doctor.practiceAddress',
      rows: 2,
      required: true
    }));
    card.appendChild(radioGroup({
      label: 'Has the official name-and-address stamp been applied?',
      path: 'issuer.doctor.stampApplied',
      options: YES_NO,
      required: true
    }));
  } else if (state.issuer.issuerType === 'midwife') {
    card.appendChild(infoNote(
      'DWP guidance: registered midwives must record their NMC personal ' +
      'identification number (PIN) and the expiry date of their NMC ' +
      'registration on every MAT B1 they sign.'
    ));
    card.appendChild(textInput({
      label: "Midwife's full name",
      path: 'issuer.midwife.midwifeName',
      required: true
    }));
    card.appendChild(textInput({
      label: 'NMC personal identification number (PIN)',
      path: 'issuer.midwife.nmcPin',
      placeholder: 'e.g. 12A3456E',
      required: true
    }));
    card.appendChild(textInput({
      label: 'NMC registration expiry date',
      path: 'issuer.midwife.nmcExpiryDate',
      type: 'date',
      required: true
    }));
  } else {
    card.appendChild(inactiveNote(
      'Select an issuer type above to continue.'
    ));
  }

  const hr = document.createElement('hr');
  hr.className = 'divider';
  card.appendChild(hr);

  card.appendChild(textInput({
    label: 'Pre-printed unique certificate number',
    path: 'issuer.certificateNumber',
    placeholder: 'From the official MAT B1 form',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Issue date (date the certificate is signed)',
    path: 'issuer.issueDate',
    type: 'date',
    required: true
  }));
  card.appendChild(radioGroup({
    label: 'Is this certificate a duplicate replacement?',
    path: 'issuer.isDuplicate',
    options: YES_NO
  }));
  if (state.issuer.isDuplicate === 'yes') {
    card.appendChild(radioGroup({
      label: 'Has the form been marked "DUPLICATE"?',
      path: 'issuer.duplicateMarkerApplied',
      options: YES_NO,
      required: true
    }));
  }
  card.appendChild(radioGroup({
    label: 'Has the certificate been completed in ink (not pencil)?',
    path: 'issuer.completedInInk',
    options: YES_NO,
    required: true
  }));

  return card;
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

/**
 * Compute progress: count active required slots and how many are filled.
 *
 * The MAT B1 has tightly branched required fields. Rather than re-deriving a
 * second list of "rules" we compute the active required count directly from
 * the live state:
 *
 *   - 1 patient name
 *   - 1 certificate-type selection
 *   - 2 fields for Part A or Part B (when the branch is selected)
 *   - 1 issuer-type selection
 *   - 4 fields for doctor branch (doctor name, practice name, practice
 *     address, stamp applied) OR 3 fields for midwife branch (midwife name,
 *     NMC PIN, NMC expiry date)
 *   - 3 certificate-level fields (certificate number, issue date,
 *     completed-in-ink confirmation)
 *   - 1 conditional duplicate-marker confirmation when isDuplicate = yes
 */
function computeProgress() {
  let required = 0;
  let satisfied = 0;

  // Patient name
  required++;
  if (isFilled(state.patientIdentification.patientName)) satisfied++;

  // Certificate type
  required++;
  if (state.certificateType === 'pre' || state.certificateType === 'post') {
    satisfied++;
  }

  // Part A or Part B
  if (state.certificateType === 'pre') {
    required += 2;
    if (isFilled(state.preConfinement.expectedDateOfConfinement)) satisfied++;
    if (isFilled(state.preConfinement.examinationDate)) satisfied++;
  } else if (state.certificateType === 'post') {
    required += 2;
    if (isFilled(state.postConfinement.actualDateOfBirth)) satisfied++;
    if (isFilled(state.postConfinement.expectedDateOfConfinement)) satisfied++;
  }

  // Issuer type
  required++;
  if (state.issuer.issuerType === 'doctor' || state.issuer.issuerType === 'midwife') {
    satisfied++;
  }

  // Doctor or midwife fields
  if (state.issuer.issuerType === 'doctor') {
    required += 4;
    if (isFilled(state.issuer.doctor.doctorName)) satisfied++;
    if (isFilled(state.issuer.doctor.practiceName)) satisfied++;
    if (isFilled(state.issuer.doctor.practiceAddress)) satisfied++;
    if (state.issuer.doctor.stampApplied === 'yes') satisfied++;
  } else if (state.issuer.issuerType === 'midwife') {
    required += 3;
    if (isFilled(state.issuer.midwife.midwifeName)) satisfied++;
    if (isFilled(state.issuer.midwife.nmcPin)) satisfied++;
    if (isFilled(state.issuer.midwife.nmcExpiryDate)) satisfied++;
  }

  // Certificate-level fields
  required += 3;
  if (isFilled(state.issuer.certificateNumber)) satisfied++;
  if (isFilled(state.issuer.issueDate)) satisfied++;
  if (state.issuer.completedInInk === 'yes') satisfied++;

  // Duplicate marker (conditional)
  if (state.issuer.isDuplicate === 'yes') {
    required++;
    if (state.issuer.duplicateMarkerApplied === 'yes') satisfied++;
  }

  return { required, satisfied };
}

function updateProgress() {
  const { required, satisfied } = computeProgress();
  const percent = required === 0 ? 0 : Math.round((satisfied / required) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) {
    text.textContent =
      `${satisfied} of ${required} required fields answered (${percent}%)`;
  }
  updateStepListStatuses();
}

// ----------------------------------------------------------------------
// Step-list
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, title: 'Patient' },
  { step: 2, title: 'Part A' },
  { step: 3, title: 'Part B' },
  { step: 4, title: 'Issuer' }
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
    li.setAttribute('aria-label', 'Section ' + def.step + ': ' + def.title);
    li.innerHTML = '<span>' + esc(def.title) + '</span>';
    li.addEventListener('click', () => {
      const target = document.getElementById('step-' + def.step);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    ol.appendChild(li);
  }
}

function updateStepListStatuses() {
  const ol = document.getElementById('step-list');
  if (!ol) return;
  let firstUnfinished = -1;
  for (const def of STEP_DEFINITIONS) {
    const li = ol.querySelector('[data-step="' + def.step + '"]');
    const step = document.getElementById('step-' + def.step);
    if (!li || !step) continue;
    const required = step.querySelectorAll('[data-required]');
    let answered = 0;
    required.forEach((r) => {
      if (r.type === 'radio') {
        if (document.querySelector('input[type="radio"][name="' + r.name + '"]:checked')) answered++;
      } else if (r.type === 'checkbox') {
        if (r.checked) answered++;
      } else if (r.value && String(r.value).trim() !== '') {
        answered++;
      }
    });
    if (required.length > 0 && answered >= required.length) {
      li.dataset.status = 'finished';
      li.removeAttribute('aria-current');
    } else if (answered > 0) {
      li.dataset.status = 'in-progress';
      if (firstUnfinished === -1) firstUnfinished = def.step;
    } else {
      li.dataset.status = 'waiting';
      li.removeAttribute('aria-current');
      if (firstUnfinished === -1) firstUnfinished = def.step;
    }
  }
  if (firstUnfinished === -1) firstUnfinished = STEP_DEFINITIONS[0].step;
  const current = ol.querySelector('[data-step="' + firstUnfinished + '"]');
  if (current) {
    current.setAttribute('aria-current', 'step');
    if (current.dataset.status === 'waiting') current.dataset.status = 'in-progress';
  }
  ol.dataset.current = String(firstUnfinished - 1);
}

// ----------------------------------------------------------------------
// Validation UI
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

function validateFormUi() {
  const errors = [];
  document.querySelectorAll('[data-required]').forEach((el) => {
    const tag = (el.tagName || '').toLowerCase();
    if (tag !== 'input' && tag !== 'select' && tag !== 'textarea') return;
    const id = el.id;
    if (!id) return;
    if (tag === 'input' && el.type === 'radio') {
      const name = el.name;
      const checked = document.querySelector('input[type="radio"][name="' + name + '"]:checked');
      if (!checked) {
        errors.push({ id: name, message: 'Please answer this question.' });
        setFieldError(name, 'Please answer this question.');
      }
      return;
    }
    let missing = false;
    if (tag === 'input' && el.type === 'checkbox') {
      if (!el.checked) missing = true;
    } else if (el.value == null || String(el.value).trim() === '') {
      missing = true;
    }
    if (missing) {
      errors.push({ id: id, message: 'Please complete this field.' });
      setFieldError(id, 'Please complete this field.');
    } else {
      clearFieldError(id);
    }
  });
  const seen = new Set();
  const uniq = [];
  for (const e of errors) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    uniq.push(e);
  }
  renderErrorSummary(uniq);
  return uniq;
}

function renderErrorSummary(errors) {
  const summary = document.getElementById('error-summary');
  if (!summary) return;
  if (!errors || errors.length === 0) {
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

// ----------------------------------------------------------------------
// Submit / Report
// ----------------------------------------------------------------------

function priorityClass(priority) {
  switch (priority) {
    case 'urgent': return 'flag-urgent';
    case 'high': return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

function branchSummary(result) {
  const ct = result.certificateType === 'pre'
    ? 'Part A (pre-confinement)'
    : result.certificateType === 'post'
      ? 'Part B (post-confinement)'
      : 'not selected';
  const it = result.issuerType === 'doctor'
    ? 'Doctor'
    : result.issuerType === 'midwife'
      ? 'Registered midwife'
      : 'not selected';
  const wks = result.weeksBeforeEwc == null
    ? ''
    : ` — ${result.weeksBeforeEwc} weeks before EWC`;
  return `Certificate: ${ct}${wks}. Issuer: ${it}.`;
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const completenessBadge = lastResult.complete
    ? '<span class="completeness-badge complete">Complete</span>'
    : '<span class="completeness-badge incomplete">Incomplete</span>';

  const firedRules = lastResult.firedRules;
  const additionalFlags = lastResult.additionalFlags;

  const firedItems = firedRules.length === 0
    ? '<p class="muted">No rules fired — all required fields satisfied.</p>'
    : `
      <ul class="rules-list">
        ${firedRules.map((r) => `
          <li class="${priorityClass(r.priority)}">
            <span class="flag-priority">${esc(priorityLabel(r.priority).toUpperCase())}</span>
            <span class="flag-category">${esc(r.category)}</span>
            <span class="flag-message">
              ${esc(r.message)}
              <span class="flag-id">${esc(r.id)}</span>
            </span>
          </li>
        `).join('')}
      </ul>
    `;

  const flagsItems = additionalFlags.length === 0
    ? '<p class="muted">No additional flags raised.</p>'
    : `
      <ul class="flags">
        ${additionalFlags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority).toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">
              ${esc(f.message)}
              <span class="flag-id">${esc(f.id)}</span>
            </span>
          </li>
        `).join('')}
      </ul>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>MAT B1 — submission report</h2>
        <p class="muted">Generated ${esc(new Date(lastResult.timestamp).toLocaleString())}</p>
      </header>

      <div class="completeness">
        ${completenessBadge}
        <span class="branch-summary">${esc(branchSummary(lastResult))}</span>
      </div>

      <h3>Fired validation rules</h3>
      ${firedItems}

      <h3>Additional flagged issues</h3>
      ${flagsItems}

      <div class="report-actions">
        <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
      </div>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const startOverBtn = document.getElementById('start-over-btn');
  if (startOverBtn) startOverBtn.addEventListener('click', startOver);
}

function submitForm() {
  validateFormUi();
  lastResult = validateMatB1(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh MAT B1 form?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const out = document.getElementById('report');
  if (out) out.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Bootstrap
// ----------------------------------------------------------------------

const RENDERERS = [renderStep1, renderStep2, renderStep3, renderStep4];

function renderForm() {
  const host = document.getElementById('form-sections');
  if (!host) return;
  // Preserve scroll position across re-renders.
  const scrollY = window.scrollY;
  host.innerHTML = '';
  for (const r of RENDERERS) host.appendChild(r());
  window.scrollTo({ top: scrollY });
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
