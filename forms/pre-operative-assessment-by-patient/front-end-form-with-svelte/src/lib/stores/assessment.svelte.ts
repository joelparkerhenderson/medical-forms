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
			plannedProcedure: '',
			procedureUrgency: ''
		},
		cardiovascular: {
			hypertension: '',
			hypertensionControlled: '',
			ischemicHeartDisease: '',
			ihdDetails: '',
			heartFailure: '',
			heartFailureNYHA: '',
			valvularDisease: '',
			valvularDetails: '',
			arrhythmia: '',
			arrhythmiaType: '',
			pacemaker: '',
			recentMI: '',
			recentMIWeeks: null
		},
		respiratory: {
			asthma: '',
			asthmaFrequency: '',
			copd: '',
			copdSeverity: '',
			osa: '',
			osaCPAP: '',
			smoking: '',
			smokingPackYears: null,
			recentURTI: ''
		},
		renal: {
			ckd: '',
			ckdStage: '',
			dialysis: '',
			dialysisType: ''
		},
		hepatic: {
			liverDisease: '',
			cirrhosis: '',
			childPughScore: '',
			hepatitis: '',
			hepatitisType: ''
		},
		endocrine: {
			diabetes: '',
			diabetesControl: '',
			diabetesOnInsulin: '',
			thyroidDisease: '',
			thyroidType: '',
			adrenalInsufficiency: ''
		},
		neurological: {
			strokeOrTIA: '',
			strokeDetails: '',
			epilepsy: '',
			epilepsyControlled: '',
			neuromuscularDisease: '',
			neuromuscularDetails: '',
			raisedICP: ''
		},
		haematological: {
			bleedingDisorder: '',
			bleedingDetails: '',
			onAnticoagulants: '',
			anticoagulantType: '',
			sickleCellDisease: '',
			sickleCellTrait: '',
			anaemia: ''
		},
		musculoskeletalAirway: {
			rheumatoidArthritis: '',
			cervicalSpineIssues: '',
			limitedNeckMovement: '',
			limitedMouthOpening: '',
			dentalIssues: '',
			dentalDetails: '',
			previousDifficultAirway: '',
			mallampatiScore: ''
		},
		gastrointestinal: {
			gord: '',
			hiatusHernia: '',
			nausea: ''
		},
		medications: [],
		allergies: [],
		previousAnaesthesia: {
			previousAnaesthesia: '',
			anaesthesiaProblems: '',
			anaesthesiaProblemDetails: '',
			familyMHHistory: '',
			familyMHDetails: '',
			ponv: ''
		},
		socialHistory: {
			alcohol: '',
			alcoholUnitsPerWeek: null,
			recreationalDrugs: '',
			drugDetails: ''
		},
		functionalCapacity: {
			exerciseTolerance: '',
			estimatedMETs: null,
			mobilityAids: '',
			recentDecline: ''
		},
		pregnancy: {
			possiblyPregnant: '',
			pregnancyConfirmed: '',
			gestationWeeks: null
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
