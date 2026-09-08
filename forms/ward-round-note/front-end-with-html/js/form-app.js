import { assess } from './grader.js';
import { emptyAssessment, priorityLabel, statusClass, statusLabel } from './types.js';

// Ward Round Note — single-page wizard (vanilla JavaScript, no build).
//
// Single continuous wizard: every step is rendered into the page in document
// order across the review header, patient identification, the ten review
// components, and a summary. The clinician scrolls through them; a sticky
// top-of-page progress summary reflects how many fields have been answered, and
// a live readout updates the completeness status, completeness percent, and
// per-component presence as data is entered. Submission runs the pure
// completeness engine (grader.js -> status, completenessPercent,
// componentStatuses, firedRules; flags.js -> safety flags) and renders an inline
// report. State is persisted to localStorage so a partial fill survives a page
// reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'ward-round-note.front-end-with-html.v1';

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
  slug: 'ward-round-note',
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

const TOTAL_STEPS = 11;

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

function numberInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="number"`,
    `class="number-input"`,
    `value="${value === null || value === undefined ? '' : esc(value)}"`,
    `aria-describedby="${id}-error"`
  ];
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);
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
    const raw = input.value.trim();
    setField(opts.section, opts.field, raw === '' ? null : Number(raw));
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
  clinicianGrade: [
    { value: 'fy1', label: 'Foundation Year 1 (FY1)' },
    { value: 'fy2', label: 'Foundation Year 2 (FY2)' },
    { value: 'core-trainee', label: 'Core trainee' },
    { value: 'specialty-registrar', label: 'Specialty registrar' },
    { value: 'acp', label: 'Advanced clinical practitioner (ACP)' },
    { value: 'physician-associate', label: 'Physician associate' },
    { value: 'consultant', label: 'Consultant' }
  ],
  observationTrend: [
    { value: 'improving', label: 'Improving' },
    { value: 'stable', label: 'Stable' },
    { value: 'deteriorating', label: 'Deteriorating' }
  ],
  vteStatus: [
    { value: 'assessed', label: 'Assessed' },
    { value: 'not-required', label: 'Not required' },
    { value: 'not-done', label: 'Not done' }
  ],
  escalationStatus: [
    { value: 'for-full-escalation', label: 'For full escalation' },
    { value: 'ward-level-ceiling', label: 'Ward-level ceiling of care' },
    { value: 'dnacpr', label: 'DNACPR in place' },
    { value: 'not-recorded', label: 'Not recorded' }
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
    title: 'Review header',
    description: 'Who is documenting, their grade, and when the review took place. Required component: name, grade, and date/time.'
  });
  card.appendChild(textInput({
    label: 'Reviewing clinician name', section: 'header',
    field: 'clinicianName', required: true, placeholder: 'e.g. Dr A. Okafor'
  }));
  card.appendChild(selectInput({
    label: 'Clinician grade', section: 'header', field: 'clinicianGrade',
    required: true, options: OPTIONS.clinicianGrade
  }));
  card.appendChild(textInput({
    label: 'Date and time of review', section: 'header',
    field: 'reviewedAt', type: 'datetime-local', required: true
  }));
  card.appendChild(textInput({
    label: 'Ward / location', section: 'header', field: 'ward',
    placeholder: 'e.g. Ward 12B, Acute Medical Unit'
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, admission date, and the reason for admission.'
  });
  card.appendChild(textInput({
    label: 'Patient identifier', section: 'identification',
    field: 'patientIdentifier',
    placeholder: 'e.g. hospital MRN or local identifier'
  }));
  card.appendChild(textInput({
    label: 'Admission date', section: 'identification', field: 'admissionDate',
    type: 'date'
  }));
  card.appendChild(textArea({
    label: 'Primary diagnosis / reason for admission', section: 'identification',
    field: 'primaryDiagnosis',
    placeholder: 'Working diagnosis or reason for admission.'
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Overnight events',
    description: 'Events since the previous review. Recommended component — record events or tick "no events overnight".'
  });
  card.appendChild(textArea({
    label: 'Overnight events', section: 'overnight', field: 'overnightEvents',
    placeholder: 'e.g. Settled overnight. One episode of chest pain at 03:00, ECG unchanged.'
  }));
  card.appendChild(selectInput({
    label: 'No events overnight?', section: 'overnight', field: 'noOvernightEvents',
    options: OPTIONS.yesNo,
    hint: 'Yes documents the overnight component as a deliberate negative.'
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Current issues and progress',
    description: 'The active problem list and progress against each problem. Required component.'
  });
  card.appendChild(textArea({
    label: 'Problem list and progress', section: 'problems', field: 'problemList',
    rows: 5,
    placeholder: 'e.g. 1. Community-acquired pneumonia — improving, CRP falling. 2. AKI stage 1 — resolving with fluids.'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Examination and observations',
    description: 'Examination summary and the latest NEWS2. Required component: an examination summary and a NEWS2 total.'
  });
  card.appendChild(textArea({
    label: 'Examination summary', section: 'examination', field: 'examinationSummary',
    placeholder: 'Relevant examination findings today.'
  }));
  card.appendChild(numberInput({
    label: 'Latest NEWS2 total', section: 'examination', field: 'news2Total',
    min: 0, max: 25, step: 1, placeholder: 'e.g. 3',
    hint: 'A total of 5 or more, or any single parameter scoring 3, prompts escalation.'
  }));
  card.appendChild(selectInput({
    label: 'Any single NEWS2 parameter scoring 3?', section: 'examination',
    field: 'news2SingleParamThree', options: OPTIONS.yesNo,
    hint: 'Yes contributes to the deteriorating-NEWS2 escalation flag.'
  }));
  card.appendChild(selectInput({
    label: 'Observation trend', section: 'examination', field: 'observationTrend',
    options: OPTIONS.observationTrend,
    hint: 'A deteriorating trend prompts escalation and a senior review.'
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Investigations reviewed',
    description: 'Results reviewed today. Required component — record results or tick "none outstanding".'
  });
  card.appendChild(textArea({
    label: 'Investigations and results reviewed', section: 'investigations',
    field: 'investigationsReviewed',
    placeholder: 'e.g. Bloods reviewed: CRP 84 (down from 120), Hb 118, U&Es normal. CXR: improving consolidation.'
  }));
  card.appendChild(selectInput({
    label: 'No investigations outstanding?', section: 'investigations',
    field: 'noInvestigationsOutstanding', options: OPTIONS.yesNo,
    hint: 'Yes documents the investigations component as a deliberate negative.'
  }));
  card.appendChild(selectInput({
    label: 'Abnormal / critical result present?', section: 'investigations',
    field: 'abnormalResultFlagged', options: OPTIONS.yesNo,
    hint: 'Yes raises a flag unless an action is recorded below.'
  }));
  card.appendChild(selectInput({
    label: 'Abnormal result actioned?', section: 'investigations',
    field: 'abnormalResultActioned', options: OPTIONS.yesNo
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'VTE assessment',
    description: 'Venous thromboembolism assessment status. Required component.'
  });
  card.appendChild(selectInput({
    label: 'VTE assessment status', section: 'vte', field: 'vteStatus',
    options: OPTIONS.vteStatus,
    hint: '"Not done" raises a high-priority safety flag (NICE NG89).'
  }));
  card.appendChild(selectInput({
    label: 'VTE prophylaxis in place?', section: 'vte', field: 'vteProphylaxisInPlace',
    options: OPTIONS.yesNo
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Medication changes',
    description: 'Medication changes made on the review. Required component — record changes or tick "no changes".'
  });
  card.appendChild(textArea({
    label: 'Medication changes', section: 'medication', field: 'medicationChanges',
    placeholder: 'e.g. Switched IV to oral antibiotics. Stopped regular NSAID given AKI.'
  }));
  card.appendChild(selectInput({
    label: 'No medication changes?', section: 'medication', field: 'noMedicationChanges',
    options: OPTIONS.yesNo,
    hint: 'Yes documents the medication component as a deliberate negative.'
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Plan and jobs',
    description: 'The plan and jobs for the day. Required component — an empty plan raises a high-priority flag.'
  });
  card.appendChild(textArea({
    label: 'Plan and jobs for the day', section: 'plan', field: 'planAndJobs',
    rows: 5,
    placeholder: 'e.g. Continue oral antibiotics. Repeat U&Es tomorrow. Chase micro. Physio review. Aim discharge in 2 days.'
  }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Escalation and discharge',
    description: 'Escalation / ceiling-of-care status, senior review, and estimated discharge. Escalation is a required component; discharge is recommended.'
  });
  card.appendChild(selectInput({
    label: 'Escalation / ceiling-of-care status', section: 'escalation',
    field: 'escalationStatus', options: OPTIONS.escalationStatus,
    hint: 'A ceiling-of-care decision prompts a senior review of this entry. "Not recorded" does not document the component.'
  }));
  card.appendChild(selectInput({
    label: 'Consultant / senior grade named on this entry?', section: 'escalation',
    field: 'seniorReviewPresent', options: OPTIONS.yesNo
  }));
  card.appendChild(textInput({
    label: 'Estimated discharge date', section: 'escalation',
    field: 'estimatedDischargeDate', type: 'date'
  }));
  card.appendChild(selectInput({
    label: 'Discharge date not yet estimable?', section: 'escalation',
    field: 'dischargeNotEstimable', options: OPTIONS.yesNo,
    hint: 'Yes documents the discharge component as a deliberate negative.'
  }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
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
    rows: 4,
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
  return (
    `<div class="readout-line">Status ${statusBadge} &nbsp; ` +
    `<strong class="${pctCls}">${g.completenessPercent}%</strong> complete ` +
    `<span class="muted">(${g.documentedRequired} of ${g.totalRequired} required components documented)</span></div>` +
    `<div class="readout-line"><span class="muted">${g.flags.length} safety flag${g.flags.length === 1 ? '' : 's'}</span></div>`
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
// the slot counts as answered when ANY of its fields is answered.
const STEP_SLOTS = {
  header: [['clinicianName'], ['clinicianGrade'], ['reviewedAt'], ['ward']],
  identification: [['patientIdentifier'], ['admissionDate'], ['primaryDiagnosis']],
  overnight: [['overnightEvents', 'noOvernightEvents']],
  problems: [['problemList']],
  examination: [['examinationSummary', 'news2Total', 'news2SingleParamThree', 'observationTrend']],
  investigations: [['investigationsReviewed', 'noInvestigationsOutstanding', 'abnormalResultFlagged', 'abnormalResultActioned']],
  vte: [['vteStatus', 'vteProphylaxisInPlace']],
  medication: [['medicationChanges', 'noMedicationChanges']],
  plan: [['planAndJobs']],
  escalation: [['escalationStatus', 'seniorReviewPresent', 'estimatedDischargeDate', 'dischargeNotEstimable']],
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
    status, completenessPercent, componentStatuses,
    documentedRequired, totalRequired, flags, timestamp
  } = lastResult;

  const componentRows = componentStatuses.map((c) => `
    <tr>
      <th scope="row">${esc(c.label)}${c.required ? '' : ' <span class="muted">(recommended)</span>'}</th>
      <td>
        <span class="flag-badge ${c.present ? 'flag-no' : 'flag-yes'}">
          ${c.present ? 'Documented' : 'Absent'}
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
      ? `<p>All ${totalRequired} required components are documented. The entry stands alone — another clinician can safely continue care between shifts. A <strong>Complete</strong> grade means the note is well documented, not that the clinical care was correct.</p>`
      : status === 'partial'
      ? `<p>The review header and the plan are documented, but one or more other required components are missing. The entry is usable but has documentation gaps — complete the outstanding components below.</p>`
      : `<p>The <strong>review header or the plan is missing</strong>, or fewer than half the required components are documented. The entry cannot safely stand alone. Record the missing components before it is used to continue care.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Ward Round Note Completeness Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${statusClass(status)}">
        <div>
          <span class="risk-banner-label">Completeness status</span>
          <span class="risk-banner-value">${esc(statusLabel(status))}</span>
        </div>
        <span class="risk-badge ${statusClass(status)}">${completenessPercent}% complete</span>
      </div>

      <h3>Review components</h3>
      <p><strong>${documentedRequired}</strong> of ${totalRequired} required components documented.</p>
      <table class="subscales">
        <thead>
          <tr><th scope="col">Component</th><th scope="col">Status</th></tr>
        </thead>
        <tbody>${componentRows}</tbody>
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
  if (!confirm('Clear all answers and start a fresh ward round note?')) return;
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
  { step: 1,  section: 'header',         title: 'Header' },
  { step: 2,  section: 'identification', title: 'Patient' },
  { step: 3,  section: 'overnight',      title: 'Overnight' },
  { step: 4,  section: 'problems',       title: 'Problems' },
  { step: 5,  section: 'examination',    title: 'Examination' },
  { step: 6,  section: 'investigations', title: 'Investigations' },
  { step: 7,  section: 'vte',            title: 'VTE' },
  { step: 8,  section: 'medication',     title: 'Medication' },
  { step: 9,  section: 'plan',           title: 'Plan' },
  { step: 10, section: 'escalation',     title: 'Escalation' },
  { step: 11, section: 'summary',        title: 'Summary' }
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
  host.appendChild(renderStep11());
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
