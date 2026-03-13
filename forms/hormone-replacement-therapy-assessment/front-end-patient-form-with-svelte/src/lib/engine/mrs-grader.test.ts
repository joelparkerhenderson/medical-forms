import { describe, it, expect } from 'vitest';
import { calculateMRS, classifyHRTRisk, getMRSSeverity } from './mrs-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { mrsRules } from './mrs-rules';
import type { AssessmentData } from './types';

function createAsymptomaticPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1970-06-15',
			sex: 'female',
			weight: 65,
			height: 165,
			bmi: 23.9
		},
		menopauseStatus: {
			menopausalStatus: 'post',
			lastMenstrualPeriod: '2023-01-01',
			ageAtMenopause: 51,
			surgicalMenopause: 'no',
			surgicalMenopauseDetails: '',
			prematureOvarianInsufficiency: 'no'
		},
		mrsSymptomScale: {
			hotFlushes: 0,
			heartDiscomfort: 0,
			sleepProblems: 0,
			jointPain: 0,
			depressiveMood: 0,
			irritability: 0,
			anxiety: 0,
			fatigue: 0,
			sexualProblems: 0,
			bladderProblems: 0,
			vaginalDryness: 0
		},
		vasomotorSymptoms: {
			hotFlushFrequency: 'none',
			hotFlushSeverity: 'none',
			nightSweats: 'no',
			nightSweatsFrequency: '',
			triggers: ''
		},
		boneHealth: {
			dexaScan: 'no',
			dexaResult: '',
			dexaDate: '',
			fractureHistory: 'no',
			fractureDetails: '',
			heightLoss: 'no',
			heightLossCm: null,
			riskFactors: '',
			calciumIntake: 'adequate',
			vitaminDIntake: 'adequate'
		},
		cardiovascularRisk: {
			systolicBP: 120,
			diastolicBP: 80,
			totalCholesterol: null,
			hdlCholesterol: null,
			ldlCholesterol: null,
			triglycerides: null,
			familyHistoryCVD: 'no',
			diabetes: 'no',
			diabetesType: '',
			smoking: 'never',
			qriskScore: null
		},
		breastHealth: {
			lastMammogram: '2025-01-01',
			mammogramResult: 'normal',
			breastExamNormal: 'yes',
			familyHistoryBreastCancer: 'no',
			familyHistoryOvarianCancer: 'no',
			brcaStatus: 'not-tested',
			brcaType: ''
		},
		currentMedications: {
			currentHRT: 'no',
			currentHRTDetails: '',
			currentHRTDuration: '',
			previousHRT: 'no',
			previousHRTDetails: '',
			previousHRTReason: '',
			otherMedications: [],
			supplements: ''
		},
		contraindicationsScreen: {
			vteHistory: 'no',
			vteDetails: '',
			breastCancerHistory: 'no',
			breastCancerDetails: '',
			liverDisease: 'no',
			liverDiseaseDetails: '',
			undiagnosedVaginalBleeding: 'no',
			pregnancy: 'no',
			activeCardiovascularDisease: 'no',
			activeCardiovascularDetails: ''
		},
		treatmentPreferences: {
			routePreference: '',
			routePreferenceReason: '',
			concernsAboutHRT: '',
			lifestyleFactors: '',
			treatmentGoals: ''
		}
	};
}

describe('MRS Grading Engine', () => {
	it('returns score 0 and No/Minimal for asymptomatic patient', () => {
		const data = createAsymptomaticPatient();
		const { mrsResult, firedRules } = calculateMRS(data);
		expect(mrsResult.totalScore).toBe(0);
		expect(mrsResult.severity).toBe('No/Minimal');
		expect(firedRules).toHaveLength(0);
	});

	it('returns Mild severity for total score 5-8', () => {
		const data = createAsymptomaticPatient();
		data.mrsSymptomScale.hotFlushes = 2;
		data.mrsSymptomScale.sleepProblems = 2;
		data.mrsSymptomScale.fatigue = 1;

		const { mrsResult } = calculateMRS(data);
		expect(mrsResult.totalScore).toBe(5);
		expect(mrsResult.severity).toBe('Mild');
	});

	it('returns Moderate severity for total score 9-15', () => {
		const data = createAsymptomaticPatient();
		data.mrsSymptomScale.hotFlushes = 3;
		data.mrsSymptomScale.sleepProblems = 3;
		data.mrsSymptomScale.depressiveMood = 2;
		data.mrsSymptomScale.vaginalDryness = 2;

		const { mrsResult } = calculateMRS(data);
		expect(mrsResult.totalScore).toBe(10);
		expect(mrsResult.severity).toBe('Moderate');
	});

	it('returns Severe severity for total score >= 16', () => {
		const data = createAsymptomaticPatient();
		data.mrsSymptomScale.hotFlushes = 4;
		data.mrsSymptomScale.heartDiscomfort = 3;
		data.mrsSymptomScale.sleepProblems = 3;
		data.mrsSymptomScale.jointPain = 2;
		data.mrsSymptomScale.depressiveMood = 3;
		data.mrsSymptomScale.irritability = 2;
		data.mrsSymptomScale.anxiety = 2;

		const { mrsResult } = calculateMRS(data);
		expect(mrsResult.totalScore).toBeGreaterThanOrEqual(16);
		expect(mrsResult.severity).toBe('Severe');
	});

	it('calculates subscale scores correctly', () => {
		const data = createAsymptomaticPatient();
		data.mrsSymptomScale.hotFlushes = 3;       // somatic
		data.mrsSymptomScale.jointPain = 2;         // somatic
		data.mrsSymptomScale.depressiveMood = 4;    // psychological
		data.mrsSymptomScale.vaginalDryness = 3;    // urogenital

		const { mrsResult } = calculateMRS(data);
		expect(mrsResult.subscales.somatic).toBe(5);
		expect(mrsResult.subscales.psychological).toBe(4);
		expect(mrsResult.subscales.urogenital).toBe(3);
		expect(mrsResult.totalScore).toBe(12);
	});

	it('detects all rule IDs are unique', () => {
		const ids = mrsRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('MRS Severity Function', () => {
	it('returns correct severity for boundary values', () => {
		expect(getMRSSeverity(0)).toBe('No/Minimal');
		expect(getMRSSeverity(4)).toBe('No/Minimal');
		expect(getMRSSeverity(5)).toBe('Mild');
		expect(getMRSSeverity(8)).toBe('Mild');
		expect(getMRSSeverity(9)).toBe('Moderate');
		expect(getMRSSeverity(15)).toBe('Moderate');
		expect(getMRSSeverity(16)).toBe('Severe');
		expect(getMRSSeverity(44)).toBe('Severe');
	});
});

describe('HRT Risk Classification', () => {
	it('returns Favourable for patient with no contraindications', () => {
		const data = createAsymptomaticPatient();
		expect(classifyHRTRisk(data)).toBe('Favourable');
	});

	it('returns Contraindicated for breast cancer history', () => {
		const data = createAsymptomaticPatient();
		data.contraindicationsScreen.breastCancerHistory = 'yes';
		expect(classifyHRTRisk(data)).toBe('Contraindicated');
	});

	it('returns Contraindicated for undiagnosed vaginal bleeding', () => {
		const data = createAsymptomaticPatient();
		data.contraindicationsScreen.undiagnosedVaginalBleeding = 'yes';
		expect(classifyHRTRisk(data)).toBe('Contraindicated');
	});

	it('returns Contraindicated for active cardiovascular disease', () => {
		const data = createAsymptomaticPatient();
		data.contraindicationsScreen.activeCardiovascularDisease = 'yes';
		expect(classifyHRTRisk(data)).toBe('Contraindicated');
	});

	it('returns Contraindicated for pregnancy', () => {
		const data = createAsymptomaticPatient();
		data.contraindicationsScreen.pregnancy = 'yes';
		expect(classifyHRTRisk(data)).toBe('Contraindicated');
	});

	it('returns Contraindicated for liver disease', () => {
		const data = createAsymptomaticPatient();
		data.contraindicationsScreen.liverDisease = 'yes';
		expect(classifyHRTRisk(data)).toBe('Contraindicated');
	});

	it('returns Acceptable for single risk factor (VTE history)', () => {
		const data = createAsymptomaticPatient();
		data.contraindicationsScreen.vteHistory = 'yes';
		expect(classifyHRTRisk(data)).toBe('Acceptable');
	});

	it('returns Cautious for multiple risk factors', () => {
		const data = createAsymptomaticPatient();
		data.contraindicationsScreen.vteHistory = 'yes';
		data.breastHealth.familyHistoryBreastCancer = 'yes';
		expect(classifyHRTRisk(data)).toBe('Cautious');
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for asymptomatic patient', () => {
		const data = createAsymptomaticPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags VTE history', () => {
		const data = createAsymptomaticPatient();
		data.contraindicationsScreen.vteHistory = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-VTE-001')).toBe(true);
	});

	it('flags breast cancer history', () => {
		const data = createAsymptomaticPatient();
		data.contraindicationsScreen.breastCancerHistory = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BREAST-001')).toBe(true);
	});

	it('flags BRCA positive', () => {
		const data = createAsymptomaticPatient();
		data.breastHealth.brcaStatus = 'positive';
		data.breastHealth.brcaType = 'BRCA1';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BRCA-001')).toBe(true);
	});

	it('flags undiagnosed vaginal bleeding', () => {
		const data = createAsymptomaticPatient();
		data.contraindicationsScreen.undiagnosedVaginalBleeding = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-BLEEDING-001')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createAsymptomaticPatient();
		data.contraindicationsScreen.vteHistory = 'yes';
		data.breastHealth.familyHistoryBreastCancer = 'yes';
		data.breastHealth.mammogramResult = 'not-done';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
