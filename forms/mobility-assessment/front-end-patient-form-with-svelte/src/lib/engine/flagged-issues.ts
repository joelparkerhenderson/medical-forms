import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of Tinetti score. These are safety-critical or clinically
 * significant alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── High fall risk (Tinetti 0-18) ──────────────────────
	const bal = data.balanceAssessment;
	const gait = data.gaitAssessment;
	const balanceScores = [
		bal.sittingBalance, bal.risesFromChair, bal.attemptingToRise,
		bal.immediateStandingBalance, bal.standingBalance, bal.nudgedBalance,
		bal.eyesClosed, bal.turning360, bal.sittingDown
	];
	const gaitScores = [
		gait.initiationOfGait, gait.stepLength, gait.stepHeight,
		gait.stepSymmetry, gait.stepContinuity, gait.path,
		gait.trunk, gait.walkingStance
	];
	const totalTinetti = [...balanceScores, ...gaitScores]
		.filter((s): s is number => s !== null)
		.reduce((sum, s) => sum + s, 0);

	if (totalTinetti <= 18) {
		flags.push({
			id: 'FLAG-FALLRISK-001',
			category: 'Fall Risk',
			message: `Tinetti score ${totalTinetti}/28 indicates high fall risk - implement fall prevention protocol`,
			priority: 'high'
		});
	}

	// ─── Recurrent falls ────────────────────────────────────
	if (data.fallHistory.fallsLastYear !== null && data.fallHistory.fallsLastYear >= 2) {
		flags.push({
			id: 'FLAG-RECURRENT-001',
			category: 'Recurrent Falls',
			message: `${data.fallHistory.fallsLastYear} falls in the last year - multifactorial fall risk assessment recommended`,
			priority: 'high'
		});
	}

	// ─── TUG > 14 seconds ───────────────────────────────────
	if (
		data.timedUpAndGo.timeSeconds !== null &&
		data.timedUpAndGo.timeSeconds > 14
	) {
		flags.push({
			id: 'FLAG-TUG-001',
			category: 'TUG Abnormal',
			message: `TUG time ${data.timedUpAndGo.timeSeconds}s exceeds 14s threshold - increased fall risk`,
			priority: 'high'
		});
	}

	// ─── Balance deficits ───────────────────────────────────
	const balanceTotal = balanceScores
		.filter((s): s is number => s !== null)
		.reduce((sum, s) => sum + s, 0);
	if (balanceTotal <= 10 && balanceScores.some((s) => s !== null)) {
		flags.push({
			id: 'FLAG-BALANCE-001',
			category: 'Balance Deficit',
			message: `Balance subscore ${balanceTotal}/16 indicates significant balance impairment`,
			priority: 'medium'
		});
	}

	// ─── Gait abnormalities ─────────────────────────────────
	const gaitTotal = gaitScores
		.filter((s): s is number => s !== null)
		.reduce((sum, s) => sum + s, 0);
	if (gaitTotal <= 8 && gaitScores.some((s) => s !== null)) {
		flags.push({
			id: 'FLAG-GAIT-001',
			category: 'Gait Abnormality',
			message: `Gait subscore ${gaitTotal}/12 indicates gait abnormalities`,
			priority: 'medium'
		});
	}

	// ─── Polypharmacy ───────────────────────────────────────
	if (data.currentMedications.medications.length >= 5) {
		flags.push({
			id: 'FLAG-POLYPHARM-001',
			category: 'Polypharmacy',
			message: `${data.currentMedications.medications.length} medications - polypharmacy increases fall risk, consider medication review`,
			priority: 'medium'
		});
	}

	// ─── Sedating medications ───────────────────────────────
	const sedatingMedClasses = ['benzodiazepine', 'opioid', 'antihistamine', 'antipsychotic', 'sedative', 'hypnotic'];
	const hasSedating = data.currentMedications.fallRiskMedications.some((med) =>
		sedatingMedClasses.some((cls) => med.toLowerCase().includes(cls))
	);
	if (hasSedating || data.currentMedications.fallRiskMedications.length > 0) {
		flags.push({
			id: 'FLAG-SEDATING-001',
			category: 'Sedating Medications',
			message: `Fall-risk medications identified: ${data.currentMedications.fallRiskMedications.join(', ')} - review necessity and consider alternatives`,
			priority: 'medium'
		});
	}

	// ─── Severe fear of falling ─────────────────────────────
	if (data.fallHistory.fearOfFalling === 'severe') {
		flags.push({
			id: 'FLAG-FEAR-001',
			category: 'Fear of Falling',
			message: 'Severe fear of falling reported - may lead to activity restriction and deconditioning',
			priority: 'medium'
		});
	}

	// ─── Injury from falls ──────────────────────────────────
	if (data.fallHistory.injuriesFromFalls && data.fallHistory.injuriesFromFalls.length > 0) {
		flags.push({
			id: 'FLAG-INJURY-001',
			category: 'Fall Injuries',
			message: `Previous injuries from falls: ${data.fallHistory.injuriesFromFalls}`,
			priority: 'medium'
		});
	}

	// ─── Severe ROM limitations ─────────────────────────────
	const romFields = [
		{ name: 'Hip flexion', value: data.rangeOfMotion.hipFlexion },
		{ name: 'Hip extension', value: data.rangeOfMotion.hipExtension },
		{ name: 'Knee flexion', value: data.rangeOfMotion.kneeFlexion },
		{ name: 'Knee extension', value: data.rangeOfMotion.kneeExtension },
		{ name: 'Ankle flexion', value: data.rangeOfMotion.ankleFlexion },
		{ name: 'Ankle extension', value: data.rangeOfMotion.ankleExtension }
	];
	const severeROMs = romFields.filter((f) => f.value === 'severely-limited');
	if (severeROMs.length > 0) {
		flags.push({
			id: 'FLAG-ROM-001',
			category: 'Range of Motion',
			message: `Severely limited ROM: ${severeROMs.map((f) => f.name).join(', ')}`,
			priority: 'medium'
		});
	}

	// ─── No assistive device when needed ────────────────────
	if (
		totalTinetti <= 18 &&
		data.assistiveDevices.currentDevices.length === 0
	) {
		flags.push({
			id: 'FLAG-DEVICE-001',
			category: 'Assistive Device',
			message: 'High fall risk but no assistive device in use - consider prescribing appropriate device',
			priority: 'high'
		});
	}

	// ─── Device fit/condition issues ────────────────────────
	if (data.assistiveDevices.deviceFitAdequate === 'no') {
		flags.push({
			id: 'FLAG-DEVICEFIT-001',
			category: 'Assistive Device',
			message: 'Current assistive device fit is inadequate - reassessment and adjustment needed',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
