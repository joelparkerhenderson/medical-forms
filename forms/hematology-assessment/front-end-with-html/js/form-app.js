import { detectAdditionalFlags } from './flagged-issues.js';
import { calculateAbnormality } from './hematology-grader.js';
import { abnormalityLevelClass, abnormalityLevelLabel, bloodCountScore, coagulationScore, collectNumericItems, emptyAssessment, ironStudiesScore } from './types.js';

// Hematology Assessment - clinician wizard (vanilla JavaScript, no build).
//
// Single-page continuous wizard: every section is rendered into the page in
// document order. The user scrolls through them; a sticky top-of-page
// progress summary reflects how many tracked fields have been answered.
// Submission runs the pure hematology grader and renders an inline report.
// State is persisted to localStorage so a partial fill survives a reload.

// ----------------------------------------------------------------------
// Persistence
// ----------------------------------------------------------------------

const STORAGE_KEY = 'hematology-assessment.front-end-form-with-html.v1';

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
      fresh[key] = Object.assign({}, fresh[key], parsed[key]);
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
  slug: 'hematology-assessment',
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
    refreshAutoCalculatedReadouts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

/**
 * Set a deeply-nested field on the state and persist.
 * Re-runs progress and refreshes auto-calculated readouts after each change.
 *
 * @param {string} section
 * @param {string} field
 * @param {*} value
 */
function setField(section, field, value) {
  state[section][field] = value;
  saveState(state);
  updateProgress();
  refreshAutoCalculatedReadouts();
}

/** Escape user-entered text for safe rendering. */
function esc(s) {
  return String(s == null ? '' : s)
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

/**
 * Build a labelled text input.
 * @param {{ label: string, section: string, field: string, type?: string,
 *           placeholder?: string, required?: boolean, min?: number,
 *           max?: number, step?: number, unit?: string }} opts
 */
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
    `value="${esc(value == null ? '' : value)}"`
  ];
  if (opts.placeholder) attrs.push(`placeholder="${esc(opts.placeholder)}"`);
  if (opts.required) attrs.push('required', 'data-required');
  if (opts.min !== undefined) attrs.push(`min="${opts.min}"`);
  if (opts.max !== undefined) attrs.push(`max="${opts.max}"`);
  if (opts.step !== undefined) attrs.push(`step="${opts.step}"`);

  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  wrapper.innerHTML = `
    <label for="${id}">${labelText}</label>
    <div class="input-row">
      <input ${attrs.join(' ')}>
      ${opts.unit ? `<span class="unit">${esc(opts.unit)}</span>` : ''}
    </div>
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

/**
 * Build a labelled multi-line text area.
 * @param {{ label: string, section: string, field: string, rows?: number,
 *           placeholder?: string }} opts
 */
function textArea(opts) {
  const id = `${opts.section}-${opts.field}`;
  const value = state[opts.section][opts.field] || '';
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
  ta.addEventListener('input', () => { setField(opts.section, opts.field, ta.value); clearFieldError(id); });
  return wrapper;
}

/**
 * Build a select / dropdown input.
 * @param {{ label: string, section: string, field: string, numeric?: boolean,
 *           options: { value: string, label: string }[] }} opts
 */
function selectInput(opts) {
  const id = `${opts.section}-${opts.field}`;
  const rawCurrent = state[opts.section][opts.field];
  const current = rawCurrent == null ? '' : String(rawCurrent);
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
    <span class="error-message" id="${id}-error" aria-live="polite"></span>
  `;
  const sel = wrapper.querySelector('select');
  sel.addEventListener('change', () => {
    let v = sel.value;
    if (opts.numeric) v = v === '' ? null : Number(v);
    setField(opts.section, opts.field, v);
  });
  return wrapper;
}

/**
 * Read-only auto-calculated readout (e.g. dimension scores).
 * @param {{ label: string, id: string, render: () => string }} opts
 */
function readOnlyReadout(opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field readout';
  wrapper.innerHTML = `
    <label>${esc(opts.label)}</label>
    <div id="${opts.id}" class="readout-value">${opts.render()}</div>
  `;
  return wrapper;
}

/**
 * Build a section card.
 * @param {{ stepNumber: number, title: string, description?: string }} opts
 */
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
// Reusable option lists
// ----------------------------------------------------------------------

const screenOptions = [
  { value: 'negative', label: 'Negative' },
  { value: 'positive', label: 'Positive' },
  { value: 'notPerformed', label: 'Not Performed' }
];

// ----------------------------------------------------------------------
// Section renderers (1 per step)
// ----------------------------------------------------------------------

function renderStep1() {
  const card = sectionCard({
    stepNumber: 1,
    title: 'Patient Information',
    description: 'Patient demographic and specimen details.'
  });

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(textInput({
    label: 'Patient Name', section: 'patientInformation', field: 'patientName',
    placeholder: 'e.g. Jane Smith', required: true
  }));
  row1.appendChild(textInput({
    label: 'Date of Birth', section: 'patientInformation', field: 'dateOfBirth',
    type: 'date', required: true
  }));
  card.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'two-col';
  row2.appendChild(textInput({
    label: 'Medical Record Number', section: 'patientInformation', field: 'medicalRecordNumber',
    placeholder: 'e.g. MRN-123456'
  }));
  row2.appendChild(textInput({
    label: 'Referring Physician', section: 'patientInformation', field: 'referringPhysician',
    placeholder: 'e.g. Dr Johnson'
  }));
  card.appendChild(row2);

  const row3 = document.createElement('div');
  row3.className = 'two-col';
  row3.appendChild(textInput({
    label: 'Clinical Indication', section: 'patientInformation', field: 'clinicalIndication',
    placeholder: 'e.g. Suspected anemia, fatigue'
  }));
  row3.appendChild(textInput({
    label: 'Specimen Date', section: 'patientInformation', field: 'specimenDate',
    type: 'date'
  }));
  card.appendChild(row3);

  card.appendChild(selectInput({
    label: 'Specimen Type',
    section: 'patientInformation', field: 'specimenType',
    options: [
      { value: 'edtaBlood', label: 'EDTA Blood' },
      { value: 'citratedBlood', label: 'Citrated Blood' },
      { value: 'serumSample', label: 'Serum Sample' },
      { value: 'boneMarrow', label: 'Bone Marrow' },
      { value: 'other', label: 'Other' }
    ]
  }));

  return card;
}

function renderStep2() {
  const card = sectionCard({
    stepNumber: 2,
    title: 'Blood Count Analysis',
    description: 'Enter complete blood count (CBC) results. Reference ranges shown alongside each input.'
  });

  function row(left, right) {
    const r = document.createElement('div');
    r.className = 'two-col';
    r.appendChild(left);
    r.appendChild(right);
    return r;
  }

  card.appendChild(row(
    textInput({
      label: 'Hemoglobin', section: 'bloodCountAnalysis', field: 'hemoglobin',
      type: 'number', step: 0.1, unit: 'g/dL', placeholder: 'Normal: 12.0-17.0'
    }),
    textInput({
      label: 'Hematocrit', section: 'bloodCountAnalysis', field: 'hematocrit',
      type: 'number', step: 0.1, unit: '%', placeholder: 'Normal: 36-52'
    })
  ));

  card.appendChild(row(
    textInput({
      label: 'Red Blood Cell Count', section: 'bloodCountAnalysis', field: 'redBloodCellCount',
      type: 'number', step: 0.01, unit: 'x10^12/L', placeholder: 'Normal: 4.0-6.0'
    }),
    textInput({
      label: 'White Blood Cell Count', section: 'bloodCountAnalysis', field: 'whiteBloodCellCount',
      type: 'number', step: 0.1, unit: 'x10^9/L', placeholder: 'Normal: 4.0-11.0'
    })
  ));

  card.appendChild(row(
    textInput({
      label: 'Platelet Count', section: 'bloodCountAnalysis', field: 'plateletCount',
      type: 'number', step: 1, unit: 'x10^9/L', placeholder: 'Normal: 150-400'
    }),
    textInput({
      label: 'Mean Corpuscular Volume', section: 'bloodCountAnalysis', field: 'meanCorpuscularVolume',
      type: 'number', step: 0.1, unit: 'fL', placeholder: 'Normal: 80-100'
    })
  ));

  card.appendChild(row(
    textInput({
      label: 'Mean Corpuscular Hemoglobin', section: 'bloodCountAnalysis', field: 'meanCorpuscularHemoglobin',
      type: 'number', step: 0.1, unit: 'pg', placeholder: 'Normal: 27-33'
    }),
    textInput({
      label: 'Red Cell Distribution Width', section: 'bloodCountAnalysis', field: 'redCellDistributionWidth',
      type: 'number', step: 0.1, unit: '%', placeholder: 'Normal: 11.5-14.5'
    })
  ));

  card.appendChild(readOnlyReadout({
    label: 'Blood-count dimension score',
    id: 'blood-count-readout',
    render: () => renderDimensionScore(bloodCountScore(state))
  }));

  return card;
}

function renderStep3() {
  const card = sectionCard({
    stepNumber: 3,
    title: 'Coagulation Studies',
    description: 'Enter coagulation panel results.'
  });

  function row(left, right) {
    const r = document.createElement('div');
    r.className = 'two-col';
    r.appendChild(left);
    r.appendChild(right);
    return r;
  }

  card.appendChild(row(
    textInput({
      label: 'Prothrombin Time', section: 'coagulationStudies', field: 'prothrombinTime',
      type: 'number', step: 0.1, unit: 'seconds', placeholder: 'Normal: 11.0-13.5'
    }),
    textInput({
      label: 'INR', section: 'coagulationStudies', field: 'inr',
      type: 'number', step: 0.1, placeholder: 'Normal: 0.8-1.2'
    })
  ));

  card.appendChild(row(
    textInput({
      label: 'aPTT', section: 'coagulationStudies', field: 'activatedPartialThromboplastinTime',
      type: 'number', step: 0.1, unit: 'seconds', placeholder: 'Normal: 25-35'
    }),
    textInput({
      label: 'Fibrinogen', section: 'coagulationStudies', field: 'fibrinogen',
      type: 'number', step: 1, unit: 'mg/dL', placeholder: 'Normal: 200-400'
    })
  ));

  card.appendChild(row(
    textInput({
      label: 'D-dimer', section: 'coagulationStudies', field: 'dDimer',
      type: 'number', step: 0.01, unit: 'mg/L', placeholder: 'Normal: <0.5'
    }),
    textInput({
      label: 'Bleeding Time', section: 'coagulationStudies', field: 'bleedingTime',
      type: 'number', step: 0.1, unit: 'minutes', placeholder: 'Normal: 2-7'
    })
  ));

  card.appendChild(readOnlyReadout({
    label: 'Coagulation dimension score',
    id: 'coagulation-readout',
    render: () => renderDimensionScore(coagulationScore(state))
  }));

  return card;
}

function renderStep4() {
  const card = sectionCard({
    stepNumber: 4,
    title: 'Peripheral Blood Film',
    description: 'Describe findings from the peripheral blood smear examination.'
  });

  card.appendChild(textArea({
    label: 'Red Cell Morphology', section: 'peripheralBloodFilm', field: 'redCellMorphology',
    placeholder: 'e.g. Normochromic normocytic, microcytic hypochromic, target cells present'
  }));
  card.appendChild(textArea({
    label: 'White Blood Cell Differential', section: 'peripheralBloodFilm', field: 'whiteBloodCellDifferential',
    placeholder: 'e.g. Neutrophils 60%, Lymphocytes 30%, Monocytes 5%, Eosinophils 3%, Basophils 2%'
  }));
  card.appendChild(textArea({
    label: 'Platelet Morphology', section: 'peripheralBloodFilm', field: 'plateletMorphology',
    rows: 2,
    placeholder: 'e.g. Adequate number, normal morphology'
  }));
  card.appendChild(textArea({
    label: 'Abnormal Cell Morphology', section: 'peripheralBloodFilm', field: 'abnormalCellMorphology',
    placeholder: 'e.g. Blast cells, atypical lymphocytes, schistocytes, or "none"'
  }));

  card.appendChild(selectInput({
    label: 'Film Quality (1-5)',
    section: 'peripheralBloodFilm', field: 'filmQuality',
    numeric: true,
    options: [
      { value: '1', label: '1 - Poor' },
      { value: '2', label: '2 - Below Average' },
      { value: '3', label: '3 - Adequate' },
      { value: '4', label: '4 - Good' },
      { value: '5', label: '5 - Excellent' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Additional Film Comments', section: 'peripheralBloodFilm', field: 'filmComments',
    rows: 2,
    placeholder: 'Any additional observations'
  }));

  return card;
}

function renderStep5() {
  const card = sectionCard({
    stepNumber: 5,
    title: 'Iron Studies',
    description: 'Enter iron panel and reticulocyte results.'
  });

  function row(left, right) {
    const r = document.createElement('div');
    r.className = 'two-col';
    r.appendChild(left);
    r.appendChild(right);
    return r;
  }

  card.appendChild(row(
    textInput({
      label: 'Serum Iron', section: 'ironStudies', field: 'serumIron',
      type: 'number', step: 1, unit: 'mcg/dL', placeholder: 'Normal: 60-170'
    }),
    textInput({
      label: 'Total Iron Binding Capacity', section: 'ironStudies', field: 'totalIronBindingCapacity',
      type: 'number', step: 1, unit: 'mcg/dL', placeholder: 'Normal: 250-370'
    })
  ));

  card.appendChild(row(
    textInput({
      label: 'Transferrin Saturation', section: 'ironStudies', field: 'transferrinSaturation',
      type: 'number', step: 1, unit: '%', placeholder: 'Normal: 20-50'
    }),
    textInput({
      label: 'Serum Ferritin', section: 'ironStudies', field: 'serumFerritin',
      type: 'number', step: 1, unit: 'ng/mL', placeholder: 'Normal: 20-250'
    })
  ));

  card.appendChild(textInput({
    label: 'Reticulocyte Count', section: 'ironStudies', field: 'reticulocyteCount',
    type: 'number', step: 0.1, unit: '%', placeholder: 'Normal: 0.5-2.5'
  }));

  card.appendChild(readOnlyReadout({
    label: 'Iron-studies dimension score',
    id: 'iron-readout',
    render: () => renderDimensionScore(ironStudiesScore(state))
  }));

  return card;
}

function renderStep6() {
  const card = sectionCard({
    stepNumber: 6,
    title: 'Hemoglobinopathy Screening',
    description: 'Enter hemoglobinopathy screening and genetic testing results.'
  });

  card.appendChild(textArea({
    label: 'Hemoglobin Electrophoresis',
    section: 'hemoglobinopathyScreening', field: 'hemoglobinElectrophoresis',
    placeholder: 'e.g. HbA 97%, HbA2 2.5%, HbF 0.5%'
  }));

  const row = document.createElement('div');
  row.className = 'two-col';
  row.appendChild(selectInput({
    label: 'Sickle Cell Screen',
    section: 'hemoglobinopathyScreening', field: 'sickleCellScreen',
    options: screenOptions
  }));
  row.appendChild(selectInput({
    label: 'Thalassemia Screen',
    section: 'hemoglobinopathyScreening', field: 'thalassemiaScreen',
    options: screenOptions
  }));
  card.appendChild(row);

  card.appendChild(textArea({
    label: 'HPLC Results', section: 'hemoglobinopathyScreening', field: 'hplcResults',
    rows: 2,
    placeholder: 'e.g. Normal pattern, no variant hemoglobins detected'
  }));
  card.appendChild(textArea({
    label: 'Genetic Testing Notes', section: 'hemoglobinopathyScreening', field: 'geneticTestingNotes',
    rows: 2,
    placeholder: 'Any relevant genetic testing findings'
  }));

  return card;
}

function renderStep7() {
  const card = sectionCard({
    stepNumber: 7,
    title: 'Bone Marrow Assessment',
    description: 'Enter bone marrow aspirate and biopsy findings if applicable.'
  });

  card.appendChild(textArea({
    label: 'Aspirate Findings', section: 'boneMarrowAssessment', field: 'aspirateFindings',
    placeholder: 'e.g. Adequate cellularity, trilineage hematopoiesis present'
  }));
  card.appendChild(textArea({
    label: 'Biopsy Findings', section: 'boneMarrowAssessment', field: 'biopsyFindings',
    placeholder: 'e.g. Normocellular marrow for age, no fibrosis'
  }));

  card.appendChild(selectInput({
    label: 'Cellularity Rating (1-5)',
    section: 'boneMarrowAssessment', field: 'cellularity',
    numeric: true,
    options: [
      { value: '1', label: '1 - Markedly Hypocellular' },
      { value: '2', label: '2 - Hypocellular' },
      { value: '3', label: '3 - Normocellular' },
      { value: '4', label: '4 - Hypercellular' },
      { value: '5', label: '5 - Markedly Hypercellular' }
    ]
  }));

  card.appendChild(textArea({
    label: 'Cytogenetics Results', section: 'boneMarrowAssessment', field: 'cytogeneticsResults',
    rows: 2,
    placeholder: 'e.g. Normal karyotype 46,XX or 46,XY'
  }));
  card.appendChild(textArea({
    label: 'Flow Cytometry Results', section: 'boneMarrowAssessment', field: 'flowCytometryResults',
    rows: 2,
    placeholder: 'e.g. No aberrant immunophenotype detected'
  }));
  card.appendChild(textArea({
    label: 'Additional Comments', section: 'boneMarrowAssessment', field: 'boneMarrowComments',
    rows: 2,
    placeholder: 'Any additional bone marrow findings'
  }));

  return card;
}

function renderStep8() {
  const card = sectionCard({
    stepNumber: 8,
    title: 'Transfusion History',
    description: "Document the patient's transfusion history and blood group information."
  });

  const row1 = document.createElement('div');
  row1.className = 'two-col';
  row1.appendChild(selectInput({
    label: 'Previous Transfusions',
    section: 'transfusionHistory', field: 'previousTransfusions',
    options: [
      { value: 'none', label: 'None' },
      { value: '1to5', label: '1-5 transfusions' },
      { value: '6to20', label: '6-20 transfusions' },
      { value: 'moreThan20', label: 'More than 20 transfusions' },
      { value: 'chronicDependent', label: 'Chronic transfusion-dependent' }
    ]
  }));
  row1.appendChild(selectInput({
    label: 'Transfusion Reactions',
    section: 'transfusionHistory', field: 'transfusionReactions',
    options: [
      { value: 'none', label: 'None' },
      { value: 'febrile', label: 'Febrile non-hemolytic' },
      { value: 'allergic', label: 'Allergic' },
      { value: 'hemolytic', label: 'Hemolytic' },
      { value: 'trali', label: 'TRALI' },
      { value: 'other', label: 'Other' }
    ]
  }));
  card.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'two-col';
  row2.appendChild(selectInput({
    label: 'Blood Group & Type',
    section: 'transfusionHistory', field: 'bloodGroupType',
    options: [
      { value: 'aPositive', label: 'A Positive' },
      { value: 'aNegative', label: 'A Negative' },
      { value: 'bPositive', label: 'B Positive' },
      { value: 'bNegative', label: 'B Negative' },
      { value: 'abPositive', label: 'AB Positive' },
      { value: 'abNegative', label: 'AB Negative' },
      { value: 'oPositive', label: 'O Positive' },
      { value: 'oNegative', label: 'O Negative' }
    ]
  }));
  row2.appendChild(selectInput({
    label: 'Antibody Screen',
    section: 'transfusionHistory', field: 'antibodyScreen',
    options: screenOptions
  }));
  card.appendChild(row2);

  card.appendChild(textArea({
    label: 'Crossmatch Results', section: 'transfusionHistory', field: 'crossmatchResults',
    rows: 2,
    placeholder: 'e.g. Compatible, no irregularities'
  }));

  return card;
}

function renderStep9() {
  const card = sectionCard({
    stepNumber: 9,
    title: 'Treatment & Medications',
    description: 'Document current treatments, medications, and response to therapy.'
  });

  card.appendChild(textArea({
    label: 'Current Medications',
    section: 'treatmentMedications', field: 'currentMedications',
    placeholder: 'List all current medications and dosages'
  }));
  card.appendChild(textArea({
    label: 'Chemotherapy Regimen (if applicable)',
    section: 'treatmentMedications', field: 'chemotherapyRegimen',
    rows: 2,
    placeholder: 'e.g. R-CHOP cycle 3 of 6, ABVD'
  }));

  const row = document.createElement('div');
  row.className = 'two-col';
  row.appendChild(selectInput({
    label: 'Anticoagulant Therapy',
    section: 'treatmentMedications', field: 'anticoagulantTherapy',
    options: [
      { value: 'none', label: 'None' },
      { value: 'warfarin', label: 'Warfarin' },
      { value: 'heparin', label: 'Heparin' },
      { value: 'lmwh', label: 'LMWH (Enoxaparin)' },
      { value: 'doac', label: 'DOAC (Rivaroxaban/Apixaban)' },
      { value: 'other', label: 'Other' }
    ]
  }));
  row.appendChild(selectInput({
    label: 'Iron Therapy',
    section: 'treatmentMedications', field: 'ironTherapy',
    options: [
      { value: 'none', label: 'None' },
      { value: 'oralIron', label: 'Oral Iron' },
      { value: 'ivIron', label: 'IV Iron' },
      { value: 'both', label: 'Both Oral and IV' }
    ]
  }));
  card.appendChild(row);

  card.appendChild(textArea({
    label: 'Treatment Response',
    section: 'treatmentMedications', field: 'treatmentResponse',
    rows: 2,
    placeholder: 'e.g. Partial response, stable disease, complete remission'
  }));
  card.appendChild(textArea({
    label: 'Adverse Effects',
    section: 'treatmentMedications', field: 'adverseEffects',
    rows: 2,
    placeholder: 'Document any treatment-related adverse effects'
  }));

  return card;
}

function renderStep10() {
  const card = sectionCard({
    stepNumber: 10,
    title: 'Clinical Review',
    description: 'Provide the clinical summary, diagnosis, and follow-up plan.'
  });

  card.appendChild(textArea({
    label: 'Clinical Summary',
    section: 'clinicalReview', field: 'clinicalSummary',
    rows: 4,
    placeholder: 'Summarise key clinical findings and their significance'
  }));
  card.appendChild(textArea({
    label: 'Diagnosis',
    section: 'clinicalReview', field: 'diagnosis',
    rows: 2,
    placeholder: 'e.g. Iron deficiency anemia, chronic disease'
  }));
  card.appendChild(textArea({
    label: 'Follow-up Plan',
    section: 'clinicalReview', field: 'followUpPlan',
    placeholder: 'e.g. Repeat CBC in 4 weeks, iron studies in 3 months'
  }));

  const row = document.createElement('div');
  row.className = 'two-col';
  row.appendChild(selectInput({
    label: 'Urgency Level (1-5)',
    section: 'clinicalReview', field: 'urgencyLevel',
    numeric: true,
    options: [
      { value: '1', label: '1 - Routine' },
      { value: '2', label: '2 - Non-Urgent Follow-up' },
      { value: '3', label: '3 - Semi-Urgent' },
      { value: '4', label: '4 - Urgent' },
      { value: '5', label: '5 - Critical/Emergency' }
    ]
  }));
  row.appendChild(textInput({
    label: 'Reviewer Name',
    section: 'clinicalReview', field: 'reviewerName',
    placeholder: 'e.g. Dr Patel'
  }));
  card.appendChild(row);

  card.appendChild(textInput({
    label: 'Review Date',
    section: 'clinicalReview', field: 'reviewDate',
    type: 'date'
  }));
  card.appendChild(textArea({
    label: 'Additional Notes',
    section: 'clinicalReview', field: 'additionalNotes',
    placeholder: 'Any additional clinical notes or observations'
  }));

  return card;
}

// ----------------------------------------------------------------------
// Auto-calculated readouts
// ----------------------------------------------------------------------

function renderDimensionScore(score) {
  if (score == null) {
    return '<span class="muted">No values entered</span>';
  }
  return `<strong>${score} / 100</strong> <span class="muted">${esc(dimensionScoreLabel(score))}</span>`;
}

function dimensionScoreLabel(score) {
  if (score === 0) return '(all values normal)';
  if (score <= 20) return '(mild deviation)';
  if (score <= 50) return '(moderate deviation)';
  if (score <= 75) return '(severe deviation)';
  return '(critical deviation)';
}

function refreshAutoCalculatedReadouts() {
  const bcc = document.getElementById('blood-count-readout');
  if (bcc) bcc.innerHTML = renderDimensionScore(bloodCountScore(state));
  const cog = document.getElementById('coagulation-readout');
  if (cog) cog.innerHTML = renderDimensionScore(coagulationScore(state));
  const iron = document.getElementById('iron-readout');
  if (iron) iron.innerHTML = renderDimensionScore(ironStudiesScore(state));
}

// ----------------------------------------------------------------------
// Progress
// ----------------------------------------------------------------------

const TRACKED_FIELDS = [
  // Patient Information (5 of 7)
  ['patientInformation', 'patientName'],
  ['patientInformation', 'dateOfBirth'],
  ['patientInformation', 'medicalRecordNumber'],
  ['patientInformation', 'clinicalIndication'],
  ['patientInformation', 'specimenType'],
  // Blood Count (8)
  ['bloodCountAnalysis', 'hemoglobin'],
  ['bloodCountAnalysis', 'hematocrit'],
  ['bloodCountAnalysis', 'redBloodCellCount'],
  ['bloodCountAnalysis', 'whiteBloodCellCount'],
  ['bloodCountAnalysis', 'plateletCount'],
  ['bloodCountAnalysis', 'meanCorpuscularVolume'],
  ['bloodCountAnalysis', 'meanCorpuscularHemoglobin'],
  ['bloodCountAnalysis', 'redCellDistributionWidth'],
  // Coagulation (6)
  ['coagulationStudies', 'prothrombinTime'],
  ['coagulationStudies', 'inr'],
  ['coagulationStudies', 'activatedPartialThromboplastinTime'],
  ['coagulationStudies', 'fibrinogen'],
  ['coagulationStudies', 'dDimer'],
  ['coagulationStudies', 'bleedingTime'],
  // Peripheral Blood Film
  ['peripheralBloodFilm', 'redCellMorphology'],
  ['peripheralBloodFilm', 'whiteBloodCellDifferential'],
  ['peripheralBloodFilm', 'abnormalCellMorphology'],
  ['peripheralBloodFilm', 'filmQuality'],
  // Iron Studies (5)
  ['ironStudies', 'serumIron'],
  ['ironStudies', 'totalIronBindingCapacity'],
  ['ironStudies', 'transferrinSaturation'],
  ['ironStudies', 'serumFerritin'],
  ['ironStudies', 'reticulocyteCount'],
  // Hemoglobinopathy
  ['hemoglobinopathyScreening', 'sickleCellScreen'],
  ['hemoglobinopathyScreening', 'thalassemiaScreen'],
  // Bone Marrow
  ['boneMarrowAssessment', 'cellularity'],
  // Transfusion
  ['transfusionHistory', 'previousTransfusions'],
  ['transfusionHistory', 'transfusionReactions'],
  ['transfusionHistory', 'bloodGroupType'],
  ['transfusionHistory', 'antibodyScreen'],
  // Treatment
  ['treatmentMedications', 'anticoagulantTherapy'],
  ['treatmentMedications', 'ironTherapy'],
  // Clinical Review
  ['clinicalReview', 'clinicalSummary'],
  ['clinicalReview', 'diagnosis'],
  ['clinicalReview', 'urgencyLevel']
];

function updateProgress() {
  let answered = 0;
  for (const [section, field] of TRACKED_FIELDS) {
    const v = state[section][field];
    if (v !== null && v !== undefined && v !== '') answered++;
  }
  const total = TRACKED_FIELDS.length;
  const percent = Math.round((answered / total) * 100);
  const bar = document.getElementById('progress-bar-fill');
  const text = document.getElementById('progress-text');
  if (bar) bar.style.width = `${percent}%`;
  if (text) text.textContent = `${answered} of ${total} fields answered (${percent}%)`;
  const aria = document.getElementById('progress-bar');
  if (aria) aria.setAttribute('aria-valuenow', String(percent));
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

function concernClass(level) {
  switch (level) {
    case 'high': return 'concern-high';
    case 'medium': return 'concern-medium';
    case 'low': return 'concern-low';
    default: return '';
  }
}

function renderReport() {
  if (!lastResult) return;
  const out = document.getElementById('report');
  if (!out) return;

  const {
    abnormalityLevel,
    abnormalityScore,
    answeredCount,
    firedRules,
    additionalFlags,
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
    <tr class="${concernClass(r.concernLevel)}">
      <th scope="row">${esc(r.id)}</th>
      <td>${esc(r.category)}</td>
      <td>${esc(r.description)}</td>
      <td class="num">${esc(r.concernLevel.toUpperCase())}</td>
    </tr>
  `).join('');

  const firedTable = firedRules.length === 0
    ? `<p class="muted">No rules fired.</p>`
    : `
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Category</th>
            <th scope="col">Finding</th>
            <th scope="col">Concern</th>
          </tr>
        </thead>
        <tbody>${firedRows}</tbody>
      </table>
    `;

  const draftNote = abnormalityLevel === 'draft'
    ? `<p class="muted">Fewer than 3 numeric lab values were entered, so the assessment is shown as a draft. Enter at least three numeric results to generate a graded report.</p>`
    : '';

  const bcc = bloodCountScore(state);
  const cog = coagulationScore(state);
  const iron = ironStudiesScore(state);

  out.innerHTML = `
    <div class="report-card">
      <header class="report-header">
        <h2>Hematology Assessment Report</h2>
        <p class="muted">Generated ${esc(new Date(timestamp).toLocaleString())}</p>
      </header>

      <h3>Composite Abnormality</h3>
      <p class="act-summary">
        <span class="act-score-badge ${abnormalityLevelClass(abnormalityLevel)}">${abnormalityScore} / 100</span>
        <span class="control-level">${esc(abnormalityLevelLabel(abnormalityLevel))}</span>
      </p>
      <p class="muted">Based on ${answeredCount} numeric lab value${answeredCount === 1 ? '' : 's'}.</p>
      ${draftNote}

      <h3>Dimension scores</h3>
      <table class="subscales">
        <thead>
          <tr>
            <th scope="col">Dimension</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>
          <tr><th scope="row">Blood Count</th><td>${bcc == null ? '<span class="muted">No values</span>' : esc(`${bcc} / 100`)}</td></tr>
          <tr><th scope="row">Coagulation</th><td>${cog == null ? '<span class="muted">No values</span>' : esc(`${cog} / 100`)}</td></tr>
          <tr><th scope="row">Iron Studies</th><td>${iron == null ? '<span class="muted">No values</span>' : esc(`${iron} / 100`)}</td></tr>
        </tbody>
      </table>

      <h3>Fired rules</h3>
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
  const { abnormalityLevel, abnormalityScore, answeredCount, firedRules } =
    calculateAbnormality(state);
  const additionalFlags = detectAdditionalFlags(state);
  lastResult = {
    abnormalityLevel,
    abnormalityScore,
    answeredCount,
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
  refreshAutoCalculatedReadouts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// Step list (table of contents + completion status)
// ----------------------------------------------------------------------

const STEP_DEFINITIONS = [
  { step: 1, section: 'patientInformation', title: 'Patient Information' },
  { step: 2, section: 'bloodCountAnalysis', title: 'Blood Count Analysis' },
  { step: 3, section: 'coagulationStudies', title: 'Coagulation Studies' },
  { step: 4, section: 'peripheralBloodFilm', title: 'Peripheral Blood Film' },
  { step: 5, section: 'ironStudies', title: 'Iron Studies' },
  { step: 6, section: 'hemoglobinopathyScreening', title: 'Hemoglobinopathy Screening' },
  { step: 7, section: 'boneMarrowAssessment', title: 'Bone Marrow Assessment' },
  { step: 8, section: 'transfusionHistory', title: 'Transfusion History' },
  { step: 9, section: 'treatmentMedications', title: 'Treatment & Medications' },
  { step: 10, section: 'clinicalReview', title: 'Clinical Review' }
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
  refreshAutoCalculatedReadouts();

  document.getElementById('submit-btn').addEventListener('click', submitForm);
  document.getElementById('reset-btn').addEventListener('click', startOver);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
