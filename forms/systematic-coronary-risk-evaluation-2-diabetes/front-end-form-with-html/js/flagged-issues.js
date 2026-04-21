/**
 * SCORE2-Diabetes Additional Flags (14 clinical flags)
 */
import { hasEstablishedCvd, hba1cMmolMol, calculateBmi } from './utils.js';

export function detectAdditionalFlags(data) {
    const flags = [];

    if ((data.bloodPressure.systolicBp != null && data.bloodPressure.systolicBp >= 180) || (data.bloodPressure.diastolicBp != null && data.bloodPressure.diastolicBp >= 120))
        flags.push({ id: 'FLAG-BP-001', category: 'Blood Pressure', message: 'Hypertensive crisis - urgent assessment required', priority: 'high' });

    if (data.bloodPressure.onAntihypertensive === 'yes' && data.bloodPressure.systolicBp != null && data.bloodPressure.systolicBp >= 140)
        flags.push({ id: 'FLAG-BP-002', category: 'Blood Pressure', message: 'Blood pressure not at target despite antihypertensive therapy - review medication', priority: 'medium' });

    const hba1c = hba1cMmolMol(data);
    if (hba1c != null && hba1c >= 86)
        flags.push({ id: 'FLAG-HBA1C-001', category: 'Glycaemic Control', message: 'HbA1c >= 86 mmol/mol (10%) - urgent glycaemic management review', priority: 'high' });

    if (hasEstablishedCvd(data) && data.currentMedications.sglt2Inhibitor !== 'yes' && data.currentMedications.glp1Agonist !== 'yes')
        flags.push({ id: 'FLAG-MED-001', category: 'Medications', message: 'Established CVD without SGLT2 inhibitor or GLP-1 agonist - consider cardioprotective therapy', priority: 'high' });

    if (hasEstablishedCvd(data) && data.lipidProfile.onStatin !== 'yes')
        flags.push({ id: 'FLAG-MED-002', category: 'Medications', message: 'Established CVD without statin therapy', priority: 'high' });

    if (data.renalFunction.urineAcr != null && data.renalFunction.urineAcr >= 3 && data.currentMedications.aceInhibitorOrArb !== 'yes')
        flags.push({ id: 'FLAG-MED-003', category: 'Medications', message: 'Albuminuria without ACE inhibitor or ARB - consider renoprotective therapy', priority: 'medium' });

    if (data.complicationsScreening.retinopathyStatus === 'notScreened')
        flags.push({ id: 'FLAG-SCREEN-001', category: 'Screening', message: 'Retinopathy screening not completed - arrange eye screening', priority: 'medium' });

    if (data.complicationsScreening.monofilamentTest === 'abnormal' || data.complicationsScreening.footPulses === 'absent')
        flags.push({ id: 'FLAG-SCREEN-002', category: 'Screening', message: 'Abnormal foot examination - refer to diabetic foot team', priority: 'high' });

    if (data.complicationsScreening.footUlcerHistory === 'yes')
        flags.push({ id: 'FLAG-SCREEN-003', category: 'Screening', message: 'History of foot ulceration - high-risk foot, ensure podiatry follow-up', priority: 'medium' });

    const bmi = data.lifestyleFactors.bmi ?? calculateBmi(data.patientDemographics.heightCm, data.patientDemographics.weightKg);
    if (bmi != null && bmi >= 40)
        flags.push({ id: 'FLAG-BMI-001', category: 'Lifestyle', message: 'Severe obesity (BMI >= 40) - consider bariatric/metabolic surgery referral', priority: 'medium' });

    if (data.lifestyleFactors.smokingStatus === 'current')
        flags.push({ id: 'FLAG-SMOKE-001', category: 'Lifestyle', message: 'Current smoker - offer smoking cessation support', priority: 'medium' });

    if (data.renalFunction.egfr != null && data.renalFunction.egfr < 30)
        flags.push({ id: 'FLAG-RENAL-001', category: 'Renal', message: 'eGFR < 30 - consider nephrology referral and medication dose adjustment', priority: 'high' });

    if (data.cardiovascularHistory.currentChestPain === 'yes' || data.cardiovascularHistory.currentDyspnoea === 'yes')
        flags.push({ id: 'FLAG-CVD-001', category: 'Cardiovascular', message: 'Active cardiovascular symptoms reported - consider urgent cardiology assessment', priority: 'high' });

    if (data.diabetesHistory.diabetesType === 'type2' && data.currentMedications.metformin !== 'yes' && (data.renalFunction.egfr == null || data.renalFunction.egfr >= 30))
        flags.push({ id: 'FLAG-MED-004', category: 'Medications', message: 'Type 2 diabetes without metformin (eGFR adequate) - consider first-line therapy', priority: 'low' });

    flags.sort((a, b) => { const o = p => p === 'high' ? 0 : p === 'medium' ? 1 : 2; return o(a.priority) - o(b.priority); });
    return flags;
}
