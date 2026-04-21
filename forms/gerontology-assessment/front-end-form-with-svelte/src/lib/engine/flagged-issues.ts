import type { AssessmentData, AdditionalFlag } from './types';
import { calculateAge } from './utils';

/**
 * Detects additional flags that should be highlighted for the geriatrician,
 * independent of CFS score. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Falls risk ─────────────────────────────────────────
	if (data.mobilityFalls.fallHistory === 'yes') {
		const fallCount = data.mobilityFalls.fallsLastYear;
		flags.push({
			id: 'FLAG-FALLS-001',
			category: 'Falls Risk',
			message: `Fall history reported (${fallCount ?? '?'} falls in past year)`,
			priority: 'high'
		});
	}

	if (data.mobilityFalls.fearOfFalling === 'yes') {
		flags.push({
			id: 'FLAG-FALLS-002',
			category: 'Falls Risk',
			message: 'Fear of falling reported - may limit mobility and increase fall risk',
			priority: 'medium'
		});
	}

	if (data.mobilityFalls.timedUpAndGo !== null && data.mobilityFalls.timedUpAndGo >= 14) {
		flags.push({
			id: 'FLAG-FALLS-003',
			category: 'Falls Risk',
			message: `Timed Up and Go ${data.mobilityFalls.timedUpAndGo}s (≥14s = high fall risk)`,
			priority: 'high'
		});
	}

	// ─── Delirium risk ──────────────────────────────────────
	if (data.cognitiveScreen.deliriumRisk === 'yes') {
		flags.push({
			id: 'FLAG-DELIRIUM-001',
			category: 'Delirium',
			message: 'Delirium risk identified - implement prevention protocol',
			priority: 'high'
		});
	}

	// ─── Polypharmacy ───────────────────────────────────────
	if (
		data.polypharmacyReview.numberOfMedications !== null &&
		data.polypharmacyReview.numberOfMedications >= 5
	) {
		const count = data.polypharmacyReview.numberOfMedications;
		flags.push({
			id: 'FLAG-POLY-001',
			category: 'Polypharmacy',
			message: `${count} medications - polypharmacy review recommended`,
			priority: count >= 10 ? 'high' : 'medium'
		});
	}

	if (data.polypharmacyReview.beersCriteriaFlags === 'yes') {
		flags.push({
			id: 'FLAG-POLY-002',
			category: 'Polypharmacy',
			message: `Beers criteria flag: ${data.polypharmacyReview.beersCriteriaDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	if (data.polypharmacyReview.highRiskMedications === 'yes') {
		flags.push({
			id: 'FLAG-POLY-003',
			category: 'Polypharmacy',
			message: `High-risk medications: ${data.polypharmacyReview.highRiskMedicationDetails || 'details not specified'}`,
			priority: 'high'
		});
	}

	// ─── Malnutrition ───────────────────────────────────────
	if (data.nutrition.mnaScore !== null && data.nutrition.mnaScore < 17) {
		flags.push({
			id: 'FLAG-NUTR-001',
			category: 'Nutrition',
			message: `MNA score ${data.nutrition.mnaScore} - malnutrition (score <17)`,
			priority: 'high'
		});
	} else if (data.nutrition.mnaScore !== null && data.nutrition.mnaScore < 24) {
		flags.push({
			id: 'FLAG-NUTR-002',
			category: 'Nutrition',
			message: `MNA score ${data.nutrition.mnaScore} - at risk of malnutrition (score 17-23.5)`,
			priority: 'medium'
		});
	}

	if (
		data.nutrition.weightChangeLastSixMonths === 'yes' &&
		data.nutrition.weightChangeDirection === 'loss' &&
		data.nutrition.weightChangeKg !== null &&
		data.nutrition.weightChangeKg >= 5
	) {
		flags.push({
			id: 'FLAG-NUTR-003',
			category: 'Nutrition',
			message: `Significant weight loss: ${data.nutrition.weightChangeKg}kg in 6 months`,
			priority: 'high'
		});
	}

	if (data.nutrition.swallowingDifficulties === 'yes') {
		flags.push({
			id: 'FLAG-NUTR-004',
			category: 'Nutrition',
			message: 'Swallowing difficulties - assess aspiration risk, refer to SALT',
			priority: 'high'
		});
	}

	// ─── Severe frailty ─────────────────────────────────────
	if (data.cognitiveScreen.cognitiveStatus === 'severe-impairment') {
		flags.push({
			id: 'FLAG-FRAILTY-001',
			category: 'Frailty',
			message: 'Severe cognitive impairment - consider capacity assessment',
			priority: 'high'
		});
	}

	if (data.mobilityFalls.gaitAssessment === 'unable') {
		flags.push({
			id: 'FLAG-FRAILTY-002',
			category: 'Frailty',
			message: 'Unable to walk - assess for pressure injury risk and VTE prophylaxis',
			priority: 'high'
		});
	}

	// ─── Pressure injury risk ───────────────────────────────
	if (data.continenceSkin.bradenScale !== null && data.continenceSkin.bradenScale <= 12) {
		flags.push({
			id: 'FLAG-SKIN-001',
			category: 'Skin Integrity',
			message: `Braden scale ${data.continenceSkin.bradenScale} - high pressure injury risk`,
			priority: 'medium'
		});
	}

	if (data.continenceSkin.pressureInjuryPresent === 'yes') {
		flags.push({
			id: 'FLAG-SKIN-002',
			category: 'Skin Integrity',
			message: `Pressure injury present (Stage ${data.continenceSkin.pressureInjuryStage || '?'})`,
			priority: data.continenceSkin.pressureInjuryStage === '3' ||
				data.continenceSkin.pressureInjuryStage === '4'
				? 'high'
				: 'medium'
		});
	}

	// ─── Depression ─────────────────────────────────────────
	if (
		data.psychosocial.depressionScreen === 'moderate' ||
		data.psychosocial.depressionScreen === 'severe'
	) {
		flags.push({
			id: 'FLAG-PSYCH-001',
			category: 'Psychosocial',
			message: `Depression screen: ${data.psychosocial.depressionScreen} - further assessment recommended`,
			priority: 'medium'
		});
	}

	if (data.psychosocial.socialIsolation === 'severe') {
		flags.push({
			id: 'FLAG-PSYCH-002',
			category: 'Psychosocial',
			message: 'Severe social isolation - consider social services referral',
			priority: 'medium'
		});
	}

	// ─── Advance directives ─────────────────────────────────
	if (data.psychosocial.advanceDirectives === 'yes') {
		flags.push({
			id: 'FLAG-PSYCH-003',
			category: 'Psychosocial',
			message: `Advance directives in place: ${data.psychosocial.advanceDirectiveDetails || 'review documentation'}`,
			priority: 'low'
		});
	}

	// ─── Continence ─────────────────────────────────────────
	if (data.continenceSkin.urinaryIncontinenceFrequency === 'continuous') {
		flags.push({
			id: 'FLAG-CONT-001',
			category: 'Continence',
			message: 'Continuous urinary incontinence - assess underlying cause',
			priority: 'medium'
		});
	}

	// ─── Age-related ────────────────────────────────────────
	const age = calculateAge(data.demographics.dateOfBirth);
	if (age !== null && age >= 90) {
		flags.push({
			id: 'FLAG-AGE-001',
			category: 'Demographics',
			message: `Age ${age} years - heightened vulnerability, frailty assessment essential`,
			priority: 'medium'
		});
	}

	// ─── Medication adherence ───────────────────────────────
	if (data.polypharmacyReview.medicationAdherence === 'poor') {
		flags.push({
			id: 'FLAG-POLY-004',
			category: 'Polypharmacy',
			message: 'Poor medication adherence - review regimen complexity',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
