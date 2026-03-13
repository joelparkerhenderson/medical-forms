use super::types::AssessmentData;

/// Returns a human-readable label for a completeness status.
pub fn completeness_status_label(status: &str) -> &str {
    match status {
        "draft" => "Draft",
        "incomplete" => "Incomplete",
        "complete" => "Complete",
        "reviewed" => "Reviewed",
        _ => "Unknown",
    }
}

/// Check if a text field is filled (non-empty after trimming).
pub fn is_filled(s: &str) -> bool {
    !s.trim().is_empty()
}

/// Check if a yes/no field is answered "yes".
pub fn is_yes(s: &str) -> bool {
    s.trim().eq_ignore_ascii_case("yes")
}

/// Count how many of the key sections are substantially completed.
/// Key sections: personal values, care preferences, communication preferences, nominated persons.
pub fn count_completed_sections(data: &AssessmentData) -> u32 {
    let mut count: u32 = 0;

    // Section 1: Patient Information — need at least name and DOB
    if is_filled(&data.patient_information.full_name)
        && is_filled(&data.patient_information.date_of_birth)
    {
        count += 1;
    }

    // Section 2: Personal Values — need at least important_to_me
    if is_filled(&data.personal_values.important_to_me) {
        count += 1;
    }

    // Section 3: Care Preferences — need at least preferred_care_location
    if is_filled(&data.care_preferences.preferred_care_location) {
        count += 1;
    }

    // Section 4: Communication Preferences — need at least preferred_language
    if is_filled(&data.communication_preferences.preferred_language) {
        count += 1;
    }

    // Section 5: Daily Living Preferences — need at least one field
    if is_filled(&data.daily_living_preferences.food_preferences)
        || data.daily_living_preferences.routine_importance.is_some()
    {
        count += 1;
    }

    // Section 6: Spiritual & Cultural — need at least one field
    if is_filled(&data.spiritual_cultural.religious_practices)
        || is_filled(&data.spiritual_cultural.dietary_restrictions)
    {
        count += 1;
    }

    // Section 7: Nominated Persons — need primary contact name
    if is_filled(&data.nominated_persons.primary_contact_name) {
        count += 1;
    }

    // Section 8: End of Life Preferences — need at least preferred place of death
    if is_filled(&data.end_of_life_preferences.preferred_place_of_death) {
        count += 1;
    }

    // Section 9: Healthcare Professional Review — need reviewer name and capacity confirmed
    if is_filled(&data.healthcare_professional_review.reviewer_name)
        && is_yes(&data.healthcare_professional_review.capacity_confirmed)
    {
        count += 1;
    }

    // Section 10: Signatures — need patient signature
    if is_yes(&data.signatures_verification.patient_signature) {
        count += 1;
    }

    count
}

/// Determine completeness status from assessment data.
/// - draft: fewer than 2 sections completed
/// - incomplete: 2-7 sections completed
/// - complete: 8-10 sections completed but not reviewed by clinician
/// - reviewed: complete AND reviewed by clinician with capacity confirmed
pub fn determine_completeness(data: &AssessmentData) -> &'static str {
    let sections = count_completed_sections(data);

    let clinician_reviewed = is_filled(&data.healthcare_professional_review.reviewer_name)
        && is_yes(&data.healthcare_professional_review.capacity_confirmed)
        && is_yes(&data.healthcare_professional_review.statement_accurate);

    if sections >= 8 && clinician_reviewed {
        "reviewed"
    } else if sections >= 8 {
        "complete"
    } else if sections >= 2 {
        "incomplete"
    } else {
        "draft"
    }
}
