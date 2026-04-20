import type { AssessmentData, AdditionalFlag } from './types';
import { calculateAuditScore, calculateDastScore } from './utils';

/**
 * Detects additional flags that should be highlighted for the clinician,
 * independent of AUDIT/DAST scoring. These are safety-critical alerts.
 */
export function detectAdditionalFlags(data: AssessmentData): AdditionalFlag[] {
	const flags: AdditionalFlag[] = [];

	// ─── Active withdrawal (HIGH) ──────────────────────────────
	if (data.withdrawalAssessment.currentlyInWithdrawal === 'yes') {
		flags.push({
			id: 'FLAG-WD-001',
			category: 'Withdrawal',
			message: `Active withdrawal from ${data.withdrawalAssessment.withdrawalSubstance || 'substance not specified'} - IMMEDIATE MEDICAL ASSESSMENT REQUIRED`,
			priority: 'high'
		});
	}

	// ─── Seizure history (HIGH) ────────────────────────────────
	if (data.withdrawalAssessment.seizureHistory === 'yes') {
		flags.push({
			id: 'FLAG-WD-002',
			category: 'Withdrawal',
			message: 'History of withdrawal seizures - HIGH RISK for complicated withdrawal',
			priority: 'high'
		});
	}

	// ─── Delirium tremens history (HIGH) ───────────────────────
	if (data.withdrawalAssessment.deliriumTremensHistory === 'yes') {
		flags.push({
			id: 'FLAG-WD-003',
			category: 'Withdrawal',
			message: 'History of delirium tremens - INPATIENT DETOX RECOMMENDED',
			priority: 'high'
		});
	}

	// ─── Current suicidal ideation (HIGH) ──────────────────────
	if (data.mentalHealthComorbidities.suicidalIdeationCurrent === 'yes') {
		flags.push({
			id: 'FLAG-SI-001',
			category: 'Suicidality',
			message: 'CURRENT SUICIDAL IDEATION - URGENT SAFETY ASSESSMENT REQUIRED',
			priority: 'high'
		});
	}

	// ─── Previous suicide attempts (HIGH) ──────────────────────
	if (data.mentalHealthComorbidities.previousSuicideAttempts === 'yes') {
		flags.push({
			id: 'FLAG-SI-002',
			category: 'Suicidality',
			message: 'History of suicide attempts - elevated risk',
			priority: 'high'
		});
	}

	// ─── Overdose history (HIGH) ───────────────────────────────
	if (data.physicalHealthImpact.overdoseHistory === 'yes') {
		flags.push({
			id: 'FLAG-OD-001',
			category: 'Overdose',
			message: `Previous overdose(s): ${data.physicalHealthImpact.overdoseCount ?? '?'} episode(s) - naloxone provision recommended`,
			priority: 'high'
		});
	}

	// ─── Children safeguarding (HIGH) ──────────────────────────
	if (data.socialLegalImpact.childrenSafeguardingConcerns === 'yes') {
		flags.push({
			id: 'FLAG-SG-001',
			category: 'Safeguarding',
			message: 'CHILDREN SAFEGUARDING CONCERNS - mandatory reporting may apply',
			priority: 'high'
		});
	}

	// ─── Domestic violence (HIGH) ──────────────────────────────
	if (data.socialLegalImpact.domesticViolence === 'yes') {
		flags.push({
			id: 'FLAG-DV-001',
			category: 'Safeguarding',
			message: `Domestic violence: ${data.socialLegalImpact.domesticViolenceDetails || 'details not specified'} - safety planning required`,
			priority: 'high'
		});
	}

	// ─── Needle sharing (HIGH) ─────────────────────────────────
	if (data.substanceUseHistory.needleSharing === 'yes') {
		flags.push({
			id: 'FLAG-BBV-001',
			category: 'Blood-Borne Viruses',
			message: 'Needle sharing reported - BBV screening required (HIV, Hep B, Hep C)',
			priority: 'high'
		});
	}

	// ─── AUDIT dependence likely (HIGH) ────────────────────────
	const auditScore = calculateAuditScore(data.alcoholUseAudit);
	if (auditScore >= 20) {
		flags.push({
			id: 'FLAG-AUDIT-001',
			category: 'Alcohol',
			message: `AUDIT score ${auditScore}/40 - alcohol dependence likely, specialist referral recommended`,
			priority: 'high'
		});
	}

	// ─── DAST severe (HIGH) ────────────────────────────────────
	const dastScore = calculateDastScore(data.drugUseDast);
	if (dastScore >= 9) {
		flags.push({
			id: 'FLAG-DAST-001',
			category: 'Drug',
			message: `DAST score ${dastScore}/10 - severe drug problem, intensive treatment needed`,
			priority: 'high'
		});
	}

	// ─── IV drug use (MEDIUM) ──────────────────────────────────
	if (data.substanceUseHistory.ivDrugUse === 'yes') {
		flags.push({
			id: 'FLAG-IV-001',
			category: 'Substance History',
			message: 'Intravenous drug use - BBV screening and harm reduction advice',
			priority: 'medium'
		});
	}

	// ─── Psychosis (MEDIUM) ────────────────────────────────────
	if (data.mentalHealthComorbidities.psychosis === 'yes') {
		flags.push({
			id: 'FLAG-MH-001',
			category: 'Mental Health',
			message: 'Psychosis - dual diagnosis assessment recommended',
			priority: 'medium'
		});
	}

	// ─── Liver cirrhosis (MEDIUM) ──────────────────────────────
	if (
		data.physicalHealthImpact.liverDisease === 'yes' &&
		data.physicalHealthImpact.liverDiseaseType === 'cirrhosis'
	) {
		flags.push({
			id: 'FLAG-LIVER-001',
			category: 'Physical Health',
			message: 'Liver cirrhosis - alcohol abstinence essential, hepatology referral',
			priority: 'medium'
		});
	}

	// ─── Homelessness (MEDIUM) ─────────────────────────────────
	if (data.socialLegalImpact.housingStatus === 'homeless') {
		flags.push({
			id: 'FLAG-HOUSING-001',
			category: 'Social',
			message: 'Homeless - housing support and assertive outreach recommended',
			priority: 'medium'
		});
	}

	// ─── Self-harm history (MEDIUM) ────────────────────────────
	if (data.mentalHealthComorbidities.selfHarmHistory === 'yes') {
		flags.push({
			id: 'FLAG-SH-001',
			category: 'Mental Health',
			message: 'History of self-harm - risk assessment and monitoring',
			priority: 'medium'
		});
	}

	// Sort: high > medium > low
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	flags.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	return flags;
}
