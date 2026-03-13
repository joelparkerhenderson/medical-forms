import type { DMFTRule } from './types';

/**
 * Declarative DMFT grading rules.
 * Each rule evaluates patient data and returns true if the condition is present.
 * The DMFT score is the sum of Decayed + Missing + Filled teeth (0-32).
 * The category is determined by the score range.
 */
export const dmftRules: DMFTRule[] = [
	// ─── DMFT SCORE CATEGORIES ──────────────────────────────
	{
		id: 'DMFT-001',
		system: 'DMFT',
		description: 'Caries-free (DMFT = 0)',
		category: 'caries-free',
		evaluate: (d) => {
			const score = getDMFTScore(d.dmftAssessment.decayedTeeth, d.dmftAssessment.missingTeeth, d.dmftAssessment.filledTeeth);
			return score === 0;
		}
	},
	{
		id: 'DMFT-002',
		system: 'DMFT',
		description: 'Very low caries experience (DMFT 1-5)',
		category: 'very-low',
		evaluate: (d) => {
			const score = getDMFTScore(d.dmftAssessment.decayedTeeth, d.dmftAssessment.missingTeeth, d.dmftAssessment.filledTeeth);
			return score >= 1 && score <= 5;
		}
	},
	{
		id: 'DMFT-003',
		system: 'DMFT',
		description: 'Low caries experience (DMFT 6-10)',
		category: 'low',
		evaluate: (d) => {
			const score = getDMFTScore(d.dmftAssessment.decayedTeeth, d.dmftAssessment.missingTeeth, d.dmftAssessment.filledTeeth);
			return score >= 6 && score <= 10;
		}
	},
	{
		id: 'DMFT-004',
		system: 'DMFT',
		description: 'Moderate caries experience (DMFT 11-15)',
		category: 'moderate',
		evaluate: (d) => {
			const score = getDMFTScore(d.dmftAssessment.decayedTeeth, d.dmftAssessment.missingTeeth, d.dmftAssessment.filledTeeth);
			return score >= 11 && score <= 15;
		}
	},
	{
		id: 'DMFT-005',
		system: 'DMFT',
		description: 'High caries experience (DMFT 16-20)',
		category: 'high',
		evaluate: (d) => {
			const score = getDMFTScore(d.dmftAssessment.decayedTeeth, d.dmftAssessment.missingTeeth, d.dmftAssessment.filledTeeth);
			return score >= 16 && score <= 20;
		}
	},
	{
		id: 'DMFT-006',
		system: 'DMFT',
		description: 'Very high caries experience (DMFT 21+)',
		category: 'very-high',
		evaluate: (d) => {
			const score = getDMFTScore(d.dmftAssessment.decayedTeeth, d.dmftAssessment.missingTeeth, d.dmftAssessment.filledTeeth);
			return score >= 21;
		}
	},

	// ─── PERIODONTAL ────────────────────────────────────────
	{
		id: 'PERIO-001',
		system: 'Periodontal',
		description: 'Gum bleeding present',
		category: 'low',
		evaluate: (d) => d.periodontalAssessment.gumBleeding === 'yes'
	},
	{
		id: 'PERIO-002',
		system: 'Periodontal',
		description: 'Elevated pocket depths',
		category: 'moderate',
		evaluate: (d) => d.periodontalAssessment.pocketDepthsAboveNormal === 'yes'
	},
	{
		id: 'PERIO-003',
		system: 'Periodontal',
		description: 'Gum recession present',
		category: 'moderate',
		evaluate: (d) => d.periodontalAssessment.gumRecession === 'yes'
	},
	{
		id: 'PERIO-004',
		system: 'Periodontal',
		description: 'Tooth mobility',
		category: 'high',
		evaluate: (d) => d.periodontalAssessment.toothMobility === 'yes'
	},
	{
		id: 'PERIO-005',
		system: 'Periodontal',
		description: 'Furcation involvement',
		category: 'high',
		evaluate: (d) => d.periodontalAssessment.furcationInvolvement === 'yes'
	},

	// ─── ORAL HYGIENE ───────────────────────────────────────
	{
		id: 'OH-001',
		system: 'Oral Hygiene',
		description: 'Poor oral hygiene',
		category: 'moderate',
		evaluate: (d) => d.oralExamination.oralHygieneIndex === 'poor'
	},

	// ─── TMJ ────────────────────────────────────────────────
	{
		id: 'TMJ-001',
		system: 'TMJ',
		description: 'TMJ pain reported',
		category: 'low',
		evaluate: (d) => d.oralExamination.tmjPain === 'yes'
	},
	{
		id: 'TMJ-002',
		system: 'TMJ',
		description: 'Limited jaw opening',
		category: 'moderate',
		evaluate: (d) => d.oralExamination.tmjLimitedOpening === 'yes'
	},

	// ─── RADIOGRAPHIC ───────────────────────────────────────
	{
		id: 'RAD-001',
		system: 'Radiographic',
		description: 'Bone loss detected',
		category: 'moderate',
		evaluate: (d) => d.radiographicFindings.boneLossPattern !== 'none' && d.radiographicFindings.boneLossPattern !== ''
	},

	// ─── MEDICAL RISK FACTORS ───────────────────────────────
	{
		id: 'MED-001',
		system: 'Medical',
		description: 'Poorly controlled diabetes',
		category: 'moderate',
		evaluate: (d) => d.medicalHistory.diabetes === 'yes' && d.medicalHistory.diabetesControlled === 'no'
	},
	{
		id: 'MED-002',
		system: 'Medical',
		description: 'Immunosuppressed patient',
		category: 'high',
		evaluate: (d) => d.medicalHistory.immunosuppression === 'yes'
	},
	{
		id: 'MED-003',
		system: 'Medical',
		description: 'History of head/neck radiation',
		category: 'high',
		evaluate: (d) => d.medicalHistory.radiationTherapyHeadNeck === 'yes'
	},
];

/** Helper to calculate DMFT score from component counts. */
function getDMFTScore(
	decayed: number | null,
	missing: number | null,
	filled: number | null
): number {
	return (decayed ?? 0) + (missing ?? 0) + (filled ?? 0);
}
