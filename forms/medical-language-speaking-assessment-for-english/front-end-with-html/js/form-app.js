import { detectAdditionalFlags } from './flagged-issues.js';
import { gradeOET } from './oet-grader.js';
import { clinicalCriteria, criterionRegistry, linguisticCriteria } from './rules.js';
import { CRITERIA, emptyAssessment, gradeClass, gradeLabel } from './types.js';

// Medical Language Speaking Assessment for English — examiner wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The examiner scrolls through them; a sticky top-of-page
// progress summary and a step-list table-of-contents reflect how many
// fields have been answered. Submission runs the pure OET scoring engine
// and renders an inline report with grade badge, scaled-score breakdown,
// per-criterion table, and flagged-issues list. State is persisted to
// localStorage so a partial fill survives a page reload.

const TOTAL_STEPS = 5;

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'medical-language-speaking-assessment-for-english.front-end-form-with-html.v1';

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

/** @type {import('./types.js').AssessmentReport | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'medical-language-speaking-assessment-for-english',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
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
// Component builders (Lily class contracts)
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

/**
 * Build a labelled text input.
 * @param {{ label: string, section: string, field: string, type?: string,
 *           placeholder?: string, required?: boolean, min?: number,
 *           max?: number, step?: number }} opts
 */
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
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error"></span>
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

/**
 * Build a labelled multi-line text area.
 * @param {{ label: string, section: string, field: string, rows?: number,
 *           placeholder?: string, hint?: string }} opts
 */
function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    ${opts.hint ? `<p class="hint">${esc(opts.hint)}</p>` : ''}
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
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

/**
 * Build a select / dropdown input.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[] }} opts
 */
function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error">
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

/**
 * Build a radio group.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[] }} opts
 */
function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}>
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

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = `${groupId}-error`;
  wrapper.appendChild(errSpan);
  return wrapper;
}

/**
 * Compact 0..N rating-chip group used for criterion ratings. Built as a
 * Lily-compatible radio-group internally — chip styling is layered on top
 * via the `.rating-chips` modifier class.
 *
 * @param {{ section: string, field: string,
 *           anchors: { value: number, label: string, description: string }[],
 *           groupName: string, ariaLabel: string }} opts
 */
function ratingChips(opts) {
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('div');
  wrapper.className = 'radio-group rating-chips';
  wrapper.setAttribute('role', 'radiogroup');
  wrapper.setAttribute('aria-label', opts.ariaLabel);

  for (const a of opts.anchors) {
    const radioId = `${opts.groupName}-${a.value}`;
    const isChecked = current === a.value;
    const label = document.createElement('label');
    label.className = 'rating-chip';
    label.htmlFor = radioId;
    label.title = `${a.label} — ${a.description}`;
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${opts.groupName}" value="${a.value}"${isChecked ? ' checked' : ''}>
      <span class="chip-value">${a.value}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) setField(opts.section, opts.field, a.value);
    });
    wrapper.appendChild(label);
  }
  return wrapper;
}

/**
 * Build a section card as a Lily `<fieldset class="fieldset">` with a
 * `<legend class="fieldset-legend">`.
 * @param {{ stepNumber: number, title: string, description?: string }} opts
 */
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

// ----------------------------------------------------------------------
// Step renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Candidate Details',
    description: 'Identifying details for the candidate, examiner, and test occasion.'
  });

  const ids = document.createElement('div');
  ids.className = 'two-col';
  ids.appendChild(textInput({
    label: 'Candidate ID', section: 'candidate', field: 'candidateId',
    placeholder: 'e.g. OET-2026-00123', required: true
  }));
  ids.appendChild(textInput({
    label: 'Candidate name', section: 'candidate', field: 'candidateName', required: true
  }));
  card.appendChild(ids);

  const examiner = document.createElement('div');
  examiner.className = 'two-col';
  examiner.appendChild(textInput({
    label: 'Examiner name', section: 'candidate', field: 'examinerName', required: true
  }));
  examiner.appendChild(textInput({
    label: 'Test centre', section: 'candidate', field: 'testCentre',
    placeholder: 'e.g. London Test Centre'
  }));
  card.appendChild(examiner);

  card.appendChild(textInput({
    label: 'Test date', section: 'candidate', field: 'testDate',
    type: 'date', required: true
  }));

  const profile = document.createElement('div');
  profile.className = 'two-col';
  profile.appendChild(textInput({
    label: 'Candidate first language', section: 'candidate', field: 'firstLanguage',
    placeholder: 'e.g. Arabic, Tagalog, Hindi'
  }));
  profile.appendChild(textInput({
    label: 'Country where the candidate trained', section: 'candidate',
    field: 'countryOfTraining',
    placeholder: 'e.g. India, Egypt, Philippines'
  }));
  card.appendChild(profile);

  card.appendChild(selectInput({
    label: 'Years of clinical experience',
    section: 'candidate', field: 'yearsOfExperience',
    options: [
      { value: '0-2',  label: '0 - 2 years' },
      { value: '3-5',  label: '3 - 5 years' },
      { value: '6-10', label: '6 - 10 years' },
      { value: '11+',  label: '11 or more years' }
    ]
  }));

  return card;
}

function renderRolePlayContext(stepNumber, sectionKey, title, description, defaultExample) {
  const card = sectionCard({
    stepNumber,
    title,
    description
  });

  card.appendChild(textInput({
    label: 'Scenario title', section: sectionKey, field: 'scenarioTitle',
    placeholder: defaultExample.title, required: true
  }));

  card.appendChild(textArea({
    label: 'Scenario summary', section: sectionKey, field: 'scenarioSummary',
    placeholder: defaultExample.summary,
    rows: 3
  }));

  const setting = document.createElement('div');
  setting.className = 'two-col';
  setting.appendChild(textInput({
    label: 'Patient (interlocutor) role', section: sectionKey, field: 'patientRole',
    placeholder: defaultExample.patientRole
  }));
  setting.appendChild(textInput({
    label: 'Clinical setting', section: sectionKey, field: 'setting',
    placeholder: defaultExample.setting
  }));
  card.appendChild(setting);

  card.appendChild(radioGroup({
    label: 'Safety-criticality of the scenario',
    section: sectionKey, field: 'safetyCriticality',
    options: [
      { value: 'low',      label: 'Low — routine, non-urgent' },
      { value: 'standard', label: 'Standard — typical clinical encounter' },
      { value: 'high',     label: 'High — urgent, high-stakes, or breaking bad news' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Examiner notes for this role-play',
    section: sectionKey, field: 'examinerNotes',
    placeholder: 'Observations during the role-play (rapport, structure, language lapses, recovery from breakdowns…)',
    rows: 4
  }));

  return card;
}

function renderStep2() {
  return renderRolePlayContext(
    2,
    'rolePlay1',
    'Role-play 1 — Patient Interview',
    'A patient-interview style scenario: history-taking, eliciting concerns, building rapport.',
    {
      title: 'e.g. Suspected angina in a 62-year-old man',
      summary: 'A patient presents with central chest pain on exertion; take a history and explore concerns.',
      patientRole: 'e.g. Patient with chest pain',
      setting: 'e.g. GP clinic'
    }
  );
}

function renderStep3() {
  return renderRolePlayContext(
    3,
    'rolePlay2',
    'Role-play 2 — Clinical Explanation',
    'A clinical-explanation style scenario: explaining a diagnosis, treatment, or procedure to the patient or relative.',
    {
      title: 'e.g. Explaining a new diagnosis of type 2 diabetes',
      summary: 'A patient has just been told they have type 2 diabetes; explain the condition, lifestyle changes, and follow-up.',
      patientRole: 'e.g. Newly-diagnosed patient',
      setting: 'e.g. Outpatient clinic'
    }
  );
}

/**
 * Render a single linguistic-criterion block with two role-play scales.
 */
function linguisticCriterionBlock(criterion) {
  const block = document.createElement('div');
  block.className = 'criterion-block';
  block.innerHTML = `
    <div class="criterion-header">
      <span class="criterion-id">${esc(criterion.id)}</span>
      <h3 class="criterion-title">${esc(criterion.label)}</h3>
    </div>
    <p class="criterion-description">${esc(criterion.description)}</p>
  `;

  // Role-play 1
  const rp1Heading = document.createElement('p');
  rp1Heading.className = 'rp-heading';
  rp1Heading.textContent = 'Role-play 1';
  block.appendChild(rp1Heading);
  block.appendChild(ratingChips({
    section: 'linguisticRolePlay1',
    field: criterion.dataField,
    anchors: criterion.anchors,
    groupName: `linguisticRolePlay1-${criterion.dataField}`,
    ariaLabel: `${criterion.label} (role-play 1) — rate 0 to 6`
  }));

  // Role-play 2
  const rp2Heading = document.createElement('p');
  rp2Heading.className = 'rp-heading';
  rp2Heading.textContent = 'Role-play 2';
  block.appendChild(rp2Heading);
  block.appendChild(ratingChips({
    section: 'linguisticRolePlay2',
    field: criterion.dataField,
    anchors: criterion.anchors,
    groupName: `linguisticRolePlay2-${criterion.dataField}`,
    ariaLabel: `${criterion.label} (role-play 2) — rate 0 to 6`
  }));

  return block;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Linguistic Criteria Rating',
    description: 'Rate each linguistic criterion on a 0-6 scale, separately for role-play 1 and role-play 2. Hover any chip for an anchor description.'
  });

  const intro = document.createElement('p');
  intro.className = 'hint';
  intro.textContent =
    '0 = below the lowest descriptor; 6 = approaches expert speaker. The mean of the two role-plays is used in the overall score.';
  card.appendChild(intro);

  for (const c of linguisticCriteria()) {
    card.appendChild(linguisticCriterionBlock(c));
  }

  return card;
}

/**
 * Render a single clinical-indicator block with one 0-3 scale.
 */
function clinicalIndicatorBlock(criterion) {
  const block = document.createElement('div');
  block.className = 'criterion-block';
  block.innerHTML = `
    <div class="criterion-header">
      <span class="criterion-id">${esc(criterion.id)}</span>
      <h3 class="criterion-title">${esc(criterion.label)}</h3>
    </div>
    <p class="criterion-description">${esc(criterion.description)}</p>
  `;

  block.appendChild(ratingChips({
    section: 'clinicalIndicators',
    field: criterion.dataField,
    anchors: criterion.anchors,
    groupName: `clinicalIndicators-${criterion.dataField}`,
    ariaLabel: `${criterion.label} — rate 0 to 3`
  }));

  return block;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Clinical Communication Indicators & Overall Grade',
    description: 'Rate each clinical communication indicator on a 0-3 scale across the whole sub-test. The overall grade is then computed automatically.'
  });

  const intro = document.createElement('p');
  intro.className = 'hint';
  intro.textContent =
    '0 = not demonstrated; 1 = partial; 2 = satisfactory; 3 = high standard. Hover any chip for the anchor description.';
  card.appendChild(intro);

  for (const c of clinicalCriteria()) {
    card.appendChild(clinicalIndicatorBlock(c));
  }

  card.appendChild(textArea({
    label: 'Overall examiner notes',
    section: 'clinicalIndicators', field: 'examinerNotes',
    placeholder: 'Holistic comments on clinical communication, recurring themes, recommendations for development…',
    rows: 4
  }));

  return card;
}

// ----------------------------------------------------------------------
// Progress + step list
// ----------------------------------------------------------------------

/**
 * The five-step table-of-contents shown above the form. Each entry maps to
 * the section keys used in `TRACKED_FIELDS` so per-step completion status
 * can be computed by aggregating answered fields per section.
 *
 * The linguistic-criteria step rolls two `linguisticRolePlay*` sections
 * into a single visual step; the clinical-indicators step aggregates the
 * single `clinicalIndicators` section.
 */
const STEP_DEFINITIONS = [
  { step: 1, sections: ['candidate'],                                      title: 'Candidate' },
  { step: 2, sections: ['rolePlay1'],                                      title: 'Role-play 1' },
  { step: 3, sections: ['rolePlay2'],                                      title: 'Role-play 2' },
  { step: 4, sections: ['linguisticRolePlay1', 'linguisticRolePlay2'],     title: 'Linguistic' },
  { step: 5, sections: ['clinicalIndicators'],                             title: 'Clinical + Grade' }
];

/**
 * Build the list of tracked fields for progress accounting. Includes
 * candidate identifiers, role-play context, every linguistic rating
 * (4 criteria × 2 role-plays), and every clinical indicator (5).
 */
function buildTrackedFields() {
  /** @type {[string, string][]} */
  const fields = [
    ['candidate', 'candidateId'],
    ['candidate', 'candidateName'],
    ['candidate', 'examinerName'],
    ['candidate', 'testCentre'],
    ['candidate', 'testDate'],
    ['candidate', 'firstLanguage'],
    ['candidate', 'countryOfTraining'],
    ['candidate', 'yearsOfExperience'],
    ['rolePlay1', 'scenarioTitle'],
    ['rolePlay1', 'scenarioSummary'],
    ['rolePlay1', 'patientRole'],
    ['rolePlay1', 'setting'],
    ['rolePlay1', 'safetyCriticality'],
    ['rolePlay2', 'scenarioTitle'],
    ['rolePlay2', 'scenarioSummary'],
    ['rolePlay2', 'patientRole'],
    ['rolePlay2', 'setting'],
    ['rolePlay2', 'safetyCriticality']
  ];
  for (const c of CRITERIA) {
    if (c.domain === 'linguistic') {
      fields.push(['linguisticRolePlay1', c.dataField]);
      fields.push(['linguisticRolePlay2', c.dataField]);
    } else {
      fields.push(['clinicalIndicators', c.dataField]);
    }
  }
  return fields;
}

const TRACKED_FIELDS = buildTrackedFields();

function isAnswered(v) {
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    if (isAnswered(state[section]?.[field])) {
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
    let a = 0;
    let t = 0;
    for (const s of def.sections) {
      a += sectionAnswered[s] || 0;
      t += sectionTotal[s] || 0;
    }
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
// Validation + error summary
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
    case 'high':   return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low':    return 'flag-low';
    default:       return '';
  }
}

function fmtScore(v) {
  if (v === null || v === undefined) return '—';
  return String(v);
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { grading, additionalFlags, timestamp } = lastResult;
  const {
    linguisticTotal, clinicalTotal, rawTotal, scaledScore, grade,
    perCriterionScores, firedRules
  } = grading;

  const flagsList = additionalFlags.length === 0
    ? `<p class="muted">No additional flags raised.</p>`
    : `
      <ul class="flags">
        ${additionalFlags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.message)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  // Build the per-criterion rows: linguistic block first, then clinical.
  const ling = perCriterionScores.filter((s) => s.domain === 'linguistic');
  const clin = perCriterionScores.filter((s) => s.domain === 'clinical');

  const lingRows = ling.map((s) => `
    <tr>
      <th scope="row">${esc(s.id)}</th>
      <td>${esc(s.label)}</td>
      <td class="num">${fmtScore(s.rolePlay1Score)} / 6</td>
      <td class="num">${fmtScore(s.rolePlay2Score)} / 6</td>
      <td class="num">${fmtScore(s.meanScore)} / 6</td>
    </tr>
  `).join('');

  const clinRows = clin.map((s) => `
    <tr>
      <th scope="row">${esc(s.id)}</th>
      <td>${esc(s.label)}</td>
      <td class="num" colspan="2">—</td>
      <td class="num">${fmtScore(s.meanScore)} / 3</td>
    </tr>
  `).join('');

  const tableHtml = `
    <table class="subscales">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Criterion</th>
          <th scope="col">Role-play 1</th>
          <th scope="col">Role-play 2</th>
          <th scope="col">Score</th>
        </tr>
      </thead>
      <tbody>
        <tr class="criterion-domain-divider">
          <th colspan="5" scope="colgroup">Linguistic criteria (each 0-6)</th>
        </tr>
        ${lingRows}
        <tr class="criterion-domain-divider">
          <th colspan="5" scope="colgroup">Clinical communication indicators (each 0-3)</th>
        </tr>
        ${clinRows}
      </tbody>
    </table>
  `;

  const candidateName = (state.candidate?.candidateName || '').trim();
  const candidateId = (state.candidate?.candidateId || '').trim();
  const candidateLine = candidateName || candidateId
    ? `<p class="muted">Candidate: ${esc(candidateName || '(unnamed)')}${candidateId ? ` — ${esc(candidateId)}` : ''}</p>`
    : '';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>OET Speaking — Examiner Report</h2>
        ${candidateLine}
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Overall result</h3>
      <p class="score-summary">
        <span class="scaled-score-badge ${gradeClass(grade)}">${scaledScore} / 500</span>
        <span class="grade-label">Grade ${esc(grade)}</span>
      </p>
      <p class="muted">${esc(gradeLabel(grade))}</p>

      <dl class="score-breakdown">
        <div class="breakdown-item">
          <dt>Linguistic total</dt>
          <dd>${linguisticTotal} / 24</dd>
        </div>
        <div class="breakdown-item">
          <dt>Clinical total</dt>
          <dd>${clinicalTotal} / 15</dd>
        </div>
        <div class="breakdown-item">
          <dt>Raw total</dt>
          <dd>${rawTotal} / 39</dd>
        </div>
        <div class="breakdown-item">
          <dt>Scaled</dt>
          <dd>${scaledScore} / 500</dd>
        </div>
      </dl>

      <h3>Per-criterion scores</h3>
      ${tableHtml}

      <h3>Flagged Issues</h3>
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
  const errors = validateForm();
  if (errors.length > 0) return;
  const grading = gradeOET(state);
  const additionalFlags = detectAdditionalFlags(state, grading);
  lastResult = {
    grading,
    additionalFlags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh assessment?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the report.</p>';
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
  host.appendChild(renderStep1());
  host.appendChild(renderStep2());
  host.appendChild(renderStep3());
  host.appendChild(renderStep4());
  host.appendChild(renderStep5());
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
