use serde::{Deserialize, Serialize};

pub type RiskCategory = String;

// Step 1: Patient Demographics
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientDemographics {
    pub full_name: String,
    pub date_of_birth: String,
    pub sex: String,           // "male" | "female"
    pub nhs_number: String,
    pub height_cm: Option<f64>,
    pub weight_kg: Option<f64>,
    pub ethnicity: String,
}

// Step 2: Diabetes History
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DiabetesHistory {
    pub diabetes_type: String,         // "type1" | "type2" | "gestational" | "other"
    pub age_at_diagnosis: Option<f64>,
    pub diabetes_duration_years: Option<f64>,
    pub hba1c_value: Option<f64>,      // mmol/mol
    pub hba1c_unit: String,            // "mmolMol" | "percent"
    pub fasting_glucose: Option<f64>,  // mmol/L
    pub diabetes_treatment: String,    // "diet" | "oral" | "insulin" | "combined"
    pub insulin_duration_years: Option<f64>,
}

// Step 3: Cardiovascular History
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CardiovascularHistory {
    pub previous_mi: String,            // "yes" | "no"
    pub previous_stroke: String,        // "yes" | "no"
    pub previous_tia: String,           // "yes" | "no"
    pub peripheral_arterial_disease: String, // "yes" | "no"
    pub heart_failure: String,          // "yes" | "no"
    pub atrial_fibrillation: String,    // "yes" | "no"
    pub family_cvd_history: String,     // "yes" | "no"
    pub family_cvd_details: String,
    pub current_chest_pain: String,     // "yes" | "no"
    pub current_dyspnoea: String,       // "yes" | "no"
}

// Step 4: Blood Pressure
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BloodPressure {
    pub systolic_bp: Option<f64>,       // mmHg
    pub diastolic_bp: Option<f64>,      // mmHg
    pub on_antihypertensive: String,    // "yes" | "no"
    pub number_of_bp_medications: Option<f64>,
    pub bp_at_target: String,           // "yes" | "no" | ""
    pub home_bp_monitoring: String,     // "yes" | "no"
}

// Step 5: Lipid Profile
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct LipidProfile {
    pub total_cholesterol: Option<f64>,  // mmol/L
    pub hdl_cholesterol: Option<f64>,    // mmol/L
    pub ldl_cholesterol: Option<f64>,    // mmol/L
    pub triglycerides: Option<f64>,      // mmol/L
    pub non_hdl_cholesterol: Option<f64>, // mmol/L
    pub on_statin: String,               // "yes" | "no"
    pub statin_name: String,
    pub on_other_lipid_therapy: String,  // "yes" | "no"
}

// Step 6: Renal Function
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RenalFunction {
    pub egfr: Option<f64>,               // mL/min/1.73m²
    pub creatinine: Option<f64>,         // µmol/L
    pub urine_acr: Option<f64>,          // mg/mmol
    pub proteinuria: String,             // "none" | "microalbuminuria" | "macroalbuminuria"
    pub ckd_stage: String,               // "G1" | "G2" | "G3a" | "G3b" | "G4" | "G5" | ""
}

// Step 7: Lifestyle Factors
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct LifestyleFactors {
    pub smoking_status: String,          // "never" | "former" | "current"
    pub cigarettes_per_day: Option<f64>,
    pub years_since_quit: Option<f64>,
    pub alcohol_units_per_week: Option<f64>,
    pub physical_activity: String,       // "sedentary" | "lightlyActive" | "moderatelyActive" | "veryActive"
    pub diet_quality: String,            // "poor" | "fair" | "good" | "excellent"
    pub bmi: Option<f64>,
    pub waist_circumference_cm: Option<f64>,
}

// Step 8: Current Medications
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentMedications {
    pub metformin: String,               // "yes" | "no"
    pub sglt2_inhibitor: String,         // "yes" | "no"
    pub glp1_agonist: String,            // "yes" | "no"
    pub sulfonylurea: String,            // "yes" | "no"
    pub dpp4_inhibitor: String,          // "yes" | "no"
    pub insulin: String,                 // "yes" | "no"
    pub ace_inhibitor_or_arb: String,    // "yes" | "no"
    pub antiplatelet: String,            // "yes" | "no"
    pub anticoagulant: String,           // "yes" | "no"
    pub other_medications: String,
}

// Step 9: Complications Screening
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ComplicationsScreening {
    pub retinopathy_status: String,      // "none" | "background" | "preProliferative" | "proliferative" | "maculopathy" | "notScreened"
    pub last_eye_screening_date: String,
    pub neuropathy_symptoms: String,     // "yes" | "no"
    pub monofilament_test: String,       // "normal" | "abnormal" | "notDone"
    pub foot_pulses: String,             // "normal" | "absent" | "notChecked"
    pub foot_ulcer_history: String,      // "yes" | "no"
    pub ankle_brachial_index: Option<f64>,
    pub erectile_dysfunction: String,    // "yes" | "no" | "notApplicable"
}

// Step 10: Risk Assessment Summary
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RiskAssessmentSummary {
    pub risk_region: String,             // "low" | "moderate" | "high" | "veryHigh"
    pub additional_risk_factors: String, // free text
    pub clinical_notes: String,
    pub agreed_treatment_targets: String,
    pub follow_up_interval: String,      // "3months" | "6months" | "12months" | ""
}

// Complete assessment data
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_demographics: PatientDemographics,
    pub diabetes_history: DiabetesHistory,
    pub cardiovascular_history: CardiovascularHistory,
    pub blood_pressure: BloodPressure,
    pub lipid_profile: LipidProfile,
    pub renal_function: RenalFunction,
    pub lifestyle_factors: LifestyleFactors,
    pub current_medications: CurrentMedications,
    pub complications_screening: ComplicationsScreening,
    pub risk_assessment_summary: RiskAssessmentSummary,
}

// Grading types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FiredRule {
    pub id: String,
    pub category: String,
    pub description: String,
    pub risk_level: String,  // "high" | "medium" | "low"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdditionalFlag {
    pub id: String,
    pub category: String,
    pub message: String,
    pub priority: String,    // "high" | "medium" | "low"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GradingResult {
    pub risk_category: RiskCategory,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
