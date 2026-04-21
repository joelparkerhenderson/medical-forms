import type { AdditionalFlag, AssessmentData } from './types';
import { estimateTenYearRisk, hba1cToPercent, isSmoker } from './utils';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of the risk score. These are actionable alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// FLAG-CVD-001: Known CVD (calculator not intended for secondary prevention)
	if (data.medicalHistory.hasKnownCvd === 'yes') {
		flags.push({
			id: 'FLAG-CVD-001',
			category: 'Eligibility',
			message: 'Patient has known CVD - PREVENT is for primary prevention only',
			priority: 'high'
		});
	}

	// FLAG-AGE-001: Age outside 30-79 range
	if (data.demographics.age !== null) {
		if (data.demographics.age < 30 || data.demographics.age > 79) {
			flags.push({
				id: 'FLAG-AGE-001',
				category: 'Eligibility',
				message: 'Age outside validated range (30-79 years)',
				priority: 'high'
			});
		}
	}

	// FLAG-BP-001: Systolic >= 180 (urgent)
	if (data.bloodPressure.systolicBp !== null && data.bloodPressure.systolicBp >= 180.0) {
		flags.push({
			id: 'FLAG-BP-001',
			category: 'Blood Pressure',
			message: 'Systolic BP >= 180 mmHg - urgent evaluation needed',
			priority: 'high'
		});
	}

	// FLAG-BP-002: Diastolic >= 120 (emergency)
	if (data.bloodPressure.diastolicBp !== null && data.bloodPressure.diastolicBp >= 120.0) {
		flags.push({
			id: 'FLAG-BP-002',
			category: 'Blood Pressure',
			message: 'Diastolic BP >= 120 mmHg - hypertensive emergency',
			priority: 'high'
		});
	}

	// FLAG-CHOL-001: TC >= 300 (severe)
	if (
		data.cholesterolLipids.totalCholesterol !== null &&
		data.cholesterolLipids.totalCholesterol >= 300.0
	) {
		flags.push({
			id: 'FLAG-CHOL-001',
			category: 'Cholesterol',
			message: 'Total cholesterol >= 300 mg/dL - severe hypercholesterolemia',
			priority: 'high'
		});
	}

	// FLAG-CHOL-002: HDL < 30 (critically low)
	if (
		data.cholesterolLipids.hdlCholesterol !== null &&
		data.cholesterolLipids.hdlCholesterol < 30.0
	) {
		flags.push({
			id: 'FLAG-CHOL-002',
			category: 'Cholesterol',
			message: 'HDL cholesterol < 30 mg/dL - critically low',
			priority: 'high'
		});
	}

	// FLAG-DM-001: Uncontrolled diabetes (HbA1c >= 9%)
	const hba1c = hba1cToPercent(data.metabolicHealth.hba1cValue, data.metabolicHealth.hba1cUnit);
	if (hba1c !== null && hba1c >= 9.0) {
		flags.push({
			id: 'FLAG-DM-001',
			category: 'Diabetes',
			message: 'HbA1c >= 9% - uncontrolled diabetes, review management',
			priority: 'high'
		});
	}

	// FLAG-RENAL-001: eGFR < 15 (kidney failure)
	if (data.renalFunction.egfr !== null && data.renalFunction.egfr < 15.0) {
		flags.push({
			id: 'FLAG-RENAL-001',
			category: 'Renal Function',
			message: 'eGFR < 15 mL/min - kidney failure, nephrology referral needed',
			priority: 'high'
		});
	}

	// FLAG-RENAL-002: Severe albuminuria (uACR > 300)
	if (data.renalFunction.urineAcr !== null && data.renalFunction.urineAcr > 300.0) {
		flags.push({
			id: 'FLAG-RENAL-002',
			category: 'Renal Function',
			message: 'uACR > 300 mg/g - severe albuminuria',
			priority: 'high'
		});
	}

	// FLAG-SMOKE-001: Heavy smoker (>= 20/day)
	if (data.smokingHistory.cigarettesPerDay !== null && data.smokingHistory.cigarettesPerDay >= 20) {
		flags.push({
			id: 'FLAG-SMOKE-001',
			category: 'Smoking',
			message: 'Heavy smoker (>= 20 cigarettes/day) - intensive cessation support recommended',
			priority: 'medium'
		});
	}

	// FLAG-BMI-001: BMI >= 40 (morbid obesity)
	if (data.metabolicHealth.bmi !== null && data.metabolicHealth.bmi >= 40.0) {
		flags.push({
			id: 'FLAG-BMI-001',
			category: 'BMI',
			message: 'BMI >= 40 - morbid obesity, weight management referral recommended',
			priority: 'medium'
		});
	}

	// FLAG-MED-001: High risk but no statin
	{
		const tenYear = estimateTenYearRisk(data);
		if (tenYear >= 7.5 && data.cholesterolLipids.onStatin !== 'yes') {
			flags.push({
				id: 'FLAG-MED-001',
				category: 'Medications',
				message: 'Intermediate/high CVD risk but not on statin therapy',
				priority: 'medium'
			});
		}
	}

	// FLAG-MED-002: Diabetes but no diabetes medication
	if (
		data.metabolicHealth.hasDiabetes === 'yes' &&
		data.currentMedications.onDiabetesMedication !== 'yes'
	) {
		flags.push({
			id: 'FLAG-MED-002',
			category: 'Medications',
			message: 'Diabetes present but no diabetes medication reported',
			priority: 'medium'
		});
	}

	// FLAG-COMBO-001: Smoking + diabetes + hypertension combination
	if (
		isSmoker(data.smokingHistory.smokingStatus) &&
		data.metabolicHealth.hasDiabetes === 'yes' &&
		data.bloodPressure.systolicBp !== null &&
		data.bloodPressure.systolicBp >= 140.0
	) {
		flags.push({
			id: 'FLAG-COMBO-001',
			category: 'Combination Risk',
			message: 'Smoking + diabetes + hypertension - very high-risk combination',
			priority: 'high'
		});
	}

	// Sort: high > medium > low
	flags.sort((a, b) => {
		const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
		return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
	});

	return flags;
}
