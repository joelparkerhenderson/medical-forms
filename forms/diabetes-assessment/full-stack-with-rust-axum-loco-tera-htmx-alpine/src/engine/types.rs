use serde::{Deserialize, Serialize};

pub type ControlLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

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

// ─── Diabetes History (Step 2) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DiabetesHistory {
    pub diabetes_type: String,
    pub age_at_diagnosis: Option<u8>,
    pub years_duration: Option<u8>,
    pub diagnosis_method: String,
    pub family_history: String,
    pub autoantibodies_tested: String,
}

// ─── Glycaemic Control (Step 3) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GlycaemicControl {
    pub hba1c_value: Option<f64>,
    pub hba1c_unit: String,
    pub hba1c_target: Option<f64>,
    pub fasting_glucose: Option<f64>,
    pub postprandial_glucose: Option<f64>,
    pub glucose_monitoring_type: String,
    pub hypoglycaemia_frequency: String,
    pub severe_hypoglycaemia: String,
    pub time_in_range: Option<u8>,
}

// ─── Medications (Step 4) ───────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Medications {
    pub metformin: String,
    pub sulfonylurea: String,
    pub sglt2_inhibitor: String,
    pub glp1_agonist: String,
    pub dpp4_inhibitor: String,
    pub insulin: String,
    pub insulin_regimen: String,
    pub insulin_daily_dose: Option<f64>,
    pub medication_adherence: Option<u8>,
    pub other_medications: String,
}

// ─── Complications Screening (Step 5) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ComplicationsScreening {
    pub retinopathy_status: String,
    pub last_eye_screening: String,
    pub nephropathy_status: String,
    pub egfr: Option<f64>,
    pub urine_acr: Option<f64>,
    pub neuropathy_symptoms: String,
    pub autonomic_neuropathy: String,
    pub erectile_dysfunction: String,
}

// ─── Cardiovascular Risk (Step 6) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CardiovascularRisk {
    pub systolic_bp: Option<f64>,
    pub diastolic_bp: Option<f64>,
    pub on_antihypertensive: String,
    pub total_cholesterol: Option<f64>,
    pub ldl_cholesterol: Option<f64>,
    pub on_statin: String,
    pub smoking_status: String,
    pub previous_cvd_event: String,
    pub qrisk_score: Option<f64>,
}

// ─── Self-Care & Lifestyle (Step 7) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SelfCareLifestyle {
    pub diet_adherence: Option<u8>,
    pub carb_counting: String,
    pub physical_activity: String,
    pub bmi: Option<f64>,
    pub weight_change: String,
    pub alcohol_consumption: String,
    pub smoking_cessation: String,
}

// ─── Psychological Wellbeing (Step 8) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PsychologicalWellbeing {
    pub diabetes_distress: Option<u8>,
    pub depression_screening: Option<u8>,
    pub anxiety_screening: Option<u8>,
    pub eating_disorder: String,
    pub fear_of_hypoglycaemia: Option<u8>,
    pub coping_ability: Option<u8>,
    pub needs_support: String,
}

// ─── Foot Assessment (Step 9) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct FootAssessment {
    pub foot_pulses: String,
    pub monofilament_test: String,
    pub vibration_sense: String,
    pub foot_deformity: String,
    pub callus_present: String,
    pub ulcer_present: String,
    pub previous_amputation: String,
    pub foot_risk_category: String,
}

// ─── Review & Care Plan (Step 10) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ReviewCarePlan {
    pub clinician_name: String,
    pub review_date: String,
    pub hba1c_target_agreed: Option<f64>,
    pub care_plan_updated: String,
    pub clinical_notes: String,
    pub referrals: String,
    pub next_review_date: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub diabetes_history: DiabetesHistory,
    pub glycaemic_control: GlycaemicControl,
    pub medications: Medications,
    pub complications_screening: ComplicationsScreening,
    pub cardiovascular_risk: CardiovascularRisk,
    pub self_care_lifestyle: SelfCareLifestyle,
    pub psychological_wellbeing: PsychologicalWellbeing,
    pub foot_assessment: FootAssessment,
    pub review_care_plan: ReviewCarePlan,
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
    pub control_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
