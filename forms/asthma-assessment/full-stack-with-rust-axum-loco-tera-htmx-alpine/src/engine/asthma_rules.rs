use super::types::AssessmentData;
use super::utils::{count_gina_criteria, fev1_percent_predicted};

/// A declarative asthma concern rule.
pub struct AsthmaRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All asthma rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<AsthmaRule> {
    vec![
        // ─── HIGH CONCERN (AST-001 to AST-005) ─────────────────
        AsthmaRule {
            id: "AST-001",
            category: "Symptoms",
            description: "Uncontrolled symptoms: 3 or more GINA criteria met",
            concern_level: "high",
            evaluate: |d| count_gina_criteria(d) >= 3,
        },
        AsthmaRule {
            id: "AST-002",
            category: "History",
            description: "Previous ICU admission for asthma",
            concern_level: "high",
            evaluate: |d| matches!(d.asthma_history.previous_icu_admissions, Some(1..=255)),
        },
        AsthmaRule {
            id: "AST-003",
            category: "Lung Function",
            description: "FEV1 less than 60% of predicted",
            concern_level: "high",
            evaluate: |d| fev1_percent_predicted(d).is_some_and(|p| p < 60.0),
        },
        AsthmaRule {
            id: "AST-004",
            category: "Exacerbations",
            description: "3 or more exacerbations in the past 12 months",
            concern_level: "high",
            evaluate: |d| matches!(d.triggers_exacerbations.exacerbations_last12_months, Some(3..=255)),
        },
        AsthmaRule {
            id: "AST-005",
            category: "Medications",
            description: "2 or more oral steroid courses in the past year",
            concern_level: "high",
            evaluate: |d| matches!(d.triggers_exacerbations.oral_steroid_courses, Some(2..=255)),
        },
        // ─── MEDIUM CONCERN (AST-006 to AST-015) ───────────────
        AsthmaRule {
            id: "AST-006",
            category: "Symptoms",
            description: "Partly controlled: 1-2 GINA criteria met",
            concern_level: "medium",
            evaluate: |d| {
                let c = count_gina_criteria(d);
                c >= 1 && c <= 2
            },
        },
        AsthmaRule {
            id: "AST-007",
            category: "Symptoms",
            description: "Night waking 2 or more times per week",
            concern_level: "medium",
            evaluate: |d| matches!(d.symptom_assessment.night_waking, Some(3..=4)),
        },
        AsthmaRule {
            id: "AST-008",
            category: "Symptoms",
            description: "Reliever use more than 2 times per week",
            concern_level: "medium",
            evaluate: |d| matches!(d.symptom_assessment.reliever_use, Some(3..=4)),
        },
        AsthmaRule {
            id: "AST-009",
            category: "Lung Function",
            description: "Peak flow less than 80% of personal best",
            concern_level: "medium",
            evaluate: |d| {
                match (d.lung_function.current_peak_flow, d.asthma_history.best_peak_flow) {
                    (Some(current), Some(best)) if best > 0.0 => (current / best) * 100.0 < 80.0,
                    _ => false,
                }
            },
        },
        AsthmaRule {
            id: "AST-010",
            category: "Inhaler",
            description: "Poor inhaler technique (score less than 3 out of 5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.inhaler_technique.technique_score, Some(1..=2)),
        },
        AsthmaRule {
            id: "AST-011",
            category: "Medications",
            description: "Low preventer adherence (score 1-2 out of 5)",
            concern_level: "medium",
            evaluate: |d| matches!(d.current_medications.preventer_adherence, Some(1..=2)),
        },
        AsthmaRule {
            id: "AST-012",
            category: "Symptoms",
            description: "Exercise limitation due to asthma",
            concern_level: "medium",
            evaluate: |d| d.triggers_exacerbations.exercise_trigger == "yes",
        },
        AsthmaRule {
            id: "AST-013",
            category: "Lifestyle",
            description: "Current smoker with asthma",
            concern_level: "medium",
            evaluate: |d| d.lifestyle_environment.smoking_status == "current",
        },
        AsthmaRule {
            id: "AST-014",
            category: "Comorbidities",
            description: "Rhinitis comorbidity affecting control",
            concern_level: "medium",
            evaluate: |d| d.comorbidities.rhinitis == "yes",
        },
        AsthmaRule {
            id: "AST-015",
            category: "Exacerbations",
            description: "Emergency visit in the past year",
            concern_level: "medium",
            evaluate: |d| matches!(d.triggers_exacerbations.emergency_visits, Some(1..=255)),
        },
        // ─── LOW CONCERN (positive indicators, AST-016 to AST-020) ──
        AsthmaRule {
            id: "AST-016",
            category: "Symptoms",
            description: "Well controlled: no GINA criteria met",
            concern_level: "low",
            evaluate: |d| count_gina_criteria(d) == 0,
        },
        AsthmaRule {
            id: "AST-017",
            category: "Inhaler",
            description: "Good inhaler technique (score 4-5 out of 5)",
            concern_level: "low",
            evaluate: |d| matches!(d.inhaler_technique.technique_score, Some(4..=5)),
        },
        AsthmaRule {
            id: "AST-018",
            category: "Management",
            description: "Written action plan provided",
            concern_level: "low",
            evaluate: |d| d.review_management_plan.action_plan_provided == "yes",
        },
        AsthmaRule {
            id: "AST-019",
            category: "Lung Function",
            description: "FEV1 greater than 80% of predicted",
            concern_level: "low",
            evaluate: |d| fev1_percent_predicted(d).is_some_and(|p| p > 80.0),
        },
        AsthmaRule {
            id: "AST-020",
            category: "Lifestyle",
            description: "Non-smoker",
            concern_level: "low",
            evaluate: |d| {
                d.lifestyle_environment.smoking_status == "never"
                    || d.lifestyle_environment.smoking_status == "ex"
            },
        },
    ]
}
