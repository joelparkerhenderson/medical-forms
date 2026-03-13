import { describe, it, expect } from 'vitest';
import { calculateASA } from './asa-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { asaRules } from './asa-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'John',
			lastName: 'Doe',
			dateOfBirth: '1985-01-01',
			sex: 'male',
			weight: 75,
			height: 175,
			bmi: 24.5,
			plannedProcedure: 'Inguinal hernia repair',
			procedureUrgency: 'elective'
		},
		cardiovascular: {
			hypertension: 'no',
			hypertensionControlled: '',
			ischemicHeartDisease: 'no',
			ihdDetails: '',
			heartFailure: 'no',
			heartFailureNYHA: '',
			valvularDisease: 'no',
			valvularDetails: '',
			arrhythmia: 'no',
			arrhythmiaType: '',
			pacemaker: 'no',
			recentMI: 'no',
			recentMIWeeks: null
		},
		respiratory: {
			asthma: 'no',
			asthmaFrequency: '',
			copd: 'no',
			copdSeverity: '',
			osa: 'no',
			osaCPAP: '',
			smoking: 'never',
			smokingPackYears: null,
			recentURTI: 'no'
		},
		renal: { ckd: 'no', ckdStage: '', dialysis: 'no', dialysisType: '' },
		hepatic: {
			liverDisease: 'no',
			cirrhosis: 'no',
			childPughScore: '',
			hepatitis: 'no',
			hepatitisType: ''
		},
		endocrine: {
			diabetes: 'none',
			diabetesControl: '',
			diabetesOnInsulin: '',
			thyroidDisease: 'no',
			thyroidType: '',
			adrenalInsufficiency: 'no'
		},
		neurological: {
			strokeOrTIA: 'no',
			strokeDetails: '',
			epilepsy: 'no',
			epilepsyControlled: '',
			neuromuscularDisease: 'no',
			neuromuscularDetails: '',
			raisedICP: 'no'
		},
		haematological: {
			bleedingDisorder: 'no',
			bleedingDetails: '',
			onAnticoagulants: 'no',
			anticoagulantType: '',
			sickleCellDisease: 'no',
			sickleCellTrait: 'no',
			anaemia: 'no'
		},
		musculoskeletalAirway: {
			rheumatoidArthritis: 'no',
			cervicalSpineIssues: 'no',
			limitedNeckMovement: 'no',
			limitedMouthOpening: 'no',
			dentalIssues: 'no',
			dentalDetails: '',
			previousDifficultAirway: 'no',
			mallampatiScore: '1'
		},
		gastrointestinal: { gord: 'no', hiatusHernia: 'no', nausea: 'no' },
		medications: [],
		allergies: [],
		previousAnaesthesia: {
			previousAnaesthesia: 'no',
			anaesthesiaProblems: '',
			anaesthesiaProblemDetails: '',
			familyMHHistory: 'no',
			familyMHDetails: '',
			ponv: 'no'
		},
		socialHistory: {
			alcohol: 'none',
			alcoholUnitsPerWeek: null,
			recreationalDrugs: 'no',
			drugDetails: ''
		},
		functionalCapacity: {
			exerciseTolerance: 'vigorous-exercise',
			estimatedMETs: 10,
			mobilityAids: 'no',
			recentDecline: 'no'
		},
		pregnancy: { possiblyPregnant: '', pregnancyConfirmed: '', gestationWeeks: null }
	};
}

describe('ASA Grading Engine', () => {
	it('returns ASA I for a healthy patient', () => {
		const data = createHealthyPatient();
		const result = calculateASA(data);
		expect(result.asaGrade).toBe(1);
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns ASA II for controlled hypertension + mild asthma', () => {
		const data = createHealthyPatient();
		data.cardiovascular.hypertension = 'yes';
		data.cardiovascular.hypertensionControlled = 'yes';
		data.respiratory.asthma = 'yes';
		data.respiratory.asthmaFrequency = 'mild-persistent';

		const result = calculateASA(data);
		expect(result.asaGrade).toBe(2);
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns ASA III for COPD + uncontrolled diabetes + morbid obesity', () => {
		const data = createHealthyPatient();
		data.respiratory.copd = 'yes';
		data.respiratory.copdSeverity = 'moderate';
		data.endocrine.diabetes = 'type2';
		data.endocrine.diabetesControl = 'poorly-controlled';
		data.demographics.bmi = 42;

		const result = calculateASA(data);
		expect(result.asaGrade).toBe(3);
		expect(result.firedRules.length).toBeGreaterThanOrEqual(3);
	});

	it('returns ASA IV for recent MI + severe valve disease', () => {
		const data = createHealthyPatient();
		data.cardiovascular.recentMI = 'yes';
		data.cardiovascular.recentMIWeeks = 4;
		data.cardiovascular.valvularDisease = 'yes';
		data.cardiovascular.heartFailure = 'yes';
		data.cardiovascular.heartFailureNYHA = '4';

		const result = calculateASA(data);
		expect(result.asaGrade).toBe(4);
	});

	it('detects all rule IDs are unique', () => {
		const data = createHealthyPatient();
		// Check that all rule IDs are unique
		const ids = asaRules.map((r) => r.id);
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

	it('flags difficult airway', () => {
		const data = createHealthyPatient();
		data.musculoskeletalAirway.previousDifficultAirway = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-AIRWAY-001')).toBe(true);
	});

	it('flags anaphylaxis allergy', () => {
		const data = createHealthyPatient();
		data.allergies = [{ allergen: 'Penicillin', reaction: 'Rash and swelling', severity: 'anaphylaxis' }];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Allergy' && f.priority === 'high')).toBe(true);
	});

	it('flags anticoagulant use', () => {
		const data = createHealthyPatient();
		data.haematological.onAnticoagulants = 'yes';
		data.haematological.anticoagulantType = 'warfarin';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ANTICOAG-001')).toBe(true);
	});

	it('flags family MH history', () => {
		const data = createHealthyPatient();
		data.previousAnaesthesia.familyMHHistory = 'yes';
		data.previousAnaesthesia.familyMHDetails = 'Father had MH reaction';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-MH-001')).toBe(true);
	});

	it('flags pregnancy', () => {
		const data = createHealthyPatient();
		data.demographics.sex = 'female';
		data.pregnancy.possiblyPregnant = 'yes';
		data.pregnancy.pregnancyConfirmed = 'yes';
		data.pregnancy.gestationWeeks = 12;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PREG-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.musculoskeletalAirway.previousDifficultAirway = 'yes';
		data.gastrointestinal.gord = 'yes';
		data.musculoskeletalAirway.dentalIssues = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
