import { calculateNutritionRisk } from './composite-grader.js';
import {
  COMPOSITE_RISK_LABELS,
  GLIM_DIAGNOSIS_LABELS,
  MUST_RISK_LABELS,
  RECOMMENDATION_LABELS,
  emptyAssessment,
  labelFor
} from './types.js';

// Dietetic Assessment — dietitian wizard (vanilla JS, native ES modules).
//
// Single-page continuous wizard: all 16 sections are rendered into the page in
// document order. The user scrolls through them; the top-of-page progress
// summary reflects how many tracked fields have been answered. Submission runs
// the pure grading engine and renders an inline dietetic report. State is
// persisted to localStorage so a partial fill survives a page reload — which
// matters here, because an initial dietetic appointment runs 45 to 60 minutes.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'dietic-assessment.front-end-with-html.v1';
const TOTAL_STEPS = 16;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyAssessment();

  // Merge stored values over a fresh shape so fields added in a later
  // version do not orphan an existing draft.
  for (const key of Object.keys(fresh)) {
    const v = parsed && parsed[key];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      fresh[key] = { ...fresh[key], ...v };
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
    console.warn('Could not parse the saved assessment; starting fresh.', e);
    return emptyAssessment();
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save the assessment to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear the stored assessment.', e);
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
/** @type {ReturnType<typeof calculateNutritionRisk> & {timestamp:string} | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'dietic-assessment',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the dietetic report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateDerived();
    updateProgress();
    updateConditionalSections();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateDerived();
  updateProgress();
  updateConditionalSections();
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
    { value: 'dietitian', label: 'Dietitian' },
    { value: 'specialist-dietitian', label: 'Specialist dietitian' },
    { value: 'dietetic-assistant', label: 'Dietetic assistant' },
    { value: 'assistant-practitioner', label: 'Assistant practitioner' },
    { value: 'dietetic-student', label: 'Dietetic student' },
    { value: 'nutrition-nurse', label: 'Nutrition nurse' },
    { value: 'nutritionist', label: 'Nutritionist' },
    { value: 'other', label: 'Other' }
  ],
  specialty: [
    { value: 'general', label: 'General' },
    { value: 'acute', label: 'Acute' },
    { value: 'community', label: 'Community' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'renal', label: 'Renal' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'gastroenterology', label: 'Gastroenterology' },
    { value: 'paediatrics', label: 'Paediatrics' },
    { value: 'critical-care', label: 'Critical care' },
    { value: 'home-enteral-feeding', label: 'Home enteral feeding' },
    { value: 'bariatric', label: 'Bariatric' },
    { value: 'eating-disorders', label: 'Eating disorders' },
    { value: 'inherited-metabolic', label: 'Inherited metabolic' },
    { value: 'other', label: 'Other' }
  ],
  registrationBody: [
    { value: 'HCPC', label: 'HCPC' },
    { value: 'NMC', label: 'NMC' },
    { value: 'GMC', label: 'GMC' },
    { value: 'AfN', label: 'AfN' },
    { value: 'other', label: 'Other' }
  ],
  setting: [
    { value: 'outpatient-clinic', label: 'Outpatient clinic' },
    { value: 'inpatient-ward', label: 'Inpatient ward' },
    { value: 'community', label: 'Community' },
    { value: 'home-visit', label: 'Home visit' },
    { value: 'general-practice', label: 'General practice' },
    { value: 'care-home', label: 'Care home' },
    { value: 'telephone', label: 'Telephone' },
    { value: 'video', label: 'Video' }
  ],
  appointmentType: [
    { value: 'initial', label: 'Initial (45–60 minutes)' },
    { value: 'review', label: 'Review' },
    { value: 'specialist-programme', label: 'Specialist programme (up to 90 minutes)' },
    { value: 'discharge', label: 'Discharge' }
  ],
  sex: [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'intersex', label: 'Intersex' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ],
  referralSource: [
    { value: 'general-practitioner', label: 'General practitioner' },
    { value: 'hospital-consultant', label: 'Hospital consultant' },
    { value: 'ward-team', label: 'Ward team' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'self-referral', label: 'Self-referral' },
    { value: 'care-home', label: 'Care home' },
    { value: 'social-care', label: 'Social care' },
    { value: 'speech-and-language-therapy', label: 'Speech and language therapy' },
    { value: 'other', label: 'Other' }
  ],
  diabetes: [
    { value: 'none', label: 'None' },
    { value: 'type-1', label: 'Type 1' },
    { value: 'type-2', label: 'Type 2' },
    { value: 'gestational', label: 'Gestational' },
    { value: 'other', label: 'Other' }
  ],
  gastrointestinalSurgery: [
    { value: 'none', label: 'None' },
    { value: 'bariatric', label: 'Bariatric' },
    { value: 'bowel-resection', label: 'Bowel resection' },
    { value: 'gastrectomy', label: 'Gastrectomy' },
    { value: 'oesophagectomy', label: 'Oesophagectomy' },
    { value: 'whipple', label: 'Whipple' },
    { value: 'stoma-formation', label: 'Stoma formation' },
    { value: 'other', label: 'Other' }
  ],
  pregnancyStatus: [
    { value: 'not-applicable', label: 'Not applicable' },
    { value: 'not-pregnant', label: 'Not pregnant' },
    { value: 'pregnant', label: 'Pregnant' },
    { value: 'breastfeeding', label: 'Breastfeeding' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ],
  enteralRoute: [
    { value: 'nasogastric', label: 'Nasogastric' },
    { value: 'nasojejunal', label: 'Nasojejunal' },
    { value: 'gastrostomy', label: 'Gastrostomy' },
    { value: 'jejunostomy', label: 'Jejunostomy' },
    { value: 'other', label: 'Other' }
  ],
  adherence: [
    { value: 'full', label: 'Full' },
    { value: 'partial', label: 'Partial' },
    { value: 'none', label: 'None' },
    { value: 'unknown', label: 'Unknown' }
  ],
  measurementMethod: [
    { value: 'measured', label: 'Measured' },
    { value: 'self-reported', label: 'Self-reported' },
    { value: 'estimated', label: 'Estimated' },
    { value: 'declined', label: 'Declined by the patient' }
  ],
  weightTrend: [
    { value: 'losing', label: 'Losing' },
    { value: 'stable', label: 'Stable' },
    { value: 'gaining', label: 'Gaining' },
    { value: 'fluctuating', label: 'Fluctuating' },
    { value: 'unknown', label: 'Unknown' }
  ],
  dentition: [
    { value: 'good', label: 'Good' },
    { value: 'some-missing', label: 'Some teeth missing' },
    { value: 'edentulous', label: 'Edentulous' },
    { value: 'dentures-fitting', label: 'Dentures, well fitting' },
    { value: 'dentures-loose', label: 'Dentures, loose' }
  ],
  chewingAbility: [
    { value: 'normal', label: 'Normal' },
    { value: 'reduced', label: 'Reduced' },
    { value: 'unable', label: 'Unable' }
  ],
  goodFairPoor: [
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ],
  tongueAndMucosa: [
    { value: 'normal', label: 'Normal' },
    { value: 'glossitis', label: 'Glossitis' },
    { value: 'stomatitis', label: 'Stomatitis' },
    { value: 'angular-cheilitis', label: 'Angular cheilitis' },
    { value: 'oral-thrush', label: 'Oral thrush' },
    { value: 'dry', label: 'Dry' },
    { value: 'other', label: 'Other' }
  ],
  skinCondition: [
    { value: 'normal', label: 'Normal' },
    { value: 'dry', label: 'Dry' },
    { value: 'flaky', label: 'Flaky' },
    { value: 'poor-wound-healing', label: 'Poor wound healing' },
    { value: 'bruising', label: 'Bruising' },
    { value: 'other', label: 'Other' }
  ],
  hairCondition: [
    { value: 'normal', label: 'Normal' },
    { value: 'thin', label: 'Thin' },
    { value: 'brittle', label: 'Brittle' },
    { value: 'easily-plucked', label: 'Easily plucked' },
    { value: 'other', label: 'Other' }
  ],
  nailCondition: [
    { value: 'normal', label: 'Normal' },
    { value: 'brittle', label: 'Brittle' },
    { value: 'spoon-shaped', label: 'Spoon-shaped' },
    { value: 'ridged', label: 'Ridged' },
    { value: 'other', label: 'Other' }
  ],
  pressureUlcerCategory: [
    { value: '1', label: 'Category 1' },
    { value: '2', label: 'Category 2' },
    { value: '3', label: 'Category 3' },
    { value: '4', label: 'Category 4' },
    { value: 'unstageable', label: 'Unstageable' }
  ],
  portionSize: [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'varies', label: 'Varies' }
  ],
  appetite: [
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
    { value: 'absent', label: 'Absent' }
  ],
  iddsiDrink: [
    { value: '0', label: '0 — Thin' },
    { value: '1', label: '1 — Slightly thick' },
    { value: '2', label: '2 — Mildly thick' },
    { value: '3', label: '3 — Moderately thick' },
    { value: '4', label: '4 — Extremely thick' }
  ],
  iddsiFood: [
    { value: '3', label: '3 — Liquidised' },
    { value: '4', label: '4 — Pureed' },
    { value: '5', label: '5 — Minced and moist' },
    { value: '6', label: '6 — Soft and bite-sized' },
    { value: '7', label: '7 — Regular' }
  ],
  hydrationSigns: [
    { value: 'well-hydrated', label: 'Well hydrated' },
    { value: 'mild-dehydration', label: 'Mild dehydration' },
    { value: 'moderate-dehydration', label: 'Moderate dehydration' },
    { value: 'severe-dehydration', label: 'Severe dehydration' },
    { value: 'fluid-overload', label: 'Fluid overload' }
  ],
  allergySeverity: [
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' },
    { value: 'anaphylaxis', label: 'Anaphylaxis' }
  ],
  avoidanceReason: [
    { value: 'allergy', label: 'Allergy' },
    { value: 'intolerance', label: 'Intolerance' },
    { value: 'medical-advice', label: 'Medical advice' },
    { value: 'religious', label: 'Religious' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'ethical', label: 'Ethical' },
    { value: 'dislike', label: 'Dislike' },
    { value: 'cost', label: 'Cost' },
    { value: 'other', label: 'Other' }
  ],
  therapeuticDiet: [
    { value: 'none', label: 'None' },
    { value: 'gluten-free', label: 'Gluten-free' },
    { value: 'low-fodmap', label: 'Low FODMAP' },
    { value: 'renal', label: 'Renal' },
    { value: 'diabetic', label: 'Diabetic' },
    { value: 'low-sodium', label: 'Low sodium' },
    { value: 'low-potassium', label: 'Low potassium' },
    { value: 'high-energy-high-protein', label: 'High energy, high protein' },
    { value: 'ketogenic', label: 'Ketogenic' },
    { value: 'low-residue', label: 'Low residue' },
    { value: 'other', label: 'Other' }
  ],
  dietaryPattern: [
    { value: 'omnivore', label: 'Omnivore' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'pescatarian', label: 'Pescatarian' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Kosher' },
    { value: 'other', label: 'Other' }
  ],
  appetiteChange: [
    { value: 'none', label: 'No change' },
    { value: 'increased', label: 'Increased' },
    { value: 'decreased', label: 'Decreased' }
  ],
  dysphagiaScreenOutcome: [
    { value: 'pass', label: 'Pass' },
    { value: 'fail', label: 'Fail' },
    { value: 'not-done', label: 'Not done' }
  ],
  bristolStoolType: [
    { value: '1', label: '1 — Separate hard lumps' },
    { value: '2', label: '2 — Lumpy and sausage-like' },
    { value: '3', label: '3 — Sausage with cracks' },
    { value: '4', label: '4 — Smooth and soft' },
    { value: '5', label: '5 — Soft blobs' },
    { value: '6', label: '6 — Mushy with ragged edges' },
    { value: '7', label: '7 — Entirely liquid' }
  ],
  livingSituation: [
    { value: 'alone', label: 'Alone' },
    { value: 'with-partner', label: 'With a partner' },
    { value: 'with-family', label: 'With family' },
    { value: 'shared-house', label: 'Shared house' },
    { value: 'care-home', label: 'Care home' },
    { value: 'supported-living', label: 'Supported living' },
    { value: 'homeless', label: 'Homeless' },
    { value: 'other', label: 'Other' }
  ],
  whoShops: [
    { value: 'patient', label: 'The patient' },
    { value: 'family', label: 'Family' },
    { value: 'carer', label: 'Carer' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'other', label: 'Other' }
  ],
  whoCooks: [
    { value: 'patient', label: 'The patient' },
    { value: 'family', label: 'Family' },
    { value: 'carer', label: 'Carer' },
    { value: 'meal-service', label: 'Meal service' },
    { value: 'other', label: 'Other' }
  ],
  cookingSkills: [
    { value: 'confident', label: 'Confident' },
    { value: 'basic', label: 'Basic' },
    { value: 'limited', label: 'Limited' },
    { value: 'none', label: 'None' }
  ],
  accessToShops: [
    { value: 'easy', label: 'Easy' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'difficult', label: 'Difficult' },
    { value: 'none', label: 'No access' }
  ],
  workPattern: [
    { value: 'full-time', label: 'Full time' },
    { value: 'part-time', label: 'Part time' },
    { value: 'shift-work', label: 'Shift work' },
    { value: 'night-shift', label: 'Night shift' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'retired', label: 'Retired' },
    { value: 'student', label: 'Student' },
    { value: 'carer', label: 'Carer' },
    { value: 'unable-to-work', label: 'Unable to work' }
  ],
  mealSupport: [
    { value: 'none', label: 'None' },
    { value: 'family', label: 'Family' },
    { value: 'care-worker', label: 'Care worker' },
    { value: 'meals-on-wheels', label: 'Meals on wheels' },
    { value: 'day-centre', label: 'Day centre' },
    { value: 'care-home-catering', label: 'Care-home catering' },
    { value: 'other', label: 'Other' }
  ],
  socialSupport: [
    { value: 'good', label: 'Good' },
    { value: 'some', label: 'Some' },
    { value: 'limited', label: 'Limited' },
    { value: 'none', label: 'None' }
  ],
  activityLevel: [
    { value: 'sedentary', label: 'Sedentary' },
    { value: 'lightly-active', label: 'Lightly active' },
    { value: 'moderately-active', label: 'Moderately active' },
    { value: 'very-active', label: 'Very active' }
  ],
  mobility: [
    { value: 'independent', label: 'Independent' },
    { value: 'walking-aid', label: 'Walking aid' },
    { value: 'wheelchair', label: 'Wheelchair' },
    { value: 'bed-bound', label: 'Bed-bound' }
  ],
  feedingAssistance: [
    { value: 'none', label: 'None' },
    { value: 'prompting', label: 'Prompting' },
    { value: 'partial', label: 'Partial' },
    { value: 'full', label: 'Full' }
  ],
  sarcf: [
    { value: '0', label: '0 — None' },
    { value: '1', label: '1 — Some' },
    { value: '2', label: '2 — A lot, or unable' }
  ],
  stageOfChange: [
    { value: 'precontemplation', label: 'Precontemplation' },
    { value: 'contemplation', label: 'Contemplation' },
    { value: 'preparation', label: 'Preparation' },
    { value: 'action', label: 'Action' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'relapse', label: 'Relapse' }
  ],
  mood: [
    { value: 'good', label: 'Good' },
    { value: 'low', label: 'Low' },
    { value: 'depressed', label: 'Depressed' },
    { value: 'variable', label: 'Variable' }
  ],
  healthLiteracy: [
    { value: 'high', label: 'High' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'low', label: 'Low' }
  ],
  learningStyle: [
    { value: 'verbal', label: 'Verbal' },
    { value: 'written', label: 'Written' },
    { value: 'visual', label: 'Visual' },
    { value: 'demonstration', label: 'Demonstration' },
    { value: 'digital', label: 'Digital' }
  ],
  requirementEquation: [
    { value: 'henry', label: 'Henry' },
    { value: 'schofield', label: 'Schofield' },
    { value: 'harris-benedict', label: 'Harris-Benedict' },
    { value: 'mifflin-st-jeor', label: 'Mifflin-St Jeor' },
    { value: 'kcal-per-kg', label: 'kcal per kg' },
    { value: 'indirect-calorimetry', label: 'Indirect calorimetry' },
    { value: 'other', label: 'Other' }
  ],
  interventionType: [
    { value: 'dietary-counselling', label: 'Dietary counselling' },
    { value: 'food-first-fortification', label: 'Food-first fortification' },
    { value: 'oral-nutritional-supplements', label: 'Oral nutritional supplements' },
    { value: 'texture-modification', label: 'Texture modification' },
    { value: 'enteral-nutrition', label: 'Enteral nutrition' },
    { value: 'parenteral-nutrition', label: 'Parenteral nutrition' },
    { value: 'weight-management', label: 'Weight management' },
    { value: 'no-intervention', label: 'No intervention' },
    { value: 'other', label: 'Other' }
  ],
  compositeRisk: [
    { value: 'low', label: 'Low' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ]
};

// ----------------------------------------------------------------------
// Section renderers — one per wizard step
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Dietitian identification',
    description: 'Who is conducting the assessment, where, and for how long.'
  });
  card.appendChild(textInput({ label: 'Dietitian name', section: 'dietitian', field: 'dietitianName', required: true }));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Role', section: 'dietitian', field: 'role', options: OPTIONS.role, required: true }),
    selectInput({ label: 'Specialty', section: 'dietitian', field: 'specialty', options: OPTIONS.specialty })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Registration body', section: 'dietitian', field: 'registrationBody', options: OPTIONS.registrationBody }),
    textInput({ label: 'Registration number', section: 'dietitian', field: 'registrationNumber' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Assessment date', section: 'dietitian', field: 'assessmentDate', type: 'date', required: true }),
    textInput({ label: 'Assessment time', section: 'dietitian', field: 'assessmentTime', type: 'time' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Site', section: 'dietitian', field: 'siteName' }),
    textInput({ label: 'Service', section: 'dietitian', field: 'serviceName' })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Setting', section: 'dietitian', field: 'setting', options: OPTIONS.setting }),
    selectInput({ label: 'Appointment type', section: 'dietitian', field: 'appointmentType', options: OPTIONS.appointmentType })
  ]));
  card.appendChild(grid('two-col', [
    textInput({
      label: 'Planned duration', section: 'dietitian', field: 'plannedDurationMinutes',
      type: 'number', min: 5, max: 240, unit: 'minutes',
      hint: 'Typically 45 to 60 for an initial appointment, up to 90 for a specialist programme.'
    }),
    yesNo({ label: 'Interpreter required', section: 'dietitian', field: 'interpreterRequired' })
  ]));
  card.appendChild(textInput({ label: 'Interpreter language', section: 'dietitian', field: 'interpreterLanguage' }));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification and referral',
    description: 'Who the patient is, who referred them, and why.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'First name', section: 'patient', field: 'firstName', required: true }),
    textInput({ label: 'Last name', section: 'patient', field: 'lastName', required: true })
  ]));
  card.appendChild(grid('two-col', [
    textInput({
      label: 'Date of birth', section: 'patient', field: 'birthDate', type: 'date',
      hint: 'Used for the age-banded GLIM body mass index thresholds and the paediatric flag.'
    }),
    selectInput({ label: 'Sex', section: 'patient', field: 'sex', options: OPTIONS.sex })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'NHS number', section: 'patient', field: 'nhsNumber', placeholder: 'NNN NNN NNNN' }),
    textInput({ label: 'Preferred language', section: 'patient', field: 'preferredLanguage' })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Referral source', section: 'patient', field: 'referralSource', options: OPTIONS.referralSource }),
    textInput({ label: 'Referral date', section: 'patient', field: 'referralDate', type: 'date' })
  ]));
  card.appendChild(textArea({ label: 'Reason for referral', section: 'patient', field: 'referralReason', rows: 2, required: true }));
  card.appendChild(textInput({ label: 'Primary presenting condition', section: 'patient', field: 'primaryCondition' }));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Consent to record the assessment', section: 'patient', field: 'consentToRecord' }),
    textInput({ label: 'Accompanied by', section: 'patient', field: 'accompaniedBy', placeholder: 'Relative, carer, advocate' })
  ]));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Medical history review',
    description: 'Diagnosed conditions, recent surgery, symptoms, and relevant family history.'
  });
  card.appendChild(selectInput({ label: 'Diabetes', section: 'history', field: 'conditionDiabetes', options: OPTIONS.diabetes }));
  card.appendChild(subHead('Diagnosed conditions'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Coeliac disease', section: 'history', field: 'conditionCoeliac' }),
    yesNo({ label: 'Inflammatory bowel disease', section: 'history', field: 'conditionInflammatoryBowelDisease' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Chronic kidney disease', section: 'history', field: 'conditionChronicKidneyDisease' }),
    yesNo({ label: 'Liver disease', section: 'history', field: 'conditionLiverDisease' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Cancer', section: 'history', field: 'conditionCancer' }),
    yesNo({ label: 'Cardiovascular disease', section: 'history', field: 'conditionCardiovascularDisease' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Respiratory disease', section: 'history', field: 'conditionRespiratoryDisease' }),
    yesNo({ label: 'Stroke', section: 'history', field: 'conditionStroke' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Dementia', section: 'history', field: 'conditionDementia' }),
    yesNo({ label: 'Eating disorder', section: 'history', field: 'conditionEatingDisorder' })
  ]));
  card.appendChild(textInput({ label: 'Other conditions', section: 'history', field: 'conditionOther' }));
  card.appendChild(subHead('Surgery'));
  card.appendChild(yesNo({ label: 'Recent surgery', section: 'history', field: 'recentSurgery' }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Surgery type', section: 'history', field: 'recentSurgeryType' }),
    textInput({ label: 'Surgery date', section: 'history', field: 'recentSurgeryDate', type: 'date' })
  ]));
  card.appendChild(selectInput({
    label: 'Gastrointestinal surgery', section: 'history', field: 'gastrointestinalSurgery',
    options: OPTIONS.gastrointestinalSurgery,
    hint: 'Resection, bypass, and stoma formation each change absorption.'
  }));
  card.appendChild(textArea({ label: 'Current symptoms', section: 'history', field: 'currentSymptoms', rows: 2 }));
  card.appendChild(textArea({ label: 'Relevant family history', section: 'history', field: 'familyHistory', rows: 2 }));
  card.appendChild(selectInput({ label: 'Pregnancy status', section: 'history', field: 'pregnancyStatus', options: OPTIONS.pregnancyStatus }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Medication and supplement check',
    description: 'Prescription medicines, over-the-counter medicines, vitamins, minerals, and herbal products.'
  });
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Prescription medicines', section: 'medication', field: 'takesPrescriptionMedicines' }),
    yesNo({ label: 'Over-the-counter medicines', section: 'medication', field: 'takesOverTheCounterMedicines' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Vitamin supplements', section: 'medication', field: 'takesVitaminSupplements' }),
    yesNo({ label: 'Mineral supplements', section: 'medication', field: 'takesMineralSupplements' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Herbal or complementary products', section: 'medication', field: 'takesHerbalProducts' }),
    yesNo({ label: 'Oral nutritional supplements', section: 'medication', field: 'takesOralNutritionalSupplements' })
  ]));
  card.appendChild(textArea({
    label: 'Oral nutritional supplement detail', section: 'medication', field: 'oralNutritionalSupplementDetail', rows: 2,
    placeholder: 'Product, dose, and how well it is tolerated.'
  }));
  card.appendChild(subHead('Artificial nutrition'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Enteral tube feeding in place', section: 'medication', field: 'enteralNutrition' }),
    selectInput({ label: 'Enteral route', section: 'medication', field: 'enteralRoute', options: OPTIONS.enteralRoute })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Tube or tolerance problem', section: 'medication', field: 'enteralTubeProblem' }),
    yesNo({ label: 'Parenteral nutrition', section: 'medication', field: 'parenteralNutrition' })
  ]));
  card.appendChild(subHead('Interactions and adherence'));
  card.appendChild(yesNo({ label: 'Drug-nutrient interaction identified', section: 'medication', field: 'drugNutrientInteraction' }));
  card.appendChild(textInput({ label: 'Interaction detail', section: 'medication', field: 'drugNutrientInteractionDetail' }));
  card.appendChild(selectInput({ label: 'Adherence', section: 'medication', field: 'medicationAdherence', options: OPTIONS.adherence }));
  card.appendChild(textArea({ label: 'Medication notes', section: 'medication', field: 'medicationNotes', rows: 2 }));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Anthropometry and physical measurements',
    description: 'Height, weight, and body mass index, with a mid-upper-arm-circumference alternative when being weighed causes distress.'
  });
  card.appendChild(note(
    'Being weighed distresses some patients. Choose "Declined by the patient" for the measurement method and record a mid-upper-arm circumference instead; the MUST body mass index component is then estimated and the report says so. A declined weight never blocks the assessment.'
  ));
  card.appendChild(selectInput({
    label: 'Measurement method', section: 'anthropometry', field: 'measurementMethod',
    options: OPTIONS.measurementMethod, required: true
  }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Height', section: 'anthropometry', field: 'heightAsCm', type: 'number', min: 50, max: 250, step: 0.1, unit: 'cm' }),
    textInput({ label: 'Weight', section: 'anthropometry', field: 'weightAsKg', type: 'number', min: 15, max: 400, step: 0.1, unit: 'kg' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({
      label: 'Body mass index', section: 'anthropometry', field: 'derivedBmi', type: 'text', readonly: true,
      hint: 'Computed from height and weight, after any oedema adjustment.'
    }),
    textInput({
      label: 'Unplanned weight loss', section: 'anthropometry', field: 'derivedWeightLoss', type: 'text', readonly: true,
      hint: 'Computed against the usual weight, or the 6-month or 3-month weight.'
    })
  ]));
  card.appendChild(grid('two-col', [
    textInput({
      label: 'Mid-upper-arm circumference', section: 'anthropometry', field: 'midUpperArmCircumferenceAsCm',
      type: 'number', min: 8, max: 70, step: 0.1, unit: 'cm',
      hint: 'Below 23.5 suggests a body mass index below 20; above 32.0 suggests above 30.'
    }),
    textInput({ label: 'Calf circumference', section: 'anthropometry', field: 'calfCircumferenceAsCm', type: 'number', min: 10, max: 80, step: 0.1, unit: 'cm' })
  ]));
  card.appendChild(textInput({ label: 'Waist circumference', section: 'anthropometry', field: 'waistAsCm', type: 'number', min: 30, max: 250, step: 0.1, unit: 'cm' }));
  card.appendChild(subHead('Weight history'));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Usual weight', section: 'anthropometry', field: 'usualWeightAsKg', type: 'number', min: 15, max: 400, step: 0.1, unit: 'kg' }),
    selectInput({ label: 'Weight trend', section: 'anthropometry', field: 'weightTrend', options: OPTIONS.weightTrend })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Weight 3 months ago', section: 'anthropometry', field: 'weight3MonthsAgoAsKg', type: 'number', min: 15, max: 400, step: 0.1, unit: 'kg' }),
    textInput({ label: 'Weight 6 months ago', section: 'anthropometry', field: 'weight6MonthsAgoAsKg', type: 'number', min: 15, max: 400, step: 0.1, unit: 'kg' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Was the weight loss intentional', section: 'anthropometry', field: 'weightLossIsIntentional', hint: 'Only unplanned loss scores in MUST.' }),
    yesNo({ label: 'Clothes or jewellery looser', section: 'anthropometry', field: 'clothesOrJewelleryLooser', hint: 'The MUST subjective criterion, used when no baseline weight is available.' })
  ]));
  card.appendChild(subHead('Adjustments'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Oedema present', section: 'anthropometry', field: 'oedemaPresent' }),
    textInput({ label: 'Oedema weight adjustment', section: 'anthropometry', field: 'oedemaAdjustmentKg', type: 'number', min: 0, max: 30, step: 0.1, unit: 'kg' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Ascites present', section: 'anthropometry', field: 'ascitesPresent' }),
    yesNo({ label: 'Amputation present', section: 'anthropometry', field: 'amputationPresent' })
  ]));
  card.appendChild(textInput({ label: 'Amputation adjustment', section: 'anthropometry', field: 'amputationAdjustmentPercent', type: 'number', min: 0, max: 50, step: 0.1, unit: '% of body weight' }));
  card.appendChild(textArea({ label: 'Measurement notes', section: 'anthropometry', field: 'anthropometryNotes', rows: 2, placeholder: 'For example, why weighing was declined.' }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Biochemistry and clinical monitoring',
    description: 'Recent blood results. Leave blank where a result is unavailable; a missing electrolyte panel raises the refeeding flag rather than clearing it.'
  });
  card.appendChild(textInput({ label: 'Sample date', section: 'biochemistry', field: 'bloodsSampleDate', type: 'date' }));
  card.appendChild(subHead('Inflammation and haematology'));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Albumin', section: 'biochemistry', field: 'albuminGPerL', type: 'number', step: 0.1, unit: 'g/L', hint: 'A marker of inflammation, not of protein intake.' }),
    textInput({ label: 'C-reactive protein', section: 'biochemistry', field: 'cReactiveProteinMgPerL', type: 'number', step: 0.1, unit: 'mg/L' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Haemoglobin', section: 'biochemistry', field: 'haemoglobinGPerL', type: 'number', step: 0.1, unit: 'g/L' }),
    textInput({ label: 'Ferritin', section: 'biochemistry', field: 'ferritinUgPerL', type: 'number', step: 0.1, unit: 'µg/L' })
  ]));
  card.appendChild(subHead('Micronutrients'));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Vitamin B12', section: 'biochemistry', field: 'vitaminB12NgPerL', type: 'number', step: 0.1, unit: 'ng/L' }),
    textInput({ label: 'Folate', section: 'biochemistry', field: 'folateUgPerL', type: 'number', step: 0.1, unit: 'µg/L' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Vitamin D', section: 'biochemistry', field: 'vitaminDNmolPerL', type: 'number', step: 0.1, unit: 'nmol/L' }),
    textInput({ label: 'HbA1c', section: 'biochemistry', field: 'hba1cMmolPerMol', type: 'number', step: 0.1, unit: 'mmol/mol' })
  ]));
  card.appendChild(subHead('Electrolytes — checked before feeding'));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Sodium', section: 'biochemistry', field: 'sodiumMmolPerL', type: 'number', step: 0.1, unit: 'mmol/L' }),
    textInput({ label: 'Potassium', section: 'biochemistry', field: 'potassiumMmolPerL', type: 'number', step: 0.1, unit: 'mmol/L' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Magnesium', section: 'biochemistry', field: 'magnesiumMmolPerL', type: 'number', step: 0.01, unit: 'mmol/L' }),
    textInput({ label: 'Phosphate', section: 'biochemistry', field: 'phosphateMmolPerL', type: 'number', step: 0.01, unit: 'mmol/L' })
  ]));
  card.appendChild(textInput({ label: 'Corrected calcium', section: 'biochemistry', field: 'correctedCalciumMmolPerL', type: 'number', step: 0.01, unit: 'mmol/L' }));
  card.appendChild(subHead('Renal, hepatic, and lipids'));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Urea', section: 'biochemistry', field: 'ureaMmolPerL', type: 'number', step: 0.1, unit: 'mmol/L' }),
    textInput({ label: 'Creatinine', section: 'biochemistry', field: 'creatinineUmolPerL', type: 'number', step: 0.1, unit: 'µmol/L' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'eGFR', section: 'biochemistry', field: 'egfrMlPerMin', type: 'number', step: 0.1, unit: 'ml/min/1.73m²' }),
    textInput({ label: 'Alanine aminotransferase', section: 'biochemistry', field: 'alanineAminotransferaseUPerL', type: 'number', step: 0.1, unit: 'U/L' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Bilirubin', section: 'biochemistry', field: 'bilirubinUmolPerL', type: 'number', step: 0.1, unit: 'µmol/L' }),
    textInput({ label: 'Total cholesterol', section: 'biochemistry', field: 'totalCholesterolMmolPerL', type: 'number', step: 0.1, unit: 'mmol/L' })
  ]));
  card.appendChild(textInput({ label: 'Triglycerides', section: 'biochemistry', field: 'triglyceridesMmolPerL', type: 'number', step: 0.1, unit: 'mmol/L' }));
  card.appendChild(textArea({ label: 'Biochemistry notes', section: 'biochemistry', field: 'biochemistryNotes', rows: 2 }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Nutrition-focused physical examination',
    description: 'Fat and muscle stores, oedema, oral health, skin, hair, nails, and grip strength. These findings satisfy the GLIM reduced-muscle-mass criterion where body-composition measurement is unavailable.'
  });
  card.appendChild(selectInput({ label: 'Subcutaneous fat loss', section: 'physicalExam', field: 'subcutaneousFatLoss', options: SEVERITY_4 }));
  card.appendChild(subHead('Muscle wasting'));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Temples', section: 'physicalExam', field: 'muscleWastingTemples' }),
    yesNo({ label: 'Clavicles', section: 'physicalExam', field: 'muscleWastingClavicles' }),
    yesNo({ label: 'Quadriceps', section: 'physicalExam', field: 'muscleWastingQuadriceps' })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Overall muscle wasting severity', section: 'physicalExam', field: 'muscleWastingSeverity', options: SEVERITY_4 }),
    selectInput({ label: 'Peripheral oedema severity', section: 'physicalExam', field: 'peripheralOedemaSeverity', options: SEVERITY_4 })
  ]));
  card.appendChild(subHead('Oral'));
  card.appendChild(grid('three-col', [
    selectInput({ label: 'Oral health', section: 'physicalExam', field: 'oralHealth', options: OPTIONS.goodFairPoor }),
    selectInput({ label: 'Dentition', section: 'physicalExam', field: 'dentition', options: OPTIONS.dentition }),
    selectInput({ label: 'Chewing ability', section: 'physicalExam', field: 'chewingAbility', options: OPTIONS.chewingAbility })
  ]));
  card.appendChild(selectInput({ label: 'Tongue and mucosa', section: 'physicalExam', field: 'tongueAndMucosa', options: OPTIONS.tongueAndMucosa }));
  card.appendChild(subHead('Skin, hair, and nails'));
  card.appendChild(grid('three-col', [
    selectInput({ label: 'Skin', section: 'physicalExam', field: 'skinCondition', options: OPTIONS.skinCondition }),
    selectInput({ label: 'Hair', section: 'physicalExam', field: 'hairCondition', options: OPTIONS.hairCondition }),
    selectInput({ label: 'Nails', section: 'physicalExam', field: 'nailCondition', options: OPTIONS.nailCondition })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Pressure ulcer present', section: 'physicalExam', field: 'pressureUlcerPresent' }),
    selectInput({ label: 'Pressure ulcer category', section: 'physicalExam', field: 'pressureUlcerCategory', options: OPTIONS.pressureUlcerCategory })
  ]));
  card.appendChild(textInput({
    label: 'Hand-grip strength', section: 'physicalExam', field: 'handGripStrengthKg',
    type: 'number', min: 0, max: 100, step: 0.1, unit: 'kg',
    hint: 'Compared against sex-adjusted cut-offs: below 27 kg for men, below 16 kg for women.'
  }));
  card.appendChild(textArea({ label: 'Examination notes', section: 'physicalExam', field: 'physicalExamNotes', rows: 2 }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Dietary recall',
    description: 'Typical daily intake, meal frequency, and portion sizes, recorded as a 24-hour recall by eating occasion.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'Meals per day', section: 'dietaryRecall', field: 'mealsPerDay', type: 'number', min: 0, max: 12 }),
    textInput({ label: 'Snacks per day', section: 'dietaryRecall', field: 'snacksPerDay', type: 'number', min: 0, max: 12 })
  ]));
  card.appendChild(subHead('24-hour recall'));
  card.appendChild(textArea({ label: 'Breakfast', section: 'dietaryRecall', field: 'recallBreakfast', rows: 2 }));
  card.appendChild(textArea({ label: 'Mid-morning', section: 'dietaryRecall', field: 'recallMidMorning', rows: 2 }));
  card.appendChild(textArea({ label: 'Lunch', section: 'dietaryRecall', field: 'recallLunch', rows: 2 }));
  card.appendChild(textArea({ label: 'Afternoon', section: 'dietaryRecall', field: 'recallAfternoon', rows: 2 }));
  card.appendChild(textArea({ label: 'Dinner', section: 'dietaryRecall', field: 'recallDinner', rows: 2 }));
  card.appendChild(textArea({ label: 'Evening', section: 'dietaryRecall', field: 'recallEvening', rows: 2 }));
  card.appendChild(subHead('Intake summary'));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Portion size', section: 'dietaryRecall', field: 'portionSize', options: OPTIONS.portionSize }),
    selectInput({ label: 'Appetite', section: 'dietaryRecall', field: 'appetite', options: OPTIONS.appetite })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Appetite score', section: 'dietaryRecall', field: 'appetiteScore0To10', type: 'number', min: 0, max: 10, unit: '0–10' }),
    textInput({
      label: 'Intake as a proportion of usual', section: 'dietaryRecall', field: 'proportionOfUsualIntakePercent',
      type: 'number', min: 0, max: 200, unit: '%',
      hint: 'At or below 50% satisfies the GLIM reduced-intake criterion.'
    })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Meals eaten out per week', section: 'dietaryRecall', field: 'mealsOutPerWeek', type: 'number', min: 0, max: 30 }),
    textInput({ label: 'Takeaways per week', section: 'dietaryRecall', field: 'takeawaysPerWeek', type: 'number', min: 0, max: 30 })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Estimated energy intake', section: 'dietaryRecall', field: 'estimatedEnergyIntakeKcal', type: 'number', min: 0, max: 10000, unit: 'kcal/day' }),
    textInput({ label: 'Estimated protein intake', section: 'dietaryRecall', field: 'estimatedProteinIntakeG', type: 'number', min: 0, max: 500, unit: 'g/day' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Food diary completed', section: 'dietaryRecall', field: 'foodDiaryCompleted' }),
    yesNo({ label: 'Usually eats alone', section: 'dietaryRecall', field: 'eatsAlone' })
  ]));
  card.appendChild(textArea({ label: 'Dietary recall notes', section: 'dietaryRecall', field: 'dietaryRecallNotes', rows: 2 }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Fluid intake and hydration',
    description: 'Fluid consumption, drink types, alcohol, and any thickened fluids or fluid restriction.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'Fluid intake', section: 'hydration', field: 'fluidIntakeMlPerDay', type: 'number', min: 0, max: 10000, unit: 'ml/day' }),
    textInput({ label: 'Caffeinated drinks', section: 'hydration', field: 'caffeinatedDrinksPerDay', type: 'number', min: 0, max: 30, unit: 'per day' })
  ]));
  card.appendChild(textInput({ label: 'Drink types', section: 'hydration', field: 'fluidTypes', placeholder: 'Water, tea, juice, milk-based drinks' }));
  card.appendChild(textInput({
    label: 'Alcohol', section: 'hydration', field: 'alcoholUnitsPerWeek', type: 'number', min: 0, max: 300, step: 0.1, unit: 'units/week',
    hint: 'Above 14 units per week raises a flag and is a NICE CG32 refeeding minor criterion.'
  }));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Thickened fluids', section: 'hydration', field: 'thickenedFluids' }),
    selectInput({ label: 'IDDSI drink level', section: 'hydration', field: 'thickenedFluidsIddsiLevel', options: OPTIONS.iddsiDrink })
  ]));
  card.appendChild(selectInput({ label: 'Hydration signs', section: 'hydration', field: 'hydrationSigns', options: OPTIONS.hydrationSigns }));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Fluid restriction in place', section: 'hydration', field: 'fluidRestriction' }),
    textInput({ label: 'Restriction target', section: 'hydration', field: 'fluidRestrictionMlPerDay', type: 'number', min: 0, max: 5000, unit: 'ml/day' })
  ]));
  card.appendChild(textArea({ label: 'Hydration notes', section: 'hydration', field: 'hydrationNotes', rows: 2 }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Food preferences, allergies, and cultural requirements',
    description: 'What the patient can eat, will eat, and must not eat. A care plan that ignores any of these will not be followed.'
  });
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Food allergy', section: 'preferences', field: 'hasFoodAllergy' }),
    yesNo({ label: 'Food intolerance', section: 'preferences', field: 'hasFoodIntolerance' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Allergen and reaction', section: 'preferences', field: 'foodAllergyDetail', placeholder: 'For example, peanut — urticaria and wheeze' }),
    selectInput({ label: 'Reaction severity', section: 'preferences', field: 'allergySeverity', options: OPTIONS.allergySeverity })
  ]));
  card.appendChild(textArea({ label: 'Foods avoided', section: 'preferences', field: 'foodsAvoided', rows: 2 }));
  card.appendChild(selectInput({ label: 'Reason for avoidance', section: 'preferences', field: 'avoidanceReason', options: OPTIONS.avoidanceReason }));
  card.appendChild(textArea({ label: 'Dislikes', section: 'preferences', field: 'dislikes', rows: 2 }));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Therapeutic diet in place', section: 'preferences', field: 'therapeuticDiet', options: OPTIONS.therapeuticDiet }),
    selectInput({ label: 'Dietary pattern', section: 'preferences', field: 'dietaryPattern', options: OPTIONS.dietaryPattern })
  ]));
  card.appendChild(textInput({ label: 'Religious or cultural requirements', section: 'preferences', field: 'religiousOrCulturalRequirement' }));
  card.appendChild(textInput({ label: 'Fasting practices', section: 'preferences', field: 'fastingPractice', placeholder: 'For example, Ramadan' }));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Texture-modified diet', section: 'preferences', field: 'textureModifiedDiet' }),
    selectInput({ label: 'IDDSI food level', section: 'preferences', field: 'textureModifiedIddsiLevel', options: OPTIONS.iddsiFood })
  ]));
  card.appendChild(textArea({ label: 'Preferences notes', section: 'preferences', field: 'preferencesNotes', rows: 2 }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Gastrointestinal and swallowing',
    description: 'Symptoms that limit what can be eaten or absorbed. Dysphagia without a speech-and-language-therapy assessment raises a high-priority flag.'
  });
  card.appendChild(selectInput({ label: 'Appetite change', section: 'gastrointestinal', field: 'appetiteChange', options: OPTIONS.appetiteChange }));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Early satiety', section: 'gastrointestinal', field: 'earlySatiety' }),
    yesNo({ label: 'Nausea', section: 'gastrointestinal', field: 'nausea' })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Vomiting', section: 'gastrointestinal', field: 'vomiting' }),
    yesNo({ label: 'Reflux', section: 'gastrointestinal', field: 'reflux' })
  ]));
  card.appendChild(subHead('Swallowing'));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Dysphagia', section: 'gastrointestinal', field: 'dysphagia' }),
    selectInput({ label: 'Swallow screen outcome', section: 'gastrointestinal', field: 'dysphagiaScreenOutcome', options: OPTIONS.dysphagiaScreenOutcome }),
    yesNo({ label: 'Speech and language therapy involved', section: 'gastrointestinal', field: 'speechAndLanguageTherapy' })
  ]));
  card.appendChild(subHead('Bowel and abdomen'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Abdominal pain', section: 'gastrointestinal', field: 'abdominalPain' }),
    yesNo({ label: 'Bloating', section: 'gastrointestinal', field: 'bloating' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Bowel frequency', section: 'gastrointestinal', field: 'bowelFrequencyPerWeek', type: 'number', min: 0, max: 100, unit: 'per week' }),
    selectInput({ label: 'Bristol stool type', section: 'gastrointestinal', field: 'bristolStoolType', options: OPTIONS.bristolStoolType })
  ]));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Constipation', section: 'gastrointestinal', field: 'constipation' }),
    yesNo({ label: 'Diarrhoea', section: 'gastrointestinal', field: 'diarrhoea' })
  ]));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Stoma or fistula', section: 'gastrointestinal', field: 'stomaPresent' }),
    textInput({ label: 'Output', section: 'gastrointestinal', field: 'stomaOutputMlPerDay', type: 'number', min: 0, max: 10000, unit: 'ml/day' }),
    yesNo({ label: 'Malabsorption signs', section: 'gastrointestinal', field: 'malabsorptionSigns' })
  ]));
  card.appendChild(textArea({ label: 'Gastrointestinal notes', section: 'gastrointestinal', field: 'gastrointestinalNotes', rows: 2 }));
  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Lifestyle and environment',
    description: 'Work pattern, cooking skills and facilities, food budget, and shopping access. A plan the patient cannot shop for, store, or cook is not a plan.'
  });
  card.appendChild(selectInput({ label: 'Living situation', section: 'environment', field: 'livingSituation', options: OPTIONS.livingSituation }));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Who does the shopping', section: 'environment', field: 'whoShops', options: OPTIONS.whoShops }),
    selectInput({ label: 'Who cooks', section: 'environment', field: 'whoCooks', options: OPTIONS.whoCooks })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Cooking skills', section: 'environment', field: 'cookingSkills', options: OPTIONS.cookingSkills }),
    textInput({ label: 'Cooking confidence', section: 'environment', field: 'cookingConfidence0To10', type: 'number', min: 0, max: 10, unit: '0–10' })
  ]));
  card.appendChild(subHead('Kitchen facilities'));
  card.appendChild(grid('four-col', [
    yesNo({ label: 'Cooker', section: 'environment', field: 'hasCooker' }),
    yesNo({ label: 'Fridge', section: 'environment', field: 'hasFridge' }),
    yesNo({ label: 'Freezer', section: 'environment', field: 'hasFreezer' }),
    yesNo({ label: 'Microwave', section: 'environment', field: 'hasMicrowave' })
  ]));
  card.appendChild(subHead('Food security'));
  card.appendChild(textInput({ label: 'Weekly food budget', section: 'environment', field: 'foodBudgetPerWeek', type: 'number', min: 0, max: 10000, step: 0.01, unit: 'per week' }));
  card.appendChild(grid('three-col', [
    yesNo({ label: 'Worried food would run out', section: 'environment', field: 'worriedFoodWouldRunOut' }),
    yesNo({ label: 'Skipped meals for money', section: 'environment', field: 'skippedMealsForMoney' }),
    yesNo({ label: 'Uses a food bank', section: 'environment', field: 'usesFoodBank' })
  ]));
  card.appendChild(subHead('Access and support'));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Access to shops', section: 'environment', field: 'accessToShops', options: OPTIONS.accessToShops }),
    yesNo({ label: 'Has transport', section: 'environment', field: 'hasTransport' })
  ]));
  card.appendChild(grid('three-col', [
    selectInput({ label: 'Work pattern', section: 'environment', field: 'workPattern', options: OPTIONS.workPattern }),
    selectInput({ label: 'Meal support', section: 'environment', field: 'mealSupport', options: OPTIONS.mealSupport }),
    selectInput({ label: 'Social support', section: 'environment', field: 'socialSupport', options: OPTIONS.socialSupport })
  ]));
  card.appendChild(textArea({ label: 'Environment notes', section: 'environment', field: 'environmentNotes', rows: 2 }));
  return card;
}

function renderStep13() {
  const card = sectionCard({
    stepNumber: 13,
    title: 'Physical activity and function',
    description: 'Activity level, mobility, and the five SARC-F sarcopenia case-finding components.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Activity level', section: 'activity', field: 'activityLevel', options: OPTIONS.activityLevel }),
    selectInput({ label: 'Mobility', section: 'activity', field: 'mobility', options: OPTIONS.mobility })
  ]));
  card.appendChild(textInput({ label: 'Exercise type', section: 'activity', field: 'exerciseType' }));
  card.appendChild(grid('three-col', [
    textInput({ label: 'Exercise', section: 'activity', field: 'exerciseMinutesPerWeek', type: 'number', min: 0, max: 3000, unit: 'minutes/week' }),
    textInput({ label: 'Sedentary time', section: 'activity', field: 'sedentaryHoursPerDay', type: 'number', min: 0, max: 24, step: 0.1, unit: 'hours/day' }),
    textInput({ label: 'Falls in the last 12 months', section: 'activity', field: 'fallsInLast12Months', type: 'number', min: 0, max: 100 })
  ]));
  card.appendChild(subHead('SARC-F — difficulty with each activity'));
  card.appendChild(grid('three-col', [
    selectInput({ label: 'Lifting and carrying 4.5 kg', section: 'activity', field: 'sarcfStrength', options: OPTIONS.sarcf }),
    selectInput({ label: 'Walking across a room', section: 'activity', field: 'sarcfWalking', options: OPTIONS.sarcf }),
    selectInput({ label: 'Rising from a chair or bed', section: 'activity', field: 'sarcfRisingFromChair', options: OPTIONS.sarcf })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Climbing ten stairs', section: 'activity', field: 'sarcfClimbingStairs', options: OPTIONS.sarcf }),
    selectInput({
      label: 'Falls in the past year', section: 'activity', field: 'sarcfFalls',
      options: [
        { value: '0', label: '0 — None' },
        { value: '1', label: '1 — One to three' },
        { value: '2', label: '2 — Four or more' }
      ]
    })
  ]));
  card.appendChild(subHead('Eating independence'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Eats and drinks independently', section: 'activity', field: 'eatsIndependently' }),
    selectInput({ label: 'Feeding assistance required', section: 'activity', field: 'feedingAssistanceRequired', options: OPTIONS.feedingAssistance })
  ]));
  card.appendChild(textArea({ label: 'Function notes', section: 'activity', field: 'functionNotes', rows: 2 }));
  return card;
}

function renderStep14() {
  const card = sectionCard({
    stepNumber: 14,
    title: 'Behavioural, psychological, and readiness to change',
    description: 'Motivation, barriers, mood, and the SCOFF disordered-eating screen.'
  });
  card.appendChild(grid('three-col', [
    textInput({ label: 'Motivation', section: 'behavioural', field: 'motivation0To10', type: 'number', min: 0, max: 10, unit: '0–10' }),
    selectInput({ label: 'Stage of change', section: 'behavioural', field: 'stageOfChange', options: OPTIONS.stageOfChange }),
    textInput({ label: 'Self-efficacy', section: 'behavioural', field: 'selfEfficacy0To10', type: 'number', min: 0, max: 10, unit: '0–10' })
  ]));
  card.appendChild(textArea({ label: 'Previous attempts', section: 'behavioural', field: 'previousAttempts', rows: 2 }));
  card.appendChild(textArea({ label: 'Barriers', section: 'behavioural', field: 'barriers', rows: 2 }));
  card.appendChild(subHead('SCOFF screen'));
  card.appendChild(yesNo({ label: 'Do you make yourself sick because you feel uncomfortably full?', section: 'behavioural', field: 'scoffMakeYourselfSick' }));
  card.appendChild(yesNo({ label: 'Do you worry you have lost control over how much you eat?', section: 'behavioural', field: 'scoffLostControl' }));
  card.appendChild(yesNo({ label: 'Have you recently lost more than one stone (about 6 kg) in three months?', section: 'behavioural', field: 'scoffLostOneStone' }));
  card.appendChild(yesNo({ label: 'Do you believe yourself to be fat when others say you are too thin?', section: 'behavioural', field: 'scoffBelieveYourselfFat' }));
  card.appendChild(yesNo({ label: 'Would you say that food dominates your life?', section: 'behavioural', field: 'scoffFoodDominates' }));
  card.appendChild(subHead('Mood, cognition, and communication'));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Mood', section: 'behavioural', field: 'mood', options: OPTIONS.mood }),
    selectInput({ label: 'Anxiety', section: 'behavioural', field: 'anxiety', options: SEVERITY_4 })
  ]));
  card.appendChild(grid('three-col', [
    selectInput({ label: 'Cognitive impairment', section: 'behavioural', field: 'cognitiveImpairment', options: SEVERITY_4 }),
    yesNo({ label: 'Capacity concern', section: 'behavioural', field: 'capacityConcern' }),
    yesNo({ label: 'Safeguarding concern', section: 'behavioural', field: 'safeguardingConcern' })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Health literacy', section: 'behavioural', field: 'healthLiteracy', options: OPTIONS.healthLiteracy }),
    selectInput({ label: 'Preferred learning style', section: 'behavioural', field: 'preferredLearningStyle', options: OPTIONS.learningStyle })
  ]));
  card.appendChild(textArea({
    label: "The patient's goal, in their own words", section: 'behavioural', field: 'patientGoalInOwnWords', rows: 2,
    hint: 'Recorded verbatim so the care plan can be written against what the patient actually wants.'
  }));
  return card;
}

function renderStep15() {
  const card = sectionCard({
    stepNumber: 15,
    title: 'Screening scores and nutrition diagnosis',
    description: 'The remaining MUST and refeeding inputs, the estimated requirements, and the PES statement.'
  });
  card.appendChild(subHead('MUST step 3 — acute disease effect'));
  card.appendChild(grid('two-col', [
    yesNo({ label: 'Acutely ill', section: 'screening', field: 'acutelyIll' }),
    yesNo({ label: 'No nutritional intake, or unlikely intake, for more than 5 days', section: 'screening', field: 'noNutritionalIntakeOver5Days' })
  ]));
  card.appendChild(note('Both must be yes for the acute disease effect to score 2. In an outpatient clinic this component is normally 0.'));
  card.appendChild(grid('two-col', [
    textInput({
      label: 'Days of negligible intake', section: 'screening', field: 'daysOfNegligibleIntake',
      type: 'number', min: 0, max: 365, unit: 'days',
      hint: 'Used for the NICE CG32 refeeding-syndrome risk criteria.'
    }),
    textInput({ label: 'NRS-2002 score', section: 'screening', field: 'nrs2002Score', type: 'number', min: 0, max: 7, unit: '0–7', hint: 'At-risk threshold is 3, for the acute inpatient setting.' })
  ]));
  card.appendChild(subHead('Estimated requirements'));
  card.appendChild(grid('three-col', [
    textInput({ label: 'Energy requirement', section: 'screening', field: 'energyRequirementKcal', type: 'number', min: 0, max: 10000, unit: 'kcal/day' }),
    textInput({ label: 'Protein requirement', section: 'screening', field: 'proteinRequirementG', type: 'number', min: 0, max: 500, unit: 'g/day' }),
    textInput({ label: 'Fluid requirement', section: 'screening', field: 'fluidRequirementMl', type: 'number', min: 0, max: 10000, unit: 'ml/day' })
  ]));
  card.appendChild(selectInput({
    label: 'Equation used', section: 'screening', field: 'requirementEquation', options: OPTIONS.requirementEquation,
    hint: 'The form records which equation you used; it does not compute requirements, because local policy governs the choice.'
  }));
  card.appendChild(subHead('PES statement'));
  card.appendChild(textArea({ label: 'Problem — the nutrition and dietetic diagnosis', section: 'screening', field: 'pesProblem', rows: 2 }));
  card.appendChild(textArea({ label: 'Etiology — related to', section: 'screening', field: 'pesEtiology', rows: 2 }));
  card.appendChild(textArea({ label: 'Signs and symptoms — as evidenced by', section: 'screening', field: 'pesSignsSymptoms', rows: 2 }));
  return card;
}

function renderStep16() {
  const card = sectionCard({
    stepNumber: 16,
    title: 'Nutrition care plan, monitoring, and sign-off',
    description: 'The intervention, the goals, the monitoring plan, and the dietitian signature. Submit to compute the scores and flags.'
  });
  card.appendChild(selectInput({ label: 'Intervention type', section: 'plan', field: 'interventionType', options: OPTIONS.interventionType, required: true }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Prescribed supplement', section: 'plan', field: 'prescribedSupplement' }),
    textInput({ label: 'Dose and frequency', section: 'plan', field: 'prescribedSupplementDose' })
  ]));
  card.appendChild(textInput({ label: 'Texture modification plan', section: 'plan', field: 'textureModificationPlan', placeholder: 'Stated in IDDSI levels where applicable' }));
  card.appendChild(subHead('SMART goals'));
  card.appendChild(textArea({ label: 'Goal 1', section: 'plan', field: 'goal1', rows: 2, placeholder: 'Target, measure, and review date.' }));
  card.appendChild(textArea({ label: 'Goal 2', section: 'plan', field: 'goal2', rows: 2 }));
  card.appendChild(textArea({ label: 'Goal 3', section: 'plan', field: 'goal3', rows: 2 }));
  card.appendChild(subHead('Education and monitoring'));
  card.appendChild(textArea({ label: 'Education provided', section: 'plan', field: 'educationProvided', rows: 2 }));
  card.appendChild(textArea({ label: 'Resources given', section: 'plan', field: 'resourcesGiven', rows: 2 }));
  card.appendChild(textArea({ label: 'Monitoring indicators', section: 'plan', field: 'monitoringIndicators', rows: 2, placeholder: 'Weight, intake, or a biochemical marker.' }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Review interval', section: 'plan', field: 'reviewIntervalWeeks', type: 'number', min: 0, max: 260, unit: 'weeks' }),
    textInput({ label: 'Review date', section: 'plan', field: 'reviewDate', type: 'date' })
  ]));
  card.appendChild(textInput({ label: 'Onward referrals', section: 'plan', field: 'onwardReferral' }));
  card.appendChild(subHead('Dietitian override'));
  card.appendChild(note(
    'The override changes the composite risk category only. Safety flags are computed independently and are always printed, so an override cannot hide a hazard.'
  ));
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Override composite risk', section: 'plan', field: 'overrideCompositeRisk', options: OPTIONS.compositeRisk }),
    textInput({ label: 'Override reason', section: 'plan', field: 'overrideReason', hint: 'Mandatory when the override differs from the computed value.' })
  ]));
  card.appendChild(subHead('Sign-off'));
  card.appendChild(textArea({ label: 'Additional notes', section: 'plan', field: 'additionalNotes', rows: 3 }));
  card.appendChild(textInput({
    label: 'Signed by (registered dietitian)', section: 'plan', field: 'signedByName', required: true,
    hint: 'A registered dietitian must sign before the report is final.'
  }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7, renderStep8,
  renderStep9, renderStep10, renderStep11, renderStep12,
  renderStep13, renderStep14, renderStep15, renderStep16
];

// ----------------------------------------------------------------------
// Derived read-only fields (body mass index, weight-loss percentage)
// ----------------------------------------------------------------------

function updateDerived() {
  const preview = calculateNutritionRisk(state);
  const bmiEl = document.getElementById('anthropometry-derivedBmi');
  if (bmiEl) {
    bmiEl.value = preview.bmi === null
      ? (state.anthropometry.measurementMethod === 'declined'
          ? 'Estimated from mid-upper-arm circumference'
          : '—')
      : `${preview.bmi} kg/m²`;
  }
  const wlEl = document.getElementById('anthropometry-derivedWeightLoss');
  if (wlEl) {
    wlEl.value = preview.weightLossPercent === null
      ? '—'
      : `${preview.weightLossPercent}%`;
  }
}

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
  ['dietitian', 'dietitianName'], ['dietitian', 'role'], ['dietitian', 'assessmentDate'],
  ['patient', 'firstName'], ['patient', 'lastName'], ['patient', 'birthDate'], ['patient', 'referralReason'],
  ['history', 'conditionDiabetes'], ['history', 'pregnancyStatus'],
  ['medication', 'takesPrescriptionMedicines'], ['medication', 'takesOralNutritionalSupplements'],
  ['anthropometry', 'measurementMethod'], ['anthropometry', 'weightAsKg'], ['anthropometry', 'usualWeightAsKg'],
  ['biochemistry', 'bloodsSampleDate'],
  ['physicalExam', 'muscleWastingSeverity'], ['physicalExam', 'subcutaneousFatLoss'],
  ['dietaryRecall', 'appetite'], ['dietaryRecall', 'proportionOfUsualIntakePercent'],
  ['hydration', 'fluidIntakeMlPerDay'],
  ['preferences', 'hasFoodAllergy'], ['preferences', 'dietaryPattern'],
  ['gastrointestinal', 'dysphagia'], ['gastrointestinal', 'appetiteChange'],
  ['environment', 'livingSituation'], ['environment', 'cookingSkills'],
  ['activity', 'activityLevel'], ['activity', 'mobility'],
  ['behavioural', 'stageOfChange'], ['behavioural', 'patientGoalInOwnWords'],
  ['screening', 'acutelyIll'], ['screening', 'energyRequirementKcal'], ['screening', 'pesProblem'],
  ['plan', 'interventionType'], ['plan', 'goal1'], ['plan', 'signedByName']
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
  { step: 1,  section: 'dietitian',        title: 'Dietitian' },
  { step: 2,  section: 'patient',          title: 'Patient' },
  { step: 3,  section: 'history',          title: 'History' },
  { step: 4,  section: 'medication',       title: 'Medicines' },
  { step: 5,  section: 'anthropometry',    title: 'Measurements' },
  { step: 6,  section: 'biochemistry',     title: 'Bloods' },
  { step: 7,  section: 'physicalExam',     title: 'Examination' },
  { step: 8,  section: 'dietaryRecall',    title: 'Dietary recall' },
  { step: 9,  section: 'hydration',        title: 'Fluids' },
  { step: 10, section: 'preferences',      title: 'Preferences' },
  { step: 11, section: 'gastrointestinal', title: 'Gut' },
  { step: 12, section: 'environment',      title: 'Environment' },
  { step: 13, section: 'activity',         title: 'Activity' },
  { step: 14, section: 'behavioural',      title: 'Readiness' },
  { step: 15, section: 'screening',        title: 'Diagnosis' },
  { step: 16, section: 'plan',             title: 'Care plan' }
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

  // A dietitian override without a reason is not auditable, so it is an error.
  const override = state.plan.overrideCompositeRisk;
  if (override && !String(state.plan.overrideReason || '').trim()) {
    const preview = calculateNutritionRisk({
      ...state,
      plan: { ...state.plan, overrideCompositeRisk: '' }
    });
    if (override !== preview.computedCompositeRisk) {
      const id = 'plan-overrideReason';
      const message = 'An override reason is required when the final risk differs from the computed risk';
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

  const overrideBlock = r.finalCompositeRisk !== r.computedCompositeRisk
    ? `
      <div class="alert" data-type="warning" role="alert">
        <strong>Dietitian override.</strong>
        Computed risk was <strong>${esc(titleCase(r.computedCompositeRisk))}</strong>;
        the dietitian recorded <strong>${esc(titleCase(r.finalCompositeRisk))}</strong>.
        Reason: ${esc(r.overrideReason || 'not stated')}.
        Safety flags below are unaffected by the override.
      </div>
    `
    : '';

  const estimatedBlock = r.mustIsEstimated
    ? `
      <div class="alert" data-type="info" role="alert">
        <strong>This MUST score is an estimate.</strong>
        One or more components was derived from mid-upper-arm circumference,
        the subjective weight-loss criterion, or an adjusted weight. Treat the
        risk category as indicative and repeat the screen when a measured
        height and weight are available.
      </div>
    `
    : '';

  const pes = [state.screening.pesProblem, state.screening.pesEtiology, state.screening.pesSignsSymptoms];
  const pesBlock = pes.some((p) => String(p || '').trim())
    ? `
      <h3>Nutrition and dietetic diagnosis</h3>
      <p class="pes-statement">
        <strong>${esc(state.screening.pesProblem || '—')}</strong>
        related to ${esc(state.screening.pesEtiology || '—')}
        as evidenced by ${esc(state.screening.pesSignsSymptoms || '—')}.
      </p>
    `
    : '';

  out.innerHTML = `
    <h2>Dietetic Assessment Report</h2>
    <p class="muted">
      Generated ${esc(new Date(r.timestamp).toLocaleString())} ·
      ${esc(`${state.patient.firstName} ${state.patient.lastName}`.trim() || 'Patient not named')} ·
      Assessed by ${esc(state.dietitian.dietitianName || '—')}
    </p>

    ${estimatedBlock}
    ${overrideBlock}

    <div class="recommendation-banner">
      <span class="band-badge band-${esc(r.finalCompositeRisk)}">${esc(labelFor(COMPOSITE_RISK_LABELS, r.finalCompositeRisk))}</span>
      <span class="band-badge rec-${esc(r.recommendation)}">${esc(labelFor(RECOMMENDATION_LABELS, r.recommendation))}</span>
    </div>

    <h3>MUST — Malnutrition Universal Screening Tool</h3>
    <div class="axis-grid">
      <div class="axis-card">
        <span class="axis-name">Step 1 · Body mass index</span>
        <span class="axis-value"><strong>${r.mustBmiScore}</strong>${r.bmi === null ? '' : ` · ${r.bmi} kg/m²`}</span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Step 2 · Unplanned weight loss</span>
        <span class="axis-value"><strong>${r.mustWeightLossScore}</strong>${r.weightLossPercent === null ? '' : ` · ${r.weightLossPercent}%`}</span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Step 3 · Acute disease effect</span>
        <span class="axis-value"><strong>${r.mustAcuteDiseaseScore}</strong></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">MUST total</span>
        <span class="axis-value">
          <strong>${r.mustScore}</strong> of 6 ·
          <span class="band-badge must-${esc(r.mustRisk)}">${esc(labelFor(MUST_RISK_LABELS, r.mustRisk))}</span>
        </span>
      </div>
    </div>

    <h3>Secondary instruments</h3>
    <div class="axis-grid">
      <div class="axis-card">
        <span class="axis-name">GLIM</span>
        <span class="axis-value">${esc(labelFor(GLIM_DIAGNOSIS_LABELS, r.glimDiagnosis || 'none'))}</span>
        <span class="axis-detail">Phenotypic: ${esc(r.glimPhenotypicCriteria.join(', ') || 'none')} · Etiologic: ${esc(r.glimEtiologicCriteria.join(', ') || 'none')}</span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Refeeding-syndrome risk</span>
        <span class="axis-value"><span class="band-badge refeed-${esc(r.refeedingRisk)}">${esc(titleCase(r.refeedingRisk))}</span></span>
      </div>
      <div class="axis-card">
        <span class="axis-name">NRS-2002</span>
        <span class="axis-value"><strong>${r.nrs2002Score === null ? '—' : r.nrs2002Score}</strong>${r.nrs2002Score === null ? '' : ' of 7'}</span>
      </div>
      <div class="axis-card">
        <span class="axis-name">SARC-F</span>
        <span class="axis-value"><strong>${r.sarcfScore === null ? '—' : r.sarcfScore}</strong>${r.sarcfScore === null ? '' : ' of 10'}</span>
      </div>
      <div class="axis-card">
        <span class="axis-name">SCOFF</span>
        <span class="axis-value"><strong>${r.scoffScore === null ? '—' : r.scoffScore}</strong>${r.scoffScore === null ? '' : ' of 5'}</span>
      </div>
      <div class="axis-card">
        <span class="axis-name">Estimated requirements</span>
        <span class="axis-value">${r.energyRequirementKcal === null ? '—' : `${r.energyRequirementKcal} kcal`}${r.proteinRequirementG === null ? '' : ` · ${r.proteinRequirementG} g protein`}</span>
      </div>
    </div>

    ${pesBlock}

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

/** Download the assessment and its grading as a JSON file. */
function exportJson() {
  const payload = JSON.stringify({ assessment: state, grading: lastResult }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dietic-assessment.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const result = calculateNutritionRisk(state);
  lastResult = { ...result, timestamp: new Date().toISOString() };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh assessment?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the dietetic report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateDerived();
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
  for (const r of STEP_RENDERERS) host.appendChild(r());
}

function init() {
  renderStepList();
  renderForm();
  updateDerived();
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
