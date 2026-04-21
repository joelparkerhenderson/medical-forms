import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the cardiologist,
 * independent of CCS/NYHA classification. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Recent MI (HIGH) ───────────────────────────────────────
	if (data.cardiacHistory.recentMI === 'yes') {
		flags.push({
			id: 'FLAG-MI-001',
			category: 'Cardiac',
			message: `Recent MI (${data.cardiacHistory.recentMIWeeks ?? '?'} weeks ago) - HIGH RISK`,
			priority: 'high'
		});
	}

	// ─── Unstable angina (HIGH) ─────────────────────────────────
	if (data.chestPainAngina.unstableAngina === 'yes') {
		flags.push({
			id: 'FLAG-ANGINA-001',
			category: 'Chest Pain',
			message: 'Unstable angina reported - URGENT EVALUATION REQUIRED',
			priority: 'high'
		});
	}

	// ─── Severe HF NYHA IV (HIGH) ───────────────────────────────
	if (data.heartFailureSymptoms.nyhaClass === '4') {
		flags.push({
			id: 'FLAG-HF-001',
			category: 'Heart Failure',
			message: 'NYHA Class IV - symptoms at rest, severe heart failure',
			priority: 'high'
		});
	}

	// ─── Severely reduced LVEF (HIGH) ───────────────────────────
	if (
		data.diagnosticResults.echoPerformed === 'yes' &&
		data.diagnosticResults.echoLVEF !== null &&
		data.diagnosticResults.echoLVEF < 25
	) {
		flags.push({
			id: 'FLAG-LVEF-001',
			category: 'Diagnostics',
			message: `Severely reduced LVEF (${data.diagnosticResults.echoLVEF}%) - high risk of decompensation`,
			priority: 'high'
		});
	}

	// ─── Abnormal stress test (HIGH) ────────────────────────────
	if (
		data.diagnosticResults.stressTestPerformed === 'yes' &&
		data.diagnosticResults.stressTestResult === 'abnormal'
	) {
		flags.push({
			id: 'FLAG-STRESS-001',
			category: 'Diagnostics',
			message: 'Abnormal stress test result - further evaluation recommended',
			priority: 'high'
		});
	}

	// ─── Syncope (HIGH) ─────────────────────────────────────────
	if (data.arrhythmiaConduction.syncope === 'yes') {
		flags.push({
			id: 'FLAG-SYNCOPE-001',
			category: 'Arrhythmia',
			message: `Syncope history: ${data.arrhythmiaConduction.syncopeDetails || 'details not specified'}`,
			priority: 'high'
		});
	}

	// ─── Pacemaker/ICD (MEDIUM) ─────────────────────────────────
	if (data.arrhythmiaConduction.pacemaker === 'yes') {
		flags.push({
			id: 'FLAG-PACER-001',
			category: 'Arrhythmia',
			message: `Pacemaker/ICD in situ (${data.arrhythmiaConduction.pacemakerType || 'type not specified'}) - device check required`,
			priority: 'medium'
		});
	}

	// ─── Anticoagulant use (MEDIUM) ─────────────────────────────
	if (data.currentMedications.anticoagulants === 'yes') {
		flags.push({
			id: 'FLAG-ANTICOAG-001',
			category: 'Medications',
			message: `On anticoagulants: ${data.currentMedications.anticoagulantType || 'type not specified'} - bridging plan may be needed`,
			priority: 'medium'
		});
	}

	// ─── Antiplatelet use (MEDIUM) ──────────────────────────────
	if (data.currentMedications.antiplatelets === 'yes') {
		flags.push({
			id: 'FLAG-ANTIPLATELET-001',
			category: 'Medications',
			message: `On antiplatelets: ${data.currentMedications.antiplateletType || 'type not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Contrast allergy (MEDIUM) ──────────────────────────────
	if (data.allergies.contrastAllergy === 'yes') {
		flags.push({
			id: 'FLAG-CONTRAST-001',
			category: 'Allergy',
			message: `Contrast allergy: ${data.allergies.contrastAllergyDetails || 'details not specified'} - premedicate if contrast required`,
			priority: 'medium'
		});
	}

	// ─── Drug allergy with anaphylaxis (HIGH) ───────────────────
	for (const [i, allergy] of data.allergies.allergies.entries()) {
		if (allergy.severity === 'anaphylaxis') {
			flags.push({
				id: `FLAG-ALLERGY-ANAPH-${i}`,
				category: 'Allergy',
				message: `ANAPHYLAXIS history: ${allergy.allergen}`,
				priority: 'high'
			});
		}
	}

	// ─── Any drug allergies documented (MEDIUM) ─────────────────
	if (data.allergies.allergies.length > 0) {
		flags.push({
			id: 'FLAG-ALLERGY-001',
			category: 'Allergy',
			message: `${data.allergies.allergies.length} drug allergy/allergies documented`,
			priority: 'medium'
		});
	}

	// ─── Atrial fibrillation (MEDIUM) ───────────────────────────
	if (data.arrhythmiaConduction.atrialFibrillation === 'yes') {
		flags.push({
			id: 'FLAG-AF-001',
			category: 'Arrhythmia',
			message: `Atrial fibrillation (${data.arrhythmiaConduction.afType || 'type not specified'}) - rate/rhythm control assessment`,
			priority: 'medium'
		});
	}

	// ─── Uncontrolled hypertension (MEDIUM) ─────────────────────
	if (
		data.riskFactors.hypertension === 'yes' &&
		data.riskFactors.hypertensionControlled === 'no'
	) {
		flags.push({
			id: 'FLAG-HTN-001',
			category: 'Risk Factors',
			message: 'Uncontrolled hypertension - optimise before procedures',
			priority: 'medium'
		});
	}

	// ─── Poor functional capacity (MEDIUM) ──────────────────────
	if (
		data.socialFunctional.estimatedMETs !== null &&
		data.socialFunctional.estimatedMETs < 4
	) {
		flags.push({
			id: 'FLAG-FC-001',
			category: 'Functional Capacity',
			message: `Poor functional capacity (estimated ${data.socialFunctional.estimatedMETs} METs)`,
			priority: 'medium'
		});
	}

	// ─── Cardiomyopathy (MEDIUM) ────────────────────────────────
	if (data.cardiacHistory.cardiomyopathy === 'yes') {
		flags.push({
			id: 'FLAG-CM-001',
			category: 'Cardiac History',
			message: `Cardiomyopathy (${data.cardiacHistory.cardiomyopathyType || 'type not specified'})`,
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
