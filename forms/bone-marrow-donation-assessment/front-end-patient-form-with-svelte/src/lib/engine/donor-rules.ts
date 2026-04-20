import type { DonorRule } from './types';
import { calculateAge } from './utils';

/**
 * Declarative donor eligibility grading rules.
 * Each rule evaluates donor data and returns true if the condition is present.
 * Grade 1 = mild finding, 2 = moderate, 3 = significant, 4 = severe/critical.
 */
export const donorRules: DonorRule[] = [
	// ─── HLA MATCHING ──────────────────────────────────────────
	{
		id: 'HLA-001',
		category: 'HLA Matching',
		description: 'Full 10/10 HLA match - ideal donor',
		grade: 1,
		evaluate: (d) => d.donorRegistrationHlaTyping.hlaMatchLevel === '10-of-10'
	},
	{
		id: 'HLA-002',
		category: 'HLA Matching',
		description: '9/10 HLA match - single antigen mismatch',
		grade: 2,
		evaluate: (d) => d.donorRegistrationHlaTyping.hlaMatchLevel === '9-of-10'
	},
	{
		id: 'HLA-003',
		category: 'HLA Matching',
		description: '8/10 HLA match - two antigen mismatch',
		grade: 3,
		evaluate: (d) => d.donorRegistrationHlaTyping.hlaMatchLevel === '8-of-10'
	},
	{
		id: 'HLA-004',
		category: 'HLA Matching',
		description: '7/10 or worse HLA match - significant mismatch risk',
		grade: 4,
		evaluate: (d) => d.donorRegistrationHlaTyping.hlaMatchLevel === '7-of-10'
	},
	{
		id: 'HLA-005',
		category: 'HLA Matching',
		description: 'Haploidentical match - high GvHD risk',
		grade: 3,
		evaluate: (d) => d.donorRegistrationHlaTyping.hlaMatchLevel === 'haploidentical'
	},
	{
		id: 'HLA-006',
		category: 'HLA Matching',
		description: 'Positive crossmatch - donor-specific antibodies present',
		grade: 4,
		evaluate: (d) => d.donorRegistrationHlaTyping.crossmatchResult === 'positive'
	},

	// ─── MEDICAL HISTORY ───────────────────────────────────────
	{
		id: 'MH-001',
		category: 'Medical History',
		description: 'Autoimmune disease present',
		grade: 3,
		evaluate: (d) => d.medicalHistory.hasAutoimmuneDisease === 'yes'
	},
	{
		id: 'MH-002',
		category: 'Medical History',
		description: 'History of malignancy',
		grade: 4,
		evaluate: (d) => d.medicalHistory.hasMalignancy === 'yes'
	},
	{
		id: 'MH-003',
		category: 'Medical History',
		description: 'Cardiovascular disease present',
		grade: 3,
		evaluate: (d) => d.medicalHistory.hasCardiovascularDisease === 'yes'
	},
	{
		id: 'MH-004',
		category: 'Medical History',
		description: 'Respiratory disease present',
		grade: 2,
		evaluate: (d) => d.medicalHistory.hasRespiratoryDisease === 'yes'
	},
	{
		id: 'MH-005',
		category: 'Medical History',
		description: 'Renal disease present',
		grade: 3,
		evaluate: (d) => d.medicalHistory.hasRenalDisease === 'yes'
	},
	{
		id: 'MH-006',
		category: 'Medical History',
		description: 'Hepatic disease present',
		grade: 3,
		evaluate: (d) => d.medicalHistory.hasHepaticDisease === 'yes'
	},
	{
		id: 'MH-007',
		category: 'Medical History',
		description: 'Bleeding disorder present',
		grade: 4,
		evaluate: (d) => d.medicalHistory.hasBleedingDisorder === 'yes'
	},
	{
		id: 'MH-008',
		category: 'Medical History',
		description: 'Neurological condition present',
		grade: 2,
		evaluate: (d) => d.medicalHistory.hasNeurologicalCondition === 'yes'
	},

	// ─── HAEMATOLOGICAL ────────────────────────────────────────
	{
		id: 'HM-001',
		category: 'Haematology',
		description: 'Low haemoglobin (<12 g/dL)',
		grade: 2,
		evaluate: (d) =>
			d.haematologicalAssessment.haemoglobin !== null &&
			d.haematologicalAssessment.haemoglobin < 12
	},
	{
		id: 'HM-002',
		category: 'Haematology',
		description: 'Severely low haemoglobin (<10 g/dL)',
		grade: 4,
		evaluate: (d) =>
			d.haematologicalAssessment.haemoglobin !== null &&
			d.haematologicalAssessment.haemoglobin < 10
	},
	{
		id: 'HM-003',
		category: 'Haematology',
		description: 'Low platelet count (<150 x10^9/L)',
		grade: 3,
		evaluate: (d) =>
			d.haematologicalAssessment.plateletCount !== null &&
			d.haematologicalAssessment.plateletCount < 150
	},
	{
		id: 'HM-004',
		category: 'Haematology',
		description: 'Abnormal coagulation screen',
		grade: 3,
		evaluate: (d) => d.haematologicalAssessment.coagulationScreen === 'abnormal'
	},
	{
		id: 'HM-005',
		category: 'Haematology',
		description: 'Abnormal liver function tests',
		grade: 2,
		evaluate: (d) => d.haematologicalAssessment.liverFunction === 'abnormal'
	},
	{
		id: 'HM-006',
		category: 'Haematology',
		description: 'Elevated creatinine (>120 umol/L)',
		grade: 2,
		evaluate: (d) =>
			d.haematologicalAssessment.creatinine !== null &&
			d.haematologicalAssessment.creatinine > 120
	},

	// ─── INFECTIOUS DISEASE ────────────────────────────────────
	{
		id: 'ID-001',
		category: 'Infectious Disease',
		description: 'HIV positive',
		grade: 4,
		evaluate: (d) => d.infectiousDiseaseScreening.hivStatus === 'positive'
	},
	{
		id: 'ID-002',
		category: 'Infectious Disease',
		description: 'Hepatitis B surface antigen positive',
		grade: 4,
		evaluate: (d) => d.infectiousDiseaseScreening.hepatitisBSurfaceAntigen === 'positive'
	},
	{
		id: 'ID-003',
		category: 'Infectious Disease',
		description: 'Hepatitis C antibody positive',
		grade: 4,
		evaluate: (d) => d.infectiousDiseaseScreening.hepatitisCAbntibody === 'positive'
	},
	{
		id: 'ID-004',
		category: 'Infectious Disease',
		description: 'HTLV positive',
		grade: 4,
		evaluate: (d) => d.infectiousDiseaseScreening.htlvStatus === 'positive'
	},
	{
		id: 'ID-005',
		category: 'Infectious Disease',
		description: 'Syphilis screen positive',
		grade: 3,
		evaluate: (d) => d.infectiousDiseaseScreening.syphilisScreen === 'positive'
	},
	{
		id: 'ID-006',
		category: 'Infectious Disease',
		description: 'Active tuberculosis',
		grade: 4,
		evaluate: (d) => d.infectiousDiseaseScreening.tuberculosisScreen === 'positive'
	},
	{
		id: 'ID-007',
		category: 'Infectious Disease',
		description: 'Recent infection present',
		grade: 2,
		evaluate: (d) => d.infectiousDiseaseScreening.recentInfection === 'yes'
	},

	// ─── ANAESTHETIC ───────────────────────────────────────────
	{
		id: 'AN-001',
		category: 'Anaesthetic',
		description: 'ASA Grade I - healthy donor',
		grade: 1,
		evaluate: (d) => d.anaestheticAssessment.asaGrade === 'I'
	},
	{
		id: 'AN-002',
		category: 'Anaesthetic',
		description: 'ASA Grade II - mild systemic disease',
		grade: 2,
		evaluate: (d) => d.anaestheticAssessment.asaGrade === 'II'
	},
	{
		id: 'AN-003',
		category: 'Anaesthetic',
		description: 'ASA Grade III - severe systemic disease',
		grade: 4,
		evaluate: (d) => d.anaestheticAssessment.asaGrade === 'III'
	},
	{
		id: 'AN-004',
		category: 'Anaesthetic',
		description: 'ASA Grade IV - life-threatening disease',
		grade: 4,
		evaluate: (d) => d.anaestheticAssessment.asaGrade === 'IV'
	},
	{
		id: 'AN-005',
		category: 'Anaesthetic',
		description: 'Previous anaesthetic complications',
		grade: 3,
		evaluate: (d) => d.anaestheticAssessment.anaestheticComplications === 'yes'
	},
	{
		id: 'AN-006',
		category: 'Anaesthetic',
		description: 'Difficult airway (Mallampati III/IV)',
		grade: 3,
		evaluate: (d) =>
			d.anaestheticAssessment.mallampatiScore === 'III' ||
			d.anaestheticAssessment.mallampatiScore === 'IV'
	},
	{
		id: 'AN-007',
		category: 'Anaesthetic',
		description: 'Family history of anaesthetic problems',
		grade: 2,
		evaluate: (d) => d.anaestheticAssessment.familyAnaestheticProblems === 'yes'
	},

	// ─── COLLECTION METHOD ─────────────────────────────────────
	{
		id: 'CM-001',
		category: 'Collection Method',
		description: 'G-CSF ineligible',
		grade: 3,
		evaluate: (d) => d.collectionMethodAssessment.gcsfEligible === 'no'
	},
	{
		id: 'CM-002',
		category: 'Collection Method',
		description: 'Poor venous access requiring central line',
		grade: 2,
		evaluate: (d) => d.collectionMethodAssessment.centralLineRequired === 'yes'
	},
	{
		id: 'CM-003',
		category: 'Collection Method',
		description: 'Unsuitable venous access for apheresis',
		grade: 2,
		evaluate: (d) => d.collectionMethodAssessment.venousAccessSuitableForApheresis === 'no'
	},

	// ─── PSYCHOLOGICAL ─────────────────────────────────────────
	{
		id: 'PS-001',
		category: 'Psychological',
		description: 'Coercion concerns identified',
		grade: 4,
		evaluate: (d) => d.psychologicalReadiness.coercionConcerns === 'yes'
	},
	{
		id: 'PS-002',
		category: 'Psychological',
		description: 'Severe anxiety about procedure',
		grade: 3,
		evaluate: (d) => d.psychologicalReadiness.anxietyAboutProcedure === 'severe'
	},
	{
		id: 'PS-003',
		category: 'Psychological',
		description: 'Donor does not understand procedure',
		grade: 4,
		evaluate: (d) => d.psychologicalReadiness.understandsProcedure === 'no'
	},
	{
		id: 'PS-004',
		category: 'Psychological',
		description: 'Donor unwilling to proceed',
		grade: 4,
		evaluate: (d) => d.psychologicalReadiness.willingToProceed === 'no'
	},

	// ─── DEMOGRAPHICS ──────────────────────────────────────────
	{
		id: 'DM-001',
		category: 'Demographics',
		description: 'Donor age >60 years',
		grade: 2,
		evaluate: (d) => {
			const age = calculateAge(d.demographics.dateOfBirth);
			return age !== null && age > 60;
		}
	},
	{
		id: 'DM-002',
		category: 'Demographics',
		description: 'Donor age <18 years',
		grade: 4,
		evaluate: (d) => {
			const age = calculateAge(d.demographics.dateOfBirth);
			return age !== null && age < 18;
		}
	},

	// ─── PHYSICAL EXAMINATION ──────────────────────────────────
	{
		id: 'PE-001',
		category: 'Physical Examination',
		description: 'Abnormal cardiovascular examination',
		grade: 3,
		evaluate: (d) => d.physicalExamination.cardiovascularExamination === 'abnormal'
	},
	{
		id: 'PE-002',
		category: 'Physical Examination',
		description: 'Abnormal respiratory examination',
		grade: 3,
		evaluate: (d) => d.physicalExamination.respiratoryExamination === 'abnormal'
	},
	{
		id: 'PE-003',
		category: 'Physical Examination',
		description: 'Donor appears acutely unwell',
		grade: 4,
		evaluate: (d) => d.physicalExamination.generalAppearance === 'acutely-unwell'
	},
	{
		id: 'PE-004',
		category: 'Physical Examination',
		description: 'Low oxygen saturation (<95%)',
		grade: 3,
		evaluate: (d) =>
			d.physicalExamination.oxygenSaturation !== null &&
			d.physicalExamination.oxygenSaturation < 95
	},
	{
		id: 'PE-005',
		category: 'Physical Examination',
		description: 'Posterior iliac crest unsuitable for harvest',
		grade: 2,
		evaluate: (d) => d.physicalExamination.posteriorIliacCrestAssessment === 'unsuitable'
	}
];
