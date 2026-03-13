use super::types::{AdditionalFlag, AssessmentData};
use super::utils::{count_comorbidities, fev1_percent_predicted};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the control level. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── FLAG-CTRL-001: Uncontrolled without step-up plan ────
    if data.review_management_plan.control_level == "uncontrolled"
        && data.review_management_plan.gina_step_recommended.is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CTRL-001".to_string(),
            category: "Control".to_string(),
            message: "Uncontrolled asthma without step-up treatment plan".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-CTRL-002: Partly controlled without step-up plan
    if data.review_management_plan.control_level == "partlyControlled"
        && data.review_management_plan.gina_step_recommended.is_empty()
    {
        flags.push(AdditionalFlag {
            id: "FLAG-CTRL-002".to_string(),
            category: "Control".to_string(),
            message: "Partly controlled asthma without step-up treatment plan".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-EXAC-001: Frequent exacerbations ───────────────
    if matches!(
        data.triggers_exacerbations.exacerbations_last12_months,
        Some(3..=255)
    ) {
        flags.push(AdditionalFlag {
            id: "FLAG-EXAC-001".to_string(),
            category: "Exacerbations".to_string(),
            message: "Frequent exacerbations (3+ in past 12 months) - review management".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-EXAC-002: Recent emergency visit ───────────────
    if matches!(data.triggers_exacerbations.emergency_visits, Some(1..=255)) {
        flags.push(AdditionalFlag {
            id: "FLAG-EXAC-002".to_string(),
            category: "Exacerbations".to_string(),
            message: "Emergency visit in past year - assess exacerbation prevention".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-LUNG-001: FEV1 < 50% predicted ────────────────
    if fev1_percent_predicted(data).is_some_and(|p| p < 50.0) {
        flags.push(AdditionalFlag {
            id: "FLAG-LUNG-001".to_string(),
            category: "Lung Function".to_string(),
            message: "FEV1 less than 50% predicted - severe airflow limitation".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-MED-001: Not on preventer despite symptoms ─────
    if data.current_medications.ics_dose == "none"
        && (matches!(data.symptom_assessment.daytime_symptoms, Some(2..=4))
            || matches!(data.symptom_assessment.night_waking, Some(1..=4)))
    {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-001".to_string(),
            category: "Medications".to_string(),
            message: "Not on preventer inhaler despite ongoing symptoms".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-MED-002: Poor adherence ────────────────────────
    if matches!(data.current_medications.preventer_adherence, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-002".to_string(),
            category: "Medications".to_string(),
            message: "Poor preventer adherence - address before stepping up treatment".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-TECH-001: Poor inhaler technique ───────────────
    if matches!(data.inhaler_technique.technique_score, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-TECH-001".to_string(),
            category: "Inhaler Technique".to_string(),
            message: "Poor inhaler technique - provide education before stepping up".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-SMOKE-001: Current smoker ──────────────────────
    if data.lifestyle_environment.smoking_status == "current" {
        flags.push(AdditionalFlag {
            id: "FLAG-SMOKE-001".to_string(),
            category: "Lifestyle".to_string(),
            message: "Current smoker with asthma - offer smoking cessation support".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-ICU-001: History of ICU admission ──────────────
    if matches!(data.asthma_history.previous_icu_admissions, Some(1..=255)) {
        flags.push(AdditionalFlag {
            id: "FLAG-ICU-001".to_string(),
            category: "History".to_string(),
            message: "History of ICU admission for asthma - high-risk patient".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── FLAG-STEP-001: GINA step 4-5 specialist referral ───
    if data.current_medications.gina_step == "4" || data.current_medications.gina_step == "5" {
        flags.push(AdditionalFlag {
            id: "FLAG-STEP-001".to_string(),
            category: "Management".to_string(),
            message: "GINA step 4-5 - consider specialist referral".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-PLAN-001: No written action plan ──────────────
    if data.review_management_plan.action_plan_provided != "yes" {
        flags.push(AdditionalFlag {
            id: "FLAG-PLAN-001".to_string(),
            category: "Management".to_string(),
            message: "No written asthma action plan provided".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── FLAG-COMOR-001: Multiple comorbidities ──────────────
    if count_comorbidities(data) >= 3 {
        flags.push(AdditionalFlag {
            id: "FLAG-COMOR-001".to_string(),
            category: "Comorbidities".to_string(),
            message: "Multiple comorbidities affecting asthma control".to_string(),
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
