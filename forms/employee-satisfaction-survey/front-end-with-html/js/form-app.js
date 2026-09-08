import { detectAdditionalFlags } from './flagged-issues.js';
import { gradeSatisfaction } from './grader.js';
import { DEPARTMENT_OPTIONS, DOMAINS, HOURS_OPTIONS, LIKERT_AGREEMENT, RETENTION_INTENT_OPTIONS, ROLE_LEVEL_OPTIONS, TENURE_OPTIONS, WORK_LOCATION_OPTIONS, surveyItems } from './rules.js';
import { categoryClass, categoryLabel, emptyAssessment } from './types.js';

// Employee Satisfaction Survey — employee wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard implementing the 10-step survey. Sections
// render in document order; the user scrolls through them. A sticky
// top-of-page progress summary, native <progress> bar and step-list
// reflect how many fields have been answered. Submission runs the pure
// scoring engine (per-domain mean -> 0-100 score -> composite -> category)
// plus eNPS, retention intent and flagged-issue detection, and renders an
// inline report. State is persisted to localStorage so a partial fill
// survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'employee-satisfaction-survey.front-end-form-with-html.v1';
const TOTAL_STEPS = 10;

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

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'employee-satisfaction-survey',
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
// Component builders (Lily-shaped)
// ----------------------------------------------------------------------

/**
 * Map an HTML input `type` to the Lily class name for its input element.
 */
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
 * Build a labelled single-line text/email/number/etc. input.
 *
 * @param {{ label: string, section: string, field: string,
 *           type?: string, placeholder?: string, required?: boolean,
 *           description?: string }} opts
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
    `value="${esc(value ?? '')}"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');

  const descHtml = opts.description
    ? `<span class="hint">${esc(opts.description)}</span>`
    : '';

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    ${descHtml}
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error"></span>
  `;
  const input = wrapper.querySelector('input');
  input.setAttribute('aria-describedby', `${id}-error`);
  input.addEventListener('input', () => {
    let v = input.value;
    if (type === 'number') v = v === '' ? null : Number(v);
    setField(opts.section, opts.field, v);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Build a labelled multi-line text area.
 *
 * @param {{ label: string, section: string, field: string, rows?: number,
 *           placeholder?: string, description?: string }} opts
 */
function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] ?? '';
  const descHtml = opts.description
    ? `<span class="hint">${esc(opts.description)}</span>`
    : '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    ${descHtml}
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
 *
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[],
 *           description?: string }} opts
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

  const descHtml = opts.description
    ? `<span class="hint">${esc(opts.description)}</span>`
    : '';

  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    ${descHtml}
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
 * Build a 1-5 Likert agreement radio group for a single survey item.
 * Rendered as a Lily-shaped fieldset.field + legend.label + div.radio-group.
 *
 * @param {{ id: string, domain: string, label: string }} item
 */
function likertGroup(item) {
  const groupId = `${item.domain}-${item.id}`;
  const current = state[item.domain]?.[item.id];

  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field likert-group';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.innerHTML =
    `<span class="item-id">${esc(item.id.toUpperCase())}</span>` +
    esc(item.label);
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-group likert-options';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);

  for (const opt of LIKERT_AGREEMENT) {
    const radioId = `${groupId}-${opt.value}`;
    const label = document.createElement('label');
    label.className = 'likert-option';
    label.htmlFor = radioId;
    const checked = current === opt.value ? ' checked' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${opt.value}"${checked}>
      <span class="likert-num">${opt.value}</span>
      <span class="likert-label">${esc(opt.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        setField(item.domain, item.id, opt.value);
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
 * Build the eNPS 0-10 radio strip as a Lily-shaped fieldset.field with
 * a div.radio-group containing 11 .radio-input choices.
 *
 * @param {{ section: string, field: string, label: string,
 *           description?: string }} opts
 */
function enpsGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section]?.[opts.field];

  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field enps-group';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  wrapper.appendChild(legend);

  if (opts.description) {
    const p = document.createElement('span');
    p.className = 'hint';
    p.textContent = opts.description;
    wrapper.appendChild(p);
  }

  const list = document.createElement('div');
  list.className = 'radio-group enps-options';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);

  for (let value = 0; value <= 10; value++) {
    const radioId = `${groupId}-${value}`;
    const label = document.createElement('label');
    label.className = 'enps-option';
    label.htmlFor = radioId;
    const checked = current === value ? ' checked' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${value}"${checked}>
      <span class="enps-num">${value}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        setField(opts.section, opts.field, value);
        clearFieldError(groupId);
      }
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);

  const hints = document.createElement('div');
  hints.className = 'enps-scale-hints';
  hints.innerHTML = `<span>0 — Not at all likely</span><span>10 — Extremely likely</span>`;
  wrapper.appendChild(hints);

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = `${groupId}-error`;
  wrapper.appendChild(errSpan);

  return wrapper;
}

/**
 * Build a section card as a Lily-shaped <fieldset class="fieldset"> with
 * a <legend class="fieldset-legend"> exposing step number and title.
 *
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

function renderStep2RoleTenure() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Role & Tenure',
    description:
      'Broad role banding and where you do most of your work — used for group-level analysis only.'
  });

  card.appendChild(selectInput({
    label: 'Role level',
    section: 'roleTenure',
    field: 'roleLevel',
    options: ROLE_LEVEL_OPTIONS
  }));
  card.appendChild(selectInput({
    label: 'Where do you mostly work?',
    section: 'roleTenure',
    field: 'workLocation',
    options: WORK_LOCATION_OPTIONS
  }));

  // Two short Likert items framing role appropriateness; these are stored
  // on the roleTenure section but NOT graded into the composite (this
  // step is context, not a graded domain).
  const rt1 = {
    id: 'rt1', domain: 'roleTenure',
    label: 'My role description matches the work I actually do.'
  };
  const rt2 = {
    id: 'rt2', domain: 'roleTenure',
    label: 'My responsibilities are appropriate for my role level.'
  };
  card.appendChild(likertGroup(rt1));
  card.appendChild(likertGroup(rt2));

  return card;
}

/**
 * Render a graded domain step — a section card containing one Likert
 * item fieldset per item in that domain.
 *
 * @param {{ key: string, title: string, stepNumber: number, description?: string }} domain
 */
function renderDomainStep(domain) {
  const card = sectionCard({
    stepNumber: domain.stepNumber,
    title: domain.title,
    description: domain.description
  });

  const items = surveyItems.filter((it) => it.domain === domain.key);
  for (const item of items) {
    card.appendChild(likertGroup(item));
  }
  return card;
}

/**
 * Step 10: the four overall Likert items, plus eNPS, retention intent
 * and two free-text feedback boxes. The Likert items are rendered by
 * renderDomainStep above; this function adds the extras.
 *
 * @param {HTMLElement} card
 */
function appendStep10Extras(card) {
  card.appendChild(enpsGroup({
    section: 'overall',
    field: 'recommendScore',
    label: 'On a scale of 0-10, how likely are you to recommend this organisation as a place to work?',
    description: 'This is the eNPS (Employee Net Promoter Score) question.'
  }));

  card.appendChild(selectInput({
    label: 'Retention intent — what is your current plan?',
    section: 'overall',
    field: 'retentionIntent',
    options: RETENTION_INTENT_OPTIONS
  }));

  card.appendChild(textArea({
    label: 'What is the single change that would most improve your experience here? (Suggestion box — optional)',
    section: 'overall',
    field: 'suggestionsForImprovement',
    placeholder: 'Describe the change, not specific people…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Any other comments? (Optional)',
    section: 'overall',
    field: 'otherComments',
    placeholder: 'Anything else you would like HR to know — please keep it anonymous.',
    rows: 3
  }));
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics', title: 'About you' },
  { step: 2,  section: 'roleTenure',   title: 'Role & Tenure' },
  { step: 3,  section: 'workload',     title: 'Workload' },
  { step: 4,  section: 'management',   title: 'Management' },
  { step: 5,  section: 'growth',       title: 'Growth' },
  { step: 6,  section: 'compensation', title: 'Compensation' },
  { step: 7,  section: 'culture',      title: 'Culture' },
  { step: 8,  section: 'environment',  title: 'Environment' },
  { step: 9,  section: 'recognition',  title: 'Recognition' },
  { step: 10, section: 'overall',      title: 'Overall' }
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
    // Step 1 demographics
    ['demographics', 'department'],
    ['demographics', 'tenureBand'],
    ['demographics', 'hoursBand'],
    // Step 2 role & tenure
    ['roleTenure', 'roleLevel'],
    ['roleTenure', 'workLocation'],
    ['roleTenure', 'rt1'],
    ['roleTenure', 'rt2']
  ];
  // Steps 3-10 graded items
  for (const item of surveyItems) {
    fields.push([item.domain, item.id]);
  }
  // Step 10 extras (eNPS + retention intent — text boxes are optional)
  fields.push(['overall', 'recommendScore']);
  fields.push(['overall', 'retentionIntent']);
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
  { key: 'workload',     label: 'Workload & Work-Life Balance' },
  { key: 'management',   label: 'Management & Leadership' },
  { key: 'growth',       label: 'Growth & Development' },
  { key: 'compensation', label: 'Compensation & Benefits' },
  { key: 'culture',      label: 'Culture & Inclusion' },
  { key: 'environment',  label: 'Environment & Resources' },
  { key: 'recognition',  label: 'Recognition & Engagement' },
  { key: 'overall',      label: 'Overall Experience' }
];

function enpsClassLabel(c) {
  switch (c) {
    case 'promoter': return 'Promoter';
    case 'passive':  return 'Passive';
    case 'detractor':return 'Detractor';
    default: return 'Not answered';
  }
}
function enpsClassCss(c) {
  switch (c) {
    case 'promoter': return 'enps-promoter';
    case 'passive':  return 'enps-passive';
    case 'detractor':return 'enps-detractor';
    default: return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    compositeScore, category, domainScores, eNPS,
    answeredCount, totalCount, additionalFlags, timestamp
  } = lastResult;

  // Per-domain breakdown table.
  const domainRows = DOMAIN_DISPLAY_ORDER.map(({ key, label }) => {
    const r = domainScores[key];
    if (!r) return '';
    const scoreText = r.score === null
      ? '<span class="muted">No answers</span>'
      : `${r.score.toFixed(1)} / 100`;
    const meanText = r.mean === null
      ? '<span class="muted">—</span>'
      : r.mean.toFixed(2);
    const badge = r.category
      ? `<span class="category-badge ${esc(categoryClass(r.category))}">${esc(categoryLabel(r.category))}</span>`
      : '<span class="muted">—</span>';
    return `
      <tr>
        <th scope="row">${esc(label)}</th>
        <td class="num">${scoreText}</td>
        <td class="num">${meanText}</td>
        <td class="num">${r.answeredCount} / ${r.totalCount}</td>
        <td>${badge}</td>
      </tr>
    `;
  }).join('');

  const domainTable = `
    <table class="domains">
      <thead>
        <tr>
          <th scope="col">Domain</th>
          <th scope="col">Score (0–100)</th>
          <th scope="col">Mean (1–5)</th>
          <th scope="col">Answered</th>
          <th scope="col">Category</th>
        </tr>
      </thead>
      <tbody>${domainRows}</tbody>
    </table>
  `;

  // eNPS block.
  const enpsBlock = eNPS && eNPS.score !== null && eNPS.score !== undefined
    ? `
      <p class="enps-summary">
        <span class="enps-score">${esc(String(eNPS.score))}<span class="composite-suffix"> / 10</span></span>
        <span class="enps-classification ${esc(enpsClassCss(eNPS.classification))}">${esc(enpsClassLabel(eNPS.classification))}</span>
      </p>
      <p class="muted">eNPS classifies respondents as Promoters (9–10), Passives (7–8) or Detractors (0–6).</p>
    `
    : `<p class="muted">eNPS not answered.</p>`;

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

  // Anonymous demographic + role summary.
  const demoBits = [];
  const demoLabel = (opts, value) =>
    (opts.find((o) => o.value === value) || {}).label || '';
  const dept   = demoLabel(DEPARTMENT_OPTIONS,   state.demographics.department);
  const tenure = demoLabel(TENURE_OPTIONS,       state.demographics.tenureBand);
  const hours  = demoLabel(HOURS_OPTIONS,        state.demographics.hoursBand);
  const role   = demoLabel(ROLE_LEVEL_OPTIONS,   state.roleTenure.roleLevel);
  const loc    = demoLabel(WORK_LOCATION_OPTIONS, state.roleTenure.workLocation);
  if (dept)   demoBits.push(`Department: ${dept}`);
  if (tenure) demoBits.push(`Tenure: ${tenure}`);
  if (hours)  demoBits.push(`Hours: ${hours}`);
  if (role)   demoBits.push(`Role level: ${role}`);
  if (loc)    demoBits.push(`Location: ${loc}`);
  const demoLine = demoBits.length
    ? `<p class="muted">${esc(demoBits.join(' • '))}</p>`
    : `<p class="muted">No demographic banding entered.</p>`;

  const retentionLabel = demoLabel(RETENTION_INTENT_OPTIONS, state.overall.retentionIntent);
  const retentionLine = retentionLabel
    ? `<p>Stated retention intent: <strong>${esc(retentionLabel)}</strong></p>`
    : `<p class="muted">Retention intent not answered.</p>`;

  out.innerHTML = `
    <h2>Employee Satisfaction Survey Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())} · anonymous response</p>

    <h3>Composite score</h3>
    <p class="overall-summary">
      ${compositeScore !== null
        ? `<span class="composite-score">${esc(compositeScore.toFixed(1))}<span class="composite-suffix"> / 100</span></span>`
        : '<span class="muted">No items answered yet.</span>'}
      ${category
        ? `<span class="category-badge ${esc(categoryClass(category))}">${esc(categoryLabel(category))}</span>`
        : ''}
      <span class="muted">${answeredCount} of ${totalCount} graded items answered</span>
    </p>
    <p class="muted">
      Composite is the average of the eight graded domain scores; each
      domain score is the mean of its 1-5 Likert items × 20.
      Bands: 85-100 excellent, 70-84 good, 50-69 satisfactory,
      25-49 poor, 0-24 very poor.
    </p>

    <h3>eNPS — recommend as employer</h3>
    ${enpsBlock}

    <h3>Retention intent</h3>
    ${retentionLine}

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
  const grading = gradeSatisfaction(state);
  const additionalFlags = detectAdditionalFlags(state, grading);
  lastResult = {
    compositeScore: grading.compositeScore,
    category: grading.category,
    domainScores: grading.domainScores,
    eNPS: grading.eNPS,
    answeredCount: grading.answeredCount,
    totalCount: grading.totalCount,
    firedRules: grading.firedRules,
    additionalFlags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh survey?')) return;
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
  host.appendChild(renderStep2RoleTenure());

  // Steps 3-10 = the eight graded domains, in canonical order. Step 10
  // also gets the eNPS, retention intent and free-text extras.
  for (const domain of DOMAINS) {
    const card = renderDomainStep(domain);
    if (domain.key === 'overall') {
      appendStep10Extras(card);
    }
    host.appendChild(card);
  }
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
