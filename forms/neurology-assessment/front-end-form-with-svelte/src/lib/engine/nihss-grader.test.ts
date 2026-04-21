import { describe, it, expect } from 'vitest';
import { calculateNIHSS } from './nihss-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { nihssRules } from './nihss-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'John',
			lastName: 'Doe',
			dateOfBirth: '1960-05-15',
			sex: 'male',
			weight: 80,
			height: 178
		},
		chiefComplaint: {
			primarySymptom: '',
			onsetDate: '',
			onsetType: '',
			duration: '',
			progression: '',
			associatedSymptoms: '',
			precipitatingEvent: ''
		},
		nihssAssessment: {
			consciousness: 0,
			consciousnessQuestions: 0,
			consciousnessCommands: 0,
			gaze: 0,
			visual: 0,
			facialPalsy: 0,
			motorLeftArm: 0,
			motorRightArm: 0,
			motorLeftLeg: 0,
			motorRightLeg: 0,
			limbAtaxia: 0,
			sensory: 0,
			language: 0,
			dysarthria: 0,
			extinctionInattention: 0
		},
		headacheAssessment: {
			headachePresent: 'no',
			headacheType: '',
			frequency: '',
			severity: null,
			aura: '',
			auraDescription: '',
			triggers: '',
			redFlagSuddenOnset: 'no',
			redFlagWorstEver: 'no',
			redFlagFever: 'no',
			redFlagNeckStiffness: 'no',
			redFlagNeurologicalDeficit: 'no'
		},
		seizureHistory: {
			seizureHistory: 'no',
			seizureType: '',
			frequency: '',
			lastSeizureDate: '',
			triggers: '',
			aura: '',
			auraDescription: '',
			postIctalState: '',
			statusEpilepticus: 'no'
		},
		motorSensoryExam: {
			strengthUpperLeft: '5',
			strengthUpperRight: '5',
			strengthLowerLeft: '5',
			strengthLowerRight: '5',
			tone: 'normal',
			reflexes: '2',
			plantarResponseLeft: 'flexor',
			plantarResponseRight: 'flexor',
			sensation: 'normal',
			sensationDetails: '',
			coordination: 'yes',
			coordinationDetails: '',
			gait: 'normal'
		},
		cognitiveAssessment: {
			orientation: 'fully-oriented',
			attentionNormal: 'yes',
			memoryShortTerm: 'yes',
			memoryLongTerm: 'yes',
			languageNormal: 'yes',
			languageDetails: '',
			visuospatialNormal: 'yes',
			executiveFunctionNormal: 'yes',
			mmseScore: 30
		},
		currentMedications: {
			medications: [],
			anticonvulsants: 'no',
			anticonvulsantDetails: '',
			migraineProphylaxis: 'no',
			migraineProphylaxisDetails: '',
			neuropathicPainMeds: 'no',
			neuropathicPainDetails: '',
			anticoagulants: 'no',
			anticoagulantDetails: ''
		},
		diagnosticResults: {
			mriCtPerformed: 'no',
			mriCtFinding: '',
			mriCtDetails: '',
			eegPerformed: 'no',
			eegFinding: '',
			eegDetails: '',
			emgNcsPerformed: 'no',
			emgNcsDetails: '',
			lumbarPuncturePerformed: 'no',
			lumbarPunctureDetails: ''
		},
		functionalSocial: {
			mrsScore: 0,
			drivingStatus: 'driving',
			drivingRestrictionDetails: '',
			employmentStatus: 'employed',
			employmentImpact: '',
			supportNeeds: '',
			livingSituation: 'independent',
			carePlanRequired: 'no'
		}
	};
}

describe('NIHSS Grading Engine', () => {
	it('returns NIHSS 0 for a healthy patient', () => {
		const data = createHealthyPatient();
		const result = calculateNIHSS(data);
		expect(result.nihssScore).toBe(0);
		expect(result.nihssSeverity).toBe('No stroke symptoms');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns minor stroke score for mild deficits', () => {
		const data = createHealthyPatient();
		data.nihssAssessment.facialPalsy = 1;
		data.nihssAssessment.dysarthria = 1;
		data.nihssAssessment.sensory = 1;

		const result = calculateNIHSS(data);
		expect(result.nihssScore).toBe(3);
		expect(result.nihssSeverity).toBe('Minor stroke');
		expect(result.firedRules.length).toBe(3);
	});

	it('returns moderate stroke score for significant deficits', () => {
		const data = createHealthyPatient();
		data.nihssAssessment.consciousness = 1;
		data.nihssAssessment.gaze = 1;
		data.nihssAssessment.facialPalsy = 2;
		data.nihssAssessment.motorLeftArm = 3;
		data.nihssAssessment.motorLeftLeg = 3;
		data.nihssAssessment.sensory = 1;
		data.nihssAssessment.language = 1;

		const result = calculateNIHSS(data);
		expect(result.nihssScore).toBe(12);
		expect(result.nihssSeverity).toBe('Moderate stroke');
	});

	it('returns severe stroke score for maximum deficits', () => {
		const data = createHealthyPatient();
		data.nihssAssessment.consciousness = 3;
		data.nihssAssessment.consciousnessQuestions = 2;
		data.nihssAssessment.consciousnessCommands = 2;
		data.nihssAssessment.gaze = 2;
		data.nihssAssessment.visual = 3;
		data.nihssAssessment.facialPalsy = 3;
		data.nihssAssessment.motorLeftArm = 4;
		data.nihssAssessment.motorRightArm = 4;
		data.nihssAssessment.motorLeftLeg = 4;
		data.nihssAssessment.motorRightLeg = 4;
		data.nihssAssessment.limbAtaxia = 2;
		data.nihssAssessment.sensory = 2;
		data.nihssAssessment.language = 3;
		data.nihssAssessment.dysarthria = 2;
		data.nihssAssessment.extinctionInattention = 2;

		const result = calculateNIHSS(data);
		expect(result.nihssScore).toBe(42);
		expect(result.nihssSeverity).toBe('Severe stroke');
	});

	it('detects all rule IDs are unique', () => {
		const ids = nihssRules.map((r) => r.id);
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

	it('flags acute stroke symptoms', () => {
		const data = createHealthyPatient();
		data.nihssAssessment.motorLeftArm = 4;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-STROKE-001')).toBe(true);
	});

	it('flags sudden onset', () => {
		const data = createHealthyPatient();
		data.chiefComplaint.onsetType = 'sudden';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-STROKE-002')).toBe(true);
	});

	it('flags status epilepticus', () => {
		const data = createHealthyPatient();
		data.seizureHistory.statusEpilepticus = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SEIZURE-001')).toBe(true);
	});

	it('flags anticoagulant use', () => {
		const data = createHealthyPatient();
		data.currentMedications.anticoagulants = 'yes';
		data.currentMedications.anticoagulantDetails = 'warfarin';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ANTICOAG-001')).toBe(true);
	});

	it('flags thunderclap headache', () => {
		const data = createHealthyPatient();
		data.headacheAssessment.headachePresent = 'yes';
		data.headacheAssessment.redFlagSuddenOnset = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-HEADACHE-001')).toBe(true);
	});

	it('flags intracranial haemorrhage on imaging', () => {
		const data = createHealthyPatient();
		data.diagnosticResults.mriCtPerformed = 'yes';
		data.diagnosticResults.mriCtFinding = 'haemorrhage';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-IMAGING-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.nihssAssessment.motorLeftArm = 4;
		data.currentMedications.anticoagulants = 'yes';
		data.functionalSocial.drivingStatus = 'not-driving-medical';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
