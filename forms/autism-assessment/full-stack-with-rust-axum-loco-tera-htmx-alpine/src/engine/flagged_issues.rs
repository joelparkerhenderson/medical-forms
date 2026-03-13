use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the likelihood score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Safeguarding concern ────────────────────────────────
    if data.mental_health_comorbidities.safeguarding_concerns == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SAFE-001".to_string(),
            category: "Safeguarding".to_string(),
            message: "Safeguarding concern identified - immediate safeguarding referral required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Mental health crisis ────────────────────────────────
    if data.mental_health_comorbidities.self_harm_risk == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-MH-001".to_string(),
            category: "Mental Health".to_string(),
            message: "Self-harm risk identified - urgent mental health assessment required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Severe anxiety ──────────────────────────────────────
    if data.mental_health_comorbidities.anxiety_level == Some(3) {
        flags.push(AdditionalFlag {
            id: "FLAG-MH-002".to_string(),
            category: "Mental Health".to_string(),
            message: "Severe anxiety reported - consider anxiety management support".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Severe depression ───────────────────────────────────
    if data.mental_health_comorbidities.depression_level == Some(3) {
        flags.push(AdditionalFlag {
            id: "FLAG-MH-003".to_string(),
            category: "Mental Health".to_string(),
            message: "Severe depression reported - consider mood disorder assessment".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Sensory environment concerns ────────────────────────
    if data.sensory_processing.sensory_overload_frequency == "daily" {
        flags.push(AdditionalFlag {
            id: "FLAG-SENS-001".to_string(),
            category: "Sensory".to_string(),
            message: "Daily sensory overload - review sensory environment and accommodations".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Weekly sensory overload ─────────────────────────────
    if data.sensory_processing.sensory_overload_frequency == "weekly" {
        flags.push(AdditionalFlag {
            id: "FLAG-SENS-002".to_string(),
            category: "Sensory".to_string(),
            message: "Weekly sensory overload reported - consider sensory assessment".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Employment support needed ───────────────────────────
    if data.support_needs.employment_support == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SUPP-001".to_string(),
            category: "Support".to_string(),
            message: "Employment support needed - refer to supported employment services".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Education support needed ────────────────────────────
    if data.support_needs.education_support == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SUPP-002".to_string(),
            category: "Support".to_string(),
            message: "Education support needed - refer to learning support services".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Relationship difficulties ───────────────────────────
    if data.support_needs.relationship_support == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SUPP-003".to_string(),
            category: "Support".to_string(),
            message: "Relationship support needed - consider social skills or counselling referral".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Housing support ─────────────────────────────────────
    if data.support_needs.housing_support == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SUPP-004".to_string(),
            category: "Support".to_string(),
            message: "Housing support needed - refer to housing advisory services".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Sleep difficulties ──────────────────────────────────
    if data.mental_health_comorbidities.sleep_difficulties == Some(3) {
        flags.push(AdditionalFlag {
            id: "FLAG-MH-004".to_string(),
            category: "Mental Health".to_string(),
            message: "Severe sleep difficulties - review sleep hygiene and consider specialist referral".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Speech delay reported ───────────────────────────────
    if data.developmental_history.speech_delay == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-DEV-001".to_string(),
            category: "Development".to_string(),
            message: "Speech delay reported in developmental history".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Executive function difficulties ─────────────────────
    if !data.daily_living_skills.executive_function_difficulties.trim().is_empty() {
        flags.push(AdditionalFlag {
            id: "FLAG-DLS-001".to_string(),
            category: "Daily Living".to_string(),
            message: "Executive function difficulties reported - review support strategies".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── Benefits support ────────────────────────────────────
    if data.support_needs.benefits_support == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SUPP-005".to_string(),
            category: "Support".to_string(),
            message: "Benefits support needed - refer to welfare advisory services".to_string(),
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
