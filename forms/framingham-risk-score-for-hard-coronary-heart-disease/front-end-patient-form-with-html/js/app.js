import { createDefaultAssessment } from './data-model.js';
import { TOTAL_STEPS, stepTitles } from './steps.js';
import { calculateRisk } from './risk-grader.js';
import { detectAdditionalFlags } from './flagged-issues.js';
import { riskLevelLabel } from './utils.js';

let assessmentData = createDefaultAssessment();
let currentStep = 0;

// ─── Navigation ───────────────────────────────────
window.startForm = function () {
  assessmentData = createDefaultAssessment();
  currentStep = 0;
  document.getElementById('landing').style.display = 'none';
  document.getElementById('form-container').style.display = 'block';
  document.getElementById('report-container').style.display = 'none';
  showStep(1);
};

window.nextStep = function () {
  saveCurrentStep();
  if (currentStep < TOTAL_STEPS) showStep(currentStep + 1);
};

window.prevStep = function () {
  saveCurrentStep();
  if (currentStep > 1) showStep(currentStep - 1);
};

window.submitForm = function () {
  saveCurrentStep();
  const { riskCategory, tenYearRiskPercent, firedRules } = calculateRisk(assessmentData);
  const additionalFlags = detectAdditionalFlags(assessmentData);
  showReport({ riskCategory, tenYearRiskPercent, firedRules, additionalFlags });
};

function showStep(step) {
  currentStep = step;
  document.querySelectorAll('.step-section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(`step-${step}`);
  if (el) el.classList.add('active');
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  document.getElementById('step-label').textContent = `Step ${step} of ${TOTAL_STEPS}: ${stepTitles[step - 1]}`;
  document.getElementById('step-percent').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
}

// ─── Data binding ─────────────────────────────────
function saveCurrentStep() {
  document.querySelectorAll(`#step-${currentStep} [data-field]`).forEach(el => {
    const path = el.dataset.field.split('.');
    let obj = assessmentData;
    for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
    const key = path[path.length - 1];
    if (el.type === 'radio') {
      if (el.checked) obj[key] = el.value;
    } else if (el.type === 'number') {
      obj[key] = el.value === '' ? null : Number(el.value);
    } else {
      obj[key] = el.value;
    }
  });
}

// ─── Report ───────────────────────────────────────
function showReport(result) {
  document.getElementById('form-container').style.display = 'none';
  const container = document.getElementById('report-container');
  container.style.display = 'block';

  let html = `
    <div class="report-banner ${result.riskCategory}">
      <div class="score">${result.tenYearRiskPercent}%</div>
      <div class="label">10-Year Risk of Hard CHD</div>
      <div style="margin-top:0.5rem;font-weight:600;">${riskLevelLabel(result.riskCategory)}</div>
    </div>
    <div class="card"><h2>Key Inputs</h2><div class="summary-grid">
      <div><strong>Patient:</strong> ${assessmentData.patientInformation.fullName || 'N/A'}</div>
      <div><strong>Age:</strong> ${assessmentData.demographics.age ?? 'N/A'}</div>
      <div><strong>Sex:</strong> ${assessmentData.demographics.sex || 'N/A'}</div>
      <div><strong>Smoking:</strong> ${assessmentData.smokingHistory.smokingStatus || 'N/A'}</div>
      <div><strong>Systolic BP:</strong> ${assessmentData.bloodPressure.systolicBp ?? 'N/A'} mmHg</div>
      <div><strong>BP Treatment:</strong> ${assessmentData.bloodPressure.onBpTreatment || 'N/A'}</div>
      <div><strong>Total Cholesterol:</strong> ${assessmentData.cholesterol.totalCholesterol ?? 'N/A'}</div>
      <div><strong>HDL:</strong> ${assessmentData.cholesterol.hdlCholesterol ?? 'N/A'}</div>
    </div></div>`;

  if (result.additionalFlags.length > 0) {
    html += '<div class="card"><h2>Flagged Issues</h2>';
    for (const f of result.additionalFlags) {
      html += `<div class="flag-item ${f.priority}"><span class="badge badge-${f.priority}">${f.priority}</span><div><strong>${f.category}:</strong> ${f.message}</div></div>`;
    }
    html += '</div>';
  }

  if (result.firedRules.length > 0) {
    html += '<div class="card"><h2>Risk Analysis</h2><table class="rules-table"><thead><tr><th>Rule</th><th>Category</th><th>Description</th><th>Level</th></tr></thead><tbody>';
    for (const r of result.firedRules) {
      html += `<tr><td>${r.id}</td><td>${r.category}</td><td>${r.description}</td><td><span class="badge badge-${r.riskLevel}">${r.riskLevel}</span></td></tr>`;
    }
    html += '</tbody></table></div>';
  }

  html += `<div class="card" style="text-align:center;">
    <button class="btn btn-primary" onclick="startForm()">New Assessment</button>
    <button class="btn btn-secondary" onclick="window.print()" style="margin-left:0.5rem;">Print</button>
  </div>`;

  container.innerHTML = html;
}
