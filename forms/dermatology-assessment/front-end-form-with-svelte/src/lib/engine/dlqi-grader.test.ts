import { describe, it, expect } from 'vitest';
import { calculateDLQI } from './dlqi-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { dlqiQuestions } from './dlqi-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1985-06-15',
			sex: 'female',
			skinType: 'III'
		},
		chiefComplaint: {
			primaryConcern: 'Mild rash on arm',
			duration: '2 weeks',
			location: 'Left forearm',
			progression: 'stable',
			previousTreatments: 'None'
		},
		dlqiQuestionnaire: {
			q1: 0, q2: 0, q3: 0, q4: 0, q5: 0,
			q6: 0, q7: 0, q8: 0, q9: 0, q10: 0
		},
		lesionCharacteristics: {
			type: 'macule',
			color: 'erythematous',
			border: 'well-defined',
			sizeMillimeters: 3,
			distribution: 'localized',
			number: 'single',
			surface: 'smooth'
		},
		medicalHistory: {
			previousSkinConditions: '',
			autoimmuneDiseases: 'no',
			autoimmuneDiseaseDetails: '',
			immunosuppression: 'no',
			immunosuppressionDetails: '',
			cancerHistory: 'no',
			cancerHistoryDetails: ''
		},
		currentMedications: {
			topicals: [],
			systemics: [],
			biologics: [],
			otcProducts: ''
		},
		allergies: {
			drugAllergies: [],
			contactAllergies: '',
			latexAllergy: 'no'
		},
		familyHistory: {
			psoriasis: 'no',
			eczema: 'no',
			melanoma: 'no',
			skinCancer: 'no',
			autoimmune: 'no',
			otherDetails: ''
		},
		socialHistory: {
			sunExposure: 'minimal',
			tanningHistory: 'never',
			occupation: 'Office worker',
			cosmeticsUse: ''
		}
	};
}

describe('DLQI Grading Engine', () => {
	it('returns DLQI 0 for a patient with no quality of life impact', () => {
		const data = createHealthyPatient();
		const result = calculateDLQI(data);
		expect(result.dlqiScore).toBe(0);
		expect(result.dlqiCategoryLabel).toBe('No effect on life');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns Small effect (2-5) for minor symptoms', () => {
		const data = createHealthyPatient();
		data.dlqiQuestionnaire.q1 = 2;
		data.dlqiQuestionnaire.q2 = 1;

		const result = calculateDLQI(data);
		expect(result.dlqiScore).toBe(3);
		expect(result.dlqiCategoryLabel).toBe('Small effect');
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns Moderate effect (6-10) for moderate symptoms', () => {
		const data = createHealthyPatient();
		data.dlqiQuestionnaire.q1 = 3;
		data.dlqiQuestionnaire.q2 = 2;
		data.dlqiQuestionnaire.q3 = 2;
		data.dlqiQuestionnaire.q5 = 1;

		const result = calculateDLQI(data);
		expect(result.dlqiScore).toBe(8);
		expect(result.dlqiCategoryLabel).toBe('Moderate effect');
	});

	it('returns Very large effect (11-20) for severe impact', () => {
		const data = createHealthyPatient();
		data.dlqiQuestionnaire.q1 = 3;
		data.dlqiQuestionnaire.q2 = 3;
		data.dlqiQuestionnaire.q3 = 2;
		data.dlqiQuestionnaire.q4 = 2;
		data.dlqiQuestionnaire.q5 = 3;
		data.dlqiQuestionnaire.q7 = 2;

		const result = calculateDLQI(data);
		expect(result.dlqiScore).toBe(15);
		expect(result.dlqiCategoryLabel).toBe('Very large effect');
	});

	it('returns Extremely large effect (21-30) for maximum impact', () => {
		const data = createHealthyPatient();
		data.dlqiQuestionnaire.q1 = 3;
		data.dlqiQuestionnaire.q2 = 3;
		data.dlqiQuestionnaire.q3 = 3;
		data.dlqiQuestionnaire.q4 = 3;
		data.dlqiQuestionnaire.q5 = 3;
		data.dlqiQuestionnaire.q6 = 3;
		data.dlqiQuestionnaire.q7 = 3;
		data.dlqiQuestionnaire.q8 = 3;
		data.dlqiQuestionnaire.q9 = 3;
		data.dlqiQuestionnaire.q10 = 3;

		const result = calculateDLQI(data);
		expect(result.dlqiScore).toBe(30);
		expect(result.dlqiCategoryLabel).toBe('Extremely large effect');
	});

	it('detects all question IDs are unique', () => {
		const ids = dlqiQuestions.map((q) => q.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('handles null scores gracefully (unanswered questions)', () => {
		const data = createHealthyPatient();
		data.dlqiQuestionnaire.q1 = 2;
		data.dlqiQuestionnaire.q2 = null;
		data.dlqiQuestionnaire.q3 = 1;

		const result = calculateDLQI(data);
		expect(result.dlqiScore).toBe(3);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags suspected melanoma (irregular border + hyperpigmented)', () => {
		const data = createHealthyPatient();
		data.lesionCharacteristics.border = 'irregular';
		data.lesionCharacteristics.color = 'hyperpigmented';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-MELANOMA-001')).toBe(true);
	});

	it('flags rapidly changing lesion', () => {
		const data = createHealthyPatient();
		data.chiefComplaint.progression = 'worsening';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CHANGE-001')).toBe(true);
	});

	it('flags immunosuppressed patient', () => {
		const data = createHealthyPatient();
		data.medicalHistory.immunosuppression = 'yes';
		data.medicalHistory.immunosuppressionDetails = 'Post-transplant medication';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-IMMUNO-001')).toBe(true);
	});

	it('flags latex allergy', () => {
		const data = createHealthyPatient();
		data.allergies.latexAllergy = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-LATEX-001')).toBe(true);
	});

	it('flags family history of melanoma', () => {
		const data = createHealthyPatient();
		data.familyHistory.melanoma = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-FAMILY-MEL-001')).toBe(true);
	});

	it('flags anaphylaxis allergy', () => {
		const data = createHealthyPatient();
		data.allergies.drugAllergies = [{ allergen: 'Sulfonamide', reaction: 'Rash and swelling', severity: 'anaphylaxis' }];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Allergy' && f.priority === 'high')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.chiefComplaint.progression = 'worsening';
		data.medicalHistory.cancerHistory = 'yes';
		data.medicalHistory.immunosuppression = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
