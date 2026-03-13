use serde::{Deserialize, Serialize};

pub type SeverityLevel = String;

// ─── Patient Information (Step 1) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub patient_sex: String,
    pub patient_age: String,
    pub referring_physician: String,
    pub referral_date: String,
    pub primary_diagnosis: String,
    pub visit_type: String,
}

// ─── GI History (Step 2) ───────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GiHistory {
    pub previous_gi_conditions: String,
    pub family_cancer_history: String,
    pub family_cancer_details: String,
    pub family_ibd_history: String,
    pub previous_endoscopy: String,
    pub previous_endoscopy_date: String,
    pub previous_endoscopy_findings: String,
    pub surgical_history: String,
}

// ─── Upper GI Symptoms (Step 3) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct UpperGiSymptoms {
    pub heartburn_frequency: Option<u8>,
    pub heartburn_severity: Option<u8>,
    pub dysphagia_grade: Option<u8>,
    pub odynophagia: String,
    pub nausea_frequency: Option<u8>,
    pub vomiting_frequency: Option<u8>,
    pub early_satiety: Option<u8>,
    pub epigastric_pain: Option<u8>,
}

// ─── Lower GI Symptoms (Step 4) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct LowerGiSymptoms {
    pub bowel_habit_change: String,
    pub stool_frequency: String,
    pub stool_consistency: String,
    pub rectal_bleeding: String,
    pub rectal_bleeding_frequency: Option<u8>,
    pub abdominal_pain_severity: Option<u8>,
    pub bloating_severity: Option<u8>,
    pub tenesmus: String,
    pub nocturnal_symptoms: String,
}

// ─── Alarm Features (Step 5) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AlarmFeatures {
    pub unintentional_weight_loss: String,
    pub weight_loss_percentage: Option<f64>,
    pub weight_loss_duration: String,
    pub dysphagia_present: String,
    pub gi_bleeding: String,
    pub gi_bleeding_type: String,
    pub iron_deficiency_anaemia: String,
    pub palpable_mass: String,
    pub jaundice: String,
    pub fever_unexplained: String,
    pub age_over_50_new_symptoms: String,
}

// ─── Nutritional Assessment (Step 6) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct NutritionalAssessment {
    pub current_weight_kg: Option<f64>,
    pub height_cm: Option<f64>,
    pub bmi: Option<f64>,
    pub albumin_g_l: Option<f64>,
    pub appetite_change: String,
    pub dietary_restrictions: String,
    pub nutritional_supplements: String,
    pub must_screening_score: Option<u8>,
}

// ─── Liver Assessment (Step 7) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct LiverAssessment {
    pub alt_u_l: Option<f64>,
    pub ast_u_l: Option<f64>,
    pub alp_u_l: Option<f64>,
    pub bilirubin_umol_l: Option<f64>,
    pub ggt_u_l: Option<f64>,
    pub alcohol_units_per_week: Option<u8>,
    pub liver_symptoms: String,
    pub ascites: String,
    pub hepatomegaly: String,
}

// ─── Investigations (Step 8) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Investigations {
    pub h_pylori_test: String,
    pub h_pylori_result: String,
    pub coeliac_screen: String,
    pub coeliac_result: String,
    pub faecal_calprotectin: String,
    pub faecal_calprotectin_result: String,
    pub imaging_performed: String,
    pub imaging_findings: String,
    pub endoscopy_needed: String,
    pub endoscopy_urgency: String,
}

// ─── Current Treatment (Step 9) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentTreatment {
    pub ppi_use: String,
    pub ppi_duration: String,
    pub antacid_use: String,
    pub laxative_use: String,
    pub antidiarrhoeal_use: String,
    pub immunosuppressant_use: String,
    pub biologic_therapy: String,
    pub nsaid_use: String,
    pub anticoagulant_use: String,
    pub other_medications: String,
}

// ─── Clinical Review (Step 10) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub ibd_activity_index: Option<u8>,
    pub symptom_duration_weeks: String,
    pub quality_of_life_impact: Option<u8>,
    pub work_days_missed: String,
    pub mental_health_impact: String,
    pub smoking_status: String,
    pub clinician_notes: String,
    pub follow_up_plan: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub gi_history: GiHistory,
    pub upper_gi_symptoms: UpperGiSymptoms,
    pub lower_gi_symptoms: LowerGiSymptoms,
    pub alarm_features: AlarmFeatures,
    pub nutritional_assessment: NutritionalAssessment,
    pub liver_assessment: LiverAssessment,
    pub investigations: Investigations,
    pub current_treatment: CurrentTreatment,
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
    pub severity_level: SeverityLevel,
    pub severity_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
