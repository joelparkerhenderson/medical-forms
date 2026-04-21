import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultFamilyMember() {
	return {
		conditions: '',
		cancers: '',
		ageAtDiagnosis: '',
		deceased: '' as const,
		ageAtDeath: ''
	};
}

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: ''
		},
		referralInformation: {
			referralReason: '',
			referringClinician: '',
			urgency: ''
		},
		personalMedicalHistory: {
			birthDefects: '',
			birthDefectsDetails: '',
			developmentalDelay: '',
			developmentalDelayDetails: '',
			intellectualDisability: '',
			intellectualDisabilityDetails: '',
			multipleAnomalies: '',
			multipleAnomaliesDetails: '',
			chromosomalCondition: '',
			chromosomalConditionDetails: '',
			knownGeneticCondition: '',
			knownGeneticConditionDetails: ''
		},
		cancerHistory: {
			personalCancerHistory: '',
			cancerType: '',
			ageAtDiagnosis: null,
			multiplePrimaryCancers: ''
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
			familialHypercholesterolemia: '',
			cardiomyopathy: '',
			aorticAneurysm: '',
			suddenCardiacDeath: '',
			earlyOnsetCVD: '',
			cardiovascularDetails: ''
		},
		neurogenetics: {
			huntington: '',
			alzheimersEarly: '',
			parkinson: '',
			muscularDystrophy: '',
			spinocerebellarAtaxia: '',
			neurologicalDetails: ''
		},
		reproductiveGenetics: {
			recurrentMiscarriages: '',
			infertility: '',
			previousAffectedChild: '',
			previousAffectedChildDetails: '',
			consanguinity: '',
			carrierStatus: '',
			carrierStatusDetails: ''
		},
		ethnicBackground: {
			ethnicity: '',
			ashkenaziJewish: '',
			consanguinity: '',
			consanguinityDetails: ''
		},
		geneticTestingHistory: {
			previousGeneticTests: '',
			previousGeneticTestsDetails: '',
			testResults: '',
			geneticCounseling: '',
			variantsOfUncertainSignificance: '',
			variantsOfUncertainSignificanceDetails: ''
		}
	};
}

class AssessmentStore {
	data = $state<AssessmentData>(createDefaultAssessment());
	result = $state<GradingResult | null>(null);
	currentStep = $state(1);

	reset() {
		this.data = createDefaultAssessment();
		this.result = null;
		this.currentStep = 1;
	}
}

export const assessment = new AssessmentStore();
