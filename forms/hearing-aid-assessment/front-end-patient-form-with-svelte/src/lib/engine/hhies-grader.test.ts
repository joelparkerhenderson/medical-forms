import { describe, it, expect } from 'vitest';
import { calculateHHIES } from './hhies-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { hhiesQuestions } from './hhies-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1950-06-15',
			sex: 'female'
		},
		hearingHistory: {
			onsetType: 'gradual',
			duration: '3 years',
			affectedEar: 'both',
			familyHistory: 'no',
			noiseExposure: 'no',
			tinnitus: 'no',
			vertigo: 'no',
			earSurgery: 'no',
			ototoxicMedications: 'no'
		},
		hhiesQuestionnaire: {
			q1: 0, q2: 0, q3: 0, q4: 0, q5: 0,
			q6: 0, q7: 0, q8: 0, q9: 0, q10: 0
		},
		communicationDifficulties: {
			quietConversation: 'none',
			groupConversation: 'slight',
			telephone: 'none',
			television: 'none',
			publicPlaces: 'none',
			workDifficulty: 'none'
		},
		currentHearingAids: {
			hasHearingAids: 'no',
			leftAidType: '',
			rightAidType: '',
			aidAge: '',
			satisfaction: '',
			dailyUseHours: null,
			difficulties: ''
		},
		earExamination: {
			leftExternalEar: 'Normal',
			rightExternalEar: 'Normal',
			leftTympanicMembrane: 'Normal',
			rightTympanicMembrane: 'Normal',
			cerumenLeft: 'no',
			cerumenRight: 'no',
			abnormalities: ''
		},
		audiogramResults: {
			leftPTA: 20,
			rightPTA: 22,
			leftSRT: 20,
			rightSRT: 22,
			leftWordRecognition: 96,
			rightWordRecognition: 94,
			hearingLossType: 'sensorineural'
		},
		lifestyleNeeds: {
			socialActivity: 'Active social life',
			occupationRequirements: 'Retired',
			hobbies: 'Reading, gardening',
			technologyComfort: 'comfortable',
			dexterity: 'good',
			visionStatus: 'good'
		},
		expectationsGoals: {
			primaryGoal: 'Better conversation in groups',
			realisticExpectations: 'yes',
			willingnessToWear: 'willing',
			budgetConcerns: 'mild',
			cosmeticConcerns: 'none'
		}
	};
}

describe('HHIE-S Grading Engine', () => {
	it('returns HHIE-S 0 for a patient with no hearing handicap', () => {
		const data = createHealthyPatient();
		const result = calculateHHIES(data);
		expect(result.hhiesScore).toBe(0);
		expect(result.hhiesCategoryLabel).toBe('No handicap');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns No handicap (0-8) for minimal symptoms', () => {
		const data = createHealthyPatient();
		data.hhiesQuestionnaire.q1 = 2;
		data.hhiesQuestionnaire.q3 = 4;

		const result = calculateHHIES(data);
		expect(result.hhiesScore).toBe(6);
		expect(result.hhiesCategoryLabel).toBe('No handicap');
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns Mild to moderate handicap (10-22) for moderate symptoms', () => {
		const data = createHealthyPatient();
		data.hhiesQuestionnaire.q1 = 4;
		data.hhiesQuestionnaire.q2 = 2;
		data.hhiesQuestionnaire.q3 = 4;
		data.hhiesQuestionnaire.q8 = 4;

		const result = calculateHHIES(data);
		expect(result.hhiesScore).toBe(14);
		expect(result.hhiesCategoryLabel).toBe('Mild to moderate handicap');
	});

	it('returns Significant handicap (24-40) for severe impact', () => {
		const data = createHealthyPatient();
		data.hhiesQuestionnaire.q1 = 4;
		data.hhiesQuestionnaire.q2 = 4;
		data.hhiesQuestionnaire.q3 = 4;
		data.hhiesQuestionnaire.q4 = 4;
		data.hhiesQuestionnaire.q5 = 4;
		data.hhiesQuestionnaire.q6 = 2;
		data.hhiesQuestionnaire.q7 = 4;

		const result = calculateHHIES(data);
		expect(result.hhiesScore).toBe(26);
		expect(result.hhiesCategoryLabel).toBe('Significant handicap');
	});

	it('returns maximum score (40) for all Yes responses', () => {
		const data = createHealthyPatient();
		data.hhiesQuestionnaire.q1 = 4;
		data.hhiesQuestionnaire.q2 = 4;
		data.hhiesQuestionnaire.q3 = 4;
		data.hhiesQuestionnaire.q4 = 4;
		data.hhiesQuestionnaire.q5 = 4;
		data.hhiesQuestionnaire.q6 = 4;
		data.hhiesQuestionnaire.q7 = 4;
		data.hhiesQuestionnaire.q8 = 4;
		data.hhiesQuestionnaire.q9 = 4;
		data.hhiesQuestionnaire.q10 = 4;

		const result = calculateHHIES(data);
		expect(result.hhiesScore).toBe(40);
		expect(result.hhiesCategoryLabel).toBe('Significant handicap');
	});

	it('detects all question IDs are unique', () => {
		const ids = hhiesQuestions.map((q) => q.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('handles null scores gracefully (unanswered questions)', () => {
		const data = createHealthyPatient();
		data.hhiesQuestionnaire.q1 = 4;
		data.hhiesQuestionnaire.q2 = null;
		data.hhiesQuestionnaire.q3 = 2;

		const result = calculateHHIES(data);
		expect(result.hhiesScore).toBe(6);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient with normal hearing', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags sudden onset hearing loss', () => {
		const data = createHealthyPatient();
		data.hearingHistory.onsetType = 'sudden';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SUDDEN-001')).toBe(true);
	});

	it('flags unilateral hearing loss', () => {
		const data = createHealthyPatient();
		data.hearingHistory.affectedEar = 'left';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-UNILATERAL-001')).toBe(true);
	});

	it('flags tinnitus', () => {
		const data = createHealthyPatient();
		data.hearingHistory.tinnitus = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-TINNITUS-001')).toBe(true);
	});

	it('flags vertigo', () => {
		const data = createHealthyPatient();
		data.hearingHistory.vertigo = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-VERTIGO-001')).toBe(true);
	});

	it('flags ear surgery history', () => {
		const data = createHealthyPatient();
		data.hearingHistory.earSurgery = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SURGERY-001')).toBe(true);
	});

	it('flags asymmetric hearing loss', () => {
		const data = createHealthyPatient();
		data.audiogramResults.leftPTA = 45;
		data.audiogramResults.rightPTA = 20;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ASYMMETRIC-001')).toBe(true);
	});

	it('flags poor word recognition', () => {
		const data = createHealthyPatient();
		data.audiogramResults.leftWordRecognition = 40;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-WORD-RECOG-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.hearingHistory.onsetType = 'sudden';
		data.hearingHistory.tinnitus = 'yes';
		data.hearingHistory.noiseExposure = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
