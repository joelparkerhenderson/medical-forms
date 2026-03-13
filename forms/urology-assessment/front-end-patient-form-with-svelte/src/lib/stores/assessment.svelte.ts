import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: ''
		},
		chiefComplaint: {
			primaryConcern: '',
			duration: '',
			urgency: ''
		},
		ipssQuestionnaire: {
			q1: null, q2: null, q3: null, q4: null, q5: null,
			q6: null, q7: null
		},
		qualityOfLife: {
			qolScore: null,
			qolImpact: ''
		},
		urinarySymptoms: {
			frequency: '',
			urgency: '',
			nocturia: '',
			hesitancy: '',
			stream: '',
			straining: '',
			hematuria: '',
			dysuria: '',
			incontinence: ''
		},
		renalFunction: {
			creatinine: null,
			eGFR: null,
			urinalysis: '',
			psa: null,
			psaDate: ''
		},
		sexualHealth: {
			erectileDysfunction: '',
			libidoChanges: '',
			ejaculatoryProblems: ''
		},
		medicalHistory: {
			previousUrologicConditions: '',
			surgicalHistory: '',
			diabetes: '',
			hypertension: '',
			neurologicConditions: '',
			neurologicConditionDetails: ''
		},
		currentMedications: {
			alphaBlockers: [],
			fiveAlphaReductaseInhibitors: [],
			anticholinergics: [],
			otherMedications: []
		},
		familyHistory: {
			prostateCancer: '',
			bladderCancer: '',
			kidneyDisease: '',
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
