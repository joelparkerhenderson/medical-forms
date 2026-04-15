// ──────────────────────────────────────────────
// Core care privacy notice data types
// ──────────────────────────────────────────────

export interface PracticeConfiguration {
	practiceName: string;
	practiceAddress: string;
	dpoName: string;
	dpoContactDetails: string;
	researchOrganisations: string;
	dataSharingPartners: string;
}

export interface AcknowledgmentSignature {
	agreed: boolean;
	patientTypedFullName: string;
	patientTypedDate: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	practiceConfiguration: PracticeConfiguration;
	acknowledgmentSignature: AcknowledgmentSignature;
}

// ──────────────────────────────────────────────
// Validation result types
// ──────────────────────────────────────────────

export interface ValidationRule {
	id: string;
	section: string;
	field: string;
	message: string;
}

export interface FiredRule {
	id: string;
	section: string;
	description: string;
	field: string;
}

export interface AdditionalFlag {
	id: string;
	category: string;
	message: string;
	priority: 'high' | 'medium' | 'low';
}

export interface GradingResult {
	completenessPercent: number;
	status: 'Complete' | 'Incomplete';
	firedRules: FiredRule[];
	additionalFlags: AdditionalFlag[];
	timestamp: string;
}

// ──────────────────────────────────────────────
// Step configuration
// ──────────────────────────────────────────────

export interface StepConfig {
	number: number;
	title: string;
	shortTitle: string;
	section: keyof AssessmentData | 'privacyNotice';
}
