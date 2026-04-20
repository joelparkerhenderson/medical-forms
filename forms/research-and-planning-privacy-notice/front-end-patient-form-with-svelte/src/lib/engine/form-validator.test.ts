import { describe, it, expect } from 'vitest';
import { validateForm } from './form-validator';
import { detectAdditionalFlags } from './flagged-issues';
import type { AssessmentData } from './types';

function emptyAssessment(): AssessmentData {
	return {
		recipientDetails: {
			organisationName: '',
			recipientName: '',
			recipientNhsNumber: '',
			recipientDob: ''
		},
		acknowledgementSignature: {
			agreed: false,
			type1OptOut: '',
			nationalDataOptOut: '',
			recipientTypedFullName: '',
			recipientTypedDate: ''
		}
	};
}

function completeAssessment(): AssessmentData {
	return {
		recipientDetails: {
			organisationName: 'Riverside Medical Practice',
			recipientName: 'Mrs Jane Smith',
			recipientNhsNumber: '',
			recipientDob: ''
		},
		acknowledgementSignature: {
			agreed: true,
			type1OptOut: 'opt-in',
			nationalDataOptOut: 'opt-in',
			recipientTypedFullName: 'Jane Smith',
			recipientTypedDate: '2026-04-20'
		}
	};
}

describe('form-validator', () => {
	it('marks an empty form as Incomplete with all required rules fired', () => {
		const result = validateForm(emptyAssessment());
		expect(result.status).toBe('Incomplete');
		expect(result.completeness).toBe(0);
		expect(result.firedRules.length).toBe(7);
	});

	it('marks a fully filled form as Complete with no rules fired', () => {
		const result = validateForm(completeAssessment());
		expect(result.status).toBe('Complete');
		expect(result.completeness).toBe(100);
		expect(result.firedRules.length).toBe(0);
	});

	it('treats unset radio selections as incomplete', () => {
		const data = completeAssessment();
		data.acknowledgementSignature.type1OptOut = '';
		data.acknowledgementSignature.nationalDataOptOut = '';
		const result = validateForm(data);
		expect(result.firedRules.length).toBe(2);
		expect(result.status).toBe('Incomplete');
	});
});

describe('flagged-issues', () => {
	it('raises a high-priority flag when Type 1 opt-out is selected', () => {
		const data = completeAssessment();
		data.acknowledgementSignature.type1OptOut = 'opt-out';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-TYPE1-OPTOUT-001')).toBe(true);
		expect(flags.find((f) => f.id === 'FLAG-TYPE1-OPTOUT-001')?.priority).toBe('high');
	});

	it('raises a high-priority flag when National Data Opt-Out is selected', () => {
		const data = completeAssessment();
		data.acknowledgementSignature.nationalDataOptOut = 'opt-out';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-NATIONAL-OPTOUT-001')).toBe(true);
	});

	it('raises no flags for a fully opted-in complete form', () => {
		const flags = detectAdditionalFlags(completeAssessment());
		expect(flags.length).toBe(0);
	});
});
