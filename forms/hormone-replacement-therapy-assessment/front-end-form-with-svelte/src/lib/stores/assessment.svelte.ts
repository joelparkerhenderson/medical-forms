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
		menopauseStatus: {
			menopausalStatus: '',
			lastMenstrualPeriod: '',
			ageAtMenopause: null,
			surgicalMenopause: '',
			surgicalMenopauseDetails: '',
			prematureOvarianInsufficiency: ''
		},
		mrsSymptomScale: {
			hotFlushes: null,
			heartDiscomfort: null,
			sleepProblems: null,
			jointPain: null,
			depressiveMood: null,
			irritability: null,
			anxiety: null,
			fatigue: null,
			sexualProblems: null,
			bladderProblems: null,
			vaginalDryness: null
		},
		vasomotorSymptoms: {
			hotFlushFrequency: '',
			hotFlushSeverity: '',
			nightSweats: '',
			nightSweatsFrequency: '',
			triggers: ''
		},
		boneHealth: {
			dexaScan: '',
			dexaResult: '',
			dexaDate: '',
			fractureHistory: '',
			fractureDetails: '',
			heightLoss: '',
			heightLossCm: null,
			riskFactors: '',
			calciumIntake: '',
			vitaminDIntake: ''
		},
		cardiovascularRisk: {
			systolicBP: null,
			diastolicBP: null,
			totalCholesterol: null,
			hdlCholesterol: null,
			ldlCholesterol: null,
			triglycerides: null,
			familyHistoryCVD: '',
			diabetes: '',
			diabetesType: '',
			smoking: '',
			qriskScore: null
		},
		breastHealth: {
			lastMammogram: '',
			mammogramResult: '',
			breastExamNormal: '',
			familyHistoryBreastCancer: '',
			familyHistoryOvarianCancer: '',
			brcaStatus: '',
			brcaType: ''
		},
		currentMedications: {
			currentHRT: '',
			currentHRTDetails: '',
			currentHRTDuration: '',
			previousHRT: '',
			previousHRTDetails: '',
			previousHRTReason: '',
			otherMedications: [],
			supplements: ''
		},
		contraindicationsScreen: {
			vteHistory: '',
			vteDetails: '',
			breastCancerHistory: '',
			breastCancerDetails: '',
			liverDisease: '',
			liverDiseaseDetails: '',
			undiagnosedVaginalBleeding: '',
			pregnancy: '',
			activeCardiovascularDisease: '',
			activeCardiovascularDetails: ''
		},
		treatmentPreferences: {
			routePreference: '',
			routePreferenceReason: '',
			concernsAboutHRT: '',
			lifestyleFactors: '',
			treatmentGoals: ''
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
