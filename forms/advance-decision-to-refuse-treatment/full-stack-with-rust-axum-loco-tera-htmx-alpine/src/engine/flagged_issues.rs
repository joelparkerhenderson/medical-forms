use super::types::{AdditionalFlag, AssessmentData};
use super::utils::has_life_sustaining_refusal;

/// Detects additional flags that should be highlighted for clinical and legal review,
/// independent of validity status. These are safety-critical and legally-critical alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── CRITICAL: Life-sustaining treatment without witness ─────
    if has_life_sustaining_refusal(data)
        && data.legal_signatures.life_sustaining_witness_signature != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-LS-001".to_string(),
            category: "Life-Sustaining Treatment".to_string(),
            message: "CRITICAL: Life-sustaining treatment refusal without witness signature - ADRT is NOT legally valid".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── CRITICAL: Missing "even if life at risk" statement ──────
    if has_life_sustaining_refusal(data)
        && data.legal_signatures.life_sustaining_written_statement != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-LS-002".to_string(),
            category: "Life-Sustaining Treatment".to_string(),
            message: "CRITICAL: Missing written \"even if life is at risk\" statement - ADRT is NOT legally valid for life-sustaining treatment".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── HIGH: Unsigned document ─────────────────────────────────
    if data.legal_signatures.patient_signature != "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SIG-001".to_string(),
            category: "Signature".to_string(),
            message: "Document has not been signed by the patient".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── HIGH: No capacity assessment ────────────────────────────
    if data.capacity_declaration.confirms_capacity != "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-CAP-001".to_string(),
            category: "Mental Capacity".to_string(),
            message: "No confirmation of mental capacity - ADRT validity may be challenged".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── HIGH: No professional capacity assessment ───────────────
    if data.capacity_declaration.professional_capacity_assessment != "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-CAP-002".to_string(),
            category: "Mental Capacity".to_string(),
            message: "No professional capacity assessment documented - recommended for legal robustness".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── HIGH: Potential conflict with LPA ────────────────────────
    if data.lasting_power_of_attorney.has_lpa == "yes"
        && data.lasting_power_of_attorney.relationship_between_adrt_and_lpa.trim().is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-LPA-001".to_string(),
            category: "Lasting Power of Attorney".to_string(),
            message: "LPA exists but relationship between ADRT and LPA has not been described - potential conflict".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── HIGH: LPA registered after ADRT could override it ───────
    if data.lasting_power_of_attorney.has_lpa == "yes"
        && (data.lasting_power_of_attorney.lpa_type == "health-and-welfare"
            || data.lasting_power_of_attorney.lpa_type == "both")
        && data.lasting_power_of_attorney.lpa_registered == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-LPA-002".to_string(),
            category: "Lasting Power of Attorney".to_string(),
            message: "Health and Welfare LPA is registered - if LPA was granted after this ADRT, the LPA attorney may have authority to consent to the refused treatment".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── MEDIUM: No review date ──────────────────────────────────
    if data.healthcare_professional_review.review_date.is_empty() {
        flags.push(AdditionalFlag {
            id: "FLAG-REV-001".to_string(),
            category: "Healthcare Professional Review".to_string(),
            message: "No healthcare professional review date recorded".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── MEDIUM: Clinician has concerns ──────────────────────────
    if data.healthcare_professional_review.any_concerns == "yes" {
        let details = if data.healthcare_professional_review.concerns_details.is_empty() {
            "details not specified"
        } else {
            &data.healthcare_professional_review.concerns_details
        };
        flags.push(AdditionalFlag {
            id: "FLAG-REV-002".to_string(),
            category: "Healthcare Professional Review".to_string(),
            message: format!("Clinician has raised concerns: {details}"),
            priority: "medium".to_string(),
        });
    }

    // ─── MEDIUM: No witness details ──────────────────────────────
    if data.legal_signatures.witness_signature == "yes"
        && data.legal_signatures.witness_address.trim().is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-WIT-001".to_string(),
            category: "Witness".to_string(),
            message: "Witness has signed but address has not been recorded".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── MEDIUM: Possible undue influence not ruled out ──────────
    if data.capacity_declaration.no_undue_influence != "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-CAP-003".to_string(),
            category: "Mental Capacity".to_string(),
            message: "Undue influence has not been explicitly ruled out".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── MEDIUM: Exceptions not addressed ────────────────────────
    if data.exceptions_conditions.has_exceptions.is_empty() {
        flags.push(AdditionalFlag {
            id: "FLAG-EXC-001".to_string(),
            category: "Exceptions".to_string(),
            message: "No declaration made about whether exceptions apply".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── LOW: GP not recorded ────────────────────────────────────
    if data.personal_information.gp_name.trim().is_empty() {
        flags.push(AdditionalFlag {
            id: "FLAG-GP-001".to_string(),
            category: "Personal Information".to_string(),
            message: "GP details not recorded - recommended for clinical communication".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── LOW: NHS number not recorded ────────────────────────────
    if data.personal_information.nhs_number.trim().is_empty() {
        flags.push(AdditionalFlag {
            id: "FLAG-NHS-001".to_string(),
            category: "Personal Information".to_string(),
            message: "NHS number not recorded - may affect identification".to_string(),
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
