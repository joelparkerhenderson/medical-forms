// US HIPAA Authorization Form - patient wizard (vanilla JavaScript ES modules,
// no build).
//
// Single-page continuous wizard: every section is rendered into the page
// in document order. The user scrolls through them; a sticky top-of-page
// progress bar + step-list reflects how many fields have been answered.
// Submission runs the HIPAA validity engine and renders an inline report.
// State is persisted to localStorage so a partial fill survives a reload.

import { emptyAuthorization } from './types.js';
import { validateAuthorization } from './validate-authorization.js';

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'us-hipaa-authorization.front-end-form-with-html.v1';
const TOTAL_STEPS = 9;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyAuthorization();

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
    if (!raw) return emptyAuthorization();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved authorization; starting fresh.', e);
    return emptyAuthorization();
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save authorization to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored authorization.', e);
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
  slug: 'united-states-hipaa-authorization-form',
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
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
// Component builders (Lily class contract)
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
  if (opts.maxLength) attrs.push(`maxlength="${opts.maxLength}"`);
  if (opts.pattern) attrs.push(`pattern="${esc(opts.pattern)}"`);
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
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
    let v = input.value;
    if (opts.type === 'number') v = v === '' ? null : Number(v);
    if (opts.type === 'date') v = v || null;
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
    <span class="error-message" id="${id}-error"></span>
  `;
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => {
    setField(opts.section, opts.field, ta.value);
    clearFieldError(id);
  });
  return wrapper;
}

function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${opts.required ? ' required data-required' : ''}>
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

function checkboxInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const list = document.createElement('div');
  list.className = 'checkbox-group';

  const checked = current === 'yes' ? ' checked' : '';
  const label = document.createElement('label');
  label.htmlFor = id;
  label.innerHTML = `
    <input class="checkbox-input" type="checkbox" id="${id}" name="${id}"${checked}>
    <span>${esc(opts.label)}</span>
  `;
  const input = label.querySelector('input');
  input.addEventListener('change', () => {
    setField(opts.section, opts.field, input.checked ? 'yes' : '');
    clearFieldError(id);
  });
  list.appendChild(label);
  wrapper.appendChild(list);

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = `${id}-error`;
  wrapper.appendChild(errSpan);
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
  legend.innerHTML = `
    <span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>
    <span class="section-title">${esc(opts.title)}</span>
    ${desc}
  `;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'patient',                       title: 'Patient identification' },
  { step: 2, section: 'signer',                        title: 'Signer identification' },
  { step: 3, section: 'disclosingSource',              title: 'Disclosing source' },
  { step: 4, section: 'authorizedRecipient',           title: 'Authorized recipient' },
  { step: 5, section: 'recordsToDisclose',             title: 'Records to disclose' },
  { step: 6, section: 'purposeOfDisclosure',           title: 'Purpose of disclosure' },
  { step: 7, section: 'expiration',                    title: 'Expiration' },
  { step: 8, section: 'patientRightsAcknowledgement',  title: 'Patient rights' },
  { step: 9, section: 'signatureWitness',              title: 'Signature & witness' }
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
// Section renderers
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Patient identification',
    description: 'Identify the individual whose PHI may be disclosed.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Print name', section: 'patient', field: 'name', required: true
  }));
  grid.appendChild(textInput({
    label: 'Date of birth', section: 'patient', field: 'birthDate',
    type: 'date', required: true
  }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Social Security Number (optional)',
    section: 'patient', field: 'socialSecurityNumber',
    placeholder: '123-45-6789',
    pattern: '\\d{3}-?\\d{2}-?\\d{4}'
  }));

  card.appendChild(textInput({
    label: 'Street address', section: 'patient', field: 'streetAddress',
    required: true
  }));

  const grid2 = document.createElement('div');
  grid2.className = 'three-col';
  grid2.appendChild(textInput({
    label: 'City', section: 'patient', field: 'city', required: true
  }));
  grid2.appendChild(textInput({
    label: 'State', section: 'patient', field: 'state',
    maxLength: 2, required: true
  }));
  grid2.appendChild(textInput({
    label: 'ZIP', section: 'patient', field: 'zipCode', required: true
  }));
  card.appendChild(grid2);

  const grid3 = document.createElement('div');
  grid3.className = 'two-col';
  grid3.appendChild(textInput({
    label: 'Phone', section: 'patient', field: 'phone',
    type: 'tel', required: true
  }));
  grid3.appendChild(textInput({
    label: 'Email', section: 'patient', field: 'email', type: 'email'
  }));
  card.appendChild(grid3);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Signer identification',
    description: 'Who is signing this authorization?'
  });

  card.appendChild(radioGroup({
    label: 'I am signing as',
    section: 'signer', field: 'relationship',
    required: true,
    options: [
      { value: 'self', label: 'Self' },
      { value: 'parent-of-minor', label: 'Parent of a minor' },
      { value: 'guardian', label: 'Guardian' },
      { value: 'power-of-attorney', label: 'Power of attorney' },
      { value: 'other-authorized-representative', label: 'Other authorized representative' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Representative name (if not self)',
    section: 'signer', field: 'representativeName'
  }));

  card.appendChild(textArea({
    label: 'Representative authority description',
    section: 'signer', field: 'representativeAuthorityDescription',
    placeholder: 'Describe the legal basis (e.g., court order, durable POA).',
    rows: 2
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Disclosing source',
    description: 'Who is authorised to release the information?'
  });

  card.appendChild(radioGroup({
    label: 'I authorize information to be released by',
    section: 'disclosingSource', field: 'identificationMode',
    required: true,
    options: [
      { value: 'specific', label: 'The following specific persons or organisations' },
      { value: 'class', label: 'The following class of providers (doctors, hospitals, clinics, etc.)' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Specific persons / organizations',
    section: 'disclosingSource', field: 'specificPersonsOrOrganizations',
    placeholder: 'List individuals or named entities.',
    rows: 2
  }));

  card.appendChild(textArea({
    label: 'Class description',
    section: 'disclosingSource', field: 'classDescription',
    placeholder: 'e.g., All doctors and hospitals who treated me from 2020 to today.',
    rows: 2
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Authorized recipient',
    description: 'Who will receive the information?'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Recipient name',
    section: 'authorizedRecipient', field: 'recipientName',
    required: true
  }));
  grid.appendChild(textInput({
    label: 'Recipient organisation',
    section: 'authorizedRecipient', field: 'recipientOrganization'
  }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Recipient address',
    section: 'authorizedRecipient', field: 'recipientAddress'
  }));

  const grid2 = document.createElement('div');
  grid2.className = 'two-col';
  grid2.appendChild(textInput({
    label: 'Phone',
    section: 'authorizedRecipient', field: 'recipientPhone', type: 'tel'
  }));
  grid2.appendChild(textInput({
    label: 'Email',
    section: 'authorizedRecipient', field: 'recipientEmail', type: 'email'
  }));
  card.appendChild(grid2);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Records to disclose',
    description: 'For each category, mark Yes or No and add your initials.'
  });

  const categories = [
    { include: 'includeMedicalHealth',     initials: 'medicalHealthInitials',  legend: 'Medical / health records' },
    { include: 'includeMentalHealth',      initials: 'mentalHealthInitials',   legend: 'Mental-health records' },
    { include: 'includeSubstanceUse',      initials: 'substanceUseInitials',   legend: 'Drug or alcohol treatment / referral records (42 CFR Part 2)' },
    { include: 'includeHivAids',           initials: 'hivAidsInitials',        legend: 'HIV / AIDS test or treatment records' }
  ];

  for (const cat of categories) {
    const sub = document.createElement('fieldset');
    sub.className = 'field';
    const subLegend = document.createElement('legend');
    subLegend.className = 'label';
    subLegend.textContent = cat.legend;
    sub.appendChild(subLegend);

    const row = document.createElement('div');
    row.className = 'category-row';
    row.appendChild(radioGroup({
      label: 'Include',
      section: 'recordsToDisclose', field: cat.include,
      options: yesNo
    }));
    row.appendChild(textInput({
      label: 'Initials',
      section: 'recordsToDisclose', field: cat.initials,
      maxLength: 8
    }));
    sub.appendChild(row);
    card.appendChild(sub);
  }

  card.appendChild(textArea({
    label: 'Specific description of any other PHI',
    section: 'recordsToDisclose', field: 'otherDescription',
    placeholder: 'Describe any other records to disclose.',
    rows: 3
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Purpose of disclosure',
    description: 'Why is the information being requested?'
  });

  card.appendChild(radioGroup({
    label: 'Primary purpose',
    section: 'purposeOfDisclosure', field: 'primaryPurpose',
    required: true,
    options: [
      { value: 'eligibility-determination', label: 'Eligibility determination' },
      { value: 'continuing-treatment', label: 'Continuing treatment' },
      { value: 'insurance-claim', label: 'Insurance claim' },
      { value: 'legal-proceeding', label: 'Legal proceeding' },
      { value: 'personal-use', label: 'Personal use' },
      { value: 'research', label: 'Research' },
      { value: 'at-the-request-of-the-individual', label: 'At the request of the individual' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Other details',
    section: 'purposeOfDisclosure', field: 'otherDetails',
    placeholder: 'If "Other", explain the purpose here.',
    rows: 2
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Expiration',
    description: 'An expiration date or event is required. "None" is not permitted (except for research).'
  });

  card.appendChild(radioGroup({
    label: 'This authorization expires on',
    section: 'expiration', field: 'kind',
    required: true,
    options: [
      { value: 'date',     label: 'A specific date' },
      { value: 'event',    label: 'The occurrence of an event' },
      { value: 'duration', label: 'A duration after my signature' }
    ]
  }));

  const grid = document.createElement('div');
  grid.className = 'three-col';
  grid.appendChild(textInput({
    label: 'Expiration date',
    section: 'expiration', field: 'expirationDate', type: 'date'
  }));
  grid.appendChild(textInput({
    label: 'Expiration event',
    section: 'expiration', field: 'expirationEvent',
    placeholder: 'e.g., end of treatment'
  }));
  grid.appendChild(textInput({
    label: 'Duration (months)',
    section: 'expiration', field: 'durationMonths',
    type: 'number', min: 1, max: 120
  }));
  card.appendChild(grid);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Patient rights acknowledgements',
    description: 'Confirm each statement below.'
  });

  card.appendChild(checkboxInput({
    label: 'I understand I may revoke this authorization in writing at any time.',
    section: 'patientRightsAcknowledgement',
    field: 'acknowledgedRightToRevoke'
  }));
  card.appendChild(checkboxInput({
    label: 'I understand my treatment, payment, enrolment, or eligibility for benefits may not be conditioned on signing.',
    section: 'patientRightsAcknowledgement',
    field: 'acknowledgedNoConditioning'
  }));
  card.appendChild(checkboxInput({
    label: 'I understand the information may be re-disclosed by the recipient and no longer protected by the Privacy Rule.',
    section: 'patientRightsAcknowledgement',
    field: 'acknowledgedRedisclosureWarning'
  }));
  card.appendChild(checkboxInput({
    label: 'I understand I have the right to receive a copy of this signed form.',
    section: 'patientRightsAcknowledgement',
    field: 'acknowledgedRightToCopy'
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Signature, witness & date',
    description: 'Confirm signature and add witness details.'
  });

  card.appendChild(checkboxInput({
    label: 'I have signed this authorization.',
    section: 'signatureWitness',
    field: 'individualSignatureConfirmed'
  }));

  card.appendChild(textInput({
    label: 'Signature date',
    section: 'signatureWitness', field: 'signatureDate',
    type: 'date', required: true
  }));

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({
    label: 'Witness name',
    section: 'signatureWitness', field: 'witnessName'
  }));
  grid.appendChild(textInput({
    label: 'Witness date',
    section: 'signatureWitness', field: 'witnessDate', type: 'date'
  }));
  card.appendChild(grid);

  card.appendChild(checkboxInput({
    label: 'Witness has signed.',
    section: 'signatureWitness',
    field: 'witnessSignatureConfirmed'
  }));

  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
  renderStep6, renderStep7, renderStep8, renderStep9
];

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // 1 Patient
  ['patient', 'name'],
  ['patient', 'birthDate'],
  ['patient', 'streetAddress'],
  ['patient', 'city'],
  ['patient', 'state'],
  ['patient', 'zipCode'],
  ['patient', 'phone'],
  // 2 Signer
  ['signer', 'relationship'],
  // 3 Disclosing source
  ['disclosingSource', 'identificationMode'],
  // 4 Authorized recipient
  ['authorizedRecipient', 'recipientName'],
  // 5 Records to disclose (each include is its own answered field)
  ['recordsToDisclose', 'includeMedicalHealth'],
  ['recordsToDisclose', 'includeMentalHealth'],
  ['recordsToDisclose', 'includeSubstanceUse'],
  ['recordsToDisclose', 'includeHivAids'],
  // 6 Purpose
  ['purposeOfDisclosure', 'primaryPurpose'],
  // 7 Expiration
  ['expiration', 'kind'],
  // 8 Patient rights (each acknowledgement)
  ['patientRightsAcknowledgement', 'acknowledgedRightToRevoke'],
  ['patientRightsAcknowledgement', 'acknowledgedNoConditioning'],
  ['patientRightsAcknowledgement', 'acknowledgedRedisclosureWarning'],
  ['patientRightsAcknowledgement', 'acknowledgedRightToCopy'],
  // 9 Signature
  ['signatureWitness', 'individualSignatureConfirmed'],
  ['signatureWitness', 'signatureDate']
];

function isAnswered(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return Number.isFinite(value);
  return true;
}

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    const v = state[section] ? state[section][field] : null;
    if (isAnswered(v)) {
      answered++;
      sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
    }
  }
  const total = TRACKED_FIELDS.length;
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
  if (input) {
    input.setAttribute('aria-invalid', 'true');
    return;
  }
  const fs = document.getElementById(`${id}-fieldset`);
  if (fs) fs.setAttribute('aria-invalid', 'true');
}

function validateForm() {
  const errors = [];
  const form = document.getElementById('assessment-form');
  if (!form) return errors;

  // Plain required inputs (text/date/select/textarea).
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

  // Required radio groups (we set data-required on the fieldset legend's label
  // via the radioGroup builder when required:true). Detect by walking the
  // fieldset and checking for a current state value.
  const requiredRadioGroups = [
    { id: 'signer-relationship',                      label: 'Signer relationship' },
    { id: 'disclosingSource-identificationMode',      label: 'Disclosing source identification mode' },
    { id: 'purposeOfDisclosure-primaryPurpose',       label: 'Primary purpose' },
    { id: 'expiration-kind',                          label: 'Expiration kind' }
  ];
  for (const grp of requiredRadioGroups) {
    const [section, field] = grp.id.split('-');
    const v = state[section] && state[section][field];
    if (!v) {
      errors.push({ id: grp.id, message: `${grp.label} is required` });
      setFieldError(grp.id, `${grp.label} is required`);
    } else {
      clearFieldError(grp.id);
    }
  }

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
}

// ----------------------------------------------------------------------
// Report
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
    validityStatus, completenessScore, completenessStatus,
    firedRules, additionalFlags, validatedAt, validatorVersion
  } = lastResult;

  const statusBadgeClass = validityStatus === 'valid' ? 'badge-valid' : 'badge-invalid';

  const rulesList = firedRules.length === 0
    ? `<p class="muted">No HIPAA rules fired — every core element and required statement is present.</p>`
    : `
      <ul class="flags">
        ${firedRules.map((r) => `
          <li class="${priorityClass(r.priority)}">
            <span class="flag-priority">${esc(String(r.priority || '').toUpperCase())}</span>
            <span class="flag-category">${esc(r.id || r.ruleId || '')}</span>
            <span class="flag-message">${esc(r.description || '')} <em>(${esc(r.citation || '')})</em></span>
          </li>
        `).join('')}
      </ul>
    `;

  const flagsList = additionalFlags.length === 0
    ? `<p class="muted">No additional flags raised.</p>`
    : `
      <ul class="flags">
        ${additionalFlags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(String(f.priority || '').toUpperCase())}</span>
            <span class="flag-category">${esc(f.id || f.flagId || '')}</span>
            <span class="flag-message">${esc(f.message || '')}</span>
          </li>
        `).join('')}
      </ul>
    `;

  out.innerHTML = `
    <h2>HIPAA Authorization Report</h2>
    <p class="muted">Generated ${esc(new Date(validatedAt).toLocaleString())}${validatorVersion ? ` &middot; engine v${esc(validatorVersion)}` : ''}</p>

    <h3>Validity</h3>
    <p class="ess-summary">
      <span class="ess-score-badge ${statusBadgeClass}">${esc(validityStatus || 'unknown')}</span>
      <span class="ess-category">Completeness ${completenessScore}% (${esc(completenessStatus || '')})</span>
    </p>

    <h3>Fired rules</h3>
    ${rulesList}

    <h3>Additional flags</h3>
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
  lastResult = validateAuthorization(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh authorization?')) return;
  clearState();
  state = emptyAuthorization();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
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
