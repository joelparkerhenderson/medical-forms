import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the anaesthetist,
 * independent of ASA grade. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Airway alerts ───────────────────────────────────────
	if (data.musculoskeletalAirway.previousDifficultAirway === 'yes') {
		flags.push({
			id: 'FLAG-AIRWAY-001',
			category: 'Airway',
			message: 'Previous difficult airway reported',
			priority: 'high'
		});
	}

	if (data.musculoskeletalAirway.limitedMouthOpening === 'yes') {
		flags.push({
			id: 'FLAG-AIRWAY-002',
			category: 'Airway',
			message: 'Limited mouth opening',
			priority: 'high'
		});
	}

	if (data.musculoskeletalAirway.limitedNeckMovement === 'yes') {
		flags.push({
			id: 'FLAG-AIRWAY-003',
			category: 'Airway',
			message: 'Limited neck movement',
			priority: 'high'
		});
	}

	if (
		data.musculoskeletalAirway.mallampatiScore === '3' ||
		data.musculoskeletalAirway.mallampatiScore === '4'
	) {
		flags.push({
			id: 'FLAG-AIRWAY-004',
			category: 'Airway',
			message: `Mallampati Class ${data.musculoskeletalAirway.mallampatiScore}`,
			priority: 'high'
		});
	}

	if (data.musculoskeletalAirway.cervicalSpineIssues === 'yes') {
		flags.push({
			id: 'FLAG-AIRWAY-005',
			category: 'Airway',
			message: 'Cervical spine issues - consider C-spine precautions',
			priority: 'medium'
		});
	}

	if (data.musculoskeletalAirway.rheumatoidArthritis === 'yes') {
		flags.push({
			id: 'FLAG-AIRWAY-006',
			category: 'Airway',
			message: 'Rheumatoid arthritis - assess atlanto-axial stability',
			priority: 'medium'
		});
	}

	// ─── Allergy alerts ──────────────────────────────────────
	for (const [i, allergy] of data.allergies.entries()) {
		if (allergy.severity === 'anaphylaxis') {
			flags.push({
				id: `FLAG-ALLERGY-ANAPH-${i}`,
				category: 'Allergy',
				message: `ANAPHYLAXIS history: ${allergy.allergen}`,
				priority: 'high'
			});
		}
	}

	if (data.allergies.length > 0) {
		flags.push({
			id: 'FLAG-ALLERGY-001',
			category: 'Allergy',
			message: `${data.allergies.length} allergy/allergies documented`,
			priority: 'medium'
		});
	}

	// ─── Anticoagulant alerts ────────────────────────────────
	if (data.haematological.onAnticoagulants === 'yes') {
		flags.push({
			id: 'FLAG-ANTICOAG-001',
			category: 'Anticoagulation',
			message: `On anticoagulants: ${data.haematological.anticoagulantType || 'type not specified'}`,
			priority: 'high'
		});
	}

	if (data.haematological.bleedingDisorder === 'yes') {
		flags.push({
			id: 'FLAG-HAEM-001',
			category: 'Haematological',
			message: 'Bleeding disorder reported',
			priority: 'high'
		});
	}

	// ─── Malignant hyperthermia ──────────────────────────────
	if (data.previousAnaesthesia.familyMHHistory === 'yes') {
		flags.push({
			id: 'FLAG-MH-001',
			category: 'Malignant Hyperthermia',
			message: 'Family history of malignant hyperthermia - AVOID TRIGGERS',
			priority: 'high'
		});
	}

	if (data.previousAnaesthesia.anaesthesiaProblems === 'yes') {
		flags.push({
			id: 'FLAG-ANAES-001',
			category: 'Previous Anaesthesia',
			message: `Previous anaesthesia problems: ${data.previousAnaesthesia.anaesthesiaProblemDetails || 'details not specified'}`,
			priority: 'high'
		});
	}

	// ─── Cardiac alerts ──────────────────────────────────────
	if (data.cardiovascular.pacemaker === 'yes') {
		flags.push({
			id: 'FLAG-CARDIAC-001',
			category: 'Cardiac',
			message: 'Pacemaker/ICD in situ - check device, magnet availability',
			priority: 'high'
		});
	}

	if (data.cardiovascular.recentMI === 'yes') {
		flags.push({
			id: 'FLAG-CARDIAC-002',
			category: 'Cardiac',
			message: `Recent MI (${data.cardiovascular.recentMIWeeks ?? '?'} weeks ago)`,
			priority: 'high'
		});
	}

	// ─── Aspiration risk ─────────────────────────────────────
	if (data.gastrointestinal.gord === 'yes' || data.gastrointestinal.hiatusHernia === 'yes') {
		flags.push({
			id: 'FLAG-GI-001',
			category: 'Aspiration Risk',
			message: 'GORD/hiatus hernia - aspiration risk, consider RSI',
			priority: 'medium'
		});
	}

	// ─── OSA ─────────────────────────────────────────────────
	if (data.respiratory.osa === 'yes') {
		flags.push({
			id: 'FLAG-OSA-001',
			category: 'Respiratory',
			message: `OSA${data.respiratory.osaCPAP === 'yes' ? ' (on CPAP)' : ' (no CPAP)'} - post-op monitoring`,
			priority: 'medium'
		});
	}

	// ─── Pregnancy ───────────────────────────────────────────
	if (data.pregnancy.possiblyPregnant === 'yes') {
		flags.push({
			id: 'FLAG-PREG-001',
			category: 'Pregnancy',
			message: data.pregnancy.pregnancyConfirmed === 'yes'
				? `Confirmed pregnancy (${data.pregnancy.gestationWeeks ?? '?'} weeks)`
				: 'Possible pregnancy - confirm before proceeding',
			priority: 'high'
		});
	}

	// ─── Sickle cell ─────────────────────────────────────────
	if (data.haematological.sickleCellDisease === 'yes') {
		flags.push({
			id: 'FLAG-SICKLE-001',
			category: 'Haematological',
			message: 'Sickle cell disease - avoid hypoxia, hypothermia, dehydration',
			priority: 'high'
		});
	}

	// ─── URTI ────────────────────────────────────────────────
	if (data.respiratory.recentURTI === 'yes') {
		flags.push({
			id: 'FLAG-URTI-001',
			category: 'Respiratory',
			message: 'Recent URTI - consider postponing elective surgery',
			priority: 'medium'
		});
	}

	// ─── Insulin ─────────────────────────────────────────────
	if (data.endocrine.diabetesOnInsulin === 'yes') {
		flags.push({
			id: 'FLAG-INSULIN-001',
			category: 'Endocrine',
			message: 'On insulin - perioperative glucose management plan needed',
			priority: 'medium'
		});
	}

	// ─── Adrenal ─────────────────────────────────────────────
	if (data.endocrine.adrenalInsufficiency === 'yes') {
		flags.push({
			id: 'FLAG-ADRENAL-001',
			category: 'Endocrine',
			message: 'Adrenal insufficiency - stress-dose steroids may be required',
			priority: 'high'
		});
	}

	// ─── Dental ──────────────────────────────────────────────
	if (data.musculoskeletalAirway.dentalIssues === 'yes') {
		flags.push({
			id: 'FLAG-DENTAL-001',
			category: 'Airway',
			message: `Dental issues: ${data.musculoskeletalAirway.dentalDetails || 'details not specified'}`,
			priority: 'low'
		});
	}

	// ─── Emergency surgery ───────────────────────────────────
	if (data.demographics.procedureUrgency === 'emergency') {
		flags.push({
			id: 'FLAG-EMERG-001',
			category: 'Procedure',
			message: 'Emergency procedure - limited time for optimisation',
			priority: 'high'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
