import { describe, it, expect } from 'vitest';
import {
	PatientInformationSchema,
	AuthorizedRecipientSchema,
	RecordsToReleaseSchema,
	PurposeOfReleaseSchema,
	AuthorizationPeriodSchema,
	RestrictionsLimitationsSchema,
	PatientRightsSchema,
	SignatureConsentSchema,
	AssessmentDataSchema
} from './schemas';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function validPatientInformation() {
	return {
		firstName: 'Jane',
		lastName: 'Smith',
		dateOfBirth: '1985-06-15',
		sex: 'female' as const,
		address: '42 Oak Lane, London, SW1A 1AA',
		phone: '020 7946 0958',
		email: 'jane.smith@example.com',
		nhsNumber: '943 476 5919',
		gpName: 'Dr Sarah Thompson',
		gpPractice: 'Elm Street Surgery'
	};
}

function validAuthorizedRecipient() {
	return {
		recipientName: 'Dr James Wilson',
		recipientOrganization: 'Royal London Hospital',
		recipientAddress: 'Whitechapel Rd, London E1 1FR',
		recipientPhone: '020 7377 7000',
		recipientEmail: 'j.wilson@royallondon.nhs.uk',
		recipientRole: 'Consultant Neurologist'
	};
}

function validRecordsToRelease() {
	return {
		recordTypes: ['lab-results' as const, 'imaging' as const],
		specificDateRange: 'no' as const,
		dateFrom: '',
		dateTo: '',
		specificRecordDetails: ''
	};
}

function validPurposeOfRelease() {
	return { purpose: 'continuing-care' as const, otherDetails: '' };
}

function validAuthorizationPeriod() {
	return { startDate: '2026-03-08', endDate: '2026-09-08', singleUse: 'no' as const };
}

function validRestrictionsLimitations() {
	return {
		excludeHIV: 'yes' as const,
		excludeSubstanceAbuse: 'yes' as const,
		excludeMentalHealth: 'yes' as const,
		excludeGeneticInfo: 'yes' as const,
		excludeSTI: 'yes' as const,
		additionalRestrictions: ''
	};
}

function validPatientRights() {
	return {
		acknowledgedRightToRevoke: 'yes' as const,
		acknowledgedNoChargeForAccess: 'yes' as const,
		acknowledgedDataProtection: 'yes' as const
	};
}

function validSignatureConsent() {
	return {
		patientSignatureConfirmed: 'yes' as const,
		signatureDate: '2026-03-08',
		witnessName: 'Robert Jones',
		witnessSignatureConfirmed: 'yes' as const,
		witnessDate: '2026-03-08',
		parentGuardianName: ''
	};
}

function validAssessmentData() {
	return {
		patientInformation: validPatientInformation(),
		authorizedRecipient: validAuthorizedRecipient(),
		recordsToRelease: validRecordsToRelease(),
		purposeOfRelease: validPurposeOfRelease(),
		authorizationPeriod: validAuthorizationPeriod(),
		restrictionsLimitations: validRestrictionsLimitations(),
		patientRights: validPatientRights(),
		signatureConsent: validSignatureConsent()
	};
}

// ──────────────────────────────────────────────
// PatientInformationSchema
// ──────────────────────────────────────────────

describe('PatientInformationSchema', () => {
	it('accepts valid patient information', () => {
		const result = PatientInformationSchema.safeParse(validPatientInformation());
		expect(result.success).toBe(true);
	});

	it('accepts empty email', () => {
		const data = { ...validPatientInformation(), email: '' };
		const result = PatientInformationSchema.safeParse(data);
		expect(result.success).toBe(true);
	});

	it('rejects invalid email format', () => {
		const data = { ...validPatientInformation(), email: 'not-an-email' };
		const result = PatientInformationSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it('accepts valid NHS number with spaces', () => {
		const data = { ...validPatientInformation(), nhsNumber: '943 476 5919' };
		const result = PatientInformationSchema.safeParse(data);
		expect(result.success).toBe(true);
	});

	it('accepts valid NHS number without spaces', () => {
		const data = { ...validPatientInformation(), nhsNumber: '9434765919' };
		const result = PatientInformationSchema.safeParse(data);
		expect(result.success).toBe(true);
	});

	it('accepts empty NHS number', () => {
		const data = { ...validPatientInformation(), nhsNumber: '' };
		const result = PatientInformationSchema.safeParse(data);
		expect(result.success).toBe(true);
	});

	it('rejects NHS number with wrong digit count', () => {
		const data = { ...validPatientInformation(), nhsNumber: '12345' };
		const result = PatientInformationSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it('accepts all valid sex values', () => {
		for (const sex of ['male', 'female', 'other', ''] as const) {
			const data = { ...validPatientInformation(), sex };
			expect(PatientInformationSchema.safeParse(data).success).toBe(true);
		}
	});

	it('rejects invalid sex value', () => {
		const data = { ...validPatientInformation(), sex: 'invalid' };
		const result = PatientInformationSchema.safeParse(data);
		expect(result.success).toBe(false);
	});
});

// ──────────────────────────────────────────────
// AuthorizedRecipientSchema
// ──────────────────────────────────────────────

describe('AuthorizedRecipientSchema', () => {
	it('accepts valid recipient', () => {
		const result = AuthorizedRecipientSchema.safeParse(validAuthorizedRecipient());
		expect(result.success).toBe(true);
	});

	it('accepts empty recipient email', () => {
		const data = { ...validAuthorizedRecipient(), recipientEmail: '' };
		const result = AuthorizedRecipientSchema.safeParse(data);
		expect(result.success).toBe(true);
	});

	it('rejects invalid recipient email', () => {
		const data = { ...validAuthorizedRecipient(), recipientEmail: 'bad-email' };
		const result = AuthorizedRecipientSchema.safeParse(data);
		expect(result.success).toBe(false);
	});
});

// ──────────────────────────────────────────────
// RecordsToReleaseSchema
// ──────────────────────────────────────────────

describe('RecordsToReleaseSchema', () => {
	it('accepts valid records to release', () => {
		const result = RecordsToReleaseSchema.safeParse(validRecordsToRelease());
		expect(result.success).toBe(true);
	});

	it('accepts empty record types array', () => {
		const data = { ...validRecordsToRelease(), recordTypes: [] };
		const result = RecordsToReleaseSchema.safeParse(data);
		expect(result.success).toBe(true);
	});

	it('rejects invalid record type', () => {
		const data = { ...validRecordsToRelease(), recordTypes: ['invalid-type'] };
		const result = RecordsToReleaseSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it('requires dateFrom when specificDateRange is yes', () => {
		const data = { ...validRecordsToRelease(), specificDateRange: 'yes' as const, dateFrom: '', dateTo: '2026-06-01' };
		const result = RecordsToReleaseSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it('requires dateTo when specificDateRange is yes', () => {
		const data = { ...validRecordsToRelease(), specificDateRange: 'yes' as const, dateFrom: '2026-01-01', dateTo: '' };
		const result = RecordsToReleaseSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it('accepts date range when both dates provided', () => {
		const data = { ...validRecordsToRelease(), specificDateRange: 'yes' as const, dateFrom: '2026-01-01', dateTo: '2026-06-01' };
		const result = RecordsToReleaseSchema.safeParse(data);
		expect(result.success).toBe(true);
	});

	it('does not require dates when specificDateRange is no', () => {
		const data = { ...validRecordsToRelease(), specificDateRange: 'no' as const, dateFrom: '', dateTo: '' };
		const result = RecordsToReleaseSchema.safeParse(data);
		expect(result.success).toBe(true);
	});
});

// ──────────────────────────────────────────────
// PurposeOfReleaseSchema
// ──────────────────────────────────────────────

describe('PurposeOfReleaseSchema', () => {
	it('accepts valid purpose', () => {
		const result = PurposeOfReleaseSchema.safeParse(validPurposeOfRelease());
		expect(result.success).toBe(true);
	});

	it('accepts all valid purpose values', () => {
		const purposes = ['continuing-care', 'second-opinion', 'insurance', 'legal', 'personal', 'research', 'employment', ''] as const;
		for (const purpose of purposes) {
			const data = { purpose, otherDetails: '' };
			expect(PurposeOfReleaseSchema.safeParse(data).success).toBe(true);
		}
	});

	it('requires details when purpose is other', () => {
		const data = { purpose: 'other' as const, otherDetails: '' };
		const result = PurposeOfReleaseSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it('requires non-whitespace details when purpose is other', () => {
		const data = { purpose: 'other' as const, otherDetails: '   ' };
		const result = PurposeOfReleaseSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it('accepts other with details', () => {
		const data = { purpose: 'other' as const, otherDetails: 'Transfer to overseas provider' };
		const result = PurposeOfReleaseSchema.safeParse(data);
		expect(result.success).toBe(true);
	});

	it('rejects invalid purpose value', () => {
		const data = { purpose: 'invalid', otherDetails: '' };
		const result = PurposeOfReleaseSchema.safeParse(data);
		expect(result.success).toBe(false);
	});
});

// ──────────────────────────────────────────────
// AuthorizationPeriodSchema
// ──────────────────────────────────────────────

describe('AuthorizationPeriodSchema', () => {
	it('accepts valid authorization period', () => {
		const result = AuthorizationPeriodSchema.safeParse(validAuthorizationPeriod());
		expect(result.success).toBe(true);
	});

	it('rejects end date before start date', () => {
		const data = { startDate: '2026-09-08', endDate: '2026-03-08', singleUse: 'no' as const };
		const result = AuthorizationPeriodSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it('accepts same start and end date', () => {
		const data = { startDate: '2026-03-08', endDate: '2026-03-08', singleUse: 'yes' as const };
		const result = AuthorizationPeriodSchema.safeParse(data);
		expect(result.success).toBe(true);
	});

	it('allows empty dates (not yet filled)', () => {
		const data = { startDate: '', endDate: '', singleUse: '' as const };
		const result = AuthorizationPeriodSchema.safeParse(data);
		expect(result.success).toBe(true);
	});
});

// ──────────────────────────────────────────────
// RestrictionsLimitationsSchema
// ──────────────────────────────────────────────

describe('RestrictionsLimitationsSchema', () => {
	it('accepts valid restrictions', () => {
		const result = RestrictionsLimitationsSchema.safeParse(validRestrictionsLimitations());
		expect(result.success).toBe(true);
	});

	it('accepts all empty YesNo values', () => {
		const data = {
			excludeHIV: '' as const,
			excludeSubstanceAbuse: '' as const,
			excludeMentalHealth: '' as const,
			excludeGeneticInfo: '' as const,
			excludeSTI: '' as const,
			additionalRestrictions: ''
		};
		const result = RestrictionsLimitationsSchema.safeParse(data);
		expect(result.success).toBe(true);
	});
});

// ──────────────────────────────────────────────
// PatientRightsSchema
// ──────────────────────────────────────────────

describe('PatientRightsSchema', () => {
	it('accepts valid patient rights', () => {
		const result = PatientRightsSchema.safeParse(validPatientRights());
		expect(result.success).toBe(true);
	});

	it('accepts unanswered acknowledgements', () => {
		const data = {
			acknowledgedRightToRevoke: '' as const,
			acknowledgedNoChargeForAccess: '' as const,
			acknowledgedDataProtection: '' as const
		};
		const result = PatientRightsSchema.safeParse(data);
		expect(result.success).toBe(true);
	});
});

// ──────────────────────────────────────────────
// SignatureConsentSchema
// ──────────────────────────────────────────────

describe('SignatureConsentSchema', () => {
	it('accepts valid signature consent', () => {
		const result = SignatureConsentSchema.safeParse(validSignatureConsent());
		expect(result.success).toBe(true);
	});

	it('accepts empty signature consent (all defaults)', () => {
		const data = {
			patientSignatureConfirmed: '' as const,
			signatureDate: '',
			witnessName: '',
			witnessSignatureConfirmed: '' as const,
			witnessDate: '',
			parentGuardianName: ''
		};
		const result = SignatureConsentSchema.safeParse(data);
		expect(result.success).toBe(true);
	});
});

// ──────────────────────────────────────────────
// AssessmentDataSchema (composite)
// ──────────────────────────────────────────────

describe('AssessmentDataSchema', () => {
	it('accepts a fully valid assessment', () => {
		const result = AssessmentDataSchema.safeParse(validAssessmentData());
		expect(result.success).toBe(true);
	});

	it('rejects when nested section is invalid', () => {
		const data = validAssessmentData();
		data.patientInformation.email = 'bad-email';
		const result = AssessmentDataSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it('rejects when conditional refinement fails', () => {
		const data = validAssessmentData();
		data.purposeOfRelease.purpose = 'other';
		data.purposeOfRelease.otherDetails = '';
		const result = AssessmentDataSchema.safeParse(data);
		expect(result.success).toBe(false);
	});

	it('rejects missing sections', () => {
		const result = AssessmentDataSchema.safeParse({ patientInformation: validPatientInformation() });
		expect(result.success).toBe(false);
	});
});
