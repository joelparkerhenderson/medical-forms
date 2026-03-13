import { describe, it, expect } from 'vitest';
import { calculatePHQ9, calculateGAD7, gradeAssessment } from './mh-grader';
import { detectAdditionalFlags } from './flagged-issues';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Doe',
			dateOfBirth: '1990-05-15',
			sex: 'female',
			emergencyContactName: 'John Doe',
			emergencyContactPhone: '555-1234',
			emergencyContactRelationship: 'Spouse'
		},
		phqResponses: {
			interest: 0,
			depression: 0,
			sleep: 0,
			energy: 0,
			appetite: 0,
			selfEsteem: 0,
			concentration: 0,
			psychomotor: 0,
			suicidalThoughts: 0
		},
		gadResponses: {
			nervousness: 0,
			uncontrollableWorry: 0,
			excessiveWorry: 0,
			troubleRelaxing: 0,
			restlessness: 0,
			irritability: 0,
			fearfulness: 0
		},
		moodAffect: {
			currentMood: 'good',
			sleepQuality: 'good',
			appetiteChanges: 'no-change',
			energyLevel: 'moderate',
			concentration: 'good'
		},
		riskAssessment: {
			suicidalIdeation: 'none',
			suicidalIdeationDetails: '',
			selfHarm: 'none',
			selfHarmDetails: '',
			harmToOthers: 'none',
			harmToOthersDetails: '',
			hasSafetyPlan: '',
			safetyPlanDetails: ''
		},
		substanceUse: {
			alcoholFrequency: 'never',
			alcoholQuantity: '1-2',
			bingeDrinking: 'never',
			drugUse: 'never',
			drugDetails: '',
			tobaccoUse: 'never',
			tobaccoDetails: ''
		},
		currentMedications: {
			psychiatricMedications: [],
			otherMedications: []
		},
		treatmentHistory: {
			previousTherapy: 'no',
			therapyDetails: '',
			previousHospitalizations: 'no',
			hospitalizationDetails: '',
			currentProviders: ''
		},
		socialFunctional: {
			employmentStatus: 'employed-full-time',
			relationshipStatus: 'married',
			housingStatus: 'stable',
			supportSystem: 'strong',
			functionalImpairment: 'none',
			additionalNotes: ''
		}
	};
}

describe('PHQ-9 Scoring', () => {
	it('returns minimal for all zeros', () => {
		const data = createHealthyPatient();
		const result = calculatePHQ9(data);
		expect(result.score).toBe(0);
		expect(result.severity).toBe('minimal');
		expect(result.maxScore).toBe(27);
	});

	it('returns mild depression for score 5-9', () => {
		const data = createHealthyPatient();
		data.phqResponses.interest = 2;
		data.phqResponses.depression = 2;
		data.phqResponses.sleep = 1;
		const result = calculatePHQ9(data);
		expect(result.score).toBe(5);
		expect(result.severity).toBe('mild');
	});

	it('returns moderate depression for score 10-14', () => {
		const data = createHealthyPatient();
		data.phqResponses.interest = 2;
		data.phqResponses.depression = 3;
		data.phqResponses.sleep = 2;
		data.phqResponses.energy = 2;
		data.phqResponses.appetite = 1;
		const result = calculatePHQ9(data);
		expect(result.score).toBe(10);
		expect(result.severity).toBe('moderate');
	});

	it('returns moderately severe depression for score 15-19', () => {
		const data = createHealthyPatient();
		data.phqResponses.interest = 3;
		data.phqResponses.depression = 3;
		data.phqResponses.sleep = 3;
		data.phqResponses.energy = 3;
		data.phqResponses.appetite = 3;
		const result = calculatePHQ9(data);
		expect(result.score).toBe(15);
		expect(result.severity).toBe('moderately-severe');
	});

	it('returns severe depression for score 20-27', () => {
		const data = createHealthyPatient();
		data.phqResponses.interest = 3;
		data.phqResponses.depression = 3;
		data.phqResponses.sleep = 3;
		data.phqResponses.energy = 3;
		data.phqResponses.appetite = 3;
		data.phqResponses.selfEsteem = 3;
		data.phqResponses.concentration = 2;
		const result = calculatePHQ9(data);
		expect(result.score).toBe(20);
		expect(result.severity).toBe('severe');
	});

	it('returns max score 27', () => {
		const data = createHealthyPatient();
		data.phqResponses.interest = 3;
		data.phqResponses.depression = 3;
		data.phqResponses.sleep = 3;
		data.phqResponses.energy = 3;
		data.phqResponses.appetite = 3;
		data.phqResponses.selfEsteem = 3;
		data.phqResponses.concentration = 3;
		data.phqResponses.psychomotor = 3;
		data.phqResponses.suicidalThoughts = 3;
		const result = calculatePHQ9(data);
		expect(result.score).toBe(27);
		expect(result.severity).toBe('severe');
	});
});

describe('GAD-7 Scoring', () => {
	it('returns minimal for all zeros', () => {
		const data = createHealthyPatient();
		const result = calculateGAD7(data);
		expect(result.score).toBe(0);
		expect(result.severity).toBe('minimal');
		expect(result.maxScore).toBe(21);
	});

	it('returns mild anxiety for score 5-9', () => {
		const data = createHealthyPatient();
		data.gadResponses.nervousness = 2;
		data.gadResponses.uncontrollableWorry = 2;
		data.gadResponses.excessiveWorry = 1;
		const result = calculateGAD7(data);
		expect(result.score).toBe(5);
		expect(result.severity).toBe('mild');
	});

	it('returns moderate anxiety for score 10-14', () => {
		const data = createHealthyPatient();
		data.gadResponses.nervousness = 2;
		data.gadResponses.uncontrollableWorry = 2;
		data.gadResponses.excessiveWorry = 2;
		data.gadResponses.troubleRelaxing = 2;
		data.gadResponses.restlessness = 2;
		const result = calculateGAD7(data);
		expect(result.score).toBe(10);
		expect(result.severity).toBe('moderate');
	});

	it('returns severe anxiety for score 15-21', () => {
		const data = createHealthyPatient();
		data.gadResponses.nervousness = 3;
		data.gadResponses.uncontrollableWorry = 3;
		data.gadResponses.excessiveWorry = 3;
		data.gadResponses.troubleRelaxing = 3;
		data.gadResponses.restlessness = 3;
		const result = calculateGAD7(data);
		expect(result.score).toBe(15);
		expect(result.severity).toBe('severe');
	});

	it('returns max score 21', () => {
		const data = createHealthyPatient();
		data.gadResponses.nervousness = 3;
		data.gadResponses.uncontrollableWorry = 3;
		data.gadResponses.excessiveWorry = 3;
		data.gadResponses.troubleRelaxing = 3;
		data.gadResponses.restlessness = 3;
		data.gadResponses.irritability = 3;
		data.gadResponses.fearfulness = 3;
		const result = calculateGAD7(data);
		expect(result.score).toBe(21);
		expect(result.severity).toBe('severe');
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags active suicidal ideation with plan', () => {
		const data = createHealthyPatient();
		data.riskAssessment.suicidalIdeation = 'active-with-plan';
		data.riskAssessment.hasSafetyPlan = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SI-001')).toBe(true);
		expect(flags.some((f) => f.priority === 'high')).toBe(true);
	});

	it('flags current self-harm', () => {
		const data = createHealthyPatient();
		data.riskAssessment.selfHarm = 'current';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SH-001')).toBe(true);
	});

	it('flags severe depression', () => {
		const data = createHealthyPatient();
		data.phqResponses.interest = 3;
		data.phqResponses.depression = 3;
		data.phqResponses.sleep = 3;
		data.phqResponses.energy = 3;
		data.phqResponses.appetite = 3;
		data.phqResponses.selfEsteem = 3;
		data.phqResponses.concentration = 2;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-DEP-001')).toBe(true);
	});

	it('flags substance abuse', () => {
		const data = createHealthyPatient();
		data.substanceUse.drugUse = 'regular';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SUB-002')).toBe(true);
	});

	it('flags PHQ-9 item 9 suicidal thoughts', () => {
		const data = createHealthyPatient();
		data.phqResponses.suicidalThoughts = 2;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PHQ9-SI')).toBe(true);
	});

	it('flags homelessness', () => {
		const data = createHealthyPatient();
		data.socialFunctional.housingStatus = 'homeless';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SOCIAL-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.riskAssessment.selfHarm = 'past';
		data.socialFunctional.housingStatus = 'unstable';
		data.socialFunctional.functionalImpairment = 'severe';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});

describe('gradeAssessment', () => {
	it('returns complete grading result', () => {
		const data = createHealthyPatient();
		const result = gradeAssessment(data);
		expect(result.phq9.instrument).toBe('PHQ-9');
		expect(result.gad7.instrument).toBe('GAD-7');
		expect(result.timestamp).toBeTruthy();
		expect(Array.isArray(result.additionalFlags)).toBe(true);
	});
});
