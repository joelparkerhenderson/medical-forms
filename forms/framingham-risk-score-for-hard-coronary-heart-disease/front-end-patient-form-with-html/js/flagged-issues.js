import { calculateBmi, calculateFraminghamRisk, convertMmolToMg, isSmoker } from './utils.js';

export function detectAdditionalFlags(data) {
  const flags = [];
  const tcMg = data.cholesterol.totalCholesterol !== null
    ? (data.cholesterol.cholesterolUnit === 'mmolL' ? convertMmolToMg(data.cholesterol.totalCholesterol) : data.cholesterol.totalCholesterol)
    : null;
  const hdlMg = data.cholesterol.hdlCholesterol !== null
    ? (data.cholesterol.cholesterolUnit === 'mmolL' ? convertMmolToMg(data.cholesterol.hdlCholesterol) : data.cholesterol.hdlCholesterol)
    : null;
  const bmi = data.lifestyleFactors.bmi ?? calculateBmi(data.demographics.heightCm, data.demographics.weightKg);

  if (data.demographics.age !== null && (data.demographics.age < 30 || data.demographics.age > 79))
    flags.push({ id:'FLAG-ELIG-001', category:'Eligibility', message:'Age outside valid range (30-79)', priority:'high' });
  if (data.medicalHistory.hasPriorChd === 'yes')
    flags.push({ id:'FLAG-ELIG-002', category:'Eligibility', message:'Prior CHD - Framingham not applicable for secondary prevention', priority:'high' });
  if (data.medicalHistory.hasDiabetes === 'yes')
    flags.push({ id:'FLAG-ELIG-003', category:'Eligibility', message:'Has diabetes - use diabetes-specific calculator', priority:'high' });
  if (data.bloodPressure.systolicBp !== null && data.bloodPressure.systolicBp >= 180)
    flags.push({ id:'FLAG-BP-001', category:'Blood Pressure', message:'Systolic BP >= 180 mmHg - urgent evaluation', priority:'high' });
  if (data.bloodPressure.diastolicBp !== null && data.bloodPressure.diastolicBp >= 120)
    flags.push({ id:'FLAG-BP-002', category:'Blood Pressure', message:'Diastolic BP >= 120 mmHg - hypertensive emergency', priority:'high' });
  if (tcMg !== null && tcMg >= 300)
    flags.push({ id:'FLAG-CHOL-001', category:'Cholesterol', message:'Total cholesterol >= 300 mg/dL', priority:'high' });
  if (hdlMg !== null && hdlMg < 30)
    flags.push({ id:'FLAG-CHOL-002', category:'Cholesterol', message:'HDL < 30 mg/dL - critically low', priority:'high' });
  if (isSmoker(data.smokingHistory.smokingStatus))
    flags.push({ id:'FLAG-SMOKE-001', category:'Smoking', message:'Current smoker - cessation counselling recommended', priority:'medium' });
  if (bmi !== null && bmi >= 40)
    flags.push({ id:'FLAG-BMI-001', category:'Lifestyle', message:'BMI >= 40 - weight management referral', priority:'high' });
  if (data.familyHistory.familyChdHistory === 'yes' && data.familyHistory.familyChdAgeOnset === 'under55')
    flags.push({ id:'FLAG-FAM-001', category:'Family History', message:'Premature family CHD - enhanced screening', priority:'medium' });
  const riskPct = calculateFraminghamRisk(data);
  if (riskPct >= 20 && data.currentMedications.onStatin !== 'yes')
    flags.push({ id:'FLAG-MED-001', category:'Medications', message:'High risk but not on statin', priority:'high' });
  if (data.bloodPressure.systolicBp !== null && data.bloodPressure.systolicBp >= 140 && data.bloodPressure.onBpTreatment !== 'yes')
    flags.push({ id:'FLAG-MED-002', category:'Medications', message:'Hypertension but not on treatment', priority:'medium' });
  if (data.lifestyleFactors.physicalActivity === 'sedentary' && bmi !== null && bmi >= 30)
    flags.push({ id:'FLAG-LIFE-001', category:'Lifestyle', message:'Sedentary + obesity - lifestyle intervention needed', priority:'medium' });
  if (data.demographics.age !== null && data.demographics.age >= 75)
    flags.push({ id:'FLAG-AGE-001', category:'Demographics', message:'Age >= 75 - limited evidence for Framingham', priority:'medium' });

  const order = { high: 0, medium: 1, low: 2 };
  flags.sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3));
  return flags;
}
