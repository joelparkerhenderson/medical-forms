import { detectFlaggedIssues } from './flags.js';
import { triage } from './grader.js';
import { acvpuLabel, ageBandLabel, arrivalModeLabel, careSettingLabel, emptyAssessment, onOxygenLabel, priorityClass, priorityLabel, priorityName, sexLabel, targetLabel } from './types.js';

// Emergency Department Triage Note — first-contact triage wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The triage nurse scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered, and a live
// classification readout (MTS priority level, colour, target time, and the
// supporting NEWS2 aggregate) updates as findings are entered. Submission runs
// the pure classification engine (NEWS2 aggregate + MTS discriminators →
// priority level, colour, name, target time, and red-flag issues) and renders
// an inline report. State is persisted to localStorage so a partial fill
// survives a page reload.
//
// This is a CLASSIFICATION form: the engine selects the most urgent level
// justified by the findings; it does not sum a numeric total.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'emergency-department-triage-note.front-end-with-html.v1';

/** @returns {import('./types.js').AssessmentData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyAssessment();

  for (const key of Object.keys(fresh)) {
    if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null) {
      fresh[key] = { ...fresh[key], ...parsed[key] };
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
    console.warn('Could not parse saved assessment; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save assessment to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored assessment.', e);
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

/** @type {import('./types.js').TriageResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'emergency-department-triage-note',
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
    refreshLiveScore();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 8;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-classification readout after each change.
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshLiveScore();
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
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <input ${attrs.join(' ')}>
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    let v = input.value;
    if (type === 'number') {
      v = v === '' ? null : Number(v);
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
      aria-describedby="${id}-error"
      class="text-area-input"${opts.required ? ' required data-required' : ''}>${esc(value)}</textarea>
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

/** Append a `data-conditional` wrapper whose visibility depends on state. */
function conditionalBlock(expr, children) {
  const host = document.createElement('div');
  host.setAttribute('data-conditional', expr);
  for (const c of children) host.appendChild(c);
  return host;
}

// ----------------------------------------------------------------------
// Section renderers (1 per triage step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

/** Build a fieldset of yes/no discriminators. */
function discriminatorGroup(card, items) {
  for (const it of items) {
    card.appendChild(radioGroup({
      label: it.label, section: 'discriminators', field: it.field,
      options: yesNo, hint: it.hint
    }));
  }
}

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Triage context',
    description: 'Who is performing triage, when, and in which care setting.'
  });
  card.appendChild(textInput({
    label: 'Triage nurse name',
    section: 'context', field: 'nurseName', required: true,
    placeholder: 'e.g. Nurse J. Okafor'
  }));
  card.appendChild(textInput({
    label: 'Date and time of triage',
    section: 'context', field: 'triagedAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'careSetting', required: true,
    options: [
      { value: 'emergency-department', label: 'Emergency department' },
      { value: 'urgent-treatment-centre', label: 'Urgent treatment centre' },
      { value: 'minor-injuries-unit', label: 'Minor injuries unit' }
    ]
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Arrival',
    description: 'How and when the patient arrived, and who referred them.'
  });
  card.appendChild(selectInput({
    label: 'Mode of arrival',
    section: 'arrival', field: 'arrivalMode',
    options: [
      { value: 'walk-in', label: 'Walk-in' },
      { value: 'ambulance', label: 'Ambulance' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Time of arrival',
    section: 'arrival', field: 'arrivedAt', type: 'datetime-local'
  }));
  card.appendChild(textInput({
    label: 'Referral source',
    section: 'arrival', field: 'referralSource',
    placeholder: 'e.g. Self, GP, ambulance service, other'
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Patient identification',
    description: 'Identify the patient and record the age band and sex.'
  });
  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. NHS 485 777 3456 or A&E-100517'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand',
    hint: 'Paediatric red-flag discriminators apply for children; paediatric early-warning scoring (PEWS) is out of scope.',
    options: [
      { value: 'paediatric', label: 'Paediatric' },
      { value: 'adult', label: 'Adult' },
      { value: 'older-adult', label: 'Older adult' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'identification', field: 'sex',
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'other', label: 'Other' }
    ]
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Presenting complaint',
    description: 'The chief complaint, relevant brief history, and onset timing.'
  });
  card.appendChild(textArea({
    label: 'Presenting complaint',
    section: 'complaint', field: 'presentingComplaint', required: true,
    placeholder: "Chief complaint in the patient's or clinician's words."
  }));
  card.appendChild(textArea({
    label: 'Brief relevant history',
    section: 'complaint', field: 'briefHistory',
    placeholder: 'Relevant background, medications, allergies, comorbidities.'
  }));
  card.appendChild(textInput({
    label: 'Symptom onset',
    section: 'complaint', field: 'symptomOnset',
    placeholder: 'e.g. 2 hours ago, on waking, gradual over 3 days'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Vital signs',
    description: 'Triage observations. These feed the supporting NEWS2 aggregate; missing values never lower the category.'
  });
  card.appendChild(textInput({
    label: 'Respiratory rate',
    section: 'vitals', field: 'respiratoryRate',
    type: 'number', min: 0, max: 80, step: 1, unit: 'breaths/min'
  }));
  card.appendChild(textInput({
    label: 'Oxygen saturation (SpO₂)',
    section: 'vitals', field: 'spo2',
    type: 'number', min: 50, max: 100, step: 1, unit: '%'
  }));
  card.appendChild(radioGroup({
    label: 'Air or supplemental oxygen?',
    section: 'vitals', field: 'onOxygen',
    options: [
      { value: 'air', label: 'Air' },
      { value: 'oxygen', label: 'Supplemental oxygen' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Systolic blood pressure',
    section: 'vitals', field: 'systolicBp',
    type: 'number', min: 40, max: 300, step: 1, unit: 'mmHg'
  }));
  card.appendChild(textInput({
    label: 'Pulse',
    section: 'vitals', field: 'pulse',
    type: 'number', min: 20, max: 250, step: 1, unit: 'beats/min'
  }));
  card.appendChild(radioGroup({
    label: 'Consciousness (ACVPU)',
    section: 'vitals', field: 'consciousnessAcvpu',
    hint: 'Only "Alert" is normal; new confusion, voice, pain, or unresponsive escalate the category.',
    options: [
      { value: 'A', label: 'Alert' },
      { value: 'C', label: 'New confusion' },
      { value: 'V', label: 'Responds to Voice' },
      { value: 'P', label: 'Responds to Pain' },
      { value: 'U', label: 'Unresponsive' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Temperature',
    section: 'vitals', field: 'temperature',
    type: 'number', min: 25, max: 45, step: 0.1, unit: '°C'
  }));
  card.appendChild(textInput({
    label: 'Glasgow Coma Scale (optional)',
    section: 'vitals', field: 'glasgowComaScale',
    type: 'number', min: 3, max: 15, step: 1, unit: '/15',
    hint: 'Optional supporting disability finding (3–15).'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Supporting NEWS2 aggregate',
    id: 'news2-readout',
    render: () => renderNews2Readout()
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Pain score',
    description: 'Numeric pain rating 0–10. Severe pain (≥ 7) is Very urgent; moderate pain (4–6) is Urgent.'
  });
  card.appendChild(textInput({
    label: 'Pain score',
    section: 'pain', field: 'painScore',
    type: 'number', min: 0, max: 10, step: 1, unit: '/10'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Pain discriminator',
    id: 'pain-readout',
    render: () => renderPainReadout()
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Discriminators',
    description: 'Manchester Triage System general discriminators. Any "Yes" forces at least the level shown; the most urgent wins.'
  });
  discriminatorGroup(card, [
    { field: 'airwayThreat', label: 'Airway — threatened or compromised airway? (Immediate)' },
    { field: 'breathingInadequate', label: 'Breathing — severely inadequate breathing / respiratory failure? (Immediate)' },
    { field: 'circulationShock', label: 'Circulation — shock or circulatory compromise? (Immediate)' },
    { field: 'haemorrhageMajor', label: 'Circulation — major or catastrophic haemorrhage? (Immediate)' },
    { field: 'seizureActive', label: 'Disability — active seizure? (Immediate)' },
    { field: 'consciousnessReduced', label: 'Disability — reduced consciousness (voice / pain)? (Very urgent)' },
    { field: 'focalNeurology', label: 'Disability — acute focal neurological deficit? (Very urgent)' },
    { field: 'strokeFeatures', label: 'Disability — features of acute stroke? (Very urgent, time-critical)' },
    { field: 'chestPainCardiac', label: 'Circulation — chest pain of possible cardiac origin? (Very urgent, time-critical)' },
    { field: 'sepsisFeatures', label: 'Temperature — features suggestive of sepsis? (Very urgent)' },
    { field: 'paediatricRedFlag', label: 'Disability — paediatric red flag? (Very urgent, time-critical)' }
  ]);
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Summary and category',
    description: 'Live triage category, target time, supporting NEWS2, and a free-text triage note. Submit to generate the full report.'
  });
  card.appendChild(readOnlyReadout({
    label: 'Live triage category',
    id: 'live-score-readout',
    render: () => renderLiveScore()
  }));
  card.appendChild(textArea({
    label: 'Triage note',
    section: 'note', field: 'clinicalNotes',
    placeholder: 'Free-text triage note: context, decisions, and any escalation already actioned.'
  }));
  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

function renderNews2Readout() {
  const r = triage(state);
  const red = r.news2AnyParameterThree
    ? ` <span class="flag-priority flag-high">RED SCORE</span>` : '';
  return `<strong>${r.news2Total}</strong> aggregate${red}` +
    `<br><span class="muted">Supports, but does not replace, the MTS category.</span>`;
}

function renderPainReadout() {
  const pain = state.pain.painScore;
  if (pain === null || pain === undefined) {
    return `<strong class="muted">—</strong> <span class="muted">(not recorded)</span>`;
  }
  if (pain >= 7) return `<strong class="flag-high">Severe (${pain}/10)</strong> <span class="muted">→ Very urgent (Level 2)</span>`;
  if (pain >= 4) return `<strong class="flag-medium">Moderate (${pain}/10)</strong> <span class="muted">→ Urgent (Level 3)</span>`;
  return `<strong class="ok">Mild (${pain}/10)</strong> <span class="muted">(no pain escalation)</span>`;
}

function renderLiveScore() {
  const r = triage(state);
  const badge =
    `<span class="risk-badge ${priorityClass(r.priorityLevel)}">${esc(r.priorityColour.toUpperCase())} · ${esc(r.priorityName)}</span>`;
  return `<strong>Level ${r.priorityLevel}</strong> ${badge}` +
    `<br><span class="muted">Target: ${esc(targetLabel(r.priorityLevel))} · NEWS2 ${r.news2Total}</span>`;
}

function refreshLiveScore() {
  const news2 = document.getElementById('news2-readout');
  if (news2) news2.innerHTML = renderNews2Readout();
  const pain = document.getElementById('pain-readout');
  if (pain) pain.innerHTML = renderPainReadout();
  const live = document.getElementById('live-score-readout');
  if (live) live.innerHTML = renderLiveScore();
}

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = state[section]?.[field];
    host.style.display = String(current) === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered.
const STEP_SLOTS = {
  context: [['nurseName'], ['careSetting']],
  arrival: [['arrivalMode']],
  identification: [['patientIdentifier']],
  complaint: [['presentingComplaint']],
  vitals: [['respiratoryRate'], ['spo2'], ['onOxygen'], ['systolicBp'], ['pulse'], ['consciousnessAcvpu'], ['temperature']],
  pain: [['painScore']],
  discriminators: [[
    'airwayThreat', 'breathingInadequate', 'circulationShock', 'haemorrhageMajor',
    'consciousnessReduced', 'seizureActive', 'focalNeurology', 'sepsisFeatures',
    'chestPainCardiac', 'strokeFeatures', 'paediatricRedFlag'
  ]],
  note: [['clinicalNotes']]
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

function priorityFlagClass(priority) {
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
    subscores, news2Total, news2AnyParameterThree, firedDiscriminators,
    priorityLevel, priorityColour, priorityName: pName, complete,
    flaggedIssues, timestamp
  } = lastResult;

  const s = state;
  const fmt = (v, unit) => (v === null || v === '' || v === undefined)
    ? 'Not recorded' : `${v}${unit ? ' ' + unit : ''}`;
  const pill = (p) => p === null || p === undefined
    ? '<span class="grade-pill">—</span>'
    : `<span class="grade-pill">${p} point${p === 1 ? '' : 's'}</span>`;

  const vitalRows = [
    ['Respiratory rate', fmt(s.vitals.respiratoryRate, 'breaths/min'), subscores.respiratoryRate],
    ['Oxygen saturation (SpO₂)', fmt(s.vitals.spo2, '%'), subscores.spo2],
    ['Air or supplemental oxygen', onOxygenLabel(s.vitals.onOxygen) || 'Not recorded', subscores.oxygen],
    ['Systolic blood pressure', fmt(s.vitals.systolicBp, 'mmHg'), subscores.systolicBp],
    ['Pulse', fmt(s.vitals.pulse, 'beats/min'), subscores.pulse],
    ['Consciousness (ACVPU)', acvpuLabel(s.vitals.consciousnessAcvpu) || 'Not recorded', subscores.consciousness],
    ['Temperature', fmt(s.vitals.temperature, '°C'), subscores.temperature]
  ].map(([name, value, point]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
      <td class="num">${pill(point)}</td>
    </tr>
  `).join('');

  const discList = firedDiscriminators.length === 0
    ? `<p class="muted">No discriminators fired; default Standard (Level 4) or Non-urgent (Level 5).</p>`
    : `
      <ul class="flags">
        ${firedDiscriminators.map((d) => `
          <li class="${priorityFlagClass(d.level <= 1 ? 'high' : (d.level === 2 ? 'high' : 'medium'))}">
            <span class="flag-priority">LEVEL ${d.level}</span>
            <span class="flag-category">${esc(d.category)}</span>
            <span class="flag-message">${esc(d.description)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No red-flag issues raised.</p>`
    : `
      <ul class="flags">
        ${flaggedIssues.map((f) => `
          <li class="${priorityFlagClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority))}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}${f.suggestedAction ? ` — ${esc(f.suggestedAction)}` : ''}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const incompleteNote = complete
    ? ''
    : `<p class="muted">One or more core vital signs have not been recorded; the NEWS2 aggregate and category may understate risk until the observation set is complete.</p>`;

  const target = targetLabel(priorityLevel);

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Triage Classification Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${priorityClass(priorityLevel)}">
        <div>
          <span class="risk-banner-label">MTS priority</span>
          <span class="risk-banner-value">Level ${priorityLevel} · ${esc(pName)}</span>
        </div>
        <span class="risk-badge ${priorityClass(priorityLevel)}">${esc(priorityColour.toUpperCase())}</span>
      </div>

      <p><strong>Target time to first clinical assessment:</strong> ${esc(target)}</p>
      <p><strong>Supporting NEWS2 aggregate:</strong> ${news2Total}${news2AnyParameterThree ? ' · single-parameter red score' : ''}</p>
      ${incompleteNote}

      <h3>Vital signs (supporting NEWS2)</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Parameter</th>
            <th scope="col">Value</th>
            <th scope="col">Subscore</th>
          </tr>
        </thead>
        <tbody>${vitalRows}</tbody>
      </table>

      <h3>Fired discriminators (${firedDiscriminators.length})</h3>
      ${discList}

      <h3>Red-flag issues (${flaggedIssues.length})</h3>
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
  const result = triage(state);
  const flaggedIssues = detectFlaggedIssues(state, result);
  lastResult = {
    subscores: result.subscores,
    news2Total: result.news2Total,
    news2AnyParameterThree: result.news2AnyParameterThree,
    firedDiscriminators: result.firedDiscriminators,
    priorityLevel: result.priorityLevel,
    priorityColour: result.priorityColour,
    priorityName: result.priorityName,
    targetMinutes: result.targetMinutes,
    complete: result.complete,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh triage assessment?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveScore();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'arrival',        title: 'Arrival' },
  { step: 3, section: 'identification', title: 'Patient' },
  { step: 4, section: 'complaint',      title: 'Complaint' },
  { step: 5, section: 'vitals',         title: 'Vital signs' },
  { step: 6, section: 'pain',           title: 'Pain' },
  { step: 7, section: 'discriminators', title: 'Discriminators' },
  { step: 8, section: 'note',           title: 'Summary' }
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveScore();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
