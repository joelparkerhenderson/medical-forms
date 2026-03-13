use serde::{Deserialize, Serialize};

pub type ImpairmentLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub patient_age: String,
    pub patient_sex: String,
    pub education_level: String,
    pub primary_language: String,
    pub handedness: String,
    pub assessment_date: String,
}

// ─── Cognitive History (Step 2) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CognitiveHistory {
    pub reason_for_referral: String,
    pub onset_of_symptoms: String,
    pub symptom_duration: String,
    pub rate_of_decline: String,
    pub family_history_dementia: String,
    pub previous_cognitive_testing: String,
    pub relevant_medical_conditions: String,
    pub current_medications: String,
}

// ─── Orientation (Step 3) ───────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Orientation {
    pub orientation_year: Option<u8>,
    pub orientation_season: Option<u8>,
    pub orientation_date: Option<u8>,
    pub orientation_day: Option<u8>,
    pub orientation_month: Option<u8>,
    pub orientation_country: Option<u8>,
    pub orientation_county: Option<u8>,
    pub orientation_city: Option<u8>,
    pub orientation_building: Option<u8>,
    pub orientation_floor: Option<u8>,
}

// ─── Registration & Attention (Step 4) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RegistrationAttention {
    pub registration_word1: Option<u8>,
    pub registration_word2: Option<u8>,
    pub registration_word3: Option<u8>,
    pub serial_sevens_1: Option<u8>,
    pub serial_sevens_2: Option<u8>,
    pub serial_sevens_3: Option<u8>,
    pub serial_sevens_4: Option<u8>,
    pub serial_sevens_5: Option<u8>,
}

// ─── Recall (Step 5) ───────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Recall {
    pub recall_word1: Option<u8>,
    pub recall_word2: Option<u8>,
    pub recall_word3: Option<u8>,
    pub recall_strategy: String,
    pub recall_delay_minutes: String,
}

// ─── Language (Step 6) ──────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Language {
    pub naming_pencil: Option<u8>,
    pub naming_watch: Option<u8>,
    pub repetition: Option<u8>,
    pub three_stage_command: Option<u8>,
    pub reading_command: Option<u8>,
    pub writing_sentence: Option<u8>,
}

// ─── Visuospatial (Step 7) ──────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Visuospatial {
    pub copy_pentagons: Option<u8>,
    pub clock_drawing_contour: Option<u8>,
    pub clock_drawing_numbers: Option<u8>,
    pub clock_drawing_hands: Option<u8>,
    pub cube_copy: Option<u8>,
    pub trail_making: Option<u8>,
}

// ─── Executive Function (Step 8) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ExecutiveFunction {
    pub verbal_fluency_score: Option<u8>,
    pub abstraction_1: Option<u8>,
    pub abstraction_2: Option<u8>,
    pub digit_span_forward: Option<u8>,
    pub digit_span_backward: Option<u8>,
    pub inhibition_task: Option<u8>,
}

// ─── Functional Assessment (Step 9) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FunctionalAssessment {
    pub medication_management: Option<u8>,
    pub financial_management: Option<u8>,
    pub meal_preparation: Option<u8>,
    pub transport_ability: Option<u8>,
    pub housekeeping: Option<u8>,
    pub personal_hygiene: Option<u8>,
    pub safety_awareness: Option<u8>,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub assessor_name: String,
    pub assessor_role: String,
    pub assessment_environment: String,
    pub patient_cooperation: String,
    pub sensory_impairments: String,
    pub clinical_impression: String,
    pub recommended_follow_up: String,
    pub additional_notes: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub cognitive_history: CognitiveHistory,
    pub orientation: Orientation,
    pub registration_attention: RegistrationAttention,
    pub recall: Recall,
    pub language: Language,
    pub visuospatial: Visuospatial,
    pub executive_function: ExecutiveFunction,
    pub functional_assessment: FunctionalAssessment,
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
    pub mmse_score: u8,
    pub moca_score: u8,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
