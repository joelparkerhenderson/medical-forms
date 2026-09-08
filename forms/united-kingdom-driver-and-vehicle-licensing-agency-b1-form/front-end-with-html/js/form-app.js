import { validateB1 } from './b1-validator.js';
import { detectFlaggedIssues } from './flagged-issues.js';
import { emptyAssessment, epilepsyDeclarationRequired, hasText, isYesNoAnswered, priorityLabel, sectionLabel } from './types.js';

// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a top-of-page native
// <progress> + step-list reflects how many tracked fields have been answered.
// Submission runs the pure validator + flagged-issues engine and renders an
// inline report. State is persisted to localStorage so a partial fill
// survives a page reload. Conditional sections (Q4 No -> skip Q5/Q6, Q10 No
// -> skip Q10a/b, Q12 No -> skip Q12a/b, epilepsy declaration when
// applicable) are hidden via re-render.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'united-kingdom-driver-and-vehicle-licensing-agency-b1-form.front-end-form-with-html.v1';
const TOTAL_STEPS = 13;

/** Deep-merge persisted state over a fresh empty assessment. */
function mergeDeep(target, source) {
  if (!source || typeof source !== 'object') return target;
  for (const key of Object.keys(target)) {
    const t = target[key];
    const s = source[key];
    if (
      t !== null &&
      typeof t === 'object' &&
      !Array.isArray(t) &&
      s !== null &&
      typeof s === 'object' &&
      !Array.isArray(s)
    ) {
      mergeDeep(t, s);
    } else if (s !== undefined) {
      target[key] = s;
    }
  }
  return target;
}

/** @returns {import('./types.js').AssessmentData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyAssessment();

  mergeDeep(fresh, parsed);
  if (!Array.isArray(fresh.medication.entries) || fresh.medication.entries.length === 0) {
    fresh.medication.entries = [{ name: '', startDate: '', endDate: '' }];
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
    console.warn('Could not parse saved B1 form; starting fresh.', e);
    return emptyAssessment();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save B1 form to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored B1 form.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

/** @type {import('./types.js').AssessmentData} */
let state = loadState();

/** @type {{ validation: any, flags: any[], timestamp: string } | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'united-kingdom-driver-and-vehicle-licensing-agency-b1-form',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const out = document.getElementById('report');
    if (out) out.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/** Resolve a dotted path (e.g. "seizures.multiple.affectedConsciousness") on state. */
function getPath(path) {
  const parts = path.split('.');
  let cur = state;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

/** Set a dotted path on state, persist, and re-render. */
function setPath(path, value) {
  const parts = path.split('.');
  let cur = state;
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
  saveState();
  renderForm();
  updateProgress();
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

function pathToId(path) {
  return 'f-' + path.replace(/\./g, '-');
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
// Field component builders
// ----------------------------------------------------------------------

/**
 * @param {{ label: string, path: string, type?: string, placeholder?: string,
 *           required?: boolean }} opts
 */
function textInput(opts) {
  const id = pathToId(opts.path);
  const value = getPath(opts.path) ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const cls = lilyInputClass(type);
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const placeholderAttr = opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '';
  const requiredAttrs = opts.required ? ' required data-required' : '';
  const labelRequired = opts.required ? ' data-required' : '';
  wrapper.innerHTML =
    '<label class="label" for="' + id + '"' + labelRequired + '>' + labelText + '</label>' +
    '<input id="' + id + '" name="' + id + '" type="' + type + '" class="' + cls + '"' +
    ' value="' + esc(value) + '"' + placeholderAttr +
    ' aria-describedby="' + id + '-error"' + requiredAttrs + '>' +
    '<span class="error-message" id="' + id + '-error"></span>';
  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    const parts = opts.path.split('.');
    let cur = state;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    cur[parts[parts.length - 1]] = input.value;
    saveState();
    updateProgress();
    clearFieldError(id);
  });
  input.addEventListener('change', () => {
    renderForm();
  });
  return wrapper;
}

/**
 * @param {{ label: string, path: string, rows?: number, placeholder?: string,
 *           required?: boolean }} opts
 */
function textArea(opts) {
  const id = pathToId(opts.path);
  const value = getPath(opts.path) ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const placeholderAttr = opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '';
  const requiredAttrs = opts.required ? ' required data-required' : '';
  const labelRequired = opts.required ? ' data-required' : '';
  wrapper.innerHTML =
    '<label class="label" for="' + id + '"' + labelRequired + '>' + labelText + '</label>' +
    '<textarea id="' + id + '" name="' + id + '" rows="' + (opts.rows || 3) + '"' +
    ' class="text-area-input"' + placeholderAttr +
    ' aria-describedby="' + id + '-error"' + requiredAttrs + '>' + esc(value) + '</textarea>' +
    '<span class="error-message" id="' + id + '-error"></span>';
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => {
    const parts = opts.path.split('.');
    let cur = state;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    cur[parts[parts.length - 1]] = ta.value;
    saveState();
    updateProgress();
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * @param {{ label: string, path: string,
 *           options: { value: string, label: string }[],
 *           required?: boolean }} opts
 */
function radioGroup(opts) {
  const groupId = pathToId(opts.path);
  const current = getPath(opts.path);
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = groupId + '-fieldset';

  const legend = document.createElement('legend');
  legend.className = 'label';
  if (opts.required) legend.setAttribute('data-required', '');
  legend.innerHTML = labelText;
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const radioId = groupId + '-' + option.value;
    const lab = document.createElement('label');
    lab.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    const requiredAttr = opts.required ? ' data-required' : '';
    lab.innerHTML =
      '<input class="radio-input" type="radio" id="' + radioId + '" name="' + groupId +
      '" value="' + esc(option.value) + '"' + checked + requiredAttr + '>' +
      '<span>' + esc(option.label) + '</span>';
    const input = lab.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        clearFieldError(groupId);
        setPath(opts.path, option.value);
      }
    });
    list.appendChild(lab);
  }
  wrapper.appendChild(list);

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = groupId + '-error';
  wrapper.appendChild(errSpan);
  return wrapper;
}

/**
 * Single standalone checkbox rendered as a Lily .field with a .checkbox-input.
 * @param {{ label: string, path: string }} opts
 */
function checkbox(opts) {
  const id = pathToId(opts.path);
  const checked = !!getPath(opts.path);
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const lab = document.createElement('label');
  lab.htmlFor = id;
  lab.className = 'checkbox-input-wrap';
  lab.innerHTML =
    '<input class="checkbox-input" type="checkbox" id="' + id + '" name="' + id + '"' +
    (checked ? ' checked' : '') + '>' +
    '<span>' + esc(opts.label) + '</span>';
  const input = lab.querySelector('input');
  input.addEventListener('change', () => {
    setPath(opts.path, input.checked);
  });
  wrapper.appendChild(lab);
  return wrapper;
}

/**
 * Build a section card as a Lily fieldset.
 * @param {{ stepNumber: number, title: string, description?: string }} opts
 */
function sectionCard(opts) {
  const card = document.createElement('fieldset');
  card.className = 'fieldset';
  card.dataset.step = String(opts.stepNumber);
  card.id = 'step-' + opts.stepNumber;
  const desc = opts.description
    ? '<span class="section-description">' + esc(opts.description) + '</span>'
    : '';
  const legend = document.createElement('legend');
  legend.className = 'fieldset-legend';
  legend.innerHTML =
    '<span class="section-step">Section ' + opts.stepNumber + ' of ' + TOTAL_STEPS + '</span>' +
    '<h2 class="section-title">' + esc(opts.title) + '</h2>' +
    desc;
  card.appendChild(legend);
  return card;
}

function twoCol(...children) {
  const grid = document.createElement('div');
  grid.className = 'two-col';
  for (const c of children) grid.appendChild(c);
  return grid;
}

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Part A — About You',
    description:
      'Your current driving licence details. Tell us about any change of details since your licence was issued.'
  });
  card.appendChild(textInput({
    label: 'Title',
    path: 'personalDetails.title',
    placeholder: 'e.g. Mr, Mrs, Ms, Mx, Dr',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Full name',
    path: 'personalDetails.fullName',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Date of birth',
    path: 'personalDetails.dateOfBirth',
    type: 'date',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Address — line 1',
    path: 'personalDetails.addressLine1',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Address — line 2',
    path: 'personalDetails.addressLine2'
  }));
  card.appendChild(textInput({
    label: 'Address — line 3',
    path: 'personalDetails.addressLine3'
  }));
  card.appendChild(twoCol(
    textInput({ label: 'Postcode', path: 'personalDetails.postcode', required: true }),
    textInput({ label: 'Contact number', path: 'personalDetails.contactNumber', type: 'tel', required: true })
  ));
  card.appendChild(textInput({
    label: 'Email',
    path: 'personalDetails.email',
    type: 'email'
  }));
  card.appendChild(textArea({
    label: 'Change of details (optional)',
    path: 'personalDetails.changeOfDetails',
    placeholder: 'If your name, address, or other licence details have changed, please describe the change here.',
    rows: 3
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Part B — Healthcare Professionals',
    description: 'Tell us about the healthcare professionals who treat you for this condition.'
  });

  const gpHeader = document.createElement('h3');
  gpHeader.className = 'subsection-title';
  gpHeader.textContent = 'GP details';
  card.appendChild(gpHeader);

  card.appendChild(textInput({
    label: 'GP name', path: 'healthcareProfessionals.gp.gpName', required: true
  }));
  card.appendChild(textInput({
    label: 'Surgery name', path: 'healthcareProfessionals.gp.surgeryName', required: true
  }));
  card.appendChild(textInput({
    label: 'Address — line 1', path: 'healthcareProfessionals.gp.addressLine1'
  }));
  card.appendChild(textInput({
    label: 'Address — line 2', path: 'healthcareProfessionals.gp.addressLine2'
  }));
  card.appendChild(twoCol(
    textInput({ label: 'Town', path: 'healthcareProfessionals.gp.town' }),
    textInput({ label: 'Postcode', path: 'healthcareProfessionals.gp.postcode', required: true })
  ));
  card.appendChild(twoCol(
    textInput({ label: 'Contact number', path: 'healthcareProfessionals.gp.contactNumber', type: 'tel' }),
    textInput({ label: 'Email', path: 'healthcareProfessionals.gp.email', type: 'email' })
  ));
  card.appendChild(textInput({
    label: 'Date last seen for this condition',
    path: 'healthcareProfessionals.gp.dateLastSeen',
    type: 'date',
    required: true
  }));

  const consHeader = document.createElement('h3');
  consHeader.className = 'subsection-title';
  consHeader.textContent = 'Consultant details';
  card.appendChild(consHeader);

  const consNote = document.createElement('p');
  consNote.className = 'subsection-note';
  consNote.textContent = 'Leave blank if you have not seen a consultant for this condition.';
  card.appendChild(consNote);

  card.appendChild(textInput({ label: 'Consultant name', path: 'healthcareProfessionals.consultant.consultantName' }));
  card.appendChild(textInput({ label: 'Speciality', path: 'healthcareProfessionals.consultant.speciality' }));
  card.appendChild(textInput({ label: 'Department', path: 'healthcareProfessionals.consultant.department' }));
  card.appendChild(textInput({ label: 'Hospital name', path: 'healthcareProfessionals.consultant.hospitalName' }));
  card.appendChild(textInput({ label: 'Address — line 1', path: 'healthcareProfessionals.consultant.addressLine1' }));
  card.appendChild(textInput({ label: 'Address — line 2', path: 'healthcareProfessionals.consultant.addressLine2' }));
  card.appendChild(twoCol(
    textInput({ label: 'Town', path: 'healthcareProfessionals.consultant.town' }),
    textInput({ label: 'Postcode', path: 'healthcareProfessionals.consultant.postcode' })
  ));
  card.appendChild(twoCol(
    textInput({ label: 'Contact number', path: 'healthcareProfessionals.consultant.contactNumber', type: 'tel' }),
    textInput({ label: 'Email', path: 'healthcareProfessionals.consultant.email', type: 'email' })
  ));
  card.appendChild(textInput({
    label: 'Date last seen for this condition',
    path: 'healthcareProfessionals.consultant.dateLastSeen',
    type: 'date'
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Question 1 — Condition history',
    description:
      'Please tick the appropriate box(es) if you have ever had any of the following. Provide the date for each condition you tick.'
  });

  card.appendChild(checkbox({
    label: 'a) Brain haemorrhage (including subarachnoid, aneurysm and AVM)',
    path: 'conditionHistory.brainHaemorrhage'
  }));
  if (state.conditionHistory.brainHaemorrhage) {
    card.appendChild(textInput({
      label: 'Date of brain haemorrhage',
      path: 'conditionHistory.brainHaemorrhageDate',
      type: 'date',
      required: true
    }));
    card.appendChild(textArea({
      label: 'Brain haemorrhage details',
      path: 'conditionHistory.brainHaemorrhageDetails',
      rows: 2
    }));
  }

  card.appendChild(checkbox({
    label: 'b) Severe head injury involving in-patient treatment',
    path: 'conditionHistory.severeHeadInjury'
  }));
  if (state.conditionHistory.severeHeadInjury) {
    card.appendChild(textInput({
      label: 'Date of severe head injury',
      path: 'conditionHistory.severeHeadInjuryDate',
      type: 'date',
      required: true
    }));
    card.appendChild(textArea({
      label: 'Severe head injury details',
      path: 'conditionHistory.severeHeadInjuryDetails',
      rows: 2
    }));
  }

  card.appendChild(checkbox({
    label: 'c) Any other condition (e.g. subdural haematoma, brain abscess/cyst, encephalitis, hydrocephalus, hypoxic brain damage, Lewy body dementia, transient global amnesia, VP shunt, etc.)',
    path: 'conditionHistory.otherCondition'
  }));
  if (state.conditionHistory.otherCondition) {
    card.appendChild(textInput({
      label: 'Date of other condition',
      path: 'conditionHistory.otherConditionDate',
      type: 'date'
    }));
    card.appendChild(textArea({
      label: 'Other condition details',
      path: 'conditionHistory.otherConditionDetails',
      rows: 3,
      required: true
    }));
  }

  const surgHeader = document.createElement('h3');
  surgHeader.className = 'subsection-title';
  surgHeader.textContent = 'd) Brain surgery';
  card.appendChild(surgHeader);

  card.appendChild(checkbox({
    label: 'Not applicable — I have never had brain surgery',
    path: 'conditionHistory.brainSurgeryNotApplicable'
  }));
  if (!state.conditionHistory.brainSurgeryNotApplicable) {
    card.appendChild(textInput({
      label: 'Date of any brain surgery',
      path: 'conditionHistory.brainSurgeryDate',
      type: 'date'
    }));
  }
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Question 2 — Treatment provider',
    description: 'Tell us who you most recently saw for the treatment of this condition.'
  });
  card.appendChild(radioGroup({
    label: 'Who did you last see for the treatment of this condition?',
    path: 'treatmentProvider.lastSeen',
    options: [
      { value: 'gp', label: 'GP' },
      { value: 'consultant', label: 'Consultant' }
    ],
    required: true
  }));

  if (state.treatmentProvider.lastSeen === 'gp' ||
      state.treatmentProvider.lastSeen === 'consultant') {
    const subHeader = document.createElement('h3');
    subHeader.className = 'subsection-title';
    subHeader.textContent = 'a) Dates of consultations for this condition';
    card.appendChild(subHeader);
  }

  if (state.treatmentProvider.lastSeen === 'gp') {
    card.appendChild(twoCol(
      textInput({
        label: 'GP — date of last contact',
        path: 'treatmentProvider.gpLastContactDate',
        type: 'date',
        required: true
      }),
      textInput({
        label: 'GP — date of next contact',
        path: 'treatmentProvider.gpNextContactDate',
        type: 'date'
      })
    ));
  }

  if (state.treatmentProvider.lastSeen === 'consultant') {
    card.appendChild(twoCol(
      textInput({
        label: 'Consultant — date of last contact',
        path: 'treatmentProvider.consultantLastContactDate',
        type: 'date',
        required: true
      }),
      textInput({
        label: 'Consultant — date of next contact',
        path: 'treatmentProvider.consultantNextContactDate',
        type: 'date'
      })
    ));
  }

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Question 3 — Blackouts',
    description: 'A blackout is any episode of altered or lost consciousness.'
  });
  card.appendChild(radioGroup({
    label: 'Have you ever had a blackout(s) or altered level of consciousness?',
    path: 'blackouts.hadBlackouts',
    options: YES_NO,
    required: true
  }));
  if (state.blackouts.hadBlackouts === 'yes') {
    card.appendChild(textInput({
      label: 'Date of blackout',
      path: 'blackouts.blackoutDate',
      type: 'date',
      required: true
    }));
  }
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Questions 4–6 — Seizures and epilepsy',
    description:
      'Epileptic attacks are variably described and involve fits, convulsions or seizures. Episodes may occur when asleep or when awake.'
  });

  card.appendChild(radioGroup({
    label: 'Q4. Have you ever had any form of seizures or epileptic attacks?',
    path: 'seizures.hadSeizures',
    options: YES_NO,
    required: true
  }));

  if (state.seizures.hadSeizures === 'yes') {
    card.appendChild(radioGroup({
      label: 'If Yes, please indicate diagnosis',
      path: 'seizures.diagnosis',
      options: [
        { value: 'first-ever', label: 'First ever seizure' },
        { value: 'more-than-one-or-epilepsy', label: 'More than one seizure ever, or epilepsy' }
      ],
      required: true
    }));
  }

  if (state.seizures.hadSeizures === 'yes' && state.seizures.diagnosis === 'first-ever') {
    const h = document.createElement('h3');
    h.className = 'subsection-title';
    h.textContent = 'Q5 — First ever seizure';
    card.appendChild(h);

    card.appendChild(textInput({
      label: 'Date of the seizure',
      path: 'seizures.firstEver.date',
      type: 'date',
      required: true
    }));
    card.appendChild(textArea({
      label: 'Please give details',
      path: 'seizures.firstEver.details',
      rows: 3
    }));
  }

  if (state.seizures.hadSeizures === 'yes' &&
      state.seizures.diagnosis === 'more-than-one-or-epilepsy') {
    const h = document.createElement('h3');
    h.className = 'subsection-title';
    h.textContent = 'Q6 — More than one seizure or epilepsy';
    card.appendChild(h);

    card.appendChild(radioGroup({
      label: 'a) Have you ever had two or more seizures within a 5 year period?',
      path: 'seizures.multiple.twoOrMoreWithinFiveYears',
      options: YES_NO,
      required: true
    }));

    card.appendChild(textInput({
      label: 'b) First awake seizure — date',
      path: 'seizures.multiple.firstAwakeSeizureDate',
      type: 'date'
    }));
    card.appendChild(textInput({
      label: 'c) First asleep seizure — date',
      path: 'seizures.multiple.firstAsleepSeizureDate',
      type: 'date'
    }));

    card.appendChild(twoCol(
      textInput({
        label: 'd) Last 2 awake seizures — date 1',
        path: 'seizures.multiple.lastTwoAwakeSeizureDate1',
        type: 'date'
      }),
      textInput({
        label: 'd) Last 2 awake seizures — date 2',
        path: 'seizures.multiple.lastTwoAwakeSeizureDate2',
        type: 'date'
      })
    ));
    card.appendChild(twoCol(
      textInput({
        label: 'e) Last 2 asleep seizures — date 1',
        path: 'seizures.multiple.lastTwoAsleepSeizureDate1',
        type: 'date'
      }),
      textInput({
        label: 'e) Last 2 asleep seizures — date 2',
        path: 'seizures.multiple.lastTwoAsleepSeizureDate2',
        type: 'date'
      })
    ));

    card.appendChild(textInput({
      label: 'f) If both awake and sleep attacks: date of first sleep attack after last awake attack',
      path: 'seizures.multiple.firstSleepAttackAfterLastAwakeAttackDate',
      type: 'date'
    }));

    card.appendChild(radioGroup({
      label: 'g) Have your seizures ever affected your level of consciousness?',
      path: 'seizures.multiple.affectedConsciousness',
      options: YES_NO,
      required: true
    }));

    if (state.seizures.multiple.affectedConsciousness === 'yes') {
      card.appendChild(radioGroup({
        label: 'h) Would your seizures ever have caused difficulty controlling a vehicle?',
        path: 'seizures.multiple.wouldHaveAffectedDriving',
        options: YES_NO,
        required: true
      }));
    }

    card.appendChild(textArea({
      label: 'Description of attack(s)',
      path: 'seizures.multiple.attackDescription',
      rows: 3
    }));

    card.appendChild(radioGroup({
      label: 'i) Was your last seizure a result of advice from your doctor to stop, reduce, or change epilepsy medication?',
      path: 'seizures.multiple.resultOfMedicationAdvice',
      options: YES_NO,
      required: true
    }));

    if (state.seizures.multiple.resultOfMedicationAdvice === 'yes') {
      card.appendChild(textInput({
        label: 'j-i) Date started to reduce or change medication',
        path: 'seizures.multiple.dateMedicationStartedToReduce',
        type: 'date'
      }));
      card.appendChild(radioGroup({
        label: 'j-ii) Has the previously effective medication been restarted?',
        path: 'seizures.multiple.previousMedicationRestarted',
        options: YES_NO
      }));
      if (state.seizures.multiple.previousMedicationRestarted === 'yes') {
        card.appendChild(textInput({
          label: 'j-iii) Date previously effective medication was restarted',
          path: 'seizures.multiple.datePreviousMedicationRestarted',
          type: 'date'
        }));
      }
      card.appendChild(textInput({
        label: 'j-iv) Date of last seizure prior to medication withdrawal/reduction',
        path: 'seizures.multiple.dateOfLastSeizurePriorToWithdrawal',
        type: 'date'
      }));
    }

    card.appendChild(textArea({
      label: 'If the seizure was provoked, please describe the circumstances and the provoking factor',
      path: 'seizures.multiple.provokedSeizureDetails',
      rows: 3
    }));
  }

  if (epilepsyDeclarationRequired(state)) {
    const decl = document.createElement('div');
    decl.className = 'declaration-block';
    decl.innerHTML =
      '<h3>Epilepsy declaration</h3>' +
      '<p>Because you have declared epilepsy or more than one lifetime seizure, you must' +
      ' accept this declaration before the DVLA can consider your application.</p>';
    decl.appendChild(checkbox({
      label: 'I agree to follow the advice of my doctor(s) about treatment for this condition; to attend, where necessary, appointments to monitor my condition; and to inform DVLA should I experience any further attacks.',
      path: 'seizures.epilepsyDeclaration.declarationAccepted'
    }));
    decl.appendChild(textInput({
      label: 'Signed (full name)',
      path: 'seizures.epilepsyDeclaration.signedName',
      required: true
    }));
    decl.appendChild(textInput({
      label: 'Date',
      path: 'seizures.epilepsyDeclaration.signatureDate',
      type: 'date',
      required: true
    }));
    card.appendChild(decl);
  }

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Question 7 — Medication',
    description:
      'Please list any medication that you take or have taken for this condition. If you take none, tick the box below.'
  });

  card.appendChild(checkbox({
    label: 'No medication taken',
    path: 'medication.noMedicationTaken'
  }));

  if (!state.medication.noMedicationTaken) {
    state.medication.entries.forEach((entry, i) => {
      const block = document.createElement('div');
      block.className = 'inset-block';
      const heading = document.createElement('h4');
      heading.style.margin = '0 0 0.5rem';
      heading.style.fontSize = '0.9375rem';
      heading.textContent = 'Medication ' + (i + 1);
      block.appendChild(heading);
      block.appendChild(textInput({
        label: 'Name of medication',
        path: 'medication.entries.' + i + '.name',
        placeholder: 'e.g. Levetiracetam 500mg twice daily'
      }));
      block.appendChild(twoCol(
        textInput({
          label: 'Start date',
          path: 'medication.entries.' + i + '.startDate',
          type: 'date'
        }),
        textInput({
          label: 'End date (leave blank if ongoing)',
          path: 'medication.entries.' + i + '.endDate',
          type: 'date'
        })
      ));
      if (state.medication.entries.length > 1) {
        const rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'button button-small';
        rm.setAttribute('data-variant', 'secondary');
        rm.textContent = 'Remove this medication';
        rm.addEventListener('click', () => {
          state.medication.entries.splice(i, 1);
          saveState();
          renderForm();
          updateProgress();
        });
        block.appendChild(rm);
      }
      card.appendChild(block);
    });

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'button button-small';
    addBtn.setAttribute('data-variant', 'secondary');
    addBtn.textContent = 'Add another medication';
    addBtn.addEventListener('click', () => {
      state.medication.entries.push({ name: '', startDate: '', endDate: '' });
      saveState();
      renderForm();
      updateProgress();
    });
    card.appendChild(addBtn);

    if (state.medication.entries.some((e) => hasText(e.name))) {
      card.appendChild(radioGroup({
        label: 'a) Does your medication make you drowsy or confused when driving?',
        path: 'medication.makesDrowsyOrConfused',
        options: YES_NO,
        required: true
      }));
    }
  }

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Question 8 — VP shunt',
    description: 'A ventriculoperitoneal (VP) shunt drains excess cerebrospinal fluid from the brain.'
  });
  card.appendChild(radioGroup({
    label: 'Have you ever had an insertion or upper end revision of a VP shunt or external ventricular drain?',
    path: 'vpShunt.hadVpShuntOrDrain',
    options: YES_NO,
    required: true
  }));
  if (state.vpShunt.hadVpShuntOrDrain === 'yes') {
    card.appendChild(textInput({
      label: 'Date of procedure',
      path: 'vpShunt.procedureDate',
      type: 'date',
      required: true
    }));
  }
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Question 9 — Daily living',
    description: 'Tell us whether you need help from another person with everyday tasks.'
  });
  card.appendChild(radioGroup({
    label: 'Do you need help from another person with your day-to-day living?',
    path: 'dailyLiving.needsHelp',
    options: YES_NO,
    required: true
  }));
  if (state.dailyLiving.needsHelp === 'yes') {
    card.appendChild(textArea({
      label: 'If Yes, please give details of how they help you',
      path: 'dailyLiving.helpDetails',
      rows: 3,
      required: true
    }));
  }
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Question 10 — Double vision (diplopia)',
    description: 'Diplopia means seeing two of an object.'
  });
  card.appendChild(radioGroup({
    label: 'Do you have double vision?',
    path: 'doubleVision.hasDoubleVision',
    options: YES_NO,
    required: true
  }));
  if (state.doubleVision.hasDoubleVision === 'yes') {
    card.appendChild(radioGroup({
      label: 'a) Is your double vision suppressed or controlled?',
      path: 'doubleVision.suppressedOrControlled',
      options: YES_NO,
      required: true
    }));
    if (state.doubleVision.suppressedOrControlled === 'yes') {
      card.appendChild(radioGroup({
        label: 'b) If Yes, how is it controlled?',
        path: 'doubleVision.correctionMethod',
        options: [
          { value: 'patch', label: 'Patch' },
          { value: 'prism', label: 'Prism' },
          { value: 'glasses-or-lenses', label: 'Glasses or lenses' },
          { value: 'other', label: 'Other' }
        ],
        required: true
      }));
      if (state.doubleVision.correctionMethod === 'other') {
        card.appendChild(textInput({
          label: 'Please describe the other method',
          path: 'doubleVision.correctionMethodOther',
          required: true
        }));
      }
    }
  }
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Question 11 — Eyesight',
    description: 'Tell us whether your condition has affected your eyesight.'
  });
  card.appendChild(radioGroup({
    label: 'Has your condition caused problems with your eyesight?',
    path: 'eyesight.hasEyesightProblems',
    options: YES_NO,
    required: true
  }));
  if (state.eyesight.hasEyesightProblems === 'yes') {
    card.appendChild(textArea({
      label: 'If Yes, please give details',
      path: 'eyesight.details',
      rows: 3,
      required: true
    }));
  }
  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Question 12 — Vehicle adaptations',
    description: 'Tell us about any special controls or automatic transmission you require.'
  });
  card.appendChild(radioGroup({
    label: 'Do you need to drive a vehicle fitted with special controls or automatic transmission?',
    path: 'vehicleAdaptations.needsAdaptations',
    options: YES_NO,
    required: true
  }));
  if (state.vehicleAdaptations.needsAdaptations === 'yes') {
    card.appendChild(radioGroup({
      label: 'a) Have you told us before that you need special controls or automatic transmission?',
      path: 'vehicleAdaptations.previouslyDeclared',
      options: YES_NO,
      required: true
    }));
    if (state.vehicleAdaptations.previouslyDeclared === 'yes') {
      card.appendChild(radioGroup({
        label: 'b) Since your last licence was issued, have you had any additional controls fitted to your vehicle?',
        path: 'vehicleAdaptations.additionalControlsFitted',
        options: YES_NO,
        required: true
      }));
    }
  }

  const note = document.createElement('p');
  note.className = 'info-note';
  note.textContent =
    'If you have any relevant hospital notes about your medical condition, please send copies with this form.';
  card.appendChild(note);
  return card;
}

function renderStep13() {
  const card = sectionCard({
    stepNumber: 13,
    title: "Applicant's authorisation",
    description: 'Please read the declaration carefully before signing.'
  });

  const decText = document.createElement('div');
  decText.className = 'declaration-text';
  decText.innerHTML =
    '<p>I authorise my doctor(s) and other healthcare professionals who have or have had' +
    ' involvement in my care to release reports and medical information about me to' +
    " medical advisers at the DVLA, and I authorise the DVLA's medical advisers to share" +
    ' relevant information with my doctor(s).</p>' +
    '<p>I declare that the information I have given is true and complete to the best of my' +
    ' knowledge and belief. I understand that it is a criminal offence to make a false' +
    ' declaration to obtain a driving licence.</p>';
  card.appendChild(decText);

  card.appendChild(checkbox({
    label: 'I have read and accept the declaration above.',
    path: 'authorisation.declarationAccepted'
  }));

  card.appendChild(textInput({
    label: 'Name',
    path: 'authorisation.name',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Date',
    path: 'authorisation.signatureDate',
    type: 'date',
    required: true
  }));

  const corrHeader = document.createElement('h3');
  corrHeader.className = 'subsection-title';
  corrHeader.textContent = 'Correspondence';
  card.appendChild(corrHeader);

  card.appendChild(radioGroup({
    label: 'Do you consent to electronic correspondence (email)?',
    path: 'authorisation.electronicCorrespondenceConsent',
    options: YES_NO,
    required: true
  }));

  if (state.authorisation.electronicCorrespondenceConsent === 'yes') {
    const channels = [
      { value: 'email', label: 'Email' },
      { value: 'sms', label: 'SMS (Text)' }
    ];
    card.appendChild(radioGroup({
      label: 'Contact preference from DVLA',
      path: 'authorisation.dvlaContactPreference',
      options: channels,
      required: true
    }));
    card.appendChild(radioGroup({
      label: 'Contact preference from a healthcare professional on behalf of DVLA',
      path: 'authorisation.healthcareContactPreference',
      options: channels,
      required: true
    }));
  }

  return card;
}

// ----------------------------------------------------------------------
// Step-list
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, title: 'Personal' },
  { step: 2, title: 'Healthcare' },
  { step: 3, title: 'History' },
  { step: 4, title: 'Provider' },
  { step: 5, title: 'Blackouts' },
  { step: 6, title: 'Seizures' },
  { step: 7, title: 'Medication' },
  { step: 8, title: 'VP shunt' },
  { step: 9, title: 'Daily living' },
  { step: 10, title: 'Diplopia' },
  { step: 11, title: 'Eyesight' },
  { step: 12, title: 'Adaptations' },
  { step: 13, title: 'Authorisation' }
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
    li.setAttribute('aria-label', 'Section ' + def.step + ': ' + def.title);
    li.innerHTML = '<span>' + esc(def.title) + '</span>';
    li.addEventListener('click', () => {
      const target = document.getElementById('step-' + def.step);
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
    const li = ol.querySelector('[data-step="' + def.step + '"]');
    if (!li) continue;
    const a = sectionAnswered[def.step] || 0;
    const t = sectionTotal[def.step] || 0;
    if (t > 0 && a >= t) {
      li.dataset.status = 'finished';
      li.removeAttribute('aria-current');
    } else if (a > 0) {
      li.dataset.status = 'in-progress';
      if (firstUnfinished === -1) firstUnfinished = def.step;
    } else {
      li.dataset.status = 'waiting';
      li.removeAttribute('aria-current');
      if (firstUnfinished === -1) firstUnfinished = def.step;
    }
  }
  if (firstUnfinished === -1) firstUnfinished = STEP_DEFINITIONS[0].step;
  const current = ol.querySelector('[data-step="' + firstUnfinished + '"]');
  if (current) {
    current.setAttribute('aria-current', 'step');
    if (current.dataset.status === 'waiting') {
      current.dataset.status = 'in-progress';
    }
  }
  ol.dataset.current = String(firstUnfinished - 1);
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

function updateProgress() {
  const result = validateB1(state);
  const total = result.totalRequired;
  const answered = result.totalSatisfied;
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) {
    text.textContent = answered + ' of ' + total + ' required fields answered (' + percent + '%)';
  }

  // Map section -> rendered step number (best-effort mapping for step-list)
  const SECTION_TO_STEP = {
    personalDetails: 1,
    healthcareProfessionals: 2,
    conditionHistory: 3,
    treatmentProvider: 4,
    blackouts: 5,
    seizures: 6,
    medication: 7,
    vpShunt: 8,
    dailyLiving: 9,
    doubleVision: 10,
    eyesight: 11,
    vehicleAdaptations: 12,
    authorisation: 13
  };
  const sectionAnswered = {};
  const sectionTotal = {};
  if (result.sections) {
    for (const s of result.sections) {
      const step = SECTION_TO_STEP[s.section];
      if (step) {
        sectionTotal[step] = (sectionTotal[step] || 0) + (s.required || 0);
        sectionAnswered[step] = (sectionAnswered[step] || 0) + (s.satisfied || 0);
      }
    }
  }
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Validation UI (per-field + error summary)
// ----------------------------------------------------------------------

function clearFieldError(id) {
  const el = document.getElementById(id + '-error');
  if (el) el.textContent = '';
  const input = document.getElementById(id);
  if (input) input.removeAttribute('aria-invalid');
  const fs = document.getElementById(id + '-fieldset');
  if (fs) fs.removeAttribute('aria-invalid');
}

function setFieldError(id, message) {
  const el = document.getElementById(id + '-error');
  if (el) el.textContent = message;
  const input = document.getElementById(id);
  if (input) input.setAttribute('aria-invalid', 'true');
}

function validateForm() {
  const errors = [];
  // Find all currently rendered fields with data-required and check for value
  document.querySelectorAll('[data-required]').forEach((el) => {
    // Only consider inputs/selects/textarea (not labels)
    const tag = (el.tagName || '').toLowerCase();
    if (tag !== 'input' && tag !== 'select' && tag !== 'textarea') return;
    const id = el.id;
    if (!id) return;
    let missing = false;
    if (tag === 'input' && el.type === 'radio') {
      // Group of radios with same name
      const name = el.name;
      const checked = document.querySelector('input[type="radio"][name="' + name + '"]:checked');
      if (!checked) missing = true;
      if (missing) {
        // Map group id (from name) to its fieldset and error span
        const groupId = name;
        errors.push({ id: groupId, message: 'Please answer this question.' });
        setFieldError(groupId, 'Please answer this question.');
      }
      return;
    }
    if (tag === 'input' && el.type === 'checkbox') {
      if (!el.checked) missing = true;
    } else {
      if (el.value == null || String(el.value).trim() === '') missing = true;
    }
    if (missing) {
      errors.push({ id: id, message: 'Please complete this field.' });
      setFieldError(id, 'Please complete this field.');
    } else {
      clearFieldError(id);
    }
  });
  // De-dupe by id
  const seen = new Set();
  const uniq = [];
  for (const e of errors) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    uniq.push(e);
  }
  renderErrorSummary(uniq);
  return uniq;
}

function renderErrorSummary(errors) {
  const summary = document.getElementById('error-summary');
  if (!summary) return;
  if (!errors || errors.length === 0) {
    summary.hidden = true;
    summary.innerHTML = '';
    return;
  }
  summary.hidden = false;
  summary.innerHTML =
    '<strong>Please correct the following:</strong>' +
    '<ul>' +
    errors.map((e) =>
      '<li><a href="#' + esc(e.id) + '">' + esc(e.message) + '</a></li>'
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
    case 'urgent': return 'flag-urgent';
    case 'high': return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const { validation, flags, timestamp } = lastResult;
  const out = document.getElementById('report');
  if (!out) return;

  const completenessBadge = validation.complete
    ? '<span class="completeness-badge complete">Complete</span>'
    : '<span class="completeness-badge incomplete">Incomplete</span>';

  const sectionRows = validation.sections.map((s) => {
    const missingItems = s.missing.length === 0
      ? '<span class="muted">All required fields completed.</span>'
      : '<ul class="missing-list">' + s.missing.map(
          (m) => '<li>' + esc(m.id) + ' — ' + esc(m.description) + '</li>'
        ).join('') + '</ul>';
    return '<tr>' +
      '<th scope="row">' + esc(sectionLabel(s.section)) + '</th>' +
      '<td>' + s.satisfied + ' / ' + s.required + '</td>' +
      '<td>' + missingItems + '</td>' +
      '</tr>';
  }).join('');

  const flagsList = flags.length === 0
    ? '<p class="muted">No flagged issues raised.</p>'
    : '<ul class="flags">' +
      flags.map((f) =>
        '<li class="' + priorityClass(f.priority) + '">' +
        '<span class="flag-priority">' + esc(priorityLabel(f.priority).toUpperCase()) + '</span>' +
        '<span class="flag-category">' + esc(f.category) + '</span>' +
        '<span class="flag-message">' + esc(f.message) + '</span>' +
        '</li>'
      ).join('') +
      '</ul>';

  out.innerHTML =
    '<h2>DVLA B1 — submission report</h2>' +
    '<p class="muted">Generated ' + esc(new Date(timestamp).toLocaleString()) + '</p>' +
    '<div class="completeness">' + completenessBadge +
    '<span>' + validation.totalSatisfied + ' of ' + validation.totalRequired +
    ' required fields answered.</span></div>' +
    '<h3>Section completeness</h3>' +
    '<table class="sections-table">' +
    '<thead><tr>' +
    '<th scope="col">Section</th>' +
    '<th scope="col">Answered</th>' +
    '<th scope="col">Missing items</th>' +
    '</tr></thead><tbody>' + sectionRows + '</tbody></table>' +
    '<h3>Flagged issues</h3>' + flagsList +
    '<div class="report-actions">' +
    '<button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>' +
    '</div>';
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const startOverBtn = document.getElementById('start-over-btn');
  if (startOverBtn) startOverBtn.addEventListener('click', startOver);
}

function submitForm() {
  validateForm();
  const validation = validateB1(state);
  const flags = detectFlaggedIssues(state);
  lastResult = {
    validation,
    flags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh DVLA B1 form?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const out = document.getElementById('report');
  if (out) out.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Bootstrap
// ----------------------------------------------------------------------

const RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7, renderStep8,
  renderStep9, renderStep10, renderStep11, renderStep12,
  renderStep13
];

function renderForm() {
  const host = document.getElementById('form-sections');
  if (!host) return;
  const scrollY = window.scrollY;
  host.innerHTML = '';
  for (const r of RENDERERS) host.appendChild(r());
  window.scrollTo({ top: scrollY });
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
