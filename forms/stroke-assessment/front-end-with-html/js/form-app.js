import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateNIHSS } from './nihss-grader.js';
import { calculateAge, emptyAssessment, hoursFromOnset, nihssCategory, nihssCategoryClass } from './types.js';

// Stroke Assessment - patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every NIHSS section is rendered into the
// page in document order. The user scrolls through them; a sticky top-of-
// page progress summary reflects how many fields have been answered.
// Submission runs the pure NIHSS scoring engine and renders an inline
// report. State is persisted to localStorage so a partial fill survives a
// page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'stroke-assessment.front-end-form-with-html.v1';
const TOTAL_STEPS = 10;

/** @returns {import('./types.js').AssessmentData} */
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
      fresh[key] = { ...fresh[key], ...parsed[key] };
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

/** @param {import('./types.js').AssessmentData} state */
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

/** @type {import('./types.js').AssessmentData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'stroke-assessment',
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress and
 * conditional-section visibility after each change.
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

/**
 * Build a labelled text input.
 * @param {{ label: string, section: string, field: string, type?: string,
 *           placeholder?: string, required?: boolean }} opts
 */
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
    `value="${esc(value ?? '')}"`,
    `aria-describedby="${id}-error"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => {
    setField(opts.section, opts.field, input.value);
    clearFieldError(id);
  });
  return wrapper;
}

function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select"${requiredAttr} aria-describedby="${id}-error">
      ${optionsHtml}
    </select>
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => { setField(opts.section, opts.field, sel.value); clearFieldError(id); });
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
    const stored = opts.numeric ? Number(option.value) : option.value;
    const checked = current === stored ? ' checked' : '';
    const requiredAttr = opts.required ? ' data-required' : '';
    const label = document.createElement('label');
    label.htmlFor = radioId;
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}${requiredAttr}>
      <span>${esc(option.label)}</span>
    `;
    const input = label.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked) {
        setField(opts.section, opts.field, opts.numeric ? Number(option.value) : option.value);
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
    `<span class="section-step">Section ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Repeating-list editors (medications, allergies)
// ----------------------------------------------------------------------

/** Editor for the medications array on currentMedications. */
function medicationListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.currentMedications.medications;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No medications added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row med-row';
      r.innerHTML = `
        <div class="list-grid med-grid">
          <label class="list-cell">
            <span>Name</span>
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Aspirin">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 75 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. OD, BD">
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove medication">&times;</button>
        </div>
      `;
      r.querySelectorAll('input').forEach((inp) => {
        inp.addEventListener('input', () => {
          rows[idx][inp.dataset.key] = inp.value;
          saveState(state);
          updateProgress();
        });
      });
      r.querySelector('button').addEventListener('click', () => {
        rows.splice(idx, 1);
        saveState(state);
        rerender();
        updateProgress();
      });
      wrapper.appendChild(r);
    });
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'button';
    addBtn.setAttribute('data-variant', 'add');
    addBtn.textContent = '+ Add medication';
    addBtn.addEventListener('click', () => {
      rows.push({ name: '', dose: '', frequency: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

/** Editor for the allergies array on currentMedications. */
function allergyListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.currentMedications.allergies;
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No allergies added.';
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row allergy-row';
      r.innerHTML = `
        <div class="list-grid allergy-grid">
          <label class="list-cell">
            <span>Allergen</span>
            <input type="text" class="text-input" data-key="allergen" value="${esc(row.allergen)}" placeholder="e.g. Penicillin">
          </label>
          <label class="list-cell">
            <span>Reaction</span>
            <input type="text" class="text-input" data-key="reaction" value="${esc(row.reaction)}" placeholder="e.g. Rash, swelling">
          </label>
          <label class="list-cell">
            <span>Severity</span>
            <select class="select" data-key="severity">
              <option value="">— Select —</option>
              <option value="mild"${row.severity === 'mild' ? ' selected' : ''}>Mild</option>
              <option value="moderate"${row.severity === 'moderate' ? ' selected' : ''}>Moderate</option>
              <option value="anaphylaxis"${row.severity === 'anaphylaxis' ? ' selected' : ''}>Anaphylaxis</option>
            </select>
          </label>
          <button type="button" class="button" data-variant="icon" aria-label="Remove allergy">&times;</button>
        </div>
      `;
      r.querySelectorAll('input, select').forEach((inp) => {
        const handler = () => {
          rows[idx][inp.dataset.key] = inp.value;
          saveState(state);
          updateProgress();
        };
        inp.addEventListener('input', handler);
        inp.addEventListener('change', handler);
      });
      r.querySelector('button').addEventListener('click', () => {
        rows.splice(idx, 1);
        saveState(state);
        rerender();
        updateProgress();
      });
      wrapper.appendChild(r);
    });
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'button';
    addBtn.setAttribute('data-variant', 'add');
    addBtn.textContent = '+ Add allergy';
    addBtn.addEventListener('click', () => {
      rows.push({ allergen: '', reaction: '', severity: '' });
      saveState(state);
      rerender();
      updateProgress();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

// ----------------------------------------------------------------------
// Section renderers (1 per NIHSS step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Demographics',
    description: 'Basic patient information.'
  });

  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'First Name', section: 'demographics', field: 'firstName', required: true }));
  grid.appendChild(textInput({ label: 'Last Name', section: 'demographics', field: 'lastName', required: true }));
  card.appendChild(grid);

  card.appendChild(textInput({
    label: 'Date of Birth',
    section: 'demographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  card.appendChild(radioGroup({
    label: 'Sex',
    section: 'demographics', field: 'sex',
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
    title: 'Symptom Onset',
    description: 'Time and manner of symptom presentation. Onset time drives thrombolysis eligibility.'
  });

  card.appendChild(textInput({
    label: 'Symptom Onset Time',
    section: 'symptomOnset', field: 'onsetTime',
    type: 'datetime-local', required: true
  }));
  card.appendChild(textInput({
    label: 'Last Known Well',
    section: 'symptomOnset', field: 'lastKnownWell',
    type: 'datetime-local'
  }));

  card.appendChild(radioGroup({
    label: 'Symptom Progression',
    section: 'symptomOnset', field: 'symptomProgression',
    required: true,
    options: [
      { value: 'sudden', label: 'Sudden' },
      { value: 'gradual', label: 'Gradual' },
      { value: 'fluctuating', label: 'Fluctuating' },
      { value: 'improving', label: 'Improving' }
    ]
  }));

  card.appendChild(selectInput({
    label: 'Mode of Arrival',
    section: 'symptomOnset', field: 'modeOfArrival',
    required: true,
    options: [
      { value: 'ambulance', label: 'Ambulance' },
      { value: 'private-vehicle', label: 'Private Vehicle' },
      { value: 'walk-in', label: 'Walk-in' },
      { value: 'transfer', label: 'Hospital Transfer' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Level of Consciousness',
    description: 'NIHSS Items 1a, 1b, 1c.'
  });

  card.appendChild(radioGroup({
    label: '1a. Level of Consciousness',
    section: 'levelOfConsciousness', field: 'loc',
    numeric: true, required: true,
    options: [
      { value: '0', label: '0 — Alert; keenly responsive' },
      { value: '1', label: '1 — Not alert; arousable by minor stimulation' },
      { value: '2', label: '2 — Not alert; requires repeated stimulation' },
      { value: '3', label: '3 — Unresponsive or responds only with reflex' }
    ]
  }));

  card.appendChild(radioGroup({
    label: '1b. LOC Questions (month, age)',
    section: 'levelOfConsciousness', field: 'locQuestions',
    numeric: true, required: true,
    options: [
      { value: '0', label: '0 — Answers both correctly' },
      { value: '1', label: '1 — Answers one correctly' },
      { value: '2', label: '2 — Answers neither correctly' }
    ]
  }));

  card.appendChild(radioGroup({
    label: '1c. LOC Commands (open/close eyes, grip/release)',
    section: 'levelOfConsciousness', field: 'locCommands',
    numeric: true, required: true,
    options: [
      { value: '0', label: '0 — Performs both tasks correctly' },
      { value: '1', label: '1 — Performs one task correctly' },
      { value: '2', label: '2 — Performs neither task correctly' }
    ]
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Best Gaze & Visual',
    description: 'NIHSS Items 2 and 3.'
  });

  card.appendChild(radioGroup({
    label: '2. Best Gaze (horizontal eye movements)',
    section: 'bestGazeVisual', field: 'bestGaze',
    numeric: true, required: true,
    options: [
      { value: '0', label: '0 — Normal' },
      { value: '1', label: '1 — Partial gaze palsy' },
      { value: '2', label: '2 — Forced deviation or total gaze paresis' }
    ]
  }));

  card.appendChild(radioGroup({
    label: '3. Visual Fields',
    section: 'bestGazeVisual', field: 'visual',
    numeric: true, required: true,
    options: [
      { value: '0', label: '0 — No visual loss' },
      { value: '1', label: '1 — Partial hemianopia' },
      { value: '2', label: '2 — Complete hemianopia' },
      { value: '3', label: '3 — Bilateral hemianopia (blind)' }
    ]
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Facial Palsy & Motor',
    description: 'NIHSS Items 4, 5a, 5b, 6a, 6b.'
  });

  card.appendChild(radioGroup({
    label: '4. Facial Palsy',
    section: 'facialPalsy', field: 'facialPalsy',
    numeric: true, required: true,
    options: [
      { value: '0', label: '0 — Normal symmetrical movements' },
      { value: '1', label: '1 — Minor paralysis (flattened nasolabial fold)' },
      { value: '2', label: '2 — Partial paralysis (lower face)' },
      { value: '3', label: '3 — Complete paralysis (upper and lower face)' }
    ]
  }));

  const armOpts = [
    { value: '0', label: '0 — No drift; holds limb for full 10 seconds' },
    { value: '1', label: '1 — Drift; holds limb but drifts before 10 seconds' },
    { value: '2', label: '2 — Some effort against gravity' },
    { value: '3', label: '3 — No effort against gravity; limb falls' },
    { value: '4', label: '4 — No movement' }
  ];
  const legOpts = [
    { value: '0', label: '0 — No drift; holds limb for full 5 seconds' },
    { value: '1', label: '1 — Drift; holds limb but drifts before 5 seconds' },
    { value: '2', label: '2 — Some effort against gravity' },
    { value: '3', label: '3 — No effort against gravity; limb falls' },
    { value: '4', label: '4 — No movement' }
  ];

  card.appendChild(radioGroup({
    label: '5a. Motor Arm — Left (hold at 90 degrees for 10 seconds)',
    section: 'facialPalsy', field: 'leftArm',
    numeric: true, required: true, options: armOpts
  }));
  card.appendChild(radioGroup({
    label: '5b. Motor Arm — Right (hold at 90 degrees for 10 seconds)',
    section: 'facialPalsy', field: 'rightArm',
    numeric: true, required: true, options: armOpts
  }));
  card.appendChild(radioGroup({
    label: '6a. Motor Leg — Left (hold at 30 degrees for 5 seconds)',
    section: 'facialPalsy', field: 'leftLeg',
    numeric: true, required: true, options: legOpts
  }));
  card.appendChild(radioGroup({
    label: '6b. Motor Leg — Right (hold at 30 degrees for 5 seconds)',
    section: 'facialPalsy', field: 'rightLeg',
    numeric: true, required: true, options: legOpts
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Limb Ataxia & Sensory',
    description: 'NIHSS Items 7 and 8.'
  });

  card.appendChild(radioGroup({
    label: '7. Limb Ataxia (finger-nose-finger, heel-shin)',
    section: 'limbAtaxiaSensory', field: 'limbAtaxia',
    numeric: true, required: true,
    options: [
      { value: '0', label: '0 — Absent' },
      { value: '1', label: '1 — Present in one limb' },
      { value: '2', label: '2 — Present in two or more limbs' }
    ]
  }));

  card.appendChild(radioGroup({
    label: '8. Sensory (pinprick test)',
    section: 'limbAtaxiaSensory', field: 'sensory',
    numeric: true, required: true,
    options: [
      { value: '0', label: '0 — Normal; no sensory loss' },
      { value: '1', label: '1 — Mild-to-moderate sensory loss' },
      { value: '2', label: '2 — Severe or total sensory loss' }
    ]
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Language & Dysarthria',
    description: 'NIHSS Items 9 and 10.'
  });

  card.appendChild(radioGroup({
    label: '9. Best Language',
    section: 'languageDysarthria', field: 'bestLanguage',
    numeric: true, required: true,
    options: [
      { value: '0', label: '0 — No aphasia; normal' },
      { value: '1', label: '1 — Mild-to-moderate aphasia' },
      { value: '2', label: '2 — Severe aphasia' },
      { value: '3', label: '3 — Mute, global aphasia, no usable speech' }
    ]
  }));

  card.appendChild(radioGroup({
    label: '10. Dysarthria',
    section: 'languageDysarthria', field: 'dysarthria',
    numeric: true, required: true,
    options: [
      { value: '0', label: '0 — Normal' },
      { value: '1', label: '1 — Mild-to-moderate slurring' },
      { value: '2', label: '2 — Near unintelligible or worse' }
    ]
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Extinction & Inattention',
    description: 'NIHSS Item 11 (formerly Neglect).'
  });

  card.appendChild(radioGroup({
    label: '11. Extinction and Inattention',
    section: 'extinctionInattention', field: 'extinctionInattention',
    numeric: true, required: true,
    options: [
      { value: '0', label: '0 — No abnormality' },
      { value: '1', label: '1 — Visual, tactile, auditory, or spatial inattention to one modality' },
      { value: '2', label: '2 — Profound hemi-inattention or extinction to more than one modality' }
    ]
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Risk Factors',
    description: 'Known stroke risk factors.'
  });

  card.appendChild(radioGroup({ label: 'Hypertension', section: 'riskFactors', field: 'hypertension', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Diabetes', section: 'riskFactors', field: 'diabetes', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Atrial Fibrillation', section: 'riskFactors', field: 'atrialFibrillation', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Previous Stroke or TIA', section: 'riskFactors', field: 'previousStroke', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Current Smoker', section: 'riskFactors', field: 'smoking', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Hyperlipidemia', section: 'riskFactors', field: 'hyperlipidemia', options: yesNo }));
  card.appendChild(radioGroup({ label: 'Family History of Stroke', section: 'riskFactors', field: 'familyHistory', options: yesNo }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Current Medications',
    description: 'List all current medications and document allergies. Anticoagulants and antiplatelets are critical for thrombolysis decisions.'
  });

  const medsHeader = document.createElement('div');
  medsHeader.className = 'list-section-header';
  medsHeader.innerHTML = '<h3>Current medications</h3>';
  card.appendChild(medsHeader);
  card.appendChild(medicationListEditor());

  card.appendChild(radioGroup({
    label: 'Currently taking anticoagulants?',
    section: 'currentMedications', field: 'anticoagulants', options: yesNo
  }));
  const anticoagDetails = document.createElement('div');
  anticoagDetails.dataset.conditional = 'currentMedications.anticoagulants=yes';
  anticoagDetails.appendChild(textInput({
    label: 'Anticoagulant details',
    section: 'currentMedications', field: 'anticoagulantDetails',
    placeholder: 'e.g. Warfarin, Apixaban, Rivaroxaban'
  }));
  card.appendChild(anticoagDetails);

  card.appendChild(radioGroup({
    label: 'Currently taking antiplatelets?',
    section: 'currentMedications', field: 'antiplatelets', options: yesNo
  }));
  const antiplateletDetails = document.createElement('div');
  antiplateletDetails.dataset.conditional = 'currentMedications.antiplatelets=yes';
  antiplateletDetails.appendChild(textInput({
    label: 'Antiplatelet details',
    section: 'currentMedications', field: 'antiplateletDetails',
    placeholder: 'e.g. Aspirin, Clopidogrel'
  }));
  card.appendChild(antiplateletDetails);

  const allHeader = document.createElement('div');
  allHeader.className = 'list-section-header';
  allHeader.innerHTML = '<h3>Known allergies</h3>';
  card.appendChild(allHeader);
  card.appendChild(allergyListEditor());

  return card;
}

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = state[section]?.[field];
    host.style.display = String(current) === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Demographics
  ['demographics', 'firstName'],
  ['demographics', 'lastName'],
  ['demographics', 'dateOfBirth'],
  ['demographics', 'sex'],
  // Symptom onset
  ['symptomOnset', 'onsetTime'],
  ['symptomOnset', 'lastKnownWell'],
  ['symptomOnset', 'symptomProgression'],
  ['symptomOnset', 'modeOfArrival'],
  // NIHSS items (15)
  ['levelOfConsciousness', 'loc'],
  ['levelOfConsciousness', 'locQuestions'],
  ['levelOfConsciousness', 'locCommands'],
  ['bestGazeVisual', 'bestGaze'],
  ['bestGazeVisual', 'visual'],
  ['facialPalsy', 'facialPalsy'],
  ['facialPalsy', 'leftArm'],
  ['facialPalsy', 'rightArm'],
  ['facialPalsy', 'leftLeg'],
  ['facialPalsy', 'rightLeg'],
  ['limbAtaxiaSensory', 'limbAtaxia'],
  ['limbAtaxiaSensory', 'sensory'],
  ['languageDysarthria', 'bestLanguage'],
  ['languageDysarthria', 'dysarthria'],
  ['extinctionInattention', 'extinctionInattention'],
  // Risk factors (7)
  ['riskFactors', 'hypertension'],
  ['riskFactors', 'diabetes'],
  ['riskFactors', 'atrialFibrillation'],
  ['riskFactors', 'previousStroke'],
  ['riskFactors', 'smoking'],
  ['riskFactors', 'hyperlipidemia'],
  ['riskFactors', 'familyHistory'],
  // Current medications meta (2 yes/no)
  ['currentMedications', 'anticoagulants'],
  ['currentMedications', 'antiplatelets']
];

function isAnswered(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v !== '';
  if (Array.isArray(v)) return v.length > 0;
  return true;
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
  { step: 1,  section: 'demographics',           title: 'Demographics' },
  { step: 2,  section: 'symptomOnset',           title: 'Symptom Onset' },
  { step: 3,  section: 'levelOfConsciousness',   title: 'Consciousness' },
  { step: 4,  section: 'bestGazeVisual',         title: 'Gaze & Visual' },
  { step: 5,  section: 'facialPalsy',            title: 'Facial Palsy & Motor' },
  { step: 6,  section: 'limbAtaxiaSensory',      title: 'Limb Ataxia & Sensory' },
  { step: 7,  section: 'languageDysarthria',     title: 'Language & Dysarthria' },
  { step: 8,  section: 'extinctionInattention',  title: 'Extinction & Inattention' },
  { step: 9,  section: 'riskFactors',            title: 'Risk Factors' },
  { step: 10, section: 'currentMedications',     title: 'Medications' }
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
    case 'urgent': return 'flag-urgent';
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

  const { nihssScore, nihssCategory: catLabel, firedRules, additionalFlags, timestamp } = lastResult;
  const badgeClass = nihssCategoryClass(nihssScore);

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
      <td class="num">${r.score}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No NIHSS items contributed a non-zero score.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Domain</th>
            <th scope="col">Item</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const onsetHours = hoursFromOnset(state.symptomOnset.onsetTime);
  const onsetLine = onsetHours !== null
    ? `<p class="muted">Onset: ${onsetHours.toFixed(1)} hours ago.</p>`
    : '';

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Stroke Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>NIHSS Total Score</h3>
      <p class="nihss-summary">
        <span class="nihss-score-badge ${badgeClass}">${nihssScore} / 42</span>
        <span class="nihss-level">${esc(catLabel)}</span>
      </p>
      ${onsetLine}

      <h3>Contributing items</h3>
      ${firedTable}

      <h3>Flagged Issues</h3>
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
  const errs = validateForm();
  if (errs.length > 0) return;
  const { nihssScore, nihssCategoryLabel, firedRules } = calculateNIHSS(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    nihssScore,
    nihssCategory: nihssCategoryLabel,
    firedRules,
    additionalFlags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh assessment?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
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
  host.appendChild(renderStep7());
  host.appendChild(renderStep8());
  host.appendChild(renderStep9());
  host.appendChild(renderStep10());
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
