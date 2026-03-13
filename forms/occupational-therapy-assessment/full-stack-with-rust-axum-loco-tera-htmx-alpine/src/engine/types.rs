use serde::{Deserialize, Serialize};

pub type FunctionLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub gender: String,
    pub referral_source: String,
    pub referral_date: String,
    pub diagnosis: String,
    pub therapist_name: String,
    pub assessment_date: String,
}

// ─── Occupational Profile (Step 2) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct OccupationalProfile {
    pub living_situation: String,
    pub primary_roles: String,
    pub prior_functional_level: String,
    pub current_concerns: String,
    pub patient_goals: String,
    pub support_system: String,
}

// ─── Daily Living Activities (Step 3) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DailyLivingActivities {
    pub feeding: Option<u8>,
    pub bathing: Option<u8>,
    pub dressing_upper: Option<u8>,
    pub dressing_lower: Option<u8>,
    pub grooming: Option<u8>,
    pub toileting: Option<u8>,
    pub transfers: Option<u8>,
    pub mobility: Option<u8>,
}

// ─── Instrumental Activities (Step 4) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct InstrumentalActivities {
    pub meal_preparation: Option<u8>,
    pub household_management: Option<u8>,
    pub medication_management: Option<u8>,
    pub financial_management: Option<u8>,
    pub community_mobility: Option<u8>,
    pub shopping: Option<u8>,
    pub telephone_use: Option<u8>,
}

// ─── Cognitive & Perceptual (Step 5) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CognitivePerceptual {
    pub orientation: Option<u8>,
    pub attention: Option<u8>,
    pub memory: Option<u8>,
    pub problem_solving: Option<u8>,
    pub safety_awareness: Option<u8>,
    pub visual_perception: Option<u8>,
    pub sequencing: Option<u8>,
}

// ─── Motor & Sensory (Step 6) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MotorSensory {
    pub upper_extremity_strength: Option<u8>,
    pub lower_extremity_strength: Option<u8>,
    pub range_of_motion: Option<u8>,
    pub fine_motor_coordination: Option<u8>,
    pub gross_motor_coordination: Option<u8>,
    pub balance: Option<u8>,
    pub sensation: Option<u8>,
    pub endurance: Option<u8>,
}

// ─── Home Environment (Step 7) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct HomeEnvironment {
    pub home_accessibility: Option<u8>,
    pub bathroom_safety: Option<u8>,
    pub kitchen_safety: Option<u8>,
    pub fall_risk_factors: Option<u8>,
    pub adaptive_equipment_needs: String,
    pub home_modification_needs: String,
}

// ─── Work & Leisure (Step 8) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct WorkLeisure {
    pub employment_status: String,
    pub work_demands: String,
    pub return_to_work_potential: Option<u8>,
    pub leisure_participation: Option<u8>,
    pub social_participation: Option<u8>,
    pub community_integration: Option<u8>,
}

// ─── Goals & Priorities (Step 9) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GoalsPriorities {
    pub short_term_goals: String,
    pub long_term_goals: String,
    pub patient_priorities: String,
    pub caregiver_concerns: String,
    pub barriers_to_participation: String,
    pub motivation_level: Option<u8>,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub pain_level: Option<u8>,
    pub fatigue_level: Option<u8>,
    pub emotional_status: Option<u8>,
    pub skin_integrity: Option<u8>,
    pub precautions: String,
    pub additional_notes: String,
    pub recommended_frequency: String,
    pub recommended_duration: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub occupational_profile: OccupationalProfile,
    pub daily_living_activities: DailyLivingActivities,
    pub instrumental_activities: InstrumentalActivities,
    pub cognitive_perceptual: CognitivePerceptual,
    pub motor_sensory: MotorSensory,
    pub home_environment: HomeEnvironment,
    pub work_leisure: WorkLeisure,
    pub goals_priorities: GoalsPriorities,
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
    pub function_level: FunctionLevel,
    pub function_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
