import type { AssessmentData, GradingResult } from '$lib/engine/types';

function createDefaultAssessment(): AssessmentData {
	return {
		demographics: {
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			sex: ''
		},
		sleepHabits: {
			usualBedtime: '',
			usualWakeTime: '',
			minutesToFallAsleep: null,
			hoursOfSleep: null,
			sleepEnvironment: ''
		},
		sleepLatency: {
			timeToFallAsleep: '',
			wakeUpDuringNight: ''
		},
		sleepDuration: {
			actualSleepHours: null,
			feelEnoughSleep: ''
		},
		sleepEfficiency: {
			bedtime: '',
			wakeTime: '',
			hoursInBed: null,
			hoursAsleep: null
		},
		sleepDisturbances: {
			wakeUpMiddleNight: '',
			bathroomTrips: '',
			breathingDifficulty: '',
			coughingSnoring: '',
			tooHot: '',
			tooCold: '',
			badDreams: '',
			pain: '',
			otherDisturbances: ''
		},
		daytimeDysfunction: {
			troubleStayingAwake: '',
			enthusiasmProblem: '',
			drivingDrowsiness: ''
		},
		sleepMedicationUse: {
			prescriptionSleepMeds: '',
			otcSleepAids: '',
			frequency: ''
		},
		medicalLifestyle: {
			caffeineIntake: '',
			alcoholUse: '',
			exerciseFrequency: '',
			screenTimeBeforeBed: '',
			shiftWork: '',
			medicalConditions: '',
			currentMedications: ''
		}
	};
}

class AssessmentStore {
	data = $state<AssessmentData>(createDefaultAssessment());
	result = $state<GradingResult | null>(null);
	currentStep = $state(1);

	reset() {
		this.data = createDefaultAssessment();
		this.result = null;
		this.currentStep = 1;
	}
}

export const assessment = new AssessmentStore();
