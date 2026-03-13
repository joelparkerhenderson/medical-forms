import { describe, it, expect } from 'vitest';
import { evaluateUKMEC } from './ukmec-grader';
import { detectAdditionalFlags } from './flagged-issues';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1995-06-15',
			sex: 'female'
		},
		reproductiveHistory: {
			gravida: 0,
			para: 0,
			lastDeliveryDate: '',
			breastfeeding: 'no',
			pregnancyIntention: ''
		},
		menstrualHistory: {
			cycleLength: 28,
			cycleDuration: 5,
			flowHeaviness: 'moderate',
			dysmenorrhea: 'none',
			lastMenstrualPeriod: '2026-02-20'
		},
		currentContraception: {
			currentMethod: 'none',
			durationOfUse: '',
			reasonForChange: '',
			sideEffects: ''
		},
		medicalHistory: {
			hypertension: 'no',
			migraineWithAura: 'no',
			dvtHistory: 'no',
			breastCancer: 'no',
			liverDisease: 'no',
			diabetes: 'no',
			epilepsy: 'no',
			hiv: 'no',
			stiHistory: 'no'
		},
		cardiovascularRisk: {
			bmi: 22,
			smoking: 'never',
			bloodPressureSystolic: 120,
			bloodPressureDiastolic: 80,
			familyHistoryCVD: 'no',
			lipidDisorders: 'no'
		},
		lifestyleFactors: {
			smokingStatus: 'never',
			alcoholUse: 'occasional',
			drugUse: 'none',
			occupation: 'Office worker',
			travelPlans: ''
		},
		preferencesPriorities: {
			preferredMethod: '',
			efficacyPriority: 'high',
			conveniencePriority: 'moderate',
			periodControlPriority: 'moderate',
			fertilityReturnPriority: 'high',
			hormoneFreePreference: 'no-preference'
		},
		breastCervicalScreening: {
			lastBreastScreening: '',
			lastCervicalScreening: '2025-01-15',
			hpvVaccination: 'completed'
		},
		familyPlanningGoals: {
			desireForChildren: 'yes-future',
			timeframe: '3-5-years',
			partnerInvolvement: 'involved'
		}
	};
}

describe('UKMEC Grading Engine', () => {
	it('returns UKMEC 1 for all methods for a healthy patient', () => {
		const data = createHealthyPatient();
		const result = evaluateUKMEC(data);
		for (const methodResult of result.ukmecResults) {
			expect(methodResult.category).toBe(1);
		}
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns UKMEC 4 for CHC methods when migraine with aura', () => {
		const data = createHealthyPatient();
		data.medicalHistory.migraineWithAura = 'yes';
		const result = evaluateUKMEC(data);

		const coc = result.ukmecResults.find((r) => r.method === 'combined-oral');
		expect(coc?.category).toBe(4);

		const patch = result.ukmecResults.find((r) => r.method === 'patch');
		expect(patch?.category).toBe(4);

		const ring = result.ukmecResults.find((r) => r.method === 'vaginal-ring');
		expect(ring?.category).toBe(4);

		// POP should still be safe
		const pop = result.ukmecResults.find((r) => r.method === 'progestogen-only-pill');
		expect(pop?.category).toBe(1);
	});

	it('returns UKMEC 4 for CHC methods when DVT history', () => {
		const data = createHealthyPatient();
		data.medicalHistory.dvtHistory = 'yes';
		const result = evaluateUKMEC(data);

		const coc = result.ukmecResults.find((r) => r.method === 'combined-oral');
		expect(coc?.category).toBe(4);

		// Copper IUD should be safe
		const iud = result.ukmecResults.find((r) => r.method === 'copper-iud');
		expect(iud?.category).toBe(1);
	});

	it('returns UKMEC 4 for all hormonal methods when breast cancer', () => {
		const data = createHealthyPatient();
		data.medicalHistory.breastCancer = 'yes';
		const result = evaluateUKMEC(data);

		const coc = result.ukmecResults.find((r) => r.method === 'combined-oral');
		expect(coc?.category).toBe(4);

		const pop = result.ukmecResults.find((r) => r.method === 'progestogen-only-pill');
		expect(pop?.category).toBe(4);

		const implant = result.ukmecResults.find((r) => r.method === 'implant');
		expect(implant?.category).toBe(4);

		// Copper IUD should be safe
		const iud = result.ukmecResults.find((r) => r.method === 'copper-iud');
		expect(iud?.category).toBe(1);
	});

	it('returns UKMEC 4 for CHC with severe hypertension', () => {
		const data = createHealthyPatient();
		data.medicalHistory.hypertension = 'yes';
		data.cardiovascularRisk.bloodPressureSystolic = 170;
		const result = evaluateUKMEC(data);

		const coc = result.ukmecResults.find((r) => r.method === 'combined-oral');
		expect(coc?.category).toBe(4);
	});

	it('returns UKMEC 3 for CHC with moderate hypertension', () => {
		const data = createHealthyPatient();
		data.medicalHistory.hypertension = 'yes';
		data.cardiovascularRisk.bloodPressureSystolic = 145;
		const result = evaluateUKMEC(data);

		const coc = result.ukmecResults.find((r) => r.method === 'combined-oral');
		expect(coc?.category).toBe(3);
	});

	it('returns UKMEC 3 for CHC with obesity (BMI >= 35)', () => {
		const data = createHealthyPatient();
		data.cardiovascularRisk.bmi = 38;
		const result = evaluateUKMEC(data);

		const coc = result.ukmecResults.find((r) => r.method === 'combined-oral');
		expect(coc?.category).toBe(3);
	});

	it('handles smoker aged >= 35', () => {
		const data = createHealthyPatient();
		data.demographics.dateOfBirth = '1985-01-01';
		data.cardiovascularRisk.smoking = 'current-light';
		const result = evaluateUKMEC(data);

		const coc = result.ukmecResults.find((r) => r.method === 'combined-oral');
		expect(coc?.category).toBe(3);
	});

	it('handles heavy smoker aged >= 35', () => {
		const data = createHealthyPatient();
		data.demographics.dateOfBirth = '1985-01-01';
		data.cardiovascularRisk.smoking = 'current-heavy';
		const result = evaluateUKMEC(data);

		const coc = result.ukmecResults.find((r) => r.method === 'combined-oral');
		expect(coc?.category).toBe(4);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const { ukmecResults } = evaluateUKMEC(data);
		const flags = detectAdditionalFlags(data, ukmecResults);
		expect(flags).toHaveLength(0);
	});

	it('flags migraine with aura', () => {
		const data = createHealthyPatient();
		data.medicalHistory.migraineWithAura = 'yes';
		const { ukmecResults } = evaluateUKMEC(data);
		const flags = detectAdditionalFlags(data, ukmecResults);
		expect(flags.some((f) => f.id === 'FLAG-MIGRAINE-AURA')).toBe(true);
	});

	it('flags DVT history', () => {
		const data = createHealthyPatient();
		data.medicalHistory.dvtHistory = 'yes';
		const { ukmecResults } = evaluateUKMEC(data);
		const flags = detectAdditionalFlags(data, ukmecResults);
		expect(flags.some((f) => f.id === 'FLAG-DVT')).toBe(true);
	});

	it('flags preferred method with UKMEC >= 3', () => {
		const data = createHealthyPatient();
		data.medicalHistory.migraineWithAura = 'yes';
		data.preferencesPriorities.preferredMethod = 'combined-oral';
		const { ukmecResults } = evaluateUKMEC(data);
		const flags = detectAdditionalFlags(data, ukmecResults);
		expect(flags.some((f) => f.id === 'FLAG-PREFERRED-UKMEC')).toBe(true);
	});

	it('flags uncontrolled hypertension', () => {
		const data = createHealthyPatient();
		data.medicalHistory.hypertension = 'yes';
		data.cardiovascularRisk.bloodPressureSystolic = 165;
		const { ukmecResults } = evaluateUKMEC(data);
		const flags = detectAdditionalFlags(data, ukmecResults);
		expect(flags.some((f) => f.id === 'FLAG-HYPERTENSION')).toBe(true);
	});

	it('flags breast cancer', () => {
		const data = createHealthyPatient();
		data.medicalHistory.breastCancer = 'yes';
		const { ukmecResults } = evaluateUKMEC(data);
		const flags = detectAdditionalFlags(data, ukmecResults);
		expect(flags.some((f) => f.id === 'FLAG-BREAST-CANCER')).toBe(true);
	});

	it('flags smoker aged >= 35', () => {
		const data = createHealthyPatient();
		data.demographics.dateOfBirth = '1985-01-01';
		data.cardiovascularRisk.smoking = 'current-light';
		data.lifestyleFactors.smokingStatus = 'current-light';
		const { ukmecResults } = evaluateUKMEC(data);
		const flags = detectAdditionalFlags(data, ukmecResults);
		expect(flags.some((f) => f.id === 'FLAG-SMOKER-35')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.medicalHistory.migraineWithAura = 'yes';
		data.medicalHistory.hiv = 'yes';
		data.medicalHistory.stiHistory = 'yes';
		const { ukmecResults } = evaluateUKMEC(data);
		const flags = detectAdditionalFlags(data, ukmecResults);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
