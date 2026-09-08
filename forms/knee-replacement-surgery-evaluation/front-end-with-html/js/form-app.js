import { calculateKneeEvaluation, CANDIDACY_LABELS, OKS_CATEGORY_LABELS } from './composite-grader.js';
import { emptyEvaluation, labelFor, PLAN_RECOMMENDATION_LABELS } from './types.js';

// Knee Replacement Surgery Evaluation — clinician wizard (vanilla JS, native
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

const STORAGE_KEY = 'knee-replacement-surgery-evaluation.front-end-with-html.v1';
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
    } else if (v !== undefined && typeof fresh[key] !== 'object') {
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

let state = loadState();
/** @type {ReturnType<typeof calculateKneeEvaluation> & {timestamp:string} | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'knee-replacement-surgery-evaluation',
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

const OPTIONS = {
  role: [
    { value: 'orthopaedic-surgeon', label: 'Orthopaedic surgeon' },
    { value: 'extended-scope-physiotherapist', label: 'Extended-scope physiotherapist' },
    { value: 'other', label: 'Other' }
  ],
  registrationBody: [
    { value: 'GMC', label: 'GMC' },
    { value: 'HCPC', label: 'HCPC' },
    { value: 'other', label: 'Other' }
  ],
  sex: [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'intersex', label: 'Intersex' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ],
  kneeSide: [
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'bilateral', label: 'Bilateral' }
  ],
  priorKneeSurgeryType: [
    { value: 'arthroscopy', label: 'Arthroscopy' },
    { value: 'ligament-repair', label: 'Ligament repair' },
    { value: 'previous-partial-replacement', label: 'Previous partial replacement' },
    { value: 'other', label: 'Other' }
  ],
  walkingDistanceBeforePain: [
    { value: 'unlimited', label: 'Unlimited' },
    { value: 'over-1km', label: 'Over 1 km' },
    { value: '100m-to-1km', label: '100 m to 1 km' },
    { value: 'under-100m', label: 'Under 100 m' },
    { value: 'housebound', label: 'Housebound' }
  ],
  stairClimbingAbility: [
    { value: 'normal', label: 'Normal' },
    { value: 'with-rail', label: 'With a rail' },
    { value: 'one-step-at-a-time', label: 'One step at a time' },
    { value: 'unable', label: 'Unable' }
  ],
  walkingAid: [
    { value: 'none', label: 'None' },
    { value: 'stick', label: 'Stick' },
    { value: 'frame', label: 'Frame' },
    { value: 'wheelchair', label: 'Wheelchair' }
  ],
  coronalDeformityType: [
    { value: 'none', label: 'None' },
    { value: 'varus', label: 'Varus (bow-legged)' },
    { value: 'valgus', label: 'Valgus (knock-kneed)' }
  ],
  severity4: [
    { value: 'none', label: 'None' },
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' }
  ],
  ligament: [
    { value: 'stable', label: 'Stable' },
    { value: 'lax', label: 'Lax' }
  ],
  patellarTracking: [
    { value: 'normal', label: 'Normal' },
    { value: 'maltracking', label: 'Maltracking' }
  ],
  ctIndication: [
    { value: 'robotic-assisted-planning', label: 'Robotic-assisted surgical planning' },
    { value: 'bone-loss-assessment', label: 'Bone-loss assessment' },
    { value: 'other', label: 'Other' }
  ],
  injectionType: [
    { value: 'corticosteroid', label: 'Corticosteroid' },
    { value: 'hyaluronic-acid', label: 'Hyaluronic acid' },
    { value: 'both', label: 'Both' },
    { value: 'other', label: 'Other' }
  ],
  response3: [
    { value: 'good', label: 'Good' },
    { value: 'partial', label: 'Partial' },
    { value: 'none', label: 'None' }
  ],
  diabetesControlled: [
    { value: 'not-diabetic', label: 'Not diabetic' },
    { value: 'well-controlled', label: 'Well controlled' },
    { value: 'poorly-controlled', label: 'Poorly controlled' }
  ],
  smokingStatus: [
    { value: 'never', label: 'Never' },
    { value: 'ex-smoker', label: 'Ex-smoker' },
    { value: 'current', label: 'Current' }
  ],
  planRecommendation: [
    { value: 'total-knee-replacement', label: 'Total knee replacement' },
    { value: 'partial-knee-replacement', label: 'Partial knee replacement' },
    { value: 'continue-conservative-management', label: 'Continue conservative management' },
    { value: 'mdt-review', label: 'Refer for MDT review' },
    { value: 'not-currently-a-candidate', label: 'Not currently a candidate' }
  ],
  candidacy: [
    { value: 'strong-candidate', label: 'Strong candidate for surgery' },
    { value: 'candidate', label: 'Candidate for surgery' },
    { value: 'continue-conservative', label: 'Continue conservative management' },
    { value: 'not-indicated', label: 'Surgery not indicated' },
    { value: 'mdt-review', label: 'Refer for multidisciplinary team review' }
  ]
};

/** The 5-point (0 worst to 4 best) answer wording for each Oxford Knee Score item. */
const OKS_ITEM_OPTIONS = {
  oksPainSeverity: [
    { value: '4', label: '4 — None' },
    { value: '3', label: '3 — Very mild' },
    { value: '2', label: '2 — Mild' },
    { value: '1', label: '1 — Moderate' },
    { value: '0', label: '0 — Severe' }
  ],
  oksWashingAndDrying: [
    { value: '4', label: '4 — No difficulty at all' },
    { value: '3', label: '3 — A little difficulty' },
    { value: '2', label: '2 — Moderate difficulty' },
    { value: '1', label: '1 — Extreme difficulty' },
    { value: '0', label: '0 — Impossible to do' }
  ],
  oksTransport: [
    { value: '4', label: '4 — No difficulty at all' },
    { value: '3', label: '3 — A little difficulty' },
    { value: '2', label: '2 — Moderate difficulty' },
    { value: '1', label: '1 — Extreme difficulty' },
    { value: '0', label: '0 — Impossible to do' }
  ],
  oksWalkingDistance: [
    { value: '4', label: '4 — No pain / unlimited walking' },
    { value: '3', label: '3 — More than 30 minutes, but with some pain' },
    { value: '2', label: '2 — 16 to 30 minutes' },
    { value: '1', label: '1 — Around the house only' },
    { value: '0', label: '0 — Not at all — pain severe on walking' }
  ],
  oksPainSittingOrLying: [
    { value: '4', label: '4 — None' },
    { value: '3', label: '3 — Mild' },
    { value: '2', label: '2 — Moderate' },
    { value: '1', label: '1 — Severe' },
    { value: '0', label: '0 — Severe, all the time' }
  ],
  oksLimping: [
    { value: '4', label: '4 — Rarely / never' },
    { value: '3', label: '3 — Sometimes, or just at first' },
    { value: '2', label: '2 — Often, not just at first' },
    { value: '1', label: '1 — Most of the time' },
    { value: '0', label: '0 — All of the time' }
  ],
  oksKneeling: [
    { value: '4', label: '4 — No difficulty at all' },
    { value: '3', label: '3 — A little difficulty' },
    { value: '2', label: '2 — Moderate difficulty' },
    { value: '1', label: '1 — Extreme difficulty' },
    { value: '0', label: '0 — Impossible to do' }
  ],
  oksNightPainFrequency: [
    { value: '4', label: '4 — No nights' },
    { value: '3', label: '3 — Only 1 or 2 nights' },
    { value: '2', label: '2 — Some nights' },
    { value: '1', label: '1 — Most nights' },
    { value: '0', label: '0 — Every night' }
  ],
  oksPainInterferingWithWork: [
    { value: '4', label: '4 — Not at all' },
    { value: '3', label: '3 — A little bit' },
    { value: '2', label: '2 — Moderately' },
    { value: '1', label: '1 — Greatly' },
    { value: '0', label: '0 — Totally' }
  ],
  oksGivingWay: [
    { value: '4', label: '4 — Rarely / never' },
    { value: '3', label: '3 — Sometimes, not on stairs' },
    { value: '2', label: '2 — Often, not on stairs' },
    { value: '1', label: '1 — Sometimes, on stairs' },
    { value: '0', label: '0 — Often, on stairs, or every time' }
  ],
  oksShopping: [
    { value: '4', label: '4 — No difficulty at all' },
    { value: '3', label: '3 — A little difficulty' },
    { value: '2', label: '2 — Moderate difficulty' },
    { value: '1', label: '1 — Extreme difficulty' },
    { value: '0', label: '0 — Impossible to do' }
  ],
  oksStairs: [
    { value: '4', label: '4 — No difficulty at all' },
    { value: '3', label: '3 — A little difficulty' },
    { value: '2', label: '2 — Moderate difficulty' },
    { value: '1', label: '1 — Extreme difficulty' },
    { value: '0', label: '0 — Impossible to do' }
  ]
};

function oksItem(field, label) {
  const id = `oks-${field}`;
  const current = state.oks[field];
  const currentStr = current === null || current === undefined ? '' : String(current);
  const options = OKS_ITEM_OPTIONS[field];
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const optionsHtml = [
    '<option value="">— Select —</option>',
    ...options.map((o) => `<option value="${o.value}"${o.value === currentStr ? ' selected' : ''}>${esc(o.label)}</option>`)
  ].join('');
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(label)}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error">
      ${optionsHtml}
    </select>
    <span class="error-message" id="${id}-error"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => {
    setField('oks', field, sel.value === '' ? null : Number(sel.value));
    clearFieldError(id);
  });
  return wrapper;
}

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
    selectInput({ label: 'Role', section: 'clinician', field: 'role', options: OPTIONS.role, required: true }),
    selectInput({ label: 'Registration body', section: 'clinician', field: 'registrationBody', options: OPTIONS.registrationBody })
  ]));
  card.appendChild(textInput({ label: 'Registration number', section: 'clinician', field: 'registrationNumber', hint: 'For example, the GMC number.' }));
  card.appendChild(textInput({ label: 'Site', section: 'clinician', field: 'siteName' }));
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
    description: 'Who the patient is, and the height and weight used for body mass index.'
  });
  card.appendChild(textInput({ label: 'Name', section: 'patient', field: 'name', required: true }));
  card.appendChild(grid('two-col', [
    textInput({
      label: 'Date of birth', section: 'patient', field: 'birthDate', type: 'date',
      hint: 'Used for the paediatric safety flag — the Oxford Knee Score is not validated below 16 years.'
    }),
    selectInput({ label: 'Sex', section: 'patient', field: 'sex', options: OPTIONS.sex })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'NHS number', section: 'patient', field: 'nhsNumber', placeholder: 'NNN NNN NNNN' }),
    textInput({ label: 'Preferred language', section: 'patient', field: 'preferredLanguage' })
  ]));
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
    hint: 'Computed from height and weight. 40 or above raises the high-bmi-surgical-risk safety flag.'
  }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Presenting history',
    description: 'The affected knee, symptom duration, pain, and any prior surgery or injury.'
  });
  card.appendChild(selectInput({
    label: 'Affected knee', section: 'history', field: 'kneeSide', options: OPTIONS.kneeSide, required: true,
    hint: 'Bilateral raises the bilateral-symptomatic safety flag — a staging decision is needed.'
  }));
  card.appendChild(textInput({ label: 'Symptom duration', section: 'history', field: 'symptomDurationMonths', type: 'number', min: 0, max: 1200, unit: 'months' }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Pain at rest', section: 'history', field: 'painAtRest0To10', type: 'number', min: 0, max: 10, unit: '0–10' }),
    textInput({ label: 'Pain on activity', section: 'history', field: 'painOnActivity0To10', type: 'number', min: 0, max: 10, unit: '0–10' })
  ]));
  card.appendChild(yesNo({ label: 'Night pain', section: 'history', field: 'nightPain' }));
  card.appendChild(subHead('Prior knee surgery'));
  card.appendChild(yesNo({ label: 'Prior surgery to this knee', section: 'history', field: 'priorKneeSurgery' }));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Surgery type', section: 'history', field: 'priorKneeSurgeryType', options: OPTIONS.priorKneeSurgeryType }),
    textInput({ label: 'Surgery date', section: 'history', field: 'priorKneeSurgeryDate', type: 'date' })
  ]));
  card.appendChild(subHead('Prior injury'));
  card.appendChild(yesNo({ label: 'Prior injury to this knee', section: 'history', field: 'priorInjury' }));
  card.appendChild(textArea({ label: 'Injury detail', section: 'history', field: 'priorInjuryDetail', rows: 2 }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Oxford Knee Score',
    description: 'Twelve items, each scored 0 (worst) to 4 (best) from the patient’s answers. The total ranges 0 to 48, where 48 is the best possible outcome.'
  });
  card.appendChild(oksItem('oksPainSeverity', '1. Usual knee pain severity'));
  card.appendChild(oksItem('oksWashingAndDrying', '2. Washing and drying difficulty'));
  card.appendChild(oksItem('oksTransport', '3. Getting in or out of a car, or using public transport'));
  card.appendChild(oksItem('oksWalkingDistance', '4. Walking distance before pain becomes severe'));
  card.appendChild(oksItem('oksPainSittingOrLying', '5. Pain sitting or lying'));
  card.appendChild(oksItem('oksLimping', '6. Limping when walking'));
  card.appendChild(oksItem('oksKneeling', '7. Kneeling difficulty'));
  card.appendChild(oksItem('oksNightPainFrequency', '8. Night pain frequency'));
  card.appendChild(oksItem('oksPainInterferingWithWork', '9. Pain interfering with usual work (including housework)'));
  card.appendChild(oksItem('oksGivingWay', '10. Feeling the knee might suddenly "give way"'));
  card.appendChild(oksItem('oksShopping', '11. Ability to do the household shopping alone'));
  card.appendChild(oksItem('oksStairs', '12. Ability to walk down a flight of stairs'));
  card.appendChild(textInput({
    label: 'Oxford Knee Score total', section: 'oks', field: 'derivedTotal', type: 'text', readonly: true,
    hint: 'Computed live as items are answered. An unanswered item counts as 0 towards a partial total.'
  }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Functional limitations',
    description: 'Walking distance, stair-climbing, standing from a chair, and any walking aid in use.'
  });
  card.appendChild(selectInput({ label: 'Walking distance before pain', section: 'functional', field: 'walkingDistanceBeforePain', options: OPTIONS.walkingDistanceBeforePain }));
  card.appendChild(selectInput({ label: 'Stair-climbing ability', section: 'functional', field: 'stairClimbingAbility', options: OPTIONS.stairClimbingAbility }));
  card.appendChild(yesNo({ label: 'Can stand from a chair unaided', section: 'functional', field: 'standFromChairUnaided' }));
  card.appendChild(selectInput({ label: 'Walking aid in use', section: 'functional', field: 'walkingAid', options: OPTIONS.walkingAid }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Physical examination — range of motion',
    description: 'Active flexion, extension deficit, and fixed flexion deformity.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'Flexion', section: 'rangeOfMotion', field: 'flexionDegrees', type: 'number', min: 0, max: 150, unit: 'degrees' }),
    textInput({ label: 'Extension deficit', section: 'rangeOfMotion', field: 'extensionDeficitDegrees', type: 'number', min: 0, max: 90, unit: 'degrees' })
  ]));
  card.appendChild(yesNo({ label: 'Fixed flexion deformity present', section: 'rangeOfMotion', field: 'fixedFlexionDeformityPresent' }));
  card.appendChild(textInput({
    label: 'Fixed flexion deformity', section: 'rangeOfMotion', field: 'fixedFlexionDeformityDegrees',
    type: 'number', min: 0, max: 90, unit: 'degrees',
    hint: 'Above 15 degrees raises the fixed-flexion-deformity safety flag — it affects surgical planning.'
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Physical examination — stability and alignment',
    description: 'Coronal-plane deformity, ligament stability, and patellar tracking.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Coronal deformity type', section: 'stability', field: 'coronalDeformityType', options: OPTIONS.coronalDeformityType }),
    selectInput({ label: 'Coronal deformity severity', section: 'stability', field: 'coronalDeformitySeverity', options: OPTIONS.severity4 })
  ]));
  card.appendChild(subHead('Ligament stability'));
  card.appendChild(grid('four-col', [
    selectInput({ label: 'ACL', section: 'stability', field: 'ligamentAcl', options: OPTIONS.ligament }),
    selectInput({ label: 'PCL', section: 'stability', field: 'ligamentPcl', options: OPTIONS.ligament }),
    selectInput({ label: 'MCL', section: 'stability', field: 'ligamentMcl', options: OPTIONS.ligament }),
    selectInput({ label: 'LCL', section: 'stability', field: 'ligamentLcl', options: OPTIONS.ligament })
  ]));
  card.appendChild(selectInput({ label: 'Patellar tracking', section: 'stability', field: 'patellarTracking', options: OPTIONS.patellarTracking }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Physical examination — muscle strength and effusion',
    description: 'Quadriceps strength, joint effusion, and crepitus.'
  });
  card.appendChild(textInput({
    label: 'Quadriceps strength', section: 'strength', field: 'quadricepsStrengthMrc', type: 'number', min: 0, max: 5,
    hint: 'Medical Research Council (MRC) scale, 0 to 5.'
  }));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Effusion present', section: 'strength', field: 'effusionPresent' }),
    yesNo({ label: 'Crepitus present', section: 'strength', field: 'crepitusPresent' })
  ]));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Diagnostic imaging',
    description: 'The weight-bearing X-ray Kellgren-Lawrence grade per compartment, and any MRI or CT.'
  });
  card.appendChild(yesNo({ label: 'Weight-bearing X-ray performed', section: 'imaging', field: 'weightBearingXrayPerformed' }));
  card.appendChild(subHead('Kellgren-Lawrence grade (0–4) per compartment'));
  card.appendChild(grid('three-col', [
    textInput({ label: 'Medial', section: 'imaging', field: 'kellgrenLawrenceGradeMedial', type: 'number', min: 0, max: 4 }),
    textInput({ label: 'Lateral', section: 'imaging', field: 'kellgrenLawrenceGradeLateral', type: 'number', min: 0, max: 4 }),
    textInput({ label: 'Patellofemoral', section: 'imaging', field: 'kellgrenLawrenceGradePatellofemoral', type: 'number', min: 0, max: 4 })
  ]));
  card.appendChild(note('The highest grade recorded across the three compartments drives the surgical-candidacy recommendation.'));
  card.appendChild(subHead('MRI'));
  card.appendChild(yesNo({ label: 'MRI performed', section: 'imaging', field: 'mriPerformed' }));
  card.appendChild(textArea({ label: 'MRI findings', section: 'imaging', field: 'mriFindings', rows: 2 }));
  card.appendChild(subHead('CT'));
  card.appendChild(yesNo({ label: 'CT performed', section: 'imaging', field: 'ctPerformed' }));
  card.appendChild(selectInput({ label: 'CT indication', section: 'imaging', field: 'ctIndication', options: OPTIONS.ctIndication }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Conservative treatment audit',
    description: 'What has already been tried, and whether conservative measures are exhausted. This drives the computed surgical-candidacy recommendation and the conservative-treatment-not-exhausted safety flag.'
  });
  card.appendChild(yesNo({ label: 'Physiotherapy tried', section: 'conservative', field: 'physiotherapyTried' }));
  card.appendChild(textInput({ label: 'Physiotherapy duration', section: 'conservative', field: 'physiotherapyDurationWeeks', type: 'number', min: 0, max: 520, unit: 'weeks' }));
  card.appendChild(yesNo({ label: 'Weight-management advice given', section: 'conservative', field: 'weightManagementAdviceGiven' }));
  card.appendChild(subHead('Injection'));
  card.appendChild(yesNo({ label: 'Injection given', section: 'conservative', field: 'injectionGiven' }));
  card.appendChild(grid('three-col', [
    selectInput({ label: 'Injection type', section: 'conservative', field: 'injectionType', options: OPTIONS.injectionType }),
    textInput({ label: 'Number of injections', section: 'conservative', field: 'injectionCount', type: 'number', min: 0, max: 20 }),
    selectInput({ label: 'Response', section: 'conservative', field: 'injectionResponse', options: OPTIONS.response3 })
  ]));
  card.appendChild(subHead('NSAID or analgesic trial'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Trial undertaken', section: 'conservative', field: 'nsaidAnalgesicTrial' }),
    selectInput({ label: 'Response', section: 'conservative', field: 'nsaidAnalgesicResponse', options: OPTIONS.response3 })
  ]));
  card.appendChild(yesNo({ label: 'Walking-aid trial undertaken', section: 'conservative', field: 'walkingAidTrial' }));
  card.appendChild(yesNo({
    label: 'Conservative measures exhausted', section: 'conservative', field: 'conservativeMeasuresExhausted',
    hint: 'Required to reach strong-candidate or candidate; "no" or unanswered drives continue-conservative regardless of score.'
  }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'General health and surgical fitness screen',
    description: 'A high-level screen only — this form does not grade ASA physical status or replace a formal pre-operative assessment.'
  });
  card.appendChild(selectInput({ label: 'Diabetes control', section: 'generalHealth', field: 'diabetesControlled', options: OPTIONS.diabetesControlled }));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Cardiac disease', section: 'generalHealth', field: 'cardiacDisease' }),
    yesNo({ label: 'Bleeding disorder or anticoagulant', section: 'generalHealth', field: 'bleedingDisorderOrAnticoagulant' })
  ]));
  card.appendChild(selectInput({ label: 'Smoking status', section: 'generalHealth', field: 'smokingStatus', options: OPTIONS.smokingStatus }));
  card.appendChild(textArea({ label: 'General fitness note', section: 'generalHealth', field: 'generalFitnessNote', rows: 2 }));
  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Pre-operative baseline bloods and tests',
    description: 'Done / not-done checklist. An incomplete checklist alongside a surgical recommendation raises the pre-op-bloods-incomplete safety flag.'
  });
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Full blood count (FBC)', section: 'preOpBloods', field: 'fbcDone' }),
    yesNo({ label: 'Renal function', section: 'preOpBloods', field: 'renalFunctionDone' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Clotting / INR', section: 'preOpBloods', field: 'clottingDone' }),
    yesNo({ label: 'Electrocardiogram (ECG)', section: 'preOpBloods', field: 'ecgDone' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'MRSA screen', section: 'preOpBloods', field: 'mrsaScreenDone' }),
    yesNo({ label: 'Urinalysis', section: 'preOpBloods', field: 'urinalysisDone' })
  ]));
  return card;
}

function renderStep13() {
  const card = sectionCard({
    stepNumber: 13,
    title: 'Shared decision-making',
    description: 'Confirming the patient understands the risks, benefits, and realistic expectations of surgery.'
  });
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Risks and benefits discussed', section: 'sharedDecision', field: 'risksBenefitsDiscussed' }),
    yesNo({ label: 'Realistic expectations discussed', section: 'sharedDecision', field: 'realisticExpectationsDiscussed' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Patient decision aid given', section: 'sharedDecision', field: 'patientDecisionAidGiven' }),
    yesNo({ label: 'Interpreter required', section: 'sharedDecision', field: 'interpreterRequired' })
  ]));
  return card;
}

function renderStep14() {
  const card = sectionCard({
    stepNumber: 14,
    title: 'Management plan and recommendation',
    description: 'The clinician’s recommendation, and, if surgical, the target list date and responsible surgeon.'
  });
  card.appendChild(selectInput({ label: 'Recommendation', section: 'plan', field: 'planRecommendation', options: OPTIONS.planRecommendation, required: true }));
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
    description: 'The computed Oxford Knee Score and surgical-candidacy recommendation, an optional clinician override, and the electronic signature. Submit to compute the report.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'Computed OKS category', section: 'summary', field: 'derivedOksCategory', type: 'text', readonly: true }),
    textInput({ label: 'Computed surgical candidacy', section: 'summary', field: 'derivedCandidacy', type: 'text', readonly: true })
  ]));
  card.appendChild(subHead('Clinician override'));
  card.appendChild(note(
    'The override changes the final candidacy only. Safety flags are computed independently and are always printed, so an override cannot hide a hazard.'
  ));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Override candidacy', section: 'summary', field: 'overrideCandidacy', options: OPTIONS.candidacy }),
    textInput({ label: 'Override reason', section: 'summary', field: 'overrideReason', hint: 'Mandatory when the override differs from the computed value.' })
  ]));
  card.appendChild(subHead('Sign-off'));
  card.appendChild(textArea({ label: 'Clinician notes', section: 'summary', field: 'clinicianNotes', rows: 3 }));
  card.appendChild(textInput({
    label: 'Signed by', section: 'summary', field: 'signedByName', required: true,
    hint: 'The orthopaedic surgeon or extended-scope physiotherapist must sign before the report is final.'
  }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
  renderStep6, renderStep7, renderStep8, renderStep9, renderStep10,
  renderStep11, renderStep12, renderStep13, renderStep14, renderStep15
];

// ----------------------------------------------------------------------
// Derived read-only fields (body mass index, OKS total, computed labels)
// ----------------------------------------------------------------------

function updateDerived() {
  const preview = calculateKneeEvaluation(state);

  const bmiEl = document.getElementById('patient-derivedBmi');
  if (bmiEl) {
    const height = Number(state.patient.heightAsCm);
    const weight = Number(state.patient.weightAsKg);
    const bmi = state.patient.heightAsCm && state.patient.weightAsKg && height > 0
      ? Math.round((weight / ((height / 100) * (height / 100))) * 10) / 10
      : null;
    bmiEl.value = bmi === null ? '—' : `${bmi} kg/m²`;
  }

  const totalEl = document.getElementById('oks-derivedTotal');
  if (totalEl) {
    totalEl.value = `${preview.oksTotal} of 48 · ${labelFor(OKS_CATEGORY_LABELS, preview.computedOksCategory)}`;
  }

  const catEl = document.getElementById('summary-derivedOksCategory');
  if (catEl) catEl.value = labelFor(OKS_CATEGORY_LABELS, preview.computedOksCategory);

  const candEl = document.getElementById('summary-derivedCandidacy');
  if (candEl) candEl.value = labelFor(CANDIDACY_LABELS, preview.computedCandidacy);
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  ['clinician', 'clinicianName'], ['clinician', 'role'], ['clinician', 'assessmentDate'],
  ['patient', 'name'], ['patient', 'birthDate'], ['patient', 'heightAsCm'], ['patient', 'weightAsKg'],
  ['history', 'kneeSide'], ['history', 'symptomDurationMonths'], ['history', 'nightPain'],
  ['oks', 'oksPainSeverity'], ['oks', 'oksWashingAndDrying'], ['oks', 'oksTransport'],
  ['oks', 'oksWalkingDistance'], ['oks', 'oksPainSittingOrLying'], ['oks', 'oksLimping'],
  ['oks', 'oksKneeling'], ['oks', 'oksNightPainFrequency'], ['oks', 'oksPainInterferingWithWork'],
  ['oks', 'oksGivingWay'], ['oks', 'oksShopping'], ['oks', 'oksStairs'],
  ['functional', 'walkingDistanceBeforePain'], ['functional', 'walkingAid'],
  ['rangeOfMotion', 'flexionDegrees'], ['rangeOfMotion', 'fixedFlexionDeformityPresent'],
  ['stability', 'coronalDeformityType'], ['stability', 'patellarTracking'],
  ['strength', 'quadricepsStrengthMrc'], ['strength', 'effusionPresent'],
  ['imaging', 'weightBearingXrayPerformed'], ['imaging', 'kellgrenLawrenceGradeMedial'],
  ['conservative', 'physiotherapyTried'], ['conservative', 'conservativeMeasuresExhausted'],
  ['generalHealth', 'diabetesControlled'], ['generalHealth', 'smokingStatus'],
  ['preOpBloods', 'fbcDone'], ['preOpBloods', 'renalFunctionDone'],
  ['sharedDecision', 'risksBenefitsDiscussed'], ['sharedDecision', 'realisticExpectationsDiscussed'],
  ['plan', 'planRecommendation'], ['plan', 'responsibleSurgeon'],
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
  { step: 4,  section: 'oks',            title: 'Oxford Knee Score' },
  { step: 5,  section: 'functional',     title: 'Function' },
  { step: 6,  section: 'rangeOfMotion',  title: 'Range of motion' },
  { step: 7,  section: 'stability',      title: 'Stability' },
  { step: 8,  section: 'strength',       title: 'Strength' },
  { step: 9,  section: 'imaging',        title: 'Imaging' },
  { step: 10, section: 'conservative',   title: 'Conservative' },
  { step: 11, section: 'generalHealth',  title: 'General health' },
  { step: 12, section: 'preOpBloods',    title: 'Pre-op bloods' },
  { step: 13, section: 'sharedDecision', title: 'Decision-making' },
  { step: 14, section: 'plan',           title: 'Plan' },
  { step: 15, section: 'summary',        title: 'Sign-off' }
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
  const form = document.getElementById('assessment-form');
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
    const preview = calculateKneeEvaluation({
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

function priorityClass(priority) {
  switch (priority) {
    case 'high': return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

function titleCase(s) {
  return String(s || '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const r = lastResult;

  const flagsList = r.flags.length === 0
    ? '<p class="muted">No safety flags raised.</p>'
    : `
      <ul class="flags">
        ${r.flags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
            <span class="flag-category">${esc(titleCase(f.category))}</span>
            <span class="flag-message">${esc(f.description)}</span>
            <span class="flag-action">${esc(f.suggestedAction)}</span>
          </li>
        `).join('')}
      </ul>
    `;

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
    <h2>Knee Replacement Surgery Evaluation Report</h2>
    <p class="muted">
      Generated ${esc(new Date(r.timestamp).toLocaleString())} ·
      ${esc(state.patient.name || 'Patient not named')} ·
      Assessed by ${esc(state.clinician.clinicianName || '—')}
    </p>

    ${overrideBlock}

    <div class="recommendation-banner">
      <span class="band-badge oks-${esc(r.finalOksCategory)}">${esc(labelFor(OKS_CATEGORY_LABELS, r.finalOksCategory))}</span>
      <span class="band-badge candidacy-${esc(r.finalCandidacy)}">${esc(labelFor(CANDIDACY_LABELS, r.finalCandidacy))}</span>
      <span class="band-badge candidacy-${esc(r.finalCandidacy)}">${esc(labelFor(PLAN_RECOMMENDATION_LABELS, state.plan.planRecommendation))}</span>
    </div>

    <h3>Oxford Knee Score</h3>
    <div class="axis-grid">
      <div class="axis-card">
        <span class="axis-name">OKS total</span>
        <span class="axis-value"><strong>${r.oksTotal}</strong> of 48</span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Computed category</span>
        <span class="axis-value"><span class="band-badge oks-${esc(r.computedOksCategory)}">${esc(labelFor(OKS_CATEGORY_LABELS, r.computedOksCategory))}</span></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Highest Kellgren-Lawrence grade</span>
        <span class="axis-value"><strong>${r.maxKellgrenLawrenceGrade === null ? '—' : r.maxKellgrenLawrenceGrade}</strong>${r.maxKellgrenLawrenceGrade === null ? '' : ' of 4'}</span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Computed surgical candidacy</span>
        <span class="axis-value"><span class="band-badge candidacy-${esc(r.computedCandidacy)}">${esc(labelFor(CANDIDACY_LABELS, r.computedCandidacy))}</span></span>
      </div>
    </div>

    <h3>Fired rules</h3>
    ${firedTable}

    <h3>Safety flags</h3>
    ${flagsList}

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
  a.download = 'knee-replacement-surgery-evaluation.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const result = calculateKneeEvaluation(state);
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
