use serde::{Deserialize, Serialize};

pub type SeverityLevel = String;

// ─── Patient Information (Step 1) ──────────────────────────

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

// ─── Skin History (Step 2) ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SkinHistory {
    pub primary_diagnosis: String,
    pub age_of_onset: Option<u8>,
    pub duration_years: Option<u8>,
    pub family_history: String,
    pub previous_biopsies: String,
    pub skin_cancer_history: String,
}

// ─── Current Condition (Step 3) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentCondition {
    pub condition_status: String,
    pub lesion_type: String,
    pub lesion_distribution: String,
    pub body_area_affected: Option<u8>,
    pub infection_signs: String,
    pub scarring: String,
}

// ─── Affected Areas (Step 4) ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AffectedAreas {
    pub head: Option<u8>,
    pub upper_limbs: Option<u8>,
    pub trunk: Option<u8>,
    pub lower_limbs: Option<u8>,
    pub hands: Option<u8>,
    pub feet: Option<u8>,
    pub genital_area: Option<u8>,
    pub nails: Option<u8>,
}

// ─── Symptom Severity (Step 5) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SymptomSeverity {
    pub itching: Option<u8>,
    pub pain: Option<u8>,
    pub burning: Option<u8>,
    pub dryness: Option<u8>,
    pub scaling: Option<u8>,
    pub erythema: Option<u8>,
    pub thickness: Option<u8>,
    pub sleep_disturbance: Option<u8>,
}

// ─── Quality of Life - DLQI (Step 6) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct QualityOfLife {
    pub dlqi1_symptoms: Option<u8>,
    pub dlqi2_embarrassment: Option<u8>,
    pub dlqi3_shopping: Option<u8>,
    pub dlqi4_clothing: Option<u8>,
    pub dlqi5_social: Option<u8>,
    pub dlqi6_sport: Option<u8>,
    pub dlqi7_work: Option<u8>,
    pub dlqi8_relationships: Option<u8>,
    pub dlqi9_sex: Option<u8>,
    pub dlqi10_treatment: Option<u8>,
}

// ─── Previous Treatments (Step 7) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PreviousTreatments {
    pub topical_steroids_used: String,
    pub topical_steroid_response: String,
    pub emollients_used: String,
    pub phototherapy: String,
    pub systemic_therapy: String,
    pub biologic_therapy: String,
    pub treatment_failures: Option<u8>,
}

// ─── Current Treatment (Step 8) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CurrentTreatment {
    pub current_topical: String,
    pub current_systemic: String,
    pub current_biologic: String,
    pub treatment_adherence: Option<u8>,
    pub treatment_response: Option<u8>,
    pub side_effects: String,
    pub emollient_use: Option<u8>,
}

// ─── Triggers & Comorbidities (Step 9) ─────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TriggersComorbidities {
    pub stress_trigger: String,
    pub weather_trigger: String,
    pub contact_allergens: String,
    pub psoriasis_arthritis: String,
    pub mental_health_impact: Option<u8>,
    pub allergic_rhinitis: String,
    pub asthma: String,
    pub metabolic_syndrome: String,
}

// ─── Clinical Review (Step 10) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub clinician_name: String,
    pub review_date: String,
    pub clinical_severity: Option<u8>,
    pub dlqi_total: Option<u8>,
    pub clinical_notes: String,
    pub treatment_plan: String,
    pub referral_needed: String,
    pub next_review_date: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub skin_history: SkinHistory,
    pub current_condition: CurrentCondition,
    pub affected_areas: AffectedAreas,
    pub symptom_severity: SymptomSeverity,
    pub quality_of_life: QualityOfLife,
    pub previous_treatments: PreviousTreatments,
    pub current_treatment: CurrentTreatment,
    pub triggers_comorbidities: TriggersComorbidities,
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
    pub dlqi_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
