import type { ECOGRule } from './types';

/**
 * Declarative ECOG Performance Status rules.
 * Each rule evaluates patient data and returns true if the condition is present.
 * The ECOG grade is determined by the highest-grade rule that fires.
 * ECOG 0 is the default when no rules fire (fully active patient).
 */
export const ecogRules: ECOGRule[] = [
	// ─── DEMOGRAPHICS / PERFORMANCE STATUS ──────────────────
	{
		id: 'PS-001',
		system: 'Performance Status',
		description: 'Self-reported ECOG 1 - restricted strenuous activity',
		grade: 1,
		evaluate: (d) => d.demographics.ecogPerformanceStatus === '1'
	},
	{
		id: 'PS-002',
		system: 'Performance Status',
		description: 'Self-reported ECOG 2 - ambulatory, capable of self-care',
		grade: 2,
		evaluate: (d) => d.demographics.ecogPerformanceStatus === '2'
	},
	{
		id: 'PS-003',
		system: 'Performance Status',
		description: 'Self-reported ECOG 3 - limited self-care, confined >50%',
		grade: 3,
		evaluate: (d) => d.demographics.ecogPerformanceStatus === '3'
	},
	{
		id: 'PS-004',
		system: 'Performance Status',
		description: 'Self-reported ECOG 4 - completely disabled',
		grade: 4,
		evaluate: (d) => d.demographics.ecogPerformanceStatus === '4'
	},

	// ─── CANCER STAGE ───────────────────────────────────────
	{
		id: 'STG-001',
		system: 'Cancer Stage',
		description: 'Stage III cancer',
		grade: 2,
		evaluate: (d) => d.cancerDiagnosis.overallStage === 'III'
	},
	{
		id: 'STG-002',
		system: 'Cancer Stage',
		description: 'Stage IV (metastatic) cancer',
		grade: 3,
		evaluate: (d) => d.cancerDiagnosis.overallStage === 'IV'
	},
	{
		id: 'STG-003',
		system: 'Cancer Stage',
		description: 'Distant metastases present (M1)',
		grade: 3,
		evaluate: (d) => d.cancerDiagnosis.stageM === '1'
	},

	// ─── TREATMENT RESPONSE ─────────────────────────────────
	{
		id: 'TX-001',
		system: 'Treatment',
		description: 'Progressive disease on current treatment',
		grade: 2,
		evaluate: (d) => d.currentTreatment.responseAssessment === 'progressive-disease'
	},

	// ─── SYMPTOM BURDEN ─────────────────────────────────────
	{
		id: 'SX-001',
		system: 'Symptoms',
		description: 'Moderate pain (NRS 4-6)',
		grade: 1,
		evaluate: (d) =>
			d.symptomAssessment.painNRS !== null &&
			d.symptomAssessment.painNRS >= 4 &&
			d.symptomAssessment.painNRS <= 6
	},
	{
		id: 'SX-002',
		system: 'Symptoms',
		description: 'Severe pain (NRS 7-10)',
		grade: 2,
		evaluate: (d) =>
			d.symptomAssessment.painNRS !== null && d.symptomAssessment.painNRS >= 7
	},
	{
		id: 'SX-003',
		system: 'Symptoms',
		description: 'Severe fatigue',
		grade: 2,
		evaluate: (d) => d.symptomAssessment.fatigue === 'severe'
	},
	{
		id: 'SX-004',
		system: 'Symptoms',
		description: 'Moderate fatigue',
		grade: 1,
		evaluate: (d) => d.symptomAssessment.fatigue === 'moderate'
	},
	{
		id: 'SX-005',
		system: 'Symptoms',
		description: 'Severe nausea',
		grade: 2,
		evaluate: (d) => d.symptomAssessment.nausea === 'severe'
	},
	{
		id: 'SX-006',
		system: 'Symptoms',
		description: 'Severely decreased appetite',
		grade: 2,
		evaluate: (d) => d.symptomAssessment.appetite === 'severely-decreased'
	},
	{
		id: 'SX-007',
		system: 'Symptoms',
		description: 'Significant weight loss (>10%)',
		grade: 3,
		evaluate: (d) => d.symptomAssessment.weightChange === 'losing-more-10'
	},
	{
		id: 'SX-008',
		system: 'Symptoms',
		description: 'Moderate weight loss (5-10%)',
		grade: 2,
		evaluate: (d) => d.symptomAssessment.weightChange === 'losing-5-10'
	},
	{
		id: 'SX-009',
		system: 'Symptoms',
		description: 'High ESAS score (>60)',
		grade: 2,
		evaluate: (d) =>
			d.symptomAssessment.esasScore !== null && d.symptomAssessment.esasScore > 60
	},

	// ─── SIDE EFFECTS ───────────────────────────────────────
	{
		id: 'SE-001',
		system: 'Side Effects',
		description: 'CTCAE Grade 3 neuropathy',
		grade: 2,
		evaluate: (d) => d.sideEffects.neuropathy === '3'
	},
	{
		id: 'SE-002',
		system: 'Side Effects',
		description: 'CTCAE Grade 4 neuropathy',
		grade: 3,
		evaluate: (d) => d.sideEffects.neuropathy === '4'
	},
	{
		id: 'SE-003',
		system: 'Side Effects',
		description: 'CTCAE Grade 3 mucositis',
		grade: 2,
		evaluate: (d) => d.sideEffects.mucositis === '3'
	},
	{
		id: 'SE-004',
		system: 'Side Effects',
		description: 'CTCAE Grade 4 mucositis',
		grade: 3,
		evaluate: (d) => d.sideEffects.mucositis === '4'
	},
	{
		id: 'SE-005',
		system: 'Side Effects',
		description: 'CTCAE Grade 3-4 organ toxicity',
		grade: 3,
		evaluate: (d) =>
			d.sideEffects.organToxicityGrade === '3' || d.sideEffects.organToxicityGrade === '4'
	},
	{
		id: 'SE-006',
		system: 'Side Effects',
		description: 'Neutropenia present',
		grade: 2,
		evaluate: (d) => d.sideEffects.neutropenia === 'yes'
	},
	{
		id: 'SE-007',
		system: 'Side Effects',
		description: 'Thrombocytopenia present',
		grade: 2,
		evaluate: (d) => d.sideEffects.thrombocytopenia === 'yes'
	},
	{
		id: 'SE-008',
		system: 'Side Effects',
		description: 'Anaemia present',
		grade: 1,
		evaluate: (d) => d.sideEffects.anaemia === 'yes'
	},

	// ─── LABORATORY ─────────────────────────────────────────
	{
		id: 'LAB-001',
		system: 'Laboratory',
		description: 'Severe neutropenia (ANC <0.5)',
		grade: 3,
		evaluate: (d) =>
			d.laboratoryResults.neutrophils !== null && d.laboratoryResults.neutrophils < 0.5
	},
	{
		id: 'LAB-002',
		system: 'Laboratory',
		description: 'Moderate neutropenia (ANC 0.5-1.0)',
		grade: 2,
		evaluate: (d) =>
			d.laboratoryResults.neutrophils !== null &&
			d.laboratoryResults.neutrophils >= 0.5 &&
			d.laboratoryResults.neutrophils < 1.0
	},
	{
		id: 'LAB-003',
		system: 'Laboratory',
		description: 'Severe anaemia (Hb <80)',
		grade: 3,
		evaluate: (d) =>
			d.laboratoryResults.haemoglobin !== null && d.laboratoryResults.haemoglobin < 80
	},
	{
		id: 'LAB-004',
		system: 'Laboratory',
		description: 'Moderate anaemia (Hb 80-100)',
		grade: 2,
		evaluate: (d) =>
			d.laboratoryResults.haemoglobin !== null &&
			d.laboratoryResults.haemoglobin >= 80 &&
			d.laboratoryResults.haemoglobin < 100
	},
	{
		id: 'LAB-005',
		system: 'Laboratory',
		description: 'Severe thrombocytopenia (platelets <50)',
		grade: 3,
		evaluate: (d) =>
			d.laboratoryResults.platelets !== null && d.laboratoryResults.platelets < 50
	},
	{
		id: 'LAB-006',
		system: 'Laboratory',
		description: 'Hypercalcaemia (calcium >2.8)',
		grade: 2,
		evaluate: (d) =>
			d.laboratoryResults.calcium !== null && d.laboratoryResults.calcium > 2.8
	},
	{
		id: 'LAB-007',
		system: 'Laboratory',
		description: 'Elevated LDH (>480 U/L)',
		grade: 1,
		evaluate: (d) => d.laboratoryResults.ldh !== null && d.laboratoryResults.ldh > 480
	},
	{
		id: 'LAB-008',
		system: 'Laboratory',
		description: 'Hypoalbuminaemia (albumin <25)',
		grade: 3,
		evaluate: (d) =>
			d.laboratoryResults.albumin !== null && d.laboratoryResults.albumin < 25
	},
	{
		id: 'LAB-009',
		system: 'Laboratory',
		description: 'Renal impairment (creatinine >200)',
		grade: 2,
		evaluate: (d) =>
			d.laboratoryResults.creatinine !== null && d.laboratoryResults.creatinine > 200
	},
	{
		id: 'LAB-010',
		system: 'Laboratory',
		description: 'Hepatic dysfunction (bilirubin >50)',
		grade: 2,
		evaluate: (d) =>
			d.laboratoryResults.bilirubin !== null && d.laboratoryResults.bilirubin > 50
	},

	// ─── FUNCTIONAL / NUTRITIONAL ───────────────────────────
	{
		id: 'FN-001',
		system: 'Functional',
		description: 'Karnofsky score 50-60',
		grade: 2,
		evaluate: (d) =>
			d.functionalNutritional.karnofskyScore !== null &&
			d.functionalNutritional.karnofskyScore >= 50 &&
			d.functionalNutritional.karnofskyScore <= 60
	},
	{
		id: 'FN-002',
		system: 'Functional',
		description: 'Karnofsky score 30-40',
		grade: 3,
		evaluate: (d) =>
			d.functionalNutritional.karnofskyScore !== null &&
			d.functionalNutritional.karnofskyScore >= 30 &&
			d.functionalNutritional.karnofskyScore <= 40
	},
	{
		id: 'FN-003',
		system: 'Functional',
		description: 'Karnofsky score <30',
		grade: 4,
		evaluate: (d) =>
			d.functionalNutritional.karnofskyScore !== null &&
			d.functionalNutritional.karnofskyScore < 30
	},
	{
		id: 'FN-004',
		system: 'Nutritional',
		description: 'Malnourished',
		grade: 2,
		evaluate: (d) => d.functionalNutritional.nutritionalStatus === 'malnourished'
	},
	{
		id: 'FN-005',
		system: 'Nutritional',
		description: 'Rapidly decreasing weight',
		grade: 2,
		evaluate: (d) => d.functionalNutritional.weightTrajectory === 'decreasing-rapidly'
	},

	// ─── PSYCHOSOCIAL ───────────────────────────────────────
	{
		id: 'PSY-001',
		system: 'Psychosocial',
		description: 'Severe anxiety',
		grade: 1,
		evaluate: (d) => d.psychosocial.anxiety === 'severe'
	},
	{
		id: 'PSY-002',
		system: 'Psychosocial',
		description: 'Severe depression',
		grade: 1,
		evaluate: (d) => d.psychosocial.depression === 'severe'
	}
];
