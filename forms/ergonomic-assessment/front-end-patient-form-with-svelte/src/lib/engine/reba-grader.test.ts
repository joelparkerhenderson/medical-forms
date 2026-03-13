import { describe, it, expect } from 'vitest';
import { calculateREBA } from './reba-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { rebaRules } from './reba-rules';
import type { AssessmentData } from './types';

function createLowRiskSubject(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1990-05-15',
			sex: 'female',
			occupation: 'Office worker',
			employer: 'Acme Corp',
			jobTitle: 'Software Developer',
			yearsInRole: 5
		},
		workstationSetup: {
			deskHeight: 'correct',
			chairType: 'adjustable',
			chairAdjustability: 'yes',
			monitorPosition: 'correct',
			monitorDistance: '40-70cm',
			monitorHeight: 'at-eye-level',
			keyboardPlacement: 'correct',
			mousePlacement: 'beside-keyboard',
			lighting: 'adequate',
			temperature: 'comfortable'
		},
		postureAssessment: {
			sittingPosture: 'upright',
			standingPosture: 'not-applicable',
			neckAngle: 'neutral',
			trunkAngle: 'neutral',
			shoulderPosition: 'neutral',
			wristDeviation: 'neutral',
			neckScore: null,
			trunkScore: null,
			legScore: null,
			upperArmScore: null,
			lowerArmScore: null,
			wristScore: null
		},
		repetitiveTasks: {
			taskDescription: 'Typing',
			frequency: 'occasionally',
			durationPerSession: 'less-than-1hr',
			forceRequired: 'none',
			vibrationExposure: 'no',
			cycleTimeSeconds: null
		},
		manualHandling: {
			liftingFrequency: 'none',
			loadWeightKg: null,
			carryDistanceMetres: null,
			pushPullForces: 'none',
			teamLifting: '',
			mechanicalAidsAvailable: ''
		},
		currentSymptoms: {
			painLocations: [],
			painSeverity: null,
			onsetDate: '',
			duration: '',
			aggravatingFactors: '',
			relievingFactors: '',
			impactOnWork: 'none'
		},
		medicalHistory: {
			musculoskeletalConditions: [],
			previousInjuries: '',
			surgeries: '',
			chronicPain: 'no',
			rsiCarpalTunnel: 'no',
			backProblems: 'no'
		},
		currentInterventions: {
			ergonomicEquipment: [],
			physiotherapy: 'no',
			occupationalTherapy: 'no',
			workplaceAdjustments: '',
			medications: ''
		},
		psychosocialFactors: {
			jobSatisfaction: 'satisfied',
			workload: 'manageable',
			stressLevel: 'low',
			breaksTaken: 'regular',
			autonomy: 'high',
			employerSupport: 'good'
		},
		recommendations: {
			equipmentChanges: '',
			workstationModifications: '',
			trainingRequired: '',
			breakSchedule: '',
			followUpDate: '',
			referrals: ''
		}
	};
}

describe('REBA Grading Engine', () => {
	it('returns score 1 (negligible risk) for properly set up workstation', () => {
		const data = createLowRiskSubject();
		const result = calculateREBA(data);
		expect(result.rebaScore).toBe(1);
		expect(result.riskLevel).toBe('Negligible risk');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns low risk for minor posture issues', () => {
		const data = createLowRiskSubject();
		data.postureAssessment.neckAngle = 'flexed-0-20';
		data.postureAssessment.trunkAngle = 'flexed-0-20';

		const result = calculateREBA(data);
		expect(result.rebaScore).toBe(3);
		expect(result.riskLevel).toBe('Low risk');
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns medium risk for multiple workstation and posture issues', () => {
		const data = createLowRiskSubject();
		data.postureAssessment.neckAngle = 'flexed-20-plus';
		data.postureAssessment.trunkAngle = 'flexed-20-60';
		data.postureAssessment.wristDeviation = 'flexed';

		const result = calculateREBA(data);
		expect(result.rebaScore).toBeGreaterThanOrEqual(4);
		expect(result.rebaScore).toBeLessThanOrEqual(7);
		expect(result.riskLevel).toBe('Medium risk');
	});

	it('returns high risk for heavy manual handling with poor posture', () => {
		const data = createLowRiskSubject();
		data.postureAssessment.trunkAngle = 'flexed-60-plus';
		data.postureAssessment.shoulderPosition = 'flexed';
		data.manualHandling.loadWeightKg = 25;
		data.manualHandling.liftingFrequency = 'frequent';

		const result = calculateREBA(data);
		expect(result.rebaScore).toBeGreaterThanOrEqual(8);
	});

	it('clamps REBA score to maximum 15', () => {
		const data = createLowRiskSubject();
		// Stack many high-score rules
		data.postureAssessment.neckAngle = 'twisted';
		data.postureAssessment.trunkAngle = 'flexed-60-plus';
		data.postureAssessment.shoulderPosition = 'flexed';
		data.postureAssessment.wristDeviation = 'ulnar-deviated';
		data.postureAssessment.sittingPosture = 'slouched';
		data.repetitiveTasks.frequency = 'constantly';
		data.repetitiveTasks.forceRequired = 'heavy';
		data.manualHandling.loadWeightKg = 30;
		data.manualHandling.liftingFrequency = 'constant';
		data.manualHandling.pushPullForces = 'heavy';
		data.currentSymptoms.painSeverity = 9;
		data.currentSymptoms.impactOnWork = 'unable-to-work';

		const result = calculateREBA(data);
		expect(result.rebaScore).toBe(15);
		expect(result.riskLevel).toBe('Very high risk');
	});

	it('detects all rule IDs are unique', () => {
		const ids = rebaRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for low-risk subject', () => {
		const data = createLowRiskSubject();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags existing RSI', () => {
		const data = createLowRiskSubject();
		data.medicalHistory.rsiCarpalTunnel = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-RSI-001')).toBe(true);
	});

	it('flags heavy lifting without aids', () => {
		const data = createLowRiskSubject();
		data.manualHandling.loadWeightKg = 25;
		data.manualHandling.mechanicalAidsAvailable = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-MANUAL-001')).toBe(true);
	});

	it('flags no breaks taken', () => {
		const data = createLowRiskSubject();
		data.psychosocialFactors.breaksTaken = 'none';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BREAKS-001')).toBe(true);
	});

	it('flags vibration exposure', () => {
		const data = createLowRiskSubject();
		data.repetitiveTasks.vibrationExposure = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-VIBRATION-001')).toBe(true);
	});

	it('flags severe pain', () => {
		const data = createLowRiskSubject();
		data.currentSymptoms.painSeverity = 9;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PAIN-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createLowRiskSubject();
		data.medicalHistory.rsiCarpalTunnel = 'yes';
		data.psychosocialFactors.breaksTaken = 'none';
		data.psychosocialFactors.employerSupport = 'poor';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
