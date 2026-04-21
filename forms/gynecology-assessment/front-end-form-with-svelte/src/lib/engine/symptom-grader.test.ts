import { describe, it, expect } from 'vitest';
import { calculateSymptomScore } from './symptom-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { symptomDefinitions } from './symptom-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1985-06-15',
			sex: 'female',
			menopausalStatus: 'pre-menopausal'
		},
		chiefComplaint: {
			primaryConcern: 'Routine check-up',
			duration: '',
			progression: 'stable',
			previousTreatments: ''
		},
		menstrualHistory: {
			cycleLength: 28,
			cycleDuration: 5,
			flowHeaviness: 'moderate',
			painSeverity: 0,
			regularity: 'regular',
			lastMenstrualPeriod: '2026-02-20'
		},
		gynecologicalSymptoms: {
			pelvicPain: 0,
			abnormalBleeding: 0,
			discharge: 0,
			urinarySymptoms: 0
		},
		cervicalScreening: {
			lastSmearDate: '2025-01-15',
			lastSmearResult: 'normal',
			hpvVaccination: 'complete'
		},
		obstetricHistory: {
			gravida: 0,
			para: 0,
			complications: ''
		},
		sexualHealth: {
			sexuallyActive: 'yes',
			contraceptionMethod: 'Combined oral contraceptive',
			stiHistory: 'no',
			stiDetails: ''
		},
		medicalHistory: {
			previousGynConditions: '',
			chronicDiseases: '',
			surgicalHistory: '',
			autoimmuneDiseases: 'no',
			autoimmuneDiseaseDetails: ''
		},
		currentMedications: {
			hormonal: [],
			nonHormonal: [],
			supplements: ''
		},
		familyHistory: {
			breastCancer: 'no',
			ovarianCancer: 'no',
			cervicalCancer: 'no',
			endometriosis: 'no',
			pcos: 'no',
			otherDetails: ''
		}
	};
}

describe('Symptom Severity Grading Engine', () => {
	it('returns Minimal score for a patient with no symptoms', () => {
		const data = createHealthyPatient();
		data.menstrualHistory.flowHeaviness = 'light';
		const result = calculateSymptomScore(data);
		expect(result.symptomScore).toBeLessThanOrEqual(5);
		expect(result.symptomCategoryLabel).toBe('Minimal');
	});

	it('returns Mild score for minor symptoms', () => {
		const data = createHealthyPatient();
		data.menstrualHistory.painSeverity = 2;
		data.menstrualHistory.flowHeaviness = 'heavy';
		data.gynecologicalSymptoms.pelvicPain = 1;

		const result = calculateSymptomScore(data);
		expect(result.symptomScore).toBeGreaterThanOrEqual(6);
		expect(result.symptomScore).toBeLessThanOrEqual(10);
		expect(result.symptomCategoryLabel).toBe('Mild');
	});

	it('returns Moderate score for moderate symptoms', () => {
		const data = createHealthyPatient();
		data.menstrualHistory.painSeverity = 3;
		data.menstrualHistory.flowHeaviness = 'very-heavy';
		data.gynecologicalSymptoms.pelvicPain = 2;
		data.gynecologicalSymptoms.abnormalBleeding = 2;
		data.gynecologicalSymptoms.discharge = 1;

		const result = calculateSymptomScore(data);
		expect(result.symptomScore).toBeGreaterThanOrEqual(11);
		expect(result.symptomScore).toBeLessThanOrEqual(20);
		expect(result.symptomCategoryLabel).toBe('Moderate');
	});

	it('returns Severe score for maximum symptoms', () => {
		const data = createHealthyPatient();
		data.menstrualHistory.painSeverity = 3;
		data.menstrualHistory.flowHeaviness = 'very-heavy';
		data.gynecologicalSymptoms.pelvicPain = 3;
		data.gynecologicalSymptoms.abnormalBleeding = 3;
		data.gynecologicalSymptoms.discharge = 3;
		data.gynecologicalSymptoms.urinarySymptoms = 3;

		const result = calculateSymptomScore(data);
		expect(result.symptomScore).toBeGreaterThanOrEqual(21);
		expect(result.symptomCategoryLabel).toBe('Severe');
	});

	it('detects all symptom IDs are unique', () => {
		const ids = symptomDefinitions.map((s) => s.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('handles null scores gracefully (unanswered questions)', () => {
		const data = createHealthyPatient();
		data.menstrualHistory.painSeverity = 2;
		data.gynecologicalSymptoms.pelvicPain = null;
		data.gynecologicalSymptoms.abnormalBleeding = 1;
		data.menstrualHistory.flowHeaviness = 'light';

		const result = calculateSymptomScore(data);
		expect(result.symptomScore).toBeGreaterThanOrEqual(3);
	});
});

describe('Additional Flags Detection', () => {
	it('returns minimal flags for healthy patient with screening', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		// Healthy patient should have no high-priority flags
		expect(flags.filter((f) => f.priority === 'high')).toHaveLength(0);
	});

	it('flags abnormal bleeding', () => {
		const data = createHealthyPatient();
		data.gynecologicalSymptoms.abnormalBleeding = 2;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BLEED-001')).toBe(true);
	});

	it('flags post-menopausal bleeding', () => {
		const data = createHealthyPatient();
		data.demographics.menopausalStatus = 'post-menopausal';
		data.gynecologicalSymptoms.abnormalBleeding = 1;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PMB-001')).toBe(true);
	});

	it('flags overdue cervical screening', () => {
		const data = createHealthyPatient();
		data.cervicalScreening.lastSmearDate = '2020-01-01';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-SCREEN-001')).toBe(true);
	});

	it('flags STI history', () => {
		const data = createHealthyPatient();
		data.sexualHealth.stiHistory = 'yes';
		data.sexualHealth.stiDetails = 'Chlamydia 2023';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-STI-001')).toBe(true);
	});

	it('flags pregnancy complications', () => {
		const data = createHealthyPatient();
		data.obstetricHistory.complications = 'Pre-eclampsia in second pregnancy';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PREG-001')).toBe(true);
	});

	it('flags family history of ovarian cancer', () => {
		const data = createHealthyPatient();
		data.familyHistory.ovarianCancer = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-FAMILY-OV-001')).toBe(true);
	});

	it('flags worsening symptoms', () => {
		const data = createHealthyPatient();
		data.chiefComplaint.progression = 'worsening';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PROG-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.chiefComplaint.progression = 'worsening';
		data.sexualHealth.stiHistory = 'yes';
		data.familyHistory.ovarianCancer = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
