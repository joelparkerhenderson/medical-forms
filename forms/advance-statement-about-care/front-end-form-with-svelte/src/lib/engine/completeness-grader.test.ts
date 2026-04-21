import { describe, it, expect } from 'vitest';
import { calculateCompleteness } from './completeness-grader';
import { detectFlaggedIssues } from './flagged-issues';
import { completenessRules } from './completeness-rules';
import type { StatementData } from './types';

function createEmptyStatement(): StatementData {
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

function createCompleteStatement(): StatementData {
	return {
		personalInformation: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1950-03-15',
			nhsNumber: '943 476 5919',
			address: '42 Oak Lane, London',
			postcode: 'SW1A 1AA',
			telephone: '07700 900000',
			email: 'jane@example.com',
			gpName: 'Dr Williams',
			gpPractice: 'Oak Surgery',
			gpTelephone: '020 7946 0000'
		},
		statementContext: {
			reasonForStatement: 'Diagnosed with early stage dementia, wish to record my preferences while I have capacity',
			currentDiagnosis: 'Early stage Alzheimer\'s disease',
			understandingOfCondition: 'I understand my condition will progressively affect my cognitive abilities',
			whenStatementShouldApply: 'When I am no longer able to make decisions for myself',
			previousAdvanceStatements: 'no',
			previousStatementDetails: ''
		},
		valuesBeliefs: {
			religiousBeliefs: 'Church of England',
			spiritualBeliefs: 'I find comfort in prayer and quiet reflection',
			culturalValues: 'Family gatherings are important to me',
			qualityOfLifePriorities: 'Being able to recognise my family and be free from pain',
			whatMakesLifeMeaningful: 'My grandchildren, gardening, and music',
			importantTraditions: 'Sunday family lunch, Christmas traditions',
			viewsOnDying: 'I wish to die peacefully without unnecessary intervention'
		},
		carePreferences: {
			preferredPlaceOfCare: 'home',
			preferredPlaceOfDeath: 'home',
			personalComfortPreferences: 'I like to have fresh flowers nearby and classical music playing',
			dailyRoutinePreferences: 'I prefer to wake early, have tea at 7am, lunch at noon',
			dietaryRequirements: 'No specific dietary requirements, enjoy traditional English food',
			clothingPreferences: 'Comfortable, familiar clothing. I dislike hospital gowns.',
			hygienePreferences: 'Daily wash, prefer bath to shower',
			environmentPreferences: 'Quiet room with natural light, window open when weather permits'
		},
		medicalTreatmentWishes: {
			painManagementPreferences: 'I wish to be kept comfortable and pain-free, even if this shortens my life',
			nutritionHydrationWishes: 'I would like to be offered food and drink but do not wish for artificial nutrition if I cannot swallow',
			ventilationWishes: 'I do not wish to be placed on a ventilator',
			resuscitationWishes: 'I do not wish to be resuscitated if my heart stops. This is my expressed wish, not a legally binding ADRT.',
			antibioticsWishes: 'I would accept antibiotics for comfort but not to prolong life in end-stage illness',
			hospitalisationWishes: 'I prefer to remain at home unless hospital care would significantly improve my comfort',
			bloodTransfusionWishes: 'I would accept blood transfusion if it would improve quality of life',
			organDonationWishes: 'I am registered as an organ donor'
		},
		communicationPreferences: {
			preferredLanguage: 'English',
			communicationAids: 'I wear reading glasses and a hearing aid in my right ear',
			howToBeAddressed: 'Jane, not Mrs Smith',
			informationSharingPreferences: 'My daughter Sarah may be told everything about my condition',
			interpreterNeeded: 'no',
			interpreterLanguage: ''
		},
		peopleImportantToMe: {
			people: [
				{
					name: 'Sarah Thompson',
					relationship: 'Daughter',
					telephone: '07700 900001',
					email: 'sarah@example.com',
					role: 'Main contact for all care decisions'
				},
				{
					name: 'Rev. Michael Brown',
					relationship: 'Vicar',
					telephone: '020 7946 0001',
					email: '',
					role: 'Spiritual support'
				}
			],
			petsDetails: 'Labrador called Rosie',
			petCareArrangements: 'Sarah will care for Rosie'
		},
		practicalMatters: {
			financialArrangements: 'Sarah has lasting power of attorney for finances',
			propertyMatters: 'House is owned outright, mortgage paid off',
			petCareInstructions: 'Rosie needs daily walks and veterinary check-ups every 6 months',
			socialMediaWishes: 'Please close my Facebook account',
			personalBelongings: 'Wedding ring to Sarah, watch to grandson Tom',
			funeralWishes: 'Church service at St Mary\'s, burial not cremation',
			willDetails: 'Will held by solicitor, Harrison & Co, High Street',
			powerOfAttorneyDetails: 'Sarah Thompson has lasting power of attorney for health and welfare'
		},
		signaturesWitnesses: {
			patientSignature: 'Jane Smith',
			patientSignatureDate: '2026-01-15',
			witnessName: 'Dr Robert Jones',
			witnessAddress: '10 Medical Centre, London SW1',
			witnessSignature: 'R. Jones',
			witnessSignatureDate: '2026-01-15',
			reviewDate: '2027-01-15',
			healthcareProfessionalName: 'Dr Williams',
			healthcareProfessionalRole: 'General Practitioner',
			healthcareProfessionalSignature: 'A. Williams',
			healthcareProfessionalDate: '2026-01-16'
		}
	};
}

describe('Completeness Grading Engine', () => {
	it('returns incomplete for an empty statement', () => {
		const data = createEmptyStatement();
		const result = calculateCompleteness(data);
		expect(result.level).toBe('incomplete');
		expect(result.missingSections.length).toBeGreaterThan(0);
		expect(result.completedCount).toBe(0);
	});

	it('returns partial for a statement with some sections filled', () => {
		const data = createEmptyStatement();
		data.personalInformation.firstName = 'Jane';
		data.personalInformation.lastName = 'Smith';
		data.personalInformation.dateOfBirth = '1950-03-15';
		data.personalInformation.address = '42 Oak Lane';

		const result = calculateCompleteness(data);
		expect(result.level).toBe('partial');
		expect(result.completedCount).toBeGreaterThan(0);
	});

	it('returns complete for a fully filled required statement', () => {
		const data = createCompleteStatement();
		// Remove witness and HCP to prevent verified
		data.signaturesWitnesses.witnessName = '';
		data.signaturesWitnesses.witnessSignature = '';
		data.signaturesWitnesses.healthcareProfessionalName = '';
		data.signaturesWitnesses.healthcareProfessionalSignature = '';

		const result = calculateCompleteness(data);
		expect(result.level).toBe('complete');
	});

	it('returns verified for complete + witnessed + HCP acknowledged', () => {
		const data = createCompleteStatement();
		const result = calculateCompleteness(data);
		expect(result.level).toBe('verified');
	});

	it('detects all rule IDs are unique', () => {
		const ids = completenessRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('counts completed and total correctly', () => {
		const data = createCompleteStatement();
		const result = calculateCompleteness(data);
		expect(result.totalCount).toBe(completenessRules.length);
		expect(result.completedCount).toBeLessThanOrEqual(result.totalCount);
	});
});

describe('Flagged Issues Detection', () => {
	it('flags unsigned statement', () => {
		const data = createEmptyStatement();
		const flags = detectFlaggedIssues(data);
		expect(flags.some((f) => f.id === 'FLAG-SIGN-001')).toBe(true);
	});

	it('flags no witness', () => {
		const data = createEmptyStatement();
		const flags = detectFlaggedIssues(data);
		expect(flags.some((f) => f.id === 'FLAG-WITNESS-001')).toBe(true);
	});

	it('flags no review date', () => {
		const data = createEmptyStatement();
		const flags = detectFlaggedIssues(data);
		expect(flags.some((f) => f.id === 'FLAG-REVIEW-001')).toBe(true);
	});

	it('flags no emergency contact', () => {
		const data = createEmptyStatement();
		const flags = detectFlaggedIssues(data);
		expect(flags.some((f) => f.id === 'FLAG-CONTACT-001')).toBe(true);
	});

	it('does not flag signed and witnessed complete statement', () => {
		const data = createCompleteStatement();
		const flags = detectFlaggedIssues(data);
		expect(flags.some((f) => f.id === 'FLAG-SIGN-001')).toBe(false);
		expect(flags.some((f) => f.id === 'FLAG-WITNESS-001')).toBe(false);
		expect(flags.some((f) => f.id === 'FLAG-CONTACT-001')).toBe(false);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createEmptyStatement();
		const flags = detectFlaggedIssues(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
