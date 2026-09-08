import { gradeDonor } from './donor-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateAgeYears, eligibilityClass, eligibilityLabel, emptyAssessment } from './types.js';

// Blood Donation Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the JPAC Donor Selection Guidelines (DSG) engine and renders an
// inline eligibility report. State is persisted to localStorage so a
// partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'blood-donation-assessment.front-end-form-with-html.v1';

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

/** @type {import('./types.js').AssessmentData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'blood-donation-assessment',
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

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs progress and conditional visibility after each change.
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
  refreshAutoCalculatedReadouts();
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

const TOTAL_STEPS = 10;

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
  const labelText = esc(opts.label);
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
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
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

/** Read-only auto-calculated readout (e.g. age). */
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
// Repeating-list editors
// ----------------------------------------------------------------------

/** Editor for current medications: array of { name, reason }. */
function medicationListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.medicalHistory.currentMedications;
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
            <span>Medication name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Aspirin">
          </label>
          <label class="list-cell">
            <span>Reason</span>
            <input type="text" class="text-input" data-key="reason" value="${esc(row.reason)}" placeholder="e.g. Cardiovascular">
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
      rows.push({ name: '', reason: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

/** Editor for travel entries: array of { country, returnDate, duration }. */
function travelListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.travelHistory.recentTravel;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No recent travel added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row';
      r.innerHTML = `
        <div class="list-grid travel-grid">
          <label class="list-cell">
            <span>Country / region</span>
            <input type="text" class="text-input" data-key="country" value="${esc(row.country)}" placeholder="e.g. Kenya">
          </label>
          <label class="list-cell">
            <span>Return date</span>
            <input type="date" class="text-input" data-key="returnDate" value="${esc(row.returnDate)}">
          </label>
          <label class="list-cell">
            <span>Duration</span>
            <input type="text" class="text-input" data-key="duration" value="${esc(row.duration)}" placeholder="e.g. 2 weeks">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove travel entry">&times;</button>
        </div>
      `;
      r.querySelectorAll('input').forEach((inp) => {
        inp.addEventListener('input', () => {
          rows[idx][inp.dataset.key] = inp.value;
          saveState(state);
          updateProgress();
        });
        inp.addEventListener('change', () => {
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
    addBtn.textContent = '+ Add travel entry';
    addBtn.addEventListener('click', () => {
      rows.push({ country: '', returnDate: '', duration: '' });
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
    title: 'Donor Demographics',
    description: 'Basic details required to register the donation.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'donorDemographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'donorDemographics', field: 'lastName', required: true }));
  card.appendChild(grid);

  const dobRow = document.createElement('div');
  dobRow.className = 'two-col';
  dobRow.appendChild(textInput({
    label: 'Date of Birth',
    section: 'donorDemographics',
    field: 'dateOfBirth',
    type: 'date',
    required: true
  }));
  dobRow.appendChild(readOnlyReadout({
    label: 'Age',
    id: 'age-readout',
    render: () => {
      const age = calculateAgeYears(state.donorDemographics.dateOfBirth);
      if (age == null) return '<span class="muted">Auto-calculated</span>';
      return `<strong>${age}</strong> <span class="muted">years</span>`;
    }
  }));
  card.appendChild(dobRow);

  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'donorDemographics',
    field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  const measurements = document.createElement('div');
  measurements.className = 'two-col';
  measurements.appendChild(textInput({
    label: 'Weight', section: 'donorDemographics', field: 'weight',
    type: 'number', min: 30, max: 250, unit: 'kg'
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'donorDemographics', field: 'height',
    type: 'number', min: 100, max: 230, unit: 'cm'
  }));
  card.appendChild(measurements);

  card.appendChild(selectInput({
    label: 'Donor type',
    section: 'donorDemographics',
    field: 'donorType',
    options: [
      { value: 'first-time', label: 'First-time donor' },
      { value: 'regular', label: 'Regular donor (donated within past 2 years)' },
      { value: 'lapsed', label: 'Lapsed donor (no donation in last 2 years)' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Date of last donation',
    section: 'donorDemographics',
    field: 'lastDonationDate',
    type: 'date'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'General Health & Wellbeing',
    description: 'Same-day wellbeing checks before donation.'
  });

  card.appendChild(radioGroup({
    label: 'Are you feeling well today?',
    section: 'generalHealth', field: 'feelingWellToday', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Did you get adequate sleep last night?',
    section: 'generalHealth', field: 'adequateSleep', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have you eaten and drunk fluids in the last few hours?',
    section: 'generalHealth', field: 'adequateMealAndFluids', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Are you feeling faint, lightheaded, or unwell right now?',
    section: 'generalHealth', field: 'feelingFaintOrUnwell', options: yesNo
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Medical History',
    description: 'Long-term health conditions and current medications.'
  });

  card.appendChild(radioGroup({ label: 'Do you have any heart or circulatory disease?', section: 'medicalHistory', field: 'heartOrCirculatoryDisease', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you ever had cancer?', section: 'medicalHistory', field: 'cancer', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have a bleeding or clotting disorder?', section: 'medicalHistory', field: 'bleedingOrClottingDisorder', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have insulin-treated diabetes?', section: 'medicalHistory', field: 'diabetesOnInsulin', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Do you have a history of seizures or epilepsy?', section: 'medicalHistory', field: 'epilepsyOrSeizures', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Are you HIV positive?', section: 'medicalHistory', field: 'hivPositive', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you ever had hepatitis B or C?', section: 'medicalHistory', field: 'hepatitisBOrC', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you ever tested positive for HTLV?', section: 'medicalHistory', field: 'htlv', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Does any blood relative have CJD or vCJD?', section: 'medicalHistory', field: 'cjdFamilyHistory', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you ever received human pituitary-derived hormone (e.g. growth hormone)?', section: 'medicalHistory', field: 'receivedPituitaryHormone', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you ever received a dura mater (brain covering) graft?', section: 'medicalHistory', field: 'receivedDuraMaterGraft', options: yesNo }));

  const medsHeader = document.createElement('div');
  medsHeader.className = 'list-section-header';
  medsHeader.innerHTML = `
    <h3>Current medications</h3>
    <p class="hint">List any prescription or regular medication you are currently taking.</p>
  `;
  card.appendChild(medsHeader);
  card.appendChild(medicationListEditor());

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Recent Illness & Infections',
    description: 'Illness, infection, or medical care in recent weeks.'
  });

  card.appendChild(radioGroup({ label: 'Have you had a fever in the past 2 weeks?', section: 'recentIllness', field: 'feverPastTwoWeeks', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you had any infection in the past 2 weeks?', section: 'recentIllness', field: 'infectionPastTwoWeeks', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you taken antibiotics in the past 7 days?', section: 'recentIllness', field: 'antibioticsPastSevenDays', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you had any dental work in the past week?', section: 'recentIllness', field: 'dentalWorkPastWeek', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you had surgery in the past 6 months?', section: 'recentIllness', field: 'surgeryPastSixMonths', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you tested positive for COVID-19 in the past 28 days?', section: 'recentIllness', field: 'covidPositivePastTwentyEightDays', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you had any vaccination in the past 4 weeks?', section: 'recentIllness', field: 'vaccinationPastFourWeeks', options: yesNo }));

  const vacDetails = document.createElement('div');
  vacDetails.dataset.conditional = 'recentIllness.vaccinationPastFourWeeks=yes';
  vacDetails.appendChild(textInput({
    label: 'Vaccine type / details',
    section: 'recentIllness', field: 'vaccinationDetails',
    placeholder: 'e.g. influenza, COVID-19 booster, yellow fever'
  }));
  card.appendChild(vacDetails);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Travel History',
    description: 'Travel relevant to malaria, West Nile virus, and vCJD risk.'
  });

  const travelHeader = document.createElement('div');
  travelHeader.className = 'list-section-header';
  travelHeader.innerHTML = `
    <h3>Recent travel (past 12 months)</h3>
    <p class="hint">List countries visited and return date for each trip.</p>
  `;
  card.appendChild(travelHeader);
  card.appendChild(travelListEditor());

  card.appendChild(radioGroup({
    label: 'Have you travelled to a malaria-risk area in the past 12 months?',
    section: 'travelHistory', field: 'malariaAreaPastTwelveMonths', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have you travelled to a West Nile virus area in the past 28 days?',
    section: 'travelHistory', field: 'westNileVirusAreaPastTwentyEightDays', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Did you live in the UK for ≥ 12 months between 1980 and 1996?',
    section: 'travelHistory', field: 'ukResidence1980To1996Over12Months', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Have you ever received a blood transfusion in the UK since 1980?',
    section: 'travelHistory', field: 'bloodTransfusionInUk', options: yesNo
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Lifestyle & Risk Behaviours',
    description: 'These questions are confidential. Honest answers protect patients who receive your blood.'
  });

  card.appendChild(radioGroup({ label: 'Have you ever injected non-prescribed drugs (including steroids)?', section: 'lifestyleRisk', field: 'ivDrugUseEver', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you had sex with someone who has injected non-prescribed drugs?', section: 'lifestyleRisk', field: 'sexWithIvDrugUser', options: yesNo }));
  card.appendChild(radioGroup({ label: 'In the past 12 months, have you had sex in exchange for money or drugs?', section: 'lifestyleRisk', field: 'sexInExchangePastTwelveMonths', options: yesNo }));
  card.appendChild(radioGroup({ label: 'In the past 3 months, have you had sex with a new partner?', section: 'lifestyleRisk', field: 'sexWithNewPartnerPastThreeMonths', options: yesNo }));
  card.appendChild(radioGroup({ label: 'In the past 3 months, have you had multiple sexual partners?', section: 'lifestyleRisk', field: 'multipleSexualPartnersPastThreeMonths', options: yesNo }));
  card.appendChild(radioGroup({ label: 'In the past 4 months, have you had a tattoo or semi-permanent make-up?', section: 'lifestyleRisk', field: 'tattooOrPiercingPastFourMonths', options: yesNo }));
  card.appendChild(radioGroup({ label: 'In the past 4 months, have you had acupuncture (non-NHS)?', section: 'lifestyleRisk', field: 'acupuncturePastFourMonths', options: yesNo }));
  card.appendChild(radioGroup({ label: 'In the past 4 months, have you had a body or ear piercing?', section: 'lifestyleRisk', field: 'bodyOrEarPiercingPastFourMonths', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you been incarcerated in the past 12 months?', section: 'lifestyleRisk', field: 'incarceratedPastTwelveMonths', options: yesNo }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Pregnancy & Transfusion History',
    description: 'Pregnancy, breastfeeding, and prior receipt of blood or organ.'
  });

  card.appendChild(radioGroup({ label: 'Are you currently pregnant?', section: 'pregnancyTransfusion', field: 'currentlyPregnant', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you been pregnant in the past 6 months?', section: 'pregnancyTransfusion', field: 'pregnancyPastSixMonths', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Are you currently breastfeeding?', section: 'pregnancyTransfusion', field: 'breastfeeding', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Have you ever received a blood transfusion?', section: 'pregnancyTransfusion', field: 'receivedTransfusionEver', options: yesNo }));

  const txDate = document.createElement('div');
  txDate.dataset.conditional = 'pregnancyTransfusion.receivedTransfusionEver=yes';
  txDate.appendChild(textInput({
    label: 'Date of last transfusion',
    section: 'pregnancyTransfusion', field: 'lastTransfusionDate',
    type: 'date'
  }));
  card.appendChild(txDate);

  card.appendChild(radioGroup({ label: 'Have you ever received an organ or tissue transplant?', section: 'pregnancyTransfusion', field: 'receivedTransplantEver', options: yesNo }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Vital Signs',
    description: 'Recorded by donor session staff before donation.'
  });

  card.appendChild(textInput({
    label: 'Haemoglobin', section: 'vitalSigns', field: 'hemoglobin',
    type: 'number', min: 5, max: 25, step: 0.1, unit: 'g/dL'
  }));

  const bp = document.createElement('div');
  bp.className = 'two-col';
  bp.appendChild(textInput({
    label: 'Systolic BP', section: 'vitalSigns', field: 'systolicBp',
    type: 'number', min: 60, max: 250, unit: 'mmHg'
  }));
  bp.appendChild(textInput({
    label: 'Diastolic BP', section: 'vitalSigns', field: 'diastolicBp',
    type: 'number', min: 30, max: 150, unit: 'mmHg'
  }));
  card.appendChild(bp);

  const pt = document.createElement('div');
  pt.className = 'two-col';
  pt.appendChild(textInput({
    label: 'Pulse', section: 'vitalSigns', field: 'pulseBpm',
    type: 'number', min: 30, max: 200, unit: 'bpm'
  }));
  pt.appendChild(textInput({
    label: 'Temperature', section: 'vitalSigns', field: 'temperatureCelsius',
    type: 'number', min: 33, max: 42, step: 0.1, unit: '°C'
  }));
  card.appendChild(pt);

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Informed Consent',
    description: 'Confirm you understand and agree to the donation process.'
  });

  card.appendChild(radioGroup({
    label: 'Have you read and understood the donor information leaflet?',
    section: 'informedConsent', field: 'understoodInformation', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you consent to donate blood today?',
    section: 'informedConsent', field: 'consentToDonate', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you consent to mandatory testing (HIV, hepatitis B, hepatitis C, syphilis, HTLV)?',
    section: 'informedConsent', field: 'consentToTesting', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Do you consent to be contacted with test results if any are abnormal?',
    section: 'informedConsent', field: 'consentToContact', options: yesNo
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Donation Plan',
    description: 'What kind of donation are you here for today?'
  });

  card.appendChild(selectInput({
    label: 'Planned donation type',
    section: 'donationPlan',
    field: 'plannedDonationType',
    options: [
      { value: 'whole-blood', label: 'Whole blood' },
      { value: 'plasma', label: 'Plasma' },
      { value: 'platelets', label: 'Platelets' },
      { value: 'red-cells', label: 'Red cells (double red apheresis)' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Preferred donation date',
    section: 'donationPlan',
    field: 'preferredDonationDate',
    type: 'date'
  }));
  card.appendChild(textInput({
    label: 'Session / centre',
    section: 'donationPlan',
    field: 'session',
    placeholder: 'e.g. Manchester Plymouth Grove'
  }));
  card.appendChild(textArea({
    label: 'Notes',
    section: 'donationPlan',
    field: 'notes',
    rows: 3,
    placeholder: 'Anything else the session staff should know…'
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
  const ageEl = document.getElementById('age-readout');
  if (ageEl) {
    const age = calculateAgeYears(state.donorDemographics.dateOfBirth);
    ageEl.innerHTML = age == null
      ? '<span class="muted">Auto-calculated</span>'
      : `<strong>${age}</strong> <span class="muted">years</span>`;
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Donor demographics
  ['donorDemographics', 'firstName'],
  ['donorDemographics', 'lastName'],
  ['donorDemographics', 'dateOfBirth'],
  ['donorDemographics', 'sex'],
  ['donorDemographics', 'weight'],
  ['donorDemographics', 'height'],
  ['donorDemographics', 'donorType'],
  // General health
  ['generalHealth', 'feelingWellToday'],
  ['generalHealth', 'adequateSleep'],
  ['generalHealth', 'adequateMealAndFluids'],
  ['generalHealth', 'feelingFaintOrUnwell'],
  // Medical history
  ['medicalHistory', 'heartOrCirculatoryDisease'],
  ['medicalHistory', 'cancer'],
  ['medicalHistory', 'bleedingOrClottingDisorder'],
  ['medicalHistory', 'diabetesOnInsulin'],
  ['medicalHistory', 'epilepsyOrSeizures'],
  ['medicalHistory', 'hivPositive'],
  ['medicalHistory', 'hepatitisBOrC'],
  ['medicalHistory', 'htlv'],
  ['medicalHistory', 'cjdFamilyHistory'],
  ['medicalHistory', 'receivedPituitaryHormone'],
  ['medicalHistory', 'receivedDuraMaterGraft'],
  // Recent illness
  ['recentIllness', 'feverPastTwoWeeks'],
  ['recentIllness', 'infectionPastTwoWeeks'],
  ['recentIllness', 'antibioticsPastSevenDays'],
  ['recentIllness', 'dentalWorkPastWeek'],
  ['recentIllness', 'surgeryPastSixMonths'],
  ['recentIllness', 'covidPositivePastTwentyEightDays'],
  ['recentIllness', 'vaccinationPastFourWeeks'],
  // Travel
  ['travelHistory', 'malariaAreaPastTwelveMonths'],
  ['travelHistory', 'westNileVirusAreaPastTwentyEightDays'],
  ['travelHistory', 'ukResidence1980To1996Over12Months'],
  ['travelHistory', 'bloodTransfusionInUk'],
  // Lifestyle
  ['lifestyleRisk', 'ivDrugUseEver'],
  ['lifestyleRisk', 'sexWithIvDrugUser'],
  ['lifestyleRisk', 'sexInExchangePastTwelveMonths'],
  ['lifestyleRisk', 'sexWithNewPartnerPastThreeMonths'],
  ['lifestyleRisk', 'multipleSexualPartnersPastThreeMonths'],
  ['lifestyleRisk', 'tattooOrPiercingPastFourMonths'],
  ['lifestyleRisk', 'acupuncturePastFourMonths'],
  ['lifestyleRisk', 'bodyOrEarPiercingPastFourMonths'],
  ['lifestyleRisk', 'incarceratedPastTwelveMonths'],
  // Pregnancy & transfusion
  ['pregnancyTransfusion', 'currentlyPregnant'],
  ['pregnancyTransfusion', 'pregnancyPastSixMonths'],
  ['pregnancyTransfusion', 'breastfeeding'],
  ['pregnancyTransfusion', 'receivedTransfusionEver'],
  ['pregnancyTransfusion', 'receivedTransplantEver'],
  // Vitals
  ['vitalSigns', 'hemoglobin'],
  ['vitalSigns', 'systolicBp'],
  ['vitalSigns', 'diastolicBp'],
  ['vitalSigns', 'pulseBpm'],
  ['vitalSigns', 'temperatureCelsius'],
  // Consent
  ['informedConsent', 'understoodInformation'],
  ['informedConsent', 'consentToDonate'],
  ['informedConsent', 'consentToTesting'],
  ['informedConsent', 'consentToContact'],
  // Donation plan
  ['donationPlan', 'plannedDonationType']
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
    case 'urgent': return 'flag-urgent';
    case 'high': return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

function statusClass(status) {
  switch (status) {
    case 'eligible': return 'status-eligible';
    case 'temporarily-deferred': return 'status-temporarily-deferred';
    case 'permanently-deferred': return 'status-permanently-deferred';
    default: return '';
  }
}

function statusLabel(status) {
  switch (status) {
    case 'eligible': return 'Eligible';
    case 'temporarily-deferred': return 'Temp. Deferred';
    case 'permanently-deferred': return 'Perm. Deferred';
    default: return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const { eligibilityStatus, deferralWindow, firedRules, additionalFlags, answeredCount, timestamp } = lastResult;

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
      <td>${esc(statusLabel(r.status))}</td>
      <td>${esc(r.deferralWindow || '—')}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No deferral criteria triggered — donor is eligible based on supplied answers.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Reason</th>
            <th scope="col">Status</th>
            <th scope="col">Deferral window</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const windowText = eligibilityStatus === 'temporarily-deferred' && deferralWindow
    ? `<span class="deferral-window">Deferral window: ${esc(deferralWindow)}</span>`
    : '';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Blood Donation Eligibility Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Eligibility Status</h3>
      <p class="status-summary">
        <span class="status-badge ${statusClass(eligibilityStatus)}">${esc(eligibilityLabel(eligibilityStatus))}</span>
        ${windowText}
      </p>
      <p class="muted">Based on ${answeredCount} of ${TRACKED_FIELDS.length} fields answered.</p>

      <h3>Triggered Deferral Rules</h3>
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
  const _errors = validateForm();
  if (_errors.length > 0) return;
  const { eligibilityStatus, deferralWindow, firedRules } = gradeDonor(state);
  const additionalFlags = detectAdditionalFlags(state);
  let answered = 0;
  for (const [section, field] of TRACKED_FIELDS) {
    const v = state[section][field];
    if (v !== null && v !== undefined && v !== '') answered++;
  }
  lastResult = {
    eligibilityStatus,
    deferralWindow,
    firedRules,
    additionalFlags,
    answeredCount: answered,
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
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'donorDemographics',      title: 'Demographics' },
  { step: 2,  section: 'generalHealth',          title: 'General Health' },
  { step: 3,  section: 'medicalHistory',         title: 'Medical' },
  { step: 4,  section: 'recentIllness',          title: 'Recent Illness' },
  { step: 5,  section: 'travelHistory',          title: 'Travel' },
  { step: 6,  section: 'lifestyleRisk',          title: 'Lifestyle' },
  { step: 7,  section: 'pregnancyTransfusion',   title: 'Pregnancy & Tx' },
  { step: 8,  section: 'vitalSigns',             title: 'Vitals' },
  { step: 9,  section: 'informedConsent',        title: 'Consent' },
  { step: 10, section: 'donationPlan',           title: 'Donation Plan' }
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
