use super::types::{AdditionalFlag, AssessmentData};
use super::utils::calculate_dlqi_score;

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the severity score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── FLAG-SEV-001: Very severe DLQI (>= 21) ────────────
    if calculate_dlqi_score(data).is_some_and(|s| s >= 21) {
        flags.push(AdditionalFlag {
            id: "FLAG-SEV-001".to_string(),
            category: "Severity".to_string(),
            message: "Very severe DLQI score (>= 21) - urgent dermatology review needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-SEV-002: Extensive BSA (> 50%) ────────────────
    if data.current_condition.body_area_affected.is_some_and(|v| v > 50) {
        flags.push(AdditionalFlag {
            id: "FLAG-SEV-002".to_string(),
            category: "Severity".to_string(),
            message: "Extensive body surface area affected (> 50%) - consider systemic therapy".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-INF-001: Signs of skin infection ──────────────
    if data.current_condition.infection_signs == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-INF-001".to_string(),
            category: "Infection".to_string(),
            message: "Signs of skin infection present - assess for antibiotic/antiviral treatment".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-PAIN-001: Severe pain (>= 8/10) ──────────────
    if data.symptom_severity.pain.is_some_and(|v| v >= 8) {
        flags.push(AdditionalFlag {
            id: "FLAG-PAIN-001".to_string(),
            category: "Pain".to_string(),
            message: "Severe pain reported (>= 8/10) - review pain management plan".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-PSYCH-001: Significant mental health impact ───
    if data.triggers_comorbidities.mental_health_impact.is_some_and(|v| v >= 4) {
        flags.push(AdditionalFlag {
            id: "FLAG-PSYCH-001".to_string(),
            category: "Mental Health".to_string(),
            message: "Significant mental health impact - consider psychology/psychiatry referral".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-TREAT-001: Multiple treatment failures ────────
    if data.previous_treatments.treatment_failures.is_some_and(|v| v >= 3) {
        flags.push(AdditionalFlag {
            id: "FLAG-TREAT-001".to_string(),
            category: "Treatment".to_string(),
            message: "Multiple treatment failures (>= 3) - review treatment escalation pathway".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-TREAT-002: Poor treatment adherence ───────────
    if matches!(data.current_treatment.treatment_adherence, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-TREAT-002".to_string(),
            category: "Treatment".to_string(),
            message: "Poor treatment adherence (1-2/5) - discuss barriers to adherence".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-BIO-001: Biologic candidate ───────────────────
    if !data.previous_treatments.systemic_therapy.is_empty()
        && data.previous_treatments.systemic_therapy != "none"
        && data.previous_treatments.treatment_failures.is_some_and(|v| v >= 2)
        && (data.previous_treatments.biologic_therapy.is_empty()
            || data.previous_treatments.biologic_therapy == "none")
    {
        flags.push(AdditionalFlag {
            id: "FLAG-BIO-001".to_string(),
            category: "Treatment".to_string(),
            message: "Potential biologic candidate - failed systemic therapies without biologic trial".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-ARTH-001: Psoriatic arthritis ─────────────────
    if data.triggers_comorbidities.psoriasis_arthritis == "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-ARTH-001".to_string(),
            category: "Comorbidity".to_string(),
            message: "Psoriatic arthritis present - consider rheumatology referral".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-CANCER-001: Skin cancer history ───────────────
    if !data.skin_history.skin_cancer_history.is_empty()
        && data.skin_history.skin_cancer_history != "none"
        && data.skin_history.skin_cancer_history != "no"
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CANCER-001".to_string(),
            category: "Cancer".to_string(),
            message: "Skin cancer history - ensure ongoing surveillance programme".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-NAIL-001: Severe nail involvement ─────────────
    if data.affected_areas.nails.is_some_and(|v| v >= 3) {
        flags.push(AdditionalFlag {
            id: "FLAG-NAIL-001".to_string(),
            category: "Nails".to_string(),
            message: "Severe nail involvement - consider specialist nail assessment".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-GENI-001: Genital involvement ─────────────────
    if data.affected_areas.genital_area.is_some_and(|v| v >= 1) {
        flags.push(AdditionalFlag {
            id: "FLAG-GENI-001".to_string(),
            category: "Specialist".to_string(),
            message: "Genital area involvement - specialist management required".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-CHILD-001: Paediatric patient with severe disease ─
    // Note: we check age_of_onset as proxy for current young patient
    if data.skin_history.age_of_onset.is_some_and(|v| v < 16)
        && calculate_dlqi_score(data).is_some_and(|s| s >= 11)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CHILD-001".to_string(),
            category: "Paediatric".to_string(),
            message: "Early onset with severe disease - consider paediatric dermatology referral".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-ADH-001: Low emollient adherence ──────────────
    if matches!(data.current_treatment.emollient_use, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-ADH-001".to_string(),
            category: "Adherence".to_string(),
            message: "Low emollient use (1-2/5) - educate on importance of regular emollient use".to_string(),
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
