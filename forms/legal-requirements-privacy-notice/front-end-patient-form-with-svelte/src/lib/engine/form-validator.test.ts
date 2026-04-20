import { describe, it, expect } from 'vitest';
import { validateForm } from './form-validator';
import { detectAdditionalFlags } from './flagged-issues';
import type { AssessmentData } from './types';

function emptyAssessment(): AssessmentData {
	return {
		acknowledgment: {
			agreed: false,
			patientTypedFullName: '',
			patientTypedDate: ''
		}
	};
}

function completeAssessment(): AssessmentData {
	return {
		acknowledgment: {
			agreed: true,
			patientTypedFullName: 'Jane Smith',
			patientTypedDate: '2026-04-20'
		}
	};
}

describe('form-validator', () => {
	it('marks an empty form as Incomplete with all three rules fired', () => {
		const result = validateForm(emptyAssessment());
		expect(result.status).toBe('Incomplete');
		expect(result.completeness).toBe(0);
		expect(result.firedRules.length).toBe(3);
	});

	it('marks a fully filled form as Complete with no rules fired', () => {
		const result = validateForm(completeAssessment());
		expect(result.status).toBe('Complete');
		expect(result.completeness).toBe(100);
		expect(result.firedRules.length).toBe(0);
	});
});

describe('flagged-issues', () => {
	it('flags an unacknowledged form', () => {
		const flags = detectAdditionalFlags(emptyAssessment());
		expect(flags.some((f) => f.id === 'FLAG-NOACK-001')).toBe(true);
	});

	it('raises no flags for a complete form', () => {
		const flags = detectAdditionalFlags(completeAssessment());
		expect(flags.length).toBe(0);
	});

	it('flags a very short name as incomplete-name', () => {
		const data = completeAssessment();
		data.acknowledgment.patientTypedFullName = 'J';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-NAME-001')).toBe(true);
	});
});
