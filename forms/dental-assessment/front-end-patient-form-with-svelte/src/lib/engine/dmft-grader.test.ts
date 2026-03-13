import { describe, it, expect } from 'vitest';
import { calculateDMFT } from './dmft-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { dmftRules } from './dmft-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'John',
			lastName: 'Doe',
			dateOfBirth: '1985-01-01',
			sex: 'male',
			emergencyContactName: 'Jane Doe',
			emergencyContactPhone: '07700900000'
		},
		chiefComplaint: {
			primaryConcern: 'Routine check-up',
			painLocation: '',
			painSeverity: null,
			painOnset: '',
			painDuration: ''
		},
		dentalHistory: {
			lastDentalVisit: '2025-06-01',
			visitFrequency: 'every-6-months',
			brushingFrequency: 'twice-daily',
			flossingFrequency: 'daily',
			dentalAnxietyLevel: 'none'
		},
		dmftAssessment: {
			decayedTeeth: 0,
			missingTeeth: 0,
			filledTeeth: 0,
			toothChartNotes: ''
		},
		periodontalAssessment: {
			gumBleeding: 'no',
			pocketDepthsAboveNormal: 'no',
			pocketDepthDetails: '',
			gumRecession: 'no',
			gumRecessionDetails: '',
			toothMobility: 'no',
			mobilityDetails: '',
			furcationInvolvement: 'no',
			furcationDetails: ''
		},
		oralExamination: {
			softTissueFindings: '',
			tmjPain: 'no',
			tmjClicking: 'no',
			tmjLimitedOpening: 'no',
			occlusion: 'class-I',
			oralHygieneIndex: 'good'
		},
		medicalHistory: {
			cardiovascularDisease: 'no',
			cardiovascularDetails: '',
			diabetes: 'no',
			diabetesType: '',
			diabetesControlled: '',
			bleedingDisorder: 'no',
			bleedingDetails: '',
			bisphosphonateUse: 'no',
			bisphosphonateDetails: '',
			radiationTherapyHeadNeck: 'no',
			radiationDetails: '',
			immunosuppression: 'no',
			immunosuppressionDetails: ''
		},
		currentMedications: {
			anticoagulantUse: 'no',
			anticoagulantType: '',
			bisphosphonateCurrentUse: 'no',
			bisphosphonateName: '',
			immunosuppressantUse: 'no',
			immunosuppressantName: '',
			allergyToAnaesthetics: 'no',
			anaestheticAllergyDetails: '',
			otherMedications: ''
		},
		radiographicFindings: {
			panoramicFindings: '',
			periapicalFindings: '',
			bitewingFindings: '',
			boneLossPattern: 'none',
			boneLossDetails: ''
		}
	};
}

describe('DMFT Grading Engine', () => {
	it('returns caries-free for a healthy patient with DMFT 0', () => {
		const data = createHealthyPatient();
		const result = calculateDMFT(data);
		expect(result.dmftScore).toBe(0);
		expect(result.dmftCategory).toBe('caries-free');
	});

	it('returns very-low for DMFT 3', () => {
		const data = createHealthyPatient();
		data.dmftAssessment.decayedTeeth = 1;
		data.dmftAssessment.filledTeeth = 2;
		const result = calculateDMFT(data);
		expect(result.dmftScore).toBe(3);
		expect(result.dmftCategory).toBe('very-low');
	});

	it('returns low for DMFT 8', () => {
		const data = createHealthyPatient();
		data.dmftAssessment.decayedTeeth = 2;
		data.dmftAssessment.missingTeeth = 3;
		data.dmftAssessment.filledTeeth = 3;
		const result = calculateDMFT(data);
		expect(result.dmftScore).toBe(8);
		expect(result.dmftCategory).toBe('low');
	});

	it('returns moderate for DMFT 14', () => {
		const data = createHealthyPatient();
		data.dmftAssessment.decayedTeeth = 4;
		data.dmftAssessment.missingTeeth = 5;
		data.dmftAssessment.filledTeeth = 5;
		const result = calculateDMFT(data);
		expect(result.dmftScore).toBe(14);
		expect(result.dmftCategory).toBe('moderate');
	});

	it('returns high for DMFT 18', () => {
		const data = createHealthyPatient();
		data.dmftAssessment.decayedTeeth = 6;
		data.dmftAssessment.missingTeeth = 6;
		data.dmftAssessment.filledTeeth = 6;
		const result = calculateDMFT(data);
		expect(result.dmftScore).toBe(18);
		expect(result.dmftCategory).toBe('high');
	});

	it('returns very-high for DMFT 25', () => {
		const data = createHealthyPatient();
		data.dmftAssessment.decayedTeeth = 10;
		data.dmftAssessment.missingTeeth = 10;
		data.dmftAssessment.filledTeeth = 5;
		const result = calculateDMFT(data);
		expect(result.dmftScore).toBe(25);
		expect(result.dmftCategory).toBe('very-high');
	});

	it('fires periodontal rules when gum bleeding and mobility present', () => {
		const data = createHealthyPatient();
		data.periodontalAssessment.gumBleeding = 'yes';
		data.periodontalAssessment.toothMobility = 'yes';
		const result = calculateDMFT(data);
		expect(result.firedRules.some((r) => r.id === 'PERIO-001')).toBe(true);
		expect(result.firedRules.some((r) => r.id === 'PERIO-004')).toBe(true);
	});

	it('detects all rule IDs are unique', () => {
		const ids = dmftRules.map((r) => r.id);
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

	it('flags severe dental pain as potential abscess', () => {
		const data = createHealthyPatient();
		data.chiefComplaint.painSeverity = 8;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ABSCESS-001')).toBe(true);
	});

	it('flags anticoagulant use', () => {
		const data = createHealthyPatient();
		data.currentMedications.anticoagulantUse = 'yes';
		data.currentMedications.anticoagulantType = 'warfarin';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ANTICOAG-001')).toBe(true);
	});

	it('flags bisphosphonate use', () => {
		const data = createHealthyPatient();
		data.currentMedications.bisphosphonateCurrentUse = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BISPHOS-001')).toBe(true);
	});

	it('flags severe dental anxiety', () => {
		const data = createHealthyPatient();
		data.dentalHistory.dentalAnxietyLevel = 'severe';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ANXIETY-001')).toBe(true);
	});

	it('flags bleeding disorder', () => {
		const data = createHealthyPatient();
		data.medicalHistory.bleedingDisorder = 'yes';
		data.medicalHistory.bleedingDetails = 'von Willebrand disease';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BLEEDING-001')).toBe(true);
	});

	it('flags allergy to anaesthetics', () => {
		const data = createHealthyPatient();
		data.currentMedications.allergyToAnaesthetics = 'yes';
		data.currentMedications.anaestheticAllergyDetails = 'Lidocaine';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ANAES-ALLERGY-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.currentMedications.anticoagulantUse = 'yes';
		data.dentalHistory.dentalAnxietyLevel = 'severe';
		data.medicalHistory.cardiovascularDisease = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
