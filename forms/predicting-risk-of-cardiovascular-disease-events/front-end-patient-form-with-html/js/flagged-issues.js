import { hba1cToPercent, isSmoker, estimateTenYearRisk } from './utils.js';

/**
 * Detects additional clinical flags that should be highlighted for the clinician.
 * Returns an array of { id, category, message, priority } objects sorted by priority.
 */
export function detectAdditionalFlags(data) {
  const flags = [];

  // FLAG-CVD-001: Known CVD
  if (data.medicalHistory.hasKnownCvd === 'yes') {
    flags.push({ id: 'FLAG-CVD-001', category: 'Eligibility', message: 'Patient has known CVD - PREVENT is for primary prevention only', priority: 'high' });
  }

  // FLAG-AGE-001: Age outside 30-79
  if (data.demographics.age != null && (data.demographics.age < 30 || data.demographics.age > 79)) {
    flags.push({ id: 'FLAG-AGE-001', category: 'Eligibility', message: 'Age outside validated range (30-79 years)', priority: 'high' });
  }

  // FLAG-BP-001: Systolic >= 180
  if (data.bloodPressure.systolicBp != null && data.bloodPressure.systolicBp >= 180) {
    flags.push({ id: 'FLAG-BP-001', category: 'Blood Pressure', message: 'Systolic BP >= 180 mmHg - urgent evaluation needed', priority: 'high' });
  }

  // FLAG-BP-002: Diastolic >= 120
  if (data.bloodPressure.diastolicBp != null && data.bloodPressure.diastolicBp >= 120) {
    flags.push({ id: 'FLAG-BP-002', category: 'Blood Pressure', message: 'Diastolic BP >= 120 mmHg - hypertensive emergency', priority: 'high' });
  }

  // FLAG-CHOL-001: TC >= 300
  if (data.cholesterolLipids.totalCholesterol != null && data.cholesterolLipids.totalCholesterol >= 300) {
    flags.push({ id: 'FLAG-CHOL-001', category: 'Cholesterol', message: 'Total cholesterol >= 300 mg/dL - severe hypercholesterolemia', priority: 'high' });
  }

  // FLAG-CHOL-002: HDL < 30
  if (data.cholesterolLipids.hdlCholesterol != null && data.cholesterolLipids.hdlCholesterol < 30) {
    flags.push({ id: 'FLAG-CHOL-002', category: 'Cholesterol', message: 'HDL cholesterol < 30 mg/dL - critically low', priority: 'high' });
  }

  // FLAG-DM-001: HbA1c >= 9%
  const hba1c = hba1cToPercent(data.metabolicHealth.hba1cValue, data.metabolicHealth.hba1cUnit);
  if (hba1c != null && hba1c >= 9) {
    flags.push({ id: 'FLAG-DM-001', category: 'Diabetes', message: 'HbA1c >= 9% - uncontrolled diabetes, review management', priority: 'high' });
  }

  // FLAG-RENAL-001: eGFR < 15
  if (data.renalFunction.egfr != null && data.renalFunction.egfr < 15) {
    flags.push({ id: 'FLAG-RENAL-001', category: 'Renal Function', message: 'eGFR < 15 mL/min - kidney failure, nephrology referral needed', priority: 'high' });
  }

  // FLAG-RENAL-002: uACR > 300
  if (data.renalFunction.urineAcr != null && data.renalFunction.urineAcr > 300) {
    flags.push({ id: 'FLAG-RENAL-002', category: 'Renal Function', message: 'uACR > 300 mg/g - severe albuminuria', priority: 'high' });
  }

  // FLAG-SMOKE-001: >= 20 cigarettes/day
  if (data.smokingHistory.cigarettesPerDay != null && data.smokingHistory.cigarettesPerDay >= 20) {
    flags.push({ id: 'FLAG-SMOKE-001', category: 'Smoking', message: 'Heavy smoker (>= 20 cigarettes/day) - intensive cessation support recommended', priority: 'medium' });
  }

  // FLAG-BMI-001: BMI >= 40
  if (data.metabolicHealth.bmi != null && data.metabolicHealth.bmi >= 40) {
    flags.push({ id: 'FLAG-BMI-001', category: 'BMI', message: 'BMI >= 40 - morbid obesity, weight management referral recommended', priority: 'medium' });
  }

  // FLAG-MED-001: High risk without statin
  const tenYear = estimateTenYearRisk(data);
  if (tenYear >= 7.5 && data.cholesterolLipids.onStatin !== 'yes') {
    flags.push({ id: 'FLAG-MED-001', category: 'Medications', message: 'Intermediate/high CVD risk but not on statin therapy', priority: 'medium' });
  }

  // FLAG-MED-002: Diabetes without medication
  if (data.metabolicHealth.hasDiabetes === 'yes' && data.currentMedications.onDiabetesMedication !== 'yes') {
    flags.push({ id: 'FLAG-MED-002', category: 'Medications', message: 'Diabetes present but no diabetes medication reported', priority: 'medium' });
  }

  // FLAG-COMBO-001: Smoking + diabetes + hypertension
  if (isSmoker(data.smokingHistory.smokingStatus) && data.metabolicHealth.hasDiabetes === 'yes' && data.bloodPressure.systolicBp != null && data.bloodPressure.systolicBp >= 140) {
    flags.push({ id: 'FLAG-COMBO-001', category: 'Combination Risk', message: 'Smoking + diabetes + hypertension - very high-risk combination', priority: 'high' });
  }

  // Sort: high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  flags.sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));

  return flags;
}
