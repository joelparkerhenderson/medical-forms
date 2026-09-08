import { detectFlaggedIssues } from './flags.js';
import { calculateZaritGrade } from './grader.js';
import { RESPONSE_SCALE, activeItemNumbers, maxScoreFor, zaritItems } from './rules.js';
import { bandClass, bandLabel, emptyAssessment, instrumentFormLabel, priorityLabel } from './types.js';

// Zarit Burden Interview (ZBI) — caregiver-burden wizard (vanilla JavaScript,
// no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The carer scrolls through the twenty-two items; a sticky
// top-of-page progress summary reflects how many fields are answered and a live
// ZBI total and burden band update as items are chosen. Each item is scored
// transparently — the 0-4 frequency options show the points they contribute.
// An instrument-form selector chooses the full ZBI-22 (all 22 items, 0-88) or
// the validated ZBI-12 short form (12 items, 0-48; high-burden cut-off >= 17).
// Submission runs the pure scoring engine (per-item ratings, total, burden
// band, flagged issues) and renders an inline report. State is persisted to
// localStorage so a partial fill survives a page reload.
//
// The ZBI measures the carer's own perceived burden; it is a screen prompting
// carer support, respite, and mental-health screening, not a diagnosis of the
// carer nor an assessment of the care recipient.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'zarit-burden-interview.front-end-with-html.v1';

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
  slug: 'zarit-burden-interview',
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

const TOTAL_STEPS = 5;

/** Current instrument form, defaulting to the full ZBI-22. */
function currentForm() {
  return state.context.instrumentForm === 'zbi12' ? 'zbi12' : 'zbi22';
}

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

  const placeholderOption = opts.noPlaceholder
    ? ''
    : `<option value="">— Select —</option>`;
  const optionsHtml = [
    placeholderOption,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${opts.required ? ' required data-required' : ''}>
      ${optionsHtml}
    </select>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => {
    if (opts.onChange) {
      opts.onChange(sel.value);
    } else {
      setField(opts.section, opts.field, sel.value);
    }
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Render one ZBI item as a radio group. The five options are the shared 0-4
 * frequency scale; the raw rating is stored in state, and each option label
 * shows the points it contributes so the scoring is transparent. Items in the
 * ZBI-12 short-form subset carry a badge; when the ZBI-12 form is selected,
 * items outside the subset are marked as not scored.
 *
 * @param {import('./rules.js').ZaritItem} item
 */
function itemField(item) {
  const groupId = `items-${item.field}`;
  const current = state.items[item.field];
  const inShortForm = item.shortForm;
  const scored = currentForm() === 'zbi22' || inShortForm;

  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field radio-fieldset';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  const badges =
    (inShortForm ? '<span class="muted"> [ZBI-12]</span>' : '') +
    (item.global ? '<span class="muted"> [global]</span>' : '') +
    (!scored ? '<span class="muted"> (not scored on ZBI-12)</span>' : '');
  legend.innerHTML =
    `<span class="section-step">Item ${item.number}${badges}</span>` +
    `<span class="section-title">${esc(item.statement)}</span>`;
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', `${groupId}-fieldset`);

  RESPONSE_SCALE.forEach((opt) => {
    const radioId = `${groupId}-${opt.value}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
    label.htmlFor = radioId;
    const checked = current === opt.value ? ' checked' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${opt.value}"${checked}>
      <span>${esc(opt.label)} <span class="muted">(${opt.value} ${opt.value === 1 ? 'point' : 'points'})</span></span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        setField('items', item.field, opt.value);
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
// Section renderers (1 per ZBI step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is administering the ZBI, where, when, and which instrument form is scored.'
  });

  card.appendChild(textInput({
    label: 'Administering practitioner name',
    section: 'context', field: 'practitionerName', required: true,
    placeholder: 'e.g. J. Okafor, carer-support worker'
  }));
  card.appendChild(selectInput({
    label: 'Practitioner role',
    section: 'context', field: 'practitionerRole', required: true,
    options: [
      { value: 'clinician', label: 'Clinician' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'social-care', label: 'Social-care practitioner' },
      { value: 'carer-support', label: 'Carer-support worker' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of assessment',
    section: 'context', field: 'assessedAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'careSetting', required: true,
    options: [
      { value: 'memory-service', label: 'Old-age / memory service' },
      { value: 'community', label: 'Community / district nursing' },
      { value: 'general-practice', label: 'General practice' },
      { value: 'social-care', label: 'Social care / carer support' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Instrument form',
    section: 'context', field: 'instrumentForm',
    noPlaceholder: true,
    hint: 'ZBI-22 scores all 22 items (0-88); ZBI-12 scores the 12-item short form (0-48; high-burden cut-off ≥ 17).',
    options: [
      { value: 'zbi22', label: 'ZBI-22 (full, 22 items, 0-88)' },
      { value: 'zbi12', label: 'ZBI-12 (short form, 12 items, 0-48)' }
    ],
    onChange: (value) => {
      state.context.instrumentForm = value === 'zbi12' ? 'zbi12' : 'zbi22';
      saveState(state);
      renderForm();
      updateProgress();
      refreshLiveScore();
    }
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Carer details',
    description: 'The informal (unpaid) carer completing the questionnaire.'
  });

  card.appendChild(textInput({
    label: 'Carer identifier',
    section: 'carer', field: 'carerIdentifier', required: true,
    placeholder: 'e.g. CARER-204815 or local reference'
  }));
  card.appendChild(selectInput({
    label: 'Relationship to the care recipient',
    section: 'carer', field: 'carerRelationship',
    options: [
      { value: 'spouse-partner', label: 'Spouse / partner' },
      { value: 'adult-child', label: 'Adult child' },
      { value: 'other-relative', label: 'Other relative' },
      { value: 'friend', label: 'Friend' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Carer lives with the care recipient',
    section: 'carer', field: 'carerCoResident',
    options: [
      { value: 'yes', label: 'Yes — co-resident' },
      { value: 'no', label: 'No' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Hours of care per week',
    section: 'carer', field: 'careHoursPerWeek',
    type: 'number', min: 0, max: 168, step: 0.5, unit: 'hours',
    hint: 'Approximate hours of care provided per week.'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Care recipient details',
    description: 'The person being cared for. This assessment does not grade their clinical condition.'
  });

  card.appendChild(textInput({
    label: 'Care recipient identifier',
    section: 'recipient', field: 'recipientIdentifier',
    placeholder: 'e.g. hospital MRN or local reference'
  }));
  card.appendChild(selectInput({
    label: 'Primary condition',
    section: 'recipient', field: 'recipientCondition',
    options: [
      { value: 'dementia', label: 'Dementia' },
      { value: 'chronic-illness', label: 'Chronic illness' },
      { value: 'disability', label: 'Disability' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep4() {
  const form = currentForm();
  const card = sectionCard({
    stepNumber: 4,
    title: 'Burden items',
    description:
      form === 'zbi12'
        ? 'Rate each item on the 0-4 frequency scale. Only the 12 short-form items (marked [ZBI-12]) count toward the ZBI-12 total; the rest may still be recorded.'
        : 'Rate each of the 22 items on the 0-4 frequency scale (0 = Never … 4 = Nearly always).'
  });
  zaritItems.forEach((item) => card.appendChild(itemField(item)));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Summary and score',
    description: 'Live ZBI total and burden band, plus a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live ZBI total',
    id: 'live-score-readout',
    render: renderLiveScore
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, decisions, and any carer-support, respite, or referral action already taken.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the live overall ZBI total and burden band. */
function renderLiveScore() {
  const grade = calculateZaritGrade(state);
  const badge =
    `<span class="risk-badge ${bandClass(grade.burdenBand)}">${esc(bandLabel(grade.burdenBand))}</span>`;
  const missing = countMissingActiveItems();
  const caveat = missing > 0
    ? ` <span class="muted">(${missing} active item${missing === 1 ? '' : 's'} still unanswered)</span>`
    : '';
  return `<strong>${grade.totalScore} of ${grade.maxScore}</strong> ${badge}` +
    ` <span class="muted">(${instrumentFormLabel(currentForm())})</span>${caveat}`;
}

function countMissingActiveItems() {
  let missing = 0;
  for (const n of activeItemNumbers(currentForm())) {
    const v = state.items[`item${n}`];
    if (v === null || v === undefined || v === '') missing++;
  }
  return missing;
}

function refreshLiveScore() {
  const live = document.getElementById('live-score-readout');
  if (live) live.innerHTML = renderLiveScore();
}

// ----------------------------------------------------------------------
// Progress (step-centric)
// ----------------------------------------------------------------------

// Each step owns a list of slots. A slot is a list of [section, field] pairs;
// it counts as answered when ANY of its fields is answered. Progress is the
// fraction of answered slots across all steps. The item slots depend on the
// selected instrument form (all 22 for ZBI-22, or the 12-item subset).
function buildSteps() {
  const itemSlots = activeItemNumbers(currentForm()).map((n) => [['items', `item${n}`]]);
  return [
    {
      step: 1, title: 'Context',
      slots: [
        [['context', 'practitionerName']],
        [['context', 'practitionerRole']],
        [['context', 'assessedAt']],
        [['context', 'careSetting']],
        [['context', 'instrumentForm']]
      ]
    },
    {
      step: 2, title: 'Carer',
      slots: [
        [['carer', 'carerIdentifier']],
        [['carer', 'carerRelationship']],
        [['carer', 'carerCoResident']],
        [['carer', 'careHoursPerWeek']]
      ]
    },
    {
      step: 3, title: 'Recipient',
      slots: [
        [['recipient', 'recipientIdentifier']],
        [['recipient', 'recipientCondition']]
      ]
    },
    { step: 4, title: 'Burden items', slots: itemSlots },
    { step: 5, title: 'Summary', slots: [[['note', 'clinicalNote']]] }
  ];
}

function isAnswered(section, field) {
  const v = state[section][field];
  // instrumentForm always has a value; count it as answered.
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  let total = 0;
  const stepAnswered = {};
  const stepTotal = {};

  for (const def of buildSteps()) {
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
    itemRatings, totalScore, maxScore, burdenBand,
    flaggedIssues, timestamp
  } = lastResult;

  const form = currentForm();
  const active = new Set(activeItemNumbers(form));

  const itemRows = zaritItems.map((item, i) => {
    const raw = itemRatings[i];
    const answered = raw !== null && raw !== undefined;
    const scaleLabel = answered
      ? (RESPONSE_SCALE.find((o) => o.value === raw) || {}).label
      : 'Not recorded';
    const scored = active.has(item.number);
    const scoreCell = !answered ? '—' : `${raw}`;
    return `
      <tr${!scored ? ' class="muted"' : ''}>
        <th scope="row">${item.number}. ${esc(item.statement)}${item.shortForm ? ' <span class="muted">[ZBI-12]</span>' : ''}</th>
        <td>${esc(scaleLabel)}${scored ? '' : ' <span class="muted">(not scored)</span>'}</td>
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

  const bandAction = renderBandAction(burdenBand, totalScore, maxScore, form);

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Zarit Burden Interview Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())} · ${esc(instrumentFormLabel(form))}</p>
      </header>

      <div class="risk-banner ${bandClass(burdenBand)}">
        <div>
          <span class="risk-banner-label">ZBI total</span>
          <span class="risk-banner-value">${totalScore} of ${maxScore}</span>
        </div>
        <span class="risk-badge ${bandClass(burdenBand)}">${esc(bandLabel(burdenBand))}</span>
      </div>

      <h3>Item ratings</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Item</th>
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

/** Band-specific narrative and recommended action. */
function renderBandAction(band, totalScore, maxScore, form) {
  const total = `<strong>${totalScore} of ${maxScore}</strong>`;
  switch (band) {
    case 'little-or-none':
      return `<p>Total ${total} is in the <strong>little or no burden</strong> band (0-21). Reassure and review; re-administer if circumstances change. A low score does not mean no support is needed — clinical judgement always applies.</p>`;
    case 'mild-to-moderate':
      return `<p>Total ${total} is in the <strong>mild to moderate burden</strong> band (22-40). Offer carer information and support; signpost respite and peer support; plan a review.</p>`;
    case 'moderate-to-severe':
      return `<p>Total ${total} is in the <strong>moderate to severe burden</strong> band (41-60). Arrange a carer-support assessment and respite; screen for depression and anxiety; review the care package.</p>`;
    case 'severe':
      return `<p>Total ${total} is in the <strong>severe burden</strong> band (61-88). Arrange urgent carer-support and respite planning; screen and refer for carer mental-health support; consider the risk to the caring arrangement.</p>`;
    case 'high':
      return `<p>Total ${total} is at or above the ZBI-12 high-burden cut-off (<strong>&ge; 17</strong>) — <strong>high burden</strong>. Arrange carer support and respite and screen the carer for depression and anxiety. The ZBI is a screen, not a diagnosis.</p>`;
    case 'lower':
      return `<p>Total ${total} is below the ZBI-12 high-burden cut-off (< 17) — <strong>lower burden</strong>. Continue routine support and re-administer if circumstances change. A low score does not exclude a need for support.</p>`;
    default:
      return '';
  }
}

function submitForm() {
  const _errors = validateForm();
  if (_errors.length > 0) return;
  const grade = calculateZaritGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    itemRatings: grade.itemRatings,
    totalScore: grade.totalScore,
    maxScore: grade.maxScore,
    burdenBand: grade.burdenBand,
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
  for (const def of buildSteps()) {
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
  for (const def of buildSteps()) {
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
  if (firstUnfinished === -1) firstUnfinished = 1;
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
  refreshLiveScore();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
