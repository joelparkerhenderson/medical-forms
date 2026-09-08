import { detectFlaggedIssues } from './flags.js';
import { calculateEpdsGrade } from './grader.js';
import { epdsItems, itemByNumber, scoreForOption } from './rules.js';
import { bandClass, bandLabel, emptyAssessment, priorityLabel } from './types.js';

// Edinburgh Postnatal Depression Scale (EPDS) — self-report wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The person completing it scrolls through the ten items; a
// sticky top-of-page progress summary reflects how many fields are answered and
// a live EPDS total (0-30) and band update as items are chosen. Each item is
// scored transparently — the option labels show the points they contribute, and
// the reverse-scoring for items 3, 5, 6, 7, 8, 9 and 10 is applied by the pure
// scoring engine. Submission runs the engine (per-item scores, total 0-30, band,
// self-harm flag, flagged issues) and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.
//
// The EPDS is a validated screen, not a diagnosis, and item 10 (thoughts of
// self-harm) is handled as a safety-critical item: any positive response raises
// a mandatory urgent flag regardless of the total score.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'edinburgh-postnatal-depression-scale.front-end-with-html.v1';

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
  slug: 'edinburgh-postnatal-depression-scale',
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
    refreshLiveScore();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 6;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress and the
 * live-score readouts after each change.
 *
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  refreshLiveScore();
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

/**
 * Render one EPDS item as a radio group. The four options appear in the printed
 * order shown on the questionnaire (optionIndex 0..3); the RAW option index is
 * stored in state, and each option label shows the points it contributes so the
 * reverse-scoring is transparent to the clinician and respondent.
 *
 * @param {import('./rules.js').EpdsItem} item
 */
function itemField(item) {
  const groupId = `items-${item.field}`;
  const current = state.items[item.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field radio-fieldset';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  const dir = item.direction === 'reverse' ? ' (reverse-scored)' : '';
  legend.innerHTML =
    `<span class="section-step">Item ${item.number}${dir}</span>` +
    `<span class="section-title">${esc(item.statement)}</span>`;
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', `${groupId}-fieldset`);

  item.options.forEach((optionText, optionIndex) => {
    const score = scoreForOption(item.direction, optionIndex);
    const radioId = `${groupId}-${optionIndex}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
    label.htmlFor = radioId;
    const checked = current === optionIndex ? ' checked' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${optionIndex}"${checked}>
      <span>${esc(optionText)} <span class="muted">(${score} ${score === 1 ? 'point' : 'points'})</span></span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        setField('items', item.field, optionIndex);
        clearFieldError(groupId);
      }
    });
    list.appendChild(label);
  });

  wrapper.appendChild(list);

  const err = document.createElement('span');
  err.className = 'error-message';
  err.id = `${groupId}-error`;
  err.setAttribute('aria-live', 'polite');
  wrapper.appendChild(err);
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
// Section renderers (1 per EPDS step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is administering the EPDS, where, when, and the perinatal stage.'
  });

  card.appendChild(textInput({
    label: 'Administering clinician name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. J. Okafor, midwife'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'midwife', label: 'Midwife' },
      { value: 'health-visitor', label: 'Health visitor' },
      { value: 'gp', label: 'General practitioner' },
      { value: 'perinatal-mh', label: 'Perinatal mental-health practitioner' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'careSetting', required: true,
    options: [
      { value: 'maternity', label: 'Maternity service' },
      { value: 'community', label: 'Community / health visiting' },
      { value: 'general-practice', label: 'General practice' },
      { value: 'perinatal-mh', label: 'Perinatal mental-health service' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of assessment',
    section: 'context', field: 'assessedAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Perinatal stage',
    section: 'context', field: 'perinatalStage', required: true,
    options: [
      { value: 'antenatal', label: 'Antenatal (during pregnancy)' },
      { value: 'postnatal', label: 'Postnatal (after birth)' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Gestational or postnatal week',
    section: 'context', field: 'perinatalWeek',
    type: 'number', min: 0, max: 60, step: 1, unit: 'weeks',
    hint: 'Gestational week if antenatal, or weeks since birth if postnatal.'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Respondent identification',
    description: 'Local identifier, age band, language, and any help needed to complete the EPDS.'
  });

  card.appendChild(textInput({
    label: 'Respondent identifier',
    section: 'identification', field: 'respondentIdentifier', required: true,
    placeholder: 'e.g. ANC-204815 or hospital MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand',
    options: [
      { value: 'under-20', label: 'Under 20' },
      { value: '20-29', label: '20-29' },
      { value: '30-39', label: '30-39' },
      { value: '40-plus', label: '40 and over' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Preferred language',
    section: 'identification', field: 'preferredLanguage',
    placeholder: 'e.g. English, Cymraeg, Polish'
  }));
  card.appendChild(selectInput({
    label: 'Assistance needed to complete',
    section: 'identification', field: 'assistanceNeeded',
    options: [
      { value: 'none', label: 'None — self-completed' },
      { value: 'interpreter', label: 'Interpreter' },
      { value: 'clinician-read', label: 'Clinician read the items aloud' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Items 1 to 4',
    description: 'In the past 7 days… Choose the answer that comes closest to how you have felt.'
  });
  [1, 2, 3, 4].forEach((n) => card.appendChild(itemField(itemByNumber(n))));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Items 5 to 9',
    description: 'In the past 7 days… Choose the answer that comes closest to how you have felt.'
  });
  [5, 6, 7, 8, 9].forEach((n) => card.appendChild(itemField(itemByNumber(n))));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Item 10 — safety item',
    description: 'This item asks about thoughts of self-harm. Any answer other than "Never" prompts an immediate safety review, regardless of the total score.'
  });

  card.appendChild(itemField(itemByNumber(10)));

  card.appendChild(readOnlyReadout({
    label: 'Item 10 safety check',
    id: 'self-harm-readout',
    render: renderSelfHarmReadout
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Summary and score',
    description: 'Live EPDS total and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live EPDS total',
    id: 'live-score-readout',
    render: renderLiveScore
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, decisions, and any safeguarding or referral action already taken.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the live overall EPDS total and band. */
function renderLiveScore() {
  const grade = calculateEpdsGrade(state);
  const badge =
    `<span class="risk-badge ${bandClass(grade.band)}">${esc(bandLabel(grade.band))}</span>`;
  const missing = countMissingItems();
  const caveat = missing > 0
    ? ` <span class="muted">(${missing} item${missing === 1 ? '' : 's'} still unanswered)</span>`
    : '';
  return `<strong>${grade.totalScore} of 30</strong> ${badge}${caveat}`;
}

/** Render the current item-10 self-harm safety status. */
function renderSelfHarmReadout() {
  const grade = calculateEpdsGrade(state);
  if (state.items.item10 === null || state.items.item10 === undefined) {
    return `<span class="muted">Item 10 not yet answered.</span>`;
  }
  if (grade.selfHarmFlag) {
    return `<strong class="warn">Self-harm flag RAISED</strong> ` +
      `<span class="muted">(item 10 score ${grade.item10Score} of 3) — an immediate self-harm risk assessment is required, regardless of the total.</span>`;
  }
  return `<strong class="ok">No self-harm response recorded</strong> <span class="muted">(item 10 = "Never")</span>`;
}

function countMissingItems() {
  let missing = 0;
  for (let i = 1; i <= 10; i++) {
    const v = state.items[`item${i}`];
    if (v === null || v === undefined || v === '') missing++;
  }
  return missing;
}

function refreshLiveScore() {
  const sh = document.getElementById('self-harm-readout');
  if (sh) sh.innerHTML = renderSelfHarmReadout();
  const live = document.getElementById('live-score-readout');
  if (live) live.innerHTML = renderLiveScore();
}

// ----------------------------------------------------------------------
// Progress (step-centric)
// ----------------------------------------------------------------------

// Each step owns a list of slots. A slot is a list of [section, field] pairs;
// it counts as answered when ANY of its fields is answered. Progress is the
// fraction of answered slots across all steps.
const STEPS = [
  {
    step: 1, section: 'context', title: 'Context',
    slots: [
      [['context', 'clinicianName']],
      [['context', 'clinicianRole']],
      [['context', 'careSetting']],
      [['context', 'assessedAt']],
      [['context', 'perinatalStage']],
      [['context', 'perinatalWeek']]
    ]
  },
  {
    step: 2, section: 'identification', title: 'Respondent',
    slots: [
      [['identification', 'respondentIdentifier']],
      [['identification', 'ageBand']],
      [['identification', 'preferredLanguage']],
      [['identification', 'assistanceNeeded']]
    ]
  },
  {
    step: 3, section: 'items', title: 'Items 1-4',
    slots: [
      [['items', 'item1']], [['items', 'item2']],
      [['items', 'item3']], [['items', 'item4']]
    ]
  },
  {
    step: 4, section: 'items', title: 'Items 5-9',
    slots: [
      [['items', 'item5']], [['items', 'item6']], [['items', 'item7']],
      [['items', 'item8']], [['items', 'item9']]
    ]
  },
  {
    step: 5, section: 'items', title: 'Item 10',
    slots: [[['items', 'item10']]]
  },
  {
    step: 6, section: 'note', title: 'Summary',
    slots: [[['note', 'clinicalNote']]]
  }
];

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  let total = 0;
  const stepAnswered = {};
  const stepTotal = {};

  for (const def of STEPS) {
    stepTotal[def.step] = def.slots.length;
    stepAnswered[def.step] = 0;
    for (const slot of def.slots) {
      total++;
      const slotAnswered = slot.some(([s, f]) => isAnswered(s, f));
      if (slotAnswered) {
        answered++;
        stepAnswered[def.step]++;
      }
    }
  }

  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(stepAnswered, stepTotal);
}

// ----------------------------------------------------------------------
// Submit / Report
// ----------------------------------------------------------------------

function priorityClass(priority) {
  switch (priority) {
    case 'urgent': return 'flag-urgent';
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
    itemScores, totalScore, band, item10Score, selfHarmFlag,
    flaggedIssues, timestamp
  } = lastResult;

  const itemRows = epdsItems.map((item, i) => {
    const raw = state.items[item.field];
    const answered = raw !== null && raw !== undefined;
    const responseText = answered ? item.options[raw] : 'Not recorded';
    const score = answered ? itemScores[i] : null;
    const scoreCell = score === null ? '—' : `${score}`;
    return `
      <tr${item.number === 10 && selfHarmFlag ? ' class="row-critical"' : ''}>
        <th scope="row">${item.number}. ${esc(item.statement)}</th>
        <td>${esc(responseText)}</td>
        <td class="num"><span class="grade-pill">${scoreCell}</span></td>
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

  const selfHarmBanner = selfHarmFlag
    ? `<div class="alert" data-type="error" role="alert">
         <strong>Self-harm safety flag raised.</strong> Item 10 scored
         ${item10Score} of 3. Perform an <strong>immediate suicide / self-harm
         risk assessment</strong> and take appropriate safeguarding action now —
         this is required regardless of the total score.
       </div>`
    : '';

  const bandAction =
    band === 'likely'
      ? `<p>Total <strong>${totalScore} of 30</strong> is at or above the specific threshold (<strong>&ge; 13</strong>) — <strong>likely depression</strong>. Arrange assessment by an appropriately qualified clinician and refer per the local perinatal mental-health pathway. The EPDS is a screen, not a diagnosis.</p>`
      : band === 'possible'
        ? `<p>Total <strong>${totalScore} of 30</strong> is at or above the sensitive threshold (<strong>&ge; 10</strong>) — <strong>possible depression</strong>. Arrange further assessment / clinical review and repeat the EPDS in 2-4 weeks, or refer per the local pathway.</p>`
        : `<p>Total <strong>${totalScore} of 30</strong> is below the screening threshold — <strong>lower likelihood</strong>. Continue routine care and re-screen at the next scheduled contact. A low score does not exclude depression, and item 10 must always be reviewed regardless of the total.</p>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>EPDS Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      ${selfHarmBanner}

      <div class="risk-banner ${bandClass(band)}">
        <div>
          <span class="risk-banner-label">EPDS total</span>
          <span class="risk-banner-value">${totalScore} of 30</span>
        </div>
        <span class="risk-badge ${bandClass(band)}">${esc(bandLabel(band))}</span>
      </div>

      <h3>Item responses</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Item (past 7 days)</th>
            <th scope="col">Response</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <h3>Recommended action</h3>
      ${bandAction}

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
  const grade = calculateEpdsGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    itemScores: grade.itemScores,
    totalScore: grade.totalScore,
    band: grade.band,
    item10Score: grade.item10Score,
    selfHarmFlag: grade.selfHarmFlag,
    firedItems: grade.firedItems,
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
  refreshLiveScore();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

function renderStepList() {
  const ol = document.getElementById('step-list');
  if (!ol) return;
  ol.innerHTML = '';
  for (const def of STEPS) {
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

function updateStepListStatuses(stepAnswered, stepTotal) {
  const ol = document.getElementById('step-list');
  if (!ol) return;
  let firstUnfinished = -1;
  for (const def of STEPS) {
    const li = ol.querySelector(`[data-step="${def.step}"]`);
    if (!li) continue;
    const a = stepAnswered[def.step] || 0;
    const t = stepTotal[def.step] || 0;
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
  if (firstUnfinished === -1) firstUnfinished = STEPS[0].step;
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  refreshLiveScore();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
