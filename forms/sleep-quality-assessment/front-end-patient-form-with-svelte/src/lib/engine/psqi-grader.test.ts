import { describe, it, expect } from 'vitest';
import { calculatePSQI } from './psqi-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { psqiComponents } from './psqi-rules';
import type { AssessmentData } from './types';

function createGoodSleeper(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1985-06-15',
			sex: 'female'
		},
		sleepHabits: {
			usualBedtime: '22:30',
			usualWakeTime: '06:30',
			minutesToFallAsleep: 10,
			hoursOfSleep: 8,
			sleepEnvironment: 'excellent'
		},
		sleepLatency: {
			timeToFallAsleep: 'not-during-past-month',
			wakeUpDuringNight: 'not-during-past-month'
		},
		sleepDuration: {
			actualSleepHours: 8,
			feelEnoughSleep: 'yes'
		},
		sleepEfficiency: {
			bedtime: '22:30',
			wakeTime: '06:30',
			hoursInBed: 8,
			hoursAsleep: 7.5
		},
		sleepDisturbances: {
			wakeUpMiddleNight: 'not-during-past-month',
			bathroomTrips: 'not-during-past-month',
			breathingDifficulty: 'not-during-past-month',
			coughingSnoring: 'not-during-past-month',
			tooHot: 'not-during-past-month',
			tooCold: 'not-during-past-month',
			badDreams: 'not-during-past-month',
			pain: 'not-during-past-month',
			otherDisturbances: ''
		},
		daytimeDysfunction: {
			troubleStayingAwake: 'not-during-past-month',
			enthusiasmProblem: 'not-during-past-month',
			drivingDrowsiness: 'no'
		},
		sleepMedicationUse: {
			prescriptionSleepMeds: 'no',
			otcSleepAids: 'no',
			frequency: 'not-during-past-month'
		},
		medicalLifestyle: {
			caffeineIntake: 'low-1-2',
			alcoholUse: 'none',
			exerciseFrequency: 'moderate-3-4',
			screenTimeBeforeBed: 'less-than-30-min',
			shiftWork: 'no',
			medicalConditions: '',
			currentMedications: ''
		}
	};
}

describe('PSQI Grading Engine', () => {
	it('returns PSQI 0 for a patient with excellent sleep quality', () => {
		const data = createGoodSleeper();
		const result = calculatePSQI(data);
		expect(result.psqiScore).toBe(0);
		expect(result.psqiCategoryLabel).toBe('Good sleep quality');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns Poor sleep quality (6-10) for moderate sleep issues', () => {
		const data = createGoodSleeper();
		data.sleepHabits.sleepEnvironment = 'fair';
		data.sleepHabits.minutesToFallAsleep = 45;
		data.sleepLatency.timeToFallAsleep = 'once-or-twice-week';
		data.sleepDuration.actualSleepHours = 5.5;
		data.sleepEfficiency.hoursAsleep = 5.5;
		data.sleepEfficiency.hoursInBed = 8;

		const result = calculatePSQI(data);
		expect(result.psqiScore).toBeGreaterThanOrEqual(6);
		expect(result.psqiScore).toBeLessThanOrEqual(10);
		expect(result.psqiCategoryLabel).toBe('Poor sleep quality');
	});

	it('returns Sleep disorder likely (11-15) for significant issues', () => {
		const data = createGoodSleeper();
		data.sleepHabits.sleepEnvironment = 'poor';
		data.sleepHabits.minutesToFallAsleep = 60;
		data.sleepLatency.timeToFallAsleep = 'three-or-more-week';
		data.sleepDuration.actualSleepHours = 4.5;
		data.sleepEfficiency.hoursAsleep = 4.5;
		data.sleepEfficiency.hoursInBed = 9;
		data.sleepDisturbances.wakeUpMiddleNight = 'three-or-more-week';
		data.sleepDisturbances.bathroomTrips = 'once-or-twice-week';
		data.daytimeDysfunction.troubleStayingAwake = 'once-or-twice-week';
		data.daytimeDysfunction.enthusiasmProblem = 'once-or-twice-week';

		const result = calculatePSQI(data);
		expect(result.psqiScore).toBeGreaterThanOrEqual(11);
		expect(result.psqiScore).toBeLessThanOrEqual(15);
		expect(result.psqiCategoryLabel).toBe('Sleep disorder likely');
	});

	it('returns Severe sleep disturbance (16-21) for maximum impact', () => {
		const data = createGoodSleeper();
		data.sleepHabits.sleepEnvironment = 'poor';
		data.sleepHabits.minutesToFallAsleep = 90;
		data.sleepLatency.timeToFallAsleep = 'three-or-more-week';
		data.sleepDuration.actualSleepHours = 3;
		data.sleepEfficiency.hoursAsleep = 3;
		data.sleepEfficiency.hoursInBed = 10;
		data.sleepDisturbances.wakeUpMiddleNight = 'three-or-more-week';
		data.sleepDisturbances.bathroomTrips = 'three-or-more-week';
		data.sleepDisturbances.breathingDifficulty = 'three-or-more-week';
		data.sleepDisturbances.coughingSnoring = 'three-or-more-week';
		data.sleepDisturbances.pain = 'three-or-more-week';
		data.sleepMedicationUse.frequency = 'three-or-more-week';
		data.daytimeDysfunction.troubleStayingAwake = 'three-or-more-week';
		data.daytimeDysfunction.enthusiasmProblem = 'three-or-more-week';

		const result = calculatePSQI(data);
		expect(result.psqiScore).toBeGreaterThanOrEqual(16);
		expect(result.psqiScore).toBeLessThanOrEqual(21);
		expect(result.psqiCategoryLabel).toBe('Severe sleep disturbance');
	});

	it('detects all component IDs are unique', () => {
		const ids = psqiComponents.map((c) => c.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('handles null scores gracefully (unanswered questions)', () => {
		const data = createGoodSleeper();
		data.sleepHabits.minutesToFallAsleep = null;
		data.sleepDuration.actualSleepHours = null;
		data.sleepEfficiency.hoursAsleep = null;
		data.sleepEfficiency.hoursInBed = null;

		const result = calculatePSQI(data);
		expect(result.psqiScore).toBe(0);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for good sleeper', () => {
		const data = createGoodSleeper();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags sleep apnea suspicion', () => {
		const data = createGoodSleeper();
		data.sleepDisturbances.breathingDifficulty = 'once-or-twice-week';
		data.sleepDisturbances.coughingSnoring = 'once-or-twice-week';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-APNEA-001')).toBe(true);
	});

	it('flags severe insomnia', () => {
		const data = createGoodSleeper();
		data.sleepHabits.minutesToFallAsleep = 90;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-INSOMNIA-001')).toBe(true);
	});

	it('flags excessive daytime sleepiness with driving drowsiness', () => {
		const data = createGoodSleeper();
		data.daytimeDysfunction.drivingDrowsiness = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-EDS-002')).toBe(true);
	});

	it('flags high medication use', () => {
		const data = createGoodSleeper();
		data.sleepMedicationUse.prescriptionSleepMeds = 'yes';
		data.sleepMedicationUse.otcSleepAids = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-MEDS-001')).toBe(true);
	});

	it('flags shift work', () => {
		const data = createGoodSleeper();
		data.medicalLifestyle.shiftWork = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SHIFT-001')).toBe(true);
	});

	it('flags high caffeine intake', () => {
		const data = createGoodSleeper();
		data.medicalLifestyle.caffeineIntake = 'high-5-plus';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SUBSTANCE-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createGoodSleeper();
		data.sleepHabits.minutesToFallAsleep = 90;
		data.medicalLifestyle.shiftWork = 'yes';
		data.medicalLifestyle.caffeineIntake = 'high-5-plus';
		data.medicalLifestyle.screenTimeBeforeBed = 'more-than-60-min';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
