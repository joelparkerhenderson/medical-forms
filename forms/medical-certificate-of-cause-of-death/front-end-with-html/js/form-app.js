import { detectFlaggedIssues } from './flags.js';
import { validateCertificate } from './grader.js';
import { coronerReasonLabel, emptyCertificate, gradeLabel, medicalExaminerStatusLabel, priorityLabel, seenAfterDeathByLabel, sexLabel, validityClassClass, validityClassLabel } from './types.js';

// Medical Certificate of Cause of Death (MCCD) — wizard (vanilla JavaScript,
// no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The certifying doctor scrolls through the seven certificate
// sections; a sticky top-of-page progress summary reflects how many fields have
// been answered, and a live readout shows the running validity class (valid /
// incomplete / refer-to-coroner), the derived underlying cause, and whether a
// coroner referral is indicated. Submission runs the pure engine (validity
// classification plus flagged issues) and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.
//
// This is a STATUTORY DOCUMENTATION instrument, NOT a diagnostic tool and NOT a
// substitute for the certifying doctor's, coroner's, or medical examiner's
// statutory judgement. The engine validates completeness and consistency only.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'medical-certificate-of-cause-of-death.front-end-with-html.v1';

/** @returns {import('./types.js').DeathCertificate} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  // Merge over a fresh empty so any newly-added fields default correctly.
  const fresh = emptyCertificate();

  for (const key of Object.keys(fresh)) {
    if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null) {
      fresh[key] = { ...fresh[key], ...parsed[key] };
    } else if (parsed && typeof parsed[key] !== 'object' && parsed[key] !== undefined) {
      fresh[key] = parsed[key];
    }
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCertificate();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved certificate; starting fresh.', e);
    return emptyCertificate();
  }
}

/** @param {import('./types.js').DeathCertificate} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save certificate to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored certificate.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

/** @type {import('./types.js').DeathCertificate} */
let state = loadState();

/** @type {import('./types.js').ValidationResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'medical-certificate-of-cause-of-death',
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
    refreshLiveStatus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 7;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-status readout after each change.
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshLiveStatus();
}

/** Escape user-entered text for safe rendering. */
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

/** Map an <input type=…> to its Lily class name. */
function lilyInputClass(type) {
  switch (type) {
    case 'email':          return 'email-input';
    case 'number':         return 'number-input';
    case 'date':           return 'date-input';
    case 'datetime-local': return 'date-input';
    case 'time':           return 'time-input';
    case 'tel':            return 'tel-input';
    case 'url':            return 'url-input';
    case 'search':         return 'search-input';
    default:               return 'text-input';
  }
}

function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const type = opts.type || 'text';
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${lilyInputClass(type)}"`,
    `value="${esc(value ?? '')}"`,
    `aria-describedby="${id}-error"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.min !== undefined) attrs.push(`min="${esc(opts.min)}"`);
  if (opts.max !== undefined) attrs.push(`max="${esc(opts.max)}"`);
  if (opts.required) attrs.push('required', 'data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    let v;
    if (input.value === '' && (type === 'date' || type === 'datetime-local' || type === 'time')) {
      v = null;
    } else if (type === 'number') {
      v = input.value === '' ? null : Number(input.value);
    } else {
      v = input.value;
    }
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
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      ${opts.required ? 'required data-required' : ''}
      aria-describedby="${id}-error"
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
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${opts.required ? ' required data-required' : ''}>
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
  wrapper.className = 'field radio-fieldset';
  wrapper.id = `${groupId}-fieldset`;
  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  if (opts.required) legend.setAttribute('data-required', '');
  wrapper.appendChild(legend);
  if (opts.hint) {
    const hint = document.createElement('span');
    hint.className = 'hint';
    hint.textContent = opts.hint;
    wrapper.appendChild(hint);
  }
  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', `${groupId}-fieldset`);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
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
  const err = document.createElement('span');
  err.className = 'error-message';
  err.id = `${groupId}-error`;
  err.setAttribute('aria-live', 'polite');
  wrapper.appendChild(err);
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
    `<span class="section-step">Step ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const gradeOptions = [
  { value: 'consultant', label: 'Consultant' },
  { value: 'sas', label: 'SAS doctor' },
  { value: 'registrar', label: 'Registrar' },
  { value: 'foundation', label: 'Foundation doctor' },
  { value: 'gp', label: 'General practitioner' },
  { value: 'other', label: 'Other' }
];

const sexOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' }
];

const seenAfterDeathOptions = [
  { value: 'certifier', label: 'By the certifying doctor' },
  { value: 'another-practitioner', label: 'By another practitioner' },
  { value: 'not-seen', label: 'Not seen after death' }
];

const coronerReasonOptions = [
  { value: 'none', label: 'None — no referral criterion met' },
  { value: 'unnatural', label: 'Unnatural death' },
  { value: 'violent', label: 'Violent death' },
  { value: 'suspicious', label: 'Suspicious circumstances' },
  { value: 'unknown-cause', label: 'Cause of death unknown' },
  { value: 'industrial-disease', label: 'Industrial disease or occupational exposure' },
  { value: 'medical-procedure', label: 'Possibly due to a medical procedure, treatment, or neglect' },
  { value: 'custody', label: 'Death in custody or state detention' },
  { value: 'no-attending-practitioner', label: 'No attending practitioner able to certify' },
  { value: 'other', label: 'Other reportable circumstance' }
];

const medicalExaminerOptions = [
  { value: 'scrutinised', label: 'Scrutinised by a medical examiner' },
  { value: 'discussed', label: 'Discussed with a medical examiner' },
  { value: 'pending', label: 'Scrutiny pending' },
  { value: 'not-required', label: 'Not required (coroner case)' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per certificate step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Certification context',
    description: 'The certifying doctor, where and when the certificate is completed, and attendance on the deceased.'
  });
  card.appendChild(textInput({
    label: 'Certifying doctor — name', section: 'certification', field: 'certifyingDoctorName',
    required: true, placeholder: 'Attending practitioner'
  }));
  card.appendChild(selectInput({
    label: 'Certifying doctor — grade', section: 'certification', field: 'certifyingDoctorGrade',
    options: gradeOptions
  }));
  card.appendChild(textInput({
    label: 'GMC reference number', section: 'certification', field: 'gmcReference',
    placeholder: 'e.g. 7654321'
  }));
  card.appendChild(textInput({
    label: 'Place of certification', section: 'certification', field: 'placeOfCertification',
    placeholder: 'Hospital, practice, or other'
  }));
  card.appendChild(textInput({
    label: 'Date of certification', section: 'certification', field: 'certificationDate',
    type: 'date'
  }));
  card.appendChild(radioGroup({
    label: 'Attended the deceased during the last illness?', section: 'certification',
    field: 'attendedDeceased', options: yesNo
  }));
  card.appendChild(textInput({
    label: 'Date last seen alive by the certifier', section: 'certification', field: 'lastSeenAliveDate',
    type: 'date'
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Deceased identification',
    description: 'Who the certificate is about.'
  });
  card.appendChild(textInput({
    label: 'Deceased — full name', section: 'deceased', field: 'deceasedName',
    required: true, placeholder: 'Full name of the deceased'
  }));
  card.appendChild(selectInput({
    label: 'Sex', section: 'deceased', field: 'sex', options: sexOptions
  }));
  card.appendChild(textInput({
    label: 'Date of birth', section: 'deceased', field: 'dateOfBirth', type: 'date'
  }));
  card.appendChild(textInput({
    label: 'Age at death (years)', section: 'deceased', field: 'ageYears',
    type: 'number', min: 0, max: 130
  }));
  card.appendChild(textInput({
    label: 'Patient identifier (NHS number or local ID)', section: 'deceased',
    field: 'patientIdentifier', placeholder: 'e.g. 943 476 5919'
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Death details',
    description: 'When and where the death occurred, and who saw the body after death.'
  });
  card.appendChild(textInput({
    label: 'Date of death', section: 'death', field: 'dateOfDeath', type: 'date'
  }));
  card.appendChild(textInput({
    label: 'Time of death', section: 'death', field: 'timeOfDeath', type: 'time'
  }));
  card.appendChild(textInput({
    label: 'Place of death', section: 'death', field: 'placeOfDeath',
    placeholder: 'Ward, home, hospice, or other'
  }));
  card.appendChild(selectInput({
    label: 'Seen after death by', section: 'death', field: 'seenAfterDeathBy',
    options: seenAfterDeathOptions
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Part I — direct causal sequence',
    description: 'The sequence reads downward from the immediate cause I(a) to the underlying cause on the lowest completed line. Each line carries an approximate onset-to-death interval.'
  });
  card.appendChild(textInput({
    label: 'I(a) — disease or condition directly leading to death', section: 'partI',
    field: 'causeIaCondition',
    hint: 'The immediate cause. State a disease or injury, not a mode of death (e.g. not "cardiac arrest" alone).',
    placeholder: 'e.g. Bronchopneumonia'
  }));
  card.appendChild(textInput({
    label: 'I(a) — onset-to-death interval', section: 'partI', field: 'causeIaInterval',
    placeholder: 'e.g. 3 days'
  }));
  card.appendChild(textInput({
    label: 'I(b) — antecedent condition giving rise to I(a)', section: 'partI',
    field: 'causeIbCondition', placeholder: 'e.g. Chronic obstructive pulmonary disease'
  }));
  card.appendChild(textInput({
    label: 'I(b) — onset-to-death interval', section: 'partI', field: 'causeIbInterval',
    placeholder: 'e.g. 8 years'
  }));
  card.appendChild(textInput({
    label: 'I(c) — underlying condition giving rise to I(b)', section: 'partI',
    field: 'causeIcCondition', placeholder: 'e.g. Occupational dust exposure'
  }));
  card.appendChild(textInput({
    label: 'I(c) — onset-to-death interval', section: 'partI', field: 'causeIcInterval',
    placeholder: 'e.g. 30 years'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Part II — contributory conditions',
    description: 'Other significant conditions that contributed to the death but did not form part of the direct Part I sequence.'
  });
  card.appendChild(textArea({
    label: 'Contributory conditions', section: 'partII', field: 'partIiConditions',
    placeholder: 'e.g. Type 2 diabetes mellitus; ischaemic heart disease'
  }));
  card.appendChild(textInput({
    label: 'Interval (optional)', section: 'partII', field: 'partIiInterval',
    placeholder: 'e.g. 10 years'
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Coroner and medical-examiner referral',
    description: 'Whether the death has been referred to the coroner and why, and the medical-examiner scrutiny status. Every non-coroner death requires medical-examiner scrutiny before registration.'
  });
  card.appendChild(radioGroup({
    label: 'Referred to the coroner?', section: 'referral', field: 'referredToCoroner',
    options: yesNo
  }));
  card.appendChild(selectInput({
    label: 'Coroner-referral reason', section: 'referral', field: 'coronerReason',
    options: coronerReasonOptions,
    hint: 'Any reportable circumstance classifies the certificate as "refer to coroner".'
  }));
  card.appendChild(selectInput({
    label: 'Medical-examiner scrutiny status', section: 'referral', field: 'medicalExaminerStatus',
    options: medicalExaminerOptions
  }));
  card.appendChild(textArea({
    label: 'Certifier note', section: 'referral', field: 'certifierNote',
    placeholder: 'Free-text note from the certifying doctor.'
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Summary and validity',
    description: 'The live validity class, the derived underlying cause, and the coroner-referral indication. Submit to generate the full report.'
  });
  card.appendChild(readOnlyReadout({
    label: 'Live validity status',
    id: 'live-status-readout',
    render: () => renderLiveStatus()
  }));
  return card;
}

// ----------------------------------------------------------------------
// Live readout
// ----------------------------------------------------------------------

/** Render the live status: validity badge, underlying cause, coroner-referral note. */
function renderLiveStatus() {
  const result = validateCertificate(state);
  const badge =
    `<span class="risk-badge ${validityClassClass(result.validityClass)}">${esc(validityClassLabel(result.validityClass))}</span>`;
  const underlying = result.underlyingCause
    ? `<strong>Underlying cause:</strong> ${esc(result.underlyingCause)}`
    : `<span class="muted">Underlying cause not yet determinable (Part I empty)</span>`;
  const coroner = result.coronerReferralIndicated
    ? `<span class="muted">— coroner referral indicated</span>`
    : `<span class="muted">— no coroner-referral criterion met</span>`;
  return `${badge} ${underlying} ${coroner}`;
}

function refreshLiveStatus() {
  const el = document.getElementById('live-status-readout');
  if (el) el.innerHTML = renderLiveStatus();
}

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = state[section] ? state[section][field] : undefined;
    host.style.display = String(current) === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each section maps to one or more progress "slots". A slot counts as answered
// when ANY of its fields is answered.
const STEP_SLOTS = {
  certification: [['certifyingDoctorName'], ['certifyingDoctorGrade'], ['certificationDate']],
  deceased: [['deceasedName'], ['sex'], ['dateOfDeath', 'ageYears']],
  death: [['dateOfDeath'], ['placeOfDeath']],
  partI: [['causeIaCondition'], ['causeIaInterval']],
  partII: [['partIiConditions']],
  referral: [['referredToCoroner'], ['medicalExaminerStatus']]
};

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  let total = 0;
  const sectionAnswered = {};
  const sectionTotal = {};

  for (const section of Object.keys(STEP_SLOTS)) {
    const slots = STEP_SLOTS[section];
    sectionTotal[section] = slots.length;
    sectionAnswered[section] = 0;
    for (const slot of slots) {
      total++;
      const slotAnswered = slot.some((field) => isAnswered(section, field));
      if (slotAnswered) {
        answered++;
        sectionAnswered[section]++;
      }
    }
  }

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
    validityClass, underlyingCause, coronerReferralIndicated,
    flaggedIssues, timestamp
  } = lastResult;

  const partIRows = [
    { line: 'I(a)', condition: state.partI.causeIaCondition, interval: state.partI.causeIaInterval },
    { line: 'I(b)', condition: state.partI.causeIbCondition, interval: state.partI.causeIbInterval },
    { line: 'I(c)', condition: state.partI.causeIcCondition, interval: state.partI.causeIcInterval }
  ].map((r) => `
    <tr>
      <th scope="row">${esc(r.line)}</th>
      <td>${r.condition ? esc(r.condition) : '<span class="muted">—</span>'}</td>
      <td>${r.interval ? esc(r.interval) : '<span class="muted">—</span>'}</td>
    </tr>
  `).join('');

  const partIiRow = `
    <tr>
      <th scope="row">Part II</th>
      <td>${state.partII.partIiConditions ? esc(state.partII.partIiConditions) : '<span class="muted">—</span>'}</td>
      <td>${state.partII.partIiInterval ? esc(state.partII.partIiInterval) : '<span class="muted">—</span>'}</td>
    </tr>
  `;

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No statutory, safety, or governance flags raised.</p>`
    : `
      <ul class="flags">
        ${flaggedIssues.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority))}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}${f.suggestedAction ? ` — ${esc(f.suggestedAction)}` : ''}</span>
          </li>
        `).join('')}
      </ul>
    `;

  let guidance;
  if (validityClass === 'refer-to-coroner') {
    guidance = `<p>A coroner-referral criterion is met, so this certificate is classified <strong>refer to coroner</strong>. The MCCD should <strong>not</strong> be issued until the coroner has considered the case and confirmed that no investigation is required. This is a documentation finding — it does not replace the certifying doctor's statutory duty to refer.</p>`;
  } else if (validityClass === 'incomplete') {
    guidance = `<p>This certificate is <strong>incomplete</strong>: the direct cause on Part I(a) is missing, or the only cause given is a recognised mode of death. Complete the outstanding items flagged below before the certificate is issued. A valid certificate still requires medical-examiner scrutiny before registration.</p>`;
  } else {
    guidance = `<p>This certificate is <strong>valid</strong>: Part I(a) is present, the causal sequence is logically ordered, no unacceptable sole cause is given, and no coroner-referral criterion is met. This is a completeness-and-consistency finding — it does <strong>not</strong> discharge the certifying doctor's duty to consider referral. The certificate still requires medical-examiner scrutiny before registration.</p>`;
  }

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Medical Certificate of Cause of Death — Validation Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${validityClassClass(validityClass)}">
        <div>
          <span class="risk-banner-label">Validity class</span>
          <span class="risk-banner-value">${esc(validityClassLabel(validityClass))}</span>
        </div>
        ${coronerReferralIndicated ? '<span class="risk-badge risk-high">Coroner referral indicated</span>' : ''}
      </div>

      <p><strong>Underlying cause of death:</strong> ${underlyingCause ? esc(underlyingCause) : '<span class="muted">Not determinable (Part I empty)</span>'}</p>

      <h3>Recommended action</h3>
      ${guidance}

      <h3>Cause-of-death structure</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Line</th>
            <th scope="col">Condition</th>
            <th scope="col">Interval</th>
          </tr>
        </thead>
        <tbody>${partIRows}${partIiRow}</tbody>
      </table>

      <h3>Flagged issues (${flaggedIssues.length})</h3>
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
  const _errors = validateForm();
  if (_errors.length > 0) return;
  const result = validateCertificate(state);
  const flaggedIssues = detectFlaggedIssues(state);
  lastResult = {
    validityClass: result.validityClass,
    underlyingCause: result.underlyingCause,
    coronerReferralIndicated: result.coronerReferralIndicated,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh certificate?')) return;
  clearState();
  state = emptyCertificate();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveStatus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'certification', title: 'Certification context' },
  { step: 2, section: 'deceased',      title: 'Deceased' },
  { step: 3, section: 'death',         title: 'Death details' },
  { step: 4, section: 'partI',         title: 'Part I' },
  { step: 5, section: 'partII',        title: 'Part II' },
  { step: 6, section: 'referral',      title: 'Referral' },
  { step: 7, section: 'summary',       title: 'Summary' }
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
  const required = form.querySelectorAll('input[data-required], select[data-required], textarea[data-required]');
  const seen = new Set();
  required.forEach((input) => {
    let id = input.id;
    if (input.type === 'radio') id = input.name;
    if (seen.has(id)) return;
    seen.add(id);
    // Skip fields hidden inside a collapsed conditional section.
    const conditional = input.closest('[data-conditional]');
    if (conditional && conditional.style.display === 'none') return;
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveStatus();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
