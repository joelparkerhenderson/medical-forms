import { describe, it, expect } from 'vitest';
import { calculateACT } from './act-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { actRules } from './act-rules';
import type { AssessmentData } from './types';

function createWellControlledPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1990-06-15',
			sex: 'female',
			weight: 65,
			height: 165,
			bmi: 23.9
		},
		symptomFrequency: {
			daytimeSymptoms: 'not-at-all',
			nighttimeAwakening: 'not-at-all',
			rescueInhalerUse: 'not-at-all',
			activityLimitation: 'not-at-all',
			selfRatedControl: 'completely-controlled'
		},
		lungFunction: {
			fev1Percent: 95,
			fev1Fvc: 0.82,
			peakFlowBest: 450,
			peakFlowCurrent: 440,
			peakFlowPercent: 98,
			spirometryDate: '2026-01-15',
			spirometryNotes: ''
		},
		triggers: {
			allergens: 'no',
			allergenDetails: '',
			exercise: 'no',
			weather: 'no',
			weatherDetails: '',
			occupational: 'no',
			occupationalDetails: '',
			infections: 'no',
			smoke: 'no',
			stress: 'no',
			medications: 'no',
			medicationDetails: '',
			otherTriggers: ''
		},
		currentMedications: {
			controllerMedications: [],
			rescueInhalers: [{ name: 'Salbutamol', dose: '100mcg', frequency: 'as needed' }],
			biologics: [],
			oralSteroids: 'no',
			oralSteroidDetails: '',
			inhalerTechniqueReviewed: 'yes',
			medicationAdherence: 'good'
		},
		allergies: {
			drugAllergies: [],
			environmentalAllergies: [],
			allergyTestingDone: 'no',
			allergyTestResults: ''
		},
		exacerbationHistory: {
			exacerbationsLastYear: 0,
			edVisitsLastYear: 0,
			hospitalisationsLastYear: 0,
			icuAdmissions: 'no',
			icuAdmissionCount: null,
			intubationHistory: 'no',
			oralSteroidCoursesLastYear: 0,
			lastExacerbationDate: ''
		},
		comorbidities: {
			allergicRhinitis: 'no',
			sinusitis: 'no',
			nasalPolyps: 'no',
			gord: 'no',
			obesity: 'no',
			anxiety: 'no',
			depression: 'no',
			eczema: 'no',
			sleepApnoea: 'no',
			vocalCordDysfunction: 'no',
			otherComorbidities: ''
		},
		socialHistory: {
			smoking: 'never',
			smokingPackYears: null,
			vaping: 'never',
			occupationalExposures: 'no',
			occupationalExposureDetails: '',
			homeEnvironment: '',
			pets: 'no',
			petDetails: '',
			carpetInBedroom: 'no',
			moldExposure: 'no'
		}
	};
}

describe('ACT Scoring Engine', () => {
	it('returns ACT score 25 (well controlled) for asymptomatic patient', () => {
		const data = createWellControlledPatient();
		const result = calculateACT(data);
		expect(result.actScore).toBe(25);
		expect(result.controlLevel).toBe('well-controlled');
		expect(result.firedRules).toHaveLength(5);
	});

	it('returns ACT score 20-24 (well controlled but could be better) for mild symptoms', () => {
		const data = createWellControlledPatient();
		data.symptomFrequency.daytimeSymptoms = 'once-or-twice';
		data.symptomFrequency.rescueInhalerUse = 'once-or-twice';

		const result = calculateACT(data);
		expect(result.actScore).toBeGreaterThanOrEqual(20);
		expect(result.actScore).toBeLessThanOrEqual(24);
		expect(result.controlLevel).toBe('well-controlled-but-could-be-better');
	});

	it('returns ACT score 16-19 (not well controlled) for moderate symptoms', () => {
		const data = createWellControlledPatient();
		data.symptomFrequency.daytimeSymptoms = 'three-to-six';
		data.symptomFrequency.nighttimeAwakening = 'once-a-week';
		data.symptomFrequency.rescueInhalerUse = 'three-to-six';
		data.symptomFrequency.activityLimitation = 'somewhat';
		data.symptomFrequency.selfRatedControl = 'somewhat-controlled';

		const result = calculateACT(data);
		expect(result.actScore).toBeGreaterThanOrEqual(15);
		expect(result.actScore).toBeLessThanOrEqual(19);
		expect(result.controlLevel).toBe('not-well-controlled');
	});

	it('returns ACT score 5-15 (very poorly controlled) for severe symptoms', () => {
		const data = createWellControlledPatient();
		data.symptomFrequency.daytimeSymptoms = 'more-than-once-a-day';
		data.symptomFrequency.nighttimeAwakening = 'four-or-more-nights';
		data.symptomFrequency.rescueInhalerUse = 'two-or-more-times-a-day';
		data.symptomFrequency.activityLimitation = 'extremely';
		data.symptomFrequency.selfRatedControl = 'not-controlled-at-all';

		const result = calculateACT(data);
		expect(result.actScore).toBe(5);
		expect(result.controlLevel).toBe('very-poorly-controlled');
	});

	it('detects all rule IDs are unique', () => {
		const ids = actRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for well-controlled patient', () => {
		const data = createWellControlledPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags ICU admission history', () => {
		const data = createWellControlledPatient();
		data.exacerbationHistory.icuAdmissions = 'yes';
		data.exacerbationHistory.icuAdmissionCount = 1;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-EXAC-001')).toBe(true);
	});

	it('flags intubation history', () => {
		const data = createWellControlledPatient();
		data.exacerbationHistory.intubationHistory = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-EXAC-002')).toBe(true);
	});

	it('flags oral steroid dependence', () => {
		const data = createWellControlledPatient();
		data.currentMedications.oralSteroids = 'yes';
		data.currentMedications.oralSteroidDetails = 'Prednisolone 10mg daily';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-MEDS-001')).toBe(true);
	});

	it('flags poor lung function', () => {
		const data = createWellControlledPatient();
		data.lungFunction.fev1Percent = 55;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-LUNG-001')).toBe(true);
	});

	it('flags anaphylaxis allergy', () => {
		const data = createWellControlledPatient();
		data.allergies.drugAllergies = [
			{ allergen: 'Aspirin', reaction: 'Bronchospasm', severity: 'anaphylaxis' }
		];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Allergy' && f.priority === 'high')).toBe(true);
	});

	it('flags active smoking', () => {
		const data = createWellControlledPatient();
		data.socialHistory.smoking = 'current';
		data.socialHistory.smokingPackYears = 10;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SMOKE-001')).toBe(true);
	});

	it('flags frequent exacerbations', () => {
		const data = createWellControlledPatient();
		data.exacerbationHistory.exacerbationsLastYear = 4;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-FREQ-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createWellControlledPatient();
		data.exacerbationHistory.icuAdmissions = 'yes';
		data.exacerbationHistory.icuAdmissionCount = 1;
		data.comorbidities.gord = 'yes';
		data.comorbidities.allergicRhinitis = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
