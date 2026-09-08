import { calculateASA } from './asa-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { asaGradeClass, asaGradeLabel, bmiCategory, calculateAge, calculateBMI, emptyAssessment, estimateMETs } from './types.js';

// Pre-Operative Assessment by Patient - patient wizard (vanilla JS, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure ASA-grading engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'pre-operative-assessment-by-patient.front-end-with-html.v1';
// Expose the draft key so a later linkage / accessibility module can offer a
// "clear saved answers" control without re-deriving the key.
window.__A11Y_DRAFT_KEY__ = STORAGE_KEY;
const TOTAL_STEPS = 17;

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
    const v = parsed ? parsed[key] : undefined;
    if (Array.isArray(fresh[key])) {
      if (Array.isArray(v)) fresh[key] = v.slice();
    } else if (v && typeof v === 'object') {
      fresh[key] = { ...fresh[key], ...v };
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
  slug: 'pre-operative-assessment-by-patient',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    updateConditionalSections();
    refreshAutoCalculatedReadouts();
    updatePregnancyStepVisibility();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs derived values (BMI, METs), progress, and conditional
 * visibility after each change.
 */
function setField(section, field, value) {
  state[section][field] = value;
  recomputeDerived();
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
  updatePregnancyStepVisibility();
}

/** Recompute auto-calculated values that depend on other fields. */
function recomputeDerived() {
  state.demographics.bmi = calculateBMI(
    state.demographics.weight,
    state.demographics.height
  );
  state.functionalCapacity.estimatedMETs = estimateMETs(
    state.functionalCapacity.exerciseTolerance
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
// Component builders (Lily-shaped)
// ----------------------------------------------------------------------

/** Map an HTML input type to its Lily input class. */
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
    <span class="error-message" id="${id}-error"></span>
  `;

  const input = wrapper.querySelector('input');
  input.setAttribute('aria-describedby', `${id}-error`);
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
 * Build a select / dropdown input.
 */
function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const placeholder = opts.placeholder || '— Select —';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">${esc(placeholder)}</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
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
 * Build a Lily-shaped radio group:
 * <fieldset class="field">
 *   <legend class="label">...</legend>
 *   <div class="radio-group" role="radiogroup">
 *     <label><input class="radio-input" type="radio"> ...</label>
 *   </div>
 *   <span class="error-message"></span>
 * </fieldset>
 */
function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
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

/** Yes / No radio shortcut. */
const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function yesNoGroup(label, section, field) {
  return radioGroup({ label, section, field, options: yesNo });
}

/** Read-only auto-calculated readout (e.g. BMI, METs). */
function readOnlyReadout(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field readout';
  wrapper.innerHTML = `
    <label>${esc(opts.label)}</label>
    <div id="${opts.id}" class="readout-value">${opts.render()}</div>
  `;
  return wrapper;
}

/**
 * Build a Lily-shaped section card as <fieldset class="fieldset">
 * with a <legend class="fieldset-legend"> heading.
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
  legend.innerHTML = `
    <span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>
    <h2 class="section-title">${esc(opts.title)}</h2>
    ${desc}
  `;
  card.appendChild(legend);
  return card;
}

/**
 * Conditional sub-block: hidden unless `state[section][field]` matches one
 * of the supplied target values. Re-evaluated in `updateConditionalSections`.
 */
function conditionalBlock(opts) {
  const block = document.createElement('div');
  const targets = Array.isArray(opts.equals) ? opts.equals : [opts.equals];
  block.dataset.conditionalAny = `${opts.section}.${opts.field}=${targets.join(',')}`;
  return block;
}

// ----------------------------------------------------------------------
// Repeating-list editors (medications, allergies)
// ----------------------------------------------------------------------

/** Editor for the top-level `medications` array. */
function medicationListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.medications;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent =
        'No medications added. Add a medication, or skip this section if you take none.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row med-row';
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Atenolol">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 50 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. OD, BD">
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

/** Editor for the top-level `allergies` array. */
function allergyListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.allergies;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent =
        'No allergies added. Add an allergy, or skip this section if you have none.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row allergy-row';
      r.innerHTML = `
        <div class="list-grid allergy-grid">
          <label class="list-cell">
            <span>Drug / allergen</span>
            <input type="text" class="text-input" data-key="allergen" value="${esc(row.allergen)}" placeholder="e.g. Penicillin">
          </label>
          <label class="list-cell">
            <span>Reaction</span>
            <input type="text" class="text-input" data-key="reaction" value="${esc(row.reaction)}" placeholder="e.g. Rash, swelling">
          </label>
          <label class="list-cell">
            <span>Severity</span>
            <select class="select" data-key="severity">
              <option value="">— Select —</option>
              <option value="mild"${row.severity === 'mild' ? ' selected' : ''}>Mild</option>
              <option value="moderate"${row.severity === 'moderate' ? ' selected' : ''}>Moderate</option>
              <option value="anaphylaxis"${row.severity === 'anaphylaxis' ? ' selected' : ''}>Anaphylaxis</option>
            </select>
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove allergy">&times;</button>
        </div>
      `;
      r.querySelectorAll('input, select').forEach((inp) => {
        const handler = () => {
          rows[idx][inp.dataset.key] = inp.value;
          saveState(state);
          updateProgress();
        };
        inp.addEventListener('input', handler);
        inp.addEventListener('change', handler);
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
    addBtn.textContent = '+ Add allergy';
    addBtn.addEventListener('click', () => {
      rows.push({ allergen: '', reaction: '', severity: '' });
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
// Section renderers (1 per ASA step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic patient information and the planned procedure.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First name', section: 'demographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Date of birth',
    section: 'demographics',
    field: 'dateOfBirth',
    type: 'date',
    required: true
  }));
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

  const measurements = document.createElement('div');
  measurements.className = 'three-col';
  measurements.appendChild(textInput({
    label: 'Weight', section: 'demographics', field: 'weight',
    type: 'number', min: 1, max: 400, unit: 'kg', required: true
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'demographics', field: 'height',
    type: 'number', min: 50, max: 250, unit: 'cm', required: true
  }));
  measurements.appendChild(readOnlyReadout({
    label: 'BMI',
    id: 'bmi-readout',
    render: () => {
      const bmi = state.demographics.bmi;
      if (bmi == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${bmi}</strong> <span class="muted">(${esc(bmiCategory(bmi))})</span>`;
    }
  }));
  card.appendChild(measurements);

  card.appendChild(textInput({
    label: 'Planned procedure',
    section: 'demographics', field: 'plannedProcedure',
    placeholder: 'e.g. Right total knee replacement',
    required: true
  }));
  card.appendChild(selectInput({
    label: 'Procedure urgency',
    section: 'demographics', field: 'procedureUrgency',
    required: true,
    options: [
      { value: 'elective', label: 'Elective' },
      { value: 'urgent', label: 'Urgent' },
      { value: 'emergency', label: 'Emergency' }
    ]
  }));

  const bgHint = document.createElement('p');
  bgHint.className = 'hint';
  bgHint.textContent = 'Background health';
  card.appendChild(bgHint);

  card.appendChild(yesNoGroup('Have you ever been diagnosed with cancer?', 'demographics', 'cancerHistory'));
  const cancerDetails = conditionalBlock({ section: 'demographics', field: 'cancerHistory', equals: 'yes' });
  cancerDetails.appendChild(textInput({
    label: 'Please give full details including dates and treatment',
    section: 'demographics', field: 'cancerHistoryDetails'
  }));
  card.appendChild(cancerDetails);

  card.appendChild(yesNoGroup('Do you have a history of MRSA or MSSA?', 'demographics', 'mrsaHistory'));
  card.appendChild(yesNoGroup(
    'Have you been admitted to hospital or a nursing/care home within the last 6 months?',
    'demographics', 'recentHospitalOrCareHomeAdmission'
  ));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Cardiovascular',
    description: 'Heart and blood-vessel conditions.'
  });

  card.appendChild(yesNoGroup('Hypertension (high blood pressure)?', 'cardiovascular', 'hypertension'));
  const htnDetails = conditionalBlock({ section: 'cardiovascular', field: 'hypertension', equals: 'yes' });
  htnDetails.appendChild(yesNoGroup('Is it controlled with medication?', 'cardiovascular', 'hypertensionControlled'));
  card.appendChild(htnDetails);

  card.appendChild(yesNoGroup('Ischaemic heart disease?', 'cardiovascular', 'ischemicHeartDisease'));
  const ihdDetails = conditionalBlock({ section: 'cardiovascular', field: 'ischemicHeartDisease', equals: 'yes' });
  ihdDetails.appendChild(textInput({ label: 'Details', section: 'cardiovascular', field: 'ihdDetails' }));
  card.appendChild(ihdDetails);

  card.appendChild(yesNoGroup('Heart failure?', 'cardiovascular', 'heartFailure'));
  const hfDetails = conditionalBlock({ section: 'cardiovascular', field: 'heartFailure', equals: 'yes' });
  hfDetails.appendChild(selectInput({
    label: 'NYHA Class',
    section: 'cardiovascular', field: 'heartFailureNYHA',
    options: [
      { value: '1', label: 'Class I — No limitation' },
      { value: '2', label: 'Class II — Mild limitation' },
      { value: '3', label: 'Class III — Marked limitation' },
      { value: '4', label: 'Class IV — Severe limitation' }
    ]
  }));
  card.appendChild(hfDetails);

  card.appendChild(yesNoGroup('Valvular heart disease?', 'cardiovascular', 'valvularDisease'));
  const valvDetails = conditionalBlock({ section: 'cardiovascular', field: 'valvularDisease', equals: 'yes' });
  valvDetails.appendChild(textInput({ label: 'Details', section: 'cardiovascular', field: 'valvularDetails' }));
  card.appendChild(valvDetails);

  card.appendChild(yesNoGroup('Arrhythmia?', 'cardiovascular', 'arrhythmia'));
  const arrhDetails = conditionalBlock({ section: 'cardiovascular', field: 'arrhythmia', equals: 'yes' });
  arrhDetails.appendChild(textInput({ label: 'Type', section: 'cardiovascular', field: 'arrhythmiaType' }));
  card.appendChild(arrhDetails);

  card.appendChild(yesNoGroup('Pacemaker or ICD?', 'cardiovascular', 'pacemaker'));

  card.appendChild(yesNoGroup('Recent myocardial infarction (heart attack)?', 'cardiovascular', 'recentMI'));
  const miDetails = conditionalBlock({ section: 'cardiovascular', field: 'recentMI', equals: 'yes' });
  miDetails.appendChild(textInput({
    label: 'How many weeks ago?',
    section: 'cardiovascular', field: 'recentMIWeeks',
    type: 'number', min: 0, max: 26
  }));
  card.appendChild(miDetails);

  card.appendChild(yesNoGroup('Have you ever had heart or artery surgery?', 'cardiovascular', 'heartOrArterySurgery'));
  card.appendChild(yesNoGroup('Do you have swollen ankles?', 'cardiovascular', 'swollenAnkles'));
  card.appendChild(yesNoGroup('Do you get palpitations, blackouts or feel faint?', 'cardiovascular', 'palpitationsOrBlackouts'));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Respiratory',
    description: 'Lung and airway conditions.'
  });

  card.appendChild(yesNoGroup('Asthma?', 'respiratory', 'asthma'));
  const asthmaDetails = conditionalBlock({ section: 'respiratory', field: 'asthma', equals: 'yes' });
  asthmaDetails.appendChild(selectInput({
    label: 'Asthma severity / frequency',
    section: 'respiratory', field: 'asthmaFrequency',
    options: [
      { value: 'intermittent', label: 'Intermittent' },
      { value: 'mild-persistent', label: 'Mild persistent' },
      { value: 'moderate-persistent', label: 'Moderate persistent' },
      { value: 'severe-persistent', label: 'Severe persistent' }
    ]
  }));
  card.appendChild(asthmaDetails);

  card.appendChild(yesNoGroup('COPD (chronic obstructive pulmonary disease)?', 'respiratory', 'copd'));
  const copdDetails = conditionalBlock({ section: 'respiratory', field: 'copd', equals: 'yes' });
  copdDetails.appendChild(selectInput({
    label: 'Severity',
    section: 'respiratory', field: 'copdSeverity',
    options: [
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));
  card.appendChild(copdDetails);

  card.appendChild(yesNoGroup('Obstructive sleep apnoea (OSA)?', 'respiratory', 'osa'));
  const osaDetails = conditionalBlock({ section: 'respiratory', field: 'osa', equals: 'yes' });
  osaDetails.appendChild(yesNoGroup('Do you use CPAP?', 'respiratory', 'osaCPAP'));
  card.appendChild(osaDetails);

  card.appendChild(radioGroup({
    label: 'Smoking status',
    section: 'respiratory', field: 'smoking',
    options: [
      { value: 'current', label: 'Current smoker' },
      { value: 'ex', label: 'Ex-smoker' },
      { value: 'never', label: 'Never smoked' }
    ]
  }));
  const packDetails = conditionalBlock({ section: 'respiratory', field: 'smoking', equals: ['current', 'ex'] });
  packDetails.appendChild(textInput({
    label: 'Pack-years',
    section: 'respiratory', field: 'smokingPackYears',
    type: 'number', min: 0, max: 200
  }));
  card.appendChild(packDetails);

  card.appendChild(yesNoGroup('Recent upper respiratory tract infection?', 'respiratory', 'recentURTI'));

  const stopBangHint = document.createElement('p');
  stopBangHint.className = 'hint';
  stopBangHint.textContent = 'Snoring and daytime sleepiness (STOP-BANG screen)';
  card.appendChild(stopBangHint);

  card.appendChild(yesNoGroup('Do you snore?', 'respiratory', 'snoring'));
  const snoringDetails = conditionalBlock({ section: 'respiratory', field: 'snoring', equals: 'yes' });
  snoringDetails.appendChild(yesNoGroup(
    'Do you snore loudly (louder than talking or heard through a closed door)?',
    'respiratory', 'snoringLoud'
  ));
  snoringDetails.appendChild(textInput({
    label: 'Collar size (inches)',
    section: 'respiratory', field: 'collarSizeInches',
    type: 'number', min: 10, max: 30
  }));
  card.appendChild(snoringDetails);

  card.appendChild(yesNoGroup('Do you often feel tired, fatigued or sleepy during the daytime?', 'respiratory', 'daytimeSleepiness'));
  card.appendChild(yesNoGroup('Has anyone observed you stop breathing during your sleep?', 'respiratory', 'observedApnoeaEpisodes'));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Renal',
    description: 'Kidney function.'
  });

  card.appendChild(yesNoGroup('Chronic kidney disease (CKD)?', 'renal', 'ckd'));
  const ckdDetails = conditionalBlock({ section: 'renal', field: 'ckd', equals: 'yes' });
  ckdDetails.appendChild(selectInput({
    label: 'CKD stage',
    section: 'renal', field: 'ckdStage',
    options: [
      { value: '1', label: 'Stage 1' },
      { value: '2', label: 'Stage 2' },
      { value: '3', label: 'Stage 3' },
      { value: '4', label: 'Stage 4' },
      { value: '5', label: 'Stage 5' }
    ]
  }));
  card.appendChild(ckdDetails);

  card.appendChild(yesNoGroup('On dialysis?', 'renal', 'dialysis'));
  const dialysisDetails = conditionalBlock({ section: 'renal', field: 'dialysis', equals: 'yes' });
  dialysisDetails.appendChild(selectInput({
    label: 'Dialysis type',
    section: 'renal', field: 'dialysisType',
    options: [
      { value: 'haemodialysis', label: 'Haemodialysis' },
      { value: 'peritoneal', label: 'Peritoneal dialysis' }
    ]
  }));
  card.appendChild(dialysisDetails);

  card.appendChild(yesNoGroup('Any urinary problems (difficulty passing urine, frequency at night)?', 'renal', 'urinarySymptoms'));
  card.appendChild(yesNoGroup('Have you ever had a urinary catheter?', 'renal', 'urinaryCatheterHistory'));
  card.appendChild(yesNoGroup('Do you have prostate problems?', 'renal', 'prostateProblems'));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Hepatic',
    description: 'Liver conditions.'
  });

  card.appendChild(yesNoGroup('Liver disease?', 'hepatic', 'liverDisease'));
  const liverDetails = conditionalBlock({ section: 'hepatic', field: 'liverDisease', equals: 'yes' });
  liverDetails.appendChild(yesNoGroup('Cirrhosis?', 'hepatic', 'cirrhosis'));
  card.appendChild(liverDetails);

  const cirrhosisDetails = conditionalBlock({ section: 'hepatic', field: 'cirrhosis', equals: 'yes' });
  cirrhosisDetails.appendChild(selectInput({
    label: 'Child-Pugh score',
    section: 'hepatic', field: 'childPughScore',
    options: [
      { value: 'A', label: 'A — Well compensated' },
      { value: 'B', label: 'B — Significant compromise' },
      { value: 'C', label: 'C — Decompensated' }
    ]
  }));
  card.appendChild(cirrhosisDetails);

  card.appendChild(yesNoGroup('Hepatitis?', 'hepatic', 'hepatitis'));
  const hepatitisDetails = conditionalBlock({ section: 'hepatic', field: 'hepatitis', equals: 'yes' });
  hepatitisDetails.appendChild(textInput({
    label: 'Hepatitis type', section: 'hepatic', field: 'hepatitisType',
    placeholder: 'e.g. Hepatitis B'
  }));
  card.appendChild(hepatitisDetails);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Endocrine',
    description: 'Hormonal conditions including diabetes and thyroid.'
  });

  card.appendChild(selectInput({
    label: 'Diabetes',
    section: 'endocrine', field: 'diabetes',
    options: [
      { value: 'none', label: 'No' },
      { value: 'type1', label: 'Type 1' },
      { value: 'type2', label: 'Type 2' },
      { value: 'gestational', label: 'Gestational' }
    ]
  }));
  const diabetesDetails = conditionalBlock({
    section: 'endocrine', field: 'diabetes',
    equals: ['type1', 'type2', 'gestational']
  });
  diabetesDetails.appendChild(selectInput({
    label: 'Diabetes control',
    section: 'endocrine', field: 'diabetesControl',
    options: [
      { value: 'well-controlled', label: 'Well controlled' },
      { value: 'poorly-controlled', label: 'Poorly controlled' }
    ]
  }));
  diabetesDetails.appendChild(yesNoGroup('On insulin?', 'endocrine', 'diabetesOnInsulin'));
  card.appendChild(diabetesDetails);

  card.appendChild(yesNoGroup('Thyroid disease?', 'endocrine', 'thyroidDisease'));
  const thyroidDetails = conditionalBlock({ section: 'endocrine', field: 'thyroidDisease', equals: 'yes' });
  thyroidDetails.appendChild(selectInput({
    label: 'Type',
    section: 'endocrine', field: 'thyroidType',
    options: [
      { value: 'hypothyroid', label: 'Underactive (hypothyroid)' },
      { value: 'hyperthyroid', label: 'Overactive (hyperthyroid)' }
    ]
  }));
  card.appendChild(thyroidDetails);

  card.appendChild(yesNoGroup('Adrenal insufficiency?', 'endocrine', 'adrenalInsufficiency'));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Neurological',
    description: 'Nervous system conditions.'
  });

  card.appendChild(yesNoGroup('Previous stroke or TIA?', 'neurological', 'strokeOrTIA'));
  const strokeDetails = conditionalBlock({ section: 'neurological', field: 'strokeOrTIA', equals: 'yes' });
  strokeDetails.appendChild(textInput({
    label: 'Details', section: 'neurological', field: 'strokeDetails'
  }));
  card.appendChild(strokeDetails);

  card.appendChild(yesNoGroup('Epilepsy?', 'neurological', 'epilepsy'));
  const epilepsyDetails = conditionalBlock({ section: 'neurological', field: 'epilepsy', equals: 'yes' });
  epilepsyDetails.appendChild(yesNoGroup('Is it well controlled?', 'neurological', 'epilepsyControlled'));
  card.appendChild(epilepsyDetails);

  card.appendChild(yesNoGroup('Neuromuscular disease?', 'neurological', 'neuromuscularDisease'));
  const nmDetails = conditionalBlock({ section: 'neurological', field: 'neuromuscularDisease', equals: 'yes' });
  nmDetails.appendChild(textInput({
    label: 'Details', section: 'neurological', field: 'neuromuscularDetails'
  }));
  card.appendChild(nmDetails);

  card.appendChild(yesNoGroup('Raised intracranial pressure?', 'neurological', 'raisedICP'));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Haematological',
    description: 'Blood and clotting disorders.'
  });

  card.appendChild(yesNoGroup('Bleeding disorder?', 'haematological', 'bleedingDisorder'));
  const bleedDetails = conditionalBlock({ section: 'haematological', field: 'bleedingDisorder', equals: 'yes' });
  bleedDetails.appendChild(textInput({
    label: 'Details', section: 'haematological', field: 'bleedingDetails'
  }));
  card.appendChild(bleedDetails);

  card.appendChild(yesNoGroup('On anticoagulants (blood thinners)?', 'haematological', 'onAnticoagulants'));
  const anticoagDetails = conditionalBlock({ section: 'haematological', field: 'onAnticoagulants', equals: 'yes' });
  anticoagDetails.appendChild(textInput({
    label: 'Which anticoagulant?',
    section: 'haematological', field: 'anticoagulantType',
    placeholder: 'e.g. Warfarin, Rivaroxaban'
  }));
  card.appendChild(anticoagDetails);

  card.appendChild(yesNoGroup('Sickle cell disease?', 'haematological', 'sickleCellDisease'));
  const sickleTraitBlock = conditionalBlock({ section: 'haematological', field: 'sickleCellDisease', equals: 'no' });
  sickleTraitBlock.appendChild(yesNoGroup('Sickle cell trait?', 'haematological', 'sickleCellTrait'));
  card.appendChild(sickleTraitBlock);

  card.appendChild(yesNoGroup('Anaemia?', 'haematological', 'anaemia'));

  card.appendChild(yesNoGroup(
    'Have you ever had a blood clot in your lungs or legs (DVT or pulmonary embolism)?',
    'haematological', 'personalVteHistory'
  ));
  card.appendChild(yesNoGroup(
    'Does a blood relative have a history of blood clots in the lungs or legs (DVT or pulmonary embolism)?',
    'haematological', 'familyVteHistory'
  ));
  card.appendChild(yesNoGroup('Have you ever had a blood transfusion?', 'haematological', 'bloodTransfusionHistory'));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Musculoskeletal & Airway',
    description: 'Joint, neck, mouth, and airway considerations.'
  });

  card.appendChild(yesNoGroup('Rheumatoid arthritis?', 'musculoskeletalAirway', 'rheumatoidArthritis'));
  card.appendChild(yesNoGroup('Cervical (neck) spine issues?', 'musculoskeletalAirway', 'cervicalSpineIssues'));
  card.appendChild(yesNoGroup('Limited neck movement?', 'musculoskeletalAirway', 'limitedNeckMovement'));
  card.appendChild(yesNoGroup('Limited mouth opening?', 'musculoskeletalAirway', 'limitedMouthOpening'));

  card.appendChild(yesNoGroup('Dental issues (loose teeth, crowns, bridges)?', 'musculoskeletalAirway', 'dentalIssues'));
  const dentalDetails = conditionalBlock({ section: 'musculoskeletalAirway', field: 'dentalIssues', equals: 'yes' });
  dentalDetails.appendChild(textInput({
    label: 'Details', section: 'musculoskeletalAirway', field: 'dentalDetails'
  }));
  card.appendChild(dentalDetails);

  card.appendChild(yesNoGroup('Previous difficult airway?', 'musculoskeletalAirway', 'previousDifficultAirway'));

  card.appendChild(selectInput({
    label: 'Mallampati score (if known)',
    section: 'musculoskeletalAirway', field: 'mallampatiScore',
    placeholder: 'Not assessed',
    options: [
      { value: '1', label: 'Class 1' },
      { value: '2', label: 'Class 2' },
      { value: '3', label: 'Class 3' },
      { value: '4', label: 'Class 4' }
    ]
  }));

  card.appendChild(yesNoGroup('Do you have arthritis or other joint problems?', 'musculoskeletalAirway', 'jointOrArthritisProblems'));
  card.appendChild(yesNoGroup('Do you have back or neck problems?', 'musculoskeletalAirway', 'backOrNeckProblems'));
  card.appendChild(yesNoGroup('Do you have any skin conditions (e.g. dermatitis, thin skin, eczema)?', 'musculoskeletalAirway', 'skinConditions'));
  card.appendChild(yesNoGroup('Are you at risk of pressure sores, or have you had them in the past?', 'musculoskeletalAirway', 'pressureSoreRisk'));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Gastrointestinal',
    description: 'Stomach and reflux conditions affecting aspiration risk.'
  });

  card.appendChild(yesNoGroup('Gastro-oesophageal reflux (GORD)?', 'gastrointestinal', 'gord'));
  card.appendChild(yesNoGroup('Hiatus hernia?', 'gastrointestinal', 'hiatusHernia'));
  card.appendChild(yesNoGroup('Tendency to nausea or vomiting?', 'gastrointestinal', 'nausea'));
  card.appendChild(yesNoGroup('Do you have bowel problems or are you prone to constipation?', 'gastrointestinal', 'bowelProblems'));

  card.appendChild(yesNoGroup('Do you have any special diet or food intolerances?', 'gastrointestinal', 'foodIntolerances'));
  const foodIntolDetails = conditionalBlock({ section: 'gastrointestinal', field: 'foodIntolerances', equals: 'yes' });
  foodIntolDetails.appendChild(textInput({
    label: 'Please provide details',
    section: 'gastrointestinal', field: 'foodIntolerancesDetails'
  }));
  card.appendChild(foodIntolDetails);

  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Current Medications',
    description: 'List every medication you currently take. Skip if you take none.'
  });
  card.appendChild(medicationListEditor());
  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Allergies',
    description: 'List drug, food, and environmental allergies. Skip if you have none.'
  });
  card.appendChild(allergyListEditor());
  return card;
}

function renderStep13() {
  const card = sectionCard({
    stepNumber: 13,
    title: 'Previous Anaesthesia',
    description: 'Previous experiences with anaesthesia and family history.'
  });

  card.appendChild(yesNoGroup('Have you had a general anaesthetic before?', 'previousAnaesthesia', 'previousAnaesthesia'));
  const prevDetails = conditionalBlock({ section: 'previousAnaesthesia', field: 'previousAnaesthesia', equals: 'yes' });
  prevDetails.appendChild(yesNoGroup('Any problems with anaesthesia?', 'previousAnaesthesia', 'anaesthesiaProblems'));
  card.appendChild(prevDetails);

  const problemDetails = conditionalBlock({ section: 'previousAnaesthesia', field: 'anaesthesiaProblems', equals: 'yes' });
  problemDetails.appendChild(textInput({
    label: 'Details',
    section: 'previousAnaesthesia', field: 'anaesthesiaProblemDetails'
  }));
  card.appendChild(problemDetails);

  card.appendChild(yesNoGroup('Family history of malignant hyperthermia?', 'previousAnaesthesia', 'familyMHHistory'));
  const mhDetails = conditionalBlock({ section: 'previousAnaesthesia', field: 'familyMHHistory', equals: 'yes' });
  mhDetails.appendChild(textInput({
    label: 'Details', section: 'previousAnaesthesia', field: 'familyMHDetails'
  }));
  card.appendChild(mhDetails);

  card.appendChild(yesNoGroup('History of post-operative nausea and vomiting (PONV)?', 'previousAnaesthesia', 'ponv'));

  return card;
}

function renderStep14() {
  const card = sectionCard({
    stepNumber: 14,
    title: 'Social History',
    description: 'Alcohol and recreational drug use.'
  });

  card.appendChild(selectInput({
    label: 'Alcohol consumption',
    section: 'socialHistory', field: 'alcohol',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional (1-7 units/week)' },
      { value: 'moderate', label: 'Moderate (8-14 units/week)' },
      { value: 'heavy', label: 'Heavy (>14 units/week)' }
    ]
  }));
  const alcoholDetails = conditionalBlock({
    section: 'socialHistory', field: 'alcohol',
    equals: ['occasional', 'moderate', 'heavy']
  });
  alcoholDetails.appendChild(textInput({
    label: 'Units per week',
    section: 'socialHistory', field: 'alcoholUnitsPerWeek',
    type: 'number', min: 0, max: 200
  }));
  card.appendChild(alcoholDetails);

  card.appendChild(yesNoGroup('Recreational drug use?', 'socialHistory', 'recreationalDrugs'));
  const drugDetails = conditionalBlock({ section: 'socialHistory', field: 'recreationalDrugs', equals: 'yes' });
  drugDetails.appendChild(textInput({
    label: 'Details',
    section: 'socialHistory', field: 'drugDetails'
  }));
  card.appendChild(drugDetails);

  card.appendChild(yesNoGroup('Do you give blood?', 'socialHistory', 'bloodDonor'));
  card.appendChild(yesNoGroup('Do you have any body piercings?', 'socialHistory', 'bodyPiercings'));

  return card;
}

function renderStep15() {
  const card = sectionCard({
    stepNumber: 15,
    title: 'Functional Capacity',
    description: 'How much physical activity you can perform without symptoms.'
  });

  card.appendChild(selectInput({
    label: 'Exercise tolerance',
    section: 'functionalCapacity', field: 'exerciseTolerance',
    options: [
      { value: 'unable', label: 'Unable to perform daily activities' },
      { value: 'light-housework', label: 'Light housework / walking around the house' },
      { value: 'climb-stairs', label: 'Climb a flight of stairs / walk uphill' },
      { value: 'moderate-exercise', label: 'Moderate exercise (jogging, cycling)' },
      { value: 'vigorous-exercise', label: 'Vigorous exercise (running, swimming laps)' }
    ]
  }));
  card.appendChild(readOnlyReadout({
    label: 'Estimated METs',
    id: 'mets-readout',
    render: () => {
      const v = state.functionalCapacity.estimatedMETs;
      if (v == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${v}</strong> <span class="muted">METs</span>`;
    }
  }));

  card.appendChild(yesNoGroup('Do you use mobility aids?', 'functionalCapacity', 'mobilityAids'));
  card.appendChild(yesNoGroup('Recent decline in functional capacity?', 'functionalCapacity', 'recentDecline'));

  const sensoryHint = document.createElement('p');
  sensoryHint.className = 'hint';
  sensoryHint.textContent = 'Sensory and balance';
  card.appendChild(sensoryHint);

  card.appendChild(yesNoGroup('Do you have any problems with your hearing?', 'functionalCapacity', 'hearingProblems'));
  card.appendChild(yesNoGroup('Do you have any problems with your eyesight?', 'functionalCapacity', 'visionProblems'));
  card.appendChild(yesNoGroup('Do you have any balance issues?', 'functionalCapacity', 'balanceIssues'));

  return card;
}

function renderStep16() {
  const card = sectionCard({
    stepNumber: 16,
    title: 'Pregnancy',
    description: 'Pregnancy assessment (shown for female patients aged 12-55).'
  });

  card.appendChild(yesNoGroup('Could you be pregnant?', 'pregnancy', 'possiblyPregnant'));
  const pregDetails = conditionalBlock({ section: 'pregnancy', field: 'possiblyPregnant', equals: 'yes' });
  pregDetails.appendChild(yesNoGroup('Has pregnancy been confirmed?', 'pregnancy', 'pregnancyConfirmed'));
  card.appendChild(pregDetails);

  const gestationDetails = conditionalBlock({ section: 'pregnancy', field: 'pregnancyConfirmed', equals: 'yes' });
  gestationDetails.appendChild(textInput({
    label: 'Gestation (weeks)',
    section: 'pregnancy', field: 'gestationWeeks',
    type: 'number', min: 1, max: 42
  }));
  card.appendChild(gestationDetails);

  card.appendChild(yesNoGroup(
    'Do you take contraceptive pills, HRT, or use oestrogen gel/coil?',
    'pregnancy', 'contraceptiveOrHrtUse'
  ));
  card.appendChild(textInput({
    label: 'Date of your last menstrual period',
    section: 'pregnancy', field: 'lastMenstrualPeriod',
    type: 'date'
  }));

  return card;
}

function renderStep17() {
  const card = sectionCard({
    stepNumber: 17,
    title: 'Cognitive and Mental Health',
    description: 'Memory, mood and learning.'
  });

  card.appendChild(yesNoGroup(
    'Have you ever had a head injury requiring hospitalisation?',
    'cognitiveMentalHealth', 'headInjuryRequiringHospitalisation'
  ));
  card.appendChild(yesNoGroup(
    'Have you attended a memory clinic, or do you have any concerns about your memory?',
    'cognitiveMentalHealth', 'memoryConcerns'
  ));
  card.appendChild(yesNoGroup('Have you been diagnosed with dementia?', 'cognitiveMentalHealth', 'dementiaDiagnosis'));

  card.appendChild(yesNoGroup(
    'Do you have a history of, or are you currently suffering with, depression or anxiety?',
    'cognitiveMentalHealth', 'depressionOrAnxietyHistory'
  ));
  const daDetails = conditionalBlock({ section: 'cognitiveMentalHealth', field: 'depressionOrAnxietyHistory', equals: 'yes' });
  daDetails.appendChild(yesNoGroup('Does this impact on your daily life?', 'cognitiveMentalHealth', 'depressionAnxietyImpactsDailyLife'));
  daDetails.appendChild(yesNoGroup('Have you seen a doctor with respect to this?', 'cognitiveMentalHealth', 'depressionAnxietySeenDoctor'));
  card.appendChild(daDetails);

  card.appendChild(yesNoGroup(
    'Do you have a history of learning difficulties or disabilities?',
    'cognitiveMentalHealth', 'learningDifficulties'
  ));

  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
  renderStep6, renderStep7, renderStep8, renderStep9, renderStep10,
  renderStep11, renderStep12, renderStep13, renderStep14, renderStep15,
  renderStep16, renderStep17
];

// ----------------------------------------------------------------------
// Conditional sections + auto-calculated readouts
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional-any]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-any');
    const [path, targetCsv] = expr.split('=');
    const [section, field] = path.split('.');
    const current = String(state[section]?.[field] ?? '');
    const targets = targetCsv.split(',');
    host.style.display = targets.includes(current) ? '' : 'none';
  });
}

function refreshAutoCalculatedReadouts() {
  const bmi = document.getElementById('bmi-readout');
  if (bmi) {
    const v = state.demographics.bmi;
    bmi.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}</strong> <span class="muted">(${esc(bmiCategory(v))})</span>`;
  }
  const mets = document.getElementById('mets-readout');
  if (mets) {
    const v = state.functionalCapacity.estimatedMETs;
    mets.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}</strong> <span class="muted">METs</span>`;
  }
}

/**
 * Step 16 (Pregnancy) is conditional - only show for female patients aged
 * 12-55 (matches the SvelteKit `steps.ts` `shouldShow` logic). For everyone
 * else the section is hidden, mirroring the multi-step wizard's behaviour
 * within a single-page layout.
 */
function isPregnancyStepVisible() {
  if (state.demographics.sex !== 'female') return false;
  const age = calculateAge(state.demographics.dateOfBirth);
  if (age === null) return false;
  return age >= 12 && age <= 55;
}

function updatePregnancyStepVisibility() {
  const card = document.getElementById('step-16');
  if (!card) return;
  card.classList.toggle('section-hidden', !isPregnancyStepVisible());
  // Also hide the step-list entry for step 16 when not applicable.
  const li = document.querySelector('#step-list [data-step="16"]');
  if (li) li.classList.toggle('section-hidden', !isPregnancyStepVisible());
}

// ----------------------------------------------------------------------
// Progress + step list
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics (8 core fields)
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'weight'],
  ['demographics', 'height'],
  ['demographics', 'plannedProcedure'],
  ['demographics', 'procedureUrgency'],
  ['demographics', 'cancerHistory'],
  ['demographics', 'mrsaHistory'],
  ['demographics', 'recentHospitalOrCareHomeAdmission'],
  // Cardiovascular yes/no items
  ['cardiovascular', 'hypertension'],
  ['cardiovascular', 'ischemicHeartDisease'],
  ['cardiovascular', 'heartFailure'],
  ['cardiovascular', 'valvularDisease'],
  ['cardiovascular', 'arrhythmia'],
  ['cardiovascular', 'pacemaker'],
  ['cardiovascular', 'recentMI'],
  ['cardiovascular', 'heartOrArterySurgery'],
  ['cardiovascular', 'swollenAnkles'],
  ['cardiovascular', 'palpitationsOrBlackouts'],
  // Respiratory
  ['respiratory', 'asthma'],
  ['respiratory', 'copd'],
  ['respiratory', 'osa'],
  ['respiratory', 'smoking'],
  ['respiratory', 'recentURTI'],
  ['respiratory', 'snoring'],
  ['respiratory', 'daytimeSleepiness'],
  ['respiratory', 'observedApnoeaEpisodes'],
  // Renal
  ['renal', 'ckd'],
  ['renal', 'dialysis'],
  ['renal', 'urinarySymptoms'],
  ['renal', 'prostateProblems'],
  // Hepatic
  ['hepatic', 'liverDisease'],
  ['hepatic', 'hepatitis'],
  // Endocrine
  ['endocrine', 'diabetes'],
  ['endocrine', 'thyroidDisease'],
  ['endocrine', 'adrenalInsufficiency'],
  // Neurological
  ['neurological', 'strokeOrTIA'],
  ['neurological', 'epilepsy'],
  ['neurological', 'neuromuscularDisease'],
  ['neurological', 'raisedICP'],
  // Haematological
  ['haematological', 'bleedingDisorder'],
  ['haematological', 'onAnticoagulants'],
  ['haematological', 'sickleCellDisease'],
  ['haematological', 'anaemia'],
  ['haematological', 'personalVteHistory'],
  ['haematological', 'bloodTransfusionHistory'],
  // Musculoskeletal & Airway
  ['musculoskeletalAirway', 'rheumatoidArthritis'],
  ['musculoskeletalAirway', 'cervicalSpineIssues'],
  ['musculoskeletalAirway', 'limitedNeckMovement'],
  ['musculoskeletalAirway', 'limitedMouthOpening'],
  ['musculoskeletalAirway', 'dentalIssues'],
  ['musculoskeletalAirway', 'previousDifficultAirway'],
  ['musculoskeletalAirway', 'jointOrArthritisProblems'],
  ['musculoskeletalAirway', 'backOrNeckProblems'],
  ['musculoskeletalAirway', 'skinConditions'],
  ['musculoskeletalAirway', 'pressureSoreRisk'],
  // Gastrointestinal
  ['gastrointestinal', 'gord'],
  ['gastrointestinal', 'hiatusHernia'],
  ['gastrointestinal', 'nausea'],
  ['gastrointestinal', 'bowelProblems'],
  ['gastrointestinal', 'foodIntolerances'],
  // Previous Anaesthesia
  ['previousAnaesthesia', 'previousAnaesthesia'],
  ['previousAnaesthesia', 'familyMHHistory'],
  ['previousAnaesthesia', 'ponv'],
  // Social
  ['socialHistory', 'alcohol'],
  ['socialHistory', 'recreationalDrugs'],
  ['socialHistory', 'bloodDonor'],
  ['socialHistory', 'bodyPiercings'],
  // Functional capacity
  ['functionalCapacity', 'exerciseTolerance'],
  ['functionalCapacity', 'mobilityAids'],
  ['functionalCapacity', 'recentDecline'],
  ['functionalCapacity', 'hearingProblems'],
  ['functionalCapacity', 'visionProblems'],
  ['functionalCapacity', 'balanceIssues'],
  // Cognitive and Mental Health
  ['cognitiveMentalHealth', 'headInjuryRequiringHospitalisation'],
  ['cognitiveMentalHealth', 'memoryConcerns'],
  ['cognitiveMentalHealth', 'dementiaDiagnosis'],
  ['cognitiveMentalHealth', 'depressionOrAnxietyHistory'],
  ['cognitiveMentalHealth', 'learningDifficulties']
];

function updateProgress() {
  const tracked = TRACKED_FIELDS.slice();
  if (isPregnancyStepVisible()) {
    tracked.push(['pregnancy', 'possiblyPregnant']);
  }
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of tracked) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    const v = state[section][field];
    if (v !== null && v !== undefined && v !== '') {
      answered++;
      sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
    }
  }
  // Repeating-list sections (medications, allergies) count as answered if
  // they contain any rows, otherwise count toward the total only if they
  // are intentionally being tracked - we treat them as optional and skip.
  const total = tracked.length;
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) {
    text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  }
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics',           title: 'Demographics' },
  { step: 2,  section: 'cardiovascular',         title: 'Cardiovascular' },
  { step: 3,  section: 'respiratory',            title: 'Respiratory' },
  { step: 4,  section: 'renal',                  title: 'Renal' },
  { step: 5,  section: 'hepatic',                title: 'Hepatic' },
  { step: 6,  section: 'endocrine',              title: 'Endocrine' },
  { step: 7,  section: 'neurological',           title: 'Neurological' },
  { step: 8,  section: 'haematological',         title: 'Haematological' },
  { step: 9,  section: 'musculoskeletalAirway',  title: 'MSK & Airway' },
  { step: 10, section: 'gastrointestinal',       title: 'Gastrointestinal' },
  { step: 11, section: 'medications',            title: 'Medications' },
  { step: 12, section: 'allergies',              title: 'Allergies' },
  { step: 13, section: 'previousAnaesthesia',    title: 'Previous Anaesthesia' },
  { step: 14, section: 'socialHistory',          title: 'Social History' },
  { step: 15, section: 'functionalCapacity',     title: 'Functional Capacity' },
  { step: 16, section: 'pregnancy',              title: 'Pregnancy' },
  { step: 17, section: 'cognitiveMentalHealth',  title: 'Cognitive and Mental Health' }
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

  const { asaGrade, firedRules, additionalFlags, timestamp } = lastResult;

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

  const ruleRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.system)}</td>
      <td>${esc(r.description)}</td>
      <td class="num">ASA ${r.grade}</td>
    </tr>
  `).join('');

  const ruleTable = firedRules.length === 0
    ? `<p class="muted">No ASA rules fired — patient defaults to ASA I (healthy).</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">System</th>
            <th scope="col">Condition</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>${ruleRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <h2>Pre-Operative Assessment Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>ASA Physical Status Grade</h3>
    <p class="asa-summary">
      <span class="asa-grade-badge ${asaGradeClass(asaGrade)}">ASA ${asaGrade}</span>
      <span class="grade-label">${esc(asaGradeLabel(asaGrade))}</span>
    </p>
    <p class="muted">Maximum-grade rule wins. ${firedRules.length} rule${firedRules.length === 1 ? '' : 's'} fired.</p>

    <h3>Fired ASA rules</h3>
    ${ruleTable}

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
  const errors = validateForm();
  if (errors.length > 0) return;
  recomputeDerived();
  const { asaGrade, firedRules } = calculateASA(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    asaGrade,
    firedRules,
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
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
  updatePregnancyStepVisibility();
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
  recomputeDerived();
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshAutoCalculatedReadouts();
  updatePregnancyStepVisibility();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
