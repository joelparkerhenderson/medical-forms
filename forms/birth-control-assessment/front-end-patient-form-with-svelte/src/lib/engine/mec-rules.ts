import type { MECRule } from './types';
import { calculateAge } from './utils';

/**
 * Declarative UK MEC grading rules.
 * Each rule evaluates patient data and returns true if the condition is present.
 * Rules assign a UK MEC category (1-4) and specify which contraceptive methods are affected.
 * MEC 1 = no restriction, 2 = advantages outweigh risks, 3 = risks outweigh advantages, 4 = unacceptable risk.
 */
export const mecRules: MECRule[] = [
	// ─── THROMBOEMBOLISM ──────────────────────────────────────
	{
		id: 'VTE-001',
		category: 'Thromboembolism',
		description: 'Previous DVT or PE (UK MEC 4 for COC)',
		mecCategory: 4,
		affectedMethods: ['coc'],
		evaluate: (d) => d.thromboembolismRisk.previousDVT === 'yes' || d.thromboembolismRisk.previousPE === 'yes'
	},
	{
		id: 'VTE-002',
		category: 'Thromboembolism',
		description: 'Previous DVT or PE (UK MEC 2 for POP/implant)',
		mecCategory: 2,
		affectedMethods: ['pop', 'implant'],
		evaluate: (d) => d.thromboembolismRisk.previousDVT === 'yes' || d.thromboembolismRisk.previousPE === 'yes'
	},
	{
		id: 'VTE-003',
		category: 'Thromboembolism',
		description: 'Known thrombophilia (UK MEC 4 for COC)',
		mecCategory: 4,
		affectedMethods: ['coc'],
		evaluate: (d) => d.thromboembolismRisk.knownThrombophilia === 'yes'
	},
	{
		id: 'VTE-004',
		category: 'Thromboembolism',
		description: 'Known thrombophilia (UK MEC 2 for POP/implant)',
		mecCategory: 2,
		affectedMethods: ['pop', 'implant'],
		evaluate: (d) => d.thromboembolismRisk.knownThrombophilia === 'yes'
	},
	{
		id: 'VTE-005',
		category: 'Thromboembolism',
		description: 'Major surgery with prolonged immobilisation (UK MEC 4 for COC)',
		mecCategory: 4,
		affectedMethods: ['coc'],
		evaluate: (d) => d.thromboembolismRisk.recentMajorSurgery === 'yes' && d.thromboembolismRisk.immobilityRisk === 'yes'
	},
	{
		id: 'VTE-006',
		category: 'Thromboembolism',
		description: 'Family history of VTE in first-degree relative (UK MEC 3 for COC)',
		mecCategory: 3,
		affectedMethods: ['coc'],
		evaluate: (d) => d.cardiovascularRisk.familyHistoryVTE === 'yes'
	},

	// ─── CARDIOVASCULAR ──────────────────────────────────────
	{
		id: 'CV-001',
		category: 'Cardiovascular',
		description: 'Ischaemic heart disease (UK MEC 4 for COC)',
		mecCategory: 4,
		affectedMethods: ['coc'],
		evaluate: (d) => d.cardiovascularRisk.ischaemicHeartDisease === 'yes'
	},
	{
		id: 'CV-002',
		category: 'Cardiovascular',
		description: 'Ischaemic heart disease (UK MEC 2 for POP/implant/injection)',
		mecCategory: 2,
		affectedMethods: ['pop', 'implant', 'injection'],
		evaluate: (d) => d.cardiovascularRisk.ischaemicHeartDisease === 'yes'
	},
	{
		id: 'CV-003',
		category: 'Cardiovascular',
		description: 'History of stroke (UK MEC 4 for COC)',
		mecCategory: 4,
		affectedMethods: ['coc'],
		evaluate: (d) => d.cardiovascularRisk.strokeHistory === 'yes'
	},
	{
		id: 'CV-004',
		category: 'Cardiovascular',
		description: 'History of stroke (UK MEC 2 for POP/implant/injection)',
		mecCategory: 2,
		affectedMethods: ['pop', 'implant', 'injection'],
		evaluate: (d) => d.cardiovascularRisk.strokeHistory === 'yes'
	},
	{
		id: 'CV-005',
		category: 'Cardiovascular',
		description: 'Hypertension systolic >= 160 or diastolic >= 100 (UK MEC 4 for COC)',
		mecCategory: 4,
		affectedMethods: ['coc'],
		evaluate: (d) =>
			(d.cardiovascularRisk.systolicBP !== null && d.cardiovascularRisk.systolicBP >= 160) ||
			(d.cardiovascularRisk.diastolicBP !== null && d.cardiovascularRisk.diastolicBP >= 100)
	},
	{
		id: 'CV-006',
		category: 'Cardiovascular',
		description: 'Hypertension systolic 140-159 or diastolic 90-99 (UK MEC 3 for COC)',
		mecCategory: 3,
		affectedMethods: ['coc'],
		evaluate: (d) =>
			(d.cardiovascularRisk.systolicBP !== null && d.cardiovascularRisk.systolicBP >= 140 && d.cardiovascularRisk.systolicBP < 160) ||
			(d.cardiovascularRisk.diastolicBP !== null && d.cardiovascularRisk.diastolicBP >= 90 && d.cardiovascularRisk.diastolicBP < 100)
	},
	{
		id: 'CV-007',
		category: 'Cardiovascular',
		description: 'Hypertension (UK MEC 2 for POP/implant/injection)',
		mecCategory: 2,
		affectedMethods: ['pop', 'implant', 'injection'],
		evaluate: (d) => d.cardiovascularRisk.hypertension === 'yes'
	},
	{
		id: 'CV-008',
		category: 'Cardiovascular',
		description: 'Valvular heart disease with complications (UK MEC 4 for COC)',
		mecCategory: 4,
		affectedMethods: ['coc'],
		evaluate: (d) => d.cardiovascularRisk.valvularHeartDisease === 'yes' && d.cardiovascularRisk.valvularComplications === 'yes'
	},

	// ─── MIGRAINE ──────────────────────────────────────────
	{
		id: 'MIG-001',
		category: 'Migraine',
		description: 'Migraine with aura at any age (UK MEC 4 for COC)',
		mecCategory: 4,
		affectedMethods: ['coc'],
		evaluate: (d) => d.medicalHistory.migraine === 'yes' && d.medicalHistory.migraineWithAura === 'yes'
	},
	{
		id: 'MIG-002',
		category: 'Migraine',
		description: 'Migraine with aura (UK MEC 2 for POP/implant/injection)',
		mecCategory: 2,
		affectedMethods: ['pop', 'implant', 'injection'],
		evaluate: (d) => d.medicalHistory.migraine === 'yes' && d.medicalHistory.migraineWithAura === 'yes'
	},
	{
		id: 'MIG-003',
		category: 'Migraine',
		description: 'Migraine without aura age >= 35 (UK MEC 3 for COC)',
		mecCategory: 3,
		affectedMethods: ['coc'],
		evaluate: (d) => {
			const age = calculateAge(d.demographics.dateOfBirth);
			return d.medicalHistory.migraine === 'yes' && d.medicalHistory.migraineWithAura === 'no' && age !== null && age >= 35;
		}
	},
	{
		id: 'MIG-004',
		category: 'Migraine',
		description: 'Migraine without aura age < 35 (UK MEC 2 for COC)',
		mecCategory: 2,
		affectedMethods: ['coc'],
		evaluate: (d) => {
			const age = calculateAge(d.demographics.dateOfBirth);
			return d.medicalHistory.migraine === 'yes' && d.medicalHistory.migraineWithAura === 'no' && age !== null && age < 35;
		}
	},

	// ─── SMOKING & AGE ──────────────────────────────────────
	{
		id: 'SM-001',
		category: 'Smoking',
		description: 'Age >= 35 and smokes >= 15 cigarettes/day (UK MEC 4 for COC)',
		mecCategory: 4,
		affectedMethods: ['coc'],
		evaluate: (d) => {
			const age = calculateAge(d.demographics.dateOfBirth);
			return age !== null && age >= 35 && d.lifestyleAssessment.smoking === 'current' && d.lifestyleAssessment.cigarettesPerDay !== null && d.lifestyleAssessment.cigarettesPerDay >= 15;
		}
	},
	{
		id: 'SM-002',
		category: 'Smoking',
		description: 'Age >= 35 and smokes < 15 cigarettes/day (UK MEC 3 for COC)',
		mecCategory: 3,
		affectedMethods: ['coc'],
		evaluate: (d) => {
			const age = calculateAge(d.demographics.dateOfBirth);
			return age !== null && age >= 35 && d.lifestyleAssessment.smoking === 'current' && (d.lifestyleAssessment.cigarettesPerDay === null || d.lifestyleAssessment.cigarettesPerDay < 15);
		}
	},
	{
		id: 'SM-003',
		category: 'Smoking',
		description: 'Age >= 35 and stopped smoking < 1 year ago (UK MEC 3 for COC)',
		mecCategory: 3,
		affectedMethods: ['coc'],
		evaluate: (d) => {
			const age = calculateAge(d.demographics.dateOfBirth);
			return age !== null && age >= 35 && d.lifestyleAssessment.smoking === 'ex-smoker';
		}
	},
	{
		id: 'SM-004',
		category: 'Smoking',
		description: 'Current smoker (UK MEC 2 for COC if age < 35)',
		mecCategory: 2,
		affectedMethods: ['coc'],
		evaluate: (d) => {
			const age = calculateAge(d.demographics.dateOfBirth);
			return age !== null && age < 35 && d.lifestyleAssessment.smoking === 'current';
		}
	},

	// ─── BMI / OBESITY ──────────────────────────────────────
	{
		id: 'BMI-001',
		category: 'BMI',
		description: 'BMI >= 35 (UK MEC 3 for COC)',
		mecCategory: 3,
		affectedMethods: ['coc'],
		evaluate: (d) => d.demographics.bmi !== null && d.demographics.bmi >= 35
	},
	{
		id: 'BMI-002',
		category: 'BMI',
		description: 'BMI 30-34 (UK MEC 2 for COC)',
		mecCategory: 2,
		affectedMethods: ['coc'],
		evaluate: (d) => d.demographics.bmi !== null && d.demographics.bmi >= 30 && d.demographics.bmi < 35
	},
	{
		id: 'BMI-003',
		category: 'BMI',
		description: 'BMI >= 30 (UK MEC 1 for POP/implant/IUS/IUD)',
		mecCategory: 1,
		affectedMethods: ['pop', 'implant', 'ius', 'iud'],
		evaluate: (d) => d.demographics.bmi !== null && d.demographics.bmi >= 30
	},

	// ─── BREAST CANCER ──────────────────────────────────────
	{
		id: 'BC-001',
		category: 'Breast Cancer',
		description: 'Current breast cancer (UK MEC 4 for all hormonal methods)',
		mecCategory: 4,
		affectedMethods: ['coc', 'pop', 'implant', 'injection', 'ius'],
		evaluate: (d) => d.medicalHistory.breastCancer === 'current'
	},
	{
		id: 'BC-002',
		category: 'Breast Cancer',
		description: 'Breast cancer within past 5 years (UK MEC 3 for all hormonal methods)',
		mecCategory: 3,
		affectedMethods: ['coc', 'pop', 'implant', 'injection', 'ius'],
		evaluate: (d) => d.medicalHistory.breastCancer === 'past-5-years'
	},

	// ─── LIVER DISEASE ──────────────────────────────────────
	{
		id: 'LIV-001',
		category: 'Liver',
		description: 'Active viral hepatitis (UK MEC 3/4 for COC)',
		mecCategory: 3,
		affectedMethods: ['coc'],
		evaluate: (d) => d.medicalHistory.liverDisease === 'active-hepatitis'
	},
	{
		id: 'LIV-002',
		category: 'Liver',
		description: 'Liver tumour (UK MEC 4 for COC)',
		mecCategory: 4,
		affectedMethods: ['coc'],
		evaluate: (d) => d.medicalHistory.liverDisease === 'liver-tumour'
	},
	{
		id: 'LIV-003',
		category: 'Liver',
		description: 'Severe cirrhosis (UK MEC 3 for COC/POP/implant/injection)',
		mecCategory: 3,
		affectedMethods: ['coc', 'pop', 'implant', 'injection'],
		evaluate: (d) => d.medicalHistory.liverDisease === 'cirrhosis'
	},

	// ─── SLE ──────────────────────────────────────────
	{
		id: 'SLE-001',
		category: 'SLE',
		description: 'SLE with antiphospholipid antibodies (UK MEC 4 for COC)',
		mecCategory: 4,
		affectedMethods: ['coc'],
		evaluate: (d) => d.medicalHistory.sle === 'yes' && d.medicalHistory.sleAntiphospholipid === 'yes'
	},
	{
		id: 'SLE-002',
		category: 'SLE',
		description: 'SLE without antiphospholipid antibodies (UK MEC 2 for COC)',
		mecCategory: 2,
		affectedMethods: ['coc'],
		evaluate: (d) => d.medicalHistory.sle === 'yes' && d.medicalHistory.sleAntiphospholipid !== 'yes'
	},

	// ─── DIABETES ──────────────────────────────────────────
	{
		id: 'DM-001',
		category: 'Diabetes',
		description: 'Diabetes with vascular complications (UK MEC 3/4 for COC)',
		mecCategory: 3,
		affectedMethods: ['coc'],
		evaluate: (d) => (d.medicalHistory.diabetes === 'type-1' || d.medicalHistory.diabetes === 'type-2') && d.medicalHistory.diabetesComplications === 'yes'
	},
	{
		id: 'DM-002',
		category: 'Diabetes',
		description: 'Diabetes without complications (UK MEC 2 for COC)',
		mecCategory: 2,
		affectedMethods: ['coc'],
		evaluate: (d) => (d.medicalHistory.diabetes === 'type-1' || d.medicalHistory.diabetes === 'type-2') && d.medicalHistory.diabetesComplications !== 'yes'
	},

	// ─── MEDICATIONS ──────────────────────────────────────
	{
		id: 'MED-001',
		category: 'Medications',
		description: 'Enzyme-inducing drugs (UK MEC 3 for COC/POP/patch/ring)',
		mecCategory: 3,
		affectedMethods: ['coc', 'pop'],
		evaluate: (d) => d.currentMedications.enzymeInducingDrugs === 'yes'
	},
	{
		id: 'MED-002',
		category: 'Medications',
		description: 'St John Wort or herbal remedies with enzyme-inducing potential (UK MEC 3 for COC)',
		mecCategory: 3,
		affectedMethods: ['coc'],
		evaluate: (d) => d.currentMedications.herbalRemedies === 'yes'
	},

	// ─── BREASTFEEDING ──────────────────────────────────────
	{
		id: 'BF-001',
		category: 'Breastfeeding',
		description: 'Breastfeeding < 6 weeks postpartum (UK MEC 4 for COC)',
		mecCategory: 4,
		affectedMethods: ['coc'],
		evaluate: (d) => d.contraceptivePreferences.breastfeeding === 'yes' && d.contraceptivePreferences.postpartumWeeks !== null && d.contraceptivePreferences.postpartumWeeks < 6
	},
	{
		id: 'BF-002',
		category: 'Breastfeeding',
		description: 'Breastfeeding 6 weeks to 6 months postpartum (UK MEC 2 for COC)',
		mecCategory: 2,
		affectedMethods: ['coc'],
		evaluate: (d) => d.contraceptivePreferences.breastfeeding === 'yes' && d.contraceptivePreferences.postpartumWeeks !== null && d.contraceptivePreferences.postpartumWeeks >= 6 && d.contraceptivePreferences.postpartumWeeks < 26
	},

	// ─── AGE ──────────────────────────────────────────
	{
		id: 'AGE-001',
		category: 'Demographics',
		description: 'Age > 50 (UK MEC 2 for COC)',
		mecCategory: 2,
		affectedMethods: ['coc'],
		evaluate: (d) => {
			const age = calculateAge(d.demographics.dateOfBirth);
			return age !== null && age > 50;
		}
	},
];
