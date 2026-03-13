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
			affectedEye: '',
			onsetType: '',
			durationValue: '',
			durationUnit: '',
			painPresent: '',
			painSeverity: ''
		},
		visualAcuity: {
			distanceVaRightUncorrected: '',
			distanceVaRightCorrected: '',
			distanceVaLeftUncorrected: '',
			distanceVaLeftCorrected: '',
			nearVaRight: '',
			nearVaLeft: '',
			pinholeRight: '',
			pinholeLeft: '',
			refractionRight: '',
			refractionLeft: ''
		},
		ocularHistory: {
			previousEyeConditions: '',
			previousEyeConditionDetails: '',
			previousEyeSurgery: '',
			previousEyeSurgeryDetails: '',
			laserTreatment: '',
			laserTreatmentDetails: '',
			ocularTrauma: '',
			ocularTraumaDetails: '',
			amblyopia: '',
			amblyopiaEye: ''
		},
		anteriorSegment: {
			lidsNormal: '',
			lidsDetails: '',
			conjunctivaNormal: '',
			conjunctivaDetails: '',
			corneaNormal: '',
			corneaDetails: '',
			anteriorChamberNormal: '',
			anteriorChamberDetails: '',
			irisNormal: '',
			irisDetails: '',
			lensNormal: '',
			lensDetails: '',
			iopRight: null,
			iopLeft: null,
			iopMethod: ''
		},
		posteriorSegment: {
			fundusNormal: '',
			fundusDetails: '',
			opticDiscNormal: '',
			opticDiscDetails: '',
			cupToDiscRatioRight: '',
			cupToDiscRatioLeft: '',
			maculaNormal: '',
			maculaDetails: '',
			retinalVesselsNormal: '',
			retinalVesselsDetails: '',
			vitreousNormal: '',
			vitreousDetails: ''
		},
		visualFieldPupils: {
			visualFieldTestPerformed: '',
			visualFieldTestType: '',
			visualFieldResultRight: '',
			visualFieldResultLeft: '',
			visualFieldDetails: '',
			pupilReactionRight: '',
			pupilReactionLeft: '',
			rapdPresent: '',
			rapdEye: '',
			colourVisionNormal: '',
			colourVisionDetails: ''
		},
		currentMedications: {
			eyeDrops: [],
			oralMedications: [],
			ophthalmicDrugAllergies: []
		},
		systemicConditions: {
			diabetes: '',
			diabetesType: '',
			diabetesControl: '',
			diabeticRetinopathy: '',
			diabeticRetinopathyStage: '',
			hypertension: '',
			hypertensionControlled: '',
			autoimmune: '',
			autoimmuneDetails: '',
			thyroidEyeDisease: '',
			thyroidEyeDiseaseDetails: '',
			neurological: '',
			neurologicalDetails: ''
		},
		functionalImpact: {
			drivingStatus: '',
			drivingConcerns: '',
			readingAbility: '',
			adlLimitations: '',
			adlLimitationDetails: '',
			fallsRisk: '',
			fallsDetails: '',
			supportNeeds: '',
			supportDetails: ''
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
