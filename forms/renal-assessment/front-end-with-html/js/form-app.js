import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateKdigo } from './kdigo-grader.js';
import { riskLevelClass, riskLevelLabel } from './kdigo-rules.js';
import { albuminuriaCategoryLabel, bmiCategory, calculateAge, calculateBMI, classifyAlbuminuriaCategory, classifyGfrCategory, emptyAssessment, estimateEgfrCkdEpi2021, gfrCategoryLabel } from './types.js';

// Renal Assessment - patient/clinician wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure KDIGO classification engine and renders an inline report.
// State is persisted to localStorage so a partial fill survives a reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'renal-assessment.front-end-form-with-html.v1';

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

let state = loadState();
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'renal-assessment',
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
  state.demographics.age = calculateAge(state.demographics.dateOfBirth);
  state.demographics.bmi = calculateBMI(
    state.demographics.weight,
    state.demographics.height
  );
  // Auto-derive eGFR only if creatinine + age + sex are present and an
  // eGFR has not been explicitly entered.
  const explicitEgfr = state.bloodTests.egfr;
  if (explicitEgfr === null || explicitEgfr === undefined || explicitEgfr === '') {
    const computed = estimateEgfrCkdEpi2021(
      state.bloodTests.serumCreatinine,
      state.demographics.age,
      state.demographics.sex
    );
    state.bloodTests._computedEgfr = computed;
  } else {
    state.bloodTests._computedEgfr = null;
  }
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
  const requiredAttrs = opts.required ? ' data-required' : '';
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
    <label class="label" for="${id}"${requiredAttrs}>${labelText}</label>
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
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const labelEl = document.createElement('span');
  labelEl.className = 'label';
  labelEl.id = `${groupId}-label`;
  labelEl.textContent = opts.label;
  wrapper.appendChild(labelEl);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', `${groupId}-label`);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    label.innerHTML = `
      <input type="radio" class="radio-input" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) setField(opts.section, opts.field, option.value);
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);
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
    `<span class="section-step">Section ${opts.stepNumber} of 9</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Repeating-list editor (current medications)
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
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Lisinopril">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 10 mg">
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
// Section renderers (1 per KDIGO step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const dipstickOptions = [
  { value: 'negative', label: 'Negative' },
  { value: 'trace', label: 'Trace' },
  { value: '1+', label: '1+' },
  { value: '2+', label: '2+' },
  { value: '3+', label: '3+' },
  { value: '4+', label: '4+' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic patient information.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'demographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(grid);

  const dobRow = document.createElement('div');
  dobRow.className = 'two-col';
  dobRow.appendChild(textInput({
    label: 'Date of Birth',
    section: 'demographics',
    field: 'dateOfBirth',
    type: 'date',
    required: true
  }));
  dobRow.appendChild(readOnlyReadout({
    label: 'Age',
    id: 'age-readout',
    render: () => {
      const age = state.demographics.age;
      if (age == null) return '<span class="muted">Auto-calculated from DOB</span>';
      return `<strong>${age}</strong> <span class="muted">years</span>`;
    }
  }));
  card.appendChild(dobRow);

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
    label: 'Ethnicity',
    section: 'demographics',
    field: 'ethnicity',
    options: [
      { value: 'white', label: 'White' },
      { value: 'black', label: 'Black / African / Caribbean' },
      { value: 'asian', label: 'Asian' },
      { value: 'hispanic', label: 'Hispanic / Latino' },
      { value: 'middle-eastern', label: 'Middle Eastern' },
      { value: 'mixed', label: 'Mixed / Multiple' },
      { value: 'other', label: 'Other' },
      { value: 'prefer-not-to-say', label: 'Prefer not to say' }
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

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Presenting Symptoms',
    description: 'Symptoms suggestive of kidney disease or uremia.'
  });

  card.appendChild(radioGroup({ label: 'Fatigue or weakness?', section: 'presentingSymptoms', field: 'fatigue', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Edema (ankle, leg, periorbital)?', section: 'presentingSymptoms', field: 'edema', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Foamy / frothy urine?', section: 'presentingSymptoms', field: 'foamyUrine', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Nocturia (waking at night to urinate)?', section: 'presentingSymptoms', field: 'nocturia', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Hematuria (blood in urine)?', section: 'presentingSymptoms', field: 'hematuria', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Flank or loin pain?', section: 'presentingSymptoms', field: 'flankPain', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Reduced urine output (oliguria)?', section: 'presentingSymptoms', field: 'reducedUrineOutput', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Pruritus (itching)?', section: 'presentingSymptoms', field: 'pruritus', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Nausea or vomiting?', section: 'presentingSymptoms', field: 'nauseaVomiting', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Loss of appetite?', section: 'presentingSymptoms', field: 'appetiteLoss', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Shortness of breath (dyspnea)?', section: 'presentingSymptoms', field: 'dyspnea', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Confusion or altered mental status?', section: 'presentingSymptoms', field: 'confusion', options: yesNo }));

  card.appendChild(selectInput({
    label: 'Symptom duration',
    section: 'presentingSymptoms', field: 'symptomDuration',
    options: [
      { value: 'days', label: 'Days' },
      { value: 'weeks', label: 'Weeks' },
      { value: 'months', label: 'Months' },
      { value: 'years', label: 'Years' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Other symptoms',
    section: 'presentingSymptoms', field: 'otherSymptoms',
    placeholder: 'Any other symptoms not listed above…',
    rows: 3
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'CKD Risk Factors',
    description: 'Conditions and exposures that raise the risk of chronic kidney disease.'
  });

  card.appendChild(radioGroup({ label: 'Hypertension?', section: 'ckdRiskFactors', field: 'hypertension', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Diabetes mellitus?', section: 'ckdRiskFactors', field: 'diabetes', options: yesNo }));
  const dmDetails = document.createElement('div');
  dmDetails.dataset.conditional = 'ckdRiskFactors.diabetes=yes';
  dmDetails.appendChild(selectInput({
    label: 'Diabetes type',
    section: 'ckdRiskFactors', field: 'diabetesType',
    options: [
      { value: 'type1', label: 'Type 1' },
      { value: 'type2', label: 'Type 2' },
      { value: 'gestational', label: 'Gestational' },
      { value: 'other', label: 'Other / unknown' }
    ]
  }));
  card.appendChild(dmDetails);

  card.appendChild(radioGroup({ label: 'Cardiovascular disease (IHD, stroke, PAD)?', section: 'ckdRiskFactors', field: 'cardiovascularDisease', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Family history of CKD?', section: 'ckdRiskFactors', field: 'familyHistoryCkd', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Family history of polycystic kidney disease?', section: 'ckdRiskFactors', field: 'familyHistoryPolycysticKidney', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Prior episode of acute kidney injury (AKI)?', section: 'ckdRiskFactors', field: 'priorAki', options: yesNo }));
  card.appendChild(radioGroup({ label: 'History of kidney stones?', section: 'ckdRiskFactors', field: 'kidneyStones', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Recurrent urinary tract infections?', section: 'ckdRiskFactors', field: 'recurrentUti', options: yesNo }));

  card.appendChild(radioGroup({ label: 'Autoimmune disease (e.g. SLE, vasculitis)?', section: 'ckdRiskFactors', field: 'autoimmuneDisease', options: yesNo }));
  const autoDetails = document.createElement('div');
  autoDetails.dataset.conditional = 'ckdRiskFactors.autoimmuneDisease=yes';
  autoDetails.appendChild(textInput({
    label: 'Autoimmune disease details',
    section: 'ckdRiskFactors', field: 'autoimmuneDetails'
  }));
  card.appendChild(autoDetails);

  card.appendChild(radioGroup({
    label: 'Exposure to nephrotoxic drugs (aminoglycosides, contrast, chemotherapy, lithium)?',
    section: 'ckdRiskFactors', field: 'nephrotoxicDrugs', options: yesNo
  }));
  const nephDetails = document.createElement('div');
  nephDetails.dataset.conditional = 'ckdRiskFactors.nephrotoxicDrugs=yes';
  nephDetails.appendChild(textInput({
    label: 'Which nephrotoxic drug(s)?',
    section: 'ckdRiskFactors', field: 'nephrotoxicDrugDetails'
  }));
  card.appendChild(nephDetails);

  card.appendChild(radioGroup({
    label: 'Regular NSAID use?',
    section: 'ckdRiskFactors', field: 'nsaidUse', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Smoking status',
    section: 'ckdRiskFactors', field: 'smoking',
    options: [
      { value: 'current', label: 'Current smoker' },
      { value: 'ex', label: 'Ex-smoker' },
      { value: 'never', label: 'Never smoked' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Obesity (BMI >= 30)?',
    section: 'ckdRiskFactors', field: 'obesity', options: yesNo
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Physical Examination',
    description: 'Targeted exam findings relevant to kidney disease.'
  });

  const bpRow = document.createElement('div');
  bpRow.className = 'three-col';
  bpRow.appendChild(textInput({
    label: 'Systolic BP', section: 'physicalExamination', field: 'systolicBp',
    type: 'number', min: 50, max: 280, unit: 'mmHg'
  }));
  bpRow.appendChild(textInput({
    label: 'Diastolic BP', section: 'physicalExamination', field: 'diastolicBp',
    type: 'number', min: 30, max: 180, unit: 'mmHg'
  }));
  bpRow.appendChild(textInput({
    label: 'Heart rate', section: 'physicalExamination', field: 'heartRate',
    type: 'number', min: 20, max: 250, unit: 'bpm'
  }));
  card.appendChild(bpRow);

  card.appendChild(radioGroup({ label: 'Peripheral edema?', section: 'physicalExamination', field: 'peripheralEdema', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Pulmonary edema (crackles)?', section: 'physicalExamination', field: 'pulmonaryEdema', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Elevated JVD?', section: 'physicalExamination', field: 'jvdElevated', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Pallor?', section: 'physicalExamination', field: 'pallor', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Uremic skin changes (dry, scratch marks, frost)?', section: 'physicalExamination', field: 'uremicSkin', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Flank tenderness?', section: 'physicalExamination', field: 'flankTenderness', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Palpable kidneys?', section: 'physicalExamination', field: 'palpableKidneys', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Bladder distension?', section: 'physicalExamination', field: 'bladderDistension', options: yesNo }));

  card.appendChild(textArea({
    label: 'Examination notes',
    section: 'physicalExamination', field: 'examNotes',
    placeholder: 'Other relevant findings…',
    rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Blood Tests',
    description: 'Recent renal-function panel and related labs. eGFR will auto-calculate from creatinine + age + sex (CKD-EPI 2021) if not entered directly.'
  });

  const creRow = document.createElement('div');
  creRow.className = 'three-col';
  creRow.appendChild(textInput({
    label: 'Serum creatinine',
    section: 'bloodTests', field: 'serumCreatinine',
    type: 'number', min: 0, max: 30, step: 0.01, unit: 'mg/dL'
  }));
  creRow.appendChild(textInput({
    label: 'eGFR (entered)',
    section: 'bloodTests', field: 'egfr',
    type: 'number', min: 0, max: 200, step: 0.1, unit: 'mL/min/1.73 m²'
  }));
  creRow.appendChild(readOnlyReadout({
    label: 'eGFR (computed)',
    id: 'egfr-readout',
    render: () => {
      const v = state.bloodTests._computedEgfr;
      if (v == null) return '<span class="muted">Auto from creatinine</span>';
      const cat = classifyGfrCategory(v);
      return `<strong>${v}</strong> <span class="muted">${esc(cat)}</span>`;
    }
  }));
  card.appendChild(creRow);

  const chemRow1 = document.createElement('div');
  chemRow1.className = 'three-col';
  chemRow1.appendChild(textInput({ label: 'BUN / urea', section: 'bloodTests', field: 'bun', type: 'number', min: 0, max: 200, step: 0.1, unit: 'mg/dL' }));
  chemRow1.appendChild(textInput({ label: 'Sodium', section: 'bloodTests', field: 'sodium', type: 'number', min: 100, max: 180, step: 0.1, unit: 'mmol/L' }));
  chemRow1.appendChild(textInput({ label: 'Potassium', section: 'bloodTests', field: 'potassium', type: 'number', min: 1, max: 10, step: 0.1, unit: 'mmol/L' }));
  card.appendChild(chemRow1);

  const chemRow2 = document.createElement('div');
  chemRow2.className = 'three-col';
  chemRow2.appendChild(textInput({ label: 'Chloride', section: 'bloodTests', field: 'chloride', type: 'number', min: 60, max: 140, step: 0.1, unit: 'mmol/L' }));
  chemRow2.appendChild(textInput({ label: 'Bicarbonate', section: 'bloodTests', field: 'bicarbonate', type: 'number', min: 5, max: 50, step: 0.1, unit: 'mmol/L' }));
  chemRow2.appendChild(textInput({ label: 'Albumin', section: 'bloodTests', field: 'albumin', type: 'number', min: 0, max: 60, step: 0.1, unit: 'g/L' }));
  card.appendChild(chemRow2);

  const mineralRow = document.createElement('div');
  mineralRow.className = 'three-col';
  mineralRow.appendChild(textInput({ label: 'Calcium', section: 'bloodTests', field: 'calcium', type: 'number', min: 1, max: 4, step: 0.01, unit: 'mmol/L' }));
  mineralRow.appendChild(textInput({ label: 'Phosphate', section: 'bloodTests', field: 'phosphate', type: 'number', min: 0, max: 5, step: 0.01, unit: 'mmol/L' }));
  mineralRow.appendChild(textInput({ label: 'Magnesium', section: 'bloodTests', field: 'magnesium', type: 'number', min: 0, max: 5, step: 0.01, unit: 'mmol/L' }));
  card.appendChild(mineralRow);

  const otherRow = document.createElement('div');
  otherRow.className = 'three-col';
  otherRow.appendChild(textInput({ label: 'Hemoglobin', section: 'bloodTests', field: 'hemoglobin', type: 'number', min: 30, max: 250, unit: 'g/L' }));
  otherRow.appendChild(textInput({ label: 'HbA1c', section: 'bloodTests', field: 'hba1c', type: 'number', min: 3, max: 20, step: 0.1, unit: '%' }));
  otherRow.appendChild(textInput({ label: 'PTH', section: 'bloodTests', field: 'pth', type: 'number', min: 0, max: 5000, unit: 'pg/mL' }));
  card.appendChild(otherRow);

  card.appendChild(textInput({
    label: 'Vitamin D (25-OH)',
    section: 'bloodTests', field: 'vitaminD',
    type: 'number', min: 0, max: 200, unit: 'ng/mL'
  }));

  card.appendChild(textInput({
    label: 'Test date',
    section: 'bloodTests', field: 'testDate',
    type: 'date'
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Urine Tests',
    description: 'Urinary albumin / protein quantification and dipstick analysis.'
  });

  const acrRow = document.createElement('div');
  acrRow.className = 'three-col';
  acrRow.appendChild(textInput({
    label: 'Urine ACR',
    section: 'urineTests', field: 'acr',
    type: 'number', min: 0, max: 1000, step: 0.1, unit: 'mg/mmol'
  }));
  acrRow.appendChild(textInput({
    label: 'Urine PCR',
    section: 'urineTests', field: 'pcr',
    type: 'number', min: 0, max: 1000, step: 0.1, unit: 'mg/mmol'
  }));
  acrRow.appendChild(readOnlyReadout({
    label: 'Albuminuria category',
    id: 'acr-readout',
    render: () => {
      const a = classifyAlbuminuriaCategory(state.urineTests.acr);
      if (!a) return '<span class="muted">Auto from ACR</span>';
      return `<strong>${a}</strong> <span class="muted">${esc(albuminuriaCategoryLabel(a))}</span>`;
    }
  }));
  card.appendChild(acrRow);

  const dipHeader = document.createElement('div');
  dipHeader.className = 'list-section-header';
  dipHeader.innerHTML = '<h3>Urine dipstick</h3>';
  card.appendChild(dipHeader);

  card.appendChild(selectInput({ label: 'Protein', section: 'urineTests', field: 'dipstickProtein', options: dipstickOptions }));
  card.appendChild(selectInput({ label: 'Blood', section: 'urineTests', field: 'dipstickBlood', options: dipstickOptions }));
  card.appendChild(selectInput({ label: 'Glucose', section: 'urineTests', field: 'dipstickGlucose', options: dipstickOptions }));
  card.appendChild(selectInput({ label: 'Leukocytes', section: 'urineTests', field: 'dipstickLeukocytes', options: dipstickOptions }));
  card.appendChild(selectInput({ label: 'Nitrites', section: 'urineTests', field: 'dipstickNitrites', options: [
    { value: 'negative', label: 'Negative' },
    { value: 'positive', label: 'Positive' }
  ] }));

  card.appendChild(radioGroup({
    label: 'Microscopy: urinary casts present?',
    section: 'urineTests', field: 'microscopyCasts', options: yesNo
  }));
  const castDetails = document.createElement('div');
  castDetails.dataset.conditional = 'urineTests.microscopyCasts=yes';
  castDetails.appendChild(selectInput({
    label: 'Predominant cast type',
    section: 'urineTests', field: 'castType',
    options: [
      { value: 'hyaline', label: 'Hyaline' },
      { value: 'granular', label: 'Granular' },
      { value: 'red-cell', label: 'Red-cell' },
      { value: 'white-cell', label: 'White-cell' },
      { value: 'fatty', label: 'Fatty' },
      { value: 'waxy', label: 'Waxy' }
    ]
  }));
  card.appendChild(castDetails);

  card.appendChild(textInput({
    label: 'Urine test date',
    section: 'urineTests', field: 'testDate',
    type: 'date'
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Imaging & Biopsy Review',
    description: 'Ultrasound, CT/MRI, and biopsy results if performed.'
  });

  card.appendChild(radioGroup({
    label: 'Renal ultrasound performed?',
    section: 'imagingBiopsy', field: 'renalUltrasoundDone', options: yesNo
  }));
  const usDetails = document.createElement('div');
  usDetails.dataset.conditional = 'imagingBiopsy.renalUltrasoundDone=yes';

  const sizeRow = document.createElement('div');
  sizeRow.className = 'two-col';
  sizeRow.appendChild(textInput({
    label: 'Right kidney length',
    section: 'imagingBiopsy', field: 'rightKidneyLengthMm',
    type: 'number', min: 0, max: 250, unit: 'mm'
  }));
  sizeRow.appendChild(textInput({
    label: 'Left kidney length',
    section: 'imagingBiopsy', field: 'leftKidneyLengthMm',
    type: 'number', min: 0, max: 250, unit: 'mm'
  }));
  usDetails.appendChild(sizeRow);

  usDetails.appendChild(radioGroup({ label: 'Cysts seen?', section: 'imagingBiopsy', field: 'cysts', options: yesNo }));
  usDetails.appendChild(radioGroup({ label: 'Hydronephrosis?', section: 'imagingBiopsy', field: 'hydronephrosis', options: yesNo }));
  usDetails.appendChild(radioGroup({ label: 'Stones?', section: 'imagingBiopsy', field: 'stones', options: yesNo }));
  usDetails.appendChild(textArea({
    label: 'Ultrasound findings',
    section: 'imagingBiopsy', field: 'ultrasoundFindings',
    placeholder: 'Echogenicity, corticomedullary differentiation, etc.',
    rows: 3
  }));
  card.appendChild(usDetails);

  card.appendChild(radioGroup({
    label: 'CT or MRI performed?',
    section: 'imagingBiopsy', field: 'ctOrMri', options: yesNo
  }));
  const ctDetails = document.createElement('div');
  ctDetails.dataset.conditional = 'imagingBiopsy.ctOrMri=yes';
  ctDetails.appendChild(textArea({
    label: 'CT / MRI findings',
    section: 'imagingBiopsy', field: 'ctMriFindings',
    rows: 3
  }));
  card.appendChild(ctDetails);

  card.appendChild(radioGroup({
    label: 'Renal biopsy performed?',
    section: 'imagingBiopsy', field: 'biopsyDone', options: yesNo
  }));
  const biopsyDetails = document.createElement('div');
  biopsyDetails.dataset.conditional = 'imagingBiopsy.biopsyDone=yes';
  biopsyDetails.appendChild(textInput({
    label: 'Biopsy date',
    section: 'imagingBiopsy', field: 'biopsyDate',
    type: 'date'
  }));
  biopsyDetails.appendChild(textArea({
    label: 'Biopsy result / histopathology',
    section: 'imagingBiopsy', field: 'biopsyResult',
    placeholder: 'e.g. IgA nephropathy, FSGS, diabetic glomerulosclerosis…',
    rows: 3
  }));
  card.appendChild(biopsyDetails);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Medication Review & Dose Adjustment',
    description: 'Renal-relevant medications and any required dose adjustments.'
  });

  const medsHeader = document.createElement('div');
  medsHeader.className = 'list-section-header';
  medsHeader.innerHTML = `
    <h3>Current medications</h3>
    <p class="hint">Include all systemic medications relevant to renal management.</p>
  `;
  card.appendChild(medsHeader);
  card.appendChild(medicationListEditor({
    section: 'medicationReview',
    field: 'currentMedications',
    addLabel: 'Add medication'
  }));

  card.appendChild(radioGroup({ label: 'On ACEi or ARB?', section: 'medicationReview', field: 'aceiArb', options: yesNo }));
  card.appendChild(radioGroup({ label: 'On SGLT2 inhibitor?', section: 'medicationReview', field: 'sglt2Inhibitor', options: yesNo }));
  card.appendChild(radioGroup({ label: 'On loop or thiazide diuretic?', section: 'medicationReview', field: 'diuretic', options: yesNo }));
  card.appendChild(radioGroup({ label: 'On statin?', section: 'medicationReview', field: 'statin', options: yesNo }));
  card.appendChild(radioGroup({ label: 'On phosphate binder?', section: 'medicationReview', field: 'phosphateBinder', options: yesNo }));
  card.appendChild(radioGroup({ label: 'On erythropoiesis-stimulating agent (ESA)?', section: 'medicationReview', field: 'erythropoietinAgent', options: yesNo }));

  card.appendChild(radioGroup({
    label: 'Are dose adjustments needed for renal impairment?',
    section: 'medicationReview', field: 'doseAdjustmentsNeeded', options: yesNo
  }));
  const doseDetails = document.createElement('div');
  doseDetails.dataset.conditional = 'medicationReview.doseAdjustmentsNeeded=yes';
  doseDetails.appendChild(textArea({
    label: 'Dose adjustment details',
    section: 'medicationReview', field: 'doseAdjustmentDetails',
    placeholder: 'List drugs and revised doses…',
    rows: 3
  }));
  card.appendChild(doseDetails);

  card.appendChild(radioGroup({
    label: 'Contrast-enhanced imaging planned?',
    section: 'medicationReview', field: 'contrastImagingPlanned', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Medication notes',
    section: 'medicationReview', field: 'medicationNotes',
    placeholder: 'Adherence concerns, side effects, deprescribing decisions…',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Clinical Impression & KDIGO Stage',
    description: 'Clinician synthesis. Leave GFR / albuminuria categories blank to auto-derive from labs.'
  });

  const stagingRow = document.createElement('div');
  stagingRow.className = 'two-col';
  stagingRow.appendChild(selectInput({
    label: 'GFR category (override auto-derived)',
    section: 'clinicalImpression', field: 'gfrCategory',
    options: [
      { value: 'G1', label: 'G1: >=90' },
      { value: 'G2', label: 'G2: 60-89' },
      { value: 'G3a', label: 'G3a: 45-59' },
      { value: 'G3b', label: 'G3b: 30-44' },
      { value: 'G4', label: 'G4: 15-29' },
      { value: 'G5', label: 'G5: <15 (kidney failure)' }
    ]
  }));
  stagingRow.appendChild(selectInput({
    label: 'Albuminuria category (override auto-derived)',
    section: 'clinicalImpression', field: 'albuminuriaCategory',
    options: [
      { value: 'A1', label: 'A1: <3 mg/mmol' },
      { value: 'A2', label: 'A2: 3-30 mg/mmol' },
      { value: 'A3', label: 'A3: >30 mg/mmol' }
    ]
  }));
  card.appendChild(stagingRow);

  card.appendChild(selectInput({
    label: 'Suspected etiology',
    section: 'clinicalImpression', field: 'suspectedEtiology',
    options: [
      { value: 'diabetic-nephropathy', label: 'Diabetic nephropathy' },
      { value: 'hypertensive-nephrosclerosis', label: 'Hypertensive nephrosclerosis' },
      { value: 'glomerulonephritis', label: 'Glomerulonephritis' },
      { value: 'polycystic-kidney-disease', label: 'Polycystic kidney disease' },
      { value: 'tubulointerstitial', label: 'Tubulointerstitial disease' },
      { value: 'obstructive-uropathy', label: 'Obstructive uropathy' },
      { value: 'vascular', label: 'Renovascular disease' },
      { value: 'drug-induced', label: 'Drug-induced nephropathy' },
      { value: 'unknown', label: 'Unknown / under investigation' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Acute kidney injury superimposed on CKD?',
    section: 'clinicalImpression', field: 'aksuperimposedOnCkd', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Nephrology referral indicated?',
    section: 'clinicalImpression', field: 'nephrologyReferral', options: yesNo
  }));
  const refDetails = document.createElement('div');
  refDetails.dataset.conditional = 'clinicalImpression.nephrologyReferral=yes';
  refDetails.appendChild(selectInput({
    label: 'Referral urgency',
    section: 'clinicalImpression', field: 'referralUrgency',
    options: [
      { value: 'urgent', label: 'Urgent (within 1 week)' },
      { value: 'soon', label: 'Soon (within 4 weeks)' },
      { value: 'routine', label: 'Routine' }
    ]
  }));
  card.appendChild(refDetails);

  card.appendChild(radioGroup({
    label: 'Dialysis discussion needed?',
    section: 'clinicalImpression', field: 'dialysisDiscussionNeeded', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Transplant candidate?',
    section: 'clinicalImpression', field: 'transplantCandidate', options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Management plan',
    section: 'clinicalImpression', field: 'managementPlan',
    placeholder: 'Targets, RAAS / SGLT2 plan, anemia management, MBD, lifestyle…',
    rows: 4
  }));

  card.appendChild(selectInput({
    label: 'Follow-up interval',
    section: 'clinicalImpression', field: 'followUpInterval',
    options: [
      { value: '1-month', label: '1 month' },
      { value: '3-months', label: '3 months' },
      { value: '6-months', label: '6 months' },
      { value: '12-months', label: '12 months' },
      { value: 'as-needed', label: 'As needed' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Clinician notes',
    section: 'clinicalImpression', field: 'clinicianNotes',
    rows: 3
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
  const age = document.getElementById('age-readout');
  if (age) {
    const v = state.demographics.age;
    age.innerHTML = v == null
      ? '<span class="muted">Auto-calculated from DOB</span>'
      : `<strong>${v}</strong> <span class="muted">years</span>`;
  }
  const bmi = document.getElementById('bmi-readout');
  if (bmi) {
    const v = state.demographics.bmi;
    bmi.innerHTML = v == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${v}</strong> <span class="muted">(${esc(bmiCategory(v))})</span>`;
  }
  const eg = document.getElementById('egfr-readout');
  if (eg) {
    const v = state.bloodTests._computedEgfr;
    eg.innerHTML = v == null
      ? '<span class="muted">Auto from creatinine</span>'
      : `<strong>${v}</strong> <span class="muted">${esc(classifyGfrCategory(v))}</span>`;
  }
  const acr = document.getElementById('acr-readout');
  if (acr) {
    const a = classifyAlbuminuriaCategory(state.urineTests.acr);
    acr.innerHTML = !a
      ? '<span class="muted">Auto from ACR</span>'
      : `<strong>${a}</strong> <span class="muted">${esc(albuminuriaCategoryLabel(a))}</span>`;
  }
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
  ['demographics', 'weight'],
  ['demographics', 'height'],
  // Presenting symptoms (12 yes/no)
  ['presentingSymptoms', 'fatigue'],
  ['presentingSymptoms', 'edema'],
  ['presentingSymptoms', 'foamyUrine'],
  ['presentingSymptoms', 'nocturia'],
  ['presentingSymptoms', 'hematuria'],
  ['presentingSymptoms', 'flankPain'],
  ['presentingSymptoms', 'reducedUrineOutput'],
  ['presentingSymptoms', 'pruritus'],
  ['presentingSymptoms', 'nauseaVomiting'],
  ['presentingSymptoms', 'appetiteLoss'],
  ['presentingSymptoms', 'dyspnea'],
  ['presentingSymptoms', 'confusion'],
  // CKD risk factors
  ['ckdRiskFactors', 'hypertension'],
  ['ckdRiskFactors', 'diabetes'],
  ['ckdRiskFactors', 'cardiovascularDisease'],
  ['ckdRiskFactors', 'familyHistoryCkd'],
  ['ckdRiskFactors', 'familyHistoryPolycysticKidney'],
  ['ckdRiskFactors', 'priorAki'],
  ['ckdRiskFactors', 'kidneyStones'],
  ['ckdRiskFactors', 'recurrentUti'],
  ['ckdRiskFactors', 'autoimmuneDisease'],
  ['ckdRiskFactors', 'nephrotoxicDrugs'],
  ['ckdRiskFactors', 'nsaidUse'],
  ['ckdRiskFactors', 'smoking'],
  ['ckdRiskFactors', 'obesity'],
  // Physical examination
  ['physicalExamination', 'systolicBp'],
  ['physicalExamination', 'diastolicBp'],
  ['physicalExamination', 'peripheralEdema'],
  ['physicalExamination', 'pulmonaryEdema'],
  ['physicalExamination', 'jvdElevated'],
  ['physicalExamination', 'pallor'],
  ['physicalExamination', 'flankTenderness'],
  // Blood tests (core renal panel)
  ['bloodTests', 'serumCreatinine'],
  ['bloodTests', 'sodium'],
  ['bloodTests', 'potassium'],
  ['bloodTests', 'bicarbonate'],
  ['bloodTests', 'calcium'],
  ['bloodTests', 'phosphate'],
  ['bloodTests', 'hemoglobin'],
  // Urine tests
  ['urineTests', 'acr'],
  ['urineTests', 'dipstickProtein'],
  ['urineTests', 'dipstickBlood'],
  ['urineTests', 'microscopyCasts'],
  // Imaging & biopsy
  ['imagingBiopsy', 'renalUltrasoundDone'],
  ['imagingBiopsy', 'ctOrMri'],
  ['imagingBiopsy', 'biopsyDone'],
  // Medication review
  ['medicationReview', 'aceiArb'],
  ['medicationReview', 'sglt2Inhibitor'],
  ['medicationReview', 'diuretic'],
  ['medicationReview', 'statin'],
  ['medicationReview', 'doseAdjustmentsNeeded'],
  ['medicationReview', 'contrastImagingPlanned'],
  // Clinical impression
  ['clinicalImpression', 'suspectedEtiology'],
  ['clinicalImpression', 'aksuperimposedOnCkd'],
  ['clinicalImpression', 'nephrologyReferral'],
  ['clinicalImpression', 'dialysisDiscussionNeeded'],
  ['clinicalImpression', 'transplantCandidate'],
  ['clinicalImpression', 'followUpInterval']
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
  const progress = document.getElementById('progress');
  const text = document.getElementById('progress-text');
  if (progress) progress.value = percent;
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Step list
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'demographics',         title: 'Demographics' },
  { step: 2, section: 'presentingSymptoms',   title: 'Symptoms' },
  { step: 3, section: 'ckdRiskFactors',       title: 'Risk Factors' },
  { step: 4, section: 'physicalExamination',  title: 'Exam' },
  { step: 5, section: 'bloodTests',           title: 'Blood' },
  { step: 6, section: 'urineTests',           title: 'Urine' },
  { step: 7, section: 'imagingBiopsy',        title: 'Imaging' },
  { step: 8, section: 'medicationReview',     title: 'Meds' },
  { step: 9, section: 'clinicalImpression',   title: 'Impression' }
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
  const required = form.querySelectorAll('input[data-required], select[data-required], textarea[data-required]');
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
    case 'urgent': return 'flag-urgent';
    case 'high': return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

const HEATMAP_GRID = [
  { g: 'G1',  cells: { A1: 'low',       A2: 'moderate',  A3: 'high' } },
  { g: 'G2',  cells: { A1: 'low',       A2: 'moderate',  A3: 'high' } },
  { g: 'G3a', cells: { A1: 'moderate',  A2: 'high',      A3: 'very-high' } },
  { g: 'G3b', cells: { A1: 'high',      A2: 'very-high', A3: 'very-high' } },
  { g: 'G4',  cells: { A1: 'very-high', A2: 'very-high', A3: 'very-high' } },
  { g: 'G5',  cells: { A1: 'very-high', A2: 'very-high', A3: 'very-high' } }
];

function renderHeatmap(gfrCategory, albuminuriaCategory) {
  const rows = HEATMAP_GRID.map((row) => {
    const cells = ['A1', 'A2', 'A3'].map((a) => {
      const cls = `cell-${row.cells[a]}`;
      const isCurrent = row.g === gfrCategory && a === albuminuriaCategory;
      return `<td class="${cls}${isCurrent ? ' current' : ''}">${row.cells[a].replace('-', ' ')}</td>`;
    }).join('');
    return `<tr><th scope="row">${row.g}</th>${cells}</tr>`;
  }).join('');
  return `
    <table class="kdigo-heatmap">
      <thead>
        <tr>
          <th></th>
          <th>A1 (&lt;3)</th>
          <th>A2 (3-30)</th>
          <th>A3 (&gt;30)</th>
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
    gfrCategory,
    albuminuriaCategory,
    riskLevel,
    egfr,
    acr,
    firedRules,
    additionalFlags,
    timestamp
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
      <td>${esc(r.value)}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No KDIGO classification possible — supply eGFR (or creatinine + age + sex) and urine ACR.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Description</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const summaryBadges = [];
  if (gfrCategory) {
    summaryBadges.push(`<span class="kdigo-badge ${riskLevelClass(riskLevel)}">${esc(gfrCategory)}</span>`);
  }
  if (albuminuriaCategory) {
    summaryBadges.push(`<span class="kdigo-badge ${riskLevelClass(riskLevel)}">${esc(albuminuriaCategory)}</span>`);
  }
  summaryBadges.push(`<span class="risk-label">${esc(riskLevelLabel(riskLevel))}</span>`);

  const egfrText = egfr != null ? `eGFR ${egfr} mL/min/1.73 m²` : 'eGFR unavailable';
  const acrText = acr != null ? `ACR ${acr} mg/mmol` : 'ACR unavailable';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Renal Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>KDIGO Classification</h3>
      <p class="kdigo-summary">${summaryBadges.join('')}</p>
      <p class="muted">${esc(egfrText)} — ${esc(acrText)}</p>

      ${(gfrCategory && albuminuriaCategory)
        ? `<h3>KDIGO heatmap</h3>${renderHeatmap(gfrCategory, albuminuriaCategory)}`
        : ''}

      <h3>Per-rule results</h3>
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
  const errors = validateForm();
  if (errors.length > 0) return;
  recomputeDerived();
  const {
    gfrCategory,
    albuminuriaCategory,
    riskLevel,
    egfr,
    acr,
    firedRules
  } = calculateKdigo(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    gfrCategory,
    albuminuriaCategory,
    riskLevel,
    egfr,
    acr,
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
