import { describe, it, expect } from 'vitest';
import { calculateDevelopmentalScreen } from './dev-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { devScreenRules } from './dev-rules';
import type { AssessmentData } from './types';

function createHealthyChild(): AssessmentData {
	return {
		demographics: {
			childFirstName: 'Emma',
			childLastName: 'Smith',
			dateOfBirth: '2023-01-15',
			sex: 'female',
			weight: 12,
			height: 80,
			headCircumference: 47,
			parentGuardianName: 'Jane Smith',
			parentGuardianRelationship: 'Mother',
			parentGuardianPhone: '07700 900123',
			parentGuardianEmail: 'jane.smith@example.com'
		},
		birthHistory: {
			gestationalAge: 39,
			birthWeight: 3.4,
			deliveryType: 'vaginal',
			apgarOneMinute: 8,
			apgarFiveMinutes: 9,
			nicuStay: 'no',
			nicuDuration: null,
			birthComplications: 'no',
			birthComplicationDetails: ''
		},
		growthNutrition: {
			weightPercentile: 50,
			heightPercentile: 55,
			headCircumferencePercentile: 50,
			feedingType: 'solid',
			dietaryConcerns: 'no',
			dietaryConcernDetails: '',
			failureToThrive: 'no'
		},
		developmentalMilestones: {
			grossMotor: 'pass',
			grossMotorNotes: '',
			fineMotor: 'pass',
			fineMotorNotes: '',
			language: 'pass',
			languageNotes: '',
			socialEmotional: 'pass',
			socialEmotionalNotes: '',
			cognitive: 'pass',
			cognitiveNotes: ''
		},
		immunizationStatus: {
			upToDate: 'yes',
			missingVaccinations: '',
			adverseReactions: 'no',
			adverseReactionDetails: '',
			exemptions: 'no',
			exemptionDetails: ''
		},
		medicalHistory: {
			chronicConditions: 'no',
			chronicConditionDetails: '',
			previousHospitalizations: 'no',
			hospitalizationDetails: '',
			previousSurgeries: 'no',
			surgeryDetails: '',
			recurringInfections: 'no',
			infectionDetails: ''
		},
		currentMedications: {
			prescriptions: [],
			otcMedications: [],
			supplements: [],
			allergies: []
		},
		familyHistory: {
			geneticConditions: 'no',
			geneticConditionDetails: '',
			chronicDiseases: 'no',
			chronicDiseaseDetails: '',
			developmentalDisorders: 'no',
			developmentalDisorderDetails: '',
			consanguinity: 'no'
		},
		socialEnvironmental: {
			homeEnvironment: 'Stable two-parent household',
			schoolPerformance: 'not-applicable',
			behaviouralConcerns: 'no',
			behaviouralConcernDetails: '',
			safeguardingConcerns: 'no',
			safeguardingDetails: '',
			screenTimeHoursPerDay: 1
		}
	};
}

describe('Developmental Screen Engine', () => {
	it('returns Normal for a healthy child', () => {
		const data = createHealthyChild();
		const result = calculateDevelopmentalScreen(data);
		expect(result.overallResult).toBe('normal');
	});

	it('returns Developmental Concern when gross motor has concern', () => {
		const data = createHealthyChild();
		data.developmentalMilestones.grossMotor = 'concern';

		const result = calculateDevelopmentalScreen(data);
		expect(result.overallResult).toBe('developmental-concern');
		expect(result.firedRules.some((r) => r.id === 'GM-001')).toBe(true);
	});

	it('returns Developmental Delay when language has fail', () => {
		const data = createHealthyChild();
		data.developmentalMilestones.language = 'fail';

		const result = calculateDevelopmentalScreen(data);
		expect(result.overallResult).toBe('developmental-delay');
		expect(result.firedRules.some((r) => r.id === 'LG-002')).toBe(true);
	});

	it('returns Developmental Delay with multiple domain failures', () => {
		const data = createHealthyChild();
		data.developmentalMilestones.grossMotor = 'fail';
		data.developmentalMilestones.language = 'fail';
		data.developmentalMilestones.cognitive = 'concern';

		const result = calculateDevelopmentalScreen(data);
		expect(result.overallResult).toBe('developmental-delay');
		expect(result.firedRules.length).toBeGreaterThanOrEqual(3);
	});

	it('returns Developmental Delay for failure to thrive', () => {
		const data = createHealthyChild();
		data.growthNutrition.failureToThrive = 'yes';

		const result = calculateDevelopmentalScreen(data);
		expect(result.overallResult).toBe('developmental-delay');
		expect(result.firedRules.some((r) => r.id === 'GR-001')).toBe(true);
	});

	it('returns Developmental Concern for preterm birth', () => {
		const data = createHealthyChild();
		data.birthHistory.gestationalAge = 35;

		const result = calculateDevelopmentalScreen(data);
		expect(result.overallResult).toBe('developmental-concern');
		expect(result.firedRules.some((r) => r.id === 'BH-002')).toBe(true);
	});

	it('detects all rule IDs are unique', () => {
		const ids = devScreenRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy child', () => {
		const data = createHealthyChild();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags failure to thrive', () => {
		const data = createHealthyChild();
		data.growthNutrition.failureToThrive = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-FTT-001')).toBe(true);
		expect(flags.find((f) => f.id === 'FLAG-FTT-001')?.priority).toBe('high');
	});

	it('flags missed vaccinations', () => {
		const data = createHealthyChild();
		data.immunizationStatus.upToDate = 'no';
		data.immunizationStatus.missingVaccinations = 'MMR, DTP';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-IMMUN-001')).toBe(true);
		expect(flags.find((f) => f.id === 'FLAG-IMMUN-001')?.priority).toBe('medium');
	});

	it('flags developmental delay', () => {
		const data = createHealthyChild();
		data.developmentalMilestones.language = 'fail';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-DEV-001')).toBe(true);
		expect(flags.find((f) => f.id === 'FLAG-DEV-001')?.priority).toBe('high');
	});

	it('flags safeguarding concern', () => {
		const data = createHealthyChild();
		data.socialEnvironmental.safeguardingConcerns = 'yes';
		data.socialEnvironmental.safeguardingDetails = 'Unexplained bruising';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SAFEGUARD-001')).toBe(true);
		expect(flags.find((f) => f.id === 'FLAG-SAFEGUARD-001')?.priority).toBe('high');
	});

	it('flags NICU history', () => {
		const data = createHealthyChild();
		data.birthHistory.nicuStay = 'yes';
		data.birthHistory.nicuDuration = 14;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-NICU-001')).toBe(true);
		expect(flags.find((f) => f.id === 'FLAG-NICU-001')?.priority).toBe('medium');
	});

	it('flags anaphylaxis allergy', () => {
		const data = createHealthyChild();
		data.currentMedications.allergies = [
			{ allergen: 'Peanuts', reaction: 'Anaphylactic shock', severity: 'anaphylaxis' }
		];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Allergy' && f.priority === 'high')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyChild();
		data.growthNutrition.failureToThrive = 'yes';
		data.immunizationStatus.upToDate = 'no';
		data.socialEnvironmental.screenTimeHoursPerDay = 6;
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
