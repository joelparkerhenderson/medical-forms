import { describe, it, expect } from 'vitest';
import { calculateMMSE } from './mmse-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { mmseDomains } from './mmse-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1950-06-15',
			sex: 'female',
			educationLevel: 'university',
			primaryLanguage: 'English',
			handedness: 'right'
		},
		referralInformation: {
			referralSource: 'gp',
			referralReason: 'screening',
			referringClinician: 'Dr. Brown',
			referralDate: '2026-03-01',
			urgency: 'routine',
			previousCognitiveAssessment: 'no',
			previousAssessmentDetails: ''
		},
		orientationScores: {
			year: 1, season: 1, date: 1, day: 1, month: 1,
			country: 1, county: 1, town: 1, hospital: 1, floor: 1
		},
		registrationScores: {
			object1: 1, object2: 1, object3: 1
		},
		attentionScores: {
			serial1: 1, serial2: 1, serial3: 1, serial4: 1, serial5: 1
		},
		recallScores: {
			object1: 1, object2: 1, object3: 1
		},
		languageScores: {
			naming1: 1, naming2: 1,
			repetition: 1,
			command1: 1, command2: 1, command3: 1,
			reading: 1,
			writing: 1
		},
		repetitionCommands: {
			naming1: 1, naming2: 1,
			repetition: 1,
			command1: 1, command2: 1, command3: 1,
			reading: 1,
			writing: 1
		},
		visuospatialScores: {
			copying: 1
		},
		functionalHistory: {
			livingArrangement: 'with-spouse',
			adlBathing: 'independent',
			adlDressing: 'independent',
			adlMeals: 'independent',
			adlMedications: 'independent',
			adlFinances: 'independent',
			adlTransport: 'independent',
			recentChanges: '',
			safetyConerns: '',
			carersAvailable: 'yes',
			carerDetails: 'Spouse'
		}
	};
}

describe('MMSE Grading Engine', () => {
	it('returns MMSE 30 for a patient with perfect scores', () => {
		const data = createHealthyPatient();
		const result = calculateMMSE(data);
		expect(result.mmseScore).toBe(30);
		expect(result.mmseCategoryLabel).toBe('Normal cognition');
		expect(result.firedRules.length).toBe(30);
	});

	it('returns Normal cognition (24-30) for minor deficits', () => {
		const data = createHealthyPatient();
		data.orientationScores.date = 0;
		data.recallScores.object3 = 0;

		const result = calculateMMSE(data);
		expect(result.mmseScore).toBe(28);
		expect(result.mmseCategoryLabel).toBe('Normal cognition');
	});

	it('returns Mild cognitive impairment (18-23) for moderate deficits', () => {
		const data = createHealthyPatient();
		data.orientationScores.year = 0;
		data.orientationScores.season = 0;
		data.orientationScores.date = 0;
		data.orientationScores.day = 0;
		data.recallScores.object1 = 0;
		data.recallScores.object2 = 0;
		data.recallScores.object3 = 0;
		data.attentionScores.serial3 = 0;
		data.attentionScores.serial4 = 0;
		data.attentionScores.serial5 = 0;

		const result = calculateMMSE(data);
		expect(result.mmseScore).toBe(20);
		expect(result.mmseCategoryLabel).toBe('Mild cognitive impairment');
	});

	it('returns Moderate cognitive impairment (10-17) for significant deficits', () => {
		const data = createHealthyPatient();
		// Lose 16 points from a perfect 30 => 14
		data.orientationScores.year = 0;
		data.orientationScores.season = 0;
		data.orientationScores.date = 0;
		data.orientationScores.day = 0;
		data.orientationScores.month = 0;
		data.orientationScores.county = 0;
		data.orientationScores.town = 0;
		data.registrationScores.object2 = 0;
		data.registrationScores.object3 = 0;
		data.attentionScores.serial1 = 0;
		data.attentionScores.serial2 = 0;
		data.attentionScores.serial3 = 0;
		data.attentionScores.serial4 = 0;
		data.attentionScores.serial5 = 0;
		data.recallScores.object1 = 0;
		data.recallScores.object2 = 0;

		const result = calculateMMSE(data);
		expect(result.mmseScore).toBe(14);
		expect(result.mmseCategoryLabel).toBe('Moderate cognitive impairment');
	});

	it('returns Severe cognitive impairment (0-9) for pervasive deficits', () => {
		const data = createHealthyPatient();
		// Set most scores to 0
		data.orientationScores = {
			year: 0, season: 0, date: 0, day: 0, month: 0,
			country: 0, county: 0, town: 0, hospital: 0, floor: 0
		};
		data.registrationScores = { object1: 0, object2: 0, object3: 0 };
		data.attentionScores = { serial1: 0, serial2: 0, serial3: 0, serial4: 0, serial5: 0 };
		data.recallScores = { object1: 0, object2: 0, object3: 0 };
		data.repetitionCommands = {
			naming1: 1, naming2: 1,
			repetition: 0,
			command1: 1, command2: 0, command3: 0,
			reading: 0,
			writing: 0
		};
		data.visuospatialScores = { copying: 0 };

		const result = calculateMMSE(data);
		expect(result.mmseScore).toBe(3);
		expect(result.mmseCategoryLabel).toBe('Severe cognitive impairment');
	});

	it('detects all domain IDs are unique', () => {
		const ids = mmseDomains.map((d) => d.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('handles null scores gracefully (unanswered items)', () => {
		const data = createHealthyPatient();
		data.orientationScores.year = null;
		data.orientationScores.season = null;
		data.recallScores.object1 = null;

		const result = calculateMMSE(data);
		expect(result.mmseScore).toBe(27);
	});

	it('returns MMSE 0 when all scores are 0', () => {
		const data = createHealthyPatient();
		data.orientationScores = {
			year: 0, season: 0, date: 0, day: 0, month: 0,
			country: 0, county: 0, town: 0, hospital: 0, floor: 0
		};
		data.registrationScores = { object1: 0, object2: 0, object3: 0 };
		data.attentionScores = { serial1: 0, serial2: 0, serial3: 0, serial4: 0, serial5: 0 };
		data.recallScores = { object1: 0, object2: 0, object3: 0 };
		data.repetitionCommands = {
			naming1: 0, naming2: 0, repetition: 0,
			command1: 0, command2: 0, command3: 0,
			reading: 0, writing: 0
		};
		data.visuospatialScores = { copying: 0 };

		const result = calculateMMSE(data);
		expect(result.mmseScore).toBe(0);
		expect(result.mmseCategoryLabel).toBe('Severe cognitive impairment');
		expect(result.firedRules).toHaveLength(0);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient with perfect scores', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags severe cognitive impairment', () => {
		const data = createHealthyPatient();
		data.orientationScores = {
			year: 0, season: 0, date: 0, day: 0, month: 0,
			country: 0, county: 0, town: 0, hospital: 0, floor: 0
		};
		data.registrationScores = { object1: 0, object2: 0, object3: 0 };
		data.attentionScores = { serial1: 0, serial2: 0, serial3: 0, serial4: 0, serial5: 0 };
		data.recallScores = { object1: 0, object2: 0, object3: 0 };
		data.repetitionCommands = {
			naming1: 0, naming2: 0, repetition: 0,
			command1: 0, command2: 0, command3: 0,
			reading: 0, writing: 0
		};
		data.visuospatialScores = { copying: 0 };

		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SEVERE-001')).toBe(true);
	});

	it('flags complete recall failure', () => {
		const data = createHealthyPatient();
		data.recallScores = { object1: 0, object2: 0, object3: 0 };

		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-MEMORY-001')).toBe(true);
	});

	it('flags temporal disorientation', () => {
		const data = createHealthyPatient();
		data.orientationScores.year = 0;
		data.orientationScores.season = 0;
		data.orientationScores.date = 0;
		data.orientationScores.day = 0;

		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ORIENT-TIME-001')).toBe(true);
	});

	it('flags safety concerns', () => {
		const data = createHealthyPatient();
		data.functionalHistory.safetyConerns = 'Leaves stove on frequently';

		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SAFETY-001')).toBe(true);
	});

	it('flags naming failure', () => {
		const data = createHealthyPatient();
		data.repetitionCommands.naming1 = 0;
		data.repetitionCommands.naming2 = 0;

		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-LANGUAGE-002')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.orientationScores = {
			year: 0, season: 0, date: 0, day: 0, month: 0,
			country: 0, county: 0, town: 0, hospital: 0, floor: 0
		};
		data.recallScores = { object1: 0, object2: 0, object3: 0 };
		data.functionalHistory.carersAvailable = 'no';

		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
