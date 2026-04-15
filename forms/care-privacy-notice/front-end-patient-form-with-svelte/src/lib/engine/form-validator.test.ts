import { describe, it, expect } from 'vitest';
import { validateForm } from './form-validator';
import { detectAdditionalFlags } from './flagged-issues';
import type { AssessmentData } from './types';

function createCompleteAssessment(): AssessmentData {
	return {
		practiceConfiguration: {
			practiceName: 'Riverside Medical Practice',
			practiceAddress: '123 High Street, London, SW1A 1AA',
			dpoName: 'Jane Smith',
			dpoContactDetails: 'jane.smith@riverside.nhs.uk',
			researchOrganisations: 'Clinical Practice Research Datalink',
			dataSharingPartners: 'NHS England'
		},
		acknowledgmentSignature: {
			agreed: true,
			patientTypedFullName: 'John Smith',
			patientTypedDate: '2026-04-15'
		}
	};
}

function createEmptyAssessment(): AssessmentData {
	return {
		practiceConfiguration: {
			practiceName: '',
			practiceAddress: '',
			dpoName: '',
			dpoContactDetails: '',
			researchOrganisations: '',
			dataSharingPartners: ''
		},
		acknowledgmentSignature: {
			agreed: false,
			patientTypedFullName: '',
			patientTypedDate: ''
		}
	};
}

describe('validateForm', () => {
	it('returns 100% for a fully completed form', () => {
		const result = validateForm(createCompleteAssessment());
		expect(result.completeness).toBe(100);
		expect(result.status).toBe('Complete');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns 0% for an empty form', () => {
		const result = validateForm(createEmptyAssessment());
		expect(result.completeness).toBe(0);
		expect(result.status).toBe('Incomplete');
		expect(result.firedRules).toHaveLength(7);
	});

	it('fires rule when acknowledgment checkbox is not checked', () => {
		const data = createCompleteAssessment();
		data.acknowledgmentSignature.agreed = false;
		const result = validateForm(data);
		expect(result.status).toBe('Incomplete');
		const ackRule = result.firedRules.find((r) => r.id === 'REQ-AK-001');
		expect(ackRule).toBeDefined();
	});

	it('fires rule when patient name is missing', () => {
		const data = createCompleteAssessment();
		data.acknowledgmentSignature.patientTypedFullName = '';
		const result = validateForm(data);
		expect(result.status).toBe('Incomplete');
		const nameRule = result.firedRules.find((r) => r.id === 'REQ-AK-002');
		expect(nameRule).toBeDefined();
	});

	it('fires rule when patient date is missing', () => {
		const data = createCompleteAssessment();
		data.acknowledgmentSignature.patientTypedDate = '';
		const result = validateForm(data);
		expect(result.status).toBe('Incomplete');
		const dateRule = result.firedRules.find((r) => r.id === 'REQ-AK-003');
		expect(dateRule).toBeDefined();
	});

	it('fires rule when practice name is missing', () => {
		const data = createCompleteAssessment();
		data.practiceConfiguration.practiceName = '';
		const result = validateForm(data);
		expect(result.status).toBe('Incomplete');
		const rule = result.firedRules.find((r) => r.id === 'REQ-PC-001');
		expect(rule).toBeDefined();
	});

	it('has unique rule IDs', () => {
		const result = validateForm(createEmptyAssessment());
		const ids = result.firedRules.map((r) => r.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('detectAdditionalFlags', () => {
	it('returns no flags for a complete form', () => {
		const flags = detectAdditionalFlags(createCompleteAssessment());
		expect(flags).toHaveLength(0);
	});

	it('flags when acknowledgment is not given', () => {
		const data = createCompleteAssessment();
		data.acknowledgmentSignature.agreed = false;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-NOACK-001')).toBe(true);
	});

	it('flags when patient typed name is very short', () => {
		const data = createCompleteAssessment();
		data.acknowledgmentSignature.patientTypedFullName = 'AB';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-NAME-001')).toBe(true);
	});

	it('flags when practice configuration is missing key fields', () => {
		const data = createCompleteAssessment();
		data.practiceConfiguration.practiceName = '';
		data.practiceConfiguration.dpoName = '';
		const flags = detectAdditionalFlags(data);
		const configFlag = flags.find((f) => f.id === 'FLAG-CONFIG-001');
		expect(configFlag).toBeDefined();
		expect(configFlag!.message).toContain('practice name');
		expect(configFlag!.message).toContain('DPO name');
	});

	it('sorts flags by priority (high first)', () => {
		const data = createEmptyAssessment();
		data.acknowledgmentSignature.patientTypedFullName = 'AB';
		const flags = detectAdditionalFlags(data);
		for (let i = 1; i < flags.length; i++) {
			const order = { high: 0, medium: 1, low: 2 };
			expect(order[flags[i].priority]).toBeGreaterThanOrEqual(order[flags[i - 1].priority]);
		}
	});
});
