import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the gynaecologist,
 * independent of symptom score. These are safety-critical or clinically
 * significant alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Abnormal bleeding ────────────────────────────────
	if (
		data.gynecologicalSymptoms.abnormalBleeding !== null &&
		data.gynecologicalSymptoms.abnormalBleeding >= 2
	) {
		flags.push({
			id: 'FLAG-BLEED-001',
			category: 'Abnormal Bleeding',
			message: 'Moderate to severe abnormal bleeding reported - investigate for endometrial pathology',
			priority: 'high'
		});
	}

	// ─── Post-menopausal bleeding ────────────────────────
	if (
		data.demographics.menopausalStatus === 'post-menopausal' &&
		data.gynecologicalSymptoms.abnormalBleeding !== null &&
		data.gynecologicalSymptoms.abnormalBleeding > 0
	) {
		flags.push({
			id: 'FLAG-PMB-001',
			category: 'Post-menopausal Bleeding',
			message: 'Post-menopausal bleeding detected - urgent referral for endometrial assessment required',
			priority: 'high'
		});
	}

	// ─── Overdue cervical screening ──────────────────────
	if (data.cervicalScreening.lastSmearDate) {
		const lastSmear = new Date(data.cervicalScreening.lastSmearDate);
		const threeYearsAgo = new Date();
		threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
		if (lastSmear < threeYearsAgo) {
			flags.push({
				id: 'FLAG-SCREEN-001',
				category: 'Overdue Screening',
				message: 'Cervical screening overdue (>3 years since last smear) - recommend scheduling',
				priority: 'medium'
			});
		}
	} else {
		flags.push({
			id: 'FLAG-SCREEN-002',
			category: 'Overdue Screening',
			message: 'No cervical screening date recorded - confirm screening status',
			priority: 'medium'
		});
	}

	// ─── Abnormal smear result ───────────────────────────
	if (data.cervicalScreening.lastSmearResult === 'abnormal') {
		flags.push({
			id: 'FLAG-SMEAR-001',
			category: 'Abnormal Smear',
			message: 'Previous abnormal cervical smear result - ensure follow-up colposcopy completed',
			priority: 'high'
		});
	}

	// ─── STI risk ────────────────────────────────────────
	if (data.sexualHealth.stiHistory === 'yes') {
		flags.push({
			id: 'FLAG-STI-001',
			category: 'STI Risk',
			message: `History of sexually transmitted infections: ${data.sexualHealth.stiDetails || 'details not specified'} - consider repeat screening`,
			priority: 'medium'
		});
	}

	// ─── Pregnancy concerns ──────────────────────────────
	if (
		data.obstetricHistory.complications &&
		data.obstetricHistory.complications.trim() !== ''
	) {
		flags.push({
			id: 'FLAG-PREG-001',
			category: 'Pregnancy Concerns',
			message: `Previous obstetric complications noted: ${data.obstetricHistory.complications}`,
			priority: 'medium'
		});
	}

	// ─── Pelvic mass suspicion ───────────────────────────
	if (
		data.gynecologicalSymptoms.pelvicPain !== null &&
		data.gynecologicalSymptoms.pelvicPain >= 2 &&
		data.menstrualHistory.flowHeaviness === 'very-heavy'
	) {
		flags.push({
			id: 'FLAG-MASS-001',
			category: 'Pelvic Mass Suspicion',
			message: 'Combination of significant pelvic pain and very heavy flow - investigate for fibroids or ovarian pathology',
			priority: 'high'
		});
	}

	// ─── Autoimmune disease ──────────────────────────────
	if (data.medicalHistory.autoimmuneDiseases === 'yes') {
		flags.push({
			id: 'FLAG-AUTOIMMUNE-001',
			category: 'Autoimmune Disease',
			message: `Autoimmune disease present: ${data.medicalHistory.autoimmuneDiseaseDetails || 'details not specified'} - consider systemic involvement`,
			priority: 'medium'
		});
	}

	// ─── Family history of ovarian cancer ────────────────
	if (data.familyHistory.ovarianCancer === 'yes') {
		flags.push({
			id: 'FLAG-FAMILY-OV-001',
			category: 'Family History',
			message: 'Family history of ovarian cancer - consider BRCA testing and enhanced surveillance',
			priority: 'high'
		});
	}

	// ─── Family history of breast cancer ─────────────────
	if (data.familyHistory.breastCancer === 'yes') {
		flags.push({
			id: 'FLAG-FAMILY-BR-001',
			category: 'Family History',
			message: 'Family history of breast cancer - assess BRCA risk and mammography schedule',
			priority: 'high'
		});
	}

	// ─── Family history of cervical cancer ───────────────
	if (data.familyHistory.cervicalCancer === 'yes') {
		flags.push({
			id: 'FLAG-FAMILY-CX-001',
			category: 'Family History',
			message: 'Family history of cervical cancer - ensure regular screening compliance',
			priority: 'medium'
		});
	}

	// ─── Endometriosis family history ────────────────────
	if (data.familyHistory.endometriosis === 'yes') {
		flags.push({
			id: 'FLAG-FAMILY-ENDO-001',
			category: 'Family History',
			message: 'Family history of endometriosis - monitor for symptoms and consider early investigation',
			priority: 'low'
		});
	}

	// ─── PCOS family history ─────────────────────────────
	if (data.familyHistory.pcos === 'yes') {
		flags.push({
			id: 'FLAG-FAMILY-PCOS-001',
			category: 'Family History',
			message: 'Family history of PCOS - consider metabolic screening and hormonal assessment',
			priority: 'low'
		});
	}

	// ─── No HPV vaccination ──────────────────────────────
	if (data.cervicalScreening.hpvVaccination === 'none') {
		flags.push({
			id: 'FLAG-HPV-001',
			category: 'Vaccination',
			message: 'No HPV vaccination received - discuss vaccination if age-appropriate',
			priority: 'low'
		});
	}

	// ─── Worsening symptoms ──────────────────────────────
	if (data.chiefComplaint.progression === 'worsening') {
		flags.push({
			id: 'FLAG-PROG-001',
			category: 'Symptom Progression',
			message: 'Symptoms reported as worsening - prioritise investigation',
			priority: 'high'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
