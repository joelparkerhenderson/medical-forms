use serde::{Deserialize, Serialize};

pub type ConsentStatus = String;

// ─── Patient Information (Step 1) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_name: String,
    pub date_of_birth: String,
    pub nhs_number: String,
    pub address: String,
    pub contact_phone: String,
    pub contact_email: String,
    pub next_of_kin_name: String,
    pub next_of_kin_relationship: String,
    pub next_of_kin_phone: String,
}

// ─── Procedure Details (Step 2) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ProcedureDetails {
    pub procedure_name: String,
    pub procedure_type: String,
    pub procedure_description: String,
    pub surgeon_name: String,
    pub surgeon_role: String,
    pub planned_date: String,
    pub planned_location: String,
    pub anaesthesia_type: String,
    pub estimated_duration: String,
    pub laterality: String,
}

// ─── Risks and Benefits (Step 3) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RisksAndBenefits {
    pub specific_risks: String,
    pub general_risks: String,
    pub risk_of_no_treatment: String,
    pub expected_benefits: String,
    pub success_rate: String,
    pub risks_explained_verbally: Option<u8>,
    pub risks_understood: Option<u8>,
    pub benefits_understood: Option<u8>,
}

// ─── Alternatives (Step 4) ────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Alternatives {
    pub alternative_treatments: String,
    pub no_treatment_option: String,
    pub alternatives_explained: Option<u8>,
    pub alternatives_understood: Option<u8>,
    pub reason_for_chosen_treatment: String,
}

// ─── Capacity Assessment (Step 5) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CapacityAssessment {
    pub patient_has_capacity: String,
    pub can_understand_information: Option<u8>,
    pub can_retain_information: Option<u8>,
    pub can_weigh_information: Option<u8>,
    pub can_communicate_decision: Option<u8>,
    pub capacity_assessed_by: String,
    pub capacity_assessment_date: String,
    pub capacity_notes: String,
}

// ─── Patient Understanding (Step 6) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientUnderstanding {
    pub can_explain_procedure: Option<u8>,
    pub can_explain_risks: Option<u8>,
    pub can_explain_alternatives: Option<u8>,
    pub questions_asked: String,
    pub questions_answered_satisfactorily: Option<u8>,
    pub information_leaflet_provided: String,
    pub time_to_consider: String,
    pub second_opinion_offered: String,
}

// ─── Additional Considerations (Step 7) ───────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AdditionalConsiderations {
    pub blood_product_consent: String,
    pub photography_consent: String,
    pub teaching_consent: String,
    pub tissue_storage_consent: String,
    pub advance_directive_exists: String,
    pub advance_directive_details: String,
    pub religious_cultural_considerations: String,
    pub additional_requests: String,
}

// ─── Interpreter Requirements (Step 8) ────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct InterpreterRequirements {
    pub interpreter_needed: String,
    pub interpreter_language: String,
    pub interpreter_name: String,
    pub interpreter_service: String,
    pub communication_aids_needed: String,
    pub communication_aids_details: String,
}

// ─── Signatures (Step 9) ──────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Signatures {
    pub patient_signature: String,
    pub patient_signature_date: String,
    pub consent_voluntary: String,
    pub right_to_withdraw_understood: String,
    pub witness_name: String,
    pub witness_signature: String,
    pub witness_signature_date: String,
    pub parent_guardian_name: String,
    pub parent_guardian_relationship: String,
    pub parent_guardian_signature: String,
    pub parent_guardian_signature_date: String,
}

// ─── Clinical Verification (Step 10) ──────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalVerification {
    pub clinician_name: String,
    pub clinician_role: String,
    pub clinician_gmc_number: String,
    pub clinician_signature: String,
    pub clinician_signature_date: String,
    pub consent_confirmed_on_day: String,
    pub patient_condition_changed: String,
    pub condition_change_details: String,
    pub verification_notes: String,
}

// ─── Assessment Data (all sections) ─────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub procedure_details: ProcedureDetails,
    pub risks_and_benefits: RisksAndBenefits,
    pub alternatives: Alternatives,
    pub capacity_assessment: CapacityAssessment,
    pub patient_understanding: PatientUnderstanding,
    pub additional_considerations: AdditionalConsiderations,
    pub interpreter_requirements: InterpreterRequirements,
    pub signatures: Signatures,
    pub clinical_verification: ClinicalVerification,
}

// ─── Grading types ──────────────────────────────────────

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
    pub consent_status: ConsentStatus,
    pub completeness_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
