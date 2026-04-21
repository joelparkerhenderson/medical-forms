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
			onsetDate: '',
			duration: '',
			severityRating: null
		},
		dyspnoeaAssessment: {
			mrcGrade: '',
			triggers: '',
			exerciseToleranceMetres: null,
			orthopnoea: '',
			orthopnoeaPillows: null,
			pnd: ''
		},
		coughAssessment: {
			duration: '',
			character: '',
			sputumVolume: '',
			sputumColour: '',
			haemoptysis: '',
			haemoptysisDetails: ''
		},
		respiratoryHistory: {
			asthma: '',
			copd: '',
			copdSeverity: '',
			bronchiectasis: '',
			interstitialLungDisease: '',
			ildType: '',
			tuberculosis: '',
			tbTreatmentComplete: '',
			pneumonia: '',
			pneumoniaRecurrent: '',
			pulmonaryEmbolism: '',
			peDate: ''
		},
		pulmonaryFunction: {
			fev1: null,
			fvc: null,
			fev1FvcRatio: null,
			dlco: null,
			tlc: null,
			oxygenSaturation: null
		},
		currentMedications: {
			inhalers: [],
			nebulizers: [],
			oxygenTherapy: '',
			oxygenDelivery: '',
			oxygenFlowRate: null,
			oralSteroids: '',
			oralSteroidDetails: '',
			antibiotics: '',
			antibioticDetails: ''
		},
		allergies: {
			drugAllergies: [],
			environmentalAllergens: []
		},
		smokingExposures: {
			smokingStatus: '',
			packYears: null,
			vaping: '',
			vapingDetails: '',
			occupationalExposure: '',
			occupationalDetails: '',
			asbestosExposure: '',
			asbestosDetails: '',
			pets: '',
			petDetails: ''
		},
		sleepFunctional: {
			sleepQuality: '',
			osaScreenSnoring: '',
			osaScreenTired: '',
			osaScreenObservedApnoea: '',
			osaScreenBMIOver35: '',
			osaScreenAge50Plus: '',
			osaScreenNeckOver40cm: '',
			osaScreenMale: '',
			stopBangScore: null,
			daytimeSomnolence: '',
			epworthScore: null,
			functionalStatus: ''
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
