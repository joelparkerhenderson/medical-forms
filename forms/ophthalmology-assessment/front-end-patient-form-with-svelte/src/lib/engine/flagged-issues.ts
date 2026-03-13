import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the ophthalmologist,
 * independent of VA grade. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Sudden vision loss ─────────────────────────────────
	if (data.chiefComplaint.onsetType === 'sudden') {
		flags.push({
			id: 'FLAG-VISION-001',
			category: 'Vision Loss',
			message: 'Sudden onset of visual symptoms - urgent assessment required',
			priority: 'high'
		});
	}

	// ─── Raised IOP ─────────────────────────────────────────
	const maxIop = Math.max(
		data.anteriorSegment.iopRight ?? 0,
		data.anteriorSegment.iopLeft ?? 0
	);
	if (maxIop > 21 && maxIop <= 30) {
		flags.push({
			id: 'FLAG-IOP-001',
			category: 'Intraocular Pressure',
			message: `Raised IOP detected (${maxIop} mmHg) - monitor for glaucoma`,
			priority: 'medium'
		});
	}
	if (maxIop > 30) {
		flags.push({
			id: 'FLAG-IOP-002',
			category: 'Intraocular Pressure',
			message: `Significantly raised IOP (${maxIop} mmHg) - urgent treatment required`,
			priority: 'high'
		});
	}

	// ─── RAPD ───────────────────────────────────────────────
	if (data.visualFieldPupils.rapdPresent === 'yes') {
		flags.push({
			id: 'FLAG-RAPD-001',
			category: 'Pupils',
			message: `Relative afferent pupillary defect (RAPD) in ${data.visualFieldPupils.rapdEye || 'unspecified'} eye - investigate optic nerve pathology`,
			priority: 'high'
		});
	}

	// ─── Retinal detachment signs ───────────────────────────
	if (
		data.posteriorSegment.fundusNormal === 'no' &&
		data.posteriorSegment.vitreousNormal === 'no'
	) {
		flags.push({
			id: 'FLAG-RETINA-001',
			category: 'Retina',
			message: 'Combined fundus and vitreous abnormality - assess for retinal detachment',
			priority: 'high'
		});
	}

	if (
		data.chiefComplaint.onsetType === 'sudden' &&
		(data.chiefComplaint.primaryConcern.toLowerCase().includes('flash') ||
			data.chiefComplaint.primaryConcern.toLowerCase().includes('floater') ||
			data.chiefComplaint.primaryConcern.toLowerCase().includes('curtain') ||
			data.chiefComplaint.primaryConcern.toLowerCase().includes('shadow'))
	) {
		flags.push({
			id: 'FLAG-RETINA-002',
			category: 'Retina',
			message: 'Symptoms suggestive of retinal detachment (flashes/floaters/curtain) - urgent assessment',
			priority: 'high'
		});
	}

	// ─── Diabetic retinopathy ───────────────────────────────
	if (data.systemicConditions.diabeticRetinopathy === 'yes') {
		if (
			data.systemicConditions.diabeticRetinopathyStage === 'pre-proliferative' ||
			data.systemicConditions.diabeticRetinopathyStage === 'proliferative'
		) {
			flags.push({
				id: 'FLAG-DR-001',
				category: 'Diabetic Retinopathy',
				message: `${data.systemicConditions.diabeticRetinopathyStage === 'proliferative' ? 'Proliferative' : 'Pre-proliferative'} diabetic retinopathy - consider laser/anti-VEGF referral`,
				priority: 'high'
			});
		} else if (data.systemicConditions.diabeticRetinopathyStage === 'maculopathy') {
			flags.push({
				id: 'FLAG-DR-002',
				category: 'Diabetic Retinopathy',
				message: 'Diabetic maculopathy detected - assess for treatment',
				priority: 'high'
			});
		} else {
			flags.push({
				id: 'FLAG-DR-003',
				category: 'Diabetic Retinopathy',
				message: 'Background diabetic retinopathy - annual screening recommended',
				priority: 'medium'
			});
		}
	}

	// ─── Optic disc abnormality ─────────────────────────────
	if (data.posteriorSegment.opticDiscNormal === 'no') {
		flags.push({
			id: 'FLAG-DISC-001',
			category: 'Optic Disc',
			message: `Abnormal optic disc: ${data.posteriorSegment.opticDiscDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Visual field defect ────────────────────────────────
	if (
		data.visualFieldPupils.visualFieldResultRight === 'abnormal' ||
		data.visualFieldPupils.visualFieldResultLeft === 'abnormal'
	) {
		flags.push({
			id: 'FLAG-VF-001',
			category: 'Visual Field',
			message: 'Visual field defect detected - assess for glaucoma/neurological cause',
			priority: 'medium'
		});
	}

	// ─── Ophthalmic drug allergies ──────────────────────────
	for (const [i, allergy] of data.currentMedications.ophthalmicDrugAllergies.entries()) {
		if (allergy.severity === 'anaphylaxis') {
			flags.push({
				id: `FLAG-ALLERGY-ANAPH-${i}`,
				category: 'Allergy',
				message: `ANAPHYLAXIS history to ophthalmic drug: ${allergy.allergen}`,
				priority: 'high'
			});
		}
	}

	if (data.currentMedications.ophthalmicDrugAllergies.length > 0) {
		flags.push({
			id: 'FLAG-ALLERGY-001',
			category: 'Allergy',
			message: `${data.currentMedications.ophthalmicDrugAllergies.length} ophthalmic drug allergy/allergies documented`,
			priority: 'medium'
		});
	}

	// ─── Previous eye surgery ───────────────────────────────
	if (data.ocularHistory.previousEyeSurgery === 'yes') {
		flags.push({
			id: 'FLAG-SURGERY-001',
			category: 'Ocular History',
			message: `Previous eye surgery: ${data.ocularHistory.previousEyeSurgeryDetails || 'details not specified'}`,
			priority: 'low'
		});
	}

	// ─── Thyroid eye disease ────────────────────────────────
	if (data.systemicConditions.thyroidEyeDisease === 'yes') {
		flags.push({
			id: 'FLAG-TED-001',
			category: 'Systemic',
			message: 'Thyroid eye disease - monitor for proptosis, diplopia, optic nerve compression',
			priority: 'medium'
		});
	}

	// ─── Falls risk ─────────────────────────────────────────
	if (data.functionalImpact.fallsRisk === 'yes') {
		flags.push({
			id: 'FLAG-FALLS-001',
			category: 'Functional',
			message: 'Falls risk related to visual impairment - consider occupational therapy referral',
			priority: 'medium'
		});
	}

	// ─── Colour vision defect ───────────────────────────────
	if (data.visualFieldPupils.colourVisionNormal === 'no') {
		flags.push({
			id: 'FLAG-COLOUR-001',
			category: 'Visual Function',
			message: 'Colour vision defect - may indicate optic nerve pathology',
			priority: 'medium'
		});
	}

	// ─── Anterior chamber abnormality ───────────────────────
	if (data.anteriorSegment.anteriorChamberNormal === 'no') {
		flags.push({
			id: 'FLAG-AC-001',
			category: 'Anterior Segment',
			message: `Anterior chamber abnormality: ${data.anteriorSegment.anteriorChamberDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
