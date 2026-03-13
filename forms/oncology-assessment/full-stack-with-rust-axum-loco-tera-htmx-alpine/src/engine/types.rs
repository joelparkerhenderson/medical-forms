use serde::{Deserialize, Serialize};

pub type OncologyLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub patient_sex: String,
    pub medical_record_number: String,
    pub referring_physician: String,
    pub assessment_date: String,
    pub primary_oncologist: String,
    pub insurance_status: String,
}

// ─── Cancer Diagnosis (Step 2) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CancerDiagnosis {
    pub cancer_type: String,
    pub cancer_site: String,
    pub histology: String,
    pub date_of_diagnosis: String,
    pub diagnosis_method: String,
    pub biomarkers_tested: String,
    pub genetic_testing_done: String,
    pub family_cancer_history: String,
}

// ─── Staging & Grading (Step 3) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct StagingGrading {
    pub tnm_t_stage: String,
    pub tnm_n_stage: String,
    pub tnm_m_stage: String,
    pub overall_stage: String,
    pub tumor_grade: String,
    pub metastatic_sites: String,
    pub staging_date: String,
    pub staging_method: String,
}

// ─── Treatment History (Step 4) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TreatmentHistory {
    pub prior_surgery: String,
    pub surgery_date: String,
    pub prior_radiation: String,
    pub radiation_site: String,
    pub prior_chemotherapy: String,
    pub chemotherapy_regimen: String,
    pub prior_immunotherapy: String,
    pub treatment_response: String,
}

// ─── Current Treatment (Step 5) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentTreatment {
    pub current_treatment_type: String,
    pub current_regimen: String,
    pub treatment_cycle: String,
    pub treatment_start_date: String,
    pub treatment_intent: String,
    pub clinical_trial_enrollment: String,
    pub treatment_modifications: String,
    pub next_treatment_date: String,
}

// ─── Side Effects & Toxicity (Step 6) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SideEffectsToxicity {
    pub nausea_severity: Option<u8>,
    pub fatigue_severity: Option<u8>,
    pub pain_severity: Option<u8>,
    pub neuropathy_severity: Option<u8>,
    pub mucositis_severity: Option<u8>,
    pub skin_toxicity_severity: Option<u8>,
    pub hematologic_toxicity: String,
    pub weight_change: String,
}

// ─── Performance Status (Step 7) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PerformanceStatus {
    pub ecog_score: Option<u8>,
    pub karnofsky_score: Option<u8>,
    pub mobility_level: String,
    pub self_care_ability: Option<u8>,
    pub daily_activity_level: Option<u8>,
    pub nutritional_status: Option<u8>,
    pub cognitive_function: Option<u8>,
    pub sleep_quality: Option<u8>,
}

// ─── Psychosocial Assessment (Step 8) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PsychosocialAssessment {
    pub anxiety_level: Option<u8>,
    pub depression_screening: Option<u8>,
    pub distress_thermometer: Option<u8>,
    pub social_support: Option<u8>,
    pub financial_toxicity: Option<u8>,
    pub coping_ability: Option<u8>,
    pub spiritual_needs: String,
    pub caregiver_burden: String,
}

// ─── Palliative Care Needs (Step 9) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PalliativeCareNeeds {
    pub symptom_burden: Option<u8>,
    pub pain_management_adequacy: Option<u8>,
    pub advance_directive_status: String,
    pub goals_of_care_discussed: String,
    pub hospice_referral_indicated: String,
    pub quality_of_life_score: Option<u8>,
    pub end_of_life_planning: String,
    pub palliative_care_referral: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub tumor_board_reviewed: String,
    pub next_imaging_date: String,
    pub lab_monitoring_plan: String,
    pub follow_up_interval: String,
    pub referrals_needed: String,
    pub clinical_notes: String,
    pub survivorship_plan: String,
    pub patient_education_provided: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub cancer_diagnosis: CancerDiagnosis,
    pub staging_grading: StagingGrading,
    pub treatment_history: TreatmentHistory,
    pub current_treatment: CurrentTreatment,
    pub side_effects_toxicity: SideEffectsToxicity,
    pub performance_status: PerformanceStatus,
    pub psychosocial_assessment: PsychosocialAssessment,
    pub palliative_care_needs: PalliativeCareNeeds,
    pub clinical_review: ClinicalReview,
}

// ─── Grading types ──────────────────────────────────────────

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
    pub oncology_level: OncologyLevel,
    pub oncology_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
