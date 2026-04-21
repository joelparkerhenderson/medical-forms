import type { AssessmentData, AdditionalFlag } from './types';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of completeness. These are safety-critical or clinically
 * significant alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Incomplete understanding ────────────────────────────
	const understanding = data.questionsUnderstanding;
	const understandingFields = [
		understanding.understandsProcedure,
		understanding.understandsRisks,
		understanding.understandsAlternatives,
		understanding.understandsRecovery
	];
	const noUnderstanding = understandingFields.filter((v) => v === 'no');
	if (noUnderstanding.length > 0) {
		flags.push({
			id: 'FLAG-UNDERSTAND-001',
			category: 'Incomplete Understanding',
			message: `Patient indicated lack of understanding on ${noUnderstanding.length} area(s) - consent may not be fully informed`,
			priority: 'high'
		});
	}

	// ─── Previous anesthesia problems ────────────────────────
	if (data.anesthesiaInformation.previousAnesthesiaProblems === 'yes') {
		const details = data.anesthesiaInformation.previousAnesthesiaDetails || 'details not specified';
		flags.push({
			id: 'FLAG-ANESTH-001',
			category: 'Anesthesia Risk',
			message: `Previous anesthesia problems reported: ${details} - anesthesia team must be notified`,
			priority: 'high'
		});
	}

	// ─── High-risk procedure indicators ──────────────────────
	const seriousRisks = data.risksBenefits.seriousRisks.toLowerCase();
	if (
		seriousRisks.includes('death') ||
		seriousRisks.includes('permanent') ||
		seriousRisks.includes('paralysis') ||
		seriousRisks.includes('organ failure')
	) {
		flags.push({
			id: 'FLAG-HIGHRISK-001',
			category: 'High-Risk Procedure',
			message: 'Serious risks include life-threatening or permanent outcomes - ensure thorough informed consent discussion',
			priority: 'high'
		});
	}

	// ─── Missing acknowledgements ────────────────────────────
	const rights = data.patientRights;
	const missingAcknowledgements: string[] = [];
	if (rights.rightToWithdraw !== 'yes') missingAcknowledgements.push('right to withdraw');
	if (rights.rightToSecondOpinion !== 'yes') missingAcknowledgements.push('right to second opinion');
	if (rights.informedVoluntarily !== 'yes') missingAcknowledgements.push('voluntary consent');
	if (rights.noGuaranteeAcknowledged !== 'yes') missingAcknowledgements.push('no guarantee');

	if (missingAcknowledgements.length > 0) {
		flags.push({
			id: 'FLAG-RIGHTS-001',
			category: 'Missing Acknowledgements',
			message: `Patient has not acknowledged: ${missingAcknowledgements.join(', ')}`,
			priority: 'high'
		});
	}

	// ─── Patient concerns noted ──────────────────────────────
	if (data.questionsUnderstanding.additionalConcerns.trim().length > 0) {
		flags.push({
			id: 'FLAG-CONCERNS-001',
			category: 'Patient Concerns',
			message: `Patient has documented additional concerns: "${data.questionsUnderstanding.additionalConcerns.trim()}"`,
			priority: 'medium'
		});
	}

	// ─── Interpreter needed but not documented ───────────────
	if (data.signatureConsent.interpreterUsed === 'yes' && !data.signatureConsent.interpreterName.trim()) {
		flags.push({
			id: 'FLAG-INTERPRETER-001',
			category: 'Interpreter Documentation',
			message: 'Interpreter was used but interpreter name has not been documented',
			priority: 'high'
		});
	}

	// ─── Patient consent not given ───────────────────────────
	if (data.signatureConsent.patientConsent === 'no') {
		flags.push({
			id: 'FLAG-NOCONSENT-001',
			category: 'Consent Refused',
			message: 'Patient has explicitly declined to give consent',
			priority: 'high'
		});
	}

	// ─── General anesthesia with admission not required ──────
	if (
		data.anesthesiaInformation.anesthesiaType === 'general' &&
		data.procedureDetails.admissionRequired === 'no'
	) {
		flags.push({
			id: 'FLAG-ADMISSION-001',
			category: 'Admission Review',
			message: 'General anesthesia planned but admission not marked as required - please verify',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
