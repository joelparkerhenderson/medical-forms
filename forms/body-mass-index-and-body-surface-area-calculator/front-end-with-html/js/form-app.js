import { detectFlaggedIssues } from './flags.js';
import { calculateBmiBsa } from './grader.js';
import { bmiCategoryClass, bmiCategoryLabel, bsaFormulaLabel, emptyAssessment, priorityLabel } from './types.js';

// BMI and BSA Calculator — single-page wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The clinician scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// BMI + WHO category + BSA readout updates as the two measured inputs are
// entered. Submission runs the pure calculation engine (BMI, WHO category,
// Mosteller and Du Bois BSA, flagged issues) and renders an inline report.
// State is persisted to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY =
  'body-mass-index-and-body-surface-area-calculator.front-end-with-html.v1';

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
  slug: 'body-mass-index-and-body-surface-area-calculator',
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
    refreshLiveResult();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 5;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress,
 * conditional visibility, and the live-result readout after each change.
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
  refreshLiveResult();
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

/** Format a BMI number for display, or a dash when null. */
function fmtBmi(n) {
  return (n === null || n === undefined) ? '—' : `${n.toFixed(1)} kg/m²`;
}

/** Format a BSA number for display, or a dash when null. */
function fmtBsa(n) {
  return (n === null || n === undefined) ? '—' : `${n.toFixed(2)} m²`;
}

// ----------------------------------------------------------------------
// Component builders
// ----------------------------------------------------------------------

/** Map an <input type=…> to its Lily class name. */
function lilyInputClass(type) {
  switch (type) {
    case 'email':          return 'email-input';
    case 'number':         return 'number-input';
    case 'date':           return 'date-input';
    case 'datetime-local': return 'date-input';
    case 'time':           return 'time-input';
    case 'tel':            return 'tel-input';
    case 'url':            return 'url-input';
    case 'search':         return 'search-input';
    default:               return 'text-input';
  }
}

function textInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field];
  const labelText = esc(opts.label);
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
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
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
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      aria-describedby="${id}-error"
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
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const labelText = esc(opts.label);

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${labelText}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${opts.required ? ' required data-required' : ''}>
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

function readOnlyReadout(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field readout';
  wrapper.innerHTML = `
    <label class="label">${esc(opts.label)}</label>
    <div id="${opts.id}" class="readout-value">${opts.render()}</div>
  `;
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
    `<span class="section-step">Step ${opts.stepNumber} of ${TOTAL_STEPS}</span>` +
    `<span class="section-title">${esc(opts.title)}</span>` +
    desc;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Section renderers (1 per wizard step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Assessment context',
    description: 'Who is recording the measurement, when, where, and why.'
  });

  card.appendChild(textInput({
    label: 'Recording clinician name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. Dr A. Khan'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'doctor', label: 'Doctor' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'pharmacist', label: 'Pharmacist' },
      { value: 'dietitian', label: 'Dietitian' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Date and time of measurement',
    section: 'context', field: 'assessedAt', type: 'datetime-local'
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'careSetting', required: true,
    options: [
      { value: 'primary-care', label: 'Primary care' },
      { value: 'outpatient', label: 'Outpatient' },
      { value: 'inpatient', label: 'Inpatient' },
      { value: 'oncology', label: 'Oncology' },
      { value: 'pre-operative', label: 'Pre-operative' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Purpose',
    section: 'context', field: 'purpose', required: true,
    options: [
      { value: 'screening', label: 'Screening' },
      { value: 'drug-dosing', label: 'Drug dosing' },
      { value: 'monitoring', label: 'Monitoring' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier, age band, sex, and ancestry. The WHO categories assume adult physiology; ancestry drives the Asian lower-threshold action points.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'identification', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. GP-100482 or hospital MRN'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'identification', field: 'ageBand', required: true,
    options: [
      { value: '18-39', label: '18-39' },
      { value: '40-64', label: '40-64' },
      { value: '65-74', label: '65-74' },
      { value: '75-84', label: '75-84' },
      { value: '85-plus', label: '85 and over' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Sex',
    section: 'identification', field: 'sex', required: true,
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'intersex', label: 'Intersex' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Ancestry',
    section: 'identification', field: 'ancestry',
    hint: 'Asian ancestry adds lower BMI action points (≥ 23 increased risk, ≥ 27.5 high risk).',
    options: [
      { value: 'asian', label: 'Asian ancestry' },
      { value: 'other', label: 'Other ancestry' },
      { value: 'unspecified', label: 'Unspecified' }
    ]
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Height',
    description: 'Calculation input 1 — the measured height in centimetres.'
  });

  card.appendChild(textInput({
    label: 'Measured height',
    section: 'height', field: 'heightCm',
    type: 'number', min: 0, max: 300, step: 0.1, unit: 'cm',
    hint: 'Adult heights typically fall around 140–210 cm.'
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Weight',
    description: 'Calculation input 2 — the measured weight in kilograms.'
  });

  card.appendChild(textInput({
    label: 'Measured weight',
    section: 'weight', field: 'weightKg',
    type: 'number', min: 0, max: 500, step: 0.1, unit: 'kg',
    hint: 'Adult weights typically fall around 40–200 kg.'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Live BMI, category, and BSA',
    id: 'bmi-preview-readout',
    render: () => renderLiveResult()
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Summary and results',
    description: 'Computed BMI and WHO category, BSA (Mosteller and Du Bois), preferred formula, and a free-text clinical note. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'BMI, WHO category, and BSA',
    id: 'live-result-readout',
    render: () => renderLiveResult()
  }));

  card.appendChild(selectInput({
    label: 'Preferred BSA formula',
    section: 'results', field: 'bsaFormula',
    hint: 'Mosteller is the bedside default; Du Bois is the historical reference standard. Both values are always computed.',
    options: [
      { value: 'mosteller', label: 'Mosteller' },
      { value: 'du-bois', label: 'Du Bois' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Clinical note',
    section: 'results', field: 'clinicalNote',
    placeholder: 'Free-text clinical note: context, dosing calculation, and any action already taken.'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the live BMI value, WHO category badge, and both BSA values. */
function renderLiveResult() {
  const grade = calculateBmiBsa(state);
  const badge = grade.bmiCategory === ''
    ? `<span class="muted">${esc(bmiCategoryLabel(''))}</span>`
    : `<span class="risk-badge ${bmiCategoryClass(grade.bmiCategory)}">${esc(bmiCategoryLabel(grade.bmiCategory))}</span>`;
  const preferred = state.results.bsaFormula || 'mosteller';
  const bsa = preferred === 'du-bois'
    ? `BSA ${fmtBsa(grade.bsaDuBois)} (Du Bois)`
    : `BSA ${fmtBsa(grade.bsaMosteller)} (Mosteller)`;
  return `<strong>${fmtBmi(grade.bmi)}</strong> ${badge} <span class="muted">·</span> ${esc(bsa)}`;
}

function refreshLiveResult() {
  const preview = document.getElementById('bmi-preview-readout');
  if (preview) preview.innerHTML = renderLiveResult();
  const live = document.getElementById('live-result-readout');
  if (live) live.innerHTML = renderLiveResult();
}

// ----------------------------------------------------------------------
// Conditional sections (none currently, but kept for parity + future use)
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

// Each step maps to one or more progress "slots". A slot is a list of fields;
// the slot counts as answered when ANY of its fields is answered.
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['careSetting'], ['purpose']],
  identification: [['patientIdentifier'], ['ageBand'], ['sex']],
  height: [['heightCm']],
  weight: [['weightKg']],
  results: [['clinicalNote']]
};

function isAnswered(section, field) {
  const v = state[section][field];
  return v !== null && v !== undefined && v !== '';
}

function updateProgress() {
  let answered = 0;
  let total = 0;
  const sectionAnswered = {};
  const sectionTotal = {};

  for (const section of Object.keys(STEP_SLOTS)) {
    const slots = STEP_SLOTS[section];
    sectionTotal[section] = slots.length;
    sectionAnswered[section] = 0;
    for (const slot of slots) {
      total++;
      const slotAnswered = slot.some((field) => isAnswered(section, field));
      if (slotAnswered) {
        answered++;
        sectionAnswered[section]++;
      }
    }
  }

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
    bmi, bmiCategory, bsaMosteller, bsaDuBois, flaggedIssues, timestamp
  } = lastResult;

  const heightCm = state.height.heightCm;
  const weightKg = state.weight.weightKg;
  const preferred = state.results.bsaFormula || 'mosteller';

  const inputRows = [
    ['Height', heightCm === null ? 'Not recorded' : `${heightCm} cm`],
    ['Weight', weightKg === null ? 'Not recorded' : `${weightKg} kg`],
    ['BMI', fmtBmi(bmi)],
    ['WHO category', bmiCategoryLabel(bmiCategory)],
    ['BSA (Mosteller)', fmtBsa(bsaMosteller)],
    ['BSA (Du Bois)', fmtBsa(bsaDuBois)],
    ['Preferred formula', bsaFormulaLabel(preferred) || '—']
  ].map(([name, value]) => `
    <tr>
      <th scope="row">${esc(name)}</th>
      <td>${esc(value)}</td>
    </tr>
  `).join('');

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No red-flag issues raised.</p>`
    : `
      <ul class="flags">
        ${flaggedIssues.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(priorityLabel(f.priority))}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}${f.suggestedAction ? ` — ${esc(f.suggestedAction)}` : ''}</span>
          </li>
        `).join('')}
      </ul>
    `;

  let interpretation;
  switch (bmiCategory) {
    case 'underweight':
      interpretation = `<p>The BMI is <strong>below 18.5 kg/m²</strong> (underweight). Possible undernutrition; consider a nutritional assessment and investigate the cause. BMI is a screening prompt, not a diagnosis.</p>`;
      break;
    case 'normal':
      interpretation = `<p>The BMI is <strong>within the WHO normal range 18.5–24.9 kg/m²</strong>. Interpret in the clinical context; BMI does not distinguish muscle from fat.</p>`;
      break;
    case 'overweight':
      interpretation = `<p>The BMI is <strong>25.0–29.9 kg/m²</strong> (overweight, pre-obesity). Consider lifestyle advice and cardiometabolic risk assessment.</p>`;
      break;
    case 'obese-class-1':
      interpretation = `<p>The BMI is <strong>30.0–34.9 kg/m²</strong> (obese class I). Assess and manage obesity-related risk per local pathways.</p>`;
      break;
    case 'obese-class-2':
      interpretation = `<p>The BMI is <strong>35.0–39.9 kg/m²</strong> (obese class II). Assess obesity-related comorbidities and consider specialist input.</p>`;
      break;
    case 'obese-class-3':
      interpretation = `<p>The BMI is <strong>40.0 kg/m² or above</strong> (obese class III). Consider specialist weight-management referral and review comorbidities.</p>`;
      break;
    default:
      interpretation = `<p>The BMI could not be computed because a required input is missing or non-positive. Record both the height and the weight, then re-calculate.</p>`;
  }

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>BMI and BSA Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${bmiCategoryClass(bmiCategory)}">
        <div>
          <span class="risk-banner-label">Body mass index</span>
          <span class="risk-banner-value">${fmtBmi(bmi)}</span>
        </div>
        <span class="risk-badge ${bmiCategoryClass(bmiCategory)}">${esc(bmiCategoryLabel(bmiCategory))}</span>
      </div>

      <h3>Calculation</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>${inputRows}</tbody>
      </table>

      <h3>Interpretation</h3>
      ${interpretation}

      <h3>Flagged issues (${flaggedIssues.length})</h3>
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
  const _errors = validateForm();
  if (_errors.length > 0) return;
  const grade = calculateBmiBsa(state);
  const flaggedIssues = detectFlaggedIssues(state, grade.bmiRaw);
  lastResult = {
    bmi: grade.bmi,
    bmiRaw: grade.bmiRaw,
    bmiCategory: grade.bmiCategory,
    bsaMosteller: grade.bsaMosteller,
    bsaDuBois: grade.bsaDuBois,
    firedThresholds: grade.firedThresholds,
    flaggedIssues,
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
  refreshLiveResult();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',        title: 'Context' },
  { step: 2, section: 'identification', title: 'Patient' },
  { step: 3, section: 'height',         title: 'Height' },
  { step: 4, section: 'weight',         title: 'Weight' },
  { step: 5, section: 'results',        title: 'Results' }
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
  const required = form.querySelectorAll('input[data-required], select[data-required], textarea[data-required]');
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
}

function init() {
  renderStepList();
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveResult();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
