import { describe, it, expect } from 'vitest';
import { calculateMECGrade } from './mec-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { mecRules } from './mec-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1995-03-15',
			sex: 'female',
			weight: 65,
			height: 165,
			bmi: 23.9
		},
		menstrualHistory: {
			menarcheAge: 12,
			cycleRegularity: 'regular',
			cycleLengthDays: 28,
			periodDurationDays: 5,
			flowHeaviness: 'moderate',
			intermenstrualBleeding: 'no',
			postcoitalBleeding: 'no',
			dysmenorrhoea: 'mild',
			lastMenstrualPeriod: '2026-04-01',
			amenorrhoea: 'no',
			amenorrhoeaDurationMonths: null
		},
		contraceptiveHistory: {
			previousContraception: 'yes',
			previousCOC: 'yes',
			cocDetails: 'Microgynon 30',
			previousPOP: 'no',
			popDetails: '',
			previousImplant: 'no',
			implantDetails: '',
			previousInjection: 'no',
			injectionDetails: '',
			previousIUD: 'no',
			iudDetails: '',
			previousIUS: 'no',
			iusDetails: '',
			previousPatchRing: 'no',
			patchRingDetails: '',
			previousBarrier: 'yes',
			reasonForChange: 'Seeking long-acting method',
			adverseEffects: ''
		},
		medicalHistory: {
			migraine: 'no',
			migraineWithAura: '',
			migraineFrequency: '',
			breastCancer: 'no',
			cervicalCancer: 'no',
			liverDisease: 'no',
			gallbladderDisease: 'no',
			inflammatoryBowelDisease: 'no',
			sle: 'no',
			sleAntiphospholipid: '',
			epilepsy: 'no',
			diabetes: 'no',
			diabetesComplications: '',
			sti: 'no',
			stiDetails: '',
			pid: 'no'
		},
		cardiovascularRisk: {
			hypertension: 'no',
			systolicBP: 120,
			diastolicBP: 75,
			bpControlled: '',
			ischaemicHeartDisease: 'no',
			strokeHistory: 'no',
			valvularHeartDisease: 'no',
			valvularComplications: '',
			hyperlipidaemia: 'no',
			familyHistoryVTE: 'no',
			familyHistoryCVD: 'no',
			familyCVDDetails: ''
		},
		thromboembolismRisk: {
			previousDVT: 'no',
			dvtDetails: '',
			previousPE: 'no',
			peDetails: '',
			knownThrombophilia: 'no',
			thrombophiliaType: '',
			immobilityRisk: 'no',
			immobilityDetails: '',
			recentMajorSurgery: 'no',
			surgeryDetails: '',
			longHaulTravel: 'no'
		},
		currentMedications: {
			enzymeInducingDrugs: 'no',
			enzymeInducingDetails: '',
			anticoagulants: 'no',
			anticoagulantDetails: '',
			antiepileptics: 'no',
			antiepilepticDetails: '',
			antiretrovirals: 'no',
			antiretroviralDetails: '',
			antibiotics: 'no',
			antibioticDetails: '',
			ssriSnri: 'no',
			ssriSnriDetails: '',
			herbalRemedies: 'no',
			herbalDetails: '',
			otherMedications: '',
			drugAllergies: 'no',
			drugAllergyDetails: ''
		},
		lifestyleAssessment: {
			smoking: 'never',
			cigarettesPerDay: null,
			ageOver35Smoker: 'no',
			alcohol: 'none',
			alcoholUnitsPerWeek: null,
			recreationalDrugUse: 'no',
			recreationalDrugDetails: '',
			exerciseFrequency: 'regular',
			sexualActivity: 'yes',
			numberOfPartners: 'one'
		},
		contraceptivePreferences: {
			preferredMethod: 'unsure',
			hormonalAcceptable: 'yes',
			longActingAcceptable: 'yes',
			dailyPillAcceptable: 'yes',
			intrauterineAcceptable: 'yes',
			fertilityPlans: '1-5-years',
			breastfeeding: 'no',
			postpartumWeeks: null,
			concerns: ''
		},
		clinicalRecommendation: {
			clinicalNotes: ''
		}
	};
}

describe('UK MEC Grading Engine', () => {
	it('returns low risk and MEC 1 for all methods for a healthy patient', () => {
		const data = createHealthyPatient();
		const result = calculateMECGrade(data);
		expect(result.overallRisk).toBe('low');
		expect(result.methodMEC.coc).toBe(1);
		expect(result.methodMEC.pop).toBe(1);
		expect(result.methodMEC.implant).toBe(1);
		expect(result.methodMEC.injection).toBe(1);
		expect(result.methodMEC.iud).toBe(1);
		expect(result.methodMEC.ius).toBe(1);
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns MEC 4 for COC with previous DVT', () => {
		const data = createHealthyPatient();
		data.thromboembolismRisk.previousDVT = 'yes';
		data.thromboembolismRisk.dvtDetails = 'DVT right leg 2023';

		const result = calculateMECGrade(data);
		expect(result.methodMEC.coc).toBe(4);
		expect(result.methodMEC.pop).toBe(2);
		expect(result.overallRisk).toBe('critical');
	});

	it('returns MEC 4 for COC with migraine with aura', () => {
		const data = createHealthyPatient();
		data.medicalHistory.migraine = 'yes';
		data.medicalHistory.migraineWithAura = 'yes';

		const result = calculateMECGrade(data);
		expect(result.methodMEC.coc).toBe(4);
		expect(result.methodMEC.pop).toBe(2);
		expect(result.overallRisk).toBe('critical');
	});

	it('returns MEC 4 for COC with severe hypertension', () => {
		const data = createHealthyPatient();
		data.cardiovascularRisk.hypertension = 'yes';
		data.cardiovascularRisk.systolicBP = 170;
		data.cardiovascularRisk.diastolicBP = 105;

		const result = calculateMECGrade(data);
		expect(result.methodMEC.coc).toBe(4);
		expect(result.overallRisk).toBe('critical');
	});

	it('returns MEC 4 for all hormonal methods with current breast cancer', () => {
		const data = createHealthyPatient();
		data.medicalHistory.breastCancer = 'current';

		const result = calculateMECGrade(data);
		expect(result.methodMEC.coc).toBe(4);
		expect(result.methodMEC.pop).toBe(4);
		expect(result.methodMEC.implant).toBe(4);
		expect(result.methodMEC.injection).toBe(4);
		expect(result.methodMEC.ius).toBe(4);
		expect(result.methodMEC.iud).toBe(1); // Cu-IUD not hormonal
	});

	it('returns MEC 3 for COC with BMI >= 35', () => {
		const data = createHealthyPatient();
		data.demographics.bmi = 37;

		const result = calculateMECGrade(data);
		expect(result.methodMEC.coc).toBe(3);
		expect(result.overallRisk).toBe('high');
	});

	it('returns MEC 4 for COC with age >= 35 and heavy smoking', () => {
		const data = createHealthyPatient();
		data.demographics.dateOfBirth = '1985-01-01';
		data.lifestyleAssessment.smoking = 'current';
		data.lifestyleAssessment.cigarettesPerDay = 20;

		const result = calculateMECGrade(data);
		expect(result.methodMEC.coc).toBe(4);
		expect(result.overallRisk).toBe('critical');
	});

	it('detects all rule IDs are unique', () => {
		const ids = mecRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('Birth Control Flagged Issues Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags previous DVT', () => {
		const data = createHealthyPatient();
		data.thromboembolismRisk.previousDVT = 'yes';
		data.thromboembolismRisk.dvtDetails = 'DVT right leg 2023';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-DVT-001')).toBe(true);
	});

	it('flags migraine with aura', () => {
		const data = createHealthyPatient();
		data.medicalHistory.migraine = 'yes';
		data.medicalHistory.migraineWithAura = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-MIGRAINE-001')).toBe(true);
	});

	it('flags current breast cancer', () => {
		const data = createHealthyPatient();
		data.medicalHistory.breastCancer = 'current';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BRCA-001')).toBe(true);
	});

	it('flags severe hypertension', () => {
		const data = createHealthyPatient();
		data.cardiovascularRisk.systolicBP = 170;
		data.cardiovascularRisk.diastolicBP = 105;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BP-001')).toBe(true);
	});

	it('flags enzyme-inducing drugs', () => {
		const data = createHealthyPatient();
		data.currentMedications.enzymeInducingDrugs = 'yes';
		data.currentMedications.enzymeInducingDetails = 'Carbamazepine';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ENZYME-001')).toBe(true);
	});

	it('flags breastfeeding < 6 weeks', () => {
		const data = createHealthyPatient();
		data.contraceptivePreferences.breastfeeding = 'yes';
		data.contraceptivePreferences.postpartumWeeks = 3;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BF-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.thromboembolismRisk.previousDVT = 'yes';
		data.currentMedications.enzymeInducingDrugs = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
