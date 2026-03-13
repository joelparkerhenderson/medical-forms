use super::types::{AdditionalFlag, AssessmentData};

/// Detects additional flags that should be highlighted for the clinician,
/// independent of the function score. These are actionable alerts.
pub fn detect_additional_flags(data: &AssessmentData) -> Vec<AdditionalFlag> {
    let mut flags = Vec::new();

    // ─── Toileting dependence ────────────────────────────────
    if data.daily_living_activities.toileting == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-ADL-001".to_string(),
            category: "ADL".to_string(),
            message: "Toileting rated dependent - personal care plan required".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Feeding dependence ──────────────────────────────────
    if data.daily_living_activities.feeding == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-ADL-002".to_string(),
            category: "ADL".to_string(),
            message: "Feeding rated dependent - nutritional and swallowing assessment needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Medication management concern ───────────────────────
    if data.instrumental_activities.medication_management == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-IADL-001".to_string(),
            category: "IADL".to_string(),
            message: "Medication management rated dependent - safety risk for self-administration".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Financial management concern ────────────────────────
    if matches!(data.instrumental_activities.financial_management, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-IADL-002".to_string(),
            category: "IADL".to_string(),
            message: "Financial management impaired - assess capacity for financial decisions".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Orientation impaired ────────────────────────────────
    if data.cognitive_perceptual.orientation == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-COG-001".to_string(),
            category: "Cognitive".to_string(),
            message: "Orientation rated very poor - assess for delirium or dementia".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Problem solving impaired ────────────────────────────
    if matches!(data.cognitive_perceptual.problem_solving, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-COG-002".to_string(),
            category: "Cognitive".to_string(),
            message: "Problem solving impaired - structured task approach needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Upper extremity weakness ────────────────────────────
    if data.motor_sensory.upper_extremity_strength == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-MOT-001".to_string(),
            category: "Motor".to_string(),
            message: "Upper extremity strength rated very poor - assistive device evaluation needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Endurance concern ───────────────────────────────────
    if matches!(data.motor_sensory.endurance, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-MOT-002".to_string(),
            category: "Motor".to_string(),
            message: "Endurance significantly limited - energy conservation strategies needed".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Bathroom safety concern ─────────────────────────────
    if data.home_environment.bathroom_safety == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-HOME-001".to_string(),
            category: "Home".to_string(),
            message: "Bathroom safety rated very poor - home modification urgently needed".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Home accessibility concern ──────────────────────────
    if matches!(data.home_environment.home_accessibility, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-HOME-002".to_string(),
            category: "Home".to_string(),
            message: "Home accessibility impaired - environmental assessment recommended".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Social isolation ────────────────────────────────────
    if data.work_leisure.social_participation == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-SOCIAL-001".to_string(),
            category: "Social".to_string(),
            message: "Social participation rated very poor - risk of isolation, consider community resources".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Severe pain ─────────────────────────────────────────
    if data.clinical_review.pain_level == Some(5) {
        flags.push(AdditionalFlag {
            id: "FLAG-CLIN-001".to_string(),
            category: "Clinical".to_string(),
            message: "Pain rated maximum - pain management consultation needed before OT intervention".to_string(),
            priority: "high".to_string(),
        });
    }

    // ─── Low motivation ──────────────────────────────────────
    if matches!(data.goals_priorities.motivation_level, Some(1..=2)) {
        flags.push(AdditionalFlag {
            id: "FLAG-GOAL-001".to_string(),
            category: "Motivation".to_string(),
            message: "Low motivation level - explore barriers and consider motivational strategies".to_string(),
            priority: "medium".to_string(),
        });
    }

    // ─── Skin integrity concern ──────────────────────────────
    if data.clinical_review.skin_integrity == Some(1) {
        flags.push(AdditionalFlag {
            id: "FLAG-CLIN-002".to_string(),
            category: "Clinical".to_string(),
            message: "Skin integrity rated very poor - pressure injury prevention needed".to_string(),
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
