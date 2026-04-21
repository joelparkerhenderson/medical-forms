import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of compliance classification. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Active exposure incident (HIGH) ────────────────────────
	if (data.scheduleCompliance.activeExposureIncident === 'yes') {
		flags.push({
			id: 'FLAG-EXPOSURE-001',
			category: 'Exposure',
			message: `Active exposure incident: ${data.scheduleCompliance.activeExposureDetails || 'details not specified'} - URGENT ACTION REQUIRED`,
			priority: 'high'
		});
	}

	// ─── Previous anaphylaxis to vaccine (HIGH) ─────────────────
	if (data.vaccinationHistory.adverseReactionSeverity === 'anaphylaxis') {
		flags.push({
			id: 'FLAG-ANAPH-001',
			category: 'Allergy',
			message: `ANAPHYLAXIS history to vaccine: ${data.vaccinationHistory.adverseReactionVaccine || 'vaccine not specified'}`,
			priority: 'high'
		});
	}

	// ��── Immunocompromised (HIGH) ───────────────────────────────
	if (data.vaccinationHistory.immunocompromised === 'yes') {
		flags.push({
			id: 'FLAG-IMMUNO-001',
			category: 'Immunocompromised',
			message: `Immunocompromised: ${data.vaccinationHistory.immunocompromisedDetails || 'details not specified'} - live vaccines may be contraindicated`,
			priority: 'high'
		});
	}

	// ─── Pregnant or planning (HIGH) ────────────────────────────
	if (data.vaccinationHistory.pregnantOrPlanning === 'yes') {
		flags.push({
			id: 'FLAG-PREG-001',
			category: 'Pregnancy',
			message: 'Pregnant or planning pregnancy - live vaccines contraindicated, check individual vaccine guidance',
			priority: 'high'
		});
	}

	// ─── Egg allergy with anaphylaxis (HIGH) ────────────────────
	if (data.contraindicationsAllergies.eggAllergy === 'yes' && data.contraindicationsAllergies.eggAllergySeverity === 'anaphylaxis') {
		flags.push({
			id: 'FLAG-EGG-001',
			category: 'Allergy',
			message: 'Egg allergy with anaphylaxis - specialist advice required for egg-containing vaccines (flu, yellow fever)',
			priority: 'high'
		});
	}

	// ─── PEG/polysorbate allergy (HIGH) ────���────────────────────
	if (data.contraindicationsAllergies.pegPolysorbateAllergy === 'yes') {
		flags.push({
			id: 'FLAG-PEG-001',
			category: 'Allergy',
			message: 'PEG/polysorbate allergy - mRNA COVID vaccines may be contraindicated',
			priority: 'high'
		});
	}

	// ─── History of GBS (HIGH) ──────────────────────────────────
	if (data.contraindicationsAllergies.historyOfGBS === 'yes') {
		flags.push({
			id: 'FLAG-GBS-001',
			category: 'Contraindication',
			message: `History of Guillain-Barre Syndrome: ${data.contraindicationsAllergies.gbsDetails || 'details not specified'} - specialist review before vaccination`,
			priority: 'high'
		});
	}

	// ���── TB IGRA positive (HIGH) ────────────────────────────────
	if (data.serologyImmunityTesting.tbIGRAResult === 'positive') {
		flags.push({
			id: 'FLAG-TB-001',
			category: 'Serology',
			message: 'TB IGRA positive - latent TB investigation required, BCG contraindicated',
			priority: 'high'
		});
	}

	// ─── Hepatitis B non-immune healthcare worker (MEDIUM) ──────
	if (
		data.demographics.occupationCategory === 'healthcare' &&
		(data.occupationalVaccines.hepatitisBAntiBodyLevel === 'inadequate' ||
			data.serologyImmunityTesting.hepBSurfaceAntibody === 'negative')
	) {
		flags.push({
			id: 'FLAG-HEPB-001',
			category: 'Occupational',
			message: 'Healthcare worker with inadequate Hepatitis B immunity - occupational health review required',
			priority: 'medium'
		});
	}

	// ─── Measles non-immune (MEDIUM) ────────────────────────────
	if (data.serologyImmunityTesting.measlesIgG === 'negative') {
		flags.push({
			id: 'FLAG-MEASLES-001',
			category: 'Serology',
			message: 'Measles IgG negative - not immune, MMR vaccination recommended',
			priority: 'medium'
		});
	}

	// ─── Varicella non-immune (MEDIUM) ──────────────────────────
	if (data.serologyImmunityTesting.varicellaIgG === 'negative') {
		flags.push({
			id: 'FLAG-VZV-001',
			category: 'Serology',
			message: 'Varicella IgG negative - not immune, varicella vaccination recommended',
			priority: 'medium'
		});
	}

	// ─── On immunosuppressants (MEDIUM) ───��─────────────────────
	if (data.contraindicationsAllergies.onImmunosuppressants === 'yes') {
		flags.push({
			id: 'FLAG-IMMUNOSUPP-001',
			category: 'Medications',
			message: `On immunosuppressants: ${data.contraindicationsAllergies.immunosuppressantDetails || 'details not specified'} - timing of vaccines may need adjustment`,
			priority: 'medium'
		});
	}

	// ─── Recent blood products (MEDIUM) ─────────────────────────
	if (data.contraindicationsAllergies.onBloodProductsRecent === 'yes') {
		flags.push({
			id: 'FLAG-BLOOD-001',
			category: 'Medications',
			message: `Recent blood products: ${data.contraindicationsAllergies.bloodProductsDetails || 'details not specified'} - live vaccines may need deferral`,
			priority: 'medium'
		});
	}

	// ─── COVID adverse reaction (MEDIUM) ────────────────────────
	if (data.covid19Vaccination.covidAdverseReaction === 'yes') {
		flags.push({
			id: 'FLAG-COVIDADV-001',
			category: 'COVID-19',
			message: `COVID-19 vaccine adverse reaction: ${data.covid19Vaccination.covidAdverseReactionDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── OH clearance not granted (MEDIUM) ──────────────────────
	if (data.scheduleCompliance.occupationalHealthClearance === 'no') {
		flags.push({
			id: 'FLAG-OH-001',
			category: 'Compliance',
			message: 'Occupational health clearance NOT granted - restricted duties may apply',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
