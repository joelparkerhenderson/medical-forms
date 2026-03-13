use super::types::AssessmentData;
use super::utils::{side_effects_score, psychosocial_score};

/// A declarative oncology concern rule.
pub struct OncologyRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All oncology rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<OncologyRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        OncologyRule {
            id: "ONC-001",
            category: "Performance",
            description: "ECOG performance status 4 - completely disabled",
            concern_level: "high",
            evaluate: |d| d.performance_status.ecog_score == Some(4),
        },
        OncologyRule {
            id: "ONC-002",
            category: "Staging",
            description: "Stage IV metastatic disease identified",
            concern_level: "high",
            evaluate: |d| {
                matches!(
                    d.staging_grading.overall_stage.as_str(),
                    "IV" | "IVA" | "IVB"
                )
            },
        },
        OncologyRule {
            id: "ONC-003",
            category: "Side Effects",
            description: "Side effects dimension score above 75% - severe toxicity",
            concern_level: "high",
            evaluate: |d| side_effects_score(d).is_some_and(|s| s > 75.0),
        },
        OncologyRule {
            id: "ONC-004",
            category: "Pain",
            description: "Pain severity rated 5 - maximum pain reported",
            concern_level: "high",
            evaluate: |d| d.side_effects_toxicity.pain_severity == Some(5),
        },
        OncologyRule {
            id: "ONC-005",
            category: "Palliative",
            description: "Hospice referral indicated",
            concern_level: "high",
            evaluate: |d| d.palliative_care_needs.hospice_referral_indicated == "yes",
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        OncologyRule {
            id: "ONC-006",
            category: "Performance",
            description: "ECOG performance status 3 - limited self-care",
            concern_level: "medium",
            evaluate: |d| d.performance_status.ecog_score == Some(3),
        },
        OncologyRule {
            id: "ONC-007",
            category: "Psychosocial",
            description: "Psychosocial dimension score above 60% - elevated distress",
            concern_level: "medium",
            evaluate: |d| psychosocial_score(d).is_some_and(|s| s > 60.0),
        },
        OncologyRule {
            id: "ONC-008",
            category: "Depression",
            description: "Depression screening score 4-5 - significant depressive symptoms",
            concern_level: "medium",
            evaluate: |d| matches!(d.psychosocial_assessment.depression_screening, Some(4..=5)),
        },
        OncologyRule {
            id: "ONC-009",
            category: "Nutrition",
            description: "Nutritional status rated 4-5 - significant malnutrition risk",
            concern_level: "medium",
            evaluate: |d| matches!(d.performance_status.nutritional_status, Some(4..=5)),
        },
        OncologyRule {
            id: "ONC-010",
            category: "Pain",
            description: "Pain severity rated 4 - severe pain requiring intervention",
            concern_level: "medium",
            evaluate: |d| d.side_effects_toxicity.pain_severity == Some(4),
        },
        OncologyRule {
            id: "ONC-011",
            category: "Fatigue",
            description: "Fatigue severity rated 4-5 - debilitating fatigue",
            concern_level: "medium",
            evaluate: |d| matches!(d.side_effects_toxicity.fatigue_severity, Some(4..=5)),
        },
        OncologyRule {
            id: "ONC-012",
            category: "Anxiety",
            description: "Anxiety level rated 4-5 - severe anxiety",
            concern_level: "medium",
            evaluate: |d| matches!(d.psychosocial_assessment.anxiety_level, Some(4..=5)),
        },
        OncologyRule {
            id: "ONC-013",
            category: "Financial",
            description: "Financial toxicity rated 4-5 - severe financial burden",
            concern_level: "medium",
            evaluate: |d| matches!(d.psychosocial_assessment.financial_toxicity, Some(4..=5)),
        },
        OncologyRule {
            id: "ONC-014",
            category: "Palliative",
            description: "Quality of life score rated 4-5 - severely impaired",
            concern_level: "medium",
            evaluate: |d| matches!(d.palliative_care_needs.quality_of_life_score, Some(4..=5)),
        },
        OncologyRule {
            id: "ONC-015",
            category: "Treatment",
            description: "Treatment modifications required due to toxicity",
            concern_level: "medium",
            evaluate: |d| {
                matches!(
                    d.current_treatment.treatment_modifications.as_str(),
                    "doseReduction" | "doseDelay" | "regimenChange"
                )
            },
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        OncologyRule {
            id: "ONC-016",
            category: "Performance",
            description: "ECOG performance status 0 - fully active",
            concern_level: "low",
            evaluate: |d| d.performance_status.ecog_score == Some(0),
        },
        OncologyRule {
            id: "ONC-017",
            category: "Treatment",
            description: "Treatment response is complete response",
            concern_level: "low",
            evaluate: |d| d.treatment_history.treatment_response == "completeResponse",
        },
        OncologyRule {
            id: "ONC-018",
            category: "Staging",
            description: "Early stage disease (Stage I-II)",
            concern_level: "low",
            evaluate: |d| {
                matches!(
                    d.staging_grading.overall_stage.as_str(),
                    "I" | "IA" | "IB" | "II" | "IIA" | "IIB"
                )
            },
        },
        OncologyRule {
            id: "ONC-019",
            category: "Psychosocial",
            description: "All psychosocial items rated 1-2 - good psychosocial status",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.psychosocial_assessment.anxiety_level,
                    d.psychosocial_assessment.depression_screening,
                    d.psychosocial_assessment.distress_thermometer,
                    d.psychosocial_assessment.financial_toxicity,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v <= 2)
            },
        },
        OncologyRule {
            id: "ONC-020",
            category: "Palliative",
            description: "Goals of care discussed and documented",
            concern_level: "low",
            evaluate: |d| d.palliative_care_needs.goals_of_care_discussed == "yes",
        },
    ]
}
