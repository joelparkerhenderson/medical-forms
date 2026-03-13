use serde::{Deserialize, Serialize};

pub type MobilityLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub assessment_date: String,
    pub referral_source: String,
    pub primary_diagnosis: String,
    pub assessor_name: String,
    pub assessor_role: String,
    pub setting: String,
}

// ─── Mobility History (Step 2) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MobilityHistory {
    pub pre_morbid_mobility: Option<u8>,
    pub current_mobility_level: Option<u8>,
    pub mobility_change_onset: String,
    pub mobility_change_duration: String,
    pub pain_with_movement: Option<u8>,
    pub endurance_level: Option<u8>,
}

// ─── Balance Assessment (Step 3) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BalanceAssessment {
    pub static_sitting_balance: Option<u8>,
    pub dynamic_sitting_balance: Option<u8>,
    pub static_standing_balance: Option<u8>,
    pub dynamic_standing_balance: Option<u8>,
    pub single_leg_stance: Option<u8>,
    pub tandem_stance: Option<u8>,
}

// ─── Gait Analysis (Step 4) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GaitAnalysis {
    pub gait_pattern_quality: Option<u8>,
    pub gait_speed: Option<u8>,
    pub step_length_symmetry: Option<u8>,
    pub turning_ability: Option<u8>,
    pub outdoor_walking: Option<u8>,
    pub walking_endurance: Option<u8>,
}

// ─── Transfers & Bed Mobility (Step 5) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TransfersBedMobility {
    pub bed_mobility: Option<u8>,
    pub sit_to_stand: Option<u8>,
    pub stand_to_sit: Option<u8>,
    pub chair_transfer: Option<u8>,
    pub toilet_transfer: Option<u8>,
    pub car_transfer: Option<u8>,
}

// ─── Stairs & Obstacles (Step 6) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct StairsObstacles {
    pub stair_ascent: Option<u8>,
    pub stair_descent: Option<u8>,
    pub curb_negotiation: Option<u8>,
    pub uneven_surfaces: Option<u8>,
    pub obstacle_avoidance: Option<u8>,
    pub ramp_navigation: Option<u8>,
}

// ─── Upper Limb Function (Step 7) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct UpperLimbFunction {
    pub reaching_overhead: Option<u8>,
    pub grip_strength: Option<u8>,
    pub fine_motor_control: Option<u8>,
    pub bilateral_coordination: Option<u8>,
    pub upper_limb_weight_bearing: Option<u8>,
    pub functional_reach: Option<u8>,
}

// ─── Assistive Devices (Step 8) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssistiveDevices {
    pub current_device_type: String,
    pub device_appropriateness: Option<u8>,
    pub device_usage_competence: Option<u8>,
    pub device_condition: Option<u8>,
    pub home_equipment_needs: String,
    pub wheelchair_skills: Option<u8>,
}

// ─── Falls Risk Assessment (Step 9) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FallsRiskAssessment {
    pub falls_in_past_year: String,
    pub fear_of_falling: Option<u8>,
    pub medication_fall_risk: Option<u8>,
    pub postural_hypotension: Option<u8>,
    pub vision_impairment: Option<u8>,
    pub cognitive_impact_on_mobility: Option<u8>,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub overall_mobility_rating: Option<u8>,
    pub rehabilitation_potential: Option<u8>,
    pub patient_goals: String,
    pub recommended_interventions: String,
    pub follow_up_plan: String,
    pub additional_notes: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub mobility_history: MobilityHistory,
    pub balance_assessment: BalanceAssessment,
    pub gait_analysis: GaitAnalysis,
    pub transfers_bed_mobility: TransfersBedMobility,
    pub stairs_obstacles: StairsObstacles,
    pub upper_limb_function: UpperLimbFunction,
    pub assistive_devices: AssistiveDevices,
    pub falls_risk_assessment: FallsRiskAssessment,
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
    pub mobility_level: MobilityLevel,
    pub mobility_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
