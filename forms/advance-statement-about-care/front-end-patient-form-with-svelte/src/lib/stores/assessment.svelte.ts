import type { StatementData, CompletenessResult } from '$lib/engine/types';

function createDefaultStatement(): StatementData {
	return {
		personalInformation: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			nhsNumber: '',
			address: '',
			postcode: '',
			telephone: '',
			email: '',
			gpName: '',
			gpPractice: '',
			gpTelephone: ''
		},
		statementContext: {
			reasonForStatement: '',
			currentDiagnosis: '',
			understandingOfCondition: '',
			whenStatementShouldApply: '',
			previousAdvanceStatements: '',
			previousStatementDetails: ''
		},
		valuesBeliefs: {
			religiousBeliefs: '',
			spiritualBeliefs: '',
			culturalValues: '',
			qualityOfLifePriorities: '',
			whatMakesLifeMeaningful: '',
			importantTraditions: '',
			viewsOnDying: ''
		},
		carePreferences: {
			preferredPlaceOfCare: '',
			preferredPlaceOfDeath: '',
			personalComfortPreferences: '',
			dailyRoutinePreferences: '',
			dietaryRequirements: '',
			clothingPreferences: '',
			hygienePreferences: '',
			environmentPreferences: ''
		},
		medicalTreatmentWishes: {
			painManagementPreferences: '',
			nutritionHydrationWishes: '',
			ventilationWishes: '',
			resuscitationWishes: '',
			antibioticsWishes: '',
			hospitalisationWishes: '',
			bloodTransfusionWishes: '',
			organDonationWishes: ''
		},
		communicationPreferences: {
			preferredLanguage: '',
			communicationAids: '',
			howToBeAddressed: '',
			informationSharingPreferences: '',
			interpreterNeeded: '',
			interpreterLanguage: ''
		},
		peopleImportantToMe: {
			people: [],
			petsDetails: '',
			petCareArrangements: ''
		},
		practicalMatters: {
			financialArrangements: '',
			propertyMatters: '',
			petCareInstructions: '',
			socialMediaWishes: '',
			personalBelongings: '',
			funeralWishes: '',
			willDetails: '',
			powerOfAttorneyDetails: ''
		},
		signaturesWitnesses: {
			patientSignature: '',
			patientSignatureDate: '',
			witnessName: '',
			witnessAddress: '',
			witnessSignature: '',
			witnessSignatureDate: '',
			reviewDate: '',
			healthcareProfessionalName: '',
			healthcareProfessionalRole: '',
			healthcareProfessionalSignature: '',
			healthcareProfessionalDate: ''
		}
	};
}

class AssessmentStore {
	data = $state<StatementData>(createDefaultStatement());
	result = $state<CompletenessResult | null>(null);
	currentStep = $state(1);

	reset() {
		this.data = createDefaultStatement();
		this.result = null;
		this.currentStep = 1;
	}
}

export const assessment = new AssessmentStore();
