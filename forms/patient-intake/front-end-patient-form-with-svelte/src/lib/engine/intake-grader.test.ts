import { describe, it, expect } from 'vitest';
import { calculateRiskLevel } from './intake-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { intakeRules } from './intake-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		personalInformation: {
			fullName: 'John Doe',
			dateOfBirth: '1985-01-01',
			sex: 'male',
			addressLine1: '123 Main St',
			addressLine2: '',
			city: 'London',
			postcode: 'SW1A 1AA',
			phone: '07700 900000',
			email: 'john@example.com',
			emergencyContactName: 'Jane Doe',
			emergencyContactPhone: '07700 900001',
			emergencyContactRelationship: 'Spouse'
		},
		insuranceAndId: {
			insuranceProvider: 'NHS',
			policyNumber: '',
			nhsNumber: '943 476 5919',
			gpName: 'Dr Smith',
			gpPracticeName: 'High Street Surgery',
			gpPhone: '020 7946 0958'
		},
		reasonForVisit: {
			primaryReason: 'Annual check-up',
			urgencyLevel: 'routine',
			referringProvider: '',
			symptomDuration: '',
			additionalDetails: ''
		},
		medicalHistory: {
			chronicConditions: [],
			previousSurgeries: '',
			previousHospitalizations: '',
			ongoingTreatments: ''
		},
		medications: [],
		allergies: [],
		familyHistory: {
			heartDisease: 'no',
			heartDiseaseDetails: '',
			cancer: 'no',
			cancerDetails: '',
			diabetes: 'no',
			diabetesDetails: '',
			stroke: 'no',
			strokeDetails: '',
			mentalIllness: 'no',
			mentalIllnessDetails: '',
			geneticConditions: 'no',
			geneticConditionsDetails: ''
		},
		socialHistory: {
			smokingStatus: 'never',
			smokingPackYears: null,
			alcoholFrequency: 'none',
			alcoholUnitsPerWeek: null,
			drugUse: 'none',
			drugDetails: '',
			occupation: 'Office worker',
			exerciseFrequency: 'regular',
			dietQuality: 'good'
		},
		reviewOfSystems: {
			constitutional: '',
			heent: '',
			cardiovascular: '',
			respiratory: '',
			gastrointestinal: '',
			genitourinary: '',
			musculoskeletal: '',
			neurological: '',
			psychiatric: '',
			skin: ''
		},
		consentAndPreferences: {
			consentToTreatment: 'yes',
			privacyAcknowledgement: 'yes',
			communicationPreference: 'email',
			advanceDirectives: 'no',
			advanceDirectiveDetails: ''
		}
	};
}

describe('Intake Risk Classification Engine', () => {
	it('returns Low risk for a healthy patient', () => {
		const data = createHealthyPatient();
		const result = calculateRiskLevel(data);
		expect(result.riskLevel).toBe('low');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns Medium risk for patient with controlled chronic conditions', () => {
		const data = createHealthyPatient();
		data.medicalHistory.chronicConditions = ['hypertension', 'type-2-diabetes'];
		data.socialHistory.smokingStatus = 'current';

		const result = calculateRiskLevel(data);
		expect(result.riskLevel).toBe('medium');
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns High risk for patient with multiple comorbidities and polypharmacy', () => {
		const data = createHealthyPatient();
		data.medicalHistory.chronicConditions = [
			'hypertension',
			'type-2-diabetes',
			'chronic-kidney-disease',
			'heart-failure'
		];
		data.medications = [
			{ name: 'Metformin', dose: '500mg', frequency: 'BD', prescriber: 'Dr Smith' },
			{ name: 'Ramipril', dose: '10mg', frequency: 'OD', prescriber: 'Dr Smith' },
			{ name: 'Bisoprolol', dose: '5mg', frequency: 'OD', prescriber: 'Dr Smith' },
			{ name: 'Furosemide', dose: '40mg', frequency: 'OD', prescriber: 'Dr Smith' },
			{ name: 'Amlodipine', dose: '5mg', frequency: 'OD', prescriber: 'Dr Smith' }
		];

		const result = calculateRiskLevel(data);
		expect(result.riskLevel).toBe('high');
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns High risk for emergency visit', () => {
		const data = createHealthyPatient();
		data.reasonForVisit.urgencyLevel = 'emergency';

		const result = calculateRiskLevel(data);
		expect(result.riskLevel).toBe('high');
	});

	it('returns High risk when consent not given', () => {
		const data = createHealthyPatient();
		data.consentAndPreferences.consentToTreatment = 'no';

		const result = calculateRiskLevel(data);
		expect(result.riskLevel).toBe('high');
	});

	it('detects all rule IDs are unique', () => {
		const ids = intakeRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags multiple allergies', () => {
		const data = createHealthyPatient();
		data.allergies = [
			{ allergen: 'Penicillin', allergyType: 'drug', reaction: 'Rash', severity: 'mild' },
			{ allergen: 'Peanuts', allergyType: 'food', reaction: 'Swelling', severity: 'moderate' },
			{ allergen: 'Pollen', allergyType: 'environmental', reaction: 'Sneezing', severity: 'mild' }
		];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ALLERGY-001')).toBe(true);
	});

	it('flags polypharmacy', () => {
		const data = createHealthyPatient();
		data.medications = [
			{ name: 'Med1', dose: '10mg', frequency: 'OD', prescriber: 'Dr A' },
			{ name: 'Med2', dose: '20mg', frequency: 'OD', prescriber: 'Dr A' },
			{ name: 'Med3', dose: '5mg', frequency: 'BD', prescriber: 'Dr A' },
			{ name: 'Med4', dose: '10mg', frequency: 'OD', prescriber: 'Dr A' },
			{ name: 'Med5', dose: '50mg', frequency: 'OD', prescriber: 'Dr A' }
		];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-MEDS-001')).toBe(true);
	});

	it('flags missing emergency contact', () => {
		const data = createHealthyPatient();
		data.personalInformation.emergencyContactName = '';
		data.personalInformation.emergencyContactPhone = '';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CONTACT-001')).toBe(true);
	});

	it('flags uncontrolled conditions (3+ chronic)', () => {
		const data = createHealthyPatient();
		data.medicalHistory.chronicConditions = ['hypertension', 'diabetes', 'copd'];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CHRONIC-001')).toBe(true);
	});

	it('flags anaphylaxis allergy', () => {
		const data = createHealthyPatient();
		data.allergies = [
			{ allergen: 'Penicillin', allergyType: 'drug', reaction: 'Anaphylaxis', severity: 'anaphylaxis' }
		];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Allergy' && f.priority === 'high')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.medicalHistory.chronicConditions = ['hypertension', 'diabetes', 'copd'];
		data.personalInformation.emergencyContactName = '';
		data.socialHistory.smokingStatus = 'current';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
