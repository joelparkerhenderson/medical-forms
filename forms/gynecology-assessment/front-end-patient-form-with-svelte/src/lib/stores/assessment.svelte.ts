import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: '',
			menopausalStatus: ''
		},
		chiefComplaint: {
			primaryConcern: '',
			duration: '',
			progression: '',
			previousTreatments: ''
		},
		menstrualHistory: {
			cycleLength: null,
			cycleDuration: null,
			flowHeaviness: '',
			painSeverity: null,
			regularity: '',
			lastMenstrualPeriod: ''
		},
		gynecologicalSymptoms: {
			pelvicPain: null,
			abnormalBleeding: null,
			discharge: null,
			urinarySymptoms: null
		},
		cervicalScreening: {
			lastSmearDate: '',
			lastSmearResult: '',
			hpvVaccination: ''
		},
		obstetricHistory: {
			gravida: null,
			para: null,
			complications: ''
		},
		sexualHealth: {
			sexuallyActive: '',
			contraceptionMethod: '',
			stiHistory: '',
			stiDetails: ''
		},
		medicalHistory: {
			previousGynConditions: '',
			chronicDiseases: '',
			surgicalHistory: '',
			autoimmuneDiseases: '',
			autoimmuneDiseaseDetails: ''
		},
		currentMedications: {
			hormonal: [],
			nonHormonal: [],
			supplements: ''
		},
		familyHistory: {
			breastCancer: '',
			ovarianCancer: '',
			cervicalCancer: '',
			endometriosis: '',
			pcos: '',
			otherDetails: ''
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
