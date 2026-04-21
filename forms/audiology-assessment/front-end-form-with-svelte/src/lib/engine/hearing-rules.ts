import type { HearingRule } from './types';
import { classifyDbHL } from './utils';

/**
 * Declarative hearing grading rules based on WHO Classification.
 * Each rule evaluates patient data and returns true if the condition is present.
 * The hearing grade is determined by the highest-grade rule that fires.
 * Normal hearing is the default when no rules fire.
 */
export const hearingRules: HearingRule[] = [
	// ─── PURE TONE AVERAGE - RIGHT EAR ──────────────────────
	{
		id: 'PTA-R-001',
		system: 'Audiometric',
		description: 'Right ear mild hearing loss (PTA 26-40 dB HL)',
		grade: 'mild',
		evaluate: (d) => classifyDbHL(d.audiometricResults.pureToneAverageRight) === 'mild'
	},
	{
		id: 'PTA-R-002',
		system: 'Audiometric',
		description: 'Right ear moderate hearing loss (PTA 41-60 dB HL)',
		grade: 'moderate',
		evaluate: (d) => classifyDbHL(d.audiometricResults.pureToneAverageRight) === 'moderate'
	},
	{
		id: 'PTA-R-003',
		system: 'Audiometric',
		description: 'Right ear severe hearing loss (PTA 61-80 dB HL)',
		grade: 'severe',
		evaluate: (d) => classifyDbHL(d.audiometricResults.pureToneAverageRight) === 'severe'
	},
	{
		id: 'PTA-R-004',
		system: 'Audiometric',
		description: 'Right ear profound hearing loss (PTA >80 dB HL)',
		grade: 'profound',
		evaluate: (d) => classifyDbHL(d.audiometricResults.pureToneAverageRight) === 'profound'
	},

	// ─── PURE TONE AVERAGE - LEFT EAR ───────────────────────
	{
		id: 'PTA-L-001',
		system: 'Audiometric',
		description: 'Left ear mild hearing loss (PTA 26-40 dB HL)',
		grade: 'mild',
		evaluate: (d) => classifyDbHL(d.audiometricResults.pureToneAverageLeft) === 'mild'
	},
	{
		id: 'PTA-L-002',
		system: 'Audiometric',
		description: 'Left ear moderate hearing loss (PTA 41-60 dB HL)',
		grade: 'moderate',
		evaluate: (d) => classifyDbHL(d.audiometricResults.pureToneAverageLeft) === 'moderate'
	},
	{
		id: 'PTA-L-003',
		system: 'Audiometric',
		description: 'Left ear severe hearing loss (PTA 61-80 dB HL)',
		grade: 'severe',
		evaluate: (d) => classifyDbHL(d.audiometricResults.pureToneAverageLeft) === 'severe'
	},
	{
		id: 'PTA-L-004',
		system: 'Audiometric',
		description: 'Left ear profound hearing loss (PTA >80 dB HL)',
		grade: 'profound',
		evaluate: (d) => classifyDbHL(d.audiometricResults.pureToneAverageLeft) === 'profound'
	},

	// ─── WORD RECOGNITION ───────────────────────────────────
	{
		id: 'WR-001',
		system: 'Speech Audiometry',
		description: 'Poor word recognition score right ear (<50%)',
		grade: 'severe',
		evaluate: (d) =>
			d.audiometricResults.wordRecognitionScoreRight !== null &&
			d.audiometricResults.wordRecognitionScoreRight < 50
	},
	{
		id: 'WR-002',
		system: 'Speech Audiometry',
		description: 'Poor word recognition score left ear (<50%)',
		grade: 'severe',
		evaluate: (d) =>
			d.audiometricResults.wordRecognitionScoreLeft !== null &&
			d.audiometricResults.wordRecognitionScoreLeft < 50
	},
	{
		id: 'WR-003',
		system: 'Speech Audiometry',
		description: 'Reduced word recognition score right ear (50-80%)',
		grade: 'moderate',
		evaluate: (d) =>
			d.audiometricResults.wordRecognitionScoreRight !== null &&
			d.audiometricResults.wordRecognitionScoreRight >= 50 &&
			d.audiometricResults.wordRecognitionScoreRight <= 80
	},
	{
		id: 'WR-004',
		system: 'Speech Audiometry',
		description: 'Reduced word recognition score left ear (50-80%)',
		grade: 'moderate',
		evaluate: (d) =>
			d.audiometricResults.wordRecognitionScoreLeft !== null &&
			d.audiometricResults.wordRecognitionScoreLeft >= 50 &&
			d.audiometricResults.wordRecognitionScoreLeft <= 80
	},

	// ─── CONDUCTIVE COMPONENT ───────────────────────────────
	{
		id: 'ABG-001',
		system: 'Audiometric',
		description: 'Significant air-bone gap right ear (>10 dB) indicating conductive component',
		grade: 'mild',
		evaluate: (d) =>
			d.audiometricResults.airBoneGapRight !== null &&
			d.audiometricResults.airBoneGapRight > 10
	},
	{
		id: 'ABG-002',
		system: 'Audiometric',
		description: 'Significant air-bone gap left ear (>10 dB) indicating conductive component',
		grade: 'mild',
		evaluate: (d) =>
			d.audiometricResults.airBoneGapLeft !== null &&
			d.audiometricResults.airBoneGapLeft > 10
	},

	// ─── TINNITUS SEVERITY ──────────────────────────────────
	{
		id: 'TIN-001',
		system: 'Tinnitus',
		description: 'Severe tinnitus handicap (THI >56)',
		grade: 'moderate',
		evaluate: (d) =>
			d.tinnitusAssessment.presence === 'yes' &&
			d.tinnitusAssessment.tinnitusHandicapInventoryScore !== null &&
			d.tinnitusAssessment.tinnitusHandicapInventoryScore > 56
	},
	{
		id: 'TIN-002',
		system: 'Tinnitus',
		description: 'Moderate tinnitus handicap (THI 37-56)',
		grade: 'mild',
		evaluate: (d) =>
			d.tinnitusAssessment.presence === 'yes' &&
			d.tinnitusAssessment.tinnitusHandicapInventoryScore !== null &&
			d.tinnitusAssessment.tinnitusHandicapInventoryScore >= 37 &&
			d.tinnitusAssessment.tinnitusHandicapInventoryScore <= 56
	},

	// ─── VESTIBULAR ─────────────────────────────────────────
	{
		id: 'VEST-001',
		system: 'Vestibular',
		description: 'Vertigo with positive Dix-Hallpike',
		grade: 'moderate',
		evaluate: (d) =>
			d.vestibularSymptoms.vertigo === 'yes' &&
			d.vestibularSymptoms.dixHallpike === 'yes'
	},
	{
		id: 'VEST-002',
		system: 'Vestibular',
		description: 'Falls history with balance problems',
		grade: 'moderate',
		evaluate: (d) =>
			d.vestibularSymptoms.fallsHistory === 'yes' &&
			d.vestibularSymptoms.balanceProblems === 'yes'
	},

	// ─── MEDICAL CONDITIONS ─────────────────────────────────
	{
		id: 'MED-001',
		system: 'Medical',
		description: 'Meniere\'s disease',
		grade: 'moderate',
		evaluate: (d) => d.medicalHistory.menieres === 'yes'
	},
	{
		id: 'MED-002',
		system: 'Medical',
		description: 'Acoustic neuroma',
		grade: 'severe',
		evaluate: (d) => d.medicalHistory.acousticNeuroma === 'yes'
	},
	{
		id: 'MED-003',
		system: 'Medical',
		description: 'Otosclerosis',
		grade: 'moderate',
		evaluate: (d) => d.medicalHistory.otosclerosis === 'yes'
	},

	// ─── FUNCTIONAL IMPACT ──────────────────────────────────
	{
		id: 'FUNC-001',
		system: 'Functional',
		description: 'Severe HHIE score (>42)',
		grade: 'moderate',
		evaluate: (d) =>
			d.functionalCommunication.hhieScore !== null &&
			d.functionalCommunication.hhieScore > 42
	},
	{
		id: 'FUNC-002',
		system: 'Functional',
		description: 'Severe work impact',
		grade: 'moderate',
		evaluate: (d) => d.functionalCommunication.workImpact === 'severe'
	}
];
