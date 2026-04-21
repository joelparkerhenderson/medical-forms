// ──────────────────────────────────────────────
// Core code of conduct notice data types
// ──────────────────────────────────────────────

export interface RecipientDetails {
	organisationName: string;
	recipientName: string;
	recipientRole: string;
	recipientEmployeeId: string;
}

export interface AcknowledgementSignature {
	agreed: boolean;
	recipientTypedFullName: string;
	recipientTypedDate: string;
}

// ──────────────────────────────────────────────
// Full assessment data model
// ──────────────────────────────────────────────

export interface AssessmentData {
	recipientDetails: RecipientDetails;
	acknowledgementSignature: AcknowledgementSignature;
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
	section: keyof AssessmentData | 'codeOfConductNotice';
}
