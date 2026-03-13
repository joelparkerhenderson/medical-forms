import type { AssessmentData, AdditionalFlag } from './types';
import { calculateAge } from './utils';

/**
 * Detects additional flags that should be highlighted for the audiologist,
 * independent of HHIE-S score. These are safety-critical or clinically
 * significant alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Significant handicap on HHIE-S ─────────────────────
	// (This is checked separately from score in the grader because
	// flags are about the clinical picture, not just the score)

	// ─── Sudden onset hearing loss ──────────────────────────
	if (data.hearingHistory.onsetType === 'sudden') {
		flags.push({
			id: 'FLAG-SUDDEN-001',
			category: 'Sudden Onset',
			message: 'Sudden onset hearing loss reported - urgent ENT referral recommended to rule out medical emergency',
			priority: 'high'
		});
	}

	// ─── Unilateral hearing loss ────────────────────────────
	if (
		data.hearingHistory.affectedEar === 'left' ||
		data.hearingHistory.affectedEar === 'right'
	) {
		flags.push({
			id: 'FLAG-UNILATERAL-001',
			category: 'Unilateral Loss',
			message: `Unilateral hearing loss (${data.hearingHistory.affectedEar} ear) - consider MRI to rule out retrocochlear pathology`,
			priority: 'high'
		});
	}

	// ─── Tinnitus ───────────────────────────────────────────
	if (data.hearingHistory.tinnitus === 'yes') {
		flags.push({
			id: 'FLAG-TINNITUS-001',
			category: 'Tinnitus',
			message: 'Tinnitus reported - assess for tinnitus management and consider masking features in hearing aid selection',
			priority: 'medium'
		});
	}

	// ─── Vertigo ────────────────────────────────────────────
	if (data.hearingHistory.vertigo === 'yes') {
		flags.push({
			id: 'FLAG-VERTIGO-001',
			category: 'Vertigo',
			message: 'Vertigo reported - ENT assessment recommended to evaluate vestibular function',
			priority: 'high'
		});
	}

	// ─── Ear surgery history ────────────────────────────────
	if (data.hearingHistory.earSurgery === 'yes') {
		flags.push({
			id: 'FLAG-SURGERY-001',
			category: 'Ear Surgery History',
			message: 'Previous ear surgery - consider modified ear mould and ENT consultation before fitting',
			priority: 'medium'
		});
	}

	// ─── Ototoxic medications ───────────────────────────────
	if (data.hearingHistory.ototoxicMedications === 'yes') {
		flags.push({
			id: 'FLAG-OTOTOXIC-001',
			category: 'Ototoxic Medications',
			message: 'History of ototoxic medication use - monitor for progressive hearing loss',
			priority: 'medium'
		});
	}

	// ─── Asymmetric hearing loss ────────────────────────────
	if (
		data.audiogramResults.leftPTA !== null &&
		data.audiogramResults.rightPTA !== null
	) {
		const diff = Math.abs(data.audiogramResults.leftPTA - data.audiogramResults.rightPTA);
		if (diff >= 15) {
			flags.push({
				id: 'FLAG-ASYMMETRIC-001',
				category: 'Asymmetric Loss',
				message: `Asymmetric hearing loss detected (${diff} dB difference between ears) - consider MRI to rule out acoustic neuroma`,
				priority: 'high'
			});
		}
	}

	// ─── Young patient with significant loss ────────────────
	const age = calculateAge(data.demographics.dateOfBirth);
	if (age !== null && age < 55) {
		if (
			(data.audiogramResults.leftPTA !== null && data.audiogramResults.leftPTA >= 40) ||
			(data.audiogramResults.rightPTA !== null && data.audiogramResults.rightPTA >= 40)
		) {
			flags.push({
				id: 'FLAG-YOUNG-LOSS-001',
				category: 'Young Patient',
				message: `Patient age ${age} with moderate or greater hearing loss - investigate underlying cause, consider genetic and occupational factors`,
				priority: 'medium'
			});
		}
	}

	// ─── Poor word recognition ──────────────────────────────
	if (
		(data.audiogramResults.leftWordRecognition !== null && data.audiogramResults.leftWordRecognition < 50) ||
		(data.audiogramResults.rightWordRecognition !== null && data.audiogramResults.rightWordRecognition < 50)
	) {
		flags.push({
			id: 'FLAG-WORD-RECOG-001',
			category: 'Poor Word Recognition',
			message: 'Word recognition score below 50% - hearing aid benefit may be limited, consider cochlear implant evaluation',
			priority: 'high'
		});
	}

	// ─── Cerumen impaction ──────────────────────────────────
	if (data.earExamination.cerumenLeft === 'yes' || data.earExamination.cerumenRight === 'yes') {
		const sides = [];
		if (data.earExamination.cerumenLeft === 'yes') sides.push('left');
		if (data.earExamination.cerumenRight === 'yes') sides.push('right');
		flags.push({
			id: 'FLAG-CERUMEN-001',
			category: 'Cerumen',
			message: `Cerumen noted in ${sides.join(' and ')} ear(s) - remove before impression taking or hearing aid fitting`,
			priority: 'low'
		});
	}

	// ─── Noise exposure history ─────────────────────────────
	if (data.hearingHistory.noiseExposure === 'yes') {
		flags.push({
			id: 'FLAG-NOISE-001',
			category: 'Noise Exposure',
			message: 'History of noise exposure - counsel on hearing protection and monitor for progression',
			priority: 'low'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
