import { createDefaultData } from './data-model.js';
import { renderNoticeHtml } from './notice-text.js';
import { grade } from './grader.js';

const TOTAL_STEPS = 3;
const STEP_TITLES = [
  'Practice Configuration',
  'Privacy Notice',
  'Acknowledgment & Signature',
];

let data = createDefaultData();

// ─── Navigation ─────────────────────────────────────────

window.submitForm = function () {
  collectCurrentStep();

  // Validate step 3 before submitting
  const errors = [];
  if (!data.acknowledgment.checked) {
    errors.push('Please check the acknowledgment box to confirm you have read the privacy notice.');
  }
  if (!data.acknowledgment.patientName || data.acknowledgment.patientName.trim() === '') {
    errors.push('Please enter your full name.');
  }
  if (!data.acknowledgment.date || data.acknowledgment.date.trim() === '') {
    errors.push('Please enter today\'s date.');
  }

  const errorEl = document.getElementById('step3-errors');
  if (errors.length > 0) {
    errorEl.innerHTML = errors.map(e => `<li>${e}</li>`).join('');
    errorEl.style.display = 'block';
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }
  errorEl.style.display = 'none';

  const result = grade(data);
  data.submittedAt = new Date().toISOString();

  localStorage.setItem('carePrivacyNoticeData', JSON.stringify(data));
  localStorage.setItem('carePrivacyNoticeResult', JSON.stringify(result));

  document.getElementById('form-container').style.display = 'none';
  document.getElementById('success').style.display = 'block';

  // Populate success summary
  const summary = document.getElementById('success-summary');
  if (summary) {
    const esc = s => s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '&mdash;';
    summary.innerHTML =
      '<dl>' +
      '<dt>Name</dt><dd>' + esc(data.acknowledgment.patientName) + '</dd>' +
      '<dt>Date</dt><dd>' + esc(data.acknowledgment.date) + '</dd>' +
      '<dt>Status</dt><dd>Acknowledged</dd>' +
      '</dl>';
  }

  window.scrollTo(0, 0);
};

// ─── Step display ────────────────────────────────────────

// ─── Render notice (Step 2) ──────────────────────────────

function renderNotice() {
  const container = document.getElementById('notice-content');
  if (container) {
    container.innerHTML = renderNoticeHtml(data.config);
  }
}

// ─── Populate form fields from data ─────────────────────

function populateStep(step) {
  const section = document.getElementById('step-' + step);
  if (!section) return;

  section.querySelectorAll('[data-field]').forEach(el => {
    const path = el.getAttribute('data-field');
    const val = getNestedValue(data, path);
    if (el.type === 'checkbox') {
      el.checked = !!val;
    } else {
      el.value = val || '';
    }
  });
}

// ─── Collect form fields into data ──────────────────────

function collectCurrentStep() {
  const section = document.getElementById('step-' + currentStep);
  if (!section) return;

  section.querySelectorAll('[data-field]').forEach(el => {
    const path = el.getAttribute('data-field');
    if (el.type === 'checkbox') {
      setNestedValue(data, path, el.checked);
    } else {
      setNestedValue(data, path, el.value);
    }
  });
}

// ─── Utilities ───────────────────────────────────────────

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

// Show form immediately (single-page layout)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-container');
  if (form) form.classList.remove('hidden');
});
