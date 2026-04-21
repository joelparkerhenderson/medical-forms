import { describe, it, expect } from 'vitest';
import { calculateMCASScore } from './symptom-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { symptomDomains } from './symptom-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1985-06-15',
			sex: 'female'
		},
		symptomOverview: {
			onsetDate: '2024-01-15',
			symptomDuration: '6 months',
			symptomFrequency: 'rarely',
			qualityOfLife: 'none'
		},
		dermatologicalSymptoms: {
			flushing: { severity: 0, frequency: 'never' },
			urticaria: { severity: 0, frequency: 'never' },
			angioedema: { severity: 0, frequency: 'never' },
			pruritus: { severity: 0, frequency: 'never' }
		},
		gastrointestinalSymptoms: {
			abdominalPain: { severity: 0, frequency: 'never' },
			nausea: { severity: 0, frequency: 'never' },
			diarrhea: { severity: 0, frequency: 'never' },
			bloating: { severity: 0, frequency: 'never' }
		},
		cardiovascularSymptoms: {
			tachycardia: { severity: 0, frequency: 'never' },
			hypotension: { severity: 0, frequency: 'never' },
			presyncope: { severity: 0, frequency: 'never' },
			syncope: { severity: 0, frequency: 'never' }
		},
		respiratorySymptoms: {
			wheezing: { severity: 0, frequency: 'never' },
			dyspnea: { severity: 0, frequency: 'never' },
			nasalCongestion: { severity: 0, frequency: 'never' },
			throatTightening: { severity: 0, frequency: 'never' }
		},
		neurologicalSymptoms: {
			headache: { severity: 0, frequency: 'never' },
			brainFog: { severity: 0, frequency: 'never' },
			dizziness: { severity: 0, frequency: 'never' },
			fatigue: { severity: 0, frequency: 'never' }
		},
		triggersPatterns: {
			foodTriggers: '',
			environmentalTriggers: '',
			stressTriggers: 'no',
			exerciseTrigger: 'no',
			temperatureTrigger: 'no',
			medicationTriggers: ''
		},
		laboratoryResults: {
			serumTryptase: null,
			histamine: null,
			prostaglandinD2: null,
			chromograninA: null
		},
		currentTreatment: {
			antihistamines: 'no',
			mastCellStabilizers: 'no',
			leukotrienInhibitors: 'no',
			epinephrine: 'no'
		}
	};
}

describe('MCAS Symptom Grading Engine', () => {
	it('returns score 0 for a patient with no symptoms', () => {
		const data = createHealthyPatient();
		const result = calculateMCASScore(data);
		expect(result.symptomScore).toBe(0);
		expect(result.mcasCategoryLabel).toBe('Minimal');
		expect(result.organSystemsAffected).toBe(0);
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns Minimal (0-10) for minor symptoms in one system', () => {
		const data = createHealthyPatient();
		data.dermatologicalSymptoms.flushing.severity = 2;
		data.dermatologicalSymptoms.flushing.frequency = 'sometimes';
		data.dermatologicalSymptoms.pruritus.severity = 1;

		const result = calculateMCASScore(data);
		expect(result.symptomScore).toBe(3);
		expect(result.mcasCategoryLabel).toBe('Minimal');
		expect(result.organSystemsAffected).toBe(1);
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns Mild (11-20) for moderate multi-system symptoms', () => {
		const data = createHealthyPatient();
		data.dermatologicalSymptoms.flushing.severity = 3;
		data.dermatologicalSymptoms.urticaria.severity = 2;
		data.gastrointestinalSymptoms.abdominalPain.severity = 2;
		data.gastrointestinalSymptoms.nausea.severity = 1;
		data.cardiovascularSymptoms.tachycardia.severity = 2;
		data.neurologicalSymptoms.fatigue.severity = 2;
		data.neurologicalSymptoms.brainFog.severity = 1;

		const result = calculateMCASScore(data);
		expect(result.symptomScore).toBe(13);
		expect(result.mcasCategoryLabel).toBe('Mild');
		expect(result.organSystemsAffected).toBe(4);
	});

	it('returns Moderate (21-30) for significant multi-system involvement', () => {
		const data = createHealthyPatient();
		data.dermatologicalSymptoms.flushing.severity = 3;
		data.dermatologicalSymptoms.urticaria.severity = 3;
		data.dermatologicalSymptoms.angioedema.severity = 2;
		data.gastrointestinalSymptoms.abdominalPain.severity = 3;
		data.gastrointestinalSymptoms.diarrhea.severity = 2;
		data.cardiovascularSymptoms.tachycardia.severity = 2;
		data.cardiovascularSymptoms.hypotension.severity = 2;
		data.respiratorySymptoms.wheezing.severity = 2;
		data.neurologicalSymptoms.fatigue.severity = 3;

		const result = calculateMCASScore(data);
		expect(result.symptomScore).toBe(22);
		expect(result.mcasCategoryLabel).toBe('Moderate');
		expect(result.organSystemsAffected).toBe(5);
	});

	it('returns Severe (31-40) for maximum symptom burden', () => {
		const data = createHealthyPatient();
		// All symptoms at severity 2 = 20 * 2 = 40
		data.dermatologicalSymptoms.flushing.severity = 3;
		data.dermatologicalSymptoms.urticaria.severity = 3;
		data.dermatologicalSymptoms.angioedema.severity = 3;
		data.dermatologicalSymptoms.pruritus.severity = 3;
		data.gastrointestinalSymptoms.abdominalPain.severity = 3;
		data.gastrointestinalSymptoms.nausea.severity = 3;
		data.gastrointestinalSymptoms.diarrhea.severity = 3;
		data.gastrointestinalSymptoms.bloating.severity = 2;
		data.cardiovascularSymptoms.tachycardia.severity = 3;
		data.cardiovascularSymptoms.hypotension.severity = 2;
		data.respiratorySymptoms.throatTightening.severity = 3;
		data.neurologicalSymptoms.fatigue.severity = 3;

		const result = calculateMCASScore(data);
		expect(result.symptomScore).toBeGreaterThanOrEqual(31);
		expect(result.mcasCategoryLabel).toBe('Severe');
	});

	it('detects all domain IDs are unique', () => {
		const ids = symptomDomains.map((d) => d.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('handles null severities gracefully (unanswered symptoms)', () => {
		const data = createHealthyPatient();
		data.dermatologicalSymptoms.flushing.severity = 2;
		data.dermatologicalSymptoms.urticaria.severity = null;
		data.dermatologicalSymptoms.pruritus.severity = 1;

		const result = calculateMCASScore(data);
		expect(result.symptomScore).toBe(3);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags elevated tryptase', () => {
		const data = createHealthyPatient();
		data.laboratoryResults.serumTryptase = 15.0;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-TRYPTASE-001')).toBe(true);
	});

	it('flags cardiovascular instability (tachycardia)', () => {
		const data = createHealthyPatient();
		data.cardiovascularSymptoms.tachycardia.severity = 2;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CV-001')).toBe(true);
	});

	it('flags respiratory compromise (throat tightening)', () => {
		const data = createHealthyPatient();
		data.respiratorySymptoms.throatTightening.severity = 2;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-RESP-001')).toBe(true);
	});

	it('flags no epinephrine with significant symptoms', () => {
		const data = createHealthyPatient();
		data.cardiovascularSymptoms.syncope.severity = 1;
		data.currentTreatment.epinephrine = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-EPI-001')).toBe(true);
	});

	it('flags multi-system involvement', () => {
		const data = createHealthyPatient();
		data.dermatologicalSymptoms.flushing.severity = 1;
		data.gastrointestinalSymptoms.nausea.severity = 1;
		data.cardiovascularSymptoms.tachycardia.severity = 1;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-MULTI-001')).toBe(true);
	});

	it('flags anaphylaxis risk', () => {
		const data = createHealthyPatient();
		data.cardiovascularSymptoms.syncope.severity = 2;
		data.cardiovascularSymptoms.hypotension.severity = 2;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ANAPHYLAXIS-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.cardiovascularSymptoms.tachycardia.severity = 2;
		data.dermatologicalSymptoms.flushing.severity = 1;
		data.gastrointestinalSymptoms.nausea.severity = 1;
		data.respiratorySymptoms.wheezing.severity = 1;
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
