import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: '',
			weight: null,
			height: null
		},
		chiefComplaint: {
			primarySymptom: '',
			onsetDate: '',
			onsetType: '',
			duration: '',
			progression: '',
			associatedSymptoms: '',
			precipitatingEvent: ''
		},
		nihssAssessment: {
			consciousness: null,
			consciousnessQuestions: null,
			consciousnessCommands: null,
			gaze: null,
			visual: null,
			facialPalsy: null,
			motorLeftArm: null,
			motorRightArm: null,
			motorLeftLeg: null,
			motorRightLeg: null,
			limbAtaxia: null,
			sensory: null,
			language: null,
			dysarthria: null,
			extinctionInattention: null
		},
		headacheAssessment: {
			headachePresent: '',
			headacheType: '',
			frequency: '',
			severity: null,
			aura: '',
			auraDescription: '',
			triggers: '',
			redFlagSuddenOnset: '',
			redFlagWorstEver: '',
			redFlagFever: '',
			redFlagNeckStiffness: '',
			redFlagNeurologicalDeficit: ''
		},
		seizureHistory: {
			seizureHistory: '',
			seizureType: '',
			frequency: '',
			lastSeizureDate: '',
			triggers: '',
			aura: '',
			auraDescription: '',
			postIctalState: '',
			statusEpilepticus: ''
		},
		motorSensoryExam: {
			strengthUpperLeft: '',
			strengthUpperRight: '',
			strengthLowerLeft: '',
			strengthLowerRight: '',
			tone: '',
			reflexes: '',
			plantarResponseLeft: '',
			plantarResponseRight: '',
			sensation: '',
			sensationDetails: '',
			coordination: '',
			coordinationDetails: '',
			gait: ''
		},
		cognitiveAssessment: {
			orientation: '',
			attentionNormal: '',
			memoryShortTerm: '',
			memoryLongTerm: '',
			languageNormal: '',
			languageDetails: '',
			visuospatialNormal: '',
			executiveFunctionNormal: '',
			mmseScore: null
		},
		currentMedications: {
			medications: [],
			anticonvulsants: '',
			anticonvulsantDetails: '',
			migraineProphylaxis: '',
			migraineProphylaxisDetails: '',
			neuropathicPainMeds: '',
			neuropathicPainDetails: '',
			anticoagulants: '',
			anticoagulantDetails: ''
		},
		diagnosticResults: {
			mriCtPerformed: '',
			mriCtFinding: '',
			mriCtDetails: '',
			eegPerformed: '',
			eegFinding: '',
			eegDetails: '',
			emgNcsPerformed: '',
			emgNcsDetails: '',
			lumbarPuncturePerformed: '',
			lumbarPunctureDetails: ''
		},
		functionalSocial: {
			mrsScore: null,
			drivingStatus: '',
			drivingRestrictionDetails: '',
			employmentStatus: '',
			employmentImpact: '',
			supportNeeds: '',
			livingSituation: '',
			carePlanRequired: ''
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
