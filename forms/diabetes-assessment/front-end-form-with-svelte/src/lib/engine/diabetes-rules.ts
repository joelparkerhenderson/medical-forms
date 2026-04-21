import type { AssessmentData, FiredRule } from './types';
import { hba1cMmolMol } from './utils';

/** A declarative diabetes control rule. */
interface DiabetesRule {
	id: string;
	category: string;
	description: string;
	concernLevel: string;
	evaluate: (data: AssessmentData) => boolean;
}

/** All diabetes rules, ordered by concern level (high -> medium -> low). */
export const allRules: DiabetesRule[] = [
	// ─── HIGH CONCERN ───────────────────────────────────────
	{
		id: 'DM-001',
		category: 'Glycaemic Control',
		description: 'HbA1c >= 86 mmol/mol (>= 10%) - very poor glycaemic control',
		concernLevel: 'high',
		evaluate: (d) => {
			const v = hba1cMmolMol(d);
			return v !== null && v >= 86;
		}
	},
	{
		id: 'DM-002',
		category: 'Hypoglycaemia',
		description: 'Severe hypoglycaemia reported',
		concernLevel: 'high',
		evaluate: (d) => d.glycaemicControl.severeHypoglycaemia === 'yes'
	},
	{
		id: 'DM-003',
		category: 'Foot',
		description: 'Active foot ulcer present',
		concernLevel: 'high',
		evaluate: (d) => d.footAssessment.ulcerPresent === 'yes'
	},
	{
		id: 'DM-004',
		category: 'Eye',
		description: 'Proliferative retinopathy detected',
		concernLevel: 'high',
		evaluate: (d) => d.complicationsScreening.retinopathyStatus === 'proliferative'
	},
	{
		id: 'DM-005',
		category: 'Renal',
		description: 'eGFR < 30 - severe renal impairment',
		concernLevel: 'high',
		evaluate: (d) => d.complicationsScreening.egfr !== null && d.complicationsScreening.egfr < 30
	},
	// ─── MEDIUM CONCERN ─────────────────────────────────────
	{
		id: 'DM-006',
		category: 'Glycaemic Control',
		description: 'HbA1c 64-85 mmol/mol (8-9.9%) - suboptimal glycaemic control',
		concernLevel: 'medium',
		evaluate: (d) => {
			const v = hba1cMmolMol(d);
			return v !== null && v >= 64 && v < 86;
		}
	},
	{
		id: 'DM-007',
		category: 'Hypoglycaemia',
		description: 'Recurrent hypoglycaemia reported',
		concernLevel: 'medium',
		evaluate: (d) =>
			d.glycaemicControl.hypoglycaemiaFrequency === 'weekly' ||
			d.glycaemicControl.hypoglycaemiaFrequency === 'daily'
	},
	{
		id: 'DM-008',
		category: 'Eye',
		description: 'Background retinopathy detected',
		concernLevel: 'medium',
		evaluate: (d) => d.complicationsScreening.retinopathyStatus === 'background'
	},
	{
		id: 'DM-009',
		category: 'Renal',
		description: 'eGFR 30-59 - moderate renal impairment',
		concernLevel: 'medium',
		evaluate: (d) =>
			d.complicationsScreening.egfr !== null &&
			d.complicationsScreening.egfr >= 30 &&
			d.complicationsScreening.egfr < 60
	},
	{
		id: 'DM-010',
		category: 'Renal',
		description: 'Microalbuminuria detected (elevated urine ACR)',
		concernLevel: 'medium',
		evaluate: (d) => d.complicationsScreening.urineAcr !== null && d.complicationsScreening.urineAcr > 3
	},
	{
		id: 'DM-011',
		category: 'Neuropathy',
		description: 'Neuropathy symptoms reported',
		concernLevel: 'medium',
		evaluate: (d) => d.complicationsScreening.neuropathySymptoms === 'yes'
	},
	{
		id: 'DM-012',
		category: 'Medication',
		description: 'Poor medication adherence (1-2 out of 5)',
		concernLevel: 'medium',
		evaluate: (d) =>
			d.medications.medicationAdherence !== null &&
			d.medications.medicationAdherence >= 1 &&
			d.medications.medicationAdherence <= 2
	},
	{
		id: 'DM-013',
		category: 'Self-Care',
		description: 'BMI >= 35 - obesity class II or above',
		concernLevel: 'medium',
		evaluate: (d) => d.selfCareLifestyle.bmi !== null && d.selfCareLifestyle.bmi >= 35
	},
	{
		id: 'DM-014',
		category: 'Self-Care',
		description: 'Poor diet adherence (1-2 out of 5)',
		concernLevel: 'medium',
		evaluate: (d) =>
			d.selfCareLifestyle.dietAdherence !== null &&
			d.selfCareLifestyle.dietAdherence >= 1 &&
			d.selfCareLifestyle.dietAdherence <= 2
	},
	{
		id: 'DM-015',
		category: 'Psychological',
		description: 'High diabetes distress (4-5 out of 5)',
		concernLevel: 'medium',
		evaluate: (d) =>
			d.psychologicalWellbeing.diabetesDistress !== null &&
			d.psychologicalWellbeing.diabetesDistress >= 4 &&
			d.psychologicalWellbeing.diabetesDistress <= 5
	},
	// ─── LOW CONCERN (positive indicators) ──────────────────
	{
		id: 'DM-016',
		category: 'Glycaemic Control',
		description: 'HbA1c at target (<= 53 mmol/mol / <= 7%)',
		concernLevel: 'low',
		evaluate: (d) => {
			const v = hba1cMmolMol(d);
			return v !== null && v <= 53;
		}
	},
	{
		id: 'DM-017',
		category: 'Complications',
		description: 'No complications detected across all screening domains',
		concernLevel: 'low',
		evaluate: (d) =>
			(d.complicationsScreening.retinopathyStatus === '' ||
				d.complicationsScreening.retinopathyStatus === 'none') &&
			d.complicationsScreening.neuropathySymptoms !== 'yes' &&
			(d.complicationsScreening.egfr === null || d.complicationsScreening.egfr >= 60) &&
			d.footAssessment.ulcerPresent !== 'yes' &&
			d.cardiovascularRisk.previousCvdEvent !== 'yes'
	},
	{
		id: 'DM-018',
		category: 'Self-Care',
		description: 'Good self-care adherence (diet >= 4/5)',
		concernLevel: 'low',
		evaluate: (d) =>
			d.selfCareLifestyle.dietAdherence !== null &&
			d.selfCareLifestyle.dietAdherence >= 4 &&
			d.selfCareLifestyle.dietAdherence <= 5
	},
	{
		id: 'DM-019',
		category: 'Self-Care',
		description: 'Physically active (regular or very active)',
		concernLevel: 'low',
		evaluate: (d) =>
			d.selfCareLifestyle.physicalActivity === 'regular' ||
			d.selfCareLifestyle.physicalActivity === 'veryActive'
	},
	{
		id: 'DM-020',
		category: 'Psychological',
		description: 'Good psychological wellbeing (low distress, good coping)',
		concernLevel: 'low',
		evaluate: (d) =>
			d.psychologicalWellbeing.diabetesDistress !== null &&
			d.psychologicalWellbeing.diabetesDistress >= 1 &&
			d.psychologicalWellbeing.diabetesDistress <= 2 &&
			d.psychologicalWellbeing.copingAbility !== null &&
			d.psychologicalWellbeing.copingAbility >= 4 &&
			d.psychologicalWellbeing.copingAbility <= 5
	}
];

/** Evaluate all rules and return the list of fired rules. */
export function evaluateRules(data: AssessmentData): FiredRule[] {
	const firedRules: FiredRule[] = [];
	for (const rule of allRules) {
		if (rule.evaluate(data)) {
			firedRules.push({
				id: rule.id,
				category: rule.category,
				description: rule.description,
				concernLevel: rule.concernLevel
			});
		}
	}
	return firedRules;
}
