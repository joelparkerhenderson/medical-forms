import { describe, it, expect } from 'vitest';
import { calculateDASH } from './dash-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { dashQuestions } from './dash-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1985-06-15',
			sex: 'female',
			occupation: 'Office worker',
			dominantHand: 'right'
		},
		chiefComplaint: {
			primaryConcern: 'Mild shoulder discomfort',
			affectedJoint: 'Shoulder',
			side: 'right',
			duration: '2 weeks',
			onsetType: 'gradual',
			aggravatingFactors: []
		},
		painAssessment: {
			currentPainLevel: 2,
			worstPain: 4,
			bestPain: 0,
			painCharacter: 'dull',
			painFrequency: 'intermittent',
			nightPain: 'no',
			painWithWeightBearing: 'no'
		},
		dashQuestionnaire: {
			q1: 1, q2: 1, q3: 1, q4: 1, q5: 1,
			q6: 1, q7: 1, q8: 1, q9: 1, q10: 1,
			q11: 1, q12: 1, q13: 1, q14: 1, q15: 1,
			q16: 1, q17: 1, q18: 1, q19: 1, q20: 1,
			q21: 1, q22: 1, q23: 1, q24: 1, q25: 1,
			q26: 1, q27: 1, q28: 1, q29: 1, q30: 1
		},
		rangeOfMotion: {
			joint: 'Shoulder',
			flexion: 180,
			extension: 60,
			abduction: 180,
			adduction: 45,
			internalRotation: 70,
			externalRotation: 90,
			notes: ''
		},
		strengthTesting: {
			gripStrengthLeft: 35,
			gripStrengthRight: 38,
			manualMuscleGrade: '5/5',
			specificWeaknesses: ''
		},
		functionalLimitations: {
			difficultyWithADLs: [],
			mobilityAids: [],
			workRestrictions: '',
			sportRestrictions: ''
		},
		imagingHistory: {
			xRay: { performed: 'no', date: '', findings: '' },
			mri: { performed: 'no', date: '', findings: '' },
			ctScan: { performed: 'no', date: '', findings: '' },
			ultrasound: { performed: 'no', date: '', findings: '' }
		},
		currentTreatment: {
			medications: [],
			physicalTherapy: 'no',
			physicalTherapyDetails: '',
			injections: 'no',
			injectionDetails: '',
			braceOrSplint: 'no',
			braceDetails: '',
			otherTreatments: '',
			allergies: []
		},
		surgicalHistory: {
			previousOrthopedicSurgery: 'no',
			surgeries: [],
			anesthesiaComplications: 'no',
			anesthesiaDetails: '',
			willingToConsiderSurgery: ''
		}
	};
}

describe('DASH Grading Engine', () => {
	it('returns DASH 0 for a patient with no disability', () => {
		const data = createHealthyPatient();
		const result = calculateDASH(data);
		expect(result.dashScore).toBe(0);
		expect(result.dashCategoryLabel).toBe('No disability');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns Mild disability (21-40) for mild symptoms', () => {
		const data = createHealthyPatient();
		data.dashQuestionnaire.q1 = 3;
		data.dashQuestionnaire.q2 = 2;
		data.dashQuestionnaire.q5 = 3;
		data.dashQuestionnaire.q7 = 3;
		data.dashQuestionnaire.q11 = 3;
		data.dashQuestionnaire.q18 = 4;
		data.dashQuestionnaire.q19 = 3;
		data.dashQuestionnaire.q24 = 3;
		data.dashQuestionnaire.q25 = 3;
		data.dashQuestionnaire.q27 = 2;

		const result = calculateDASH(data);
		expect(result.dashScore).toBeGreaterThanOrEqual(21);
		expect(result.dashScore).toBeLessThanOrEqual(40);
		expect(result.dashCategoryLabel).toBe('Mild disability');
	});

	it('returns Moderate disability (41-60) for moderate symptoms', () => {
		const data = createHealthyPatient();
		// Set most items to 3 (moderate difficulty)
		const keys = Object.keys(data.dashQuestionnaire) as (keyof typeof data.dashQuestionnaire)[];
		for (const key of keys) {
			data.dashQuestionnaire[key] = 3;
		}
		// Some at 4
		data.dashQuestionnaire.q7 = 4;
		data.dashQuestionnaire.q11 = 4;
		data.dashQuestionnaire.q18 = 4;

		const result = calculateDASH(data);
		expect(result.dashScore).toBeGreaterThanOrEqual(41);
		expect(result.dashScore).toBeLessThanOrEqual(60);
		expect(result.dashCategoryLabel).toBe('Moderate disability');
	});

	it('returns Very severe disability (81-100) for maximum impact', () => {
		const data = createHealthyPatient();
		const keys = Object.keys(data.dashQuestionnaire) as (keyof typeof data.dashQuestionnaire)[];
		for (const key of keys) {
			data.dashQuestionnaire[key] = 5;
		}

		const result = calculateDASH(data);
		expect(result.dashScore).toBe(100);
		expect(result.dashCategoryLabel).toBe('Very severe disability');
	});

	it('detects all question IDs are unique', () => {
		const ids = dashQuestions.map((q) => q.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('requires minimum 27 answered items', () => {
		const data = createHealthyPatient();
		// Set most to null (only 10 answered)
		const keys = Object.keys(data.dashQuestionnaire) as (keyof typeof data.dashQuestionnaire)[];
		for (let i = 10; i < keys.length; i++) {
			data.dashQuestionnaire[keys[i]] = null;
		}

		const result = calculateDASH(data);
		expect(result.dashScore).toBeNull();
		expect(result.dashCategoryLabel).toContain('Insufficient');
	});

	it('handles null scores gracefully (unanswered questions, within limit)', () => {
		const data = createHealthyPatient();
		data.dashQuestionnaire.q1 = 3;
		data.dashQuestionnaire.q2 = null;
		data.dashQuestionnaire.q3 = null;
		data.dashQuestionnaire.q4 = null;
		// 27 answered, 3 null

		const result = calculateDASH(data);
		expect(result.dashScore).not.toBeNull();
	});

	it('calculates correct DASH score formula', () => {
		const data = createHealthyPatient();
		// All 30 items answered as 3 => sum = 90, n = 30
		// DASH = ((90/30) - 1) * 25 = (3 - 1) * 25 = 50
		const keys = Object.keys(data.dashQuestionnaire) as (keyof typeof data.dashQuestionnaire)[];
		for (const key of keys) {
			data.dashQuestionnaire[key] = 3;
		}

		const result = calculateDASH(data);
		expect(result.dashScore).toBe(50);
		expect(result.dashCategoryLabel).toBe('Moderate disability');
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags severe pain (>8/10)', () => {
		const data = createHealthyPatient();
		data.painAssessment.currentPainLevel = 9;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PAIN-001')).toBe(true);
	});

	it('flags night pain as red flag', () => {
		const data = createHealthyPatient();
		data.painAssessment.nightPain = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-RED-001')).toBe(true);
	});

	it('flags traumatic onset without X-ray', () => {
		const data = createHealthyPatient();
		data.chiefComplaint.onsetType = 'traumatic';
		data.imagingHistory.xRay.performed = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-FRACTURE-001')).toBe(true);
	});

	it('flags anesthesia complications', () => {
		const data = createHealthyPatient();
		data.surgicalHistory.anesthesiaComplications = 'yes';
		data.surgicalHistory.anesthesiaDetails = 'Malignant hyperthermia';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ANESTH-001')).toBe(true);
	});

	it('flags anaphylaxis allergy', () => {
		const data = createHealthyPatient();
		data.currentTreatment.allergies = [{ allergen: 'Penicillin', reaction: 'Anaphylaxis', severity: 'anaphylaxis' }];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Allergy' && f.priority === 'high')).toBe(true);
	});

	it('flags bilateral involvement', () => {
		const data = createHealthyPatient();
		data.chiefComplaint.side = 'bilateral';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BILATERAL-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.painAssessment.currentPainLevel = 9;
		data.painAssessment.nightPain = 'yes';
		data.chiefComplaint.side = 'bilateral';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
