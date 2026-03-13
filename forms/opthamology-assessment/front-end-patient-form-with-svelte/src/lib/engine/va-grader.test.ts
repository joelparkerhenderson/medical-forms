import { describe, it, expect } from 'vitest';
import { calculateVisualAcuityGrade } from './va-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { vaRules } from './va-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'John',
			lastName: 'Doe',
			dateOfBirth: '1985-01-01',
			sex: 'male'
		},
		chiefComplaint: {
			primaryConcern: 'Routine eye check',
			affectedEye: 'both',
			onsetType: 'gradual',
			durationValue: '1',
			durationUnit: 'years',
			painPresent: 'no',
			painSeverity: ''
		},
		visualAcuity: {
			distanceVaRightUncorrected: '6/6',
			distanceVaRightCorrected: '6/6',
			distanceVaLeftUncorrected: '6/6',
			distanceVaLeftCorrected: '6/6',
			nearVaRight: 'N5',
			nearVaLeft: 'N5',
			pinholeRight: '6/6',
			pinholeLeft: '6/6',
			refractionRight: '',
			refractionLeft: ''
		},
		ocularHistory: {
			previousEyeConditions: 'no',
			previousEyeConditionDetails: '',
			previousEyeSurgery: 'no',
			previousEyeSurgeryDetails: '',
			laserTreatment: 'no',
			laserTreatmentDetails: '',
			ocularTrauma: 'no',
			ocularTraumaDetails: '',
			amblyopia: 'no',
			amblyopiaEye: ''
		},
		anteriorSegment: {
			lidsNormal: 'yes',
			lidsDetails: '',
			conjunctivaNormal: 'yes',
			conjunctivaDetails: '',
			corneaNormal: 'yes',
			corneaDetails: '',
			anteriorChamberNormal: 'yes',
			anteriorChamberDetails: '',
			irisNormal: 'yes',
			irisDetails: '',
			lensNormal: 'yes',
			lensDetails: '',
			iopRight: 16,
			iopLeft: 15,
			iopMethod: 'goldmann'
		},
		posteriorSegment: {
			fundusNormal: 'yes',
			fundusDetails: '',
			opticDiscNormal: 'yes',
			opticDiscDetails: '',
			cupToDiscRatioRight: '0.3',
			cupToDiscRatioLeft: '0.3',
			maculaNormal: 'yes',
			maculaDetails: '',
			retinalVesselsNormal: 'yes',
			retinalVesselsDetails: '',
			vitreousNormal: 'yes',
			vitreousDetails: ''
		},
		visualFieldPupils: {
			visualFieldTestPerformed: 'yes',
			visualFieldTestType: 'confrontation',
			visualFieldResultRight: 'normal',
			visualFieldResultLeft: 'normal',
			visualFieldDetails: '',
			pupilReactionRight: 'normal',
			pupilReactionLeft: 'normal',
			rapdPresent: 'no',
			rapdEye: '',
			colourVisionNormal: 'yes',
			colourVisionDetails: ''
		},
		currentMedications: {
			eyeDrops: [],
			oralMedications: [],
			ophthalmicDrugAllergies: []
		},
		systemicConditions: {
			diabetes: 'no',
			diabetesType: '',
			diabetesControl: '',
			diabeticRetinopathy: 'no',
			diabeticRetinopathyStage: '',
			hypertension: 'no',
			hypertensionControlled: '',
			autoimmune: 'no',
			autoimmuneDetails: '',
			thyroidEyeDisease: 'no',
			thyroidEyeDiseaseDetails: '',
			neurological: 'no',
			neurologicalDetails: ''
		},
		functionalImpact: {
			drivingStatus: 'current-driver',
			drivingConcerns: '',
			readingAbility: 'no-difficulty',
			adlLimitations: 'no',
			adlLimitationDetails: '',
			fallsRisk: 'no',
			fallsDetails: '',
			supportNeeds: 'no',
			supportDetails: ''
		}
	};
}

describe('VA Grading Engine', () => {
	it('returns normal for a healthy patient with 6/6 vision', () => {
		const data = createHealthyPatient();
		const result = calculateVisualAcuityGrade(data);
		expect(result.vaGrade).toBe('normal');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns mild impairment for 6/12 corrected vision', () => {
		const data = createHealthyPatient();
		data.visualAcuity.distanceVaRightCorrected = '6/12';
		data.visualAcuity.distanceVaLeftCorrected = '6/12';

		const result = calculateVisualAcuityGrade(data);
		expect(result.vaGrade).toBe('mild');
		expect(result.firedRules.some((r) => r.id === 'VA-001')).toBe(true);
	});

	it('returns moderate impairment for 6/24 corrected vision', () => {
		const data = createHealthyPatient();
		data.visualAcuity.distanceVaRightCorrected = '6/24';
		data.visualAcuity.distanceVaLeftCorrected = '6/36';

		const result = calculateVisualAcuityGrade(data);
		expect(result.vaGrade).toBe('moderate');
	});

	it('returns severe impairment for 3/60 corrected vision', () => {
		const data = createHealthyPatient();
		data.visualAcuity.distanceVaRightCorrected = '3/60';
		data.visualAcuity.distanceVaLeftCorrected = '3/60';

		const result = calculateVisualAcuityGrade(data);
		expect(result.vaGrade).toBe('severe');
	});

	it('returns blindness for 1/60 corrected vision', () => {
		const data = createHealthyPatient();
		data.visualAcuity.distanceVaRightCorrected = '1/60';
		data.visualAcuity.distanceVaLeftCorrected = '1/60';

		const result = calculateVisualAcuityGrade(data);
		expect(result.vaGrade).toBe('blindness');
	});

	it('uses best eye for grading (one good eye means better grade)', () => {
		const data = createHealthyPatient();
		data.visualAcuity.distanceVaRightCorrected = '6/6';
		data.visualAcuity.distanceVaLeftCorrected = '6/60';

		const result = calculateVisualAcuityGrade(data);
		// Best eye is 6/6 so no VA rules fire for acuity impairment
		expect(result.vaGrade).toBe('normal');
	});

	it('detects all rule IDs are unique', () => {
		const ids = vaRules.map((r) => r.id);
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

	it('flags sudden vision loss', () => {
		const data = createHealthyPatient();
		data.chiefComplaint.onsetType = 'sudden';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-VISION-001')).toBe(true);
		expect(flags.find((f) => f.id === 'FLAG-VISION-001')?.priority).toBe('high');
	});

	it('flags raised IOP', () => {
		const data = createHealthyPatient();
		data.anteriorSegment.iopRight = 35;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-IOP-002')).toBe(true);
		expect(flags.find((f) => f.id === 'FLAG-IOP-002')?.priority).toBe('high');
	});

	it('flags RAPD', () => {
		const data = createHealthyPatient();
		data.visualFieldPupils.rapdPresent = 'yes';
		data.visualFieldPupils.rapdEye = 'left';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-RAPD-001')).toBe(true);
		expect(flags.find((f) => f.id === 'FLAG-RAPD-001')?.priority).toBe('high');
	});

	it('flags retinal detachment signs', () => {
		const data = createHealthyPatient();
		data.posteriorSegment.fundusNormal = 'no';
		data.posteriorSegment.vitreousNormal = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-RETINA-001')).toBe(true);
		expect(flags.find((f) => f.id === 'FLAG-RETINA-001')?.priority).toBe('high');
	});

	it('flags diabetic retinopathy', () => {
		const data = createHealthyPatient();
		data.systemicConditions.diabeticRetinopathy = 'yes';
		data.systemicConditions.diabeticRetinopathyStage = 'proliferative';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Diabetic Retinopathy' && f.priority === 'high')).toBe(true);
	});

	it('flags ophthalmic drug anaphylaxis', () => {
		const data = createHealthyPatient();
		data.currentMedications.ophthalmicDrugAllergies = [
			{ allergen: 'Tropicamide', reaction: 'Anaphylactic shock', severity: 'anaphylaxis' }
		];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Allergy' && f.priority === 'high')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.chiefComplaint.onsetType = 'sudden';
		data.posteriorSegment.opticDiscNormal = 'no';
		data.ocularHistory.previousEyeSurgery = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
