import { describe, it, expect } from 'vitest';
import { calculateGAF } from './gaf-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { gafRules } from './gaf-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'John',
			lastName: 'Doe',
			dateOfBirth: '1985-01-01',
			sex: 'male',
			emergencyContactName: 'Jane Doe',
			emergencyContactPhone: '07700900000',
			legalStatus: 'voluntary'
		},
		presentingComplaint: {
			chiefComplaint: '',
			onsetDate: '',
			duration: '',
			severity: '',
			precipitatingFactors: ''
		},
		psychiatricHistory: {
			previousDiagnoses: '',
			previousHospitalizations: 'no',
			hospitalizationDetails: '',
			previousSuicideAttempts: 'no',
			suicideAttemptDetails: '',
			selfHarmHistory: 'no',
			selfHarmDetails: ''
		},
		mentalStatusExam: {
			appearance: '',
			behaviour: '',
			speech: '',
			mood: 'euthymic',
			affect: 'congruent',
			thoughtProcess: 'linear',
			thoughtContent: '',
			perceptualDisturbances: 'no',
			perceptualDetails: '',
			cognitionIntact: 'yes',
			cognitionDetails: '',
			insight: 'full',
			judgement: 'intact'
		},
		riskAssessment: {
			suicidalIdeation: 'no',
			suicidalPlan: 'no',
			suicidalIntent: 'no',
			suicidalMeans: 'no',
			protectiveFactors: '',
			selfHarmCurrent: 'no',
			violenceRisk: 'none',
			safeguardingConcerns: 'no',
			safeguardingDetails: ''
		},
		moodAndAnxiety: {
			phq9Score: null,
			gad7Score: null,
			maniaScreen: 'no',
			maniaDetails: '',
			psychoticSymptoms: 'no',
			psychoticDetails: ''
		},
		substanceUse: {
			alcoholAuditScore: null,
			alcoholFrequency: 'none',
			drugUse: 'no',
			drugDetails: '',
			tobaccoUse: 'no',
			tobaccoDetails: '',
			gamblingProblem: 'no',
			withdrawalRisk: 'no',
			withdrawalDetails: ''
		},
		currentMedications: {
			medications: [],
			sideEffects: '',
			compliance: '',
			complianceDetails: ''
		},
		medicalHistory: {
			neurologicalConditions: 'no',
			neurologicalDetails: '',
			endocrineConditions: 'no',
			endocrineDetails: '',
			chronicPain: 'no',
			chronicPainDetails: '',
			pregnancy: 'no',
			pregnancyDetails: ''
		},
		socialHistory: {
			housing: 'stable',
			housingDetails: '',
			employment: 'employed',
			employmentDetails: '',
			relationships: '',
			legalIssues: 'no',
			legalDetails: '',
			financialDifficulties: 'no',
			supportNetwork: ''
		},
		capacityAndConsent: {
			decisionMakingCapacity: 'has-capacity',
			capacityDetails: '',
			advanceDirectives: 'no',
			advanceDirectiveDetails: '',
			powerOfAttorney: 'no',
			powerOfAttorneyDetails: '',
			treatmentPreferences: ''
		}
	};
}

describe('GAF Grading Engine', () => {
	it('returns GAF 100 for a healthy patient with no symptoms', () => {
		const data = createHealthyPatient();
		const result = calculateGAF(data);
		expect(result.gafScore).toBe(100);
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns moderate GAF for mild depression + mild anxiety', () => {
		const data = createHealthyPatient();
		data.presentingComplaint.severity = 'mild';
		data.moodAndAnxiety.phq9Score = 12;
		data.moodAndAnxiety.gad7Score = 11;

		const result = calculateGAF(data);
		// 100 - 15 (PC-001) - 15 (MA-001) - 10 (MA-004) = 60
		expect(result.gafScore).toBe(60);
		expect(result.firedRules.length).toBeGreaterThanOrEqual(3);
	});

	it('returns low GAF for severe symptoms with suicidal ideation', () => {
		const data = createHealthyPatient();
		data.presentingComplaint.severity = 'severe';
		data.riskAssessment.suicidalIdeation = 'yes';
		data.riskAssessment.suicidalPlan = 'yes';
		data.mentalStatusExam.mood = 'depressed';
		data.moodAndAnxiety.phq9Score = 22;

		const result = calculateGAF(data);
		// Multiple severe impacts should result in very low GAF
		expect(result.gafScore).toBeLessThanOrEqual(20);
	});

	it('returns GAF >= 1 even with maximum rule impacts', () => {
		const data = createHealthyPatient();
		data.presentingComplaint.severity = 'severe';
		data.riskAssessment.suicidalIdeation = 'yes';
		data.riskAssessment.suicidalPlan = 'yes';
		data.riskAssessment.suicidalIntent = 'yes';
		data.riskAssessment.suicidalMeans = 'yes';
		data.riskAssessment.selfHarmCurrent = 'yes';
		data.riskAssessment.violenceRisk = 'high';
		data.mentalStatusExam.perceptualDisturbances = 'yes';
		data.moodAndAnxiety.psychoticSymptoms = 'yes';
		data.moodAndAnxiety.phq9Score = 27;
		data.substanceUse.withdrawalRisk = 'yes';

		const result = calculateGAF(data);
		expect(result.gafScore).toBeGreaterThanOrEqual(1);
	});

	it('detects all rule IDs are unique', () => {
		const ids = gafRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags active suicidal ideation', () => {
		const data = createHealthyPatient();
		data.riskAssessment.suicidalIdeation = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SUICIDE-001')).toBe(true);
	});

	it('flags psychotic symptoms', () => {
		const data = createHealthyPatient();
		data.moodAndAnxiety.psychoticSymptoms = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PSYCHOSIS-001')).toBe(true);
	});

	it('flags involuntary status', () => {
		const data = createHealthyPatient();
		data.demographics.legalStatus = 'involuntary';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-LEGAL-001')).toBe(true);
	});

	it('flags substance withdrawal risk', () => {
		const data = createHealthyPatient();
		data.substanceUse.withdrawalRisk = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-WITHDRAWAL-001')).toBe(true);
	});

	it('flags violence risk', () => {
		const data = createHealthyPatient();
		data.riskAssessment.violenceRisk = 'high';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-VIOLENCE-001')).toBe(true);
	});

	it('flags medication non-compliance', () => {
		const data = createHealthyPatient();
		data.currentMedications.compliance = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-MED-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.riskAssessment.suicidalIdeation = 'yes';
		data.currentMedications.compliance = 'no';
		data.socialHistory.housing = 'homeless';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
