import type { AssessmentData, AdditionalFlag } from './types';
import { calculateMMSE } from './mmse-grader';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of overall MMSE category. These are safety-critical or
 * clinically significant alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];
	const { mmseScore } = calculateMMSE(data);

	// ─── Severe cognitive impairment ────────────────────────
	if (mmseScore <= 9) {
		flags.push({
			id: 'FLAG-SEVERE-001',
			category: 'Severe Impairment',
			message: `MMSE score ${mmseScore}/30 indicates severe cognitive impairment - urgent specialist review recommended`,
			priority: 'high'
		});
	}

	// ─── Orientation loss (time) ────────────────────────────
	const ot = data.orientationScores;
	const timeScore = [ot.year, ot.season, ot.date, ot.day, ot.month]
		.filter((s) => s !== null)
		.reduce((sum, s) => sum + (s ?? 0), 0);

	if (timeScore <= 1) {
		flags.push({
			id: 'FLAG-ORIENT-TIME-001',
			category: 'Orientation Loss',
			message: `Significant temporal disorientation (time orientation score: ${timeScore}/5) - assess for delirium or progressive dementia`,
			priority: 'high'
		});
	}

	// ─── Orientation loss (place) ───────────────────────────
	const placeScore = [ot.country, ot.county, ot.town, ot.hospital, ot.floor]
		.filter((s) => s !== null)
		.reduce((sum, s) => sum + (s ?? 0), 0);

	if (placeScore <= 1) {
		flags.push({
			id: 'FLAG-ORIENT-PLACE-001',
			category: 'Orientation Loss',
			message: `Significant spatial disorientation (place orientation score: ${placeScore}/5) - assess for delirium or advanced dementia`,
			priority: 'high'
		});
	}

	// ─── Complete memory deficit (recall 0/3) ───────────────
	const rec = data.recallScores;
	const recallScore = [rec.object1, rec.object2, rec.object3]
		.filter((s) => s !== null)
		.reduce((sum, s) => sum + (s ?? 0), 0);
	const recallAnswered = [rec.object1, rec.object2, rec.object3].some((s) => s !== null);

	if (recallAnswered && recallScore === 0) {
		flags.push({
			id: 'FLAG-MEMORY-001',
			category: 'Memory Deficit',
			message: 'Complete recall failure (0/3 objects recalled) - significant short-term memory impairment',
			priority: 'high'
		});
	}

	// ─── Registration failure ───────────────────────────────
	const reg = data.registrationScores;
	const regScore = [reg.object1, reg.object2, reg.object3]
		.filter((s) => s !== null)
		.reduce((sum, s) => sum + (s ?? 0), 0);
	const regAnswered = [reg.object1, reg.object2, reg.object3].some((s) => s !== null);

	if (regAnswered && regScore <= 1) {
		flags.push({
			id: 'FLAG-MEMORY-002',
			category: 'Memory Deficit',
			message: `Poor registration (${regScore}/3) - possible attention or encoding deficit`,
			priority: 'medium'
		});
	}

	// ─── Language difficulties ──────────────────────────────
	const lang = data.repetitionCommands;
	const langScore = [lang.naming1, lang.naming2, lang.repetition, lang.command1, lang.command2, lang.command3, lang.reading, lang.writing]
		.filter((s) => s !== null)
		.reduce((sum, s) => sum + (s ?? 0), 0);
	const langAnswered = [lang.naming1, lang.naming2, lang.repetition, lang.command1, lang.command2, lang.command3, lang.reading, lang.writing]
		.some((s) => s !== null);

	if (langAnswered && langScore <= 3) {
		flags.push({
			id: 'FLAG-LANGUAGE-001',
			category: 'Language Difficulty',
			message: `Significant language impairment (${langScore}/8) - assess for aphasia or frontotemporal involvement`,
			priority: 'medium'
		});
	}

	// ─── Naming failure (both items failed) ─────────────────
	if (lang.naming1 === 0 && lang.naming2 === 0) {
		flags.push({
			id: 'FLAG-LANGUAGE-002',
			category: 'Language Difficulty',
			message: 'Unable to name common objects - possible anomic aphasia',
			priority: 'medium'
		});
	}

	// ─── Attention & calculation deficit ─────────────────────
	const att = data.attentionScores;
	const attScore = [att.serial1, att.serial2, att.serial3, att.serial4, att.serial5]
		.filter((s) => s !== null)
		.reduce((sum, s) => sum + (s ?? 0), 0);
	const attAnswered = [att.serial1, att.serial2, att.serial3, att.serial4, att.serial5]
		.some((s) => s !== null);

	if (attAnswered && attScore === 0) {
		flags.push({
			id: 'FLAG-ATTENTION-001',
			category: 'Attention Deficit',
			message: 'Complete attention/calculation failure (0/5) - assess for delirium, depression, or significant cognitive decline',
			priority: 'high'
		});
	}

	// ─── Safety concerns documented ─────────────────────────
	if (data.functionalHistory.safetyConerns.trim().length > 0) {
		flags.push({
			id: 'FLAG-SAFETY-001',
			category: 'Safety Concern',
			message: `Safety concerns reported: ${data.functionalHistory.safetyConerns}`,
			priority: 'high'
		});
	}

	// ─── Functional decline with cognitive impairment ────────
	const adls = [
		data.functionalHistory.adlBathing,
		data.functionalHistory.adlDressing,
		data.functionalHistory.adlMeals,
		data.functionalHistory.adlMedications,
		data.functionalHistory.adlFinances,
		data.functionalHistory.adlTransport
	];
	const dependentCount = adls.filter((a) => a === 'fully-dependent' || a === 'needs-significant-help').length;

	if (dependentCount >= 3 && mmseScore <= 23) {
		flags.push({
			id: 'FLAG-FUNCTIONAL-001',
			category: 'Functional Decline',
			message: `Significant functional dependency (${dependentCount}/6 ADLs impaired) with cognitive impairment - consider safeguarding and care package review`,
			priority: 'high'
		});
	}

	// ─── Lives alone with impairment ────────────────────────
	if (data.functionalHistory.livingArrangement === 'alone' && mmseScore <= 17) {
		flags.push({
			id: 'FLAG-LIVING-001',
			category: 'Living Situation',
			message: 'Patient lives alone with moderate-to-severe cognitive impairment - assess safety and consider supported living',
			priority: 'high'
		});
	}

	// ─── No carers available ────────────────────────────────
	if (data.functionalHistory.carersAvailable === 'no' && mmseScore <= 23) {
		flags.push({
			id: 'FLAG-CARER-001',
			category: 'Support Network',
			message: 'No carers available for patient with cognitive impairment - refer to social services',
			priority: 'medium'
		});
	}

	// ─── Visuospatial failure ───────────────────────────────
	if (data.visuospatialScores.copying === 0) {
		flags.push({
			id: 'FLAG-VISUOSPATIAL-001',
			category: 'Visuospatial Deficit',
			message: 'Unable to copy intersecting pentagons - possible parietal lobe involvement',
			priority: 'medium'
		});
	}

	// ─── Young onset (under 65) ─────────────────────────────
	if (data.demographics.dateOfBirth) {
		const birth = new Date(data.demographics.dateOfBirth);
		const today = new Date();
		let age = today.getFullYear() - birth.getFullYear();
		const m = today.getMonth() - birth.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
			age--;
		}
		if (age < 65 && mmseScore <= 23) {
			flags.push({
				id: 'FLAG-YOUNG-001',
				category: 'Young Onset',
				message: `Patient age ${age} with cognitive impairment - consider early-onset dementia differential and specialist referral`,
				priority: 'high'
			});
		}
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
