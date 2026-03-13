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
			affectedEar: '',
			onset: '',
			duration: '',
			progression: ''
		},
		hearingHistory: {
			noiseExposure: '',
			occupationalNoise: '',
			occupationalNoiseDetails: '',
			recreationalNoise: '',
			recreationalNoiseDetails: '',
			previousHearingTests: '',
			previousTestDetails: '',
			hearingAidUse: '',
			hearingAidDetails: ''
		},
		audiometricResults: {
			pureToneAverageRight: null,
			pureToneAverageLeft: null,
			airConductionRight: '',
			airConductionLeft: '',
			boneConductionRight: '',
			boneConductionLeft: '',
			airBoneGapRight: null,
			airBoneGapLeft: null,
			speechRecognitionThresholdRight: null,
			speechRecognitionThresholdLeft: null,
			wordRecognitionScoreRight: null,
			wordRecognitionScoreLeft: null,
			hearingLossType: ''
		},
		tinnitusAssessment: {
			presence: '',
			affectedEar: '',
			character: '',
			severity: '',
			duration: '',
			impactOnDailyLife: '',
			tinnitusHandicapInventoryScore: null
		},
		vestibularSymptoms: {
			vertigo: '',
			vertigoDetails: '',
			dizziness: '',
			balanceProblems: '',
			dixHallpike: '',
			nystagmus: '',
			fallsHistory: '',
			fallsFrequency: ''
		},
		otoscopicFindings: {
			earCanalRight: '',
			earCanalLeft: '',
			tympanicMembraneRight: '',
			tympanicMembraneLeft: '',
			middleEarRight: '',
			middleEarLeft: '',
			earWaxRight: '',
			earWaxLeft: '',
			dischargeRight: '',
			dischargeLeft: '',
			previousSurgery: '',
			previousSurgeryDetails: ''
		},
		medicalHistory: {
			ototoxicMedications: '',
			ototoxicMedicationDetails: '',
			autoimmune: '',
			autoimmuneDetails: '',
			menieres: '',
			otosclerosis: '',
			acousticNeuroma: '',
			infections: '',
			infectionDetails: ''
		},
		functionalCommunication: {
			communicationDifficulties: '',
			communicationDetails: '',
			hearingAidCandidacy: '',
			assistiveDeviceNeeds: '',
			assistiveDeviceDetails: '',
			workImpact: '',
			socialImpact: '',
			hhieScore: null
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
