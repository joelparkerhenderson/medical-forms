use serde::{Deserialize, Serialize};

pub type CompletionLevel = String;

// ─── Patient Information (Step 1) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PatientInformation {
    pub patient_full_name: String,
    pub date_of_birth: String,
    pub patient_address: String,
    pub patient_phone: String,
    pub patient_email: String,
    pub medical_record_number: String,
    pub social_security_last_four: String,
}

// ─── Requesting Party (Step 2) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RequestingParty {
    pub requester_name: String,
    pub requester_relationship: String,
    pub requester_organization: String,
    pub requester_address: String,
    pub requester_phone: String,
    pub requester_email: String,
    pub requester_fax: String,
}

// ─── Records Specification (Step 3) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RecordsSpecification {
    pub record_type: String,
    pub date_range_start: String,
    pub date_range_end: String,
    pub specific_records: String,
    pub delivery_format: String,
    pub delivery_method: String,
    pub urgency_level: String,
}

// ─── Purpose of Release (Step 4) ────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct PurposeOfRelease {
    pub primary_purpose: String,
    pub secondary_purpose: String,
    pub purpose_details: String,
    pub legal_case_number: String,
    pub insurance_claim_number: String,
    pub is_court_ordered: String,
}

// ─── Authorization Scope (Step 5) ───────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AuthorizationScope {
    pub releasing_facility_name: String,
    pub releasing_facility_address: String,
    pub releasing_provider_name: String,
    pub receiving_facility_name: String,
    pub receiving_facility_address: String,
    pub receiving_provider_name: String,
    pub scope_limitation: String,
}

// ─── Sensitive Information (Step 6) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SensitiveInformation {
    pub include_mental_health: String,
    pub include_substance_abuse: String,
    pub include_hiv_aids: String,
    pub include_genetic_testing: String,
    pub include_sexual_health: String,
    pub include_psychotherapy_notes: String,
    pub sensitive_info_acknowledgement: String,
}

// ─── Duration & Expiry (Step 7) ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct DurationExpiry {
    pub authorization_start_date: String,
    pub authorization_expiry_date: String,
    pub expiry_event: String,
    pub auto_renew: String,
    pub revocation_understood: String,
    pub revocation_method: String,
}

// ─── Verification & Identity (Step 8) ───────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct VerificationIdentity {
    pub identity_verified: String,
    pub verification_method: String,
    pub verification_document_type: String,
    pub verification_document_number: String,
    pub verified_by_name: String,
    pub verification_date: String,
}

// ─── Signatures & Consent (Step 9) ──────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SignaturesConsent {
    pub patient_signature: String,
    pub patient_signature_date: String,
    pub witness_name: String,
    pub witness_signature: String,
    pub witness_signature_date: String,
    pub guardian_name: String,
    pub guardian_relationship: String,
    pub guardian_signature: String,
    pub informed_consent_given: String,
}

// ─── Clinical Review (Step 10) ──────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ClinicalReview {
    pub reviewer_name: String,
    pub reviewer_title: String,
    pub review_date: String,
    pub review_decision: String,
    pub review_notes: String,
    pub redactions_required: String,
    pub redaction_details: String,
    pub compliance_confirmed: String,
}

// ─── Assessment Data (all sections) ─────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentData {
    pub patient_information: PatientInformation,
    pub requesting_party: RequestingParty,
    pub records_specification: RecordsSpecification,
    pub purpose_of_release: PurposeOfRelease,
    pub authorization_scope: AuthorizationScope,
    pub sensitive_information: SensitiveInformation,
    pub duration_expiry: DurationExpiry,
    pub verification_identity: VerificationIdentity,
    pub signatures_consent: SignaturesConsent,
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
    pub completion_level: CompletionLevel,
    pub completion_score: f64,
    pub fired_rules: Vec<FiredRule>,
    pub additional_flags: Vec<AdditionalFlag>,
    pub timestamp: String,
}
