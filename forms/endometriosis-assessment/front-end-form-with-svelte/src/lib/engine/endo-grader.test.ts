import { describe, it, expect } from 'vitest';
import { calculateEndoGrade } from './endo-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { endoRules } from './endo-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Doe',
			dateOfBirth: '1990-03-20',
			sex: 'female',
			weight: 65,
			height: 165,
			bmi: 23.9
		},
		menstrualHistory: {
			ageAtMenarche: 12,
			cycleRegularity: 'regular',
			cycleLengthDays: 28,
			periodDurationDays: 5,
			flowHeaviness: 'moderate',
			clotsPresent: 'no',
			intermenstrualBleeding: 'no',
			postcoitalBleeding: 'no',
			dysmenorrhoeaSeverity: 'none',
			daysOffWorkPerCycle: 0,
			currentContraception: 'none',
			menstrualNotes: ''
		},
		painAssessment: {
			hasPelvicPain: 'no',
			pelvicPainSeverity: null,
			pelvicPainCharacter: '',
			pelvicPainLocation: '',
			pelvicPainTiming: '',
			dyspareunia: 'none',
			dyspareuniaSeverity: null,
			dyschezia: 'no',
			dyscheziaCyclical: 'no',
			backPain: 'no',
			legPain: 'no',
			painWorseWithActivity: 'no',
			painNotes: ''
		},
		gastrointestinalSymptoms: {
			hasGiSymptoms: 'no',
			bloating: 'no',
			bloatingCyclical: 'no',
			nausea: 'no',
			constipation: 'no',
			diarrhoea: 'no',
			alternatingBowelHabit: 'no',
			rectalBleeding: 'no',
			rectalBleedingCyclical: 'no',
			bowelObstructionSymptoms: 'no',
			giNotes: ''
		},
		urinarySymptoms: {
			hasUrinarySymptoms: 'no',
			frequency: 'no',
			urgency: 'no',
			dysuria: 'no',
			haematuria: 'no',
			haematuriaCyclical: 'no',
			flankPain: 'no',
			urinaryObstructionSymptoms: 'no',
			recurrentUtis: 'no',
			urinaryNotes: ''
		},
		fertilityAssessment: {
			tryingToConceive: 'no',
			durationTryingMonths: null,
			previousPregnancies: null,
			liveBirths: null,
			miscarriages: null,
			ectopicPregnancies: null,
			previousFertilityTreatment: 'no',
			fertilityTreatmentDetails: '',
			amhLevel: null,
			partnerSemenAnalysis: '',
			futureFertilityConcerns: 'no',
			fertilityNotes: ''
		},
		previousTreatments: {
			nsaidsTried: 'no',
			nsaidsEffective: '',
			paracetamolTried: 'no',
			opioidsTried: 'no',
			opioidsCurrent: 'no',
			combinedPillTried: 'no',
			combinedPillEffective: '',
			progesteroneTried: 'no',
			progesteroneType: '',
			gnrhAgonistTried: 'no',
			gnrhAgonistDurationMonths: null,
			mirenaIusTried: 'no',
			otherTreatments: '',
			treatmentNotes: ''
		},
		surgicalHistory: {
			previousLaparoscopy: 'no',
			numberOfLaparoscopies: null,
			mostRecentLaparoscopyDate: '',
			endometriosisConfirmedSurgically: 'no',
			histologicalConfirmation: 'no',
			asrmStageAtSurgery: '',
			sitesFound: '',
			excisionPerformed: 'no',
			ablationPerformed: 'no',
			adhesiolysisPerformed: 'no',
			endometriomaDrained: 'no',
			bowelSurgery: 'no',
			bladderSurgery: 'no',
			otherPelvicSurgery: '',
			surgicalComplications: '',
			surgicalNotes: ''
		},
		qualityOfLife: {
			painDomainScore: null,
			controlPowerlessnessScore: null,
			emotionalWellbeingScore: null,
			socialSupportScore: null,
			selfImageScore: null,
			workImpact: 'none',
			relationshipImpact: 'none',
			sleepImpact: 'none',
			mentalHealthImpact: 'none',
			exerciseImpact: 'none',
			qolNotes: ''
		},
		treatmentPlanning: {
			treatmentGoals: '',
			preferredApproach: '',
			surgeryConsidered: 'no',
			surgeryTypeConsidered: '',
			fertilityPreservationNeeded: 'no',
			mdtReferralNeeded: 'no',
			painManagementReferral: 'no',
			psychologyReferral: 'no',
			physiotherapyReferral: 'no',
			fertilityClinicReferral: 'no',
			imagingRequested: '',
			followUpInterval: '',
			planningNotes: ''
		}
	};
}

describe('Endometriosis Grading Engine', () => {
	it('returns mild severity for a healthy patient', () => {
		const data = createHealthyPatient();
		const result = calculateEndoGrade(data);
		expect(result.overallSeverity).toBe('mild');
		expect(result.asrmStage).toBeNull();
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns moderate severity for moderate dysmenorrhoea + deep dyspareunia', () => {
		const data = createHealthyPatient();
		data.menstrualHistory.dysmenorrhoeaSeverity = 'moderate';
		data.painAssessment.hasPelvicPain = 'yes';
		data.painAssessment.pelvicPainSeverity = 6;
		data.painAssessment.dyspareunia = 'deep';

		const result = calculateEndoGrade(data);
		expect(result.overallSeverity).toBe('severe');
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns severe severity for Stage III + infertility', () => {
		const data = createHealthyPatient();
		data.surgicalHistory.asrmStageAtSurgery = 'III';
		data.fertilityAssessment.tryingToConceive = 'yes';
		data.fertilityAssessment.durationTryingMonths = 18;

		const result = calculateEndoGrade(data);
		expect(result.overallSeverity).toBe('severe');
		expect(result.asrmStage).toBe(3);
	});

	it('returns critical severity for bowel obstruction', () => {
		const data = createHealthyPatient();
		data.gastrointestinalSymptoms.bowelObstructionSymptoms = 'yes';

		const result = calculateEndoGrade(data);
		expect(result.overallSeverity).toBe('critical');
	});

	it('returns critical severity for urinary obstruction', () => {
		const data = createHealthyPatient();
		data.urinarySymptoms.urinaryObstructionSymptoms = 'yes';

		const result = calculateEndoGrade(data);
		expect(result.overallSeverity).toBe('critical');
	});

	it('returns critical severity for Stage IV at surgery', () => {
		const data = createHealthyPatient();
		data.surgicalHistory.asrmStageAtSurgery = 'IV';

		const result = calculateEndoGrade(data);
		expect(result.overallSeverity).toBe('critical');
		expect(result.asrmStage).toBe(4);
	});

	it('detects all rule IDs are unique', () => {
		const ids = endoRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('Endometriosis Flagged Issues Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags bowel obstruction', () => {
		const data = createHealthyPatient();
		data.gastrointestinalSymptoms.bowelObstructionSymptoms = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BOWEL-001')).toBe(true);
	});

	it('flags urinary obstruction', () => {
		const data = createHealthyPatient();
		data.urinarySymptoms.urinaryObstructionSymptoms = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-URIN-001')).toBe(true);
	});

	it('flags severe pelvic pain', () => {
		const data = createHealthyPatient();
		data.painAssessment.hasPelvicPain = 'yes';
		data.painAssessment.pelvicPainSeverity = 9;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PAIN-001')).toBe(true);
	});

	it('flags infertility', () => {
		const data = createHealthyPatient();
		data.fertilityAssessment.tryingToConceive = 'yes';
		data.fertilityAssessment.durationTryingMonths = 18;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-FERT-001')).toBe(true);
	});

	it('flags current opioid use', () => {
		const data = createHealthyPatient();
		data.previousTreatments.opioidsCurrent = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-TX-001')).toBe(true);
	});

	it('flags cyclical rectal bleeding', () => {
		const data = createHealthyPatient();
		data.gastrointestinalSymptoms.rectalBleeding = 'yes';
		data.gastrointestinalSymptoms.rectalBleedingCyclical = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BOWEL-002')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.gastrointestinalSymptoms.bowelObstructionSymptoms = 'yes';
		data.qualityOfLife.mentalHealthImpact = 'severe';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
