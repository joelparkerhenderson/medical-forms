use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the vaccination score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── MMR not given - measles outbreak risk ──────────────
    if data.childhood_vaccinations.mmr == Some(0) {
        flags.push(AdditionalFlag {
            id: "FLAG-VAX-001".to_string(),
            category: "Childhood".to_string(),
            message: "MMR vaccination not given - measles outbreak risk".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Previous anaphylaxis ────────────────────────────────
    if data.contraindications_allergies.previous_anaphylaxis == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-VAX-002".to_string(),
            category: "Contraindication".to_string(),
            message: "Previous anaphylaxis to vaccine - specialist allergy review required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Immunocompromised patient ───────────────────────────
    if data.immunization_history.immunocompromised == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-VAX-003".to_string(),
            category: "Clinical".to_string(),
            message: "Immunocompromised patient - avoid live vaccines, specialist review needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Immediate adverse reaction ──────────────────────────
    if data.clinical_review.immediate_reaction == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-VAX-004".to_string(),
            category: "Clinical".to_string(),
            message: "Immediate adverse reaction reported - document and report via Yellow Card".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Pregnant patient ────────────────────────────────────
    if data.contraindications_allergies.pregnant == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-VAX-005".to_string(),
            category: "Contraindication".to_string(),
            message: "Pregnant patient - live vaccines contraindicated".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── No vaccination record available ─────────────────────
    if data.immunization_history.has_vaccination_record == "no" {
        flags.push(AdditionalFlag {
            id: "FLAG-VAX-006".to_string(),
            category: "History".to_string(),
            message: "No vaccination record available - full history review needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Healthcare worker missing hepatitis B ───────────────
    if data.occupational_vaccinations.healthcare_worker == "yes"
        && data.occupational_vaccinations.hepatitis_b_occupational == Some(0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-VAX-007".to_string(),
            category: "Occupational".to_string(),
            message: "Healthcare worker without hepatitis B vaccination - occupational health referral".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Egg allergy with influenza needed ───────────────────
    if data.contraindications_allergies.egg_allergy == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-VAX-008".to_string(),
            category: "Allergy".to_string(),
            message: "Egg allergy reported - use egg-free vaccine formulations".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Travel planned, destination high risk ───────────────
    if data.travel_vaccinations.travel_planned == "yes"
        && data.travel_vaccinations.yellow_fever == Some(0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-VAX-009".to_string(),
            category: "Travel".to_string(),
            message: "Travel planned but yellow fever vaccination not given - check destination requirements".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Catch-up schedule needed ────────────────────────────
    if data.clinical_review.catch_up_schedule_needed == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-VAX-010".to_string(),
            category: "Clinical".to_string(),
            message: "Catch-up vaccination schedule required - create individualised plan".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Consent not given ───────────────────────────────────
    if data.consent_information.consent_given == "no" {
        flags.push(AdditionalFlag {
            id: "FLAG-VAX-011".to_string(),
            category: "Consent".to_string(),
            message: "Consent not given - vaccination cannot proceed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Previous adverse reaction history ───────────────────
    if data.immunization_history.previous_adverse_reactions == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-VAX-012".to_string(),
            category: "History".to_string(),
            message: "Previous adverse reactions documented - review before administering".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Severe illness ──────────────────────────────────────
    if data.contraindications_allergies.severe_illness == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-VAX-013".to_string(),
            category: "Contraindication".to_string(),
            message: "Patient currently has severe illness - defer vaccination".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Referral needed ─────────────────────────────────────
    if data.clinical_review.referral_needed == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-VAX-014".to_string(),
            category: "Clinical".to_string(),
            message: "Specialist referral required - ensure referral is completed".to_string(),
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
