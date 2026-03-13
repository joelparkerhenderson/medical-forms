import { describe, it, expect } from 'vitest';
import { calculateValidity } from './validity-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { validityRules } from './validity-rules';
import type { AssessmentData } from './types';

function createEmptyAssessment(): AssessmentData {
	return {
		personalInformation: {
			fullLegalName: '',
			dateOfBirth: '',
			nhsNumber: '',
			address: '',
			postcode: '',
			telephone: '',
			email: '',
			gpName: '',
			gpPractice: '',
			gpAddress: '',
			gpTelephone: ''
		},
		capacityDeclaration: {
			confirmsCapacity: '',
			understandsConsequences: '',
			noUndueInfluence: '',
			professionalCapacityAssessment: '',
			assessedByName: '',
			assessedByRole: '',
			assessmentDate: '',
			assessmentDetails: ''
		},
		circumstances: {
			specificCircumstances: '',
			medicalConditions: '',
			situationsDescription: ''
		},
		treatmentsRefusedGeneral: {
			antibiotics: { treatment: 'Antibiotics', refused: '', specification: '' },
			bloodTransfusion: { treatment: 'Blood Transfusion', refused: '', specification: '' },
			ivFluids: { treatment: 'IV Fluids', refused: '', specification: '' },
			tubeFeeding: { treatment: 'Tube Feeding', refused: '', specification: '' },
			dialysis: { treatment: 'Dialysis', refused: '', specification: '' },
			ventilation: { treatment: 'Ventilation', refused: '', specification: '' },
			otherTreatments: []
		},
		treatmentsRefusedLifeSustaining: {
			cpr: { treatment: 'CPR', refused: '', evenIfLifeAtRisk: '', specification: '' },
			mechanicalVentilation: { treatment: 'Mechanical Ventilation', refused: '', evenIfLifeAtRisk: '', specification: '' },
			artificialNutritionHydration: { treatment: 'Artificial Nutrition/Hydration', refused: '', evenIfLifeAtRisk: '', specification: '' },
			otherLifeSustaining: []
		},
		exceptionsConditions: {
			hasExceptions: '',
			exceptionsDescription: '',
			hasTimeLimitations: '',
			timeLimitationsDescription: '',
			invalidatingConditions: ''
		},
		otherWishes: {
			preferredCareSetting: '',
			comfortMeasures: '',
			spiritualReligiousWishes: '',
			otherPreferences: ''
		},
		lastingPowerOfAttorney: {
			hasLPA: '',
			lpaType: '',
			lpaRegistered: '',
			lpaRegistrationDate: '',
			doneeNames: '',
			relationshipBetweenADRTAndLPA: ''
		},
		healthcareProfessionalReview: {
			reviewedByClinicianName: '',
			reviewedByClinicianRole: '',
			reviewDate: '',
			clinicalOpinionOnCapacity: '',
			anyConcerns: '',
			concernsDetails: ''
		},
		legalSignatures: {
			patientSignature: '',
			patientStatementOfUnderstanding: '',
			patientSignatureDate: '',
			witnessSignature: '',
			witnessName: '',
			witnessAddress: '',
			witnessSignatureDate: '',
			lifeSustainingWrittenStatement: '',
			lifeSustainingStatementText: '',
			lifeSustainingSignature: '',
			lifeSustainingWitnessSignature: '',
			lifeSustainingWitnessName: '',
			lifeSustainingWitnessAddress: ''
		}
	};
}

function createValidAssessment(): AssessmentData {
	return {
		personalInformation: {
			fullLegalName: 'Jane Smith',
			dateOfBirth: '1960-05-15',
			nhsNumber: '943 476 5919',
			address: '10 Downing Street, London',
			postcode: 'SW1A 2AA',
			telephone: '020 7946 0958',
			email: 'jane.smith@example.com',
			gpName: 'Dr Robert Brown',
			gpPractice: 'Central Surgery',
			gpAddress: '1 High Street, London',
			gpTelephone: '020 7946 0000'
		},
		capacityDeclaration: {
			confirmsCapacity: 'yes',
			understandsConsequences: 'yes',
			noUndueInfluence: 'yes',
			professionalCapacityAssessment: 'yes',
			assessedByName: 'Dr Sarah Johnson',
			assessedByRole: 'Consultant Psychiatrist',
			assessmentDate: '2026-01-15',
			assessmentDetails: 'Patient demonstrates full understanding of consequences.'
		},
		circumstances: {
			specificCircumstances: 'In the event of advanced dementia where I can no longer recognise my family or communicate meaningfully.',
			medicalConditions: 'Currently diagnosed with early-stage Alzheimer\'s disease.',
			situationsDescription: 'When I am unable to make decisions for myself due to cognitive decline.'
		},
		treatmentsRefusedGeneral: {
			antibiotics: { treatment: 'Antibiotics', refused: 'yes', specification: 'Only refuse antibiotics for life-threatening infections in the circumstances described above.' },
			bloodTransfusion: { treatment: 'Blood Transfusion', refused: 'no', specification: '' },
			ivFluids: { treatment: 'IV Fluids', refused: 'no', specification: '' },
			tubeFeeding: { treatment: 'Tube Feeding', refused: 'yes', specification: 'Refuse all forms of tube feeding including PEG feeding.' },
			dialysis: { treatment: 'Dialysis', refused: 'no', specification: '' },
			ventilation: { treatment: 'Ventilation', refused: 'no', specification: '' },
			otherTreatments: []
		},
		treatmentsRefusedLifeSustaining: {
			cpr: { treatment: 'CPR', refused: 'yes', evenIfLifeAtRisk: 'yes', specification: 'I refuse CPR in all circumstances described above.' },
			mechanicalVentilation: { treatment: 'Mechanical Ventilation', refused: 'yes', evenIfLifeAtRisk: 'yes', specification: 'I refuse mechanical ventilation in all circumstances described above.' },
			artificialNutritionHydration: { treatment: 'Artificial Nutrition/Hydration', refused: 'yes', evenIfLifeAtRisk: 'yes', specification: 'I refuse artificial nutrition and hydration including IV and tube feeding.' },
			otherLifeSustaining: []
		},
		exceptionsConditions: {
			hasExceptions: 'yes',
			exceptionsDescription: 'This ADRT does not apply if there is a realistic prospect that I will regain capacity.',
			hasTimeLimitations: 'no',
			timeLimitationsDescription: '',
			invalidatingConditions: ''
		},
		otherWishes: {
			preferredCareSetting: 'I wish to remain at home if possible.',
			comfortMeasures: 'Please ensure adequate pain relief and comfort measures.',
			spiritualReligiousWishes: '',
			otherPreferences: 'I would like my family to be informed of my wishes.'
		},
		lastingPowerOfAttorney: {
			hasLPA: 'yes',
			lpaType: 'health-and-welfare',
			lpaRegistered: 'yes',
			lpaRegistrationDate: '2025-06-01',
			doneeNames: 'Michael Smith (husband)',
			relationshipBetweenADRTAndLPA: 'This ADRT takes precedence over the LPA for the specific treatments refused. The LPA attorney should be consulted for all other health and welfare decisions.'
		},
		healthcareProfessionalReview: {
			reviewedByClinicianName: 'Dr Sarah Johnson',
			reviewedByClinicianRole: 'Consultant Psychiatrist',
			reviewDate: '2026-01-20',
			clinicalOpinionOnCapacity: 'Patient has full mental capacity to make this decision. She understands the nature and consequences of each treatment refusal.',
			anyConcerns: 'no',
			concernsDetails: ''
		},
		legalSignatures: {
			patientSignature: 'yes',
			patientStatementOfUnderstanding: 'yes',
			patientSignatureDate: '2026-01-20',
			witnessSignature: 'yes',
			witnessName: 'Dr Sarah Johnson',
			witnessAddress: 'Central Hospital, London',
			witnessSignatureDate: '2026-01-20',
			lifeSustainingWrittenStatement: 'yes',
			lifeSustainingStatementText: 'I understand that the treatments I have refused may be necessary to sustain my life, and I confirm that my refusal of these treatments applies even if my life is at risk as a result.',
			lifeSustainingSignature: 'yes',
			lifeSustainingWitnessSignature: 'yes',
			lifeSustainingWitnessName: 'Dr Sarah Johnson',
			lifeSustainingWitnessAddress: 'Central Hospital, London'
		}
	};
}

describe('Validity Grading Engine', () => {
	it('returns draft for an empty assessment', () => {
		const data = createEmptyAssessment();
		const result = calculateValidity(data);
		expect(result.validityStatus).toBe('draft');
		expect(result.firedRules.length).toBeGreaterThan(0);
	});

	it('returns valid for a fully completed and legally compliant ADRT', () => {
		const data = createValidAssessment();
		const result = calculateValidity(data);
		expect(result.validityStatus).toBe('valid');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns invalid when life-sustaining refusal lacks "even if life at risk" statement', () => {
		const data = createValidAssessment();
		data.treatmentsRefusedLifeSustaining.cpr.evenIfLifeAtRisk = '';
		const result = calculateValidity(data);
		expect(result.validityStatus).toBe('invalid');
		expect(result.firedRules.some((r) => r.id === 'VR-001')).toBe(true);
	});

	it('returns invalid when life-sustaining refusal lacks witness signature', () => {
		const data = createValidAssessment();
		data.legalSignatures.lifeSustainingWitnessSignature = '';
		const result = calculateValidity(data);
		expect(result.validityStatus).toBe('invalid');
		expect(result.firedRules.some((r) => r.id === 'VR-006')).toBe(true);
	});

	it('returns invalid when life-sustaining refusal lacks written statement', () => {
		const data = createValidAssessment();
		data.legalSignatures.lifeSustainingWrittenStatement = '';
		const result = calculateValidity(data);
		expect(result.validityStatus).toBe('invalid');
		expect(result.firedRules.some((r) => r.id === 'VR-004')).toBe(true);
	});

	it('returns invalid when patient has not signed', () => {
		const data = createValidAssessment();
		data.legalSignatures.patientSignature = '';
		const result = calculateValidity(data);
		expect(result.validityStatus).toBe('invalid');
		expect(result.firedRules.some((r) => r.id === 'VR-007')).toBe(true);
	});

	it('returns invalid when capacity is not confirmed', () => {
		const data = createValidAssessment();
		data.capacityDeclaration.confirmsCapacity = '';
		const result = calculateValidity(data);
		expect(result.validityStatus).toBe('invalid');
	});

	it('returns complete when only recommended fields are missing', () => {
		const data = createValidAssessment();
		data.healthcareProfessionalReview.reviewedByClinicianName = '';
		data.healthcareProfessionalReview.reviewDate = '';
		data.personalInformation.nhsNumber = '';
		data.personalInformation.gpName = '';
		data.lastingPowerOfAttorney.hasLPA = '';
		const result = calculateValidity(data);
		expect(result.validityStatus).toBe('complete');
	});

	it('detects all rule IDs are unique', () => {
		const ids = validityRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('does not fire life-sustaining rules when no life-sustaining treatment is refused', () => {
		const data = createValidAssessment();
		data.treatmentsRefusedLifeSustaining.cpr.refused = 'no';
		data.treatmentsRefusedLifeSustaining.mechanicalVentilation.refused = 'no';
		data.treatmentsRefusedLifeSustaining.artificialNutritionHydration.refused = 'no';
		// Remove life-sustaining signatures since not needed
		data.legalSignatures.lifeSustainingWrittenStatement = '';
		data.legalSignatures.lifeSustainingSignature = '';
		data.legalSignatures.lifeSustainingWitnessSignature = '';
		const result = calculateValidity(data);
		const lifeSustainingRules = result.firedRules.filter((r) => r.category === 'Life-Sustaining Treatment');
		expect(lifeSustainingRules).toHaveLength(0);
	});
});

describe('Additional Flags Detection', () => {
	it('returns flags for empty assessment', () => {
		const data = createEmptyAssessment();
		const flags = detectAdditionalFlags(data);
		expect(flags.length).toBeGreaterThan(0);
	});

	it('flags life-sustaining refusal without witness', () => {
		const data = createValidAssessment();
		data.legalSignatures.lifeSustainingWitnessSignature = '';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-LS-001')).toBe(true);
	});

	it('flags missing "even if life at risk" written statement', () => {
		const data = createValidAssessment();
		data.legalSignatures.lifeSustainingWrittenStatement = '';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-LS-002')).toBe(true);
	});

	it('flags unsigned document', () => {
		const data = createValidAssessment();
		data.legalSignatures.patientSignature = '';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SIG-001')).toBe(true);
	});

	it('flags potential LPA conflict', () => {
		const data = createValidAssessment();
		data.lastingPowerOfAttorney.relationshipBetweenADRTAndLPA = '';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-LPA-001')).toBe(true);
	});

	it('flags no capacity assessment', () => {
		const data = createValidAssessment();
		data.capacityDeclaration.confirmsCapacity = '';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CAP-001')).toBe(true);
	});

	it('flags clinician concerns', () => {
		const data = createValidAssessment();
		data.healthcareProfessionalReview.anyConcerns = 'yes';
		data.healthcareProfessionalReview.concernsDetails = 'Patient may be under family pressure';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-REV-002')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createValidAssessment();
		data.legalSignatures.lifeSustainingWitnessSignature = '';
		data.healthcareProfessionalReview.reviewDate = '';
		data.personalInformation.gpName = '';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
