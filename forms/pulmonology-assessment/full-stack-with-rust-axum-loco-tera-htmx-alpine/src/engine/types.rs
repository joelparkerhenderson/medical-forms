use serde::{Deserialize, Serialize};

pub type SeverityLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub patient_age: String,
    pub patient_sex: String,
    pub referring_physician: String,
    pub assessment_date: String,
    pub primary_complaint: String,
    pub insurance_status: String,
}

// ─── Respiratory History (Step 2) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RespiratoryHistory {
    pub asthma_history: String,
    pub copd_history: String,
    pub pneumonia_history: String,
    pub tuberculosis_history: String,
    pub lung_cancer_history: String,
    pub interstitial_lung_disease: String,
    pub family_respiratory_history: String,
    pub previous_hospitalizations: Option<u8>,
}

// ─── Symptom Assessment (Step 3) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SymptomAssessment {
    pub dyspnea_severity: Option<u8>,
    pub cough_severity: Option<u8>,
    pub sputum_production: Option<u8>,
    pub wheezing_frequency: Option<u8>,
    pub chest_tightness: Option<u8>,
    pub hemoptysis_present: String,
    pub symptom_duration: String,
    pub nocturnal_symptoms: Option<u8>,
}

// ─── Smoking & Exposure (Step 4) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SmokingExposure {
    pub smoking_status: String,
    pub pack_years: String,
    pub secondhand_smoke: String,
    pub occupational_exposure: String,
    pub environmental_allergens: String,
    pub dust_exposure: String,
    pub chemical_exposure: String,
    pub asbestos_exposure: String,
}

// ─── Pulmonary Function Tests (Step 5) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PulmonaryFunctionTests {
    pub fev1_percent_predicted: Option<u8>,
    pub fvc_percent_predicted: Option<u8>,
    pub fev1_fvc_ratio: Option<u8>,
    pub dlco_percent_predicted: Option<u8>,
    pub bronchodilator_response: String,
    pub peak_flow_variability: Option<u8>,
    pub lung_volumes_normal: String,
    pub flow_volume_loop_pattern: String,
}

// ─── Chest Imaging (Step 6) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ChestImaging {
    pub chest_xray_findings: String,
    pub ct_scan_findings: String,
    pub nodule_detected: String,
    pub nodule_size_mm: String,
    pub pleural_effusion: String,
    pub consolidation_present: String,
    pub fibrosis_pattern: String,
    pub imaging_urgency: Option<u8>,
}

// ─── Arterial Blood Gases (Step 7) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ArterialBloodGases {
    pub pao2_mmhg: String,
    pub paco2_mmhg: String,
    pub ph_level: String,
    pub sao2_percent: String,
    pub bicarbonate_level: String,
    pub supplemental_oxygen: String,
    pub oxygen_flow_rate: String,
    pub abg_interpretation: Option<u8>,
}

// ─── Sleep & Breathing (Step 8) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SleepBreathing {
    pub snoring_severity: Option<u8>,
    pub apnea_witnessed: String,
    pub daytime_sleepiness: Option<u8>,
    pub sleep_study_done: String,
    pub ahi_score: String,
    pub cpap_compliance: String,
    pub sleep_quality: Option<u8>,
    pub morning_headaches: String,
}

// ─── Current Treatment (Step 9) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentTreatment {
    pub inhaler_use: String,
    pub inhaler_technique: Option<u8>,
    pub oral_medications: String,
    pub oxygen_therapy: String,
    pub pulmonary_rehab: String,
    pub treatment_adherence: Option<u8>,
    pub side_effects_reported: String,
    pub treatment_effectiveness: Option<u8>,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub overall_severity_impression: Option<u8>,
    pub exacerbation_frequency: String,
    pub exercise_tolerance: Option<u8>,
    pub quality_of_life_impact: Option<u8>,
    pub follow_up_urgency: Option<u8>,
    pub specialist_referral_needed: String,
    pub additional_tests_needed: String,
    pub clinical_notes: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub respiratory_history: RespiratoryHistory,
    pub symptom_assessment: SymptomAssessment,
    pub smoking_exposure: SmokingExposure,
    pub pulmonary_function_tests: PulmonaryFunctionTests,
    pub chest_imaging: ChestImaging,
    pub arterial_blood_gases: ArterialBloodGases,
    pub sleep_breathing: SleepBreathing,
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
