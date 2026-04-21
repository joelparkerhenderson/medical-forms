import type { AssessmentData, AdditionalFlag } from './types';
import { calculateAge } from './utils';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of MEC classification. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Previous DVT/PE (HIGH) ────────────────────────────────
	if (data.thromboembolismRisk.previousDVT === 'yes') {
		flags.push({
			id: 'FLAG-DVT-001',
			category: 'Thromboembolism',
			message: `Previous DVT: ${data.thromboembolismRisk.dvtDetails || 'details not specified'} - COC CONTRAINDICATED`,
			priority: 'high'
		});
	}

	if (data.thromboembolismRisk.previousPE === 'yes') {
		flags.push({
			id: 'FLAG-PE-001',
			category: 'Thromboembolism',
			message: `Previous PE: ${data.thromboembolismRisk.peDetails || 'details not specified'} - COC CONTRAINDICATED`,
			priority: 'high'
		});
	}

	// ─── Known thrombophilia (HIGH) ────────────────────────────
	if (data.thromboembolismRisk.knownThrombophilia === 'yes') {
		flags.push({
			id: 'FLAG-THROMBO-001',
			category: 'Thromboembolism',
			message: `Known thrombophilia (${data.thromboembolismRisk.thrombophiliaType || 'type not specified'}) - COC CONTRAINDICATED`,
			priority: 'high'
		});
	}

	// ─── Migraine with aura (HIGH) ─────────────────────────────
	if (data.medicalHistory.migraine === 'yes' && data.medicalHistory.migraineWithAura === 'yes') {
		flags.push({
			id: 'FLAG-MIGRAINE-001',
			category: 'Migraine',
			message: 'Migraine with aura - COC CONTRAINDICATED (UK MEC 4)',
			priority: 'high'
		});
	}

	// ─── Ischaemic heart disease (HIGH) ────────────────────────
	if (data.cardiovascularRisk.ischaemicHeartDisease === 'yes') {
		flags.push({
			id: 'FLAG-IHD-001',
			category: 'Cardiovascular',
			message: 'Ischaemic heart disease - COC CONTRAINDICATED',
			priority: 'high'
		});
	}

	// ─── History of stroke (HIGH) ──────────────────────────────
	if (data.cardiovascularRisk.strokeHistory === 'yes') {
		flags.push({
			id: 'FLAG-STROKE-001',
			category: 'Cardiovascular',
			message: 'History of stroke - COC CONTRAINDICATED',
			priority: 'high'
		});
	}

	// ─── Current breast cancer (HIGH) ──────────────────────────
	if (data.medicalHistory.breastCancer === 'current') {
		flags.push({
			id: 'FLAG-BRCA-001',
			category: 'Breast Cancer',
			message: 'Current breast cancer - ALL HORMONAL METHODS CONTRAINDICATED',
			priority: 'high'
		});
	}

	// ─── Severe hypertension (HIGH) ────────────────────────────
	if (
		(data.cardiovascularRisk.systolicBP !== null && data.cardiovascularRisk.systolicBP >= 160) ||
		(data.cardiovascularRisk.diastolicBP !== null && data.cardiovascularRisk.diastolicBP >= 100)
	) {
		flags.push({
			id: 'FLAG-BP-001',
			category: 'Cardiovascular',
			message: `Severe hypertension (${data.cardiovascularRisk.systolicBP ?? '?'}/${data.cardiovascularRisk.diastolicBP ?? '?'} mmHg) - COC CONTRAINDICATED`,
			priority: 'high'
		});
	}

	// ─── SLE with antiphospholipid (HIGH) ──────────────────────
	if (data.medicalHistory.sle === 'yes' && data.medicalHistory.sleAntiphospholipid === 'yes') {
		flags.push({
			id: 'FLAG-SLE-001',
			category: 'SLE',
			message: 'SLE with antiphospholipid antibodies - COC CONTRAINDICATED',
			priority: 'high'
		});
	}

	// ─── Age >= 35 heavy smoker (HIGH) ─────────────────────────
	const age = calculateAge(data.demographics.dateOfBirth);
	if (
		age !== null &&
		age >= 35 &&
		data.lifestyleAssessment.smoking === 'current' &&
		data.lifestyleAssessment.cigarettesPerDay !== null &&
		data.lifestyleAssessment.cigarettesPerDay >= 15
	) {
		flags.push({
			id: 'FLAG-SMOKE-001',
			category: 'Smoking',
			message: `Age ${age}, heavy smoker (${data.lifestyleAssessment.cigarettesPerDay} cigs/day) - COC CONTRAINDICATED`,
			priority: 'high'
		});
	}

	// ─── Breastfeeding < 6 weeks (HIGH) ────────────────────────
	if (
		data.contraceptivePreferences.breastfeeding === 'yes' &&
		data.contraceptivePreferences.postpartumWeeks !== null &&
		data.contraceptivePreferences.postpartumWeeks < 6
	) {
		flags.push({
			id: 'FLAG-BF-001',
			category: 'Breastfeeding',
			message: `Breastfeeding ${data.contraceptivePreferences.postpartumWeeks} weeks postpartum - COC CONTRAINDICATED`,
			priority: 'high'
		});
	}

	// ─── Enzyme-inducing drugs (MEDIUM) ────────────────────────
	if (data.currentMedications.enzymeInducingDrugs === 'yes') {
		flags.push({
			id: 'FLAG-ENZYME-001',
			category: 'Medications',
			message: `On enzyme-inducing drugs: ${data.currentMedications.enzymeInducingDetails || 'details not specified'} - reduces COC/POP efficacy`,
			priority: 'medium'
		});
	}

	// ─── Herbal remedies (MEDIUM) ──────────────────────────────
	if (data.currentMedications.herbalRemedies === 'yes') {
		flags.push({
			id: 'FLAG-HERBAL-001',
			category: 'Medications',
			message: `Herbal remedies: ${data.currentMedications.herbalDetails || 'details not specified'} - may reduce COC efficacy`,
			priority: 'medium'
		});
	}

	// ─── Drug allergies (MEDIUM) ───────────────────────────────
	if (data.currentMedications.drugAllergies === 'yes') {
		flags.push({
			id: 'FLAG-ALLERGY-001',
			category: 'Allergy',
			message: `Drug allergies: ${data.currentMedications.drugAllergyDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Postcoital bleeding (MEDIUM) ──────────────────────────
	if (data.menstrualHistory.postcoitalBleeding === 'yes') {
		flags.push({
			id: 'FLAG-PCB-001',
			category: 'Menstrual',
			message: 'Postcoital bleeding reported - cervical screening and STI screen recommended',
			priority: 'medium'
		});
	}

	// ─── Current STI (MEDIUM) ──────────────────────────────────
	if (data.medicalHistory.sti === 'yes') {
		flags.push({
			id: 'FLAG-STI-001',
			category: 'Sexual Health',
			message: `Current/recent STI: ${data.medicalHistory.stiDetails || 'details not specified'} - consider IUD/IUS timing`,
			priority: 'medium'
		});
	}

	// ─── BMI >= 35 (MEDIUM) ────────────────────────────────────
	if (data.demographics.bmi !== null && data.demographics.bmi >= 35) {
		flags.push({
			id: 'FLAG-BMI-001',
			category: 'BMI',
			message: `BMI ${data.demographics.bmi} - COC use requires careful consideration`,
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
