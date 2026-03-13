use serde::{Deserialize, Serialize};

pub type RiskLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub patient_age: String,
    pub patient_sex: String,
    pub ethnicity: String,
    pub referral_date: String,
    pub referring_clinician: String,
    pub reason_for_referral: String,
}

// ─── Menopausal Symptoms (Step 2) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MenopausalSymptoms {
    pub hot_flushes_severity: Option<u8>,
    pub night_sweats_severity: Option<u8>,
    pub sleep_disturbance_severity: Option<u8>,
    pub mood_changes_severity: Option<u8>,
    pub vaginal_dryness_severity: Option<u8>,
    pub urinary_symptoms_severity: Option<u8>,
    pub joint_pain_severity: Option<u8>,
    pub cognitive_difficulty_severity: Option<u8>,
    pub symptom_duration_months: String,
    pub symptom_impact_on_daily_life: Option<u8>,
}

// ─── Menstrual History (Step 3) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MenstrualHistory {
    pub menopausal_status: String,
    pub last_menstrual_period: String,
    pub age_at_menopause: String,
    pub menopause_type: String,
    pub surgical_menopause_reason: String,
    pub previous_hrt_use: String,
    pub previous_hrt_details: String,
    pub contraception_status: String,
}

// ─── Medical History (Step 4) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MedicalHistory {
    pub history_of_vte: String,
    pub history_of_stroke: String,
    pub history_of_mi: String,
    pub liver_disease: String,
    pub undiagnosed_vaginal_bleeding: String,
    pub endometriosis: String,
    pub fibroids: String,
    pub migraine_with_aura: String,
    pub diabetes: String,
    pub hypertension: String,
    pub autoimmune_conditions: String,
    pub other_conditions: String,
}

// ─── Cardiovascular Risk (Step 5) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CardiovascularRisk {
    pub smoking_status: String,
    pub bmi_category: String,
    pub blood_pressure_status: String,
    pub cholesterol_status: String,
    pub family_history_cvd: String,
    pub physical_activity_level: String,
    pub alcohol_consumption: String,
}

// ─── Breast Health (Step 6) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BreastHealth {
    pub personal_breast_cancer_history: String,
    pub family_breast_cancer_history: String,
    pub brca_gene_status: String,
    pub last_mammogram_date: String,
    pub mammogram_result: String,
    pub breast_density: String,
    pub current_breast_symptoms: String,
}

// ─── Bone Health (Step 7) ───────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BoneHealth {
    pub dexa_scan_result: String,
    pub previous_fractures: String,
    pub family_history_osteoporosis: String,
    pub calcium_intake: String,
    pub vitamin_d_status: String,
    pub fall_risk_assessment: Option<u8>,
}

// ─── Current Medications (Step 8) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentMedications {
    pub current_medications_list: String,
    pub herbal_supplements: String,
    pub previous_hrt_preparations: String,
    pub drug_allergies: String,
    pub contraindicated_medications: String,
}

// ─── HRT Options & Counselling (Step 9) ─────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct HrtOptionsCounselling {
    pub preferred_hrt_route: String,
    pub combined_vs_estrogen_only: String,
    pub risks_discussed: String,
    pub benefits_discussed: String,
    pub alternatives_discussed: String,
    pub informed_consent_obtained: String,
    pub patient_preference_noted: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub clinician_name: String,
    pub review_date: String,
    pub overall_risk_assessment: Option<u8>,
    pub recommended_action: String,
    pub follow_up_interval: String,
    pub additional_investigations: String,
    pub clinical_notes: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub menopausal_symptoms: MenopausalSymptoms,
    pub menstrual_history: MenstrualHistory,
    pub medical_history: MedicalHistory,
    pub cardiovascular_risk: CardiovascularRisk,
    pub breast_health: BreastHealth,
    pub bone_health: BoneHealth,
    pub current_medications: CurrentMedications,
    pub hrt_options_counselling: HrtOptionsCounselling,
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
    pub risk_level: RiskLevel,
    pub risk_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
