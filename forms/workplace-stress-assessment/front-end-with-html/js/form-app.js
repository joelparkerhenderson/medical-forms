import { detectAdditionalFlags } from './flagged-issues.js';
import { DEPARTMENT_OPTIONS, DOMAINS, HOURS_OPTIONS, LIKERT_AGREEMENT, LIKERT_FREQUENCY, TENURE_OPTIONS, stressItems } from './rules.js';
import { gradeStress } from './stress-grader.js';
import { emptyAssessment, riskLevelClass, riskLevelLabel } from './types.js';

// Workplace Stress Assessment - employee wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard implementing the 35-item HSE Management
// Standards Indicator Tool. Sections render in document order as Lily
// `.fieldset` cards; the user scrolls through them. A native `<progress>`
// bar plus a `.step-list` reflects how many fields have been answered.
// Submission runs the pure scoring engine (per-domain mean → percentile
// category → overall worst category) and renders an inline report in the
// `.panel` region. State is persisted to localStorage so a partial fill
// survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'workplace-stress-assessment.front-end-form-with-html.v1';
const TOTAL_STEPS = 9;

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
  slug: 'workplace-stress-assessment',
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
// Component builders (Lily class contract)
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
 * Build a labelled multi-line text area.
 * @param {{ label: string, section: string, field: string, rows?: number,
 *           placeholder?: string }} opts
 */
function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
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
 * Build a radio group following Lily contract:
 *   fieldset.field > legend.label + div.radio-group[role=radiogroup]
 *   each option: label > input.radio-input + span
 *
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
 * Build a 1-5 Likert radio group for a single HSE item.
 * Lily-shaped: fieldset.field.likert-group > legend.label +
 *              div.radio-group.likert-options[role=radiogroup]
 *
 * @param {{ id: string, domain: string, label: string,
 *           scale: 'frequency' | 'agreement' }} item
 */
function likertGroup(item) {
  const groupName = `${item.domain}-${item.id}`;
  const current = state[item.domain]?.[item.id];

  const fieldset = document.createElement('fieldset');
  fieldset.className = 'field likert-group';
  fieldset.id = `${groupName}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.innerHTML =
    `<span class="item-id">${esc(item.id.toUpperCase())}</span>` +
    esc(item.label);
  fieldset.appendChild(legend);

  const opts = item.scale === 'agreement' ? LIKERT_AGREEMENT : LIKERT_FREQUENCY;
  const list = document.createElement('div');
  list.className = 'radio-group likert-options';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', fieldset.id);

  for (const opt of opts) {
    const radioId = `${groupName}-${opt.value}`;
    const label = document.createElement('label');
    label.className = 'likert-option';
    label.htmlFor = radioId;
    const checked = current === opt.value ? ' checked' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupName}" value="${opt.value}"${checked}>
      <span class="likert-num">${opt.value}</span>
      <span class="likert-label">${esc(opt.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) setField(item.domain, item.id, opt.value);
    });
    list.appendChild(label);
  }
  fieldset.appendChild(list);

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = `${groupName}-error`;
  fieldset.appendChild(errSpan);
  return fieldset;
}

/**
 * Build a section card as a Lily fieldset with fieldset-legend.
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
// Section renderers
// ----------------------------------------------------------------------

function renderStep1Demographics() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'About you',
    description:
      'Anonymous, non-identifying details only. These help group results in the dashboard but cannot single out an individual.'
  });

  card.appendChild(selectInput({
    label: 'Department / function',
    section: 'demographics',
    field: 'department',
    options: DEPARTMENT_OPTIONS
  }));
  card.appendChild(selectInput({
    label: 'Tenure (how long you have been in your current role)',
    section: 'demographics',
    field: 'tenureBand',
    options: TENURE_OPTIONS
  }));
  card.appendChild(selectInput({
    label: 'Working hours (typical week)',
    section: 'demographics',
    field: 'hoursBand',
    options: HOURS_OPTIONS
  }));

  return card;
}

/**
 * Render a domain step — a section card containing one Likert item
 * fieldset per HSE statement in that domain.
 *
 * @param {{ key: string, title: string, stepNumber: number, description?: string }} domain
 */
function renderDomainStep(domain) {
  const card = sectionCard({
    stepNumber: domain.stepNumber,
    title: domain.title,
    description: domain.description
  });

  const items = stressItems.filter((it) => it.domain === domain.key);
  for (const item of items) {
    card.appendChild(likertGroup(item));
  }
  return card;
}

function renderStep9AdditionalComments() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Additional comments',
    description:
      'Optional free-text feedback. Please do not include names or contact details — your responses are anonymous.'
  });

  card.appendChild(textArea({
    label: 'What is the most stressful aspect of your work right now?',
    section: 'additionalComments',
    field: 'mostStressfulAspect',
    placeholder: 'Describe the situation, not the people involved…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'What changes would most reduce work-related stress for you?',
    section: 'additionalComments',
    field: 'suggestionsForImprovement',
    placeholder: 'e.g. clearer priorities, smaller meetings, better tools…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Any other comments?',
    section: 'additionalComments',
    field: 'otherComments',
    placeholder: 'Anything else you would like occupational health to know…',
    rows: 3
  }));

  return card;
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'demographics',        title: 'About you' },
  { step: 2, section: 'demands',             title: 'Demands' },
  { step: 3, section: 'control',             title: 'Control' },
  { step: 4, section: 'managerSupport',      title: 'Mgr Support' },
  { step: 5, section: 'peerSupport',         title: 'Peer Support' },
  { step: 6, section: 'relationships',       title: 'Relationships' },
  { step: 7, section: 'role',                title: 'Role Clarity' },
  { step: 8, section: 'change',              title: 'Change' },
  { step: 9, section: 'additionalComments',  title: 'Comments' }
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
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = (() => {
  /** @type {[string, string][]} */
  const fields = [
    ['demographics', 'department'],
    ['demographics', 'tenureBand'],
    ['demographics', 'hoursBand']
  ];
  for (const item of stressItems) {
    fields.push([item.domain, item.id]);
  }
  // Optional text fields in step 9 — counted only towards the step's
  // step-list status, not the overall completion percentage; we still
  // include them so that the section can show "in progress" / "finished".
  fields.push(['additionalComments', 'mostStressfulAspect']);
  fields.push(['additionalComments', 'suggestionsForImprovement']);
  fields.push(['additionalComments', 'otherComments']);
  return fields;
})();

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
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Validation
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
    case 'high': return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

const DOMAIN_DISPLAY_ORDER = [
  { key: 'demands',        label: 'Demands' },
  { key: 'control',        label: 'Control' },
  { key: 'managerSupport', label: 'Manager Support' },
  { key: 'peerSupport',    label: 'Peer Support' },
  { key: 'relationships',  label: 'Relationships' },
  { key: 'role',           label: 'Role Clarity' },
  { key: 'change',         label: 'Organisational Change' }
];

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { domains, overallRisk, answeredCount, additionalFlags, timestamp } = lastResult;

  // Per-domain breakdown table.
  const domainRows = DOMAIN_DISPLAY_ORDER.map(({ key, label }) => {
    const r = domains[key];
    if (!r) return '';
    const meanText = r.mean === null
      ? '<span class="muted">No answers</span>'
      : r.mean.toFixed(2);
    const badge = r.category
      ? `<span class="risk-badge ${esc(riskLevelClass(r.category))}">${esc(riskLevelLabel(r.category))}</span>`
      : '<span class="muted">—</span>';
    return `
      <tr>
        <th scope="row">${esc(label)}</th>
        <td class="num">${meanText}</td>
        <td class="num">${r.answeredCount} / ${r.totalCount}</td>
        <td>${badge}</td>
      </tr>
    `;
  }).join('');

  const domainTable = `
    <table class="subscales">
      <thead>
        <tr>
          <th scope="col">Domain</th>
          <th scope="col">Mean (1–5)</th>
          <th scope="col">Answered</th>
          <th scope="col">Concern</th>
        </tr>
      </thead>
      <tbody>${domainRows}</tbody>
    </table>
  `;

  // Flags.
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

  // Anonymous demographic summary (group-level; never individually
  // identifying because we only collected broad bands).
  const demoBits = [];
  const demoLabel = (opts, value) =>
    (opts.find((o) => o.value === value) || {}).label || '';
  const dept = demoLabel(DEPARTMENT_OPTIONS, state.demographics.department);
  const tenure = demoLabel(TENURE_OPTIONS, state.demographics.tenureBand);
  const hours = demoLabel(HOURS_OPTIONS, state.demographics.hoursBand);
  if (dept) demoBits.push(`Department: ${dept}`);
  if (tenure) demoBits.push(`Tenure: ${tenure}`);
  if (hours) demoBits.push(`Hours: ${hours}`);
  const demoLine = demoBits.length
    ? `<p class="muted">${esc(demoBits.join(' • '))}</p>`
    : `<p class="muted">No demographic banding entered.</p>`;

  out.innerHTML = `
    <h2>Workplace Stress Assessment Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())} · anonymous response</p>

    <h3>Overall risk</h3>
    <p class="overall-summary">
      ${overallRisk
        ? `<span class="risk-badge ${esc(riskLevelClass(overallRisk))}">${esc(riskLevelLabel(overallRisk))}</span>`
        : '<span class="muted">No items answered yet.</span>'}
      <span class="muted">${answeredCount} of 35 items answered</span>
    </p>
    <p class="muted">
      Overall risk reflects the worst-performing of the seven HSE domains.
      Means are benchmarked against the indicative HSE 2007 norms (20th, 50th
      and 80th percentile cut-offs).
    </p>

    <h3>Per-domain breakdown</h3>
    ${domainTable}

    <h3>Anonymous response context</h3>
    ${demoLine}

    <h3>Flagged issues</h3>
    ${flagsList}

    <div class="report-actions">
      <button type="button" id="print-btn" class="button" data-variant="secondary">Print / save PDF</button>
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
  document.getElementById('print-btn').addEventListener('click', () => window.print());
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const grading = gradeStress(state);
  const additionalFlags = detectAdditionalFlags(state, grading.domains);
  lastResult = {
    domains: grading.domains,
    overallRisk: grading.overallRisk,
    answeredCount: grading.answeredCount,
    firedRules: grading.firedRules,
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
  host.appendChild(renderStep1Demographics());

  // Steps 2-8 = the seven HSE domains, in canonical order.
  for (const domain of DOMAINS) {
    host.appendChild(renderDomainStep(domain));
  }

  host.appendChild(renderStep9AdditionalComments());
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

// Silence lint if these helpers go unused in a future trim.
void lilyInputClass;
void radioGroup;
void setFieldError;
