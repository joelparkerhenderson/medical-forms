import type { GIScoringRule } from './types';

/**
 * Declarative GI symptom severity scoring rules.
 * Each rule evaluates patient data and returns true if the condition is present.
 * Points are summed to produce a composite GI Symptom Severity Score.
 */
export const giRules: GIScoringRule[] = [
	// ─── CHIEF COMPLAINT ─────────────────────────────────────
	{
		id: 'CC-001',
		category: 'Chief Complaint',
		description: 'Symptom severity score 4-6 (moderate)',
		points: 3,
		evaluate: (d) =>
			d.chiefComplaint.severityScore !== null &&
			d.chiefComplaint.severityScore >= 4 &&
			d.chiefComplaint.severityScore <= 6
	},
	{
		id: 'CC-002',
		category: 'Chief Complaint',
		description: 'Symptom severity score 7-8 (severe)',
		points: 5,
		evaluate: (d) =>
			d.chiefComplaint.severityScore !== null &&
			d.chiefComplaint.severityScore >= 7 &&
			d.chiefComplaint.severityScore <= 8
	},
	{
		id: 'CC-003',
		category: 'Chief Complaint',
		description: 'Symptom severity score 9-10 (very severe)',
		points: 8,
		evaluate: (d) =>
			d.chiefComplaint.severityScore !== null && d.chiefComplaint.severityScore >= 9
	},

	// ─── UPPER GI SYMPTOMS ───────────────────────────────────
	{
		id: 'UGI-001',
		category: 'Upper GI',
		description: 'Dysphagia present',
		points: 5,
		evaluate: (d) => d.upperGISymptoms.dysphagia === 'yes'
	},
	{
		id: 'UGI-002',
		category: 'Upper GI',
		description: 'Odynophagia present',
		points: 4,
		evaluate: (d) => d.upperGISymptoms.odynophagia === 'yes'
	},
	{
		id: 'UGI-003',
		category: 'Upper GI',
		description: 'Heartburn present',
		points: 2,
		evaluate: (d) => d.upperGISymptoms.heartburn === 'yes'
	},
	{
		id: 'UGI-004',
		category: 'Upper GI',
		description: 'Nausea present',
		points: 2,
		evaluate: (d) => d.upperGISymptoms.nausea === 'yes'
	},
	{
		id: 'UGI-005',
		category: 'Upper GI',
		description: 'Vomiting present',
		points: 3,
		evaluate: (d) => d.upperGISymptoms.vomiting === 'yes'
	},
	{
		id: 'UGI-006',
		category: 'Upper GI',
		description: 'Early satiety present',
		points: 3,
		evaluate: (d) => d.upperGISymptoms.earlySatiety === 'yes'
	},

	// ─── LOWER GI SYMPTOMS ───────────────────────────────────
	{
		id: 'LGI-001',
		category: 'Lower GI',
		description: 'Change in bowel habit',
		points: 3,
		evaluate: (d) => d.lowerGISymptoms.bowelHabitChange === 'yes'
	},
	{
		id: 'LGI-002',
		category: 'Lower GI',
		description: 'Diarrhoea present',
		points: 3,
		evaluate: (d) => d.lowerGISymptoms.diarrhoea === 'yes'
	},
	{
		id: 'LGI-003',
		category: 'Lower GI',
		description: 'Constipation present',
		points: 2,
		evaluate: (d) => d.lowerGISymptoms.constipation === 'yes'
	},
	{
		id: 'LGI-004',
		category: 'Lower GI',
		description: 'Rectal bleeding present',
		points: 5,
		evaluate: (d) => d.lowerGISymptoms.rectalBleeding === 'yes'
	},
	{
		id: 'LGI-005',
		category: 'Lower GI',
		description: 'Tenesmus present',
		points: 3,
		evaluate: (d) => d.lowerGISymptoms.tenesmus === 'yes'
	},
	{
		id: 'LGI-006',
		category: 'Lower GI',
		description: 'Bristol stool type 1-2 (severe constipation)',
		points: 2,
		evaluate: (d) =>
			d.lowerGISymptoms.bristolStoolType === '1' ||
			d.lowerGISymptoms.bristolStoolType === '2'
	},
	{
		id: 'LGI-007',
		category: 'Lower GI',
		description: 'Bristol stool type 6-7 (diarrhoea)',
		points: 2,
		evaluate: (d) =>
			d.lowerGISymptoms.bristolStoolType === '6' ||
			d.lowerGISymptoms.bristolStoolType === '7'
	},

	// ─── ABDOMINAL PAIN ──────────────────────────────────────
	{
		id: 'AP-001',
		category: 'Abdominal Pain',
		description: 'Constant abdominal pain',
		points: 4,
		evaluate: (d) => d.abdominalPainAssessment.painFrequency === 'constant'
	},
	{
		id: 'AP-002',
		category: 'Abdominal Pain',
		description: 'Intermittent abdominal pain',
		points: 2,
		evaluate: (d) => d.abdominalPainAssessment.painFrequency === 'intermittent'
	},
	{
		id: 'AP-003',
		category: 'Abdominal Pain',
		description: 'Pain with radiation',
		points: 2,
		evaluate: (d) => d.abdominalPainAssessment.painRadiation !== ''
	},

	// ─── LIVER & PANCREAS ────────────────────────────────────
	{
		id: 'LP-001',
		category: 'Liver & Pancreas',
		description: 'Jaundice present',
		points: 5,
		evaluate: (d) => d.liverPancreas.jaundice === 'yes'
	},
	{
		id: 'LP-002',
		category: 'Liver & Pancreas',
		description: 'Dark urine reported',
		points: 2,
		evaluate: (d) => d.liverPancreas.darkUrine === 'yes'
	},
	{
		id: 'LP-003',
		category: 'Liver & Pancreas',
		description: 'Pale stools reported',
		points: 3,
		evaluate: (d) => d.liverPancreas.paleStools === 'yes'
	},
	{
		id: 'LP-004',
		category: 'Liver & Pancreas',
		description: 'Heavy alcohol intake',
		points: 3,
		evaluate: (d) => d.liverPancreas.alcoholIntake === 'heavy'
	},
	{
		id: 'LP-005',
		category: 'Liver & Pancreas',
		description: 'Hepatitis exposure',
		points: 3,
		evaluate: (d) => d.liverPancreas.hepatitisExposure === 'yes'
	},

	// ─── PREVIOUS GI HISTORY ─────────────────────────────────
	{
		id: 'PH-001',
		category: 'Previous GI History',
		description: 'Known IBD (Crohns or UC)',
		points: 4,
		evaluate: (d) => d.previousGIHistory.ibd === 'yes'
	},
	{
		id: 'PH-002',
		category: 'Previous GI History',
		description: 'Previous GI cancer',
		points: 5,
		evaluate: (d) => d.previousGIHistory.giCancer === 'yes'
	},
	{
		id: 'PH-003',
		category: 'Previous GI History',
		description: 'Previous polyps',
		points: 2,
		evaluate: (d) => d.previousGIHistory.polyps === 'yes'
	},
	{
		id: 'PH-004',
		category: 'Previous GI History',
		description: 'Previous GI surgery',
		points: 2,
		evaluate: (d) => d.previousGIHistory.previousGISurgery === 'yes'
	},

	// ─── MEDICATIONS ─────────────────────────────────────────
	{
		id: 'MED-001',
		category: 'Medications',
		description: 'NSAID use',
		points: 2,
		evaluate: (d) => d.currentMedications.nsaids === 'yes'
	},
	{
		id: 'MED-002',
		category: 'Medications',
		description: 'Steroid use',
		points: 2,
		evaluate: (d) => d.currentMedications.steroids === 'yes'
	},
	{
		id: 'MED-003',
		category: 'Medications',
		description: 'Biologic therapy',
		points: 3,
		evaluate: (d) => d.currentMedications.biologics === 'yes'
	},

	// ─── RED FLAGS ───────────────────────────────────────────
	{
		id: 'RF-001',
		category: 'Red Flags',
		description: 'Unexplained weight loss',
		points: 5,
		evaluate: (d) => d.redFlagsSocial.unexplainedWeightLoss === 'yes'
	},
	{
		id: 'RF-002',
		category: 'Red Flags',
		description: 'Appetite change',
		points: 2,
		evaluate: (d) => d.redFlagsSocial.appetiteChange === 'yes'
	},
	{
		id: 'RF-003',
		category: 'Red Flags',
		description: 'Family history of GI cancer',
		points: 3,
		evaluate: (d) => d.redFlagsSocial.familyGICancer === 'yes'
	},
	{
		id: 'RF-004',
		category: 'Red Flags',
		description: 'Current smoker',
		points: 2,
		evaluate: (d) => d.redFlagsSocial.smoking === 'current'
	},
	{
		id: 'RF-005',
		category: 'Red Flags',
		description: 'Heavy alcohol use',
		points: 3,
		evaluate: (d) => d.redFlagsSocial.alcoholUse === 'heavy'
	}
];
