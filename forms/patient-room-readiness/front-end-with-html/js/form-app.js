import { CHECKLIST_ITEMS, emptyAssessment, summariseReadiness } from './types.js';

// Patient Room Readiness — inspection wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many metadata fields have been answered.
// Submission runs a pure tally (checked / unchecked) and renders an inline
// report. State is persisted to localStorage so a partial fill survives a
// page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'patient-room-readiness.front-end-with-html.v1';
window.__A11Y_DRAFT_KEY__ = STORAGE_KEY;
const TOTAL_STEPS = 3;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyAssessment();

  for (const key of Object.keys(fresh)) {
    const v = parsed && parsed[key];
    if (v && typeof v === 'object') {
      fresh[key] = { ...fresh[key], ...v };
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
    console.warn('Could not parse saved checklist; starting fresh.', e);
    return emptyAssessment();
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save checklist to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored checklist.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

let state = loadState();
/** @type {ReturnType<typeof summariseReadiness> | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'patient-room-readiness',
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

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
}

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

function lilyInputClass(type) {
  switch (type) {
    case 'email': return 'email-input';
    case 'date':  return 'date-input';
    case 'time':  return 'time-input';
    default:      return 'text-input';
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
    `value="${esc(value ?? '')}"`
  ];

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    setField(opts.section, opts.field, input.value);
    clearFieldError(id);
  });
  return wrapper;
}

function checkboxInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const checked = Boolean(state[opts.section][opts.field]);
  const wrapper = document.createElement('div');
  wrapper.className = 'field check-field';
  wrapper.innerHTML = `
    <label class="checkbox-input" for="${id}">
      <input class="checkbox-input" type="checkbox" id="${id}"${checked ? ' checked' : ''}>
      <span>${esc(opts.label)}</span>
    </label>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('change', () => {
    setField(opts.section, opts.field, input.checked);
  });
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
  legend.innerHTML = `
    <span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>
    <h2 class="section-title">${esc(opts.title)}</h2>
    ${desc}
  `;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Steps
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Location',
    description: 'Identify the building and room being inspected.'
  });
  card.appendChild(textInput({ label: 'Building name/number', section: 'location', field: 'buildingNameOrNumber' }));
  card.appendChild(textInput({ label: 'Room name/number', section: 'location', field: 'roomNameOrNumber' }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Checklist',
    description: 'Confirm each item is present and in acceptable condition.'
  });
  const grid = document.createElement('div');
  grid.className = 'three-col';
  for (const [field, label] of CHECKLIST_ITEMS) {
    grid.appendChild(checkboxInput({ label, section: 'checklist', field }));
  }
  card.appendChild(grid);
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Inspector & sign-off',
    description: 'Who inspected the room, and when.'
  });
  const g1 = document.createElement('div'); g1.className = 'two-col';
  g1.appendChild(textInput({ label: 'Inspector name', section: 'inspector', field: 'name' }));
  g1.appendChild(textInput({ label: 'Inspector email', section: 'inspector', field: 'email', type: 'email' }));
  card.appendChild(g1);

  const g2 = document.createElement('div'); g2.className = 'two-col';
  g2.appendChild(textInput({ label: 'Inspection date', section: 'inspection', field: 'date', type: 'date' }));
  g2.appendChild(textInput({ label: 'Inspection time', section: 'inspection', field: 'time', type: 'time' }));
  card.appendChild(g2);
  return card;
}

const STEP_RENDERERS = [renderStep1, renderStep2, renderStep3];

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  ['location', 'buildingNameOrNumber'], ['location', 'roomNameOrNumber'],
  ['inspector', 'name'], ['inspector', 'email'],
  ['inspection', 'date'], ['inspection', 'time']
];

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    const v = state[section][field];
    if (v !== null && v !== undefined && v !== '') {
      answered++;
      sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
    }
  }
  const total = TRACKED_FIELDS.length;
  const percent = Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  const readiness = summariseReadiness(state);
  if (text) {
    text.textContent =
      `${answered} of ${total} fields answered (${percent}%) · ` +
      `${readiness.checkedCount} of ${readiness.totalCount} checkpoints checked`;
  }
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'location',   title: 'Location' },
  { step: 2, section: 'checklist',  title: 'Checklist' },
  { step: 3, section: 'inspector',  title: 'Inspector & sign-off' }
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
    if (def.section === 'checklist') {
      // Checklist progress is tracked separately (checked count), not via TRACKED_FIELDS.
      li.dataset.status = 'in-progress';
      continue;
    }
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
// Validation
// ----------------------------------------------------------------------

function clearFieldError(id) {
  const el = document.getElementById(`${id}-error`);
  if (el) el.textContent = '';
  const input = document.getElementById(id);
  if (input) input.removeAttribute('aria-invalid');
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { checkedCount, totalCount, uncheckedFields } = lastResult;

  const uncheckedList = uncheckedFields.length === 0
    ? `<p class="muted">All checkpoints confirmed. Room is ready for occupancy.</p>`
    : `
      <ul class="flags">
        ${uncheckedFields.map((label) => `
          <li class="flag-medium">
            <span class="flag-message">${esc(label)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  out.innerHTML = `
    <h2>Patient Room Readiness Report</h2>
    <p class="muted">Generated ${esc(new Date().toLocaleString())}</p>
    <p class="muted">
      ${esc(state.location.buildingNameOrNumber || '—')} /
      ${esc(state.location.roomNameOrNumber || '—')}
      — inspected by ${esc(state.inspector.name || '—')}
      on ${esc(state.inspection.date || '—')} ${esc(state.inspection.time || '')}
    </p>

    <h3>Checklist result</h3>
    <p class="subscale-chips">
      <span class="subscale-chip"><strong>${checkedCount}</strong> / ${totalCount} checkpoints confirmed</span>
    </p>

    <h3>Unchecked checkpoints</h3>
    ${uncheckedList}

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
  renderErrorSummary([]);
  lastResult = summariseReadiness(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh checklist?')) return;
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
  for (const r of STEP_RENDERERS) host.appendChild(r());
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
