use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the completion score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Psychotherapy notes included ────────────────────────
    if data.sensitive_information.include_psychotherapy_notes == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SENS-001".to_string(),
            category: "Sensitive Information".to_string(),
            message: "Psychotherapy notes requested - requires separate specific authorization under HIPAA".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── HIV/AIDS records included ───────────────────────────
    if data.sensitive_information.include_hiv_aids == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SENS-002".to_string(),
            category: "Sensitive Information".to_string(),
            message: "HIV/AIDS records requested - state-specific consent requirements may apply".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Substance abuse records ─────────────────────────────
    if data.sensitive_information.include_substance_abuse == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SENS-003".to_string(),
            category: "Sensitive Information".to_string(),
            message: "Substance abuse records requested - 42 CFR Part 2 restrictions may apply".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Court-ordered release ───────────────────────────────
    if data.purpose_of_release.is_court_ordered == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-LEGAL-001".to_string(),
            category: "Legal".to_string(),
            message: "Court-ordered release - verify court order documentation is on file".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── No expiry date set ──────────────────────────────────
    if data.duration_expiry.authorization_expiry_date.trim().is_empty() {
        flags.push(AdditionalFlag {
            id: "FLAG-AUTH-001".to_string(),
            category: "Authorization".to_string(),
            message: "No expiry date set - authorization should have a definite expiry".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Auto-renew enabled ──────────────────────────────────
    if data.duration_expiry.auto_renew == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-AUTH-002".to_string(),
            category: "Authorization".to_string(),
            message: "Auto-renewal enabled - ensure patient is aware of ongoing release".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Urgent request ──────────────────────────────────────
    if data.records_specification.urgency_level == "urgent" {
        flags.push(AdditionalFlag {
            id: "FLAG-REQ-001".to_string(),
            category: "Request".to_string(),
            message: "Urgent records release requested - expedited processing needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Guardian signing on behalf ──────────────────────────
    if !data.signatures_consent.guardian_name.trim().is_empty() {
        flags.push(AdditionalFlag {
            id: "FLAG-CONSENT-001".to_string(),
            category: "Consent".to_string(),
            message: "Guardian signing on patient's behalf - verify legal authority documentation".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Redactions required ─────────────────────────────────
    if data.clinical_review.redactions_required == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-REVIEW-001".to_string(),
            category: "Review".to_string(),
            message: "Redactions required before release - review redaction details".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Partial approval ────────────────────────────────────
    if data.clinical_review.review_decision == "partialApproval" {
        flags.push(AdditionalFlag {
            id: "FLAG-REVIEW-002".to_string(),
            category: "Review".to_string(),
            message: "Partial approval granted - only specified records should be released".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Genetic testing records ─────────────────────────────
    if data.sensitive_information.include_genetic_testing == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SENS-004".to_string(),
            category: "Sensitive Information".to_string(),
            message: "Genetic testing records requested - GINA protections may apply".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Legal purpose without case number ───────────────────
    if data.purpose_of_release.primary_purpose == "legal"
        && data.purpose_of_release.legal_case_number.trim().is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-LEGAL-002".to_string(),
            category: "Legal".to_string(),
            message: "Legal purpose indicated but no case number provided".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Insurance purpose without claim number ──────────────
    if data.purpose_of_release.primary_purpose == "insurance"
        && data.purpose_of_release.insurance_claim_number.trim().is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-LEGAL-003".to_string(),
            category: "Insurance".to_string(),
            message: "Insurance purpose indicated but no claim number provided".to_string(),
            priority: "low".to_string(),
        });
    }

    // Sort: high > medium > low
    flags.sort_by_key(|f| match f.priority.as_str() {
        "high" => 0,
        "medium" => 1,
        "low" => 2,
        _ => 3,
    });

    flags
}
