import { gradeFallRisk } from './fall-risk-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { mfsItems } from './mfs-rules.js';
import { emptyAssessment, severityClass, severityLabel } from './types.js';

// Fall Risk Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure Morse Fall Scale grader plus the flag detector and renders
// an inline report. State is persisted to localStorage so a partial fill
// survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'fall-risk-assessment.front-end-form-with-html.v1';

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
  slug: 'fall-risk-assessment',
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

/**
 * Build a labelled text input.
 * @param {{ label: string, section: string, field: string, type?: string,
 *           placeholder?: string, required?: boolean, min?: number,
 *           max?: number, step?: number, unit?: string }} opts
 */
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
    <label class="label" for="${id}">${labelText}</label>
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

/**
 * Build a labelled multi-line text area.
 * @param {{ label: string, section: string, field: string, rows?: number,
 *           placeholder?: string }} opts
 */
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

/**
 * Build a select / dropdown input.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[] }} opts
 */
function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
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
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => { setField(opts.section, opts.field, sel.value); clearFieldError(id); });
  return wrapper;
}

/**
 * Build a radio group of string-valued options.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[] }} opts
 */
function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.innerHTML = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
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

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = `${groupId}-error`;
  wrapper.appendChild(errSpan);
  return wrapper;
}

/**
 * Build an MFS-item radio group of integer-scored options. The selected
 * value is stored as a number (e.g. 0, 15, 25) — never as a string.
 * @param {import('./mfs-rules.js').MfsItem} item
 */
function mfsRadioGroup(item) {
  const groupId = `mfs-${item.field}`;
  const current = state.mfs[item.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field radio-group mfs-item';

  const legend = document.createElement('legend');
  legend.innerHTML =
    `<span class="mfs-id">${esc(item.id)}</span>${esc(item.label)}`;
  wrapper.appendChild(legend);

  const desc = document.createElement('p');
  desc.className = 'section-description';
  desc.style.margin = '0 0 0.5rem';
  desc.textContent = item.description;
  wrapper.appendChild(desc);

  const list = document.createElement('div');
  list.className = 'radio-options';
  for (const option of item.options) {
    const radioId = `${groupId}-${option.score}`;
    const label = document.createElement('label');
    label.className = 'radio-option';
    label.htmlFor = radioId;
    const checked = current === option.score ? ' checked' : '';
    label.innerHTML = `
      <input type="radio" id="${radioId}" name="${groupId}"
             value="${option.score}"${checked}>
      <span>${esc(option.label)}</span>
      <span class="score-tag" aria-label="score ${option.score}">+${option.score}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) setField('mfs', item.field, option.score);
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);
  return wrapper;
}

/**
 * Build a section card.
 * @param {{ stepNumber: number, title: string, description?: string }} opts
 */
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
    `<span class="section-step">Section ${opts.stepNumber} of 10</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Repeating-list editor (medications)
// ----------------------------------------------------------------------

function medicationListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.medicationReview.medications;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No medications added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row';
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Warfarin">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 5 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. Daily">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove medication">&times;</button>
        </div>
      `;
      r.querySelectorAll('input').forEach((inp) => {
        inp.addEventListener('input', () => {
          const k = inp.dataset.key;
          rows[idx][k] = inp.value;
          saveState(state);
          updateProgress();
        });
      });
      r.querySelector('button').addEventListener('click', () => {
        rows.splice(idx, 1);
        saveState(state);
        rerender();
        updateProgress();
      });
      wrapper.appendChild(r);
    });
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'button';
    addBtn.setAttribute('data-variant', 'add');
    addBtn.textContent = '+ Add medication';
    addBtn.addEventListener('click', () => {
      rows.push({ name: '', dose: '', frequency: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

// ----------------------------------------------------------------------
// Section renderers (1 per step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic patient information and care setting.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'demographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(grid);

  const grid2 = document.createElement('div');
  grid2.className = 'two-col';
  grid2.appendChild(textInput({
    label: 'Date of Birth',
    section: 'demographics',
    field: 'dateOfBirth',
    type: 'date',
    required: true
  }));
  grid2.appendChild(textInput({
    label: 'Age',
    section: 'demographics', field: 'age',
    type: 'number', min: 0, max: 130, unit: 'years'
  }));
  card.appendChild(grid2);

  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'demographics',
    field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'demographics', field: 'careSetting',
    options: [
      { value: 'inpatient', label: 'Inpatient (hospital)' },
      { value: 'outpatient', label: 'Outpatient clinic' },
      { value: 'community', label: 'Community / home' },
      { value: 'long-term-care', label: 'Long-term care / nursing home' },
      { value: 'rehab', label: 'Rehabilitation unit' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Primary diagnosis',
    section: 'demographics', field: 'primaryDiagnosis',
    placeholder: 'e.g. Stroke, hip fracture'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Fall History',
    description: 'Falls in the last 12 months and their consequences.'
  });

  card.appendChild(radioGroup({
    label: 'Has the patient fallen in the past 12 months?',
    section: 'fallHistory', field: 'hasFallenInPastYear', options: yesNo
  }));
  const fallDetails = document.createElement('div');
  fallDetails.dataset.conditional = 'fallHistory.hasFallenInPastYear=yes';
  fallDetails.appendChild(textInput({
    label: 'Number of falls in the past 12 months',
    section: 'fallHistory', field: 'numberOfFallsPastYear',
    type: 'number', min: 0, max: 100
  }));
  fallDetails.appendChild(textInput({
    label: 'Date of most recent fall',
    section: 'fallHistory', field: 'lastFallDate',
    type: 'date'
  }));
  fallDetails.appendChild(radioGroup({
    label: 'Was the most recent fall injurious?',
    section: 'fallHistory', field: 'mostRecentFallInjurious', options: yesNo
  }));
  const injuryDetails = document.createElement('div');
  injuryDetails.dataset.conditional = 'fallHistory.mostRecentFallInjurious=yes';
  injuryDetails.appendChild(textInput({
    label: 'Injury details',
    section: 'fallHistory', field: 'mostRecentFallInjuryDetails',
    placeholder: 'e.g. wrist fracture, head laceration'
  }));
  fallDetails.appendChild(injuryDetails);
  card.appendChild(fallDetails);

  card.appendChild(radioGroup({
    label: 'Has the patient had recurrent falls with injury?',
    section: 'fallHistory', field: 'recurrentFallsWithInjury', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Does the patient report fear of falling?',
    section: 'fallHistory', field: 'fearOfFalling', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Circumstances of recent falls',
    section: 'fallHistory', field: 'fallCircumstances',
    placeholder: 'Where, when, what was the patient doing, and any contributing factors…',
    rows: 3
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Morse Fall Scale (MFS)',
    description:
      'Six-item validated bedside instrument. Total score 0-125: 0-24 Low, 25-44 Moderate, ≥45 High.'
  });
  for (const item of mfsItems) {
    card.appendChild(mfsRadioGroup(item));
  }
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Mobility & Gait Assessment',
    description: 'Functional mobility and signs of gait or balance impairment.'
  });

  card.appendChild(selectInput({
    label: 'Mobility level',
    section: 'mobilityGait', field: 'mobilityLevel',
    options: [
      { value: 'independent', label: 'Independent' },
      { value: 'supervision', label: 'Independent with supervision' },
      { value: 'assistance-1', label: 'Requires assistance of 1 person' },
      { value: 'assistance-2', label: 'Requires assistance of 2 people' },
      { value: 'wheelchair', label: 'Wheelchair-bound' },
      { value: 'bedbound', label: 'Bedbound' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Assistive device used',
    section: 'mobilityGait', field: 'assistiveDeviceUsed',
    options: [
      { value: 'none', label: 'None' },
      { value: 'cane', label: 'Cane' },
      { value: 'crutches', label: 'Crutches' },
      { value: 'walker', label: 'Walker / rollator' },
      { value: 'wheelchair', label: 'Wheelchair' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Unsteady gait?',
    section: 'mobilityGait', field: 'unsteadyGait', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Difficulty rising from a chair without using arms?',
    section: 'mobilityGait', field: 'difficultyRisingFromChair', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Balance impairment on standing or turning?',
    section: 'mobilityGait', field: 'balanceImpairment', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Lower-extremity weakness?',
    section: 'mobilityGait', field: 'weaknessLowerExtremity', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Orthostatic hypotension on standing?',
    section: 'mobilityGait', field: 'orthostaticHypotension', options: yesNo
  }));
  const orthoSevere = document.createElement('div');
  orthoSevere.dataset.conditional = 'mobilityGait.orthostaticHypotension=yes';
  orthoSevere.appendChild(radioGroup({
    label: 'Severe orthostatic hypotension (symptomatic / drop ≥30 mmHg systolic)?',
    section: 'mobilityGait', field: 'orthostaticHypotensionSevere', options: yesNo
  }));
  card.appendChild(orthoSevere);

  card.appendChild(textInput({
    label: 'Timed Up and Go (TUG)',
    section: 'mobilityGait', field: 'timedUpAndGoSeconds',
    placeholder: 'e.g. 14',
    unit: 'seconds'
  }));

  card.appendChild(textArea({
    label: 'Mobility / gait notes',
    section: 'mobilityGait', field: 'mobilityNotes',
    placeholder: 'Any additional observations…',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Medication Review',
    description: 'Current medications and high-risk drug classes for falls.'
  });

  const header = document.createElement('div');
  header.className = 'list-section-header';
  header.innerHTML = `
    <h3>Current medications</h3>
    <p class="hint">List all regular medications. Polypharmacy (≥4 medications) is a known fall-risk factor.</p>
  `;
  card.appendChild(header);
  card.appendChild(medicationListEditor());

  card.appendChild(radioGroup({
    label: 'Polypharmacy (4 or more medications)?',
    section: 'medicationReview', field: 'polypharmacy', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Sedatives or hypnotics (e.g. benzodiazepines, Z-drugs)?',
    section: 'medicationReview', field: 'sedativesOrHypnotics', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Antihypertensives?',
    section: 'medicationReview', field: 'antihypertensives', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Diuretics?',
    section: 'medicationReview', field: 'diuretics', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Anticoagulants (e.g. warfarin, DOAC, heparin)?',
    section: 'medicationReview', field: 'anticoagulants', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Opioids?',
    section: 'medicationReview', field: 'opioids', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Antidepressants?',
    section: 'medicationReview', field: 'antidepressants', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Antipsychotics?',
    section: 'medicationReview', field: 'antipsychotics', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Recent medication change (last 4 weeks)?',
    section: 'medicationReview', field: 'recentMedicationChange', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Medication notes',
    section: 'medicationReview', field: 'medicationNotes',
    placeholder: 'Any concerns about adherence, side effects, or interactions…',
    rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Vision & Sensory Assessment',
    description: 'Visual, hearing, and peripheral sensory function.'
  });

  card.appendChild(radioGroup({
    label: 'Vision impairment?',
    section: 'visionSensory', field: 'visionImpairment', options: yesNo
  }));
  const visionCorrected = document.createElement('div');
  visionCorrected.dataset.conditional = 'visionSensory.visionImpairment=yes';
  visionCorrected.appendChild(radioGroup({
    label: 'Vision corrected with glasses or contact lenses?',
    section: 'visionSensory', field: 'visionCorrected', options: yesNo
  }));
  card.appendChild(visionCorrected);

  card.appendChild(radioGroup({
    label: 'Hearing impairment?',
    section: 'visionSensory', field: 'hearingImpairment', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Peripheral neuropathy (loss of sensation in the feet)?',
    section: 'visionSensory', field: 'peripheralNeuropathy', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Cataracts?',
    section: 'visionSensory', field: 'cataracts', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Glaucoma?',
    section: 'visionSensory', field: 'glaucoma', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Macular degeneration?',
    section: 'visionSensory', field: 'macularDegeneration', options: yesNo
  }));

  card.appendChild(textInput({
    label: 'Vision last checked',
    section: 'visionSensory', field: 'visionLastChecked',
    type: 'date'
  }));

  card.appendChild(textArea({
    label: 'Sensory notes',
    section: 'visionSensory', field: 'sensoryNotes',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Environmental Assessment',
    description: 'Home or ward hazards that may contribute to falls.'
  });

  card.appendChild(radioGroup({
    label: 'Loose throw rugs?',
    section: 'environmental', field: 'loosThrowRugs', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Cluttered walkways?',
    section: 'environmental', field: 'clutteredWalkways', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Poor lighting (especially at night)?',
    section: 'environmental', field: 'poorLighting', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Stairs without handrails?',
    section: 'environmental', field: 'stairsWithoutHandrails', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Bathroom grab bars absent?',
    section: 'environmental', field: 'bathroomGrabBarsAbsent', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Unsuitable footwear?',
    section: 'environmental', field: 'unsuitableFootwear', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Bed height problem (too high or too low)?',
    section: 'environmental', field: 'bedHeightProblem', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Hip protectors currently used?',
    section: 'environmental', field: 'hipProtectorsUsed', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Environmental notes',
    section: 'environmental', field: 'environmentalNotes',
    rows: 3
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Cognitive Assessment',
    description: 'Cognition, awareness, and behavioural risk factors for falls.'
  });

  card.appendChild(radioGroup({
    label: 'Diagnosis of dementia?',
    section: 'cognitive', field: 'dementiaDiagnosis', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Confusion or disorientation?',
    section: 'cognitive', field: 'confusionOrDisorientation', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Impulsivity (acts without thinking)?',
    section: 'cognitive', field: 'impulsivity', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Overestimates own physical ability?',
    section: 'cognitive', field: 'overestimatesAbility', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Acute delirium?',
    section: 'cognitive', field: 'delirium', options: yesNo
  }));

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(selectInput({
    label: 'Cognitive screen tool used',
    section: 'cognitive', field: 'cognitiveScreenTool',
    options: [
      { value: 'mmse', label: 'MMSE' },
      { value: 'moca', label: 'MoCA' },
      { value: '4at', label: '4AT' },
      { value: 'amt', label: 'AMT (Abbreviated Mental Test)' },
      { value: 'other', label: 'Other' },
      { value: 'none', label: 'None performed' }
    ]
  }));
  grid.appendChild(textInput({
    label: 'Cognitive screen score',
    section: 'cognitive', field: 'cognitiveScreenScore',
    placeholder: 'e.g. 24/30'
  }));
  card.appendChild(grid);

  card.appendChild(textArea({
    label: 'Cognitive notes',
    section: 'cognitive', field: 'cognitiveNotes',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Previous Interventions',
    description: 'Fall-prevention interventions that have already been provided.'
  });

  card.appendChild(radioGroup({
    label: 'Falls clinic referral made?',
    section: 'previousInterventions', field: 'fallsClinicReferral', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Physiotherapy provided?',
    section: 'previousInterventions', field: 'physiotherapyProvided', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Occupational therapy provided?',
    section: 'previousInterventions', field: 'occupationalTherapyProvided', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Medication review completed in the last 12 months?',
    section: 'previousInterventions', field: 'medicationReviewCompleted', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Home safety assessment completed?',
    section: 'previousInterventions', field: 'homeSafetyAssessment', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Has the patient declined a recommended intervention?',
    section: 'previousInterventions', field: 'interventionDeclined', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Has a previous referral been missed (no-show / cancelled)?',
    section: 'previousInterventions', field: 'missedReferral', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Intervention notes',
    section: 'previousInterventions', field: 'interventionNotes',
    rows: 3
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Fall Prevention Plan',
    description: 'Planned and recommended interventions going forward.'
  });

  card.appendChild(radioGroup({
    label: 'Bed alarm in use / recommended?',
    section: 'preventionPlan', field: 'bedAlarm', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Chair alarm in use / recommended?',
    section: 'preventionPlan', field: 'chairAlarm', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Non-slip footwear?',
    section: 'preventionPlan', field: 'nonSlipFootwear', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Hip protectors recommended?',
    section: 'preventionPlan', field: 'hipProtectorsRecommended', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Exercise / strength + balance programme?',
    section: 'preventionPlan', field: 'exerciseProgramme', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Vitamin D supplementation?',
    section: 'preventionPlan', field: 'vitaminDSupplement', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Environmental modifications recommended?',
    section: 'preventionPlan', field: 'environmentalModifications', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Medication deprescribing planned?',
    section: 'preventionPlan', field: 'medicationDeprescribing', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Carer education provided?',
    section: 'preventionPlan', field: 'carerEducationProvided', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Plan notes',
    section: 'preventionPlan', field: 'planNotes',
    placeholder: 'Specific actions, owners, and follow-up dates…',
    rows: 4
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections
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

const TRACKED_FIELDS = [
  // Demographics
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'age'],
  ['demographics', 'careSetting'],
  // Fall history
  ['fallHistory', 'hasFallenInPastYear'],
  ['fallHistory', 'recurrentFallsWithInjury'],
  ['fallHistory', 'fearOfFalling'],
  // MFS (6 items)
  ['mfs', 'historyOfFalling'],
  ['mfs', 'secondaryDiagnosis'],
  ['mfs', 'ambulatoryAid'],
  ['mfs', 'ivOrHeparinLock'],
  ['mfs', 'gaitTransferring'],
  ['mfs', 'mentalStatus'],
  // Mobility & gait
  ['mobilityGait', 'mobilityLevel'],
  ['mobilityGait', 'assistiveDeviceUsed'],
  ['mobilityGait', 'unsteadyGait'],
  ['mobilityGait', 'difficultyRisingFromChair'],
  ['mobilityGait', 'balanceImpairment'],
  ['mobilityGait', 'weaknessLowerExtremity'],
  ['mobilityGait', 'orthostaticHypotension'],
  // Medication review
  ['medicationReview', 'polypharmacy'],
  ['medicationReview', 'sedativesOrHypnotics'],
  ['medicationReview', 'antihypertensives'],
  ['medicationReview', 'diuretics'],
  ['medicationReview', 'anticoagulants'],
  ['medicationReview', 'opioids'],
  ['medicationReview', 'antidepressants'],
  ['medicationReview', 'antipsychotics'],
  ['medicationReview', 'recentMedicationChange'],
  // Vision & sensory
  ['visionSensory', 'visionImpairment'],
  ['visionSensory', 'hearingImpairment'],
  ['visionSensory', 'peripheralNeuropathy'],
  ['visionSensory', 'cataracts'],
  ['visionSensory', 'glaucoma'],
  ['visionSensory', 'macularDegeneration'],
  // Environmental
  ['environmental', 'loosThrowRugs'],
  ['environmental', 'clutteredWalkways'],
  ['environmental', 'poorLighting'],
  ['environmental', 'stairsWithoutHandrails'],
  ['environmental', 'bathroomGrabBarsAbsent'],
  ['environmental', 'unsuitableFootwear'],
  ['environmental', 'bedHeightProblem'],
  ['environmental', 'hipProtectorsUsed'],
  // Cognitive
  ['cognitive', 'dementiaDiagnosis'],
  ['cognitive', 'confusionOrDisorientation'],
  ['cognitive', 'impulsivity'],
  ['cognitive', 'overestimatesAbility'],
  ['cognitive', 'delirium'],
  // Previous interventions
  ['previousInterventions', 'fallsClinicReferral'],
  ['previousInterventions', 'physiotherapyProvided'],
  ['previousInterventions', 'occupationalTherapyProvided'],
  ['previousInterventions', 'medicationReviewCompleted'],
  ['previousInterventions', 'homeSafetyAssessment'],
  ['previousInterventions', 'interventionDeclined'],
  ['previousInterventions', 'missedReferral'],
  // Prevention plan
  ['preventionPlan', 'bedAlarm'],
  ['preventionPlan', 'chairAlarm'],
  ['preventionPlan', 'nonSlipFootwear'],
  ['preventionPlan', 'hipProtectorsRecommended'],
  ['preventionPlan', 'exerciseProgramme'],
  ['preventionPlan', 'vitaminDSupplement'],
  ['preventionPlan', 'environmentalModifications'],
  ['preventionPlan', 'medicationDeprescribing'],
  ['preventionPlan', 'carerEducationProvided']
];

function updateProgress() {
  let answered = 0;
  for (const [section, field] of TRACKED_FIELDS) {
    const v = state[section][field];
    if (v !== null && v !== undefined && v !== '') answered++;
  }
  const total = TRACKED_FIELDS.length;
  const percent = Math.round((answered / total) * 100);
  const bar = document.getElementById('progress-bar-fill');
  const text = document.getElementById('progress-text');
  if (bar) bar.style.width = `${percent}%`;
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  const aria = document.getElementById('progress-bar');
  if (aria) aria.setAttribute('aria-valuenow', String(percent));
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
    mfsScore, severity, criticalOverride, criticalReasons,
    answeredCount, firedRules, additionalFlags, timestamp
  } = lastResult;

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

  const firedRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
      <td class="num">+${r.score}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No MFS items answered.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Item</th>
            <th scope="col">Selected response</th>
            <th scope="col" class="num">Score</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
        <tfoot>
          <tr>
            <th colspan="3" scope="row">Total MFS</th>
            <td class="num">${mfsScore} / 125</td>
          </tr>
        </tfoot>
      </table>
    `;

  const criticalBlock = criticalOverride
    ? `
      <p class="muted" style="margin-top:0.25rem;">
        Severity escalated to <strong>Critical</strong> because of:
        ${criticalReasons.map(esc).join('; ')}.
      </p>
    `
    : '';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Fall Risk Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Morse Fall Scale Total</h3>
      <p class="mfs-summary">
        <span class="mfs-score-badge ${severityClass(severity)}">${mfsScore} / 125</span>
        <span class="severity-label ${severityClass(severity)}">${esc(severityLabel(severity))}</span>
      </p>
      <p class="muted">Based on ${answeredCount} of 6 MFS items answered.</p>
      ${criticalBlock}

      <h3>MFS score breakdown</h3>
      ${firedTable}

      <h3>Flagged Issues</h3>
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
  const errs = validateForm();
  if (errs.length > 0) return;
  const grading = gradeFallRisk(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    mfsScore: grading.mfsScore,
    severity: grading.severity,
    criticalOverride: grading.criticalOverride,
    criticalReasons: grading.criticalReasons,
    answeredCount: grading.answeredCount,
    firedRules: grading.firedRules,
    additionalFlags,
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'demographics', title: 'Demographics' },
  { step: 2, section: 'fallHistory', title: 'Fall History' },
  { step: 3, section: '', title: 'Morse Fall Scale (MFS)' },
  { step: 4, section: 'mobilityGait', title: 'Mobility & Gait Assessment' },
  { step: 5, section: 'medicationReview', title: 'Medication Review' },
  { step: 6, section: 'visionSensory', title: 'Vision & Sensory Assessment' },
  { step: 7, section: 'environmental', title: 'Environmental Assessment' },
  { step: 8, section: 'cognitive', title: 'Cognitive Assessment' },
  { step: 9, section: 'previousInterventions', title: 'Previous Interventions' },
  { step: 10, section: 'preventionPlan', title: 'Fall Prevention Plan' }
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
  const required = form.querySelectorAll('[data-required]');
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
  host.appendChild(renderStep9());
  host.appendChild(renderStep10());
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
