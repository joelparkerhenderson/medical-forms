import { describe, it, expect } from 'vitest';
import { calculateSatisfaction } from './satisfaction-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { satisfactionQuestions } from './satisfaction-questions';
import type { AssessmentData } from './types';

function createDefaultPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1985-06-15',
			sex: 'female'
		},
		visitInformation: {
			visitDate: '2026-03-01',
			department: 'Primary Care',
			providerName: 'Dr. Johnson',
			visitType: 'routine-checkup',
			reasonForVisit: 'Annual check-up',
			firstVisit: 'no'
		},
		accessScheduling: {
			easeOfScheduling: null,
			waitForAppointment: null,
			waitInWaitingRoom: null
		},
		communication: {
			listening: null,
			explainingCondition: null,
			answeringQuestions: null,
			timeSpent: null
		},
		staffProfessionalism: {
			receptionCourtesy: null,
			nursingCourtesy: null,
			respectShown: null
		},
		careQuality: {
			involvementInDecisions: null,
			treatmentPlanExplanation: null,
			confidenceInCare: null
		},
		environment: {
			cleanliness: null,
			waitingAreaComfort: null,
			privacy: null
		},
		overallSatisfaction: {
			overallRating: null,
			likelyToRecommend: null,
			likelyToReturn: null,
			comments: ''
		}
	};
}

function createAllScoredPatient(score: 1 | 2 | 3 | 4 | 5): AssessmentData {
	const data = createDefaultPatient();
	data.accessScheduling = {
		easeOfScheduling: score,
		waitForAppointment: score,
		waitInWaitingRoom: score
	};
	data.communication = {
		listening: score,
		explainingCondition: score,
		answeringQuestions: score,
		timeSpent: score
	};
	data.staffProfessionalism = {
		receptionCourtesy: score,
		nursingCourtesy: score,
		respectShown: score
	};
	data.careQuality = {
		involvementInDecisions: score,
		treatmentPlanExplanation: score,
		confidenceInCare: score
	};
	data.environment = {
		cleanliness: score,
		waitingAreaComfort: score,
		privacy: score
	};
	data.overallSatisfaction = {
		overallRating: score,
		likelyToRecommend: score,
		likelyToReturn: score,
		comments: ''
	};
	return data;
}

describe('Satisfaction Grading Engine', () => {
	it('returns 0 score and "No responses" when no questions are answered', () => {
		const data = createDefaultPatient();
		const result = calculateSatisfaction(data);
		expect(result.compositeScore).toBe(0);
		expect(result.category).toBe('No responses');
		expect(result.answeredCount).toBe(0);
		expect(result.domainScores).toHaveLength(0);
	});

	it('returns Excellent (5.0) when all questions scored 5', () => {
		const data = createAllScoredPatient(5);
		const result = calculateSatisfaction(data);
		expect(result.compositeScore).toBe(5.0);
		expect(result.category).toBe('Excellent');
		expect(result.answeredCount).toBe(19);
	});

	it('returns Good (4.0) when all questions scored 4', () => {
		const data = createAllScoredPatient(4);
		const result = calculateSatisfaction(data);
		expect(result.compositeScore).toBe(4.0);
		expect(result.category).toBe('Good');
	});

	it('returns Fair (3.0) when all questions scored 3', () => {
		const data = createAllScoredPatient(3);
		const result = calculateSatisfaction(data);
		expect(result.compositeScore).toBe(3.0);
		expect(result.category).toBe('Fair');
	});

	it('returns Poor (2.0) when all questions scored 2', () => {
		const data = createAllScoredPatient(2);
		const result = calculateSatisfaction(data);
		expect(result.compositeScore).toBe(2.0);
		expect(result.category).toBe('Poor');
	});

	it('returns Very Poor (1.0) when all questions scored 1', () => {
		const data = createAllScoredPatient(1);
		const result = calculateSatisfaction(data);
		expect(result.compositeScore).toBe(1.0);
		expect(result.category).toBe('Very Poor');
	});

	it('calculates correct mean for mixed scores', () => {
		const data = createDefaultPatient();
		data.accessScheduling.easeOfScheduling = 5;
		data.accessScheduling.waitForAppointment = 3;
		data.communication.listening = 4;
		// Mean = (5 + 3 + 4) / 3 = 4.0
		const result = calculateSatisfaction(data);
		expect(result.compositeScore).toBe(4.0);
		expect(result.category).toBe('Good');
		expect(result.answeredCount).toBe(3);
	});

	it('returns correct domain breakdowns', () => {
		const data = createAllScoredPatient(4);
		const result = calculateSatisfaction(data);
		expect(result.domainScores).toHaveLength(6);

		const accessDomain = result.domainScores.find((d) => d.domain === 'Access & Scheduling');
		expect(accessDomain).toBeDefined();
		expect(accessDomain!.mean).toBe(4.0);
		expect(accessDomain!.count).toBe(3);

		const commDomain = result.domainScores.find((d) => d.domain === 'Communication');
		expect(commDomain).toBeDefined();
		expect(commDomain!.mean).toBe(4.0);
		expect(commDomain!.count).toBe(4);
	});

	it('handles partially answered domains', () => {
		const data = createDefaultPatient();
		data.accessScheduling.easeOfScheduling = 5;
		// Other access fields null
		data.communication.listening = 3;
		data.communication.timeSpent = 4;
		// Other communication fields null

		const result = calculateSatisfaction(data);
		expect(result.answeredCount).toBe(3);

		const accessDomain = result.domainScores.find((d) => d.domain === 'Access & Scheduling');
		expect(accessDomain!.mean).toBe(5.0);
		expect(accessDomain!.count).toBe(1);
	});

	it('detects all question IDs are unique', () => {
		const ids = satisfactionQuestions.map((q) => q.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('has exactly 19 questions across 6 domains', () => {
		expect(satisfactionQuestions).toHaveLength(19);
		const domains = new Set(satisfactionQuestions.map((q) => q.domain));
		expect(domains.size).toBe(6);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for a fully satisfied patient', () => {
		const data = createAllScoredPatient(5);
		const flags = detectAdditionalFlags(data, 5.0);
		expect(flags).toHaveLength(0);
	});

	it('flags Very Dissatisfied responses (score=1) as high priority', () => {
		const data = createAllScoredPatient(5);
		data.environment.cleanliness = 1;
		const flags = detectAdditionalFlags(data, 4.79);
		expect(flags.some((f) => f.id === 'FLAG-VDIS-cleanliness')).toBe(true);
		expect(flags.find((f) => f.id === 'FLAG-VDIS-cleanliness')!.priority).toBe('high');
	});

	it('flags communication scores ≤ 2 as high priority', () => {
		const data = createAllScoredPatient(5);
		data.communication.listening = 2;
		const flags = detectAdditionalFlags(data, 4.84);
		expect(flags.some((f) => f.id === 'FLAG-COMM-listening')).toBe(true);
		expect(flags.find((f) => f.id === 'FLAG-COMM-listening')!.priority).toBe('high');
	});

	it('flags non-communication Dissatisfied (score=2) as medium priority', () => {
		const data = createAllScoredPatient(5);
		data.environment.privacy = 2;
		const flags = detectAdditionalFlags(data, 4.84);
		expect(flags.some((f) => f.id === 'FLAG-DIS-privacy')).toBe(true);
		expect(flags.find((f) => f.id === 'FLAG-DIS-privacy')!.priority).toBe('medium');
	});

	it('flags poor overall satisfaction (mean ≤ 2.4) as medium priority', () => {
		const data = createAllScoredPatient(2);
		const flags = detectAdditionalFlags(data, 2.0);
		expect(flags.some((f) => f.id === 'FLAG-POOR-OVERALL')).toBe(true);
		expect(flags.find((f) => f.id === 'FLAG-POOR-OVERALL')!.priority).toBe('medium');
	});

	it('flags first-time patient with fair satisfaction as low priority', () => {
		const data = createAllScoredPatient(3);
		data.visitInformation.firstVisit = 'yes';
		const flags = detectAdditionalFlags(data, 3.0);
		expect(flags.some((f) => f.id === 'FLAG-FIRST-VISIT-FAIR')).toBe(true);
		expect(flags.find((f) => f.id === 'FLAG-FIRST-VISIT-FAIR')!.priority).toBe('low');
	});

	it('does not flag first-time patient with good satisfaction', () => {
		const data = createAllScoredPatient(4);
		data.visitInformation.firstVisit = 'yes';
		const flags = detectAdditionalFlags(data, 4.0);
		expect(flags.some((f) => f.id === 'FLAG-FIRST-VISIT-FAIR')).toBe(false);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createAllScoredPatient(2);
		data.communication.listening = 1;
		data.visitInformation.firstVisit = 'yes';
		const flags = detectAdditionalFlags(data, 1.95);

		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
