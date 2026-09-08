import { detectFlaggedIssues } from './flags.js';
import { gradePlan } from './grader.js';
import { ceilingLabel, clinicianRoleLabel, cprRecommendationLabel, emptyPlan, involvementLabel, priorityBalanceLabel, priorityLabel, statusClass, statusLabel, yesNoLabel } from './types.js';

// Recommended Summary Plan for Emergency Care and Treatment (ReSPECT) — wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through the eight ReSPECT sections plus
// a summary; a sticky top-of-page progress summary reflects how many mandatory
// fields have been answered, and a live completeness readout shows the running
// status (complete / incomplete) and completeness percentage. Submission runs
// the pure completeness engine (mandatory rules → status + completeness percent,
// plus safety / governance flags) and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'recommended-summary-plan-for-emergency-care-and-treatment.front-end-with-html.v1';

/** @returns {import('./types.js').RespectPlan} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  // Merge over a fresh empty so any newly-added fields default correctly.
  const fresh = emptyPlan();

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
    if (!raw) return emptyPlan();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved plan; starting fresh.', e);
    return emptyPlan();
  }
}

/** @param {import('./types.js').RespectPlan} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save plan to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored plan.', e);
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

/** @type {import('./types.js').RespectPlan} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'recommended-summary-plan-for-emergency-care-and-treatment',
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
    refreshLiveStatus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 9;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-status readout after each change.
 *
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

/** Set the top-level free-text note. */
function setNote(value) {
  state.note = value;
  saveState(state);
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
  const labelText = esc(opts.label);
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
  if (opts.required) attrs.push('required', 'data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    const v = input.value === '' && (type === 'date' || type === 'datetime-local')
      ? null
      : input.value;
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

  const labelText = esc(opts.label);

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
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

const priorityBalanceOptions = [
  { value: 'sustain-life', label: 'Prioritise sustaining life' },
  { value: 'balanced', label: 'Balanced — weigh both' },
  { value: 'comfort', label: 'Prioritise comfort' }
];

const ceilingOptions = [
  { value: 'appropriate', label: 'Appropriate' },
  { value: 'not-appropriate', label: 'Not appropriate' }
];

const involvementOptions = [
  { value: 'person', label: 'The person' },
  { value: 'legal-proxy', label: 'Legal proxy (welfare attorney / deputy)' },
  { value: 'consultees', label: 'Consultees / those close to the person' }
];

const clinicianRoleOptions = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'paramedic', label: 'Paramedic' },
  { value: 'other', label: 'Other' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per ReSPECT step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Personal details',
    description: 'Who the plan is about, so it can be recognised across care settings.'
  });
  card.appendChild(textInput({
    label: 'Name of the person', section: 'personal', field: 'personName',
    required: true, placeholder: 'e.g. Margaret Ellis'
  }));
  card.appendChild(textInput({
    label: 'Date of birth', section: 'personal', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  card.appendChild(textInput({
    label: 'Identifier (NHS / CHI number or local ID)', section: 'personal',
    field: 'identifier', required: true, placeholder: 'e.g. 943 476 5919'
  }));
  card.appendChild(textArea({
    label: 'Usual address', section: 'personal', field: 'address', rows: 2,
    placeholder: 'Usual residence'
  }));
  card.appendChild(textArea({
    label: 'Key contact / next of kin', section: 'personal', field: 'keyContact',
    rows: 2, placeholder: 'Name, relationship, and contact details'
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Summary of relevant health',
    description: 'A brief clinical picture that gives context to the recommendations.'
  });
  card.appendChild(textArea({
    label: 'Clinical summary', section: 'health', field: 'healthSummary',
    required: true,
    hint: 'A short summary of the person’s current health and situation.',
    placeholder: 'e.g. Advanced heart failure, recurrent admissions, frailty.'
  }));
  card.appendChild(textArea({
    label: 'Relevant diagnoses', section: 'health', field: 'diagnoses',
    placeholder: 'Key diagnoses relevant to emergency care'
  }));
  card.appendChild(textArea({
    label: 'Existing documents', section: 'health', field: 'existingDocuments',
    hint: 'Advance Decision to Refuse Treatment, Lasting Power of Attorney, organ-donation wishes, etc.',
    placeholder: 'e.g. ADRT held; welfare LPA registered.'
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Preferences and what matters',
    description: 'What the person values, and their priorities and fears for their care.'
  });
  card.appendChild(textArea({
    label: 'What matters to the person', section: 'preferences', field: 'whatMatters',
    hint: 'Values, priorities, and fears. Record here or under care preferences.',
    placeholder: 'e.g. Wishes to remain at home; fears breathlessness.'
  }));
  card.appendChild(textArea({
    label: 'Preferences for care', section: 'preferences', field: 'carePreferences',
    placeholder: 'e.g. Comfort-focused care; avoid hospital where possible.'
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Clinical recommendations',
    description: 'Agreed recommendations on the balance between sustaining life and comfort.'
  });
  card.appendChild(selectInput({
    label: 'Balance of priorities', section: 'recommendations', field: 'priorityBalance',
    required: true, options: priorityBalanceOptions,
    hint: 'Where, on balance, care should be focused.'
  }));
  card.appendChild(textArea({
    label: 'Recommended interventions', section: 'recommendations',
    field: 'recommendedInterventions',
    placeholder: 'Realistic interventions that are recommended.'
  }));
  card.appendChild(textArea({
    label: 'Not-recommended interventions', section: 'recommendations',
    field: 'notRecommendedInterventions',
    placeholder: 'Interventions that are not recommended.'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'CPR recommendation',
    description: 'The explicit recommendation on cardiopulmonary resuscitation — the most safety-critical field.'
  });
  card.appendChild(radioGroup({
    label: 'CPR recommendation', section: 'cpr', field: 'cprRecommendation',
    required: true,
    options: [
      { value: 'attempt', label: 'CPR should be attempted' },
      { value: 'do-not-attempt', label: 'CPR should NOT be attempted (DNACPR)' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Clinical rationale', section: 'cpr', field: 'cprRationale',
    placeholder: 'The clinical reasoning behind this recommendation.'
  }));
  card.appendChild(radioGroup({
    label: 'Was this discussed with the person or their proxy?',
    section: 'cpr', field: 'cprDiscussed', options: yesNo,
    hint: 'A do-not-attempt recommendation should be accompanied by a documented discussion.'
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Ceilings of treatment',
    description: 'Agreed limits on treatment, such as hospital transfer or critical-care admission.'
  });
  card.appendChild(selectInput({
    label: 'Hospital transfer', section: 'ceilings', field: 'hospitalTransfer',
    options: ceilingOptions
  }));
  card.appendChild(selectInput({
    label: 'Critical-care admission', section: 'ceilings', field: 'criticalCareAdmission',
    options: ceilingOptions
  }));
  card.appendChild(textArea({
    label: 'Other agreed limits', section: 'ceilings', field: 'treatmentCeilings',
    placeholder: 'Any other ceilings of treatment agreed.'
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Capacity and involvement',
    description: 'Whether the person has capacity for this decision, and who was involved (Mental Capacity Act 2005).'
  });
  card.appendChild(radioGroup({
    label: 'Does the person have capacity for this decision?',
    section: 'capacity', field: 'hasCapacity', required: true, options: yesNo,
    hint: 'Capacity is decision- and time-specific.'
  }));

  const conditional = document.createElement('div');
  conditional.setAttribute('data-conditional', 'capacity.hasCapacity=no');
  const notice = document.createElement('p');
  notice.className = 'hint';
  notice.textContent =
    'Because the person is recorded as lacking capacity, document the capacity assessment and the legal proxy / consultees involved in the best-interests decision.';
  conditional.appendChild(notice);
  conditional.appendChild(textArea({
    label: 'Capacity assessment', section: 'capacity', field: 'capacityAssessment',
    placeholder: 'How capacity was assessed and the conclusion reached.'
  }));
  conditional.appendChild(selectInput({
    label: 'Who was involved', section: 'capacity', field: 'involvement',
    options: involvementOptions
  }));
  conditional.appendChild(textArea({
    label: 'Legal proxy / consultee details', section: 'capacity', field: 'proxyDetails',
    placeholder: 'Welfare attorney, court-appointed deputy, or consultee details.'
  }));
  card.appendChild(conditional);
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Clinician sign-off',
    description: 'The completing clinician signs and dates the plan for it to be valid.'
  });
  card.appendChild(textInput({
    label: 'Clinician name', section: 'signOff', field: 'clinicianName',
    required: true, placeholder: 'e.g. Dr A. Okafor'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role', section: 'signOff', field: 'clinicianRole',
    required: true, options: clinicianRoleOptions
  }));
  card.appendChild(textInput({
    label: 'Registration (GMC / NMC / HCPC)', section: 'signOff',
    field: 'clinicianRegistration', placeholder: 'e.g. GMC 7654321'
  }));
  card.appendChild(textInput({
    label: 'Signature', section: 'signOff', field: 'signature', required: true,
    placeholder: 'Type your full name to sign'
  }));
  card.appendChild(textInput({
    label: 'Date and time signed', section: 'signOff', field: 'signedAt',
    type: 'datetime-local', required: true
  }));
  card.appendChild(textArea({
    label: 'Senior clinician endorsement', section: 'signOff', field: 'seniorEndorsement',
    rows: 2, placeholder: 'Senior endorsement, if applicable.'
  }));
  card.appendChild(textArea({
    label: 'Emergency contacts', section: 'signOff', field: 'emergencyContacts',
    rows: 2, placeholder: 'Contacts to notify in an emergency.'
  }));
  card.appendChild(textInput({
    label: 'Planned review date', section: 'signOff', field: 'reviewDate',
    type: 'date', hint: 'A review date in the past raises a governance flag.'
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Summary',
    description: 'The live completeness status and a free-text note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live completeness status',
    id: 'live-status-readout',
    render: () => renderLiveStatus()
  }));

  const noteWrap = document.createElement('div');
  noteWrap.className = 'field';
  noteWrap.innerHTML = `
    <label class="label" for="note-field">Clinician note</label>
    <textarea id="note-field" name="note-field" rows="3"
      class="text-area-input"
      placeholder="Free-text note: context, decisions, and anything to hand over.">${esc(state.note ?? '')}</textarea>
  `;
  noteWrap.querySelector('textarea').addEventListener('input', (e) => {
    setNote(e.target.value);
  });
  card.appendChild(noteWrap);

  return card;
}

// ----------------------------------------------------------------------
// Live readout
// ----------------------------------------------------------------------

/** Render the live completeness status badge + percentage. */
function renderLiveStatus() {
  const grade = gradePlan(state);
  const badge =
    `<span class="risk-badge ${statusClass(grade.status)}">${esc(statusLabel(grade.status))}</span>`;
  return `${badge} <strong>${grade.completenessPercent}% complete</strong> ` +
    `<span class="muted">(${grade.satisfiedCount} of ${grade.mandatoryCount} mandatory rules satisfied)</span>`;
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
// when ANY of its fields is answered. Slots mirror the mandatory-content
// requirements so progress tracks how close the plan is to being complete.
const STEP_SLOTS = {
  personal: [['personName'], ['dateOfBirth'], ['identifier']],
  health: [['healthSummary']],
  preferences: [['whatMatters', 'carePreferences']],
  recommendations: [['priorityBalance'], ['recommendedInterventions', 'notRecommendedInterventions']],
  cpr: [['cprRecommendation']],
  ceilings: [['hospitalTransfer', 'criticalCareAdmission', 'treatmentCeilings']],
  capacity: [['hasCapacity']],
  signOff: [['clinicianName'], ['clinicianRole'], ['signature'], ['signedAt']]
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
    status, completenessPercent, satisfiedCount, mandatoryCount,
    firedRules, flaggedIssues, timestamp
  } = lastResult;

  const ruleRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.description)}</th>
      <td class="num">
        <span class="grade-pill ${r.satisfied ? 'risk-low' : 'risk-high'}">
          ${r.satisfied ? 'Satisfied' : 'Unsatisfied'}
        </span>
      </td>
    </tr>
  `).join('');

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No safety or governance flags raised.</p>`
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

  const guidance = status === 'complete'
    ? `<p>This ReSPECT plan is <strong>complete</strong>: every mandatory content and process requirement is satisfied. It is ready to be recognised and acted upon across care settings. Review it whenever the person’s wishes or condition change.</p>`
    : `<p>This ReSPECT plan is <strong>incomplete</strong>: one or more mandatory requirements are unsatisfied. It should not be relied upon until the outstanding items below are completed. This does not replace real-time clinical judgement in an emergency.</p>`;

  const summary = esc(state.cpr.cprRecommendation
    ? cprRecommendationLabel(state.cpr.cprRecommendation)
    : cprRecommendationLabel(''));

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>ReSPECT Plan — Completeness Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${statusClass(status)}">
        <div>
          <span class="risk-banner-label">Status</span>
          <span class="risk-banner-value">${esc(statusLabel(status))} — ${completenessPercent}% complete</span>
        </div>
        <span class="risk-badge ${statusClass(status)}">${satisfiedCount} / ${mandatoryCount} rules</span>
      </div>

      <p><strong>CPR recommendation:</strong> ${summary}</p>

      <h3>Recommended action</h3>
      ${guidance}

      <h3>Mandatory rules (${satisfiedCount} of ${mandatoryCount} satisfied)</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Mandatory requirement</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>${ruleRows}</tbody>
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
  const grade = gradePlan(state);
  const flaggedIssues = detectFlaggedIssues(state);
  lastResult = {
    status: grade.status,
    completenessPercent: grade.completenessPercent,
    satisfiedCount: grade.satisfiedCount,
    mandatoryCount: grade.mandatoryCount,
    firedRules: grade.firedRules,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh plan?')) return;
  clearState();
  state = emptyPlan();
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
  { step: 1, section: 'personal',        title: 'Personal details' },
  { step: 2, section: 'health',          title: 'Health summary' },
  { step: 3, section: 'preferences',     title: 'Preferences' },
  { step: 4, section: 'recommendations', title: 'Recommendations' },
  { step: 5, section: 'cpr',             title: 'CPR' },
  { step: 6, section: 'ceilings',        title: 'Ceilings' },
  { step: 7, section: 'capacity',        title: 'Capacity' },
  { step: 8, section: 'signOff',         title: 'Sign-off' },
  { step: 9, section: 'summary',         title: 'Summary' }
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
  host.appendChild(renderStep8());
  host.appendChild(renderStep9());
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
