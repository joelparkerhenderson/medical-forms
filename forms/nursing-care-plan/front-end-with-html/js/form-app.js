import { validate } from './grader.js';
import { classifyProblem, hasEvaluation, hasGoal, hasIntervention } from './rules.js';
import { ADL_CATEGORIES, LINKED_RISK_OPTIONS, MET_OPTIONS, adlCategoryLabel, completenessClass, completenessLabel, emptyGoal, emptyIntervention, emptyPlan, emptyProblem, riskLevelLabel } from './types.js';

// Nursing Care Plan — nurse wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. This is a MULTI-TABLE relational form — a parent care-plan
// record plus a repeating array of PROBLEM cards, each of which carries its
// own repeating GOAL and INTERVENTION rows and an inline evaluation (ADPIE).
// Submission runs the pure completeness engine (per-problem class, plan
// status, completeness percent, flagged issues) and renders an inline report.
// State is persisted to localStorage so a partial fill survives a reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'nursing-care-plan.front-end-with-html.v1';

/** @returns {import('./types.js').CarePlan} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyPlan();

  // Merge flat sections over the empty defaults.
  for (const key of Object.keys(fresh)) {
    if (key === 'problems') continue;
    if (parsed && typeof parsed[key] === 'object' && parsed[key] !== null) {
      fresh[key] = { ...fresh[key], ...parsed[key] };
    }
  }
  // Rehydrate the relational problems / goals / interventions arrays.
  if (parsed && Array.isArray(parsed.problems)) {
    fresh.problems = parsed.problems.map((p) => {
      const merged = { ...emptyProblem(), ...p };
      merged.goals = Array.isArray(p.goals)
        ? p.goals.map((g) => ({ ...emptyGoal(), ...g }))
        : [];
      merged.interventions = Array.isArray(p.interventions)
        ? p.interventions.map((i) => ({ ...emptyIntervention(), ...i }))
        : [];
      return merged;
    });
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyPlan();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved care plan; starting fresh.', e);
    return emptyPlan();
  }
}

/** @param {import('./types.js').CarePlan} s */
function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save care plan to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored care plan.', e);
  }
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------

/** @type {import('./types.js').CarePlan} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'nursing-care-plan',
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
    updateConditionalSections();
    refreshLiveStatus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a flat two-level field on the state and persist, then refresh derived UI.
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  updateConditionalSections();
  refreshLiveStatus();
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

/** Build `<option>` HTML for a select, marking the current value selected. */
function optionListHtml(options, current) {
  return [
    `<option value="">— Select —</option>`,
    ...options.map((o) =>
      `<option value="${esc(o.value)}"${String(o.value) === String(current ?? '') ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');
}

// ----------------------------------------------------------------------
// Component builders (flat two-level fields)
// ----------------------------------------------------------------------

function lilyInputClass(type) {
  switch (type) {
    case 'email': return 'email-input';
    case 'number': return 'number-input';
    case 'date': return 'date-input';
    case 'datetime-local': return 'date-input';
    case 'time': return 'time-input';
    case 'tel': return 'tel-input';
    case 'url': return 'url-input';
    case 'search': return 'search-input';
    default: return 'text-input';
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
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
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

function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] ?? '';
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
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
  wrapper.innerHTML = `
    <label class="label" for="${id}"${opts.required ? ' data-required' : ''}>${esc(opts.label)}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error"${opts.required ? ' required data-required' : ''}>
      ${optionListHtml(opts.options, current)}
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
  wrapper.className = 'field radio-fieldset';
  wrapper.id = `${groupId}-fieldset`;
  const legend = document.createElement('legend');
  legend.className = 'label';
  legend.textContent = opts.label;
  if (opts.required) legend.setAttribute('data-required', '');
  wrapper.appendChild(legend);
  const list = document.createElement('div');
  list.className = 'radio-group';
  list.setAttribute('role', 'radiogroup');
  list.setAttribute('aria-labelledby', `${groupId}-fieldset`);
  for (const option of opts.options) {
    const radioId = `${groupId}-${option.value}`;
    const label = document.createElement('label');
    label.className = 'radio-input';
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
  const err = document.createElement('span');
  err.className = 'error-message';
  err.id = `${groupId}-error`;
  err.setAttribute('aria-live', 'polite');
  wrapper.appendChild(err);
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

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

const riskLevelOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const carriedOutOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'partial', label: 'Partial' }
];

const TOTAL_STEPS = 5;

// ----------------------------------------------------------------------
// Nested repeating-row editor (problems → goals + interventions)
// ----------------------------------------------------------------------

/**
 * Generic child-list editor (goals or interventions inside a problem card).
 * Field edits write straight into the array (focus preserved); structural
 * add / remove call `onStructural` so the whole problem editor re-renders.
 *
 * @param {Object} opts
 * @param {Array}  opts.rows            the child array (problem.goals / .interventions)
 * @param {Function} opts.factory       makes a fresh child row
 * @param {string} opts.title           singular label, e.g. "goal"
 * @param {string} opts.gridClass       grid modifier class
 * @param {string} opts.emptyText       empty-state copy
 * @param {Function} opts.renderCells   (row) => cell HTML
 * @param {Function} opts.onStructural  re-render callback for add / remove
 */
function childList(opts) {
  const { rows, factory, title, gridClass, emptyText, renderCells, onStructural } = opts;
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';

  if (!rows.length) {
    const empty = document.createElement('p');
    empty.className = 'list-empty';
    empty.textContent = emptyText;
    wrapper.appendChild(empty);
  }

  rows.forEach((row, idx) => {
    const r = document.createElement('div');
    r.className = `list-row ${title}-row`;
    r.innerHTML = `
      <div class="list-grid ${gridClass}">
        ${renderCells(row, idx)}
        <button type="button" class="button" data-variant="icon" data-action="remove" aria-label="Remove ${esc(title)} ${idx + 1}">&times;</button>
      </div>
    `;
    r.querySelectorAll('input, select, textarea').forEach((inp) => {
      const handler = () => {
        const key = inp.dataset.key;
        if (!key) return;
        rows[idx][key] = inp.value;
        saveState(state);
        updateProgress();
        refreshLiveStatus();
      };
      inp.addEventListener('input', handler);
      inp.addEventListener('change', handler);
    });
    r.querySelector('[data-action="remove"]').addEventListener('click', () => {
      rows.splice(idx, 1);
      saveState(state);
      onStructural();
    });
    wrapper.appendChild(r);
  });

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'button';
  addBtn.setAttribute('data-variant', 'add');
  addBtn.textContent = `+ Add ${title}`;
  addBtn.addEventListener('click', () => {
    rows.push(factory());
    saveState(state);
    onStructural();
  });
  wrapper.appendChild(addBtn);
  return wrapper;
}

/**
 * The parent repeating editor: one card per problem, each containing the
 * problem fields, a nested goals list, a nested interventions list, and the
 * inline evaluation fields.
 */
function problemEditor() {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor problem-editor';

  function rerender() {
    const problems = state.problems;
    wrapper.innerHTML = '';

    if (!problems.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'No problems added yet. Add one card per identified nursing problem or need.';
      wrapper.appendChild(empty);
    }

    problems.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'list-row problem-card';
      const cls = classifyProblem(p);

      // Problem-level fields (Assessment + Diagnosis of ADPIE).
      card.innerHTML = `
        <div class="list-row-header">
          <h3>Problem ${idx + 1}
            <span class="risk-badge ${completenessClass(cls)}">${esc(completenessLabel(cls))}</span>
          </h3>
          <button type="button" class="button" data-variant="icon" data-action="remove-problem" aria-label="Remove problem ${idx + 1}">&times;</button>
        </div>
        <div class="list-grid problem-grid">
          <label class="list-cell list-cell-wide">
            <span>Problem / need statement</span>
            <textarea class="text-area-input" data-key="problemStatement" rows="2" placeholder="e.g. At risk of pressure damage due to reduced mobility">${esc(p.problemStatement)}</textarea>
          </label>
          <label class="list-cell">
            <span>Activity of living (RLT)</span>
            <select class="select" data-key="adlCategory">${optionListHtml(ADL_CATEGORIES, p.adlCategory)}</select>
          </label>
          <label class="list-cell">
            <span>Actual or potential</span>
            <select class="select" data-key="actualOrPotential">${optionListHtml([{ value: 'actual', label: 'Actual' }, { value: 'potential', label: 'Potential' }], p.actualOrPotential)}</select>
          </label>
          <label class="list-cell">
            <span>Linked risk assessment</span>
            <select class="select" data-key="linkedRisk">${optionListHtml(LINKED_RISK_OPTIONS, p.linkedRisk)}</select>
          </label>
          <label class="list-cell list-cell-wide">
            <span>Assessment data</span>
            <textarea class="text-area-input" data-key="assessmentData" rows="2" placeholder="Supporting observation or measurement">${esc(p.assessmentData)}</textarea>
          </label>
        </div>
      `;

      // Bind problem-level inputs (write straight to the array, keep focus).
      card.querySelector('.problem-grid')
        .querySelectorAll('input, select, textarea').forEach((inp) => {
          const handler = () => {
            const key = inp.dataset.key;
            if (!key) return;
            problems[idx][key] = inp.value;
            saveState(state);
            updateProgress();
            refreshLiveStatus();
            // Re-classify badge live without a full rerender.
            const badge = card.querySelector('.list-row-header .risk-badge');
            const c = classifyProblem(problems[idx]);
            if (badge) {
              badge.className = `risk-badge ${completenessClass(c)}`;
              badge.textContent = completenessLabel(c);
            }
          };
          inp.addEventListener('input', handler);
          inp.addEventListener('change', handler);
        });

      card.querySelector('[data-action="remove-problem"]')
        .addEventListener('click', () => {
          problems.splice(idx, 1);
          saveState(state);
          rerender();
          updateProgress();
          refreshLiveStatus();
        });

      // Nested goals list (Planning of ADPIE).
      const goalsSection = document.createElement('div');
      goalsSection.className = 'child-list-section';
      goalsSection.innerHTML = '<h4 class="child-list-title">Goals (SMART)</h4>';
      goalsSection.appendChild(childList({
        rows: p.goals,
        factory: emptyGoal,
        title: 'goal',
        gridClass: 'goal-grid',
        emptyText: 'No goals yet.',
        renderCells: (g) => `
          <label class="list-cell list-cell-wide">
            <span>Goal</span>
            <input type="text" class="text-input" data-key="goalText" value="${esc(g.goalText)}" placeholder="e.g. Skin remains intact by 7 days">
          </label>
          <label class="list-cell">
            <span>Target / review date</span>
            <input type="date" class="date-input" data-key="targetDate" value="${esc(g.targetDate)}">
          </label>
          <label class="list-cell">
            <span>Met</span>
            <select class="select" data-key="met">${optionListHtml(MET_OPTIONS, g.met)}</select>
          </label>
        `,
        onStructural: () => { rerender(); updateProgress(); refreshLiveStatus(); }
      }));
      card.appendChild(goalsSection);

      // Nested interventions list (Implementation of ADPIE).
      const intvSection = document.createElement('div');
      intvSection.className = 'child-list-section';
      intvSection.innerHTML = '<h4 class="child-list-title">Interventions</h4>';
      intvSection.appendChild(childList({
        rows: p.interventions,
        factory: emptyIntervention,
        title: 'intervention',
        gridClass: 'intervention-grid',
        emptyText: 'No interventions yet.',
        renderCells: (iv) => `
          <label class="list-cell list-cell-wide">
            <span>Planned nursing action</span>
            <input type="text" class="text-input" data-key="interventionText" value="${esc(iv.interventionText)}" placeholder="e.g. Reposition 2-hourly; pressure-relieving mattress">
          </label>
          <label class="list-cell">
            <span>Carried out</span>
            <select class="select" data-key="carriedOut">${optionListHtml(carriedOutOptions, iv.carriedOut)}</select>
          </label>
        `,
        onStructural: () => { rerender(); updateProgress(); refreshLiveStatus(); }
      }));
      card.appendChild(intvSection);

      // Inline evaluation fields (Evaluation of ADPIE).
      const evalSection = document.createElement('div');
      evalSection.className = 'child-list-section';
      evalSection.innerHTML = '<h4 class="child-list-title">Evaluation and review</h4>';
      const evalGrid = document.createElement('div');
      evalGrid.className = 'list-grid evaluation-grid';
      evalGrid.innerHTML = `
        <label class="list-cell list-cell-wide">
          <span>Evaluation note</span>
          <textarea class="text-area-input" data-key="evaluationNote" rows="2" placeholder="Did the interventions meet the goal?">${esc(p.evaluationNote)}</textarea>
        </label>
        <label class="list-cell">
          <span>Overall goal met</span>
          <select class="select" data-key="goalMet">${optionListHtml(MET_OPTIONS, p.goalMet)}</select>
        </label>
        <label class="list-cell">
          <span>Next review date</span>
          <input type="date" class="date-input" data-key="nextReviewDate" value="${esc(p.nextReviewDate)}">
        </label>
      `;
      evalGrid.querySelectorAll('input, select, textarea').forEach((inp) => {
        const handler = () => {
          const key = inp.dataset.key;
          if (!key) return;
          problems[idx][key] = inp.value;
          saveState(state);
          updateProgress();
          refreshLiveStatus();
          const badge = card.querySelector('.list-row-header .risk-badge');
          const c = classifyProblem(problems[idx]);
          if (badge) {
            badge.className = `risk-badge ${completenessClass(c)}`;
            badge.textContent = completenessLabel(c);
          }
        };
        inp.addEventListener('input', handler);
        inp.addEventListener('change', handler);
      });
      evalSection.appendChild(evalGrid);
      card.appendChild(evalSection);

      wrapper.appendChild(card);
    });

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'button';
    addBtn.setAttribute('data-variant', 'add');
    addBtn.textContent = '+ Add problem';
    addBtn.addEventListener('click', () => {
      state.problems.push(emptyProblem());
      saveState(state);
      rerender();
      updateProgress();
      refreshLiveStatus();
    });
    wrapper.appendChild(addBtn);
  }

  rerender();
  return wrapper;
}

// ----------------------------------------------------------------------
// Section renderers (1 per wizard step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Plan context',
    description: 'Who is authoring the plan, when, where, and why.'
  });
  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'Authoring nurse name', section: 'planContext', field: 'nurseName', required: true }));
  grid.appendChild(selectInput({
    label: 'Nurse role', section: 'planContext', field: 'nurseRole', required: true,
    options: [
      { value: 'registered-nurse', label: 'Registered nurse' },
      { value: 'nursing-associate', label: 'Nursing associate' },
      { value: 'student', label: 'Student nurse' }
    ]
  }));
  card.appendChild(grid);

  const grid2 = document.createElement('div');
  grid2.className = 'two-col';
  grid2.appendChild(textInput({ label: 'NMC registration number', section: 'planContext', field: 'nmcNumber', placeholder: 'e.g. 12A3456E' }));
  grid2.appendChild(textInput({ label: 'Date and time authored', section: 'planContext', field: 'authoredAt', type: 'datetime-local' }));
  card.appendChild(grid2);

  const grid3 = document.createElement('div');
  grid3.className = 'three-col';
  grid3.appendChild(selectInput({
    label: 'Care setting', section: 'planContext', field: 'careSetting',
    options: [
      { value: 'ward', label: 'Hospital ward' },
      { value: 'community', label: 'Community / district' },
      { value: 'care-home', label: 'Care home' },
      { value: 'hospice', label: 'Hospice' },
      { value: 'other', label: 'Other' }
    ]
  }));
  grid3.appendChild(selectInput({
    label: 'Plan type', section: 'planContext', field: 'planType',
    options: [
      { value: 'admission', label: 'Admission' },
      { value: 'ongoing', label: 'Ongoing' },
      { value: 'discharge', label: 'Discharge' }
    ]
  }));
  grid3.appendChild(selectInput({
    label: 'Nursing model', section: 'planContext', field: 'modelUsed',
    options: [
      { value: 'roper-logan-tierney', label: 'Roper–Logan–Tierney' },
      { value: 'orem', label: 'Orem self-care' },
      { value: 'activities-of-living', label: 'Activities of living' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(grid3);
  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Patient identification',
    description: 'Who the plan is for.'
  });
  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'Patient identifier', section: 'patient', field: 'patientIdentifier', required: true, placeholder: 'Local / NHS number' }));
  grid.appendChild(textInput({ label: 'Patient name', section: 'patient', field: 'patientName', required: true, placeholder: 'Surname, Given' }));
  card.appendChild(grid);

  const grid2 = document.createElement('div');
  grid2.className = 'three-col';
  grid2.appendChild(textInput({ label: 'Date of birth', section: 'patient', field: 'dateOfBirth', type: 'date' }));
  grid2.appendChild(selectInput({
    label: 'Sex', section: 'patient', field: 'sex',
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'intersex', label: 'Intersex' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  grid2.appendChild(textInput({ label: 'Ward / location', section: 'patient', field: 'wardLocation', placeholder: 'e.g. Ward 12, Bay 3' }));
  card.appendChild(grid2);
  return card;
}

/** One risk-assessment group editor (done / level / date / actioned). */
function riskGroupCard(section, title) {
  const host = document.createElement('div');
  host.className = 'risk-group';
  host.innerHTML = `<h3 class="risk-group-title">${esc(title)}</h3>`;
  host.appendChild(radioGroup({ label: 'Assessment completed?', section, field: 'done', options: yesNo }));
  const detail = document.createElement('div');
  detail.dataset.conditional = `${section}.done=yes`;
  const grid = document.createElement('div');
  grid.className = 'three-col';
  grid.appendChild(selectInput({ label: 'Risk level', section, field: 'level', options: riskLevelOptions }));
  grid.appendChild(textInput({ label: 'Assessed on', section, field: 'assessedOn', type: 'date' }));
  grid.appendChild(selectInput({ label: 'Actioned?', section, field: 'actioned', options: yesNo }));
  detail.appendChild(grid);
  host.appendChild(detail);
  return host;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Risk assessments referenced',
    description: 'Record that the specialist risk tools were done and their outcome.'
  });
  card.appendChild(riskGroupCard('fallsRisk', 'Falls'));
  card.appendChild(riskGroupCard('pressureUlcerRisk', 'Pressure ulcer (Waterlow / Braden)'));
  card.appendChild(riskGroupCard('vteRisk', 'Venous thromboembolism (VTE)'));
  card.appendChild(riskGroupCard('nutritionRisk', 'Nutrition (MUST)'));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Problems, goals, interventions and evaluation',
    description: 'One card per nursing problem. Each problem carries its goals, interventions, and evaluation (ADPIE).'
  });
  card.appendChild(problemEditor());
  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Summary and completeness',
    description: 'Plan-level review date, handover note, and the live completeness status.'
  });
  const grid = document.createElement('div');
  grid.className = 'two-col';
  grid.appendChild(textInput({ label: 'Plan review date', section: 'summary', field: 'reviewDate', type: 'date' }));
  card.appendChild(grid);
  card.appendChild(textArea({
    label: 'Handover note', section: 'summary', field: 'handoverNote',
    rows: 3, placeholder: 'Free-text summary for the nursing notes and handover.'
  }));
  card.appendChild(readOnlyReadout({
    label: 'Live care-plan status',
    id: 'live-status',
    render: liveStatusHtml
  }));
  return card;
}

// ----------------------------------------------------------------------
// Live status readout
// ----------------------------------------------------------------------

function liveStatusHtml() {
  const r = validate(state);
  const counts = { complete: 0, partial: 0, incomplete: 0 };
  r.problemClasses.forEach((pc) => { counts[pc.completenessClass] += 1; });
  return `
    <span class="risk-badge ${completenessClass(r.status)}">${esc(completenessLabel(r.status))}</span>
    <span class="muted"> ${r.completenessPercent}% complete · ${state.problems.length} problem(s)
    (${counts.complete} complete, ${counts.partial} partial, ${counts.incomplete} incomplete)</span>
  `;
}

function refreshLiveStatus() {
  const el = document.getElementById('live-status');
  if (el) el.innerHTML = liveStatusHtml();
}

// ----------------------------------------------------------------------
// Conditional sections
// ----------------------------------------------------------------------

function updateConditionalSections() {
  document.querySelectorAll('[data-conditional]').forEach((host) => {
    const expr = host.getAttribute('data-conditional');
    const [path, target] = expr.split('=');
    const [section, field] = path.split('.');
    const current = state[section] ? state[section][field] : '';
    host.style.display = String(current) === target ? '' : 'none';
  });
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

// Flat tracked fields grouped by step number.
const TRACKED_BY_STEP = {
  1: [['planContext', 'nurseName'], ['planContext', 'nurseRole'], ['planContext', 'authoredAt'], ['planContext', 'careSetting'], ['planContext', 'planType']],
  2: [['patient', 'patientIdentifier'], ['patient', 'patientName'], ['patient', 'dateOfBirth'], ['patient', 'sex'], ['patient', 'wardLocation']],
  3: [['fallsRisk', 'done'], ['pressureUlcerRisk', 'done'], ['vteRisk', 'done'], ['nutritionRisk', 'done']],
  5: [['summary', 'reviewDate'], ['summary', 'handoverNote']]
};

function countFlat(pairs) {
  let answered = 0;
  for (const [section, field] of pairs) {
    const v = state[section][field];
    if (v !== null && v !== undefined && v !== '') answered += 1;
  }
  return { answered, total: pairs.length };
}

/** Step 4 completion = present required ADPIE elements across problems. */
function countProblems() {
  
  let answered = 0;
  let total = state.problems.length * 3;
  for (const p of state.problems) {
    if (hasGoal(p)) answered += 1;
    if (hasIntervention(p)) answered += 1;
    if (hasEvaluation(p)) answered += 1;
  }
  return { answered, total };
}

function updateProgress() {
  const perStep = {};
  let answered = 0;
  let total = 0;
  for (const step of [1, 2, 3, 5]) {
    const c = countFlat(TRACKED_BY_STEP[step]);
    perStep[step] = c;
    answered += c.answered;
    total += c.total;
  }
  const p4 = countProblems();
  perStep[4] = p4;
  answered += p4.answered;
  total += p4.total;

  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  updateStepListStatuses(perStep);
}

// ----------------------------------------------------------------------
// Step list
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, title: 'Plan context' },
  { step: 2, title: 'Patient' },
  { step: 3, title: 'Risk assessments' },
  { step: 4, title: 'Problems (ADPIE)' },
  { step: 5, title: 'Summary' }
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

function updateStepListStatuses(perStep) {
  const ol = document.getElementById('step-list');
  if (!ol) return;
  let firstUnfinished = -1;
  for (const def of STEP_DEFINITIONS) {
    const li = ol.querySelector(`[data-step="${def.step}"]`);
    if (!li) continue;
    const c = perStep[def.step] || { answered: 0, total: 0 };
    if (c.total > 0 && c.answered === c.total) {
      li.dataset.status = 'finished';
      li.removeAttribute('aria-current');
    } else if (c.answered > 0) {
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
    if (current.dataset.status === 'waiting') current.dataset.status = 'in-progress';
  }
  ol.dataset.current = String(firstUnfinished - 1);
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

  const { status, completenessPercent, problemClasses, firedRules, flags, timestamp } = lastResult;

  const flagsList = flags.length === 0
    ? `<p class="muted">No issues flagged.</p>`
    : `<ul class="flags">${flags.map((f) => `
        <li class="${priorityClass(f.priority)}">
          <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
          <span class="flag-category">${esc(f.category)}</span>
          <span class="flag-message">${esc(f.message)}</span>
        </li>`).join('')}</ul>`;

  const problemRows = problemClasses.map((pc, idx) => {
    const p = state.problems.find((pp) => pp.id === pc.problemId) || {};
    return `
      <tr>
        <th scope="row">Problem ${idx + 1}</th>
        <td>${esc(p.problemStatement || '(no statement)')}</td>
        <td>${esc(adlCategoryLabel(p.adlCategory) || '—')}</td>
        <td class="num"><span class="risk-badge ${completenessClass(pc.completenessClass)}">${esc(completenessLabel(pc.completenessClass))}</span></td>
      </tr>`;
  }).join('');

  const problemTable = problemClasses.length === 0
    ? `<p class="muted">No problems recorded.</p>`
    : `<table class="subscales">
        <thead><tr><th scope="col">#</th><th scope="col">Problem</th><th scope="col">Activity of living</th><th scope="col">Completeness</th></tr></thead>
        <tbody>${problemRows}</tbody>
      </table>`;

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Nursing Care Plan Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Care-plan status</h3>
      <p class="risk-summary">
        <span class="risk-badge ${completenessClass(status)}">${esc(completenessLabel(status))}</span>
        <span class="muted"> ${completenessPercent}% of required care-process elements present</span>
      </p>

      <h3>Per-problem completeness (${problemClasses.length})</h3>
      ${problemTable}

      <h3>Flagged issues (${flags.length})</h3>
      ${flagsList}

      <div class="report-actions">
        <button type="button" id="start-over-btn" class="button" data-variant="secondary">Start over</button>
      </div>
    </div>
  `;
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const btn = document.getElementById('start-over-btn');
  if (btn) btn.addEventListener('click', startOver);
}

function submitForm() {
  const errors = validateForm();
  if (errors.length > 0) return;
  lastResult = validate(state);
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh care plan?')) return;
  clearState();
  state = emptyPlan();
  lastResult = null;
  const rep = document.getElementById('report');
  if (rep) rep.innerHTML = '<p class="empty-message">Submit the form to see the report.</p>';
  renderErrorSummary([]);
  renderForm();
  updateProgress();
  updateConditionalSections();
  refreshLiveStatus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const label = fs ? fs.querySelector('legend') : labelEl;
      const labelText = label ? label.textContent.replace(/\s*\*\s*$/, '').trim() : id;
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
    errors.map((e) => `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`).join('') +
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
  refreshLiveStatus();

  const submit = document.getElementById('submit-btn');
  if (submit) submit.addEventListener('click', submitForm);
  const reset = document.getElementById('reset-btn');
  if (reset) reset.addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
