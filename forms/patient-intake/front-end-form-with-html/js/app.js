import { createDefaultAssessment } from './data-model.js';
import { calculateRiskLevel } from './intake-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { riskLevelLabel, riskLevelColor } from './utils.js';
import { TOTAL_STEPS, steps } from './steps.js';

let data = createDefaultAssessment();

// ─── Navigation ────────────────────────────────────────
window.submitForm = function () {
  collectAllFields();
  const { riskLevel, firedRules } = calculateRiskLevel(data);
  const additionalFlags = detectAdditionalFlags(data);
  const result = { riskLevel, firedRules, additionalFlags, timestamp: new Date().toISOString() };
  sessionStorage.setItem('intakeData', JSON.stringify(data));
  sessionStorage.setItem('intakeResult', JSON.stringify(result));
  window.location.href = 'report.html';
};

// ─── Data binding: populate form from data ─────────────
function populateStep(step) {
  const section = document.getElementById('step-' + step);
  if (!section) return;

  // Text/select/textarea fields
  document.querySelectorAll('[data-field]').forEach(el => {
    const path = el.getAttribute('data-field');
    const val = getNestedValue(data, path);
    if (el.type === 'radio') {
      el.checked = (el.value === val);
    } else if (el.type === 'number') {
      el.value = val !== null && val !== undefined ? val : '';
    } else {
      el.value = val || '';
    }
  });

  // Chronic conditions checkboxes
  if (step === 4) {
    const container = document.getElementById('chronic-conditions');
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = data.medicalHistory.chronicConditions.includes(cb.value);
      cb.parentElement.classList.toggle('checked', cb.checked);
    });
  }

  // Dynamic lists
  if (step === 5) renderMedications();
  if (step === 6) renderAllergies();
}

// ─── Data binding: collect form into data ──────────────
function collectAllFields() {
  document.querySelectorAll('[data-field]').forEach(el => {
    const path = el.getAttribute('data-field');
    if (el.type === 'radio') {
      if (el.checked) setNestedValue(data, path, el.value);
    } else if (el.getAttribute('data-type') === 'number') {
      setNestedValue(data, path, el.value === '' ? null : parseFloat(el.value));
    } else {
      setNestedValue(data, path, el.value);
    }
  });

  // Chronic conditions
  {
    const checked = [];
    document.querySelectorAll('#chronic-conditions input[type="checkbox"]:checked').forEach(cb => {
      checked.push(cb.value);
    });
    data.medicalHistory.chronicConditions = checked;
  }

  // Medications
  collectMedications();
  // Allergies
  collectAllergies();
}

// ─── Medications dynamic list ──────────────────────────
function renderMedications() {
  const list = document.getElementById('medications-list');
  list.innerHTML = '';
  data.medications.forEach((med, i) => {
    list.appendChild(createMedicationRow(i, med));
  });
}

function createMedicationRow(index, med) {
  const div = document.createElement('div');
  div.className = 'dynamic-list-item';
  div.innerHTML = '<button class="remove-btn" onclick="removeMedication(' + index + ')">&times;</button>' +
    '<div class="form-row-4">' +
    '<div class="form-group"><label>Name</label><input type="text" class="med-name" value="' + escHtml(med.name) + '"></div>' +
    '<div class="form-group"><label>Dose</label><input type="text" class="med-dose" value="' + escHtml(med.dose) + '"></div>' +
    '<div class="form-group"><label>Frequency</label><input type="text" class="med-frequency" value="' + escHtml(med.frequency) + '"></div>' +
    '<div class="form-group"><label>Prescriber</label><input type="text" class="med-prescriber" value="' + escHtml(med.prescriber) + '"></div>' +
    '</div>';
  return div;
}

window.addMedication = function () {
  collectMedications();
  data.medications.push({ name: '', dose: '', frequency: '', prescriber: '' });
  renderMedications();
};

window.removeMedication = function (i) {
  collectMedications();
  data.medications.splice(i, 1);
  renderMedications();
};

function collectMedications() {
  const items = document.querySelectorAll('#medications-list .dynamic-list-item');
  data.medications = [];
  items.forEach(item => {
    const name = item.querySelector('.med-name').value;
    const dose = item.querySelector('.med-dose').value;
    const frequency = item.querySelector('.med-frequency').value;
    const prescriber = item.querySelector('.med-prescriber').value;
    if (name || dose || frequency || prescriber) {
      data.medications.push({ name, dose, frequency, prescriber });
    }
  });
}

// ─── Allergies dynamic list ────────────────────────────
function renderAllergies() {
  const list = document.getElementById('allergies-list');
  list.innerHTML = '';
  data.allergies.forEach((allergy, i) => {
    list.appendChild(createAllergyRow(i, allergy));
  });
}

function createAllergyRow(index, allergy) {
  const div = document.createElement('div');
  div.className = 'dynamic-list-item';
  div.innerHTML = '<button class="remove-btn" onclick="removeAllergy(' + index + ')">&times;</button>' +
    '<div class="form-row-4">' +
    '<div class="form-group"><label>Allergen</label><input type="text" class="allergy-allergen" value="' + escHtml(allergy.allergen) + '"></div>' +
    '<div class="form-group"><label>Type</label><select class="allergy-type">' +
      '<option value="">-- Select --</option>' +
      '<option value="drug"' + (allergy.allergyType === 'drug' ? ' selected' : '') + '>Drug</option>' +
      '<option value="food"' + (allergy.allergyType === 'food' ? ' selected' : '') + '>Food</option>' +
      '<option value="environmental"' + (allergy.allergyType === 'environmental' ? ' selected' : '') + '>Environmental</option>' +
      '<option value="latex"' + (allergy.allergyType === 'latex' ? ' selected' : '') + '>Latex</option>' +
      '<option value="other"' + (allergy.allergyType === 'other' ? ' selected' : '') + '>Other</option>' +
    '</select></div>' +
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
  data.allergies.push({ allergen: '', allergyType: '', reaction: '', severity: '' });
  renderAllergies();
};

window.removeAllergy = function (i) {
  collectAllergies();
  data.allergies.splice(i, 1);
  renderAllergies();
};

function collectAllergies() {
  const items = document.querySelectorAll('#allergies-list .dynamic-list-item');
  data.allergies = [];
  items.forEach(item => {
    const allergen = item.querySelector('.allergy-allergen').value;
    const allergyType = item.querySelector('.allergy-type').value;
    const reaction = item.querySelector('.allergy-reaction').value;
    const severity = item.querySelector('.allergy-severity').value;
    if (allergen || allergyType || reaction || severity) {
      data.allergies.push({ allergen, allergyType, reaction, severity });
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

// Listen for radio/select changes to update conditional fields
document.addEventListener('change', (e) => {
  const field = e.target.getAttribute('data-field');
  if (!field) return;
  if (e.target.type === 'radio' && e.target.checked) {
    setNestedValue(data, field, e.target.value);
  } else if (e.target.tagName === 'SELECT') {
    setNestedValue(data, field, e.target.value);
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

// Show form immediately (single-page layout)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-container');
  if (form) form.classList.remove('hidden');
});
