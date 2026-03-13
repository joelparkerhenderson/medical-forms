use serde::{Deserialize, Serialize};

pub type ImpairmentLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub sex: String,
    pub assessment_date: String,
    pub referring_provider: String,
    pub primary_complaint: String,
    pub onset_date: String,
    pub mechanism_of_injury: String,
}

// ─── Movement History (Step 2) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MovementHistory {
    pub activity_level: Option<u8>,
    pub exercise_frequency: String,
    pub sport_participation: String,
    pub occupational_demands: Option<u8>,
    pub previous_injuries: String,
    pub surgical_history: String,
    pub daily_activity_limitation: Option<u8>,
    pub sleep_quality: Option<u8>,
}

// ─── Postural Assessment (Step 3) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PosturalAssessment {
    pub head_alignment: Option<u8>,
    pub shoulder_symmetry: Option<u8>,
    pub spinal_curvature: Option<u8>,
    pub pelvic_tilt: Option<u8>,
    pub knee_alignment: Option<u8>,
    pub foot_arch: Option<u8>,
    pub overall_posture: Option<u8>,
}

// ─── Range of Motion (Step 4) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RangeOfMotion {
    pub cervical_flexion: Option<u8>,
    pub cervical_rotation: Option<u8>,
    pub shoulder_flexion: Option<u8>,
    pub shoulder_abduction: Option<u8>,
    pub lumbar_flexion: Option<u8>,
    pub lumbar_extension: Option<u8>,
    pub hip_flexion: Option<u8>,
    pub knee_flexion: Option<u8>,
}

// ─── Muscle Strength Testing (Step 5) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MuscleStrengthTesting {
    pub upper_extremity_strength: Option<u8>,
    pub lower_extremity_strength: Option<u8>,
    pub core_stability: Option<u8>,
    pub grip_strength: Option<u8>,
    pub bilateral_symmetry: Option<u8>,
    pub muscle_endurance: Option<u8>,
    pub functional_strength: Option<u8>,
}

// ─── Gait Analysis (Step 6) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GaitAnalysis {
    pub stride_symmetry: Option<u8>,
    pub cadence: Option<u8>,
    pub heel_strike_pattern: Option<u8>,
    pub toe_off_pattern: Option<u8>,
    pub arm_swing: Option<u8>,
    pub balance_during_gait: Option<u8>,
    pub assistive_device_used: String,
}

// ─── Functional Testing (Step 7) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FunctionalTesting {
    pub sit_to_stand: Option<u8>,
    pub single_leg_balance: Option<u8>,
    pub squat_quality: Option<u8>,
    pub lunge_quality: Option<u8>,
    pub push_up_quality: Option<u8>,
    pub overhead_reach: Option<u8>,
    pub step_up_quality: Option<u8>,
}

// ─── Pain Assessment (Step 8) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PainAssessment {
    pub pain_severity: Option<u8>,
    pub pain_location: String,
    pub pain_type: String,
    pub pain_with_movement: Option<u8>,
    pub pain_at_rest: Option<u8>,
    pub pain_frequency: String,
    pub aggravating_factors: String,
    pub relieving_factors: String,
}

// ─── Exercise Prescription (Step 9) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ExercisePrescription {
    pub exercise_tolerance: Option<u8>,
    pub cardiovascular_fitness: Option<u8>,
    pub flexibility_level: Option<u8>,
    pub motivation_level: Option<u8>,
    pub home_exercise_compliance: Option<u8>,
    pub equipment_access: String,
    pub exercise_goals: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub overall_functional_status: Option<u8>,
    pub treatment_response: Option<u8>,
    pub prognosis_rating: Option<u8>,
    pub follow_up_needed: String,
    pub referral_recommended: String,
    pub clinician_notes: String,
    pub patient_goals: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub movement_history: MovementHistory,
    pub postural_assessment: PosturalAssessment,
    pub range_of_motion: RangeOfMotion,
    pub muscle_strength_testing: MuscleStrengthTesting,
    pub gait_analysis: GaitAnalysis,
    pub functional_testing: FunctionalTesting,
    pub pain_assessment: PainAssessment,
    pub exercise_prescription: ExercisePrescription,
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
    pub impairment_level: ImpairmentLevel,
    pub impairment_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
