import type { AssessmentData, AdditionalFlag } from './types';
import { hba1cMmolMol } from './utils';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of the control score. These are actionable alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── FLAG-HBA1C-001: HbA1c critically elevated ──────────
	const hba1c = hba1cMmolMol(data);
	if (hba1c !== null && hba1c >= 97) {
		flags.push({
			id: 'FLAG-HBA1C-001',
			category: 'Glycaemic Control',
			message:
				'HbA1c critically elevated (>= 97 mmol/mol / >= 11%) - urgent review required',
			priority: 'high'
		});
	}

	// ─── FLAG-HBA1C-002: HbA1c above target ─────────────────
	if (
		data.glycaemicControl.hba1cValue !== null &&
		data.glycaemicControl.hba1cTarget !== null &&
		data.glycaemicControl.hba1cValue > data.glycaemicControl.hba1cTarget &&
		data.glycaemicControl.hba1cUnit !== ''
	) {
		flags.push({
			id: 'FLAG-HBA1C-002',
			category: 'Glycaemic Control',
			message: 'HbA1c above agreed target without treatment intensification',
			priority: 'medium'
		});
	}

	// ─── FLAG-HYPO-001: Severe hypoglycaemia ─────────────────
	if (data.glycaemicControl.severeHypoglycaemia === 'yes') {
		flags.push({
			id: 'FLAG-HYPO-001',
			category: 'Hypoglycaemia',
			message:
				'Severe hypoglycaemia reported - review insulin/sulfonylurea dosing',
			priority: 'high'
		});
	}

	// ─── FLAG-HYPO-002: Hypoglycaemia unawareness ────────────
	if (
		data.glycaemicControl.hypoglycaemiaFrequency === 'daily' &&
		data.glycaemicControl.severeHypoglycaemia === 'yes'
	) {
		flags.push({
			id: 'FLAG-HYPO-002',
			category: 'Hypoglycaemia',
			message:
				'Possible hypoglycaemia unawareness - consider specialist referral',
			priority: 'high'
		});
	}

	// ─── FLAG-FOOT-001: Active foot ulcer ────────────────────
	if (data.footAssessment.ulcerPresent === 'yes') {
		flags.push({
			id: 'FLAG-FOOT-001',
			category: 'Foot',
			message: 'Active foot ulcer - urgent podiatry referral required',
			priority: 'high'
		});
	}

	// ─── FLAG-FOOT-002: High-risk foot ───────────────────────
	if (data.footAssessment.footRiskCategory === 'high') {
		flags.push({
			id: 'FLAG-FOOT-002',
			category: 'Foot',
			message:
				'High-risk foot category - ensure annual specialist foot screening',
			priority: 'medium'
		});
	}

	// ─── FLAG-EYE-001: Proliferative retinopathy ─────────────
	if (data.complicationsScreening.retinopathyStatus === 'proliferative') {
		flags.push({
			id: 'FLAG-EYE-001',
			category: 'Eye',
			message: 'Proliferative retinopathy - urgent ophthalmology referral',
			priority: 'high'
		});
	}

	// ─── FLAG-EYE-002: Overdue eye screening ─────────────────
	if (data.complicationsScreening.lastEyeScreening === '') {
		flags.push({
			id: 'FLAG-EYE-002',
			category: 'Eye',
			message: 'No eye screening date recorded - may be overdue',
			priority: 'medium'
		});
	}

	// ─── FLAG-RENAL-001: eGFR critically low ─────────────────
	if (data.complicationsScreening.egfr !== null && data.complicationsScreening.egfr < 30) {
		flags.push({
			id: 'FLAG-RENAL-001',
			category: 'Renal',
			message:
				'eGFR < 30 - consider nephrology referral and medication review',
			priority: 'high'
		});
	}

	// ─── FLAG-RENAL-002: Macroalbuminuria ────────────────────
	if (data.complicationsScreening.urineAcr !== null && data.complicationsScreening.urineAcr > 30) {
		flags.push({
			id: 'FLAG-RENAL-002',
			category: 'Renal',
			message:
				'Macroalbuminuria detected (ACR > 30) - optimise renoprotective therapy',
			priority: 'high'
		});
	}

	// ─── FLAG-CVD-001: Previous CVD without optimal prevention
	if (
		data.cardiovascularRisk.previousCvdEvent === 'yes' &&
		(data.cardiovascularRisk.onStatin !== 'yes' ||
			data.cardiovascularRisk.onAntihypertensive !== 'yes')
	) {
		flags.push({
			id: 'FLAG-CVD-001',
			category: 'Cardiovascular',
			message:
				'Previous CVD event without optimal secondary prevention (statin/antihypertensive)',
			priority: 'high'
		});
	}

	// ─── FLAG-PSYCH-001: Severe distress/depression ──────────
	if (
		data.psychologicalWellbeing.diabetesDistress === 5 ||
		(data.psychologicalWellbeing.depressionScreening !== null &&
			data.psychologicalWellbeing.depressionScreening >= 8 &&
			data.psychologicalWellbeing.depressionScreening <= 10)
	) {
		flags.push({
			id: 'FLAG-PSYCH-001',
			category: 'Psychological',
			message:
				'Severe diabetes distress or depression - consider psychological support referral',
			priority: 'high'
		});
	}

	// ─── FLAG-MED-001: Insulin without hypo education ────────
	if (
		data.medications.insulin === 'yes' &&
		data.glycaemicControl.hypoglycaemiaFrequency === ''
	) {
		flags.push({
			id: 'FLAG-MED-001',
			category: 'Medication',
			message:
				'On insulin without documented hypoglycaemia assessment - review education',
			priority: 'medium'
		});
	}

	// ─── FLAG-SELF-001: Poor self-care across domains ────────
	const poorDiet =
		data.selfCareLifestyle.dietAdherence !== null &&
		data.selfCareLifestyle.dietAdherence >= 1 &&
		data.selfCareLifestyle.dietAdherence <= 2;
	const sedentary =
		data.selfCareLifestyle.physicalActivity === 'sedentary' ||
		data.selfCareLifestyle.physicalActivity === 'minimal';
	const poorAdherence =
		data.medications.medicationAdherence !== null &&
		data.medications.medicationAdherence >= 1 &&
		data.medications.medicationAdherence <= 2;
	const poorDomains = [poorDiet, sedentary, poorAdherence].filter(Boolean).length;
	if (poorDomains >= 2) {
		flags.push({
			id: 'FLAG-SELF-001',
			category: 'Self-Care',
			message:
				'Poor self-care across multiple domains - consider structured education programme',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
