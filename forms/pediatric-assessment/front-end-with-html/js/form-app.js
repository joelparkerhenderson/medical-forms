import { calculateDevelopmentalScreen } from './dev-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { devScreenClass, devScreenLabel, domainResultClass, domainResultLabel, emptyAssessment, formatAge, gestationalAgeCategory, percentileCategory } from './types.js';

// Pediatric Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure developmental-screen engine and renders an inline report.
// State is persisted to localStorage so a partial fill survives a reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'pediatric-assessment.front-end-form-with-html.v1';

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
  slug: 'pediatric-assessment',
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
    refreshAutoCalculatedReadouts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs progress, conditional visibility, and auto-calculated readouts.
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

/** Sub-section heading inside a card (e.g. "Child Information"). */
function subHeading(text, hint) {
  const div = document.createElement('div');
  div.className = 'list-section-header';
  div.innerHTML = `
    <h3>${esc(text)}</h3>
    ${hint ? `<p class="hint">${esc(hint)}</p>` : ''}
  `;
  return div;
}

// ----------------------------------------------------------------------
// Repeating-list editors (medications, allergies)
// ----------------------------------------------------------------------

/**
 * Editor for an array of {name, dose, frequency} medication rows on the
 * `currentMedications` section.
 *
 * @param {{ field: 'prescriptions' | 'otcMedications' | 'supplements',
 *           addLabel: string, emptyLabel: string }} opts
 */
function medicationListEditor(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.currentMedications[opts.field];
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = opts.emptyLabel;
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row med-row';
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Amoxicillin">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 250 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. TDS">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove">&times;</button>
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

/** Editor for an array of {allergen, reaction, severity} allergy rows. */
function allergyEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.currentMedications.allergies;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No allergies added. Proceed to next step if there are none.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row allergy-row';
      r.innerHTML = `
        <div class="list-grid allergy-grid">
          <label class="list-cell">
            <span>Allergen</span>
            <input type="text" class="text-input" data-key="allergen" value="${esc(row.allergen)}" placeholder="e.g. Peanuts">
          </label>
          <label class="list-cell">
            <span>Reaction</span>
            <input type="text" class="text-input" data-key="reaction" value="${esc(row.reaction)}" placeholder="e.g. Hives, swelling">
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
// Section renderers (1 per pediatric assessment step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const domainOptions = [
  { value: 'pass', label: 'Pass' },
  { value: 'concern', label: 'Concern' },
  { value: 'fail', label: 'Fail' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Child and parent/guardian information.'
  });

  card.appendChild(subHeading('Child Information'));

  const nameGrid = document.createElement('div');
  nameGrid.className = 'two-col';
  nameGrid.appendChild(textInput({ label: "Child's First Name", section: 'demographics', field: 'childFirstName', required: true }));
  nameGrid.appendChild(textInput({ label: "Child's Last Name", section: 'demographics', field: 'childLastName', required: true }));
  card.appendChild(nameGrid);

  card.appendChild(textInput({
    label: 'Date of Birth',
    section: 'demographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));

  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'demographics', field: 'sex',
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
    type: 'number', min: 0.5, max: 150, step: 0.1, unit: 'kg', required: true
  }));
  measurements.appendChild(textInput({
    label: 'Height', section: 'demographics', field: 'height',
    type: 'number', min: 30, max: 200, step: 0.1, unit: 'cm', required: true
  }));
  measurements.appendChild(textInput({
    label: 'Head Circumference', section: 'demographics', field: 'headCircumference',
    type: 'number', min: 20, max: 65, step: 0.1, unit: 'cm'
  }));
  card.appendChild(measurements);

  const sep = document.createElement('hr');
  sep.className = 'card-divider';
  card.appendChild(sep);

  card.appendChild(subHeading('Parent/Guardian Information'));
  card.appendChild(textInput({
    label: 'Parent/Guardian Name',
    section: 'demographics', field: 'parentGuardianName', required: true
  }));
  card.appendChild(textInput({
    label: 'Relationship to Child',
    section: 'demographics', field: 'parentGuardianRelationship', required: true
  }));

  const contactGrid = document.createElement('div');
  contactGrid.className = 'two-col';
  contactGrid.appendChild(textInput({
    label: 'Phone Number',
    section: 'demographics', field: 'parentGuardianPhone', type: 'tel'
  }));
  contactGrid.appendChild(textInput({
    label: 'Email',
    section: 'demographics', field: 'parentGuardianEmail', type: 'email'
  }));
  card.appendChild(contactGrid);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Birth History',
    description: 'Details about the child\u2019s birth.'
  });

  card.appendChild(textInput({
    label: 'Gestational Age at Birth', section: 'birthHistory', field: 'gestationalAge',
    type: 'number', min: 20, max: 44, unit: 'weeks', required: true
  }));
  card.appendChild(textInput({
    label: 'Birth Weight', section: 'birthHistory', field: 'birthWeight',
    type: 'number', min: 0.3, max: 7, step: 0.01, unit: 'kg', required: true
  }));

  card.appendChild(selectInput({
    label: 'Delivery Type', section: 'birthHistory', field: 'deliveryType',
    options: [
      { value: 'vaginal', label: 'Vaginal' },
      { value: 'caesarean-elective', label: 'Caesarean (Elective)' },
      { value: 'caesarean-emergency', label: 'Caesarean (Emergency)' },
      { value: 'assisted', label: 'Assisted (Forceps/Vacuum)' }
    ]
  }));

  const apgarGrid = document.createElement('div');
  apgarGrid.className = 'two-col';
  apgarGrid.appendChild(textInput({
    label: 'APGAR Score (1 minute)', section: 'birthHistory', field: 'apgarOneMinute',
    type: 'number', min: 0, max: 10
  }));
  apgarGrid.appendChild(textInput({
    label: 'APGAR Score (5 minutes)', section: 'birthHistory', field: 'apgarFiveMinutes',
    type: 'number', min: 0, max: 10
  }));
  card.appendChild(apgarGrid);

  card.appendChild(radioGroup({
    label: 'Was there a NICU stay?',
    section: 'birthHistory', field: 'nicuStay', options: yesNo
  }));
  const nicuDur = document.createElement('div');
  nicuDur.dataset.conditional = 'birthHistory.nicuStay=yes';
  nicuDur.appendChild(textInput({
    label: 'Duration of NICU stay', section: 'birthHistory', field: 'nicuDuration',
    type: 'number', min: 1, max: 365, unit: 'days'
  }));
  card.appendChild(nicuDur);

  card.appendChild(radioGroup({
    label: 'Were there any birth complications?',
    section: 'birthHistory', field: 'birthComplications', options: yesNo
  }));
  const compDetails = document.createElement('div');
  compDetails.dataset.conditional = 'birthHistory.birthComplications=yes';
  compDetails.appendChild(textArea({
    label: 'Please describe the complications',
    section: 'birthHistory', field: 'birthComplicationDetails'
  }));
  card.appendChild(compDetails);

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Growth & Nutrition',
    description: 'Growth percentiles and feeding information.'
  });

  const grid = document.createElement('div');
  grid.className = 'three-col';

  function percentileWithCategory(label, field) {
    const wrap = document.createElement('div');
    wrap.appendChild(textInput({
      label, section: 'growthNutrition', field,
      type: 'number', min: 0, max: 100, step: 1
    }));
    const cat = document.createElement('p');
    cat.className = 'percentile-category';
    cat.id = `${field}-category`;
    cat.textContent = percentileCategory(state.growthNutrition[field]);
    wrap.appendChild(cat);
    return wrap;
  }

  grid.appendChild(percentileWithCategory('Weight Percentile', 'weightPercentile'));
  grid.appendChild(percentileWithCategory('Height Percentile', 'heightPercentile'));
  grid.appendChild(percentileWithCategory('Head Circ. Percentile', 'headCircumferencePercentile'));
  card.appendChild(grid);

  card.appendChild(selectInput({
    label: 'Feeding Type', section: 'growthNutrition', field: 'feedingType',
    options: [
      { value: 'breast', label: 'Breastfed' },
      { value: 'formula', label: 'Formula Fed' },
      { value: 'mixed', label: 'Mixed Feeding' },
      { value: 'solid', label: 'Solid Foods' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Are there any dietary concerns?',
    section: 'growthNutrition', field: 'dietaryConcerns', options: yesNo
  }));
  const dietDetails = document.createElement('div');
  dietDetails.dataset.conditional = 'growthNutrition.dietaryConcerns=yes';
  dietDetails.appendChild(textArea({
    label: 'Please describe dietary concerns',
    section: 'growthNutrition', field: 'dietaryConcernDetails'
  }));
  card.appendChild(dietDetails);

  card.appendChild(radioGroup({
    label: 'Has failure to thrive been identified?',
    section: 'growthNutrition', field: 'failureToThrive', options: yesNo
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Developmental Milestones',
    description: 'Age-appropriate developmental screening across five domains.'
  });

  const ageBanner = document.createElement('div');
  ageBanner.className = 'age-banner';
  ageBanner.id = 'age-banner';
  const initialAge = formatAge(state.demographics.dateOfBirth);
  if (initialAge) {
    ageBanner.innerHTML = `Child's age: <strong>${esc(initialAge)}</strong> — assess milestones appropriate for this age.`;
  } else {
    ageBanner.style.display = 'none';
  }
  card.appendChild(ageBanner);

  function domain(label, field, notesField) {
    const block = document.createElement('div');
    block.className = 'dev-domain';
    block.appendChild(radioGroup({
      label, section: 'developmentalMilestones', field, options: domainOptions
    }));
    const notes = document.createElement('div');
    notes.dataset.conditionalAny = `developmentalMilestones.${field}=concern,fail`;
    notes.appendChild(textArea({
      label: `${label.split(' (')[0]} notes`,
      section: 'developmentalMilestones', field: notesField,
      placeholder: 'Describe specific milestones not met...'
    }));
    block.appendChild(notes);
    card.appendChild(block);
  }

  domain('Gross Motor (e.g., sitting, crawling, walking, running)', 'grossMotor', 'grossMotorNotes');
  domain('Fine Motor (e.g., grasping, drawing, writing)', 'fineMotor', 'fineMotorNotes');
  domain('Language (e.g., babbling, first words, sentences)', 'language', 'languageNotes');
  domain('Social-Emotional (e.g., eye contact, social smile, play)', 'socialEmotional', 'socialEmotionalNotes');
  domain('Cognitive (e.g., problem-solving, memory, attention)', 'cognitive', 'cognitiveNotes');

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Immunization Status',
    description: 'Vaccination record and any concerns.'
  });

  card.appendChild(radioGroup({
    label: 'Are the child\u2019s immunizations up to date?',
    section: 'immunizationStatus', field: 'upToDate', options: yesNo
  }));
  const missing = document.createElement('div');
  missing.dataset.conditional = 'immunizationStatus.upToDate=no';
  missing.appendChild(textArea({
    label: 'Which vaccinations are missing?',
    section: 'immunizationStatus', field: 'missingVaccinations',
    placeholder: 'e.g., MMR, DTP, Polio...'
  }));
  card.appendChild(missing);

  card.appendChild(radioGroup({
    label: 'Has the child had any adverse reactions to vaccinations?',
    section: 'immunizationStatus', field: 'adverseReactions', options: yesNo
  }));
  const adverse = document.createElement('div');
  adverse.dataset.conditional = 'immunizationStatus.adverseReactions=yes';
  adverse.appendChild(textArea({
    label: 'Please describe the adverse reaction(s)',
    section: 'immunizationStatus', field: 'adverseReactionDetails'
  }));
  card.appendChild(adverse);

  card.appendChild(radioGroup({
    label: 'Are there any vaccination exemptions?',
    section: 'immunizationStatus', field: 'exemptions', options: yesNo
  }));
  const exempt = document.createElement('div');
  exempt.dataset.conditional = 'immunizationStatus.exemptions=yes';
  exempt.appendChild(textArea({
    label: 'Please describe the exemption(s)',
    section: 'immunizationStatus', field: 'exemptionDetails',
    placeholder: 'e.g., medical, religious, philosophical...'
  }));
  card.appendChild(exempt);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Medical History',
    description: 'Previous and ongoing medical conditions.'
  });

  card.appendChild(radioGroup({
    label: 'Does the child have any chronic conditions?',
    section: 'medicalHistory', field: 'chronicConditions', options: yesNo
  }));
  const chronic = document.createElement('div');
  chronic.dataset.conditional = 'medicalHistory.chronicConditions=yes';
  chronic.appendChild(textArea({
    label: 'Please describe chronic conditions',
    section: 'medicalHistory', field: 'chronicConditionDetails',
    placeholder: 'e.g., asthma, eczema, epilepsy...'
  }));
  card.appendChild(chronic);

  card.appendChild(radioGroup({
    label: 'Has the child had any previous hospitalizations?',
    section: 'medicalHistory', field: 'previousHospitalizations', options: yesNo
  }));
  const hosp = document.createElement('div');
  hosp.dataset.conditional = 'medicalHistory.previousHospitalizations=yes';
  hosp.appendChild(textArea({
    label: 'Please describe hospitalizations',
    section: 'medicalHistory', field: 'hospitalizationDetails',
    placeholder: 'Reason, duration, and dates...'
  }));
  card.appendChild(hosp);

  card.appendChild(radioGroup({
    label: 'Has the child had any previous surgeries?',
    section: 'medicalHistory', field: 'previousSurgeries', options: yesNo
  }));
  const surg = document.createElement('div');
  surg.dataset.conditional = 'medicalHistory.previousSurgeries=yes';
  surg.appendChild(textArea({
    label: 'Please describe surgeries',
    section: 'medicalHistory', field: 'surgeryDetails',
    placeholder: 'Type of surgery and date...'
  }));
  card.appendChild(surg);

  card.appendChild(radioGroup({
    label: 'Does the child have recurring infections?',
    section: 'medicalHistory', field: 'recurringInfections', options: yesNo
  }));
  const inf = document.createElement('div');
  inf.dataset.conditional = 'medicalHistory.recurringInfections=yes';
  inf.appendChild(textArea({
    label: 'Please describe recurring infections',
    section: 'medicalHistory', field: 'infectionDetails',
    placeholder: 'e.g., ear infections, tonsillitis...'
  }));
  card.appendChild(inf);

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Current Medications',
    description: 'All medications, supplements, and allergies.'
  });

  card.appendChild(subHeading('Prescriptions'));
  card.appendChild(medicationListEditor({
    field: 'prescriptions',
    addLabel: 'Add prescription',
    emptyLabel: 'No prescriptions added.'
  }));

  card.appendChild(subHeading('Over-the-Counter Medications'));
  card.appendChild(medicationListEditor({
    field: 'otcMedications',
    addLabel: 'Add OTC medication',
    emptyLabel: 'No OTC medications added.'
  }));

  card.appendChild(subHeading('Supplements'));
  card.appendChild(medicationListEditor({
    field: 'supplements',
    addLabel: 'Add supplement',
    emptyLabel: 'No supplements added.'
  }));

  const sep = document.createElement('hr');
  sep.className = 'card-divider';
  card.appendChild(sep);

  card.appendChild(subHeading('Allergies'));
  card.appendChild(allergyEditor());

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Family History',
    description: 'Hereditary and genetic factors.'
  });

  card.appendChild(radioGroup({
    label: 'Are there any known genetic conditions in the family?',
    section: 'familyHistory', field: 'geneticConditions', options: yesNo
  }));
  const gen = document.createElement('div');
  gen.dataset.conditional = 'familyHistory.geneticConditions=yes';
  gen.appendChild(textArea({
    label: 'Please describe genetic conditions',
    section: 'familyHistory', field: 'geneticConditionDetails',
    placeholder: 'e.g., Down syndrome, cystic fibrosis, sickle cell...'
  }));
  card.appendChild(gen);

  card.appendChild(radioGroup({
    label: 'Are there any chronic diseases in the family?',
    section: 'familyHistory', field: 'chronicDiseases', options: yesNo
  }));
  const chr = document.createElement('div');
  chr.dataset.conditional = 'familyHistory.chronicDiseases=yes';
  chr.appendChild(textArea({
    label: 'Please describe chronic diseases',
    section: 'familyHistory', field: 'chronicDiseaseDetails',
    placeholder: 'e.g., diabetes, heart disease, cancer...'
  }));
  card.appendChild(chr);

  card.appendChild(radioGroup({
    label: 'Are there any developmental disorders in the family?',
    section: 'familyHistory', field: 'developmentalDisorders', options: yesNo
  }));
  const dev = document.createElement('div');
  dev.dataset.conditional = 'familyHistory.developmentalDisorders=yes';
  dev.appendChild(textArea({
    label: 'Please describe developmental disorders',
    section: 'familyHistory', field: 'developmentalDisorderDetails',
    placeholder: 'e.g., autism, ADHD, speech delay...'
  }));
  card.appendChild(dev);

  card.appendChild(radioGroup({
    label: 'Is there consanguinity (parents are related)?',
    section: 'familyHistory', field: 'consanguinity', options: yesNo
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Social & Environmental',
    description: 'Home, school, and social environment.'
  });

  card.appendChild(textArea({
    label: 'Home Environment',
    section: 'socialEnvironmental', field: 'homeEnvironment',
    placeholder: 'Describe the child\u2019s home environment, living situation...'
  }));

  card.appendChild(selectInput({
    label: 'School Performance',
    section: 'socialEnvironmental', field: 'schoolPerformance',
    options: [
      { value: 'above-average', label: 'Above Average' },
      { value: 'average', label: 'Average' },
      { value: 'below-average', label: 'Below Average' },
      { value: 'not-applicable', label: 'Not Applicable (pre-school age)' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Are there any behavioural concerns?',
    section: 'socialEnvironmental', field: 'behaviouralConcerns', options: yesNo
  }));
  const behav = document.createElement('div');
  behav.dataset.conditional = 'socialEnvironmental.behaviouralConcerns=yes';
  behav.appendChild(textArea({
    label: 'Please describe behavioural concerns',
    section: 'socialEnvironmental', field: 'behaviouralConcernDetails',
    placeholder: 'e.g., aggression, hyperactivity, social withdrawal...'
  }));
  card.appendChild(behav);

  card.appendChild(radioGroup({
    label: 'Are there any safeguarding concerns?',
    section: 'socialEnvironmental', field: 'safeguardingConcerns', options: yesNo
  }));
  const safeguard = document.createElement('div');
  safeguard.dataset.conditional = 'socialEnvironmental.safeguardingConcerns=yes';
  safeguard.appendChild(textArea({
    label: 'Please describe safeguarding concerns',
    section: 'socialEnvironmental', field: 'safeguardingDetails',
    placeholder: 'Describe any safeguarding concerns - this information is treated as highly confidential'
  }));
  card.appendChild(safeguard);

  card.appendChild(textInput({
    label: 'Screen Time', section: 'socialEnvironmental', field: 'screenTimeHoursPerDay',
    type: 'number', min: 0, max: 24, step: 0.5, unit: 'hours/day'
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
  // Age banner inside Step 4 reflects the demographics DOB.
  const banner = document.getElementById('age-banner');
  if (banner) {
    const age = formatAge(state.demographics.dateOfBirth);
    if (age) {
      banner.innerHTML = `Child's age: <strong>${esc(age)}</strong> — assess milestones appropriate for this age.`;
      banner.style.display = '';
    } else {
      banner.style.display = 'none';
    }
  }

  // Growth percentile category labels.
  ['weightPercentile', 'heightPercentile', 'headCircumferencePercentile'].forEach((field) => {
    const el = document.getElementById(`${field}-category`);
    if (el) el.textContent = percentileCategory(state.growthNutrition[field]);
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics (required core)
  ['demographics', 'childFirstName'],
  ['demographics', 'childLastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  ['demographics', 'weight'],
  ['demographics', 'height'],
  ['demographics', 'parentGuardianName'],
  ['demographics', 'parentGuardianRelationship'],
  // Birth history
  ['birthHistory', 'gestationalAge'],
  ['birthHistory', 'birthWeight'],
  ['birthHistory', 'deliveryType'],
  ['birthHistory', 'apgarOneMinute'],
  ['birthHistory', 'apgarFiveMinutes'],
  ['birthHistory', 'nicuStay'],
  ['birthHistory', 'birthComplications'],
  // Growth & nutrition
  ['growthNutrition', 'weightPercentile'],
  ['growthNutrition', 'heightPercentile'],
  ['growthNutrition', 'headCircumferencePercentile'],
  ['growthNutrition', 'feedingType'],
  ['growthNutrition', 'dietaryConcerns'],
  ['growthNutrition', 'failureToThrive'],
  // Developmental milestones (5 domains)
  ['developmentalMilestones', 'grossMotor'],
  ['developmentalMilestones', 'fineMotor'],
  ['developmentalMilestones', 'language'],
  ['developmentalMilestones', 'socialEmotional'],
  ['developmentalMilestones', 'cognitive'],
  // Immunization
  ['immunizationStatus', 'upToDate'],
  ['immunizationStatus', 'adverseReactions'],
  ['immunizationStatus', 'exemptions'],
  // Medical history
  ['medicalHistory', 'chronicConditions'],
  ['medicalHistory', 'previousHospitalizations'],
  ['medicalHistory', 'previousSurgeries'],
  ['medicalHistory', 'recurringInfections'],
  // Family history
  ['familyHistory', 'geneticConditions'],
  ['familyHistory', 'chronicDiseases'],
  ['familyHistory', 'developmentalDisorders'],
  ['familyHistory', 'consanguinity'],
  // Social & environmental
  ['socialEnvironmental', 'schoolPerformance'],
  ['socialEnvironmental', 'behaviouralConcerns'],
  ['socialEnvironmental', 'safeguardingConcerns'],
  ['socialEnvironmental', 'screenTimeHoursPerDay']
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
  { step: 1, section: 'demographics',             title: 'Demographics' },
  { step: 2, section: 'birthHistory',             title: 'Birth History' },
  { step: 3, section: 'growthNutrition',          title: 'Growth & Nutrition' },
  { step: 4, section: 'developmentalMilestones',  title: 'Milestones' },
  { step: 5, section: 'immunizationStatus',       title: 'Immunizations' },
  { step: 6, section: 'medicalHistory',           title: 'Medical History' },
  { step: 7, section: 'currentMedications',       title: 'Medications' },
  { step: 8, section: 'familyHistory',            title: 'Family History' },
  { step: 9, section: 'socialEnvironmental',      title: 'Social & Environment' }
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

  const { overallResult, domainResults, firedRules, additionalFlags, timestamp } = lastResult;

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

  // Domain table: every core domain plus its computed Pass/Concern/Fail.
  const domainRows = Object.entries(domainResults).map(([name, result]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>
        <span class="domain-badge ${domainResultClass(result)}">${esc(domainResultLabel(result))}</span>
      </td>
    </tr>
  `).join('');

  const firedRows = firedRules.length === 0
    ? `<p class="muted">No screening rules fired — no concerns identified.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Domain</th>
            <th scope="col">Description</th>
            <th scope="col">Result</th>
          </tr>
        </thead>
        <tbody>
          ${firedRules.map((r) => `
            <tr>
              <th scope="row">${esc(r.id)}</th>
              <td>${esc(r.domain)}</td>
              <td>${esc(r.description)}</td>
              <td>
                <span class="domain-badge ${domainResultClass(r.result)}">${esc(domainResultLabel(r.result))}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

  // Patient-summary header line.
  const d = state.demographics;
  const childName = `${d.childFirstName} ${d.childLastName}`.trim();
  const ageDisplay = formatAge(d.dateOfBirth);
  const gestCat = gestationalAgeCategory(state.birthHistory.gestationalAge);
  const summaryBits = [];
  if (childName) summaryBits.push(esc(childName));
  if (ageDisplay) summaryBits.push(esc(ageDisplay));
  if (gestCat) summaryBits.push(`Gestation: ${esc(gestCat)}`);

  out.innerHTML = `
    <h2>Pediatric Assessment Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
    ${summaryBits.length ? `<p class="patient-summary">${summaryBits.join(' &middot; ')}</p>` : ''}

    <h3>Developmental Screen</h3>
    <p class="screen-summary">
      <span class="screen-badge ${devScreenClass(overallResult)}">${esc(devScreenLabel(overallResult))}</span>
    </p>

    <h3>Domain Results</h3>
    <table class="subscales">
      <thead>
        <tr>
          <th scope="col">Domain</th>
          <th scope="col">Result</th>
        </tr>
      </thead>
      <tbody>${domainRows}</tbody>
    </table>

    <h3>Fired Screening Rules</h3>
    ${firedRows}

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
  const screen = calculateDevelopmentalScreen(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    overallResult: screen.overallResult,
    domainResults: screen.domainResults,
    firedRules: screen.firedRules,
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
