import { calculateCompleteness } from './completeness-grader.js';
import { detectFlaggedIssues } from './flagged-issues.js';
import { completenessLevelClass, completenessLevelLabel, emptyStatement, placeLabel } from './types.js';

// Advance Statement About Care - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure completeness scoring engine and renders an inline report.
// State is persisted to localStorage so a partial fill survives a reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'advance-statement-about-care.front-end-form-with-html.v1';

/** @returns {import('./types.js').StatementData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  // Merge over a fresh empty so any newly-added fields default correctly.
  const fresh = emptyStatement();

  for (const key of Object.keys(fresh)) {
    if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null) {
      if (Array.isArray(fresh[key])) {
        fresh[key] = Array.isArray(parsed[key]) ? parsed[key] : fresh[key];
      } else {
        fresh[key] = { ...fresh[key], ...parsed[key] };
      }
    }
  }
  // peopleImportantToMe.people is a nested array; preserve it explicitly.
  if (parsed && parsed.peopleImportantToMe && Array.isArray(parsed.peopleImportantToMe.people)) {
    fresh.peopleImportantToMe.people = parsed.peopleImportantToMe.people.map((p) => ({
      name: p?.name ?? '',
      relationship: p?.relationship ?? '',
      telephone: p?.telephone ?? '',
      email: p?.email ?? '',
      role: p?.role ?? ''
    }));
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStatement();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved statement; starting fresh.', e);
    return emptyStatement();
  }
}

/** @param {import('./types.js').StatementData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save statement to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored statement.', e);
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

/** @type {import('./types.js').StatementData} */
let state = loadState();

/** @type {import('./types.js').CompletenessResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'advance-statement-about-care',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the completeness report.</p>';
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

/**
 * Build a labelled text input.
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

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error"></span>
  `;

  const input = wrapper.querySelector('input');
  input.setAttribute('aria-describedby', `${id}-error`);
  input.addEventListener('input', () => {
    setField(opts.section, opts.field, input.value);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Build a labelled multi-line text area.
 * @param {{ label: string, section: string, field: string, rows?: number,
 *           placeholder?: string, hint?: string, required?: boolean }} opts
 */
function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      aria-describedby="${id}-error"
      class="text-area-input">${esc(value)}</textarea>
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => {
    setField(opts.section, opts.field, ta.value);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Build a radio group.
 * @param {{ label: string, section: string, field: string, required?: boolean,
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
  card.innerHTML = `
    <legend class="fieldset-legend">
      <span class="section-step">Section ${opts.stepNumber} of 9</span>
      <span class="section-title">${esc(opts.title)}</span>
      ${desc}
    </legend>
  `;
  return card;
}

/** Build a callout (warning / info). */
function callout(kind, html) {
  const div = document.createElement('div');
  div.className = `callout callout-${kind}`;
  div.innerHTML = html;
  return div;
}

/** Visual subheading inside a section card. */
function subheading(text) {
  const h = document.createElement('h3');
  h.className = 'section-subheading';
  h.textContent = text;
  return h;
}

// ----------------------------------------------------------------------
// People-Important-To-Me list editor
// ----------------------------------------------------------------------

function peopleEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.peopleImportantToMe.people;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No people added yet. Click the button below to add someone important to you.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'person-row';
      r.innerHTML = `
        <div class="person-row-header">
          <span>Person ${idx + 1}</span>
          <button type="button" class="button" data-variant="remove" aria-label="Remove person">Remove</button>
        </div>
        <div class="two-col">
          <div class="field">
            <label>Name</label>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="Full name">
          </div>
          <div class="field">
            <label>Relationship</label>
            <input type="text" class="text-input" data-key="relationship" value="${esc(row.relationship)}" placeholder="e.g. Daughter, Friend, Vicar">
          </div>
          <div class="field">
            <label>Telephone</label>
            <input type="text" class="text-input" data-key="telephone" value="${esc(row.telephone)}" placeholder="Contact number">
          </div>
          <div class="field">
            <label>Email</label>
            <input type="text" class="text-input" data-key="email" value="${esc(row.email)}" placeholder="Email address">
          </div>
        </div>
        <div class="field">
          <label>Role in your care</label>
          <input type="text" class="text-input" data-key="role" value="${esc(row.role)}" placeholder="e.g. Main contact for care decisions, spiritual support, to be informed">
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
      r.querySelector('.btn-remove').addEventListener('click', () => {
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
    addBtn.textContent = '+ Add Person';
    addBtn.addEventListener('click', () => {
      rows.push({ name: '', relationship: '', telephone: '', email: '', role: '' });
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

const placeOptions = [
  { value: 'home', label: 'Home' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'hospice', label: 'Hospice' },
  { value: 'care-home', label: 'Care Home' },
  { value: 'no-preference', label: 'No Preference' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Personal Information',
    description: 'Your basic details for identification and contact purposes.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'personalInformation', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'personalInformation', field: 'lastName', required: true }));
  card.appendChild(grid);

  card.appendChild(textInput({ label: 'Date of Birth', section: 'personalInformation', field: 'dateOfBirth', type: 'date', required: true }));
  card.appendChild(textInput({ label: 'NHS Number', section: 'personalInformation', field: 'nhsNumber', placeholder: 'e.g. 943 476 5919' }));
  card.appendChild(textInput({ label: 'Address', section: 'personalInformation', field: 'address', required: true }));
  card.appendChild(textInput({ label: 'Postcode', section: 'personalInformation', field: 'postcode' }));
  card.appendChild(textInput({ label: 'Telephone', section: 'personalInformation', field: 'telephone' }));
  card.appendChild(textInput({ label: 'Email', section: 'personalInformation', field: 'email', type: 'email' }));

  card.appendChild(subheading('GP Details'));
  card.appendChild(textInput({ label: 'GP Name', section: 'personalInformation', field: 'gpName' }));
  card.appendChild(textInput({ label: 'GP Practice', section: 'personalInformation', field: 'gpPractice' }));
  card.appendChild(textInput({ label: 'GP Telephone', section: 'personalInformation', field: 'gpTelephone' }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Statement Context',
    description: 'Help us understand why you are making this advance statement and when it should apply.'
  });

  card.appendChild(textArea({
    label: 'Why are you making this advance statement?',
    section: 'statementContext', field: 'reasonForStatement', required: true,
    placeholder: 'e.g. I have been diagnosed with a progressive condition and wish to record my preferences while I have capacity…',
    rows: 4
  }));
  card.appendChild(textArea({
    label: 'Current diagnosis or medical conditions',
    section: 'statementContext', field: 'currentDiagnosis',
    placeholder: 'List any current medical conditions or diagnoses…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Your understanding of your condition',
    section: 'statementContext', field: 'understandingOfCondition',
    placeholder: 'Describe what you understand about your condition and its likely progression…',
    rows: 4
  }));
  card.appendChild(textArea({
    label: 'When should this statement apply?',
    section: 'statementContext', field: 'whenStatementShouldApply', required: true,
    placeholder: 'e.g. When I am no longer able to make decisions for myself, or when I can no longer communicate my wishes…',
    rows: 4
  }));

  card.appendChild(radioGroup({
    label: 'Have you made any previous advance statements?',
    section: 'statementContext', field: 'previousAdvanceStatements', options: yesNo
  }));
  const prevDetails = document.createElement('div');
  prevDetails.dataset.conditional = 'statementContext.previousAdvanceStatements=yes';
  prevDetails.appendChild(textArea({
    label: 'Details of previous advance statements',
    section: 'statementContext', field: 'previousStatementDetails',
    placeholder: 'Where are they held? This statement supersedes any previous versions.',
    rows: 3
  }));
  card.appendChild(prevDetails);

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Values & Beliefs',
    description: 'Share what matters most to you - your beliefs, values and what gives your life meaning.'
  });

  card.appendChild(textArea({
    label: 'Religious beliefs', section: 'valuesBeliefs', field: 'religiousBeliefs',
    placeholder: 'Describe any religious beliefs that are important to you and may affect your care…', rows: 3
  }));
  card.appendChild(textArea({
    label: 'Spiritual beliefs', section: 'valuesBeliefs', field: 'spiritualBeliefs',
    placeholder: 'Describe any spiritual beliefs or practices important to you…', rows: 3
  }));
  card.appendChild(textArea({
    label: 'Cultural values', section: 'valuesBeliefs', field: 'culturalValues',
    placeholder: 'Describe any cultural values or practices that are important to you…', rows: 3
  }));
  card.appendChild(textArea({
    label: 'Quality of life priorities', section: 'valuesBeliefs', field: 'qualityOfLifePriorities', required: true,
    placeholder: 'What does quality of life mean to you? What would make life no longer worth living?', rows: 4
  }));
  card.appendChild(textArea({
    label: 'What makes life meaningful to you?', section: 'valuesBeliefs', field: 'whatMakesLifeMeaningful',
    placeholder: 'e.g. Family, hobbies, music, nature, social connections…', rows: 4
  }));
  card.appendChild(textArea({
    label: 'Important traditions or rituals', section: 'valuesBeliefs', field: 'importantTraditions',
    placeholder: 'Any traditions, celebrations, or rituals that are important to maintain…', rows: 3
  }));
  card.appendChild(textArea({
    label: 'Views on dying and death', section: 'valuesBeliefs', field: 'viewsOnDying',
    placeholder: 'How you feel about dying and what you would wish for at end of life…', rows: 4
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Care Preferences',
    description: 'Where and how you would like to be cared for.'
  });

  card.appendChild(radioGroup({
    label: 'Preferred place of care', section: 'carePreferences',
    field: 'preferredPlaceOfCare', options: placeOptions, required: true
  }));
  card.appendChild(radioGroup({
    label: 'Preferred place of death', section: 'carePreferences',
    field: 'preferredPlaceOfDeath', options: placeOptions
  }));

  card.appendChild(textArea({
    label: 'Personal comfort preferences', section: 'carePreferences', field: 'personalComfortPreferences',
    placeholder: 'e.g. I like to have music playing, a particular blanket, scented candles…', rows: 4
  }));
  card.appendChild(textArea({
    label: 'Daily routine preferences', section: 'carePreferences', field: 'dailyRoutinePreferences',
    placeholder: 'e.g. I like to wake early, have tea at certain times, watch particular TV programmes…', rows: 4
  }));
  card.appendChild(textArea({
    label: 'Dietary requirements and preferences', section: 'carePreferences', field: 'dietaryRequirements',
    placeholder: 'Any dietary requirements, favourite foods, or things you dislike…', rows: 3
  }));
  card.appendChild(textArea({
    label: 'Clothing preferences', section: 'carePreferences', field: 'clothingPreferences',
    placeholder: 'What you prefer to wear, items that are important to you…', rows: 3
  }));
  card.appendChild(textArea({
    label: 'Hygiene and personal care preferences', section: 'carePreferences', field: 'hygienePreferences',
    placeholder: 'e.g. Bath vs shower preference, products you use, hair care…', rows: 3
  }));
  card.appendChild(textArea({
    label: 'Environment preferences', section: 'carePreferences', field: 'environmentPreferences',
    placeholder: 'e.g. Temperature, lighting, noise level, having a window open…', rows: 3
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Medical Treatment Wishes',
    description: 'Your preferences about medical treatments. These are wishes, not legally binding refusals (which require an Advance Decision to Refuse Treatment / ADRT).'
  });

  card.appendChild(callout('warning',
    '<strong>Important:</strong> An advance statement records your wishes and preferences but is not the same as an Advance Decision to Refuse Treatment (ADRT), which is legally binding under the Mental Capacity Act 2005. Your care team must take these wishes into account but they are not legally obliged to follow them.'
  ));

  card.appendChild(textArea({
    label: 'Pain management preferences', section: 'medicalTreatmentWishes', field: 'painManagementPreferences', required: true,
    placeholder: 'e.g. I wish to be kept comfortable and pain-free, even if this may shorten my life…', rows: 4
  }));
  card.appendChild(textArea({
    label: 'Nutrition and hydration wishes', section: 'medicalTreatmentWishes', field: 'nutritionHydrationWishes',
    placeholder: 'Your wishes about eating, drinking, and artificial nutrition/hydration…', rows: 4
  }));
  card.appendChild(textArea({
    label: 'Ventilation wishes', section: 'medicalTreatmentWishes', field: 'ventilationWishes',
    placeholder: 'Your wishes about mechanical ventilation or breathing support…', rows: 4
  }));
  card.appendChild(textArea({
    label: 'Resuscitation wishes', section: 'medicalTreatmentWishes', field: 'resuscitationWishes', required: true,
    placeholder: 'Your wishes about CPR and resuscitation attempts. Remember: this is an expression of wishes, not a legally binding DNACPR order…', rows: 4
  }));
  card.appendChild(textArea({
    label: 'Antibiotics wishes', section: 'medicalTreatmentWishes', field: 'antibioticsWishes',
    placeholder: 'Your wishes about antibiotic treatment, e.g. for comfort only vs. to treat infections…', rows: 3
  }));
  card.appendChild(textArea({
    label: 'Hospitalisation wishes', section: 'medicalTreatmentWishes', field: 'hospitalisationWishes',
    placeholder: 'Your preferences about being admitted to hospital…', rows: 3
  }));
  card.appendChild(textArea({
    label: 'Blood transfusion wishes', section: 'medicalTreatmentWishes', field: 'bloodTransfusionWishes',
    placeholder: 'Your wishes about receiving blood transfusions…', rows: 3
  }));
  card.appendChild(textArea({
    label: 'Organ donation wishes', section: 'medicalTreatmentWishes', field: 'organDonationWishes',
    placeholder: 'Your wishes about organ donation…', rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Communication Preferences',
    description: 'How you prefer to communicate and be communicated with.'
  });

  card.appendChild(textInput({
    label: 'Preferred language', section: 'communicationPreferences', field: 'preferredLanguage',
    placeholder: 'e.g. English, Welsh, Urdu…'
  }));
  card.appendChild(textArea({
    label: 'Communication aids', section: 'communicationPreferences', field: 'communicationAids',
    placeholder: 'e.g. Hearing aid, reading glasses, communication board, large print…', rows: 3
  }));
  card.appendChild(textInput({
    label: 'How would you like to be addressed?', section: 'communicationPreferences', field: 'howToBeAddressed',
    placeholder: 'e.g. Jane, Mrs Smith, Dr Jones…'
  }));
  card.appendChild(textArea({
    label: 'Information sharing preferences', section: 'communicationPreferences', field: 'informationSharingPreferences',
    placeholder: 'Who should be told about your condition? Are there things you do or do not want to be told?', rows: 4
  }));

  card.appendChild(radioGroup({
    label: 'Do you need an interpreter?',
    section: 'communicationPreferences', field: 'interpreterNeeded', options: yesNo
  }));
  const interp = document.createElement('div');
  interp.dataset.conditional = 'communicationPreferences.interpreterNeeded=yes';
  interp.appendChild(textInput({
    label: 'Interpreter language', section: 'communicationPreferences', field: 'interpreterLanguage',
    placeholder: 'Which language?'
  }));
  card.appendChild(interp);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'People Important to Me',
    description: 'Family, friends, and others who are important in your life and care.'
  });

  card.appendChild(peopleEditor());

  card.appendChild(subheading('Pets'));
  card.appendChild(textArea({
    label: 'Details of any pets', section: 'peopleImportantToMe', field: 'petsDetails',
    placeholder: 'e.g. Labrador called Rosie, 5 years old…', rows: 2
  }));
  card.appendChild(textArea({
    label: 'Pet care arrangements', section: 'peopleImportantToMe', field: 'petCareArrangements',
    placeholder: 'Who will care for your pets if you are unable to?', rows: 2
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Practical Matters',
    description: 'Practical arrangements and wishes for your affairs.'
  });

  card.appendChild(textArea({
    label: 'Financial arrangements', section: 'practicalMatters', field: 'financialArrangements',
    placeholder: 'e.g. Who manages your finances? Bank details location, direct debits…', rows: 3
  }));
  card.appendChild(textArea({
    label: 'Property matters', section: 'practicalMatters', field: 'propertyMatters',
    placeholder: 'e.g. Ownership details, mortgage, keys location…', rows: 3
  }));
  card.appendChild(textArea({
    label: 'Pet care instructions', section: 'practicalMatters', field: 'petCareInstructions',
    placeholder: 'Detailed instructions for ongoing pet care…', rows: 3
  }));
  card.appendChild(textArea({
    label: 'Social media wishes', section: 'practicalMatters', field: 'socialMediaWishes',
    placeholder: 'What should happen to your social media accounts?', rows: 2
  }));
  card.appendChild(textArea({
    label: 'Personal belongings', section: 'practicalMatters', field: 'personalBelongings',
    placeholder: 'Any specific wishes about personal items, keepsakes, or belongings…', rows: 3
  }));
  card.appendChild(textArea({
    label: 'Funeral wishes', section: 'practicalMatters', field: 'funeralWishes',
    placeholder: 'Your preferences for funeral arrangements, burial vs cremation, service details…', rows: 4
  }));
  card.appendChild(textArea({
    label: 'Will details', section: 'practicalMatters', field: 'willDetails',
    placeholder: 'Where is your will held? Who is the executor? Solicitor details…', rows: 3
  }));
  card.appendChild(textArea({
    label: 'Power of Attorney details', section: 'practicalMatters', field: 'powerOfAttorneyDetails',
    placeholder: 'Details of any Lasting Power of Attorney (health and welfare, or property and financial affairs)…', rows: 4
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Signatures & Witnesses',
    description: 'Signing and witnessing your advance statement to confirm its validity.'
  });

  card.appendChild(callout('info',
    '<strong>About signing:</strong> Your advance statement is a record of your wishes. While it does not need to be witnessed to be valid, having a witness and healthcare professional acknowledgement strengthens the document and helps ensure your wishes are respected.'
  ));

  card.appendChild(subheading('Patient Signature'));
  card.appendChild(textInput({
    label: 'Your signature (type your full name)', section: 'signaturesWitnesses', field: 'patientSignature',
    placeholder: 'Type your full name as your signature', required: true
  }));
  card.appendChild(textInput({
    label: 'Date', section: 'signaturesWitnesses', field: 'patientSignatureDate', type: 'date', required: true
  }));

  card.appendChild(subheading('Witness Details'));
  card.appendChild(textInput({ label: 'Witness name', section: 'signaturesWitnesses', field: 'witnessName' }));
  card.appendChild(textInput({ label: 'Witness address', section: 'signaturesWitnesses', field: 'witnessAddress' }));
  card.appendChild(textInput({
    label: 'Witness signature (type full name)', section: 'signaturesWitnesses', field: 'witnessSignature',
    placeholder: 'Type full name as signature'
  }));
  card.appendChild(textInput({
    label: 'Witness signature date', section: 'signaturesWitnesses', field: 'witnessSignatureDate', type: 'date'
  }));

  card.appendChild(subheading('Review Date'));
  card.appendChild(textInput({
    label: 'When should this statement be reviewed?', section: 'signaturesWitnesses', field: 'reviewDate', type: 'date'
  }));
  const reviewHint = document.createElement('p');
  reviewHint.className = 'muted';
  reviewHint.style.marginTop = '-0.5rem';
  reviewHint.textContent =
    'It is recommended to review your advance statement at least once a year, or when your circumstances change.';
  card.appendChild(reviewHint);

  card.appendChild(subheading('Healthcare Professional Acknowledgement'));
  card.appendChild(textInput({
    label: 'Healthcare professional name', section: 'signaturesWitnesses', field: 'healthcareProfessionalName'
  }));
  card.appendChild(textInput({
    label: 'Role / position', section: 'signaturesWitnesses', field: 'healthcareProfessionalRole',
    placeholder: 'e.g. General Practitioner, Consultant'
  }));
  card.appendChild(textInput({
    label: 'Healthcare professional signature (type full name)', section: 'signaturesWitnesses',
    field: 'healthcareProfessionalSignature', placeholder: 'Type full name as signature'
  }));
  card.appendChild(textInput({
    label: 'Date', section: 'signaturesWitnesses', field: 'healthcareProfessionalDate', type: 'date'
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
  // Personal information
  ['personalInformation', 'firstName'],
  ['personalInformation', 'lastName'],
  ['personalInformation', 'dateOfBirth'],
  ['personalInformation', 'address'],
  ['personalInformation', 'nhsNumber'],
  ['personalInformation', 'gpName'],
  ['personalInformation', 'gpPractice'],
  // Statement context
  ['statementContext', 'reasonForStatement'],
  ['statementContext', 'whenStatementShouldApply'],
  ['statementContext', 'currentDiagnosis'],
  ['statementContext', 'previousAdvanceStatements'],
  // Values & beliefs
  ['valuesBeliefs', 'qualityOfLifePriorities'],
  ['valuesBeliefs', 'whatMakesLifeMeaningful'],
  // Care preferences
  ['carePreferences', 'preferredPlaceOfCare'],
  ['carePreferences', 'preferredPlaceOfDeath'],
  ['carePreferences', 'personalComfortPreferences'],
  // Medical treatment wishes
  ['medicalTreatmentWishes', 'painManagementPreferences'],
  ['medicalTreatmentWishes', 'resuscitationWishes'],
  ['medicalTreatmentWishes', 'nutritionHydrationWishes'],
  ['medicalTreatmentWishes', 'ventilationWishes'],
  ['medicalTreatmentWishes', 'antibioticsWishes'],
  // Communication preferences
  ['communicationPreferences', 'preferredLanguage'],
  ['communicationPreferences', 'howToBeAddressed'],
  ['communicationPreferences', 'interpreterNeeded'],
  // Practical matters
  ['practicalMatters', 'financialArrangements'],
  ['practicalMatters', 'powerOfAttorneyDetails'],
  // Signatures & witnesses
  ['signaturesWitnesses', 'patientSignature'],
  ['signaturesWitnesses', 'patientSignatureDate'],
  ['signaturesWitnesses', 'witnessName'],
  ['signaturesWitnesses', 'witnessSignature'],
  ['signaturesWitnesses', 'reviewDate'],
  ['signaturesWitnesses', 'healthcareProfessionalName'],
  ['signaturesWitnesses', 'healthcareProfessionalSignature']
];

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    const v = state[section]?.[field];
    if (v !== null && v !== undefined && v !== '') {
      answered++;
      sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
    }
  }
  // Add 1 slot for peopleImportantToMe.people list
  sectionTotal.peopleImportantToMe = (sectionTotal.peopleImportantToMe || 0) + 1;
  const peopleAnswered = state.peopleImportantToMe.people.some((p) => p.name.trim() !== '');
  if (peopleAnswered) {
    answered++;
    sectionAnswered.peopleImportantToMe = (sectionAnswered.peopleImportantToMe || 0) + 1;
  }
  const total = TRACKED_FIELDS.length + 1;
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
  { step: 1, section: 'personalInformation',     title: 'Personal' },
  { step: 2, section: 'statementContext',        title: 'Context' },
  { step: 3, section: 'valuesBeliefs',           title: 'Values' },
  { step: 4, section: 'carePreferences',         title: 'Care' },
  { step: 5, section: 'medicalTreatmentWishes',  title: 'Treatment' },
  { step: 6, section: 'communicationPreferences', title: 'Comms' },
  { step: 7, section: 'peopleImportantToMe',     title: 'People' },
  { step: 8, section: 'practicalMatters',        title: 'Practical' },
  { step: 9, section: 'signaturesWitnesses',     title: 'Signatures' }
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
    if (current.dataset.status === 'waiting') current.dataset.status = 'in-progress';
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
    <ul>${errors.map((e) => `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`).join('')}</ul>
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

  const { level, missingSections, flaggedIssues, completedCount, totalCount, timestamp } = lastResult;

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No flagged issues raised.</p>`
    : `
      <ul class="flags">
        ${flaggedIssues.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.message)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const missingRows = missingSections.map((s) => `
    <tr>
      <th scope="row">${esc(s.id)}</th>
      <td>${esc(s.section)}</td>
      <td>${esc(s.description)}</td>
      <td>${s.required ? '<span class="required-tag">REQUIRED</span>' : '<span class="optional-tag">OPTIONAL</span>'}</td>
    </tr>
  `).join('');

  const missingTable = missingSections.length === 0
    ? `<p class="muted">All sections completed.</p>`
    : `
      <table class="missing">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Section</th>
            <th scope="col">What is missing</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>${missingRows}</tbody>
      </table>
    `;

  const placeOfCare = placeLabel(state.carePreferences.preferredPlaceOfCare);
  const placeOfDeath = placeLabel(state.carePreferences.preferredPlaceOfDeath);

  out.innerHTML = `
    <h2>Advance Statement Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Completeness</h3>
    <p class="completeness-summary">
      <span class="completeness-badge ${completenessLevelClass(level)}">${esc(completenessLevelLabel(level))}</span>
      <span class="completeness-count">${completedCount} of ${totalCount} sections complete</span>
    </p>

    <h3>Care Preferences Summary</h3>
    <p class="muted" style="font-size: 0.9375rem;">
      Preferred place of care: <strong>${esc(placeOfCare)}</strong><br>
      Preferred place of death: <strong>${esc(placeOfDeath)}</strong>
    </p>

    <h3>Missing Sections</h3>
    ${missingTable}

    <h3>Flagged Issues</h3>
    ${flagsList}

    <div class="report-actions">
      <button type="button" id="print-btn" class="button" data-variant="secondary">Print / save PDF</button>
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
  document.getElementById('print-btn').addEventListener('click', () => window.print());
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  lastResult = calculateCompleteness(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh statement?')) return;
  clearState();
  state = emptyStatement();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the completeness report.</p>';
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
