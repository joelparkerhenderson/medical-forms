use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the severity score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── FLAG-ANA-001: Anaphylaxis history without EpiPen ────
    if data.allergy_history.previous_anaphylaxis == "yes"
        && data.current_treatment.epi_pen_carried != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-ANA-001".to_string(),
            category: "Anaphylaxis".to_string(),
            message: "Anaphylaxis history without EpiPen carried - urgent prescribing review needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-ANA-002: Cardiovascular symptoms (systemic risk) ──
    if data.symptoms_reactions.cardiovascular_symptoms.is_some_and(|v| v >= 3) {
        flags.push(AdditionalFlag {
            id: "FLAG-ANA-002".to_string(),
            category: "Anaphylaxis".to_string(),
            message: "Cardiovascular symptoms present - systemic reaction risk".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-DRUG-001: Unverified drug allergy ──────────────
    if !data.food_drug_allergies.drug_allergies.is_empty()
        && data.food_drug_allergies.drug_allergies != "none"
        && data.food_drug_allergies.allergy_verified != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-DRUG-001".to_string(),
            category: "Drug Allergy".to_string(),
            message: "Unverified drug allergy - consider allergy testing to confirm".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-DRUG-002: Multiple drug allergies ──────────────
    if data.food_drug_allergies.drug_allergy_type == "multiple" {
        flags.push(AdditionalFlag {
            id: "FLAG-DRUG-002".to_string(),
            category: "Drug Allergy".to_string(),
            message: "Multiple drug allergies reported - specialist referral recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-FOOD-001: Severe food allergy without action plan ─
    if !data.food_drug_allergies.food_allergies.is_empty()
        && data.food_drug_allergies.food_allergies != "none"
        && data.current_allergies.severity_rating.is_some_and(|v| v >= 4)
        && data.emergency_plan.anaphylaxis_action_plan != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-FOOD-001".to_string(),
            category: "Food Allergy".to_string(),
            message: "Severe food allergy without anaphylaxis action plan".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-FOOD-002: Multiple food allergies with cross-reactivity ─
    if data.food_drug_allergies.food_allergy_type == "multiple"
        && data.food_drug_allergies.cross_reactivity == "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-FOOD-002".to_string(),
            category: "Food Allergy".to_string(),
            message: "Multiple food allergies with cross-reactivity - dietitian referral recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-RESP-001: Severe respiratory symptoms ──────────
    if data.symptoms_reactions.respiratory_symptoms.is_some_and(|v| v >= 4) {
        flags.push(AdditionalFlag {
            id: "FLAG-RESP-001".to_string(),
            category: "Respiratory".to_string(),
            message: "Severe respiratory symptoms - assess for asthma comorbidity".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-TEST-001: No allergy testing performed ─────────
    if data.testing_results.skin_prick_test_done != "yes"
        && data.testing_results.specific_ige_level.is_none()
        && data.testing_results.challenge_test_done != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-TEST-001".to_string(),
            category: "Testing".to_string(),
            message: "No allergy testing performed - consider skin prick test or specific IgE".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-TEST-002: High specific IgE without management plan ─
    if data.testing_results.specific_ige_level.is_some_and(|v| v >= 3.5)
        && data.current_treatment.antihistamine_use.is_empty()
        && data.current_treatment.immunotherapy != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-TEST-002".to_string(),
            category: "Testing".to_string(),
            message: "High specific IgE without active management plan".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-PLAN-001: No emergency plan ────────────────────
    if data.emergency_plan.has_emergency_plan != "yes"
        && data.current_allergies.severity_rating.is_some_and(|v| v >= 3)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-PLAN-001".to_string(),
            category: "Emergency Plan".to_string(),
            message: "No emergency plan for moderate/severe allergy".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-PLAN-002: Emergency plan not reviewed ──────────
    if data.emergency_plan.has_emergency_plan == "yes"
        && data.emergency_plan.plan_review_date.is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-PLAN-002".to_string(),
            category: "Emergency Plan".to_string(),
            message: "Emergency plan has no review date - may be outdated".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-TREAT-001: No treatment for moderate/severe allergy ─
    if data.current_allergies.severity_rating.is_some_and(|v| v >= 3)
        && (data.current_treatment.antihistamine_use.is_empty()
            || data.current_treatment.antihistamine_use == "none")
        && data.current_treatment.immunotherapy != "yes"
        && (data.current_treatment.nasal_corticosteroid.is_empty()
            || data.current_treatment.nasal_corticosteroid == "none")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-TREAT-001".to_string(),
            category: "Treatment".to_string(),
            message: "No active treatment for moderate/severe allergy".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-IMM-001: Immunotherapy candidate not referred ──
    if data.current_allergies.severity_rating.is_some_and(|v| v >= 4)
        && data.current_treatment.immunotherapy != "yes"
        && data.review_assessment.referral_needed != "yes"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-IMM-001".to_string(),
            category: "Immunotherapy".to_string(),
            message: "Severe allergy without immunotherapy or referral - consider specialist referral".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-PEDI-001: Paediatric patient with severe allergy ─
    if data.allergy_history.age_of_onset.is_some_and(|v| v <= 16)
        && data.current_allergies.severity_rating.is_some_and(|v| v >= 4)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-PEDI-001".to_string(),
            category: "Paediatric".to_string(),
            message: "Paediatric onset with severe allergy - specialist paediatric allergy referral needed".to_string(),
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
