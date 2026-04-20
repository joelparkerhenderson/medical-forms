import { describe, it, expect } from 'vitest';
import { gradeAssessment } from './pcl5-grader';
import type { AssessmentData, PclItemScore } from './types';

function makeAssessment(overrides: Partial<AssessmentData> = {}): AssessmentData {
	const zero = (): PclItemScore => 0;
	return {
		demographics: { firstName: 'Test', lastName: 'Patient', dateOfBirth: '1990-01-01', sex: 'other' },
		traumaEvent: { eventDescription: 'Specified event', eventDate: '2025-01-01', isOngoing: false },
		clusterBIntrusion: {
			item1RepeatedDisturbingMemories: zero(),
			item2RepeatedDisturbingDreams: zero(),
			item3FeelingReliving: zero(),
			item4FeelingUpsetByReminders: zero(),
			item5StrongPhysicalReactions: zero()
		},
		clusterCAvoidance: {
			item6AvoidingMemoriesThoughtsFeelings: zero(),
			item7AvoidingExternalReminders: zero()
		},
		clusterDNegativeAlterations: {
			item8TroubleRememberingImportantParts: zero(),
			item9StrongNegativeBeliefs: zero(),
			item10BlamingSelfOrOthers: zero(),
			item11StrongNegativeFeelings: zero(),
			item12LossOfInterest: zero(),
			item13FeelingDistantFromOthers: zero(),
			item14TroubleExperiencingPositiveFeelings: zero()
		},
		clusterEArousalReactivity: {
			item15IrritableOrAggressive: zero(),
			item16RecklessOrSelfDestructive: zero(),
			item17SuperAlertOrOnGuard: zero(),
			item18JumpyOrEasilyStartled: zero(),
			item19DifficultyConcentrating: zero(),
			item20TroubleSleeping: zero()
		},
		...overrides
	};
}

describe('PCL-5 grader', () => {
	it('all-zero responses yield total 0 and Minimal category', () => {
		const result = gradeAssessment(makeAssessment());
		expect(result.totalScore).toBe(0);
		expect(result.category).toBe('Minimal');
		expect(result.probableDsm5Diagnosis).toBe(false);
	});

	it('all-4 responses yield total 80 and Severe category', () => {
		const all4 = makeAssessment();
		for (const cluster of [all4.clusterBIntrusion, all4.clusterCAvoidance, all4.clusterDNegativeAlterations, all4.clusterEArousalReactivity]) {
			for (const key of Object.keys(cluster)) {
				(cluster as Record<string, PclItemScore>)[key] = 4;
			}
		}
		const result = gradeAssessment(all4);
		expect(result.totalScore).toBe(80);
		expect(result.category).toBe('Severe');
		expect(result.probableDsm5Diagnosis).toBe(true);
	});

	it('just-at-cutoff (33) falls in Moderate band', () => {
		const a = makeAssessment();
		// 33 total split: B=5, C=4, D=14, E=10 (sums to 33)
		a.clusterBIntrusion.item1RepeatedDisturbingMemories = 2;
		a.clusterBIntrusion.item2RepeatedDisturbingDreams = 3;
		a.clusterCAvoidance.item6AvoidingMemoriesThoughtsFeelings = 2;
		a.clusterCAvoidance.item7AvoidingExternalReminders = 2;
		a.clusterDNegativeAlterations.item8TroubleRememberingImportantParts = 2;
		a.clusterDNegativeAlterations.item9StrongNegativeBeliefs = 2;
		a.clusterDNegativeAlterations.item10BlamingSelfOrOthers = 2;
		a.clusterDNegativeAlterations.item11StrongNegativeFeelings = 2;
		a.clusterDNegativeAlterations.item12LossOfInterest = 2;
		a.clusterDNegativeAlterations.item13FeelingDistantFromOthers = 2;
		a.clusterDNegativeAlterations.item14TroubleExperiencingPositiveFeelings = 2;
		a.clusterEArousalReactivity.item15IrritableOrAggressive = 2;
		a.clusterEArousalReactivity.item17SuperAlertOrOnGuard = 2;
		a.clusterEArousalReactivity.item18JumpyOrEasilyStartled = 2;
		a.clusterEArousalReactivity.item19DifficultyConcentrating = 2;
		a.clusterEArousalReactivity.item20TroubleSleeping = 2;
		const result = gradeAssessment(a);
		expect(result.totalScore).toBe(33);
		expect(result.category).toBe('Moderate');
		expect(result.probableDsm5Diagnosis).toBe(true);
	});

	it('flags self-harm when item 16 is ≥ 3', () => {
		const a = makeAssessment();
		a.clusterEArousalReactivity.item16RecklessOrSelfDestructive = 3;
		const result = gradeAssessment(a);
		expect(result.additionalFlags.some((f) => f.id === 'FLAG-SELFHARM-001')).toBe(true);
	});
});
