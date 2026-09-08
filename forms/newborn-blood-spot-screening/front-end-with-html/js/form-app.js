import { gradeBloodspot } from './grader.js';
import { CONDITIONS, computeAgeAtSampleDays, emptyAssessment, overallOutcomeBadge, overallOutcomeLabel, referralStatusLabel, resultClassBadge, resultClassLabel } from './types.js';

// Newborn Blood Spot Screening — sample-taker / laboratory wizard
// (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page progress
// summary reflects how many fields have been answered, and the final step
// shows a live overall-outcome readout. Submission runs the pure classification
// engine (per-condition result, overall outcome, referral status, sample
// quality, flagged issues) and renders an inline report. State is persisted to
// localStorage so a partial fill survives a page reload.

const TOTAL_STEPS = 7;

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'newborn-blood-spot-screening.front-end-with-html.v1';

/** @returns {import('./types.js').ScreeningData} */
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
    console.warn('Could not parse saved screening; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').ScreeningData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save screening to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored screening.', e);
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

/** @type {import('./types.js').ScreeningData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'newborn-blood-spot-screening',
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
    updateConditionalSections();
    refreshAutoCalculatedReadouts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function setField(section, field, value) {
  state[section][field] = value;
  recomputeDerived();
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
}

/** Recompute auto-calculated values that depend on other fields. */
function recomputeDerived() {
  state.sampleEvent.ageAtSampleDays = computeAgeAtSampleDays(
    state.babyId.dateOfBirth,
    state.sampleEvent.sampleDate
  );
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
  ta.addEventListener('input', () => { setField(opts.section, opts.field, ta.value); clearFieldError(id); });
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
  sel.addEventListener('change', () => { setField(opts.section, opts.field, sel.value); clearFieldError(id); });
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
// Option vocabularies
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

/** Per-condition result-class options; carrier only where valid (SCD). */
function resultOptions(includeCarrier) {
  const opts = [
    { value: 'not-suspected', label: 'Not suspected' },
    { value: 'suspected', label: 'Suspected' }
  ];
  if (includeCarrier) opts.push({ value: 'carrier', label: 'Carrier' });
  opts.push(
    { value: 'repeat-required', label: 'Repeat required' },
    { value: 'declined', label: 'Declined' },
    { value: 'pending', label: 'Pending' }
  );
  return opts;
}

// ----------------------------------------------------------------------
// Section renderers (1 per step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Sample-taker and setting',
    description: 'Who took and recorded the sample, and where.'
  });

  card.appendChild(textInput({
    label: 'Sample-taker name', section: 'sampleTaker', field: 'sampleTakerName', required: true
  }));
  card.appendChild(selectInput({
    label: 'Sample-taker role', section: 'sampleTaker', field: 'sampleTakerRole', required: true,
    options: [
      { value: 'midwife', label: 'Midwife' },
      { value: 'health-visitor', label: 'Health visitor' },
      { value: 'neonatal-nurse', label: 'Neonatal nurse' },
      { value: 'laboratory', label: 'Laboratory' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Care setting', section: 'sampleTaker', field: 'careSetting', required: true,
    options: [
      { value: 'community', label: 'Community' },
      { value: 'home', label: 'Home' },
      { value: 'neonatal-unit', label: 'Neonatal unit' },
      { value: 'hospital', label: 'Hospital' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Record date', section: 'sampleTaker', field: 'recordDate', type: 'date'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Baby identification',
    description: 'The newborn this screening documents.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'NHS number', section: 'babyId', field: 'nhsNumber', required: true,
    placeholder: 'NNN NNN NNNN'
  }));
  grid.appendChild(textInput({
    label: 'Baby name', section: 'babyId', field: 'babyName',
    placeholder: 'May be provisional'
  }));
  card.appendChild(grid);

  const dob = document.createElement('div');
  dob.className = 'two-col';
  dob.appendChild(textInput({
    label: 'Date of birth (day 0)', section: 'babyId', field: 'dateOfBirth', type: 'date', required: true
  }));
  dob.appendChild(textInput({
    label: 'Time of birth', section: 'babyId', field: 'timeOfBirth', type: 'time'
  }));
  card.appendChild(dob);

  card.appendChild(radioGroup({
    label: 'Sex', section: 'babyId', field: 'sex',
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'indeterminate', label: 'Indeterminate' },
      { value: 'not-recorded', label: 'Not recorded' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Gestation at birth', section: 'babyId', field: 'gestationWeeks',
    type: 'number', min: 22, max: 45, step: 0.1, unit: 'weeks'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Eligibility and consent',
    description: 'Previous screening, parental consent, and any decline.'
  });

  card.appendChild(radioGroup({
    label: 'Previously screened?', section: 'eligibility', field: 'previouslyScreened',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Parental consent to screen given?', section: 'eligibility', field: 'consentGiven', required: true,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'partial', label: 'Partial (some conditions declined)' }
    ]
  }));

  const declineHost = document.createElement('div');
  declineHost.dataset.conditionalAny = 'eligibility.consentGiven=no,partial';
  declineHost.appendChild(textArea({
    label: 'Reason for decline', section: 'eligibility', field: 'declineReason',
    placeholder: 'Reason where screening for any condition was declined'
  }));
  card.appendChild(declineHost);

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Sample event',
    description: 'When and where the heel-prick was taken.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Sample date', section: 'sampleEvent', field: 'sampleDate', type: 'date', required: true
  }));
  grid.appendChild(textInput({
    label: 'Sample time', section: 'sampleEvent', field: 'sampleTime', type: 'time'
  }));
  card.appendChild(grid);

  card.appendChild(readOnlyReadout({
    label: 'Age at sample',
    id: 'age-readout',
    render: () => renderAgeReadout()
  }));

  card.appendChild(radioGroup({
    label: 'Sampling site', section: 'sampleEvent', field: 'samplingSite',
    options: [
      { value: 'heel', label: 'Heel' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Sample-taker notes', section: 'sampleEvent', field: 'sampleNotes',
    placeholder: 'Free-text note about the sample event'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Sample quality',
    description: 'Adequacy, blood-spot quality, and repeat status.'
  });

  card.appendChild(radioGroup({
    label: 'Sample adequacy', section: 'sampleQuality', field: 'sampleAdequacy', required: true,
    options: [
      { value: 'adequate', label: 'Adequate' },
      { value: 'inadequate', label: 'Inadequate' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Blood-spot quality issue', section: 'sampleQuality', field: 'spotQualityIssue',
    options: [
      { value: 'none', label: 'None' },
      { value: 'insufficient', label: 'Insufficient sample' },
      { value: 'compressed', label: 'Compressed spots' },
      { value: 'layered', label: 'Layered spots' },
      { value: 'contaminated', label: 'Contaminated' },
      { value: 'incomplete-circles', label: 'Incompletely filled circles' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Is this a repeat sample?', section: 'sampleQuality', field: 'isRepeat', options: yesNo
  }));

  const repeatHost = document.createElement('div');
  repeatHost.dataset.conditional = 'sampleQuality.isRepeat=yes';
  repeatHost.appendChild(selectInput({
    label: 'Reason for repeat', section: 'sampleQuality', field: 'repeatReason', required: true,
    options: [
      { value: 'not-applicable', label: 'Not applicable' },
      { value: 'borderline-result', label: 'Borderline result' },
      { value: 'inadequate-sample', label: 'Inadequate sample' },
      { value: 'too-early', label: 'Taken too early' },
      { value: 'technical', label: 'Technical / card fault' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(repeatHost);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Condition results',
    description: 'Per-condition result class for all nine screened conditions.'
  });

  for (const c of CONDITIONS) {
    card.appendChild(selectInput({
      label: `${c.label} (${c.short})`,
      section: 'conditions',
      field: c.field,
      options: resultOptions(c.carrierValid)
    }));
  }

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Summary and outcome',
    description: 'Computed overall outcome and free-text clinical note.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Overall screening outcome (live)',
    id: 'outcome-readout',
    render: () => renderOutcomeReadout()
  }));

  card.appendChild(textArea({
    label: 'Clinical note', section: 'summary', field: 'clinicalContext',
    placeholder: 'Optional free-text clinical context shown in the summary'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections + auto-calculated readouts
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = state[section]?.[field];
    host.style.display = String(current) === target ? '' : 'none';
  });
  document.querySelectorAll('[data-conditional-any]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-any');
    const [path, targetCsv] = expr.split('=');
    const [section, field] = path.split('.');
    const current = String(state[section]?.[field] ?? '');
    const targets = targetCsv.split(',');
    host.style.display = targets.includes(current) ? '' : 'none';
  });
}

function renderAgeReadout() {
  const age = state.sampleEvent.ageAtSampleDays;
  if (age == null) {
    return '<span class="muted">Auto-calculated from date of birth and sample date</span>';
  }
  const inWindow = age >= 5 && age <= 8;
  const cls = inWindow ? 'ok' : 'warn';
  const note = inWindow
    ? '<span class="ok">(within day 5–8 window)</span>'
    : '<span class="warn">(outside day 5–8 window)</span>';
  return `<strong class="${cls}">Day ${age}</strong> ${note}`;
}

function renderOutcomeReadout() {
  const r = gradeBloodspot(state);
  const badge = overallOutcomeBadge(r.overallOutcome);
  const outcome = overallOutcomeLabel(r.overallOutcome);
  const status = referralStatusLabel(r.referralStatus);
  return (
    `<span class="risk-badge ${badge}">${esc(outcome)}</span>` +
    ` <span class="muted">${esc(status)}</span>`
  );
}

function refreshAutoCalculatedReadouts() {
  const age = document.getElementById('age-readout');
  if (age) age.innerHTML = renderAgeReadout();
  const outcome = document.getElementById('outcome-readout');
  if (outcome) outcome.innerHTML = renderOutcomeReadout();
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  ['sampleTaker', 'sampleTakerName'],
  ['sampleTaker', 'sampleTakerRole'],
  ['sampleTaker', 'careSetting'],
  ['sampleTaker', 'recordDate'],
  ['babyId', 'nhsNumber'],
  ['babyId', 'dateOfBirth'],
  ['babyId', 'sex'],
  ['babyId', 'gestationWeeks'],
  ['eligibility', 'previouslyScreened'],
  ['eligibility', 'consentGiven'],
  ['sampleEvent', 'sampleDate'],
  ['sampleEvent', 'samplingSite'],
  ['sampleQuality', 'sampleAdequacy'],
  ['sampleQuality', 'spotQualityIssue'],
  ['sampleQuality', 'isRepeat'],
  ['conditions', 'scdResult'],
  ['conditions', 'cfResult'],
  ['conditions', 'chtResult'],
  ['conditions', 'pkuResult'],
  ['conditions', 'mcaddResult'],
  ['conditions', 'msudResult'],
  ['conditions', 'ivaResult'],
  ['conditions', 'ga1Result'],
  ['conditions', 'hcuResult'],
  ['summary', 'clinicalContext']
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
    ageAtSampleDays, conditionResults, referrals,
    overallOutcome, referralStatus, sampleQuality, flaggedIssues, timestamp
  } = lastResult;

  const conditionRows = conditionResults.map((c) => {
    const label = resultClassLabel(c.result);
    const badge = resultClassBadge(c.result);
    return `
      <tr>
        <th scope="row">${esc(c.short)}</th>
        <td>${esc(c.label)}</td>
        <td><span class="risk-badge ${badge}">${esc(label)}</span></td>
        <td>${c.result === 'suspected' ? esc(c.referralTarget) : '<span class="muted">—</span>'}</td>
      </tr>
    `;
  }).join('');

  const referralsBlock = referrals.length === 0
    ? `<p class="muted">No urgent referrals — no condition is suspected.</p>`
    : `
      <ul class="flags">
        ${referrals.map((r) => `
          <li class="flag-urgent">
            <span class="flag-priority">URGENT</span>
            <span class="flag-category">${esc(r.code.toUpperCase())}</span>
            <span class="flag-message">Refer to ${esc(r.service)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No flagged issues raised.</p>`
    : `
      <ul class="flags">
        ${flaggedIssues.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.message)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const ageText = ageAtSampleDays == null
    ? 'Not calculated'
    : `Day ${ageAtSampleDays}`;

  const clinicalNote = state.summary.clinicalContext
    ? `<h3>Clinical note</h3><p>${esc(state.summary.clinicalContext)}</p>`
    : '';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Newborn Blood Spot Screening Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${overallOutcomeBadge(overallOutcome)}">
        <span class="risk-banner-label">Overall outcome</span>
        <span class="risk-banner-value">${esc(overallOutcomeLabel(overallOutcome))}</span>
        <span class="risk-banner-label">${esc(referralStatusLabel(referralStatus))}</span>
      </div>

      <h3>Sample quality</h3>
      <table class="subscales">
        <tbody>
          <tr><th scope="row">Age at sample</th><td>${esc(ageText)}</td></tr>
          <tr><th scope="row">Within day 5–8 window</th><td>${sampleQuality.withinWindow ? 'Yes' : 'No'}</td></tr>
          <tr><th scope="row">Sample adequate</th><td>${sampleQuality.adequate ? 'Yes' : 'No'}</td></tr>
          <tr><th scope="row">Avoidable repeat</th><td>${sampleQuality.avoidableRepeat ? 'Yes' : 'No'}</td></tr>
        </tbody>
      </table>

      <h3>Condition results (${conditionResults.length})</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Code</th>
            <th scope="col">Condition</th>
            <th scope="col">Result</th>
            <th scope="col">Referral target</th>
          </tr>
        </thead>
        <tbody>${conditionRows}</tbody>
      </table>

      <h3>Referrals (${referrals.length})</h3>
      ${referralsBlock}

      <h3>Flagged issues (${flaggedIssues.length})</h3>
      ${flagsList}

      ${clinicalNote}

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
  recomputeDerived();
  lastResult = gradeBloodspot(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh screening record?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'sampleTaker',   title: 'Sample-taker' },
  { step: 2, section: 'babyId',        title: 'Baby' },
  { step: 3, section: 'eligibility',   title: 'Eligibility' },
  { step: 4, section: 'sampleEvent',   title: 'Sample event' },
  { step: 5, section: 'sampleQuality', title: 'Sample quality' },
  { step: 6, section: 'conditions',    title: 'Condition results' },
  { step: 7, section: 'summary',       title: 'Summary' }
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
    // Skip fields inside a hidden conditional host.
    const hiddenHost = input.closest('[data-conditional], [data-conditional-any]');
    if (hiddenHost && hiddenHost.style.display === 'none') {
      clearFieldError(id);
      return;
    }
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
  recomputeDerived();
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
