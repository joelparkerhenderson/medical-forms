use serde::{Deserialize, Serialize};

pub type ActivityLevel = String;

// ─── Patient Information (Step 1) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub patient_sex: String,
    pub referral_source: String,
    pub diagnosis: String,
    pub disease_duration_years: String,
    pub assessment_date: String,
    pub rheumatologist_name: String,
}

// ─── Joint Assessment (Step 2) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct JointAssessment {
    pub swollen_joint_count: Option<u8>,
    pub tender_joint_count: Option<u8>,
    pub joint_deformity_present: String,
    pub joint_erosion_present: String,
    pub affected_joint_regions: String,
    pub joint_range_of_motion: Option<u8>,
}

// ─── Morning Stiffness (Step 3) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MorningStiffness {
    pub stiffness_duration_minutes: Option<u16>,
    pub stiffness_severity: Option<u8>,
    pub stiffness_frequency: String,
    pub stiffness_impact_on_function: Option<u8>,
    pub stiffness_improvement_with_activity: String,
}

// ─── Disease Activity (Step 4) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DiseaseActivity {
    pub patient_global_assessment: Option<u8>,
    pub physician_global_assessment: Option<u8>,
    pub pain_vas_score: Option<u8>,
    pub fatigue_severity: Option<u8>,
    pub flare_frequency: String,
    pub das28_score: Option<f64>,
}

// ─── Laboratory Markers (Step 5) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct LaboratoryMarkers {
    pub esr_value: Option<f64>,
    pub crp_value: Option<f64>,
    pub rheumatoid_factor_positive: String,
    pub anti_ccp_positive: String,
    pub ana_positive: String,
    pub hemoglobin_value: Option<f64>,
}

// ─── Imaging Findings (Step 6) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ImagingFindings {
    pub xray_erosions_present: String,
    pub xray_joint_space_narrowing: String,
    pub ultrasound_synovitis_present: String,
    pub mri_bone_edema_present: String,
    pub imaging_progression_since_last: String,
    pub overall_radiographic_stage: String,
}

// ─── Functional Status (Step 7) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FunctionalStatus {
    pub haq_score: Option<f64>,
    pub grip_strength: Option<u8>,
    pub walking_ability: Option<u8>,
    pub self_care_ability: Option<u8>,
    pub work_disability: String,
    pub assistive_devices_needed: String,
}

// ─── Medication History (Step 8) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MedicationHistory {
    pub current_dmard_therapy: String,
    pub biologic_therapy: String,
    pub corticosteroid_use: String,
    pub nsaid_use: String,
    pub medication_adherence: Option<u8>,
    pub adverse_effects_reported: String,
}

// ─── Comorbidities (Step 9) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Comorbidities {
    pub cardiovascular_disease: String,
    pub osteoporosis: String,
    pub interstitial_lung_disease: String,
    pub infection_history: String,
    pub mental_health_concerns: String,
    pub other_comorbidities: String,
}

// ─── Clinical Review (Step 10) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub treatment_response: Option<u8>,
    pub treatment_goal_met: String,
    pub referral_needed: String,
    pub patient_education_provided: String,
    pub follow_up_interval: String,
    pub clinician_notes: String,
}

// ─── Assessment Data (all sections) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub joint_assessment: JointAssessment,
    pub morning_stiffness: MorningStiffness,
    pub disease_activity: DiseaseActivity,
    pub laboratory_markers: LaboratoryMarkers,
    pub imaging_findings: ImagingFindings,
    pub functional_status: FunctionalStatus,
    pub medication_history: MedicationHistory,
    pub comorbidities: Comorbidities,
    pub clinical_review: ClinicalReview,
}

// ─── Grading types ─────────────────────────────────────────

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
    pub activity_level: ActivityLevel,
    pub activity_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
