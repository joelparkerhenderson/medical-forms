import type { NIHSSRuleDefinition } from './types';

/**
 * The 15 NIHSS (National Institutes of Health Stroke Scale) items.
 * Total score range: 0-42
 *
 * 1a. Level of Consciousness (0-3)
 * 1b. LOC Questions (0-2)
 * 1c. LOC Commands (0-2)
 * 2.  Best Gaze (0-2)
 * 3.  Visual (0-3)
 * 4.  Facial Palsy (0-3)
 * 5a. Motor Arm - Left (0-4)
 * 5b. Motor Arm - Right (0-4)
 * 6a. Motor Leg - Left (0-4)
 * 6b. Motor Leg - Right (0-4)
 * 7.  Limb Ataxia (0-2)
 * 8.  Sensory (0-2)
 * 9.  Best Language (0-3)
 * 10. Dysarthria (0-2)
 * 11. Extinction and Inattention (0-2)
 */
export const nihssItems: NIHSSRuleDefinition[] = [
	{
		id: 'NIHSS-1A',
		itemNumber: 1,
		domain: 'Level of Consciousness',
		text: '1a. LOC: 0=Alert, 1=Not alert but arousable, 2=Not alert requiring repeated stimulation, 3=Unresponsive',
		maxScore: 3
	},
	{
		id: 'NIHSS-1B',
		itemNumber: 2,
		domain: 'Level of Consciousness',
		text: '1b. LOC Questions (month, age): 0=Both correct, 1=One correct, 2=Neither correct',
		maxScore: 2
	},
	{
		id: 'NIHSS-1C',
		itemNumber: 3,
		domain: 'Level of Consciousness',
		text: '1c. LOC Commands (open/close eyes, grip/release): 0=Both correct, 1=One correct, 2=Neither correct',
		maxScore: 2
	},
	{
		id: 'NIHSS-2',
		itemNumber: 4,
		domain: 'Best Gaze',
		text: '2. Best Gaze: 0=Normal, 1=Partial gaze palsy, 2=Forced deviation or total gaze paresis',
		maxScore: 2
	},
	{
		id: 'NIHSS-3',
		itemNumber: 5,
		domain: 'Visual',
		text: '3. Visual fields: 0=No visual loss, 1=Partial hemianopia, 2=Complete hemianopia, 3=Bilateral hemianopia (blind)',
		maxScore: 3
	},
	{
		id: 'NIHSS-4',
		itemNumber: 6,
		domain: 'Facial Palsy',
		text: '4. Facial Palsy: 0=Normal, 1=Minor paralysis, 2=Partial paralysis, 3=Complete paralysis',
		maxScore: 3
	},
	{
		id: 'NIHSS-5A',
		itemNumber: 7,
		domain: 'Motor Arm',
		text: '5a. Motor Arm Left: 0=No drift, 1=Drift before 10s, 2=Some effort against gravity, 3=No effort against gravity, 4=No movement',
		maxScore: 4
	},
	{
		id: 'NIHSS-5B',
		itemNumber: 8,
		domain: 'Motor Arm',
		text: '5b. Motor Arm Right: 0=No drift, 1=Drift before 10s, 2=Some effort against gravity, 3=No effort against gravity, 4=No movement',
		maxScore: 4
	},
	{
		id: 'NIHSS-6A',
		itemNumber: 9,
		domain: 'Motor Leg',
		text: '6a. Motor Leg Left: 0=No drift, 1=Drift before 5s, 2=Some effort against gravity, 3=No effort against gravity, 4=No movement',
		maxScore: 4
	},
	{
		id: 'NIHSS-6B',
		itemNumber: 10,
		domain: 'Motor Leg',
		text: '6b. Motor Leg Right: 0=No drift, 1=Drift before 5s, 2=Some effort against gravity, 3=No effort against gravity, 4=No movement',
		maxScore: 4
	},
	{
		id: 'NIHSS-7',
		itemNumber: 11,
		domain: 'Limb Ataxia',
		text: '7. Limb Ataxia: 0=Absent, 1=Present in one limb, 2=Present in two or more limbs',
		maxScore: 2
	},
	{
		id: 'NIHSS-8',
		itemNumber: 12,
		domain: 'Sensory',
		text: '8. Sensory: 0=Normal, 1=Mild-to-moderate sensory loss, 2=Severe or total sensory loss',
		maxScore: 2
	},
	{
		id: 'NIHSS-9',
		itemNumber: 13,
		domain: 'Best Language',
		text: '9. Best Language: 0=No aphasia, 1=Mild-to-moderate aphasia, 2=Severe aphasia, 3=Mute or global aphasia',
		maxScore: 3
	},
	{
		id: 'NIHSS-10',
		itemNumber: 14,
		domain: 'Dysarthria',
		text: '10. Dysarthria: 0=Normal, 1=Mild-to-moderate slurring, 2=Near unintelligible or worse',
		maxScore: 2
	},
	{
		id: 'NIHSS-11',
		itemNumber: 15,
		domain: 'Extinction and Inattention',
		text: '11. Extinction/Inattention: 0=No abnormality, 1=Inattention to one modality, 2=Profound hemi-inattention or extinction to more than one modality',
		maxScore: 2
	}
];
