import { detectFlaggedIssues } from './flags.js';
import { calculateSmrGrade } from './grader.js';
import { adherenceLabel, anticholinergicBandLabel, burdenBandClass, burdenBandLabel, emptyMedicine, emptyReview, highRiskClassLabel, polypharmacyBandLabel, priorityLabel, reviewStatusClass, reviewStatusLabel } from './types.js';

// Structured Medication Review (SMR) — review wizard (vanilla JavaScript,
// no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The reviewer scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// readout updates the anticholinergic burden sum, polypharmacy band, composite
// burden band, and review status as medicines are added. Step 4 hosts a
// dynamic, repeating one-to-many medicine list (add / remove rows) that mirrors
// the child table `structured_medication_review_medicine`. Submission runs the
// pure scoring engine (counts, ACB sum, bands, review status, STOPP/START +
// flagged issues) and renders an inline report. State is persisted to
// localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'structured-medication-review.front-end-with-html.v1';

/** @returns {import('./types.js').ReviewData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyReview();

  for (const key of Object.keys(fresh)) {
    if (key === 'medicines') continue;
    if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null) {
      fresh[key] = { ...fresh[key], ...parsed[key] };
    }
  }
  // Rehydrate the medicine list, merging each row over a fresh empty so any
  // newly-added medicine fields default correctly.
  if (parsed && Array.isArray(parsed.medicines)) {
    fresh.medicines = parsed.medicines.map((m) => ({ ...emptyMedicine(), ...m }));
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

/** @param {import('./types.js').ReviewData} s */
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

/** @type {import('./types.js').ReviewData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'structured-medication-review',
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
    refreshLiveSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 8;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live readout after each change.
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
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
// Repeating-list editor (medicines) — the one-to-many child list
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const highRiskClassOptions = [
  { value: 'anticoagulant', label: 'Anticoagulant' },
  { value: 'insulin', label: 'Insulin' },
  { value: 'opioid', label: 'Opioid' },
  { value: 'dmard', label: 'DMARD' },
  { value: 'lithium', label: 'Lithium' },
  { value: 'methotrexate', label: 'Methotrexate' },
  { value: 'other', label: 'Other' }
];

const adherenceOptions = [
  { value: 'good', label: 'Good' },
  { value: 'partial', label: 'Partial' },
  { value: 'poor', label: 'Poor' },
  { value: 'unknown', label: 'Unknown' }
];

const monitoringUpToDateOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'na', label: 'Not applicable' }
];

const acbOptions = [
  { value: '0', label: '0 — none' },
  { value: '1', label: '1 — possible' },
  { value: '2', label: '2 — definite' },
  { value: '3', label: '3 — definite (high)' }
];

/** Build one option list HTML string, marking the current value selected. */
function optionListHtml(options, current, placeholder) {
  return [
    `<option value="">${esc(placeholder || '— Select —')}</option>`,
    ...options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current ?? '') ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');
}

/**
 * Editor for the repeating list of medicines. Each medicine renders as a card
 * of fields with a remove button; an "add medicine" button appends a fresh
 * blank row. Every change writes straight into `state.medicines[idx]` and
 * refreshes persistence, progress, and the live summary.
 * @returns {HTMLElement}
 */
function medicineEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.medicines;
    wrapper.innerHTML = '';

    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No medicines added yet. Add one row per medicine reviewed.';
      wrapper.appendChild(empty);
    }

    rows.forEach((row, idx) => {
      const card = document.createElement('div');
      card.className = 'list-row medicine-row';
      card.innerHTML = `
        <div class="list-row-header">
          <h4>Medicine ${idx + 1}</h4>
          <button type="button" class="button" data-variant="icon" data-action="remove" aria-label="Remove medicine ${idx + 1}">&times;</button>
        </div>
        <div class="list-grid medicine-grid">
          <label class="list-cell">
            <span>Medicine name</span>
            <input type="text" class="text-input" data-key="drugName" value="${esc(row.drugName)}" placeholder="e.g. Amitriptyline">
          </label>
          <label class="list-cell">
            <span>Form and strength</span>
            <input type="text" class="text-input" data-key="formStrength" value="${esc(row.formStrength)}" placeholder="e.g. Tablet 10 mg">
          </label>
          <label class="list-cell">
            <span>Dose and regimen</span>
            <input type="text" class="text-input" data-key="doseRegimen" value="${esc(row.doseRegimen)}" placeholder="e.g. One at night">
          </label>
          <label class="list-cell">
            <span>Indication</span>
            <input type="text" class="text-input" data-key="indication" value="${esc(row.indication)}" placeholder="e.g. Neuropathic pain">
          </label>
          <label class="list-cell">
            <span>Indication recorded?</span>
            <select class="select" data-key="indicationRecorded">${optionListHtml(yesNo, row.indicationRecorded)}</select>
          </label>
          <label class="list-cell">
            <span>Regular medicine?</span>
            <select class="select" data-key="isRegular">${optionListHtml(yesNo, row.isRegular)}</select>
          </label>
          <label class="list-cell">
            <span>High-risk medicine?</span>
            <select class="select" data-key="isHighRisk">${optionListHtml(yesNo, row.isHighRisk)}</select>
          </label>
          <label class="list-cell">
            <span>High-risk class</span>
            <select class="select" data-key="highRiskClass">${optionListHtml(highRiskClassOptions, row.highRiskClass)}</select>
          </label>
          <label class="list-cell">
            <span>Adherence</span>
            <select class="select" data-key="adherence">${optionListHtml(adherenceOptions, row.adherence)}</select>
          </label>
          <label class="list-cell">
            <span>Anticholinergic burden (0-3)</span>
            <select class="select" data-key="anticholinergicBurdenPoints">${optionListHtml(acbOptions, row.anticholinergicBurdenPoints)}</select>
          </label>
          <label class="list-cell">
            <span>Monitoring required?</span>
            <select class="select" data-key="monitoringRequired">${optionListHtml(yesNo, row.monitoringRequired)}</select>
          </label>
          <label class="list-cell">
            <span>Monitoring up to date?</span>
            <select class="select" data-key="monitoringUpToDate">${optionListHtml(monitoringUpToDateOptions, row.monitoringUpToDate)}</select>
          </label>
          <label class="list-cell">
            <span>Deprescribing candidate?</span>
            <select class="select" data-key="deprescribingCandidate">${optionListHtml(yesNo, row.deprescribingCandidate)}</select>
          </label>
          <label class="list-cell">
            <span>STOPP criterion</span>
            <input type="text" class="text-input" data-key="stoppCriterion" value="${esc(row.stoppCriterion)}" placeholder="e.g. STOPP D5 — TCA with dementia">
          </label>
          <label class="list-cell">
            <span>START criterion</span>
            <input type="text" class="text-input" data-key="startCriterion" value="${esc(row.startCriterion)}" placeholder="e.g. START A6 — statin in diabetes">
          </label>
        </div>
      `;

      card.querySelectorAll('input, select').forEach((inp) => {
        const handler = () => {
          const key = inp.dataset.key;
          let value = inp.value;
          if (key === 'anticholinergicBurdenPoints') {
            value = value === '' ? null : Number(value);
          }
          rows[idx][key] = value;
          saveState(state);
          updateProgress();
          refreshLiveSummary();
        };
        inp.addEventListener('input', handler);
        inp.addEventListener('change', handler);
      });

      card.querySelector('[data-action="remove"]').addEventListener('click', () => {
        rows.splice(idx, 1);
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
    addBtn.textContent = '+ Add medicine';
    addBtn.addEventListener('click', () => {
      state.medicines.push(emptyMedicine());
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
// Section renderers (1 per SMR step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Review context',
    description: 'Who is reviewing, when, where, and how the consultation is conducted.'
  });

  card.appendChild(textInput({
    label: 'Reviewing clinician name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. Priya Nair, clinical pharmacist'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'clinical-pharmacist', label: 'Clinical pharmacist' },
      { value: 'gp', label: 'GP' },
      { value: 'pharmacy-technician', label: 'Pharmacy technician' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of review',
    section: 'context', field: 'reviewedAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'careSetting', required: true,
    options: [
      { value: 'gp-practice', label: 'GP practice' },
      { value: 'pcn', label: 'Primary Care Network' },
      { value: 'care-home', label: 'Care home' },
      { value: 'community-pharmacy', label: 'Community pharmacy' },
      { value: 'patient-home', label: "Patient's home" }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Consultation mode',
    section: 'context', field: 'consultationMode',
    options: [
      { value: 'face-to-face', label: 'Face to face' },
      { value: 'telephone', label: 'Telephone' },
      { value: 'video', label: 'Video' },
      { value: 'home-visit', label: 'Home visit' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age band, sex, frailty, and long-term conditions.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. GP-204817 or NHS number'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    options: [
      { value: '18-39', label: '18-39' },
      { value: '40-64', label: '40-64' },
      { value: '65-74', label: '65-74' },
      { value: '75-84', label: '75-84' },
      { value: '85-plus', label: '85 and over' }
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
  card.appendChild(selectInput({
    label: 'Frailty status',
    section: 'identification', field: 'frailtyStatus',
    options: [
      { value: 'fit', label: 'Fit' },
      { value: 'mild', label: 'Mild frailty' },
      { value: 'moderate', label: 'Moderate frailty' },
      { value: 'severe', label: 'Severe frailty' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Lives in a care home?',
    section: 'identification', field: 'livesInCareHome', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Long-term conditions',
    section: 'identification', field: 'longTermConditions',
    placeholder: 'e.g. Hypertension, type 2 diabetes, osteoarthritis, depression'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Problems and patient concerns',
    description: 'Presenting problems, patient-reported issues, and what matters most to the patient.'
  });

  card.appendChild(textArea({
    label: 'Presenting problems / reasons for review',
    section: 'problems', field: 'presentingProblems', required: true,
    hint: 'Required for a complete review.',
    placeholder: 'e.g. Problematic polypharmacy, recent fall, dizziness'
  }));
  card.appendChild(textArea({
    label: 'Patient-reported side effects and difficulties',
    section: 'problems', field: 'patientReportedIssues',
    placeholder: 'e.g. Dry mouth, drowsiness, trouble opening blister packs'
  }));
  card.appendChild(textArea({
    label: 'What matters to the patient',
    section: 'problems', field: 'whatMattersToPatient', required: true,
    hint: 'Required for a complete review.',
    placeholder: 'e.g. Wants to reduce the number of tablets and stay independent'
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Medicines',
    description: 'One row per medicine reviewed. Add each medicine with its indication, adherence, anticholinergic burden, monitoring, and any STOPP/START criterion.'
  });

  const host = document.createElement('div');
  host.className = 'field';
  host.appendChild(medicineEditor());
  card.appendChild(host);

  card.appendChild(readOnlyReadout({
    label: 'Live burden and status',
    id: 'live-summary-readout',
    render: () => renderLiveSummary()
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Monitoring',
    description: 'Blood tests and other monitoring due or overdue for the patient’s medicines.'
  });

  card.appendChild(textArea({
    label: 'Monitoring due / outstanding',
    section: 'monitoring', field: 'monitoringDue', required: true,
    hint: 'Required for a complete review.',
    placeholder: 'e.g. U&Es for ACE inhibitor, INR for warfarin, annual lithium level'
  }));
  card.appendChild(textInput({
    label: 'Number of overdue monitoring items',
    section: 'monitoring', field: 'overdueMonitoringCount',
    type: 'number', min: 0, max: 50, step: 1,
    hint: 'One or more overdue items raises a monitoring flag.'
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Patient goals and shared decisions',
    description: 'Decisions agreed together with the patient.'
  });

  card.appendChild(textArea({
    label: 'Shared decisions agreed with the patient',
    section: 'goals', field: 'sharedDecisions', required: true,
    hint: 'Required for a complete review.',
    placeholder: 'e.g. Agreed to trial stopping amitriptyline and review pain in 4 weeks'
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Agreed actions and plan',
    description: 'The follow-up plan, the next review date, and whether the review is complete.'
  });

  card.appendChild(textArea({
    label: 'Follow-up plan and agreed actions',
    section: 'plan', field: 'followUpPlan',
    placeholder: 'e.g. Pharmacist to deprescribe, GP to add statin, recheck bloods in 2 weeks'
  }));
  card.appendChild(textInput({
    label: 'Next review date',
    section: 'plan', field: 'followUpDate', type: 'date'
  }));
  card.appendChild(radioGroup({
    label: 'Is the review complete?',
    section: 'plan', field: 'reviewCompleted', options: yesNo,
    required: false
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Summary and outputs',
    description: 'Live burden indicator and review status, plus a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Review summary',
    id: 'live-summary-readout-2',
    render: () => renderLiveSummary()
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'note', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, rationale, and any actions already taken.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the live burden / status summary. */
function renderLiveSummary() {
  const g = calculateSmrGrade(state);
  const burden = `<span class="risk-badge ${burdenBandClass(g.burdenBand)}">${esc(burdenBandLabel(g.burdenBand))}</span>`;
  const status = `<span class="risk-badge ${reviewStatusClass(g.reviewStatus)}">${esc(reviewStatusLabel(g.reviewStatus))}</span>`;
  const acbCls = g.anticholinergicBand === 'significant' ? 'warn' : 'ok';
  return (
    `<div class="readout-line"><strong>${g.medicineCount}</strong> medicine(s), ` +
    `<strong>${g.regularMedicineCount}</strong> regular</div>` +
    `<div class="readout-line">ACB score <strong class="${acbCls}">${g.anticholinergicBurdenScore}</strong> ` +
    `<span class="muted">(${esc(anticholinergicBandLabel(g.anticholinergicBand))})</span></div>` +
    `<div class="readout-line"><span class="muted">${esc(polypharmacyBandLabel(g.polypharmacyBand))}</span></div>` +
    `<div class="readout-line">Burden ${burden} &nbsp; Status ${status}</div>`
  );
}

function refreshLiveSummary() {
  ['live-summary-readout', 'live-summary-readout-2'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = renderLiveSummary();
  });
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

// Each plain section maps to one or more progress "slots"; a slot counts as
// answered when ANY of its fields is answered. The medicines step is handled
// separately (answered when at least one medicine row exists).
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['careSetting'], ['consultationMode']],
  identification: [['patientIdentifier'], ['ageBand'], ['sex'], ['frailtyStatus']],
  problems: [['presentingProblems'], ['whatMattersToPatient']],
  monitoring: [['monitoringDue']],
  goals: [['sharedDecisions']],
  plan: [['followUpPlan'], ['reviewCompleted']],
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

  // Medicines: a synthetic single-slot section.
  const medsAnswered = state.medicines.length > 0 ? 1 : 0;
  sectionTotal['medicines'] = 1;
  sectionAnswered['medicines'] = medsAnswered;
  total++;
  answered += medsAnswered;

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

  const {
    medicineCount, regularMedicineCount, anticholinergicBurdenScore,
    polypharmacyBand, anticholinergicBand, burdenBand, reviewStatus,
    stopFlags, startFlags, flaggedIssues, timestamp
  } = lastResult;

  const medicineRows = state.medicines.length === 0
    ? `<tr><td colspan="5" class="muted">No medicines recorded.</td></tr>`
    : state.medicines.map((m, i) => `
      <tr>
        <th scope="row">${esc(m.drugName || `Medicine ${i + 1}`)}</th>
        <td>${esc(m.indication || '—')}</td>
        <td>${esc(m.isRegular === 'yes' ? 'Regular' : (m.isRegular === 'no' ? 'When required' : '—'))}${m.isHighRisk === 'yes' ? ` · high-risk ${esc(highRiskClassLabel(m.highRiskClass) || '')}` : ''}</td>
        <td>${esc(adherenceLabel(m.adherence) || '—')}</td>
        <td class="num"><span class="grade-pill">${m.anticholinergicBurdenPoints === null ? 0 : m.anticholinergicBurdenPoints}</span></td>
      </tr>
    `).join('');

  const criteriaList = (title, items) =>
    items.length === 0
      ? `<p class="muted">No ${esc(title)} criteria identified.</p>`
      : `<ul class="flags">${items.map((f) => `
          <li><span class="flag-category">${esc(f.drugName)}</span><span class="flag-message">${esc(f.criterion)}</span></li>
        `).join('')}</ul>`;

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

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Structured Medication Review Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${burdenBandClass(burdenBand)}">
        <div>
          <span class="risk-banner-label">Composite burden band</span>
          <span class="risk-banner-value">${esc(burdenBandLabel(burdenBand))}</span>
        </div>
        <span class="risk-badge ${reviewStatusClass(reviewStatus)}">${esc(reviewStatusLabel(reviewStatus))}</span>
      </div>

      <h3>Indicators</h3>
      <table class="subscales">
        <tbody>
          <tr><th scope="row">Medicines reviewed</th><td>${medicineCount}</td></tr>
          <tr><th scope="row">Regular medicines</th><td>${regularMedicineCount} — ${esc(polypharmacyBandLabel(polypharmacyBand))}</td></tr>
          <tr><th scope="row">Anticholinergic burden (ACB)</th><td>${anticholinergicBurdenScore} — ${esc(anticholinergicBandLabel(anticholinergicBand))}</td></tr>
          <tr><th scope="row">Review status</th><td>${esc(reviewStatusLabel(reviewStatus))}</td></tr>
        </tbody>
      </table>

      <h3>Medicines (${medicineCount})</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Medicine</th>
            <th scope="col">Indication</th>
            <th scope="col">Type</th>
            <th scope="col">Adherence</th>
            <th scope="col">ACB</th>
          </tr>
        </thead>
        <tbody>${medicineRows}</tbody>
      </table>

      <h3>STOPP criteria (${stopFlags.length})</h3>
      ${criteriaList('STOPP', stopFlags)}

      <h3>START criteria (${startFlags.length})</h3>
      ${criteriaList('START', startFlags)}

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
  const grade = calculateSmrGrade(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    ...grade,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh review?')) return;
  clearState();
  state = emptyReview();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'identification', title: 'Patient' },
  { step: 3, section: 'problems',       title: 'Problems' },
  { step: 4, section: 'medicines',      title: 'Medicines' },
  { step: 5, section: 'monitoring',     title: 'Monitoring' },
  { step: 6, section: 'goals',          title: 'Goals' },
  { step: 7, section: 'plan',           title: 'Plan' },
  { step: 8, section: 'note',           title: 'Summary' }
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
  host.appendChild(renderStep8());
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveSummary();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
