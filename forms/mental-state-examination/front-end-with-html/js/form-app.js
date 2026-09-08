import { assess } from './grader.js';
import { emptyAssessment, priorityLabel, riskLevelClass, riskLevelLabel, statusClass, statusLabel } from './types.js';

// Mental State Examination (MSE) — single-page wizard (vanilla JavaScript,
// no build).
//
// Single continuous wizard: every step is rendered into the page in document
// order across the seven ASEPTIC domains plus context, identification, and
// summary. The clinician scrolls through them; a sticky top-of-page progress
// summary reflects how many fields have been answered, and a live readout
// updates the completeness status, completeness percent, and risk level as
// data is entered. Submission runs the pure completeness-and-risk engine
// (grader.js -> status, completenessPercent, domainStatuses, riskLevel,
// firedRules; flags.js -> safety flags) and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'mental-state-examination.front-end-with-html.v1';

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
  slug: 'mental-state-examination',
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
    refreshLiveSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 10;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a field on the state and persist. Re-runs progress and the live readout.
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  refreshLiveSummary();
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
    setField(opts.section, opts.field, input.value);
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
// Option vocabularies (mirror the SQL CHECK constraints)
// ----------------------------------------------------------------------

const OPTIONS = {
  clinicianRole: [
    { value: 'psychiatrist', label: 'Psychiatrist' },
    { value: 'mental-health-nurse', label: 'Mental-health nurse' },
    { value: 'gp', label: 'General practitioner' },
    { value: 'liaison', label: 'Liaison-psychiatry clinician' },
    { value: 'other', label: 'Other' }
  ],
  careSetting: [
    { value: 'outpatient', label: 'Outpatient clinic' },
    { value: 'inpatient', label: 'Inpatient ward' },
    { value: 'liaison', label: 'Liaison psychiatry' },
    { value: 'crisis', label: 'Crisis / home treatment' },
    { value: 'primary-care', label: 'Primary care' },
    { value: 'other', label: 'Other' }
  ],
  ageBand: [
    { value: 'under-18', label: 'Under 18' },
    { value: '18-25', label: '18-25' },
    { value: '26-39', label: '26-39' },
    { value: '40-64', label: '40-64' },
    { value: '65-plus', label: '65 and over' }
  ],
  sex: [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'intersex', label: 'Intersex' },
    { value: 'unknown', label: 'Unknown' }
  ],
  appearanceGrooming: [
    { value: 'well-kempt', label: 'Well-kempt' },
    { value: 'dishevelled', label: 'Dishevelled' },
    { value: 'other', label: 'Other' }
  ],
  appearanceEyeContact: [
    { value: 'normal', label: 'Normal' },
    { value: 'reduced', label: 'Reduced' },
    { value: 'intense', label: 'Intense' },
    { value: 'avoidant', label: 'Avoidant' }
  ],
  appearanceRapport: [
    { value: 'good', label: 'Good' },
    { value: 'guarded', label: 'Guarded' },
    { value: 'hostile', label: 'Hostile' },
    { value: 'withdrawn', label: 'Withdrawn' }
  ],
  appearancePsychomotor: [
    { value: 'normal', label: 'Normal' },
    { value: 'agitation', label: 'Agitation' },
    { value: 'retardation', label: 'Retardation' }
  ],
  speechRate: [
    { value: 'normal', label: 'Normal' },
    { value: 'slow', label: 'Slow' },
    { value: 'rapid', label: 'Rapid' },
    { value: 'pressured', label: 'Pressured' }
  ],
  speechVolume: [
    { value: 'normal', label: 'Normal' },
    { value: 'quiet', label: 'Quiet' },
    { value: 'loud', label: 'Loud' }
  ],
  speechQuantity: [
    { value: 'normal', label: 'Normal' },
    { value: 'poverty', label: 'Poverty of speech' },
    { value: 'excessive', label: 'Excessive' }
  ],
  speechFluency: [
    { value: 'fluent', label: 'Fluent' },
    { value: 'hesitant', label: 'Hesitant' },
    { value: 'dysarthric', label: 'Dysarthric' },
    { value: 'mute', label: 'Mute' }
  ],
  moodDescriptor: [
    { value: 'euthymic', label: 'Euthymic' },
    { value: 'low', label: 'Low / depressed' },
    { value: 'elevated', label: 'Elevated' },
    { value: 'anxious', label: 'Anxious' },
    { value: 'irritable', label: 'Irritable' },
    { value: 'other', label: 'Other' }
  ],
  affectRange: [
    { value: 'full', label: 'Full' },
    { value: 'restricted', label: 'Restricted' },
    { value: 'blunted', label: 'Blunted' },
    { value: 'flat', label: 'Flat' }
  ],
  affectCongruence: [
    { value: 'congruent', label: 'Congruent' },
    { value: 'incongruent', label: 'Incongruent' }
  ],
  affectReactivity: [
    { value: 'reactive', label: 'Reactive' },
    { value: 'non-reactive', label: 'Non-reactive' }
  ],
  hallucinationsPresent: [
    { value: 'none', label: 'None' },
    { value: 'auditory', label: 'Auditory' },
    { value: 'visual', label: 'Visual' },
    { value: 'olfactory', label: 'Olfactory' },
    { value: 'gustatory', label: 'Gustatory' },
    { value: 'tactile', label: 'Tactile' },
    { value: 'multiple', label: 'Multiple modalities' }
  ],
  commandHallucinations: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'not-applicable', label: 'Not applicable' }
  ],
  presentAbsent: [
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' }
  ],
  thoughtForm: [
    { value: 'linear', label: 'Linear' },
    { value: 'circumstantial', label: 'Circumstantial' },
    { value: 'tangential', label: 'Tangential' },
    { value: 'flight-of-ideas', label: 'Flight of ideas' },
    { value: 'thought-block', label: 'Thought block' },
    { value: 'loosening', label: 'Loosening of associations' }
  ],
  delusions: [
    { value: 'none', label: 'None' },
    { value: 'persecutory', label: 'Persecutory' },
    { value: 'grandiose', label: 'Grandiose' },
    { value: 'reference', label: 'Reference' },
    { value: 'nihilistic', label: 'Nihilistic' },
    { value: 'other', label: 'Other' }
  ],
  suicidalIdeation: [
    { value: 'none', label: 'None' },
    { value: 'passive', label: 'Passive' },
    { value: 'active-no-plan', label: 'Active — no plan' },
    { value: 'active-with-plan', label: 'Active — with plan' }
  ],
  homicidalIdeation: [
    { value: 'none', label: 'None' },
    { value: 'thoughts', label: 'Thoughts of harming others' },
    { value: 'intent', label: 'Intent to harm others' }
  ],
  selfHarmThoughts: [
    { value: 'none', label: 'None' },
    { value: 'thoughts', label: 'Thoughts of self-harm' },
    { value: 'recent-acts', label: 'Recent acts of self-harm' }
  ],
  insightLevel: [
    { value: 'full', label: 'Full' },
    { value: 'partial', label: 'Partial' },
    { value: 'none', label: 'None' }
  ],
  treatmentUnderstanding: [
    { value: 'accepts', label: 'Accepts treatment' },
    { value: 'ambivalent', label: 'Ambivalent' },
    { value: 'refuses', label: 'Refuses treatment' }
  ],
  judgement: [
    { value: 'intact', label: 'Intact' },
    { value: 'impaired', label: 'Impaired' }
  ],
  orientation: [
    { value: 'orientated', label: 'Orientated' },
    { value: 'disorientated-time', label: 'Disorientated to time' },
    { value: 'disorientated-place', label: 'Disorientated to place' },
    { value: 'disorientated-person', label: 'Disorientated to person' },
    { value: 'global', label: 'Global disorientation' }
  ],
  attention: [
    { value: 'normal', label: 'Normal' },
    { value: 'impaired', label: 'Impaired' }
  ],
  memory: [
    { value: 'intact', label: 'Intact' },
    { value: 'short-term-impaired', label: 'Short-term impaired' },
    { value: 'long-term-impaired', label: 'Long-term impaired' },
    { value: 'global-impairment', label: 'Global impairment' }
  ],
  cognitiveImpression: [
    { value: 'no-concern', label: 'No concern' },
    { value: 'mild-concern', label: 'Mild concern' },
    { value: 'significant-concern', label: 'Significant concern' }
  ]
};

// ----------------------------------------------------------------------
// Section renderers (1 per wizard step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, where, and why.'
  });
  card.appendChild(textInput({
    label: 'Assessing clinician name', section: 'context',
    field: 'clinicianName', required: true, placeholder: 'e.g. Dr A. Rahman'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role', section: 'context', field: 'clinicianRole',
    required: true, options: OPTIONS.clinicianRole
  }));
  card.appendChild(textInput({
    label: 'Date and time of assessment', section: 'context',
    field: 'assessedAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Care setting', section: 'context', field: 'careSetting',
    required: true, options: OPTIONS.careSetting
  }));
  card.appendChild(textInput({
    label: 'Reason for assessment / referral', section: 'context',
    field: 'assessmentReason',
    placeholder: 'e.g. First presentation with low mood and suicidal thoughts'
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age band, and sex.'
  });
  card.appendChild(textInput({
    label: 'Patient identifier', section: 'identification',
    field: 'patientIdentifier', required: true,
    placeholder: 'e.g. MH-204815 or hospital MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band', section: 'identification', field: 'ageBand',
    required: true, options: OPTIONS.ageBand
  }));
  card.appendChild(selectInput({
    label: 'Sex', section: 'identification', field: 'sex',
    required: true, options: OPTIONS.sex
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Appearance and behaviour',
    description: 'ASEPTIC domain A — grooming, engagement, and psychomotor activity.'
  });
  card.appendChild(selectInput({ label: 'Grooming and dress', section: 'appearance', field: 'appearanceGrooming', options: OPTIONS.appearanceGrooming }));
  card.appendChild(selectInput({ label: 'Eye contact', section: 'appearance', field: 'appearanceEyeContact', options: OPTIONS.appearanceEyeContact }));
  card.appendChild(selectInput({ label: 'Rapport', section: 'appearance', field: 'appearanceRapport', options: OPTIONS.appearanceRapport }));
  card.appendChild(selectInput({
    label: 'Psychomotor activity', section: 'appearance', field: 'appearancePsychomotor',
    options: OPTIONS.appearancePsychomotor,
    hint: 'Agitation raises a behavioural-risk flag.'
  }));
  card.appendChild(textInput({ label: 'Abnormal movements', section: 'appearance', field: 'appearanceAbnormalMovements', placeholder: 'e.g. resting tremor, orofacial dyskinesia' }));
  card.appendChild(textArea({ label: 'Notes', section: 'appearance', field: 'appearanceNotes', placeholder: 'Free-text notes on appearance and behaviour.' }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Speech',
    description: 'ASEPTIC domain S — rate, volume, quantity, and fluency.'
  });
  card.appendChild(selectInput({ label: 'Rate', section: 'speech', field: 'speechRate', options: OPTIONS.speechRate }));
  card.appendChild(selectInput({ label: 'Volume', section: 'speech', field: 'speechVolume', options: OPTIONS.speechVolume }));
  card.appendChild(selectInput({ label: 'Quantity', section: 'speech', field: 'speechQuantity', options: OPTIONS.speechQuantity }));
  card.appendChild(selectInput({ label: 'Fluency', section: 'speech', field: 'speechFluency', options: OPTIONS.speechFluency }));
  card.appendChild(textArea({ label: 'Notes', section: 'speech', field: 'speechNotes', placeholder: 'Free-text notes on speech.' }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Emotion (mood and affect)',
    description: 'ASEPTIC domain E — subjective mood and observed affect.'
  });
  card.appendChild(textInput({ label: 'Subjective mood (patient’s own words)', section: 'emotion', field: 'moodSubjective', placeholder: 'e.g. "empty and hopeless"' }));
  card.appendChild(selectInput({
    label: 'Objective mood descriptor', section: 'emotion', field: 'moodDescriptor',
    options: OPTIONS.moodDescriptor,
    hint: 'Low mood without an ideation flag raises a low-priority flag.'
  }));
  card.appendChild(selectInput({ label: 'Affect range', section: 'emotion', field: 'affectRange', options: OPTIONS.affectRange }));
  card.appendChild(selectInput({ label: 'Affect congruence', section: 'emotion', field: 'affectCongruence', options: OPTIONS.affectCongruence }));
  card.appendChild(selectInput({ label: 'Affect reactivity', section: 'emotion', field: 'affectReactivity', options: OPTIONS.affectReactivity }));
  card.appendChild(textArea({ label: 'Notes', section: 'emotion', field: 'emotionNotes', placeholder: 'Free-text notes on mood and affect.' }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Perception',
    description: 'ASEPTIC domain P — hallucinations, illusions, and dissociative phenomena.'
  });
  card.appendChild(selectInput({ label: 'Hallucinations present', section: 'perception', field: 'hallucinationsPresent', options: OPTIONS.hallucinationsPresent }));
  card.appendChild(selectInput({
    label: 'Command hallucinations', section: 'perception', field: 'commandHallucinations',
    options: OPTIONS.commandHallucinations,
    hint: 'Yes raises a high-priority command-hallucinations flag.'
  }));
  card.appendChild(selectInput({ label: 'Illusions', section: 'perception', field: 'illusions', options: OPTIONS.presentAbsent }));
  card.appendChild(selectInput({ label: 'Depersonalisation', section: 'perception', field: 'depersonalisation', options: OPTIONS.presentAbsent }));
  card.appendChild(selectInput({ label: 'Derealisation', section: 'perception', field: 'derealisation', options: OPTIONS.presentAbsent }));
  card.appendChild(textArea({ label: 'Notes', section: 'perception', field: 'perceptionNotes', placeholder: 'Free-text notes on perception.' }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Thought (form and content)',
    description: 'ASEPTIC domain T — thought form, delusions, and risk-critical ideation.'
  });
  card.appendChild(selectInput({ label: 'Thought form', section: 'thought', field: 'thoughtForm', options: OPTIONS.thoughtForm }));
  card.appendChild(selectInput({
    label: 'Delusional content', section: 'thought', field: 'delusions',
    options: OPTIONS.delusions,
    hint: 'Any value other than none raises a delusional-content flag.'
  }));
  card.appendChild(selectInput({ label: 'Obsessions', section: 'thought', field: 'obsessions', options: OPTIONS.presentAbsent }));
  card.appendChild(selectInput({
    label: 'Suicidal ideation', section: 'thought', field: 'suicidalIdeation',
    options: OPTIONS.suicidalIdeation,
    hint: 'Active ideation raises a high-priority flag; passive raises a moderate flag.'
  }));
  card.appendChild(selectInput({
    label: 'Homicidal ideation', section: 'thought', field: 'homicidalIdeation',
    options: OPTIONS.homicidalIdeation,
    hint: 'Thoughts or intent raise a high-priority flag.'
  }));
  card.appendChild(selectInput({
    label: 'Self-harm', section: 'thought', field: 'selfHarmThoughts',
    options: OPTIONS.selfHarmThoughts,
    hint: 'Recent acts raise a high-priority flag; thoughts raise a moderate flag.'
  }));
  card.appendChild(textArea({ label: 'Notes', section: 'thought', field: 'thoughtNotes', placeholder: 'Free-text notes on thought form and content.' }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Insight and judgement',
    description: 'ASEPTIC domain I — insight into illness, treatment attitude, and judgement.'
  });
  card.appendChild(selectInput({
    label: 'Insight into illness', section: 'insight', field: 'insightLevel',
    options: OPTIONS.insightLevel,
    hint: 'No insight alongside another risk flag raises a lack-of-insight flag.'
  }));
  card.appendChild(selectInput({ label: 'Understanding of treatment', section: 'insight', field: 'treatmentUnderstanding', options: OPTIONS.treatmentUnderstanding }));
  card.appendChild(selectInput({ label: 'Judgement', section: 'insight', field: 'judgement', options: OPTIONS.judgement }));
  card.appendChild(textArea({ label: 'Notes', section: 'insight', field: 'insightNotes', placeholder: 'Free-text notes on insight and judgement.' }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Cognition',
    description: 'ASEPTIC domain C — orientation, attention, memory, and gross impression.'
  });
  card.appendChild(selectInput({
    label: 'Orientation', section: 'cognition', field: 'orientation',
    options: OPTIONS.orientation,
    hint: 'Global disorientation raises a cognitive-impairment flag.'
  }));
  card.appendChild(selectInput({ label: 'Attention and concentration', section: 'cognition', field: 'attention', options: OPTIONS.attention }));
  card.appendChild(selectInput({ label: 'Memory', section: 'cognition', field: 'memory', options: OPTIONS.memory }));
  card.appendChild(selectInput({
    label: 'Gross cognitive impression', section: 'cognition', field: 'cognitiveImpression',
    options: OPTIONS.cognitiveImpression,
    hint: 'Significant concern raises a cognitive-impairment flag.'
  }));
  card.appendChild(textArea({ label: 'Notes', section: 'cognition', field: 'cognitionNotes', placeholder: 'Free-text notes on cognition.' }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Summary and formulation',
    description: 'Live completeness and risk, plus a free-text clinical formulation.'
  });
  card.appendChild(readOnlyReadout({
    label: 'Live completeness and risk',
    id: 'live-summary-readout',
    render: () => renderLiveSummary()
  }));
  card.appendChild(textArea({
    label: 'Clinical formulation', section: 'summary', field: 'clinicalFormulation',
    rows: 5,
    placeholder: 'Free-text formulation drawing the domains together, with the risk summary and plan.'
  }));
  return card;
}

// ----------------------------------------------------------------------
// Live readout
// ----------------------------------------------------------------------

/** Render the live completeness / risk summary. */
function renderLiveSummary() {
  const g = assess(state);
  const statusBadge =
    `<span class="risk-badge ${statusClass(g.status)}">${esc(statusLabel(g.status))}</span>`;
  const riskBadge =
    `<span class="risk-badge ${riskLevelClass(g.riskLevel)}">Risk: ${esc(riskLevelLabel(g.riskLevel))}</span>`;
  const pctCls = g.completenessPercent === 100 ? 'ok' : 'warn';
  const documented = g.domainStatuses.filter((d) => d.documented).length;
  return (
    `<div class="readout-line">Status ${statusBadge} &nbsp; ` +
    `<strong class="${pctCls}">${g.completenessPercent}%</strong> complete ` +
    `<span class="muted">(${documented} of 7 domains)</span></div>` +
    `<div class="readout-line">${riskBadge} &nbsp; ` +
    `<span class="muted">${g.flags.length} safety flag${g.flags.length === 1 ? '' : 's'}</span></div>`
  );
}

function refreshLiveSummary() {
  const live = document.getElementById('live-summary-readout');
  if (live) live.innerHTML = renderLiveSummary();
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered. Each of the
// seven domain steps is a single slot — answered once the domain is documented,
// mirroring the grader's domain-documentation rule.
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['careSetting']],
  identification: [['patientIdentifier'], ['ageBand'], ['sex']],
  appearance: [['appearanceGrooming', 'appearanceEyeContact', 'appearanceRapport', 'appearancePsychomotor', 'appearanceAbnormalMovements', 'appearanceNotes']],
  speech: [['speechRate', 'speechVolume', 'speechQuantity', 'speechFluency', 'speechNotes']],
  emotion: [['moodSubjective', 'moodDescriptor', 'affectRange', 'affectCongruence', 'affectReactivity', 'emotionNotes']],
  perception: [['hallucinationsPresent', 'commandHallucinations', 'illusions', 'depersonalisation', 'derealisation', 'perceptionNotes']],
  thought: [['thoughtForm', 'delusions', 'obsessions', 'suicidalIdeation', 'homicidalIdeation', 'selfHarmThoughts', 'thoughtNotes']],
  insight: [['insightLevel', 'treatmentUnderstanding', 'judgement', 'insightNotes']],
  cognition: [['orientation', 'attention', 'memory', 'cognitiveImpression', 'cognitionNotes']],
  summary: [['clinicalFormulation']]
};

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && String(v).trim() !== '';
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
    case 'moderate': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    status, riskLevel, completenessPercent, domainStatuses, flags, timestamp
  } = lastResult;

  const documented = domainStatuses.filter((d) => d.documented).length;

  const domainRows = domainStatuses.map((d) => `
    <tr>
      <th scope="row">${esc(d.label)}</th>
      <td>
        <span class="flag-badge ${d.documented ? 'flag-no' : 'flag-yes'}">
          ${d.documented ? 'Documented' : 'Outstanding'}
        </span>
      </td>
    </tr>
  `).join('');

  const flagsList = flags.length === 0
    ? `<p class="muted">No safety flags raised.</p>`
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

  const riskAdvice =
    riskLevel === 'high'
      ? `<p>This examination raised a <strong>high-priority safety flag</strong>. Complete a full risk assessment now and escalate per local safety policy. The risk indicator is a documentation prompt, not a risk-management decision.</p>`
      : riskLevel === 'moderate'
      ? `<p>This examination raised a <strong>moderate-priority safety flag</strong>. Document a safety plan and arrange appropriate review and follow-up.</p>`
      : riskLevel === 'low'
      ? `<p>Only low-priority findings were flagged. Continue routine monitoring and complete any outstanding domains.</p>`
      : `<p>No safety flags were raised. Continue routine care and clinical judgement.</p>`;

  const completenessAdvice =
    status === 'complete'
      ? `<p>All seven ASEPTIC domains are documented.</p>`
      : `<p><strong>${7 - documented}</strong> domain(s) remain undocumented — complete them for a whole mental state record.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Mental State Examination Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${statusClass(status)}">
        <div>
          <span class="risk-banner-label">Completeness status</span>
          <span class="risk-banner-value">${esc(statusLabel(status))}</span>
        </div>
        <span class="risk-badge ${statusClass(status)}">${completenessPercent}% complete</span>
      </div>

      <div class="risk-banner ${riskLevelClass(riskLevel)}">
        <div>
          <span class="risk-banner-label">Risk indicator</span>
          <span class="risk-banner-value">${esc(riskLevelLabel(riskLevel))}</span>
        </div>
        <span class="risk-badge ${riskLevelClass(riskLevel)}">${flags.length} flag${flags.length === 1 ? '' : 's'}</span>
      </div>

      <h3>Completeness</h3>
      ${completenessAdvice}
      <table class="subscales">
        <thead>
          <tr><th scope="col">ASEPTIC domain</th><th scope="col">Status</th></tr>
        </thead>
        <tbody>${domainRows}</tbody>
      </table>

      <h3>Risk indicator</h3>
      ${riskAdvice}

      <h3>Safety flags (${flags.length})</h3>
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
  if (!confirm('Clear all answers and start a fresh examination?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  refreshLiveSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'context',        title: 'Context' },
  { step: 2,  section: 'identification', title: 'Patient' },
  { step: 3,  section: 'appearance',     title: 'Appearance' },
  { step: 4,  section: 'speech',         title: 'Speech' },
  { step: 5,  section: 'emotion',        title: 'Emotion' },
  { step: 6,  section: 'perception',     title: 'Perception' },
  { step: 7,  section: 'thought',        title: 'Thought' },
  { step: 8,  section: 'insight',        title: 'Insight' },
  { step: 9,  section: 'cognition',      title: 'Cognition' },
  { step: 10, section: 'summary',        title: 'Summary' }
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
  const required = form.querySelectorAll(
    'input[data-required], select[data-required], textarea[data-required]'
  );
  const seen = new Set();
  required.forEach((input) => {
    const id = input.id;
    if (seen.has(id)) return;
    seen.add(id);
    const value = (input.value || '').trim();
    if (!value) {
      const labelEl = form.querySelector(`label[for="${id}"]`);
      const labelText = labelEl
        ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim()
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
  refreshLiveSummary();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
