import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the audiologist,
 * independent of hearing grade. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Sudden hearing loss (HIGH) ─────────────────────────
	if (data.chiefComplaint.onset === 'sudden') {
		flags.push({
			id: 'FLAG-SUDDEN-001',
			category: 'Urgent',
			message: 'Sudden onset hearing loss - requires urgent ENT referral within 72 hours',
			priority: 'high'
		});
	}

	// ─── Asymmetric hearing loss (HIGH - suspect acoustic neuroma) ─
	if (
		data.audiometricResults.pureToneAverageRight !== null &&
		data.audiometricResults.pureToneAverageLeft !== null
	) {
		const diff = Math.abs(
			data.audiometricResults.pureToneAverageRight -
				data.audiometricResults.pureToneAverageLeft
		);
		if (diff > 15) {
			flags.push({
				id: 'FLAG-ASYMM-001',
				category: 'Retrocochlear',
				message: `Asymmetric hearing loss (${diff} dB difference) - suspect acoustic neuroma, consider MRI`,
				priority: 'high'
			});
		}
	}

	// ─── Vertigo with hearing loss (HIGH) ────────────────────
	if (
		data.vestibularSymptoms.vertigo === 'yes' &&
		(data.audiometricResults.pureToneAverageRight !== null &&
			data.audiometricResults.pureToneAverageRight > 25) ||
		(data.audiometricResults.pureToneAverageLeft !== null &&
			data.audiometricResults.pureToneAverageLeft > 25)
	) {
		if (data.vestibularSymptoms.vertigo === 'yes') {
			flags.push({
				id: 'FLAG-VERTIGO-001',
				category: 'Vestibular',
				message: 'Vertigo with hearing loss - evaluate for Meniere\'s disease or vestibular schwannoma',
				priority: 'high'
			});
		}
	}

	// ─── Ototoxic medication use (MEDIUM) ────────────────────
	if (data.medicalHistory.ototoxicMedications === 'yes') {
		flags.push({
			id: 'FLAG-OTOTOXIC-001',
			category: 'Medication',
			message: `Ototoxic medication use: ${data.medicalHistory.ototoxicMedicationDetails || 'details not specified'} - monitor audiometry`,
			priority: 'medium'
		});
	}

	// ─── Pulsatile tinnitus (HIGH) ──────────────────────────
	if (
		data.tinnitusAssessment.presence === 'yes' &&
		data.tinnitusAssessment.character === 'pulsatile'
	) {
		flags.push({
			id: 'FLAG-PULSATILE-001',
			category: 'Vascular',
			message: 'Pulsatile tinnitus - requires vascular imaging to rule out vascular pathology',
			priority: 'high'
		});
	}

	// ─── Acoustic neuroma diagnosed ─────────────────────────
	if (data.medicalHistory.acousticNeuroma === 'yes') {
		flags.push({
			id: 'FLAG-NEUROMA-001',
			category: 'Retrocochlear',
			message: 'Known acoustic neuroma - monitor for progressive hearing loss',
			priority: 'high'
		});
	}

	// ─── Meniere's disease ──────────────────────────────────
	if (data.medicalHistory.menieres === 'yes') {
		flags.push({
			id: 'FLAG-MENIERES-001',
			category: 'Medical',
			message: 'Meniere\'s disease - fluctuating hearing loss expected, salt restriction advised',
			priority: 'medium'
		});
	}

	// ─── Ear discharge ──────────────────────────────────────
	if (
		data.otoscopicFindings.dischargeRight === 'yes' ||
		data.otoscopicFindings.dischargeLeft === 'yes'
	) {
		flags.push({
			id: 'FLAG-DISCHARGE-001',
			category: 'Otoscopic',
			message: 'Active ear discharge - evaluate for infection, defer hearing aid fitting',
			priority: 'medium'
		});
	}

	// ─── Tympanic membrane abnormality ──────────────────────
	if (
		data.otoscopicFindings.tympanicMembraneRight !== '' &&
		data.otoscopicFindings.tympanicMembraneRight !== 'normal' &&
		data.otoscopicFindings.tympanicMembraneRight !== ''
	) {
		flags.push({
			id: 'FLAG-TM-RIGHT-001',
			category: 'Otoscopic',
			message: `Right tympanic membrane: ${data.otoscopicFindings.tympanicMembraneRight}`,
			priority: 'medium'
		});
	}

	if (
		data.otoscopicFindings.tympanicMembraneLeft !== '' &&
		data.otoscopicFindings.tympanicMembraneLeft !== 'normal' &&
		data.otoscopicFindings.tympanicMembraneLeft !== ''
	) {
		flags.push({
			id: 'FLAG-TM-LEFT-001',
			category: 'Otoscopic',
			message: `Left tympanic membrane: ${data.otoscopicFindings.tympanicMembraneLeft}`,
			priority: 'medium'
		});
	}

	// ─── Autoimmune condition ───────────────────────────────
	if (data.medicalHistory.autoimmune === 'yes') {
		flags.push({
			id: 'FLAG-AUTOIMMUNE-001',
			category: 'Medical',
			message: `Autoimmune condition: ${data.medicalHistory.autoimmuneDetails || 'details not specified'} - may contribute to sensorineural hearing loss`,
			priority: 'medium'
		});
	}

	// ─── Significant tinnitus impact ────────────────────────
	if (
		data.tinnitusAssessment.presence === 'yes' &&
		data.tinnitusAssessment.tinnitusHandicapInventoryScore !== null &&
		data.tinnitusAssessment.tinnitusHandicapInventoryScore > 56
	) {
		flags.push({
			id: 'FLAG-TINNITUS-SEVERE-001',
			category: 'Tinnitus',
			message: `Severe tinnitus handicap (THI score: ${data.tinnitusAssessment.tinnitusHandicapInventoryScore}) - consider tinnitus retraining therapy`,
			priority: 'medium'
		});
	}

	// ─── Falls risk ─────────────────────────────────────────
	if (data.vestibularSymptoms.fallsHistory === 'yes') {
		flags.push({
			id: 'FLAG-FALLS-001',
			category: 'Vestibular',
			message: 'Falls history - assess for vestibular rehabilitation and fall prevention',
			priority: 'medium'
		});
	}

	// ─── Noise exposure ─────────────────────────────────────
	if (data.hearingHistory.occupationalNoise === 'yes') {
		flags.push({
			id: 'FLAG-NOISE-001',
			category: 'Prevention',
			message: 'Occupational noise exposure - recommend hearing protection and monitoring',
			priority: 'low'
		});
	}

	// ─── Ear wax impaction ──────────────────────────────────
	if (
		data.otoscopicFindings.earWaxRight === 'yes' ||
		data.otoscopicFindings.earWaxLeft === 'yes'
	) {
		flags.push({
			id: 'FLAG-CERUMEN-001',
			category: 'Otoscopic',
			message: 'Ear wax present - may need removal before accurate audiometry or hearing aid fitting',
			priority: 'low'
		});
	}

	// ─── Previous ear surgery ───────────────────────────────
	if (data.otoscopicFindings.previousSurgery === 'yes') {
		flags.push({
			id: 'FLAG-SURGERY-001',
			category: 'Otoscopic',
			message: `Previous ear surgery: ${data.otoscopicFindings.previousSurgeryDetails || 'details not specified'}`,
			priority: 'low'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
