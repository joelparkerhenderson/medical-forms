import { detectFlaggedIssues } from './flagged-issues.js';
import { emptyAssessment, hasText, isDoubleVisionBranchActive, isLaserTreatmentBranchActive, isMonocularBranchActive, isVisualFieldBranchActive, isVisualFieldCauseBranchActive, priorityLabel, sectionLabel } from './types.js';
import { validateV1 } from './v1-validator.js';

// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a top-of-page progress
// summary reflects how many tracked rules are satisfied. Submission runs the
// pure validator + flagged-issues engine and renders an inline report. State
// is persisted to localStorage so a partial fill survives a page reload.
// Conditional sections (Q2 No -> monocular branch, Q3 Yes -> visual-field
// cause branch, Q4-Q8 skip-when-No, Q9 controlled-status, Q10/Q11 details)
// are hidden via re-render.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'united-kingdom-driver-and-vehicle-licensing-agency-v1-form.front-end-form-with-html.v1';

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
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyAssessment();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved V1 form; starting fresh.', e);
    return emptyAssessment();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save V1 form to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored V1 form.', e);
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

/** @type {{ validation: any, flags: any[], timestamp: string } | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'united-kingdom-driver-and-vehicle-licensing-agency-v1-form',
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function getPath(path) {
  const parts = path.split('.');
  let cur = state;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

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

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ----------------------------------------------------------------------
// Field component builders
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
  const id = `f-${opts.path.replace(/\./g, '-')}`;
  const value = getPath(opts.path) ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const cls = lilyInputClass(type);
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.dataset.path = opts.path;
  const placeholderAttr = opts.placeholder ? ` placeholder="${esc(opts.placeholder)}"` : '';
  const requiredAttrs = opts.required ? ' required data-required' : '';
  const labelRequired = opts.required ? ' data-required' : '';
  wrapper.innerHTML =
    `<label class="label" for="${id}"${labelRequired}>${labelText}</label>` +
    `<input id="${id}" name="${id}" type="${type}" class="${cls}"` +
    ` value="${esc(value)}"${placeholderAttr}` +
    ` aria-describedby="${id}-error"${requiredAttrs}>` +
    `<span class="error-message" id="${id}-error"></span>`;
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

function textArea(opts) {
  const id = `f-${opts.path.replace(/\./g, '-')}`;
  const value = getPath(opts.path) ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.dataset.path = opts.path;
  const placeholderAttr = opts.placeholder ? ` placeholder="${esc(opts.placeholder)}"` : '';
  const requiredAttrs = opts.required ? ' required data-required' : '';
  const labelRequired = opts.required ? ' data-required' : '';
  wrapper.innerHTML =
    `<label class="label" for="${id}"${labelRequired}>${labelText}</label>` +
    `<textarea id="${id}" name="${id}" rows="${opts.rows || 3}"` +
    ` class="text-area-input"${placeholderAttr}` +
    ` aria-describedby="${id}-error"${requiredAttrs}>${esc(value)}</textarea>` +
    `<span class="error-message" id="${id}-error"></span>`;
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

function radioGroup(opts) {
  const groupId = `f-${opts.path.replace(/\./g, '-')}`;
  const current = getPath(opts.path);
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = groupId + '-fieldset';
  wrapper.dataset.path = opts.path;

  const legend = document.createElement('legend');
  legend.className = 'label';
  if (opts.required) legend.setAttribute('data-required', '');
  legend.innerHTML = labelText;
  wrapper.appendChild(legend);

  const list = document.createElement('div');
  list.className = 'radio-group' + (opts.stack ? ' stack' : '');
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', wrapper.id);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const lab = document.createElement('label');
    lab.htmlFor = radioId;
    const checked = current === option.value ? ' checked' : '';
    const requiredAttr = opts.required ? ' data-required' : '';
    lab.innerHTML =
      `<input class="radio-input" type="radio" id="${radioId}" name="${groupId}"` +
      ` value="${esc(option.value)}"${checked}${requiredAttr}>` +
      `<span>${esc(option.label)}</span>`;
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

function checkbox(opts) {
  const id = `f-${opts.path.replace(/\./g, '-')}`;
  const checked = !!getPath(opts.path);
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.dataset.path = opts.path;
  const lab = document.createElement('label');
  lab.htmlFor = id;
  lab.className = 'checkbox-input-wrap';
  lab.innerHTML =
    `<input class="checkbox-input" type="checkbox" id="${id}" name="${id}"` +
    `${checked ? ' checked' : ''}>` +
    `<span>${esc(opts.label)}</span>`;
  const input = lab.querySelector('input');
  input.addEventListener('change', () => {
    setPath(opts.path, input.checked);
  });
  wrapper.appendChild(lab);
  return wrapper;
}

/** Build a section card as a Lily fieldset. */
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
    `<span class="section-step">Section ${opts.stepNumber} of 14</span>` +
    `<h2 class="section-title">${esc(opts.title)}</h2>` +
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

/** Wraps conditional content in an amber-tinted block. */
function conditionalBlock(...children) {
  const div = document.createElement('div');
  div.className = 'conditional-block';
  for (const c of children) div.appendChild(c);
  return div;
}

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const WHICH_EYES = [
  { value: 'both', label: 'Both eyes' },
  { value: 'left', label: 'Left eye' },
  { value: 'right', label: 'Right eye' }
];

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Part A — About You',
    description:
      'Your current personal details as the DVLA holds them. Note any change of details below.'
  });
  card.appendChild(textInput({
    label: 'Title',
    path: 'personalDetails.title',
    placeholder: 'e.g. Mr, Mrs, Ms, Mx, Dr'
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
  card.appendChild(textArea({
    label: 'Address',
    path: 'personalDetails.address',
    rows: 3,
    required: true
  }));
  card.appendChild(twoCol(
    textInput({ label: 'Postcode', path: 'personalDetails.postcode', required: true }),
    textInput({ label: 'Contact number', path: 'personalDetails.contactNumber', type: 'tel' })
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
    description: 'Tell us about the GP (and consultant, if any) who treat your vision condition.'
  });

  const gpHeader = document.createElement('h3');
  gpHeader.className = 'subsection-title';
  gpHeader.textContent = 'GP details';
  card.appendChild(gpHeader);

  card.appendChild(textInput({
    label: 'GP name', path: 'healthcareProfessionals.gp.name', required: true
  }));
  card.appendChild(textInput({
    label: 'Surgery name', path: 'healthcareProfessionals.gp.surgeryName', required: true
  }));
  card.appendChild(textArea({
    label: 'Address', path: 'healthcareProfessionals.gp.address', rows: 2
  }));
  card.appendChild(twoCol(
    textInput({ label: 'Town', path: 'healthcareProfessionals.gp.town' }),
    textInput({ label: 'Postcode', path: 'healthcareProfessionals.gp.postcode' })
  ));
  card.appendChild(twoCol(
    textInput({ label: 'Contact number', path: 'healthcareProfessionals.gp.contactNumber', type: 'tel' }),
    textInput({ label: 'Email', path: 'healthcareProfessionals.gp.email', type: 'email' })
  ));
  card.appendChild(textInput({
    label: 'Date last seen for this condition',
    path: 'healthcareProfessionals.gp.dateLastSeen',
    type: 'date'
  }));

  const consHeader = document.createElement('h3');
  consHeader.className = 'subsection-title';
  consHeader.textContent = 'Consultant details (optional)';
  card.appendChild(consHeader);

  const consNote = document.createElement('p');
  consNote.className = 'subsection-note';
  consNote.textContent = 'Leave blank if you have not seen a consultant for your vision.';
  card.appendChild(consNote);

  card.appendChild(textInput({ label: 'Consultant name', path: 'healthcareProfessionals.consultant.name' }));
  card.appendChild(textInput({ label: 'Speciality', path: 'healthcareProfessionals.consultant.speciality' }));
  card.appendChild(textInput({ label: 'Department', path: 'healthcareProfessionals.consultant.department' }));
  card.appendChild(textInput({ label: 'Hospital name', path: 'healthcareProfessionals.consultant.hospitalName' }));
  card.appendChild(textArea({ label: 'Address', path: 'healthcareProfessionals.consultant.address', rows: 2 }));
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
    title: 'Question 1 — Eyesight Standard',
    description:
      'The DVLA eyesight standard is being able to read a number plate from 20 metres (Snellen 6/12 visual acuity) and having an adequate field of vision.'
  });
  card.appendChild(radioGroup({
    label: 'Do you meet the eyesight standard for driving?',
    path: 'eyesightStandards.meetsStandard',
    options: [
      { value: 'yes-without-correction', label: 'Yes, without glasses or corrective lenses' },
      { value: 'yes-with-correction', label: 'Yes, with glasses or corrective lenses' },
      { value: 'no', label: 'No' }
    ],
    stack: true,
    required: true
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Question 2 — Vision in Both Eyes',
    description: 'Do not include long or short sightedness.'
  });
  card.appendChild(radioGroup({
    label: 'Do you have vision in both eyes?',
    path: 'visionInBothEyes.hasVisionInBothEyes',
    options: YES_NO,
    required: true
  }));

  if (isMonocularBranchActive(state)) {
    const block = conditionalBlock();
    block.appendChild(radioGroup({
      label: '2a) Which eye do you see with?',
      path: 'visionInBothEyes.whichEye',
      options: [
        { value: 'left', label: 'Left eye only' },
        { value: 'right', label: 'Right eye only' }
      ],
      required: true
    }));
    block.appendChild(radioGroup({
      label: '2b) How long have you had vision in only one eye?',
      path: 'visionInBothEyes.duration',
      options: [
        { value: 'since-birth-or-childhood', label: 'Since birth or childhood' },
        { value: 'health-or-injury', label: 'As a result of a health condition, accident or injury' }
      ],
      stack: true,
      required: true
    }));
    block.appendChild(radioGroup({
      label: '2c) Have you adapted to vision in one eye?',
      path: 'visionInBothEyes.adaptation',
      options: [
        { value: 'adapted-advised', label: 'Yes, advised by a healthcare professional' },
        { value: 'adapted-self', label: 'Yes, but not advised by a healthcare professional' },
        { value: 'not-adapted', label: 'No, not yet adapted' }
      ],
      stack: true,
      required: true
    }));
    block.appendChild(checkbox({
      label: 'I confirm I have adapted (or completed an adaptation period) to driving with vision in only one eye, as required by DVLA.',
      path: 'visionInBothEyes.monocularDeclarationConfirmed'
    }));
    card.appendChild(block);
  }
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Question 3 — Field of Vision',
    description:
      'Your field of vision is the total area you can see when looking straight ahead, including peripheral (side) vision.'
  });
  card.appendChild(radioGroup({
    label: 'Do you have a problem with your field of vision?',
    path: 'fieldOfVision.hasProblem',
    options: YES_NO,
    required: true
  }));

  if (isVisualFieldBranchActive(state)) {
    const block = conditionalBlock();
    block.appendChild(radioGroup({
      label: '3a) Is the visual-field problem caused solely by an eye condition (e.g. glaucoma, retinitis pigmentosa)?',
      path: 'fieldOfVision.causedSolelyByEyeCondition',
      options: YES_NO,
      required: true
    }));

    if (isVisualFieldCauseBranchActive(state)) {
      block.appendChild(radioGroup({
        label: '3b) Please indicate the cause of the visual-field problem',
        path: 'fieldOfVision.cause',
        options: [
          { value: 'brain-tumour', label: 'Brain tumour' },
          { value: 'head-injury', label: 'Head injury' },
          { value: 'stroke', label: 'Stroke' },
          { value: 'other', label: 'Other' }
        ],
        stack: true,
        required: true
      }));
      if (state.fieldOfVision.cause === 'other') {
        block.appendChild(textArea({
          label: 'Please describe the other cause',
          path: 'fieldOfVision.causeOtherDetails',
          rows: 3,
          required: true
        }));
      }
    }
    card.appendChild(block);
  }
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Question 4 — Glaucoma',
    description: 'Glaucoma damages the optic nerve, often from increased eye pressure.'
  });
  card.appendChild(radioGroup({
    label: 'Do you have glaucoma?',
    path: 'glaucoma.hasCondition',
    options: YES_NO,
    required: true
  }));
  if (state.glaucoma.hasCondition === 'yes') {
    const block = conditionalBlock();
    block.appendChild(radioGroup({
      label: '4a) Which eye(s) are affected?',
      path: 'glaucoma.whichEyes',
      options: WHICH_EYES,
      required: true
    }));
    card.appendChild(block);
  }
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Question 5 — Retinitis Pigmentosa',
    description: 'Retinitis pigmentosa is an inherited eye condition causing progressive vision loss.'
  });
  card.appendChild(radioGroup({
    label: 'Do you have retinitis pigmentosa?',
    path: 'retinitisPigmentosa.hasCondition',
    options: YES_NO,
    required: true
  }));
  if (state.retinitisPigmentosa.hasCondition === 'yes') {
    const block = conditionalBlock();
    block.appendChild(radioGroup({
      label: '5a) Which eye(s) are affected?',
      path: 'retinitisPigmentosa.whichEyes',
      options: WHICH_EYES,
      required: true
    }));
    card.appendChild(block);
  }
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Question 6 — Laser Treatment',
    description: 'Tell us about any laser treatment you have had to your eyes.'
  });
  card.appendChild(radioGroup({
    label: 'Have you had laser treatment to either eye?',
    path: 'laserTreatment.hasHadTreatment',
    options: YES_NO,
    required: true
  }));
  if (isLaserTreatmentBranchActive(state)) {
    const block = conditionalBlock();
    const note = document.createElement('p');
    note.className = 'subsection-note';
    note.textContent = 'Please supply at least one date.';
    block.appendChild(note);
    block.appendChild(twoCol(
      textInput({
        label: 'Left eye — date of first treatment',
        path: 'laserTreatment.leftEyeFirstDate',
        type: 'date'
      }),
      textInput({
        label: 'Right eye — date of first treatment',
        path: 'laserTreatment.rightEyeFirstDate',
        type: 'date'
      })
    ));
    block.appendChild(twoCol(
      textInput({
        label: 'Left eye — date of last treatment',
        path: 'laserTreatment.leftEyeLastDate',
        type: 'date'
      }),
      textInput({
        label: 'Right eye — date of last treatment',
        path: 'laserTreatment.rightEyeLastDate',
        type: 'date'
      })
    ));
    card.appendChild(block);
  }
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Question 7 — Blepharospasm',
    description: 'Blepharospasm is involuntary eyelid muscle spasm.'
  });
  card.appendChild(radioGroup({
    label: 'Do you have blepharospasm?',
    path: 'blepharospasm.hasCondition',
    options: YES_NO,
    required: true
  }));
  if (state.blepharospasm.hasCondition === 'yes') {
    const block = conditionalBlock();
    block.appendChild(radioGroup({
      label: '7a) Which eye(s) are affected?',
      path: 'blepharospasm.whichEyes',
      options: WHICH_EYES,
      required: true
    }));
    block.appendChild(radioGroup({
      label: '7b) Have you had treatment for blepharospasm?',
      path: 'blepharospasm.hasHadTreatment',
      options: YES_NO,
      required: true
    }));
    block.appendChild(radioGroup({
      label: '7c) Is your healthcare professional satisfied that the condition is adequately controlled?',
      path: 'blepharospasm.adequatelyControlled',
      options: YES_NO,
      required: true
    }));
    card.appendChild(block);
  }
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Question 8 — Night Blindness',
    description: 'Nyctalopia is reduced ability to see in low light.'
  });
  card.appendChild(radioGroup({
    label: 'Do you have night blindness?',
    path: 'nightBlindness.hasCondition',
    options: YES_NO,
    required: true
  }));
  if (state.nightBlindness.hasCondition === 'yes') {
    const block = conditionalBlock();
    block.appendChild(radioGroup({
      label: '8a) Which eye(s) are affected?',
      path: 'nightBlindness.whichEyes',
      options: WHICH_EYES,
      required: true
    }));
    card.appendChild(block);
  }
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Question 9 — Double Vision (Diplopia)',
    description: 'Diplopia means seeing two of an object.'
  });
  card.appendChild(radioGroup({
    label: 'Do you have double vision?',
    path: 'doubleVision.hasCondition',
    options: YES_NO,
    required: true
  }));

  if (isDoubleVisionBranchActive(state)) {
    const block = conditionalBlock();
    block.appendChild(radioGroup({
      label: '9a) Is your double vision controlled (e.g. by patch or prism)?',
      path: 'doubleVision.controlled',
      options: YES_NO,
      required: true
    }));
    if (state.doubleVision.controlled === 'no') {
      block.appendChild(radioGroup({
        label: '9b) Has the double vision been the same for 6 months or more?',
        path: 'doubleVision.sameForSixMonthsOrMore',
        options: YES_NO,
        required: true
      }));
    }

    const decl = document.createElement('div');
    decl.className = 'declaration-block';
    decl.innerHTML = `
      <h3>Double-vision adaptation declaration</h3>
      <p>If you have stable diplopia, you must have adapted to it before driving.
        If your diplopia is controlled by a patch or prism, you must wear it whenever
        you drive.</p>
    `;
    decl.appendChild(checkbox({
      label: 'I confirm that I have adapted to my double vision and/or wear my prescribed correction whenever I drive.',
      path: 'doubleVision.doubleVisionDeclarationConfirmed'
    }));
    decl.appendChild(textInput({
      label: 'Signed (full name)',
      path: 'doubleVision.declarationSignatureName',
      required: true
    }));
    decl.appendChild(textInput({
      label: 'Date',
      path: 'doubleVision.declarationDate',
      type: 'date',
      required: true
    }));
    block.appendChild(decl);
    card.appendChild(block);
  }
  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Question 10 — Other Vision Conditions',
    description: 'Tell us about any other vision condition not already covered.'
  });
  card.appendChild(radioGroup({
    label: 'Do you have any other vision condition?',
    path: 'otherVisionConditions.hasOther',
    options: YES_NO,
    required: true
  }));
  if (state.otherVisionConditions.hasOther === 'yes') {
    const block = conditionalBlock();
    block.appendChild(textArea({
      label: 'Please describe the other vision condition(s) and which eye(s) are affected',
      path: 'otherVisionConditions.details',
      rows: 4,
      required: true
    }));
    card.appendChild(block);
  }
  return card;
}

function renderStep13() {
  const card = sectionCard({
    stepNumber: 13,
    title: 'Question 11 — Recent Contact',
    description: 'Tell us about your most recent vision-related healthcare contact.'
  });
  card.appendChild(radioGroup({
    label: 'Have you had recent contact with your healthcare professional or optician about your vision?',
    path: 'recentContact.hadContact',
    options: YES_NO,
    required: true
  }));
  if (state.recentContact.hadContact === 'yes') {
    const block = conditionalBlock();
    block.appendChild(textInput({
      label: 'Date of most recent contact',
      path: 'recentContact.dateOfContact',
      type: 'date',
      required: true
    }));
    card.appendChild(block);
  }
  return card;
}

function renderStep14() {
  const card = sectionCard({
    stepNumber: 14,
    title: "Applicant's authorisation",
    description: 'Please read the declaration carefully before signing.'
  });

  const decText = document.createElement('div');
  decText.className = 'declaration-text';
  decText.innerHTML = `
    <p>I authorise my doctor(s) and other healthcare professionals who have or have had
      involvement in my care to release reports and medical information about me to
      medical advisers at the DVLA, and I authorise the DVLA's medical advisers to share
      relevant information with my doctor(s).</p>
    <p>I declare that the information I have given is true and complete to the best of my
      knowledge and belief. I understand that it is a criminal offence to make a false
      declaration to obtain a driving licence.</p>
  `;
  card.appendChild(decText);

  card.appendChild(checkbox({
    label: 'I have read and accept the declaration above.',
    path: 'authorisation.declarationConfirmed'
  }));

  card.appendChild(textInput({
    label: 'Full name',
    path: 'authorisation.name',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Signature (typed)',
    path: 'authorisation.signature',
    required: true
  }));
  card.appendChild(textInput({
    label: 'Date',
    path: 'authorisation.date',
    type: 'date',
    required: true
  }));

  const corrHeader = document.createElement('h3');
  corrHeader.className = 'subsection-title';
  corrHeader.textContent = 'Electronic correspondence';
  card.appendChild(corrHeader);

  card.appendChild(radioGroup({
    label: 'Do you authorise the DVLA to use electronic correspondence (email/SMS) with you?',
    path: 'authorisation.authoriseElectronicCorrespondence',
    options: YES_NO,
    required: true
  }));

  if (state.authorisation.authoriseElectronicCorrespondence === 'yes') {
    const channels = [
      { value: 'email', label: 'Email' },
      { value: 'sms', label: 'SMS (Text)' }
    ];
    const block = conditionalBlock();
    block.appendChild(radioGroup({
      label: 'Contact preference from a healthcare professional on behalf of DVLA',
      path: 'authorisation.contactPreferenceFromHealthcareProfessional',
      options: channels
    }));
    block.appendChild(radioGroup({
      label: 'Contact preference from DVLA directly',
      path: 'authorisation.contactPreferenceFromDvla',
      options: channels
    }));
    card.appendChild(block);
  }

  return card;
}

// ----------------------------------------------------------------------
// Step-list
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  title: 'Personal' },
  { step: 2,  title: 'Healthcare' },
  { step: 3,  title: 'Eyesight' },
  { step: 4,  title: 'Both eyes' },
  { step: 5,  title: 'Field' },
  { step: 6,  title: 'Glaucoma' },
  { step: 7,  title: 'RP' },
  { step: 8,  title: 'Laser' },
  { step: 9,  title: 'Bleph.' },
  { step: 10, title: 'Night' },
  { step: 11, title: 'Diplopia' },
  { step: 12, title: 'Other' },
  { step: 13, title: 'Contact' },
  { step: 14, title: 'Authorise' }
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
  const result = validateV1(state);
  const total = result.totalRequired;
  const answered = result.totalSatisfied;
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) {
    text.textContent = `${answered} of ${total} required fields answered (${percent}%)`;
  }

  // Map section name -> step number
  const SECTION_TO_STEP = {
    personalDetails: 1,
    healthcareProfessionals: 2,
    eyesightStandards: 3,
    visionInBothEyes: 4,
    fieldOfVision: 5,
    glaucoma: 6,
    retinitisPigmentosa: 7,
    laserTreatment: 8,
    blepharospasm: 9,
    nightBlindness: 10,
    doubleVision: 11,
    otherVisionConditions: 12,
    recentContact: 13,
    authorisation: 14
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

function validateFormUi() {
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
    case 'high':   return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low':    return 'flag-low';
    default:       return '';
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
      : `<ul class="missing-list">${s.missing.map(
          (m) => `<li>${esc(m.id)} — ${esc(m.message || m.description)}</li>`
        ).join('')}</ul>`;
    return `
      <tr>
        <th scope="row">${esc(sectionLabel(s.section))}</th>
        <td>${s.satisfied} / ${s.required}</td>
        <td>${missingItems}</td>
      </tr>
    `;
  }).join('');

  const flagsList = flags.length === 0
    ? '<p class="muted">No flagged issues raised.</p>'
    : `
      <ul class="flags">
        ${flags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority).toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.message)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>DVLA V1 — submission report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="completeness">
        ${completenessBadge}
        <span>${validation.totalSatisfied} of ${validation.totalRequired} required fields answered.</span>
      </div>

      <h3>Section completeness</h3>
      <table class="sections-table">
        <thead>
          <tr>
            <th scope="col">Section</th>
            <th scope="col">Answered</th>
            <th scope="col">Missing items</th>
          </tr>
        </thead>
        <tbody>
          ${sectionRows}
        </tbody>
      </table>

      <h3>Flagged issues</h3>
      ${flagsList}

      <div class="report-actions">
        <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
      </div>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const startOverBtn = document.getElementById('start-over-btn');
  if (startOverBtn) startOverBtn.addEventListener('click', startOver);
}

function submitForm() {
  validateFormUi();
  const validation = validateV1(state);
  const flags = detectFlaggedIssues(state);
  lastResult = {
    validation,
    flags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh DVLA V1 form?')) return;
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
  renderStep13, renderStep14
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
