import { assess } from './grader.js';
import { emptyAssessment, priorityLabel, statusClass, statusLabel } from './types.js';

// SOAP Note — single-page wizard (vanilla JavaScript, no build).
//
// Single continuous wizard: every step is rendered into the page in document
// order across the four SOAP sections (Subjective, Objective, Assessment, Plan)
// plus encounter context, patient identification, and summary. The clinician
// scrolls through them; a sticky top-of-page progress summary reflects how many
// fields have been answered, and a live readout updates the completeness status,
// completeness percent, and per-section presence as data is entered. Submission
// runs the pure completeness engine (grader.js -> status, completenessPercent,
// sectionStatuses, firedRules; flags.js -> safety flags) and renders an inline
// report. State is persisted to localStorage so a partial fill survives a page
// reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'soap-note.front-end-with-html.v1';

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
    console.warn('Could not parse saved note; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save note to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored note.', e);
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
  slug: 'soap-note',
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

const TOTAL_STEPS = 7;

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
    { value: 'doctor', label: 'Doctor' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'paramedic', label: 'Paramedic' },
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'allied-health', label: 'Allied-health professional' },
    { value: 'other', label: 'Other' }
  ],
  careSetting: [
    { value: 'general-practice', label: 'General practice' },
    { value: 'outpatient', label: 'Outpatient clinic' },
    { value: 'ward', label: 'Hospital ward' },
    { value: 'emergency-department', label: 'Emergency department' },
    { value: 'community', label: 'Community / allied-health' },
    { value: 'telehealth', label: 'Telehealth' },
    { value: 'other', label: 'Other' }
  ],
  encounterType: [
    { value: 'new-problem', label: 'New problem' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'review', label: 'Review' },
    { value: 'other', label: 'Other' }
  ],
  ageBand: [
    { value: 'under-18', label: 'Under 18' },
    { value: '18-39', label: '18-39' },
    { value: '40-59', label: '40-59' },
    { value: '60-74', label: '60-74' },
    { value: '75-plus', label: '75 and over' }
  ],
  sex: [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'intersex', label: 'Intersex' },
    { value: 'unknown', label: 'Unknown' }
  ],
  yesNo: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ]
};

// ----------------------------------------------------------------------
// Section renderers (1 per wizard step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Encounter context',
    description: 'Who is documenting, when, where, and the type of encounter.'
  });
  card.appendChild(textInput({
    label: 'Authoring clinician name', section: 'context',
    field: 'clinicianName', required: true, placeholder: 'e.g. Dr A. Okafor'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role', section: 'context', field: 'clinicianRole',
    required: true, options: OPTIONS.clinicianRole
  }));
  card.appendChild(textInput({
    label: 'Date and time of encounter', section: 'context',
    field: 'encounteredAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Care setting', section: 'context', field: 'careSetting',
    required: true, options: OPTIONS.careSetting
  }));
  card.appendChild(selectInput({
    label: 'Encounter type', section: 'context', field: 'encounterType',
    options: OPTIONS.encounterType
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
    placeholder: 'e.g. GP-100482 or hospital MRN'
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
    title: 'Subjective (S)',
    description: 'History and patient-reported information. Presenting complaint and its history are required components.'
  });
  card.appendChild(textArea({
    label: 'Presenting complaint', section: 'subjective', field: 'presentingComplaint',
    required: true, placeholder: 'e.g. Central chest pain for 2 hours'
  }));
  card.appendChild(textArea({
    label: 'History of presenting complaint', section: 'subjective',
    field: 'historyOfPresentingComplaint', required: true,
    placeholder: 'Onset, character, radiation, associated symptoms, timing, exacerbating and relieving factors.'
  }));
  card.appendChild(textArea({
    label: 'Patient-reported symptoms', section: 'subjective', field: 'patientReportedSymptoms',
    placeholder: 'Other symptoms reported by the patient.'
  }));
  card.appendChild(textArea({
    label: 'Relevant past history, medication, and allergies', section: 'subjective',
    field: 'relevantHistory',
    placeholder: 'Relevant past medical history, current medication, and allergies.'
  }));
  card.appendChild(selectInput({
    label: 'Red-flag symptoms present?', section: 'subjective', field: 'redFlagSymptoms',
    options: OPTIONS.yesNo,
    hint: 'Yes makes safety-netting a required component and raises a flag if the Plan is empty.'
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Objective (O)',
    description: 'Examination findings, vital signs, and investigation results. Any one satisfies the Objective section.'
  });
  card.appendChild(textArea({
    label: 'Examination findings', section: 'objective', field: 'examinationFindings',
    placeholder: 'Relevant examination findings.'
  }));
  card.appendChild(textArea({
    label: 'Vital signs', section: 'objective', field: 'vitalSigns',
    placeholder: 'e.g. HR 96, BP 148/92, RR 20, SpO2 97%, Temp 37.1°C'
  }));
  card.appendChild(selectInput({
    label: 'Abnormal vital signs present?', section: 'objective', field: 'abnormalVitalsPresent',
    options: OPTIONS.yesNo,
    hint: 'Yes raises a flag if abnormal vitals are not addressed in the Assessment or Plan.'
  }));
  card.appendChild(textArea({
    label: 'Investigation results', section: 'objective', field: 'investigationResults',
    placeholder: 'e.g. ECG, bloods, imaging, point-of-care tests.'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Assessment (A)',
    description: 'The clinician’s interpretation. At least one recorded problem, diagnosis, or differential is required.'
  });
  card.appendChild(textArea({
    label: 'Primary diagnosis or problem', section: 'assessment', field: 'primaryDiagnosis',
    placeholder: 'e.g. Likely acute coronary syndrome — for urgent assessment.'
  }));
  card.appendChild(textArea({
    label: 'Problem list', section: 'assessment', field: 'problemList',
    placeholder: 'Active problems relevant to this encounter.'
  }));
  card.appendChild(textArea({
    label: 'Differential diagnoses', section: 'assessment', field: 'differential',
    placeholder: 'Alternatives considered.'
  }));
  card.appendChild(textArea({
    label: 'Clinical impression', section: 'assessment', field: 'clinicalImpression',
    placeholder: 'Overall clinical impression.'
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Plan (P)',
    description: 'What happens next. At least one plan item is required; follow-up is required whenever a plan is recorded.'
  });
  card.appendChild(textArea({
    label: 'Investigations planned', section: 'plan', field: 'investigationsPlan',
    placeholder: 'Investigations ordered or requested.'
  }));
  card.appendChild(textArea({
    label: 'Treatment', section: 'plan', field: 'treatmentPlan',
    placeholder: 'Treatment started or advised.'
  }));
  card.appendChild(textArea({
    label: 'Referrals', section: 'plan', field: 'referrals',
    placeholder: 'Referrals made or requested.'
  }));
  card.appendChild(textArea({
    label: 'Follow-up / review', section: 'plan', field: 'followUp',
    placeholder: 'Follow-up or review arrangement.'
  }));
  card.appendChild(textArea({
    label: 'Safety-netting advice', section: 'plan', field: 'safetyNetting',
    hint: 'Required when red-flag symptoms are present or the patient is managed at home.',
    placeholder: 'What to look out for, and when and how to seek further help.'
  }));
  card.appendChild(selectInput({
    label: 'Patient managed at home / discharged?', section: 'plan', field: 'managedAtHome',
    options: OPTIONS.yesNo,
    hint: 'Yes makes safety-netting a required component.'
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Summary and completeness',
    description: 'Live completeness status and a free-text clinical note.'
  });
  card.appendChild(readOnlyReadout({
    label: 'Live completeness',
    id: 'live-summary-readout',
    render: () => renderLiveSummary()
  }));
  card.appendChild(textArea({
    label: 'Clinical note', section: 'summary', field: 'clinicalNote',
    rows: 5,
    placeholder: 'Free-text narrative: context, decisions, and any actions already taken.'
  }));
  return card;
}

// ----------------------------------------------------------------------
// Live readout
// ----------------------------------------------------------------------

/** Render the live completeness summary. */
function renderLiveSummary() {
  const g = assess(state);
  const statusBadge =
    `<span class="risk-badge ${statusClass(g.status)}">${esc(statusLabel(g.status))}</span>`;
  const pctCls = g.completenessPercent === 100 ? 'ok' : 'warn';
  const present = g.sectionStatuses.filter((s) => s.present).length;
  const soap = g.sectionStatuses
    .map((s) => `${s.label.charAt(0)}${s.present ? '✓' : '·'}`)
    .join(' ');
  return (
    `<div class="readout-line">Status ${statusBadge} &nbsp; ` +
    `<strong class="${pctCls}">${g.completenessPercent}%</strong> complete ` +
    `<span class="muted">(${present} of 4 SOAP sections present)</span></div>` +
    `<div class="readout-line"><span class="muted">SOAP: ${esc(soap)}</span> &nbsp; ` +
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
// the slot counts as answered when ANY of its fields is answered. Each SOAP
// section step is a single slot — answered once any finding in the section is
// recorded.
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['careSetting']],
  identification: [['patientIdentifier'], ['ageBand'], ['sex']],
  subjective: [['presentingComplaint', 'historyOfPresentingComplaint', 'patientReportedSymptoms', 'relevantHistory', 'redFlagSymptoms']],
  objective: [['examinationFindings', 'vitalSigns', 'abnormalVitalsPresent', 'investigationResults']],
  assessment: [['primaryDiagnosis', 'problemList', 'differential', 'clinicalImpression']],
  plan: [['investigationsPlan', 'treatmentPlan', 'referrals', 'followUp', 'safetyNetting', 'managedAtHome']],
  summary: [['clinicalNote']]
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
    status, completenessPercent, sectionStatuses, flags, timestamp
  } = lastResult;

  const present = sectionStatuses.filter((s) => s.present).length;

  const sectionRows = sectionStatuses.map((s) => `
    <tr>
      <th scope="row">${esc(s.label)}</th>
      <td>
        <span class="flag-badge ${s.present ? 'flag-no' : 'flag-yes'}">
          ${s.present ? 'Present' : 'Absent'}
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

  const statusAdvice =
    status === 'complete'
      ? `<p>All required components are present. The note stands alone — another clinician can safely continue care. A <strong>Complete</strong> grade means the note is well documented, not that the clinical care was correct.</p>`
      : status === 'partial'
      ? `<p>Both the Assessment and the Plan are present, but one or more other required components are missing. The note is usable but has documentation gaps — complete the outstanding components below.</p>`
      : `<p>The <strong>Assessment or the Plan is missing</strong>. The note cannot safely stand alone: a critical section is absent. Record the missing section before the note is used to continue care.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>SOAP Note Completeness Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${statusClass(status)}">
        <div>
          <span class="risk-banner-label">Completeness status</span>
          <span class="risk-banner-value">${esc(statusLabel(status))}</span>
        </div>
        <span class="risk-badge ${statusClass(status)}">${completenessPercent}% complete</span>
      </div>

      <h3>SOAP sections</h3>
      <p><strong>${present}</strong> of 4 SOAP sections present.</p>
      <table class="subscales">
        <thead>
          <tr><th scope="col">Section</th><th scope="col">Presence</th></tr>
        </thead>
        <tbody>${sectionRows}</tbody>
      </table>

      <h3>Completeness</h3>
      ${statusAdvice}

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
  if (!confirm('Clear all answers and start a fresh SOAP note?')) return;
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
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'identification', title: 'Patient' },
  { step: 3, section: 'subjective',     title: 'Subjective' },
  { step: 4, section: 'objective',      title: 'Objective' },
  { step: 5, section: 'assessment',     title: 'Assessment' },
  { step: 6, section: 'plan',           title: 'Plan' },
  { step: 7, section: 'summary',        title: 'Summary' }
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
