use serde::{Deserialize, Serialize};

pub type RespiratoryLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub patient_sex: String,
    pub patient_age: String,
    pub smoking_status: String,
    pub pack_years: String,
    pub occupational_exposure: String,
    pub referral_source: String,
}

// ─── Respiratory Symptoms (Step 2) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RespiratorySymptoms {
    pub dyspnoea_severity: Option<u8>,
    pub wheeze_frequency: Option<u8>,
    pub chest_tightness: Option<u8>,
    pub exercise_tolerance: Option<u8>,
    pub nocturnal_symptoms: Option<u8>,
    pub symptom_duration: String,
}

// ─── Cough Assessment (Step 3) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CoughAssessment {
    pub cough_severity: Option<u8>,
    pub cough_frequency: Option<u8>,
    pub sputum_production: Option<u8>,
    pub haemoptysis: Option<u8>,
    pub cough_duration: String,
    pub cough_character: String,
}

// ─── Dyspnoea Assessment (Step 4) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DyspnoeaAssessment {
    pub mrc_dyspnoea_scale: Option<u8>,
    pub dyspnoea_at_rest: Option<u8>,
    pub dyspnoea_on_exertion: Option<u8>,
    pub orthopnoea: Option<u8>,
    pub paroxysmal_nocturnal_dyspnoea: Option<u8>,
    pub dyspnoea_trend: String,
}

// ─── Chest Examination (Step 5) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ChestExamination {
    pub breath_sounds: Option<u8>,
    pub chest_expansion: Option<u8>,
    pub percussion_note: Option<u8>,
    pub vocal_resonance: Option<u8>,
    pub accessory_muscle_use: Option<u8>,
    pub chest_deformity: String,
}

// ─── Spirometry Results (Step 6) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SpirometryResults {
    pub fev1_percent_predicted: Option<u8>,
    pub fvc_percent_predicted: Option<u8>,
    pub fev1_fvc_ratio: Option<u8>,
    pub peak_flow_percent_predicted: Option<u8>,
    pub bronchodilator_response: Option<u8>,
    pub spirometry_quality: String,
}

// ─── Oxygen Assessment (Step 7) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct OxygenAssessment {
    pub resting_spo2: Option<u8>,
    pub exertional_spo2: Option<u8>,
    pub oxygen_requirement: Option<u8>,
    pub arterial_blood_gas: Option<u8>,
    pub supplemental_oxygen_use: String,
    pub oxygen_delivery_method: String,
}

// ─── Respiratory Infections (Step 8) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RespiratoryInfections {
    pub exacerbation_frequency: Option<u8>,
    pub antibiotic_courses: Option<u8>,
    pub hospitalisation_frequency: Option<u8>,
    pub vaccination_status: Option<u8>,
    pub last_exacerbation: String,
    pub sputum_culture: String,
}

// ─── Inhaler & Medications (Step 9) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct InhalerMedications {
    pub inhaler_technique: Option<u8>,
    pub medication_adherence: Option<u8>,
    pub inhaler_device_suitability: Option<u8>,
    pub side_effects_severity: Option<u8>,
    pub current_inhalers: String,
    pub oral_medications: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub overall_respiratory_status: Option<u8>,
    pub quality_of_life_impact: Option<u8>,
    pub treatment_response: Option<u8>,
    pub follow_up_urgency: Option<u8>,
    pub clinical_notes: String,
    pub action_plan_provided: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub respiratory_symptoms: RespiratorySymptoms,
    pub cough_assessment: CoughAssessment,
    pub dyspnoea_assessment: DyspnoeaAssessment,
    pub chest_examination: ChestExamination,
    pub spirometry_results: SpirometryResults,
    pub oxygen_assessment: OxygenAssessment,
    pub respiratory_infections: RespiratoryInfections,
    pub inhaler_medications: InhalerMedications,
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
    pub respiratory_level: RespiratoryLevel,
    pub respiratory_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
