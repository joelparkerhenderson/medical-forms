import { detectAdditionalFlags } from './flagged-issues.js';
import { gradeRisk } from './risk-grader.js';
import { calculateAge, emptyAssessment, emptyFamilyMember, riskCategory, riskLevelClass } from './types.js';

// Genetic Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure risk-grading engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'genetic-assessment.front-end-form-with-html.v1';

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
      // Family pedigree has nested family-member objects; merge each one.
      if (key === 'familyPedigree') {
        for (const memberKey of Object.keys(fresh.familyPedigree)) {
          const target = fresh.familyPedigree[memberKey];
          const incoming = parsed.familyPedigree?.[memberKey];
          if (typeof target === 'object' && target !== null && incoming && typeof incoming === 'object') {
            fresh.familyPedigree[memberKey] = { ...target, ...incoming };
          } else if (typeof incoming === 'string') {
            fresh.familyPedigree[memberKey] = incoming;
          }
        }
      } else {
        fresh[key] = { ...fresh[key], ...parsed[key] };
      }
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

/** @type {(import('./types.js').GradingResult & { riskScore: number, riskLevel: string, firedRules: any[], additionalFlags: any[], timestamp: string }) | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'genetic-assessment',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const report = document.getElementById('report');
    if (report) report.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
    // Full reload to reset every form control to its empty default.
    window.location.reload();
  }
};

const TOTAL_STEPS = 10;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a field on a top-level section and persist.
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
}

/**
 * Set a field inside one of the family-pedigree members (mother, father,
 * grandparents) and persist.
 *
 * @param {string} memberKey
 * @param {string} field
 * @param {*} value
 */
function setFamilyMemberField(memberKey, field, value) {
  state.familyPedigree[memberKey][field] = value;
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

// ----------------------------------------------------------------------
// Component builders
// ----------------------------------------------------------------------

/**
 * Build a labelled text input.
 * @param {{ label: string, section: string, field: string, type?: string,
 *           placeholder?: string, required?: boolean, min?: number,
 *           max?: number, step?: number, unit?: string }} opts
 */
function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const requiredMark = opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '';
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
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}${requiredMark}</label>
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

/**
 * Build a labelled multi-line text area.
 * @param {{ label: string, section: string, field: string, rows?: number,
 *           placeholder?: string, required?: boolean }} opts
 */
function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] ?? '';
  const requiredMark = opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}${requiredMark}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      ${opts.required ? 'required data-required' : ''}
      aria-describedby="${id}-error"
      class="text-area-input">${esc(value)}</textarea>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => {
    setField(opts.section, opts.field, ta.value);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Build a select / dropdown input.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[],
 *           required?: boolean }} opts
 */
function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const requiredMark = opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}${requiredMark}</label>
    <select id="${id}" name="${id}" class="select"
      ${opts.required ? 'required data-required' : ''}
      aria-describedby="${id}-error">
      ${optionsHtml}
    </select>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => {
    setField(opts.section, opts.field, sel.value);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Build a radio group bound to state[section][field].
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[],
 *           required?: boolean }} opts
 */
function radioGroup(opts) {
  const groupId = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'field';
  fieldset.id = `${groupId}-fieldset`;
  fieldset.setAttribute('aria-describedby', `${groupId}-error`);

  const legend = document.createElement('legend');
  legend.className = 'label';
  if (opts.required) legend.setAttribute('data-required', '');
  legend.innerHTML = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  fieldset.appendChild(legend);

  const group = document.createElement('div');
  group.className = 'radio-group';
  group.setAttribute('role', 'radiogroup');
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
    label.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    const requiredAttr = opts.required ? ' required data-required' : '';
    label.innerHTML = `
      <input type="radio" class="radio-input" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}${requiredAttr}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        setField(opts.section, opts.field, option.value);
        clearFieldError(groupId);
      }
    });
    group.appendChild(label);
  }
  fieldset.appendChild(group);
  const err = document.createElement('span');
  err.className = 'error-message';
  err.id = `${groupId}-error`;
  err.setAttribute('aria-live', 'polite');
  fieldset.appendChild(err);
  return fieldset;
}

/**
 * Build a section card as a Lily fieldset.
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
  const legend = document.createElement('legend');
  legend.className = 'fieldset-legend';
  legend.innerHTML =
    `<span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Family pedigree row editor
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

/**
 * Build the editor block for one family member (mother, father, or
 * grandparent). Each member has conditions, cancers, ageAtDiagnosis,
 * deceased (yes/no) and ageAtDeath (visible only when deceased=yes).
 *
 * @param {{ memberKey: string, memberLabel: string }} opts
 */
function familyMemberEditor(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'family-member';

  const header = document.createElement('h3');
  header.className = 'family-member-title';
  header.textContent = opts.memberLabel;
  wrapper.appendChild(header);

  const data = state.familyPedigree[opts.memberKey];

  // Conditions textarea
  const condId = `family-${opts.memberKey}-conditions`;
  const condField = document.createElement('div');
  condField.className = 'field';
  condField.innerHTML = `
    <label class="label" for="${condId}">Medical conditions</label>
    <textarea id="${condId}" rows="2" class="text-area-input"
      placeholder="List any known medical or genetic conditions...">${esc(data.conditions)}</textarea>
  `;
  const condTa = condField.querySelector('textarea');
  condTa.addEventListener('input', () =>
    setFamilyMemberField(opts.memberKey, 'conditions', condTa.value));
  wrapper.appendChild(condField);

  // Cancers
  const cancerId = `family-${opts.memberKey}-cancers`;
  const cancerField = document.createElement('div');
  cancerField.className = 'field';
  cancerField.innerHTML = `
    <label class="label" for="${cancerId}">Cancer history</label>
    <input type="text" id="${cancerId}" class="text-input"
      value="${esc(data.cancers)}"
      placeholder="Type of cancer(s), if any">
  `;
  const cancerInp = cancerField.querySelector('input');
  cancerInp.addEventListener('input', () =>
    setFamilyMemberField(opts.memberKey, 'cancers', cancerInp.value));
  wrapper.appendChild(cancerField);

  // Age at diagnosis (free text per Svelte component)
  const ageDxId = `family-${opts.memberKey}-ageAtDiagnosis`;
  const ageDxField = document.createElement('div');
  ageDxField.className = 'field';
  ageDxField.innerHTML = `
    <label class="label" for="${ageDxId}">Age at diagnosis (if applicable)</label>
    <input type="text" id="${ageDxId}" class="text-input"
      value="${esc(data.ageAtDiagnosis)}"
      placeholder="e.g., 45">
  `;
  const ageDxInp = ageDxField.querySelector('input');
  ageDxInp.addEventListener('input', () =>
    setFamilyMemberField(opts.memberKey, 'ageAtDiagnosis', ageDxInp.value));
  wrapper.appendChild(ageDxField);

  // Deceased radio
  const groupId = `family-${opts.memberKey}-deceased`;
  const decFieldset = document.createElement('fieldset');
  decFieldset.className = 'field';
  const decLegend = document.createElement('legend');
  decLegend.className = 'label';
  decLegend.textContent = 'Deceased?';
  decFieldset.appendChild(decLegend);
  const decList = document.createElement('div');
  decList.className = 'radio-group';
  decList.setAttribute('role', 'radiogroup');
  for (const opt of yesNo) {
    const rid = `${groupId}-${opt.value}`;
    const lbl = document.createElement('label');
    lbl.className = 'radio-input';
    lbl.htmlFor = rid;
    const checked = data.deceased === opt.value ? ' checked' : '';
    lbl.innerHTML = `
      <input type="radio" class="radio-input" id="${rid}" name="${groupId}" value="${esc(opt.value)}"${checked}>
      <span>${esc(opt.label)}</span>
    `;
    const inp = lbl.querySelector('input');
    inp.addEventListener('change', () => {
      if (inp.checked) setFamilyMemberField(opts.memberKey, 'deceased', opt.value);
    });
    decList.appendChild(lbl);
  }
  decFieldset.appendChild(decList);
  wrapper.appendChild(decFieldset);

  // Age at death (conditional on deceased=yes)
  const ageDeathHost = document.createElement('div');
  ageDeathHost.dataset.conditional = `familyPedigree.${opts.memberKey}.deceased=yes`;
  const ageDeathId = `family-${opts.memberKey}-ageAtDeath`;
  const ageDeathField = document.createElement('div');
  ageDeathField.className = 'field';
  ageDeathField.innerHTML = `
    <label class="label" for="${ageDeathId}">Age at death</label>
    <input type="text" id="${ageDeathId}" class="text-input"
      value="${esc(data.ageAtDeath)}"
      placeholder="e.g., 72">
  `;
  const ageDeathInp = ageDeathField.querySelector('input');
  ageDeathInp.addEventListener('input', () =>
    setFamilyMemberField(opts.memberKey, 'ageAtDeath', ageDeathInp.value));
  ageDeathHost.appendChild(ageDeathField);
  wrapper.appendChild(ageDeathHost);

  return wrapper;
}

// ----------------------------------------------------------------------
// Section renderers (1 per step, 10 total)
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

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Referral Information',
    description: 'Who is referring you, and why.'
  });

  card.appendChild(textArea({
    label: 'Reason for referral',
    section: 'referralInformation',
    field: 'referralReason',
    placeholder: 'Describe the main reason for this genetic assessment referral...',
    rows: 3
  }));

  card.appendChild(textInput({
    label: 'Referring clinician',
    section: 'referralInformation',
    field: 'referringClinician',
    placeholder: 'e.g., Dr. Smith, Oncology'
  }));

  card.appendChild(selectInput({
    label: 'Urgency',
    section: 'referralInformation',
    field: 'urgency',
    options: [
      { value: 'routine', label: 'Routine' },
      { value: 'urgent', label: 'Urgent' },
      { value: 'emergency', label: 'Emergency' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Personal Medical History',
    description: 'Personal history of birth defects, developmental issues, and known genetic conditions.'
  });

  // Birth defects
  card.appendChild(radioGroup({
    label: 'Birth defects?',
    section: 'personalMedicalHistory',
    field: 'birthDefects',
    options: yesNo
  }));
  const birthDetails = document.createElement('div');
  birthDetails.dataset.conditional = 'personalMedicalHistory.birthDefects=yes';
  birthDetails.appendChild(textArea({
    label: 'Birth defects details',
    section: 'personalMedicalHistory',
    field: 'birthDefectsDetails',
    placeholder: 'Describe any known birth defects...',
    rows: 2
  }));
  card.appendChild(birthDetails);

  // Developmental delay
  card.appendChild(radioGroup({
    label: 'Developmental delay?',
    section: 'personalMedicalHistory',
    field: 'developmentalDelay',
    options: yesNo
  }));
  const ddDetails = document.createElement('div');
  ddDetails.dataset.conditional = 'personalMedicalHistory.developmentalDelay=yes';
  ddDetails.appendChild(textArea({
    label: 'Developmental delay details',
    section: 'personalMedicalHistory',
    field: 'developmentalDelayDetails',
    placeholder: 'Describe any developmental delays...',
    rows: 2
  }));
  card.appendChild(ddDetails);

  // Intellectual disability
  card.appendChild(radioGroup({
    label: 'Intellectual disability?',
    section: 'personalMedicalHistory',
    field: 'intellectualDisability',
    options: yesNo
  }));
  const idDetails = document.createElement('div');
  idDetails.dataset.conditional = 'personalMedicalHistory.intellectualDisability=yes';
  idDetails.appendChild(textArea({
    label: 'Intellectual disability details',
    section: 'personalMedicalHistory',
    field: 'intellectualDisabilityDetails',
    placeholder: 'Describe...',
    rows: 2
  }));
  card.appendChild(idDetails);

  // Multiple anomalies
  card.appendChild(radioGroup({
    label: 'Multiple congenital anomalies?',
    section: 'personalMedicalHistory',
    field: 'multipleAnomalies',
    options: yesNo
  }));
  const maDetails = document.createElement('div');
  maDetails.dataset.conditional = 'personalMedicalHistory.multipleAnomalies=yes';
  maDetails.appendChild(textArea({
    label: 'Multiple anomalies details',
    section: 'personalMedicalHistory',
    field: 'multipleAnomaliesDetails',
    placeholder: 'Describe...',
    rows: 2
  }));
  card.appendChild(maDetails);

  // Chromosomal condition
  card.appendChild(radioGroup({
    label: 'Known chromosomal condition?',
    section: 'personalMedicalHistory',
    field: 'chromosomalCondition',
    options: yesNo
  }));
  const ccDetails = document.createElement('div');
  ccDetails.dataset.conditional = 'personalMedicalHistory.chromosomalCondition=yes';
  ccDetails.appendChild(textArea({
    label: 'Chromosomal condition details',
    section: 'personalMedicalHistory',
    field: 'chromosomalConditionDetails',
    placeholder: 'e.g., Down syndrome, Turner syndrome...',
    rows: 2
  }));
  card.appendChild(ccDetails);

  // Known genetic condition
  card.appendChild(radioGroup({
    label: 'Known genetic condition?',
    section: 'personalMedicalHistory',
    field: 'knownGeneticCondition',
    options: yesNo
  }));
  const kgDetails = document.createElement('div');
  kgDetails.dataset.conditional = 'personalMedicalHistory.knownGeneticCondition=yes';
  kgDetails.appendChild(textArea({
    label: 'Genetic condition details',
    section: 'personalMedicalHistory',
    field: 'knownGeneticConditionDetails',
    placeholder: 'e.g., BRCA1, Lynch syndrome, cystic fibrosis...',
    rows: 2
  }));
  card.appendChild(kgDetails);

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Cancer History',
    description: 'Personal history of cancer.'
  });

  card.appendChild(radioGroup({
    label: 'Personal cancer history?',
    section: 'cancerHistory',
    field: 'personalCancerHistory',
    options: yesNo
  }));

  const cancerDetails = document.createElement('div');
  cancerDetails.dataset.conditional = 'cancerHistory.personalCancerHistory=yes';
  cancerDetails.appendChild(textInput({
    label: 'Type of cancer',
    section: 'cancerHistory',
    field: 'cancerType',
    placeholder: 'e.g., breast, colorectal, ovarian'
  }));
  cancerDetails.appendChild(textInput({
    label: 'Age at diagnosis',
    section: 'cancerHistory',
    field: 'ageAtDiagnosis',
    type: 'number',
    min: 0,
    max: 120,
    placeholder: 'e.g., 45'
  }));
  cancerDetails.appendChild(radioGroup({
    label: 'Multiple primary cancers?',
    section: 'cancerHistory',
    field: 'multiplePrimaryCancers',
    options: yesNo
  }));
  card.appendChild(cancerDetails);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Family Pedigree',
    description: 'Three-generation family history of medical conditions and cancers.'
  });

  const familyMembers = [
    { key: 'mother', label: 'Mother' },
    { key: 'father', label: 'Father' },
    { key: 'maternalGrandmother', label: 'Maternal Grandmother' },
    { key: 'maternalGrandfather', label: 'Maternal Grandfather' },
    { key: 'paternalGrandmother', label: 'Paternal Grandmother' },
    { key: 'paternalGrandfather', label: 'Paternal Grandfather' }
  ];

  for (const m of familyMembers) {
    card.appendChild(familyMemberEditor({
      memberKey: m.key,
      memberLabel: m.label
    }));
  }

  card.appendChild(textArea({
    label: 'Siblings (conditions, cancers, age at diagnosis)',
    section: 'familyPedigree',
    field: 'siblings',
    placeholder: 'List siblings and any relevant medical history...',
    rows: 3
  }));

  card.appendChild(textArea({
    label: 'Children (conditions, cancers, age at diagnosis)',
    section: 'familyPedigree',
    field: 'children',
    placeholder: 'List children and any relevant medical history...',
    rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Cardiovascular Genetics',
    description: 'Family history of inherited cardiovascular conditions.'
  });

  card.appendChild(radioGroup({
    label: 'Familial hypercholesterolemia (very high cholesterol running in family)?',
    section: 'cardiovascularGenetics',
    field: 'familialHypercholesterolemia',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Cardiomyopathy in family?',
    section: 'cardiovascularGenetics',
    field: 'cardiomyopathy',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Aortic aneurysm in family?',
    section: 'cardiovascularGenetics',
    field: 'aorticAneurysm',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Sudden cardiac death in family (unexplained, often before age 50)?',
    section: 'cardiovascularGenetics',
    field: 'suddenCardiacDeath',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Early-onset cardiovascular disease in family (heart attack/stroke before 55 in men, 65 in women)?',
    section: 'cardiovascularGenetics',
    field: 'earlyOnsetCVD',
    options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Cardiovascular details',
    section: 'cardiovascularGenetics',
    field: 'cardiovascularDetails',
    placeholder: 'Describe any cardiovascular genetic concerns or family history details...',
    rows: 3
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Neurogenetics',
    description: 'Family history of inherited neurological conditions.'
  });

  card.appendChild(radioGroup({
    label: 'Huntington disease in family?',
    section: 'neurogenetics',
    field: 'huntington',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Early-onset Alzheimer disease in family (before age 65)?',
    section: 'neurogenetics',
    field: 'alzheimersEarly',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Parkinson disease in family?',
    section: 'neurogenetics',
    field: 'parkinson',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Muscular dystrophy in family?',
    section: 'neurogenetics',
    field: 'muscularDystrophy',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Spinocerebellar ataxia in family?',
    section: 'neurogenetics',
    field: 'spinocerebellarAtaxia',
    options: yesNo
  }));

  card.appendChild(textArea({
    label: 'Neurological details',
    section: 'neurogenetics',
    field: 'neurologicalDetails',
    placeholder: 'Describe any neurogenetic concerns or family history details...',
    rows: 3
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Reproductive Genetics',
    description: 'Pregnancy loss, infertility, and known carrier status.'
  });

  card.appendChild(radioGroup({
    label: 'Recurrent miscarriages (3 or more)?',
    section: 'reproductiveGenetics',
    field: 'recurrentMiscarriages',
    options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Infertility?',
    section: 'reproductiveGenetics',
    field: 'infertility',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Previous child with a genetic condition?',
    section: 'reproductiveGenetics',
    field: 'previousAffectedChild',
    options: yesNo
  }));
  const pacDetails = document.createElement('div');
  pacDetails.dataset.conditional = 'reproductiveGenetics.previousAffectedChild=yes';
  pacDetails.appendChild(textArea({
    label: 'Previous affected child — details',
    section: 'reproductiveGenetics',
    field: 'previousAffectedChildDetails',
    placeholder: 'Describe condition, age at diagnosis, etc.',
    rows: 2
  }));
  card.appendChild(pacDetails);

  card.appendChild(radioGroup({
    label: 'Consanguinity (related to partner, e.g. cousins)?',
    section: 'reproductiveGenetics',
    field: 'consanguinity',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Known carrier status (you have been told you are a carrier of a genetic condition)?',
    section: 'reproductiveGenetics',
    field: 'carrierStatus',
    options: yesNo
  }));
  const carrierDetails = document.createElement('div');
  carrierDetails.dataset.conditional = 'reproductiveGenetics.carrierStatus=yes';
  carrierDetails.appendChild(textArea({
    label: 'Carrier status — details',
    section: 'reproductiveGenetics',
    field: 'carrierStatusDetails',
    placeholder: 'e.g., cystic fibrosis carrier, sickle cell trait, Tay-Sachs...',
    rows: 2
  }));
  card.appendChild(carrierDetails);

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Ethnic Background & Consanguinity',
    description: 'Ethnicity and consanguinity can affect genetic-condition probabilities.'
  });

  card.appendChild(textInput({
    label: 'Ethnicity / ancestry',
    section: 'ethnicBackground',
    field: 'ethnicity',
    placeholder: 'e.g., Northern European, East Asian, West African...'
  }));

  card.appendChild(radioGroup({
    label: 'Ashkenazi Jewish heritage?',
    section: 'ethnicBackground',
    field: 'ashkenaziJewish',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Consanguinity in your background?',
    section: 'ethnicBackground',
    field: 'consanguinity',
    options: yesNo
  }));
  const consDetails = document.createElement('div');
  consDetails.dataset.conditional = 'ethnicBackground.consanguinity=yes';
  consDetails.appendChild(textArea({
    label: 'Consanguinity details',
    section: 'ethnicBackground',
    field: 'consanguinityDetails',
    placeholder: 'e.g., parents are first cousins...',
    rows: 2
  }));
  card.appendChild(consDetails);

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Genetic Testing History',
    description: 'Any prior genetic testing or counselling.'
  });

  card.appendChild(radioGroup({
    label: 'Previous genetic tests?',
    section: 'geneticTestingHistory',
    field: 'previousGeneticTests',
    options: yesNo
  }));
  const prevDetails = document.createElement('div');
  prevDetails.dataset.conditional = 'geneticTestingHistory.previousGeneticTests=yes';
  prevDetails.appendChild(textArea({
    label: 'Previous tests — details',
    section: 'geneticTestingHistory',
    field: 'previousGeneticTestsDetails',
    placeholder: 'List any prior genetic tests (panel, exome, single-gene, karyotype, etc.)...',
    rows: 3
  }));
  prevDetails.appendChild(textArea({
    label: 'Test results',
    section: 'geneticTestingHistory',
    field: 'testResults',
    placeholder: 'Summarise the results of any prior genetic testing...',
    rows: 3
  }));
  card.appendChild(prevDetails);

  card.appendChild(radioGroup({
    label: 'Have you had genetic counselling before?',
    section: 'geneticTestingHistory',
    field: 'geneticCounseling',
    options: yesNo
  }));

  card.appendChild(radioGroup({
    label: 'Variants of uncertain significance identified?',
    section: 'geneticTestingHistory',
    field: 'variantsOfUncertainSignificance',
    options: yesNo
  }));
  const vusDetails = document.createElement('div');
  vusDetails.dataset.conditional = 'geneticTestingHistory.variantsOfUncertainSignificance=yes';
  vusDetails.appendChild(textArea({
    label: 'Variants of uncertain significance — details',
    section: 'geneticTestingHistory',
    field: 'variantsOfUncertainSignificanceDetails',
    placeholder: 'List any reported VUS findings...',
    rows: 2
  }));
  card.appendChild(vusDetails);

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

/**
 * Resolve a dotted path (e.g. "familyPedigree.mother.deceased") down through
 * the state object and return the final value (or undefined).
 *
 * @param {string} path
 */
function resolvePath(path) {
  const parts = path.split('.');
  let cur = state;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const eqIdx = expr.lastIndexOf('=');
    if (eqIdx < 0) return;
    const path = expr.slice(0, eqIdx);
    const target = expr.slice(eqIdx + 1);
    const current = resolvePath(path);
    host.style.display = String(current) === target ? '' : 'none';
  });
  document.querySelectorAll('[data-conditional-any]').forEach((host) => {
    const expr = host.getAttribute('data-conditional-any');
    const eqIdx = expr.lastIndexOf('=');
    if (eqIdx < 0) return;
    const path = expr.slice(0, eqIdx);
    const targetCsv = expr.slice(eqIdx + 1);
    const current = String(resolvePath(path) ?? '');
    const targets = targetCsv.split(',');
    host.style.display = targets.includes(current) ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics',              title: 'Demographics' },
  { step: 2,  section: 'referralInformation',       title: 'Referral Information' },
  { step: 3,  section: 'personalMedicalHistory',    title: 'Personal Medical History' },
  { step: 4,  section: 'cancerHistory',             title: 'Cancer History' },
  { step: 5,  section: 'familyPedigree',            title: 'Family Pedigree' },
  { step: 6,  section: 'cardiovascularGenetics',    title: 'Cardiovascular Genetics' },
  { step: 7,  section: 'neurogenetics',             title: 'Neurogenetics' },
  { step: 8,  section: 'reproductiveGenetics',      title: 'Reproductive Genetics' },
  { step: 9,  section: 'ethnicBackground',          title: 'Ethnic Background' },
  { step: 10, section: 'geneticTestingHistory',     title: 'Genetic Testing History' }
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
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics (4)
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  // Referral information (3)
  ['referralInformation', 'referralReason'],
  ['referralInformation', 'referringClinician'],
  ['referralInformation', 'urgency'],
  // Personal medical history (6 yes/no)
  ['personalMedicalHistory', 'birthDefects'],
  ['personalMedicalHistory', 'developmentalDelay'],
  ['personalMedicalHistory', 'intellectualDisability'],
  ['personalMedicalHistory', 'multipleAnomalies'],
  ['personalMedicalHistory', 'chromosomalCondition'],
  ['personalMedicalHistory', 'knownGeneticCondition'],
  // Cancer history (1 yes/no, conditionals are bonus but tracked simply)
  ['cancerHistory', 'personalCancerHistory'],
  ['cancerHistory', 'multiplePrimaryCancers'],
  // Cardiovascular genetics (5)
  ['cardiovascularGenetics', 'familialHypercholesterolemia'],
  ['cardiovascularGenetics', 'cardiomyopathy'],
  ['cardiovascularGenetics', 'aorticAneurysm'],
  ['cardiovascularGenetics', 'suddenCardiacDeath'],
  ['cardiovascularGenetics', 'earlyOnsetCVD'],
  // Neurogenetics (5)
  ['neurogenetics', 'huntington'],
  ['neurogenetics', 'alzheimersEarly'],
  ['neurogenetics', 'parkinson'],
  ['neurogenetics', 'muscularDystrophy'],
  ['neurogenetics', 'spinocerebellarAtaxia'],
  // Reproductive genetics (5)
  ['reproductiveGenetics', 'recurrentMiscarriages'],
  ['reproductiveGenetics', 'infertility'],
  ['reproductiveGenetics', 'previousAffectedChild'],
  ['reproductiveGenetics', 'consanguinity'],
  ['reproductiveGenetics', 'carrierStatus'],
  // Ethnic background (3)
  ['ethnicBackground', 'ethnicity'],
  ['ethnicBackground', 'ashkenaziJewish'],
  ['ethnicBackground', 'consanguinity'],
  // Genetic testing history (3)
  ['geneticTestingHistory', 'previousGeneticTests'],
  ['geneticTestingHistory', 'geneticCounseling'],
  ['geneticTestingHistory', 'variantsOfUncertainSignificance']
];

// Family-pedigree members add another 6 "deceased" fields tracked toward
// progress, since they are visible top-level radio choices in the pedigree.
const TRACKED_FAMILY_MEMBERS = [
  'mother',
  'father',
  'maternalGrandmother',
  'maternalGrandfather',
  'paternalGrandmother',
  'paternalGrandfather'
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
  sectionTotal['familyPedigree'] = (sectionTotal['familyPedigree'] || 0) + TRACKED_FAMILY_MEMBERS.length;
  for (const memberKey of TRACKED_FAMILY_MEMBERS) {
    const v = state.familyPedigree[memberKey].deceased;
    if (v !== null && v !== undefined && v !== '') {
      answered++;
      sectionAnswered['familyPedigree'] = (sectionAnswered['familyPedigree'] || 0) + 1;
    }
  }
  const total = TRACKED_FIELDS.length + TRACKED_FAMILY_MEMBERS.length;
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  const bar = document.getElementById('progress');
  const text = document.getElementById('progress-text');
  if (bar) bar.value = percent;
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(sectionAnswered, sectionTotal);
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
  const fs = document.getElementById(`${id}-fieldset`);
  if (fs) fs.setAttribute('aria-invalid', 'true');
}

function validateForm() {
  const errors = [];
  const form = document.getElementById('assessment-form');
  if (!form) return errors;
  const required = form.querySelectorAll('[data-required]');
  const seen = new Set();
  required.forEach((input) => {
    if (input.tagName === 'LABEL' || input.tagName === 'LEGEND') return;
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

  const { riskScore, riskLevel, firedRules, additionalFlags, timestamp } = lastResult;

  const flagsList = additionalFlags.length === 0
    ? `<p class="muted">No additional flags raised.</p>`
    : `
      <ul class="flags">
        ${additionalFlags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(String(f.priority).toUpperCase())}</span>
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
      <td class="num">+${r.weight}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No risk rules fired.</p>`
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
        <h2>Genetic Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Risk Score</h3>
      <p class="risk-summary">
        <span class="risk-level-badge ${riskLevelClass(riskLevel)}">${esc(riskLevel)} Risk</span>
        <span class="risk-score">Score: ${riskScore}</span>
      </p>
      <p class="muted">Stratification: 0–2 = Low, 3–5 = Moderate, 6+ = High.</p>

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
  const errs = validateForm();
  if (errs.length > 0) return;
  const { riskScore, riskLevel, firedRules } = gradeRisk(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    riskScore,
    riskLevel,
    firedRules,
    additionalFlags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Are you sure? This will clear all answers and start a fresh assessment.')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const report = document.getElementById('report');
  if (report) report.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  // Full reload to reset every form control to its empty default.
  window.location.reload();
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

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
