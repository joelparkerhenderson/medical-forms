import type { AssessmentData, FiredRule, RiskLevel } from './types';
import { riskRules } from './risk-rules';
import { riskCategory } from './utils';

/**
 * Pure function: calculates the cumulative pregnancy risk score from
 * patient assessment data. Returns the total score, risk level, and
 * fired rules for each risk factor that applies.
 *
 * Risk Scoring:
 *   0-2   = Low risk
 *   3-5   = Moderate risk
 *   6-9   = High risk
 *   10+   = Very high risk
 */
export function calculateRisk(data: AssessmentData): {
	riskScore: number;
	riskLevel: RiskLevel;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];
	let riskScore = 0;

	// ─── Obstetric history ────────────────────────────
	if (data.obstetricHistory.previousComplications.preeclampsia === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-OB-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.obstetricHistory.previousComplications.gestationalDiabetes === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-OB-002')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.obstetricHistory.previousComplications.pretermBirth === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-OB-003')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.obstetricHistory.previousComplications.cesareanSection === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-OB-004')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	// ─── Medical history ──────────────────────────────
	if (data.medicalHistory.hypertension === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-MED-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.medicalHistory.diabetes === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-MED-002')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.medicalHistory.autoimmune === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-MED-003')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.medicalHistory.thyroid === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-MED-004')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	// ─── Pregnancy details ────────────────────────────
	if (data.pregnancyDetails.multipleGestation === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-PREG-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (
		data.pregnancyDetails.placentaLocation === 'previa' ||
		data.pregnancyDetails.placentaLocation === 'low-lying'
	) {
		const rule = riskRules.find((r) => r.id === 'RISK-PREG-002')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (
		data.pregnancyDetails.conceptionMethod === 'ivf' ||
		data.pregnancyDetails.conceptionMethod === 'icsi'
	) {
		const rule = riskRules.find((r) => r.id === 'RISK-PREG-003')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	// ─── Vital signs ─────────────────────────────────
	if (
		(data.vitalSigns.bloodPressureSystolic !== null && data.vitalSigns.bloodPressureSystolic >= 140) ||
		(data.vitalSigns.bloodPressureDiastolic !== null && data.vitalSigns.bloodPressureDiastolic >= 90)
	) {
		const rule = riskRules.find((r) => r.id === 'RISK-VITAL-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.vitalSigns.bmi !== null && data.vitalSigns.bmi >= 30) {
		const rule = riskRules.find((r) => r.id === 'RISK-VITAL-002')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (
		data.vitalSigns.fetalHeartRate !== null &&
		(data.vitalSigns.fetalHeartRate < 110 || data.vitalSigns.fetalHeartRate > 160)
	) {
		const rule = riskRules.find((r) => r.id === 'RISK-VITAL-003')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	// ─── Laboratory results ──────────────────────────
	if (data.laboratoryResults.rhFactor === 'negative') {
		const rule = riskRules.find((r) => r.id === 'RISK-LAB-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.laboratoryResults.hemoglobin !== null && data.laboratoryResults.hemoglobin < 11) {
		const rule = riskRules.find((r) => r.id === 'RISK-LAB-002')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.laboratoryResults.glucose !== null && data.laboratoryResults.glucose > 7.8) {
		const rule = riskRules.find((r) => r.id === 'RISK-LAB-003')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.laboratoryResults.gbs === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-LAB-004')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	// ─── Lifestyle ───────────────────────────────────
	if (data.lifestyleNutrition.smoking === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-LIFE-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.lifestyleNutrition.alcohol === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-LIFE-002')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.lifestyleNutrition.drugs === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-LIFE-003')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.lifestyleNutrition.folicAcid === 'no') {
		const rule = riskRules.find((r) => r.id === 'RISK-LIFE-004')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	// ─── Mental health ───────────────────────────────
	if (data.mentalHealthScreening.edinburghScore !== null && data.mentalHealthScreening.edinburghScore >= 13) {
		const rule = riskRules.find((r) => r.id === 'RISK-MH-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.mentalHealthScreening.anxietyLevel === 'severe') {
		const rule = riskRules.find((r) => r.id === 'RISK-MH-002')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.mentalHealthScreening.domesticViolenceScreen === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-MH-003')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	// ─── Current symptoms ────────────────────────────
	if (data.currentSymptoms.bleeding === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-SX-001')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.currentSymptoms.reducedFetalMovement === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-SX-002')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.currentSymptoms.visionChanges === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-SX-003')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	if (data.currentSymptoms.headache === 'yes') {
		const rule = riskRules.find((r) => r.id === 'RISK-SX-004')!;
		firedRules.push({ id: rule.id, category: rule.category, description: rule.description, weight: rule.weight });
		riskScore += rule.weight;
	}

	const riskLevel = riskCategory(riskScore);

	return { riskScore, riskLevel, firedRules };
}
