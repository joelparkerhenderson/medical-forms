import { detectAdditionalFlags } from './flagged-issues.js';
import { safetyRules } from './rules.js';
import { gradeSafety } from './safety-grader.js';
import { actionTimeframe, emptyAssessment, findingLevelClass, gradeLabel, gradeToFindingLevel, outcomeClass, outcomeLabel } from './types.js';

// Workplace Safety Assessment — auditor checklist (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order as a Lily <fieldset class="fieldset">. The auditor scrolls
// through them; a native <progress> bar and a clickable step-list at the top
// of the page reflect how many checklist items have been answered.
// Submission runs the pure safety grading engine and renders an inline
// report with an outcome badge, findings-by-category table, action-plan
// summary, and a prioritised flagged-issues list. State is persisted to
// localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'workplace-safety-assessment.front-end-form-with-html.v1';
const TOTAL_STEPS = 10;

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
      if (Array.isArray(fresh[key])) {
        fresh[key] = Array.isArray(parsed[key]) ? parsed[key].slice() : fresh[key];
      } else {
        fresh[key] = { ...fresh[key], ...parsed[key] };
      }
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

/** @param {import('./types.js').AssessmentData} st */
function saveState(st) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(st));
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
  slug: 'workplace-safety-assessment',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const out = document.getElementById('report');
    if (out) {
      out.innerHTML =
        '<p class="empty-message">Submit the checklist to see the audit report.</p>';
    }
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    updateConditionalSections();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
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
}

/** Escape user-entered text for safe rendering. */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

// ----------------------------------------------------------------------
// Component builders
// ----------------------------------------------------------------------

/**
 * Build a labelled text input with Lily class contract.
 *
 * @param {{ label: string, section: string, field: string, type?: string,
 *           placeholder?: string, required?: boolean, min?: number,
 *           max?: number, step?: number, unit?: string }} opts
 */
function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const type = opts.type || 'text';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${lilyInputClass(type)}"`,
    `value="${esc(value == null ? '' : value)}"`,
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
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    let v = input.value;
    if (type === 'number') v = v === '' ? null : Number(v);
    setField(opts.section, opts.field, v);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Build a labelled multi-line text area with Lily class contract.
 */
function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] == null
    ? '' : state[opts.section][opts.field];
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
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
 * Build a select / dropdown input with Lily class contract.
 */
function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] == null
    ? '' : state[opts.section][opts.field];
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
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
 * Build a Lily radio-group fieldset (used by general-purpose radios as well
 * as the yes/no/N/A checklist items via the `extraClass` hook).
 *
 * @param {{ label: string, section: string, field: string,
 *           options: Array<{ value: string, label: string, optionClass?: string }>,
 *           extraClass?: string }} opts
 */
function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.innerHTML = opts.label;
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-group' + (opts.extraClass ? ' ' + opts.extraClass : '');
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.htmlFor = radioId;
    if (option.optionClass) label.className = option.optionClass;
    const checked = current === option.value ? ' checked' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}>
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

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = `${groupId}-error`;
  wrapper.appendChild(errSpan);
  return wrapper;
}

// Yes/No/N/A radio options used for every checklist item.
const YES_NO_NA_OPTIONS = [
  { value: 'yes', label: 'Yes',  optionClass: 'choice-yes' },
  { value: 'no',  label: 'No',   optionClass: 'choice-no' },
  { value: 'na',  label: 'N/A',  optionClass: 'choice-na' }
];

/**
 * Build a checklist item: a Lily radio-group with yes/no/N/A options plus
 * a severity-coloured left border. The "good direction" of an answer
 * (yes vs no) varies by rule and is encoded in rules.js — this UI just
 * captures the auditor's answer.
 *
 * @param {{ ruleId: string, section: string, field: string, label: string,
 *           severity: number }} opts
 */
function checklistItem(opts) {
  const li = document.createElement('li');
  const sevCls = opts.severity >= 4
    ? 'is-severity-critical'
    : opts.severity === 3
      ? 'is-severity-major'
      : 'is-severity-minor';
  li.className = `checklist-item ${sevCls}`;
  li.dataset.ruleId = opts.ruleId;

  const idBadge = opts.ruleId
    ? `<span class="item-id">${esc(opts.ruleId)}</span> `
    : '';
  const severityBadge =
    `<span class="item-severity grade-${opts.severity}">${esc(gradeLabel(opts.severity))}</span>`;
  const label = idBadge + esc(opts.label) + ' ' + severityBadge;

  const group = radioGroup({
    label,
    section: opts.section,
    field: opts.field,
    options: YES_NO_NA_OPTIONS,
    extraClass: 'yes-no-na'
  });
  li.appendChild(group);
  return li;
}

/**
 * Build a section card as a Lily fieldset.
 *
 * @param {{ stepNumber: number, title: string, description?: string,
 *           conditional?: string }} opts
 */
function sectionCard(opts) {
  const card = document.createElement('fieldset');
  card.className = 'fieldset';
  card.dataset.step = String(opts.stepNumber);
  card.id = `step-${opts.stepNumber}`;
  if (opts.conditional) card.dataset.conditional = opts.conditional;
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

/**
 * Look up the canonical rule definition by id (so checklist rendering
 * stays in sync with the grader's rule registry).
 */
function ruleById(id) {
  return safetyRules.find((r) => r.id === id);
}

/** Build a checklist <ul> hosting the listed rule IDs.
 *
 * @param {Array<{ ruleId: string, section: string, field: string }>} entries
 */
function checklist(entries) {
  const ul = document.createElement('ul');
  ul.className = 'checklist';
  for (const entry of entries) {
    const rule = ruleById(entry.ruleId);
    if (!rule) {
      console.warn('Unknown rule id:', entry.ruleId);
      continue;
    }
    ul.appendChild(checklistItem({
      ruleId: rule.id,
      section: entry.section,
      field: entry.field,
      label: rule.description,
      severity: rule.severity
    }));
  }
  return ul;
}

// ----------------------------------------------------------------------
// Section renderers (1 per assessment step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics & Site Details',
    description: 'Identify the auditor, the site, and the scope of this audit.'
  });

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(textInput({ label: 'Auditor name', section: 'siteDetails', field: 'auditorName' }));
  row1.appendChild(textInput({ label: 'Auditor role', section: 'siteDetails', field: 'auditorRole' }));
  card.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'two-col';
  row2.appendChild(textInput({
    label: 'Audit date', section: 'siteDetails', field: 'auditDate', type: 'date'
  }));
  row2.appendChild(textInput({
    label: 'Previous audit date', section: 'siteDetails', field: 'previousAuditDate', type: 'date'
  }));
  card.appendChild(row2);

  card.appendChild(textInput({ label: 'Site name', section: 'siteDetails', field: 'siteName' }));
  card.appendChild(textArea({
    label: 'Site address', section: 'siteDetails', field: 'siteAddress', rows: 2
  }));

  const row3 = document.createElement('div');
  row3.className = 'two-col';
  row3.appendChild(textInput({ label: 'Department / area', section: 'siteDetails', field: 'departmentArea' }));
  row3.appendChild(textInput({ label: 'Site manager', section: 'siteDetails', field: 'siteManager' }));
  card.appendChild(row3);

  card.appendChild(checklist([
    { ruleId: 'WS-001', section: 'siteDetails', field: 'previousFindingsClosed' }
  ]));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'PPE & Hazard Controls',
    description: 'Personal protective equipment, signage, and general housekeeping.'
  });
  card.appendChild(checklist([
    { ruleId: 'WS-002', section: 'ppeHazardControls', field: 'ppeAvailable' },
    { ruleId: 'WS-003', section: 'ppeHazardControls', field: 'ppeCorrectlyUsed' },
    { ruleId: 'WS-004', section: 'ppeHazardControls', field: 'ppeStockMaintained' },
    { ruleId: 'WS-005', section: 'ppeHazardControls', field: 'hazardSignageVisible' },
    { ruleId: 'WS-006', section: 'ppeHazardControls', field: 'signageLegible' },
    { ruleId: 'WS-007', section: 'ppeHazardControls', field: 'housekeepingSatisfactory' },
    { ruleId: 'WS-008', section: 'ppeHazardControls', field: 'slipTripHazardsControlled' }
  ]));
  card.appendChild(textArea({
    label: 'Observations',
    section: 'ppeHazardControls', field: 'observations',
    placeholder: 'Evidence, photographs filed, narrative detail…',
    rows: 3
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Chemical & Biological Hazards',
    description: 'COSHH register, SDS, labelling, storage, spill response, sharps and clinical waste.'
  });
  card.appendChild(checklist([
    { ruleId: 'WS-009', section: 'chemicalBiologicalHazards', field: 'coshhRegisterPresent' },
    { ruleId: 'WS-010', section: 'chemicalBiologicalHazards', field: 'sdsAvailable' },
    { ruleId: 'WS-011', section: 'chemicalBiologicalHazards', field: 'chemicalsLabelledCorrectly' },
    { ruleId: 'WS-012', section: 'chemicalBiologicalHazards', field: 'chemicalsStoredSecurely' },
    { ruleId: 'WS-013', section: 'chemicalBiologicalHazards', field: 'spillKitsAvailable' },
    { ruleId: 'WS-014', section: 'chemicalBiologicalHazards', field: 'untreatedSpillsObserved' },
    { ruleId: 'WS-015', section: 'chemicalBiologicalHazards', field: 'sharpsContainersInDate' },
    { ruleId: 'WS-016', section: 'chemicalBiologicalHazards', field: 'clinicalWasteSegregated' },
    { ruleId: 'WS-017', section: 'chemicalBiologicalHazards', field: 'biologicalRiskAssessmentCurrent' }
  ]));
  card.appendChild(textArea({
    label: 'Observations',
    section: 'chemicalBiologicalHazards', field: 'observations',
    placeholder: 'Spill kit location, COSHH register format, etc.…',
    rows: 3
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Electrical Safety',
    description: 'PAT testing, fixed wiring, equipment condition, sockets and consumer unit.'
  });
  card.appendChild(checklist([
    { ruleId: 'WS-018', section: 'electricalSafety', field: 'patTestingInDate' },
    { ruleId: 'WS-019', section: 'electricalSafety', field: 'fixedWiringTestInDate' },
    { ruleId: 'WS-020', section: 'electricalSafety', field: 'damagedEquipmentObserved' },
    { ruleId: 'WS-021', section: 'electricalSafety', field: 'overloadedSocketsObserved' },
    { ruleId: 'WS-022', section: 'electricalSafety', field: 'extensionLeadsManagedSafely' },
    { ruleId: 'WS-023', section: 'electricalSafety', field: 'consumerUnitAccessible' }
  ]));
  card.appendChild(textArea({
    label: 'Observations',
    section: 'electricalSafety', field: 'observations',
    placeholder: 'PAT label dates, EICR certificate location, etc.…',
    rows: 3
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Fire Safety & Emergency Egress',
    description: 'Fire risk assessment, extinguishers, alarms, egress routes, lighting, fire doors.'
  });
  card.appendChild(checklist([
    { ruleId: 'WS-024', section: 'fireSafety', field: 'fireRiskAssessmentCurrent' },
    { ruleId: 'WS-025', section: 'fireSafety', field: 'fireExtinguishersServiced' },
    { ruleId: 'WS-026', section: 'fireSafety', field: 'fireExtinguishersAccessible' },
    { ruleId: 'WS-027', section: 'fireSafety', field: 'fireAlarmTestedWeekly' },
    { ruleId: 'WS-028', section: 'fireSafety', field: 'emergencyEgressClear' },
    { ruleId: 'WS-029', section: 'fireSafety', field: 'emergencyLightingFunctional' },
    { ruleId: 'WS-030', section: 'fireSafety', field: 'fireDoorsHeldOpenIllegally' },
    { ruleId: 'WS-031', section: 'fireSafety', field: 'assemblyPointSignposted' }
  ]));
  card.appendChild(textArea({
    label: 'Observations',
    section: 'fireSafety', field: 'observations',
    placeholder: 'Alarm test log location, last drill date, etc.…',
    rows: 3
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Ergonomics & Manual Handling',
    description: 'Manual handling assessments, lifting aids, DSE assessments, postural risks.'
  });
  card.appendChild(checklist([
    { ruleId: 'WS-032', section: 'ergonomicsManualHandling', field: 'manualHandlingAssessmentCurrent' },
    { ruleId: 'WS-033', section: 'ergonomicsManualHandling', field: 'liftingAidsAvailable' },
    { ruleId: 'WS-034', section: 'ergonomicsManualHandling', field: 'dseAssessmentsCompleted' },
    { ruleId: 'WS-035', section: 'ergonomicsManualHandling', field: 'workstationsAdjustable' },
    { ruleId: 'WS-036', section: 'ergonomicsManualHandling', field: 'repetitiveStrainConcerns' },
    { ruleId: 'WS-037', section: 'ergonomicsManualHandling', field: 'patientHandlingPlansInPlace' }
  ]));
  card.appendChild(textArea({
    label: 'Observations',
    section: 'ergonomicsManualHandling', field: 'observations',
    placeholder: 'Hoist service stickers, DSE returns rate, etc.…',
    rows: 3
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Emergency Procedures',
    description: 'Evacuation, first-aid kits, first aiders, AED, contacts, drills.'
  });
  card.appendChild(checklist([
    { ruleId: 'WS-038', section: 'emergencyProcedures', field: 'evacuationProcedurePosted' },
    { ruleId: 'WS-039', section: 'emergencyProcedures', field: 'firstAidKitsStocked' },
    { ruleId: 'WS-040', section: 'emergencyProcedures', field: 'firstAiderRosterCurrent' },
    { ruleId: 'WS-041', section: 'emergencyProcedures', field: 'aedAvailable' },
    { ruleId: 'WS-042', section: 'emergencyProcedures', field: 'aedServiceInDate' },
    { ruleId: 'WS-043', section: 'emergencyProcedures', field: 'emergencyContactsDisplayed' },
    { ruleId: 'WS-044', section: 'emergencyProcedures', field: 'drillConductedLast12Months' }
  ]));
  card.appendChild(textArea({
    label: 'Observations',
    section: 'emergencyProcedures', field: 'observations',
    placeholder: 'AED location, last drill report reference, etc.…',
    rows: 3
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Training & Competence',
    description: 'Mandatory training, fire marshals, infection control, induction.'
  });
  card.appendChild(checklist([
    { ruleId: 'WS-045', section: 'trainingCompetence', field: 'mandatoryTrainingUpToDate' },
    { ruleId: 'WS-046', section: 'trainingCompetence', field: 'fireMarshalsTrained' },
    { ruleId: 'WS-047', section: 'trainingCompetence', field: 'manualHandlingTrainingCurrent' },
    { ruleId: 'WS-048', section: 'trainingCompetence', field: 'infectionControlTrainingCurrent' },
    { ruleId: 'WS-049', section: 'trainingCompetence', field: 'trainingRecordsAccessible' },
    { ruleId: 'WS-050', section: 'trainingCompetence', field: 'inductionForNewStartersCompleted' }
  ]));
  card.appendChild(textArea({
    label: 'Observations',
    section: 'trainingCompetence', field: 'observations',
    placeholder: 'Completion-rate snapshots, refresher schedules, etc.…',
    rows: 3
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Incident Reporting & Near Misses',
    description: 'Reporting system use, RIDDOR compliance, near-miss culture, lessons learned.'
  });
  card.appendChild(checklist([
    { ruleId: 'WS-051', section: 'incidentReporting', field: 'incidentReportingSystemUsed' },
    { ruleId: 'WS-052', section: 'incidentReporting', field: 'riddorReportableIncidentsReported' },
    { ruleId: 'WS-053', section: 'incidentReporting', field: 'nearMissReportingActive' }
  ]));

  const counts = document.createElement('div');
  counts.className = 'two-col';
  counts.appendChild(textInput({
    label: 'Incidents (last 12 months)',
    section: 'incidentReporting', field: 'incidentsLast12Months',
    type: 'number', min: 0, step: 1
  }));
  counts.appendChild(textInput({
    label: 'Near misses (last 12 months)',
    section: 'incidentReporting', field: 'nearMissesLast12Months',
    type: 'number', min: 0, step: 1
  }));
  card.appendChild(counts);

  card.appendChild(checklist([
    { ruleId: 'WS-054', section: 'incidentReporting', field: 'lessonsLearnedShared' },
    { ruleId: 'WS-055', section: 'incidentReporting', field: 'actionsFromIncidentsTracked' }
  ]));
  card.appendChild(textArea({
    label: 'Observations',
    section: 'incidentReporting', field: 'observations',
    placeholder: 'System name, recent RIDDOR submissions, etc.…',
    rows: 3
  }));
  return card;
}

// ─── Step 10: Sign-off & Action Plan ────────────────────────────────────

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical — immediate' },
  { value: 'major',    label: 'Major — within 30 days' },
  { value: 'minor',    label: 'Minor — within 90 days' }
];

function actionItemRow(item, index) {
  const row = document.createElement('li');
  row.className = 'action-item';
  row.dataset.index = String(index);

  const idBase = `action-${index}`;
  const optionsHtml = [
    `<option value="">— Priority —</option>`,
    ...PRIORITY_OPTIONS.map((o) =>
      `<option value="${esc(o.value)}"${o.value === item.priority ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  row.innerHTML = `
    <div class="action-item-grid">
      <div class="field action-desc">
        <label class="label" for="${idBase}-description">Description</label>
        <textarea id="${idBase}-description" class="text-area-input" rows="2"
          placeholder="What corrective action is required?">${esc(item.description)}</textarea>
      </div>
      <div class="field">
        <label class="label" for="${idBase}-owner">Owner</label>
        <input id="${idBase}-owner" class="text-input" type="text"
          value="${esc(item.owner)}" placeholder="Named individual or role">
      </div>
      <div class="field">
        <label class="label" for="${idBase}-dueDate">Due date</label>
        <input id="${idBase}-dueDate" class="date-input" type="date" value="${esc(item.dueDate)}">
      </div>
      <div class="field">
        <label class="label" for="${idBase}-priority">Priority</label>
        <select id="${idBase}-priority" class="select">${optionsHtml}</select>
      </div>
      <div class="action-item-actions">
        <button type="button" class="button action-remove" data-variant="danger" aria-label="Remove action item">Remove</button>
      </div>
    </div>
  `;

  const desc = row.querySelector(`#${idBase}-description`);
  desc.addEventListener('input', () => {
    state.signoffActionPlan.actionItems[index].description = desc.value;
    saveState(state);
  });
  const owner = row.querySelector(`#${idBase}-owner`);
  owner.addEventListener('input', () => {
    state.signoffActionPlan.actionItems[index].owner = owner.value;
    saveState(state);
  });
  const due = row.querySelector(`#${idBase}-dueDate`);
  due.addEventListener('input', () => {
    state.signoffActionPlan.actionItems[index].dueDate = due.value;
    saveState(state);
  });
  const pri = row.querySelector(`#${idBase}-priority`);
  pri.addEventListener('change', () => {
    state.signoffActionPlan.actionItems[index].priority = pri.value;
    saveState(state);
  });
  row.querySelector('.action-remove').addEventListener('click', () => {
    state.signoffActionPlan.actionItems.splice(index, 1);
    saveState(state);
    renderActionItemsList();
    updateProgress();
  });

  return row;
}

function renderActionItemsList() {
  const host = document.getElementById('action-items-list');
  if (!host) return;
  host.innerHTML = '';
  const empty = document.getElementById('action-items-empty');
  const items = state.signoffActionPlan.actionItems;
  if (items.length === 0) {
    // Keep the empty-state message OUTSIDE the <ol> so the list only ever
    // contains <li> children (WCAG 1.3.1 — valid list structure).
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;
  items.forEach((item, i) => host.appendChild(actionItemRow(item, i)));
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Sign-off & Action Plan',
    description: 'Capture the corrective action plan, debrief, and auditor sign-off.'
  });

  const planWrap = document.createElement('div');
  planWrap.className = 'field';
  planWrap.innerHTML = `
    <label class="label">Action plan</label>
    <ol id="action-items-list" class="action-items"></ol>
    <p id="action-items-empty" class="muted">No action items yet. Add the first finding below.</p>
    <button type="button" id="add-action-btn" class="button" data-variant="secondary">+ Add action item</button>
  `;
  card.appendChild(planWrap);

  card.appendChild(textArea({
    label: 'Overall summary',
    section: 'signoffActionPlan', field: 'overallSummary',
    placeholder: 'Headline findings, themes, and recommended next steps…',
    rows: 4
  }));

  card.appendChild(checklist([
    { ruleId: 'WS-056', section: 'signoffActionPlan', field: 'debriefDelivered' }
  ]));

  const row = document.createElement('div');
  row.className = 'two-col';
  row.appendChild(textInput({
    label: 'Auditor signature (typed name)',
    section: 'signoffActionPlan', field: 'auditorSignature'
  }));
  row.appendChild(textInput({
    label: 'Sign-off date',
    section: 'signoffActionPlan', field: 'signoffDate', type: 'date'
  }));
  card.appendChild(row);

  // Wire add-button after appending so the host id exists in the doc fragment.
  setTimeout(() => {
    const addBtn = document.getElementById('add-action-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        state.signoffActionPlan.actionItems.push({
          description: '', owner: '', dueDate: '', priority: ''
        });
        saveState(state);
        renderActionItemsList();
      });
    }
    renderActionItemsList();
  }, 0);

  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
  renderStep6, renderStep7, renderStep8, renderStep9, renderStep10
];

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

/**
 * Show / hide elements based on prior answers. Currently: the AED service
 * question is moot if the auditor has confirmed there is no AED.
 */
function updateConditionalSections() {
  const aedServiceItem = document.querySelector(
    'li.checklist-item[data-rule-id="WS-042"]'
  );
  if (aedServiceItem) {
    if (state.emergencyProcedures.aedAvailable === 'no') {
      aedServiceItem.classList.add('is-hidden');
    } else {
      aedServiceItem.classList.remove('is-hidden');
    }
  }
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'siteDetails',                title: 'Site Details' },
  { step: 2,  section: 'ppeHazardControls',          title: 'PPE & Hazards' },
  { step: 3,  section: 'chemicalBiologicalHazards',  title: 'Chemical & Biological' },
  { step: 4,  section: 'electricalSafety',           title: 'Electrical Safety' },
  { step: 5,  section: 'fireSafety',                 title: 'Fire Safety' },
  { step: 6,  section: 'ergonomicsManualHandling',   title: 'Ergonomics' },
  { step: 7,  section: 'emergencyProcedures',        title: 'Emergency Procedures' },
  { step: 8,  section: 'trainingCompetence',         title: 'Training & Competence' },
  { step: 9,  section: 'incidentReporting',          title: 'Incident Reporting' },
  { step: 10, section: 'signoffActionPlan',          title: 'Sign-off & Action Plan' }
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
      const label = labelEl
        ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim()
        : id;
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
      ${errors.map((e) =>
        `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`
      ).join('')}
    </ul>
  `;
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

/**
 * Tracked fields grouped by section so the step-list can show per-section
 * completion. Strings/numbers in the site-details paperwork are tracked
 * alongside checklist items so the step-list reflects paperwork progress.
 */
const TRACKED_SECTIONS = [
  ['siteDetails', ['previousFindingsClosed']],
  ['ppeHazardControls', [
    'ppeAvailable', 'ppeCorrectlyUsed', 'ppeStockMaintained',
    'hazardSignageVisible', 'signageLegible', 'housekeepingSatisfactory',
    'slipTripHazardsControlled'
  ]],
  ['chemicalBiologicalHazards', [
    'coshhRegisterPresent', 'sdsAvailable', 'chemicalsLabelledCorrectly',
    'chemicalsStoredSecurely', 'spillKitsAvailable', 'untreatedSpillsObserved',
    'sharpsContainersInDate', 'clinicalWasteSegregated',
    'biologicalRiskAssessmentCurrent'
  ]],
  ['electricalSafety', [
    'patTestingInDate', 'fixedWiringTestInDate', 'damagedEquipmentObserved',
    'overloadedSocketsObserved', 'extensionLeadsManagedSafely',
    'consumerUnitAccessible'
  ]],
  ['fireSafety', [
    'fireRiskAssessmentCurrent', 'fireExtinguishersServiced',
    'fireExtinguishersAccessible', 'fireAlarmTestedWeekly',
    'emergencyEgressClear', 'emergencyLightingFunctional',
    'fireDoorsHeldOpenIllegally', 'assemblyPointSignposted'
  ]],
  ['ergonomicsManualHandling', [
    'manualHandlingAssessmentCurrent', 'liftingAidsAvailable',
    'dseAssessmentsCompleted', 'workstationsAdjustable',
    'repetitiveStrainConcerns', 'patientHandlingPlansInPlace'
  ]],
  ['emergencyProcedures', [
    'evacuationProcedurePosted', 'firstAidKitsStocked',
    'firstAiderRosterCurrent', 'aedAvailable', 'aedServiceInDate',
    'emergencyContactsDisplayed', 'drillConductedLast12Months'
  ]],
  ['trainingCompetence', [
    'mandatoryTrainingUpToDate', 'fireMarshalsTrained',
    'manualHandlingTrainingCurrent', 'infectionControlTrainingCurrent',
    'trainingRecordsAccessible', 'inductionForNewStartersCompleted'
  ]],
  ['incidentReporting', [
    'incidentReportingSystemUsed', 'riddorReportableIncidentsReported',
    'nearMissReportingActive', 'incidentsLast12Months',
    'nearMissesLast12Months', 'lessonsLearnedShared',
    'actionsFromIncidentsTracked'
  ]],
  ['signoffActionPlan', ['debriefDelivered']]
];

function updateProgress() {
  let answered = 0;
  let total = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, fields] of TRACKED_SECTIONS) {
    sectionTotal[section] = fields.length;
    sectionAnswered[section] = 0;
    for (const field of fields) {
      total++;
      const v = state[section][field];
      if (v !== null && v !== undefined && v !== '') {
        answered++;
        sectionAnswered[section]++;
      }
    }
  }
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
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
    case 'urgent': return 'flag-high';
    case 'high':   return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low':    return 'flag-low';
    default: return '';
  }
}

function gradeBadgeClass(grade) {
  return `grade grade-${grade}`;
}

function findingsTableHtml(findingsByCategory) {
  const rows = Object.values(findingsByCategory)
    .sort((a, b) => {
      const wa = a.critical * 1000 + a.major * 100 + a.minor * 10 + a.compliant;
      const wb = b.critical * 1000 + b.major * 100 + b.minor * 10 + b.compliant;
      return wb - wa;
    })
    .map((c) => {
      const worst = c.critical > 0 ? 4
        : c.major > 0 ? 3
        : c.minor > 0 ? 2 : 1;
      return `
        <tr>
          <th scope="row">${esc(c.category)}</th>
          <td class="num">${c.compliant}</td>
          <td class="num"><span class="grade grade-2">${c.minor}</span></td>
          <td class="num"><span class="grade grade-3">${c.major}</span></td>
          <td class="num"><span class="grade grade-4">${c.critical}</span></td>
          <td class="num">${c.total}</td>
          <td><span class="${gradeBadgeClass(worst)}">${esc(gradeLabel(worst))}</span></td>
        </tr>
      `;
    }).join('');

  return `
    <table class="audit findings-table">
      <thead>
        <tr>
          <th scope="col">Category</th>
          <th scope="col">Compliant</th>
          <th scope="col">Minor</th>
          <th scope="col">Major</th>
          <th scope="col">Critical</th>
          <th scope="col">Total</th>
          <th scope="col">Worst grade</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="7" class="muted">No items answered yet.</td></tr>`}</tbody>
    </table>
  `;
}

function actionPlanSummaryHtml() {
  const items = state.signoffActionPlan.actionItems;
  if (items.length === 0) {
    return `<p class="muted">No action items recorded.</p>`;
  }
  const rows = items.map((it) => {
    const pCls = it.priority === 'critical' ? 'grade-4'
      : it.priority === 'major' ? 'grade-3'
      : it.priority === 'minor' ? 'grade-2' : '';
    const pLabel = it.priority
      ? it.priority.charAt(0).toUpperCase() + it.priority.slice(1)
      : '—';
    return `
      <tr>
        <td>${esc(it.description) || '<span class="muted">(no description)</span>'}</td>
        <td>${esc(it.owner) || '<span class="muted">—</span>'}</td>
        <td>${esc(it.dueDate) || '<span class="muted">—</span>'}</td>
        <td>${pCls ? `<span class="grade ${pCls}">${esc(pLabel)}</span>` : '<span class="muted">—</span>'}</td>
      </tr>
    `;
  }).join('');
  return `
    <table class="audit action-plan-table">
      <thead>
        <tr>
          <th scope="col">Description</th>
          <th scope="col">Owner</th>
          <th scope="col">Due date</th>
          <th scope="col">Priority</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    outcome,
    findingsByCategory,
    firedRules,
    additionalFlags,
    answeredCount,
    timestamp
  } = lastResult;

  // Flagged-issues list
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

  // Findings list (rules that fired with grade > 1)
  const nonCompliant = firedRules.filter((r) => r.grade > 1)
    .sort((a, b) => b.grade - a.grade);
  const findingsList = nonCompliant.length === 0
    ? `<p class="muted">No non-compliant items recorded.</p>`
    : `
      <ul class="findings-list">
        ${nonCompliant.map((r) => `
          <li class="finding-item finding-grade-${r.grade}">
            <span class="item-id">${esc(r.id)}</span>
            <span class="finding-desc">${esc(r.description)}</span>
            <span class="finding-meta">
              <span class="finding-category">${esc(r.category)}</span>
              <span class="grade grade-${r.grade}">${esc(gradeLabel(r.grade))}</span>
            </span>
          </li>
        `).join('')}
      </ul>
    `;

  // Count of total tracked fields for the answered/total readout.
  let totalCount = 0;
  for (const [, fields] of TRACKED_SECTIONS) totalCount += fields.length;

  const site = state.siteDetails;
  const siteHeader = [
    site.siteName,
    site.departmentArea
  ].filter((s) => s && s.trim() !== '').join(' — ');

  out.innerHTML = `
    <h2>Workplace Safety Audit Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}${
      siteHeader ? ` · ${esc(siteHeader)}` : ''
    }${site.auditorName ? ` · auditor: ${esc(site.auditorName)}` : ''}</p>

    <h3>Outcome</h3>
    <p class="outcome-summary">
      <span class="outcome-badge ${outcomeClass(outcome)}">${esc(outcomeLabel(outcome) || '—')}</span>
      <span class="outcome-detail">${esc(actionTimeframe(outcome))}</span>
    </p>
    <p class="muted">Based on ${answeredCount} of ${totalCount} checklist items recorded.</p>

    <h3>Findings by category</h3>
    ${findingsTableHtml(findingsByCategory)}

    <h3>Non-compliant items</h3>
    ${findingsList}

    <h3>Action plan</h3>
    ${actionPlanSummaryHtml()}

    <h3>Flagged issues</h3>
    ${flagsList}

    <div class="report-actions">
      <button type="button" id="print-btn" class="button" data-variant="secondary">Print / save PDF</button>
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const startBtn = document.getElementById('start-over-btn');
  if (startBtn) startBtn.addEventListener('click', startOver);
  const printBtn = document.getElementById('print-btn');
  if (printBtn) printBtn.addEventListener('click', () => window.print());
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const grading = gradeSafety(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    outcome: grading.outcome,
    findingsByCategory: grading.findingsByCategory,
    firedRules: grading.firedRules,
    additionalFlags,
    answeredCount: grading.answeredCount,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Are you sure? This will clear all answers and start a fresh audit.')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const out = document.getElementById('report');
  if (out) {
    out.innerHTML =
      '<p class="empty-message">Submit the checklist to see the audit report.</p>';
  }
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
  if (!host) return;
  host.innerHTML = '';
  for (const renderer of STEP_RENDERERS) host.appendChild(renderer());
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();

  const submit = document.getElementById('submit-btn');
  const reset = document.getElementById('reset-btn');
  if (submit) submit.addEventListener('click', submitForm);
  if (reset)  reset.addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
