use super::types::{AdditionalFlag, AssessmentData};
use super::utils::{calculate_mmse_score, functional_score};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the impairment score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Safety concern - impaired safety awareness ──────────
    if data.functional_assessment.safety_awareness == Some(0) {
        flags.push(AdditionalFlag {
            id: "FLAG-SAFE-001".to_string(),
            category: "Safety".to_string(),
            message: "Patient has impaired safety awareness - immediate risk assessment needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Driving risk ────────────────────────────────────────
    if calculate_mmse_score(data).is_some_and(|s| s < 24)
        && data.functional_assessment.transport_ability == Some(0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-DRIVE-001".to_string(),
            category: "Driving".to_string(),
            message: "Cognitive impairment with transport inability - driving assessment recommended".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Medication management concern ───────────────────────
    if data.functional_assessment.medication_management == Some(0) {
        flags.push(AdditionalFlag {
            id: "FLAG-MED-001".to_string(),
            category: "Medication".to_string(),
            message: "Cannot manage medications independently - supervised administration needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Falls risk - disorientation combined with impaired mobility ─
    if data.functional_assessment.transport_ability == Some(0)
        && data.functional_assessment.safety_awareness == Some(0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-FALL-001".to_string(),
            category: "Falls".to_string(),
            message: "Combined mobility and safety impairment - high falls risk".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Carer strain ────────────────────────────────────────
    if functional_score(data).is_some_and(|s| s <= 2) {
        flags.push(AdditionalFlag {
            id: "FLAG-CARER-001".to_string(),
            category: "Carer".to_string(),
            message: "Multiple functional dependencies - assess carer strain and support needs".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Capacity concerns ───────────────────────────────────
    if calculate_mmse_score(data).is_some_and(|s| s < 19) {
        flags.push(AdditionalFlag {
            id: "FLAG-CAPACITY-001".to_string(),
            category: "Capacity".to_string(),
            message: "Moderate-severe impairment - consider mental capacity assessment".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Rapid decline ───────────────────────────────────────
    if data.cognitive_history.rate_of_decline == "rapid" {
        flags.push(AdditionalFlag {
            id: "FLAG-DECLINE-001".to_string(),
            category: "Decline".to_string(),
            message: "Rapid cognitive decline reported - urgent specialist referral indicated".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Wandering risk ──────────────────────────────────────
    if data.orientation.orientation_building == Some(0)
        && data.orientation.orientation_floor == Some(0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-WANDER-001".to_string(),
            category: "Wandering".to_string(),
            message: "Disoriented to building and floor - wandering risk, consider safeguarding".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Financial vulnerability ─────────────────────────────
    if data.functional_assessment.financial_management == Some(0) {
        flags.push(AdditionalFlag {
            id: "FLAG-FINANCE-001".to_string(),
            category: "Finance".to_string(),
            message: "Cannot manage finances - risk of financial exploitation".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Nutrition risk ──────────────────────────────────────
    if data.functional_assessment.meal_preparation == Some(0) {
        flags.push(AdditionalFlag {
            id: "FLAG-NUTRITION-001".to_string(),
            category: "Nutrition".to_string(),
            message: "Cannot prepare meals independently - nutritional risk assessment needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Hygiene concern ─────────────────────────────────────
    if data.functional_assessment.personal_hygiene == Some(0) {
        flags.push(AdditionalFlag {
            id: "FLAG-HYGIENE-001".to_string(),
            category: "Hygiene".to_string(),
            message: "Cannot manage personal hygiene - personal care support required".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Language impairment ─────────────────────────────────
    if data.language.naming_pencil == Some(0)
        && data.language.naming_watch == Some(0)
        && data.language.repetition == Some(0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-LANG-001".to_string(),
            category: "Language".to_string(),
            message: "Severe language impairment - consider speech and language therapy referral".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Executive dysfunction ───────────────────────────────
    if data.executive_function.verbal_fluency_score == Some(0)
        && data.executive_function.abstraction_1 == Some(0)
    {
        flags.push(AdditionalFlag {
            id: "FLAG-EXEC-001".to_string(),
            category: "Executive".to_string(),
            message: "Severe executive dysfunction - impacts planning and decision-making".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Housekeeping inability ──────────────────────────────
    if data.functional_assessment.housekeeping == Some(0) {
        flags.push(AdditionalFlag {
            id: "FLAG-HOUSE-001".to_string(),
            category: "Functional".to_string(),
            message: "Cannot manage housekeeping - environmental support may be needed".to_string(),
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
