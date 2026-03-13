import { describe, it, expect } from 'vitest';
import { calculateCOPM } from './copm-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { copmActivities } from './copm-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1985-06-15',
			sex: 'female'
		},
		referralInfo: {
			referralSource: 'GP',
			referralReason: 'Post-surgical rehabilitation',
			referringClinician: 'Dr. Brown',
			referralDate: '2026-01-15',
			primaryDiagnosis: 'Right hip replacement'
		},
		selfCareActivities: {
			personalCare: { difficulty: 'none', details: '' },
			functionalMobility: { difficulty: 'none', details: '' },
			communityManagement: { difficulty: 'none', details: '' }
		},
		productivityActivities: {
			paidWork: { difficulty: 'none', details: '' },
			householdManagement: { difficulty: 'none', details: '' },
			education: { difficulty: 'none', details: '' }
		},
		leisureActivities: {
			quietRecreation: { difficulty: 'none', details: '' },
			activeRecreation: { difficulty: 'none', details: '' },
			socialParticipation: { difficulty: 'none', details: '' }
		},
		performanceRatings: {
			activity1: { name: 'Dressing', importance: 8, performanceScore: 8 },
			activity2: { name: 'Cooking', importance: 7, performanceScore: 9 },
			activity3: { name: 'Walking', importance: 9, performanceScore: 8 },
			activity4: { name: 'Gardening', importance: 6, performanceScore: 7 },
			activity5: { name: 'Reading', importance: 5, performanceScore: 9 }
		},
		satisfactionRatings: {
			activity1: { name: 'Dressing', satisfactionScore: 8 },
			activity2: { name: 'Cooking', satisfactionScore: 9 },
			activity3: { name: 'Walking', satisfactionScore: 8 },
			activity4: { name: 'Gardening', satisfactionScore: 7 },
			activity5: { name: 'Reading', satisfactionScore: 9 }
		},
		environmentalFactors: {
			homeEnvironment: 'Single-story home, no barriers',
			workEnvironment: 'Office setting, accessible',
			communityAccess: 'Good access to public transport',
			assistiveDevices: 'None needed',
			socialSupport: 'Strong family support'
		},
		physicalCognitiveStatus: {
			upperExtremity: 'Full range of motion',
			lowerExtremity: 'Normal strength',
			coordination: 'Good',
			cognition: 'Intact',
			vision: 'Normal with corrective lenses',
			fatigue: 'Minimal',
			pain: 'None'
		},
		goalsPriorities: {
			shortTermGoals: 'Return to independent dressing',
			longTermGoals: 'Return to full community participation',
			priorityAreas: 'Self-care and mobility',
			dischargeGoals: 'Independent in all ADLs'
		}
	};
}

describe('COPM Grading Engine', () => {
	it('returns good performance for a patient with high scores', () => {
		const data = createHealthyPatient();
		const result = calculateCOPM(data);
		expect(result.performanceScore).toBe(8.2);
		expect(result.performanceCategoryLabel).toBe('Good performance');
		expect(result.satisfactionScore).toBe(8.2);
		expect(result.satisfactionCategoryLabel).toBe('Good performance');
	});

	it('returns significant issues for low performance scores', () => {
		const data = createHealthyPatient();
		data.performanceRatings.activity1.performanceScore = 2;
		data.performanceRatings.activity2.performanceScore = 3;
		data.performanceRatings.activity3.performanceScore = 1;
		data.performanceRatings.activity4.performanceScore = 4;
		data.performanceRatings.activity5.performanceScore = 2;

		const result = calculateCOPM(data);
		expect(result.performanceScore).toBe(2.4);
		expect(result.performanceCategoryLabel).toBe('Significant issues');
	});

	it('returns moderate concerns for mid-range scores', () => {
		const data = createHealthyPatient();
		data.performanceRatings.activity1.performanceScore = 5;
		data.performanceRatings.activity2.performanceScore = 6;
		data.performanceRatings.activity3.performanceScore = 5;
		data.performanceRatings.activity4.performanceScore = 7;
		data.performanceRatings.activity5.performanceScore = 6;

		const result = calculateCOPM(data);
		expect(result.performanceScore).toBe(5.8);
		expect(result.performanceCategoryLabel).toBe('Moderate concerns');
	});

	it('handles null scores gracefully (unanswered activities)', () => {
		const data = createHealthyPatient();
		data.performanceRatings.activity1.performanceScore = 8;
		data.performanceRatings.activity2.performanceScore = null;
		data.performanceRatings.activity3.performanceScore = 6;
		data.performanceRatings.activity4.performanceScore = null;
		data.performanceRatings.activity5.performanceScore = null;

		const result = calculateCOPM(data);
		expect(result.performanceScore).toBe(7);
	});

	it('returns 0 when all scores are null', () => {
		const data = createHealthyPatient();
		data.performanceRatings.activity1.performanceScore = null;
		data.performanceRatings.activity2.performanceScore = null;
		data.performanceRatings.activity3.performanceScore = null;
		data.performanceRatings.activity4.performanceScore = null;
		data.performanceRatings.activity5.performanceScore = null;

		const result = calculateCOPM(data);
		expect(result.performanceScore).toBe(0);
	});

	it('detects all activity IDs are unique', () => {
		const ids = copmActivities.map((a) => a.id);
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

	it('flags inability to perform self-care', () => {
		const data = createHealthyPatient();
		data.selfCareActivities.personalCare.difficulty = 'unable';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SELFCARE-001')).toBe(true);
	});

	it('flags inability to perform functional mobility', () => {
		const data = createHealthyPatient();
		data.selfCareActivities.functionalMobility.difficulty = 'unable';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-MOBILITY-001')).toBe(true);
	});

	it('flags cognitive deficits', () => {
		const data = createHealthyPatient();
		data.physicalCognitiveStatus.cognition = 'Significant cognitive impairment noted';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-COGNITION-001')).toBe(true);
	});

	it('flags home safety concerns', () => {
		const data = createHealthyPatient();
		data.environmentalFactors.homeEnvironment = 'Multiple fall hazards identified';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-HOME-001')).toBe(true);
	});

	it('flags social isolation', () => {
		const data = createHealthyPatient();
		data.leisureActivities.socialParticipation.difficulty = 'unable';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SOCIAL-001')).toBe(true);
	});

	it('flags severe pain', () => {
		const data = createHealthyPatient();
		data.physicalCognitiveStatus.pain = 'Severe chronic pain in lower back';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PAIN-001')).toBe(true);
	});

	it('flags falls risk from lower extremity impairment', () => {
		const data = createHealthyPatient();
		data.physicalCognitiveStatus.lowerExtremity = 'Bilateral weakness and instability';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-FALLS-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.selfCareActivities.personalCare.difficulty = 'unable';
		data.physicalCognitiveStatus.fatigue = 'Severe fatigue';
		data.environmentalFactors.socialSupport = 'Limited support';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
