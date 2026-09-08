import { detectFlaggedIssues } from './flags.js';
import { calculateCamGrade } from './grader.js';
import { classificationClass, classificationLabel, emptyAssessment, featureLabel, featureStateLabel, motoricSubtypeLabel, priorityLabel } from './types.js';

// Confusion Assessment Method (CAM) — bedside wizard (vanilla JavaScript,
// no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a LIVE
// classification readout (delirium present / absent / unable-to-assess, plus
// the positive-feature set) updates as the four features are entered. This is
// a status / classification form — there is no numeric score. Submission runs
// the pure classification engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'confusion-assessment-method.front-end-with-html.v1';

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

/** @type {import('./types.js').AssessmentData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'confusion-assessment-method',
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
    refreshLiveReadouts();
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
  refreshLiveReadouts();
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
    <label class="label" for="${id}">${esc(opts.label)}</label>
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

/** Single boolean checkbox that stores true/false onto the state. */
function checkboxInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const checked = state[opts.section][opts.field] === true;
  const wrapper = document.createElement('div');
  wrapper.className = 'field checkbox-field';
  wrapper.innerHTML = `
    <label class="checkbox-input" for="${id}">
      <input class="checkbox-input" type="checkbox" id="${id}" name="${id}"${checked ? ' checked' : ''}>
      <span>${esc(opts.label)}</span>
    </label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
  `;
  const box = wrapper.querySelector('input');
  box.addEventListener('change', () => {
    setField(opts.section, opts.field, box.checked);
  });
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
// Shared option lists
// ----------------------------------------------------------------------

const presentAbsent = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per CAM step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessor and encounter',
    description: 'Who is assessing, when, where, and which CAM variant is being used.'
  });

  card.appendChild(textInput({
    label: 'Assessor name',
    section: 'context', field: 'assessorName', required: true,
    placeholder: 'e.g. Staff Nurse J. Okoro'
  }));
  card.appendChild(selectInput({
    label: 'Assessor role',
    section: 'context', field: 'assessorRole', required: true,
    options: [
      { value: 'nurse', label: 'Nurse' },
      { value: 'doctor', label: 'Doctor' },
      { value: 'geriatrician', label: 'Geriatrician' },
      { value: 'liaison-psychiatrist', label: 'Liaison psychiatrist' },
      { value: 'physiotherapist', label: 'Physiotherapist' },
      { value: 'occupational-therapist', label: 'Occupational therapist' },
      { value: 'researcher', label: 'Researcher' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of assessment',
    section: 'context', field: 'assessedAt', type: 'datetime-local'
  }));
  card.appendChild(textInput({
    label: 'Ward or unit',
    section: 'context', field: 'wardUnit',
    placeholder: 'e.g. Care of the Elderly, Ward 12'
  }));
  card.appendChild(selectInput({
    label: 'Assessment variant',
    section: 'context', field: 'camVariant', required: true,
    hint: 'CAM-ICU substitutes non-verbal tasks and a RASS arousal screen for ventilated / non-verbal patients.',
    options: [
      { value: 'cam', label: 'CAM (standard bedside)' },
      { value: 'cam-icu', label: 'CAM-ICU (ventilated / non-verbal)' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age band, sex, cognitive baseline, and the source of the collateral history.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. hospital MRN or ward number'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    options: [
      { value: '16-39', label: '16-39' },
      { value: '40-59', label: '40-59' },
      { value: '60-74', label: '60-74' },
      { value: '75-plus', label: '75 and over' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'identification', field: 'sex', required: true,
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'intersex', label: 'Intersex' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Cognitive baseline',
    section: 'identification', field: 'cognitiveBaseline',
    hint: 'The patient’s usual cognition before this acute change.',
    options: [
      { value: 'independent', label: 'Independent' },
      { value: 'known-dementia', label: 'Known dementia' },
      { value: 'mild-cognitive-impairment', label: 'Mild cognitive impairment' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Source of collateral history',
    section: 'identification', field: 'collateralSource',
    options: [
      { value: 'family', label: 'Family' },
      { value: 'carer', label: 'Carer' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'notes', label: 'Case notes' },
      { value: 'none', label: 'None available' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Feature 1 — acute onset and fluctuating course',
    description: 'Positive when there is an acute change in mental status from baseline AND the abnormal behaviour fluctuates during the day.'
  });

  card.appendChild(radioGroup({
    label: 'Is feature 1 (acute onset and fluctuating course) present?',
    section: 'feature1', field: 'acuteOnsetFluctuating', required: true,
    hint: 'Usually established from a family member, carer, or nurse who knows the patient’s baseline.',
    options: presentAbsent
  }));
  card.appendChild(selectInput({
    label: 'Onset timing of the change',
    section: 'feature1', field: 'onsetTiming',
    options: [
      { value: 'hours', label: 'Hours' },
      { value: 'days', label: 'Days' },
      { value: 'weeks', label: 'Weeks' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  card.appendChild(readOnlyReadout({
    label: 'Feature 1 status',
    id: 'feature1-readout',
    render: () => renderFeatureReadout('feature1', 'acuteOnsetFluctuating')
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Feature 2 — inattention',
    description: 'Positive when the patient has difficulty focusing attention — easily distractible or unable to keep track — confirmed with a formal attention test.'
  });

  card.appendChild(radioGroup({
    label: 'Is feature 2 (inattention) present?',
    section: 'feature2', field: 'inattention', required: true,
    options: presentAbsent
  }));
  card.appendChild(selectInput({
    label: 'Attention test used',
    section: 'feature2', field: 'attentionTest',
    options: [
      { value: 'digit-span', label: 'Digit span' },
      { value: 'months-backwards', label: 'Months of the year backwards' },
      { value: 'serial-sevens', label: 'Serial sevens' },
      { value: 'attention-screening-examination', label: 'Attention Screening Examination (CAM-ICU)' },
      { value: 'not-completable', label: 'Not completable' }
    ]
  }));
  card.appendChild(readOnlyReadout({
    label: 'Feature 2 status',
    id: 'feature2-readout',
    render: () => renderFeatureReadout('feature2', 'inattention')
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Feature 3 — disorganised thinking',
    description: 'Positive when thinking is disorganised or incoherent — rambling or irrelevant conversation, illogical flow of ideas, or unpredictable switching between subjects.'
  });

  card.appendChild(radioGroup({
    label: 'Is feature 3 (disorganised thinking) present?',
    section: 'feature3', field: 'disorganisedThinking', required: true,
    options: presentAbsent
  }));
  card.appendChild(readOnlyReadout({
    label: 'Feature 3 status',
    id: 'feature3-readout',
    render: () => renderFeatureReadout('feature3', 'disorganisedThinking')
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Feature 4 — altered level of consciousness',
    description: 'Positive when the level of consciousness is anything other than alert. For CAM-ICU, record the RASS: a patient who is unrousable (RASS -4/-5) is recorded as unable to assess.'
  });

  card.appendChild(radioGroup({
    label: 'Is feature 4 (altered level of consciousness) present?',
    section: 'feature4', field: 'alteredConsciousness', required: true,
    options: presentAbsent
  }));
  card.appendChild(selectInput({
    label: 'Observed level of consciousness',
    section: 'feature4', field: 'consciousnessLevel',
    options: [
      { value: 'alert', label: 'Alert' },
      { value: 'vigilant', label: 'Vigilant (hyperalert)' },
      { value: 'lethargic', label: 'Lethargic (drowsy, easily roused)' },
      { value: 'stupor', label: 'Stupor (difficult to rouse)' },
      { value: 'coma', label: 'Coma (unrousable)' }
    ]
  }));

  // RASS is only relevant for the CAM-ICU variant.
  const rassHost = document.createElement('div');
  rassHost.setAttribute('data-conditional', 'context.camVariant=cam-icu');
  rassHost.appendChild(textInput({
    label: 'RASS score (Richmond Agitation-Sedation Scale)',
    section: 'feature4', field: 'rassScore',
    type: 'number', min: -5, max: 4, step: 1,
    hint: 'CAM-ICU only. Range -5 to +4. A RASS of -4 or -5 (unrousable) yields an unable-to-assess result.'
  }));
  card.appendChild(rassHost);

  card.appendChild(readOnlyReadout({
    label: 'Feature 4 status',
    id: 'feature4-readout',
    render: () => renderFeatureReadout('feature4', 'alteredConsciousness')
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Motoric subtype and observations',
    description: 'Psychomotor subtype and additional observations. Live CAM classification updates below as the features are entered.'
  });

  card.appendChild(selectInput({
    label: 'Psychomotor (motoric) subtype',
    section: 'observations', field: 'motoricSubtype',
    hint: 'Hypoactive delirium is the most frequently missed and carries the worst prognosis.',
    options: [
      { value: 'hypoactive', label: 'Hypoactive (quiet, withdrawn, drowsy)' },
      { value: 'hyperactive', label: 'Hyperactive (restless, agitated)' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'normal', label: 'Normal psychomotor activity' }
    ]
  }));
  card.appendChild(checkboxInput({
    label: 'Hallucinations observed',
    section: 'observations', field: 'hallucinations'
  }));
  card.appendChild(checkboxInput({
    label: 'Delusions observed',
    section: 'observations', field: 'delusions'
  }));
  card.appendChild(checkboxInput({
    label: 'Sleep–wake cycle disturbance observed',
    section: 'observations', field: 'sleepWakeDisturbance'
  }));
  card.appendChild(checkboxInput({
    label: 'Recent deliriogenic medication (anticholinergic, benzodiazepine, opioid)',
    section: 'observations', field: 'deliriogenicMedication'
  }));
  card.appendChild(textArea({
    label: 'Deliriogenic medication detail',
    section: 'observations', field: 'deliriogenicMedicationDetail',
    rows: 2,
    placeholder: 'Name the high-risk medication(s) recently started or increased.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Live CAM classification',
    id: 'live-classification-readout',
    render: () => renderLiveClassification()
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Result and disposition',
    description: 'Suspected precipitants, recommended actions, and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live CAM classification',
    id: 'live-classification-readout-2',
    render: () => renderLiveClassification()
  }));
  card.appendChild(textArea({
    label: 'Suspected precipitants (PINCH ME screen)',
    section: 'result', field: 'suspectedPrecipitants',
    placeholder: 'Pain, Infection, Nutrition, Constipation, Hydration, Medication, Environment.'
  }));
  card.appendChild(textArea({
    label: 'Recommended actions and disposition',
    section: 'result', field: 'recommendedActions', required: true,
    placeholder: 'Investigations, escalation, and management plan.'
  }));
  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'result', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, decisions, and any escalation already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the present/absent pill for a single feature. */
function renderFeatureReadout(section, field) {
  const value = state[section][field];
  const cls = value === 'present' ? 'risk-high' : value === 'absent' ? 'risk-low' : '';
  return `<span class="risk-badge ${cls}">${esc(featureStateLabel(value))}</span>`;
}

/** Render the live CAM classification badge and positive-feature set. */
function renderLiveClassification() {
  const grade = calculateCamGrade(state);
  const badge =
    `<span class="risk-badge ${classificationClass(grade.classification)}">${esc(classificationLabel(grade.classification))}</span>`;
  const positives = grade.positiveFeatures.length
    ? `<span class="muted">Positive features: ${grade.positiveFeatures.join(', ')}</span>`
    : `<span class="muted">No positive features recorded yet.</span>`;
  return `${badge} ${positives}`;
}

function refreshLiveReadouts() {
  const featureFields = [
    ['feature1', 'feature1', 'acuteOnsetFluctuating'],
    ['feature2', 'feature2', 'inattention'],
    ['feature3', 'feature3', 'disorganisedThinking'],
    ['feature4', 'feature4', 'alteredConsciousness']
  ];
  for (const [readoutKey, section, field] of featureFields) {
    const el = document.getElementById(`${readoutKey}-readout`);
    if (el) el.innerHTML = renderFeatureReadout(section, field);
  }
  const live1 = document.getElementById('live-classification-readout');
  if (live1) live1.innerHTML = renderLiveClassification();
  const live2 = document.getElementById('live-classification-readout-2');
  if (live2) live2.innerHTML = renderLiveClassification();
}

// ----------------------------------------------------------------------
// Conditional sections (RASS shown only for CAM-ICU)
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
  context: [['assessorName'], ['assessorRole'], ['camVariant']],
  identification: [['patientIdentifier'], ['ageBand'], ['sex']],
  feature1: [['acuteOnsetFluctuating']],
  feature2: [['inattention']],
  feature3: [['disorganisedThinking']],
  feature4: [['alteredConsciousness']],
  observations: [['motoricSubtype']],
  result: [['recommendedActions']]
};

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '' && v !== false;
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
    classification, deliriumPresent, positiveFeatures,
    feature1Positive, feature2Positive, feature3Positive, feature4Positive,
    motoricSubtype, flaggedIssues, timestamp
  } = lastResult;

  const featureRows = [
    [1, feature1Positive, state.feature1.acuteOnsetFluctuating],
    [2, feature2Positive, state.feature2.inattention],
    [3, feature3Positive, state.feature3.disorganisedThinking],
    [4, feature4Positive, state.feature4.alteredConsciousness]
  ].map(([n, positive, raw]) => {
    const status =
      positive === null ? 'Not assessed'
      : positive ? 'Positive'
      : 'Negative';
    const cls = positive ? 'flag-high' : '';
    return `
      <tr>
        <th scope="row">${esc(featureLabel(n))}</th>
        <td>${esc(featureStateLabel(raw))}</td>
        <td class="num"><span class="grade-pill ${cls}">${esc(status)}</span></td>
      </tr>
    `;
  }).join('');

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No red-flag issues raised.</p>`
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

  let interpretation;
  if (classification === 'unable-to-assess') {
    interpretation = `<p>This assessment is <strong>unable to be completed</strong>: the CAM-ICU patient is unrousable (RASS ${esc(state.feature4.rassScore)}). The diagnostic algorithm was not evaluated. Provide supportive care and re-assess when arousal improves.</p>`;
  } else if (deliriumPresent) {
    interpretation = `<p>The CAM algorithm <strong>1 AND 2 AND (3 OR 4)</strong> is satisfied (positive features ${esc(positiveFeatures.join(', '))}). <strong>Delirium is present.</strong> Delirium is a medical emergency with a reversible cause in most cases — begin the PINCH ME screen and search for the precipitant.</p>`;
  } else {
    interpretation = `<p>The CAM algorithm <strong>1 AND 2 AND (3 OR 4)</strong> is not satisfied${positiveFeatures.length ? ` (positive features ${esc(positiveFeatures.join(', '))})` : ''}. <strong>Delirium is absent</strong> on this screen. A single negative screen does not exclude delirium — re-screen at least once per shift in at-risk patients.</p>`;
  }

  const subtypeLine = motoricSubtype
    ? `<p class="muted">Motoric subtype: <strong>${esc(motoricSubtypeLabel(motoricSubtype))}</strong>.</p>`
    : '';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>CAM Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${classificationClass(classification)}">
        <div>
          <span class="risk-banner-label">Classification</span>
          <span class="risk-banner-value">${esc(classificationLabel(classification))}</span>
        </div>
        <span class="risk-badge ${classificationClass(classification)}">${esc(classificationLabel(classification))}</span>
      </div>
      ${subtypeLine}

      <h3>Features</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Feature</th>
            <th scope="col">Recorded</th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>${featureRows}</tbody>
      </table>

      <h3>Interpretation</h3>
      ${interpretation}

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
  const grade = calculateCamGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    classification: grade.classification,
    deliriumPresent: grade.deliriumPresent,
    positiveFeatures: grade.positiveFeatures,
    feature1Positive: grade.feature1Positive,
    feature2Positive: grade.feature2Positive,
    feature3Positive: grade.feature3Positive,
    feature4Positive: grade.feature4Positive,
    motoricSubtype: grade.motoricSubtype,
    firedRules: grade.firedRules,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh assessment?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveReadouts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Assessor' },
  { step: 2, section: 'identification', title: 'Patient' },
  { step: 3, section: 'feature1',       title: 'Feature 1' },
  { step: 4, section: 'feature2',       title: 'Feature 2' },
  { step: 5, section: 'feature3',       title: 'Feature 3' },
  { step: 6, section: 'feature4',       title: 'Feature 4' },
  { step: 7, section: 'observations',   title: 'Observations' },
  { step: 8, section: 'result',         title: 'Result' }
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
  refreshLiveReadouts();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
