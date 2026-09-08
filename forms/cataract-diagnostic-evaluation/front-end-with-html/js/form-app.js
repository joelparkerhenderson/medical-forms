import { calculateCataractEvaluation } from './composite-grader.js';
import {
  LOCS_III_SEVERITY_LABELS,
  SURGICAL_CANDIDACY_LABELS,
  emptyEvaluation,
  labelFor
} from './types.js';

// Cataract Diagnostic Evaluation — clinician wizard (vanilla JS, native ES
// modules).
//
// Single-page continuous wizard: all 15 sections are rendered into the page
// in document order. The user scrolls through them; the top-of-page progress
// summary reflects how many tracked fields have been answered. A live
// summary panel on step 15 shows the currently computed LOCS III severity
// band per eye, surgical candidacy, and functional impact score as the
// clinician works. Submission runs the pure grading engine and renders an
// inline evaluation report. State is persisted to localStorage so a partial
// fill survives a page reload — the full evaluation typically takes 1 to 2
// hours because it requires pupil dilation.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'cataract-diagnostic-evaluation.front-end-with-html.v1';
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

let state = loadState();
/** @type {ReturnType<typeof calculateCataractEvaluation> & {timestamp:string} | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'cataract-diagnostic-evaluation',
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

const SEVERITY_4 = [
  { value: 'none', label: 'None' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' }
];

const OPTIONS = {
  role: [
    { value: 'optometrist', label: 'Optometrist' },
    { value: 'ophthalmologist', label: 'Ophthalmologist' },
    { value: 'orthoptist', label: 'Orthoptist' },
    { value: 'other', label: 'Other' }
  ],
  registrationBody: [
    { value: 'GOC', label: 'GOC' },
    { value: 'GMC', label: 'GMC' },
    { value: 'other', label: 'Other' }
  ],
  sex: [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'intersex', label: 'Intersex' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ],
  symptomLaterality: [
    { value: 'right-eye', label: 'Right eye' },
    { value: 'left-eye', label: 'Left eye' },
    { value: 'both-eyes', label: 'Both eyes' }
  ],
  steroidUse: [
    { value: 'none', label: 'None' },
    { value: 'systemic', label: 'Systemic' },
    { value: 'topical', label: 'Topical' },
    { value: 'both', label: 'Both systemic and topical' }
  ],
  smokingStatus: [
    { value: 'never', label: 'Never' },
    { value: 'former', label: 'Former' },
    { value: 'current', label: 'Current' }
  ],
  refractionStability: [
    { value: 'stable', label: 'Stable' },
    { value: 'changing', label: 'Changing' }
  ],
  cataractType: [
    { value: 'nuclear', label: 'Nuclear' },
    { value: 'cortical', label: 'Cortical' },
    { value: 'posterior-subcapsular', label: 'Posterior subcapsular' },
    { value: 'mixed', label: 'Mixed' },
    { value: 'none', label: 'None' }
  ],
  anteriorChamberDepth: [
    { value: 'normal', label: 'Normal' },
    { value: 'shallow', label: 'Shallow' },
    { value: 'deep', label: 'Deep' }
  ],
  cornealClarity: [
    { value: 'clear', label: 'Clear' },
    { value: 'hazy', label: 'Hazy' },
    { value: 'scarred', label: 'Scarred' }
  ],
  pupilReaction: [
    { value: 'normal', label: 'Normal' },
    { value: 'sluggish', label: 'Sluggish' },
    { value: 'fixed', label: 'Fixed' }
  ],
  tonometryMethod: [
    { value: 'goldmann', label: 'Goldmann' },
    { value: 'non-contact', label: 'Non-contact' },
    { value: 'icare', label: 'iCare' },
    { value: 'other', label: 'Other' }
  ],
  maculaFindings: [
    { value: 'normal', label: 'Normal' },
    { value: 'amd-suspected', label: 'Age-related macular degeneration suspected' },
    { value: 'other', label: 'Other' }
  ],
  managementRecommendation: [
    { value: 'monitor', label: 'Monitor' },
    { value: 'spectacle-change', label: 'Spectacle change' },
    { value: 'surgical-referral-routine', label: 'Surgical referral — routine' },
    { value: 'surgical-referral-urgent', label: 'Surgical referral — urgent' }
  ],
  eyeChoice: [
    { value: 'right', label: 'Right' },
    { value: 'left', label: 'Left' },
    { value: 'both', label: 'Both' },
    { value: 'none', label: 'None' }
  ],
  surgicalCandidacy: [
    { value: 'not-indicated', label: 'Surgery not indicated' },
    { value: 'consider', label: 'Consider surgical referral' },
    { value: 'indicated', label: 'Surgery indicated' },
    { value: 'urgent-referral', label: 'Urgent referral' }
  ]
};

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
  card.appendChild(grid('two-col', [
    textInput({ label: 'Registration number', section: 'clinician', field: 'registrationNumber' }),
    textInput({ label: 'Site', section: 'clinician', field: 'siteName' })
  ]));
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
    description: 'Who the patient is and how to contact them.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'First name', section: 'patient', field: 'firstName', required: true }),
    textInput({ label: 'Last name', section: 'patient', field: 'lastName', required: true })
  ]));
  card.appendChild(grid('two-col', [
    textInput({
      label: 'Date of birth', section: 'patient', field: 'birthDate', type: 'date',
      hint: 'Used for the paediatric safety flag; LOCS III and this pathway are not validated below 16 years.'
    }),
    selectInput({ label: 'Sex', section: 'patient', field: 'sex', options: OPTIONS.sex })
  ]));
  card.appendChild(textInput({ label: 'NHS number', section: 'patient', field: 'nhsNumber', placeholder: 'NNN NNN NNNN' }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Email', section: 'patient', field: 'email', type: 'email' }),
    textInput({ label: 'Phone', section: 'patient', field: 'phone', type: 'tel' })
  ]));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Presenting complaint and visual symptoms',
    description: 'The symptoms that prompted the referral or self-presentation.'
  });
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Blurred vision', section: 'symptoms', field: 'blurredVision' }),
    yesNo({ label: 'Glare or halos', section: 'symptoms', field: 'glareOrHalos' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Night-driving difficulty', section: 'symptoms', field: 'nightDrivingDifficulty' }),
    yesNo({ label: 'Faded colour perception', section: 'symptoms', field: 'fadedColourPerception' })
  ]));
  card.appendChild(yesNo({ label: 'Frequent prescription changes', section: 'symptoms', field: 'frequentPrescriptionChanges' }));
  card.appendChild(grid('two-col', [
    textInput({
      label: 'Symptom duration', section: 'symptoms', field: 'symptomDurationMonths', type: 'number', min: 0, max: 600, unit: 'months',
      hint: 'Under 3 months with a severe LOCS III grade raises the rapid-progression flag.'
    }),
    selectInput({ label: 'Laterality', section: 'symptoms', field: 'symptomLaterality', options: OPTIONS.symptomLaterality })
  ]));
  card.appendChild(textArea({ label: 'Presenting complaint notes', section: 'symptoms', field: 'presentingComplaintNotes', rows: 3 }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Ocular and medical history',
    description: 'Conditions and exposures relevant to cataract formation and surgical risk.'
  });
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Diabetes', section: 'history', field: 'historyDiabetes' }),
    yesNo({ label: 'Prior eye surgery', section: 'history', field: 'historyPriorEyeSurgery' })
  ]));
  card.appendChild(textInput({ label: 'Prior eye surgery detail', section: 'history', field: 'historyPriorEyeSurgeryDetail' }));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Ocular trauma', section: 'history', field: 'historyOcularTrauma' }),
    yesNo({ label: 'Uveitis', section: 'history', field: 'historyUveitis' })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Steroid use', section: 'history', field: 'historySteroidUse', options: OPTIONS.steroidUse }),
    yesNo({ label: 'Family history of cataract', section: 'history', field: 'historyFamilyCataract' })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Smoking status', section: 'history', field: 'historySmokingStatus', options: OPTIONS.smokingStatus }),
    yesNo({ label: 'High UV exposure', section: 'history', field: 'historyHighUvExposure' })
  ]));
  card.appendChild(yesNo({ label: 'High myopia', section: 'history', field: 'historyHighMyopia' }));
  card.appendChild(textArea({ label: 'Medical history notes', section: 'history', field: 'medicalHistoryNotes', rows: 3 }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Visual acuity',
    description: 'Unaided, best-corrected, and pinhole acuity, per eye, in LogMAR and Snellen-equivalent. Best-corrected acuity worse than 6/12 (LogMAR > 0.30) or 6/18 (LogMAR ≥ 0.48) drives the surgical-candidacy recommendation.'
  });
  card.appendChild(subHead('Unaided'));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Unaided VA — right, LogMAR', section: 'acuity', field: 'unaidedVaLogmarRight', type: 'number', min: -0.3, max: 3, step: 0.01 }),
    textInput({ label: 'Unaided VA — left, LogMAR', section: 'acuity', field: 'unaidedVaLogmarLeft', type: 'number', min: -0.3, max: 3, step: 0.01 })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Unaided VA — right, Snellen', section: 'acuity', field: 'unaidedVaSnellenRight', placeholder: '6/12' }),
    textInput({ label: 'Unaided VA — left, Snellen', section: 'acuity', field: 'unaidedVaSnellenLeft', placeholder: '6/12' })
  ]));
  card.appendChild(subHead('Best-corrected'));
  card.appendChild(grid('two-col', [
    textInput({
      label: 'Best-corrected VA — right, LogMAR', section: 'acuity', field: 'bestCorrectedVaLogmarRight',
      type: 'number', min: -0.3, max: 3, step: 0.01,
      hint: '> 0.30 raises candidacy to consider; ≥ 0.48 raises candidacy to indicated.'
    }),
    textInput({
      label: 'Best-corrected VA — left, LogMAR', section: 'acuity', field: 'bestCorrectedVaLogmarLeft',
      type: 'number', min: -0.3, max: 3, step: 0.01,
      hint: '> 0.30 raises candidacy to consider; ≥ 0.48 raises candidacy to indicated.'
    })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Best-corrected VA — right, Snellen', section: 'acuity', field: 'bestCorrectedVaSnellenRight', placeholder: '6/12' }),
    textInput({ label: 'Best-corrected VA — left, Snellen', section: 'acuity', field: 'bestCorrectedVaSnellenLeft', placeholder: '6/12' })
  ]));
  card.appendChild(subHead('Pinhole'));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Pinhole VA — right, LogMAR', section: 'acuity', field: 'pinholeVaLogmarRight', type: 'number', min: -0.3, max: 3, step: 0.01 }),
    textInput({ label: 'Pinhole VA — left, LogMAR', section: 'acuity', field: 'pinholeVaLogmarLeft', type: 'number', min: -0.3, max: 3, step: 0.01 })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Pinhole VA — right, Snellen', section: 'acuity', field: 'pinholeVaSnellenRight', placeholder: '6/9' }),
    textInput({ label: 'Pinhole VA — left, Snellen', section: 'acuity', field: 'pinholeVaSnellenLeft', placeholder: '6/9' })
  ]));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Refraction',
    description: 'Current spectacle prescription, per eye, and whether the refraction is stable.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'Sphere — right', section: 'refraction', field: 'refractionSphereRight', type: 'number', step: 0.25, unit: 'D' }),
    textInput({ label: 'Sphere — left', section: 'refraction', field: 'refractionSphereLeft', type: 'number', step: 0.25, unit: 'D' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Cylinder — right', section: 'refraction', field: 'refractionCylinderRight', type: 'number', step: 0.25, unit: 'D' }),
    textInput({ label: 'Cylinder — left', section: 'refraction', field: 'refractionCylinderLeft', type: 'number', step: 0.25, unit: 'D' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Axis — right', section: 'refraction', field: 'refractionAxisRight', type: 'number', min: 0, max: 180, unit: '°' }),
    textInput({ label: 'Axis — left', section: 'refraction', field: 'refractionAxisLeft', type: 'number', min: 0, max: 180, unit: '°' })
  ]));
  card.appendChild(selectInput({
    label: 'Refraction stability', section: 'refraction', field: 'refractionStability', options: OPTIONS.refractionStability,
    hint: 'Frequent prescription changes are also captured on step 3.'
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Slit-lamp examination',
    description: 'LOCS III grading (Chylack et al. 1993) of the four subscales, per eye, plus anterior-segment findings. Severity band: mild if all subscores are below 3.0; moderate if any is 3.0–4.9; severe if any is 5.0 or above.'
  });
  card.appendChild(subHead('LOCS III — right eye'));
  card.appendChild(grid('four-col', [
    textInput({ label: 'NO (nuclear opalescence)', section: 'slitLamp', field: 'locsIiiNoRight', type: 'number', min: 0.1, max: 6.9, step: 0.1 }),
    textInput({ label: 'NC (nuclear colour)', section: 'slitLamp', field: 'locsIiiNcRight', type: 'number', min: 0.1, max: 6.9, step: 0.1 }),
    textInput({ label: 'C (cortical)', section: 'slitLamp', field: 'locsIiiCRight', type: 'number', min: 0.1, max: 5.9, step: 0.1 }),
    textInput({ label: 'P (posterior subcapsular)', section: 'slitLamp', field: 'locsIiiPRight', type: 'number', min: 0.1, max: 5.9, step: 0.1 })
  ]));
  card.appendChild(subHead('LOCS III — left eye'));
  card.appendChild(grid('four-col', [
    textInput({ label: 'NO (nuclear opalescence)', section: 'slitLamp', field: 'locsIiiNoLeft', type: 'number', min: 0.1, max: 6.9, step: 0.1 }),
    textInput({ label: 'NC (nuclear colour)', section: 'slitLamp', field: 'locsIiiNcLeft', type: 'number', min: 0.1, max: 6.9, step: 0.1 }),
    textInput({ label: 'C (cortical)', section: 'slitLamp', field: 'locsIiiCLeft', type: 'number', min: 0.1, max: 5.9, step: 0.1 }),
    textInput({ label: 'P (posterior subcapsular)', section: 'slitLamp', field: 'locsIiiPLeft', type: 'number', min: 0.1, max: 5.9, step: 0.1 })
  ]));
  card.appendChild(grid('two-col', [
    textInput({
      label: 'Computed LOCS III severity — right', section: 'slitLamp', field: 'derivedSeverityRight', type: 'text', readonly: true
    }),
    textInput({
      label: 'Computed LOCS III severity — left', section: 'slitLamp', field: 'derivedSeverityLeft', type: 'text', readonly: true
    })
  ]));
  card.appendChild(subHead('Anterior segment'));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Cataract type — right', section: 'slitLamp', field: 'cataractTypeRight', options: OPTIONS.cataractType }),
    selectInput({ label: 'Cataract type — left', section: 'slitLamp', field: 'cataractTypeLeft', options: OPTIONS.cataractType })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Anterior chamber depth — right', section: 'slitLamp', field: 'anteriorChamberDepthRight', options: OPTIONS.anteriorChamberDepth }),
    selectInput({ label: 'Anterior chamber depth — left', section: 'slitLamp', field: 'anteriorChamberDepthLeft', options: OPTIONS.anteriorChamberDepth })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Corneal clarity — right', section: 'slitLamp', field: 'cornealClarityRight', options: OPTIONS.cornealClarity }),
    selectInput({ label: 'Corneal clarity — left', section: 'slitLamp', field: 'cornealClarityLeft', options: OPTIONS.cornealClarity })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Pupil reaction — right', section: 'slitLamp', field: 'pupilReactionRight', options: OPTIONS.pupilReaction }),
    selectInput({ label: 'Pupil reaction — left', section: 'slitLamp', field: 'pupilReactionLeft', options: OPTIONS.pupilReaction })
  ]));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Glare testing',
    description: 'A severe glare functional impact independently raises the surgical candidacy to indicated, even with a mild LOCS III grade.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'Glare acuity result — right', section: 'glare', field: 'glareAcuityResultRight' }),
    textInput({ label: 'Glare acuity result — left', section: 'glare', field: 'glareAcuityResultLeft' })
  ]));
  card.appendChild(selectInput({ label: 'Glare functional impact', section: 'glare', field: 'glareFunctionalImpact', options: SEVERITY_4 }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Tonometry',
    description: 'Intraocular pressure above 21 mmHg in either eye raises the raised-intraocular-pressure safety flag.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'Intraocular pressure — right', section: 'tonometry', field: 'intraocularPressureRightMmhg', type: 'number', min: 0, max: 80, step: 0.1, unit: 'mmHg' }),
    textInput({ label: 'Intraocular pressure — left', section: 'tonometry', field: 'intraocularPressureLeftMmhg', type: 'number', min: 0, max: 80, step: 0.1, unit: 'mmHg' })
  ]));
  card.appendChild(selectInput({ label: 'Tonometry method', section: 'tonometry', field: 'tonometryMethod', options: OPTIONS.tonometryMethod }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Dilated fundus examination',
    description: 'When the cataract obscures the view and a dilated exam is not performed, the view-obscured-fundus-not-assessed flag fires.'
  });
  card.appendChild(yesNo({ label: 'Dilated fundus exam performed', section: 'fundus', field: 'dilatedFundusExamPerformed' }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Cup:disc ratio — right', section: 'fundus', field: 'opticDiscCupDiscRatioRight', type: 'number', min: 0, max: 1, step: 0.05 }),
    textInput({ label: 'Cup:disc ratio — left', section: 'fundus', field: 'opticDiscCupDiscRatioLeft', type: 'number', min: 0, max: 1, step: 0.05 })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Macula findings — right', section: 'fundus', field: 'maculaFindingsRight', options: OPTIONS.maculaFindings }),
    selectInput({ label: 'Macula findings — left', section: 'fundus', field: 'maculaFindingsLeft', options: OPTIONS.maculaFindings })
  ]));
  card.appendChild(grid('two-col', [
    textArea({ label: 'Retinal findings — right', section: 'fundus', field: 'retinalFindingsRight', rows: 2 }),
    textArea({ label: 'Retinal findings — left', section: 'fundus', field: 'retinalFindingsLeft', rows: 2 })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'View obscured by cataract — right', section: 'fundus', field: 'viewObscuredByCataractRight' }),
    yesNo({ label: 'View obscured by cataract — left', section: 'fundus', field: 'viewObscuredByCataractLeft' })
  ]));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Differential and competing-pathology screen',
    description: 'Glaucoma, age-related macular degeneration, or diabetic retinopathy suspected here raises the high-priority competing-pathology-suspected flag and overrides the recommendation to urgent referral.'
  });
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Glaucoma suspected', section: 'differential', field: 'glaucomaSuspected' }),
    textInput({ label: 'Glaucoma notes', section: 'differential', field: 'glaucomaNotes' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Age-related macular degeneration suspected', section: 'differential', field: 'amdSuspected' }),
    textInput({ label: 'Age-related macular degeneration notes', section: 'differential', field: 'amdNotes' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Diabetic retinopathy suspected', section: 'differential', field: 'diabeticRetinopathySuspected' }),
    textInput({ label: 'Diabetic retinopathy notes', section: 'differential', field: 'diabeticRetinopathyNotes' })
  ]));
  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Biometry',
    description: 'Surgical planning measurements. When a surgical referral is recommended without biometry, the biometry-incomplete-for-surgical-planning flag fires.'
  });
  card.appendChild(yesNo({ label: 'Biometry performed', section: 'biometry', field: 'biometryPerformed' }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Axial length — right', section: 'biometry', field: 'axialLengthRightMm', type: 'number', min: 15, max: 40, step: 0.01, unit: 'mm' }),
    textInput({ label: 'Axial length — left', section: 'biometry', field: 'axialLengthLeftMm', type: 'number', min: 15, max: 40, step: 0.01, unit: 'mm' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Keratometry K1 — right', section: 'biometry', field: 'keratometryK1Right', type: 'number', step: 0.01, unit: 'D' }),
    textInput({ label: 'Keratometry K1 — left', section: 'biometry', field: 'keratometryK1Left', type: 'number', step: 0.01, unit: 'D' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Keratometry K2 — right', section: 'biometry', field: 'keratometryK2Right', type: 'number', step: 0.01, unit: 'D' }),
    textInput({ label: 'Keratometry K2 — left', section: 'biometry', field: 'keratometryK2Left', type: 'number', step: 0.01, unit: 'D' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'OCT performed', section: 'biometry', field: 'octPerformed' }),
    textArea({ label: 'OCT findings', section: 'biometry', field: 'octFindings', rows: 2 })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Calculated IOL power — right', section: 'biometry', field: 'calculatedIolPowerRight', type: 'number', step: 0.25, unit: 'D' }),
    textInput({ label: 'Calculated IOL power — left', section: 'biometry', field: 'calculatedIolPowerLeft', type: 'number', step: 0.25, unit: 'D' })
  ]));
  return card;
}

function renderStep13() {
  const card = sectionCard({
    stepNumber: 13,
    title: 'Functional and quality-of-life impact',
    description: 'A simple 0–4 self-report composite covering difficulty with reading, driving, and daily activities.'
  });
  card.appendChild(grid('three-col', [
    textInput({ label: 'Difficulty reading', section: 'functional', field: 'functionalDifficultyReading', type: 'number', min: 0, max: 4, unit: '0–4' }),
    textInput({ label: 'Difficulty driving', section: 'functional', field: 'functionalDifficultyDriving', type: 'number', min: 0, max: 4, unit: '0–4' }),
    textInput({ label: 'Difficulty with daily activities', section: 'functional', field: 'functionalDifficultyDailyActivities', type: 'number', min: 0, max: 4, unit: '0–4' })
  ]));
  card.appendChild(textInput({
    label: 'Computed functional impact score', section: 'functional', field: 'derivedFunctionalScore', type: 'text', readonly: true,
    hint: 'Sum of the three sub-scores, 0 to 12.'
  }));
  card.appendChild(textArea({ label: 'Functional impact notes', section: 'functional', field: 'functionalImpactNotes', rows: 2 }));
  return card;
}

function renderStep14() {
  const card = sectionCard({
    stepNumber: 14,
    title: 'Management plan',
    description: 'The recommended course of action and whether risks, benefits, and consent have been discussed.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Management recommendation', section: 'management', field: 'managementRecommendation', options: OPTIONS.managementRecommendation }),
    selectInput({ label: 'Eye(s) for surgery', section: 'management', field: 'eyeForSurgery', options: OPTIONS.eyeChoice })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Risks and benefits counselled', section: 'management', field: 'risksBenefitsCounselled' }),
    yesNo({ label: 'Consent discussed', section: 'management', field: 'consentDiscussed' })
  ]));
  card.appendChild(textArea({ label: 'Management notes', section: 'management', field: 'managementNotes', rows: 3 }));
  return card;
}

function renderStep15() {
  const card = sectionCard({
    stepNumber: 15,
    title: 'Summary and sign-off',
    description: 'The computed LOCS III severity band per eye and surgical-candidacy recommendation, an optional clinician override with a mandatory reason, notes, and electronic signature. Submit to compute the full report.'
  });

  card.appendChild(subHead('Live summary'));
  card.appendChild(note('Updates automatically as you complete steps 5, 7, 8, and 13. Safety flags and the full fired-rule audit trail are shown in the report after you submit.'));
  const summaryPanel = document.createElement('div');
  summaryPanel.id = 'live-summary';
  summaryPanel.className = 'axis-grid';
  card.appendChild(summaryPanel);

  card.appendChild(subHead('Clinician override'));
  card.appendChild(note(
    'The override changes the final surgical-candidacy recommendation only. Safety flags are computed independently and are always printed, so an override cannot hide a hazard.'
  ));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Override surgical candidacy', section: 'summary', field: 'overrideSurgicalCandidacy', options: OPTIONS.surgicalCandidacy }),
    textInput({ label: 'Override reason', section: 'summary', field: 'overrideReason', hint: 'Mandatory when the override differs from the computed value.' })
  ]));

  card.appendChild(subHead('Sign-off'));
  card.appendChild(textArea({ label: 'Clinician notes', section: 'summary', field: 'clinicianNotes', rows: 3 }));
  card.appendChild(textInput({
    label: 'Signed by (optometrist / ophthalmologist)', section: 'summary', field: 'signedByName', required: true,
    hint: 'The assessing clinician must sign before the report is final.'
  }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4, renderStep5,
  renderStep6, renderStep7, renderStep8, renderStep9, renderStep10,
  renderStep11, renderStep12, renderStep13, renderStep14, renderStep15
];

// ----------------------------------------------------------------------
// Derived read-only fields and the live summary panel
// ----------------------------------------------------------------------

function updateDerived() {
  const preview = calculateCataractEvaluation(state);

  const sevRightEl = document.getElementById('slitLamp-derivedSeverityRight');
  if (sevRightEl) sevRightEl.value = labelFor(LOCS_III_SEVERITY_LABELS, preview.locsIIISeverityRight);
  const sevLeftEl = document.getElementById('slitLamp-derivedSeverityLeft');
  if (sevLeftEl) sevLeftEl.value = labelFor(LOCS_III_SEVERITY_LABELS, preview.locsIIISeverityLeft);

  const funcEl = document.getElementById('functional-derivedFunctionalScore');
  if (funcEl) {
    funcEl.value = preview.functionalImpactScore === null
      ? '—'
      : `${preview.functionalImpactScore} of 12`;
  }

  const summaryPanel = document.getElementById('live-summary');
  if (summaryPanel) {
    summaryPanel.innerHTML = `
      <div class="axis-card">
        <span class="axis-name">LOCS III severity — right</span>
        <span class="axis-value"><span class="band-badge locs-${esc(preview.locsIIISeverityRight || 'none')}">${esc(labelFor(LOCS_III_SEVERITY_LABELS, preview.locsIIISeverityRight))}</span></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">LOCS III severity — left</span>
        <span class="axis-value"><span class="band-badge locs-${esc(preview.locsIIISeverityLeft || 'none')}">${esc(labelFor(LOCS_III_SEVERITY_LABELS, preview.locsIIISeverityLeft))}</span></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Computed surgical candidacy</span>
        <span class="axis-value"><span class="band-badge candidacy-${esc(preview.computedSurgicalCandidacy || 'not-indicated')}">${esc(labelFor(SURGICAL_CANDIDACY_LABELS, preview.computedSurgicalCandidacy))}</span></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Functional impact score</span>
        <span class="axis-value"><strong>${preview.functionalImpactScore === null ? '—' : preview.functionalImpactScore}</strong>${preview.functionalImpactScore === null ? '' : ' of 12'}</span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Fired rules</span>
        <span class="axis-value"><strong>${preview.firedRules.length}</strong></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Safety flags</span>
        <span class="axis-value"><strong>${preview.flags.length}</strong></span>
      </div>
    `;
  }
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  ['clinician', 'clinicianName'], ['clinician', 'role'], ['clinician', 'assessmentDate'],
  ['patient', 'firstName'], ['patient', 'lastName'], ['patient', 'birthDate'],
  ['symptoms', 'blurredVision'], ['symptoms', 'symptomDurationMonths'],
  ['history', 'historyDiabetes'], ['history', 'historyFamilyCataract'],
  ['acuity', 'bestCorrectedVaLogmarRight'], ['acuity', 'bestCorrectedVaLogmarLeft'],
  ['refraction', 'refractionStability'],
  ['slitLamp', 'locsIiiNoRight'], ['slitLamp', 'locsIiiNoLeft'], ['slitLamp', 'cataractTypeRight'],
  ['glare', 'glareFunctionalImpact'],
  ['tonometry', 'intraocularPressureRightMmhg'], ['tonometry', 'intraocularPressureLeftMmhg'],
  ['fundus', 'dilatedFundusExamPerformed'],
  ['differential', 'glaucomaSuspected'], ['differential', 'amdSuspected'], ['differential', 'diabeticRetinopathySuspected'],
  ['biometry', 'biometryPerformed'],
  ['functional', 'functionalDifficultyReading'],
  ['management', 'managementRecommendation'],
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
  { step: 1,  section: 'clinician',    title: 'Clinician' },
  { step: 2,  section: 'patient',      title: 'Patient' },
  { step: 3,  section: 'symptoms',     title: 'Symptoms' },
  { step: 4,  section: 'history',      title: 'History' },
  { step: 5,  section: 'acuity',       title: 'Acuity' },
  { step: 6,  section: 'refraction',   title: 'Refraction' },
  { step: 7,  section: 'slitLamp',     title: 'Slit lamp' },
  { step: 8,  section: 'glare',        title: 'Glare' },
  { step: 9,  section: 'tonometry',    title: 'Tonometry' },
  { step: 10, section: 'fundus',       title: 'Fundus' },
  { step: 11, section: 'differential', title: 'Differential' },
  { step: 12, section: 'biometry',     title: 'Biometry' },
  { step: 13, section: 'functional',   title: 'Function' },
  { step: 14, section: 'management',   title: 'Management' },
  { step: 15, section: 'summary',      title: 'Summary' }
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
  const override = state.summary.overrideSurgicalCandidacy;
  if (override && !String(state.summary.overrideReason || '').trim()) {
    const preview = calculateCataractEvaluation({
      ...state,
      summary: { ...state.summary, overrideSurgicalCandidacy: '' }
    });
    if (override !== preview.computedSurgicalCandidacy) {
      const id = 'summary-overrideReason';
      const message = 'An override reason is required when the final recommendation differs from the computed recommendation';
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

  const overrideBlock = r.finalSurgicalCandidacy !== r.computedSurgicalCandidacy
    ? `
      <div class="alert" data-type="warning" role="alert">
        <strong>Clinician override.</strong>
        Computed recommendation was <strong>${esc(labelFor(SURGICAL_CANDIDACY_LABELS, r.computedSurgicalCandidacy))}</strong>;
        the clinician recorded <strong>${esc(labelFor(SURGICAL_CANDIDACY_LABELS, r.finalSurgicalCandidacy))}</strong>.
        Reason: ${esc(r.overrideReason || 'not stated')}.
        Safety flags below are unaffected by the override.
      </div>
    `
    : '';

  out.innerHTML = `
    <h2>Cataract Diagnostic Evaluation Report</h2>
    <p class="muted">
      Generated ${esc(new Date(r.timestamp).toLocaleString())} ·
      ${esc(`${state.patient.firstName} ${state.patient.lastName}`.trim() || 'Patient not named')} ·
      Assessed by ${esc(state.clinician.clinicianName || '—')}
    </p>

    ${overrideBlock}

    <div class="recommendation-banner">
      <span class="band-badge locs-${esc(r.locsIIISeverityRight || 'none')}">Right: ${esc(labelFor(LOCS_III_SEVERITY_LABELS, r.locsIIISeverityRight))}</span>
      <span class="band-badge locs-${esc(r.locsIIISeverityLeft || 'none')}">Left: ${esc(labelFor(LOCS_III_SEVERITY_LABELS, r.locsIIISeverityLeft))}</span>
      <span class="band-badge candidacy-${esc(r.finalSurgicalCandidacy || 'not-indicated')}">${esc(labelFor(SURGICAL_CANDIDACY_LABELS, r.finalSurgicalCandidacy))}</span>
    </div>

    <h3>LOCS III severity</h3>
    <div class="axis-grid">
      <div class="axis-card">
        <span class="axis-name">Right eye</span>
        <span class="axis-value"><span class="band-badge locs-${esc(r.locsIIISeverityRight || 'none')}">${esc(labelFor(LOCS_III_SEVERITY_LABELS, r.locsIIISeverityRight))}</span></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Left eye</span>
        <span class="axis-value"><span class="band-badge locs-${esc(r.locsIIISeverityLeft || 'none')}">${esc(labelFor(LOCS_III_SEVERITY_LABELS, r.locsIIISeverityLeft))}</span></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Computed surgical candidacy</span>
        <span class="axis-value"><span class="band-badge candidacy-${esc(r.computedSurgicalCandidacy || 'not-indicated')}">${esc(labelFor(SURGICAL_CANDIDACY_LABELS, r.computedSurgicalCandidacy))}</span></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Final surgical candidacy</span>
        <span class="axis-value"><span class="band-badge candidacy-${esc(r.finalSurgicalCandidacy || 'not-indicated')}">${esc(labelFor(SURGICAL_CANDIDACY_LABELS, r.finalSurgicalCandidacy))}</span></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Functional impact score</span>
        <span class="axis-value"><strong>${r.functionalImpactScore === null ? '—' : r.functionalImpactScore}</strong>${r.functionalImpactScore === null ? '' : ' of 12'}</span>
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
  a.download = 'cataract-diagnostic-evaluation.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const result = calculateCataractEvaluation(state);
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
