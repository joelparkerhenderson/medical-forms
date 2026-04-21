import { describe, it, expect } from 'vitest';
import { calculateGold } from './gold-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { goldRules } from './gold-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'John',
			lastName: 'Doe',
			dateOfBirth: '1960-01-01',
			sex: 'male',
			weight: 75,
			height: 175,
			bmi: 24.5
		},
		chiefComplaint: {
			primarySymptom: '',
			symptomDuration: '',
			dyspnoeaGradeMRC: ''
		},
		spirometry: {
			fev1: null,
			fvc: null,
			fev1FvcRatio: null,
			fev1PercentPredicted: null,
			bronchodilatorResponse: ''
		},
		symptomAssessment: {
			catScore: null,
			mmrcDyspnoea: '',
			coughFrequency: '',
			sputumProduction: ''
		},
		exacerbationHistory: {
			exacerbationsPerYear: null,
			hospitalizationsPerYear: null,
			icuAdmissions: null,
			intubationHistory: ''
		},
		currentMedications: {
			saba: 'no',
			laba: 'no',
			lama: 'no',
			ics: 'no',
			oralCorticosteroids: 'no',
			oxygenTherapy: 'no',
			oxygenLitresPerMinute: null,
			nebulizers: 'no',
			otherMedications: []
		},
		allergies: [],
		comorbidities: {
			cardiovascularDisease: 'no',
			cardiovascularDetails: '',
			diabetes: 'no',
			osteoporosis: 'no',
			depression: 'no',
			lungCancer: 'no',
			lungCancerDetails: '',
			otherComorbidities: ''
		},
		smokingExposures: {
			smokingStatus: 'never',
			packYears: null,
			occupationalExposures: 'no',
			occupationalDetails: '',
			biomassFuelExposure: 'no'
		},
		functionalStatus: {
			exerciseTolerance: 'vigorous-exercise',
			sixMinuteWalkDistance: null,
			oxygenSaturationRest: 98,
			oxygenSaturationExertion: 96,
			adlLimitations: 'no',
			adlDetails: ''
		}
	};
}

describe('GOLD Grading Engine', () => {
	it('returns GOLD I for patient with no significant findings', () => {
		const data = createHealthyPatient();
		const result = calculateGold(data);
		expect(result.goldStage).toBe(1);
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns GOLD II for moderate airflow limitation', () => {
		const data = createHealthyPatient();
		data.spirometry.fev1PercentPredicted = 65;
		data.spirometry.fev1FvcRatio = 0.6;

		const result = calculateGold(data);
		expect(result.goldStage).toBe(2);
		expect(result.firedRules.some((r) => r.id === 'GOLD-002')).toBe(true);
	});

	it('returns GOLD III for severe airflow limitation with frequent exacerbations', () => {
		const data = createHealthyPatient();
		data.spirometry.fev1PercentPredicted = 40;
		data.spirometry.fev1FvcRatio = 0.55;
		data.exacerbationHistory.exacerbationsPerYear = 3;
		data.symptomAssessment.catScore = 22;

		const result = calculateGold(data);
		expect(result.goldStage).toBe(3);
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns GOLD IV for very severe disease with oxygen therapy', () => {
		const data = createHealthyPatient();
		data.spirometry.fev1PercentPredicted = 25;
		data.spirometry.fev1FvcRatio = 0.5;
		data.currentMedications.oxygenTherapy = 'yes';
		data.exacerbationHistory.icuAdmissions = 1;

		const result = calculateGold(data);
		expect(result.goldStage).toBe(4);
	});

	it('assigns ABCD Group E for frequent exacerbations', () => {
		const data = createHealthyPatient();
		data.exacerbationHistory.exacerbationsPerYear = 2;
		data.symptomAssessment.catScore = 15;

		const result = calculateGold(data);
		expect(result.abcdGroup).toBe('E');
	});

	it('assigns ABCD Group B for high symptoms without exacerbations', () => {
		const data = createHealthyPatient();
		data.symptomAssessment.catScore = 12;
		data.exacerbationHistory.exacerbationsPerYear = 0;

		const result = calculateGold(data);
		expect(result.abcdGroup).toBe('B');
	});

	it('assigns ABCD Group A for low symptoms without exacerbations', () => {
		const data = createHealthyPatient();
		data.symptomAssessment.catScore = 5;
		data.symptomAssessment.mmrcDyspnoea = '1';
		data.exacerbationHistory.exacerbationsPerYear = 0;

		const result = calculateGold(data);
		expect(result.abcdGroup).toBe('A');
	});

	it('detects all rule IDs are unique', () => {
		const ids = goldRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags very severe airflow limitation', () => {
		const data = createHealthyPatient();
		data.spirometry.fev1PercentPredicted = 25;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SPIRO-001')).toBe(true);
	});

	it('flags resting desaturation', () => {
		const data = createHealthyPatient();
		data.functionalStatus.oxygenSaturationRest = 89;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-O2-001')).toBe(true);
	});

	it('flags intubation history', () => {
		const data = createHealthyPatient();
		data.exacerbationHistory.intubationHistory = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-INTUB-001')).toBe(true);
	});

	it('flags current smoker', () => {
		const data = createHealthyPatient();
		data.smokingExposures.smokingStatus = 'current';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SMOKE-001')).toBe(true);
	});

	it('flags anaphylaxis allergy', () => {
		const data = createHealthyPatient();
		data.allergies = [{ allergen: 'Penicillin', reaction: 'Rash and swelling', severity: 'anaphylaxis' }];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Allergy' && f.priority === 'high')).toBe(true);
	});

	it('flags lung cancer', () => {
		const data = createHealthyPatient();
		data.comorbidities.lungCancer = 'yes';
		data.comorbidities.lungCancerDetails = 'Stage IIA NSCLC';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CANCER-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.smokingExposures.smokingStatus = 'current';
		data.smokingExposures.occupationalExposures = 'yes';
		data.comorbidities.osteoporosis = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
