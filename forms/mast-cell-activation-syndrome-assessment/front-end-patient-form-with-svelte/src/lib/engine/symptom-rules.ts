import type { SymptomDomainDefinition } from './types';

/**
 * MCAS symptom domains grouped by organ system.
 * Each domain contains symptoms scored 0-3 for severity.
 * The maximum severity per domain contributes to the total score.
 *
 * Scoring: Sum of max severity per organ system (5 systems x max 4 symptoms x 0-3)
 * Practical max: Each system contributes max severity across its 4 symptoms,
 * then we sum all individual symptom severities for total score (0-40 range).
 */
export const symptomDomains: SymptomDomainDefinition[] = [
	{
		id: 'MCAS-DERM',
		domain: 'Dermatological',
		symptoms: ['Flushing', 'Urticaria', 'Angioedema', 'Pruritus'],
		description: 'Skin-related symptoms including flushing, hives, swelling, and itching'
	},
	{
		id: 'MCAS-GI',
		domain: 'Gastrointestinal',
		symptoms: ['Abdominal Pain', 'Nausea', 'Diarrhea', 'Bloating'],
		description: 'Digestive symptoms including pain, nausea, diarrhea, and bloating'
	},
	{
		id: 'MCAS-CV',
		domain: 'Cardiovascular',
		symptoms: ['Tachycardia', 'Hypotension', 'Presyncope', 'Syncope'],
		description: 'Heart and blood pressure symptoms including rapid heart rate and fainting'
	},
	{
		id: 'MCAS-RESP',
		domain: 'Respiratory',
		symptoms: ['Wheezing', 'Dyspnea', 'Nasal Congestion', 'Throat Tightening'],
		description: 'Breathing-related symptoms including wheezing and airway tightening'
	},
	{
		id: 'MCAS-NEURO',
		domain: 'Neurological',
		symptoms: ['Headache', 'Brain Fog', 'Dizziness', 'Fatigue'],
		description: 'Neurological symptoms including cognitive difficulties and fatigue'
	}
];

/**
 * MCAS severity response options for each symptom.
 */
export const severityOptions = [
	{ value: 0, label: 'None (0)' },
	{ value: 1, label: 'Mild (1)' },
	{ value: 2, label: 'Moderate (2)' },
	{ value: 3, label: 'Severe (3)' }
];

/**
 * Symptom frequency options.
 */
export const frequencyOptions = [
	{ value: 'never', label: 'Never' },
	{ value: 'rarely', label: 'Rarely (< monthly)' },
	{ value: 'sometimes', label: 'Sometimes (monthly)' },
	{ value: 'often', label: 'Often (weekly)' },
	{ value: 'daily', label: 'Daily' }
];
