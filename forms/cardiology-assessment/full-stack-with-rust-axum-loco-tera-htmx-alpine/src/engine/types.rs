use serde::{Deserialize, Serialize};

pub type SeverityLevel = String;

// ─── Patient Information (Step 1) ────────────────────────────

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

// ─── Cardiac History (Step 2) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CardiacHistory {
    pub previous_mi: String,
    pub previous_cabg: String,
    pub previous_pci: String,
    pub heart_failure: String,
    pub atrial_fibrillation: String,
    pub valvular_disease: String,
    pub pacemaker: String,
    pub family_cardiac_history: String,
    pub sudden_cardiac_death: String,
}

// ─── Symptoms Assessment (Step 3) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SymptomsAssessment {
    pub chest_pain: String,
    pub chest_pain_type: String,
    pub dyspnoea: Option<u8>,
    pub orthopnoea: String,
    pub pnd: String,
    pub palpitations: String,
    pub syncope: String,
    pub peripheral_oedema: String,
    pub nyha_class: String,
    pub exercise_tolerance: String,
}

// ─── Risk Factors (Step 4) ───────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RiskFactors {
    pub hypertension: String,
    pub diabetes: String,
    pub dyslipidaemia: String,
    pub smoking_status: String,
    pub bmi: Option<f64>,
    pub family_cad_history: String,
    pub chronic_kidney_disease: String,
    pub obstructive_sleep_apnoea: String,
}

// ─── Physical Examination (Step 5) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PhysicalExamination {
    pub heart_rate: Option<u8>,
    pub blood_pressure_systolic: Option<f64>,
    pub blood_pressure_diastolic: Option<f64>,
    pub heart_rhythm: String,
    pub heart_sounds: String,
    pub murmur: String,
    pub murmur_grade: String,
    pub jvp_elevated: String,
    pub peripheral_oedema_exam: String,
    pub lung_creps: String,
}

// ─── ECG Findings (Step 6) ───────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct EcgFindings {
    pub ecg_rhythm: String,
    pub heart_rate_ecg: Option<u8>,
    pub pr_interval: Option<u16>,
    pub qrs_duration: Option<u16>,
    pub qtc_interval: Option<u16>,
    pub st_changes: String,
    pub t_wave_changes: String,
    pub bundle_branch_block: String,
    pub lvh: String,
    pub ecg_interpretation: String,
}

// ─── Echocardiography (Step 7) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Echocardiography {
    pub lvef: Option<u8>,
    pub lvef_category: String,
    pub lv_diastolic_function: String,
    pub rwma: String,
    pub valvular_abnormality: String,
    pub aortic_valve: String,
    pub mitral_valve: String,
    pub right_heart_function: String,
    pub pericardial_effusion: String,
}

// ─── Investigations (Step 8) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Investigations {
    pub troponin: Option<f64>,
    pub bnp: Option<f64>,
    pub creatinine: Option<f64>,
    pub egfr: Option<f64>,
    pub lipid_profile: String,
    pub thyroid_function: String,
    pub coronary_angiogram_done: String,
    pub coronary_angiogram_result: String,
    pub stress_test_done: String,
    pub stress_test_result: String,
}

// ─── Current Treatment (Step 9) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentTreatment {
    pub beta_blocker: String,
    pub ace_inhibitor: String,
    pub arb: String,
    pub diuretic: String,
    pub anticoagulant: String,
    pub antiplatelet: String,
    pub statin: String,
    pub calcium_channel_blocker: String,
    pub nitrate: String,
    pub device_therapy: String,
}

// ─── Clinical Review (Step 10) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub clinician_name: String,
    pub review_date: String,
    pub primary_diagnosis: String,
    pub severity_level: String,
    pub nyha_classification: String,
    pub clinical_notes: String,
    pub management_plan: String,
    pub referral_needed: String,
    pub urgency: String,
}

// ─── Assessment Data (all sections) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub cardiac_history: CardiacHistory,
    pub symptoms_assessment: SymptomsAssessment,
    pub risk_factors: RiskFactors,
    pub physical_examination: PhysicalExamination,
    pub ecg_findings: EcgFindings,
    pub echocardiography: Echocardiography,
    pub investigations: Investigations,
    pub current_treatment: CurrentTreatment,
    pub clinical_review: ClinicalReview,
}

// ─── Grading types ───────────────────────────────────────────

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
