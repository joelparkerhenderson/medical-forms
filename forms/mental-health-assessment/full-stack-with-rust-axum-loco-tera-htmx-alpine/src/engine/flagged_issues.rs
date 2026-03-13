use super::types::{AdditionalFlag, AssessmentData};
use super::utils::{phq9_total, gad7_total};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the severity score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── FLAG-RISK-001: Active suicidal ideation ─────────────
    if data.risk_assessment.suicidal_ideation == "active" {
        flags.push(AdditionalFlag {
            id: "FLAG-RISK-001".to_string(),
            category: "Risk".to_string(),
            message: "Active suicidal ideation reported - urgent assessment required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-RISK-002: Suicide plan/means ───────────────────
    if data.risk_assessment.suicide_plan_or_means == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-RISK-002".to_string(),
            category: "Risk".to_string(),
            message: "Suicide plan or means identified - emergency intervention required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-RISK-003: Recent self-harm ─────────────────────
    if data.risk_assessment.self_harm_history == "yes"
        && !data.risk_assessment.self_harm_recent.is_empty()
        && data.risk_assessment.self_harm_recent != "none"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-RISK-003".to_string(),
            category: "Risk".to_string(),
            message: "Recent self-harm reported - safety plan review needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-SAFE-001: Safeguarding concerns ────────────────
    if data.risk_assessment.safeguarding_concerns == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-SAFE-001".to_string(),
            category: "Safeguarding".to_string(),
            message: "Safeguarding concerns identified - safeguarding referral required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-PHQ-001: Severe depression ─────────────────────
    if phq9_total(data) >= 20 {
        flags.push(AdditionalFlag {
            id: "FLAG-PHQ-001".to_string(),
            category: "Depression".to_string(),
            message: "Severe depression indicated (PHQ-9 >= 20) - urgent review required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-PHQ-002: PHQ-9 Q9 positive (self-harm ideation)
    if matches!(data.depression_screening.phq9_self_harm, Some(1..=3)) {
        flags.push(AdditionalFlag {
            id: "FLAG-PHQ-002".to_string(),
            category: "Depression".to_string(),
            message: "PHQ-9 Q9 positive - self-harm ideation reported, risk assessment needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-GAD-001: Severe anxiety ────────────────────────
    if gad7_total(data) >= 15 {
        flags.push(AdditionalFlag {
            id: "FLAG-GAD-001".to_string(),
            category: "Anxiety".to_string(),
            message: "Severe anxiety indicated (GAD-7 >= 15) - review treatment plan".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-SUB-001: Harmful substance use ─────────────────
    if data.substance_use.prescription_misuse == "yes"
        || (!data.substance_use.other_substances.is_empty()
            && data.substance_use.other_substances != "none")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-SUB-001".to_string(),
            category: "Substance".to_string(),
            message: "Harmful substance use identified - dual diagnosis assessment recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-FUNC-001: Severe functional impairment ─────────
    if matches!(data.social_functional_status.daily_functioning, Some(1)) {
        flags.push(AdditionalFlag {
            id: "FLAG-FUNC-001".to_string(),
            category: "Functional".to_string(),
            message: "Severe functional impairment - consider supported care pathway".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-MED-001: Medication non-adherence ──────────────
    if matches!(data.current_treatment.medication_adherence, Some(1)) {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-001".to_string(),
            category: "Medication".to_string(),
            message: "Medication non-adherence reported - review barriers to adherence".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-MED-002: Significant side effects ──────────────
    if !data.current_treatment.side_effects.is_empty()
        && data.current_treatment.side_effects != "none"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-002".to_string(),
            category: "Medication".to_string(),
            message: "Significant medication side effects reported - review medication".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-HIST-001: Previous hospitalisation ─────────────
    if matches!(data.mental_health_history.hospitalisations, Some(1..=255)) {
        flags.push(AdditionalFlag {
            id: "FLAG-HIST-001".to_string(),
            category: "History".to_string(),
            message: "Previous psychiatric hospitalisation - consider crisis plan review".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-SOCIAL-001: Social isolation ───────────────────
    if matches!(data.social_functional_status.social_support, Some(1)) {
        flags.push(AdditionalFlag {
            id: "FLAG-SOCIAL-001".to_string(),
            category: "Social".to_string(),
            message: "Social isolation indicated (support < 2) - consider social prescribing".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-TREAT-001: Not responding to treatment ─────────
    if matches!(data.current_treatment.treatment_response, Some(1)) {
        flags.push(AdditionalFlag {
            id: "FLAG-TREAT-001".to_string(),
            category: "Treatment".to_string(),
            message: "Not responding to current treatment - consider treatment review".to_string(),
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
