import { calculateGrade } from './grader.js';
import { emptyResponse, followUpUrgencyLabel, legalRiskBandLabel, outcomeClassificationLabel, overallDecisionLabel, responseStatusLabel } from './types.js';

// Neurodiversity Adjustment Response — employer-reply wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page progress
// summary reflects how many fields have been answered. Submission runs the pure
// four-axis grader and renders an inline confirmation-and-review report. State
// is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'neurodiversity-adjustment-response.front-end-with-html.v1';
try { window.__A11Y_DRAFT_KEY__ = STORAGE_KEY; } catch (e) {}
const TOTAL_STEPS = 7;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyResponse();

  for (const key of Object.keys(fresh)) {
    const v = parsed && parsed[key];
    if (Array.isArray(fresh[key])) {
      fresh[key] = Array.isArray(v) ? v : [];
    } else if (v && typeof v === 'object') {
      fresh[key] = { ...fresh[key], ...v };
    }
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyResponse();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved response; starting fresh.', e);
    return emptyResponse();
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save response to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored response.', e);
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

let state = loadState();
/** @type {ReturnType<typeof calculateGrade> | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'neurodiversity-adjustment-response',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the response report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    updateConditionalSections();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
}

function setBool(section, field, checked) {
  state[section][field] = !!checked;
  saveState(state);
  updateProgress();
  updateConditionalSections();
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
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    ${opts.description ? `<span class="field-description">${esc(opts.description)}</span>` : ''}
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

function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.required ? 'data-required' : ''}
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

function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select"${opts.required ? ' data-required' : ''} aria-describedby="${id}-error">
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

/** Single boolean toggle (checkbox) bound to a boolean field. */
function boolField(opts) {
  const id = `${opts.section}-${opts.field}`;
  const checked = state[opts.section][opts.field] === true;
  const wrapper = document.createElement('div');
  wrapper.className = 'bool-field';
  wrapper.innerHTML = `
    <input type="checkbox" class="checkbox-input" id="${id}" name="${id}"${checked ? ' checked' : ''}>
    <label for="${id}">${esc(opts.label)}</label>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('change', () => {
    setBool(opts.section, opts.field, input.checked);
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
    <span class="section-step">Step ${opts.stepNumber} of ${TOTAL_STEPS}</span>
    <h2 class="section-title">${esc(opts.title)}</h2>
    ${desc}
  `;
  card.appendChild(legend);
  return card;
}

function subHead(text) {
  const h = document.createElement('h3');
  h.textContent = text;
  return h;
}

function grid(cols, children) {
  const g = document.createElement('div');
  g.className = cols;
  for (const c of children) g.appendChild(c);
  return g;
}

// ----------------------------------------------------------------------
// Option lists
// ----------------------------------------------------------------------

const MANAGER_ROLE_OPTIONS = [
  { value: 'line-manager', label: 'Line manager' },
  { value: 'hr-adviser', label: 'HR adviser' },
  { value: 'occupational-health', label: 'Occupational health' },
  { value: 'diversity-lead', label: 'Diversity lead' },
  { value: 'senior-manager', label: 'Senior manager' },
  { value: 'other', label: 'Other' }
];

const RESPONSE_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'agreed', label: 'Agreed' },
  { value: 'partially-agreed', label: 'Partially agreed' },
  { value: 'trial', label: 'Trial' },
  { value: 'declined', label: 'Declined' },
  { value: 'deferred', label: 'Deferred' },
  { value: 'cancelled', label: 'Cancelled' }
];

const HANDLING_METHOD_OPTIONS = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'occupational-health-referral', label: 'Occupational-health referral' },
  { value: 'email', label: 'Email' },
  { value: 'hr-review', label: 'HR review' },
  { value: 'other', label: 'Other' }
];

const OVERALL_DECISION_OPTIONS = [
  { value: 'agreed', label: 'Agreed — all requested adjustments' },
  { value: 'partially-agreed', label: 'Partially agreed' },
  { value: 'alternative-offered', label: 'Alternative offered' },
  { value: 'declined', label: 'Declined' },
  { value: 'deferred', label: 'Deferred' }
];

const DECLINE_REASON_OPTIONS = [
  { value: 'not-reasonable', label: 'Not reasonable' },
  { value: 'disproportionate-cost', label: 'Disproportionate cost' },
  { value: 'health-and-safety', label: 'Health and safety' },
  { value: 'operational-impact', label: 'Operational impact' },
  { value: 'alternative-provided', label: 'Alternative provided' },
  { value: 'insufficient-information', label: 'Insufficient information' },
  { value: 'none', label: 'None' }
];

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Response Identification',
    description: 'Who authored the reply, the originating request, and key dates.'
  });
  card.appendChild(subHead('Responding manager / HR contact'));
  card.appendChild(textInput({
    label: 'Name', section: 'manager', field: 'name', required: true,
    placeholder: 'e.g. Sam Patel'
  }));
  card.appendChild(grid('two-col', [
    selectInput({
      label: 'Role', section: 'manager', field: 'role',
      options: MANAGER_ROLE_OPTIONS
    }),
    textInput({
      label: 'Job title', section: 'manager', field: 'jobTitle',
      placeholder: 'e.g. HR Business Partner'
    })
  ]));
  card.appendChild(textInput({
    label: 'Department', section: 'manager', field: 'department',
    placeholder: 'e.g. People & Culture'
  }));

  card.appendChild(subHead('Response'));
  card.appendChild(grid('two-col', [
    selectInput({
      label: 'Response status', section: 'response', field: 'responseStatus',
      options: RESPONSE_STATUS_OPTIONS, required: true
    }),
    textInput({
      label: 'Originating request reference', section: 'response', field: 'requestReference',
      placeholder: 'e.g. NAR-2001'
    })
  ]));
  card.appendChild(selectInput({
    label: 'Handling method', section: 'response', field: 'handlingMethod',
    options: HANDLING_METHOD_OPTIONS
  }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Assessed date', section: 'response', field: 'assessedDate', type: 'date', description: 'Date the request was assessed / discussed.' }),
    textInput({ label: 'Responded date', section: 'response', field: 'respondedDate', type: 'date', description: 'Date the response was issued.' })
  ]));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Worker Identification',
    description: 'Identify the worker this response relates to.'
  });
  card.appendChild(textInput({
    label: 'Worker name', section: 'worker', field: 'name', required: true,
    placeholder: 'e.g. Jordan Lee'
  }));
  card.appendChild(grid('two-col', [
    textInput({
      label: 'Employee reference', section: 'worker', field: 'employeeReference',
      placeholder: 'e.g. EMP-4821', description: 'Employer-assigned employee / payroll reference.'
    }),
    textInput({ label: 'Job title', section: 'worker', field: 'jobTitle', placeholder: 'e.g. Software Engineer' })
  ]));
  card.appendChild(textInput({
    label: 'Department', section: 'worker', field: 'department', placeholder: 'e.g. Engineering'
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Decision',
    description: 'The overall decision, its rationale, and — where anything is declined — the reasonableness category.'
  });
  card.appendChild(selectInput({
    label: 'Overall decision', section: 'decision', field: 'overallDecision',
    options: OVERALL_DECISION_OPTIONS, required: true
  }));
  card.appendChild(textArea({
    label: 'Decision rationale', section: 'decision', field: 'decisionRationale', rows: 5,
    placeholder: 'Why this decision was reached, including the reasonableness justification where any adjustment is declined…'
  }));
  card.appendChild(selectInput({
    label: 'Decline-reason category', section: 'decision', field: 'declineReasonCategory',
    options: DECLINE_REASON_OPTIONS
  }));

  const alert = document.createElement('div');
  alert.className = 'alert';
  alert.dataset.type = 'error';
  alert.dataset.conditional = 'decision.overallDecision=declined';
  alert.id = 'decline-alert';
  alert.innerHTML = `
    <strong>Adjustments declined</strong>
    <p>
      Declining adjustments for a worker likely covered by the Equality Act 2010
      without an adequate reasonableness justification or an alternative drives
      the legal-risk axis to high-risk and raises the discrimination-risk flag.
      Record a clear rationale and a decline-reason category, and offer an
      alternative where one is feasible.
    </p>
  `;
  card.appendChild(alert);
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Adjustments Agreed',
    description: 'Which categories of reasonable adjustment were agreed, the detail, and any alternatives offered.'
  });
  card.appendChild(subHead('Agreed adjustment categories'));
  card.appendChild(boolField({ label: 'Working environment', section: 'adjustments', field: 'agreedWorkingEnvironment' }));
  card.appendChild(boolField({ label: 'Equipment / assistive technology', section: 'adjustments', field: 'agreedEquipmentTechnology' }));
  card.appendChild(boolField({ label: 'Working arrangements', section: 'adjustments', field: 'agreedWorkingArrangements' }));
  card.appendChild(boolField({ label: 'Communication', section: 'adjustments', field: 'agreedCommunication' }));
  card.appendChild(boolField({ label: 'Support / mentoring', section: 'adjustments', field: 'agreedSupportMentoring' }));
  card.appendChild(boolField({ label: 'Recruitment / assessment process', section: 'adjustments', field: 'agreedRecruitmentProcess' }));
  card.appendChild(boolField({ label: 'Policy (dress code / uniform / absence)', section: 'adjustments', field: 'agreedPolicyDress' }));
  card.appendChild(boolField({ label: 'Other adjustment', section: 'adjustments', field: 'agreedOther' }));

  card.appendChild(subHead('Detail'));
  card.appendChild(textArea({
    label: 'Agreed-adjustments detail', section: 'adjustments', field: 'agreedAdjustmentsDetail', rows: 4,
    placeholder: 'e.g. Noise-cancelling headphones and a quiet desk away from the main walkway; flexible start time…'
  }));
  card.appendChild(textArea({
    label: 'Alternative adjustments offered', section: 'adjustments', field: 'alternativeAdjustmentsDetail', rows: 3,
    placeholder: 'Any alternative adjustments offered where the original request was not agreed as-is…'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Trial & Review',
    description: 'Whether the adjustments are being tried, the review arrangements, and the effective date.'
  });
  card.appendChild(subHead('Trial period'));
  card.appendChild(boolField({
    label: 'Adjustments are being tried for a time-limited trial period',
    section: 'review', field: 'trialPeriod'
  }));
  card.appendChild(textInput({
    label: 'Trial length (weeks)', section: 'review', field: 'trialPeriodWeeks',
    type: 'number', min: 0, max: 104, step: 1,
    description: 'Length of the trial period in weeks (0–104).'
  }));

  card.appendChild(subHead('Review'));
  card.appendChild(boolField({
    label: 'A review of the adjustments has been scheduled',
    section: 'review', field: 'reviewScheduled'
  }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Review date', section: 'review', field: 'reviewDate', type: 'date' }),
    textInput({ label: 'Effective date', section: 'response', field: 'effectiveDate', type: 'date', description: 'Date the agreed adjustments take effect.' })
  ]));

  const alert = document.createElement('div');
  alert.className = 'alert';
  alert.dataset.type = 'warning';
  alert.dataset.conditional = 'review.reviewScheduled=false';
  alert.id = 'no-review-alert';
  alert.innerHTML = `
    <strong>No review scheduled</strong>
    <p>
      If any adjustment has been agreed, schedule a review to check it is working.
      Agreed adjustments without a review raise the no-review-scheduled flag and
      escalate the follow-up urgency.
    </p>
  `;
  card.appendChild(alert);
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Support & Responsibilities',
    description: 'Occupational health and Access to Work referrals, support resources, responsibilities, and the point of contact.'
  });
  card.appendChild(boolField({ label: 'Worker referred to occupational health', section: 'support', field: 'occupationalHealthReferred' }));
  card.appendChild(boolField({ label: 'Worker signposted / referred to the Access to Work scheme', section: 'support', field: 'accessToWorkReferred' }));
  card.appendChild(textArea({
    label: 'Support resources', section: 'support', field: 'supportResourcesDetail', rows: 3,
    placeholder: 'Budget, equipment orders, training, or other resources allocated…'
  }));
  card.appendChild(textArea({
    label: 'Responsibilities', section: 'support', field: 'responsibilitiesDetail', rows: 3,
    placeholder: 'Who is responsible for implementing each agreed adjustment…'
  }));
  card.appendChild(textInput({
    label: 'Point of contact', section: 'support', field: 'pointOfContact',
    placeholder: 'Named contact for the worker to raise concerns'
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Sign-off',
    description: 'Escalation and notes. Submit to compute the four-axis grade, flags, and recommendation.'
  });
  card.appendChild(subHead('Escalation'));
  card.appendChild(boolField({
    label: 'The matter has been escalated (dispute, grievance, or appeal)',
    section: 'signOff', field: 'escalated'
  }));

  const alert = document.createElement('div');
  alert.className = 'alert';
  alert.dataset.type = 'error';
  alert.dataset.conditional = 'signOff.escalated=true';
  alert.id = 'escalation-alert';
  alert.innerHTML = `
    <strong>Matter escalated</strong>
    <p>
      An escalated matter raises the grievance-escalation flag and sets the
      follow-up urgency to escalation-needed. Engage HR and follow the grievance
      / appeal procedure.
    </p>
  `;
  card.appendChild(alert);

  card.appendChild(textArea({
    label: 'Escalation detail', section: 'signOff', field: 'escalationDetail', rows: 3,
    placeholder: 'Detail of any escalation, dispute, or appeal…'
  }));

  card.appendChild(subHead('Notes'));
  card.appendChild(textArea({
    label: 'Notes', section: 'signOff', field: 'notes', rows: 3,
    placeholder: 'Any notes accompanying the response…'
  }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7
];

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = String(state[section]?.[field] ?? '');
    host.style.display = current === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// [section, field, step] — tracked answerable fields grouped by wizard step.
const TRACKED_FIELDS = [
  // 1 Identification
  ['manager', 'name', 1], ['response', 'responseStatus', 1], ['response', 'respondedDate', 1],
  // 2 Worker
  ['worker', 'name', 2], ['worker', 'employeeReference', 2],
  // 3 Decision
  ['decision', 'overallDecision', 3], ['decision', 'decisionRationale', 3],
  // 4 Adjustments
  ['adjustments', 'agreedAdjustmentsDetail', 4],
  // 5 Trial & review
  ['review', 'reviewDate', 5], ['response', 'effectiveDate', 5],
  // 6 Support & responsibilities
  ['support', 'pointOfContact', 6], ['support', 'responsibilitiesDetail', 6],
  // 7 Sign-off
  ['signOff', 'notes', 7]
];

function isAnswered(v) {
  return v !== null && v !== undefined && v !== '' && v !== false;
}

function updateProgress() {
  let answered = 0;
  const stepAnswered = {};
  const stepTotal = {};
  for (const [section, field, step] of TRACKED_FIELDS) {
    stepTotal[step] = (stepTotal[step] || 0) + 1;
    if (isAnswered(state[section][field])) {
      answered++;
      stepAnswered[step] = (stepAnswered[step] || 0) + 1;
    }
  }
  const total = TRACKED_FIELDS.length;
  const percent = Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(stepAnswered, stepTotal);
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, title: 'Identification' },
  { step: 2, title: 'Worker' },
  { step: 3, title: 'Decision' },
  { step: 4, title: 'Adjustments' },
  { step: 5, title: 'Trial & review' },
  { step: 6, title: 'Support' },
  { step: 7, title: 'Sign-off' }
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

function updateStepListStatuses(stepAnswered, stepTotal) {
  const ol = document.getElementById('step-list');
  if (!ol) return;
  let firstUnfinished = -1;
  for (const def of STEP_DEFINITIONS) {
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

function setFieldError(id, message) {
  const el = document.getElementById(`${id}-error`);
  if (el) el.textContent = message;
  const input = document.getElementById(id);
  if (input) input.setAttribute('aria-invalid', 'true');
}

function validateForm() {
  const errors = [];
  const form = document.getElementById('response-form');
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

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    outcomeClassification,
    legalRiskBand,
    completenessPercent,
    followUpUrgency,
    targetTimeframe,
    recommendation,
    recommendationLabel,
    firedRules,
    flags,
    timestamp
  } = lastResult;

  const flagsList = flags.length === 0
    ? `<p class="muted">No compliance or risk flags raised.</p>`
    : `
      <ul class="flags">
        ${flags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}</span>
            <span class="flag-action">${esc(f.suggestedAction)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const firedRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.ruleId)}</th>
      <td>${esc(r.axis)}</td>
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No rules fired.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Rule</th>
            <th scope="col">Axis</th>
            <th scope="col">Category</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <h2>Neurodiversity Adjustment Response Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())} · Worker: ${esc(state.worker.name || '—')} · Decision: ${esc(overallDecisionLabel(state.decision.overallDecision))} · Status: ${esc(responseStatusLabel(state.response.responseStatus))}</p>

    <div class="recommendation-banner">
      <span class="band-badge rec-${esc(recommendation)}">${esc(recommendationLabel)}</span>
      <span class="band-badge urgency-${esc(followUpUrgency)}">${esc(followUpUrgencyLabel(followUpUrgency))}${targetTimeframe ? ` · ${esc(targetTimeframe)}` : ''}</span>
    </div>

    <h3>Four-axis grade</h3>
    <div class="axis-grid">
      <div class="axis-card">
        <span class="axis-name">A · Outcome</span>
        <span class="axis-value">
          <span class="band-badge outcome-${esc(outcomeClassification)}">${esc(outcomeClassificationLabel(outcomeClassification))}</span>
        </span>
      </div>
      <div class="axis-card">
        <span class="axis-name">B · Legal / discrimination risk</span>
        <span class="axis-value">
          <span class="band-badge legal-${esc(legalRiskBand)}">${esc(legalRiskBandLabel(legalRiskBand))}</span>
        </span>
      </div>
      <div class="axis-card">
        <span class="axis-name">C · Completeness</span>
        <span class="axis-value"><strong>${completenessPercent}%</strong></span>
        <div class="completeness-bar"><span style="width:${completenessPercent}%"></span></div>
      </div>
      <div class="axis-card">
        <span class="axis-name">D · Follow-up urgency</span>
        <span class="axis-value"><span class="band-badge urgency-${esc(followUpUrgency)}">${esc(followUpUrgencyLabel(followUpUrgency))}</span></span>
        ${targetTimeframe ? `<span class="muted">${esc(targetTimeframe)}</span>` : ''}
      </div>
    </div>

    <h3>Fired rules</h3>
    ${firedTable}

    <h3>Compliance and risk flags</h3>
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
  const result = calculateGrade(state);
  lastResult = {
    ...result,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh response?')) return;
  clearState();
  state = emptyResponse();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the response report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
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
  updateConditionalSections();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
