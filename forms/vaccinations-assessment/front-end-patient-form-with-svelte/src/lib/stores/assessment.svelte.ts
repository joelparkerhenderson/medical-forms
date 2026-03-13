import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		patientInformation: {
			patientName: '',
			dateOfBirth: '',
			patientSex: '',
			patientAge: '',
			nhsNumber: '',
			gpPractice: '',
			contactPhone: '',
			contactEmail: ''
		},
		immunizationHistory: {
			hasVaccinationRecord: '',
			recordSource: '',
			lastReviewDate: '',
			previousAdverseReactions: '',
			adverseReactionDetails: '',
			immunocompromised: '',
			immunocompromisedDetails: ''
		},
		childhoodVaccinations: {
			dtapIpvHibHepb: null,
			pneumococcal: null,
			rotavirus: null,
			meningitisB: null,
			mmr: null,
			hibMenc: null,
			preschoolBooster: null
		},
		adultVaccinations: {
			tdIpvBooster: null,
			hpv: null,
			meningitisAcwy: null,
			influenzaAnnual: null,
			covid19: null,
			shingles: null,
			pneumococcalPpv: null
		},
		travelVaccinations: {
			travelPlanned: '',
			travelDestination: '',
			hepatitisA: null,
			hepatitisB: null,
			typhoid: null,
			yellowFever: null,
			rabies: null,
			japaneseEncephalitis: null
		},
		occupationalVaccinations: {
			occupation: '',
			healthcareWorker: '',
			hepatitisBOccupational: null,
			influenzaOccupational: null,
			varicella: null,
			bcgTuberculosis: null
		},
		contraindicationsAllergies: {
			eggAllergy: '',
			gelatinAllergy: '',
			latexAllergy: '',
			neomycinAllergy: '',
			pregnant: '',
			pregnancyWeeks: '',
			severeIllness: '',
			previousAnaphylaxis: '',
			anaphylaxisDetails: ''
		},
		consentInformation: {
			informationProvided: null,
			risksExplained: null,
			benefitsExplained: null,
			questionsAnswered: null,
			consentGiven: '',
			consentDate: '',
			guardianConsent: ''
		},
		administrationRecord: {
			vaccineName: '',
			batchNumber: '',
			expiryDate: '',
			administrationSite: '',
			administrationRoute: '',
			doseNumber: '',
			administeredBy: '',
			administrationDate: ''
		},
		clinicalReview: {
			postVaccinationObservation: null,
			immediateReaction: '',
			reactionDetails: '',
			nextDoseDue: '',
			catchUpScheduleNeeded: '',
			referralNeeded: '',
			clinicianNotes: '',
			reviewingClinician: ''
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
