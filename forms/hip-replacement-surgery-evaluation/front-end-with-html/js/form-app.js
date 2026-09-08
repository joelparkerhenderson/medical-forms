import { calculateHipEvaluation } from './composite-grader.js';
import { titleCase } from './ohs-rules.js';
import {
  CANDIDACY_LABELS,
  OHS_CATEGORY_LABELS,
  emptyEvaluation,
  labelFor
} from './types.js';

// Hip Replacement Surgery Evaluation — clinician wizard (vanilla JS, native
// ES modules).
//
// Single-page continuous wizard: all 15 sections are rendered into the page
// in document order. The user scrolls through them; the top-of-page progress
// summary reflects how many tracked fields have been answered. Submission
// runs the pure grading engine and renders an inline evaluation report.
// State is persisted to localStorage so a partial fill survives a page
// reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'hip-replacement-surgery-evaluation.front-end-with-html.v1';
const TOTAL_STEPS = 15;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyEvaluation();

  // Merge stored values over a fresh shape so fields added in a later
  // version do not orphan an existing draft.
  for (const key of Object.keys(fresh)) {
    const v = parsed && parsed[key];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      fresh[key] = { ...fresh[key], ...v };
    } else if (key === 'status' && typeof v === 'string') {
      fresh[key] = v;
    }
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyEvaluation();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse the saved evaluation; starting fresh.', e);
    return emptyEvaluation();
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save the evaluation to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear the stored evaluation.', e);
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
/** @type {ReturnType<typeof calculateHipEvaluation> & {timestamp:string} | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'hip-replacement-surgery-evaluation',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the evaluation report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateDerived();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateDerived();
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
// Component builders (Lily HTML headless class contract)
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
  if (opts.required) attrs.push('required', 'data-required');
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);
  if (opts.readonly) attrs.push('readonly');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;

  const input = wrapper.querySelector('input');
  input.setAttribute('aria-describedby', `${id}-error`);
  if (!opts.readonly) {
    input.addEventListener('input', () => {
      let v = input.value;
      if (type === 'number') v = v === '' ? null : Number(v);
      setField(opts.section, opts.field, v);
      clearFieldError(id);
    });
  }
  return wrapper;
}

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
      ${opts.required ? 'data-required' : ''}
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

function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    '<option value="">— Select —</option>',
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select"${opts.required ? ' data-required' : ''} aria-describedby="${id}-error">
      ${optionsHtml}
    </select>
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => {
    setField(opts.section, opts.field, sel.value);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Yes / no radio group. The stored value is the string 'yes' or 'no' (or ''
 * when unanswered) so it round-trips to the SQL CHECK constraints without a
 * boolean-to-enum translation layer.
 */
function yesNo(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const choices = opts.options || [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <span class="label" id="${id}-label">${esc(opts.label)}</span>
    <div class="radio-group" role="radiogroup" aria-labelledby="${id}-label" aria-describedby="${id}-error">
      ${choices.map((c) => `
        <span class="radio-option">
          <input type="radio" class="radio-input" id="${id}-${esc(c.value)}"
                 name="${id}" value="${esc(c.value)}"${c.value === current ? ' checked' : ''}>
          <label for="${id}-${esc(c.value)}">${esc(c.label)}</label>
        </span>
      `).join('')}
    </div>
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;
  wrapper.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) {
        setField(opts.section, opts.field, input.value);
        clearFieldError(id);
      }
    });
  });
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
    <span class="section-step">Step ${opts.stepNumber} of ${TOTAL_STEPS}</span>
    <h2 class="section-title">${esc(opts.title)}</h2>
    ${desc}
  `;
  card.appendChild(legend);
  return card;
}

function subHead(text) {
  const h = document.createElement('h3');
  h.textContent = text;
  return h;
}

function note(text) {
  const p = document.createElement('p');
  p.className = 'section-note';
  p.textContent = text;
  return p;
}

function grid(cols, children) {
  const g = document.createElement('div');
  g.className = cols;
  for (const c of children) g.appendChild(c);
  return g;
}

// ----------------------------------------------------------------------
// Option lists (values match the SQL CHECK constraints in ../../sql/)
// ----------------------------------------------------------------------

const OHS_SCALE = [
  { value: '0', label: '0 — Worst' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4 — Best' }
];

const OPTIONS = {
  clinicianRole: [
    { value: 'orthopaedic-surgeon', label: 'Orthopaedic surgeon' },
    { value: 'extended-scope-physiotherapist', label: 'Extended-scope physiotherapist' },
    { value: 'orthopaedic-registrar', label: 'Orthopaedic registrar' },
    { value: 'nurse-practitioner', label: 'Nurse practitioner' },
    { value: 'other', label: 'Other' }
  ],
  sex: [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'intersex', label: 'Intersex' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ],
  affectedSide: [
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'bilateral', label: 'Bilateral' }
  ],
  walkingDistanceBeforePain: [
    { value: 'unlimited', label: 'Unlimited' },
    { value: 'over-1km', label: 'Over 1km' },
    { value: '100m-to-1km', label: '100m to 1km' },
    { value: 'under-100m', label: 'Under 100m' },
    { value: 'housebound', label: 'Housebound' }
  ],
  shoesAndSocksDifficulty: [
    { value: 'none', label: 'None' },
    { value: 'some', label: 'Some' },
    { value: 'severe', label: 'Severe' },
    { value: 'unable', label: 'Unable' }
  ],
  walkingAidUse: [
    { value: 'none', label: 'None' },
    { value: 'stick', label: 'Stick' },
    { value: 'frame', label: 'Frame' },
    { value: 'wheelchair', label: 'Wheelchair' }
  ],
  jointStability: [
    { value: 'stable', label: 'Stable' },
    { value: 'unstable', label: 'Unstable' }
  ],
  tendernessSite: [
    { value: 'none', label: 'None' },
    { value: 'groin', label: 'Groin' },
    { value: 'trochanteric', label: 'Trochanteric' },
    { value: 'buttock', label: 'Buttock' },
    { value: 'other', label: 'Other' }
  ],
  mrc: [
    { value: '0', label: '0 — No contraction' },
    { value: '1', label: '1 — Flicker or trace of contraction' },
    { value: '2', label: '2 — Active movement, gravity eliminated' },
    { value: '3', label: '3 — Active movement against gravity' },
    { value: '4', label: '4 — Active movement against resistance' },
    { value: '5', label: '5 — Normal power' }
  ],
  kellgrenLawrence: [
    { value: '0', label: '0 — None' },
    { value: '1', label: '1 — Doubtful' },
    { value: '2', label: '2 — Minimal' },
    { value: '3', label: '3 — Moderate' },
    { value: '4', label: '4 — Severe' }
  ],
  jointSpaceNarrowing: [
    { value: 'none', label: 'None' },
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' }
  ],
  ctIndication: [
    { value: 'none', label: 'None' },
    { value: 'robotic-assisted-planning', label: 'Robotic-assisted planning' },
    { value: 'complex-deformity', label: 'Complex deformity' },
    { value: 'other', label: 'Other' }
  ],
  treatmentResponse: [
    { value: 'no-relief', label: 'No relief' },
    { value: 'partial-relief', label: 'Partial relief' },
    { value: 'good-relief', label: 'Good relief' }
  ],
  diabetesControlled: [
    { value: 'not-diabetic', label: 'Not diabetic' },
    { value: 'controlled', label: 'Controlled' },
    { value: 'poorly-controlled', label: 'Poorly controlled' }
  ],
  smokingStatus: [
    { value: 'never', label: 'Never smoked' },
    { value: 'ex-smoker', label: 'Ex-smoker' },
    { value: 'current-smoker', label: 'Current smoker' }
  ],
  recommendation: [
    { value: 'total-hip-replacement', label: 'Total hip replacement' },
    { value: 'hip-resurfacing', label: 'Hip resurfacing' },
    { value: 'continue-conservative-management', label: 'Continue conservative management' },
    { value: 'mdt-review', label: 'Multidisciplinary-team review' },
    { value: 'not-currently-a-candidate', label: 'Not currently a candidate' }
  ],
  candidacy: [
    { value: 'strong-candidate', label: 'Strong candidate for surgery' },
    { value: 'candidate', label: 'Candidate for surgery' },
    { value: 'continue-conservative', label: 'Continue conservative management' },
    { value: 'not-indicated', label: 'Not currently indicated' },
    { value: 'mdt-review', label: 'Multidisciplinary-team review' }
  ]
};

// The 12 Oxford Hip Score items, in order, each with its concept text from
// ../../doc/ohs-scoring.md — the real OHS item concepts, reproduced without
// the copyrighted exact instrument wording (see doc/safety-case-notes.md
// §Instrument licensing).
const OHS_ITEMS = [
  { field: 'painSeverity', label: 'Usual hip pain severity' },
  { field: 'washingAndDrying', label: 'Difficulty washing and drying yourself because of your hip' },
  { field: 'transport', label: 'Difficulty getting in or out of a car, or using public transport, because of your hip' },
  { field: 'dressingSocks', label: 'Difficulty putting on a pair of socks or stockings because of your hip' },
  { field: 'shopping', label: 'Ability to do the household shopping on your own' },
  { field: 'walkingPain', label: 'Pain experienced walking' },
  { field: 'limping', label: 'Limping when walking, because of your hip' },
  { field: 'kneeling', label: 'Difficulty kneeling and getting up again afterwards, because of your hip' },
  { field: 'nightPain', label: 'How often has hip pain troubled you in bed at night' },
  { field: 'workInterference', label: 'How much has hip pain interfered with your usual work' },
  { field: 'givingWay', label: 'How often has the hip felt like it might suddenly give way or let you down' },
  { field: 'stairs', label: 'Ability to walk down a flight of stairs' }
];

// ----------------------------------------------------------------------
// Section renderers — one per wizard step
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Clinician identification',
    description: 'Who is conducting the evaluation, where, and when.'
  });
  card.appendChild(textInput({ label: 'Clinician name', section: 'clinician', field: 'clinicianName', required: true }));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Role', section: 'clinician', field: 'role', options: OPTIONS.clinicianRole }),
    textInput({ label: 'GMC / registration number', section: 'clinician', field: 'gmcNumber' })
  ]));
  card.appendChild(textInput({ label: 'Site', section: 'clinician', field: 'siteName', placeholder: 'Joint-replacement clinic or hospital' }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Assessment date', section: 'clinician', field: 'assessmentDate', type: 'date', required: true }),
    textInput({ label: 'Assessment time', section: 'clinician', field: 'assessmentTime', type: 'time' })
  ]));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Who the patient is, and the anthropometrics used for the body mass index and the paediatric safety flag.'
  });
  card.appendChild(textInput({ label: 'Name', section: 'patient', field: 'name', required: true }));
  card.appendChild(grid('two-col', [
    textInput({
      label: 'Date of birth', section: 'patient', field: 'birthDate', type: 'date',
      hint: 'Used for the paediatric flag: the Oxford Hip Score is not validated below 16 years.'
    }),
    selectInput({ label: 'Sex', section: 'patient', field: 'sex', options: OPTIONS.sex })
  ]));
  card.appendChild(textInput({ label: 'NHS number', section: 'patient', field: 'nhsNumber', placeholder: 'NNN NNN NNNN' }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Email', section: 'patient', field: 'email', type: 'email' }),
    textInput({ label: 'Phone', section: 'patient', field: 'phone', type: 'tel' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Height', section: 'patient', field: 'heightAsCm', type: 'number', min: 50, max: 250, step: 0.1, unit: 'cm' }),
    textInput({ label: 'Weight', section: 'patient', field: 'weightAsKg', type: 'number', min: 15, max: 400, step: 0.1, unit: 'kg' })
  ]));
  card.appendChild(textInput({
    label: 'Body mass index', section: 'patient', field: 'derivedBmi', type: 'text', readonly: true,
    hint: 'Computed from height and weight. 40 or above raises the high-bmi-surgical-risk flag.'
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Presenting history',
    description: 'The affected side, symptom duration, pain, and relevant surgical or injury history.'
  });
  card.appendChild(selectInput({ label: 'Affected side', section: 'history', field: 'affectedSide', options: OPTIONS.affectedSide, required: true }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Symptom duration', section: 'history', field: 'symptomDurationMonths', type: 'number', min: 0, max: 600, unit: 'months' }),
    yesNo({ label: 'Night pain', section: 'history', field: 'nightPain' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Pain at rest', section: 'history', field: 'painAtRest0To10', type: 'number', min: 0, max: 10, unit: '0–10' }),
    textInput({ label: 'Pain on activity', section: 'history', field: 'painOnActivity0To10', type: 'number', min: 0, max: 10, unit: '0–10' })
  ]));
  card.appendChild(subHead('Surgical and injury history'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Prior hip surgery', section: 'history', field: 'priorHipSurgery' }),
    textInput({ label: 'Prior hip surgery detail', section: 'history', field: 'priorHipSurgeryDetail', placeholder: 'Arthroscopy, osteotomy' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Prior injury or dysplasia history', section: 'history', field: 'priorInjuryOrDysplasiaHistory' }),
    textInput({ label: 'Injury or dysplasia detail', section: 'history', field: 'priorInjuryOrDysplasiaDetail' })
  ]));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Oxford Hip Score',
    description: 'The validated 12-item Oxford Hip Score (Dawson et al. 1996). Each item is scored 0 (worst) to 4 (best); the total, 0–48, drives the OHS category and the surgical-candidacy recommendation.'
  });
  for (const item of OHS_ITEMS) {
    card.appendChild(selectInput({
      label: item.label, section: 'ohs', field: item.field, options: OHS_SCALE, required: true
    }));
  }
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Functional limitations',
    description: 'How the hip limits everyday activity beyond the Oxford Hip Score items.'
  });
  card.appendChild(selectInput({ label: 'Walking distance before pain', section: 'function', field: 'walkingDistanceBeforePain', options: OPTIONS.walkingDistanceBeforePain }));
  card.appendChild(selectInput({ label: 'Difficulty with shoes and socks', section: 'function', field: 'shoesAndSocksDifficulty', options: OPTIONS.shoesAndSocksDifficulty }));
  card.appendChild(selectInput({ label: 'Walking aid in use', section: 'function', field: 'walkingAidUse', options: OPTIONS.walkingAidUse }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Physical examination — gait and biomechanical',
    description: 'A leg-length discrepancy above 2cm raises a dedicated safety flag for surgical templating.'
  });
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Limp present', section: 'gait', field: 'limpPresent' }),
    yesNo({ label: 'Antalgic gait', section: 'gait', field: 'antalgicGait' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({
      label: 'Trendelenburg sign', section: 'gait', field: 'trendelenburgSign',
      hint: 'A positive sign indicates hip abductor weakness relevant to surgical planning.'
    }),
    textInput({
      label: 'Leg-length discrepancy', section: 'gait', field: 'legLengthDiscrepancyAsCm',
      type: 'number', min: 0, max: 15, step: 0.1, unit: 'cm',
      hint: 'Above 2cm raises a safety flag.'
    })
  ]));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Physical examination — range of motion',
    description: 'Hip range of motion in degrees, and whether a fixed flexion deformity is present.'
  });
  card.appendChild(grid('three-col', [
    textInput({ label: 'Flexion', section: 'rangeOfMotion', field: 'flexionDegrees', type: 'number', min: 0, max: 150, unit: '°' }),
    textInput({ label: 'Internal rotation', section: 'rangeOfMotion', field: 'internalRotationDegrees', type: 'number', min: 0, max: 60, unit: '°' }),
    textInput({ label: 'External rotation', section: 'rangeOfMotion', field: 'externalRotationDegrees', type: 'number', min: 0, max: 60, unit: '°' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Abduction', section: 'rangeOfMotion', field: 'abductionDegrees', type: 'number', min: 0, max: 60, unit: '°' }),
    textInput({ label: 'Adduction', section: 'rangeOfMotion', field: 'adductionDegrees', type: 'number', min: 0, max: 45, unit: '°' })
  ]));
  card.appendChild(yesNo({ label: 'Fixed flexion deformity present', section: 'rangeOfMotion', field: 'fixedFlexionDeformityPresent' }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Physical examination — stability and muscle strength',
    description: 'Hip abductor strength on the Medical Research Council (MRC) scale, joint stability, and any tenderness.'
  });
  card.appendChild(selectInput({ label: 'Hip abductor strength (MRC)', section: 'stability', field: 'hipAbductorStrengthMrc', options: OPTIONS.mrc }));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Joint stability', section: 'stability', field: 'jointStability', options: OPTIONS.jointStability }),
    selectInput({ label: 'Site of tenderness', section: 'stability', field: 'tendernessSite', options: OPTIONS.tendernessSite })
  ]));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Diagnostic imaging',
    description: 'The Kellgren and Lawrence radiographic grade drives the surgical-candidacy recommendation alongside the Oxford Hip Score.'
  });
  card.appendChild(yesNo({ label: 'Weight-bearing X-ray performed', section: 'imaging', field: 'weightBearingXrayPerformed' }));
  card.appendChild(grid('two-col', [
    selectInput({
      label: 'Kellgren and Lawrence grade', section: 'imaging', field: 'kellgrenLawrenceGrade', options: OPTIONS.kellgrenLawrence,
      hint: 'A missing grade never satisfies a >= threshold, so the case routes to multidisciplinary-team review instead of silently passing.'
    }),
    selectInput({ label: 'Joint-space narrowing', section: 'imaging', field: 'jointSpaceNarrowing', options: OPTIONS.jointSpaceNarrowing })
  ]));
  card.appendChild(yesNo({ label: 'Subchondral sclerosis or cysts present', section: 'imaging', field: 'subchondralSclerosisOrCystsPresent' }));
  card.appendChild(subHead('MRI'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'MRI performed', section: 'imaging', field: 'mriPerformed' }),
    textInput({ label: 'MRI findings', section: 'imaging', field: 'mriFindings' })
  ]));
  card.appendChild(subHead('CT'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'CT performed', section: 'imaging', field: 'ctPerformed' }),
    selectInput({ label: 'CT indication', section: 'imaging', field: 'ctIndication', options: OPTIONS.ctIndication })
  ]));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Conservative treatment audit',
    description: 'Whether conservative measures have been exhausted is the primary gate on surgical candidacy: "no" forces continue-conservative regardless of the Oxford Hip Score or imaging grade.'
  });
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Physiotherapy tried', section: 'conservative', field: 'physiotherapyTried' }),
    textInput({ label: 'Physiotherapy duration', section: 'conservative', field: 'physiotherapyDurationWeeks', type: 'number', min: 0, max: 260, unit: 'weeks' })
  ]));
  card.appendChild(yesNo({ label: 'Weight-management advice given', section: 'conservative', field: 'weightManagementAdviceGiven' }));
  card.appendChild(subHead('Steroid injection'));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Steroid injection given', section: 'conservative', field: 'steroidInjectionGiven' }),
    textInput({ label: 'Injection count', section: 'conservative', field: 'steroidInjectionCount', type: 'number', min: 0, max: 20 }),
    selectInput({ label: 'Response', section: 'conservative', field: 'steroidInjectionResponse', options: OPTIONS.treatmentResponse })
  ]));
  card.appendChild(subHead('Analgesic trial'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Analgesic trial given', section: 'conservative', field: 'analgesicTrialGiven' }),
    selectInput({ label: 'Response', section: 'conservative', field: 'analgesicTrialResponse', options: OPTIONS.treatmentResponse })
  ]));
  card.appendChild(yesNo({ label: 'Walking-aid trial', section: 'conservative', field: 'walkingAidTrial' }));
  card.appendChild(yesNo({
    label: 'Conservative measures exhausted', section: 'conservative', field: 'conservativeMeasuresExhausted', required: true,
    hint: '"No" raises a non-suppressible safety flag and forces continue-conservative.'
  }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'General health and surgical fitness screen',
    description: 'A brief general-fitness screening note only. This is not an ASA-grading pre-operative assessment — see the sibling forms for that.'
  });
  card.appendChild(selectInput({ label: 'Diabetes control', section: 'fitness', field: 'diabetesControlled', options: OPTIONS.diabetesControlled }));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Cardiac disease present', section: 'fitness', field: 'cardiacDiseasePresent' }),
    yesNo({ label: 'Bleeding disorder or anticoagulant use', section: 'fitness', field: 'bleedingDisorderOrAnticoagulantUse' })
  ]));
  card.appendChild(selectInput({ label: 'Smoking status', section: 'fitness', field: 'smokingStatus', options: OPTIONS.smokingStatus }));
  card.appendChild(textArea({ label: 'General fitness note', section: 'fitness', field: 'generalFitnessNote', rows: 2 }));
  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Pre-operative baseline bloods and tests',
    description: 'Any outstanding test is named on the pre-op-bloods-incomplete safety flag.'
  });
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Full blood count done', section: 'baselineTests', field: 'fullBloodCountDone' }),
    yesNo({ label: 'Renal function done', section: 'baselineTests', field: 'renalFunctionDone' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Clotting or INR done', section: 'baselineTests', field: 'clottingOrInrDone' }),
    yesNo({ label: 'ECG done', section: 'baselineTests', field: 'ecgDone' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'MRSA screen done', section: 'baselineTests', field: 'mrsaScreenDone' }),
    yesNo({ label: 'Urinalysis done', section: 'baselineTests', field: 'urinalysisDone' })
  ]));
  return card;
}

function renderStep13() {
  const card = sectionCard({
    stepNumber: 13,
    title: 'Shared decision-making',
    description: 'Confirming the patient understands the risks, benefits, and realistic expected outcome.'
  });
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Risks and benefits discussed', section: 'decisionMaking', field: 'risksAndBenefitsDiscussed' }),
    yesNo({ label: 'Realistic expectations discussed', section: 'decisionMaking', field: 'realisticExpectationsDiscussed' })
  ]));
  card.appendChild(yesNo({ label: 'Patient decision aid given', section: 'decisionMaking', field: 'patientDecisionAidGiven' }));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Interpreter required', section: 'decisionMaking', field: 'interpreterRequired' }),
    textInput({ label: 'Interpreter language', section: 'decisionMaking', field: 'interpreterLanguage' })
  ]));
  return card;
}

function renderStep14() {
  const card = sectionCard({
    stepNumber: 14,
    title: 'Management plan and recommendation',
    description: 'The clinician recommendation and, where applicable, the target listing date and responsible surgeon.'
  });
  card.appendChild(selectInput({ label: 'Recommendation', section: 'plan', field: 'recommendation', options: OPTIONS.recommendation }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Target list date', section: 'plan', field: 'targetListDate', type: 'date' }),
    textInput({ label: 'Responsible surgeon', section: 'plan', field: 'responsibleSurgeon' })
  ]));
  return card;
}

function renderStep15() {
  const card = sectionCard({
    stepNumber: 15,
    title: 'Summary and sign-off',
    description: 'The computed Oxford Hip Score, candidacy, and every fired safety flag, an optional clinician override with a mandatory reason, and the electronic signature. Submit to compute the final report.'
  });
  const live = document.createElement('div');
  live.id = 'live-summary';
  live.className = 'live-summary';
  card.appendChild(live);

  card.appendChild(subHead('Clinician override'));
  card.appendChild(note(
    'The override changes the final candidacy only. Safety flags are computed independently and are always printed below, so an override cannot hide a hazard.'
  ));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Override candidacy', section: 'summary', field: 'overrideCandidacy', options: OPTIONS.candidacy }),
    textInput({ label: 'Override reason', section: 'summary', field: 'overrideReason', hint: 'Mandatory when the override differs from the computed candidacy.' })
  ]));

  card.appendChild(subHead('Sign-off'));
  card.appendChild(textArea({ label: 'Clinician notes', section: 'summary', field: 'clinicianNotes', rows: 2 }));
  card.appendChild(textArea({ label: 'Additional notes', section: 'summary', field: 'additionalNotes', rows: 2 }));
  card.appendChild(textInput({
    label: 'Signed by (clinician)', section: 'summary', field: 'signedByName', required: true,
    hint: 'A clinician must sign before the report is final.'
  }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
  renderStep6, renderStep7, renderStep8, renderStep9, renderStep10,
  renderStep11, renderStep12, renderStep13, renderStep14, renderStep15
];

// ----------------------------------------------------------------------
// Derived read-only fields (body mass index, live step-15 summary)
// ----------------------------------------------------------------------

function priorityClass(priority) {
  switch (priority) {
    case 'high': return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

function renderFlagsList(flags) {
  if (flags.length === 0) return '<p class="muted">No safety flags raised.</p>';
  return `
    <ul class="flags">
      ${flags.map((f) => `
        <li class="${priorityClass(f.priority)}">
          <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
          <span class="flag-category">${esc(titleCase(f.category))}</span>
          <span class="flag-message">${esc(f.description)}</span>
          <span class="flag-action">${esc(f.suggestedAction)}</span>
        </li>
      `).join('')}
    </ul>
  `;
}

function updateDerived() {
  const preview = calculateHipEvaluation(state);

  const bmiEl = document.getElementById('patient-derivedBmi');
  if (bmiEl) {
    bmiEl.value = preview.bmi === null ? '—' : `${preview.bmi} kg/m²`;
  }

  const live = document.getElementById('live-summary');
  if (live) {
    live.innerHTML = `
      <div class="axis-grid">
        <div class="axis-card">
          <span class="axis-name">Oxford Hip Score</span>
          <span class="axis-value">
            <strong>${preview.ohsTotal}</strong> of 48 ·
            <span class="band-badge ohs-${esc(preview.ohsCategory || 'severe')}">${esc(labelFor(OHS_CATEGORY_LABELS, preview.ohsCategory))}</span>
          </span>
        </div>
        <div class="axis-card">
          <span class="axis-name">Kellgren and Lawrence grade</span>
          <span class="axis-value"><strong>${preview.kellgrenLawrenceGrade === null ? '—' : preview.kellgrenLawrenceGrade}</strong></span>
        </div>
        <div class="axis-card">
          <span class="axis-name">Computed candidacy</span>
          <span class="axis-value"><span class="band-badge candidacy-${esc(preview.computedCandidacy || 'mdt-review')}">${esc(labelFor(CANDIDACY_LABELS, preview.computedCandidacy))}</span></span>
        </div>
        <div class="axis-card">
          <span class="axis-name">Final candidacy (with override)</span>
          <span class="axis-value"><span class="band-badge candidacy-${esc(preview.finalCandidacy || 'mdt-review')}">${esc(labelFor(CANDIDACY_LABELS, preview.finalCandidacy))}</span></span>
        </div>
      </div>
      <h3>Safety flags</h3>
      ${renderFlagsList(preview.flags)}
    `;
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  ['clinician', 'clinicianName'], ['clinician', 'role'], ['clinician', 'assessmentDate'],
  ['patient', 'name'], ['patient', 'birthDate'], ['patient', 'sex'],
  ['history', 'affectedSide'], ['history', 'painAtRest0To10'],
  ['ohs', 'painSeverity'], ['ohs', 'stairs'],
  ['function', 'walkingDistanceBeforePain'],
  ['gait', 'limpPresent'], ['gait', 'trendelenburgSign'],
  ['rangeOfMotion', 'flexionDegrees'],
  ['stability', 'jointStability'],
  ['imaging', 'weightBearingXrayPerformed'], ['imaging', 'kellgrenLawrenceGrade'],
  ['conservative', 'physiotherapyTried'], ['conservative', 'conservativeMeasuresExhausted'],
  ['fitness', 'smokingStatus'],
  ['baselineTests', 'fullBloodCountDone'],
  ['decisionMaking', 'risksAndBenefitsDiscussed'],
  ['plan', 'recommendation'],
  ['summary', 'signedByName']
];

function isAnswered(v) {
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    if (isAnswered(state[section][field])) {
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
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'clinician',      title: 'Clinician' },
  { step: 2,  section: 'patient',        title: 'Patient' },
  { step: 3,  section: 'history',        title: 'History' },
  { step: 4,  section: 'ohs',            title: 'Oxford Hip Score' },
  { step: 5,  section: 'function',       title: 'Function' },
  { step: 6,  section: 'gait',           title: 'Gait' },
  { step: 7,  section: 'rangeOfMotion',  title: 'Range of motion' },
  { step: 8,  section: 'stability',      title: 'Stability' },
  { step: 9,  section: 'imaging',        title: 'Imaging' },
  { step: 10, section: 'conservative',   title: 'Conservative' },
  { step: 11, section: 'fitness',        title: 'Fitness' },
  { step: 12, section: 'baselineTests',  title: 'Baseline tests' },
  { step: 13, section: 'decisionMaking', title: 'Decision-making' },
  { step: 14, section: 'plan',           title: 'Plan' },
  { step: 15, section: 'summary',        title: 'Summary' }
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
      if (firstUnfinished === -1) firstUnfinished = def.step;
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
  const form = document.getElementById('evaluation-form');
  if (!form) return errors;

  form.querySelectorAll('[data-required]').forEach((input) => {
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

  // A clinician override without a reason is not auditable, so it is an error.
  const override = state.summary.overrideCandidacy;
  if (override) {
    const preview = calculateHipEvaluation({
      ...state,
      summary: { ...state.summary, overrideCandidacy: '' }
    });
    if (override !== preview.computedCandidacy && !String(state.summary.overrideReason || '').trim()) {
      const id = 'summary-overrideReason';
      const message = 'An override reason is required when the final candidacy differs from the computed candidacy';
      errors.push({ id, message });
      setFieldError(id, message);
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
  summary.focus({ preventScroll: true });
}

// ----------------------------------------------------------------------
// Submit / Report
// ----------------------------------------------------------------------

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const r = lastResult;

  const firedRows = r.firedRules.map((rule) => `
    <tr>
      <th scope="row">${esc(rule.ruleId)}</th>
      <td>${esc(rule.instrument.toUpperCase())}</td>
      <td>${esc(rule.component)}</td>
      <td>${rule.score === null || rule.score === undefined ? '—' : esc(rule.score)}</td>
      <td>${esc(rule.description)}</td>
    </tr>
  `).join('');

  const firedTable = r.firedRules.length === 0
    ? '<p class="muted">No rules fired.</p>'
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Rule</th>
            <th scope="col">Instrument</th>
            <th scope="col">Component</th>
            <th scope="col">Score</th>
            <th scope="col">Why it fired</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const overrideBlock = r.finalCandidacy !== r.computedCandidacy
    ? `
      <div class="alert" data-type="warning" role="alert">
        <strong>Clinician override.</strong>
        Computed candidacy was <strong>${esc(labelFor(CANDIDACY_LABELS, r.computedCandidacy))}</strong>;
        the clinician recorded <strong>${esc(labelFor(CANDIDACY_LABELS, r.finalCandidacy))}</strong>.
        Reason: ${esc(r.overrideReason || 'not stated')}.
        Safety flags below are unaffected by the override.
      </div>
    `
    : '';

  out.innerHTML = `
    <h2>Hip Replacement Surgery Evaluation Report</h2>
    <p class="muted">
      Generated ${esc(new Date(r.timestamp).toLocaleString())} ·
      ${esc(state.patient.name || 'Patient not named')} ·
      Assessed by ${esc(state.clinician.clinicianName || '—')}
    </p>

    ${overrideBlock}

    <div class="recommendation-banner">
      <span class="band-badge ohs-${esc(r.ohsCategory || 'severe')}">${esc(labelFor(OHS_CATEGORY_LABELS, r.ohsCategory))}</span>
      <span class="band-badge candidacy-${esc(r.finalCandidacy || 'mdt-review')}">${esc(labelFor(CANDIDACY_LABELS, r.finalCandidacy))}</span>
    </div>

    <h3>Oxford Hip Score</h3>
    <div class="axis-grid">
      <div class="axis-card">
        <span class="axis-name">Total</span>
        <span class="axis-value"><strong>${r.ohsTotal}</strong> of 48</span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Category</span>
        <span class="axis-value"><span class="band-badge ohs-${esc(r.ohsCategory || 'severe')}">${esc(labelFor(OHS_CATEGORY_LABELS, r.ohsCategory))}</span></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Kellgren and Lawrence grade</span>
        <span class="axis-value"><strong>${r.kellgrenLawrenceGrade === null ? '—' : r.kellgrenLawrenceGrade}</strong></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Body mass index</span>
        <span class="axis-value"><strong>${r.bmi === null ? '—' : r.bmi}</strong>${r.bmi === null ? '' : ' kg/m²'}</span>
      </div>
    </div>

    <h3>Surgical candidacy</h3>
    <div class="axis-grid">
      <div class="axis-card">
        <span class="axis-name">Computed candidacy</span>
        <span class="axis-value"><span class="band-badge candidacy-${esc(r.computedCandidacy || 'mdt-review')}">${esc(labelFor(CANDIDACY_LABELS, r.computedCandidacy))}</span></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Final candidacy</span>
        <span class="axis-value"><span class="band-badge candidacy-${esc(r.finalCandidacy || 'mdt-review')}">${esc(labelFor(CANDIDACY_LABELS, r.finalCandidacy))}</span></span>
      </div>
    </div>

    <h3>Fired rules</h3>
    ${firedTable}

    <h3>Safety flags</h3>
    ${renderFlagsList(r.flags)}

    <div class="report-actions">
      <button type="button" id="print-btn" class="button" data-variant="secondary">Print / save PDF</button>
      <button type="button" id="export-btn" class="button" data-variant="secondary">Export JSON</button>
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
  document.getElementById('print-btn').addEventListener('click', () => window.print());
  document.getElementById('export-btn').addEventListener('click', exportJson);
}

/** Download the evaluation and its grading as a JSON file. */
function exportJson() {
  const payload = JSON.stringify({ evaluation: state, grading: lastResult }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hip-replacement-surgery-evaluation.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const result = calculateHipEvaluation(state);
  lastResult = { ...result, timestamp: new Date().toISOString() };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh evaluation?')) return;
  clearState();
  state = emptyEvaluation();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the evaluation report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateDerived();
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
  updateDerived();
  updateProgress();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
