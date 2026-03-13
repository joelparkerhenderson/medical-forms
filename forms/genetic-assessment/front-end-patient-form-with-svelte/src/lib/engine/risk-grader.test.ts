import { describe, it, expect } from 'vitest';
import { calculateRisk } from './risk-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { riskRules } from './risk-rules';
import type { AssessmentData } from './types';

function createDefaultFamilyMember() {
	return {
		conditions: '',
		cancers: '',
		ageAtDiagnosis: '',
		deceased: '' as const,
		ageAtDeath: ''
	};
}

function createLowRiskPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1985-06-15',
			sex: 'female'
		},
		referralInformation: {
			referralReason: 'Routine screening',
			referringClinician: 'Dr. Wilson',
			urgency: 'routine'
		},
		personalMedicalHistory: {
			birthDefects: 'no',
			birthDefectsDetails: '',
			developmentalDelay: 'no',
			developmentalDelayDetails: '',
			intellectualDisability: 'no',
			intellectualDisabilityDetails: '',
			multipleAnomalies: 'no',
			multipleAnomaliesDetails: '',
			chromosomalCondition: 'no',
			chromosomalConditionDetails: '',
			knownGeneticCondition: 'no',
			knownGeneticConditionDetails: ''
		},
		cancerHistory: {
			personalCancerHistory: 'no',
			cancerType: '',
			ageAtDiagnosis: null,
			multiplePrimaryCancers: 'no'
		},
		familyPedigree: {
			maternalGrandmother: createDefaultFamilyMember(),
			maternalGrandfather: createDefaultFamilyMember(),
			paternalGrandmother: createDefaultFamilyMember(),
			paternalGrandfather: createDefaultFamilyMember(),
			mother: createDefaultFamilyMember(),
			father: createDefaultFamilyMember(),
			siblings: '',
			children: ''
		},
		cardiovascularGenetics: {
			familialHypercholesterolemia: 'no',
			cardiomyopathy: 'no',
			aorticAneurysm: 'no',
			suddenCardiacDeath: 'no',
			earlyOnsetCVD: 'no',
			cardiovascularDetails: ''
		},
		neurogenetics: {
			huntington: 'no',
			alzheimersEarly: 'no',
			parkinson: 'no',
			muscularDystrophy: 'no',
			spinocerebellarAtaxia: 'no',
			neurologicalDetails: ''
		},
		reproductiveGenetics: {
			recurrentMiscarriages: 'no',
			infertility: 'no',
			previousAffectedChild: 'no',
			previousAffectedChildDetails: '',
			consanguinity: 'no',
			carrierStatus: 'no',
			carrierStatusDetails: ''
		},
		ethnicBackground: {
			ethnicity: 'European',
			ashkenaziJewish: 'no',
			consanguinity: 'no',
			consanguinityDetails: ''
		},
		geneticTestingHistory: {
			previousGeneticTests: 'no',
			previousGeneticTestsDetails: '',
			testResults: '',
			geneticCounseling: 'no',
			variantsOfUncertainSignificance: 'no',
			variantsOfUncertainSignificanceDetails: ''
		}
	};
}

describe('Genetic Risk Grading Engine', () => {
	it('returns Low risk for a patient with no risk factors', () => {
		const data = createLowRiskPatient();
		const result = calculateRisk(data);
		expect(result.riskScore).toBe(0);
		expect(result.riskLevel).toBe('Low');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns Moderate risk (3-5) for moderate risk factors', () => {
		const data = createLowRiskPatient();
		data.personalMedicalHistory.birthDefects = 'yes';
		data.personalMedicalHistory.developmentalDelay = 'yes';

		const result = calculateRisk(data);
		expect(result.riskScore).toBe(4);
		expect(result.riskLevel).toBe('Moderate');
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns High risk (6+) for multiple significant risk factors', () => {
		const data = createLowRiskPatient();
		data.personalMedicalHistory.knownGeneticCondition = 'yes';
		data.cancerHistory.personalCancerHistory = 'yes';
		data.cancerHistory.ageAtDiagnosis = 35;

		const result = calculateRisk(data);
		expect(result.riskScore).toBeGreaterThanOrEqual(6);
		expect(result.riskLevel).toBe('High');
	});

	it('flags early onset cancer correctly', () => {
		const data = createLowRiskPatient();
		data.cancerHistory.personalCancerHistory = 'yes';
		data.cancerHistory.ageAtDiagnosis = 30;

		const result = calculateRisk(data);
		expect(result.firedRules.some((r) => r.id === 'RISK-CANCER-002')).toBe(true);
	});

	it('does not flag early onset cancer when age >= 50', () => {
		const data = createLowRiskPatient();
		data.cancerHistory.personalCancerHistory = 'yes';
		data.cancerHistory.ageAtDiagnosis = 55;

		const result = calculateRisk(data);
		expect(result.firedRules.some((r) => r.id === 'RISK-CANCER-002')).toBe(false);
	});

	it('detects consanguinity from either reproductive or ethnic section', () => {
		const data = createLowRiskPatient();
		data.ethnicBackground.consanguinity = 'yes';

		const result = calculateRisk(data);
		expect(result.firedRules.some((r) => r.id === 'RISK-CONSANG-001')).toBe(true);
	});

	it('detects all rule IDs are unique', () => {
		const ids = riskRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('detects family cancer cluster', () => {
		const data = createLowRiskPatient();
		data.familyPedigree.mother.cancers = 'Breast cancer';
		data.familyPedigree.maternalGrandmother.cancers = 'Ovarian cancer';

		const result = calculateRisk(data);
		expect(result.firedRules.some((r) => r.id === 'RISK-FAMILY-001')).toBe(true);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for low risk patient', () => {
		const data = createLowRiskPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags consanguinity', () => {
		const data = createLowRiskPatient();
		data.reproductiveGenetics.consanguinity = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CONSANG-001')).toBe(true);
	});

	it('flags early onset cancer', () => {
		const data = createLowRiskPatient();
		data.cancerHistory.personalCancerHistory = 'yes';
		data.cancerHistory.ageAtDiagnosis = 25;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-EARLY-CANCER-001')).toBe(true);
	});

	it('flags sudden cardiac death', () => {
		const data = createLowRiskPatient();
		data.cardiovascularGenetics.suddenCardiacDeath = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SCD-001')).toBe(true);
	});

	it('flags Huntington disease', () => {
		const data = createLowRiskPatient();
		data.neurogenetics.huntington = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-HUNTINGTON-001')).toBe(true);
	});

	it('flags known genetic condition', () => {
		const data = createLowRiskPatient();
		data.personalMedicalHistory.knownGeneticCondition = 'yes';
		data.personalMedicalHistory.knownGeneticConditionDetails = 'BRCA1 pathogenic variant';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PATHOGENIC-001')).toBe(true);
	});

	it('flags recurrent miscarriages', () => {
		const data = createLowRiskPatient();
		data.reproductiveGenetics.recurrentMiscarriages = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-MISCARRIAGE-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createLowRiskPatient();
		data.cardiovascularGenetics.suddenCardiacDeath = 'yes';
		data.reproductiveGenetics.recurrentMiscarriages = 'yes';
		data.personalMedicalHistory.knownGeneticCondition = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
