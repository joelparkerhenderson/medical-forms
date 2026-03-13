use super::types::{AdditionalFlag, AssessmentData};
use super::utils::{is_filled, is_yes};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the completeness status. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // FLAG-CAP-001: Capacity not confirmed by clinician
    if !is_yes(&data.healthcare_professional_review.capacity_confirmed) {
        flags.push(AdditionalFlag {
            id: "FLAG-CAP-001".to_string(),
            category: "Capacity".to_string(),
            message: "Capacity not confirmed by clinician — statement validity uncertain".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-CONT-001: No nominated contact person
    if !is_filled(&data.nominated_persons.primary_contact_name) {
        flags.push(AdditionalFlag {
            id: "FLAG-CONT-001".to_string(),
            category: "Contact".to_string(),
            message: "No nominated contact person identified".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-EOL-001: End of life preferences absent
    if !is_filled(&data.end_of_life_preferences.preferred_place_of_death)
        && !is_filled(&data.end_of_life_preferences.organ_donation)
        && !is_filled(&data.end_of_life_preferences.funeral_wishes)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-EOL-001".to_string(),
            category: "End of Life".to_string(),
            message: "End of life preferences not documented".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-ADRT-001: Potential conflict with existing ADRT
    {
        let resus = data.care_preferences.resuscitation_wishes.to_lowercase();
        let ventilation = data.care_preferences.ventilation_view.to_lowercase();
        if (resus.contains("no") || resus.contains("refuse"))
            && (ventilation.contains("yes") || ventilation.contains("accept"))
        {
            flags.push(AdditionalFlag {
                id: "FLAG-ADRT-001".to_string(),
                category: "ADRT".to_string(),
                message: "Potential conflict between resuscitation wishes and ventilation preferences — review for ADRT consistency".to_string(),
                priority: "high".to_string(),
            });
        }
    }

    // FLAG-LPA-001: LPA exists but not coordinated
    if is_yes(&data.nominated_persons.has_lpa)
        && !is_filled(&data.nominated_persons.lpa_details)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-LPA-001".to_string(),
            category: "LPA".to_string(),
            message: "LPA exists but details not recorded — coordinate with attorney".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-SIG-001: Statement unsigned
    if !is_yes(&data.signatures_verification.patient_signature) {
        flags.push(AdditionalFlag {
            id: "FLAG-SIG-001".to_string(),
            category: "Signatures".to_string(),
            message: "Statement not signed by patient".to_string(),
            priority: "high".to_string(),
        });
    }

    // FLAG-REV-001: Statement not reviewed by clinician
    if !is_filled(&data.healthcare_professional_review.reviewer_name) {
        flags.push(AdditionalFlag {
            id: "FLAG-REV-001".to_string(),
            category: "Review".to_string(),
            message: "Statement not reviewed by a healthcare professional".to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-REV-002: Statement over 12 months old (review needed)
    if is_filled(&data.healthcare_professional_review.reviewer_name)
        && !is_filled(&data.healthcare_professional_review.review_date)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-REV-002".to_string(),
            category: "Review".to_string(),
            message: "Review date not recorded — statement may be out of date".to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-COMM-001: Communication needs unaddressed
    if !is_filled(&data.communication_preferences.preferred_language)
        && !is_filled(&data.communication_preferences.who_to_inform)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-COMM-001".to_string(),
            category: "Communication".to_string(),
            message: "Communication preferences not documented".to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-LANG-001: Interpreter needed but not arranged
    if is_yes(&data.communication_preferences.interpreter_needed)
        && !is_filled(&data.communication_preferences.communication_aids)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-LANG-001".to_string(),
            category: "Language".to_string(),
            message: "Interpreter needed but communication aids not documented".to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-SPIR-001: Spiritual/cultural needs not assessed
    if !is_filled(&data.spiritual_cultural.religious_practices)
        && !is_filled(&data.spiritual_cultural.dietary_restrictions)
        && !is_filled(&data.spiritual_cultural.cultural_practices)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-SPIR-001".to_string(),
            category: "Spiritual/Cultural".to_string(),
            message: "Spiritual and cultural needs not assessed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-PAIN-001: Pain management preferences not documented
    if !is_filled(&data.care_preferences.pain_management_preference) {
        flags.push(AdditionalFlag {
            id: "FLAG-PAIN-001".to_string(),
            category: "Pain Management".to_string(),
            message: "Pain management preferences not documented".to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-RESUS-001: Resuscitation wishes unclear
    if !is_filled(&data.care_preferences.resuscitation_wishes) {
        flags.push(AdditionalFlag {
            id: "FLAG-RESUS-001".to_string(),
            category: "Resuscitation".to_string(),
            message: "Resuscitation wishes not documented".to_string(),
            priority: "medium".to_string(),
        });
    }

    // FLAG-WIT-001: No witness signature
    if !is_yes(&data.signatures_verification.witness_signature) {
        flags.push(AdditionalFlag {
            id: "FLAG-WIT-001".to_string(),
            category: "Witness".to_string(),
            message: "No witness signature on statement".to_string(),
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
