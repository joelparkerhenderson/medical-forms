import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		patientInformation: {
			fullName: '',
			dateOfBirth: '',
			nhsNumber: '',
			address: '',
			telephone: '',
			email: '',
			gpName: '',
			gpPractice: ''
		},
		demographics: {
			age: null,
			sex: '',
			ethnicity: '',
			heightCm: null,
			weightKg: null
		},
		smokingHistory: {
			smokingStatus: '',
			cigarettesPerDay: null,
			yearsSmoked: null,
			yearsSinceQuit: null
		},
		bloodPressure: {
			systolicBp: null,
			diastolicBp: null,
			onBpTreatment: '',
			bpMedicationName: '',
			bpMeasurementMethod: ''
		},
		cholesterol: {
			totalCholesterol: null,
			hdlCholesterol: null,
			ldlCholesterol: null,
			triglycerides: null,
			cholesterolUnit: 'mgDl',
			fastingSample: ''
		},
		medicalHistory: {
			hasDiabetes: '',
			hasPriorChd: '',
			hasPeripheralVascularDisease: '',
			hasCerebrovascularDisease: '',
			hasHeartFailure: '',
			hasAtrialFibrillation: '',
			otherConditions: ''
		},
		familyHistory: {
			familyChdHistory: '',
			familyChdAgeOnset: '',
			familyChdRelationship: '',
			familyStrokeHistory: '',
			familyDiabetesHistory: ''
		},
		lifestyleFactors: {
			physicalActivity: '',
			alcoholConsumption: '',
			dietQuality: '',
			bmi: null,
			waistCircumferenceCm: null,
			stressLevel: ''
		},
		currentMedications: {
			onStatin: '',
			statinName: '',
			onAspirin: '',
			onAntihypertensive: '',
			antihypertensiveName: '',
			otherMedications: ''
		},
		reviewCalculate: {
			clinicianName: '',
			reviewDate: '',
			clinicalNotes: '',
			patientConsent: ''
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
