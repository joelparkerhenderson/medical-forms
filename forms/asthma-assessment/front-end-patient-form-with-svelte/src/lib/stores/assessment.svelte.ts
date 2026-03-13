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
		symptomFrequency: {
			daytimeSymptoms: '',
			nighttimeAwakening: '',
			rescueInhalerUse: '',
			activityLimitation: '',
			selfRatedControl: ''
		},
		lungFunction: {
			fev1Percent: null,
			fev1Fvc: null,
			peakFlowBest: null,
			peakFlowCurrent: null,
			peakFlowPercent: null,
			spirometryDate: '',
			spirometryNotes: ''
		},
		triggers: {
			allergens: '',
			allergenDetails: '',
			exercise: '',
			weather: '',
			weatherDetails: '',
			occupational: '',
			occupationalDetails: '',
			infections: '',
			smoke: '',
			stress: '',
			medications: '',
			medicationDetails: '',
			otherTriggers: ''
		},
		currentMedications: {
			controllerMedications: [],
			rescueInhalers: [],
			biologics: [],
			oralSteroids: '',
			oralSteroidDetails: '',
			inhalerTechniqueReviewed: '',
			medicationAdherence: ''
		},
		allergies: {
			drugAllergies: [],
			environmentalAllergies: [],
			allergyTestingDone: '',
			allergyTestResults: ''
		},
		exacerbationHistory: {
			exacerbationsLastYear: null,
			edVisitsLastYear: null,
			hospitalisationsLastYear: null,
			icuAdmissions: '',
			icuAdmissionCount: null,
			intubationHistory: '',
			oralSteroidCoursesLastYear: null,
			lastExacerbationDate: ''
		},
		comorbidities: {
			allergicRhinitis: '',
			sinusitis: '',
			nasalPolyps: '',
			gord: '',
			obesity: '',
			anxiety: '',
			depression: '',
			eczema: '',
			sleepApnoea: '',
			vocalCordDysfunction: '',
			otherComorbidities: ''
		},
		socialHistory: {
			smoking: '',
			smokingPackYears: null,
			vaping: '',
			occupationalExposures: '',
			occupationalExposureDetails: '',
			homeEnvironment: '',
			pets: '',
			petDetails: '',
			carpetInBedroom: '',
			moldExposure: ''
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
