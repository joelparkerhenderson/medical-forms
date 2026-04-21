import { describe, it, expect } from 'vitest';
import { calculateGISeverity } from './gi-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { giRules } from './gi-rules';
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
			bmi: 24.5
		},
		chiefComplaint: {
			primarySymptom: '',
			symptomLocation: '',
			symptomOnset: '',
			symptomDuration: '',
			severityScore: null
		},
		upperGISymptoms: {
			dysphagia: 'no',
			dysphagiaDetails: '',
			odynophagia: 'no',
			heartburn: 'no',
			heartburnFrequency: '',
			nausea: 'no',
			vomiting: 'no',
			vomitingDetails: '',
			earlySatiety: 'no'
		},
		lowerGISymptoms: {
			bowelHabitChange: 'no',
			bowelHabitDetails: '',
			diarrhoea: 'no',
			diarrhoeaFrequency: '',
			constipation: 'no',
			constipationDetails: '',
			rectalBleeding: 'no',
			rectalBleedingDetails: '',
			tenesmus: 'no',
			bristolStoolType: '4'
		},
		abdominalPainAssessment: {
			painLocation: '',
			painCharacter: '',
			painRadiation: '',
			aggravatingFactors: '',
			relievingFactors: '',
			painFrequency: ''
		},
		liverPancreas: {
			jaundice: 'no',
			darkUrine: 'no',
			paleStools: 'no',
			alcoholIntake: 'none',
			alcoholUnitsPerWeek: null,
			hepatitisExposure: 'no',
			hepatitisDetails: ''
		},
		previousGIHistory: {
			previousEndoscopy: 'no',
			endoscopyDetails: '',
			previousColonoscopy: 'no',
			colonoscopyDetails: '',
			previousGISurgery: 'no',
			surgeryDetails: '',
			ibd: 'no',
			ibdType: '',
			ibs: 'no',
			celiacDisease: 'no',
			polyps: 'no',
			polypDetails: '',
			giCancer: 'no',
			giCancerDetails: ''
		},
		currentMedications: {
			ppis: 'no',
			ppiDetails: '',
			antacids: 'no',
			laxatives: 'no',
			laxativeDetails: '',
			antiDiarrhoeals: 'no',
			biologics: 'no',
			biologicDetails: '',
			steroids: 'no',
			steroidDetails: '',
			nsaids: 'no',
			nsaidDetails: '',
			otherMedications: []
		},
		allergiesDiet: {
			drugAllergies: [],
			foodIntolerances: '',
			dietaryRestrictions: '',
			glutenIntolerance: 'no',
			lactoseIntolerance: 'no'
		},
		redFlagsSocial: {
			unexplainedWeightLoss: 'no',
			weightLossAmount: '',
			appetiteChange: 'no',
			appetiteDetails: '',
			familyGICancer: 'no',
			familyCancerDetails: '',
			smoking: 'never',
			smokingPackYears: null,
			alcoholUse: 'none'
		}
	};
}

describe('GI Severity Scoring Engine', () => {
	it('returns minimal score for a healthy patient', () => {
		const data = createHealthyPatient();
		const result = calculateGISeverity(data);
		expect(result.severityScore).toBe(0);
		expect(result.severityLevel).toBe('minimal');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns mild score for heartburn + nausea', () => {
		const data = createHealthyPatient();
		data.upperGISymptoms.heartburn = 'yes';
		data.upperGISymptoms.nausea = 'yes';
		data.chiefComplaint.severityScore = 4;

		const result = calculateGISeverity(data);
		expect(result.severityScore).toBeGreaterThanOrEqual(7);
		expect(result.firedRules.length).toBeGreaterThanOrEqual(3);
	});

	it('returns moderate score for rectal bleeding + bowel habit change + IBD', () => {
		const data = createHealthyPatient();
		data.lowerGISymptoms.rectalBleeding = 'yes';
		data.lowerGISymptoms.bowelHabitChange = 'yes';
		data.previousGIHistory.ibd = 'yes';
		data.previousGIHistory.ibdType = 'crohns';
		data.chiefComplaint.severityScore = 6;

		const result = calculateGISeverity(data);
		expect(result.severityScore).toBeGreaterThanOrEqual(15);
		expect(result.firedRules.length).toBeGreaterThanOrEqual(4);
	});

	it('returns severe score for multiple red flags', () => {
		const data = createHealthyPatient();
		data.upperGISymptoms.dysphagia = 'yes';
		data.lowerGISymptoms.rectalBleeding = 'yes';
		data.redFlagsSocial.unexplainedWeightLoss = 'yes';
		data.liverPancreas.jaundice = 'yes';
		data.previousGIHistory.giCancer = 'yes';
		data.chiefComplaint.severityScore = 9;
		data.abdominalPainAssessment.painFrequency = 'constant';

		const result = calculateGISeverity(data);
		expect(result.severityScore).toBeGreaterThanOrEqual(31);
	});

	it('detects all rule IDs are unique', () => {
		const ids = giRules.map((r) => r.id);
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

	it('flags rectal bleeding', () => {
		const data = createHealthyPatient();
		data.lowerGISymptoms.rectalBleeding = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BLEED-001')).toBe(true);
	});

	it('flags dysphagia', () => {
		const data = createHealthyPatient();
		data.upperGISymptoms.dysphagia = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-DYSPH-001')).toBe(true);
	});

	it('flags unexplained weight loss', () => {
		const data = createHealthyPatient();
		data.redFlagsSocial.unexplainedWeightLoss = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-WTLOSS-001')).toBe(true);
	});

	it('flags jaundice', () => {
		const data = createHealthyPatient();
		data.liverPancreas.jaundice = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-JAUND-001')).toBe(true);
	});

	it('flags family GI cancer', () => {
		const data = createHealthyPatient();
		data.redFlagsSocial.familyGICancer = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-FAMCA-001')).toBe(true);
	});

	it('flags NSAID use', () => {
		const data = createHealthyPatient();
		data.currentMedications.nsaids = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-NSAID-001')).toBe(true);
	});

	it('flags severe drug allergy', () => {
		const data = createHealthyPatient();
		data.allergiesDiet.drugAllergies = [
			{ allergen: 'Metoclopramide', reaction: 'Anaphylaxis', severity: 'severe' }
		];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Allergy' && f.priority === 'high')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.lowerGISymptoms.rectalBleeding = 'yes';
		data.currentMedications.nsaids = 'yes';
		data.liverPancreas.alcoholIntake = 'heavy';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
