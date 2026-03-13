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
    pub sex: String, // "male" | "female"
    pub ethnicity: String,
    pub height_cm: Option<f64>,
    pub weight_kg: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SmokingHistory {
    pub smoking_status: String, // "current" | "former" | "never"
    pub cigarettes_per_day: Option<u8>,
    pub years_smoked: Option<u8>,
    pub years_since_quit: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BloodPressure {
    pub systolic_bp: Option<f64>,
    pub diastolic_bp: Option<f64>,
    pub on_bp_treatment: String, // "yes" | "no"
    pub bp_medication_name: String,
    pub bp_measurement_method: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Cholesterol {
    pub total_cholesterol: Option<f64>, // mg/dL
    pub hdl_cholesterol: Option<f64>,   // mg/dL
    pub ldl_cholesterol: Option<f64>,   // mg/dL
    pub triglycerides: Option<f64>,
    pub cholesterol_unit: String, // "mgDl" | "mmolL"
    pub fasting_sample: String,   // "yes" | "no"
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MedicalHistory {
    pub has_diabetes: String, // "yes" | "no"
    pub has_prior_chd: String, // "yes" | "no"
    pub has_peripheral_vascular_disease: String,
    pub has_cerebrovascular_disease: String,
    pub has_heart_failure: String,
    pub has_atrial_fibrillation: String,
    pub other_conditions: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FamilyHistory {
    pub family_chd_history: String, // "yes" | "no"
    pub family_chd_age_onset: String, // "under55" | "55to65" | "over65" | ""
    pub family_chd_relationship: String,
    pub family_stroke_history: String,
    pub family_diabetes_history: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct LifestyleFactors {
    pub physical_activity: String, // "sedentary" | "light" | "moderate" | "vigorous"
    pub alcohol_consumption: String, // "none" | "moderate" | "heavy"
    pub diet_quality: String, // "poor" | "average" | "good" | "excellent"
    pub bmi: Option<f64>,
    pub waist_circumference_cm: Option<f64>,
    pub stress_level: String, // "low" | "moderate" | "high"
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentMedications {
    pub on_statin: String,
    pub statin_name: String,
    pub on_aspirin: String,
    pub on_antihypertensive: String,
    pub antihypertensive_name: String,
    pub other_medications: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ReviewCalculate {
    pub clinician_name: String,
    pub review_date: String,
    pub clinical_notes: String,
    pub patient_consent: String, // "yes" | "no"
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub demographics: Demographics,
    pub smoking_history: SmokingHistory,
    pub blood_pressure: BloodPressure,
    pub cholesterol: Cholesterol,
    pub medical_history: MedicalHistory,
    pub family_history: FamilyHistory,
    pub lifestyle_factors: LifestyleFactors,
    pub current_medications: CurrentMedications,
    pub review_calculate: ReviewCalculate,
}

pub type RiskLevel = String; // "draft" | "low" | "intermediate" | "high"

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
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
