use super::types::AssessmentData;
use super::utils::{is_consent_given, is_identity_verified, includes_sensitive_info};

/// A declarative release permission validation rule.
pub struct ReleaseRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All release rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<ReleaseRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        ReleaseRule {
            id: "MRR-001",
            category: "Consent",
            description: "Patient informed consent not given",
            concern_level: "high",
            evaluate: |d| !is_consent_given(d),
        },
        ReleaseRule {
            id: "MRR-002",
            category: "Identity",
            description: "Patient identity not verified",
            concern_level: "high",
            evaluate: |d| !is_identity_verified(d),
        },
        ReleaseRule {
            id: "MRR-003",
            category: "Signature",
            description: "Patient signature missing",
            concern_level: "high",
            evaluate: |d| d.signatures_consent.patient_signature.trim().is_empty(),
        },
        ReleaseRule {
            id: "MRR-004",
            category: "Authorization",
            description: "Authorization expiry date not set",
            concern_level: "high",
            evaluate: |d| d.duration_expiry.authorization_expiry_date.trim().is_empty(),
        },
        ReleaseRule {
            id: "MRR-005",
            category: "Review",
            description: "Clinical review decision is denied",
            concern_level: "high",
            evaluate: |d| d.clinical_review.review_decision == "denied",
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        ReleaseRule {
            id: "MRR-006",
            category: "Sensitive",
            description: "Sensitive information included without explicit acknowledgement",
            concern_level: "medium",
            evaluate: |d| {
                includes_sensitive_info(d)
                    && d.sensitive_information.sensitive_info_acknowledgement != "yes"
            },
        },
        ReleaseRule {
            id: "MRR-007",
            category: "Records",
            description: "No specific record type selected",
            concern_level: "medium",
            evaluate: |d| d.records_specification.record_type.trim().is_empty(),
        },
        ReleaseRule {
            id: "MRR-008",
            category: "Purpose",
            description: "Purpose of release not specified",
            concern_level: "medium",
            evaluate: |d| d.purpose_of_release.primary_purpose.trim().is_empty(),
        },
        ReleaseRule {
            id: "MRR-009",
            category: "Requester",
            description: "Requesting party name missing",
            concern_level: "medium",
            evaluate: |d| d.requesting_party.requester_name.trim().is_empty(),
        },
        ReleaseRule {
            id: "MRR-010",
            category: "Requester",
            description: "Requester relationship to patient not specified",
            concern_level: "medium",
            evaluate: |d| d.requesting_party.requester_relationship.trim().is_empty(),
        },
        ReleaseRule {
            id: "MRR-011",
            category: "Authorization",
            description: "Releasing facility not identified",
            concern_level: "medium",
            evaluate: |d| d.authorization_scope.releasing_facility_name.trim().is_empty(),
        },
        ReleaseRule {
            id: "MRR-012",
            category: "Authorization",
            description: "Receiving facility not identified",
            concern_level: "medium",
            evaluate: |d| d.authorization_scope.receiving_facility_name.trim().is_empty(),
        },
        ReleaseRule {
            id: "MRR-013",
            category: "Records",
            description: "Date range for records not specified",
            concern_level: "medium",
            evaluate: |d| {
                d.records_specification.date_range_start.trim().is_empty()
                    || d.records_specification.date_range_end.trim().is_empty()
            },
        },
        ReleaseRule {
            id: "MRR-014",
            category: "Review",
            description: "Clinical review pending - not yet decided",
            concern_level: "medium",
            evaluate: |d| d.clinical_review.review_decision == "pendingReview",
        },
        ReleaseRule {
            id: "MRR-015",
            category: "Redaction",
            description: "Redactions required but details not provided",
            concern_level: "medium",
            evaluate: |d| {
                d.clinical_review.redactions_required == "yes"
                    && d.clinical_review.redaction_details.trim().is_empty()
            },
        },
        // ─── LOW CONCERN ────────────────────────────────────────
        ReleaseRule {
            id: "MRR-016",
            category: "Verification",
            description: "Witness signature provided for additional verification",
            concern_level: "low",
            evaluate: |d| !d.signatures_consent.witness_signature.trim().is_empty(),
        },
        ReleaseRule {
            id: "MRR-017",
            category: "Review",
            description: "Clinical review approved with no redactions needed",
            concern_level: "low",
            evaluate: |d| {
                d.clinical_review.review_decision == "approved"
                    && d.clinical_review.redactions_required != "yes"
            },
        },
        ReleaseRule {
            id: "MRR-018",
            category: "Compliance",
            description: "Compliance confirmed by reviewer",
            concern_level: "low",
            evaluate: |d| d.clinical_review.compliance_confirmed == "yes",
        },
        ReleaseRule {
            id: "MRR-019",
            category: "Authorization",
            description: "Revocation rights understood by patient",
            concern_level: "low",
            evaluate: |d| d.duration_expiry.revocation_understood == "yes",
        },
        ReleaseRule {
            id: "MRR-020",
            category: "Identity",
            description: "Identity verified with government-issued ID",
            concern_level: "low",
            evaluate: |d| {
                d.verification_identity.identity_verified == "yes"
                    && d.verification_identity.verification_document_type == "governmentId"
            },
        },
    ]
}
