import { calculateCOPM } from './copm-grader.js';
import { copmActivities, copmImportanceOptions, copmSatisfactionOptions, copmScoreOptions, difficultyOptions } from './copm-rules.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { copmCategoryClass, copmPerformanceCategory, difficultyLabel, emptyAssessment } from './types.js';

// Occupational Therapy Assessment - patient wizard (vanilla JavaScript,
// no build).
//
// Single-page continuous wizard: every section is rendered into the page
// in document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure COPM scoring engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'occupational-therapy-assessment.front-end-form-with-html.v1';

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
      fresh[key] = mergeDeep(fresh[key], parsed[key]);
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

function mergeDeep(base, override) {
  const out = Array.isArray(base) ? base.slice() : { ...base };
  for (const k of Object.keys(override)) {
    if (
      override[k] && typeof override[k] === 'object' && !Array.isArray(override[k]) &&
      base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])
    ) {
      out[k] = mergeDeep(base[k], override[k]);
    } else {
      out[k] = override[k];
    }
  }
  return out;
}

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

let state = loadState();
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'occupational-therapy-assessment',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const rep = document.getElementById('report');
    if (rep) rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/** Resolve a dotted path like 'selfCareActivities.personalCare.difficulty'. */
function getPath(obj, path) {
  return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}
function setPath(obj, path, value) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}

function setField(path, value) {
  setPath(state, path, value);
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
// Component builders
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
  const value = getPath(state, opts.path);
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
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
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
    setField(opts.path, v);
    clearFieldError(id);
  });
  return wrapper;
}

function textArea(opts) {
  const id = `f-${opts.path.replace(/\./g, '-')}`;
  const value = getPath(state, opts.path) ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const reqAttrs = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"${reqAttrs}
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      aria-describedby="${id}-error"
      class="text-area-input">${esc(value)}</textarea>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => { setField(opts.path, ta.value); clearFieldError(id); });
  return wrapper;
}

function selectInput(opts) {
  const id = `f-${opts.path.replace(/\./g, '-')}`;
  const current = getPath(state, opts.path);
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) => {
      const selected = String(o.value) === String(current ?? '') ? ' selected' : '';
      return `<option value="${esc(o.value)}"${selected}>${esc(o.label)}</option>`;
    })
  ].join('');

  const reqAttrs = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    <select id="${id}" name="${id}" class="select"${reqAttrs} aria-describedby="${id}-error">
      ${optionsHtml}
    </select>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => {
    const v = sel.value;
    if (v === '') {
      setField(opts.path, opts.numeric ? null : '');
    } else {
      setField(opts.path, opts.numeric ? Number(v) : v);
    }
    clearFieldError(id);
  });
  return wrapper;
}

function radioGroup(opts) {
  const groupId = `f-${opts.path.replace(/\./g, '-')}`;
  const current = getPath(state, opts.path);
  const wrapper = document.createElement('fieldset');
  wrapper.className = 'field';
  wrapper.id = `${groupId}-fieldset`;

  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  if (opts.required) {
    const req = document.createElement('span');
    req.className = 'req';
    req.setAttribute('aria-hidden', 'true');
    req.textContent = ' *';
    legend.appendChild(req);
  }
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
    const requiredAttr = opts.required ? ' data-required' : '';
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}${requiredAttr}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        setField(opts.path, option.value);
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
    `<span class="section-step">Section ${opts.stepNumber} of 10</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

/** Sub-section panel with heading and optional hint. */
function subsectionPanel(title, hint) {
  const sub = document.createElement('div');
  sub.className = 'subsection';
  sub.innerHTML = `
    <h3>${esc(title)}</h3>
    ${hint ? `<p class="hint">${esc(hint)}</p>` : ''}
  `;
  return sub;
}

// ----------------------------------------------------------------------
// Section renderers (1-10)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic patient information.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', path: 'demographics.firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', path: 'demographics.lastName', required: true }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Date of Birth',
    path: 'demographics.dateOfBirth',
    type: 'date',
    required: true
  }));
  card.appendChild(radioGroup({
    label: 'Sex',
    path: 'demographics.sex',
    required: true,
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
    description: 'Details about the referral and primary diagnosis.'
  });

  card.appendChild(textInput({
    label: 'Referral Source',
    path: 'referralInfo.referralSource',
    placeholder: 'e.g., GP, Hospital, Self-referral',
    required: true
  }));
  card.appendChild(textArea({
    label: 'Reason for Referral',
    path: 'referralInfo.referralReason',
    placeholder: 'Describe the reason for occupational therapy referral…',
    rows: 3
  }));
  card.appendChild(textInput({
    label: 'Referring Clinician',
    path: 'referralInfo.referringClinician',
    placeholder: 'Name of referring clinician'
  }));
  card.appendChild(textInput({
    label: 'Referral Date',
    path: 'referralInfo.referralDate',
    type: 'date'
  }));
  card.appendChild(textInput({
    label: 'Primary Diagnosis',
    path: 'referralInfo.primaryDiagnosis',
    placeholder: 'e.g., Stroke, Hip fracture, Multiple sclerosis',
    required: true
  }));

  return card;
}

function difficultyArea(card, parentPath, label, hint) {
  const sub = subsectionPanel(label, hint);
  sub.appendChild(radioGroup({
    label: 'Level of difficulty',
    path: `${parentPath}.difficulty`,
    options: difficultyOptions,
    required: true
  }));
  sub.appendChild(textArea({
    label: 'Details',
    path: `${parentPath}.details`,
    placeholder: 'Describe any specific difficulties…',
    rows: 2
  }));
  card.appendChild(sub);
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Self-Care Activities',
    description: 'Assess your ability to perform daily self-care tasks.'
  });
  difficultyArea(card, 'selfCareActivities.personalCare',
    'Personal Care', 'Bathing, dressing, grooming, hygiene, feeding');
  difficultyArea(card, 'selfCareActivities.functionalMobility',
    'Functional Mobility', 'Transfers, indoor/outdoor mobility, stairs, transportation');
  difficultyArea(card, 'selfCareActivities.communityManagement',
    'Community Management', 'Shopping, finances, transportation, appointments');
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Productivity Activities',
    description: 'Assess your ability to perform work and productive tasks.'
  });
  difficultyArea(card, 'productivityActivities.paidWork',
    'Paid/Unpaid Work', 'Employment tasks, volunteer work, work responsibilities');
  difficultyArea(card, 'productivityActivities.householdManagement',
    'Household Management', 'Cleaning, laundry, cooking, home maintenance');
  difficultyArea(card, 'productivityActivities.education',
    'Education/Training', 'School, courses, professional development');
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Leisure Activities',
    description: 'Assess your ability to participate in leisure and social activities.'
  });
  difficultyArea(card, 'leisureActivities.quietRecreation',
    'Quiet Recreation', 'Reading, crafts, puzzles, watching TV, hobbies');
  difficultyArea(card, 'leisureActivities.activeRecreation',
    'Active Recreation', 'Sports, exercise, gardening, walking, physical activities');
  difficultyArea(card, 'leisureActivities.socialParticipation',
    'Social Participation', 'Visiting friends/family, community events, social gatherings');
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Performance Ratings',
    description: 'Rate how well you can perform each identified activity (COPM Performance Scale 1-10).'
  });

  const intro = document.createElement('p');
  intro.className = 'section-description';
  intro.style.marginBottom = '0.75rem';
  intro.textContent =
    'Identify up to 5 activities that are difficult for you. Rate the importance ' +
    'of each activity and how well you currently perform it on a scale of 1 (not ' +
    'able to do it) to 10 (able to do it extremely well).';
  card.appendChild(intro);

  for (let i = 1; i <= 5; i++) {
    const sub = subsectionPanel(`Activity ${i}`);
    sub.appendChild(textInput({
      label: 'Activity Name',
      path: `performanceRatings.activity${i}.name`,
      placeholder: 'e.g., Dressing, Cooking, Driving'
    }));
    const grid = document.createElement('div');
    grid.className = 'two-col';
    grid.appendChild(selectInput({
      label: 'Importance (1-10)',
      path: `performanceRatings.activity${i}.importance`,
      options: copmImportanceOptions,
      numeric: true
    }));
    grid.appendChild(selectInput({
      label: 'Performance Score (1-10)',
      path: `performanceRatings.activity${i}.performanceScore`,
      options: copmScoreOptions,
      numeric: true
    }));
    sub.appendChild(grid);
    card.appendChild(sub);
  }

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Satisfaction Ratings',
    description: 'Rate how satisfied you are with your performance in each activity (COPM Satisfaction Scale 1-10).'
  });

  const intro = document.createElement('p');
  intro.className = 'section-description';
  intro.style.marginBottom = '0.75rem';
  intro.textContent =
    'For each activity you identified, rate how satisfied you are with your ' +
    'current performance on a scale of 1 (not satisfied at all) to 10 ' +
    '(extremely satisfied).';
  card.appendChild(intro);

  for (let i = 1; i <= 5; i++) {
    const sub = subsectionPanel(`Activity ${i}`);
    sub.appendChild(textInput({
      label: 'Activity Name',
      path: `satisfactionRatings.activity${i}.name`,
      placeholder: 'e.g., Dressing, Cooking, Driving'
    }));
    sub.appendChild(selectInput({
      label: 'Satisfaction Score (1-10)',
      path: `satisfactionRatings.activity${i}.satisfactionScore`,
      options: copmSatisfactionOptions,
      numeric: true
    }));
    card.appendChild(sub);
  }

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Environmental Factors',
    description: 'Describe the environments where you live, work, and participate in the community.'
  });

  card.appendChild(textArea({
    label: 'Home Environment',
    path: 'environmentalFactors.homeEnvironment',
    placeholder: 'Describe your home setup, accessibility, any barriers or hazards (e.g., stairs, bathroom access, doorway width)…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Work/School Environment',
    path: 'environmentalFactors.workEnvironment',
    placeholder: 'Describe your workplace/school setup, accessibility, ergonomics…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Community Access',
    path: 'environmentalFactors.communityAccess',
    placeholder: 'Describe your access to community resources, transportation, shops, healthcare…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Assistive Devices',
    path: 'environmentalFactors.assistiveDevices',
    placeholder: 'List any assistive devices currently used or needed (e.g., wheelchair, walker, grab bars, shower chair)…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Social Support',
    path: 'environmentalFactors.socialSupport',
    placeholder: 'Describe available social support (family, friends, carers, community services)…',
    rows: 3
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Physical & Cognitive Status',
    description: 'Current physical and cognitive abilities relevant to occupational performance.'
  });

  card.appendChild(textArea({
    label: 'Upper Extremity Function',
    path: 'physicalCognitiveStatus.upperExtremity',
    placeholder: 'Describe upper extremity strength, range of motion, fine motor skills…',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Lower Extremity Function',
    path: 'physicalCognitiveStatus.lowerExtremity',
    placeholder: 'Describe lower extremity strength, range of motion, weight-bearing status…',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Coordination',
    path: 'physicalCognitiveStatus.coordination',
    placeholder: 'Describe gross and fine motor coordination, balance…',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Cognition',
    path: 'physicalCognitiveStatus.cognition',
    placeholder: 'Describe cognitive function: memory, attention, problem-solving, orientation…',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Vision',
    path: 'physicalCognitiveStatus.vision',
    placeholder: 'Describe visual function, any impairments, use of corrective lenses…',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Fatigue',
    path: 'physicalCognitiveStatus.fatigue',
    placeholder: 'Describe fatigue levels, impact on daily activities, patterns…',
    rows: 2
  }));
  card.appendChild(textArea({
    label: 'Pain',
    path: 'physicalCognitiveStatus.pain',
    placeholder: 'Describe pain: location, intensity, frequency, impact on function…',
    rows: 2
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Goals & Priorities',
    description: 'Identify your goals and priorities for occupational therapy intervention.'
  });

  card.appendChild(textArea({
    label: 'Short-Term Goals',
    path: 'goalsPriorities.shortTermGoals',
    placeholder: 'What would you like to achieve in the next 2-4 weeks? (e.g., Independent in dressing, Safe kitchen use)…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Long-Term Goals',
    path: 'goalsPriorities.longTermGoals',
    placeholder: 'What would you like to achieve in the next 3-6 months? (e.g., Return to work, Drive independently)…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Priority Areas',
    path: 'goalsPriorities.priorityAreas',
    placeholder: 'Which areas of daily life are most important for you to improve? (e.g., Self-care, Work, Leisure)…',
    rows: 3
  }));
  card.appendChild(textArea({
    label: 'Discharge Goals',
    path: 'goalsPriorities.dischargeGoals',
    placeholder: 'What would successful completion of OT look like for you? (e.g., Independent in all ADLs, Return to full community participation)…',
    rows: 3
  }));

  return card;
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_PATHS = [
  // Demographics (4)
  'demographics.firstName',
  'demographics.lastName',
  'demographics.dateOfBirth',
  'demographics.sex',
  // Referral info (5)
  'referralInfo.referralSource',
  'referralInfo.referralReason',
  'referralInfo.referringClinician',
  'referralInfo.referralDate',
  'referralInfo.primaryDiagnosis',
  // Self-care difficulty (3)
  'selfCareActivities.personalCare.difficulty',
  'selfCareActivities.functionalMobility.difficulty',
  'selfCareActivities.communityManagement.difficulty',
  // Productivity difficulty (3)
  'productivityActivities.paidWork.difficulty',
  'productivityActivities.householdManagement.difficulty',
  'productivityActivities.education.difficulty',
  // Leisure difficulty (3)
  'leisureActivities.quietRecreation.difficulty',
  'leisureActivities.activeRecreation.difficulty',
  'leisureActivities.socialParticipation.difficulty',
  // Performance ratings — performanceScore for 5 activities (5)
  'performanceRatings.activity1.performanceScore',
  'performanceRatings.activity2.performanceScore',
  'performanceRatings.activity3.performanceScore',
  'performanceRatings.activity4.performanceScore',
  'performanceRatings.activity5.performanceScore',
  // Satisfaction ratings (5)
  'satisfactionRatings.activity1.satisfactionScore',
  'satisfactionRatings.activity2.satisfactionScore',
  'satisfactionRatings.activity3.satisfactionScore',
  'satisfactionRatings.activity4.satisfactionScore',
  'satisfactionRatings.activity5.satisfactionScore',
  // Environmental factors (5)
  'environmentalFactors.homeEnvironment',
  'environmentalFactors.workEnvironment',
  'environmentalFactors.communityAccess',
  'environmentalFactors.assistiveDevices',
  'environmentalFactors.socialSupport',
  // Physical/cognitive (7)
  'physicalCognitiveStatus.upperExtremity',
  'physicalCognitiveStatus.lowerExtremity',
  'physicalCognitiveStatus.coordination',
  'physicalCognitiveStatus.cognition',
  'physicalCognitiveStatus.vision',
  'physicalCognitiveStatus.fatigue',
  'physicalCognitiveStatus.pain',
  // Goals (4)
  'goalsPriorities.shortTermGoals',
  'goalsPriorities.longTermGoals',
  'goalsPriorities.priorityAreas',
  'goalsPriorities.dischargeGoals'
];

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const p of TRACKED_PATHS) {
    const sectionKey = p.split('.')[0];
    sectionTotal[sectionKey] = (sectionTotal[sectionKey] || 0) + 1;
    const v = getPath(state, p);
    if (v !== null && v !== undefined && v !== '') {
      answered++;
      sectionAnswered[sectionKey] = (sectionAnswered[sectionKey] || 0) + 1;
    }
  }
  const total = TRACKED_PATHS.length;
  const percent = Math.round((answered / total) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(sectionAnswered, sectionTotal);
}

// ----------------------------------------------------------------------
// Step list
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1,  section: 'demographics',             title: 'Demographics' },
  { step: 2,  section: 'referralInfo',             title: 'Referral' },
  { step: 3,  section: 'selfCareActivities',       title: 'Self-Care' },
  { step: 4,  section: 'productivityActivities',   title: 'Productivity' },
  { step: 5,  section: 'leisureActivities',        title: 'Leisure' },
  { step: 6,  section: 'performanceRatings',       title: 'Performance' },
  { step: 7,  section: 'satisfactionRatings',      title: 'Satisfaction' },
  { step: 8,  section: 'environmentalFactors',     title: 'Environment' },
  { step: 9,  section: 'physicalCognitiveStatus',  title: 'Physical & Cognitive' },
  { step: 10, section: 'goalsPriorities',          title: 'Goals & Priorities' }
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
  if (input) input.setAttribute('aria-invalid', 'true');
}

function validateForm() {
  const errors = [];
  const form = document.getElementById('assessment-form');
  if (!form) return errors;
  const required = form.querySelectorAll('[data-required]');
  const seen = new Set();
  required.forEach((input) => {
    let id = input.id;
    if (input.type === 'radio') id = input.name;
    if (seen.has(id)) return;
    seen.add(id);
    let value = '';
    if (input.type === 'radio') {
      const chosen = form.querySelector(`input[name="${id}"]:checked`);
      value = chosen ? chosen.value : '';
    } else if (input.tagName === 'LABEL') {
      return;
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
    performanceScore,
    satisfactionScore,
    performanceCategoryLabel,
    satisfactionCategoryLabel,
    firedRules,
    additionalFlags,
    answeredPerformanceCount,
    answeredSatisfactionCount,
    timestamp
  } = lastResult;

  const flagsList = additionalFlags.length === 0
    ? `<p class="muted">No additional flags raised.</p>`
    : `
      <ul class="flags">
        ${additionalFlags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.message)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const firedRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.domain)}</td>
      <td>${esc(r.description)}</td>
      <td class="num">${r.score} / 10</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No COPM activities rated.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Domain</th>
            <th scope="col">Activity</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const perfClass = copmCategoryClass(performanceScore);
  const satClass = copmCategoryClass(satisfactionScore);

  out.innerHTML = `
    <h2>Occupational Therapy Assessment Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>COPM Performance Score</h3>
    <p class="copm-summary">
      <span class="copm-score-badge ${perfClass}">${performanceScore} / 10</span>
      <span class="copm-category">${esc(performanceCategoryLabel)}</span>
    </p>
    <p class="muted">Based on ${answeredPerformanceCount} of 5 performance activities rated.</p>

    <h3>COPM Satisfaction Score</h3>
    <p class="copm-summary">
      <span class="copm-score-badge ${satClass}">${satisfactionScore} / 10</span>
      <span class="copm-category">${esc(satisfactionCategoryLabel)}</span>
    </p>
    <p class="muted">Based on ${answeredSatisfactionCount} of 5 satisfaction activities rated.</p>

    <h3>Per-activity scores</h3>
    ${firedTable}

    <h3>Flagged Issues</h3>
    ${flagsList}

    <div class="report-actions">
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
}

function submitForm() {
  const errs = validateForm();
  if (errs.length > 0) return;
  const result = calculateCOPM(state);
  const additionalFlags = detectAdditionalFlags(state);

  let answeredPerformanceCount = 0;
  let answeredSatisfactionCount = 0;
  for (let i = 1; i <= 5; i++) {
    if (state.performanceRatings[`activity${i}`].performanceScore != null) {
      answeredPerformanceCount++;
    }
    if (state.satisfactionRatings[`activity${i}`].satisfactionScore != null) {
      answeredSatisfactionCount++;
    }
  }

  lastResult = {
    performanceScore: result.performanceScore,
    satisfactionScore: result.satisfactionScore,
    performanceCategoryLabel: result.performanceCategoryLabel,
    satisfactionCategoryLabel: result.satisfactionCategoryLabel,
    firedRules: result.firedRules,
    additionalFlags,
    answeredPerformanceCount,
    answeredSatisfactionCount,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh assessment?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const rep = document.getElementById('report');
  if (rep) rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
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

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
