// ──────────────────────────────────────────────
// Core PCL-5 (PTSD Checklist for DSM-5) data types
// ──────────────────────────────────────────────

export interface Demographics {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	sex: 'male' | 'female' | 'other' | '';
}

export interface TraumaEvent {
	eventDescription: string;
	eventDate: string;
	isOngoing: boolean;
}

// 20 items of the PCL-5, each rated 0 (Not at all) to 4 (Extremely)
// Cluster B (intrusion): items 1-5
// Cluster C (avoidance): items 6-7
// Cluster D (negative alterations): items 8-14
// Cluster E (arousal & reactivity): items 15-20
export type PclItemScore = 0 | 1 | 2 | 3 | 4 | null;

export interface ClusterBIntrusion {
	item1RepeatedDisturbingMemories: PclItemScore;
	item2RepeatedDisturbingDreams: PclItemScore;
	item3FeelingReliving: PclItemScore;
	item4FeelingUpsetByReminders: PclItemScore;
	item5StrongPhysicalReactions: PclItemScore;
}

export interface ClusterCAvoidance {
	item6AvoidingMemoriesThoughtsFeelings: PclItemScore;
	item7AvoidingExternalReminders: PclItemScore;
}

export interface ClusterDNegativeAlterations {
	item8TroubleRememberingImportantParts: PclItemScore;
	item9StrongNegativeBeliefs: PclItemScore;
	item10BlamingSelfOrOthers: PclItemScore;
	item11StrongNegativeFeelings: PclItemScore;
	item12LossOfInterest: PclItemScore;
	item13FeelingDistantFromOthers: PclItemScore;
	item14TroubleExperiencingPositiveFeelings: PclItemScore;
}

export interface ClusterEArousalReactivity {
	item15IrritableOrAggressive: PclItemScore;
	item16RecklessOrSelfDestructive: PclItemScore;
	item17SuperAlertOrOnGuard: PclItemScore;
	item18JumpyOrEasilyStartled: PclItemScore;
	item19DifficultyConcentrating: PclItemScore;
	item20TroubleSleeping: PclItemScore;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	demographics: Demographics;
	traumaEvent: TraumaEvent;
	clusterBIntrusion: ClusterBIntrusion;
	clusterCAvoidance: ClusterCAvoidance;
	clusterDNegativeAlterations: ClusterDNegativeAlterations;
	clusterEArousalReactivity: ClusterEArousalReactivity;
}

// ──────────────────────────────────────────────
// Grading result types
// ──────────────────────────────────────────────

export type SeverityCategory = 'Minimal' | 'Mild' | 'Moderate' | 'Severe';

export interface ClusterScores {
	b: number;
	c: number;
	d: number;
	e: number;
}

export interface FiredRule {
	id: string;
	category: string;
	description: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	totalScore: number;                    // 0-80
	category: SeverityCategory;
	probableDsm5Diagnosis: boolean;        // cluster thresholds met at item-level ≥ 2
	clusterScores: ClusterScores;
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
