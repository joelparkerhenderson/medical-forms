import { calculateCFS } from './cfs-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { emptyAssessment } from './types.js';
import { bmiCategory, calculateAge, calculateBMI, cfsScoreClass, cfsScoreLabel } from './utils.js';

// Gerontology Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure CFS scoring engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'gerontology-assessment.front-end-form-with-html.v1';

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
    if (Array.isArray(fresh[key])) {
      if (Array.isArray(parsed[key])) fresh[key] = parsed[key];
    } else if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null) {
      fresh[key] = Object.assign({}, fresh[key], parsed[key]);
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

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
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

let state = loadState();
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'gerontology-assessment',
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

function recomputeDerived() {
  state.demographics.bmi = calculateBMI(
    state.demographics.weight,
    state.demographics.height
  );
}

function esc(s) {
  return String(s == null ? '' : s)
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
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${lilyInputClass(type)}"`,
    `value="${esc(value == null ? '' : value)}"`
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

function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] || '';
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
  const current = state[opts.section][opts.field] || '';
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

function readOnlyReadout(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field readout';
  wrapper.innerHTML = `
    <label>${esc(opts.label)}</label>
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
    `<span class="section-step">Section ${opts.stepNumber} of 9</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

function subgroupHeader(title, hint) {
  const wrap = document.createElement('div');
  wrap.className = 'subgroup-header';
  wrap.innerHTML = `<h3>${esc(title)}</h3>${hint ? `<p class="hint">${esc(hint)}</p>` : ''}`;
  return wrap;
}

// ----------------------------------------------------------------------
// Repeating-list editor: medications array on the root
// ----------------------------------------------------------------------

function medicationListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.medications;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No medications added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row med-row';
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Amlodipine">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 5 mg">
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
          rows[idx][inp.dataset.key] = inp.value;
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
// Section renderers (1 per CFS step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const adlOptions = [
  { value: 'independent', label: 'Independent' },
  { value: 'needs-assistance', label: 'Needs assistance' },
  { value: 'dependent', label: 'Dependent' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic patient information and living situation.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'demographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Date of Birth',
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
    type: 'number', min: 1, max: 400, unit: 'kg'
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'demographics', field: 'height',
    type: 'number', min: 50, max: 250, unit: 'cm'
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

  card.appendChild(selectInput({
    label: 'Living situation',
    section: 'demographics', field: 'livingSituation',
    options: [
      { value: 'independent', label: 'Independent (own home)' },
      { value: 'with-family', label: 'Lives with family' },
      { value: 'assisted-living', label: 'Assisted living facility' },
      { value: 'nursing-home', label: 'Nursing home' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Functional Assessment',
    description: 'Activities of Daily Living (ADLs) and Instrumental ADLs (IADLs).'
  });

  card.appendChild(subgroupHeader('Activities of Daily Living (ADLs)', 'Basic self-care tasks.'));
  card.appendChild(radioGroup({ label: 'Bathing', section: 'functionalAssessment', field: 'bathingADL', options: adlOptions }));
  card.appendChild(radioGroup({ label: 'Dressing', section: 'functionalAssessment', field: 'dressingADL', options: adlOptions }));
  card.appendChild(radioGroup({ label: 'Toileting', section: 'functionalAssessment', field: 'toiletingADL', options: adlOptions }));
  card.appendChild(radioGroup({ label: 'Transferring (bed/chair)', section: 'functionalAssessment', field: 'transferringADL', options: adlOptions }));
  card.appendChild(radioGroup({ label: 'Feeding', section: 'functionalAssessment', field: 'feedingADL', options: adlOptions }));

  card.appendChild(subgroupHeader('Instrumental Activities of Daily Living (IADLs)', 'Tasks needed to live independently.'));
  card.appendChild(radioGroup({ label: 'Cooking / preparing meals', section: 'functionalAssessment', field: 'cookingIADL', options: adlOptions }));
  card.appendChild(radioGroup({ label: 'Cleaning / housework', section: 'functionalAssessment', field: 'cleaningIADL', options: adlOptions }));
  card.appendChild(radioGroup({ label: 'Shopping', section: 'functionalAssessment', field: 'shoppingIADL', options: adlOptions }));
  card.appendChild(radioGroup({ label: 'Managing finances', section: 'functionalAssessment', field: 'financesIADL', options: adlOptions }));
  card.appendChild(radioGroup({ label: 'Managing medications', section: 'functionalAssessment', field: 'medicationManagementIADL', options: adlOptions }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Cognitive Screen',
    description: 'Cognitive function and delirium risk.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'MMSE score (Mini-Mental State Exam)',
    section: 'cognitiveScreen', field: 'mmseScore',
    type: 'number', min: 0, max: 30
  }));
  grid.appendChild(textInput({
    label: 'MoCA score (Montreal Cognitive Assessment)',
    section: 'cognitiveScreen', field: 'mocaScore',
    type: 'number', min: 0, max: 30
  }));
  card.appendChild(grid);

  card.appendChild(radioGroup({ label: 'Orientation intact (person, place, time)?', section: 'cognitiveScreen', field: 'orientationIntact', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Memory impairment present?', section: 'cognitiveScreen', field: 'memoryImpairment', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Executive function impairment present?', section: 'cognitiveScreen', field: 'executiveFunctionImpairment', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Delirium risk (acute confusion, fluctuating attention)?', section: 'cognitiveScreen', field: 'deliriumRisk', options: yesNo }));

  card.appendChild(selectInput({
    label: 'Overall cognitive status',
    section: 'cognitiveScreen', field: 'cognitiveStatus',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'mild-impairment', label: 'Mild impairment' },
      { value: 'moderate-impairment', label: 'Moderate impairment' },
      { value: 'severe-impairment', label: 'Severe impairment' }
    ]
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Mobility & Falls',
    description: 'Gait, balance, fall history, and mobility aids.'
  });

  card.appendChild(selectInput({
    label: 'Gait assessment',
    section: 'mobilityFalls', field: 'gaitAssessment',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'unsteady', label: 'Unsteady' },
      { value: 'unable', label: 'Unable to walk' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Balance assessment',
    section: 'mobilityFalls', field: 'balanceAssessment',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'impaired', label: 'Impaired' },
      { value: 'severely-impaired', label: 'Severely impaired' }
    ]
  }));

  card.appendChild(radioGroup({ label: 'Fall history in past year?', section: 'mobilityFalls', field: 'fallHistory', options: yesNo }));
  const fallsHost = document.createElement('div');
  fallsHost.dataset.conditional = 'mobilityFalls.fallHistory=yes';
  fallsHost.appendChild(textInput({
    label: 'How many falls in the past year?',
    section: 'mobilityFalls', field: 'fallsLastYear',
    type: 'number', min: 0, max: 100
  }));
  card.appendChild(fallsHost);

  card.appendChild(radioGroup({ label: 'Fear of falling?', section: 'mobilityFalls', field: 'fearOfFalling', options: yesNo }));

  card.appendChild(radioGroup({ label: 'Uses mobility aids?', section: 'mobilityFalls', field: 'mobilityAids', options: yesNo }));
  const aidHost = document.createElement('div');
  aidHost.dataset.conditional = 'mobilityFalls.mobilityAids=yes';
  aidHost.appendChild(textInput({
    label: 'Type of mobility aid (cane, walker, wheelchair, etc.)',
    section: 'mobilityFalls', field: 'mobilityAidType'
  }));
  card.appendChild(aidHost);

  card.appendChild(textInput({
    label: 'Timed Up and Go test',
    section: 'mobilityFalls', field: 'timedUpAndGo',
    type: 'number', min: 0, max: 120, step: 0.1, unit: 'seconds'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Nutrition',
    description: 'Weight changes, appetite, swallowing, and dental status.'
  });

  card.appendChild(radioGroup({ label: 'Weight change in the last 6 months?', section: 'nutrition', field: 'weightChangeLastSixMonths', options: yesNo }));
  const weightHost = document.createElement('div');
  weightHost.dataset.conditional = 'nutrition.weightChangeLastSixMonths=yes';
  const weightGrid = document.createElement('div');
  weightGrid.className = 'two-col';
  weightGrid.appendChild(textInput({
    label: 'Weight change',
    section: 'nutrition', field: 'weightChangeKg',
    type: 'number', min: 0, max: 100, step: 0.1, unit: 'kg'
  }));
  weightGrid.appendChild(radioGroup({
    label: 'Direction',
    section: 'nutrition', field: 'weightChangeDirection',
    options: [
      { value: 'gain', label: 'Gain' },
      { value: 'loss', label: 'Loss' }
    ]
  }));
  weightHost.appendChild(weightGrid);
  card.appendChild(weightHost);

  card.appendChild(selectInput({
    label: 'Appetite',
    section: 'nutrition', field: 'appetite',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'reduced', label: 'Reduced' },
      { value: 'poor', label: 'Poor' }
    ]
  }));

  card.appendChild(radioGroup({ label: 'Swallowing difficulties?', section: 'nutrition', field: 'swallowingDifficulties', options: yesNo }));

  card.appendChild(selectInput({
    label: 'Dental status',
    section: 'nutrition', field: 'dentalStatus',
    options: [
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' },
      { value: 'poor', label: 'Poor' },
      { value: 'edentulous', label: 'Edentulous (no teeth)' }
    ]
  }));

  card.appendChild(textInput({
    label: 'MNA score (Mini Nutritional Assessment, 0\u201330)',
    section: 'nutrition', field: 'mnaScore',
    type: 'number', min: 0, max: 30, step: 0.5
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Polypharmacy Review',
    description: 'Number and risk profile of current medications.'
  });

  card.appendChild(textInput({
    label: 'Total number of medications taken',
    section: 'polypharmacyReview', field: 'numberOfMedications',
    type: 'number', min: 0, max: 50
  }));

  const medsHeader = document.createElement('div');
  medsHeader.className = 'list-section-header';
  medsHeader.innerHTML = `
    <h3>Medication list</h3>
    <p class="hint">Add each medication with its dose and frequency.</p>
  `;
  card.appendChild(medsHeader);
  card.appendChild(medicationListEditor());

  card.appendChild(radioGroup({ label: 'High-risk medications (e.g. warfarin, opioids, insulin)?', section: 'polypharmacyReview', field: 'highRiskMedications', options: yesNo }));
  const highRiskHost = document.createElement('div');
  highRiskHost.dataset.conditional = 'polypharmacyReview.highRiskMedications=yes';
  highRiskHost.appendChild(textArea({
    label: 'High-risk medication details',
    section: 'polypharmacyReview', field: 'highRiskMedicationDetails',
    placeholder: 'List the high-risk medications and reasons for concern…',
    rows: 2
  }));
  card.appendChild(highRiskHost);

  card.appendChild(radioGroup({ label: 'Beers criteria (potentially inappropriate medication) flags?', section: 'polypharmacyReview', field: 'beersCriteriaFlags', options: yesNo }));
  const beersHost = document.createElement('div');
  beersHost.dataset.conditional = 'polypharmacyReview.beersCriteriaFlags=yes';
  beersHost.appendChild(textArea({
    label: 'Beers criteria details',
    section: 'polypharmacyReview', field: 'beersCriteriaDetails',
    placeholder: 'Describe the Beers criteria flags…',
    rows: 2
  }));
  card.appendChild(beersHost);

  card.appendChild(selectInput({
    label: 'Medication adherence',
    section: 'polypharmacyReview', field: 'medicationAdherence',
    options: [
      { value: 'good', label: 'Good — takes as prescribed' },
      { value: 'fair', label: 'Fair — occasional missed doses' },
      { value: 'poor', label: 'Poor — frequent missed doses' }
    ]
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Comorbidities',
    description: 'Chronic conditions affecting the patient.'
  });

  card.appendChild(radioGroup({ label: 'Cardiovascular disease?', section: 'comorbidities', field: 'cardiovascularDisease', options: yesNo }));
  const cvHost = document.createElement('div');
  cvHost.dataset.conditional = 'comorbidities.cardiovascularDisease=yes';
  cvHost.appendChild(textInput({ label: 'Cardiovascular details', section: 'comorbidities', field: 'cardiovascularDetails' }));
  card.appendChild(cvHost);

  card.appendChild(radioGroup({ label: 'Diabetes?', section: 'comorbidities', field: 'diabetes', options: yesNo }));
  const dmHost = document.createElement('div');
  dmHost.dataset.conditional = 'comorbidities.diabetes=yes';
  dmHost.appendChild(radioGroup({
    label: 'Diabetes control',
    section: 'comorbidities', field: 'diabetesControl',
    options: [
      { value: 'well-controlled', label: 'Well controlled' },
      { value: 'poorly-controlled', label: 'Poorly controlled' }
    ]
  }));
  card.appendChild(dmHost);

  card.appendChild(radioGroup({ label: 'Renal disease?', section: 'comorbidities', field: 'renalDisease', options: yesNo }));
  const renHost = document.createElement('div');
  renHost.dataset.conditional = 'comorbidities.renalDisease=yes';
  renHost.appendChild(textInput({ label: 'Renal details', section: 'comorbidities', field: 'renalDetails' }));
  card.appendChild(renHost);

  card.appendChild(radioGroup({ label: 'Respiratory disease?', section: 'comorbidities', field: 'respiratoryDisease', options: yesNo }));
  const respHost = document.createElement('div');
  respHost.dataset.conditional = 'comorbidities.respiratoryDisease=yes';
  respHost.appendChild(textInput({ label: 'Respiratory details', section: 'comorbidities', field: 'respiratoryDetails' }));
  card.appendChild(respHost);

  card.appendChild(radioGroup({ label: 'Musculoskeletal disease (osteoarthritis, osteoporosis, etc.)?', section: 'comorbidities', field: 'musculoskeletalDisease', options: yesNo }));
  const mskHost = document.createElement('div');
  mskHost.dataset.conditional = 'comorbidities.musculoskeletalDisease=yes';
  mskHost.appendChild(textInput({ label: 'Musculoskeletal details', section: 'comorbidities', field: 'musculoskeletalDetails' }));
  card.appendChild(mskHost);

  card.appendChild(radioGroup({ label: 'Visual deficit?', section: 'comorbidities', field: 'visualDeficit', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Hearing deficit?', section: 'comorbidities', field: 'hearingDeficit', options: yesNo }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Psychosocial',
    description: 'Mood, social support, and advance directives.'
  });

  card.appendChild(selectInput({
    label: 'Depression screen result',
    section: 'psychosocial', field: 'depressionScreen',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));
  card.appendChild(textInput({
    label: 'GDS-15 score (Geriatric Depression Scale, 0\u201315)',
    section: 'psychosocial', field: 'gds15Score',
    type: 'number', min: 0, max: 15
  }));

  card.appendChild(selectInput({
    label: 'Social isolation',
    section: 'psychosocial', field: 'socialIsolation',
    options: [
      { value: 'none', label: 'None' },
      { value: 'mild', label: 'Mild' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' }
    ]
  }));

  card.appendChild(radioGroup({ label: 'Has a primary caregiver?', section: 'psychosocial', field: 'hasCaregiver', options: yesNo }));
  const cgHost = document.createElement('div');
  cgHost.dataset.conditional = 'psychosocial.hasCaregiver=yes';
  cgHost.appendChild(textInput({ label: 'Caregiver details (relationship, hours per week)', section: 'psychosocial', field: 'caregiverDetails' }));
  card.appendChild(cgHost);

  card.appendChild(radioGroup({ label: 'Advance directives in place?', section: 'psychosocial', field: 'advanceDirectives', options: yesNo }));
  const adHost = document.createElement('div');
  adHost.dataset.conditional = 'psychosocial.advanceDirectives=yes';
  adHost.appendChild(textArea({
    label: 'Advance directive details',
    section: 'psychosocial', field: 'advanceDirectiveDetails',
    placeholder: 'Living will, healthcare proxy, DNR/DNAR status, etc.',
    rows: 2
  }));
  card.appendChild(adHost);

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Continence & Skin',
    description: 'Continence, pressure injury risk, and skin integrity.'
  });

  card.appendChild(selectInput({
    label: 'Urinary incontinence type',
    section: 'continenceSkin', field: 'urinaryIncontinence',
    options: [
      { value: 'none', label: 'None' },
      { value: 'stress', label: 'Stress' },
      { value: 'urge', label: 'Urge' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'functional', label: 'Functional' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Urinary incontinence frequency',
    section: 'continenceSkin', field: 'urinaryIncontinenceFrequency',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional' },
      { value: 'frequent', label: 'Frequent' },
      { value: 'continuous', label: 'Continuous' }
    ]
  }));

  card.appendChild(radioGroup({ label: 'Faecal incontinence?', section: 'continenceSkin', field: 'faecalIncontinence', options: yesNo }));
  const fiHost = document.createElement('div');
  fiHost.dataset.conditional = 'continenceSkin.faecalIncontinence=yes';
  fiHost.appendChild(selectInput({
    label: 'Faecal incontinence frequency',
    section: 'continenceSkin', field: 'faecalIncontinenceFrequency',
    options: [
      { value: 'none', label: 'None' },
      { value: 'occasional', label: 'Occasional' },
      { value: 'frequent', label: 'Frequent' },
      { value: 'continuous', label: 'Continuous' }
    ]
  }));
  card.appendChild(fiHost);

  card.appendChild(textInput({
    label: 'Braden scale score (6\u201323; lower = higher pressure injury risk)',
    section: 'continenceSkin', field: 'bradenScale',
    type: 'number', min: 6, max: 23
  }));

  card.appendChild(radioGroup({ label: 'Pressure injury present?', section: 'continenceSkin', field: 'pressureInjuryPresent', options: yesNo }));
  const piHost = document.createElement('div');
  piHost.dataset.conditional = 'continenceSkin.pressureInjuryPresent=yes';
  piHost.appendChild(selectInput({
    label: 'Pressure injury stage',
    section: 'continenceSkin', field: 'pressureInjuryStage',
    options: [
      { value: '1', label: 'Stage 1' },
      { value: '2', label: 'Stage 2' },
      { value: '3', label: 'Stage 3' },
      { value: '4', label: 'Stage 4' }
    ]
  }));
  card.appendChild(piHost);

  card.appendChild(selectInput({
    label: 'Overall skin integrity',
    section: 'continenceSkin', field: 'skinIntegrity',
    options: [
      { value: 'intact', label: 'Intact' },
      { value: 'impaired', label: 'Impaired' },
      { value: 'wound-present', label: 'Wound present' }
    ]
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections + auto-calculated readouts
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const eq = expr.indexOf('=');
    const path = expr.substring(0, eq);
    const target = expr.substring(eq + 1);
    const dot = path.indexOf('.');
    const section = path.substring(0, dot);
    const field = path.substring(dot + 1);
    const current = state[section] ? state[section][field] : undefined;
    host.style.display = String(current) === target ? '' : 'none';
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
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics (8)
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'weight'],
  ['demographics', 'height'],
  ['demographics', 'livingSituation'],
  // Functional assessment (10 ADL/IADL)
  ['functionalAssessment', 'bathingADL'],
  ['functionalAssessment', 'dressingADL'],
  ['functionalAssessment', 'toiletingADL'],
  ['functionalAssessment', 'transferringADL'],
  ['functionalAssessment', 'feedingADL'],
  ['functionalAssessment', 'cookingIADL'],
  ['functionalAssessment', 'cleaningIADL'],
  ['functionalAssessment', 'shoppingIADL'],
  ['functionalAssessment', 'financesIADL'],
  ['functionalAssessment', 'medicationManagementIADL'],
  // Cognitive screen (5 yes/no + status; scores optional)
  ['cognitiveScreen', 'orientationIntact'],
  ['cognitiveScreen', 'memoryImpairment'],
  ['cognitiveScreen', 'executiveFunctionImpairment'],
  ['cognitiveScreen', 'deliriumRisk'],
  ['cognitiveScreen', 'cognitiveStatus'],
  // Mobility & falls (5 core)
  ['mobilityFalls', 'gaitAssessment'],
  ['mobilityFalls', 'balanceAssessment'],
  ['mobilityFalls', 'fallHistory'],
  ['mobilityFalls', 'fearOfFalling'],
  ['mobilityFalls', 'mobilityAids'],
  // Nutrition (5 core)
  ['nutrition', 'weightChangeLastSixMonths'],
  ['nutrition', 'appetite'],
  ['nutrition', 'swallowingDifficulties'],
  ['nutrition', 'dentalStatus'],
  // Polypharmacy (5)
  ['polypharmacyReview', 'numberOfMedications'],
  ['polypharmacyReview', 'highRiskMedications'],
  ['polypharmacyReview', 'beersCriteriaFlags'],
  ['polypharmacyReview', 'medicationAdherence'],
  // Comorbidities (8 yes/no)
  ['comorbidities', 'cardiovascularDisease'],
  ['comorbidities', 'diabetes'],
  ['comorbidities', 'renalDisease'],
  ['comorbidities', 'respiratoryDisease'],
  ['comorbidities', 'musculoskeletalDisease'],
  ['comorbidities', 'visualDeficit'],
  ['comorbidities', 'hearingDeficit'],
  // Psychosocial (5)
  ['psychosocial', 'depressionScreen'],
  ['psychosocial', 'socialIsolation'],
  ['psychosocial', 'hasCaregiver'],
  ['psychosocial', 'advanceDirectives'],
  // Continence & skin (5)
  ['continenceSkin', 'urinaryIncontinence'],
  ['continenceSkin', 'urinaryIncontinenceFrequency'],
  ['continenceSkin', 'faecalIncontinence'],
  ['continenceSkin', 'pressureInjuryPresent'],
  ['continenceSkin', 'skinIntegrity']
];

function updateProgress() {
  let answered = 0;
  for (let i = 0; i < TRACKED_FIELDS.length; i++) {
    const section = TRACKED_FIELDS[i][0];
    const field = TRACKED_FIELDS[i][1];
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

  const { cfsScore, firedRules, additionalFlags, timestamp } = lastResult;

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
      <td>${esc(r.domain)}</td>
      <td>${esc(r.description)}</td>
      <td class="num">CFS ${r.score}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No CFS rules fired - patient appears very fit (CFS 1).</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Domain</th>
            <th scope="col">Rule description</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Gerontology Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Clinical Frailty Scale</h3>
      <p class="cfs-summary">
        <span class="cfs-score-badge ${cfsScoreClass(cfsScore)}">CFS ${cfsScore} / 9</span>
        <span class="cfs-label">${esc(cfsScoreLabel(cfsScore))}</span>
      </p>
      <p class="muted">CFS is the maximum score among ${firedRules.length} fired rule${firedRules.length === 1 ? '' : 's'}; CFS 1 is the default for patients with no rules fired.</p>

      <h3>Fired classification rules</h3>
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
  recomputeDerived();
  const { cfsScore, firedRules } = calculateCFS(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    cfsScore,
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

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'demographics', title: 'Demographics' },
  { step: 2, section: 'functionalAssessment', title: 'Functional Assessment' },
  { step: 3, section: 'cognitiveScreen', title: 'Cognitive Screen' },
  { step: 4, section: 'mobilityFalls', title: 'Mobility & Falls' },
  { step: 5, section: 'nutrition', title: 'Nutrition' },
  { step: 6, section: 'polypharmacyReview', title: 'Polypharmacy Review' },
  { step: 7, section: 'comorbidities', title: 'Comorbidities' },
  { step: 8, section: 'psychosocial', title: 'Psychosocial' },
  { step: 9, section: 'continenceSkin', title: 'Continence & Skin' }
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
}

function init() {
  recomputeDerived();
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
