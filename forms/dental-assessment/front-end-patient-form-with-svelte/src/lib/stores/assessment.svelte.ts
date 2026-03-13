import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: '',
			emergencyContactName: '',
			emergencyContactPhone: ''
		},
		chiefComplaint: {
			primaryConcern: '',
			painLocation: '',
			painSeverity: null,
			painOnset: '',
			painDuration: ''
		},
		dentalHistory: {
			lastDentalVisit: '',
			visitFrequency: '',
			brushingFrequency: '',
			flossingFrequency: '',
			dentalAnxietyLevel: ''
		},
		dmftAssessment: {
			decayedTeeth: null,
			missingTeeth: null,
			filledTeeth: null,
			toothChartNotes: ''
		},
		periodontalAssessment: {
			gumBleeding: '',
			pocketDepthsAboveNormal: '',
			pocketDepthDetails: '',
			gumRecession: '',
			gumRecessionDetails: '',
			toothMobility: '',
			mobilityDetails: '',
			furcationInvolvement: '',
			furcationDetails: ''
		},
		oralExamination: {
			softTissueFindings: '',
			tmjPain: '',
			tmjClicking: '',
			tmjLimitedOpening: '',
			occlusion: '',
			oralHygieneIndex: ''
		},
		medicalHistory: {
			cardiovascularDisease: '',
			cardiovascularDetails: '',
			diabetes: '',
			diabetesType: '',
			diabetesControlled: '',
			bleedingDisorder: '',
			bleedingDetails: '',
			bisphosphonateUse: '',
			bisphosphonateDetails: '',
			radiationTherapyHeadNeck: '',
			radiationDetails: '',
			immunosuppression: '',
			immunosuppressionDetails: ''
		},
		currentMedications: {
			anticoagulantUse: '',
			anticoagulantType: '',
			bisphosphonateCurrentUse: '',
			bisphosphonateName: '',
			immunosuppressantUse: '',
			immunosuppressantName: '',
			allergyToAnaesthetics: '',
			anaestheticAllergyDetails: '',
			otherMedications: ''
		},
		radiographicFindings: {
			panoramicFindings: '',
			periapicalFindings: '',
			bitewingFindings: '',
			boneLossPattern: '',
			boneLossDetails: ''
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
