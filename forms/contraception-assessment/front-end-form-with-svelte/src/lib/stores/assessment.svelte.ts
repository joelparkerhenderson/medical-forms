import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: ''
		},
		reproductiveHistory: {
			gravida: null,
			para: null,
			lastDeliveryDate: '',
			breastfeeding: '',
			pregnancyIntention: ''
		},
		menstrualHistory: {
			cycleLength: null,
			cycleDuration: null,
			flowHeaviness: '',
			dysmenorrhea: '',
			lastMenstrualPeriod: ''
		},
		currentContraception: {
			currentMethod: '',
			durationOfUse: '',
			reasonForChange: '',
			sideEffects: ''
		},
		medicalHistory: {
			hypertension: '',
			migraineWithAura: '',
			dvtHistory: '',
			breastCancer: '',
			liverDisease: '',
			diabetes: '',
			epilepsy: '',
			hiv: '',
			stiHistory: ''
		},
		cardiovascularRisk: {
			bmi: null,
			smoking: '',
			bloodPressureSystolic: null,
			bloodPressureDiastolic: null,
			familyHistoryCVD: '',
			lipidDisorders: ''
		},
		lifestyleFactors: {
			smokingStatus: '',
			alcoholUse: '',
			drugUse: '',
			occupation: '',
			travelPlans: ''
		},
		preferencesPriorities: {
			preferredMethod: '',
			efficacyPriority: '',
			conveniencePriority: '',
			periodControlPriority: '',
			fertilityReturnPriority: '',
			hormoneFreePreference: ''
		},
		breastCervicalScreening: {
			lastBreastScreening: '',
			lastCervicalScreening: '',
			hpvVaccination: ''
		},
		familyPlanningGoals: {
			desireForChildren: '',
			timeframe: '',
			partnerInvolvement: ''
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
