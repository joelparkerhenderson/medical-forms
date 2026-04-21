import type { AdditionalFlag, ClinicianAssessment } from './types.js';

export function detectAdditionalFlags(data: ClinicianAssessment): AdditionalFlag[] {
  const flags: AdditionalFlag[] = [];

  if (data.airway.mallampatiClass === 'III' || data.airway.mallampatiClass === 'IV') {
    flags.push({
      flagId: 'F-DIFFICULT-AIRWAY',
      category: 'difficult-airway',
      priority: 'high',
      description: `Mallampati class ${data.airway.mallampatiClass} — predicts difficult intubation`,
      suggestedAction: 'Prepare difficult-airway trolley; consider awake fibreoptic intubation.',
    });
  }
  if (data.airway.priorDifficultIntubation === 'yes') {
    flags.push({
      flagId: 'F-DIFFICULT-AIRWAY-HISTORY',
      category: 'difficult-airway',
      priority: 'high',
      description: 'Documented prior difficult intubation',
      suggestedAction: 'Senior anaesthetist review; airway alert on record.',
    });
  }
  if (data.cardiovascular.echoEfPercent !== null && data.cardiovascular.echoEfPercent < 40) {
    flags.push({
      flagId: 'F-SEVERE-CARDIAC',
      category: 'severe-cardiac',
      priority: 'high',
      description: `Ejection fraction ${data.cardiovascular.echoEfPercent}%`,
      suggestedAction: 'Cardiology review; consider invasive monitoring and HDU disposition.',
    });
  }
  if (
    data.vitals.spo2Percent !== null &&
    data.vitals.spo2Percent < 92 &&
    data.vitals.onRoomAir === 'yes'
  ) {
    flags.push({
      flagId: 'F-SEVERE-RESPIRATORY',
      category: 'severe-respiratory',
      priority: 'high',
      description: `SpO2 ${data.vitals.spo2Percent}% on room air`,
      suggestedAction: 'Respiratory review; consider optimisation before surgery.',
    });
  }
  if (
    data.haematology.inr !== null &&
    data.haematology.inr > 1.5 &&
    data.haematology.onAnticoagulant !== 'yes'
  ) {
    flags.push({
      flagId: 'F-COAGULOPATHY',
      category: 'coagulopathy',
      priority: 'high',
      description: `INR ${data.haematology.inr} off anticoagulants`,
      suggestedAction: 'Haematology review; correct before surgery.',
    });
  }
  if (data.haematology.hbGL !== null && data.haematology.hbGL < 80) {
    flags.push({
      flagId: 'F-SEVERE-ANAEMIA',
      category: 'severe-anaemia',
      priority: 'high',
      description: `Hb ${data.haematology.hbGL} g/L`,
      suggestedAction: 'Investigate and treat; consider iron / transfusion pre-op.',
    });
  }
  if (data.endocrine.hba1cMmolMol !== null && data.endocrine.hba1cMmolMol > 75) {
    flags.push({
      flagId: 'F-UNCONTROLLED-DIABETES',
      category: 'uncontrolled-diabetes',
      priority: 'high',
      description: `HbA1c ${data.endocrine.hba1cMmolMol} mmol/mol`,
      suggestedAction: 'Diabetes team review; defer elective surgery if possible.',
    });
  }
  if (data.renalHepatic.egfrMlMin173m2 !== null && data.renalHepatic.egfrMlMin173m2 < 30) {
    flags.push({
      flagId: 'F-SEVERE-RENAL',
      category: 'severe-renal',
      priority: 'high',
      description: `eGFR ${data.renalHepatic.egfrMlMin173m2}`,
      suggestedAction: 'Nephrology review; adjust anaesthetic drug dosing.',
    });
  }
  if (data.renalHepatic.bilirubinUmolL !== null && data.renalHepatic.bilirubinUmolL > 50) {
    flags.push({
      flagId: 'F-SEVERE-HEPATIC',
      category: 'severe-hepatic',
      priority: 'high',
      description: `Bilirubin ${data.renalHepatic.bilirubinUmolL} µmol/L`,
      suggestedAction: 'Hepatology review; avoid hepatotoxic agents.',
    });
  }
  if (data.functionalCapacity.clinicalFrailtyScale !== null && data.functionalCapacity.clinicalFrailtyScale >= 7) {
    flags.push({
      flagId: 'F-SEVERE-FRAILTY',
      category: 'severe-frailty',
      priority: 'high',
      description: `CFS ${data.functionalCapacity.clinicalFrailtyScale}`,
      suggestedAction: 'Comprehensive Geriatric Assessment; shared-decision-making conversation.',
    });
  }
  if (
    data.respiratory.covidHistory === 'recent' &&
    data.respiratory.daysSinceCovid !== null &&
    data.respiratory.daysSinceCovid < 49
  ) {
    flags.push({
      flagId: 'F-RECENT-COVID',
      category: 'recent-covid-19',
      priority: 'high',
      description: `COVID-19 within ${data.respiratory.daysSinceCovid} days`,
      suggestedAction: 'Consider deferring elective surgery until 7 weeks post-infection (CPOC 2021).',
    });
  }
  if (data.gastrointestinal.fastingConfirmed === 'no' && data.surgery.urgency === 'elective') {
    flags.push({
      flagId: 'F-FASTING-VIOLATION',
      category: 'fasting-violation',
      priority: 'high',
      description: 'Fasting requirements not confirmed',
      suggestedAction: 'Reschedule or perform rapid-sequence induction with informed consent.',
    });
  }
  if (
    (data.surgery.anticipatedBloodLossMl ?? 0) >= 500 &&
    data.haematology.groupAndSave !== 'valid'
  ) {
    flags.push({
      flagId: 'F-MISSING-CROSSMATCH',
      category: 'missing-crossmatch',
      priority: 'medium',
      description: 'Anticipated high blood loss without valid group & save',
      suggestedAction: 'Order group & save / crossmatch before surgery.',
    });
  }
  if (data.neurological.capacityConcern === 'yes') {
    flags.push({
      flagId: 'F-CAPACITY',
      category: 'capacity-concern',
      priority: 'medium',
      description: 'Clinician concern about capacity for consent',
      suggestedAction: 'Mental Capacity Act 2005 assessment; involve family / advocate.',
    });
  }
  if (
    data.allergies.some(
      (a) => a.category === 'latex' && a.reactionSeverity !== 'mild' && a.reactionSeverity !== '',
    )
  ) {
    flags.push({
      flagId: 'F-LATEX',
      category: 'latex-allergy',
      priority: 'high',
      description: 'Latex allergy',
      suggestedAction: 'Latex-free theatre environment required.',
    });
  }
  if (data.functionalCapacity.malnutritionRisk === 'high') {
    flags.push({
      flagId: 'F-MALNUTRITION',
      category: 'malnutrition-risk',
      priority: 'medium',
      description: 'High malnutrition risk',
      suggestedAction: 'Dietitian referral; consider oral nutritional supplements pre-op.',
    });
  }

  return flags;
}
