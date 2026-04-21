import { createDefaultAssessment } from './data-model.js';
import { calculateAbnormality } from './grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { TOTAL_STEPS, steps } from './steps.js';
import { getNestedValue, setNestedValue } from './utils.js';

let data = createDefaultAssessment();

// ─── Navigation ────────────────────────────────────────
window.submitForm = function () {
  collectAllFields();
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

// ─── Data binding: populate form from data ─────────────
function populateStep(step) {
  const section = document.getElementById('step-' + step);
  if (!section) return;
  document.querySelectorAll('[data-field]').forEach(function(el) {
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
function collectAllFields() {
  document.querySelectorAll('[data-field]').forEach(function(el) {
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

// Show form immediately (single-page layout)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-container');
  if (form) form.classList.remove('hidden');
});
