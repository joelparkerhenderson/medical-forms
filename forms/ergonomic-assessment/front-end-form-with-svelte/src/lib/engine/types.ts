// ──────────────────────────────────────────────
// Core assessment data types
// ──────────────────────────────────────────────

export type YesNo = 'yes' | 'no' | '';
export type Sex = 'male' | 'female' | 'other' | '';
export type PainSeverity = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | null;

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: Sex;
	occupation: string;
	employer: string;
	jobTitle: string;
	yearsInRole: number | null;
}

export interface WorkstationSetup {
	deskHeight: 'too-low' | 'correct' | 'too-high' | '';
	chairType: 'fixed' | 'adjustable' | 'standing-desk' | 'other' | '';
	chairAdjustability: YesNo;
	monitorPosition: 'too-close' | 'correct' | 'too-far' | '';
	monitorDistance: 'less-than-40cm' | '40-70cm' | 'more-than-70cm' | '';
	monitorHeight: 'below-eye-level' | 'at-eye-level' | 'above-eye-level' | '';
	keyboardPlacement: 'correct' | 'too-high' | 'too-far' | 'angled-incorrectly' | '';
	mousePlacement: 'beside-keyboard' | 'too-far' | 'awkward-reach' | '';
	lighting: 'adequate' | 'too-bright' | 'too-dim' | 'glare-present' | '';
	temperature: 'comfortable' | 'too-hot' | 'too-cold' | '';
}

export interface PostureAssessment {
	sittingPosture: 'upright' | 'slouched' | 'leaning-forward' | 'reclined' | '';
	standingPosture: 'upright' | 'leaning' | 'asymmetric' | 'not-applicable' | '';
	neckAngle: 'neutral' | 'flexed-0-20' | 'flexed-20-plus' | 'extended' | 'twisted' | '';
	trunkAngle: 'neutral' | 'flexed-0-20' | 'flexed-20-60' | 'flexed-60-plus' | 'twisted' | '';
	shoulderPosition: 'neutral' | 'raised' | 'abducted' | 'flexed' | '';
	wristDeviation: 'neutral' | 'flexed' | 'extended' | 'ulnar-deviated' | 'radial-deviated' | '';
	neckScore: number | null;
	trunkScore: number | null;
	legScore: number | null;
	upperArmScore: number | null;
	lowerArmScore: number | null;
	wristScore: number | null;
}

export interface RepetitiveTasks {
	taskDescription: string;
	frequency: 'rarely' | 'occasionally' | 'frequently' | 'constantly' | '';
	durationPerSession: 'less-than-1hr' | '1-2hrs' | '2-4hrs' | 'more-than-4hrs' | '';
	forceRequired: 'none' | 'light' | 'moderate' | 'heavy' | '';
	vibrationExposure: YesNo;
	cycleTimeSeconds: number | null;
}

export interface ManualHandling {
	liftingFrequency: 'none' | 'occasional' | 'frequent' | 'constant' | '';
	loadWeightKg: number | null;
	carryDistanceMetres: number | null;
	pushPullForces: 'none' | 'light' | 'moderate' | 'heavy' | '';
	teamLifting: YesNo;
	mechanicalAidsAvailable: YesNo;
}

export interface CurrentSymptoms {
	painLocations: string[];
	painSeverity: PainSeverity;
	onsetDate: string;
	duration: 'less-than-1-week' | '1-4-weeks' | '1-3-months' | '3-6-months' | 'more-than-6-months' | '';
	aggravatingFactors: string;
	relievingFactors: string;
	impactOnWork: 'none' | 'mild' | 'moderate' | 'severe' | 'unable-to-work' | '';
}

export interface MedicalHistory {
	musculoskeletalConditions: string[];
	previousInjuries: string;
	surgeries: string;
	chronicPain: YesNo;
	rsiCarpalTunnel: YesNo;
	backProblems: YesNo;
}

export interface CurrentInterventions {
	ergonomicEquipment: string[];
	physiotherapy: YesNo;
	occupationalTherapy: YesNo;
	workplaceAdjustments: string;
	medications: string;
}

export interface PsychosocialFactors {
	jobSatisfaction: 'very-satisfied' | 'satisfied' | 'neutral' | 'dissatisfied' | 'very-dissatisfied' | '';
	workload: 'manageable' | 'slightly-heavy' | 'heavy' | 'excessive' | '';
	stressLevel: 'low' | 'moderate' | 'high' | 'very-high' | '';
	breaksTaken: 'regular' | 'occasional' | 'rarely' | 'none' | '';
	autonomy: 'high' | 'moderate' | 'low' | 'none' | '';
	employerSupport: 'excellent' | 'good' | 'fair' | 'poor' | '';
}

export interface Recommendations {
	equipmentChanges: string;
	workstationModifications: string;
	trainingRequired: string;
	breakSchedule: string;
	followUpDate: string;
	referrals: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	workstationSetup: WorkstationSetup;
	postureAssessment: PostureAssessment;
	repetitiveTasks: RepetitiveTasks;
	manualHandling: ManualHandling;
	currentSymptoms: CurrentSymptoms;
	medicalHistory: MedicalHistory;
	currentInterventions: CurrentInterventions;
	psychosocialFactors: PsychosocialFactors;
	recommendations: Recommendations;
}

// ──────────────────────────────────────────────
// REBA grading types
// ──────────────────────────────────────────────

export type RebaScore = number; // 1-15

export interface RebaRule {
	id: string;
	system: string;
	description: string;
	score: number;
	evaluate: (data: AssessmentData) => boolean;
}

export interface FiredRule {
	id: string;
	system: string;
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
	rebaScore: RebaScore;
	riskLevel: string;
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
