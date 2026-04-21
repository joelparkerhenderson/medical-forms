import { describe, it, expect } from 'vitest';
import { calculateFMS } from './fms-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { fmsPatterns } from './fms-rules';
import type { AssessmentData } from './types';

function createDefaultPatternScore() {
	return {
		score: 3 as const,
		painDuringMovement: false,
		leftScore: null,
		rightScore: null,
		asymmetryNotes: ''
	};
}

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1995-06-15',
			sex: 'female'
		},
		referralInfo: {
			referringProvider: 'Dr. Williams',
			referralReason: 'Pre-season screening',
			referralDate: '2026-03-01',
			sportOrActivity: 'Football'
		},
		movementHistory: {
			injuryHistory: 'None',
			activityLevel: 'vigorous',
			sportParticipation: 'Football, 5 times per week',
			currentPain: 'none',
			currentPainDetails: '',
			previousTreatments: 'None'
		},
		fmsPatterns: {
			deepSquat: { score: 3, painDuringMovement: false, leftScore: null, rightScore: null, asymmetryNotes: '' },
			hurdleStep: { score: null, painDuringMovement: false, leftScore: 3, rightScore: 3, asymmetryNotes: '' },
			inLineLunge: { score: null, painDuringMovement: false, leftScore: 3, rightScore: 3, asymmetryNotes: '' },
			shoulderMobility: { score: null, painDuringMovement: false, leftScore: 3, rightScore: 3, asymmetryNotes: '' },
			activeStraightLegRaise: { score: null, painDuringMovement: false, leftScore: 3, rightScore: 3, asymmetryNotes: '' },
			trunkStabilityPushUp: { score: 3, painDuringMovement: false, leftScore: null, rightScore: null, asymmetryNotes: '' },
			rotaryStability: { score: null, painDuringMovement: false, leftScore: 3, rightScore: 3, asymmetryNotes: '' },
			clearingTests: {
				shoulderClearing: 'no',
				shoulderClearingPain: false,
				trunkFlexionClearing: 'no',
				trunkFlexionClearingPain: false,
				trunkExtensionClearing: 'no',
				trunkExtensionClearingPain: false
			}
		}
	};
}

describe('FMS Grading Engine', () => {
	it('returns FMS 21 for a patient with perfect scores', () => {
		const data = createHealthyPatient();
		const result = calculateFMS(data);
		expect(result.fmsScore).toBe(21);
		expect(result.fmsCategoryLabel).toBe('Excellent');
		expect(result.firedRules).toHaveLength(7);
	});

	it('returns Good (14-17) for moderate scores', () => {
		const data = createHealthyPatient();
		data.fmsPatterns.deepSquat.score = 2;
		data.fmsPatterns.hurdleStep.leftScore = 2;
		data.fmsPatterns.hurdleStep.rightScore = 2;
		data.fmsPatterns.inLineLunge.leftScore = 2;
		data.fmsPatterns.inLineLunge.rightScore = 2;
		data.fmsPatterns.trunkStabilityPushUp.score = 2;

		const result = calculateFMS(data);
		expect(result.fmsScore).toBe(17);
		expect(result.fmsCategoryLabel).toBe('Good');
	});

	it('returns Fair (10-13) for below-average scores', () => {
		const data = createHealthyPatient();
		data.fmsPatterns.deepSquat.score = 2;
		data.fmsPatterns.hurdleStep.leftScore = 2;
		data.fmsPatterns.hurdleStep.rightScore = 1;
		data.fmsPatterns.inLineLunge.leftScore = 1;
		data.fmsPatterns.inLineLunge.rightScore = 2;
		data.fmsPatterns.shoulderMobility.leftScore = 2;
		data.fmsPatterns.shoulderMobility.rightScore = 2;
		data.fmsPatterns.activeStraightLegRaise.leftScore = 2;
		data.fmsPatterns.activeStraightLegRaise.rightScore = 1;
		data.fmsPatterns.trunkStabilityPushUp.score = 2;
		data.fmsPatterns.rotaryStability.leftScore = 1;
		data.fmsPatterns.rotaryStability.rightScore = 2;

		const result = calculateFMS(data);
		expect(result.fmsScore).toBe(11);
		expect(result.fmsCategoryLabel).toBe('Fair');
	});

	it('returns Poor (0-9) for low scores', () => {
		const data = createHealthyPatient();
		data.fmsPatterns.deepSquat.score = 1;
		data.fmsPatterns.hurdleStep.leftScore = 1;
		data.fmsPatterns.hurdleStep.rightScore = 1;
		data.fmsPatterns.inLineLunge.leftScore = 1;
		data.fmsPatterns.inLineLunge.rightScore = 1;
		data.fmsPatterns.shoulderMobility.leftScore = 1;
		data.fmsPatterns.shoulderMobility.rightScore = 1;
		data.fmsPatterns.activeStraightLegRaise.leftScore = 1;
		data.fmsPatterns.activeStraightLegRaise.rightScore = 1;
		data.fmsPatterns.trunkStabilityPushUp.score = 1;
		data.fmsPatterns.rotaryStability.leftScore = 1;
		data.fmsPatterns.rotaryStability.rightScore = 1;

		const result = calculateFMS(data);
		expect(result.fmsScore).toBe(7);
		expect(result.fmsCategoryLabel).toBe('Poor');
	});

	it('sets score to 0 when pain is present during movement', () => {
		const data = createHealthyPatient();
		data.fmsPatterns.deepSquat.painDuringMovement = true;

		const result = calculateFMS(data);
		expect(result.fmsScore).toBe(18);
		const squat = result.firedRules.find((r) => r.id === 'FMS-01');
		expect(squat?.score).toBe(0);
	});

	it('uses lower of left/right scores for bilateral tests', () => {
		const data = createHealthyPatient();
		data.fmsPatterns.hurdleStep.leftScore = 3;
		data.fmsPatterns.hurdleStep.rightScore = 2;

		const result = calculateFMS(data);
		const hurdle = result.firedRules.find((r) => r.id === 'FMS-02');
		expect(hurdle?.score).toBe(2);
		expect(result.fmsScore).toBe(20);
	});

	it('detects all pattern IDs are unique', () => {
		const ids = fmsPatterns.map((p) => p.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('handles null scores gracefully', () => {
		const data = createHealthyPatient();
		data.fmsPatterns.deepSquat.score = null;

		const result = calculateFMS(data);
		// 6 patterns scored at 3 = 18
		expect(result.fmsScore).toBe(18);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient with perfect scores', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags pain during movement', () => {
		const data = createHealthyPatient();
		data.fmsPatterns.deepSquat.painDuringMovement = true;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Pain During Movement')).toBe(true);
	});

	it('flags score of 1 (inability to perform)', () => {
		const data = createHealthyPatient();
		data.fmsPatterns.deepSquat.score = 1;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Movement Limitation')).toBe(true);
	});

	it('flags asymmetry greater than 1 point', () => {
		const data = createHealthyPatient();
		data.fmsPatterns.hurdleStep.leftScore = 3;
		data.fmsPatterns.hurdleStep.rightScore = 1;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Significant Asymmetry')).toBe(true);
	});

	it('flags mild asymmetry of 1 point', () => {
		const data = createHealthyPatient();
		data.fmsPatterns.shoulderMobility.leftScore = 3;
		data.fmsPatterns.shoulderMobility.rightScore = 2;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Mild Asymmetry')).toBe(true);
	});

	it('flags shoulder clearing test pain', () => {
		const data = createHealthyPatient();
		data.fmsPatterns.clearingTests.shoulderClearingPain = true;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CLEARING-SHOULDER')).toBe(true);
	});

	it('flags trunk flexion clearing test pain', () => {
		const data = createHealthyPatient();
		data.fmsPatterns.clearingTests.trunkFlexionClearingPain = true;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CLEARING-TRUNK-FLEX')).toBe(true);
	});

	it('flags trunk extension clearing test pain', () => {
		const data = createHealthyPatient();
		data.fmsPatterns.clearingTests.trunkExtensionClearingPain = true;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CLEARING-TRUNK-EXT')).toBe(true);
	});

	it('flags severe current pain', () => {
		const data = createHealthyPatient();
		data.movementHistory.currentPain = 'severe';
		data.movementHistory.currentPainDetails = 'Lower back pain';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CURRENT-PAIN')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.fmsPatterns.deepSquat.painDuringMovement = true;
		data.fmsPatterns.deepSquat.score = 1;
		data.fmsPatterns.hurdleStep.leftScore = 1;
		data.fmsPatterns.hurdleStep.rightScore = 1;
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
