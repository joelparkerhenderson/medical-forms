use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of risk level. These are safety-critical or administrative alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Multiple allergies ─────────────────────────────────
    if data.allergies.len() >= 3 {
        flags.push(AdditionalFlag {
            id: "FLAG-ALLERGY-001".to_string(),
            category: "Allergy".to_string(),
            message: format!(
                "{} allergies documented - review for cross-reactivity",
                data.allergies.len()
            ),
            priority: "medium".to_string(),
        });
    }

    // ─── Anaphylaxis history ────────────────────────────────
    for (i, allergy) in data.allergies.iter().enumerate() {
        if allergy.severity == "anaphylaxis" {
            flags.push(AdditionalFlag {
                id: format!("FLAG-ALLERGY-ANAPH-{i}"),
                category: "Allergy".to_string(),
                message: format!("ANAPHYLAXIS history: {}", allergy.allergen),
                priority: "high".to_string(),
            });
        }
    }

    // ─── Latex allergy ──────────────────────────────────────
    if data.allergies.iter().any(|a| a.allergy_type == "latex") {
        flags.push(AdditionalFlag {
            id: "FLAG-ALLERGY-LATEX".to_string(),
            category: "Allergy".to_string(),
            message: "Latex allergy - ensure latex-free environment".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Polypharmacy ───────────────────────────────────────
    if data.medications.len() >= 5 {
        flags.push(AdditionalFlag {
            id: "FLAG-MEDS-001".to_string(),
            category: "Medications".to_string(),
            message: format!(
                "Polypharmacy: {} medications - review for interactions",
                data.medications.len()
            ),
            priority: "medium".to_string(),
        });
    }

    // ─── Multiple chronic conditions ────────────────────────
    if data.medical_history.chronic_conditions.len() >= 3 {
        flags.push(AdditionalFlag {
            id: "FLAG-CHRONIC-001".to_string(),
            category: "Medical History".to_string(),
            message: format!(
                "{} chronic conditions - complex care needs",
                data.medical_history.chronic_conditions.len()
            ),
            priority: "high".to_string(),
        });
    }

    // ─── Missing emergency contact ──────────────────────────
    if data.personal_information.emergency_contact_name.trim().is_empty()
        || data.personal_information.emergency_contact_phone.trim().is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CONTACT-001".to_string(),
            category: "Administrative".to_string(),
            message: "Emergency contact information missing".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Missing GP details ─────────────────────────────────
    if data.insurance_and_id.gp_name.trim().is_empty() {
        flags.push(AdditionalFlag {
            id: "FLAG-GP-001".to_string(),
            category: "Administrative".to_string(),
            message: "GP name not provided".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Emergency visit ────────────────────────────────────
    if data.reason_for_visit.urgency_level == "emergency" {
        flags.push(AdditionalFlag {
            id: "FLAG-URGENT-001".to_string(),
            category: "Urgency".to_string(),
            message: "Emergency visit - prioritize assessment".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Consent issues ─────────────────────────────────────
    if data.consent_and_preferences.consent_to_treatment == "no" {
        flags.push(AdditionalFlag {
            id: "FLAG-CONSENT-001".to_string(),
            category: "Consent".to_string(),
            message: "Patient has NOT consented to treatment".to_string(),
            priority: "high".to_string(),
        });
    }

    if data.consent_and_preferences.privacy_acknowledgement == "no" {
        flags.push(AdditionalFlag {
            id: "FLAG-CONSENT-002".to_string(),
            category: "Consent".to_string(),
            message: "Patient has NOT acknowledged privacy notice".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Advance directives ─────────────────────────────────
    if data.consent_and_preferences.advance_directives == "yes" {
        let details = if data.consent_and_preferences.advance_directive_details.is_empty() {
            "details not specified"
        } else {
            &data.consent_and_preferences.advance_directive_details
        };
        flags.push(AdditionalFlag {
            id: "FLAG-DIRECTIVE-001".to_string(),
            category: "Consent".to_string(),
            message: format!("Advance directives on file: {details}"),
            priority: "medium".to_string(),
        });
    }

    // ─── Heavy smoking ──────────────────────────────────────
    if data.social_history.smoking_status == "current" {
        flags.push(AdditionalFlag {
            id: "FLAG-SMOKE-001".to_string(),
            category: "Social History".to_string(),
            message: "Current smoker - consider cessation counselling".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Heavy alcohol ──────────────────────────────────────
    if data.social_history.alcohol_frequency == "heavy" {
        flags.push(AdditionalFlag {
            id: "FLAG-ALCOHOL-001".to_string(),
            category: "Social History".to_string(),
            message: "Heavy alcohol use reported".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Regular drug use ───────────────────────────────────
    if data.social_history.drug_use == "regular" {
        let details = if data.social_history.drug_details.is_empty() {
            "details not specified"
        } else {
            &data.social_history.drug_details
        };
        flags.push(AdditionalFlag {
            id: "FLAG-DRUGS-001".to_string(),
            category: "Social History".to_string(),
            message: format!("Regular drug use: {details}"),
            priority: "high".to_string(),
        });
    }

    // ─── Cardiovascular symptoms ────────────────────────────
    if !data.review_of_systems.cardiovascular.trim().is_empty() {
        flags.push(AdditionalFlag {
            id: "FLAG-ROS-CV".to_string(),
            category: "Review of Systems".to_string(),
            message: "Cardiovascular symptoms reported - requires clinical review".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Family genetic conditions ──────────────────────────
    if data.family_history.genetic_conditions == "yes" {
        let details = if data.family_history.genetic_conditions_details.is_empty() {
            "details not specified"
        } else {
            &data.family_history.genetic_conditions_details
        };
        flags.push(AdditionalFlag {
            id: "FLAG-GENETIC-001".to_string(),
            category: "Family History".to_string(),
            message: format!("Genetic conditions in family: {details}"),
            priority: "medium".to_string(),
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
