import type { CFSRule } from './types';
import { calculateAge, countDependentADLs, countADLsNeedingHelp, countIADLsNeedingHelp } from './utils';

/**
 * Declarative Clinical Frailty Scale (CFS) classification rules.
 * Each rule evaluates patient data and returns true if the condition is present.
 * The CFS score is determined by the highest-score rule that fires.
 * CFS 1 is the default when no rules fire (very fit patient).
 */
export const cfsRules: CFSRule[] = [
	// ─── CFS 2 - WELL ───────────────────────────────────────
	{
		id: 'CFS-001',
		domain: 'Functional',
		description: 'All ADLs independent but some IADLs need assistance',
		score: 2,
		evaluate: (d) => {
			const adlHelp = countADLsNeedingHelp(d.functionalAssessment);
			const iadlHelp = countIADLsNeedingHelp(d.functionalAssessment);
			return adlHelp === 0 && iadlHelp >= 1 && iadlHelp <= 2;
		}
	},
	{
		id: 'CFS-002',
		domain: 'Demographics',
		description: 'Age ≥75 years with controlled chronic conditions',
		score: 2,
		evaluate: (d) => {
			const age = calculateAge(d.demographics.dateOfBirth);
			return age !== null && age >= 75 && d.comorbidities.cardiovascularDisease !== 'yes' && d.comorbidities.diabetes !== 'yes';
		}
	},

	// ─── CFS 3 - MANAGING WELL ──────────────────────────────
	{
		id: 'CFS-003',
		domain: 'Functional',
		description: 'ADLs independent but multiple IADLs need assistance',
		score: 3,
		evaluate: (d) => {
			const adlHelp = countADLsNeedingHelp(d.functionalAssessment);
			const iadlHelp = countIADLsNeedingHelp(d.functionalAssessment);
			return adlHelp === 0 && iadlHelp >= 3;
		}
	},
	{
		id: 'CFS-004',
		domain: 'Mobility',
		description: 'Uses mobility aids but gait is stable',
		score: 3,
		evaluate: (d) =>
			d.mobilityFalls.mobilityAids === 'yes' && d.mobilityFalls.gaitAssessment === 'normal'
	},
	{
		id: 'CFS-005',
		domain: 'Comorbidities',
		description: 'Well-controlled diabetes',
		score: 3,
		evaluate: (d) =>
			d.comorbidities.diabetes === 'yes' && d.comorbidities.diabetesControl === 'well-controlled'
	},

	// ─── CFS 4 - VULNERABLE ─────────────────────────────────
	{
		id: 'CFS-006',
		domain: 'Functional',
		description: '1-2 ADLs need assistance',
		score: 4,
		evaluate: (d) => {
			const adlHelp = countADLsNeedingHelp(d.functionalAssessment);
			return adlHelp >= 1 && adlHelp <= 2 && countDependentADLs(d.functionalAssessment) === 0;
		}
	},
	{
		id: 'CFS-007',
		domain: 'Mobility',
		description: 'Unsteady gait without recent falls',
		score: 4,
		evaluate: (d) =>
			d.mobilityFalls.gaitAssessment === 'unsteady' && d.mobilityFalls.fallHistory !== 'yes'
	},
	{
		id: 'CFS-008',
		domain: 'Cognition',
		description: 'Mild cognitive impairment',
		score: 4,
		evaluate: (d) => d.cognitiveScreen.cognitiveStatus === 'mild-impairment'
	},
	{
		id: 'CFS-009',
		domain: 'Nutrition',
		description: 'Reduced appetite with mild weight loss',
		score: 4,
		evaluate: (d) =>
			d.nutrition.appetite === 'reduced' &&
			d.nutrition.weightChangeLastSixMonths === 'yes' &&
			d.nutrition.weightChangeDirection === 'loss'
	},

	// ─── CFS 5 - MILDLY FRAIL ──────────────────────────────
	{
		id: 'CFS-010',
		domain: 'Functional',
		description: '3+ ADLs need assistance or 1 ADL dependent',
		score: 5,
		evaluate: (d) => {
			const adlHelp = countADLsNeedingHelp(d.functionalAssessment);
			const dependent = countDependentADLs(d.functionalAssessment);
			return (adlHelp >= 3 && dependent === 0) || (dependent >= 1 && dependent <= 2);
		}
	},
	{
		id: 'CFS-011',
		domain: 'Mobility',
		description: 'Unsteady gait with fall history',
		score: 5,
		evaluate: (d) =>
			d.mobilityFalls.gaitAssessment === 'unsteady' && d.mobilityFalls.fallHistory === 'yes'
	},
	{
		id: 'CFS-012',
		domain: 'Mobility',
		description: 'Timed Up and Go ≥14 seconds',
		score: 5,
		evaluate: (d) =>
			d.mobilityFalls.timedUpAndGo !== null && d.mobilityFalls.timedUpAndGo >= 14
	},
	{
		id: 'CFS-013',
		domain: 'Cognition',
		description: 'Moderate cognitive impairment',
		score: 5,
		evaluate: (d) => d.cognitiveScreen.cognitiveStatus === 'moderate-impairment'
	},
	{
		id: 'CFS-014',
		domain: 'Polypharmacy',
		description: 'Taking ≥10 medications (polypharmacy)',
		score: 5,
		evaluate: (d) =>
			d.polypharmacyReview.numberOfMedications !== null &&
			d.polypharmacyReview.numberOfMedications >= 10
	},
	{
		id: 'CFS-015',
		domain: 'Nutrition',
		description: 'Poor appetite or MNA score indicating malnutrition risk',
		score: 5,
		evaluate: (d) =>
			d.nutrition.appetite === 'poor' ||
			(d.nutrition.mnaScore !== null && d.nutrition.mnaScore < 17)
	},

	// ─── CFS 6 - MODERATELY FRAIL ──────────────────────────
	{
		id: 'CFS-016',
		domain: 'Functional',
		description: '3+ ADLs dependent',
		score: 6,
		evaluate: (d) => {
			const dependent = countDependentADLs(d.functionalAssessment);
			return dependent >= 3 && dependent <= 4;
		}
	},
	{
		id: 'CFS-017',
		domain: 'Mobility',
		description: 'Unable to walk independently with severe balance impairment',
		score: 6,
		evaluate: (d) =>
			d.mobilityFalls.gaitAssessment === 'unable' ||
			d.mobilityFalls.balanceAssessment === 'severely-impaired'
	},
	{
		id: 'CFS-018',
		domain: 'Mobility',
		description: 'Multiple falls (≥3) in the past year',
		score: 6,
		evaluate: (d) =>
			d.mobilityFalls.fallHistory === 'yes' &&
			d.mobilityFalls.fallsLastYear !== null &&
			d.mobilityFalls.fallsLastYear >= 3
	},
	{
		id: 'CFS-019',
		domain: 'Comorbidities',
		description: 'Poorly controlled diabetes with comorbidities',
		score: 6,
		evaluate: (d) =>
			d.comorbidities.diabetes === 'yes' &&
			d.comorbidities.diabetesControl === 'poorly-controlled' &&
			(d.comorbidities.cardiovascularDisease === 'yes' || d.comorbidities.renalDisease === 'yes')
	},
	{
		id: 'CFS-020',
		domain: 'Psychosocial',
		description: 'Moderate to severe depression',
		score: 6,
		evaluate: (d) =>
			d.psychosocial.depressionScreen === 'moderate' ||
			d.psychosocial.depressionScreen === 'severe'
	},

	// ─── CFS 7 - SEVERELY FRAIL ─────────────────────────────
	{
		id: 'CFS-021',
		domain: 'Functional',
		description: 'All 5 ADLs dependent',
		score: 7,
		evaluate: (d) => countDependentADLs(d.functionalAssessment) === 5
	},
	{
		id: 'CFS-022',
		domain: 'Cognition',
		description: 'Severe cognitive impairment',
		score: 7,
		evaluate: (d) => d.cognitiveScreen.cognitiveStatus === 'severe-impairment'
	},
	{
		id: 'CFS-023',
		domain: 'Cognition',
		description: 'MMSE score <10 indicating severe dementia',
		score: 7,
		evaluate: (d) =>
			d.cognitiveScreen.mmseScore !== null && d.cognitiveScreen.mmseScore < 10
	},
	{
		id: 'CFS-024',
		domain: 'Continence',
		description: 'Continuous urinary and faecal incontinence',
		score: 7,
		evaluate: (d) =>
			d.continenceSkin.urinaryIncontinenceFrequency === 'continuous' &&
			d.continenceSkin.faecalIncontinence === 'yes' &&
			d.continenceSkin.faecalIncontinenceFrequency === 'continuous'
	},

	// ─── CFS 8 - VERY SEVERELY FRAIL ────────────────────────
	{
		id: 'CFS-025',
		domain: 'Functional',
		description: 'Completely dependent with severe cognitive impairment and bedbound',
		score: 8,
		evaluate: (d) =>
			countDependentADLs(d.functionalAssessment) === 5 &&
			d.cognitiveScreen.cognitiveStatus === 'severe-impairment' &&
			d.mobilityFalls.gaitAssessment === 'unable'
	},
	{
		id: 'CFS-026',
		domain: 'Skin',
		description: 'Advanced pressure injuries (Stage 3-4)',
		score: 8,
		evaluate: (d) =>
			d.continenceSkin.pressureInjuryPresent === 'yes' &&
			(d.continenceSkin.pressureInjuryStage === '3' || d.continenceSkin.pressureInjuryStage === '4')
	},

	// ─── CFS 9 - TERMINALLY ILL ─────────────────────────────
	// Note: CFS 9 is typically assigned clinically, but we flag conditions
	// consistent with end-of-life presentation
	{
		id: 'CFS-027',
		domain: 'Nutrition',
		description: 'Severe malnutrition with weight loss and inability to eat',
		score: 9,
		evaluate: (d) =>
			d.nutrition.appetite === 'poor' &&
			d.nutrition.swallowingDifficulties === 'yes' &&
			d.nutrition.weightChangeLastSixMonths === 'yes' &&
			d.nutrition.weightChangeDirection === 'loss' &&
			d.nutrition.weightChangeKg !== null &&
			d.nutrition.weightChangeKg >= 10 &&
			countDependentADLs(d.functionalAssessment) === 5
	},

	// ─── ADDITIONAL CLASSIFICATION RULES ────────────────────
	{
		id: 'CFS-028',
		domain: 'Polypharmacy',
		description: 'Beers criteria flags with high-risk medications',
		score: 5,
		evaluate: (d) =>
			d.polypharmacyReview.beersCriteriaFlags === 'yes' &&
			d.polypharmacyReview.highRiskMedications === 'yes'
	},
	{
		id: 'CFS-029',
		domain: 'Cognition',
		description: 'Delirium risk with cognitive impairment',
		score: 6,
		evaluate: (d) =>
			d.cognitiveScreen.deliriumRisk === 'yes' &&
			(d.cognitiveScreen.cognitiveStatus === 'moderate-impairment' ||
				d.cognitiveScreen.cognitiveStatus === 'severe-impairment')
	},
	{
		id: 'CFS-030',
		domain: 'Skin',
		description: 'Braden scale score ≤12 (high pressure injury risk)',
		score: 6,
		evaluate: (d) =>
			d.continenceSkin.bradenScale !== null && d.continenceSkin.bradenScale <= 12
	}
];
