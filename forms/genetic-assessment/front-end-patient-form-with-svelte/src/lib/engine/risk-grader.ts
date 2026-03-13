import type { AssessmentData, FiredRule, RiskLevel } from './types';
import { riskRules } from './risk-rules';
import { riskCategory } from './utils';

/**
 * Pure function: calculates the genetic risk level from patient assessment data.
 * Returns the total risk score, its risk level, and fired rules
 * for each factor that contributed to the score.
 *
 * Risk Stratification:
 *   0-2  = Low Risk (routine follow-up)
 *   3-5  = Moderate Risk (genetic counseling recommended)
 *   6+   = High Risk (urgent genetic counseling referral)
 */
export function calculateRisk(data: AssessmentData): {
	riskScore: number;
	riskLevel: RiskLevel;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];
	let riskScore = 0;

	// ─── Personal Medical History ──────────────────────────
	if (data.personalMedicalHistory.birthDefects === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-BIRTH-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.personalMedicalHistory.developmentalDelay === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-DELAY-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.personalMedicalHistory.intellectualDisability === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-INTEL-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.personalMedicalHistory.multipleAnomalies === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-ANOM-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.personalMedicalHistory.chromosomalCondition === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-CHROMO-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.personalMedicalHistory.knownGeneticCondition === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-GENETIC-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	// ─── Cancer History ─────────────────────────────────────
	if (data.cancerHistory.personalCancerHistory === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-CANCER-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;

		if (data.cancerHistory.ageAtDiagnosis !== null && data.cancerHistory.ageAtDiagnosis < 50) {
			const earlyRule = riskRules.find((r) => r.id === 'RISK-CANCER-002')!;
			firedRules.push({ id: earlyRule.id, category: earlyRule.category, description: earlyRule.description, weight: earlyRule.weight });
			riskScore += earlyRule.weight;
		}
	}

	if (data.cancerHistory.multiplePrimaryCancers === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-CANCER-003')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	// ─── Family Pedigree ────────────────────────────────────
	const familyMembers = [
		data.familyPedigree.maternalGrandmother,
		data.familyPedigree.maternalGrandfather,
		data.familyPedigree.paternalGrandmother,
		data.familyPedigree.paternalGrandfather,
		data.familyPedigree.mother,
		data.familyPedigree.father
	];

	const familyCancerCount = familyMembers.filter((m) => m.cancers.trim() !== '').length;
	if (familyCancerCount >= 2) {
		const rule = riskRules.find((r) => r.id === 'RISK-FAMILY-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	const familyDeceased = familyMembers.filter((m) => m.deceased === 'yes' && m.conditions.trim() !== '').length;
	if (familyDeceased > 0) {
		const rule = riskRules.find((r) => r.id === 'RISK-FAMILY-002')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	// ─── Cardiovascular Genetics ────────────────────────────
	if (data.cardiovascularGenetics.familialHypercholesterolemia === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-CVD-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.cardiovascularGenetics.cardiomyopathy === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-CVD-002')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.cardiovascularGenetics.suddenCardiacDeath === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-CVD-003')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	// ─── Neurogenetics ──────────────────────────────────────
	if (data.neurogenetics.huntington === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-NEURO-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.neurogenetics.alzheimersEarly === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-NEURO-002')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.neurogenetics.muscularDystrophy === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-NEURO-003')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	// ─── Reproductive Genetics ──────────────────────────────
	if (data.reproductiveGenetics.recurrentMiscarriages === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-REPRO-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.reproductiveGenetics.previousAffectedChild === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-REPRO-002')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	// ─── Consanguinity ──────────────────────────────────────
	if (data.reproductiveGenetics.consanguinity === 'yes' || data.ethnicBackground.consanguinity === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-CONSANG-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	// ─── Ethnic Background ──────────────────────────────────
	if (data.ethnicBackground.ashkenaziJewish === 'yes') {
		// Only flag if there are relevant conditions (cancer, carrier status, etc.)
		const hasRelevantConditions =
			data.cancerHistory.personalCancerHistory === 'yes' ||
			data.reproductiveGenetics.carrierStatus === 'yes' ||
			familyCancerCount > 0;
		if (hasRelevantConditions) {
			const rule = riskRules.find((r) => r.id === 'RISK-ETHNIC-001')!;
			firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
			riskScore += rule.weight;
		}
	}

	// ─── Genetic Testing History ────────────────────────────
	if (data.geneticTestingHistory.variantsOfUncertainSignificance === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-VUS-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.reproductiveGenetics.carrierStatus === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-CARRIER-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	const riskLevel = riskCategory(riskScore);

	return { riskScore, riskLevel, firedRules };
}
