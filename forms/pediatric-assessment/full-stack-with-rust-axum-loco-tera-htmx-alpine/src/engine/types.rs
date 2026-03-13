use serde::{Deserialize, Serialize};

pub type ConcernLevel = String;

// ─── Patient & Parent Information (Step 1) ──────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientParentInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub age_months: String,
    pub sex: String,
    pub parent_guardian_name: String,
    pub relationship: String,
    pub phone_number: String,
    pub pediatrician_name: String,
}

// ─── Birth & Neonatal History (Step 2) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BirthNeonatalHistory {
    pub gestational_age_weeks: Option<u8>,
    pub birth_weight_grams: Option<u16>,
    pub delivery_type: String,
    pub birth_complications: String,
    pub nicu_admission: String,
    pub nicu_duration_days: String,
    pub apgar_score_1min: Option<u8>,
    pub apgar_score_5min: Option<u8>,
}

// ─── Growth & Development (Step 3) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GrowthDevelopment {
    pub weight_percentile: Option<u8>,
    pub height_percentile: Option<u8>,
    pub head_circumference_percentile: Option<u8>,
    pub growth_trend: String,
    pub weight_for_length: Option<u8>,
    pub bmi_percentile: Option<u8>,
}

// ─── Immunization Status (Step 4) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ImmunizationStatus {
    pub immunizations_up_to_date: String,
    pub missing_vaccines: String,
    pub vaccine_refusal: String,
    pub vaccine_refusal_reason: String,
    pub last_flu_vaccine: String,
    pub adverse_reactions: String,
}

// ─── Feeding & Nutrition (Step 5) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FeedingNutrition {
    pub feeding_type: String,
    pub feeding_difficulty: String,
    pub diet_variety: Option<u8>,
    pub daily_milk_intake: String,
    pub vitamin_supplementation: String,
    pub food_allergies: String,
    pub appetite_concern: Option<u8>,
}

// ─── Developmental Milestones (Step 6) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DevelopmentalMilestones {
    pub gross_motor: Option<u8>,
    pub fine_motor: Option<u8>,
    pub language_expressive: Option<u8>,
    pub language_receptive: Option<u8>,
    pub social_emotional: Option<u8>,
    pub cognitive: Option<u8>,
    pub self_care: Option<u8>,
}

// ─── Behavioral Assessment (Step 7) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BehavioralAssessment {
    pub sleep_quality: Option<u8>,
    pub sleep_hours: String,
    pub tantrums_frequency: Option<u8>,
    pub screen_time_hours: String,
    pub social_interaction: Option<u8>,
    pub attention_span: Option<u8>,
    pub anxiety_level: Option<u8>,
}

// ─── Family & Social History (Step 8) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FamilySocialHistory {
    pub family_chronic_conditions: String,
    pub family_mental_health: String,
    pub household_size: String,
    pub daycare_school: String,
    pub secondhand_smoke: String,
    pub home_safety: Option<u8>,
    pub parental_stress: Option<u8>,
}

// ─── Systems Review (Step 9) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SystemsReview {
    pub respiratory_concerns: Option<u8>,
    pub gastrointestinal_concerns: Option<u8>,
    pub skin_concerns: Option<u8>,
    pub musculoskeletal_concerns: Option<u8>,
    pub neurological_concerns: Option<u8>,
    pub ent_concerns: Option<u8>,
    pub urinary_concerns: Option<u8>,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub overall_health_impression: Option<u8>,
    pub current_medications: String,
    pub known_allergies: String,
    pub recent_hospitalizations: String,
    pub specialist_referrals_needed: String,
    pub follow_up_interval: String,
    pub additional_notes: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_parent_information: PatientParentInformation,
    pub birth_neonatal_history: BirthNeonatalHistory,
    pub growth_development: GrowthDevelopment,
    pub immunization_status: ImmunizationStatus,
    pub feeding_nutrition: FeedingNutrition,
    pub developmental_milestones: DevelopmentalMilestones,
    pub behavioral_assessment: BehavioralAssessment,
    pub family_social_history: FamilySocialHistory,
    pub systems_review: SystemsReview,
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
    pub concern_level: ConcernLevel,
    pub concern_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
