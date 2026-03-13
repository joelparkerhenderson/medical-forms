import { createDefaultAssessment } from './data-model.js';
import { calculateRisk } from './grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { TOTAL_STEPS, steps } from './steps.js';
import { parseNumeric, calculateBMI, calculateTcHdlRatio, bmiCategory } from './utils.js';

let data = createDefaultAssessment();
let currentStep = 1;

/** Numeric fields that should be parsed as numbers, not strings. */
const numericFields = new Set([
  'demographicsEthnicity.age',
  'demographicsEthnicity.townsendDeprivation',
  'bloodPressure.systolicBP',
  'bloodPressure.systolicBPSD',
  'bloodPressure.diastolicBP',
  'bloodPressure.numberOfBPMedications',
  'cholesterol.totalCholesterol',
  'cholesterol.hdlCholesterol',
  'cholesterol.totalHDLRatio',
  'smokingAlcohol.cigarettesPerDay',
  'smokingAlcohol.yearsSinceQuit',
  'smokingAlcohol.alcoholUnitsPerWeek',
  'physicalActivityDiet.physicalActivityMinutesPerWeek',
  'physicalActivityDiet.fruitVegPortionsPerDay',
  'bodyMeasurements.heightCm',
  'bodyMeasurements.weightKg',
  'bodyMeasurements.bmi',
  'bodyMeasurements.waistCircumferenceCm',
  'reviewCalculate.auditScore'
]);

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
  const riskResult = calculateRisk(data);
  const additionalFlags = detectAdditionalFlags(data);
  const result = {
    riskCategory: riskResult.riskCategory,
    tenYearRiskPercent: riskResult.tenYearRiskPercent,
    heartAge: riskResult.heartAge,
    firedRules: riskResult.firedRules,
    additionalFlags: additionalFlags,
    timestamp: new Date().toISOString()
  };
  sessionStorage.setItem('hhcData', JSON.stringify(data));
  sessionStorage.setItem('hhcResult', JSON.stringify(result));
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
  updateComputedValues();
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
    } else if (numericFields.has(path)) {
      el.value = val != null ? val : '';
    } else {
      el.value = val || '';
    }
  });
}

// ─── Data binding: collect form into data ──────────────
function collectCurrentStep() {
  const section = document.getElementById('step-' + currentStep);
  if (!section) return;

  section.querySelectorAll('[data-field]').forEach(el => {
    const path = el.getAttribute('data-field');
    if (el.type === 'radio') {
      if (el.checked) setNestedValue(data, path, el.value);
    } else if (numericFields.has(path)) {
      setNestedValue(data, path, parseNumeric(el.value));
    } else {
      setNestedValue(data, path, el.value);
    }
  });
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

// ─── Computed values (BMI, TC/HDL ratio) ───────────────
function updateComputedValues() {
  // TC/HDL ratio (step 4)
  const ratioEl = document.getElementById('computed-tchdl-ratio');
  if (ratioEl) {
    const ratio = data.cholesterol.totalHDLRatio
      ?? calculateTcHdlRatio(data.cholesterol.totalCholesterol, data.cholesterol.hdlCholesterol);
    if (ratio != null) {
      ratioEl.textContent = 'TC/HDL Ratio: ' + ratio;
      ratioEl.style.display = 'block';
    } else {
      ratioEl.style.display = 'none';
    }
  }

  // BMI (step 9)
  const bmiEl = document.getElementById('computed-bmi');
  if (bmiEl) {
    const bmi = data.bodyMeasurements.bmi
      ?? calculateBMI(data.bodyMeasurements.heightCm, data.bodyMeasurements.weightKg);
    if (bmi != null) {
      const cat = bmiCategory(bmi);
      bmiEl.textContent = 'BMI: ' + bmi + ' (' + cat + ')';
      bmiEl.className = 'computed-value';
      if (bmi >= 18.5 && bmi < 25) bmiEl.classList.add('computed-value-green');
      else if (bmi < 30) bmiEl.classList.add('computed-value-yellow');
      else bmiEl.classList.add('computed-value-red');
      bmiEl.style.display = 'block';
    } else {
      bmiEl.style.display = 'none';
    }
  }
}

// Listen for radio/select/input changes
document.addEventListener('change', (e) => {
  const field = e.target.getAttribute('data-field');
  if (!field) return;
  if (e.target.type === 'radio' && e.target.checked) {
    setNestedValue(data, field, e.target.value);
  } else if (e.target.tagName === 'SELECT') {
    setNestedValue(data, field, e.target.value);
  } else if (numericFields.has(field)) {
    setNestedValue(data, field, parseNumeric(e.target.value));
  }
  updateConditionalFields();
  updateComputedValues();
});

document.addEventListener('input', (e) => {
  const field = e.target.getAttribute('data-field');
  if (!field) return;
  if (numericFields.has(field)) {
    setNestedValue(data, field, parseNumeric(e.target.value));
    updateComputedValues();
  }
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
