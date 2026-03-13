use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub full_name: String,
    pub date_of_birth: String,
    pub nhs_number: String,
    pub address: String,
    pub postcode: String,
    pub telephone: String,
    pub email: String,
    pub gp_name: String,
    pub gp_practice: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DemographicsEthnicity {
    pub age: Option<u8>,
    pub sex: String,
    pub ethnicity: String,
    pub townsend_deprivation: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BloodPressure {
    pub systolic_bp: Option<f64>,
    pub systolic_bp_sd: Option<f64>,
    pub diastolic_bp: Option<f64>,
    pub on_bp_treatment: String,
    pub number_of_bp_medications: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Cholesterol {
    pub total_cholesterol: Option<f64>,
    pub hdl_cholesterol: Option<f64>,
    pub total_hdl_ratio: Option<f64>,
    pub on_statin: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MedicalConditions {
    pub has_diabetes: String,
    pub has_atrial_fibrillation: String,
    pub has_rheumatoid_arthritis: String,
    pub has_chronic_kidney_disease: String,
    pub has_migraine: String,
    pub has_severe_mental_illness: String,
    pub has_erectile_dysfunction: String,
    pub on_atypical_antipsychotic: String,
    pub on_corticosteroids: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FamilyHistory {
    pub family_cvd_under_60: String,
    pub family_cvd_relationship: String,
    pub family_diabetes_history: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SmokingAlcohol {
    pub smoking_status: String,
    pub cigarettes_per_day: Option<u8>,
    pub years_since_quit: Option<u8>,
    pub alcohol_units_per_week: Option<f64>,
    pub alcohol_frequency: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PhysicalActivityDiet {
    pub physical_activity_minutes_per_week: Option<u16>,
    pub activity_intensity: String,
    pub fruit_veg_portions_per_day: Option<u8>,
    pub diet_quality: String,
    pub salt_intake: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BodyMeasurements {
    pub height_cm: Option<f64>,
    pub weight_kg: Option<f64>,
    pub bmi: Option<f64>,
    pub waist_circumference_cm: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ReviewCalculate {
    pub clinician_name: String,
    pub review_date: String,
    pub clinical_notes: String,
    pub audit_score: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub demographics_ethnicity: DemographicsEthnicity,
    pub blood_pressure: BloodPressure,
    pub cholesterol: Cholesterol,
    pub medical_conditions: MedicalConditions,
    pub family_history: FamilyHistory,
    pub smoking_alcohol: SmokingAlcohol,
    pub physical_activity_diet: PhysicalActivityDiet,
    pub body_measurements: BodyMeasurements,
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
    pub heart_age: Option<u8>,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
