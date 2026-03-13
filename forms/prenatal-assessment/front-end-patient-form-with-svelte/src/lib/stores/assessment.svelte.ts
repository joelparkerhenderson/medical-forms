import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: 'female'
		},
		pregnancyDetails: {
			gestationalWeeks: null,
			estimatedDueDate: '',
			conceptionMethod: '',
			multipleGestation: '',
			placentaLocation: ''
		},
		obstetricHistory: {
			gravida: null,
			para: null,
			abortions: null,
			livingChildren: null,
			previousComplications: {
				preeclampsia: '',
				gestationalDiabetes: '',
				pretermBirth: '',
				cesareanSection: ''
			}
		},
		medicalHistory: {
			chronicConditions: '',
			autoimmune: '',
			thyroid: '',
			diabetes: '',
			hypertension: ''
		},
		currentSymptoms: {
			nausea: '',
			bleeding: '',
			headache: '',
			visionChanges: '',
			edema: '',
			abdominalPain: '',
			reducedFetalMovement: ''
		},
		vitalSigns: {
			bloodPressureSystolic: null,
			bloodPressureDiastolic: null,
			weight: null,
			height: null,
			bmi: null,
			fundalHeight: null,
			fetalHeartRate: null
		},
		laboratoryResults: {
			bloodType: '',
			rhFactor: '',
			hemoglobin: null,
			glucose: null,
			urinalysis: '',
			gbs: ''
		},
		lifestyleNutrition: {
			smoking: '',
			alcohol: '',
			drugs: '',
			exercise: '',
			diet: '',
			supplements: '',
			folicAcid: ''
		},
		mentalHealthScreening: {
			edinburghScore: null,
			anxietyLevel: '',
			supportSystem: '',
			domesticViolenceScreen: ''
		},
		birthPlanPreferences: {
			deliveryPreference: '',
			painManagement: '',
			feedingPlan: '',
			specialRequests: ''
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
