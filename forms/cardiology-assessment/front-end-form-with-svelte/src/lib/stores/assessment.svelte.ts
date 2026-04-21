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
		chestPainAngina: {
			chestPain: '',
			painCharacter: '',
			painLocation: '',
			painRadiation: '',
			ccsClass: '',
			anginaFrequency: '',
			anginaDuration: '',
			unstableAngina: ''
		},
		heartFailureSymptoms: {
			dyspnoea: '',
			dyspnoeaOnExertion: '',
			orthopnoea: '',
			pnd: '',
			peripheralOedema: '',
			nyhaClass: ''
		},
		cardiacHistory: {
			previousMI: '',
			miDate: '',
			recentMI: '',
			recentMIWeeks: null,
			pci: '',
			pciDetails: '',
			cabg: '',
			cabgDetails: '',
			valvularDisease: '',
			valvularDetails: '',
			cardiomyopathy: '',
			cardiomyopathyType: '',
			pericarditis: ''
		},
		arrhythmiaConduction: {
			atrialFibrillation: '',
			afType: '',
			otherArrhythmia: '',
			otherArrhythmiaType: '',
			pacemaker: '',
			pacemakerType: '',
			syncope: '',
			syncopeDetails: '',
			palpitations: ''
		},
		riskFactors: {
			hypertension: '',
			hypertensionControlled: '',
			diabetes: '',
			diabetesType: '',
			hyperlipidaemia: '',
			familyHistory: '',
			familyHistoryDetails: '',
			obesity: ''
		},
		diagnosticResults: {
			ecgFindings: '',
			ecgNormal: '',
			echoPerformed: '',
			echoLVEF: null,
			echoFindings: '',
			stressTestPerformed: '',
			stressTestResult: '',
			stressTestDetails: '',
			cathPerformed: '',
			cathFindings: ''
		},
		currentMedications: {
			antiplatelets: '',
			antiplateletType: '',
			anticoagulants: '',
			anticoagulantType: '',
			betaBlockers: '',
			betaBlockerType: '',
			aceInhibitorsARBs: '',
			aceArbType: '',
			statins: '',
			statinType: '',
			diuretics: '',
			diureticType: '',
			otherCardiacMeds: ''
		},
		allergies: {
			drugAllergies: '',
			allergies: [],
			contrastAllergy: '',
			contrastAllergyDetails: ''
		},
		socialFunctional: {
			smoking: '',
			smokingPackYears: null,
			alcohol: '',
			alcoholUnitsPerWeek: null,
			exerciseTolerance: '',
			estimatedMETs: null,
			occupation: ''
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
