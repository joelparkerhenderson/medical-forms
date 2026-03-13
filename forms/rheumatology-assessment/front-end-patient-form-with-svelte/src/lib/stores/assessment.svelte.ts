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
			primaryJointComplaint: '',
			onsetDate: '',
			durationMonths: null,
			morningStiffnessDurationMinutes: null,
			symmetricInvolvement: ''
		},
		jointAssessment: {
			tenderJointCount28: null,
			swollenJointCount28: null,
			painVAS: null,
			patientGlobalVAS: null
		},
		diseaseHistory: {
			primaryDiagnosis: '',
			diagnosisDate: '',
			diseaseDurationYears: null,
			previousDMARDs: '',
			previousBiologics: '',
			remissionPeriods: '',
			remissionDetails: ''
		},
		extraArticularFeatures: {
			rheumatoidNodules: '',
			skinRash: '',
			skinRashDetails: '',
			eyeDryness: '',
			uveitis: '',
			uveitisDetails: '',
			interstitialLungDisease: '',
			ildDetails: '',
			cardiovascularInvolvement: '',
			cardiovascularDetails: ''
		},
		laboratoryResults: {
			esr: null,
			crp: null,
			rheumatoidFactor: '',
			antiCCP: '',
			ana: '',
			hlaB27: '',
			haemoglobin: null,
			whiteBloodCellCount: null,
			plateletCount: null,
			creatinine: null,
			egfr: null,
			alt: null,
			ast: null
		},
		currentMedications: {
			dmards: [],
			biologics: [],
			nsaids: [],
			steroids: [],
			painMedication: [],
			supplements: []
		},
		allergies: {
			drugAllergies: [],
			latexAllergy: ''
		},
		functionalAssessment: {
			haqDiScore: null,
			gripStrengthLeft: null,
			gripStrengthRight: null,
			walkingAbility: '',
			adlLimitations: '',
			workDisability: '',
			workDisabilityDetails: ''
		},
		comorbiditiesSocial: {
			cardiovascularRisk: '',
			cardiovascularRiskDetails: '',
			osteoporosis: '',
			osteoporosisOnTreatment: '',
			recentInfections: '',
			recentInfectionDetails: '',
			tuberculosisScreening: '',
			vaccinationStatusUpToDate: '',
			vaccinationDetails: '',
			smoking: '',
			smokingPackYears: null,
			exerciseFrequency: ''
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
