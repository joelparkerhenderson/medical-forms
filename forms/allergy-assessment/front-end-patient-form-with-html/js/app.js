import { createDefaultAssessment } from './data-model.js';
import { calculateAllergySeverity, calculateAllergyBurdenScore } from './grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { TOTAL_STEPS, steps } from './steps.js';
import { calculateBMI } from './utils.js';

let data = createDefaultAssessment();

// ─── Navigation ────────────────────────────────────────
window.submitForm = function () {
  collectAllFields();
  const { severityLevel, firedRules } = calculateAllergySeverity(data);
  const allergyBurdenScore = calculateAllergyBurdenScore(data);
  const additionalFlags = detectAdditionalFlags(data);
  const result = { severityLevel, allergyBurdenScore, firedRules, additionalFlags, timestamp: new Date().toISOString() };
  sessionStorage.setItem('allergyData', JSON.stringify(data));
  sessionStorage.setItem('allergyResult', JSON.stringify(result));
  window.location.href = 'report.html';
};

// ─── Data binding: populate form from data ─────────────
function populateStep(step) {
  const section = document.getElementById('step-' + step);
  if (!section) return;

  // Text/select/textarea/number fields
  document.querySelectorAll('[data-field]').forEach(el => {
    const path = el.getAttribute('data-field');
    const val = getNestedValue(data, path);
    if (el.type === 'radio') {
      el.checked = (el.value === String(val));
    } else if (el.type === 'number') {
      el.value = val !== null && val !== undefined ? val : '';
    } else {
      el.value = val || '';
    }
  });

  // Populate dynamic lists
  if (step === 3) renderDrugAllergyList();
  if (step === 4) renderFoodAllergyList();
  if (step === 6) renderEpisodeList();
  if (step === 7) renderTestResultList();
  if (step === 8) renderMedicationList();

  // BMI display
  if (step === 1) updateBMIDisplay();
}

// ─── Data binding: collect form into data ──────────────
function collectAllFields() {
  document.querySelectorAll('[data-field]').forEach(el => {
    const path = el.getAttribute('data-field');
    if (el.type === 'radio') {
      if (el.checked) setNestedValue(data, path, el.value);
    } else if (el.type === 'number') {
      setNestedValue(data, path, el.value === '' ? null : parseFloat(el.value));
    } else {
      setNestedValue(data, path, el.value);
    }
  });

  // Collect dynamic lists
  collectDrugAllergyList();
  collectFoodAllergyList();
  collectEpisodeList();
  collectTestResultList();
  collectMedicationList();

  // Auto-calculate BMI
  {
    data.demographics.bmi = calculateBMI(data.demographics.weight, data.demographics.height);
    updateBMIDisplay();
  }
}

// ─── Conditional fields ────────────────────────────────
function updateConditionalFields() {
  document.querySelectorAll('[data-show-if]').forEach(el => {
    const condition = el.getAttribute('data-show-if');
    const [path, values] = condition.split('=');
    const currentVal = String(getNestedValue(data, path));
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
  } else if (e.target.type === 'number') {
    setNestedValue(data, field, e.target.value === '' ? null : parseFloat(e.target.value));
  }
  updateConditionalFields();
});

// BMI auto-calculation on weight/height change
document.addEventListener('input', (e) => {
  if (e.target.getAttribute('data-field') === 'demographics.weight' ||
      e.target.getAttribute('data-field') === 'demographics.height') {
    const w = parseFloat(document.querySelector('[data-field="demographics.weight"]')?.value) || null;
    const h = parseFloat(document.querySelector('[data-field="demographics.height"]')?.value) || null;
    data.demographics.weight = w;
    data.demographics.height = h;
    data.demographics.bmi = calculateBMI(w, h);
    updateBMIDisplay();
  }
});

function updateBMIDisplay() {
  const el = document.getElementById('bmi-display');
  if (!el) return;
  if (data.demographics.bmi) {
    el.textContent = data.demographics.bmi;
  } else {
    el.textContent = 'Auto-calculated';
  }
}

// ─── Dynamic list: Drug allergies ──────────────────────
window.addDrugAllergy = function () {
  data.drugAllergies.drugAllergies.push({ allergen: '', reactionType: '', severity: '', timing: '', alternativesTolerated: '' });
  renderDrugAllergyList();
};

window.removeDrugAllergy = function (i) {
  data.drugAllergies.drugAllergies.splice(i, 1);
  renderDrugAllergyList();
};

function renderDrugAllergyList() {
  const container = document.getElementById('drug-allergy-list');
  if (!container) return;
  container.innerHTML = data.drugAllergies.drugAllergies.map((item, i) =>
    '<div class="dynamic-list-item">' +
    '<input type="text" placeholder="Drug name" value="' + escAttr(item.allergen) + '" data-list="drugAllergies" data-index="' + i + '" data-prop="allergen">' +
    '<input type="text" placeholder="Reaction type" value="' + escAttr(item.reactionType) + '" data-list="drugAllergies" data-index="' + i + '" data-prop="reactionType">' +
    '<select data-list="drugAllergies" data-index="' + i + '" data-prop="severity">' +
    '<option value="">Severity</option>' +
    '<option value="mild"' + (item.severity === 'mild' ? ' selected' : '') + '>Mild</option>' +
    '<option value="moderate"' + (item.severity === 'moderate' ? ' selected' : '') + '>Moderate</option>' +
    '<option value="severe"' + (item.severity === 'severe' ? ' selected' : '') + '>Severe</option>' +
    '<option value="anaphylaxis"' + (item.severity === 'anaphylaxis' ? ' selected' : '') + '>Anaphylaxis</option>' +
    '</select>' +
    '<input type="text" placeholder="Timing" value="' + escAttr(item.timing) + '" data-list="drugAllergies" data-index="' + i + '" data-prop="timing">' +
    '<input type="text" placeholder="Alternatives tolerated" value="' + escAttr(item.alternativesTolerated) + '" data-list="drugAllergies" data-index="' + i + '" data-prop="alternativesTolerated">' +
    '<button type="button" class="btn-remove" onclick="removeDrugAllergy(' + i + ')" aria-label="Remove">&times;</button>' +
    '</div>'
  ).join('');
}

function collectDrugAllergyList() {
  const items = document.querySelectorAll('[data-list="drugAllergies"]');
  items.forEach(el => {
    const i = parseInt(el.getAttribute('data-index'));
    const prop = el.getAttribute('data-prop');
    if (data.drugAllergies.drugAllergies[i]) {
      data.drugAllergies.drugAllergies[i][prop] = el.value;
    }
  });
}

// ─── Dynamic list: Food allergies ──────────────────────
window.addFoodAllergy = function () {
  data.foodAllergies.foodAllergies.push({ allergen: '', reactionType: '', severity: '', timing: '', alternativesTolerated: '' });
  renderFoodAllergyList();
};

window.removeFoodAllergy = function (i) {
  data.foodAllergies.foodAllergies.splice(i, 1);
  renderFoodAllergyList();
};

function renderFoodAllergyList() {
  const container = document.getElementById('food-allergy-list');
  if (!container) return;
  container.innerHTML = data.foodAllergies.foodAllergies.map((item, i) =>
    '<div class="dynamic-list-item">' +
    '<input type="text" placeholder="Food allergen" value="' + escAttr(item.allergen) + '" data-list="foodAllergies" data-index="' + i + '" data-prop="allergen">' +
    '<input type="text" placeholder="Reaction type" value="' + escAttr(item.reactionType) + '" data-list="foodAllergies" data-index="' + i + '" data-prop="reactionType">' +
    '<select data-list="foodAllergies" data-index="' + i + '" data-prop="severity">' +
    '<option value="">Severity</option>' +
    '<option value="mild"' + (item.severity === 'mild' ? ' selected' : '') + '>Mild</option>' +
    '<option value="moderate"' + (item.severity === 'moderate' ? ' selected' : '') + '>Moderate</option>' +
    '<option value="severe"' + (item.severity === 'severe' ? ' selected' : '') + '>Severe</option>' +
    '<option value="anaphylaxis"' + (item.severity === 'anaphylaxis' ? ' selected' : '') + '>Anaphylaxis</option>' +
    '</select>' +
    '<input type="text" placeholder="Timing" value="' + escAttr(item.timing) + '" data-list="foodAllergies" data-index="' + i + '" data-prop="timing">' +
    '<input type="text" placeholder="Alternatives tolerated" value="' + escAttr(item.alternativesTolerated) + '" data-list="foodAllergies" data-index="' + i + '" data-prop="alternativesTolerated">' +
    '<button type="button" class="btn-remove" onclick="removeFoodAllergy(' + i + ')" aria-label="Remove">&times;</button>' +
    '</div>'
  ).join('');
}

function collectFoodAllergyList() {
  const items = document.querySelectorAll('[data-list="foodAllergies"]');
  items.forEach(el => {
    const i = parseInt(el.getAttribute('data-index'));
    const prop = el.getAttribute('data-prop');
    if (data.foodAllergies.foodAllergies[i]) {
      data.foodAllergies.foodAllergies[i][prop] = el.value;
    }
  });
}

// ─── Dynamic list: Anaphylaxis episodes ────────────────
window.addEpisode = function () {
  data.anaphylaxisHistory.episodes.push({ trigger: '', symptoms: '', treatmentRequired: '' });
  renderEpisodeList();
};

window.removeEpisode = function (i) {
  data.anaphylaxisHistory.episodes.splice(i, 1);
  renderEpisodeList();
};

function renderEpisodeList() {
  const container = document.getElementById('episode-list');
  if (!container) return;
  container.innerHTML = data.anaphylaxisHistory.episodes.map((item, i) =>
    '<div class="dynamic-list-item">' +
    '<input type="text" placeholder="Trigger" value="' + escAttr(item.trigger) + '" data-list="episodes" data-index="' + i + '" data-prop="trigger">' +
    '<input type="text" placeholder="Symptoms" value="' + escAttr(item.symptoms) + '" data-list="episodes" data-index="' + i + '" data-prop="symptoms">' +
    '<input type="text" placeholder="Treatment required" value="' + escAttr(item.treatmentRequired) + '" data-list="episodes" data-index="' + i + '" data-prop="treatmentRequired">' +
    '<button type="button" class="btn-remove" onclick="removeEpisode(' + i + ')" aria-label="Remove">&times;</button>' +
    '</div>'
  ).join('');
}

function collectEpisodeList() {
  const items = document.querySelectorAll('[data-list="episodes"]');
  items.forEach(el => {
    const i = parseInt(el.getAttribute('data-index'));
    const prop = el.getAttribute('data-prop');
    if (data.anaphylaxisHistory.episodes[i]) {
      data.anaphylaxisHistory.episodes[i][prop] = el.value;
    }
  });
}

// ─── Dynamic list: Test results ────────────────────────
window.addTestResult = function () {
  data.testingResults.testResults.push({ testType: '', allergen: '', result: '' });
  renderTestResultList();
};

window.removeTestResult = function (i) {
  data.testingResults.testResults.splice(i, 1);
  renderTestResultList();
};

function renderTestResultList() {
  const container = document.getElementById('test-result-list');
  if (!container) return;
  container.innerHTML = data.testingResults.testResults.map((item, i) =>
    '<div class="dynamic-list-item">' +
    '<input type="text" placeholder="Test type" value="' + escAttr(item.testType) + '" data-list="testResults" data-index="' + i + '" data-prop="testType">' +
    '<input type="text" placeholder="Allergen" value="' + escAttr(item.allergen) + '" data-list="testResults" data-index="' + i + '" data-prop="allergen">' +
    '<input type="text" placeholder="Result" value="' + escAttr(item.result) + '" data-list="testResults" data-index="' + i + '" data-prop="result">' +
    '<button type="button" class="btn-remove" onclick="removeTestResult(' + i + ')" aria-label="Remove">&times;</button>' +
    '</div>'
  ).join('');
}

function collectTestResultList() {
  const items = document.querySelectorAll('[data-list="testResults"]');
  items.forEach(el => {
    const i = parseInt(el.getAttribute('data-index'));
    const prop = el.getAttribute('data-prop');
    if (data.testingResults.testResults[i]) {
      data.testingResults.testResults[i][prop] = el.value;
    }
  });
}

// ─── Dynamic list: Other medications ───────────────────
window.addMedication = function () {
  data.currentManagement.otherMedications.push({ name: '', dose: '', frequency: '' });
  renderMedicationList();
};

window.removeMedication = function (i) {
  data.currentManagement.otherMedications.splice(i, 1);
  renderMedicationList();
};

function renderMedicationList() {
  const container = document.getElementById('medication-list');
  if (!container) return;
  container.innerHTML = data.currentManagement.otherMedications.map((item, i) =>
    '<div class="dynamic-list-item">' +
    '<input type="text" placeholder="Medication name" value="' + escAttr(item.name) + '" data-list="medications" data-index="' + i + '" data-prop="name">' +
    '<input type="text" placeholder="Dose" value="' + escAttr(item.dose) + '" data-list="medications" data-index="' + i + '" data-prop="dose">' +
    '<input type="text" placeholder="Frequency" value="' + escAttr(item.frequency) + '" data-list="medications" data-index="' + i + '" data-prop="frequency">' +
    '<button type="button" class="btn-remove" onclick="removeMedication(' + i + ')" aria-label="Remove">&times;</button>' +
    '</div>'
  ).join('');
}

function collectMedicationList() {
  const items = document.querySelectorAll('[data-list="medications"]');
  items.forEach(el => {
    const i = parseInt(el.getAttribute('data-index'));
    const prop = el.getAttribute('data-prop');
    if (data.currentManagement.otherMedications[i]) {
      data.currentManagement.otherMedications[i][prop] = el.value;
    }
  });
}

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

function escAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Show form immediately (single-page layout)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-container');
  if (form) form.classList.remove('hidden');
});
