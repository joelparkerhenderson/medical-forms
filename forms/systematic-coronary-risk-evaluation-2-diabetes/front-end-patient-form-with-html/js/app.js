import { createDefaultAssessmentData } from './types.js';
import { gradeAssessment } from './risk-grader.js';
import { TOTAL_STEPS, steps } from './steps.js';
import { calculateBmi } from './utils.js';

let data = createDefaultAssessmentData();
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
  const result = gradeAssessment(data);
  sessionStorage.setItem('score2Data', JSON.stringify(data));
  sessionStorage.setItem('score2Result', JSON.stringify(result));
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
  window.scrollTo(0, 0);
}

// ─── Data binding: populate form from data ─────────────
function populateStep(step) {
  const section = document.getElementById('step-' + step);
  if (!section) return;

  section.querySelectorAll('[data-field]').forEach(el => {
    const path = el.getAttribute('data-field');
    const val = getNestedValue(data, path);
    if (el.type === 'radio') {
      el.checked = (el.value === String(val));
    } else if (el.type === 'checkbox') {
      el.checked = (val === 'yes');
    } else if (el.type === 'number') {
      el.value = val !== null && val !== undefined ? val : '';
    } else {
      el.value = val || '';
    }
  });

  if (step === 1) updateBMIDisplay();
}

// ─── Data binding: collect form into data ──────────────
function collectCurrentStep() {
  const section = document.getElementById('step-' + currentStep);
  if (!section) return;

  section.querySelectorAll('[data-field]').forEach(el => {
    const path = el.getAttribute('data-field');
    if (el.type === 'radio') {
      if (el.checked) setNestedValue(data, path, el.value);
    } else if (el.type === 'checkbox') {
      setNestedValue(data, path, el.checked ? 'yes' : 'no');
    } else if (el.type === 'number') {
      setNestedValue(data, path, el.value === '' ? null : parseFloat(el.value));
    } else {
      setNestedValue(data, path, el.value);
    }
  });

  // Auto-calculate BMI on step 1
  if (currentStep === 1) {
    data.patientDemographics.bmi = calculateBmi(
      data.patientDemographics.heightCm,
      data.patientDemographics.weightKg
    );
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

// Listen for radio/select/checkbox changes to update conditional fields
document.addEventListener('change', (e) => {
  const field = e.target.getAttribute('data-field');
  if (!field) return;
  if (e.target.type === 'radio' && e.target.checked) {
    setNestedValue(data, field, e.target.value);
  } else if (e.target.type === 'checkbox') {
    setNestedValue(data, field, e.target.checked ? 'yes' : 'no');
  } else if (e.target.tagName === 'SELECT') {
    setNestedValue(data, field, e.target.value);
  } else if (e.target.type === 'number') {
    setNestedValue(data, field, e.target.value === '' ? null : parseFloat(e.target.value));
  }
  updateConditionalFields();
});

// BMI auto-calculation on weight/height change
document.addEventListener('input', (e) => {
  if (e.target.getAttribute('data-field') === 'patientDemographics.weightKg' ||
      e.target.getAttribute('data-field') === 'patientDemographics.heightCm') {
    const w = parseFloat(document.querySelector('[data-field="patientDemographics.weightKg"]')?.value) || null;
    const h = parseFloat(document.querySelector('[data-field="patientDemographics.heightCm"]')?.value) || null;
    data.patientDemographics.weightKg = w;
    data.patientDemographics.heightCm = h;
    data.patientDemographics.bmi = calculateBmi(h, w);
    updateBMIDisplay();
  }
});

function updateBMIDisplay() {
  const el = document.getElementById('bmi-display');
  if (!el) return;
  if (data.patientDemographics.bmi) {
    el.textContent = data.patientDemographics.bmi;
  } else {
    el.textContent = 'Auto-calculated';
  }
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
