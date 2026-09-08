import { calculateASRS } from './asrs-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { adhdSubtypeLabel, asrsClassificationClass, asrsClassificationLabel, asrsFrequencyLabel, emptyAssessment } from './types.js';

// Attention Deficit Assessment — patient wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered. Submission
// runs the pure ASRS scoring engine and renders an inline report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'attention-deficit-assessment.front-end-form-with-html.v1';

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyAssessment();

  for (const key of Object.keys(fresh)) {
    if (Array.isArray(fresh[key])) {
      if (Array.isArray(parsed[key])) fresh[key] = parsed[key];
    } else if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null) {
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

let state = loadState();
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'attention-deficit-assessment',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    const report = document.getElementById('report');
    if (report) report.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
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

/** Set a deeply-nested field on the state and persist. */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
}

/** Set an ASRS frequency score, parsing the option value to a number. */
function setASRS(section, field, raw) {
  state[section][field] = raw === '' ? null : Number(raw);
  saveState(state);
  updateProgress();
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

function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const type = opts.type || 'text';
  const cls = (type === 'number') ? 'number-input'
    : (type === 'date') ? 'date-input'
    : (type === 'email') ? 'email-input'
    : (type === 'tel') ? 'tel-input'
    : (type === 'url') ? 'url-input'
    : (type === 'time') ? 'time-input'
    : 'text-input';
  const attrs = [
    `id="${id}"`,
    `name="${id}"`,
    `type="${type}"`,
    `class="${cls}"`,
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
    <label class="label" for="${id}">${labelText}</label>
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
  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      aria-describedby="${id}-error"${requiredAttr}
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
  const labelText = esc(opts.label) +
    (opts.required ? ' <span class="req" aria-hidden="true">*</span>' : '');
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  const requiredAttr = opts.required ? ' required data-required' : '';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${requiredAttr}>
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
        setField(opts.section, opts.field, option.value);
        clearFieldError(groupId);
      }
    });
    list.appendChild(label);
  }
  wrapper.appendChild(list);

  const errSpan = document.createElement('span');
  errSpan.className = 'error-message';
  errSpan.id = `${groupId}-error`;
  errSpan.setAttribute('aria-live', 'polite');
  wrapper.appendChild(errSpan);
  return wrapper;
}

/** ASRS frequency dropdown (Never .. Very Often). */
function frequencySelect(opts) {
  const id = `${opts.section}-${opts.field}`;
  const current = state[opts.section][opts.field];
  const currentStr = current == null ? '' : String(current);
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const options = [
    { value: '0', label: '0 - Never' },
    { value: '1', label: '1 - Rarely' },
    { value: '2', label: '2 - Sometimes' },
    { value: '3', label: '3 - Often' },
    { value: '4', label: '4 - Very Often' }
  ];
  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...options.map((o) =>
      `<option value="${o.value}"${o.value === currentStr ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <select id="${id}" name="${id}" class="select">${optionsHtml}</select>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => setASRS(opts.section, opts.field, sel.value));
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

// ----------------------------------------------------------------------
// Repeating-list editors (medications, allergies)
// ----------------------------------------------------------------------

function medicationListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.medications;
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
            <input type="text" class="text-input" data-key="name" value="${esc(row.name)}" placeholder="e.g. Methylphenidate">
          </label>
          <label class="list-cell">
            <span>Dose</span>
            <input type="text" class="text-input" data-key="dose" value="${esc(row.dose)}" placeholder="e.g. 20 mg">
          </label>
          <label class="list-cell">
            <span>Frequency</span>
            <input type="text" class="text-input" data-key="frequency" value="${esc(row.frequency)}" placeholder="e.g. BD">
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

function allergyListEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    const rows = state.allergies;
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
            <input type="text" class="text-input" data-key="reaction" value="${esc(row.reaction)}" placeholder="e.g. Rash">
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
// Section renderers (10 steps)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const impactOptions = [
  { value: 'none', label: 'None' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' }
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
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  }));

  card.appendChild(textInput({
    label: 'Occupation',
    section: 'demographics', field: 'occupation',
    placeholder: 'e.g. Software engineer'
  }));

  card.appendChild(selectInput({
    label: 'Highest level of education completed',
    section: 'demographics', field: 'educationLevel',
    options: [
      { value: 'none', label: 'None' },
      { value: 'secondary', label: 'Secondary' },
      { value: 'college', label: 'College' },
      { value: 'undergraduate', label: 'Undergraduate' },
      { value: 'postgraduate', label: 'Postgraduate' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'ASRS Part A Screener',
    description: 'Rate how often you have experienced each symptom over the past 6 months. These 6 questions are the ASRS v1.1 screener.'
  });

  const qs = [
    { field: 'focusDifficulty',        label: 'Q1. How often do you have difficulty concentrating on what people say to you, even when they are speaking directly?' },
    { field: 'organizationDifficulty', label: 'Q2. How often do you have difficulty organizing tasks and activities?' },
    { field: 'rememberingDifficulty',  label: 'Q3. How often do you have problems remembering appointments or obligations?' },
    { field: 'avoidingTasks',          label: 'Q4. When you have a task that requires sustained mental effort, how often do you avoid or delay starting it?' },
    { field: 'fidgeting',              label: 'Q5. How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?' },
    { field: 'overlyActive',           label: 'Q6. How often do you feel overly active or compelled to do things, as if driven by a motor?' }
  ];
  for (const q of qs) {
    card.appendChild(frequencySelect({ section: 'asrsPartA', field: q.field, label: q.label }));
  }
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'ASRS Part B',
    description: 'These 12 supplemental questions further explore inattentive and hyperactive-impulsive symptom patterns. Use the same 0-4 frequency scale.'
  });

  const qs = [
    { field: 'carelessMistakes',        label: 'Q7. How often do you make careless mistakes when you have to work on a boring or difficult project?' },
    { field: 'attentionDifficulty',     label: 'Q8. How often do you have difficulty keeping your attention when you are doing boring or repetitive work?' },
    { field: 'concentrationDifficulty', label: 'Q9. How often do you have difficulty concentrating on what people say to you, even in a one-on-one situation?' },
    { field: 'misplacingThings',        label: 'Q10. How often do you misplace or have difficulty finding things at home or at work?' },
    { field: 'distractedByNoise',       label: 'Q11. How often are you distracted by activity or noise around you?' },
    { field: 'leavingSeat',             label: 'Q12. How often do you leave your seat in meetings or other situations in which you are expected to remain seated?' },
    { field: 'restlessness',            label: 'Q13. How often do you feel restless or fidgety?' },
    { field: 'difficultyRelaxing',      label: 'Q14. How often do you have difficulty unwinding and relaxing when you have time to yourself?' },
    { field: 'talkingTooMuch',          label: 'Q15. How often do you find yourself talking too much when you are in social situations?' },
    { field: 'finishingSentences',      label: 'Q16. How often do you finish the sentences of people you are talking to before they can finish them themselves?' },
    { field: 'difficultyWaiting',       label: 'Q17. How often do you have difficulty waiting your turn in situations when turn-taking is required?' },
    { field: 'interruptingOthers',      label: 'Q18. How often do you interrupt others when they are busy?' }
  ];
  for (const q of qs) {
    card.appendChild(frequencySelect({ section: 'asrsPartB', field: q.field, label: q.label }));
  }
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Childhood History',
    description: 'DSM-5 requires several symptoms to have been present before age 12.'
  });

  card.appendChild(radioGroup({
    label: 'Did you experience attention or hyperactivity symptoms during childhood?',
    section: 'childhoodHistory', field: 'childhoodSymptoms', options: yesNo
  }));
  const symHost = document.createElement('div');
  symHost.dataset.conditional = 'childhoodHistory.childhoodSymptoms=yes';
  symHost.appendChild(textArea({
    label: 'Describe the childhood symptoms',
    section: 'childhoodHistory', field: 'childhoodSymptomsDetails',
    placeholder: 'e.g. trouble paying attention in class, frequently fidgeting…',
    rows: 3
  }));
  card.appendChild(symHost);

  card.appendChild(selectInput({
    label: 'How would you describe your school performance as a child?',
    section: 'childhoodHistory', field: 'schoolPerformance',
    options: [
      { value: 'above-average', label: 'Above average' },
      { value: 'average', label: 'Average' },
      { value: 'below-average', label: 'Below average' },
      { value: 'failing', label: 'Failing' }
    ]
  }));

  card.appendChild(radioGroup({
    label: 'Did you receive behavioural reports or disciplinary action during school?',
    section: 'childhoodHistory', field: 'behaviouralReports', options: yesNo
  }));
  const beHost = document.createElement('div');
  beHost.dataset.conditional = 'childhoodHistory.behaviouralReports=yes';
  beHost.appendChild(textArea({
    label: 'Describe the behavioural reports',
    section: 'childhoodHistory', field: 'behaviouralReportsDetails',
    rows: 3
  }));
  card.appendChild(beHost);

  card.appendChild(radioGroup({
    label: 'Were several of these symptoms present before age 12?',
    section: 'childhoodHistory', field: 'onsetBeforeAge12', options: yesNo
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Functional Impact',
    description: 'Rate how much these symptoms have affected each life domain over the past 6 months.'
  });

  card.appendChild(selectInput({
    label: 'Work or academic performance',
    section: 'functionalImpact', field: 'workAcademicImpact',
    options: impactOptions
  }));
  card.appendChild(selectInput({
    label: 'Relationships (family, friends, partner)',
    section: 'functionalImpact', field: 'relationshipImpact',
    options: impactOptions
  }));
  card.appendChild(selectInput({
    label: 'Daily living (chores, self-care, routines)',
    section: 'functionalImpact', field: 'dailyLivingImpact',
    options: impactOptions
  }));
  card.appendChild(selectInput({
    label: 'Financial management (bills, budgeting, impulsive spending)',
    section: 'functionalImpact', field: 'financialManagementImpact',
    options: impactOptions
  }));
  card.appendChild(selectInput({
    label: 'Time management (lateness, deadlines, planning)',
    section: 'functionalImpact', field: 'timeManagementImpact',
    options: impactOptions
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Comorbid Conditions',
    description: 'Other conditions that may overlap with or mimic ADHD.'
  });

  function yesNoBlock(label, field, detailField, detailLabel) {
    card.appendChild(radioGroup({ label, section: 'comorbidConditions', field, options: yesNo }));
    const host = document.createElement('div');
    host.dataset.conditional = `comorbidConditions.${field}=yes`;
    host.appendChild(textArea({
      label: detailLabel,
      section: 'comorbidConditions', field: detailField, rows: 2
    }));
    card.appendChild(host);
  }

  yesNoBlock('Do you have a history of anxiety?', 'anxiety', 'anxietyDetails', 'Anxiety details');
  yesNoBlock('Do you have a history of depression?', 'depression', 'depressionDetails', 'Depression details');
  yesNoBlock('Do you have a history of substance use issues?', 'substanceUse', 'substanceUseDetails', 'Substance use details');
  yesNoBlock('Do you have any sleep disorders?', 'sleepDisorders', 'sleepDisordersDetails', 'Sleep disorder details');
  yesNoBlock('Do you have a learning disability (e.g. dyslexia, dyscalculia)?', 'learningDisabilities', 'learningDisabilitiesDetails', 'Learning disability details');
  yesNoBlock('Are you on the autism spectrum or have an autism diagnosis?', 'autismSpectrum', 'autismSpectrumDetails', 'Autism details');

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Current Medications',
    description: 'List any medications you are currently taking (prescription or over-the-counter).'
  });
  card.appendChild(medicationListEditor());
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Allergies',
    description: 'Document drug, food, or environmental allergies.'
  });
  card.appendChild(allergyListEditor());
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Medical History',
    description: 'Conditions relevant to ADHD treatment safety, especially for stimulant therapy.'
  });

  function yesNoBlock(label, field, detailField, detailLabel) {
    card.appendChild(radioGroup({ label, section: 'medicalHistory', field, options: yesNo }));
    const host = document.createElement('div');
    host.dataset.conditional = `medicalHistory.${field}=yes`;
    host.appendChild(textArea({
      label: detailLabel,
      section: 'medicalHistory', field: detailField, rows: 2
    }));
    card.appendChild(host);
  }

  yesNoBlock('Do you have a history of cardiovascular issues (heart disease, arrhythmia, hypertension)?', 'cardiovascularIssues', 'cardiovascularDetails', 'Cardiovascular details');
  yesNoBlock('Do you have a history of seizures or epilepsy?', 'seizureHistory', 'seizureDetails', 'Seizure details');
  yesNoBlock('Do you have a tic disorder or Tourette syndrome?', 'ticDisorder', 'ticDetails', 'Tic disorder details');
  yesNoBlock('Do you have any thyroid disease?', 'thyroidDisease', 'thyroidDetails', 'Thyroid details');
  yesNoBlock('Have you had any significant head injuries?', 'headInjuries', 'headInjuryDetails', 'Head injury details');

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Social and Support',
    description: 'Family history, support systems, and any previous ADHD assessments or diagnoses.'
  });

  card.appendChild(radioGroup({
    label: 'Is there a family history of ADHD?',
    section: 'socialSupport', field: 'familyHistoryADHD', options: yesNo
  }));
  const famHost = document.createElement('div');
  famHost.dataset.conditional = 'socialSupport.familyHistoryADHD=yes';
  famHost.appendChild(textArea({
    label: 'Family history details (which relatives, diagnosis details)',
    section: 'socialSupport', field: 'familyHistoryDetails', rows: 2
  }));
  card.appendChild(famHost);

  card.appendChild(textArea({
    label: 'Support systems (family, friends, therapist, coach…)',
    section: 'socialSupport', field: 'supportSystems', rows: 3
  }));
  card.appendChild(textArea({
    label: 'Coping strategies you currently use',
    section: 'socialSupport', field: 'copingStrategies', rows: 3
  }));

  card.appendChild(radioGroup({
    label: 'Have you had previous psychological or neuropsychological assessments?',
    section: 'socialSupport', field: 'previousAssessments', options: yesNo
  }));
  const paHost = document.createElement('div');
  paHost.dataset.conditional = 'socialSupport.previousAssessments=yes';
  paHost.appendChild(textArea({
    label: 'Previous assessment details',
    section: 'socialSupport', field: 'previousAssessmentDetails', rows: 2
  }));
  card.appendChild(paHost);

  card.appendChild(radioGroup({
    label: 'Have you been diagnosed with ADHD before?',
    section: 'socialSupport', field: 'previousDiagnosis', options: yesNo
  }));
  const pdHost = document.createElement('div');
  pdHost.dataset.conditional = 'socialSupport.previousDiagnosis=yes';
  pdHost.appendChild(textArea({
    label: 'Previous diagnosis details (when, by whom, treatments tried)',
    section: 'socialSupport', field: 'previousDiagnosisDetails', rows: 2
  }));
  card.appendChild(pdHost);

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
  ['demographics', 'occupation'],
  ['demographics', 'educationLevel'],
  // ASRS Part A (6)
  ['asrsPartA', 'focusDifficulty'],
  ['asrsPartA', 'organizationDifficulty'],
  ['asrsPartA', 'rememberingDifficulty'],
  ['asrsPartA', 'avoidingTasks'],
  ['asrsPartA', 'fidgeting'],
  ['asrsPartA', 'overlyActive'],
  // ASRS Part B (12)
  ['asrsPartB', 'carelessMistakes'],
  ['asrsPartB', 'attentionDifficulty'],
  ['asrsPartB', 'concentrationDifficulty'],
  ['asrsPartB', 'misplacingThings'],
  ['asrsPartB', 'distractedByNoise'],
  ['asrsPartB', 'leavingSeat'],
  ['asrsPartB', 'restlessness'],
  ['asrsPartB', 'difficultyRelaxing'],
  ['asrsPartB', 'talkingTooMuch'],
  ['asrsPartB', 'finishingSentences'],
  ['asrsPartB', 'difficultyWaiting'],
  ['asrsPartB', 'interruptingOthers'],
  // Childhood
  ['childhoodHistory', 'childhoodSymptoms'],
  ['childhoodHistory', 'schoolPerformance'],
  ['childhoodHistory', 'behaviouralReports'],
  ['childhoodHistory', 'onsetBeforeAge12'],
  // Functional impact (5)
  ['functionalImpact', 'workAcademicImpact'],
  ['functionalImpact', 'relationshipImpact'],
  ['functionalImpact', 'dailyLivingImpact'],
  ['functionalImpact', 'financialManagementImpact'],
  ['functionalImpact', 'timeManagementImpact'],
  // Comorbid (6)
  ['comorbidConditions', 'anxiety'],
  ['comorbidConditions', 'depression'],
  ['comorbidConditions', 'substanceUse'],
  ['comorbidConditions', 'sleepDisorders'],
  ['comorbidConditions', 'learningDisabilities'],
  ['comorbidConditions', 'autismSpectrum'],
  // Medical history (5)
  ['medicalHistory', 'cardiovascularIssues'],
  ['medicalHistory', 'seizureHistory'],
  ['medicalHistory', 'ticDisorder'],
  ['medicalHistory', 'thyroidDisease'],
  ['medicalHistory', 'headInjuries'],
  // Social support
  ['socialSupport', 'familyHistoryADHD'],
  ['socialSupport', 'previousAssessments'],
  ['socialSupport', 'previousDiagnosis']
];

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    const v = state[section][field];
    if (v !== null && v !== undefined && v !== '') {
      answered++;
      sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
    }
  }
  const total = TRACKED_FIELDS.length;
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

// ----------------------------------------------------------------------
// Step-list + validation (Lily)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'demographics', title: 'Demographics' },
  { step: 2, section: 'asrsPartA', title: 'ASRS Part A Screener' },
  { step: 3, section: 'asrsPartB', title: 'ASRS Part B' },
  { step: 4, section: 'childhoodHistory', title: 'Childhood History' },
  { step: 5, section: 'functionalImpact', title: 'Functional Impact' },
  { step: 6, section: 'comorbidConditions', title: 'Comorbid Conditions' },
  { step: 7, section: 'medications', title: 'Current Medications' },
  { step: 8, section: 'allergies', title: 'Allergies' },
  { step: 9, section: 'medicalHistory', title: 'Medical History' },
  { step: 10, section: 'socialSupport', title: 'Social & Support' }
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
  const current = ol.querySelector('[data-step="' + firstUnfinished + '"]');
  if (current) {
    current.setAttribute('aria-current', 'step');
    if (current.dataset.status === 'waiting') {
      current.dataset.status = 'in-progress';
    }
  }
  ol.dataset.current = String(firstUnfinished - 1);
}

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

function validateForm() {
  const errors = [];
  const form = document.getElementById('assessment-form');
  if (!form) return errors;
  const required = form.querySelectorAll('[data-required]');
  const seenGroups = new Set();
  required.forEach((input) => {
    const id = input.id;
    if (input.type === 'radio') {
      const groupName = input.name;
      if (seenGroups.has(groupName)) return;
      seenGroups.add(groupName);
      const checked = form.querySelector('input[name="' + groupName + '"]:checked');
      const fsEl = document.getElementById(groupName + '-fieldset');
      const labelEl = fsEl ? fsEl.querySelector('legend') : null;
      const label = labelEl ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim() : groupName;
      if (!checked) {
        errors.push({ id: groupName, message: label + ' is required' });
        setFieldError(groupName, label + ' is required');
      } else {
        clearFieldError(groupName);
      }
      return;
    }
    const value = (input.value || '').trim();
    const labelEl = form.querySelector('label[for="' + id + '"]');
    const label = labelEl ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim() : id;
    if (!value) {
      errors.push({ id: id, message: label + ' is required' });
      setFieldError(id, label + ' is required');
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
      '<li><a href="#' + esc(e.id) + '">' + esc(e.message) + '</a></li>'
    ).join('') +
    '</ul>';
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (typeof summary.focus === 'function') {
    summary.setAttribute('tabindex', '-1');
    summary.focus({ preventScroll: true });
  }
}

function priorityClass(priority) {
  switch (priority) {
    case 'high': return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low': return 'flag-low';
    default: return '';
  }
}

function classificationClassFor(c) {
  switch (c) {
    case 'highly-likely': return 'flag-high';
    case 'likely': return 'flag-medium';
    case 'possible': return 'flag-low';
    default: return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    asrsTotal, partAScore, partBScore,
    inattentiveSubscore, hyperactiveImpulsiveSubscore,
    partAScreenerPositive, shadedCount,
    classification, subtype, firedRules,
    additionalFlags, timestamp
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

  const ruleRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.domain)}</td>
      <td>${esc(r.description)}</td>
      <td>${esc(asrsClassificationLabel(r.classification))}</td>
    </tr>
  `).join('');

  const ruleTable = firedRules.length === 0
    ? `<p class="muted">No ASRS rules fired.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Domain</th>
            <th scope="col">Description</th>
            <th scope="col">Classification</th>
          </tr>
        </thead>
        <tbody>${ruleRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Attention Deficit Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>ASRS Classification</h3>
      <p class="act-summary">
        <span class="act-score-badge ${asrsClassificationClass(classification)}">${esc(asrsClassificationLabel(classification))}</span>
        <span class="control-level">Subtype: ${esc(adhdSubtypeLabel(subtype))}</span>
      </p>
      <p class="muted">
        Part A screener: <strong>${partAScreenerPositive ? 'positive' : 'negative'}</strong>
        (${shadedCount} of 6 items in shaded range; threshold &gt;= 4).
      </p>

      <h3>Scores</h3>
      <table class="subscales">
        <thead>
          <tr><th>Score</th><th>Value</th></tr>
        </thead>
        <tbody>
          <tr><th scope="row">ASRS total</th><td>${asrsTotal} / 72</td></tr>
          <tr><th scope="row">Part A score</th><td>${partAScore} / 24</td></tr>
          <tr><th scope="row">Part B score</th><td>${partBScore} / 48</td></tr>
          <tr><th scope="row">Inattentive subscore</th><td>${inattentiveSubscore} / 32</td></tr>
          <tr><th scope="row">Hyperactive-impulsive subscore</th><td>${hyperactiveImpulsiveSubscore} / 40</td></tr>
        </tbody>
      </table>

      <h3>Fired ASRS Rules</h3>
      ${ruleTable}

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
  const errors = validateForm();
  if (errors.length > 0) return;
  const score = calculateASRS(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    ...score,
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
  const report = document.getElementById('report');
  if (report) report.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
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
