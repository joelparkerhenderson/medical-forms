use serde::{Deserialize, Serialize};

pub type SeverityLevel = String;

// ─── Patient Information (Step 1) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub full_name: String,
    pub date_of_birth: String,
    pub nhs_number: String,
    pub address: String,
    pub telephone: String,
    pub email: String,
    pub gp_name: String,
    pub gp_practice: String,
}

// ─── Presenting Concerns (Step 2) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PresentingConcerns {
    pub primary_concern: String,
    pub duration_of_symptoms: String,
    pub onset_type: String,
    pub precipitating_factors: String,
    pub current_mood_rating: Option<u8>,
    pub sleep_quality: Option<u8>,
    pub appetite_change: String,
}

// ─── Depression Screening PHQ-9 (Step 3) ─────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DepressionScreening {
    pub phq1_interest: Option<u8>,
    pub phq2_mood: Option<u8>,
    pub phq3_sleep: Option<u8>,
    pub phq4_fatigue: Option<u8>,
    pub phq5_appetite: Option<u8>,
    pub phq6_self_esteem: Option<u8>,
    pub phq7_concentration: Option<u8>,
    pub phq8_psychomotor: Option<u8>,
    pub phq9_self_harm: Option<u8>,
}

// ─── Anxiety Screening GAD-7 (Step 4) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AnxietyScreening {
    pub gad1_nervous: Option<u8>,
    pub gad2_uncontrollable: Option<u8>,
    pub gad3_excessive_worry: Option<u8>,
    pub gad4_trouble_relaxing: Option<u8>,
    pub gad5_restless: Option<u8>,
    pub gad6_irritable: Option<u8>,
    pub gad7_afraid: Option<u8>,
}

// ─── Risk Assessment (Step 5) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RiskAssessment {
    pub suicidal_ideation: String,
    pub self_harm_history: String,
    pub self_harm_recent: String,
    pub suicide_plan_or_means: String,
    pub protective_factors: String,
    pub risk_level: String,
    pub safeguarding_concerns: String,
}

// ─── Substance Use (Step 6) ──────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SubstanceUse {
    pub alcohol_use: String,
    pub alcohol_units_per_week: Option<f64>,
    pub audit_score: Option<u8>,
    pub cannabis_use: String,
    pub other_substances: String,
    pub prescription_misuse: String,
    pub substance_impact: Option<u8>,
}

// ─── Social & Functional Status (Step 7) ─────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SocialFunctionalStatus {
    pub employment_status: String,
    pub housing_status: String,
    pub social_support: Option<u8>,
    pub relationship_status: String,
    pub financial_concerns: String,
    pub daily_functioning: Option<u8>,
    pub work_impact: Option<u8>,
    pub social_impact: Option<u8>,
}

// ─── Mental Health History (Step 8) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MentalHealthHistory {
    pub previous_diagnoses: String,
    pub previous_treatment: String,
    pub hospitalisations: Option<u8>,
    pub family_mental_health: String,
    pub trauma_history: String,
    pub childhood_adversity: String,
    pub current_diagnosis: String,
}

// ─── Current Treatment (Step 9) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentTreatment {
    pub current_medication: String,
    pub medication_adherence: Option<u8>,
    pub therapy_type: String,
    pub therapy_frequency: String,
    pub therapy_duration: String,
    pub side_effects: String,
    pub treatment_response: Option<u8>,
}

// ─── Clinical Review (Step 10) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub clinician_name: String,
    pub review_date: String,
    pub clinical_impression: String,
    pub phq9_total: Option<u8>,
    pub gad7_total: Option<u8>,
    pub clinical_notes: String,
    pub follow_up_plan: String,
    pub referral_needed: String,
}

// ─── Assessment Data (all sections) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub presenting_concerns: PresentingConcerns,
    pub depression_screening: DepressionScreening,
    pub anxiety_screening: AnxietyScreening,
    pub risk_assessment: RiskAssessment,
    pub substance_use: SubstanceUse,
    pub social_functional_status: SocialFunctionalStatus,
    pub mental_health_history: MentalHealthHistory,
    pub current_treatment: CurrentTreatment,
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
    pub severity_level: SeverityLevel,
    pub severity_score: f64,
    pub phq9_total: u8,
    pub gad7_total: u8,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
