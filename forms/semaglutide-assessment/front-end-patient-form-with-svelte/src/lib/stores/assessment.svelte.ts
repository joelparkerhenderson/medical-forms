import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dob: '',
			sex: ''
		},
		indicationGoals: {
			primaryIndication: '',
			weightLossGoalPercent: null,
			previousWeightLossAttempts: '',
			motivationLevel: ''
		},
		bodyComposition: {
			heightCm: null,
			weightKg: null,
			bmi: null,
			waistCircumference: null,
			bodyFatPercent: null,
			previousMaxWeight: null
		},
		metabolicProfile: {
			hba1c: null,
			fastingGlucose: null,
			insulinLevel: null,
			totalCholesterol: null,
			ldl: null,
			hdl: null,
			triglycerides: null,
			thyroidFunction: ''
		},
		cardiovascularRisk: {
			bloodPressureSystolic: null,
			bloodPressureDiastolic: null,
			heartRate: null,
			previousMI: '',
			heartFailure: '',
			peripheralVascularDisease: '',
			cerebrovascularDisease: '',
			qriskScore: null
		},
		contraindicationsScreening: {
			personalHistoryMTC: '',
			familyHistoryMTC: '',
			men2Syndrome: '',
			pancreatitisHistory: '',
			severeGIDisease: '',
			pregnancyPlanned: '',
			breastfeeding: '',
			type1Diabetes: '',
			diabeticRetinopathySevere: '',
			allergySemaglutide: ''
		},
		gastrointestinalHistory: {
			nauseaHistory: '',
			vomitingHistory: '',
			gastroparesis: '',
			gallstoneHistory: '',
			ibd: '',
			gerdHistory: '',
			previousBariatricSurgery: '',
			currentGISymptoms: ''
		},
		currentMedications: {
			insulinTherapy: '',
			insulinType: '',
			sulfonylureas: '',
			otherDiabetesMedications: [],
			antihypertensives: [],
			lipidLowering: [],
			otherMedications: []
		},
		mentalHealthScreening: {
			eatingDisorderHistory: '',
			eatingDisorderDetails: '',
			depressionHistory: '',
			suicidalIdeation: '',
			bodyDysmorphia: '',
			bingeDrinkingHistory: '',
			currentMentalHealthTreatment: ''
		},
		treatmentPlan: {
			selectedFormulation: '',
			startingDose: '',
			titrationSchedule: '',
			monitoringFrequency: '',
			dietaryGuidance: '',
			exercisePlan: '',
			followUpWeeks: null
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
