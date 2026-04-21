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
		chiefComplaint: {
			primarySymptom: '',
			symptomLocation: '',
			symptomOnset: '',
			symptomDuration: '',
			severityScore: null
		},
		upperGISymptoms: {
			dysphagia: '',
			dysphagiaDetails: '',
			odynophagia: '',
			heartburn: '',
			heartburnFrequency: '',
			nausea: '',
			vomiting: '',
			vomitingDetails: '',
			earlySatiety: ''
		},
		lowerGISymptoms: {
			bowelHabitChange: '',
			bowelHabitDetails: '',
			diarrhoea: '',
			diarrhoeaFrequency: '',
			constipation: '',
			constipationDetails: '',
			rectalBleeding: '',
			rectalBleedingDetails: '',
			tenesmus: '',
			bristolStoolType: ''
		},
		abdominalPainAssessment: {
			painLocation: '',
			painCharacter: '',
			painRadiation: '',
			aggravatingFactors: '',
			relievingFactors: '',
			painFrequency: ''
		},
		liverPancreas: {
			jaundice: '',
			darkUrine: '',
			paleStools: '',
			alcoholIntake: '',
			alcoholUnitsPerWeek: null,
			hepatitisExposure: '',
			hepatitisDetails: ''
		},
		previousGIHistory: {
			previousEndoscopy: '',
			endoscopyDetails: '',
			previousColonoscopy: '',
			colonoscopyDetails: '',
			previousGISurgery: '',
			surgeryDetails: '',
			ibd: '',
			ibdType: '',
			ibs: '',
			celiacDisease: '',
			polyps: '',
			polypDetails: '',
			giCancer: '',
			giCancerDetails: ''
		},
		currentMedications: {
			ppis: '',
			ppiDetails: '',
			antacids: '',
			laxatives: '',
			laxativeDetails: '',
			antiDiarrhoeals: '',
			biologics: '',
			biologicDetails: '',
			steroids: '',
			steroidDetails: '',
			nsaids: '',
			nsaidDetails: '',
			otherMedications: []
		},
		allergiesDiet: {
			drugAllergies: [],
			foodIntolerances: '',
			dietaryRestrictions: '',
			glutenIntolerance: '',
			lactoseIntolerance: ''
		},
		redFlagsSocial: {
			unexplainedWeightLoss: '',
			weightLossAmount: '',
			appetiteChange: '',
			appetiteDetails: '',
			familyGICancer: '',
			familyCancerDetails: '',
			smoking: '',
			smokingPackYears: null,
			alcoholUse: ''
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
