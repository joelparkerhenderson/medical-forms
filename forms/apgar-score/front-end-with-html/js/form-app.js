import { detectFlaggedIssues } from './flags.js';
import { calculateApgarGrade } from './grader.js';
import { SIGNS, bandClass, bandLabel, emptyAssessment, emptyTimepoint, priorityLabel, trendLabel } from './types.js';

// Apgar Score — newborn scoring wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// per-timepoint total (0-10) and band updates as the five signs are entered.
//
// The distinctive step is the repeating-timepoint editor: the newborn is
// scored at 1 and 5 minutes (always present), and again at 10 minutes and
// beyond whenever the 5-minute total is below 7. The clinician adds and removes
// timepoint rows; each row scores the five APGAR signs (Appearance, Pulse,
// Grimace, Activity, Respiration). Submission runs the pure scoring engine
// (per-timepoint totals, bands, trend, flagged issues) and renders an inline
// report. State is persisted to localStorage so a partial fill survives reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'apgar-score.front-end-with-html.v1';

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
    if (key === 'timepoints') {
      if (Array.isArray(parsed.timepoints) && parsed.timepoints.length > 0) {
        fresh.timepoints = parsed.timepoints.map((tp) => ({
          ...emptyTimepoint(null),
          ...tp
        }));
      }
    } else if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null) {
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

/** @param {import('./types.js').AssessmentData} s */
function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
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
  slug: 'apgar-score',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const rep = document.getElementById('report');
    if (rep) rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    refreshSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 4;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a field on an object section (context / identification / summary) and
 * persist. Re-runs progress and the live summary after each change.
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  refreshSummary();
}

/**
 * Set a single sign / minutes field on one repeated timepoint and persist.
 * @param {number} index
 * @param {string} field
 * @param {*} value
 */
function setTimepointField(index, field, value) {
  const tp = state.timepoints[index];
  if (!tp) return;
  tp[field] = value;
  saveState(state);
  updateProgress();
  refreshTimepointReadout(index);
  refreshSummary();
}

/** Suggest the next unused timepoint in minutes for a freshly-added row. */
function nextTimepointMinutes() {
  const used = new Set(
    state.timepoints
      .map((t) => t.timepointMinutes)
      .filter((m) => m != null)
  );
  for (const m of [1, 5, 10, 15, 20, 25, 30]) {
    if (!used.has(m)) return m;
  }
  return null;
}

function addTimepoint() {
  state.timepoints.push(emptyTimepoint(nextTimepointMinutes()));
  saveState(state);
  renderTimepointList();
  updateProgress();
  refreshSummary();
}

function removeTimepoint(index) {
  state.timepoints.splice(index, 1);
  saveState(state);
  renderTimepointList();
  updateProgress();
  refreshSummary();
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

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
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
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Birth context',
    description: 'Who attended, when and where the birth took place, the gestation, and the mode of delivery.'
  });

  card.appendChild(textInput({
    label: 'Attending clinician name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. Midwife J. Okoro'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'midwife', label: 'Midwife' },
      { value: 'obstetrician', label: 'Obstetrician' },
      { value: 'neonatologist', label: 'Neonatologist' },
      { value: 'neonatal-nurse', label: 'Neonatal nurse' },
      { value: 'paediatrician', label: 'Paediatrician' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of birth',
    section: 'context', field: 'bornAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'careSetting', required: true,
    options: [
      { value: 'delivery-room', label: 'Delivery room' },
      { value: 'theatre', label: 'Obstetric theatre' },
      { value: 'birth-centre', label: 'Birth centre' },
      { value: 'home', label: 'Home birth' },
      { value: 'neonatal-unit', label: 'Neonatal unit' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Gestational age at birth',
    section: 'context', field: 'gestationalAgeWeeks',
    type: 'number', min: 20, max: 45, step: 0.1, unit: 'weeks',
    hint: 'Completed weeks of gestation (e.g. 39.4).'
  }));
  card.appendChild(selectInput({
    label: 'Mode of delivery',
    section: 'context', field: 'modeOfDelivery',
    options: [
      { value: 'vaginal', label: 'Vaginal' },
      { value: 'assisted', label: 'Assisted (forceps / ventouse)' },
      { value: 'caesarean', label: 'Caesarean' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Newborn identification',
    description: 'Local identifier, sex, and — for multiple births — birth order.'
  });

  card.appendChild(textInput({
    label: 'Newborn identifier',
    section: 'identification', field: 'newbornIdentifier', required: true,
    placeholder: 'e.g. NB-100482 or cot label'
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
  card.appendChild(textInput({
    label: 'Birth order',
    section: 'identification', field: 'birthOrder',
    type: 'number', min: 1, max: 10, step: 1,
    hint: 'Position for multiple births (1 for a singleton).'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Timepoint assessments',
    description: 'Score the five signs (each 0-2) at 1 and 5 minutes, and again at 10 minutes and beyond whenever the 5-minute total is below 7.'
  });

  const list = document.createElement('div');
  list.className = 'list-editor';
  list.id = 'timepoint-list';
  card.appendChild(list);

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'button';
  addBtn.dataset.variant = 'add';
  addBtn.id = 'add-timepoint-btn';
  addBtn.textContent = '+ Add timepoint';
  addBtn.addEventListener('click', addTimepoint);
  card.appendChild(addBtn);

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Resuscitation and summary',
    description: 'Record any resuscitation given, review the per-timepoint totals and trend, and add a clinical note. Submit to generate the full report.'
  });

  card.appendChild(textArea({
    label: 'Resuscitation measures given',
    section: 'summary', field: 'resuscitationMeasures',
    hint: 'e.g. drying and stimulation, airway positioning, oxygen, inflation breaths (IPPV), chest compressions.',
    placeholder: 'Describe the measures given, if any.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Live Apgar summary',
    id: 'apgar-summary-readout',
    render: renderSummary
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'summary', field: 'clinicianNote',
    placeholder: 'Free-text clinical note: context, decisions, and any escalation already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Repeating-timepoint editor
// ----------------------------------------------------------------------

const MINUTE_OPTIONS = [1, 5, 10, 15, 20, 25, 30];

/** Build the sign-score <select> for one timepoint. */
function buildSignSelect(index, sign) {
  const id = `tp-${index}-${sign.field}`;
  const current = state.timepoints[index][sign.field] ?? '';
  const cell = document.createElement('div');
  cell.className = 'list-cell';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...['0', '1', '2'].map((v) =>
      `<option value="${v}"${v === String(current) ? ' selected' : ''}>${v} — ${esc(sign.scores[v])}</option>`
    )
  ].join('');

  cell.innerHTML = `
    <label class="label" for="${id}">${esc(sign.letter)} · ${esc(sign.label)}</label>
    <select id="${id}" name="${id}" class="select" aria-label="${esc(sign.label)} score">
      ${optionsHtml}
    </select>
  `;
  const sel = cell.querySelector('select');
  sel.addEventListener('change', () => {
    setTimepointField(index, sign.field, sel.value);
  });
  return cell;
}

/** Build one timepoint card (minutes selector, five signs, live total). */
function buildTimepointCard(index) {
  const tp = state.timepoints[index];
  const row = document.createElement('div');
  row.className = 'list-row';
  row.dataset.index = String(index);

  const grid = document.createElement('div');
  grid.className = 'list-grid';

  // ─── Minutes selector ───────────────────────────────────────
  const minutesCell = document.createElement('div');
  minutesCell.className = 'list-cell';
  const minutesId = `tp-${index}-minutes`;
  const minutesOptions = [
    `<option value="">— Select —</option>`,
    ...MINUTE_OPTIONS.map((m) =>
      `<option value="${m}"${String(m) === String(tp.timepointMinutes ?? '') ? ' selected' : ''}>${m} minute${m === 1 ? '' : 's'}</option>`
    )
  ].join('');
  minutesCell.innerHTML = `
    <label class="label" for="${minutesId}">Timepoint (minutes after birth)</label>
    <select id="${minutesId}" name="${minutesId}" class="select" aria-label="Timepoint minutes after birth">
      ${minutesOptions}
    </select>
  `;
  const minutesSel = minutesCell.querySelector('select');
  minutesSel.addEventListener('change', () => {
    const v = minutesSel.value === '' ? null : Number(minutesSel.value);
    setTimepointField(index, 'timepointMinutes', v);
  });
  grid.appendChild(minutesCell);

  // ─── Five signs ─────────────────────────────────────────────
  for (const sign of SIGNS) {
    grid.appendChild(buildSignSelect(index, sign));
  }

  // ─── Live total readout for this timepoint ──────────────────
  const totalCell = document.createElement('div');
  totalCell.className = 'list-cell';
  totalCell.innerHTML = `
    <span>Total</span>
    <div id="tp-total-${index}" class="readout-value">${renderTimepointTotal(index)}</div>
  `;
  grid.appendChild(totalCell);

  row.appendChild(grid);

  // ─── Remove button (kept for parity with the list-editor pattern) ───
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'button';
  removeBtn.dataset.variant = 'icon';
  removeBtn.setAttribute('aria-label', `Remove timepoint ${index + 1}`);
  removeBtn.title = 'Remove this timepoint';
  removeBtn.textContent = '✕';
  removeBtn.addEventListener('click', () => removeTimepoint(index));
  row.appendChild(removeBtn);

  return row;
}

function renderTimepointList() {
  const list = document.getElementById('timepoint-list');
  if (!list) return;
  list.innerHTML = '';

  if (state.timepoints.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'list-empty';
    empty.textContent = 'No timepoints recorded. Add the 1-minute and 5-minute scores to begin.';
    list.appendChild(empty);
    return;
  }

  state.timepoints.forEach((_, index) => {
    list.appendChild(buildTimepointCard(index));
  });
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the live total + band pill for a single timepoint. */
function renderTimepointTotal(index) {
  const graded = calculateApgarGrade(state).timepoints[index];
  if (!graded || !graded.scored) {
    return `<span class="muted">Not yet scored</span>`;
  }
  const badge =
    `<span class="risk-badge ${bandClass(graded.band)}">${esc(bandLabel(graded.band))}</span>`;
  return `<strong>${graded.total} of 10</strong> ${badge}`;
}

function refreshTimepointReadout(index) {
  const el = document.getElementById(`tp-total-${index}`);
  if (el) el.innerHTML = renderTimepointTotal(index);
}

/** Render the whole-assessment summary (per-timepoint totals + trend). */
function renderSummary() {
  const grade = calculateApgarGrade(state);
  const scored = grade.timepoints.filter((g) => g.scored);
  if (scored.length === 0) {
    return `<span class="muted">Score at least one timepoint to see the summary.</span>`;
  }
  const parts = grade.timepoints.map((g) => {
    if (!g.scored) return '';
    const min = g.timepointMinutes == null ? '?' : g.timepointMinutes;
    return `<span class="risk-badge ${bandClass(g.band)}">${min} min: ${g.total}/10</span>`;
  }).filter(Boolean).join(' ');
  const trend = `<span class="muted">Trend: ${esc(trendLabel(grade.trend))}</span>`;
  return `${parts} ${trend}`;
}

function refreshSummary() {
  const el = document.getElementById('apgar-summary-readout');
  if (el) el.innerHTML = renderSummary();
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Fixed object-section slots. A slot counts as answered when ANY of its fields
// is answered. The dynamic `timepoints` section is handled separately below.
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['careSetting']],
  identification: [['newbornIdentifier'], ['sex']],
  summary: [['resuscitationMeasures', 'clinicianNote']]
};

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '';
}

/** A timepoint is "complete" when all five signs are answered. */
function timepointComplete(tp) {
  return SIGNS.every((s) => tp[s.field] !== '' && tp[s.field] != null);
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
      if (slot.some((field) => isAnswered(section, field))) {
        answered++;
        sectionAnswered[section]++;
      }
    }
  }

  // Timepoints: one slot per timepoint, answered when all five signs are in.
  const tps = state.timepoints;
  sectionTotal.timepoints = Math.max(tps.length, 1);
  sectionAnswered.timepoints = tps.filter(timepointComplete).length;
  total += sectionTotal.timepoints;
  answered += sectionAnswered.timepoints;

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

  const { timepoints, trend, flaggedIssues, timestamp } = lastResult;
  const scored = timepoints.filter((g) => g.scored);

  const worst = scored.length
    ? scored.reduce((a, b) => (b.total < a.total ? b : a))
    : null;

  const timepointRows = scored.length === 0
    ? `<tr><td colspan="4" class="muted">No timepoints scored.</td></tr>`
    : scored.map((g) => `
      <tr>
        <th scope="row">${g.timepointMinutes == null ? '—' : `${esc(g.timepointMinutes)} min`}</th>
        <td class="num"><span class="risk-badge ${bandClass(g.band)}">${g.total} of 10</span></td>
        <td>${esc(bandLabel(g.band))}</td>
        <td>${g.answeredCount === 5 ? 'All 5 signs' : `${g.answeredCount} of 5 signs`}</td>
      </tr>
    `).join('');

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

  const bannerBand = worst ? worst.band : 'reassuring';
  const bannerValue = worst
    ? `${worst.total} of 10`
    : '—';

  const guidance = worst && worst.total <= 3
    ? `<p>A timepoint total of 3 or below indicates a <strong>severely depressed newborn</strong>. Commence active resuscitation per the newborn-life-support algorithm and obtain senior / neonatal support immediately.</p>`
    : worst && worst.total <= 6
      ? `<p>A moderately low total (4-6) prompts <strong>support and stimulation</strong> (drying, warmth, airway positioning, tactile stimulation, oxygen as indicated). Continue to reassess.</p>`
      : `<p>Totals in the reassuring range (7-10) indicate the newborn has adapted well. Continue routine care and observation; re-score if the condition changes.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Apgar Score Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${bandClass(bannerBand)}">
        <div>
          <span class="risk-banner-label">Lowest scored total</span>
          <span class="risk-banner-value">${esc(bannerValue)}</span>
        </div>
        <span class="risk-badge ${bandClass(bannerBand)}">${esc(bandLabel(bannerBand))}</span>
      </div>

      <p><strong>Trend across timepoints:</strong> ${esc(trendLabel(trend))}</p>

      <h3>Per-timepoint scores</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Timepoint</th>
            <th scope="col">Total</th>
            <th scope="col">Band</th>
            <th scope="col">Completeness</th>
          </tr>
        </thead>
        <tbody>${timepointRows}</tbody>
      </table>

      <h3>Recommended action</h3>
      ${guidance}

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
  const errors = validateForm();
  if (errors.length > 0) return;
  const grade = calculateApgarGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade.timepoints);
  lastResult = {
    timepoints: grade.timepoints,
    trend: grade.trend,
    firedSigns: grade.firedSigns,
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
  const rep = document.getElementById('report');
  if (rep) rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  refreshSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Birth context' },
  { step: 2, section: 'identification', title: 'Newborn' },
  { step: 3, section: 'timepoints',     title: 'Timepoints' },
  { step: 4, section: 'summary',        title: 'Summary' }
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
  renderTimepointList();
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  refreshSummary();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
