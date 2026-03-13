import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		personalInformation: {
			fullLegalName: '',
			dateOfBirth: '',
			nhsNumber: '',
			address: '',
			postcode: '',
			telephone: '',
			email: '',
			gpName: '',
			gpPractice: '',
			gpAddress: '',
			gpTelephone: ''
		},
		capacityDeclaration: {
			confirmsCapacity: '',
			understandsConsequences: '',
			noUndueInfluence: '',
			professionalCapacityAssessment: '',
			assessedByName: '',
			assessedByRole: '',
			assessmentDate: '',
			assessmentDetails: ''
		},
		circumstances: {
			specificCircumstances: '',
			medicalConditions: '',
			situationsDescription: ''
		},
		treatmentsRefusedGeneral: {
			antibiotics: { treatment: 'Antibiotics', refused: '', specification: '' },
			bloodTransfusion: { treatment: 'Blood Transfusion', refused: '', specification: '' },
			ivFluids: { treatment: 'IV Fluids', refused: '', specification: '' },
			tubeFeeding: { treatment: 'Tube Feeding', refused: '', specification: '' },
			dialysis: { treatment: 'Dialysis', refused: '', specification: '' },
			ventilation: { treatment: 'Ventilation', refused: '', specification: '' },
			otherTreatments: []
		},
		treatmentsRefusedLifeSustaining: {
			cpr: { treatment: 'CPR', refused: '', evenIfLifeAtRisk: '', specification: '' },
			mechanicalVentilation: { treatment: 'Mechanical Ventilation', refused: '', evenIfLifeAtRisk: '', specification: '' },
			artificialNutritionHydration: { treatment: 'Artificial Nutrition/Hydration', refused: '', evenIfLifeAtRisk: '', specification: '' },
			otherLifeSustaining: []
		},
		exceptionsConditions: {
			hasExceptions: '',
			exceptionsDescription: '',
			hasTimeLimitations: '',
			timeLimitationsDescription: '',
			invalidatingConditions: ''
		},
		otherWishes: {
			preferredCareSetting: '',
			comfortMeasures: '',
			spiritualReligiousWishes: '',
			otherPreferences: ''
		},
		lastingPowerOfAttorney: {
			hasLPA: '',
			lpaType: '',
			lpaRegistered: '',
			lpaRegistrationDate: '',
			doneeNames: '',
			relationshipBetweenADRTAndLPA: ''
		},
		healthcareProfessionalReview: {
			reviewedByClinicianName: '',
			reviewedByClinicianRole: '',
			reviewDate: '',
			clinicalOpinionOnCapacity: '',
			anyConcerns: '',
			concernsDetails: ''
		},
		legalSignatures: {
			patientSignature: '',
			patientStatementOfUnderstanding: '',
			patientSignatureDate: '',
			witnessSignature: '',
			witnessName: '',
			witnessAddress: '',
			witnessSignatureDate: '',
			lifeSustainingWrittenStatement: '',
			lifeSustainingStatementText: '',
			lifeSustainingSignature: '',
			lifeSustainingWitnessSignature: '',
			lifeSustainingWitnessName: '',
			lifeSustainingWitnessAddress: ''
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
