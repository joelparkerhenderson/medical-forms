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
			saba: '',
			laba: '',
			lama: '',
			ics: '',
			oralCorticosteroids: '',
			oxygenTherapy: '',
			oxygenLitresPerMinute: null,
			nebulizers: '',
			otherMedications: []
		},
		allergies: [],
		comorbidities: {
			cardiovascularDisease: '',
			cardiovascularDetails: '',
			diabetes: '',
			osteoporosis: '',
			depression: '',
			lungCancer: '',
			lungCancerDetails: '',
			otherComorbidities: ''
		},
		smokingExposures: {
			smokingStatus: '',
			packYears: null,
			occupationalExposures: '',
			occupationalDetails: '',
			biomassFuelExposure: ''
		},
		functionalStatus: {
			exerciseTolerance: '',
			sixMinuteWalkDistance: null,
			oxygenSaturationRest: null,
			oxygenSaturationExertion: null,
			adlLimitations: '',
			adlDetails: ''
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
