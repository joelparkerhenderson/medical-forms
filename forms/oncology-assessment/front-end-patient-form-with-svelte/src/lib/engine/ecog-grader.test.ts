import { describe, it, expect } from 'vitest';
import { calculateECOG } from './ecog-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { ecogRules } from './ecog-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Doe',
			dateOfBirth: '1965-06-15',
			sex: 'female',
			weight: 65,
			height: 165,
			bmi: 23.9,
			ecogPerformanceStatus: '0'
		},
		cancerDiagnosis: {
			cancerType: 'breast',
			cancerTypeOther: '',
			primarySite: 'Left breast',
			histology: 'invasive-ductal-carcinoma',
			histologyOther: '',
			stageT: '1',
			stageN: '0',
			stageM: '0',
			overallStage: 'I',
			grade: '2',
			dateOfDiagnosis: '2025-01-15'
		},
		treatmentHistory: {
			previousSurgery: 'yes',
			surgeryDetails: 'Lumpectomy',
			previousChemotherapy: 'no',
			chemotherapyRegimens: '',
			previousRadiation: 'no',
			radiationDetails: '',
			previousImmunotherapy: 'no',
			immunotherapyDetails: '',
			previousTargetedTherapy: 'no',
			targetedTherapyDetails: '',
			clinicalTrialParticipation: 'no',
			clinicalTrialDetails: ''
		},
		currentTreatment: {
			activeRegimen: 'Tamoxifen',
			cycleNumber: null,
			lastTreatmentDate: '2025-12-01',
			responseAssessment: 'complete-response'
		},
		symptomAssessment: {
			painNRS: 0,
			fatigue: 'none',
			nausea: 'none',
			appetite: 'normal',
			weightChange: 'stable',
			esasScore: null
		},
		sideEffects: {
			neuropathy: '0',
			neuropathyDetails: '',
			mucositis: '0',
			skinReactions: '0',
			skinReactionDetails: '',
			myelosuppression: 'no',
			neutropenia: 'no',
			thrombocytopenia: 'no',
			anaemia: 'no',
			organToxicityGrade: '0',
			organToxicityDetails: ''
		},
		laboratoryResults: {
			wbc: 6.5,
			haemoglobin: 130,
			platelets: 250,
			neutrophils: 4.0,
			creatinine: 70,
			alt: 25,
			ast: 22,
			bilirubin: 12,
			albumin: 40,
			calcium: 2.3,
			ldh: 200,
			tumourMarker: '',
			tumourMarkerValue: '',
			inr: 1.0
		},
		currentMedications: {
			chemotherapyAgents: [],
			antiemetics: [],
			painMedications: [],
			growthFactors: [],
			supportiveCare: []
		},
		psychosocial: {
			distressThermometer: 2,
			anxiety: 'none',
			depression: 'none',
			copingAbility: 'coping-well',
			supportSystem: 'strong',
			advanceCarePlanning: 'no',
			advanceCareDetails: ''
		},
		functionalNutritional: {
			ecogDetailed: '0',
			karnofskyScore: 100,
			nutritionalStatus: 'well-nourished',
			weightTrajectory: 'stable',
			dietaryIntake: 'normal',
			nutritionalSupportRequired: 'no'
		}
	};
}

describe('ECOG Grading Engine', () => {
	it('returns ECOG 0 for a fully active patient', () => {
		const data = createHealthyPatient();
		const result = calculateECOG(data);
		expect(result.ecogGrade).toBe(0);
	});

	it('returns ECOG 1 for moderate pain and moderate fatigue', () => {
		const data = createHealthyPatient();
		data.demographics.ecogPerformanceStatus = '1';
		data.symptomAssessment.painNRS = 5;
		data.symptomAssessment.fatigue = 'moderate';

		const result = calculateECOG(data);
		expect(result.ecogGrade).toBe(1);
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns ECOG 2 for severe pain and progressive disease', () => {
		const data = createHealthyPatient();
		data.demographics.ecogPerformanceStatus = '2';
		data.symptomAssessment.painNRS = 8;
		data.currentTreatment.responseAssessment = 'progressive-disease';

		const result = calculateECOG(data);
		expect(result.ecogGrade).toBe(2);
		expect(result.firedRules.length).toBeGreaterThanOrEqual(3);
	});

	it('returns ECOG 3 for metastatic cancer with severe neutropenia', () => {
		const data = createHealthyPatient();
		data.demographics.ecogPerformanceStatus = '3';
		data.cancerDiagnosis.overallStage = 'IV';
		data.cancerDiagnosis.stageM = '1';
		data.laboratoryResults.neutrophils = 0.3;

		const result = calculateECOG(data);
		expect(result.ecogGrade).toBe(3);
	});

	it('returns ECOG 4 for completely disabled patient with very low Karnofsky', () => {
		const data = createHealthyPatient();
		data.demographics.ecogPerformanceStatus = '4';
		data.functionalNutritional.karnofskyScore = 20;

		const result = calculateECOG(data);
		expect(result.ecogGrade).toBe(4);
	});

	it('detects all rule IDs are unique', () => {
		const ids = ecogRules.map((r) => r.id);
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

	it('flags neutropenic fever risk', () => {
		const data = createHealthyPatient();
		data.sideEffects.neutropenia = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-NEUTRO-001')).toBe(true);
	});

	it('flags severe pain', () => {
		const data = createHealthyPatient();
		data.symptomAssessment.painNRS = 8;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PAIN-001')).toBe(true);
	});

	it('flags ECOG 3-4', () => {
		const data = createHealthyPatient();
		data.demographics.ecogPerformanceStatus = '3';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ECOG-001')).toBe(true);
	});

	it('flags hypercalcaemia', () => {
		const data = createHealthyPatient();
		data.laboratoryResults.calcium = 3.2;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CALCIUM-001')).toBe(true);
	});

	it('flags high distress', () => {
		const data = createHealthyPatient();
		data.psychosocial.distressThermometer = 9;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-DISTRESS-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.sideEffects.neutropenia = 'yes';
		data.psychosocial.distressThermometer = 9;
		data.psychosocial.advanceCarePlanning = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
