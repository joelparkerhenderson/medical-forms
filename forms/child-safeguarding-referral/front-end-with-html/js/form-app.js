import { detectFlaggedIssues } from './flags.js';
import { gradeReferral } from './grader.js';
import { emptyReferral, primaryCategoryLabel, priorityLabel, statusClass, statusLabel, urgencyClass, urgencyLabel, urgencyPathway } from './types.js';

// Child Safeguarding Referral — wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The referrer scrolls through the nine sections (referrer,
// child, family, concern, category of abuse, immediate risk, consent, who else
// is informed, and requested action / summary); a sticky top-of-page progress
// summary reflects how many fields have been answered, and a live readout shows
// the running completeness status (complete / partial / incomplete), the
// completeness percentage, AND the urgency classification (emergency / urgent /
// standard) — urgency is shown even while the referral is incomplete so danger
// is never hidden. Submission runs the pure engine (mandatory rules → status +
// completeness percent, urgency classification, and safeguarding flags) and
// renders an inline report. State is persisted to localStorage so a partial
// fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'child-safeguarding-referral.front-end-with-html.v1';

/** @returns {import('./types.js').SafeguardingReferral} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  // Merge over a fresh empty so any newly-added fields default correctly.
  const fresh = emptyReferral();

  for (const key of Object.keys(fresh)) {
    if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null) {
      fresh[key] = { ...fresh[key], ...parsed[key] };
    } else if (parsed && typeof parsed[key] !== 'object' && parsed[key] !== undefined) {
      fresh[key] = parsed[key];
    }
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyReferral();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved referral; starting fresh.', e);
    return emptyReferral();
  }
}

/** @param {import('./types.js').SafeguardingReferral} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save referral to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored referral.', e);
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

/** @type {import('./types.js').SafeguardingReferral} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'child-safeguarding-referral',
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
    refreshLiveStatus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 9;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-status readout after each change.
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
  refreshLiveStatus();
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

/** Map an <input type=…> to its Lily class name. */
function lilyInputClass(type) {
  switch (type) {
    case 'email':          return 'email-input';
    case 'number':         return 'number-input';
    case 'date':           return 'date-input';
    case 'datetime-local': return 'date-input';
    case 'time':           return 'time-input';
    case 'tel':            return 'tel-input';
    case 'url':            return 'url-input';
    case 'search':         return 'search-input';
    default:               return 'text-input';
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
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);
  if (opts.required) attrs.push('required', 'data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    let v;
    if (input.value === '' && (type === 'date' || type === 'datetime-local' || type === 'number')) {
      v = null;
    } else if (type === 'number') {
      const parsed = parseFloat(input.value);
      v = Number.isNaN(parsed) ? null : parsed;
    } else {
      v = input.value;
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
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
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

function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const labelText = esc(opts.label);

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${opts.required ? ' required data-required' : ''}>
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
  if (opts.hint) {
    const hint = document.createElement('span');
    hint.className = 'hint';
    hint.textContent = opts.hint;
    wrapper.appendChild(hint);
  }
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
// Option lists
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const yesNoUnknown = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' }
];

const childSexOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' }
];

const primaryCategoryOptions = [
  { value: 'physical', label: 'Physical abuse' },
  { value: 'emotional', label: 'Emotional abuse' },
  { value: 'sexual', label: 'Sexual abuse' },
  { value: 'neglect', label: 'Neglect' }
];

const consentStatusOptions = [
  { value: 'given', label: 'Consent given' },
  { value: 'refused', label: 'Consent refused' },
  { value: 'not-sought', label: 'Consent not sought' }
];

const sharingBasisOptions = [
  { value: 'risk-of-serious-harm', label: 'Risk of serious harm' },
  { value: 'seeking-consent-increases-risk', label: 'Seeking consent would increase risk' },
  { value: 'not-applicable', label: 'Not applicable (consent given)' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per section)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Referrer details',
    description: 'Who is making this referral, and how children’s social care can contact you.'
  });
  card.appendChild(textInput({
    label: 'Your name', section: 'referrer', field: 'referrerName',
    required: true, placeholder: 'e.g. Sarah Ahmed'
  }));
  card.appendChild(textInput({
    label: 'Your role / job title', section: 'referrer', field: 'referrerRole',
    placeholder: 'e.g. Designated Safeguarding Lead'
  }));
  card.appendChild(textInput({
    label: 'Organisation', section: 'referrer', field: 'referrerOrganisation',
    placeholder: 'e.g. Oakfield Primary School'
  }));
  card.appendChild(textInput({
    label: 'Contact phone', section: 'referrer', field: 'referrerPhone',
    type: 'tel', required: true,
    hint: 'A phone number OR an email is required so the duty team can reach you.',
    placeholder: 'e.g. 020 7946 0000'
  }));
  card.appendChild(textInput({
    label: 'Contact email', section: 'referrer', field: 'referrerEmail',
    type: 'email', placeholder: 'e.g. s.ahmed@oakfield.sch.uk'
  }));
  card.appendChild(textInput({
    label: 'Date and time of referral', section: 'referrer', field: 'referredAt',
    type: 'datetime-local'
  }));
  card.appendChild(textInput({
    label: 'Your relationship to the child', section: 'referrer', field: 'relationshipToChild',
    placeholder: 'e.g. Class teacher'
  }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Child details',
    description: 'Who the referral is about, so the child can be identified across services.'
  });
  card.appendChild(textInput({
    label: 'Child’s name', section: 'child', field: 'childName',
    required: true, placeholder: 'e.g. Jamie Clarke'
  }));
  card.appendChild(textInput({
    label: 'Date of birth', section: 'child', field: 'childDateOfBirth',
    type: 'date',
    hint: 'Provide a date of birth OR an age below.'
  }));
  card.appendChild(textInput({
    label: 'Age (years)', section: 'child', field: 'childAge',
    type: 'number', min: 0, max: 17, step: 1,
    hint: 'Used only when the date of birth is unknown.'
  }));
  card.appendChild(selectInput({
    label: 'Sex', section: 'child', field: 'childSex', options: childSexOptions
  }));
  card.appendChild(textArea({
    label: 'Home address', section: 'child', field: 'childAddress', rows: 2,
    placeholder: 'Where the child normally lives'
  }));
  card.appendChild(textInput({
    label: 'School / nursery / college', section: 'child', field: 'childSetting',
    placeholder: 'Education or care setting'
  }));
  card.appendChild(textInput({
    label: 'NHS number or local reference', section: 'child', field: 'childReference',
    placeholder: 'e.g. 943 476 5919'
  }));
  card.appendChild(textInput({
    label: 'Ethnicity', section: 'child', field: 'childEthnicity',
    placeholder: 'Self-described where known'
  }));
  card.appendChild(textInput({
    label: 'First language', section: 'child', field: 'childFirstLanguage',
    hint: 'Records any interpreter need.', placeholder: 'e.g. English'
  }));
  card.appendChild(textArea({
    label: 'Disability or communication need', section: 'child', field: 'childDisability',
    rows: 2, placeholder: 'Any disability or communication need'
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Family and household',
    description: 'Who cares for the child, who else is in the household, and who is already involved.'
  });
  card.appendChild(textArea({
    label: 'Parents / carers with parental responsibility', section: 'family', field: 'carers',
    placeholder: 'Names, relationships, and contact details'
  }));
  card.appendChild(textArea({
    label: 'Other household members', section: 'family', field: 'householdMembers',
    placeholder: 'Other adults or children living at the address'
  }));
  card.appendChild(textArea({
    label: 'Siblings / other children in the household', section: 'family', field: 'otherChildren',
    hint: 'Other children who may also be affected.',
    placeholder: 'Names and ages of other children'
  }));
  card.appendChild(textArea({
    label: 'Professionals already involved', section: 'family', field: 'professionalsInvolved',
    placeholder: 'e.g. GP, health visitor, existing social worker'
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'The concern',
    description: 'What the concern or allegation is, and how it came to light.'
  });
  card.appendChild(textArea({
    label: 'Description of the concern or allegation', section: 'concern', field: 'concernDescription',
    required: true, rows: 4,
    hint: 'A concise, factual description of what has happened or been observed.',
    placeholder: 'e.g. Repeated unexplained bruising; child fearful of going home.'
  }));
  card.appendChild(textArea({
    label: 'When and how it came to light', section: 'concern', field: 'concernOnset',
    placeholder: 'e.g. Disclosed to class teacher on 30 June during lunch.'
  }));
  card.appendChild(radioGroup({
    label: 'Has the child made a disclosure of abuse?', section: 'concern', field: 'childDisclosed',
    options: yesNo,
    hint: 'A disclosure raises a high-priority flag and drives urgency.'
  }));
  card.appendChild(textArea({
    label: 'Your own observations', section: 'concern', field: 'referrerObservations',
    placeholder: 'What you have directly seen or heard.'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Category of abuse',
    description: 'The primary category, any additional categories, and the presenting evidence.'
  });
  card.appendChild(selectInput({
    label: 'Primary category of abuse', section: 'category', field: 'primaryCategory',
    required: true, options: primaryCategoryOptions,
    hint: 'Select the category that best fits the main concern.'
  }));
  card.appendChild(textInput({
    label: 'Additional categories', section: 'category', field: 'additionalCategories',
    hint: 'Any further categories, e.g. "sexual, neglect".',
    placeholder: 'Comma-separated, if more than one'
  }));
  card.appendChild(textArea({
    label: 'Indicators and presenting evidence', section: 'category', field: 'presentingEvidence',
    placeholder: 'The indicators and evidence for the category (or categories).'
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Immediate risk and safety',
    description: 'Whether the child is in immediate danger, where they are, and who else may be at risk.'
  });
  card.appendChild(radioGroup({
    label: 'Is the child in immediate danger?', section: 'risk', field: 'immediateDanger',
    required: true, options: yesNo,
    hint: 'If yes, this is an emergency — phone 999 and social care now; do not wait for this form.'
  }));
  card.appendChild(textArea({
    label: 'Where is the child now?', section: 'risk', field: 'childWhereabouts', rows: 2,
    placeholder: 'Current location of the child.'
  }));
  card.appendChild(textInput({
    label: 'Who is with the child?', section: 'risk', field: 'whoWithChild',
    placeholder: 'Who is currently with the child.'
  }));
  card.appendChild(radioGroup({
    label: 'Is the alleged person who caused harm in contact with the child?',
    section: 'risk', field: 'allegedPersonInContact', options: yesNoUnknown
  }));
  card.appendChild(radioGroup({
    label: 'Are other children at risk?', section: 'risk', field: 'otherChildrenAtRisk',
    options: yesNoUnknown,
    hint: 'Siblings or other children in the household.'
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Consent and information sharing',
    description: 'The consent position, and — where consent was not given — the lawful basis for sharing (Working Together 2023).'
  });
  card.appendChild(radioGroup({
    label: 'Was consent to refer sought?', section: 'consent', field: 'consentSought',
    options: yesNo
  }));
  card.appendChild(selectInput({
    label: 'Consent status', section: 'consent', field: 'consentStatus',
    options: consentStatusOptions,
    hint: 'A valid referral needs consent given, or a lawful basis to share without it.'
  }));

  const conditional = document.createElement('div');
  conditional.setAttribute('data-conditional', 'consent.consentStatus!=given');
  const notice = document.createElement('p');
  notice.className = 'hint';
  notice.textContent =
    'Because consent was not given, record the lawful basis for sharing information without consent.';
  conditional.appendChild(notice);
  conditional.appendChild(selectInput({
    label: 'Lawful basis for sharing without consent', section: 'consent',
    field: 'sharingBasisWithoutConsent', options: sharingBasisOptions
  }));
  card.appendChild(conditional);

  card.appendChild(radioGroup({
    label: 'Are the child and family aware of this referral?', section: 'consent', field: 'familyAware',
    options: yesNo
  }));

  const unaware = document.createElement('div');
  unaware.setAttribute('data-conditional', 'consent.familyAware=no');
  const unawareNotice = document.createElement('p');
  unawareNotice.className = 'hint';
  unawareNotice.textContent =
    'Because the child / family are not aware, record why informing them would increase risk.';
  unaware.appendChild(unawareNotice);
  unaware.appendChild(textArea({
    label: 'Why informing would increase risk', section: 'consent', field: 'unsafeToInformReason',
    placeholder: 'The reason it is unsafe to inform the child or family at this stage.'
  }));
  card.appendChild(unaware);

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Who else is informed',
    description: 'Agencies already contacted, any strategy discussion, and prior safeguarding history.'
  });
  card.appendChild(textArea({
    label: 'Agencies already contacted', section: 'informed', field: 'agenciesContacted',
    placeholder: 'e.g. Police (101) informed on 30 June.'
  }));
  card.appendChild(radioGroup({
    label: 'Has a strategy discussion already been held?', section: 'informed', field: 'strategyDiscussionHeld',
    options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Previous safeguarding history', section: 'informed', field: 'previousSafeguardingHistory',
    hint: 'Prior involvement raises a flag so the duty team can link records.',
    placeholder: 'Any known prior safeguarding involvement.'
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Requested action and summary',
    description: 'What you are asking children’s social care to do, the live status, and your declaration.'
  });
  card.appendChild(textArea({
    label: 'Action requested of children’s social care', section: 'action', field: 'requestedAction',
    placeholder: 'e.g. Assessment under s17; strategy discussion; s47 enquiry.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Live status and urgency',
    id: 'live-status-readout',
    render: () => renderLiveStatus()
  }));

  card.appendChild(radioGroup({
    label: 'I confirm the information in this referral is accurate to the best of my knowledge',
    section: 'action', field: 'referrerDeclaration', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Free-text notes', section: 'action', field: 'notes',
    placeholder: 'Anything else the duty team should know.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readout
// ----------------------------------------------------------------------

/** Render the live completeness status + urgency + percentage. */
function renderLiveStatus() {
  const grade = gradeReferral(state);
  const statusBadge =
    `<span class="risk-badge ${statusClass(grade.status)}">${esc(statusLabel(grade.status))}</span>`;
  const urgencyBadge =
    `<span class="risk-badge ${urgencyClass(grade.urgency)}">${esc(urgencyLabel(grade.urgency))}</span>`;
  return `${statusBadge} ${urgencyBadge} <strong>${grade.completenessPercent}% complete</strong> ` +
    `<span class="muted">(${grade.satisfiedCount} of ${grade.mandatoryCount} mandatory requirements met)</span>`;
}

function refreshLiveStatus() {
  const el = document.getElementById('live-status-readout');
  if (el) el.innerHTML = renderLiveStatus();
}

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const negate = expr.includes('!=');
    const [path, target] = expr.split(negate ? '!=' : '=');
    const [section, field] = path.split('.');
    const current = state[section] ? state[section][field] : undefined;
    const matches = String(current) === target;
    host.style.display = (negate ? !matches : matches) ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each section maps to one or more progress "slots". A slot counts as answered
// when ANY of its fields is answered. Slots mirror the mandatory-plus-key
// content so progress tracks how close the referral is to being complete.
const STEP_SLOTS = {
  referrer: [['referrerName'], ['referrerPhone', 'referrerEmail']],
  child: [['childName'], ['childDateOfBirth', 'childAge']],
  family: [['carers', 'householdMembers', 'otherChildren', 'professionalsInvolved']],
  concern: [['concernDescription']],
  category: [['primaryCategory']],
  risk: [['immediateDanger']],
  consent: [['consentStatus', 'sharingBasisWithoutConsent']],
  informed: [['agenciesContacted', 'strategyDiscussionHeld', 'previousSafeguardingHistory']],
  action: [['requestedAction', 'referrerDeclaration']]
};

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  let total = 0;
  const sectionAnswered = {};
  const sectionTotal = {};

  for (const section of Object.keys(STEP_SLOTS)) {
    const slots = STEP_SLOTS[section];
    sectionTotal[section] = slots.length;
    sectionAnswered[section] = 0;
    for (const slot of slots) {
      total++;
      const slotAnswered = slot.some((field) => isAnswered(section, field));
      if (slotAnswered) {
        answered++;
        sectionAnswered[section]++;
      }
    }
  }

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
    status, urgency, completenessPercent, satisfiedCount, mandatoryCount,
    firedRules, flaggedIssues, timestamp
  } = lastResult;

  const ruleRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.description)}</th>
      <td class="num">
        <span class="grade-pill ${r.satisfied ? 'risk-low' : 'risk-high'}">
          ${r.satisfied ? 'Satisfied' : 'Unsatisfied'}
        </span>
      </td>
    </tr>
  `).join('');

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No safeguarding flags raised.</p>`
    : `
      <ul class="flags">
        ${flaggedIssues.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority))}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}${f.suggestedAction ? ` — ${esc(f.suggestedAction)}` : ''}</span>
          </li>
        `).join('')}
      </ul>
    `;

  let guidance;
  if (status === 'incomplete') {
    guidance = `<p>This referral is <strong>incomplete</strong>: one or more mandatory requirements are unmet, so it is not yet valid to submit. Complete the outstanding items below. The urgency classification is still shown so that any danger is not hidden by an incomplete form.</p>`;
  } else if (status === 'partial') {
    guidance = `<p>This referral is <strong>partial</strong>: every mandatory requirement is met, so it is submittable, but recommended detail is missing and the duty team will have gaps. Add the recommended information where you can.</p>`;
  } else {
    guidance = `<p>This referral is <strong>complete</strong>: every mandatory and recommended field is populated. It is ready to submit to children’s social care.</p>`;
  }

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Child Safeguarding Referral — Completeness &amp; Urgency Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${urgencyClass(urgency)}">
        <div>
          <span class="risk-banner-label">Urgency</span>
          <span class="risk-banner-value">${esc(urgencyLabel(urgency))}</span>
        </div>
        <span class="risk-badge ${statusClass(status)}">${esc(statusLabel(status))} — ${completenessPercent}%</span>
      </div>

      <p class="pathway"><strong>Statutory pathway:</strong> ${esc(urgencyPathway(urgency))}</p>
      <p><strong>Primary category:</strong> ${esc(primaryCategoryLabel(state.category.primaryCategory))}</p>

      <h3>Recommended action</h3>
      ${guidance}

      <h3>Mandatory requirements (${satisfiedCount} of ${mandatoryCount} met)</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Mandatory requirement</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>${ruleRows}</tbody>
      </table>

      <h3>Safeguarding flags (${flaggedIssues.length})</h3>
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
  const grade = gradeReferral(state);
  const flaggedIssues = detectFlaggedIssues(state);
  lastResult = {
    status: grade.status,
    urgency: grade.urgency,
    completenessPercent: grade.completenessPercent,
    presentCount: grade.presentCount,
    applicableCount: grade.applicableCount,
    satisfiedCount: grade.satisfiedCount,
    mandatoryCount: grade.mandatoryCount,
    firedRules: grade.firedRules,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh referral?')) return;
  clearState();
  state = emptyReferral();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveStatus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'referrer', title: 'Referrer' },
  { step: 2, section: 'child',    title: 'Child' },
  { step: 3, section: 'family',   title: 'Family' },
  { step: 4, section: 'concern',  title: 'Concern' },
  { step: 5, section: 'category', title: 'Category' },
  { step: 6, section: 'risk',     title: 'Immediate risk' },
  { step: 7, section: 'consent',  title: 'Consent' },
  { step: 8, section: 'informed', title: 'Informed' },
  { step: 9, section: 'action',   title: 'Action & summary' }
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
  const required = form.querySelectorAll('input[data-required], select[data-required], textarea[data-required]');
  const seen = new Set();
  required.forEach((input) => {
    let id = input.id;
    if (input.type === 'radio') id = input.name;
    if (seen.has(id)) return;
    seen.add(id);
    // Skip fields hidden inside a collapsed conditional section.
    const conditional = input.closest('[data-conditional]');
    if (conditional && conditional.style.display === 'none') return;
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveStatus();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
