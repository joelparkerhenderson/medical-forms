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
			weightKg: null,
			zipCode: ''
		},
		bloodPressure: {
			systolicBp: null,
			diastolicBp: null,
			onAntihypertensive: '',
			numberOfBpMedications: null,
			bpAtTarget: ''
		},
		cholesterolLipids: {
			totalCholesterol: null,
			hdlCholesterol: null,
			ldlCholesterol: null,
			triglycerides: null,
			nonHdlCholesterol: null,
			onStatin: '',
			statinName: ''
		},
		metabolicHealth: {
			hasDiabetes: '',
			diabetesType: '',
			hba1cValue: null,
			hba1cUnit: '',
			fastingGlucose: null,
			bmi: null,
			waistCircumferenceCm: null
		},
		renalFunction: {
			egfr: null,
			creatinine: null,
			urineAcr: null,
			ckdStage: ''
		},
		smokingHistory: {
			smokingStatus: '',
			cigarettesPerDay: null,
			yearsSmoked: null,
			yearsSinceQuit: null
		},
		medicalHistory: {
			hasKnownCvd: '',
			previousMi: '',
			previousStroke: '',
			heartFailure: '',
			atrialFibrillation: '',
			peripheralArterialDisease: '',
			familyCvdHistory: '',
			familyCvdDetails: ''
		},
		currentMedications: {
			onAntihypertensiveDetail: '',
			onStatinDetail: '',
			onAspirin: '',
			onAnticoagulant: '',
			onDiabetesMedication: '',
			otherMedications: ''
		},
		reviewCalculate: {
			modelType: '',
			clinicianName: '',
			reviewDate: '',
			clinicalNotes: ''
		}
	};
}

class AssessmentStore {
	data: AssessmentData = $state(createDefaultAssessment());
	result: GradingResult | null = $state(null);
	currentStep: number = $state(1);

	reset() {
		this.data = createDefaultAssessment();
		this.result = null;
		this.currentStep = 1;
	}
}

export const assessment = new AssessmentStore();
