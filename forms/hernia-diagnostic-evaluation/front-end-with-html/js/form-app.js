import { calculateHerniaEvaluation, URGENCY_LABELS, RECOMMENDATION_LABELS } from './composite-grader.js';
import { createDefaultAssessment } from './types.js';
import { labelFor, titleCase } from './utils.js';

// Hernia Diagnostic Evaluation — clinician wizard (vanilla JS, native ES
// modules).
//
// Single-page continuous wizard: all 14 steps are rendered into the page in
// document order. The user scrolls through them; the top-of-page progress
// summary reflects how many tracked fields have been answered. Submission
// runs the pure grading engine (js/composite-grader.js) and renders an
// inline report. State is persisted to localStorage so a partial fill
// survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'hernia-diagnostic-evaluation.front-end-with-html.v1';
const TOTAL_STEPS = 14;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = createDefaultAssessment();

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
    if (!raw) return createDefaultAssessment();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse the saved evaluation; starting fresh.', e);
    return createDefaultAssessment();
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
/** @type {ReturnType<typeof calculateHerniaEvaluation> & {timestamp:string} | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'hernia-diagnostic-evaluation',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateConditionalSections();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateConditionalSections();
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
  if (opts.conditional) wrapper.setAttribute('data-conditional', opts.conditional);
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    ${opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : ''}
    <span class="error-message" id="${id}-error"></span>
  `;

  const input = wrapper.querySelector('input');
  input.setAttribute('aria-describedby', `${id}-error`);
  input.addEventListener('input', () => {
    let v = input.value;
    if (type === 'number') v = v === '' ? null : Number(v);
    setField(opts.section, opts.field, v);
    clearFieldError(id);
  });
  return wrapper;
}

function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] ?? '';
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  if (opts.conditional) wrapper.setAttribute('data-conditional', opts.conditional);
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
  if (opts.conditional) wrapper.setAttribute('data-conditional', opts.conditional);

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
  if (opts.conditional) wrapper.setAttribute('data-conditional', opts.conditional);
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
  if (opts.variant) card.setAttribute('data-variant', opts.variant);
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

function note(text, type) {
  const p = document.createElement('div');
  p.className = 'alert';
  p.setAttribute('role', 'note');
  p.setAttribute('data-type', type || 'info');
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
    { value: 'general-practitioner', label: 'General practitioner' },
    { value: 'surgical-registrar', label: 'Surgical registrar' },
    { value: 'general-surgeon', label: 'General surgeon' },
    { value: 'nurse-practitioner', label: 'Nurse practitioner' },
    { value: 'other', label: 'Other' }
  ],
  registrationBody: [
    { value: 'GMC', label: 'GMC' },
    { value: 'NMC', label: 'NMC' },
    { value: 'other', label: 'Other' }
  ],
  sex: [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'intersex', label: 'Intersex' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ],
  durationOfBulge: [
    { value: 'less-than-1-week', label: 'Less than 1 week' },
    { value: '1-4-weeks', label: '1 to 4 weeks' },
    { value: '1-6-months', label: '1 to 6 months' },
    { value: '6-12-months', label: '6 to 12 months' },
    { value: 'more-than-1-year', label: 'More than 1 year' }
  ],
  painOnset: [
    { value: 'sudden', label: 'Sudden' },
    { value: 'gradual', label: 'Gradual' }
  ],
  priorHerniaRepairMesh: [
    { value: 'mesh', label: 'Mesh' },
    { value: 'no-mesh', label: 'No mesh' },
    { value: 'unknown', label: 'Unknown' }
  ],
  inspectionLocation: [
    { value: 'groin', label: 'Groin' },
    { value: 'umbilical', label: 'Umbilical' },
    { value: 'epigastric', label: 'Epigastric' },
    { value: 'incisional', label: 'Incisional' },
    { value: 'femoral', label: 'Femoral' },
    { value: 'other', label: 'Other' }
  ],
  skinChanges: [
    { value: 'none', label: 'None' },
    { value: 'erythema', label: 'Erythema' },
    { value: 'discolouration', label: 'Discolouration' },
    { value: 'both', label: 'Both' }
  ],
  reducibilityStatus: [
    { value: 'reducible', label: 'Reducible' },
    { value: 'irreducible', label: 'Irreducible' },
    { value: 'incarcerated', label: 'Incarcerated' }
  ],
  herniaType: [
    { value: 'inguinal', label: 'Inguinal' },
    { value: 'femoral', label: 'Femoral' },
    { value: 'umbilical', label: 'Umbilical' },
    { value: 'epigastric', label: 'Epigastric' },
    { value: 'incisional', label: 'Incisional' },
    { value: 'paraumbilical', label: 'Paraumbilical' },
    { value: 'spigelian', label: 'Spigelian' },
    { value: 'other', label: 'Other' }
  ],
  inguinalSubtype: [
    { value: 'direct', label: 'Direct' },
    { value: 'indirect', label: 'Indirect' },
    { value: 'pantaloon', label: 'Pantaloon' },
    { value: 'uncertain', label: 'Uncertain' }
  ],
  laterality: [
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'bilateral', label: 'Bilateral' }
  ],
  ehsSizeGrade: [
    { value: '1', label: 'Grade 1 (< 2 cm)' },
    { value: '2', label: 'Grade 2 (2–4 cm)' },
    { value: '3', label: 'Grade 3 (> 4 cm)' }
  ],
  imagingFindings: [
    { value: 'confirms-hernia', label: 'Confirms hernia' },
    { value: 'no-hernia', label: 'No hernia seen' },
    { value: 'inconclusive', label: 'Inconclusive' }
  ],
  imagingIndication: [
    { value: 'atypical-presentation', label: 'Atypical presentation' },
    { value: 'occult-suspicion', label: 'Occult-hernia suspicion' },
    { value: 'inconclusive-exam', label: 'Inconclusive examination' },
    { value: 'pre-op-planning', label: 'Pre-operative planning' },
    { value: 'not-indicated', label: 'Not indicated' }
  ],
  managementPlan: [
    { value: 'watchful-waiting', label: 'Watchful waiting' },
    { value: 'elective-repair-referral', label: 'Elective repair referral' },
    { value: 'urgent-referral', label: 'Urgent referral' },
    { value: 'emergency-referral', label: 'Emergency referral' },
    { value: 'conservative', label: 'Conservative' }
  ],
  referralTargetTimeframe: [
    { value: 'same-day', label: 'Same day' },
    { value: 'immediate', label: 'Immediate' },
    { value: 'within-2-weeks', label: 'Within 2 weeks' },
    { value: 'within-6-weeks', label: 'Within 6 weeks' },
    { value: 'within-18-weeks', label: 'Within 18 weeks' }
  ],
  urgencyBand: [
    { value: 'routine', label: 'Routine' },
    { value: 'soon', label: 'Soon (elective referral)' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'emergency', label: 'Emergency' }
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
      hint: 'Used for the paediatric safety flag (under 16 years).'
    }),
    selectInput({ label: 'Sex', section: 'patient', field: 'sex', options: OPTIONS.sex })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'NHS number', section: 'patient', field: 'nhsNumber', placeholder: 'NNN NNN NNNN' }),
    textInput({ label: 'Email', section: 'patient', field: 'email', type: 'email' })
  ]));
  card.appendChild(textInput({ label: 'Phone', section: 'patient', field: 'phone', type: 'tel' }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Presenting complaint and history',
    description: 'How long the bulge has been present, pain, aggravating factors, and any prior hernia repair.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Duration of bulge', section: 'history', field: 'durationOfBulge', options: OPTIONS.durationOfBulge }),
    selectInput({ label: 'Pain onset', section: 'history', field: 'painOnset', options: OPTIONS.painOnset, hint: 'A sudden onset is more suggestive of incarceration or strangulation.' })
  ]));
  card.appendChild(textInput({ label: 'Pain score', section: 'history', field: 'painScore0To10', type: 'number', min: 0, max: 10, unit: '0–10', hint: 'A score above 4 contributes to the soon urgency band.' }));
  card.appendChild(subHead('Aggravating factors'));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Aggravated by straining', section: 'history', field: 'aggravatedByStraining' }),
    yesNo({ label: 'Aggravated by lifting', section: 'history', field: 'aggravatedByLifting' }),
    yesNo({ label: 'Aggravated by coughing', section: 'history', field: 'aggravatedByCoughing' })
  ]));
  card.appendChild(subHead('Prior hernia history'));
  card.appendChild(yesNo({ label: 'Prior hernia history', section: 'history', field: 'priorHerniaHistory' }));
  card.appendChild(yesNo({ label: 'Prior hernia repair', section: 'history', field: 'priorHerniaRepair' }));
  card.appendChild(grid('two-col', [
    selectInput({
      label: 'Mesh used', section: 'history', field: 'priorHerniaRepairMesh', options: OPTIONS.priorHerniaRepairMesh,
      conditional: 'history.priorHerniaRepair=yes'
    }),
    textInput({
      label: 'Prior repair site and date', section: 'history', field: 'priorHerniaRepairSite',
      placeholder: 'For example, right inguinal, 2019',
      hint: 'A prior repair at the same site raises the recurrent-hernia safety flag.',
      conditional: 'history.priorHerniaRepair=yes'
    })
  ]));
  card.appendChild(textArea({ label: 'History notes', section: 'history', field: 'historyNotes', rows: 2 }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Risk factors',
    description: 'Recognised risk factors for hernia development and recurrence.'
  });
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Chronic cough', section: 'riskFactors', field: 'riskChronicCough' }),
    yesNo({ label: 'Constipation or straining', section: 'riskFactors', field: 'riskConstipationOrStraining' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Heavy-lifting occupation', section: 'riskFactors', field: 'riskHeavyLiftingOccupation' }),
    yesNo({ label: 'Obesity', section: 'riskFactors', field: 'riskObesity' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Smoking', section: 'riskFactors', field: 'riskSmoking' }),
    yesNo({ label: 'Family history of hernia', section: 'riskFactors', field: 'riskFamilyHistory' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Prior abdominal surgery', section: 'riskFactors', field: 'riskPriorAbdominalSurgery' }),
    yesNo({ label: 'Pregnancy', section: 'riskFactors', field: 'riskPregnancy' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Connective-tissue disorder', section: 'riskFactors', field: 'riskConnectiveTissueDisorder' }),
    yesNo({ label: 'Ascites', section: 'riskFactors', field: 'riskAscites' })
  ]));
  card.appendChild(textArea({ label: 'Risk factor notes', section: 'riskFactors', field: 'riskFactorsNotes', rows: 2 }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Visual inspection',
    description: 'Location, visibility at rest, dynamic behaviour on standing or straining, and skin changes.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Location', section: 'inspection', field: 'inspectionLocation', options: OPTIONS.inspectionLocation }),
    textInput({
      label: 'Location detail', section: 'inspection', field: 'inspectionLocationOther',
      conditional: 'inspection.inspectionLocation=other'
    })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Bulge visible at rest', section: 'inspection', field: 'bulgeVisibleAtRest' }),
    yesNo({
      label: 'Bulge enlarges on standing or straining', section: 'inspection', field: 'bulgeEnlargesOnStandingOrStraining',
      hint: 'The classic dynamic sign of a hernia.'
    })
  ]));
  card.appendChild(selectInput({
    label: 'Skin changes', section: 'inspection', field: 'skinChanges', options: OPTIONS.skinChanges,
    hint: 'Erythema or discolouration is also screened as a red flag in step 8.'
  }));
  card.appendChild(textArea({ label: 'Inspection notes', section: 'inspection', field: 'inspectionNotes', rows: 2 }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Palpation and cough impulse',
    description: 'Palpable mass, cough impulse, tenderness, and size on palpation.'
  });
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Palpable mass', section: 'palpation', field: 'palpableMass' }),
    yesNo({
      label: 'Cough impulse positive', section: 'palpation', field: 'coughImpulsePositive',
      hint: 'A positive expansile cough impulse is the clinical sign of a hernia.'
    }),
    yesNo({ label: 'Tenderness', section: 'palpation', field: 'tenderness', hint: 'Tenderness raises concern for incarceration or strangulation.' })
  ]));
  card.appendChild(textInput({
    label: 'Size on palpation', section: 'palpation', field: 'massSizeAsCm', type: 'number', min: 0, max: 40, step: 0.1, unit: 'cm',
    hint: 'Contributes to the European Hernia Society size grade recorded on step 9.'
  }));
  card.appendChild(textArea({ label: 'Palpation notes', section: 'palpation', field: 'palpationNotes', rows: 2 }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Reducibility assessment',
    description: 'Clinician judgement of reducibility — the primary driver of the urgency band alongside step 8.'
  });
  card.appendChild(selectInput({
    label: 'Reducibility status', section: 'reducibility', field: 'reducibilityStatus', options: OPTIONS.reducibilityStatus,
    hint: 'Irreducible or incarcerated (with no red flags) scores urgent; incarcerated with a red flag scores emergency.'
  }));
  card.appendChild(subHead('How it reduces'));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Reduces spontaneously', section: 'reducibility', field: 'reducesSpontaneously' }),
    yesNo({ label: 'Reduces with manual pressure', section: 'reducibility', field: 'reducesWithManualPressure' }),
    yesNo({ label: 'Does not reduce', section: 'reducibility', field: 'doesNotReduce' })
  ]));
  card.appendChild(textArea({ label: 'Reducibility notes', section: 'reducibility', field: 'reducibilityNotes', rows: 2 }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Red-flag / emergency symptom screen',
    description: 'Any single positive answer here forces the computed urgency band to emergency, regardless of every other finding.',
    variant: 'danger'
  });
  card.appendChild(note(
    'This step is a self-contained safety screen. Any positive answer below forces emergency urgency and requires same-day clinical escalation, regardless of what the rest of the examination shows.',
    'error'
  ));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Severe pain out of proportion to examination', section: 'redFlags', field: 'redFlagSeverePain' }),
    yesNo({ label: 'Vomiting', section: 'redFlags', field: 'redFlagVomiting' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Fever', section: 'redFlags', field: 'redFlagFever' }),
    yesNo({ label: 'Absolute constipation, no passage of flatus', section: 'redFlags', field: 'redFlagAbsoluteConstipation' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Erythema or discolouration over the hernia', section: 'redFlags', field: 'redFlagErythemaOrDiscolouration' }),
    yesNo({ label: 'Previously reducible hernia now irreducible', section: 'redFlags', field: 'redFlagPreviouslyReducibleNowIrreducible' })
  ]));
  card.appendChild(yesNo({ label: 'Tachycardia', section: 'redFlags', field: 'redFlagTachycardia' }));
  card.appendChild(textArea({ label: 'Red-flag notes', section: 'redFlags', field: 'redFlagNotes', rows: 2 }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Clinical classification',
    description: 'Hernia type, European Hernia Society subtype and size grade, and laterality.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Hernia type', section: 'classification', field: 'herniaType', options: OPTIONS.herniaType }),
    textInput({
      label: 'Hernia type detail', section: 'classification', field: 'herniaTypeOther',
      conditional: 'classification.herniaType=other'
    })
  ]));
  card.appendChild(selectInput({
    label: 'Inguinal subtype', section: 'classification', field: 'inguinalSubtype', options: OPTIONS.inguinalSubtype,
    conditional: 'classification.herniaType=inguinal'
  }));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Laterality', section: 'classification', field: 'laterality', options: OPTIONS.laterality }),
    selectInput({
      label: 'European Hernia Society size grade', section: 'classification', field: 'ehsSizeGrade', options: OPTIONS.ehsSizeGrade,
      hint: 'Grade 3 (> 4cm) contributes to the soon urgency band.'
    })
  ]));
  card.appendChild(textArea({ label: 'Classification notes', section: 'classification', field: 'classificationNotes', rows: 2 }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Imaging',
    description: 'Ultrasound, CT, and MRI, and why imaging was requested.'
  });
  card.appendChild(subHead('Ultrasound'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Ultrasound performed', section: 'imaging', field: 'ultrasoundPerformed' }),
    selectInput({
      label: 'Ultrasound findings', section: 'imaging', field: 'ultrasoundFindings', options: OPTIONS.imagingFindings,
      conditional: 'imaging.ultrasoundPerformed=yes'
    })
  ]));
  card.appendChild(subHead('CT'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'CT performed', section: 'imaging', field: 'ctPerformed' }),
    selectInput({
      label: 'CT findings', section: 'imaging', field: 'ctFindings', options: OPTIONS.imagingFindings,
      conditional: 'imaging.ctPerformed=yes'
    })
  ]));
  card.appendChild(subHead('MRI'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'MRI performed', section: 'imaging', field: 'mriPerformed' }),
    selectInput({
      label: 'MRI findings', section: 'imaging', field: 'mriFindings', options: OPTIONS.imagingFindings,
      conditional: 'imaging.mriPerformed=yes'
    })
  ]));
  card.appendChild(selectInput({ label: 'Imaging indication', section: 'imaging', field: 'imagingIndication', options: OPTIONS.imagingIndication }));
  card.appendChild(textArea({ label: 'Imaging notes', section: 'imaging', field: 'imagingNotes', rows: 2 }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Differential diagnosis',
    description: 'Conditions considered and excluded before settling on a hernia diagnosis.'
  });
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Lipoma', section: 'differential', field: 'differentialLipoma' }),
    yesNo({ label: 'Lymphadenopathy', section: 'differential', field: 'differentialLymphadenopathy' }),
    yesNo({ label: 'Hydrocele', section: 'differential', field: 'differentialHydrocele' })
  ]));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Undescended testis', section: 'differential', field: 'differentialUndescendedTestis' }),
    yesNo({ label: 'Femoral aneurysm', section: 'differential', field: 'differentialFemoralAneurysm' }),
    yesNo({ label: 'Abscess', section: 'differential', field: 'differentialAbscess' })
  ]));
  card.appendChild(textInput({ label: 'Other differential considered', section: 'differential', field: 'differentialOther' }));
  card.appendChild(textArea({ label: 'Differential notes', section: 'differential', field: 'differentialNotes', rows: 2 }));
  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Functional impact',
    description: 'How much the hernia interferes with work, activity, and daily function.'
  });
  card.appendChild(yesNo({ label: 'Pain interferes with work or activity', section: 'functionalImpact', field: 'painInterferesWithWorkOrActivity' }));
  card.appendChild(textInput({
    label: 'Functional impact scale', section: 'functionalImpact', field: 'functionalImpactScale0To10',
    type: 'number', min: 0, max: 10, unit: '0–10'
  }));
  card.appendChild(textArea({ label: 'Activity limitation', section: 'functionalImpact', field: 'activityLimitation', rows: 2, placeholder: 'Activities the hernia limits.' }));
  return card;
}

function renderStep13() {
  const card = sectionCard({
    stepNumber: 13,
    title: 'Management plan',
    description: 'The planned management and any referral.'
  });
  card.appendChild(selectInput({ label: 'Management plan', section: 'management', field: 'managementPlan', options: OPTIONS.managementPlan }));
  card.appendChild(textInput({
    label: 'Conservative management detail', section: 'management', field: 'conservativeDetail',
    placeholder: 'For example, a truss or lifestyle advice',
    conditional: 'management.managementPlan=conservative'
  }));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Referral made', section: 'management', field: 'referralMade' }),
    selectInput({
      label: 'Referral target timeframe', section: 'management', field: 'referralTargetTimeframe', options: OPTIONS.referralTargetTimeframe,
      conditional: 'management.referralMade=yes'
    })
  ]));
  card.appendChild(textArea({ label: 'Management notes', section: 'management', field: 'managementNotes', rows: 2 }));
  return card;
}

function renderStep14() {
  const card = sectionCard({
    stepNumber: 14,
    title: 'Summary and sign-off',
    description: 'The computed classification and urgency band, safety flags, an optional clinician override, and the electronic signature. Submit to compute the report.'
  });
  card.appendChild(note(
    'The override changes the urgency band only. Safety flags are computed independently and are always printed, so an override cannot hide a hazard.'
  ));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Override urgency', section: 'summary', field: 'overrideUrgency', options: OPTIONS.urgencyBand }),
    textInput({ label: 'Override reason', section: 'summary', field: 'overrideReason', hint: 'Mandatory when the override differs from the computed urgency band.' })
  ]));
  card.appendChild(textArea({ label: 'Additional notes', section: 'summary', field: 'additionalNotes', rows: 3 }));
  card.appendChild(textInput({
    label: 'Signed by (clinician)', section: 'summary', field: 'signedByName', required: true,
    hint: 'The examining clinician must sign before the report is final.'
  }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7, renderStep8,
  renderStep9, renderStep10, renderStep11, renderStep12,
  renderStep13, renderStep14
];

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = String(state[section]?.[field] ?? '');
    host.style.display = current === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  ['clinician', 'clinicianName'], ['clinician', 'role'], ['clinician', 'assessmentDate'],
  ['patient', 'firstName'], ['patient', 'lastName'], ['patient', 'birthDate'],
  ['history', 'durationOfBulge'], ['history', 'painScore0To10'],
  ['riskFactors', 'riskChronicCough'], ['riskFactors', 'riskObesity'],
  ['inspection', 'inspectionLocation'], ['inspection', 'bulgeVisibleAtRest'],
  ['palpation', 'palpableMass'], ['palpation', 'coughImpulsePositive'],
  ['reducibility', 'reducibilityStatus'],
  ['redFlags', 'redFlagSeverePain'], ['redFlags', 'redFlagVomiting'], ['redFlags', 'redFlagFever'],
  ['classification', 'herniaType'], ['classification', 'ehsSizeGrade'],
  ['imaging', 'imagingIndication'],
  ['differential', 'differentialLipoma'],
  ['functionalImpact', 'painInterferesWithWorkOrActivity'],
  ['management', 'managementPlan'],
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
  { step: 1,  section: 'clinician',        title: 'Clinician' },
  { step: 2,  section: 'patient',          title: 'Patient' },
  { step: 3,  section: 'history',          title: 'History' },
  { step: 4,  section: 'riskFactors',      title: 'Risk factors' },
  { step: 5,  section: 'inspection',       title: 'Inspection' },
  { step: 6,  section: 'palpation',        title: 'Palpation' },
  { step: 7,  section: 'reducibility',     title: 'Reducibility' },
  { step: 8,  section: 'redFlags',         title: 'Red flags' },
  { step: 9,  section: 'classification',   title: 'Classification' },
  { step: 10, section: 'imaging',          title: 'Imaging' },
  { step: 11, section: 'differential',     title: 'Differential' },
  { step: 12, section: 'functionalImpact', title: 'Function' },
  { step: 13, section: 'management',       title: 'Management' },
  { step: 14, section: 'summary',          title: 'Summary' }
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
  const override = state.summary.overrideUrgency;
  if (override) {
    const preview = calculateHerniaEvaluation({
      ...state,
      summary: { ...state.summary, overrideUrgency: '' }
    });
    if (override !== preview.computedUrgency && !String(state.summary.overrideReason || '').trim()) {
      const id = 'summary-overrideReason';
      const message = 'An override reason is required when the final urgency differs from the computed urgency';
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

  const overrideBlock = r.finalUrgency !== r.computedUrgency
    ? `
      <div class="alert" data-type="warning" role="alert">
        <strong>Clinician override.</strong>
        Computed urgency was <strong>${esc(labelFor(URGENCY_LABELS, r.computedUrgency))}</strong>;
        the clinician recorded <strong>${esc(labelFor(URGENCY_LABELS, r.finalUrgency))}</strong>.
        Reason: ${esc(r.overrideReason || 'not stated')}.
        Safety flags below are unaffected by the override.
      </div>
    `
    : '';

  const redFlagBlock = r.anyRedFlag
    ? `
      <div class="alert" data-type="error" role="alert">
        <strong>Red-flag screen positive.</strong>
        This evaluation requires same-day clinical escalation regardless of the recorded management plan.
      </div>
    `
    : '';

  out.innerHTML = `
    <h2>Hernia Diagnostic Evaluation Report</h2>
    <p class="muted">
      Generated ${esc(new Date(r.timestamp).toLocaleString())} ·
      ${esc(`${state.patient.firstName} ${state.patient.lastName}`.trim() || 'Patient not named')} ·
      Assessed by ${esc(state.clinician.clinicianName || '—')}
    </p>

    ${redFlagBlock}
    ${overrideBlock}

    <div class="recommendation-banner">
      <span class="band-badge band-${esc(r.finalUrgency)}">${esc(labelFor(URGENCY_LABELS, r.finalUrgency))}</span>
      <span class="band-badge rec-${esc(r.recommendation)}">${esc(labelFor(RECOMMENDATION_LABELS, r.recommendation))}</span>
    </div>

    <h3>Classification</h3>
    <div class="axis-grid">
      <div class="axis-card">
        <span class="axis-name">Hernia type</span>
        <span class="axis-value"><strong>${esc(titleCase(r.herniaType) || '—')}</strong></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">EHS subtype</span>
        <span class="axis-value"><strong>${esc(titleCase(r.herniaSubtype) || '—')}</strong></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">EHS classification</span>
        <span class="axis-value">${esc(r.ehsClassification || '—')}</span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Reducibility</span>
        <span class="axis-value"><strong>${esc(titleCase(r.reducibilityStatus) || '—')}</strong></span>
      </div>
    </div>

    <h3>Urgency</h3>
    <div class="axis-grid">
      <div class="axis-card">
        <span class="axis-name">Computed urgency</span>
        <span class="axis-value"><span class="band-badge band-${esc(r.computedUrgency)}">${esc(labelFor(URGENCY_LABELS, r.computedUrgency))}</span></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Final urgency</span>
        <span class="axis-value"><span class="band-badge band-${esc(r.finalUrgency)}">${esc(labelFor(URGENCY_LABELS, r.finalUrgency))}</span></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Any red flag positive</span>
        <span class="axis-value"><strong>${r.anyRedFlag ? 'Yes' : 'No'}</strong></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Recommendation</span>
        <span class="axis-value"><span class="band-badge rec-${esc(r.recommendation)}">${esc(labelFor(RECOMMENDATION_LABELS, r.recommendation))}</span></span>
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
  a.download = 'hernia-diagnostic-evaluation.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const result = calculateHerniaEvaluation(state);
  lastResult = { ...result, timestamp: new Date().toISOString() };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh evaluation?')) return;
  clearState();
  state = createDefaultAssessment();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateConditionalSections();
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
  updateConditionalSections();
  updateProgress();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
