import { describe, it, expect } from 'vitest';
import { calculateHearingGrade } from './hearing-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { hearingRules } from './hearing-rules';
import type { AssessmentData } from './types';

function createNormalPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Doe',
			dateOfBirth: '1970-05-15',
			sex: 'female'
		},
		chiefComplaint: {
			primaryConcern: '',
			affectedEar: '',
			onset: '',
			duration: '',
			progression: ''
		},
		hearingHistory: {
			noiseExposure: 'no',
			occupationalNoise: 'no',
			occupationalNoiseDetails: '',
			recreationalNoise: 'no',
			recreationalNoiseDetails: '',
			previousHearingTests: 'no',
			previousTestDetails: '',
			hearingAidUse: 'no',
			hearingAidDetails: ''
		},
		audiometricResults: {
			pureToneAverageRight: 15,
			pureToneAverageLeft: 15,
			airConductionRight: '',
			airConductionLeft: '',
			boneConductionRight: '',
			boneConductionLeft: '',
			airBoneGapRight: null,
			airBoneGapLeft: null,
			speechRecognitionThresholdRight: null,
			speechRecognitionThresholdLeft: null,
			wordRecognitionScoreRight: 96,
			wordRecognitionScoreLeft: 96,
			hearingLossType: ''
		},
		tinnitusAssessment: {
			presence: 'no',
			affectedEar: '',
			character: '',
			severity: '',
			duration: '',
			impactOnDailyLife: '',
			tinnitusHandicapInventoryScore: null
		},
		vestibularSymptoms: {
			vertigo: 'no',
			vertigoDetails: '',
			dizziness: 'no',
			balanceProblems: 'no',
			dixHallpike: 'no',
			nystagmus: 'no',
			fallsHistory: 'no',
			fallsFrequency: ''
		},
		otoscopicFindings: {
			earCanalRight: 'normal',
			earCanalLeft: 'normal',
			tympanicMembraneRight: 'normal',
			tympanicMembraneLeft: 'normal',
			middleEarRight: '',
			middleEarLeft: '',
			earWaxRight: 'no',
			earWaxLeft: 'no',
			dischargeRight: 'no',
			dischargeLeft: 'no',
			previousSurgery: 'no',
			previousSurgeryDetails: ''
		},
		medicalHistory: {
			ototoxicMedications: 'no',
			ototoxicMedicationDetails: '',
			autoimmune: 'no',
			autoimmuneDetails: '',
			menieres: 'no',
			otosclerosis: 'no',
			acousticNeuroma: 'no',
			infections: 'no',
			infectionDetails: ''
		},
		functionalCommunication: {
			communicationDifficulties: 'no',
			communicationDetails: '',
			hearingAidCandidacy: 'no',
			assistiveDeviceNeeds: 'no',
			assistiveDeviceDetails: '',
			workImpact: '',
			socialImpact: '',
			hhieScore: null
		}
	};
}

describe('Hearing Grading Engine', () => {
	it('returns normal hearing for a patient with normal PTA', () => {
		const data = createNormalPatient();
		const result = calculateHearingGrade(data);
		expect(result.hearingGrade).toBe('normal');
	});

	it('returns mild hearing loss for PTA 26-40 dB', () => {
		const data = createNormalPatient();
		data.audiometricResults.pureToneAverageRight = 35;
		data.audiometricResults.pureToneAverageLeft = 30;

		const result = calculateHearingGrade(data);
		expect(result.hearingGrade).toBe('mild');
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns moderate hearing loss for PTA 41-60 dB', () => {
		const data = createNormalPatient();
		data.audiometricResults.pureToneAverageRight = 50;
		data.audiometricResults.pureToneAverageLeft = 45;

		const result = calculateHearingGrade(data);
		expect(result.hearingGrade).toBe('moderate');
	});

	it('returns severe hearing loss for PTA 61-80 dB', () => {
		const data = createNormalPatient();
		data.audiometricResults.pureToneAverageRight = 70;
		data.audiometricResults.pureToneAverageLeft = 65;

		const result = calculateHearingGrade(data);
		expect(result.hearingGrade).toBe('severe');
	});

	it('returns profound hearing loss for PTA >80 dB', () => {
		const data = createNormalPatient();
		data.audiometricResults.pureToneAverageRight = 90;
		data.audiometricResults.pureToneAverageLeft = 85;

		const result = calculateHearingGrade(data);
		expect(result.hearingGrade).toBe('profound');
	});

	it('uses the worse ear for grading', () => {
		const data = createNormalPatient();
		data.audiometricResults.pureToneAverageRight = 15;
		data.audiometricResults.pureToneAverageLeft = 65;

		const result = calculateHearingGrade(data);
		expect(result.hearingGrade).toBe('severe');
	});

	it('detects all rule IDs are unique', () => {
		const ids = hearingRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for normal patient', () => {
		const data = createNormalPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags sudden onset hearing loss', () => {
		const data = createNormalPatient();
		data.chiefComplaint.onset = 'sudden';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SUDDEN-001')).toBe(true);
	});

	it('flags asymmetric hearing loss', () => {
		const data = createNormalPatient();
		data.audiometricResults.pureToneAverageRight = 15;
		data.audiometricResults.pureToneAverageLeft = 45;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ASYMM-001')).toBe(true);
	});

	it('flags pulsatile tinnitus', () => {
		const data = createNormalPatient();
		data.tinnitusAssessment.presence = 'yes';
		data.tinnitusAssessment.character = 'pulsatile';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PULSATILE-001')).toBe(true);
	});

	it('flags ototoxic medication use', () => {
		const data = createNormalPatient();
		data.medicalHistory.ototoxicMedications = 'yes';
		data.medicalHistory.ototoxicMedicationDetails = 'Gentamicin';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-OTOTOXIC-001')).toBe(true);
	});

	it('flags acoustic neuroma', () => {
		const data = createNormalPatient();
		data.medicalHistory.acousticNeuroma = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-NEUROMA-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createNormalPatient();
		data.chiefComplaint.onset = 'sudden';
		data.medicalHistory.ototoxicMedications = 'yes';
		data.hearingHistory.occupationalNoise = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
