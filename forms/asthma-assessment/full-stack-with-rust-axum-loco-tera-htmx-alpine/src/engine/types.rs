use serde::{Deserialize, Serialize};

pub type ControlLevel = String;

// ─── Patient Information (Step 1) ──────────────────────────

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

// ─── Asthma History (Step 2) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AsthmaHistory {
    pub age_at_diagnosis: Option<u8>,
    pub years_with_asthma: Option<u8>,
    pub family_asthma_history: String,
    pub allergy_history: String,
    pub previous_hospitalisations: Option<u8>,
    pub previous_icu_admissions: Option<u8>,
    pub best_peak_flow: Option<f64>,
}

// ─── Symptom Assessment (Step 3) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SymptomAssessment {
    pub daytime_symptoms: Option<u8>,
    pub night_waking: Option<u8>,
    pub reliever_use: Option<u8>,
    pub activity_limitation: Option<u8>,
    pub symptom_free_days: Option<u8>,
    pub cough_severity: Option<u8>,
    pub wheeze_severity: Option<u8>,
    pub breathlessness: Option<u8>,
}

// ─── Lung Function (Step 4) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct LungFunction {
    pub current_peak_flow: Option<f64>,
    pub predicted_peak_flow: Option<f64>,
    pub peak_flow_variability: Option<f64>,
    pub fev1: Option<f64>,
    pub fev1_predicted: Option<f64>,
    pub fev1_fvc_ratio: Option<f64>,
    pub reversibility_test: String,
}

// ─── Triggers & Exacerbations (Step 5) ─────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TriggersExacerbations {
    pub exercise_trigger: String,
    pub cold_air_trigger: String,
    pub allergen_trigger: String,
    pub infection_trigger: String,
    pub emotional_trigger: String,
    pub exacerbations_last12_months: Option<u8>,
    pub oral_steroid_courses: Option<u8>,
    pub emergency_visits: Option<u8>,
}

// ─── Current Medications (Step 6) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentMedications {
    pub saba_use: String,
    pub ics_dose: String,
    pub ics_name: String,
    pub laba_use: String,
    pub ltra_use: String,
    pub biologic_therapy: String,
    pub preventer_adherence: Option<u8>,
    pub gina_step: String,
}

// ─── Inhaler Technique (Step 7) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct InhalerTechnique {
    pub inhaler_type: String,
    pub technique_assessed: String,
    pub technique_score: Option<u8>,
    pub spacer_used: String,
    pub common_errors: String,
    pub education_provided: String,
}

// ─── Comorbidities (Step 8) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Comorbidities {
    pub rhinitis: String,
    pub sinusitis: String,
    pub gerd: String,
    pub obesity: String,
    pub obstructive_sleep_apnoea: String,
    pub anxiety_depression: String,
    pub allergy_coexistence: String,
}

// ─── Lifestyle & Environment (Step 9) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct LifestyleEnvironment {
    pub smoking_status: String,
    pub second_hand_smoke: String,
    pub occupation: String,
    pub occupational_exposure: String,
    pub pet_exposure: String,
    pub home_environment: String,
    pub exercise_frequency: String,
}

// ─── Review & Management Plan (Step 10) ────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ReviewManagementPlan {
    pub clinician_name: String,
    pub review_date: String,
    pub control_level: String,
    pub gina_step_recommended: String,
    pub action_plan_provided: String,
    pub clinical_notes: String,
    pub next_review_date: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub asthma_history: AsthmaHistory,
    pub symptom_assessment: SymptomAssessment,
    pub lung_function: LungFunction,
    pub triggers_exacerbations: TriggersExacerbations,
    pub current_medications: CurrentMedications,
    pub inhaler_technique: InhalerTechnique,
    pub comorbidities: Comorbidities,
    pub lifestyle_environment: LifestyleEnvironment,
    pub review_management_plan: ReviewManagementPlan,
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
    pub control_level: ControlLevel,
    pub gina_criteria_met: u8,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
