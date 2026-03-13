use serde::{Deserialize, Serialize};

pub type EligibilityLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub age: Option<u8>,
    pub sex: String,
    pub nhs_number: String,
    pub consultation_date: String,
    pub clinician_name: String,
}

// ─── Reproductive History (Step 2) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ReproductiveHistory {
    pub parity: Option<u8>,
    pub last_delivery_date: String,
    pub pregnancy_possible: String,
    pub breastfeeding: String,
    pub breastfeeding_duration: String,
    pub ectopic_history: String,
    pub current_sti_risk: String,
    pub last_sti_screen_date: String,
}

// ─── Medical History (Step 3) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MedicalHistory {
    pub vte_history: String,
    pub vte_family_history: String,
    pub stroke_history: String,
    pub ischaemic_heart_disease: String,
    pub valvular_heart_disease: String,
    pub diabetes_type: String,
    pub diabetes_complications: String,
    pub liver_disease: String,
    pub gallbladder_disease: String,
    pub inflammatory_bowel_disease: String,
    pub sle_with_antiphospholipid: String,
    pub breast_cancer_history: String,
    pub breast_cancer_current: String,
    pub cervical_cancer: String,
    pub endometrial_cancer: String,
    pub epilepsy: String,
}

// ─── Cardiovascular Risk (Step 4) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CardiovascularRisk {
    pub systolic_bp: Option<u16>,
    pub diastolic_bp: Option<u16>,
    pub hypertension_controlled: String,
    pub migraine_with_aura: String,
    pub migraine_without_aura: String,
    pub migraine_age_over_35: String,
    pub multiple_cv_risk_factors: String,
}

// ─── Current Medications (Step 5) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentMedications {
    pub anticonvulsants: String,
    pub anticonvulsant_names: String,
    pub rifampicin_rifabutin: String,
    pub antiretrovirals: String,
    pub ssri_antidepressants: String,
    pub anticoagulants: String,
    pub other_medications: String,
}

// ─── Smoking & BMI (Step 6) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SmokingBmi {
    pub smoking_status: String,
    pub cigarettes_per_day: Option<u8>,
    pub age_over_35_smoking: String,
    pub height_cm: Option<f64>,
    pub weight_kg: Option<f64>,
    pub bmi: Option<f64>,
    pub bmi_over_35: String,
}

// ─── Contraceptive Preferences (Step 7) ─────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ContraceptivePreferences {
    pub current_method: String,
    pub reason_for_change: String,
    pub preferred_method: String,
    pub long_acting_interest: String,
    pub hormonal_concerns: String,
    pub fertility_plans: String,
    pub partner_involvement: String,
}

// ─── UKMEC Eligibility (Step 8) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct UkmecEligibility {
    pub coc_category: Option<u8>,
    pub pop_category: Option<u8>,
    pub patch_ring_category: Option<u8>,
    pub dmpa_injectable_category: Option<u8>,
    pub implant_category: Option<u8>,
    pub lng_ius_category: Option<u8>,
    pub cu_iud_category: Option<u8>,
    pub barrier_category: Option<u8>,
    pub clinician_override_notes: String,
}

// ─── Counselling (Step 9) ───────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Counselling {
    pub method_explained: String,
    pub risks_benefits_discussed: String,
    pub side_effects_discussed: String,
    pub alternative_methods_discussed: String,
    pub sti_prevention_discussed: String,
    pub emergency_contraception_discussed: String,
    pub written_information_provided: String,
    pub patient_questions_answered: String,
    pub consent_obtained: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub method_chosen: String,
    pub prescription_issued: String,
    pub follow_up_date: String,
    pub follow_up_interval: String,
    pub cervical_screening_status: String,
    pub last_cervical_screen_date: String,
    pub additional_investigations: String,
    pub clinician_notes: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub reproductive_history: ReproductiveHistory,
    pub medical_history: MedicalHistory,
    pub cardiovascular_risk: CardiovascularRisk,
    pub current_medications: CurrentMedications,
    pub smoking_bmi: SmokingBmi,
    pub contraceptive_preferences: ContraceptivePreferences,
    pub ukmec_eligibility: UkmecEligibility,
    pub counselling: Counselling,
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
    pub eligibility_level: EligibilityLevel,
    pub ukmec_category: u8,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
