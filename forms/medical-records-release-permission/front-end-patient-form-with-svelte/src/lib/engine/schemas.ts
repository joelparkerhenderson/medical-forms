import { z } from 'zod';

// ──────────────────────────────────────────────
// Shared enums / patterns
// ──────────────────────────────────────────────

const YesNoSchema = z.enum(['yes', 'no', '']);
const SexSchema = z.enum(['male', 'female', 'other', '']);

const RecordTypeSchema = z.enum([
	'complete-medical-record',
	'lab-results',
	'imaging',
	'prescriptions',
	'discharge-summaries',
	'mental-health',
	'surgical-records',
	'allergy-records'
]);

const ReleasePurposeSchema = z.enum([
	'continuing-care',
	'second-opinion',
	'insurance',
	'legal',
	'personal',
	'research',
	'employment',
	'other',
	''
]);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nhsNumberRegex = /^\d{3}\s?\d{3}\s?\d{4}$/;
const dateStringSchema = z.string();

// ──────────────────────────────────────────────
// Section schemas
// ──────────────────────────────────────────────

export const PatientInformationSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	dateOfBirth: dateStringSchema,
	sex: SexSchema,
	address: z.string(),
	phone: z.string(),
	email: z.string().refine((v) => v === '' || emailRegex.test(v), {
		message: 'Invalid email format'
	}),
	nhsNumber: z.string().refine((v) => v === '' || nhsNumberRegex.test(v), {
		message: 'NHS number must be 10 digits (XXX XXX XXXX)'
	}),
	gpName: z.string(),
	gpPractice: z.string()
});

export const AuthorizedRecipientSchema = z.object({
	recipientName: z.string(),
	recipientOrganization: z.string(),
	recipientAddress: z.string(),
	recipientPhone: z.string(),
	recipientEmail: z.string().refine((v) => v === '' || emailRegex.test(v), {
		message: 'Invalid email format'
	}),
	recipientRole: z.string()
});

export const RecordsToReleaseSchema = z
	.object({
		recordTypes: z.array(RecordTypeSchema),
		specificDateRange: YesNoSchema,
		dateFrom: dateStringSchema,
		dateTo: dateStringSchema,
		specificRecordDetails: z.string()
	})
	.refine(
		(data) => {
			if (data.specificDateRange === 'yes') {
				return data.dateFrom !== '';
			}
			return true;
		},
		{ message: 'Date "from" is required when specific date range is selected', path: ['dateFrom'] }
	)
	.refine(
		(data) => {
			if (data.specificDateRange === 'yes') {
				return data.dateTo !== '';
			}
			return true;
		},
		{ message: 'Date "to" is required when specific date range is selected', path: ['dateTo'] }
	);

export const PurposeOfReleaseSchema = z
	.object({
		purpose: ReleasePurposeSchema,
		otherDetails: z.string()
	})
	.refine(
		(data) => {
			if (data.purpose === 'other') {
				return data.otherDetails.trim() !== '';
			}
			return true;
		},
		{ message: 'Details are required when purpose is "Other"', path: ['otherDetails'] }
	);

export const AuthorizationPeriodSchema = z
	.object({
		startDate: dateStringSchema,
		endDate: dateStringSchema,
		singleUse: YesNoSchema
	})
	.refine(
		(data) => {
			if (data.startDate && data.endDate) {
				return data.endDate >= data.startDate;
			}
			return true;
		},
		{ message: 'End date must be on or after start date', path: ['endDate'] }
	);

export const RestrictionsLimitationsSchema = z.object({
	excludeHIV: YesNoSchema,
	excludeSubstanceAbuse: YesNoSchema,
	excludeMentalHealth: YesNoSchema,
	excludeGeneticInfo: YesNoSchema,
	excludeSTI: YesNoSchema,
	additionalRestrictions: z.string()
});

export const PatientRightsSchema = z.object({
	acknowledgedRightToRevoke: YesNoSchema,
	acknowledgedNoChargeForAccess: YesNoSchema,
	acknowledgedDataProtection: YesNoSchema
});

export const SignatureConsentSchema = z.object({
	patientSignatureConfirmed: YesNoSchema,
	signatureDate: dateStringSchema,
	witnessName: z.string(),
	witnessSignatureConfirmed: YesNoSchema,
	witnessDate: dateStringSchema,
	parentGuardianName: z.string()
});

// ──────────────────────────────────────────────
// Composite schema
// ──────────────────────────────────────────────

export const AssessmentDataSchema = z.object({
	patientInformation: PatientInformationSchema,
	authorizedRecipient: AuthorizedRecipientSchema,
	recordsToRelease: RecordsToReleaseSchema,
	purposeOfRelease: PurposeOfReleaseSchema,
	authorizationPeriod: AuthorizationPeriodSchema,
	restrictionsLimitations: RestrictionsLimitationsSchema,
	patientRights: PatientRightsSchema,
	signatureConsent: SignatureConsentSchema
});

export type ValidatedAssessmentData = z.infer<typeof AssessmentDataSchema>;
