import { describe, it, expect } from 'vitest';
import { validateForm } from './form-validator';
import { detectAdditionalFlags } from './flagged-issues';
import { validationRules } from './validation-rules';
import type { AssessmentData } from './types';

function createCompleteConsent(): AssessmentData {
	return {
		patientInformation: {
			firstName: 'Jane',
			lastName: 'Smith',
			dob: '1985-06-15',
			sex: 'female',
			nhsNumber: '943 476 5919',
			address: '10 Downing Street, London',
			phone: '07700 900123',
			emergencyContact: 'John Smith',
			emergencyContactPhone: '07700 900456'
		},
		procedureDetails: {
			procedureName: 'Laparoscopic cholecystectomy',
			procedureDescription: 'Keyhole surgery to remove the gallbladder',
			treatingClinician: 'Mr James Wilson',
			department: 'General Surgery',
			scheduledDate: '2026-04-15',
			estimatedDuration: '1-2 hours',
			admissionRequired: 'yes'
		},
		risksBenefits: {
			commonRisks: 'Pain, bruising, infection at wound site',
			seriousRisks: 'Bile duct injury, bleeding, bowel perforation',
			expectedBenefits: 'Resolution of gallstone symptoms, prevention of future attacks',
			successRate: '95% successful outcome',
			recoveryPeriod: '1-2 weeks for keyhole, 4-6 weeks for open'
		},
		alternativeTreatments: {
			alternativeOptions: 'Conservative management with dietary changes, open surgery',
			noTreatmentConsequences: 'Recurrent gallstone attacks, risk of complications such as pancreatitis',
			patientPreference: 'Prefers keyhole surgery'
		},
		anesthesiaInformation: {
			anesthesiaType: 'general',
			anesthesiaRisks: 'Nausea, sore throat, rare allergic reaction',
			previousAnesthesiaProblems: 'no',
			previousAnesthesiaDetails: '',
			fastingInstructions: 'No food for 6 hours, clear fluids until 2 hours before'
		},
		questionsUnderstanding: {
			questionsAsked: 'Patient asked about recovery time and return to work',
			understandsProcedure: 'yes',
			understandsRisks: 'yes',
			understandsAlternatives: 'yes',
			understandsRecovery: 'yes',
			additionalConcerns: ''
		},
		patientRights: {
			rightToWithdraw: 'yes',
			rightToSecondOpinion: 'yes',
			informedVoluntarily: 'yes',
			noGuaranteeAcknowledged: 'yes'
		},
		signatureConsent: {
			patientConsent: 'yes',
			signatureDate: '2026-03-08',
			witnessName: 'Nurse Sarah Brown',
			witnessRole: 'Staff Nurse',
			witnessSignatureDate: '2026-03-08',
			clinicianName: 'Mr James Wilson',
			clinicianRole: 'Consultant Surgeon',
			clinicianSignatureDate: '2026-03-08',
			interpreterUsed: 'no',
			interpreterName: ''
		}
	};
}

function createEmptyConsent(): AssessmentData {
	return {
		patientInformation: {
			firstName: '',
			lastName: '',
			dob: '',
			sex: '',
			nhsNumber: '',
			address: '',
			phone: '',
			emergencyContact: '',
			emergencyContactPhone: ''
		},
		procedureDetails: {
			procedureName: '',
			procedureDescription: '',
			treatingClinician: '',
			department: '',
			scheduledDate: '',
			estimatedDuration: '',
			admissionRequired: ''
		},
		risksBenefits: {
			commonRisks: '',
			seriousRisks: '',
			expectedBenefits: '',
			successRate: '',
			recoveryPeriod: ''
		},
		alternativeTreatments: {
			alternativeOptions: '',
			noTreatmentConsequences: '',
			patientPreference: ''
		},
		anesthesiaInformation: {
			anesthesiaType: '',
			anesthesiaRisks: '',
			previousAnesthesiaProblems: '',
			previousAnesthesiaDetails: '',
			fastingInstructions: ''
		},
		questionsUnderstanding: {
			questionsAsked: '',
			understandsProcedure: '',
			understandsRisks: '',
			understandsAlternatives: '',
			understandsRecovery: '',
			additionalConcerns: ''
		},
		patientRights: {
			rightToWithdraw: '',
			rightToSecondOpinion: '',
			informedVoluntarily: '',
			noGuaranteeAcknowledged: ''
		},
		signatureConsent: {
			patientConsent: '',
			signatureDate: '',
			witnessName: '',
			witnessRole: '',
			witnessSignatureDate: '',
			clinicianName: '',
			clinicianRole: '',
			clinicianSignatureDate: '',
			interpreterUsed: '',
			interpreterName: ''
		}
	};
}

describe('Consent Form Validator', () => {
	it('returns 100% completeness for a fully completed form', () => {
		const data = createCompleteConsent();
		const result = validateForm(data);
		expect(result.completeness).toBe(100);
		expect(result.status).toBe('Complete');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns 0% completeness for an empty form', () => {
		const data = createEmptyConsent();
		const result = validateForm(data);
		expect(result.completeness).toBe(0);
		expect(result.status).toBe('Incomplete');
		expect(result.firedRules.length).toBe(validationRules.length);
	});

	it('detects missing patient name fields', () => {
		const data = createCompleteConsent();
		data.patientInformation.firstName = '';
		data.patientInformation.lastName = '';

		const result = validateForm(data);
		expect(result.status).toBe('Incomplete');
		expect(result.firedRules.some((r) => r.id === 'REQ-PI-001')).toBe(true);
		expect(result.firedRules.some((r) => r.id === 'REQ-PI-002')).toBe(true);
	});

	it('detects missing consent signature', () => {
		const data = createCompleteConsent();
		data.signatureConsent.patientConsent = '';

		const result = validateForm(data);
		expect(result.status).toBe('Incomplete');
		expect(result.firedRules.some((r) => r.id === 'REQ-SC-001')).toBe(true);
	});

	it('detects missing understanding confirmations', () => {
		const data = createCompleteConsent();
		data.questionsUnderstanding.understandsProcedure = '';
		data.questionsUnderstanding.understandsRisks = '';

		const result = validateForm(data);
		expect(result.firedRules.some((r) => r.id === 'REQ-QU-001')).toBe(true);
		expect(result.firedRules.some((r) => r.id === 'REQ-QU-002')).toBe(true);
	});

	it('validation rule IDs are unique', () => {
		const ids = validationRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('calculates partial completeness correctly', () => {
		const data = createCompleteConsent();
		data.patientInformation.firstName = '';
		data.patientInformation.lastName = '';
		data.signatureConsent.patientConsent = '';

		const result = validateForm(data);
		expect(result.completeness).toBeLessThan(100);
		expect(result.completeness).toBeGreaterThan(0);
		expect(result.firedRules).toHaveLength(3);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for a complete, well-formed consent', () => {
		const data = createCompleteConsent();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags incomplete understanding', () => {
		const data = createCompleteConsent();
		data.questionsUnderstanding.understandsProcedure = 'no';
		data.questionsUnderstanding.understandsRisks = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-UNDERSTAND-001')).toBe(true);
	});

	it('flags previous anesthesia problems', () => {
		const data = createCompleteConsent();
		data.anesthesiaInformation.previousAnesthesiaProblems = 'yes';
		data.anesthesiaInformation.previousAnesthesiaDetails = 'Malignant hyperthermia';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ANESTH-001')).toBe(true);
	});

	it('flags high-risk procedure with serious risks', () => {
		const data = createCompleteConsent();
		data.risksBenefits.seriousRisks = 'Risk of death, permanent disability';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-HIGHRISK-001')).toBe(true);
	});

	it('flags missing patient rights acknowledgements', () => {
		const data = createCompleteConsent();
		data.patientRights.rightToWithdraw = 'no';
		data.patientRights.informedVoluntarily = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-RIGHTS-001')).toBe(true);
	});

	it('flags patient concerns noted', () => {
		const data = createCompleteConsent();
		data.questionsUnderstanding.additionalConcerns = 'Worried about long-term effects';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CONCERNS-001')).toBe(true);
	});

	it('flags interpreter used but name not documented', () => {
		const data = createCompleteConsent();
		data.signatureConsent.interpreterUsed = 'yes';
		data.signatureConsent.interpreterName = '';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-INTERPRETER-001')).toBe(true);
	});

	it('flags consent refused', () => {
		const data = createCompleteConsent();
		data.signatureConsent.patientConsent = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-NOCONSENT-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createCompleteConsent();
		data.questionsUnderstanding.understandsProcedure = 'no';
		data.questionsUnderstanding.additionalConcerns = 'Some concerns';
		data.patientRights.rightToWithdraw = 'no';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
