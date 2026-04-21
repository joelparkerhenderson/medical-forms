import type { AssessmentData, FiredRule, SymptomDetail } from './types';
import { symptomDomains } from './symptom-rules';
import { mcasCategory } from './utils';

/**
 * Pure function: calculates the MCAS Symptom Score from patient data.
 * Returns the total score (0-40), its category label, the number of
 * organ systems affected, and fired rules for each symptom that
 * contributed to the score.
 *
 * Scoring: Sum of all individual symptom severities across all organ systems.
 *   Each symptom is scored 0-3 (None/Mild/Moderate/Severe).
 *   10 symptoms x 4 max = 40 theoretical maximum (but 20 symptoms at various severities).
 *   Actually: 5 organ systems x 4 symptoms each = 20 symptoms x 0-3 = 0-60 theoretical,
 *   but we cap at 0-40 for clinical relevance by taking max 2 per symptom domain (8 per system).
 *   Simplified: each of the 20 symptoms contributes 0-3, sum capped at 40.
 *
 * MCAS Symptom Score Categories:
 *   0-10  = Minimal symptom burden
 *   11-20 = Mild symptom burden
 *   21-30 = Moderate symptom burden
 *   31-40 = Severe symptom burden
 */
export function calculateMCASScore(data: AssessmentData): {
	symptomScore: number;
	mcasCategoryLabel: string;
	organSystemsAffected: number;
	firedRules: FiredRule[];
} {
	const firedRules: FiredRule[] = [];
	let totalScore = 0;
	let systemsAffected = 0;

	// ─── Dermatological ─────────────────────────────────
	const dermSymptoms: [string, SymptomDetail][] = [
		['Flushing', data.dermatologicalSymptoms.flushing],
		['Urticaria', data.dermatologicalSymptoms.urticaria],
		['Angioedema', data.dermatologicalSymptoms.angioedema],
		['Pruritus', data.dermatologicalSymptoms.pruritus]
	];
	const dermScore = scoreOrganSystem('MCAS-DERM', 'Dermatological', dermSymptoms, firedRules);
	totalScore += dermScore;
	if (dermScore > 0) systemsAffected++;

	// ─── Gastrointestinal ───────────────────────────────
	const giSymptoms: [string, SymptomDetail][] = [
		['Abdominal Pain', data.gastrointestinalSymptoms.abdominalPain],
		['Nausea', data.gastrointestinalSymptoms.nausea],
		['Diarrhea', data.gastrointestinalSymptoms.diarrhea],
		['Bloating', data.gastrointestinalSymptoms.bloating]
	];
	const giScore = scoreOrganSystem('MCAS-GI', 'Gastrointestinal', giSymptoms, firedRules);
	totalScore += giScore;
	if (giScore > 0) systemsAffected++;

	// ─── Cardiovascular ─────────────────────────────────
	const cvSymptoms: [string, SymptomDetail][] = [
		['Tachycardia', data.cardiovascularSymptoms.tachycardia],
		['Hypotension', data.cardiovascularSymptoms.hypotension],
		['Presyncope', data.cardiovascularSymptoms.presyncope],
		['Syncope', data.cardiovascularSymptoms.syncope]
	];
	const cvScore = scoreOrganSystem('MCAS-CV', 'Cardiovascular', cvSymptoms, firedRules);
	totalScore += cvScore;
	if (cvScore > 0) systemsAffected++;

	// ─── Respiratory ────────────────────────────────────
	const respSymptoms: [string, SymptomDetail][] = [
		['Wheezing', data.respiratorySymptoms.wheezing],
		['Dyspnea', data.respiratorySymptoms.dyspnea],
		['Nasal Congestion', data.respiratorySymptoms.nasalCongestion],
		['Throat Tightening', data.respiratorySymptoms.throatTightening]
	];
	const respScore = scoreOrganSystem('MCAS-RESP', 'Respiratory', respSymptoms, firedRules);
	totalScore += respScore;
	if (respScore > 0) systemsAffected++;

	// ─── Neurological ───────────────────────────────────
	const neuroSymptoms: [string, SymptomDetail][] = [
		['Headache', data.neurologicalSymptoms.headache],
		['Brain Fog', data.neurologicalSymptoms.brainFog],
		['Dizziness', data.neurologicalSymptoms.dizziness],
		['Fatigue', data.neurologicalSymptoms.fatigue]
	];
	const neuroScore = scoreOrganSystem('MCAS-NEURO', 'Neurological', neuroSymptoms, firedRules);
	totalScore += neuroScore;
	if (neuroScore > 0) systemsAffected++;

	// Cap score at 40
	const symptomScore = Math.min(totalScore, 40);
	const mcasCategoryLabel = mcasCategory(symptomScore);

	return { symptomScore, mcasCategoryLabel, organSystemsAffected: systemsAffected, firedRules };
}

function scoreOrganSystem(
	domainId: string,
	domainName: string,
	symptoms: [string, SymptomDetail][],
	firedRules: FiredRule[]
): number {
	let domainScore = 0;

	for (const [name, symptom] of symptoms) {
		const severity = symptom.severity;
		if (severity !== null && severity > 0) {
			firedRules.push({
				id: `${domainId}-${name.replace(/\s+/g, '-').toUpperCase()}`,
				domain: domainName,
				description: `${name}: severity ${severity}/3, frequency ${symptom.frequency || 'not specified'}`,
				score: severity
			});
			domainScore += severity;
		}
	}

	return domainScore;
}
