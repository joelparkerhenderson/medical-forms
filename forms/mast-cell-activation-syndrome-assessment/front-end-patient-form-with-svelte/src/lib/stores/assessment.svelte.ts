import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultSymptomDetail() {
	return { severity: null as (0 | 1 | 2 | 3 | null), frequency: '' as const };
}

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: ''
		},
		symptomOverview: {
			onsetDate: '',
			symptomDuration: '',
			symptomFrequency: '',
			qualityOfLife: ''
		},
		dermatologicalSymptoms: {
			flushing: createDefaultSymptomDetail(),
			urticaria: createDefaultSymptomDetail(),
			angioedema: createDefaultSymptomDetail(),
			pruritus: createDefaultSymptomDetail()
		},
		gastrointestinalSymptoms: {
			abdominalPain: createDefaultSymptomDetail(),
			nausea: createDefaultSymptomDetail(),
			diarrhea: createDefaultSymptomDetail(),
			bloating: createDefaultSymptomDetail()
		},
		cardiovascularSymptoms: {
			tachycardia: createDefaultSymptomDetail(),
			hypotension: createDefaultSymptomDetail(),
			presyncope: createDefaultSymptomDetail(),
			syncope: createDefaultSymptomDetail()
		},
		respiratorySymptoms: {
			wheezing: createDefaultSymptomDetail(),
			dyspnea: createDefaultSymptomDetail(),
			nasalCongestion: createDefaultSymptomDetail(),
			throatTightening: createDefaultSymptomDetail()
		},
		neurologicalSymptoms: {
			headache: createDefaultSymptomDetail(),
			brainFog: createDefaultSymptomDetail(),
			dizziness: createDefaultSymptomDetail(),
			fatigue: createDefaultSymptomDetail()
		},
		triggersPatterns: {
			foodTriggers: '',
			environmentalTriggers: '',
			stressTriggers: '',
			exerciseTrigger: '',
			temperatureTrigger: '',
			medicationTriggers: ''
		},
		laboratoryResults: {
			serumTryptase: null,
			histamine: null,
			prostaglandinD2: null,
			chromograninA: null
		},
		currentTreatment: {
			antihistamines: '',
			mastCellStabilizers: '',
			leukotrienInhibitors: '',
			epinephrine: ''
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
