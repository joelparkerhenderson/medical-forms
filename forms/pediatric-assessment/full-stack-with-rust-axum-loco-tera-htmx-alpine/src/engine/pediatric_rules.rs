use super::types::AssessmentData;
use super::utils::{behavioral_score, developmental_score, systems_review_score};

/// A declarative pediatric concern rule.
pub struct PediatricRule {
    pub id: &'static str,
    pub category: &'static str,
    pub description: &'static str,
    pub concern_level: &'static str,
    pub evaluate: fn(&AssessmentData) -> bool,
}

/// All pediatric rules, ordered by concern level (high -> medium -> low).
pub fn all_rules() -> Vec<PediatricRule> {
    vec![
        // ─── HIGH CONCERN ───────────────────────────────────────
        PediatricRule {
            id: "PED-001",
            category: "Clinical",
            description: "Overall health impression rated Very Poor (1)",
            concern_level: "high",
            evaluate: |d| d.clinical_review.overall_health_impression == Some(1),
        },
        PediatricRule {
            id: "PED-002",
            category: "Development",
            description: "Developmental milestones dimension score below 30%",
            concern_level: "high",
            evaluate: |d| developmental_score(d).is_some_and(|s| s < 30.0),
        },
        PediatricRule {
            id: "PED-003",
            category: "Birth History",
            description: "Very preterm birth (gestational age < 32 weeks)",
            concern_level: "high",
            evaluate: |d| matches!(d.birth_neonatal_history.gestational_age_weeks, Some(w) if w < 32),
        },
        PediatricRule {
            id: "PED-004",
            category: "Neurology",
            description: "Neurological concerns rated Very Concerning (1)",
            concern_level: "high",
            evaluate: |d| d.systems_review.neurological_concerns == Some(1),
        },
        PediatricRule {
            id: "PED-005",
            category: "Growth",
            description: "Weight percentile critically low (1) - failure to thrive concern",
            concern_level: "high",
            evaluate: |d| d.growth_development.weight_percentile == Some(1),
        },
        // ─── MEDIUM CONCERN ─────────────────────────────────────
        PediatricRule {
            id: "PED-006",
            category: "Immunization",
            description: "Immunizations not up to date",
            concern_level: "medium",
            evaluate: |d| d.immunization_status.immunizations_up_to_date == "no",
        },
        PediatricRule {
            id: "PED-007",
            category: "Behavior",
            description: "Behavioral assessment dimension score below 40%",
            concern_level: "medium",
            evaluate: |d| behavioral_score(d).is_some_and(|s| s < 40.0),
        },
        PediatricRule {
            id: "PED-008",
            category: "Development",
            description: "Language expressive skills rated Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.developmental_milestones.language_expressive, Some(1..=2)),
        },
        PediatricRule {
            id: "PED-009",
            category: "Feeding",
            description: "Feeding difficulty reported with low appetite concern (1-2)",
            concern_level: "medium",
            evaluate: |d| {
                d.feeding_nutrition.feeding_difficulty == "yes"
                    && matches!(d.feeding_nutrition.appetite_concern, Some(1..=2))
            },
        },
        PediatricRule {
            id: "PED-010",
            category: "Behavior",
            description: "Sleep quality rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.behavioral_assessment.sleep_quality, Some(1..=2)),
        },
        PediatricRule {
            id: "PED-011",
            category: "Safety",
            description: "Home safety rated Poor or Very Poor (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.family_social_history.home_safety, Some(1..=2)),
        },
        PediatricRule {
            id: "PED-012",
            category: "Systems",
            description: "Systems review dimension score below 40%",
            concern_level: "medium",
            evaluate: |d| systems_review_score(d).is_some_and(|s| s < 40.0),
        },
        PediatricRule {
            id: "PED-013",
            category: "Behavior",
            description: "Anxiety level rated High or Very High (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.behavioral_assessment.anxiety_level, Some(1..=2)),
        },
        PediatricRule {
            id: "PED-014",
            category: "Family",
            description: "Parental stress rated High or Very High (1-2)",
            concern_level: "medium",
            evaluate: |d| matches!(d.family_social_history.parental_stress, Some(1..=2)),
        },
        PediatricRule {
            id: "PED-015",
            category: "Growth",
            description: "Growth trend declining or stagnant",
            concern_level: "medium",
            evaluate: |d| {
                d.growth_development.growth_trend == "declining"
                    || d.growth_development.growth_trend == "stagnant"
            },
        },
        // ─── LOW CONCERN (positive indicators) ──────────────────
        PediatricRule {
            id: "PED-016",
            category: "Clinical",
            description: "Overall health impression rated Excellent (5)",
            concern_level: "low",
            evaluate: |d| d.clinical_review.overall_health_impression == Some(5),
        },
        PediatricRule {
            id: "PED-017",
            category: "Development",
            description: "All developmental milestones rated Good or Excellent (4-5)",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.developmental_milestones.gross_motor,
                    d.developmental_milestones.fine_motor,
                    d.developmental_milestones.language_expressive,
                    d.developmental_milestones.language_receptive,
                    d.developmental_milestones.social_emotional,
                    d.developmental_milestones.cognitive,
                    d.developmental_milestones.self_care,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
        PediatricRule {
            id: "PED-018",
            category: "Immunization",
            description: "All immunizations up to date",
            concern_level: "low",
            evaluate: |d| d.immunization_status.immunizations_up_to_date == "yes",
        },
        PediatricRule {
            id: "PED-019",
            category: "Behavior",
            description: "All behavioral items rated Good or Excellent (4-5)",
            concern_level: "low",
            evaluate: |d| {
                let items = [
                    d.behavioral_assessment.sleep_quality,
                    d.behavioral_assessment.social_interaction,
                    d.behavioral_assessment.attention_span,
                    d.behavioral_assessment.anxiety_level,
                ];
                let answered: Vec<u8> = items.iter().filter_map(|x| *x).collect();
                !answered.is_empty() && answered.iter().all(|&v| v >= 4)
            },
        },
        PediatricRule {
            id: "PED-020",
            category: "Growth",
            description: "Growth trend is steady and appropriate",
            concern_level: "low",
            evaluate: |d| d.growth_development.growth_trend == "steady",
        },
    ]
}
