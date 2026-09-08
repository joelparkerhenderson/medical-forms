import { calculateGrade } from './grader.js';
import { effectivenessBandLabel, emptyReview, nextStepUrgencyLabel, reviewStatusLabel, wellbeingRiskBandLabel } from './types.js';

// Neurodiversity Adjustment Review — effectiveness-review wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page progress
// summary reflects how many fields have been answered. Submission runs the pure
// four-axis grader and renders an inline review report. State is persisted to
// localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'neurodiversity-adjustment-review.front-end-with-html.v1';
try { window.__A11Y_DRAFT_KEY__ = STORAGE_KEY; } catch (e) {}
const TOTAL_STEPS = 6;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyReview();

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
    if (!raw) return emptyReview();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved review; starting fresh.', e);
    return emptyReview();
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save review to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored review.', e);
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
  slug: 'neurodiversity-adjustment-review',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the review report.</p>';
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

const REVIEW_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Completed' },
  { value: 'changes-agreed', label: 'Changes agreed' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'cancelled', label: 'Cancelled' }
];

const REVIEW_METHOD_OPTIONS = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'occupational-health-review', label: 'Occupational-health review' },
  { value: 'email', label: 'Email' },
  { value: 'hr-review', label: 'HR review' },
  { value: 'other', label: 'Other' }
];

const EFFECTIVENESS_OPTIONS = [
  { value: 'working-well', label: 'Working well' },
  { value: 'partial', label: 'Partial' },
  { value: 'not-working', label: 'Not working' },
  { value: 'not-in-place', label: 'Not in place' }
];

const SATISFACTION_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'partially', label: 'Partially' },
  { value: 'no', label: 'No' }
];

const WELLBEING_CHANGE_OPTIONS = [
  { value: 'improved', label: 'Improved' },
  { value: 'unchanged', label: 'Unchanged' },
  { value: 'worse', label: 'Worse' }
];

// Per-category effectiveness fields (ACAS adjustment categories in place).
const EFFECTIVENESS_CATEGORIES = [
  { field: 'effectivenessWorkingEnvironment', label: 'Working environment' },
  { field: 'effectivenessEquipmentTechnology', label: 'Equipment / assistive technology' },
  { field: 'effectivenessWorkingArrangements', label: 'Working arrangements' },
  { field: 'effectivenessCommunication', label: 'Communication' },
  { field: 'effectivenessSupportMentoring', label: 'Support / mentoring' },
  { field: 'effectivenessRecruitmentProcess', label: 'Recruitment / assessment process' },
  { field: 'effectivenessPolicyDress', label: 'Policy (dress code / uniform / absence)' },
  { field: 'effectivenessOther', label: 'Other adjustment' }
];

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Review Identification',
    description: 'Who conducted the review, the originating response, and how and when it took place.'
  });
  card.appendChild(subHead('Reviewer (manager / HR contact)'));
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

  card.appendChild(subHead('Review'));
  card.appendChild(grid('two-col', [
    selectInput({
      label: 'Review status', section: 'review', field: 'reviewStatus',
      options: REVIEW_STATUS_OPTIONS, required: true
    }),
    textInput({
      label: 'Originating response reference', section: 'review', field: 'responseReference',
      placeholder: 'e.g. NAR-2026-0001',
      description: 'Reference to the response / confirmation whose adjustments are being reviewed.'
    })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({
      label: 'Review method', section: 'review', field: 'reviewMethod',
      options: REVIEW_METHOD_OPTIONS
    }),
    textInput({ label: 'Review date', section: 'review', field: 'reviewDate', type: 'date', description: 'Date the review took place.' })
  ]));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Worker Identification',
    description: 'Identify the worker this review relates to.'
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
    title: 'Effectiveness',
    description: 'Rate how each agreed adjustment in place is working. Leave a category as “Not in place” if no such adjustment was agreed.'
  });
  card.appendChild(subHead('Per-category effectiveness'));
  const rows = EFFECTIVENESS_CATEGORIES.map((c) => selectInput({
    label: c.label, section: 'effectiveness', field: c.field,
    options: EFFECTIVENESS_OPTIONS
  }));
  card.appendChild(grid('two-col', rows));

  const note = document.createElement('div');
  note.className = 'alert';
  note.dataset.type = 'info';
  note.innerHTML = `
    <strong>Reviewing effectiveness</strong>
    <p>
      Any adjustment rated <em>Not working</em> raises the
      adjustments-not-working flag and drives the next-step urgency to
      “adjust now”. Effectiveness is graded only over adjustments actually in
      place; categories marked “Not in place” are excluded.
    </p>
  `;
  card.appendChild(note);
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Worker Experience',
    description: "The worker's own feedback, satisfaction, wellbeing change, and any remaining barriers."
  });
  card.appendChild(textArea({
    label: 'Worker feedback', section: 'experience', field: 'workerFeedback', rows: 5,
    placeholder: 'The worker’s own account of how the adjustments are working…'
  }));
  card.appendChild(grid('two-col', [
    selectInput({
      label: 'Is the worker satisfied the adjustments meet their needs?',
      section: 'experience', field: 'workerSatisfied', options: SATISFACTION_OPTIONS
    }),
    selectInput({
      label: 'Change in wellbeing since the adjustments',
      section: 'experience', field: 'wellbeingChange', options: WELLBEING_CHANGE_OPTIONS
    })
  ]));

  const dissatisfiedAlert = document.createElement('div');
  dissatisfiedAlert.className = 'alert';
  dissatisfiedAlert.dataset.type = 'error';
  dissatisfiedAlert.dataset.conditional = 'experience.workerSatisfied=no';
  dissatisfiedAlert.id = 'dissatisfied-alert';
  dissatisfiedAlert.innerHTML = `
    <strong>Worker not satisfied</strong>
    <p>
      A dissatisfied worker drives the wellbeing-risk axis to high-risk and
      raises the worker-dissatisfied flag. Explore with the worker what would
      work better.
    </p>
  `;
  card.appendChild(dissatisfiedAlert);

  const wellbeingAlert = document.createElement('div');
  wellbeingAlert.className = 'alert';
  wellbeingAlert.dataset.type = 'error';
  wellbeingAlert.dataset.conditional = 'experience.wellbeingChange=worse';
  wellbeingAlert.id = 'wellbeing-alert';
  wellbeingAlert.innerHTML = `
    <strong>Wellbeing has worsened</strong>
    <p>
      A decline in wellbeing drives the wellbeing-risk axis to high-risk and
      raises the wellbeing-declined flag. Review the adjustments and consider
      occupational-health input.
    </p>
  `;
  card.appendChild(wellbeingAlert);

  card.appendChild(textArea({
    label: 'Remaining barriers', section: 'experience', field: 'barriersDetail', rows: 3,
    placeholder: 'Any barriers or difficulties the worker still experiences…'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Changes & Next Steps',
    description: 'Any changes arising from the review, the updated adjustments, occupational-health re-referral, and the next review date.'
  });
  card.appendChild(boolField({
    label: 'Changes to the adjustments are needed as a result of this review',
    section: 'changes', field: 'changesNeeded'
  }));

  const changesAlert = document.createElement('div');
  changesAlert.className = 'alert';
  changesAlert.dataset.type = 'warning';
  changesAlert.dataset.conditional = 'changes.changesNeeded=true';
  changesAlert.id = 'changes-alert';
  changesAlert.innerHTML = `
    <strong>Changes needed</strong>
    <p>
      Record and action the required changes. Changes needed without any detail
      raise the changes-outstanding flag; a failing adjustment or an agreed
      change drives the next-step urgency to “adjust now”.
    </p>
  `;
  card.appendChild(changesAlert);

  card.appendChild(textArea({
    label: 'Changes needed — detail', section: 'changes', field: 'changesDetail', rows: 4,
    placeholder: 'What needs to change and why…'
  }));
  card.appendChild(textArea({
    label: 'Updated / newly agreed adjustments', section: 'changes', field: 'updatedAdjustmentsDetail', rows: 3,
    placeholder: 'Detail of the updated or newly agreed adjustments arising from the review…'
  }));
  card.appendChild(boolField({
    label: 'An occupational-health re-referral has been made',
    section: 'changes', field: 'occupationalHealthRereferral'
  }));

  card.appendChild(subHead('Next review'));
  card.appendChild(textInput({
    label: 'Next review date', section: 'review', field: 'nextReviewDate', type: 'date',
    description: 'Date of the next scheduled review.'
  }));

  const noNextAlert = document.createElement('div');
  noNextAlert.className = 'alert';
  noNextAlert.dataset.type = 'warning';
  noNextAlert.dataset.conditional = 'review.nextReviewDate=';
  noNextAlert.id = 'no-next-review-alert';
  noNextAlert.innerHTML = `
    <strong>No next review date set</strong>
    <p>
      Adjustments should be reviewed regularly. No next review date raises the
      no-next-review flag. Schedule the next review.
    </p>
  `;
  card.appendChild(noNextAlert);
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Sign-off',
    description: 'Escalation and notes. Submit to compute the four-axis grade, flags, and recommendation.'
  });
  card.appendChild(subHead('Escalation'));
  card.appendChild(boolField({
    label: 'The matter has been escalated (unresolved difficulty, dispute, or grievance)',
    section: 'meta', field: 'escalated'
  }));

  const alert = document.createElement('div');
  alert.className = 'alert';
  alert.dataset.type = 'error';
  alert.dataset.conditional = 'meta.escalated=true';
  alert.id = 'escalation-alert';
  alert.innerHTML = `
    <strong>Matter escalated</strong>
    <p>
      An escalated matter raises the escalation flag and sets the next-step
      urgency to “escalate”. Follow the escalation / grievance procedure.
    </p>
  `;
  card.appendChild(alert);

  card.appendChild(textArea({
    label: 'Escalation detail', section: 'meta', field: 'escalationDetail', rows: 3,
    placeholder: 'Detail of any escalation, dispute, or grievance…'
  }));

  card.appendChild(subHead('Notes'));
  card.appendChild(textArea({
    label: 'Notes', section: 'meta', field: 'notes', rows: 3,
    placeholder: 'Any notes accompanying the review…'
  }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3,
  renderStep4, renderStep5, renderStep6
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
    host.style.display = current === (target ?? '') ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// [section, field, step] — tracked answerable fields grouped by wizard step.
const TRACKED_FIELDS = [
  // 1 Review identification
  ['manager', 'name', 1], ['review', 'reviewStatus', 1], ['review', 'reviewDate', 1],
  // 2 Worker
  ['worker', 'name', 2], ['worker', 'employeeReference', 2],
  // 3 Effectiveness
  ['effectiveness', 'effectivenessWorkingEnvironment', 3], ['effectiveness', 'effectivenessWorkingArrangements', 3],
  // 4 Worker experience
  ['experience', 'workerFeedback', 4], ['experience', 'workerSatisfied', 4], ['experience', 'wellbeingChange', 4],
  // 5 Changes & next steps
  ['changes', 'changesDetail', 5], ['review', 'nextReviewDate', 5],
  // 6 Sign-off
  ['meta', 'notes', 6]
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
  { step: 1, title: 'Review' },
  { step: 2, title: 'Worker' },
  { step: 3, title: 'Effectiveness' },
  { step: 4, title: 'Experience' },
  { step: 5, title: 'Changes' },
  { step: 6, title: 'Sign-off' }
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
  const form = document.getElementById('review-form');
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
    effectivenessBand,
    wellbeingRiskBand,
    completenessPercent,
    nextStepUrgency,
    targetTimeframe,
    recommendation,
    recommendationLabel,
    firedRules,
    flags,
    timestamp
  } = lastResult;

  const flagsList = flags.length === 0
    ? `<p class="muted">No review flags raised.</p>`
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
    <h2>Neurodiversity Adjustment Review Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())} · Worker: ${esc(state.worker.name || '—')} · Status: ${esc(reviewStatusLabel(state.review.reviewStatus))} · Effectiveness: ${esc(effectivenessBandLabel(effectivenessBand))}</p>

    <div class="recommendation-banner">
      <span class="band-badge rec-${esc(recommendation)}">${esc(recommendationLabel)}</span>
      <span class="band-badge next-${esc(nextStepUrgency)}">${esc(nextStepUrgencyLabel(nextStepUrgency))}${targetTimeframe ? ` · ${esc(targetTimeframe)}` : ''}</span>
    </div>

    <h3>Four-axis grade</h3>
    <div class="axis-grid">
      <div class="axis-card">
        <span class="axis-name">A · Effectiveness</span>
        <span class="axis-value">
          <span class="band-badge effect-${esc(effectivenessBand)}">${esc(effectivenessBandLabel(effectivenessBand))}</span>
        </span>
      </div>
      <div class="axis-card">
        <span class="axis-name">B · Wellbeing risk</span>
        <span class="axis-value">
          <span class="band-badge well-${esc(wellbeingRiskBand)}">${esc(wellbeingRiskBandLabel(wellbeingRiskBand))}</span>
        </span>
      </div>
      <div class="axis-card">
        <span class="axis-name">C · Completeness</span>
        <span class="axis-value"><strong>${completenessPercent}%</strong></span>
        <div class="completeness-bar"><span style="width:${completenessPercent}%"></span></div>
      </div>
      <div class="axis-card">
        <span class="axis-name">D · Next-step urgency</span>
        <span class="axis-value"><span class="band-badge next-${esc(nextStepUrgency)}">${esc(nextStepUrgencyLabel(nextStepUrgency))}</span></span>
        ${targetTimeframe ? `<span class="muted">${esc(targetTimeframe)}</span>` : ''}
      </div>
    </div>

    <h3>Fired rules</h3>
    ${firedTable}

    <h3>Review flags</h3>
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
  if (!confirm('Clear all answers and start a fresh review?')) return;
  clearState();
  state = emptyReview();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the review report.</p>';
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
