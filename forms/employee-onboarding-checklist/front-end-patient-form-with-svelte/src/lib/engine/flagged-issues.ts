import type { AssessmentData, AdditionalFlag } from './types';
import { isDatePast } from './utils';

/**
 * Detects additional flags that should be highlighted for HR managers,
 * independent of completion percentage. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── DBS not cleared (HIGH) ─────────────────────────────────
	if (
		data.preEmploymentChecks.dbsCheckStatus === 'not-started' ||
		data.preEmploymentChecks.dbsCheckStatus === ''
	) {
		flags.push({
			id: 'FLAG-DBS-001',
			category: 'Pre-Employment',
			message: 'DBS check not started - EMPLOYEE MUST NOT START CLINICAL DUTIES',
			priority: 'high'
		});
	}

	// ─── Right to work not verified (HIGH) ──────────────────────
	if (data.preEmploymentChecks.rightToWorkVerified === 'no') {
		flags.push({
			id: 'FLAG-RTW-001',
			category: 'Pre-Employment',
			message: 'Right to work not verified - EMPLOYMENT CANNOT COMMENCE',
			priority: 'high'
		});
	}

	// ─── Right to work expiry imminent (HIGH) ───────────────────
	if (data.preEmploymentChecks.rightToWorkExpiryDate) {
		const expiry = new Date(data.preEmploymentChecks.rightToWorkExpiryDate);
		const threeMonths = new Date();
		threeMonths.setMonth(threeMonths.getMonth() + 3);
		if (expiry < threeMonths) {
			flags.push({
				id: 'FLAG-RTW-002',
				category: 'Pre-Employment',
				message: `Right to work expires ${data.preEmploymentChecks.rightToWorkExpiryDate} - renewal required`,
				priority: isDatePast(data.preEmploymentChecks.rightToWorkExpiryDate) ? 'high' : 'medium'
			});
		}
	}

	// ─── OH clearance not received (HIGH) ───────────────────────
	if (data.occupationalHealth.ohClearanceReceived === 'no') {
		flags.push({
			id: 'FLAG-OH-001',
			category: 'Occupational Health',
			message: 'Occupational health clearance not received - employee may not commence patient-facing duties',
			priority: 'high'
		});
	}

	// ─── Not fit to work (HIGH) ─────────────────────────────────
	if (data.occupationalHealth.fitToWork === 'no') {
		flags.push({
			id: 'FLAG-OH-002',
			category: 'Occupational Health',
			message: 'Employee declared NOT fit to work - CANNOT START',
			priority: 'high'
		});
	}

	// ─── OH restrictions (MEDIUM) ───────────────────────────────
	if (data.occupationalHealth.ohRestrictions === 'yes') {
		flags.push({
			id: 'FLAG-OH-003',
			category: 'Occupational Health',
			message: `Occupational health restrictions: ${data.occupationalHealth.ohRestrictionDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Professional registration not verified (HIGH) ──────────
	if (
		data.professionalRegistration.registrationRequired === 'yes' &&
		data.professionalRegistration.registrationVerified !== 'yes'
	) {
		flags.push({
			id: 'FLAG-REG-001',
			category: 'Professional Registration',
			message: `Professional registration not verified (${data.professionalRegistration.regulatoryBody || 'body not specified'}) - MUST NOT PRACTISE`,
			priority: 'high'
		});
	}

	// ─── Registration expiry (MEDIUM/HIGH) ──────────────────────
	if (data.professionalRegistration.registrationExpiryDate) {
		if (isDatePast(data.professionalRegistration.registrationExpiryDate)) {
			flags.push({
				id: 'FLAG-REG-002',
				category: 'Professional Registration',
				message: `Professional registration EXPIRED on ${data.professionalRegistration.registrationExpiryDate}`,
				priority: 'high'
			});
		}
	}

	// ─── Registration conditions (MEDIUM) ───────────────────────
	if (data.professionalRegistration.registrationConditions === 'yes') {
		flags.push({
			id: 'FLAG-REG-003',
			category: 'Professional Registration',
			message: `Registration has conditions: ${data.professionalRegistration.registrationConditionDetails || 'details not specified'}`,
			priority: 'medium'
		});
	}

	// ─── Mandatory training incomplete (MEDIUM) ─────────────────
	const trainingItems = [
		{ field: data.mandatoryTraining.fireSafetyCompleted, name: 'Fire Safety' },
		{ field: data.mandatoryTraining.infectionControlCompleted, name: 'Infection Control' },
		{ field: data.mandatoryTraining.safeguardingAdultsCompleted, name: 'Safeguarding Adults' },
		{ field: data.mandatoryTraining.safeguardingChildrenCompleted, name: 'Safeguarding Children' },
		{ field: data.mandatoryTraining.basicLifeSupportCompleted, name: 'Basic Life Support' },
		{ field: data.mandatoryTraining.informationGovernanceCompleted, name: 'Information Governance' }
	];
	const incompleteTraining = trainingItems.filter((t) => t.field === 'no');
	if (incompleteTraining.length > 0) {
		flags.push({
			id: 'FLAG-TR-001',
			category: 'Mandatory Training',
			message: `${incompleteTraining.length} mandatory training module(s) not completed: ${incompleteTraining.map((t) => t.name).join(', ')}`,
			priority: incompleteTraining.length >= 3 ? 'high' : 'medium'
		});
	}

	// ─── ID badge not issued (MEDIUM) ───────────────────────────
	if (data.uniformIDBadge.idBadgeIssued === 'no') {
		flags.push({
			id: 'FLAG-UID-001',
			category: 'Uniform & ID',
			message: 'ID badge not yet issued',
			priority: 'medium'
		});
	}

	// ─── No manager sign-off (MEDIUM) ───────────────────────────
	if (data.signOffCompliance.managerSignedOff === 'no') {
		flags.push({
			id: 'FLAG-SO-001',
			category: 'Sign-off',
			message: 'Manager sign-off not yet obtained',
			priority: 'medium'
		});
	}

	// ─── Confidentiality agreement not signed (MEDIUM) ──────────
	if (data.signOffCompliance.confidentialityAgreementSigned === 'no') {
		flags.push({
			id: 'FLAG-SO-002',
			category: 'Sign-off',
			message: 'Confidentiality agreement not signed',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
