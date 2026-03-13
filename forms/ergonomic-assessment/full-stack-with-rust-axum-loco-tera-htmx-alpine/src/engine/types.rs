use serde::{Deserialize, Serialize};

pub type RiskLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub assessment_date: String,
    pub assessor_name: String,
    pub referral_reason: String,
}

// ─── Occupation Details (Step 2) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct OccupationDetails {
    pub job_title: String,
    pub department: String,
    pub employer: String,
    pub hours_per_week: String,
    pub shift_pattern: String,
    pub years_in_role: String,
    pub job_description: String,
}

// ─── Workstation Assessment (Step 3) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct WorkstationAssessment {
    pub desk_height_appropriate: Option<u8>,
    pub chair_adjustability: Option<u8>,
    pub monitor_position: Option<u8>,
    pub keyboard_mouse_placement: Option<u8>,
    pub legroom_adequate: Option<u8>,
    pub desk_surface_area: Option<u8>,
    pub workstation_notes: String,
}

// ─── Posture Assessment (Step 4) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PostureAssessment {
    pub neck_posture: Option<u8>,
    pub shoulder_posture: Option<u8>,
    pub upper_back_posture: Option<u8>,
    pub lower_back_posture: Option<u8>,
    pub wrist_posture: Option<u8>,
    pub leg_posture: Option<u8>,
    pub rula_score: Option<u8>,
    pub reba_score: Option<u8>,
}

// ─── Musculoskeletal Symptoms (Step 5) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MusculoskeletalSymptoms {
    pub neck_pain: Option<u8>,
    pub shoulder_pain: Option<u8>,
    pub upper_back_pain: Option<u8>,
    pub lower_back_pain: Option<u8>,
    pub wrist_hand_pain: Option<u8>,
    pub elbow_pain: Option<u8>,
    pub hip_pain: Option<u8>,
    pub knee_pain: Option<u8>,
    pub symptom_duration: String,
    pub symptom_frequency: String,
    pub pain_body_map_notes: String,
}

// ─── Manual Handling (Step 6) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ManualHandling {
    pub lifting_required: String,
    pub max_lift_weight_kg: String,
    pub lifting_frequency: String,
    pub carrying_distance: String,
    pub pushing_pulling: String,
    pub team_lifting_available: String,
    pub manual_handling_training: String,
    pub mechanical_aids_available: String,
}

// ─── DSE Assessment (Step 7) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DseAssessment {
    pub screen_flicker_free: String,
    pub screen_brightness_adjustable: String,
    pub screen_glare_free: String,
    pub keyboard_separate: String,
    pub keyboard_tiltable: String,
    pub mouse_comfortable: String,
    pub software_suitable: String,
    pub continuous_dse_hours: String,
    pub eye_test_offered: String,
    pub dse_training_completed: String,
}

// ─── Break Patterns (Step 8) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BreakPatterns {
    pub break_frequency: String,
    pub break_duration_minutes: String,
    pub micro_breaks_taken: String,
    pub stretching_exercises: String,
    pub task_variety: Option<u8>,
    pub autonomy_over_breaks: Option<u8>,
}

// ─── Environmental Factors (Step 9) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct EnvironmentalFactors {
    pub lighting_adequate: Option<u8>,
    pub temperature_comfortable: Option<u8>,
    pub noise_level_acceptable: Option<u8>,
    pub ventilation_adequate: Option<u8>,
    pub space_sufficient: Option<u8>,
    pub floor_surface_safe: Option<u8>,
    pub environmental_notes: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub previous_msd_history: String,
    pub current_treatment: String,
    pub medication_for_pain: String,
    pub occupational_health_referral: String,
    pub recommended_adjustments: String,
    pub follow_up_required: String,
    pub clinician_comments: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub occupation_details: OccupationDetails,
    pub workstation_assessment: WorkstationAssessment,
    pub posture_assessment: PostureAssessment,
    pub musculoskeletal_symptoms: MusculoskeletalSymptoms,
    pub manual_handling: ManualHandling,
    pub dse_assessment: DseAssessment,
    pub break_patterns: BreakPatterns,
    pub environmental_factors: EnvironmentalFactors,
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
    pub risk_level: RiskLevel,
    pub risk_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
