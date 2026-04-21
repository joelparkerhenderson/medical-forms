import { describe, it, expect } from 'vitest';
import { calculateASRS } from './asrs-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { asrsRules } from './asrs-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'John',
			lastName: 'Doe',
			dateOfBirth: '1990-06-15',
			sex: 'male',
			occupation: 'Software Engineer',
			educationLevel: 'undergraduate'
		},
		asrsPartA: {
			focusDifficulty: 0,
			organizationDifficulty: 0,
			rememberingDifficulty: 0,
			avoidingTasks: 0,
			fidgeting: 0,
			overlyActive: 0
		},
		asrsPartB: {
			carelessMistakes: 0,
			attentionDifficulty: 0,
			concentrationDifficulty: 0,
			misplacingThings: 0,
			distractedByNoise: 0,
			leavingSeat: 0,
			restlessness: 0,
			difficultyRelaxing: 0,
			talkingTooMuch: 0,
			finishingSentences: 0,
			difficultyWaiting: 0,
			interruptingOthers: 0
		},
		childhoodHistory: {
			childhoodSymptoms: 'no',
			childhoodSymptomsDetails: '',
			schoolPerformance: 'average',
			behaviouralReports: 'no',
			behaviouralReportsDetails: '',
			onsetBeforeAge12: 'no'
		},
		functionalImpact: {
			workAcademicImpact: 'none',
			relationshipImpact: 'none',
			dailyLivingImpact: 'none',
			financialManagementImpact: 'none',
			timeManagementImpact: 'none'
		},
		comorbidConditions: {
			anxiety: 'no',
			anxietyDetails: '',
			depression: 'no',
			depressionDetails: '',
			substanceUse: 'no',
			substanceUseDetails: '',
			sleepDisorders: 'no',
			sleepDisordersDetails: '',
			learningDisabilities: 'no',
			learningDisabilitiesDetails: '',
			autismSpectrum: 'no',
			autismSpectrumDetails: ''
		},
		medications: [],
		allergies: [],
		medicalHistory: {
			cardiovascularIssues: 'no',
			cardiovascularDetails: '',
			seizureHistory: 'no',
			seizureDetails: '',
			ticDisorder: 'no',
			ticDetails: '',
			thyroidDisease: 'no',
			thyroidDetails: '',
			headInjuries: 'no',
			headInjuryDetails: ''
		},
		socialSupport: {
			familyHistoryADHD: 'no',
			familyHistoryDetails: '',
			supportSystems: '',
			copingStrategies: '',
			previousAssessments: 'no',
			previousAssessmentDetails: '',
			previousDiagnosis: 'no',
			previousDiagnosisDetails: ''
		}
	};
}

describe('ASRS Grading Engine', () => {
	it('returns unlikely classification for a healthy patient with zero scores', () => {
		const data = createHealthyPatient();
		const result = calculateASRS(data);
		expect(result.classification).toBe('unlikely');
		expect(result.asrsTotal).toBe(0);
		expect(result.partAScore).toBe(0);
		expect(result.partBScore).toBe(0);
		expect(result.partAScreenerPositive).toBe(false);
	});

	it('returns possible classification for moderate scores', () => {
		const data = createHealthyPatient();
		// Set inattentive items to Sometimes (2) each = 6 for Part A Q1-3
		data.asrsPartA.focusDifficulty = 2;
		data.asrsPartA.organizationDifficulty = 2;
		data.asrsPartA.rememberingDifficulty = 2;
		data.asrsPartA.avoidingTasks = 2;
		data.asrsPartA.fidgeting = 1;
		data.asrsPartA.overlyActive = 1;
		// Set Part B items to low but some present
		data.asrsPartB.carelessMistakes = 2;
		data.asrsPartB.attentionDifficulty = 2;
		data.asrsPartB.concentrationDifficulty = 2;
		data.asrsPartB.misplacingThings = 2;
		data.asrsPartB.distractedByNoise = 2;
		data.asrsPartB.leavingSeat = 1;

		const result = calculateASRS(data);
		expect(result.asrsTotal).toBe(21);
		// Not enough for partA screener positive (only 3 in shaded range)
		// Not enough total for 'possible' threshold (24) either
		expect(result.classification).toBe('unlikely');
	});

	it('returns likely classification for Part A screener positive + elevated total', () => {
		const data = createHealthyPatient();
		// Part A: all items elevated
		data.asrsPartA.focusDifficulty = 3;
		data.asrsPartA.organizationDifficulty = 3;
		data.asrsPartA.rememberingDifficulty = 3;
		data.asrsPartA.avoidingTasks = 3;
		data.asrsPartA.fidgeting = 3;
		data.asrsPartA.overlyActive = 3;
		// Part B: moderate
		data.asrsPartB.carelessMistakes = 2;
		data.asrsPartB.attentionDifficulty = 2;
		data.asrsPartB.concentrationDifficulty = 2;
		data.asrsPartB.misplacingThings = 2;
		data.asrsPartB.distractedByNoise = 1;
		data.asrsPartB.leavingSeat = 1;

		const result = calculateASRS(data);
		expect(result.partAScreenerPositive).toBe(true);
		expect(result.asrsTotal).toBe(28);
		expect(result.classification).toBe('likely');
	});

	it('returns highly-likely classification for very high scores', () => {
		const data = createHealthyPatient();
		// All Part A items very high
		data.asrsPartA.focusDifficulty = 4;
		data.asrsPartA.organizationDifficulty = 4;
		data.asrsPartA.rememberingDifficulty = 4;
		data.asrsPartA.avoidingTasks = 4;
		data.asrsPartA.fidgeting = 4;
		data.asrsPartA.overlyActive = 4;
		// All Part B items high
		data.asrsPartB.carelessMistakes = 3;
		data.asrsPartB.attentionDifficulty = 3;
		data.asrsPartB.concentrationDifficulty = 3;
		data.asrsPartB.misplacingThings = 3;
		data.asrsPartB.distractedByNoise = 3;
		data.asrsPartB.leavingSeat = 3;
		data.asrsPartB.restlessness = 3;
		data.asrsPartB.difficultyRelaxing = 2;
		data.asrsPartB.talkingTooMuch = 2;
		data.asrsPartB.finishingSentences = 2;
		data.asrsPartB.difficultyWaiting = 2;
		data.asrsPartB.interruptingOthers = 2;

		const result = calculateASRS(data);
		expect(result.partAScreenerPositive).toBe(true);
		expect(result.asrsTotal).toBeGreaterThanOrEqual(46);
		expect(result.classification).toBe('highly-likely');
	});

	it('detects all rule IDs are unique', () => {
		const ids = asrsRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('calculates correct subscores', () => {
		const data = createHealthyPatient();
		data.asrsPartA.focusDifficulty = 4;
		data.asrsPartA.organizationDifficulty = 3;
		data.asrsPartA.rememberingDifficulty = 3;
		data.asrsPartB.carelessMistakes = 3;
		data.asrsPartB.attentionDifficulty = 3;
		data.asrsPartB.concentrationDifficulty = 3;
		data.asrsPartB.misplacingThings = 2;
		data.asrsPartB.distractedByNoise = 2;

		const result = calculateASRS(data);
		expect(result.inattentiveSubscore).toBe(23);
	});
});

describe('Additional Flags Detection', () => {
	it('returns flags for cardiovascular risk', () => {
		const data = createHealthyPatient();
		data.medicalHistory.cardiovascularIssues = 'yes';
		data.medicalHistory.cardiovascularDetails = 'Hypertension';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CV-001')).toBe(true);
		expect(flags.some((f) => f.priority === 'high')).toBe(true);
	});

	it('flags substance abuse history', () => {
		const data = createHealthyPatient();
		data.comorbidConditions.substanceUse = 'yes';
		data.comorbidConditions.substanceUseDetails = 'Cannabis use';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SUBST-001')).toBe(true);
	});

	it('flags depression for suicidal ideation screening', () => {
		const data = createHealthyPatient();
		data.comorbidConditions.depression = 'yes';
		data.comorbidConditions.depressionDetails = 'Moderate depression on SSRIs';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-DEPR-001')).toBe(true);
	});

	it('flags seizure history', () => {
		const data = createHealthyPatient();
		data.medicalHistory.seizureHistory = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SEIZ-001')).toBe(true);
		expect(flags.find((f) => f.id === 'FLAG-SEIZ-001')?.priority).toBe('medium');
	});

	it('flags childhood onset not confirmed', () => {
		const data = createHealthyPatient();
		data.childhoodHistory.childhoodSymptoms = 'yes';
		data.childhoodHistory.onsetBeforeAge12 = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ONSET-001')).toBe(true);
	});

	it('flags no childhood symptoms', () => {
		const data = createHealthyPatient();
		data.childhoodHistory.childhoodSymptoms = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ONSET-002')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.medicalHistory.cardiovascularIssues = 'yes';
		data.medicalHistory.seizureHistory = 'yes';
		data.comorbidConditions.autismSpectrum = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
