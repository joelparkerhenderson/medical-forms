use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the severity score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Active suicidal ideation ────────────────────────────
    if matches!(data.risk_assessment.suicidal_ideation, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-RISK-001".to_string(),
            category: "Risk".to_string(),
            message: "Active suicidal ideation reported - immediate safety assessment required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Specific risk plan ──────────────────────────────────
    if matches!(data.risk_assessment.risk_plan_specificity, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-RISK-002".to_string(),
            category: "Risk".to_string(),
            message: "Specific plan identified - crisis intervention needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Self-harm risk ──────────────────────────────────────
    if matches!(data.risk_assessment.self_harm_risk, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-RISK-003".to_string(),
            category: "Risk".to_string(),
            message: "High self-harm risk - review safety plan".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Safeguarding concerns ───────────────────────────────
    if matches!(data.risk_assessment.safeguarding_concerns, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-RISK-004".to_string(),
            category: "Risk".to_string(),
            message: "Safeguarding concerns raised - follow safeguarding protocol".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Psychotic features ──────────────────────────────────
    if matches!(data.mental_state_examination.perception, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-MSE-001".to_string(),
            category: "MSE".to_string(),
            message: "Perceptual disturbances detected - assess for psychosis".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Delusional thought content ──────────────────────────
    if matches!(data.mental_state_examination.thought_content, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-MSE-002".to_string(),
            category: "MSE".to_string(),
            message: "Abnormal thought content - further assessment needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Cognitive impairment ────────────────────────────────
    if matches!(data.mental_state_examination.cognition, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-MSE-003".to_string(),
            category: "MSE".to_string(),
            message: "Cognitive impairment noted - consider neuropsychological assessment".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Poor insight ────────────────────────────────────────
    if matches!(data.mental_state_examination.insight_judgement, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-MSE-004".to_string(),
            category: "MSE".to_string(),
            message: "Poor insight and judgement - consider capacity assessment".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Substance withdrawal risk ───────────────────────────
    if matches!(data.substance_use.withdrawal_risk, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-SUB-001".to_string(),
            category: "Substance".to_string(),
            message: "Withdrawal risk identified - medical supervision may be needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Dual diagnosis ──────────────────────────────────────
    if matches!(data.substance_use.substance_impact, Some(4..=5))
        && data.presenting_complaint.symptom_severity == Some(4)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-SUB-002".to_string(),
            category: "Substance".to_string(),
            message: "Co-occurring substance and psychiatric symptoms - dual diagnosis approach recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Medication non-adherence ────────────────────────────
    if matches!(data.current_treatment.medication_adherence, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-TRT-001".to_string(),
            category: "Treatment".to_string(),
            message: "Poor medication adherence - review barriers and psychoeducation".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Severe side effects ─────────────────────────────────
    if matches!(data.current_treatment.side_effects_severity, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-TRT-002".to_string(),
            category: "Treatment".to_string(),
            message: "Severe medication side effects - review pharmacotherapy".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Social isolation ────────────────────────────────────
    if matches!(data.social_functional.social_support, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-SOC-001".to_string(),
            category: "Social".to_string(),
            message: "Limited social support - consider community mental health resources".to_string(),
            priority: "low".to_string(),
        });
    }

    // ─── High ACE score ──────────────────────────────────────
    if matches!(data.family_history.adverse_childhood_experiences, Some(4..=5)) {
        flags.push(AdditionalFlag {
            id: "FLAG-FAM-001".to_string(),
            category: "Family".to_string(),
            message: "Significant adverse childhood experiences - trauma-informed approach recommended".to_string(),
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
