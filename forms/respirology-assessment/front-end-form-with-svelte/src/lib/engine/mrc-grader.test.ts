import { describe, it, expect } from 'vitest';
import { calculateMRC } from './mrc-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { mrcRules } from './mrc-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'John',
			lastName: 'Doe',
			dateOfBirth: '1985-01-01',
			sex: 'male',
			weight: 75,
			height: 175,
			bmi: 24.5
		},
		chiefComplaint: {
			primarySymptom: '',
			onsetDate: '',
			duration: '',
			severityRating: null
		},
		dyspnoeaAssessment: {
			mrcGrade: '1',
			triggers: '',
			exerciseToleranceMetres: null,
			orthopnoea: 'no',
			orthopnoeaPillows: null,
			pnd: 'no'
		},
		coughAssessment: {
			duration: '',
			character: '',
			sputumVolume: '',
			sputumColour: '',
			haemoptysis: 'no',
			haemoptysisDetails: ''
		},
		respiratoryHistory: {
			asthma: 'no',
			copd: 'no',
			copdSeverity: '',
			bronchiectasis: 'no',
			interstitialLungDisease: 'no',
			ildType: '',
			tuberculosis: 'no',
			tbTreatmentComplete: '',
			pneumonia: 'no',
			pneumoniaRecurrent: '',
			pulmonaryEmbolism: 'no',
			peDate: ''
		},
		pulmonaryFunction: {
			fev1: null,
			fvc: null,
			fev1FvcRatio: null,
			dlco: null,
			tlc: null,
			oxygenSaturation: 98
		},
		currentMedications: {
			inhalers: [],
			nebulizers: [],
			oxygenTherapy: 'no',
			oxygenDelivery: '',
			oxygenFlowRate: null,
			oralSteroids: 'no',
			oralSteroidDetails: '',
			antibiotics: 'no',
			antibioticDetails: ''
		},
		allergies: {
			drugAllergies: [],
			environmentalAllergens: []
		},
		smokingExposures: {
			smokingStatus: 'never',
			packYears: null,
			vaping: 'no',
			vapingDetails: '',
			occupationalExposure: 'no',
			occupationalDetails: '',
			asbestosExposure: 'no',
			asbestosDetails: '',
			pets: 'no',
			petDetails: ''
		},
		sleepFunctional: {
			sleepQuality: 'good',
			osaScreenSnoring: 'no',
			osaScreenTired: 'no',
			osaScreenObservedApnoea: 'no',
			osaScreenBMIOver35: 'no',
			osaScreenAge50Plus: 'no',
			osaScreenNeckOver40cm: 'no',
			osaScreenMale: 'no',
			stopBangScore: 0,
			daytimeSomnolence: 'no',
			epworthScore: null,
			functionalStatus: 'independent'
		}
	};
}

describe('MRC Grading Engine', () => {
	it('returns MRC 1 for a healthy patient', () => {
		const data = createHealthyPatient();
		const result = calculateMRC(data);
		expect(result.mrcGrade).toBe(1);
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns MRC 2 for self-reported grade 2 + asthma', () => {
		const data = createHealthyPatient();
		data.dyspnoeaAssessment.mrcGrade = '2';
		data.respiratoryHistory.asthma = 'yes';

		const result = calculateMRC(data);
		expect(result.mrcGrade).toBe(2);
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns MRC 3 for moderate COPD + bronchiectasis', () => {
		const data = createHealthyPatient();
		data.dyspnoeaAssessment.mrcGrade = '3';
		data.respiratoryHistory.copd = 'yes';
		data.respiratoryHistory.copdSeverity = 'moderate';
		data.respiratoryHistory.bronchiectasis = 'yes';

		const result = calculateMRC(data);
		expect(result.mrcGrade).toBe(3);
		expect(result.firedRules.length).toBeGreaterThanOrEqual(3);
	});

	it('returns MRC 4 for severe COPD + oxygen therapy + low SpO2', () => {
		const data = createHealthyPatient();
		data.dyspnoeaAssessment.mrcGrade = '4';
		data.respiratoryHistory.copd = 'yes';
		data.respiratoryHistory.copdSeverity = 'severe';
		data.currentMedications.oxygenTherapy = 'yes';
		data.pulmonaryFunction.oxygenSaturation = 89;

		const result = calculateMRC(data);
		expect(result.mrcGrade).toBe(4);
	});

	it('returns MRC 5 for very severe obstruction + grade 5', () => {
		const data = createHealthyPatient();
		data.dyspnoeaAssessment.mrcGrade = '5';
		data.pulmonaryFunction.fev1 = 25;

		const result = calculateMRC(data);
		expect(result.mrcGrade).toBe(5);
	});

	it('detects all rule IDs are unique', () => {
		const ids = mrcRules.map((r) => r.id);
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

	it('flags haemoptysis', () => {
		const data = createHealthyPatient();
		data.coughAssessment.haemoptysis = 'yes';
		data.coughAssessment.haemoptysisDetails = 'small amount';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-HAEM-001')).toBe(true);
		expect(flags.some((f) => f.priority === 'high')).toBe(true);
	});

	it('flags acute respiratory failure risk', () => {
		const data = createHealthyPatient();
		data.pulmonaryFunction.oxygenSaturation = 85;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-RESP-FAIL-001')).toBe(true);
	});

	it('flags PE history', () => {
		const data = createHealthyPatient();
		data.respiratoryHistory.pulmonaryEmbolism = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PE-001')).toBe(true);
	});

	it('flags oxygen dependency', () => {
		const data = createHealthyPatient();
		data.currentMedications.oxygenTherapy = 'yes';
		data.currentMedications.oxygenDelivery = 'nasal-cannula';
		data.currentMedications.oxygenFlowRate = 2;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-O2-001')).toBe(true);
	});

	it('flags OSA risk', () => {
		const data = createHealthyPatient();
		data.sleepFunctional.stopBangScore = 6;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-OSA-001')).toBe(true);
	});

	it('flags anaphylaxis allergy', () => {
		const data = createHealthyPatient();
		data.allergies.drugAllergies = [
			{ allergen: 'Penicillin', reaction: 'Rash and swelling', severity: 'anaphylaxis' }
		];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.category === 'Allergy' && f.priority === 'high')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.coughAssessment.haemoptysis = 'yes';
		data.currentMedications.oxygenTherapy = 'yes';
		data.sleepFunctional.daytimeSomnolence = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
