import { createDefaultAssessment } from './data-model.js';
import { calculateSatisfaction } from './grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { satisfactionQuestions, likertResponseOptions } from './satisfaction-questions.js';
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
  const grading = calculateSatisfaction(data);
  const additionalFlags = detectAdditionalFlags(data, grading.compositeScore);
  const result = {
    compositeScore: grading.compositeScore,
    category: grading.category,
    domainScores: grading.domainScores,
    additionalFlags: additionalFlags,
    answeredCount: grading.answeredCount,
    timestamp: new Date().toISOString()
  };
  sessionStorage.setItem('satisfactionData', JSON.stringify(data));
  sessionStorage.setItem('satisfactionResult', JSON.stringify(result));
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

  // Text/select/textarea fields
  section.querySelectorAll('[data-field]').forEach(function(el) {
    const path = el.getAttribute('data-field');
    const val = getNestedValue(data, path);
    if (el.type === 'radio') {
      el.checked = (el.value === String(val));
    } else {
      el.value = val || '';
    }
  });

  // Likert radio buttons
  section.querySelectorAll('[data-likert]').forEach(function(el) {
    const path = el.getAttribute('data-likert');
    const val = getNestedValue(data, path);
    if (val !== null && el.value === String(val)) {
      el.checked = true;
    } else {
      el.checked = false;
    }
  });
}

// ─── Data binding: collect form into data ──────────────
function collectCurrentStep() {
  const section = document.getElementById('step-' + currentStep);
  if (!section) return;

  // Text/select/textarea fields
  section.querySelectorAll('[data-field]').forEach(function(el) {
    const path = el.getAttribute('data-field');
    if (el.type === 'radio') {
      if (el.checked) setNestedValue(data, path, el.value);
    } else {
      setNestedValue(data, path, el.value);
    }
  });

  // Likert radio buttons (store as numbers)
  section.querySelectorAll('[data-likert]').forEach(function(el) {
    if (el.checked) {
      const path = el.getAttribute('data-likert');
      setNestedValue(data, path, parseInt(el.value, 10));
    }
  });
}

// ─── Listen for changes ────────────────────────────────
document.addEventListener('change', function(e) {
  const field = e.target.getAttribute('data-field');
  if (field && e.target.type === 'radio' && e.target.checked) {
    setNestedValue(data, field, e.target.value);
  }
  const likert = e.target.getAttribute('data-likert');
  if (likert && e.target.checked) {
    setNestedValue(data, likert, parseInt(e.target.value, 10));
  }
});

// ─── Utilities ─────────────────────────────────────────
function getNestedValue(obj, path) {
  return path.split('.').reduce(function(o, key) {
    return (o && o[key] !== undefined) ? o[key] : '';
  }, obj);
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
