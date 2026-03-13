import { describe, it, expect } from 'vitest';
import { calculateIPSS } from './ipss-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { ipssQuestions } from './ipss-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'James',
			lastName: 'Wilson',
			dateOfBirth: '1960-03-15',
			sex: 'male'
		},
		chiefComplaint: {
			primaryConcern: 'Routine prostate check',
			duration: 'N/A',
			urgency: 'routine'
		},
		ipssQuestionnaire: {
			q1: 0, q2: 0, q3: 0, q4: 0, q5: 0,
			q6: 0, q7: 0
		},
		qualityOfLife: {
			qolScore: 0,
			qolImpact: ''
		},
		urinarySymptoms: {
			frequency: 'no',
			urgency: 'no',
			nocturia: 'no',
			hesitancy: 'no',
			stream: 'normal',
			straining: 'no',
			hematuria: 'no',
			dysuria: 'no',
			incontinence: 'none'
		},
		renalFunction: {
			creatinine: null,
			eGFR: null,
			urinalysis: '',
			psa: null,
			psaDate: ''
		},
		sexualHealth: {
			erectileDysfunction: 'no',
			libidoChanges: 'no',
			ejaculatoryProblems: 'no'
		},
		medicalHistory: {
			previousUrologicConditions: '',
			surgicalHistory: '',
			diabetes: 'no',
			hypertension: 'no',
			neurologicConditions: 'no',
			neurologicConditionDetails: ''
		},
		currentMedications: {
			alphaBlockers: [],
			fiveAlphaReductaseInhibitors: [],
			anticholinergics: [],
			otherMedications: []
		},
		familyHistory: {
			prostateCancer: 'no',
			bladderCancer: 'no',
			kidneyDisease: 'no',
			otherDetails: ''
		}
	};
}

describe('IPSS Grading Engine', () => {
	it('returns IPSS 0 for a patient with no symptoms', () => {
		const data = createHealthyPatient();
		const result = calculateIPSS(data);
		expect(result.ipssScore).toBe(0);
		expect(result.ipssCategoryLabel).toBe('Mild');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns Mild (0-7) for minor symptoms', () => {
		const data = createHealthyPatient();
		data.ipssQuestionnaire.q1 = 2;
		data.ipssQuestionnaire.q2 = 1;

		const result = calculateIPSS(data);
		expect(result.ipssScore).toBe(3);
		expect(result.ipssCategoryLabel).toBe('Mild');
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns Moderate (8-19) for moderate symptoms', () => {
		const data = createHealthyPatient();
		data.ipssQuestionnaire.q1 = 3;
		data.ipssQuestionnaire.q2 = 2;
		data.ipssQuestionnaire.q3 = 2;
		data.ipssQuestionnaire.q5 = 3;

		const result = calculateIPSS(data);
		expect(result.ipssScore).toBe(10);
		expect(result.ipssCategoryLabel).toBe('Moderate');
	});

	it('returns Severe (20-35) for severe symptoms', () => {
		const data = createHealthyPatient();
		data.ipssQuestionnaire.q1 = 4;
		data.ipssQuestionnaire.q2 = 4;
		data.ipssQuestionnaire.q3 = 3;
		data.ipssQuestionnaire.q4 = 3;
		data.ipssQuestionnaire.q5 = 4;
		data.ipssQuestionnaire.q6 = 3;
		data.ipssQuestionnaire.q7 = 3;

		const result = calculateIPSS(data);
		expect(result.ipssScore).toBe(24);
		expect(result.ipssCategoryLabel).toBe('Severe');
	});

	it('returns maximum score of 35 for worst case', () => {
		const data = createHealthyPatient();
		data.ipssQuestionnaire.q1 = 5;
		data.ipssQuestionnaire.q2 = 5;
		data.ipssQuestionnaire.q3 = 5;
		data.ipssQuestionnaire.q4 = 5;
		data.ipssQuestionnaire.q5 = 5;
		data.ipssQuestionnaire.q6 = 5;
		data.ipssQuestionnaire.q7 = 5;

		const result = calculateIPSS(data);
		expect(result.ipssScore).toBe(35);
		expect(result.ipssCategoryLabel).toBe('Severe');
	});

	it('detects all question IDs are unique', () => {
		const ids = ipssQuestions.map((q) => q.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('handles null scores gracefully (unanswered questions)', () => {
		const data = createHealthyPatient();
		data.ipssQuestionnaire.q1 = 2;
		data.ipssQuestionnaire.q2 = null;
		data.ipssQuestionnaire.q3 = 1;

		const result = calculateIPSS(data);
		expect(result.ipssScore).toBe(3);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags hematuria', () => {
		const data = createHealthyPatient();
		data.urinarySymptoms.hematuria = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-HEMATURIA-001')).toBe(true);
	});

	it('flags elevated PSA', () => {
		const data = createHealthyPatient();
		data.renalFunction.psa = 6.5;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PSA-001')).toBe(true);
	});

	it('flags renal impairment', () => {
		const data = createHealthyPatient();
		data.renalFunction.eGFR = 45;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-RENAL-001')).toBe(true);
	});

	it('flags urinary retention', () => {
		const data = createHealthyPatient();
		data.urinarySymptoms.straining = 'yes';
		data.urinarySymptoms.stream = 'weak';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-RETENTION-001')).toBe(true);
	});

	it('flags family history of prostate cancer', () => {
		const data = createHealthyPatient();
		data.familyHistory.prostateCancer = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-FAMILY-PC-001')).toBe(true);
	});

	it('flags recurrent UTI', () => {
		const data = createHealthyPatient();
		data.urinarySymptoms.dysuria = 'yes';
		data.urinarySymptoms.frequency = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-UTI-001')).toBe(true);
	});

	it('flags medication interactions', () => {
		const data = createHealthyPatient();
		data.currentMedications.alphaBlockers = [{ name: 'Tamsulosin', dose: '0.4mg', frequency: 'daily' }];
		data.currentMedications.fiveAlphaReductaseInhibitors = [{ name: 'Finasteride', dose: '5mg', frequency: 'daily' }];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-MED-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.urinarySymptoms.hematuria = 'yes';
		data.familyHistory.bladderCancer = 'yes';
		data.medicalHistory.neurologicConditions = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
