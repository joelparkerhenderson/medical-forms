use serde::{Deserialize, Serialize};

pub type EligibilityLevel = String;

// ─── Patient Information (Step 1) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub full_name: String,
    pub date_of_birth: String,
    pub sex: String,
    pub contact_phone: String,
    pub contact_email: String,
    pub referring_clinician: String,
    pub assessment_date: String,
    pub nhs_number: String,
}

// ─── Weight & BMI History (Step 2) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct WeightBmiHistory {
    pub current_weight_kg: Option<f64>,
    pub height_cm: Option<f64>,
    pub current_bmi: Option<f64>,
    pub highest_bmi: Option<f64>,
    pub weight_loss_attempts: String,
    pub previous_weight_loss_medications: String,
    pub bariatric_surgery_history: String,
    pub weight_gain_duration: String,
}

// ─── Medical History (Step 3) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MedicalHistory {
    pub type2_diabetes: String,
    pub hypertension: String,
    pub dyslipidaemia: String,
    pub obstructive_sleep_apnoea: String,
    pub cardiovascular_disease: String,
    pub pcos: String,
    pub nafld: String,
    pub osteoarthritis: String,
    pub depression_anxiety: String,
    pub other_comorbidities: String,
}

// ─── Contraindications (Step 4) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Contraindications {
    pub personal_medullary_thyroid_cancer: String,
    pub family_men2: String,
    pub pancreatitis_history: String,
    pub severe_gi_disease: String,
    pub pregnancy_or_planning: String,
    pub breastfeeding: String,
    pub type1_diabetes: String,
    pub severe_renal_impairment: String,
    pub known_hypersensitivity: String,
    pub eating_disorder: String,
}

// ─── Current Medications (Step 5) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentMedications {
    pub insulin_therapy: String,
    pub sulfonylureas: String,
    pub other_glp1_agonist: String,
    pub oral_contraceptives: String,
    pub warfarin: String,
    pub antihypertensives: String,
    pub statins: String,
    pub other_medications: String,
}

// ─── Lifestyle Assessment (Step 6) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct LifestyleAssessment {
    pub diet_quality: Option<u8>,
    pub physical_activity_level: Option<u8>,
    pub alcohol_consumption: String,
    pub smoking_status: String,
    pub sleep_quality: Option<u8>,
    pub stress_level: Option<u8>,
    pub motivation_to_change: Option<u8>,
    pub social_support: Option<u8>,
}

// ─── Treatment Goals (Step 7) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TreatmentGoals {
    pub target_weight_loss_percent: Option<f64>,
    pub primary_goal: String,
    pub glycaemic_control_goal: String,
    pub cardiovascular_risk_reduction: String,
    pub mobility_improvement: String,
    pub quality_of_life_improvement: String,
    pub realistic_expectations: Option<u8>,
    pub commitment_to_lifestyle_changes: Option<u8>,
}

// ─── Informed Consent (Step 8) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct InformedConsent {
    pub understands_mechanism: String,
    pub understands_side_effects: String,
    pub understands_injection_technique: String,
    pub understands_dose_escalation: String,
    pub understands_monitoring_requirements: String,
    pub consent_given: String,
    pub consent_date: String,
    pub clinician_name: String,
}

// ─── Monitoring Plan (Step 9) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MonitoringPlan {
    pub baseline_bloods_completed: String,
    pub hba1c_baseline: String,
    pub renal_function_checked: String,
    pub thyroid_function_checked: String,
    pub follow_up_interval_weeks: Option<u8>,
    pub weight_monitoring_frequency: String,
    pub side_effect_monitoring_plan: String,
    pub dose_escalation_schedule: String,
}

// ─── Clinical Review (Step 10) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub overall_eligibility_assessment: Option<u8>,
    pub benefit_risk_ratio: Option<u8>,
    pub patient_suitability: Option<u8>,
    pub clinical_confidence: Option<u8>,
    pub recommended_starting_dose: String,
    pub additional_investigations_needed: String,
    pub referrals_needed: String,
    pub clinician_notes: String,
}

// ─── Assessment Data (all sections) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub weight_bmi_history: WeightBmiHistory,
    pub medical_history: MedicalHistory,
    pub contraindications: Contraindications,
    pub current_medications: CurrentMedications,
    pub lifestyle_assessment: LifestyleAssessment,
    pub treatment_goals: TreatmentGoals,
    pub informed_consent: InformedConsent,
    pub monitoring_plan: MonitoringPlan,
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
    pub eligibility_level: EligibilityLevel,
    pub eligibility_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
