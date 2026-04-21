import { describe, it, expect } from 'vitest';
import { calculateAQ10 } from './aq10-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { aq10Questions } from './aq10-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Alex',
			lastName: 'Thompson',
			dateOfBirth: '1995-03-20',
			sex: 'male',
			ageGroup: 'adult'
		},
		screeningPurpose: {
			referralSource: 'gp',
			referralSourceOther: '',
			reasonForScreening: 'General screening',
			previousAssessments: 'no',
			previousAssessmentDetails: ''
		},
		aq10Questionnaire: {
			q1: 0, q2: 0, q3: 0, q4: 0, q5: 0,
			q6: 0, q7: 0, q8: 0, q9: 0, q10: 0
		},
		socialCommunication: {
			eyeContact: 'often',
			socialReciprocity: 'often',
			conversationSkills: 'often',
			friendshipPatterns: 'Multiple close friendships',
			socialDifficultiesDetails: ''
		},
		repetitiveBehaviors: {
			routineAdherence: 'sometimes',
			specialInterests: '',
			repetitiveMovements: 'no',
			repetitiveMovementsDetails: '',
			resistanceToChange: 'rarely'
		},
		sensoryProfile: {
			visualSensitivity: 'none',
			auditorySensitivity: 'none',
			tactileSensitivity: 'none',
			olfactorySensitivity: 'none',
			gustatorySensitivity: 'none',
			sensorySeekingBehaviors: ''
		},
		developmentalHistory: {
			languageMilestones: 'On time',
			motorMilestones: 'On time',
			earlySocialBehavior: 'Typical',
			developmentalConcerns: ''
		},
		currentSupport: {
			currentAccommodations: '',
			currentTherapies: [],
			educationalSupport: '',
			medications: []
		},
		familyHistory: {
			autismFamily: 'no',
			autismFamilyDetails: '',
			adhdFamily: 'no',
			adhdFamilyDetails: '',
			learningDisabilities: 'no',
			learningDisabilitiesDetails: '',
			mentalHealthFamily: 'no',
			mentalHealthFamilyDetails: ''
		}
	};
}

describe('AQ-10 Grading Engine', () => {
	it('returns AQ-10 score 0 for a patient with no autistic traits', () => {
		const data = createHealthyPatient();
		const result = calculateAQ10(data);
		expect(result.aq10Score).toBe(0);
		expect(result.aq10CategoryLabel).toBe('Below threshold');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns Below threshold (0-5) for mild traits', () => {
		const data = createHealthyPatient();
		data.aq10Questionnaire.q1 = 1;
		data.aq10Questionnaire.q7 = 1;
		data.aq10Questionnaire.q8 = 1;

		const result = calculateAQ10(data);
		expect(result.aq10Score).toBe(3);
		expect(result.aq10CategoryLabel).toBe('Below threshold');
		expect(result.firedRules.length).toBeGreaterThanOrEqual(3);
	});

	it('returns At or above threshold (6-10) for significant traits', () => {
		const data = createHealthyPatient();
		data.aq10Questionnaire.q1 = 1;
		data.aq10Questionnaire.q2 = 1;
		data.aq10Questionnaire.q3 = 1;
		data.aq10Questionnaire.q5 = 1;
		data.aq10Questionnaire.q7 = 1;
		data.aq10Questionnaire.q10 = 1;

		const result = calculateAQ10(data);
		expect(result.aq10Score).toBe(6);
		expect(result.aq10CategoryLabel).toBe('At or above threshold');
	});

	it('returns maximum score of 10 when all questions score 1', () => {
		const data = createHealthyPatient();
		data.aq10Questionnaire.q1 = 1;
		data.aq10Questionnaire.q2 = 1;
		data.aq10Questionnaire.q3 = 1;
		data.aq10Questionnaire.q4 = 1;
		data.aq10Questionnaire.q5 = 1;
		data.aq10Questionnaire.q6 = 1;
		data.aq10Questionnaire.q7 = 1;
		data.aq10Questionnaire.q8 = 1;
		data.aq10Questionnaire.q9 = 1;
		data.aq10Questionnaire.q10 = 1;

		const result = calculateAQ10(data);
		expect(result.aq10Score).toBe(10);
		expect(result.aq10CategoryLabel).toBe('At or above threshold');
	});

	it('detects all question IDs are unique', () => {
		const ids = aq10Questions.map((q) => q.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('handles null scores gracefully (unanswered questions)', () => {
		const data = createHealthyPatient();
		data.aq10Questionnaire.q1 = 1;
		data.aq10Questionnaire.q2 = null;
		data.aq10Questionnaire.q3 = 1;

		const result = calculateAQ10(data);
		expect(result.aq10Score).toBe(2);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags high AQ-10 score (>=6)', () => {
		const data = createHealthyPatient();
		data.aq10Questionnaire.q1 = 1;
		data.aq10Questionnaire.q2 = 1;
		data.aq10Questionnaire.q3 = 1;
		data.aq10Questionnaire.q5 = 1;
		data.aq10Questionnaire.q7 = 1;
		data.aq10Questionnaire.q10 = 1;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-AQ10-HIGH-001')).toBe(true);
	});

	it('flags severe sensory issues', () => {
		const data = createHealthyPatient();
		data.sensoryProfile.auditorySensitivity = 'severe';
		data.sensoryProfile.tactileSensitivity = 'severe';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SENSORY-001')).toBe(true);
	});

	it('flags eye contact difficulties', () => {
		const data = createHealthyPatient();
		data.socialCommunication.eyeContact = 'never';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SOCIAL-001')).toBe(true);
	});

	it('flags family history of autism', () => {
		const data = createHealthyPatient();
		data.familyHistory.autismFamily = 'yes';
		data.familyHistory.autismFamilyDetails = 'Sibling diagnosed at age 5';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-FAMILY-ASD-001')).toBe(true);
	});

	it('flags repetitive movements', () => {
		const data = createHealthyPatient();
		data.repetitiveBehaviors.repetitiveMovements = 'yes';
		data.repetitiveBehaviors.repetitiveMovementsDetails = 'Hand flapping';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-REPETITIVE-001')).toBe(true);
	});

	it('flags language developmental delays', () => {
		const data = createHealthyPatient();
		data.developmentalHistory.languageMilestones = 'Delayed first words at 24 months';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-DEV-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.aq10Questionnaire.q1 = 1;
		data.aq10Questionnaire.q2 = 1;
		data.aq10Questionnaire.q3 = 1;
		data.aq10Questionnaire.q5 = 1;
		data.aq10Questionnaire.q7 = 1;
		data.aq10Questionnaire.q10 = 1;
		data.familyHistory.adhdFamily = 'yes';
		data.familyHistory.learningDisabilities = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
