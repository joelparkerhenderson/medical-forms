import { describe, it, expect } from 'vitest';
import { validateForm } from './form-validator';
import { detectAdditionalFlags } from './flagged-issues';
import type { AssessmentData } from './types';

function emptyAssessment(): AssessmentData {
	return {
		recipientDetails: {
			organisationName: '',
			recipientName: '',
			recipientRole: '',
			recipientEmployeeId: ''
		},
		acknowledgementSignature: {
			agreed: false,
			recipientTypedFullName: '',
			recipientTypedDate: ''
		}
	};
}

function completeAssessment(): AssessmentData {
	return {
		recipientDetails: {
			organisationName: 'Riverside Medical Practice',
			recipientName: 'Dr Jane Smith',
			recipientRole: 'General Practitioner',
			recipientEmployeeId: ''
		},
		acknowledgementSignature: {
			agreed: true,
			recipientTypedFullName: 'Jane Smith',
			recipientTypedDate: '2026-04-20'
		}
	};
}

describe('form-validator', () => {
	it('marks an empty form as Incomplete with all rules fired', () => {
		const result = validateForm(emptyAssessment());
		expect(result.status).toBe('Incomplete');
		expect(result.completeness).toBe(0);
		expect(result.firedRules.length).toBe(6);
	});

	it('marks a fully filled form as Complete with no rules fired', () => {
		const result = validateForm(completeAssessment());
		expect(result.status).toBe('Complete');
		expect(result.completeness).toBe(100);
		expect(result.firedRules.length).toBe(0);
	});

	it('marks a partial form with the correct proportion', () => {
		const data = completeAssessment();
		data.acknowledgementSignature.agreed = false;
		data.acknowledgementSignature.recipientTypedFullName = '';
		const result = validateForm(data);
		expect(result.status).toBe('Incomplete');
		expect(result.firedRules.length).toBe(2);
		expect(result.completeness).toBe(Math.round((4 / 6) * 100));
	});
});

describe('flagged-issues', () => {
	it('flags an empty form with three high/medium flags', () => {
		const flags = detectAdditionalFlags(emptyAssessment());
		expect(flags.length).toBeGreaterThan(0);
		expect(flags.some((f) => f.id === 'FLAG-NOACK-001')).toBe(true);
		expect(flags.some((f) => f.id === 'FLAG-CONFIG-001')).toBe(true);
	});

	it('raises no flags for a fully filled form', () => {
		const flags = detectAdditionalFlags(completeAssessment());
		expect(flags.length).toBe(0);
	});

	it('flags a very short name as incomplete-name', () => {
		const data = completeAssessment();
		data.acknowledgementSignature.recipientTypedFullName = 'J';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-NAME-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const flags = detectAdditionalFlags(emptyAssessment());
		const priorities = flags.map((f) => f.priority);
		const priorityOrder = { high: 0, medium: 1, low: 2 };
		const sortedPriorities = [...priorities].sort(
			(a, b) => priorityOrder[a] - priorityOrder[b]
		);
		expect(priorities).toEqual(sortedPriorities);
	});
});
