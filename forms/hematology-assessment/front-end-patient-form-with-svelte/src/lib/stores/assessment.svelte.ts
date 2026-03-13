import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		patientInformation: {
			patientName: '',
			dateOfBirth: '',
			medicalRecordNumber: '',
			referringPhysician: '',
			clinicalIndication: '',
			specimenDate: '',
			specimenType: ''
		},
		bloodCountAnalysis: {
			hemoglobin: null,
			hematocrit: null,
			redBloodCellCount: null,
			whiteBloodCellCount: null,
			plateletCount: null,
			meanCorpuscularVolume: null,
			meanCorpuscularHemoglobin: null,
			redCellDistributionWidth: null
		},
		coagulationStudies: {
			prothrombinTime: null,
			inr: null,
			activatedPartialThromboplastinTime: null,
			fibrinogen: null,
			dDimer: null,
			bleedingTime: null
		},
		peripheralBloodFilm: {
			redCellMorphology: '',
			whiteBloodCellDifferential: '',
			plateletMorphology: '',
			abnormalCellMorphology: '',
			filmQuality: null,
			filmComments: ''
		},
		ironStudies: {
			serumIron: null,
			totalIronBindingCapacity: null,
			transferrinSaturation: null,
			serumFerritin: null,
			reticulocyteCount: null
		},
		hemoglobinopathyScreening: {
			hemoglobinElectrophoresis: '',
			sickleCellScreen: '',
			thalassemiaScreen: '',
			hplcResults: '',
			geneticTestingNotes: ''
		},
		boneMarrowAssessment: {
			aspirateFindings: '',
			biopsyFindings: '',
			cellularity: null,
			cytogeneticsResults: '',
			flowCytometryResults: '',
			boneMarrowComments: ''
		},
		transfusionHistory: {
			previousTransfusions: '',
			transfusionReactions: '',
			bloodGroupType: '',
			antibodyScreen: '',
			crossmatchResults: ''
		},
		treatmentMedications: {
			currentMedications: '',
			chemotherapyRegimen: '',
			anticoagulantTherapy: '',
			ironTherapy: '',
			treatmentResponse: '',
			adverseEffects: ''
		},
		clinicalReview: {
			clinicalSummary: '',
			diagnosis: '',
			followUpPlan: '',
			urgencyLevel: null,
			reviewerName: '',
			reviewDate: '',
			additionalNotes: ''
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
