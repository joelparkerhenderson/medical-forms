import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of FMS total score. These are safety-critical or clinically
 * significant alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];
	const p = data.fmsPatterns;

	const patternNames: [string, typeof p.deepSquat][] = [
		['Deep Squat', p.deepSquat],
		['Hurdle Step', p.hurdleStep],
		['In-Line Lunge', p.inLineLunge],
		['Shoulder Mobility', p.shoulderMobility],
		['Active Straight Leg Raise', p.activeStraightLegRaise],
		['Trunk Stability Push-Up', p.trunkStabilityPushUp],
		['Rotary Stability', p.rotaryStability]
	];

	// ─── Pain during any movement ────────────────────────────
	for (const [name, pattern] of patternNames) {
		if (pattern.painDuringMovement) {
			flags.push({
				id: `FLAG-PAIN-${name.replace(/\s+/g, '-').toUpperCase()}`,
				category: 'Pain During Movement',
				message: `Pain reported during ${name} - requires further clinical evaluation before exercise prescription`,
				priority: 'high'
			});
		}
	}

	// ─── Score of 1 on any pattern (inability) ───────────────
	for (const [name, pattern] of patternNames) {
		const effectiveScore = getEffectiveScore(pattern);
		if (effectiveScore === 1) {
			flags.push({
				id: `FLAG-INABILITY-${name.replace(/\s+/g, '-').toUpperCase()}`,
				category: 'Movement Limitation',
				message: `Unable to perform ${name} pattern - corrective exercise programme recommended`,
				priority: 'medium'
			});
		}
	}

	// ─── Asymmetries > 1 point ───────────────────────────────
	const bilateralPatterns: [string, typeof p.deepSquat][] = [
		['Hurdle Step', p.hurdleStep],
		['In-Line Lunge', p.inLineLunge],
		['Shoulder Mobility', p.shoulderMobility],
		['Active Straight Leg Raise', p.activeStraightLegRaise],
		['Rotary Stability', p.rotaryStability]
	];

	for (const [name, pattern] of bilateralPatterns) {
		if (pattern.leftScore !== null && pattern.rightScore !== null) {
			const diff = Math.abs(pattern.leftScore - pattern.rightScore);
			if (diff > 1) {
				flags.push({
					id: `FLAG-ASYMMETRY-${name.replace(/\s+/g, '-').toUpperCase()}`,
					category: 'Significant Asymmetry',
					message: `${name}: left-right difference of ${diff} points (L:${pattern.leftScore}, R:${pattern.rightScore}) - address asymmetry before progressive loading`,
					priority: 'high'
				});
			} else if (diff === 1) {
				flags.push({
					id: `FLAG-ASYMMETRY-${name.replace(/\s+/g, '-').toUpperCase()}`,
					category: 'Mild Asymmetry',
					message: `${name}: left-right difference of 1 point (L:${pattern.leftScore}, R:${pattern.rightScore}) - monitor and address with corrective exercises`,
					priority: 'medium'
				});
			}
		}
	}

	// ─── Clearing test failures ──────────────────────────────
	const ct = p.clearingTests;
	if (ct.shoulderClearingPain) {
		flags.push({
			id: 'FLAG-CLEARING-SHOULDER',
			category: 'Clearing Test Failure',
			message: 'Shoulder clearing test produced pain - refer for orthopedic evaluation before upper extremity training',
			priority: 'high'
		});
	}

	if (ct.trunkFlexionClearingPain) {
		flags.push({
			id: 'FLAG-CLEARING-TRUNK-FLEX',
			category: 'Clearing Test Failure',
			message: 'Trunk flexion clearing test produced pain - refer for spinal evaluation before trunk loading',
			priority: 'high'
		});
	}

	if (ct.trunkExtensionClearingPain) {
		flags.push({
			id: 'FLAG-CLEARING-TRUNK-EXT',
			category: 'Clearing Test Failure',
			message: 'Trunk extension clearing test produced pain - refer for spinal evaluation before extension activities',
			priority: 'high'
		});
	}

	// ─── Current pain level ─────────────────────────────────
	if (data.movementHistory.currentPain === 'severe') {
		flags.push({
			id: 'FLAG-CURRENT-PAIN',
			category: 'Current Pain',
			message: `Patient reports severe current pain: ${data.movementHistory.currentPainDetails || 'details not specified'} - medical clearance recommended before exercise`,
			priority: 'high'
		});
	}

	// ─── Low total FMS score ────────────────────────────────
	const totalScore = calculateQuickTotal(patternNames);
	if (totalScore <= 14 && totalScore > 0) {
		flags.push({
			id: 'FLAG-LOW-TOTAL',
			category: 'Injury Risk',
			message: `FMS total score of ${totalScore} is at or below injury risk threshold (14) - modify training intensity and address movement deficiencies`,
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}

function getEffectiveScore(pattern: { score: number | null; leftScore: number | null; rightScore: number | null; painDuringMovement: boolean }): number | null {
	if (pattern.painDuringMovement) return 0;
	if (pattern.leftScore !== null && pattern.rightScore !== null) {
		return Math.min(pattern.leftScore, pattern.rightScore);
	}
	return pattern.score;
}

function calculateQuickTotal(patterns: [string, { score: number | null; leftScore: number | null; rightScore: number | null; painDuringMovement: boolean }][]): number {
	let total = 0;
	for (const [, pattern] of patterns) {
		const s = getEffectiveScore(pattern);
		if (s !== null) total += s;
	}
	return total;
}
