import type {
	AssessmentData,
	GradingResult,
	SeverityCategory,
	ClusterScores,
	PclItemScore
} from './types';
import { detectFiredRules } from './rules';
import { detectAdditionalFlags } from './flagged-issues';

const CUT_OFF = 33; // Provisional PTSD threshold

function sum(items: PclItemScore[]): number {
	return items.reduce<number>((acc, v) => acc + (v ?? 0), 0);
}

function computeClusterScores(data: AssessmentData): ClusterScores {
	return {
		b: sum([
			data.clusterBIntrusion.item1RepeatedDisturbingMemories,
			data.clusterBIntrusion.item2RepeatedDisturbingDreams,
			data.clusterBIntrusion.item3FeelingReliving,
			data.clusterBIntrusion.item4FeelingUpsetByReminders,
			data.clusterBIntrusion.item5StrongPhysicalReactions
		]),
		c: sum([
			data.clusterCAvoidance.item6AvoidingMemoriesThoughtsFeelings,
			data.clusterCAvoidance.item7AvoidingExternalReminders
		]),
		d: sum([
			data.clusterDNegativeAlterations.item8TroubleRememberingImportantParts,
			data.clusterDNegativeAlterations.item9StrongNegativeBeliefs,
			data.clusterDNegativeAlterations.item10BlamingSelfOrOthers,
			data.clusterDNegativeAlterations.item11StrongNegativeFeelings,
			data.clusterDNegativeAlterations.item12LossOfInterest,
			data.clusterDNegativeAlterations.item13FeelingDistantFromOthers,
			data.clusterDNegativeAlterations.item14TroubleExperiencingPositiveFeelings
		]),
		e: sum([
			data.clusterEArousalReactivity.item15IrritableOrAggressive,
			data.clusterEArousalReactivity.item16RecklessOrSelfDestructive,
			data.clusterEArousalReactivity.item17SuperAlertOrOnGuard,
			data.clusterEArousalReactivity.item18JumpyOrEasilyStartled,
			data.clusterEArousalReactivity.item19DifficultyConcentrating,
			data.clusterEArousalReactivity.item20TroubleSleeping
		])
	};
}

function categorise(total: number): SeverityCategory {
	if (total <= 20) return 'Minimal';
	if (total <= 32) return 'Mild';
	if (total <= 37) return 'Moderate';
	return 'Severe';
}

function countItemsAtOrAbove(items: PclItemScore[], threshold: number): number {
	return items.filter((v) => (v ?? 0) >= threshold).length;
}

/**
 * DSM-5 provisional diagnosis: ≥ 1 B item, ≥ 1 C item, ≥ 2 D items, ≥ 2 E items,
 * each rated ≥ 2 (Moderately), AND total ≥ CUT_OFF.
 */
function meetsDsm5Pattern(data: AssessmentData, total: number): boolean {
	if (total < CUT_OFF) return false;
	const b = countItemsAtOrAbove(Object.values(data.clusterBIntrusion) as PclItemScore[], 2) >= 1;
	const c = countItemsAtOrAbove(Object.values(data.clusterCAvoidance) as PclItemScore[], 2) >= 1;
	const d = countItemsAtOrAbove(Object.values(data.clusterDNegativeAlterations) as PclItemScore[], 2) >= 2;
	const e = countItemsAtOrAbove(Object.values(data.clusterEArousalReactivity) as PclItemScore[], 2) >= 2;
	return b && c && d && e;
}

export function gradeAssessment(data: AssessmentData): GradingResult {
	const clusterScores = computeClusterScores(data);
	const totalScore = clusterScores.b + clusterScores.c + clusterScores.d + clusterScores.e;
	const category = categorise(totalScore);
	const probableDsm5Diagnosis = meetsDsm5Pattern(data, totalScore);
	const firedRules = detectFiredRules(data, totalScore, category, probableDsm5Diagnosis);
	const additionalFlags = detectAdditionalFlags(data, totalScore, probableDsm5Diagnosis);

	return {
		totalScore,
		category,
		probableDsm5Diagnosis,
		clusterScores,
		firedRules,
		additionalFlags,
		timestamp: new Date().toISOString()
	};
}
