use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the satisfaction score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Excessive appointment wait ─────────────────────────
    if data.wait_time_access.appointment_wait_days == "moreThan30" {
        flags.push(AdditionalFlag {
            id: "FLAG-WAIT-001".to_string(),
            category: "Wait Time".to_string(),
            message: "Appointment wait exceeded 30 days - review scheduling capacity".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Excessive waiting room time ────────────────────────
    if data.wait_time_access.waiting_room_time == "moreThan60" {
        flags.push(AdditionalFlag {
            id: "FLAG-WAIT-002".to_string(),
            category: "Wait Time".to_string(),
            message: "Waiting room time exceeded 60 minutes".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Provider not listening ─────────────────────────────
    if data.communication.provider_listening == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-COMM-001".to_string(),
            category: "Communication".to_string(),
            message: "Provider listening rated Very Poor - urgent communication concern".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Questions not encouraged ───────────────────────────
    if matches!(data.communication.questions_encouraged, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-COMM-002".to_string(),
            category: "Communication".to_string(),
            message: "Patient felt questions were not encouraged".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── No confidence in provider ──────────────────────────
    if data.care_quality.confidence_in_provider == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-CARE-001".to_string(),
            category: "Care Quality".to_string(),
            message: "Patient has no confidence in provider - review required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Not involved in decisions ──────────────────────────
    if matches!(data.care_quality.involvement_in_decisions, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-CARE-002".to_string(),
            category: "Care Quality".to_string(),
            message: "Patient felt excluded from care decisions".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Reception discourtesy ──────────────────────────────
    if data.staff_interaction.reception_courtesy == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-STAFF-001".to_string(),
            category: "Staff".to_string(),
            message: "Reception courtesy rated Very Poor".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Cleanliness concern ────────────────────────────────
    if data.environment.facility_cleanliness == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-ENV-001".to_string(),
            category: "Environment".to_string(),
            message: "Facility cleanliness rated Very Poor - infection control review needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Noise complaint ────────────────────────────────────
    if matches!(data.environment.noise_level, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-ENV-002".to_string(),
            category: "Environment".to_string(),
            message: "Excessive noise reported - review environment".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Medication explanation missing ─────────────────────
    if data.medication_treatment.medication_explanation == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-001".to_string(),
            category: "Medication".to_string(),
            message: "Medication not explained to patient".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Warning signs not explained ────────────────────────
    if matches!(data.discharge_follow_up.warning_signs_explained, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-DISC-001".to_string(),
            category: "Discharge".to_string(),
            message: "Warning signs not adequately explained at discharge".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── No follow-up plan ──────────────────────────────────
    if data.discharge_follow_up.follow_up_appointment_scheduled == "no"
        && matches!(data.discharge_follow_up.follow_up_plan_explained, Some(1..=2))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-DISC-002".to_string(),
            category: "Discharge".to_string(),
            message: "No follow-up appointment and poor follow-up explanation".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── NPS detractor with comments ────────────────────────
    if matches!(data.overall_experience.likelihood_to_recommend, Some(0..=6))
        && (!data.demographics_comments.additional_comments.trim().is_empty()
            || !data.demographics_comments.improvement_suggestions.trim().is_empty())
    {
        flags.push(AdditionalFlag {
            id: "FLAG-NPS-001".to_string(),
            category: "NPS".to_string(),
            message: "Detractor/passive with actionable feedback - review comments".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Disability reported ────────────────────────────────
    if data.demographics_comments.has_disability == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-DEMO-001".to_string(),
            category: "Accessibility".to_string(),
            message: "Patient has disability - review accessibility of services".to_string(),
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
