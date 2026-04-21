import type { AssessmentData, AdditionalFlag } from './types';
import { calculateNIHSS } from './nihss-grader';

/**
 * Detects additional flags that should be highlighted for the stroke team,
 * independent of NIHSS score. These are safety-critical or clinically
 * significant alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	const { nihssScore } = calculateNIHSS(data);

	// ─── Acute onset ─────────────────────────────────────────
	if (data.symptomOnset.symptomProgression === 'sudden') {
		flags.push({
			id: 'FLAG-ONSET-001',
			category: 'Acute Onset',
			message: 'Sudden symptom onset - consistent with acute stroke presentation',
			priority: 'high'
		});
	}

	// ─── Severe NIHSS >15 ────────────────────────────────────
	if (nihssScore > 15) {
		flags.push({
			id: 'FLAG-SEVERE-001',
			category: 'Severe Stroke',
			message: `NIHSS score ${nihssScore} indicates moderate to severe or severe stroke - consider urgent intervention`,
			priority: 'high'
		});
	}

	// ─── LOC impairment ──────────────────────────────────────
	if (data.levelOfConsciousness.loc !== null && data.levelOfConsciousness.loc >= 2) {
		flags.push({
			id: 'FLAG-LOC-001',
			category: 'LOC Impairment',
			message: 'Significant level of consciousness impairment - patient requires close monitoring',
			priority: 'high'
		});
	}

	// ─── Language deficit ────────────────────────────────────
	if (data.languageDysarthria.bestLanguage !== null && data.languageDysarthria.bestLanguage >= 2) {
		flags.push({
			id: 'FLAG-LANGUAGE-001',
			category: 'Language Deficit',
			message: 'Severe aphasia detected - communication support and speech therapy referral recommended',
			priority: 'high'
		});
	}

	// ─── Bilateral motor deficits ────────────────────────────
	const leftMotor = Math.max(
		data.facialPalsy.leftArm ?? 0,
		data.facialPalsy.leftLeg ?? 0
	);
	const rightMotor = Math.max(
		data.facialPalsy.rightArm ?? 0,
		data.facialPalsy.rightLeg ?? 0
	);
	if (leftMotor >= 2 && rightMotor >= 2) {
		flags.push({
			id: 'FLAG-BILATERAL-001',
			category: 'Bilateral Motor Deficit',
			message: 'Bilateral motor deficits detected - consider basilar artery occlusion or brainstem involvement',
			priority: 'high'
		});
	}

	// ─── Within thrombolysis window ──────────────────────────
	if (data.symptomOnset.onsetTime) {
		const onset = new Date(data.symptomOnset.onsetTime);
		const now = new Date();
		const hoursElapsed = (now.getTime() - onset.getTime()) / (1000 * 60 * 60);
		if (hoursElapsed <= 4.5 && hoursElapsed >= 0) {
			flags.push({
				id: 'FLAG-THROMBOLYSIS-001',
				category: 'Thrombolysis Window',
				message: `Symptom onset ${hoursElapsed.toFixed(1)} hours ago - within thrombolysis window (4.5 hours). Evaluate for IV tPA eligibility`,
				priority: 'high'
			});
		}
	}

	// ─── Atrial fibrillation ─────────────────────────────────
	if (data.riskFactors.atrialFibrillation === 'yes') {
		flags.push({
			id: 'FLAG-AFIB-001',
			category: 'Atrial Fibrillation',
			message: 'Known atrial fibrillation - consider cardioembolic stroke aetiology and anticoagulation status',
			priority: 'high'
		});
	}

	// ─── Anticoagulant use ───────────────────────────────────
	if (data.currentMedications.anticoagulants === 'yes') {
		flags.push({
			id: 'FLAG-ANTICOAG-001',
			category: 'Anticoagulant Use',
			message: `Patient on anticoagulants: ${data.currentMedications.anticoagulantDetails || 'details not specified'} - check INR/anti-Xa levels before thrombolysis`,
			priority: 'high'
		});
	}

	// ─── Previous stroke ─────────────────────────────────────
	if (data.riskFactors.previousStroke === 'yes') {
		flags.push({
			id: 'FLAG-PREV-STROKE-001',
			category: 'Previous Stroke',
			message: 'History of previous stroke - compare with prior deficits and imaging',
			priority: 'medium'
		});
	}

	// ─── Hypertension ────────────────────────────────────────
	if (data.riskFactors.hypertension === 'yes') {
		flags.push({
			id: 'FLAG-HTN-001',
			category: 'Hypertension',
			message: 'Known hypertension - monitor blood pressure closely, target per stroke protocol',
			priority: 'medium'
		});
	}

	// ─── Diabetes ────────────────────────────────────────────
	if (data.riskFactors.diabetes === 'yes') {
		flags.push({
			id: 'FLAG-DIABETES-001',
			category: 'Diabetes',
			message: 'Known diabetes - check blood glucose, maintain normoglycaemia',
			priority: 'medium'
		});
	}

	// ─── Antiplatelet use ────────────────────────────────────
	if (data.currentMedications.antiplatelets === 'yes') {
		flags.push({
			id: 'FLAG-ANTIPLATELET-001',
			category: 'Antiplatelet Use',
			message: `Patient on antiplatelets: ${data.currentMedications.antiplateletDetails || 'details not specified'} - note for treatment decisions`,
			priority: 'medium'
		});
	}

	// ─── Drug allergy anaphylaxis ────────────────────────────
	for (const [i, allergy] of data.currentMedications.allergies.entries()) {
		if (allergy.severity === 'anaphylaxis') {
			flags.push({
				id: `FLAG-ALLERGY-ANAPH-${i}`,
				category: 'Allergy',
				message: `ANAPHYLAXIS history: ${allergy.allergen}`,
				priority: 'high'
			});
		}
	}

	if (data.currentMedications.allergies.length > 0) {
		flags.push({
			id: 'FLAG-ALLERGY-001',
			category: 'Allergy',
			message: `${data.currentMedications.allergies.length} allergy/allergies documented`,
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
