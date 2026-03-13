import { describe, it, expect } from 'vitest';
import { calculateDAS28 } from './das28-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { das28Rules } from './das28-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Doe',
			dateOfBirth: '1975-06-15',
			sex: 'female',
			weight: 65,
			height: 165,
			bmi: 23.9
		},
		chiefComplaint: {
			primaryJointComplaint: '',
			onsetDate: '',
			durationMonths: null,
			morningStiffnessDurationMinutes: null,
			symmetricInvolvement: ''
		},
		jointAssessment: {
			tenderJointCount28: 0,
			swollenJointCount28: 0,
			painVAS: 0,
			patientGlobalVAS: 0
		},
		diseaseHistory: {
			primaryDiagnosis: '',
			diagnosisDate: '',
			diseaseDurationYears: null,
			previousDMARDs: '',
			previousBiologics: '',
			remissionPeriods: '',
			remissionDetails: ''
		},
		extraArticularFeatures: {
			rheumatoidNodules: 'no',
			skinRash: 'no',
			skinRashDetails: '',
			eyeDryness: 'no',
			uveitis: 'no',
			uveitisDetails: '',
			interstitialLungDisease: 'no',
			ildDetails: '',
			cardiovascularInvolvement: 'no',
			cardiovascularDetails: ''
		},
		laboratoryResults: {
			esr: 5,
			crp: 2,
			rheumatoidFactor: 'no',
			antiCCP: 'no',
			ana: 'no',
			hlaB27: 'no',
			haemoglobin: 140,
			whiteBloodCellCount: 7.0,
			plateletCount: 250,
			creatinine: 70,
			egfr: 90,
			alt: 20,
			ast: 18
		},
		currentMedications: {
			dmards: [],
			biologics: [],
			nsaids: [],
			steroids: [],
			painMedication: [],
			supplements: []
		},
		allergies: {
			drugAllergies: [],
			latexAllergy: 'no'
		},
		functionalAssessment: {
			haqDiScore: 0,
			gripStrengthLeft: null,
			gripStrengthRight: null,
			walkingAbility: 'independent',
			adlLimitations: '',
			workDisability: 'no',
			workDisabilityDetails: ''
		},
		comorbiditiesSocial: {
			cardiovascularRisk: 'no',
			cardiovascularRiskDetails: '',
			osteoporosis: 'no',
			osteoporosisOnTreatment: '',
			recentInfections: 'no',
			recentInfectionDetails: '',
			tuberculosisScreening: '',
			vaccinationStatusUpToDate: 'yes',
			vaccinationDetails: '',
			smoking: 'never',
			smokingPackYears: null,
			exerciseFrequency: 'regular'
		}
	};
}

describe('DAS28 Grading Engine', () => {
	it('returns remission for a healthy patient with low inflammation', () => {
		const data = createHealthyPatient();
		const result = calculateDAS28(data);
		expect(result.das28Score).not.toBeNull();
		expect(result.das28Score!).toBeLessThan(2.6);
		expect(result.diseaseActivity).toBe('remission');
	});

	it('returns low disease activity for mild joint involvement', () => {
		const data = createHealthyPatient();
		data.jointAssessment.tenderJointCount28 = 3;
		data.jointAssessment.swollenJointCount28 = 2;
		data.laboratoryResults.esr = 15;
		data.jointAssessment.patientGlobalVAS = 30;

		const result = calculateDAS28(data);
		expect(result.das28Score).not.toBeNull();
		expect(result.das28Score!).toBeGreaterThanOrEqual(2.6);
		expect(result.das28Score!).toBeLessThan(3.2);
		expect(result.diseaseActivity).toBe('low');
	});

	it('returns moderate disease activity for moderate joint involvement', () => {
		const data = createHealthyPatient();
		data.jointAssessment.tenderJointCount28 = 8;
		data.jointAssessment.swollenJointCount28 = 6;
		data.laboratoryResults.esr = 35;
		data.jointAssessment.patientGlobalVAS = 55;

		const result = calculateDAS28(data);
		expect(result.das28Score).not.toBeNull();
		expect(result.das28Score!).toBeGreaterThanOrEqual(3.2);
		expect(result.das28Score!).toBeLessThanOrEqual(5.1);
		expect(result.diseaseActivity).toBe('moderate');
	});

	it('returns high disease activity for severe joint involvement', () => {
		const data = createHealthyPatient();
		data.jointAssessment.tenderJointCount28 = 20;
		data.jointAssessment.swollenJointCount28 = 16;
		data.laboratoryResults.esr = 60;
		data.jointAssessment.patientGlobalVAS = 80;

		const result = calculateDAS28(data);
		expect(result.das28Score).not.toBeNull();
		expect(result.das28Score!).toBeGreaterThan(5.1);
		expect(result.diseaseActivity).toBe('high');
	});

	it('returns null score when ESR is missing', () => {
		const data = createHealthyPatient();
		data.laboratoryResults.esr = null;

		const result = calculateDAS28(data);
		expect(result.das28Score).toBeNull();
		expect(result.diseaseActivity).toBeNull();
	});

	it('detects all rule IDs are unique', () => {
		const ids = das28Rules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('calculates DAS28 correctly using the formula', () => {
		const data = createHealthyPatient();
		// Known values: TJC=4, SJC=3, ESR=25, VAS=50
		data.jointAssessment.tenderJointCount28 = 4;
		data.jointAssessment.swollenJointCount28 = 3;
		data.laboratoryResults.esr = 25;
		data.jointAssessment.patientGlobalVAS = 50;

		const result = calculateDAS28(data);
		// Manual calculation: 0.56*sqrt(4) + 0.28*sqrt(3) + 0.70*ln(25) + 0.014*50
		// = 0.56*2 + 0.28*1.732 + 0.70*3.219 + 0.70
		// = 1.12 + 0.485 + 2.253 + 0.70 = 4.558
		expect(result.das28Score).not.toBeNull();
		expect(result.das28Score!).toBeCloseTo(4.56, 1);
		expect(result.diseaseActivity).toBe('moderate');
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags high disease activity', () => {
		const data = createHealthyPatient();
		data.jointAssessment.tenderJointCount28 = 20;
		data.jointAssessment.swollenJointCount28 = 16;
		data.laboratoryResults.esr = 60;
		data.jointAssessment.patientGlobalVAS = 80;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-DAS28-001')).toBe(true);
	});

	it('flags interstitial lung disease', () => {
		const data = createHealthyPatient();
		data.extraArticularFeatures.interstitialLungDisease = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ILD-001')).toBe(true);
	});

	it('flags cervical spine risk in long-standing RA', () => {
		const data = createHealthyPatient();
		data.diseaseHistory.primaryDiagnosis = 'rheumatoid-arthritis';
		data.diseaseHistory.diseaseDurationYears = 10;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CSPINE-001')).toBe(true);
	});

	it('flags immunosuppression with recent infection', () => {
		const data = createHealthyPatient();
		data.comorbiditiesSocial.recentInfections = 'yes';
		data.currentMedications.biologics = [{ name: 'Adalimumab', dose: '40mg', frequency: 'biweekly' }];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-INFECT-001')).toBe(true);
	});

	it('flags uveitis', () => {
		const data = createHealthyPatient();
		data.extraArticularFeatures.uveitis = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-UVEITIS-001')).toBe(true);
	});

	it('flags anaphylaxis allergy', () => {
		const data = createHealthyPatient();
		data.allergies.drugAllergies = [
			{ allergen: 'Sulfonamides', reaction: 'Anaphylaxis', severity: 'anaphylaxis' }
		];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Allergy' && f.priority === 'high')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.extraArticularFeatures.interstitialLungDisease = 'yes';
		data.extraArticularFeatures.uveitis = 'yes';
		data.comorbiditiesSocial.osteoporosis = 'yes';
		data.currentMedications.steroids = [{ name: 'Prednisolone', dose: '5mg', frequency: 'daily' }];
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
