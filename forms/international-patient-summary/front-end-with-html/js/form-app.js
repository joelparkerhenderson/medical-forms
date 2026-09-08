import { detectAdditionalFlags } from './flagged-issues.js';
import { completenessLevelClass, completenessLevelLabel, validateIPS } from './ips-validator.js';
import { emptyAssessment } from './types.js';
import { sectionPopulationCheckers } from './validation-rules.js';

// International Patient Summary - clinician wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the
// page in document order. The user scrolls through them; a sticky
// top-of-page progress summary reflects how many fields have been
// answered. Submission runs the pure IPS completeness validator and
// renders an inline report. State is persisted to localStorage so a
// partial fill survives a page reload.

const TOTAL_SECTIONS = 10;

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'international-patient-summary.front-end-form-with-html.v1';

/** @returns {import('./types.js').AssessmentData} */
// Merge a possibly-partial or foreign-shaped object onto a fresh default
// state, keeping only known fields. Shared by localStorage restore
// (loadState) and JSON import (js/form-import.js, via
// window.__FORM_STATE__.setState) so both paths tolerate the same
// drift -- an older export, a hand-edited file, or a differently-
// shaped upload.
function mergeIntoDefaults(parsed) {
  // Merge over a fresh empty so any newly-added fields default
  // correctly. Arrays are replaced wholesale (the user might have
  // legitimately emptied them); object sub-trees are merged
  // shallowly so new fields default rather than appearing as
  // `undefined`.
  const fresh = emptyAssessment();

  for (const key of Object.keys(fresh)) {
    const incoming = parsed ? parsed[key] : undefined;
    if (incoming === undefined || incoming === null) continue;
    if (Array.isArray(fresh[key])) {
      if (Array.isArray(incoming)) fresh[key] = incoming;
    } else if (typeof fresh[key] === 'object') {
      if (typeof incoming === 'object' && !Array.isArray(incoming)) {
        fresh[key] = { ...fresh[key], ...incoming };
      }
    } else {
      fresh[key] = incoming;
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
    console.warn('Could not parse saved IPS; starting fresh.', e);
    return emptyAssessment();
  }
}

/** @param {import('./types.js').AssessmentData} state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save IPS to localStorage.', e);
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear stored IPS.', e);
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

/** @type {import('./types.js').AssessmentData} */
let state = loadState();

/** @type {import('./types.js').GradingResult | null} */
let lastResult = null;

// Uniform, minimal cross-module contract for the shared js/form-export.js and
// js/form-import.js snippets (mirrors the existing window.__A11Y_DRAFT_KEY__
// pattern above) -- keeps the actual export/import logic in one form-agnostic
// module while each form-app.js owns its own private `state`.
window.__FORM_STATE__ = {
  slug: 'international-patient-summary',
  hadDraftAtLoad,
  getState: () => state,
  setState: (raw) => {
    state = mergeIntoDefaults(raw);
    saveState(state);
    lastResult = null;
    document.getElementById('report').innerHTML =
      '<p class="empty-message">Submit the form to see the IPS validation report.</p>';
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
 * Set a deeply-nested field on the state and persist.
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
 *           placeholder?: string, required?: boolean, min?: number,
 *           max?: number, step?: number, unit?: string }} opts
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
    if (type === 'number') {
      v = v === '' ? null : Number(v);
    }
    setField(opts.section, opts.field, v);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Build a labelled multi-line text area.
 * @param {{ label: string, section: string, field: string, rows?: number,
 *           placeholder?: string }} opts
 */
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
    <span class="error-message" id="${id}-error"></span>
  `;
  const ta = wrapper.querySelector('textarea');
  ta.addEventListener('input', () => {
    setField(opts.section, opts.field, ta.value);
    clearFieldError(id);
  });
  return wrapper;
}

/**
 * Build a select / dropdown input.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[] }} opts
 */
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

  wrapper.innerHTML = `
    <label class="label" for="${id}">${esc(opts.label)}</label>
    <select id="${id}" name="${id}" class="select" aria-describedby="${id}-error">
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

/**
 * Build a radio group.
 * @param {{ label: string, section: string, field: string,
 *           options: { value: string, label: string }[] }} opts
 */
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

/**
 * Build a section card.
 * @param {{ stepNumber: number, title: string, description?: string,
 *           mandatory?: boolean }} opts
 */
function sectionCard(opts) {
  const card = document.createElement('fieldset');
  card.className = 'fieldset';
  card.dataset.step = String(opts.stepNumber);
  card.id = `step-${opts.stepNumber}`;
  const desc = opts.description
    ? `<span class="section-description">${esc(opts.description)}</span>`
    : '';
  const badge = opts.mandatory
    ? '<span class="mandatory-badge">Mandatory</span>'
    : '<span class="optional-badge">Optional</span>';
  const legend = document.createElement('legend');
  legend.className = 'fieldset-legend';
  legend.innerHTML = `
    <span class="section-step">Section ${opts.stepNumber} of ${TOTAL_SECTIONS}</span>
    <span class="section-title">${esc(opts.title)} ${badge}</span>
    ${desc}
  `;
  card.appendChild(legend);
  return card;
}

// ----------------------------------------------------------------------
// Generic repeating-list editor
// ----------------------------------------------------------------------

/**
 * Editor for an array of object rows. Each cell is described by a
 * `{ key, label, placeholder, type, options }` descriptor. Renders all
 * rows, an empty-state line, and an "add" button. Persists on every
 * change and updates progress.
 *
 * @param {{
 *   section: string,
 *   addLabel: string,
 *   emptyLabel: string,
 *   gridClass: string,
 *   cells: Array<{ key: string, label: string, placeholder?: string,
 *                  type?: 'text' | 'date' | 'select',
 *                  options?: { value: string, label: string }[] }>,
 *   newRow: () => Record<string, string>
 * }} opts
 */
function listEditor(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-editor';
  wrapper.dataset.list = opts.section;

  function buildCell(row, idx, cell) {
    const cellLabel = `<span>${esc(cell.label)}</span>`;
    if (cell.type === 'select') {
      const optsHtml = [
        `<option value="">— Select —</option>`,
        ...(cell.options || []).map((o) =>
          `<option value="${esc(o.value)}"${o.value === row[cell.key] ? ' selected' : ''}>${esc(o.label)}</option>`
        )
      ].join('');
      return `
        <label class="list-cell">
          ${cellLabel}
          <select class="select" data-key="${esc(cell.key)}">${optsHtml}</select>
        </label>
      `;
    }
    const type = cell.type || 'text';
    return `
      <label class="list-cell">
        ${cellLabel}
        <input type="${type}" class="${lilyInputClass(type)}" data-key="${esc(cell.key)}"
               value="${esc(row[cell.key] ?? '')}"
               ${cell.placeholder ? `placeholder="${esc(cell.placeholder)}"` : ''}>
      </label>
    `;
  }

  function rerender() {
    const rows = state[opts.section];
    wrapper.innerHTML = '';
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'list-empty';
      empty.textContent = opts.emptyLabel;
      wrapper.appendChild(empty);
    }
    rows.forEach((row, idx) => {
      const r = document.createElement('div');
      r.className = 'list-row';
      const cellsHtml = opts.cells.map((cell) => buildCell(row, idx, cell)).join('');
      r.innerHTML = `
        <div class="list-grid ${esc(opts.gridClass)}">
          ${cellsHtml}
          <button type="button" class="button" data-variant="icon" aria-label="Remove row">&times;</button>
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
    addBtn.textContent = `+ ${opts.addLabel}`;
    addBtn.addEventListener('click', () => {
      rows.push(opts.newRow());
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
// Section renderers (1 per IPS step)
// ----------------------------------------------------------------------

const yesNo = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Patient Demographics',
    description: 'Identifying details for the patient. Required for cross-border patient matching.',
    mandatory: true
  });

  const nameGrid = document.createElement('div');
  nameGrid.className = 'two-col';
  nameGrid.appendChild(textInput({
    label: 'Given name(s)',
    section: 'patientDemographics', field: 'givenName',
    required: true
  }));
  nameGrid.appendChild(textInput({
    label: 'Family name',
    section: 'patientDemographics', field: 'familyName',
    required: true
  }));
  card.appendChild(nameGrid);

  const dobGrid = document.createElement('div');
  dobGrid.className = 'two-col';
  dobGrid.appendChild(textInput({
    label: 'Date of birth',
    section: 'patientDemographics', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  dobGrid.appendChild(selectInput({
    label: 'Sex',
    section: 'patientDemographics', field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
      { value: 'unknown', label: 'Unknown' }
    ]
  }));
  card.appendChild(dobGrid);

  card.appendChild(textInput({
    label: 'National identifier (e.g. NHS number, EHIC, NIE)',
    section: 'patientDemographics', field: 'nationalIdentifier',
    placeholder: 'Country-specific patient ID'
  }));

  card.appendChild(textInput({
    label: 'Address line',
    section: 'patientDemographics', field: 'addressLine'
  }));

  const addrGrid = document.createElement('div');
  addrGrid.className = 'three-col';
  addrGrid.appendChild(textInput({
    label: 'City', section: 'patientDemographics', field: 'city'
  }));
  addrGrid.appendChild(textInput({
    label: 'Postal code', section: 'patientDemographics', field: 'postalCode'
  }));
  addrGrid.appendChild(textInput({
    label: 'Country (ISO 3166)',
    section: 'patientDemographics', field: 'country',
    placeholder: 'e.g. GB, IE, DE'
  }));
  card.appendChild(addrGrid);

  const contactGrid = document.createElement('div');
  contactGrid.className = 'two-col';
  contactGrid.appendChild(textInput({
    label: 'Preferred language (BCP-47)',
    section: 'patientDemographics', field: 'preferredLanguage',
    placeholder: 'e.g. en-GB, cy, fr-FR'
  }));
  contactGrid.appendChild(textInput({
    label: 'Contact phone',
    section: 'patientDemographics', field: 'contactPhone',
    type: 'tel'
  }));
  card.appendChild(contactGrid);

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Problem List',
    description: 'Active and past problems. Use ICD-10 (or SNOMED CT) coding where possible.',
    mandatory: true
  });

  card.appendChild(listEditor({
    section: 'problemList',
    addLabel: 'Add problem',
    emptyLabel: 'No problems recorded.',
    gridClass: 'problem-grid',
    cells: [
      { key: 'description', label: 'Description', placeholder: 'e.g. Type 2 diabetes' },
      { key: 'icd10Code', label: 'ICD-10 code', placeholder: 'e.g. E11.9' },
      { key: 'onsetDate', label: 'Onset date', type: 'date' },
      {
        key: 'status', label: 'Status', type: 'select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'resolved', label: 'Resolved' }
        ]
      }
    ],
    newRow: () => ({ description: '', icd10Code: '', onsetDate: '', status: '' })
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Medication Summary',
    description: 'Current and recent medications. Use ATC coding where possible.',
    mandatory: true
  });

  card.appendChild(listEditor({
    section: 'medicationSummary',
    addLabel: 'Add medication',
    emptyLabel: 'No medications recorded.',
    gridClass: 'medication-grid',
    cells: [
      { key: 'name', label: 'Name', placeholder: 'e.g. Metformin' },
      { key: 'atcCode', label: 'ATC code', placeholder: 'e.g. A10BA02' },
      { key: 'dose', label: 'Dose', placeholder: 'e.g. 500 mg' },
      { key: 'frequency', label: 'Frequency', placeholder: 'e.g. BD' },
      { key: 'route', label: 'Route', placeholder: 'e.g. PO' }
    ],
    newRow: () => ({ name: '', atcCode: '', dose: '', frequency: '', route: '' })
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Allergies & Intolerances',
    description: 'Drug, food, and environmental allergies. Add a "no known allergies" entry if applicable.',
    mandatory: true
  });

  card.appendChild(listEditor({
    section: 'allergiesIntolerances',
    addLabel: 'Add allergy / intolerance',
    emptyLabel: 'No allergies recorded.',
    gridClass: 'allergy-grid',
    cells: [
      { key: 'substance', label: 'Substance', placeholder: 'e.g. Penicillin' },
      { key: 'reaction', label: 'Reaction', placeholder: 'e.g. Anaphylaxis' },
      {
        key: 'severity', label: 'Severity', type: 'select',
        options: [
          { value: 'mild', label: 'Mild' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'severe', label: 'Severe' }
        ]
      },
      {
        key: 'criticality', label: 'Criticality', type: 'select',
        options: [
          { value: 'low', label: 'Low' },
          { value: 'high', label: 'High' },
          { value: 'unable-to-assess', label: 'Unable to assess' }
        ]
      }
    ],
    newRow: () => ({ substance: '', reaction: '', severity: '', criticality: '' })
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Immunisations',
    description: 'Vaccinations administered. Required for cross-border occupational and travel care.',
    mandatory: true
  });

  card.appendChild(listEditor({
    section: 'immunisations',
    addLabel: 'Add immunisation',
    emptyLabel: 'No immunisations recorded.',
    gridClass: 'immunisation-grid',
    cells: [
      { key: 'vaccine', label: 'Vaccine', placeholder: 'e.g. Influenza' },
      { key: 'date', label: 'Date administered', type: 'date' },
      { key: 'lotNumber', label: 'Lot number', placeholder: 'Optional' }
    ],
    newRow: () => ({ vaccine: '', date: '', lotNumber: '' })
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Procedures',
    description: 'Significant past procedures and operations relevant to ongoing care.',
    mandatory: true
  });

  card.appendChild(listEditor({
    section: 'procedures',
    addLabel: 'Add procedure',
    emptyLabel: 'No procedures recorded.',
    gridClass: 'procedure-grid',
    cells: [
      { key: 'description', label: 'Procedure', placeholder: 'e.g. Cholecystectomy' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'performer', label: 'Performer / facility', placeholder: 'Hospital or clinician' }
    ],
    newRow: () => ({ description: '', date: '', performer: '' })
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Results & Investigations',
    description: 'Recent diagnostic results and investigations relevant to ongoing care.',
    mandatory: true
  });

  card.appendChild(listEditor({
    section: 'resultsInvestigations',
    addLabel: 'Add result',
    emptyLabel: 'No results recorded.',
    gridClass: 'result-grid',
    cells: [
      { key: 'testName', label: 'Test', placeholder: 'e.g. HbA1c' },
      { key: 'value', label: 'Value', placeholder: 'e.g. 58' },
      { key: 'unit', label: 'Unit', placeholder: 'e.g. mmol/mol' },
      {
        key: 'interpretation', label: 'Interpretation', type: 'select',
        options: [
          { value: 'low', label: 'Low' },
          { value: 'normal', label: 'Normal' },
          { value: 'high', label: 'High' },
          { value: 'critical', label: 'Critical' }
        ]
      },
      { key: 'date', label: 'Date', type: 'date' }
    ],
    newRow: () => ({ testName: '', value: '', unit: '', interpretation: '', date: '' })
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Medical Devices / Implants',
    description: 'Implanted devices and assistive medical equipment. Optional but relevant for imaging and surgery.',
    mandatory: false
  });

  card.appendChild(listEditor({
    section: 'medicalDevices',
    addLabel: 'Add device / implant',
    emptyLabel: 'No devices recorded.',
    gridClass: 'device-grid',
    cells: [
      { key: 'description', label: 'Description', placeholder: 'e.g. Cardiac pacemaker' },
      { key: 'udi', label: 'UDI', placeholder: 'Unique Device Identifier' },
      { key: 'implantDate', label: 'Implant date', type: 'date' }
    ],
    newRow: () => ({ description: '', udi: '', implantDate: '' })
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Advance Directives & Consent',
    description: 'DNR orders, living wills, and patient consent for cross-border IPS exchange.',
    mandatory: false
  });

  card.appendChild(radioGroup({
    label: 'Is a DNR (Do Not Resuscitate) order in place?',
    section: 'advanceDirectives', field: 'dnrInPlace', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Is a living will / advance decision in place?',
    section: 'advanceDirectives', field: 'livingWillInPlace', options: yesNo
  }));
  card.appendChild(radioGroup({
    label: 'Has the patient consented to share this IPS for cross-border / EU-wide care?',
    section: 'advanceDirectives', field: 'consentToShareEu', options: yesNo
  }));
  card.appendChild(textArea({
    label: 'Directive notes',
    section: 'advanceDirectives', field: 'directiveNotes',
    placeholder: 'Free-text notes about advance directives or consent…',
    rows: 3
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Authoring Clinician & Signoff',
    description: 'Identifies the clinician responsible for compiling and signing this IPS.',
    mandatory: true
  });

  const nameGrid = document.createElement('div');
  nameGrid.className = 'two-col';
  nameGrid.appendChild(textInput({
    label: 'Clinician name',
    section: 'authoringClinician', field: 'clinicianName',
    required: true
  }));
  nameGrid.appendChild(textInput({
    label: 'Role / specialty',
    section: 'authoringClinician', field: 'clinicianRole',
    required: true,
    placeholder: 'e.g. General Practitioner'
  }));
  card.appendChild(nameGrid);

  const orgGrid = document.createElement('div');
  orgGrid.className = 'two-col';
  orgGrid.appendChild(textInput({
    label: 'Organisation',
    section: 'authoringClinician', field: 'organisation',
    required: true
  }));
  orgGrid.appendChild(textInput({
    label: 'Country (ISO 3166)',
    section: 'authoringClinician', field: 'country',
    placeholder: 'e.g. GB'
  }));
  card.appendChild(orgGrid);

  const contactGrid = document.createElement('div');
  contactGrid.className = 'two-col';
  contactGrid.appendChild(textInput({
    label: 'Clinician email',
    section: 'authoringClinician', field: 'email',
    type: 'email'
  }));
  contactGrid.appendChild(textInput({
    label: 'Clinician phone',
    section: 'authoringClinician', field: 'phone',
    type: 'tel'
  }));
  card.appendChild(contactGrid);

  const signoffGrid = document.createElement('div');
  signoffGrid.className = 'two-col';
  signoffGrid.appendChild(textInput({
    label: 'Signoff date',
    section: 'authoringClinician', field: 'signoffDate',
    type: 'date'
  }));
  signoffGrid.appendChild(selectInput({
    label: 'Authoring status',
    section: 'authoringClinician', field: 'authoringStatus',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'final', label: 'Final' }
    ]
  }));
  card.appendChild(signoffGrid);

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

// Tracked scalar fields (object sections only — list sections contribute
// independently below). Listing them explicitly keeps the progress
// fraction stable as the form spec evolves.
const TRACKED_SCALAR_FIELDS = [
  // Patient demographics (required + optional)
  ['patientDemographics', 'givenName'],
  ['patientDemographics', 'familyName'],
  ['patientDemographics', 'dateOfBirth'],
  ['patientDemographics', 'sex'],
  ['patientDemographics', 'nationalIdentifier'],
  ['patientDemographics', 'addressLine'],
  ['patientDemographics', 'city'],
  ['patientDemographics', 'postalCode'],
  ['patientDemographics', 'country'],
  ['patientDemographics', 'preferredLanguage'],
  ['patientDemographics', 'contactPhone'],
  // Advance directives (object section)
  ['advanceDirectives', 'dnrInPlace'],
  ['advanceDirectives', 'livingWillInPlace'],
  ['advanceDirectives', 'consentToShareEu'],
  // Authoring clinician
  ['authoringClinician', 'clinicianName'],
  ['authoringClinician', 'clinicianRole'],
  ['authoringClinician', 'organisation'],
  ['authoringClinician', 'country'],
  ['authoringClinician', 'email'],
  ['authoringClinician', 'phone'],
  ['authoringClinician', 'signoffDate'],
  ['authoringClinician', 'authoringStatus']
];

// List sections each contribute one progress unit when they have at
// least one usable entry. The check delegates to the section
// population checkers in `validation-rules.js`.
const TRACKED_LIST_SECTIONS = [
  ['problemList',           'problemListPopulated'],
  ['medicationSummary',     'medicationsPopulated'],
  ['allergiesIntolerances', 'allergiesPopulated'],
  ['immunisations',         'immunisationsPopulated'],
  ['procedures',            'proceduresPopulated'],
  ['resultsInvestigations', 'resultsPopulated'],
  ['medicalDevices',        'devicesPopulated']
];

function updateProgress() {
  let answered = 0;
  const sectionAnswered = {};
  const sectionTotal = {};
  for (const [section, field] of TRACKED_SCALAR_FIELDS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    const v = state[section][field];
    if (v !== null && v !== undefined && v !== '') {
      answered++;
      sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
    }
  }
  for (const [section, checkerName] of TRACKED_LIST_SECTIONS) {
    sectionTotal[section] = (sectionTotal[section] || 0) + 1;
    const checker = sectionPopulationCheckers[checkerName];
    if (checker && checker(state)) {
      answered++;
      sectionAnswered[section] = (sectionAnswered[section] || 0) + 1;
    }
  }
  const total = TRACKED_SCALAR_FIELDS.length + TRACKED_LIST_SECTIONS.length;
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
  { step: 1,  section: 'patientDemographics',     title: 'Demographics' },
  { step: 2,  section: 'problemList',             title: 'Problems' },
  { step: 3,  section: 'medicationSummary',       title: 'Medications' },
  { step: 4,  section: 'allergiesIntolerances',   title: 'Allergies' },
  { step: 5,  section: 'immunisations',           title: 'Immunisations' },
  { step: 6,  section: 'procedures',              title: 'Procedures' },
  { step: 7,  section: 'resultsInvestigations',   title: 'Results' },
  { step: 8,  section: 'medicalDevices',          title: 'Devices' },
  { step: 9,  section: 'advanceDirectives',       title: 'Directives' },
  { step: 10, section: 'authoringClinician',      title: 'Signoff' }
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
      const label = labelEl
        ? labelEl.textContent.replace(/\s*\*\s*$/, '').trim()
        : id;
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
    case 'urgent': return 'flag-urgent';
    case 'high':   return 'flag-high';
    case 'medium': return 'flag-medium';
    case 'low':    return 'flag-low';
    default:       return '';
  }
}

function statusPillClass(status) {
  switch (status) {
    case 'ok':       return 'status-ok';
    case 'empty':    return 'status-empty';
    case 'optional': return 'status-optional';
    default:         return '';
  }
}

function statusLabel(status) {
  switch (status) {
    case 'ok':       return 'Populated';
    case 'empty':    return 'Empty';
    case 'optional': return 'Optional — empty';
    default:         return status;
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    completenessLevel,
    mandatoryPopulated, mandatoryTotal,
    optionalPopulated, optionalTotal,
    firedRules, additionalFlags, timestamp
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
      <td>${esc(r.category)}${r.mandatory ? '' : ' <span class="optional-badge">Optional</span>'}</td>
      <td>${esc(r.description)}</td>
      <td><span class="status-pill ${statusPillClass(r.status)}">${esc(statusLabel(r.status))}</span></td>
    </tr>
  `).join('');

  const firedTable = `
    <table class="subscales">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Section</th>
          <th scope="col">Requirement</th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>${firedRows}</tbody>
    </table>
  `;

  out.innerHTML = `
    <h2>IPS Completeness Report</h2>
    <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>

    <h3>Completeness Level</h3>
    <p class="ips-summary">
      <span class="ips-score-badge ${completenessLevelClass(completenessLevel)}">
        ${esc(completenessLevelLabel(completenessLevel))}
      </span>
      <span class="completeness-level">
        ${mandatoryPopulated} / ${mandatoryTotal} mandatory sections,
        ${optionalPopulated} / ${optionalTotal} optional sections populated
      </span>
    </p>

    <h3>Per-section validation</h3>
    ${firedTable}

    <h3>Flagged Issues</h3>
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
  const {
    completenessLevel,
    mandatoryPopulated, mandatoryTotal,
    optionalPopulated, optionalTotal,
    firedRules
  } = validateIPS(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    completenessLevel,
    mandatoryPopulated,
    mandatoryTotal,
    optionalPopulated,
    optionalTotal,
    firedRules,
    additionalFlags,
    timestamp: new Date().toISOString()
  };
  renderReport();
}

function startOver() {
  if (!confirm('Clear all answers and start a fresh IPS?')) return;
  clearState();
  state = emptyAssessment();
  lastResult = null;
  document.getElementById('report').innerHTML =
    '<p class="empty-message">Submit the form to see the IPS validation report.</p>';
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
