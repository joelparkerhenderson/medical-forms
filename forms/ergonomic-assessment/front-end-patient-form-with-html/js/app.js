import { createDefaultAssessment } from './data-model.js';
import { calculateREBA } from './reba-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { rebaScoreLabel, rebaRiskColor } from './utils.js';
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
  const { rebaScore, riskLevel, firedRules } = calculateREBA(data);
  const additionalFlags = detectAdditionalFlags(data);
  const result = { rebaScore, riskLevel, firedRules, additionalFlags, timestamp: new Date().toISOString() };
  sessionStorage.setItem('ergonomicData', JSON.stringify(data));
  sessionStorage.setItem('ergonomicResult', JSON.stringify(result));
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

  // Text/select/textarea/range fields
  section.querySelectorAll('[data-field]').forEach(el => {
    const path = el.getAttribute('data-field');
    const val = getNestedValue(data, path);
    if (el.type === 'radio') {
      el.checked = (el.value === val);
    } else if (el.type === 'range') {
      el.value = val !== null && val !== undefined ? val : 0;
      // Update range display
      const display = el.parentElement.querySelector('.range-value');
      if (display) display.textContent = val !== null ? val : 'N/A';
    } else if (el.type === 'number') {
      el.value = val !== null && val !== undefined ? val : '';
    } else {
      el.value = val || '';
    }
  });

  // Pain locations checkboxes (step 6)
  if (step === 6) {
    const container = document.getElementById('pain-locations');
    if (container) {
      container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = data.currentSymptoms.painLocations.includes(cb.value);
        cb.parentElement.classList.toggle('checked', cb.checked);
      });
    }
  }

  // Musculoskeletal conditions checkboxes (step 7)
  if (step === 7) {
    const container = document.getElementById('msk-conditions');
    if (container) {
      container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = data.medicalHistory.musculoskeletalConditions.includes(cb.value);
        cb.parentElement.classList.toggle('checked', cb.checked);
      });
    }
  }

  // Ergonomic equipment checkboxes (step 8)
  if (step === 8) {
    const container = document.getElementById('ergonomic-equipment');
    if (container) {
      container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = data.currentInterventions.ergonomicEquipment.includes(cb.value);
        cb.parentElement.classList.toggle('checked', cb.checked);
      });
    }
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
    } else if (el.type === 'range') {
      setNestedValue(data, path, el.value === '' ? null : parseInt(el.value));
    } else if (el.getAttribute('data-type') === 'number') {
      setNestedValue(data, path, el.value === '' ? null : parseFloat(el.value));
    } else {
      setNestedValue(data, path, el.value);
    }
  });

  // Pain locations (step 6)
  if (currentStep === 6) {
    const checked = [];
    document.querySelectorAll('#pain-locations input[type="checkbox"]:checked').forEach(cb => {
      checked.push(cb.value);
    });
    data.currentSymptoms.painLocations = checked;
  }

  // Musculoskeletal conditions (step 7)
  if (currentStep === 7) {
    const checked = [];
    document.querySelectorAll('#msk-conditions input[type="checkbox"]:checked').forEach(cb => {
      checked.push(cb.value);
    });
    data.medicalHistory.musculoskeletalConditions = checked;
  }

  // Ergonomic equipment (step 8)
  if (currentStep === 8) {
    const checked = [];
    document.querySelectorAll('#ergonomic-equipment input[type="checkbox"]:checked').forEach(cb => {
      checked.push(cb.value);
    });
    data.currentInterventions.ergonomicEquipment = checked;
  }
}

// ─── Pain severity range handler ─────────────────────
window.updatePainSeverity = function (el) {
  const display = document.getElementById('pain-severity-value');
  if (display) display.textContent = el.value;
};

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
