use serde::{Deserialize, Serialize};

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

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Demographics {
    pub age: Option<u8>,
    pub sex: String,
    pub ethnicity: String,
    pub height_cm: Option<f64>,
    pub weight_kg: Option<f64>,
    pub zip_code: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BloodPressure {
    pub systolic_bp: Option<f64>,
    pub diastolic_bp: Option<f64>,
    pub on_antihypertensive: String,
    pub number_of_bp_medications: Option<u8>,
    pub bp_at_target: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CholesterolLipids {
    pub total_cholesterol: Option<f64>,
    pub hdl_cholesterol: Option<f64>,
    pub ldl_cholesterol: Option<f64>,
    pub triglycerides: Option<f64>,
    pub non_hdl_cholesterol: Option<f64>,
    pub on_statin: String,
    pub statin_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MetabolicHealth {
    pub has_diabetes: String,
    pub diabetes_type: String,
    pub hba1c_value: Option<f64>,
    pub hba1c_unit: String,
    pub fasting_glucose: Option<f64>,
    pub bmi: Option<f64>,
    pub waist_circumference_cm: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RenalFunction {
    pub egfr: Option<f64>,
    pub creatinine: Option<f64>,
    pub urine_acr: Option<f64>,
    pub ckd_stage: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SmokingHistory {
    pub smoking_status: String,
    pub cigarettes_per_day: Option<u8>,
    pub years_smoked: Option<u8>,
    pub years_since_quit: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MedicalHistory {
    pub has_known_cvd: String,
    pub previous_mi: String,
    pub previous_stroke: String,
    pub heart_failure: String,
    pub atrial_fibrillation: String,
    pub peripheral_arterial_disease: String,
    pub family_cvd_history: String,
    pub family_cvd_details: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentMedications {
    pub on_antihypertensive_detail: String,
    pub on_statin_detail: String,
    pub on_aspirin: String,
    pub on_anticoagulant: String,
    pub on_diabetes_medication: String,
    pub other_medications: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ReviewCalculate {
    pub model_type: String,
    pub clinician_name: String,
    pub review_date: String,
    pub clinical_notes: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub demographics: Demographics,
    pub blood_pressure: BloodPressure,
    pub cholesterol_lipids: CholesterolLipids,
    pub metabolic_health: MetabolicHealth,
    pub renal_function: RenalFunction,
    pub smoking_history: SmokingHistory,
    pub medical_history: MedicalHistory,
    pub current_medications: CurrentMedications,
    pub review_calculate: ReviewCalculate,
}

pub type RiskLevel = String;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FiredRule {
    pub id: String,
    pub category: String,
    pub description: String,
    pub risk_level: String,
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
    pub risk_category: String,
    pub ten_year_risk_percent: f64,
    pub thirty_year_risk_percent: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
