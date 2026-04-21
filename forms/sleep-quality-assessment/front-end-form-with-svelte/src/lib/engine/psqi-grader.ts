import type { AssessmentData, FiredRule } from './types';
import { psqiComponents, frequencyToScore } from './psqi-rules';
import { psqiCategory, sleepEfficiencyCalc } from './utils';

/**
 * Pure function: calculates the PSQI Global Score from patient data.
 * Returns the total score (0-21), its category label, and fired rules
 * for each component that contributed to the score.
 *
 * PSQI Scoring (7 components, each 0-3):
 *   0-5   = Good sleep quality
 *   6-10  = Poor sleep quality
 *   11-15 = Sleep disorder likely
 *   16-21 = Severe sleep disturbance
 */
export function calculatePSQI(data: AssessmentData): {
	psqiScore: number;
	psqiCategoryLabel: string;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];

	// ─── Component 1: Subjective sleep quality ──────────
	// Based on sleep environment rating
	let c1 = 0;
	switch (data.sleepHabits.sleepEnvironment) {
		case 'excellent': c1 = 0; break;
		case 'good': c1 = 1; break;
		case 'fair': c1 = 2; break;
		case 'poor': c1 = 3; break;
	}
	if (c1 > 0) {
		firedRules.push({
			id: psqiComponents[0].id,
			component: psqiComponents[0].name,
			description: `Subjective sleep quality rated as ${data.sleepHabits.sleepEnvironment}`,
			score: c1
		});
	}

	// ─── Component 2: Sleep latency ─────────────────────
	// Based on time to fall asleep and frequency of difficulty
	let c2a = 0;
	const minutesToFall = data.sleepHabits.minutesToFallAsleep;
	if (minutesToFall !== null) {
		if (minutesToFall <= 15) c2a = 0;
		else if (minutesToFall <= 30) c2a = 1;
		else if (minutesToFall <= 60) c2a = 2;
		else c2a = 3;
	}
	const c2b = frequencyToScore(data.sleepLatency.timeToFallAsleep);
	const c2sum = c2a + c2b;
	let c2 = 0;
	if (c2sum === 0) c2 = 0;
	else if (c2sum <= 2) c2 = 1;
	else if (c2sum <= 4) c2 = 2;
	else c2 = 3;
	if (c2 > 0) {
		firedRules.push({
			id: psqiComponents[1].id,
			component: psqiComponents[1].name,
			description: `Sleep latency score ${c2}/3 (minutes to fall asleep: ${minutesToFall ?? 'N/A'}, difficulty frequency: ${data.sleepLatency.timeToFallAsleep || 'N/A'})`,
			score: c2
		});
	}

	// ─── Component 3: Sleep duration ────────────────────
	let c3 = 0;
	const sleepHours = data.sleepDuration.actualSleepHours;
	if (sleepHours !== null) {
		if (sleepHours >= 7) c3 = 0;
		else if (sleepHours >= 6) c3 = 1;
		else if (sleepHours >= 5) c3 = 2;
		else c3 = 3;
	}
	if (c3 > 0) {
		firedRules.push({
			id: psqiComponents[2].id,
			component: psqiComponents[2].name,
			description: `Sleep duration: ${sleepHours ?? 'N/A'} hours per night`,
			score: c3
		});
	}

	// ─── Component 4: Sleep efficiency ──────────────────
	let c4 = 0;
	const efficiency = sleepEfficiencyCalc(
		data.sleepEfficiency.hoursAsleep,
		data.sleepEfficiency.hoursInBed
	);
	if (efficiency !== null) {
		if (efficiency >= 85) c4 = 0;
		else if (efficiency >= 75) c4 = 1;
		else if (efficiency >= 65) c4 = 2;
		else c4 = 3;
	}
	if (c4 > 0) {
		firedRules.push({
			id: psqiComponents[3].id,
			component: psqiComponents[3].name,
			description: `Sleep efficiency: ${efficiency !== null ? efficiency.toFixed(1) : 'N/A'}%`,
			score: c4
		});
	}

	// ─── Component 5: Sleep disturbances ────────────────
	const disturbanceScores = [
		frequencyToScore(data.sleepDisturbances.wakeUpMiddleNight),
		frequencyToScore(data.sleepDisturbances.bathroomTrips),
		frequencyToScore(data.sleepDisturbances.breathingDifficulty),
		frequencyToScore(data.sleepDisturbances.coughingSnoring),
		frequencyToScore(data.sleepDisturbances.tooHot),
		frequencyToScore(data.sleepDisturbances.tooCold),
		frequencyToScore(data.sleepDisturbances.badDreams),
		frequencyToScore(data.sleepDisturbances.pain)
	];
	const disturbanceSum = disturbanceScores.reduce((a, b) => a + b, 0);
	let c5 = 0;
	if (disturbanceSum === 0) c5 = 0;
	else if (disturbanceSum <= 9) c5 = 1;
	else if (disturbanceSum <= 18) c5 = 2;
	else c5 = 3;
	if (c5 > 0) {
		firedRules.push({
			id: psqiComponents[4].id,
			component: psqiComponents[4].name,
			description: `Sleep disturbances composite score: ${disturbanceSum} (component score: ${c5}/3)`,
			score: c5
		});
	}

	// ─── Component 6: Sleep medication use ──────────────
	let c6 = frequencyToScore(data.sleepMedicationUse.frequency);
	if (c6 > 0) {
		firedRules.push({
			id: psqiComponents[5].id,
			component: psqiComponents[5].name,
			description: `Sleep medication use frequency: ${data.sleepMedicationUse.frequency}`,
			score: c6
		});
	}

	// ─── Component 7: Daytime dysfunction ───────────────
	const c7a = frequencyToScore(data.daytimeDysfunction.troubleStayingAwake);
	const c7b = frequencyToScore(data.daytimeDysfunction.enthusiasmProblem);
	const c7sum = c7a + c7b;
	let c7 = 0;
	if (c7sum === 0) c7 = 0;
	else if (c7sum <= 2) c7 = 1;
	else if (c7sum <= 4) c7 = 2;
	else c7 = 3;
	if (c7 > 0) {
		firedRules.push({
			id: psqiComponents[6].id,
			component: psqiComponents[6].name,
			description: `Daytime dysfunction score ${c7}/3 (trouble staying awake + enthusiasm problems)`,
			score: c7
		});
	}

	const psqiScore = c1 + c2 + c3 + c4 + c5 + c6 + c7;
	const psqiCategoryLabel = psqiCategory(psqiScore);

	return { psqiScore, psqiCategoryLabel, firedRules };
}
