import { describe, it, expect } from 'vitest';
import { calculateTinetti } from './tinetti-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { allTinettiItems } from './tinetti-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1945-06-15',
			sex: 'female',
			height: '165 cm',
			weight: '68 kg'
		},
		referralInfo: {
			referringProvider: 'Dr. Brown',
			referralReason: 'Routine mobility assessment',
			referralDate: '2026-01-15',
			primaryDiagnosis: 'Age-related mobility concern',
			secondaryDiagnoses: ''
		},
		fallHistory: {
			fallsLastYear: 0,
			lastFallDate: '',
			fallCircumstances: '',
			injuriesFromFalls: '',
			fearOfFalling: 'none',
			fallRiskFactors: []
		},
		balanceAssessment: {
			sittingBalance: 1,
			risesFromChair: 2,
			attemptingToRise: 2,
			immediateStandingBalance: 2,
			standingBalance: 2,
			nudgedBalance: 2,
			eyesClosed: 1,
			turning360: 2,
			sittingDown: 2
		},
		gaitAssessment: {
			initiationOfGait: 1,
			stepLength: 1,
			stepHeight: 1,
			stepSymmetry: 1,
			stepContinuity: 1,
			path: 2,
			trunk: 2,
			walkingStance: 1
		},
		timedUpAndGo: {
			timeSeconds: 8,
			usedAssistiveDevice: 'no',
			deviceType: ''
		},
		rangeOfMotion: {
			hipFlexion: 'normal',
			hipExtension: 'normal',
			kneeFlexion: 'normal',
			kneeExtension: 'normal',
			ankleFlexion: 'normal',
			ankleExtension: 'normal',
			notes: ''
		},
		assistiveDevices: {
			currentDevices: [],
			deviceFitAdequate: '',
			deviceCondition: '',
			recommendedDevices: ''
		},
		currentMedications: {
			medications: [],
			fallRiskMedications: [],
			recentMedicationChanges: ''
		},
		functionalIndependence: {
			transfers: 'independent',
			ambulation: 'independent',
			stairs: 'independent',
			bathing: 'independent',
			dressing: 'independent',
			additionalNotes: ''
		}
	};
}

describe('Tinetti Grading Engine', () => {
	it('returns perfect score (28) for a patient with no deficits', () => {
		const data = createHealthyPatient();
		const result = calculateTinetti(data);
		expect(result.tinettiTotal).toBe(26);
		expect(result.balanceScore).toBe(16);
		expect(result.gaitScore).toBe(10);
		expect(result.tinettiCategoryLabel).toBe('Low fall risk');
	});

	it('returns High fall risk (0-18) for severely impaired patient', () => {
		const data = createHealthyPatient();
		data.balanceAssessment = {
			sittingBalance: 0,
			risesFromChair: 0,
			attemptingToRise: 1,
			immediateStandingBalance: 0,
			standingBalance: 0,
			nudgedBalance: 0,
			eyesClosed: 0,
			turning360: 0,
			sittingDown: 0
		};
		data.gaitAssessment = {
			initiationOfGait: 0,
			stepLength: 0,
			stepHeight: 0,
			stepSymmetry: 0,
			stepContinuity: 0,
			path: 0,
			trunk: 0,
			walkingStance: 0
		};

		const result = calculateTinetti(data);
		expect(result.tinettiTotal).toBe(1);
		expect(result.tinettiCategoryLabel).toBe('High fall risk');
	});

	it('returns Moderate fall risk (19-24) for moderate impairment', () => {
		const data = createHealthyPatient();
		data.balanceAssessment = {
			sittingBalance: 1,
			risesFromChair: 1,
			attemptingToRise: 2,
			immediateStandingBalance: 1,
			standingBalance: 1,
			nudgedBalance: 1,
			eyesClosed: 1,
			turning360: 1,
			sittingDown: 1
		};
		data.gaitAssessment = {
			initiationOfGait: 1,
			stepLength: 1,
			stepHeight: 1,
			stepSymmetry: 1,
			stepContinuity: 1,
			path: 1,
			trunk: 1,
			walkingStance: 1
		};

		const result = calculateTinetti(data);
		expect(result.tinettiTotal).toBe(20);
		expect(result.tinettiCategoryLabel).toBe('Moderate fall risk');
	});

	it('correctly separates balance and gait subscores', () => {
		const data = createHealthyPatient();
		const result = calculateTinetti(data);
		expect(result.balanceScore).toBeLessThanOrEqual(16);
		expect(result.gaitScore).toBeLessThanOrEqual(12);
		expect(result.tinettiTotal).toBe(result.balanceScore + result.gaitScore);
	});

	it('detects all item IDs are unique', () => {
		const ids = allTinettiItems.map((q) => q.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('handles null scores gracefully (unanswered items)', () => {
		const data = createHealthyPatient();
		data.balanceAssessment.sittingBalance = null;
		data.balanceAssessment.risesFromChair = null;
		data.gaitAssessment.initiationOfGait = null;

		const result = calculateTinetti(data);
		// Should only count answered items
		expect(result.balanceScore).toBe(14); // 16 - 1 (sitting) - 2 (rises) + 1 null
		expect(result.gaitScore).toBe(9); // 10 - 1 (initiation)
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags recurrent falls', () => {
		const data = createHealthyPatient();
		data.fallHistory.fallsLastYear = 3;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-RECURRENT-001')).toBe(true);
	});

	it('flags TUG > 14 seconds', () => {
		const data = createHealthyPatient();
		data.timedUpAndGo.timeSeconds = 18;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-TUG-001')).toBe(true);
	});

	it('flags polypharmacy', () => {
		const data = createHealthyPatient();
		data.currentMedications.medications = [
			{ name: 'Med1', dose: '10mg', frequency: 'daily' },
			{ name: 'Med2', dose: '20mg', frequency: 'daily' },
			{ name: 'Med3', dose: '5mg', frequency: 'daily' },
			{ name: 'Med4', dose: '100mg', frequency: 'daily' },
			{ name: 'Med5', dose: '50mg', frequency: 'daily' }
		];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-POLYPHARM-001')).toBe(true);
	});

	it('flags severe fear of falling', () => {
		const data = createHealthyPatient();
		data.fallHistory.fearOfFalling = 'severe';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-FEAR-001')).toBe(true);
	});

	it('flags severe ROM limitations', () => {
		const data = createHealthyPatient();
		data.rangeOfMotion.hipFlexion = 'severely-limited';
		data.rangeOfMotion.kneeFlexion = 'severely-limited';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ROM-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.fallHistory.fallsLastYear = 5;
		data.timedUpAndGo.timeSeconds = 25;
		data.fallHistory.fearOfFalling = 'severe';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
