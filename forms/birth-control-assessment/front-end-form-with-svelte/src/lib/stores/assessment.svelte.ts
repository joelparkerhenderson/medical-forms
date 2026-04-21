import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: '',
			weight: null,
			height: null,
			bmi: null
		},
		menstrualHistory: {
			menarcheAge: null,
			cycleRegularity: '',
			cycleLengthDays: null,
			periodDurationDays: null,
			flowHeaviness: '',
			intermenstrualBleeding: '',
			postcoitalBleeding: '',
			dysmenorrhoea: '',
			lastMenstrualPeriod: '',
			amenorrhoea: '',
			amenorrhoeaDurationMonths: null
		},
		contraceptiveHistory: {
			previousContraception: '',
			previousCOC: '',
			cocDetails: '',
			previousPOP: '',
			popDetails: '',
			previousImplant: '',
			implantDetails: '',
			previousInjection: '',
			injectionDetails: '',
			previousIUD: '',
			iudDetails: '',
			previousIUS: '',
			iusDetails: '',
			previousPatchRing: '',
			patchRingDetails: '',
			previousBarrier: '',
			reasonForChange: '',
			adverseEffects: ''
		},
		medicalHistory: {
			migraine: '',
			migraineWithAura: '',
			migraineFrequency: '',
			breastCancer: 'no',
			cervicalCancer: '',
			liverDisease: 'no',
			gallbladderDisease: '',
			inflammatoryBowelDisease: '',
			sle: '',
			sleAntiphospholipid: '',
			epilepsy: '',
			diabetes: 'no',
			diabetesComplications: '',
			sti: '',
			stiDetails: '',
			pid: ''
		},
		cardiovascularRisk: {
			hypertension: '',
			systolicBP: null,
			diastolicBP: null,
			bpControlled: '',
			ischaemicHeartDisease: '',
			strokeHistory: '',
			valvularHeartDisease: '',
			valvularComplications: '',
			hyperlipidaemia: '',
			familyHistoryVTE: '',
			familyHistoryCVD: '',
			familyCVDDetails: ''
		},
		thromboembolismRisk: {
			previousDVT: '',
			dvtDetails: '',
			previousPE: '',
			peDetails: '',
			knownThrombophilia: '',
			thrombophiliaType: '',
			immobilityRisk: '',
			immobilityDetails: '',
			recentMajorSurgery: '',
			surgeryDetails: '',
			longHaulTravel: ''
		},
		currentMedications: {
			enzymeInducingDrugs: '',
			enzymeInducingDetails: '',
			anticoagulants: '',
			anticoagulantDetails: '',
			antiepileptics: '',
			antiepilepticDetails: '',
			antiretrovirals: '',
			antiretroviralDetails: '',
			antibiotics: '',
			antibioticDetails: '',
			ssriSnri: '',
			ssriSnriDetails: '',
			herbalRemedies: '',
			herbalDetails: '',
			otherMedications: '',
			drugAllergies: '',
			drugAllergyDetails: ''
		},
		lifestyleAssessment: {
			smoking: '',
			cigarettesPerDay: null,
			ageOver35Smoker: '',
			alcohol: '',
			alcoholUnitsPerWeek: null,
			recreationalDrugUse: '',
			recreationalDrugDetails: '',
			exerciseFrequency: '',
			sexualActivity: '',
			numberOfPartners: ''
		},
		contraceptivePreferences: {
			preferredMethod: '',
			hormonalAcceptable: '',
			longActingAcceptable: '',
			dailyPillAcceptable: '',
			intrauterineAcceptable: '',
			fertilityPlans: '',
			breastfeeding: '',
			postpartumWeeks: null,
			concerns: ''
		},
		clinicalRecommendation: {
			clinicalNotes: ''
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
