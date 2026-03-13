use serde::{Deserialize, Serialize};

pub type SeverityLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub patient_sex: String,
    pub referral_date: String,
    pub referring_provider: String,
    pub reason_for_referral: String,
}

// ─── Urinary Symptoms / IPSS (Step 2) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct UrinarySymptoms {
    pub incomplete_emptying: Option<u8>,
    pub frequency: Option<u8>,
    pub intermittency: Option<u8>,
    pub urgency: Option<u8>,
    pub weak_stream: Option<u8>,
    pub straining: Option<u8>,
    pub nocturia: Option<u8>,
    pub quality_of_life: Option<u8>,
}

// ─── Lower Urinary Tract (Step 3) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct LowerUrinaryTract {
    pub dysuria: String,
    pub haematuria: String,
    pub incontinence_type: String,
    pub incontinence_severity: Option<u8>,
    pub urinary_retention: String,
    pub recurrent_uti: String,
    pub uti_frequency_per_year: Option<u8>,
}

// ─── Renal Function (Step 4) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RenalFunction {
    pub egfr: Option<u8>,
    pub creatinine: Option<u16>,
    pub proteinuria: String,
    pub hydronephrosis: String,
    pub renal_impairment_known: String,
    pub dialysis: String,
}

// ─── Prostate Assessment (Step 5) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ProstateAssessment {
    pub psa_level: Option<f64>,
    pub psa_velocity: String,
    pub dre_findings: String,
    pub prostate_volume: String,
    pub bph_medication: String,
    pub family_history_prostate_cancer: String,
}

// ─── Bladder Assessment (Step 6) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BladderAssessment {
    pub post_void_residual: String,
    pub bladder_capacity: String,
    pub overactive_bladder: String,
    pub bladder_diary_completed: String,
    pub fluid_intake_daily: String,
    pub caffeine_intake: String,
}

// ─── Stone Disease (Step 7) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct StoneDisease {
    pub stone_history: String,
    pub stone_location: String,
    pub stone_size_mm: Option<u8>,
    pub stone_composition: String,
    pub current_pain_level: Option<u8>,
    pub recurrent_stones: String,
}

// ─── Urological Cancers (Step 8) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct UrologicalCancers {
    pub cancer_type: String,
    pub cancer_stage: String,
    pub prior_cancer_treatment: String,
    pub surveillance_status: String,
    pub unexplained_weight_loss: String,
    pub bone_pain: String,
}

// ─── Sexual Function (Step 9) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SexualFunction {
    pub erectile_dysfunction: String,
    pub ed_severity: Option<u8>,
    pub ed_duration_months: String,
    pub libido_change: String,
    pub ejaculatory_dysfunction: String,
    pub fertility_concerns: String,
}

// ─── Clinical Review (Step 10) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub comorbidities: String,
    pub current_medications: String,
    pub anticoagulant_use: String,
    pub allergy_history: String,
    pub smoking_status: String,
    pub additional_notes: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub urinary_symptoms: UrinarySymptoms,
    pub lower_urinary_tract: LowerUrinaryTract,
    pub renal_function: RenalFunction,
    pub prostate_assessment: ProstateAssessment,
    pub bladder_assessment: BladderAssessment,
    pub stone_disease: StoneDisease,
    pub urological_cancers: UrologicalCancers,
    pub sexual_function: SexualFunction,
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
