import { calculatePlasticsGrade } from './plastics-grader.js';
import { asaClassLabel, bmiCategory, calculateAge, calculateBMI, complexityLabel, emptyAssessment, riskLevelClass, riskLevelLabel, woundClassLabel } from './types.js';

// Plastic Surgery Assessment — patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure plastic surgery grading engine and renders an inline
// report. State is persisted to localStorage so a partial fill survives a
// reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'plastic-surgery-assessment.front-end-form-with-html.v1';

/** @returns {import('./types.js').AssessmentData} */
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
  slug: 'plastic-surgery-assessment',
  hadDraftAtLoad,
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
    if (type === 'number') v = v === '' ? null : Number(v);
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
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error">${optionsHtml}</select>
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
    `<span class="section-step">Section ${opts.stepNumber} of 10</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Drug-allergy list editor
// ----------------------------------------------------------------------

function drugAllergyEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.medicationsAllergies.allergies;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No drug allergies added.';
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
          <button type="button" class="button" data-variant="icon" aria-label="Remove drug allergy">&times;</button>
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
    addBtn.textContent = '+ Add drug allergy';
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
// Common option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const noneMildModSevere = [
  { value: 'none', label: 'None' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per step)
// ----------------------------------------------------------------------

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

  card.appendChild(textInput({
    label: 'Date of Birth', section: 'demographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  card.appendChild(radioGroup({
    label: 'Sex', section: 'demographics', field: 'sex',
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

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Reason for Referral',
    description: 'Why has the patient been referred to plastic surgery?'
  });

  card.appendChild(selectInput({
    label: 'Referral type', section: 'reasonForReferral', field: 'referralType',
    options: [
      { value: 'reconstructive', label: 'Reconstructive' },
      { value: 'aesthetic', label: 'Aesthetic / Cosmetic' },
      { value: 'trauma', label: 'Trauma' },
      { value: 'burn', label: 'Burn' },
      { value: 'congenital', label: 'Congenital' },
      { value: 'cancer', label: 'Cancer' },
      { value: 'other', label: 'Other' }
    ]
  }));
  const refOther = document.createElement('div');
  refOther.dataset.conditional = 'reasonForReferral.referralType=other';
  refOther.appendChild(textInput({
    label: 'Other referral type — specify',
    section: 'reasonForReferral', field: 'referralTypeOther'
  }));
  card.appendChild(refOther);

  card.appendChild(radioGroup({
    label: 'Urgency', section: 'reasonForReferral', field: 'urgency',
    options: [
      { value: 'elective', label: 'Elective' },
      { value: 'urgent', label: 'Urgent' },
      { value: 'emergency', label: 'Emergency' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Primary complaint',
    section: 'reasonForReferral', field: 'primaryComplaint',
    placeholder: 'In your own words, what is the main concern?',
    rows: 3
  }));

  card.appendChild(selectInput({
    label: 'Affected body area', section: 'reasonForReferral', field: 'affectedBodyArea',
    options: [
      { value: 'face', label: 'Face' },
      { value: 'head-neck', label: 'Head & neck' },
      { value: 'breast', label: 'Breast' },
      { value: 'trunk', label: 'Trunk' },
      { value: 'upper-limb', label: 'Upper limb' },
      { value: 'hand', label: 'Hand' },
      { value: 'lower-limb', label: 'Lower limb' },
      { value: 'genitalia', label: 'Genitalia' },
      { value: 'multiple', label: 'Multiple sites' },
      { value: 'other', label: 'Other' }
    ]
  }));
  const areaOther = document.createElement('div');
  areaOther.dataset.conditional = 'reasonForReferral.affectedBodyArea=other';
  areaOther.appendChild(textInput({
    label: 'Other affected area — specify',
    section: 'reasonForReferral', field: 'affectedBodyAreaOther'
  }));
  card.appendChild(areaOther);

  card.appendChild(selectInput({
    label: 'Laterality', section: 'reasonForReferral', field: 'laterality',
    options: [
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' },
      { value: 'bilateral', label: 'Bilateral' },
      { value: 'midline', label: 'Midline' },
      { value: 'n-a', label: 'N/A' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Duration of condition', section: 'reasonForReferral', field: 'durationOfCondition',
    options: [
      { value: 'acute', label: 'Acute (days)' },
      { value: 'less-1-month', label: 'Less than 1 month' },
      { value: '1-6-months', label: '1–6 months' },
      { value: '6-12-months', label: '6–12 months' },
      { value: 'greater-12-months', label: '> 12 months' },
      { value: 'congenital', label: 'Congenital' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Have you seen another clinician about this previously?',
    section: 'reasonForReferral', field: 'previousConsultations', options: yesNo
  }));
  const prevDetails = document.createElement('div');
  prevDetails.dataset.conditional = 'reasonForReferral.previousConsultations=yes';
  prevDetails.appendChild(textArea({
    label: 'Previous consultations — details',
    section: 'reasonForReferral', field: 'previousConsultationsDetails',
    placeholder: 'Who, when, what was advised?', rows: 3
  }));
  card.appendChild(prevDetails);

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Medical & Surgical History',
    description: 'Previous surgery, healing problems, and chronic conditions.'
  });

  card.appendChild(radioGroup({
    label: 'Have you had previous plastic surgery?',
    section: 'medicalSurgicalHistory', field: 'previousPlasticSurgery', options: yesNo
  }));
  const psDetails = document.createElement('div');
  psDetails.dataset.conditional = 'medicalSurgicalHistory.previousPlasticSurgery=yes';
  psDetails.appendChild(textArea({
    label: 'Previous plastic surgery — details',
    section: 'medicalSurgicalHistory', field: 'previousPlasticSurgeryDetails',
    rows: 3
  }));
  card.appendChild(psDetails);

  card.appendChild(radioGroup({
    label: 'Have you had previous general surgery?',
    section: 'medicalSurgicalHistory', field: 'previousGeneralSurgery', options: yesNo
  }));
  const gsDetails = document.createElement('div');
  gsDetails.dataset.conditional = 'medicalSurgicalHistory.previousGeneralSurgery=yes';
  gsDetails.appendChild(textArea({
    label: 'Previous general surgery — details',
    section: 'medicalSurgicalHistory', field: 'previousGeneralSurgeryDetails',
    rows: 3
  }));
  card.appendChild(gsDetails);

  card.appendChild(radioGroup({
    label: 'Have you ever had wound-healing problems?',
    section: 'medicalSurgicalHistory', field: 'woundHealingProblems', options: yesNo
  }));
  const whDetails = document.createElement('div');
  whDetails.dataset.conditional = 'medicalSurgicalHistory.woundHealingProblems=yes';
  whDetails.appendChild(textArea({
    label: 'Wound healing problems — details',
    section: 'medicalSurgicalHistory', field: 'woundHealingDetails', rows: 3
  }));
  card.appendChild(whDetails);

  card.appendChild(radioGroup({
    label: 'Do you tend to develop keloid or hypertrophic scars?',
    section: 'medicalSurgicalHistory', field: 'keloidScarring', options: yesNo
  }));
  const scarDetails = document.createElement('div');
  scarDetails.dataset.conditional = 'medicalSurgicalHistory.keloidScarring=yes';
  scarDetails.appendChild(textArea({
    label: 'Scarring — details',
    section: 'medicalSurgicalHistory', field: 'scarringDetails', rows: 2
  }));
  card.appendChild(scarDetails);

  card.appendChild(selectInput({
    label: 'Diabetes', section: 'medicalSurgicalHistory', field: 'diabetes',
    options: [
      { value: 'no', label: 'No' },
      { value: 'type-1', label: 'Type 1' },
      { value: 'type-2', label: 'Type 2' }
    ]
  }));
  const dmCtrl = document.createElement('div');
  dmCtrl.dataset.conditionalAny = 'medicalSurgicalHistory.diabetes=type-1,type-2';
  dmCtrl.appendChild(radioGroup({
    label: 'Is your diabetes well controlled?',
    section: 'medicalSurgicalHistory', field: 'diabetesControlled', options: yesNo
  }));
  card.appendChild(dmCtrl);

  card.appendChild(radioGroup({
    label: 'Hypertension?', section: 'medicalSurgicalHistory', field: 'hypertension', options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Cardiac disease?', section: 'medicalSurgicalHistory', field: 'cardiacDisease', options: yesNo
  }));
  const cardDetails = document.createElement('div');
  cardDetails.dataset.conditional = 'medicalSurgicalHistory.cardiacDisease=yes';
  cardDetails.appendChild(textArea({
    label: 'Cardiac disease — details',
    section: 'medicalSurgicalHistory', field: 'cardiacDiseaseDetails', rows: 2
  }));
  card.appendChild(cardDetails);

  card.appendChild(radioGroup({
    label: 'Respiratory disease?', section: 'medicalSurgicalHistory', field: 'respiratoryDisease', options: yesNo
  }));
  const respDetails = document.createElement('div');
  respDetails.dataset.conditional = 'medicalSurgicalHistory.respiratoryDisease=yes';
  respDetails.appendChild(textArea({
    label: 'Respiratory disease — details',
    section: 'medicalSurgicalHistory', field: 'respiratoryDiseaseDetails', rows: 2
  }));
  card.appendChild(respDetails);

  card.appendChild(radioGroup({
    label: 'Autoimmune disease?', section: 'medicalSurgicalHistory', field: 'autoimmuneDisease', options: yesNo
  }));
  const aiDetails = document.createElement('div');
  aiDetails.dataset.conditional = 'medicalSurgicalHistory.autoimmuneDisease=yes';
  aiDetails.appendChild(textArea({
    label: 'Autoimmune disease — details',
    section: 'medicalSurgicalHistory', field: 'autoimmuneDiseaseDetails', rows: 2
  }));
  card.appendChild(aiDetails);

  card.appendChild(radioGroup({
    label: 'Bleeding disorder?', section: 'medicalSurgicalHistory', field: 'bleedingDisorder', options: yesNo
  }));
  const bleedDetails = document.createElement('div');
  bleedDetails.dataset.conditional = 'medicalSurgicalHistory.bleedingDisorder=yes';
  bleedDetails.appendChild(textArea({
    label: 'Bleeding disorder — details',
    section: 'medicalSurgicalHistory', field: 'bleedingDisorderDetails', rows: 2
  }));
  card.appendChild(bleedDetails);

  card.appendChild(radioGroup({
    label: 'Are you immunosuppressed?',
    section: 'medicalSurgicalHistory', field: 'immunosuppressed', options: yesNo
  }));
  const immDetails = document.createElement('div');
  immDetails.dataset.conditional = 'medicalSurgicalHistory.immunosuppressed=yes';
  immDetails.appendChild(textArea({
    label: 'Immunosuppression — details',
    section: 'medicalSurgicalHistory', field: 'immunosuppressedDetails', rows: 2
  }));
  card.appendChild(immDetails);

  card.appendChild(radioGroup({
    label: 'Cancer history?', section: 'medicalSurgicalHistory', field: 'cancerHistory', options: yesNo
  }));
  const cancerDetails = document.createElement('div');
  cancerDetails.dataset.conditional = 'medicalSurgicalHistory.cancerHistory=yes';
  cancerDetails.appendChild(textArea({
    label: 'Cancer history — details',
    section: 'medicalSurgicalHistory', field: 'cancerHistoryDetails', rows: 2
  }));
  card.appendChild(cancerDetails);

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Current Condition Assessment',
    description: 'Describe the lesion / defect / area of concern.'
  });

  card.appendChild(selectInput({
    label: 'Condition category', section: 'currentCondition', field: 'conditionCategory',
    options: [
      { value: 'skin-lesion', label: 'Skin lesion' },
      { value: 'soft-tissue-defect', label: 'Soft tissue defect' },
      { value: 'skeletal-deformity', label: 'Skeletal deformity' },
      { value: 'burn-injury', label: 'Burn injury' },
      { value: 'scar-contracture', label: 'Scar / contracture' },
      { value: 'nerve-injury', label: 'Nerve injury' },
      { value: 'vascular-malformation', label: 'Vascular malformation' },
      { value: 'breast', label: 'Breast condition' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Condition description',
    section: 'currentCondition', field: 'conditionDescription', rows: 3
  }));

  const dimGrid = document.createElement('div');
  dimGrid.className = 'three-col';
  dimGrid.appendChild(textInput({
    label: 'Lesion length', section: 'currentCondition', field: 'lesionLengthMm',
    type: 'number', min: 0, max: 1000, unit: 'mm'
  }));
  dimGrid.appendChild(textInput({
    label: 'Lesion width', section: 'currentCondition', field: 'lesionWidthMm',
    type: 'number', min: 0, max: 1000, unit: 'mm'
  }));
  dimGrid.appendChild(textInput({
    label: 'Lesion depth', section: 'currentCondition', field: 'lesionDepthMm',
    type: 'number', min: 0, max: 1000, unit: 'mm'
  }));
  card.appendChild(dimGrid);

  card.appendChild(radioGroup({
    label: 'Is there tissue loss?', section: 'currentCondition', field: 'tissueLoss', options: yesNo
  }));
  const tlDetails = document.createElement('div');
  tlDetails.dataset.conditional = 'currentCondition.tissueLoss=yes';
  tlDetails.appendChild(textInput({
    label: 'Approximate tissue loss',
    section: 'currentCondition', field: 'tissueLossPercentage',
    type: 'number', min: 0, max: 100, unit: '%'
  }));
  card.appendChild(tlDetails);

  card.appendChild(radioGroup({
    label: 'Functional impairment', section: 'currentCondition', field: 'functionalImpairment',
    options: noneMildModSevere
  }));
  const fiDetails = document.createElement('div');
  fiDetails.dataset.conditionalAny = 'currentCondition.functionalImpairment=mild,moderate,severe';
  fiDetails.appendChild(textArea({
    label: 'Functional impairment — details',
    section: 'currentCondition', field: 'functionalImpairmentDetails', rows: 2
  }));
  card.appendChild(fiDetails);

  card.appendChild(textInput({
    label: 'Pain level (NRS 0–10)',
    section: 'currentCondition', field: 'painLevel',
    type: 'number', min: 0, max: 10
  }));

  card.appendChild(radioGroup({
    label: 'Cosmetic concern', section: 'currentCondition', field: 'cosmeticConcern',
    options: noneMildModSevere
  }));
  card.appendChild(radioGroup({
    label: 'Impact on daily activities', section: 'currentCondition', field: 'impactOnDailyActivities',
    options: noneMildModSevere
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Wound & Tissue Assessment',
    description: 'For patients with an open wound or tissue defect.'
  });

  card.appendChild(radioGroup({
    label: 'Is there an open wound?',
    section: 'woundTissueAssessment', field: 'hasOpenWound', options: yesNo
  }));

  const woundBlock = document.createElement('div');
  woundBlock.dataset.conditional = 'woundTissueAssessment.hasOpenWound=yes';

  woundBlock.appendChild(selectInput({
    label: 'Wound classification', section: 'woundTissueAssessment', field: 'woundClassification',
    options: [
      { value: 'clean', label: 'Class I — Clean' },
      { value: 'clean-contaminated', label: 'Class II — Clean-contaminated' },
      { value: 'contaminated', label: 'Class III — Contaminated' },
      { value: 'dirty', label: 'Class IV — Dirty / infected' }
    ]
  }));
  woundBlock.appendChild(selectInput({
    label: 'Wound age', section: 'woundTissueAssessment', field: 'woundAge',
    options: [
      { value: 'acute', label: 'Acute (< 2 weeks)' },
      { value: 'subacute', label: 'Subacute (2–6 weeks)' },
      { value: 'chronic', label: 'Chronic (> 6 weeks)' }
    ]
  }));
  woundBlock.appendChild(selectInput({
    label: 'Wound aetiology', section: 'woundTissueAssessment', field: 'woundAetiology',
    options: [
      { value: 'surgical', label: 'Surgical' },
      { value: 'traumatic', label: 'Traumatic' },
      { value: 'burn', label: 'Burn' },
      { value: 'pressure', label: 'Pressure' },
      { value: 'venous', label: 'Venous' },
      { value: 'arterial', label: 'Arterial' },
      { value: 'diabetic', label: 'Diabetic' },
      { value: 'radiation', label: 'Radiation' },
      { value: 'other', label: 'Other' }
    ]
  }));
  woundBlock.appendChild(selectInput({
    label: 'Wound bed tissue', section: 'woundTissueAssessment', field: 'woundBedTissue',
    options: [
      { value: 'granulation', label: 'Granulation' },
      { value: 'slough', label: 'Slough' },
      { value: 'necrotic', label: 'Necrotic' },
      { value: 'epithelialising', label: 'Epithelialising' },
      { value: 'mixed', label: 'Mixed' }
    ]
  }));
  woundBlock.appendChild(selectInput({
    label: 'Wound exudate', section: 'woundTissueAssessment', field: 'woundExudate',
    options: [
      { value: 'none', label: 'None' },
      { value: 'serous', label: 'Serous' },
      { value: 'sanguineous', label: 'Sanguineous' },
      { value: 'purulent', label: 'Purulent' }
    ]
  }));
  woundBlock.appendChild(radioGroup({
    label: 'Signs of wound infection?',
    section: 'woundTissueAssessment', field: 'woundInfectionSigns', options: yesNo
  }));
  const infDetails = document.createElement('div');
  infDetails.dataset.conditional = 'woundTissueAssessment.woundInfectionSigns=yes';
  infDetails.appendChild(textArea({
    label: 'Infection signs — details',
    section: 'woundTissueAssessment', field: 'woundInfectionDetails', rows: 2
  }));
  woundBlock.appendChild(infDetails);

  woundBlock.appendChild(selectInput({
    label: 'Tissue viability', section: 'woundTissueAssessment', field: 'tissueViability',
    options: [
      { value: 'viable', label: 'Viable' },
      { value: 'compromised', label: 'Compromised' },
      { value: 'non-viable', label: 'Non-viable' }
    ]
  }));
  woundBlock.appendChild(selectInput({
    label: 'Surrounding skin', section: 'woundTissueAssessment', field: 'surroundingSkin',
    options: [
      { value: 'healthy', label: 'Healthy' },
      { value: 'erythematous', label: 'Erythematous' },
      { value: 'oedematous', label: 'Oedematous' },
      { value: 'macerated', label: 'Macerated' },
      { value: 'indurated', label: 'Indurated' }
    ]
  }));
  woundBlock.appendChild(selectInput({
    label: 'Vascular supply', section: 'woundTissueAssessment', field: 'vascularSupply',
    options: [
      { value: 'adequate', label: 'Adequate' },
      { value: 'compromised', label: 'Compromised' },
      { value: 'absent', label: 'Absent' }
    ]
  }));
  woundBlock.appendChild(selectInput({
    label: 'Sensory status', section: 'woundTissueAssessment', field: 'sensoryStatus',
    options: [
      { value: 'intact', label: 'Intact' },
      { value: 'reduced', label: 'Reduced' },
      { value: 'absent', label: 'Absent' }
    ]
  }));
  woundBlock.appendChild(textArea({
    label: 'Previous wound treatments',
    section: 'woundTissueAssessment', field: 'previousWoundTreatments',
    placeholder: 'Dressings, NPWT, antibiotics, debridement, grafts…',
    rows: 3
  }));

  card.appendChild(woundBlock);
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Psychological Assessment',
    description: 'Body image, expectations, and mental health.'
  });

  card.appendChild(radioGroup({
    label: 'Do you have body dysmorphic concerns?',
    section: 'psychologicalAssessment', field: 'bodyDysmorphicConcern', options: yesNo
  }));
  const bddDetails = document.createElement('div');
  bddDetails.dataset.conditional = 'psychologicalAssessment.bodyDysmorphicConcern=yes';
  bddDetails.appendChild(textArea({
    label: 'Body dysmorphic concerns — details',
    section: 'psychologicalAssessment', field: 'bodyDysmorphicDetails', rows: 2
  }));
  card.appendChild(bddDetails);

  card.appendChild(radioGroup({
    label: 'Are your expectations of the outcome realistic?',
    section: 'psychologicalAssessment', field: 'realisticExpectations',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'partly', label: 'Partly' },
      { value: 'no', label: 'No' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Expectations — details',
    section: 'psychologicalAssessment', field: 'expectationsDetails', rows: 2
  }));

  card.appendChild(selectInput({
    label: 'Primary motivation', section: 'psychologicalAssessment', field: 'motivation',
    options: [
      { value: 'functional-improvement', label: 'Functional improvement' },
      { value: 'cosmetic-improvement', label: 'Cosmetic improvement' },
      { value: 'pain-relief', label: 'Pain relief' },
      { value: 'cancer-treatment', label: 'Cancer treatment' },
      { value: 'trauma-repair', label: 'Trauma repair' },
      { value: 'other', label: 'Other' }
    ]
  }));
  const motOther = document.createElement('div');
  motOther.dataset.conditional = 'psychologicalAssessment.motivation=other';
  motOther.appendChild(textInput({
    label: 'Other motivation — specify',
    section: 'psychologicalAssessment', field: 'motivationOther'
  }));
  card.appendChild(motOther);

  card.appendChild(radioGroup({
    label: 'Have you had previous mental health treatment?',
    section: 'psychologicalAssessment', field: 'previousMentalHealth', options: yesNo
  }));
  const mhDetails = document.createElement('div');
  mhDetails.dataset.conditional = 'psychologicalAssessment.previousMentalHealth=yes';
  mhDetails.appendChild(textArea({
    label: 'Mental health — details',
    section: 'psychologicalAssessment', field: 'mentalHealthDetails', rows: 2
  }));
  card.appendChild(mhDetails);

  card.appendChild(radioGroup({
    label: 'Anxiety level', section: 'psychologicalAssessment', field: 'anxietyLevel',
    options: noneMildModSevere
  }));
  card.appendChild(radioGroup({
    label: 'Symptoms of depression?',
    section: 'psychologicalAssessment', field: 'depressionScreen', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Social impact of condition',
    section: 'psychologicalAssessment', field: 'socialImpact',
    options: noneMildModSevere
  }));
  const siDetails = document.createElement('div');
  siDetails.dataset.conditionalAny = 'psychologicalAssessment.socialImpact=mild,moderate,severe';
  siDetails.appendChild(textArea({
    label: 'Social impact — details',
    section: 'psychologicalAssessment', field: 'socialImpactDetails', rows: 2
  }));
  card.appendChild(siDetails);

  card.appendChild(radioGroup({
    label: 'Is psychological referral recommended?',
    section: 'psychologicalAssessment', field: 'psychologicalReferralNeeded', options: yesNo
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Anaesthetic Risk Assessment',
    description: 'ASA Physical Status, airway risk, and lifestyle factors.'
  });

  card.appendChild(selectInput({
    label: 'ASA Physical Status', section: 'anaestheticRisk', field: 'asaClass',
    options: [
      { value: '1', label: 'I — Normal healthy patient' },
      { value: '2', label: 'II — Mild systemic disease' },
      { value: '3', label: 'III — Severe systemic disease' },
      { value: '4', label: 'IV — Severe systemic disease, constant threat to life' },
      { value: '5', label: 'V — Moribund patient' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Have you had a previous anaesthetic?',
    section: 'anaestheticRisk', field: 'previousAnaesthetic', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Any anaesthetic complications?',
    section: 'anaestheticRisk', field: 'anaestheticComplications', options: yesNo
  }));
  const acDetails = document.createElement('div');
  acDetails.dataset.conditional = 'anaestheticRisk.anaestheticComplications=yes';
  acDetails.appendChild(textArea({
    label: 'Anaesthetic complications — details',
    section: 'anaestheticRisk', field: 'anaestheticComplicationsDetails', rows: 2
  }));
  card.appendChild(acDetails);

  card.appendChild(radioGroup({
    label: 'Difficult airway known or suspected?',
    section: 'anaestheticRisk', field: 'difficultAirway', options: yesNo
  }));
  const daDetails = document.createElement('div');
  daDetails.dataset.conditional = 'anaestheticRisk.difficultAirway=yes';
  daDetails.appendChild(textArea({
    label: 'Difficult airway — details',
    section: 'anaestheticRisk', field: 'difficultAirwayDetails', rows: 2
  }));
  card.appendChild(daDetails);

  card.appendChild(radioGroup({
    label: 'Personal or family history of malignant hyperthermia?',
    section: 'anaestheticRisk', field: 'malignantHyperthermiaRisk', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Family history of anaesthetic problems?',
    section: 'anaestheticRisk', field: 'familyAnaestheticProblems', options: yesNo
  }));
  const famDetails = document.createElement('div');
  famDetails.dataset.conditional = 'anaestheticRisk.familyAnaestheticProblems=yes';
  famDetails.appendChild(textArea({
    label: 'Family anaesthetic problems — details',
    section: 'anaestheticRisk', field: 'familyAnaestheticDetails', rows: 2
  }));
  card.appendChild(famDetails);

  card.appendChild(radioGroup({
    label: 'Smoking status', section: 'anaestheticRisk', field: 'smokingStatus',
    options: [
      { value: 'current', label: 'Current smoker' },
      { value: 'ex-smoker', label: 'Ex-smoker' },
      { value: 'never', label: 'Never smoked' }
    ]
  }));
  const pyHost = document.createElement('div');
  pyHost.dataset.conditionalAny = 'anaestheticRisk.smokingStatus=current,ex-smoker';
  pyHost.appendChild(textInput({
    label: 'Pack-years', section: 'anaestheticRisk', field: 'packYears',
    type: 'number', min: 0, max: 200
  }));
  card.appendChild(pyHost);

  card.appendChild(radioGroup({
    label: 'Alcohol consumption', section: 'anaestheticRisk', field: 'alcoholConsumption',
    options: [
      { value: 'none', label: 'None' },
      { value: 'within-guidelines', label: 'Within guidelines' },
      { value: 'above-guidelines', label: 'Above guidelines' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Recreational drug use?',
    section: 'anaestheticRisk', field: 'recreationalDrugs', options: yesNo
  }));
  const rdDetails = document.createElement('div');
  rdDetails.dataset.conditional = 'anaestheticRisk.recreationalDrugs=yes';
  rdDetails.appendChild(textArea({
    label: 'Recreational drugs — details',
    section: 'anaestheticRisk', field: 'recreationalDrugsDetails', rows: 2
  }));
  card.appendChild(rdDetails);

  card.appendChild(radioGroup({
    label: 'Obstructive sleep apnoea?',
    section: 'anaestheticRisk', field: 'obstructiveSleepApnoea', options: yesNo
  }));
  card.appendChild(selectInput({
    label: 'Anaesthetic preference', section: 'anaestheticRisk', field: 'anaestheticPreference',
    options: [
      { value: 'local', label: 'Local' },
      { value: 'regional', label: 'Regional' },
      { value: 'general', label: 'General' },
      { value: 'sedation', label: 'Sedation' },
      { value: 'no-preference', label: 'No preference' }
    ]
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Photography & Documentation',
    description: 'Clinical photography, measurements, diagrams, and prior imaging.'
  });

  card.appendChild(radioGroup({
    label: 'Have clinical photographs been taken?',
    section: 'photographyDocumentation', field: 'clinicalPhotosTaken', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Has photo consent been obtained?',
    section: 'photographyDocumentation', field: 'photoConsentObtained', options: yesNo
  }));
  card.appendChild(textInput({
    label: 'Number of photographs',
    section: 'photographyDocumentation', field: 'numberOfPhotos',
    type: 'number', min: 0, max: 200
  }));
  card.appendChild(textInput({
    label: 'Photo views taken',
    section: 'photographyDocumentation', field: 'photoViewsTaken',
    placeholder: 'e.g. frontal, lateral, oblique'
  }));
  card.appendChild(radioGroup({
    label: 'Were standardised views used?',
    section: 'photographyDocumentation', field: 'standardisedViews', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Were measurements recorded?',
    section: 'photographyDocumentation', field: 'measurementsRecorded', options: yesNo
  }));
  const measDetails = document.createElement('div');
  measDetails.dataset.conditional = 'photographyDocumentation.measurementsRecorded=yes';
  measDetails.appendChild(textArea({
    label: 'Measurement details',
    section: 'photographyDocumentation', field: 'measurementDetails', rows: 2
  }));
  card.appendChild(measDetails);

  card.appendChild(radioGroup({
    label: 'Were diagrams drawn?',
    section: 'photographyDocumentation', field: 'diagramsDrawn', options: yesNo
  }));
  const diaNotes = document.createElement('div');
  diaNotes.dataset.conditional = 'photographyDocumentation.diagramsDrawn=yes';
  diaNotes.appendChild(textArea({
    label: 'Diagram notes',
    section: 'photographyDocumentation', field: 'diagramNotes', rows: 2
  }));
  card.appendChild(diaNotes);

  card.appendChild(radioGroup({
    label: 'Has previous imaging been performed?',
    section: 'photographyDocumentation', field: 'previousImaging', options: yesNo
  }));
  const imgBlock = document.createElement('div');
  imgBlock.dataset.conditional = 'photographyDocumentation.previousImaging=yes';
  imgBlock.appendChild(selectInput({
    label: 'Imaging type',
    section: 'photographyDocumentation', field: 'previousImagingType',
    options: [
      { value: 'ct', label: 'CT' },
      { value: 'mri', label: 'MRI' },
      { value: 'ultrasound', label: 'Ultrasound' },
      { value: 'x-ray', label: 'X-ray' },
      { value: 'angiography', label: 'Angiography' },
      { value: 'other', label: 'Other' }
    ]
  }));
  imgBlock.appendChild(textArea({
    label: 'Imaging findings',
    section: 'photographyDocumentation', field: 'previousImagingFindings', rows: 2
  }));
  card.appendChild(imgBlock);

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Current Medications & Allergies',
    description: 'Anticoagulants, steroids, immunosuppressants, and allergies.'
  });

  card.appendChild(radioGroup({
    label: 'Are you on anticoagulants?',
    section: 'medicationsAllergies', field: 'onAnticoagulants', options: yesNo
  }));
  const acDetails = document.createElement('div');
  acDetails.dataset.conditional = 'medicationsAllergies.onAnticoagulants=yes';
  acDetails.appendChild(textInput({
    label: 'Anticoagulant — name & dose',
    section: 'medicationsAllergies', field: 'anticoagulantDetails'
  }));
  card.appendChild(acDetails);

  card.appendChild(radioGroup({
    label: 'Are you on antiplatelets (e.g. aspirin, clopidogrel)?',
    section: 'medicationsAllergies', field: 'onAntiplatelets', options: yesNo
  }));
  const apDetails = document.createElement('div');
  apDetails.dataset.conditional = 'medicationsAllergies.onAntiplatelets=yes';
  apDetails.appendChild(textInput({
    label: 'Antiplatelet — name & dose',
    section: 'medicationsAllergies', field: 'antiplateletDetails'
  }));
  card.appendChild(apDetails);

  card.appendChild(radioGroup({
    label: 'Are you on systemic steroids?',
    section: 'medicationsAllergies', field: 'onSteroids', options: yesNo
  }));
  const stDetails = document.createElement('div');
  stDetails.dataset.conditional = 'medicationsAllergies.onSteroids=yes';
  stDetails.appendChild(textInput({
    label: 'Steroid — name, dose, duration',
    section: 'medicationsAllergies', field: 'steroidDetails'
  }));
  card.appendChild(stDetails);

  card.appendChild(radioGroup({
    label: 'Are you on immunosuppressants?',
    section: 'medicationsAllergies', field: 'onImmunosuppressants', options: yesNo
  }));
  const immD = document.createElement('div');
  immD.dataset.conditional = 'medicationsAllergies.onImmunosuppressants=yes';
  immD.appendChild(textInput({
    label: 'Immunosuppressant — name & dose',
    section: 'medicationsAllergies', field: 'immunosuppressantDetails'
  }));
  card.appendChild(immD);

  card.appendChild(radioGroup({
    label: 'Currently on chemotherapy?',
    section: 'medicationsAllergies', field: 'onChemotherapy', options: yesNo
  }));
  const chemoD = document.createElement('div');
  chemoD.dataset.conditional = 'medicationsAllergies.onChemotherapy=yes';
  chemoD.appendChild(textInput({
    label: 'Chemotherapy — regimen',
    section: 'medicationsAllergies', field: 'chemotherapyDetails'
  }));
  card.appendChild(chemoD);

  card.appendChild(radioGroup({
    label: 'On hormone therapy (HRT, oral contraceptives, etc.)?',
    section: 'medicationsAllergies', field: 'onHormoneTherapy', options: yesNo
  }));
  const hrtD = document.createElement('div');
  hrtD.dataset.conditional = 'medicationsAllergies.onHormoneTherapy=yes';
  hrtD.appendChild(textInput({
    label: 'Hormone therapy — name',
    section: 'medicationsAllergies', field: 'hormoneTherapyDetails'
  }));
  card.appendChild(hrtD);

  card.appendChild(textArea({
    label: 'Other regular medications',
    section: 'medicationsAllergies', field: 'otherMedications',
    placeholder: 'List any other medications you take regularly…',
    rows: 3
  }));

  const drugHeader = document.createElement('div');
  drugHeader.className = 'list-section-header';
  drugHeader.innerHTML = '<h3>Drug allergies</h3>';
  card.appendChild(drugHeader);
  card.appendChild(drugAllergyEditor());

  card.appendChild(radioGroup({
    label: 'Latex allergy?',
    section: 'medicationsAllergies', field: 'latexAllergy', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Adhesive (tape) allergy?',
    section: 'medicationsAllergies', field: 'adhesiveAllergy', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Other allergies (food, contrast, environmental)',
    section: 'medicationsAllergies', field: 'otherAllergies', rows: 2
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Procedure Planning & Consent',
    description: 'Proposed procedure, complexity, VTE risk, and consent.'
  });

  card.appendChild(textArea({
    label: 'Proposed procedure',
    section: 'procedurePlanningConsent', field: 'proposedProcedure',
    placeholder: 'Describe the proposed surgical procedure…',
    rows: 3
  }));
  card.appendChild(selectInput({
    label: 'Procedure complexity',
    section: 'procedurePlanningConsent', field: 'procedureComplexity',
    options: [
      { value: '1', label: 'Complexity 1 — Minor' },
      { value: '2', label: 'Complexity 2 — Intermediate' },
      { value: '3', label: 'Complexity 3 — Major' },
      { value: '4', label: 'Complexity 4 — Major plus / Emergency' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Surgical approach',
    section: 'procedurePlanningConsent', field: 'surgicalApproach',
    options: [
      { value: 'open', label: 'Open' },
      { value: 'endoscopic', label: 'Endoscopic' },
      { value: 'microsurgical', label: 'Microsurgical' },
      { value: 'minimally-invasive', label: 'Minimally invasive' },
      { value: 'combined', label: 'Combined' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Expected duration',
    section: 'procedurePlanningConsent', field: 'expectedDurationMinutes',
    type: 'number', min: 0, max: 1440, unit: 'min'
  }));
  card.appendChild(selectInput({
    label: 'Expected hospital stay',
    section: 'procedurePlanningConsent', field: 'expectedHospitalStay',
    options: [
      { value: 'day-case', label: 'Day case' },
      { value: 'overnight', label: 'Overnight' },
      { value: '2-3-days', label: '2–3 days' },
      { value: '4-7-days', label: '4–7 days' },
      { value: 'greater-7-days', label: '> 7 days' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Flap / graft type',
    section: 'procedurePlanningConsent', field: 'flapType',
    options: [
      { value: 'local', label: 'Local flap' },
      { value: 'regional', label: 'Regional flap' },
      { value: 'distant', label: 'Distant flap' },
      { value: 'free', label: 'Free flap' },
      { value: 'skin-graft', label: 'Skin graft' },
      { value: 'tissue-expansion', label: 'Tissue expansion' },
      { value: 'implant', label: 'Implant' },
      { value: 'n-a', label: 'Not applicable' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Implant required?',
    section: 'procedurePlanningConsent', field: 'implantRequired', options: yesNo
  }));
  const implD = document.createElement('div');
  implD.dataset.conditional = 'procedurePlanningConsent.implantRequired=yes';
  implD.appendChild(textInput({
    label: 'Implant — type / details',
    section: 'procedurePlanningConsent', field: 'implantDetails'
  }));
  card.appendChild(implD);

  card.appendChild(radioGroup({
    label: 'VTE risk', section: 'procedurePlanningConsent', field: 'vteRisk',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high', label: 'High' }
    ]
  }));
  card.appendChild(radioGroup({
    label: 'Antibiotic prophylaxis planned?',
    section: 'procedurePlanningConsent', field: 'antibioticProphylaxis', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Anticipated risks discussed',
    section: 'procedurePlanningConsent', field: 'anticipatedRisks',
    placeholder: 'Bleeding, infection, scarring, asymmetry, etc.',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Alternative treatments discussed',
    section: 'procedurePlanningConsent', field: 'alternativeTreatments',
    rows: 3
  }));
  card.appendChild(radioGroup({
    label: 'Has consent discussion taken place?',
    section: 'procedurePlanningConsent', field: 'consentDiscussion', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Has the consent form been signed?',
    section: 'procedurePlanningConsent', field: 'consentFormSigned', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Cooling-off period offered?',
    section: 'procedurePlanningConsent', field: 'coolingOffPeriodOffered',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'n-a', label: 'Not applicable' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Follow-up plan',
    section: 'procedurePlanningConsent', field: 'followUpPlan', rows: 2
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
  // Demographics
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'weight'],
  ['demographics', 'height'],
  // Reason for referral
  ['reasonForReferral', 'referralType'],
  ['reasonForReferral', 'urgency'],
  ['reasonForReferral', 'primaryComplaint'],
  ['reasonForReferral', 'affectedBodyArea'],
  ['reasonForReferral', 'laterality'],
  ['reasonForReferral', 'durationOfCondition'],
  ['reasonForReferral', 'previousConsultations'],
  // Medical & surgical history
  ['medicalSurgicalHistory', 'previousPlasticSurgery'],
  ['medicalSurgicalHistory', 'previousGeneralSurgery'],
  ['medicalSurgicalHistory', 'woundHealingProblems'],
  ['medicalSurgicalHistory', 'keloidScarring'],
  ['medicalSurgicalHistory', 'diabetes'],
  ['medicalSurgicalHistory', 'hypertension'],
  ['medicalSurgicalHistory', 'cardiacDisease'],
  ['medicalSurgicalHistory', 'respiratoryDisease'],
  ['medicalSurgicalHistory', 'autoimmuneDisease'],
  ['medicalSurgicalHistory', 'bleedingDisorder'],
  ['medicalSurgicalHistory', 'immunosuppressed'],
  ['medicalSurgicalHistory', 'cancerHistory'],
  // Current condition
  ['currentCondition', 'conditionCategory'],
  ['currentCondition', 'tissueLoss'],
  ['currentCondition', 'functionalImpairment'],
  ['currentCondition', 'painLevel'],
  ['currentCondition', 'cosmeticConcern'],
  ['currentCondition', 'impactOnDailyActivities'],
  // Wound assessment
  ['woundTissueAssessment', 'hasOpenWound'],
  // Psychological
  ['psychologicalAssessment', 'bodyDysmorphicConcern'],
  ['psychologicalAssessment', 'realisticExpectations'],
  ['psychologicalAssessment', 'motivation'],
  ['psychologicalAssessment', 'previousMentalHealth'],
  ['psychologicalAssessment', 'anxietyLevel'],
  ['psychologicalAssessment', 'depressionScreen'],
  ['psychologicalAssessment', 'socialImpact'],
  ['psychologicalAssessment', 'psychologicalReferralNeeded'],
  // Anaesthetic risk
  ['anaestheticRisk', 'asaClass'],
  ['anaestheticRisk', 'previousAnaesthetic'],
  ['anaestheticRisk', 'anaestheticComplications'],
  ['anaestheticRisk', 'difficultAirway'],
  ['anaestheticRisk', 'malignantHyperthermiaRisk'],
  ['anaestheticRisk', 'familyAnaestheticProblems'],
  ['anaestheticRisk', 'smokingStatus'],
  ['anaestheticRisk', 'alcoholConsumption'],
  ['anaestheticRisk', 'recreationalDrugs'],
  ['anaestheticRisk', 'obstructiveSleepApnoea'],
  ['anaestheticRisk', 'anaestheticPreference'],
  // Photography & documentation
  ['photographyDocumentation', 'clinicalPhotosTaken'],
  ['photographyDocumentation', 'photoConsentObtained'],
  ['photographyDocumentation', 'standardisedViews'],
  ['photographyDocumentation', 'measurementsRecorded'],
  ['photographyDocumentation', 'diagramsDrawn'],
  ['photographyDocumentation', 'previousImaging'],
  // Medications & allergies
  ['medicationsAllergies', 'onAnticoagulants'],
  ['medicationsAllergies', 'onAntiplatelets'],
  ['medicationsAllergies', 'onSteroids'],
  ['medicationsAllergies', 'onImmunosuppressants'],
  ['medicationsAllergies', 'onChemotherapy'],
  ['medicationsAllergies', 'onHormoneTherapy'],
  ['medicationsAllergies', 'latexAllergy'],
  ['medicationsAllergies', 'adhesiveAllergy'],
  // Procedure planning & consent
  ['procedurePlanningConsent', 'procedureComplexity'],
  ['procedurePlanningConsent', 'surgicalApproach'],
  ['procedurePlanningConsent', 'expectedHospitalStay'],
  ['procedurePlanningConsent', 'flapType'],
  ['procedurePlanningConsent', 'implantRequired'],
  ['procedurePlanningConsent', 'vteRisk'],
  ['procedurePlanningConsent', 'antibioticProphylaxis'],
  ['procedurePlanningConsent', 'consentDiscussion'],
  ['procedurePlanningConsent', 'consentFormSigned'],
  ['procedurePlanningConsent', 'coolingOffPeriodOffered']
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
  { step: 1,  section: 'demographics',              title: 'Demographics' },
  { step: 2,  section: 'reasonForReferral',         title: 'Referral' },
  { step: 3,  section: 'medicalSurgicalHistory',    title: 'History' },
  { step: 4,  section: 'currentCondition',          title: 'Condition' },
  { step: 5,  section: 'woundTissueAssessment',     title: 'Wound' },
  { step: 6,  section: 'psychologicalAssessment',   title: 'Psychological' },
  { step: 7,  section: 'anaestheticRisk',           title: 'Anaesthetic' },
  { step: 8,  section: 'photographyDocumentation',  title: 'Photography' },
  { step: 9,  section: 'medicationsAllergies',      title: 'Medications' },
  { step: 10, section: 'procedurePlanningConsent',  title: 'Procedure' }
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
    if (input.tagName === 'LABEL') return;
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
    asaClass, woundClass, complexityScore, overallRisk,
    firedRules, additionalFlags, timestamp
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
      <td class="num">Grade ${r.grade}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No grading rules fired.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Finding</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Plastic Surgery Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Overall Risk</h3>
      <p class="risk-summary">
        <span class="risk-badge ${esc(riskLevelClass(overallRisk))}">${esc(riskLevelLabel(overallRisk))}</span>
      </p>

      <h3>Classifications</h3>
      <dl class="classifications">
        <div>
          <dt>ASA Physical Status</dt>
          <dd>${esc(asaClassLabel(asaClass))}</dd>
        </div>
        <div>
          <dt>Wound Classification</dt>
          <dd>${esc(woundClassLabel(woundClass))}</dd>
        </div>
        <div>
          <dt>Surgical Complexity</dt>
          <dd>${esc(complexityLabel(complexityScore))}</dd>
        </div>
      </dl>

      <h3>Fired Rules</h3>
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
  lastResult = calculatePlasticsGrade(state);
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
  host.appendChild(renderStep10());
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
