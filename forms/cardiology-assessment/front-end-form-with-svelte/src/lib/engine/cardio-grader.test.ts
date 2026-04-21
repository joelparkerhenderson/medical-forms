import { describe, it, expect } from 'vitest';
import { calculateCardioGrade } from './cardio-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { cardioRules } from './cardio-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'John',
			lastName: 'Doe',
			dateOfBirth: '1965-05-15',
			sex: 'male',
			weight: 80,
			height: 178,
			bmi: 25.2
		},
		chestPainAngina: {
			chestPain: 'no',
			painCharacter: '',
			painLocation: '',
			painRadiation: '',
			ccsClass: '',
			anginaFrequency: '',
			anginaDuration: '',
			unstableAngina: 'no'
		},
		heartFailureSymptoms: {
			dyspnoea: 'no',
			dyspnoeaOnExertion: 'no',
			orthopnoea: 'no',
			pnd: 'no',
			peripheralOedema: 'no',
			nyhaClass: ''
		},
		cardiacHistory: {
			previousMI: 'no',
			miDate: '',
			recentMI: 'no',
			recentMIWeeks: null,
			pci: 'no',
			pciDetails: '',
			cabg: 'no',
			cabgDetails: '',
			valvularDisease: 'no',
			valvularDetails: '',
			cardiomyopathy: 'no',
			cardiomyopathyType: '',
			pericarditis: 'no'
		},
		arrhythmiaConduction: {
			atrialFibrillation: 'no',
			afType: '',
			otherArrhythmia: 'no',
			otherArrhythmiaType: '',
			pacemaker: 'no',
			pacemakerType: '',
			syncope: 'no',
			syncopeDetails: '',
			palpitations: 'no'
		},
		riskFactors: {
			hypertension: 'no',
			hypertensionControlled: '',
			diabetes: 'no',
			diabetesType: '',
			hyperlipidaemia: 'no',
			familyHistory: 'no',
			familyHistoryDetails: '',
			obesity: 'no'
		},
		diagnosticResults: {
			ecgFindings: '',
			ecgNormal: 'yes',
			echoPerformed: 'no',
			echoLVEF: null,
			echoFindings: '',
			stressTestPerformed: 'no',
			stressTestResult: '',
			stressTestDetails: '',
			cathPerformed: 'no',
			cathFindings: ''
		},
		currentMedications: {
			antiplatelets: 'no',
			antiplateletType: '',
			anticoagulants: 'no',
			anticoagulantType: '',
			betaBlockers: 'no',
			betaBlockerType: '',
			aceInhibitorsARBs: 'no',
			aceArbType: '',
			statins: 'no',
			statinType: '',
			diuretics: 'no',
			diureticType: '',
			otherCardiacMeds: ''
		},
		allergies: {
			drugAllergies: 'no',
			allergies: [],
			contrastAllergy: 'no',
			contrastAllergyDetails: ''
		},
		socialFunctional: {
			smoking: 'never',
			smokingPackYears: null,
			alcohol: 'none',
			alcoholUnitsPerWeek: null,
			exerciseTolerance: 'vigorous-exercise',
			estimatedMETs: 10,
			occupation: ''
		}
	};
}

describe('Cardiology Grading Engine', () => {
	it('returns low risk for a healthy patient with no CCS/NYHA', () => {
		const data = createHealthyPatient();
		const result = calculateCardioGrade(data);
		expect(result.overallRisk).toBe('low');
		expect(result.ccsClass).toBeNull();
		expect(result.nyhaClass).toBeNull();
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns moderate risk for CCS II angina + controlled hypertension', () => {
		const data = createHealthyPatient();
		data.chestPainAngina.chestPain = 'yes';
		data.chestPainAngina.ccsClass = '2';
		data.riskFactors.hypertension = 'yes';
		data.riskFactors.hypertensionControlled = 'yes';

		const result = calculateCardioGrade(data);
		expect(result.overallRisk).toBe('moderate');
		expect(result.ccsClass).toBe(2);
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns high risk for NYHA III + reduced LVEF', () => {
		const data = createHealthyPatient();
		data.heartFailureSymptoms.dyspnoea = 'yes';
		data.heartFailureSymptoms.nyhaClass = '3';
		data.diagnosticResults.echoPerformed = 'yes';
		data.diagnosticResults.echoLVEF = 35;

		const result = calculateCardioGrade(data);
		expect(result.overallRisk).toBe('high');
		expect(result.nyhaClass).toBe(3);
		expect(result.firedRules.length).toBeGreaterThanOrEqual(2);
	});

	it('returns critical risk for recent MI + NYHA IV', () => {
		const data = createHealthyPatient();
		data.cardiacHistory.recentMI = 'yes';
		data.cardiacHistory.recentMIWeeks = 4;
		data.heartFailureSymptoms.nyhaClass = '4';

		const result = calculateCardioGrade(data);
		expect(result.overallRisk).toBe('critical');
		expect(result.nyhaClass).toBe(4);
	});

	it('returns critical risk for unstable angina', () => {
		const data = createHealthyPatient();
		data.chestPainAngina.chestPain = 'yes';
		data.chestPainAngina.unstableAngina = 'yes';

		const result = calculateCardioGrade(data);
		expect(result.overallRisk).toBe('critical');
	});

	it('detects all rule IDs are unique', () => {
		const ids = cardioRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('Cardiology Flagged Issues Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags recent MI', () => {
		const data = createHealthyPatient();
		data.cardiacHistory.recentMI = 'yes';
		data.cardiacHistory.recentMIWeeks = 3;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-MI-001')).toBe(true);
	});

	it('flags unstable angina', () => {
		const data = createHealthyPatient();
		data.chestPainAngina.unstableAngina = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ANGINA-001')).toBe(true);
	});

	it('flags NYHA IV heart failure', () => {
		const data = createHealthyPatient();
		data.heartFailureSymptoms.nyhaClass = '4';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-HF-001')).toBe(true);
	});

	it('flags pacemaker/ICD', () => {
		const data = createHealthyPatient();
		data.arrhythmiaConduction.pacemaker = 'yes';
		data.arrhythmiaConduction.pacemakerType = 'dual-chamber';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PACER-001')).toBe(true);
	});

	it('flags anticoagulant use', () => {
		const data = createHealthyPatient();
		data.currentMedications.anticoagulants = 'yes';
		data.currentMedications.anticoagulantType = 'warfarin';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ANTICOAG-001')).toBe(true);
	});

	it('flags contrast allergy', () => {
		const data = createHealthyPatient();
		data.allergies.contrastAllergy = 'yes';
		data.allergies.contrastAllergyDetails = 'Iodine contrast reaction';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-CONTRAST-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.cardiacHistory.recentMI = 'yes';
		data.cardiacHistory.recentMIWeeks = 3;
		data.arrhythmiaConduction.pacemaker = 'yes';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
