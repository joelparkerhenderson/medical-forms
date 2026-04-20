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
		menstrualHistory: {
			ageAtMenarche: null,
			cycleRegularity: '',
			cycleLengthDays: null,
			periodDurationDays: null,
			flowHeaviness: '',
			clotsPresent: '',
			intermenstrualBleeding: '',
			postcoitalBleeding: '',
			dysmenorrhoeaSeverity: '',
			daysOffWorkPerCycle: null,
			currentContraception: '',
			menstrualNotes: ''
		},
		painAssessment: {
			hasPelvicPain: '',
			pelvicPainSeverity: null,
			pelvicPainCharacter: '',
			pelvicPainLocation: '',
			pelvicPainTiming: '',
			dyspareunia: '',
			dyspareuniaSeverity: null,
			dyschezia: '',
			dyscheziaCyclical: '',
			backPain: '',
			legPain: '',
			painWorseWithActivity: '',
			painNotes: ''
		},
		gastrointestinalSymptoms: {
			hasGiSymptoms: '',
			bloating: '',
			bloatingCyclical: '',
			nausea: '',
			constipation: '',
			diarrhoea: '',
			alternatingBowelHabit: '',
			rectalBleeding: '',
			rectalBleedingCyclical: '',
			bowelObstructionSymptoms: '',
			giNotes: ''
		},
		urinarySymptoms: {
			hasUrinarySymptoms: '',
			frequency: '',
			urgency: '',
			dysuria: '',
			haematuria: '',
			haematuriaCyclical: '',
			flankPain: '',
			urinaryObstructionSymptoms: '',
			recurrentUtis: '',
			urinaryNotes: ''
		},
		fertilityAssessment: {
			tryingToConceive: '',
			durationTryingMonths: null,
			previousPregnancies: null,
			liveBirths: null,
			miscarriages: null,
			ectopicPregnancies: null,
			previousFertilityTreatment: '',
			fertilityTreatmentDetails: '',
			amhLevel: null,
			partnerSemenAnalysis: '',
			futureFertilityConcerns: '',
			fertilityNotes: ''
		},
		previousTreatments: {
			nsaidsTried: '',
			nsaidsEffective: '',
			paracetamolTried: '',
			opioidsTried: '',
			opioidsCurrent: '',
			combinedPillTried: '',
			combinedPillEffective: '',
			progesteroneTried: '',
			progesteroneType: '',
			gnrhAgonistTried: '',
			gnrhAgonistDurationMonths: null,
			mirenaIusTried: '',
			otherTreatments: '',
			treatmentNotes: ''
		},
		surgicalHistory: {
			previousLaparoscopy: '',
			numberOfLaparoscopies: null,
			mostRecentLaparoscopyDate: '',
			endometriosisConfirmedSurgically: '',
			histologicalConfirmation: '',
			asrmStageAtSurgery: '',
			sitesFound: '',
			excisionPerformed: '',
			ablationPerformed: '',
			adhesiolysisPerformed: '',
			endometriomaDrained: '',
			bowelSurgery: '',
			bladderSurgery: '',
			otherPelvicSurgery: '',
			surgicalComplications: '',
			surgicalNotes: ''
		},
		qualityOfLife: {
			painDomainScore: null,
			controlPowerlessnessScore: null,
			emotionalWellbeingScore: null,
			socialSupportScore: null,
			selfImageScore: null,
			workImpact: '',
			relationshipImpact: '',
			sleepImpact: '',
			mentalHealthImpact: '',
			exerciseImpact: '',
			qolNotes: ''
		},
		treatmentPlanning: {
			treatmentGoals: '',
			preferredApproach: '',
			surgeryConsidered: '',
			surgeryTypeConsidered: '',
			fertilityPreservationNeeded: '',
			mdtReferralNeeded: '',
			painManagementReferral: '',
			psychologyReferral: '',
			physiotherapyReferral: '',
			fertilityClinicReferral: '',
			imagingRequested: '',
			followUpInterval: '',
			planningNotes: ''
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
