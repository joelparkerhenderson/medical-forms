import { describe, it, expect } from 'vitest';
import { calculateNIHSS } from './nihss-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { nihssItems } from './nihss-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1955-06-15',
			sex: 'female'
		},
		symptomOnset: {
			onsetTime: '',
			lastKnownWell: '',
			symptomProgression: 'sudden',
			modeOfArrival: 'ambulance'
		},
		levelOfConsciousness: {
			loc: 0,
			locQuestions: 0,
			locCommands: 0
		},
		bestGazeVisual: {
			bestGaze: 0,
			visual: 0
		},
		facialPalsy: {
			facialPalsy: 0,
			leftArm: 0,
			rightArm: 0,
			leftLeg: 0,
			rightLeg: 0
		},
		limbAtaxiaSensory: {
			limbAtaxia: 0,
			sensory: 0
		},
		languageDysarthria: {
			bestLanguage: 0,
			dysarthria: 0
		},
		extinctionInattention: {
			extinctionInattention: 0
		},
		riskFactors: {
			hypertension: 'no',
			diabetes: 'no',
			atrialFibrillation: 'no',
			previousStroke: 'no',
			smoking: 'no',
			hyperlipidemia: 'no',
			familyHistory: 'no'
		},
		currentMedications: {
			medications: [],
			allergies: [],
			anticoagulants: 'no',
			anticoagulantDetails: '',
			antiplatelets: 'no',
			antiplateletDetails: ''
		}
	};
}

describe('NIHSS Grading Engine', () => {
	it('returns NIHSS 0 for a patient with no stroke symptoms', () => {
		const data = createHealthyPatient();
		const result = calculateNIHSS(data);
		expect(result.nihssScore).toBe(0);
		expect(result.nihssCategoryLabel).toBe('No stroke symptoms');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns Minor stroke (1-4) for minor deficits', () => {
		const data = createHealthyPatient();
		data.facialPalsy.facialPalsy = 1;
		data.limbAtaxiaSensory.sensory = 1;

		const result = calculateNIHSS(data);
		expect(result.nihssScore).toBe(2);
		expect(result.nihssCategoryLabel).toBe('Minor stroke');
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns Moderate stroke (5-15) for moderate deficits', () => {
		const data = createHealthyPatient();
		data.levelOfConsciousness.loc = 1;
		data.bestGazeVisual.bestGaze = 1;
		data.facialPalsy.facialPalsy = 2;
		data.facialPalsy.rightArm = 3;
		data.languageDysarthria.bestLanguage = 1;

		const result = calculateNIHSS(data);
		expect(result.nihssScore).toBe(8);
		expect(result.nihssCategoryLabel).toBe('Moderate stroke');
	});

	it('returns Moderate to severe stroke (16-20) for significant deficits', () => {
		const data = createHealthyPatient();
		data.levelOfConsciousness.loc = 2;
		data.levelOfConsciousness.locQuestions = 2;
		data.bestGazeVisual.bestGaze = 2;
		data.facialPalsy.facialPalsy = 3;
		data.facialPalsy.rightArm = 4;
		data.facialPalsy.rightLeg = 4;
		data.languageDysarthria.bestLanguage = 1;

		const result = calculateNIHSS(data);
		expect(result.nihssScore).toBe(18);
		expect(result.nihssCategoryLabel).toBe('Moderate to severe stroke');
	});

	it('returns Severe stroke (21-42) for maximum deficits', () => {
		const data = createHealthyPatient();
		data.levelOfConsciousness.loc = 3;
		data.levelOfConsciousness.locQuestions = 2;
		data.levelOfConsciousness.locCommands = 2;
		data.bestGazeVisual.bestGaze = 2;
		data.bestGazeVisual.visual = 3;
		data.facialPalsy.facialPalsy = 3;
		data.facialPalsy.leftArm = 4;
		data.facialPalsy.rightArm = 4;
		data.facialPalsy.leftLeg = 4;
		data.facialPalsy.rightLeg = 4;
		data.limbAtaxiaSensory.limbAtaxia = 2;
		data.limbAtaxiaSensory.sensory = 2;
		data.languageDysarthria.bestLanguage = 3;
		data.languageDysarthria.dysarthria = 2;
		data.extinctionInattention.extinctionInattention = 2;

		const result = calculateNIHSS(data);
		expect(result.nihssScore).toBe(42);
		expect(result.nihssCategoryLabel).toBe('Severe stroke');
	});

	it('detects all item IDs are unique', () => {
		const ids = nihssItems.map((q) => q.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('handles null scores gracefully (unanswered items)', () => {
		const data = createHealthyPatient();
		data.facialPalsy.facialPalsy = 2;
		data.facialPalsy.leftArm = null;
		data.limbAtaxiaSensory.sensory = 1;

		const result = calculateNIHSS(data);
		expect(result.nihssScore).toBe(3);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no critical flags for healthy patient (only onset flag)', () => {
		const data = createHealthyPatient();
		data.symptomOnset.symptomProgression = '';
		const flags = detectAdditionalFlags(data);
		expect(flags.filter((f) => f.priority === 'high')).toHaveLength(0);
	});

	it('flags acute onset', () => {
		const data = createHealthyPatient();
		data.symptomOnset.symptomProgression = 'sudden';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ONSET-001')).toBe(true);
	});

	it('flags severe NIHSS >15', () => {
		const data = createHealthyPatient();
		data.levelOfConsciousness.loc = 3;
		data.facialPalsy.rightArm = 4;
		data.facialPalsy.rightLeg = 4;
		data.languageDysarthria.bestLanguage = 3;
		data.bestGazeVisual.visual = 3;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SEVERE-001')).toBe(true);
	});

	it('flags LOC impairment', () => {
		const data = createHealthyPatient();
		data.levelOfConsciousness.loc = 2;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-LOC-001')).toBe(true);
	});

	it('flags language deficit', () => {
		const data = createHealthyPatient();
		data.languageDysarthria.bestLanguage = 2;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-LANGUAGE-001')).toBe(true);
	});

	it('flags atrial fibrillation', () => {
		const data = createHealthyPatient();
		data.riskFactors.atrialFibrillation = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-AFIB-001')).toBe(true);
	});

	it('flags anticoagulant use', () => {
		const data = createHealthyPatient();
		data.currentMedications.anticoagulants = 'yes';
		data.currentMedications.anticoagulantDetails = 'Warfarin';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ANTICOAG-001')).toBe(true);
	});

	it('flags anaphylaxis allergy', () => {
		const data = createHealthyPatient();
		data.currentMedications.allergies = [{ allergen: 'Contrast dye', reaction: 'Anaphylaxis', severity: 'anaphylaxis' }];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Allergy' && f.priority === 'high')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.symptomOnset.symptomProgression = 'sudden';
		data.riskFactors.hypertension = 'yes';
		data.riskFactors.diabetes = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
