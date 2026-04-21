// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type FrequencyScore = 0 | 1 | 2 | 3;
export type SleepEnvironment = 'excellent' | 'good' | 'fair' | 'poor' | '';
export type FrequencyOption = 'not-during-past-month' | 'less-than-once-week' | 'once-or-twice-week' | 'three-or-more-week' | '';
export type MedicationFrequency = 'not-during-past-month' | 'less-than-once-week' | 'once-or-twice-week' | 'three-or-more-week' | '';
export type ExerciseFrequency = 'none' | 'light-1-2' | 'moderate-3-4' | 'vigorous-5-plus' | '';
export type CaffeineIntake = 'none' | 'low-1-2' | 'moderate-3-4' | 'high-5-plus' | '';
export type AlcoholUse = 'none' | 'occasional' | 'moderate' | 'heavy' | '';
export type ScreenTime = 'none' | 'less-than-30-min' | '30-60-min' | 'more-than-60-min' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
}

export interface SleepHabits {
	usualBedtime: string;
	usualWakeTime: string;
	minutesToFallAsleep: number | null;
	hoursOfSleep: number | null;
	sleepEnvironment: SleepEnvironment;
}

export interface SleepLatency {
	timeToFallAsleep: FrequencyOption;
	wakeUpDuringNight: FrequencyOption;
}

export interface SleepDuration {
	actualSleepHours: number | null;
	feelEnoughSleep: YesNo;
}

export interface SleepEfficiency {
	bedtime: string;
	wakeTime: string;
	hoursInBed: number | null;
	hoursAsleep: number | null;
}

export interface SleepDisturbances {
	wakeUpMiddleNight: FrequencyOption;
	bathroomTrips: FrequencyOption;
	breathingDifficulty: FrequencyOption;
	coughingSnoring: FrequencyOption;
	tooHot: FrequencyOption;
	tooCold: FrequencyOption;
	badDreams: FrequencyOption;
	pain: FrequencyOption;
	otherDisturbances: string;
}

export interface DaytimeDysfunction {
	troubleStayingAwake: FrequencyOption;
	enthusiasmProblem: FrequencyOption;
	drivingDrowsiness: YesNo;
}

export interface SleepMedicationUse {
	prescriptionSleepMeds: YesNo;
	otcSleepAids: YesNo;
	frequency: MedicationFrequency;
}

export interface MedicalLifestyle {
	caffeineIntake: CaffeineIntake;
	alcoholUse: AlcoholUse;
	exerciseFrequency: ExerciseFrequency;
	screenTimeBeforeBed: ScreenTime;
	shiftWork: YesNo;
	medicalConditions: string;
	currentMedications: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	sleepHabits: SleepHabits;
	sleepLatency: SleepLatency;
	sleepDuration: SleepDuration;
	sleepEfficiency: SleepEfficiency;
	sleepDisturbances: SleepDisturbances;
	daytimeDysfunction: DaytimeDysfunction;
	sleepMedicationUse: SleepMedicationUse;
	medicalLifestyle: MedicalLifestyle;
}

// ──────────────────────────────────────────────
// PSQI grading types
// ──────────────────────────────────────────────

export interface PSQIComponentDefinition {
	id: string;
	componentNumber: number;
	name: string;
	description: string;
}

export interface FiredRule {
	id: string;
	component: string;
	description: string;
	score: number;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	psqiScore: number;
	psqiCategory: string;
	firedRules: FiredRule[];
	additionalFlags: AdditionalFlag[];
	timestamp: string;
}

// ──────────────────────────────────────────────
// Step configuration
// ──────────────────────────────────────────────

export interface StepConfig {
	number: number;
	title: string;
	shortTitle: string;
	section: keyof AssessmentData;
}
