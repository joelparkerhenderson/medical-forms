use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the consent status. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Capacity concerns ──────────────────────────────────
    if data.capacity_assessment.patient_has_capacity == "no"
        || data.capacity_assessment.patient_has_capacity == "uncertain"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CAP-001".to_string(),
            category: "Capacity".to_string(),
            message: "Patient capacity concerns identified - consider best interest assessment"
                .to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Any capacity item rated low ─────────────────────────
    if matches!(data.capacity_assessment.can_understand_information, Some(1..=2))
        || matches!(data.capacity_assessment.can_retain_information, Some(1..=2))
        || matches!(data.capacity_assessment.can_weigh_information, Some(1..=2))
        || matches!(data.capacity_assessment.can_communicate_decision, Some(1..=2))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CAP-002".to_string(),
            category: "Capacity".to_string(),
            message: "One or more capacity criteria rated poor - specialist assessment may be needed"
                .to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Interpreter needed ──────────────────────────────────
    if data.interpreter_requirements.interpreter_needed == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-INT-001".to_string(),
            category: "Communication".to_string(),
            message: "Interpreter required - ensure qualified interpreter present for consent"
                .to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Second opinion requested ────────────────────────────
    if data.patient_understanding.second_opinion_offered == "requested" {
        flags.push(AdditionalFlag {
            id: "FLAG-OPN-001".to_string(),
            category: "Patient Rights".to_string(),
            message: "Patient has requested a second opinion - consent may need to be deferred"
                .to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Blood product refusal ───────────────────────────────
    if data.additional_considerations.blood_product_consent == "refused" {
        flags.push(AdditionalFlag {
            id: "FLAG-BLD-001".to_string(),
            category: "Blood Products".to_string(),
            message: "Patient has refused blood products - ensure surgical plan accounts for this"
                .to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Emergency consent ───────────────────────────────────
    if data.procedure_details.procedure_type == "emergency" {
        flags.push(AdditionalFlag {
            id: "FLAG-EMG-001".to_string(),
            category: "Emergency".to_string(),
            message: "Emergency procedure - verify consent obtained under time constraints is valid"
                .to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Minor consent ───────────────────────────────────────
    if !data.signatures.parent_guardian_name.trim().is_empty() {
        flags.push(AdditionalFlag {
            id: "FLAG-MIN-001".to_string(),
            category: "Minor/Dependent".to_string(),
            message: "Consent involves parent/guardian - verify legal authority to consent"
                .to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Advance directive conflict ──────────────────────────
    if data.additional_considerations.advance_directive_exists == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-ADV-001".to_string(),
            category: "Advance Directive".to_string(),
            message: "Advance directive exists - verify consent is consistent with directive"
                .to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Communication aids needed ───────────────────────────
    if data.interpreter_requirements.communication_aids_needed == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-COM-001".to_string(),
            category: "Communication".to_string(),
            message: "Communication aids required - ensure appropriate support provided"
                .to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Questions not answered satisfactorily ───────────────
    if matches!(
        data.patient_understanding.questions_answered_satisfactorily,
        Some(1..=2)
    ) {
        flags.push(AdditionalFlag {
            id: "FLAG-QST-001".to_string(),
            category: "Understanding".to_string(),
            message: "Patient questions not answered satisfactorily - further discussion needed"
                .to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Religious/cultural considerations ───────────────────
    if !data
        .additional_considerations
        .religious_cultural_considerations
        .trim()
        .is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-REL-001".to_string(),
            category: "Cultural".to_string(),
            message: "Religious/cultural considerations noted - review impact on treatment plan"
                .to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Photography consent declined ────────────────────────
    if data.additional_considerations.photography_consent == "refused" {
        flags.push(AdditionalFlag {
            id: "FLAG-PHO-001".to_string(),
            category: "Photography".to_string(),
            message: "Patient declined photography consent - ensure no images taken during procedure"
                .to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Teaching consent declined ───────────────────────────
    if data.additional_considerations.teaching_consent == "refused" {
        flags.push(AdditionalFlag {
            id: "FLAG-TCH-001".to_string(),
            category: "Teaching".to_string(),
            message: "Patient declined teaching involvement - no trainees during procedure"
                .to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Patient condition changed on day ────────────────────
    if data.clinical_verification.patient_condition_changed == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-CHG-001".to_string(),
            category: "Clinical".to_string(),
            message: "Patient condition changed since consent - re-consent may be required"
                .to_string(),
            priority: "high".to_string(),
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
