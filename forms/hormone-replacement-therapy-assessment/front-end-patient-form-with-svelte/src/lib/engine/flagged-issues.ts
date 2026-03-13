import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of MRS score. These are safety-critical alerts for HRT prescribing.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── VTE history (HIGH) ─────────────────────────────────
	if (data.contraindicationsScreen.vteHistory === 'yes') {
		flags.push({
			id: 'FLAG-VTE-001',
			category: 'Thromboembolism',
			message: `VTE history reported${data.contraindicationsScreen.vteDetails ? ': ' + data.contraindicationsScreen.vteDetails : ''} - consider transdermal route only`,
			priority: 'high'
		});
	}

	// ─── Breast cancer history (HIGH) ───────────────────────
	if (data.contraindicationsScreen.breastCancerHistory === 'yes') {
		flags.push({
			id: 'FLAG-BREAST-001',
			category: 'Breast Cancer',
			message: `Breast cancer history${data.contraindicationsScreen.breastCancerDetails ? ': ' + data.contraindicationsScreen.breastCancerDetails : ''} - HRT generally CONTRAINDICATED`,
			priority: 'high'
		});
	}

	// ─── Undiagnosed vaginal bleeding (HIGH) ────────────────
	if (data.contraindicationsScreen.undiagnosedVaginalBleeding === 'yes') {
		flags.push({
			id: 'FLAG-BLEEDING-001',
			category: 'Vaginal Bleeding',
			message: 'Undiagnosed vaginal bleeding - MUST INVESTIGATE before commencing HRT',
			priority: 'high'
		});
	}

	// ─── Liver disease (HIGH) ───────────────────────────────
	if (data.contraindicationsScreen.liverDisease === 'yes') {
		flags.push({
			id: 'FLAG-LIVER-001',
			category: 'Hepatic',
			message: `Active liver disease${data.contraindicationsScreen.liverDiseaseDetails ? ': ' + data.contraindicationsScreen.liverDiseaseDetails : ''} - oral HRT contraindicated, consider transdermal`,
			priority: 'high'
		});
	}

	// ─── Active cardiovascular disease (HIGH) ───────────────
	if (data.contraindicationsScreen.activeCardiovascularDisease === 'yes') {
		flags.push({
			id: 'FLAG-CVD-001',
			category: 'Cardiovascular',
			message: `Active cardiovascular disease${data.contraindicationsScreen.activeCardiovascularDetails ? ': ' + data.contraindicationsScreen.activeCardiovascularDetails : ''} - HRT contraindicated`,
			priority: 'high'
		});
	}

	// ─── BRCA positive (HIGH) ───────────────────────────────
	if (data.breastHealth.brcaStatus === 'positive') {
		flags.push({
			id: 'FLAG-BRCA-001',
			category: 'Genetic Risk',
			message: `BRCA ${data.breastHealth.brcaType || ''} positive - specialist referral recommended before HRT`,
			priority: 'high'
		});
	}

	// ─── Pregnancy (HIGH) ───────────────────────────────────
	if (data.contraindicationsScreen.pregnancy === 'yes') {
		flags.push({
			id: 'FLAG-PREG-001',
			category: 'Pregnancy',
			message: 'Pregnancy reported - HRT CONTRAINDICATED',
			priority: 'high'
		});
	}

	// ─── >10 years post-menopause (MEDIUM) ──────────────────
	if (data.menopauseStatus.ageAtMenopause !== null && data.demographics.dateOfBirth) {
		const age = calculateAge(data.demographics.dateOfBirth);
		if (age !== null && data.menopauseStatus.ageAtMenopause > 0) {
			const yearsSinceMenopause = age - data.menopauseStatus.ageAtMenopause;
			if (yearsSinceMenopause > 10) {
				flags.push({
					id: 'FLAG-LATE-001',
					category: 'Timing',
					message: `>10 years post-menopause (${yearsSinceMenopause} years) - increased CVD risk with HRT initiation`,
					priority: 'medium'
				});
			}
		}
	}

	// ─── Premature ovarian insufficiency (MEDIUM) ───────────
	if (data.menopauseStatus.prematureOvarianInsufficiency === 'yes') {
		flags.push({
			id: 'FLAG-POI-001',
			category: 'Premature Menopause',
			message: 'Premature ovarian insufficiency - HRT recommended at least until average age of menopause (51)',
			priority: 'medium'
		});
	}

	// ─── Surgical menopause (MEDIUM) ────────────────────────
	if (data.menopauseStatus.surgicalMenopause === 'yes') {
		flags.push({
			id: 'FLAG-SURGICAL-001',
			category: 'Surgical Menopause',
			message: 'Surgical menopause - may require higher dose and oestrogen-only HRT if no uterus',
			priority: 'medium'
		});
	}

	// ─── Family history breast/ovarian cancer (MEDIUM) ──────
	if (data.breastHealth.familyHistoryBreastCancer === 'yes') {
		flags.push({
			id: 'FLAG-FAMHX-BREAST-001',
			category: 'Family History',
			message: 'Family history of breast cancer - discuss individual risk-benefit',
			priority: 'medium'
		});
	}

	if (data.breastHealth.familyHistoryOvarianCancer === 'yes') {
		flags.push({
			id: 'FLAG-FAMHX-OVARIAN-001',
			category: 'Family History',
			message: 'Family history of ovarian cancer - discuss individual risk-benefit',
			priority: 'medium'
		});
	}

	// ─── Osteoporosis (MEDIUM) ──────────────────────────────
	if (data.boneHealth.dexaResult === 'osteoporosis') {
		flags.push({
			id: 'FLAG-OSTEO-001',
			category: 'Bone Health',
			message: 'Osteoporosis on DEXA - HRT beneficial for bone protection, consider alongside other treatments',
			priority: 'medium'
		});
	}

	// ─── High cardiovascular risk (MEDIUM) ──────────────────
	if (
		data.cardiovascularRisk.qriskScore !== null &&
		data.cardiovascularRisk.qriskScore > 10
	) {
		flags.push({
			id: 'FLAG-QRISK-001',
			category: 'Cardiovascular',
			message: `QRISK score ${data.cardiovascularRisk.qriskScore}% - elevated cardiovascular risk, prefer transdermal HRT`,
			priority: 'medium'
		});
	}

	// ─── Current smoker (MEDIUM) ────────────────────────────
	if (data.cardiovascularRisk.smoking === 'current') {
		flags.push({
			id: 'FLAG-SMOKING-001',
			category: 'Cardiovascular',
			message: 'Current smoker - increased VTE risk with oral HRT, prefer transdermal route',
			priority: 'medium'
		});
	}

	// ─── Diabetes (MEDIUM) ──────────────────────────────────
	if (data.cardiovascularRisk.diabetes === 'yes') {
		flags.push({
			id: 'FLAG-DIABETES-001',
			category: 'Metabolic',
			message: 'Diabetes present - prefer transdermal HRT, monitor glucose control',
			priority: 'medium'
		});
	}

	// ─── Overdue mammogram (LOW) ────────────────────────────
	if (data.breastHealth.mammogramResult === 'not-done') {
		flags.push({
			id: 'FLAG-MAMMO-001',
			category: 'Breast Screening',
			message: 'No mammogram on record - recommend breast screening before commencing HRT',
			priority: 'low'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}

function calculateAge(dob: string): number | null {
	if (!dob) return null;
	const birth = new Date(dob);
	if (isNaN(birth.getTime())) return null;
	const today = new Date();
	let age = today.getFullYear() - birth.getFullYear();
	const m = today.getMonth() - birth.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
		age--;
	}
	return age;
}
