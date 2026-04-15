import { createDefaultAssessment } from './data-model.js';
import { calculateControl } from './grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { controlLevelLabel } from './utils.js';
import { TOTAL_STEPS, steps } from './steps.js';

let data = createDefaultAssessment();

// ─── Navigation ────────────────────────────────────────
window.submitForm = function () {
  collectAllFields();
  const { controlLevel, controlScore, firedRules } = calculateControl(data);
  const additionalFlags = detectAdditionalFlags(data);
  const result = {
    controlLevel,
    controlScore,
    firedRules,
    additionalFlags,
    timestamp: new Date().toISOString(),
  };
  sessionStorage.setItem('diabetesData', JSON.stringify(data));
  sessionStorage.setItem('diabetesResult', JSON.stringify(result));
  window.location.href = 'report.html';
};

// ─── Data binding: populate form from data ─────────────
function populateStep(step) {
  const section = document.getElementById('step-' + step);
  if (!section) return;

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
}

// ─── Data binding: collect form into data ──────────────
function collectAllFields() {
  document.querySelectorAll('[data-field]').forEach(el => {
    const path = el.getAttribute('data-field');
    if (el.type === 'radio') {
      if (el.checked) setNestedValue(data, path, el.value);
    } else if (el.getAttribute('data-type') === 'number') {
      setNestedValue(data, path, el.value === '' ? null : parseFloat(el.value));
    } else if (el.type === 'number') {
      setNestedValue(data, path, el.value === '' ? null : parseFloat(el.value));
    } else {
      setNestedValue(data, path, el.value);
    }
  });
}

// ─── Utility: nested value access ──────────────────────
function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((o, k) => o[k], obj);
  if (target && last) target[last] = value;
}

// Show form immediately (single-page layout)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-container');
  if (form) form.classList.remove('hidden');
});
