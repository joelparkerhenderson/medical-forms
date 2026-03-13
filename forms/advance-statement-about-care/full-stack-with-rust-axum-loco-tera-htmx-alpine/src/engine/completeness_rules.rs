use super::types::AssessmentData;
use super::utils::{is_filled, is_yes};

/// A declarative advance statement concern rule.
pub struct CompletenessRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All completeness rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<CompletenessRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        CompletenessRule {
            id: "AS-001",
            category: "Nominated Persons",
            description: "No nominated contact person identified",
            concern_level: "high",
            evaluate: |d| !is_filled(&d.nominated_persons.primary_contact_name),
        },
        CompletenessRule {
            id: "AS-002",
            category: "End of Life",
            description: "End of life wishes absent",
            concern_level: "high",
            evaluate: |d| {
                !is_filled(&d.end_of_life_preferences.preferred_place_of_death)
                    && !is_filled(&d.end_of_life_preferences.organ_donation)
                    && !is_filled(&d.end_of_life_preferences.funeral_wishes)
            },
        },
        CompletenessRule {
            id: "AS-003",
            category: "Capacity",
            description: "No capacity confirmation by clinician",
            concern_level: "high",
            evaluate: |d| !is_yes(&d.healthcare_professional_review.capacity_confirmed),
        },
        CompletenessRule {
            id: "AS-004",
            category: "ADRT",
            description: "Statement may contradict existing ADRT — resuscitation wishes conflict with care preferences",
            concern_level: "high",
            evaluate: |d| {
                let resus = d.care_preferences.resuscitation_wishes.to_lowercase();
                let ventilation = d.care_preferences.ventilation_view.to_lowercase();
                // Flag if there are contradictory signals
                (resus.contains("no") || resus.contains("refuse"))
                    && (ventilation.contains("yes") || ventilation.contains("accept"))
            },
        },
        CompletenessRule {
            id: "AS-005",
            category: "Signatures",
            description: "Statement unsigned by patient",
            concern_level: "high",
            evaluate: |d| !is_yes(&d.signatures_verification.patient_signature),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        CompletenessRule {
            id: "AS-006",
            category: "Care Preferences",
            description: "Care preferences section empty",
            concern_level: "medium",
            evaluate: |d| {
                !is_filled(&d.care_preferences.preferred_care_location)
                    && !is_filled(&d.care_preferences.pain_management_preference)
                    && !is_filled(&d.care_preferences.treatment_goals)
            },
        },
        CompletenessRule {
            id: "AS-007",
            category: "Communication",
            description: "Communication needs unaddressed",
            concern_level: "medium",
            evaluate: |d| {
                !is_filled(&d.communication_preferences.preferred_language)
                    && !is_filled(&d.communication_preferences.who_to_inform)
            },
        },
        CompletenessRule {
            id: "AS-008",
            category: "Spiritual/Cultural",
            description: "No spiritual or cultural assessment completed",
            concern_level: "medium",
            evaluate: |d| {
                !is_filled(&d.spiritual_cultural.religious_practices)
                    && !is_filled(&d.spiritual_cultural.dietary_restrictions)
                    && !is_filled(&d.spiritual_cultural.cultural_practices)
            },
        },
        CompletenessRule {
            id: "AS-009",
            category: "Daily Living",
            description: "Daily living preferences incomplete",
            concern_level: "medium",
            evaluate: |d| {
                d.daily_living_preferences.routine_importance.is_none()
                    && !is_filled(&d.daily_living_preferences.food_preferences)
                    && !is_filled(&d.daily_living_preferences.personal_care_wishes)
            },
        },
        CompletenessRule {
            id: "AS-010",
            category: "LPA",
            description: "LPA exists but not referenced in detail",
            concern_level: "medium",
            evaluate: |d| {
                is_yes(&d.nominated_persons.has_lpa) && !is_filled(&d.nominated_persons.lpa_details)
            },
        },
        CompletenessRule {
            id: "AS-011",
            category: "Pain Management",
            description: "Pain management preferences not discussed",
            concern_level: "medium",
            evaluate: |d| !is_filled(&d.care_preferences.pain_management_preference),
        },
        CompletenessRule {
            id: "AS-012",
            category: "Resuscitation",
            description: "Resuscitation wishes unclear",
            concern_level: "medium",
            evaluate: |d| !is_filled(&d.care_preferences.resuscitation_wishes),
        },
        CompletenessRule {
            id: "AS-013",
            category: "Review",
            description: "No clinician review completed",
            concern_level: "medium",
            evaluate: |d| !is_filled(&d.healthcare_professional_review.reviewer_name),
        },
        CompletenessRule {
            id: "AS-014",
            category: "Witness",
            description: "No witness signature present",
            concern_level: "medium",
            evaluate: |d| !is_yes(&d.signatures_verification.witness_signature),
        },
        CompletenessRule {
            id: "AS-015",
            category: "Review Date",
            description: "Statement may be over 12 months old — review needed",
            concern_level: "medium",
            evaluate: |d| {
                // Flag if review date is empty (cannot verify currency)
                is_filled(&d.healthcare_professional_review.reviewer_name)
                    && !is_filled(&d.healthcare_professional_review.review_date)
            },
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        CompletenessRule {
            id: "AS-016",
            category: "Completeness",
            description: "All sections completed",
            concern_level: "low",
            evaluate: |d| {
                is_filled(&d.patient_information.full_name)
                    && is_filled(&d.personal_values.important_to_me)
                    && is_filled(&d.care_preferences.preferred_care_location)
                    && is_filled(&d.communication_preferences.preferred_language)
                    && is_filled(&d.nominated_persons.primary_contact_name)
                    && is_filled(&d.end_of_life_preferences.preferred_place_of_death)
                    && is_filled(&d.healthcare_professional_review.reviewer_name)
                    && is_yes(&d.signatures_verification.patient_signature)
            },
        },
        CompletenessRule {
            id: "AS-017",
            category: "Review",
            description: "Clinician reviewed and confirmed accuracy",
            concern_level: "low",
            evaluate: |d| {
                is_filled(&d.healthcare_professional_review.reviewer_name)
                    && is_yes(&d.healthcare_professional_review.statement_accurate)
            },
        },
        CompletenessRule {
            id: "AS-018",
            category: "Review Date",
            description: "Recently updated — review date recorded",
            concern_level: "low",
            evaluate: |d| {
                is_filled(&d.healthcare_professional_review.reviewer_name)
                    && is_filled(&d.healthcare_professional_review.review_date)
            },
        },
        CompletenessRule {
            id: "AS-019",
            category: "Patient",
            description: "Patient satisfied with statement — reviewed with patient confirmed",
            concern_level: "low",
            evaluate: |d| is_yes(&d.signatures_verification.reviewed_with_patient),
        },
        CompletenessRule {
            id: "AS-020",
            category: "Nominated Persons",
            description: "Nominated persons confirmed with contact details",
            concern_level: "low",
            evaluate: |d| {
                is_filled(&d.nominated_persons.primary_contact_name)
                    && is_filled(&d.nominated_persons.primary_contact_phone)
            },
        },
    ]
}
