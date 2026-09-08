import { assess } from './grader.js';
import { emptyAssessment, priorityLabel, statusClass, statusLabel } from './types.js';

// Learning Disability Annual Health Check — single-page wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered, and a live
// completeness readout (status, percentage, and Health Action Plan) updates as
// the required components are recorded. Submission runs the pure completeness
// engine (component checklist, completeness percentage, Health Action Plan gate,
// and clinical flags) and renders an inline report. State is persisted to
// localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'learning-disability-annual-health-check.front-end-with-html.v1';

/** @returns {import('./types.js').AssessmentData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  // Merge over a fresh empty so any newly-added fields default correctly.
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
    console.warn('Could not parse saved check; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save check to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored check.', e);
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

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'learning-disability-annual-health-check',
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

const TOTAL_STEPS = 10;

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
      ${opts.required ? 'required data-required ' : ''}aria-describedby="${id}-error"
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
// Shared option sets
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const okIssueNa = [
  { value: 'ok', label: 'OK / no concern' },
  { value: 'issue', label: 'Issue found' },
  { value: 'not-assessed', label: 'Not assessed' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Check context',
    description: 'Who carried out the check, when, and how the person was invited.'
  });

  card.appendChild(textInput({
    label: 'Clinician name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. Sister J. Okafor'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'gp', label: 'GP' },
      { value: 'practice-nurse', label: 'Practice nurse' },
      { value: 'healthcare-assistant', label: 'Healthcare assistant' },
      { value: 'ld-team', label: 'Community LD-team clinician' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date of check',
    section: 'context', field: 'checkedOn', type: 'date', required: true
  }));
  card.appendChild(textInput({
    label: 'GP practice',
    section: 'context', field: 'practiceName', required: true,
    placeholder: 'e.g. Meadow Lane Surgery'
  }));
  card.appendChild(radioGroup({
    label: 'Easy-read invitation sent?',
    section: 'context', field: 'easyReadInvitationSent', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Pre-check questionnaire completed beforehand?',
    section: 'context', field: 'preCheckDone', options: yesNo
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Person identification',
    description: 'Who the check is for. This check is for people aged 14 or over on the LD register.'
  });

  card.appendChild(textInput({
    label: 'Person identifier',
    section: 'identification', field: 'personIdentifier', required: true,
    placeholder: 'e.g. NHS number or local ID'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    options: [
      { value: '14-17', label: '14-17' },
      { value: '18-24', label: '18-24' },
      { value: '25-44', label: '25-44' },
      { value: '45-64', label: '45-64' },
      { value: '65+', label: '65 and over' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'identification', field: 'sex',
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'intersex', label: 'Intersex' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Learning-disability register status',
    section: 'identification', field: 'ldRegisterStatus',
    options: [
      { value: 'on-register', label: 'On the LD register' },
      { value: 'not-on-register', label: 'Not on the LD register' },
      { value: 'newly-added', label: 'Newly added to the register' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Main carer or supporter',
    section: 'identification', field: 'mainCarer',
    placeholder: 'e.g. Parent, paid supporter, or none'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Reasonable adjustments & communication',
    description: 'How the practice will meet the person’s communication needs (Accessible Information Standard).'
  });

  card.appendChild(textArea({
    label: 'Communication needs',
    section: 'adjustments', field: 'communicationNeeds',
    placeholder: 'e.g. Easy-read materials, Makaton, AAC device, longer appointment, quiet room.'
  }));
  card.appendChild(radioGroup({
    label: 'Reasonable adjustments recorded?',
    section: 'adjustments', field: 'reasonableAdjustmentsRecorded', options: yesNo
  }));
  card.appendChild(selectInput({
    label: 'Hospital / health passport in place?',
    section: 'adjustments', field: 'healthPassport',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'not-applicable', label: 'Not applicable' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Consent and mental-capacity note',
    section: 'adjustments', field: 'consentCapacityNote',
    placeholder: 'Consent obtained, or a best-interests / capacity note where relevant.'
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Physical health',
    description: 'Record each physical-health component with a finding, then collate any actions for the Health Action Plan.'
  });

  card.appendChild(selectInput({
    label: 'Weight and BMI',
    section: 'physical', field: 'weightBmiStatus',
    options: [
      { value: 'recorded', label: 'Recorded' },
      { value: 'declined', label: 'Declined' },
      { value: 'not-recorded', label: 'Not recorded' }
    ]
  }));
  card.appendChild(textInput({
    label: 'BMI (kg/m²)',
    section: 'physical', field: 'bmi',
    type: 'number', min: 8, max: 80, step: 0.1, unit: 'kg/m²',
    hint: 'Optional; record if weight and height were measured.'
  }));
  card.appendChild(selectInput({
    label: 'Blood pressure',
    section: 'physical', field: 'bloodPressureStatus',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'raised', label: 'Raised' },
      { value: 'recorded', label: 'Recorded (see note)' },
      { value: 'not-recorded', label: 'Not recorded' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Epilepsy review',
    section: 'physical', field: 'epilepsyStatus',
    options: [
      { value: 'reviewed', label: 'Reviewed' },
      { value: 'not-applicable', label: 'Not applicable (no epilepsy)' },
      { value: 'not-reviewed', label: 'Not reviewed' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Constipation',
    section: 'physical', field: 'constipationStatus',
    options: [
      { value: 'none', label: 'None' },
      { value: 'present', label: 'Present' },
      { value: 'not-assessed', label: 'Not assessed' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Dysphagia (swallowing)',
    section: 'physical', field: 'dysphagiaStatus',
    options: [
      { value: 'none', label: 'None' },
      { value: 'present', label: 'Present' },
      { value: 'not-assessed', label: 'Not assessed' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Continence',
    section: 'physical', field: 'continenceStatus', options: okIssueNa
  }));
  card.appendChild(selectInput({
    label: 'Mobility and falls',
    section: 'physical', field: 'mobilityFallsStatus', options: okIssueNa
  }));
  card.appendChild(selectInput({
    label: 'Dental / oral health',
    section: 'physical', field: 'dentalStatus', options: okIssueNa
  }));
  card.appendChild(selectInput({
    label: 'Vision',
    section: 'physical', field: 'visionStatus', options: okIssueNa
  }));
  card.appendChild(selectInput({
    label: 'Hearing',
    section: 'physical', field: 'hearingStatus', options: okIssueNa
  }));
  card.appendChild(selectInput({
    label: 'Foot health',
    section: 'physical', field: 'footHealthStatus', options: okIssueNa
  }));
  card.appendChild(selectInput({
    label: 'Skin',
    section: 'physical', field: 'skinStatus', options: okIssueNa
  }));
  card.appendChild(textArea({
    label: 'Physical-health actions',
    section: 'physical', field: 'physicalHealthActions',
    hint: 'Record an action for every physical-health problem found; these feed the Health Action Plan.',
    placeholder: 'e.g. Refer to podiatry for foot ulcer; recheck BP in 2 weeks.'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Health screening & immunisations',
    description: 'Uptake of eligible national screening and routine immunisations.'
  });

  card.appendChild(selectInput({
    label: 'Cancer screening (bowel / breast / cervical)',
    section: 'screening', field: 'cancerScreeningStatus',
    options: [
      { value: 'up-to-date', label: 'Up to date' },
      { value: 'declined', label: 'Declined (with reason)' },
      { value: 'not-eligible', label: 'Not eligible' },
      { value: 'not-recorded', label: 'Not recorded' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Other screening',
    section: 'screening', field: 'otherScreeningStatus',
    options: [
      { value: 'up-to-date', label: 'Up to date' },
      { value: 'declined', label: 'Declined (with reason)' },
      { value: 'not-eligible', label: 'Not eligible' },
      { value: 'not-recorded', label: 'Not recorded' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Immunisations (seasonal and routine)',
    section: 'screening', field: 'immunisationStatus',
    options: [
      { value: 'up-to-date', label: 'Up to date' },
      { value: 'declined', label: 'Declined (with reason)' },
      { value: 'not-recorded', label: 'Not recorded' }
    ]
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Medication review incl. STOMP',
    description: 'Reconcile the medication list and review psychotropic medicines under STOMP (Stopping Over-Medication with Psychotropics).'
  });

  card.appendChild(radioGroup({
    label: 'Medication list reconciled at the check?',
    section: 'medication', field: 'medicationReconciled', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Any psychotropic medicine prescribed?',
    section: 'medication', field: 'psychotropicPrescribed', options: yesNo
  }));

  // STOMP fields — only relevant when a psychotropic is prescribed.
  const stompHost = document.createElement('div');
  stompHost.className = 'conditional-block';
  stompHost.setAttribute('data-conditional', 'medication.psychotropicPrescribed=yes');
  stompHost.appendChild(textArea({
    label: 'Documented indication for the psychotropic',
    section: 'medication', field: 'psychotropicIndication',
    placeholder: 'The clinical reason the medicine is prescribed.'
  }));
  stompHost.appendChild(textInput({
    label: 'Psychotropic last reviewed',
    section: 'medication', field: 'psychotropicLastReviewed', type: 'date',
    hint: 'Date the psychotropic medicine was last reviewed.'
  }));
  stompHost.appendChild(selectInput({
    label: 'STOMP discussed with the person / carer?',
    section: 'medication', field: 'stompDiscussed',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'not-applicable', label: 'Not applicable' }
    ]
  }));
  card.appendChild(stompHost);

  card.appendChild(textArea({
    label: 'Side effects reviewed',
    section: 'medication', field: 'medicationSideEffects',
    placeholder: 'Side effects checked and any action taken.'
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Mental health & behaviour',
    description: 'Mood, behaviour that challenges and its triggers, and recent life events.'
  });

  card.appendChild(selectInput({
    label: 'Mental health / mood',
    section: 'mental', field: 'mentalHealthStatus',
    options: [
      { value: 'ok', label: 'OK / no concern' },
      { value: 'concern', label: 'Concern' },
      { value: 'not-assessed', label: 'Not assessed' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Behaviour that challenges',
    section: 'mental', field: 'behaviourStatus',
    options: [
      { value: 'none', label: 'None' },
      { value: 'challenging', label: 'Behaviour that challenges' },
      { value: 'not-assessed', label: 'Not assessed' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Behaviour triggers and recent life events',
    section: 'mental', field: 'behaviourTriggers',
    placeholder: 'Known triggers, and any recent life events (bereavement, moves, changes).'
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Syndrome-specific checks',
    description: 'Condition-specific checks relevant to the person (for example Down syndrome thyroid, vision and hearing).'
  });

  card.appendChild(selectInput({
    label: 'Syndrome-specific health checks',
    section: 'syndrome', field: 'syndromeSpecificStatus',
    options: [
      { value: 'done', label: 'Done' },
      { value: 'not-applicable', label: 'Not applicable' },
      { value: 'not-done', label: 'Not done' }
    ]
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Carer & social',
    description: 'Carer needs and the carer’s own health, social circumstances, and day activity or employment.'
  });

  card.appendChild(selectInput({
    label: 'Carer needs',
    section: 'carer', field: 'carerNeedsStatus',
    options: [
      { value: 'assessed', label: 'Assessed' },
      { value: 'no-carer', label: 'No carer' },
      { value: 'not-assessed', label: 'Not assessed' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Social circumstances',
    section: 'carer', field: 'socialCircumstances',
    placeholder: 'Housing, day activity, employment, relationships, and support.'
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Health Action Plan',
    description: 'Produce and share the Health Action Plan the person can keep. A complete check needs every component plus this plan.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live completeness',
    id: 'live-status-readout',
    render: () => renderLiveStatus()
  }));

  card.appendChild(radioGroup({
    label: 'Health Action Plan produced?',
    section: 'plan', field: 'healthActionPlanProduced', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Health Action Plan shared with the person?',
    section: 'plan', field: 'healthActionPlanShared', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Health Action Plan actions',
    section: 'plan', field: 'healthActionPlanActions',
    placeholder: 'The collated actions from this check, written in a way the person can use.'
  }));
  card.appendChild(textArea({
    label: 'Clinician note',
    section: 'plan', field: 'clinicianNote',
    placeholder: 'Free-text summary of the check.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readout
// ----------------------------------------------------------------------

/** Render the live completeness status, percentage, and Health Action Plan. */
function renderLiveStatus() {
  const grade = assess(state);
  const badge =
    `<span class="risk-badge ${statusClass(grade.status)}">${esc(statusLabel(grade.status))}</span>`;
  const completed = grade.componentStatuses.filter((c) => c.completed).length;
  const total = grade.componentStatuses.length;
  const hap = grade.healthActionPlanComplete
    ? '<span class="ok">produced &amp; shared</span>'
    : '<span class="warn">not yet produced &amp; shared</span>';
  return (
    `<strong>${grade.completenessPercent}%</strong> ` +
    `<span class="muted">(${completed} of ${total} components)</span> ${badge}` +
    `<div class="muted">Health Action Plan: ${hap}</div>`
  );
}

function refreshLiveStatus() {
  const live = document.getElementById('live-status-readout');
  if (live) live.innerHTML = renderLiveStatus();
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
  context: [['clinicianName'], ['clinicianRole'], ['checkedOn'], ['practiceName'], ['easyReadInvitationSent'], ['preCheckDone']],
  identification: [['personIdentifier'], ['ageBand'], ['sex'], ['ldRegisterStatus'], ['mainCarer']],
  adjustments: [['communicationNeeds'], ['reasonableAdjustmentsRecorded'], ['healthPassport'], ['consentCapacityNote']],
  physical: [['weightBmiStatus'], ['bloodPressureStatus'], ['epilepsyStatus'], ['constipationStatus'], ['dysphagiaStatus'], ['continenceStatus'], ['mobilityFallsStatus'], ['dentalStatus'], ['visionStatus'], ['hearingStatus'], ['footHealthStatus'], ['skinStatus'], ['physicalHealthActions']],
  screening: [['cancerScreeningStatus'], ['otherScreeningStatus'], ['immunisationStatus']],
  medication: [['medicationReconciled'], ['psychotropicPrescribed'], ['medicationSideEffects']],
  mental: [['mentalHealthStatus'], ['behaviourStatus'], ['behaviourTriggers']],
  syndrome: [['syndromeSpecificStatus']],
  carer: [['carerNeedsStatus'], ['socialCircumstances']],
  plan: [['healthActionPlanProduced'], ['healthActionPlanShared'], ['healthActionPlanActions'], ['clinicianNote']]
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
    status, completenessPercent, healthActionPlanComplete,
    componentStatuses, flags, timestamp
  } = lastResult;

  const completed = componentStatuses.filter((c) => c.completed).length;
  const total = componentStatuses.length;

  const checklistRows = componentStatuses.map((c) => `
    <tr>
      <th scope="row">${esc(c.label)}</th>
      <td class="num">
        <span class="grade-pill ${c.completed ? 'ok' : 'warn'}">
          ${c.completed ? 'Completed' : 'Missing'}
        </span>
      </td>
    </tr>
  `).join('');

  const flagsList = flags.length === 0
    ? `<p class="muted">No clinical flags raised.</p>`
    : `
      <ul class="flags">
        ${flags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority))}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}${f.suggestedAction ? ` — ${esc(f.suggestedAction)}` : ''}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const guidance = status === 'complete'
    ? `<p>This annual health check is <strong>complete</strong>: every required component was carried out and a Health Action Plan was produced and shared with the person. Review the flags below and act on any that remain.</p>`
    : `<p>This annual health check is <strong>incomplete</strong>. Complete the components marked <em>Missing</em> below${healthActionPlanComplete ? '' : ', and produce and share the Health Action Plan'}, then re-check.</p>`;

  const hapLine = healthActionPlanComplete
    ? `<span class="risk-badge risk-low">Produced &amp; shared</span>`
    : `<span class="risk-badge risk-moderate">Not produced &amp; shared</span>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Annual Health Check Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${statusClass(status)}">
        <div>
          <span class="risk-banner-label">Completeness</span>
          <span class="risk-banner-value">${completenessPercent}% (${completed} of ${total})</span>
        </div>
        <span class="risk-badge ${statusClass(status)}">${esc(statusLabel(status))}</span>
      </div>

      <h3>Health Action Plan</h3>
      <p>${hapLine}</p>

      <h3>Recommended action</h3>
      ${guidance}

      <h3>Required components</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Component</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>${checklistRows}</tbody>
      </table>

      <h3>Flagged issues (${flags.length})</h3>
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
  lastResult = assess(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh check?')) return;
  clearState();
  state = emptyAssessment();
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
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'identification', title: 'Person' },
  { step: 3, section: 'adjustments',    title: 'Adjustments' },
  { step: 4, section: 'physical',       title: 'Physical health' },
  { step: 5, section: 'screening',      title: 'Screening' },
  { step: 6, section: 'medication',     title: 'Medication / STOMP' },
  { step: 7, section: 'mental',         title: 'Mental health' },
  { step: 8, section: 'syndrome',       title: 'Syndrome-specific' },
  { step: 9, section: 'carer',          title: 'Carer & social' },
  { step: 10, section: 'plan',          title: 'Health Action Plan' }
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
  host.appendChild(renderStep9());
  host.appendChild(renderStep10());
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
