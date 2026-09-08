import { detectFlaggedIssues } from './flags.js';
import { gradeFluidBalance } from './grader.js';
import { INTAKE_CATEGORIES, OUTPUT_CATEGORIES, categoryLabel, directionLabel, emptyChart, emptyEntry, fluidStatusClass, fluidStatusLabel, priorityLabel } from './types.js';

// Fluid Balance Chart — charting wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The recorder scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// readout updates the total intake, total output, net balance, urine output
// rate, and fluid-status classification as entries are added. Steps 3 and 4
// host a dynamic, repeating one-to-many entry list (add / remove rows) that
// mirrors the child table `fluid_balance_chart_entry` — step 3 the intake side,
// step 4 the output side. Submission runs the pure engine (totals, net balance,
// running balance, mL/kg/h, classification, flagged issues) and renders an
// inline report. State is persisted to localStorage so a partial fill survives
// a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'fluid-balance-chart.front-end-with-html.v1';

/** @returns {import('./types.js').ChartData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyChart();

  for (const key of Object.keys(fresh)) {
    if (key === 'entries') continue;
    if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null) {
      fresh[key] = { ...fresh[key], ...parsed[key] };
    }
  }
  // Rehydrate the entry list, merging each row over a fresh empty so any
  // newly-added entry fields default correctly.
  if (parsed && Array.isArray(parsed.entries)) {
    fresh.entries = parsed.entries.map((e) => ({ ...emptyEntry(), ...e }));
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyChart();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved chart; starting fresh.', e);
    return emptyChart();
  }
}

/** @param {import('./types.js').ChartData} s */
function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save chart to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored chart.', e);
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

/** @type {import('./types.js').ChartData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'fluid-balance-chart',
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

const TOTAL_STEPS = 5;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress and the
 * live readout after each change.
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

/** Format a signed millilitre value. */
function fmtMl(n) {
  return `${n >= 0 ? '+' : ''}${n} mL`;
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
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
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
      ${opts.required ? 'data-required' : ''}
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
// Repeating-list editor (entries) — the one-to-many child list
// ----------------------------------------------------------------------

/** Build one option list HTML string, marking the current value selected. */
function optionListHtml(options, current, placeholder) {
  return [
    `<option value="">${esc(placeholder || '— Select —')}</option>`,
    ...options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current ?? '') ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');
}

function categoryOptions(direction) {
  const values = direction === 'intake' ? INTAKE_CATEGORIES : OUTPUT_CATEGORIES;
  return values.map((v) => ({ value: v, label: categoryLabel(v) }));
}

/**
 * Editor for the repeating list of entries of a single direction (intake or
 * output). Each entry renders as a card of fields with a remove button; an "add"
 * button appends a fresh blank row pre-set to this direction. Every change
 * writes straight into `state.entries[idx]` (looked up by identity, since the
 * unified array holds both directions) and refreshes persistence, progress, and
 * the live summary.
 *
 * @param {'intake' | 'output'} direction
 * @returns {HTMLElement}
 */
function entryEditor(direction) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';
  const noun = direction === 'intake' ? 'intake' : 'output';
  const opts = categoryOptions(direction);

  function rerender() {
    // Rows of this direction, paired with their index in the unified array.
    const rows = state.entries
      .map((entry, idx) => ({ entry, idx }))
      .filter((r) => r.entry.direction === direction);
    wrapper.innerHTML = '';

    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = `No ${noun} entries added yet. Add one row per recorded ${noun} volume.`;
      wrapper.appendChild(empty);
    }

    rows.forEach((r, position) => {
      const row = r.entry;
      const idx = r.idx;
      const card = document.createElement('div');
      card.className = 'list-row entry-row';
      card.innerHTML = `
        <div class="list-row-header">
          <h4>${esc(directionLabel(direction))} ${position + 1}</h4>
          <button type="button" class="button" data-variant="icon" data-action="remove" aria-label="Remove ${noun} entry ${position + 1}">&times;</button>
        </div>
        <div class="list-grid entry-grid">
          <label class="list-cell">
            <span>Time recorded</span>
            <input type="datetime-local" class="date-input" data-key="entryAt" value="${esc(row.entryAt)}">
          </label>
          <label class="list-cell">
            <span>Category</span>
            <select class="select" data-key="category">${optionListHtml(opts, row.category)}</select>
          </label>
          <label class="list-cell">
            <span>Route / description</span>
            <input type="text" class="text-input" data-key="description" value="${esc(row.description)}" placeholder="${direction === 'intake' ? 'e.g. Peripheral cannula, 0.9% saline' : 'e.g. Urinary catheter'}">
          </label>
          <label class="list-cell">
            <span>Volume (mL)</span>
            <input type="number" class="number-input" data-key="volumeMl" min="0" step="1" value="${row.volumeMl === null || row.volumeMl === undefined ? '' : esc(String(row.volumeMl))}" placeholder="e.g. 250">
          </label>
        </div>
      `;

      card.querySelectorAll('input, select').forEach((inp) => {
        const handler = () => {
          const key = inp.dataset.key;
          let value = inp.value;
          if (key === 'volumeMl') {
            value = value === '' ? null : Number(value);
          }
          state.entries[idx][key] = value;
          saveState(state);
          updateProgress();
          refreshLiveSummary();
        };
        inp.addEventListener('input', handler);
        inp.addEventListener('change', handler);
      });

      card.querySelector('[data-action="remove"]').addEventListener('click', () => {
        state.entries.splice(idx, 1);
        saveState(state);
        rerender();
        updateProgress();
        refreshLiveSummary();
      });

      wrapper.appendChild(card);
    });

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'button';
    addBtn.setAttribute('data-variant', 'add');
    addBtn.textContent = `+ Add ${noun} entry`;
    addBtn.addEventListener('click', () => {
      state.entries.push(emptyEntry(direction));
      saveState(state);
      rerender();
      updateProgress();
      refreshLiveSummary();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

// ----------------------------------------------------------------------
// Section renderers (1 per step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Chart context',
    description: 'Who is charting, for which patient and ward, when the period starts, and how many hours it covers.'
  });

  card.appendChild(textInput({
    label: 'Charting clinician name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. Sam Okonkwo, staff nurse'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'nurse', label: 'Nurse' },
      { value: 'doctor', label: 'Doctor' },
      { value: 'healthcare-assistant', label: 'Healthcare assistant' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'context', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. WARD-4B-12 or NHS number'
  }));
  card.appendChild(textInput({
    label: 'Ward or unit',
    section: 'context', field: 'wardOrUnit',
    placeholder: 'e.g. Acute Medical Unit, Bay 3'
  }));
  card.appendChild(textInput({
    label: 'Chart start date and time',
    section: 'context', field: 'chartStartAt', type: 'datetime-local'
  }));
  card.appendChild(textInput({
    label: 'Charting period (hours)',
    section: 'context', field: 'chartPeriodHours',
    type: 'number', min: 1, max: 168, step: 1,
    hint: 'Defaults to 24 h; scales the significant-balance thresholds and the mL/kg/h rate.'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient weight',
    description: 'Recorded weight enables the weight-indexed urine-output rate in mL/kg/h.'
  });

  card.appendChild(textInput({
    label: 'Weight (kg)',
    section: 'patient', field: 'weightKg',
    type: 'number', min: 0, max: 400, step: 0.1,
    hint: 'Required for the mL/kg/h urine-output rate and the oliguria / anuria checks.'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Intake entries',
    description: 'One row per recorded intake volume: oral, IV, enteral, blood / products, or other. Add each with its time, category, route, and volume in mL.'
  });

  const host = document.createElement('div');
  host.className = 'field';
  host.appendChild(entryEditor('intake'));
  card.appendChild(host);

  card.appendChild(readOnlyReadout({
    label: 'Live balance and status',
    id: 'live-summary-readout',
    render: () => renderLiveSummary()
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Output entries',
    description: 'One row per recorded output volume: urine, drains, vomit / NG, stool, or insensible / other. Add each with its time, category, description, and volume in mL.'
  });

  const host = document.createElement('div');
  host.className = 'field';
  host.appendChild(entryEditor('output'));
  card.appendChild(host);

  card.appendChild(readOnlyReadout({
    label: 'Live balance and status',
    id: 'live-summary-readout-2',
    render: () => renderLiveSummary()
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Summary and balance',
    description: 'Live totals, net balance, urine-output rate, and fluid-status classification, plus a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Chart summary',
    id: 'live-summary-readout-3',
    render: () => renderLiveSummary()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, escalation, and any actions already taken.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the live balance / status summary. */
function renderLiveSummary() {
  const g = gradeFluidBalance(state);
  const status = `<span class="risk-badge ${fluidStatusClass(g.fluidStatus)}">${esc(fluidStatusLabel(g.fluidStatus))}</span>`;
  const netCls = g.netBalanceMl > 0 ? 'warn' : (g.netBalanceMl < 0 ? 'warn' : 'ok');
  const rate = g.urineOutputRateMlPerKgPerHour;
  const rateText = rate === null
    ? '<span class="muted">not computable (weight or hours missing)</span>'
    : `<strong>${rate.toFixed(2)}</strong> mL/kg/h`;
  return (
    `<div class="readout-line">Intake <strong>${g.totalIntakeMl} mL</strong> &nbsp; ` +
    `Output <strong>${g.totalOutputMl} mL</strong></div>` +
    `<div class="readout-line">Net balance <strong class="${netCls}">${fmtMl(g.netBalanceMl)}</strong> ` +
    `<span class="muted">over ${g.hoursObserved} h</span></div>` +
    `<div class="readout-line">Urine output ${rateText}</div>` +
    `<div class="readout-line">Fluid status ${status}</div>`
  );
}

function refreshLiveSummary() {
  ['live-summary-readout', 'live-summary-readout-2', 'live-summary-readout-3'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = renderLiveSummary();
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each plain section maps to one or more progress "slots"; a slot counts as
// answered when ANY of its fields is answered. The intake and output steps are
// handled separately (answered when at least one entry row of that direction
// exists).
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['patientIdentifier'], ['wardOrUnit'], ['chartStartAt'], ['chartPeriodHours']],
  patient: [['weightKg']],
  note: [['clinicalNote']]
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

  // Intake and output: synthetic single-slot sections.
  const intakeAnswered = state.entries.some((e) => e.direction === 'intake') ? 1 : 0;
  const outputAnswered = state.entries.some((e) => e.direction === 'output') ? 1 : 0;
  sectionTotal['intake'] = 1;
  sectionAnswered['intake'] = intakeAnswered;
  sectionTotal['output'] = 1;
  sectionAnswered['output'] = outputAnswered;
  total += 2;
  answered += intakeAnswered + outputAnswered;

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

function categorySubtotalRows(byCategory) {
  const keys = Object.keys(byCategory);
  if (keys.length === 0) {
    return `<tr><td colspan="2" class="muted">None recorded.</td></tr>`;
  }
  return keys.map((c) => `
    <tr><th scope="row">${esc(categoryLabel(c))}</th><td>${byCategory[c]} mL</td></tr>
  `).join('');
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    totalIntakeMl, totalOutputMl, netBalanceMl, intakeByCategory, outputByCategory,
    urineOutputMl, hoursObserved, weightKg, urineOutputRateMlPerKgPerHour,
    fluidStatus, flaggedIssues, timestamp
  } = lastResult;

  const rateText = urineOutputRateMlPerKgPerHour === null
    ? 'Not computable (weight or hours missing)'
    : `${urineOutputRateMlPerKgPerHour.toFixed(2)} mL/kg/h`;

  const entryRows = state.entries.length === 0
    ? `<tr><td colspan="4" class="muted">No entries recorded.</td></tr>`
    : state.entries.map((e) => `
      <tr>
        <th scope="row">${esc(directionLabel(e.direction) || '—')}</th>
        <td>${esc(categoryLabel(e.category) || '—')}</td>
        <td>${esc(e.description || '—')}</td>
        <td class="num">${e.volumeMl === null || e.volumeMl === undefined ? '—' : `${esc(String(e.volumeMl))} mL`}</td>
      </tr>
    `).join('');

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No safety flags raised.</p>`
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

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Fluid Balance Chart Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${fluidStatusClass(fluidStatus)}">
        <div>
          <span class="risk-banner-label">Fluid status</span>
          <span class="risk-banner-value">${esc(fluidStatusLabel(fluidStatus))}</span>
        </div>
        <span class="risk-badge ${fluidStatusClass(fluidStatus)}">${fmtMl(netBalanceMl)}</span>
      </div>

      <h3>Balance</h3>
      <table class="subscales">
        <tbody>
          <tr><th scope="row">Total intake</th><td>${totalIntakeMl} mL</td></tr>
          <tr><th scope="row">Total output</th><td>${totalOutputMl} mL</td></tr>
          <tr><th scope="row">Net balance</th><td>${fmtMl(netBalanceMl)}</td></tr>
          <tr><th scope="row">Charting period observed</th><td>${hoursObserved} h</td></tr>
          <tr><th scope="row">Weight</th><td>${weightKg === null ? '—' : `${weightKg} kg`}</td></tr>
          <tr><th scope="row">Urine output</th><td>${urineOutputMl} mL</td></tr>
          <tr><th scope="row">Urine output rate</th><td>${esc(rateText)}</td></tr>
        </tbody>
      </table>

      <h3>Intake by category</h3>
      <table class="subscales"><tbody>${categorySubtotalRows(intakeByCategory)}</tbody></table>

      <h3>Output by category</h3>
      <table class="subscales"><tbody>${categorySubtotalRows(outputByCategory)}</tbody></table>

      <h3>Entries (${state.entries.length})</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Direction</th>
            <th scope="col">Category</th>
            <th scope="col">Route / description</th>
            <th scope="col">Volume</th>
          </tr>
        </thead>
        <tbody>${entryRows}</tbody>
      </table>

      <h3>Safety flags (${flaggedIssues.length})</h3>
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
  const grade = gradeFluidBalance(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    ...grade,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh chart?')) return;
  clearState();
  state = emptyChart();
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
  { step: 1, section: 'context', title: 'Context' },
  { step: 2, section: 'patient', title: 'Weight' },
  { step: 3, section: 'intake',  title: 'Intake' },
  { step: 4, section: 'output',  title: 'Output' },
  { step: 5, section: 'note',    title: 'Summary' }
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
