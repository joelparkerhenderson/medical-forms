import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of MRC grade. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Haemoptysis (HIGH) ─────────────────────────────────
	if (data.coughAssessment.haemoptysis === 'yes') {
		flags.push({
			id: 'FLAG-HAEM-001',
			category: 'Haemoptysis',
			message: `Haemoptysis reported${data.coughAssessment.haemoptysisDetails ? ': ' + data.coughAssessment.haemoptysisDetails : ''} - urgent investigation required`,
			priority: 'high'
		});
	}

	// ─── Acute respiratory failure risk (HIGH) ──────────────
	if (
		data.pulmonaryFunction.oxygenSaturation !== null &&
		data.pulmonaryFunction.oxygenSaturation < 88
	) {
		flags.push({
			id: 'FLAG-RESP-FAIL-001',
			category: 'Respiratory Failure',
			message: `SpO2 ${data.pulmonaryFunction.oxygenSaturation}% - risk of acute respiratory failure`,
			priority: 'high'
		});
	}

	if (data.pulmonaryFunction.fev1 !== null && data.pulmonaryFunction.fev1 < 30) {
		flags.push({
			id: 'FLAG-RESP-FAIL-002',
			category: 'Respiratory Failure',
			message: `FEV1 ${data.pulmonaryFunction.fev1}% predicted - very severe obstruction`,
			priority: 'high'
		});
	}

	// ─── PE risk (HIGH) ─────────────────────────────────────
	if (data.respiratoryHistory.pulmonaryEmbolism === 'yes') {
		flags.push({
			id: 'FLAG-PE-001',
			category: 'Pulmonary Embolism',
			message: `Previous PE${data.respiratoryHistory.peDate ? ' (' + data.respiratoryHistory.peDate + ')' : ''} - assess anticoagulation and recurrence risk`,
			priority: 'high'
		});
	}

	// ─── Oxygen dependent (MEDIUM) ──────────────────────────
	if (data.currentMedications.oxygenTherapy === 'yes') {
		const delivery = data.currentMedications.oxygenDelivery || 'not specified';
		const flow = data.currentMedications.oxygenFlowRate;
		flags.push({
			id: 'FLAG-O2-001',
			category: 'Oxygen Therapy',
			message: `Oxygen dependent (${delivery}${flow ? ', ' + flow + ' L/min' : ''})`,
			priority: 'medium'
		});
	}

	// ─── OSA (MEDIUM) ───────────────────────────────────────
	if (
		data.sleepFunctional.stopBangScore !== null &&
		data.sleepFunctional.stopBangScore >= 5
	) {
		flags.push({
			id: 'FLAG-OSA-001',
			category: 'Obstructive Sleep Apnoea',
			message: `STOP-BANG score ${data.sleepFunctional.stopBangScore}/7 - high risk of OSA`,
			priority: 'medium'
		});
	}

	if (
		data.sleepFunctional.stopBangScore !== null &&
		data.sleepFunctional.stopBangScore >= 3 &&
		data.sleepFunctional.stopBangScore < 5
	) {
		flags.push({
			id: 'FLAG-OSA-002',
			category: 'Obstructive Sleep Apnoea',
			message: `STOP-BANG score ${data.sleepFunctional.stopBangScore}/7 - intermediate risk of OSA`,
			priority: 'medium'
		});
	}

	// ─── Tuberculosis (MEDIUM) ──────────────────────────────
	if (data.respiratoryHistory.tuberculosis === 'yes') {
		const treated = data.respiratoryHistory.tbTreatmentComplete;
		flags.push({
			id: 'FLAG-TB-001',
			category: 'Tuberculosis',
			message: treated === 'yes'
				? 'Previous TB - treatment completed'
				: 'Previous TB - treatment status unclear, assess infectivity',
			priority: treated === 'yes' ? 'medium' : 'high'
		});
	}

	// ─── Interstitial lung disease (MEDIUM) ─────────────────
	if (data.respiratoryHistory.interstitialLungDisease === 'yes') {
		flags.push({
			id: 'FLAG-ILD-001',
			category: 'Interstitial Lung Disease',
			message: `ILD${data.respiratoryHistory.ildType ? ' (' + data.respiratoryHistory.ildType + ')' : ''} - monitor progression`,
			priority: 'medium'
		});
	}

	// ─── Asbestos exposure (MEDIUM) ─────────────────────────
	if (data.smokingExposures.asbestosExposure === 'yes') {
		flags.push({
			id: 'FLAG-ASBESTOS-001',
			category: 'Occupational Exposure',
			message: `Asbestos exposure${data.smokingExposures.asbestosDetails ? ': ' + data.smokingExposures.asbestosDetails : ''} - mesothelioma screening`,
			priority: 'medium'
		});
	}

	// ─── Oral steroids (MEDIUM) ─────────────────────────────
	if (data.currentMedications.oralSteroids === 'yes') {
		flags.push({
			id: 'FLAG-STEROIDS-001',
			category: 'Medication',
			message: `On oral corticosteroids${data.currentMedications.oralSteroidDetails ? ': ' + data.currentMedications.oralSteroidDetails : ''} - consider side effects`,
			priority: 'medium'
		});
	}

	// ─── Drug allergies (MEDIUM) ────────────────────────────
	for (const [i, allergy] of data.allergies.drugAllergies.entries()) {
		if (allergy.severity === 'anaphylaxis') {
			flags.push({
				id: `FLAG-ALLERGY-ANAPH-${i}`,
				category: 'Allergy',
				message: `ANAPHYLAXIS history: ${allergy.allergen}`,
				priority: 'high'
			});
		}
	}

	if (data.allergies.drugAllergies.length > 0) {
		flags.push({
			id: 'FLAG-ALLERGY-001',
			category: 'Allergy',
			message: `${data.allergies.drugAllergies.length} drug allergy/allergies documented`,
			priority: 'medium'
		});
	}

	// ─── Daytime somnolence (LOW) ───────────────────────────
	if (data.sleepFunctional.daytimeSomnolence === 'yes') {
		flags.push({
			id: 'FLAG-SOMN-001',
			category: 'Sleep',
			message: `Daytime somnolence reported${data.sleepFunctional.epworthScore !== null ? ' (Epworth score: ' + data.sleepFunctional.epworthScore + ')' : ''}`,
			priority: 'low'
		});
	}

	// ─── Occupational exposure (LOW) ────────────────────────
	if (data.smokingExposures.occupationalExposure === 'yes') {
		flags.push({
			id: 'FLAG-OCCUP-001',
			category: 'Occupational Exposure',
			message: `Occupational respiratory exposure${data.smokingExposures.occupationalDetails ? ': ' + data.smokingExposures.occupationalDetails : ''}`,
			priority: 'low'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
