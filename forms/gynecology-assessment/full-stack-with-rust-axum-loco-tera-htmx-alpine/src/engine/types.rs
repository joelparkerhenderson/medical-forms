use serde::{Deserialize, Serialize};

pub type SeverityLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub nhs_number: String,
    pub address: String,
    pub phone: String,
    pub email: String,
    pub gp_name: String,
}

// ─── Menstrual History (Step 2) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MenstrualHistory {
    pub menarche_age: Option<u8>,
    pub cycle_length: String,
    pub duration: String,
    pub regularity: String,
    pub last_period: String,
    pub flow_amount: String,
    pub intermenstrual_bleeding: String,
}

// ─── Gynecological Symptoms (Step 3) ────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GynecologicalSymptoms {
    pub pelvic_pain_severity: Option<u8>,
    pub dysmenorrhoea: Option<u8>,
    pub dyspareunia: String,
    pub abnormal_discharge: String,
    pub urinary_symptoms: String,
    pub prolapse_symptoms: String,
}

// ─── Obstetric History (Step 4) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ObstetricHistory {
    pub gravida: Option<u8>,
    pub para: Option<u8>,
    pub miscarriages: Option<u8>,
    pub terminations: Option<u8>,
    pub ectopic: Option<u8>,
    pub delivery_modes: String,
    pub complications: String,
}

// ─── Cervical Screening (Step 5) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CervicalScreening {
    pub last_smear_date: String,
    pub smear_result: String,
    pub hpv_status: String,
    pub colposcopy_history: String,
    pub treatment_history: String,
}

// ─── Contraception & Fertility (Step 6) ─────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ContraceptionFertility {
    pub current_method: String,
    pub satisfaction: String,
    pub future_fertility_wishes: String,
    pub fertility_concerns: String,
    pub ivf_history: String,
}

// ─── Menopause Assessment (Step 7) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MenopauseAssessment {
    pub menopausal_status: String,
    pub vasomotor_symptoms: Option<u8>,
    pub urogenital_symptoms: Option<u8>,
    pub mood_changes: Option<u8>,
    pub hrt_use: String,
    pub bone_health: String,
}

// ─── Breast Health (Step 8) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BreastHealth {
    pub last_mammogram: String,
    pub breast_symptoms: String,
    pub family_breast_cancer: String,
    pub brca_status: String,
}

// ─── Sexual Health (Step 9) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SexualHealth {
    pub sti_screening: String,
    pub current_concerns: String,
    pub domestic_violence_screening: String,
    pub fgm_assessment: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub clinician_name: String,
    pub review_date: String,
    pub primary_diagnosis: String,
    pub management_plan: String,
    pub referral_needed: String,
    pub follow_up: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub menstrual_history: MenstrualHistory,
    pub gynecological_symptoms: GynecologicalSymptoms,
    pub obstetric_history: ObstetricHistory,
    pub cervical_screening: CervicalScreening,
    pub contraception_fertility: ContraceptionFertility,
    pub menopause_assessment: MenopauseAssessment,
    pub breast_health: BreastHealth,
    pub sexual_health: SexualHealth,
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
