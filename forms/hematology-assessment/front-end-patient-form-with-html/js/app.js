import { createDefaultAssessment } from './data-model.js';
import { calculateAbnormality } from './grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { TOTAL_STEPS, steps } from './steps.js';
import { getNestedValue, setNestedValue } from './utils.js';

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
  const grading = calculateAbnormality(data);
  const additionalFlags = detectAdditionalFlags(data);
  const result = {
    abnormalityLevel: grading.abnormalityLevel,
    abnormalityScore: grading.abnormalityScore,
    firedRules: grading.firedRules,
    additionalFlags: additionalFlags,
    timestamp: new Date().toISOString()
  };
  sessionStorage.setItem('hematologyData', JSON.stringify(data));
  sessionStorage.setItem('hematologyResult', JSON.stringify(result));
  window.location.href = 'report.html';
};

function showStep(step) {
  currentStep = step;
  document.querySelectorAll('.step-section').forEach(function(s) { s.classList.remove('active'); });
  const el = document.getElementById('step-' + step);
  if (el) el.classList.add('active');
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  document.getElementById('step-label').textContent = 'Step ' + step + ' of ' + TOTAL_STEPS + ': ' + steps[step - 1].title;
  document.getElementById('step-percent').textContent = pct + '%';
  document.getElementById('progress-fill').style.width = pct + '%';
  populateStep(step);
  window.scrollTo(0, 0);
}

// ─── Data binding: populate form from data ─────────────
function populateStep(step) {
  const section = document.getElementById('step-' + step);
  if (!section) return;
  section.querySelectorAll('[data-field]').forEach(function(el) {
    const path = el.getAttribute('data-field');
    const val = getNestedValue(data, path);
    if (el.type === 'radio') {
      el.checked = (el.value === String(val));
    } else {
      el.value = val !== null && val !== undefined ? val : '';
    }
  });
}

// ─── Data binding: collect form into data ──────────────
function collectCurrentStep() {
  const section = document.getElementById('step-' + currentStep);
  if (!section) return;
  section.querySelectorAll('[data-field]').forEach(function(el) {
    const path = el.getAttribute('data-field');
    if (el.type === 'radio') {
      if (el.checked) setNestedValue(data, path, el.value);
    } else if (el.type === 'number') {
      setNestedValue(data, path, el.value === '' ? null : Number(el.value));
    } else {
      setNestedValue(data, path, el.value);
    }
  });
}
