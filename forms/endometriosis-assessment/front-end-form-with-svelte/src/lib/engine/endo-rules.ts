import type { EndoRule } from './types';

/**
 * Declarative endometriosis grading rules.
 * Each rule evaluates patient data and returns true if the condition is present.
 * Grade 1 = minimal finding, 2 = mild, 3 = moderate/significant, 4 = severe/critical.
 */
export const endoRules: EndoRule[] = [
	// ─── MENSTRUAL HISTORY ──────────────────────────────────────
	{
		id: 'MH-001',
		category: 'Menstrual',
		description: 'Severe dysmenorrhoea',
		grade: 3,
		evaluate: (d) => d.menstrualHistory.dysmenorrhoeaSeverity === 'severe'
	},
	{
		id: 'MH-002',
		category: 'Menstrual',
		description: 'Moderate dysmenorrhoea',
		grade: 2,
		evaluate: (d) => d.menstrualHistory.dysmenorrhoeaSeverity === 'moderate'
	},
	{
		id: 'MH-003',
		category: 'Menstrual',
		description: 'Very heavy menstrual flow',
		grade: 2,
		evaluate: (d) => d.menstrualHistory.flowHeaviness === 'very-heavy'
	},
	{
		id: 'MH-004',
		category: 'Menstrual',
		description: 'Significant days off work per cycle (>=3)',
		grade: 3,
		evaluate: (d) =>
			d.menstrualHistory.daysOffWorkPerCycle !== null && d.menstrualHistory.daysOffWorkPerCycle >= 3
	},
	{
		id: 'MH-005',
		category: 'Menstrual',
		description: 'Irregular or absent menstrual cycles',
		grade: 1,
		evaluate: (d) =>
			d.menstrualHistory.cycleRegularity === 'irregular' ||
			d.menstrualHistory.cycleRegularity === 'absent'
	},

	// ─── PAIN ASSESSMENT ────────────────────────────────────────
	{
		id: 'PAIN-001',
		category: 'Pain',
		description: 'Severe pelvic pain (VAS 8-10)',
		grade: 4,
		evaluate: (d) =>
			d.painAssessment.hasPelvicPain === 'yes' &&
			d.painAssessment.pelvicPainSeverity !== null &&
			d.painAssessment.pelvicPainSeverity >= 8
	},
	{
		id: 'PAIN-002',
		category: 'Pain',
		description: 'Moderate pelvic pain (VAS 5-7)',
		grade: 2,
		evaluate: (d) =>
			d.painAssessment.hasPelvicPain === 'yes' &&
			d.painAssessment.pelvicPainSeverity !== null &&
			d.painAssessment.pelvicPainSeverity >= 5 &&
			d.painAssessment.pelvicPainSeverity < 8
	},
	{
		id: 'PAIN-003',
		category: 'Pain',
		description: 'Constant pelvic pain',
		grade: 3,
		evaluate: (d) =>
			d.painAssessment.hasPelvicPain === 'yes' && d.painAssessment.pelvicPainTiming === 'constant'
	},
	{
		id: 'PAIN-004',
		category: 'Pain',
		description: 'Deep dyspareunia',
		grade: 3,
		evaluate: (d) =>
			d.painAssessment.dyspareunia === 'deep' || d.painAssessment.dyspareunia === 'both'
	},
	{
		id: 'PAIN-005',
		category: 'Pain',
		description: 'Dyschezia (painful defecation)',
		grade: 2,
		evaluate: (d) => d.painAssessment.dyschezia === 'yes'
	},
	{
		id: 'PAIN-006',
		category: 'Pain',
		description: 'Cyclical dyschezia suggesting bowel endometriosis',
		grade: 3,
		evaluate: (d) =>
			d.painAssessment.dyschezia === 'yes' && d.painAssessment.dyscheziaCyclical === 'yes'
	},

	// ─── GI SYMPTOMS ────────────────────────────────────────────
	{
		id: 'GI-001',
		category: 'Gastrointestinal',
		description: 'Bowel obstruction symptoms',
		grade: 4,
		evaluate: (d) => d.gastrointestinalSymptoms.bowelObstructionSymptoms === 'yes'
	},
	{
		id: 'GI-002',
		category: 'Gastrointestinal',
		description: 'Cyclical rectal bleeding',
		grade: 3,
		evaluate: (d) =>
			d.gastrointestinalSymptoms.rectalBleeding === 'yes' &&
			d.gastrointestinalSymptoms.rectalBleedingCyclical === 'yes'
	},
	{
		id: 'GI-003',
		category: 'Gastrointestinal',
		description: 'Cyclical bloating',
		grade: 1,
		evaluate: (d) =>
			d.gastrointestinalSymptoms.bloating === 'yes' &&
			d.gastrointestinalSymptoms.bloatingCyclical === 'yes'
	},
	{
		id: 'GI-004',
		category: 'Gastrointestinal',
		description: 'Alternating bowel habit',
		grade: 1,
		evaluate: (d) => d.gastrointestinalSymptoms.alternatingBowelHabit === 'yes'
	},

	// ─── URINARY SYMPTOMS ───────────────────────────────────────
	{
		id: 'UR-001',
		category: 'Urinary',
		description: 'Urinary obstruction symptoms',
		grade: 4,
		evaluate: (d) => d.urinarySymptoms.urinaryObstructionSymptoms === 'yes'
	},
	{
		id: 'UR-002',
		category: 'Urinary',
		description: 'Cyclical haematuria suggesting bladder endometriosis',
		grade: 3,
		evaluate: (d) =>
			d.urinarySymptoms.haematuria === 'yes' && d.urinarySymptoms.haematuriaCyclical === 'yes'
	},
	{
		id: 'UR-003',
		category: 'Urinary',
		description: 'Dysuria',
		grade: 1,
		evaluate: (d) => d.urinarySymptoms.dysuria === 'yes'
	},

	// ─── FERTILITY ──────────────────────────────────────────────
	{
		id: 'FERT-001',
		category: 'Fertility',
		description: 'Infertility (trying >12 months)',
		grade: 3,
		evaluate: (d) =>
			d.fertilityAssessment.tryingToConceive === 'yes' &&
			d.fertilityAssessment.durationTryingMonths !== null &&
			d.fertilityAssessment.durationTryingMonths > 12
	},
	{
		id: 'FERT-002',
		category: 'Fertility',
		description: 'History of ectopic pregnancy',
		grade: 3,
		evaluate: (d) =>
			d.fertilityAssessment.ectopicPregnancies !== null &&
			d.fertilityAssessment.ectopicPregnancies > 0
	},
	{
		id: 'FERT-003',
		category: 'Fertility',
		description: 'Low AMH level (<5.4 pmol/L)',
		grade: 3,
		evaluate: (d) =>
			d.fertilityAssessment.amhLevel !== null && d.fertilityAssessment.amhLevel < 5.4
	},
	{
		id: 'FERT-004',
		category: 'Fertility',
		description: 'Future fertility concerns',
		grade: 2,
		evaluate: (d) => d.fertilityAssessment.futureFertilityConcerns === 'yes'
	},

	// ─── SURGICAL HISTORY ───────────────────────────────────────
	{
		id: 'SURG-001',
		category: 'Surgical',
		description: 'ASRM Stage IV at surgery',
		grade: 4,
		evaluate: (d) => d.surgicalHistory.asrmStageAtSurgery === 'IV'
	},
	{
		id: 'SURG-002',
		category: 'Surgical',
		description: 'ASRM Stage III at surgery',
		grade: 3,
		evaluate: (d) => d.surgicalHistory.asrmStageAtSurgery === 'III'
	},
	{
		id: 'SURG-003',
		category: 'Surgical',
		description: 'Previous bowel surgery for endometriosis',
		grade: 3,
		evaluate: (d) => d.surgicalHistory.bowelSurgery === 'yes'
	},
	{
		id: 'SURG-004',
		category: 'Surgical',
		description: 'Previous bladder surgery for endometriosis',
		grade: 3,
		evaluate: (d) => d.surgicalHistory.bladderSurgery === 'yes'
	},
	{
		id: 'SURG-005',
		category: 'Surgical',
		description: 'Multiple laparoscopies (>=3)',
		grade: 2,
		evaluate: (d) =>
			d.surgicalHistory.numberOfLaparoscopies !== null &&
			d.surgicalHistory.numberOfLaparoscopies >= 3
	},
	{
		id: 'SURG-006',
		category: 'Surgical',
		description: 'Endometrioma documented',
		grade: 2,
		evaluate: (d) => d.surgicalHistory.endometriomaDrained === 'yes'
	},

	// ─── PREVIOUS TREATMENTS ────────────────────────────────────
	{
		id: 'TX-001',
		category: 'Treatment',
		description: 'Current opioid use',
		grade: 3,
		evaluate: (d) => d.previousTreatments.opioidsCurrent === 'yes'
	},
	{
		id: 'TX-002',
		category: 'Treatment',
		description: 'Failed multiple hormonal treatments',
		grade: 2,
		evaluate: (d) => {
			let failed = 0;
			if (d.previousTreatments.combinedPillTried === 'yes' && d.previousTreatments.combinedPillEffective === 'ineffective') failed++;
			if (d.previousTreatments.progesteroneTried === 'yes') failed++;
			if (d.previousTreatments.gnrhAgonistTried === 'yes') failed++;
			if (d.previousTreatments.mirenaIusTried === 'yes') failed++;
			return failed >= 2;
		}
	},

	// ─── QUALITY OF LIFE ────────────────────────────────────────
	{
		id: 'QOL-001',
		category: 'Quality of Life',
		description: 'Severe quality of life impact (EHP-30 pain domain >75)',
		grade: 3,
		evaluate: (d) =>
			d.qualityOfLife.painDomainScore !== null && d.qualityOfLife.painDomainScore > 75
	},
	{
		id: 'QOL-002',
		category: 'Quality of Life',
		description: 'Unable to work due to endometriosis',
		grade: 4,
		evaluate: (d) => d.qualityOfLife.workImpact === 'unable-to-work'
	},
	{
		id: 'QOL-003',
		category: 'Quality of Life',
		description: 'Severe mental health impact',
		grade: 3,
		evaluate: (d) => d.qualityOfLife.mentalHealthImpact === 'severe'
	},
	{
		id: 'QOL-004',
		category: 'Quality of Life',
		description: 'Severe sleep impact',
		grade: 2,
		evaluate: (d) => d.qualityOfLife.sleepImpact === 'severe'
	}
];
