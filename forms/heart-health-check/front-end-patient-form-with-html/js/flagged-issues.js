import { calculateBMI, calculateTcHdlRatio } from './utils.js';
import { estimateTenYearRisk, calculateHeartAge } from './grader.js';

/**
 * Detects additional flags that should be highlighted for clinician review.
 * These are safety-critical or process-significant alerts.
 */
export function detectAdditionalFlags(data) {
  const flags = [];

  // FLAG-AGE-001: Age outside 25-84 range
  if (data.demographicsEthnicity.age != null) {
    if (data.demographicsEthnicity.age < 25 || data.demographicsEthnicity.age > 84) {
      flags.push({
        id: 'FLAG-AGE-001',
        category: 'Eligibility',
        message: 'Age outside validated range (25-84) - QRISK3 may not be applicable',
        priority: 'high'
      });
    }
  }

  // FLAG-BP-001: Systolic >= 180
  if (data.bloodPressure.systolicBP != null && data.bloodPressure.systolicBP >= 180) {
    flags.push({
      id: 'FLAG-BP-001',
      category: 'Blood Pressure',
      message: 'Systolic BP 180+ mmHg - urgent hypertension management required',
      priority: 'high'
    });
  }

  // FLAG-BP-002: Diastolic >= 120
  if (data.bloodPressure.diastolicBP != null && data.bloodPressure.diastolicBP >= 120) {
    flags.push({
      id: 'FLAG-BP-002',
      category: 'Blood Pressure',
      message: 'Diastolic BP 120+ mmHg - hypertensive emergency',
      priority: 'high'
    });
  }

  // FLAG-CHOL-001: TC/HDL ratio >= 8
  const ratio = data.cholesterol.totalHDLRatio
    ?? calculateTcHdlRatio(data.cholesterol.totalCholesterol, data.cholesterol.hdlCholesterol);
  if (ratio != null && ratio >= 8) {
    flags.push({
      id: 'FLAG-CHOL-001',
      category: 'Cholesterol',
      message: 'TC/HDL ratio 8+ - severe dyslipidaemia requiring urgent review',
      priority: 'high'
    });
  }

  // FLAG-DM-001: Diabetes without statin
  if (
    (data.medicalConditions.hasDiabetes === 'type1' || data.medicalConditions.hasDiabetes === 'type2') &&
    data.cholesterol.onStatin !== 'yes'
  ) {
    flags.push({
      id: 'FLAG-DM-001',
      category: 'Diabetes',
      message: 'Diabetes present without statin therapy - review lipid management',
      priority: 'medium'
    });
  }

  // FLAG-CKD-001: CKD with diabetes
  if (
    data.medicalConditions.hasChronicKidneyDisease === 'yes' &&
    (data.medicalConditions.hasDiabetes === 'type1' || data.medicalConditions.hasDiabetes === 'type2')
  ) {
    flags.push({
      id: 'FLAG-CKD-001',
      category: 'Renal',
      message: 'CKD combined with diabetes - high cardiovascular risk, specialist review',
      priority: 'high'
    });
  }

  // FLAG-SMOKE-001: Heavy smoker >= 20/day
  if (data.smokingAlcohol.cigarettesPerDay != null && data.smokingAlcohol.cigarettesPerDay >= 20) {
    flags.push({
      id: 'FLAG-SMOKE-001',
      category: 'Smoking',
      message: 'Heavy smoker (20+ cigarettes/day) - intensive cessation support recommended',
      priority: 'high'
    });
  }

  // FLAG-AF-001: AF present
  if (data.medicalConditions.hasAtrialFibrillation === 'yes') {
    flags.push({
      id: 'FLAG-AF-001',
      category: 'Cardiac',
      message: 'Atrial fibrillation present - ensure anticoagulation status is reviewed',
      priority: 'medium'
    });
  }

  // FLAG-BMI-001: BMI >= 40
  const bmi = data.bodyMeasurements.bmi
    ?? calculateBMI(data.bodyMeasurements.heightCm, data.bodyMeasurements.weightKg);
  if (bmi != null && bmi >= 40) {
    flags.push({
      id: 'FLAG-BMI-001',
      category: 'Body Composition',
      message: 'BMI 40+ (morbid obesity) - weight management and bariatric referral',
      priority: 'high'
    });
  }

  // FLAG-AUDIT-001: High AUDIT score
  if (data.reviewCalculate.auditScore != null && data.reviewCalculate.auditScore >= 16) {
    flags.push({
      id: 'FLAG-AUDIT-001',
      category: 'Alcohol',
      message: 'AUDIT score 16+ - harmful/dependent drinking, specialist referral',
      priority: 'high'
    });
  }

  // FLAG-HEART-001: Heart age >= 15 years above chronological
  const tenYearRisk = estimateTenYearRisk(data);
  const heartAge = calculateHeartAge(data, tenYearRisk);
  if (heartAge != null && data.demographicsEthnicity.age != null) {
    if (heartAge >= data.demographicsEthnicity.age + 15) {
      flags.push({
        id: 'FLAG-HEART-001',
        category: 'Heart Age',
        message: 'Heart age 15+ years above chronological age - significant excess risk',
        priority: 'high'
      });
    }
  }

  // FLAG-MED-001: High risk without statin
  if (tenYearRisk >= 10 && data.cholesterol.onStatin !== 'yes') {
    flags.push({
      id: 'FLAG-MED-001',
      category: 'Medication',
      message: '10-year risk 10%+ without statin therapy - consider statin initiation per NICE',
      priority: 'medium'
    });
  }

  // FLAG-INACT-001: Sedentary
  if (
    data.physicalActivityDiet.physicalActivityMinutesPerWeek != null &&
    data.physicalActivityDiet.physicalActivityMinutesPerWeek < 30
  ) {
    flags.push({
      id: 'FLAG-INACT-001',
      category: 'Physical Activity',
      message: 'Sedentary lifestyle (under 30 min/week) - physical activity counselling',
      priority: 'medium'
    });
  }

  // Sort: high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  flags.sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));

  return flags;
}
