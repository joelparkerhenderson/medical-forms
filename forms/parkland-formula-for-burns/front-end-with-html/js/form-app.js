import { detectFlaggedIssues } from './flags.js';
import { calculateParkland, roundOne } from './grader.js';
import { emptyAssessment, priorityLabel } from './types.js';

// Parkland Formula for Burns — single-page wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// resuscitation readout (total 24 h volume, phase volumes, and hourly rates)
// updates as body weight, %TBSA, and the injury/assessment times are entered.
// Submission runs the pure Parkland engine (total volume, phase split, offset
// rates, urine-output target, flagged issues) and renders an inline report.
// State is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'parkland-formula-for-burns.front-end-with-html.v1';

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
  slug: 'parkland-formula-for-burns',
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
    updateConditionalSections();
    refreshLiveResult();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 7;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-result readout after each change.
 *
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshLiveResult();
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

/** Format a millilitre volume for display, or a dash when null. */
function fmtMl(n) {
  return (n === null || n === undefined) ? '—' : `${roundOne(n)} mL`;
}

/** Format an hourly infusion rate; null with a plan means the phase is overdue. */
function fmtRate(n, overdue) {
  if (n === null || n === undefined) {
    return overdue ? 'Overdue — give now' : '—';
  }
  return `${roundOne(n)} mL/h`;
}

/** Format an hours value for display, or a dash when null. */
function fmtHours(n) {
  return (n === null || n === undefined) ? '—' : `${roundOne(n)} h`;
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

function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field radio-fieldset';
  wrapper.id = `${groupId}-fieldset`;
  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  if (opts.required) legend.setAttribute('data-required', '');
  wrapper.appendChild(legend);
  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', `${groupId}-fieldset`);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    const requiredAttr = opts.required ? ' data-required' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}${requiredAttr}>
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
// Section renderers (1 per wizard step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is assessing, when, and where. The assessment time is used with the time of injury to offset the resuscitation schedule.'
  });

  card.appendChild(textInput({
    label: 'Assessing clinician name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. Dr A. Khan'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'doctor', label: 'Doctor' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'paramedic', label: 'Paramedic' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of assessment',
    section: 'context', field: 'assessedAt', type: 'datetime-local',
    hint: 'Used with the time of injury to compute hours elapsed and the remaining first-8-h window.'
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'careSetting', required: true,
    options: [
      { value: 'emergency-department', label: 'Emergency department' },
      { value: 'burns-unit', label: 'Burns unit' },
      { value: 'intensive-care', label: 'Intensive care' },
      { value: 'retrieval', label: 'Retrieval / transfer' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age band, and sex. The age band selects the major-burn referral threshold (adult 15%, child 10%).'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. ED-100482 or hospital MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    hint: 'Selects the major-burn referral threshold: adult ≥ 15% TBSA, child ≥ 10% TBSA.',
    options: [
      { value: 'adult', label: 'Adult' },
      { value: 'child', label: 'Child' }
    ]
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

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Weight',
    description: 'Calculation input 1 — the patient body weight in kilograms.'
  });

  card.appendChild(textInput({
    label: 'Body weight',
    section: 'weight', field: 'weightKg', required: true,
    type: 'number', min: 0, max: 400, step: 0.1, unit: 'kg',
    hint: 'Use the estimated or measured body weight. The Parkland volume scales directly with weight.'
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Burn extent',
    description: 'Calculation input 2 — %TBSA burned (partial-thickness or deeper). Superficial (epidermal) burns are excluded.'
  });

  card.appendChild(textInput({
    label: 'Percentage total body surface area burned',
    section: 'burn', field: 'tbsaPercent', required: true,
    type: 'number', min: 0, max: 100, step: 0.5, unit: '% TBSA',
    hint: 'Partial-thickness or deeper only; exclude simple erythema. Estimate by Rule of Nines or Lund–Browder.'
  }));
  card.appendChild(selectInput({
    label: 'Estimation method',
    section: 'burn', field: 'tbsaMethod',
    options: [
      { value: 'rule-of-nines', label: 'Wallace Rule of Nines' },
      { value: 'lund-browder', label: 'Lund–Browder chart' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(readOnlyReadout({
    label: 'Live resuscitation plan',
    id: 'extent-preview-readout',
    render: () => renderLiveResult()
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Time of injury',
    description: 'Calculation input 3 — when the burn occurred. The 8 h / 16 h phase split is measured from this instant, so any delay shortens the first-phase window.'
  });

  card.appendChild(textInput({
    label: 'Date and time the burn occurred',
    section: 'injury', field: 'injuryAt', type: 'datetime-local', required: true,
    hint: 'The first-8-h volume must still be delivered by the 8 h mark from injury.'
  }));
  card.appendChild(selectInput({
    label: 'Is the time of injury known or estimated?',
    section: 'injury', field: 'injuryTimeKnown',
    options: [
      { value: 'known', label: 'Known' },
      { value: 'estimated', label: 'Estimated' }
    ]
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Injury features',
    description: 'Features that drive the safety flags but not the arithmetic: airway risk, escharotomy risk, and mechanism.'
  });

  card.appendChild(radioGroup({
    label: 'Is inhalation / airway injury suspected?',
    section: 'features', field: 'inhalationSuspected', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Is a circumferential or deep burn present?',
    section: 'features', field: 'circumferentialOrDeep', options: yesNo
  }));
  card.appendChild(selectInput({
    label: 'Burn mechanism',
    section: 'features', field: 'mechanism',
    options: [
      { value: 'thermal', label: 'Thermal' },
      { value: 'electrical', label: 'Electrical' },
      { value: 'chemical', label: 'Chemical' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Summary and plan',
    description: 'Computed total, phase volumes and rates, time offset, urine-output target, and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Live resuscitation plan',
    id: 'live-result-readout',
    render: () => renderLiveResult()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: pre-hospital fluids already given, airway status, transfer plan, and any escalation already actioned.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the live Parkland plan: total, phase volumes, and hourly rates. */
function renderLiveResult() {
  const grade = calculateParkland(state);
  if (grade.total24hVolumeMl === null) {
    return `<span class="muted">Awaiting body weight and %TBSA.</span>`;
  }
  const overdue = grade.first8hVolumeMl !== null && grade.remainingFirst8hHours <= 0;
  return `
    <div class="readout-line"><strong>Total 24 h:</strong> ${fmtMl(grade.total24hVolumeMl)}</div>
    <div class="readout-line"><strong>First 8 h:</strong> ${fmtMl(grade.first8hVolumeMl)} at ${fmtRate(grade.first8hRateMlPerHour, overdue)}</div>
    <div class="readout-line"><strong>Next 16 h:</strong> ${fmtMl(grade.next16hVolumeMl)} at ${fmtRate(grade.next16hRateMlPerHour, false)}</div>
    <div class="readout-line"><strong>Since injury:</strong> ${fmtHours(grade.hoursSinceInjury)} (remaining first-phase window ${fmtHours(grade.remainingFirst8hHours)})</div>
  `;
}

function refreshLiveResult() {
  const preview = document.getElementById('extent-preview-readout');
  if (preview) preview.innerHTML = renderLiveResult();
  const live = document.getElementById('live-result-readout');
  if (live) live.innerHTML = renderLiveResult();
}

// ----------------------------------------------------------------------
// Conditional sections (none currently, but kept for parity + future use)
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = state[section]?.[field];
    host.style.display = String(current) === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered.
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['careSetting']],
  identification: [['patientIdentifier'], ['ageBand'], ['sex']],
  weight: [['weightKg']],
  burn: [['tbsaPercent'], ['tbsaMethod']],
  injury: [['injuryAt'], ['injuryTimeKnown']],
  features: [['inhalationSuspected'], ['circumferentialOrDeep'], ['mechanism']],
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

/** Colour band for the result banner: red when overdue or any high flag fires. */
function bannerClass(grade, flaggedIssues) {
  if (grade.total24hVolumeMl === null) return '';
  const anyHigh = flaggedIssues.some((f) => f.priority === 'high');
  return anyHigh ? 'risk-high' : 'risk-low';
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const grade = lastResult;
  const flaggedIssues = grade.flaggedIssues;

  const weightKg = state.weight.weightKg;
  const tbsaPercent = state.burn.tbsaPercent;
  const overdue = grade.first8hVolumeMl !== null && grade.remainingFirst8hHours <= 0;

  const inputRows = [
    ['Body weight', weightKg === null ? 'Not recorded' : `${weightKg} kg`],
    ['%TBSA burned', tbsaPercent === null ? 'Not recorded' : `${tbsaPercent}%`],
    ['Parkland coefficient', '4 mL/kg/%TBSA'],
    ['Total 24 h volume', fmtMl(grade.total24hVolumeMl)],
    ['First 8 h volume', fmtMl(grade.first8hVolumeMl)],
    ['First 8 h rate', fmtRate(grade.first8hRateMlPerHour, overdue)],
    ['Next 16 h volume', fmtMl(grade.next16hVolumeMl)],
    ['Next 16 h rate', fmtRate(grade.next16hRateMlPerHour, false)],
    ['Hours since injury', fmtHours(grade.hoursSinceInjury)],
    ['Remaining first-8-h window', fmtHours(grade.remainingFirst8hHours)],
    ['Urine-output target',
      (grade.targetUrineOutputLowMlPerHour === null)
        ? 'Not computed'
        : `${roundOne(grade.targetUrineOutputLowMlPerHour)}–${roundOne(grade.targetUrineOutputHighMlPerHour)} mL/h (0.5–1.0 mL/kg/h)`]
  ].map(([name, value]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
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

  let interpretation;
  if (grade.total24hVolumeMl === null) {
    interpretation = `<p>The resuscitation plan could not be computed because body weight and/or %TBSA is missing. Record both, then re-calculate.</p>`;
  } else if (overdue) {
    interpretation = `<p>More than 8 hours have elapsed since the injury: the <strong>first-phase window is overdue</strong>. Give the outstanding first-phase volume (${fmtMl(grade.first8hVolumeMl)}) as a priority now, then continue the second phase at ${fmtRate(grade.next16hRateMlPerHour, false)} and re-plan against the 24 h total. This is a starting estimate only — titrate to a urine output of 0.5–1.0 mL/kg/h (adults).</p>`;
  } else {
    interpretation = `<p>Start crystalloid (Hartmann's / lactated Ringer's) at <strong>${fmtRate(grade.first8hRateMlPerHour, overdue)}</strong> to deliver ${fmtMl(grade.first8hVolumeMl)} within the remaining first-8-h window from injury, then ${fmtRate(grade.next16hRateMlPerHour, false)} to deliver ${fmtMl(grade.next16hVolumeMl)} over the next 16 h. This is a starting estimate only — titrate to a urine output of 0.5–1.0 mL/kg/h (adults) and adjust.</p>`;
  }

  const band = bannerClass(grade, flaggedIssues);

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Parkland Resuscitation Plan</h2>
        <p class="muted">Generated ${esc(new Date(grade.timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${band}">
        <div>
          <span class="risk-banner-label">Total 24 h crystalloid</span>
          <span class="risk-banner-value">${fmtMl(grade.total24hVolumeMl)}</span>
        </div>
        <span class="risk-badge ${band}">${overdue ? 'First phase overdue' : (grade.total24hVolumeMl === null ? 'Incomplete' : 'Plan ready')}</span>
      </div>

      <h3>Calculation</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>${inputRows}</tbody>
      </table>

      <h3>Interpretation</h3>
      ${interpretation}

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
  const grade = calculateParkland(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    total24hVolumeMl: grade.total24hVolumeMl,
    first8hVolumeMl: grade.first8hVolumeMl,
    next16hVolumeMl: grade.next16hVolumeMl,
    hoursSinceInjury: grade.hoursSinceInjury,
    remainingFirst8hHours: grade.remainingFirst8hHours,
    first8hRateMlPerHour: grade.first8hRateMlPerHour,
    next16hRateMlPerHour: grade.next16hRateMlPerHour,
    targetUrineOutputLowMlPerHour: grade.targetUrineOutputLowMlPerHour,
    targetUrineOutputHighMlPerHour: grade.targetUrineOutputHighMlPerHour,
    firedRules: grade.firedRules,
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
  updateConditionalSections();
  refreshLiveResult();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'identification', title: 'Patient' },
  { step: 3, section: 'weight',         title: 'Weight' },
  { step: 4, section: 'burn',           title: 'Burn extent' },
  { step: 5, section: 'injury',         title: 'Time of injury' },
  { step: 6, section: 'features',       title: 'Injury features' },
  { step: 7, section: 'note',           title: 'Summary and plan' }
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
  host.appendChild(renderStep6());
  host.appendChild(renderStep7());
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveResult();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
