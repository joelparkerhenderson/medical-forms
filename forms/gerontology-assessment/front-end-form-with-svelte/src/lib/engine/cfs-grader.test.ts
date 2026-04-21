import { describe, it, expect } from 'vitest';
import { calculateCFS } from './cfs-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { cfsRules } from './cfs-rules';
import type { AssessmentData } from './types';

function createFitElderly(): AssessmentData {
	return {
		demographics: {
			firstName: 'Margaret',
			lastName: 'Thompson',
			dateOfBirth: '1940-03-15',
			sex: 'female',
			weight: 65,
			height: 160,
			bmi: 25.4,
			livingSituation: 'independent'
		},
		functionalAssessment: {
			bathingADL: 'independent',
			dressingADL: 'independent',
			toiletingADL: 'independent',
			transferringADL: 'independent',
			feedingADL: 'independent',
			cookingIADL: 'independent',
			cleaningIADL: 'independent',
			shoppingIADL: 'independent',
			financesIADL: 'independent',
			medicationManagementIADL: 'independent'
		},
		cognitiveScreen: {
			mmseScore: 28,
			mocaScore: 27,
			orientationIntact: 'yes',
			memoryImpairment: 'no',
			executiveFunctionImpairment: 'no',
			deliriumRisk: 'no',
			cognitiveStatus: 'normal'
		},
		mobilityFalls: {
			gaitAssessment: 'normal',
			balanceAssessment: 'normal',
			fallHistory: 'no',
			fallsLastYear: null,
			fearOfFalling: 'no',
			mobilityAids: 'no',
			mobilityAidType: '',
			timedUpAndGo: null
		},
		nutrition: {
			weightChangeLastSixMonths: 'no',
			weightChangeKg: null,
			weightChangeDirection: '',
			appetite: 'normal',
			swallowingDifficulties: 'no',
			dentalStatus: 'good',
			mnaScore: 26
		},
		polypharmacyReview: {
			numberOfMedications: 2,
			highRiskMedications: 'no',
			highRiskMedicationDetails: '',
			beersCriteriaFlags: 'no',
			beersCriteriaDetails: '',
			medicationAdherence: 'good'
		},
		medications: [],
		comorbidities: {
			cardiovascularDisease: 'no',
			cardiovascularDetails: '',
			diabetes: 'no',
			diabetesControl: '',
			renalDisease: 'no',
			renalDetails: '',
			respiratoryDisease: 'no',
			respiratoryDetails: '',
			musculoskeletalDisease: 'no',
			musculoskeletalDetails: '',
			visualDeficit: 'no',
			hearingDeficit: 'no'
		},
		psychosocial: {
			depressionScreen: 'normal',
			gds15Score: 2,
			socialIsolation: 'none',
			hasCaregiver: 'no',
			caregiverDetails: '',
			advanceDirectives: 'no',
			advanceDirectiveDetails: ''
		},
		continenceSkin: {
			urinaryIncontinence: 'none',
			urinaryIncontinenceFrequency: 'none',
			faecalIncontinence: 'no',
			faecalIncontinenceFrequency: 'none',
			bradenScale: 23,
			pressureInjuryPresent: 'no',
			pressureInjuryStage: '',
			skinIntegrity: 'intact'
		}
	};
}

describe('CFS Grading Engine', () => {
	it('returns CFS 1 for a very fit elderly patient', () => {
		const data = createFitElderly();
		const result = calculateCFS(data);
		expect(result.cfsScore).toBe(1);
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns CFS 4 for vulnerable patient with mild cognitive impairment', () => {
		const data = createFitElderly();
		data.cognitiveScreen.cognitiveStatus = 'mild-impairment';

		const result = calculateCFS(data);
		expect(result.cfsScore).toBe(4);
		expect(result.firedRules.some((r) => r.id === 'CFS-008')).toBe(true);
	});

	it('returns CFS 5 for mildly frail with falls and unsteady gait', () => {
		const data = createFitElderly();
		data.mobilityFalls.gaitAssessment = 'unsteady';
		data.mobilityFalls.fallHistory = 'yes';
		data.mobilityFalls.fallsLastYear = 2;
		data.mobilityFalls.timedUpAndGo = 16;

		const result = calculateCFS(data);
		expect(result.cfsScore).toBe(5);
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns CFS 6 for moderately frail with multiple comorbidities', () => {
		const data = createFitElderly();
		data.mobilityFalls.fallHistory = 'yes';
		data.mobilityFalls.fallsLastYear = 4;
		data.mobilityFalls.gaitAssessment = 'unsteady';
		data.comorbidities.diabetes = 'yes';
		data.comorbidities.diabetesControl = 'poorly-controlled';
		data.comorbidities.cardiovascularDisease = 'yes';
		data.psychosocial.depressionScreen = 'moderate';

		const result = calculateCFS(data);
		expect(result.cfsScore).toBe(6);
		expect(result.firedRules.length).toBeGreaterThanOrEqual(3);
	});

	it('returns CFS 7 for severely frail with all ADLs dependent', () => {
		const data = createFitElderly();
		data.functionalAssessment.bathingADL = 'dependent';
		data.functionalAssessment.dressingADL = 'dependent';
		data.functionalAssessment.toiletingADL = 'dependent';
		data.functionalAssessment.transferringADL = 'dependent';
		data.functionalAssessment.feedingADL = 'dependent';
		data.cognitiveScreen.cognitiveStatus = 'severe-impairment';

		const result = calculateCFS(data);
		expect(result.cfsScore).toBe(7);
	});

	it('detects all rule IDs are unique', () => {
		const ids = cfsRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for fit elderly patient', () => {
		const data = createFitElderly();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags high falls risk', () => {
		const data = createFitElderly();
		data.mobilityFalls.fallHistory = 'yes';
		data.mobilityFalls.fallsLastYear = 3;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-FALLS-001')).toBe(true);
	});

	it('flags delirium risk', () => {
		const data = createFitElderly();
		data.cognitiveScreen.deliriumRisk = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-DELIRIUM-001')).toBe(true);
	});

	it('flags polypharmacy', () => {
		const data = createFitElderly();
		data.polypharmacyReview.numberOfMedications = 8;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-POLY-001')).toBe(true);
	});

	it('flags malnutrition', () => {
		const data = createFitElderly();
		data.nutrition.mnaScore = 14;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-NUTR-001')).toBe(true);
	});

	it('flags severe frailty indicators', () => {
		const data = createFitElderly();
		data.cognitiveScreen.cognitiveStatus = 'severe-impairment';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-FRAILTY-001')).toBe(true);
	});

	it('flags pressure injury risk', () => {
		const data = createFitElderly();
		data.continenceSkin.bradenScale = 10;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SKIN-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createFitElderly();
		data.mobilityFalls.fallHistory = 'yes';
		data.mobilityFalls.fallsLastYear = 2;
		data.continenceSkin.bradenScale = 11;
		data.psychosocial.advanceDirectives = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
