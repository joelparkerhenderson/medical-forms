import { gradeESAS } from './esas-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { ESAS_ITEMS, classifyESASTotal, classifyIndividualSymptom, emptyAssessment, severityBandClass, severityBandLabel } from './types.js';

// Palliative Assessment - patient / carer wizard (vanilla JavaScript, no
// build step). Single-page continuous wizard: every section is rendered
// into the page in document order. The user scrolls through them; a
// sticky top-of-page progress summary reflects how many fields have been
// answered. Submission runs the pure ESAS-r grader and renders an inline
// report. State is persisted to localStorage so a partial fill survives a
// page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'palliative-assessment.front-end-form-with-html.v1';

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
  slug: 'palliative-assessment',
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
    updateConditionalSections();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs progress and conditional visibility after each change.
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
  const reqAttrs = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"${reqAttrs}
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

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  const reqAttrs = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    <select id="${id}" name="${id}" class="select"${reqAttrs} aria-describedby="${id}-error">
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
    `<span class="section-step">Section ${opts.stepNumber} of 9</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// ESAS-r 0-10 scale (radio buttons in a row)
// ----------------------------------------------------------------------

/**
 * Render a single ESAS-r symptom row: 11 radio buttons (0-10) plus low and
 * high pole labels and a "clear" button.
 *
 * @param {{ key: string, label: string, lowPole: string, highPole: string }} item
 */
function esasScaleRow(item) {
  const groupName = `esasrSymptoms-${item.key}`;
  const current = state.esasrSymptoms[item.key];
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'field esas-row';

  const legend = document.createElement('legend');
  legend.className = 'esas-legend';
  legend.innerHTML = `<span class="esas-label">${esc(item.label)}</span>`;
  fieldset.appendChild(legend);

  const poles = document.createElement('div');
  poles.className = 'esas-poles';
  poles.innerHTML = `
    <span class="esas-pole esas-pole-low">0 — ${esc(item.lowPole)}</span>
    <span class="esas-pole esas-pole-high">10 — ${esc(item.highPole)}</span>
  `;
  fieldset.appendChild(poles);

  const scale = document.createElement('div');
  scale.className = 'esas-scale';
  scale.setAttribute('role', 'radiogroup');
  scale.setAttribute('aria-label', `${item.label} from 0 to 10`);

  for (let n = 0; n <= 10; n += 1) {
    const radioId = `${groupName}-${n}`;
    const checked = current === n ? ' checked' : '';
    const label = document.createElement('label');
    label.className = 'esas-tick';
    label.htmlFor = radioId;
    label.dataset.value = String(n);
    label.innerHTML = `
      <input type="radio" id="${radioId}" name="${groupName}" value="${n}"${checked}>
      <span class="esas-tick-num">${n}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        setField('esasrSymptoms', item.key, n);
        // Re-style ticks in this row to reflect selection.
        scale.querySelectorAll('.esas-tick').forEach((el) => {
          el.classList.toggle('is-selected', Number(el.dataset.value) === n);
        });
        applySeverityClass(scale, n);
      }
    });
    if (current === n) label.classList.add('is-selected');
    scale.appendChild(label);
  }

  if (current !== null && current !== undefined) {
    applySeverityClass(scale, current);
  }
  fieldset.appendChild(scale);

  // Clear button — sets the value back to null so the item is "unanswered"
  // and excluded from the total.
  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'btn-link esas-clear';
  clearBtn.textContent = 'Clear';
  clearBtn.addEventListener('click', () => {
    setField('esasrSymptoms', item.key, null);
    scale.querySelectorAll('.esas-tick').forEach((el) => el.classList.remove('is-selected'));
    scale.querySelectorAll('input[type=radio]').forEach((el) => { el.checked = false; });
    applySeverityClass(scale, null);
  });
  fieldset.appendChild(clearBtn);

  return fieldset;
}

/** Add a severity class (none/mild/moderate/severe) to the scale wrapper. */
function applySeverityClass(scale, score) {
  scale.classList.remove('severity-none', 'severity-mild', 'severity-moderate', 'severity-severe');
  const band = classifyIndividualSymptom(score);
  if (band) scale.classList.add(`severity-${band}`);
}

// ----------------------------------------------------------------------
// Repeating-list editors (regular and as-needed medications)
// ----------------------------------------------------------------------

/**
 * Editor for an array of medication rows (name, dose, route, frequency,
 * indication).
 * @param {{ section: string, field: string, addLabel: string }} opts
 */
function medicationListEditor(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';
  wrapper.dataset.list = `${opts.section}.${opts.field}`;

  function rerender() {
    const rows = state[opts.section][opts.field];
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'None added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row med-row';
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Morphine sulfate">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 10 mg">
          </label>
          <label class="list-cell">
            <span>Route</span>
            <input type="text" class="text-input" data-key="route" value="${esc(row.route)}" placeholder="e.g. oral, SC">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. 4-hourly PRN">
          </label>
          <label class="list-cell">
            <span>Indication</span>
            <input type="text" class="text-input" data-key="indication" value="${esc(row.indication)}" placeholder="e.g. pain">
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
    addBtn.textContent = `+ ${opts.addLabel}`;
    addBtn.addEventListener('click', () => {
      rows.push({ name: '', dose: '', route: '', frequency: '', indication: '' });
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
// Section renderers (1 per palliative-assessment step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const yesNoUnknown = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Patient identification and assessment context.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'demographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(grid);

  const idGrid = document.createElement('div');
  idGrid.className = 'two-col';
  idGrid.appendChild(textInput({
    label: 'Date of Birth', section: 'demographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  idGrid.appendChild(textInput({
    label: 'NHS / MRN Number', section: 'demographics', field: 'nhsOrMrnNumber'
  }));
  card.appendChild(idGrid);

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

  const langGrid = document.createElement('div');
  langGrid.className = 'two-col';
  langGrid.appendChild(textInput({ label: 'Preferred Language', section: 'demographics', field: 'preferredLanguage' }));
  langGrid.appendChild(textInput({ label: 'Ethnicity', section: 'demographics', field: 'ethnicity' }));
  card.appendChild(langGrid);

  card.appendChild(radioGroup({
    label: 'Who is completing this assessment?',
    section: 'demographics',
    field: 'reporterRole',
    options: [
      { value: 'patient',   label: 'Patient' },
      { value: 'carer',     label: 'Carer / family member' },
      { value: 'clinician', label: 'Clinician' },
      { value: 'family',    label: 'Other family member' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Name of person completing the assessment (if not the patient)',
    section: 'demographics', field: 'reporterName'
  }));

  const dateGrid = document.createElement('div');
  dateGrid.className = 'two-col';
  dateGrid.appendChild(textInput({
    label: 'Assessment Date', section: 'demographics', field: 'assessmentDate', type: 'date'
  }));
  dateGrid.appendChild(selectInput({
    label: 'Assessment Setting', section: 'demographics', field: 'assessmentSetting',
    options: [
      { value: 'home',          label: 'Home' },
      { value: 'hospice',       label: 'Hospice (inpatient)' },
      { value: 'hospice-day',   label: 'Hospice (day services)' },
      { value: 'hospital',      label: 'Hospital ward' },
      { value: 'outpatient',    label: 'Outpatient clinic' },
      { value: 'care-home',     label: 'Care home / nursing home' },
      { value: 'community',     label: 'Community (other)' }
    ]
  }));
  card.appendChild(dateGrid);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Primary Diagnosis & Prognosis',
    description: 'Underlying illness, disease trajectory, and prognostic information.'
  });

  card.appendChild(textInput({
    label: 'Primary diagnosis',
    section: 'primaryDiagnosisPrognosis', field: 'primaryDiagnosis',
    placeholder: 'e.g. metastatic non-small-cell lung cancer'
  }));

  card.appendChild(textArea({
    label: 'Other / secondary diagnoses',
    section: 'primaryDiagnosisPrognosis', field: 'secondaryDiagnoses',
    placeholder: 'List comorbid conditions relevant to palliative care…',
    rows: 3
  }));

  const dateGrid = document.createElement('div');
  dateGrid.className = 'two-col';
  dateGrid.appendChild(textInput({
    label: 'Date of primary diagnosis', section: 'primaryDiagnosisPrognosis',
    field: 'dateOfDiagnosis', type: 'date'
  }));
  dateGrid.appendChild(textInput({
    label: 'Stage / severity',
    section: 'primaryDiagnosisPrognosis', field: 'stageOrSeverity',
    placeholder: 'e.g. stage IV, NYHA IV, MELD 25'
  }));
  card.appendChild(dateGrid);

  card.appendChild(radioGroup({
    label: 'Is the underlying disease progressing?',
    section: 'primaryDiagnosisPrognosis', field: 'diseaseProgressing',
    options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Estimated prognosis (clinician judgement)',
    section: 'primaryDiagnosisPrognosis', field: 'prognosisHorizon',
    options: [
      { value: 'days',      label: 'Days' },
      { value: 'weeks',     label: 'Weeks' },
      { value: 'months',    label: 'Months' },
      { value: 'years',     label: 'Years' },
      { value: 'uncertain', label: 'Uncertain' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Surprise question — Would you be surprised if the patient died within the next 12 months?',
    section: 'primaryDiagnosisPrognosis', field: 'surpriseQuestion',
    options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Prognostic indicators (e.g. SPICT, GSF, frailty score)',
    section: 'primaryDiagnosisPrognosis', field: 'prognosticIndicators',
    rows: 3
  }));

  card.appendChild(textArea({
    label: 'Relevant treatment history',
    section: 'primaryDiagnosisPrognosis', field: 'relevantTreatmentHistory',
    placeholder: 'Recent treatments, response, ongoing therapies…',
    rows: 3
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'ESAS-r Symptom Scoring',
    description: 'For each symptom, choose a number from 0 (no symptom) to 10 (worst possible). Leave blank if the question does not apply.'
  });

  const intro = document.createElement('p');
  intro.className = 'esas-intro';
  intro.innerHTML = `
    Please rate each of the following symptoms <strong>right now</strong>
    (or, if you prefer, your average over the last 24 hours). The total
    ESAS-r score is the sum of all answered items (0–100).
  `;
  card.appendChild(intro);

  const otherKey = 'other';
  // Render each symptom in order; for the "other" item, render an
  // additional free-text field for the user to label the symptom.
  ESAS_ITEMS.forEach((item) => {
    if (item.key === otherKey) {
      const labelField = document.createElement('div');
      labelField.className = 'field';
      const id = 'esasrSymptoms-otherLabel';
      labelField.innerHTML = `
        <label for="${id}">If you have another symptom not listed, please describe it</label>
        <input
          type="text"
          id="${id}"
          name="${id}"
          class="text-input"
          value="${esc(state.esasrSymptoms.otherLabel)}"
          placeholder="e.g. constipation, sleep, itch"
        >
      `;
      const labelInput = labelField.querySelector('input');
      labelInput.addEventListener('input', () => {
        setField('esasrSymptoms', 'otherLabel', labelInput.value);
      });
      card.appendChild(labelField);
    }
    card.appendChild(esasScaleRow(item));
  });

  card.appendChild(textArea({
    label: 'Other notes about your symptoms',
    section: 'esasrSymptoms', field: 'symptomNotes',
    placeholder: 'Add any other symptom information you would like the team to know…',
    rows: 3
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Performance Status',
    description: 'Functional status using PPS, AKPS, or ECOG (record what you have available).'
  });

  const psGrid = document.createElement('div');
  psGrid.className = 'three-col';
  psGrid.appendChild(textInput({
    label: 'PPS (Palliative Performance Scale)',
    section: 'performanceStatus', field: 'ppsScore',
    type: 'number', min: 0, max: 100, step: 10, unit: '%'
  }));
  psGrid.appendChild(textInput({
    label: 'AKPS (Australia-modified Karnofsky)',
    section: 'performanceStatus', field: 'akpsScore',
    type: 'number', min: 0, max: 100, step: 10, unit: '%'
  }));
  psGrid.appendChild(textInput({
    label: 'ECOG (0-4)',
    section: 'performanceStatus', field: 'ecogScore',
    type: 'number', min: 0, max: 4, step: 1
  }));
  card.appendChild(psGrid);

  card.appendChild(textArea({
    label: 'Mobility notes',
    section: 'performanceStatus', field: 'mobilityNotes',
    placeholder: 'Walking ability, transfers, falls, mobility aids…',
    rows: 3
  }));

  card.appendChild(selectInput({
    label: 'Activity level',
    section: 'performanceStatus', field: 'activityLevel',
    options: [
      { value: 'fully-active',      label: 'Fully active' },
      { value: 'restricted',        label: 'Restricted but ambulatory' },
      { value: 'self-care',         label: 'Capable of self-care, up > 50% waking hours' },
      { value: 'limited-self-care', label: 'Limited self-care, in bed/chair > 50% waking hours' },
      { value: 'bed-bound',         label: 'Completely disabled, bed-bound' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Is the patient bed-bound for most of the day?',
    section: 'performanceStatus', field: 'bedBound', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Does the patient need help with activities of daily living (washing, dressing, toileting, eating)?',
    section: 'performanceStatus', field: 'requiresAssistanceWithAdls', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'ADL / care notes',
    section: 'performanceStatus', field: 'adlNotes',
    placeholder: 'Specific ADL needs, equipment, social-care input…',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Goals of Care & ACP Documents',
    description: 'Patient priorities, preferred place of care/death, and advance-care planning documents (RESPECT/ReSPECT, ADRT, LPA, DNACPR).'
  });

  card.appendChild(textArea({
    label: 'Patient priorities and wishes',
    section: 'goalsOfCareACP', field: 'patientPrioritiesAndWishes',
    placeholder: 'What matters most to the patient? What are they hoping for? What do they want to avoid?',
    rows: 4
  }));

  const placeGrid = document.createElement('div');
  placeGrid.className = 'two-col';
  placeGrid.appendChild(textInput({
    label: 'Preferred place of care',
    section: 'goalsOfCareACP', field: 'preferredPlaceOfCare',
    placeholder: 'e.g. home, hospice, care home'
  }));
  placeGrid.appendChild(textInput({
    label: 'Preferred place of death',
    section: 'goalsOfCareACP', field: 'preferredPlaceOfDeath',
    placeholder: 'e.g. home, hospice'
  }));
  card.appendChild(placeGrid);

  // RESPECT / ReSPECT
  card.appendChild(radioGroup({
    label: 'Is a RESPECT / ReSPECT form completed?',
    section: 'goalsOfCareACP', field: 'respectFormCompleted',
    options: yesNoUnknown
  }));
  const respectDate = document.createElement('div');
  respectDate.dataset.conditional = 'goalsOfCareACP.respectFormCompleted=yes';
  respectDate.appendChild(textInput({
    label: 'RESPECT form date',
    section: 'goalsOfCareACP', field: 'respectFormDate', type: 'date'
  }));
  card.appendChild(respectDate);

  // ADRT
  card.appendChild(radioGroup({
    label: 'Is an Advance Decision to Refuse Treatment (ADRT) in place?',
    section: 'goalsOfCareACP', field: 'adrtCompleted',
    options: yesNoUnknown
  }));
  const adrtDate = document.createElement('div');
  adrtDate.dataset.conditional = 'goalsOfCareACP.adrtCompleted=yes';
  adrtDate.appendChild(textInput({
    label: 'ADRT date',
    section: 'goalsOfCareACP', field: 'adrtDate', type: 'date'
  }));
  card.appendChild(adrtDate);

  // LPA
  card.appendChild(radioGroup({
    label: 'Is a Lasting Power of Attorney (LPA) for Health and Welfare in place?',
    section: 'goalsOfCareACP', field: 'lpaHealthAndWelfare',
    options: yesNoUnknown
  }));
  const lpaName = document.createElement('div');
  lpaName.dataset.conditional = 'goalsOfCareACP.lpaHealthAndWelfare=yes';
  lpaName.appendChild(textInput({
    label: 'Name of attorney(s)',
    section: 'goalsOfCareACP', field: 'lpaName'
  }));
  card.appendChild(lpaName);

  // DNACPR
  card.appendChild(radioGroup({
    label: 'Is a DNACPR (Do Not Attempt Cardiopulmonary Resuscitation) decision documented?',
    section: 'goalsOfCareACP', field: 'dnacprDocumented',
    options: yesNoUnknown
  }));
  const dnacprDate = document.createElement('div');
  dnacprDate.dataset.conditional = 'goalsOfCareACP.dnacprDocumented=yes';
  dnacprDate.appendChild(textInput({
    label: 'DNACPR date',
    section: 'goalsOfCareACP', field: 'dnacprDate', type: 'date'
  }));
  card.appendChild(dnacprDate);

  card.appendChild(radioGroup({
    label: 'Has the ceiling of treatment been discussed (e.g. escalation, ITU, antibiotics, hydration)?',
    section: 'goalsOfCareACP', field: 'ceilingOfTreatmentDiscussed',
    options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Ceiling-of-treatment notes',
    section: 'goalsOfCareACP', field: 'ceilingOfTreatmentNotes',
    placeholder: 'Summarise the agreed ceiling of treatment…',
    rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Medications & Symptom Control Plan',
    description: 'Current medications, anticipatory prescribing, and symptom-control plan.'
  });

  const regHeader = document.createElement('div');
  regHeader.className = 'list-section-header';
  regHeader.innerHTML = `
    <h3>Regular medications</h3>
    <p class="hint">e.g. modified-release morphine, paracetamol, anti-emetics, laxatives.</p>
  `;
  card.appendChild(regHeader);
  card.appendChild(medicationListEditor({
    section: 'medicationsSymptomControl',
    field: 'regularMedications',
    addLabel: 'Add regular medication'
  }));

  const prnHeader = document.createElement('div');
  prnHeader.className = 'list-section-header';
  prnHeader.innerHTML = `
    <h3>As-needed (PRN) medications</h3>
    <p class="hint">e.g. immediate-release morphine, midazolam, hyoscine, levomepromazine.</p>
  `;
  card.appendChild(prnHeader);
  card.appendChild(medicationListEditor({
    section: 'medicationsSymptomControl',
    field: 'asNeededMedications',
    addLabel: 'Add as-needed medication'
  }));

  card.appendChild(radioGroup({
    label: 'Is a syringe driver (continuous SC infusion) in use?',
    section: 'medicationsSymptomControl', field: 'syringeDriverInUse',
    options: yesNo
  }));
  const syringeDetails = document.createElement('div');
  syringeDetails.dataset.conditional = 'medicationsSymptomControl.syringeDriverInUse=yes';
  syringeDetails.appendChild(textArea({
    label: 'Syringe driver details (drugs, doses, started)',
    section: 'medicationsSymptomControl', field: 'syringeDriverDetails',
    rows: 3
  }));
  card.appendChild(syringeDetails);

  card.appendChild(radioGroup({
    label: 'Are anticipatory (just-in-case) end-of-life medications prescribed?',
    section: 'medicationsSymptomControl', field: 'anticipatoryMedsPrescribed',
    options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Anticipatory medication notes',
    section: 'medicationsSymptomControl', field: 'anticipatoryMedsNotes',
    placeholder: 'Drugs, doses, where stored, who can administer…',
    rows: 3
  }));

  card.appendChild(selectInput({
    label: 'Overall symptom control (patient / clinician judgement)',
    section: 'medicationsSymptomControl', field: 'symptomControlOverall',
    options: [
      { value: 'good',    label: 'Good — symptoms well controlled' },
      { value: 'partial', label: 'Partial — some symptoms not yet controlled' },
      { value: 'poor',    label: 'Poor — symptoms not controlled' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Barriers to symptom control',
    section: 'medicationsSymptomControl', field: 'barriersToControl',
    placeholder: 'e.g. swallowing difficulties, side effects, patient preference…',
    rows: 3
  }));

  card.appendChild(textArea({
    label: 'Plan / next steps',
    section: 'medicationsSymptomControl', field: 'planNotes',
    placeholder: 'Planned changes to medications, review schedule…',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Psychosocial & Spiritual Concerns',
    description: 'Mood, anxiety, existential distress, faith, and unresolved concerns.'
  });

  card.appendChild(radioGroup({
    label: 'Are there concerns about mood (sadness, hopelessness, depression)?',
    section: 'psychosocialSpiritualConcerns', field: 'moodConcerns',
    options: yesNo
  }));
  const moodNotes = document.createElement('div');
  moodNotes.dataset.conditional = 'psychosocialSpiritualConcerns.moodConcerns=yes';
  moodNotes.appendChild(textArea({
    label: 'Mood notes',
    section: 'psychosocialSpiritualConcerns', field: 'moodNotes',
    rows: 3
  }));
  card.appendChild(moodNotes);

  card.appendChild(radioGroup({
    label: 'Are there concerns about anxiety, fear, or panic?',
    section: 'psychosocialSpiritualConcerns', field: 'anxietyConcerns',
    options: yesNo
  }));
  const anxietyNotes = document.createElement('div');
  anxietyNotes.dataset.conditional = 'psychosocialSpiritualConcerns.anxietyConcerns=yes';
  anxietyNotes.appendChild(textArea({
    label: 'Anxiety notes',
    section: 'psychosocialSpiritualConcerns', field: 'anxietyNotes',
    rows: 3
  }));
  card.appendChild(anxietyNotes);

  card.appendChild(radioGroup({
    label: 'Is there existential or spiritual distress (meaning, hope, fear of dying)?',
    section: 'psychosocialSpiritualConcerns', field: 'existentialDistress',
    options: yesNo
  }));
  const existentialNotes = document.createElement('div');
  existentialNotes.dataset.conditional = 'psychosocialSpiritualConcerns.existentialDistress=yes';
  existentialNotes.appendChild(textArea({
    label: 'Existential / spiritual distress notes',
    section: 'psychosocialSpiritualConcerns', field: 'existentialNotes',
    rows: 3
  }));
  card.appendChild(existentialNotes);

  card.appendChild(radioGroup({
    label: 'Has spiritual / pastoral support been requested?',
    section: 'psychosocialSpiritualConcerns', field: 'spiritualSupportRequested',
    options: yesNo
  }));
  card.appendChild(textInput({
    label: 'Faith / belief / what gives the patient strength',
    section: 'psychosocialSpiritualConcerns', field: 'faithOrBelief'
  }));
  card.appendChild(textArea({
    label: 'Chaplaincy / pastoral notes',
    section: 'psychosocialSpiritualConcerns', field: 'chaplaincyNotes',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Are there unresolved relational, financial, or practical concerns?',
    section: 'psychosocialSpiritualConcerns', field: 'unresolvedConcerns',
    options: yesNo
  }));
  const unresolvedNotes = document.createElement('div');
  unresolvedNotes.dataset.conditional = 'psychosocialSpiritualConcerns.unresolvedConcerns=yes';
  unresolvedNotes.appendChild(textArea({
    label: 'Unresolved-concerns notes',
    section: 'psychosocialSpiritualConcerns', field: 'unresolvedNotes',
    rows: 3
  }));
  card.appendChild(unresolvedNotes);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Carer & Family Support',
    description: 'Primary carer wellbeing, respite, children at home, and bereavement risk.'
  });

  const carerGrid = document.createElement('div');
  carerGrid.className = 'two-col';
  carerGrid.appendChild(textInput({
    label: 'Primary carer name',
    section: 'carerFamilySupport', field: 'primaryCarerName'
  }));
  carerGrid.appendChild(textInput({
    label: 'Relationship to patient',
    section: 'carerFamilySupport', field: 'primaryCarerRelationship',
    placeholder: 'e.g. spouse, daughter, neighbour'
  }));
  card.appendChild(carerGrid);

  card.appendChild(radioGroup({
    label: 'Does the carer live with the patient?',
    section: 'carerFamilySupport', field: 'carerLivesWithPatient',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Has the carer reported strain or burden?',
    section: 'carerFamilySupport', field: 'carerStrainReported',
    options: yesNo
  }));

  card.appendChild(selectInput({
    label: 'Carer strain level',
    section: 'carerFamilySupport', field: 'carerStrainLevel',
    options: [
      { value: 'low',         label: 'Low' },
      { value: 'moderate',    label: 'Moderate' },
      { value: 'high',        label: 'High' },
      { value: 'overwhelmed', label: 'Overwhelmed' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Carer strain notes',
    section: 'carerFamilySupport', field: 'carerStrainNotes',
    rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Is respite required?',
    section: 'carerFamilySupport', field: 'respiteRequired',
    options: yesNo
  }));
  const respiteNotes = document.createElement('div');
  respiteNotes.dataset.conditional = 'carerFamilySupport.respiteRequired=yes';
  respiteNotes.appendChild(textArea({
    label: 'Respite notes',
    section: 'carerFamilySupport', field: 'respiteNotes',
    placeholder: 'Type of respite, urgency, arrangements…',
    rows: 3
  }));
  card.appendChild(respiteNotes);

  card.appendChild(radioGroup({
    label: 'Are there children or dependants in the household?',
    section: 'carerFamilySupport', field: 'childrenInHousehold',
    options: yesNo
  }));
  const childNotes = document.createElement('div');
  childNotes.dataset.conditional = 'carerFamilySupport.childrenInHousehold=yes';
  childNotes.appendChild(textArea({
    label: 'Children / dependants support notes',
    section: 'carerFamilySupport', field: 'childrenSupportNotes',
    placeholder: 'Ages, school, support arrangements, communication needs…',
    rows: 3
  }));
  card.appendChild(childNotes);

  card.appendChild(radioGroup({
    label: 'Is the family at increased risk of complicated bereavement?',
    section: 'carerFamilySupport', field: 'bereavementRiskIdentified',
    options: yesNo
  }));
  const bereavementNotes = document.createElement('div');
  bereavementNotes.dataset.conditional = 'carerFamilySupport.bereavementRiskIdentified=yes';
  bereavementNotes.appendChild(textArea({
    label: 'Bereavement-risk notes',
    section: 'carerFamilySupport', field: 'bereavementNotes',
    rows: 3
  }));
  card.appendChild(bereavementNotes);

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Multidisciplinary Plan & Referrals',
    description: 'Team involvement, referrals, and review schedule.'
  });

  const referrals = [
    { field: 'specialistPalliativeCareInvolved', label: 'Specialist palliative-care team involved' },
    { field: 'communityNursingInvolved',         label: 'Community / district nursing involved' },
    { field: 'hospiceReferralMade',              label: 'Hospice referral made' },
    { field: 'socialWorkReferralMade',           label: 'Social work referral made' },
    { field: 'occupationalTherapyReferralMade',  label: 'Occupational therapy referral made' },
    { field: 'physiotherapyReferralMade',        label: 'Physiotherapy referral made' },
    { field: 'dieticianReferralMade',            label: 'Dietician referral made' },
    { field: 'chaplaincyReferralMade',           label: 'Chaplaincy referral made' },
    { field: 'psychologyReferralMade',           label: 'Psychology / counselling referral made' }
  ];
  for (const r of referrals) {
    card.appendChild(radioGroup({
      label: r.label,
      section: 'multidisciplinaryPlan', field: r.field,
      options: yesNo
    }));
  }

  card.appendChild(textArea({
    label: 'Other referrals or services',
    section: 'multidisciplinaryPlan', field: 'otherReferrals',
    placeholder: 'List any other referrals, voluntary services, or community supports…',
    rows: 3
  }));

  const reviewGrid = document.createElement('div');
  reviewGrid.className = 'two-col';
  reviewGrid.appendChild(textInput({
    label: 'Review interval',
    section: 'multidisciplinaryPlan', field: 'reviewInterval',
    placeholder: 'e.g. weekly MDT, fortnightly clinic'
  }));
  reviewGrid.appendChild(textInput({
    label: 'Key worker / care coordinator',
    section: 'multidisciplinaryPlan', field: 'keyWorkerName'
  }));
  card.appendChild(reviewGrid);

  card.appendChild(textArea({
    label: 'Plan summary',
    section: 'multidisciplinaryPlan', field: 'planSummary',
    placeholder: 'Summarise the agreed plan, immediate actions, and review date…',
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
  ['demographics', 'reporterRole'],
  ['demographics', 'assessmentDate'],
  ['demographics', 'assessmentSetting'],
  // Diagnosis & prognosis
  ['primaryDiagnosisPrognosis', 'primaryDiagnosis'],
  ['primaryDiagnosisPrognosis', 'diseaseProgressing'],
  ['primaryDiagnosisPrognosis', 'prognosisHorizon'],
  ['primaryDiagnosisPrognosis', 'surpriseQuestion'],
  // ESAS-r 10 items
  ['esasrSymptoms', 'pain'],
  ['esasrSymptoms', 'tiredness'],
  ['esasrSymptoms', 'drowsiness'],
  ['esasrSymptoms', 'nausea'],
  ['esasrSymptoms', 'lackOfAppetite'],
  ['esasrSymptoms', 'shortnessOfBreath'],
  ['esasrSymptoms', 'depression'],
  ['esasrSymptoms', 'anxiety'],
  ['esasrSymptoms', 'wellbeing'],
  ['esasrSymptoms', 'other'],
  // Performance status
  ['performanceStatus', 'ppsScore'],
  ['performanceStatus', 'akpsScore'],
  ['performanceStatus', 'ecogScore'],
  ['performanceStatus', 'activityLevel'],
  ['performanceStatus', 'bedBound'],
  ['performanceStatus', 'requiresAssistanceWithAdls'],
  // Goals of care / ACP
  ['goalsOfCareACP', 'patientPrioritiesAndWishes'],
  ['goalsOfCareACP', 'preferredPlaceOfCare'],
  ['goalsOfCareACP', 'preferredPlaceOfDeath'],
  ['goalsOfCareACP', 'respectFormCompleted'],
  ['goalsOfCareACP', 'adrtCompleted'],
  ['goalsOfCareACP', 'lpaHealthAndWelfare'],
  ['goalsOfCareACP', 'dnacprDocumented'],
  ['goalsOfCareACP', 'ceilingOfTreatmentDiscussed'],
  // Medications
  ['medicationsSymptomControl', 'syringeDriverInUse'],
  ['medicationsSymptomControl', 'anticipatoryMedsPrescribed'],
  ['medicationsSymptomControl', 'symptomControlOverall'],
  // Psychosocial / spiritual
  ['psychosocialSpiritualConcerns', 'moodConcerns'],
  ['psychosocialSpiritualConcerns', 'anxietyConcerns'],
  ['psychosocialSpiritualConcerns', 'existentialDistress'],
  ['psychosocialSpiritualConcerns', 'spiritualSupportRequested'],
  ['psychosocialSpiritualConcerns', 'unresolvedConcerns'],
  // Carer support
  ['carerFamilySupport', 'primaryCarerName'],
  ['carerFamilySupport', 'carerLivesWithPatient'],
  ['carerFamilySupport', 'carerStrainReported'],
  ['carerFamilySupport', 'carerStrainLevel'],
  ['carerFamilySupport', 'respiteRequired'],
  ['carerFamilySupport', 'childrenInHousehold'],
  ['carerFamilySupport', 'bereavementRiskIdentified'],
  // MDT
  ['multidisciplinaryPlan', 'specialistPalliativeCareInvolved'],
  ['multidisciplinaryPlan', 'communityNursingInvolved'],
  ['multidisciplinaryPlan', 'hospiceReferralMade'],
  ['multidisciplinaryPlan', 'socialWorkReferralMade'],
  ['multidisciplinaryPlan', 'occupationalTherapyReferralMade'],
  ['multidisciplinaryPlan', 'physiotherapyReferralMade'],
  ['multidisciplinaryPlan', 'dieticianReferralMade'],
  ['multidisciplinaryPlan', 'chaplaincyReferralMade'],
  ['multidisciplinaryPlan', 'psychologyReferralMade'],
  ['multidisciplinaryPlan', 'reviewInterval'],
  ['multidisciplinaryPlan', 'keyWorkerName']
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
  const percent = Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Step list
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'demographics',                  title: 'Demographics' },
  { step: 2, section: 'primaryDiagnosisPrognosis',     title: 'Diagnosis' },
  { step: 3, section: 'esasrSymptoms',                 title: 'ESAS-r Symptoms' },
  { step: 4, section: 'performanceStatus',             title: 'Performance' },
  { step: 5, section: 'goalsOfCareACP',                title: 'Goals & ACP' },
  { step: 6, section: 'medicationsSymptomControl',     title: 'Medications' },
  { step: 7, section: 'psychosocialSpiritualConcerns', title: 'Psychosocial' },
  { step: 8, section: 'carerFamilySupport',            title: 'Carer Support' },
  { step: 9, section: 'multidisciplinaryPlan',         title: 'MDT Plan' }
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
    } else if (input.tagName === 'LABEL') {
      return;
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
// Submit / Report
// ----------------------------------------------------------------------

function priorityClass(priority) {
  switch (priority) {
    case 'high':   return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low':    return 'flag-low';
    default:       return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    esasTotal,
    severityBand,
    answeredCount,
    firedRules,
    individualFlags,
    additionalFlags,
    timestamp
  } = lastResult;

  // Per-symptom breakdown table — only ESAS rules.
  const esasRows = firedRules
    .filter((r) => r.id.startsWith('PALL-ESAS-'))
    .map((r) => `
      <tr>
        <th scope="row">${esc(r.id)}</th>
        <td>${esc(r.category)}</td>
        <td class="num">${r.score} / 10</td>
        <td>${esc(severityBandLabel(classifyIndividualSymptom(r.score)))}</td>
      </tr>
    `).join('');

  const esasTable = esasRows.length === 0
    ? `<p class="muted">No ESAS-r items answered yet.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Symptom</th>
            <th scope="col">Score</th>
            <th scope="col">Band</th>
          </tr>
        </thead>
        <tbody>${esasRows}</tbody>
      </table>
    `;

  // Individual severe-symptom flags (any ESAS >= 7).
  const individualList = individualFlags.length === 0
    ? `<p class="muted">No individual symptom is currently severe (≥ 7).</p>`
    : `
      <ul class="individual-flags">
        ${individualFlags.map((f) => `
          <li class="severity-severe">
            <span class="indiv-symptom">${esc(f.symptomLabel)}</span>
            <span class="indiv-score">${f.score} / 10</span>
          </li>
        `).join('')}
      </ul>
    `;

  // Prioritised additional flags.
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

  out.innerHTML = `
    <h2>Palliative Assessment Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>ESAS-r Total Score</h3>
    <p class="esas-summary">
      <span class="esas-score-badge ${severityBandClass(severityBand)}">${esasTotal} / 100</span>
      <span class="severity-level">${esc(severityBandLabel(severityBand))}</span>
    </p>
    <p class="muted">Based on ${answeredCount} of 10 ESAS-r items answered.</p>

    <h3>Per-symptom breakdown</h3>
    ${esasTable}

    <h3>Individual severe-symptom flags (≥ 7)</h3>
    ${individualList}

    <h3>Flagged Issues</h3>
    ${flagsList}

    <div class="report-actions">
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
}

function submitForm() {
  const errs = validateForm();
  if (errs.length > 0) return;
  const { esasTotal, severityBand, answeredCount, firedRules, individualFlags } = gradeESAS(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    esasTotal,
    severityBand,
    answeredCount,
    firedRules,
    individualFlags,
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
  const rep = document.getElementById('report');
  if (rep) rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
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
  host.appendChild(renderStep1());
  host.appendChild(renderStep2());
  host.appendChild(renderStep3());
  host.appendChild(renderStep4());
  host.appendChild(renderStep5());
  host.appendChild(renderStep6());
  host.appendChild(renderStep7());
  host.appendChild(renderStep8());
  host.appendChild(renderStep9());
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
