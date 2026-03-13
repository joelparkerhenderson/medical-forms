import type { DAS28Rule } from './types';

/**
 * Declarative DAS28 assessment rules.
 * These rules identify clinical findings relevant to disease activity
 * and treatment decisions in rheumatology.
 */
export const das28Rules: DAS28Rule[] = [
	// ─── JOINT ASSESSMENT ────────────────────────────────────
	{
		id: 'JA-001',
		category: 'Joint Assessment',
		description: 'Elevated tender joint count (TJC28 > 5)',
		evaluate: (d) =>
			d.jointAssessment.tenderJointCount28 !== null && d.jointAssessment.tenderJointCount28 > 5
	},
	{
		id: 'JA-002',
		category: 'Joint Assessment',
		description: 'High tender joint count (TJC28 > 14)',
		evaluate: (d) =>
			d.jointAssessment.tenderJointCount28 !== null && d.jointAssessment.tenderJointCount28 > 14
	},
	{
		id: 'JA-003',
		category: 'Joint Assessment',
		description: 'Elevated swollen joint count (SJC28 > 5)',
		evaluate: (d) =>
			d.jointAssessment.swollenJointCount28 !== null && d.jointAssessment.swollenJointCount28 > 5
	},
	{
		id: 'JA-004',
		category: 'Joint Assessment',
		description: 'High swollen joint count (SJC28 > 14)',
		evaluate: (d) =>
			d.jointAssessment.swollenJointCount28 !== null && d.jointAssessment.swollenJointCount28 > 14
	},
	{
		id: 'JA-005',
		category: 'Joint Assessment',
		description: 'High pain VAS (> 60mm)',
		evaluate: (d) =>
			d.jointAssessment.painVAS !== null && d.jointAssessment.painVAS > 60
	},

	// ─── INFLAMMATORY MARKERS ────────────────────────────────
	{
		id: 'LAB-001',
		category: 'Laboratory',
		description: 'Elevated ESR (> 20 mm/hr)',
		evaluate: (d) =>
			d.laboratoryResults.esr !== null && d.laboratoryResults.esr > 20
	},
	{
		id: 'LAB-002',
		category: 'Laboratory',
		description: 'Highly elevated ESR (> 50 mm/hr)',
		evaluate: (d) =>
			d.laboratoryResults.esr !== null && d.laboratoryResults.esr > 50
	},
	{
		id: 'LAB-003',
		category: 'Laboratory',
		description: 'Elevated CRP (> 10 mg/L)',
		evaluate: (d) =>
			d.laboratoryResults.crp !== null && d.laboratoryResults.crp > 10
	},
	{
		id: 'LAB-004',
		category: 'Laboratory',
		description: 'Highly elevated CRP (> 30 mg/L)',
		evaluate: (d) =>
			d.laboratoryResults.crp !== null && d.laboratoryResults.crp > 30
	},
	{
		id: 'LAB-005',
		category: 'Laboratory',
		description: 'Positive rheumatoid factor',
		evaluate: (d) => d.laboratoryResults.rheumatoidFactor === 'yes'
	},
	{
		id: 'LAB-006',
		category: 'Laboratory',
		description: 'Positive anti-CCP antibodies',
		evaluate: (d) => d.laboratoryResults.antiCCP === 'yes'
	},
	{
		id: 'LAB-007',
		category: 'Laboratory',
		description: 'Positive ANA',
		evaluate: (d) => d.laboratoryResults.ana === 'yes'
	},
	{
		id: 'LAB-008',
		category: 'Laboratory',
		description: 'Positive HLA-B27',
		evaluate: (d) => d.laboratoryResults.hlaB27 === 'yes'
	},

	// ─── DISEASE HISTORY ─────────────────────────────────────
	{
		id: 'DH-001',
		category: 'Disease History',
		description: 'Long-standing disease (> 10 years)',
		evaluate: (d) =>
			d.diseaseHistory.diseaseDurationYears !== null && d.diseaseHistory.diseaseDurationYears > 10
	},
	{
		id: 'DH-002',
		category: 'Disease History',
		description: 'No prior remission periods',
		evaluate: (d) => d.diseaseHistory.remissionPeriods === 'no'
	},

	// ─── EXTRA-ARTICULAR ─────────────────────────────────────
	{
		id: 'EA-001',
		category: 'Extra-articular',
		description: 'Rheumatoid nodules present',
		evaluate: (d) => d.extraArticularFeatures.rheumatoidNodules === 'yes'
	},
	{
		id: 'EA-002',
		category: 'Extra-articular',
		description: 'Interstitial lung disease',
		evaluate: (d) => d.extraArticularFeatures.interstitialLungDisease === 'yes'
	},
	{
		id: 'EA-003',
		category: 'Extra-articular',
		description: 'Uveitis',
		evaluate: (d) => d.extraArticularFeatures.uveitis === 'yes'
	},
	{
		id: 'EA-004',
		category: 'Extra-articular',
		description: 'Cardiovascular involvement',
		evaluate: (d) => d.extraArticularFeatures.cardiovascularInvolvement === 'yes'
	},
	{
		id: 'EA-005',
		category: 'Extra-articular',
		description: 'Skin rash present',
		evaluate: (d) => d.extraArticularFeatures.skinRash === 'yes'
	},

	// ─── FUNCTIONAL ASSESSMENT ───────────────────────────────
	{
		id: 'FA-001',
		category: 'Functional',
		description: 'High HAQ-DI score (> 1.5)',
		evaluate: (d) =>
			d.functionalAssessment.haqDiScore !== null && d.functionalAssessment.haqDiScore > 1.5
	},
	{
		id: 'FA-002',
		category: 'Functional',
		description: 'Severe disability (HAQ-DI > 2.0)',
		evaluate: (d) =>
			d.functionalAssessment.haqDiScore !== null && d.functionalAssessment.haqDiScore > 2.0
	},
	{
		id: 'FA-003',
		category: 'Functional',
		description: 'Work disability',
		evaluate: (d) => d.functionalAssessment.workDisability === 'yes'
	},
	{
		id: 'FA-004',
		category: 'Functional',
		description: 'Wheelchair or bedbound',
		evaluate: (d) =>
			d.functionalAssessment.walkingAbility === 'wheelchair' ||
			d.functionalAssessment.walkingAbility === 'bedbound'
	},

	// ─── COMORBIDITIES ───────────────────────────────────────
	{
		id: 'CM-001',
		category: 'Comorbidities',
		description: 'Cardiovascular risk',
		evaluate: (d) => d.comorbiditiesSocial.cardiovascularRisk === 'yes'
	},
	{
		id: 'CM-002',
		category: 'Comorbidities',
		description: 'Osteoporosis',
		evaluate: (d) => d.comorbiditiesSocial.osteoporosis === 'yes'
	},
	{
		id: 'CM-003',
		category: 'Comorbidities',
		description: 'Recent infections',
		evaluate: (d) => d.comorbiditiesSocial.recentInfections === 'yes'
	},
	{
		id: 'CM-004',
		category: 'Comorbidities',
		description: 'Current smoker',
		evaluate: (d) => d.comorbiditiesSocial.smoking === 'current'
	},

	// ─── MORNING STIFFNESS ───────────────────────────────────
	{
		id: 'CC-001',
		category: 'Chief Complaint',
		description: 'Prolonged morning stiffness (> 60 minutes)',
		evaluate: (d) =>
			d.chiefComplaint.morningStiffnessDurationMinutes !== null &&
			d.chiefComplaint.morningStiffnessDurationMinutes > 60
	},

	// ─── LABORATORY ABNORMALITIES ────────────────────────────
	{
		id: 'LAB-009',
		category: 'Laboratory',
		description: 'Anaemia (Hb < 120 g/L)',
		evaluate: (d) =>
			d.laboratoryResults.haemoglobin !== null && d.laboratoryResults.haemoglobin < 120
	},
	{
		id: 'LAB-010',
		category: 'Laboratory',
		description: 'Impaired renal function (eGFR < 60)',
		evaluate: (d) =>
			d.laboratoryResults.egfr !== null && d.laboratoryResults.egfr < 60
	},
	{
		id: 'LAB-011',
		category: 'Laboratory',
		description: 'Elevated liver enzymes (ALT > 40)',
		evaluate: (d) =>
			d.laboratoryResults.alt !== null && d.laboratoryResults.alt > 40
	}
];
