import type { AssessmentData, FiredRule } from './types';
import { symptomDefinitions } from './symptom-rules';
import { severityCategory } from './utils';

/**
 * Pure function: calculates the Menstrual Symptom Severity Score from patient data.
 * Returns the total score (0-30), its category label, and fired rules
 * for each symptom that contributed to the score.
 *
 * Symptom Severity Scoring:
 *   0-5  = Minimal
 *   6-10 = Mild
 *   11-20 = Moderate
 *   21-30 = Severe
 */
export function calculateSymptomScore(data: AssessmentData): {
	symptomScore: number;
	symptomCategoryLabel: string;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];
	const gs = data.gynecologicalSymptoms;
	const mh = data.menstrualHistory;

	const scores: (number | null)[] = [
		mh.painSeverity,
		flowHeavinessScore(mh.flowHeaviness),
		gs.pelvicPain,
		gs.abnormalBleeding,
		gs.discharge,
		gs.urinarySymptoms,
		null, // q7 - daily activities (captured below via composite)
		null, // q8 - work/school (captured below via composite)
		null, // q9 - relationships (captured below via composite)
		null  // q10 - emotional wellbeing (captured below via composite)
	];

	// For questions 7-10, we derive scores from the combination of symptoms
	// These are scored based on the overall burden of symptoms
	const symptomBurden = [
		mh.painSeverity ?? 0,
		flowHeavinessScore(mh.flowHeaviness) ?? 0,
		gs.pelvicPain ?? 0,
		gs.abnormalBleeding ?? 0,
		gs.discharge ?? 0,
		gs.urinarySymptoms ?? 0
	];
	const totalPhysical = symptomBurden.reduce((a, b) => a + b, 0);
	const impactScore = Math.min(3, Math.round(totalPhysical / 6));

	// Set impact scores for quality-of-life domains
	scores[6] = impactScore; // daily activities
	scores[7] = impactScore; // work/school
	scores[8] = impactScore; // relationships
	scores[9] = impactScore; // emotional wellbeing

	let symptomScore = 0;

	for (let i = 0; i < scores.length; i++) {
		const score = scores[i];
		if (score !== null && score > 0) {
			const definition = symptomDefinitions[i];
			firedRules.push({
				id: definition.id,
				domain: definition.domain,
				description: definition.text,
				score
			});
			symptomScore += score;
		} else if (score !== null) {
			symptomScore += score;
		}
	}

	const symptomCategoryLabel = severityCategory(symptomScore);

	return { symptomScore, symptomCategoryLabel, firedRules };
}

/** Convert flow heaviness to numeric score. */
function flowHeavinessScore(flow: string): number | null {
	switch (flow) {
		case 'light': return 0;
		case 'moderate': return 1;
		case 'heavy': return 2;
		case 'very-heavy': return 3;
		default: return null;
	}
}
