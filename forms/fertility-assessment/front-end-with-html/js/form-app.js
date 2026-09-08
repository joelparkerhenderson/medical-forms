import { calculateConcern } from './fertility-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { ageInYears, bmiCategory, calculateBMI, concernLevelClass, concernLevelLabel, emptyAssessment } from './types.js';

// Fertility Assessment — patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page
// in document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered.
// Submission runs the pure NICE CG156 scoring engine plus flagged-issue
// detection and renders an inline aria-live report. State is persisted
// to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'fertility-assessment.front-end-form-with-html.v1';

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
    console.warn('Could not parse saved assessment; starting fresh.', e);
    return emptyAssessment();
  }
}

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

let state = loadState();
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'fertility-assessment',
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

function recomputeDerived() {
  state.lifestyleFactors.bmi = calculateBMI(
    state.lifestyleFactors.weight,
    state.lifestyleFactors.height
  );
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
    `<span class="section-step">Section ${opts.stepNumber} of 10</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Repeating-list editor (medications)
// ----------------------------------------------------------------------

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
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Metformin">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 500 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. BD, OD">
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
    addBtn.textContent = `+ ${opts.addLabel}`;
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
// Section renderers — 10 NICE CG156 steps
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Patient and (where applicable) partner details.'
  });

  const patientHeader = document.createElement('div');
  patientHeader.className = 'list-section-header';
  patientHeader.innerHTML = '<h3>Patient</h3>';
  card.appendChild(patientHeader);

  const grid1 = document.createElement('div');
  grid1.className = 'two-col';
  grid1.appendChild(textInput({ label: 'First Name', section: 'demographics', field: 'patientFirstName', required: true }));
  grid1.appendChild(textInput({ label: 'Last Name', section: 'demographics', field: 'patientLastName', required: true }));
  card.appendChild(grid1);

  card.appendChild(textInput({
    label: 'Date of Birth',
    section: 'demographics',
    field: 'patientDateOfBirth',
    type: 'date',
    required: true
  }));
  card.appendChild(radioGroup({
    label: 'Sex assigned at birth',
    section: 'demographics',
    field: 'patientSex',
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'other', label: 'Other / prefer not to say' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Ethnicity (optional)',
    section: 'demographics',
    field: 'ethnicity'
  }));

  const partnerHeader = document.createElement('div');
  partnerHeader.className = 'list-section-header';
  partnerHeader.innerHTML = '<h3>Partner (if applicable)</h3>';
  card.appendChild(partnerHeader);

  const grid2 = document.createElement('div');
  grid2.className = 'two-col';
  grid2.appendChild(textInput({ label: 'Partner First Name', section: 'demographics', field: 'partnerFirstName' }));
  grid2.appendChild(textInput({ label: 'Partner Last Name', section: 'demographics', field: 'partnerLastName' }));
  card.appendChild(grid2);

  card.appendChild(textInput({
    label: 'Partner Date of Birth',
    section: 'demographics', field: 'partnerDateOfBirth', type: 'date'
  }));
  card.appendChild(radioGroup({
    label: 'Partner Sex assigned at birth',
    section: 'demographics',
    field: 'partnerSex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other / prefer not to say' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Relationship duration',
    section: 'demographics', field: 'relationshipDuration',
    type: 'number', min: 0, max: 70, unit: 'years'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Reproductive History',
    description: 'Pregnancies, contraception, and prior fertility care.'
  });

  card.appendChild(textInput({
    label: 'How long have you been trying to conceive?',
    section: 'reproductiveHistory', field: 'durationTryingMonths',
    type: 'number', min: 0, max: 240, unit: 'months', required: true
  }));

  const grid = document.createElement('div');
  grid.className = 'three-col';
  grid.appendChild(textInput({
    label: 'Prior pregnancies',
    section: 'reproductiveHistory', field: 'priorPregnancies',
    type: 'number', min: 0, max: 30
  }));
  grid.appendChild(textInput({
    label: 'Live births',
    section: 'reproductiveHistory', field: 'priorLiveBirths',
    type: 'number', min: 0, max: 30
  }));
  grid.appendChild(textInput({
    label: 'Miscarriages',
    section: 'reproductiveHistory', field: 'priorMiscarriages',
    type: 'number', min: 0, max: 30
  }));
  card.appendChild(grid);

  const grid2 = document.createElement('div');
  grid2.className = 'two-col';
  grid2.appendChild(textInput({
    label: 'Ectopic pregnancies',
    section: 'reproductiveHistory', field: 'priorEctopic',
    type: 'number', min: 0, max: 10
  }));
  grid2.appendChild(textInput({
    label: 'Terminations',
    section: 'reproductiveHistory', field: 'priorTerminations',
    type: 'number', min: 0, max: 10
  }));
  card.appendChild(grid2);

  card.appendChild(radioGroup({
    label: 'Have you had any prior fertility treatment?',
    section: 'reproductiveHistory', field: 'priorFertilityTreatment',
    options: yesNo
  }));
  const treatmentDetails = document.createElement('div');
  treatmentDetails.dataset.conditional = 'reproductiveHistory.priorFertilityTreatment=yes';
  treatmentDetails.appendChild(textArea({
    label: 'Prior treatment details (e.g. IUI, IVF, ovulation induction)',
    section: 'reproductiveHistory', field: 'priorTreatmentDetails',
    rows: 3
  }));
  card.appendChild(treatmentDetails);

  card.appendChild(radioGroup({
    label: 'Have you stopped contraception?',
    section: 'reproductiveHistory', field: 'contraceptionStopped',
    options: yesNo
  }));
  const contracDate = document.createElement('div');
  contracDate.dataset.conditional = 'reproductiveHistory.contraceptionStopped=yes';
  contracDate.appendChild(textInput({
    label: 'Date contraception stopped',
    section: 'reproductiveHistory', field: 'contraceptionStoppedDate',
    type: 'date'
  }));
  card.appendChild(contracDate);

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Menstrual Cycle History',
    description: 'Pattern, length, and symptoms of your menstrual cycle.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Age of menarche (first period)',
    section: 'menstrualCycle', field: 'menarcheAge',
    type: 'number', min: 6, max: 25, unit: 'years'
  }));
  grid.appendChild(textInput({
    label: 'Typical cycle length',
    section: 'menstrualCycle', field: 'cycleLengthDays',
    type: 'number', min: 14, max: 90, unit: 'days'
  }));
  card.appendChild(grid);

  card.appendChild(radioGroup({
    label: 'Cycle regularity',
    section: 'menstrualCycle', field: 'cycleRegularity',
    options: [
      { value: 'regular', label: 'Regular' },
      { value: 'irregular', label: 'Irregular' },
      { value: 'absent', label: 'Absent (amenorrhoea)' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Period duration',
    section: 'menstrualCycle', field: 'periodDurationDays',
    type: 'number', min: 0, max: 14, unit: 'days'
  }));

  card.appendChild(radioGroup({
    label: 'Heavy menstrual bleeding?',
    section: 'menstrualCycle', field: 'heavyBleeding', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Painful periods (dysmenorrhoea)?',
    section: 'menstrualCycle', field: 'dysmenorrhoea', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Bleeding between periods?',
    section: 'menstrualCycle', field: 'intermenstrualBleeding', options: yesNo
  }));

  card.appendChild(textInput({
    label: 'Last menstrual period (first day)',
    section: 'menstrualCycle', field: 'lastMenstrualPeriod', type: 'date'
  }));

  card.appendChild(textArea({
    label: 'Cycle notes',
    section: 'menstrualCycle', field: 'cycleNotes',
    placeholder: 'Anything else about your cycle…',
    rows: 3
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Medical & Surgical History',
    description: 'Conditions and surgeries that may affect fertility.'
  });

  card.appendChild(radioGroup({ label: 'Pelvic inflammatory disease (PID)?', section: 'medicalSurgicalHistory', field: 'pelvicInflammatoryDisease', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Endometriosis?', section: 'medicalSurgicalHistory', field: 'endometriosis', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Polycystic ovary syndrome (PCOS)?', section: 'medicalSurgicalHistory', field: 'polycysticOvarySyndrome', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Uterine fibroids?', section: 'medicalSurgicalHistory', field: 'fibroids', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Thyroid disorder?', section: 'medicalSurgicalHistory', field: 'thyroidDisorder', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Diabetes?', section: 'medicalSurgicalHistory', field: 'diabetes', options: yesNo }));

  card.appendChild(radioGroup({
    label: 'History of cancer or cancer treatment?',
    section: 'medicalSurgicalHistory', field: 'cancerHistory', options: yesNo
  }));
  const cancerDetails = document.createElement('div');
  cancerDetails.dataset.conditional = 'medicalSurgicalHistory.cancerHistory=yes';
  cancerDetails.appendChild(textArea({
    label: 'Cancer / treatment details (chemotherapy, radiotherapy, surgery)',
    section: 'medicalSurgicalHistory', field: 'cancerTreatmentDetails',
    rows: 3
  }));
  card.appendChild(cancerDetails);

  card.appendChild(radioGroup({
    label: 'Prior pelvic or abdominal surgery?',
    section: 'medicalSurgicalHistory', field: 'pelvicSurgery', options: yesNo
  }));
  const pelvicSurgeryDetails = document.createElement('div');
  pelvicSurgeryDetails.dataset.conditional = 'medicalSurgicalHistory.pelvicSurgery=yes';
  pelvicSurgeryDetails.appendChild(textArea({
    label: 'Pelvic / abdominal surgery details',
    section: 'medicalSurgicalHistory', field: 'pelvicSurgeryDetails',
    rows: 3
  }));
  card.appendChild(pelvicSurgeryDetails);

  card.appendChild(radioGroup({
    label: 'History of sexually transmitted infections (STIs)?',
    section: 'medicalSurgicalHistory', field: 'sexuallyTransmittedInfections', options: yesNo
  }));
  const stiDetails = document.createElement('div');
  stiDetails.dataset.conditional = 'medicalSurgicalHistory.sexuallyTransmittedInfections=yes';
  stiDetails.appendChild(textInput({
    label: 'STI details (organism, year, treatment)',
    section: 'medicalSurgicalHistory', field: 'stiDetails'
  }));
  card.appendChild(stiDetails);

  card.appendChild(textArea({
    label: 'Other medical conditions',
    section: 'medicalSurgicalHistory', field: 'otherConditions',
    placeholder: 'Any other conditions…', rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Lifestyle Factors',
    description: 'BMI, smoking, alcohol, caffeine, and occupational hazards.'
  });

  const measurements = document.createElement('div');
  measurements.className = 'three-col';
  measurements.appendChild(textInput({
    label: 'Weight', section: 'lifestyleFactors', field: 'weight',
    type: 'number', min: 1, max: 300, unit: 'kg'
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'lifestyleFactors', field: 'height',
    type: 'number', min: 50, max: 250, unit: 'cm'
  }));
  measurements.appendChild(readOnlyReadout({
    label: 'BMI',
    id: 'bmi-readout',
    render: () => {
      const bmi = state.lifestyleFactors.bmi;
      if (bmi == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${bmi}</strong> <span class="muted">(${esc(bmiCategory(bmi))})</span>`;
    }
  }));
  card.appendChild(measurements);

  card.appendChild(radioGroup({
    label: 'Tobacco / smoking status',
    section: 'lifestyleFactors', field: 'tobaccoStatus',
    options: [
      { value: 'never', label: 'Never smoked' },
      { value: 'former', label: 'Former smoker' },
      { value: 'current', label: 'Current smoker' }
    ]
  }));
  const cigDetails = document.createElement('div');
  cigDetails.dataset.conditional = 'lifestyleFactors.tobaccoStatus=current';
  cigDetails.appendChild(textInput({
    label: 'Cigarettes per day',
    section: 'lifestyleFactors', field: 'cigarettesPerDay',
    type: 'number', min: 0, max: 100
  }));
  card.appendChild(cigDetails);

  card.appendChild(radioGroup({
    label: 'Alcohol intake',
    section: 'lifestyleFactors', field: 'alcoholLevel',
    options: [
      { value: 'none', label: 'None' },
      { value: 'low', label: 'Low (≤ 4 units/week)' },
      { value: 'moderate', label: 'Moderate (5-14 units/week)' },
      { value: 'heavy', label: 'Heavy (> 14 units/week)' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Alcohol units per week (UK units)',
    section: 'lifestyleFactors', field: 'alcoholUnitsPerWeek',
    type: 'number', min: 0, max: 100
  }));

  card.appendChild(radioGroup({
    label: 'Caffeine intake',
    section: 'lifestyleFactors', field: 'caffeineLevel',
    options: [
      { value: 'low', label: 'Low (≤ 200 mg/day)' },
      { value: 'moderate', label: 'Moderate (201-400 mg/day)' },
      { value: 'high', label: 'High (> 400 mg/day)' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Recreational drug use?',
    section: 'lifestyleFactors', field: 'recreationalDrugs', options: yesNo
  }));
  const drugDetails = document.createElement('div');
  drugDetails.dataset.conditional = 'lifestyleFactors.recreationalDrugs=yes';
  drugDetails.appendChild(textInput({
    label: 'Recreational drug details',
    section: 'lifestyleFactors', field: 'recreationalDrugDetails'
  }));
  card.appendChild(drugDetails);

  card.appendChild(selectInput({
    label: 'Exercise frequency',
    section: 'lifestyleFactors', field: 'exerciseFrequency',
    options: [
      { value: 'none', label: 'None' },
      { value: 'low', label: 'Low (1-2 sessions/week)' },
      { value: 'moderate', label: 'Moderate (3-4 sessions/week)' },
      { value: 'high', label: 'High (5+ sessions/week)' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Occupational hazards (heat, chemicals, radiation)?',
    section: 'lifestyleFactors', field: 'occupationalHazards', options: yesNo
  }));
  const occDetails = document.createElement('div');
  occDetails.dataset.conditional = 'lifestyleFactors.occupationalHazards=yes';
  occDetails.appendChild(textInput({
    label: 'Occupational hazard details',
    section: 'lifestyleFactors', field: 'occupationalHazardDetails'
  }));
  card.appendChild(occDetails);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Current Medications & Supplements',
    description: 'List medications and pre-conception supplements.'
  });

  const medsHeader = document.createElement('div');
  medsHeader.className = 'list-section-header';
  medsHeader.innerHTML = `
    <h3>Current medications</h3>
    <p class="hint">Include prescribed and over-the-counter medications.</p>
  `;
  card.appendChild(medsHeader);
  card.appendChild(medicationListEditor({
    section: 'medicationsSupplements',
    field: 'currentMedications',
    addLabel: 'Add medication'
  }));

  card.appendChild(radioGroup({
    label: 'Taking pre-conception folic acid?',
    section: 'medicationsSupplements', field: 'folicAcid', options: yesNo
  }));
  const folicDetails = document.createElement('div');
  folicDetails.dataset.conditional = 'medicationsSupplements.folicAcid=yes';
  folicDetails.appendChild(textInput({
    label: 'Folic acid daily dose',
    section: 'medicationsSupplements', field: 'folicAcidDoseMcg',
    type: 'number', min: 0, max: 5000, unit: 'mcg'
  }));
  card.appendChild(folicDetails);

  card.appendChild(radioGroup({
    label: 'Taking vitamin D supplement?',
    section: 'medicationsSupplements', field: 'vitaminD', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Other supplements',
    section: 'medicationsSupplements', field: 'otherSupplements',
    placeholder: 'List any other supplements (e.g. CoQ10, omega-3, prenatal multivitamin)…',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Partner Factors & Semen Analysis',
    description: 'Partner lifestyle and WHO 2021 semen analysis (if completed).'
  });

  card.appendChild(textInput({
    label: 'Partner age',
    section: 'partnerSemen', field: 'partnerAgeYears',
    type: 'number', min: 0, max: 100, unit: 'years'
  }));

  card.appendChild(radioGroup({
    label: 'Partner smoking status',
    section: 'partnerSemen', field: 'partnerSmoking',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'former', label: 'Former' },
      { value: 'current', label: 'Current' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Partner alcohol intake',
    section: 'partnerSemen', field: 'partnerAlcohol',
    options: [
      { value: 'none', label: 'None' },
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'heavy', label: 'Heavy' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Partner occupational hazards',
    section: 'partnerSemen', field: 'partnerOccupationalHazards',
    placeholder: 'Heat, chemicals, radiation, prolonged sitting…', rows: 2
  }));

  card.appendChild(textArea({
    label: 'Partner medical history relevant to fertility',
    section: 'partnerSemen', field: 'partnerMedicalHistory',
    placeholder: 'Mumps orchitis, varicocele, undescended testes, prior surgery…', rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Has the partner had a semen analysis?',
    section: 'partnerSemen', field: 'semenAnalysisDone', options: yesNo
  }));

  const semenDetails = document.createElement('div');
  semenDetails.dataset.conditional = 'partnerSemen.semenAnalysisDone=yes';

  semenDetails.appendChild(textInput({
    label: 'Semen analysis date',
    section: 'partnerSemen', field: 'semenAnalysisDate', type: 'date'
  }));

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Volume',
    section: 'partnerSemen', field: 'semenVolumeMl',
    type: 'number', min: 0, max: 20, step: 0.1, unit: 'mL'
  }));
  grid.appendChild(textInput({
    label: 'Concentration',
    section: 'partnerSemen', field: 'semenConcentrationMillionPerMl',
    type: 'number', min: 0, max: 500, step: 0.1, unit: 'million / mL'
  }));
  semenDetails.appendChild(grid);

  const grid2 = document.createElement('div');
  grid2.className = 'three-col';
  grid2.appendChild(textInput({
    label: 'Total motility',
    section: 'partnerSemen', field: 'semenTotalMotilityPercent',
    type: 'number', min: 0, max: 100, unit: '%'
  }));
  grid2.appendChild(textInput({
    label: 'Progressive motility',
    section: 'partnerSemen', field: 'semenProgressiveMotilityPercent',
    type: 'number', min: 0, max: 100, unit: '%'
  }));
  grid2.appendChild(textInput({
    label: 'Normal morphology',
    section: 'partnerSemen', field: 'semenNormalMorphologyPercent',
    type: 'number', min: 0, max: 100, unit: '%'
  }));
  semenDetails.appendChild(grid2);

  semenDetails.appendChild(textArea({
    label: 'Semen analysis notes',
    section: 'partnerSemen', field: 'semenNotes', rows: 3
  }));

  card.appendChild(semenDetails);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Hormone Profile',
    description: 'Recent hormone results (leave blank if not yet done).'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'FSH (day 2/3)',
    section: 'hormoneProfile', field: 'fsh',
    type: 'number', min: 0, max: 200, step: 0.1, unit: 'IU/L'
  }));
  grid.appendChild(textInput({
    label: 'LH (day 2/3)',
    section: 'hormoneProfile', field: 'lh',
    type: 'number', min: 0, max: 200, step: 0.1, unit: 'IU/L'
  }));
  card.appendChild(grid);

  const grid2 = document.createElement('div');
  grid2.className = 'two-col';
  grid2.appendChild(textInput({
    label: 'AMH',
    section: 'hormoneProfile', field: 'amh',
    type: 'number', min: 0, max: 200, step: 0.01, unit: 'pmol/L'
  }));
  grid2.appendChild(textInput({
    label: 'Oestradiol',
    section: 'hormoneProfile', field: 'oestradiol',
    type: 'number', min: 0, max: 5000, step: 1, unit: 'pmol/L'
  }));
  card.appendChild(grid2);

  const grid3 = document.createElement('div');
  grid3.className = 'two-col';
  grid3.appendChild(textInput({
    label: 'TSH',
    section: 'hormoneProfile', field: 'tsh',
    type: 'number', min: 0, max: 100, step: 0.01, unit: 'mIU/L'
  }));
  grid3.appendChild(textInput({
    label: 'Prolactin',
    section: 'hormoneProfile', field: 'prolactin',
    type: 'number', min: 0, max: 10000, step: 1, unit: 'mIU/L'
  }));
  card.appendChild(grid3);

  const grid4 = document.createElement('div');
  grid4.className = 'two-col';
  grid4.appendChild(textInput({
    label: 'Testosterone',
    section: 'hormoneProfile', field: 'testosterone',
    type: 'number', min: 0, max: 100, step: 0.1, unit: 'nmol/L'
  }));
  grid4.appendChild(textInput({
    label: 'Day-21 progesterone',
    section: 'hormoneProfile', field: 'progesteroneDay21',
    type: 'number', min: 0, max: 200, step: 0.1, unit: 'nmol/L'
  }));
  card.appendChild(grid4);

  card.appendChild(textInput({
    label: 'Hormone test date',
    section: 'hormoneProfile', field: 'hormoneTestDate', type: 'date'
  }));
  card.appendChild(textArea({
    label: 'Hormone profile notes',
    section: 'hormoneProfile', field: 'hormoneNotes', rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Investigations',
    description: 'Pelvic ultrasound, tubal patency, and other imaging.'
  });

  card.appendChild(radioGroup({
    label: 'Transvaginal ultrasound performed?',
    section: 'investigations', field: 'transvaginalUltrasound',
    options: [
      { value: 'yes-normal', label: 'Yes — normal' },
      { value: 'yes-abnormal', label: 'Yes — abnormal' },
      { value: 'no', label: 'Not yet performed' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Antral follicle count (AFC)',
    section: 'investigations', field: 'antralFollicleCount',
    type: 'number', min: 0, max: 100
  }));

  card.appendChild(radioGroup({
    label: 'Hysterosalpingogram (HSG) performed?',
    section: 'investigations', field: 'hysterosalpingogramDone', options: yesNo
  }));
  const hsgResult = document.createElement('div');
  hsgResult.dataset.conditional = 'investigations.hysterosalpingogramDone=yes';
  hsgResult.appendChild(radioGroup({
    label: 'HSG result',
    section: 'investigations', field: 'hysterosalpingogramResult',
    options: [
      { value: 'normal', label: 'Normal — both tubes patent' },
      { value: 'abnormal', label: 'Abnormal (block, hydrosalpinx)' }
    ]
  }));
  card.appendChild(hsgResult);

  card.appendChild(radioGroup({
    label: 'Hysteroscopy performed?',
    section: 'investigations', field: 'hysteroscopyDone', options: yesNo
  }));
  const hystResult = document.createElement('div');
  hystResult.dataset.conditional = 'investigations.hysteroscopyDone=yes';
  hystResult.appendChild(radioGroup({
    label: 'Hysteroscopy result',
    section: 'investigations', field: 'hysteroscopyResult',
    options: [
      { value: 'normal', label: 'Normal cavity' },
      { value: 'abnormal', label: 'Abnormal (polyp, fibroid, septum)' }
    ]
  }));
  card.appendChild(hystResult);

  card.appendChild(radioGroup({
    label: 'Laparoscopy performed?',
    section: 'investigations', field: 'laparoscopyDone', options: yesNo
  }));
  const lapResult = document.createElement('div');
  lapResult.dataset.conditional = 'investigations.laparoscopyDone=yes';
  lapResult.appendChild(radioGroup({
    label: 'Laparoscopy result',
    section: 'investigations', field: 'laparoscopyResult',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'abnormal', label: 'Abnormal (endometriosis, adhesions)' }
    ]
  }));
  card.appendChild(lapResult);

  card.appendChild(textArea({
    label: 'Other investigations',
    section: 'investigations', field: 'otherInvestigations',
    placeholder: 'Any other imaging or tests…', rows: 3
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Clinical Recommendation',
    description: 'Optional clinician fields summarising next steps.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Clinician name',
    section: 'clinicalRecommendation', field: 'clinicianName'
  }));
  grid.appendChild(textInput({
    label: 'Assessment date',
    section: 'clinicalRecommendation', field: 'assessmentDate', type: 'date'
  }));
  card.appendChild(grid);

  card.appendChild(selectInput({
    label: 'Recommendation',
    section: 'clinicalRecommendation', field: 'recommendation',
    options: [
      { value: 'continue-attempts', label: 'Continue attempts' },
      { value: 'lifestyle-optimisation', label: 'Lifestyle optimisation' },
      { value: 'targeted-treatment', label: 'Targeted medical treatment' },
      { value: 'specialist-referral', label: 'Specialist referral' },
      { value: 'art-referral', label: 'ART (IVF/ICSI) referral' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Referral urgency',
    section: 'clinicalRecommendation', field: 'referralUrgency',
    options: [
      { value: 'routine', label: 'Routine' },
      { value: 'soon', label: 'Soon (< 6 weeks)' },
      { value: 'urgent', label: 'Urgent (< 2 weeks)' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Additional notes for the clinical team',
    section: 'clinicalRecommendation', field: 'additionalNotes',
    placeholder: 'Anything else relevant to the assessment…', rows: 4
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

function refreshAutoCalculatedReadouts() {
  const bmi = document.getElementById('bmi-readout');
  if (bmi) {
    const v = state.lifestyleFactors.bmi;
    bmi.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}</strong> <span class="muted">(${esc(bmiCategory(v))})</span>`;
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics
  ['demographics', 'patientFirstName'],
  ['demographics', 'patientLastName'],
  ['demographics', 'patientDateOfBirth'],
  ['demographics', 'patientSex'],
  // Reproductive history
  ['reproductiveHistory', 'durationTryingMonths'],
  ['reproductiveHistory', 'priorPregnancies'],
  ['reproductiveHistory', 'priorLiveBirths'],
  ['reproductiveHistory', 'priorMiscarriages'],
  ['reproductiveHistory', 'priorFertilityTreatment'],
  ['reproductiveHistory', 'contraceptionStopped'],
  // Menstrual cycle
  ['menstrualCycle', 'cycleLengthDays'],
  ['menstrualCycle', 'cycleRegularity'],
  ['menstrualCycle', 'periodDurationDays'],
  ['menstrualCycle', 'heavyBleeding'],
  ['menstrualCycle', 'dysmenorrhoea'],
  ['menstrualCycle', 'intermenstrualBleeding'],
  // Medical / surgical
  ['medicalSurgicalHistory', 'pelvicInflammatoryDisease'],
  ['medicalSurgicalHistory', 'endometriosis'],
  ['medicalSurgicalHistory', 'polycysticOvarySyndrome'],
  ['medicalSurgicalHistory', 'fibroids'],
  ['medicalSurgicalHistory', 'thyroidDisorder'],
  ['medicalSurgicalHistory', 'diabetes'],
  ['medicalSurgicalHistory', 'cancerHistory'],
  ['medicalSurgicalHistory', 'pelvicSurgery'],
  ['medicalSurgicalHistory', 'sexuallyTransmittedInfections'],
  // Lifestyle
  ['lifestyleFactors', 'weight'],
  ['lifestyleFactors', 'height'],
  ['lifestyleFactors', 'tobaccoStatus'],
  ['lifestyleFactors', 'alcoholLevel'],
  ['lifestyleFactors', 'caffeineLevel'],
  ['lifestyleFactors', 'recreationalDrugs'],
  ['lifestyleFactors', 'occupationalHazards'],
  // Supplements
  ['medicationsSupplements', 'folicAcid'],
  ['medicationsSupplements', 'vitaminD'],
  // Partner / semen
  ['partnerSemen', 'partnerAgeYears'],
  ['partnerSemen', 'partnerSmoking'],
  ['partnerSemen', 'partnerAlcohol'],
  ['partnerSemen', 'semenAnalysisDone'],
  // Investigations
  ['investigations', 'transvaginalUltrasound'],
  ['investigations', 'hysterosalpingogramDone'],
  ['investigations', 'hysteroscopyDone'],
  ['investigations', 'laparoscopyDone']
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

  const { concernScore, concernLevel, firedRules, additionalFlags, timestamp } = lastResult;

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
    ? `<p class="muted">No scoring rules fired — assessment looks unremarkable so far.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Description</th>
            <th scope="col">Weight</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Fertility Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Overall concern level</h3>
      <p class="concern-summary">
        <span class="concern-badge ${concernLevelClass(concernLevel)}">${esc(concernLevelLabel(concernLevel))}</span>
        <span class="concern-score">Concern score: ${concernScore}</span>
      </p>
      <p class="muted">Based on NICE CG156 triage criteria and WHO 2021 semen-analysis thresholds.</p>

      <h3>Fired rules</h3>
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
  const { concernScore, concernLevel, firedRules } = calculateConcern(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    concernScore,
    concernLevel,
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
  { step: 2, section: 'reproductiveHistory', title: 'Reproductive History' },
  { step: 3, section: 'menstrualCycle', title: 'Menstrual Cycle History' },
  { step: 4, section: 'medicalSurgicalHistory', title: 'Medical & Surgical History' },
  { step: 5, section: 'lifestyleFactors', title: 'Lifestyle Factors' },
  { step: 6, section: 'medicationsSupplements', title: 'Current Medications & Supplements' },
  { step: 7, section: 'partnerSemen', title: 'Partner Factors & Semen Analysis' },
  { step: 8, section: 'hormoneProfile', title: 'Hormone Profile' },
  { step: 9, section: 'investigations', title: 'Investigations' },
  { step: 10, section: 'clinicalRecommendation', title: 'Clinical Recommendation' }
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
