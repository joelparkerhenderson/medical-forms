import { validateM1 } from './m1-validator.js';
import { emptyAssessment, priorityLabel } from './types.js';

// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a top-of-page native
// <progress> + step-list reflects how many fields have been answered.
// Submission runs the pure validator and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.
//
// Conditional rendering: when Q1 = No, the Q2 (Mental Health Conditions)
// and Q3 (Recent Contact) section cards are hidden from view entirely; the
// form ends after Q1 -> Authorisation. When Q1 = Yes, both sections are
// visible. This mirrors the SvelteKit step components.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'united-kingdom-driver-and-vehicle-licensing-agency-m1-form.front-end-form-with-html.v1';
const TOTAL_STEPS = 6;

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
      if (key === 'healthcareProfessionals') {
        const hp = parsed[key];
        fresh[key].gp = Object.assign({}, fresh[key].gp, hp.gp || {});
        fresh[key].consultant = Object.assign({}, fresh[key].consultant, hp.consultant || {});
      } else {
        fresh[key] = Object.assign({}, fresh[key], parsed[key]);
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
    console.warn('Could not parse saved M1 submission; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} stateArg */
function saveState(stateArg) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateArg));
  } catch (e) {
    console.warn('Could not save M1 submission to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored M1 submission.', e);
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

/** @type {import('./types.js').ValidationResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'united-kingdom-driver-and-vehicle-licensing-agency-m1-form',
  hadDraftAtLoad,
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
    updateConditionalSections();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function setField(path, value) {
  const parts = path.split('.');
  let node = state;
  for (let i = 0; i < parts.length - 1; i++) node = node[parts[i]];
  node[parts[parts.length - 1]] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
}

function getField(path) {
  const parts = path.split('.');
  let node = state;
  for (const p of parts) {
    if (node == null) return undefined;
    node = node[p];
  }
  return node;
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pathToId(path) {
  return path.replace(/\./g, '-');
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
// Component builders
// ----------------------------------------------------------------------

function textInput(opts) {
  const id = pathToId(opts.path);
  const value = getField(opts.path) || '';
  const labelText =
    esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const cls = lilyInputClass(type);
  const placeholderAttr = opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '';
  const requiredAttrs = opts.required ? ' required data-required' : '';
  const labelRequired = opts.required ? ' data-required' : '';

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML =
    '<label class="label" for="' + id + '"' + labelRequired + '>' + labelText + '</label>' +
    '<input id="' + id + '" name="' + id + '" type="' + type + '" class="' + cls + '"' +
    ' value="' + esc(value) + '"' + placeholderAttr +
    ' aria-describedby="' + id + '-error"' + requiredAttrs + '>' +
    '<span class="error-message" id="' + id + '-error"></span>';

  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    setField(opts.path, input.value);
    clearFieldError(id);
  });
  return wrapper;
}

function textArea(opts) {
  const id = pathToId(opts.path);
  const value = getField(opts.path) || '';
  const labelText =
    esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const placeholderAttr = opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '';
  const requiredAttrs = opts.required ? ' required data-required' : '';
  const labelRequired = opts.required ? ' data-required' : '';

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML =
    '<label class="label" for="' + id + '"' + labelRequired + '>' + labelText + '</label>' +
    '<textarea id="' + id + '" name="' + id + '" rows="' + (opts.rows || 3) + '"' +
    placeholderAttr + ' class="text-area-input"' +
    ' aria-describedby="' + id + '-error"' + requiredAttrs + '>' + esc(value) + '</textarea>' +
    '<span class="error-message" id="' + id + '-error"></span>';
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => {
    setField(opts.path, ta.value);
    clearFieldError(id);
  });
  return wrapper;
}

function radioGroup(opts) {
  const groupId = pathToId(opts.path);
  const current = getField(opts.path);
  const labelText =
    esc(opts.label) +
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
    const radioId = groupId + '-' + (option.value || 'blank');
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
        setField(opts.path, option.value);
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

function yesNoQuestion(opts) {
  return radioGroup({
    label: opts.label,
    path: opts.path,
    required: opts.required,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ]
  });
}

function sectionCard(opts) {
  const card = document.createElement('fieldset');
  card.className = 'fieldset';
  card.dataset.step = String(opts.stepNumber);
  card.id = opts.id || ('step-' + opts.stepNumber);
  const desc = opts.description
    ? '<span class="section-description">' + esc(opts.description) + '</span>'
    : '';
  const legend = document.createElement('legend');
  legend.className = 'fieldset-legend';
  legend.innerHTML =
    '<span class="section-step">Step ' + opts.stepNumber + ' of ' + TOTAL_STEPS + '</span>' +
    '<h2 class="section-title">' + esc(opts.title) + '</h2>' +
    desc;
  card.appendChild(legend);
  return card;
}

function notice(kind, html) {
  const div = document.createElement('div');
  div.className = 'notice notice-' + kind;
  div.innerHTML = html;
  return div;
}

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Part A — About You',
    description: 'Current driving licence details and any change of details.'
  });

  const grid1 = document.createElement('div');
  grid1.className = 'two-col';
  grid1.appendChild(textInput({
    label: 'Title',
    path: 'personalDetails.title',
    placeholder: 'e.g. Mr, Mrs, Ms, Dr'
  }));
  grid1.appendChild(textInput({
    label: 'Full name',
    path: 'personalDetails.fullName',
    required: true
  }));
  card.appendChild(grid1);

  card.appendChild(textInput({
    label: 'Date of birth',
    path: 'personalDetails.dateOfBirth',
    type: 'date',
    required: true
  }));

  card.appendChild(textArea({
    label: 'Address',
    path: 'personalDetails.address',
    rows: 3
  }));

  const grid2 = document.createElement('div');
  grid2.className = 'two-col';
  grid2.appendChild(textInput({
    label: 'Postcode',
    path: 'personalDetails.postcode',
    required: true
  }));
  grid2.appendChild(textInput({
    label: 'Contact number',
    path: 'personalDetails.contactNumber',
    type: 'tel'
  }));
  card.appendChild(grid2);

  card.appendChild(textInput({
    label: 'Email',
    path: 'personalDetails.email',
    type: 'email'
  }));

  card.appendChild(textArea({
    label: 'Change of details (optional)',
    path: 'personalDetails.changeOfDetails',
    placeholder: 'Note any changes (name, address, etc.) since your last licence',
    rows: 3
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Part B — Healthcare Professional',
    description: 'GP and consultant details for your mental health condition.'
  });

  const gpHeader = document.createElement('h3');
  gpHeader.className = 'section-subtitle';
  gpHeader.textContent = 'GP details';
  card.appendChild(gpHeader);

  card.appendChild(textInput({ label: 'GP name', path: 'healthcareProfessionals.gp.gpName' }));
  card.appendChild(textInput({ label: 'Surgery name', path: 'healthcareProfessionals.gp.surgeryName' }));
  card.appendChild(textArea({ label: 'Address', path: 'healthcareProfessionals.gp.address', rows: 2 }));

  const gpGrid1 = document.createElement('div');
  gpGrid1.className = 'two-col';
  gpGrid1.appendChild(textInput({ label: 'Town', path: 'healthcareProfessionals.gp.town' }));
  gpGrid1.appendChild(textInput({ label: 'Postcode', path: 'healthcareProfessionals.gp.postcode' }));
  card.appendChild(gpGrid1);

  const gpGrid2 = document.createElement('div');
  gpGrid2.className = 'two-col';
  gpGrid2.appendChild(textInput({
    label: 'Contact number',
    path: 'healthcareProfessionals.gp.contactNumber',
    type: 'tel'
  }));
  gpGrid2.appendChild(textInput({
    label: 'Email (if known)',
    path: 'healthcareProfessionals.gp.email',
    type: 'email'
  }));
  card.appendChild(gpGrid2);

  card.appendChild(textInput({
    label: 'Date last seen for this condition',
    path: 'healthcareProfessionals.gp.dateLastSeen',
    type: 'date'
  }));

  const hr1 = document.createElement('hr');
  hr1.className = 'section-divider';
  card.appendChild(hr1);

  const conHeader = document.createElement('h3');
  conHeader.className = 'section-subtitle';
  conHeader.textContent = 'Consultant details';
  card.appendChild(conHeader);

  card.appendChild(textInput({ label: 'Consultant name', path: 'healthcareProfessionals.consultant.consultantName' }));

  const conGrid0 = document.createElement('div');
  conGrid0.className = 'two-col';
  conGrid0.appendChild(textInput({ label: 'Speciality', path: 'healthcareProfessionals.consultant.speciality' }));
  conGrid0.appendChild(textInput({ label: 'Department', path: 'healthcareProfessionals.consultant.department' }));
  card.appendChild(conGrid0);

  card.appendChild(textInput({ label: 'Hospital name', path: 'healthcareProfessionals.consultant.hospitalName' }));
  card.appendChild(textArea({ label: 'Address', path: 'healthcareProfessionals.consultant.address', rows: 2 }));

  const conGrid1 = document.createElement('div');
  conGrid1.className = 'two-col';
  conGrid1.appendChild(textInput({ label: 'Town', path: 'healthcareProfessionals.consultant.town' }));
  conGrid1.appendChild(textInput({ label: 'Postcode', path: 'healthcareProfessionals.consultant.postcode' }));
  card.appendChild(conGrid1);

  const conGrid2 = document.createElement('div');
  conGrid2.className = 'two-col';
  conGrid2.appendChild(textInput({
    label: 'Contact number',
    path: 'healthcareProfessionals.consultant.contactNumber',
    type: 'tel'
  }));
  conGrid2.appendChild(textInput({
    label: 'Email (if known)',
    path: 'healthcareProfessionals.consultant.email',
    type: 'email'
  }));
  card.appendChild(conGrid2);

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
    title: 'Question 1 — Diagnosis Confirmation',
    description: 'Medical Questionnaire — Mental Health.'
  });

  card.appendChild(yesNoQuestion({
    label: 'Have you been diagnosed with a mental health condition?',
    path: 'diagnosisConfirmation.hasMentalHealthDiagnosis',
    required: true
  }));

  const noNotice = notice(
    'info',
    'You answered <strong>No</strong>. The DVLA instructions ask you not to complete Questions 2 or 3. You may continue directly to the authorisation step, or start over.'
  );
  noNotice.dataset.conditional = 'diagnosisConfirmation.hasMentalHealthDiagnosis=no';
  card.appendChild(noNotice);

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Question 2 — Mental Health Conditions',
    description:
      'Please confirm what mental health condition you have been diagnosed with. Mark Yes or No for each.'
  });
  card.dataset.conditional = 'diagnosisConfirmation.hasMentalHealthDiagnosis!=no';

  card.appendChild(yesNoQuestion({
    label:
      'Anxiety or depression (without any impairment of concentration, memory or agitation)',
    path: 'mentalHealthConditions.anxietyDepressionWithoutImpairment'
  }));
  card.appendChild(yesNoQuestion({
    label:
      'Anxiety or depression (with suicidal thoughts or impairment in concentration, memory or agitation)',
    path: 'mentalHealthConditions.anxietyDepressionWithImpairment'
  }));
  card.appendChild(yesNoQuestion({
    label: 'Bipolar affective disorder',
    path: 'mentalHealthConditions.bipolarAffectiveDisorder'
  }));
  card.appendChild(yesNoQuestion({
    label: 'Eating disorder (anorexia nervosa, bulimia)',
    path: 'mentalHealthConditions.eatingDisorder'
  }));
  card.appendChild(yesNoQuestion({
    label: 'Obsessive compulsive disorder or post-traumatic stress disorder',
    path: 'mentalHealthConditions.ocdOrPtsd'
  }));
  card.appendChild(yesNoQuestion({
    label: 'Personality disorder (any type)',
    path: 'mentalHealthConditions.personalityDisorder'
  }));
  card.appendChild(yesNoQuestion({
    label:
      'Schizophrenia or psychosis or delusional disorder or schizoaffective disorder',
    path: 'mentalHealthConditions.schizophreniaOrPsychosis'
  }));
  card.appendChild(yesNoQuestion({
    label: 'Other (please specify)',
    path: 'mentalHealthConditions.other'
  }));

  const detailsHost = document.createElement('div');
  detailsHost.dataset.conditional = 'mentalHealthConditions.other=yes';
  detailsHost.appendChild(textArea({
    label: 'Please specify the other mental health condition',
    path: 'mentalHealthConditions.otherDetails',
    rows: 3
  }));
  card.appendChild(detailsHost);

  const impairWarn = notice(
    'warn',
    'You indicated suicidal thoughts or impairment. If you are in immediate danger, please call your local emergency number (999 in the UK) or contact the Samaritans on 116 123. Your healthcare professional should review this report urgently.'
  );
  impairWarn.dataset.conditional = 'mentalHealthConditions.anxietyDepressionWithImpairment=yes';
  card.appendChild(impairWarn);

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Question 3 — Recent Contact',
    description:
      'Recent contact with your healthcare professional about your mental health condition.'
  });
  card.dataset.conditional = 'diagnosisConfirmation.hasMentalHealthDiagnosis!=no';

  card.appendChild(yesNoQuestion({
    label:
      'Have you had any contact (any phone, video or face-to-face consultation) with your healthcare professional about your mental health condition in the last 12 months?',
    path: 'recentContact.hadRecentContact'
  }));

  const datesHost = document.createElement('div');
  datesHost.dataset.conditional = 'recentContact.hadRecentContact=yes';
  const note = document.createElement('p');
  note.className = 'muted';
  note.style.margin = '0.25rem 0 0.5rem';
  note.textContent = 'If yes, supply the last date of any contact:';
  datesHost.appendChild(note);
  datesHost.appendChild(textInput({
    label: 'Doctor — date last seen',
    path: 'recentContact.doctorLastDate',
    type: 'date'
  }));
  datesHost.appendChild(textInput({
    label: 'Consultant — date last seen',
    path: 'recentContact.consultantLastDate',
    type: 'date'
  }));
  datesHost.appendChild(textInput({
    label: 'Community psychiatric nurse — date last seen',
    path: 'recentContact.communityPsychiatricNurseLastDate',
    type: 'date'
  }));
  card.appendChild(datesHost);

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: "Applicant's Authorisation",
    description: 'Declaration authorising medical disclosure and contact preferences.'
  });

  card.appendChild(notice(
    'muted',
    'I authorise the release of medical reports and information to the Drivers Medical Group, DVLA, by my doctor(s) or those mentioned on this form, in strict confidence, to enable the DVLA to assess my fitness to drive. I understand that making a false declaration to obtain a driving licence is a criminal offence under section 174 of the Road Traffic Act 1988.'
  ));

  card.appendChild(yesNoQuestion({
    label: 'I confirm the declaration above',
    path: 'authorisation.declarationConfirmed',
    required: true
  }));

  const sigGrid = document.createElement('div');
  sigGrid.className = 'two-col';
  sigGrid.appendChild(textInput({
    label: 'Name (printed)',
    path: 'authorisation.signatoryName',
    required: true
  }));
  sigGrid.appendChild(textInput({
    label: 'Signature (typed)',
    path: 'authorisation.signatureText'
  }));
  card.appendChild(sigGrid);

  card.appendChild(textInput({
    label: 'Date',
    path: 'authorisation.signatureDate',
    type: 'date',
    required: true
  }));

  const hr = document.createElement('hr');
  hr.className = 'section-divider';
  card.appendChild(hr);

  card.appendChild(yesNoQuestion({
    label: 'Do you consent to electronic correspondence (email) from the DVLA?',
    path: 'authorisation.electronicCorrespondenceConsent'
  }));

  const contactOpts = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS (Text)' }
  ];
  card.appendChild(radioGroup({
    label: 'Preferred contact method from the DVLA',
    path: 'authorisation.dvlaContactPreference',
    options: contactOpts
  }));
  card.appendChild(radioGroup({
    label:
      'Preferred contact method from your healthcare professional on behalf of the DVLA',
    path: 'authorisation.healthcareProfessionalContactPreference',
    options: contactOpts
  }));

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  const hosts = document.querySelectorAll('[data-conditional]');
  hosts.forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    let path, target, negate = false;
    if (expr.includes('!=')) {
      const parts = expr.split('!=');
      path = parts[0]; target = parts[1];
      negate = true;
    } else {
      const parts = expr.split('=');
      path = parts[0]; target = parts[1];
    }
    const current = getField(path);
    const matches = String(current == null ? '' : current) === target;
    const visible = negate ? !matches : matches;
    host.style.display = visible ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Step-list
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, title: 'About you' },
  { step: 2, title: 'Healthcare' },
  { step: 3, title: 'Q1 Diagnosis' },
  { step: 4, title: 'Q2 Conditions' },
  { step: 5, title: 'Q3 Recent contact' },
  { step: 6, title: 'Authorisation' }
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
    li.setAttribute('aria-label', 'Step ' + def.step + ': ' + def.title);
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

const TRACKED_FIELDS_BY_STEP = {
  1: [
    'personalDetails.fullName',
    'personalDetails.dateOfBirth',
    'personalDetails.address',
    'personalDetails.postcode'
  ],
  2: [], // optional
  3: ['diagnosisConfirmation.hasMentalHealthDiagnosis'],
  4: [
    'mentalHealthConditions.anxietyDepressionWithoutImpairment',
    'mentalHealthConditions.anxietyDepressionWithImpairment',
    'mentalHealthConditions.bipolarAffectiveDisorder',
    'mentalHealthConditions.eatingDisorder',
    'mentalHealthConditions.ocdOrPtsd',
    'mentalHealthConditions.personalityDisorder',
    'mentalHealthConditions.schizophreniaOrPsychosis',
    'mentalHealthConditions.other'
  ],
  5: ['recentContact.hadRecentContact'],
  6: [
    'authorisation.declarationConfirmed',
    'authorisation.signatoryName',
    'authorisation.signatureDate'
  ]
};

function updateProgress() {
  const stoppedAtQ1 = state.diagnosisConfirmation.hasMentalHealthDiagnosis === 'no';
  let total = 0;
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};

  for (const step of Object.keys(TRACKED_FIELDS_BY_STEP)) {
    const n = parseInt(step, 10);
    if (stoppedAtQ1 && (n === 4 || n === 5)) continue;
    const paths = TRACKED_FIELDS_BY_STEP[step];
    sectionTotal[n] = paths.length;
    sectionAnswered[n] = 0;
    for (const path of paths) {
      total++;
      const v = getField(path);
      if (v !== null && v !== undefined && v !== '') {
        answered++;
        sectionAnswered[n]++;
      }
    }
  }
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = answered + ' of ' + total + ' fields answered (' + percent + '%)';
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Validation UI
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

function isInsideHiddenConditional(el) {
  let cur = el;
  while (cur && cur !== document.body) {
    if (cur.style && cur.style.display === 'none') return true;
    cur = cur.parentElement;
  }
  return false;
}

function validateForm() {
  const errors = [];
  document.querySelectorAll('[data-required]').forEach((el) => {
    const tag = (el.tagName || '').toLowerCase();
    if (tag !== 'input' && tag !== 'select' && tag !== 'textarea') return;
    if (isInsideHiddenConditional(el)) return;
    const id = el.id;
    if (!id) return;
    if (tag === 'input' && el.type === 'radio') {
      const name = el.name;
      const checked = document.querySelector('input[type="radio"][name="' + name + '"]:checked');
      if (!checked) {
        errors.push({ id: name, message: 'Please answer this question.' });
        setFieldError(name, 'Please answer this question.');
      }
      return;
    }
    let missing = false;
    if (tag === 'input' && el.type === 'checkbox') {
      if (!el.checked) missing = true;
    } else if (el.value == null || String(el.value).trim() === '') {
      missing = true;
    }
    if (missing) {
      errors.push({ id: id, message: 'Please complete this field.' });
      setFieldError(id, 'Please complete this field.');
    } else {
      clearFieldError(id);
    }
  });
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

function capitalise(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function renderReport() {
  const result = lastResult;
  if (!result) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    complete,
    stoppedAtQ1,
    firedRules,
    additionalFlags,
    conditionCount,
    timestamp
  } = result;

  const statusBadge = stoppedAtQ1
    ? '<span class="status-badge status-stopped">Stopped at Q1 (No diagnosis)</span>'
    : complete
    ? '<span class="status-badge status-complete">Complete</span>'
    : '<span class="status-badge status-incomplete">Incomplete</span>';

  const ruleItems = firedRules.map((r) => ({
    priority: r.priority,
    category: capitalise(r.category),
    message: r.message
  }));
  const flagItems = additionalFlags.map((f) => ({
    priority: f.priority,
    category: f.category,
    message: f.message
  }));
  const allItems = ruleItems.concat(flagItems).sort((a, b) => {
    const order = { urgent: 0, high: 1, medium: 2, low: 3 };
    return (order[a.priority] || 99) - (order[b.priority] || 99);
  });

  const flagsList = allItems.length === 0
    ? '<p class="muted">No flags raised. Submission appears complete.</p>'
    : '<ul class="flags">' +
      allItems.map((f) =>
        '<li class="' + priorityClass(f.priority) + '">' +
        '<span class="flag-priority">' + esc(priorityLabel(f.priority).toUpperCase()) + '</span>' +
        '<span class="flag-category">' + esc(f.category) + '</span>' +
        '<span class="flag-message">' + esc(f.message) + '</span>' +
        '</li>'
      ).join('') +
      '</ul>';

  out.innerHTML =
    '<h2>DVLA M1 Validation Report</h2>' +
    '<p class="muted">Generated ' + esc(new Date(timestamp).toLocaleString()) + '</p>' +
    '<h3>Submission Status</h3>' +
    '<dl class="summary-grid">' +
    '<dt>Status</dt><dd>' + statusBadge + '</dd>' +
    '<dt>Q1 (diagnosed)</dt><dd>' + esc(stoppedAtQ1 ? 'No' : (state.diagnosisConfirmation.hasMentalHealthDiagnosis === 'yes' ? 'Yes' : 'Unanswered')) + '</dd>' +
    '<dt>Q2 conditions</dt><dd>' + (stoppedAtQ1 ? 'n/a' : conditionCount) + '</dd>' +
    '<dt>Validation problems</dt><dd>' + firedRules.length + '</dd>' +
    '<dt>Additional flags</dt><dd>' + additionalFlags.length + '</dd>' +
    '</dl>' +
    '<h3>Flagged Issues</h3>' + flagsList +
    '<div class="report-actions">' +
    '<button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>' +
    '</div>';
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
}

function submitForm() {
  validateForm();
  lastResult = validateM1(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh M1 submission?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const out = document.getElementById('report');
  if (out) out.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
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
