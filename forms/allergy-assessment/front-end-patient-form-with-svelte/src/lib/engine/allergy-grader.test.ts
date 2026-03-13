import { describe, it, expect } from 'vitest';
import { calculateAllergySeverity, calculateAllergyBurden } from './allergy-grader';
import { detectAdditionalFlags } from './flagged-issues';
import { allergyRules } from './allergy-rules';
import type { AssessmentData } from './types';

function createHealthyPatient(): AssessmentData {
	return {
		demographics: {
			firstName: 'Jane',
			lastName: 'Smith',
			dateOfBirth: '1990-05-15',
			nhsNumber: '943 476 5919',
			sex: 'female',
			weight: 65,
			height: 165,
			bmi: 23.9
		},
		allergyHistory: {
			ageOfOnset: null,
			knownAllergens: '',
			familyHistoryOfAtopy: 'no',
			familyAtopyDetails: '',
			familyHistoryOfAllergy: 'no',
			familyAllergyDetails: ''
		},
		drugAllergies: {
			hasDrugAllergies: 'no',
			drugAllergies: [],
			crossReactivityConcerns: ''
		},
		foodAllergies: {
			hasFoodAllergies: 'no',
			foodAllergies: [],
			igeType: '',
			oralAllergySyndrome: 'no',
			dietaryRestrictions: ''
		},
		environmentalAllergies: {
			pollenAllergy: 'no',
			dustMiteAllergy: 'no',
			mouldAllergy: 'no',
			animalDanderAllergy: 'no',
			latexAllergy: 'no',
			insectStingAllergy: 'no',
			insectStingSeverity: '',
			seasonalPattern: '',
			otherEnvironmentalAllergens: ''
		},
		anaphylaxisHistory: {
			hasAnaphylaxisHistory: 'no',
			numberOfEpisodes: null,
			episodes: [],
			adrenalineAutoInjectorPrescribed: '',
			actionPlanInPlace: ''
		},
		testingResults: {
			skinPrickTestsDone: 'no',
			specificIgEDone: 'no',
			componentResolvedDiagnosticsDone: 'no',
			challengeTestsDone: 'no',
			patchTestsDone: 'no',
			testResults: []
		},
		currentManagement: {
			antihistamines: 'no',
			antihistamineDetails: '',
			nasalSteroids: 'no',
			adrenalineAutoInjector: 'no',
			immunotherapy: 'no',
			immunotherapyDetails: '',
			biologics: 'no',
			biologicDetails: '',
			allergenAvoidanceStrategies: '',
			otherMedications: []
		},
		comorbidities: {
			asthma: 'no',
			asthmaSeverity: '',
			eczema: 'no',
			eczemaSeverity: '',
			rhinitis: 'no',
			rhinitisSeverity: '',
			eosinophilicOesophagitis: 'no',
			mastCellDisorders: 'no',
			mastCellDetails: '',
			mentalHealthImpact: 'no',
			mentalHealthDetails: ''
		},
		impactActionPlan: {
			qualityOfLifeScore: null,
			schoolWorkImpact: 'no',
			schoolWorkImpactDetails: '',
			emergencyActionPlanStatus: '',
			trainingProvided: '',
			trainingDetails: '',
			followUpSchedule: ''
		}
	};
}

describe('Allergy Severity Classification', () => {
	it('returns mild for a patient with no allergies', () => {
		const data = createHealthyPatient();
		const result = calculateAllergySeverity(data);
		expect(result.severityLevel).toBe('mild');
		expect(result.firedRules).toHaveLength(0);
	});

	it('returns mild for patient with mild pollen allergy', () => {
		const data = createHealthyPatient();
		data.environmentalAllergies.pollenAllergy = 'yes';
		const result = calculateAllergySeverity(data);
		expect(result.severityLevel).toBe('mild');
		expect(result.firedRules.length).toBeGreaterThanOrEqual(1);
	});

	it('returns moderate for patient with latex allergy', () => {
		const data = createHealthyPatient();
		data.environmentalAllergies.latexAllergy = 'yes';
		const result = calculateAllergySeverity(data);
		expect(result.severityLevel).toBe('moderate');
	});

	it('returns moderate for patient with asthma comorbidity', () => {
		const data = createHealthyPatient();
		data.comorbidities.asthma = 'yes';
		data.comorbidities.asthmaSeverity = 'moderate';
		const result = calculateAllergySeverity(data);
		expect(result.severityLevel).toBe('moderate');
	});

	it('returns severe for patient with anaphylaxis history', () => {
		const data = createHealthyPatient();
		data.anaphylaxisHistory.hasAnaphylaxisHistory = 'yes';
		data.anaphylaxisHistory.numberOfEpisodes = 1;
		const result = calculateAllergySeverity(data);
		expect(result.severityLevel).toBe('severe');
	});

	it('returns severe for patient with drug anaphylaxis', () => {
		const data = createHealthyPatient();
		data.drugAllergies.hasDrugAllergies = 'yes';
		data.drugAllergies.drugAllergies = [
			{ allergen: 'Penicillin', reactionType: 'Anaphylaxis', severity: 'anaphylaxis', timing: '< 1 hour', alternativesTolerated: '' }
		];
		const result = calculateAllergySeverity(data);
		expect(result.severityLevel).toBe('severe');
	});

	it('returns severe for anaphylaxis without auto-injector', () => {
		const data = createHealthyPatient();
		data.anaphylaxisHistory.hasAnaphylaxisHistory = 'yes';
		data.anaphylaxisHistory.numberOfEpisodes = 1;
		data.anaphylaxisHistory.adrenalineAutoInjectorPrescribed = 'no';
		const result = calculateAllergySeverity(data);
		expect(result.severityLevel).toBe('severe');
	});

	it('detects all rule IDs are unique', () => {
		const ids = allergyRules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe('Allergy Burden Score', () => {
	it('returns 0 for patient with no allergies', () => {
		const data = createHealthyPatient();
		const score = calculateAllergyBurden(data);
		expect(score).toBe(0);
	});

	it('calculates burden score from drug allergies', () => {
		const data = createHealthyPatient();
		data.drugAllergies.drugAllergies = [
			{ allergen: 'Penicillin', reactionType: 'Rash', severity: 'mild', timing: '', alternativesTolerated: '' },
			{ allergen: 'Aspirin', reactionType: 'Urticaria', severity: 'moderate', timing: '', alternativesTolerated: '' }
		];
		const score = calculateAllergyBurden(data);
		// mild=1, moderate=2
		expect(score).toBe(3);
	});

	it('weights environmental allergies correctly', () => {
		const data = createHealthyPatient();
		data.environmentalAllergies.pollenAllergy = 'yes';
		data.environmentalAllergies.latexAllergy = 'yes'; // weighted as 2
		const score = calculateAllergyBurden(data);
		expect(score).toBe(3); // 1 for pollen + 2 for latex
	});
});

describe('Additional Flags Detection', () => {
	it('returns no flags for healthy patient', () => {
		const data = createHealthyPatient();
		const flags = detectAdditionalFlags(data);
		expect(flags).toHaveLength(0);
	});

	it('flags anaphylaxis history', () => {
		const data = createHealthyPatient();
		data.anaphylaxisHistory.hasAnaphylaxisHistory = 'yes';
		data.anaphylaxisHistory.numberOfEpisodes = 2;
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ANAPH-001')).toBe(true);
	});

	it('flags missing auto-injector with anaphylaxis history', () => {
		const data = createHealthyPatient();
		data.anaphylaxisHistory.hasAnaphylaxisHistory = 'yes';
		data.anaphylaxisHistory.adrenalineAutoInjectorPrescribed = 'no';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ANAPH-002')).toBe(true);
	});

	it('flags latex allergy', () => {
		const data = createHealthyPatient();
		data.environmentalAllergies.latexAllergy = 'yes';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-LATEX-001')).toBe(true);
	});

	it('flags asthma comorbidity', () => {
		const data = createHealthyPatient();
		data.comorbidities.asthma = 'yes';
		data.comorbidities.asthmaSeverity = 'moderate';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-ASTHMA-001')).toBe(true);
	});

	it('flags multiple food allergies', () => {
		const data = createHealthyPatient();
		data.foodAllergies.foodAllergies = [
			{ allergen: 'Peanut', reactionType: 'Hives', severity: 'moderate', timing: '', alternativesTolerated: '' },
			{ allergen: 'Tree nuts', reactionType: 'Swelling', severity: 'moderate', timing: '', alternativesTolerated: '' },
			{ allergen: 'Shellfish', reactionType: 'Anaphylaxis', severity: 'anaphylaxis', timing: '', alternativesTolerated: '' }
		];
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-FOOD-001')).toBe(true);
	});

	it('flags missing action plan', () => {
		const data = createHealthyPatient();
		data.impactActionPlan.emergencyActionPlanStatus = 'not-in-place';
		const flags = detectAdditionalFlags(data);
		expect(flags.some((f) => f.id === 'FLAG-PLAN-002')).toBe(true);
	});

	it('sorts flags by priority (high first)', () => {
		const data = createHealthyPatient();
		data.anaphylaxisHistory.hasAnaphylaxisHistory = 'yes';
		data.anaphylaxisHistory.adrenalineAutoInjectorPrescribed = 'no';
		data.comorbidities.asthma = 'yes';
		data.impactActionPlan.emergencyActionPlanStatus = 'not-in-place';
		const flags = detectAdditionalFlags(data);
		const priorities = flags.map((f) => f.priority);
		const sortedPriorities = [...priorities].sort((a, b) => {
			const order = { high: 0, medium: 1, low: 2 };
			return order[a] - order[b];
		});
		expect(priorities).toEqual(sortedPriorities);
	});
});
