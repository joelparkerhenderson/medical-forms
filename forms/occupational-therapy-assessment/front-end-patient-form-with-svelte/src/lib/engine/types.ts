// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type DifficultyLevel = 'none' | 'some' | 'significant' | 'unable' | '';

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
}

export interface ReferralInfo {
	referralSource: string;
	referralReason: string;
	referringClinician: string;
	referralDate: string;
	primaryDiagnosis: string;
}

export interface ActivityArea {
	difficulty: DifficultyLevel;
	details: string;
}

export interface SelfCareActivities {
	personalCare: ActivityArea;
	functionalMobility: ActivityArea;
	communityManagement: ActivityArea;
}

export interface ProductivityActivities {
	paidWork: ActivityArea;
	householdManagement: ActivityArea;
	education: ActivityArea;
}

export interface LeisureActivities {
	quietRecreation: ActivityArea;
	activeRecreation: ActivityArea;
	socialParticipation: ActivityArea;
}

export interface PerformanceActivity {
	name: string;
	importance: number | null;
	performanceScore: number | null;
}

export interface PerformanceRatings {
	activity1: PerformanceActivity;
	activity2: PerformanceActivity;
	activity3: PerformanceActivity;
	activity4: PerformanceActivity;
	activity5: PerformanceActivity;
}

export interface SatisfactionActivity {
	name: string;
	satisfactionScore: number | null;
}

export interface SatisfactionRatings {
	activity1: SatisfactionActivity;
	activity2: SatisfactionActivity;
	activity3: SatisfactionActivity;
	activity4: SatisfactionActivity;
	activity5: SatisfactionActivity;
}

export interface EnvironmentalFactors {
	homeEnvironment: string;
	workEnvironment: string;
	communityAccess: string;
	assistiveDevices: string;
	socialSupport: string;
}

export interface PhysicalCognitiveStatus {
	upperExtremity: string;
	lowerExtremity: string;
	coordination: string;
	cognition: string;
	vision: string;
	fatigue: string;
	pain: string;
}

export interface GoalsPriorities {
	shortTermGoals: string;
	longTermGoals: string;
	priorityAreas: string;
	dischargeGoals: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	referralInfo: ReferralInfo;
	selfCareActivities: SelfCareActivities;
	productivityActivities: ProductivityActivities;
	leisureActivities: LeisureActivities;
	performanceRatings: PerformanceRatings;
	satisfactionRatings: SatisfactionRatings;
	environmentalFactors: EnvironmentalFactors;
	physicalCognitiveStatus: PhysicalCognitiveStatus;
	goalsPriorities: GoalsPriorities;
}

// ──────────────────────────────────────────────
// COPM grading types
// ──────────────────────────────────────────────

export interface COPMRuleDefinition {
	id: string;
	activityNumber: number;
	domain: string;
	text: string;
}

export interface FiredRule {
	id: string;
	domain: string;
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
	performanceScore: number;
	satisfactionScore: number;
	performanceCategory: string;
	satisfactionCategory: string;
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
