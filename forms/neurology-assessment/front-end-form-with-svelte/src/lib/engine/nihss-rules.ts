import type { NIHSSRule } from './types';

/**
 * NIHSS (National Institutes of Health Stroke Scale) scoring rules.
 * 15 items scored across neurological domains.
 * Total score range: 0-42.
 */
export const nihssRules: NIHSSRule[] = [
	// ─── 1a. Level of Consciousness ─────────────────────────
	{
		id: 'NIHSS-1A',
		category: 'Consciousness',
		description: 'Level of consciousness',
		field: 'consciousness',
		evaluate: (d) => d.nihssAssessment.consciousness ?? 0
	},
	// ─── 1b. LOC Questions ──────────────────────────────────
	{
		id: 'NIHSS-1B',
		category: 'Consciousness',
		description: 'LOC questions (month, age)',
		field: 'consciousnessQuestions',
		evaluate: (d) => d.nihssAssessment.consciousnessQuestions ?? 0
	},
	// ─── 1c. LOC Commands ───────────────────────────────────
	{
		id: 'NIHSS-1C',
		category: 'Consciousness',
		description: 'LOC commands (open/close eyes, grip/release)',
		field: 'consciousnessCommands',
		evaluate: (d) => d.nihssAssessment.consciousnessCommands ?? 0
	},
	// ─── 2. Best Gaze ───────────────────────────────────────
	{
		id: 'NIHSS-2',
		category: 'Cranial Nerves',
		description: 'Best gaze (horizontal eye movement)',
		field: 'gaze',
		evaluate: (d) => d.nihssAssessment.gaze ?? 0
	},
	// ─── 3. Visual Fields ───────────────────────────────────
	{
		id: 'NIHSS-3',
		category: 'Cranial Nerves',
		description: 'Visual fields',
		field: 'visual',
		evaluate: (d) => d.nihssAssessment.visual ?? 0
	},
	// ─── 4. Facial Palsy ────────────────────────────────────
	{
		id: 'NIHSS-4',
		category: 'Cranial Nerves',
		description: 'Facial palsy',
		field: 'facialPalsy',
		evaluate: (d) => d.nihssAssessment.facialPalsy ?? 0
	},
	// ─── 5a. Motor Arm Left ─────────────────────────────────
	{
		id: 'NIHSS-5A',
		category: 'Motor',
		description: 'Motor arm - left',
		field: 'motorLeftArm',
		evaluate: (d) => d.nihssAssessment.motorLeftArm ?? 0
	},
	// ─── 5b. Motor Arm Right ────────────────────────────────
	{
		id: 'NIHSS-5B',
		category: 'Motor',
		description: 'Motor arm - right',
		field: 'motorRightArm',
		evaluate: (d) => d.nihssAssessment.motorRightArm ?? 0
	},
	// ─── 6a. Motor Leg Left ─────────────────────────────────
	{
		id: 'NIHSS-6A',
		category: 'Motor',
		description: 'Motor leg - left',
		field: 'motorLeftLeg',
		evaluate: (d) => d.nihssAssessment.motorLeftLeg ?? 0
	},
	// ─── 6b. Motor Leg Right ────────────────────────────────
	{
		id: 'NIHSS-6B',
		category: 'Motor',
		description: 'Motor leg - right',
		field: 'motorRightLeg',
		evaluate: (d) => d.nihssAssessment.motorRightLeg ?? 0
	},
	// ─── 7. Limb Ataxia ────────────────────────────────────
	{
		id: 'NIHSS-7',
		category: 'Coordination',
		description: 'Limb ataxia',
		field: 'limbAtaxia',
		evaluate: (d) => d.nihssAssessment.limbAtaxia ?? 0
	},
	// ─── 8. Sensory ────────────────────────────────────────
	{
		id: 'NIHSS-8',
		category: 'Sensory',
		description: 'Sensory',
		field: 'sensory',
		evaluate: (d) => d.nihssAssessment.sensory ?? 0
	},
	// ─── 9. Best Language ──────────────────────────────────
	{
		id: 'NIHSS-9',
		category: 'Language',
		description: 'Best language (aphasia)',
		field: 'language',
		evaluate: (d) => d.nihssAssessment.language ?? 0
	},
	// ─── 10. Dysarthria ────────────────────────────────────
	{
		id: 'NIHSS-10',
		category: 'Language',
		description: 'Dysarthria',
		field: 'dysarthria',
		evaluate: (d) => d.nihssAssessment.dysarthria ?? 0
	},
	// ─── 11. Extinction and Inattention ────────────────────
	{
		id: 'NIHSS-11',
		category: 'Neglect',
		description: 'Extinction and inattention',
		field: 'extinctionInattention',
		evaluate: (d) => d.nihssAssessment.extinctionInattention ?? 0
	}
];
