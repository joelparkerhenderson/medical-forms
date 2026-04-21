import { describe, it, expect } from 'vitest';
import { validateForm } from './form-validator';
import { detectAdditionalFlags } from './flagged-issues';
import type { AssessmentData } from './types';

function createCompleteForm(): AssessmentData {
	return {
		patientInformation: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1985-06-15',
			sex: 'female',
			address: '42 Oak Lane, London, SW1A 1AA',
			phone: '020 7946 0958',
			email: 'jane.smith@example.com',
			nhsNumber: '943 476 5919',
			gpName: 'Dr Sarah Thompson',
			gpPractice: 'Elm Street Surgery'
		},
		authorizedRecipient: {
			recipientName: 'Dr James Wilson',
			recipientOrganization: 'Royal London Hospital',
			recipientAddress: 'Whitechapel Rd, London E1 1FR',
			recipientPhone: '020 7377 7000',
			recipientEmail: 'j.wilson@royallondon.nhs.uk',
			recipientRole: 'Consultant Neurologist'
		},
		recordsToRelease: {
			recordTypes: ['lab-results', 'imaging'],
			specificDateRange: 'no',
			dateFrom: '',
			dateTo: '',
			specificRecordDetails: ''
		},
		purposeOfRelease: {
			purpose: 'continuing-care',
			otherDetails: ''
		},
		authorizationPeriod: {
			startDate: '2026-03-08',
			endDate: '2026-09-08',
			singleUse: 'no'
		},
		restrictionsLimitations: {
			excludeHIV: 'yes',
			excludeSubstanceAbuse: 'yes',
			excludeMentalHealth: 'yes',
			excludeGeneticInfo: 'yes',
			excludeSTI: 'yes',
			additionalRestrictions: ''
		},
		patientRights: {
			acknowledgedRightToRevoke: 'yes',
			acknowledgedNoChargeForAccess: 'yes',
			acknowledgedDataProtection: 'yes'
		},
		signatureConsent: {
			patientSignatureConfirmed: 'yes',
			signatureDate: '2026-03-08',
			witnessName: 'Robert Jones',
			witnessSignatureConfirmed: 'yes',
			witnessDate: '2026-03-08',
			parentGuardianName: ''
		}
	};
}

describe('Form Validation Engine', () => {
	it('returns 100% for a fully completed form', () => {
		const data = createCompleteForm();
		const result = validateForm(data);
		expect(result.completenessScore).toBe(100);
		expect(result.completenessStatus).toBe('Complete');
		expect(result.firedRules).toHaveLength(0);
	});

	it('flags missing patient first name', () => {
		const data = createCompleteForm();
		data.patientInformation.firstName = '';
		const result = validateForm(data);
		expect(result.completenessScore).toBeLessThan(100);
		expect(result.firedRules.some((r) => r.id === 'RULE-PI-001')).toBe(true);
	});

	it('flags missing recipient organization', () => {
		const data = createCompleteForm();
		data.authorizedRecipient.recipientOrganization = '';
		const result = validateForm(data);
		expect(result.firedRules.some((r) => r.id === 'RULE-AR-002')).toBe(true);
	});

	it('flags empty record types', () => {
		const data = createCompleteForm();
		data.recordsToRelease.recordTypes = [];
		const result = validateForm(data);
		expect(result.firedRules.some((r) => r.id === 'RULE-RR-001')).toBe(true);
	});

	it('flags missing purpose', () => {
		const data = createCompleteForm();
		data.purposeOfRelease.purpose = '';
		const result = validateForm(data);
		expect(result.firedRules.some((r) => r.id === 'RULE-PR-001')).toBe(true);
	});

	it('flags purpose "other" without details', () => {
		const data = createCompleteForm();
		data.purposeOfRelease.purpose = 'other';
		data.purposeOfRelease.otherDetails = '';
		const result = validateForm(data);
		expect(result.firedRules.some((r) => r.id === 'RULE-FMT-006')).toBe(true);
	});

	it('flags invalid email format', () => {
		const data = createCompleteForm();
		data.patientInformation.email = 'not-an-email';
		const result = validateForm(data);
		expect(result.firedRules.some((r) => r.id === 'RULE-FMT-001')).toBe(true);
	});

	it('flags end date before start date', () => {
		const data = createCompleteForm();
		data.authorizationPeriod.startDate = '2026-09-08';
		data.authorizationPeriod.endDate = '2026-03-08';
		const result = validateForm(data);
		expect(result.firedRules.some((r) => r.id === 'RULE-FMT-003')).toBe(true);
	});

	it('flags missing signature confirmation', () => {
		const data = createCompleteForm();
		data.signatureConsent.patientSignatureConfirmed = '';
		const result = validateForm(data);
		expect(result.firedRules.some((r) => r.id === 'RULE-SC-001')).toBe(true);
	});

	it('flags missing acknowledgements', () => {
		const data = createCompleteForm();
		data.patientRights.acknowledgedRightToRevoke = '';
		data.patientRights.acknowledgedDataProtection = '';
		const result = validateForm(data);
		expect(result.firedRules.some((r) => r.id === 'RULE-PTR-001')).toBe(true);
		expect(result.firedRules.some((r) => r.id === 'RULE-PTR-002')).toBe(true);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no critical flags for a fully completed form', () => {
		const data = createCompleteForm();
		const flags = detectAdditionalFlags(data);
		const highFlags = flags.filter((f) => f.priority === 'high');
		expect(highFlags).toHaveLength(0);
	});

	it('flags missing patient signature', () => {
		const data = createCompleteForm();
		data.signatureConsent.patientSignatureConfirmed = '';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SIG-001')).toBe(true);
	});

	it('flags expired authorization', () => {
		const data = createCompleteForm();
		data.authorizationPeriod.endDate = '2020-01-01';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-EXPIRED-001')).toBe(true);
	});

	it('flags complete medical record request', () => {
		const data = createCompleteForm();
		data.recordsToRelease.recordTypes = ['complete-medical-record'];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SCOPE-001')).toBe(true);
	});

	it('flags legal release purpose', () => {
		const data = createCompleteForm();
		data.purposeOfRelease.purpose = 'legal';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-LEGAL-001')).toBe(true);
	});

	it('flags missing witness for vulnerable patient', () => {
		const data = createCompleteForm();
		data.signatureConsent.parentGuardianName = 'Mary Smith';
		data.signatureConsent.witnessName = '';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-WITNESS-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createCompleteForm();
		data.signatureConsent.patientSignatureConfirmed = '';
		data.patientRights.acknowledgedRightToRevoke = '';
		data.purposeOfRelease.purpose = 'legal';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
