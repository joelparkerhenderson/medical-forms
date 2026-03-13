import type { ASRSRule } from './types';
import { sumScores, countPartAShadedItems } from './utils';

/**
 * Declarative ASRS grading rules for ADHD assessment.
 * Each rule evaluates patient data and returns true if the condition is present.
 * The ADHD classification is determined by the combination of Part A screening
 * and total ASRS score.
 */
export const asrsRules: ASRSRule[] = [
	// ─── PART A SCREENER RULES ──────────────────────────────────
	{
		id: 'ASRS-PA-001',
		domain: 'Part A Screener',
		description: 'Part A screener positive (4+ items in shaded range)',
		classification: 'likely',
		evaluate: (d) => {
			const a = d.asrsPartA;
			const count = countPartAShadedItems(
				a.focusDifficulty,
				a.organizationDifficulty,
				a.rememberingDifficulty,
				a.avoidingTasks,
				a.fidgeting,
				a.overlyActive
			);
			return count >= 4;
		}
	},
	{
		id: 'ASRS-PA-002',
		domain: 'Part A Screener',
		description: 'Part A screener borderline (3 items in shaded range)',
		classification: 'possible',
		evaluate: (d) => {
			const a = d.asrsPartA;
			const count = countPartAShadedItems(
				a.focusDifficulty,
				a.organizationDifficulty,
				a.rememberingDifficulty,
				a.avoidingTasks,
				a.fidgeting,
				a.overlyActive
			);
			return count === 3;
		}
	},

	// ─── INATTENTIVE DOMAIN RULES ────────────────────────────────
	{
		id: 'ASRS-IN-001',
		domain: 'Inattentive',
		description: 'High inattentive symptom frequency (Part A Q1-3 + Part B Q7-11 total >= 20)',
		classification: 'likely',
		evaluate: (d) => {
			const scores = [
				d.asrsPartA.focusDifficulty,
				d.asrsPartA.organizationDifficulty,
				d.asrsPartA.rememberingDifficulty,
				d.asrsPartB.carelessMistakes,
				d.asrsPartB.attentionDifficulty,
				d.asrsPartB.concentrationDifficulty,
				d.asrsPartB.misplacingThings,
				d.asrsPartB.distractedByNoise
			];
			return sumScores(scores) >= 20;
		}
	},
	{
		id: 'ASRS-IN-002',
		domain: 'Inattentive',
		description: 'Moderate inattentive symptom frequency (inattentive subscore 14-19)',
		classification: 'possible',
		evaluate: (d) => {
			const scores = [
				d.asrsPartA.focusDifficulty,
				d.asrsPartA.organizationDifficulty,
				d.asrsPartA.rememberingDifficulty,
				d.asrsPartB.carelessMistakes,
				d.asrsPartB.attentionDifficulty,
				d.asrsPartB.concentrationDifficulty,
				d.asrsPartB.misplacingThings,
				d.asrsPartB.distractedByNoise
			];
			const total = sumScores(scores);
			return total >= 14 && total < 20;
		}
	},

	// ─── HYPERACTIVE-IMPULSIVE DOMAIN RULES ──────────────────────
	{
		id: 'ASRS-HI-001',
		domain: 'Hyperactive-Impulsive',
		description: 'High hyperactive-impulsive symptom frequency (Part A Q4-6 + Part B Q12-18 total >= 20)',
		classification: 'likely',
		evaluate: (d) => {
			const scores = [
				d.asrsPartA.avoidingTasks,
				d.asrsPartA.fidgeting,
				d.asrsPartA.overlyActive,
				d.asrsPartB.leavingSeat,
				d.asrsPartB.restlessness,
				d.asrsPartB.difficultyRelaxing,
				d.asrsPartB.talkingTooMuch,
				d.asrsPartB.finishingSentences,
				d.asrsPartB.difficultyWaiting,
				d.asrsPartB.interruptingOthers
			];
			return sumScores(scores) >= 20;
		}
	},
	{
		id: 'ASRS-HI-002',
		domain: 'Hyperactive-Impulsive',
		description: 'Moderate hyperactive-impulsive symptom frequency (hyperactive subscore 14-19)',
		classification: 'possible',
		evaluate: (d) => {
			const scores = [
				d.asrsPartA.avoidingTasks,
				d.asrsPartA.fidgeting,
				d.asrsPartA.overlyActive,
				d.asrsPartB.leavingSeat,
				d.asrsPartB.restlessness,
				d.asrsPartB.difficultyRelaxing,
				d.asrsPartB.talkingTooMuch,
				d.asrsPartB.finishingSentences,
				d.asrsPartB.difficultyWaiting,
				d.asrsPartB.interruptingOthers
			];
			const total = sumScores(scores);
			return total >= 14 && total < 20;
		}
	},

	// ─── TOTAL SCORE RULES ──────────────────────────────────────
	{
		id: 'ASRS-TOT-001',
		domain: 'Total Score',
		description: 'ASRS total score highly elevated (>= 46 of 72)',
		classification: 'highly-likely',
		evaluate: (d) => {
			const partAScores = [
				d.asrsPartA.focusDifficulty,
				d.asrsPartA.organizationDifficulty,
				d.asrsPartA.rememberingDifficulty,
				d.asrsPartA.avoidingTasks,
				d.asrsPartA.fidgeting,
				d.asrsPartA.overlyActive
			];
			const partBScores = [
				d.asrsPartB.carelessMistakes,
				d.asrsPartB.attentionDifficulty,
				d.asrsPartB.concentrationDifficulty,
				d.asrsPartB.misplacingThings,
				d.asrsPartB.distractedByNoise,
				d.asrsPartB.leavingSeat,
				d.asrsPartB.restlessness,
				d.asrsPartB.difficultyRelaxing,
				d.asrsPartB.talkingTooMuch,
				d.asrsPartB.finishingSentences,
				d.asrsPartB.difficultyWaiting,
				d.asrsPartB.interruptingOthers
			];
			return sumScores(partAScores) + sumScores(partBScores) >= 46;
		}
	},
	{
		id: 'ASRS-TOT-002',
		domain: 'Total Score',
		description: 'ASRS total score elevated (28-45 of 72)',
		classification: 'likely',
		evaluate: (d) => {
			const partAScores = [
				d.asrsPartA.focusDifficulty,
				d.asrsPartA.organizationDifficulty,
				d.asrsPartA.rememberingDifficulty,
				d.asrsPartA.avoidingTasks,
				d.asrsPartA.fidgeting,
				d.asrsPartA.overlyActive
			];
			const partBScores = [
				d.asrsPartB.carelessMistakes,
				d.asrsPartB.attentionDifficulty,
				d.asrsPartB.concentrationDifficulty,
				d.asrsPartB.misplacingThings,
				d.asrsPartB.distractedByNoise,
				d.asrsPartB.leavingSeat,
				d.asrsPartB.restlessness,
				d.asrsPartB.difficultyRelaxing,
				d.asrsPartB.talkingTooMuch,
				d.asrsPartB.finishingSentences,
				d.asrsPartB.difficultyWaiting,
				d.asrsPartB.interruptingOthers
			];
			const total = sumScores(partAScores) + sumScores(partBScores);
			return total >= 28 && total < 46;
		}
	},
	{
		id: 'ASRS-TOT-003',
		domain: 'Total Score',
		description: 'ASRS total score mildly elevated (24-27 of 72)',
		classification: 'possible',
		evaluate: (d) => {
			const partAScores = [
				d.asrsPartA.focusDifficulty,
				d.asrsPartA.organizationDifficulty,
				d.asrsPartA.rememberingDifficulty,
				d.asrsPartA.avoidingTasks,
				d.asrsPartA.fidgeting,
				d.asrsPartA.overlyActive
			];
			const partBScores = [
				d.asrsPartB.carelessMistakes,
				d.asrsPartB.attentionDifficulty,
				d.asrsPartB.concentrationDifficulty,
				d.asrsPartB.misplacingThings,
				d.asrsPartB.distractedByNoise,
				d.asrsPartB.leavingSeat,
				d.asrsPartB.restlessness,
				d.asrsPartB.difficultyRelaxing,
				d.asrsPartB.talkingTooMuch,
				d.asrsPartB.finishingSentences,
				d.asrsPartB.difficultyWaiting,
				d.asrsPartB.interruptingOthers
			];
			const total = sumScores(partAScores) + sumScores(partBScores);
			return total >= 24 && total < 28;
		}
	},

	// ─── CHILDHOOD ONSET ─────────────────────────────────────────
	{
		id: 'ASRS-CH-001',
		domain: 'Childhood History',
		description: 'Childhood symptoms confirmed with onset before age 12',
		classification: 'likely',
		evaluate: (d) =>
			d.childhoodHistory.childhoodSymptoms === 'yes' &&
			d.childhoodHistory.onsetBeforeAge12 === 'yes'
	},
	{
		id: 'ASRS-CH-002',
		domain: 'Childhood History',
		description: 'Childhood symptoms present but onset age uncertain',
		classification: 'possible',
		evaluate: (d) =>
			d.childhoodHistory.childhoodSymptoms === 'yes' &&
			d.childhoodHistory.onsetBeforeAge12 !== 'yes'
	},

	// ─── FUNCTIONAL IMPACT ───────────────────────────────────────
	{
		id: 'ASRS-FI-001',
		domain: 'Functional Impact',
		description: 'Severe functional impairment in 2+ domains',
		classification: 'likely',
		evaluate: (d) => {
			const severeDomains = [
				d.functionalImpact.workAcademicImpact,
				d.functionalImpact.relationshipImpact,
				d.functionalImpact.dailyLivingImpact,
				d.functionalImpact.financialManagementImpact,
				d.functionalImpact.timeManagementImpact
			].filter((v) => v === 'severe').length;
			return severeDomains >= 2;
		}
	},
	{
		id: 'ASRS-FI-002',
		domain: 'Functional Impact',
		description: 'Moderate functional impairment in 2+ domains',
		classification: 'possible',
		evaluate: (d) => {
			const moderateOrSevereDomains = [
				d.functionalImpact.workAcademicImpact,
				d.functionalImpact.relationshipImpact,
				d.functionalImpact.dailyLivingImpact,
				d.functionalImpact.financialManagementImpact,
				d.functionalImpact.timeManagementImpact
			].filter((v) => v === 'moderate' || v === 'severe').length;
			return moderateOrSevereDomains >= 2;
		}
	}
];
