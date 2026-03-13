use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the concern score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Very low birth weight ───────────────────────────────
    if matches!(data.birth_neonatal_history.birth_weight_grams, Some(w) if w < 1500) {
        flags.push(AdditionalFlag {
            id: "FLAG-BIRTH-001".to_string(),
            category: "Birth History".to_string(),
            message: "Very low birth weight (<1500g) - monitor growth trajectory closely".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── NICU admission ──────────────────────────────────────
    if data.birth_neonatal_history.nicu_admission == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-BIRTH-002".to_string(),
            category: "Birth History".to_string(),
            message: "History of NICU admission - review developmental follow-up plan".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Vaccine refusal ─────────────────────────────────────
    if data.immunization_status.vaccine_refusal == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-IMM-001".to_string(),
            category: "Immunization".to_string(),
            message: "Vaccine refusal reported - provide counseling and document".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Missing vaccines ────────────────────────────────────
    if !data.immunization_status.missing_vaccines.trim().is_empty()
        && data.immunization_status.missing_vaccines != "none"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-IMM-002".to_string(),
            category: "Immunization".to_string(),
            message: "Missing vaccines identified - schedule catch-up immunizations".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Food allergies reported ─────────────────────────────
    if !data.feeding_nutrition.food_allergies.trim().is_empty()
        && data.feeding_nutrition.food_allergies != "none"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-FEED-001".to_string(),
            category: "Feeding".to_string(),
            message: "Food allergies reported - ensure allergy action plan is in place".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Language delay concern ──────────────────────────────
    if data.developmental_milestones.language_expressive == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-DEV-001".to_string(),
            category: "Development".to_string(),
            message: "Severe expressive language delay - refer to speech therapy".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Social-emotional concern ────────────────────────────
    if matches!(data.developmental_milestones.social_emotional, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-DEV-002".to_string(),
            category: "Development".to_string(),
            message: "Social-emotional development concern - consider developmental screening".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Excessive screen time ───────────────────────────────
    if data.behavioral_assessment.screen_time_hours == "moreThan4" {
        flags.push(AdditionalFlag {
            id: "FLAG-BEH-001".to_string(),
            category: "Behavior".to_string(),
            message: "Excessive screen time (>4 hours/day) - provide guidance on limits".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Secondhand smoke exposure ───────────────────────────
    if data.family_social_history.secondhand_smoke == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-FAM-001".to_string(),
            category: "Family".to_string(),
            message: "Secondhand smoke exposure - counsel on cessation and risks".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Family mental health concerns ───────────────────────
    if !data.family_social_history.family_mental_health.trim().is_empty()
        && data.family_social_history.family_mental_health != "none"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-FAM-002".to_string(),
            category: "Family".to_string(),
            message: "Family mental health history noted - screen for impact on child".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Respiratory concerns ────────────────────────────────
    if data.systems_review.respiratory_concerns == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-SYS-001".to_string(),
            category: "Systems".to_string(),
            message: "Significant respiratory concerns - evaluate for asthma or other conditions".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Specialist referral needed ──────────────────────────
    if data.clinical_review.specialist_referrals_needed == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-CLIN-001".to_string(),
            category: "Clinical".to_string(),
            message: "Specialist referral indicated - ensure referral is completed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Recent hospitalization ──────────────────────────────
    if !data.clinical_review.recent_hospitalizations.trim().is_empty()
        && data.clinical_review.recent_hospitalizations != "none"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CLIN-002".to_string(),
            category: "Clinical".to_string(),
            message: "Recent hospitalization reported - review discharge plan and recovery".to_string(),
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
