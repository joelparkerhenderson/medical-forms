import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the gastroenterologist,
 * independent of the severity score. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── GI Bleeding alerts ──────────────────────────────────
	if (data.lowerGISymptoms.rectalBleeding === 'yes') {
		flags.push({
			id: 'FLAG-BLEED-001',
			category: 'GI Bleeding',
			message: `Rectal bleeding reported${data.lowerGISymptoms.rectalBleedingDetails ? ': ' + data.lowerGISymptoms.rectalBleedingDetails : ''}`,
			priority: 'high'
		});
	}

	// ─── Dysphagia alerts ────────────────────────────────────
	if (data.upperGISymptoms.dysphagia === 'yes') {
		flags.push({
			id: 'FLAG-DYSPH-001',
			category: 'Dysphagia',
			message: `Dysphagia reported${data.upperGISymptoms.dysphagiaDetails ? ': ' + data.upperGISymptoms.dysphagiaDetails : ''} - urgent endoscopy may be required`,
			priority: 'high'
		});
	}

	// ─── Unexplained weight loss ─────────────────────────────
	if (data.redFlagsSocial.unexplainedWeightLoss === 'yes') {
		flags.push({
			id: 'FLAG-WTLOSS-001',
			category: 'Weight Loss',
			message: `Unexplained weight loss${data.redFlagsSocial.weightLossAmount ? ': ' + data.redFlagsSocial.weightLossAmount : ''} - investigate for malignancy`,
			priority: 'high'
		});
	}

	// ─── Jaundice alerts ─────────────────────────────────────
	if (data.liverPancreas.jaundice === 'yes') {
		flags.push({
			id: 'FLAG-JAUND-001',
			category: 'Jaundice',
			message: 'Jaundice present - urgent hepatobiliary investigation required',
			priority: 'high'
		});
	}

	// ─── Family GI cancer ────────────────────────────────────
	if (data.redFlagsSocial.familyGICancer === 'yes') {
		flags.push({
			id: 'FLAG-FAMCA-001',
			category: 'Family History',
			message: `Family history of GI cancer${data.redFlagsSocial.familyCancerDetails ? ': ' + data.redFlagsSocial.familyCancerDetails : ''} - consider screening`,
			priority: 'medium'
		});
	}

	// ─── NSAID use ───────────────────────────────────────────
	if (data.currentMedications.nsaids === 'yes') {
		flags.push({
			id: 'FLAG-NSAID-001',
			category: 'Medications',
			message: `NSAID use${data.currentMedications.nsaidDetails ? ': ' + data.currentMedications.nsaidDetails : ''} - risk of GI bleeding and ulceration`,
			priority: 'medium'
		});
	}

	// ─── IBD alert ───────────────────────────────────────────
	if (data.previousGIHistory.ibd === 'yes') {
		const ibdType = data.previousGIHistory.ibdType === 'crohns' ? "Crohn's disease" :
			data.previousGIHistory.ibdType === 'ulcerative-colitis' ? 'ulcerative colitis' : 'IBD';
		flags.push({
			id: 'FLAG-IBD-001',
			category: 'IBD',
			message: `Known ${ibdType} - assess current disease activity`,
			priority: 'medium'
		});
	}

	// ─── Previous GI cancer ──────────────────────────────────
	if (data.previousGIHistory.giCancer === 'yes') {
		flags.push({
			id: 'FLAG-GICA-001',
			category: 'GI Cancer',
			message: `Previous GI cancer${data.previousGIHistory.giCancerDetails ? ': ' + data.previousGIHistory.giCancerDetails : ''} - surveillance required`,
			priority: 'high'
		});
	}

	// ─── Hepatitis exposure ──────────────────────────────────
	if (data.liverPancreas.hepatitisExposure === 'yes') {
		flags.push({
			id: 'FLAG-HEP-001',
			category: 'Hepatitis',
			message: `Hepatitis exposure${data.liverPancreas.hepatitisDetails ? ': ' + data.liverPancreas.hepatitisDetails : ''} - check serology`,
			priority: 'medium'
		});
	}

	// ─── Pale stools + dark urine (obstructive jaundice pattern) ──
	if (data.liverPancreas.paleStools === 'yes' && data.liverPancreas.darkUrine === 'yes') {
		flags.push({
			id: 'FLAG-OBSTR-001',
			category: 'Obstructive Pattern',
			message: 'Pale stools and dark urine - consider obstructive jaundice workup',
			priority: 'high'
		});
	}

	// ─── Drug allergies ──────────────────────────────────────
	for (const [i, allergy] of data.allergiesDiet.drugAllergies.entries()) {
		if (allergy.severity === 'severe') {
			flags.push({
				id: `FLAG-ALLERGY-${i}`,
				category: 'Allergy',
				message: `Severe drug allergy: ${allergy.allergen}${allergy.reaction ? ' - ' + allergy.reaction : ''}`,
				priority: 'high'
			});
		}
	}

	if (data.allergiesDiet.drugAllergies.length > 0) {
		flags.push({
			id: 'FLAG-ALLERGY-COUNT',
			category: 'Allergy',
			message: `${data.allergiesDiet.drugAllergies.length} drug allergy/allergies documented`,
			priority: 'medium'
		});
	}

	// ─── Biologic therapy ────────────────────────────────────
	if (data.currentMedications.biologics === 'yes') {
		flags.push({
			id: 'FLAG-BIOLOGIC-001',
			category: 'Medications',
			message: `On biologic therapy${data.currentMedications.biologicDetails ? ': ' + data.currentMedications.biologicDetails : ''} - assess infection risk`,
			priority: 'medium'
		});
	}

	// ─── Heavy alcohol ───────────────────────────────────────
	if (data.liverPancreas.alcoholIntake === 'heavy') {
		flags.push({
			id: 'FLAG-ALCOHOL-001',
			category: 'Social',
			message: 'Heavy alcohol intake - assess for alcoholic liver disease',
			priority: 'medium'
		});
	}

	// ─── Vomiting ────────────────────────────────────────────
	if (data.upperGISymptoms.vomiting === 'yes') {
		flags.push({
			id: 'FLAG-VOMIT-001',
			category: 'Upper GI',
			message: `Vomiting reported${data.upperGISymptoms.vomitingDetails ? ': ' + data.upperGISymptoms.vomitingDetails : ''} - assess for dehydration`,
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
