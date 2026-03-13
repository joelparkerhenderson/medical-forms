export function convertMmolToMg(mmol) { return mmol * 38.67; }

export function calculateBmi(heightCm, weightKg) {
  if (!heightCm || !weightKg || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function isSmoker(status) { return status === 'current'; }

export function isLikelyDraft(data) {
  return data.demographics.age === null && data.demographics.sex === '';
}

export function riskLevelLabel(level) {
  switch (level) {
    case 'low': return 'Low Risk';
    case 'intermediate': return 'Intermediate Risk';
    case 'high': return 'High Risk';
    case 'draft': return 'Draft';
    default: return 'Unknown';
  }
}

export function calculateFraminghamRisk(data) {
  const age = data.demographics.age;
  if (age === null) return 0;
  const sex = data.demographics.sex;
  if (!sex) return 0;

  let tc = data.cholesterol.totalCholesterol ?? 200;
  let hdl = data.cholesterol.hdlCholesterol ?? 50;
  if (data.cholesterol.cholesterolUnit === 'mmolL') {
    tc = convertMmolToMg(tc);
    hdl = convertMmolToMg(hdl);
  }

  const sbp = data.bloodPressure.systolicBp ?? 120;
  const treated = data.bloodPressure.onBpTreatment === 'yes';
  const smoker = isSmoker(data.smokingHistory.smokingStatus);
  const lnAge = Math.log(age), lnTc = Math.log(tc), lnHdl = Math.log(hdl), lnSbp = Math.log(sbp);

  if (sex === 'male') {
    const lnSbpCoeff = treated ? 1.305784 + 0.241549 : 1.305784;
    const ageSmoke = Math.log(Math.min(age, 70));
    const l = 52.00961*lnAge + 20.014077*lnTc + (-0.905964)*lnHdl + lnSbpCoeff*lnSbp
      + (smoker ? 12.096316 : 0) + (-4.605038)*lnAge*lnTc
      + (smoker ? -2.84367*ageSmoke : 0) + (-2.93323)*lnAge*lnAge + (-172.300168);
    return Math.max(0, Math.min(100, (1 - Math.pow(0.9402, Math.exp(l))) * 100));
  } else {
    const lnSbpCoeff = treated ? 2.552905 + 0.420251 : 2.552905;
    const ageSmoke = Math.log(Math.min(age, 78));
    const l = 31.764001*lnAge + 22.465206*lnTc + (-1.187731)*lnHdl + lnSbpCoeff*lnSbp
      + (smoker ? 13.07543 : 0) + (-5.060998)*lnAge*lnTc
      + (smoker ? -2.996945*ageSmoke : 0) + (-146.5933061);
    return Math.max(0, Math.min(100, (1 - Math.pow(0.98767, Math.exp(l))) * 100));
  }
}
