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
			bmi: null,
			ecogPerformanceStatus: ''
		},
		cancerDiagnosis: {
			cancerType: '',
			cancerTypeOther: '',
			primarySite: '',
			histology: '',
			histologyOther: '',
			stageT: '',
			stageN: '',
			stageM: '',
			overallStage: '',
			grade: '',
			dateOfDiagnosis: ''
		},
		treatmentHistory: {
			previousSurgery: '',
			surgeryDetails: '',
			previousChemotherapy: '',
			chemotherapyRegimens: '',
			previousRadiation: '',
			radiationDetails: '',
			previousImmunotherapy: '',
			immunotherapyDetails: '',
			previousTargetedTherapy: '',
			targetedTherapyDetails: '',
			clinicalTrialParticipation: '',
			clinicalTrialDetails: ''
		},
		currentTreatment: {
			activeRegimen: '',
			cycleNumber: null,
			lastTreatmentDate: '',
			responseAssessment: ''
		},
		symptomAssessment: {
			painNRS: null,
			fatigue: '',
			nausea: '',
			appetite: '',
			weightChange: '',
			esasScore: null
		},
		sideEffects: {
			neuropathy: '',
			neuropathyDetails: '',
			mucositis: '',
			skinReactions: '',
			skinReactionDetails: '',
			myelosuppression: '',
			neutropenia: '',
			thrombocytopenia: '',
			anaemia: '',
			organToxicityGrade: '',
			organToxicityDetails: ''
		},
		laboratoryResults: {
			wbc: null,
			haemoglobin: null,
			platelets: null,
			neutrophils: null,
			creatinine: null,
			alt: null,
			ast: null,
			bilirubin: null,
			albumin: null,
			calcium: null,
			ldh: null,
			tumourMarker: '',
			tumourMarkerValue: '',
			inr: null
		},
		currentMedications: {
			chemotherapyAgents: [],
			antiemetics: [],
			painMedications: [],
			growthFactors: [],
			supportiveCare: []
		},
		psychosocial: {
			distressThermometer: null,
			anxiety: '',
			depression: '',
			copingAbility: '',
			supportSystem: '',
			advanceCarePlanning: '',
			advanceCareDetails: ''
		},
		functionalNutritional: {
			ecogDetailed: '',
			karnofskyScore: null,
			nutritionalStatus: '',
			weightTrajectory: '',
			dietaryIntake: '',
			nutritionalSupportRequired: ''
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
