import { detectFlags } from './flags.js';
import { calculateGrade } from './grader.js';
import { emptyRequest, formatGestationalAge, scanTypeLabel } from './types.js';

// Pregnancy Ultrasound Test Request — clinician referral wizard (vanilla JS).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page progress
// summary reflects how many fields have been answered. Submission runs the
// pure four-axis grader and renders an inline vetting report. State is
// persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'pregnancy-ultrasound-test-request.front-end-form-with-html.v1';
const TOTAL_STEPS = 8;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyRequest();

  for (const key of Object.keys(fresh)) {
    const v = parsed && parsed[key];
    if (Array.isArray(fresh[key])) {
      fresh[key] = Array.isArray(v) ? v : [];
    } else if (v && typeof v === 'object') {
      fresh[key] = { ...fresh[key], ...v };
    }
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyRequest();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved request; starting fresh.', e);
    return emptyRequest();
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save request to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored request.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

let state = loadState();
/** @type {ReturnType<typeof calculateGrade> | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'pregnancy-ultrasound-test-request',
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the vetting report.</p>';
    renderErrorSummary([]);
    renderForm();
    updateProgress();
    updateConditionalSections();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
}

function setBool(section, field, checked) {
  state[section][field] = !!checked;
  saveState(state);
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

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <input ${attrs.join(' ')}>
    ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
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
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}">${labelText}</label>
    <select id="${id}" name="${id}" class="select"${opts.required ? ' data-required' : ''} aria-describedby="${id}-error">
      ${optionsHtml}
    </select>
    <span class="error-message" id="${id}-error"></span>
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
  legend.textContent = opts.label;
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
    label.innerHTML = `
      <input class="radio-input" type="radio" id="${radioId}" name="${groupId}" value="${esc(option.value)}"${checked}>
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
  wrapper.appendChild(errSpan);
  return wrapper;
}

/** Single boolean toggle (checkbox) bound to a boolean field. */
function boolField(opts) {
  const id = `${opts.section}-${opts.field}`;
  const checked = state[opts.section][opts.field] === true;
  const wrapper = document.createElement('div');
  wrapper.className = 'bool-field';
  wrapper.innerHTML = `
    <input type="checkbox" class="checkbox-input" id="${id}" name="${id}"${checked ? ' checked' : ''}>
    <label for="${id}">${esc(opts.label)}</label>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('change', () => {
    setBool(opts.section, opts.field, input.checked);
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

function grid(cols, children) {
  const g = document.createElement('div');
  g.className = cols;
  for (const c of children) g.appendChild(c);
  return g;
}

// ----------------------------------------------------------------------
// Option lists
// ----------------------------------------------------------------------

const SCAN_TYPE_OPTIONS = [
  { value: 'viability', label: 'Viability' },
  { value: 'dating', label: 'Dating' },
  { value: 'nuchal-translucency', label: 'Nuchal translucency / combined' },
  { value: 'anomaly', label: 'Anomaly (anatomy)' },
  { value: 'growth', label: 'Growth / wellbeing' },
  { value: 'doppler', label: 'Doppler surveillance' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'cervical-length', label: 'Cervical length' },
  { value: 'placental-location', label: 'Placental location' },
  { value: 'liquor-volume', label: 'Liquor volume' },
  { value: 'reassurance', label: 'Reassurance' },
  { value: 'other', label: 'Other' }
];

const INDICATION_OPTIONS = [
  { value: 'dating', label: 'Dating' },
  { value: 'viability', label: 'Viability' },
  { value: 'exclude-ectopic', label: 'Exclude ectopic' },
  { value: 'bleeding', label: 'Bleeding' },
  { value: 'pain', label: 'Pain' },
  { value: 'aneuploidy-screening', label: 'Aneuploidy screening' },
  { value: 'anomaly-screening', label: 'Anomaly screening' },
  { value: 'suspected-anomaly', label: 'Suspected anomaly' },
  { value: 'growth-restriction', label: 'Growth restriction' },
  { value: 'large-for-dates', label: 'Large for dates' },
  { value: 'reduced-fetal-movements', label: 'Reduced fetal movements' },
  { value: 'multiple-pregnancy', label: 'Multiple pregnancy' },
  { value: 'placental-location', label: 'Placental location' },
  { value: 'liquor-assessment', label: 'Liquor assessment' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'cervical-assessment', label: 'Cervical assessment' },
  { value: 'antepartum-haemorrhage', label: 'Antepartum haemorrhage' },
  { value: 'maternal-condition', label: 'Maternal condition' },
  { value: 'doppler-surveillance', label: 'Doppler surveillance' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'other', label: 'Other' }
];

const BLEEDING_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'heavy', label: 'Heavy' }
];

const PAIN_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' }
];

const URGENCY_OPTIONS = [
  { value: 'routine', label: 'Routine' },
  { value: 'soon', label: 'Soon' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergency', label: 'Emergency' }
];

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Requesting clinician',
    description: 'Identify the clinician making this referral.'
  });
  card.appendChild(textInput({ label: 'Clinician name', section: 'clinician', field: 'clinicianName', required: true }));
  card.appendChild(selectInput({
    label: 'Clinician role', section: 'clinician', field: 'clinicianRole',
    options: [
      { value: 'obstetrician', label: 'Obstetrician' },
      { value: 'midwife', label: 'Midwife' },
      { value: 'gp', label: 'GP' },
      { value: 'fetal-medicine-specialist', label: 'Fetal-medicine specialist' },
      { value: 'gynaecologist', label: 'Gynaecologist' },
      { value: 'sonographer', label: 'Sonographer' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(grid('two-col', [
    selectInput({
      label: 'Registration body', section: 'clinician', field: 'registrationBody',
      options: [
        { value: 'GMC', label: 'GMC' },
        { value: 'NMC', label: 'NMC' },
        { value: 'HCPC', label: 'HCPC' },
        { value: 'other', label: 'Other' }
      ]
    }),
    textInput({ label: 'Registration number', section: 'clinician', field: 'registrationNumber' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Requester contact (bleep / phone)', section: 'clinician', field: 'requesterContact' }),
    textInput({ label: 'Supervising consultant', section: 'clinician', field: 'supervisingConsultant' })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Site / clinic name', section: 'clinician', field: 'siteName' }),
    textInput({ label: 'Referral date', section: 'clinician', field: 'referralDate', type: 'date' })
  ]));
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Patient demographics and access needs.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'First name', section: 'patient', field: 'firstName', required: true }),
    textInput({ label: 'Last name', section: 'patient', field: 'lastName', required: true })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Date of birth', section: 'patient', field: 'dateOfBirth', type: 'date' }),
    textInput({ label: 'NHS number', section: 'patient', field: 'nhsNumber', placeholder: 'NNN NNN NNNN' })
  ]));
  card.appendChild(textInput({ label: 'Body mass index', section: 'patient', field: 'bodyMassIndex', type: 'number', min: 10, max: 80, step: 0.1, unit: 'kg/m²' }));
  card.appendChild(boolField({ label: 'Interpreter required', section: 'patient', field: 'interpreterRequired' }));
  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Pregnancy dating',
    description: 'LMP, EDD, and current gestational age — drives the window-fit axis.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'Last menstrual period (LMP)', section: 'dating', field: 'lastMenstrualPeriodDate', type: 'date' }),
    selectInput({
      label: 'LMP reliability', section: 'dating', field: 'lastMenstrualPeriodReliability',
      options: [
        { value: 'reliable', label: 'Reliable' },
        { value: 'uncertain', label: 'Uncertain' },
        { value: 'unknown', label: 'Unknown' }
      ]
    })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Estimated due date (EDD)', section: 'dating', field: 'estimatedDueDate', type: 'date' }),
    selectInput({
      label: 'EDD derivation method', section: 'dating', field: 'estimatedDueDateMethod',
      options: [
        { value: 'lmp', label: 'LMP' },
        { value: 'ultrasound', label: 'Ultrasound' },
        { value: 'ivf', label: 'IVF' },
        { value: 'unknown', label: 'Unknown' }
      ]
    })
  ]));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Gestational age (weeks)', section: 'dating', field: 'gestationalAgeWeeks', type: 'number', min: 0, max: 45, unit: 'weeks' }),
    textInput({ label: 'Gestational age (days)', section: 'dating', field: 'gestationalAgeDays', type: 'number', min: 0, max: 6, unit: 'days' })
  ]));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Obstetric history',
    description: 'Gravida / para, plurality, conception, and rhesus status.'
  });
  card.appendChild(grid('two-col', [
    textInput({ label: 'Gravida', section: 'history', field: 'gravida', type: 'number', min: 0, max: 30 }),
    textInput({ label: 'Para', section: 'history', field: 'para', type: 'number', min: 0, max: 30 })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({
      label: 'Plurality', section: 'history', field: 'plurality',
      options: [
        { value: 'singleton', label: 'Singleton' },
        { value: 'twin', label: 'Twin' },
        { value: 'triplet', label: 'Triplet' },
        { value: 'higher-order', label: 'Higher-order' },
        { value: 'unknown', label: 'Unknown' }
      ]
    }),
    selectInput({
      label: 'Chorionicity', section: 'history', field: 'chorionicity',
      options: [
        { value: 'dichorionic-diamniotic', label: 'Dichorionic diamniotic' },
        { value: 'monochorionic-diamniotic', label: 'Monochorionic diamniotic' },
        { value: 'monochorionic-monoamniotic', label: 'Monochorionic monoamniotic' },
        { value: 'not-applicable', label: 'Not applicable' },
        { value: 'unknown', label: 'Unknown' }
      ]
    })
  ]));
  card.appendChild(grid('two-col', [
    selectInput({
      label: 'Conception method', section: 'history', field: 'conceptionMethod',
      options: [
        { value: 'spontaneous', label: 'Spontaneous' },
        { value: 'ivf', label: 'IVF' },
        { value: 'iui', label: 'IUI' },
        { value: 'ovulation-induction', label: 'Ovulation induction' },
        { value: 'unknown', label: 'Unknown' }
      ]
    }),
    selectInput({
      label: 'Rhesus status', section: 'history', field: 'rhesusStatus',
      options: [
        { value: 'positive', label: 'Positive' },
        { value: 'negative', label: 'Negative' },
        { value: 'unknown', label: 'Unknown' }
      ]
    })
  ]));
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Requested examination',
    description: 'Scan type, indication, and the specific clinical question — the highest-value fields.'
  });
  card.appendChild(selectInput({
    label: 'Requested scan type', section: 'request', field: 'requestedScanType',
    options: SCAN_TYPE_OPTIONS, required: true
  }));
  card.appendChild(selectInput({
    label: 'Primary indication', section: 'request', field: 'primaryIndication',
    options: INDICATION_OPTIONS, required: true
  }));
  card.appendChild(textArea({
    label: 'Specific clinical question', section: 'request', field: 'clinicalQuestion',
    rows: 2, required: true,
    placeholder: 'e.g. Confirm intrauterine location and viability.'
  }));
  card.appendChild(textArea({ label: 'Relevant history', section: 'request', field: 'relevantHistory', rows: 2 }));
  card.appendChild(grid('two-col', [
    textInput({ label: 'Previous scan finding', section: 'request', field: 'previousScanFinding' }),
    textInput({ label: 'Previous scan date', section: 'request', field: 'previousScanDate', type: 'date' })
  ]));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Symptoms & red flags',
    description: 'Red flags auto-escalate the triage tier regardless of the other axes.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Vaginal bleeding', section: 'symptoms', field: 'vaginalBleeding', options: BLEEDING_OPTIONS }),
    selectInput({ label: 'Abdominal pain', section: 'symptoms', field: 'abdominalPain', options: PAIN_OPTIONS })
  ]));
  card.appendChild(subHead('Red flags'));
  card.appendChild(boolField({ label: 'Reduced fetal movements', section: 'symptoms', field: 'reducedFetalMovements' }));
  card.appendChild(boolField({ label: 'Suspected ectopic pregnancy', section: 'symptoms', field: 'suspectedEctopic' }));
  card.appendChild(boolField({ label: 'Haemodynamically unstable', section: 'symptoms', field: 'haemodynamicallyUnstable' }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Risk factors',
    description: 'Maternal and obstetric risk factors relevant to surveillance.'
  });
  card.appendChild(boolField({ label: 'Hypertension', section: 'riskFactors', field: 'hypertension' }));
  card.appendChild(boolField({ label: 'Diabetes', section: 'riskFactors', field: 'diabetes' }));
  card.appendChild(boolField({ label: 'Previous growth restriction (SGA / FGR)', section: 'riskFactors', field: 'previousGrowthRestriction' }));
  card.appendChild(boolField({ label: 'Previous preterm birth', section: 'riskFactors', field: 'previousPretermBirth' }));
  card.appendChild(boolField({ label: 'Previous caesarean section', section: 'riskFactors', field: 'previousCaesarean' }));
  card.appendChild(boolField({ label: 'Current smoker', section: 'riskFactors', field: 'smoker' }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Triage & submit',
    description: 'Requested urgency, setting, and notes. Submit to compute the four-axis grade and flags.'
  });
  card.appendChild(grid('two-col', [
    selectInput({ label: 'Requested urgency', section: 'triage', field: 'urgency', options: URGENCY_OPTIONS, required: true }),
    textInput({ label: 'Requested-by date', section: 'triage', field: 'requestedByDate', type: 'date' })
  ]));
  card.appendChild(selectInput({
    label: 'Care setting', section: 'triage', field: 'setting',
    options: [
      { value: 'outpatient', label: 'Outpatient' },
      { value: 'inpatient', label: 'Inpatient' },
      { value: 'community', label: 'Community' },
      { value: 'emergency', label: 'Emergency' }
    ]
  }));
  card.appendChild(textArea({ label: 'Notes', section: 'triage', field: 'notes', rows: 3 }));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7, renderStep8
];

// ----------------------------------------------------------------------
// Conditional sections (none currently, but keep the hook for parity)
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
  // 1 Clinician
  ['clinician', 'clinicianName'], ['clinician', 'clinicianRole'],
  ['clinician', 'referralDate'],
  // 2 Patient
  ['patient', 'firstName'], ['patient', 'lastName'],
  ['patient', 'dateOfBirth'], ['patient', 'nhsNumber'],
  // 3 Dating
  ['dating', 'gestationalAgeWeeks'], ['dating', 'lastMenstrualPeriodReliability'],
  ['dating', 'estimatedDueDateMethod'],
  // 4 History
  ['history', 'gravida'], ['history', 'para'],
  ['history', 'plurality'], ['history', 'rhesusStatus'],
  // 5 Request
  ['request', 'requestedScanType'], ['request', 'primaryIndication'],
  ['request', 'clinicalQuestion'],
  // 6 Symptoms
  ['symptoms', 'vaginalBleeding'], ['symptoms', 'abdominalPain'],
  // 8 Triage
  ['triage', 'urgency'], ['triage', 'setting']
];

// Boolean fields count as "answered" when true (red flags / risk factors).
const TRACKED_BOOLS = [
  ['symptoms', 'reducedFetalMovements'], ['symptoms', 'suspectedEctopic'],
  ['symptoms', 'haemodynamicallyUnstable']
];

const SECTION_BY_STEP = {
  1: 'clinician', 2: 'patient', 3: 'dating', 4: 'history',
  5: 'request', 6: 'symptoms', 7: 'riskFactors', 8: 'triage'
};

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
  { step: 1, section: 'clinician',   title: 'Clinician' },
  { step: 2, section: 'patient',     title: 'Patient' },
  { step: 3, section: 'dating',      title: 'Dating' },
  { step: 4, section: 'history',     title: 'History' },
  { step: 5, section: 'request',     title: 'Examination' },
  { step: 6, section: 'symptoms',    title: 'Symptoms' },
  { step: 7, section: 'riskFactors', title: 'Risk factors' },
  { step: 8, section: 'triage',      title: 'Triage' }
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
    // Risk factors has no tracked text fields; treat as informational.
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
  required.forEach((input) => {
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

  const {
    appropriatenessScore,
    appropriatenessBand,
    windowFit,
    recommendedScanType,
    completenessPercent,
    triageTier,
    targetTimeframe,
    recommendation,
    recommendationLabel,
    firedRules,
    flags,
    timestamp
  } = lastResult;

  const ga = formatGestationalAge(
    state.dating.gestationalAgeWeeks,
    state.dating.gestationalAgeDays
  );

  const windowValue = windowFit
    ? `<span class="band-badge window-${esc(windowFit)}">${esc(titleCase(windowFit))}</span>${
        windowFit === 'outside-window' && recommendedScanType
          ? ` <span class="muted">→ recommend ${esc(scanTypeLabel(recommendedScanType))}</span>`
          : ''
      }`
    : '<span class="muted">Not assessed</span>';

  const flagsList = flags.length === 0
    ? `<p class="muted">No safety flags raised.</p>`
    : `
      <ul class="flags">
        ${flags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}</span>
            <span class="flag-action">${esc(f.suggestedAction)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const firedRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.ruleId)}</th>
      <td>${esc(r.axis)}</td>
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No rules fired.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Rule</th>
            <th scope="col">Axis</th>
            <th scope="col">Category</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  out.innerHTML = `
    <h2>Ultrasound Request Vetting Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())} · Scan: ${esc(scanTypeLabel(state.request.requestedScanType) || '—')}${ga ? ` · GA ${esc(ga)}` : ''}</p>

    <div class="recommendation-banner">
      <span class="band-badge rec-${esc(recommendation)}">${esc(recommendationLabel)}</span>
      <span class="band-badge tier-${esc(triageTier)}">${esc(titleCase(triageTier))}${targetTimeframe ? ` · ${esc(targetTimeframe)}` : ''}</span>
    </div>

    <h3>Four-axis grade</h3>
    <div class="axis-grid">
      <div class="axis-card">
        <span class="axis-name">A · Appropriateness</span>
        <span class="axis-value">
          <span class="score-meter"><strong>${appropriatenessScore}</strong> / 9</span>
          <span class="band-badge band-${esc(appropriatenessBand)}">${esc(titleCase(appropriatenessBand))}</span>
        </span>
      </div>
      <div class="axis-card">
        <span class="axis-name">B · Gestational-age window</span>
        <span class="axis-value">${windowValue}</span>
      </div>
      <div class="axis-card">
        <span class="axis-name">C · Completeness</span>
        <span class="axis-value"><strong>${completenessPercent}%</strong></span>
        <div class="completeness-bar"><span style="width:${completenessPercent}%"></span></div>
      </div>
      <div class="axis-card">
        <span class="axis-name">D · Triage priority</span>
        <span class="axis-value"><span class="band-badge tier-${esc(triageTier)}">${esc(titleCase(triageTier))}</span></span>
      </div>
    </div>

    <h3>Fired rules</h3>
    ${firedTable}

    <h3>Safety flags</h3>
    ${flagsList}

    <div class="report-actions">
      <button type="button" id="print-btn" class="button" data-variant="secondary">Print / save PDF</button>
      <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('start-over-btn').addEventListener('click', startOver);
  document.getElementById('print-btn').addEventListener('click', () => window.print());
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  const result = calculateGrade(state);
  lastResult = {
    ...result,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh request?')) return;
  clearState();
  state = emptyRequest();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the vetting report.</p>';
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
  for (const r of STEP_RENDERERS) host.appendChild(r());
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
