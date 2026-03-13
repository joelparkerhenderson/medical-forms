import { createDefaultAssessment } from './data-model.js';
import { calculateNEWS2 } from './news2-calculator.js';
import { detectFlaggedIssues } from './flagged-issues.js';
import { TOTAL_STEPS, steps } from './steps.js';

let data = createDefaultAssessment();
let currentStep = 1;

// ─── Navigation ────────────────────────────────────────
window.startForm = function () {
  document.getElementById('landing').style.display = 'none';
  document.getElementById('form-container').style.display = 'block';
  showStep(1);
};

window.goToStep = function (step) {
  collectCurrentStep();
  showStep(step);
};

window.submitForm = function () {
  collectCurrentStep();
  const news2 = calculateNEWS2(data.vitalSigns);
  const flaggedIssues = detectFlaggedIssues(data, news2);
  const result = { news2, flaggedIssues, timestamp: new Date().toISOString() };
  sessionStorage.setItem('casualtyCardData', JSON.stringify(data));
  sessionStorage.setItem('casualtyCardResult', JSON.stringify(result));
  window.location.href = 'report.html';
};

function showStep(step) {
  currentStep = step;
  document.querySelectorAll('.step-section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('step-' + step);
  if (el) el.classList.add('active');
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  document.getElementById('step-label').textContent = 'Step ' + step + ' of ' + TOTAL_STEPS + ': ' + steps[step - 1].title;
  document.getElementById('step-percent').textContent = pct + '%';
  document.getElementById('progress-fill').style.width = pct + '%';
  populateStep(step);
  updateConditionalFields();
  updateGCSTotal();
  window.scrollTo(0, 0);
}

// ─── Data binding: populate form from data ─────────────
function populateStep(step) {
  const section = document.getElementById('step-' + step);
  if (!section) return;

  // Text/select/textarea/number fields
  section.querySelectorAll('[data-field]').forEach(el => {
    const path = el.getAttribute('data-field');
    const val = getNestedValue(data, path);
    if (el.type === 'radio') {
      el.checked = (el.value === val);
    } else if (el.getAttribute('data-type') === 'number') {
      el.value = val !== null && val !== undefined ? val : '';
    } else {
      el.value = val || '';
    }
  });

  // Blood tests checkboxes
  if (step === 10) {
    const container = document.getElementById('blood-tests');
    if (container) {
      container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = data.investigations.bloodTests.includes(cb.value);
        cb.parentElement.classList.toggle('checked', cb.checked);
      });
    }
    renderImaging();
  }

  // Dynamic lists
  if (step === 6) {
    renderMedications();
    renderAllergies();
  }
  if (step === 11) {
    renderMedicationsAdministered();
    renderFluidTherapy();
    renderProcedures();
  }
}

// ─── Data binding: collect form into data ──────────────
function collectCurrentStep() {
  const section = document.getElementById('step-' + currentStep);
  if (!section) return;

  section.querySelectorAll('[data-field]').forEach(el => {
    const path = el.getAttribute('data-field');
    if (el.type === 'radio') {
      if (el.checked) setNestedValue(data, path, el.value);
    } else if (el.getAttribute('data-type') === 'number') {
      setNestedValue(data, path, el.value === '' ? null : parseFloat(el.value));
    } else {
      setNestedValue(data, path, el.value);
    }
  });

  // Blood tests checkboxes
  if (currentStep === 10) {
    const checked = [];
    document.querySelectorAll('#blood-tests input[type="checkbox"]:checked').forEach(cb => {
      checked.push(cb.value);
    });
    data.investigations.bloodTests = checked;
    collectImaging();
  }

  // Medications and allergies
  if (currentStep === 6) {
    collectMedications();
    collectAllergies();
  }

  // Treatment dynamic lists
  if (currentStep === 11) {
    collectMedicationsAdministered();
    collectFluidTherapy();
    collectProcedures();
  }

  // GCS auto-calculate
  if (currentStep === 8) {
    updateGCSTotal();
  }
}

// ─── GCS auto-calculation ──────────────────────────────
function updateGCSTotal() {
  const eye = data.primarySurvey.disability.gcsEye;
  const verbal = data.primarySurvey.disability.gcsVerbal;
  const motor = data.primarySurvey.disability.gcsMotor;
  if (eye !== null && verbal !== null && motor !== null) {
    data.primarySurvey.disability.gcsTotal = eye + verbal + motor;
  } else {
    data.primarySurvey.disability.gcsTotal = null;
  }
  const display = document.getElementById('gcs-total-display');
  if (display) {
    display.textContent = data.primarySurvey.disability.gcsTotal !== null
      ? data.primarySurvey.disability.gcsTotal + '/15'
      : '\u2014';
  }
}

// ─── Medications dynamic list (Step 6) ─────────────────
function renderMedications() {
  const list = document.getElementById('medications-list');
  if (!list) return;
  list.innerHTML = '';
  data.medicalHistory.medications.forEach((med, i) => {
    list.appendChild(createMedicationRow(i, med));
  });
}

function createMedicationRow(index, med) {
  const div = document.createElement('div');
  div.className = 'dynamic-list-item';
  div.innerHTML = '<button class="remove-btn" onclick="removeMedication(' + index + ')">&times;</button>' +
    '<div class="form-row-3">' +
    '<div class="form-group"><label>Name</label><input type="text" class="med-name" value="' + escHtml(med.name) + '"></div>' +
    '<div class="form-group"><label>Dose</label><input type="text" class="med-dose" value="' + escHtml(med.dose) + '"></div>' +
    '<div class="form-group"><label>Frequency</label><input type="text" class="med-frequency" value="' + escHtml(med.frequency) + '"></div>' +
    '</div>';
  return div;
}

window.addMedication = function () {
  collectMedications();
  data.medicalHistory.medications.push({ name: '', dose: '', frequency: '' });
  renderMedications();
};

window.removeMedication = function (i) {
  collectMedications();
  data.medicalHistory.medications.splice(i, 1);
  renderMedications();
};

function collectMedications() {
  const items = document.querySelectorAll('#medications-list .dynamic-list-item');
  data.medicalHistory.medications = [];
  items.forEach(item => {
    const name = item.querySelector('.med-name').value;
    const dose = item.querySelector('.med-dose').value;
    const frequency = item.querySelector('.med-frequency').value;
    if (name || dose || frequency) {
      data.medicalHistory.medications.push({ name, dose, frequency });
    }
  });
}

// ─── Allergies dynamic list (Step 6) ───────────────────
function renderAllergies() {
  const list = document.getElementById('allergies-list');
  if (!list) return;
  list.innerHTML = '';
  data.medicalHistory.allergies.forEach((allergy, i) => {
    list.appendChild(createAllergyRow(i, allergy));
  });
}

function createAllergyRow(index, allergy) {
  const div = document.createElement('div');
  div.className = 'dynamic-list-item';
  div.innerHTML = '<button class="remove-btn" onclick="removeAllergy(' + index + ')">&times;</button>' +
    '<div class="form-row-3">' +
    '<div class="form-group"><label>Allergen</label><input type="text" class="allergy-allergen" value="' + escHtml(allergy.allergen) + '"></div>' +
    '<div class="form-group"><label>Reaction</label><input type="text" class="allergy-reaction" value="' + escHtml(allergy.reaction) + '"></div>' +
    '<div class="form-group"><label>Severity</label><select class="allergy-severity">' +
      '<option value="">-- Select --</option>' +
      '<option value="mild"' + (allergy.severity === 'mild' ? ' selected' : '') + '>Mild</option>' +
      '<option value="moderate"' + (allergy.severity === 'moderate' ? ' selected' : '') + '>Moderate</option>' +
      '<option value="anaphylaxis"' + (allergy.severity === 'anaphylaxis' ? ' selected' : '') + '>Anaphylaxis</option>' +
    '</select></div>' +
    '</div>';
  return div;
}

window.addAllergy = function () {
  collectAllergies();
  data.medicalHistory.allergies.push({ allergen: '', reaction: '', severity: '' });
  renderAllergies();
};

window.removeAllergy = function (i) {
  collectAllergies();
  data.medicalHistory.allergies.splice(i, 1);
  renderAllergies();
};

function collectAllergies() {
  const items = document.querySelectorAll('#allergies-list .dynamic-list-item');
  data.medicalHistory.allergies = [];
  items.forEach(item => {
    const allergen = item.querySelector('.allergy-allergen').value;
    const reaction = item.querySelector('.allergy-reaction').value;
    const severity = item.querySelector('.allergy-severity').value;
    if (allergen || reaction || severity) {
      data.medicalHistory.allergies.push({ allergen, reaction, severity });
    }
  });
}

// ─── Imaging dynamic list (Step 10) ────────────────────
function renderImaging() {
  const list = document.getElementById('imaging-list');
  if (!list) return;
  list.innerHTML = '';
  data.investigations.imaging.forEach((img, i) => {
    list.appendChild(createImagingRow(i, img));
  });
}

function createImagingRow(index, img) {
  const div = document.createElement('div');
  div.className = 'dynamic-list-item';
  div.innerHTML = '<button class="remove-btn" onclick="removeImaging(' + index + ')">&times;</button>' +
    '<div class="form-row-3">' +
    '<div class="form-group"><label>Type</label><input type="text" class="img-type" value="' + escHtml(img.type) + '" placeholder="e.g. X-ray, CT, MRI"></div>' +
    '<div class="form-group"><label>Site</label><input type="text" class="img-site" value="' + escHtml(img.site) + '"></div>' +
    '<div class="form-group"><label>Findings</label><input type="text" class="img-findings" value="' + escHtml(img.findings) + '"></div>' +
    '</div>';
  return div;
}

window.addImaging = function () {
  collectImaging();
  data.investigations.imaging.push({ type: '', site: '', findings: '' });
  renderImaging();
};

window.removeImaging = function (i) {
  collectImaging();
  data.investigations.imaging.splice(i, 1);
  renderImaging();
};

function collectImaging() {
  const items = document.querySelectorAll('#imaging-list .dynamic-list-item');
  data.investigations.imaging = [];
  items.forEach(item => {
    const type = item.querySelector('.img-type').value;
    const site = item.querySelector('.img-site').value;
    const findings = item.querySelector('.img-findings').value;
    if (type || site || findings) {
      data.investigations.imaging.push({ type, site, findings });
    }
  });
}

// ─── Medications Administered dynamic list (Step 11) ───
function renderMedicationsAdministered() {
  const list = document.getElementById('meds-administered-list');
  if (!list) return;
  list.innerHTML = '';
  data.treatment.medicationsAdministered.forEach((med, i) => {
    list.appendChild(createMedAdminRow(i, med));
  });
}

function createMedAdminRow(index, med) {
  const div = document.createElement('div');
  div.className = 'dynamic-list-item';
  div.innerHTML = '<button class="remove-btn" onclick="removeMedAdmin(' + index + ')">&times;</button>' +
    '<div class="form-row-5">' +
    '<div class="form-group"><label>Drug</label><input type="text" class="medadmin-drug" value="' + escHtml(med.drug) + '"></div>' +
    '<div class="form-group"><label>Dose</label><input type="text" class="medadmin-dose" value="' + escHtml(med.dose) + '"></div>' +
    '<div class="form-group"><label>Route</label><input type="text" class="medadmin-route" value="' + escHtml(med.route) + '" placeholder="e.g. IV, IM, PO"></div>' +
    '<div class="form-group"><label>Time</label><input type="time" class="medadmin-time" value="' + escHtml(med.time) + '"></div>' +
    '<div class="form-group"><label>Given By</label><input type="text" class="medadmin-givenby" value="' + escHtml(med.givenBy) + '"></div>' +
    '</div>';
  return div;
}

window.addMedAdmin = function () {
  collectMedicationsAdministered();
  data.treatment.medicationsAdministered.push({ drug: '', dose: '', route: '', time: '', givenBy: '' });
  renderMedicationsAdministered();
};

window.removeMedAdmin = function (i) {
  collectMedicationsAdministered();
  data.treatment.medicationsAdministered.splice(i, 1);
  renderMedicationsAdministered();
};

function collectMedicationsAdministered() {
  const items = document.querySelectorAll('#meds-administered-list .dynamic-list-item');
  data.treatment.medicationsAdministered = [];
  items.forEach(item => {
    const drug = item.querySelector('.medadmin-drug').value;
    const dose = item.querySelector('.medadmin-dose').value;
    const route = item.querySelector('.medadmin-route').value;
    const time = item.querySelector('.medadmin-time').value;
    const givenBy = item.querySelector('.medadmin-givenby').value;
    if (drug || dose || route || time || givenBy) {
      data.treatment.medicationsAdministered.push({ drug, dose, route, time, givenBy });
    }
  });
}

// ─── Fluid Therapy dynamic list (Step 11) ──────────────
function renderFluidTherapy() {
  const list = document.getElementById('fluid-therapy-list');
  if (!list) return;
  list.innerHTML = '';
  data.treatment.fluidTherapy.forEach((f, i) => {
    list.appendChild(createFluidRow(i, f));
  });
}

function createFluidRow(index, f) {
  const div = document.createElement('div');
  div.className = 'dynamic-list-item';
  div.innerHTML = '<button class="remove-btn" onclick="removeFluid(' + index + ')">&times;</button>' +
    '<div class="form-row-4">' +
    '<div class="form-group"><label>Type</label><input type="text" class="fluid-type" value="' + escHtml(f.type) + '" placeholder="e.g. 0.9% NaCl"></div>' +
    '<div class="form-group"><label>Volume</label><input type="text" class="fluid-volume" value="' + escHtml(f.volume) + '" placeholder="e.g. 1000ml"></div>' +
    '<div class="form-group"><label>Rate</label><input type="text" class="fluid-rate" value="' + escHtml(f.rate) + '" placeholder="e.g. 125ml/hr"></div>' +
    '<div class="form-group"><label>Time Started</label><input type="time" class="fluid-time" value="' + escHtml(f.timeStarted) + '"></div>' +
    '</div>';
  return div;
}

window.addFluid = function () {
  collectFluidTherapy();
  data.treatment.fluidTherapy.push({ type: '', volume: '', rate: '', timeStarted: '' });
  renderFluidTherapy();
};

window.removeFluid = function (i) {
  collectFluidTherapy();
  data.treatment.fluidTherapy.splice(i, 1);
  renderFluidTherapy();
};

function collectFluidTherapy() {
  const items = document.querySelectorAll('#fluid-therapy-list .dynamic-list-item');
  data.treatment.fluidTherapy = [];
  items.forEach(item => {
    const type = item.querySelector('.fluid-type').value;
    const volume = item.querySelector('.fluid-volume').value;
    const rate = item.querySelector('.fluid-rate').value;
    const timeStarted = item.querySelector('.fluid-time').value;
    if (type || volume || rate || timeStarted) {
      data.treatment.fluidTherapy.push({ type, volume, rate, timeStarted });
    }
  });
}

// ─── Procedures dynamic list (Step 11) ─────────────────
function renderProcedures() {
  const list = document.getElementById('procedures-list');
  if (!list) return;
  list.innerHTML = '';
  data.treatment.procedures.forEach((p, i) => {
    list.appendChild(createProcedureRow(i, p));
  });
}

function createProcedureRow(index, p) {
  const div = document.createElement('div');
  div.className = 'dynamic-list-item';
  div.innerHTML = '<button class="remove-btn" onclick="removeProcedure(' + index + ')">&times;</button>' +
    '<div class="form-row">' +
    '<div class="form-group"><label>Description</label><input type="text" class="proc-desc" value="' + escHtml(p.description) + '"></div>' +
    '<div class="form-group"><label>Time</label><input type="time" class="proc-time" value="' + escHtml(p.time) + '"></div>' +
    '</div>';
  return div;
}

window.addProcedure = function () {
  collectProcedures();
  data.treatment.procedures.push({ description: '', time: '' });
  renderProcedures();
};

window.removeProcedure = function (i) {
  collectProcedures();
  data.treatment.procedures.splice(i, 1);
  renderProcedures();
};

function collectProcedures() {
  const items = document.querySelectorAll('#procedures-list .dynamic-list-item');
  data.treatment.procedures = [];
  items.forEach(item => {
    const description = item.querySelector('.proc-desc').value;
    const time = item.querySelector('.proc-time').value;
    if (description || time) {
      data.treatment.procedures.push({ description, time });
    }
  });
}

// ─── Conditional fields ────────────────────────────────
function updateConditionalFields() {
  document.querySelectorAll('[data-show-if]').forEach(el => {
    const condition = el.getAttribute('data-show-if');
    const [path, values] = condition.split('=');
    const currentVal = getNestedValue(data, path);
    const allowed = values.split('|');
    el.style.display = allowed.includes(currentVal) ? 'block' : 'none';
  });
}

// Listen for radio/select changes to update conditional fields and GCS
document.addEventListener('change', (e) => {
  const field = e.target.getAttribute('data-field');
  if (!field) return;
  if (e.target.type === 'radio' && e.target.checked) {
    setNestedValue(data, field, e.target.value);
  } else if (e.target.tagName === 'SELECT') {
    setNestedValue(data, field, e.target.value);
  } else if (e.target.getAttribute('data-type') === 'number') {
    setNestedValue(data, field, e.target.value === '' ? null : parseFloat(e.target.value));
    updateGCSTotal();
  }
  // Update checkbox styling
  if (e.target.type === 'checkbox') {
    e.target.parentElement.classList.toggle('checked', e.target.checked);
  }
  updateConditionalFields();
});

// ─── Utilities ─────────────────────────────────────────
function getNestedValue(obj, path) {
  return path.split('.').reduce((o, key) => (o && o[key] !== undefined) ? o[key] : '', obj);
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
