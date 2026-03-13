use serde::{Deserialize, Serialize};

pub type SeverityLevel = String;

// ─── Patient Information (Step 1) ─────────────────────────

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

// ─── Allergy History (Step 2) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AllergyHistory {
    pub age_of_onset: Option<u8>,
    pub family_allergy_history: String,
    pub atopic_history: String,
    pub previous_anaphylaxis: String,
    pub epi_pen_prescribed: String,
    pub number_of_known_allergies: Option<u8>,
}

// ─── Current Allergies (Step 3) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentAllergies {
    pub primary_allergen: String,
    pub allergen_category: String,
    pub reaction_type: String,
    pub severity_rating: Option<u8>,
    pub onset_timing: String,
    pub last_reaction: String,
}

// ─── Symptoms & Reactions (Step 4) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SymptomsReactions {
    pub skin_symptoms: Option<u8>,
    pub respiratory_symptoms: Option<u8>,
    pub gastrointestinal_symptoms: Option<u8>,
    pub cardiovascular_symptoms: Option<u8>,
    pub anaphylaxis_risk: Option<u8>,
    pub symptom_frequency: String,
}

// ─── Environmental Triggers (Step 5) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct EnvironmentalTriggers {
    pub pollen_sensitivity: Option<u8>,
    pub dust_mite_sensitivity: Option<u8>,
    pub pet_dander_sensitivity: Option<u8>,
    pub mold_sensitivity: Option<u8>,
    pub seasonal_pattern: String,
    pub indoor_outdoor_triggers: String,
}

// ─── Food & Drug Allergies (Step 6) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FoodDrugAllergies {
    pub food_allergies: String,
    pub drug_allergies: String,
    pub cross_reactivity: String,
    pub drug_allergy_type: String,
    pub food_allergy_type: String,
    pub allergy_verified: String,
}

// ─── Testing Results (Step 7) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TestingResults {
    pub skin_prick_test_done: String,
    pub skin_prick_test_result: String,
    pub specific_ige_level: Option<f64>,
    pub total_ige_level: Option<f64>,
    pub challenge_test_done: String,
    pub component_resolved_diagnostics: String,
}

// ─── Current Treatment (Step 8) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentTreatment {
    pub antihistamine_use: String,
    pub nasal_corticosteroid: String,
    pub immunotherapy: String,
    pub immunotherapy_duration: String,
    pub epi_pen_carried: String,
    pub other_medications: String,
}

// ─── Emergency Plan (Step 9) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct EmergencyPlan {
    pub has_emergency_plan: String,
    pub plan_review_date: String,
    pub anaphylaxis_action_plan: String,
    pub emergency_contact_name: String,
    pub emergency_contact_phone: String,
    pub school_work_notified: String,
}

// ─── Review & Assessment (Step 10) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ReviewAssessment {
    pub clinician_name: String,
    pub review_date: String,
    pub overall_severity: Option<u8>,
    pub clinical_notes: String,
    pub follow_up_interval: String,
    pub referral_needed: String,
}

// ─── Assessment Data (all sections) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub allergy_history: AllergyHistory,
    pub current_allergies: CurrentAllergies,
    pub symptoms_reactions: SymptomsReactions,
    pub environmental_triggers: EnvironmentalTriggers,
    pub food_drug_allergies: FoodDrugAllergies,
    pub testing_results: TestingResults,
    pub current_treatment: CurrentTreatment,
    pub emergency_plan: EmergencyPlan,
    pub review_assessment: ReviewAssessment,
}

// ─── Grading types ───────────────────────────────────────

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
