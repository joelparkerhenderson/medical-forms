use serde::{Deserialize, Serialize};

pub type RiskLevel = String;

// ─── Patient Information (Step 1) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub sex: String,
    pub nhs_number: String,
}

// ─── Referral Reason (Step 2) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ReferralReason {
    pub referral_indication: String,
    pub referring_clinician: String,
    pub urgency: String,
    pub referral_date: String,
}

// ─── Family Pedigree (Step 3) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FamilyPedigree {
    pub maternal_grandmother_conditions: String,
    pub maternal_grandmother_cancers: String,
    pub maternal_grandmother_age_at_diagnosis: String,
    pub maternal_grandmother_deceased: String,
    pub maternal_grandfather_conditions: String,
    pub maternal_grandfather_cancers: String,
    pub maternal_grandfather_age_at_diagnosis: String,
    pub maternal_grandfather_deceased: String,
    pub paternal_grandmother_conditions: String,
    pub paternal_grandmother_cancers: String,
    pub paternal_grandmother_age_at_diagnosis: String,
    pub paternal_grandmother_deceased: String,
    pub paternal_grandfather_conditions: String,
    pub paternal_grandfather_cancers: String,
    pub paternal_grandfather_age_at_diagnosis: String,
    pub paternal_grandfather_deceased: String,
    pub mother_conditions: String,
    pub mother_cancers: String,
    pub mother_age_at_diagnosis: String,
    pub mother_deceased: String,
    pub father_conditions: String,
    pub father_cancers: String,
    pub father_age_at_diagnosis: String,
    pub father_deceased: String,
    pub siblings_details: String,
    pub children_details: String,
}

// ─── Personal Medical History (Step 4) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PersonalMedicalHistory {
    pub personal_cancer_history: String,
    pub cancer_type: String,
    pub age_at_diagnosis: Option<u8>,
    pub bilateral_cancer: String,
    pub multiple_primary_cancers: String,
}

// ─── Cancer Risk Assessment (Step 5) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CancerRiskAssessment {
    pub cancer_gene_panel: String,
    pub brca_result: String,
    pub lynch_result: String,
    pub manchester_score: Option<u8>,
    pub affected_relatives_under50: Option<u8>,
}

// ─── Cardiac Genetic Risk (Step 6) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CardiacGeneticRisk {
    pub familial_hypercholesterolemia: String,
    pub cardiomyopathy: String,
    pub aortic_aneurysm: String,
    pub sudden_cardiac_death: String,
    pub early_onset_cvd: String,
    pub cardiac_gene_result: String,
    pub cardiovascular_details: String,
}

// ─── Reproductive Genetics (Step 7) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ReproductiveGenetics {
    pub consanguinity: String,
    pub carrier_status: String,
    pub carrier_status_details: String,
    pub recurrent_miscarriages: String,
    pub previous_affected_child: String,
    pub previous_affected_child_details: String,
    pub prenatal_testing_wishes: String,
}

// ─── Genetic Testing Status (Step 8) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GeneticTestingStatus {
    pub previous_genetic_tests: String,
    pub previous_genetic_tests_details: String,
    pub test_results: String,
    pub variants_of_uncertain_significance: String,
    pub vus_details: String,
    pub known_familial_variant: String,
    pub familial_variant_details: String,
}

// ─── Psychological Impact (Step 9) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PsychologicalImpact {
    pub psychological_readiness: String,
    pub genetic_counselling: String,
    pub family_communication: String,
    pub insurance_implications: String,
    pub insurance_implications_details: String,
    pub support_needs: String,
}

// ─── Clinical Review (Step 10) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub clinician_notes: String,
    pub recommended_actions: String,
    pub follow_up_plan: String,
    pub urgent_referral_needed: String,
    pub cascade_testing_needed: String,
}

// ─── Assessment Data (all sections) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub referral_reason: ReferralReason,
    pub family_pedigree: FamilyPedigree,
    pub personal_medical_history: PersonalMedicalHistory,
    pub cancer_risk_assessment: CancerRiskAssessment,
    pub cardiac_genetic_risk: CardiacGeneticRisk,
    pub reproductive_genetics: ReproductiveGenetics,
    pub genetic_testing_status: GeneticTestingStatus,
    pub psychological_impact: PsychologicalImpact,
    pub clinical_review: ClinicalReview,
}

// ─── Grading types ───────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FiredRule {
    pub id: String,
    pub category: String,
    pub description: String,
    pub concern_level: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdditionalFlag {
    pub id: String,
    pub category: String,
    pub message: String,
    pub priority: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GradingResult {
    pub risk_level: RiskLevel,
    pub risk_score: u32,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
