import { detectFlaggedIssues } from './flags.js';
import { gradePartogram } from './grader.js';
import { CONTRACTION_STRENGTHS, DIPSTICK_GRADES, DURATION_BANDS, LIQUOR_STATES, MOULDING_GRADES, contractionStrengthLabel, dipstickLabel, durationBandLabel, emptyObservation, emptyRecord, liquorStateLabel, mouldingLabel, priorityLabel, progressClass, progressLabel } from './types.js';

// Partogram — labour-record wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every step is rendered into the page in
// document order. The recorder scrolls through them; a sticky top-of-page
// progress summary reflects how many fields have been answered and a live
// readout updates the labour-progress classification, latest dilatation,
// elapsed hours, and the alert / action line expectations as observation rows
// are added. Step 4 hosts a dynamic, repeating one-to-many observation list
// (add / remove rows) that mirrors the child table `partogram_observation`.
// Submission runs the pure engine (line geometry, progress classification,
// fired lines, flagged issues) and renders an inline report. State is persisted
// to localStorage so a partial fill survives a page reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'partogram.front-end-with-html.v1';

/** @returns {import('./types.js').PartogramRecord} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyRecord();

  for (const key of Object.keys(fresh)) {
    if (key === 'observations') continue;
    if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null) {
      fresh[key] = { ...fresh[key], ...parsed[key] };
    }
  }
  // Rehydrate the observation list, merging each row over a fresh empty so
  // any newly-added observation fields default correctly.
  if (parsed && Array.isArray(parsed.observations)) {
    fresh.observations = parsed.observations.map((o) => ({ ...emptyObservation(), ...o }));
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyRecord();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved record; starting fresh.', e);
    return emptyRecord();
  }
}

/** @param {import('./types.js').PartogramRecord} s */
function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save record to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored record.', e);
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

/** @type {import('./types.js').PartogramRecord} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'partogram',
  hadDraftAtLoad,
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
    refreshLiveSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const TOTAL_STEPS = 5;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist. Re-runs progress and the
 * live readout after each change.
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  refreshLiveSummary();
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
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    ${opts.hint ? `<span class="hint" id="${id}-hint">${esc(opts.hint)}</span>` : ''}
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      ${opts.required ? 'data-required' : ''}
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

  const optionsHtml = [
    `<option value="">— Select —</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current) ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');

  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
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
// Repeating-list editor (observations) — the one-to-many child list
// ----------------------------------------------------------------------

/** Build one option-list HTML string, marking the current value selected. */
function optionListHtml(values, labelFn, current, placeholder) {
  return [
    `<option value="">${esc(placeholder || '—')}</option>`,
    ...values.map((v) =>
      `<option value="${esc(v)}"${String(v) === String(current ?? '') ? ' selected' : ''}>${esc(labelFn(v))}</option>`
    )
  ].join('');
}

/** Render a numeric <input> value: '' for null/undefined. */
function numVal(v) {
  return v === null || v === undefined ? '' : esc(String(v));
}

/**
 * Editor for the repeating list of timed observation rows. Each observation
 * renders as a card of grouped fields (progress, contractions, fetal, liquor,
 * maternal vitals, urine, drugs) with a remove button; an "add" button appends
 * a fresh blank row. Every change writes straight into `state.observations[idx]`
 * and refreshes persistence, progress, and the live summary.
 *
 * @returns {HTMLElement}
 */
function observationEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  function rerender() {
    wrapper.innerHTML = '';

    if (!state.observations.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent =
        'No observations added yet. Add one row per timed set of intrapartum observations.';
      wrapper.appendChild(empty);
    }

    state.observations.forEach((row, idx) => {
      const card = document.createElement('div');
      card.className = 'list-row observation-row';
      card.innerHTML = `
        <div class="list-row-header">
          <h4>Observation ${idx + 1}</h4>
          <button type="button" class="button" data-variant="icon" data-action="remove" aria-label="Remove observation ${idx + 1}">&times;</button>
        </div>
        <div class="list-grid observation-grid">
          <label class="list-cell">
            <span>Time observed</span>
            <input type="datetime-local" class="date-input" data-key="observedAt" value="${esc(row.observedAt)}">
          </label>
          <label class="list-cell">
            <span>Cervical dilatation (cm)</span>
            <input type="number" class="number-input" data-key="cervicalDilatationCm" min="0" max="10" step="0.5" value="${numVal(row.cervicalDilatationCm)}" placeholder="0-10">
          </label>
          <label class="list-cell">
            <span>Descent (fifths)</span>
            <input type="number" class="number-input" data-key="descentFifths" min="0" max="5" step="1" value="${numVal(row.descentFifths)}" placeholder="5-0">
          </label>
          <label class="list-cell">
            <span>Contractions / 10 min</span>
            <input type="number" class="number-input" data-key="contractionsPer10Min" min="0" max="10" step="1" value="${numVal(row.contractionsPer10Min)}" placeholder="e.g. 3">
          </label>
          <label class="list-cell">
            <span>Contraction duration</span>
            <select class="select" data-key="contractionDurationBand">${optionListHtml(DURATION_BANDS, durationBandLabel, row.contractionDurationBand)}</select>
          </label>
          <label class="list-cell">
            <span>Contraction strength</span>
            <select class="select" data-key="contractionStrength">${optionListHtml(CONTRACTION_STRENGTHS, contractionStrengthLabel, row.contractionStrength)}</select>
          </label>
          <label class="list-cell">
            <span>Fetal heart rate (bpm)</span>
            <input type="number" class="number-input" data-key="fetalHeartRate" min="0" max="240" step="1" value="${numVal(row.fetalHeartRate)}" placeholder="110-160">
          </label>
          <label class="list-cell">
            <span>Liquor</span>
            <select class="select" data-key="liquorState">${optionListHtml(LIQUOR_STATES, liquorStateLabel, row.liquorState)}</select>
          </label>
          <label class="list-cell">
            <span>Moulding</span>
            <select class="select" data-key="moulding">${optionListHtml(MOULDING_GRADES, mouldingLabel, row.moulding)}</select>
          </label>
          <label class="list-cell">
            <span>Systolic BP (mmHg)</span>
            <input type="number" class="number-input" data-key="systolicBloodPressure" min="0" max="300" step="1" value="${numVal(row.systolicBloodPressure)}" placeholder="e.g. 120">
          </label>
          <label class="list-cell">
            <span>Diastolic BP (mmHg)</span>
            <input type="number" class="number-input" data-key="diastolicBloodPressure" min="0" max="200" step="1" value="${numVal(row.diastolicBloodPressure)}" placeholder="e.g. 80">
          </label>
          <label class="list-cell">
            <span>Pulse (bpm)</span>
            <input type="number" class="number-input" data-key="pulse" min="0" max="240" step="1" value="${numVal(row.pulse)}" placeholder="e.g. 84">
          </label>
          <label class="list-cell">
            <span>Temperature (°C)</span>
            <input type="number" class="number-input" data-key="temperature" min="30" max="45" step="0.1" value="${numVal(row.temperature)}" placeholder="e.g. 36.8">
          </label>
          <label class="list-cell">
            <span>Urine volume (mL)</span>
            <input type="number" class="number-input" data-key="urineVolumeMl" min="0" step="1" value="${numVal(row.urineVolumeMl)}" placeholder="e.g. 200">
          </label>
          <label class="list-cell">
            <span>Urine protein</span>
            <select class="select" data-key="urineProtein">${optionListHtml(DIPSTICK_GRADES, dipstickLabel, row.urineProtein)}</select>
          </label>
          <label class="list-cell">
            <span>Urine ketones</span>
            <select class="select" data-key="urineKetones">${optionListHtml(DIPSTICK_GRADES, dipstickLabel, row.urineKetones)}</select>
          </label>
          <label class="list-cell">
            <span>Urine glucose</span>
            <select class="select" data-key="urineGlucose">${optionListHtml(DIPSTICK_GRADES, dipstickLabel, row.urineGlucose)}</select>
          </label>
          <label class="list-cell">
            <span>Oxytocin rate</span>
            <input type="number" class="number-input" data-key="oxytocinRate" min="0" step="0.1" value="${numVal(row.oxytocinRate)}" placeholder="drops/min or mU/min">
          </label>
          <label class="list-cell list-cell-wide">
            <span>Drugs and IV fluids</span>
            <input type="text" class="text-input" data-key="drugsAndFluids" value="${esc(row.drugsAndFluids)}" placeholder="e.g. Hartmann's 1 L, paracetamol 1 g">
          </label>
        </div>
      `;

      const NUMERIC_KEYS = new Set([
        'cervicalDilatationCm', 'descentFifths', 'contractionsPer10Min',
        'fetalHeartRate', 'systolicBloodPressure', 'diastolicBloodPressure',
        'pulse', 'temperature', 'urineVolumeMl', 'oxytocinRate'
      ]);

      card.querySelectorAll('input, select').forEach((inp) => {
        const handler = () => {
          const key = inp.dataset.key;
          let value = inp.value;
          if (NUMERIC_KEYS.has(key)) {
            value = value === '' ? null : Number(value);
          }
          state.observations[idx][key] = value;
          saveState(state);
          updateProgress();
          refreshLiveSummary();
        };
        inp.addEventListener('input', handler);
        inp.addEventListener('change', handler);
      });

      card.querySelector('[data-action="remove"]').addEventListener('click', () => {
        state.observations.splice(idx, 1);
        saveState(state);
        rerender();
        updateProgress();
        refreshLiveSummary();
      });

      wrapper.appendChild(card);
    });

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'button';
    addBtn.setAttribute('data-variant', 'add');
    addBtn.textContent = '+ Add observation';
    addBtn.addEventListener('click', () => {
      state.observations.push(emptyObservation());
      saveState(state);
      rerender();
      updateProgress();
      refreshLiveSummary();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

// ----------------------------------------------------------------------
// Section renderers (1 per step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Labour context',
    description: 'Who is recording, in which setting, and when the active phase began (cervical dilatation 4 cm) — the reference time for the alert and action lines.'
  });

  card.appendChild(textInput({
    label: 'Recording clinician name',
    section: 'context', field: 'clinicianName', required: true,
    placeholder: 'e.g. Priya Nair, midwife'
  }));
  card.appendChild(selectInput({
    label: 'Clinician role',
    section: 'context', field: 'clinicianRole', required: true,
    options: [
      { value: 'midwife', label: 'Midwife' },
      { value: 'obstetrician', label: 'Obstetrician' },
      { value: 'nurse', label: 'Nurse' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Care setting',
    section: 'context', field: 'careSetting',
    options: [
      { value: 'labour-ward', label: 'Labour ward' },
      { value: 'birth-centre', label: 'Birth centre' },
      { value: 'triage', label: 'Triage' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Active phase start (dilatation 4 cm)',
    section: 'context', field: 'activePhaseStartAt', type: 'datetime-local', required: true,
    hint: 'The reference time from which elapsed hours and the alert / action lines are computed.'
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Local identifier and admission context for the person in labour.'
  });

  card.appendChild(textInput({
    label: 'Patient identifier',
    section: 'patient', field: 'patientIdentifier', required: true,
    placeholder: 'e.g. LW-7 or hospital number'
  }));
  card.appendChild(selectInput({
    label: 'Age band',
    section: 'patient', field: 'ageBand',
    options: [
      { value: 'under-18', label: 'Under 18' },
      { value: '18-24', label: '18-24' },
      { value: '25-34', label: '25-34' },
      { value: '35-39', label: '35-39' },
      { value: '40-plus', label: '40+' }
    ]
  }));
  card.appendChild(selectInput({
    label: 'Parity',
    section: 'patient', field: 'parity',
    options: [
      { value: 'nulliparous', label: 'Nulliparous' },
      { value: 'multiparous', label: 'Multiparous' }
    ]
  }));
  card.appendChild(textInput({
    label: 'Gestation (completed weeks)',
    section: 'patient', field: 'gestationWeeks',
    type: 'number', min: 20, max: 45, step: 1,
    placeholder: 'e.g. 40'
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Admission findings',
    description: 'Membrane status on admission, noted risk factors, and the planned care.'
  });

  card.appendChild(selectInput({
    label: 'Membranes on admission',
    section: 'admission', field: 'membranesOnAdmission',
    options: [
      { value: 'intact', label: 'Intact' },
      { value: 'ruptured', label: 'Ruptured' }
    ]
  }));
  card.appendChild(textArea({
    label: 'Risk factors',
    section: 'admission', field: 'riskFactors',
    placeholder: 'e.g. previous caesarean, gestational diabetes, raised BMI.'
  }));
  card.appendChild(textArea({
    label: 'Planned care',
    section: 'admission', field: 'plannedCare',
    placeholder: 'e.g. continuous monitoring, mobilisation, review at next examination.'
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Observation series',
    description: 'One row per timed set of observations: dilatation, descent, contractions, fetal heart rate, liquor, moulding, maternal vitals, urine, and drugs / oxytocin.'
  });

  const host = document.createElement('div');
  host.className = 'field';
  host.appendChild(observationEditor());
  card.appendChild(host);

  card.appendChild(readOnlyReadout({
    label: 'Live labour-progress status',
    id: 'live-summary-readout',
    render: () => renderLiveSummary()
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Summary and progress',
    description: 'Live progress classification, reference-line expectations, and flagged issues. Submit to generate the full report.'
  });

  card.appendChild(readOnlyReadout({
    label: 'Labour-progress summary',
    id: 'live-summary-readout-2',
    render: () => renderLiveSummary()
  }));

  return card;
}

// ----------------------------------------------------------------------
// Live readouts
// ----------------------------------------------------------------------

/** Render the live labour-progress summary. */
function renderLiveSummary() {
  const g = gradePartogram(state);
  const flags = detectFlaggedIssues(state, g);
  const highCount = flags.filter((f) => f.priority === 'high').length;

  const badge = `<span class="risk-badge ${progressClass(g.progressClassification)}">${esc(progressLabel(g.progressClassification))}</span>`;
  const dil = g.latestDilatationCm === null
    ? '<span class="muted">no dilatation recorded</span>'
    : `<strong>${g.latestDilatationCm}</strong> cm`;
  const elapsed = g.elapsedHours === null
    ? '<span class="muted">—</span>'
    : `<strong>${g.elapsedHours.toFixed(1)}</strong> h`;
  const lines = g.alertLineExpectedCm === null
    ? '<span class="muted">not computable (dilatation or active-phase start missing)</span>'
    : `alert <strong>${g.alertLineExpectedCm.toFixed(1)}</strong> cm · action <strong>${g.actionLineExpectedCm.toFixed(1)}</strong> cm`;
  const flagText = flags.length === 0
    ? '<span class="muted">none</span>'
    : `<strong>${flags.length}</strong> (${highCount} high)`;

  return (
    `<div class="readout-line">Progress ${badge}</div>` +
    `<div class="readout-line">Latest dilatation ${dil} <span class="muted">at</span> ${elapsed} <span class="muted">elapsed</span></div>` +
    `<div class="readout-line">Reference lines ${lines}</div>` +
    `<div class="readout-line">Flagged issues ${flagText}</div>`
  );
}

function refreshLiveSummary() {
  ['live-summary-readout', 'live-summary-readout-2'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = renderLiveSummary();
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Each header section maps to one or more progress "slots"; a slot counts as
// answered when ANY of its fields is answered. The observation and summary
// steps are synthetic single-slot sections handled separately.
const STEP_SLOTS = {
  context: [['clinicianName'], ['clinicianRole'], ['careSetting'], ['activePhaseStartAt']],
  patient: [['patientIdentifier'], ['ageBand'], ['parity'], ['gestationWeeks']],
  admission: [['membranesOnAdmission'], ['riskFactors'], ['plannedCare']]
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

  // Observations: answered when at least one observation row exists.
  const observationsAnswered = state.observations.length > 0 ? 1 : 0;
  sectionTotal['observations'] = 1;
  sectionAnswered['observations'] = observationsAnswered;
  total += 1;
  answered += observationsAnswered;

  // Summary: answered when a plottable point exists (latest dilatation present).
  const g = gradePartogram(state);
  const summaryAnswered = g.latestDilatationCm !== null ? 1 : 0;
  sectionTotal['summary'] = 1;
  sectionAnswered['summary'] = summaryAnswered;
  total += 1;
  answered += summaryAnswered;

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

function fmtNum(v, suffix) {
  return v === null || v === undefined ? '—' : `${v}${suffix || ''}`;
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    activePhaseStartAt, latestDilatationCm, elapsedHours,
    alertLineExpectedCm, actionLineExpectedCm, progressClassification,
    firedLines, flaggedIssues, timestamp
  } = lastResult;

  const observationRows = state.observations.length === 0
    ? `<tr><td colspan="6" class="muted">No observations recorded.</td></tr>`
    : state.observations.map((o) => `
      <tr>
        <th scope="row">${o.observedAt ? esc(new Date(o.observedAt).toLocaleString()) : '—'}</th>
        <td class="num">${fmtNum(o.cervicalDilatationCm, ' cm')}</td>
        <td class="num">${fmtNum(o.descentFifths, '/5')}</td>
        <td class="num">${fmtNum(o.fetalHeartRate, ' bpm')}</td>
        <td>${esc(liquorStateLabel(o.liquorState) || '—')}</td>
        <td class="num">${o.systolicBloodPressure === null || o.diastolicBloodPressure === null ? (fmtNum(o.systolicBloodPressure) === '—' && fmtNum(o.diastolicBloodPressure) === '—' ? '—' : `${fmtNum(o.systolicBloodPressure)}/${fmtNum(o.diastolicBloodPressure)}`) : `${o.systolicBloodPressure}/${o.diastolicBloodPressure}`}</td>
      </tr>
    `).join('');

  const firedLinesList = firedLines.length === 0
    ? `<p class="muted">Neither reference line crossed.</p>`
    : `<ul class="flags">${firedLines.map((l) => `<li class="flag-medium"><span class="flag-category">${esc(l.id)}</span><span class="flag-message">${esc(l.description)}</span></li>`).join('')}</ul>`;

  const flagsList = flaggedIssues.length === 0
    ? `<p class="muted">No safety flags raised.</p>`
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

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Partogram Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <div class="risk-banner ${progressClass(progressClassification)}">
        <div>
          <span class="risk-banner-label">Labour progress</span>
          <span class="risk-banner-value">${esc(progressLabel(progressClassification))}</span>
        </div>
        <span class="risk-badge ${progressClass(progressClassification)}">${latestDilatationCm === null ? '—' : `${latestDilatationCm} cm`}</span>
      </div>

      <h3>Progress against the reference lines</h3>
      <table class="subscales">
        <tbody>
          <tr><th scope="row">Active phase started</th><td>${activePhaseStartAt ? esc(new Date(activePhaseStartAt).toLocaleString()) : '—'}</td></tr>
          <tr><th scope="row">Latest dilatation</th><td>${latestDilatationCm === null ? '—' : `${latestDilatationCm} cm`}</td></tr>
          <tr><th scope="row">Elapsed active labour</th><td>${elapsedHours === null ? '—' : `${elapsedHours.toFixed(1)} h`}</td></tr>
          <tr><th scope="row">Alert-line expectation</th><td>${alertLineExpectedCm === null ? '—' : `${alertLineExpectedCm.toFixed(1)} cm`}</td></tr>
          <tr><th scope="row">Action-line expectation</th><td>${actionLineExpectedCm === null ? '—' : `${actionLineExpectedCm.toFixed(1)} cm`}</td></tr>
        </tbody>
      </table>

      <h3>Reference lines crossed</h3>
      ${firedLinesList}

      <h3>Observations (${state.observations.length})</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Dilatation</th>
            <th scope="col">Descent</th>
            <th scope="col">FHR</th>
            <th scope="col">Liquor</th>
            <th scope="col">BP</th>
          </tr>
        </thead>
        <tbody>${observationRows}</tbody>
      </table>

      <h3>Safety flags (${flaggedIssues.length})</h3>
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
  const grade = gradePartogram(state);
  const flaggedIssues = detectFlaggedIssues(state, grade);
  lastResult = {
    ...grade,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh partogram?')) return;
  clearState();
  state = emptyRecord();
  lastResult = null;
  const _rep = document.getElementById('report');
  if (_rep) _rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  refreshLiveSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'context',      title: 'Context' },
  { step: 2, section: 'patient',      title: 'Patient' },
  { step: 3, section: 'admission',    title: 'Admission' },
  { step: 4, section: 'observations', title: 'Observations' },
  { step: 5, section: 'summary',      title: 'Summary' }
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
  refreshLiveSummary();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
