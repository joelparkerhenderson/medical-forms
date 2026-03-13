use serde::{Deserialize, Serialize};

pub type SeverityLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub patient_age: String,
    pub patient_sex: String,
    pub referral_source: String,
    pub assessment_date: String,
    pub clinician_name: String,
    pub clinic_location: String,
}

// ─── Injury/Condition History (Step 2) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct InjuryHistory {
    pub primary_complaint: String,
    pub onset_type: String,
    pub onset_date: String,
    pub mechanism_of_injury: String,
    pub previous_treatment: String,
    pub previous_surgeries: String,
    pub comorbidities: String,
    pub medication_list: String,
}

// ─── Pain Assessment (Step 3) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PainAssessment {
    pub pain_severity: Option<u8>,
    pub pain_at_rest: Option<u8>,
    pub pain_with_activity: Option<u8>,
    pub night_pain: Option<u8>,
    pub pain_location: String,
    pub pain_character: String,
    pub pain_radiating: String,
    pub pain_duration_weeks: String,
}

// ─── Joint Examination (Step 4) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct JointExamination {
    pub affected_joint: String,
    pub range_of_motion: Option<u8>,
    pub joint_stability: Option<u8>,
    pub joint_swelling: Option<u8>,
    pub joint_crepitus: String,
    pub joint_deformity: String,
    pub ligament_integrity: Option<u8>,
    pub special_tests_result: String,
}

// ─── Muscle Assessment (Step 5) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MuscleAssessment {
    pub muscle_strength: Option<u8>,
    pub muscle_atrophy: Option<u8>,
    pub muscle_tone: Option<u8>,
    pub grip_strength: Option<u8>,
    pub muscle_tenderness: Option<u8>,
    pub reflexes_normal: String,
    pub sensation_intact: String,
}

// ─── Spinal Assessment (Step 6) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SpinalAssessment {
    pub spinal_alignment: Option<u8>,
    pub spinal_mobility: Option<u8>,
    pub disc_involvement: String,
    pub nerve_root_signs: String,
    pub straight_leg_raise: Option<u8>,
    pub neurological_deficit: String,
    pub spinal_tenderness: Option<u8>,
}

// ─── Imaging & Investigations (Step 7) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ImagingInvestigations {
    pub xray_findings: String,
    pub mri_findings: String,
    pub ct_findings: String,
    pub bone_density_result: String,
    pub blood_tests_result: String,
    pub imaging_urgency: Option<u8>,
    pub further_imaging_needed: String,
}

// ─── Functional Status (Step 8) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FunctionalStatus {
    pub mobility_level: Option<u8>,
    pub daily_activities: Option<u8>,
    pub work_capacity: Option<u8>,
    pub sleep_quality: Option<u8>,
    pub walking_distance: String,
    pub assistive_devices: String,
    pub fall_risk: Option<u8>,
}

// ─── Surgical Considerations (Step 9) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SurgicalConsiderations {
    pub surgical_candidate: String,
    pub surgical_urgency: Option<u8>,
    pub anaesthetic_risk: Option<u8>,
    pub conservative_options_exhausted: String,
    pub patient_consent_discussion: String,
    pub expected_outcome: Option<u8>,
    pub rehabilitation_plan: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub overall_severity: Option<u8>,
    pub treatment_recommendation: String,
    pub follow_up_interval: String,
    pub referral_needed: String,
    pub patient_understanding: Option<u8>,
    pub clinical_notes: String,
    pub red_flag_symptoms: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub injury_history: InjuryHistory,
    pub pain_assessment: PainAssessment,
    pub joint_examination: JointExamination,
    pub muscle_assessment: MuscleAssessment,
    pub spinal_assessment: SpinalAssessment,
    pub imaging_investigations: ImagingInvestigations,
    pub functional_status: FunctionalStatus,
    pub surgical_considerations: SurgicalConsiderations,
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
    pub severity_level: SeverityLevel,
    pub severity_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
