import { calculateMaturity } from './grader.js';
import { computeCompleteness } from './rules.js';
import { SECTION_NAMES, completeSectionCount, completenessLabel, emptyDocumentation, maturityLabel, recommendationLabel } from './types.js';

// arc42 — architecture-documentation wizard (vanilla JS).
//
// Single-page continuous wizard: all 12 arc42 sections are rendered into the
// page in document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many of the 12 sections the completeness engine
// grades `complete`. Submission runs the pure maturity grader and renders an
// inline maturity report. State is persisted to localStorage so a partial fill
// survives a page reload.
//
// Load order: types -> rules -> flags -> grader -> form-app.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'arc42.front-end-with-html.v1';
const TOTAL_STEPS = 12;

// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  const fresh = emptyDocumentation();

  for (const key of Object.keys(fresh)) {
    const v = parsed && parsed[key];
    if (v === undefined || v === null) continue;
    if (Array.isArray(fresh[key])) {
      if (Array.isArray(v)) fresh[key] = v;
    } else if (fresh[key] && typeof fresh[key] === 'object') {
      if (typeof v === 'object' && !Array.isArray(v)) fresh[key] = { ...fresh[key], ...v };
    } else {
      fresh[key] = v;
    }
  }
  return fresh;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDocumentation();
    const parsed = JSON.parse(raw);
    return mergeIntoDefaults(parsed);
  } catch (e) {
    console.warn('Could not parse saved documentation; starting fresh.', e);
    return emptyDocumentation();
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Could not save documentation to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored documentation.', e);
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
/** @type {ReturnType<typeof calculateMaturity> | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'arc42',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the maturity report.</p>';
    renderErrorSummary([]);
    renderForm();
    refreshProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Read a dotted path off the state object (e.g. 'architecture.name'). */
function getVal(path) {
  const parts = path.split('.');
  let o = state;
  for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
  return o[parts[parts.length - 1]];
}

/** Write a dotted path on the state object, then persist + refresh progress. */
function setVal(path, value) {
  const parts = path.split('.');
  let o = state;
  for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
  o[parts[parts.length - 1]] = value;
  saveState(state);
  refreshProgress();
}

function fieldId(path) {
  return 'f-' + path.replace(/[^a-zA-Z0-9]+/g, '-');
}

// ----------------------------------------------------------------------
// Scalar field builders (bound to a dotted state path)
// ----------------------------------------------------------------------

function lilyInputClass(type) {
  switch (type) {
    case 'email':  return 'email-input';
    case 'number': return 'number-input';
    case 'date':   return 'date-input';
    case 'time':   return 'time-input';
    case 'datetime-local': return 'text-input';
    case 'tel':    return 'tel-input';
    case 'url':    return 'url-input';
    case 'search': return 'search-input';
    default:       return 'text-input';
  }
}

function textField(opts) {
  const id = fieldId(opts.path);
  const type = opts.type || 'text';
  const value = getVal(opts.path);
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <input id="${id}" name="${id}" type="${type}" class="${lilyInputClass(type)}"
      value="${esc(value == null ? '' : value)}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}>
  `;
  const input = wrapper.querySelector('input');
  input.addEventListener('input', () => setVal(opts.path, input.value));
  return wrapper;
}

function textAreaField(opts) {
  const id = fieldId(opts.path);
  const value = getVal(opts.path);
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <textarea id="${id}" name="${id}" rows="${opts.rows || 3}"
      ${opts.placeholder ? `placeholder="${esc(opts.placeholder)}"` : ''}
      class="text-area-input">${esc(value == null ? '' : value)}</textarea>
  `;
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => setVal(opts.path, ta.value));
  return wrapper;
}

function selectField(opts) {
  const id = fieldId(opts.path);
  const current = getVal(opts.path);
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const optionsHtml = [
    `<option value="">${esc(opts.placeholderLabel || '— Select —')}</option>`,
    ...opts.options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');
  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <select id="${id}" name="${id}" class="select">${optionsHtml}</select>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => setVal(opts.path, sel.value));
  return wrapper;
}

// ----------------------------------------------------------------------
// Item-field builders (bound to a repeat-list item object)
// ----------------------------------------------------------------------

function itemCell(labelText, control) {
  const cell = document.createElement('label');
  cell.className = 'list-cell';
  const span = document.createElement('span');
  span.textContent = labelText;
  cell.appendChild(span);
  cell.appendChild(control);
  return cell;
}

function ctrlText(item, key, type) {
  const el = document.createElement('input');
  el.type = type || 'text';
  el.className = lilyInputClass(type || 'text');
  el.value = item[key] == null ? '' : item[key];
  el.addEventListener('input', () => {
    item[key] = el.value;
    saveState(state);
    refreshProgress();
  });
  return el;
}

function ctrlTextarea(item, key, rows) {
  const el = document.createElement('textarea');
  el.className = 'text-area-input';
  el.rows = rows || 2;
  el.value = item[key] == null ? '' : item[key];
  el.addEventListener('input', () => {
    item[key] = el.value;
    saveState(state);
    refreshProgress();
  });
  return el;
}

function ctrlSelect(item, key, options, placeholderLabel) {
  const el = document.createElement('select');
  el.className = 'select';
  const current = item[key] == null ? '' : item[key];
  el.innerHTML = [
    `<option value="">${esc(placeholderLabel || '— Select —')}</option>`,
    ...options.map((o) =>
      `<option value="${esc(o.value)}"${o.value === current ? ' selected' : ''}>${esc(o.label)}</option>`
    )
  ].join('');
  el.addEventListener('change', () => {
    item[key] = el.value;
    saveState(state);
    refreshProgress();
  });
  return el;
}

// ----------------------------------------------------------------------
// Repeat-list editor
// ----------------------------------------------------------------------

/**
 * Build a self-repainting repeat-list editor.
 *
 * @param {object} opts
 * @param {string} opts.title
 * @param {number} opts.max
 * @param {() => object[]} opts.getItems   returns the (possibly filtered) items
 * @param {() => void} opts.add            append a new item to state
 * @param {(i:number) => void} opts.removeAt  remove item at subset index i
 * @param {(item:object, grid:HTMLElement) => void} opts.renderFields
 */
function listEditor(opts) {
  const editor = document.createElement('div');
  editor.className = 'list-editor';

  function paint() {
    const items = opts.getItems();
    editor.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'list-section-header';
    const h = document.createElement('h3');
    h.textContent = opts.title;
    header.appendChild(h);
    editor.appendChild(header);

    if (items.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = 'None added yet.';
      editor.appendChild(empty);
    }

    items.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'list-row';

      const grid = document.createElement('div');
      grid.className = 'list-grid';
      opts.renderFields(item, grid);
      row.appendChild(grid);

      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'button';
      rm.dataset.variant = 'icon';
      rm.setAttribute('aria-label', 'Remove');
      rm.textContent = '✕';
      rm.addEventListener('click', () => {
        opts.removeAt(i);
        saveState(state);
        paint();
        refreshProgress();
      });
      row.appendChild(rm);

      editor.appendChild(row);
    });

    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'button';
    add.dataset.variant = 'add';
    add.textContent = `Add (${items.length}/${opts.max})`;
    add.disabled = items.length >= opts.max;
    add.addEventListener('click', () => {
      if (opts.getItems().length >= opts.max) return;
      opts.add();
      saveState(state);
      paint();
      refreshProgress();
    });
    editor.appendChild(add);
  }

  paint();
  return editor;
}

// ----------------------------------------------------------------------
// Section card
// ----------------------------------------------------------------------

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
    <span class="section-step">Step ${opts.stepNumber} of ${TOTAL_STEPS} · §${opts.stepNumber}</span>
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

const ARCH_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' }
];
const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];
const DIRECTION_OPTIONS = [
  { value: 'inbound', label: 'Inbound' },
  { value: 'outbound', label: 'Outbound' },
  { value: 'bidirectional', label: 'Bidirectional' }
];
const ENVIRONMENT_OPTIONS = [
  { value: 'development', label: 'Development' },
  { value: 'staging', label: 'Staging' },
  { value: 'production', label: 'Production' },
  { value: 'disaster-recovery', label: 'Disaster recovery' },
  { value: 'other', label: 'Other' }
];
const ADR_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'proposed', label: 'Proposed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'deprecated', label: 'Deprecated' },
  { value: 'superseded', label: 'Superseded' }
];
const RISK_KIND_OPTIONS = [
  { value: 'risk', label: 'Risk' },
  { value: 'technical-debt', label: 'Technical debt' }
];
const MATURITY_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'reviewable', label: 'Reviewable' },
  { value: 'ready', label: 'Ready' },
  { value: 'mature', label: 'Mature' }
];
const RECOMMENDATION_OPTIONS = [
  { value: 'proceed', label: 'Proceed' },
  { value: 'revise-first', label: 'Revise first' },
  { value: 'block', label: 'Block' }
];

// ----------------------------------------------------------------------
// Section renderers
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Introduction & Goals',
    description: 'Requirements overview: what the architecture is, its top business goals, quality goals, and stakeholders.'
  });
  card.appendChild(grid('two-col', [
    textField({ label: 'Architecture name', path: 'architecture.name' }),
    textField({ label: 'Version', path: 'architecture.version' })
  ]));
  card.appendChild(grid('two-col', [
    textField({ label: 'Owner', path: 'architecture.owner' }),
    selectField({ label: 'Status', path: 'architecture.status', options: ARCH_STATUS_OPTIONS })
  ]));
  card.appendChild(textAreaField({ label: 'Description', path: 'architecture.description', rows: 2 }));
  card.appendChild(grid('three-col', [
    textField({ label: 'Author name', path: 'authorName' }),
    textField({ label: 'Author role', path: 'authorRole' }),
    textField({ label: 'Document date', path: 'documentDate', type: 'date' })
  ]));
  card.appendChild(textAreaField({ label: 'Introduction', path: 'introduction', rows: 4 }));

  card.appendChild(subHead('Business goals'));
  card.appendChild(listEditor({
    title: 'Business goals (max 5)', max: 5,
    getItems: () => state.businessGoals,
    add: () => state.businessGoals.push({ ordinal: state.businessGoals.length + 1, name: '', description: '' }),
    removeAt: (i) => state.businessGoals.splice(i, 1),
    renderFields: (g, grid) => {
      grid.appendChild(itemCell('Goal name', ctrlText(g, 'name')));
      grid.appendChild(itemCell('Description', ctrlTextarea(g, 'description', 2)));
    }
  }));

  card.appendChild(subHead('Quality goals'));
  card.appendChild(listEditor({
    title: 'Quality goals (max 5)', max: 5,
    getItems: () => state.qualityGoals,
    add: () => state.qualityGoals.push({ ordinal: state.qualityGoals.length + 1, name: '', priority: '', scenario: '' }),
    removeAt: (i) => state.qualityGoals.splice(i, 1),
    renderFields: (g, grid) => {
      grid.appendChild(itemCell('Goal name', ctrlText(g, 'name')));
      grid.appendChild(itemCell('Priority', ctrlSelect(g, 'priority', PRIORITY_OPTIONS, 'Priority —')));
      grid.appendChild(itemCell('Scenario', ctrlTextarea(g, 'scenario', 2)));
    }
  }));

  card.appendChild(subHead('Stakeholders'));
  card.appendChild(listEditor({
    title: 'Stakeholders (max 8)', max: 8,
    getItems: () => state.stakeholders,
    add: () => state.stakeholders.push({ ordinal: state.stakeholders.length + 1, name: '', role: '', concerns: '' }),
    removeAt: (i) => state.stakeholders.splice(i, 1),
    renderFields: (s, grid) => {
      grid.appendChild(itemCell('Name', ctrlText(s, 'name')));
      grid.appendChild(itemCell('Role', ctrlText(s, 'role')));
      grid.appendChild(itemCell('Concerns', ctrlTextarea(s, 'concerns', 2)));
    }
  }));
  return card;
}

// Shared constraint-partition helpers (mirror the Svelte Step 2 logic).
function constraintsOfKind(kind) {
  return state.constraintItems.filter((c) => c.kind === kind);
}
function addConstraint(kind) {
  state.constraintItems.push({ ordinal: state.constraintItems.length + 1, kind, name: '', description: '' });
}
function removeConstraintWhere(kind, indexInKind) {
  let count = 0;
  state.constraintItems = state.constraintItems.filter((c) => {
    if (c.kind !== kind) return true;
    return count++ !== indexInKind;
  });
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Constraints',
    description: 'Technical, organizational, and convention constraints the architecture must respect.'
  });
  const kinds = [
    { kind: 'technical', title: 'Technical constraints (max 8)', max: 8, nameLabel: 'Name' },
    { kind: 'organizational', title: 'Organizational constraints (max 5)', max: 5, nameLabel: 'Name' },
    { kind: 'convention', title: 'Conventions (max 8)', max: 8, nameLabel: 'Topic' }
  ];
  for (const k of kinds) {
    card.appendChild(listEditor({
      title: k.title, max: k.max,
      getItems: () => constraintsOfKind(k.kind),
      add: () => addConstraint(k.kind),
      removeAt: (i) => removeConstraintWhere(k.kind, i),
      renderFields: (c, grid) => {
        grid.appendChild(itemCell(k.nameLabel, ctrlText(c, 'name')));
        grid.appendChild(itemCell('Description', ctrlTextarea(c, 'description', 2)));
      }
    }));
  }
  return card;
}

// Shared context-partner-partition helpers (mirror the Svelte Step 3 logic).
function partnersOfKind(kind) {
  return state.contextPartners.filter((p) => p.kind === kind);
}
function addPartner(kind) {
  state.contextPartners.push({ ordinal: state.contextPartners.length + 1, kind, name: '', interfaceDescription: '', protocol: '', direction: '' });
}
function removePartnerWhere(kind, indexInKind) {
  let count = 0;
  state.contextPartners = state.contextPartners.filter((p) => {
    if (p.kind !== kind) return true;
    return count++ !== indexInKind;
  });
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Context & Scope',
    description: 'Business and technical context: external partners, interfaces, and communication protocols.'
  });
  card.appendChild(textAreaField({ label: 'Business context description', path: 'businessContextDescription', rows: 4 }));
  card.appendChild(subHead('Business context partners'));
  card.appendChild(listEditor({
    title: 'Business context partners (max 8)', max: 8,
    getItems: () => partnersOfKind('business'),
    add: () => addPartner('business'),
    removeAt: (i) => removePartnerWhere('business', i),
    renderFields: (p, grid) => {
      grid.appendChild(itemCell('Name', ctrlText(p, 'name')));
      grid.appendChild(itemCell('Interface description', ctrlTextarea(p, 'interfaceDescription', 2)));
      grid.appendChild(itemCell('Protocol', ctrlText(p, 'protocol')));
      grid.appendChild(itemCell('Direction', ctrlSelect(p, 'direction', DIRECTION_OPTIONS, 'Direction —')));
    }
  }));
  card.appendChild(textAreaField({ label: 'Technical context description', path: 'technicalContextDescription', rows: 4 }));
  card.appendChild(subHead('Technical interfaces'));
  card.appendChild(listEditor({
    title: 'Technical interfaces (max 8)', max: 8,
    getItems: () => partnersOfKind('technical'),
    add: () => addPartner('technical'),
    removeAt: (i) => removePartnerWhere('technical', i),
    renderFields: (p, grid) => {
      grid.appendChild(itemCell('Name', ctrlText(p, 'name')));
      grid.appendChild(itemCell('Interface description', ctrlTextarea(p, 'interfaceDescription', 2)));
      grid.appendChild(itemCell('Protocol', ctrlText(p, 'protocol')));
      grid.appendChild(itemCell('Direction', ctrlSelect(p, 'direction', DIRECTION_OPTIONS, 'Direction —')));
    }
  }));
  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Solution Strategy',
    description: 'Fundamental decisions and solution approaches: technology choices, decomposition, and quality strategies.'
  });
  card.appendChild(textAreaField({ label: 'Solution strategy summary', path: 'solutionStrategySummary', rows: 4 }));
  card.appendChild(subHead('Technology decisions'));
  card.appendChild(listEditor({
    title: 'Technology decisions (max 6)', max: 6,
    getItems: () => state.technologyDecisions,
    add: () => state.technologyDecisions.push({ ordinal: state.technologyDecisions.length + 1, category: '', choice: '', rationale: '' }),
    removeAt: (i) => state.technologyDecisions.splice(i, 1),
    renderFields: (td, grid) => {
      grid.appendChild(itemCell('Category (e.g. language, database)', ctrlText(td, 'category')));
      grid.appendChild(itemCell('Choice', ctrlText(td, 'choice')));
      grid.appendChild(itemCell('Rationale', ctrlTextarea(td, 'rationale', 2)));
    }
  }));
  card.appendChild(textAreaField({ label: 'Top-level decomposition summary', path: 'topLevelDecompositionSummary', rows: 4 }));
  card.appendChild(subHead('Quality strategies'));
  card.appendChild(listEditor({
    title: 'Quality strategies (max 5)', max: 5,
    getItems: () => state.qualityStrategies,
    add: () => state.qualityStrategies.push(''),
    removeAt: (i) => state.qualityStrategies.splice(i, 1),
    renderFields: (_item, grid) => {
      // qualityStrategies is an array of plain strings; bind by index.
      const idx = state.qualityStrategies.indexOf(_item);
      const el = document.createElement('input');
      el.type = 'text';
      el.className = 'text-input';
      el.placeholder = 'Quality strategy';
      el.value = _item == null ? '' : _item;
      el.addEventListener('input', () => {
        const i = idx;
        state.qualityStrategies[i] = el.value;
        saveState(state);
        refreshProgress();
      });
      grid.appendChild(itemCell('Quality strategy', el));
    }
  }));
  return card;
}

function topLevelBlocks() {
  return state.buildingBlocks.filter((b) => b.parentOrdinal === null || b.parentOrdinal === undefined);
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Building Block View',
    description: 'Static decomposition of the system into building blocks and their responsibilities.'
  });
  card.appendChild(textAreaField({ label: 'Overview', path: 'buildingBlockOverview', rows: 4 }));
  card.appendChild(subHead('Building blocks'));
  card.appendChild(listEditor({
    title: 'Building blocks (max 12)', max: 12,
    getItems: () => state.buildingBlocks,
    add: () => state.buildingBlocks.push({ ordinal: state.buildingBlocks.length + 1, parentOrdinal: null, name: '', responsibility: '', interfaces: '' }),
    removeAt: (i) => state.buildingBlocks.splice(i, 1),
    renderFields: (bb, grid) => {
      grid.appendChild(itemCell('Name', ctrlText(bb, 'name')));
      // Parent select: top-level, or another top-level block's ordinal.
      const sel = document.createElement('select');
      sel.className = 'select';
      const current = bb.parentOrdinal == null ? '' : String(bb.parentOrdinal);
      const opts = ['<option value="">Top-level (no parent)</option>'];
      for (const tl of topLevelBlocks()) {
        if (tl.ordinal === bb.ordinal) continue;
        opts.push(`<option value="${tl.ordinal}"${String(tl.ordinal) === current ? ' selected' : ''}>${esc(tl.name || ('Block ' + tl.ordinal))}</option>`);
      }
      sel.innerHTML = opts.join('');
      sel.addEventListener('change', () => {
        bb.parentOrdinal = sel.value === '' ? null : Number(sel.value);
        saveState(state);
        refreshProgress();
      });
      grid.appendChild(itemCell('Parent', sel));
      grid.appendChild(itemCell('Responsibility', ctrlTextarea(bb, 'responsibility', 2)));
      grid.appendChild(itemCell('Interfaces', ctrlTextarea(bb, 'interfaces', 2)));
    }
  }));
  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Runtime View',
    description: 'How building blocks collaborate at runtime in the important scenarios.'
  });
  card.appendChild(textAreaField({ label: 'Runtime overview', path: 'runtimeOverview', rows: 4 }));
  card.appendChild(subHead('Runtime scenarios'));
  card.appendChild(listEditor({
    title: 'Runtime scenarios (max 8)', max: 8,
    getItems: () => state.runtimeScenarios,
    add: () => state.runtimeScenarios.push({ ordinal: state.runtimeScenarios.length + 1, name: '', triggerDescription: '', stepsSummary: '' }),
    removeAt: (i) => state.runtimeScenarios.splice(i, 1),
    renderFields: (s, grid) => {
      grid.appendChild(itemCell('Scenario name', ctrlText(s, 'name')));
      grid.appendChild(itemCell('Trigger description', ctrlText(s, 'triggerDescription')));
      grid.appendChild(itemCell('Steps summary', ctrlTextarea(s, 'stepsSummary', 3)));
    }
  }));
  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Deployment View',
    description: 'Technical infrastructure and the mapping of building blocks to nodes.'
  });
  card.appendChild(textAreaField({ label: 'Deployment overview', path: 'deploymentOverview', rows: 4 }));
  card.appendChild(subHead('Deployment nodes'));
  card.appendChild(listEditor({
    title: 'Deployment nodes (max 10)', max: 10,
    getItems: () => state.deploymentNodes,
    add: () => state.deploymentNodes.push({ ordinal: state.deploymentNodes.length + 1, environment: '', nodeName: '', responsibility: '' }),
    removeAt: (i) => state.deploymentNodes.splice(i, 1),
    renderFields: (n, grid) => {
      grid.appendChild(itemCell('Environment', ctrlSelect(n, 'environment', ENVIRONMENT_OPTIONS, 'Environment —')));
      grid.appendChild(itemCell('Node name', ctrlText(n, 'nodeName')));
      grid.appendChild(itemCell('Responsibility', ctrlText(n, 'responsibility')));
    }
  }));
  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Crosscutting Concepts',
    description: 'Overarching principles and solution ideas relevant across multiple building blocks.'
  });
  card.appendChild(textAreaField({ label: 'Crosscutting overview', path: 'crosscuttingOverview', rows: 4 }));
  card.appendChild(subHead('Crosscutting concepts'));
  card.appendChild(listEditor({
    title: 'Crosscutting concepts (max 10)', max: 10,
    getItems: () => state.crosscuttingConcepts,
    add: () => state.crosscuttingConcepts.push({ ordinal: state.crosscuttingConcepts.length + 1, name: '', description: '' }),
    removeAt: (i) => state.crosscuttingConcepts.splice(i, 1),
    renderFields: (c, grid) => {
      grid.appendChild(itemCell('Concept name', ctrlText(c, 'name')));
      grid.appendChild(itemCell('Description', ctrlTextarea(c, 'description', 3)));
    }
  }));
  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Architectural Decisions',
    description: 'Important, expensive, critical, or risky architecture decisions (ADRs).'
  });
  card.appendChild(listEditor({
    title: 'Architectural decisions / ADRs (max 15)', max: 15,
    getItems: () => state.architecturalDecisions,
    add: () => state.architecturalDecisions.push({ ordinal: state.architecturalDecisions.length + 1, title: '', status: '', context: '', decision: '', consequences: '' }),
    removeAt: (i) => state.architecturalDecisions.splice(i, 1),
    renderFields: (adr, grid) => {
      grid.appendChild(itemCell('Title', ctrlText(adr, 'title')));
      grid.appendChild(itemCell('Status', ctrlSelect(adr, 'status', ADR_STATUS_OPTIONS, 'Status —')));
      grid.appendChild(itemCell('Context', ctrlTextarea(adr, 'context', 2)));
      grid.appendChild(itemCell('Decision', ctrlTextarea(adr, 'decision', 2)));
      grid.appendChild(itemCell('Consequences', ctrlTextarea(adr, 'consequences', 2)));
    }
  }));
  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Quality Requirements',
    description: 'The quality tree and concrete quality scenarios (source, stimulus, artifact, response, measure).'
  });
  card.appendChild(textAreaField({ label: 'Quality tree summary', path: 'qualityTreeSummary', rows: 4 }));
  card.appendChild(subHead('Quality scenarios'));
  card.appendChild(listEditor({
    title: 'Quality scenarios (max 10)', max: 10,
    getItems: () => state.qualityScenarios,
    add: () => state.qualityScenarios.push({ ordinal: state.qualityScenarios.length + 1, source: '', stimulus: '', artifact: '', response: '', measure: '' }),
    removeAt: (i) => state.qualityScenarios.splice(i, 1),
    renderFields: (qs, grid) => {
      grid.appendChild(itemCell('Source', ctrlText(qs, 'source')));
      grid.appendChild(itemCell('Stimulus', ctrlText(qs, 'stimulus')));
      grid.appendChild(itemCell('Artifact', ctrlText(qs, 'artifact')));
      grid.appendChild(itemCell('Response', ctrlText(qs, 'response')));
      grid.appendChild(itemCell('Measure', ctrlText(qs, 'measure')));
    }
  }));
  return card;
}

function renderStep11() {
  const card = sectionCard({
    stepNumber: 11,
    title: 'Risks & Technical Debt',
    description: 'Known technical risks and technical debt, with probability, impact, and mitigation.'
  });
  card.appendChild(listEditor({
    title: 'Risk items (max 10)', max: 10,
    getItems: () => state.riskItems,
    add: () => state.riskItems.push({ ordinal: state.riskItems.length + 1, kind: '', name: '', probability: '', impact: '', mitigation: '' }),
    removeAt: (i) => state.riskItems.splice(i, 1),
    renderFields: (r, grid) => {
      grid.appendChild(itemCell('Kind', ctrlSelect(r, 'kind', RISK_KIND_OPTIONS, 'Kind —')));
      grid.appendChild(itemCell('Name', ctrlText(r, 'name')));
      grid.appendChild(itemCell('Probability', ctrlSelect(r, 'probability', PRIORITY_OPTIONS, 'Probability —')));
      grid.appendChild(itemCell('Impact', ctrlSelect(r, 'impact', PRIORITY_OPTIONS, 'Impact —')));
      grid.appendChild(itemCell('Mitigation', ctrlTextarea(r, 'mitigation', 2)));
    }
  }));
  return card;
}

function renderStep12() {
  const card = sectionCard({
    stepNumber: 12,
    title: 'Summary, Maturity & Sign-off',
    description: 'Glossary, a live maturity preview, an optional maturity override, and the sign-off.'
  });
  card.appendChild(subHead('Glossary'));
  card.appendChild(listEditor({
    title: 'Glossary terms (max 25)', max: 25,
    getItems: () => state.glossaryTerms,
    add: () => state.glossaryTerms.push({ ordinal: state.glossaryTerms.length + 1, term: '', definition: '' }),
    removeAt: (i) => state.glossaryTerms.splice(i, 1),
    renderFields: (gt, grid) => {
      grid.appendChild(itemCell('Term', ctrlText(gt, 'term')));
      grid.appendChild(itemCell('Definition', ctrlText(gt, 'definition')));
    }
  }));

  // Live maturity preview.
  const preview = document.createElement('div');
  preview.id = 'maturity-preview';
  preview.className = 'maturity-preview';
  card.appendChild(preview);

  card.appendChild(subHead('Override & sign-off'));
  card.appendChild(grid('two-col', [
    selectField({ label: 'Maturity override', path: 'finalMaturityOverride', options: MATURITY_OPTIONS, placeholderLabel: 'None (use computed)' }),
    selectField({ label: 'Recommendation', path: 'recommendation', options: RECOMMENDATION_OPTIONS })
  ]));
  card.appendChild(textAreaField({ label: 'Override reason', path: 'finalMaturityOverrideReason', rows: 2 }));
  card.appendChild(textAreaField({ label: 'Additional notes', path: 'additionalNotes', rows: 3 }));
  card.appendChild(grid('two-col', [
    textField({ label: 'Signed by', path: 'signedBy' }),
    textField({ label: 'Signed at', path: 'signedAt', type: 'datetime-local' })
  ]));
  return card;
}

const STEP_RENDERERS = [
  renderStep1, renderStep2, renderStep3, renderStep4,
  renderStep5, renderStep6, renderStep7, renderStep8,
  renderStep9, renderStep10, renderStep11, renderStep12
];

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, title: 'Intro' },
  { step: 2, title: 'Constraints' },
  { step: 3, title: 'Context' },
  { step: 4, title: 'Strategy' },
  { step: 5, title: 'Blocks' },
  { step: 6, title: 'Runtime' },
  { step: 7, title: 'Deployment' },
  { step: 8, title: 'Crosscutting' },
  { step: 9, title: 'Decisions' },
  { step: 10, title: 'Quality' },
  { step: 11, title: 'Risks' },
  { step: 12, title: 'Summary' }
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

function updateStepListStatuses(byS) {
  const ol = document.getElementById('step-list');
  if (!ol) return;
  let firstUnfinished = -1;
  for (const def of STEP_DEFINITIONS) {
    const li = ol.querySelector(`[data-step="${def.step}"]`);
    if (!li) continue;
    const c = byS[def.step];
    if (c === 'complete') {
      li.dataset.status = 'finished';
      li.removeAttribute('aria-current');
    } else if (c === 'partial') {
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
// Progress + live maturity preview
// ----------------------------------------------------------------------

const MATURITY_CLASS = {
  'draft': 'maturity-draft',
  'reviewable': 'maturity-reviewable',
  'ready': 'maturity-ready',
  'mature': 'maturity-mature'
};

function refreshProgress() {
  const byS = computeCompleteness(state);
  const complete = completeSectionCount(byS);
  const percent = Math.round((complete / TOTAL_STEPS) * 100);
  const bar = document.getElementById('progress');
  if (bar) bar.value = percent;
  const text = document.getElementById('progress-text');
  if (text) text.textContent = `${complete} of ${TOTAL_STEPS} sections complete (${percent}%)`;
  updateStepListStatuses(byS);
  updateMaturityPreview();
}

function completenessGrid(byS) {
  const items = [];
  for (let i = 1; i <= 12; i++) {
    const c = byS[i] || 'empty';
    const cls = c === 'complete' ? 'text-complete' : c === 'partial' ? 'text-partial' : 'text-empty';
    items.push(`
      <li><span class="sec-num">§${i}</span>
        <span class="sec-name">${esc(SECTION_NAMES[i])}</span>
        <span class="sec-state ${cls}">${esc(completenessLabel(c))}</span></li>
    `);
  }
  return `<ul class="completeness-list">${items.join('')}</ul>`;
}

function updateMaturityPreview() {
  const host = document.getElementById('maturity-preview');
  if (!host) return;
  const result = calculateMaturity(state);
  const mClass = MATURITY_CLASS[result.finalMaturity] || '';
  const overridden = result.finalMaturity !== result.computedMaturity;
  host.innerHTML = `
    <h3>Maturity assessment (live)</h3>
    <div class="maturity-grid">
      <div class="maturity-cell">
        <span class="maturity-name">Computed maturity</span>
        <span class="band-badge ${MATURITY_CLASS[result.computedMaturity] || ''}">${esc(maturityLabel(result.computedMaturity))}</span>
      </div>
      <div class="maturity-cell">
        <span class="maturity-name">Final maturity</span>
        <span class="band-badge ${mClass}">${esc(maturityLabel(result.finalMaturity))}${overridden ? ' (overridden)' : ''}</span>
      </div>
    </div>
    <h4>Completeness by section</h4>
    ${completenessGrid(result.completenessBySection)}
    ${result.additionalFlags.length > 0 ? `<p class="muted">${result.additionalFlags.length} flagged issue(s) — submit for the full report.</p>` : '<p class="muted">No flagged issues.</p>'}
  `;
}

// ----------------------------------------------------------------------
// Validation (arc42 has no hard-required fields; completeness drives grading)
// ----------------------------------------------------------------------

function renderErrorSummary(errors) {
  const summary = document.getElementById('error-summary');
  if (!summary) return;
  if (!errors || errors.length === 0) {
    summary.hidden = true;
    summary.innerHTML = '';
    return;
  }
  summary.hidden = false;
  summary.innerHTML = `
    <strong>Please correct the following:</strong>
    <ul>${errors.map((e) => `<li><a href="#${esc(e.id)}">${esc(e.message)}</a></li>`).join('')}</ul>
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

  const {
    computedMaturity,
    finalMaturity,
    completenessBySection,
    firedRules,
    additionalFlags,
    timestamp
  } = lastResult;

  const a = state.architecture;
  const overridden = finalMaturity !== computedMaturity;

  const flagsList = additionalFlags.length === 0
    ? `<p class="muted">No flagged issues raised.</p>`
    : `
      <ul class="flags">
        ${additionalFlags.map((f) => `
          <li class="${priorityClass(f.priority)}">
            <span class="flag-priority">${esc(f.priority.toUpperCase())}</span>
            <span class="flag-category">${esc(f.category)}</span>
            <span class="flag-message">${esc(f.description)}</span>
          </li>
        `).join('')}
      </ul>
    `;

  const firedRows = firedRules.map((r) => `
    <tr>
      <th scope="row">${esc(r.ruleId)}</th>
      <td>${esc(r.description)}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No rules fired.</p>`
    : `
      <table class="subscales">
        <thead><tr><th scope="col">Rule</th><th scope="col">Finding</th></tr></thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const signOff = state.signedBy
    ? `<p class="muted">Signed: ${esc(state.signedBy)} · ${esc(state.signedAt || '—')}</p>`
    : `<p class="muted">Signed: ____________________ &nbsp; Date: ____________</p>`;

  out.innerHTML = `
    <h2>arc42 Architecture Maturity Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())} · ${esc(a.name || 'Untitled architecture')}</p>

    <div class="maturity-banner band-badge ${MATURITY_CLASS[finalMaturity] || ''}">
      <span class="maturity-banner-label">${esc(maturityLabel(finalMaturity))}</span>
      ${overridden ? `<span class="maturity-banner-sub">Computed: ${esc(maturityLabel(computedMaturity))} (overridden)</span>` : ''}
      ${state.recommendation ? `<span class="maturity-banner-sub">Recommendation: ${esc(recommendationLabel(state.recommendation))}</span>` : ''}
    </div>

    <h3>Title block</h3>
    <div class="title-grid">
      <div><span class="tg-label">Version</span> ${esc(a.version || '—')}</div>
      <div><span class="tg-label">Owner</span> ${esc(a.owner || '—')}</div>
      <div><span class="tg-label">Status</span> ${esc(a.status || '—')}</div>
      <div><span class="tg-label">Author</span> ${esc(state.authorName || '—')}</div>
      <div><span class="tg-label">Role</span> ${esc(state.authorRole || '—')}</div>
      <div><span class="tg-label">Date</span> ${esc(state.documentDate || '—')}</div>
    </div>
    ${a.description ? `<p class="report-desc">${esc(a.description)}</p>` : ''}

    <h3>Completeness by section</h3>
    ${completenessGrid(completenessBySection)}

    <h3>Flagged issues for review</h3>
    ${flagsList}

    <h3>Maturity assessment justification</h3>
    ${firedTable}

    <h3>Sign-off</h3>
    ${state.additionalNotes ? `<p class="report-desc">${esc(state.additionalNotes)}</p>` : ''}
    ${signOff}

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
  renderErrorSummary([]);
  const result = calculateMaturity(state);
  lastResult = {
    ...result,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh document?')) return;
  clearState();
  state = emptyDocumentation();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the maturity report.</p>';
  renderErrorSummary([]);
  renderForm();
  refreshProgress();
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
  refreshProgress();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
